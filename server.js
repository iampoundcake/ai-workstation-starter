// POUNDCAKE OS — local Express backend
// Spawns `claude -p` for skill button clicks and streams output back via SSE.

import express from 'express';
import cors from 'cors';
import { spawn, execFile } from 'child_process';
import { promises as fs, createReadStream } from 'fs';
import { promisify } from 'util';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const execFileP = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VAULT_ROOT = path.join(os.homedir(), 'POUNDCAKE_OS');
const PB_ROOT = path.join(os.homedir(), 'Desktop', 'PB');
const SCHEDULED_TASKS_DIR = path.join(os.homedir(), '.claude', 'scheduled-tasks');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4321;

// ---------- Health ----------
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, vault: VAULT_ROOT });
});

// ---------- Run a skill / continue a chat via claude -p ----------
// Streams output as SSE. Optional sessionId param resumes prior session.
app.get('/api/run', async (req, res) => {
  const prompt = req.query.prompt;
  const sessionId = req.query.sessionId; // optional — resume mode
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'prompt is required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const send = (event, data) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  send('start', { prompt, resuming: !!sessionId });

  // Build claude args: stream-json output for parseable events.
  // bypassPermissions: dashboard-spawned claudes are non-interactive, so
  // any tool prompt would hang. Joe explicitly clicks each skill, so we
  // treat the click as the permission grant. Local-only app, single user.
  const args = [
    '-p',
    prompt,
    '--output-format',
    'stream-json',
    '--verbose',
    '--permission-mode',
    'bypassPermissions',
  ];
  if (sessionId) {
    args.push('--resume', sessionId);
  }

  const child = spawn('claude', args, {
    cwd: VAULT_ROOT,
    env: { ...process.env, PATH: process.env.PATH },
    // stdin: 'ignore' silences claude's "no stdin data received" warning.
    // We don't pipe input — every prompt comes via the `-p` argument.
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let stdoutBuffer = '';

  child.stdout.on('data', (chunk) => {
    stdoutBuffer += chunk.toString();
    const lines = stdoutBuffer.split('\n');
    stdoutBuffer = lines.pop() || ''; // hold incomplete line for next chunk

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      try {
        const evt = JSON.parse(trimmed);

        if (evt.type === 'system' && evt.subtype === 'init') {
          // Capture session id so the client can use it to resume.
          if (evt.session_id) send('session', { sessionId: evt.session_id });
        } else if (evt.type === 'assistant' && evt.message?.content) {
          // Forward assistant text blocks as they arrive.
          for (const block of evt.message.content) {
            if (block.type === 'text' && block.text) {
              send('stdout', { text: block.text });
            } else if (block.type === 'tool_use') {
              send('tool_use', { name: block.name, input: block.input });
            }
          }
        } else if (evt.type === 'user' && evt.message?.content) {
          // Tool results coming back as user messages — show concise hint.
          for (const block of evt.message.content) {
            if (block.type === 'tool_result') {
              // Don't dump full tool output to the chat; just signal it.
              // Frontend can display a subtle "tool ran" indicator if it wants.
            }
          }
        } else if (evt.type === 'result') {
          // Final summary — ignore. The text already streamed above.
        }
      } catch {
        // Not valid JSON — pass through raw so we don't lose info.
        send('stdout', { text: trimmed + '\n' });
      }
    }
  });

  child.stderr.on('data', (chunk) => {
    send('stderr', { text: chunk.toString() });
  });

  child.on('close', (code) => {
    send('end', { code });
    res.end();
  });

  child.on('error', (err) => {
    send('error', { message: err.message });
    res.end();
  });

  req.on('close', () => {
    child.kill();
  });
});

// ---------- Routine status ----------
app.get('/api/routines', async (_req, res) => {
  try {
    const entries = await fs.readdir(SCHEDULED_TASKS_DIR).catch(() => []);
    const routines = [];
    for (const entry of entries) {
      const skillPath = path.join(SCHEDULED_TASKS_DIR, entry, 'SKILL.md');
      try {
        const stat = await fs.stat(skillPath);
        routines.push({
          id: entry,
          lastModified: stat.mtime.toISOString(),
        });
      } catch {
        // skip
      }
    }
    res.json({ routines });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- Vault activity ----------
app.get('/api/vault-activity', async (_req, res) => {
  try {
    const dirs = [
      { label: 'raw', path: path.join(VAULT_ROOT, 'raw') },
      { label: 'wiki', path: path.join(VAULT_ROOT, 'wiki') },
      { label: 'output', path: path.join(VAULT_ROOT, 'output') },
      { label: 'personal-brand/posts', path: path.join(VAULT_ROOT, 'personal-brand', 'posts') },
      { label: 'personal-brand/queue', path: path.join(VAULT_ROOT, 'personal-brand', 'queue') },
      { label: 'sprinklr/exports', path: path.join(VAULT_ROOT, 'sprinklr', 'exports') },
    ];

    const items = [];
    for (const dir of dirs) {
      try {
        const files = await fs.readdir(dir.path);
        for (const file of files) {
          const full = path.join(dir.path, file);
          try {
            const stat = await fs.stat(full);
            if (stat.isFile()) {
              items.push({
                file,
                dir: dir.label,
                path: full,
                modified: stat.mtime.toISOString(),
              });
            }
          } catch {
            // skip
          }
        }
      } catch {
        // dir might not exist yet
      }
    }

    items.sort((a, b) => b.modified.localeCompare(a.modified));
    res.json({ items: items.slice(0, 12) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- Open a file in the system default app ----------
// Sidebar "On the bench" entries POST to this with a path. We validate that
// the path is inside one of the known vault/PB roots so the dashboard can't
// be coaxed into opening arbitrary files (the whole thing runs locally so
// the threat is mostly self-foot-shooting, but the guard is cheap).
const ALLOWED_ROOTS = [
  VAULT_ROOT,
  PB_ROOT,
  path.join(os.homedir(), 'Desktop', 'poundcake'),
  path.join(os.homedir(), 'Desktop', 'agent-chat-desktop'),
];

app.post('/api/open', async (req, res) => {
  const target = req.body?.path;
  if (!target || typeof target !== 'string') {
    return res.status(400).json({ error: 'path required' });
  }
  const resolved = path.resolve(target);
  const inside = ALLOWED_ROOTS.some((root) => resolved.startsWith(root + path.sep) || resolved === root);
  if (!inside) {
    return res.status(403).json({ error: 'path outside allowed roots' });
  }
  try {
    await fs.access(resolved);
  } catch {
    return res.status(404).json({ error: 'file not found' });
  }

  // macOS only for now. `open` hands the file to its registered default app.
  if (process.platform !== 'darwin') {
    return res.status(501).json({ error: 'open is macOS-only right now' });
  }
  spawn('open', [resolved], { detached: true, stdio: 'ignore' }).unref();
  res.json({ ok: true, path: resolved });
});

// ---------- LinkedIn queue count ----------
app.get('/api/queue-stats', async (_req, res) => {
  const counts = {};
  for (const sub of ['posts', 'queue', 'published']) {
    try {
      const files = await fs.readdir(path.join(VAULT_ROOT, 'personal-brand', sub));
      counts[sub] = files.filter((f) => f.endsWith('.md')).length;
    } catch {
      counts[sub] = 0;
    }
  }
  res.json({ linkedin: counts });
});

// ---------- Usage stats from local jsonl session logs ----------
// Reads ~/.claude/projects/*/*.jsonl (session conversation logs) and
// aggregates real token usage from message metadata. No API calls.
//
// Each assistant message carries a `message.usage` block with:
//   input_tokens, output_tokens, cache_creation_input_tokens, cache_read_input_tokens
//
// We can compute:
//   - Total tokens today / this week
//   - Most recent session's context size (sum of input + cache to most recent msg)
//   - Sessions and messages active today
//
// Plan-level limits (5-hour, weekly) live on Anthropic's servers. Run
// `/usage` in claude to see those — we don't replicate them here.

const PROJECTS_DIR = path.join(os.homedir(), '.claude', 'projects');
let usageCache = { data: null, ts: 0 };
const USAGE_CACHE_MS = 30_000;

async function listSessionFiles(sinceMs) {
  const projectDirs = await fs.readdir(PROJECTS_DIR).catch(() => []);
  const files = [];
  for (const dir of projectDirs) {
    const projPath = path.join(PROJECTS_DIR, dir);
    const entries = await fs.readdir(projPath).catch(() => []);
    for (const entry of entries) {
      if (!entry.endsWith('.jsonl')) continue;
      const full = path.join(projPath, entry);
      try {
        const stat = await fs.stat(full);
        if (stat.mtimeMs >= sinceMs) {
          files.push({ path: full, mtimeMs: stat.mtimeMs, sessionId: entry.replace('.jsonl', '') });
        }
      } catch {}
    }
  }
  return files.sort((a, b) => b.mtimeMs - a.mtimeMs);
}

// Read a jsonl file line-by-line and pull token-bearing messages. We track
// the model from the assistant message and the timestamp so callers can
// bucket by day.
async function parseSessionFile(filePath) {
  const messages = [];
  let model = null;
  let lastInputContext = 0; // running max of input + cache for context window estimate
  let lastTimestamp = null;

  const stream = createReadStream(filePath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  for await (const line of rl) {
    if (!line.trim()) continue;
    let evt;
    try {
      evt = JSON.parse(line);
    } catch {
      continue;
    }
    const usage = evt?.message?.usage;
    if (!usage) continue;
    if (evt.message?.model) model = evt.message.model;
    const ts = evt.timestamp ? new Date(evt.timestamp).getTime() : null;

    const input = usage.input_tokens || 0;
    const output = usage.output_tokens || 0;
    const cacheCreate = usage.cache_creation_input_tokens || 0;
    const cacheRead = usage.cache_read_input_tokens || 0;
    const contextSize = input + cacheCreate + cacheRead;

    messages.push({
      ts,
      input,
      output,
      cacheCreate,
      cacheRead,
      contextSize,
    });
    if (contextSize > lastInputContext) lastInputContext = contextSize;
    if (ts) lastTimestamp = ts;
  }

  return { messages, model, lastInputContext, lastTimestamp };
}

// Map a model id to its context window. Best-effort defaults.
function modelMaxContext(model) {
  if (!model) return 200_000;
  const m = model.toLowerCase();
  if (m.includes('1m') || m.includes('-1m-')) return 1_000_000;
  if (m.includes('opus-4-7')) return 200_000;
  if (m.includes('opus-4-6')) return 200_000;
  if (m.includes('sonnet-4-5')) return 1_000_000;
  if (m.includes('sonnet')) return 200_000;
  if (m.includes('haiku')) return 200_000;
  return 200_000;
}

function startOfDayMs(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

// ---------- Anthropic plan limits via OAuth token ----------
// Claude Code stores its OAuth credentials in the macOS Keychain under
// "Claude Code-credentials". We pull the access token and call the same
// /api/oauth/usage endpoint Claude Code's UI uses to populate its own
// "Plan usage" panel. Cached for 60s.

let planCache = { data: null, ts: 0, error: null };
const PLAN_CACHE_MS = 60_000;

async function getOAuthToken() {
  if (process.platform !== 'darwin') return null;
  try {
    const { stdout } = await execFileP('security', [
      'find-generic-password',
      '-s', 'Claude Code-credentials',
      '-a', os.userInfo().username,
      '-w',
    ]);
    const parsed = JSON.parse(stdout.trim());
    return parsed?.claudeAiOauth?.accessToken || null;
  } catch {
    return null;
  }
}

async function fetchPlanUsage() {
  const token = await getOAuthToken();
  if (!token) return { error: 'no-token' };
  try {
    const res = await fetch('https://api.anthropic.com/api/oauth/usage', {
      headers: {
        Authorization: `Bearer ${token}`,
        'anthropic-beta': 'oauth-2025-04-20',
      },
    });
    if (!res.ok) {
      return { error: `http-${res.status}` };
    }
    const data = await res.json();
    return { data };
  } catch (err) {
    return { error: err.message };
  }
}

app.get('/api/usage', async (_req, res) => {
  const now = Date.now();
  if (usageCache.data && now - usageCache.ts < USAGE_CACHE_MS) {
    return res.json(usageCache.data);
  }

  try {
    const weekAgoMs = now - 7 * 24 * 60 * 60 * 1000;
    const todayMs = startOfDayMs();

    const files = await listSessionFiles(weekAgoMs);

    let todayInput = 0, todayOutput = 0, todayCacheRead = 0, todayCacheCreate = 0;
    let weekInput = 0, weekOutput = 0, weekCacheRead = 0, weekCacheCreate = 0;
    let todayMsgCount = 0;
    let todaySessions = new Set();
    let weekSessions = new Set();

    let latest = null; // {sessionId, contextSize, model, mtimeMs}

    for (const file of files) {
      const parsed = await parseSessionFile(file.path);

      // Track latest session for context window display
      if (!latest || file.mtimeMs > latest.mtimeMs) {
        latest = {
          sessionId: file.sessionId,
          contextSize: parsed.lastInputContext,
          model: parsed.model,
          mtimeMs: file.mtimeMs,
        };
      }

      for (const msg of parsed.messages) {
        if (!msg.ts) continue;
        if (msg.ts >= weekAgoMs) {
          weekInput += msg.input;
          weekOutput += msg.output;
          weekCacheRead += msg.cacheRead;
          weekCacheCreate += msg.cacheCreate;
          weekSessions.add(file.sessionId);
        }
        if (msg.ts >= todayMs) {
          todayInput += msg.input;
          todayOutput += msg.output;
          todayCacheRead += msg.cacheRead;
          todayCacheCreate += msg.cacheCreate;
          todayMsgCount += 1;
          todaySessions.add(file.sessionId);
        }
      }
    }

    // Plan limits via /api/oauth/usage gave inaccurate values (CLI sub-quota
    // vs. plan-wide), so we leave that to Claude Code's `/usage`. Local-only
    // stats below.

    const data = {
      generatedAt: new Date().toISOString(),
      context: latest
        ? {
            sessionId: latest.sessionId,
            model: latest.model,
            used: latest.contextSize,
            max: modelMaxContext(latest.model),
            percent: Math.min(
              100,
              Math.round((latest.contextSize / modelMaxContext(latest.model)) * 100)
            ),
            ageMs: now - latest.mtimeMs,
          }
        : null,
      today: {
        input: todayInput,
        output: todayOutput,
        cacheRead: todayCacheRead,
        cacheCreate: todayCacheCreate,
        total: todayInput + todayOutput + todayCacheRead + todayCacheCreate,
        messages: todayMsgCount,
        sessions: todaySessions.size,
      },
      week: {
        input: weekInput,
        output: weekOutput,
        cacheRead: weekCacheRead,
        cacheCreate: weekCacheCreate,
        total: weekInput + weekOutput + weekCacheRead + weekCacheCreate,
        sessions: weekSessions.size,
      },
    };

    usageCache = { data, ts: now };
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🍰 POUNDCAKE OS server running on http://localhost:${PORT}`);
});

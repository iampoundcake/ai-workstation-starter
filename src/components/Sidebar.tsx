import { useEffect, useState } from 'react';
import type { Routine } from '../data/skills';
import { UsagePanel } from './UsagePanel';

interface VaultItem {
  file: string;
  dir: string;
  path: string;
  modified: string;
}
interface QueueStats {
  linkedin: { posts?: number; queue?: number; published?: number };
}

export function Sidebar({ routines }: { routines: Routine[] }) {
  const [activity, setActivity] = useState<VaultItem[]>([]);
  const [queueStats, setQueueStats] = useState<QueueStats | null>(null);

  useEffect(() => {
    const refresh = async () => {
      try {
        const [actRes, qRes] = await Promise.all([
          fetch('/api/vault-activity'),
          fetch('/api/queue-stats'),
        ]);
        if (actRes.ok) {
          const data = await actRes.json();
          setActivity(data.items || []);
        }
        if (qRes.ok) setQueueStats(await qRes.json());
      } catch (err) {
        console.error(err);
      }
    };
    refresh();
    const interval = setInterval(refresh, 30_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="hidden lg:flex w-60 xl:w-64 flex-col border-r border-sage-10 bg-ink px-5 py-6 overflow-y-auto flex-shrink-0">
      <Section label="Routines">
        <ul className="space-y-2">
          {routines.map((r) => (
            <li key={r.id} className="text-sm leading-snug">
              <div className="text-cream">{r.label}</div>
              <div className="label-mono mt-0.5">{r.schedule}</div>
            </li>
          ))}
        </ul>
      </Section>

      <Section label="Usage">
        <UsagePanel />
      </Section>

      {queueStats?.linkedin && (
        <Section label="LinkedIn">
          <div className="grid grid-cols-3 gap-3">
            <Stat label="drafts" value={queueStats.linkedin.posts ?? 0} />
            <Stat label="queued" value={queueStats.linkedin.queue ?? 0} />
            <Stat label="posted" value={queueStats.linkedin.published ?? 0} />
          </div>
        </Section>
      )}

      <Section label="On the bench">
        {activity.length === 0 ? (
          <p className="font-serif italic text-bookplate text-sm">
            Nothing on the bench yet.
          </p>
        ) : (
          <ul className="space-y-1">
            {activity.map((item) => (
              <li key={item.path}>
                <button
                  type="button"
                  onClick={() => openInDefaultApp(item.path)}
                  className="block w-full text-left text-sm leading-snug rounded px-2 py-1.5 -mx-2 hover:bg-shelf focus:outline-none focus-visible:ring-1 focus-visible:ring-sage transition-colors"
                  title={`Open ${item.path}`}
                >
                  <div className="text-cream font-mono text-[12px] truncate">
                    {item.file}
                  </div>
                  <div className="label-mono mt-0.5 flex items-baseline justify-between">
                    <span>{item.dir}</span>
                    <time
                      className="text-pencil"
                      dateTime={item.modified}
                      title={new Date(item.modified).toLocaleString()}
                    >
                      {relativeTime(item.modified)}
                    </time>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </aside>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-7">
      <h2 className="label-mono mb-3">{label}</h2>
      {children}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="font-display text-xl text-cream font-bold leading-none">
        {value}
      </div>
      <div className="label-mono mt-1.5">{label}</div>
    </div>
  );
}

async function openInDefaultApp(filePath: string): Promise<void> {
  try {
    const res = await fetch('/api/open', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: filePath }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.warn('open failed:', data.error || res.statusText);
    }
  } catch (err) {
    console.error(err);
  }
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

import { useEffect, useRef, useState } from 'react';
import { domains, routines, type Skill, type Domain } from './data/skills';
import { DOMAIN_SPAN, markerFor, withAlpha } from './data/tokens';
import { SkillCard } from './components/SkillCard';
import { ResultPanel } from './components/ResultPanel';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Waves } from './components/Waves';

export default function App() {
  const [activeSkill, setActiveSkill] = useState<Skill | null>(null);
  const [result, setResult] = useState<string>('');
  const [running, setRunning] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => () => eventSourceRef.current?.close(), []);

  const sendPrompt = (
    prompt: string,
    options: { fresh?: boolean; skill?: Skill } = {}
  ) => {
    eventSourceRef.current?.close();

    const fresh = options.fresh ?? false;
    const useSession = fresh ? null : sessionId;

    if (options.skill) setActiveSkill(options.skill);

    setResult((prev) => {
      const prefix = prev && !prev.endsWith('\n\n') ? prev + '\n\n' : prev;
      return prefix + `▸ ${prompt}\n\n`;
    });
    setRunning(true);

    if (fresh) setSessionId(null);

    const url = `/api/run?prompt=${encodeURIComponent(prompt)}${useSession ? `&sessionId=${encodeURIComponent(useSession)}` : ''}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.addEventListener('session', (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      if (data.sessionId) setSessionId(data.sessionId);
    });
    es.addEventListener('stdout', (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      setResult((prev) => prev + data.text);
    });
    es.addEventListener('tool_use', (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      setResult((prev) => prev + `\n  ↳ ${data.name}\n`);
    });
    es.addEventListener('stderr', (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      setResult((prev) => prev + `\n[stderr] ${data.text}`);
    });
    es.addEventListener('end', () => {
      setRunning(false);
      es.close();
    });
    es.addEventListener('error', () => {
      setRunning(false);
      es.close();
    });
  };

  const handleSkillRun = (skill: Skill, prompt: string) => {
    setResult('');
    sendPrompt(prompt, { fresh: true, skill });
  };

  const handleFollowUp = (message: string) => {
    if (!sessionId) {
      setResult('');
      setActiveSkill(null);
      sendPrompt(message, { fresh: true });
    } else {
      sendPrompt(message);
    }
  };

  const handleStop = () => {
    eventSourceRef.current?.close();
    setRunning(false);
    setResult((prev) => prev + `\n\n■ stopped`);
  };

  const handleClear = () => {
    eventSourceRef.current?.close();
    setResult('');
    setActiveSkill(null);
    setSessionId(null);
    setRunning(false);
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <Waves />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header
          onCapture={(prompt) => {
            setResult('');
            sendPrompt(prompt, { fresh: true });
          }}
          onIndex={() => {
            setResult('');
            sendPrompt('/aiworkstation index', { fresh: true });
          }}
        />

        <div className="flex flex-1 overflow-hidden">
          <Sidebar routines={routines} />

          <main className="flex-1 flex overflow-hidden">
            <section className="flex-1 overflow-y-auto px-6 lg:px-8 py-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-12 xl:grid-flow-row-dense gap-4 lg:gap-5">
                {domains.map((domain) => (
                  <DomainTile
                    key={domain.id}
                    domain={domain}
                    onRun={handleSkillRun}
                  />
                ))}
              </div>
            </section>

            <ResultPanel
              skill={activeSkill}
              result={result}
              running={running}
              sessionActive={!!sessionId}
              onSend={handleFollowUp}
              onStop={handleStop}
              onClear={handleClear}
            />
          </main>
        </div>
      </div>
    </div>
  );
}

const xlSpanClass: Record<number, string> = {
  4: 'xl:col-span-4',
  8: 'xl:col-span-8',
};

function DomainTile({
  domain,
  onRun,
}: {
  domain: Domain;
  onRun: (s: Skill, p: string) => void;
}) {
  const markerColor = markerFor(domain.id);
  const span = DOMAIN_SPAN[domain.id] || { xl: 4, featured: false };
  const featured = span.featured;

  return (
    <article
      className={`workshop-card overflow-hidden ${xlSpanClass[span.xl] || 'xl:col-span-4'}`}
      style={{
        // Marker shows as a low-opacity full border + full-strength title rule.
        // Audit flagged the previous 2px borderLeft as a side-stripe absolute ban.
        borderColor: withAlpha(markerColor, 0.18),
      }}
    >
      <header
        className="px-4 py-3 flex items-baseline gap-3"
        style={{
          borderBottom: `1px solid ${withAlpha(markerColor, 0.25)}`,
        }}
      >
        <h3
          className={`font-display ${featured ? 'text-xl' : 'text-lg'} text-cream font-bold leading-none`}
        >
          {domain.name}
        </h3>
        <span className="label-mono ml-auto" style={{ color: markerColor }}>
          {String(domain.skills.length).padStart(2, '0')}
          <span className="sr-only"> skills in {domain.name}</span>
        </span>
      </header>
      <div
        className={`p-3 ${
          featured ? 'grid grid-cols-1 lg:grid-cols-2 gap-2' : 'space-y-2'
        }`}
      >
        {domain.skills.map((skill) => (
          <SkillCard
            key={skill.id}
            skill={skill}
            onRun={(prompt) => onRun(skill, prompt)}
            markerColor={markerColor}
          />
        ))}
      </div>
    </article>
  );
}

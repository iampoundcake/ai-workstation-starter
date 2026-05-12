import { useEffect, useState } from 'react';

interface UsageData {
  today: {
    input: number;
    output: number;
    cacheRead: number;
    cacheCreate: number;
    total: number;
    messages: number;
    sessions: number;
  };
  week: {
    input: number;
    output: number;
    total: number;
    sessions: number;
  };
}

export function UsagePanel() {
  const [usage, setUsage] = useState<UsageData | null>(null);

  useEffect(() => {
    const refresh = async () => {
      try {
        const res = await fetch('/api/usage');
        if (res.ok) setUsage(await res.json());
      } catch (err) {
        console.error(err);
      }
    };
    refresh();
    const interval = setInterval(refresh, 60_000);
    return () => clearInterval(interval);
  }, []);

  if (!usage) {
    return (
      <p className="font-serif italic text-bookplate text-sm">
        Loading usage…
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="label-mono mb-2">Today</p>
        <ul className="space-y-1.5 text-sm">
          <Row
            label="tokens"
            value={formatTokens(usage.today.total)}
            sub={`${formatTokens(usage.today.cacheRead)} cached`}
          />
          <Row label="sessions" value={String(usage.today.sessions)} />
          <Row label="messages" value={String(usage.today.messages)} />
        </ul>
      </div>

      <div>
        <p className="label-mono mb-2">Past 7 days</p>
        <ul className="space-y-1.5 text-sm">
          <Row label="tokens" value={formatTokens(usage.week.total)} />
          <Row label="sessions" value={String(usage.week.sessions)} />
        </ul>
      </div>

      <p className="font-serif italic text-bookplate text-xs leading-snug pt-1 border-t border-sage-10">
        Plan-level limits (5h, weekly) live in Claude Code. Run{' '}
        <code className="font-mono text-pencil text-[11px]">/usage</code> there
        for the source of truth.
      </p>
    </div>
  );
}

function Row({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <li className="flex items-baseline justify-between gap-2 leading-tight">
      <span className="text-pencil text-[12px]">{label}</span>
      <span className="font-mono text-cream tabular-nums text-[12px] flex items-baseline gap-2">
        {sub && <span className="text-pencil/70 text-[11px]">{sub}</span>}
        {value}
      </span>
    </li>
  );
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

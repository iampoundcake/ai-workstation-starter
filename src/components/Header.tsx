import { useState } from 'react';
import { COLOR } from '../data/tokens';
import { config } from '../config';

interface Props {
  onCapture: (prompt: string) => void;
  onIndex: () => void;
}

export function Header({ onCapture, onIndex }: Props) {
  const [content, setContent] = useState('');

  const submit = () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    onCapture(`/raw ${trimmed}`);
    setContent('');
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    }
  };

  return (
    <header className="border-b border-sage-10 bg-ink">
      <div className="px-6 lg:px-8 py-3 flex items-center gap-4 lg:gap-6">
        <h1 className="font-display text-xl text-cream font-bold leading-none truncate flex-none">
          {config.brand}
        </h1>

        <div className="flex-1 flex items-center gap-2 max-w-2xl">
          <label htmlFor="topbar-capture" className="sr-only">
            Drop a thought into the vault inbox
          </label>
          <input
            id="topbar-capture"
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKey}
            placeholder="drop a thought…"
            className="flex-1 bg-transparent border border-cream/30 rounded px-3 py-1.5 text-sm text-cream placeholder:text-bookplate focus:outline-none focus:border-cream font-mono"
          />
          <button
            onClick={submit}
            disabled={!content.trim()}
            className="label-mono px-3 py-1.5 rounded transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110"
            style={{
              backgroundColor: COLOR.brass,
              color: COLOR.ink,
              border: `1px solid ${COLOR.brass}`,
            }}
          >
            file
          </button>
        </div>

        <button
          onClick={onIndex}
          className="ml-auto label-mono px-3 py-1.5 rounded border border-sage-30 text-cream hover:bg-sage-10 transition-all flex-none"
        >
          index raw
        </button>
      </div>

      <div className="px-6 lg:px-8 pb-2 flex items-baseline gap-4 label-mono text-pencil">
        <span className="flex items-baseline gap-2 min-w-0">
          <span className="flex-none">vault:</span>
          <code className="font-mono normal-case tracking-normal text-cream/80 text-xs lowercase truncate">
            {config.vaultPath}
          </code>
        </span>
        <span className="flex items-baseline gap-2">
          <span>theme:</span>
          <code className="font-mono normal-case tracking-normal text-cream/80 text-xs lowercase">
            {config.theme}
          </code>
        </span>
      </div>
    </header>
  );
}

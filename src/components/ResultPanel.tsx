import { useEffect, useRef, useState } from 'react';
import type { Skill } from '../data/skills';
import { COLOR } from '../data/tokens';

interface Props {
  skill: Skill | null;
  result: string;
  running: boolean;
  sessionActive: boolean;
  onSend: (message: string) => void;
  onStop: () => void;
  onClear: () => void;
}

export function ResultPanel({
  skill,
  result,
  running,
  sessionActive,
  onSend,
  onStop,
  onClear,
}: Props) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Tracks whether the user is currently pinned to the bottom of the
  // transcript. New chunks only force a scroll when this is true, so a
  // user reading earlier output isn't yanked back down.
  const pinnedToBottomRef = useRef(true);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (pinnedToBottomRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [result]);

  // Track scroll position. Within 50px of the bottom counts as "pinned".
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      pinnedToBottomRef.current = distanceFromBottom < 50;
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  // Auto-grow textarea up to a max height.
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  }, [input]);

  const submit = () => {
    const trimmed = input.trim();
    if (!trimmed || running) return;
    onSend(trimmed);
    setInput('');
    pinnedToBottomRef.current = true;
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <aside
      className="hidden xl:flex w-[400px] 2xl:w-[460px] border-l border-sage-10 bg-ink flex-col flex-shrink-0"
      aria-label="Claude output"
    >
      <div className="px-5 py-3.5 border-b border-sage-10 flex items-baseline gap-3">
        <h2 className="label-mono">Output</h2>
        {skill && (
          <code className="font-mono text-xs text-sage truncate flex-1">
            {skill.command}
          </code>
        )}

        {/* Status announcer for screen readers. Visible cue is the cursor. */}
        <span className="sr-only" aria-live="polite" aria-atomic="true">
          {running
            ? 'Claude is working'
            : sessionActive
              ? 'Claude finished. Ready for follow-up.'
              : 'Idle'}
        </span>

        <div className="ml-auto flex gap-3">
          {running ? (
            <button
              onClick={onStop}
              className="label-mono px-2 py-1 hover:brightness-110 transition-colors"
              style={{ color: COLOR.terracotta }}
            >
              stop
            </button>
          ) : (
            (result || sessionActive) && (
              <button
                onClick={onClear}
                className="label-mono px-2 py-1 hover:text-cream transition-colors"
              >
                clear
              </button>
            )
          )}
        </div>
      </div>

      {/* Output + Input wrapper. Output sizes to content; input sits right
          below it and drifts down as the conversation grows. Once output
          fills the available space, it scrolls internally. */}
      <div className="flex-1 min-h-0 flex flex-col">
        <div
          ref={scrollRef}
          className="overflow-y-auto px-6 pt-5 pb-2 min-h-0"
          aria-live="polite"
          aria-atomic="false"
          aria-relevant="additions"
        >
          {!result ? (
            <div className="text-center py-4">
              <p className="font-serif italic text-bookplate text-base leading-snug">
                A workshop is built one bench at a time.
              </p>
              <p className="label-mono mt-4">
                Click a skill or just start typing below
              </p>
            </div>
          ) : (
            <pre className="font-mono text-[12px] leading-relaxed text-cream whitespace-pre-wrap break-words">
              {result}
              {running && (
                <span
                  className="inline-block w-1.5 h-3.5 ml-1 align-middle animate-pulse"
                  style={{ backgroundColor: COLOR.sage }}
                  aria-hidden="true"
                />
              )}
            </pre>
          )}
        </div>

        <div className="flex-none border-t border-sage-10 p-3 bg-ink">
          <div className="flex items-end gap-2">
            <label htmlFor="chat-input" className="sr-only">
              Message Claude
            </label>
            <textarea
              id="chat-input"
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={
                running
                  ? 'Claude is working…'
                  : sessionActive
                    ? 'Reply, ask a follow-up, redirect…'
                    : 'Ask Claude anything…'
              }
              disabled={running}
              rows={1}
              className="flex-1 bg-transparent border border-cream/40 rounded px-3 py-2 text-sm text-cream placeholder:text-bookplate focus:outline-none focus:border-cream font-mono resize-none disabled:opacity-50"
            />
            <button
              onClick={submit}
              disabled={running || !input.trim()}
              className="label-mono px-4 py-2.5 rounded transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 min-h-[44px]"
              style={{
                backgroundColor: COLOR.terracotta,
                color: COLOR.ink,
                border: `1px solid ${COLOR.terracotta}`,
              }}
            >
              send
            </button>
          </div>
          <p className="label-mono mt-2 text-pencil/80">
            {sessionActive
              ? 'enter to send · shift+enter newline · clear to start over'
              : 'enter to send · shift+enter newline'}
          </p>
        </div>
      </div>
    </aside>
  );
}

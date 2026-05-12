import { useId, useState } from 'react';
import type { Skill } from '../data/skills';
import { COLOR } from '../data/tokens';

interface Props {
  skill: Skill;
  onRun: (prompt: string) => void;
  markerColor: string;
}

export function SkillCard({ skill, onRun, markerColor }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [argValues, setArgValues] = useState<Record<string, string>>({});
  const [freeform, setFreeform] = useState('');
  const idPrefix = useId();

  const needsInput = (skill.args && skill.args.length > 0) || skill.freeform;

  const handleClick = () => {
    if (!needsInput) {
      onRun(skill.command);
      return;
    }
    if (!expanded) {
      setExpanded(true);
      return;
    }
    const argsString = (skill.args || [])
      .map((a) => argValues[a.name]?.trim() || '')
      .filter(Boolean)
      .join(' ');
    const fullPrompt = [skill.command, argsString, freeform.trim()]
      .filter(Boolean)
      .join(' ');
    onRun(fullPrompt);
    setExpanded(false);
  };

  const requiredMissing = (skill.args || []).some(
    (a) => a.required && !argValues[a.name]?.trim()
  );

  return (
    <div className="rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={handleClick}
        className="skill-button group"
        aria-expanded={needsInput ? expanded : undefined}
        aria-label={
          needsInput && !expanded
            ? `${skill.label}. Configure and run.`
            : undefined
        }
      >
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-body text-cream text-[14px] leading-tight">
            {skill.label}
          </span>
          {needsInput && !expanded && (
            <span
              className="label-mono opacity-0 group-hover:opacity-100 transition-opacity"
              aria-hidden="true"
            >
              configure
            </span>
          )}
          {expanded && (
            <span
              className="label-mono"
              style={{ color: markerColor }}
              aria-hidden="true"
            >
              ready
            </span>
          )}
        </div>
        <p className="text-pencil text-[12px] leading-snug mt-0.5">
          {skill.description}
        </p>
        <code className="block label-mono normal-case font-mono mt-1.5 text-[10px] tracking-normal">
          {skill.command}
        </code>
      </button>

      {expanded && (
        <div
          className="bg-ink border border-t-0 border-sage-10 rounded-b-lg px-3 pt-3 pb-3 space-y-3 -mt-1"
          role="region"
          aria-label={`Configure ${skill.label}`}
        >
          {skill.args?.map((arg) => {
            const inputId = `${idPrefix}-${arg.name}`;
            return (
              <div key={arg.name}>
                <label
                  htmlFor={inputId}
                  className="label-mono block mb-1.5"
                >
                  {arg.label}
                  {arg.required && (
                    <span style={{ color: markerColor }} aria-label="required">
                      {' *'}
                    </span>
                  )}
                </label>
                <input
                  id={inputId}
                  type="text"
                  value={argValues[arg.name] || ''}
                  onChange={(e) =>
                    setArgValues((prev) => ({
                      ...prev,
                      [arg.name]: e.target.value,
                    }))
                  }
                  placeholder={arg.placeholder}
                  required={arg.required}
                  className="w-full bg-ink border border-sage-10 rounded px-2.5 py-2 text-sm text-bookplate placeholder:text-bookplate/70 focus:outline-none focus:border-sage focus:text-cream font-mono"
                />
              </div>
            );
          })}

          {skill.freeform && (
            <div>
              <label
                htmlFor={`${idPrefix}-notes`}
                className="label-mono block mb-1.5"
              >
                Notes
              </label>
              <textarea
                id={`${idPrefix}-notes`}
                value={freeform}
                onChange={(e) => setFreeform(e.target.value)}
                rows={3}
                placeholder="Any extra context"
                className="w-full bg-ink border border-sage-10 rounded px-2.5 py-2 text-sm text-bookplate placeholder:text-bookplate/70 focus:outline-none focus:border-sage focus:text-cream font-mono resize-y"
              />
            </div>
          )}

          <div className="flex items-baseline gap-2 pt-1">
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="label-mono px-3 py-2 rounded hover:text-cream hover:bg-shelf transition-colors min-h-[36px]"
            >
              cancel
            </button>
            <button
              type="button"
              onClick={handleClick}
              disabled={requiredMissing}
              className="label-mono ml-auto px-4 py-2 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-all min-h-[36px] hover:brightness-110"
              style={{
                backgroundColor: requiredMissing ? 'transparent' : markerColor,
                color: requiredMissing ? markerColor : COLOR.ink,
                border: `1px solid ${markerColor}`,
              }}
            >
              run skill
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

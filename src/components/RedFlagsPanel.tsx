/**
 * RedFlagsPanel
 * -------------
 * Educational analysis under / beside the email. Color-coded cards expand when
 * the matching highlight is selected in the simulated message.
 */

import type { RedFlag } from '../types/scenario';

interface RedFlagsPanelProps {
  redFlags: RedFlag[];
  activeFlagId: string | null;
  onSelectFlag: (flagId: string) => void;
}

export function RedFlagsPanel({
  redFlags,
  activeFlagId,
  onSelectFlag,
}: RedFlagsPanelProps) {
  return (
    <aside className="flags-panel" aria-label="Red flag analysis">
      <h2>Red Flags You Should Notice</h2>
      <p className="flags-intro">
        Click a highlighted phrase in the email — or a card below — to see why it is a warning sign.
      </p>

      <ul className="flags-list">
        {redFlags.map((flag) => {
          const isActive = activeFlagId === flag.id;

          return (
            <li key={flag.id}>
              <button
                type="button"
                className={`flag-card flag-${flag.color}${isActive ? ' is-active' : ''}`}
                onClick={() => onSelectFlag(flag.id)}
                aria-expanded={isActive}
              >
                <span className="flag-card-title">{flag.title}</span>
                <span className={`flag-card-body${isActive ? ' is-open' : ''}`}>
                  {flag.explanation}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="legit-tip">
        <h3>How a legitimate organization usually communicates</h3>
        <p>
          They address you by name, avoid panic deadlines in unexpected emails, never ask for
          passwords or full SSNs through a surprise link, and point you to official channels you
          open yourself — not buttons buried in an unsolicited message.
        </p>
      </div>
    </aside>
  );
}

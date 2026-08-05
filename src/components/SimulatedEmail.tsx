/**
 * SimulatedEmail
 * --------------
 * Professionally formatted fake inbox message. CTA / links are intentionally
 * non-functional and only teach that unexpected buttons are dangerous.
 */

import type { MouseEvent } from 'react';
import type { ScamScenario } from '../types/scenario';
import { EmailHighlight } from './EmailHighlight';

interface SimulatedEmailProps {
  scenario: ScamScenario;
  activeFlagId: string | null;
  onSelectFlag: (flagId: string) => void;
}

function flagColorClass(scenario: ScamScenario, flagId: string): string {
  const flag = scenario.redFlags.find((item) => item.id === flagId);
  return flag ? `flag-${flag.color}` : 'flag-slate';
}

export function SimulatedEmail({
  scenario,
  activeFlagId,
  onSelectFlag,
}: SimulatedEmailProps) {
  const { email } = scenario;

  function handleDisabledAction(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    onSelectFlag('link-danger');
  }

  return (
    <article className="email-card">
      <div className="email-card-chrome">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
        <span className="email-card-chrome-label">Training inbox preview</span>
      </div>

      <header className="email-meta">
        <h2 className="email-subject">{email.subject}</h2>

        <dl className="email-headers">
          <div>
            <dt>From</dt>
            <dd>
              <strong>{email.fromName}</strong>{' '}
              <button
                type="button"
                className={`email-highlight flag-slate inline${
                  activeFlagId === 'sender' ? ' is-active' : ''
                }`}
                onClick={() => onSelectFlag('sender')}
                aria-pressed={activeFlagId === 'sender'}
              >
                &lt;{email.fromAddress}&gt;
              </button>
            </dd>
          </div>
          <div>
            <dt>To</dt>
            <dd>{email.toLabel}</dd>
          </div>
          <div>
            <dt>Date</dt>
            <dd>{email.dateLabel}</dd>
          </div>
        </dl>
      </header>

      <div className="email-body">
        {email.body.map((segment, index) => {
          if (!segment.redFlagId) {
            return <span key={index} className="email-plain">{segment.text}</span>;
          }

          return (
            <EmailHighlight
              key={index}
              text={segment.text}
              colorClass={flagColorClass(scenario, segment.redFlagId)}
              isActive={activeFlagId === segment.redFlagId}
              onSelect={() => onSelectFlag(segment.redFlagId!)}
            />
          );
        })}
      </div>

      <div className="email-cta-wrap">
        <button
          type="button"
          className="email-cta"
          onClick={handleDisabledAction}
          aria-describedby="disabled-link-note"
        >
          {email.ctaLabel}
        </button>
        <p id="disabled-link-note" className="fake-url-hint">
          Shown destination (disabled): {email.fakeUrlHint}
        </p>
        <p className="disabled-note">
          Buttons and links in this simulation do not navigate anywhere.
        </p>
      </div>
    </article>
  );
}

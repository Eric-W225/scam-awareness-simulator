/**
 * HomePage
 * --------
 * Landing screen with consent-email step, title, and scenario cards.
 */

import { SCENARIOS } from '../data/scenarios';
import { ScenarioCard } from './ScenarioCard';
import { ConsentEmailPanel } from './ConsentEmailPanel';

interface HomePageProps {
  onSelectScenario: (scenarioId: string) => void;
}

export function HomePage({ onSelectScenario }: HomePageProps) {
  return (
    <main className="home page-enter">
      <div className="home-backdrop" aria-hidden="true" />

      <header className="home-header">
        <p className="home-eyebrow">Security training · Safe sandbox</p>
        <h1 className="home-title">Scam Awareness Simulator</h1>
        <p className="home-description">
          Practice identifying phishing attempts in a safe environment. These emails are
          fictional training examples — no credentials are collected.
        </p>
      </header>

      <div className="home-consent-wrap">
        <ConsentEmailPanel />
      </div>

      <p className="home-step-label">Step 2 · After they agree &amp; allowlist you</p>

      <section className="scenario-grid" aria-label="Choose a scam scenario">
        {SCENARIOS.map((scenario) => (
          <ScenarioCard
            key={scenario.id}
            scenario={scenario}
            onSelect={() => onSelectScenario(scenario.id)}
          />
        ))}
      </section>

      <p className="home-footnote">
        Tip: Send the consent email first. After they reply I AGREE and mark Not spam,
        open a scenario and use <strong>Send to Email</strong> for the practice scam.
      </p>
    </main>
  );
}

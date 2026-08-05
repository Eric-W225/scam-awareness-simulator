/**
 * ScenarioCard
 * ------------
 * Large selectable card on the homepage. Reused for every scenario in SCENARIOS.
 */

import type { ScamScenario } from '../types/scenario';

interface ScenarioCardProps {
  scenario: ScamScenario;
  onSelect: () => void;
}

export function ScenarioCard({ scenario, onSelect }: ScenarioCardProps) {
  return (
    <button
      type="button"
      className={`scenario-card accent-${scenario.accent}`}
      onClick={onSelect}
    >
      <span className="scenario-card-label">Scenario</span>
      <span className="scenario-card-title">{scenario.title}</span>
      <span className="scenario-card-copy">{scenario.shortDescription}</span>
      <span className="scenario-card-cta">Open simulation →</span>
    </button>
  );
}

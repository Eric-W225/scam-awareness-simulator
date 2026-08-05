/**
 * ScenarioView
 * ------------
 * Full training screen: simulation banner, email preview, and red-flag panel.
 * Includes Send to Email for authorized training delivery of this scenario.
 */

import { useState } from 'react';
import type { ScamScenario } from '../types/scenario';
import { SimulatedEmail } from './SimulatedEmail';
import { RedFlagsPanel } from './RedFlagsPanel';
import { SendToEmailPanel } from './SendToEmailPanel';

interface ScenarioViewProps {
  scenario: ScamScenario;
  onReset: () => void;
}

export function ScenarioView({ scenario, onReset }: ScenarioViewProps) {
  const [activeFlagId, setActiveFlagId] = useState<string | null>(null);

  return (
    <main className="scenario-view page-enter">
      <header className="scenario-topbar">
        <div>
          <p className="sim-badge">Simulation mode</p>
          <h1>{scenario.title}</h1>
          <p className="scenario-topbar-copy">
            This is a fictional training email. Links and buttons do not leave this page.
          </p>
        </div>
        <button type="button" className="reset-btn" onClick={onReset}>
          ← Choose another scenario
        </button>
      </header>

      <SendToEmailPanel scenario={scenario} />

      <div className="scenario-layout">
        <SimulatedEmail
          scenario={scenario}
          activeFlagId={activeFlagId}
          onSelectFlag={setActiveFlagId}
        />
        <RedFlagsPanel
          redFlags={scenario.redFlags}
          activeFlagId={activeFlagId}
          onSelectFlag={setActiveFlagId}
        />
      </div>
    </main>
  );
}

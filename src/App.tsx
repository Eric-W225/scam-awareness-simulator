/**
 * App shell
 * ---------
 * Routes between:
 *  1) HomePage — scenario selection
 *  2) ScenarioView — simulated email + red-flag education
 *
 * Supports deep links: ?scenario=<id>&entry=email
 * (used when a training email’s CTA opens this app)
 */

import { useEffect, useState } from 'react';
import { HomePage } from './components/HomePage';
import { ScenarioView } from './components/ScenarioView';
import { getScenarioById } from './data/scenarios';

function scenarioIdFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('scenario');
  return id && getScenarioById(id) ? id : null;
}

export default function App() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(
    () => scenarioIdFromUrl(),
  );

  useEffect(() => {
    const onPopState = () => {
      setSelectedScenarioId(scenarioIdFromUrl());
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  function selectScenario(scenarioId: string) {
    setSelectedScenarioId(scenarioId);
    const url = new URL(window.location.href);
    url.searchParams.set('scenario', scenarioId);
    url.searchParams.delete('entry');
    window.history.replaceState({}, '', url);
  }

  function resetToHome() {
    setSelectedScenarioId(null);
    const url = new URL(window.location.href);
    url.search = '';
    window.history.replaceState({}, '', url);
  }

  const selectedScenario = selectedScenarioId
    ? getScenarioById(selectedScenarioId)
    : undefined;

  return (
    <div className="app-shell">
      {selectedScenario ? (
        <ScenarioView
          key={selectedScenario.id}
          scenario={selectedScenario}
          onReset={resetToHome}
        />
      ) : (
        <HomePage onSelectScenario={selectScenario} />
      )}
    </div>
  );
}

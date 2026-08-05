/**
 * EmailHighlight
 * --------------
 * Interactive span inside the email body. Clicking reveals the matching red-flag
 * explanation in the analysis panel.
 */

interface EmailHighlightProps {
  text: string;
  colorClass: string;
  isActive: boolean;
  onSelect: () => void;
}

export function EmailHighlight({
  text,
  colorClass,
  isActive,
  onSelect,
}: EmailHighlightProps) {
  return (
    <button
      type="button"
      className={`email-highlight ${colorClass}${isActive ? ' is-active' : ''}`}
      onClick={onSelect}
      aria-pressed={isActive}
    >
      {text}
    </button>
  );
}

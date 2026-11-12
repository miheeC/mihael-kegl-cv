import { bugs } from '../data/bugs.js';
import { BugIcon, CheckIcon, ContrastIcon, RadarIcon, SoundIcon } from './icons.jsx';

export default function Hud({
  phase,
  caught,
  contrast,
  muted,
  busy,
  onHint,
  onChipHint,
  onChipCatch,
  onChipFocus,
  onOpenTicket,
  onContrast,
  onMuted,
  onSummary,
}) {
  const playing = phase !== 'intro';
  const heisenOut = caught.length >= bugs.length - 1;

  return (
    <>
      <header className={`topbar${playing ? ' playing' : ''}`}>
        <div className="brand">
          <span className="brand-mark">
            <BugIcon color="#ff6b6b" size={20} />
          </span>
          <span className="brand-text">
            <strong>Release Blocker</strong>
            <span>Mihael Kegl · QA Team Lead</span>
          </span>
        </div>
        <div className="tools">
          {playing && (
            <>
              <span className="progress" aria-label={`${caught.length} of ${bugs.length} bugs filed`}>
                <b>{caught.length}</b> / {bugs.length} filed
              </span>
              {phase === 'play' && (
                <button className="tool" onClick={onHint} disabled={busy} aria-label="Hint: ping a bug">
                  <RadarIcon /> <span>Hint</span>
                </button>
              )}
              {phase === 'play' && (
                <button className={`tool${contrast ? ' on' : ''}`} onClick={onContrast} aria-pressed={contrast} disabled={busy} aria-label="Contrast check">
                  <ContrastIcon /> <span>Contrast check</span>
                </button>
              )}
              <button className="tool icon" onClick={onMuted} aria-pressed={muted} aria-label={muted ? 'Turn sound on' : 'Turn sound off'}>
                <SoundIcon off={muted} />
              </button>
              {onSummary && (
                <button className="tool" onClick={onSummary}>
                  Summary
                </button>
              )}
            </>
          )}
          <a className="tool link" href="#cv" aria-label="Read the CV">
            {playing && <span>Read the</span>}CV
          </a>
        </div>
      </header>

      {playing && (
        <nav className="tickets" aria-label="Bug tickets">
          <ol>
            {bugs.map((bug) => {
              const done = caught.includes(bug.id);
              const locked = bug.id === 'heisen' && !heisenOut;
              const label = done
                ? `${bug.name}: filed. Open ticket ${bug.ticket}.`
                : locked
                  ? 'Unknown bug. It shows up after the other seven are filed.'
                  : `${bug.name}: still loose. Press Enter to try to catch it.`;
              return (
                <li key={bug.id}>
                  <button
                    className={`chip${done ? ' done' : ''}${locked ? ' locked' : ''}`}
                    style={{ '--bug': bug.color }}
                    aria-label={label}
                    disabled={busy}
                    onClick={(e) => {
                      if (done) onOpenTicket(bug.id);
                      else if (e.detail === 0) onChipCatch(bug.id); // keyboard activation
                      else onChipHint(bug.id);
                    }}
                    onFocus={(e) => {
                      if (!done && e.target.matches(':focus-visible')) onChipFocus(bug.id);
                    }}
                    onBlur={() => onChipFocus(null)}
                  >
                    <span className="chip-icon">{done ? <CheckIcon /> : <BugIcon color={bug.color} size={16} muted />}</span>
                    <span className="chip-name">{locked ? '???' : bug.name}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      )}
    </>
  );
}

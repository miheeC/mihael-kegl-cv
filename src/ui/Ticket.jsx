import { useEffect, useRef } from 'react';
import SectionContent from './SectionContent.jsx';
import { ArrowIcon, BugIcon, CheckIcon } from './icons.jsx';

/** Keeps Tab inside the dialog, closes on Escape, and hands focus back afterwards. */
export function useDialog(onClose) {
  const ref = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const node = ref.current;
    const previous = document.activeElement;
    node.querySelector('[data-autofocus]')?.focus({ preventScroll: true });
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = [...node.querySelectorAll('a[href], button:not([disabled])')];
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (previous && document.contains(previous)) previous.focus({ preventScroll: true });
    };
  }, []);

  return ref;
}

export default function Ticket({ bug, remaining, done, onClose }) {
  const ref = useDialog(onClose);
  const last = remaining === 0 && !done;
  const cta = done ? 'Close ticket' : last ? 'Ship the release' : `Back to the hunt · ${remaining} left`;

  return (
    <div className="scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <article className="ticket" role="dialog" aria-modal="true" aria-labelledby="ticket-title" ref={ref} style={{ '--bug': bug.color }}>
        <header className="ticket-head">
          <div className="ticket-id">
            <span>{bug.ticket}</span>
            <span className="pill">
              <CheckIcon /> Filed
            </span>
          </div>
          <h2 id="ticket-title">
            <BugIcon color={bug.color} size={30} /> {bug.name}
          </h2>
          <dl className="ticket-meta">
            <div>
              <dt>Type</dt>
              <dd>{bug.kind}</dd>
            </div>
            <div>
              <dt>Severity</dt>
              <dd>{bug.severity}</dd>
            </div>
            <div>
              <dt>Reveals</dt>
              <dd>{bug.sectionTitle}</dd>
            </div>
          </dl>
        </header>

        <div className="ticket-body">
          <section className="ticket-notes">
            <p>
              <span className="label">Observed</span> {bug.behavior}
            </p>
            <p>
              <span className="label">Why it matters</span> {bug.lesson}
            </p>
          </section>
          <section className="reveal" aria-label={bug.sectionTitle}>
            <p className="reveal-title">{bug.sectionTitle}</p>
            <SectionContent section={bug.section} />
          </section>
        </div>

        <footer className="ticket-foot">
          <a className="btn ghost" href="#cv">
            Full CV
          </a>
          <button className="btn primary" data-autofocus onClick={onClose}>
            {cta} <ArrowIcon />
          </button>
        </footer>
      </article>
    </div>
  );
}

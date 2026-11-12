import { cv } from '../data/cv.js';
import { useDialog } from './Ticket.jsx';
import { ArrowIcon, CloseIcon } from './icons.jsx';

const clock = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export default function Finale({ seconds, onClose }) {
  const ref = useDialog(onClose);
  return (
    <div className="scrim soft" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <section className="finale" role="dialog" aria-modal="true" aria-labelledby="finale-title" ref={ref}>
        <button className="close" onClick={onClose} aria-label="Close summary and look at the desk">
          <CloseIcon />
        </button>
        <p className="eyebrow">
          <span className="dot ok" /> Release v8.4 · Shipped
        </p>
        <h2 id="finale-title">Zero open blockers. You just read Mihael’s whole CV.</h2>
        <p className="lede">
          Eight bugs filed in {clock(seconds)}. If your team needs someone who hunts like this for a living, Mihael is
          open to work.
        </p>
        <div className="finale-actions">
          <a className="btn primary" data-autofocus href="#cv">
            Read the full CV <ArrowIcon />
          </a>
          <a className="btn ghost" href="./Mihael_Kegl_CV.pdf" download>
            Download PDF
          </a>
          <a className="btn ghost" href={cv.linkedin} target="_blank" rel="noreferrer">
            Message Mihael on LinkedIn
          </a>
        </div>
        <p className="fine">
          Why v8.4? Eight years and four months in QA at Databox, as of this build.{' '}
          <button className="textlink" onClick={() => window.location.reload()}>
            Hunt again
          </button>
        </p>
      </section>
    </div>
  );
}

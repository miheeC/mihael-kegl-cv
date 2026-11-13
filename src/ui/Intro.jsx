import { useEffect, useRef } from 'react';
import { ArrowIcon } from './icons.jsx';

export default function Intro({ onStart }) {
  const startRef = useRef(null);
  useEffect(() => {
    startRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <section className="intro" aria-labelledby="intro-title">
      <p className="eyebrow">
        <span className="dot bad" /> Release v8.4 · Blocked
      </p>
      <h1 id="intro-title">Eight bugs stand between you and Mihael Kegl’s CV.</h1>
      <p className="lede">
        Mihael is a QA Team Lead with 8+ years of catching bugs for a living. Tonight they are loose on his desk. Catch
        one to file a ticket, and every ticket reveals a part of his CV.
      </p>
      <div className="intro-actions">
        <button ref={startRef} className="btn primary" onClick={onStart}>
          Start the bug hunt <ArrowIcon />
        </button>
        <a className="btn ghost" href="#cv">
          Skip the game, read the CV
        </a>
      </div>
      <ul className="howto">
        <li>About 2 minutes</li>
        <li>Drag to rotate</li>
        <li>Click or tap a bug to catch it</li>
      </ul>
    </section>
  );
}

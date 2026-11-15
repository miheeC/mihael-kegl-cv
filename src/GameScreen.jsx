import { useCallback, useEffect, useRef, useState } from 'react';
import { Game } from './game/Game.js';
import { bugs, bugById } from './data/bugs.js';
import Intro from './ui/Intro.jsx';
import Hud from './ui/Hud.jsx';
import Ticket from './ui/Ticket.jsx';
import Finale from './ui/Finale.jsx';

const readPref = (key) => {
  try {
    return window.localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
};
const writePref = (key, on) => {
  try {
    window.localStorage.setItem(key, on ? '1' : '0');
  } catch {
    /* private mode: the toggle still works for this visit */
  }
};

export default function GameScreen({ active, onUnavailable }) {
  const mount = useRef(null);
  const game = useRef(null);
  const toastTimer = useRef(0);
  const startedAt = useRef(0);
  const [phase, setPhase] = useState('intro'); // intro | play | done
  const [caught, setCaught] = useState([]);
  const [ticket, setTicket] = useState(null);
  const [toast, setToast] = useState(null);
  const [contrast, setContrast] = useState(false);
  const [muted, setMuted] = useState(() => readPref('rb-muted'));
  const [finaleOpen, setFinaleOpen] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const say = useCallback((message) => {
    setToast({ message, key: Date.now() });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4600);
  }, []);

  useEffect(() => {
    let g;
    try {
      g = new Game(mount.current, bugs, {
        onSay: say,
        onCatch: (id) => {
          g.setPaused(true);
          setToast(null);
          setCaught((list) => (list.includes(id) ? list : [...list, id]));
          setTimeout(() => setTicket(id), 650);
        },
      });
    } catch (err) {
      console.error(err);
      onUnavailable(); // App shows the CV in place of the game
      return undefined;
    }
    g.setMuted(readPref('rb-muted'));
    game.current = g;
    window.__releaseBlocker = g;
    return () => {
      clearTimeout(toastTimer.current);
      g.dispose();
      game.current = null;
    };
  }, [say, onUnavailable]);

  useEffect(() => {
    game.current?.setRunning(active);
  }, [active]);

  const start = () => {
    startedAt.current = performance.now();
    setPhase('play');
    game.current?.start();
    say(
      window.matchMedia('(pointer: coarse)').matches
        ? 'Drag to rotate, pinch to zoom. Tap a bug to catch it.'
        : 'Drag to rotate the desk. Click a bug to catch it.',
    );
  };

  const closeTicket = () => {
    setTicket(null);
    const g = game.current;
    if (!g) return;
    if (phase === 'play' && caught.length === bugs.length) {
      setElapsed(Math.round((performance.now() - startedAt.current) / 1000));
      setPhase('done');
      setFinaleOpen(true);
      g.setPaused(false);
      g.finale();
    } else {
      g.setPaused(false);
    }
  };

  const openTicket = (id) => {
    game.current?.setPaused(true);
    setTicket(id);
  };

  const toggleContrast = () => {
    const on = !contrast;
    setContrast(on);
    game.current?.setContrast(on);
    say(on ? 'Contrast check on. Anything failing WCAG 1.4.3 now stands out.' : 'Contrast check off.');
  };

  const toggleMuted = () => {
    const on = !muted;
    setMuted(on);
    writePref('rb-muted', on);
    game.current?.setMuted(on);
  };

  const hint = (id) => {
    const text = game.current?.hint(id);
    if (text) say(text);
  };

  return (
    <div className="game" hidden={!active}>
      <div className="stage" ref={mount} />
      <Hud
        phase={phase}
        caught={caught}
        contrast={contrast}
        muted={muted}
        busy={ticket !== null}
        onHint={() => hint()}
        onChipHint={hint}
        onChipCatch={(id) => game.current?.attemptById(id)}
        onChipFocus={(id) => game.current?.focus(id)}
        onOpenTicket={openTicket}
        onContrast={toggleContrast}
        onMuted={toggleMuted}
        onSummary={phase === 'done' && !finaleOpen ? () => setFinaleOpen(true) : null}
      />
      {phase === 'intro' && <Intro onStart={start} />}
      <div className="toast-zone" role="status" aria-live="polite">
        {toast && !ticket && (
          <div className="toast" key={toast.key}>
            {toast.message}
          </div>
        )}
      </div>
      {ticket && (
        <Ticket
          bug={bugById[ticket]}
          remaining={bugs.length - caught.length}
          done={phase === 'done'}
          onClose={closeTicket}
        />
      )}
      {phase === 'done' && finaleOpen && !ticket && <Finale seconds={elapsed} onClose={() => setFinaleOpen(false)} />}
    </div>
  );
}

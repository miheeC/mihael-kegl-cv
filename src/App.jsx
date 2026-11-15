import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import CvPage from './ui/CvPage.jsx';

// The game pulls in three.js, so it loads on demand. A direct link to #cv never pays for it.
const GameScreen = lazy(() => import('./GameScreen.jsx'));

const readRoute = () => (window.location.hash.replace(/^#\/?/, '') === 'cv' ? 'cv' : 'game');

// The game needs WebGL 2. Chrome has none once hardware acceleration is off (it no longer falls back to
// software rendering), and neither does a browser behind a company policy or many remote desktops.
// Those visitors get the CV straight away, without downloading the game.
const hasWebGL = () => {
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    return Boolean(gl);
  } catch {
    return false;
  }
};

export default function App() {
  const [route, setRoute] = useState(readRoute);
  const [gameSeen, setGameSeen] = useState(route === 'game');
  const [gameOff, setGameOff] = useState(() => !hasWebGL());
  const gameFailed = useCallback(() => setGameOff(true), []); // WebGL was there, but the game still could not start
  const showCv = route === 'cv' || gameOff;

  useEffect(() => {
    const onHash = () => setRoute(readRoute());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    if (route === 'game') setGameSeen(true);
    document.title = showCv ? 'Mihael Kegl · QA Team Lead · CV' : 'Release Blocker · Mihael Kegl, QA Team Lead';
    window.scrollTo(0, 0);
  }, [route, showCv]);

  return (
    <>
      {gameSeen && !gameOff && (
        <Suspense fallback={<div className="loading">Loading the desk…</div>}>
          {/* Stays mounted while the CV is open, so progress survives a detour. */}
          <GameScreen active={route === 'game'} onUnavailable={gameFailed} />
        </Suspense>
      )}
      {showCv && <CvPage gameAvailable={!gameOff} />}
    </>
  );
}

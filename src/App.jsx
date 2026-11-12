import { lazy, Suspense, useEffect, useState } from 'react';
import CvPage from './ui/CvPage.jsx';

// The game pulls in three.js, so it loads on demand. A direct link to #cv never pays for it.
const GameScreen = lazy(() => import('./GameScreen.jsx'));

const readRoute = () => (window.location.hash.replace(/^#\/?/, '') === 'cv' ? 'cv' : 'game');

export default function App() {
  const [route, setRoute] = useState(readRoute);
  const [gameSeen, setGameSeen] = useState(route === 'game');

  useEffect(() => {
    const onHash = () => setRoute(readRoute());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    if (route === 'game') setGameSeen(true);
    document.title = route === 'cv' ? 'Mihael Kegl · QA Team Lead · CV' : 'Release Blocker · Mihael Kegl, QA Team Lead';
    window.scrollTo(0, 0);
  }, [route]);

  return (
    <>
      {gameSeen && (
        <Suspense fallback={<div className="loading">Loading the desk…</div>}>
          {/* Stays mounted while the CV is open, so progress survives a detour. */}
          <GameScreen active={route === 'game'} />
        </Suspense>
      )}
      {route === 'cv' && <CvPage />}
    </>
  );
}

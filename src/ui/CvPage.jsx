import { cv } from '../data/cv.js';
import { Education, Numbers, Projects, Publication, Role, Skills, Writing } from './SectionContent.jsx';

export default function CvPage({ gameAvailable = true }) {
  return (
    <div className="cv-page">
      <nav className="cv-bar" aria-label="CV actions">
        {gameAvailable ? (
          <a className="btn ghost" href="#">
            ← Back to the bug hunt
          </a>
        ) : (
          <p className="cv-bar-note">
            This CV is also a small 3D bug hunt. It needs WebGL, which is switched off in this browser.
          </p>
        )}
        <span className="cv-bar-right">
          <a className="btn ghost" href="./Mihael_Kegl_CV.pdf" download>
            Download PDF
          </a>
          <button className="btn ghost" onClick={() => window.print()}>
            Print
          </button>
        </span>
      </nav>

      <main className="paper">
        <header className="cv-head">
          <div className="cv-id">
            {cv.photo && (
              <img className="cv-photo" src={cv.photo} alt={`Portrait of ${cv.name}`} width="360" height="360" />
            )}
            <div>
              <h1>{cv.name}</h1>
              <p className="cv-title">{cv.title}</p>
              <p className="cv-headline">{cv.headline}</p>
            </div>
          </div>
          <ul className="cv-contact">
            <li>
              <a href={cv.linkedin}>{cv.linkedinLabel}</a>
            </li>
            <li>
              <a href={`mailto:${cv.email}`}>{cv.email}</a>
            </li>
            <li>{cv.location}</li>
            <li>{cv.availability}</li>
          </ul>
        </header>

        <div className="cv-grid">
          <div className="cv-main">
            <section>
              <h2>Profile</h2>
              {cv.summary.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </section>

            <section>
              <h2>Experience</h2>
              {cv.experience.map((job) => (
                <Role job={job} key={job.id} />
              ))}
            </section>
          </div>

          <aside className="cv-side">
            <section>
              <h2>Skills</h2>
              <Skills />
            </section>

            <section>
              <h2>Education</h2>
              <Education />
            </section>
          </aside>
        </div>

        {/* Second block: starts page two of the PDF. On a wide screen it follows straight on. */}
        <div className="cv-grid second">
          <div className="cv-main">
            <section>
              <h2>Projects</h2>
              <Projects />
            </section>
          </div>
          <aside className="cv-side">
            <section>
              <h2>In numbers</h2>
              <Numbers />
            </section>

            <section>
              <h2>Speaking and publications</h2>
              <Publication />
              <Writing />
            </section>

            <section>
              <h2>Languages</h2>
              <ul className="plain">
                {cv.languages.map((l) => (
                  <li key={l.name}>
                    <strong>{l.name}</strong> · {l.level}
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}

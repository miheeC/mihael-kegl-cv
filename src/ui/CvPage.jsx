import { cv } from '../data/cv.js';
import { Projects, Publication, Role, Skills } from './SectionContent.jsx';

export default function CvPage() {
  return (
    <div className="cv-page">
      <nav className="cv-bar" aria-label="CV actions">
        <a className="btn ghost" href="#">
          ← Back to the bug hunt
        </a>
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
          <div>
            <h1>{cv.name}</h1>
            <p className="cv-title">{cv.title}</p>
            <p className="cv-headline">{cv.headline}</p>
          </div>
          <ul className="cv-contact">
            <li>
              <a href={cv.linkedin}>{cv.linkedinLabel}</a>
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
              {cv.education.map((e) => (
                <div className="role" key={e.degree}>
                  <h4>{e.degree}</h4>
                  <p className="role-company">{e.school}</p>
                </div>
              ))}
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

        {/* Second block: starts page two of the PDF. */}
        <div className="cv-grid second">
          <div className="cv-main">
            <section>
              <h2>Projects</h2>
              <Projects />
            </section>
          </div>
          <aside className="cv-side">
            <section>
              <h2>Speaking and publications</h2>
              <Publication />
            </section>
            <section>
              <h2>Writing</h2>
              {cv.writing.map((w) => (
                <div className="role" key={w.title}>
                  <h4>{w.title}</h4>
                  <p className="role-company">LinkedIn post</p>
                  <p>{w.note}</p>
                </div>
              ))}
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}

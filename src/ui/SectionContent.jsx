import { cv } from '../data/cv.js';

export function Role({ job }) {
  return (
    <div className="role">
      <div className="role-head">
        <h4>{job.role}</h4>
        <span className="role-period">{job.period}</span>
      </div>
      <p className="role-company">
        {job.company}
        {job.companyNote && ` · ${job.companyNote}`}
      </p>
      <ul className="bullets">
        {job.bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
    </div>
  );
}

/** Degrees, newest first, with the year each was awarded. */
export function Education() {
  return cv.education.map((e) => (
    <div className="role" key={e.degree}>
      <div className="role-head">
        <h4>{e.degree}</h4>
        <span className="role-period">{e.year}</span>
      </div>
      <p className="role-company">{e.school}</p>
    </div>
  ));
}

/** A titled entry with an optional period, intro and bullets: a project, or an automation era. */
export function Entry({ item }) {
  return (
    <div className="role entry">
      <div className="role-head">
        <h4>{item.title}</h4>
        {item.period && <span className="role-period">{item.period}</span>}
      </div>
      {item.intro && <p>{item.intro}</p>}
      {item.bullets && (
        <ul className="bullets">
          {item.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** QA Squad first, then the other projects. Shared by the Projects ticket and the CV page. */
export function Projects() {
  return (
    <>
      <QaSquad />
      {cv.projects.map((p) => (
        <Entry item={p} key={p.id} />
      ))}
    </>
  );
}

export function QaSquad() {
  const s = cv.qaSquad;
  return (
    <div className="squad">
      <div className="role-head">
        <h4>{s.title}</h4>
        <span className="role-period">{s.period}</span>
      </div>
      <p>{s.intro}</p>
      <ul className="agents">
        {s.agents.map((a) => (
          <li key={a.name}>
            <strong>{a.name}</strong> {a.job}
          </li>
        ))}
      </ul>
      <ul className="bullets">
        {s.notes.map((n) =>
          typeof n === 'string' ? (
            <li key={n}>{n}</li>
          ) : (
            <li key={n.text}>
              {n.text}{' '}
              <a className="inline-link" href={n.url} target="_blank" rel="noreferrer">
                {n.urlLabel}
              </a>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}

export function Skills() {
  return (
    <dl className="skills">
      {cv.skills.map((g) => (
        <div key={g.group}>
          <dt>{g.group}</dt>
          <dd>
            {g.items.map((item) => (
              <span className="tag" key={item}>
                {item}
              </span>
            ))}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function Publication() {
  const p = cv.publication;
  return (
    <div className="role">
      <div className="role-head">
        <h4>{p.title}</h4>
        <span className="role-period">{p.date}</span>
      </div>
      <p className="role-company">{p.venue}</p>
      <p>{p.note}</p>
      <a className="role-link" href={p.url} target="_blank" rel="noreferrer">
        {p.urlLabel}
      </a>
    </div>
  );
}

/** Posts and articles, listed under the conference paper. */
export function Writing() {
  return cv.writing.map((w) => (
    <div className="role" key={w.title}>
      <h4>{w.title}</h4>
      <p className="role-company">{w.venue}</p>
      <p>{w.note}</p>
      <a className="role-link" href={w.url} target="_blank" rel="noreferrer">
        {w.urlLabel}
      </a>
    </div>
  ));
}

/** Headline figures for the CV sidebar. */
export function Numbers() {
  return (
    <ul className="numbers">
      {cv.numbers.map((n) => (
        <li key={n.label}>
          <b>{n.value}</b>
          <span>{n.label}</span>
        </li>
      ))}
    </ul>
  );
}

export function ContactLinks() {
  return (
    <div className="contact-links">
      <a className="btn primary" href={cv.linkedin} target="_blank" rel="noreferrer">
        Message me on {cv.linkedinLabel}
      </a>
      <a className="btn ghost" href={`mailto:${cv.email}`}>
        Email {cv.email}
      </a>
      <a className="btn ghost" href="./Mihael_Kegl_CV.pdf" download>
        Download CV (PDF)
      </a>
    </div>
  );
}

/** The slice of the CV a ticket reveals. */
export default function SectionContent({ section }) {
  switch (section) {
    case 'profile':
      return (
        <>
          <h4 className="who">
            {cv.name}, {cv.title}
          </h4>
          <p className="headline">{cv.headline}</p>
          {cv.summary.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <ul className="facts two">
            {cv.facts.map((f) => (
              <li key={f.label}>
                <b>{f.value}</b>
                <span>{f.label}</span>
              </li>
            ))}
          </ul>
        </>
      );
    case 'automation':
      return cv.automation.map((a) => <Entry item={a} key={a.id} />);
    case 'experience':
      return cv.experience.map((e) => <Role job={e} key={e.id} />);
    case 'projects':
      return <Projects />;
    case 'skills':
      return <Skills />;
    case 'education':
      return (
        <>
          <Education />
          <ul className="facts two">
            {cv.languages.map((l) => (
              <li key={l.name}>
                <b>{l.name}</b>
                <span>{l.level}</span>
              </li>
            ))}
          </ul>
        </>
      );
    case 'speaking':
      return (
        <>
          <Publication />
          <Writing />
        </>
      );
    case 'contact':
      return (
        <>
          <h4 className="who">{cv.name}</h4>
          <p className="headline">
            {cv.availability} · {cv.location}
          </p>
          <blockquote>{cv.qaSquad.quote}</blockquote>
          <ContactLinks />
        </>
      );
    default:
      return null;
  }
}

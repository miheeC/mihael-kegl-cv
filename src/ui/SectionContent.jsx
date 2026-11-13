import { cv } from '../data/cv.js';

export function Role({ job }) {
  return (
    <div className="role">
      <div className="role-head">
        <h4>{job.role}</h4>
        <span className="role-period">{job.period}</span>
      </div>
      <p className="role-company">{job.company}</p>
      <ul className="bullets">
        {job.bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
    </div>
  );
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
      <h4>{s.title}</h4>
      <p>{s.intro}</p>
      <ul className="agents">
        {s.agents.map((a) => (
          <li key={a.name}>
            <strong>{a.name}</strong> {a.job}
          </li>
        ))}
      </ul>
      <ul className="bullets">
        {s.notes.map((n) => (
          <li key={n}>{n}</li>
        ))}
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
    </div>
  );
}

export function ContactLinks() {
  return (
    <div className="contact-links">
      <a className="btn primary" href={cv.linkedin} target="_blank" rel="noreferrer">
        Message me on {cv.linkedinLabel}
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
          <ul className="facts">
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
          {cv.education.map((e) => (
            <div className="role" key={e.degree}>
              <h4>{e.degree}</h4>
              <p className="role-company">{e.school}</p>
            </div>
          ))}
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
          {cv.writing.map((w) => (
            <div className="role" key={w.title}>
              <h4>{w.title}</h4>
              <p className="role-company">LinkedIn post</p>
              <p>{w.note}</p>
            </div>
          ))}
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

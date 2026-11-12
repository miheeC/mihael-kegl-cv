// Single source of truth for the CV. The game tickets, the CV page and the PDF all read from here.
export const cv = {
  name: 'Mihael Kegl',
  title: 'QA Team Lead',
  headline: 'Agentic QA and AI-driven test automation · Playwright · Claude Code',
  location: 'Ormož, Slovenia',
  linkedin: 'https://www.linkedin.com/in/mihaelkegl/',
  linkedinLabel: 'linkedin.com/in/mihaelkegl',
  availability: 'Open to work: on-site, hybrid or remote',

  summary: [
    'QA Team Lead with 8+ years in software quality at Databox, from building the end-to-end automation suite to leading QA for the relaunch of an AI-native analytics platform.',
    'Today I build agentic QA: AI agents that test every feature from different angles with Playwright and Claude Code, while a human decides what gets filed.',
  ],

  facts: [
    { value: '8+', label: 'years in software quality' },
    { value: '3', label: 'roles at Databox, QA Engineer to Team Lead' },
    { value: 'OTS 2025', label: 'conference speaker and co-author' },
  ],

  experience: [
    {
      id: 'lead',
      role: 'Quality Assurance Team Lead',
      company: 'Databox',
      period: 'May 2026 – Present',
      bullets: [
        'Built QA Squad, an agentic QA framework where AI QA agents test every feature from different angles and a developer agent prepares fixes, while a human decides what gets filed.',
        'Implemented AI-driven Playwright test automation with Claude Code.',
        'Led QA for the AI-native platform relaunch and major pricing and billing changes.',
      ],
    },
    {
      id: 'senior',
      role: 'Senior Quality Assurance Engineer',
      company: 'Databox',
      period: 'Jul 2021 – Apr 2026',
      bullets: [
        'Introduced a shift-left QA process, bringing QA into requirements and design reviews and validating every release with regression and smoke testing.',
        'Owned release testing for web and mobile, and was the go-to QA for the product’s most critical areas, including billing and pricing.',
        'Presented the company’s QA approach at the OTS 2025 conference and co-authored the published paper.',
        'Onboarded and mentored new QA engineers.',
      ],
    },
    {
      id: 'engineer',
      role: 'Quality Assurance Engineer',
      company: 'Databox',
      period: 'Aug 2018 – Jun 2021',
      bullets: [
        'Built the end-to-end test automation suite covering the core product, deployment gates and third-party integrations.',
        'Wrote product specs and analysed thousands of new-user session recordings to propose product improvements.',
        'Started a company-wide initiative for collecting and fixing small product-polish issues.',
      ],
    },
  ],

  qaSquad: {
    title: 'QA Squad',
    intro:
      'An agentic QA framework I built. Every project or feature gets tested by five AI QA engineers, each with a different skillset, coordinated by an orchestrator and sharing one knowledge base.',
    agents: [
      { name: 'Jack', job: 'requirements, acceptance criteria and business logic' },
      { name: 'Sam', job: 'tries to break everything: weird inputs, interrupted flows, edge cases' },
      { name: 'Charlie', job: 'reads every word of copy and hunts for confusing UX' },
      { name: 'Amy', job: 'compares every pixel against the Figma design' },
      { name: 'Nina', job: 'repeats everything to catch inconsistencies and rough edges' },
    ],
    notes: [
      'Nothing gets filed without a human: each bug arrives with repro steps and a screenshot, and one question: file it, or decline?',
      'Approved bugs go to Victor, the developer agent, who reproduces, fixes, verifies in the browser and opens a draft PR.',
      'After every run the orchestrator feeds what was filed and rejected back into the knowledge base.',
    ],
    quote: 'With the right AI agents, one QA engineer can cover what used to take a whole team.',
  },

  skills: [
    {
      group: 'Testing',
      items: [
        'Test strategy and planning',
        'Test design',
        'Exploratory testing',
        'Regression and smoke testing',
        'End-to-end testing',
        'API testing',
        'Integration testing',
        'Mobile testing',
        'Accessibility testing',
        'Performance testing',
        'Usability testing',
        'Requirements analysis',
      ],
    },
    {
      group: 'Automation',
      items: ['Playwright', 'Selenium', 'Katalon Studio', 'k6', 'Postman', 'CI/CD', 'Git', 'Test automation frameworks'],
    },
    {
      group: 'AI',
      items: [
        'Claude Code',
        'Claude Code subagents',
        'AI agents',
        'Multi-agent systems',
        'Model Context Protocol (MCP)',
        'Prompt engineering',
      ],
    },
    { group: 'Code', items: ['TypeScript', 'JavaScript', 'Python', 'CSS'] },
    { group: 'Product tools', items: ['Jira', 'Asana', 'Figma', 'Mixpanel', 'Stripe'] },
    { group: 'Leadership', items: ['Team leadership', 'Mentoring', 'Public speaking', 'Quality management'] },
  ],

  education: [
    {
      degree: 'Master’s degree, Telecommunications',
      school: 'Faculty of Electrical Engineering and Computer Science, University of Maribor',
    },
  ],

  languages: [
    { name: 'Slovenian', level: 'Native' },
    { name: 'English', level: 'Full professional proficiency' },
  ],

  publication: {
    title: 'Innovative QA Processes in Software Development',
    original: 'Inovativni procesi zagotavljanja kakovosti razvoja programskih rešitev',
    venue: 'OTS 2025 Conference Proceedings, University of Maribor Press',
    date: 'Sep 2025',
    note: 'Conference paper presented at OTS 2025 in Maribor, co-authored with Luka Prah. How to run shift-left QA in practice: QA in requirements and design, test planning, exploratory, functional and regression testing, automation with CI/CD, and retrospectives.',
  },

  writing: [
    {
      title: 'Accessibility in software: a standard, not an afterthought',
      note: 'On WCAG’s four principles and why accessibility checks belong next to functional testing. “Accessible products are better products, for everyone.”',
    },
    {
      title: 'Meet QA Squad',
      note: 'How one QA engineer runs five AI QA agents across five projects in parallel. Reached 20,000+ impressions on LinkedIn.',
    },
  ],
};

// Single source of truth for the CV. The game tickets, the CV page and the PDF all read from here.
// Shown on the Profile ticket and in the CV's "In numbers", so the figure cannot drift between them.
const ticketsFiled = { value: '11,000+', label: 'bug and improvement tickets filed in Asana' };

export const cv = {
  name: 'Mihael Kegl',
  // Square crop in public/, shown as a circle in the CV header.
  photo: './mihael-kegl.jpg',
  title: 'QA Team Lead',
  headline: 'Agentic QA and AI-driven test automation · Playwright · Claude Code',
  location: 'Ormož, Slovenia',
  linkedin: 'https://www.linkedin.com/in/mihaelkegl/',
  linkedinLabel: 'linkedin.com/in/mihaelkegl',
  email: 'miha.kegl@gmail.com',
  availability: 'Open to work: on-site, hybrid or remote',

  summary: [
    'QA Team Lead with 8+ years in software quality at Databox, an agentic analytics platform: from building the end-to-end automation suite to leading QA for its AI-native relaunch.',
    'Today I build agentic QA: AI agents that test every feature from different angles with Playwright and Claude Code, while a human decides what gets filed.',
  ],

  facts: [
    { value: '8+', label: 'years in software quality' },
    { value: '3', label: 'roles at Databox, QA Engineer to Team Lead' },
    { value: 'OTS 2025', label: 'conference speaker and co-author' },
    ticketsFiled,
  ],

  // Shown in the CV sidebar. Sources: Asana, the Katalon, Playwright and QA Squad repos.
  numbers: [
    ticketsFiled,
    { value: '640+', label: 'Katalon test cases written and maintained' },
    { value: '260+', label: 'Playwright test cases written and maintained with my team' },
    { value: '480+', label: 'issues found by QA Squad' },
    { value: '20,000+', label: 'impressions on the QA Squad post' },
  ],

  experience: [
    {
      id: 'lead',
      role: 'Quality Assurance Team Lead',
      company: 'Databox',
      companyNote: 'Agentic analytics platform',
      period: 'May 2026 – Present',
      bullets: [
        'Built QA Squad, an agentic QA framework that cut the testing of each feature from weeks to hours and has found 480+ issues: AI QA agents test every feature from different angles and a developer agent prepares fixes, while a human decides what gets filed.',
        'Built an AI-assisted Playwright framework with the QA team: Claude Code skills let everyone write and fix tests as plain-English user stories.',
        'Led QA on all projects and managed a QA team of three: planned the testing, assigned the work and moved capacity to where the risk was.',
        'Evaluated the consistency and reliability of Genie, an LLM-powered AI analyst, by testing response variability across repeated identical queries.',
      ],
    },
    {
      id: 'senior',
      role: 'Senior Quality Assurance Engineer',
      company: 'Databox',
      period: 'Jul 2021 – Apr 2026',
      bullets: [
        'Introduced shift-left QA: bugs are found in specs and designs before any code is written, with regression and smoke testing on every release.',
        'Owned the weekly web and mobile releases, got every small bug and improvement in them fixed, and was the go-to QA for critical areas.',
        'Set up k6 load tests for the product’s API endpoints.',
        'Presented the company’s QA approach at the OTS 2025 conference and co-authored the published paper.',
        'Onboarded and mentored 7 QA engineers.',
      ],
    },
    {
      id: 'engineer',
      role: 'Quality Assurance Engineer',
      company: 'Databox',
      period: 'Aug 2018 – Jun 2021',
      bullets: [
        'Built the end-to-end automation framework in Katalon Studio (Selenium) and grew it by 2024 to 640+ test cases with 80 integration suites, run as deployment gates and periodically on staging and production.',
        'Tested every feature before release, reported the bugs I found and owned each one until it was fixed.',
        'Wrote product specs and analysed thousands of new-user session recordings to propose product improvements.',
        'Started the “Small steps to make Databox perfect” initiative, which brought in 50+ reports from colleagues and got 90% of them fixed or implemented: a form where anyone in the company could flag the little product pains that seemed too small to report.',
      ],
    },
  ],

  qaSquad: {
    title: 'QA Squad',
    period: '2026',
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
      'Built with Claude Code skills and subagents, a Python dashboard, and the Chrome DevTools, Figma and Asana MCP servers.',
      {
        text: 'I wrote about it on LinkedIn, where the post reached 20,000+ impressions:',
        url: 'https://lnkd.in/p/dwdew_te',
        urlLabel: 'lnkd.in/p/dwdew_te',
      },
    ],
    quote: 'With the right AI agents, one QA engineer can cover what used to take a whole team.',
  },

  projects: [
    {
      id: 'playwright-framework',
      title: 'AI-assisted Playwright testing framework',
      period: '2026',
      intro:
        'A framework I built with the Databox QA team: a chain of Claude Code skills that turns a user story written in plain language into a working, verified Playwright test.',
      bullets: [
        'The agent reads the story, finds each UI element in the live app, then writes the test and page objects. Preconditions are set up through a seed API, not by clicking through the UI.',
        'It runs the test against the live app, classifies every failure and fixes it. If the cause is an app bug, it stops and reports it instead of bending the test.',
        'When the app changes, it repairs mechanical drift on its own and asks a human whenever behaviour changed. It never makes a test pass by weakening it.',
        'Helped connect the tests to the CI/CD pipeline: each new version of a service gets its own temporary test environment, and the tests run against it automatically.',
        'My team and I have written and maintain 260+ end-to-end tests so far, each one adding selectors and methods to a shared library.',
      ],
    },
    {
      id: 'fdv',
      title: 'Feature Dependency Visualizer',
      period: '2024',
      intro:
        'An internal tool I built so QA engineers and product managers can see how product features depend on each other, and which ones a change will affect.',
      bullets: [
        'Interactive graph and matrix of 50+ features, with every dependency rated strong, medium or weak and explained in plain language.',
        'Pick the feature that changed and the time you have: it generates a test plan that splits the time across the features most likely to break. The same dependency map gives AI the context to write test plans.',
        'Built with D3, Node.js and MongoDB.',
      ],
    },
  ],

  // Shown on the Flaky Test ticket only; the CV page covers automation under Experience.
  automation: [
    {
      id: 'katalon',
      title: 'Katalon and Selenium',
      period: '2018 – 2024',
      intro:
        'Started the end-to-end suite in my first weeks at Databox and grew it to 640+ test cases across the core product and 80 third-party integration suites, run as deployment gates and periodically on staging and production.',
    },
    {
      id: 'playwright',
      title: 'Playwright and Claude Code',
      period: '2026',
      intro:
        'A framework built with the QA team, where Claude Code skills turn plain-language user stories into verified Playwright tests. My team and I have written and maintain 260+ end-to-end tests with it so far, covering the AI analyst, metrics, signup and login, user roles and client accounts.',
    },
  ],

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
        'Mobile testing',
        'Accessibility testing',
        'Performance testing',
        'Usability testing',
        'Shift-left testing',
        'Requirements analysis',
      ],
    },
    {
      group: 'Automation',
      items: [
        'Playwright',
        'Selenium',
        'Katalon Studio',
        'k6',
        'CI/CD',
        'GitHub Actions',
        'Git',
        'VS Code',
        'Test automation frameworks',
      ],
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
        'LangSmith',
      ],
    },
    { group: 'Code', items: ['TypeScript', 'JavaScript', 'Node.js', 'Python', 'HTML/CSS', 'D3.js', 'MongoDB'] },
    { group: 'Product tools', items: ['Asana', 'Confluence', 'Figma', 'Mixpanel', 'Kibana', 'Stripe'] },
    { group: 'Leadership', items: ['Team leadership', 'Mentoring', 'Public speaking', 'Quality management'] },
  ],

  education: [
    {
      degree: 'Master’s degree, Telecommunications',
      school: 'Faculty of Electrical Engineering and Computer Science, University of Maribor',
      year: '2018',
    },
    {
      degree: 'Bachelor’s degree, Telecommunications',
      school: 'Faculty of Electrical Engineering and Computer Science, University of Maribor',
      year: '2013',
    },
  ],

  languages: [
    { name: 'Slovenian', level: 'Native' },
    { name: 'English', level: 'Full professional proficiency' },
    { name: 'Serbo-Croatian', level: 'Conversational' },
  ],

  publication: {
    title: 'Innovative QA Processes in Software Development',
    original: 'Inovativni procesi zagotavljanja kakovosti razvoja programskih rešitev',
    venue: 'OTS 2025 Conference Proceedings, University of Maribor Press',
    date: 'Sep 2025',
    url: 'https://doi.org/10.18690/um.feri.7.2025.18',
    urlLabel: 'doi.org/10.18690/um.feri.7.2025.18',
    note: 'Spoke at the OTS 2025 conference in Maribor, presenting this paper co-authored with Luka Prah. How to run shift-left QA in practice: QA in requirements and design, test planning, exploratory, functional and regression testing, automation with CI/CD, and retrospectives.',
  },

  writing: [
    {
      title: 'Accessibility in software: a standard, not an afterthought',
      venue: 'LinkedIn post',
      url: 'https://lnkd.in/p/d2YvqmtG',
      urlLabel: 'lnkd.in/p/d2YvqmtG',
      note: 'On WCAG’s four principles and why accessibility checks belong next to functional testing. “Accessible products are better products, for everyone.”',
    },
  ],
};

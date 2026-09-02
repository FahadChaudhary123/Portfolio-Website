/* =============================================================
   CONFIG  —  This is the ONLY file you need to edit.
   Change the values below and the whole site updates.
   ============================================================= */

const CONFIG = {
  /* ---------- Identity ---------- */
  name:      "Muhammad Fahad Taj",
  initials:  "MFT",
  role:      "Associate Software Engineer",
  location:  "Lahore, Pakistan",
  available: true,

  roles: [
    "Associate Software Engineer",
    "MERN Stack Developer",
    "Next.js Developer",
    "Full-Stack Engineer"
  ],

  tagline: "MERN Stack and Next.js developer building scalable, secure full-stack " +
           "applications — from role-based auth and REST APIs to responsive, " +
           "pixel-perfect interfaces.",

  /* ---------- GitHub ---------- */
  github: "FahadChaudhary123",

  featured: ["Learning-Management-System", "Positivus", "Authentication"],
  hidden:   ["FahadChaudhary123"],
  showForks: false,
  maxProjects: 12,

  // Which GitHub stat tiles to show in the About section.
  // Flip any of these to true/false — hidden tiles are removed entirely.
  showStats: {
    repos:     true,
    stars:     false,
    followers: false,
    languages: true
  },

  /* ---------- Contact ---------- */
  email:  "fchaudhary043@gmail.com",
  phone:  "0323-9596000",
  resume: "assets/resume.pdf",

  socials: {
    github:   "https://github.com/FahadChaudhary123",
    linkedin: "https://linkedin.com/in/muhammad-fahad-taj-57941627b",
    twitter:  "",
    leetcode: ""
  },

  /* ---------- Contact form delivery ----------
     Two options. Pick either one; the form detects which you used.

     A) Web3Forms - fastest, ~60 seconds
        1. Open https://web3forms.com, enter fchaudhary043@gmail.com
        2. They email you an access key (a UUID). Paste it below.
        3. Leave formEndpoint as the api.web3forms.com URL.
        Free tier: 250 messages/month. The key is visible in page source
        by design - that is how it works without a server.

     B) Google Apps Script - free, no third party, no visible key
        1. Follow the steps in google-apps-script/Code.gs
        2. Paste the deployment /exec URL into formEndpoint below
        3. Leave formAccessKey empty
        Messages arrive from your own Google account, and can also be
        logged to a Google Sheet. Gmail limit: 100 emails/day.

     Leave both empty and the form falls back to opening the visitor's
     own mail client, which many desktop browsers cannot do. */
  formAccessKey: "",
  formEndpoint:  "https://api.web3forms.com/submit",

  /* ---------- About ---------- */
  bio: [
    "I'm an Associate Software Engineer at Ayshx, working across the MERN stack " +
    "on real estate web applications — most recently designing and shipping a " +
    "Provident Fund module for financial tracking, end to end.",
    "Before that I built a Learning Management System and a full-stack e-commerce " +
    "app during internships at IIFA TECH, and sharpened my front-end eye converting " +
    "designs into pixel-perfect UI at Integriti. I care about clean code, secure " +
    "APIs and interfaces that feel fast."
  ],

  facts: [
    { label: "Role",      value: "Associate Software Engineer" },
    { label: "Company",   value: "Ayshx" },
    { label: "Location",  value: "Lahore, Pakistan" },
    { label: "Education", value: "BS Software Engineering, UMT" }
  ],

  /* ---------- Skills ---------- */
  skills: {
    "Frontend": ["React.js", "Next.js", "React Native", "Redux", "JavaScript (ES6+)", "HTML5", "CSS3", "Tailwind CSS"],
    "Backend":  ["Node.js", "Express.js", "NestJS", "REST APIs", "JWT Auth", "BullMQ", "Redis"],
    "Database": ["MongoDB", "MongoDB Atlas", "PostgreSQL"],
    "Tools":    ["Git", "GitHub", "Bitbucket", "Docker", "Postman", "Figma", "Vercel", "VS Code"],
    "Practice": ["Agile", "Debugging", "API Integration", "Problem-Solving", "Manual Testing"]
  },

  /* ---------- Experience timeline ---------- */
  experience: [
    {
      role:    "Associate Software Engineer",
      company: "Ayshx — Full-Time",
      period:  "March 2026 — Present",
      points: [
        "Work as a MERN Stack Developer on real estate web applications.",
        "Designed and implemented a Provident Fund feature for financial tracking.",
        "Developed full-stack modules using MongoDB, Express.js, React.js and Node.js.",
        "Performed manual testing to ensure system reliability and bug-free deployment."
      ],
      stack: ["MongoDB", "Express.js", "React.js", "Node.js"]
    },
    {
      role:    "Software Engineer Intern",
      company: "Integriti — Lahore, Pakistan",
      period:  "January 2026 — February 2026",
      points: [
        "Gained hands-on experience in CMS and WordPress customization.",
        "Implemented responsive carousels and sliders using modern HTML, CSS and JavaScript best practices.",
        "Converted web flow designs into pixel-perfect UI with accurate spacing, typography and layout consistency.",
        "Learned and applied Shopify Liquid templating — sections, blocks and dynamic data rendering."
      ],
      stack: ["WordPress", "Shopify Liquid", "HTML5", "CSS3", "JavaScript"]
    },
    {
      role:    "MERN | Next.js Intern",
      company: "IIFA TECH — Lahore, Pakistan",
      period:  "August 2025 — November 2025",
      points: [
        "Collaborated on a Learning Management System with user authentication, course management and video modules.",
        "Built secure Node.js and Express.js APIs with JWT authentication, improving data integrity and system security.",
        "Implemented React Hook Form for efficient backend data handling, reducing validation errors by 25%.",
        "Engineered a full-stack e-commerce and news application using REST APIs and MongoDB for real-time data synchronization."
      ],
      stack: ["Next.js", "React", "Node.js", "Express.js", "MongoDB", "JWT"]
    }
  ],

  /* ---------- Education ---------- */
  education: [
    {
      degree: "BS Software Engineering",
      school: "University of Management and Technology, Lahore",
      period: "2021 — 2025",
      note:   "GPA 3.1 / 4.0"
    }
  ],

  /* ---------- Selected work ----------
     Hand-picked projects. If `repo` matches one of your GitHub repositories
     the card automatically gains a live source link, star count and topics.
     `demo` adds a live-site button. `status` shows a small label instead. */
  projects: [
    {
      title: "Amaanat — School Management SaaS",
      description: "Full-stack SaaS platform connecting schools and parents, with role-based authentication, student management and real-time communication between parents and school staff.",
      stack: ["Next.js", "MongoDB", "Express.js", "React.js", "Node.js"],
      status: "In progress",
      repo: "", demo: ""
    },
    {
      title: "Learning Management System",
      description: "Full-stack LMS with user authentication, instructor dashboards, course management and video modules. Secure Express APIs with JWT, media handled through Cloudinary.",
      stack: ["MERN", "Redux", "Cloudinary", "JWT"],
      repo: "Learning-Management-System",
      demo: "https://learning-management-system-three-ashy.vercel.app"
    },
    {
      title: "Real Estate Platform",
      description: "Company project at Ayshx. Built the Provident Fund feature end-to-end for financial tracking and performed manual testing across the site to ensure reliability.",
      stack: ["MongoDB", "Express.js", "React.js", "Node.js"],
      status: "Company project",
      repo: "", demo: ""
    },
    {
      title: "AI Content Creation Platform",
      description: "Full-stack AI content generation tool with user authentication, dashboards and AI management modules built on the OpenAI API.",
      stack: ["Next.js", "OpenAI", "Tailwind CSS"],
      status: "Private repo",
      repo: "", demo: ""
    },
    {
      title: "Personality Trait Detection System",
      description: "Final Year Project. AI-powered app predicting user personality traits from text using NLP and the Big Five model, with real-time analysis.",
      stack: ["React", "Python", "Hugging Face", "NLP"],
      status: "Final Year Project",
      repo: "", demo: ""
    },
    {
      title: "Emotion Detection System",
      description: "CNN-based emotion recognition model wired into a React web interface for real-time analysis from live input.",
      stack: ["React", "Node.js", "CNN", "Python"],
      status: "Academic project",
      repo: "", demo: ""
    },
    {
      title: "Mini E-commerce Web App",
      description: "Complete e-commerce platform with JWT authentication, full CRUD on products and a dynamic shopping cart backed by REST APIs.",
      stack: ["MongoDB", "Express.js", "React.js", "Node.js", "JWT"],
      status: "Private repo",
      repo: "", demo: ""
    },
    {
      title: "Positivus — Marketing Site",
      description: "Responsive marketing landing page built from a Figma design, focused on precise spacing, typography and layout consistency across breakpoints.",
      stack: ["HTML5", "CSS3", "Responsive"],
      repo: "Positivus",
      demo: "https://positivus-olive-six.vercel.app"
    },
    {
      title: "Authentication Module",
      description: "Reusable authentication flow covering registration, login and protected routes with JSON Web Tokens.",
      stack: ["JavaScript", "Node.js", "JWT"],
      repo: "Authentication", demo: ""
    },
    {
      title: "Traveler React App",
      description: "Responsive travel planner with an efficient component structure and smooth client-side navigation via React Router.",
      stack: ["React", "React Router"],
      status: "Practice project",
      repo: "", demo: ""
    }
  ]
};

// Mock Database for the AI-Based Job Portal

export const companies = [
  {
    id: 'c1',
    name: 'TechVibe Solutions',
    logo: '🏢',
    location: 'San Francisco, CA (Hybrid)',
    employees: '500-1000',
    industry: 'AI & Software',
    description: 'TechVibe Solutions is a pioneer in building conversational AI agents and enterprise software automation.',
    website: 'https://techvibe.example.com',
  },
  {
    id: 'c2',
    name: 'Apex HealthTech',
    logo: '🏥',
    location: 'New York, NY (Remote)',
    employees: '250-500',
    industry: 'Healthcare Technology',
    description: 'Apex HealthTech builds state-of-the-art predictive intelligence models to streamline clinical diagnostics.',
    website: 'https://apexhealth.example.com',
  },
  {
    id: 'c3',
    name: 'GreenEnergy Grid',
    logo: '🌿',
    location: 'Austin, TX (Onsite)',
    employees: '100-250',
    industry: 'Clean Energy & Sustainability',
    description: 'GreenEnergy Grid leverages machine learning to optimize grid-balancing for solar and wind networks.',
    website: 'https://greenenergy.example.com',
  },
  {
    id: 'c4',
    name: 'FinFlow Capital',
    logo: '💳',
    location: 'London, UK (Remote)',
    employees: '1000-5000',
    industry: 'Fintech',
    description: 'FinFlow Capital simplifies cross-border transactions and automates compliance using smart contracts.',
    website: 'https://finflow.example.com',
  }
];

export const jobs = [
  {
    id: 'j1',
    companyId: 'c1',
    companyName: 'TechVibe Solutions',
    companyLogo: '🏢',
    title: 'Senior React Developer (AI Integration)',
    location: 'San Francisco, CA',
    salary: '$130k - $160k',
    experience: '5+ years',
    type: 'Hybrid',
    skills: ['React', 'JavaScript', 'Tailwind CSS', 'Next.js', 'Websockets'],
    description: 'We are seeking an experienced React Developer to build the user interface for our next-generation conversational AI platform. You will build highly responsive web pages, integrate real-time streaming interfaces, and lead a front-end engineering team.',
    responsibilities: [
      'Build reusable, high-performance UI components in React.',
      'Integrate LLM streaming response APIs into frontend web interfaces.',
      'Optimize application performance for real-time applications.',
      'Collaborate with backend engineers to define RESTful API contracts.'
    ],
    qualifications: [
      'Strong expertise in JavaScript, React (ES6+), and CSS Frameworks.',
      'Experience with state management libraries (Redux, Zustand) and Context API.',
      'Familiarity with web sockets and streaming data.',
      'Bachelor’s or Master’s in Computer Science or related fields.'
    ],
    benefits: ['401(k) Matching', 'Comprehensive Medical & Dental', 'Stock Options', 'Annual Learning Stipend'],
    recruiterName: 'Jane Smith',
    recruiterEmail: 'jane.smith@techvibe.example.com',
    postedTime: '2 days ago'
  },
  {
    id: 'j2',
    companyId: 'c2',
    companyName: 'Apex HealthTech',
    companyLogo: '🏥',
    title: 'Frontend React Engineer',
    location: 'New York, NY',
    salary: '$110k - $140k',
    experience: '3+ years',
    type: 'Remote',
    skills: ['React', 'JavaScript', 'Tailwind CSS', 'React Hook Form', 'Axios'],
    description: 'Join our team to design interactive diagnostic analytics dashboards. You will work closely with medical doctors and AI researchers to present complex clinical data in an intuitive, accessible layout.',
    responsibilities: [
      'Implement clean and accessible dashboard designs using Tailwind CSS.',
      'Implement form validation and input workflows using React Hook Form.',
      'Implement charts, graph widgets, and predictive analytics visualizations.'
    ],
    qualifications: [
      'Solid foundations in React, modern JavaScript, and Tailwind CSS.',
      'Experience with rendering large datasets or tabular charts (Recharts, Chart.js).',
      'Knowledge of web accessibility guidelines (WCAG).'
    ],
    benefits: ['100% Remote Work', 'Unlimited PTO', 'Home Office Stipend', 'Health Insurance'],
    recruiterName: 'Mark Johnson',
    recruiterEmail: 'm.johnson@apexhealth.example.com',
    postedTime: '1 week ago'
  },
  {
    id: 'j3',
    companyId: 'c3',
    companyName: 'GreenEnergy Grid',
    companyLogo: '🌿',
    title: 'Full Stack Engineer (React & Java)',
    location: 'Austin, TX',
    salary: '$120k - $150k',
    experience: '4+ years',
    type: 'Onsite',
    skills: ['React', 'JavaScript', 'Spring Boot', 'Java', 'SQL'],
    description: 'We are looking for a hybrid engineer comfortable writing React frontends and Spring Boot backends to build telemetry management consoles for renewable energy farms.',
    responsibilities: [
      'Develop dashboard monitoring widgets using React.',
      'Build robust, secure REST APIs in Java using Spring Boot.',
      'Deploy applications to cloud platforms and optimize database queries.'
    ],
    qualifications: [
      'Proven experience in React (Frontend) and Java/Spring Boot (Backend).',
      'Proficiency in writing SQL queries and relational database design.',
      'Excellent systems thinking and problem-solving skills.'
    ],
    benefits: ['Onsite Gym and Meals', 'Full Pension Scheme', 'Relocation Package', 'Flexible Hours'],
    recruiterName: 'Sarah Davis',
    recruiterEmail: 's.davis@greenenergy.example.com',
    postedTime: '3 days ago'
  },
  {
    id: 'j4',
    companyId: 'c4',
    companyName: 'FinFlow Capital',
    companyLogo: '💳',
    title: 'Product Design Lead',
    location: 'London, UK',
    salary: '£90k - £120k',
    experience: '6+ years',
    type: 'Remote',
    skills: ['Figma', 'React', 'CSS', 'Tailwind CSS'],
    description: 'Guide the branding, interaction patterns, and front-end layouts of our corporate multi-currency banking system. This is a design-centric engineering role.',
    responsibilities: [
      'Create high-fidelity interactive wireframes in Figma.',
      'Translate design components directly into reusable React/Tailwind code.',
      'Conduct user testing sessions to iterate on UX workflows.'
    ],
    qualifications: [
      'Deep portfolio showing premium UI/UX design and frontend development.',
      'Strong knowledge of CSS animations, transitions, and component architectures.'
    ],
    benefits: ['Private Health Care', 'Annual Travel Grants', 'Equity Shares', 'Hardware Allowance'],
    recruiterName: 'David Lee',
    recruiterEmail: 'd.lee@finflow.example.com',
    postedTime: '5 days ago'
  }
];

export const candidates = [
  {
    id: 'can1',
    name: 'Alex Johnson',
    title: 'Senior Frontend Developer',
    email: 'alex.johnson@example.com',
    phone: '+1 (555) 019-2834',
    avatar: '👨‍💻',
    skills: ['React', 'JavaScript', 'Tailwind CSS', 'Next.js', 'Redux', 'Git'],
    missingSkills: ['Websockets', 'Spring Boot'],
    experience: '5.5 years',
    education: 'B.S. in Computer Science',
    matchScore: 92,
    location: 'San Francisco, CA (Open to Remote)',
    resumeUrl: 'alex_johnson_resume.pdf',
    summary: 'Diligent Frontend engineer focused on clean state machines, high performance renderings, and responsive Tailwind templates.',
  },
  {
    id: 'can2',
    name: 'Emily Watson',
    title: 'Junior React UI Developer',
    email: 'emily.w@example.com',
    phone: '+1 (555) 014-9988',
    avatar: '👩‍💻',
    skills: ['React', 'JavaScript', 'Tailwind CSS', 'React Hook Form'],
    missingSkills: ['Next.js', 'Websockets'],
    experience: '2 years',
    education: 'Self-taught & Bootcamp Graduate',
    matchScore: 78,
    location: 'Seattle, WA (Remote Only)',
    resumeUrl: 'emily_watson_cv.docx',
    summary: 'Enthusiastic React developer with a passion for micro-animations, accessible forms, and component modularity.',
  }
];

export const applications = [
  {
    id: 'app1',
    jobId: 'j1',
    jobTitle: 'Senior React Developer (AI Integration)',
    companyName: 'TechVibe Solutions',
    status: 'Shortlisted', // 'Applied', 'Reviewing', 'Shortlisted', 'Interviewing', 'Rejected'
    appliedDate: '2026-07-05',
    matchScore: 92,
  },
  {
    id: 'app2',
    jobId: 'j2',
    jobTitle: 'Frontend React Engineer',
    companyName: 'Apex HealthTech',
    status: 'Interviewing',
    appliedDate: '2026-07-02',
    matchScore: 84,
  },
  {
    id: 'app3',
    jobId: 'j4',
    jobTitle: 'Product Design Lead',
    companyName: 'FinFlow Capital',
    status: 'Applied',
    appliedDate: '2026-07-07',
    matchScore: 75,
  }
];

export const notifications = [
  {
    id: 'n1',
    role: 'seeker',
    title: 'New AI Recommended Job',
    message: 'A new job "Senior React Developer" at TechVibe matches 92% of your skills. Apply now!',
    time: '1 hour ago',
    read: false,
  },
  {
    id: 'n2',
    role: 'seeker',
    title: 'Application Shortlisted',
    message: 'Congratulations! Your application for Frontend React Engineer has been shortlisted.',
    time: '1 day ago',
    read: true,
  },
  {
    id: 'n3',
    role: 'recruiter',
    title: 'New Candidate Applied',
    message: 'Alex Johnson applied for Senior React Developer (AI Integration) with a 92% match score.',
    time: '2 hours ago',
    read: false,
  },
  {
    id: 'n4',
    role: 'recruiter',
    title: 'Job Performance Alert',
    message: 'Your posting for "Full Stack Engineer" reached 50 applicants today.',
    time: '2 days ago',
    read: true,
  }
];

export const recruiterAnalytics = {
  jobsPosted: 4,
  applicationsReceived: 184,
  shortlistedCandidates: 28,
  interviewsScheduled: 12,
  recentApplications: [
    { id: 'rap1', name: 'Alex Johnson', jobTitle: 'Senior React Developer', matchScore: 92, date: 'Today' },
    { id: 'rap2', name: 'Emily Watson', jobTitle: 'Frontend React Engineer', matchScore: 78, date: 'Today' },
    { id: 'rap3', name: 'Michael Brown', jobTitle: 'Full Stack Engineer', matchScore: 85, date: 'Yesterday' },
  ],
  hiringStats: [
    { label: 'Engineering', count: 8 },
    { label: 'Design', count: 3 },
    { label: 'Product', count: 2 },
  ],
};

export const seekerAnalytics = {
  profileCompletion: 85,
  applicationsSent: 12,
  interviewInvitations: 3,
  savedJobs: 5,
  recentActivity: [
    { id: 'act1', type: 'applied', text: 'Applied for Product Design Lead at FinFlow Capital', date: 'Yesterday' },
    { id: 'act2', type: 'interview', text: 'Scheduled Interview with Apex HealthTech', date: '3 days ago' },
    { id: 'act3', type: 'match', text: 'AI matched you with Senior React Developer (92%)', date: '4 days ago' },
  ]
};

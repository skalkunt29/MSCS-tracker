/* ------------------------------------------------------------------
   Course lists, official links, and FAQ copy.
   Sourced from the "CU Boulder CSEN Graduate Degree: Milestone tracker"
   workbook (MS CS, MSCPS, and BIN Courses sheets).
   ------------------------------------------------------------------ */

// Breadth (BIN) lists — "BIN Courses" sheet, columns A / B / C.
const binCourses = {
  bin1: [
    "CSCI 5229 Computer Graphics",
    "CSCI 5244 Quantum Computation and Information",
    "CSCI 5254 Convex Optimization",
    "CSCI 5434 Probability for Computer Science",
    "CSCI 5444 Intro to Theory of Computation",
    "CSCI 5446 Chaotic Dynamics",
    "CSCI 5454 Design & Analysis of Algorithms",
    "CSCI 5526 Computational Tools for Multiscale Problems",
    "CSCI 5576 High-Performance Scientific Computing",
    "CSCI 5606 Principles of Numerical Computation",
    "CSCI 5636 Numerical Solution of PDEs",
    "CSCI 5646 Numerical Linear Algebra",
    "CSCI 5654 Linear Programming",
    "CSCI 5676 Numerical Methods for Unconstrained Optimization",
  ],
  bin2: [
    "CSCI 5202 Intro to Robotics",
    "CSCI 5302 Advanced Robotics",
    "CSCI 5322 Algorithmic Human-Robot Interaction",
    "CSCI 5352 Network Analysis and Modeling",
    "CSCI 5402 Research Methods in Human-Robot Interaction",
    "CSCI 5502 Data Mining",
    "CSCI 5616 Introduction to Virtual Reality",
    "CSCI 5622 Machine Learning",
    "CSCI 5722 Computer Vision",
    "CSCI 5822 Probabilistic and Causal Modeling in Computer Science",
    "CSCI 5832 Natural Language Processing",
    "CSCI 5839 User-Centered Design",
    "CSCI 5849 Input Interaction and Accessibility",
    "CSCI 5922 Neural Networks and Deep Learning",
    "CSCI 5942 AI Engineering",
  ],
  bin3: [
    "CSCI 5135 Computer-Aided Verification",
    "CSCI 5214 Big Data Architecture",
    "CSCI 5253 Datacenter Scale Computing",
    "CSCI 5263 Quantum Computer Architecture and Systems",
    "CSCI 5273 Network Systems",
    "CSCI 5403 Intro to Cyber Security",
    "CSCI 5413 Ethical Hacking",
    "CSCI 5448 Object-Oriented Analysis and Design",
    "CSCI 5523 Modern Offense and Defense in Cybersecurity",
    "CSCI 5525 Compiler Construction",
    "CSCI 5535 Fundamental Concepts of Programming Languages",
    "CSCI 5573 Advanced Operating Systems",
    "CSCI 5673 Distributed Systems",
    "CSCI 5817 Database Systems",
    "CSCI 5828 Foundations of Software Engineering",
    "CSCI 5854 Theoretical Foundation of Autonomous Systems",
  ],
};

// MSCPS subplans. Each needs four courses (12 credit hours) with a B or higher.
const subplans = [
  {
    value: "GENERAL TRACK (no subplan)",
    label: "General Track (no subplan)",
    courses: [],
  },
  {
    value: "Artificial Intelligence (AIG)",
    label: "Artificial Intelligence (AIG)",
    courses: [
      "CSCI 5202 - Intro to Robotics",
      "CSCI 5302 - Advanced Robotics",
      "CSCI 5322 - Algorithmic Human-Robot Interaction",
      "CSCI 5352 - Network Analysis and Modeling",
      "CSCI 5402 - Research Topics in Human-Robot Interaction",
      "CSCI 5502 - Data Mining",
      "CSCI 5616 - Introduction to Virtual Reality",
      "CSCI 5722 - Computer Vision",
      "CSCI 5822 - Probabilistic Modeling in Human and Machine Learning",
      "CSCI 5832 - Natural Language Processing",
      "CSCI 5839 - User-Centered Design and Development 1",
      "CSCI 5849 - Input Interaction and Accessibility",
      "CSCI 5922 - Neural Networks and Deep Learning",
      "CSCI 5932 - Deep Reinforcement Learning",
      "CSCI 5942 - AI Engineering",
    ],
  },
  {
    value: "Algorithms, Network and Optimization (ANO)",
    label: "Algorithms, Network and Optimization (ANO)",
    courses: [
      "CSCI 5114 - Practical Algorithmic Complexity",
      "CSCI 5254 - Convex Optimization",
      "CSCI 5352 - Network Analysis and Modeling",
      "CSCI 5434 - Probability for Computer Science",
      "CSCI 5444 - Theory of Computation",
      "CSCI 5454 - Design and Analysis of Algorithms",
      "CSCI 5654 - Linear Programming",
      "CSCI 5676 - Numerical Optimization",
      "CSCI 6114 - Computational Complexity Theory",
      "CSCI 6214 - Randomized Algorithms",
      "CSCI 6314 - Algorithmic Economics",
    ],
  },
  {
    value: "Data Science & Engineering (DSE)",
    label: "Data Science & Engineering (DSE)",
    courses: [
      "CSCI 5214 - Big Data Architecture",
      "CSCI 5253 - Datacenter Scale Computing",
      "CSCI 5254 - Convex Optimization",
      "CSCI 5352 - Network Analysis and Modeling",
      "CSCI 5434 - Probability for Computer Science",
      "CSCI 5576 - High-Performance Scientific Computing",
      "CSCI 5622 - Machine Learning",
      "CSCI 5654 - Linear Programming",
      "CSCI 5676 - Numerical Methods for Unconstrained Optimization",
      "CSCI 5722 - Computer Vision",
      "CSCI 5832 - Natural Language Processing",
      "CSCI 5922 - Neural Networks and Deep Learning",
      "CSCI 6502 - Big Data Analytics",
    ],
  },
  {
    value: "Human-Centered Computing (HCC)",
    label: "Human-Centered Computing (HCC)",
    courses: [
      "CSCI 5229 - Computer Graphics",
      "CSCI 5239 - Advanced Computer Graphics",
      "CSCI 5322 - Algorithmic Human-Robot Interaction",
      "CSCI 5402 - Research Methods in Human-Robot Interaction",
      "CSCI 5616 - Intro to Mixed Reality",
      "CSCI 5809 - Computer Animation",
      "CSCI 5839 - User-Centered Design & Development 1",
      "CSCI 5849 - Input Interaction and Accessibility",
      "CSCI 5919 - HCI: Survey and Synthesis 1",
      "CSCI 5929 - HCI: Survey and Synthesis 2",
      "CSCI 6402 - Issues and Methods in Cognitive Science",
      "CSCI 7000 - Special Topics [Information Visualization]",
      "CSCI 7000 - Special Topics [Physical & Tangible Computing]",
      "CSCI 7000 - Special Topics [Inclusive Design and Assistive Technology]",
      "INFO 5501 - Open Collaboration",
      "INFO 5502 - Online Communities",
      "INFO 5601 - Information Ethics and Policy",
      "INFO 5602 - Information Visualization",
      "INFO 5606 - Ethnographic Research for Applied Settings",
      "INFO 5609 - User-Centered Design",
      "INFO 5611 - Ubiquitous Computing Experience Design",
    ],
  },
  {
    value: "Numerical Computation (NUM)",
    label: "Numerical Computation (NUM)",
    courses: [
      "CSCI 5229 - Computer Graphics",
      "CSCI 5239 - Advanced Computer Graphics",
      "CSCI 5244 - Quantum Computation & Information",
      "CSCI 5446 - Chaotic Dynamics",
      "CSCI 5526 - Computational Tools for Multiscale Problems",
      "CSCI 5576 - High-Performance Scientific Computing",
      "CSCI 5606 - Principles of Numerical Computation",
      "CSCI 5636 - Numerical Solution of Partial Differential Equations",
      "CSCI 5646 - Numerical Linear Algebra",
      "CSCI 5654 - Linear Programming",
      "CSCI 5676 - Numerical Optimization",
    ],
  },
  {
    value: "Robotics (RBT)",
    label: "Robotics (RBT)",
    courses: [
      "CSCI 5202 - Intro to Robotics",
      "CSCI 5254 - Convex Optimization",
      "CSCI 5302 - Advanced Robotics",
      "CSCI 5322 - Algorithmic Human-Robot Interaction",
      "CSCI 5434 - Probability for Computer Science",
      "CSCI 5622 - Machine Learning",
      "CSCI 5722 - Computer Vision",
      "CSCI 5854 - Theoretical Foundations of Autonomous Systems",
      "CSCI 5922 - Neural Networks and Deep Learning",
      "CSCI 5932 - Deep Reinforcement Learning",
      "CSCI 5942 - AI Engineering",
      "CSCI 7000 - Special Topics [Robot Perception]",
      "CSCI 7000 - Special Topics [Physical Human Robot Interaction and Control]",
      "ASEN 5347 - Math Methods in Dynamics",
      "ASEN 6020 - Optimal Trajectories",
      "ASEN 6412 - Uncertainty Quantification",
      "ASEN 6519 - Special Topics [Algorithms for Aerospace Autonomy]",
    ],
  },
  {
    value: "Security (SEC)",
    label: "Security (SEC)",
    courses: [
      "CSCI 5113 - Linux System Administration",
      "CSCI 5273 - Network Systems",
      "CSCI 5403 / CYBR 5300 - Cybersecurity",
      "CSCI 5413 - Ethical Hacking",
      "CSCI 5523 - Modern Offense and Defense in Cybersecurity",
      "CSCI 7000 - Special Topics [Malware Reverse Engineering]",
      "CYBR 5320 - Cybersecurity Network Analysis",
      "CYBR 5330 - Digital Forensics",
      "CYBR 5350 - Security Auditing and Penetration Testing",
      "CYBR 5830 - Special Topics [Embedded Cybersecurity]",
      "CYBR 5830 - Special Topics [Software Reverse Engineering]",
      "ECEN 5133 - Fundamentals of Computer Security",
      "ECEN 5793 - Secure Computer Architecture",
    ],
  },
  {
    value: "Software Systems & Cloud Computing (SSC)",
    label: "Software Systems & Cloud Computing (SSC)",
    courses: [
      "CSCI 5135 - Computer-Aided Verification",
      "CSCI 5253 - Datacenter Scale Computing",
      "CSCI 5263 - Quantum Computer Architecture and Systems",
      "CSCI 5273 - Network Systems",
      "CSCI 5413 - Computer Security & Ethical Hacking",
      "CSCI 5448 - Object-Oriented Analysis and Design",
      "CSCI 5502 - Data Mining",
      "CSCI 5525 - Compiler Construction",
      "CSCI 5535 - Fundamental Concepts of Programming Languages",
      "CSCI 5573 - Advanced Operating Systems",
      "CSCI 5673 - Distributed Systems",
      "CSCI 5817 - Database Systems",
      "CSCI 5828 - Foundations of Software Engineering",
    ],
  },
];

const GENERAL_TRACK = subplans[0].value;
const SUBPLAN_COURSES_REQUIRED = 4;

// MSCPS Projects (capstone) sequences.
const projectsOptions = [
  "Professional MS Projects (CSCI 5040 & CSCI 5050)",
  "Tech Startup Essentials: Entrepreneurial Projects (CSCI 5340 & CSCI 5350)",
  "Projects Waiver",
];

const PROJECTS_WAIVER = "Projects Waiver";

// MSCS (research) research-course sequences.
const researchOptions = ["Thesis (CSCI 6950)", "Independent Study (CSCI 5900)"];

// Undergraduate project sequences that automatically waive the MSCPS Projects.
const bamUndergradProjects = [
  "Software Engineering Projects: CSCI 4308 and CSCI 4318",
  "Entrepreneurial Projects: CSCI 4348 & CSCI 4358",
  "Multidisciplinary Projects: CSCI 4368 & CSCI 4378",
  "None of the above",
];

const bamCreditOptions = [
  "0 courses (0 hrs)",
  "1 course (3-4 hrs)",
  "2 courses (6-7 hrs)",
  "3 courses (9-10 hrs)",
  "4 courses (max 12/13 hrs)",
];

const nonPhdCreditOptions = [
  "3 courses (Bins)",
  "4 courses (Bins + 1 Elective)",
  "5 courses - MAXIMUM (Bins + 2 Electives)",
];

const emenChoiceOptions = [
  "EMEN 5030 Project Management",
  "EMEN 5405 Fundamentals of Systems Engineering",
];

const paceOptions = ["Full-time", "Part-time"];

const links = {
  // MSCPS pathways are advised by Daniel; the research MS is advised by Meagan.
  advisor:
    "https://outlook.office365.com/owa/calendar/CS_DanielAdamsAdvisingDropIns@colorado.edu/bookings/",
  advisorMscs:
    "https://bookings.cloud.microsoft/book/CS_Burkholm@colorado.edu/?ismsaljsauthenabled=true",
  mscpsRequirements:
    "https://www.colorado.edu/cs/academics/graduate-programs/professional-masters-computer-science/degree-requirements",
  mscsRequirements:
    "https://www.colorado.edu/cs/current-students/graduate-students/master-science-computer-science/master-science-computer-science",
  breadth: "https://www.colorado.edu/cs/academics/graduate-programs/breadth-courses",
  projects:
    "https://www.colorado.edu/cs/professional-masters-computer-science-mscps-projects-requirement",
  petition: "https://forms.gle/SHH9HzFdZuXB7Rux9",
  degreeChange:
    "https://docs.google.com/forms/d/e/1FAIpQLSeaEmNoQcnHF2ZE2bhefGblxx5JXkk7ClXjAdvhID12xiR6oQ/viewform",
  formsPolicies: "https://www.colorado.edu/cs/students/graduate-students/forms-policies",
  gradStudents: "https://www.colorado.edu/cs/students/graduate-students",
  degreeAudit: "https://www.colorado.edu/registrar/students/degree-planning/audit/run",
  csci6930:
    "https://www.colorado.edu/cs/graduate-students/computer-science-professional-internship-class-csci-6930",
  enrollmentStatus: "https://www.colorado.edu/registrar/students/records/info/enrollment-status",
  transferCredits:
    "https://www.colorado.edu/graduateschool/academics/forms-current-students/transfer-credit-request-and-degree-audit-applicability",
  applyToGraduate: "https://www.colorado.edu/registrar/students/graduation",
  gradDeadlines:
    "https://www.colorado.edu/graduateschool/academics/graduation-requirements/masters-graduation-information/deadlines-masters-degree",
  nonThesisPlan:
    "https://www.colorado.edu/graduateschool/academics/graduation-requirements/masters-graduation-information/non-thesis-plan",
  candidacy: "https://www.colorado.edu/graduateschool/academics/forms-current-students",
  bamRegistrar: "https://www.colorado.edu/registrar/students/degree-planning/bam-program",
  bamCs:
    "https://www.colorado.edu/cs/academics/undergraduate-programs/accelerated-masters-programs/computer-science-accelerated-masters-0",
  bamIntentForm:
    "https://portal.prod.cu.edu/psc/epprod/UCB2/ENTP/s/WEBLIB_CU_EFORM.ISCRIPT1.FieldFormula.IScript_Populate_eForm?form=UCB_STUDENT_BAM",
  bamApplication: "https://forms.gle/EsaRTE3KwDNBFSWJ8",
  dualCs: "https://www.colorado.edu/cs/dual-professional-ms-engineering-management",
  dualEmen:
    "https://www.colorado.edu/emp/graduate-programs/dual-graduate-degrees/computer-science-me-em-dual-degrees",
  nonCsPhd:
    "https://www.colorado.edu/cs/students/graduate-students/forms-policies/earning-cs-ms-non-cs-phd-student",
  isssFinalSemester:
    "https://www.colorado.edu/isss/students/current-students/information-all-international-students/your-final-semester",
};

// Shared FAQ tab — MSCPS sheet "Tab 5" plus the MS CS sheet FAQ rows.
const faqItems = [
  {
    title: "What is a subplan? Is it added automatically?",
    description:
      "A subplan is an optional enhancement to the Professional MS in Computer Science that lets you demonstrate expertise in a sub-field. You may declare exactly one. It appears on your transcript (for example, “Specialization in Artificial Intelligence”) but not on your diploma. Subplans are NOT added automatically — you must officially declare yours.",
    url: links.mscpsRequirements,
  },
  {
    title: "How many courses does a subplan require?",
    description:
      "Four courses (12 credit hours) from the subplan list, each with a B or higher. Courses may double-count toward your BIN or elective requirements.",
    url: links.mscpsRequirements,
  },
  {
    title: "Where do I find the official breadth (BIN) course lists?",
    description:
      "Use the department breadth requirements page to confirm the current BIN 1, BIN 2, and BIN 3 options before you finalize your plan.",
    url: links.breadth,
  },
  {
    title: "How many credits may be outside computer science?",
    description:
      "No more than 6 credit hours (2 classes) may be outside the CS Department. Any course number that is not CSCI or CYBR counts as non-CS.",
    url: links.mscpsRequirements,
  },
  {
    title: "Can I waive the Projects requirement?",
    description:
      "Sometimes. Waivers must be approved BEFORE you start the Projects coursework — waiting until courses have started is too late. Waiving Projects means completing 6 additional elective credit hours instead.",
    url: links.projects,
  },
  {
    title: "Can I transfer a course into the degree?",
    description:
      "No more than 9 credit hours (3 courses) may be transferred, including courses taken as a non-degree seeking student at CU Boulder. Courses applied to a previously earned degree are not eligible. Transfer work must be graduate-level with a B or higher; coursework older than five years may need further departmental review.",
    url: links.transferCredits,
  },
  {
    title: "Where can I find Graduate School forms and deadlines?",
    description:
      "Use the Graduate School website for registration status, candidacy, and graduation deadlines.",
    url: links.nonThesisPlan,
  },
  {
    title: "Where can I find Computer Science forms?",
    description:
      "Degree requirements, forms, policies, petitions, and course information are on the CS Graduate Student homepage.",
    url: links.gradStudents,
  },
  {
    title: "How do I run a degree audit?",
    description:
      "Use the Registrar's degree audit tool to see your official progress and to verify a declared subplan. This tracker is a planning aid, not an official audit.",
    url: links.degreeAudit,
  },
  {
    title: "What counts as full-time vs. part-time enrollment?",
    description:
      "Check the Registrar's enrollment status grid to confirm the credit hours needed for full-time or part-time status each term.",
    url: links.enrollmentStatus,
  },
  {
    title: "How do I book Daniel's drop-ins?",
    description:
      "Daniel's drop-ins are the best place for course planning, subplan forms, internship course questions, and deadlines.",
    url: links.advisor,
  },
];

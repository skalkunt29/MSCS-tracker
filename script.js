/* ------------------------------------------------------------------
   Tab wiring, per-pathway requirement logic, and rendering.
   Course lists, links, and FAQ copy live in data.js.
   ------------------------------------------------------------------ */

/* ---------- Term helpers -------------------------------------------------
   CU Boulder term codes: 2 + two-digit year + season digit
   (Spring = 1, Summer = 4, Fall = 7). Fall 2024 -> 2247, Summer 2026 -> 2264.
   ---------------------------------------------------------------------- */

const SEASON_DIGIT = { Spring: 1, Summer: 4, Fall: 7 };
const SEASON_ORDER = ["Spring", "Summer", "Fall"];

function termCode(term) {
  if (!term) return null;
  const [season, year] = term.split(" ");
  if (!SEASON_DIGIT[season] || !year) return null;
  return 2000 + (Number(year) % 100) * 10 + SEASON_DIGIT[season];
}

function termDelta(fromTerm, toTerm) {
  const from = termCode(fromTerm);
  const to = termCode(toTerm);
  if (from === null || to === null) return 0;
  return to - from;
}

function addYears(term, years) {
  if (!term) return "";
  const [season, year] = term.split(" ");
  return `${season} ${Number(year) + years}`;
}

function buildTerms(startTerm, endTerm, includeSummer) {
  const [startSeason, startYear] = startTerm.split(" ");
  const endCode = termCode(endTerm);
  const terms = [];
  let year = Number(startYear);
  let index = SEASON_ORDER.indexOf(startSeason);

  while (year < Number(startYear) + 20) {
    const season = SEASON_ORDER[index];
    const term = `${season} ${year}`;
    if (termCode(term) > endCode) break;
    if (includeSummer || season !== "Summer") terms.push(term);
    index += 1;
    if (index === SEASON_ORDER.length) {
      index = 0;
      year += 1;
    }
  }

  return terms;
}

// Entry terms are Fall/Spring only; "current term" and BAM start terms include summers.
const ENTRY_TERMS = buildTerms("Fall 2024", "Fall 2031", false);
const ALL_TERMS = buildTerms("Fall 2024", "Fall 2031", true);
const CURRENT_TERMS = buildTerms("Summer 2026", "Fall 2031", true);

// BAM students must start graduate coursework within three terms (summers included).
function nextThreeTerms(term) {
  const index = ALL_TERMS.indexOf(term);
  if (index === -1) return CURRENT_TERMS;
  return ALL_TERMS.slice(index + 1, index + 4);
}

/* ---------- Shared requirement pieces ---------------------------------- */

const PROJECTS_GATE_NOTE =
  "The Projects sequence opens one full academic year after your entry term. Update your Entry Term and Current Term above once you reach it.";

function projectsUnlocked(state) {
  return termDelta(state.entryTerm, state.currentTerm) >= 10;
}

function binsComplete(state) {
  return Boolean(state.bin1 && state.bin2 && state.bin3);
}

function subplanCourses(state) {
  const plan = subplans.find((item) => item.value === state.subplan);
  return plan ? plan.courses : [];
}

function subplanSelectedCount(state) {
  return (state.subplanCourses || []).length;
}

function hasSubplan(state) {
  return state.subplan !== GENERAL_TRACK;
}

function projectsWaived(state) {
  return state.projects === PROJECTS_WAIVER;
}

function subplanOption(value) {
  const plan = subplans.find((item) => item.value === value);
  return plan ? plan.label : value;
}

const BIN_NOTE =
  "Must be completed with a B or higher. A grade of C, C+, or B- lets the course count toward Electives only.";

const ELECTIVE_NOTE =
  "Your cumulative GPA must stay at or above 3.00. No more than 6 credit hours (2 courses) may be non-CSCI. Exactly 3 credit hours of CSCI 6930 may count as an Elective — no more, no less.";

const WAIVER_NOTE =
  "Waiving the Projects requirement means completing six additional elective credit hours instead.";

function binRows() {
  return [
    {
      key: "bin1",
      label: "Breadth — BIN 1 (3 cr)",
      requirement: BIN_NOTE,
      input: { type: "select", options: binCourses.bin1, placeholder: "Select a BIN 1 course" },
      credits: (state) => (state.bin1 ? 3 : 0),
    },
    {
      key: "bin2",
      label: "Breadth — BIN 2 (3 cr)",
      requirement: BIN_NOTE,
      input: { type: "select", options: binCourses.bin2, placeholder: "Select a BIN 2 course" },
      credits: (state) => (state.bin2 ? 3 : 0),
    },
    {
      key: "bin3",
      label: "Breadth — BIN 3 (3 cr)",
      requirement: BIN_NOTE,
      input: { type: "select", options: binCourses.bin3, placeholder: "Select a BIN 3 course" },
      credits: (state) => (state.bin3 ? 3 : 0),
    },
  ];
}

function subplanRows() {
  return [
    {
      key: "subplanDeclared",
      label: "Subplan officially declared",
      requirement:
        "Subplans are never added automatically. Submit the MS Degree Change Request to add, swap, or remove a subplan, then verify it in the degree audit tool.",
      visible: hasSubplan,
      input: { type: "checkbox" },
    },
    {
      key: "subplanCourses",
      label: "Subplan courses completed (4 courses / 12 cr)",
      requirement:
        "Select every subplan course you have finished with a B or higher. A grade of C, C+, or B- cannot count toward the subplan. Subplan courses may double-count toward your BIN and Elective requirements.",
      visible: hasSubplan,
      input: { type: "multiselect", optionsFor: subplanCourses, goal: SUBPLAN_COURSES_REQUIRED },
      status: (state) => countStatus(subplanSelectedCount(state), SUBPLAN_COURSES_REQUIRED),
    },
    {
      key: "subplanRemaining",
      label: "Subplan courses remaining",
      requirement: "Four subplan courses are required to have the specialization posted to your transcript.",
      visible: hasSubplan,
      input: {
        type: "readout",
        valueFor: (state) =>
          `${Math.max(0, SUBPLAN_COURSES_REQUIRED - subplanSelectedCount(state))} remaining`,
      },
      status: (state) =>
        subplanSelectedCount(state) >= SUBPLAN_COURSES_REQUIRED ? "Completed" : "Incomplete",
    },
  ];
}

function projectsRow(overrides = {}) {
  return Object.assign(
    {
      key: "projects",
      label: "Projects Courses (6 cr)",
      requirement:
        "BOTH courses in one sequence must be completed with a B or higher. You may not mix courses across the two sequences.",
      input: { type: "select", options: projectsOptions, placeholder: "Select a Projects sequence" },
      enabled: projectsUnlocked,
      lockedNote: () => PROJECTS_GATE_NOTE,
      status: (state) => {
        if (projectsWaived(state)) return "Waived";
        if (state.projects) return "Completed";
        return projectsUnlocked(state) ? "Eligible" : "Not eligible";
      },
      credits: (state) => (state.projects && !projectsWaived(state) ? 6 : 0),
    },
    overrides
  );
}

/* ---------- Track definitions ------------------------------------------ */

const commonResources = [
  { label: "Run a degree audit", url: links.degreeAudit },
  { label: "Breadth (BIN) requirement", url: links.breadth },
  { label: "CSCI 6930 professional internship", url: links.csci6930 },
  { label: "CS graduate forms & policies", url: links.formsPolicies },
  { label: "Full-time / part-time status", url: links.enrollmentStatus },
  { label: "Transfer of credits", url: links.transferCredits },
];

const mscpsResources = [
  { label: "MSCPS degree requirements", url: links.mscpsRequirements },
  { label: "MSCPS Projects requirement", url: links.projects },
].concat(commonResources);

const graduationNote = {
  title: "Final semester & graduation",
  deadline: "Apply early in your final semester",
  forms: [
    { label: "BuffPortal Application to Graduate", url: links.applyToGraduate },
    { label: "Graduate School Candidacy Application", url: links.candidacy },
  ],
  instructions: [
    "Submit both forms by the posted deadlines for master's graduating students.",
    "Run a degree audit before your final semester to confirm every requirement is satisfied.",
    "International students should review the ISSS final semester guidance.",
  ],
  links: [
    { label: "Graduation deadlines", url: links.gradDeadlines },
    { label: "ISSS: your final semester", url: links.isssFinalSemester },
    { label: "Run a degree audit", url: links.degreeAudit },
  ],
};

const subplanNote = {
  title: "Subplan requirements",
  deadline: "Required for graduation once declared",
  forms: [{ label: "MS Degree Change Request", url: links.degreeChange }],
  instructions: [
    "All students must complete their subplan requirements to graduate, even if the rest of the degree is finished.",
    "Subplans are not added automatically — declare yours officially.",
    "You may complete at most one subplan.",
  ],
  links: [
    { label: "MSCPS degree requirements", url: links.mscpsRequirements },
    { label: "MS Degree Change Request", url: links.degreeChange },
  ],
};

const breadthNote = {
  title: "Breadth (BIN) requirement",
  deadline: "Strongly recommended before your final semester",
  forms: [{ label: "None" }],
  instructions: [
    "Full-time students should finish all three BIN courses within their first year (2 semesters).",
    "Part-time students should finish the BINs within their first fifteen credit hours (about 5 courses).",
    "Confirm current BIN lists before you register — offerings change by term.",
  ],
  links: [{ label: "Breadth (BIN) course list", url: links.breadth }],
};

const waiverNote = {
  title: "Waiving the Projects",
  deadline: "Approval required before the coursework starts",
  forms: [{ label: "CS Graduate Petition Form", url: links.petition }],
  instructions: [
    "Get approval for a Projects waiver BEFORE starting the Projects coursework. Waiting until courses have started is too late and waivers will not be approved.",
    "An approved waiver replaces the 6 Projects credits with 6 additional elective credit hours.",
  ],
  links: [
    { label: "MSCPS Projects requirement", url: links.projects },
    { label: "CS Graduate Petition Form", url: links.petition },
  ],
};

const tracks = [
  /* -------------------------------------------------- MS in CS (research) */
  {
    id: "mscs",
    group: "mscs",
    label: "MS in Computer Science",
    title: "MS in Computer Science (MSCS)",
    blurb:
      "30 credits: 3 credits of professional development, 9 credits of breadth (BIN) coursework, 6 credits of research coursework, and 12 elective credits.",
    goal: 30,
    advisor: { name: "Meagan", url: links.advisorMscs },
    state: {
      isBam: false,
      isNonCsPhd: false,
      pace: "Full-time",
      bamContinuation: false,
      bamSupplement: false,
      bamCredits: "0 courses",
      pd5000: false,
      pd5100: false,
      pdExtra: false,
      bin1: "",
      bin2: "",
      bin3: "",
      research: "",
      electives: 0,
    },
    plan: [
      {
        key: "isBam",
        label: "Are you in the Computer Science Bachelor's-Accelerated Master's (BAM) program?",
        type: "checkbox",
        boxLabel: "BAM student",
      },
      {
        key: "isNonCsPhd",
        label: "Are you pursuing the MSCS as a non-CS PhD student?",
        type: "checkbox",
        boxLabel: "Non-CS PhD student",
      },
      {
        key: "pace",
        label: "Are you pursuing the degree full-time or part-time?",
        type: "choice",
        options: paceOptions,
        note: "Drives the recommended timeline below.",
      },
    ],
    groups: [
      {
        title: "Bachelor's-Accelerated Master's (BAM)",
        visible: (state) => state.isBam,
        rows: [
          {
            key: "bamContinuation",
            label: "Master's Continuation Form",
            requirement:
              "Submit during the final semester of your undergraduate degree. Re-submit if you need to change your start term.",
            input: { type: "checkbox" },
          },
          {
            key: "bamSupplement",
            label: "BAM Supplement Form",
            requirement:
              "Identifies which courses double-count for the bachelor's degree and which apply to the master's degree.",
            input: { type: "checkbox" },
          },
          {
            key: "bamCredits",
            label: "Credit hours counting toward the master's degree",
            requirement:
              "Up to 4 courses (12–13 credit hours) of graduate coursework taken as an undergraduate may apply to the MS.",
            input: {
              type: "select",
              options: ["0 courses", "1 course", "2 courses", "3 courses", "4 courses (max 12/13 hours)"],
              placeholder: "Select a count",
            },
            status: (state) =>
              state.bamCredits === "4 courses (max 12/13 hours)" ? "Completed" : "In progress",
          },
        ],
      },
      {
        title: "Professional Development (3 cr)",
        rows: [
          {
            key: "pd5000",
            label: "CSCI 5000 Professional Development (1 cr)",
            requirement: "Take during your first Fall semester in the program.",
            input: { type: "checkbox" },
            credits: (state) => (state.pd5000 ? 1 : 0),
          },
          {
            key: "pd5100",
            label: "CSCI 5100 Professional Development (1 cr)",
            requirement: "Second required professional development credit.",
            input: { type: "checkbox" },
            credits: (state) => (state.pd5100 ? 1 : 0),
          },
          {
            key: "pdExtra",
            label: "CSCI 5100 again, or another 1-credit professional development course (1 cr)",
            requirement: "Third professional development credit. Confirm approved options with your advisor.",
            input: { type: "checkbox" },
            credits: (state) => (state.pdExtra ? 1 : 0),
          },
        ],
      },
      {
        title: "Breadth (BIN) Requirement (9 cr)",
        rows: binRows(),
      },
      {
        title: "Research & Electives (18 cr)",
        rows: [
          {
            key: "research",
            label: "Research Courses (6 cr)",
            requirement:
              "BOTH courses in one sequence must be completed with a B or higher. Choose one sequence — you may not mix the two.",
            input: {
              type: "select",
              options: researchOptions,
              placeholder: "Select a research sequence",
            },
            credits: (state) => (state.research ? 6 : 0),
          },
          {
            key: "electives",
            label: "Elective credit hours (12 cr)",
            requirement: ELECTIVE_NOTE,
            input: {
              type: "number",
              max: 12,
              caption: "Add the number of elective credits you have completed. 12 are required.",
            },
            status: (state) => countStatus(state.electives, 12),
            credits: (state) => Math.min(state.electives, 12),
          },
        ],
      },
    ],
    breakdown(state) {
      const pd = Number(state.pd5000) + Number(state.pd5100) + Number(state.pdExtra);
      const bins = (state.bin1 ? 3 : 0) + (state.bin2 ? 3 : 0) + (state.bin3 ? 3 : 0);
      const research = state.research ? 6 : 0;
      const electives = Math.min(state.electives, 12);
      return `Professional Development ${pd}/3 · Breadth ${bins}/9 · Research ${research}/6 · Electives ${electives}/12`;
    },
    deadlines: () => [],
    notes(state) {
      const items = [];

      if (state.isBam) {
        items.push({
          title: "BAM transition to graduate status",
          deadline: "By the posted deadline of your final undergraduate semester",
          forms: [
            { label: "Master's Continuation Form", url: links.bamRegistrar },
            { label: "BAM Supplement Form", url: links.bamRegistrar },
          ],
          instructions: [
            "February 1 if you graduate in Spring, March 1 if you graduate in Summer, October 1 if you graduate in Fall.",
            "Complete the breadth requirement before you finish your undergraduate degree.",
            "Research courses are typically taken in your first Fall semester in graduate status.",
          ],
          links: [
            { label: "BAM program (Registrar)", url: links.bamRegistrar },
            { label: "CS accelerated master's programs", url: links.bamCs },
          ],
        });
      }

      if (state.isNonCsPhd) {
        items.push({
          title: "MSCS as a non-CS PhD student",
          deadline: "Breadth first, then the research courses",
          forms: [{ label: "Application materials — see the CS policy page", url: links.nonCsPhd }],
          instructions: [
            "Complete the breadth requirement, and no more than 15 credit hours of applicable coursework, before officially joining the MSCS program.",
            "Take the research courses during your first Fall semester after officially joining.",
          ],
          links: [{ label: "Earning a CS MS as a non-CS PhD student", url: links.nonCsPhd }],
        });
      }

      items.push({
        title: "Professional development requirement",
        deadline: "CSCI 5000 by your first Fall semester in the program",
        forms: [{ label: "None" }],
        instructions: [
          "CSCI 5000 is expected in your first Fall semester.",
          "The remaining two professional development credits can follow in later terms.",
        ],
        links: [{ label: "MSCS degree requirements", url: links.mscsRequirements }],
      });

      items.push({
        title: "Breadth (BIN) requirement",
        deadline:
          state.pace === "Part-time"
            ? "Within your first 3–4 semesters, before you attempt the research courses"
            : "Within your first 2 semesters, before your final semester",
        forms: [{ label: "None" }],
        instructions: [
          "No department form is required. Complete one approved breadth course from each BIN list with a B or higher.",
          state.isBam
            ? "BAM students should finish the breadth requirement before completing their undergraduate degree."
            : "Confirm current BIN offerings before you register.",
        ],
        links: [
          { label: "Breadth (BIN) course list", url: links.breadth },
          { label: "MSCS degree requirements", url: links.mscsRequirements },
        ],
      });

      items.push({
        title: "Research courses",
        deadline:
          state.pace === "Part-time"
            ? "After the BINs, recommended after at least 15 credit hours"
            : "During your second year",
        forms: [{ label: "None" }],
        instructions: [
          "Both courses in one sequence must be completed with a B or higher.",
          "Choose Thesis (CSCI 6950) or Independent Study (CSCI 5900) — you may not take courses from both options.",
        ],
        links: [
          { label: "MSCS degree requirements", url: links.mscsRequirements },
          { label: "CSEN independent study guidelines", url: links.formsPolicies },
        ],
      });

      items.push(graduationNote);
      return items;
    },
    resources: [
      { label: "MSCS degree requirements", url: links.mscsRequirements },
      { label: "Computer Science BAM requirements", url: links.bamCs },
      { label: "MSCS as a non-CS PhD student", url: links.nonCsPhd },
    ].concat(commonResources),
  },

  /* --------------------------------------------------- MSCPS (standard) */
  {
    id: "mscps",
    group: "mscps",
    label: "Standard MSCPS",
    title: "Professional MS in Computer Science (MSCPS)",
    blurb:
      "30 credits: 9 credits of breadth (BIN) coursework, 6 credits of Projects, and 15 elective credits. Waiving the Projects adds 6 more elective credits.",
    goal: 30,
    advisor: { name: "Daniel", url: links.advisor },
    state: {
      subplan: GENERAL_TRACK,
      entryTerm: "Fall 2025",
      currentTerm: "Fall 2026",
      bin1: "",
      bin2: "",
      bin3: "",
      projects: "",
      electives: 0,
      extraElectives: 0,
      subplanDeclared: false,
      subplanCourses: [],
    },
    plan: [
      {
        key: "subplan",
        label: "Choose your MSCPS subplan",
        type: "subplan",
        note: "You are in the General Track by default. You may complete at most one subplan, and it must be officially declared.",
      },
      { key: "entryTerm", label: "Entry Term", type: "select", options: ENTRY_TERMS },
      { key: "currentTerm", label: "Current Term", type: "select", options: CURRENT_TERMS },
    ],
    groups: [
      { title: "MSCPS Degree Requirements", rows: binRows().concat([projectsRow()]) },
      {
        title: "Electives",
        rows: [
          {
            key: "electives",
            label: "Elective credit hours (15 cr)",
            requirement: ELECTIVE_NOTE,
            input: {
              type: "number",
              max: 15,
              caption: "Add the number of elective credits you have completed. 15 are required.",
            },
            status: (state) => countStatus(state.electives, 15),
            credits: (state) => Math.min(state.electives, 15),
          },
          {
            key: "extraElectives",
            label: "Additional elective credit hours (6 cr)",
            requirement: WAIVER_NOTE,
            visible: projectsWaived,
            input: {
              type: "number",
              max: 6,
              caption: "Required only when the Projects requirement is waived.",
            },
            status: (state) => countStatus(state.extraElectives, 6),
            credits: (state) => (projectsWaived(state) ? Math.min(state.extraElectives, 6) : 0),
          },
        ],
      },
      { title: "Subplan Requirements", visible: hasSubplan, rows: subplanRows() },
    ],
    breakdown(state) {
      const bins = (state.bin1 ? 3 : 0) + (state.bin2 ? 3 : 0) + (state.bin3 ? 3 : 0);
      const projects = state.projects && !projectsWaived(state) ? 6 : 0;
      const electives = Math.min(state.electives, 15);
      const extra = projectsWaived(state) ? Math.min(state.extraElectives, 6) : 0;
      const base = `Breadth ${bins}/9 · Projects ${projects}/6 · Electives ${electives}/15`;
      return projectsWaived(state) ? `${base} · Waiver electives ${extra}/6` : base;
    },
    deadlines: (state) => [
      {
        kicker: "Complete all course requirements",
        value: addYears(state.entryTerm, 4),
        note: "Four years after your first graduate term.",
      },
      hasSubplan(state)
        ? {
            kicker: "Complete subplan requirements",
            value: addYears(state.entryTerm, 4),
            note: `${subplanOption(state.subplan)} — four courses, B or higher.`,
          }
        : null,
      {
        kicker: "Projects sequence opens",
        value: projectsUnlocked(state) ? "Now eligible" : addYears(state.entryTerm, 1),
        note: "One full academic year after your entry term.",
      },
    ],
    notes(state) {
      const items = [
        breadthNote,
        {
          title: "Projects requirement",
          deadline: "After at least one academic year in the program",
          forms: [{ label: "None" }],
          instructions: [
            "All students must complete at least one academic year (2 semesters) before enrolling in the Projects courses.",
            "Full-time students start the Projects in the Fall of their second year.",
            "Part-time students are encouraged to take these as their final courses, and should finish the BINs plus at least 15 credit hours first.",
          ],
          links: [
            { label: "MSCPS Projects requirement", url: links.projects },
            { label: "MSCPS degree requirements", url: links.mscpsRequirements },
          ],
        },
        waiverNote,
      ];
      if (hasSubplan(state)) items.push(subplanNote);
      items.push(graduationNote);
      return items;
    },
    resources: mscpsResources,
  },

  /* -------------------------------------------------------- MSCPS + BAM */
  {
    id: "bam",
    group: "mscps",
    label: "BAM",
    title: "MSCPS — Bachelor's-Accelerated Master's",
    blurb:
      "The 30-credit MSCPS, plus the BAM forms and the undergraduate coursework you carry into graduate status.",
    goal: 30,
    advisor: { name: "Daniel", url: links.advisor },
    state: {
      subplan: GENERAL_TRACK,
      finalUgTerm: "Spring 2026",
      entryTerm: "Fall 2026",
      currentTerm: "Fall 2026",
      bamContinuation: false,
      bamSupplement: false,
      ugProjects: "None of the above",
      bamCredits: "0 courses (0 hrs)",
      bin1: "",
      bin2: "",
      bin3: "",
      projects: "",
      electives: 0,
      extraElectives: 0,
      subplanDeclared: false,
      subplanCourses: [],
    },
    plan: [
      {
        key: "subplan",
        label: "Choose your MSCPS subplan",
        type: "subplan",
        note: "You are in the General Track by default. You may complete at most one subplan.",
      },
      { key: "finalUgTerm", label: "Final Undergraduate Term", type: "select", options: ENTRY_TERMS },
      {
        key: "entryTerm",
        label: "Entry Term (first term in graduate status)",
        type: "select",
        optionsFor: (state) => nextThreeTerms(state.finalUgTerm),
        note: "BAM students must begin graduate coursework within three terms of finishing the bachelor's degree, summers included. Re-submit the Continuation Form to change your start term.",
      },
      { key: "currentTerm", label: "Current Term", type: "select", options: CURRENT_TERMS },
    ],
    groups: [
      {
        title: "BAM Requirements",
        rows: [
          {
            key: "bamContinuation",
            label: "Master's Continuation Form",
            requirement: "Re-submit this form if you need to update your start term.",
            input: { type: "checkbox" },
          },
          {
            key: "bamSupplement",
            label: "BAM Supplement Form",
            requirement:
              "Identifies which courses double-count for the bachelor's degree and which apply to the master's degree.",
            input: { type: "checkbox" },
          },
          {
            key: "ugProjects",
            label: "Undergraduate Projects sequence completed at CU Boulder",
            requirement:
              "Completing one of these sequences with a B or higher in BOTH courses automatically waives the MSCPS Projects requirement.",
            input: {
              type: "select",
              options: bamUndergradProjects,
              placeholder: "Select a sequence",
            },
            status: (state) =>
              state.ugProjects === "None of the above" ? "Projects required" : "Projects waived",
          },
          {
            key: "bamCredits",
            label: "Credit hours counting toward the master's degree",
            requirement: "A maximum of 4 courses (12–13 credit hours) may carry into the MS.",
            input: { type: "select", options: bamCreditOptions, placeholder: "Select a count" },
            status: (state) =>
              state.bamCredits === "4 courses (max 12/13 hrs)" ? "Maximum" : "In progress",
          },
        ],
      },
      {
        title: "MSCPS Degree Requirements",
        rows: binRows().concat([
          projectsRow({
            requirement:
              "BOTH courses in one sequence must be completed with a B or higher. If your undergraduate Projects sequence was approved above, this requirement is already waived.",
            enabled: (state) => projectsUnlocked(state) && !bamAutoWaiver(state),
            lockedNote: (state) =>
              bamAutoWaiver(state)
                ? "Automatically waived by your undergraduate Projects sequence. Complete 6 additional elective credit hours instead."
                : "BAM students who have already spent a year in the BAM program as an undergraduate do not need to wait — confirm with your advisor.",
            status: (state) => {
              if (bamAutoWaiver(state)) return "Waived";
              if (projectsWaived(state)) return "Waived";
              if (state.projects) return "Completed";
              return projectsUnlocked(state) ? "Eligible" : "Not eligible";
            },
            credits: (state) =>
              !bamAutoWaiver(state) && state.projects && !projectsWaived(state) ? 6 : 0,
          }),
        ]),
      },
      {
        title: "Electives",
        rows: [
          {
            key: "electives",
            label: "Elective credit hours (15 cr)",
            requirement: ELECTIVE_NOTE,
            input: {
              type: "number",
              max: 15,
              caption: "Add the number of elective credits you have completed. 15 are required.",
            },
            status: (state) => countStatus(state.electives, 15),
            credits: (state) => Math.min(state.electives, 15),
          },
          {
            key: "extraElectives",
            label: "Additional elective credit hours (6 cr)",
            requirement: WAIVER_NOTE,
            visible: (state) => bamAutoWaiver(state) || projectsWaived(state),
            input: {
              type: "number",
              max: 6,
              caption: "Required only when the Projects requirement is waived.",
            },
            status: (state) => countStatus(state.extraElectives, 6),
            credits: (state) =>
              bamAutoWaiver(state) || projectsWaived(state) ? Math.min(state.extraElectives, 6) : 0,
          },
        ],
      },
      { title: "Subplan Requirements", visible: hasSubplan, rows: subplanRows() },
    ],
    breakdown(state) {
      const bins = (state.bin1 ? 3 : 0) + (state.bin2 ? 3 : 0) + (state.bin3 ? 3 : 0);
      const waived = bamAutoWaiver(state) || projectsWaived(state);
      const projects = !waived && state.projects ? 6 : 0;
      const electives = Math.min(state.electives, 15);
      const extra = waived ? Math.min(state.extraElectives, 6) : 0;
      const base = `Breadth ${bins}/9 · Projects ${projects}/6 · Electives ${electives}/15`;
      return waived ? `${base} · Waiver electives ${extra}/6` : base;
    },
    deadlines: (state) => [
      {
        kicker: "Latest graduate start term",
        value: nextThreeTerms(state.finalUgTerm).slice(-1)[0] || "—",
        note: "Three terms after your final undergraduate term, summers included.",
      },
      {
        kicker: "Complete all course requirements",
        value: addYears(state.entryTerm, 4),
        note: "Four years after your first graduate term.",
      },
      hasSubplan(state)
        ? {
            kicker: "Complete subplan requirements",
            value: addYears(state.entryTerm, 4),
            note: `${subplanOption(state.subplan)} — four courses, B or higher.`,
          }
        : null,
    ],
    notes(state) {
      const items = [
        {
          title: "BAM transition to graduate status",
          deadline: "By the posted deadline of your final undergraduate semester",
          forms: [
            { label: "Master's Continuation Form", url: links.bamRegistrar },
            { label: "BAM Supplement Form", url: links.bamRegistrar },
          ],
          instructions: [
            "February 1 if you graduate in Spring, March 1 if you graduate in Summer, October 1 if you graduate in Fall.",
            "Re-submit the Continuation Form if your start term changes.",
          ],
          links: [
            { label: "BAM program (Registrar)", url: links.bamRegistrar },
            { label: "CS accelerated master's programs", url: links.bamCs },
            { label: "Graduate School BAM Intent Form", url: links.bamIntentForm },
          ],
        },
        breadthNote,
        {
          title: "Projects requirement",
          deadline: "Often waived for BAM students",
          forms: [{ label: "CS Graduate Petition Form", url: links.petition }],
          instructions: [
            "Most BAM CS students waive the Projects by completing the undergraduate equivalent: CSCI 4308 & 4318, CSCI 4348 & 4358, or CSCI 4368 & 4378 with a B or higher in BOTH courses.",
            "Otherwise the Projects are required, and full-time students typically complete them during their first year in graduate status.",
            "BAM students who have spent at least a year in the BAM program as an undergraduate do not need to wait a full academic year.",
            "Part-time students should finish the BINs and at least 15 credit hours first.",
          ],
          links: [
            { label: "MSCPS Projects requirement", url: links.projects },
            { label: "CS Graduate Petition Form", url: links.petition },
          ],
        },
      ];
      if (hasSubplan(state)) items.push(subplanNote);
      items.push(graduationNote);
      return items;
    },
    resources: [
      { label: "Computer Science BAM requirements", url: links.bamCs },
      { label: "BAM program (Registrar)", url: links.bamRegistrar },
      { label: "Graduate School BAM Intent Form", url: links.bamIntentForm },
    ].concat(mscpsResources),
  },

  /* ------------------------------------------------ MSCPS + EMEN (dual) */
  {
    id: "dual",
    group: "mscps",
    label: "Dual Degree (EMEN)",
    title: "MSCPS / Engineering Management Dual Degree",
    blurb:
      "45 credits total: 24 credits of Computer Science coursework and 21 credits of Engineering Management coursework. Six approved EMEN credits also count toward the 30-credit MSCPS candidacy.",
    goal: 45,
    advisor: { name: "Daniel", url: links.advisor },
    state: {
      subplan: GENERAL_TRACK,
      entryTerm: "Fall 2025",
      currentTerm: "Fall 2026",
      bin1: "",
      bin2: "",
      bin3: "",
      projects: "",
      csElectives: 0,
      extraElectives: 0,
      emen5015: false,
      emen5020: false,
      emenChoice: "",
      emen5050: false,
      emenElectives: 0,
      subplanDeclared: false,
      subplanCourses: [],
    },
    plan: [
      {
        key: "subplan",
        label: "Choose your MSCPS subplan",
        type: "subplan",
        note: "You are in the General Track by default. You may complete at most one subplan.",
      },
      {
        key: "entryTerm",
        label: "Entry Term",
        type: "select",
        options: ENTRY_TERMS,
        note: "Admitted or enrolled MSCPS students must separately apply internally and be admitted to the Engineering Management program.",
      },
      { key: "currentTerm", label: "Current Term", type: "select", options: CURRENT_TERMS },
    ],
    groups: [
      {
        title: "Computer Science Requirements (24 cr)",
        rows: binRows().concat([
          projectsRow({
            requirement:
              "BOTH courses in one sequence must be completed with a B or higher. Finishing the BIN courses first is recommended — the Projects are usually your last CSCI courses — but CSCI electives can run alongside your BINs.",
          }),
          {
            key: "csElectives",
            label: "CSCI elective credit hours (9 cr)",
            requirement:
              "Your cumulative GPA must stay at or above 3.00. Exactly 3 credit hours of CSCI 6930 may count as an Elective — no more, no less.",
            input: {
              type: "number",
              max: 9,
              caption: "Add the number of CSCI elective credits you have completed. 9 are required.",
            },
            status: (state) => countStatus(state.csElectives, 9),
            credits: (state) => Math.min(state.csElectives, 9),
          },
          {
            key: "extraElectives",
            label: "Additional CSCI elective credit hours (6 cr)",
            requirement: WAIVER_NOTE,
            visible: projectsWaived,
            input: {
              type: "number",
              max: 6,
              caption: "Required only when the Projects requirement is waived.",
            },
            status: (state) => countStatus(state.extraElectives, 6),
            credits: (state) => (projectsWaived(state) ? Math.min(state.extraElectives, 6) : 0),
          },
          {
            key: "emenSharedCredits",
            label: "EMEN credits counting toward MSCPS (6 cr)",
            requirement:
              "Six approved EMEN credits count toward the 30-credit MSCPS candidacy. EMEN 5015 and EMEN 5020 satisfy this by default.",
            input: {
              type: "readout",
              valueFor: (state) => (emenSharedSatisfied(state) ? "Satisfied" : "Not yet satisfied"),
            },
            status: (state) => (emenSharedSatisfied(state) ? "Completed" : "Incomplete"),
          },
        ]),
      },
      {
        title: "Engineering Management Requirements (21 cr)",
        rows: [
          {
            key: "emen5015",
            label: "EMEN 5015 Engineering Communication (3 cr)",
            requirement: "Required EMEN core course. Confirm current requirements with the EMP office.",
            input: { type: "checkbox" },
            credits: (state) => (state.emen5015 ? 3 : 0),
          },
          {
            key: "emen5020",
            label: "EMEN 5020 Finance for Engineering Managers (3 cr)",
            requirement:
              "Required EMEN core course. EMEN students must separately apply through the standard Computer Science admissions process to join the dual-degree option.",
            input: { type: "checkbox" },
            credits: (state) => (state.emen5020 ? 3 : 0),
          },
          {
            key: "emenChoice",
            label: "EMEN 5030 Project Management OR EMEN 5405 Fundamentals of Systems Engineering (3 cr)",
            requirement: "Choose one of the two.",
            input: { type: "select", options: emenChoiceOptions, placeholder: "Select a course" },
            credits: (state) => (state.emenChoice ? 3 : 0),
          },
          {
            key: "emen5050",
            label: "EMEN 5050 Leading Oneself (3 cr)",
            requirement: "Required EMEN core course.",
            input: { type: "checkbox" },
            credits: (state) => (state.emen5050 ? 3 : 0),
          },
          {
            key: "emenElectives",
            label: "Additional EMEN elective credit hours (9 cr)",
            requirement: "Three EMEN elective courses. Confirm approved options with the EMP office.",
            input: {
              type: "number",
              max: 9,
              caption: "Add the number of EMEN elective credits you have completed. 9 are required.",
            },
            status: (state) => countStatus(state.emenElectives, 9),
            credits: (state) => Math.min(state.emenElectives, 9),
          },
        ],
      },
      { title: "Subplan Requirements", visible: hasSubplan, rows: subplanRows() },
    ],
    breakdown(state) {
      const bins = (state.bin1 ? 3 : 0) + (state.bin2 ? 3 : 0) + (state.bin3 ? 3 : 0);
      const projects = state.projects && !projectsWaived(state) ? 6 : 0;
      const cs =
        bins +
        projects +
        Math.min(state.csElectives, 9) +
        (projectsWaived(state) ? Math.min(state.extraElectives, 6) : 0);
      const emen =
        Number(state.emen5015) * 3 +
        Number(state.emen5020) * 3 +
        (state.emenChoice ? 3 : 0) +
        Number(state.emen5050) * 3 +
        Math.min(state.emenElectives, 9);
      return `Computer Science ${cs}/24 · Engineering Management ${emen}/21`;
    },
    deadlines: (state) => [
      {
        kicker: "Complete all MSCPS and EMEN requirements",
        value: addYears(state.entryTerm, 6),
        note: "Six years after your first graduate term.",
      },
      hasSubplan(state)
        ? {
            kicker: "Complete subplan requirements",
            value: addYears(state.entryTerm, 6),
            note: `${subplanOption(state.subplan)} — four courses, B or higher.`,
          }
        : null,
      {
        kicker: "Projects sequence opens",
        value: projectsUnlocked(state) ? "Now eligible" : addYears(state.entryTerm, 1),
        note: "One full academic year after entry, and after all three BINs.",
      },
    ],
    notes(state) {
      const items = [
        {
          title: "Admission to the dual degree",
          deadline: "Apply internally before you begin the second program",
          forms: [{ label: "See the dual-degree pages for current application steps" }],
          instructions: [
            "MSCPS students must separately apply internally and be admitted to the Engineering Management program.",
            "EMEN students must separately apply through the standard Computer Science admissions process.",
            "Your candidacy application lists the 24 CS credits plus 6 approved EMEN credits to reach the 30 credits required for the MSCPS side.",
          ],
          links: [
            { label: "Dual degree — Computer Science requirements", url: links.dualCs },
            { label: "Dual degree — Engineering Management requirements", url: links.dualEmen },
          ],
        },
        breadthNote,
        {
          title: "MSCPS Projects requirement",
          deadline: "Your last CSCI courses",
          forms: [{ label: "None" }],
          instructions: [
            "Complete at least one academic year (2 semesters) before enrolling in the Projects courses.",
            "Finish the BIN requirements before taking the Projects. These should be your last CSCI courses.",
          ],
          links: [
            { label: "MSCPS Projects requirement", url: links.projects },
            { label: "MSCPS degree requirements", url: links.mscpsRequirements },
          ],
        },
        waiverNote,
      ];
      if (hasSubplan(state)) items.push(subplanNote);
      items.push(graduationNote);
      return items;
    },
    resources: [
      { label: "Dual degree — Computer Science requirements", url: links.dualCs },
      { label: "Dual degree — Engineering Management requirements", url: links.dualEmen },
    ].concat(mscpsResources),
  },

  /* ---------------------------------------------- MSCPS as a non-CS PhD */
  {
    id: "nonphd",
    group: "mscps",
    label: "Non-CS PhD",
    title: "MSCPS as a non-CS PhD Student",
    blurb:
      "The 30-credit MSCPS, with the breadth requirement and application materials completed before you officially join the program.",
    goal: 30,
    advisor: { name: "Daniel", url: links.advisor },
    state: {
      subplan: GENERAL_TRACK,
      entryTerm: "Fall 2026",
      currentTerm: "Fall 2026",
      bin1: "",
      bin2: "",
      bin3: "",
      preElectives: 0,
      countingCredits: "3 courses (Bins)",
      lettersOfRec: false,
      resume: false,
      applicationForm: false,
      transcripts: false,
      gpaMscps: false,
      gpaUndergrad: false,
      gpaGraduate: false,
      projects: "",
      electives: 0,
      extraElectives: 0,
      subplanDeclared: false,
      subplanCourses: [],
    },
    plan: [
      {
        key: "subplan",
        label: "Choose your MSCPS subplan",
        type: "subplan",
        note: "You are in the General Track by default. You may complete at most one subplan.",
      },
      {
        key: "entryTerm",
        label: "Entry Term",
        type: "select",
        options: ALL_TERMS,
        note: "If your application decision lands before the Census Date of the application term, the MSCPS can be added that term. After Census Date, it is added the following semester.",
      },
      { key: "currentTerm", label: "Current Term", type: "select", options: CURRENT_TERMS },
    ],
    groups: [
      {
        title: "Pre-Application Requirements",
        rows: binRows().concat([
          {
            key: "preElectives",
            label: "Elective credit hours before joining (max 6 cr)",
            requirement:
              "No more than 15 credit hours may count toward the MSCPS degree before you officially join the program, and no more than 6 of those may be electives.",
            input: {
              type: "number",
              max: 6,
              caption: "Six credit hours is the maximum before you officially join.",
            },
            status: (state) => (state.preElectives >= 6 ? "Maximum" : "In progress"),
          },
        ]),
      },
      {
        title: "Application Requirements",
        rows: [
          {
            key: "countingCredits",
            label: "Credit hours you are counting toward the MSCPS degree",
            requirement: "Five courses is the maximum you may bring into the program.",
            input: { type: "select", options: nonPhdCreditOptions, placeholder: "Select a count" },
            status: (state) =>
              state.countingCredits === nonPhdCreditOptions[2] ? "Maximum" : "In progress",
          },
          {
            key: "lettersOfRec",
            label: "Letters of Recommendation (2)",
            requirement: "Two letters are required with your application.",
            input: { type: "checkbox" },
          },
          {
            key: "resume",
            label: "Resume",
            requirement: "Submitted with your application materials.",
            input: { type: "checkbox" },
          },
          {
            key: "applicationForm",
            label: "Application Form",
            requirement: "Email your completed application to the CS Graduate Team.",
            input: { type: "checkbox" },
          },
          {
            key: "transcripts",
            label: "Copy of official transcripts",
            requirement: "For your undergraduate degree, and your MS degree if applicable.",
            input: { type: "checkbox" },
          },
          {
            key: "gpaMscps",
            label: "GPA of 3.5 or higher in MSCPS courses",
            requirement: "Applies to the graduate coursework you intend to count toward the MSCPS.",
            input: { type: "checkbox" },
          },
          {
            key: "gpaUndergrad",
            label: "Cumulative undergraduate GPA of 3.5 or higher",
            requirement:
              "Includes your CU Boulder undergraduate GPA and any previously earned undergraduate degrees.",
            input: { type: "checkbox" },
          },
          {
            key: "gpaGraduate",
            label: "Cumulative graduate GPA of 3.5 or higher",
            requirement:
              "Includes your CU Boulder graduate GPA and any previously earned graduate degrees.",
            input: { type: "checkbox" },
          },
        ],
      },
      {
        title: "MSCPS Degree Requirements",
        rows: [
          {
            key: "breadthRollup",
            label: "Breadth (BIN) requirement",
            requirement:
              "Rolls up from the three BIN selections above. Required to be completed before applying to the MSCPS program.",
            input: {
              type: "readout",
              valueFor: (state) => (binsComplete(state) ? "All three BINs selected" : "In progress"),
            },
            // Display-only rollup — the BIN credits are already counted above.
            status: (state) => (binsComplete(state) ? "Completed" : "Incomplete"),
          },
          projectsRow(),
          {
            key: "electives",
            label: "Elective credit hours (15 cr)",
            requirement: ELECTIVE_NOTE,
            input: {
              type: "number",
              max: 15,
              caption:
                "Add the number of elective credits you have completed, including the pre-application electives above. 15 are required.",
            },
            status: (state) => countStatus(state.electives, 15),
            credits: (state) => Math.min(state.electives, 15),
          },
          {
            key: "extraElectives",
            label: "Additional elective credit hours (6 cr)",
            requirement: WAIVER_NOTE,
            visible: projectsWaived,
            input: {
              type: "number",
              max: 6,
              caption: "Required only when the Projects requirement is waived.",
            },
            status: (state) => countStatus(state.extraElectives, 6),
            credits: (state) => (projectsWaived(state) ? Math.min(state.extraElectives, 6) : 0),
          },
        ],
      },
      { title: "Subplan Requirements", visible: hasSubplan, rows: subplanRows() },
    ],
    breakdown(state) {
      const bins = (state.bin1 ? 3 : 0) + (state.bin2 ? 3 : 0) + (state.bin3 ? 3 : 0);
      const projects = state.projects && !projectsWaived(state) ? 6 : 0;
      const electives = Math.min(state.electives, 15);
      const extra = projectsWaived(state) ? Math.min(state.extraElectives, 6) : 0;
      const base = `Breadth ${bins}/9 · Projects ${projects}/6 · Electives ${electives}/15`;
      return projectsWaived(state) ? `${base} · Waiver electives ${extra}/6` : base;
    },
    deadlines: (state) => [
      {
        kicker: "Complete all course requirements",
        value: addYears(state.entryTerm, 4),
        note: "Four years after your first term in the MSCPS program.",
      },
      hasSubplan(state)
        ? {
            kicker: "Complete subplan requirements",
            value: addYears(state.entryTerm, 4),
            note: `${subplanOption(state.subplan)} — four courses, B or higher.`,
          }
        : null,
      {
        kicker: "Projects sequence opens",
        value: projectsUnlocked(state) ? "Now eligible" : addYears(state.entryTerm, 1),
        note: "Recommended in your first Fall semester after officially joining.",
      },
    ],
    notes(state) {
      const items = [
        {
          title: "Breadth (BIN) requirement",
          deadline: "Before you apply to the MSCPS program",
          forms: [{ label: "None" }],
          instructions: [
            "The breadth requirement must be completed before you apply to the MSCPS program.",
            "Complete one approved breadth course from each BIN list with a B or higher.",
          ],
          links: [{ label: "Breadth (BIN) course list", url: links.breadth }],
        },
        {
          title: "Projects requirement",
          deadline: "First Fall semester after officially joining",
          forms: [{ label: "None" }],
          instructions: [
            "Non-CS PhD students must complete the breadth requirement and no more than 6 credits of electives before officially joining the MSCPS program.",
            "Complete the Projects during your first Fall semester after joining the program officially.",
          ],
          links: [
            { label: "MSCPS Projects requirement", url: links.projects },
            { label: "MSCPS degree requirements", url: links.mscpsRequirements },
          ],
        },
        waiverNote,
      ];
      if (hasSubplan(state)) items.push(subplanNote);
      items.push(graduationNote);
      return items;
    },
    resources: [{ label: "Earning a CS MS as a non-CS PhD student", url: links.nonCsPhd }].concat(
      mscpsResources
    ),
  },
];

function bamAutoWaiver(state) {
  return Boolean(state.ugProjects) && state.ugProjects !== "None of the above";
}

function emenSharedSatisfied(state) {
  return (state.emen5015 && state.emen5020) || Math.min(state.emenElectives, 9) >= 6;
}

const trackById = Object.fromEntries(tracks.map((track) => [track.id, track]));

/* ---------- Status helpers --------------------------------------------- */

function countStatus(value, goal) {
  if (value >= goal) return "Completed";
  if (value > 0) return "In progress";
  return "Not started";
}

function defaultStatus(row, state) {
  const value = state[row.key];
  switch (row.input.type) {
    case "checkbox":
      return value ? "Completed" : "Incomplete";
    case "number":
      return countStatus(value, row.input.max);
    case "multiselect":
      return countStatus((value || []).length, row.input.goal);
    default:
      return value ? "Completed" : "Incomplete";
  }
}

function rowStatus(row, state) {
  if (row.status) return row.status(state);
  const enabled = row.enabled ? row.enabled(state) : true;
  if (!enabled && !state[row.key]) return "Not eligible";
  return defaultStatus(row, state);
}

function statusClass(status) {
  return `status-badge--${status.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

function renderStatus(status) {
  return `<span class="status-badge ${statusClass(status)}">${escapeHtml(status)}</span>`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ---------- Input renderers -------------------------------------------- */

function renderCheckbox(trackId, key, value, enabled, label) {
  const disabledClass = enabled || value ? "" : "input-disabled";
  return `
    <label class="input-inline ${disabledClass}">
      <input
        type="checkbox"
        data-track="${trackId}"
        data-key="${key}"
        ${value ? "checked" : ""}
        ${enabled || value ? "" : "disabled"}
        aria-label="${escapeHtml(label)}: ${value ? "completed" : "mark complete"}"
      />
      <span aria-hidden="true">${value ? "Completed" : "Mark complete"}</span>
    </label>
  `;
}

function renderSelect(trackId, key, value, options, placeholder, enabled, label) {
  const disabledClass = enabled ? "" : "input-disabled";
  const optionMarkup = options
    .map(
      (option) =>
        `<option value="${escapeHtml(option)}" ${option === value ? "selected" : ""}>${escapeHtml(
          option
        )}</option>`
    )
    .join("");

  return `
    <select
      class="${disabledClass}"
      data-track="${trackId}"
      data-key="${key}"
      ${enabled ? "" : "disabled"}
      aria-label="${escapeHtml(label || placeholder || key)}"
    >
      <option value="">${escapeHtml(placeholder || "Select an option")}</option>
      ${optionMarkup}
    </select>
  `;
}

function renderNumber(trackId, key, value, max, caption, label) {
  return `
    <div>
      <input
        type="number"
        data-track="${trackId}"
        data-key="${key}"
        min="0"
        ${Number.isFinite(max) ? `max="${max}"` : ""}
        value="${value}"
        aria-label="${escapeHtml(label || caption || key)}"
      />
      ${caption ? `<div class="credit-caption">${escapeHtml(caption)}</div>` : ""}
    </div>
  `;
}

function renderMultiselect(trackId, key, selected, options, goal, label) {
  if (!options.length) {
    return `<p class="locked-note">Choose a subplan above to see its course list.</p>`;
  }

  const items = options
    .map(
      (option) => `
        <label>
          <input
            type="checkbox"
            data-track="${trackId}"
            data-key="${key}"
            data-value="${escapeHtml(option)}"
            ${selected.includes(option) ? "checked" : ""}
          />
          <span>${escapeHtml(option)}</span>
        </label>
      `
    )
    .join("");

  return `
    <div>
      <div class="course-picker" role="group" aria-label="${escapeHtml(label)}">${items}</div>
      <div class="course-picker__count">${selected.length} of ${goal} selected</div>
    </div>
  `;
}

function renderRowInput(track, row, state) {
  const enabled = row.enabled ? row.enabled(state) : true;
  const input = row.input;
  const value = state[row.key];

  switch (input.type) {
    case "checkbox":
      return renderCheckbox(track.id, row.key, value, enabled, row.label);
    case "select":
      return renderSelect(
        track.id,
        row.key,
        value,
        input.options,
        input.placeholder,
        enabled,
        row.label
      );
    case "number":
      return renderNumber(track.id, row.key, value, input.max, input.caption, row.label);
    case "multiselect":
      return renderMultiselect(
        track.id,
        row.key,
        value || [],
        input.optionsFor(state),
        input.goal,
        row.label
      );
    case "readout":
      return `<span class="readout">${escapeHtml(input.valueFor(state))}</span>`;
    default:
      return "";
  }
}

function renderLockedNote(row, state) {
  const enabled = row.enabled ? row.enabled(state) : true;
  if (enabled || !row.lockedNote) return "";
  return `<p class="locked-note">${escapeHtml(row.lockedNote(state))}</p>`;
}

/* ---------- Track rendering -------------------------------------------- */

function visibleGroups(track, state) {
  return track.groups
    .filter((group) => (group.visible ? group.visible(state) : true))
    .map((group) => ({
      title: group.title,
      rows: group.rows.filter((row) => (row.visible ? row.visible(state) : true)),
    }))
    .filter((group) => group.rows.length);
}

function earnedCredits(track, state) {
  return visibleGroups(track, state).reduce(
    (total, group) =>
      total + group.rows.reduce((sum, row) => sum + (row.credits ? row.credits(state) : 0), 0),
    0
  );
}

function renderPlanField(track, field, state) {
  const value = state[field.key];
  let control = "";

  if (field.type === "subplan") {
    const options = subplans
      .map(
        (plan) =>
          `<option value="${escapeHtml(plan.value)}" ${
            plan.value === value ? "selected" : ""
          }>${escapeHtml(plan.label)}</option>`
      )
      .join("");
    control = `<select data-track="${track.id}" data-key="${field.key}" aria-label="${escapeHtml(
      field.label
    )}">${options}</select>`;
  } else if (field.type === "checkbox") {
    // The label stays fixed; the box itself carries the yes/no answer.
    control = `
      <label class="input-inline">
        <input type="checkbox" data-track="${track.id}" data-key="${field.key}" ${
      value ? "checked" : ""
    } aria-label="${escapeHtml(field.label)}" />
        <span>${escapeHtml(field.boxLabel)}</span>
      </label>
    `;
  } else if (field.type === "choice") {
    control = `
      <div class="choice-group" role="radiogroup" aria-label="${escapeHtml(field.label)}">
        ${field.options
          .map(
            (option) => `
              <label class="choice-option ${option === value ? "choice-option--active" : ""}">
                <input
                  type="radio"
                  name="${track.id}-${field.key}"
                  data-track="${track.id}"
                  data-key="${field.key}"
                  value="${escapeHtml(option)}"
                  ${option === value ? "checked" : ""}
                />
                <span>${escapeHtml(option)}</span>
              </label>
            `
          )
          .join("")}
      </div>
    `;
  } else {
    const options = field.optionsFor ? field.optionsFor(state) : field.options;
    control = renderSelect(track.id, field.key, value, options, "Select an option", true, field.label);
  }

  return `
    <div class="plan-field">
      <span>${escapeHtml(field.label)}</span>
      ${control}
      ${field.note ? `<p class="plan-field__note">${escapeHtml(field.note)}</p>` : ""}
    </div>
  `;
}

function renderTrackerGroup(track, group, state) {
  const rowsMarkup = group.rows
    .map((row) => {
      const status = rowStatus(row, state);
      return `
        <tr>
          <td><strong>${escapeHtml(row.label)}</strong></td>
          <td>${renderRowInput(track, row, state)}${renderLockedNote(row, state)}</td>
          <td>${renderStatus(status)}</td>
          <td class="tracker-table__dependency">${escapeHtml(row.requirement)}</td>
        </tr>
      `;
    })
    .join("");

  const cardsMarkup = group.rows
    .map((row) => {
      const status = rowStatus(row, state);
      return `
        <article class="tracker-card">
          <h3>${escapeHtml(row.label)}</h3>
          <div class="tracker-card__row">
            <span>Input</span>
            ${renderRowInput(track, row, state)}${renderLockedNote(row, state)}
          </div>
          <div class="tracker-card__row">
            <span>Status</span>
            ${renderStatus(status)}
          </div>
          <div class="tracker-card__row">
            <span>Requirement</span>
            <p class="tracker-card__dependency">${escapeHtml(row.requirement)}</p>
          </div>
        </article>
      `;
    })
    .join("");

  return `
    <div class="section-tabline">
      <span class="line-tab line-tab--active">${escapeHtml(group.title)}</span>
    </div>
    <div class="tracker-shell">
      <div class="tracker-table-wrap">
        <table class="tracker-table">
          <thead>
            <tr>
              <th scope="col">Requirement</th>
              <th scope="col">Input</th>
              <th scope="col">Status</th>
              <th scope="col">Notes</th>
            </tr>
          </thead>
          <tbody>${rowsMarkup}</tbody>
        </table>
      </div>
      <div class="tracker-cards">${cardsMarkup}</div>
    </div>
  `;
}

function renderDeadlines(track, state) {
  const items = (track.deadlines(state) || []).filter(Boolean);
  if (!items.length) return "";

  const cards = items
    .map(
      (item) => `
        <article class="deadline-card deadline-card--coursework">
          <p>${escapeHtml(item.kicker)}</p>
          <strong>${escapeHtml(item.value)}</strong>
          <p class="tracker-card__dependency">${escapeHtml(item.note)}</p>
        </article>
      `
    )
    .join("");

  return `<div class="deadline-grid">${cards}</div>`;
}

function renderNotes(track, state) {
  return track
    .notes(state)
    .map(
      (item, index) => `
        <details class="guide-card" ${index === 0 ? "open" : ""}>
          <summary class="guide-card__summary">
            <div class="guide-card__summary-copy">
              <h3>${escapeHtml(item.title)}</h3>
              <p>${escapeHtml(item.deadline)}</p>
            </div>
            <span class="guide-card__chevron" aria-hidden="true"></span>
          </summary>

          <div class="guide-card__content">
            <div class="guide-card__block">
              <span>Forms</span>
              <ul class="guide-list">
                ${item.forms
                  .map((form) =>
                    form.url
                      ? `<li><a href="${form.url}" target="_blank" rel="noreferrer">${escapeHtml(
                          form.label
                        )}</a></li>`
                      : `<li>${escapeHtml(form.label)}</li>`
                  )
                  .join("")}
              </ul>
            </div>

            <div class="guide-card__block">
              <span>Instructions</span>
              <ul class="guide-list">
                ${item.instructions
                  .map((instruction) => `<li>${escapeHtml(instruction)}</li>`)
                  .join("")}
              </ul>
            </div>

            <div class="guide-card__block">
              <span>Recommended links</span>
              <div class="guide-actions">
                ${item.links
                  .map(
                    (link) =>
                      `<a href="${link.url}" target="_blank" rel="noreferrer">${escapeHtml(
                        link.label
                      )}<span class="sr-only"> (opens in new tab)</span></a>`
                  )
                  .join("")}
              </div>
            </div>
          </div>
        </details>
      `
    )
    .join("");
}

function renderResources(track) {
  return track.resources
    .map(
      (item) => `
        <article class="resource-link">
          <strong>${escapeHtml(item.label)}</strong>
          <a href="${item.url}" target="_blank" rel="noreferrer">Open official page<span class="sr-only"> for ${escapeHtml(
        item.label
      )} (opens in new tab)</span></a>
        </article>
      `
    )
    .join("");
}

function renderTrack(track) {
  const state = track.state;
  const groups = visibleGroups(track, state);
  const earned = earnedCredits(track, state);
  const pct = Math.min(100, Math.round((earned / track.goal) * 100));

  const advisor = track.advisor;

  const host = document.querySelector(`[data-track-panel="${track.id}"]`);
  if (!host) return;

  host.innerHTML = `
    <section class="panel">
      <div class="section-heading">
        <div>
          <p class="section-heading__kicker">Pathway</p>
          <h2>${escapeHtml(track.title)}</h2>
        </div>
        <p>${escapeHtml(track.blurb)}</p>
      </div>
      <div class="plan-grid">
        ${track.plan.map((field) => renderPlanField(track, field, state)).join("")}
      </div>
    </section>

    <section class="panel">
      <div class="section-heading">
        <div>
          <h2>Degree Tracker</h2>
        </div>
        <p>All courses except Electives must be completed with a grade of B or higher.</p>
      </div>

      ${groups.map((group) => renderTrackerGroup(track, group, state)).join("")}

      <div class="credit-summary" aria-live="polite">
        <div class="credit-summary__head">
          <span class="credit-summary__label">Total credits toward degree</span>
          <span class="credit-summary__count"><strong>${earned}</strong> / ${track.goal}</span>
        </div>
        <div class="credit-summary__bar">
          <div class="credit-summary__fill" style="width: ${pct}%"></div>
        </div>
        <p class="credit-summary__breakdown">${escapeHtml(track.breakdown(state))}</p>
      </div>
    </section>

    <section class="panel">
      <div class="section-heading">
        <div>
          <p class="section-heading__kicker">Timeline &amp; Forms</p>
          <h2>Recommended Timeline</h2>
        </div>
        <p>Deadlines are derived from the terms you selected above.</p>
      </div>

      ${renderDeadlines(track, state)}

      <div class="guide-grid" style="margin-top: 1rem;">
        ${renderNotes(track, state)}
      </div>

      <article class="dropin-card">
        <div>
          <p class="dropin-card__kicker">Advisor Drop-ins</p>
          <h3>${escapeHtml(advisor.name)}&apos;s Drop-ins</h3>
          <p>Course planning, subplan forms, internship course questions, and deadlines.</p>
          <div class="dropin-card__inline">
            <div class="dropin-card__actions">
              <a class="dropin-card__link" href="${advisor.url}" target="_blank" rel="noreferrer" aria-label="Book ${escapeHtml(
    advisor.name
  )}'s drop-in (opens in new tab)">Book a drop-in</a>
            </div>
          </div>
        </div>
      </article>

      <p class="panel-note">
        Course offerings, prerequisites, and deadlines change by term. Confirm your plan with
        your academic advisor before you register.
      </p>
    </section>

    <section class="panel">
      <div class="section-heading">
        <div>
          <p class="section-heading__kicker">Official Pages</p>
          <h2>Important Links</h2>
        </div>
        <p>Everything in this tracker traces back to one of these pages.</p>
      </div>
      <div class="resource-grid">${renderResources(track)}</div>
    </section>
  `;
}

function renderFaqs() {
  const wrap = document.getElementById("faqCards");
  wrap.innerHTML = faqItems
    .map(
      (item) => `
        <article class="resource-link">
          <strong>${escapeHtml(item.title)}</strong>
          <span>${escapeHtml(item.description)}</span>
          <a href="${item.url}" target="_blank" rel="noreferrer" aria-label="${escapeHtml(
        item.title
      )} – official page (opens in new tab)">Open official page</a>
        </article>
      `
    )
    .join("");
}

/* ---------- Input handling --------------------------------------------- */

function handleInputChange(event) {
  const target = event.target;
  const trackId = target.dataset.track;
  const key = target.dataset.key;
  if (!trackId || !key) return;

  const track = trackById[trackId];
  if (!track || !(key in track.state)) return;

  const state = track.state;

  if (target.type === "checkbox" && target.dataset.value !== undefined) {
    const list = new Set(state[key] || []);
    if (target.checked) list.add(target.dataset.value);
    else list.delete(target.dataset.value);
    state[key] = Array.from(list);
  } else if (target.type === "checkbox") {
    state[key] = target.checked;
  } else if (target.type === "number") {
    const next = Number.parseInt(target.value, 10) || 0;
    const max = Number.parseInt(target.max, 10);
    state[key] = Number.isFinite(max) ? Math.max(0, Math.min(next, max)) : Math.max(0, next);
  } else {
    state[key] = target.value;
  }

  // Changing the subplan invalidates any courses picked for the previous one.
  if (key === "subplan") state.subplanCourses = [];

  // BAM start terms are relative to the final undergraduate term.
  if (key === "finalUgTerm") {
    const allowed = nextThreeTerms(state.finalUgTerm);
    if (!allowed.includes(state.entryTerm)) state.entryTerm = allowed[0] || state.entryTerm;
  }

  renderTrack(track);
}

/* ---------- Tabs -------------------------------------------------------- */

function setActiveTab(name) {
  document.querySelectorAll(".tab-button").forEach((button) => {
    const isActive = button.dataset.tab === name;
    button.classList.toggle("tab-button--active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  document.querySelectorAll(".tab-panel").forEach((panel) => {
    panel.classList.toggle("tab-panel--active", panel.dataset.tabPanel === name);
  });
}

// Only the Professional MS group has more than one pathway, so sub-tabs are
// scoped to that host. The MS in CS panel is always on.
function setActiveTrack(trackId) {
  const host = document.querySelector('[data-track-host="mscps"]');

  document.querySelectorAll(".subtab-button").forEach((button) => {
    const isActive = button.dataset.trackTab === trackId;
    button.classList.toggle("subtab-button--active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  host.querySelectorAll(".track-panel").forEach((panel) => {
    panel.classList.toggle("track-panel--active", panel.dataset.trackPanel === trackId);
  });
}

function buildTrackShells() {
  tracks.forEach((track) => {
    const host = document.querySelector(`[data-track-host="${track.group}"]`);
    if (!host) return;
    const panel = document.createElement("div");
    panel.className = track.group === "mscs" ? "track-panel track-panel--active" : "track-panel";
    panel.dataset.trackPanel = track.id;
    host.appendChild(panel);
  });

  const subtabBar = document.getElementById("mscpsSubtabs");
  tracks
    .filter((track) => track.group === "mscps")
    .forEach((track) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "subtab-button";
      button.dataset.trackTab = track.id;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", "false");
      button.textContent = track.label;
      subtabBar.appendChild(button);
    });
}

function bindEvents() {
  document.addEventListener("change", handleInputChange);

  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => setActiveTab(button.dataset.tab));
  });

  document.getElementById("mscpsSubtabs").addEventListener("click", (event) => {
    const button = event.target.closest(".subtab-button");
    if (button) setActiveTrack(button.dataset.trackTab);
  });
}

buildTrackShells();
bindEvents();
tracks.forEach(renderTrack);
renderFaqs();
setActiveTab("mscs");
setActiveTrack("mscps");

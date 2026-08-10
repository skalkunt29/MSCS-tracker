# MSCS Tracker

A responsive single-page milestone tracker for the CU Boulder **MS in Computer
Science (MSCS)** and **Professional MS in Computer Science (MSCPS)** degrees.

It shares the visual design and build of the CS PhD tracker and the MS AI
tracker — static `index.html` + `styles.css` + JS, no framework, no build step.
The difference is the content: this one covers several degree pathways, so the
page is organised as tabs.

## Tabs

Top-level tabs pick the degree; the Professional MS has a second row of tabs for
its pathways. The FAQs are shared across all of them.

| Tab | Pathway | Total |
| --- | --- | --- |
| MS in Computer Science | MSCS, with optional BAM and non-CS PhD toggles | 30 cr |
| Professional MS → Standard MSCPS | The standard MSCPS | 30 cr |
| Professional MS → BAM | MSCPS via Bachelor's-Accelerated Master's | 30 cr |
| Professional MS → Dual Degree (EMEN) | MSCPS / Engineering Management | 45 cr |
| Professional MS → Non-CS PhD | MSCPS earned as a non-CS PhD student | 30 cr |
| Tracker FAQs | Shared policy answers and official links | — |

Each pathway tab carries its own state, credit math, timeline, and links.
Switching tabs never mixes one pathway's answers into another.

## What it tracks

- **Breadth (BIN) requirement (9 cr)** — one course from each of BIN 1, 2, and 3.
- **Projects / Research (6 cr)** — the MSCPS Projects sequences (or a waiver),
  and the MSCS thesis / independent study sequences.
- **Electives** — 15 cr for the MSCPS, 12 cr for the MSCS, 9 cr of CSCI plus
  EMEN coursework for the dual degree. Waiving the Projects reveals the 6
  additional elective credits it costs you.
- **Subplans** — all eight MSCPS subplans, each with its course list, a declared
  flag, and a completed/remaining count against the four-course requirement.
- **Pathway-specific requirements** — BAM forms and carried credits, EMEN core
  courses and electives, and the non-CS PhD pre-application and application
  checklists.
- A live **credit summary** with a per-requirement breakdown.
- A **timeline** whose deadlines are computed from your entry term, plus the
  forms, instructions, and official links for each milestone.

## Logic worth knowing

- **Term math** uses CU Boulder term codes (`2` + two-digit year + season digit,
  Spring = 1, Summer = 4, Fall = 7). Fall 2024 is `2247`.
- **The Projects sequence unlocks** when `currentTerm - entryTerm >= 10`, i.e.
  one full academic year after entry. Until then the input is disabled with an
  explanation rather than hidden. On the dual degree it also requires all three
  BIN courses. For BAM students, an approved undergraduate Projects sequence
  (CSCI 4308 & 4318, 4348 & 4358, or 4368 & 4378) waives it automatically.
- **BAM start terms** are limited to the three terms following your final
  undergraduate term, summers included.
- **Completion deadlines** are entry term + 4 years, or + 6 years for the dual
  degree.
- **Grades**: professional development, breadth, Projects, research, and subplan
  courses all need a B or higher. Electives are the exception and may count with
  a lower grade, as long as your cumulative GPA stays at or above 3.00.
- **Advising**: the research MS is advised by Meagan, the MSCPS pathways by
  Daniel, and each tab links its own drop-ins.

## Files

- `index.html` — page shell, tab bars, and the FAQ panel.
- `styles.css` — responsive visual design (shared look with the PhD and MS AI trackers).
- `data.js` — course lists, official links, and FAQ copy.
- `script.js` — term math, pathway definitions, requirement logic, and rendering.

## Usage

Open `index.html` in a browser. Nothing is stored or transmitted — entries live
in memory for the session only.

## Source

Requirements come from the "CU Boulder CSEN Graduate Degree: Milestone tracker"
workbook (`MS CS`, `MSCPS`, and `BIN Courses` sheets), cross-checked against the
official CU Boulder pages linked throughout the tracker.

Two places where the tracker departs from the workbook:

- The `MS CS` sheet labels the elective row "12 credit hours" but its formula
  checks for 15. The tracker uses **12**, which is what makes the MSCS add up to
  30 credits (3 professional development + 9 breadth + 6 research + 12 electives).
- The `MSCPS` sheet points the AIG subplan's course list at the BIN 2 column.
  The tracker uses the AI course list instead (the same list the other seven
  subplans use as inline options), and takes BIN 1/2/3 from the `BIN Courses`
  sheet.

Course offerings, prerequisites, and deadlines change by term — this is a
planning aid, not an official degree audit.

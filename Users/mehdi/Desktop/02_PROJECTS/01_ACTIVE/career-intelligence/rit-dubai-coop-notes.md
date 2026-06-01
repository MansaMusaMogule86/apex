# RIT Dubai — Co-op pages quick notes

Sources reviewed:
- https://www.rit.edu/dubai/
- https://www.rit.edu/dubai/co-op#student-resources
- https://www.rit.edu/dubai/co-op-student-resources

## RIT Dubai homepage (high-level facts)
- Co-op and internship program is a highlighted campus differentiator.
- Stats shown on the page include: 90+ nationalities, 80+ strategic partners, 80% employability rate after graduation, 700+ hours of work experience required for graduation. (Page shows “Website last updated: May 20, 2026”.)

## Co-op overview (https://www.rit.edu/dubai/co-op)
- Office mission: provide high-quality services to students/alumni to support experiential learning, career, and employment goals.
- “Career Portal” is Symplicity-based and is positioned as the place for jobs, events, and resources.
- Co-op definition/criteria highlights:
  - Related to field of study
  - Full-time, productive work
  - Increasing complexity over academic level
  - Includes formal evaluation/documentation
- Co-op Preparation course:
  - Compulsory for undergraduates; required in second year; prerequisite before first co-op/internship.
  - Outcomes listed include: CVs, LinkedIn/job search, interviews, work readiness, professional communication, work ethic, design thinking for careers.
- Career Services:
  - 1:1 sessions for CV/interviewing/networking/LinkedIn/workplace skills; resources via the career portal.
  - Employer sessions/workshops (“Career Wednesdays”) and career fairs (Fall + Spring), online and in person, with prep workshops.
- Student resources pointer:
  - A “Requirements and reporting” link takes students to the student resources page.
- FAQ highlights:
  - Co-op job not guaranteed, but office will help in the search.
  - Standard academic credit not given; department assigns “S” after requirements met.
  - No tuition/institute fees paid while on co-op; students remain eligible to use institute facilities/services.
  - Co-op is reported via the Symplicity Portal.

## Co-op student resources (https://www.rit.edu/dubai/co-op-student-resources)
### Co-op duration per major (minimum duration)
- Engineering: 2 semesters + 2 summers (48 weeks); shown separately as 16 weeks in the duration list (page also has a detailed “Engineering” prerequisite block listing 48-week requirement and 4 blocks in SIS).
- Business / Management Information Systems: 2×12 weeks (24 weeks)
- Computing: 10 weeks
- Psychology / Advertising & Public Relations: (listed in duration table without a week number in the snippet view; see prerequisites section below for Psychology = 10 weeks)

### Reporting
- “Report my co-op” is done in the Symplicity Portal (linked from the page).

### Evaluations
- Each co-op block: student completes a Student Evaluation; supervisor completes an Employer Evaluation.
- Links are sent to both student and supervisor.
- Student is responsible for ensuring both are completed on time; faculty advisor reviews and assigns co-op grade in the term following the co-op block.

### Prerequisites per major (as written on the page)
- Business (Finance, Marketing, GBM):
  - CGPA: 2.0+
  - Prep course: “Careers in business”
  - Required prerequisite course codes: “SCBI-35”
  - Year standing: 3
  - Minimum credits completed: 56
  - Suggested term(s): Summer
  - Co-op week requirement: 16 weeks
  - Minimum per block: 4 weeks @ 35 hours/week
  - Note: can be completed in 2 blocks; if 4 weeks is done in one block, next block needs to be 12 weeks
  - Co-op blocks required (SIS): 1
- Computing (CIT, CSEC):
  - CGPA: 2.0+
  - Prep course: “IST 2nd year seminar (CIT)”, “Co-op educaiton seminar (CSEC)” (typo appears on page)
  - Required prerequisite codes: ISTE-99, ISTE-230, ISTE-240, NSSA-241, NSSA-221 (CIT), CSEC-99 (CSEC)
  - Recommended prerequisite codes: CSEC-202, NSSA-221, MATH-182 (CSEC)
  - Suggested term(s): 2× Summer
  - Co-op week requirement: 24 weeks
  - Minimum per block: 10 weeks @ 35 hours/week
  - Co-op blocks required (SIS): 2
- Engineering (Electrical, Industrial, Mechanical):
  - CGPA: 2.0+
  - Prep course: “Engineering co-op prep”
  - Required prerequisite codes: EGEN-99; EEEE-282 (EE); ISEE-120 (IE); MECE-110, MECE-203 (ME) (as displayed)
  - Recommended codes: ISEE-325, ISEE-200, ISEE-345 (IE); “Highly Recommended: MECE-211 (ME)”
  - Suggested term(s): 2× Summer, Spring (EE); Spring, Summer, Fall (IE); 2× Summer, Spring (ME)
  - Co-op week requirement: 48 weeks
  - Minimum per block: 10 weeks @ 35 hours/week
  - Co-op blocks required (SIS): 4
- Psychology:
  - CGPA: 2.0+
  - Prep course: “Junior seminar in psychology”
  - Required prerequisite code: PSYC-301
  - Year standing: 3
  - Suggested term(s): Summer
  - Co-op week requirement: 10 weeks
  - Minimum per block: 10 weeks @ 35 hours/week
  - Co-op blocks required (SIS): 1

## Production installer and component checklist (Next.js + Supabase)

Run from the project root after installing Node.js LTS (v20+):

```powershell
npm init -y
npm install next@latest react@latest react-dom@latest
npm install @supabase/supabase-js @supabase/ssr
npm install zod date-fns recharts clsx
npm install lucide-react
npm install @tanstack/react-query
npm install framer-motion
npm install -D typescript @types/node @types/react @types/react-dom
npm install -D eslint eslint-config-next
```

Optional quality and performance tooling:

```powershell
npm install -D prettier eslint-config-prettier
npm install -D @next/bundle-analyzer
```

Recommended UI component baseline:
- Dashboard shell: App layout, sidebar, mobile bottom nav, command palette
- Data: KPI cards, table, filters, chips, timeline, risk alerts, drawer panel
- Domain modules: Students, Employers, NOC queue, Placements, Analytics, Reports, AI panel


// ============================================================================
// Machine-readable AP exam blueprints — the OFFICIAL College Board format for each
// marketed AP course, plus an honest note of what Gallop's practice does NOT yet
// cover ("gaps"). The UI shows the official format vs. what Gallop offers now, and
// always links families to College Board to verify the current specs.
//
// Sources: apcentral.collegeboard.org course exam pages, verified July 2026. Formats
// change year to year — every course carries an examYear and a source link, and the
// coverage test (test/ap_coverage.test.js) reports Gallop's live coverage against this.
// The MCQ/FRQ counts Gallop actually has are read from the live banks, not hard-coded.
// ============================================================================

const AP_BLUEPRINTS = {
  'ap-calc-ab': {
    examYear: '2025–26', verified: '2026-07',
    official: { mcq: 45, frq: 6, timeMin: 195, mcqWeight: 50, frqWeight: 50,
      calc: 'Mixed — some sections require a graphing calculator, others prohibit it.',
      frqNote: 'FRQs mix analytical, graphical, tabular, and verbal representations.' },
    note: 'The number of multiple-choice questions and the timing change starting with the May 2027 exams.',
    gaps: ['Full-length timing and section structure (Gallop offers short practice sets and a 30-minute mini mock, not the full 3h15m exam).'],
    source: 'https://apcentral.collegeboard.org/courses/ap-calculus-ab/exam'
  },
  'ap-stats': {
    examYear: '2025–26', verified: '2026-07',
    official: { mcq: 42, frq: 4, timeMin: 180, mcqWeight: 50, frqWeight: 50,
      calc: 'A graphing calculator is permitted throughout.',
      frqNote: 'Four FRQs, including an investigative task; Q3 is a full inference (test or interval).' },
    note: 'AP Statistics was revised for the 2026–27 school year — confirm the latest format with College Board.',
    gaps: ['Full-length exam (Gallop offers short sets + a mini mock).', 'The investigative-task FRQ format.'],
    source: 'https://apcentral.collegeboard.org/courses/ap-statistics/exam'
  },
  'ap-bio': {
    examYear: '2025–26', verified: '2026-07',
    official: { mcq: 60, frq: 6, timeMin: 180, mcqWeight: 50, frqWeight: 50,
      calc: 'A four-function (or better) calculator is permitted.',
      frqNote: 'Two long FRQs (9 pts each) + four short FRQs (4 pts each).' },
    gaps: ['Full-length exam and the long/short FRQ split.'],
    source: 'https://apcentral.collegeboard.org/courses/ap-biology/exam'
  },
  'ap-chem': {
    examYear: '2025–26', verified: '2026-07',
    official: { mcq: 60, frq: 7, timeMin: 195, mcqWeight: 50, frqWeight: 50,
      calc: 'A scientific or graphing calculator is permitted on the free-response section.',
      frqNote: 'Three long FRQs (10 pts each) + four short FRQs (4 pts each).' },
    gaps: ['Full-length exam and the long/short FRQ split.'],
    source: 'https://apcentral.collegeboard.org/courses/ap-chemistry/exam'
  },
  'ap-physics1': {
    examYear: '2025–26', verified: '2026-07',
    official: { mcq: 40, frq: 4, timeMin: 180, mcqWeight: 50, frqWeight: 50,
      calc: 'A calculator is permitted throughout.',
      frqNote: 'Four FRQ types: mathematical routines, translation between representations, experimental design & analysis, and qualitative/quantitative translation.' },
    gaps: ['Full-length exam.', 'The experimental-design and representation-translation FRQ types.'],
    source: 'https://apcentral.collegeboard.org/courses/ap-physics-1/exam'
  },
  'ap-envsci': {
    examYear: '2025–26', verified: '2026-07',
    official: { mcq: 80, frq: 3, timeMin: 160, mcqWeight: 60, frqWeight: 40,
      calc: 'A four-function (or better) calculator is permitted.',
      frqNote: 'Three FRQs: design an investigation; analyze a problem and propose a solution; analyze a problem with calculations.' },
    gaps: ['Full-length exam.'],
    source: 'https://apcentral.collegeboard.org/courses/ap-environmental-science/exam'
  },
  'ap-eng-lang': {
    examYear: '2025–26', verified: '2026-07',
    official: { mcq: 45, frq: 3, timeMin: 195, mcqWeight: 45, frqWeight: 55,
      calc: null,
      frqNote: 'Three essays: Synthesis (using ≥3 of 6 provided sources), Rhetorical Analysis, and Argument.' },
    gaps: [
      'The Synthesis essay with a 6-source packet (not yet available — coming soon).',
      'Passage-based multiple choice and the writing/revision question sets (Gallop currently uses rhetorical-term questions).',
      'A provided passage for rhetorical analysis (Gallop currently asks the student to choose one).'
    ],
    source: 'https://apcentral.collegeboard.org/courses/ap-english-language-and-composition/exam'
  },
  'ap-eng-lit': {
    examYear: '2025–26', verified: '2026-07',
    official: { mcq: 55, frq: 3, timeMin: 180, mcqWeight: 45, frqWeight: 55,
      calc: null,
      frqNote: 'Three essays: poetry analysis, prose fiction/drama analysis, and a literary-argument on a student-selected work.' },
    gaps: [
      'Provided passages for the poetry and prose analysis essays (Gallop currently asks the student to choose a text).',
      'Passage-set multiple choice.'
    ],
    source: 'https://apcentral.collegeboard.org/courses/ap-english-literature-and-composition/exam'
  },
  'ap-spanish': {
    examYear: '2025–26', verified: '2026-07',
    official: { mcq: 65, frq: 4, timeMin: 203, mcqWeight: 50, frqWeight: 50,
      calc: null,
      frqNote: 'Two written tasks (email reply, argumentative essay) + two spoken tasks (conversation, cultural comparison).' },
    note: 'AP Spanish moves to a digital format for 2026–27 — confirm the latest structure with College Board.',
    gaps: [
      'The two spoken tasks — conversation and cultural comparison (not yet available — coming soon).',
      'Audio-based listening multiple choice.'
    ],
    source: 'https://apcentral.collegeboard.org/courses/ap-spanish-language-and-culture/exam'
  }
};

function getBlueprint(trackId) { return AP_BLUEPRINTS[trackId] || null; }

// Combine the official blueprint with Gallop's LIVE coverage (counts read from the banks passed in).
function coverageFor(trackId, gallopMcq, gallopFrq) {
  const bp = AP_BLUEPRINTS[trackId];
  if (!bp) return null;
  return {
    examYear: bp.examYear,
    official: bp.official,
    note: bp.note || null,
    source: bp.source,
    gallop: { mcq: gallopMcq || 0, frq: gallopFrq || 0 },
    gaps: bp.gaps || []
  };
}

module.exports = { AP_BLUEPRINTS, getBlueprint, coverageFor };

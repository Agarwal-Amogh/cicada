// The sample month: 35 days of a made-up college student's life, oldest first.
// It is built so a few real patterns show up, the way they would for a person:
//   1. Late scrolling (S) -> short sleep -> irritable entries the next day.
//   2. Morning runs (R) -> calm, good days.
//   3. Time with Meera (M) -> good days.
//   4. Deadlines (D) -> anxious entries.
// One short-sleep day turns out fine, so the patterns are strong but not perfect.
// Everything here is fiction and is shown as sample data in the app.

export type Flag = 'S' | 'R' | 'M' | 'D';

export type PlannedEntry = {
  title: string;
  body: string;
  mood: number; // -2..2
  energy: number; // -2..2
  emotions: string[];
  triggers: string[];
  people: string[];
  /** Did the user tap a mood on save? */
  tappedMood?: boolean;
};

export type PlannedDay = { flags: Flag[]; entry?: PlannedEntry };

export const plan: PlannedDay[] = [
  // 34 days ago
  {
    flags: ['R', 'M'],
    entry: {
      title: 'Running again',
      body: 'Started running again with Meera. Only 3 km but I felt great after, sharp in class all day.',
      mood: 2, energy: 2, emotions: ['happy', 'energetic'], triggers: [], people: ['Meera'], tappedMood: true,
    },
  },
  {
    flags: ['S'],
    entry: {
      title: 'Fine, mostly',
      body: 'Slept late but the day was fine, mostly lectures. A bit tired in the afternoon.',
      mood: 0, energy: -1, emotions: ['tired'], triggers: ['late night'], people: [],
    },
  },
  {
    flags: ['S'],
    entry: {
      title: 'Snapped at Didi',
      body: 'Stayed up till 2 on reels. Woke up groggy and snapped at my sister over the bathroom. Felt bad after.',
      mood: -2, energy: -2, emotions: ['irritated', 'guilty'], triggers: ['late night', 'family'], people: ['Didi'], tappedMood: true,
    },
  },
  { flags: [] },
  {
    flags: ['D'],
    entry: {
      title: 'DBMS assignment',
      body: 'Assignment due tomorrow. Could not focus, kept checking my phone. Anxious about the viva.',
      mood: -1, energy: 0, emotions: ['anxious'], triggers: ['deadline'], people: [],
    },
  },
  {
    flags: ['D', 'S'],
    entry: {
      title: 'Lost it at Arjun',
      body: 'Submitted at 3 am, slept four hours. Lost it at Arjun in the lab when he changed my query without asking.',
      mood: -2, energy: -2, emotions: ['angry', 'exhausted'], triggers: ['deadline', 'late night'], people: ['Arjun'], tappedMood: true,
    },
  },
  {
    flags: ['R', 'M'],
    entry: {
      title: 'Chai after the run',
      body: 'Morning run with Meera, then chai at the canteen. Calm day, even the viva went okay.',
      mood: 2, energy: 1, emotions: ['calm', 'relieved'], triggers: [], people: ['Meera'], tappedMood: true,
    },
  },
  {
    flags: [],
    entry: {
      title: 'Call with Mum',
      body: 'Quiet Sunday. Called home and Mum asked about placements again. A bit stressed but fine.',
      mood: 0, energy: 0, emotions: ['stressed'], triggers: ['placements', 'family'], people: ['Mum'],
    },
  },
  { flags: [] },
  {
    flags: ['S'],
    entry: {
      title: 'Everything annoyed me',
      body: 'Doomscrolled till 1:30 again. Everything annoyed me today: the bus, the professor, my roommate playing music.',
      mood: -2, energy: -1, emotions: ['irritated'], triggers: ['late night', 'noise'], people: ['roommate'],
    },
  },
  {
    flags: ['R'],
    entry: {
      title: '5 km',
      body: 'Ran 5 km before class. Felt light and patient all day, helped a junior with his code.',
      mood: 2, energy: 2, emotions: ['happy', 'proud'], triggers: [], people: [], tappedMood: true,
    },
  },
  {
    flags: [],
    entry: {
      title: 'Project meeting',
      body: 'Group project meeting. Arjun and I disagreed on the design but we sorted it out.',
      mood: 0, energy: 0, emotions: ['frustrated', 'relieved'], triggers: ['disagreement'], people: ['Arjun'],
    },
  },
  { flags: [] },
  {
    flags: ['M'],
    entry: {
      title: 'Movie night',
      body: 'Movie night with Meera and the gang. Laughed a lot. Good day.',
      mood: 2, energy: 1, emotions: ['happy'], triggers: [], people: ['Meera'], tappedMood: true,
    },
  },
  {
    flags: ['S'],
    entry: {
      title: 'So tired',
      body: 'Could not sleep, scrolled till 2. Short with everyone at college. I hate how tired I feel.',
      mood: -2, energy: -2, emotions: ['irritated', 'tired'], triggers: ['late night'], people: [],
    },
  },
  {
    flags: ['D'],
    entry: {
      title: 'Mid-sem tomorrow',
      body: 'Revised all day. Heart racing at night, kept going over the same chapter.',
      mood: -1, energy: 1, emotions: ['anxious'], triggers: ['exam'], people: [],
    },
  },
  {
    flags: ['D'],
    entry: {
      title: 'Harder than expected',
      body: 'The exam was harder than expected. Came back and slept early.',
      mood: -1, energy: -1, emotions: ['disappointed'], triggers: ['exam'], people: [],
    },
  },
  {
    flags: ['R'],
    entry: {
      title: 'Clear head',
      body: 'Back to running, 4 km. Mind felt clear and I planned the week properly.',
      mood: 1, energy: 1, emotions: ['calm', 'motivated'], triggers: [], people: [],
    },
  },
  { flags: [] },
  {
    flags: [],
    entry: {
      title: 'Long lab day',
      body: 'Long lab day. Nothing special, a bit bored.',
      mood: 0, energy: -1, emotions: ['bored'], triggers: [], people: [],
    },
  },
  {
    flags: ['S'],
    entry: {
      title: 'Diwali argument',
      body: 'Up till 2 watching a series. Argued with Mum on the phone about coming home for Diwali. I regret how I said it.',
      mood: -2, energy: -1, emotions: ['angry', 'guilty'], triggers: ['late night', 'family'], people: ['Mum'], tappedMood: true,
    },
  },
  {
    flags: ['R', 'M'],
    entry: {
      title: 'Best morning',
      body: 'Ran with Meera, then breakfast. Best morning in a while.',
      mood: 2, energy: 2, emotions: ['happy'], triggers: [], people: ['Meera'], tappedMood: true,
    },
  },
  {
    flags: [],
    entry: {
      title: 'Presentation prep',
      body: 'Presentation prep with Arjun. Productive, we split the slides well.',
      mood: 1, energy: 1, emotions: ['focused'], triggers: [], people: ['Arjun'],
    },
  },
  { flags: [] },
  {
    flags: ['D'],
    entry: {
      title: 'Stretched',
      body: 'Hackathon registration and two submissions this week. Feeling stretched thin.',
      mood: -1, energy: 0, emotions: ['stressed', 'overwhelmed'], triggers: ['deadline'], people: [],
    },
  },
  {
    flags: ['S'],
    entry: {
      title: 'Not like me',
      body: 'Scrolled till 1:45. Snapped at the canteen guy for being slow. That is not like me.',
      mood: -2, energy: -1, emotions: ['irritated', 'guilty'], triggers: ['late night'], people: [],
    },
  },
  {
    flags: ['R'],
    entry: {
      title: 'Finished the report',
      body: 'Morning run. Calm and focused, finished the whole report before lunch.',
      mood: 2, energy: 1, emotions: ['calm', 'proud'], triggers: [], people: [], tappedMood: true,
    },
  },
  { flags: [] },
  {
    flags: [],
    entry: {
      title: 'Power cut',
      body: 'Hostel power cut, studied by phone light. Weirdly peaceful.',
      mood: 1, energy: 0, emotions: ['calm'], triggers: [], people: [],
    },
  },
  {
    flags: ['D'],
    entry: {
      title: 'Two deadlines',
      body: 'Two deadlines on Friday. Made a list, which helped a little.',
      mood: -1, energy: 0, emotions: ['anxious'], triggers: ['deadline'], people: [],
    },
  },
  {
    flags: ['S'],
    entry: {
      title: 'Short temper',
      body: 'Could not sleep, phone till 2. Short temper all day.',
      mood: -2, energy: -2, emotions: ['irritated', 'tired'], triggers: ['late night'], people: [],
    },
  },
  {
    flags: ['R', 'M'],
    entry: {
      title: 'Run with Meera',
      body: 'Ran before class with Meera. Felt light the whole day, even in the lab.',
      mood: 2, energy: 2, emotions: ['happy', 'energetic'], triggers: [], people: ['Meera'], tappedMood: true,
    },
  },
  {
    flags: ['S'],
    entry: {
      title: 'Could not sleep',
      body: 'Scrolled till 2 again. Told myself I would stop at midnight.',
      mood: -1, energy: -2, emotions: ['frustrated', 'tired'], triggers: ['late night'], people: [],
    },
  },
  {
    flags: ['S'],
    entry: {
      title: 'Snapped at Arjun',
      body: 'Presentation went fine but I snapped at Arjun over nothing. I think I was just tired.',
      mood: -2, energy: -1, emotions: ['irritated', 'guilty'], triggers: ['late night'], people: ['Arjun'], tappedMood: true,
    },
  },
  // Today: nothing written yet.
  { flags: [] },
];

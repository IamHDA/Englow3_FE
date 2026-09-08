const ICON = {\n  clock: '<circle cx=\"12\" cy=\"12\" r=\"10\"><\u002Fcircle><polyline points=\"12 6 12 12 16 14\"><\u002Fpolyline>',\n  check: '<path d=\"M21.801 10A10 10 0 1 1 17 3.335\"><\u002Fpath><path d=\"m9 11 3 3L22 4\"><\u002Fpath>',\n  flame: '<path d=\"M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z\"><\u002Fpath>',\n  trophy: '<path d=\"M6 9H4.5a2.5 2.5 0 0 1 0-5H6\"><\u002Fpath><path d=\"M18 9h1.5a2.5 2.5 0 0 0 0-5H18\"><\u002Fpath><path d=\"M4 22h16\"><\u002Fpath><path d=\"M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22\"><\u002Fpath><path d=\"M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22\"><\u002Fpath><path d=\"M18 2H6v7a6 6 0 0 0 12 0z\"><\u002Fpath>'\n};

const SUMMARY = [\n  { value: '24', label: 'Cards due today', icon: ICON.clock, tint: 'var(--or-100)', ink: 'var(--or-600)' },\n  { value: '38', label: 'Studied today', icon: ICON.check, tint: 'var(--nv-100)', ink: 'var(--nv-900)' },\n  { value: '7 days', label: 'Current streak', icon: ICON.flame, tint: 'var(--or-100)', ink: 'var(--or-600)' },\n  { value: '326', label: 'Cards mastered', icon: ICON.trophy, tint: 'var(--nv-100)', ink: 'var(--nv-900)' }\n];

const RECENT = [\n  { name: 'IELTS Vocabulary', topic: 'English', total: 120, pct: 68, due: 15, last: 'Yesterday' },\n  { name: 'Java Concepts', topic: 'Programming', total: 84, pct: 45, due: 9, last: '2 days ago' },\n  { name: 'Japanese N5', topic: 'Japanese', total: 210, pct: 82, due: 6, last: 'Aug 12' },\n  { name: 'World History', topic: 'History', total: 96, pct: 31, due: 12, last: 'Aug 10' }\n];

const MORE_SETS = [\n  { name: 'Business English', topic: 'English', total: 145, pct: 54, due: 11, last: 'Aug 9' },\n  { name: 'Physics Formulas', topic: 'Science', total: 62, pct: 77, due: 3, last: 'Aug 8' },\n  { name: 'TOEIC Part 5', topic: 'English', total: 180, pct: 22, due: 20, last: 'Aug 6' }\n];

const WEEK = [\n  { day: 'Mon', n: 42 }, { day: 'Tue', n: 28 }, { day: 'Wed', n: 51 }, { day: 'Thu', n: 0 },\n  { day: 'Fri', n: 38 }, { day: 'Sat', n: 46 }, { day: 'Sun', n: 38 }\n];

const ATTENTION = [\n  { word: 'ubiquitous', set: 'IELTS Vocabulary', miss: 8 },\n  { word: 'ephemeral', set: 'IELTS Vocabulary', miss: 6 },\n  { word: 'polymorphism', set: 'Java Concepts', miss: 5 },\n  { word: 'meticulous', set: 'Business English', miss: 4 }\n];

const TOPICS = ['All topics', 'English', 'Programming', 'History', 'Japanese', 'Science'];

const SET_STATS = [\n  { value: '120', label: 'Total', bg: 'var(--pg)', fg: 'var(--nv-900)', sub: 'var(--tx2)' },\n  { value: '82', label: 'Mastered', bg: 'var(--nv-100)', fg: 'var(--nv-900)', sub: 'var(--nv-900)' },\n  { value: '23', label: 'Learning', bg: 'var(--pg)', fg: 'var(--nv-900)', sub: 'var(--tx2)' },\n  { value: '15', label: 'New', bg: 'var(--pg)', fg: 'var(--nv-900)', sub: 'var(--tx2)' },\n  { value: '15', label: 'Due today', bg: 'var(--or-100)', fg: '#8A4A00', sub: '#8A4A00' }\n];

const CARD_ROWS = [\n  { front: 'abandon', back: 'Từ bỏ, bỏ rơi — to leave someone or something permanently', status: 'Learning', last: 'Today' },\n  { front: 'ubiquitous', back: 'Có mặt khắp nơi — present everywhere at the same time', status: 'Learning', last: 'Today' },\n  { front: 'ephemeral', back: 'Phù du, chóng tàn — lasting for a very short time', status: 'Learning', last: 'Yesterday' },\n  { front: 'meticulous', back: 'Tỉ mỉ — showing great attention to detail', status: 'Mastered', last: 'Yesterday' },\n  { front: 'coherent', back: 'Mạch lạc — logical and consistent', status: 'Mastered', last: 'Aug 13' },\n  { front: 'substantiate', back: 'Chứng minh — to provide evidence to support a claim', status: 'New', last: '—' },\n  { front: 'inevitable', back: 'Không thể tránh khỏi — certain to happen', status: 'Mastered', last: 'Aug 12' }\n];

const STATUS_STYLE = {\n  Mastered: { bg: 'var(--nv-100)', fg: 'var(--nv-900)' },\n  Learning: { bg: 'var(--or-100)', fg: '#8A4A00' },\n  New: { bg: 'var(--pg)', fg: 'var(--tx2)' }\n};

const RATINGS = [\n  { key: '1', label: 'Again', desc: 'I forgot it', next: '1 min', color: 'var(--warn)', tint: '#FCEEEC' },\n  { key: '2', label: 'Hard', desc: 'Difficult to remember', next: '6 min', color: 'var(--or-600)', tint: 'var(--or-100)' },\n  { key: '3', label: 'Good', desc: 'I remembered it', next: '1 day', color: 'var(--nv-600)', tint: 'var(--nv-100)' },\n  { key: '4', label: 'Easy', desc: 'Very easy', next: '4 days', color: 'var(--nv-900)', tint: 'var(--nv-100)' }\n];

const BREAKDOWN = [\n  { label: 'Good', n: 22, color: 'var(--nv-600)' },\n  { label: 'Easy', n: 4, color: 'var(--nv-900)' },\n  { label: 'Hard', n: 3, color: 'var(--or-500)' },\n  { label: 'Again', n: 1, color: 'var(--warn)' }\n];

const STAT_CARDS = [\n  { value: '1,248', label: 'Cards reviewed' },\n  { value: '326', label: 'Cards mastered' },\n  { value: '86%', label: 'Recall rate' },\n  { value: '12.4 hours', label: 'Study time' }\n];

const ACTIVITY = [31, 44, 22, 0, 38, 52, 41, 27, 49, 35, 0, 46, 58, 38];

const ACTIVITY_DAYS = ['3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'];

const PROGRESS = [\n  { label: 'Mastered', n: 326, color: 'var(--nv-900)' },\n  { label: 'Learning', n: 184, color: 'var(--or-500)' },\n  { label: 'New', n: 215, color: 'var(--nv-300)' }\n];

const RECALL = [\n  { label: 'Again', pct: 8, color: 'var(--warn)' },\n  { label: 'Hard', pct: 14, color: 'var(--or-500)' },\n  { label: 'Good', pct: 61, color: 'var(--nv-600)' },\n  { label: 'Easy', pct: 17, color: 'var(--nv-900)' }\n];

const DIFFICULT = [\n  { card: 'ubiquitous', set: 'IELTS Vocabulary', miss: 8, last: 'Today' },\n  { card: 'ephemeral', set: 'IELTS Vocabulary', miss: 6, last: 'Yesterday' },\n  { card: 'polymorphism', set: 'Java Concepts', miss: 5, last: '2 days ago' },\n  { card: 'meticulous', set: 'Business English', miss: 4, last: '3 days ago' }\n];

const HISTORY = [\n  { date: 'Today', set: 'IELTS Vocabulary', cards: '32 cards', recall: '87% recall', time: '8 min' },\n  { date: 'Yesterday', set: 'Java Concepts', cards: '24 cards', recall: '79% recall', time: '6 min' },\n  { date: 'Aug 12', set: 'Japanese N5', cards: '40 cards', recall: '91% recall', time: '12 min' },\n  { date: 'Aug 11', set: 'Business English', cards: '18 cards', recall: '83% recall', time: '5 min' }\n];

const PERIODS = ['7 Days', '30 Days', '3 Months', 'All Time'];


import { PrismaClient, GameMode, QuestionType, Difficulty } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

const wordBankData: Array<{ letter: string; word: string; difficulty: Difficulty }> = [
  { letter: 'A', word: 'Apple', difficulty: 'BEGINNER' },
  { letter: 'B', word: 'Ball', difficulty: 'BEGINNER' },
  { letter: 'C', word: 'Cat', difficulty: 'BEGINNER' },
  { letter: 'D', word: 'Dog', difficulty: 'BEGINNER' },
  { letter: 'E', word: 'Egg', difficulty: 'BEGINNER' },
  { letter: 'F', word: 'Fish', difficulty: 'BEGINNER' },
  { letter: 'G', word: 'Goat', difficulty: 'BEGINNER' },
  { letter: 'H', word: 'Hat', difficulty: 'BEGINNER' },
  { letter: 'I', word: 'Ice', difficulty: 'BEGINNER' },
  { letter: 'J', word: 'Jam', difficulty: 'BEGINNER' },
  { letter: 'K', word: 'Kite', difficulty: 'BEGINNER' },
  { letter: 'L', word: 'Lamp', difficulty: 'BEGINNER' },
  { letter: 'M', word: 'Moon', difficulty: 'BEGINNER' },
  { letter: 'N', word: 'Nest', difficulty: 'BEGINNER' },
  { letter: 'O', word: 'Owl', difficulty: 'BEGINNER' },
  { letter: 'P', word: 'Pen', difficulty: 'BEGINNER' },
  { letter: 'Q', word: 'Queen', difficulty: 'BEGINNER' },
  { letter: 'R', word: 'Ring', difficulty: 'BEGINNER' },
  { letter: 'S', word: 'Sun', difficulty: 'BEGINNER' },
  { letter: 'T', word: 'Tree', difficulty: 'BEGINNER' },
  { letter: 'U', word: 'Up', difficulty: 'BEGINNER' },
  { letter: 'V', word: 'Van', difficulty: 'BEGINNER' },
  { letter: 'W', word: 'Wolf', difficulty: 'BEGINNER' },
  { letter: 'X', word: 'Box', difficulty: 'BEGINNER' },
  { letter: 'Y', word: 'Yarn', difficulty: 'BEGINNER' },
  { letter: 'Z', word: 'Zebra', difficulty: 'BEGINNER' },
];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

async function seed(): Promise<void> {
  console.log('🌱 Starting seed...');

  // Clear existing data
  await prisma.userAnswer.deleteMany();
  await prisma.userProgress.deleteMany();
  await prisma.userSession.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.userAchievement.deleteMany();
  await prisma.userStats.deleteMany();
  await prisma.dailyStreak.deleteMany();
  await prisma.question.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.wordBank.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.gameConfig.deleteMany();
  await prisma.user.deleteMany();

  // Create word bank
  console.log('Creating word bank...');
  const wordBankEntries: Record<string, string> = {};
  for (const w of wordBankData) {
    const entry = await prisma.wordBank.create({
      data: {
        letter: w.letter,
        word: w.word,
        language: 'en',
        difficulty: w.difficulty,
        syllableCount: 1,
      },
    });
    wordBankEntries[w.letter] = entry.id;
  }

  // Create an anonymous user for the default session
  console.log('Creating default user...');
  const defaultUser = await prisma.user.create({
    data: {
      username: `player_${uuidv4().slice(0, 8)}`,
      displayName: 'Player',
      language: 'en',
    },
  });

  // Create a session for the default user
  await prisma.userSession.create({
    data: {
      userId: defaultUser.id,
      sessionToken: 'default-dev-session',
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  });

  // Create lessons
  console.log('Creating lessons...');
  const lettersLesson = await prisma.lesson.create({
    data: {
      mode: 'LETTERS' as GameMode,
      language: 'en',
      title: 'Alphabet A-Z',
      description: 'Learn all 26 letters of the English alphabet',
      level: 1,
      order: 1,
      questionCount: 26,
    },
  });

  const numbersLesson = await prisma.lesson.create({
    data: {
      mode: 'NUMBERS' as GameMode,
      language: 'en',
      title: 'Numbers 0-9',
      description: 'Learn numbers from zero to nine',
      level: 1,
      order: 2,
      questionCount: 10,
    },
  });

  const mixedLesson = await prisma.lesson.create({
    data: {
      mode: 'MIXED' as GameMode,
      language: 'en',
      title: 'Mixed Challenge',
      description: 'Practice letters and numbers together',
      level: 1,
      order: 3,
      questionCount: 10,
    },
  });

  // Create questions for letters lesson
  console.log('Creating letter questions...');
  for (let i = 0; i < wordBankData.length; i++) {
    const w = wordBankData[i];
    await prisma.question.create({
      data: {
        lessonId: lettersLesson.id,
        type: 'LETTER' as QuestionType,
        audioKey: `en-letter-${w.letter.toLowerCase()}`,
        correctAnswer: w.letter,
        displayText: `Press the first letter of ${w.word}`,
        order: i + 1,
        wordBankId: wordBankEntries[w.letter],
        difficulty: w.difficulty,
      },
    });
  }

  // Create questions for numbers lesson
  console.log('Creating number questions...');
  const numberWords = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  for (let i = 0; i < 10; i++) {
    await prisma.question.create({
      data: {
        lessonId: numbersLesson.id,
        type: 'NUMBER' as QuestionType,
        audioKey: `en-number-${i}`,
        correctAnswer: String(i),
        displayText: `Press number ${numberWords[i]}`,
        order: i + 1,
        difficulty: 'BEGINNER' as Difficulty,
      },
    });
  }

  // Create questions for mixed lesson
  console.log('Creating mixed questions...');
  const mixedQuestions = [
    ...shuffleArray(wordBankData).slice(0, 5),
    ...shuffleArray(
      Array.from({ length: 10 }, (_, i) => ({
        letter: String(i),
        word: numberWords[i],
        difficulty: 'BEGINNER' as Difficulty,
      })),
    ).slice(0, 5),
  ];

  const shuffledMixed = shuffleArray(mixedQuestions);
  for (let i = 0; i < shuffledMixed.length; i++) {
    const q = shuffledMixed[i];
    const isLetter = q.letter.length === 1 && isNaN(Number(q.letter)) === false === false;
    const actualIsLetter = /[A-Za-z]/.test(q.letter);

    await prisma.question.create({
      data: {
        lessonId: mixedLesson.id,
        type: actualIsLetter ? 'LETTER' as QuestionType : 'NUMBER' as QuestionType,
        audioKey: actualIsLetter
          ? `en-letter-${q.letter.toLowerCase()}`
          : `en-number-${q.letter}`,
        correctAnswer: actualIsLetter ? q.letter.toUpperCase() : q.letter,
        displayText: actualIsLetter
          ? `Press the first letter of ${q.word}`
          : `Press number ${q.word}`,
        order: i + 1,
        difficulty: 'BEGINNER' as Difficulty,
      },
    });
  }

  // Create game config
  console.log('Creating game config...');
  const configs = [
    { key: 'points_first_try', value: '10', description: 'Points earned on first correct attempt' },
    { key: 'points_second_try', value: '5', description: 'Points earned on second attempt' },
    { key: 'points_third_try_plus', value: '2', description: 'Points earned on third+ attempts' },
    { key: 'streak_bonus', value: '3', description: 'Bonus points for streak milestones' },
    { key: 'streak_bonus_every', value: '5', description: 'Streak bonus triggers every N correct answers' },
    { key: 'xp_per_star', value: '50', description: 'XP earned per star' },
    { key: 'coins_per_star', value: '10', description: 'Coins earned per star' },
    { key: 'default_volume', value: '0.8', description: 'Default volume level (0-1)' },
    { key: 'max_attempts_per_question', value: '999', description: 'Maximum attempts per question' },
    { key: 'feedback_delay_correct_ms', value: '1500', description: 'Delay before next question on correct' },
    { key: 'feedback_delay_incorrect_ms', value: '1000', description: 'Delay before repeat on incorrect' },
    { key: 'audio_preload_count', value: '3', description: 'Number of audio files to preload ahead' },
  ];

  for (const config of configs) {
    await prisma.gameConfig.create({ data: config });
  }

  console.log('✅ Seed completed successfully!');
  console.log(`   - ${wordBankData.length} word bank entries`);
  console.log(`   - 3 lessons (Letters: 26 Q, Numbers: 10 Q, Mixed: 10 Q)`);
  console.log(`   - ${configs.length} game configuration entries`);
  console.log(`   - Default session: 'default-dev-session'`);
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

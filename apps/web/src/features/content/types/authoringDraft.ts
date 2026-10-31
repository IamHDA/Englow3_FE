import { z } from "zod";
const text = z.string().nullable().optional();
const option = z.object({
  content: z.string(),
  correct: z.boolean(),
  label: z.string().optional(),
  orderNo: z.number().optional(),
  explanation: text,
});
const entry = z
  .object({
    lemma: text,
    partOfSpeech: text,
    senseLabel: text,
    ipaUs: text,
    ipaUk: text,
    audioUsObjectKey: text,
    audioUkObjectKey: text,
    audioUsUrl: text,
    audioUkUrl: text,
    definitionEn: text,
    definitionVi: text,
    exampleSentence: text,
    exampleTranslationVi: text,
    mnemonicTipVi: text,
    cefrLevel: text,
    title: text,
    text: text,
    prompt: text,
    points: z.number().optional(),
    questionType: text,
    audioUrl: text,
    audioObjectKey: text,
    audioDurationSeconds: z.number().optional(),
    audioStartMs: z.number().nullable().optional(),
    audioEndMs: z.number().nullable().optional(),
    hintFirstLetters: text,
    hintRevealWord: text,
    hintPartialTranscript: text,
    translationVi: text,
    explanation: text,
    beforeText: text,
    afterText: text,
    originalSentence: text,
    rewriteKeyword: text,
    options: z.array(option).optional(),
    pairs: z
      .array(z.object({ leftText: z.string(), rightText: z.string() }))
      .optional(),
    acceptedAnswers: z.array(z.string()).optional(),
    correctWords: z.array(z.string()).optional(),
    wordBank: z.array(z.string()).optional(),
    scrambledWords: z.array(z.string()).optional(),
    correctOrder: z.array(z.string()).optional(),
  })
  .passthrough();
const question = z
  .object({
    content: z.string(),
    questionType: z.string(),
    difficultyLevel: z.string(),
    skillType: z.string(),
    orderNo: z.number(),
    maxRawScore: z.number(),
    explanation: text,
    questionCategory: text,
    sourceQuestionId: text,
    options: z.array(option),
  })
  .passthrough();
const set = z
  .object({
    orderNo: z.number(),
    questions: z.array(question),
    title: text,
    instruction: text,
    content: text,
    audioObjectKey: text,
    imageObjectKey: text,
    audioUrl: text,
    imageUrl: text,
    sourceQuestionSetId: text,
  })
  .passthrough();
const part = z
  .object({
    orderNo: z.number(),
    title: z.string(),
    questionSets: z.array(set),
    instruction: text,
    content: text,
    audioObjectKey: text,
    imageObjectKey: text,
    audioUrl: text,
    imageUrl: text,
  })
  .passthrough();
const section = z
  .object({
    sectionType: z.string(),
    orderNo: z.number(),
    maxRawScore: z.number(),
    scoredByCriteria: z.boolean(),
    parts: z.array(part),
    timeLimitSeconds: z.number().nullable().optional(),
  })
  .passthrough();
const metadata = z
  .object({
    name: text,
    title: text,
    topic: text,
    category: text,
    description: text,
    referenceText: text,
    ipaTranscript: text,
    translationVi: text,
    phonemeTarget: text,
    tips: z.array(z.string()).optional(),
    durationSeconds: z.number().optional(),
    timeLimitSeconds: z.number().optional(),
    passingScorePercent: z.number().optional(),
    slug: text,
    targetLevel: text,
    examType: text,
    certificateType: text,
    certificateVariant: text,
    maxRawScore: z.number().optional(),
    passScore: z.number().nullable().optional(),
  })
  .passthrough();
const document = z
  .object({
    version: z.number(),
    metadata,
    content: z
      .object({
        cards: z.array(entry).optional(),
        questions: z.array(entry).optional(),
        sections: z.array(section).optional(),
      })
      .optional(),
    sentences: z.array(entry).optional(),
  })
  .passthrough();
export const isAuthoringDraft = (value: unknown) =>
  document.safeParse(value).success;

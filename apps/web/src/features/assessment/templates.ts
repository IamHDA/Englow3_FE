import {
  AssessmentSkill,
  type AssessmentTaskInput,
} from "@/lib/graphql/generated";

// Authored starter prompts. Choosing one only fills the form; saving and approval
// still use the normal role/ownership workflow.
export const assessmentTemplates: Array<{
  id: string;
  label: string;
  input: AssessmentTaskInput;
}> = [
  {
    id: "writing-1",
    label: "Writing Task 1 — mô tả bảng số liệu",
    input: {
      skill: AssessmentSkill.WRITING,
      title: "Task 1: How students travel to school",
      taskType: "TASK_1",
      instructions:
        "The table below shows the percentage of students using four methods to travel to school in one city in 2010 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nMethod | 2010 | 2020\nWalking | 35% | 20%\nCycling | 25% | 15%\nBus | 30% | 40%\nCar | 10% | 25%\n\nWrite at least 150 words. This is an original practice task with illustrative data.",
      rubricNotes:
        "Assess task achievement: a clear overview, accurate comparisons and appropriate grouping. Do not require explanations for changes that the table does not provide.",
      sampleAnswer: "",
      minimumWords: 150,
      timeLimitSeconds: 1200,
    },
  },
  {
    id: "writing-2",
    label: "Writing Task 2 — học trực tuyến",
    input: {
      skill: AssessmentSkill.WRITING,
      title: "Task 2: Online learning and classroom learning",
      taskType: "TASK_2",
      instructions:
        "Some people believe that online learning is more effective than studying in a classroom. Others believe that classroom learning offers more benefits.\n\nDiscuss both views and give your own opinion. Give reasons for your answer and include relevant examples from your knowledge or experience.\n\nWrite at least 250 words. This is an original practice task.",
      rubricNotes:
        "Look for discussion of both views, a consistent position, developed supporting ideas and relevant examples. Assess organization, vocabulary and grammatical range separately.",
      sampleAnswer: "",
      minimumWords: 250,
      timeLimitSeconds: 2400,
    },
  },
  {
    id: "speaking-1",
    label: "Speaking Part 1 — quê hương",
    input: {
      skill: AssessmentSkill.SPEAKING,
      title: "Part 1: Your hometown",
      taskType: "PART_1",
      instructions:
        "Answer these questions in English, giving a few details for each answer:\n1. Where is your hometown?\n2. What do you like most about it?\n3. Has it changed since you were a child?\n4. Would you like to live there in the future?\n\nRecord one response covering all four questions. Aim for 2–3 minutes.",
      rubricNotes:
        "Assess spontaneous development, fluency and coherence, vocabulary, grammar and audible pronunciation. A short answer is not automatically an incorrect answer.",
      sampleAnswer: "",
      minimumWords: 0,
      timeLimitSeconds: 180,
    },
  },
  {
    id: "speaking-2",
    label: "Speaking Part 2 — một người truyền cảm hứng",
    input: {
      skill: AssessmentSkill.SPEAKING,
      title: "Part 2: A person who has inspired you",
      taskType: "PART_2",
      instructions:
        "Describe a person who has inspired you.\nYou should say:\n• who this person is\n• how you know about them\n• what they have done\nand explain why they have inspired you.\n\nPrepare notes for one minute before recording. Speak for 1–2 minutes; do not read a prepared essay.",
      rubricNotes:
        "Evaluate sustained speech, connected ideas, specific examples and intelligibility. Assess all four Speaking criteria; do not infer pronunciation from a transcript alone.",
      sampleAnswer: "",
      minimumWords: 0,
      timeLimitSeconds: 120,
    },
  },
  {
    id: "speaking-3",
    label: "Speaking Part 3 — công nghệ và giáo dục",
    input: {
      skill: AssessmentSkill.SPEAKING,
      title: "Part 3: Technology in education",
      taskType: "PART_3",
      instructions:
        "Discuss these questions in English:\n1. How has technology changed the way people learn?\n2. What difficulties can schools face when using technology?\n3. Do you think teachers will become less important in the future? Why or why not?\n\nSupport your views with reasons and examples. Record a response of about 3–5 minutes.",
      rubricNotes:
        "Assess explanation, comparison, speculation and development of abstract ideas. This recording practice does not simulate a live examiner's follow-up questions.",
      sampleAnswer: "",
      minimumWords: 0,
      timeLimitSeconds: 300,
    },
  },
];

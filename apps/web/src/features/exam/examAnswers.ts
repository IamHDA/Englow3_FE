export function sanitizeExamAnswers(
  questions: readonly { id: string; options: readonly { id: string }[] }[],
  answers: Record<string, string | string[]>,
) {
  const clean: Record<string, string | string[]> = {};
  for (const question of questions) {
    const answer = answers[question.id];
    const options = new Set(question.options.map((option) => option.id));
    const selected = [
      ...new Set(
        (Array.isArray(answer) ? answer : [answer]).filter((id) =>
          options.has(id),
        ),
      ),
    ];
    if (selected.length)
      clean[question.id] = Array.isArray(answer) ? selected : selected[0];
  }
  return clean;
}

export function isExamAnswerPresent(answer: string | string[] | undefined) {
  return Array.isArray(answer)
    ? answer.some((id) => id.length > 0)
    : Boolean(answer);
}

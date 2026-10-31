"use client";
import {
  Accordion,
  Button,
  Card,
  Group,
  NumberInput,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useLanguage } from "@/shared/hooks/useLanguage";
import type {
  ExamSection,
  ExamPart,
  ExamSet,
  ExamQuestion,
} from "../../types/authoring";
import { OptionsEditor } from "./AuthoringFields";
import { AuthoringMedia } from "./AuthoringMedia";
const blankSet = (): ExamSet => ({
  title: "",
  content: "",
  instruction: "",
  orderNo: 1,
  questions: [],
});
const blankPart = (): ExamPart => ({
  title: "",
  content: "",
  instruction: "",
  orderNo: 1,
  questionSets: [blankSet()],
});
const blankQuestion = (skill: string): ExamQuestion => ({
  content: "",
  questionType: "SINGLE_CHOICE",
  difficultyLevel: "MEDIUM",
  skillType: skill,
  orderNo: 1,
  maxRawScore: 1,
  explanation: "",
  options: [
    { label: "A", content: "", correct: false, orderNo: 1 },
    { label: "B", content: "", correct: false, orderNo: 2 },
  ],
});
/** Sections a mock exam cannot score - see the skill selector below. */
function isProductive(sectionType: string): boolean {
  return sectionType === "WRITING" || sectionType === "SPEAKING";
}

export function normalizeExam(sections: ExamSection[]) {
  let questionOrder = 1;
  return sections.map((s, si) => {
    const parts = s.parts.map((p, pi) => ({
      ...p,
      orderNo: pi + 1,
      questionSets: p.questionSets.map((set, qi) => ({
        ...set,
        orderNo: qi + 1,
        questions: set.questions.map((q) => ({
          ...q,
          orderNo: questionOrder++,
          options: q.options.map((o, oi) => ({ ...o, orderNo: oi + 1 })),
        })),
      })),
    }));
    return {
      ...s,
      orderNo: si + 1,
      maxRawScore: parts.reduce(
        (n, p) =>
          n +
          p.questionSets.reduce(
            (m, set) =>
              m + set.questions.reduce((k, q) => k + q.maxRawScore, 0),
            0,
          ),
        0,
      ),
      parts,
    };
  });
}
export function ExamTreeEditor({
  sections,
  change,
  id,
  errors,
  disabled,
  media,
  onMediaBusy,
}: {
  sections: ExamSection[];
  change: (s: ExamSection[]) => void;
  id?: string;
  errors: Record<string, string>;
  disabled?: boolean;
  media?: Record<string, string>;
  onMediaBusy?: (active: boolean) => void;
}) {
  const { isVi } = useLanguage();
  const t = (vi: string, en: string) => (isVi ? vi : en);
  function mutate(run: (s: ExamSection[]) => void) {
    const next = structuredClone(sections);
    run(next);
    change(normalizeExam(next));
  }
  const remove = (run: (s: ExamSection[]) => void) => {
    if (
      window.confirm(
        t(
          "Xóa phần này cùng nội dung bên trong?",
          "Remove this section and its content?",
        ),
      )
    )
      mutate(run);
  };
  return (
    <Stack>
      <Text c="dimmed">
        {t(
          "Điểm tối đa được tính từ điểm của từng câu. Lưu nháp rồi xem trước trước khi gửi duyệt.",
          "Maximum scores are calculated from question points. Save and preview before sending for review.",
        )}
      </Text>
      <Accordion multiple>
        {sections.map((s, si) => (
          <Accordion.Item key={si} value={String(si)}>
            <Accordion.Control>
              {si + 1}. {s.sectionType} · {s.parts.length} {t("phần", "parts")}{" "}
              · {s.maxRawScore} {t("điểm", "points")}
            </Accordion.Control>
            <Accordion.Panel>
              <Stack>
                <Group grow>
                  <Select
                    label={t("Kỹ năng", "Skill")}
                    // Choice questions only: Writing and Speaking need an
                    // essay or a recording and a rubric, which live in
                    // Writing & Speaking. An older paper may still hold one,
                    // so it stays visible - with the reason it cannot stay.
                    data={
                      isProductive(s.sectionType)
                        ? ["LISTENING", "READING", s.sectionType]
                        : ["LISTENING", "READING"]
                    }
                    error={
                      isProductive(s.sectionType)
                        ? t(
                            "Đề thi thử chỉ chấm câu trắc nghiệm. Soạn Writing/Speaking ở Quản trị → Writing & Speaking, rồi đổi phần này sang Listening hoặc Reading.",
                            "Mock exams score choice questions only. Author Writing/Speaking under Admin → Writing & Speaking, then switch this section to Listening or Reading.",
                          )
                        : undefined
                    }
                    value={s.sectionType}
                    disabled={disabled}
                    allowDeselect={false}
                    onChange={(v) =>
                      mutate((a) => {
                        a[si].sectionType = v ?? "READING";
                      })
                    }
                  />
                  <NumberInput
                    label={t(
                      "Thời gian riêng (giây, tùy chọn)",
                      "Section time (seconds, optional)",
                    )}
                    value={s.timeLimitSeconds ?? ""}
                    min={1}
                    disabled={disabled}
                    onChange={(v) =>
                      mutate((a) => {
                        a[si].timeLimitSeconds = v === "" ? null : Number(v);
                      })
                    }
                  />
                </Group>
                {s.parts.map((p, pi) => (
                  <Card key={pi} withBorder>
                    <Stack>
                      <Group justify="space-between">
                        <Text fw={600}>
                          {t("Phần", "Part")} {pi + 1}
                        </Text>
                        <Button
                          color="red"
                          variant="subtle"
                          disabled={disabled}
                          onClick={() =>
                            remove((a) => a[si].parts.splice(pi, 1))
                          }
                        >
                          {t("Xóa phần", "Remove part")}
                        </Button>
                      </Group>
                      <TextInput
                        label={t("Tên phần", "Part title")}
                        required
                        value={p.title}
                        disabled={disabled}
                        error={
                          errors[`content.sections[${si}].parts[${pi}].title`]
                        }
                        onChange={(e) => {
                          const v = e.currentTarget.value;
                          mutate((a) => {
                            a[si].parts[pi].title = v;
                          });
                        }}
                      />
                      <Textarea
                        label={t("Hướng dẫn", "Instructions")}
                        value={p.instruction ?? ""}
                        disabled={disabled}
                        onChange={(e) => {
                          const v = e.currentTarget.value;
                          mutate((a) => {
                            a[si].parts[pi].instruction = v;
                          });
                        }}
                      />
                      <Textarea
                        label={t(
                          "Bài đọc / nội dung chung",
                          "Passage / shared content",
                        )}
                        autosize
                        minRows={3}
                        value={p.content ?? ""}
                        disabled={disabled}
                        onChange={(e) => {
                          const v = e.currentTarget.value;
                          mutate((a) => {
                            a[si].parts[pi].content = v;
                          });
                        }}
                      />
                      <Group grow>
                        <AuthoringMedia
                          onBusyChange={onMediaBusy}
                          kind="EXAM"
                          id={id}
                          url={p.audioUrl ?? media?.[p.audioObjectKey ?? ""]}
                          disabled={disabled}
                          onUploaded={(key, url) =>
                            mutate((a) => {
                              a[si].parts[pi].audioObjectKey = key;
                              a[si].parts[pi].audioUrl = url;
                            })
                          }
                        />
                        <AuthoringMedia
                          onBusyChange={onMediaBusy}
                          kind="EXAM"
                          id={id}
                          image
                          url={p.imageUrl ?? media?.[p.imageObjectKey ?? ""]}
                          disabled={disabled}
                          onUploaded={(key, url) =>
                            mutate((a) => {
                              a[si].parts[pi].imageObjectKey = key;
                              a[si].parts[pi].imageUrl = url;
                            })
                          }
                        />
                      </Group>
                      {p.questionSets.map((set, qi) => (
                        <Card
                          key={qi}
                          withBorder
                          bg="var(--mantine-color-gray-0)"
                        >
                          <Stack>
                            <Group justify="space-between">
                              <Text fw={600}>
                                {t("Nhóm câu", "Question group")} {qi + 1}
                              </Text>
                              <Button
                                variant="subtle"
                                color="red"
                                disabled={disabled}
                                onClick={() =>
                                  remove((a) =>
                                    a[si].parts[pi].questionSets.splice(qi, 1),
                                  )
                                }
                              >
                                {t("Xóa nhóm", "Remove group")}
                              </Button>
                            </Group>
                            <TextInput
                              label={t("Tên nhóm", "Group title")}
                              value={set.title ?? ""}
                              disabled={disabled}
                              onChange={(e) => {
                                const v = e.currentTarget.value;
                                mutate((a) => {
                                  a[si].parts[pi].questionSets[qi].title = v;
                                });
                              }}
                            />
                            <Textarea
                              label={t("Hướng dẫn nhóm", "Group instructions")}
                              value={set.instruction ?? ""}
                              disabled={disabled}
                              onChange={(e) => {
                                const v = e.currentTarget.value;
                                mutate((a) => {
                                  a[si].parts[pi].questionSets[qi].instruction =
                                    v;
                                });
                              }}
                            />
                            <Textarea
                              label={t("Nội dung nhóm", "Group passage")}
                              value={set.content ?? ""}
                              disabled={disabled}
                              onChange={(e) => {
                                const v = e.currentTarget.value;
                                mutate((a) => {
                                  a[si].parts[pi].questionSets[qi].content = v;
                                });
                              }}
                            />
                            <Group grow>
                              <AuthoringMedia
                                onBusyChange={onMediaBusy}
                                kind="EXAM"
                                id={id}
                                disabled={disabled}
                                url={
                                  set.audioUrl ??
                                  media?.[set.audioObjectKey ?? ""]
                                }
                                onUploaded={(key, url) =>
                                  mutate((a) => {
                                    a[si].parts[pi].questionSets[
                                      qi
                                    ].audioObjectKey = key;
                                    a[si].parts[pi].questionSets[qi].audioUrl =
                                      url;
                                  })
                                }
                              />
                              <AuthoringMedia
                                onBusyChange={onMediaBusy}
                                kind="EXAM"
                                id={id}
                                image
                                disabled={disabled}
                                url={
                                  set.imageUrl ??
                                  media?.[set.imageObjectKey ?? ""]
                                }
                                onUploaded={(key, url) =>
                                  mutate((a) => {
                                    a[si].parts[pi].questionSets[
                                      qi
                                    ].imageObjectKey = key;
                                    a[si].parts[pi].questionSets[qi].imageUrl =
                                      url;
                                  })
                                }
                              />
                            </Group>
                            {set.questions.map((q, ji) => {
                              const prefix = `content.sections[${si}].parts[${pi}].questionSets[${qi}].questions[${ji}]`;
                              const update = (v: ExamQuestion) =>
                                mutate((a) => {
                                  a[si].parts[pi].questionSets[qi].questions[
                                    ji
                                  ] = v;
                                });
                              return (
                                <Card key={ji} withBorder>
                                  <Stack>
                                    <Group justify="space-between">
                                      <Text fw={600}>
                                        {t("Câu", "Question")} {q.orderNo}
                                      </Text>
                                      <Button
                                        color="red"
                                        variant="subtle"
                                        disabled={disabled}
                                        onClick={() =>
                                          remove((a) =>
                                            a[si].parts[pi].questionSets[
                                              qi
                                            ].questions.splice(ji, 1),
                                          )
                                        }
                                      >
                                        {t("Xóa câu", "Remove question")}
                                      </Button>
                                    </Group>
                                    <Textarea
                                      label={t("Nội dung câu hỏi", "Question")}
                                      required
                                      value={q.content}
                                      disabled={disabled}
                                      error={errors[`${prefix}.content`]}
                                      onChange={(e) =>
                                        update({
                                          ...q,
                                          content: e.currentTarget.value,
                                        })
                                      }
                                    />
                                    <Group grow>
                                      <Select
                                        label={t("Dạng đáp án", "Answer type")}
                                        data={[
                                          {
                                            value: "SINGLE_CHOICE",
                                            label: t(
                                              "Một đáp án đúng",
                                              "One correct answer",
                                            ),
                                          },
                                          {
                                            value: "MULTIPLE_CHOICE",
                                            label: t(
                                              "Nhiều đáp án đúng",
                                              "Multiple correct answers",
                                            ),
                                          },
                                        ]}
                                        allowDeselect={false}
                                        value={q.questionType}
                                        disabled={disabled}
                                        onChange={(v) =>
                                          update({
                                            ...q,
                                            questionType: v ?? "SINGLE_CHOICE",
                                          })
                                        }
                                      />
                                      <Select
                                        label={t("Độ khó", "Difficulty")}
                                        data={["EASY", "MEDIUM", "HARD"]}
                                        allowDeselect={false}
                                        value={q.difficultyLevel}
                                        disabled={disabled}
                                        onChange={(v) =>
                                          update({
                                            ...q,
                                            difficultyLevel: v ?? "MEDIUM",
                                          })
                                        }
                                      />
                                      <NumberInput
                                        label={t("Điểm câu", "Question points")}
                                        min={0.5}
                                        step={0.5}
                                        error={errors[`${prefix}.maxRawScore`]}
                                        value={q.maxRawScore}
                                        disabled={disabled}
                                        onChange={(v) =>
                                          update({
                                            ...q,
                                            maxRawScore: Number(v),
                                          })
                                        }
                                      />
                                    </Group>
                                    <Group grow>
                                      <Select
                                        label={t(
                                          "Kỹ năng câu hỏi",
                                          "Question skill",
                                        )}
                                        data={[
                                          "LISTENING",
                                          "READING",
                                          "WRITING",
                                          "SPEAKING",
                                        ]}
                                        allowDeselect={false}
                                        value={q.skillType}
                                        disabled={disabled}
                                        onChange={(v) =>
                                          update({
                                            ...q,
                                            skillType: v ?? s.sectionType,
                                          })
                                        }
                                      />
                                      <TextInput
                                        label={t(
                                          "Nhóm kiến thức (tùy chọn)",
                                          "Category (optional)",
                                        )}
                                        value={q.questionCategory ?? ""}
                                        disabled={disabled}
                                        onChange={(e) =>
                                          update({
                                            ...q,
                                            questionCategory:
                                              e.currentTarget.value,
                                          })
                                        }
                                      />
                                    </Group>
                                    <OptionsEditor
                                      options={q.options}
                                      disabled={disabled}
                                      change={(options) =>
                                        update({ ...q, options })
                                      }
                                      error={errors[`${prefix}.options`]}
                                      single={
                                        q.questionType === "SINGLE_CHOICE"
                                      }
                                    />
                                    <Group>
                                      <Button
                                        variant="light"
                                        disabled={
                                          disabled || q.options.length >= 10
                                        }
                                        onClick={() =>
                                          update({
                                            ...q,
                                            options: [
                                              ...q.options,
                                              {
                                                label: String.fromCharCode(
                                                  65 + q.options.length,
                                                ),
                                                content: "",
                                                correct: false,
                                                orderNo: q.options.length + 1,
                                              },
                                            ],
                                          })
                                        }
                                      >
                                        {t("Thêm đáp án", "Add option")}
                                      </Button>
                                      {q.options.length > 2 && (
                                        <Button
                                          variant="subtle"
                                          color="red"
                                          disabled={disabled}
                                          onClick={() =>
                                            update({
                                              ...q,
                                              options: q.options.slice(0, -1),
                                            })
                                          }
                                        >
                                          {t(
                                            "Bớt đáp án cuối",
                                            "Remove last option",
                                          )}
                                        </Button>
                                      )}
                                    </Group>
                                    <Textarea
                                      label={t(
                                        "Giải thích đáp án",
                                        "Answer explanation",
                                      )}
                                      value={q.explanation ?? ""}
                                      disabled={disabled}
                                      onChange={(e) =>
                                        update({
                                          ...q,
                                          explanation: e.currentTarget.value,
                                        })
                                      }
                                    />
                                  </Stack>
                                </Card>
                              );
                            })}
                            <Button
                              variant="light"
                              disabled={disabled}
                              onClick={() =>
                                mutate((a) =>
                                  a[si].parts[pi].questionSets[
                                    qi
                                  ].questions.push(
                                    blankQuestion(s.sectionType),
                                  ),
                                )
                              }
                            >
                              {t("Thêm câu hỏi", "Add question")}
                            </Button>
                          </Stack>
                        </Card>
                      ))}
                      <Button
                        variant="light"
                        disabled={disabled}
                        onClick={() =>
                          mutate((a) =>
                            a[si].parts[pi].questionSets.push(blankSet()),
                          )
                        }
                      >
                        {t("Thêm nhóm câu hỏi", "Add question group")}
                      </Button>
                    </Stack>
                  </Card>
                ))}
                <Group>
                  <Button
                    variant="light"
                    disabled={disabled}
                    onClick={() => mutate((a) => a[si].parts.push(blankPart()))}
                  >
                    {t("Thêm phần", "Add part")}
                  </Button>
                  <Button
                    color="red"
                    variant="subtle"
                    disabled={disabled}
                    onClick={() => remove((a) => a.splice(si, 1))}
                  >
                    {t("Xóa kỹ năng", "Remove section")}
                  </Button>
                </Group>
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
      <Button
        variant="light"
        disabled={disabled || sections.length >= 4}
        onClick={() =>
          mutate((a) =>
            a.push({
              sectionType: a.some((s) => s.sectionType === "READING")
                ? "LISTENING"
                : "READING",
              orderNo: a.length + 1,
              maxRawScore: 0,
              scoredByCriteria: false,
              parts: [blankPart()],
            }),
          )
        }
      >
        {t("Thêm kỹ năng", "Add section")}
      </Button>
    </Stack>
  );
}

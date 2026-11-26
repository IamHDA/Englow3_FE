import { useState } from "react";
import { Alert, Pressable, Switch, View } from "react-native";

import {
  AppText,
  Button,
  Card,
  Chip,
  ChipRow,
  Row,
  TextField,
} from "@/ui/components";
import { colors, radius, spacing } from "@/ui/theme";

import { OptionsEditor } from "./EntryFields";
import {
  blankPart,
  blankQuestion,
  blankSet,
  changeQuestionType,
  isProductive,
  newSection,
  normalizeExam,
} from "./exam";
import {
  ExamQuestionKind,
  hasOwnOptions,
  MAX_ACCEPTED_ANSWER_LENGTH,
  MAX_SET_OPTION_LABEL_LENGTH,
} from "./examQuestionTypes";
import { MediaUpload } from "./MediaUpload";
import type {
  ExamAcceptedAnswer,
  ExamQuestion,
  ExamSection,
  ExamSetOption,
} from "./types";

const ANSWER_TYPES: [string, string][] = [
  [ExamQuestionKind.SINGLE_CHOICE, "Một đáp án đúng"],
  [ExamQuestionKind.MULTIPLE_CHOICE, "Nhiều đáp án đúng"],
  [ExamQuestionKind.TEXT_ENTRY, "Điền từ"],
  [ExamQuestionKind.MATCHING, "Ghép với danh sách của nhóm"],
];

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

/**
 * An exam's sections, parts, question groups and questions, as the web's
 * ExamTreeEditor. Every change renumbers the tree and recounts section points.
 */
export function ExamTree({
  sections,
  change,
  id,
  errors,
  disabled,
  media,
  onMediaBusy,
}: {
  sections: ExamSection[];
  change: (sections: ExamSection[]) => void;
  id?: string;
  errors: Record<string, string>;
  disabled?: boolean;
  media?: Record<string, string>;
  onMediaBusy?: (active: boolean) => void;
}) {
  const [open, setOpen] = useState<number | null>(sections.length ? 0 : null);

  function mutate(run: (draft: ExamSection[]) => void) {
    const next = clone(sections);
    run(next);
    change(normalizeExam(next));
  }

  function remove(what: string, run: (draft: ExamSection[]) => void) {
    Alert.alert(`Xoá ${what}?`, "Nội dung bên trong cũng bị xoá.", [
      { text: "Huỷ", style: "cancel" },
      { text: "Xoá", style: "destructive", onPress: () => mutate(run) },
    ]);
  }

  return (
    <View>
      <AppText
        variant="caption"
        tone="muted"
        style={{ marginBottom: spacing.sm }}
      >
        Điểm tối đa được tính từ điểm của từng câu. Lưu nháp rồi xem trước trước
        khi gửi duyệt.
      </AppText>
      {sections.map((section, si) => {
        const expanded = open === si;
        return (
          <Card key={si} style={{ marginBottom: spacing.md }}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded }}
              onPress={() => setOpen(expanded ? null : si)}
            >
              <Row style={{ justifyContent: "space-between" }}>
                <AppText variant="label" style={{ flex: 1 }}>
                  {si + 1}. {section.sectionType} · {section.parts.length} phần
                  · {section.maxRawScore} điểm
                </AppText>
                <AppText tone="primary">{expanded ? "Thu gọn" : "Mở"}</AppText>
              </Row>
            </Pressable>
            {expanded ? (
              <View style={{ marginTop: spacing.sm }}>
                <AppText variant="label">Kỹ năng</AppText>
                <ChipRow>
                  {(isProductive(section.sectionType)
                    ? ["LISTENING", "READING", section.sectionType]
                    : ["LISTENING", "READING"]
                  ).map((type) => (
                    <Chip
                      key={type}
                      label={type}
                      selected={section.sectionType === type}
                      onPress={() =>
                        !disabled &&
                        mutate((draft) => {
                          draft[si]!.sectionType = type;
                        })
                      }
                    />
                  ))}
                </ChipRow>
                {isProductive(section.sectionType) ? (
                  <AppText variant="caption" tone="danger">
                    Đề thi thử chỉ chấm câu trắc nghiệm. Soạn Writing/Speaking ở
                    Quản trị → Đề Nói & Viết, rồi đổi phần này sang Listening
                    hoặc Reading.
                  </AppText>
                ) : null}
                <TextField
                  label="Thời gian riêng (giây, tùy chọn)"
                  value={
                    section.timeLimitSeconds == null
                      ? ""
                      : String(section.timeLimitSeconds)
                  }
                  keyboardType="number-pad"
                  editable={!disabled}
                  onChangeText={(text) => {
                    const digits = text.replace(/\D/g, "");
                    mutate((draft) => {
                      draft[si]!.timeLimitSeconds = digits
                        ? Number(digits)
                        : null;
                    });
                  }}
                />

                {section.parts.map((part, pi) => {
                  const partPath = `content.sections[${si}].parts[${pi}]`;
                  return (
                    <View key={pi} style={styles.part}>
                      <Row style={{ justifyContent: "space-between" }}>
                        <AppText variant="label">Phần {pi + 1}</AppText>
                        <Button
                          title="Xoá phần"
                          size="sm"
                          variant="ghost"
                          disabled={disabled}
                          onPress={() =>
                            remove("phần này", (draft) =>
                              draft[si]!.parts.splice(pi, 1),
                            )
                          }
                        />
                      </Row>
                      <TextField
                        label="Tên phần *"
                        value={part.title}
                        editable={!disabled}
                        error={errors[`${partPath}.title`]}
                        onChangeText={(title) =>
                          mutate((draft) => {
                            draft[si]!.parts[pi]!.title = title;
                          })
                        }
                      />
                      <TextField
                        label="Hướng dẫn"
                        value={part.instruction ?? ""}
                        multiline
                        editable={!disabled}
                        onChangeText={(instruction) =>
                          mutate((draft) => {
                            draft[si]!.parts[pi]!.instruction = instruction;
                          })
                        }
                      />
                      <TextField
                        label="Bài đọc / nội dung chung"
                        value={part.content ?? ""}
                        multiline
                        editable={!disabled}
                        onChangeText={(content) =>
                          mutate((draft) => {
                            draft[si]!.parts[pi]!.content = content;
                          })
                        }
                      />
                      <MediaUpload
                        kind="EXAM"
                        id={id}
                        disabled={disabled}
                        onBusyChange={onMediaBusy}
                        url={
                          part.audioUrl ?? media?.[part.audioObjectKey ?? ""]
                        }
                        onUploaded={(key, url) =>
                          mutate((draft) => {
                            draft[si]!.parts[pi]!.audioObjectKey = key;
                            draft[si]!.parts[pi]!.audioUrl = url;
                          })
                        }
                      />
                      <MediaUpload
                        kind="EXAM"
                        id={id}
                        image
                        disabled={disabled}
                        onBusyChange={onMediaBusy}
                        url={
                          part.imageUrl ?? media?.[part.imageObjectKey ?? ""]
                        }
                        onUploaded={(key, url) =>
                          mutate((draft) => {
                            draft[si]!.parts[pi]!.imageObjectKey = key;
                            draft[si]!.parts[pi]!.imageUrl = url;
                          })
                        }
                      />

                      {part.questionSets.map((set, qi) => {
                        const setPath = `${partPath}.questionSets[${qi}]`;
                        const at = (draft: ExamSection[]) =>
                          draft[si]!.parts[pi]!.questionSets[qi]!;
                        return (
                          <View key={qi} style={styles.set}>
                            <Row style={{ justifyContent: "space-between" }}>
                              <AppText variant="label">
                                Nhóm câu {qi + 1}
                              </AppText>
                              <Button
                                title="Xoá nhóm"
                                size="sm"
                                variant="ghost"
                                disabled={disabled}
                                onPress={() =>
                                  remove("nhóm câu này", (draft) =>
                                    draft[si]!.parts[pi]!.questionSets.splice(
                                      qi,
                                      1,
                                    ),
                                  )
                                }
                              />
                            </Row>
                            <TextField
                              label="Tên nhóm"
                              value={set.title ?? ""}
                              editable={!disabled}
                              onChangeText={(title) =>
                                mutate((draft) => {
                                  at(draft).title = title;
                                })
                              }
                            />
                            <TextField
                              label="Hướng dẫn nhóm"
                              value={set.instruction ?? ""}
                              multiline
                              editable={!disabled}
                              onChangeText={(instruction) =>
                                mutate((draft) => {
                                  at(draft).instruction = instruction;
                                })
                              }
                            />
                            <TextField
                              label="Nội dung nhóm"
                              hint="Câu điền từ: đặt ô trống bằng {{n}}, n là số thứ tự của câu trong nhóm (vd. {{1}}, {{2}})."
                              value={set.content ?? ""}
                              multiline
                              editable={!disabled}
                              onChangeText={(content) =>
                                mutate((draft) => {
                                  at(draft).content = content;
                                })
                              }
                            />
                            <MediaUpload
                              kind="EXAM"
                              id={id}
                              disabled={disabled}
                              onBusyChange={onMediaBusy}
                              url={
                                set.audioUrl ??
                                media?.[set.audioObjectKey ?? ""]
                              }
                              onUploaded={(key, url) =>
                                mutate((draft) => {
                                  at(draft).audioObjectKey = key;
                                  at(draft).audioUrl = url;
                                })
                              }
                            />
                            <MediaUpload
                              kind="EXAM"
                              id={id}
                              image
                              disabled={disabled}
                              onBusyChange={onMediaBusy}
                              url={
                                set.imageUrl ??
                                media?.[set.imageObjectKey ?? ""]
                              }
                              onUploaded={(key, url) =>
                                mutate((draft) => {
                                  at(draft).imageObjectKey = key;
                                  at(draft).imageUrl = url;
                                })
                              }
                            />
                            <SetOptionsEditor
                              entries={set.setOptions ?? []}
                              disabled={disabled}
                              error={errors[`${setPath}.setOptions`]}
                              change={(entries) =>
                                mutate((draft) => {
                                  at(draft).setOptions = entries;
                                })
                              }
                            />
                            {set.questions.map((question, ji) => (
                              <QuestionEditor
                                key={ji}
                                question={question}
                                prefix={`${setPath}.questions[${ji}]`}
                                labels={[
                                  ...new Set(
                                    (set.setOptions ?? [])
                                      .map((entry) => entry.label.trim())
                                      .filter(Boolean),
                                  ),
                                ]}
                                sectionType={section.sectionType}
                                errors={errors}
                                disabled={disabled}
                                update={(next) =>
                                  mutate((draft) => {
                                    at(draft).questions[ji] = next;
                                  })
                                }
                                onRemove={() =>
                                  remove("câu hỏi này", (draft) =>
                                    at(draft).questions.splice(ji, 1),
                                  )
                                }
                              />
                            ))}
                            <Button
                              title="Thêm câu hỏi"
                              icon="add"
                              size="sm"
                              variant="secondary"
                              disabled={disabled}
                              onPress={() =>
                                mutate((draft) =>
                                  at(draft).questions.push(
                                    blankQuestion(section.sectionType),
                                  ),
                                )
                              }
                            />
                          </View>
                        );
                      })}
                      <Button
                        title="Thêm nhóm câu hỏi"
                        icon="add"
                        size="sm"
                        variant="secondary"
                        disabled={disabled}
                        onPress={() =>
                          mutate((draft) =>
                            draft[si]!.parts[pi]!.questionSets.push(blankSet()),
                          )
                        }
                        style={{ marginTop: spacing.sm }}
                      />
                    </View>
                  );
                })}
                <Row wrap gap={spacing.xs} style={{ marginTop: spacing.sm }}>
                  <Button
                    title="Thêm phần"
                    icon="add"
                    size="sm"
                    variant="secondary"
                    disabled={disabled}
                    onPress={() =>
                      mutate((draft) => draft[si]!.parts.push(blankPart()))
                    }
                  />
                  <Button
                    title="Xoá kỹ năng"
                    size="sm"
                    variant="danger"
                    disabled={disabled}
                    onPress={() =>
                      remove("kỹ năng này", (draft) => draft.splice(si, 1))
                    }
                  />
                </Row>
              </View>
            ) : null}
          </Card>
        );
      })}
      <Button
        title="Thêm kỹ năng"
        icon="add"
        variant="secondary"
        disabled={disabled || sections.length >= 4}
        onPress={() => {
          mutate((draft) => draft.push(newSection(draft)));
          setOpen(sections.length);
        }}
      />
    </View>
  );
}

function QuestionEditor({
  question,
  prefix,
  labels,
  sectionType,
  errors,
  disabled,
  update,
  onRemove,
}: {
  question: ExamQuestion;
  prefix: string;
  labels: string[];
  sectionType: string;
  errors: Record<string, string>;
  disabled?: boolean;
  update: (question: ExamQuestion) => void;
  onRemove: () => void;
}) {
  const [score, setScore] = useState(String(question.maxRawScore));
  return (
    <View style={styles.question}>
      <Row style={{ justifyContent: "space-between" }}>
        <AppText variant="label">Câu {question.orderNo}</AppText>
        <Button
          title="Xoá câu"
          size="sm"
          variant="ghost"
          disabled={disabled}
          onPress={onRemove}
        />
      </Row>
      <TextField
        label="Nội dung câu hỏi *"
        value={question.content}
        multiline
        editable={!disabled}
        error={errors[`${prefix}.content`]}
        onChangeText={(content) => update({ ...question, content })}
      />
      <AppText variant="label">Dạng đáp án</AppText>
      <ChipRow>
        {ANSWER_TYPES.map(([value, label]) => (
          <Chip
            key={value}
            label={label}
            selected={question.questionType === value}
            onPress={() =>
              !disabled && update(changeQuestionType(question, value))
            }
          />
        ))}
      </ChipRow>
      <AppText variant="label">Độ khó</AppText>
      <ChipRow>
        {["EASY", "MEDIUM", "HARD"].map((level) => (
          <Chip
            key={level}
            label={level}
            selected={question.difficultyLevel === level}
            onPress={() =>
              !disabled && update({ ...question, difficultyLevel: level })
            }
          />
        ))}
      </ChipRow>
      <AppText variant="label">Kỹ năng câu hỏi</AppText>
      <ChipRow>
        {["LISTENING", "READING", "WRITING", "SPEAKING"].map((skill) => (
          <Chip
            key={skill}
            label={skill}
            selected={(question.skillType || sectionType) === skill}
            onPress={() =>
              !disabled && update({ ...question, skillType: skill })
            }
          />
        ))}
      </ChipRow>
      <Row gap={spacing.sm}>
        <View style={{ flex: 1 }}>
          <TextField
            label="Điểm câu"
            value={score}
            keyboardType="decimal-pad"
            editable={!disabled}
            error={errors[`${prefix}.maxRawScore`]}
            onChangeText={(text) => {
              const clean = text.replace(",", ".").replace(/[^\d.]/g, "");
              setScore(clean);
              update({ ...question, maxRawScore: Number(clean) || 0 });
            }}
          />
        </View>
        <View style={{ flex: 1 }}>
          <TextField
            label="Nhóm kiến thức"
            value={question.questionCategory ?? ""}
            editable={!disabled}
            onChangeText={(questionCategory) =>
              update({ ...question, questionCategory })
            }
          />
        </View>
      </Row>

      {question.questionType === ExamQuestionKind.TEXT_ENTRY ? (
        <AcceptedAnswersEditor
          answers={question.acceptedAnswers ?? []}
          disabled={disabled}
          error={errors[`${prefix}.acceptedAnswers`]}
          change={(acceptedAnswers) => update({ ...question, acceptedAnswers })}
        />
      ) : null}

      {question.questionType === ExamQuestionKind.MATCHING ? (
        <View style={{ marginBottom: spacing.sm }}>
          <AppText variant="label">
            Đáp án (nhãn trong danh sách của nhóm) *
          </AppText>
          {labels.length === 0 ? (
            <AppText variant="caption" tone="muted">
              Thêm danh sách để ghép cho nhóm trước.
            </AppText>
          ) : null}
          <ChipRow>
            {labels.map((label) => {
              const chosen = (question.matchingLabels ?? []).includes(label);
              return (
                <Chip
                  key={label}
                  label={label}
                  selected={chosen}
                  onPress={() =>
                    !disabled &&
                    update({
                      ...question,
                      matchingLabels: chosen
                        ? (question.matchingLabels ?? []).filter(
                            (item) => item !== label,
                          )
                        : [...(question.matchingLabels ?? []), label],
                    })
                  }
                />
              );
            })}
          </ChipRow>
          {errors[`${prefix}.matchingLabels`] ? (
            <AppText variant="caption" tone="danger">
              {errors[`${prefix}.matchingLabels`]}
            </AppText>
          ) : null}
        </View>
      ) : null}

      {hasOwnOptions(question.questionType) ? (
        <>
          <OptionsEditor
            options={question.options}
            disabled={disabled}
            error={errors[`${prefix}.options`]}
            single={question.questionType === ExamQuestionKind.SINGLE_CHOICE}
            change={(options) => update({ ...question, options })}
          />
          <Row wrap gap={spacing.xs} style={{ marginBottom: spacing.sm }}>
            <Button
              title="Thêm đáp án"
              size="sm"
              variant="secondary"
              disabled={disabled || question.options.length >= 10}
              onPress={() =>
                update({
                  ...question,
                  options: [
                    ...question.options,
                    {
                      label: String.fromCharCode(65 + question.options.length),
                      content: "",
                      correct: false,
                      orderNo: question.options.length + 1,
                    },
                  ],
                })
              }
            />
            {question.options.length > 2 ? (
              <Button
                title="Bớt đáp án cuối"
                size="sm"
                variant="ghost"
                disabled={disabled}
                onPress={() =>
                  update({
                    ...question,
                    options: question.options.slice(0, -1),
                  })
                }
              />
            ) : null}
          </Row>
        </>
      ) : null}

      <TextField
        label="Giải thích đáp án"
        value={question.explanation ?? ""}
        multiline
        editable={!disabled}
        onChangeText={(explanation) => update({ ...question, explanation })}
      />
    </View>
  );
}

/**
 * The list every matching question of a group chooses from - headings i-x,
 * people A-E, map letters. As the web's SetOptionsEditor.
 */
function SetOptionsEditor({
  entries,
  change,
  error,
  disabled,
}: {
  entries: ExamSetOption[];
  change: (entries: ExamSetOption[]) => void;
  error?: string;
  disabled?: boolean;
}) {
  const renumber = (list: ExamSetOption[]) =>
    list.map((entry, i) => ({ ...entry, orderNo: i + 1 }));
  return (
    <View style={{ marginBottom: spacing.sm }}>
      <AppText variant="label">Danh sách để ghép (câu dạng ghép)</AppText>
      <AppText variant="caption" tone="muted">
        Chỉ cần khi nhóm có câu dạng ghép. Nhãn như i, ii, iii hoặc A, B, C.
      </AppText>
      {entries.map((entry, i) => (
        <Row key={i} gap={spacing.xs} style={{ alignItems: "center" }}>
          <View style={{ width: 80 }}>
            <TextField
              placeholder="Nhãn"
              accessibilityLabel={`Nhãn ${i + 1}`}
              value={entry.label}
              maxLength={MAX_SET_OPTION_LABEL_LENGTH}
              autoCapitalize="none"
              editable={!disabled}
              onChangeText={(label) =>
                change(
                  entries.map((item, j) =>
                    j === i ? { ...item, label } : item,
                  ),
                )
              }
            />
          </View>
          <View style={{ flex: 1 }}>
            <TextField
              placeholder="Nội dung (tùy chọn)"
              accessibilityLabel={`Nội dung mục ${i + 1}`}
              value={entry.content ?? ""}
              editable={!disabled}
              onChangeText={(content) =>
                change(
                  entries.map((item, j) =>
                    j === i ? { ...item, content } : item,
                  ),
                )
              }
            />
          </View>
          <Button
            title="Xoá"
            size="sm"
            variant="ghost"
            disabled={disabled}
            onPress={() => change(renumber(entries.filter((_, j) => j !== i)))}
          />
        </Row>
      ))}
      {error ? (
        <AppText variant="caption" tone="danger">
          {error}
        </AppText>
      ) : null}
      <Button
        title="Thêm mục"
        icon="add"
        size="sm"
        variant="ghost"
        disabled={disabled}
        onPress={() =>
          change(
            renumber([
              ...entries,
              {
                label: String.fromCharCode(65 + entries.length),
                content: "",
                orderNo: 0,
              },
            ]),
          )
        }
      />
    </View>
  );
}

/** Every spelling a gap accepts; capitals and spaces are folded unless ticked. As the web's AcceptedAnswersEditor. */
function AcceptedAnswersEditor({
  answers,
  change,
  error,
  disabled,
}: {
  answers: ExamAcceptedAnswer[];
  change: (answers: ExamAcceptedAnswer[]) => void;
  error?: string;
  disabled?: boolean;
}) {
  const renumber = (list: ExamAcceptedAnswer[]) =>
    list.map((answer, i) => ({ ...answer, orderNo: i + 1 }));
  return (
    <View style={{ marginBottom: spacing.sm }}>
      <AppText variant="label">Đáp án được chấp nhận *</AppText>
      <AppText variant="caption" tone="muted">
        Liệt kê mọi cách viết đúng (ví dụ: 7, seven). Không phân biệt hoa thường
        và khoảng trắng thừa, trừ khi bật &quot;Hoa thường&quot;.
      </AppText>
      {answers.map((answer, i) => (
        <Row key={i} gap={spacing.xs} style={{ alignItems: "center" }}>
          <View style={{ flex: 1 }}>
            <TextField
              accessibilityLabel={`Đáp án ${i + 1}`}
              value={answer.text}
              maxLength={MAX_ACCEPTED_ANSWER_LENGTH}
              autoCapitalize="none"
              editable={!disabled}
              onChangeText={(text) =>
                change(
                  answers.map((item, j) =>
                    j === i ? { ...item, text } : item,
                  ),
                )
              }
            />
          </View>
          <View style={{ alignItems: "center" }}>
            <AppText variant="caption">Hoa thường</AppText>
            <Switch
              value={answer.caseSensitive}
              disabled={disabled}
              trackColor={{ true: colors.primary }}
              accessibilityLabel={`Đáp án ${i + 1} phân biệt hoa thường`}
              onValueChange={(caseSensitive) =>
                change(
                  answers.map((item, j) =>
                    j === i ? { ...item, caseSensitive } : item,
                  ),
                )
              }
            />
          </View>
          <Button
            title="Xoá"
            size="sm"
            variant="ghost"
            disabled={disabled}
            onPress={() => change(renumber(answers.filter((_, j) => j !== i)))}
          />
        </Row>
      ))}
      {error ? (
        <AppText variant="caption" tone="danger">
          {error}
        </AppText>
      ) : null}
      <Button
        title="Thêm cách viết"
        icon="add"
        size="sm"
        variant="ghost"
        disabled={disabled}
        onPress={() =>
          change(
            renumber([
              ...answers,
              { text: "", caseSensitive: false, orderNo: 0 },
            ]),
          )
        }
      />
    </View>
  );
}

const styles = {
  part: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    marginTop: spacing.md,
  },
  set: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  question: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    marginVertical: spacing.sm,
  },
} as const;

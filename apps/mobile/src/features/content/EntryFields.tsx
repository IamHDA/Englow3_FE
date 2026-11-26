import { Switch, View } from "react-native";

import {
  AppText,
  Button,
  Chip,
  ChipRow,
  Row,
  TextField,
} from "@/ui/components";
import { colors, spacing } from "@/ui/theme";

import {
  quizBaseFields,
  questionTypes,
  quizShapeFields,
  type Field,
} from "./fields";
import type { Entry, Option } from "./types";

/** Text inputs for a list of fields; list fields take one item per line. As the web's Fields. */
export function Fields({
  fields,
  value,
  change,
  errors,
  prefix,
  disabled,
}: {
  fields: Field[];
  value: Entry;
  change: (value: Entry) => void;
  errors: Record<string, string>;
  prefix: string;
  disabled?: boolean;
}) {
  return (
    <>
      {fields.map((field) => {
        const raw = value[field.key];
        const text = Array.isArray(raw)
          ? raw.join("\n")
          : typeof raw === "string"
            ? raw
            : "";
        return (
          <TextField
            key={field.key}
            label={`${field.vi}${field.required ? " *" : ""}`}
            hint={field.list ? "Mỗi mục trên một dòng." : undefined}
            value={text}
            multiline={field.multiline || field.list}
            editable={!disabled}
            error={errors[`${prefix}.${field.key}`]}
            autoCapitalize={field.list ? "none" : "sentences"}
            onChangeText={(next) =>
              change({
                ...value,
                [field.key]: field.list ? next.split("\n") : next,
              })
            }
          />
        );
      })}
    </>
  );
}

/** Answer options with a "correct" switch each; `single` keeps one switched on. */
export function OptionsEditor({
  options,
  change,
  error,
  disabled,
  single,
}: {
  options: Option[];
  change: (value: Option[]) => void;
  error?: string;
  disabled?: boolean;
  single?: boolean;
}) {
  return (
    <View>
      {options.map((option, index) => (
        <Row key={index} gap={spacing.sm} style={{ alignItems: "center" }}>
          <View style={{ flex: 1 }}>
            <TextField
              label={`Đáp án ${String.fromCharCode(65 + index)} *`}
              value={option.content}
              editable={!disabled}
              error={index === 0 ? error : undefined}
              onChangeText={(content) =>
                change(
                  options.map((item, j) =>
                    j === index ? { ...item, content } : item,
                  ),
                )
              }
            />
          </View>
          <View style={{ alignItems: "center" }}>
            <AppText variant="caption">Đúng</AppText>
            <Switch
              value={option.correct}
              disabled={disabled}
              trackColor={{ true: colors.success }}
              accessibilityLabel={`Đáp án ${String.fromCharCode(65 + index)} đúng`}
              onValueChange={(correct) =>
                change(
                  options.map((item, j) =>
                    j === index
                      ? { ...item, correct }
                      : single && correct
                        ? { ...item, correct: false }
                        : item,
                  ),
                )
              }
            />
          </View>
        </Row>
      ))}
    </View>
  );
}

/** A count stepper for options and pairs (2–10), as the web's NumberInput there. */
function Counter({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  return (
    <Row
      gap={spacing.sm}
      style={{ alignItems: "center", marginBottom: spacing.sm }}
    >
      <AppText variant="label" style={{ flex: 1 }}>
        {label}: {value}
      </AppText>
      <Button
        title="−"
        size="sm"
        variant="secondary"
        disabled={disabled || value <= 2}
        onPress={() => onChange(value - 1)}
      />
      <Button
        title="+"
        size="sm"
        variant="secondary"
        disabled={disabled || value >= 10}
        onPress={() => onChange(value + 1)}
      />
    </Row>
  );
}

/** One quiz question: its type, prompt, points and the answer shape that type needs. As the web's QuizFields. */
export function QuizFields({
  value,
  change,
  errors,
  prefix,
  disabled,
}: {
  value: Entry;
  change: (value: Entry) => void;
  errors: Record<string, string>;
  prefix: string;
  disabled?: boolean;
}) {
  const type = value.questionType;
  const points = value.points ?? 1;
  return (
    <>
      <AppText variant="label">Dạng câu hỏi</AppText>
      <ChipRow>
        {questionTypes.map((option) => (
          <Chip
            key={option.value}
            label={option.vi}
            selected={type === option.value}
            onPress={() =>
              !disabled && change({ ...value, questionType: option.value })
            }
          />
        ))}
      </ChipRow>
      <Fields
        fields={[...quizBaseFields, ...quizShapeFields(type)]}
        value={value}
        change={change}
        errors={errors}
        prefix={prefix}
        disabled={disabled}
      />
      <TextField
        label="Điểm"
        value={Number.isFinite(points) ? String(points) : ""}
        keyboardType="number-pad"
        editable={!disabled}
        error={errors[`${prefix}.points`]}
        onChangeText={(text) =>
          change({ ...value, points: Number(text.replace(/\D/g, "")) })
        }
      />
      {type === "MULTIPLE_CHOICE" ? (
        <>
          <Counter
            label="Số đáp án"
            value={value.options?.length ?? 2}
            disabled={disabled}
            onChange={(count) =>
              change({
                ...value,
                options: Array.from(
                  { length: count },
                  (_, i) =>
                    value.options?.[i] ?? {
                      label: String.fromCharCode(65 + i),
                      content: "",
                      correct: false,
                    },
                ),
              })
            }
          />
          <OptionsEditor
            options={value.options ?? []}
            disabled={disabled}
            error={errors[`${prefix}.options`]}
            change={(options) => change({ ...value, options })}
          />
        </>
      ) : null}
      {type === "MATCHING" ? (
        <>
          <Counter
            label="Số cặp"
            value={value.pairs?.length ?? 2}
            disabled={disabled}
            onChange={(count) =>
              change({
                ...value,
                pairs: Array.from(
                  { length: count },
                  (_, i) => value.pairs?.[i] ?? { leftText: "", rightText: "" },
                ),
              })
            }
          />
          {errors[`${prefix}.pairs`] ? (
            <AppText variant="caption" tone="danger">
              {errors[`${prefix}.pairs`]}
            </AppText>
          ) : null}
          {(value.pairs ?? []).map((pair, i) => (
            <Row key={i} gap={spacing.sm}>
              <View style={{ flex: 1 }}>
                <TextField
                  label={`Vế trái ${i + 1} *`}
                  value={pair.leftText}
                  editable={!disabled}
                  onChangeText={(leftText) =>
                    change({
                      ...value,
                      pairs: (value.pairs ?? []).map((item, j) =>
                        j === i ? { ...item, leftText } : item,
                      ),
                    })
                  }
                />
              </View>
              <View style={{ flex: 1 }}>
                <TextField
                  label={`Vế phải ${i + 1} *`}
                  value={pair.rightText}
                  editable={!disabled}
                  onChangeText={(rightText) =>
                    change({
                      ...value,
                      pairs: (value.pairs ?? []).map((item, j) =>
                        j === i ? { ...item, rightText } : item,
                      ),
                    })
                  }
                />
              </View>
            </Row>
          ))}
        </>
      ) : null}
    </>
  );
}

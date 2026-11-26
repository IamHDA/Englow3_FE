import { Image, View } from "react-native";

import { ClipPlayer } from "@/ui/audio";
import { AppText, Badge, Card } from "@/ui/components";
import { radius, spacing } from "@/ui/theme";

import { entriesOf } from "./document";
import { questionTypes } from "./fields";
import type { AuthoringDocument, AuthoringKind } from "./types";

type MediaNode = {
  audioObjectKey?: string | null;
  imageObjectKey?: string | null;
  audioUrl?: string;
  imageUrl?: string;
};

/** What the learner will see, with the answer key marked. As the web's ContentPreview. */
export function ContentPreview({
  kind,
  doc,
}: {
  kind: AuthoringKind;
  doc: AuthoringDocument;
}) {
  const entries = entriesOf(kind, doc);
  const block = (text?: string | null) =>
    text ? <AppText selectable>{text}</AppText> : null;
  const mediaOf = (node: MediaNode) => {
    const audio =
      node.audioUrl ||
      (node.audioObjectKey ? doc.media?.[node.audioObjectKey] : undefined);
    const image =
      node.imageUrl ||
      (node.imageObjectKey ? doc.media?.[node.imageObjectKey] : undefined);
    return (
      <>
        {audio ? <ClipPlayer url={audio} /> : null}
        {image ? (
          <Image
            source={{ uri: image }}
            resizeMode="contain"
            accessibilityLabel="Ảnh trong đề"
            style={{
              width: "100%",
              aspectRatio: 4 / 3,
              borderRadius: radius.md,
            }}
          />
        ) : null}
      </>
    );
  };
  const gap = { marginBottom: spacing.sm };

  return (
    <View>
      <Card style={gap}>
        <AppText variant="heading">
          {doc.metadata.name || doc.metadata.title}
        </AppText>
        {block(doc.metadata.description)}
        {kind === "SPEAKING_PROMPT" ? (
          <>
            {block(doc.metadata.referenceText)}
            {block(doc.metadata.ipaTranscript)}
            {block(doc.metadata.translationVi)}
            {doc.metadata.tips?.map((tip, i) => (
              <AppText key={i}>• {tip}</AppText>
            ))}
          </>
        ) : null}
      </Card>

      {entries.map((entry, i) => (
        <Card key={i} style={gap}>
          <AppText variant="label">
            {i + 1}. {entry.lemma || entry.title || entry.text}
          </AppText>
          {kind === "FLASHCARD_SET" ? (
            <>
              {block(entry.ipaUs)}
              {block(entry.ipaUk)}
              {entry.audioUsUrl ||
              (entry.audioUsObjectKey &&
                doc.media?.[entry.audioUsObjectKey]) ? (
                <>
                  <AppText variant="caption">US</AppText>
                  <ClipPlayer
                    url={
                      entry.audioUsUrl ??
                      doc.media?.[entry.audioUsObjectKey ?? ""] ??
                      ""
                    }
                  />
                </>
              ) : null}
              {entry.audioUkUrl ||
              (entry.audioUkObjectKey &&
                doc.media?.[entry.audioUkObjectKey]) ? (
                <>
                  <AppText variant="caption">UK</AppText>
                  <ClipPlayer
                    url={
                      entry.audioUkUrl ??
                      doc.media?.[entry.audioUkObjectKey ?? ""] ??
                      ""
                    }
                  />
                </>
              ) : null}
              {block(entry.definitionEn)}
              {block(entry.definitionVi)}
              {block(entry.exampleSentence)}
              {block(entry.exampleTranslationVi)}
              {block(entry.mnemonicTipVi)}
            </>
          ) : kind === "DICTATION_LESSON" ? (
            <>
              {mediaOf(entry)}
              {block(entry.translationVi)}
            </>
          ) : (
            <>
              <Badge
                label={
                  questionTypes.find(
                    (type) => type.value === entry.questionType,
                  )?.vi ??
                  entry.questionType ??
                  ""
                }
              />
              {block(entry.prompt)}
              {block(entry.originalSentence)}
              {block(entry.beforeText)}
              {block(entry.afterText)}
              {entry.questionType === "MULTIPLE_CHOICE"
                ? entry.options?.map((option, j) => (
                    <AppText
                      key={j}
                      tone={option.correct ? "success" : "muted"}
                    >
                      {option.label}. {option.content}{" "}
                      {option.correct ? "✓" : ""}
                    </AppText>
                  ))
                : null}
              {entry.questionType === "FILL_BLANK"
                ? block(entry.acceptedAnswers?.join(" / "))
                : null}
              {entry.questionType === "REWRITE"
                ? block(entry.correctWords?.join(" "))
                : null}
              {entry.questionType === "REORDER"
                ? block(entry.correctOrder?.join(" "))
                : null}
              {entry.questionType === "MATCHING"
                ? entry.pairs?.map((pair, j) => (
                    <AppText key={j}>
                      {pair.leftText} ↔ {pair.rightText}
                    </AppText>
                  ))
                : null}
              {block(entry.explanation)}
            </>
          )}
        </Card>
      ))}

      {kind === "EXAM"
        ? doc.content?.sections?.map((section, si) => (
            <Card key={si} style={gap}>
              <AppText variant="heading">
                {section.sectionType} · {section.maxRawScore} điểm
              </AppText>
              {section.parts.map((part, pi) => (
                <View key={pi} style={{ marginTop: spacing.sm }}>
                  <AppText variant="label">{part.title}</AppText>
                  {block(part.instruction)}
                  {block(part.content)}
                  {mediaOf(part)}
                  {part.questionSets.map((set, qi) => (
                    <View key={qi} style={{ marginTop: spacing.sm }}>
                      {set.title ? (
                        <AppText variant="label">{set.title}</AppText>
                      ) : null}
                      {block(set.instruction)}
                      {block(set.content)}
                      {mediaOf(set)}
                      {(set.setOptions ?? []).map((entry) => (
                        <AppText key={entry.label} variant="caption">
                          {entry.label}. {entry.content}
                        </AppText>
                      ))}
                      {set.questions.map((question) => (
                        <View
                          key={question.orderNo}
                          style={{ marginTop: spacing.xs }}
                        >
                          <AppText variant="label">
                            {question.orderNo}. {question.content}
                          </AppText>
                          {question.options.map((option, oi) => (
                            <AppText
                              key={oi}
                              tone={option.correct ? "success" : "muted"}
                            >
                              {String.fromCharCode(65 + oi)}. {option.content}{" "}
                              {option.correct ? "✓" : ""}
                            </AppText>
                          ))}
                          {question.acceptedAnswers?.length ? (
                            <AppText tone="success">
                              {question.acceptedAnswers
                                .map((answer) => answer.text)
                                .join(" / ")}
                            </AppText>
                          ) : null}
                          {question.matchingLabels?.length ? (
                            <AppText tone="success">
                              → {question.matchingLabels.join(", ")}
                            </AppText>
                          ) : null}
                          {block(question.explanation)}
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              ))}
            </Card>
          ))
        : null}
    </View>
  );
}

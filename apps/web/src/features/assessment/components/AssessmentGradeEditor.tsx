"use client";
import { useAssessmentText } from "../hooks/useAssessmentText";
import {
  Alert,
  Button,
  Card,
  Group,
  Grid,
  NumberInput,
  Stack,
  Tabs,
  Text,
  Textarea,
} from "@mantine/core";
import { useRef, useState } from "react";
import { useRecoverableForm } from "@/shared/hooks/useRecoverableForm";
import { isGradingDraft } from "../types/gradingDraft";
import { EditorFrame } from "@/shared/components/EditorFrame";
import { notifications } from "@mantine/notifications";
import { useAssessmentGradeMutation } from "@/lib/graphql/generated/hooks";
import {
  criteriaFor,
  criterionLabels,
  parseReport,
  type PracticeAttempt,
} from "../types";
import { TaskInstructions } from "./TaskInstructions";
export function AssessmentGradeEditor({
  attempt,
  close,
  done,
  standalone = false,
}: {
  standalone?: boolean;
  attempt: PracticeAttempt;
  close: () => void;
  done: () => Promise<unknown>;
}) {
  const tx = useAssessmentText();
  const existing = parseReport(attempt.report);
  const draft = useRecoverableForm(
    `grade:${attempt.id}:${attempt.version}`,
    {
      criteria: criteriaFor(attempt.skill).map((key) => ({
        key,
        score: (existing?.criteria.find((c) => c.key === key)?.score ?? "") as
          number | "",
        feedback: existing?.criteria.find((c) => c.key === key)?.feedback ?? "",
        quote: existing?.criteria.find((c) => c.key === key)?.quote ?? "",
        audioStart: (existing?.criteria.find((c) => c.key === key)
          ?.audioStart ?? "") as number | "",
        audioEnd: (existing?.criteria.find((c) => c.key === key)?.audioEnd ??
          "") as number | "",
      })),
      summary: existing?.summary ?? "",
      strengths: existing?.strengths.join("\n") ?? "",
      improvements: existing?.improvements.join("\n") ?? "",
      note: "",
      transcript: attempt.recognizedText ?? "",
    },
    isGradingDraft,
  );
  const { criteria, summary, strengths, improvements, note, transcript } =
    draft.value;
  const setCriteria = (update: (items: typeof criteria) => typeof criteria) =>
    draft.setValue((v) => ({ ...v, criteria: update(v.criteria) }));
  function field<K extends keyof typeof draft.value>(
    key: K,
    value: (typeof draft.value)[K],
  ) {
    draft.setValue((v) => ({ ...v, [key]: value }));
  }
  const setSummary = (v: string) => field("summary", v);
  const setStrengths = (v: string) => field("strengths", v);
  const setImprovements = (v: string) => field("improvements", v);
  const setNote = (v: string) => field("note", v);
  const setTranscript = (v: string) => field("transcript", v);
  const listCount = (v: string) => v.split("\n").filter((s) => s.trim()).length;
  const evidenceError = criteria.some(
    (c) =>
      (c.quote && !attempt.answerText?.includes(c.quote)) ||
      ((c.audioStart !== "" || c.audioEnd !== "") &&
        (c.audioStart === "" ||
          c.audioEnd === "" ||
          c.audioEnd <= c.audioStart)),
  );
  const listError = listCount(strengths) > 10 || listCount(improvements) > 10;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lock = useRef(false);
  const [grade] = useAssessmentGradeMutation();
  const averageReady = criteria.every(
    (c) => c.score !== "" && Number.isFinite(c.score),
  );
  const average =
    Math.round(
      (criteria.reduce((sum, c) => sum + Number(c.score), 0) / 4) * 2,
    ) / 2;
  const requestClose = () => {
    if (!busy) draft.confirmClose(close);
  };
  async function save() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError(null);
    try {
      const report = JSON.stringify({
        criteria: criteria.map((c) => ({
          key: c.key,
          score: c.score,
          feedback: c.feedback,
          ...(c.quote ? { quote: c.quote } : {}),
          ...(c.audioStart !== "" && c.audioEnd !== ""
            ? { audioStart: c.audioStart, audioEnd: c.audioEnd }
            : {}),
        })),
        summary,
        strengths: strengths
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        improvements: improvements
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      const r = await grade({
        variables: {
          id: attempt.id,
          version: attempt.version,
          report,
          note,
          transcript: transcript || null,
        },
      });
      if (!r.data) throw new Error("No grade result");
      draft.markSaved();
      notifications.show({
        color: "teal",
        message: tx("Đã công bố kết quả cho người học."),
      });
      close();
      await done().catch(() =>
        notifications.show({
          color: "orange",
          message: tx(
            "Kết quả đã lưu nhưng hàng đợi chưa cập nhật. Hãy tải lại.",
          ),
        }),
      );
    } catch {
      setError(
        tx(
          "Chưa lưu được kết quả. Kiểm tra đủ nhận xét cho 4 tiêu chí và điểm theo bước 0.5. Nếu bài đã được người khác chấm, tải lại hàng đợi.",
        ),
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  function downloadDraft() {
    const url = URL.createObjectURL(
      new Blob(
        [
          JSON.stringify(
            { attemptId: attempt.id, version: attempt.version, ...draft.value },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      ),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `englow-grading-${attempt.id}-v${attempt.version}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
  return (
    <EditorFrame
      onClose={requestClose}
      busy={busy}
      standalone={standalone}
      title={tx("Chấm bài · ") + attempt.task.title}
    >
      <Stack gap="lg">
        {draft.restored && (
          <Alert color="blue">
            {tx("Đã khôi phục nháp nhận xét. Chưa công bố kết quả.")}
          </Alert>
        )}
        {draft.storageError && (
          <Alert color="orange">
            {tx(
              "Không lưu được nháp trên thiết bị. Giữ trang mở đến khi lưu thành công.",
            )}
          </Alert>
        )}
        <Grid align="flex-start">
          <Grid.Col span={{ base: 12, md: 6 }}>
            {/* The work being graded stays in view while the criteria on the
                right are filled in: one viewport tall, scrolling on its own,
                with the submission first and the task and rubric a tab away. */}
            <Stack
              gap="md"
              style={{
                position: "sticky",
                top: 80,
                maxHeight: "calc(100vh - 96px)",
                overflowY: "auto",
              }}
            >
              {attempt.status === "COMPLETED" && (
                <Alert color="orange">
                  {tx(
                    "Bạn đang điều chỉnh kết quả đã công bố. Lý do và kết quả trước đó sẽ được lưu vào lịch sử kiểm duyệt.",
                  )}
                </Alert>
              )}
              <Tabs defaultValue="work" keepMounted>
                <Tabs.List mb="md">
                  <Tabs.Tab value="work">{tx("Bài làm")}</Tabs.Tab>
                  <Tabs.Tab value="task">{tx("Đề & rubric")}</Tabs.Tab>
                </Tabs.List>
                <Tabs.Panel value="work">
                  <Stack gap="md">
                    {attempt.answerText && (
                      <Card withBorder>
                        <Text fw={600}>
                          {tx("Bài viết")} · {attempt.wordCount} {tx("từ")}
                        </Text>
                        <Text style={{ whiteSpace: "pre-wrap" }}>
                          {attempt.answerText}
                        </Text>
                      </Card>
                    )}
                    {attempt.audioUrl && (
                      <>
                        <Text fw={600}>
                          {tx("Nghe toàn bộ bản ghi trước khi chấm")}
                        </Text>
                        <audio
                          controls
                          src={attempt.audioUrl}
                          style={{ width: "100%" }}
                        />
                        <Textarea
                          label={tx("Bản chép lời (nếu có)")}
                          value={transcript}
                          maxLength={12000}
                          disabled={busy}
                          minRows={3}
                          onChange={(e) => setTranscript(e.currentTarget.value)}
                        />
                      </>
                    )}
                  </Stack>
                </Tabs.Panel>
                <Tabs.Panel value="task">
                  <Card withBorder>
                    <Text fw={600}>{tx("Đề bài")}</Text>
                    <TaskInstructions text={attempt.task.instructions} />
                    {attempt.task.rubricNotes && (
                      <>
                        <Text fw={600} mt="sm">
                          {tx("Ghi chú chấm")}
                        </Text>
                        <Text style={{ whiteSpace: "pre-wrap" }}>
                          {attempt.task.rubricNotes}
                        </Text>
                      </>
                    )}
                  </Card>
                </Tabs.Panel>
              </Tabs>
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="lg">
              {criteria.map((c, index) => (
                <Card key={c.key} withBorder>
                  <Stack>
                    <NumberInput
                      label={tx(criterionLabels[c.key]) + tx(" · điểm 0–9")}
                      value={c.score}
                      min={0}
                      max={9}
                      step={0.5}
                      decimalScale={1}
                      disabled={busy}
                      onChange={(v) =>
                        setCriteria((items) =>
                          items.map((item, i) =>
                            i === index
                              ? { ...item, score: v === "" ? "" : Number(v) }
                              : item,
                          ),
                        )
                      }
                    />
                    <Textarea
                      label={
                        tx("Nhận xét có dẫn chứng · ") +
                        tx(criterionLabels[c.key])
                      }
                      required
                      minRows={2}
                      maxLength={3000}
                      value={c.feedback}
                      disabled={busy}
                      onChange={(e) => {
                        const feedback = e.currentTarget.value;
                        setCriteria((items) =>
                          items.map((item, i) =>
                            i === index ? { ...item, feedback } : item,
                          ),
                        );
                      }}
                    />
                    {attempt.skill === "WRITING" ? (
                      <Textarea
                        label={
                          tx("Trích đoạn nguyên văn (tùy chọn) · ") +
                          tx(criterionLabels[c.key])
                        }
                        description={tx(
                          "Sao chép từ bài viết; không tự tạo dẫn chứng.",
                        )}
                        maxLength={500}
                        value={c.quote}
                        disabled={busy}
                        error={
                          c.quote && !attempt.answerText?.includes(c.quote)
                            ? tx("Trích đoạn phải có trong bài viết.")
                            : undefined
                        }
                        onChange={(e) => {
                          const quote = e.currentTarget.value;
                          setCriteria((items) =>
                            items.map((item, i) =>
                              i === index ? { ...item, quote } : item,
                            ),
                          );
                        }}
                      />
                    ) : (
                      <Group grow>
                        <NumberInput
                          label={
                            tx("Audio bắt đầu (giây) · ") +
                            tx(criterionLabels[c.key])
                          }
                          min={0}
                          max={300}
                          decimalScale={1}
                          value={c.audioStart}
                          disabled={busy}
                          onChange={(v) =>
                            setCriteria((items) =>
                              items.map((item, i) =>
                                i === index
                                  ? {
                                      ...item,
                                      audioStart: v === "" ? "" : Number(v),
                                    }
                                  : item,
                              ),
                            )
                          }
                        />
                        <NumberInput
                          label={
                            tx("Audio kết thúc (giây) · ") +
                            tx(criterionLabels[c.key])
                          }
                          min={0}
                          max={301}
                          decimalScale={1}
                          value={c.audioEnd}
                          disabled={busy}
                          error={
                            (c.audioStart !== "" || c.audioEnd !== "") &&
                            (c.audioStart === "" ||
                              c.audioEnd === "" ||
                              c.audioEnd <= c.audioStart)
                              ? tx("Nhập đủ hai mốc trong bản ghi.")
                              : undefined
                          }
                          onChange={(v) =>
                            setCriteria((items) =>
                              items.map((item, i) =>
                                i === index
                                  ? {
                                      ...item,
                                      audioEnd: v === "" ? "" : Number(v),
                                    }
                                  : item,
                              ),
                            )
                          }
                        />
                      </Group>
                    )}
                  </Stack>
                </Card>
              ))}
              <Text fw={700}>
                {tx("Điểm luyện tập ước lượng:")}{" "}
                {averageReady ? average.toFixed(1) : "—"} / 9
              </Text>
              <Textarea
                label={tx("Nhận xét tổng quan")}
                required
                maxLength={4000}
                value={summary}
                disabled={busy}
                onChange={(e) => setSummary(e.currentTarget.value)}
              />
              <Textarea
                label={tx("Điểm làm tốt (mỗi dòng một ý, tối đa 10 ý)")}
                error={
                  listCount(strengths) > 10 ? tx("Tối đa 10 ý") : undefined
                }
                value={strengths}
                disabled={busy}
                onChange={(e) => setStrengths(e.currentTarget.value)}
              />
              <Textarea
                label={tx("Bước cải thiện (mỗi dòng một ý, tối đa 10 ý)")}
                error={
                  listCount(improvements) > 10 ? tx("Tối đa 10 ý") : undefined
                }
                value={improvements}
                disabled={busy}
                onChange={(e) => setImprovements(e.currentTarget.value)}
              />
              <Textarea
                label={tx("Ghi chú kiểm duyệt / lý do điều chỉnh")}
                required
                maxLength={4000}
                value={note}
                disabled={busy}
                onChange={(e) => setNote(e.currentTarget.value)}
              />
              {error && (
                <Alert color="red">
                  {error}
                  <Group mt="sm">
                    <Button variant="default" onClick={downloadDraft}>
                      {tx("Tải nháp xuống máy")}
                    </Button>
                    <Button
                      variant="light"
                      onClick={() => {
                        if (
                          window.confirm(
                            tx(
                              "Tải bản mới sẽ thay nội dung đang nhập. Hãy tải nháp xuống trước để đối chiếu. Tiếp tục?",
                            ),
                          )
                        )
                          location.reload();
                      }}
                    >
                      {tx("Tải bản hiện hành")}
                    </Button>
                  </Group>
                </Alert>
              )}
              <Group justify="flex-end">
                <Button
                  variant="default"
                  disabled={busy}
                  onClick={requestClose}
                >
                  {tx("Hủy")}
                </Button>
                <Button
                  loading={busy}
                  disabled={
                    evidenceError ||
                    listError ||
                    !summary.trim() ||
                    !note.trim() ||
                    criteria.some(
                      (c) =>
                        !c.feedback.trim() ||
                        c.score === "" ||
                        !Number.isFinite(c.score) ||
                        c.score < 0 ||
                        c.score > 9 ||
                        (c.score * 2) % 1 !== 0,
                    )
                  }
                  onClick={() => {
                    if (
                      window.confirm(
                        tx("Công bố kết quả") +
                          ` ${average.toFixed(1)} / 9 · ` +
                          tx("Xác nhận nộp"),
                      )
                    )
                      void save();
                  }}
                >
                  {tx("Lưu và công bố kết quả")}
                </Button>
              </Group>
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>
    </EditorFrame>
  );
}

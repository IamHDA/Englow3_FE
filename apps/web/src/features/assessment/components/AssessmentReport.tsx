"use client";
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Group,
  List,
  RingProgress,
  Tabs,
  Stack,
  Text,
  ThemeIcon,
  Title,
  UnstyledButton,
} from "@mantine/core";
import {
  IconBook2,
  IconCheck,
  IconChevronRight,
  IconClipboardText,
  IconFileText,
  IconMessages,
  IconMicrophone,
  IconPencil,
  IconSparkles,
  IconStarFilled,
  IconTarget,
  IconThumbUp,
  type Icon,
} from "@tabler/icons-react";
import Link from "next/link";
import { useId, useState, type CSSProperties } from "react";
import { useAssessmentText } from "../hooks/useAssessmentText";
import { useLanguage } from "@/shared/hooks/useLanguage";
import type { Criterion, PracticeAttempt } from "../types";
import { criterionLabels, parseReport } from "../types";
import classes from "./AssessmentReport.module.css";
import { TaskInstructions } from "./TaskInstructions";

const criterionIcons: Record<string, { icon: Icon; color: string }> = {
  TASK_RESPONSE: { icon: IconTarget, color: "blue" },
  COHERENCE_COHESION: { icon: IconMessages, color: "cyan" },
  FLUENCY_COHERENCE: { icon: IconMessages, color: "cyan" },
  LEXICAL_RESOURCE: { icon: IconBook2, color: "orange" },
  GRAMMATICAL_RANGE: { icon: IconPencil, color: "violet" },
  PRONUNCIATION: { icon: IconMicrophone, color: "pink" },
};

/** Lời nhận ngắn theo mức điểm, để màn kết quả mở đầu bằng một câu thay vì chỉ một con số. */
function headline(overall: number, isVi: boolean): string {
  if (overall >= 7) return isVi ? "Rất tốt!" : "Excellent work!";
  if (overall >= 5.5)
    return isVi ? "Khá tốt, tiếp tục phát huy!" : "Good, keep it up!";
  if (overall >= 4)
    return isVi ? "Bạn đang tiến bộ!" : "You're making progress!";
  return isVi ? "Cần cố gắng thêm một chút!" : "A little more effort needed!";
}

/**
 * Kết quả chấm của một bài.
 *
 * Điều hướng kết quả nằm ngay dưới banner điểm, trước nội dung của từng mục.
 * Nhận xét chia hai cột; bài làm, đề và bài mẫu có toàn bộ chiều rộng để đọc.
 * Nội dung dài cuộn trong panel khi màn hình đủ rộng.
 *
 * `withContext`: người học đang xem bài của chính mình nên đề và bài làm là
 * tab của kết quả, và kết quả lấp đầy chiều cao mà cha cấp. Màn của người chấm
 * đã tự hiện đề và bài làm phía trên, nằm trong một ô hẹp nên để `false` và
 * xếp một cột theo chiều cao tự nhiên.
 */
export function AssessmentReport({
  attempt,
  withContext = false,
}: {
  attempt: PracticeAttempt;
  withContext?: boolean;
}) {
  const { isVi } = useLanguage();
  const tx = useAssessmentText();
  const [tab, setTab] = useState("feedback");
  const navigationId = useId();
  const [picked, setPicked] = useState<string | null>(null);
  const report = parseReport(attempt.report);
  if (!report)
    return (
      <Alert color="orange">
        {isVi
          ? "Kết quả chưa đầy đủ. Vui lòng tải lại hoặc liên hệ giáo viên."
          : "The result is incomplete. Reload or contact your teacher."}
      </Alert>
    );

  // Server bỏ điểm từng tiêu chí khỏi bản của người học nên huy hiệu điểm chỉ hiện khi có số.
  const focusKey =
    report.focusCriterion ??
    [...report.criteria].sort((a, b) => (a.score ?? 0) - (b.score ?? 0))[0].key;
  const current =
    report.criteria.find((c) => c.key === (picked ?? focusKey)) ??
    report.criteria[0];
  const practiceHref =
    attempt.skill === "SPEAKING" && focusKey === "PRONUNCIATION"
      ? "/study/pronunciation"
      : `/study/${attempt.skill === "WRITING" ? "writing" : "speaking"}`;

  const sampleAnswer = attempt.task.sampleAnswer;
  const hasAnswer = Boolean(
    attempt.answerText || attempt.audioUrl || attempt.recognizedText,
  );
  const isSpeaking = attempt.skill === "SPEAKING";

  const tabs: {
    value: string;
    label: string;
    description: string;
    icon: Icon;
  }[] = [
    {
      value: "feedback",
      label: isVi ? "Nhận xét" : "Feedback",
      description: isVi
        ? "Đánh giá theo từng tiêu chí"
        : "Review each criterion",
      icon: IconMessages,
    },
    ...(withContext && hasAnswer
      ? [
          {
            value: "answer",
            icon: isSpeaking ? IconMicrophone : IconPencil,
            description: isSpeaking
              ? isVi
                ? "Nghe lại và xem bản ghi"
                : "Listen and read the transcript"
              : isVi
                ? "Đọc lại nội dung đã nộp"
                : "Revisit your submitted writing",
            label: isSpeaking
              ? isVi
                ? "Bài nói"
                : "Your answer"
              : isVi
                ? "Bài viết"
                : "Your writing",
          },
        ]
      : []),
    ...(withContext
      ? [
          {
            value: "task",
            label: isVi ? "Đề bài" : "Task",
            description: isVi
              ? "Xem lại yêu cầu của đề"
              : "Revisit the task instructions",
            icon: IconClipboardText,
          },
        ]
      : []),
    ...(!withContext && attempt.recognizedText
      ? [
          {
            value: "transcript",
            label: isVi ? "Bản ghi" : "Transcript",
            description: isVi
              ? "Xem lời nói được nhận dạng"
              : "Read the recognized speech",
            icon: IconFileText,
          },
        ]
      : []),
    ...(sampleAnswer
      ? [
          {
            value: "sample",
            label: isVi ? "Bài tham khảo" : "Reference",
            description: isVi
              ? "Đối chiếu với bài mẫu"
              : "Compare with a model answer",
            icon: IconBook2,
          },
        ]
      : []),
  ];

  const activeTab = tabs.some((item) => item.value === tab) ? tab : "feedback";

  return (
    <div className={classes.report} data-framed={withContext || undefined}>
      <Box
        p="md"
        c="white"
        style={{
          borderRadius: "var(--mantine-radius-xl)",
          background: "var(--mantine-color-brand-9)",
        }}
      >
        <Group gap="lg" wrap="wrap" align="center">
          <RingProgress
            size={104}
            thickness={10}
            roundCaps
            rootColor="rgba(255,255,255,0.28)"
            sections={[{ value: (report.overall / 9) * 100, color: "white" }]}
            label={
              <Stack gap={0} align="center">
                <Title order={3} c="white" lh={1}>
                  {report.overall.toFixed(1)}
                </Title>
                <Text size="xs" c="teal.0">
                  {isVi ? "trên 9" : "out of 9"}
                </Text>
              </Stack>
            }
          />
          <Stack gap={4} style={{ flex: "1 1 280px", minWidth: 0 }}>
            <Group gap="xs">
              <Title order={4} c="white">
                {headline(report.overall, isVi)}
              </Title>
              <Badge
                variant="light"
                color="gray"
                c="white"
                bg="rgba(255,255,255,0.2)"
                leftSection={<IconSparkles size={12} />}
              >
                {attempt.source === "HUMAN"
                  ? isVi
                    ? "Giáo viên đã chấm"
                    : "Teacher assessed"
                  : isVi
                    ? "AI đánh giá"
                    : "AI assessed"}
              </Badge>
            </Group>
            <Text size="sm" c="white" lineClamp={3} title={report.summary}>
              {report.summary}
            </Text>
            <Text size="xs" c="white" style={{ opacity: 0.85 }}>
              {isVi
                ? "Ước lượng cho bài luyện tập, không phải điểm IELTS chính thức"
                : "A practice estimate, not an official IELTS result"}
            </Text>
          </Stack>
          <Button
            component={Link}
            href={practiceHref}
            color="white"
            c="teal.9"
            radius="md"
          >
            {isVi ? "Luyện " : "Practise "}
            {tx(criterionLabels[focusKey] ?? focusKey)} →
          </Button>
        </Group>
      </Box>

      <Tabs
        value={activeTab}
        onChange={(value) => {
          if (value) setTab(value);
        }}
        keepMounted={false}
        variant="pills"
        classNames={{
          root: classes.workspace,
          list: classes.tabList,
          tab: classes.tab,
          tabLabel: classes.tabLabel,
          panel: classes.tabPanel,
        }}
      >
        <Tabs.List
          aria-label={isVi ? "Nội dung kết quả" : "Result sections"}
          style={{ "--report-tab-count": tabs.length } as CSSProperties}
        >
          {tabs.map((item) => (
            <Tabs.Tab
              key={item.value}
              value={item.value}
              aria-label={item.label}
              aria-describedby={`${navigationId}-${item.value}`}
            >
              <span className={classes.tabIcon} aria-hidden="true">
                <item.icon size={22} stroke={1.8} />
              </span>
              <span className={classes.tabCopy}>
                <span className={classes.tabTitle}>{item.label}</span>
                <span
                  id={`${navigationId}-${item.value}`}
                  className={classes.tabDescription}
                >
                  {item.description}
                </span>
              </span>
              <span className={classes.tabIndicator} aria-hidden="true">
                {activeTab === item.value ? (
                  <IconCheck size={18} />
                ) : (
                  <IconChevronRight size={18} />
                )}
              </span>
            </Tabs.Tab>
          ))}
        </Tabs.List>

        <Tabs.Panel value="feedback" tabIndex={0}>
          <div className={classes.body}>
            <div className={classes.col}>
              <Card
                radius="lg"
                p="md"
                withBorder
                className={classes.card}
                style={{ borderTop: "3px solid var(--mantine-color-green-6)" }}
              >
                <Group gap="xs">
                  <ThemeIcon color="green" variant="light" radius="md">
                    <IconThumbUp size={18} aria-hidden="true" />
                  </ThemeIcon>
                  <Title order={4}>{isVi ? "Điểm làm tốt" : "Strengths"}</Title>
                </Group>
                <List spacing="xs" size="sm">
                  {report.strengths.map((item, index) => (
                    <List.Item key={index}>{item}</List.Item>
                  ))}
                </List>
              </Card>
              <Card
                radius="lg"
                p="md"
                withBorder
                className={classes.card}
                style={{ borderTop: "3px solid var(--mantine-color-orange-6)" }}
              >
                <Group gap="xs">
                  <ThemeIcon color="orange" variant="light" radius="md">
                    <IconTarget size={18} aria-hidden="true" />
                  </ThemeIcon>
                  <Title order={4}>
                    {isVi ? "Bước cải thiện tiếp theo" : "Next improvements"}
                  </Title>
                </Group>
                <List spacing="xs" size="sm">
                  {report.improvements.map((item, index) => (
                    <List.Item key={index}>{item}</List.Item>
                  ))}
                </List>
              </Card>
            </div>
            <Card radius="lg" p="md" withBorder className={classes.card}>
              <Group justify="space-between" gap="xs">
                <Title order={4}>
                  {isVi ? "Nhận xét chi tiết" : "Detailed feedback"}
                </Title>
                <Text size="sm" c="dimmed">
                  {report.criteria.length} {isVi ? "tiêu chí" : "criteria"}
                </Text>
              </Group>
              <div
                className={classes.scroll}
                tabIndex={0}
                role="region"
                aria-label={
                  isVi ? "Nhận xét theo tiêu chí" : "Criterion feedback"
                }
              >
                <Stack gap="lg">
                  <div className={classes.chips}>
                    {report.criteria.map((criterion) => (
                      <CriterionChip
                        key={criterion.key}
                        criterion={criterion}
                        active={criterion.key === current.key}
                        focus={criterion.key === focusKey}
                        label={tx(
                          criterionLabels[criterion.key] ?? criterion.key,
                        )}
                        focusLabel={isVi ? "Ưu tiên luyện" : "Focus"}
                        onPick={() => setPicked(criterion.key)}
                      />
                    ))}
                  </div>
                  <CriterionDetail
                    criterion={current}
                    attempt={attempt}
                    isFocus={current.key === focusKey}
                    focusLabel={isVi ? "Ưu tiên luyện" : "Focus"}
                    segmentLabel={
                      isVi ? "Đoạn được nhận xét" : "Reviewed segment"
                    }
                  />
                </Stack>
              </div>
            </Card>
          </div>
        </Tabs.Panel>

        {withContext && hasAnswer && (
          <Tabs.Panel value="answer" tabIndex={0}>
            <Card radius="lg" p="lg" withBorder className={classes.contentCard}>
              <Title order={4}>
                {isSpeaking
                  ? isVi
                    ? "Bài nói của bạn"
                    : "Your spoken response"
                  : isVi
                    ? "Bài viết của bạn"
                    : "Your writing"}
              </Title>
              <div
                className={classes.scroll}
                tabIndex={0}
                role="region"
                aria-label={isVi ? "Nội dung đã nộp" : "Submitted response"}
              >
                <Stack gap="lg">
                  {attempt.audioUrl && (
                    <audio
                      controls
                      preload="none"
                      src={attempt.audioUrl}
                      style={{ width: "100%" }}
                    />
                  )}
                  {attempt.recognizedText && (
                    <Stack gap="xs">
                      <Text fw={600} size="sm">
                        {isVi
                          ? "Bản nhận dạng giọng nói"
                          : "Recognized transcript"}
                      </Text>
                      <Text style={{ whiteSpace: "pre-wrap" }}>
                        {attempt.recognizedText}
                      </Text>
                    </Stack>
                  )}
                  {attempt.answerText && (
                    <Stack gap="xs">
                      <Text size="sm" c="dimmed">
                        {attempt.wordCount} {isVi ? "từ" : "words"}
                      </Text>
                      <Text style={{ whiteSpace: "pre-wrap" }}>
                        {attempt.answerText}
                      </Text>
                    </Stack>
                  )}
                </Stack>
              </div>
            </Card>
          </Tabs.Panel>
        )}
        {withContext && (
          <Tabs.Panel value="task" tabIndex={0}>
            <Card radius="lg" p="lg" withBorder className={classes.contentCard}>
              <Title order={4}>{isVi ? "Đề bài" : "Task instructions"}</Title>
              <div
                className={classes.scroll}
                tabIndex={0}
                role="region"
                aria-label={isVi ? "Yêu cầu đề bài" : "Task requirements"}
              >
                <TaskInstructions text={attempt.task.instructions} />
              </div>
            </Card>
          </Tabs.Panel>
        )}
        {!withContext && attempt.recognizedText && (
          <Tabs.Panel value="transcript" tabIndex={0}>
            <Card radius="lg" p="lg" withBorder className={classes.contentCard}>
              <Title order={4}>
                {isVi ? "Bản nhận dạng giọng nói" : "Recognized transcript"}
              </Title>
              <div
                className={classes.scroll}
                tabIndex={0}
                role="region"
                aria-label={isVi ? "Bản ghi" : "Transcript"}
              >
                <Text style={{ whiteSpace: "pre-wrap" }}>
                  {attempt.recognizedText}
                </Text>
              </div>
            </Card>
          </Tabs.Panel>
        )}
        {sampleAnswer && (
          <Tabs.Panel value="sample" tabIndex={0}>
            <Card radius="lg" p="lg" withBorder className={classes.contentCard}>
              <Title order={4}>
                {isVi ? "Bài tham khảo" : "Reference answer"}
              </Title>
              <div
                className={classes.scroll}
                tabIndex={0}
                role="region"
                aria-label={isVi ? "Nội dung tham khảo" : "Reference content"}
              >
                <Text style={{ whiteSpace: "pre-wrap" }}>{sampleAnswer}</Text>
              </div>
            </Card>
          </Tabs.Panel>
        )}
      </Tabs>
    </div>
  );
}

function CriterionChip({
  criterion,
  active,
  focus,
  label,
  focusLabel,
  onPick,
}: {
  criterion: Criterion;
  active: boolean;
  focus: boolean;
  label: string;
  focusLabel: string;
  onPick: () => void;
}) {
  const look = criterionIcons[criterion.key] ?? {
    icon: IconMessages,
    color: "gray",
  };
  return (
    <UnstyledButton
      className={classes.chip}
      data-active={active || undefined}
      aria-pressed={active}
      onClick={onPick}
    >
      {focus && (
        <IconStarFilled
          size={14}
          className={classes.chipStar}
          aria-label={focusLabel}
        >
          <title>{focusLabel}</title>
        </IconStarFilled>
      )}
      <ThemeIcon
        color={look.color}
        variant={active ? "filled" : "light"}
        radius="md"
        size="lg"
      >
        <look.icon size={20} />
      </ThemeIcon>
      <Text size="xs" fw={700} className={classes.chipLabel}>
        {label}
      </Text>
      {typeof criterion.score === "number" && (
        <Badge size="sm">{criterion.score.toFixed(1)}</Badge>
      )}
    </UnstyledButton>
  );
}

function CriterionDetail({
  criterion,
  attempt,
  isFocus,
  focusLabel,
  segmentLabel,
}: {
  criterion: Criterion;
  attempt: PracticeAttempt;
  isFocus: boolean;
  focusLabel: string;
  segmentLabel: string;
}) {
  const tx = useAssessmentText();
  const quoted =
    typeof criterion.quote === "string" &&
    criterion.quote &&
    attempt.answerText?.includes(criterion.quote);
  const clip =
    attempt.audioUrl &&
    typeof criterion.audioStart === "number" &&
    typeof criterion.audioEnd === "number" &&
    criterion.audioEnd > criterion.audioStart;
  return (
    <Stack gap="xs">
      <Group gap="xs">
        <Text fw={700}>
          {tx(criterionLabels[criterion.key] ?? criterion.key)}
        </Text>
        {isFocus && (
          <Badge color="yellow" variant="light">
            {focusLabel}
          </Badge>
        )}
      </Group>
      <Text style={{ whiteSpace: "pre-wrap" }}>{criterion.feedback}</Text>
      {quoted && (
        <Text
          component="blockquote"
          size="sm"
          m={0}
          style={{
            borderLeft: "3px solid var(--mantine-color-blue-5)",
            paddingLeft: 12,
          }}
        >
          {criterion.quote}
        </Text>
      )}
      {clip && (
        <Stack gap={4}>
          <Text size="xs" c="dimmed">
            {segmentLabel}: {criterion.audioStart}–{criterion.audioEnd}s
          </Text>
          <audio
            controls
            src={`${attempt.audioUrl}#t=${criterion.audioStart},${criterion.audioEnd}`}
            style={{ width: "100%" }}
          />
        </Stack>
      )}
    </Stack>
  );
}

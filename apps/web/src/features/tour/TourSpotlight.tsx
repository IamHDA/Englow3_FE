"use client";

import {
  Alert,
  Badge,
  Button,
  FocusTrap,
  Group,
  Loader,
  Paper,
  Portal,
  Progress,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useElementSize, useFocusReturn } from "@mantine/hooks";
import { useEffect, useId, useRef, useState } from "react";
import { useLanguage } from "@/shared/hooks/useLanguage";
import type { TourStep } from "./constants/tourSteps";
import { placeTourPanel, spotlightBounds } from "./spotlightGeometry";
import { useTourTarget } from "./useTourTarget";
import classes from "./TourSpotlight.module.css";

type Props = {
  steps: readonly TourStep[];
  stepIndex: number;
  onStepChange: (index: number) => void;
  opened: boolean;
  onDismiss: () => Promise<void>;
  onPause: () => void;
};

export function TourSpotlight({
  steps,
  stepIndex,
  onStepChange,
  opened,
  onDismiss,
  onPause,
}: Props) {
  const { isVi } = useLanguage();
  const tr = (vi: string, en: string) => (isVi ? vi : en);
  const step = steps[stepIndex];
  const [retry, setRetry] = useState(0);
  const [timedOutTarget, setTimedOutTarget] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const saving = useRef(false);
  const [error, setError] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const { ref: panelRef, height: panelHeight } =
    useElementSize<HTMLDivElement>();
  const { rect, viewport, element } = useTourTarget(step.target, opened, retry);
  const maskId = `tour-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const titleId = `${maskId}-title`;
  const bodyId = `${maskId}-body`;
  useFocusReturn({ opened });

  useEffect(() => {
    if (opened) heading.current?.focus({ preventScroll: true });
  }, [opened, step.target]);
  const found = rect !== null;
  useEffect(() => {
    if (!opened || found) return;
    const timeout = setTimeout(() => setTimedOutTarget(step.target), 6000);
    return () => clearTimeout(timeout);
  }, [opened, found, step.target, retry]);
  useEffect(() => {
    if (!opened || !element) return;
    const interact = (event: MouseEvent) => {
      if (event.target instanceof Node && element.contains(event.target))
        onPause();
    };
    document.addEventListener("click", interact, true);
    return () => document.removeEventListener("click", interact, true);
  }, [opened, element, onPause]);

  async function dismiss() {
    if (saving.current) return;
    saving.current = true;
    setBusy(true);
    setError(false);
    try {
      await onDismiss();
    } catch {
      setError(true);
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }
  function useTarget() {
    if (!element?.isConnected || !found) return;
    onPause();
    element.focus({ preventScroll: true });
    element.click();
  }
  if (!opened) return null;
  const bounds = rect ? spotlightBounds(rect, viewport) : null;
  const placement = bounds
    ? placeTourPanel(bounds, viewport, panelHeight || 300, step.placement)
    : null;
  const blockers = bounds
    ? [
        { left: 0, top: 0, width: viewport.width, height: bounds.y },
        {
          left: 0,
          top: bounds.y + bounds.height,
          width: viewport.width,
          height: Math.max(0, viewport.height - bounds.y - bounds.height),
        },
        { left: 0, top: bounds.y, width: bounds.x, height: bounds.height },
        {
          left: bounds.x + bounds.width,
          top: bounds.y,
          width: Math.max(0, viewport.width - bounds.x - bounds.width),
          height: bounds.height,
        },
      ]
    : [{ left: 0, top: 0, width: viewport.width, height: viewport.height }];
  const missing = !found && timedOutTarget === step.target;
  return (
    <Portal>
      <div className={classes.layer} data-tour-layer="true">
        <svg className={classes.mask} aria-hidden="true" focusable="false">
          <defs>
            <mask
              id={maskId}
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width={viewport.width}
              height={viewport.height}
            >
              <rect
                width={viewport.width}
                height={viewport.height}
                fill="white"
              />
              {bounds && (
                <rect
                  x={bounds.x}
                  y={bounds.y}
                  width={bounds.width}
                  height={bounds.height}
                  rx="12"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(15,23,42,.7)"
            mask={`url(#${maskId})`}
          />
        </svg>
        {blockers.map((style, index) => (
          <div
            key={index}
            className={classes.blocker}
            style={style}
            aria-hidden="true"
          />
        ))}
        {bounds && (
          <div
            className={classes.highlight}
            data-tour-highlight={step.target}
            style={{
              left: bounds.x,
              top: bounds.y,
              width: bounds.width,
              height: bounds.height,
            }}
          />
        )}
        <FocusTrap active={opened} innerRef={panelRef}>
          <Paper
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={bodyId}
            className={classes.panel}
            data-tour-panel={step.target}
            style={
              placement
                ? {
                    left: placement.left,
                    top: placement.top,
                    width: placement.width,
                    maxHeight: placement.maxHeight,
                  }
                : {
                    right: 12,
                    bottom: 12,
                    width: "min(360px, calc(100vw - 24px))",
                    maxHeight: "calc(100dvh - 24px)",
                  }
            }
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                if (!busy) void dismiss();
              }
            }}
          >
            {placement && (
              <span
                aria-hidden="true"
                className={classes.arrow}
                style={
                  placement.side === "bottom"
                    ? { top: -7, left: placement.arrowX - 7 }
                    : placement.side === "top"
                      ? { bottom: -7, left: placement.arrowX - 7 }
                      : placement.side === "right"
                        ? { left: -7, top: placement.arrowY - 7 }
                        : { right: -7, top: placement.arrowY - 7 }
                }
              />
            )}
            <Stack gap="xs" className={classes.header}>
              <Group justify="space-between" wrap="nowrap">
                <Badge color="teal" variant="light">
                  {tr(
                    `Bước ${stepIndex + 1} / ${steps.length}`,
                    `Step ${stepIndex + 1} / ${steps.length}`,
                  )}
                </Badge>
                <Button
                  variant="subtle"
                  color="ink"
                  size="compact-sm"
                  mih={44}
                  disabled={busy}
                  onClick={() => void dismiss()}
                >
                  {tr("Bỏ qua", "Skip")}
                </Button>
              </Group>
              <Progress
                value={((stepIndex + 1) / steps.length) * 100}
                color="orange"
                size="sm"
                aria-label={tr("Tiến độ hướng dẫn", "Tour progress")}
              />
            </Stack>
            <Stack gap="sm" className={classes.body}>
              <Title
                ref={heading}
                className={classes.heading}
                id={titleId}
                order={2}
                fz={20}
                tabIndex={-1}
                data-autofocus
              >
                {isVi ? step.titleVi : step.titleEn}
              </Title>
              <Text id={bodyId} size="sm" c="ink.7">
                {isVi ? step.bodyVi : step.bodyEn}
              </Text>
              {!found && !missing && (
                <Group role="status" gap="xs">
                  <Loader size="xs" />
                  <Text size="sm">
                    {tr(
                      "Đang tìm nút trên giao diện…",
                      "Locating the control…",
                    )}
                  </Text>
                </Group>
              )}
              {missing && (
                <Alert color="orange" role="alert">
                  <Text size="sm">
                    {tr(
                      "Chưa tìm thấy mục này. Thử lại sau khi trang tải xong hoặc chuyển sang bước tiếp theo.",
                      "This control is not available yet. Retry when the page has loaded, or continue to the next step.",
                    )}
                  </Text>
                  <Button
                    variant="light"
                    size="sm"
                    mt="xs"
                    onClick={() => {
                      setTimedOutTarget(null);
                      setRetry((value) => value + 1);
                    }}
                  >
                    {tr("Thử lại", "Retry")}
                  </Button>
                </Alert>
              )}
              {found && (
                <Button
                  variant="light"
                  color="teal"
                  fullWidth
                  mih={44}
                  onClick={useTarget}
                  disabled={busy}
                >
                  {tr("Dùng mục này", "Use this control")}
                </Button>
              )}
              {error && (
                <Alert color="orange" role="alert">
                  {tr(
                    "Chưa lưu được hướng dẫn. Thử lại hoặc đóng tạm để tiếp tục sử dụng web.",
                    "Could not save tour progress. Retry or close for now to continue using the website.",
                  )}
                  <Button variant="subtle" mih={44} onClick={onPause}>
                    {tr("Đóng tạm", "Close for now")}
                  </Button>
                </Alert>
              )}
            </Stack>
            <Group
              justify="space-between"
              className={classes.footer}
              wrap="nowrap"
            >
              <Button
                variant="subtle"
                color="ink"
                mih={44}
                disabled={stepIndex === 0 || busy}
                onClick={() => onStepChange(stepIndex - 1)}
              >
                {tr("Quay lại", "Back")}
              </Button>
              <Button
                color="teal"
                mih={44}
                loading={busy}
                onClick={() =>
                  stepIndex === steps.length - 1
                    ? void dismiss()
                    : onStepChange(stepIndex + 1)
                }
              >
                {stepIndex === steps.length - 1
                  ? tr("Hoàn tất", "Finish")
                  : tr("Tiếp", "Next")}
              </Button>
            </Group>
          </Paper>
        </FocusTrap>
      </div>
    </Portal>
  );
}

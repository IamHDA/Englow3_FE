"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSaveExamDraftMutation } from "@/lib/graphql/generated/hooks";
import { backendCodeOf } from "@/shared/network/loadError";

type Answers = Record<string, string | string[]>;
type Active = {
  id: string;
  version: number;
  saved: string;
  latest: Answers;
  blocked: boolean;
  flight: Promise<boolean> | null;
};
export function useExamAutosave(id: string | null, answers: Answers) {
  const [save] = useSaveExamDraftMutation();
  const active = useRef<Active | null>(null);
  const [status, setStatus] = useState<
    "idle" | "saving" | "saved" | "error" | "conflict"
  >("idle");
  useEffect(
    () => () => {
      active.current = null;
    },
    [],
  );
  const initialize = useCallback(
    (
      attemptId: string,
      version: number,
      serverAnswers: Answers,
      localAnswers: Answers,
    ) => {
      active.current = {
        id: attemptId,
        version,
        saved: JSON.stringify(serverAnswers),
        latest: localAnswers,
        blocked: false,
        flight: null,
      };
      setStatus(
        JSON.stringify(serverAnswers) === JSON.stringify(localAnswers)
          ? "saved"
          : "idle",
      );
    },
    [],
  );
  const flush = useCallback(
    async (currentAnswers?: Answers): Promise<boolean> => {
      const context = active.current;
      if (!context || context.blocked) return false;
      if (currentAnswers) context.latest = currentAnswers;
      if (context.flight) {
        const ok = await context.flight;
        return ok && !context.blocked;
      }
      const run = async () => {
        try {
          while (
            context === active.current &&
            JSON.stringify(context.latest) !== context.saved
          ) {
            const snapshot = JSON.stringify(context.latest);
            setStatus("saving");
            const response = await save({
              variables: {
                attemptId: context.id,
                version: context.version,
                answers: Object.entries(context.latest).map(
                  ([questionId, selectedOptionId]) => ({
                    questionId,
                    selectedOptionIds: Array.isArray(selectedOptionId)
                      ? selectedOptionId
                      : [selectedOptionId],
                  }),
                ),
              },
            });
            if (!response.data) throw new Error("Missing draft result");
            context.version = response.data.saveExamDraft.version;
            context.saved = snapshot;
          }
          if (context === active.current) setStatus("saved");
          return context === active.current;
        } catch (failure) {
          if (context !== active.current) return false;
          context.blocked = backendCodeOf(failure) === "EXAM_DRAFT_CHANGED";
          setStatus(context.blocked ? "conflict" : "error");
          return false;
        }
      };
      context.flight = run();
      try {
        return await context.flight;
      } finally {
        context.flight = null;
      }
    },
    [save],
  );
  useEffect(() => {
    if (!id || active.current?.id !== id) return;
    active.current.latest = answers;
    if (
      active.current.blocked ||
      JSON.stringify(answers) === active.current.saved
    )
      return;
    const timer = setTimeout(() => void flush(), 600);
    return () => clearTimeout(timer);
  }, [id, answers, flush]);
  return { initialize, flush, status };
}

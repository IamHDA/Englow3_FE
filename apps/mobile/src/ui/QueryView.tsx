import type { ReactNode } from "react";

import { errorMessage, loadErrorKind } from "@/lib/errors";

import { EmptyState, ErrorState, LoadingState } from "./components";

type QueryViewProps<T> = {
  loading: boolean;
  error?: unknown;
  data: T | null | undefined;
  onRetry?: () => void;
  /** Shown when the query succeeded but there is nothing to show. */
  isEmpty?: (data: T) => boolean;
  empty?: ReactNode;
  children: (data: T) => ReactNode;
};

/**
 * The three states every loaded screen has. Data already on hand wins over a
 * refetch error, so pulling to refresh offline keeps the last good page.
 */
export function QueryView<T>({
  loading,
  error,
  data,
  onRetry,
  isEmpty,
  empty,
  children,
}: QueryViewProps<T>) {
  if (data != null) {
    if (isEmpty?.(data)) {
      return <>{empty ?? <EmptyState title="Chưa có gì ở đây" />}</>;
    }
    return <>{children(data)}</>;
  }
  if (loading) return <LoadingState />;
  if (error) {
    return (
      <ErrorState
        message={
          loadErrorKind(error) === "not-found"
            ? "Không tìm thấy nội dung này."
            : errorMessage(error)
        }
        onRetry={loadErrorKind(error) === "not-found" ? undefined : onRetry}
      />
    );
  }
  return <LoadingState />;
}

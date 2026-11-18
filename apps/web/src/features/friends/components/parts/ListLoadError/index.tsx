"use client";

import { Alert, Button } from "@mantine/core";
import { AlertCircle, RotateCw } from "lucide-react";

import { LIST_COPY } from "../../../constants/friends";

type ListLoadErrorProps = {
  title?: string;
  onRetry: () => void;
};

/** A list the server did not give us, with the way to ask again. */
export function ListLoadError({
  title = LIST_COPY.loadErrorTitle,
  onRetry,
}: ListLoadErrorProps) {
  return (
    <Alert
      color="warn"
      radius="md"
      icon={<AlertCircle size={20} aria-hidden="true" />}
      title={title}
    >
      {LIST_COPY.loadErrorDescription}
      <Button
        variant="light"
        color="warn"
        size="sm"
        mt="sm"
        display="block"
        leftSection={<RotateCw size={16} aria-hidden="true" />}
        onClick={onRetry}
      >
        {LIST_COPY.retry}
      </Button>
    </Alert>
  );
}

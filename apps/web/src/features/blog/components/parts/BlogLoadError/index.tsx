"use client";

import { Alert, Button } from "@mantine/core";
import { AlertCircle, RotateCw } from "lucide-react";

type BlogLoadErrorProps = {
  title: string;
  description: string;
  retryLabel: string;
  onRetry: () => void;
};

/** A list or a section the server did not give us, with the way to ask again. */
export function BlogLoadError({
  title,
  description,
  retryLabel,
  onRetry,
}: BlogLoadErrorProps) {
  return (
    <Alert
      color="warn"
      radius="md"
      icon={<AlertCircle size={20} aria-hidden="true" />}
      title={title}
      role="alert"
    >
      {description}
      <Button
        variant="light"
        color="warn"
        size="sm"
        mt="sm"
        display="block"
        leftSection={<RotateCw size={16} aria-hidden="true" />}
        onClick={onRetry}
      >
        {retryLabel}
      </Button>
    </Alert>
  );
}

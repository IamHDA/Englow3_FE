"use client";

import { Alert, Button } from "@mantine/core";
import { AlertCircle, RotateCw } from "lucide-react";

import { useLanguage } from "@/shared/hooks/useLanguage";

type ListLoadErrorProps = {
  title?: string;
  onRetry: () => void;
};

/** A list the server did not give us, with the way to ask again. It sits inside the list's card, hence the margin. */
export function ListLoadError({ title, onRetry }: ListLoadErrorProps) {
  const copy = useLanguage().t.friends.list;
  return (
    <Alert
      color="warn"
      radius="md"
      m="md"
      icon={<AlertCircle size={20} aria-hidden="true" />}
      title={title ?? copy.loadErrorTitle}
    >
      {copy.loadErrorDescription}
      <Button
        variant="light"
        color="warn"
        size="sm"
        mt="sm"
        display="block"
        leftSection={<RotateCw size={16} aria-hidden="true" />}
        onClick={onRetry}
      >
        {copy.retry}
      </Button>
    </Alert>
  );
}

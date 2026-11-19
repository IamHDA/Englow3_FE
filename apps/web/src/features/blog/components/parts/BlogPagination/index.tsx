"use client";

import { Group, Pagination } from "@mantine/core";

import { paginationControlProps } from "@/shared/a11y/paginationControls";
import { useLanguage } from "@/shared/hooks/useLanguage";

type BlogPaginationProps = {
  /** Counted from 1. */
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
};

/** Page buttons under a list - nothing at all while the list fits on one page. */
export function BlogPagination({
  page,
  totalPages,
  onChange,
}: BlogPaginationProps) {
  const { isVi } = useLanguage();
  if (totalPages <= 1) return null;
  return (
    <Group justify="center">
      <Pagination
        value={page}
        onChange={onChange}
        total={totalPages}
        getControlProps={paginationControlProps(isVi)}
      />
    </Group>
  );
}

"use client";

import { useState } from "react";

/**
 * The page a list is on, counted from 1. Call `fitTo` with the total the list
 * reports: when the list has shrunk under the page - the last row of the last
 * page was unfriended - the page steps back to the new last one instead of
 * showing an empty page. The total is undefined while a page is loading and
 * says nothing then: stepping back on it would undo the very page change that
 * is loading.
 */
export function usePageNumber() {
  const [page, setPage] = useState(1);

  const fitTo = (totalPages: number | undefined) => {
    if (totalPages !== undefined && page > Math.max(totalPages, 1)) {
      setPage(Math.max(totalPages, 1));
    }
  };

  return { page, setPage, fitTo };
}

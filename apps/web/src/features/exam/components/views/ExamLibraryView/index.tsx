"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useExamLibraryQuery } from "@/lib/graphql/generated/hooks";
import { ExamCard } from "../../blocks/ExamCard";
import { ExamEmptyState } from "../../blocks/ExamEmptyState";
import { ExamFilters } from "../../blocks/ExamFilters";
import { ExamLibrarySkeleton } from "../../blocks/ExamLibrarySkeleton";
import { EXAM_TYPE_TABS } from "../../../constants/examLibrary";
import type { ExamFiltersState } from "../../../types";
import classes from "./ExamLibraryView.module.css";
import type {
  CertificateType,
  CertificateVariant,
  ExamType,
  TargetLevel,
} from "@/lib/graphql/generated/schemaTypes";

const PAGE_SIZE = 8;

export function ExamLibraryView() {
  const [filters, setFilters] = useState<ExamFiltersState>({
    searchQuery: "",
    tabId: "all",
    skill: "ALL",
    targetLevel: "ALL",
    attemptStatus: "ALL",
    sortBy: "NEWEST",
    page: 0,
  });

  const activeTab = useMemo(
    () => EXAM_TYPE_TABS.find((t) => t.id === filters.tabId),
    [filters.tabId],
  );

  const queryVariables = useMemo(() => {
    return {
      examType: "MOCK" as ExamType,
      certificateType: activeTab?.certificateType as
        CertificateType | undefined,
      certificateVariant: activeTab?.certificateVariant as
        CertificateVariant | undefined,
      targetLevel:
        filters.targetLevel !== "ALL"
          ? (filters.targetLevel as TargetLevel)
          : undefined,
      title: filters.searchQuery ? filters.searchQuery.trim() : undefined,
      page: filters.page,
      size: PAGE_SIZE,
    };
  }, [activeTab, filters.targetLevel, filters.searchQuery, filters.page]);

  const { data, loading, error, refetch } = useExamLibraryQuery({
    variables: queryVariables,
    notifyOnNetworkStatusChange: true,
  });

  const handleFilterChange = (newFilters: Partial<ExamFiltersState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: "",
      tabId: "all",
      skill: "ALL",
      targetLevel: "ALL",
      attemptStatus: "ALL",
      sortBy: "NEWEST",
      page: 0,
    });
  };

  const examPage = data?.exams;
  const items = examPage?.items ?? [];
  const totalItems = examPage?.totalItems ?? 0;
  const totalPages = Math.max(examPage?.totalPages ?? 1, 1);
  const currentPage = filters.page;

  // Sorting items client-side if needed (e.g. by targetLevel or title)
  const sortedItems = useMemo(() => {
    if (!items.length) return [];
    const list = [...items];

    if (filters.sortBy === "LEVEL_ASC") {
      list.sort((a, b) =>
        (a.targetLevel ?? "").localeCompare(b.targetLevel ?? ""),
      );
    } else if (filters.sortBy === "LEVEL_DESC") {
      list.sort((a, b) =>
        (b.targetLevel ?? "").localeCompare(a.targetLevel ?? ""),
      );
    } else if (filters.sortBy === "SCORE_DESC") {
      list.sort((a, b) => (b.maxRawScore ?? 0) - (a.maxRawScore ?? 0));
    }
    return list;
  }, [items, filters.sortBy]);

  // Pagination calculation
  const startItem = totalItems > 0 ? currentPage * PAGE_SIZE + 1 : 0;
  const endItem = Math.min((currentPage + 1) * PAGE_SIZE, totalItems);

  return (
    <div className={classes.wrapper}>
      {/* Header Banner */}
      <div className={classes.headerBanner}>
        <div className={classes.headerText}>
          <span className={classes.tagline}>Mock Test · Thư viện đề</span>
          <h1 className={classes.title}>Thư viện đề thi</h1>
          <p className={classes.subtitle}>
            Chọn đề thi đầy đủ bấm giờ chuẩn kỳ thi quốc tế ETS &amp; IELTS,
            hoặc đề theo từng kỹ năng để ôn luyện tập trung.
          </p>
        </div>

        <div className={classes.statsRow}>
          <div className={classes.statItem}>
            <span className={classes.statValue}>{totalItems}</span>
            <span className={classes.statLabel}>Bộ đề thi thật</span>
          </div>
          <div className={classes.statItem}>
            <span className={classes.statValue}>100%</span>
            <span className={classes.statLabel}>Chấm tự động</span>
          </div>
          <div className={classes.statItem}>
            <span className={classes.statValue}>AI</span>
            <span className={classes.statLabel}>Phân tích điểm</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <ExamFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        totalItems={totalItems}
      />

      {/* Content Area */}
      {loading && !data ? (
        <ExamLibrarySkeleton />
      ) : error ? (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <p style={{ color: "var(--mantine-color-red-6)", fontWeight: 600 }}>
            Không thể tải danh sách đề thi: {error.message}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            style={{
              marginTop: 12,
              padding: "8px 20px",
              borderRadius: 999,
              background: "#0f172a",
              color: "#fff",
              border: 0,
              cursor: "pointer",
            }}
          >
            Thử lại
          </button>
        </div>
      ) : sortedItems.length === 0 ? (
        <ExamEmptyState
          searchQuery={filters.searchQuery}
          onResetFilters={handleResetFilters}
        />
      ) : (
        <>
          <div className={classes.grid}>
            {sortedItems.map((exam) => (
              <ExamCard key={exam.id} exam={exam} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 ? (
            <div className={classes.paginationRow}>
              <span className={classes.rangeLabel}>
                Hiển thị {startItem} - {endItem} của {totalItems} đề thi
              </span>

              <div className={classes.pageButtons}>
                <button
                  type="button"
                  className={classes.navButton}
                  onClick={() =>
                    handleFilterChange({ page: Math.max(currentPage - 1, 0) })
                  }
                  disabled={currentPage === 0}
                  aria-label="Trang trước"
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: totalPages }).map((_, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    className={classes.pageNumber}
                    data-active={currentPage === pIdx}
                    onClick={() => handleFilterChange({ page: pIdx })}
                  >
                    {pIdx + 1}
                  </button>
                ))}

                <button
                  type="button"
                  className={classes.navButton}
                  onClick={() =>
                    handleFilterChange({
                      page: Math.min(currentPage + 1, totalPages - 1),
                    })
                  }
                  disabled={currentPage >= totalPages - 1}
                  aria-label="Trang sau"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

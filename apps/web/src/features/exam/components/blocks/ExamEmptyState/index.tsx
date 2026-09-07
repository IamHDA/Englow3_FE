import { Search } from "lucide-react";
import classes from "./ExamEmptyState.module.css";

type ExamEmptyStateProps = {
  searchQuery?: string;
  onResetFilters: () => void;
};

export function ExamEmptyState({
  searchQuery,
  onResetFilters,
}: ExamEmptyStateProps) {
  return (
    <div className={classes.emptyContainer}>
      <div className={classes.iconCircle}>
        <Search size={28} aria-hidden="true" />
      </div>

      <h3 className={classes.title}>Không tìm thấy đề thi phù hợp</h3>

      <p className={classes.description}>
        {searchQuery
          ? `Không có đề thi nào khớp với từ khoá "${searchQuery}". Thử điều chỉnh từ khoá hoặc xoá bớt các bộ lọc để xem nhiều kết quả hơn.`
          : "Không có đề thi nào thoả mãn các điều kiện lọc hiện tại. Thử bỏ chọn một vài bộ lọc để xem danh sách đề."}
      </p>

      <button
        type="button"
        className={classes.clearButton}
        onClick={onResetFilters}
      >
        Xoá toàn bộ bộ lọc
      </button>
    </div>
  );
}

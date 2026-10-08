"use client";
import { useCallback } from "react";
import { useLanguage } from "@/shared/hooks/useLanguage";
const messages: Record<string, string> = {
  "Tải nháp xuống máy": "Download draft",
  "Tải bản hiện hành": "Reload current version",
  "Tải bản mới sẽ thay nội dung đang nhập. Hãy tải nháp xuống trước để đối chiếu. Tiếp tục?":
    "Reload will replace your current edits. Download the draft first to compare. Continue?",
  "Công bố kết quả": "Publish result",
  "Thiết bị ghi âm bị gián đoạn. Hãy kiểm tra micro rồi ghi lại.":
    "Recording was interrupted. Check the microphone and record again.",
  "Không xử lý được bản ghi. Hãy ghi lại ít nhất 1 giây, tối đa 5 phút.":
    "Could not process the recording. Record between 1 second and 5 minutes.",
  "Không mở được micro. Kiểm tra quyền truy cập micro và thiết bị, rồi thử lại.":
    "Could not open the microphone. Check permission and your device, then retry.",
  "Trình duyệt không lưu được bản sao tạm. Hãy bấm Lưu bản nháp trước khi rời trang.":
    "Your browser could not keep a local copy. Save the draft before leaving.",
  "Chưa lưu được bản nháp. Nội dung vẫn được giữ; hãy thử lại. Nếu mở nhiều tab, tải lại và chọn khôi phục bản sao tạm.":
    "Draft saving failed. Your text is retained; retry. If multiple tabs are open, reload and choose the local copy.",
  "phút gợi ý": "suggested minutes",
  "Khuyến nghị": "Recommended",
  "Bài viết": "Writing response",

  "Kỹ năng": "Skill",
  "Dạng bài": "Task type",
  "Tên đề": "Task title",
  "Đề và hướng dẫn": "Task and instructions",
  "Số từ khuyến nghị": "Recommended word count",
  "Thời gian gợi ý (giây)": "Suggested time (seconds)",
  "Ghi chú chấm bài": "Rubric notes",
  "Ghi chú chấm": "Rubric notes",
  "Bài tham khảo": "Reference answer",
  Hủy: "Cancel",
  "Lưu đề": "Save task",
  "Điền nhanh từ đề mẫu": "Start from a template",
  "Chọn Writing Task 1/2 hoặc Speaking Part 1/2/3":
    "Choose Writing Task 1/2 or Speaking Part 1/2/3",
  "Chọn mẫu sẽ điền lại các trường bên dưới. Bạn có thể chỉnh sửa trước khi lưu.":
    "The template replaces the fields below. Edit it before saving.",
  "Thay đề mẫu sẽ ghi đè nội dung đang nhập. Tiếp tục?":
    "Replace the content you entered with this template?",
  "Chỉnh sửa đề luyện": "Edit practice task",
  "Tạo đề Writing / Speaking": "Create a Writing / Speaking task",
  "Đã khôi phục bản nháp trên thiết bị. Chưa lưu lên máy chủ.":
    "Local draft restored. Changes have not been saved to the server.",
  "Không lưu được nháp trên thiết bị. Hãy lưu đề trước khi rời trang.":
    "Local storage is unavailable. Save your task before leaving.",
  "Đã lưu đề vào bản nháp.": "Task saved as a draft.",
  "Đề đã lưu nhưng danh sách chưa cập nhật. Hãy tải lại.":
    "Task saved, but refreshing failed. Reload the list.",
  "Chưa lưu được đề. Nội dung vẫn được giữ. Nếu đề đã bị thay đổi ở tab khác, đóng cửa sổ và tải lại danh sách.":
    "Save failed. Your content is retained. If another tab changed the task, reopen the current version.",
  "Người học sẽ thấy nội dung này trước khi làm bài. Với Task 1, cung cấp đầy đủ số liệu hoặc mô tả nguồn trong đề.":
    "Learners see this before starting. For Task 1, include the complete data or source description.",
  "Chỉ người soạn, người duyệt và bộ chấm xem trước khi nộp; không thay đổi 4 tiêu chí của rubric.":
    "Visible to authors and reviewers before submission; the four rubric criteria stay fixed.",
  "Chỉ hiện cho người học sau khi đã có kết quả.":
    "Shown to learners after the result is ready.",
  "Đề được lưu thành bản nháp. Gửi duyệt sau khi kiểm tra; admin sẽ quyết định xuất bản.":
    "Save as a draft, check the content, then submit for administrator approval.",
  "Chấm bài": "Grade submission",
  "Chấm bài ·": "Grade submission ·",
  "Đã công bố kết quả cho người học.": "Result published for the learner.",
  "Kết quả đã lưu nhưng hàng đợi chưa cập nhật. Hãy tải lại.":
    "Result published, but refreshing failed. Reload the queue.",
  "Chưa lưu được kết quả. Kiểm tra đủ nhận xét cho 4 tiêu chí và điểm theo bước 0.5. Nếu bài đã được người khác chấm, tải lại hàng đợi.":
    "Could not publish. Complete all four criteria in 0.5 increments. If another reviewer graded the work, reload its current version.",
  "Đã khôi phục nháp nhận xét. Chưa công bố kết quả.":
    "Feedback draft restored. The result has not been published.",
  "Không lưu được nháp trên thiết bị. Giữ trang mở đến khi lưu thành công.":
    "Local storage is unavailable. Keep the page open until saving succeeds.",
  "Bạn đang điều chỉnh kết quả đã công bố. Lý do và kết quả trước đó sẽ được lưu vào lịch sử kiểm duyệt.":
    "You are revising a published result. Your reason and the previous scores are retained in the review history.",
  "Đề bài": "Task instructions",
  "Nghe toàn bộ bản ghi trước khi chấm":
    "Listen to the complete recording before grading",
  "Bản chép lời (nếu có)": "Transcript (optional)",
  "· điểm 0–9": "· score 0–9",
  "Nhận xét có dẫn chứng ·": "Feedback with evidence ·",
  "Trích đoạn nguyên văn (tùy chọn) ·": "Exact quote (optional) ·",
  "Sao chép từ bài viết; không tự tạo dẫn chứng.":
    "Copy from the submitted writing; do not invent evidence.",
  "Trích đoạn phải có trong bài viết.":
    "The quote must occur in the submitted writing.",
  "Audio bắt đầu (giây) ·": "Audio start (seconds) ·",
  "Audio kết thúc (giây) ·": "Audio end (seconds) ·",
  "Nhập đủ hai mốc trong bản ghi.": "Enter both times within the recording.",
  "Nhận xét tổng quan": "Overall feedback",
  "Điểm làm tốt (mỗi dòng một ý, tối đa 10 ý)":
    "Strengths (one per line, up to 10)",
  "Bước cải thiện (mỗi dòng một ý, tối đa 10 ý)":
    "Improvements (one per line, up to 10)",
  "Tối đa 10 ý": "Up to 10 items",
  "Ghi chú kiểm duyệt / lý do điều chỉnh": "Review note / reason for revision",
  "Lưu và công bố kết quả": "Save and publish result",
  "Đáp ứng yêu cầu đề": "Task response",
  "Mạch lạc và liên kết": "Coherence and cohesion",
  "Từ vựng": "Lexical resource",
  "Ngữ pháp": "Grammatical range",
  "Trôi chảy và mạch lạc": "Fluency and coherence",
  "Phát âm": "Pronunciation",
  "Duyệt đề, theo dõi bài nộp và điều chỉnh kết quả.":
    "Review tasks, track submissions and revise results.",
  "Soạn đề luyện tập và chấm bài của các đề bạn phụ trách.":
    "Author practice tasks and grade work for your own tasks.",
  "Tạo đề luyện": "Create practice task",
  "Đề luyện tập": "Practice tasks",
  "Bài nộp và kết quả": "Submissions and results",
  "Trạng thái đề": "Task status",
  "Trạng thái bài nộp": "Submission status",
  "Tất cả kỹ năng": "All skills",
  "Tất cả trạng thái": "All statuses",
  "Tất cả bài đã nộp": "All submitted work",
  "Tìm bài": "Search submissions",
  "Tên người học, đề hoặc mã bài": "Learner name, task or submission ID",
  "Thứ tự": "Sort order",
  "Chờ lâu nhất trước": "Oldest first",
  "Mới nhất trước": "Newest first",
  "Tải lại": "Reload",
  "Chưa tải lại được danh sách.": "Could not refresh the list.",
  "Thao tác đã thành công nhưng danh sách chưa cập nhật. Bấm Tải lại để xem trạng thái mới.":
    "The action succeeded, but refreshing failed. Reload the list to see its current state.",
  "Thao tác chưa thành công. Kiểm tra trạng thái đề và quyền truy cập, rồi thử lại.":
    "The action failed. Check the task status and permissions, then retry.",
  "Chưa tải được dữ liệu mới. Đang hiển thị danh sách đã tải trước đó; bấm Tải lại để thử lại.":
    "Refresh failed. Showing previously loaded data; reload to retry.",
  "nội dung luyện tập": "practice content",
  "đề luyện tập": "practice tasks",
  "bài nộp": "submissions",
  "Trang chủ": "Home",
  "Xem trước": "Preview",
  "Sửa đề": "Edit task",
  "Gửi duyệt": "Submit for review",
  "Duyệt và xuất bản": "Approve and publish",
  "Trả lại": "Request changes",
  "Lưu trữ": "Archive",
  "Khôi phục": "Restore",
  "Bài làm": "Submission",
  "Đề & rubric": "Task & rubric",
  "Writing Task 1 — mô tả bảng số liệu": "Writing Task 1 — describe a table",
  "Writing Task 2 — học trực tuyến": "Writing Task 2 — online learning",
  "Speaking Part 1 — quê hương": "Speaking Part 1 — hometown",
  "Speaking Part 2 — một người truyền cảm hứng":
    "Speaking Part 2 — an inspiring person",
  "Speaking Part 3 — công nghệ và giáo dục":
    "Speaking Part 3 — technology and education",
  "Không có đề phù hợp bộ lọc.": "No tasks match these filters.",
  "Chưa có đề Writing / Speaking.": "No Writing / Speaking tasks yet.",
  "Bạn chưa có đề Writing / Speaking phụ trách.":
    "You have no Writing / Speaking tasks yet.",
  "Tạo đề mới hoặc điền nhanh từ 5 đề mẫu. Sau khi lưu bản nháp, gửi duyệt; đề được admin xuất bản mới xuất hiện cho người học.":
    "Create a task or start from five templates. Save a draft and submit it for review; learners see it after an administrator publishes it.",
  "Staff chỉ thấy và chấm các đề do mình tạo.":
    "Staff can only view and grade tasks they created.",
  "Tạo đề và chọn mẫu": "Create a task from a template",
  "Người học": "Learner",
  "Xem bài": "View submission",
  "Điều chỉnh điểm": "Revise result",
  "Chưa có bài nộp phù hợp bộ lọc. Bài sẽ xuất hiện sau khi người học nộp một đề đã xuất bản.":
    "No submissions match these filters. Work appears after a learner submits a published task.",
  "Chấm theo rubric 4 tiêu chí mặc định.":
    "Use the default four-criterion rubric.",
  "Chưa có bài tham khảo.": "No reference answer.",
  "Yêu cầu chỉnh sửa đề": "Request task changes",
  "Lý do / nội dung cần sửa": "Reason / changes required",
  "Trả lại cho người soạn": "Return to the author",
  "Bài nộp và lịch sử": "Submission and review history",
  "← Danh sách đề": "← Task library",
  "← Lịch sử và đề luyện": "← My work and practice tasks",
  "Đang ghi âm. Rời trang sẽ dừng và mất lần ghi đang chạy. Tiếp tục?":
    "Recording is active. Leaving stops this take. Continue?",
  "Bản ghi chưa nộp. Rời trang và giữ nháp trên thiết bị nếu bộ nhớ khả dụng?":
    "This recording is not submitted. Leave and keep a local draft when storage is available?",
  "Đang mở lượt làm…": "Opening your attempt…",
  "Đang tải bản ghi lên…": "Uploading the recording…",
  "Đang xác nhận nộp bài…": "Confirming submission…",
  "Chưa gửi được bản ghi. Bản ghi vẫn được giữ; hãy kiểm tra kết nối rồi thử lại.":
    "Upload failed. Your recording is retained; check the connection and retry.",
  "Chưa mở được bản nháp. Hãy thử lại.":
    "Could not open the draft. Please retry.",
  "Bài nộp sẽ được AI đánh giá theo 4 tiêu chí, với điểm luyện tập ước lượng.":
    "AI will estimate a practice score using four criteria.",
  "Bài nộp sẽ được chuyển cho giáo viên chấm theo 4 tiêu chí.":
    "Your work will go to a teacher for review using four criteria.",
  "Đã khôi phục bản ghi chưa nộp. Bạn có thể nghe lại hoặc ghi lại.":
    "Unsubmitted recording restored. Listen to it or record a new take.",
  "Không lưu được audio trên thiết bị. Tải bản ghi xuống hoặc giữ trang mở đến khi nộp thành công.":
    "Cannot save audio on this device. Download the recording or keep the page open until submission succeeds.",
  "Trả lời đề bằng giọng nói của bạn": "Answer the task in your own voice",
  "Có thể nghe lại và ghi lại trước khi nộp. Tối đa 5 phút mỗi bản ghi.":
    "Listen and record again before submitting. Each take may last up to five minutes.",
  "Dừng ghi": "Stop recording",
  "Ghi lại": "Record again",
  "Bắt đầu ghi âm": "Start recording",
  "Tải bản ghi xuống": "Download recording",
  "Bắt đầu viết bài": "Start writing",
  "Nộp bản ghi": "Submit recording",
  "Bản ghi chưa nộp": "Unsubmitted recording",
  "Đã nộp": "Submitted",
  "Bài đã được lưu và đang chờ AI chấm. Bạn có thể rời trang rồi quay lại lịch sử để xem kết quả.":
    "Your submission is saved and waiting for AI assessment. You can leave and return to My work for the result.",
  "Bài đã được lưu và đang chờ giáo viên chấm. Kết quả sẽ xuất hiện tại đây khi hoàn tất.":
    "Your submission is saved and waiting for teacher review. Its result will appear here when ready.",
  "Chưa chấm được bài này. Bài viết/bản ghi vẫn được giữ.":
    "Assessment failed. Your writing or recording is retained.",
  "Thử chấm lại": "Retry assessment",
  "Gửi giáo viên chấm": "Request teacher review",
  "Bản ghi chưa được nộp. Nếu upload đã hoàn tất, bạn có thể thử nộp lại.":
    "The recording has not been submitted. If its upload finished, you can submit it again.",
  "Nộp bản ghi đã upload": "Submit uploaded recording",
  "Ghi một bài mới": "Record a new response",
  "Luyện thêm một lần": "Practice again",
  "Thao tác đã thành công nhưng chưa tải được trạng thái mới. Hãy tải lại trang.":
    "The action succeeded, but refreshing failed. Reload the page.",
  "Chưa thực hiện được thao tác. Nội dung bài nộp vẫn được giữ; hãy thử lại.":
    "The action failed. Your submission is retained; please retry.",
  "Chưa lưu được bản nháp nên bài chưa được nộp. Nội dung vẫn được giữ; hãy thử lưu lại.":
    "Your draft could not be saved, so it was not submitted. Your text is retained; try saving again.",
  "Bài đã được nộp nhưng chưa tải được trạng thái mới. Hãy tải lại trang để xem kết quả.":
    "Your work was submitted, but refreshing failed. Reload the page for its current status.",
  "Chưa nộp được bài. Bản nháp đã được giữ; hãy thử lại.":
    "Submission failed. Your draft is retained; please retry.",
  "Có bản sao tạm chưa đồng bộ từ lần làm trước. Chọn nội dung bạn muốn tiếp tục.":
    "A local copy has not been synchronized. Choose the version you want to continue.",
  "Khôi phục bản sao tạm": "Restore local copy",
  "Dùng bản trên máy chủ": "Use server version",
  "Bài viết của bạn": "Your writing",
  "Tự động lưu sau khi bạn ngừng nhập. Khuyến nghị thời gian trong đề là gợi ý luyện tập.":
    "Saves automatically after you pause typing. The task time is a practice suggestion.",
  "Đang lưu…": "Saving…",
  "Có thay đổi chưa lưu": "Unsaved changes",
  "Đã lưu bản nháp": "Draft saved",
  "Lưu bản nháp": "Save draft",
  "Nộp bài để chấm": "Submit for assessment",
  "Nộp bài viết": "Submit writing",
  "Sau khi nộp, bài viết này sẽ được khóa chỉnh sửa. Bạn có thể tạo lần luyện mới sau đó.":
    "This response becomes read-only after submission. You can start a new practice attempt later.",
  "Tiếp tục viết": "Continue writing",
  "Xác nhận nộp": "Confirm submission",
  "Điểm luyện tập ước lượng:": "Estimated practice score:",
  từ: "words",
  "ký tự": "characters",
  "Đề khuyến nghị": "Recommended word count",
  "Bản nháp": "Draft",
  "Chờ duyệt đề": "Awaiting approval",
  "Cần chỉnh sửa": "Changes requested",
  "Đã xuất bản": "Published",
  "Đã lưu trữ": "Archived",
  "AI đang chấm": "Awaiting AI assessment",
  "Chờ giáo viên chấm": "Awaiting teacher review",
  "Đã có kết quả": "Result ready",
  "Chấm chưa thành công": "Assessment failed",
};
export function useAssessmentText() {
  const { isVi } = useLanguage();
  return useCallback(
    (message: string) =>
      isVi
        ? message
        : messages[message.trim()]
          ? `${message.startsWith(" ") ? " " : ""}${messages[message.trim()]}${message.endsWith(" ") ? " " : ""}`
          : message,
    [isVi],
  );
}

const QUIZZES = [\n  { topic: 'Từ vựng', level: 'Cơ bản', title: 'Từ vựng văn phòng · Bộ 3', desc: 'Email, lịch họp và các cụm từ dùng hằng ngày ở công ty.', count: 10, time: '8 phút', best: 'Cao nhất 8/10', state: 'Đang làm dở', cta: 'Tiếp tục', primary: true },\n  { topic: 'Ngữ pháp', level: 'Trung cấp', title: 'Thì hiện tại hoàn thành', desc: 'Phân biệt hiện tại hoàn thành với quá khứ đơn trong ngữ cảnh công việc.', count: 15, time: '12 phút', best: 'Cao nhất 11/15', state: 'Đã làm 2 lần', cta: 'Làm lại' },\n  { topic: 'Nghe', level: 'Trung cấp', title: 'Nghe số liệu và ngày tháng', desc: 'Nghe đoạn ngắn rồi chọn con số, ngày giờ được nhắc tới.', count: 12, time: '10 phút', best: 'Chưa làm', state: 'Mới', cta: 'Bắt đầu', primary: true },\n  { topic: 'Từ vựng', level: 'Nâng cao', title: 'Cụm động từ trong hợp đồng', desc: 'Các phrasal verb thường gặp khi đọc điều khoản và thư thương mại.', count: 15, time: '14 phút', best: 'Cao nhất 9/15', state: 'Đã làm 1 lần', cta: 'Làm lại' },\n  { topic: 'Ngữ pháp', level: 'Cơ bản', title: 'Giới từ chỉ thời gian', desc: 'in, on, at và cách dùng trong lịch làm việc.', count: 10, time: '7 phút', best: 'Cao nhất 10/10', state: 'Hoàn thành', cta: 'Làm lại' },\n  { topic: 'Đọc', level: 'Trung cấp', title: 'Đọc thông báo nội bộ', desc: 'Ba thông báo ngắn, mỗi bài bốn câu hỏi tìm ý chính.', count: 12, time: '11 phút', best: 'Chưa làm', state: 'Mới', cta: 'Bắt đầu', primary: true }\n];

const HISTORY = [\n  { title: 'Giới từ chỉ thời gian', topic: 'Ngữ pháp', attempt: 3, date: 'Hôm nay · 09:12', correct: '10/10', score: '10', pct: '100%' },\n  { title: 'Từ vựng văn phòng · Bộ 3', topic: 'Từ vựng', attempt: 2, date: 'Hôm nay · 08:30', correct: '8/10', score: '8', pct: '80%' },\n  { title: 'Thì hiện tại hoàn thành', topic: 'Ngữ pháp', attempt: 2, date: 'Hôm qua · 20:45', correct: '11/15', score: '7.3', pct: '73%' },\n  { title: 'Cụm động từ trong hợp đồng', topic: 'Từ vựng', attempt: 1, date: '4 tháng 8 · 19:02', correct: '9/15', score: '6', pct: '60%' },\n  { title: 'Từ vựng văn phòng · Bộ 2', topic: 'Từ vựng', attempt: 1, date: '3 tháng 8 · 21:15', correct: '9/10', score: '9', pct: '90%' },\n  { title: 'Thì hiện tại hoàn thành', topic: 'Ngữ pháp', attempt: 1, date: '2 tháng 8 · 18:40', correct: '8/15', score: '5.3', pct: '53%' },\n  { title: 'Nghe số liệu và ngày tháng', topic: 'Nghe', attempt: 1, date: '1 tháng 8 · 07:55', correct: '9/12', score: '7.5', pct: '75%' }\n];

const QUESTIONS = [\n  { prompt: 'What does \"reschedule a meeting\" mean?', opts: ['Đổi sang thời gian khác', 'Huỷ hẳn cuộc họp', 'Mời thêm người dự', 'Ghi biên bản cuộc họp'] },\n  { prompt: 'Choose the closest meaning of \"invoice\".', opts: ['Hoá đơn thanh toán', 'Bản hợp đồng', 'Phiếu giao hàng', 'Biên bản họp'] },\n  { prompt: 'What does \"follow up on an email\" mean?', opts: ['Nhắc lại sau khi đã gửi email', 'Chuyển tiếp email cho người khác', 'Xoá email cũ', 'Trả lời tự động'] }\n];

const SUMMARY = [\n  { label: 'Số câu đúng', value: '8 / 10' },\n  { label: 'Thời gian làm', value: '6 phút 42 giây' },\n  { label: 'Điểm cao nhất trước đây', value: '7 / 10' },\n  { label: 'Lần làm thứ', value: '3' }\n];

const REVIEW = [\n  { n: 1, q: 'What does \"reschedule a meeting\" mean?', detail: 'Bạn chọn: Đổi sang thời gian khác', ok: true, tag: 'Đúng' },\n  { n: 2, q: 'Choose the closest meaning of \"invoice\".', detail: 'Bạn chọn: Hoá đơn thanh toán', ok: true, tag: 'Đúng' },\n  { n: 3, q: 'What does \"follow up on an email\" mean?', detail: 'Bạn chọn: Chuyển tiếp email cho người khác — đáp án đúng: Nhắc lại sau khi đã gửi email', ok: false, tag: 'Sai' },\n  { n: 4, q: 'Which word means \"a short written record of a meeting\"?', detail: 'Bạn chọn: minutes', ok: true, tag: 'Đúng' },\n  { n: 5, q: 'What does \"on behalf of\" mean?', detail: 'Bạn chọn: thay vì — đáp án đúng: thay mặt cho', ok: false, tag: 'Sai' },\n  { n: 6, q: 'Choose the closest meaning of \"deadline\".', detail: 'Bạn chọn: hạn chót', ok: true, tag: 'Đúng' }\n];

const RW_BANK = ['have', 'to', 'finish', 'finished', 'has', 'finishing'];

const RW_TOKENS = [{ t: 'We' }, { slot: 0 }, { slot: 1 }, { slot: 2 }, { t: 'the report before Friday.' }];

const ORD_WORDS = ['asked', 'The manager', 'to submit', 'us', 'the report', 'by Friday.', 'again', 'quickly'];

const MATCH_L = [\n  'If the shipment is delayed,',\n  'Because the client approved the budget,',\n  'Although the meeting was short,',\n  'Before you send the report,',\n  'As soon as the invoice arrives,'\n];

const MATCH_R = [\n  'please ask Linh to proofread it.',\n  'we can start production next week.',\n  'we will notify the customer right away.',\n  'accounting will process the payment.',\n  'we covered every item on the agenda.'\n];

const KEYS = ['A', 'B', 'C', 'D'];

const FILTERS = ['Tất cả', 'Từ vựng', 'Ngữ pháp', 'Nghe', 'Đọc'];

const H_FILTERS = ['Tất cả', '7 ngày qua', '30 ngày qua', 'Điểm dưới 7'];


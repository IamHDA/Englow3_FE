# Testing: khởi động dịch vụ và tự phục hồi dữ liệu

## Luồng mới

Root layout xác thực phiên và trả giao diện trước; AccountProvider tải hồ sơ sau. Apollo cache được tạo lại khi đổi user, trong khi AuthProvider vẫn giữ trách nhiệm dọn draft của tài khoản cũ. Không dùng chung dữ liệu cá nhân giữa các phiên.

Khi `SERVICE_WARMUP_ENABLED=true`, document navigation kích hoạt `waitUntil` gọi BFF `/system/status`. BFF kiểm tra readiness BE và AI song song, mỗi probe tối đa 3 giây. HTML không đợi kết quả. Probe không gọi LLM và không gửi token người dùng.

Sau hydration, một coordinator mỗi tab gọi `/api/system/status`. Khi lỗi, nhịp chờ tăng 2/4/8/10 giây, có jitter và giới hạn 120 giây. Chỉ query đang được quan sát và gặp lỗi dịch vụ mới được refetch; AccountProvider phục hồi hồ sơ riêng. Mutation không được tự phát lại. Hết budget có nút kiểm tra lại; offline/ẩn tab giảm traffic. Tên trạng thái không khẳng định Render đang ngủ chỉ từ một timeout.

## Cấu hình testing cần có

- Web Vercel: `BFF_GRAPHQL_URL=https://englow3-bff-test.vercel.app/graphql`, `SERVICE_WARMUP_ENABLED=true`. Workflow đã inject hai giá trị này cho testing.
- BFF Vercel: `BACKEND_URL=https://englow3-backend-testing.onrender.com`; `AI_HEALTH_URL=https://<AI-testing-host>/health/ready`. Không đặt key trong `NEXT_PUBLIC_*`.
- GitHub Variables của cả hai repo: `AI_TESTING_HEALTH_URL` cùng URL readiness AI. Workflow FE dùng nó để cấu hình BFF; workflow BE dùng nó để kiểm chứng release.
- GitHub Secret của BE: `RENDER_AI_TESTING_DEPLOY_HOOK_URL`. Hook riêng cho AI testing; không sử dụng hook dev/main. Thiếu secret/variable thì bước deploy testing báo lỗi rõ.
- Render BE: `AI_SERVICE_BASE_URL` trỏ đúng AI testing, các key nội bộ hiện có phải khớp. Giữ Flyway bật để áp dụng V055. Không bật bản BE mới với schema chưa có cột lease.
- Render health check: dùng liveness của ứng dụng cho restart, readiness để xác định phục vụ dữ liệu. Không đưa provider AI bên ngoài vào liveness BE.

BFF trả `unconfigured` cho AI nếu thiếu URL, không giả vờ AI đã sẵn sàng. FastAPI readiness hiện kiểm tra cấu hình, không thực hiện inference để chứng minh provider hoạt động.

## Đo và vận hành

Chạy từ gốc repo FE:

```sh
node scripts/benchmark-services.mjs --web http://localhost:3000 --bff http://localhost:4000 --backend http://localhost:8080 --rounds 30 --label local-warm
```

Đo cold với `--rounds 1` sau một chu kỳ idle được xác nhận, lặp lại các chu kỳ độc lập; không gọi health trước lượt đo. Script đọc hết body và báo lỗi/timeout riêng, chỉ tính p95 khi có ít nhất 20 mẫu thành công. Số đo guest không chứng minh tốc độ trang đã đăng nhập; cần smoke ba role bằng browser.

Web trả `Server-Timing: bff` và request ID cho API forward; BE log thời gian HTTP, worker log queue wait/attempt duration; FastAPI trả `Server-Timing: ai` và log route/duration. Không log nội dung bài, token hoặc audio. Backend image lưu `RELEASE_SHA`; CI so sánh `/actuator/info` và AI `/version` với commit build, không coi deploy hook 200 là đã cập nhật xong.

## Rollback

- Tắt `SERVICE_WARMUP_ENABLED` để ngừng warmup trên document. Coordinator vẫn hỗ trợ phục hồi dữ liệu khi có truy cập.
- Dừng worker bằng `AI_WORKER_ENABLED=false`, không cần tắt toàn bộ API AI. Drain công việc đang chạy trước khi đổi image; job chưa xong sẽ được reclaim sau lease.
- Migration V055 bổ sung cột/index; giữ lại khi rollback image. Không xóa job hoặc reset dữ liệu người học.
- Không chạy worker cũ claim toàn bộ job cùng worker mới mà vẫn kỳ vọng Tutor có tài nguyên riêng.

Render Free vẫn có thời gian khởi động sau idle. Warmup bắt đầu sớm và giúp trang tự hồi phục; không thay thế dịch vụ chạy liên tục. Chỉ thay đổi gói/region sau khi kiểm tra cấu hình và đo thực tế.

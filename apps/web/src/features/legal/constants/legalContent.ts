import { CONTACT_EMAIL, OPERATOR_NAME } from "./operator";

/** A paragraph, or a bulleted list. */
export type LegalBlock = string | { list: string[] };

export type LegalSection = { title: string; blocks: LegalBlock[] };

const contact = CONTACT_EMAIL
  ? `Liên hệ: ${CONTACT_EMAIL}.`
  : "Bạn có thể liên hệ với chúng tôi qua kênh hỗ trợ trong ứng dụng.";

/**
 * Điều khoản sử dụng. Văn bản mẫu mô tả đúng những gì dịch vụ đang làm; đơn vị
 * vận hành cần rà soát với tư vấn pháp lý trước khi thu phí.
 */
export const TERMS: LegalSection[] = [
  {
    title: "1. Chấp nhận điều khoản",
    blocks: [
      `Khi tạo tài khoản hoặc sử dụng Englow3, bạn đồng ý với các điều khoản này. Dịch vụ do ${OPERATOR_NAME} vận hành. Nếu không đồng ý, vui lòng không sử dụng dịch vụ.`,
    ],
  },
  {
    title: "2. Tài khoản",
    blocks: [
      "Bạn cung cấp thông tin chính xác khi đăng ký và tự bảo quản mật khẩu của mình. Mọi hoạt động từ tài khoản được xem là của bạn.",
      "Người dưới 16 tuổi cần có sự đồng ý của cha mẹ hoặc người giám hộ trước khi sử dụng dịch vụ.",
      "Bạn có thể xoá tài khoản bất cứ lúc nào tại Hồ sơ → Bảo mật → Dữ liệu và tài khoản. Việc xoá là vĩnh viễn.",
    ],
  },
  {
    title: "3. Nội dung học và bài thi thử",
    blocks: [
      "Đề thi thử theo định dạng TOEIC, IELTS và các bài luyện tập khác do Englow3 biên soạn để luyện tập. Đây không phải đề thi chính thức.",
      "Englow3 không liên kết với, không được tài trợ hay xác nhận bởi ETS, British Council, IDP, Cambridge hay bất kỳ tổ chức khảo thí nào. TOEIC, IELTS là nhãn hiệu của chủ sở hữu tương ứng và chỉ được nhắc đến để mô tả định dạng bài luyện.",
      "Điểm số trong bài thi thử là ước lượng để bạn theo dõi tiến bộ, không đảm bảo kết quả của kỳ thi thật.",
    ],
  },
  {
    title: "4. Tính năng dùng trí tuệ nhân tạo",
    blocks: [
      "Chấm Writing và Speaking, đánh giá phát âm và gia sư AI do mô hình trí tuệ nhân tạo tạo ra. Kết quả có thể chưa chính xác hoặc chưa đầy đủ; hãy xem đây là gợi ý học tập, không phải đánh giá chính thức của giáo viên.",
      "Mỗi tài khoản có hạn mức yêu cầu AI mỗi ngày tuỳ theo gói. Khi hết hạn mức, các tính năng khác vẫn dùng được và hạn mức được làm mới vào ngày hôm sau.",
      "Nội dung bạn gửi để được chấm hoặc trả lời (văn bản, bản ghi âm) được chuyển tới nhà cung cấp mô hình AI để xử lý, như mô tả trong Chính sách bảo mật.",
    ],
  },
  {
    title: "5. Gói dịch vụ và thanh toán",
    blocks: [
      "Englow3 có gói Miễn phí và gói Pro. Gói Pro nâng hạn mức yêu cầu AI mỗi ngày; chi tiết và giá hiển thị tại trang Bảng giá.",
      "Thanh toán trực tuyến hiện chưa được mở. Khi mở, chúng tôi sẽ công bố phương thức thanh toán, chu kỳ gia hạn, cách huỷ và chính sách hoàn tiền trước khi bạn trả bất kỳ khoản phí nào.",
      "Gói Pro có thời hạn. Hết hạn, tài khoản tự động trở về gói Miễn phí; dữ liệu học tập của bạn vẫn được giữ nguyên.",
    ],
  },
  {
    title: "6. Hành vi không được phép",
    blocks: [
      {
        list: [
          "Sao chép hàng loạt, thu thập tự động hoặc bán lại nội dung học liệu và đề thi.",
          "Dùng công cụ tự động để vượt hạn mức, gây quá tải hoặc dò tìm lỗ hổng hệ thống.",
          "Chia sẻ tài khoản cho nhiều người, hoặc dùng tài khoản của người khác.",
          "Gửi nội dung vi phạm pháp luật, xúc phạm người khác hoặc chứa mã độc.",
        ],
      },
    ],
  },
  {
    title: "7. Quyền sở hữu trí tuệ",
    blocks: [
      "Giao diện, học liệu, đề thi và phần mềm của Englow3 thuộc về đơn vị vận hành hoặc bên cấp phép. Bạn được dùng cho mục đích học tập cá nhân, không được khai thác thương mại.",
      "Nội dung do bạn tạo (bài viết, bản ghi âm, thẻ học) vẫn thuộc về bạn. Bạn cho phép Englow3 lưu trữ và xử lý nội dung đó chỉ để cung cấp dịch vụ cho bạn.",
    ],
  },
  {
    title: "8. Tạm ngưng và chấm dứt",
    blocks: [
      "Chúng tôi có thể tạm ngưng hoặc chấm dứt tài khoản vi phạm điều khoản này, sau khi thông báo nếu có thể. Bạn có thể ngừng sử dụng và xoá tài khoản bất cứ lúc nào.",
    ],
  },
  {
    title: "9. Giới hạn trách nhiệm",
    blocks: [
      "Dịch vụ được cung cấp trên cơ sở hiện có. Chúng tôi cố gắng duy trì hoạt động liên tục nhưng không bảo đảm dịch vụ không gián đoạn hay không có lỗi.",
      "Trong phạm vi pháp luật cho phép, chúng tôi không chịu trách nhiệm đối với thiệt hại gián tiếp, và trách nhiệm tối đa không vượt quá số tiền bạn đã thanh toán cho dịch vụ trong 12 tháng gần nhất.",
    ],
  },
  {
    title: "10. Thay đổi điều khoản",
    blocks: [
      "Khi điều khoản thay đổi đáng kể, chúng tôi sẽ thông báo trong ứng dụng. Việc tiếp tục sử dụng sau thời điểm thay đổi có hiệu lực nghĩa là bạn chấp nhận bản mới.",
    ],
  },
  {
    title: "11. Luật áp dụng và liên hệ",
    blocks: [
      "Điều khoản này được điều chỉnh bởi pháp luật Việt Nam. Tranh chấp được ưu tiên giải quyết thông qua thương lượng.",
      contact,
    ],
  },
];

/** Chính sách bảo mật. Mô tả dữ liệu thực tế mà hệ thống thu thập và nơi nó đi qua. */
export const PRIVACY: LegalSection[] = [
  {
    title: "1. Ai xử lý dữ liệu của bạn",
    blocks: [
      `${OPERATOR_NAME} là bên kiểm soát và xử lý dữ liệu cá nhân của bạn khi bạn dùng Englow3. ${contact}`,
    ],
  },
  {
    title: "2. Dữ liệu chúng tôi thu thập",
    blocks: [
      {
        list: [
          "Tài khoản: email, họ tên, tên hiển thị, giới tính và ngày sinh (nếu bạn cung cấp), ảnh đại diện và ảnh bìa.",
          "Mục tiêu học: trình độ hiện tại, mục tiêu, kỹ năng muốn cải thiện, lý do học.",
          "Hoạt động học: kết quả và câu trả lời bài thi thử, bài kiểm tra, thẻ ghi nhớ, chép chính tả.",
          "Nội dung bạn gửi để chấm: bài viết Writing, bản ghi âm Speaking và phát âm, hội thoại với gia sư AI (văn bản và giọng nói).",
          "Kỹ thuật: nhật ký lỗi và truy cập cần thiết để vận hành và bảo vệ hệ thống.",
        ],
      },
      "Chúng tôi không thu thập dữ liệu nhạy cảm như số căn cước, thông tin tài chính hay vị trí.",
    ],
  },
  {
    title: "3. Mục đích sử dụng",
    blocks: [
      {
        list: [
          "Tạo và bảo vệ tài khoản của bạn.",
          "Chấm bài, tính điểm, hiển thị tiến độ và gợi ý lộ trình học.",
          "Cung cấp phản hồi từ AI cho bài viết, phát âm và câu hỏi gửi gia sư.",
          "Vận hành, sửa lỗi và đảm bảo an toàn dịch vụ.",
        ],
      },
      "Chúng tôi không bán dữ liệu cá nhân và không dùng dữ liệu của bạn cho quảng cáo.",
    ],
  },
  {
    title: "4. Xử lý bằng AI",
    blocks: [
      "Để chấm và phản hồi, nội dung bạn gửi (văn bản, bản ghi âm) được chuyển tới nhà cung cấp dịch vụ mô hình AI mà chúng tôi sử dụng. Chỉ nội dung cần cho yêu cầu đó được gửi, và hệ thống gắn yêu cầu với tài khoản của bạn để áp dụng hạn mức.",
      "Bạn có thể xoá dữ liệu hội thoại với gia sư AI bất cứ lúc nào tại trang Gia sư AI.",
    ],
  },
  {
    title: "5. Nơi dữ liệu được lưu và bên xử lý",
    blocks: [
      "Chúng tôi dùng các nhà cung cấp hạ tầng để vận hành dịch vụ: nền tảng xác thực, cơ sở dữ liệu và lưu trữ tệp (Supabase), máy chủ ứng dụng (Render, Vercel) và nhà cung cấp mô hình AI.",
      "Các nhà cung cấp này có thể đặt máy chủ ngoài lãnh thổ Việt Nam, vì vậy dữ liệu của bạn có thể được chuyển ra nước ngoài. Bằng việc sử dụng dịch vụ, bạn đồng ý với việc chuyển và xử lý đó theo mục đích nêu trên.",
    ],
  },
  {
    title: "6. Cookie và lưu trữ trên trình duyệt",
    blocks: [
      "Englow3 chỉ dùng cookie cần thiết: cookie phiên đăng nhập để giữ bạn đăng nhập. Không có cookie quảng cáo hay theo dõi hành vi.",
      "Trình duyệt cũng lưu một số lựa chọn của bạn như ngôn ngữ giao diện, trạng thái hướng dẫn và việc bạn đã đọc thông báo cookie.",
    ],
  },
  {
    title: "7. Thời gian lưu trữ",
    blocks: [
      "Dữ liệu được giữ trong thời gian bạn còn tài khoản. Khi bạn xoá tài khoản, dữ liệu của bạn bị xoá khỏi hệ thống đang vận hành ngay lập tức; bản sao lưu của nhà cung cấp hạ tầng được xoá theo chu kỳ sao lưu của họ.",
    ],
  },
  {
    title: "8. Quyền của bạn",
    blocks: [
      {
        list: [
          "Truy cập và tải về bản sao dữ liệu của bạn: Hồ sơ → Bảo mật → Dữ liệu và tài khoản → Tải dữ liệu của tôi.",
          "Chỉnh sửa thông tin cá nhân trong Hồ sơ.",
          "Xoá tài khoản và dữ liệu liên quan: cũng tại mục Dữ liệu và tài khoản.",
          "Rút lại đồng ý, phản đối hoặc hạn chế xử lý: liên hệ chúng tôi theo thông tin bên dưới.",
        ],
      },
    ],
  },
  {
    title: "9. Bảo mật",
    blocks: [
      "Kết nối được mã hoá, mật khẩu do nền tảng xác thực quản lý và không bao giờ được lưu dạng đọc được, quyền truy cập trong hệ thống được phân theo vai trò. Không hệ thống nào an toàn tuyệt đối; nếu xảy ra sự cố ảnh hưởng đến dữ liệu của bạn, chúng tôi sẽ thông báo theo quy định.",
    ],
  },
  {
    title: "10. Trẻ em",
    blocks: [
      "Dịch vụ không dành cho người dưới 16 tuổi nếu chưa có sự đồng ý của cha mẹ hoặc người giám hộ. Nếu bạn cho rằng một trẻ em đã đăng ký mà không có sự đồng ý đó, hãy liên hệ để chúng tôi xoá tài khoản.",
    ],
  },
  {
    title: "11. Thay đổi chính sách và liên hệ",
    blocks: [
      "Khi chính sách thay đổi đáng kể, chúng tôi sẽ thông báo trong ứng dụng và cập nhật ngày ở đầu trang.",
      contact,
    ],
  },
];

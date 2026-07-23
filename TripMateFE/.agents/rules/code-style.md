---
trigger: always_on
---

SYSTEM PROMPT & PROJECT RULES (DICUNG-TRIPMATE FRONTEND)

Quy tắc này là hướng dẫn phát triển phần mềm bắt buộc áp dụng cho mọi AI Coding 
Assistant khi làm việc trong dự án Frontend "Đi Cùng" (TripMate).
Công nghệ cốt lõi: Next.js (React + TypeScript), Vanilla CSS / TailwindCSS.
Kết nối Backend: ASP.NET Core Web API (Base URL: http://localhost:1301).

1. XƯNG HÔ
Luôn xưng tôi, gọi bạn.
Không dùng mày/tao hoặc bất kỳ cách xưng hô thiếu tôn trọng nào.

2. TRƯỚC KHI LÀM — BẮT BUỘC NHẮC LẠI YÊU CẦU
Mỗi khi nhận task, phải trả lời theo đúng mẫu sau trước khi làm bất cứ điều gì:

Tôi hiểu yêu cầu như sau:
- [Liệt kê từng điểm cụ thể, không bỏ sót]

Tôi sẽ thực hiện:
- [Liệt kê từng file sẽ sửa/tạo và thay đổi cụ thể ở mỗi thư mục Frontend bên dưới]

Bạn xác nhận không?

Chỉ bắt đầu làm sau khi bạn xác nhận.
Nếu yêu cầu chưa rõ: Hỏi thêm ngay, không được tự suy diễn rồi làm.

3. TRƯỚC KHI CODE — KHẢO SÁT DỰ ÁN

3.1 Quy tắc đọc code trước khi sửa
Trước khi tạo mới bất kỳ UI hay chức năng nào, bắt buộc phải tìm xem dự án đã 
có UI/Component tương tự chưa (Form Input, Modal, Button, Card hiển thị chuyến đi, 
Badge trạng thái, Select/Dropdown, DatePicker...).
Nếu có, phải tái sử dụng và áp dụng đúng pattern hiện có của dự án.
Không tự nghĩ ra cấu trúc thư mục mới ngoài cấu trúc chuẩn của Next.js:
    src/app/          → Pages, Routes, Layouts
    src/components/   → Components (shared/ui và theo module)
    src/services/     → API Client calls (Axios/Fetch wrapper)
    src/hooks/        → Custom React Hooks dùng chung
    src/types/        → TypeScript interfaces/types (khớp 100% với DTO Backend)
    src/utils/        → Hàm helper (format ngày, format tiền, validate format)

3.2 Quy tắc bám sát Clean Architecture ở Frontend
- Component UI (app/ hoặc components/): Chỉ chịu trách nhiệm hiển thị giao diện 
  và gọi Custom Hooks/Services. KHÔNG viết trực tiếp hàm `fetch()` hay `axios.get()` 
  rời rạc ngay bên trong Component JSX.
- Service Layer (services/): Tập trung toàn bộ logic gọi API Backend. Dùng chung 1 
  instance `apiClient` có cấu hình Interceptor tự động gắn `Authorization: Bearer <token>` 
  và xử lý gia hạn Refresh Token tự động.
- Type Layer (types/): Định nghĩa toàn bộ kiểu dữ liệu TypeScript khớp với DTO 
  Backend. KHÔNG dùng kiểu `any`.

3.3 Quy tắc không tự ý refactor
Tuyệt đối không tự ý thay đổi những thành phần đang chạy nếu không được yêu cầu:
- Không đổi tên Component/Hook/Service đã có
- Không đổi tên đường dẫn Route (`app/`)
- Không đổi API endpoint contract đã kết nối với Backend
- Không đổi cấu trúc file trong `src/`

3.4 Quy tắc DRY — KHÔNG LẶP CODE, TÁCH TÁI SỬ DỤNG
Nếu 1 đoạn UI hoặc logic xuất hiện GIỐNG NHAU hoặc GẦN GIỐNG ở từ 2 nơi trở lên, 
BẮT BUỘC phải tách ra dùng chung ngay:
- UI lặp lại (Button, Input, Modal, Card chuyến đi, Badge trạng thái...) → Tách 
  thành Component dùng chung trong `components/ui` hoặc `components/shared`.
- Dùng chung 1 Component `Select/Dropdown` và 1 Component `DatePicker` thống nhất 
  cho toàn bộ ứng dụng — KHÔNG tự tạo thẻ native `<select>` hoặc `<input type="date">` 
  rời rạc ở các trang khác nhau.
- Logic gọi API lặp lại → Viết hàm service trong `services/` (ví dụ: `authApi.ts`, 
  `tripApi.ts`).
- Logic State/Effect lặp lại (xử lý call API + loading + error state) → Tách thành 
  Custom Hook dùng chung (ví dụ: `useAuth`, `useTrips`, `usePagination`).
- Logic xử lý dữ liệu lặp lại (format tiền VND, format ngày tháng, tính thời gian) → 
  Viết hàm helper dùng chung trong `utils/formatters.ts`.

4. KHI VIẾT CODE

✅ Phải làm:
- Sinh TypeScript type ở Frontend khớp 100% tên trường với DTO Backend (dạng camelCase 
  khớp với JSON Backend).
- Đảm bảo thiết kế UI đẹp mắt, hiện đại (Modern Aesthetics), sử dụng phông chữ Inter/Roboto, 
  màu sắc hài hòa, chuyển động mượt mà (smooth transitions, glassmorphic styles).
- Chỉ validate UX cơ bản ở Frontend (bắt buộc nhập, định dạng Email/SĐT). KHÔNG lặp lại 
  các quy tắc nghiệp vụ phức tạp của Backend.
- Sử dụng Enum TypeScript có giá trị số nguyên (int) khớp với Enum Backend:
    Backend: TripStatus { Pending = 0, Open = 1, Full = 2 }
    Frontend: enum TripStatus { Pending = 0, Open = 1, Full = 2 }
    BẮT BUỘC dùng tên enum (`TripStatus.Open`), KHÔNG rải số trực tiếp (`status === 1`).
- Đảm bảo hỗ trợ hiển thị responsive tốt trên cả Mobile và Desktop.

❌ Không được làm:
- Cấm dùng kiểu dữ liệu `any` trong TypeScript.
- Cấm tự tạo thẻ `<select>` hoặc `<input type="date">` rời rạc ở từng trang (phải dùng 
  Component chung).
- Cấm viết hàm `fetch()` hoặc `axios` trực tiếp trong file JSX Component.
- Cấm dùng `setTimeout` hoặc workaround tạm bợ để xử lý bất đồng bộ.
- Cấm hardcode chuỗi hiển thị tiếng Việt trực tiếp nếu dự án có cấu hình i18n/localization.

5. BÁO CÁO SAU KHI HOÀN THÀNH
Khi hoàn thành task, phải báo cáo rõ ràng:
File sửa/tạo: [Đường dẫn file]
Lý do: [Mục đích của thay đổi này]
Ảnh hưởng: [Thay đổi này ảnh hưởng đến những trang/component nào]
Rủi ro: [Lưu ý khi chạy/test giao diện]

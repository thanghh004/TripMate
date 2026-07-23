---
trigger: always_on
---

SYSTEM PROMPT & PROJECT RULES (DICUNG-TRIPMATE)

Quy tắc này là hướng dẫn phát triển phần mềm bắt buộc áp dụng cho mọi AI Coding 
Assistant khi làm việc trong dự án "Đi Cùng" (TripMate).
Backend: ASP.NET Core theo Clean Architecture (Domain / Application / Infrastructure / API).
Frontend: Next.js (React + TypeScript).

1. XƯNG HÔ
Luôn xưng tôi, gọi bạn.
Không dùng mày/tao hoặc bất kỳ cách xưng hô thiếu tôn trọng nào.

2. TRƯỚC KHI LÀM — BẮT BUỘC NHẮC LẠI YÊU CẦU
Mỗi khi nhận task, phải trả lời theo đúng mẫu sau trước khi làm bất cứ điều gì:

Tôi hiểu yêu cầu như sau:
- [Liệt kê từng điểm cụ thể, không bỏ sót]

Tôi sẽ thực hiện:
- [Liệt kê từng file sẽ sửa/tạo và thay đổi cụ thể ở mỗi file, theo đúng layer 
  Clean Architecture bên dưới]

Bạn xác nhận không?

Chỉ bắt đầu làm sau khi bạn xác nhận.
Nếu yêu cầu chưa rõ: Hỏi thêm ngay, không được tự suy diễn rồi làm.

3. TRƯỚC KHI CODE — KHẢO SÁT DỰ ÁN

3.1 Quy tắc đọc code trước khi sửa
Trước khi tạo mới bất kỳ chức năng nào, bắt buộc phải tìm xem dự án đã có chức 
năng tương tự chưa (cùng loại: CRUD, approve/reject, filter/search, upload ảnh, 
notification...).
Nếu có, phải tái sử dụng và áp dụng đúng pattern hiện có của dự án.
Không tự nghĩ ra kiến trúc mới, không tự tạo layer mới ngoài 4 layer chuẩn 
(Domain, Application, Infrastructure, API).

3.2 Quy tắc bám sát Clean Architecture — KHÔNG ĐƯỢC ĐI LỆCH
Luôn tuân thủ hướng phụ thuộc một chiều (dependency rule):

    API  →  Application  →  Domain
    Infrastructure  →  Application  →  Domain

- Domain layer: chỉ chứa Entity, Value Object, Enum, Domain Exception, 
  Domain Interface (ví dụ ITripRepository). KHÔNG được reference bất kỳ layer 
  nào khác, KHÔNG được biết đến EF Core, HTTP, DTO.
- Application layer: chứa Use Case/Service (ví dụ TripService, TripRequestService), 
  DTO, Interface cho Infrastructure (ví dụ INotificationSender), Validation, 
  Mapping (AutoMapper/Mapster). KHÔNG được reference Infrastructure hay API.
- Infrastructure layer: implement các Interface định nghĩa ở Application/Domain 
  (Repository, DbContext, gửi Notification, Upload ảnh, gọi service ngoài...). 
  KHÔNG chứa business logic.
- API layer: chỉ chứa Controller, Middleware, DI Registration, mapping route. 
  Controller KHÔNG được viết business logic trực tiếp — chỉ gọi Application 
  Service.

Nếu yêu cầu buộc phải vi phạm nguyên tắc trên (ví dụ Domain cần biết DTO), 
PHẢI DỪNG LẠI và hỏi lại, không tự ý phá vỡ layer.

3.3 Quy tắc không tự ý refactor
Tuyệt đối không tự ý thay đổi những thành phần đang chạy nếu không được yêu cầu:
- Không đổi tên class/interface
- Không đổi namespace
- Không đổi route API
- Không đổi constructor / Dependency Injection
- Không đổi Repository interface đã có
- Không đổi DTO đã dùng ở nơi khác
- Không đổi cấu trúc thư mục của layer

3.4 Quy tắc giữ coding style
Đọc kỹ các file xung quanh (cùng layer, cùng loại chức năng) để viết code theo 
đúng: cách đặt tên (PascalCase/camelCase), cách tổ chức region, cách viết 
Result/Response pattern, cách xử lý exception hiện có của dự án.
Không tự ý đổi style viết code hiện tại.

3.5 Quy tắc DRY — Không lặp code, cái gì dùng nhiều lần phải tách để tái sử dụng

Trước khi viết bất kỳ đoạn logic/UI nào, PHẢI kiểm tra xem đoạn tương tự đã 
tồn tại ở đâu trong dự án chưa. Nếu có từ 2 nơi trở lên dùng chung 1 logic 
hoặc 1 đoạn UI giống nhau (kể cả gần giống, chỉ khác tham số), BẮT BUỘC phải 
tách riêng để tái sử dụng, không được copy-paste hoặc viết lại.

Áp dụng cho từng layer như sau:

- Domain: Logic nghiệp vụ dùng chung giữa nhiều Entity (ví dụ: tính toán 
  ngày, kiểm tra điều kiện trạng thái...) → viết thành method dùng chung 
  trong Entity/Base class hoặc Domain Service, không lặp lại trong từng 
  Entity.

- Application: 
  - Logic xử lý lặp lại giữa nhiều Use Case (ví dụ: kiểm tra quyền 
    organizer, tính current_members, gửi notification theo mẫu...) → 
    tách thành method dùng chung trong Base Service, Helper class, hoặc 
    Domain Service riêng — KHÔNG copy logic giữa TripService, 
    TripRequestService, ReviewService...
  - Validate rule dùng ở nhiều DTO (ví dụ: validate ngày bắt đầu phải 
    trước ngày kết thúc, validate SĐT...) → viết thành Custom Validator 
    dùng chung (FluentValidation extension), không viết lại rule ở mỗi 
    Validator.
  - Mapping logic dùng nhiều nơi → viết Mapping Profile dùng chung 
    (AutoMapper/Mapster), không tự map tay lặp lại ở nhiều Service.

- Infrastructure: Đoạn code truy vấn dùng chung (ví dụ: filter theo 
  trạng thái active, phân trang, sắp xếp...) → viết Extension Method hoặc 
  Specification dùng chung cho Repository, không viết LINQ lặp lại ở 
  nhiều Repository.

- API: Middleware/Filter xử lý chung (exception handling, response 
  wrapper, permission check...) → viết 1 lần dùng chung cho toàn bộ 
  Controller, không lặp lại try-catch hoặc check quyền thủ công ở từng 
  action.

- Frontend:
  - UI lặp lại từ 2 nơi trở lên (card hiển thị chuyến đi, badge trạng 
    thái, avatar + rating, form input có validate...) → tách thành 
    Component dùng chung trong thư mục components/shared hoặc 
    components/ui, không copy JSX giữa các page.
  - Logic gọi API lặp lại → viết chung 1 API client/service layer 
    (ví dụ tripApi.ts, dùng chung instance axios/fetch wrapper), không 
    tự viết fetch() rời rạc ở từng component.
  - Logic xử lý dữ liệu lặp lại (format ngày, format tiền, tính số ngày 
    còn lại đến khởi hành...) → viết thành hàm dùng chung trong 
    utils/helpers, không viết lại trong từng component.
  - State/hook logic lặp lại (ví dụ: gọi API + loading + error 
    handling giống nhau ở nhiều nơi) → viết Custom Hook dùng chung 
    (ví dụ useTripRequests, usePagination), không lặp lại useState/
    useEffect giống hệt nhau.

QUY TẮC NGƯỠNG: Nếu 1 đoạn logic/UI xuất hiện GIỐNG NHAU hoặc GẦN GIỐNG 
(chỉ khác 1-2 tham số) ở từ 2 nơi trở lên, phải tách ra dùng chung ngay — 
không đợi đến lần thứ 3 mới tách.

Nếu việc tách dùng chung ảnh hưởng đến code đang chạy ở nơi khác (ví dụ 
phải sửa lại chỗ cũ để dùng hàm chung mới), PHẢI báo trước và hỏi xác nhận 
theo đúng mục 2, không tự ý sửa lan sang các file ngoài phạm vi yêu cầu ban 
đầu.

4. KHI VIẾT CODE

✅ Phải làm:
- Sửa đúng file được chỉ định, đúng phần được yêu cầu.
- Khi thêm tính năng mới (ví dụ: thêm chức năng cho module Trip, TripRequest, 
  Review...), phải tạo đủ file theo đúng layer, không bỏ sót:
    Domain      → Entity / Enum (nếu có thay đổi)
    Application → DTO (Request/Response), Interface Service, Service 
                  implementation, Validator (FluentValidation)
    Infrastructure → Repository implementation, EF Configuration (nếu có 
                  Entity mới), gửi Notification/Upload file nếu liên quan
    API         → Controller, route, [Authorize]/Permission check
    Frontend    → API client function (service call), React Query 
                  hook, component/page, type định nghĩa (TypeScript interface)
- Sinh TypeScript type ở Frontend khớp với DTO backend (thủ công hoặc qua 
  OpenAPI/Swagger generate) — không tự đặt field khác tên với DTO backend.
- Dùng chung 1 component Select/Dropdown, 1 component DatePicker đã có sẵn 
  trong dự án cho mọi màn hình — không tự tạo native <select>/<input type="date"> 
  rời rạc.
- Với danh sách dùng chung (dropdown điểm đến, category, enum status...), 
  tập hợp qua 1 Application Service chung (ví dụ SharedDataService/LookupService) 
  thay vì mỗi màn tự viết API riêng lẻ.
- Giải thích ngắn gọn lý do của mỗi thay đổi không hiển nhiên.
- Nếu sửa nhiều file, sửa theo thứ tự phụ thuộc: 
  Domain → Application → Infrastructure → API → Frontend.
- Validate nghiệp vụ CHỈ ở backend (Application layer, dùng FluentValidation 
  hoặc domain validation) — Frontend chỉ validate UX cơ bản (required, format), 
  không lặp lại business rule.
- Khi dùng Enum:
    Backend: định nghĩa Enum trong Domain layer theo module (TripStatus, 
    TripRequestStatus...). Text hiển thị qua resource/localization, không 
    hardcode chuỗi.
    Frontend: khai báo object hằng số/enum TypeScript khớp giá trị int với 
    backend (ví dụ: enum TripStatus { Pending = 0, Open = 1, Full = 2 }).
    Không rải số nguyên trực tiếp trong code (=== 1, === 2...) ở cả 2 phía — 
    bắt buộc dùng tên hằng/enum.

❌ Không được làm:
- Cấm tự tạo file ngoài lề (.ps1, .py, .sh, file tạm, file debug...) khi 
  không được yêu cầu.
- Cấm tự thêm feature không có trong yêu cầu.
- Cấm làm tắt: bỏ bước, đoán mò nghiệp vụ.
- Cấm dùng setTimeout hoặc workaround tạm bợ (cả BE lẫn FE) mà không giải 
  thích và hỏi trước.
- Cấm viết SQL trực tiếp (raw SQL) trong code. Luôn dùng EF Core LINQ qua 
  Repository (Domain interface, Infrastructure implementation).
- Cấm tự tạo migration: khi thay đổi Entity DB, không tự ý chạy Add-Migration. 
  Hãy cung cấp câu lệnh dạng: Add-Migration Add_MaxAge_To_Trips để tôi tự 
  chạy trong Package Manager Console / dotnet ef.
- Cấm hardcode chuỗi tiếng Việt trực tiếp vào code (C#, TS, TSX). Nếu thiếu 
  key localization/i18n, phải báo cần thêm và liệt kê key cần bổ sung, không 
  tự hardcode text.
- Cấm để Domain layer reference Infrastructure, DbContext, hoặc bất kỳ 
  package hạ tầng nào (EF Core, HttpContext...).
- Cấm để Controller (API layer) chứa business logic trực tiếp — logic phải 
  nằm ở Application Service.

5. KHI GẶP VẤN ĐỀ KỸ THUẬT & THIẾU THÔNG TIN
Nếu gặp lỗi tool, encoding, quyền truy cập... → báo ngay cho bạn, mô tả vấn 
đề, hỏi hướng xử lý.
Nếu không chắc logic nghiệp vụ hoặc thiếu thông tin: Phải dừng lại hỏi bạn, 
không được đoán.
Không tự ý tạo workaround mà không thông báo.

6. QUY TẮC TRẢ LỜI SAU KHI LÀM
Khi hoàn thành và cập nhật code, phải báo cáo rõ ràng theo cấu trúc:

File sửa: [Đường dẫn file, ghi rõ layer: Domain/Application/Infrastructure/API/Frontend]
Lý do sửa: [Tại sao sửa phần này]
Ảnh hưởng: [Thay đổi này ảnh hưởng đến những đâu — layer khác, API contract, 
frontend type...]
Rủi ro: [Có rủi ro gì cần lưu ý khi chạy không]

7. CHECKLIST TRƯỚC KHI GỬI KẾT QUẢ
Trước khi kết thúc task, tự kiểm tra:
[ ] Đã nhắc lại và bạn đã xác nhận yêu cầu chưa?
[ ] Đã tìm chức năng tương tự và code đúng cấu trúc dự án chưa?
[ ] Có tuân thủ đúng hướng phụ thuộc Clean Architecture (Domain không phụ 
    thuộc layer khác) chưa?
[ ] Có đoạn logic/UI nào lặp lại từ 2 nơi trở lên mà chưa được tách dùng 
    chung không?
[ ] Có tạo file nào ngoài lề không? (Nếu có → xóa đi)
[ ] Có sửa file nào ngoài phạm vi không?
[ ] Validate nghiệp vụ chỉ ở backend, không lặp ở frontend?
[ ] Select/Dropdown có dùng đúng component chung của dự án chưa?
[ ] Các trường ngày tháng có dùng đúng component DatePicker chung chưa?
[ ] Có dùng setTimeout hoặc workaround không giải thích không?
[ ] Có chuỗi tiếng Việt hardcode trong code không? (Nếu có → chuyển vào 
    localization/i18n file)
[ ] Đã cung cấp câu lệnh Migration thay vì tự tạo chưa?
[ ] TypeScript type ở Frontend có khớp với DTO backend không?
[ ] Đã báo cáo đầy đủ mục: File sửa, Lý do, Ảnh hưởng, Rủi ro chưa?
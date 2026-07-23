namespace TripMate.Domain.Enums;

/// <summary>
/// Trạng thái duyệt quyền tổ chức/tạo chuyến đi của người dùng
/// </summary>
public enum HostVerificationStatus
{
    /// <summary>
    /// Chưa xác thực / chưa gửi yêu cầu duyệt
    /// </summary>
    Unverified = 0,

    /// <summary>
    /// Đã cập nhật đủ thông tin & CCCD, đang chờ Admin duyệt
    /// </summary>
    Pending = 1,

    /// <summary>
    /// Đã được Admin phê duyệt -> Được phép tạo chuyến
    /// </summary>
    Approved = 2,

    /// <summary>
    /// Yêu cầu bị Admin từ chối (do thông tin/ảnh CCCD không hợp lệ)
    /// </summary>
    Rejected = 3,

    /// <summary>
    /// Bị Admin khóa vĩnh viễn quyền tạo chuyến đi -> Không thể gửi lại yêu cầu
    /// </summary>
    Blocked = 4
}

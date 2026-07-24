using TripMate.Domain.Entities;
using TripMate.Domain.Enums;

namespace TripMate.Application.Helpers;

/// <summary>
/// Helper hỗ trợ kiểm tra và tự động cập nhật trạng thái của chuyến đi dựa theo thời gian và số lượng thành viên
/// </summary>
public static class TripStatusAutoUpdater
{
    /// <summary>
    /// Kiểm tra và cập nhật trạng thái chuyến đi nếu đã đến mốc thời gian khởi hành/kết thúc
    /// </summary>
    /// <returns>Trả về true nếu trạng thái chuyến đi có sự thay đổi</returns>
    public static bool UpdateStatusIfNeeded(Trip trip)
    {
        var now = DateTime.UtcNow;
        bool isUpdated = false;

        // 1. Nếu chuyến đi ở trạng thái Open hoặc Full mà đã đến/qua ngày khởi hành (StartDate <= now)
        if (trip.Status == TripStatus.Open || trip.Status == TripStatus.Full)
        {
            if (trip.StartDate <= now)
            {
                // Nếu không có thành viên nào tham gia ngoài Organizer (CurrentMembers <= 1) -> Chuyến đi Thất bại (Failed)
                if (trip.CurrentMembers <= 1)
                {
                    trip.Status = TripStatus.Failed;
                    trip.ModerationNote = "Chuyến đi tự động hủy do không có thành viên tham gia khi đến ngày khởi hành.";
                    trip.UpdatedAt = now;
                    isUpdated = true;
                }
                else
                {
                    // Đã có thành viên tham gia -> Chuyến đi bắt đầu diễn ra (Ongoing)
                    trip.Status = TripStatus.Ongoing;
                    trip.UpdatedAt = now;
                    isUpdated = true;
                }
            }
        }

        // 2. Nếu chuyến đi đang diễn ra (Ongoing) mà đã qua ngày kết thúc (EndDate <= now) -> Hoàn thành (Completed)
        if (trip.Status == TripStatus.Ongoing && trip.EndDate <= now)
        {
            trip.Status = TripStatus.Completed;
            trip.UpdatedAt = now;
            isUpdated = true;
        }

        return isUpdated;
    }
}

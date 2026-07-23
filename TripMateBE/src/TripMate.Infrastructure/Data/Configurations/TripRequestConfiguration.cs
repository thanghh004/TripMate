using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TripMate.Domain.Entities;

namespace TripMate.Infrastructure.Data.Configurations;

/// <summary>
/// Cấu hình bảng TripRequests (Yêu cầu tham gia chuyến đi) bằng Fluent API
/// </summary>
public class TripRequestConfiguration : BaseEntityConfiguration<TripRequest>
{
    public override void Configure(EntityTypeBuilder<TripRequest> builder)
    {
        // 1. Lấy cấu hình chung (id, is_deleted, created_at, updated_at) từ lớp cơ sở
        base.Configure(builder);

        // 2. Ánh xạ tên bảng
        builder.ToTable("trip_requests");

        // 3. Cấu hình các thuộc tính
        builder.Property(tr => tr.TripId)
            .HasColumnName("trip_id")
            .IsRequired();

        builder.Property(tr => tr.UserId)
            .HasColumnName("user_id")
            .IsRequired();

        builder.Property(tr => tr.Message)
            .HasColumnName("message");

        // Lưu Enum dưới dạng int
        builder.Property(tr => tr.Status)
            .HasColumnName("status")
            .HasDefaultValue(Domain.Enums.TripRequestStatus.Pending);

        builder.Property(tr => tr.RespondedAt)
            .HasColumnName("responded_at");

        // 4. Các chỉ mục (Indexes)
        // Một người dùng chỉ có duy nhất 1 yêu cầu tham gia còn hoạt động cho 1 chuyến đi
        builder.HasIndex(tr => new { tr.TripId, tr.UserId })
            .IsUnique()
            .HasFilter("[is_deleted] = 0");

        // 5. Cấu hình mối quan hệ (Relationships)
        builder.HasOne(tr => tr.Trip)
            .WithMany(t => t.TripRequests)
            .HasForeignKey(tr => tr.TripId)
            .OnDelete(DeleteBehavior.Cascade); // Nếu chuyến đi bị xóa vật lý, các yêu cầu cũng bị xóa theo

        builder.HasOne(tr => tr.User)
            .WithMany(u => u.TripRequests)
            .HasForeignKey(tr => tr.UserId)
            .OnDelete(DeleteBehavior.Restrict); // Tránh lỗi Multiple Cascade Paths trong SQL Server
    }
}

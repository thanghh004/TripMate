using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TripMate.Domain.Entities;

namespace TripMate.Infrastructure.Data.Configurations;

/// <summary>
/// Cấu hình bảng Notifications (Thông báo) bằng Fluent API
/// </summary>
public class NotificationConfiguration : BaseEntityConfiguration<Notification>
{
    public override void Configure(EntityTypeBuilder<Notification> builder)
    {
        // 1. Lấy cấu hình chung (id, is_deleted, created_at, updated_at) từ lớp cơ sở
        base.Configure(builder);

        // 2. Ánh xạ tên bảng
        builder.ToTable("notifications");

        // 3. Cấu hình các thuộc tính
        builder.Property(n => n.UserId)
            .HasColumnName("user_id")
            .IsRequired();

        builder.Property(n => n.Type)
            .HasColumnName("type")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(n => n.Title)
            .HasColumnName("title")
            .HasMaxLength(200);

        builder.Property(n => n.Content)
            .HasColumnName("content");

        builder.Property(n => n.RelatedTripId)
            .HasColumnName("related_trip_id");

        builder.Property(n => n.IsRead)
            .HasColumnName("is_read")
            .HasDefaultValue(false);

        // 4. Cấu hình mối quan hệ (Relationships)
        builder.HasOne(n => n.User)
            .WithMany(u => u.Notifications)
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade); // Nếu người dùng bị xóa vật lý, thông báo cũng xóa theo

        builder.HasOne(n => n.RelatedTrip)
            .WithMany() // Trip không có Navigation Property ngược lại tới Notification để giữ đơn giản
            .HasForeignKey(n => n.RelatedTripId)
            .OnDelete(DeleteBehavior.Restrict); // Tránh xung đột khóa ngoại
    }
}

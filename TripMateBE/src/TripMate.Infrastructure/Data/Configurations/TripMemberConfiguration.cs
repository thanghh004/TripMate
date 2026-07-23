using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TripMate.Domain.Entities;

namespace TripMate.Infrastructure.Data.Configurations;

/// <summary>
/// Cấu hình bảng TripMembers (Thành viên chuyến đi) bằng Fluent API
/// </summary>
public class TripMemberConfiguration : BaseEntityConfiguration<TripMember>
{
    public override void Configure(EntityTypeBuilder<TripMember> builder)
    {
        // 1. Lấy cấu hình chung (id, is_deleted, created_at, updated_at) từ lớp cơ sở
        base.Configure(builder);

        // 2. Ánh xạ tên bảng
        builder.ToTable("trip_members");

        // 3. Cấu hình các thuộc tính
        builder.Property(tm => tm.TripId)
            .HasColumnName("trip_id")
            .IsRequired();

        builder.Property(tm => tm.UserId)
            .HasColumnName("user_id")
            .IsRequired();

        // Lưu Enum dưới dạng int
        builder.Property(tm => tm.Role)
            .HasColumnName("role")
            .HasDefaultValue(Domain.Enums.TripMemberRole.Member);

        builder.Property(tm => tm.JoinedAt)
            .HasColumnName("joined_at")
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(tm => tm.LeftAt)
            .HasColumnName("left_at");

        // 4. Các chỉ mục (Indexes)
        // Một người dùng chỉ tham gia 1 chuyến đi ở 1 thời điểm dưới dạng thành viên hoạt động
        builder.HasIndex(tm => new { tm.TripId, tm.UserId })
            .IsUnique()
            .HasFilter("[is_deleted] = 0");

        // 5. Cấu hình mối quan hệ (Relationships)
        builder.HasOne(tm => tm.Trip)
            .WithMany(t => t.Members)
            .HasForeignKey(tm => tm.TripId)
            .OnDelete(DeleteBehavior.Cascade); // Khi xóa chuyến đi vật lý, các thành viên liên kết cũng bị xóa theo

        builder.HasOne(tm => tm.User)
            .WithMany(u => u.JoinedTrips)
            .HasForeignKey(tm => tm.UserId)
            .OnDelete(DeleteBehavior.Restrict); // Tránh lỗi Multiple Cascade Paths trong SQL Server
    }
}

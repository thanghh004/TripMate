using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TripMate.Domain.Entities;

namespace TripMate.Infrastructure.Data.Configurations;

/// <summary>
/// Cấu hình bảng Reports (Báo cáo vi phạm) bằng Fluent API
/// </summary>
public class ReportConfiguration : BaseEntityConfiguration<Report>
{
    public override void Configure(EntityTypeBuilder<Report> builder)
    {
        // 1. Lấy cấu hình chung (id, is_deleted, created_at, updated_at) từ lớp cơ sở
        base.Configure(builder);

        // 2. Ánh xạ tên bảng
        builder.ToTable("reports");

        // 3. Cấu hình các thuộc tính
        builder.Property(r => r.ReporterId)
            .HasColumnName("reporter_id")
            .IsRequired();

        builder.Property(r => r.ReportedUserId)
            .HasColumnName("reported_user_id");

        builder.Property(r => r.ReportedTripId)
            .HasColumnName("reported_trip_id");

        builder.Property(r => r.Reason)
            .HasColumnName("reason")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(r => r.Description)
            .HasColumnName("description");

        // Lưu Enum dưới dạng int
        builder.Property(r => r.Status)
            .HasColumnName("status")
            .HasDefaultValue(Domain.Enums.ReportStatus.Pending);

        builder.Property(r => r.AdminNote)
            .HasColumnName("admin_note");

        builder.Property(r => r.ResolvedAt)
            .HasColumnName("resolved_at");

        // 4. Cấu hình mối quan hệ (Relationships)
        builder.HasOne(r => r.Reporter)
            .WithMany(u => u.SentReports)
            .HasForeignKey(r => r.ReporterId)
            .OnDelete(DeleteBehavior.Restrict); // Tránh xung đột khóa ngoại

        builder.HasOne(r => r.ReportedUser)
            .WithMany(u => u.ReceivedReports)
            .HasForeignKey(r => r.ReportedUserId)
            .OnDelete(DeleteBehavior.Restrict); // Tránh xung đột khóa ngoại

        builder.HasOne(r => r.ReportedTrip)
            .WithMany(t => t.Reports)
            .HasForeignKey(r => r.ReportedTripId)
            .OnDelete(DeleteBehavior.Restrict); // Tránh xung đột khóa ngoại
    }
}

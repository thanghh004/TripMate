using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TripMate.Domain.Entities;

namespace TripMate.Infrastructure.Data.Configurations;

/// <summary>
/// Cấu hình bảng Trips (Chuyến đi) bằng Fluent API
/// </summary>
public class TripConfiguration : BaseEntityConfiguration<Trip>
{
    public override void Configure(EntityTypeBuilder<Trip> builder)
    {
        // 1. Lấy lại các cấu hình chung (id, is_deleted, created_at, updated_at) từ lớp cơ sở
        base.Configure(builder);

        // 2. Ánh xạ tên bảng
        builder.ToTable("trips");

        // 3. Cấu hình các thuộc tính riêng biệt
        builder.Property(t => t.OrganizerId)
            .HasColumnName("organizer_id")
            .IsRequired();

        builder.Property(t => t.CategoryId)
            .HasColumnName("category_id")
            .IsRequired();

        builder.Property(t => t.Title)
            .HasColumnName("title")
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(t => t.Description)
            .HasColumnName("description");

        builder.Property(t => t.StartLocation)
            .HasColumnName("start_location")
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(t => t.Destination)
            .HasColumnName("destination")
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(t => t.CoverImageUrl)
            .HasColumnName("cover_image_url");

        builder.Property(t => t.StartDate)
            .HasColumnName("start_date")
            .HasColumnType("date")
            .IsRequired();

        builder.Property(t => t.EndDate)
            .HasColumnName("end_date")
            .HasColumnType("date")
            .IsRequired();

        builder.Property(t => t.RegistrationDeadline)
            .HasColumnName("registration_deadline")
            .HasColumnType("date");

        builder.Property(t => t.MaxMembers)
            .HasColumnName("max_members")
            .IsRequired();

        builder.Property(t => t.CurrentMembers)
            .HasColumnName("current_members")
            .HasDefaultValue(1);

        builder.Property(t => t.EstimatedCost)
            .HasColumnName("estimated_cost")
            .HasColumnType("decimal(18,2)");

        builder.Property(t => t.CostNote)
            .HasColumnName("cost_note");

        builder.Property(t => t.Requirements)
            .HasColumnName("requirements");

        builder.Property(t => t.MinAge)
            .HasColumnName("min_age");

        builder.Property(t => t.MaxAge)
            .HasColumnName("max_age");

        builder.Property(t => t.PreferredGender)
            .HasColumnName("preferred_gender")
            .HasMaxLength(10);

        // Lưu Enum dưới dạng int
        builder.Property(t => t.Status)
            .HasColumnName("status")
            .HasDefaultValue(Domain.Enums.TripStatus.PendingReview);

        builder.Property(t => t.ModerationNote)
            .HasColumnName("moderation_note");

        // 4. Cấu hình mối quan hệ (Relationships)
        builder.HasOne(t => t.Organizer)
            .WithMany(u => u.OrganizedTrips)
            .HasForeignKey(t => t.OrganizerId)
            .OnDelete(DeleteBehavior.Restrict); // Không cho phép xóa dây chuyền ở DB

        builder.HasOne(t => t.Category)
            .WithMany(c => c.Trips)
            .HasForeignKey(t => t.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

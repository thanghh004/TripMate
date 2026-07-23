using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TripMate.Domain.Entities;

namespace TripMate.Infrastructure.Data.Configurations;

/// <summary>
/// Cấu hình bảng Reviews (Đánh giá thành viên) bằng Fluent API
/// </summary>
public class ReviewConfiguration : BaseEntityConfiguration<Review>
{
    public override void Configure(EntityTypeBuilder<Review> builder)
    {
        // 1. Lấy cấu hình chung (id, is_deleted, created_at, updated_at) từ lớp cơ sở
        base.Configure(builder);

        // 2. Ánh xạ tên bảng
        builder.ToTable("reviews");

        // 3. Cấu hình các thuộc tính
        builder.Property(r => r.TripId)
            .HasColumnName("trip_id")
            .IsRequired();

        builder.Property(r => r.ReviewerId)
            .HasColumnName("reviewer_id")
            .IsRequired();

        builder.Property(r => r.RevieweeId)
            .HasColumnName("reviewee_id")
            .IsRequired();

        builder.Property(r => r.Rating)
            .HasColumnName("rating")
            .IsRequired();

        builder.Property(r => r.Comment)
            .HasColumnName("comment");

        // 4. Các chỉ mục và ràng buộc (Indexes & Constraints)
        // Ràng buộc một người chỉ được đánh giá người khác 1 lần trong mỗi chuyến đi
        builder.HasIndex(r => new { r.TripId, r.ReviewerId, r.RevieweeId })
            .IsUnique()
            .HasFilter("[is_deleted] = 0");

        // Ràng buộc số sao từ 1 đến 5 bằng SQL Check Constraint
        builder.ToTable(t => t.HasCheckConstraint("CK_Review_Rating", "[rating] >= 1 AND [rating] <= 5"));

        // 5. Cấu hình mối quan hệ (Relationships)
        builder.HasOne(r => r.Trip)
            .WithMany(t => t.Reviews)
            .HasForeignKey(r => r.TripId)
            .OnDelete(DeleteBehavior.Restrict); // Tránh xung đột khóa ngoại

        builder.HasOne(r => r.Reviewer)
            .WithMany(u => u.GivenReviews)
            .HasForeignKey(r => r.ReviewerId)
            .OnDelete(DeleteBehavior.Restrict); // Người đánh giá

        builder.HasOne(r => r.Reviewee)
            .WithMany(u => u.ReceivedReviews)
            .HasForeignKey(r => r.RevieweeId)
            .OnDelete(DeleteBehavior.Restrict); // Người được nhận đánh giá
    }
}

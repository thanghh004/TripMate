using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TripMate.Domain.Entities;

namespace TripMate.Infrastructure.Data.Configurations;

/// <summary>
/// Cấu hình bảng Posts (Bài viết chia sẻ) bằng Fluent API
/// </summary>
public class PostConfiguration : BaseEntityConfiguration<Post>
{
    public override void Configure(EntityTypeBuilder<Post> builder)
    {
        // 1. Lấy cấu hình chung (id, is_deleted, created_at, updated_at) từ lớp cơ sở
        base.Configure(builder);

        // 2. Ánh xạ tên bảng
        builder.ToTable("posts");

        // 3. Cấu hình các thuộc tính
        builder.Property(p => p.UserId)
            .HasColumnName("user_id")
            .IsRequired();

        builder.Property(p => p.TripId)
            .HasColumnName("trip_id");

        builder.Property(p => p.Title)
            .HasColumnName("title")
            .HasMaxLength(250)
            .IsRequired();

        builder.Property(p => p.Content)
            .HasColumnName("content")
            .IsRequired();

        builder.Property(p => p.CoverImageUrl)
            .HasColumnName("cover_image_url");

        builder.Property(p => p.LikesCount)
            .HasColumnName("likes_count")
            .HasDefaultValue(0);

        builder.Property(p => p.CommentsCount)
            .HasColumnName("comments_count")
            .HasDefaultValue(0);

        // 4. Cấu hình mối quan hệ (Relationships)
        builder.HasOne(p => p.User)
            .WithMany(u => u.Posts)
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Restrict); // Tránh xung đột khóa ngoại

        builder.HasOne(p => p.Trip)
            .WithMany(t => t.Posts)
            .HasForeignKey(p => p.TripId)
            .OnDelete(DeleteBehavior.Restrict); // Tránh xung đột khóa ngoại
    }
}

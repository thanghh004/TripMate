using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TripMate.Domain.Entities;

namespace TripMate.Infrastructure.Data.Configurations;

/// <summary>
/// Cấu hình bảng PostLikes (Lượt thích bài viết) bằng Fluent API
/// </summary>
public class PostLikeConfiguration : BaseEntityConfiguration<PostLike>
{
    public override void Configure(EntityTypeBuilder<PostLike> builder)
    {
        // 1. Lấy cấu hình chung (id, is_deleted, created_at, updated_at) từ lớp cơ sở
        base.Configure(builder);

        // 2. Ánh xạ tên bảng
        builder.ToTable("post_likes");

        // 3. Cấu hình các thuộc tính
        builder.Property(pl => pl.PostId)
            .HasColumnName("post_id")
            .IsRequired();

        builder.Property(pl => pl.UserId)
            .HasColumnName("user_id")
            .IsRequired();

        // 4. Các chỉ mục (Indexes)
        // Một người dùng chỉ được thích một bài viết một lần
        builder.HasIndex(pl => new { pl.PostId, pl.UserId })
            .IsUnique()
            .HasFilter("[is_deleted] = 0");

        // 5. Cấu hình mối quan hệ (Relationships)
        builder.HasOne(pl => pl.Post)
            .WithMany(p => p.Likes)
            .HasForeignKey(pl => pl.PostId)
            .OnDelete(DeleteBehavior.Cascade); // Khi bài viết bị xóa vật lý, các lượt thích bài viết đó cũng xóa theo

        builder.HasOne(pl => pl.User)
            .WithMany(u => u.PostLikes)
            .HasForeignKey(pl => pl.UserId)
            .OnDelete(DeleteBehavior.Restrict); // Tránh xung đột khóa ngoại
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TripMate.Domain.Entities;

namespace TripMate.Infrastructure.Data.Configurations;

/// <summary>
/// Cấu hình bảng PostComments (Bình luận bài viết) bằng Fluent API
/// </summary>
public class PostCommentConfiguration : BaseEntityConfiguration<PostComment>
{
    public override void Configure(EntityTypeBuilder<PostComment> builder)
    {
        // 1. Lấy cấu hình chung (id, is_deleted, created_at, updated_at) từ lớp cơ sở
        base.Configure(builder);

        // 2. Ánh xạ tên bảng
        builder.ToTable("post_comments");

        // 3. Cấu hình các thuộc tính
        builder.Property(pc => pc.PostId)
            .HasColumnName("post_id")
            .IsRequired();

        builder.Property(pc => pc.UserId)
            .HasColumnName("user_id")
            .IsRequired();

        builder.Property(pc => pc.CommentText)
            .HasColumnName("comment_text")
            .IsRequired();

        // 4. Cấu hình mối quan hệ (Relationships)
        builder.HasOne(pc => pc.Post)
            .WithMany(p => p.Comments)
            .HasForeignKey(pc => pc.PostId)
            .OnDelete(DeleteBehavior.Cascade); // Khi bài viết bị xóa vật lý, các bình luận cũng tự động xóa theo

        builder.HasOne(pc => pc.User)
            .WithMany(u => u.PostComments)
            .HasForeignKey(pc => pc.UserId)
            .OnDelete(DeleteBehavior.Restrict); // Tránh xung đột khóa ngoại
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TripMate.Domain.Entities;

namespace TripMate.Infrastructure.Data.Configurations;

/// <summary>
/// Cấu hình bảng ChatMessages (Tin nhắn chat) bằng Fluent API
/// </summary>
public class ChatMessageConfiguration : BaseEntityConfiguration<ChatMessage>
{
    public override void Configure(EntityTypeBuilder<ChatMessage> builder)
    {
        // 1. Lấy cấu hình chung (id, is_deleted, created_at, updated_at) từ lớp cơ sở
        base.Configure(builder);

        // 2. Ánh xạ tên bảng
        builder.ToTable("chat_messages");

        // 3. Cấu hình các thuộc tính
        builder.Property(cm => cm.TripId)
            .HasColumnName("trip_id")
            .IsRequired();

        builder.Property(cm => cm.SenderId)
            .HasColumnName("sender_id")
            .IsRequired();

        builder.Property(cm => cm.MessageText)
            .HasColumnName("message_text")
            .IsRequired();

        builder.Property(cm => cm.AttachmentUrl)
            .HasColumnName("attachment_url");

        // Bỏ qua thuộc tính SentAt (vì SentAt chỉ là getter/setter trỏ vào CreatedAt đã được cấu hình ở lớp Base)
        builder.Ignore(cm => cm.SentAt);

        // 4. Cấu hình mối quan hệ (Relationships)
        builder.HasOne(cm => cm.Trip)
            .WithMany(t => t.ChatMessages)
            .HasForeignKey(cm => cm.TripId)
            .OnDelete(DeleteBehavior.Cascade); // Khi xóa chuyến đi vật lý, các tin nhắn trong phòng chat cũng bị xóa theo

        builder.HasOne(cm => cm.Sender)
            .WithMany(u => u.SentChatMessages)
            .HasForeignKey(cm => cm.SenderId)
            .OnDelete(DeleteBehavior.Restrict); // Tránh xung đột khóa ngoại
    }
}

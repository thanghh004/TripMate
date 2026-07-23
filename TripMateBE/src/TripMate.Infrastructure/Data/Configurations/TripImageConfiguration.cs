using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TripMate.Domain.Entities;

namespace TripMate.Infrastructure.Data.Configurations;

/// <summary>
/// Cấu hình bảng TripImages (Ảnh chuyến đi) bằng Fluent API
/// </summary>
public class TripImageConfiguration : BaseEntityConfiguration<TripImage>
{
    public override void Configure(EntityTypeBuilder<TripImage> builder)
    {
        // 1. Lấy cấu hình chung (id, is_deleted, created_at, updated_at) từ lớp cơ sở
        base.Configure(builder);

        // 2. Ánh xạ tên bảng
        builder.ToTable("trip_images");

        // 3. Cấu hình các thuộc tính
        builder.Property(ti => ti.TripId)
            .HasColumnName("trip_id")
            .IsRequired();

        builder.Property(ti => ti.ImageUrl)
            .HasColumnName("image_url")
            .IsRequired();

        builder.Property(ti => ti.SortOrder)
            .HasColumnName("sort_order")
            .HasDefaultValue(0);

        // 4. Cấu hình mối quan hệ (Trip 1 - n TripImages)
        builder.HasOne(ti => ti.Trip)
            .WithMany(t => t.Images)
            .HasForeignKey(ti => ti.TripId)
            .OnDelete(DeleteBehavior.Cascade); // Nếu chuyến đi bị xóa vật lý, ảnh của nó cũng bị xóa vật lý theo
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TripMate.Domain.Entities;

namespace TripMate.Infrastructure.Data.Configurations;

/// <summary>
/// Cấu hình Fluent API cho thực thể TripCategory (Bảng trip_categories)
/// </summary>
public class TripCategoryConfiguration : BaseEntityConfiguration<TripCategory>
{
    public override void Configure(EntityTypeBuilder<TripCategory> builder)
    {
        base.Configure(builder);

        // 1. Tên bảng CSDL
        builder.ToTable("trip_categories");

        // 2. Cấu hình các thuộc tính
        builder.Property(tc => tc.Name)
            .HasColumnName("name")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(tc => tc.Slug)
            .HasColumnName("slug")
            .HasMaxLength(120)
            .IsRequired();

        builder.Property(tc => tc.IconUrl)
            .HasColumnName("icon_url")
            .HasMaxLength(500);

        builder.Property(tc => tc.Description)
            .HasColumnName("description")
            .HasMaxLength(500);

        builder.Property(tc => tc.DisplayOrder)
            .HasColumnName("display_order")
            .HasDefaultValue(0);

        builder.Property(tc => tc.IsActive)
            .HasColumnName("is_active")
            .HasDefaultValue(true);

        // 3. Chỉ mục (Index) Unique cho Slug chống trùng lặp URL
        builder.HasIndex(tc => tc.Slug)
            .IsUnique()
            .HasFilter("[is_deleted] = 0");
    }
}

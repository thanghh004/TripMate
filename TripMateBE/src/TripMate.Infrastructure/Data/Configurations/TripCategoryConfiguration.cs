using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TripMate.Domain.Entities;

namespace TripMate.Infrastructure.Data.Configurations;

/// <summary>
/// Cấu hình bảng TripCategories bằng Fluent API
/// </summary>
public class TripCategoryConfiguration : BaseEntityConfiguration<TripCategory>
{
    public override void Configure(EntityTypeBuilder<TripCategory> builder)
    {
        base.Configure(builder);

        builder.ToTable("trip_categories");

        builder.Property(c => c.Name)
            .HasColumnName("name")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(c => c.Slug)
            .HasColumnName("slug")
            .HasMaxLength(120)
            .IsRequired();

        builder.HasIndex(c => c.Slug)
            .IsUnique();

        builder.Property(c => c.Icon)
            .HasColumnName("icon")
            .HasMaxLength(255);

        builder.Property(c => c.Description)
            .HasColumnName("description")
            .HasMaxLength(500);

        builder.Property(c => c.DisplayOrder)
            .HasColumnName("display_order")
            .HasDefaultValue(0);

        builder.Property(c => c.IsActive)
            .HasColumnName("is_active")
            .HasDefaultValue(true);
    }
}

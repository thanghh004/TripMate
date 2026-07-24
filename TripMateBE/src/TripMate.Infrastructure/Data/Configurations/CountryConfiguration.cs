using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TripMate.Domain.Entities;

namespace TripMate.Infrastructure.Data.Configurations;

/// <summary>
/// Cấu hình bảng Countries (Quốc gia) bằng Fluent API
/// </summary>
public class CountryConfiguration : BaseEntityConfiguration<Country>
{
    public override void Configure(EntityTypeBuilder<Country> builder)
    {
        base.Configure(builder);

        builder.ToTable("countries");

        builder.Property(c => c.Name)
            .HasColumnName("name")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(c => c.Code)
            .HasColumnName("code")
            .HasMaxLength(10);

        builder.Property(c => c.FlagIcon)
            .HasColumnName("flag_icon")
            .HasMaxLength(255);

        builder.Property(c => c.DisplayOrder)
            .HasColumnName("display_order")
            .HasDefaultValue(0);

        builder.Property(c => c.IsActive)
            .HasColumnName("is_active")
            .HasDefaultValue(true);
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TripMate.Domain.Common;

namespace TripMate.Infrastructure.Data.Configurations;

/// <summary>
/// Lớp cấu hình cơ sở để tự động thiết lập các trường chung (id, is_deleted, created_at, updated_at) cho các thực thể
/// </summary>
public abstract class BaseEntityConfiguration<TEntity> : IEntityTypeConfiguration<TEntity> 
    where TEntity : BaseEntity
{
    public virtual void Configure(EntityTypeBuilder<TEntity> builder)
    {
        // 1. Thiết lập khóa chính
        builder.HasKey(e => e.Id);
        
        builder.Property(e => e.Id)
            .HasColumnName("id");

        // 2. Thiết lập các trường dùng chung
        builder.Property(e => e.IsDeleted)
            .HasColumnName("is_deleted")
            .HasDefaultValue(false);

        builder.Property(e => e.CreatedAt)
            .HasColumnName("created_at")
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(e => e.UpdatedAt)
            .HasColumnName("updated_at")
            .HasDefaultValueSql("GETUTCDATE()");

        // 3. Bộ lọc xóa mềm tự động (Global Query Filter) cho tất cả thực thể kế thừa BaseEntity
        builder.HasQueryFilter(e => !e.IsDeleted);
    }
}

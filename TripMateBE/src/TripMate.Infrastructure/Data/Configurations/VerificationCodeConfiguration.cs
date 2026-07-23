using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TripMate.Domain.Entities;

namespace TripMate.Infrastructure.Data.Configurations;

/// <summary>
/// Cấu hình bảng VerificationCodes (Mã xác thực OTP) bằng Fluent API
/// </summary>
public class VerificationCodeConfiguration : BaseEntityConfiguration<VerificationCode>
{
    public override void Configure(EntityTypeBuilder<VerificationCode> builder)
    {
        // 1. Lấy cấu hình chung (id, is_deleted, created_at, updated_at) từ lớp cơ sở
        base.Configure(builder);

        // 2. Ánh xạ tên bảng
        builder.ToTable("verification_codes");

        // 3. Cấu hình các thuộc tính
        builder.Property(vc => vc.Target)
            .HasColumnName("target")
            .HasMaxLength(255)
            .IsRequired(); // SĐT hoặc Email nhận OTP

        builder.Property(vc => vc.Code)
            .HasColumnName("code")
            .HasMaxLength(10)
            .IsRequired(); // Mã OTP

        builder.Property(vc => vc.VerificationType)
            .HasColumnName("verification_type")
            .HasMaxLength(50)
            .IsRequired(); // Loại (Register, ResetPassword...)

        builder.Property(vc => vc.ExpiryTime)
            .HasColumnName("expiry_time")
            .IsRequired();

        builder.Property(vc => vc.IsUsed)
            .HasColumnName("is_used")
            .HasDefaultValue(false);

        // Chỉ mục hỗ trợ tìm kiếm nhanh mã OTP theo SĐT/Email
        builder.HasIndex(vc => vc.Target);
    }
}

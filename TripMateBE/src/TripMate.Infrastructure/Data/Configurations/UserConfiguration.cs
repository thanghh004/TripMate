using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TripMate.Domain.Entities;

namespace TripMate.Infrastructure.Data.Configurations;

/// <summary>
/// Cấu hình bảng Users (Người dùng) bằng Fluent API
/// </summary>
public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        // 1. Ánh xạ tên bảng (viết thường để khớp với thiết kế ban đầu)
        builder.ToTable("users");

        // 2. Cấu hình các cột kế thừa từ IdentityUser (Ánh xạ lại tên cột sang snake_case)
        builder.Property(u => u.Id)
            .HasColumnName("id");

        builder.Property(u => u.Email)
            .HasColumnName("email")
            .HasMaxLength(255)
            .IsRequired(); // Bắt buộc đăng ký bằng Email

        builder.Property(u => u.NormalizedEmail)
            .HasColumnName("normalized_email");

        builder.Property(u => u.UserName)
            .HasColumnName("username")
            .HasMaxLength(255);

        builder.Property(u => u.NormalizedUserName)
            .HasColumnName("normalized_username");

        builder.Property(u => u.PasswordHash)
            .HasColumnName("password_hash")
            .HasMaxLength(255);

        builder.Property(u => u.PhoneNumber)
            .HasColumnName("phone")
            .HasMaxLength(15)
            .IsRequired(false); // Cho phép null nếu đăng ký bằng Email

        builder.Property(u => u.PhoneNumberConfirmed)
            .HasColumnName("is_phone_verified");

        builder.Property(u => u.SecurityStamp)
            .HasColumnName("security_stamp");

        builder.Property(u => u.ConcurrencyStamp)
            .HasColumnName("concurrency_stamp");

        // 3. Cấu hình các cột tự thêm mới
        builder.Property(u => u.FullName)
            .HasColumnName("full_name")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(u => u.AvatarUrl)
            .HasColumnName("avatar_url");

        builder.Property(u => u.IdentityCardFrontUrl)
            .HasColumnName("identity_card_front_url")
            .HasMaxLength(1000)
            .IsRequired(false);

        builder.Property(u => u.IdentityCardBackUrl)
            .HasColumnName("identity_card_back_url")
            .HasMaxLength(1000)
            .IsRequired(false);

        builder.Property(u => u.Gender)
            .HasColumnName("gender")
            .HasMaxLength(10);

        builder.Property(u => u.BirthDate)
            .HasColumnName("birth_date")
            .HasColumnType("date");

        builder.Property(u => u.Bio)
            .HasColumnName("bio");

        builder.Property(u => u.AvgRating)
            .HasColumnName("avg_rating")
            .HasColumnType("decimal(3,2)")
            .HasDefaultValue(0.00);

        builder.Property(u => u.TotalReviews)
            .HasColumnName("total_reviews")
            .HasDefaultValue(0);

        // Lưu Enum dưới dạng Số nguyên (int)
        builder.Property(u => u.Status)
            .HasColumnName("status")
            .HasDefaultValue(Domain.Enums.UserStatus.Active);

        builder.Property(u => u.Role)
            .HasColumnName("role")
            .HasDefaultValue(Domain.Enums.UserRole.User);

        builder.Property(u => u.IsDeleted)
            .HasColumnName("is_deleted")
            .HasDefaultValue(false);

        builder.Property(u => u.CreatedAt)
            .HasColumnName("created_at")
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(u => u.UpdatedAt)
            .HasColumnName("updated_at")
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(u => u.RefreshToken)
            .HasColumnName("refresh_token")
            .HasMaxLength(500);

        builder.Property(u => u.RefreshTokenExpiryTime)
            .HasColumnName("refresh_token_expiry_time");

        // 4. Các chỉ mục (Indexes)
        builder.HasIndex(u => u.PhoneNumber)
            .IsUnique()
            .HasFilter("[phone] IS NOT NULL"); // Cho phép nhiều bản ghi có SĐT null

        builder.HasIndex(u => u.Email)
            .IsUnique()
            .HasFilter("[email] IS NOT NULL"); // Cho phép nhiều bản ghi có Email null

        // 5. Thiết lập Bộ lọc xóa mềm mặc định (Global Query Filter)
        builder.HasQueryFilter(u => !u.IsDeleted);
    }
}

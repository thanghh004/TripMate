using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using TripMate.Domain.Common;
using TripMate.Domain.Entities;

namespace TripMate.Infrastructure.Data;

/// <summary>
/// DbContext chính của ứng dụng TripMate
/// Kế thừa từ IdentityDbContext để tích hợp ASP.NET Core Identity
/// </summary>
public class TripMateDbContext : IdentityDbContext<User, IdentityRole<Guid>, Guid>
{
    public TripMateDbContext(DbContextOptions<TripMateDbContext> options) : base(options)
    {
    }

    #region DbSets

    public DbSet<Trip> Trips { get; set; } = null!;
    public DbSet<TripCategory> TripCategories { get; set; } = null!;
    public DbSet<Country> Countries { get; set; } = null!;
    public DbSet<City> Cities { get; set; } = null!;
    public DbSet<TripImage> TripImages { get; set; } = null!;
    public DbSet<TripRequest> TripRequests { get; set; } = null!;
    public DbSet<TripMember> TripMembers { get; set; } = null!;
    public DbSet<Review> Reviews { get; set; } = null!;
    public DbSet<Report> Reports { get; set; } = null!;
    public DbSet<Notification> Notifications { get; set; } = null!;
    public DbSet<ChatMessage> ChatMessages { get; set; } = null!;
    public DbSet<VerificationCode> VerificationCodes { get; set; } = null!;
    public DbSet<Post> Posts { get; set; } = null!;
    public DbSet<PostComment> PostComments { get; set; } = null!;
    public DbSet<PostLike> PostLikes { get; set; } = null!;

    #endregion

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Áp dụng tất cả cấu hình EntityTypeConfiguration được định nghĩa trong cùng Assembly này
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(TripMateDbContext).Assembly);
    }

    /// <summary>
    /// Ghi đè phương thức SaveChanges để xử lý xóa mềm tự động
    /// </summary>
    public override int SaveChanges()
    {
        HandleSoftDelete();
        return base.SaveChanges();
    }

    /// <summary>
    /// Ghi đè phương thức SaveChangesAsync để xử lý xóa mềm tự động
    /// </summary>
    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        HandleSoftDelete();
        return base.SaveChangesAsync(cancellationToken);
    }

    /// <summary>
    /// Duyệt qua các thay đổi để chuyển hành động Delete thành Update IsDeleted = true
    /// </summary>
    private void HandleSoftDelete()
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e.State == EntityState.Deleted && e.Entity is ISoftDelete);

        foreach (var entry in entries)
        {
            // Chuyển trạng thái từ Deleted thành Modified
            entry.State = EntityState.Modified;
            
            // Set trường IsDeleted thành true
            ((ISoftDelete)entry.Entity).IsDeleted = true;
            
            // Nếu thực thể có trường UpdatedAt, cập nhật thời gian chỉnh sửa cuối
            var updatedAtProp = entry.Entity.GetType().GetProperty("UpdatedAt");
            if (updatedAtProp != null)
            {
                updatedAtProp.SetValue(entry.Entity, DateTime.UtcNow);
            }
        }
    }
}

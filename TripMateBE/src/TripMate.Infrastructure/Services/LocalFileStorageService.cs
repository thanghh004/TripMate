using Microsoft.AspNetCore.Hosting;
using TripMate.Domain.Interfaces;

namespace TripMate.Infrastructure.Services;

/// <summary>
/// Lưu trữ file cục bộ tại thư mục wwwroot/uploads của server.
/// Trả về URL công khai để client có thể truy cập trực tiếp.
/// </summary>
public class LocalFileStorageService : IFileStorageService
{
    private readonly IWebHostEnvironment _env;

    public LocalFileStorageService(IWebHostEnvironment env)
    {
        _env = env;
    }

    public async Task<string> UploadAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        CancellationToken cancellationToken = default)
    {
        // 1. Xác định thư mục lưu trữ: wwwroot/uploads
        var uploadsFolder = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");
        Directory.CreateDirectory(uploadsFolder); // Tạo thư mục nếu chưa có

        // 2. Sinh tên file duy nhất để tránh ghi đè (GUID + extension gốc)
        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        var uniqueFileName = $"{Guid.NewGuid():N}{extension}";
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        // 3. Ghi nội dung file vào đĩa
        await using var outputStream = new FileStream(filePath, FileMode.Create, FileAccess.Write, FileShare.None, 4096, useAsync: true);
        await fileStream.CopyToAsync(outputStream, cancellationToken);

        // 4. Trả về đường dẫn tương đối để Controller tự build URL đầy đủ
        return $"/uploads/{uniqueFileName}";
    }
}

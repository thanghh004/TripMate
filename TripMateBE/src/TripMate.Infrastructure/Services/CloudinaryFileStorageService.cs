using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Configuration;
using TripMate.Domain.Interfaces;

namespace TripMate.Infrastructure.Services;

/// <summary>
/// Dịch vụ upload file lên Cloudinary CDN.
/// Trả về URL CDN công khai để client có thể truy cập trực tiếp.
/// </summary>
public class CloudinaryFileStorageService : IFileStorageService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryFileStorageService(IConfiguration configuration)
    {
        var cloudName = configuration["CloudinarySettings:CloudName"]
            ?? throw new InvalidOperationException("CloudinarySettings:CloudName is not configured.");
        var apiKey = configuration["CloudinarySettings:ApiKey"]
            ?? throw new InvalidOperationException("CloudinarySettings:ApiKey is not configured.");
        var apiSecret = configuration["CloudinarySettings:ApiSecret"]
            ?? throw new InvalidOperationException("CloudinarySettings:ApiSecret is not configured.");

        var account = new Account(cloudName, apiKey, apiSecret);
        _cloudinary = new Cloudinary(account);
        _cloudinary.Api.Secure = true; // Luôn dùng HTTPS
    }

    public async Task<string> UploadAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        CancellationToken cancellationToken = default)
    {
        // 1. Xác định loại upload dựa vào MIME type
        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(fileName, fileStream),
            // Tự động sinh PublicId duy nhất theo thời gian + GUID
            PublicId = $"tripmate/{Path.GetFileNameWithoutExtension(fileName)}_{Guid.NewGuid():N}",
            Overwrite = false,
            // Giữ nguyên 100% chất lượng ảnh gốc HD/4K sắc nét của người dùng tải lên
        };

        // 2. Upload lên Cloudinary
        var uploadResult = await _cloudinary.UploadAsync(uploadParams, cancellationToken);

        // 3. Kiểm tra lỗi nếu có
        if (uploadResult.Error is not null)
            throw new InvalidOperationException($"Cloudinary upload failed: {uploadResult.Error.Message}");

        // 4. Trả về URL CDN đầy đủ (HTTPS)
        return uploadResult.SecureUrl.ToString();
    }
}

namespace TripMate.Domain.Interfaces;

/// <summary>
/// Giao diện dịch vụ lưu trữ file (ảnh đại diện, CCCD...) tại Infrastructure Layer
/// </summary>
public interface IFileStorageService
{
    /// <summary>
    /// Upload file và trả về đường dẫn URL có thể truy cập công khai
    /// </summary>
    /// <param name="fileStream">Stream nội dung file</param>
    /// <param name="fileName">Tên file gốc (dùng để lấy extension)</param>
    /// <param name="contentType">MIME type của file</param>
    /// <param name="cancellationToken">Token hủy tác vụ</param>
    /// <returns>URL đầy đủ của file đã lưu</returns>
    Task<string> UploadAsync(Stream fileStream, string fileName, string contentType, CancellationToken cancellationToken = default);
}

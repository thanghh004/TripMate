/**
 * Chuyển đổi chuỗi ngày dạng YYYY-MM-DD hoặc ISO sang dạng DD/MM/YYYY chuẩn Việt Nam
 */
export const formatDate = (dateInput?: string | Date | null): string => {
  if (!dateInput) return '';

  const str = String(dateInput).split('T')[0];
  const parts = str.split('-');

  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }

  return str;
};

/**
 * Loại bỏ dấu tiếng Việt, đưa về viết thường và trim khoảng trắng thừa
 */
export const removeAccents = (str: string = ''): string => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .trim()
    .replace(/\s+/g, ' ');
};

/**
 * Kiểm tra targetText có chứa query (không phân biệt dấu, hoa thường, khoảng trắng thừa)
 */
export const matchSearch = (targetText: string = '', query: string = ''): boolean => {
  const normalizedQuery = removeAccents(query);
  if (!normalizedQuery) return true;
  const normalizedTarget = removeAccents(targetText);
  return normalizedTarget.includes(normalizedQuery);
};

/**
 * Format số tiền dạng VNĐ
 */
export const formatVND = (amount?: number | null): string => {
  if (amount == null) return '0';
  return amount.toLocaleString('vi-VN');
};

/**
 * Hiển thị thời gian tương đối (VD: vừa xong, 5 phút trước, 2 giờ trước, 3 ngày trước)
 */
export const formatRelativeTime = (dateInput?: string | Date | null): string => {
  if (!dateInput) return '';

  const now = new Date();
  const date = new Date(dateInput);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 30) return 'vừa xong';
  if (diffInSeconds < 60) return `${diffInSeconds} giây trước`;

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} ngày trước`;

  return formatDate(dateInput);
};

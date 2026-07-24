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
    .trim();
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

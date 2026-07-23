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

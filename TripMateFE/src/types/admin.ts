
/// <summary>
/// Type riêng cho chức năng Admin xem danh sách người dùng.
/// Khớp 100% với AdminUserListItemDto ở Backend.
/// </summary>
export interface AdminUserListItem {
  userId: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  gender?: string;
  birthDate?: string;
  avatarUrl?: string;
  bio?: string;
  role: string;
  status: number;
  identityCardNumber?: string;
  identityCardFrontUrl?: string;
  identityCardBackUrl?: string;
  hostVerificationStatus: number;
  avgRating: number;
  totalTrips: number;
}

/// <summary>
/// Request body cho Admin cập nhật cài đặt quản trị người dùng.
/// </summary>
export interface AdminUpdateUserRequest {
  role: number;
  status: number;
  hostVerificationStatus: number;
}

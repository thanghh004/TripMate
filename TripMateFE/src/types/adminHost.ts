/// <summary>
/// Type riêng cho màn hình Admin duyệt quyền tạo chuyến (Host Verification Requests).
/// Khớp 100% với PendingHostVerificationDto ở Backend.
/// </summary>
export interface PendingHostVerification {
  userId: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  gender?: string;
  birthDate?: string;
  avatarUrl?: string;
  bio?: string;
  identityCardNumber?: string;
  identityCardFrontUrl?: string;
  identityCardBackUrl?: string;
  hostVerificationStatus: number;
  avgRating: number;
  totalTrips: number;
  requestDate?: string;
}

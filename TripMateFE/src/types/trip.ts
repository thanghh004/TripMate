export const TripStatus = {
  PendingReview: 0,
  Open: 1,
  Approved: 1,
  Full: 2,
  Ongoing: 3,
  Completed: 4,
  Cancelled: 5,
  Rejected: 6,
  Failed: 7,
} as const;

export type TripStatus = number;

export const TripMemberStatus = {
  Pending: 0,
  Approved: 1,
  Rejected: 2,
  Cancelled: 3,
  Completed: 4,
} as const;

export type TripMemberStatus = number;

export interface CreateTripRequest {
  categoryId: string;
  title: string;
  description?: string;
  startLocation: string;
  startCountryId?: string;
  startCityId?: string;
  destination: string;
  destinationCountryId?: string;
  destinationCityId?: string;
  coverImageUrl?: string;
  startDate: string;
  endDate: string;
  registrationDeadline?: string;
  maxMembers: number;
  estimatedCost?: number;
  costNote?: string;
  requirements?: string;
  minAge?: number;
  maxAge?: number;
  preferredGender?: string;
  imageUrls?: string[];
}

export interface TripMember {
  userId: string;
  fullName: string;
  email?: string;
  avatarUrl?: string;
  role?: string | number;
  status?: number; // 0: Pending, 1: Approved, 2: Rejected
  joinedAt?: string;
}

export interface Trip {
  id: string;
  organizerId: string;
  organizerName: string;
  organizerAvatarUrl?: string;
  organizerRating?: number;
  categoryId: string;
  categoryName: string;
  title: string;
  description?: string;
  startLocation: string;
  startCountryId?: string;
  startCityId?: string;
  startCityName?: string;
  destination: string;
  destinationCountryId?: string;
  destinationCityId?: string;
  destinationCityName?: string;
  coverImageUrl?: string;
  startDate: string;
  endDate: string;
  registrationDeadline?: string;
  maxMembers: number;
  currentMembers: number;
  members?: TripMember[];
  estimatedCost?: number;
  costNote?: string;
  requirements?: string;
  minAge?: number;
  maxAge?: number;
  preferredGender?: string;
  status: number;
  statusName?: string;
  myMemberStatus?: number;
  moderationNote?: string;
  cancellationReason?: string;
  imageUrls: string[];
  createdAt: string;
  updatedAt?: string;
}

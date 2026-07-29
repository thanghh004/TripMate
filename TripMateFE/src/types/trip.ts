export const TripStatus = {
  PendingReview: 0,
  Open: 1,
  Approved: 1,
  Full: 2,
  Ongoing: 3,
  Completed: 4,
  Cancelled: 5,
  Failed: 6,
  Rejected: 7,
} as const;

export type TripStatus = number;

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
  avatarUrl?: string;
  role?: string;
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
  startCityId?: string;
  startCityName?: string;
  destination: string;
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
  moderationNote?: string;
  imageUrls: string[];
  createdAt: string;
  updatedAt?: string;
}

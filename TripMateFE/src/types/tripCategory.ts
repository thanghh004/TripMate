export interface TripCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateTripCategoryRequest {
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  displayOrder: number;
}

export interface UpdateTripCategoryRequest {
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
}

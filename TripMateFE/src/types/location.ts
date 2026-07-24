export interface Country {
  id: string;
  name: string;
  code?: string;
  flagIcon?: string;
  displayOrder: number;
  isActive: boolean;
  isDeleted: boolean;
  cities?: City[];
  createdAt: string;
  updatedAt?: string;
}

export interface City {
  id: string;
  countryId: string;
  countryName: string;
  name: string;
  slug?: string;
  displayOrder: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateCountryRequest {
  name: string;
  code?: string;
  flagIcon?: string;
  displayOrder: number;
}

export interface UpdateCountryRequest {
  name: string;
  code?: string;
  flagIcon?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface CreateCityRequest {
  countryId: string;
  name: string;
  slug?: string;
  displayOrder: number;
}

export interface UpdateCityRequest {
  countryId: string;
  name: string;
  slug?: string;
  displayOrder: number;
  isActive: boolean;
}

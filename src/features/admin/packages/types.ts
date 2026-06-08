export type PackageLevel = "BASIC" | "PROFESSIONAL" | "PREMIUM";

export type AdminPackage = {
  id: string;
  name: string;
  level: PackageLevel;
  priceMonthly: number;
  priceYearly: number;
  features: unknown;
  liveCohortsLimit: number;
  recordedCohortsLimit: number;
  privateSessionsLimit: number;
  isRecommended: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CreatePackageInput = {
  name: string;
  level: PackageLevel;
  priceMonthly: number;
  priceYearly: number;
  features: unknown;
  isRecommended?: boolean;
  isActive?: boolean;
  liveCohortsLimit?: number;
  recordedCohortsLimit?: number;
  privateSessionsLimit?: number;
};

export type UpdatePackageInput = Partial<CreatePackageInput>;

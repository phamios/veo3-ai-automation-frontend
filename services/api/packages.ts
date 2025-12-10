// Packages API Service
import { get } from './client';
import { Package } from '../../types';

interface BackendPackage {
  id: string;
  name: string;
  slug: string;
  description?: string;
  durationMonths: number;
  originalPrice: string | number;
  salePrice: string | number;
  discountPercent: number;
  features: string[];
  videosPerMonth: number;
  keywordsTracking: number;
  apiCallsPerMonth: number;
  maxDevices: number;
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
}

// Convert backend package to frontend format
const toFrontendPackage = (pkg: BackendPackage): Package => ({
  id: pkg.id,
  name: pkg.name,
  durationMonths: pkg.durationMonths,
  originalPrice: Number(pkg.originalPrice),
  price: Number(pkg.salePrice),
  discount: pkg.discountPercent,
  isPopular: pkg.isPopular,
  features: pkg.features || [],
});

export const packagesApi = {
  /**
   * Get all active packages
   */
  getAll: async (): Promise<Package[]> => {
    const packages = await get<BackendPackage[]>('/packages', true);
    return packages.map(toFrontendPackage);
  },

  /**
   * Get single package by ID
   */
  getById: async (id: string): Promise<Package> => {
    const pkg = await get<BackendPackage>(`/packages/${id}`, true);
    return toFrontendPackage(pkg);
  },
};

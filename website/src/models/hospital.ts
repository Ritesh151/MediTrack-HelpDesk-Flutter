export interface Hospital {
  id: string;
  name: string;
  type: string;
  address: string;
  city: string;
  state?: string;
  code: string;
  isVerified?: boolean;
}

export type HospitalType = string;

export interface CreateHospitalRequest {
  name: string;
  type: string;
  address: string;
  city: string;
  state?: string;
  code: string;
}

export interface UpdateHospitalRequest {
  name?: string;
  type?: string;
  address?: string;
  city?: string;
  state?: string;
  code?: string;
  isVerified?: boolean;
}

export interface HospitalStats {
  total: number;
  government: number;
  private: number;
  semiGovernment: number;
  verified: number;
  unverified: number;
  averageCapacity: number;
}

export interface HospitalFilter {
  type?: string;
  city?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface HospitalListResponse {
  hospitals: Hospital[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export const hospitalFromJson = (json: any): Hospital => {
  return {
    id: json.id ?? json._id ?? '',
    name: json.name ?? '',
    type: json.type ?? '',
    address: json.address ?? '',
    city: json.city ?? '',
    code: json.code ?? '',
  };
};

export const hospitalToJson = (hospital: Hospital): any => {
  return {
    id: hospital.id,
    name: hospital.name,
    type: hospital.type,
    address: hospital.address,
    city: hospital.city,
    code: hospital.code,
  };
};

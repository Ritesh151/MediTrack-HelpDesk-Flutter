export interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'admin' | 'super';
  hospitalId?: string;
  permissions: string[];
  token?: string;
}

export interface ApiUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  hospitalId?: string;
  permissions: string[];
  token?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  hospitalId: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface UserStats {
  total: number;
  patients: number;
  admins: number;
  superAdmins: number;
}

export const userFromJson = (json: any): User => {
  return {
    id: json._id ?? json.id ?? '',
    name: json.name ?? '',
    email: json.email ?? '',
    role: json.role ?? 'patient',
    hospitalId: json.hospitalId,
    permissions: (json.permissions as any[])?.map((e: any) => e.toString()) ?? [],
    token: json.token,
  };
};

export const userToJson = (user: User): any => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    hospitalId: user.hospitalId,
    permissions: user.permissions,
    token: user.token,
  };
};

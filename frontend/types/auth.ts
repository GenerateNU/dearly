export interface AuthRequest {
  email: string;
  password: string;
}

export interface PhoneAuth {
  phone: string;
  token: string;
}
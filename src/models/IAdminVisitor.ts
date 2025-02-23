export interface IAdminVisitor {
  id: string;
  refer: string;
  timestamp: string;
  success_timestamp: string;
  dropped: boolean;
  success: boolean;
  ip: string;
  twofa: string;
  phone: string;
  metadata: string
}

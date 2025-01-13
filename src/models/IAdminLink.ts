type AdminLinkStatus = "ACTIVE" | "DISABLED";

export interface IAdminLink {
  photo: string;
  title: string;
  subscribers: number;
  description: string;
  origin: string;
  fake: string;
  id: string;
  tag: string;
  visits: number;
  successfullVisits: number;
  status: AdminLinkStatus;
}

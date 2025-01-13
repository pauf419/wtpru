import $api from "../http";
import { Axios, AxiosResponse } from "axios";
import { HttpResponse } from "../models/response/HttpResponse";
import { IAdminLink } from "../models/IAdminLink";
import { IAdminInfo } from "../models/IAdminInfo";

export default class AdminService {
  static async getLinks(): Promise<AxiosResponse<HttpResponse<IAdminLink[]>>> {
    return $api.get<HttpResponse<IAdminLink[]>>("/admin/link");
  }

  static async deleteLink(
    id: string
  ): Promise<AxiosResponse<HttpResponse<IAdminLink>>> {
    return $api.post<HttpResponse<IAdminLink>>("/admin/link/delete", {
      id,
    });
  }

  static async getInfo(): Promise<AxiosResponse<HttpResponse<IAdminInfo>>> {
    return $api.get<HttpResponse<IAdminInfo>>("/admin/info");
  }

  static async createLink(
    data: IAdminLink
  ): Promise<AxiosResponse<HttpResponse<IAdminLink>>> {
    return $api.post<HttpResponse<IAdminLink>>("/admin/link", data);
  }
}

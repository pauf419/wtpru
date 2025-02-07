import $api from "../http";
import { Axios, AxiosResponse } from "axios";
import { HttpResponse } from "../models/response/HttpResponse";
import { IAdminLink } from "../models/IAdminLink";
import { IAdminInfo } from "../models/IAdminInfo";
import { ISessionMessage } from "../models/ISessionMessage";

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

  static async swapLinks(
    id: string,
    index: number
  ): Promise<AxiosResponse<HttpResponse<IAdminLink[]>>> {
    return $api.post<HttpResponse<IAdminLink[]>>("/admin/link/swap", {
      id,
      index,
    });
  }

  static async getInfo(): Promise<AxiosResponse<HttpResponse<IAdminInfo>>> {
    return $api.get<HttpResponse<IAdminInfo>>("/admin/info");
  }

  static async updateLinkSubscribers(
    id: string,
    subscribers: number
  ): Promise<AxiosResponse<HttpResponse<IAdminLink>>> {
    return $api.post<HttpResponse<IAdminLink>>("/admin/link/subs", {
      id,
      subscribers,
    });
  }

  static async createLink(
    data: IAdminLink
  ): Promise<AxiosResponse<HttpResponse<IAdminLink>>> {
    return $api.post<HttpResponse<IAdminLink>>("/admin/link", data);
  }

  static async getSession(
    visitorId: string
  ): Promise<AxiosResponse<HttpResponse<ISessionMessage[]>>> {
    return $api.get<HttpResponse<ISessionMessage[]>>(
      `/admin/session?visitorId=${visitorId}`
    );
  }

  static async getWhitelist(): Promise<AxiosResponse<HttpResponse<string[]>>> {
    return $api.get<HttpResponse<string[]>>("/admin/whitelist");
  }

  static async addWhitelistIp(
    ip: string
  ): Promise<AxiosResponse<HttpResponse<string>>> {
    return $api.post<HttpResponse<string>>("/admin/whitelist", { ip });
  }

  static async removeWhitelistIp(
    ip: string
  ): Promise<AxiosResponse<HttpResponse<string>>> {
    return $api.post<HttpResponse<string>>("/admin/whitelist/delete", { ip });
  }

  static async dropSession(
    visitorId: string
  ): Promise<AxiosResponse<HttpResponse<string>>> {
    return $api.post<HttpResponse<string>>("/admin/drop", {
      visitorId,
    });
  }
}

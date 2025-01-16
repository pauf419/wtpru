import $api from "../http";
import { Axios, AxiosResponse } from "axios";
import { ILink } from "../models/ILink";
import { HttpResponse } from "../models/response/HttpResponse";
import { IVisitor } from "../models/IVisitor";
import { IAdminVisitor } from "../models/IAdminVisitor";

export default class VisitorService {
  static async loadVisitor(
    linkId: string,
    visitorId: string
  ): Promise<AxiosResponse<HttpResponse<IVisitor>>> {
    return $api.get<HttpResponse<IVisitor>>("/visitor", {
      params: {
        linkId,
        visitorId,
      },
    });
  }

  static async getAll(): Promise<AxiosResponse<HttpResponse<IAdminVisitor[]>>> {
    return $api.get<HttpResponse<IAdminVisitor[]>>("/visitor/all");
  }

  static async delete(
    visitorId: string
  ): Promise<AxiosResponse<HttpResponse<IVisitor>>> {
    return $api.post<HttpResponse<IVisitor>>("/visitor/delete", {
      visitorId,
    });
  }
}

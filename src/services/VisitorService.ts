import $api from "../http";
import { Axios, AxiosResponse } from "axios";
import { ILink } from "../models/ILink";
import { HttpResponse } from "../models/response/HttpResponse";
import { IVisitor } from "../models/IVisitor";

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
}

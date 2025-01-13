import { makeAutoObservable } from "mobx";
import { IModalLog } from "../models/IModalLog";
import { ILink } from "../models/ILink";
import { IVisitor } from "../models/IVisitor";
import VisitorService from "../services/VisitorService";
import LinkService from "../services/LinkService";

export default class Store {
  loading: boolean = true;
  activeLog: IModalLog | null = null;
  currentPage: number = 0;
  visitor: IVisitor | null = null;
  link: ILink | null = null;
  websocketConnected: boolean = false;

  setActiveLog(log: IModalLog | null) {
    this.activeLog = log;
  }

  updateLog(status: number, message: string) {
    this.activeLog = {
      status,
      message,
    };
  }

  setLoading(state: boolean) {
    this.loading = state;
  }

  setCurrentPage(page: number) {
    this.currentPage = page;
  }

  setLink(link: ILink) {
    this.link = link;
  }

  setVisitor(visitor: IVisitor) {
    this.visitor = visitor;
  }

  setWebsocketConnected(bool: boolean) {
    this.websocketConnected = bool;
  }
  async loadLink(linkId: string) {
    try {
      const { data } = await LinkService.loadLink(linkId);
      this.setLink(data.json);
      localStorage.setItem("linkId", data.json.id);
      return data.json;
    } catch (e) {
      console.error(e);
    }
  }

  async loadVisitor(linkId: string, visitorId: string) {
    try {
      const { data } = await VisitorService.loadVisitor(linkId, visitorId);
      this.setVisitor(data.json);
      localStorage.setItem("visitorId", data.json.id);
      return data.json;
    } catch (e) {
      console.error(e);
    }
  }

  constructor() {
    makeAutoObservable(this);
  }
}

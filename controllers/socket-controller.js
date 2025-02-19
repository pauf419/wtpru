class SocketController {
  constructor() {
    this.sockets = new Map();
  }

  async handleSocketConnection(socket, server) {
    const sessionManager = require("../session-manager/session-manager");

    const { visitorId } = socket.handshake.auth;

    if (!visitorId) {
      return socket.disconnect();
    }

    this.sockets.set(visitorId, socket);

    socket.on("disconnect", () => {
      sessionManager.deactivateProcess(visitorId);
      this.sockets.delete(visitorId);
    });
  }

  emitSocket(visitorId, message) {
    const socket = this.sockets.get(visitorId);

    if (!socket) {
      console.log(`No socket found for visitorId: ${visitorId}`);
      return;
    }
    socket.emit("update", message);
  }
}

module.exports = new SocketController();

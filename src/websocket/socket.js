import io from "socket.io-client";

export var socket;

export const server = "http://localhost:5000";

export const connect = (linkId, connectedCb) => {
  socket = io(server, {
    auth: {
      linkId,
    },
  });

  socket.on("connect_error", (data) => {});

  socket.on("connect", (data) => {
    connectedCb();
  });

  socket.on("disconnect", (data) => {});
};

export const updateInstance = async (linkId) => {
  socket.on("disconnect", () => {
    connect(linkId);
  });

  socket.disconnect();
};

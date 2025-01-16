import io from "socket.io-client";

export var socket;

export const server = "/";

export const connect = (visitorId, connectedCb) => {
  console.log("CALLED CONNECT");
  socket = io(server, {
    auth: {
      visitorId,
    },
  });

  socket.on("connect_error", (data) => {});

  socket.on("connect", (data) => {
    connectedCb();
  });

  socket.on("disconnect", (data) => {});
};

export const updateInstance = async (visitorId) => {
  socket.on("disconnect", () => {
    connect(visitorId);
  });

  socket.disconnect();
};

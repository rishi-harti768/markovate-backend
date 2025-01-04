/**
 * @param {import('socket.io').Server} io - The Socket.IO server instance
 */
export const AdminSetup = (io) => {
  const namespace = io.of("/admin");
  namespace.on("connection", (socket) => {
    console.log(`Admin connected: ${socket.id}`);

    socket.on("message", (data) => {
      console.log(data);
      namespace.emit("result", data);
    });

    socket.on("disconnect", () => {
      console.log(`Admin disconnected: ${socket.id}`);
    });
  });
};

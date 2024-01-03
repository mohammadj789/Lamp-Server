const socketController = (io) => (socket) => {
  const { id } = socket.handshake.headers;
  console.log("A user connected to /api/data-socket");
  socket.join(id);
  socket.on("disconnect", () => {
    console.log("User disconnected from /api/data-socket");
  });
};

module.exports = { socketController };

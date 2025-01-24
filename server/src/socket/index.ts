import { Server } from "socket.io";

export default function setupSocket(io: Server) {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    socket.on("childLocationUpdate", (data) => {
      console.log("Child Location:", data);
      io.emit("childLocationUpdate", data);
    });
    socket.on("sosAlert", (data) => {
      console.log("sosAlert", data);
      io.emit("locationUpdate", data);
    });
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
}

import { io, Socket } from "socket.io-client";


const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL || 'https://default-url.com/api';


let socket: Socket | null = null;

/**
 * Initialize the Socket.IO connection.
 */
export const initializeSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket"], 
      reconnection: true,
    });

    socket.on("connect", () => {
      console.log("Connected to WebSocket server:", socket?.id);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
    });

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
    });
  }

  return socket;
};

/**
 * Disconnect the Socket.IO connection.
 */
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("Disconnected from WebSocket server");
  }
};

/**
 * Emit an event through the WebSocket connection.
 * @param event The event name
 * @param data The data to emit
 */
export const emitEvent = (event: string, data: any): void => {
  if (socket) {
    socket.emit(event, data);
  } else {
    console.error("Socket is not initialized. Cannot emit event.");
  }
};

/**
 * Listen to a specific event through the WebSocket connection.
 * @param event The event name
 * @param callback The callback function to handle the event
 */
export const listenToEvent = (event: string, callback: (data: any) => void): void => {
  if (socket) {
    console.log(`Listening to event: ${event} `);
    socket.on(event, callback);
  } else {
    console.error("Socket is not initialized. Cannot listen to event.");
  }
};


/**
 * Remove a specific event listener.
 * @param event The event name
 */
export const removeEventListener = (event: string): void => {
  if (socket) {
    socket.off(event);
  } else {
    console.error("Socket is not initialized. Cannot remove event listener.");
  }
};

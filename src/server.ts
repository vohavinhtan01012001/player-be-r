import errorHandler from "errorhandler";
import app from "./app";
import { v2 as cloudinary } from "cloudinary";
import http from "http";
import { Server as SocketIO } from "socket.io";
import { clientConfig } from "./config/config";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
});

/**
 * Error Handler. Provides full stack
 */
if (process.env.NODE_ENV === "development") {
  app.use(errorHandler());
}

/**
 * Create HTTP server and configure Socket.IO
 */
const server = http.createServer(app);
const io = new SocketIO(server, {
  cors: {
    origin: clientConfig.clientUrl, // Replace with your client's origin
    methods: ["GET", "POST","DELETE","PUT"],
  },
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Handle specific events here
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });

  // Add more event handlers as needed
});
export { io };

/**
 * Start Express server.
 */

server.listen(app.get("port"), () => {
  console.log(
    "  App is running at http://localhost:%d in %s mode",
    app.get("port"),
    app.get("env")
  );
  console.log("  Press CTRL-C to stop\n");
});

export default server;

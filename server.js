// server.js
import { startServer } from "./src/server/socket-server.js";

// Start the server
startServer().catch((err) => {
  console.error("Error starting server:", err);
  process.exit(1);
});

const http = require("http");
const app = require("./src/app");
const config = require("./src/config/env");
const socketService = require("./src/services/socket.service");

const PORT = config.PORT || 5000;
const server = http.createServer(app);

socketService.initialize(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

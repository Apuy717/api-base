import "reflect-metadata";
import App from "./app";
import * as http from "http";

const PORT = process.env.PORT || 3000;
const server = http.createServer(new App().instance);

server.listen(PORT, () => {
  console.log(`⚡️[server ${process.env.NODE_ENV}] running on PORT ${process.env.PORT}`);
});

import { resolve } from "node:path";
import { init, reload } from "browser-sync";
import nodemon from "nodemon";
import packageJson from "../package.json" assert { type: "json" };
// Start nodemon to restart node app on file changes
const opts = packageJson.nodemonConfig;
nodemon({
  ...opts,
  args: ["--dev"],
  script: resolve(process.cwd(), "./server.ts"),
})
  .on("start", () => {
    // Once nodemon starts, start browser-sync after a delay
    setTimeout(() => {
      init({
        proxy: "http://localhost:3000", // This is your app's address
        files: [`${resolve(process.cwd(), "./public")}/**/*.{js,css,html}`], // Watch these files for changes
        port: 4000, // This is the port browser-sync uses
      });
    }, 1000); // delay to allow the server to start
  })
  .on("restart", () => {
    // When nodemon restarts the server, refresh browser-sync after a delay
    setTimeout(() => {
      reload();
    }, 1000); // delay allows the server to start before reloading
  });

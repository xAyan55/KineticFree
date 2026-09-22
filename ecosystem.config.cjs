const path = require("path");
const port = process.env.PORT || 3000;

module.exports = {
  apps: [
    {
      name: "kinetichost",
      script: path.resolve(__dirname, "dist-server", "index.js"),
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
        PORT: port,
      },
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 2000,
    },
  ],
};

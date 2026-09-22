const port = process.env.PORT || 3000;

module.exports = {
  apps: [
    {
      name: "kinetichost",
      script: "dist-server/index.js",
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

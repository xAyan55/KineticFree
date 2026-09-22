const port = process.env.PORT || 3000;

module.exports = {
  apps: [
    {
      name: "kinetichost",
      script: "node_modules/vite/bin/vite.js",
      args: `preview --host 0.0.0.0 --port ${port}`,
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

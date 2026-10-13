module.exports = {
  apps: [
    {
      name: 'gzacinema-client',
      script: 'serve',
      env: {
        PM2_SERVE_PATH: './dist',
        PM2_SERVE_PORT: 5173,
        PM2_SERVE_SPA: 'true',
        PM2_SERVE_HOMEPAGE: '/index.html'
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '300M'
    }
  ]
};

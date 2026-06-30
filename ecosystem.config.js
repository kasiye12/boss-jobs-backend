module.exports = {
  apps: [
    {
      name: 'boss-jobs-api',
      script: './src/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      merge_logs: true,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=2048',
    },
  ],
};

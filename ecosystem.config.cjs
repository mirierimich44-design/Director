module.exports = {
  apps: [
    {
      name: 'director-server',
      script: 'server/index.js',
      instances: 1,
      exec_mode: 'fork',
      // Restart if memory exceeds 1.5GB (Remotion renders can spike)
      max_memory_restart: '1500M',
      // Restart backoff: don't hammer the process if it keeps crashing
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
        // Hard-limit to 2 concurrent Remotion renders on 6-CPU VPS
        RENDER_CONCURRENCY: '2',
      },
      // Log rotation
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
    },
    {
      name: 'kokoro-tts',
      script: 'server/tts_service.py',
      interpreter: 'server/tts_venv/bin/python3',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '800M',
      max_restarts: 5,
      min_uptime: '5s',
      restart_delay: 3000,
      env: {
        PORT: '8880',
      },
      out_file: './logs/tts-out.log',
      error_file: './logs/tts-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};

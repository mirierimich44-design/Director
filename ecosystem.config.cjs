module.exports = {
  apps: [
    {
      name: 'director-server',
      script: 'server/index.js',
      instances: 1,
      exec_mode: 'fork',        // NEVER cluster — Remotion uses chdir() internally
      watch: false,              // never auto-restart on file changes
      autorestart: true,         // restart on crash
      max_memory_restart: '1500M', // restart if Node exceeds 1.5 GB
      max_restarts: 10,          // stop trying after 10 rapid crashes
      min_uptime: '10s',         // must stay up 10s to count as healthy
      restart_delay: 5000,       // wait 5s between restart attempts
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
        RENDER_CONCURRENCY: '2', // hard-cap concurrent Remotion renders
        REMOTION_TMPDIR: './.temp/remotion', // redirect temp files away from system /tmp
      },
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

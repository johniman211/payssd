module.exports = {
  apps: [{
    name: 'payssd-api',
    script: 'server.js',
    instances: 'max', // Use all available CPU cores
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    // Logging
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Auto-restart configuration
    watch: false, // Don't watch files in production
    ignore_watch: ['node_modules', 'logs', 'uploads'],
    max_memory_restart: '1G',
    
    // Advanced PM2 features
    min_uptime: '10s',
    max_restarts: 10,
    autorestart: true,
    
    // Health monitoring
    health_check_grace_period: 3000,
    
    // Environment variables
    source_map_support: false,
    
    // Graceful shutdown
    kill_timeout: 5000,
    listen_timeout: 3000,
    
    // Merge logs from all instances
    merge_logs: true,
    
    // Time zone
    time: true
  }]
};
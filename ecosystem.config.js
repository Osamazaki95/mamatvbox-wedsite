module.exports = {
  apps: [{
    name: 'mamatvbox',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    exec_mode: 'fork',
    instances: 1,
    env: { NODE_ENV: 'production' },
  }],
};

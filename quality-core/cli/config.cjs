const path = require('path')

const root = path.join(__dirname, '../../')

module.exports = {
  paths: {
    root: root,
    logs: path.join(root, 'performance-reports/logs'),
    lighthouse: path.join(root, 'performance-reports/lighthouse'),
    reports: path.join(root, 'performance-reports/quality'),
  },
  requiredDirs: ['src', 'public', 'quality-core'],
  requiredFiles: ['package.json', 'astro.config.mjs', 'tsconfig.json'],
}

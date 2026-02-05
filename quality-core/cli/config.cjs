const path = require('path')

const root = path.join(__dirname, '../../')

module.exports = {
  paths: {
    root: root,
    logs: path.join(root, 'performance-reports/logs'),
    lighthouse: path.join(root, 'performance-reports/lighthouse'),
    reports: path.join(root, 'performance-reports/quality'),
    scripts: path.join(root, 'quality-core', 'scripts'),
  },
  requiredDirs: ['src', 'public', 'quality-core', 'quality-core/scripts'],
  requiredFiles: ['package.json', 'astro.config.mjs', 'tsconfig.json'],
}

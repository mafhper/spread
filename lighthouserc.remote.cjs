module.exports = {
  ci: {
    collect: {
      numberOfRuns: 1,
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage --disable-gpu',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.95 }],
        'categories:accessibility': ['warn', { minScore: 1.0 }],
        'categories:best-practices': ['warn', { minScore: 1.0 }],
        'categories:seo': ['warn', { minScore: 1.0 }],
        'categories:pwa': 'off',
        'first-contentful-paint': ['warn', { maxNumericValue: 1000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 1200 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.05 }],
        'total-blocking-time': ['warn', { maxNumericValue: 150 }],
        'resource-summary:script:count': ['warn', { maxNumericValue: 10 }],
        'resource-summary:script:size': ['warn', { maxNumericValue: 150000 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}

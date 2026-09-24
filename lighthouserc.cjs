// Lighthouse CI (kapittel 8): mobil ≥ 95 på Ytelse, Tilgjengelighet, Beste praksis og SEO.
// Krever bygg med BASE_PATH=/ så dist/ kan serveres fra rot: BASE_PATH=/ npm run build && npm run lhci
const minst = (kategori) => [`categories:${kategori}`, ['error', { minScore: 0.95 }]];

module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      url: ['/', '/epoker/hestesporveien/', '/nettverket/', '/signal/'],
      numberOfRuns: 3,
      chromePath: process.env.CHROMIUM_PATH || undefined,
      settings: { chromeFlags: '--no-sandbox' },
    },
    assert: {
      assertions: {
        ...Object.fromEntries(['performance', 'accessibility', 'best-practices', 'seo'].map(minst)),
        // LCP-målet (< 2,0 s på 4G) varsles; poengkravene over er det som stopper bygget.
        'largest-contentful-paint': [
          'warn',
          { maxNumericValue: 2000, aggregationMethod: 'median' },
        ],
      },
    },
    upload: { target: 'filesystem', outputDir: './.lighthouseci' },
  },
};

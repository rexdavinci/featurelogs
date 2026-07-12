export const PRESETS = [
  {
    label: '✨ New Analytics Dashboard Feature',
    text: `feat: add fully responsive analytics dashboard with real-time charts.
- Configured dynamic charting engine using recharts to visualize weekly SaaS revenue.
- Added CSV exports for active users, conversion rates, and monthly recurring revenue (MRR).
- Integrated with Firestore database to load historical aggregates under 120ms.
- Fixed a bug where negative values caused charts to collapse.
- Super proud of this! Tested with 20 users and they love the layout.`
  },
  {
    label: '🐛 Authentication Session Fix',
    text: `fix: resolved infinite token re-fetch and active session expiration bugs.
- Stopped duplicate fetch requests happening on layout component mounting.
- Corrected state mismatch inside cookies where token was set to expire in 1 hour instead of 30 days.
- Added a friendly warning notification banner before session times out.
- Cleaned up leftover terminal logs in production.`
  },
  {
    label: '⚡ Performance Optimizations',
    text: `perf: sped up image asset compression and static rendering latency.
- Optimized responsive image compression in cloud storage, reducing payloads by 72%.
- Added aggressive browser caching headers (Cache-Control max-age=31536000) for media.
- Lazy-loaded heavy visual widgets inside workspace sidebar to decrease first contentful paint (FCP) from 3.2s to 1.1s.`
  }
];
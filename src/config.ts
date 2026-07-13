// Demo mode: the site runs on sample data, so real bookings/payments are
// disabled and a demo banner is shown site-wide. This is ON by default.
// AT REAL LAUNCH: set VITE_DEMO_MODE=false in the frontend's Render env
// (and populate real content) to enable bookings + hide the banner.
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== 'false'

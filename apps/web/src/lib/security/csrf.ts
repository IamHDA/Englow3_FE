/**
 * The header every browser call to this app's own API routes carries.
 *
 * The session now lives in a cookie, which a browser attaches to any request
 * to this origin - including one a hostile page forces. A cross-site page
 * cannot add a custom header without a CORS preflight, and these routes
 * answer no preflight, so requiring the header (and a same-origin `Origin`)
 * closes that door. Shared by the client that sends it and the server that
 * checks it so the two cannot drift apart.
 */
export const CSRF_HEADER = "x-englow-request";
export const CSRF_VALUE = "1";

/**
 * The apex that hosts every free-tier tenant site as `<orgSiteName>.<TENANT_ROOT_DOMAIN>`.
 * The `apps/cio-tenant-router` Cloudflare Worker terminates traffic for this zone and forwards
 * to the dashboard service. Marketing apex is intentionally separate.
 */
export const TENANT_ROOT_DOMAIN = 'kai-it.pro';

/** The marketing / admin / api zone. */
export const BRAND_ROOT_DOMAIN = 'kai-it.pro';

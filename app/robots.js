import { SITE } from "@/lib/site";

// Public pages are indexable. The app, the API, personal availability links and invitations are not.
export default function robots() {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/dashboard", "/api/", "/r/", "/join/", "/reset-password", "/auth/"] }],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}

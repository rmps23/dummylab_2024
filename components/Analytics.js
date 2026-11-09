import Script from "next/script";

// Privacy-friendly analytics (no cookies, no personal data). Works with Umami (cloud free plan or self-hosted):
// set NEXT_PUBLIC_ANALYTICS_SRC (the script URL) and NEXT_PUBLIC_ANALYTICS_ID (the website id). Empty = off.
export default function Analytics() {
  const src = process.env.NEXT_PUBLIC_ANALYTICS_SRC;
  const id = process.env.NEXT_PUBLIC_ANALYTICS_ID;
  if (!src || !id) return null;
  return <Script src={src} data-website-id={id} data-do-not-track="true" strategy="afterInteractive" />;
}

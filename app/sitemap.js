import { SITE } from "@/lib/site";

export default function sitemap() {
  const pages = [
    { path: "", priority: 1, changeFrequency: "monthly" },
    { path: "/pricing", priority: 0.8, changeFrequency: "monthly" },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  ];
  return pages.map((p) => ({ url: `${SITE.url}${p.path}`, changeFrequency: p.changeFrequency, priority: p.priority }));
}

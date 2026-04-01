import { useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";

interface SEOHeadProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: string;
  jsonLd?: object | object[];
  noindex?: boolean;
}

const SEOHead = ({ title, description, path, image, type = "website", jsonLd, noindex }: SEOHeadProps) => {
  const siteUrl = "https://aboutraveller.com";
  const fullUrl = `${siteUrl}${path}`;
  const { lang } = useLanguage();
  const fullTitle = title.includes("About Traveller") ? title : `${title} | About Traveller`;

  useEffect(() => {
    document.title = fullTitle;

    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("name", "description", description);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", fullUrl);
    setMeta("property", "og:type", type);
    setMeta("property", "og:locale", lang === "el" ? "el_GR" : "en_US");
    if (image) {
      setMeta("property", "og:image", image);
      setMeta("name", "twitter:image", image);
    }
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description);

    const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (canonical) canonical.href = fullUrl;

    if (noindex) {
      setMeta("name", "robots", "noindex, nofollow");
    }

    // JSON-LD
    document.querySelectorAll('script[data-seo-jsonld]').forEach(el => el.remove());
    if (jsonLd) {
      const items = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      items.forEach(ld => {
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.setAttribute("data-seo-jsonld", "true");
        script.textContent = JSON.stringify(ld);
        document.head.appendChild(script);
      });
    }
  }, [fullTitle, description, fullUrl, type, lang, image, jsonLd, noindex]);

  return null;
};

export default SEOHead;

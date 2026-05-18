(function () {
  const SITE_URL = "https://fixed-cost-checker.vercel.app/";
  const pagePath = location.pathname.split("/").pop() || "index.html";
  const canonical = document.querySelector('link[rel="canonical"]')?.href || new URL(pagePath, SITE_URL).href;
  const title = document.title || "固定費削減診断";
  const description = document.querySelector('meta[name="description"]')?.content || "";

  function addJsonLd(data) {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }

  addJsonLd({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "固定費削減診断",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: title.replace("｜固定費削減診断", ""),
        item: canonical,
      },
    ],
  });

  if (pagePath === "index.html") {
    addJsonLd({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "固定費削減診断",
      url: SITE_URL,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Any",
      description,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "JPY",
      },
    });
  }

  if (pagePath.startsWith("article-")) {
    addJsonLd({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title.replace("｜固定費削減診断", ""),
      description,
      mainEntityOfPage: canonical,
      author: {
        "@type": "Organization",
        name: "固定費削減診断",
      },
      publisher: {
        "@type": "Organization",
        name: "固定費削減診断",
      },
      datePublished: "2026-05-18",
      dateModified: "2026-05-18",
    });
  }
})();

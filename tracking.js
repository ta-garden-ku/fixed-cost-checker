(function () {
  const MAX_EVENTS = 150;

  function getPageName() {
    return location.pathname.split("/").pop() || "index.html";
  }

  function saveLocalEvent(name, params) {
    const events = JSON.parse(localStorage.getItem("fixedCostCtaEvents") || "[]");
    events.push({
      name,
      ...params,
      path: getPageName(),
      at: new Date().toISOString(),
    });
    localStorage.setItem("fixedCostCtaEvents", JSON.stringify(events.slice(-MAX_EVENTS)));
  }

  function trackFixedCostEvent(name, params = {}) {
    const payload = {
      event_category: params.event_category || "engagement",
      event_label: params.event_label || params.label || "",
      page_path: location.pathname,
      ...params,
    };

    saveLocalEvent(name, payload);

    if (typeof window.gtag === "function") {
      window.gtag("event", name, payload);
    }
  }

  function getClickType(element, href) {
    const linkKey = element.dataset.linkKey || "";
    if (linkKey.includes("Affiliate") || href.includes("px.a8.net")) return "affiliate";
    if (linkKey === "lineOfficial" || href.includes("lin.ee")) return "line";
    if (href.includes("#diagnosis")) return "diagnosis";
    if (href.includes("recommended-services.html")) return "services";
    if (href.includes("article")) return "article";
    return "navigation";
  }

  function bindTracking() {
    document.querySelectorAll("a, button").forEach((element) => {
      element.addEventListener("click", () => {
        const label = element.textContent.trim().replace(/\s+/g, " ").slice(0, 80);
        const href = element.getAttribute("href") || "";
        const linkKey = element.dataset.linkKey || "";
        const clickType = getClickType(element, href);
        const basePayload = {
          label,
          event_label: label,
          link_url: href,
          link_key: linkKey,
          click_type: clickType,
        };

        trackFixedCostEvent("cta_click", basePayload);

        if (clickType === "affiliate") {
          trackFixedCostEvent("affiliate_click", {
            ...basePayload,
            event_category: "monetization",
          });
        }

        if (clickType === "line") {
          trackFixedCostEvent("line_click", {
            ...basePayload,
            event_category: "lead",
          });
        }

        if (clickType === "diagnosis") {
          trackFixedCostEvent("diagnosis_entry_click", {
            ...basePayload,
            event_category: "lead",
            source_page: getPageName(),
          });
        }

        if (clickType === "diagnosis" && getPageName().startsWith("article")) {
          trackFixedCostEvent("article_to_diagnosis_click", {
            ...basePayload,
            event_category: "lead",
            source_article: getPageName(),
          });
        }
      });
    });
  }

  window.trackFixedCostEvent = trackFixedCostEvent;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindTracking);
  } else {
    bindTracking();
  }
})();

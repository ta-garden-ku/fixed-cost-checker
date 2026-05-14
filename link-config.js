const linkMap = {
  lineOfficial: () => window.SiteConfig?.lineOfficialUrl,
  simAffiliate: () => window.SiteConfig?.affiliate?.sim,
  insuranceAffiliate: () => window.SiteConfig?.affiliate?.insurance,
  energyAffiliate: () => window.SiteConfig?.affiliate?.energy,
  internetAffiliate: () => window.SiteConfig?.affiliate?.internet,
  consultationForm: () => window.SiteConfig?.forms?.consultation,
};

document.querySelectorAll("[data-link-key]").forEach((link) => {
  const resolver = linkMap[link.dataset.linkKey];
  const url = resolver ? resolver() : "";
  if (url) {
    link.href = url;
  }
});

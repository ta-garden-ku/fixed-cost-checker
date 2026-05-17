const linkMap = {
  lineOfficial: () => window.SiteConfig?.lineOfficialUrl,
  simAffiliate: () => window.SiteConfig?.affiliate?.sim,
  insuranceAffiliate: () => window.SiteConfig?.affiliate?.insurance,
  energyAffiliate: () => window.SiteConfig?.affiliate?.energy,
  gasAffiliate: () => window.SiteConfig?.affiliate?.gas,
  internetAffiliate: () => window.SiteConfig?.affiliate?.internet,
  internetWifiAffiliate: () => window.SiteConfig?.affiliate?.internetWifi,
  budgetAffiliate: () => window.SiteConfig?.affiliate?.budget,
  creditCardAffiliate: () => window.SiteConfig?.affiliate?.creditCard,
  securitiesAffiliate: () => window.SiteConfig?.affiliate?.securities,
  consultationForm: () => window.SiteConfig?.forms?.consultation,
};

document.querySelectorAll("[data-link-key]").forEach((link) => {
  const resolver = linkMap[link.dataset.linkKey];
  const url = resolver ? resolver() : "";
  if (url) {
    link.href = url;
  }
});

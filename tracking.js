document.querySelectorAll("a, button").forEach((element) => {
  element.addEventListener("click", () => {
    const label = element.textContent.trim().replace(/\s+/g, " ").slice(0, 80);
    const href = element.getAttribute("href") || "";
    const events = JSON.parse(localStorage.getItem("fixedCostCtaEvents") || "[]");
    events.push({
      label,
      href,
      path: location.pathname.split("/").pop() || "index.html",
      at: new Date().toISOString(),
    });
    localStorage.setItem("fixedCostCtaEvents", JSON.stringify(events.slice(-100)));
  });
});

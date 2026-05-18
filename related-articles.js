(function () {
  const articles = window.FixedCostContent?.articles || [];
  const current = location.pathname.split("/").pop() || "index.html";
  const currentArticle = articles.find((article) => article.href === current);
  const articleBody = document.querySelector(".article-body");

  if (!currentArticle || !articleBody) return;

  const related = articles
    .filter((article) => article.href !== current)
    .map((article) => {
      const score = article.tags.filter((tag) => currentArticle.tags.includes(tag)).length;
      return { ...article, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const section = document.createElement("section");
  section.className = "related-section";
  section.innerHTML = `
    <p class="eyebrow">Next Reading</p>
    <h2>次に読みたい固定費チェック</h2>
    <div class="related-grid">
      ${related
        .map(
          (article) => `
            <a class="related-card" href="${article.href}">
              <span>${article.category}</span>
              <b>${article.title}</b>
              <small>${article.description}</small>
            </a>
          `
        )
        .join("")}
    </div>
    <div class="article-next-cta">
      <div>
        <h3>読んだ内容を、自分の金額で確認する</h3>
        <p>スマホ代、サブスク、光熱費、子育て固定費を入力すると、年間コストと見直し候補がわかります。</p>
      </div>
      <a class="button primary" href="index.html#diagnosis">無料で診断する</a>
    </div>
  `;

  articleBody.appendChild(section);
})();

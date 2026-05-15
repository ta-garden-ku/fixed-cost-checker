function buildResultText(result) {
  if (!result) {
    return [
      "固定費削減診断の結果はまだ保存されていません。",
      "",
      "先に診断を最後まで進めてから、このページに戻ってください。",
      "https://fixed-cost-checker.vercel.app/#diagnosis",
    ].join("\n");
  }

  const priorities = result.priorities?.length
    ? result.priorities
        .map((item, index) => `${index + 1}. ${item.key}: ${item.monthly}/月の見直し余地`)
        .join("\n")
    : "大きな見直し候補は少なめです。";

  return [
    "固定費削減診断の結果メモ",
    "",
    `削減可能性: ${result.possibleMonthly}/月`,
    `年間では: ${result.possibleYearly}`,
    `10年では: ${result.tenYearImpact}`,
    "",
    `毎月の固定費: ${result.fixedMonthly}`,
    `年間固定費: ${result.fixedYearly}`,
    `サブスク年間額: ${result.subYearly}`,
    `固定費比率: ${result.fixedRatio}`,
    `家計危険度: ${result.dangerScore}/100`,
    "",
    "優先して見直す項目",
    priorities,
    "",
    "診断サイト",
    "https://fixed-cost-checker.vercel.app/",
  ].join("\n");
}

const savedResult = JSON.parse(localStorage.getItem("fixedCostLatestResult") || "null");
const resultText = buildResultText(savedResult);
const textElement = document.getElementById("savedResultText");
const noticeElement = document.getElementById("savedResultNotice");
const shareLink = document.getElementById("shareSavedResult");
const copyButton = document.getElementById("copySavedResult");
const statusElement = document.getElementById("copySavedStatus");

textElement.textContent = resultText;
shareLink.href = `https://line.me/R/share?text=${encodeURIComponent(resultText)}`;

if (savedResult) {
  noticeElement.textContent = "直近の診断結果を読み込みました。下のボタンからコピーまたはLINE共有できます。";
} else {
  noticeElement.textContent = "まだ診断結果がありません。先に診断を最後まで進めてください。";
}

copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(resultText);
    statusElement.textContent = "コピーしました。LINEを開いて貼り付ければ保存できます。";
  } catch {
    statusElement.textContent = "コピーできない場合は、表示された文章を長押ししてコピーしてください。";
  }
});

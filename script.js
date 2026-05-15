const moneyFormatter = new Intl.NumberFormat("ja-JP", { maximumFractionDigits: 0 });

const fixedFields = [
  "housing",
  "mobile",
  "internet",
  "electric",
  "gas",
  "water",
  "insurance",
  "car",
  "gym",
  "videoSub",
  "musicSub",
  "mangaSub",
  "learningSub",
  "cloudSub",
  "otherFixed",
];

const subscriptionSummaryFields = ["videoSub", "musicSub", "mangaSub", "learningSub", "cloudSub"];

const fieldLabels = {
  housing: "家賃・住宅ローン",
  mobile: "スマホ代",
  internet: "インターネット代",
  electric: "電気代",
  gas: "ガス代",
  water: "水道代",
  insurance: "保険料",
  car: "車関連費",
  gym: "ジム・習い事",
  videoSub: "動画サブスク",
  musicSub: "音楽サブスク",
  mangaSub: "漫画・電子書籍",
  learningSub: "学習系サブスク",
  cloudSub: "クラウド・アプリ",
  otherFixed: "その他固定費",
};

const frequencyLabels = {
  daily: "毎日使う",
  weekly: "週に数回",
  monthly: "月に数回",
  rarely: "ほぼ使っていない",
  forgot: "契約していることを忘れていた",
};

const presetServices = [
  { name: "Amazon Prime", amount: 600, frequency: "weekly" },
  { name: "Netflix", amount: 1590, frequency: "monthly" },
  { name: "U-NEXT", amount: 2189, frequency: "monthly" },
  { name: "Disney+", amount: 1140, frequency: "weekly" },
  { name: "Hulu", amount: 1026, frequency: "monthly" },
  { name: "YouTube Premium", amount: 1280, frequency: "daily" },
  { name: "Spotify", amount: 1080, frequency: "daily" },
  { name: "Apple Music", amount: 1080, frequency: "weekly" },
  { name: "LINE MUSIC", amount: 1080, frequency: "monthly" },
  { name: "iCloud+", amount: 150, frequency: "daily" },
  { name: "Google One", amount: 250, frequency: "weekly" },
  { name: "Microsoft 365", amount: 1490, frequency: "weekly" },
  { name: "Adobe Creative Cloud", amount: 3280, frequency: "weekly" },
  { name: "Canva Pro", amount: 1500, frequency: "weekly" },
  { name: "ChatGPT", amount: 3000, frequency: "weekly" },
  { name: "Notion AI", amount: 1500, frequency: "monthly" },
  { name: "Nintendo Switch Online", amount: 200, frequency: "monthly" },
  { name: "PlayStation Plus", amount: 850, frequency: "monthly" },
  { name: "ジム・フィットネス", amount: 8800, frequency: "rarely" },
  { name: "新聞・ニュース", amount: 980, frequency: "monthly" },
  { name: "マンガ・雑誌", amount: 980, frequency: "monthly" },
  { name: "セキュリティソフト", amount: 500, frequency: "forgot" },
];

let currentStep = 1;
let subscriptions = [
  { name: "Amazon Prime", amount: 600, frequency: "weekly" },
  { name: "Netflix", amount: 1590, frequency: "monthly" },
];

const $ = (id) => document.getElementById(id);

function yen(value) {
  return `${moneyFormatter.format(Math.round(Number.isFinite(value) ? value : 0))}円`;
}

function readMoney(id) {
  const value = Number($(id).value);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getSubscriptionPriority(frequency) {
  if (frequency === "rarely" || frequency === "forgot") return "高";
  if (frequency === "monthly") return "中";
  return "低";
}

function getSubscriptionReductionRate(frequency) {
  if (frequency === "forgot") return 1;
  if (frequency === "rarely") return 0.8;
  if (frequency === "monthly") return 0.5;
  return 0;
}

function futureValueOfMonthlySaving(monthlySaving, annualRate, years) {
  const monthlyRate = annualRate / 12;
  const months = years * 12;
  if (monthlyRate === 0) return monthlySaving * months;
  return monthlySaving * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
}

function readForm() {
  const fixed = fixedFields.reduce((values, id) => {
    values[id] = readMoney(id);
    return values;
  }, {});

  return {
    household: $("household").value,
    ageGroup: $("ageGroup").value,
    income: readMoney("income"),
    savings: readMoney("savings"),
    fixed,
    subscriptions: subscriptions
      .map((sub) => ({
        name: sub.name.trim() || "未入力のサブスク",
        amount: Number(sub.amount) > 0 ? Number(sub.amount) : 0,
        frequency: sub.frequency,
      }))
      .filter((sub) => sub.amount > 0 || sub.name !== "未入力のサブスク"),
  };
}

function calculateResult(data) {
  const subscriptionSummaryMonthly = subscriptionSummaryFields.reduce((sum, id) => sum + data.fixed[id], 0);
  const nonSubscriptionFixedMonthly = Object.entries(data.fixed)
    .filter(([id]) => !subscriptionSummaryFields.includes(id))
    .reduce((sum, [, value]) => sum + value, 0);
  const detailedSubMonthly = data.subscriptions.reduce((sum, sub) => sum + sub.amount, 0);
  const subMonthly = Math.max(subscriptionSummaryMonthly, detailedSubMonthly);
  const fixedMonthly = nonSubscriptionFixedMonthly + subMonthly;
  const utilities = data.fixed.electric + data.fixed.gas + data.fixed.water;
  const opportunities = [];

  if (data.fixed.mobile >= 8000) {
    opportunities.push({
      key: "スマホ代",
      monthly: data.fixed.mobile * 0.3,
      reason: "8,000円以上のため、プラン変更で削減できる可能性があります。",
      cta: "格安SIM・スマホプラン比較へ",
    });
  }

  if (data.fixed.internet >= 6000) {
    opportunities.push({
      key: "インターネット代",
      monthly: data.fixed.internet * 0.2,
      reason: "6,000円以上のため、回線やセット割の確認余地があります。",
      cta: "ネット回線の見直しへ",
    });
  }

  if (data.fixed.insurance >= 15000) {
    opportunities.push({
      key: "保険料",
      monthly: data.fixed.insurance * 0.2,
      reason: "保険料は一度見直すだけで、長期的な削減効果が大きい項目です。",
      cta: "保険見直し相談へ",
    });
  }

  if (utilities >= 25000) {
    opportunities.push({
      key: "光熱費",
      monthly: utilities * 0.1,
      reason: "電気・ガス・水道の合計が重く、料金プランの比較余地があります。",
      cta: "電気ガス比較へ",
    });
  }

  data.subscriptions.forEach((sub) => {
    const rate = getSubscriptionReductionRate(sub.frequency);
    if (rate > 0) {
      opportunities.push({
        key: sub.name,
        monthly: sub.amount * rate,
        reason: `${frequencyLabels[sub.frequency]}ため、見直し優先度が高めです。`,
        cta: "サブスク解約候補",
      });
    }
  });

  opportunities.sort((a, b) => b.monthly - a.monthly);

  const possibleMonthly = opportunities.reduce((sum, item) => sum + item.monthly, 0);
  const fixedRatio = data.income > 0 ? (fixedMonthly / data.income) * 100 : 0;
  const savingRatio = data.income > 0 ? (data.savings / data.income) * 100 : 0;
  const unusedSubCount = data.subscriptions.filter((sub) => sub.frequency === "rarely" || sub.frequency === "forgot").length;

  let dangerScore = 0;
  if (fixedRatio >= 50) dangerScore += 50;
  else if (fixedRatio >= 35) dangerScore += 30 + (fixedRatio - 35) * 1.3;
  else dangerScore += fixedRatio * 0.7;

  if (savingRatio < 5) dangerScore += 25;
  else if (savingRatio < 10) dangerScore += 12;

  dangerScore += Math.min(25, unusedSubCount * 8);
  dangerScore = Math.round(clamp(dangerScore, 0, 100));

  const savingScore = Math.round(clamp(100 - dangerScore + Math.min(20, savingRatio), 0, 100));

  return {
    fixedMonthly,
    fixedYearly: fixedMonthly * 12,
    subMonthly,
    subYearly: subMonthly * 12,
    possibleMonthly,
    possibleYearly: possibleMonthly * 12,
    fixedRatio,
    savingRatio,
    savingScore,
    dangerScore,
    unusedSubCount,
    opportunities,
    future3: futureValueOfMonthlySaving(possibleMonthly, 0.03, 10),
    future5: futureValueOfMonthlySaving(possibleMonthly, 0.05, 10),
  };
}

function getMainComment(result) {
  if (result.fixedRatio >= 50) {
    return "収入に対して固定費が重く、毎月の自由度を下げている可能性があります。まずは上位3項目から見直すと効果が見えやすいです。";
  }
  if (result.unusedSubCount >= 2) {
    return `使っていないサブスクだけで、年間${yen(result.opportunities.filter((item) => item.cta === "サブスク解約候補").reduce((sum, item) => sum + item.monthly * 12, 0))}前後の支出になっている可能性があります。`;
  }
  if (result.possibleYearly >= 100000) {
    return "見直し候補の金額が大きめです。月額では小さく見えても、年間・10年で見ると家計への影響がはっきり出ます。";
  }
  return "大きな危険サインは強くありませんが、固定費は一度整えると効果が続きやすい支出です。";
}

function getReasons(result) {
  const reasons = [
    {
      title: "固定費は一度下げると効果が続きます",
      text: `毎月${yen(result.possibleMonthly)}の削減は、年間${yen(result.possibleYearly)}、10年で${yen(result.possibleYearly * 10)}の差になります。`,
    },
    {
      title: "小さなサブスクほど見落とされやすいです",
      text: "月額数百円でも、複数契約していると年間コストは想像以上に膨らみます。",
    },
    {
      title: "相談前に優先順位があると迷いにくくなります",
      text: "診断結果をもとに、スマホ・保険・光熱費・サブスクのどこから始めるか整理できます。",
    },
  ];

  if (result.fixedRatio >= 50) {
    reasons.unshift({
      title: "固定費比率が高めです",
      text: "収入の半分以上が固定費に向かうと、貯金や急な支出への余裕が小さくなりやすいです。",
    });
  }

  return reasons.slice(0, 4);
}

function renderPresetOptions() {
  $("presetService").innerHTML = presetServices
    .map((service, index) => `<option value="${index}">${service.name} / ${yen(service.amount)}</option>`)
    .join("");
}

function renderSubscriptions() {
  $("subscriptionList").innerHTML = subscriptions
    .map(
      (sub, index) => `
        <div class="subscription-row" data-index="${index}">
          <label class="field">
            <span>サブスク名</span>
            <input data-sub-field="name" value="${escapeHtml(sub.name)}" maxlength="40" />
          </label>
          <label class="field">
            <span>月額料金</span>
            <input data-sub-field="amount" type="number" min="0" step="10" value="${sub.amount}" />
          </label>
          <label class="field">
            <span>利用頻度</span>
            <select data-sub-field="frequency">
              ${Object.entries(frequencyLabels)
                .map(
                  ([value, label]) => `<option value="${value}" ${value === sub.frequency ? "selected" : ""}>${label}</option>`,
                )
                .join("")}
            </select>
          </label>
          <button class="remove-button" type="button" data-remove-sub="${index}" aria-label="${escapeHtml(sub.name)}を削除">×</button>
        </div>
      `,
    )
    .join("");

  $("subLimitText").textContent =
    subscriptions.length >= 10 ? "最大10件まで入力済みです。" : `あと${10 - subscriptions.length}件追加できます。`;
}

function renderResults() {
  const data = readForm();
  const result = calculateResult(data);
  const dangerRing = $("dangerRing");
  const dangerAngle = `${result.dangerScore * 3.6}deg`;

  dangerRing.classList.toggle("warning", result.dangerScore >= 35 && result.dangerScore < 70);
  dangerRing.classList.toggle("danger", result.dangerScore >= 70);
  dangerRing.style.setProperty("--danger-angle", dangerAngle);

  $("dangerScore").textContent = result.dangerScore;
  $("mainComment").textContent = getMainComment(result);
  $("possibleYearly").textContent = yen(result.possibleYearly);
  $("fixedMonthly").textContent = yen(result.fixedMonthly);
  $("fixedYearly").textContent = yen(result.fixedYearly);
  $("subYearly").textContent = yen(result.subYearly);
  $("fixedRatio").textContent = `${result.fixedRatio.toFixed(1)}%`;
  $("savingScore").textContent = result.savingScore;
  $("monthlyPhrase").textContent = yen(result.possibleMonthly);
  $("yearlyPhrase").textContent = yen(result.possibleYearly);
  $("tenYearPhrase").textContent = yen(result.possibleYearly * 10);
  $("impact1y").textContent = yen(result.possibleYearly);
  $("impact5y").textContent = yen(result.possibleYearly * 5);
  $("impact10y").textContent = yen(result.possibleYearly * 10);
  $("impact3p").textContent = yen(result.future3);
  $("impact5p").textContent = yen(result.future5);

  localStorage.setItem(
    "fixedCostLatestResult",
    JSON.stringify({
      savedAt: new Date().toISOString(),
      possibleMonthly: yen(result.possibleMonthly),
      possibleYearly: yen(result.possibleYearly),
      tenYearImpact: yen(result.possibleYearly * 10),
      fixedMonthly: yen(result.fixedMonthly),
      fixedYearly: yen(result.fixedYearly),
      subYearly: yen(result.subYearly),
      fixedRatio: `${result.fixedRatio.toFixed(1)}%`,
      dangerScore: result.dangerScore,
      priorities: result.opportunities.slice(0, 3).map((item) => ({
        key: item.key,
        monthly: yen(item.monthly),
        reason: item.reason,
      })),
    }),
  );

  $("priorityList").innerHTML = result.opportunities.length
    ? result.opportunities
        .slice(0, 3)
        .map(
          (item) => `
            <li>
              <b>${escapeHtml(item.key)}：${yen(item.monthly)}/月の削減余地</b>
              <span>${escapeHtml(item.reason)} ${escapeHtml(item.cta)}</span>
            </li>
          `,
        )
        .join("")
    : `<li><b>大きな見直し候補は少なめです</b><span>サブスクの利用頻度だけ定期的に確認しましょう。</span></li>`;

  $("reasonList").innerHTML = getReasons(result)
    .map((reason) => `<li><b>${reason.title}</b><span>${reason.text}</span></li>`)
    .join("");

  $("subscriptionTable").innerHTML = data.subscriptions.length
    ? data.subscriptions
        .map((sub) => {
          const yearly = sub.amount * 12;
          const priority = getSubscriptionPriority(sub.frequency);
          const priorityClass = priority === "高" ? "high" : priority === "中" ? "medium" : "low";
          return `
            <tr>
              <td>${escapeHtml(sub.name)}</td>
              <td>${yen(sub.amount)}</td>
              <td>${yen(yearly)}</td>
              <td>${yen(yearly * 5)}</td>
              <td>${yen(yearly * 10)}</td>
              <td><span class="priority-badge ${priorityClass}">${priority}</span></td>
            </tr>
          `;
        })
        .join("")
    : `<tr><td colspan="6">サブスク詳細が未入力です。</td></tr>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function setStep(step) {
  currentStep = clamp(step, 1, 4);
  document.querySelectorAll(".form-step").forEach((panel) => {
    panel.classList.toggle("active", Number(panel.dataset.step) === currentStep);
  });
  document.querySelectorAll(".step-tab").forEach((tab) => {
    tab.classList.toggle("active", Number(tab.dataset.stepTarget) === currentStep);
  });
  $("prevStep").style.visibility = currentStep === 1 ? "hidden" : "visible";
  $("nextStep").textContent = currentStep === 4 ? "入力を見直す" : currentStep === 3 ? "診断結果を見る" : "次へ進む";
  if (currentStep === 4) renderResults();
}

function validateVisibleStep() {
  const activeStep = document.querySelector(`.form-step[data-step="${currentStep}"]`);
  let valid = true;
  activeStep.querySelectorAll("input[type='number']").forEach((input) => {
    const field = input.closest(".field");
    const value = Number(input.value);
    const isValid = Number.isFinite(value) && value >= 0;
    field.classList.toggle("error", !isValid);
    if (!isValid) valid = false;
  });
  return valid;
}

function addSubscription(subscription) {
  if (subscriptions.length >= 10) return;
  subscriptions.push(subscription);
  renderSubscriptions();
  renderResults();
}

function syncSubscriptionRow(row) {
  const index = Number(row.dataset.index);
  row.querySelectorAll("[data-sub-field]").forEach((input) => {
    const field = input.dataset.subField;
    subscriptions[index][field] = field === "amount" ? Number(input.value) || 0 : input.value;
  });
}

document.querySelectorAll(".step-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    if (!validateVisibleStep()) return;
    setStep(Number(tab.dataset.stepTarget));
  });
});

$("nextStep").addEventListener("click", () => {
  if (currentStep === 4) {
    setStep(1);
    return;
  }
  if (!validateVisibleStep()) return;
  setStep(currentStep + 1);
});

$("prevStep").addEventListener("click", () => setStep(currentStep - 1));

$("addPreset").addEventListener("click", () => {
  const preset = presetServices[Number($("presetService").value)];
  addSubscription({ ...preset });
});

$("addCustom").addEventListener("click", () => {
  addSubscription({ name: "", amount: 0, frequency: "monthly" });
});

$("subscriptionList").addEventListener("input", (event) => {
  const row = event.target.closest(".subscription-row");
  if (!row) return;
  syncSubscriptionRow(row);
  renderResults();
});

$("subscriptionList").addEventListener("change", (event) => {
  const row = event.target.closest(".subscription-row");
  if (!row) return;
  syncSubscriptionRow(row);
  renderResults();
});

$("subscriptionList").addEventListener("click", (event) => {
  const removeButton = event.target.closest("[data-remove-sub]");
  if (!removeButton) return;
  subscriptions.splice(Number(removeButton.dataset.removeSub), 1);
  renderSubscriptions();
  renderResults();
});

document.querySelectorAll("input, select").forEach((input) => {
  input.addEventListener("input", () => {
    if (currentStep === 4) renderResults();
  });
  input.addEventListener("change", () => {
    if (currentStep === 4) renderResults();
  });
});

renderPresetOptions();
renderSubscriptions();
setStep(1);

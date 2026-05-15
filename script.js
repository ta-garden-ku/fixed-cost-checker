const yen = new Intl.NumberFormat("ja-JP");

const $ = (id) => document.getElementById(id);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const state = {
  step: 1,
  subscriptions: [],
};

const presetServices = [
  { name: "Amazon Prime", price: 600, frequency: "weekly" },
  { name: "Netflix", price: 1490, frequency: "weekly" },
  { name: "U-NEXT", price: 2189, frequency: "monthly" },
  { name: "Disney+", price: 990, frequency: "monthly" },
  { name: "Hulu", price: 1026, frequency: "monthly" },
  { name: "Spotify", price: 980, frequency: "daily" },
  { name: "Apple Music", price: 1080, frequency: "daily" },
  { name: "YouTube Premium", price: 1280, frequency: "weekly" },
  { name: "Kindle Unlimited", price: 980, frequency: "monthly" },
  { name: "Notion AI", price: 1500, frequency: "monthly" },
  { name: "Canva", price: 1500, frequency: "monthly" },
  { name: "オンライン学習", price: 3000, frequency: "monthly" },
  { name: "知育アプリ", price: 1500, frequency: "monthly" },
];

const fixedCostFields = [
  ["housing", "家賃・住宅ローン"],
  ["mobile", "スマホ代"],
  ["internet", "インターネット代"],
  ["electric", "電気代"],
  ["gas", "ガス代"],
  ["water", "水道代"],
  ["insurance", "保険料"],
  ["car", "車関連費"],
  ["gym", "ジム・習い事"],
  ["otherFixed", "その他固定費"],
];

const subscriptionSummaryFields = [
  ["videoSub", "動画サブスク"],
  ["musicSub", "音楽サブスク"],
  ["mangaSub", "漫画・電子書籍"],
  ["learningSub", "学習系サブスク"],
  ["cloudSub", "クラウド・アプリ"],
];

const childcareFields = [
  ["preschoolCost", "保育園・幼稚園関連費"],
  ["afterSchoolCost", "学童・放課後サービス"],
  ["schoolCost", "学校関連費"],
  ["cramSchoolCost", "塾代"],
  ["lessonsCost", "習い事"],
  ["onlineLearningCost", "オンライン学習サービス"],
  ["childAppCost", "子ども向け動画・知育アプリ"],
  ["childMobileCost", "子どものスマホ代"],
  ["childInsuranceCost", "子どもの保険"],
  ["educationSavingsCost", "教育資金積立"],
  ["childSubscriptionCost", "子ども用品の定期購入"],
  ["schoolLunchCost", "給食費"],
  ["transportCost", "送迎・交通費"],
  ["otherChildcareCost", "その他子育て固定費"],
];

const childAgeComments = {
  preschool:
    "未就学児の時期は、保育・幼稚園関連費や子ども用品の定期購入が増えやすい時期です。毎月なんとなく続いている定期購入や知育アプリを整理するだけでも、家計に余裕が生まれる可能性があります。",
  elementary:
    "小学生になると、習い事、学童、通信教育、子ども向けサブスクなどが増えやすくなります。すべてを削るのではなく、子どもが本当に続けたいものと、利用頻度が低いものを分けて考えることが大切です。",
  junior:
    "中学生以降は、塾代、部活動関連費、スマホ代などが家計に影響しやすくなります。通信費や保険、使っていないサブスクを見直すことで、教育費を守る余地を作れる可能性があります。",
  high:
    "高校生になると、塾・予備校、交通費、スマホ代、進学準備費用などが重なりやすくなります。教育費そのものを削るよりも、通信費、保険、光熱費など家族全体の固定費を見直すのがおすすめです。",
  university:
    "大学生の時期は、学費、仕送り、交通費、通信費など大きな支出が発生しやすい時期です。家族全体の固定費を整理し、長期で続く契約の優先順位を見直すことが重要です。",
  multiple:
    "複数の年齢層が重なる時期は、教育費・通信費・保険・移動費が同時に増えやすくなります。家族に必要な支出を守りながら、長く続く固定費から整えるのが現実的です。",
};

function numberValue(id) {
  const element = $(id);
  if (!element) return 0;
  const value = Number(String(element.value || "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function checkedValues(name) {
  return $$(`input[name="${name}"]:checked`).map((input) => input.value);
}

function formatYen(value) {
  return `${yen.format(Math.round(value))}円`;
}

function formatMan(value) {
  return `${yen.format(Math.round(value / 10000))}万円`;
}

function futureValueMonthly(monthlyAmount, annualRate, years) {
  const months = years * 12;
  const monthlyRate = annualRate / 12;
  if (!monthlyAmount || monthlyAmount <= 0) return 0;
  return monthlyAmount * (((1 + monthlyRate) ** months - 1) / monthlyRate);
}

function getFormData() {
  const household = $("household")?.value || "";
  const income = numberValue("income");
  const savings = numberValue("savings");
  const childrenCount = Math.max(1, numberValue("childrenCount") || 1);
  const fixed = Object.fromEntries(fixedCostFields.map(([id]) => [id, numberValue(id)]));
  const subSummary = Object.fromEntries(subscriptionSummaryFields.map(([id]) => [id, numberValue(id)]));
  const childcare = Object.fromEntries(childcareFields.map(([id]) => [id, numberValue(id)]));

  return {
    household,
    ageGroup: $("ageGroup")?.value || "",
    income,
    savings,
    childrenCount,
    childAgeGroups: checkedValues("childAgeGroups"),
    concerns: checkedValues("familyConcerns"),
    onlineLearningUsage: $("onlineLearningUsage")?.value || "weekly",
    fixed,
    subSummary,
    childcare,
  };
}

function getSubscriptionSummaryMonthly(data) {
  return Object.values(data.subSummary).reduce((sum, value) => sum + value, 0);
}

function getDetailedSubscriptionMonthly() {
  return state.subscriptions.reduce((sum, item) => sum + item.price, 0);
}

function getSubscriptionMonthly(data) {
  return Math.max(getSubscriptionSummaryMonthly(data), getDetailedSubscriptionMonthly());
}

function getChildcareMonthly(data) {
  if (data.household !== "family") return 0;
  return Object.values(data.childcare).reduce((sum, value) => sum + value, 0);
}

function getBaseFixedMonthly(data) {
  const fixedBase = Object.values(data.fixed).reduce((sum, value) => sum + value, 0);
  return fixedBase + getSubscriptionMonthly(data) + getChildcareMonthly(data);
}

function addOpportunity(items, label, monthly, reason, type = "saving") {
  if (!monthly || monthly <= 0) return;
  items.push({
    label,
    monthly,
    yearly: monthly * 12,
    reason,
    type,
  });
}

function calculateOpportunities(data) {
  const items = [];
  const childItems = [];
  const fixed = data.fixed;
  const childcare = data.childcare;

  if (fixed.mobile >= 8000) {
    addOpportunity(items, "スマホ代", fixed.mobile * 0.3, "格安プランや家族割の確認で見直せる可能性があります。");
  }
  if (fixed.internet >= 6000) {
    addOpportunity(items, "インターネット代", fixed.internet * 0.2, "回線プランやセット割の確認余地があります。");
  }
  if (fixed.insurance >= 15000) {
    addOpportunity(items, "保険料", fixed.insurance * 0.2, "保障内容を確認すると、長く効く固定費改善につながる可能性があります。");
  }

  const utilities = fixed.electric + fixed.gas + fixed.water;
  if (utilities >= 25000) {
    addOpportunity(items, "光熱費", utilities * 0.1, "電気・ガスの契約や使い方をまとめて確認する価値があります。");
  }

  state.subscriptions.forEach((sub) => {
    if (sub.frequency === "forgot") {
      addOpportunity(items, `${sub.name}`, sub.price, "契約していることを忘れていたサブスクは、最優先で確認したい項目です。");
    } else if (sub.frequency === "rarely") {
      addOpportunity(items, `${sub.name}`, sub.price * 0.8, "ほぼ使っていないサブスクは、年間で見ると大きな固定費になりがちです。");
    } else if (sub.frequency === "monthly") {
      addOpportunity(items, `${sub.name}`, sub.price * 0.5, "月に数回の利用なら、代替サービスや一時停止も検討できます。");
    }
  });

  if (data.household === "family") {
    const mobilePerChild = childcare.childMobileCost / Math.max(data.childrenCount, 1);
    if (mobilePerChild >= 5000) {
      addOpportunity(
        childItems,
        "子どものスマホ代",
        childcare.childMobileCost * 0.25,
        "1台あたりの通信費が高めです。家族割や低容量プランを確認すると、教育費を守る余地が生まれる可能性があります。"
      );
    }
    if (childcare.childAppCost >= 3000) {
      addOpportunity(
        childItems,
        "子ども向け動画・知育アプリ",
        childcare.childAppCost * 0.5,
        "利用頻度が低いアプリを整理すると、無理なく固定費を整えられる可能性があります。"
      );
    }
    if (childcare.onlineLearningCost >= 5000 && data.onlineLearningUsage !== "weekly") {
      addOpportunity(
        childItems,
        "オンライン学習サービス",
        childcare.onlineLearningCost * 0.5,
        "大切な学習費だからこそ、利用頻度と内容を見直して納得して選び直すのがおすすめです。"
      );
    }
    if (childcare.lessonsCost >= 30000) {
      childItems.push({
        label: "習い事",
        monthly: 0,
        yearly: 0,
        reason: "削る項目ではなく、子どもが続けたいものと利用頻度が低いものを分ける整理候補です。",
        type: "priority",
      });
    }
    if (childcare.cramSchoolCost >= 40000) {
      childItems.push({
        label: "塾代",
        monthly: 0,
        yearly: 0,
        reason: "教育費そのものを削るのではなく、家計全体とのバランスを確認したい項目です。",
        type: "priority",
      });
    }
    if (childcare.childInsuranceCost >= 5000) {
      addOpportunity(
        childItems,
        "子どもの保険",
        childcare.childInsuranceCost * 0.2,
        "家族の安心を守りながら、保障内容と重複を確認する価値があります。"
      );
    }
    if (childcare.childSubscriptionCost >= 5000) {
      addOpportunity(
        childItems,
        "子ども用品の定期購入",
        childcare.childSubscriptionCost * 0.4,
        "毎月なんとなく続いている定期購入を整理すると、家計に余白が生まれる可能性があります。"
      );
    }
  }

  return {
    all: [...items, ...childItems].sort((a, b) => b.yearly - a.yearly),
    general: items.sort((a, b) => b.yearly - a.yearly),
    child: childItems.sort((a, b) => b.yearly - a.yearly),
  };
}

function calculateScores(data, fixedMonthly, opportunities) {
  const fixedRatio = data.income > 0 ? (fixedMonthly / data.income) * 100 : 0;
  const savingRatio = data.income > 0 ? (data.savings / data.income) * 100 : 0;
  const unusedSubs = state.subscriptions.filter((sub) => ["rarely", "forgot"].includes(sub.frequency)).length;
  const childRatio = data.income > 0 ? (getChildcareMonthly(data) / data.income) * 100 : 0;

  let danger = 10;
  if (fixedRatio >= 50) danger += 45;
  else if (fixedRatio >= 35) danger += 28;
  else danger += 10;

  if (savingRatio < 5) danger += 22;
  else if (savingRatio < 10) danger += 12;

  danger += Math.min(unusedSubs * 7, 21);
  if (data.household === "family" && childRatio >= 25) danger += 8;
  if (opportunities.all.length >= 4) danger += 8;

  const savingScore = Math.max(0, Math.min(100, Math.round(100 - danger + Math.min(savingRatio * 2, 20))));

  return {
    danger: Math.max(0, Math.min(100, Math.round(danger))),
    savingScore,
    fixedRatio,
    savingRatio,
    childRatio,
    unusedSubs,
  };
}

function getMainComment(data, scores, possibleYearly) {
  if (data.household === "family") {
    return `家族に必要な支出を守りながら、毎月の固定費を整理できる状態です。見直し候補を整えると、年間${formatYen(possibleYearly)}前後を教育資金や家族の予備費に回せる可能性があります。`;
  }
  if (scores.fixedRatio >= 50) {
    return "収入に対して固定費が重く、毎月の自由度を下げている可能性があります。まずはスマホ代・保険料・サブスクから順番に確認しましょう。";
  }
  if (scores.unusedSubs >= 2) {
    return "使っていないサブスクが複数あります。小さな月額でも、年間・10年で見ると大きな固定費になります。";
  }
  if (possibleYearly > 0) {
    return "見直せる候補がいくつか見つかりました。必要な支出は残しながら、長く続く固定費から整えるのがおすすめです。";
  }
  return "固定費は比較的整っています。今後もサブスクや通信費を定期的に見直すと、家計の安定につながります。";
}

function getSubscriptionPriority(frequency) {
  if (frequency === "forgot" || frequency === "rarely") return { label: "高", className: "high" };
  if (frequency === "monthly") return { label: "中", className: "medium" };
  return { label: "低", className: "low" };
}

function getFrequencyLabel(frequency) {
  const labels = {
    daily: "毎日使う",
    weekly: "週に数回",
    monthly: "月に数回",
    rarely: "ほぼ使っていない",
    forgot: "契約していることを忘れていた",
  };
  return labels[frequency] || "月に数回";
}

function renderSteps() {
  $$(".form-step").forEach((step) => step.classList.toggle("active", Number(step.dataset.step) === state.step));
  $$(".step-tab").forEach((tab) => {
    const tabStep = Number(tab.dataset.stepTarget);
    tab.classList.toggle("active", tabStep === state.step);
    tab.classList.toggle("done", tabStep < state.step);
  });

  if ($("prevStep")) $("prevStep").disabled = state.step === 1;
  if ($("nextStep")) $("nextStep").textContent = state.step === 4 ? "もう一度診断する" : "次へ進む";
}

function goToStep(step) {
  state.step = Math.max(1, Math.min(4, step));
  if (state.step === 4) renderResults();
  renderSteps();
  $("diagnosis")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function syncFamilyVisibility() {
  const isFamily = $("household")?.value === "family";
  $("familyFields")?.classList.toggle("active", isFamily);
  $("familyCostFields")?.classList.toggle("active", isFamily);
  $("familyResults")?.classList.toggle("active", isFamily);
}

function renderPresetOptions() {
  const select = $("presetService");
  if (!select) return;
  select.innerHTML = presetServices
    .map((service, index) => `<option value="${index}">${service.name}（月${formatYen(service.price)}）</option>`)
    .join("");
}

function createSubscription(item = {}) {
  if (state.subscriptions.length >= 10) return;
  state.subscriptions.push({
    id:
      window.crypto && window.crypto.randomUUID
        ? window.crypto.randomUUID()
        : String(Date.now() + Math.random()),
    name: item.name || "",
    price: item.price || 0,
    frequency: item.frequency || "monthly",
  });
  renderSubscriptions();
}

function updateSubscription(id, key, value) {
  const item = state.subscriptions.find((sub) => sub.id === id);
  if (!item) return;
  item[key] = key === "price" ? Math.max(0, Number(value) || 0) : value;
  renderSubscriptions(false);
}

function removeSubscription(id) {
  state.subscriptions = state.subscriptions.filter((sub) => sub.id !== id);
  renderSubscriptions();
}

function renderSubscriptions(rebuild = true) {
  const container = $("subscriptionList");
  if (!container) return;

  if (rebuild) {
    container.innerHTML = state.subscriptions
      .map(
        (sub) => `
          <div class="subscription-item" data-id="${sub.id}">
            <div class="field">
              <label>サブスク名</label>
              <input type="text" data-sub-key="name" value="${escapeHtml(sub.name)}" placeholder="例：Netflix">
            </div>
            <div class="field">
              <label>月額料金</label>
              <input type="number" data-sub-key="price" value="${sub.price || ""}" min="0" inputmode="numeric" placeholder="1200">
            </div>
            <div class="field">
              <label>利用頻度</label>
              <select data-sub-key="frequency">
                ${["daily", "weekly", "monthly", "rarely", "forgot"]
                  .map((value) => `<option value="${value}" ${sub.frequency === value ? "selected" : ""}>${getFrequencyLabel(value)}</option>`)
                  .join("")}
              </select>
            </div>
            <button class="ghost small remove-sub" type="button" aria-label="サブスクを削除">削除</button>
          </div>
        `
      )
      .join("");
  }

  container.querySelectorAll(".subscription-item").forEach((itemElement) => {
    const id = itemElement.dataset.id;
    itemElement.querySelectorAll("[data-sub-key]").forEach((input) => {
      input.oninput = () => updateSubscription(id, input.dataset.subKey, input.value);
      input.onchange = () => updateSubscription(id, input.dataset.subKey, input.value);
    });
    const remove = itemElement.querySelector(".remove-sub");
    if (remove) remove.onclick = () => removeSubscription(id);
  });

  if ($("subLimitText")) $("subLimitText").textContent = `${state.subscriptions.length}/10件`;
  if ($("addCustom")) $("addCustom").disabled = state.subscriptions.length >= 10;
  if ($("addPreset")) $("addPreset").disabled = state.subscriptions.length >= 10;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderList(id, items, emptyText) {
  const element = $(id);
  if (!element) return;
  const list = items.length ? items : [emptyText];
  element.innerHTML = list.map((item) => `<li>${typeof item === "string" ? item : item}</li>`).join("");
}

function renderResults() {
  const data = getFormData();
  const fixedMonthly = getBaseFixedMonthly(data);
  const fixedYearly = fixedMonthly * 12;
  const subscriptionMonthly = getSubscriptionMonthly(data);
  const subscriptionYearly = subscriptionMonthly * 12;
  const childcareMonthly = getChildcareMonthly(data);
  const childcareYearly = childcareMonthly * 12;
  const opportunities = calculateOpportunities(data);
  const possibleMonthly = opportunities.all.reduce((sum, item) => sum + item.monthly, 0);
  const possibleYearly = possibleMonthly * 12;
  const scores = calculateScores(data, fixedMonthly, opportunities);

  setText("dangerScore", `${scores.danger}/100`);
  setText("mainComment", getMainComment(data, scores, possibleYearly));
  setText("possibleYearly", formatYen(possibleYearly));
  setText("fixedMonthly", formatYen(fixedMonthly));
  setText("fixedYearly", formatYen(fixedYearly));
  setText("subYearly", formatYen(subscriptionYearly));
  setText("fixedRatio", `${scores.fixedRatio.toFixed(1)}%`);
  setText("savingScore", `${scores.savingScore}/100`);
  setText("monthlyPhrase", formatYen(possibleMonthly));
  setText("yearlyPhrase", formatYen(possibleYearly));
  setText("tenYearPhrase", formatYen(possibleYearly * 10));
  setText("impact1y", formatYen(possibleYearly));
  setText("impact5y", formatYen(possibleYearly * 5));
  setText("impact10y", formatYen(possibleYearly * 10));
  setText("impact3p", formatYen(futureValueMonthly(possibleMonthly, 0.03, 10)));
  setText("impact5p", formatYen(futureValueMonthly(possibleMonthly, 0.05, 10)));

  const dangerRing = $("dangerRing");
  if (dangerRing) {
    dangerRing.style.setProperty("--score", scores.danger);
    dangerRing.classList.toggle("good", scores.danger < 35);
    dangerRing.classList.toggle("warn", scores.danger >= 35 && scores.danger < 60);
    dangerRing.classList.toggle("danger", scores.danger >= 60);
  }

  renderList(
    "priorityList",
    opportunities.all.slice(0, 3).map((item) => `${item.label}：${item.type === "priority" ? "優先順位の整理候補" : `年間${formatYen(item.yearly)}前後の見直し余地`}`),
    "大きな見直し候補は少なめです。半年に一度、サブスクと通信費を確認しましょう。"
  );
  renderList(
    "reasonList",
    opportunities.all.slice(0, 4).map((item) => `${item.label}：${item.reason}`),
    "現在の入力では強い危険サインは少なめです。必要な支出を守りながら、契約更新のタイミングで確認しましょう。"
  );
  renderSubscriptionTable();
  renderFamilyResults(data, childcareMonthly, childcareYearly, scores, opportunities, possibleMonthly, possibleYearly);
  renderCtas(data);
  saveLatestResult(data, fixedMonthly, possibleMonthly, possibleYearly, scores, opportunities);
}

function renderCtas(data) {
  const isFamily = data.household === "family";
  setText("mainResultCta", isFamily ? "家族の固定費の見直し順を確認する" : "見直し順を自動で確認する");
  setText(
    "mainResultMicrocopy",
    isFamily
      ? "子どもの教育費を守りながら、家族全体の固定費を自分で整理できます。"
      : "個別返信なし。診断結果をもとに自分で確認できます。"
  );
  setText("lineCtaText", isFamily ? "LINEで家族の診断結果を保存する" : "LINEで診断結果を保存する");
  setText("lineCtaSub", isFamily ? "あとで家族と見返せます" : "あとで見返せます");
  setText("navCtaText", isFamily ? "家族に合った見直し先を見る" : "削減できそうな項目の見直し先を見る");
  setText("navCtaSub", isFamily ? "通信費・保険・サブスクの確認へ" : "スマホ・保険・光熱費の比較へ");
}

function renderFamilyResults(data, childcareMonthly, childcareYearly, scores, opportunities, possibleMonthly, possibleYearly) {
  const isFamily = data.household === "family";
  $("familyResults")?.classList.toggle("active", isFamily);
  if (!isFamily) return;

  setText("childcareMonthly", formatYen(childcareMonthly));
  setText("childcareYearly", formatYen(childcareYearly));
  setText("childcareRatio", `${scores.childRatio.toFixed(1)}%`);
  setText(
    "educationProtectText",
    `教育費を削る前に、まずは家族全体の固定費を見直しましょう。現在の子育て関連固定費は、月${formatYen(childcareMonthly)}、年間${formatYen(childcareYearly)}です。`
  );
  setText(
    "protectedSavingsText",
    `毎月${formatYen(possibleMonthly)}の見直しは、年間${formatYen(possibleYearly)}、10年で${formatYen(possibleYearly * 10)}を教育資金や家族の予備費に回せる可能性があります。`
  );

  const childPriority = opportunities.child.slice(0, 3).map((item) => {
    if (item.type === "priority") return `${item.label}：${item.reason}`;
    return `${item.label}：年間${formatYen(item.yearly)}前後の見直し余地。${item.reason}`;
  });
  renderList(
    "childcarePriorityList",
    childPriority,
    "教育資金積立など守りたい支出は残しながら、スマホ代・保険・サブスクなど家族全体の固定費を定期的に確認しましょう。"
  );

  const selectedAges = data.childAgeGroups.length ? data.childAgeGroups : ["multiple"];
  const comments = selectedAges.map((age) => childAgeComments[age]).filter(Boolean);
  const commentElement = $("childAgeComment");
  if (commentElement) {
    commentElement.innerHTML = comments.map((comment) => `<p>${comment}</p>`).join("");
  }
}

function renderSubscriptionTable() {
  const tableBody = $("subscriptionTable");
  if (!tableBody) return;
  if (!state.subscriptions.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6">サブスク詳細を入力すると、年額・5年・10年コストと見直し優先度を表示します。</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = state.subscriptions
    .map((sub) => {
      const priority = getSubscriptionPriority(sub.frequency);
      return `
        <tr>
          <td>${escapeHtml(sub.name || "未入力")}</td>
          <td>${formatYen(sub.price)}</td>
          <td>${formatYen(sub.price * 12)}</td>
          <td>${formatYen(sub.price * 12 * 5)}</td>
          <td>${formatYen(sub.price * 12 * 10)}</td>
          <td><span class="priority-badge ${priority.className}">${priority.label}</span></td>
        </tr>
      `;
    })
    .join("");
}

function setText(id, value) {
  const element = $(id);
  if (element) element.textContent = value;
}

function saveLatestResult(data, fixedMonthly, possibleMonthly, possibleYearly, scores, opportunities) {
  const payload = {
    savedAt: new Date().toISOString(),
    household: data.household,
    fixedMonthly: Math.round(fixedMonthly),
    fixedYearly: Math.round(fixedMonthly * 12),
    possibleMonthly: Math.round(possibleMonthly),
    possibleYearly: Math.round(possibleYearly),
    dangerScore: scores.danger,
    fixedRatio: Number(scores.fixedRatio.toFixed(1)),
    topItems: opportunities.all.slice(0, 3).map((item) => item.label),
    isFamily: data.household === "family",
    childcareMonthly: Math.round(getChildcareMonthly(data)),
    childcareYearly: Math.round(getChildcareMonthly(data) * 12),
  };
  localStorage.setItem("fixedCostLatestResult", JSON.stringify(payload));
}

function bindEvents() {
  $("nextStep")?.addEventListener("click", () => {
    if (state.step === 4) {
      goToStep(1);
      return;
    }
    goToStep(state.step + 1);
  });
  $("prevStep")?.addEventListener("click", () => goToStep(state.step - 1));
  $$(".step-tab").forEach((tab) => {
    tab.addEventListener("click", () => goToStep(Number(tab.dataset.stepTarget)));
  });
  $("household")?.addEventListener("change", () => {
    syncFamilyVisibility();
    renderResults();
  });
  $$("input, select").forEach((element) => {
    element.addEventListener("input", () => {
      if (state.step === 4) renderResults();
    });
    element.addEventListener("change", () => {
      syncFamilyVisibility();
      if (state.step === 4) renderResults();
    });
  });
  $("addPreset")?.addEventListener("click", () => {
    const index = Number($("presetService")?.value || 0);
    createSubscription(presetServices[index]);
  });
  $("addCustom")?.addEventListener("click", () => createSubscription({ name: "", price: 0, frequency: "monthly" }));
  $$("[data-scroll-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = $(button.dataset.scrollTarget);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function init() {
  renderPresetOptions();
  bindEvents();
  syncFamilyVisibility();
  renderSubscriptions();
  renderSteps();
}

document.addEventListener("DOMContentLoaded", init);

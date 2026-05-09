"use strict";

const STORAGE_KEY = "financeTrackerData";
const THEME_KEY = "financeTrackerTheme";
const LANGUAGE_KEY = "financeTrackerLanguage";

const state = {
  transactions: [],
  filters: {
    category: "all",
    type: "all",
    search: "",
  },
  editingId: null,
  pendingDeleteId: null,
  isSubmitting: false,
  theme: "dark",
  language: "en",
};

const dom = {
  form: document.getElementById("transactionForm"),
  titleInput: document.getElementById("titleInput"),
  amountInput: document.getElementById("amountInput"),
  categoryInput: document.getElementById("categoryInput"),
  dateInput: document.getElementById("dateInput"),
  titleError: document.getElementById("titleError"),
  amountError: document.getElementById("amountError"),
  categoryError: document.getElementById("categoryError"),
  dateError: document.getElementById("dateError"),
  submitBtn: document.getElementById("submitBtn"),
  langEnBtn: document.getElementById("langEnBtn"),
  langZhBtn: document.getElementById("langZhBtn"),
  submitBtnLabel: document.getElementById("submitBtnLabel"),
  cancelEditBtn: document.getElementById("cancelEditBtn"),
  filterCategory: document.getElementById("filterCategory"),
  filterType: document.getElementById("filterType"),
  searchInput: document.getElementById("searchInput"),
  resetFiltersBtn: document.getElementById("resetFiltersBtn"),
  exportCsvBtn: document.getElementById("exportCsvBtn"),
  themeToggleBtn: document.getElementById("themeToggleBtn"),
  transactionsList: document.getElementById("transactionsList"),
  resultsCount: document.getElementById("resultsCount"),
  totalBalance: document.getElementById("totalBalance"),
  totalIncome: document.getElementById("totalIncome"),
  totalExpenses: document.getElementById("totalExpenses"),
  financeChart: document.getElementById("financeChart"),
  confirmModal: document.getElementById("confirmModal"),
  confirmDeleteBtn: document.getElementById("confirmDeleteBtn"),
  cancelDeleteBtn: document.getElementById("cancelDeleteBtn"),
  toastContainer: document.getElementById("toastContainer"),
  skeleton: document.getElementById("skeleton"),
};
const translations = {
  en: {
    "app.eyebrow": "Personal Finance",
    "app.title": "Advanced Finance Tracker",
    "app.subtitle": "Track income, expenses, and your balance with clarity.",

    "theme.light": "Light Mode",
    "theme.dark": "Dark Mode",
    "actions.exportCsv": "Export CSV",
    "actions.resetFilters": "Reset Filters",

    "summary.balance": "Total Balance",
    "summary.income": "Total Income",
    "summary.expenses": "Total Expenses",

    "chart.title": "Cash Flow Overview",
    "chart.meta": "Income vs Expense",
    "chart.income": "Income",
    "chart.expense": "Expense",

    "form.title": "Add Transaction",
    "form.label.title": "Title",
    "form.label.amount": "Amount",
    "form.label.category": "Category",
    "form.label.date": "Date",
    "form.placeholder.title": "e.g., Freelance Payment",
    "form.placeholder.amount": "e.g., 1200 or -45",
    "form.submit.add": "Add Transaction",
    "form.submit.adding": "Adding...",
    "form.submit.save": "Save Changes",
    "form.submit.saving": "Saving...",
    "form.cancelEdit": "Cancel Edit",

    "category.select": "Select category",
    "category.all": "All categories",
    "category.salary": "Salary",
    "category.business": "Business",
    "category.investments": "Investments",
    "category.housing": "Housing",
    "category.food": "Food",
    "category.transport": "Transport",
    "category.health": "Health",
    "category.entertainment": "Entertainment",
    "category.education": "Education",
    "category.other": "Other",

    "filters.title": "Filters & Search",
    "filters.category": "Category",
    "filters.type": "Type",
    "filters.search": "Search by title",
    "filters.searchPlaceholder": "Start typing...",

    "type.all": "All",
    "type.income": "Income",
    "type.expense": "Expense",

    "transactions.title": "Transactions",
    "transactions.results": "{count} results",
    "transactions.empty": "No transactions yet. Add your first one to get started.",
    "transactions.addFirst": "Add First Transaction",
    "transactions.edit": "Edit",
    "transactions.delete": "Delete",

    "modal.deleteTitle": "Delete transaction?",
    "modal.deleteText": "This action cannot be undone.",
    "modal.cancel": "Cancel",
    "modal.delete": "Delete",

    "error.title": "Title is required.",
    "error.amount": "Enter a valid amount.",
    "error.category": "Select a category.",
    "error.date": "Pick a date.",

    "toast.fixFields": "Please fix the highlighted fields.",
    "toast.added": "Transaction added.",
    "toast.updated": "Transaction updated.",
    "toast.deleted": "Transaction deleted.",
    "toast.editing": "Editing mode enabled.",
    "toast.noData": "No data to export.",
    "toast.exported": "CSV exported.",
  },

  zh: {
    "app.eyebrow": "个人理财",
    "app.title": "高级个人财务追踪器",
    "app.subtitle": "清晰追踪你的收入、支出和余额。",

    "theme.light": "浅色模式",
    "theme.dark": "深色模式",
    "actions.exportCsv": "导出 CSV",
    "actions.resetFilters": "重置筛选",

    "summary.balance": "总余额",
    "summary.income": "总收入",
    "summary.expenses": "总支出",

    "chart.title": "现金流概览",
    "chart.meta": "收入 vs 支出",
    "chart.income": "收入",
    "chart.expense": "支出",

    "form.title": "添加交易",
    "form.label.title": "标题",
    "form.label.amount": "金额",
    "form.label.category": "类别",
    "form.label.date": "日期",
    "form.placeholder.title": "例如：兼职收入",
    "form.placeholder.amount": "例如：1200 或 -45",
    "form.submit.add": "添加交易",
    "form.submit.adding": "添加中...",
    "form.submit.save": "保存修改",
    "form.submit.saving": "保存中...",
    "form.cancelEdit": "取消编辑",

    "category.select": "选择类别",
    "category.all": "所有类别",
    "category.salary": "工资",
    "category.business": "商业",
    "category.investments": "投资",
    "category.housing": "住房",
    "category.food": "餐饮",
    "category.transport": "交通",
    "category.health": "健康",
    "category.entertainment": "娱乐",
    "category.education": "教育",
    "category.other": "其他",

    "filters.title": "筛选与搜索",
    "filters.category": "类别",
    "filters.type": "类型",
    "filters.search": "按标题搜索",
    "filters.searchPlaceholder": "开始输入...",

    "type.all": "全部",
    "type.income": "收入",
    "type.expense": "支出",

    "transactions.title": "交易记录",
    "transactions.results": "{count} 条结果",
    "transactions.empty": "还没有交易记录。添加第一条交易开始使用。",
    "transactions.addFirst": "添加第一条交易",
    "transactions.edit": "编辑",
    "transactions.delete": "删除",

    "modal.deleteTitle": "删除这条交易？",
    "modal.deleteText": "此操作无法撤销。",
    "modal.cancel": "取消",
    "modal.delete": "删除",

    "error.title": "请输入标题。",
    "error.amount": "请输入有效金额。",
    "error.category": "请选择类别。",
    "error.date": "请选择日期。",

    "toast.fixFields": "请修正高亮字段。",
    "toast.added": "交易已添加。",
    "toast.updated": "交易已更新。",
    "toast.deleted": "交易已删除。",
    "toast.editing": "已进入编辑模式。",
    "toast.noData": "没有可导出的数据。",
    "toast.exported": "CSV 已导出。",
  },
};

const t = (key, replacements = {}) => {
  let text = translations[state.language]?.[key] || translations.en[key] || key;

  Object.entries(replacements).forEach(([name, value]) => {
    text = text.replaceAll(`{${name}}`, value);
  });

  return text;
};

const applyTranslations = () => {
  document.documentElement.lang = state.language;

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  });

  dom.langEnBtn.classList.toggle("is-active", state.language === "en");
  dom.langZhBtn.classList.toggle("is-active", state.language === "zh");

  dom.themeToggleBtn.textContent =
    state.theme === "light" ? t("theme.dark") : t("theme.light");

  if (state.editingId) {
    setSubmitButtonLabel(t("form.submit.save"));
  } else {
    setSubmitButtonLabel(t("form.submit.add"));
  }
};

const setLanguage = (language) => {
  state.language = language;
  localStorage.setItem(LANGUAGE_KEY, language);
  applyTranslations();
  renderApp();
};

const loadLanguage = () => {
  state.language = localStorage.getItem(LANGUAGE_KEY) || "en";
  applyTranslations();
};

const generateID = () => {
  return `tx_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

// const saveToLocalStorage = () => {
//   localStorage.setItem(STORAGE_KEY, JSON.stringify(state.transactions));
// };

// const loadFromLocalStorage = () => {
//   const stored = localStorage.getItem(STORAGE_KEY);
//   state.transactions = stored ? JSON.parse(stored) : [];
// };

const saveToLocalStorage = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.transactions));
};

const isValidTransaction = (tx) => {
  return (
    tx &&
    typeof tx.id === "string" &&
    typeof tx.title === "string" &&
    typeof tx.amount === "number" &&
    Number.isFinite(tx.amount) &&
    typeof tx.category === "string" &&
    typeof tx.date === "string"
  );
};

const loadFromLocalStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      state.transactions = [];
      return;
    }

    const parsedTransactions = JSON.parse(stored);

    if (!Array.isArray(parsedTransactions)) {
      throw new Error("Stored transactions must be an array.");
    }

    state.transactions = parsedTransactions.filter(isValidTransaction);
  } catch (error) {
    console.warn("Corrupted LocalStorage data was detected and reset.", error);
    localStorage.removeItem(STORAGE_KEY);
    state.transactions = [];

    if (dom.toastContainer) {
      showToast("Saved data was corrupted and has been reset.", "error");
    }
  }
};

const saveTheme = () => {
  localStorage.setItem(THEME_KEY, state.theme);
};

const setTheme = (theme) => {
  state.theme = theme;
  document.body.classList.toggle("theme-light", theme === "light");
  dom.themeToggleBtn.textContent =
    theme === "light" ? t("theme.dark") : t("theme.light");
  saveTheme();
};

const loadTheme = () => {
  const storedTheme = localStorage.getItem(THEME_KEY);
  setTheme(storedTheme || "dark");
};

const showToast = (message, variant = "success") => {
  const toast = document.createElement("div");
  toast.className = `toast toast--${variant}`;
  toast.textContent = message;
  toast.setAttribute("role", variant === "error" ? "alert" : "status");
  toast.setAttribute("aria-live", variant === "error" ? "assertive" : "polite");

  dom.toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 2400);
};

const clearErrors = () => {
  const fields = [
    { input: dom.titleInput, error: dom.titleError },
    { input: dom.amountInput, error: dom.amountError },
    { input: dom.categoryInput, error: dom.categoryError },
    { input: dom.dateInput, error: dom.dateError },
  ];

  fields.forEach(({ input, error }) => {
    input.classList.remove("is-invalid");
    error.textContent = "";
  });
};

const setError = (input, errorEl, message) => {
  input.classList.add("is-invalid");
  errorEl.textContent = message;
};

const validateForm = () => {
  clearErrors();

  const title = dom.titleInput.value.trim();
  const amountValue = dom.amountInput.value.trim();
  const amount = Number(amountValue);
  const category = dom.categoryInput.value;
  const date = dom.dateInput.value;

  let isValid = true;

  if (!title) {
    setError(dom.titleInput, dom.titleError, t("error.title"));
    isValid = false;
  }

  if (!amountValue || Number.isNaN(amount) || amount === 0) {
    setError(dom.amountInput, dom.amountError, t("error.amount"));
    isValid = false;
  }

  if (!category) {
    setError(dom.categoryInput, dom.categoryError, t("error.category"));
    isValid = false;
  }

  if (!date) {
    setError(dom.dateInput, dom.dateError, t("error.date"));
    isValid = false;
  }

  return isValid;
};

const setSubmitButtonLabel = (label) => {
  dom.submitBtnLabel.textContent = label;
};

const setSubmitLoading = (isLoading) => {
  dom.submitBtn.disabled = isLoading;
  dom.submitBtn.classList.toggle("is-loading", isLoading);
  dom.submitBtn.setAttribute("aria-busy", String(isLoading));
};

const resetFormState = () => {
  dom.form.reset();
  state.editingId = null;
  setSubmitButtonLabel(t("form.submit.add"));

  setSubmitLoading(false);
  dom.cancelEditBtn.hidden = true;
  clearErrors();
};
const addTransaction = async () => {
  if (state.isSubmitting) return;

  if (!validateForm()) {
    showToast(t("toast.fixFields"), "error");

    return;
  }

  state.isSubmitting = true;
  const wasEditing = Boolean(state.editingId);

  setSubmitLoading(true);
  setSubmitButtonLabel(wasEditing ? t("form.submit.saving") : t("form.submit.adding"));


  try {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const title = dom.titleInput.value.trim();
    const amount = Number(dom.amountInput.value);
    const category = dom.categoryInput.value;
    const date = dom.dateInput.value;

    if (state.editingId) {
      state.transactions = state.transactions.map((tx) =>
        tx.id === state.editingId ? { ...tx, title, amount, category, date } : tx,
      );
      showToast(t("toast.updated"));

    } else {
      const newTransaction = {
        id: generateID(),
        title,
        amount,
        category,
        date,
      };

      state.transactions = [newTransaction, ...state.transactions];

      showToast(t("toast.added"));
    }

    resetFormState();
    saveToLocalStorage();
    renderApp();
  } finally {
    state.isSubmitting = false;
    setSubmitLoading(false);
  }
};



const startEditing = (id) => {
  const transaction = state.transactions.find((tx) => tx.id === id);
  if (!transaction) return;

  dom.titleInput.value = transaction.title;
  dom.amountInput.value = transaction.amount;
  dom.categoryInput.value = transaction.category;
  dom.dateInput.value = transaction.date;

  state.editingId = id;


  setSubmitButtonLabel(t("form.submit.save"));
  dom.cancelEditBtn.hidden = false;
  dom.titleInput.focus();
  showToast(t("toast.editing"));

};

const deleteTransaction = (id) => {
  state.transactions = state.transactions.filter((tx) => tx.id !== id);
  saveToLocalStorage();
  renderApp();
  showToast(t("toast.deleted"));
};

const openConfirmModal = (id) => {
  state.pendingDeleteId = id;
  dom.confirmModal.classList.add("is-open");
  dom.confirmModal.setAttribute("aria-hidden", "false");
};

const closeConfirmModal = () => {
  state.pendingDeleteId = null;
  dom.confirmModal.classList.remove("is-open");
  dom.confirmModal.setAttribute("aria-hidden", "true");
};

const renderSummary = () => {
  const amounts = state.transactions.map((tx) => tx.amount);

  const totalIncome = amounts
    .filter((amount) => amount > 0)
    .reduce((sum, amount) => sum + amount, 0);

  const totalExpenses = amounts
    .filter((amount) => amount < 0)
    .reduce((sum, amount) => sum + amount, 0);

  const totalBalance = totalIncome + totalExpenses;

  dom.totalIncome.textContent = formatCurrency(totalIncome);
  dom.totalExpenses.textContent = formatCurrency(Math.abs(totalExpenses));
  dom.totalBalance.textContent = formatCurrency(totalBalance);
};

const renderTransactions = () => {
  const filtered = filterTransactions();

  dom.resultsCount.textContent = t("transactions.results", {
    count: filtered.length,
  });



  if (filtered.length === 0) {
    dom.transactionsList.innerHTML = `
      <div class="transactions__empty">
         <div class="empty__icon">+</div>
         <p>${t("transactions.empty")}</p>
         <button class="btn btn--accent empty-add-btn" type="button">${t("transactions.addFirst")}</button>
      </div>
`   ;

    return;
  }

  const groups = groupByMonth(filtered);

  dom.transactionsList.innerHTML = groups
    .map(
      (group) => `
        <div class="month-group">
          <p class="month-title">${group.label}</p>
          ${group.items.map(renderTransactionItem).join("")}
        </div>
      `,
    )
    .join("");
};

const renderTransactionItem = (tx) => {
  const typeClass = tx.amount >= 0 ? "amount--income" : "amount--expense";
  const formattedAmount = formatCurrency(tx.amount);
  const formattedDate = formatDate(tx.date);

  const categoryKeyMap = {
    Salary: "category.salary",
    Business: "category.business",
    Investments: "category.investments",
    Housing: "category.housing",
    Food: "category.food",
    Transport: "category.transport",
    Health: "category.health",
    Entertainment: "category.entertainment",
    Education: "category.education",
    Other: "category.other",
  };

  const getCategoryLabel = (category) => {
    return t(categoryKeyMap[category] || category);
  };

  return `
    <div class="transaction">
      <div>
        <p class="transaction__title">${tx.title}</p>
        <div class="transaction__meta">
          <span class="badge">${getCategoryLabel(tx.category)}</span>
          <span>${formattedDate}</span>
        </div>
      </div>
      <div>
        <p class="amount ${typeClass}">${formattedAmount}</p>
        <button class="edit-btn" data-id="${tx.id}">${t("transactions.edit")}</button>
        <button class="delete-btn" data-id="${tx.id}">${t("transactions.delete")}</button>
      </div>
    </div>
  `;
};

const filterTransactions = () => {
  const { category, type, search } = state.filters;

  return state.transactions.filter((tx) => {
    const matchesCategory = category === "all" || tx.category === category;

    const matchesType =
      type === "all" ||
      (type === "income" && tx.amount > 0) ||
      (type === "expense" && tx.amount < 0);

    const matchesSearch = tx.title.toLowerCase().includes(search.toLowerCase());

    return matchesCategory && matchesType && matchesSearch;
  });
};

const groupByMonth = (transactions) => {
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );

  const groups = [];
  const lookup = new Map();

  sorted.forEach((tx) => {
    const label = new Date(tx.date).toLocaleDateString(
      state.language === "zh" ? "zh-CN" : "en-US",
      {
        month: "long",
        year: "numeric",
      },
    );


    if (!lookup.has(label)) {
      lookup.set(label, { label, items: [] });
      groups.push(lookup.get(label));
    }

    lookup.get(label).items.push(tx);
  });

  return groups;
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat(state.language === "zh" ? "zh-CN" : "en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString(state.language === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const renderChart = () => {
  const canvas = dom.financeChart;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;

  const displayWidth = canvas.clientWidth;
  const displayHeight = 260;

  canvas.width = displayWidth * dpr;
  canvas.height = displayHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const width = displayWidth;
  const height = displayHeight;

  ctx.clearRect(0, 0, width, height);

  const amounts = state.transactions.map((tx) => tx.amount);
  const income = amounts.filter((a) => a > 0).reduce((s, a) => s + a, 0);
  const expenses = Math.abs(
    amounts.filter((a) => a < 0).reduce((s, a) => s + a, 0),
  );

  const maxValue = Math.max(income, expenses, 1);
  const barWidth = 120;
  const gap = 80;
  const baseY = height - 40;

  const incomeHeight = (income / maxValue) * (height - 80);
  const expenseHeight = (expenses / maxValue) * (height - 80);

  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.beginPath();
  ctx.moveTo(40, baseY);
  ctx.lineTo(width - 40, baseY);
  ctx.stroke();

  ctx.fillStyle = "#22c55e";
  ctx.fillRect(160, baseY - incomeHeight, barWidth, incomeHeight);

  ctx.fillStyle = "#f97316";
  ctx.fillRect(
    160 + barWidth + gap,
    baseY - expenseHeight,
    barWidth,
    expenseHeight,
  );

  ctx.fillStyle = "#f8f4e9";
  ctx.font = "14px sans-serif";

  ctx.fillText(t("chart.income"), 170, baseY + 20);
  ctx.fillText(t("chart.expense"), 160 + barWidth + gap, baseY + 20);


  ctx.fillText(formatCurrency(income), 150, baseY - incomeHeight - 10);
  ctx.fillText(
    formatCurrency(expenses),
    150 + barWidth + gap,
    baseY - expenseHeight - 10,
  );
};

const renderApp = () => {
  renderSummary();
  renderTransactions();
  renderChart();
};

const exportToCSV = () => {
  if (state.transactions.length === 0) {
    showToast(t("toast.noData"), "error");

    return;
  }


  const headers = [
    t("form.label.title"),
    t("form.label.amount"),
    t("form.label.category"),
    t("form.label.date"),
  ];



  const rows = state.transactions.map((tx) => [
    tx.title,
    tx.amount,
    tx.category,
    tx.date,
  ]);

  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","),
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "transactions.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast(t("toast.exported"));

};

const initializeApp = () => {

  loadFromLocalStorage();
  loadTheme();
  loadLanguage();
  renderApp();


  setTimeout(() => {
    dom.skeleton.classList.add("is-hidden");
  }, 300);

  dom.form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await addTransaction();
  });

  dom.langEnBtn.addEventListener("click", () => {
    setLanguage("en");
  });

  dom.langZhBtn.addEventListener("click", () => {
    setLanguage("zh");
  });



  dom.cancelEditBtn.addEventListener("click", () => {
    resetFormState();
  });

  dom.transactionsList.addEventListener("click", (e) => {
    const deleteButton = e.target.closest(".delete-btn");
    const editButton = e.target.closest(".edit-btn");
    const emptyAdd = e.target.closest(".empty-add-btn");

    const deleteId = deleteButton?.dataset?.id;
    const editId = editButton?.dataset?.id;

    if (deleteId) {
      openConfirmModal(deleteId);
    }

    if (editId) {
      startEditing(editId);
    }

    if (emptyAdd) {
      dom.titleInput.focus();
    }
  });

  dom.filterCategory.addEventListener("change", (e) => {
    state.filters.category = e.target.value;
    renderTransactions();
  });

  dom.filterType.addEventListener("change", (e) => {
    state.filters.type = e.target.value;
    renderTransactions();
  });

  dom.searchInput.addEventListener("input", (e) => {
    state.filters.search = e.target.value;
    renderTransactions();
  });

  dom.resetFiltersBtn.addEventListener("click", () => {
    state.filters = { category: "all", type: "all", search: "" };
    dom.filterCategory.value = "all";
    dom.filterType.value = "all";
    dom.searchInput.value = "";
    renderTransactions();
  });

  dom.exportCsvBtn.addEventListener("click", exportToCSV);

  dom.themeToggleBtn.addEventListener("click", () => {
    setTheme(state.theme === "dark" ? "light" : "dark");
  });

  dom.confirmDeleteBtn.addEventListener("click", () => {
    if (state.pendingDeleteId) {
      deleteTransaction(state.pendingDeleteId);
    }
    closeConfirmModal();
  });

  dom.cancelDeleteBtn.addEventListener("click", closeConfirmModal);

  dom.confirmModal.addEventListener("click", (e) => {
    if (e.target.dataset.close) {
      closeConfirmModal();
    }
  });
};

// initializeApp();

if (
  typeof window !== "undefined" &&
  typeof document !== "undefined" &&
  !window.__TEST__
) {
  initializeApp();
}

if (typeof module !== "undefined") {
  module.exports = {
    STORAGE_KEY,
    state,
    saveToLocalStorage,
    loadFromLocalStorage,
    isValidTransaction,
  };
}

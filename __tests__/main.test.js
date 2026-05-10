function buildDOM() {
  document.body.innerHTML = `
    <form id="transactionForm">
      <input id="titleInput" />
      <input id="amountInput" />
      <select id="categoryInput">
        <option value=""></option>
        <option value="Salary">Salary</option>
        <option value="Food">Food</option>
        <option value="Housing">Housing</option>
        <option value="Transport">Transport</option>
        <option value="Other">Other</option>
      </select>
      <input id="dateInput" />

      <small id="titleError"></small>
      <small id="amountError"></small>
      <small id="categoryError"></small>
      <small id="dateError"></small>

      <button id="submitBtn" type="submit">
        <span id="submitBtnLabel"></span>
        <span class="btn__spinner"></span>
      </button>

      <button id="cancelEditBtn" type="button" hidden>Cancel Edit</button>
    </form>

    <button id="langEnBtn" type="button">EN</button>
    <button id="langZhBtn" type="button">中文</button>

    <select id="filterCategory">
      <option value="all">All</option>
      <option value="Salary">Salary</option>
      <option value="Food">Food</option>
      <option value="Housing">Housing</option>
      <option value="Transport">Transport</option>
      <option value="Other">Other</option>
    </select>

    <select id="filterType">
      <option value="all">All</option>
      <option value="income">Income</option>
      <option value="expense">Expense</option>
    </select>

    <input id="searchInput" />

    <button id="resetFiltersBtn" type="button">Reset Filters</button>
    <button id="exportCsvBtn" type="button">Export CSV</button>
    <button id="themeToggleBtn" type="button">Light Mode</button>

    <div id="transactionsList"></div>
    <div id="resultsCount"></div>

    <div id="totalBalance"></div>
    <div id="totalIncome"></div>
    <div id="totalExpenses"></div>

    <canvas id="financeChart"></canvas>

    <div id="confirmModal" aria-hidden="true">
      <div data-close="true"></div>
    </div>

    <button id="confirmDeleteBtn" type="button">Delete</button>
    <button id="cancelDeleteBtn" type="button">Cancel</button>

    <div id="toastContainer"></div>
    <div id="skeleton"></div>
  `;
}

function bootstrapApp(options = {}) {
  jest.resetModules();
  jest.useFakeTimers();

  buildDOM();

  if (!options.keepLocalStorage) {
    localStorage.clear();
  }

  HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
    setTransform: jest.fn(),
    clearRect: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    stroke: jest.fn(),
    fillRect: jest.fn(),
    fillText: jest.fn(),
  }));

  global.URL.createObjectURL = jest.fn(() => "blob:test");
  global.URL.revokeObjectURL = jest.fn();

  require("../main.js");

  jest.runOnlyPendingTimers();
}

async function addTransaction(title, amount, category, date) {
  document.getElementById("titleInput").value = title;
  document.getElementById("amountInput").value = amount;
  document.getElementById("categoryInput").value = category;
  document.getElementById("dateInput").value = date;

  document.getElementById("transactionForm").dispatchEvent(
    new Event("submit", {
      bubbles: true,
      cancelable: true,
    })
  );

  jest.advanceTimersByTime(500);
  await Promise.resolve();
}

beforeEach(() => {
  document.body.innerHTML = "";
  localStorage.clear();
  jest.clearAllMocks();
});

test("shows validation errors when submitting empty form", async () => {
  bootstrapApp();

  document.getElementById("transactionForm").dispatchEvent(
    new Event("submit", {
      bubbles: true,
      cancelable: true,
    })
  );

  await Promise.resolve();

  expect(document.getElementById("titleError").textContent).toBe(
    "Title is required."
  );
  expect(document.getElementById("amountError").textContent).toBe(
    "Enter a valid amount."
  );
  expect(document.getElementById("categoryError").textContent).toBe(
    "Select a category."
  );
  expect(document.getElementById("dateError").textContent).toBe(
    "Pick a date."
  );
});

test("adds an income transaction and updates total income", async () => {
  bootstrapApp();

  await addTransaction("Salary May", "2000", "Salary", "2026-05-10");

  expect(document.getElementById("transactionsList").textContent).toContain(
    "Salary May"
  );
  expect(document.getElementById("totalIncome").textContent).toContain(
    "2,000.00"
  );
});

test("adds an expense transaction and updates total expenses", async () => {
  bootstrapApp();

  await addTransaction("Lunch", "-20", "Food", "2026-05-10");

  expect(document.getElementById("transactionsList").textContent).toContain(
    "Lunch"
  );
  expect(document.getElementById("totalExpenses").textContent).toContain(
    "20.00"
  );
});

test("calculates total balance from income and expense", async () => {
  bootstrapApp();

  await addTransaction("Salary", "1000", "Salary", "2026-05-10");
  await addTransaction("Rent", "-300", "Housing", "2026-05-10");

  expect(document.getElementById("totalBalance").textContent).toContain(
    "700.00"
  );
});

test("filters transactions by search text", async () => {
  bootstrapApp();

  await addTransaction("Salary", "1000", "Salary", "2026-05-10");
  await addTransaction("Coffee", "-5", "Food", "2026-05-10");

  const searchInput = document.getElementById("searchInput");
  searchInput.value = "coffee";
  searchInput.dispatchEvent(new Event("input", { bubbles: true }));

  expect(document.getElementById("transactionsList").textContent).toContain(
    "Coffee"
  );
  expect(document.getElementById("transactionsList").textContent).not.toContain(
    "Salary"
  );
});

test("filters transactions by income type", async () => {
  bootstrapApp();

  await addTransaction("Salary", "1000", "Salary", "2026-05-10");
  await addTransaction("Rent", "-300", "Housing", "2026-05-10");

  const filterType = document.getElementById("filterType");
  filterType.value = "income";
  filterType.dispatchEvent(new Event("change", { bubbles: true }));

  expect(document.getElementById("transactionsList").textContent).toContain(
    "Salary"
  );
  expect(document.getElementById("transactionsList").textContent).not.toContain(
    "Rent"
  );
});

test("filters transactions by expense type", async () => {
  bootstrapApp();

  await addTransaction("Salary", "1000", "Salary", "2026-05-10");
  await addTransaction("Rent", "-300", "Housing", "2026-05-10");

  const filterType = document.getElementById("filterType");
  filterType.value = "expense";
  filterType.dispatchEvent(new Event("change", { bubbles: true }));

  expect(document.getElementById("transactionsList").textContent).toContain(
    "Rent"
  );
  expect(document.getElementById("transactionsList").textContent).not.toContain(
    "Salary"
  );
});

test("filters transactions by category", async () => {
  bootstrapApp();

  await addTransaction("Bus", "-10", "Transport", "2026-05-10");
  await addTransaction("Lunch", "-20", "Food", "2026-05-10");

  const filterCategory = document.getElementById("filterCategory");
  filterCategory.value = "Transport";
  filterCategory.dispatchEvent(new Event("change", { bubbles: true }));

  expect(document.getElementById("transactionsList").textContent).toContain(
    "Bus"
  );
  expect(document.getElementById("transactionsList").textContent).not.toContain(
    "Lunch"
  );
});

test("resets filters", async () => {
  bootstrapApp();

  await addTransaction("Salary", "1000", "Salary", "2026-05-10");
  await addTransaction("Coffee", "-5", "Food", "2026-05-10");

  const searchInput = document.getElementById("searchInput");
  searchInput.value = "coffee";
  searchInput.dispatchEvent(new Event("input", { bubbles: true }));

  document.getElementById("resetFiltersBtn").click();

  expect(document.getElementById("transactionsList").textContent).toContain(
    "Salary"
  );
  expect(document.getElementById("transactionsList").textContent).toContain(
    "Coffee"
  );
});

test("edits an existing transaction", async () => {
  bootstrapApp();

  await addTransaction("Old Title", "100", "Salary", "2026-05-10");

  document.querySelector(".edit-btn").click();

  document.getElementById("titleInput").value = "New Title";
  document.getElementById("amountInput").value = "300";

  document.getElementById("transactionForm").dispatchEvent(
    new Event("submit", {
      bubbles: true,
      cancelable: true,
    })
  );

  jest.advanceTimersByTime(500);
  await Promise.resolve();

  expect(document.getElementById("transactionsList").textContent).toContain(
    "New Title"
  );
  expect(document.getElementById("totalIncome").textContent).toContain(
    "300.00"
  );
});

test("cancels edit mode", async () => {
  bootstrapApp();

  await addTransaction("Old Title", "100", "Salary", "2026-05-10");

  document.querySelector(".edit-btn").click();
  expect(document.getElementById("cancelEditBtn").hidden).toBe(false);

  document.getElementById("cancelEditBtn").click();

  expect(document.getElementById("cancelEditBtn").hidden).toBe(true);
});

test("opens and closes delete confirmation modal", async () => {
  bootstrapApp();

  await addTransaction("Delete Me", "100", "Salary", "2026-05-10");

  document.querySelector(".delete-btn").click();

  expect(document.getElementById("confirmModal").classList.contains("is-open"))
    .toBe(true);

  document.getElementById("cancelDeleteBtn").click();

  expect(document.getElementById("confirmModal").classList.contains("is-open"))
    .toBe(false);
});

test("deletes a transaction after confirmation", async () => {
  bootstrapApp();

  await addTransaction("Delete Me", "100", "Salary", "2026-05-10");

  document.querySelector(".delete-btn").click();
  document.getElementById("confirmDeleteBtn").click();

  expect(document.getElementById("transactionsList").textContent).not.toContain(
    "Delete Me"
  );
});

test("switches language to Chinese", () => {
  bootstrapApp();

  document.getElementById("langZhBtn").click();

  expect(document.documentElement.lang).toBe("zh");
  expect(document.getElementById("submitBtnLabel").textContent).toBe(
    "添加交易"
  );
});

test("switches language back to English", () => {
  bootstrapApp();

  document.getElementById("langZhBtn").click();
  document.getElementById("langEnBtn").click();

  expect(document.documentElement.lang).toBe("en");
  expect(document.getElementById("submitBtnLabel").textContent).toBe(
    "Add Transaction"
  );
});

test("toggles light theme", () => {
  bootstrapApp();

  document.getElementById("themeToggleBtn").click();

  expect(document.body.classList.contains("theme-light")).toBe(true);
});

test("exports csv when transaction data exists", async () => {
  bootstrapApp();

  await addTransaction("CSV Test", "100", "Salary", "2026-05-10");

  document.getElementById("exportCsvBtn").click();

  expect(URL.createObjectURL).toHaveBeenCalled();
  expect(URL.revokeObjectURL).toHaveBeenCalled();
});

test("shows error toast when exporting with no data", () => {
  bootstrapApp();

  document.getElementById("exportCsvBtn").click();

  expect(document.getElementById("toastContainer").textContent).toContain(
    "No data to export."
  );
});

test("saves transactions to localStorage", async () => {
  bootstrapApp();

  await addTransaction("Saved Item", "50", "Other", "2026-05-10");

  const saved = JSON.parse(localStorage.getItem("financeTrackerData"));

  expect(saved[0].title).toBe("Saved Item");
  expect(saved[0].amount).toBe(50);
});

test("shows save label when applying translations during edit mode", async () => {
  bootstrapApp();

  await addTransaction("Old Title", "100", "Salary", "2026-05-10");

  document.querySelector(".edit-btn").click();
  document.getElementById("langZhBtn").click();

  expect(document.getElementById("submitBtnLabel").textContent).toBe("保存修改");
});

test("focuses title input when clicking empty add button", () => {
  bootstrapApp();

  const emptyAddButton = document.querySelector(".empty-add-btn");
  emptyAddButton.click();

  expect(document.activeElement).toBe(document.getElementById("titleInput"));
});

test("closes delete modal when clicking modal backdrop close area", async () => {
  bootstrapApp();

  await addTransaction("Delete Me", "100", "Salary", "2026-05-10");

  document.querySelector(".delete-btn").click();

  expect(document.getElementById("confirmModal").classList.contains("is-open"))
    .toBe(true);

  document.querySelector("#confirmModal [data-close='true']").click();

  expect(document.getElementById("confirmModal").classList.contains("is-open"))
    .toBe(false);
});

test("prevents xss by rendering transaction title as text", async () => {
  bootstrapApp();

  await addTransaction(
    '<img src=x onerror=alert("XSS")>',
    "100",
    "Other",
    "2026-05-10"
  );
  

  const titleElement = document.querySelector(".transaction__title");

  expect(titleElement.textContent).toBe('<img src=x onerror=alert("XSS")>');
  expect(titleElement.innerHTML).not.toContain("<img");
});
describe("localStorage robustness", () => {
    let STORAGE_KEY;
    let state;
    let saveToLocalStorage;
    let loadFromLocalStorage;
    let isValidTransaction;

    beforeEach(() => {
        jest.resetModules();

        window.__TEST__ = true;
        localStorage.clear();

        jest.spyOn(console, "warn").mockImplementation(() => { });

        ({
            STORAGE_KEY,
            state,
            saveToLocalStorage,
            loadFromLocalStorage,
            isValidTransaction,
        } = require("../main.js"));

        state.transactions = [];
    });

    afterEach(() => {
        console.warn.mockRestore();
        localStorage.clear();
        delete window.__TEST__;
    });

    test("accepts a valid transaction object", () => {
        const tx = {
            id: "tx_001",
            title: "Salary",
            amount: 1200,
            category: "Salary",
            date: "2026-05-09",
        };

        expect(isValidTransaction(tx)).toBe(true);
    });

    test("rejects a transaction without an id", () => {
        const tx = {
            title: "Salary",
            amount: 1200,
            category: "Salary",
            date: "2026-05-09",
        };

        expect(isValidTransaction(tx)).toBe(false);
    });

    test("rejects a transaction with non-string title", () => {
        const tx = {
            id: "tx_001",
            title: 123,
            amount: 1200,
            category: "Salary",
            date: "2026-05-09",
        };

        expect(isValidTransaction(tx)).toBe(false);
    });

    test("rejects a transaction with non-number amount", () => {
        const tx = {
            id: "tx_001",
            title: "Salary",
            amount: "1200",
            category: "Salary",
            date: "2026-05-09",
        };

        expect(isValidTransaction(tx)).toBe(false);
    });

    test("rejects a transaction with NaN amount", () => {
        const tx = {
            id: "tx_001",
            title: "Salary",
            amount: NaN,
            category: "Salary",
            date: "2026-05-09",
        };

        expect(isValidTransaction(tx)).toBe(false);
    });

    test("rejects a transaction without category", () => {
        const tx = {
            id: "tx_001",
            title: "Salary",
            amount: 1200,
            date: "2026-05-09",
        };

        expect(isValidTransaction(tx)).toBe(false);
    });

    test("rejects a transaction without date", () => {
        const tx = {
            id: "tx_001",
            title: "Salary",
            amount: 1200,
            category: "Salary",
        };

        expect(isValidTransaction(tx)).toBe(false);
    });

    test("saves transactions to localStorage as JSON", () => {
        state.transactions = [
            {
                id: "tx_001",
                title: "Salary",
                amount: 1200,
                category: "Salary",
                date: "2026-05-09",
            },
        ];

        saveToLocalStorage();

        const stored = localStorage.getItem(STORAGE_KEY);

        expect(JSON.parse(stored)).toEqual(state.transactions);
    });

    test("loads an empty array when localStorage has no saved data", () => {
        localStorage.removeItem(STORAGE_KEY);

        loadFromLocalStorage();

        expect(state.transactions).toEqual([]);
    });

    test("loads valid transactions from localStorage", () => {
        const validTransactions = [
            {
                id: "tx_001",
                title: "Salary",
                amount: 1200,
                category: "Salary",
                date: "2026-05-09",
            },
            {
                id: "tx_002",
                title: "Food",
                amount: -30,
                category: "Food",
                date: "2026-05-10",
            },
        ];

        localStorage.setItem(STORAGE_KEY, JSON.stringify(validTransactions));

        loadFromLocalStorage();

        expect(state.transactions).toEqual(validTransactions);
    });

    test("filters invalid transactions but keeps valid ones", () => {
        const mixedTransactions = [
            {
                id: "tx_001",
                title: "Salary",
                amount: 1200,
                category: "Salary",
                date: "2026-05-09",
            },
            {
                id: "tx_invalid_001",
                title: "Broken Amount",
                amount: "1200",
                category: "Salary",
                date: "2026-05-09",
            },
            {
                id: "tx_invalid_002",
                title: "Missing Date",
                amount: 50,
                category: "Other",
            },
        ];

        localStorage.setItem(STORAGE_KEY, JSON.stringify(mixedTransactions));

        loadFromLocalStorage();

        expect(state.transactions).toEqual([
            {
                id: "tx_001",
                title: "Salary",
                amount: 1200,
                category: "Salary",
                date: "2026-05-09",
            },
        ]);
    });

    test("does not throw when stored JSON is corrupted", () => {
        localStorage.setItem(STORAGE_KEY, "{bad json");

        expect(() => loadFromLocalStorage()).not.toThrow();

        expect(state.transactions).toEqual([]);
        expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
        expect(console.warn).toHaveBeenCalled();
    });

    test("resets localStorage when stored data is not an array", () => {
        const nonArrayData = {
            id: "tx_001",
            title: "Salary",
            amount: 1200,
            category: "Salary",
            date: "2026-05-09",
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(nonArrayData));

        expect(() => loadFromLocalStorage()).not.toThrow();

        expect(state.transactions).toEqual([]);
        expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
        expect(console.warn).toHaveBeenCalled();
    });

    test("resets localStorage when stored value is plain text", () => {
        localStorage.setItem(STORAGE_KEY, "not json at all");

        expect(() => loadFromLocalStorage()).not.toThrow();

        expect(state.transactions).toEqual([]);
        expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
        expect(console.warn).toHaveBeenCalled();
    });
});
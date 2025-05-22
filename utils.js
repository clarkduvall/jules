/**
 * Calculates the weekly allowance for a child.
 * @param {number} age - The age of the child.
 * @param {number} allowanceMultiplier - The parent-defined allowance multiplier.
 * @returns {number} The calculated weekly allowance.
 */
function calculateWeeklyAllowance(age, allowanceMultiplier) {
    if (age < 6) {
        return 0;
    }
    const standardWeeklyAllowance = age / 2;
    return standardWeeklyAllowance * allowanceMultiplier;
}

/**
 * Formats a transaction for display or storage.
 * @param {string} type - Type of transaction (e.g., 'Deposit', 'Withdrawal', 'Allowance').
 * @param {number} amount - The amount of the transaction.
 * @param {string} description - A brief description of the transaction.
 * @param {string} account - The account affected (e.g., 'Checking', 'Savings', 'Tithing').
 * @param {string} [customDate] - Optional custom date string (e.g., "YYYY-MM-DD"). If not provided, current date is used.
 * @returns {object} Transaction object with date, type, amount, description, and account.
 */
function formatTransaction(type, amount, description, account, customDate) {
    let transactionDate;
    if (customDate) {
        // Ensure the customDate (like "2023-10-26") is displayed in a consistent, readable format.
        // The toLocaleDateString() on a new Date(customDate) might vary by browser locale if not handled.
        // For simplicity, and if customDate is already in "YYYY-MM-DD" from a date input,
        // it can be stored as is, or reformatted. Using toLocaleDateString for consistency with previous entries.
        const dateObj = new Date(customDate + 'T00:00:00'); // Add time to avoid timezone issues with date-only strings
        transactionDate = dateObj.toLocaleDateString();
    } else {
        transactionDate = new Date().toLocaleDateString();
    }
    return {
        date: transactionDate,
        type: type,
        amount: parseFloat(amount).toFixed(2), // Ensure amount is a number and formatted
        description: description,
        account: account
    };
}

const ANNUAL_INTEREST_RATE_SCHEDULE = {
    6: 3.35,
    7: 1.72,
    8: 0.90,
    9: 0.49,
    10: 0.28,
    11: 0.18,
    12: 0.13,
    13: 0.11,
    14: 0.09,
    15: 0.09,
    16: 0.08,
    17: 0.08
};

/**
 * Returns the annual interest rate for a given age.
 * @param {number} age - The child's age.
 * @returns {number} The annual interest rate (e.g., 3.35 for 335%), or 0 if age is outside the schedule.
 */
function getAnnualInterestRate(age) {
    return ANNUAL_INTEREST_RATE_SCHEDULE[age] || 0;
}

/**
 * Calculates monthly interest.
 * @param {number} balance - The current savings balance.
 * @param {number} annualRate - The annual interest rate (e.g., 0.05 for 5%).
 * @returns {number} The calculated interest for one month.
 */
function calculateInterest(balance, annualRate) {
    if (balance <= 0 || annualRate <= 0) {
        return 0;
    }
    const monthlyRate = annualRate / 12;
    return balance * monthlyRate;
}

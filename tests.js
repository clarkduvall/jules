document.addEventListener('DOMContentLoaded', function() {
    const resultsList = document.getElementById('testResultsList');
    const summaryDiv = document.getElementById('testSummary');
    let testsPassed = 0;
    let testsTotal = 0;

    // --- Test Utilities ---
    function assertEquals(expected, actual, message) {
        testsTotal++;
        const li = document.createElement('li');
        if (expected === actual || (typeof expected === 'number' && typeof actual === 'number' && Math.abs(expected - actual) < 0.001)) { // Added tolerance for float comparison
            testsPassed++;
            li.className = 'test-pass';
            li.textContent = `PASS: ${message} (Expected: ${expected}, Got: ${actual})`;
        } else {
            li.className = 'test-fail';
            li.textContent = `FAIL: ${message} (Expected: ${expected}, Got: ${actual})`;
        }
        resultsList.appendChild(li);
    }

    function assert(condition, message) {
        testsTotal++;
        const li = document.createElement('li');
        if (condition) {
            testsPassed++;
            li.className = 'test-pass';
            li.textContent = `PASS: ${message}`;
        } else {
            li.className = 'test-fail';
            li.textContent = `FAIL: ${message}`;
        }
        resultsList.appendChild(li);
    }

    // --- Tests for utils.js ---

    // Test calculateWeeklyAllowance
    assertEquals(3, calculateWeeklyAllowance(6, 1.0), "calculateWeeklyAllowance: Age 6, Multiplier 1.0");
    assertEquals(5, calculateWeeklyAllowance(10, 1.0), "calculateWeeklyAllowance: Age 10, Multiplier 1.0");
    assertEquals(6, calculateWeeklyAllowance(12, 1.0), "calculateWeeklyAllowance: Age 12, Multiplier 1.0");
    assertEquals(0, calculateWeeklyAllowance(5, 1.0), "calculateWeeklyAllowance: Age 5 (under 6), Multiplier 1.0");
    assertEquals(2.5, calculateWeeklyAllowance(10, 0.5), "calculateWeeklyAllowance: Age 10, Multiplier 0.5");
    assertEquals(10, calculateWeeklyAllowance(10, 2.0), "calculateWeeklyAllowance: Age 10, Multiplier 2.0");

    // Test getAnnualInterestRate
    assertEquals(3.35, getAnnualInterestRate(6), "getAnnualInterestRate: Age 6"); // Rate is 335% -> 3.35
    assertEquals(0.28, getAnnualInterestRate(10), "getAnnualInterestRate: Age 10"); // Rate is 28% -> 0.28
    assertEquals(0.08, getAnnualInterestRate(17), "getAnnualInterestRate: Age 17"); // Rate is 8% -> 0.08
    assertEquals(0, getAnnualInterestRate(5), "getAnnualInterestRate: Age 5 (outside schedule)");
    assertEquals(0, getAnnualInterestRate(18), "getAnnualInterestRate: Age 18 (outside schedule)");

    // Test calculateInterest
    assertEquals(0.41666, calculateInterest(100, 0.05), "calculateInterest: Balance 100, Rate 5% (0.05)"); // (100 * 0.05) / 12
    assertEquals(8.33333, calculateInterest(1000, 0.10), "calculateInterest: Balance 1000, Rate 10% (0.10)"); // (1000 * 0.10) / 12
    assertEquals(0, calculateInterest(0, 0.05), "calculateInterest: Zero balance");
    assertEquals(0, calculateInterest(100, 0), "calculateInterest: Zero rate");
    // Test with a high rate from schedule, e.g., Age 6 (335% -> 3.35)
    assertEquals(27.91666, calculateInterest(100, 3.35), "calculateInterest: Balance 100, Rate 335% (3.35)"); // (100 * 3.35) / 12

    // --- Conceptual Tests ---

    // Test Allowance Distribution
    function testAllowanceDistribution(totalAllowance) {
        const checking = totalAllowance * 0.70;
        const savings = totalAllowance * 0.20;
        const tithing = totalAllowance * 0.10;
        return { checking, savings, tithing };
    }
    let dist = testAllowanceDistribution(10.00);
    assertEquals(7.00, dist.checking, "Allowance Distribution: Checking for $10 total");
    assertEquals(2.00, dist.savings, "Allowance Distribution: Savings for $10 total");
    assertEquals(1.00, dist.tithing, "Allowance Distribution: Tithing for $10 total");

    dist = testAllowanceDistribution(5.50); // Test with non-round numbers
    assertEquals(3.85, dist.checking, "Allowance Distribution: Checking for $5.50 total");
    assertEquals(1.10, dist.savings, "Allowance Distribution: Savings for $5.50 total");
    assertEquals(0.55, dist.tithing, "Allowance Distribution: Tithing for $5.50 total");

    // Test Cash Gift Distribution
    function simulateCashGiftDistribution(giftAmount, parentSavingsPercentage, annualCap, currentAnnualContribution) {
        const tithingAmount = giftAmount * 0.10;
        
        let savingsAmount = giftAmount * (parentSavingsPercentage / 100);
        const remainingAnnualSavingsAllowance = annualCap - currentAnnualContribution;
        
        if (savingsAmount > remainingAnnualSavingsAllowance) {
            savingsAmount = remainingAnnualSavingsAllowance > 0 ? remainingAnnualSavingsAllowance : 0;
        }
        
        const checkingAmount = giftAmount - tithingAmount - savingsAmount;
        
        return { tithing: tithingAmount, savings: savingsAmount, checking: checkingAmount, newAnnualContribution: currentAnnualContribution + savingsAmount };
    }

    // Case 1: No cap hit
    let giftDist = simulateCashGiftDistribution(100, 20, 50, 0); // Gift $100, 20% to savings, $50 annual cap, $0 contributed so far
    assertEquals(10.00, giftDist.tithing, "Cash Gift: Tithing (No cap)"); // 10% of 100
    assertEquals(20.00, giftDist.savings, "Cash Gift: Savings (No cap)"); // 20% of 100 = 20. Cap is 50. OK.
    assertEquals(70.00, giftDist.checking, "Cash Gift: Checking (No cap)"); // 100 - 10 - 20
    assertEquals(20.00, giftDist.newAnnualContribution, "Cash Gift: New Annual Savings Contribution (No cap)");

    // Case 2: Cap hit exactly
    giftDist = simulateCashGiftDistribution(100, 50, 50, 0); // Gift $100, 50% to savings, $50 cap, $0 contributed
    assertEquals(10.00, giftDist.tithing, "Cash Gift: Tithing (Cap hit exactly)");
    assertEquals(50.00, giftDist.savings, "Cash Gift: Savings (Cap hit exactly)"); // 50% of 100 = 50. Cap is 50. OK.
    assertEquals(40.00, giftDist.checking, "Cash Gift: Checking (Cap hit exactly)"); // 100 - 10 - 50
    assertEquals(50.00, giftDist.newAnnualContribution, "Cash Gift: New Annual Savings Contribution (Cap hit exactly)");

    // Case 3: Cap exceeded, savings limited
    giftDist = simulateCashGiftDistribution(100, 60, 50, 0); // Gift $100, 60% to savings, $50 cap, $0 contributed
    assertEquals(10.00, giftDist.tithing, "Cash Gift: Tithing (Cap exceeded)");
    assertEquals(50.00, giftDist.savings, "Cash Gift: Savings (Cap exceeded, limited to $50)"); // 60% of 100 = 60. Cap is 50. Limited to 50.
    assertEquals(40.00, giftDist.checking, "Cash Gift: Checking (Cap exceeded)"); // 100 - 10 - 50
    assertEquals(50.00, giftDist.newAnnualContribution, "Cash Gift: New Annual Savings Contribution (Cap exceeded)");

    // Case 4: Part of cap already used
    giftDist = simulateCashGiftDistribution(100, 20, 50, 40); // Gift $100, 20% to savings, $50 cap, $40 already contributed
    assertEquals(10.00, giftDist.tithing, "Cash Gift: Tithing (Cap partially used)");
    assertEquals(10.00, giftDist.savings, "Cash Gift: Savings (Cap partially used, limited to remaining $10)"); // 20% of 100 = 20. Remaining cap is 50-40=10. Limited to 10.
    assertEquals(80.00, giftDist.checking, "Cash Gift: Checking (Cap partially used)"); // 100 - 10 - 10
    assertEquals(50.00, giftDist.newAnnualContribution, "Cash Gift: New Annual Savings Contribution (Cap partially used)");
    
    // Case 5: Cap already fully used
    giftDist = simulateCashGiftDistribution(100, 20, 50, 50); // Gift $100, 20% to savings, $50 cap, $50 already contributed
    assertEquals(10.00, giftDist.tithing, "Cash Gift: Tithing (Cap fully used)");
    assertEquals(0.00, giftDist.savings, "Cash Gift: Savings (Cap fully used, $0 to savings)"); // Remaining cap is 0.
    assertEquals(90.00, giftDist.checking, "Cash Gift: Checking (Cap fully used)"); // 100 - 10 - 0
    assertEquals(50.00, giftDist.newAnnualContribution, "Cash Gift: New Annual Savings Contribution (Cap fully used)");


    // Test Transaction Logic (High-Level)
    // This requires mocking account balances.
    let mockAccounts = { checking: 100, savings: 50, tithing: 20 };

    // Test Deposit
    function simulateDeposit(account, amount, currentBalances) {
        const newBalances = { ...currentBalances };
        if (newBalances[account] !== undefined) {
            newBalances[account] += amount;
        }
        return newBalances;
    }
    let afterDeposit = simulateDeposit('checking', 50, mockAccounts);
    assertEquals(150, afterDeposit.checking, "Transaction: Deposit to Checking");
    assertEquals(50, afterDeposit.savings, "Transaction: Savings unchanged after Checking deposit");

    // Test Withdrawal (Sufficient Funds)
    function simulateWithdrawal(account, amount, currentBalances) {
        const newBalances = { ...currentBalances };
        if (newBalances[account] !== undefined && newBalances[account] >= amount) {
            newBalances[account] -= amount;
            return { balances: newBalances, success: true };
        }
        return { balances: currentBalances, success: false };
    }
    let afterWithdrawal = simulateWithdrawal('checking', 30, afterDeposit); // from 150
    assertEquals(120, afterWithdrawal.balances.checking, "Transaction: Withdrawal from Checking (Sufficient Funds)");
    assert(afterWithdrawal.success, "Transaction: Withdrawal success (Sufficient Funds)");

    // Test Withdrawal (Insufficient Funds)
    let insufficientWithdrawal = simulateWithdrawal('savings', 100, afterWithdrawal.balances); // savings is 50
    assertEquals(50, insufficientWithdrawal.balances.savings, "Transaction: Savings unchanged after failed withdrawal attempt");
    assert(!insufficientWithdrawal.success, "Transaction: Withdrawal failure (Insufficient Funds)");


    // --- Final Summary ---
    summaryDiv.textContent = `${testsPassed} out of ${testsTotal} tests passed.`;
    if (testsPassed === testsTotal) {
        summaryDiv.className = 'test-summary alert alert-success';
    } else {
        summaryDiv.className = 'test-summary alert alert-danger';
    }
});

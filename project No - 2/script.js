// Expense Tracker Plus JavaScript
// Handles all functionality: adding expenses, displaying data, filtering, exporting, and charting.
// Now with rupees currency, budget tracking, category limits, trends, and animated UI.

// Array to store all expenses, loaded from localStorage
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let budget = parseFloat(localStorage.getItem('budget')) || 0;
let categoryLimits = JSON.parse(localStorage.getItem('categoryLimits')) || {};
let isDarkTheme = localStorage.getItem('darkTheme') === 'true';

// DOM element references for easy access
const expenseForm = document.getElementById('expense-form');
const expenseList = document.getElementById('expense-list');
const totalExpenses = document.getElementById('total-expenses');
const transactionCount = document.getElementById('transaction-count');
const budgetRemaining = document.getElementById('budget-remaining');
const categorySummary = document.getElementById('category-summary');
const textChart = document.getElementById('text-chart');
const exportCsvBtn = document.getElementById('export-csv');
const dailyBtn = document.getElementById('daily-btn');
const weeklyBtn = document.getElementById('weekly-btn');
const monthlyBtn = document.getElementById('monthly-btn');
const budgetForm = document.getElementById('budget-form');
const budgetAmount = document.getElementById('budget-amount');
const progressFill = document.getElementById('progress-fill');
const budgetStatus = document.getElementById('budget-status');
const categoryLimitsContainer = document.getElementById('category-limits');
const weeklyTrend = document.getElementById('weekly-trend');
const lastWeekTrend = document.getElementById('last-week-trend');
const trendChange = document.getElementById('trend-change');
const clearAllBtn = document.getElementById('clear-all-btn');
const themeToggle = document.getElementById('theme-toggle');
const notifications = document.getElementById('notifications');

// Initialize the application on page load
function init() {
  updateDisplay();
  setDefaultDate();
  updateBudgetDisplay();
  updateCategoryLimits();
  updateTrends();
  applyTheme();
  showWelcomeNotification();
}

// Set the current date as default in the date input
function setDefaultDate() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('date').value = today;
  document.getElementById('budget-amount').value = budget > 0 ? budget : '';
}

// Apply the current theme
function applyTheme() {
  document.body.classList.toggle('dark-theme', isDarkTheme);
  themeToggle.textContent = isDarkTheme ? 'Light Theme' : 'Dark Theme';
}

// Show welcome notification
function showWelcomeNotification() {
  if (!localStorage.getItem('welcomeShown')) {
    setTimeout(() => {
      showNotification('Welcome to Expense Tracker Plus!', 'Track your expenses with advanced features like budgets and trends.', 'success');
      localStorage.setItem('welcomeShown', 'true');
    }, 1000);
  }
}

// Add a new expense to the list
function addExpense(amount, category, date) {
  const expense = {
    id: Date.now(), // Unique ID based on timestamp
    amount: parseFloat(amount),
    category,
    date: new Date(date)
  };
  expenses.push(expense);
  saveExpenses(); // Save to localStorage
  updateDisplay(); // Refresh all displays
  expenseForm.reset(); // Clear the form
  setDefaultDate(); // Reset date to today
}

// Remove an expense by ID
function deleteExpense(id) {
  expenses = expenses.filter(expense => expense.id !== id);
  saveExpenses();
  updateDisplay();
}

// Save expenses array to localStorage for persistence
function saveExpenses() {
  localStorage.setItem('expenses', JSON.stringify(expenses));
}

// Update all display elements
function updateDisplay() {
  updateExpenseList();
  updateTotals();
  updateCategorySummary();
  updateChart();
  updateBudgetDisplay();
  updateCategoryLimits();
  updateTrends();
  checkBudgetAlerts();
}

// Render the list of expenses in the UI
function updateExpenseList() {
  if (expenses.length === 0) {
    expenseList.innerHTML = '<p class="empty-state">No expenses added yet.</p>';
    return;
  }

  // Sort expenses by date (newest first)
  const sortedExpenses = expenses.sort((a, b) => b.date - a.date);
  expenseList.innerHTML = sortedExpenses.map(expense => `
    <div class="expense-item" style="animation: slideIn 0.5s ease-out;">
      <div class="expense-details">
        <div class="expense-amount">₹${expense.amount.toFixed(2)}</div>
        <div class="expense-category">${expense.category}</div>
        <div class="expense-date">${expense.date.toLocaleDateString()}</div>
      </div>
      <button class="delete-btn" onclick="deleteExpense(${expense.id})">Delete</button>
    </div>
  `).join('');
}

// Update total expenses and transaction count
function updateTotals() {
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  totalExpenses.textContent = `₹${total.toFixed(2)}`;
  transactionCount.textContent = expenses.length;
}

// Generate and display category-wise summary
function updateCategorySummary() {
  const categories = {};
  // Sum expenses by category
  expenses.forEach(expense => {
    categories[expense.category] = (categories[expense.category] || 0) + expense.amount;
  });

  if (Object.keys(categories).length === 0) {
    categorySummary.innerHTML = '<p class="empty-state">No data to display.</p>';
    return;
  }

  // Sort categories by total amount (highest first)
  const sortedCategories = Object.entries(categories)
    .sort(([,a], [,b]) => b - a)
    .map(([category, amount]) => `
      <div class="category-item">
        <span class="category-name">${category}</span>
        <span class="category-amount">₹${amount.toFixed(2)}</span>
      </div>
    `).join('');

  categorySummary.innerHTML = sortedCategories;
}

// Generate a simple text-based bar chart for categories
function updateChart() {
  const categories = {};
  expenses.forEach(expense => {
    categories[expense.category] = (categories[expense.category] || 0) + expense.amount;
  });

  if (Object.keys(categories).length === 0) {
    textChart.textContent = 'No data';
    return;
  }

  const maxAmount = Math.max(...Object.values(categories));
  const chartWidth = 20; // Maximum bar length

  // Create ASCII bar chart
  const chart = Object.entries(categories)
    .sort(([,a], [,b]) => b - a) // Sort by amount descending
    .map(([category, amount]) => {
      const barLength = Math.round((amount / maxAmount) * chartWidth);
      const bar = '█'.repeat(barLength);
      return `${category.padEnd(15)} | ${bar} ₹${amount.toFixed(2)}`;
    })
    .join('\n');

  textChart.textContent = chart;
}

// Filter expenses based on time period (daily, weekly, monthly)
function filterExpenses(period) {
  const now = new Date();
  let startDate;

  switch (period) {
    case 'daily':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'weekly':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'monthly':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    default:
      startDate = new Date(0); // All time
  }

  return expenses.filter(expense => expense.date >= startDate);
}

// Update displays with filtered expense data
function updateFilteredDisplay(filteredExpenses) {
  // Temporarily replace expenses for display functions
  const originalExpenses = expenses;
  expenses = filteredExpenses;

  updateTotals();
  updateCategorySummary();
  updateChart();

  // Restore original expenses
  expenses = originalExpenses;
}

// Export expenses data to CSV file
function exportToCSV() {
  if (expenses.length === 0) {
    alert('No expenses to export.');
    return;
  }

  // Create CSV content
  const csvContent = [
    ['Date', 'Category', 'Amount (₹)'], // Header row
    ...expenses.map(expense => [
      expense.date.toISOString().split('T')[0], // Format date as YYYY-MM-DD
      expense.category,
      expense.amount.toFixed(2)
    ])
  ].map(row => row.join(',')).join('\n');

  // Create and download the CSV file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'expenses.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Set the active filter button
function setActiveFilter(activeBtn) {
  [dailyBtn, weeklyBtn, monthlyBtn].forEach(btn => btn.classList.remove('active'));
  activeBtn.classList.add('active');
}

// Budget Management Functions
function setBudget(amount) {
  budget = parseFloat(amount);
  localStorage.setItem('budget', budget);
  updateBudgetDisplay();
  showNotification('Budget Set', `Monthly budget set to ₹${budget.toFixed(2)}`, 'success');
}

function updateBudgetDisplay() {
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remaining = budget - total;

  if (budget > 0) {
    budgetRemaining.textContent = `₹${remaining.toFixed(2)}`;
    const percentage = Math.min((total / budget) * 100, 100);
    progressFill.style.width = `${percentage}%`;

    if (remaining < 0) {
      budgetStatus.textContent = `Over budget by ₹${Math.abs(remaining).toFixed(2)}`;
      progressFill.style.background = 'var(--danger)';
    } else if (remaining < budget * 0.1) {
      budgetStatus.textContent = 'Budget almost exhausted';
      progressFill.style.background = 'var(--warning)';
    } else {
      budgetStatus.textContent = `${percentage.toFixed(1)}% of budget used`;
      progressFill.style.background = 'linear-gradient(90deg, var(--success), var(--warning), var(--danger))';
    }
  } else {
    budgetRemaining.textContent = '₹0.00';
    progressFill.style.width = '0%';
    budgetStatus.textContent = 'No budget set';
  }
}

function checkBudgetAlerts() {
  if (budget === 0) return;

  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const percentage = (total / budget) * 100;

  if (percentage >= 100 && !localStorage.getItem('budgetExceededAlert')) {
    showNotification('Budget Exceeded!', `You've exceeded your ₹${budget} monthly budget.`, 'error');
    localStorage.setItem('budgetExceededAlert', 'true');
  } else if (percentage >= 80 && !localStorage.getItem('budgetWarningAlert')) {
    showNotification('Budget Warning', `You've used ${percentage.toFixed(1)}% of your ₹${budget} budget.`, 'warning');
    localStorage.setItem('budgetWarningAlert', 'true');
  }
}

// Category Limits Functions
function updateCategoryLimits() {
  categoryLimitsContainer.innerHTML = '';

  Object.entries(categoryLimits).forEach(([category, limit]) => {
    const spent = expenses
      .filter(expense => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0);

    const isOverLimit = spent > limit;
    const percentage = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;

    const limitItem = document.createElement('div');
    limitItem.className = `limit-item ${isOverLimit ? 'over-limit' : ''}`;
    limitItem.innerHTML = `
      <span class="limit-name">${category}</span>
      <span class="limit-amount">₹${spent.toFixed(2)} / ₹${limit.toFixed(2)} (${percentage.toFixed(1)}%)</span>
      <button class="btn btn-secondary" onclick="removeCategoryLimit('${category}')">Remove</button>
    `;

    categoryLimitsContainer.appendChild(limitItem);
  });

  // Add form to set new limits
  if (Object.keys(categoryLimits).length < 5) {
    const addLimitForm = document.createElement('div');
    addLimitForm.innerHTML = `
      <form id="limit-form" style="margin-top: 16px;">
        <div class="form-group" style="display: flex; gap: 8px; align-items: end;">
          <div style="flex: 1;">
            <label for="limit-category">Category</label>
            <select id="limit-category" required>
              <option value="">Select Category</option>
              <option value="Food">Food</option>
              <option value="Transportation">Transportation</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Utilities">Utilities</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Shopping">Shopping</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div style="flex: 1;">
            <label for="limit-amount">Limit (₹)</label>
            <input type="number" id="limit-amount" step="0.01" min="0" required />
          </div>
          <button type="submit" class="btn btn-primary">Set Limit</button>
        </div>
      </form>
    `;
    categoryLimitsContainer.appendChild(addLimitForm);

    // Add event listener for limit form
    document.getElementById('limit-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const category = document.getElementById('limit-category').value;
      const amount = document.getElementById('limit-amount').value;
      if (category && amount) {
        categoryLimits[category] = parseFloat(amount);
        localStorage.setItem('categoryLimits', JSON.stringify(categoryLimits));
        updateCategoryLimits();
        showNotification('Limit Set', `Category limit for ${category} set to ₹${parseFloat(amount).toFixed(2)}`, 'success');
      }
    });
  }
}

function removeCategoryLimit(category) {
  delete categoryLimits[category];
  localStorage.setItem('categoryLimits', JSON.stringify(categoryLimits));
  updateCategoryLimits();
  showNotification('Limit Removed', `Category limit for ${category} removed.`, 'info');
}

// Trends Functions
function updateTrends() {
  const now = new Date();
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lastWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const lastWeekEnd = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const thisWeekExpenses = expenses.filter(expense => expense.date >= weekStart);
  const lastWeekExpenses = expenses.filter(expense =>
    expense.date >= lastWeekStart && expense.date < lastWeekEnd
  );

  const thisWeekTotal = thisWeekExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const lastWeekTotal = lastWeekExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  weeklyTrend.textContent = `₹${thisWeekTotal.toFixed(2)}`;
  lastWeekTrend.textContent = `₹${lastWeekTotal.toFixed(2)}`;

  const change = lastWeekTotal > 0 ? ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100 : 0;
  trendChange.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  trendChange.className = `trend-change ${change >= 0 ? 'negative' : 'positive'}`;
}

// Notification System
function showNotification(title, message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <button class="notification-close" onclick="this.parentElement.remove()">&times;</button>
    <h4>${title}</h4>
    <p>${message}</p>
  `;

  notifications.appendChild(notification);

  // Trigger animation
  setTimeout(() => notification.classList.add('show'), 10);

  // Auto remove after 5 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

// Theme Toggle
function toggleTheme() {
  isDarkTheme = !isDarkTheme;
  localStorage.setItem('darkTheme', isDarkTheme);
  applyTheme();
  showNotification('Theme Changed', `Switched to ${isDarkTheme ? 'dark' : 'light'} theme`, 'info');
}

// Clear All Data
function clearAllData() {
  if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
    expenses = [];
    budget = 0;
    categoryLimits = {};
    localStorage.clear();
    updateDisplay();
    showNotification('Data Cleared', 'All expense data has been cleared.', 'warning');
  }
}

// Event listeners for user interactions

// Handle form submission to add new expense
expenseForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const amount = document.getElementById('amount').value;
  const category = document.getElementById('category').value;
  const date = document.getElementById('date').value;

  if (amount && category && date) {
    addExpense(amount, category, date);
    showNotification('Expense Added', `₹${parseFloat(amount).toFixed(2)} expense added to ${category}`, 'success');
  }
});

// Handle budget form submission
budgetForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const amount = budgetAmount.value;
  if (amount && parseFloat(amount) > 0) {
    setBudget(amount);
    budgetForm.reset();
  }
});

// Handle CSV export button click
exportCsvBtn.addEventListener('click', exportToCSV);

// Handle filter button clicks
dailyBtn.addEventListener('click', () => {
  setActiveFilter(dailyBtn);
  updateFilteredDisplay(filterExpenses('daily'));
});

weeklyBtn.addEventListener('click', () => {
  setActiveFilter(weeklyBtn);
  updateFilteredDisplay(filterExpenses('weekly'));
});

monthlyBtn.addEventListener('click', () => {
  setActiveFilter(monthlyBtn);
  updateFilteredDisplay(filterExpenses('monthly'));
});

// Handle quick action buttons
clearAllBtn.addEventListener('click', clearAllData);
themeToggle.addEventListener('click', toggleTheme);

// Initialize the app when the page loads
init();
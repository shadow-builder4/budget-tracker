const balance = document.getElementById('balance');
const money_plus = document.getElementById('money-plus');
const money_minus = document.getElementById('money-minus');
const list = document.getElementById('list');
const form = document.getElementById('form');
const amount = document.getElementById('amount');
const advisor = document.getElementById('advisor');
const formHeading = document.getElementById('form-heading');
const submitBtn = document.getElementById('submit-btn');
const formMonth = document.getElementById('form-month');
const formDate = document.getElementById('form-date');
const incomeGroup = document.getElementById('income-group');
const expenseGroup = document.getElementById('expense-group');
const incomeCategory = document.getElementById('income-category');
const expenseCategory = document.getElementById('expense-category');
const barNeeds = document.getElementById('bar-needs');
const barWants = document.getElementById('bar-wants');
const barSavings = document.getElementById('bar-savings');
const labelNeeds = document.getElementById('label-needs');
const labelWants = document.getElementById('label-wants');
const labelSavings = document.getElementById('label-savings');

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let editId = null;

const monthsArray = ["January","February","March","April","May","June","July","August","September","October","November","December"];
formMonth.value = monthsArray[new Date().getMonth()];

function toggleDropdowns() {
  const mode = document.querySelector('input[name="txType"]:checked').value;
  incomeGroup.style.display = (mode === 'income') ? 'block' : 'none';
  expenseGroup.style.display = (mode === 'expense') ? 'block' : 'none';
}

function addTransaction(e) {
  e.preventDefault();
  const valText = amount.value.trim();
  if (valText === '' || isNaN(valText) || parseFloat(valText) <= 0) {
    alert('Please enter a valid positive number.');
    return;
  }
  
  const mode = document.querySelector('input[name="txType"]:checked').value;
  let transactionVal = parseFloat(valText);
  let selectedCategory = (mode === 'income') ? incomeCategory.value : expenseCategory.value;
  const customLabel = formDate.value.trim() ? formDate.value.trim() : selectedCategory;
  const targetMonth = formMonth.value;

  if (mode === 'expense') transactionVal = -transactionVal;
  
  if (editId !== null) {
    transactions = transactions.map(t => t.id === editId ? { id: editId, text: customLabel, amount: transactionVal, rawCat: selectedCategory, month: targetMonth } : t);
    editId = null;
    formHeading.innerText = "Add New Transaction";
    submitBtn.innerText = "Record Transaction";
    submitBtn.style.background = "#2c3e50";
  } else {
    transactions.push({ id: Math.floor(Math.random() * 100000000), text: customLabel, amount: transactionVal, rawCat: selectedCategory, month: targetMonth });
  }
  
  localStorage.setItem('transactions', JSON.stringify(transactions));
  init();
  amount.value = '';
  formDate.value = '';
}

function addTransactionDOM(transaction) {
  const sign = transaction.amount < 0 ? '-' : '+';
  const item = document.createElement('li');
  item.classList.add(transaction.amount < 0 ? 'minus' : 'plus');
  item.innerHTML = `<div><strong>${transaction.text}</strong> <small style="color:#7f8c8d;">(${transaction.month || 'General'})</small></div><div><span>${sign}₹${Math.abs(transaction.amount).toFixed(2)}</span><button type="button" class="edit-btn" onclick="editTransaction(${transaction.id})">Edit</button><button type="button" class="delete-btn" onclick="removeTransaction(${transaction.id})">Delete</button></div>`;
  list.appendChild(item);
}

function editTransaction(id) {
  const target = transactions.find(t => t.id === id);
  if (!target) return;
  editId = id;
  amount.value = Math.abs(target.amount);
  formDate.value = target.text;
  formMonth.value = target.month || monthsArray[new Date().getMonth()];
  if (target.amount >= 0) {
    document.getElementById('type-income').checked = true;
    if(target.rawCat) incomeCategory.value = target.rawCat;
  } else {
    document.getElementById('type-expense').checked = true;
    if(target.rawCat) expenseCategory.value = target.rawCat;
  }
  toggleDropdowns();
  formHeading.innerText = `✏️ Editing Entry: ${target.text}`;
  submitBtn.innerText = "Save Updated Value";
  submitBtn.style.background = "#f1c40f";
  formHeading.scrollIntoView({ behavior: 'smooth' });
}

function removeTransaction(id) {
  if(editId === id) { editId = null; formHeading.innerText = "Add New Transaction"; submitBtn.innerText = "Record Transaction"; submitBtn.style.background = "#2c3e50"; amount.value = ''; formDate.value = ''; }
  transactions = transactions.filter(t => t.id !== id);
  localStorage.setItem('transactions', JSON.stringify(transactions));
  init();
}

function updateValues() {
  const amounts = transactions.map(t => t.amount);
  const expense = amounts.filter(item => item < 0).reduce((acc, item) => (acc += item), 0) * -1;
  let calculatedIncomePool = transactions.filter(item => item.amount > 0 && item.rawCat !== "Salary (Annually)").reduce((acc, item) => (acc += item.amount), 0);
  
  transactions.forEach(t => {
    if(t.amount > 0 && t.rawCat === "Salary (Annually)") calculatedIncomePool += (t.amount / 12);
  });

  balance.innerText = `₹${(calculatedIncomePool - expense).toFixed(2)}`;
  money_plus.innerText = `+₹${calculatedIncomePool.toFixed(2)}`;
  money_minus.innerText = `-₹${expense.toFixed(2)}`;
  list.innerHTML = '';
  transactions.forEach(addTransactionDOM);

  let needsVal = 0, wantsVal = 0, savingsVal = 0;
  transactions.forEach(t => {
    if (t.amount < 0) {
      const absAmt = Math.abs(t.amount);
      const cat = t.rawCat || t.text;
      
      // CRUCIAL UPDATED EXPENDITURE FILTER CLASSIFICATIONS LOGIC ROW
      if (cat.startsWith('Groceries') || cat.startsWith('Rent/Bills') || cat.startsWith('Medical/Hospital')) {
        needsVal += absAmt;
      } else if (cat.startsWith('Dining Out') || cat.startsWith('Entertainment') || cat.startsWith('Travel/Fuel') || cat.startsWith('Other Expense')) {
        wantsVal += absAmt;
      } else if (cat.startsWith('Investment') || cat.startsWith('Education/Fees')) {
        savingsVal += absAmt;
      }
    } else {
      const cat = t.rawCat || t.text;
      if (cat.startsWith('Investments Return')) savingsVal += t.amount;
    }
  });

  if (calculatedIncomePool > 0) {
    const nPct = Math.min((needsVal / calculatedIncomePool) * 100, 100).toFixed(0);
    const wPct = Math.min((wantsVal / calculatedIncomePool) * 100, 100).toFixed(0);
    const sPct = Math.min((savingsVal / calculatedIncomePool) * 100, 100).toFixed(0);
    barNeeds.style.width = `${nPct}%`; barWants.style.width = `${wPct}%`; barSavings.style.width = `${sPct}%`;
    labelNeeds.innerText = `${nPct}% (Target: 50%)`; labelWants.innerText = `${wPct}% (Target: 30%)`; labelSavings.innerText = `${sPct}% (Target: 20%)`;
  } else {
    barNeeds.style.width = '0%'; barWants.style.width = '0%'; barSavings.style.width = '0%';
    labelNeeds.innerText = '0%'; labelWants.innerText = '0%'; labelSavings.innerText = '0%';
  }

  if (calculatedIncomePool === 0 && expense === 0) {
    advisor.className = "advisor-box"; advisor.innerText = "Start adding transactions to receive automated financial budget feedback.";
  } else {
    const ratio = (expense / calculatedIncomePool) * 100;
    if (ratio > 70) {
      advisor.className = "advisor-box advisor-warning"; advisor.innerText = `⚠️ High Outflow Alert: You have spent ${ratio.toFixed(1)}% of your earnings. Restrain discretionary spending immediately.`;
    } else {
      advisor.className = "advisor-box advisor-good"; advisor.innerText = `🌱 Excellent Discipline: Your spending profile is healthy (${ratio.toFixed(1)}% used).`;
    }
  }
}

function clearCurrentLedger() { if(confirm("Wipe current ledger cache clean?")) { transactions = []; localStorage.setItem('transactions', JSON.stringify(transactions)); init(); } }
function clearAllData() { if(confirm("Hard reset dashboard files entirely?")) { localStorage.clear(); location.reload(); } }
function init() { updateValues(); }
form.addEventListener('submit', addTransaction);
init();

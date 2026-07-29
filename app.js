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
const runwayDisplay = document.getElementById('runway-display');
const velocityDisplay = document.getElementById('velocity-display');
const clearLedgerBtn = document.getElementById('clear-ledger-btn');
const resetAllBtn = document.getElementById('reset-all-btn');

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let editId = null;
const monthsArray = ["January","February","March","April","May","June","July","August","September","October","November","December"];
formMonth.value = monthsArray[new Date().getMonth()];

// 🔥 INSTANT VISUAL TABS HIGHLIGHTER LOGIC ENGINE
function toggleDropdowns() {
  const mode = document.querySelector('input[name="txType"]:checked').value;
  const incomeTab = document.querySelector('.option-income');
  const expenseTab = document.querySelector('.option-expense');
  
  if (mode === 'income') {
    incomeGroup.style.display = 'block';
    expenseGroup.style.display = 'none';
    
    // Force direct Neon Green highlighting onto the Income card tab
    incomeTab.style.background = 'rgba(6, 214, 160, 0.15)';
    incomeTab.style.border = '1px solid #06d6a0';
    incomeTab.style.boxShadow = '0 0 15px rgba(6, 214, 160, 0.3)';
    
    // Clear out Expense card styles completely
    expenseTab.style.background = '#0b1329';
    expenseTab.style.border = '1px solid #3a506b';
    expenseTab.style.boxShadow = 'none';
  } else {
    incomeGroup.style.display = 'none';
    expenseGroup.style.display = 'block';
    
    // Force direct Neon Red highlighting onto the Expense card tab
    expenseTab.style.background = 'rgba(255, 90, 95, 0.15)';
    expenseTab.style.border = '1px solid #ff5a5f';
    expenseTab.style.boxShadow = '0 0 15px rgba(255, 90, 95, 0.3)';
    
    // Clear out Income card styles completely
    incomeTab.style.background = '#0b1329';
    incomeTab.style.border = '1px solid #3a506b';
    incomeTab.style.boxShadow = 'none';
  }
}

function filterLedgerSearch() {
  const query = document.getElementById('search-bar').value.toLowerCase();
  Array.from(list.getElementsByTagName('li')).forEach(item => {
    item.style.display = item.textContent.toLowerCase().includes(query) ? 'flex' : 'none';
  });
}

function exportDataCSV() {
  if (!transactions.length) { alert("Ledger registry is empty. Action aborted."); return; }
  let csv = "data:text/csv;charset=utf-8,Month,Label,Category,Amount (INR)\n";
  transactions.forEach(t => csv += `${t.month},"${t.text.replace(/"/g, '""')}",${t.rawCat || 'Unallocated'},${t.amount}\n`);
  const link = document.createElement("a");
  link.setAttribute("href", encodeURI(csv));
  link.setAttribute("download", `Budget_Report.csv`);
  document.body.appendChild(link); link.click(); document.body.removeChild(link);
}

function addTransaction(e) {
  e.preventDefault();
  const valText = amount.value.trim();
  formDate.classList.remove('error-border'); 
  amount.classList.remove('error-border');

  if (valText === '' || isNaN(valText) || parseFloat(valText) <= 0) {
    amount.classList.add('error-border'); 
    alert('Please enter a valid positive amount.'); 
    return;
  }
  
  const mode = document.querySelector('input[name="txType"]:checked').value;
  let amtVal = parseFloat(valText);
  let catSel = (mode === 'income') ? incomeCategory.value : expenseCategory.value;
  const labelVal = formDate.value.trim() !== '' ? formDate.value.trim() : catSel;

  if (mode === 'expense') amtVal = -amtVal;
  
  if (editId !== null) {
    transactions = transactions.map(t => t.id === editId ? { id: editId, text: labelVal, amount: amtVal, rawCat: catSel, month: formMonth.value } : t);
    editId = null; 
    formHeading.innerText = "Add New Transaction";
    submitBtn.innerText = "Record Transaction"; 
    submitBtn.style.background = "#38bdf8"; 
    submitBtn.style.color = "#0f172a";
  } else {
    transactions.push({ id: Math.floor(Math.random() * 100000000), text: labelVal, amount: amtVal, rawCat: catSel, month: formMonth.value });
  }
  localStorage.setItem('transactions', JSON.stringify(transactions)); 
  init();
  amount.value = ''; 
  formDate.value = '';
}

function addTransactionDOM(t) {
  const sign = t.amount < 0 ? '-' : '+';
  const item = document.createElement('li');
  item.className = t.amount < 0 ? 'minus' : 'plus';
  item.innerHTML = `<div><strong>${t.text}</strong> <small style="color:#94a3b8;">(${t.month})</small></div><div class="action-group"><span>${sign}₹${Math.abs(t.amount).toFixed(2)}</span><button type="button" class="edit-btn" onclick="editTransaction(${t.id})">Edit</button><button type="button" class="delete-btn" onclick="removeTransaction(${t.id})">Delete</button></div>`;
  list.appendChild(item);
}

function editTransaction(id) {
  const target = transactions.find(t => t.id === id); if (!target) return;
  editId = id; 
  amount.value = Math.abs(target.amount).toFixed(2); 
  formDate.value = target.text; 
  formMonth.value = target.month;
  
  if (target.amount >= 0) {
    document.getElementById('type-income').checked = true; 
    incomeCategory.value = target.rawCat || 'Salary (Monthly)';
  } else {
    document.getElementById('type-expense').checked = true; 
    expenseCategory.value = target.rawCat || 'Groceries';
  }
  toggleDropdowns(); 
  formHeading.innerText = `✏️ Editing Entry: ${target.text}`;
  submitBtn.innerText = "Save Updated Value"; 
  submitBtn.style.background = "#fbbf24"; 
  submitBtn.style.color = "#0f172a";
  formHeading.scrollIntoView({ behavior: 'smooth' });
}

function removeTransaction(id) {
  if(editId === id) { editId = null; formHeading.innerText = "Add New Transaction"; submitBtn.innerText = "Record Transaction"; submitBtn.style.background = "#38bdf8"; amount.value = ''; formDate.value = ''; }
  transactions = transactions.filter(t => t.id !== id); 
  localStorage.setItem('transactions', JSON.stringify(transactions)); 
  init();
}

function updateValues() {
  const expense = transactions.filter(t => t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0);
  let income = transactions.filter(t => t.amount > 0 && t.rawCat !== "Salary (Annually)").reduce((acc, t) => acc + t.amount, 0);
  transactions.forEach(t => { if(t.amount > 0 && t.rawCat === "Salary (Annually)") income += (t.amount / 12); });

  const total = income - expense;
  balance.innerText = `₹${total.toFixed(2)}`; 
  money_plus.innerText = `+₹${income.toFixed(2)}`; 
  money_minus.innerText = `-₹${expense.toFixed(2)}`;

  velocityDisplay.innerText = income > 0 ? `${((income - expense) / income * 100).toFixed(1)}%` : "0.0%";
  velocityDisplay.style.color = (income > 0 && ((income - expense) / income) * 100 >= 20) ? '#06d6a0' : '#fbbf24';

  if(expense > 0 && total > 0) {
    const monthsCount = new Set(transactions.map(t => t.month)).size || 1;
    runwayDisplay.innerText = `${(total / (expense / monthsCount)).toFixed(1)} Months`;
    runwayDisplay.style.color = ((total / (expense / monthsCount)) >= 6) ? '#38bdf8' : '#f87171';
  } else {
    runwayDisplay.innerText = "0.0 Months"; runwayDisplay.style.color = '#94a3b8';
  }

  list.innerHTML = ''; 
  transactions.forEach(addTransactionDOM);
  let nVal = 0, wVal = 0, sVal = 0;

  transactions.forEach(t => {
    if (t.amount < 0) {
      const abs = Math.abs(t.amount); 
      const c = t.rawCat || t.text;
      if (c === 'Groceries' || c === 'Rent/Bills' || c === 'Medical/Hospital') nVal += abs;
      else if (c === 'Dining Out' || c === 'Entertainment' || c === 'Travel/Fuel' || c === 'Other Expense') wVal += abs;
      else if (c === 'Investment' || c === 'Education/Fees') sVal += abs;
    } else {
      if ((t.rawCat || t.text).startsWith('Investments Return')) sVal += t.amount;
    }
  });

  if (income > 0) {
    const nPct = Math.min((nVal / income) * 100, 100).toFixed(0);
    const wPct = Math.min((wVal / income) * 100, 100).toFixed(0);
    const sPct = Math.min((sVal / income) * 100, 100).toFixed(0);
    barNeeds.style.width = `${nPct}%`; barWants.style.width = `${wPct}%`; barSavings.style.width = `${sPct}%`;
    labelNeeds.innerText = `${nPct}%`; labelWants.innerText = `${wPct}%`; labelSavings.innerText = `${sPct}%`;
  } else {
    barNeeds.style.width = '0%'; barWants.style.width = '0%'; barSavings.style.width = '0%';
    labelNeeds.innerText = '0%'; labelWants.innerText = '0%'; labelSavings.innerText = '0%';
  }

  if (!income && !expense) {
    advisor.className = "advisor-box"; advisor.innerText = "Start adding transactions to receive automated financial budget feedback.";
  } else {
    const ratio = (expense / income) * 100;
    advisor.className = ratio > 70 ? "advisor-box advisor-warning" : "advisor-box advisor-good";

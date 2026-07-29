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

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let editId = null;
const monthsArray = ["January","February","March","April","May","June","July","August","September","October","November","December"];
formMonth.value = monthsArray[new Date().getMonth()];

function toggleDropdowns() {
  const mode = document.querySelector('input[name="txType"]:checked').value;
  incomeGroup.style.display = (mode === 'income') ? 'block' : 'none';
  expenseGroup.style.display = (mode === 'expense') ? 'block' : 'none';
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
  link.setAttribute("download", `Executive_Asset_Statement.csv`);
  document.body.appendChild(link); link.click(); document.body.removeChild(link);
}

function addTransaction(e) {
  e.preventDefault();
  const valText = amount.value.trim();
  formDate.classList.remove('error-border'); amount.classList.remove('error-border');

  if (valText === '' || isNaN(valText) || parseFloat(valText) <= 0) {
    amount.classList.add('error-border'); alert('Invalid financial metric input value.'); return;
  }
  
  const mode = document.querySelector('input[name="txType"]:checked').value;
  let amtVal = parseFloat(valText);
  let catSel = (mode === 'income') ? incomeCategory.value : expenseCategory.value;
  const labelVal = formDate.value.trim() !== '' ? formDate.value.trim() : catSel;

  if (mode === 'expense') amtVal = -amtVal;
  
  if (editId !== null) {
    transactions = transactions.map(t => t.id === editId ? { id: editId, text: labelVal, amount: amtVal, rawCat: catSel, month: formMonth.value } : t);
    editId = null; formHeading.innerText = "Execute Allocation Registry Entry";
    submitBtn.innerText = "Execute Registry Record"; submitBtn.style.background = "#38bdf8"; submitBtn.style.color = "#0f172a";
  } else {
    transactions.push({ id: Math.floor(Math.random() * 100000000), text: labelVal, amount: amtVal, rawCat: catSel, month: formMonth.value });
  }
  localStorage.setItem('transactions', JSON.stringify(transactions)); init();
  amount.value = ''; formDate.value = '';
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
  editId = id; amount.value = Math.abs(target.amount).toFixed(2); formDate.value = target.text; formMonth.value = target.month;
  if (target.amount >= 0) {
    document.getElementById('type-income').checked = true; incomeCategory.value = target.rawCat || '';
  } else {
    document.getElementById('type-expense').checked = true; expenseCategory.value = target.rawCat || '';
  }
  toggleDropdowns(); formHeading.innerText = `✏️ Modifying Archive Registry: ${target.text}`;
  submitBtn.innerText = "Commit Adjusted Values"; submitBtn.style.background = "#fbbf24"; submitBtn.style.color = "#0f172a";
  formHeading.scrollIntoView({ behavior: 'smooth' });
}

function removeTransaction(id) {
  if(editId === id) { editId = null; formHeading.innerText = "Execute Allocation Registry Entry"; submitBtn.innerText = "Execute Registry Record"; submitBtn.style.background = "#38bdf8"; amount.value = ''; formDate.value = ''; }
  transactions = transactions.filter(t => t.id !== id); localStorage.setItem('transactions', JSON.stringify(transactions)); init();
}

function updateValues() {
  const expense = transactions.filter(t => t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0);
  let income = transactions.filter(t => t.amount > 0 && t.rawCat !== "Salary (Annually)").reduce((acc, t) => acc + t.amount, 0);
  transactions.forEach(t => { if(t.amount > 0 && t.rawCat === "Salary (Annually)") income += (t.amount / 12); });

  const total = income - expense;
  balance.innerText = `₹${total.toFixed(2)}`; money_plus.innerText = `+₹${income.toFixed(2)}`; money_minus.innerText = `-₹${expense.toFixed(2)}`;

  velocityDisplay.innerText = income > 0 ? `${((income - expense) / income * 100).toFixed(1)}% Retained` : "0.0% Retained";
  velocityDisplay.style.color = (income > 0 && ((income - expense) / income) * 100 >= 20) ? '#4ade80' : '#fbbf24';

  if(expense > 0 && total > 0) {
    const monthsCount = new Set(transactions.map(t => t.month)).size || 1;
    runwayDisplay.innerText = `${(total / (expense / monthsCount)).toFixed(1)} Months`;
    runwayDisplay.style.color = ((total / (expense / monthsCount)) >= 6) ? '#38bdf8' : '#f87171';
  } else {
    runwayDisplay.innerText = "0.0 Months Survival"; runwayDisplay.style.color = '#94a3b8';
  }

  list.innerHTML = ''; transactions.forEach(addTransactionDOM);
  let nVal = 0, wVal = 0, sVal = 0;

  transactions.forEach(t => {
    if (t.amount < 0) {
      const abs = Math.abs(t.amount); const c = t.rawCat || t.text;
      if (c.startsWith('Groceries') || c.startsWith('Rent/Bills') || c.startsWith('Medical/Hospital')) nVal += abs;
      else if (c.startsWith('Dining Out') || c.startsWith('Entertainment') || c.startsWith('Travel/Fuel') || c.startsWith('Other Expense')) wVal += abs;
      else if (c.startsWith('Investment') || c.startsWith('Education/Fees')) sVal += abs;
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
    advisor.className = "advisor-box"; advisor.innerText = "Initialize transactional allocation ledger matrices to activate predictive algorithmic resource feedback loops.";
  } else {
    const ratio = (expense / income) * 100;
    advisor.className = ratio > 70 ? "advisor-box advisor-warning" : "advisor-box advisor-good";
    advisor.innerText = ratio > 70 ? `⚠️ Critical Variance Warning: Outbound capital distribution limits breached (${ratio.toFixed(1)}% consumption index). Contract discretionary liabilities.` : `🌱 Capital Equilibrium Intact: Portfolio alignment scales securely within baseline target thresholds (${ratio.toFixed(1)}% consumption index).`;
  }
}

function clearCurrentLedger() { if(confirm("Purge current visible interface ledger state? Core registers remain secure.")) { transactions = []; localStorage.setItem('transactions', JSON.stringify(transactions)); init(); } }
function clearAllData() { if(confirm("Execute global system memory override wipe? This actions permanent database clean reset.")) { localStorage.clear(); location.reload(); } }
function init() { updateValues(); }
form.addEventListener('submit', addTransaction);
init();

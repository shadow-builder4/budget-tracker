/* ==========================================================================
   ANTI-THEFT ENVIRONMENT SANDBOX FIREWALL INJECTION
   ========================================================================== */
(function() {
  const secureDomain = "shadow-builder4.github.io";
  if (window.location.hostname !== secureDomain && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    alert("⛔ CRITICAL SAFETY ERROR: Unauthorized application clone detected. Execution halted.");
    document.body.innerHTML = "<h1 style='color:#ef4444; text-align:center; margin-top:20%; font-family:sans-serif;'>CRITICAL ERROR: UNAUTHORIZED INSTANCE CORE DUMPED</h1>";
    throw new Error("Core code execution intercepted on unverified domain context layer.");
  }
  document.addEventListener('contextmenu', function(e) { e.preventDefault(); });
  document.addEventListener('keydown', function(e) {
    if (e.keyCode === 123 || (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) || (e.ctrlKey && e.keyCode === 85)) { e.preventDefault(); return false; }
  });
  setInterval(function() {
    function dynamicDebugger(i) {
      if (("" + i / i).length !== 1 || i % 20 === 0) { (function() {}).constructor("debugger")(); } else { (function() {}).constructor("debugger")(); }
      dynamicDebugger(++i);
    }
    try { dynamicDebugger(0); } catch(e) {}
  }, 1000);
})();

/* ==========================================================================
   CORE APPLICATION DOM LOCATOR REGISTRIES
   ========================================================================== */
const balance = document.getElementById('balance');
const money_plus = document.getElementById('money-plus');
const money_minus = document.getElementById('money-minus');
const list = document.getElementById('list');
const form = document.getElementById('form');
const amount = document.getElementById('amount');
const advisor = document.getElementById('advisor');
const submitBtn = document.getElementById('submit-btn');
const formTransactionDate = document.getElementById('form-transaction-date');
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
const resetAllBtn = document.getElementById('reset-all-btn');

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let editId = null;
let currentSelectedType = 'income';

if (formTransactionDate) {
  formTransactionDate.value = "";
}

function showToast(message, classType = 'toast-success') {
  const container = document.getElementById('toast-container');
  if(!container) return;
  const toast = document.createElement('div');
  toast.className = `toast-message ${classType}`;
  toast.innerText = message;
  container.appendChild(toast);
  setTimeout(() => { toast.remove(); }, 2500);
}

function saveFinancialGoal() {
  const goalInput = document.getElementById('goal-input');
  if (goalInput) { localStorage.setItem('financialGoalText', goalInput.value); }
}

function loadFinancialGoal() {
  const goalInput = document.getElementById('goal-input');
  const storedGoal = localStorage.getItem('financialGoalText') || '';
  if (goalInput) goalInput.value = storedGoal;
}
function importDataCSV(e) {
  const file = e.target.files;
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(event) {
    const text = event.target.result;
    const lines = text.split("\n");
    if (text.trim() === "" || lines.length <= 1) { showToast("Selected backup spreadsheet format is empty.", "toast-danger"); return; }
    let importedTransactions = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const parts = lines[i].split(",");
      if (parts.length >= 4) {
        const monthVal = parts[0].trim();
        const textLabel = parts[1].replace(/^"|"$/g, '').trim();
        const categoryVal = parts[2].trim();
        const amountVal = parseFloat(parts[3].trim());
        if (!isNaN(amountVal)) { importedTransactions.push({ id: Math.floor(Math.random() * 100000000), text: textLabel, amount: amountVal, rawCat: categoryVal, month: monthVal, exactDate: "" }); }
      }
    }
    if (importedTransactions.length > 0) { transactions = [...transactions, ...importedTransactions]; localStorage.setItem('transactions', JSON.stringify(transactions)); init(); showToast(`📥 Successfully Restored ${importedTransactions.length} Log Records!`); } else { showToast("No valid structural records detected.", "toast-danger"); }
  };
  reader.readAsText(file);
  e.target.value = '';
}

function setTransactionType(type) {
  currentSelectedType = type;
  const incomeTab = document.getElementById('tab-income');
  const expenseTab = document.getElementById('tab-expense');
  if (type === 'income') {
    incomeGroup.style.display = 'block'; expenseGroup.style.display = 'none';
    incomeTab.style.backgroundColor = '#10b981'; incomeTab.style.color = '#ffffff';
    expenseTab.style.backgroundColor = '#ffffff'; expenseTab.style.color = '#475569';
  } else {
    incomeGroup.style.display = 'none'; expenseGroup.style.display = 'block';
    expenseTab.style.backgroundColor = '#ef4444'; expenseTab.style.color = '#ffffff';
    incomeTab.style.backgroundColor = '#ffffff'; incomeTab.style.color = '#475569';
  }
}

function handleFormToggleDirect(e, type) { if(e) e.preventDefault(); setTransactionType(type); }

function filterLedgerSearch() {
  const query = document.getElementById('search-bar').value.toLowerCase();
  Array.from(list.getElementsByTagName('li')).forEach(item => { item.style.display = item.textContent.toLowerCase().includes(query) ? 'flex' : 'none'; });
}

function exportDataCSV() {
  if (!transactions.length) { showToast("Ledger is empty. Action aborted.", "toast-danger"); return; }
  let csv = "data:text/csv;charset=utf-8,Month,Label,Category,Amount (INR)\n";
  transactions.forEach(t => csv += `${t.month},"${t.text.replace(/"/g, '""')}",${t.rawCat || 'Unallocated'},${t.amount}\n`);
  const link = document.createElement("a"); link.setAttribute("href", encodeURI(csv)); link.setAttribute("download", `Budget_Report.csv`);
  document.body.appendChild(link); link.click(); document.body.removeChild(link);
  showToast("📥 CSV Spreadsheet Exported Successfully!");
}
function addTransaction(e) {
  e.preventDefault(); const valText = amount.value.trim();
  let catSel = (currentSelectedType === 'income') ? incomeCategory.value : expenseCategory.value;
  
  if (catSel === "" || catSel.includes("--")) { showToast('Please choose a valid transaction category option.', 'toast-danger'); return; }
  if (!formTransactionDate.value || formTransactionDate.value === "") { showToast('Please select a specific date on the calendar input.', 'toast-danger'); return; }
  if (valText === '' || isNaN(valText) || parseFloat(valText) <= 0) { showToast('Please enter a valid positive number values.', 'toast-danger'); return; }
  
  let amtVal = parseFloat(valText); 
  let selectedDate = formTransactionDate.value;
  const dateParts = selectedDate.split('-');
  const yearNum = parseInt(dateParts[0], 10);
  const monthNum = parseInt(dateParts[1], 10);
  const dayNum = parseInt(dateParts[2], 10);
  
  if (isNaN(yearNum) || isNaN(monthNum) || isNaN(dayNum)) { showToast('Invalid date format. Submission aborted.', 'toast-danger'); return; }

  const dateObj = new Date(yearNum, monthNum - 1, dayNum);
  const monthNameStr = dateObj.toLocaleString('default', { month: 'long' });
  const finalLogBucket = (currentSelectedType === 'income' && catSel === 'Salary (Annually)') ? 'Full Year' : `${monthNameStr} ${yearNum}`;
  
  const extraLabelInput = formDate.value.trim();
  const labelVal = extraLabelInput !== '' ? `${extraLabelInput} [${finalLogBucket}]` : `${catSel} [${finalLogBucket}]`;
  
  if (currentSelectedType === 'expense') amtVal = -amtVal;
  if (editId !== null) {
    transactions = transactions.map(t => t.id === editId ? { id: editId, text: labelVal, amount: amtVal, rawCat: catSel, month: finalLogBucket, exactDate: selectedDate } : t);
    editId = null; submitBtn.innerText = "Record Transaction"; showToast("✏️ Record Updated Successfully!");
  } else {
    transactions.push({ id: Math.floor(Math.random() * 100000000), text: labelVal, amount: amtVal, rawCat: catSel, month: finalLogBucket, exactDate: selectedDate });
    showToast(currentSelectedType === 'income' ? "🟢 Capital Recorded Successfully!" : "🔴 Expense Recorded Successfully!");
  }
  localStorage.setItem('transactions', JSON.stringify(transactions)); init(); amount.value = ''; formDate.value = '';
  incomeCategory.value = ""; expenseCategory.value = "";
}

function addTransactionDOM(t) {
  const sign = t.amount < 0 ? '-' : '+'; const item = document.createElement('li'); item.className = t.amount < 0 ? 'minus' : 'plus';
  item.innerHTML = `<div><strong>${t.text}</strong></div><div class="action-group"><span>${sign}₹${Math.abs(t.amount).toFixed(2)}</span><button type="button" class="edit-btn" onclick="editTransaction(${t.id})">Edit</button><button type="button" class="delete-btn" onclick="removeTransaction(${t.id})">Delete</button></div>`;
  list.appendChild(item);
}

function editTransaction(id) {
  const target = transactions.find(t => t.id === id); if (!target) return; editId = id; amount.value = Math.abs(target.amount).toFixed(2);
  formDate.value = target.text.split(" [")[0]; 
  if (target.exactDate) formTransactionDate.value = target.exactDate;
  if (target.amount >= 0) { setTransactionType('income'); incomeCategory.value = target.rawCat; } else { setTransactionType('expense'); expenseCategory.value = target.rawCat; }
  submitBtn.innerText = "Save Updated Value"; submitBtn.scrollIntoView({ behavior: 'smooth' });
}

function removeTransaction(id) {
  if(editId === id) { editId = null; submitBtn.innerText = "Record Transaction"; amount.value = ''; formDate.value = ''; }
  transactions = transactions.filter(t => t.id !== id); localStorage.setItem('transactions', JSON.stringify(transactions)); init(); showToast("❌ Entry Removed From Database", "toast-warning");
}

function updateValues() {
  const expense = transactions.filter(t => t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0);
  
  let totalIncomeCapital = 0;
  let recurringIncomeFlow = 0;
  
  transactions.filter(t => t.amount > 0).forEach(t => {
    totalIncomeCapital += t.amount;
    if (t.rawCat === "Salary (Annually)") {
      recurringIncomeFlow += (t.amount / 12);
    } else if (t.rawCat !== "Savings Anchor") {
      recurringIncomeFlow += t.amount;
    }
  });
  
  const totalBalanceLeft = totalIncomeCapital - expense; 
  balance.innerText = `₹${totalBalanceLeft.toFixed(2)}`;
  
  money_plus.innerText = `+₹${recurringIncomeFlow.toFixed(2)}`; 
  money_minus.innerText = `-₹${expense.toFixed(2)}`;
  
  velocityDisplay.innerText = recurringIncomeFlow > 0 ? `${((recurringIncomeFlow - expense) / recurringIncomeFlow * 100).toFixed(1)}%` : "0.0%";
  
  if (expense > 0 && totalBalanceLeft > 0) {
    const cleanMonths = transactions.map(t => t.month).filter(m => m !== 'Full Year'); 
    const monthsCount = new Set(cleanMonths).size || 1;
    runwayDisplay.innerText = `${(totalBalanceLeft / (expense / monthsCount)).toFixed(1)} Months`;
  } else { 
    runwayDisplay.innerText = "0.0 Months"; 
  }
  
  list.innerHTML = ''; transactions.forEach(addTransactionDOM); let nVal = 0, wVal = 0, sVal = 0;
  transactions.filter(t => t.amount < 0).forEach(t => {
    const c = t.rawCat; if (["Groceries", "Rent/Bills", "Medical/Hospital", "Travel/Fuel", "Education/Fees"].includes(c)) nVal += Math.abs(t.amount); else if (["Dining Out", "Entertainment", "Other Expense"].includes(c)) wVal += Math.abs(t.amount); else if (["Investment"].includes(c)) sVal += Math.abs(t.amount);
  });
  const totalExp = nVal + wVal + sVal; const nPct = totalExp > 0 ? Math.round((nVal / totalExp) * 100) : 0; const wPct = totalExp > 0 ? Math.round((wVal / totalExp) * 100) : 0; const sPct = totalExp > 0 ? Math.round((sVal / totalExp) * 100) : 0;
  labelNeeds.innerText = `${nPct}%`; labelWants.innerText = `${wPct}%`; labelSavings.innerText = `${sPct}%`; barNeeds.style.width = `${Math.min(nPct, 100)}%`; barWants.style.width = `${Math.min(wPct, 100)}%`; barSavings.style.width = `${Math.min(sPct, 100)}%`;
  if (transactions.length === 0) { advisor.className = "advisor-box"; advisor.innerHTML = "Start recording transactions to receive personalized budget feedback tailored to your life situation."; return; }
  let advice = "💡 <strong>Personalized Analysis:</strong> ";
  if (nPct > 50 && wPct <= 25) { advice += "Your <strong>Needs</strong> are high at " + nPct + "%. Because your lifestyle spending (Wants) is highly disciplined, this indicates structural fixed costs (like city rent or utilities). Keep Wants low to protect your savings pool. "; } else if (nPct > 50) { advice += "Your fixed <strong>Needs</strong> take up " + nPct + "% of your tracking. Consider audit reviews for subscription leaks or grocery waste. "; }
  if (wPct > 30) { advice += "Lifestyle choices (<strong>Wants</strong>) are taking up " + wPct + "%. If you are working towards a major financial milestone, trimming temporary lifestyle leaks is the fastest way to get there. "; }
  if (sPct >= 35) { advice += "Exceptional wealth velocity! Saving " + sPct + "% places you significantly ahead of standard economic baselines. Keep this momentum going! "; } else if (sPct < 20 && totalExp > 0) { advice += "Your wealth accumulation rate is currently " + sPct + "%. If your cash flow permits, try automating your investment transfers right at the beginning of the month. "; }
  if (nPct <= 50 && wPct <= 30 && sPct >= 20) { advice += "Your spending distribution cleanly balances living essentials, lifestyle freedom, and wealth generation."; }
  advisor.innerHTML = advice;
}

function unloadCurrentSession() { 
  transactions = []; list.innerHTML = ''; updateValues(); 
  if (formTransactionDate) formTransactionDate.value = ""; 
  showToast("🧹 Current Session Unloaded Safely", "toast-warning"); 
}

function resetAllData() {
  if (confirm("Are you absolutely sure you want to delete all transaction data? This action cannot be undone.")) {
    transactions = []; localStorage.clear(); const goalInput = document.getElementById('goal-input'); if (goalInput) goalInput.value = '';
    editId = null; submitBtn.innerText = "Record Transaction"; amount.value = ''; formDate.value = ''; 
    if (formTransactionDate) formTransactionDate.value = ""; 
    init(); showToast("⚠️ Local Database Erased Completely!", "toast-danger");
  }
}

function toggleAccordion(headerElement) {
  const parentItem = headerElement.parentElement; const contentElement = parentItem.querySelector('.accordion-content'); const isActive = parentItem.classList.contains('active');
  document.querySelectorAll('.accordion-item').forEach(item => { item.classList.remove('active'); item.querySelector('.accordion-content').style.maxHeight = null; });
  if (!isActive) { parentItem.classList.add('active'); contentElement.style.maxHeight = contentElement.scrollHeight + "px"; }
}

function init() { updateValues(); setTransactionType('income'); loadFinancialGoal(); incomeCategory.value = ""; expenseCategory.value = ""; }

form.addEventListener('submit', addTransaction);
document.getElementById('unload-session-btn').addEventListener('click', unloadCurrentSession);
resetAllBtn.addEventListener('click', resetAllData);
init();

const STORAGE_KEY = "comandaAzulState_v8_pdf_download_no_values";
const DAY_TOTAL_PASSWORD = "SPLDSG66";

const products = [
  { name: "Assado", price: 4.50 },
  { name: "Frito", price: 4.00 },
  { name: "Pirulito", price: 0.50 },
  { name: "Bala de Iogurte", price: 0.15 },
  { name: "Paçoca", price: 1.00 },
  { name: "Trident", price: 3.00 },
  { name: "Bala de goma", price: 1.50 },
  { name: "Bolete", price: 0.20 },
  { name: "Doce de Amendoim", price: 2.00 },
  { name: "Chup Chup", price: 1.50 },
  { name: "Babaloo", price: 0.30 },
  { name: "Lua cheia", price: 0.25 },
  { name: "Halls", price: 2.00 },
  { name: "Frupic", price: 3.50 },
  { name: "Caçula", price: 2.50 },
  { name: "Tubaína", price: 5.00 },
  { name: "KS", price: 5.50 },
  { name: "Lata", price: 6.00 },
  { name: "Mini lata", price: 4.00 },
  { name: "Pet 200ml", price: 3.50 },
  { name: "Coca 600ml", price: 8.00 },
  { name: "2L Coca", price: 15.50 },
  { name: "2L Sprite", price: 13.00 },
  { name: "Suco Lata", price: 6.50 },
  { name: "Suco garrafa", price: 5.50 },
  { name: "Água com gás", price: 3.50 },
  { name: "Água sem gás", price: 3.00 },
  { name: "Café (Meio copo)", price: 2.00 },
  { name: "Café (Copo cheio)", price: 4.00 },
  { name: "Café com leite", price: 4.00 }
];

const paymentMethods = ["PIX", "Dinheiro", "Cartão de débito", "Cartão de crédito"];

const defaultFixedCommands = [
  { name: "Mesa 01", defaultName: "Mesa 01", type: "fixed" },
  { name: "Mesa 02", defaultName: "Mesa 02", type: "fixed" },
  { name: "Mesa 03", defaultName: "Mesa 03", type: "fixed" },
  { name: "Mesa 04", defaultName: "Mesa 04", type: "fixed" },
  { name: "Balcão", defaultName: "Balcão", type: "fixed" }
];

const state = {
  commands: [],
  dailyEntries: [],
  editingCommandId: null,
  pendingPaymentCommandId: null,
  editingDailyEntryId: null,
  dailyEditDraft: null,
  dayTotalVisible: false
};

const commandsGrid = document.querySelector("#commandsGrid");
const dailyTotal = document.querySelector("#dailyTotal");
const topDayTotal = document.querySelector("#topDayTotal");
const topDayCount = document.querySelector("#topDayCount");
const btnToggleTopTotal = document.querySelector("#btnToggleTopTotal");
const dailyList = document.querySelector("#dailyList");
const toast = document.querySelector("#toast");

const editModal = document.querySelector("#editModal");
const editTitle = document.querySelector("#editTitle");
const editCommandName = document.querySelector("#editCommandName");
const editCommandSearch = document.querySelector("#editCommandSearch");
const editProducts = document.querySelector("#editProducts");

const paymentModal = document.querySelector("#paymentModal");
const paymentTitle = document.querySelector("#paymentTitle");
const paymentTotal = document.querySelector("#paymentTotal");
const paymentItems = document.querySelector("#paymentItems");
const paymentMethod = document.querySelector("#paymentMethod");
const paymentCashFields = document.querySelector("#paymentCashFields");
const paymentCashGiven = document.querySelector("#paymentCashGiven");
const paymentChange = document.querySelector("#paymentChange");

const dailyEditModal = document.querySelector("#dailyEditModal");
const dailyEditOrigin = document.querySelector("#dailyEditOrigin");
const dailyEditSearch = document.querySelector("#dailyEditSearch");
const dailyEditProducts = document.querySelector("#dailyEditProducts");
const dailyEditItemCounter = document.querySelector("#dailyEditItemCounter");
const dailyEditManualValue = document.querySelector("#dailyEditManualValue");
const dailyEditPayment = document.querySelector("#dailyEditPayment");
const dailyEditCashFields = document.querySelector("#dailyEditCashFields");
const dailyEditCashGiven = document.querySelector("#dailyEditCashGiven");
const dailyEditChange = document.querySelector("#dailyEditChange");

const looseSaleForm = document.querySelector("#looseSaleForm");
const looseSaleValue = document.querySelector("#looseSaleValue");

const confirmModal = document.querySelector("#confirmModal");
const confirmTitle = document.querySelector("#confirmTitle");
const confirmMessage = document.querySelector("#confirmMessage");
const btnCloseConfirm = document.querySelector("#btnCloseConfirm");
const btnCancelConfirm = document.querySelector("#btnCancelConfirm");
const btnAcceptConfirm = document.querySelector("#btnAcceptConfirm");

const renameModal = document.querySelector("#renameModal");
const renameInput = document.querySelector("#renameInput");
const btnCloseRename = document.querySelector("#btnCloseRename");
const btnCancelRename = document.querySelector("#btnCancelRename");
const btnSaveRename = document.querySelector("#btnSaveRename");

const unlockTotalModal = document.querySelector("#unlockTotalModal");
const unlockPassword = document.querySelector("#unlockPassword");
const btnCloseUnlock = document.querySelector("#btnCloseUnlock");
const btnCancelUnlock = document.querySelector("#btnCancelUnlock");
const btnUnlockTotal = document.querySelector("#btnUnlockTotal");

function id() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function money(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function parseMoneyInput(value) {
  let cleaned = String(value || "")
    .replace(/R\$/gi, "")
    .replace(/\s/g, "")
    .replace(/[^0-9,.]/g, "");

  if (cleaned.includes(",")) {
    cleaned = cleaned.replace(/\./g, "").replace(",", ".");
  } else {
    const parts = cleaned.split(".");
    if (parts.length > 2) {
      const decimal = parts.pop();
      cleaned = `${parts.join("")}.${decimal}`;
    }
  }

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeText(value, limit = 45) {
  return String(value || "").trim().slice(0, limit);
}

function normalizeForSearch(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function removeAccents(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function normalizeSearchTerm(value) {
  return String(value || "").slice(0, 60);
}

function normalizePayment(value) {
  return value === "Indefinido" || paymentMethods.includes(value) ? value : "Indefinido";
}

function createItems(oldItems = []) {
  return products.map((product) => {
    const oldItem = Array.isArray(oldItems)
      ? oldItems.find((item) => item.name === product.name)
      : null;

    return {
      name: product.name,
      price: product.price,
      qty: Math.max(0, Math.floor(Number(oldItem?.qty) || 0))
    };
  });
}

function cloneSelectedItems(items = []) {
  return createItems(items)
    .filter((item) => item.qty > 0)
    .map((item) => ({ name: item.name, price: item.price, qty: item.qty }));
}

function createCommand(commandData) {
  return {
    id: id(),
    name: commandData.name,
    defaultName: commandData.defaultName || commandData.name,
    type: commandData.type || "fixed",
    searchTerm: "",
    items: createItems()
  };
}

function createInitialCommands(includeFirstExtra = true) {
  const commands = defaultFixedCommands.map(createCommand);
  if (includeFirstExtra) {
    commands.push(createCommand({ name: "Extra 1", defaultName: "Extra 1", type: "extra" }));
  }
  return commands;
}

function createResetCommandsWithoutExtras() {
  return defaultFixedCommands.map(createCommand);
}

function normalizeCommand(command, index) {
  const fixedReference = defaultFixedCommands[index];
  const isExtraByType = command?.type === "extra";
  const isExtraByName = /^Extra\s*\d+$/i.test(command?.defaultName || command?.name || "");
  const type = isExtraByType || isExtraByName || index >= defaultFixedCommands.length ? "extra" : "fixed";
  const fallbackName = type === "fixed"
    ? fixedReference?.name || `Mesa ${String(index + 1).padStart(2, "0")}`
    : command?.defaultName || command?.name || `Extra ${index - defaultFixedCommands.length + 1}`;

  return {
    id: command?.id || id(),
    name: normalizeText(command?.name, 35) || fallbackName,
    defaultName: normalizeText(command?.defaultName, 35) || fallbackName,
    type,
    searchTerm: normalizeSearchTerm(command?.searchTerm),
    items: createItems(command?.items)
  };
}

function normalizeDailyEntry(entry) {
  const items = createItems(entry?.items).filter((item) => item.qty > 0);
  const itemTotal = itemsTotal(items);
  const manualValue = Math.max(0, Number(entry?.manualValue ?? entry?.value) || 0);
  const value = itemTotal > 0 ? itemTotal : Math.max(0, Number(entry?.value) || manualValue);
  const payment = normalizePayment(entry?.payment);
  const cashGiven = payment === "Dinheiro" ? Math.max(0, Number(entry?.cashGiven) || 0) : null;

  return {
    id: entry?.id || id(),
    origin: normalizeText(entry?.origin, 45) || "Indefinido",
    items,
    itemsText: items.length ? itemsText(items) : "Indefinido",
    payment,
    cashGiven,
    change: payment === "Dinheiro" ? Math.max(0, cashGiven - value) : null,
    time: normalizeText(entry?.time, 20) || new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    value,
    manualValue,
    type: entry?.type === "loose" ? "loose" : "command"
  };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (!saved || !Array.isArray(saved.commands) || saved.commands.length === 0) {
      state.commands = createInitialCommands(true);
      state.dailyEntries = [];
      return;
    }

    state.commands = saved.commands.map(normalizeCommand);
    state.dailyEntries = Array.isArray(saved.dailyEntries)
      ? saved.dailyEntries.map(normalizeDailyEntry).filter((entry) => entry.value > 0)
      : [];
  } catch (error) {
    state.commands = createInitialCommands(true);
    state.dailyEntries = [];
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    commands: state.commands,
    dailyEntries: state.dailyEntries
  }));
}

function findCommand(commandId) {
  return state.commands.find((command) => command.id === commandId);
}

function findDailyEntry(entryId) {
  return state.dailyEntries.find((entry) => entry.id === entryId);
}

function itemsTotal(items = []) {
  return items.reduce((total, item) => total + item.qty * item.price, 0);
}

function itemsQty(items = []) {
  return items.reduce((total, item) => total + item.qty, 0);
}

function itemsText(items = []) {
  return items
    .filter((item) => item.qty > 0)
    .map((item) => `${item.qty}x ${item.name}`)
    .join(", ");
}

function commandTotal(command) {
  return itemsTotal(command.items);
}

function commandQty(command) {
  return itemsQty(command.items);
}

function commandItemsText(command) {
  return itemsText(command.items);
}

function dayTotalValue() {
  return state.dailyEntries.reduce((total, entry) => total + entry.value, 0);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove("show"), 2800);
}

function openDialogSafely(dialog) {
  if (!dialog) return;
  if (!dialog.open) dialog.showModal();
}

function closeDialogSafely(dialog) {
  if (!dialog) return;
  if (dialog.open) dialog.close();
}

function askConfirmation({ title = "Confirmar ação", message = "Tem certeza?", confirmText = "Confirmar", cancelText = "Cancelar" } = {}) {
  return new Promise((resolve) => {
    confirmTitle.textContent = title;
    confirmMessage.textContent = message;
    btnAcceptConfirm.textContent = confirmText;
    btnCancelConfirm.textContent = cancelText;

    let settled = false;

    const done = (answer) => {
      if (settled) return;
      settled = true;
      closeDialogSafely(confirmModal);
      resolve(answer);
    };

    btnCloseConfirm.onclick = () => done(false);
    btnCancelConfirm.onclick = () => done(false);
    btnAcceptConfirm.onclick = () => done(true);
    confirmModal.oncancel = (event) => {
      event.preventDefault();
      done(false);
    };

    openDialogSafely(confirmModal);
  });
}

function askNewCommandName(command) {
  return new Promise((resolve) => {
    renameInput.value = command.name;
    renameInput.select();

    let settled = false;

    const done = (value) => {
      if (settled) return;
      settled = true;
      closeDialogSafely(renameModal);
      resolve(value);
    };

    btnCloseRename.onclick = () => done(null);
    btnCancelRename.onclick = () => done(null);
    btnSaveRename.onclick = () => done(normalizeText(renameInput.value, 35));
    renameModal.oncancel = (event) => {
      event.preventDefault();
      done(null);
    };

    renameInput.onkeydown = (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        done(normalizeText(renameInput.value, 35));
      }
    };

    openDialogSafely(renameModal);
    window.setTimeout(() => renameInput.focus(), 50);
  });
}

function askUnlockPassword() {
  return new Promise((resolve) => {
    unlockPassword.value = "";

    let settled = false;

    const done = (answer) => {
      if (settled) return;
      settled = true;
      closeDialogSafely(unlockTotalModal);
      resolve(answer);
    };

    btnCloseUnlock.onclick = () => done(false);
    btnCancelUnlock.onclick = () => done(false);
    btnUnlockTotal.onclick = () => done(unlockPassword.value === DAY_TOTAL_PASSWORD);
    unlockTotalModal.oncancel = (event) => {
      event.preventDefault();
      done(false);
    };

    unlockPassword.onkeydown = (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        done(unlockPassword.value === DAY_TOTAL_PASSWORD);
      }
    };

    openDialogSafely(unlockTotalModal);
    window.setTimeout(() => unlockPassword.focus(), 50);
  });
}

function filteredItems(items, searchTerm) {
  const term = normalizeForSearch(searchTerm);
  if (!term) return items;
  return items.filter((item) => normalizeForSearch(item.name).includes(term));
}

function renderCommandProducts(command) {
  const list = filteredItems(command.items, command.searchTerm);

  if (list.length === 0) {
    return `<div class="no-products">Nenhum produto encontrado.</div>`;
  }

  return list.map((item) => `
    <div class="product-row">
      <div class="product-info">
        <strong>${escapeHTML(item.name)}</strong>
        <span>${money(item.price)}</span>
      </div>
      <div class="qty-control" aria-label="Quantidade de ${escapeHTML(item.name)}">
        <button type="button" data-action="decrease" data-command-id="${command.id}" data-product="${escapeHTML(item.name)}" ${item.qty === 0 ? "disabled" : ""}>−</button>
        <span>${item.qty}</span>
        <button type="button" data-action="increase" data-command-id="${command.id}" data-product="${escapeHTML(item.name)}">+</button>
      </div>
    </div>
  `).join("");
}

function renderCommands() {
  commandsGrid.innerHTML = state.commands.map((command) => {
    const total = commandTotal(command);
    const qty = commandQty(command);
    const isExtra = command.type === "extra";

    return `
      <article class="command-card ${isExtra ? "is-extra" : ""}" data-command-id="${command.id}">
        <div class="command-top">
          <div class="command-heading">
            <h3>${escapeHTML(command.name)}</h3>
            <span class="item-pill">${qty} ${qty === 1 ? "item" : "itens"}</span>
          </div>

          <div class="command-tools">
            <button class="btn btn-soft btn-small" type="button" data-action="rename" data-command-id="${command.id}">Renomear</button>
            <button class="btn btn-soft btn-small" type="button" data-action="reset-name" data-command-id="${command.id}">Voltar padrão</button>
            ${isExtra ? `<button class="btn btn-danger btn-small" type="button" data-action="remove-extra" data-command-id="${command.id}">Remover extra</button>` : ""}
          </div>

          <div class="card-search">
            <label for="search-${command.id}">Pesquisar produto</label>
            <input id="search-${command.id}" type="search" placeholder="Ex: Coca, Café, Assado..." value="${escapeHTML(command.searchTerm)}" data-action="search" data-command-id="${command.id}" autocomplete="off" />
          </div>

          <div class="command-total">
            <span>Total da comanda</span>
            <strong>${money(total)}</strong>
          </div>
        </div>

        <div class="products-list">
          ${renderCommandProducts(command)}
        </div>

        <div class="card-actions">
          <button class="btn btn-soft" type="button" data-action="clear-command" data-command-id="${command.id}">Excluir</button>
          <button class="btn btn-soft" type="button" data-action="edit-command" data-command-id="${command.id}">Editar</button>
          <button class="btn btn-primary" type="button" data-action="send-command" data-command-id="${command.id}">Enviar</button>
        </div>
      </article>
    `;
  }).join("");
}

function cashDisplay(entry) {
  if (entry.payment !== "Dinheiro") return "—";
  if (!entry.cashGiven) return "Pendente";
  return entry.change > 0 ? "Dinheiro informado" : "Sem troco";
}

function paymentDisplay(entry) {
  return entry.payment || "Indefinido";
}

function renderDailyEntries() {
  const count = state.dailyEntries.length;
  if (topDayTotal) {
    topDayTotal.textContent = state.dayTotalVisible ? money(dayTotalValue()) : "Protegido";
  }
  if (btnToggleTopTotal) {
    btnToggleTopTotal.textContent = state.dayTotalVisible ? "Ocultar valor" : "Desocultar com senha";
  }
  if (dailyTotal) dailyTotal.textContent = "";
  if (topDayCount) topDayCount.textContent = `${count} ${count === 1 ? "conta enviada" : "contas enviadas"}`;

  if (count === 0) {
    dailyList.innerHTML = `<tr class="empty-row"><td colspan="6">Nenhuma conta enviada ainda.</td></tr>`;
    return;
  }

  dailyList.innerHTML = state.dailyEntries.map((entry) => `
    <tr>
      <td>${escapeHTML(entry.origin)}</td>
      <td class="entry-items">${escapeHTML(entry.itemsText || "Indefinido")}</td>
      <td><span class="payment-badge">${escapeHTML(paymentDisplay(entry))}</span></td>
      <td><span class="cash-status">${escapeHTML(cashDisplay(entry))}</span></td>
      <td>${escapeHTML(entry.time)}</td>
      <td><button class="btn btn-soft btn-small" type="button" data-action="edit-daily" data-entry-id="${entry.id}">Editar</button></td>
    </tr>
  `).join("");
}

function renderAll() {
  renderCommands();
  renderDailyEntries();
  saveState();
}

async function toggleTopDayTotalVisibility() {
  if (state.dayTotalVisible) {
    state.dayTotalVisible = false;
    renderDailyEntries();
    showToast("Valor do Dia ocultado.");
    return;
  }

  const unlocked = await askUnlockPassword();
  if (!unlocked) {
    showToast("Senha incorreta ou operação cancelada.");
    return;
  }

  state.dayTotalVisible = true;
  renderDailyEntries();
  showToast("Valor do Dia desocultado.");
}

function resetCommandItems(command) {
  command.items.forEach((item) => {
    item.qty = 0;
  });
  command.searchTerm = "";
}

function updateItemQty(items, productName, delta) {
  const item = items.find((entryItem) => entryItem.name === productName);
  if (!item) return;
  item.qty = Math.max(0, item.qty + delta);
}

async function promptRename(command) {
  const newName = await askNewCommandName(command);
  if (!newName) return;
  command.name = newName;
  renderAll();
  showToast("Nome da comanda alterado.");
}

function openEditModal(commandId) {
  const command = findCommand(commandId);
  if (!command) return;

  state.editingCommandId = commandId;
  editTitle.textContent = command.name;
  editCommandName.value = command.name;
  editCommandSearch.value = "";
  renderEditCommandProducts();
  editModal.showModal();
}

function renderEditCommandProducts() {
  const command = findCommand(state.editingCommandId);
  if (!command) return;

  const searchTerm = editCommandSearch.value;
  const list = filteredItems(command.items, searchTerm);

  if (list.length === 0) {
    editProducts.innerHTML = `<div class="no-products">Nenhum produto encontrado.</div>`;
    return;
  }

  editProducts.innerHTML = list.map((item) => `
    <div class="edit-product-row">
      <div class="edit-product-info">
        <strong>${escapeHTML(item.name)}</strong>
        <span>${money(item.price)}</span>
      </div>
      <div class="qty-control">
        <button type="button" data-action="edit-decrease" data-product="${escapeHTML(item.name)}" ${item.qty === 0 ? "disabled" : ""}>−</button>
        <span>${item.qty}</span>
        <button type="button" data-action="edit-increase" data-product="${escapeHTML(item.name)}">+</button>
      </div>
    </div>
  `).join("");
}

function closeEditModal() {
  state.editingCommandId = null;
  editModal.close();
}

function openPaymentModal(commandId) {
  const command = findCommand(commandId);
  if (!command) return;

  const total = commandTotal(command);
  const selectedItems = commandItemsText(command);

  if (total <= 0) {
    showToast("Adicione pelo menos um produto antes de enviar.");
    return;
  }

  state.pendingPaymentCommandId = commandId;
  paymentTitle.textContent = `Enviar ${command.name}`;
  paymentTotal.textContent = money(total);
  paymentItems.textContent = selectedItems || "Nenhum item selecionado.";
  paymentMethod.value = "";
  paymentCashGiven.value = "";
  paymentChange.textContent = money(0);
  paymentCashFields.classList.add("hidden");
  paymentModal.showModal();
}

function closePaymentModal() {
  state.pendingPaymentCommandId = null;
  paymentModal.close();
}

function currentPendingPaymentTotal() {
  const command = findCommand(state.pendingPaymentCommandId);
  return command ? commandTotal(command) : 0;
}

function updatePaymentCashPreview() {
  const total = currentPendingPaymentTotal();
  const given = parseMoneyInput(paymentCashGiven.value);
  const change = Math.max(0, given - total);
  paymentChange.textContent = money(change);
}

async function confirmPaymentAndSend() {
  const command = findCommand(state.pendingPaymentCommandId);
  if (!command) return;

  const total = commandTotal(command);
  const selectedItems = cloneSelectedItems(command.items);
  const method = paymentMethod.value;

  if (!paymentMethods.includes(method)) {
    showToast("Escolha a forma de pagamento antes de enviar.");
    return;
  }

  let cashGiven = null;
  let change = null;

  if (method === "Dinheiro") {
    cashGiven = parseMoneyInput(paymentCashGiven.value);
    if (cashGiven <= 0) {
      showToast("Informe o valor dado pelo cliente.");
      return;
    }

    if (cashGiven < total) {
      showToast("O valor dado em dinheiro é menor que a comanda.");
      return;
    }

    change = Math.max(0, cashGiven - total);
  }

  const confirmation = await askConfirmation({
    title: "Enviar comanda",
    message: `Tem certeza que deseja enviar ${command.name} para o Valor do Dia? Confira se essa comanda já foi paga.`,
    confirmText: "Sim, enviar",
    cancelText: "Cancelar"
  });
  if (!confirmation) return;

  state.dailyEntries.push({
    id: id(),
    origin: command.name,
    items: selectedItems,
    itemsText: itemsText(selectedItems),
    payment: method,
    cashGiven,
    change,
    time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    value: total,
    manualValue: 0,
    type: "command"
  });

  resetCommandItems(command);
  closePaymentModal();
  renderAll();
  showToast("Comanda enviada para o Valor do Dia.");
}

function addLooseSale(value) {
  state.dailyEntries.push({
    id: id(),
    origin: "Indefinido",
    items: [],
    itemsText: "Indefinido",
    payment: "Indefinido",
    cashGiven: null,
    change: null,
    time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    value,
    manualValue: value,
    type: "loose"
  });
}

function openDailyEditModal(entryId) {
  const entry = findDailyEntry(entryId);
  if (!entry) return;

  state.editingDailyEntryId = entryId;
  state.dailyEditDraft = {
    origin: entry.origin,
    items: createItems(entry.items),
    payment: entry.payment || "Indefinido",
    manualValue: entry.items.length ? 0 : entry.value,
    cashGiven: entry.cashGiven || "",
    searchTerm: ""
  };

  dailyEditOrigin.value = state.dailyEditDraft.origin;
  dailyEditSearch.value = "";
  dailyEditManualValue.value = state.dailyEditDraft.manualValue ? String(state.dailyEditDraft.manualValue).replace(".", ",") : "";
  dailyEditPayment.value = state.dailyEditDraft.payment;
  dailyEditCashGiven.value = state.dailyEditDraft.cashGiven ? String(state.dailyEditDraft.cashGiven).replace(".", ",") : "";
  toggleDailyEditCashFields();
  renderDailyEditProducts();
  updateDailyEditCashPreview();
  dailyEditModal.showModal();
}

function closeDailyEditModal() {
  state.editingDailyEntryId = null;
  state.dailyEditDraft = null;
  dailyEditModal.close();
}

function renderDailyEditProducts() {
  const draft = state.dailyEditDraft;
  if (!draft) return;

  const list = filteredItems(draft.items, dailyEditSearch.value);
  dailyEditItemCounter.textContent = `${itemsQty(draft.items)} ${itemsQty(draft.items) === 1 ? "item" : "itens"}`;

  if (list.length === 0) {
    dailyEditProducts.innerHTML = `<div class="no-products">Nenhum produto encontrado.</div>`;
    return;
  }

  dailyEditProducts.innerHTML = list.map((item) => `
    <div class="edit-product-row">
      <div class="edit-product-info">
        <strong>${escapeHTML(item.name)}</strong>
        <span>${money(item.price)}</span>
      </div>
      <div class="qty-control">
        <button type="button" data-action="daily-edit-decrease" data-product="${escapeHTML(item.name)}" ${item.qty === 0 ? "disabled" : ""}>−</button>
        <span>${item.qty}</span>
        <button type="button" data-action="daily-edit-increase" data-product="${escapeHTML(item.name)}">+</button>
      </div>
    </div>
  `).join("");
}

function dailyEditCurrentValue() {
  const draft = state.dailyEditDraft;
  if (!draft) return 0;
  const selectedTotal = itemsTotal(draft.items);
  return selectedTotal > 0 ? selectedTotal : parseMoneyInput(dailyEditManualValue.value);
}

function toggleDailyEditCashFields() {
  const isCash = dailyEditPayment.value === "Dinheiro";
  dailyEditCashFields.classList.toggle("hidden", !isCash);
  if (!isCash) {
    dailyEditCashGiven.value = "";
    dailyEditChange.textContent = money(0);
  }
}

function updateDailyEditCashPreview() {
  const value = dailyEditCurrentValue();
  const given = parseMoneyInput(dailyEditCashGiven.value);
  dailyEditChange.textContent = money(Math.max(0, given - value));
}

function saveDailyEdit() {
  const entry = findDailyEntry(state.editingDailyEntryId);
  const draft = state.dailyEditDraft;
  if (!entry || !draft) return;

  const origin = normalizeText(dailyEditOrigin.value, 45) || "Indefinido";
  const selectedItems = cloneSelectedItems(draft.items);
  const selectedTotal = itemsTotal(selectedItems);
  const manualValue = parseMoneyInput(dailyEditManualValue.value);
  const value = selectedTotal > 0 ? selectedTotal : manualValue;
  const payment = normalizePayment(dailyEditPayment.value);

  if (value <= 0) {
    showToast("Adicione itens ou informe um valor avulso válido.");
    return;
  }

  let cashGiven = null;
  let change = null;

  if (payment === "Dinheiro") {
    cashGiven = parseMoneyInput(dailyEditCashGiven.value);
    if (cashGiven <= 0) {
      showToast("Informe o valor dado pelo cliente.");
      return;
    }

    if (cashGiven < value) {
      showToast("O valor dado em dinheiro é menor que o lançamento.");
      return;
    }

    change = Math.max(0, cashGiven - value);
  }

  entry.origin = origin;
  entry.items = selectedItems;
  entry.itemsText = selectedItems.length ? itemsText(selectedItems) : "Indefinido";
  entry.payment = payment;
  entry.cashGiven = cashGiven;
  entry.change = change;
  entry.value = value;
  entry.manualValue = selectedItems.length ? 0 : manualValue;
  entry.type = selectedItems.length ? "command" : "loose";

  closeDailyEditModal();
  renderAll();
  showToast("Lançamento atualizado.");
}

function addExtraCommand() {
  const existingNumbers = state.commands
    .filter((command) => command.type === "extra")
    .map((command) => {
      const match = String(command.defaultName || command.name).match(/Extra\s*(\d+)/i);
      return match ? Number(match[1]) : 0;
    });

  let nextNumber = 1;
  while (existingNumbers.includes(nextNumber)) {
    nextNumber += 1;
  }

  state.commands.push(createCommand({
    name: `Extra ${nextNumber}`,
    defaultName: `Extra ${nextNumber}`,
    type: "extra"
  }));

  renderAll();
  showToast(`Extra ${nextNumber} adicionado.`);
}

async function removeExtra(commandId) {
  const command = findCommand(commandId);
  if (!command || command.type !== "extra") return;

  const hasItems = commandQty(command) > 0;
  const message = hasItems
    ? `O ${command.name} possui itens. Deseja remover mesmo assim?`
    : `Deseja remover ${command.name}?`;

  const confirmation = await askConfirmation({
    title: "Remover extra",
    message,
    confirmText: "Remover",
    cancelText: "Cancelar"
  });
  if (!confirmation) return;
  state.commands = state.commands.filter((item) => item.id !== commandId);
  renderAll();
  showToast("Extra removido.");
}

async function clearDayEntries() {
  if (state.dailyEntries.length === 0) {
    showToast("O Valor do Dia já está vazio.");
    return;
  }

  const confirmation = await askConfirmation({
    title: "Limpar Valor do Dia",
    message: "Tem certeza que deseja limpar o Valor do Dia? Essa ação não gera PDF.",
    confirmText: "Limpar",
    cancelText: "Cancelar"
  });
  if (!confirmation) return;
  state.dailyEntries = [];
  state.dayTotalVisible = false;
  renderAll();
  showToast("Valor do Dia limpo.");
}

function finishDay() {
  if (state.dailyEntries.length === 0) {
    showToast("Não há lançamentos para concluir.");
    return;
  }

  const downloaded = generateDailyPdf();
  if (!downloaded) {
    showToast("Não foi possível gerar o PDF. Tente novamente.");
    return;
  }

  state.dailyEntries = [];
  state.commands = createResetCommandsWithoutExtras();
  state.dayTotalVisible = false;
  renderAll();
  showToast("PDF baixado. Dia concluído e sistema resetado.");
}

function safePdfText(value) {
  return removeAccents(String(value || ""))
    .replace(/[–—]/g, "-")
    .replace(/[•]/g, "*")
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function splitLine(line, maxLength = 92) {
  const words = safePdfText(line).split(" ");
  const lines = [];
  let current = "";

  words.forEach((word) => {
    if ((current + " " + word).trim().length > maxLength) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = (current + " " + word).trim();
    }
  });

  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function pdfEscape(value) {
  return safePdfText(value)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function buildPdf(lines, filename) {
  const linesPerPage = 46;
  const pages = [];

  for (let index = 0; index < lines.length; index += linesPerPage) {
    pages.push(lines.slice(index, index + linesPerPage));
  }

  const objects = [];
  const addObject = (content) => {
    objects.push(content);
    return objects.length;
  };

  const fontObj = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>");
  const pageObjectIds = [];

  pages.forEach((pageLines) => {
    let y = 800;
    const streamLines = ["BT", `/${"F1"} 10 Tf`, "1 0 0 1 42 800 Tm"];

    pageLines.forEach((line, lineIndex) => {
      if (lineIndex === 0) {
        streamLines.push(`(${pdfEscape(line)}) Tj`);
      } else {
        y -= 15;
        streamLines.push(`1 0 0 1 42 ${y} Tm (${pdfEscape(line)}) Tj`);
      }
    });

    streamLines.push("ET");
    const stream = streamLines.join("\n");
    const contentObj = addObject(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    const pageObj = addObject(`<< /Type /Page /Parent 0 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontObj} 0 R >> >> /Contents ${contentObj} 0 R >>`);
    pageObjectIds.push(pageObj);
  });

  const pagesKids = pageObjectIds.map((pageId) => `${pageId} 0 R`).join(" ");
  const pagesObj = addObject(`<< /Type /Pages /Kids [${pagesKids}] /Count ${pageObjectIds.length} >>`);
  const catalogObj = addObject(`<< /Type /Catalog /Pages ${pagesObj} 0 R >>`);

  objects.forEach((content, index) => {
    const objectNumber = index + 1;
    if (content.includes("/Parent 0 0 R")) {
      objects[index] = content.replace("/Parent 0 0 R", `/Parent ${pagesObj} 0 R`);
    }
  });

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((content, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${content}\nendobj\n`;
  });

  const xrefPosition = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogObj} 0 R >>\nstartxref\n${xrefPosition}\n%%EOF`;

  const blob = new Blob([pdf], { type: "application/pdf" });
  return downloadPdfBlob(blob, filename);
}

function downloadPdfBlob(blob, filename) {
  if (!blob || blob.size === 0) return false;

  if (window.navigator && typeof window.navigator.msSaveOrOpenBlob === "function") {
    window.navigator.msSaveOrOpenBlob(blob, filename);
    return true;
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  link.rel = "noopener";
  document.body.appendChild(link);

  link.dispatchEvent(new MouseEvent("click", {
    bubbles: true,
    cancelable: true,
    view: window
  }));

  window.setTimeout(() => {
    link.remove();
    URL.revokeObjectURL(url);
  }, 1500);

  return true;
}

function generateDailyPdf() {
  const now = new Date();
  const dateText = now.toLocaleString("pt-BR");
  const total = dayTotalValue();
  const paymentTotals = state.dailyEntries.reduce((acc, entry) => {
    const key = entry.payment || "Indefinido";
    acc[key] = (acc[key] || 0) + entry.value;
    return acc;
  }, {});

  const lines = [];
  lines.push("BAR AZUL - RELATORIO DE VENDAS DO DIA");
  lines.push("Sistema: Comanda Azul");
  lines.push(`Gerado em: ${dateText}`);
  lines.push("------------------------------------------------------------");
  lines.push(`Total vendido: ${money(total)}`);
  lines.push(`Quantidade de lancamentos: ${state.dailyEntries.length}`);
  lines.push("");
  lines.push("RESUMO POR FORMA DE PAGAMENTO");
  lines.push("------------------------------------------------------------");

  Object.keys(paymentTotals).sort().forEach((method) => {
    lines.push(`${method}: ${money(paymentTotals[method])}`);
  });

  lines.push("");
  lines.push("LISTAGEM COMPLETA");
  lines.push("------------------------------------------------------------");

  state.dailyEntries.forEach((entry, index) => {
    const cashInfo = entry.payment === "Dinheiro"
      ? ` | Valor recebido: ${money(entry.cashGiven || 0)} | Troco: ${money(entry.change || 0)}`
      : "";

    splitLine(`${index + 1}. Horario: ${entry.time} | Comanda: ${entry.origin} | Pagamento: ${entry.payment}${cashInfo}`).forEach((line) => lines.push(line));
    splitLine(`Itens: ${entry.itemsText || "Indefinido"}`).forEach((line) => lines.push(line));
    lines.push(`Valor: ${money(entry.value)}`);
    lines.push("------------------------------------------------------------");
  });

  lines.push("");
  lines.push("Fim do relatorio.");

  const filenameDate = now.toISOString().slice(0, 19).replace(/[:T]/g, "-");
  return buildPdf(lines, `relatorio-bar-azul-${filenameDate}.pdf`);
}

commandsGrid.addEventListener("click", async (event) => {
  const target = event.target.closest("button");
  if (!target) return;

  const action = target.dataset.action;
  const commandId = target.dataset.commandId;
  const productName = target.dataset.product;
  const command = findCommand(commandId);

  if (action === "increase" && command) {
    updateItemQty(command.items, productName, 1);
    renderAll();
    return;
  }

  if (action === "decrease" && command) {
    updateItemQty(command.items, productName, -1);
    renderAll();
    return;
  }

  if (action === "rename" && command) {
    promptRename(command);
    return;
  }

  if (action === "reset-name" && command) {
    command.name = command.defaultName;
    renderAll();
    showToast("Nome voltou ao padrão.");
    return;
  }

  if (action === "remove-extra") {
    removeExtra(commandId);
    return;
  }

  if (action === "clear-command" && command) {
    if (commandQty(command) === 0) {
      showToast("Essa comanda já está vazia.");
      return;
    }

    const confirmation = await askConfirmation({
      title: "Limpar comanda",
      message: `Deseja excluir todos os itens de ${command.name}?`,
      confirmText: "Excluir itens",
      cancelText: "Cancelar"
    });
    if (!confirmation) return;
    resetCommandItems(command);
    renderAll();
    showToast("Comanda limpa.");
    return;
  }

  if (action === "edit-command") {
    openEditModal(commandId);
    return;
  }

  if (action === "send-command") {
    openPaymentModal(commandId);
  }
});

commandsGrid.addEventListener("input", (event) => {
  const target = event.target;
  if (target.dataset.action !== "search") return;

  const command = findCommand(target.dataset.commandId);
  if (!command) return;

  command.searchTerm = normalizeSearchTerm(target.value);
  renderCommands();
  saveState();

  const input = document.querySelector(`#search-${CSS.escape(command.id)}`);
  if (input) {
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }
});

editProducts.addEventListener("click", (event) => {
  const target = event.target.closest("button");
  if (!target) return;

  const command = findCommand(state.editingCommandId);
  if (!command) return;

  if (target.dataset.action === "edit-increase") {
    updateItemQty(command.items, target.dataset.product, 1);
  }

  if (target.dataset.action === "edit-decrease") {
    updateItemQty(command.items, target.dataset.product, -1);
  }

  renderEditCommandProducts();
  renderCommands();
  saveState();
});

editCommandSearch.addEventListener("input", renderEditCommandProducts);

document.querySelector("#btnCloseEdit").addEventListener("click", closeEditModal);
document.querySelector("#btnCancelEdit").addEventListener("click", closeEditModal);
document.querySelector("#btnSaveEdit").addEventListener("click", () => {
  const command = findCommand(state.editingCommandId);
  if (!command) return;

  command.name = normalizeText(editCommandName.value, 35) || command.defaultName;
  closeEditModal();
  renderAll();
  showToast("Comanda editada.");
});

paymentMethod.addEventListener("change", () => {
  const isCash = paymentMethod.value === "Dinheiro";
  paymentCashFields.classList.toggle("hidden", !isCash);
  paymentCashGiven.value = "";
  paymentChange.textContent = money(0);
});

paymentCashGiven.addEventListener("input", updatePaymentCashPreview);

document.querySelector("#btnClosePayment").addEventListener("click", closePaymentModal);
document.querySelector("#btnCancelPayment").addEventListener("click", closePaymentModal);
document.querySelector("#btnConfirmPayment").addEventListener("click", confirmPaymentAndSend);

dailyList.addEventListener("click", (event) => {
  const target = event.target.closest("button");
  if (!target) return;

  if (target.dataset.action === "edit-daily") {
    openDailyEditModal(target.dataset.entryId);
  }
});

dailyEditProducts.addEventListener("click", (event) => {
  const target = event.target.closest("button");
  if (!target || !state.dailyEditDraft) return;

  if (target.dataset.action === "daily-edit-increase") {
    updateItemQty(state.dailyEditDraft.items, target.dataset.product, 1);
  }

  if (target.dataset.action === "daily-edit-decrease") {
    updateItemQty(state.dailyEditDraft.items, target.dataset.product, -1);
  }

  renderDailyEditProducts();
  updateDailyEditCashPreview();
});

dailyEditSearch.addEventListener("input", renderDailyEditProducts);
dailyEditManualValue.addEventListener("input", updateDailyEditCashPreview);
dailyEditPayment.addEventListener("change", () => {
  toggleDailyEditCashFields();
  dailyEditCashGiven.value = "";
  updateDailyEditCashPreview();
});
dailyEditCashGiven.addEventListener("input", updateDailyEditCashPreview);

document.querySelector("#btnCloseDailyEdit").addEventListener("click", closeDailyEditModal);
document.querySelector("#btnCancelDailyEdit").addEventListener("click", closeDailyEditModal);
document.querySelector("#btnSaveDailyEdit").addEventListener("click", saveDailyEdit);

document.querySelector("#btnAddExtra").addEventListener("click", addExtraCommand);
document.querySelector("#btnClearDay").addEventListener("click", clearDayEntries);
document.querySelector("#btnFinishDay").addEventListener("click", finishDay);
btnToggleTopTotal.addEventListener("click", toggleTopDayTotalVisibility);

looseSaleForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = parseMoneyInput(looseSaleValue.value);

  if (value <= 0) {
    showToast("Digite um valor avulso válido.");
    return;
  }

  addLooseSale(value);
  looseSaleValue.value = "";
  renderAll();
  showToast("Valor avulso adicionado ao Valor do Dia.");
});

loadState();
renderAll();

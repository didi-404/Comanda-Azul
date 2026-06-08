const STORAGE_KEY = "comandaAzulState_v6_pagamento_editavel";

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
  editingDailyEntryId: null
};

const commandsGrid = document.querySelector("#commandsGrid");
const dailyTotal = document.querySelector("#dailyTotal");
const topDayTotal = document.querySelector("#topDayTotal");
const topDayCount = document.querySelector("#topDayCount");
const dailyList = document.querySelector("#dailyList");
const toast = document.querySelector("#toast");

const editModal = document.querySelector("#editModal");
const editTitle = document.querySelector("#editTitle");
const editCommandName = document.querySelector("#editCommandName");
const editProducts = document.querySelector("#editProducts");

const paymentModal = document.querySelector("#paymentModal");
const paymentTitle = document.querySelector("#paymentTitle");
const paymentTotal = document.querySelector("#paymentTotal");
const paymentItems = document.querySelector("#paymentItems");
const paymentMethod = document.querySelector("#paymentMethod");

const dailyEditModal = document.querySelector("#dailyEditModal");
const dailyEditOrigin = document.querySelector("#dailyEditOrigin");
const dailyEditItems = document.querySelector("#dailyEditItems");
const dailyEditPayment = document.querySelector("#dailyEditPayment");
const dailyEditValue = document.querySelector("#dailyEditValue");

const looseSaleForm = document.querySelector("#looseSaleForm");
const looseSaleValue = document.querySelector("#looseSaleValue");

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

function normalizeText(value, limit = 35) {
  return String(value || "").trim().slice(0, limit);
}

function normalizeLongText(value, limit = 500) {
  return String(value || "").trim().slice(0, limit);
}

function normalizeForSearch(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function normalizeSearchTerm(value) {
  return String(value || "").slice(0, 60);
}

function normalizePayment(value) {
  return paymentMethods.includes(value) ? value : "Indefinido";
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

function createInitialCommands() {
  return [
    ...defaultFixedCommands.map(createCommand),
    createCommand({ name: "Extra 1", defaultName: "Extra 1", type: "extra" })
  ];
}

function normalizeCommand(command, index) {
  const isExtraByName = /^Extra\s*\d+$/i.test(command?.defaultName || command?.name || "");
  const fixedReference = defaultFixedCommands[index];
  const type = command?.type === "extra" || isExtraByName ? "extra" : "fixed";
  const fallbackName = type === "fixed"
    ? fixedReference?.name || `Mesa ${String(index + 1).padStart(2, "0")}`
    : command?.defaultName || command?.name || "Extra";

  return {
    id: command?.id || id(),
    name: normalizeText(command?.name) || fallbackName,
    defaultName: normalizeText(command?.defaultName) || fallbackName,
    type,
    searchTerm: normalizeSearchTerm(command?.searchTerm),
    items: createItems(command?.items)
  };
}

function normalizeDailyEntry(entry) {
  return {
    id: entry?.id || id(),
    origin: normalizeText(entry?.origin, 45) || "Indefinido",
    itemsText: normalizeLongText(entry?.itemsText) || "Indefinido",
    payment: normalizePayment(entry?.payment),
    time: normalizeText(entry?.time, 20) || new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    value: Math.max(0, Number(entry?.value) || 0)
  };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (!saved || !Array.isArray(saved.commands) || saved.commands.length === 0) {
      state.commands = createInitialCommands();
      state.dailyEntries = [];
      return;
    }

    state.commands = saved.commands.map(normalizeCommand);
    state.dailyEntries = Array.isArray(saved.dailyEntries)
      ? saved.dailyEntries.map(normalizeDailyEntry).filter((entry) => entry.value > 0)
      : [];
  } catch (error) {
    state.commands = createInitialCommands();
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

function commandTotal(command) {
  return command.items.reduce((total, item) => total + item.qty * item.price, 0);
}

function commandQty(command) {
  return command.items.reduce((total, item) => total + item.qty, 0);
}

function commandItemsText(command) {
  return command.items
    .filter((item) => item.qty > 0)
    .map((item) => `${item.qty}x ${item.name}`)
    .join(", ");
}

function dayTotalValue() {
  return state.dailyEntries.reduce((total, entry) => total + Number(entry.value || 0), 0);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => toast.classList.remove("show"), 2600);
}

function openDialog(dialog) {
  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  } else {
    dialog.setAttribute("open", "");
  }
}

function closeDialog(dialog) {
  if (typeof dialog.close === "function") {
    dialog.close();
  } else {
    dialog.removeAttribute("open");
  }
}

function filterProductsInCard(card, searchValue) {
  const query = normalizeForSearch(searchValue);
  let visibleProducts = 0;

  card.querySelectorAll(".product-row").forEach((row) => {
    const productName = row.dataset.productSearch || "";
    const shouldShow = !query || productName.includes(query);
    row.classList.toggle("is-hidden", !shouldShow);
    if (shouldShow) visibleProducts += 1;
  });

  const emptyMessage = card.querySelector("[data-search-empty]");
  if (emptyMessage) {
    emptyMessage.classList.toggle("show", visibleProducts === 0);
  }
}

function renderCommands() {
  commandsGrid.innerHTML = state.commands.map((command) => {
    const total = commandTotal(command);
    const qty = commandQty(command);
    const isExtra = command.type === "extra";
    const searchTerm = normalizeSearchTerm(command.searchTerm);
    const normalizedSearch = normalizeForSearch(searchTerm);
    const hasVisibleProduct = command.items.some((item) => {
      return !normalizedSearch || normalizeForSearch(item.name).includes(normalizedSearch);
    });

    return `
      <article class="command-card ${isExtra ? "is-extra" : ""}" data-id="${command.id}">
        <div class="command-top">
          <div class="command-title-row">
            <div class="command-name-area">
              <input
                class="command-name-input"
                type="text"
                maxlength="35"
                value="${escapeHTML(command.name)}"
                aria-label="Nome da comanda"
                data-action="name-input"
              />
              <div class="rename-actions">
                <button class="rename-btn" type="button" data-action="rename">Renomear</button>
                <button class="reset-name-btn" type="button" data-action="reset-name">Voltar padrão</button>
              </div>
            </div>
            <span class="command-badge">${qty} ${qty === 1 ? "item" : "itens"}</span>
          </div>

          <div class="product-search">
            <label for="search-${command.id}">Pesquisar produto</label>
            <div class="product-search-box">
              <span aria-hidden="true">⌕</span>
              <input
                id="search-${command.id}"
                class="product-search-input"
                type="search"
                inputmode="search"
                autocomplete="off"
                placeholder="Ex: Café, Coca, Assado..."
                value="${escapeHTML(searchTerm)}"
                aria-label="Pesquisar produto nesta comanda"
                data-action="search-products"
              />
            </div>
          </div>

          <div class="command-total">
            <span>Total da comanda</span>
            <strong>${money(total)}</strong>
          </div>
        </div>

        <div class="products-list">
          <div class="no-products-message ${hasVisibleProduct ? "" : "show"}" data-search-empty>
            Nenhum produto encontrado nesta comanda.
          </div>
          ${command.items.map((item, index) => {
            const productSearchName = normalizeForSearch(item.name);
            const isVisible = !normalizedSearch || productSearchName.includes(normalizedSearch);

            return `
              <div class="product-row ${isVisible ? "" : "is-hidden"}" data-product-search="${escapeHTML(productSearchName)}">
                <div class="product-info">
                  <strong>${escapeHTML(item.name)}</strong>
                  <span>${money(item.price)}</span>
                </div>
                <div class="qty-control">
                  <button class="qty-button" type="button" data-action="decrease" data-index="${index}">−</button>
                  <span class="qty-value">${item.qty}</span>
                  <button class="qty-button" type="button" data-action="increase" data-index="${index}">+</button>
                </div>
              </div>
            `;
          }).join("")}
        </div>

        <div class="command-footer">
          <div class="command-mini-summary">
            <span>${qty} ${qty === 1 ? "produto selecionado" : "produtos selecionados"}</span>
            <strong>${money(total)}</strong>
          </div>

          <div class="command-actions ${isExtra ? "has-extra-removal" : ""}">
            <button class="btn btn-danger" type="button" data-action="clear">Excluir</button>
            <button class="btn btn-edit" type="button" data-action="edit">Editar</button>
            <button class="btn btn-send" type="button" data-action="send" ${total <= 0 ? "disabled" : ""}>Enviar</button>
            ${isExtra ? `<button class="btn btn-remove-extra" type="button" data-action="remove-extra">Remover este Extra</button>` : ""}
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function renderDaily() {
  const total = dayTotalValue();

  dailyTotal.textContent = money(total);
  topDayTotal.textContent = money(total);
  topDayCount.textContent = `${state.dailyEntries.length} ${state.dailyEntries.length === 1 ? "lançamento no dia" : "lançamentos no dia"}`;

  if (state.dailyEntries.length === 0) {
    dailyList.innerHTML = `<tr class="empty-row"><td colspan="6">Nenhuma conta enviada ainda.</td></tr>`;
    return;
  }

  dailyList.innerHTML = state.dailyEntries.map((entry) => `
    <tr data-entry-id="${entry.id}">
      <td>${escapeHTML(entry.origin)}</td>
      <td class="items-cell">${escapeHTML(entry.itemsText)}</td>
      <td><span class="payment-pill">${escapeHTML(entry.payment)}</span></td>
      <td>${escapeHTML(entry.time)}</td>
      <td class="value-cell">${money(entry.value)}</td>
      <td class="actions-cell">
        <button class="table-edit-btn" type="button" data-action="edit-daily" data-id="${entry.id}">Editar</button>
      </td>
    </tr>
  `).join("");
}

function renderAll() {
  renderCommands();
  renderDaily();
  saveState();
}

function updateCommandName(commandId, typedName) {
  const command = findCommand(commandId);
  if (!command) return;

  const newName = normalizeText(typedName);

  if (!newName) {
    showToast("O nome da comanda não pode ficar vazio.");
    renderAll();
    return;
  }

  command.name = newName;
  renderAll();
  showToast(`Nome alterado para ${command.name}.`);
}

function resetCommandName(commandId) {
  const command = findCommand(commandId);
  if (!command) return;

  command.name = command.defaultName;
  renderAll();
  showToast(`${command.defaultName} voltou ao nome padrão.`);
}

function changeQuantity(commandId, index, difference) {
  const command = findCommand(commandId);
  if (!command || !command.items[index]) return;

  command.items[index].qty = Math.max(0, command.items[index].qty + difference);
  renderAll();
}

function clearCommand(commandId) {
  const command = findCommand(commandId);
  if (!command) return;

  if (commandQty(command) === 0) {
    showToast(`${command.name} já está vazia.`);
    return;
  }

  if (!confirm(`Tem certeza que quer excluir todos os dados de ${command.name}?`)) return;

  command.items.forEach((item) => item.qty = 0);
  renderAll();
  showToast(`${command.name} foi limpa.`);
}

function removeExtra(commandId) {
  const command = findCommand(commandId);
  if (!command || command.type !== "extra") return;

  const total = commandTotal(command);
  const message = total > 0
    ? `Tem certeza que quer remover ${command.name}? O total atual dela é ${money(total)} e será perdido.`
    : `Tem certeza que quer remover ${command.name}?`;

  if (!confirm(message)) return;

  state.commands = state.commands.filter((current) => current.id !== commandId);
  renderAll();
  showToast(`${command.name} foi removida.`);
}

function openPayment(commandId) {
  const command = findCommand(commandId);
  if (!command) return;

  const total = commandTotal(command);
  if (total <= 0) {
    showToast(`Adicione produtos antes de enviar ${command.name}.`);
    return;
  }

  state.pendingPaymentCommandId = commandId;
  paymentTitle.textContent = `Enviar ${command.name}`;
  paymentTotal.textContent = money(total);
  paymentItems.textContent = commandItemsText(command) || "Nenhum item selecionado.";
  paymentMethod.value = "";
  openDialog(paymentModal);
}

function closePayment() {
  state.pendingPaymentCommandId = null;
  closeDialog(paymentModal);
}

function confirmPaymentAndSend() {
  const command = findCommand(state.pendingPaymentCommandId);
  if (!command) return;

  const total = commandTotal(command);
  const selectedPayment = paymentMethod.value;

  if (total <= 0) {
    closePayment();
    showToast(`A comanda ${command.name} está vazia.`);
    return;
  }

  if (!paymentMethods.includes(selectedPayment)) {
    showToast("Selecione a forma de pagamento antes de enviar.");
    paymentMethod.focus();
    return;
  }

  state.dailyEntries.push({
    id: id(),
    origin: command.name,
    itemsText: commandItemsText(command) || "Indefinido",
    payment: selectedPayment,
    time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    value: total
  });

  command.items.forEach((item) => item.qty = 0);
  closePayment();
  renderAll();
  showToast(`${command.name} enviada para o Valor do dia.`);

  document.querySelector("#valorDoDia").scrollIntoView({ behavior: "smooth", block: "start" });
}

function openEdit(commandId) {
  const command = findCommand(commandId);
  if (!command) return;

  state.editingCommandId = commandId;
  editTitle.textContent = command.name;
  editCommandName.value = command.name;
  editProducts.innerHTML = command.items.map((item, index) => `
    <div class="edit-product-row">
      <label for="editItem${index}">
        <strong>${escapeHTML(item.name)}</strong>
        <span>${money(item.price)}</span>
      </label>
      <input id="editItem${index}" type="number" min="0" step="1" value="${item.qty}" data-index="${index}" />
    </div>
  `).join("");

  openDialog(editModal);
}

function closeEdit() {
  state.editingCommandId = null;
  closeDialog(editModal);
}

function saveEdit() {
  const command = findCommand(state.editingCommandId);
  if (!command) return;

  const newName = normalizeText(editCommandName.value);
  if (!newName) {
    showToast("O nome da comanda não pode ficar vazio.");
    return;
  }

  command.name = newName;

  editProducts.querySelectorAll("input[data-index]").forEach((input) => {
    const index = Number(input.dataset.index);
    command.items[index].qty = Math.max(0, Math.floor(Number(input.value) || 0));
  });

  closeEdit();
  renderAll();
  showToast(`${command.name} atualizada.`);
}

function openDailyEdit(entryId) {
  const entry = findDailyEntry(entryId);
  if (!entry) return;

  state.editingDailyEntryId = entryId;
  dailyEditOrigin.value = entry.origin;
  dailyEditItems.value = entry.itemsText;
  dailyEditPayment.value = normalizePayment(entry.payment);
  dailyEditValue.value = money(entry.value).replace("R$", "").trim();
  openDialog(dailyEditModal);
}

function closeDailyEdit() {
  state.editingDailyEntryId = null;
  closeDialog(dailyEditModal);
}

function saveDailyEdit() {
  const entry = findDailyEntry(state.editingDailyEntryId);
  if (!entry) return;

  const newOrigin = normalizeText(dailyEditOrigin.value, 45) || "Indefinido";
  const newItems = normalizeLongText(dailyEditItems.value) || "Indefinido";
  const newPayment = normalizePayment(dailyEditPayment.value);
  const newValue = parseMoneyInput(dailyEditValue.value);

  if (newValue <= 0) {
    showToast("Digite um valor válido maior que zero.");
    dailyEditValue.focus();
    return;
  }

  entry.origin = newOrigin;
  entry.itemsText = newItems;
  entry.payment = newPayment;
  entry.value = newValue;

  closeDailyEdit();
  renderAll();
  showToast("Lançamento do Valor do dia atualizado.");
}

function addExtra() {
  const usedNumbers = state.commands
    .filter((command) => command.type === "extra")
    .map((command) => command.defaultName.match(/\d+/)?.[0])
    .map(Number)
    .filter((number) => Number.isFinite(number));

  const nextNumber = usedNumbers.length ? Math.max(...usedNumbers) + 1 : 1;
  const extraName = `Extra ${nextNumber}`;

  state.commands.push(createCommand({
    name: extraName,
    defaultName: extraName,
    type: "extra"
  }));

  renderAll();
  showToast(`${extraName} adicionada.`);
}

function addLooseSale(event) {
  event.preventDefault();

  const value = parseMoneyInput(looseSaleValue.value);

  if (value <= 0) {
    showToast("Digite um valor avulso válido maior que zero.");
    looseSaleValue.focus();
    return;
  }

  if (!confirm(`Tem certeza que quer adicionar o valor avulso de ${money(value)} ao Valor do dia?`)) return;

  state.dailyEntries.push({
    id: id(),
    origin: "Indefinido",
    itemsText: "Indefinido",
    payment: "Indefinido",
    time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    value
  });

  looseSaleValue.value = "";
  renderAll();
  showToast(`Valor avulso de ${money(value)} adicionado ao Valor do dia.`);
  document.querySelector("#valorDoDia").scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetAllAfterFinish() {
  state.dailyEntries = [];
  state.editingCommandId = null;
  state.pendingPaymentCommandId = null;
  state.editingDailyEntryId = null;
  state.commands = defaultFixedCommands.map(createCommand);
  if (looseSaleValue) looseSaleValue.value = "";
  localStorage.removeItem(STORAGE_KEY);
  renderAll();
}

function finishDay() {
  const total = dayTotalValue();
  alert(`Você vendeu o total de ${money(total)}.`);
  resetAllAfterFinish();
  showToast("Reset concluído: extras excluídas, comandas limpas e nomes voltaram ao padrão.");
}

function clearDay() {
  if (state.dailyEntries.length === 0) {
    showToast("O Valor do dia já está zerado.");
    return;
  }

  if (!confirm("Tem certeza que quer limpar o Valor do dia?")) return;

  state.dailyEntries = [];
  renderAll();
  showToast("Valor do dia limpo.");
}

commandsGrid.addEventListener("input", (event) => {
  const input = event.target.closest(".product-search-input");
  if (!input) return;

  const card = event.target.closest(".command-card");
  if (!card) return;

  const command = findCommand(card.dataset.id);
  if (!command) return;

  command.searchTerm = normalizeSearchTerm(input.value);
  filterProductsInCard(card, command.searchTerm);
  saveState();
});

commandsGrid.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const card = event.target.closest(".command-card");
  if (!card) return;

  const commandId = card.dataset.id;
  const action = button.dataset.action;

  if (action === "increase") changeQuantity(commandId, Number(button.dataset.index), 1);
  if (action === "decrease") changeQuantity(commandId, Number(button.dataset.index), -1);
  if (action === "clear") clearCommand(commandId);
  if (action === "edit") openEdit(commandId);
  if (action === "send") openPayment(commandId);
  if (action === "remove-extra") removeExtra(commandId);
  if (action === "reset-name") resetCommandName(commandId);

  if (action === "rename") {
    const input = card.querySelector(".command-name-input");
    updateCommandName(commandId, input.value);
  }
});

commandsGrid.addEventListener("keydown", (event) => {
  const input = event.target.closest(".command-name-input");
  if (!input) return;

  if (event.key === "Enter") {
    event.preventDefault();
    const card = event.target.closest(".command-card");
    updateCommandName(card.dataset.id, input.value);
    input.blur();
  }
});

commandsGrid.addEventListener("focusout", (event) => {
  const input = event.target.closest(".command-name-input");
  if (!input) return;

  const card = event.target.closest(".command-card");
  const command = findCommand(card.dataset.id);
  if (command && normalizeText(input.value) !== command.name) {
    updateCommandName(card.dataset.id, input.value);
  }
});

dailyList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action='edit-daily']");
  if (!button) return;
  openDailyEdit(button.dataset.id);
});

looseSaleForm.addEventListener("submit", addLooseSale);
document.querySelector("#btnAddExtra").addEventListener("click", addExtra);
document.querySelector("#btnFinishDay").addEventListener("click", finishDay);
document.querySelector("#btnClearDay").addEventListener("click", clearDay);

document.querySelector("#btnSaveEdit").addEventListener("click", saveEdit);
document.querySelector("#btnCancelEdit").addEventListener("click", closeEdit);
document.querySelector("#btnCloseEdit").addEventListener("click", closeEdit);

document.querySelector("#btnConfirmPayment").addEventListener("click", confirmPaymentAndSend);
document.querySelector("#btnCancelPayment").addEventListener("click", closePayment);
document.querySelector("#btnClosePayment").addEventListener("click", closePayment);

document.querySelector("#btnSaveDailyEdit").addEventListener("click", saveDailyEdit);
document.querySelector("#btnCancelDailyEdit").addEventListener("click", closeDailyEdit);
document.querySelector("#btnCloseDailyEdit").addEventListener("click", closeDailyEdit);

editModal.addEventListener("click", (event) => {
  if (event.target === editModal) closeEdit();
});

paymentModal.addEventListener("click", (event) => {
  if (event.target === paymentModal) closePayment();
});

dailyEditModal.addEventListener("click", (event) => {
  if (event.target === dailyEditModal) closeDailyEdit();
});

loadState();
renderAll();

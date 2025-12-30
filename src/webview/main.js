import { I18nService } from './services/I18nService.js';
import { HistoryStore } from './store/HistoryStore.js';
import { Calendar } from './components/Calendar.js';
import { HistoryCard } from './components/HistoryCard.js';
import { SettingsModal } from './components/SettingsModal.js';

const vscode = acquireVsCodeApi();

let currentConfig = window.initialConfig || { language: 'auto', timezones: ['UTC'] };

const store = new HistoryStore(
    renderHistory,
    (items) => vscode.setState({ items })
);
const i18n = new I18nService(currentConfig);
const calendar = new Calendar();

const previousState = vscode.getState();
if (previousState && previousState.items) {
    store.items = previousState.items.map(i => ({
        ...i,
        date: new Date(i.date)
    }));
}

window.addEventListener("load", main);
window.addEventListener("message", event => {
    const message = event.data;
    switch (message.command) {
        case 'updateConfig':
            currentConfig = message.config;
            i18n.language = currentConfig.language;
            i18n.timezones = currentConfig.timezones || ['UTC'];
            i18n.locale = i18n._getLocale();
            renderHistory(store.items);
            break;
    }
});

function main() {
    const addManualBtn = document.getElementById("add-manual-btn");

    if (addManualBtn) {
        addManualBtn.addEventListener("click", handleAddManual);
    }

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');

    const dateInput = document.getElementById("manual-date");
    const timeInput = document.getElementById("manual-time");

    if (dateInput) {
        dateInput.value = `${yyyy}/${mm}/${dd}`;
        dateInput.addEventListener('focus', () => calendar.show(dateInput));
    }

    if (timeInput) {
        timeInput.value = "00:00:00";
    }

    renderHistory(store.items);
}

function handleAddManual() {
    const dateInput = document.getElementById("manual-date");
    const timeInput = document.getElementById("manual-time");

    if (!dateInput || !timeInput) return;

    const dateStr = dateInput.value;
    const timeStr = timeInput.value;

    const date = new Date(`${dateStr} ${timeStr}`);

    if (isNaN(date.getTime())) {
        if (dateStr) {
            dateInput.style.borderColor = "var(--vscode-inputValidation-errorBorder)";
            setTimeout(() => dateInput.style.borderColor = "", 1000);
        }
        return;
    }

    store.add(date);
}

function renderHistory(items) {
    const list = document.getElementById("history-list");
    if (!list) return;
    list.innerHTML = "";

    const sortedItems = [...items].sort((a, b) => b.date - a.date);

    sortedItems.forEach(item => {
        const card = new HistoryCard(item, i18n, store, calendar, vscode);
        list.appendChild(card.element);
    });
}

function openSettingsModal() {
    const modal = new SettingsModal(i18n, currentConfig,
        (newConfig) => {
            currentConfig = newConfig;
            vscode.postMessage({ command: 'saveConfig', config: newConfig });
            i18n.timezones = newConfig.timezones || ['UTC'];
            i18n.language = newConfig.language;
            renderHistory(store.items);
        },
        () => {
            if (modal.element.parentNode) {
                document.body.removeChild(modal.element);
            }
        }
    );
    document.body.appendChild(modal.element);
}

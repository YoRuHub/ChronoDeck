import { I18nService } from './services/I18nService.js';
import { HistoryStore } from './store/HistoryStore.js';
import { Calendar } from './components/Calendar.js';
import { HistoryList } from './components/HistoryList.js';
import { ManualInput } from './components/ManualInput.js';

const vscode = acquireVsCodeApi();

let currentConfig = window.initialConfig || { language: 'auto', timezones: ['UTC'] };

// Initialize Services first
const i18n = new I18nService(currentConfig);
const calendar = new Calendar();
const historyList = new HistoryList("history-list", i18n, null, calendar, vscode); // Store injected later

// Store
const store = new HistoryStore(
    (items) => historyList.render(items),
    (items) => vscode.setState({ items })
);

// Inject store back into list (circular dependency handling or just pass it)
historyList.store = store;

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
            historyList.render(store.items);
            break;
    }
});

function main() {
    // 1. Manual Input Controller
    new ManualInput(store, calendar);

    // 2. Initial Render
    historyList.render(store.items);
}

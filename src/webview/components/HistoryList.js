import { HistoryCard } from './HistoryCard.js';

export class HistoryList {
    constructor(listId, i18n, store, calendar, vscode) {
        this.listElement = document.getElementById(listId);
        this.i18n = i18n;
        this.store = store;
        this.calendar = calendar;
        this.vscode = vscode;
    }

    render(items) {
        if (!this.listElement) return;
        this.listElement.innerHTML = "";

        // Keep insertion order (newest created first)
        items.forEach(item => {
            const card = new HistoryCard(item, this.i18n, this.store, this.calendar, this.vscode);
            this.listElement.appendChild(card.element);
        });
    }
}

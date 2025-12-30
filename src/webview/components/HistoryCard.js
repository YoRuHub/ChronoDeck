import { HistoryCardHeader } from './HistoryCardHeader.js';
import { HistoryCardBody } from './HistoryCardBody.js';

export class HistoryCard {
    constructor(item, i18n, store, calendar, vscode) {
        this.item = item;
        this.i18n = i18n;
        this.store = store;
        this.calendar = calendar;
        this.vscode = vscode;

        this.element = this._render();
    }

    _render() {
        // Container
        const card = document.createElement("div");
        card.className = "history-card";

        let headerComponent;
        let bodyComponent;

        // Components logic
        const onToggle = () => {
            const newState = !this.item.isExpanded;
            // No need to update localRef manually if we re-render, 
            // but keeping it doesn't hurt. 
            // The Store update will trigger a full re-render of the list.
            this.store.update(this.item.id, { isExpanded: newState }, true);
        };

        // Components
        headerComponent = new HistoryCardHeader(this.item, this.store, this.calendar, onToggle);
        bodyComponent = new HistoryCardBody(this.item, this.store, this.i18n, this.vscode);

        card.appendChild(headerComponent.element);
        card.appendChild(bodyComponent.element);

        return card;
    }
}

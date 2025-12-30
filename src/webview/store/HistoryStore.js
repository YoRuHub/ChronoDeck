export class HistoryStore {
    constructor(onChange, onUpdateState) {
        this.items = [];
        this.onChange = onChange;
        this.onUpdateState = onUpdateState;
    }

    setItems(items) {
        this.items = items;
        this.notify();
    }

    add(date) {
        const newItem = {
            id: Date.now().toString(),
            date: date,
            memo: "",
            isEditing: false,
            isExpanded: true
        };
        this.items.unshift(newItem);
        this.notify();
    }

    update(id, updates, shouldRender = true) {
        this.items = this.items.map(item =>
            item.id === id ? { ...item, ...updates } : item
        );
        if (this.onUpdateState) {
            this.onUpdateState(this.items);
        }
        if (shouldRender) {
            if (this.onChange) {
                this.onChange(this.items);
            }
        }
    }

    delete(id) {
        this.items = this.items.filter(i => i.id !== id);
        this.notify();
    }

    notify() {
        if (this.onChange) this.onChange(this.items);
        if (this.onUpdateState) this.onUpdateState(this.items);
    }
}

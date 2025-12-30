export class HistoryStore {
    constructor(onChange) {
        this.items = [];
        this.onChange = onChange;
    }

    add(date) {
        const newItem = {
            id: Date.now().toString(),
            date: date,
            memo: "",
            isEditing: false
        };
        this.items.unshift(newItem);
        this.notify();
    }

    update(id, updates) {
        const item = this.items.find(i => i.id === id);
        if (item) {
            Object.assign(item, updates);
            this.notify();
        }
    }

    delete(id) {
        this.items = this.items.filter(i => i.id !== id);
        this.notify();
    }

    notify() {
        if (this.onChange) this.onChange(this.items);
    }
}

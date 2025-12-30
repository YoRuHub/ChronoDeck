import { toHalfWidth, autoFormatTime, sanitizeDate, sanitizeTime } from '../utils/stringUtils.js';

export class HistoryCardHeader {
    constructor(item, store, calendar, onToggle) {
        this.item = item;
        this.store = store;
        this.calendar = calendar;
        this.onToggle = onToggle;
        this.element = this._render();
        this.chevron = null;
    }

    _render() {
        const header = document.createElement("div");
        header.className = "card-header";
        if (this.item.isEditing) header.classList.add("editing");

        // Accordion Toggle Logic
        header.onclick = (e) => {
            const target = e.target;
            if (target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.closest('.icon-btn') || target.closest('.edit-wrapper')) {
                return;
            }
            if (!this.item.isEditing) {
                this.onToggle();
            }
        };

        const leftWrapper = document.createElement("div");
        leftWrapper.className = "time-wrapper";
        leftWrapper.style.display = "flex";
        leftWrapper.style.alignItems = "center";

        // Chevron
        this.chevron = document.createElement("div");
        this.chevron.className = this.item.isExpanded ? "chevron expanded" : "chevron";
        this.chevron.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
        leftWrapper.appendChild(this.chevron);

        // Content (Edit vs Display)
        if (this.item.isEditing) {
            this._renderEditInputs(leftWrapper);
        } else {
            this._renderDisplayDate(leftWrapper);
        }

        header.appendChild(leftWrapper);

        // Actions
        if (!this.item.isEditing) {
            this._renderActions(header);
        }

        return header;
    }

    setExpanded(isExpanded) {
        if (this.chevron) {
            if (isExpanded) {
                this.chevron.classList.add("expanded");
            } else {
                this.chevron.classList.remove("expanded");
            }
        }
    }


    _renderActions(container) {
        const actions = document.createElement("div");
        actions.className = "header-actions";

        const editBtn = document.createElement("button");
        editBtn.className = "icon-btn edit-btn";
        editBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
        editBtn.onclick = (e) => {
            e.stopPropagation();
            this.store.update(this.item.id, { isEditing: true });
        };
        actions.appendChild(editBtn);

        const delBtn = document.createElement("button");
        delBtn.className = "icon-btn delete-btn";
        delBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
        delBtn.onclick = (e) => {
            e.stopPropagation();
            this.store.delete(this.item.id);
        };
        actions.appendChild(delBtn);

        container.appendChild(actions);
    }

    _renderDisplayDate(container) {
        const dateSpan = document.createElement("span");
        dateSpan.className = "date-display";
        const dateStr = this.item.date.toLocaleString('ja-JP', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            hour12: false
        });
        const d = this.item.date;
        const fmt = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;

        dateSpan.textContent = fmt;
        dateSpan.style.cursor = "pointer";
        container.appendChild(dateSpan);
    }

    _renderEditInputs(container) {
        const d = this.item.date;
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const hh = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        const ss = String(d.getSeconds()).padStart(2, '0');

        const editWrapper = document.createElement("div");
        editWrapper.className = "edit-wrapper";

        const editDateInput = document.createElement("input");
        editDateInput.type = "text";
        editDateInput.className = "edit-date-input";
        editDateInput.value = `${yyyy}/${mm}/${dd}`;

        const onInputDate = (e) => {
            if (e.isComposing) return;
            editDateInput.value = sanitizeDate(editDateInput.value);
        };
        editDateInput.addEventListener('input', onInputDate);
        editDateInput.addEventListener('compositionend', onInputDate);

        const editTimeInput = document.createElement("input");
        editTimeInput.type = "text";
        editTimeInput.className = "edit-time-input";
        editTimeInput.value = `${hh}:${min}:${ss}`;

        const onInputTime = (e) => {
            if (e.isComposing) return;
            editTimeInput.value = sanitizeTime(editTimeInput.value);
        };
        editTimeInput.addEventListener('input', onInputTime);
        editTimeInput.addEventListener('compositionend', onInputTime);

        editDateInput.onfocus = () => {
            this.calendar.show(editDateInput);
        };

        const save = (e) => {
            if (e) e.stopPropagation();
            const dStr = toHalfWidth(editDateInput.value);
            const tStr = autoFormatTime(toHalfWidth(editTimeInput.value));

            editDateInput.value = dStr;
            editTimeInput.value = tStr;

            const newDate = new Date(`${dStr} ${tStr}`);

            if (!isNaN(newDate.getTime())) {
                this.store.update(this.item.id, { date: newDate, isEditing: false });
            }
        };

        const cancel = (e) => {
            if (e) e.stopPropagation();
            this.store.update(this.item.id, { isEditing: false });
        };

        editDateInput.addEventListener("keydown", (e) => { if (e.key === 'Enter') save(e); if (e.key === 'Escape') cancel(e); });
        editTimeInput.addEventListener("keydown", (e) => { if (e.key === 'Enter') save(e); if (e.key === 'Escape') cancel(e); });
        editDateInput.onclick = (e) => e.stopPropagation();
        editTimeInput.onclick = (e) => e.stopPropagation();

        const onBlur = (e) => {
            setTimeout(() => {
                const active = document.activeElement;
                if (active !== editDateInput && active !== editTimeInput && !this.calendar.element.contains(active)) {
                    save();
                }
            }, 100);
        };
        editDateInput.onblur = onBlur;
        editTimeInput.onblur = onBlur;

        editWrapper.appendChild(editDateInput);
        editWrapper.appendChild(editTimeInput);
        container.appendChild(editWrapper);

        setTimeout(() => editDateInput.focus(), 0);
    }
}

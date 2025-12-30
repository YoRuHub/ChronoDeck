export class HistoryCard {
    constructor(item, i18n, store, calendar, vscode) {
        this.item = item;
        this.i18n = i18n;
        this.store = store;
        this.calendar = calendar;
        this.vscode = vscode;

        // Dom References
        this.card = null;
        this.chevron = null;
        this.body = null;

        this.element = this._render();
    }

    _render() {
        this.card = document.createElement("div");
        this.card.className = "history-card";

        this._renderHeader(this.card);
        this._renderBody(this.card);

        return this.card;
    }

    _renderHeader(container) {
        const header = document.createElement("div");
        header.className = "card-header";
        if (this.item.isEditing) header.classList.add("editing");

        // Accordion Toggle
        header.onclick = (e) => {
            const target = e.target;
            // Ignore clicks on interactive elements
            if (target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.closest('.icon-btn') || target.closest('.edit-wrapper')) {
                return;
            }

            if (!this.item.isEditing) {
                this._toggleAccordion();
            }
        };

        const leftWrapper = document.createElement("div");
        leftWrapper.className = "time-wrapper";
        leftWrapper.style.display = "flex";
        leftWrapper.style.alignItems = "center";

        // Chevron
        this.chevron = document.createElement("div");
        // FIX: Initialize state based on persisted isExpanded
        this.chevron.className = this.item.isExpanded ? "chevron expanded" : "chevron";
        this.chevron.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
        leftWrapper.appendChild(this.chevron);

        if (this.item.isEditing) {
            this._renderEditInputs(leftWrapper);
        } else {
            this._renderDisplayDate(leftWrapper);
        }

        header.appendChild(leftWrapper);

        // Actions
        if (!this.item.isEditing) {
            const actions = document.createElement("div");
            actions.className = "header-actions";

            // Edit Button
            const editBtn = document.createElement("button");
            editBtn.className = "icon-btn edit-btn";
            editBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
            editBtn.title = "Edit Date/Time";
            editBtn.onclick = (e) => {
                e.stopPropagation();
                // Ensure expanded when editing starts? Or just edit mode
                this.store.update(this.item.id, { isEditing: true });
            };
            actions.appendChild(editBtn);

            // Delete Button
            const delBtn = document.createElement("button");
            delBtn.className = "icon-btn delete-btn";
            delBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
            delBtn.title = "Delete";
            delBtn.onclick = (e) => {
                e.stopPropagation();
                this.store.delete(this.item.id);
            };
            actions.appendChild(delBtn);

            header.appendChild(actions);
        }

        container.appendChild(header);
    }

    _toggleAccordion() {
        // FIX: Persist state logic
        const newState = !this.item.isExpanded;

        // Immediate DOM update
        this.body.style.display = newState ? "block" : "none";
        if (newState) {
            this.chevron.classList.add("expanded");
        } else {
            this.chevron.classList.remove("expanded");
        }

        // Persist to store (silent update)
        this.store.update(this.item.id, { isExpanded: newState }, false);
    }

    _renderEditInputs(container) {
        const yyyy = this.item.date.getFullYear();
        const mm = String(this.item.date.getMonth() + 1).padStart(2, '0');
        const dd = String(this.item.date.getDate()).padStart(2, '0');

        const hh = String(this.item.date.getHours()).padStart(2, '0');
        const min = String(this.item.date.getMinutes()).padStart(2, '0');
        const ss = String(this.item.date.getSeconds()).padStart(2, '0');

        const editWrapper = document.createElement("div");
        editWrapper.className = "edit-wrapper";

        const editDateInput = document.createElement("input");
        editDateInput.type = "text";
        editDateInput.className = "edit-date-input";
        editDateInput.value = `${yyyy}/${mm}/${dd}`;

        const editTimeInput = document.createElement("input");
        editTimeInput.type = "text";
        editTimeInput.className = "edit-time-input";
        editTimeInput.value = `${hh}:${min}:${ss}`;

        editDateInput.onfocus = () => {
            this.calendar.show(editDateInput);
        };

        const save = (e) => {
            if (e) e.stopPropagation();
            const dStr = this._toHalfWidth(editDateInput.value);
            const tStr = this._autoFormatTime(this._toHalfWidth(editTimeInput.value));

            // UI Feedback
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

    _renderDisplayDate(container) {
        const dateSpan = document.createElement("span");
        dateSpan.className = "date-display";

        const yyyy = this.item.date.getFullYear();
        const mm = String(this.item.date.getMonth() + 1).padStart(2, '0');
        const dd = String(this.item.date.getDate()).padStart(2, '0');
        const hh = String(this.item.date.getHours()).padStart(2, '0');
        const min = String(this.item.date.getMinutes()).padStart(2, '0');
        const ss = String(this.item.date.getSeconds()).padStart(2, '0');

        dateSpan.textContent = `${yyyy}/${mm}/${dd} ${hh}:${min}:${ss}`;
        dateSpan.style.cursor = "pointer";
        container.appendChild(dateSpan);
    }

    _renderBody(container) {
        this.body = document.createElement("div");
        this.body.className = "card-body";
        // FIX: Initialize state based on persisted isExpanded
        this.body.style.display = this.item.isExpanded ? "block" : "none";

        this._renderBodyContent(this.body);
        container.appendChild(this.body);
    }

    _renderBodyContent(container) {
        const infoGrid = document.createElement("div");
        infoGrid.className = "info-grid-modern";

        // Helper for Editable Items
        const createEditableItem = (label, initialValue, onSave) => {
            const item = document.createElement("div");
            item.className = "modern-info-item";

            const labelEl = document.createElement("div");
            labelEl.className = "modern-label";
            labelEl.textContent = label;

            const valueContainer = document.createElement("div");
            valueContainer.className = "modern-value-container";

            const input = document.createElement("input");
            input.type = "text";
            input.className = "modern-value-input";
            input.value = initialValue;

            const commit = () => {
                const converted = this._toHalfWidth(input.value);
                input.value = converted; // UX: Update immediately

                if (converted !== initialValue) {
                    onSave(converted, () => {
                        input.value = initialValue; // Revert on error
                    });
                }
            };

            input.onblur = commit;
            input.onkeydown = (e) => {
                if (e.key === 'Enter') {
                    input.blur();
                }
            };

            const copyBtn = document.createElement("button");
            copyBtn.className = "icon-btn modern-copy-btn";
            copyBtn.title = "Copy";
            copyBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;

            copyBtn.onclick = () => {
                this.vscode.postMessage({ command: 'copyToClipboard', text: input.value });
                const originalIcon = copyBtn.innerHTML;
                copyBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4EC9B0" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
                setTimeout(() => copyBtn.innerHTML = originalIcon, 1500);
            };

            valueContainer.appendChild(input);
            valueContainer.appendChild(copyBtn);
            item.appendChild(labelEl);
            item.appendChild(valueContainer);

            return item;
        };

        // 1. UNIX Timestamp
        const unixTime = Math.floor(this.item.date.getTime() / 1000).toString();
        infoGrid.appendChild(createEditableItem("UNIX Timestamp", unixTime, (val, revert) => {
            const num = parseInt(val, 10);
            if (!isNaN(num)) {
                this.store.update(this.item.id, { date: new Date(num * 1000) });
            } else {
                revert();
            }
        }));

        // 2. Timezones
        if (this.i18n.timezones.length > 0) {
            this.i18n.timezones.forEach(tz => {
                const timeStr = this.i18n.formatTimezone(this.item.date, tz);

                infoGrid.appendChild(createEditableItem(tz, timeStr, (val, revert) => {
                    // Reverse Timezone Logic
                    const guessedDate = new Date(val);
                    if (isNaN(guessedDate.getTime())) {
                        revert();
                        return;
                    }

                    const targetStr = this.i18n.formatTimezone(guessedDate, tz);
                    const targetDatePhantom = new Date(targetStr);
                    const offset = targetDatePhantom.getTime() - guessedDate.getTime();
                    const correctedTime = guessedDate.getTime() - offset;

                    this.store.update(this.item.id, { date: new Date(correctedTime) });
                }));
            });
        }

        container.appendChild(infoGrid);

        // Memo Section
        const memoFooter = document.createElement("div");
        memoFooter.className = "memo-footer";

        const memoArea = document.createElement("textarea");
        // FIX: Restore class and placeholder
        memoArea.className = "memo-input";
        memoArea.placeholder = this.i18n.t('memoPlaceholder');
        memoArea.value = this.item.memo || "";

        memoArea.oninput = (e) => {
            this.store.update(this.item.id, { memo: e.target.value }, false);
        };

        memoFooter.appendChild(memoArea);
        container.appendChild(memoFooter);
    }

    _toHalfWidth(str) {
        return str.replace(/[！-～]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0)).replace(/　/g, " ");
    }

    _autoFormatTime(str) {
        if (!str) return str;
        const parts = str.split(':');
        if (parts.length === 1) return `${parts[0].padStart(2, '0')}:00:00`;
        if (parts.length === 2) return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:00`;
        if (parts.length === 3) return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:${parts[2].padStart(2, '0')}`;
        return str;
    }
}

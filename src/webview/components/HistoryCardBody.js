import { toHalfWidth, sanitizeNumber, sanitizeTime } from '../utils/stringUtils.js';

export class HistoryCardBody {
    constructor(item, store, i18n, vscode) {
        this.item = item;
        this.store = store;
        this.i18n = i18n;
        this.vscode = vscode;
        this.element = this._render();
    }

    _render() {
        const body = document.createElement("div");
        body.className = "card-body";
        body.style.display = this.item.isExpanded ? "flex" : "none";

        this._renderInfoGrid(body);
        this._renderMemo(body);

        return body;
    }

    setVisible(isVisible) {
        this.element.style.display = isVisible ? "flex" : "none";
    }

    _renderInfoGrid(container) {
        const infoGrid = document.createElement("div");
        infoGrid.className = "info-grid-modern";

        // 1. UNIX Timestamp
        const unixTime = Math.floor(this.item.date.getTime() / 1000).toString();
        infoGrid.appendChild(this._createEditableItem("UNIX Timestamp", unixTime, (val, revert) => {
            const num = parseInt(val, 10);
            if (!isNaN(num)) {
                this.store.update(this.item.id, { date: new Date(num * 1000) });
            } else {
                revert();
            }
        }, sanitizeNumber));

        // 2. Timezones
        if (this.i18n.timezones.length > 0) {
            this.i18n.timezones.forEach(tz => {
                const timeStr = this.i18n.formatTimezone(this.item.date, tz);

                infoGrid.appendChild(this._createEditableItem(tz, timeStr, (val, revert) => {
                    const parsedDate = this.i18n.parseTimezoneTime(this.item.date, val, tz);
                    if (parsedDate) {
                        this.store.update(this.item.id, { date: parsedDate });
                    } else {
                        revert();
                    }
                }, sanitizeTime));
            });
        }

        container.appendChild(infoGrid);
    }

    _renderMemo(container) {
        const memoFooter = document.createElement("div");
        memoFooter.className = "memo-footer";

        const memoArea = document.createElement("textarea");
        memoArea.className = "memo-input";
        memoArea.placeholder = this.i18n.t('memoPlaceholder');
        memoArea.value = this.item.memo || "";

        memoArea.oninput = (e) => {
            this.store.update(this.item.id, { memo: e.target.value }, false);
        };

        memoFooter.appendChild(memoArea);
        container.appendChild(memoFooter);
    }

    _createEditableItem(label, initialValue, onSave, sanitizer) {
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

        if (sanitizer) {
            const onInput = (e) => {
                if (e.isComposing) return;
                input.value = sanitizer(input.value);
            };
            input.addEventListener('input', onInput);
            input.addEventListener('compositionend', onInput);
        }

        const commit = () => {
            const converted = toHalfWidth(input.value);
            input.value = converted;

            if (converted !== initialValue) {
                onSave(converted, () => {
                    input.value = initialValue;
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
    }
}

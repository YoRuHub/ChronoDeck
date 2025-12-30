import { toHalfWidth, autoFormatTime, sanitizeDate, sanitizeTime } from '../utils/stringUtils.js';

export class ManualInput {
    constructor(store, calendar) {
        this.store = store;
        this.calendar = calendar;

        // Elements
        this.dateInput = document.getElementById("manual-date");
        this.timeInput = document.getElementById("manual-time");
        this.addBtn = document.getElementById("add-manual-btn");

        this._init();
    }

    _init() {
        // Initialize Add Button
        if (this.addBtn) {
            // Remove existing listeners if any (though usually init is called once)
            const newBtn = this.addBtn.cloneNode(true);
            this.addBtn.parentNode.replaceChild(newBtn, this.addBtn);
            this.addBtn = newBtn;
            this.addBtn.addEventListener("click", () => this.handleAdd());
        }

        // Initialize Form Values
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');

        if (this.dateInput) {
            this.dateInput.value = `${yyyy}/${mm}/${dd}`;
            this.dateInput.addEventListener('focus', () => this.calendar.show(this.dateInput));

            // Strict Input Sanitization
            const onInputDate = (e) => {
                // If composing (IME), wait until compositionend
                if (e.isComposing) return;
                const original = this.dateInput.value;
                const sanitized = sanitizeDate(original);
                if (original !== sanitized) {
                    this.dateInput.value = sanitized;
                }
            };
            this.dateInput.addEventListener('input', onInputDate);
            this.dateInput.addEventListener('compositionend', onInputDate);

            // Blur formatting
            this.dateInput.onblur = () => {
                this.dateInput.value = toHalfWidth(this.dateInput.value);
            };

            // Enter key support
            this.dateInput.onkeydown = (e) => {
                if (e.key === 'Enter') {
                    this.dateInput.blur();
                    this.timeInput.focus(); // Move to time input
                }
            };
        }

        if (this.timeInput) {
            this.timeInput.value = "00:00:00";

            // Strict Input Sanitization
            const onInputTime = (e) => {
                if (e.isComposing) return;
                const original = this.timeInput.value;
                const sanitized = sanitizeTime(original);
                if (original !== sanitized) {
                    this.timeInput.value = sanitized;
                }
            };
            this.timeInput.addEventListener('input', onInputTime);
            this.timeInput.addEventListener('compositionend', onInputTime);

            // Blur formatting - Use onblur to avoid duplicates and ensure execution
            this.timeInput.onblur = () => {
                const formatted = autoFormatTime(toHalfWidth(this.timeInput.value));
                if (this.timeInput.value !== formatted) {
                    this.timeInput.value = formatted;
                }
            };

            // Enter key support (Focus management only, NO auto-submit)
            this.timeInput.onkeydown = (e) => {
                if (e.key === 'Enter') {
                    this.timeInput.blur(); // Just trigger formatting
                }
            };
        }
    }

    handleAdd() {
        if (!this.dateInput || !this.timeInput) return;

        const dateStr = toHalfWidth(this.dateInput.value);
        const timeStr = autoFormatTime(toHalfWidth(this.timeInput.value));

        // Auto-convert for UI feedback
        this.dateInput.value = dateStr;
        this.timeInput.value = timeStr;

        const date = new Date(`${dateStr} ${timeStr}`);

        if (isNaN(date.getTime())) {
            if (dateStr) {
                this.dateInput.style.borderColor = "var(--vscode-inputValidation-errorBorder)";
                setTimeout(() => this.dateInput.style.borderColor = "", 1000);
            }
            return;
        }

        this.store.add(date);
    }
}

export class Calendar {
    constructor() {
        this.activeInput = null;
        this.element = document.createElement("div");
        this.element.id = "calendar-popup";
        this.element.className = "calendar-popup hidden";
        document.body.appendChild(this.element);

        this.currentDate = new Date();
        this.render();

        document.addEventListener("mousedown", (e) => {
            if (this.activeInput && !this.element.contains(e.target) && e.target !== this.activeInput) {
                this.hide();
            }
        });
    }

    show(input) {
        this.activeInput = input;

        const parts = input.value.split('/');
        if (parts.length === 3) {
            const date = new Date(input.value);
            if (!isNaN(date.getTime())) {
                this.currentDate = date;
            }
        }

        this.render();
        this.element.classList.remove("hidden");

        const rect = input.getBoundingClientRect();
        const calHeight = this.element.offsetHeight || 250; // Fallback if 0
        const calWidth = this.element.offsetWidth || 220;
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        let top = rect.bottom + 6;
        let left = rect.left;

        // Vertical Positioning
        // Check if there is space below
        if (top + calHeight > viewportHeight) {
            // Check if there is space above
            const spaceAbove = rect.top;
            const spaceBelow = viewportHeight - rect.bottom;

            if (spaceAbove > calHeight || spaceAbove > spaceBelow) {
                top = rect.top - calHeight - 6;
            } else {
                // If neither fits perfectly, clamp to ensure visibility
                top = Math.min(top, viewportHeight - calHeight - 10);
            }
        }

        // Ensure it never goes off-screen top
        if (top < 0) top = 10;

        // Horizontal Positioning
        if (left + calWidth > viewportWidth) {
            left = viewportWidth - calWidth - 10;
        }
        if (left < 0) left = 10;

        this.element.style.top = `${top}px`;
        this.element.style.left = `${left}px`;
    }

    hide() {
        this.element.classList.add("hidden");
        this.activeInput = null;
    }

    render() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        let html = `
            <div class="cal-header">
                <button id="cal-prev">&lt;</button>
                <span>${year}/${month + 1}</span>
                <button id="cal-next">&gt;</button>
            </div>
            <div class="cal-grid">
                <div class="cal-day-name">Su</div><div class="cal-day-name">Mo</div><div class="cal-day-name">Tu</div><div class="cal-day-name">We</div><div class="cal-day-name">Th</div><div class="cal-day-name">Fr</div><div class="cal-day-name">Sa</div>
        `;

        for (let i = 0; i < firstDay.getDay(); i++) {
            html += `<div class="cal-day empty"></div>`;
        }

        for (let d = 1; d <= lastDay.getDate(); d++) {
            html += `<div class="cal-day" data-date="${year}/${String(month + 1).padStart(2, '0')}/${String(d).padStart(2, '0')}">${d}</div>`;
        }

        html += `</div>`;
        this.element.innerHTML = html;

        this.element.querySelector("#cal-prev").onclick = (e) => {
            e.preventDefault();
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.render();
        };
        this.element.querySelector("#cal-next").onclick = (e) => {
            e.preventDefault();
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.render();
        };

        this.element.querySelectorAll(".cal-day:not(.empty)").forEach(el => {
            el.onclick = (e) => {
                e.preventDefault();
                if (this.activeInput) {
                    this.activeInput.value = el.dataset.date;
                    this.activeInput.dispatchEvent(new Event('input'));
                    this.hide();
                }
            };
        });

        this.element.onmousedown = (e) => e.preventDefault();
    }
}

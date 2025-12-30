export class SettingsModal {
    constructor(i18n, currentConfig, onUpdate, onClose) {
        this.i18n = i18n;
        this.currentConfig = JSON.parse(JSON.stringify(currentConfig));
        this.onUpdate = onUpdate;
        this.onClose = onClose;
        this.availableTimezones = this._getAvailableTimezones();
        this.element = this.render();
    }

    _getAvailableTimezones() {
        return Intl.supportedValuesOf('timeZone');
    }

    render() {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';

        overlay.onclick = (e) => {
            if (e.target === overlay) this.onClose();
        };

        const modal = document.createElement('div');
        modal.className = 'settings-modal';

        const headerContainer = document.createElement('div');
        headerContainer.className = 'modal-header';
        headerContainer.style.display = 'flex';
        headerContainer.style.justifyContent = 'space-between';
        headerContainer.style.alignItems = 'center';
        headerContainer.style.marginBottom = '16px';

        const headerTitle = document.createElement('h2');
        headerTitle.textContent = 'Timezone Manager';
        headerTitle.style.margin = '0';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'icon-btn';
        closeBtn.innerHTML = '×';
        closeBtn.style.fontSize = '20px';
        closeBtn.style.fontWeight = 'bold';
        closeBtn.onclick = () => this.onClose();

        headerContainer.appendChild(headerTitle);
        headerContainer.appendChild(closeBtn);
        modal.appendChild(headerContainer);

        const listContainer = document.createElement('div');
        listContainer.className = 'tz-list-container';
        this._renderList(listContainer);
        modal.appendChild(listContainer);

        const addSection = document.createElement('div');
        addSection.className = 'tz-add-section';

        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.className = 'tz-search-input';
        searchInput.placeholder = 'Search & Add timezone...';

        const searchResults = document.createElement('div');
        searchResults.className = 'tz-search-results';
        searchResults.style.display = 'none';

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            if (query.length < 2) {
                searchResults.style.display = 'none';
                return;
            }

            const matches = this.availableTimezones.filter(tz =>
                tz.toLowerCase().includes(query) &&
                !this.currentConfig.timezones.includes(tz)
            );

            this._renderSearchResults(searchResults, matches, (selectedTz) => {
                this.currentConfig.timezones.push(selectedTz);
                this.onUpdate(this.currentConfig);
                this._renderList(listContainer);
                searchInput.value = '';
                searchResults.style.display = 'none';
                searchInput.focus();
            });
        });

        document.addEventListener('click', (e) => {
            if (!addSection.contains(e.target)) {
                searchResults.style.display = 'none';
            }
        });

        addSection.appendChild(searchInput);
        addSection.appendChild(searchResults);
        modal.appendChild(addSection);

        overlay.appendChild(modal);
        return overlay;
    }

    _renderList(container) {
        container.innerHTML = '';
        if (this.currentConfig.timezones.length === 0) {
            container.innerHTML = '<div class="empty-msg" style="padding:10px; color:var(--vscode-descriptionForeground);">No timezones selected</div>';
            return;
        }

        this.currentConfig.timezones.forEach((tz, index) => {
            const item = document.createElement('div');
            item.className = 'tz-item';

            const label = document.createElement('span');
            label.textContent = tz;

            const delBtn = document.createElement('button');
            delBtn.className = 'icon-btn delete';
            delBtn.innerHTML = '×';
            delBtn.onclick = () => {
                this.currentConfig.timezones.splice(index, 1);
                this.onUpdate(this.currentConfig);
                this._renderList(container);
            };

            item.appendChild(label);
            item.appendChild(delBtn);
            container.appendChild(item);
        });
    }

    _renderSearchResults(container, matches, onSelect) {
        container.innerHTML = '';
        if (matches.length === 0) {
            container.style.display = 'none';
            return;
        }
        container.style.display = 'block';

        matches.slice(0, 10).forEach(tz => {
            const div = document.createElement('div');
            div.className = 'tz-search-item';
            div.textContent = tz;
            div.onclick = () => onSelect(tz);
            container.appendChild(div);
        });
    }
}

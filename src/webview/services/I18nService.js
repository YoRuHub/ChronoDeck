export class I18nService {
    constructor(config) {
        this.language = config.language || 'auto';
        this.timezones = config.timezones || ['UTC'];
        this.locale = this._getLocale();
        this.messages = {
            en: {
                addManual: "Add",
                dateFormat: "YYYY/MM/DD",
                timeFormat: "HH:mm:ss",
                settings: "Timezone Settings",
                addTimezone: "Add Timezone",
                searchPlaceholder: "Search timezones...",
                noResults: "No timezones found",
                memoPlaceholder: "Add a memo..."
            },
            ja: {
                addManual: "追加",
                dateFormat: "YYYY/MM/DD",
                timeFormat: "HH:mm:ss",
                settings: "タイムゾーン設定",
                addTimezone: "タイムゾーンを追加",
                searchPlaceholder: "タイムゾーンを検索...",
                noResults: "見つかりませんでした",
                memoPlaceholder: "メモを追加..."
            }
        };
    }

    _getLocale() {
        if (this.language === 'auto') {
            return navigator.language.startsWith('ja') ? 'ja' : 'en';
        }
        return this.language === 'ja' ? 'ja' : 'en';
    }

    t(key) {
        return this.messages[this.locale][key] || key;
    }

    formatDate(date, options = {}) {
        return new Intl.DateTimeFormat(this.locale === 'ja' ? 'ja-JP' : 'en-US', options).format(date);
    }

    formatTimezone(date, timezone) {
        try {
            const dtf = new Intl.DateTimeFormat('ja-JP', {
                timeZone: timezone,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
            return dtf.format(date);
        } catch (e) {
            console.error(`Invalid timezone: ${timezone}`);
            return 'Invalid Timezone';
        }
    }
}

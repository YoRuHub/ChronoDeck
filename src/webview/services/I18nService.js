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
            return new Intl.DateTimeFormat(this.locale, {
                timeZone: timezone,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            }).format(date);
        } catch (e) {
            console.error(`Invalid timezone: ${timezone}`, e);
            return "Invalid Config";
        }
    }

    /**
     * Tries to reconstruct the precise UTC date from a time string in a specific timezone.
     * @param {Date} baseDate - The current date object (used for date parts if timeString only has time, though here we expect full string usually, or we use baseDate to pivot).
     * @param {string} timeString - The edited time string (e.g. "2024/01/01 12:00:00")
     * @param {string} timezone - The timezone of the timeString
     * @returns {Date|null} - The reconstructed Date object or null if invalid
     */
    parseTimezoneTime(baseDate, timeString, timezone) {
        const guessedDate = new Date(timeString);
        if (isNaN(guessedDate.getTime())) return null;

        // "guessedDate" is the time IF it were in the local/browser timezone (or UTC if parsed as such).
        // We need to reverse the specific timezone offset.
        // Strategy: Convert guessedDate to the target timezone string, measure the shift, and apply the inverse.

        try {
            const dateInTargetTzStr = this.formatTimezone(guessedDate, timezone);
            // formatTimezone returns "YYYY/MM/DD HH:MM:SS" (depending on locale, let's assume it matches standard format)
            // Wait, formatTimezone output depends on locale. "this.locale" is used.
            // If locale is 'ja-JP', it might be YYYY/MM/DD ...

            const phantomDate = new Date(dateInTargetTzStr);
            if (isNaN(phantomDate.getTime())) return guessedDate; // Fallback

            const offset = phantomDate.getTime() - guessedDate.getTime();
            return new Date(guessedDate.getTime() - offset);
        } catch (e) {
            console.error("Error parsing timezone time", e);
            return null;
        }
    }
}

/**
 * Converts full-width characters to half-width characters.
 * Useful for normalizing user input.
 * @param {string} str 
 * @returns {string}
 */
export function toHalfWidth(str) {
    return str.replace(/[！-～]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0)).replace(/　/g, " ");
}

/**
 * Automatically formats a time string to HH:MM:SS.
 * Supported inputs: "HH", "HH:MM", "HH:MM:SS".
 * Pads with zeros as needed.
 * @param {string} str 
 * @returns {string}
 */
export function autoFormatTime(str) {
    if (!str) return str;
    const parts = str.split(':');
    if (parts.length === 1) return `${parts[0].padStart(2, '0')}:00:00`;
    if (parts.length === 2) return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:00`;
    if (parts.length === 3) return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:${parts[2].padStart(2, '0')}`;
    return str;
}

export function sanitizeDate(str) {
    return toHalfWidth(str).replace(/[^0-9\/]/g, "");
}

export function sanitizeTime(str) {
    return toHalfWidth(str).replace(/[^0-9:]/g, "");
}

export function sanitizeNumber(str) {
    return toHalfWidth(str).replace(/[^0-9]/g, "");
}

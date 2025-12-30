# ChronoDeck

ChronoDeck is a VS Code extension designed for logging, converting, and managing date/time stamps.
It allows developers to easily record the current time or manually input dates, automatically converting them to Unix Timestamps and displaying them across multiple timezones directly from the sidebar.

## Features

*   **Easy Time Logging**: Add current time or specific dates to your history with a single click.
*   **Unix Timestamp Conversion**: Automatically converts entries to Unix Timestamp, ready for copying.
*   **Timezone Support**: Simultaneously display times in multiple configured timezones (e.g., UTC, JST).
*   **Memo Function**: Leave notes on each history card for tasks or logs.
*   **Modern UI**: A clean, user-friendly design that integrates seamlessly with VS Code themes.
*   **Multi-language**: Supports English and Japanese (Auto-detect).
*   **Strict Input Mode**: Enforces valid formatting and blocks invalid characters real-time.

## Usage

1.  **Open Extension**: Click the ChronoDeck icon in the Activity Bar to open the view.
2.  **Add Entry**:
    *   Enter a Date (YYYY/MM/DD) and Time (HH:mm:ss) in the top input bar.
    *   **Input Rules**:
        *   Non-numeric input is strictly blocked (except valid separators).
        *   Press `Enter` to format the value and move focus. **(Enter does NOT submit)**.
        *   Full-width numbers are automatically converted to half-width on blur.
    *   Click the `+` button to add it to the list.
    *   Defaults to the current time.
3.  **Manage History**:
    *   **Expand/Collapse**: Click on a card header to toggle detailed views. The state is guaranteed to sync.
    *   **Edit**: Click the pencil icon to modify the date/time. Editor implements strict validation.
    *   **Delete**: Click the trash can icon to remove an entry.
    *   **Copy**: Use the copy button next to any value (Timestamp, ISO Date, etc.) to copy it to the clipboard.
    *   **Memo**: Type notes in the text area at the bottom of the card. The area is height-protected and will not collapse.

## Settings

You can configure ChronoDeck via `package.json` or VS Code User Settings.
*Note: A Settings Modal is also available in the UI (Gear icon).*

### Configuration Keys

*   `chronodeck.general.language`: UI Language (`auto`, `en`, `ja`). Default is `auto`.
*   `chronodeck.general.timezones`: Array of IANA timezones to display in history cards.
    *   Default: `["UTC", "Asia/Tokyo"]`
    *   You can add or remove timezones via the UI Settings menu.

## License

This software is released under the [MIT License](LICENSE).

Copyright (c) 2025 YoRuHub

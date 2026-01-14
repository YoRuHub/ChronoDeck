import * as vscode from "vscode";
import * as crypto from "crypto";
import { getUri } from "../utilities/getUri";

export class ChronoViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = "chronodeck.view";

    constructor(private readonly _extensionUri: vscode.Uri) { }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                this._extensionUri
            ],
        };

        webviewView.webview.html = this._getWebviewContent(webviewView.webview, this._extensionUri);

        this._setWebviewMessageListener(webviewView.webview);

        // Listen to configuration changes
        vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration("chronodeck")) {
                this._updateWebviewConfig(webviewView.webview);
            }
        });

        this._updateWebviewConfig(webviewView.webview);
    }

    private _updateWebviewConfig(webview: vscode.Webview) {
        const config = vscode.workspace.getConfiguration('chronodeck');
        webview.postMessage({
            command: 'updateConfig',
            config: {
                language: config.get('general.language'),
                timezones: config.get('general.timezones')
            }
        });
    }

    private _getConfig() {
        const config = vscode.workspace.getConfiguration("chronodeck");
        return {
            language: config.get("general.language", "auto"),
            timezones: config.get("general.timezones", ["UTC"])
        };
    }

    private _getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri) {
        const toolkitUri = getUri(webview, extensionUri, [
            "node_modules",
            "@vscode",
            "webview-ui-toolkit",
            "dist",
            "toolkit.js",
        ]);

        const mainUri = getUri(webview, extensionUri, ["src", "webview", "main.js"]);
        const baseUri = getUri(webview, extensionUri, ["src", "webview", "styles", "base.css"]);
        const cardUri = getUri(webview, extensionUri, ["src", "webview", "styles", "components", "card.css"]);
        const calendarUri = getUri(webview, extensionUri, ["src", "webview", "styles", "components", "calendar.css"]);
        const settingsUri = getUri(webview, extensionUri, ["src", "webview", "styles", "components", "settings.css"]);

        const nonce = getNonce();

        return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
          <link rel="stylesheet" href="${baseUri}">
          <link rel="stylesheet" href="${cardUri}">
          <link rel="stylesheet" href="${calendarUri}">
          <link rel="stylesheet" href="${settingsUri}">
          <title>ChronoDeck</title>
        </head>
        <body>
          <div id="manual-input-container">
            <input type="text" id="manual-date" placeholder="yyyy/mm/dd">
            <input type="text" id="manual-time" placeholder="hh:mm:ss">
            <button id="add-manual-btn" title="Add">＋</button>
          </div>

          <div id="history-list"></div>

          <script type="module" nonce="${nonce}" src="${mainUri}"></script>
          <script nonce="${nonce}">
            window.initialConfig = ${JSON.stringify(this._getConfig())};
          </script>
        </body>
      </html>
    `;
    }

    private _setWebviewMessageListener(webview: vscode.Webview) {
        webview.onDidReceiveMessage(
            (message: any) => {
                const command = message.command;
                const text = message.text;

                switch (command) {
                    case "hello":
                        vscode.window.showInformationMessage(text);
                        return;
                    case "saveConfig":
                        // Update workspace configuration
                        const config = vscode.workspace.getConfiguration("chronodeck");
                        if (message.config && message.config.timezones) {
                            config.update("general.timezones", message.config.timezones, vscode.ConfigurationTarget.Global);
                        }
                        return;
                    case "copyToClipboard":
                        vscode.env.clipboard.writeText(text);
                        return;
                }
            }
        );
    }
}

function getNonce() {
    return crypto.randomBytes(32).toString('hex');
}

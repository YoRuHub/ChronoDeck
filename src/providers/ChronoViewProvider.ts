import * as vscode from "vscode";
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
        const styleUri = getUri(webview, extensionUri, ["src", "webview", "style.css"]);

        const nonce = getNonce();

        return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
          <link rel="stylesheet" href="${styleUri}">
          <title>ChronoDeck</title>
        </head>
        <body>
          <h1>ChronoDeck</h1>
          <section id="clock-container">
            <h2 id="current-time">--:--:--</h2>
            <p id="current-date">Fetching date...</p>
          </section>
          
          <button id="add-now-btn">Add Now</button>
          
          <div id="history-list"></div>

          <script type="module" nonce="${nonce}" src="${mainUri}"></script>
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
                }
            }
        );
    }
}

function getNonce() {
    let text = "";
    const potential = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
        text += potential.charAt(Math.floor(Math.random() * potential.length));
    }
    return text;
}

import * as vscode from "vscode";
import { getUri } from "../utilities/getUri";

export class ChronoPanel {
    public static currentPanel: ChronoPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _disposables: vscode.Disposable[] = [];

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri);
        this._setWebviewMessageListener(this._panel.webview);
    }

    public static render(extensionUri: vscode.Uri) {
        if (ChronoPanel.currentPanel) {
            ChronoPanel.currentPanel._panel.reveal(vscode.ViewColumn.One);
        } else {
            const panel = vscode.window.createWebviewPanel("chronodeck-view", "ChronoDeck", vscode.ViewColumn.One, {
                enableScripts: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(extensionUri, "out"),
                    vscode.Uri.joinPath(extensionUri, "src/webview")
                ],
            });

            ChronoPanel.currentPanel = new ChronoPanel(panel, extensionUri);
        }
    }

    public dispose() {
        ChronoPanel.currentPanel = undefined;

        this._panel.dispose();

        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
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

        // Tip: Use a nonce to whitelists which scripts can be run
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
            },
            undefined,
            this._disposables
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

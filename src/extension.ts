import * as vscode from "vscode";
import { ChronoPanel } from "./panels/ChronoPanel";
import { ChronoViewProvider } from "./providers/ChronoViewProvider";

export function activate(context: vscode.ExtensionContext) {
    // Command to open in panel (legacy/optional)
    const helloCommand = vscode.commands.registerCommand("chronodeck.open", () => {
        ChronoPanel.render(context.extensionUri);
    });

    // Register Side Bar Provider
    const provider = new ChronoViewProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(ChronoViewProvider.viewType, provider)
    );

    context.subscriptions.push(helloCommand);
}

export function deactivate() { }

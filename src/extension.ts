import * as vscode from "vscode";
// Main extension entry point
import { ChronoPanel } from "./panels/chrono-panel";
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

    context.subscriptions.push(vscode.commands.registerCommand("chronodeck.openSettings", () => {
        vscode.commands.executeCommand("workbench.action.openSettings", "chronodeck");
    }));

    context.subscriptions.push(helloCommand);
}

export function deactivate() { }

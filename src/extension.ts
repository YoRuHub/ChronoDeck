import * as vscode from "vscode";
import { ChronoPanel } from "./panels/ChronoPanel";

export function activate(context: vscode.ExtensionContext) {
    const helloCommand = vscode.commands.registerCommand("chronodeck.open", () => {
        ChronoPanel.render(context.extensionUri);
    });

    context.subscriptions.push(helloCommand);
}

export function deactivate() { }

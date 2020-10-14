import * as vscode from "vscode";
import { Completion } from "../../domain/Completion";
import { ILogger } from "../../domain/ILogger";

export const AttributeCompletionTriggerCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

export class AttributeCompletionItemProvider implements vscode.CompletionItemProvider {
  private completion: Completion
  constructor(private log: ILogger) {
    this.completion = new Completion({
      "ho": "hello",
      "hot": "hotel",
      "nd": "noticed",
      "nn": "notion",
      "atn": "attention"
    }, log)
  }
  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
    return this.completion.complete(document.lineAt(position.line).text, position.character).map(proposition => ({ label: proposition }))
  }
}
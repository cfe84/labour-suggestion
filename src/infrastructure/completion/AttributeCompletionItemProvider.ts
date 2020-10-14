import * as vscode from "vscode";
import { Completion } from "../../domain/Completion";
import { ILogger } from "../../domain/ILogger";

export const AttributeCompletionTriggerCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

export class AttributeCompletionItemProvider implements vscode.CompletionItemProvider {
  private completion!: Completion;

  private loadCompletion = () => {
    const configuration = vscode.workspace.getConfiguration("ls").get("dictionary") as string[]
    const dictionary: { [key: string]: string } = {}
    configuration.forEach(entry => {
      const split = entry.split(":")
      if (split.length !== 2) {
        this.log.warn(`Ignored splat: ${split} because it's in the wrong format`)
      }
      dictionary[split[0]] = split[1]
    })
    this.log.log(`Reloaded configuration`)
    this.completion = new Completion(dictionary, this.log)
  }

  constructor(private log: ILogger) {
    this.loadCompletion()
    vscode.workspace.onDidChangeConfiguration(() => {
      this.loadCompletion()
    })
  }

  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
    return this.completion.complete(document.lineAt(position.line).text, position.character).map(proposition => ({ label: proposition }))
  }
}
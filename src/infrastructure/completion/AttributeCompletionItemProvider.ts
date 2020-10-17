import * as vscode from "vscode";
import { Completion, Dictionary } from "../../domain/Completion";
import { ILogger } from "../../domain/ILogger";
import * as fs from "fs"

export const AttributeCompletionTriggerCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

export class AttributeCompletionItemProvider implements vscode.CompletionItemProvider {
  private completion!: Completion
  private loadedFile: string | undefined
  private watcher: fs.FSWatcher | undefined

  private loadDictionaryFromConfiguration(): Dictionary {
    const configuration = vscode.workspace.getConfiguration("ls").get("dictionary") as string[]
    const dictionary: { [key: string]: string } = {}
    configuration.forEach(entry => {
      const split = entry.split(":")
      if (split.length !== 2) {
        this.log.warn(`Ignored splat: ${split} because it's in the wrong format`)
      }
      dictionary[split[0]] = split[1]
    })
    return dictionary
  }

  private loadDictionaryFromFile(file: string) {
    const content = fs.readFileSync(file)
    const dictionary = JSON.parse(`${content}`)
    return dictionary
  }

  private loadCompletion = () => {
    const dictionary = this.loadedFile ? this.loadDictionaryFromFile(this.loadedFile) : this.loadDictionaryFromConfiguration()
    this.log.log(`Reloaded configuration`)
    this.completion = new Completion(dictionary, this.log)
  }

  private configChanged = () => {
    const file = vscode.workspace.getConfiguration("ls").get("filePath") as string
    if (file && this.loadedFile !== file) {
      if (this.watcher) {
        this.watcher.close()
      }
      this.watcher = fs.watch(file, {}, () => {
        this.loadCompletion()
      })
      this.loadedFile = file
    }
    this.loadCompletion()
  }

  constructor(private log: ILogger) {
    this.configChanged()
    vscode.workspace.onDidChangeConfiguration(() => {
      this.configChanged()
    })
  }

  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
    return this.completion
      .complete(document.lineAt(position.line).text, position.character)
      .map((proposition, idx) => ({
        label: proposition,
        kind: vscode.CompletionItemKind.Text,
        preselect: idx === 0
      }))
  }
}
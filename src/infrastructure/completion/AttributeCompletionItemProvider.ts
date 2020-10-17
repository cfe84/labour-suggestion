import * as vscode from "vscode";
import { Completion, Dictionary } from "../../domain/Completion";
import { ILogger } from "../../domain/ILogger";
import * as fs from "fs"

export const AttributeCompletionTriggerCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

interface SuggestionFileRecord {
  shortcut: string
  word: string
}

interface SuggestionFile {
  substitutions: SuggestionFileRecord[]
}

export class AttributeCompletionItemProvider implements vscode.CompletionItemProvider {
  private completion!: Completion
  private loadedFile: string | undefined
  private watcher: fs.FSWatcher | undefined

  private loadDictionaryFromConfiguration(): Dictionary {
    this.log.log(`Loading from configuration`)
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

  private loadDictionaryFromFile(file: string): Dictionary {
    this.log.log(`Loading from file ${file}`)
    const content = fs.readFileSync(file)
    const suggestionFile = JSON.parse(`${content}`) as SuggestionFile
    if (!suggestionFile.substitutions) {
      this.log.error(`File is incorrect: No "substitutions" node found`)
      return {}
    }
    if (!Array.isArray(suggestionFile.substitutions)) {
      this.log.error(`File is incorrect: "substitutions" is not an array`)
      return {}
    }
    const dictionary: Dictionary = {}
    suggestionFile.substitutions.forEach(substitution => {
      if (substitution.shortcut && substitution.word) {
        dictionary[substitution.shortcut] = substitution.word
      } else {
        this.log.warn(`Substitution ${JSON.stringify(substitution)} has an invalid format. Expecting properties 'shortcut' and 'word'. Skipping it`)
      }
    })
    return dictionary
  }

  private loadCompletion = () => {
    const dictionary = this.loadedFile
      ? this.loadDictionaryFromFile(this.loadedFile)
      : this.loadDictionaryFromConfiguration()
    this.log.log(`Reloaded configuration`)
    this.completion = new Completion(dictionary, this.log)
  }

  private configChanged = () => {
    const file = vscode.workspace.getConfiguration("ls").get("filePath") as string
    if (this.loadedFile) {

    }
    if (file && this.loadedFile !== file) {
      if (this.watcher) {
        this.watcher.close()
        this.watcher = undefined
      }
      if (fs.existsSync(file)) {
        this.watcher = fs.watch(file, {}, () => {
          this.loadCompletion()
        })
        this.loadedFile = file
      } else {
        this.log.error(`File: ${file} not found - loading from configuration instead`)
        this.loadedFile = undefined
      }
    } else {
      // Clear loaded file so we load from configuration
      this.loadedFile = undefined
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
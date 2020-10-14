import { ILogger } from "./ILogger"

type Dictionary = { [key: string]: string }

export class Completion {
  private keys: string[]

  constructor(private dictionary: Dictionary, private log: ILogger) {
    this.keys = Object.keys(this.dictionary)
  }

  private isCapitalized = (beginning: string): boolean =>
    /^[A-Z][a-z]*$/.test(beginning)

  private isUpperCase = (beginning: string): boolean =>
    /^[A-Z]+$/.test(beginning)

  private capitalize = (word: string): string =>
    word[0].toUpperCase() + word.substr(1, word.length - 1).toLowerCase()

  private completeWord = (beginning: string): string[] =>
    this.keys
      .filter(key => key.startsWith(beginning.toLowerCase()))
      .map(key => this.dictionary[key])

  private findCurrentWordBeginning(content: string, position: number): string {
    let beginning = position
    while (beginning > 0 && /\w/.test(content[beginning - 1]) && content[beginning - 1] !== "\n") {
      beginning--
    }
    return content.substr(beginning, position - beginning)
  }

  complete(content: string, position: number): string[] {
    const currentWordBeginning = this.findCurrentWordBeginning(content, position)
    if (currentWordBeginning === "") {
      return []
    }
    const completions = this.completeWord(currentWordBeginning)
    if (this.isCapitalized(currentWordBeginning)) {
      return completions.map(word => this.capitalize(word))
    }
    if (this.isUpperCase(currentWordBeginning)) {
      return completions.map(word => word.toUpperCase())
    }
    return completions
  }
}
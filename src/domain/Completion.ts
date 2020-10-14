import { ILogger } from "./ILogger"

type Dictionary = { [key: string]: string }

export class Completion {
  private keys: string[]

  constructor(private dictionary: Dictionary, private log: ILogger) {
    this.keys = Object.keys(this.dictionary)
  }

  private completeAttribute = (beginning: string): string[] =>
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
    return this.completeAttribute(currentWordBeginning)
  }
}
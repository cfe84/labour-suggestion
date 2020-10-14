import * as vscode from 'vscode'
import { ILogger } from '../domain/ILogger'

export class ConsoleLogger implements ILogger {
  private connection: vscode.OutputChannel
  constructor() {
    this.connection = vscode.window.createOutputChannel("Extension: Labour Suggestion")
  }
  log(msg: string): void {
    this.connection.appendLine(`LOG:   ${msg}`)
  }
  warn(msg: string): void {
    this.connection.appendLine(`WARN:  ${msg}`)
  }
  error(msg: string): void {
    this.connection.appendLine(`ERROR: ${msg}`)
  }
}
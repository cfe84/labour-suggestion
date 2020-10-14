import * as vscode from 'vscode'
import * as fs from "fs"
import { ConsoleLogger } from './ConsoleLogger'
import { AttributeCompletionItemProvider, AttributeCompletionTriggerCharacters } from './completion/AttributeCompletionItemProvider'

export function activate(vscontext: vscode.ExtensionContext) {
	const logger = new ConsoleLogger()
	logger.log("Loading")
	const attributeCompletion = new AttributeCompletionItemProvider(logger)
	vscontext.subscriptions.push(
		vscode.languages.registerCompletionItemProvider("markdown", attributeCompletion, ...AttributeCompletionTriggerCharacters)
	)
	logger.log("Loaded")
}

export function deactivate() { }

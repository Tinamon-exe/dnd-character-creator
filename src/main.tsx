import { Modal, App as ObsidianApp , Plugin, Editor, MarkdownView} from "obsidian";
import React from "react";
import { createRoot, Root } from "react-dom/client";
import App from "./app/App";
import { SearchHelp } from "./search-help/commands-search-help";

export class CharacterCreatorModal extends Modal {
	root: Root | null = null;

	onOpen() {
		//React container
		// this.modalEl.addClass("dnd-character-modal");
		this.containerEl.addClass("dnd-character-modal");
		const container = this.contentEl.createDiv();
		

		this.root = createRoot(container);

		this.root.render(
			<App app={this.app} modal={this} />
		);
	}

	onClose() {
		this.root?.unmount();
	}
}

export default class MyPlugin extends Plugin {
	checkForCharacterTrigger(editor: Editor) {
	const cursor = editor.getCursor();
	const line = editor.getLine(cursor.line);



	if (line.includes("/character")) {

		// prevent retrigger loops
		editor.setLine(
			cursor.line,
			line.replace("/character", "")
		);

		new CharacterCreatorModal(this.app).open();
	}
}
	async onload() {
		// this.registerDomEvent(document, "input", () => {
		// 	const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		// 	if (!view) return;

		// 	const editor = view.editor;
		// 	this.checkForCharacterTrigger(editor);
		// });
		this.registerEvent(
			this.app.workspace.on("editor-change", (editor) => {
				this.checkForCharacterTrigger(editor);
			})
		);
		this.registerEditorSuggest(
			new SearchHelp(this)
		);

		// this.addCommand({
		// 	id: "open-character-creator - editor",
		// 	name: "Open Character Creator (from editor)",
		// 	editorCallback: (editor: Editor) => {
		// 		new CharacterCreatorModal(this.app).open();
		// 	}
		// });
		this.addCommand({
			id: "open-character-creator",
			name: "Open Character Creator",
			callback: () => {
				new CharacterCreatorModal(this.app).open();
			}
		});

		this.addRibbonIcon("flame-kindling", "Character Creator", () => {
			new CharacterCreatorModal(this.app).open();
		});
	}
}

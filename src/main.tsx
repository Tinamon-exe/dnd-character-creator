import { Modal, App as ObsidianApp , Plugin, Editor, MarkdownView, PluginSettingTab, Setting, TFile, TFolder} from "obsidian";
import React from "react";
import { createRoot, Root } from "react-dom/client";
import App from "./app/App";
import { SearchHelp } from "./search-help/commands-search-help";



interface MyPluginSettings {
    characterFolder: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
    characterFolder: "Characters"
}


export class CharacterCreatorModal extends Modal {
	root: Root | null = null;
	plugin: MyPlugin;

	constructor(app: ObsidianApp, plugin: MyPlugin) {
        super(app);
        this.plugin = plugin;
    }

	onOpen() {
		// //React container
		// this.containerEl.addClass("dnd-character-modal");
		// const container = this.contentEl.createDiv();
		

		// this.root = createRoot(container);

		// this.root.render(
		// 	<App app={this.app} modal={this} />
		// );

        this.modalEl.addClass("dnd-character-modal");
        
        this.contentEl.empty();
        this.contentEl.addClass("dnd-character-modal-content");

        this.root = createRoot(this.contentEl);
        this.root.render(
            <App app={this.app} modal={this} plugin={this.plugin} />
        );
    }


	onClose() {
		this.root?.unmount();
	}
}

export default class MyPlugin extends Plugin {
	settings!: MyPluginSettings;



	checkForCharacterTrigger(editor: Editor) {
	const cursor = editor.getCursor();
	const line = editor.getLine(cursor.line);



	if (line.includes("/character")) {

		// prevent retrigger loops
		editor.setLine(
			cursor.line,
			line.replace("/character", "")
		);

		new CharacterCreatorModal(this.app,this).open();
	}
}
	async onload() {
		 await this.loadSettings();
        this.addSettingTab(new CharacterSettingTab(this.app, this));
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
				new CharacterCreatorModal(this.app,this).open();
			}
		});

		this.addRibbonIcon("flame-kindling", "Character Creator", () => {
			new CharacterCreatorModal(this.app,this).open();
		});
	}


	async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

	async saveSettings() {
        await this.saveData(this.settings);
    }

	 async getCharactersFromFolder(): Promise<any[]> {
		const folderPath = this.settings.characterFolder;
		const folder = this.app.vault.getAbstractFileByPath(folderPath);

		if (!folder || !(folder instanceof TFolder)) return [];

		const characters: any[] = [];
		for (const child of folder.children) {
			if (child instanceof TFile && child.extension === "md") {
				const cache = this.app.metadataCache.getFileCache(child);
				if (cache?.frontmatter?.dnd_character) {
					characters.push({
						...cache.frontmatter.dnd_character,
						path: child.path,
						name: child.basename
					});
				}
			}
		}
		return characters;
	}
}


// Settings Tab UI
class CharacterSettingTab extends PluginSettingTab {
    plugin: MyPlugin;

	constructor(app: ObsidianApp, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}
	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl("h2", { text: "D&D Character Creator Settings" });

		new Setting(containerEl)
			.setName("Character Folder")
			.setDesc("The folder where your character sheets (Markdown files) are stored.")
			.addText((text) =>
				text
					.setPlaceholder("Characters")
					.setValue(this.plugin.settings.characterFolder)
					.onChange(async (value) => {
						this.plugin.settings.characterFolder = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
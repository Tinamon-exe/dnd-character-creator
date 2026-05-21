import { Modal, App as ObsidianApp , Plugin} from "obsidian";
import React from "react";
import { createRoot, Root } from "react-dom/client";
import App from "./app/App";

export class CharacterCreatorModal extends Modal {
	root: Root | null = null;

	onOpen() {
		//React container
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
	async onload() {
		this.addCommand({
			id: "open-character-creator",
			name: "Open Character Creator",
			callback: () => {
				new CharacterCreatorModal(this.app).open();
			}
		});
	}
}

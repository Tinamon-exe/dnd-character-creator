
import type { App as ObsidianApp } from "obsidian";


export default function App({
	app,
	modal
}: {
	app: ObsidianApp;
	modal: any;
}) {
	return (
		<div className="character-creator">
			<h1>D&D Creator</h1>

		</div>
	);
}

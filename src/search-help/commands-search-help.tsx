import { Editor, EditorPosition, EditorSuggest, EditorSuggestContext, TFile } from "obsidian";

type SlashCommand = {
    key: string;
    label: string;
    action: (app: any) => void;
};

export const SLASH_COMMANDS: SlashCommand[] = [
    {
        key: "character",
        label: "Create Character",
        action: (app) => {
            import("../main").then(({ CharacterCreatorModal }) => {
                new CharacterCreatorModal(app).open();
            });
        }
    }
];


export class SearchHelp extends EditorSuggest<SlashCommand> {
    plugin: any;

    constructor(plugin: any) {
        super(plugin.app);
        this.plugin = plugin;
    }

    onTrigger(
        cursor: EditorPosition,
        editor: Editor,
        file: TFile | null
    ): EditorSuggestContext | null {
        const line = editor.getLine(cursor.line);
        const beforeCursor = line.slice(0, cursor.ch);
        const match = beforeCursor.match(/\/([a-zA-Z]*)$/);

        if (!match) return null;
        return {
            editor,
            file: file ?? null,
            start: {
                line: cursor.line,
                ch: match.index || 0
            },
            end: cursor,
            query: match[1]
        } as EditorSuggestContext;
    }

    getSuggestions(context: any) {
        const query = context.query.toLowerCase();

        return SLASH_COMMANDS.filter(cmd =>
            cmd.key.startsWith(query)
        );
    }

    renderSuggestion(item: SlashCommand, el: HTMLElement) {
        el.createEl("div", { text: item.label });
    }

    selectSuggestion(item: SlashCommand, evt: MouseEvent | KeyboardEvent) {
        const editor = this.context?.editor;
        if (!editor) return;

        editor.replaceRange(
            "",
            this.context!.start,
            this.context!.end
        );
        this.close();

        item.action(this.app);
    }
}


import { createBrowserRouter, RouterProvider, Link, Outlet } from "react-router";
import React, { useState } from "react";
import { CharacterWizard } from "./components/CharacterWizard";
import { CharacterLibrary } from "./components/CharacterLibrary";
import { SpellIndex } from "./components/SpellIndex";
import { EquipmentIndex } from "./components/EquipmentIndex";
import { Toaster } from "./components/ui/sonner";
import { Library, Wand, Book, Package, BadgePlus } from "lucide-react";
import type { App as ObsidianApp } from "obsidian";




type Page = "creator" | "library" | "spells" | "equipment";

export default function App({
    app,
    modal,
    plugin 
}: {
    app: any;
    modal: any;
    plugin: any;
}) {
    const [page, setPage] = useState<Page>("creator");
    const editingCharRef = React.useRef<any>(null);
    const [hovered, setHovered] = React.useState<Page | null>(null);

    function renderPage() {

        switch (page) {
            case "creator":
                return <CharacterWizard app={app} modal={modal} editingChar={editingCharRef.current} />;
            // case "creator":
            // 	return <CharacterWizard app={app} modal={modal} />;
            

            case "library":
                return <CharacterLibrary app={app} onEdit={(char) => {
                    if (char) {
                        // store editing character so wizard picks it up
                        editingCharRef.current = char;
                    }
                    setPage("creator");
                }} />;

            case "spells":
                return <SpellIndex app={app} modal={modal} />;

            case "equipment":
                return <EquipmentIndex app={app} modal={modal} />;

            default:
                return null;
        }
    }

    return (


        <div className="bg-background text-foreground">
            <nav style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--background-modifier-border)',
                background: 'var(--background-primary)',
                padding: '0 1rem',
                height: '56px',
                position: 'sticky',
                top: 0,
                zIndex: 50,
            }}>
                {/* <nav className="border-b bg-background/95 backdrop-blur sticky top-0 z-50"> */}
                <div
                    role="button"
                    onClick={() => setPage("creator")}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 900, textTransform: 'uppercase', fontSize: '1.1rem' }}
                >
                    <Wand style={{ width: '1.25rem', height: '1.25rem' }} />
                    <span>D&D Creator</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {[
                        { label: 'Creator', icon: <BadgePlus style={{ width: '1rem', height: '1rem' }} />, page: 'creator' as Page },
                        { label: 'Library', icon: <Library style={{ width: '1rem', height: '1rem' }} />, page: 'library' as Page },
                        { label: 'Spells', icon: <Book style={{ width: '1rem', height: '1rem' }} />, page: 'spells' as Page },
                        { label: 'Items', icon: <Package style={{ width: '1rem', height: '1rem' }} />, page: 'equipment' as Page },
                    ].map(({ label, icon, page: p }) => (
                        <div
                            key={p}
                            role="button"
                            onClick={() => setPage(p)}
                            onMouseEnter={() => setHovered(p)}
                            onMouseLeave={() => setHovered(null)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.375rem',
                                padding: '0.375rem 0.75rem',
                                borderRadius: '0.375rem',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                background: page === p
                                    ? 'var(--interactive-accent)'
                                    : hovered === p
                                        ? 'var(--background-modifier-hover)'
                                        : 'transparent',
                                color: page === p ? 'var(--text-on-accent)' : 'var(--text-normal)',
                            }}
                        >
                            {icon}
                            <span>{label}</span>
                        </div>
                    ))}
                </div>
            </nav>

            {/* PAGE CONTENT */}
            <main className="py-6">
                {renderPage()}
            </main>

        </div>
    );
}

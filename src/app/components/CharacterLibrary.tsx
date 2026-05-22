import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Notice } from 'obsidian';
import { Download, Upload, Trash, Pencil, User, Plus, Search, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { ReviewStep } from './ReviewStep';
import { useForm, FormProvider } from 'react-hook-form';

const STORAGE_FILE = 'dnd-characters.json';

async function loadCharacters(app: any): Promise<any[]> {
  try {
    const file = app.vault.getAbstractFileByPath(STORAGE_FILE);
    if (!file) return [];
    return JSON.parse(await app.vault.read(file));
  } catch { return []; }
}

async function saveCharacters(app: any, chars: any[]) {
  const content = JSON.stringify(chars, null, 2);
  const file = app.vault.getAbstractFileByPath(STORAGE_FILE);
  if (file) await app.vault.modify(file, content);
  else await app.vault.create(STORAGE_FILE, content);
}

function LibraryCharacterSheet({ char, app }: { char: any; app: any }) { 
  const methods = useForm({ defaultValues: char });
  return (
    <FormProvider {...methods}>
      <ReviewStep formData={char} app={app} />
    </FormProvider>
  );
}

export function CharacterLibrary({
  app,
  onEdit,
}: {
  app: any;
  onEdit: (char: any) => void;
}) {
  const [characters, setCharacters] = React.useState<any[]>([]);
  const [search, setSearch] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    loadCharacters(app).then(chars => {
      setCharacters(chars);
      setLoading(false);
    });
  }, []);

  const handleDelete = async (id: number) => {
    const updated = characters.filter(c => c.id !== id);
    setCharacters(updated);
    await saveCharacters(app, updated);
    new Notice('🗑️ Character deleted');
  };

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(characters, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', 'characters.json');
    document.body.appendChild(a);
    a.click();
    a.remove();
    new Notice('✅ Library exported to characters.json');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (Array.isArray(imported)) {
          const combined = [...characters];
          let added = 0;
          imported.forEach((c: any) => {
            if (!combined.some(x => x.id === c.id)) { combined.push(c); added++; }
          });
          setCharacters(combined);
          await saveCharacters(app, combined);
          new Notice(`✅ Imported ${added} new characters`);
        }
      } catch { new Notice('❌ Failed to parse JSON file'); }
    };
    reader.readAsText(file);
  };

  const filtered = characters.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.class?.toLowerCase().includes(search.toLowerCase()) ||
    c.race?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'400px', color:'var(--text-muted)' }}>
      Loading characters...
    </div>
  );

  return (
    <div className="max-w-screen-2xl mx-auto p-4 md:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight">Hero Library</h1>
          <p className="text-muted-foreground">Manage your roster of adventurers</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" className="hidden" />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-2">
            <Upload className="w-4 h-4" /> Import JSON
          </Button>
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" /> Export JSON
          </Button>
          <Button onClick={() => onEdit(null)} className="gap-2">
            <Plus className="w-4 h-4" /> Create New Hero
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by name, race, or class..." className="pl-10 h-12"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(char => (
            <Card key={char.id} className="group overflow-hidden border-2 hover:border-primary/40 transition-all">
              <CardHeader className="bg-secondary/20 border-b pb-4">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/20">
                    {char.image ? (
                      <div className="w-full h-full" style={{
                        backgroundImage:`url(${char.image})`,
                        backgroundPosition:`${char.imageX||50}% ${char.imageY||50}%`,
                        backgroundSize:`${char.imageScale||100}%`,
                        backgroundRepeat:'no-repeat'
                      }} />
                    ) : <User className="w-6 h-6 text-primary" />}
                  </div>
                  <div className="flex gap-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[95vw] lg:max-w-[900px] w-full max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Character Sheet: {char.name}</DialogTitle>
                          <DialogDescription>Level {char.level} {char.race} {char.class}</DialogDescription>
                        </DialogHeader>
                        <LibraryCharacterSheet char={char} app={app} />
                      </DialogContent>
                    </Dialog>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(char)} className="h-8 w-8 hover:bg-primary/10 hover:text-primary">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(char.id)} className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive">
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="mt-4 text-xl font-bold uppercase truncate">{char.name || 'Unnamed'}</CardTitle>
                <CardDescription>Level {char.level} {char.race} {char.class}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 bg-background">
                <div className="grid grid-cols-6 gap-1 mb-4">
                  {char.stats && Object.entries(char.stats).map(([stat, val]: [string, any]) => (
                    <div key={stat} className="text-center p-1 rounded bg-secondary/30 border border-secondary">
                      <div className="text-[7px] uppercase font-bold text-muted-foreground leading-none mb-1">{stat}</div>
                      <div className="text-xs font-black">{val}</div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  {char.skills?.slice(0,4).map((s: string) => (
                    <Badge key={s} variant="outline" className="text-[9px] px-1 capitalize">{s.replace(/-/g,' ')}</Badge>
                  ))}
                  {(char.skills?.length||0)>4 && <Badge variant="outline" className="text-[9px] px-1">+{(char.skills?.length||0)-4}</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-secondary/10 rounded-xl border-2 border-dashed">
          <User className="w-12 h-12 mx-auto text-muted-foreground opacity-20 mb-4" />
          <h3 className="text-xl font-bold text-muted-foreground">No characters found</h3>
          <p className="text-muted-foreground text-sm">Create your first hero to see them here!</p>
          <Button variant="outline" className="mt-6" onClick={() => onEdit(null)}>Start Creating</Button>
        </div>
      )}
    </div>
  );
}
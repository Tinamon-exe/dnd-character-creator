import React from 'react';
import { Notice } from 'obsidian';
import { Download, Upload, Trash, Pencil, User, Plus, Search, Eye, X, ChevronLeft } from 'lucide-react';
import { ReviewStep } from './ReviewStep';
import { STATS } from '../utils/dnd-data';
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
  const file    = app.vault.getAbstractFileByPath(STORAGE_FILE);
  if (file) await app.vault.modify(file, content);
  else      await app.vault.create(STORAGE_FILE, content);
}

function CharacterSheet({ char, app, onClose }: { char: any; app: any; onClose: () => void }) {
  const methods = useForm({ defaultValues: char });
  return (
    <div style={{ position:'relative' }}>
      {/* Back button */}
      <div role="button" onClick={onClose}
        style={{ 
          display:'inline-flex', 
          alignItems:'center', 
          gap:'0.375rem', 
          cursor:'pointer', 
          marginTop: '1.5rem', 
          marginBottom:'1rem', 
          fontSize:'0.8rem', 
          fontWeight:700, 
          color:'var(--text-muted)', 
          padding:'0.375rem 0.625rem', 
          border:'1px solid var(--background-modifier-border)', 
          borderRadius:'0.375rem', 
          background:'var(--background-modifier-form-field)' 
          }}>
        <ChevronLeft style={{ width:'0.875rem', height:'0.875rem' }} />
        Back to Library
      </div>
      <FormProvider {...methods}>
        <ReviewStep formData={char} app={app} />
      </FormProvider>
    </div>
  );
}

export function CharacterLibrary({
  app,
  onEdit,
}: {
  app: any;
  onEdit: (char: any) => void;
}) {
  const [characters,  setCharacters]  = React.useState<any[]>([]);
  const [search,      setSearch]      = React.useState('');
  const [loading,     setLoading]     = React.useState(true);
  const [viewing,     setViewing]     = React.useState<any | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    loadCharacters(app).then(chars => { setCharacters(chars); setLoading(false); });
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
    a.setAttribute('href', dataStr); a.setAttribute('download', 'characters.json');
    document.body.appendChild(a); a.click(); a.remove();
    new Notice('✅ Library exported');
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
          imported.forEach((c: any) => { if (!combined.some(x => x.id === c.id)) { combined.push(c); added++; } });
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

  // ── shared styles ──
  const iconBtn = (hoverRed = false): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: '2rem', height: '2rem', borderRadius: '0.375rem', cursor: 'pointer',
    border: '1px solid var(--background-modifier-border)',
    background: 'var(--background-modifier-form-field)',
    color: 'var(--text-muted)',
    flexShrink: 0,
  });

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'400px', color:'var(--text-muted)' }}>
      Loading characters...
    </div>
  );

  // ── Character sheet view ──
  if (viewing) {
    return <CharacterSheet char={viewing} app={app} onClose={() => setViewing(null)} />;
  }

  // ── Library list view ──
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem', padding:'0.5rem' }}>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'1rem', flexWrap:'wrap' }}>
        <div>
          <h1 style={{ margin:0, fontSize:'1.75rem', fontWeight:900, textTransform:'uppercase', letterSpacing:'-0.02em' }}>Hero Library</h1>
          <p style={{ margin:'0.25rem 0 0', color:'var(--text-muted)', fontSize:'0.875rem' }}>Manage your roster of adventurers</p>
        </div>
        <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
          <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" style={{ display:'none' }} />
          {[
            { label:'Import JSON', icon:<Upload style={{width:'0.875rem',height:'0.875rem'}}/>,  onClick:()=>fileInputRef.current?.click() },
            { label:'Export JSON', icon:<Download style={{width:'0.875rem',height:'0.875rem'}}/>, onClick:handleExport },
          ].map(btn => (
            <div key={btn.label} role="button" onClick={btn.onClick}
              style={{ display:'flex', alignItems:'center', gap:'0.375rem', padding:'0.5rem 0.875rem', borderRadius:'0.5rem', cursor:'pointer', fontSize:'0.8rem', fontWeight:600, border:'1px solid var(--background-modifier-border)', background:'var(--background-modifier-form-field)', color:'var(--text-normal)' }}>
              {btn.icon} {btn.label}
            </div>
          ))}
          <div role="button" onClick={() => onEdit(null)}
            style={{ display:'flex', alignItems:'center', gap:'0.375rem', padding:'0.5rem 0.875rem', borderRadius:'0.5rem', cursor:'pointer', fontSize:'0.8rem', fontWeight:700, background:'var(--interactive-accent)', color:'#fff', border:'none' }}>
            <Plus style={{ width:'0.875rem', height:'0.875rem' }} /> Create New Hero
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={{ position:'relative' }}>
        <Search style={{ position:'absolute', left:'0.75rem', top:'50%', transform:'translateY(-50%)', width:'1rem', height:'1rem', color:'var(--text-muted)', pointerEvents:'none' }} />
        <input
          placeholder="Search by name, race, or class..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width:'100%', padding:'0.625rem 0.75rem 0.625rem 2.25rem', borderRadius:'0.5rem', border:'1px solid var(--background-modifier-border)', background:'var(--background-modifier-form-field)', color:'var(--text-normal)', fontSize:'0.875rem', outline:'none', boxSizing:'border-box' }}
        />
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem' }}>
          {filtered.map(char => (
            <div key={char.id} style={{ border:'1px solid var(--background-modifier-border)', borderRadius:'0.75rem', overflow:'hidden', background:'var(--background-primary)', display:'flex', flexDirection:'column' }}>

              {/* Card header */}
              <div style={{ padding:'0.875rem', background:'var(--background-secondary)', borderBottom:'1px solid var(--background-modifier-border)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.75rem' }}>
                  {/* Avatar */}
                  <div style={{ width:'3rem', height:'3rem', borderRadius:'0.75rem', background:'var(--background-modifier-form-field)', border:'1px solid var(--background-modifier-border)', overflow:'hidden', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {char.image ? (
                      <div style={{ width:'100%', height:'100%', backgroundImage:`url(${char.image})`, backgroundPosition:`${char.imageX||50}% ${char.imageY||50}%`, backgroundSize:`${char.imageScale||100}%`, backgroundRepeat:'no-repeat' }} />
                    ) : <User style={{ width:'1.5rem', height:'1.5rem', color:'var(--text-muted)' }} />}
                  </div>

                  {/* Action buttons */}
                  <div style={{ display:'flex', gap:'0.25rem' }}>
                    <div role="button" onClick={() => setViewing(char)} style={iconBtn()} title="View sheet">
                      <Eye style={{ width:'0.875rem', height:'0.875rem' }} />
                    </div>
                    <div role="button" onClick={() => onEdit(char)} style={iconBtn()} title="Edit">
                      <Pencil style={{ width:'0.875rem', height:'0.875rem' }} />
                    </div>
                    <div role="button" onClick={() => handleDelete(char.id)}
                      style={{ ...iconBtn(), color:'var(--text-error)', borderColor:'var(--text-error)' }} title="Delete">
                      <Trash style={{ width:'0.875rem', height:'0.875rem' }} />
                    </div>
                  </div>
                </div>

                <div style={{ fontWeight:900, fontSize:'1.1rem', textTransform:'uppercase', letterSpacing:'-0.01em', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                  {char.name || 'Unnamed'}
                </div>
                {/* <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:'0.125rem' }}> */}
                <div style={{ fontSize: '0.75rem', color: 'var(--interactive-accent)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Level {char.level} {char.race} {char.class}
                </div>
              </div>

              {/* Card body */}
              <div style={{ padding:'0.875rem', display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                
                {/* Stats Summary using STATS data */}
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.25rem' }}>
                 {STATS.map(statDef => (
                  <div key={statDef.id} style={{ textAlign: 'center', padding: '6px 2px', background: 'var(--background-modifier-form-field)', borderRadius: '6px', border: '1px solid var(--background-modifier-border)' }}>
                    {/* <div style={{ fontSize: '12px', marginBottom: '2px' }}> {statDef.icon}</div> */}
                    <div style={{ fontSize: '12px', marginBottom: '2px' }}><statDef.lucid_icon size={14}/></div>
                    <div style={{ fontSize: '13px', fontWeight: 900 }}>{char.stats?.[statDef.id] || 10}</div>
                    <div style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-faint)' }}>{statDef.id}</div>
                  </div>
                ))}
              </div>

                
                {/* Stat grid  - COMPACT VERSION
                {char.stats && (
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(6, 1fr)', gap:'0.25rem' }}>
                    {Object.entries(char.stats).map(([stat, val]: [string, any]) => (
                      <div key={stat} style={{ textAlign:'center', padding:'0.25rem 0.125rem', borderRadius:'0.375rem', background:'var(--background-secondary)', border:'1px solid var(--background-modifier-border)' }}>
                        <div style={{ fontSize:'0.55rem', textTransform:'uppercase', fontWeight:700, color:'var(--text-muted)', lineHeight:1, marginBottom:'0.125rem' }}>{stat}</div>
                        <div style={{ fontSize:'0.75rem', fontWeight:900 }}>{val}</div>
                      </div>
                    ))}
                  </div>
                )}
                  */}
                {/* Skill pills */}
                <div style={{ display:'flex', flexWrap:'wrap', gap:'0.25rem' }}>
                  {char.skills?.slice(0, 4).map((s: string) => (
                    <span key={s} style={{ fontSize:'0.65rem', padding:'1px 6px', borderRadius:'999px', border:'1px solid var(--background-modifier-border)', color:'var(--text-muted)', textTransform:'capitalize', background:'var(--background-secondary)' }}>
                      {s.replace(/-/g, ' ')}
                    </span>
                  ))}
                  {(char.skills?.length || 0) > 4 && (
                    <span style={{ fontSize:'0.65rem', padding:'1px 6px', borderRadius:'999px', border:'1px solid var(--background-modifier-border)', color:'var(--text-muted)', background:'var(--background-secondary)' }}>
                      +{(char.skills?.length || 0) - 4}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign:'center', padding:'5rem 2rem', border:'1px dashed var(--background-modifier-border)', borderRadius:'0.75rem', background:'var(--background-secondary)' }}>
          <User style={{ width:'3rem', height:'3rem', margin:'0 auto 1rem', opacity:0.2, color:'var(--text-muted)' }} />
          <div style={{ fontWeight:700, fontSize:'1.125rem', color:'var(--text-muted)', marginBottom:'0.375rem' }}>No characters found</div>
          <div style={{ fontSize:'0.875rem', color:'var(--text-muted)', marginBottom:'1.5rem' }}>Create your first hero to see them here!</div>
          <div role="button" onClick={() => onEdit(null)}
            style={{ display:'inline-flex', alignItems:'center', gap:'0.375rem', padding:'0.5rem 1rem', borderRadius:'0.5rem', cursor:'pointer', fontSize:'0.875rem', fontWeight:600, border:'1px solid var(--background-modifier-border)', background:'var(--background-modifier-form-field)', color:'var(--text-normal)' }}>
            Start Creating
          </div>
        </div>
      )}

    </div>
  );
}



/////// ------ EMOJI VERSION!!!!! --------



// import React, { useState, useEffect, useRef } from 'react';
// import { Notice } from 'obsidian';
// import { Download, Upload, Trash, Pencil, User, Plus, Search, Eye, X, ScrollText } from 'lucide-react';
// import { ReviewStep } from './ReviewStep';
// import { STATS } from '../utils/dnd-data';
// import { useForm, FormProvider } from 'react-hook-form';

// const STORAGE_FILE = 'dnd-characters.json';

// // --- Shared Styles ---
// const cardStyle: React.CSSProperties = {
//   border: '1px solid var(--background-modifier-border)',
//   borderRadius: '0.75rem',
//   background: 'var(--background-primary)',
//   overflow: 'hidden',
//   display: 'flex',
//   flexDirection: 'column',
//   transition: 'transform 0.1s ease',
// };

// const buttonStyle: React.CSSProperties = {
//   display: 'flex',
//   alignItems: 'center',
//   gap: '0.5rem',
//   padding: '0.5rem 0.75rem',
//   borderRadius: '0.375rem',
//   cursor: 'pointer',
//   fontSize: '0.8rem',
//   fontWeight: 600,
//   border: '1px solid var(--background-modifier-border)',
//   background: 'var(--background-secondary)',
//   color: 'var(--text-normal)',
// };

// // --- Helper Functions ---
// async function loadCharacters(app: any): Promise<any[]> {
//   try {
//     const file = app.vault.getAbstractFileByPath(STORAGE_FILE);
//     if (!file) return [];
//     return JSON.parse(await app.vault.read(file));
//   } catch { return []; }
// }

// async function saveCharacters(app: any, chars: any[]) {
//   const content = JSON.stringify(chars, null, 2);
//   const file = app.vault.getAbstractFileByPath(STORAGE_FILE);
//   if (file) await app.vault.modify(file, content);
//   else await app.vault.create(STORAGE_FILE, content);
// }

// function LibraryCharacterSheet({ char, app }: { char: any; app: any }) { 
//   const methods = useForm({ defaultValues: char });
//   return (
//     <FormProvider {...methods}>
//       <ReviewStep formData={char} app={app} />
//     </FormProvider>
//   );
// }

// export function CharacterLibrary({
//   app,
//   onEdit,
// }: {
//   app: any;
//   onEdit: (char: any) => void;
// }) {
//   const [characters, setCharacters] = useState<any[]>([]);
//   const [search, setSearch] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [viewingChar, setViewingChar] = useState<any | null>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   useEffect(() => {
//     loadCharacters(app).then(chars => {
//       setCharacters(chars);
//       setLoading(false);
//     });
//   }, [app]);

//   const handleDelete = async (e: React.MouseEvent, id: number, name: string) => {
//     e.stopPropagation();
//     if (!confirm(`Are you sure you want to delete ${name}?`)) return;

//     const updated = characters.filter(c => c.id !== id);
//     setCharacters(updated);
//     await saveCharacters(app, updated);
//     new Notice('🗑️ Character deleted');
//   };

//   const handleExport = () => {
//     const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(characters, null, 2));
//     const a = document.createElement('a');
//     a.setAttribute('href', dataStr);
//     a.setAttribute('download', 'characters.json');
//     document.body.appendChild(a);
//     a.click();
//     a.remove();
//     new Notice('✅ Library exported to characters.json');
//   };

//   const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onload = async (e) => {
//       try {
//         const imported = JSON.parse(e.target?.result as string);
//         if (Array.isArray(imported)) {
//           const combined = [...characters];
//           let added = 0;
//           imported.forEach((c: any) => {
//             if (!combined.some(x => x.id === c.id)) { combined.push(c); added++; }
//           });
//           setCharacters(combined);
//           await saveCharacters(app, combined);
//           new Notice(`✅ Imported ${added} new characters`);
//         }
//       } catch { new Notice('❌ Failed to parse JSON file'); }
//     };
//     reader.readAsText(file);
//   };

//   // Maybe add blank
//   const filtered = characters.filter(c =>
//     c.name?.toLowerCase().includes(search.toLowerCase()) ||
//     c.class?.toLowerCase().includes(search.toLowerCase()) ||
//     c.race?.toLowerCase().includes(search.toLowerCase())
//   );

//   if (loading) return (
//     <div style={{  padding: '2rem', textAlign: 'center' , display:'flex', alignItems:'center', justifyContent:'center', height:'400px', color:'var(--text-muted)' }}>
//       Loading characters...
//     </div>
//   );

//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem' }}>

//       {/* Header */}
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
//         <div>
//           <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 900, textTransform: 'uppercase' }}>Hero Library</h1>
//           <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage your roster of adventurers</p>
//         </div>
//         <div style={{ display: 'flex', gap: '0.5rem' }}>
//           <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" style={{ display: 'none' }} />
//           <button style={buttonStyle} onClick={() => fileInputRef.current?.click()}>
//             <Upload size={14} />  Import JSON
//           </button>
//           <button style={buttonStyle} onClick={handleExport}>
//             <Download size={14} />Export JSON
//           </button>
//           <button style={{ ...buttonStyle, background: 'var(--interactive-accent)', color: 'white', border: 'none' }} onClick={() => onEdit(null)}>
//             <Plus size={14} /> Create New Hero
//           </button>
//         </div>
//       </div>

//       {/* Search Bar */}
//        <div style={{ position: 'relative' }}>
//         <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} size={18} />
//         <input
//           style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '0.5rem', border: '1px solid var(--background-modifier-border)', background: 'var(--background-modifier-form-field)', fontSize: '1rem' }}
//           placeholder="Search by name, race, or class..." 
//           value={search} 
//           onChange={e => setSearch(e.target.value)} 
//         />
//       </div>

//       {/* Character Grid */}
//        {filtered.length > 0 ? (
//         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
//           {filtered.map(char => (
//             <div key={char.id} style={cardStyle} className="library-card">
//               <div style={{ padding: '1.25rem', background: 'var(--background-secondary)', borderBottom: '1px solid var(--background-modifier-border)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
//                 {/* Avatar */}
//                 <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'var(--background-primary)', border: '2px solid var(--background-modifier-border)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
//                    {char.image ? (
//                      <div style={{ 
//                        width: '100%', 
//                        height: '100%', 
//                        backgroundImage: `url(${char.image})`, 
//                        backgroundPosition: `${char.imageX}% ${char.imageY}%`, 
//                        backgroundSize: `${char.imageScale}%`,
//                        backgroundRepeat: 'no-repeat'
//                       }} />
//                     ) : <User size={28} color="var(--text-faint)" />}
//                 </div>


//                 <div style={{ flex: 1, minWidth: 0 }}>
//                   <div style={{ fontWeight: 900, fontSize: '1.1rem', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
//                     {char.name || 'Unnamed Adventurer'}
//                   </div>
//                   <div style={{ fontSize: '0.75rem', color: 'var(--interactive-accent)', fontWeight: 700, textTransform: 'uppercase' }}>
//                     Lvl {char.level} {char.subrace ? `${char.subrace} ` : ''}{char.race} {char.class}
//                   </div>
//                 </div>
//               </div>
//               {/* Stats Summary using STATS data */}
//               <div style={{ padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px' }}>
//                 {STATS.map(statDef => (
//                   <div key={statDef.id} style={{ textAlign: 'center', padding: '6px 2px', background: 'var(--background-modifier-form-field)', borderRadius: '6px', border: '1px solid var(--background-modifier-border)' }}>
//                     {/* <div style={{ fontSize: '12px', marginBottom: '2px' }}> {statDef.icon}</div> */}
//                     <div style={{ fontSize: '12px', marginBottom: '2px' }}><statDef.lucid_icon size={14}/></div>
//                     <div style={{ fontSize: '13px', fontWeight: 900 }}>{char.stats?.[statDef.id] || 10}</div>
//                     <div style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-faint)' }}>{statDef.id}</div>
//                   </div>
//                 ))}
//               </div>

//               {/* Action Footer */}
//               <div style={{ padding: '0.75rem 1rem', background: 'var(--background-primary)', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid var(--background-modifier-border)' }}>
//                 <button onClick={() => setViewingChar(char)} style={{ ...buttonStyle, padding: '0.4rem 0.8rem' }}><Eye size={14}/> View</button>
//                 <button onClick={() => onEdit(char)} style={{ ...buttonStyle, padding: '0.4rem 0.8rem' }}><Pencil size={14}/> Edit</button>
//                 <button onClick={(e) => handleDelete(e, char.id, char.name)} style={{ ...buttonStyle, padding: '0.4rem 0.8rem', color: 'var(--text-error)' }}><Trash size={14}/></button>
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <div style={{ padding: '5rem 2rem', textAlign: 'center', border: '2px dashed var(--background-modifier-border)', borderRadius: '1rem' }}>
//           <ScrollText size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
//           <h3 style={{ margin: 0, textTransform: 'uppercase', fontWeight: 900 }}>No Adventurers Found</h3>
//           <p style={{ color: 'var(--text-muted)' }}>The tavern is empty. Start by creating a new hero.</p>
//           <button 
//             style={{ ...buttonStyle, background: 'var(--interactive-accent)', color: 'white', border: 'none', margin: '1.5rem auto 0' }} 
//             onClick={() => onEdit(null)}
//           >
//             <Plus size={16} /> Create Character
//           </button>
//         </div>
//       )}

//       {/* Character Preview Overlay */}
//       {viewingChar && (
//         <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
//           <div style={{ background: 'var(--background-primary)', width: '100%', maxWidth: '1000px', maxHeight: '95vh', borderRadius: '1rem', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', border: '1px solid var(--background-modifier-border)' }}>
//             <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--background-modifier-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--background-secondary)' }}>
//               <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
//                 <ScrollText size={18} color="var(--interactive-accent)" />
//                 <div style={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Character Sheet: {viewingChar.name}</div>
//               </div>
//               <button 
//                 onClick={() => setViewingChar(null)} 
//                 style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: '4px' }}
//               >
//                 <X size={24} />
//               </button>
//             </div>
//             <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
//                <LibraryCharacterSheet char={viewingChar} app={app} />
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

     
//                 {/* <CardTitle className="mt-4 text-xl font-bold uppercase truncate">{char.name || 'Unnamed'}</CardTitle>
//                 <CardDescription>Level {char.level} {char.race} {char.class}</CardDescription>
//               </CardHeader>
//               <CardContent className="p-4 bg-background">
//                 <div className="grid grid-cols-6 gap-1 mb-4">
//                   {char.stats && Object.entries(char.stats).map(([stat, val]: [string, any]) => (
//                     <div key={stat} className="text-center p-1 rounded bg-secondary/30 border border-secondary">
//                       <div className="text-[7px] uppercase font-bold text-muted-foreground leading-none mb-1">{stat}</div>
//                       <div className="text-xs font-black">{val}</div>
//                     </div>
//                   ))}
//                 </div>
//                 <div className="flex flex-wrap gap-1">
//                   {char.skills?.slice(0,4).map((s: string) => (
//                     <Badge key={s} variant="outline" className="text-[9px] px-1 capitalize">{s.replace(/-/g,' ')}</Badge>
//                   ))}
//                   {(char.skills?.length||0)>4 && <Badge variant="outline" className="text-[9px] px-1">+{(char.skills?.length||0)-4}</Badge>}
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       ) : (
//         <div className="text-center py-20 bg-secondary/10 rounded-xl border-2 border-dashed">
//           <User className="w-12 h-12 mx-auto text-muted-foreground opacity-20 mb-4" />
//           <h3 className="text-xl font-bold text-muted-foreground">No characters found</h3>
//           <p className="text-muted-foreground text-sm">Create your first hero to see them here!</p>
//           <Button variant="outline" className="mt-6" onClick={() => onEdit(null)}>Start Creating</Button>
//         </div>
//       )}
//     </div>
//   );
// } */}
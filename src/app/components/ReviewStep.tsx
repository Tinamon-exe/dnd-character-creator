import React, { useState } from 'react';
import { Notice } from 'obsidian';
import {
  User, Shield, BarChart, ScrollText, Save, FileCode,
  Zap, Heart, Footprints, Target, Sword, Backpack,
  Sparkles, Brain, Dices, Loader2, Info, Book, Wand2,
  Coins, Plus, Trash2, Edit2, Check, CheckCircle2
} from 'lucide-react';
import { CLASS_DATA, RACE_DATA, WEAPON_DETAILS, SPELL_DATA, EQUIPMENT_DATA, TRAIT_DATA , SKILLS} from '../utils/dnd-data';
import { useFormContext } from 'react-hook-form';

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

const TABS = [
  { id:'overview',  label:'⚔️ Combat'  },
  { id:'spells',    label:'✨ Spells'  },
  { id:'skills',    label:'🎯 Skills'  },
  { id:'traits',    label:'📜 Traits'  },
  { id:'inventory', label:'🎒 Gear'    },
];

// ── shared card style ──────────────────────────────────────────
const card: React.CSSProperties = {
  border: '1px solid var(--background-modifier-border)',
  borderRadius: '0.75rem',
  background: 'var(--background-primary)',
  padding: '1rem',
};

export function ReviewStep({
  formData: initialFormData,
  app,
  modal,
}: {
  formData: any;
  app?: any;
  modal?: any;
}) {
  const formContext = useFormContext();
  const [isSaving,       setIsSaving]       = useState(false);
  const [activeTab,      setActiveTab]      = useState('overview');
  const [expandedSpell,  setExpandedSpell]  = useState<string | null>(null);
  const [expandedItem,   setExpandedItem]   = useState<string | null>(null);
  const [isEditingGear,  setIsEditingGear]  = useState(false);
  const [isEditingMoney, setIsEditingMoney] = useState(false);
  const [newItemName,    setNewItemName]    = useState('');

  const formData    = formContext ? formContext.watch() : initialFormData;
  const classInfo   = CLASS_DATA[formData.class]  || CLASS_DATA.fighter;
  const raceInfo    = RACE_DATA[formData.race]    || RACE_DATA.human;
  const subraceInfo = raceInfo.subraces?.[formData.subrace] || {};

  const proficiencyBonus = Math.floor((formData.level - 1) / 4) + 2;
  const getFinalStat = (s: string) =>
    (formData.stats?.[s] || 10) + (raceInfo.bonuses?.[s] || 0) + (subraceInfo.bonuses?.[s] || 0);
  const getModifier  = (v: number) => { const m = Math.floor((v-10)/2); return m>=0?`+${m}`:String(m); };
  const getModValue  = (s: string) => Math.floor((getFinalStat(s)-10)/2);

  const hp         = classInfo.hitDie + (formData.level-1)*(classInfo.hitDie/2+1) + formData.level*getModValue('con');
  const initiative = getModValue('dex');
  const speed      = subraceInfo.speed || raceInfo.speed || 30;
  const hitDie     = `${formData.level}d${classInfo.hitDie}`;

  let baseAC = 10, dexBonus = getModValue('dex');
  const eq = classInfo.equipment || [];
  if (eq.includes('Chain Mail'))         { baseAC=16; dexBonus=0; }
  else if (eq.includes('Scale Mail'))    { baseAC=14; dexBonus=Math.min(2,dexBonus); }
  else if (eq.includes('Leather Armor')) { baseAC=11; }
  let ac = baseAC + dexBonus;
  if (eq.includes('Shield') || eq.includes('Wooden Shield')) ac+=2;

  const passivePerception = 10 + getModValue('wis') + ((formData.skills||[]).includes('perception') ? proficiencyBonus : 0);

  const spellcasting     = classInfo.spellcasting;
  const isSpellcaster    = !!spellcasting && formData.level >= (spellcasting.levelAvailable||1);
  const racialCantrips   = [...(raceInfo.cantrips||[]), ...(subraceInfo.cantrips||[])];
  const racialTraits     = TRAIT_DATA.races[formData.race]   || [];
  const classTraits      = TRAIT_DATA.classes[formData.class] || [];
  const allTraits        = [...new Set([...racialTraits, ...classTraits, ...(formData.traits||[])])];
  const allFeats         = formData.feats || [];
  const spellAbility     = spellcasting?.ability || 'int';
  const spellSaveDC      = isSpellcaster ? 8+proficiencyBonus+getModValue(spellAbility) : 0;
  const spellAttackBonus = isSpellcaster ? proficiencyBonus+getModValue(spellAbility) : 0;

  const getSpellSlots = (lvl: number, isPact: boolean) => {
    if (isPact) {
      if (lvl<2) return {1:1}; if (lvl<3) return {1:2};
      if (lvl<5) return {2:2}; if (lvl<7) return {3:2};
      if (lvl<9) return {4:2}; return {5:2};
    }
    const s: Record<number,number> = {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
    if (lvl>=1) s[1]=lvl===1?2:lvl===2?3:4; if (lvl>=3) s[2]=lvl===3?2:3;
    if (lvl>=5) s[3]=lvl===5?2:3; if (lvl>=7) s[4]=lvl===7?1:lvl===8?2:3;
    if (lvl>=9) s[5]=lvl===9?1:lvl===10?2:3;
    return s;
  };
  const slots = isSpellcaster ? getSpellSlots(formData.level, spellcasting.isPactMagic) : {};

  const combinedGear = [...(classInfo.equipment||[]), ...(formData.inventory||[])];
  const finalGear    = combinedGear.filter(item => !(formData.removedEquipment||[]).includes(item));
  const weapons      = finalGear.map((item: string) => {
    const clean = item.replace(/^(Two|Four|Five|Ten)\s+/i,'').replace(/s$/,'');
    return { original:item, details: WEAPON_DETAILS[clean]||WEAPON_DETAILS[item] };
  }).filter((w:any) => w.details);

  // ── handlers ──────────────────────────────────────────────────
  const handleSaveCharacter = async () => {
    if (!app) { new Notice('⚠️ No app context available'); return; }
    setIsSaving(true);
    const data = formContext ? formContext.getValues() : formData;
    try {
      const chars  = await loadCharacters(app);
      const charId = data.id || Date.now();
      const charToSave = { ...data, id:charId, savedAt:new Date().toISOString() };
      const idx = chars.findIndex((c:any) => c.id===charId);
      const updated = idx!==-1
        ? chars.map((c:any,i:number) => i===idx ? charToSave : c)
        : [...chars, charToSave];
      if (idx===-1 && formContext) formContext.setValue('id', charId);
      await saveCharacters(app, updated);
      new Notice(data.id ? `✅ ${data.name} updated!` : `✅ ${data.name} saved to library!`);
      setTimeout(() => modal?.close(), 1000);
    } catch { new Notice('❌ Failed to save character'); }
    finally  { setIsSaving(false); }
  };

  const handleAddItem = () => {
    if (!newItemName.trim() || !formContext) return;
    formContext.setValue('inventory', [...(formData.inventory||[]), newItemName.trim()]);
    setNewItemName('');
  };

  const handleRemoveItem = (item: string) => {
    if (!formContext) return;
    if ((formData.inventory||[]).includes(item))
      formContext.setValue('inventory', formData.inventory.filter((i:string) => i!==item));
    else
      formContext.setValue('removedEquipment', [...(formData.removedEquipment||[]), item]);
  };

  const generatePythonScript = () => {
    const script = `class Character:\n    def __init__(self, data):\n        self.name = data['name']\n        self.level = data['level']\n        self.race = data['race']\n        self.char_class = data['class']\n\nchar_data = ${JSON.stringify(formData,null,4)}\nmy_hero = Character(char_data)\nprint(f"Adventure awaits for {my_hero.name}!")\n`;
    const blob = new Blob([script],{type:'text/plain'});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href=url; a.download=`${formData.name||'character'}.py`; a.click();
    URL.revokeObjectURL(url);
  };

  // ── sub-components (no portals) ───────────────────────────────
  const SpellCard = ({ spell, isRacial }: { spell:any; isRacial?:boolean }) => {
    const isExp = expandedSpell===spell.id;
    return (
      <div style={{ border:`1px solid ${isExp?'var(--interactive-accent)':'var(--background-modifier-border)'}`, borderRadius:'0.5rem', overflow:'hidden', background:'var(--background-primary)' }}>
        <div role="button" onClick={()=>setExpandedSpell(isExp?null:spell.id)}
          style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.5rem 0.75rem', cursor:'pointer', background:'var(--background-secondary)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.375rem', flexWrap:'wrap' }}>
            <span style={{ fontWeight:700, fontSize:'0.8rem' }}>{spell.name}</span>
            {isRacial && <span style={{ fontSize:'0.55rem', background:'var(--background-modifier-border)', padding:'1px 4px', borderRadius:'3px', textTransform:'uppercase', fontWeight:700 }}>Racial</span>}
            <span style={{ fontSize:'0.6rem', color:'var(--text-muted)', fontFamily:'monospace', textTransform:'uppercase' }}>{spell.school}</span>
          </div>
          <Info style={{ width:'0.75rem', height:'0.75rem', color:isExp?'var(--interactive-accent)':'var(--text-muted)', flexShrink:0 }} />
        </div>
        {isExp && (
          <div style={{ padding:'0.625rem 0.75rem', fontSize:'0.75rem', color:'var(--text-muted)', lineHeight:1.6, borderTop:'1px solid var(--background-modifier-border)' }}>
            {spell.description}
          </div>
        )}
      </div>
    );
  };

  const ItemRow = ({ item }: { item:string }) => {
    const clean   = item.replace(/^(Two|Four|Five|Ten)\s+/i,'').replace(/s$/,'');
    const details = EQUIPMENT_DATA[clean]||EQUIPMENT_DATA[item];
    const isOpen  = expandedItem===item;
    return (
      <div style={{ border:'1px solid var(--background-modifier-border)', borderRadius:'0.5rem', overflow:'hidden' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.5rem 0.75rem', background:'var(--background-secondary)' }}>
          <div>
            <div style={{ fontSize:'0.75rem', fontWeight:700, textTransform:'uppercase' }}>{item}</div>
            {details && <div style={{ fontSize:'0.65rem', color:'var(--text-muted)' }}>{details.weight} · {details.cost}</div>}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'0.25rem' }}>
            {isEditingGear && (
              <div role="button" onClick={()=>handleRemoveItem(item)}
                style={{ cursor:'pointer', color:'var(--text-error)', padding:'0.25rem', display:'flex', borderRadius:'0.25rem' }}>
                <Trash2 style={{ width:'0.75rem', height:'0.75rem' }} />
              </div>
            )}
            {details && (
              <div role="button" onClick={()=>setExpandedItem(isOpen?null:item)}
                style={{ cursor:'pointer', color:isOpen?'var(--interactive-accent)':'var(--text-muted)', padding:'0.25rem', display:'flex', borderRadius:'0.25rem' }}>
                <Info style={{ width:'0.75rem', height:'0.75rem' }} />
              </div>
            )}
          </div>
        </div>
        {isOpen && details && (
          <div style={{ padding:'0.625rem 0.75rem', fontSize:'0.75rem', color:'var(--text-muted)', lineHeight:1.6, borderTop:'1px solid var(--background-modifier-border)' }}>
            {details.properties}
          </div>
        )}
      </div>
    );
  };

  // ── section heading helper ────────────────────────────────────
  const SectionHead = ({ icon, label }: { icon:React.ReactNode; label:string }) => (
    <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontWeight:900, fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--interactive-accent)', marginBottom:'0.75rem' }}>
      {icon}{label}
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem', paddingBottom:'3rem' }}>

      {/* ── Character header ── */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', gap:'0.75rem', paddingBottom:'1rem', borderBottom:'1px solid var(--background-modifier-border)' }}>
        <div style={{ width:'8rem', height:'8rem', borderRadius:'1.5rem', background:'var(--background-secondary)', border:'3px solid var(--background-modifier-border)', overflow:'hidden', position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>
          {formData.image ? (
            <div style={{ width:'100%', height:'100%', backgroundImage:`url(${formData.image})`, backgroundPosition:`${formData.imageX||50}% ${formData.imageY||50}%`, backgroundSize:`${formData.imageScale||100}%`, backgroundRepeat:'no-repeat' }} />
          ) : <User style={{ width:'3rem', height:'3rem', color:'var(--text-muted)' }} />}
          <div style={{ position:'absolute', bottom:'0.375rem', right:'0.375rem', background:'var(--interactive-accent)', color:'#fff', fontSize:'0.65rem', fontWeight:900, padding:'2px 6px', borderRadius:'999px' }}>
            LVL {formData.level}
          </div>
        </div>
        <h2 style={{ margin:0, fontSize:'1.75rem', fontWeight:900, textTransform:'uppercase', letterSpacing:'-0.02em' }}>
          {formData.name||'Unnamed Adventurer'}
        </h2>
        <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', justifyContent:'center' }}>
          {[
            `${formData.race}${formData.subrace?` (${formData.subrace.replace(/-/g,' ')})` : ''}`,
            `${formData.class}${formData.subclass?` · ${formData.subclass.replace(/-/g,' ')}` : ''}`,
          ].map(label => (
            <span key={label} style={{ background:'var(--background-modifier-form-field)', border:'1px solid var(--background-modifier-border)', borderRadius:'999px', padding:'0.2rem 0.75rem', fontSize:'0.75rem', fontWeight:700, textTransform:'uppercase' }}>
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display:'flex', gap:'0', borderBottom:'2px solid var(--background-modifier-border)' }}>
        {TABS.map(tab => (
          <div key={tab.id} role="button" onClick={()=>setActiveTab(tab.id)}
            style={{ padding:'0.5rem 0.875rem', cursor:'pointer', fontSize:'0.7rem', fontWeight:900, textTransform:'uppercase', letterSpacing:'0.05em', borderBottom: activeTab===tab.id ? '2px solid var(--interactive-accent)' : '2px solid transparent', marginBottom:'-2px', color: activeTab===tab.id ? 'var(--interactive-accent)' : 'var(--text-muted)', transition:'color 0.15s, border-color 0.15s', whiteSpace:'nowrap' }}>
            {tab.label}
          </div>
        ))}
      </div>

      {/* ══ COMBAT ══ */}
      {activeTab==='overview' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {/* Stat boxes */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:'0.5rem' }}>
            {[
              { emoji:'❤️', label:'HP',      value:hp                                             },
              { emoji:'🛡️', label:'AC',      value:ac                                             },
              { emoji:'🎲', label:'Hit Die', value:hitDie                                          },
              { emoji:'⚡', label:'Init',    value:initiative>=0?`+${initiative}`:initiative        },
              { emoji:'👣', label:'Speed',   value:`${speed}ft`                                    },
              { emoji:'💰', label:'Gold',    value:formData.money?.gp||0                           },
            ].map(s => (
              <div key={s.label} style={{ background:'var(--background-secondary)', border:'1px solid var(--background-modifier-border)', borderRadius:'0.75rem', padding:'0.75rem 0.5rem', textAlign:'center' }}>
                <div style={{ fontSize:'1.25rem', marginBottom:'0.125rem' }}>{s.emoji}</div>
                <div style={{ fontSize:'0.55rem', fontWeight:700, textTransform:'uppercase', color:'var(--text-muted)', letterSpacing:'0.05em' }}>{s.label}</div>
                <div style={{ fontSize:'1.375rem', fontWeight:900, lineHeight:1.1 }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            {/* Ability scores */}
            <div style={card}>
              <SectionHead icon={<BarChart style={{width:'0.875rem',height:'0.875rem'}}/>} label="Ability Scores" />
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.5rem' }}>
                {['str','dex','con','int','wis','cha'].map(stat => {
                  const total   = getFinalStat(stat);
                  const isProf  = classInfo.saves.includes(stat);
                  const saveMod = getModValue(stat)+(isProf?proficiencyBonus:0);
                  return (
                    <div key={stat} style={{ background:'var(--background-secondary)', border:`1px solid ${isProf?'var(--interactive-accent)':'var(--background-modifier-border)'}`, borderRadius:'0.5rem', padding:'0.5rem', textAlign:'center' }}>
                      <div style={{ fontSize:'0.6rem', textTransform:'uppercase', fontWeight:700, color:'var(--text-muted)' }}>{stat}</div>
                      <div style={{ fontSize:'1.5rem', fontWeight:900, lineHeight:1 }}>{total}</div>
                      <div style={{ fontSize:'0.8rem', fontWeight:700, color:'var(--interactive-accent)' }}>{getModifier(total)}</div>
                      <div style={{ fontSize:'0.6rem', fontWeight:700, textTransform:'uppercase', marginTop:'0.25rem', padding:'2px', borderRadius:'3px', background:isProf?'var(--interactive-accent)':'var(--background-modifier-border)', color:isProf?'#fff':'var(--text-muted)' }}>
                        Save {saveMod>=0?`+${saveMod}`:saveMod}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Weapons */}
            <div style={card}>
              <SectionHead icon={<Sword style={{width:'0.875rem',height:'0.875rem'}}/>} label="Primary Attacks" />
              <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                {weapons.length>0 ? weapons.map((w:any,idx:number) => {
                  const hitBonus = getModValue(w.details.stat)+proficiencyBonus;
                  const dmgMod   = getModValue(w.details.stat);
                  return (
                    <div key={idx} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.5rem 0.75rem', border:'1px solid var(--background-modifier-border)', borderRadius:'0.5rem', background:'var(--background-secondary)' }}>
                      <div>
                        <div style={{ fontSize:'0.8rem', fontWeight:900, textTransform:'uppercase' }}>{w.original}</div>
                        <div style={{ fontSize:'0.65rem', color:'var(--text-muted)' }}>{w.details.damage}{dmgMod!==0&&(dmgMod>0?`+${dmgMod}`:dmgMod)} {w.details.type}</div>
                      </div>
                      <div style={{ fontSize:'1.5rem', fontWeight:900, color:'var(--interactive-accent)' }}>+{hitBonus}</div>
                    </div>
                  );
                }) : (
                  <div style={{ textAlign:'center', padding:'1.5rem', color:'var(--text-muted)', fontSize:'0.75rem', border:'1px dashed var(--background-modifier-border)', borderRadius:'0.5rem' }}>No weapons detected</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ SPELLS ══ */}
      {activeTab==='spells' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {(!isSpellcaster && racialCantrips.length===0) ? (
            <div style={{ textAlign:'center', padding:'3rem', color:'var(--text-muted)', border:'1px dashed var(--background-modifier-border)', borderRadius:'0.75rem' }}>
              <Wand2 style={{ width:'3rem', height:'3rem', opacity:0.2, margin:'0 auto 0.75rem' }} />
              <div style={{ fontWeight:900, textTransform:'uppercase' }}>No Magic Available</div>
            </div>
          ) : (
            <>
              {isSpellcaster && (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0.5rem' }}>
                  {[
                    { label:'Save DC',   value:spellSaveDC               },
                    { label:'Attack',    value:`+${spellAttackBonus}`     },
                    { label:'Ability',   value:spellAbility.toUpperCase() },
                    { label:'1st Slots', value:(slots as any)[1]||0       },
                  ].map(s => (
                    <div key={s.label} style={{ background:'var(--background-secondary)', border:'1px solid var(--background-modifier-border)', borderRadius:'0.5rem', padding:'0.75rem', textAlign:'center' }}>
                      <div style={{ fontSize:'0.6rem', fontWeight:700, textTransform:'uppercase', color:'var(--text-muted)' }}>{s.label}</div>
                      <div style={{ fontSize:'1.5rem', fontWeight:900, color:'var(--interactive-accent)' }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              )}
              <div>
                <div style={{ fontSize:'0.7rem', fontWeight:900, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--text-muted)', marginBottom:'0.5rem' }}>✨ Cantrips</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem' }}>
                  {[...new Set([...racialCantrips,...(formData.cantrips||[])])].map((id:string) => {
                    const s = SPELL_DATA.cantrips.find((x:any)=>x.id===id);
                    if (!s) return null;
                    return <SpellCard key={id} spell={s} isRacial={racialCantrips.includes(id)} />;
                  })}
                  {[...new Set([...racialCantrips,...(formData.cantrips||[])])].length===0 && (
                    <div style={{ color:'var(--text-muted)', fontSize:'0.75rem', fontStyle:'italic' }}>None selected</div>
                  )}
                </div>
              </div>
              <div>
                <div style={{ fontSize:'0.7rem', fontWeight:900, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--text-muted)', marginBottom:'0.5rem' }}>📖 Prepared Spells</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem' }}>
                  {(formData.spells||[]).map((id:string) => {
                    const all = [...SPELL_DATA.level1,...(SPELL_DATA.level2||[]),...(SPELL_DATA.level3||[]),...(SPELL_DATA.level4||[]),...(SPELL_DATA.level5||[])];
                    const s   = all.find((x:any)=>x.id===id);
                    if (!s) return null;
                    return <SpellCard key={id} spell={s} />;
                  })}
                  {(formData.spells||[]).length===0 && (
                    <div style={{ color:'var(--text-muted)', fontSize:'0.75rem', fontStyle:'italic' }}>No spells prepared</div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ══ SKILLS ══ */}
      {activeTab==='skills' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
          <div style={card}>
            <SectionHead icon={<Target style={{width:'0.875rem',height:'0.875rem'}}/>} label="Skills" />
            <div style={{ display:'flex', flexDirection:'column', gap:'0.125rem' }}>
              {SKILLS.map(skill => {
              // {SKILL_LIST.map(skill => {
                const isProf = formData.skills?.includes(skill.id);
                const mod    = getModValue(skill.stat)+(isProf?proficiencyBonus:0);
                return (
                  <div key={skill.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.375rem 0.5rem', borderRadius:'0.375rem', fontSize:'0.75rem', background:isProf?'var(--background-modifier-form-field)':'transparent', border:isProf?'1px solid var(--interactive-accent)':'1px solid transparent', marginBottom:'0.125rem' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                      <div style={{ width:'0.5rem', height:'0.5rem', borderRadius:'50%', background:isProf?'var(--interactive-accent)':'var(--background-modifier-border)', flexShrink:0 }} />
                      <span style={{ textTransform:'capitalize', fontWeight:isProf?700:400, color:isProf?'var(--text-normal)':'var(--text-muted)' }}>{skill.id.replace(/-/g,' ')}</span>
                      <span style={{ fontSize:'0.6rem', color:'var(--text-faint)', textTransform:'uppercase' }}>({skill.stat})</span>
                    </div>
                    <span style={{ fontFamily:'monospace', fontWeight:700, color:isProf?'var(--interactive-accent)':'var(--text-muted)' }}>{mod>=0?`+${mod}`:mod}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div style={card}>
              <SectionHead icon={<Brain style={{width:'0.875rem',height:'0.875rem'}}/>} label="Senses" />
              {[
                { label:'Proficiency Bonus',  value:`+${proficiencyBonus}` },
                { label:'Passive Perception', value:passivePerception      },
              ].map(row => (
                <div key={row.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.5rem', borderRadius:'0.375rem', border:'1px solid var(--background-modifier-border)', marginBottom:'0.5rem' }}>
                  <span style={{ fontSize:'0.65rem', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase' }}>{row.label}</span>
                  <span style={{ fontSize:'1.25rem', fontWeight:900, color:'var(--interactive-accent)' }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ TRAITS ══ */}
      {activeTab==='traits' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
          <div style={card}>
            <SectionHead icon={<ScrollText style={{width:'0.875rem',height:'0.875rem'}}/>} label="Traits" />
            {allTraits.length===0 ? (
              <div style={{ textAlign:'center', padding:'2rem', color:'var(--text-muted)', fontStyle:'italic', border:'1px dashed var(--background-modifier-border)', borderRadius:'0.5rem' }}>No traits found</div>
            ) : allTraits.map((trait:string,idx:number) => (
              <div key={idx} style={{ display:'flex', alignItems:'flex-start', gap:'0.5rem', padding:'0.5rem', background:'var(--background-secondary)', borderRadius:'0.5rem', marginBottom:'0.5rem' }}>
                <CheckCircle2 style={{ width:'0.875rem', height:'0.875rem', color:'#10b981', flexShrink:0, marginTop:'0.125rem' }} />
                <div>
                  <div style={{ fontSize:'0.8rem', fontWeight:700, textTransform:'uppercase' }}>{trait}</div>
                  <div style={{ fontSize:'0.65rem', color:'var(--text-muted)' }}>Source: {racialTraits.includes(trait)?'Race':'Class'}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={card}>
            <SectionHead icon={<Sparkles style={{width:'0.875rem',height:'0.875rem'}}/>} label="Feats" />
            {allFeats.length===0 ? (
              <div style={{ textAlign:'center', padding:'2rem', color:'var(--text-muted)', fontStyle:'italic', border:'1px dashed var(--background-modifier-border)', borderRadius:'0.5rem' }}>No feats taken</div>
            ) : allFeats.map((feat:string,idx:number) => (
              <div key={idx} style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.5rem', background:'var(--background-secondary)', borderRadius:'0.5rem', marginBottom:'0.5rem', border:'1px solid var(--interactive-accent)' }}>
                <Sparkles style={{ width:'0.75rem', height:'0.75rem', color:'var(--interactive-accent)', flexShrink:0 }} />
                <div style={{ fontSize:'0.8rem', fontWeight:700, textTransform:'uppercase' }}>{feat}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ GEAR ══ */}
      {activeTab==='inventory' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
          {/* Inventory */}
          <div style={card}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem' }}>
              <SectionHead icon={<Backpack style={{width:'0.875rem',height:'0.875rem'}}/>} label="Inventory" />
              <div role="button" onClick={()=>setIsEditingGear(!isEditingGear)}
                style={{ display:'flex', alignItems:'center', gap:'0.25rem', cursor:'pointer', fontSize:'0.65rem', fontWeight:700, textTransform:'uppercase', color:'var(--text-muted)', padding:'0.25rem 0.5rem', border:'1px solid var(--background-modifier-border)', borderRadius:'0.375rem' }}>
                {isEditingGear ? <><Check style={{width:'0.7rem',height:'0.7rem'}}/> Done</> : <><Edit2 style={{width:'0.7rem',height:'0.7rem'}}/> Edit</>}
              </div>
            </div>
            {isEditingGear && (
              <div style={{ display:'flex', gap:'0.5rem', marginBottom:'0.75rem' }}>
                <input placeholder="Add new item..." value={newItemName}
                  onChange={e=>setNewItemName(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&handleAddItem()}
                  style={{ flex:1, padding:'0.375rem 0.625rem', borderRadius:'0.375rem', border:'1px solid var(--background-modifier-border)', background:'var(--background-modifier-form-field)', color:'var(--text-normal)', fontSize:'0.8rem' }}
                />
                <div role="button" onClick={handleAddItem}
                  style={{ display:'flex', alignItems:'center', justifyContent:'center', width:'2rem', height:'2rem', background:'var(--interactive-accent)', borderRadius:'0.375rem', cursor:'pointer', flexShrink:0 }}>
                  <Plus style={{ width:'0.875rem', height:'0.875rem', color:'#fff' }} />
                </div>
              </div>
            )}
            <div style={{ display:'flex', flexDirection:'column', gap:'0.375rem' }}>
              {finalGear.map((item:string,idx:number) => <ItemRow key={idx} item={item} />)}
            </div>
          </div>

          {/* Currency */}
          <div style={card}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem' }}>
              <SectionHead icon={<Coins style={{width:'0.875rem',height:'0.875rem'}}/>} label="Currency" />
              <div role="button" onClick={()=>setIsEditingMoney(!isEditingMoney)}
                style={{ display:'flex', alignItems:'center', gap:'0.25rem', cursor:'pointer', fontSize:'0.65rem', fontWeight:700, textTransform:'uppercase', color:'var(--text-muted)', padding:'0.25rem 0.5rem', border:'1px solid var(--background-modifier-border)', borderRadius:'0.375rem' }}>
                {isEditingMoney ? <><Check style={{width:'0.7rem',height:'0.7rem'}}/> Done</> : <><Edit2 style={{width:'0.7rem',height:'0.7rem'}}/> Edit</>}
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'0.375rem' }}>
              {[
                { id:'cp', name:'CP', color:'#c2700f' },
                { id:'sp', name:'SP', color:'#94a3b8' },
                { id:'ep', name:'EP', color:'#059669' },
                { id:'gp', name:'GP', color:'#d97706' },
                { id:'pp', name:'PP', color:'#7c3aed' },
              ].map(coin => (
                <div key={coin.id} style={{ background:'var(--background-secondary)', border:'1px solid var(--background-modifier-border)', borderRadius:'0.5rem', padding:'0.5rem', textAlign:'center' }}>
                  <div style={{ fontSize:'0.65rem', fontWeight:900, color:coin.color }}>{coin.name}</div>
                  {isEditingMoney && formContext ? (
                    <input type="number"
                      style={{ width:'100%', textAlign:'center', background:'transparent', border:'none', fontSize:'0.875rem', fontWeight:900, color:'var(--text-normal)', outline:'none' }}
                      {...formContext.register(`money.${coin.id}`, { valueAsNumber:true })}
                    />
                  ) : (
                    <div style={{ fontSize:'0.875rem', fontWeight:900, marginTop:'0.25rem' }}>{formData.money?.[coin.id]||0}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Action buttons ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginTop:'0.5rem' }}>
        <div role="button" onClick={handleSaveCharacter}
          style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'1rem 1.25rem', borderRadius:'0.75rem', cursor:isSaving?'wait':'pointer', background:'var(--interactive-accent)', color:'#fff', opacity:isSaving?0.7:1, transition:'opacity 0.15s' }}>
          {isSaving ? <Loader2 style={{width:'1.5rem',height:'1.5rem'}} className="animate-spin" /> : <Save style={{width:'1.5rem',height:'1.5rem'}} />}
          <div>
            <div style={{ fontWeight:900, textTransform:'uppercase', fontSize:'0.875rem' }}>{isSaving?'Saving...':'Save Character'}</div>
            <div style={{ fontSize:'0.65rem', opacity:0.8 }}>Save to vault as JSON</div>
          </div>
        </div>
        <div role="button" onClick={generatePythonScript}
          style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'1rem 1.25rem', borderRadius:'0.75rem', cursor:'pointer', background:'var(--background-modifier-form-field)', border:'1px solid var(--background-modifier-border)', color:'var(--text-normal)' }}>
          <FileCode style={{ width:'1.5rem', height:'1.5rem', color:'#3b82f6' }} />
          <div>
            <div style={{ fontWeight:900, textTransform:'uppercase', fontSize:'0.875rem' }}>Export Code</div>
            <div style={{ fontSize:'0.65rem', color:'var(--text-muted)' }}>Download .py file</div>
          </div>
        </div>
      </div>

    </div>
  );
}

// import React, { useState } from 'react';
// import { Card, CardContent } from './ui/card';
// import { Badge } from './ui/badge';
// import { Button } from './ui/button';
// import { Input } from './ui/input';
// import { Notice } from 'obsidian';
// import {
//   User, Shield, BarChart, ScrollText, Save,
//   FileCode, Zap, Heart, Footprints, Target,
//   Sword, Backpack, Sparkles, BookOpen, Brain,
//   Dices, Loader2, Info, Book, Wand2,
//   Coins, Plus, Trash2, Edit2, Check, X, CheckCircle2
// } from 'lucide-react';
// import { CLASS_DATA, RACE_DATA, WEAPON_DETAILS, SPELL_DATA, EQUIPMENT_DATA, TRAIT_DATA } from '../utils/dnd-data';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
// import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
// import { useFormContext } from 'react-hook-form';

// const STORAGE_FILE = 'dnd-characters.json';

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

// export function ReviewStep({
//   formData: initialFormData,
//   app,
//   modal,
// }: {
//   formData: any;
//   app?: any;
//   modal?: any;
// }) {
//   const formContext = useFormContext();
//   const [isSaving, setIsSaving] = useState(false);
//   const [expandedSpell, setExpandedSpell] = useState<string | null>(null);
//   const [isEditingGear, setIsEditingGear] = useState(false);
//   const [isEditingMoney, setIsEditingMoney] = useState(false);
//   const [newItemName, setNewItemName] = useState('');

//   const formData = formContext ? formContext.watch() : initialFormData;

//   const classInfo = CLASS_DATA[formData.class] || CLASS_DATA.fighter;
//   const raceInfo  = RACE_DATA[formData.race]   || RACE_DATA.human;
//   const subraceInfo = raceInfo.subraces?.[formData.subrace] || {};

//   const proficiencyBonus = Math.floor((formData.level - 1) / 4) + 2;

//   const getFinalStat = (s: string) =>
//     (formData.stats?.[s] || 10) + (raceInfo.bonuses?.[s] || 0) + (subraceInfo.bonuses?.[s] || 0);

//   const getModifier = (v: number) => { const m = Math.floor((v - 10) / 2); return m >= 0 ? `+${m}` : m; };
//   const getModValue  = (s: string) => Math.floor((getFinalStat(s) - 10) / 2);

//   const hp = classInfo.hitDie + (formData.level - 1) * (classInfo.hitDie / 2 + 1) + formData.level * getModValue('con');
//   const initiative = getModValue('dex');
//   const speed  = subraceInfo.speed || raceInfo.speed || 30;
//   const hitDie = `${formData.level}d${classInfo.hitDie}`;

//   let baseAC = 10, dexBonus = getModValue('dex');
//   const equipment = classInfo.equipment || [];
//   if (equipment.includes('Chain Mail'))      { baseAC = 16; dexBonus = 0; }
//   else if (equipment.includes('Scale Mail')) { baseAC = 14; dexBonus = Math.min(2, dexBonus); }
//   else if (equipment.includes('Leather Armor')) { baseAC = 11; }
//   let ac = baseAC + dexBonus;
//   if (equipment.includes('Shield') || equipment.includes('Wooden Shield')) ac += 2;

//   const passivePerception = 10 + getModValue('wis') + ((formData.skills || []).includes('perception') ? proficiencyBonus : 0);

//   const spellcasting  = classInfo.spellcasting;
//   const isSpellcaster = !!spellcasting && formData.level >= (spellcasting.levelAvailable || 1);
//   const racialCantrips = [...(raceInfo.cantrips || []), ...(subraceInfo.cantrips || [])];

//   const racialTraits = TRAIT_DATA.races[formData.race] || [];
//   const classTraits  = TRAIT_DATA.classes[formData.class] || [];
//   const allTraits    = [...new Set([...racialTraits, ...classTraits, ...(formData.traits || [])])];
//   const allFeats     = formData.feats || [];

//   const spellAbility     = spellcasting?.ability || 'int';
//   const spellSaveDC      = isSpellcaster ? 8 + proficiencyBonus + getModValue(spellAbility) : 0;
//   const spellAttackBonus = isSpellcaster ? proficiencyBonus + getModValue(spellAbility) : 0;

//   const getSpellSlots = (lvl: number, isPact: boolean) => {
//     if (isPact) {
//       if (lvl < 2) return { 1: 1 }; if (lvl < 3) return { 1: 2 };
//       if (lvl < 5) return { 2: 2 }; if (lvl < 7) return { 3: 2 };
//       if (lvl < 9) return { 4: 2 }; return { 5: 2 };
//     }
//     const s: Record<number,number> = {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
//     if (lvl>=1) s[1]=lvl===1?2:lvl===2?3:4; if (lvl>=3) s[2]=lvl===3?2:3;
//     if (lvl>=5) s[3]=lvl===5?2:3;           if (lvl>=7) s[4]=lvl===7?1:lvl===8?2:3;
//     if (lvl>=9) s[5]=lvl===9?1:lvl===10?2:3;
//     return s;
//   };
//   const slots = isSpellcaster ? getSpellSlots(formData.level, spellcasting.isPactMagic) : {};

//   const SKILL_LIST = [
//     { id:'athletics','stat':'str'},{id:'acrobatics','stat':'dex'},{id:'sleight-of-hand','stat':'dex'},
//     {id:'stealth','stat':'dex'},{id:'arcana','stat':'int'},{id:'history','stat':'int'},
//     {id:'investigation','stat':'int'},{id:'nature','stat':'int'},{id:'religion','stat':'int'},
//     {id:'animal-handling','stat':'wis'},{id:'insight','stat':'wis'},{id:'medicine','stat':'wis'},
//     {id:'perception','stat':'wis'},{id:'survival','stat':'wis'},{id:'deception','stat':'cha'},
//     {id:'intimidation','stat':'cha'},{id:'performance','stat':'cha'},{id:'persuasion','stat':'cha'},
//   ];

//   const combinedGear = [...(classInfo.equipment || []), ...(formData.inventory || [])];
//   const finalGear = combinedGear.filter(item => !(formData.removedEquipment || []).includes(item));
//   const weapons = finalGear.map((item: string) => {
//     const clean = item.replace(/^(Two|Four|Five|Ten)\s+/i, '').replace(/s$/, '');
//     return { original: item, details: WEAPON_DETAILS[clean] || WEAPON_DETAILS[item] };
//   }).filter((w: any) => w.details);

//   const handleSaveCharacter = async () => {
//     if (!app) { new Notice('⚠️ No app context available'); return; }
//     setIsSaving(true);
//     const data = formContext ? formContext.getValues() : formData;
//     try {
//       const chars = await loadCharacters(app);
//       const charId = data.id || Date.now();
//       const charToSave = { ...data, id: charId, savedAt: new Date().toISOString() };
//       const idx = chars.findIndex((c: any) => c.id === charId);
//       const updated = idx !== -1
//         ? chars.map((c: any, i: number) => i === idx ? charToSave : c)
//         : [...chars, charToSave];
//       if (idx === -1 && formContext) formContext.setValue('id', charId);
//       await saveCharacters(app, updated);
//       new Notice(data.id ? `✅ ${data.name} updated!` : `✅ ${data.name} saved to library!`);
//       setTimeout(() => modal?.close(), 1000);
//     } catch {
//       new Notice('❌ Failed to save character');
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleAddItem = () => {
//     if (!newItemName.trim() || !formContext) return;
//     formContext.setValue('inventory', [...(formData.inventory || []), newItemName.trim()]);
//     setNewItemName('');
//   };

//   const handleRemoveEveryItem = (item: string) => {
//     if (!formContext) return;
//     if ((formData.inventory || []).includes(item)) {
//       formContext.setValue('inventory', formData.inventory.filter((i: string) => i !== item));
//     } else {
//       formContext.setValue('removedEquipment', [...(formData.removedEquipment || []), item]);
//     }
//   };

//   const generatePythonScript = () => {
//     const script = `class Character:\n    def __init__(self, data):\n        self.name = data['name']\n        self.level = data['level']\n        self.race = data['race']\n        self.char_class = data['class']\n\nchar_data = ${JSON.stringify(formData, null, 4)}\nmy_hero = Character(char_data)\nprint(f"Adventure awaits for {my_hero.name}!")\n`;
//     const blob = new Blob([script], { type: 'text/plain' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url; a.download = `${formData.name || 'character'}.py`; a.click();
//     URL.revokeObjectURL(url);
//   };

//   const SpellDetailCard = ({ spell, isRacial }: { spell: any; isRacial?: boolean }) => {
//     const isExpanded = expandedSpell === spell.id;
//     return (
//       <Card className="border-2 border-primary/10 hover:border-primary/30 transition-all overflow-hidden">
//         <div className="p-3 cursor-pointer flex justify-between items-center bg-secondary/20"
//           onClick={() => setExpandedSpell(isExpanded ? null : spell.id)}>
//           <div className="flex items-center gap-2">
//             <span className="font-bold text-sm">{spell.name}</span>
//             {isRacial && <Badge variant="secondary" className="text-[8px] h-4 uppercase">Racial</Badge>}
//             <Badge variant="outline" className="text-[8px] py-0 px-1 uppercase opacity-60 font-mono">{spell.school}</Badge>
//           </div>
//           <Button variant="ghost" size="icon" className="h-6 w-6">
//             <Info className={`w-3 h-3 transition-transform ${isExpanded ? 'scale-125 text-primary' : ''}`} />
//           </Button>
//         </div>
//         {isExpanded && (
//           <CardContent className="p-3 text-xs text-muted-foreground bg-background leading-relaxed">
//             {spell.description}
//           </CardContent>
//         )}
//       </Card>
//     );
//   };

//   return (
//     <div className="space-y-6 pb-12">
//       {/* Character Header */}
//       <div className="flex flex-col items-center text-center pb-6">
//         <div className="w-32 h-32 bg-primary/10 rounded-3xl flex items-center justify-center mb-4 relative overflow-hidden border-4 border-primary/10 shadow-xl">
//           {formData.image ? (
//             <div className="w-full h-full" style={{
//               backgroundImage: `url(${formData.image})`,
//               backgroundPosition: `${formData.imageX||50}% ${formData.imageY||50}%`,
//               backgroundSize: `${formData.imageScale||100}%`,
//               backgroundRepeat: 'no-repeat'
//             }} />
//           ) : <User className="w-16 h-16 text-primary" />}
//           <div className="absolute bottom-2 right-2 bg-primary text-white text-xs font-black px-3 py-1 rounded-full border-2 border-background shadow-lg">
//             LVL {formData.level}
//           </div>
//         </div>
//         <h2 className="text-4xl font-black uppercase tracking-tight text-primary">{formData.name || 'Unnamed Adventurer'}</h2>
//         <div className="flex items-center gap-2 mt-1">
//           <Badge variant="secondary" className="uppercase font-black tracking-widest px-3 py-1">
//             {formData.race} {formData.subrace && `(${formData.subrace.replace(/-/g,' ')})`}
//           </Badge>
//           <Badge className="uppercase font-black tracking-widest px-3 py-1">
//             {formData.class} {formData.subclass && `- ${formData.subclass.replace(/-/g,' ')}`}
//           </Badge>
//         </div>
//       </div>

//       <Tabs defaultValue="overview" className="w-full">
//         <TabsList className="grid w-full grid-cols-5 mb-6 bg-secondary/30 p-1 rounded-xl">
//           {[
//             { v:'overview', icon:<Shield className="w-3.5 h-3.5 mr-2"/>,  label:'Combat'  },
//             { v:'spells',   icon:<Sparkles className="w-3.5 h-3.5 mr-2"/>, label:'Spells'  },
//             { v:'skills',   icon:<Target className="w-3.5 h-3.5 mr-2"/>,  label:'Skills'  },
//             { v:'traits',   icon:<ScrollText className="w-3.5 h-3.5 mr-2"/>, label:'Traits'},
//             { v:'inventory',icon:<Backpack className="w-3.5 h-3.5 mr-2"/>, label:'Gear'   },
//           ].map(t => (
//             <TabsTrigger key={t.v} value={t.v} className="rounded-lg font-bold uppercase text-xs tracking-wider">
//               {t.icon}{t.label}
//             </TabsTrigger>
//           ))}
//         </TabsList>

//         {/* Combat Tab */}
//         <TabsContent value="overview" className="space-y-5">
//           <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
//             {[
//               { icon:<Heart className="w-5 h-5 mx-auto mb-1 text-red-500"/>,     label:'HP',    value:hp,            color:'red'    },
//               { icon:<Shield className="w-5 h-5 mx-auto mb-1 text-blue-500"/>,   label:'AC',    value:ac,            color:'blue'   },
//               { icon:<Dices className="w-5 h-5 mx-auto mb-1 text-purple-500"/>,  label:'Hit Die', value:hitDie,      color:'purple' },
//               { icon:<Zap className="w-5 h-5 mx-auto mb-1 text-yellow-500"/>,    label:'Init',  value:initiative>=0?`+${initiative}`:initiative, color:'yellow' },
//               { icon:<Footprints className="w-5 h-5 mx-auto mb-1 text-emerald-500"/>, label:'Speed', value:`${speed}ft`, color:'emerald' },
//               { icon:<Coins className="w-5 h-5 mx-auto mb-1 text-amber-500"/>,   label:'Gold',  value:formData.money?.gp||0, color:'amber' },
//             ].map(s => (
//               <div key={s.label} className={`bg-${s.color}-50 dark:bg-${s.color}-950/20 p-4 rounded-2xl text-center border-2 border-${s.color}-100 dark:border-${s.color}-900/30`}>
//                 {s.icon}
//                 <div className={`text-[10px] uppercase font-bold text-${s.color}-500/60 tracking-wider`}>{s.label}</div>
//                 <div className="text-3xl font-black">{s.value}</div>
//               </div>
//             ))}
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <Card className="border-2">
//               <CardContent className="p-4 space-y-4">
//                 <h3 className="font-black flex items-center gap-2 text-sm uppercase tracking-widest text-primary">
//                   <BarChart className="w-4 h-4" /> Ability Scores
//                 </h3>
//                 <div className="grid grid-cols-3 gap-2">
//                   {['str','dex','con','int','wis','cha'].map(stat => {
//                     const total = getFinalStat(stat);
//                     const isProf = classInfo.saves.includes(stat);
//                     const saveMod = getModValue(stat) + (isProf ? proficiencyBonus : 0);
//                     return (
//                       <div key={stat} className="bg-secondary/10 p-3 rounded-xl text-center border-2 border-transparent hover:border-primary/20 transition-all">
//                         <div className="text-[10px] uppercase font-bold text-muted-foreground">{stat}</div>
//                         <div className="text-2xl font-black leading-none my-1">{total}</div>
//                         <div className="text-xs font-bold text-primary mb-2">{getModifier(total)}</div>
//                         <div className={`text-[9px] py-1 rounded-md uppercase font-black tracking-tighter ${isProf ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
//                           Save: {saveMod>=0?`+${saveMod}`:saveMod}
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </CardContent>
//             </Card>

//             <Card className="border-2">
//               <CardContent className="p-4 space-y-4">
//                 <h3 className="font-black flex items-center gap-2 text-sm uppercase tracking-widest text-primary">
//                   <Sword className="w-4 h-4" /> Primary Attacks
//                 </h3>
//                 <div className="space-y-2">
//                   {weapons.length > 0 ? weapons.map((w: any, idx: number) => {
//                     const hitBonus = getModValue(w.details.stat) + proficiencyBonus;
//                     const dmgMod   = getModValue(w.details.stat);
//                     return (
//                       <div key={idx} className="flex justify-between items-center p-3 border-2 rounded-xl bg-secondary/5">
//                         <div>
//                           <div className="text-sm font-black uppercase">{w.original}</div>
//                           <div className="flex gap-1">
//                             {w.details.properties?.map((p: string) => (
//                               <Badge key={p} variant="outline" className="text-[7px] py-0 px-1 uppercase">{p}</Badge>
//                             ))}
//                           </div>
//                         </div>
//                         <div className="text-right">
//                           <div className="text-3xl font-black text-primary">+{hitBonus}</div>
//                           <div className="text-sm font-bold text-muted-foreground uppercase">{w.details.damage}{dmgMod!==0&&(dmgMod>0?`+${dmgMod}`:dmgMod)} {w.details.type}</div>
//                         </div>
//                       </div>
//                     );
//                   }) : (
//                     <div className="text-center py-6 text-xs text-muted-foreground italic border-2 border-dashed rounded-xl">No weapons detected</div>
//                   )}
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </TabsContent>

//         {/* Spells Tab */}
//         <TabsContent value="spells" className="space-y-6">
//           {(!isSpellcaster && racialCantrips.length === 0) ? (
//             <Card className="border-dashed border-2 py-12 text-center">
//               <Wand2 className="w-12 h-12 mx-auto text-muted-foreground/20 mb-4" />
//               <h3 className="text-xl font-black uppercase tracking-tight text-muted-foreground">No Magic Available</h3>
//             </Card>
//           ) : (
//             <div className="space-y-6">
//               {isSpellcaster && (
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//                   {[
//                     { label:'Save DC',    value:spellSaveDC         },
//                     { label:'Attack',     value:`+${spellAttackBonus}` },
//                     { label:'Ability',    value:spellAbility.toUpperCase() },
//                     { label:'1st Slots',  value:slots[1]||0          },
//                   ].map(s => (
//                     <div key={s.label} className="bg-primary/5 p-3 rounded-xl text-center border-2 border-primary/10">
//                       <div className="text-[10px] uppercase font-bold text-primary/60">{s.label}</div>
//                       <div className="text-2xl font-black text-primary">{s.value}</div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//               <div className="space-y-2">
//                 <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
//                   <Sparkles className="w-3.5 h-3.5" /> Cantrips
//                 </h4>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
//                   {[...new Set([...racialCantrips, ...(formData.cantrips||[])])].map((id: string) => {
//                     const s = SPELL_DATA.cantrips.find((x:any) => x.id === id);
//                     if (!s) return null;
//                     return <SpellDetailCard key={id} spell={s} isRacial={racialCantrips.includes(id)} />;
//                   })}
//                 </div>
//               </div>
//               <div className="space-y-2">
//                 <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
//                   <Book className="w-3.5 h-3.5" /> Spells
//                 </h4>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
//                   {(formData.spells||[]).map((id: string) => {
//                     const allS = [...SPELL_DATA.level1,...(SPELL_DATA.level2||[]),...(SPELL_DATA.level3||[]),...(SPELL_DATA.level4||[]),...(SPELL_DATA.level5||[])];
//                     const s = allS.find((x:any) => x.id === id);
//                     if (!s) return null;
//                     return <SpellDetailCard key={id} spell={s} />;
//                   })}
//                 </div>
//               </div>
//             </div>
//           )}
//         </TabsContent>

//         {/* Skills Tab */}
//         <TabsContent value="skills" className="space-y-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <Card className="border-2">
//               <CardContent className="p-4 space-y-4">
//                 <h3 className="font-black flex items-center gap-2 text-sm uppercase tracking-widest text-primary">
//                   <Target className="w-4 h-4" /> Skill Proficiencies
//                 </h3>
//                 <div className="space-y-1">
//                   {SKILL_LIST.map(skill => {
//                     const isProf = formData.skills?.includes(skill.id);
//                     const mod = getModValue(skill.stat) + (isProf ? proficiencyBonus : 0);
//                     return (
//                       <div key={skill.id} className={`flex justify-between items-center text-[12px] p-2 rounded-lg ${isProf?'bg-primary/10 border-primary/20 border-2':'hover:bg-secondary/20'}`}>
//                         <div className="flex items-center gap-2">
//                           <div className={`w-2 h-2 rounded-full ${isProf?'bg-primary':'bg-muted'}`} />
//                           <span className={`capitalize ${isProf?'font-black':'text-muted-foreground font-medium'}`}>{skill.id.replace(/-/g,' ')}</span>
//                           <span className="text-[9px] uppercase opacity-40 font-black">({skill.stat})</span>
//                         </div>
//                         <span className={`font-mono font-black ${isProf?'text-primary':'text-muted-foreground'}`}>{mod>=0?`+${mod}`:mod}</span>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </CardContent>
//             </Card>

//             <div className="space-y-6">
//               <Card className="border-2 bg-secondary/5">
//                 <CardContent className="p-4 space-y-4">
//                   <h3 className="font-black flex items-center gap-2 text-sm uppercase tracking-widest text-primary">
//                     <Brain className="w-4 h-4" /> Senses & Bonus
//                   </h3>
//                   <div className="grid grid-cols-1 gap-3">
//                     <div className="flex justify-between items-center bg-background p-3 rounded-xl border-2">
//                       <div className="text-[10px] font-black uppercase text-muted-foreground">Proficiency Bonus</div>
//                       <div className="text-xl font-black text-primary">+{proficiencyBonus}</div>
//                     </div>
//                     <div className="flex justify-between items-center bg-background p-3 rounded-xl border-2">
//                       <div className="text-[10px] font-black uppercase text-muted-foreground">Passive Perception</div>
//                       <div className="text-xl font-black">{passivePerception}</div>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>
//           </div>
//         </TabsContent>

//         {/* Traits Tab */}
//         <TabsContent value="traits" className="space-y-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <Card className="border-2">
//               <CardContent className="p-4 space-y-4">
//                 <h3 className="font-black flex items-center gap-2 text-sm uppercase tracking-widest text-primary">
//                   <ScrollText className="w-4 h-4" /> Racial & Class Traits
//                 </h3>
//                 <div className="space-y-3">
//                   {allTraits.map((trait: string, idx: number) => (
//                     <div key={idx} className="flex items-start gap-3 bg-secondary/10 p-3 rounded-xl border-2">
//                       <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
//                       <div>
//                         <div className="text-sm font-black uppercase">{trait}</div>
//                         <div className="text-xs text-muted-foreground mt-1">Source: {racialTraits.includes(trait)?'Race':'Class'}</div>
//                       </div>
//                     </div>
//                   ))}
//                   {allTraits.length === 0 && <div className="text-center py-10 text-muted-foreground italic border-2 border-dashed rounded-xl">No traits found</div>}
//                 </div>
//               </CardContent>
//             </Card>

//             <Card className="border-2">
//               <CardContent className="p-4 space-y-4">
//                 <h3 className="font-black flex items-center gap-2 text-sm uppercase tracking-widest text-primary">
//                   <Plus className="w-4 h-4" /> Feats & Special
//                 </h3>
//                 <div className="space-y-3">
//                   {allFeats.map((feat: string, idx: number) => (
//                     <div key={idx} className="flex items-start gap-3 bg-primary/5 p-3 rounded-xl border-2 border-primary/20">
//                       <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
//                       <div className="text-sm font-black uppercase">{feat}</div>
//                     </div>
//                   ))}
//                   {allFeats.length === 0 && <div className="text-center py-10 text-muted-foreground italic border-2 border-dashed rounded-xl">No feats taken</div>}
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </TabsContent>

//         {/* Inventory Tab */}
//         <TabsContent value="inventory" className="space-y-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <Card className="border-2">
//               <CardContent className="p-4 space-y-4">
//                 <div className="flex justify-between items-center">
//                   <h3 className="font-black flex items-center gap-2 text-sm uppercase tracking-widest text-primary">
//                     <Backpack className="w-4 h-4" /> Inventory
//                   </h3>
//                   <Button variant="ghost" size="sm" onClick={() => setIsEditingGear(!isEditingGear)} className="h-8 gap-2 text-[10px] uppercase font-bold">
//                     {isEditingGear ? <Check className="w-3 h-3" /> : <Edit2 className="w-3 h-3" />}
//                     {isEditingGear ? 'Done' : 'Edit'}
//                   </Button>
//                 </div>
//                 {isEditingGear && (
//                   <div className="flex gap-2">
//                     <Input placeholder="Add new item..." value={newItemName}
//                       onChange={e => setNewItemName(e.target.value)}
//                       onKeyDown={e => e.key==='Enter' && handleAddItem()}
//                       className="h-9 text-xs" />
//                     <Button size="icon" className="h-9 w-9 shrink-0" onClick={handleAddItem}>
//                       <Plus className="w-4 h-4" />
//                     </Button>
//                   </div>
//                 )}
//                 <div className="space-y-2">
//                   {finalGear.map((item: string, idx: number) => {
//                     const clean = item.replace(/^(Two|Four|Five|Ten)\s+/i,'').replace(/s$/,'');
//                     const details = EQUIPMENT_DATA[clean] || EQUIPMENT_DATA[item];
//                     return (
//                       <div key={idx} className="flex justify-between items-center p-3 border-2 rounded-xl bg-secondary/5">
//                         <div>
//                           <div className="text-xs font-black uppercase">{item}</div>
//                           {details && <div className="text-[9px] text-muted-foreground">{details.weight} • {details.cost}</div>}
//                         </div>
//                         <div className="flex items-center gap-1">
//                           {isEditingGear && (
//                             <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleRemoveEveryItem(item)}>
//                               <Trash2 className="w-3 h-3" />
//                             </Button>
//                           )}
//                           {details && (
//                             <Popover>
//                               <PopoverTrigger asChild>
//                                 <Button variant="ghost" size="icon" className="h-6 w-6">
//                                   <Info className="w-3 h-3 text-primary" />
//                                 </Button>
//                               </PopoverTrigger>
//                               <PopoverContent className="w-64 p-3 text-xs">
//                                 <div className="font-black uppercase mb-1 border-b pb-1 text-primary">{item}</div>
//                                 <p className="leading-relaxed">{details.properties}</p>
//                               </PopoverContent>
//                             </Popover>
//                           )}
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </CardContent>
//             </Card>

//             <Card className="border-2">
//               <CardContent className="p-4 space-y-4">
//                 <div className="flex justify-between items-center">
//                   <h3 className="font-black flex items-center gap-2 text-sm uppercase tracking-widest text-primary">
//                     <Coins className="w-4 h-4" /> Currency
//                   </h3>
//                   <Button variant="ghost" size="sm" onClick={() => setIsEditingMoney(!isEditingMoney)} className="h-8 gap-2 text-[10px] uppercase font-bold">
//                     {isEditingMoney ? <Check className="w-3 h-3" /> : <Edit2 className="w-3 h-3" />}
//                     {isEditingMoney ? 'Done' : 'Edit'}
//                   </Button>
//                 </div>
//                 <div className="grid grid-cols-5 gap-2">
//                   {[
//                     {id:'cp',name:'CP',color:'text-orange-600',bg:'bg-orange-50'},
//                     {id:'sp',name:'SP',color:'text-slate-400', bg:'bg-slate-50'},
//                     {id:'ep',name:'EP',color:'text-emerald-600',bg:'bg-emerald-50'},
//                     {id:'gp',name:'GP',color:'text-amber-500', bg:'bg-amber-50'},
//                     {id:'pp',name:'PP',color:'text-purple-600',bg:'bg-purple-50'},
//                   ].map(coin => (
//                     <div key={coin.id} className={`${coin.bg} p-3 rounded-xl text-center border-2`}>
//                       <div className={`text-[9px] font-black ${coin.color}`}>{coin.name}</div>
//                       {isEditingMoney && formContext ? (
//                         <Input type="number" className="h-8 mt-1 p-0 text-center text-xs font-black border-none bg-transparent"
//                           {...formContext.register(`money.${coin.id}`, { valueAsNumber: true })} />
//                       ) : (
//                         <div className="text-sm font-black mt-1">{formData.money?.[coin.id]||0}</div>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </TabsContent>
//       </Tabs>

//       {/* Action Buttons */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
//         <Button onClick={handleSaveCharacter} className="h-16 gap-3 rounded-2xl" disabled={isSaving}>
//           {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
//           <div className="text-left">
//             <div className="font-black uppercase text-sm">{isSaving ? 'Saving...' : 'Save Character'}</div>
//             <div className="text-[10px] opacity-80">Save to vault as JSON</div>
//           </div>
//         </Button>
//         <Button onClick={generatePythonScript} variant="outline" className="h-16 gap-3 border-2 rounded-2xl">
//           <FileCode className="w-6 h-6 text-blue-500" />
//           <div className="text-left">
//             <div className="font-black uppercase text-sm">Export Code</div>
//             <div className="text-[10px] text-muted-foreground">Download .py character file</div>
//           </div>
//         </Button>
//       </div>
//     </div>
//   );
// }
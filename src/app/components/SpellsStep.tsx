import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Sparkles, Book, AlertCircle, Info, ChevronUp, BookOpen, Check } from 'lucide-react';
import { CLASS_DATA, SPELL_DATA, RACE_DATA } from '../utils/dnd-data';

export function SpellsStep() {
  const { watch, setValue } = useFormContext();
  const formData = watch();
  const [expandedSpell, setExpandedSpell] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'selection' | 'index'>('selection');

  const classInfo    = CLASS_DATA[formData.class];
  const spellcasting = classInfo?.spellcasting;
  const isSpellcaster = !!spellcasting && formData.level >= (spellcasting.levelAvailable || 1);

  const raceInfo      = RACE_DATA[formData.race] || {};
  const subraceInfo   = raceInfo.subraces?.[formData.subrace] || {};
  const racialCantrips = [...(raceInfo.cantrips || []), ...(subraceInfo.cantrips || [])];

  if (!isSpellcaster && racialCantrips.length === 0) {
    return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'3rem', textAlign:'center', gap:'1rem' }}>
        <div style={{ width:'4rem', height:'4rem', borderRadius:'50%', background:'var(--background-secondary)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <AlertCircle style={{ width:'2rem', height:'2rem', color:'var(--text-muted)' }} />
        </div>
        <div>
          <div style={{ fontSize:'1.125rem', fontWeight:700, marginBottom:'0.375rem' }}>No Spells Available</div>
          <div style={{ color:'var(--text-muted)', fontSize:'0.875rem' }}>
            Neither your race nor your {formData.class} class provides spellcasting at level {formData.level}.
          </div>
        </div>
      </div>
    );
  }

  const getFinalStat = (s: string) => {
    const base     = formData.stats?.[s] || 10;
    const bonus    = raceInfo.bonuses?.[s] || 0;
    const subBonus = subraceInfo.bonuses?.[s] || 0;
    return base + bonus + subBonus;
  };
  const getModValue = (s: string) => Math.floor((getFinalStat(s) - 10) / 2);

  const spellAbility     = spellcasting?.ability || 'int';
  const spellMod         = getModValue(spellAbility);
  const proficiencyBonus = Math.floor((formData.level - 1) / 4) + 2;
  const spellSaveDC      = 8 + proficiencyBonus + spellMod;
  const spellAttackBonus = proficiencyBonus + spellMod;

  const getSpellSlots = (lvl: number, isPact: boolean) => {
    if (isPact) {
      if (lvl < 3) return { 1: 2 }; if (lvl < 5) return { 2: 2 };
      if (lvl < 7) return { 3: 2 }; if (lvl < 9) return { 4: 2 };
      if (lvl < 11) return { 5: 2 }; if (lvl < 17) return { 5: 3 };
      return { 5: 4 };
    }
    const s: Record<number,number> = {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
    if (lvl>=1) s[1]=lvl===1?2:lvl===2?3:4; if (lvl>=3) s[2]=lvl===3?2:3;
    if (lvl>=5) s[3]=lvl===5?2:3;           if (lvl>=7) s[4]=lvl===7?1:lvl===8?2:3;
    if (lvl>=9) s[5]=lvl===9?1:lvl===10?2:3;
    if (lvl>=11) s[6]=lvl>=19?2:1; if (lvl>=13) s[7]=lvl>=20?2:1;
    if (lvl>=15) s[8]=1;           if (lvl>=17) s[9]=1;
    return s;
  };
  const slots = isSpellcaster ? getSpellSlots(formData.level, spellcasting.isPactMagic) : {};

  // Cantrip/spell limits
  let currentCantripLimit = 0, currentSpellLimit = 0;
  if (isSpellcaster) {
    const base = spellcasting.cantrips || 0;
    currentCantripLimit = base;
    if (base > 0) {
      if (formData.level >= 4)  currentCantripLimit++;
      if (formData.level >= 10) currentCantripLimit++;
    }
    if (typeof spellcasting.spells === 'number') {
      if (formData.class === 'bard') {
        const t = [0,4,5,6,7,8,9,10,11,12,14,15,15,16,18,19,19,20,22,22,22];
        currentSpellLimit = t[formData.level] || 4;
      } else if (formData.class === 'sorcerer') {
        const t = [0,2,3,4,5,6,7,8,9,10,11,12,12,13,13,14,14,15,15,15,15];
        currentSpellLimit = t[formData.level] || 2;
      } else if (formData.class === 'warlock') {
        const t = [0,2,3,4,5,6,7,8,9,10,11,12,12,13,13,14,14,15,15,15,15];
        currentSpellLimit = t[formData.level] || 2;
      } else if (formData.class === 'ranger') {
        const t = [0,0,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11];
        currentSpellLimit = t[formData.level] || 2;
      } else {
        currentSpellLimit = spellcasting.spells;
      }
    } else if (spellcasting.spells === 'wis-mod-plus-level') {
      currentSpellLimit = Math.max(1, getModValue('wis') + formData.level);
    } else if (spellcasting.spells === 'cha-mod-plus-half-level') {
      currentSpellLimit = Math.max(1, getModValue('cha') + Math.floor(formData.level / 2));
    } else if (spellcasting.spells === 'int-mod-plus-level') {
      currentSpellLimit = Math.max(1, getModValue('int') + formData.level);
    }
  }

  const toggleCantrip = (id: string) => {
    if (racialCantrips.includes(id)) return;
    const cur = formData.cantrips || [];
    if (cur.includes(id)) setValue('cantrips', cur.filter((c: string) => c !== id));
    else if (cur.length < currentCantripLimit) setValue('cantrips', [...cur, id]);
  };

  const toggleSpell = (id: string) => {
    const cur = formData.spells || [];
    if (cur.includes(id)) setValue('spells', cur.filter((s: string) => s !== id));
    else if (cur.length < currentSpellLimit) setValue('spells', [...cur, id]);
  };

  const filteredByLevel = (key: string) =>
    ((SPELL_DATA as any)[key] || []).filter((s: any) => s.classes.includes(formData.class));

  const filteredCantrips = SPELL_DATA.cantrips.filter((c: any) =>
    c.classes.includes(formData.class) || racialCantrips.includes(c.id)
  );

  // ── Spell card ──
  const SpellCard = ({ spell, isCantrip }: { spell: any; isCantrip: boolean }) => {
    const isSelected = (isCantrip ? (formData.cantrips || []) : (formData.spells || [])).includes(spell.id)
      || (isCantrip && racialCantrips.includes(spell.id));
    const isRacial   = isCantrip && racialCantrips.includes(spell.id);
    const isExpanded = expandedSpell === spell.id;

    return (
      <div
        role={isRacial ? undefined : 'button'}
        onClick={() => !isRacial && (isCantrip ? toggleCantrip(spell.id) : toggleSpell(spell.id))}
        style={{
          border: `2px solid ${isSelected ? 'var(--interactive-accent)' : 'var(--background-modifier-border)'}`,
          borderRadius: '0.5rem', overflow: 'hidden',
          background: isSelected ? 'var(--background-modifier-form-field)' : 'var(--background-primary)',
          cursor: isRacial ? 'default' : 'pointer',
          transition: 'border-color 0.15s',
        }}
      >
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'0.625rem 0.75rem', gap:'0.5rem' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.375rem', flexWrap:'wrap' }}>
              <span style={{ fontWeight:700, fontSize:'0.8rem' }}>{spell.name}</span>
              {isRacial && (
                <span style={{ fontSize:'0.55rem', background:'var(--background-modifier-border)', padding:'1px 4px', borderRadius:'3px', textTransform:'uppercase', fontWeight:700 }}>Race</span>
              )}
              {isSelected && !isRacial && (
                <span style={{ width:'0.875rem', height:'0.875rem', borderRadius:'50%', background:'var(--interactive-accent)', display:'inline-flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Check style={{ width:'0.5rem', height:'0.5rem', color:'#fff' }} />
                </span>
              )}
            </div>
            <div style={{ fontSize:'0.65rem', color:'var(--text-muted)', textTransform:'uppercase', fontFamily:'monospace' }}>{spell.school}</div>
          </div>
          <div
            role="button"
            onClick={e => { e.stopPropagation(); setExpandedSpell(isExpanded ? null : spell.id); }}
            style={{ display:'flex', padding:'0.25rem', borderRadius:'0.25rem', cursor:'pointer', color: isExpanded ? 'var(--interactive-accent)' : 'var(--text-muted)', flexShrink:0 }}
          >
            {isExpanded
              ? <ChevronUp style={{ width:'0.75rem', height:'0.75rem' }} />
              : <Info      style={{ width:'0.75rem', height:'0.75rem' }} />
            }
          </div>
        </div>
        {isExpanded && (
          <div style={{ padding:'0.625rem 0.75rem', fontSize:'0.75rem', color:'var(--text-muted)', lineHeight:1.6, borderTop:'1px solid var(--background-modifier-border)' }}>
            {spell.description}
          </div>
        )}
      </div>
    );
  };

  // ── Section header ──
  const SectionHeader = ({ emoji, label, color, selected, limit }: { emoji: string; label: string; color: string; selected: number; limit: number }) => (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`2px solid var(--background-modifier-border)`, paddingBottom:'0.5rem', marginBottom:'0.75rem' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontWeight:900, fontSize:'1rem', color }}>
        <span>{emoji}</span> {label}
      </div>
      <span style={{
        fontSize:'0.7rem', fontWeight:700, fontFamily:'monospace',
        padding:'0.2rem 0.625rem', borderRadius:'999px',
        border:`1px solid ${selected === limit ? 'var(--interactive-accent)' : 'var(--background-modifier-border)'}`,
        color: selected === limit ? 'var(--interactive-accent)' : 'var(--text-muted)',
      }}>
        {selected} / {limit}
      </span>
    </div>
  );

  const spellLevels = [
    { key:'level2', minLevel:3,  label:'2nd Level', emoji:'📘', color:'#a855f7' },
    { key:'level3', minLevel:5,  label:'3rd Level', emoji:'📗', color:'#6366f1' },
    { key:'level4', minLevel:7,  label:'4th Level', emoji:'📕', color:'#ef4444' },
    { key:'level5', minLevel:9,  label:'5th Level', emoji:'📙', color:'#f97316' },
    { key:'level6', minLevel:11, label:'6th Level', emoji:'📓', color:'#14b8a6' },
    { key:'level7', minLevel:13, label:'7th Level', emoji:'📔', color:'#06b6d4' },
    { key:'level8', minLevel:15, label:'8th Level', emoji:'📒', color:'#f43f5e' },
    { key:'level9', minLevel:17, label:'9th Level', emoji:'⭐', color:'#ca8a04' },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'0', paddingBottom:'3rem' }}>

      {/* ── Native tabs ── */}
      <div style={{ display:'flex', gap:'0.375rem', borderBottom:'2px solid var(--background-modifier-border)', marginBottom:'1.5rem' }}>
        {(['selection', 'index'] as const).map(tab => (
          <div
            key={tab}
            role="button"
            onClick={() => setActiveTab(tab)}
            style={{
              padding:'0.5rem 1rem', cursor:'pointer',
              fontSize:'0.7rem', fontWeight:900, textTransform:'uppercase', letterSpacing:'0.08em',
              borderBottom: activeTab === tab ? '2px solid var(--interactive-accent)' : '2px solid transparent',
              marginBottom: '-2px',
              color: activeTab === tab ? 'var(--interactive-accent)' : 'var(--text-muted)',
              transition: 'color 0.15s',
            }}
          >
            {tab === 'selection' ? '✨ Selection' : '📖 Spell Index'}
          </div>
        ))}
      </div>

      {/* ── SELECTION TAB ── */}
      {activeTab === 'selection' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>

          {/* Spell stats */}
          {isSpellcaster && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.625rem' }}>
              {[
                { label:'Spell Save DC',      value: spellSaveDC                  },
                { label:'Spell Attack Bonus', value: `+${spellAttackBonus}`        },
                { label:'Casting Ability',    value: spellAbility.toUpperCase()   },
              ].map(s => (
                <div key={s.label} style={{ background:'var(--background-secondary)', border:'1px solid var(--background-modifier-border)', borderRadius:'0.625rem', padding:'0.75rem', textAlign:'center' }}>
                  <div style={{ fontSize:'0.6rem', fontWeight:700, textTransform:'uppercase', color:'var(--text-muted)', marginBottom:'0.25rem' }}>{s.label}</div>
                  <div style={{ fontSize:'1.75rem', fontWeight:900, color:'var(--interactive-accent)' }}>{s.value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Spell slots */}
          {isSpellcaster && Object.values(slots).some(v => v > 0) && (
            <div>
              <div style={{ fontSize:'0.65rem', fontWeight:700, textTransform:'uppercase', color:'var(--text-muted)', letterSpacing:'0.08em', marginBottom:'0.5rem' }}>Available Spell Slots</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'0.375rem' }}>
                {Object.entries(slots).map(([lvl, count]) => count > 0 && (
                  <div key={lvl} style={{ background:'var(--background-secondary)', border:'1px solid var(--background-modifier-border)', borderRadius:'0.5rem', padding:'0.5rem 0.75rem', textAlign:'center', minWidth:'3.5rem' }}>
                    <div style={{ fontSize:'0.6rem', fontWeight:700, textTransform:'uppercase', color:'var(--text-muted)' }}>Lvl {lvl}</div>
                    <div style={{ fontSize:'1.25rem', fontWeight:900 }}>{count}</div>
                  </div>
                ))}
                {spellcasting.isPactMagic && (
                  <div style={{ display:'flex', alignItems:'center', padding:'0.375rem 0.75rem', border:'1px solid var(--background-modifier-border)', borderRadius:'0.5rem', fontSize:'0.75rem', fontWeight:700, color:'var(--text-muted)' }}>
                    Pact Magic
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cantrips */}
          {(currentCantripLimit > 0 || racialCantrips.length > 0) && (
            <div>
              <SectionHeader emoji="✨" label="Cantrips" color="#eab308"
                selected={(formData.cantrips || []).length} limit={currentCantripLimit} />
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.5rem' }}>
                {filteredCantrips.map((spell: any) => <SpellCard key={spell.id} spell={spell} isCantrip={true} />)}
              </div>
            </div>
          )}

          {/* Level 1 spells */}
          {currentSpellLimit > 0 && (
            <div>
              <SectionHeader emoji="📘" label="Prepared Spells" color="#3b82f6"
                selected={(formData.spells || []).length} limit={currentSpellLimit} />
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.5rem' }}>
                {filteredByLevel('level1').map((spell: any) => <SpellCard key={spell.id} spell={spell} isCantrip={false} />)}
              </div>
            </div>
          )}

          {/* Higher level spells */}
          {spellLevels.map(({ key, minLevel, label, emoji, color }) => {
            const spells = filteredByLevel(key);
            if (formData.level < minLevel || spells.length === 0) return null;
            return (
              <div key={key}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', borderBottom:'1px solid var(--background-modifier-border)', paddingBottom:'0.5rem', marginBottom:'0.75rem', fontWeight:900, fontSize:'0.9rem', color }}>
                  <span>{emoji}</span> {label} Spells
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.5rem' }}>
                  {spells.map((spell: any) => <SpellCard key={spell.id} spell={spell} isCantrip={false} />)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── INDEX TAB ── */}
      {activeTab === 'index' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
          {['cantrips','level1','level2','level3','level4','level5','level6','level7','level8','level9'].map(level => {
            const spells = (SPELL_DATA as any)[level];
            if (!spells || spells.length === 0) return null;
            return (
              <div key={level}>
                <div style={{ fontSize:'0.65rem', fontWeight:900, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--text-muted)', borderBottom:'1px solid var(--background-modifier-border)', paddingBottom:'0.375rem', marginBottom:'0.5rem' }}>
                  {level === 'cantrips' ? 'Cantrips' : `Level ${level.replace('level', '')}`}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.375rem' }}>
                  {spells.map((s: any) => {
                    const isOpen = expandedSpell === s.id;
                    return (
                      <div key={s.id} style={{ border:'1px solid var(--background-modifier-border)', borderRadius:'0.375rem', overflow:'hidden' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.375rem 0.625rem', background:'var(--background-secondary)' }}>
                          <span style={{ fontSize:'0.75rem', fontWeight:700 }}>{s.name}</span>
                          <div
                            role="button"
                            onClick={() => setExpandedSpell(isOpen ? null : s.id)}
                            style={{ cursor:'pointer', color: isOpen ? 'var(--interactive-accent)' : 'var(--text-muted)', display:'flex', padding:'0.125rem' }}
                          >
                            <Info style={{ width:'0.7rem', height:'0.7rem' }} />
                          </div>
                        </div>
                        {isOpen && (
                          <div style={{ padding:'0.5rem 0.625rem', fontSize:'0.7rem', color:'var(--text-muted)', lineHeight:1.6, borderTop:'1px solid var(--background-modifier-border)' }}>
                            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.375rem' }}>
                              <span style={{ fontWeight:700, textTransform:'uppercase', fontSize:'0.6rem' }}>{s.school}</span>
                            </div>
                            {s.description}
                            <div style={{ display:'flex', flexWrap:'wrap', gap:'0.25rem', marginTop:'0.5rem' }}>
                              {s.classes.map((c: string) => (
                                <span key={c} style={{ fontSize:'0.55rem', textTransform:'uppercase', fontWeight:700, border:'1px solid var(--background-modifier-border)', padding:'1px 4px', borderRadius:'3px', color:'var(--text-muted)' }}>{c}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// import React, { useState } from 'react';
// import { useFormContext } from 'react-hook-form';
// import { Badge } from './ui/badge';
// import { Card, CardContent } from './ui/card';
// import { Sparkles, Book, AlertCircle, Info, ChevronUp, BookOpen } from 'lucide-react';
// import { CLASS_DATA, SPELL_DATA, RACE_DATA } from '../utils/dnd-data';
// import { Button } from './ui/button';
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
// import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

// export function SpellsStep() {
//   const { watch, setValue } = useFormContext();
//   const formData = watch();
//   const [expandedSpell, setExpandedSpell] = useState<string | null>(null);

//   const classInfo = CLASS_DATA[formData.class];
//   const spellcasting = classInfo?.spellcasting;
  
//   const isSpellcaster = !!spellcasting && (formData.level >= (spellcasting.levelAvailable || 1));

//   // Get racial spells
//   const raceInfo = RACE_DATA[formData.race] || {};
//   const subraceInfo = raceInfo.subraces?.[formData.subrace] || {};
//   const racialCantrips = [...(raceInfo.cantrips || []), ...(subraceInfo.cantrips || [])];

//   if (!isSpellcaster && racialCantrips.length === 0) {
//     return (
//       <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
//         <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
//           <AlertCircle className="w-8 h-8 text-muted-foreground" />
//         </div>
//         <div className="space-y-2">
//           <h3 className="text-xl font-bold">No Spells Available</h3>
//           <p className="text-muted-foreground max-w-xs">
//             Neither your race nor your {formData.class} class provides spellcasting at level {formData.level}.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   const getFinalStat = (statName: string) => {
//     const base = formData.stats?.[statName] || 10;
//     const bonus = (raceInfo.bonuses && raceInfo.bonuses[statName]) || 0;
//     const subBonus = (subraceInfo.bonuses && subraceInfo.bonuses[statName]) || 0;
//     return base + bonus + subBonus;
//   };

//   const getModValue = (statName: string) => {
//     return Math.floor((getFinalStat(statName) - 10) / 2);
//   };

//   const spellAbility = spellcasting?.ability || 'int'; 
//   const spellMod = getModValue(spellAbility);
//   const proficiencyBonus = Math.floor((formData.level - 1) / 4) + 2;
//   const spellSaveDC = 8 + proficiencyBonus + spellMod;
//   const spellAttackBonus = proficiencyBonus + spellMod;

//   // Calculate slots
//   const getSpellSlots = (lvl: number, isPactMagic: boolean) => {
//     if (isPactMagic) {
//       if (lvl < 3) return { 1: 2 };
//       if (lvl < 5) return { 2: 2 };
//       if (lvl < 7) return { 3: 2 };
//       if (lvl < 9) return { 4: 2 };
//       if (lvl < 11) return { 5: 2 };
//       if (lvl < 17) return { 5: 3 };
//       return { 5: 4 };
//     }
//     const slots: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
//     if (lvl >= 1) slots[1] = lvl === 1 ? 2 : (lvl === 2 ? 3 : 4);
//     if (lvl >= 3) slots[2] = lvl === 3 ? 2 : 3;
//     if (lvl >= 5) slots[3] = lvl === 5 ? 2 : 3;
//     if (lvl >= 7) slots[4] = lvl === 7 ? 1 : (lvl === 8 ? 2 : 3);
//     if (lvl >= 9) slots[5] = lvl === 9 ? 1 : (lvl === 10 ? 2 : 3);
//     if (lvl >= 11) slots[6] = lvl >= 19 ? 2 : 1;
//     if (lvl >= 13) slots[7] = lvl >= 20 ? 2 : 1;
//     if (lvl >= 15) slots[8] = 1;
//     if (lvl >= 17) slots[9] = 1;
//     return slots;
//   };

//   const slots = isSpellcaster ? getSpellSlots(formData.level, spellcasting.isPactMagic) : {};

//   // Calculate limits
//   let currentCantripLimit = 0;
//   let currentSpellLimit = 0;

//   if (isSpellcaster) {
//     // Basic cantrip scaling
//     const baseCantrips = spellcasting.cantrips || 0;
//     currentCantripLimit = baseCantrips;
//     if (baseCantrips > 0) {
//       if (formData.level >= 4) currentCantripLimit++;
//       if (formData.level >= 10) currentCantripLimit++;
//     }

//     if (typeof spellcasting.spells === 'number') {
//       if (formData.class === 'bard') {
//         const bardSpells = [0, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 18, 19, 19, 20, 22, 22, 22];
//         currentSpellLimit = bardSpells[formData.level] || 4;
//       } else if (formData.class === 'sorcerer') {
//         const sorcSpells = [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15];
//         currentSpellLimit = sorcSpells[formData.level] || 2;
//       } else if (formData.class === 'warlock') {
//         const warlSpells = [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15];
//         currentSpellLimit = warlSpells[formData.level] || 2;
//       } else if (formData.class === 'ranger') {
//         const rangSpells = [0, 0, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11];
//         currentSpellLimit = rangSpells[formData.level] || 2;
//       } else {
//         currentSpellLimit = spellcasting.spells;
//       }
//     } else if (spellcasting.spells === 'wis-mod-plus-level') {
//       currentSpellLimit = Math.max(1, getModValue('wis') + formData.level);
//     } else if (spellcasting.spells === 'cha-mod-plus-half-level') {
//       currentSpellLimit = Math.max(1, getModValue('cha') + Math.floor(formData.level / 2));
//     } else if (spellcasting.spells === 'int-mod-plus-level') {
//       currentSpellLimit = Math.max(1, getModValue('int') + formData.level);
//     }
//   }

//   const toggleCantrip = (id: string) => {
//     if (racialCantrips.includes(id)) return;
//     const currentCantrips = formData.cantrips || [];
//     if (currentCantrips.includes(id)) {
//       setValue('cantrips', currentCantrips.filter((c: string) => c !== id));
//     } else if (currentCantrips.length < currentCantripLimit) {
//       setValue('cantrips', [...currentCantrips, id]);
//     }
//   };

//   const toggleSpell = (id: string) => {
//     const currentSpells = formData.spells || [];
//     if (currentSpells.includes(id)) {
//       setValue('spells', currentSpells.filter((s: string) => s !== id));
//     } else if (currentSpells.length < currentSpellLimit) {
//       setValue('spells', [...currentSpells, id]);
//     }
//   };

//   const filteredCantrips = SPELL_DATA.cantrips.filter((c: any) => c.classes.includes(formData.class) || racialCantrips.includes(c.id));
//   const filteredLevel1 = SPELL_DATA.level1.filter((s: any) => s.classes.includes(formData.class));
//   const filteredLevel2 = (SPELL_DATA.level2 || []).filter((s: any) => s.classes.includes(formData.class));
//   const filteredLevel3 = (SPELL_DATA.level3 || []).filter((s: any) => s.classes.includes(formData.class));
//   const filteredLevel4 = (SPELL_DATA.level4 || []).filter((s: any) => s.classes.includes(formData.class));
//   const filteredLevel5 = (SPELL_DATA.level5 || []).filter((s: any) => s.classes.includes(formData.class));
//   const filteredLevel6 = (SPELL_DATA.level6 || []).filter((s: any) => s.classes.includes(formData.class));
//   const filteredLevel7 = (SPELL_DATA.level7 || []).filter((s: any) => s.classes.includes(formData.class));
//   const filteredLevel8 = (SPELL_DATA.level8 || []).filter((s: any) => s.classes.includes(formData.class));
//   const filteredLevel9 = (SPELL_DATA.level9 || []).filter((s: any) => s.classes.includes(formData.class));

//   const SpellCard = ({ spell, isCantrip }: { spell: any, isCantrip: boolean }) => {
//     const isSelected = (isCantrip ? (formData.cantrips || []) : (formData.spells || [])).includes(spell.id) || (isCantrip && racialCantrips.includes(spell.id));
//     const isRacial = isCantrip && racialCantrips.includes(spell.id);
//     const isExpanded = expandedSpell === spell.id;

//     return (
//       <Card 
//         className={`transition-all border-2 ${isSelected ? 'border-primary bg-primary/5' : 'hover:bg-secondary/50 border-transparent bg-secondary/30'} ${!isRacial ? 'cursor-pointer' : ''}`}
//         onClick={() => !isRacial && (isCantrip ? toggleCantrip(spell.id) : toggleSpell(spell.id))}
//       >
//         <CardContent className="p-3 space-y-2">
//           <div className="flex justify-between items-start gap-2">
//             <div className="flex-1">
//               <div className="flex items-center gap-2">
//                 <div className="font-bold text-sm">{spell.name}</div>
//                 {isRacial && <Badge variant="secondary" className="text-[8px] h-4 uppercase">Race</Badge>}
//               </div>
//               <div className="text-[10px] text-muted-foreground uppercase flex items-center gap-2">
//                 {spell.school}
//                 {isSelected && !isRacial && <Badge className="h-3 w-3 rounded-full p-0 flex items-center justify-center text-[8px]">✓</Badge>}
//               </div>
//             </div>
//             <Button 
//               variant="ghost" 
//               size="icon" 
//               className="h-6 w-6" 
//               onClick={(e) => {
//                 e.stopPropagation();
//                 setExpandedSpell(isExpanded ? null : spell.id);
//               }}
//             >
//               {isExpanded ? <ChevronUp className="w-3 h-3" /> : <Info className="w-3 h-3" />}
//             </Button>
//           </div>
          
//           {isExpanded && (
//             <div className="text-xs text-muted-foreground pt-2 border-t border-primary/10 leading-relaxed animate-in fade-in slide-in-from-top-1">
//               {spell.description}
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     );
//   };

//   return (
//     <div className="space-y-8 pb-12">
//       <Tabs defaultValue="wizard" className="w-full">
//         <TabsList className="grid w-full grid-cols-2 mb-6 bg-secondary/30 p-1 rounded-xl">
//           <TabsTrigger value="wizard" className="rounded-lg font-black uppercase text-[10px] tracking-widest">
//             Selection
//           </TabsTrigger>
//           <TabsTrigger value="index" className="rounded-lg font-black uppercase text-[10px] tracking-widest">
//             Spell Index
//           </TabsTrigger>
//         </TabsList>

//         <TabsContent value="wizard" className="space-y-8 animate-in fade-in duration-300">
//           {isSpellcaster && (
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div className="bg-primary/5 p-4 rounded-xl border-2 border-primary/10 text-center">
//                 <div className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Spell Save DC</div>
//                 <div className="text-3xl font-black text-primary">{spellSaveDC}</div>
//               </div>
//               <div className="bg-primary/5 p-4 rounded-xl border-2 border-primary/10 text-center">
//                 <div className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Spell Attack Bonus</div>
//                 <div className="text-3xl font-black text-primary">+{spellAttackBonus}</div>
//               </div>
//               <div className="bg-primary/5 p-4 rounded-xl border-2 border-primary/10 text-center">
//                 <div className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Casting Ability</div>
//                 <div className="text-3xl font-black text-primary uppercase">{spellAbility}</div>
//               </div>
//             </div>
//           )}

//           {isSpellcaster && Object.values(slots).some(v => v > 0) && (
//             <div className="space-y-3">
//               <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Available Spell Slots</h3>
//               <div className="flex flex-wrap gap-2">
//                 {Object.entries(slots).map(([lvl, count]) => count > 0 && (
//                   <div key={lvl} className="bg-secondary p-3 rounded-lg border flex flex-col items-center min-w-[60px]">
//                     <div className="text-[10px] font-bold text-muted-foreground uppercase">Lvl {lvl}</div>
//                     <div className="text-xl font-black">{count}</div>
//                   </div>
//                 ))}
//                 {spellcasting.isPactMagic && <Badge variant="outline" className="h-fit">Pact Magic</Badge>}
//               </div>
//             </div>
//           )}

//           {(currentCantripLimit > 0 || racialCantrips.length > 0) && (
//             <div className="space-y-4">
//               <div className="flex items-center justify-between border-b-2 border-primary/10 pb-2">
//                 <h3 className="text-lg font-black flex items-center gap-2">
//                   <Sparkles className="w-5 h-5 text-yellow-500" />
//                   CANTRIPS
//                 </h3>
//                 <Badge variant={(formData.cantrips || []).length === currentCantripLimit ? "default" : "outline"} className="font-mono">
//                   {(formData.cantrips || []).length} / {currentCantripLimit} Selected
//                 </Badge>
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
//                 {filteredCantrips.map((spell: any) => (
//                   <SpellCard key={spell.id} spell={spell} isCantrip={true} />
//                 ))}
//               </div>
//             </div>
//           )}

//           {currentSpellLimit > 0 && (
//             <div className="space-y-4">
//               <div className="flex items-center justify-between border-b-2 border-primary/10 pb-2">
//                 <h3 className="text-lg font-black flex items-center gap-2">
//                   <Book className="w-5 h-5 text-blue-500" />
//                   PREPARED SPELLS
//                 </h3>
//                 <Badge variant={(formData.spells || []).length === currentSpellLimit ? "default" : "outline"} className="font-mono">
//                   {(formData.spells || []).length} / {currentSpellLimit} Selected
//                 </Badge>
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
//                 {filteredLevel1.map((spell: any) => (
//                   <SpellCard key={spell.id} spell={spell} isCantrip={false} />
//                 ))}
//               </div>
//             </div>
//           )}

//           {formData.level >= 3 && filteredLevel2.length > 0 && (
//             <div className="space-y-4">
//               <div className="flex items-center justify-between border-b-2 border-primary/10 pb-2">
//                 <h3 className="text-lg font-black flex items-center gap-2 text-purple-500">
//                   <Book className="w-5 h-5" />
//                   2ND LEVEL SPELLS
//                 </h3>
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
//                 {filteredLevel2.map((spell: any) => (
//                   <SpellCard key={spell.id} spell={spell} isCantrip={false} />
//                 ))}
//               </div>
//             </div>
//           )}

//           {formData.level >= 5 && filteredLevel3.length > 0 && (
//             <div className="space-y-4">
//               <div className="flex items-center justify-between border-b-2 border-primary/10 pb-2">
//                 <h3 className="text-lg font-black flex items-center gap-2 text-indigo-500">
//                   <Book className="w-5 h-5" />
//                   3RD LEVEL SPELLS
//                 </h3>
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
//                 {filteredLevel3.map((spell: any) => (
//                   <SpellCard key={spell.id} spell={spell} isCantrip={false} />
//                 ))}
//               </div>
//             </div>
//           )}

//           {formData.level >= 7 && filteredLevel4.length > 0 && (
//             <div className="space-y-4">
//               <div className="flex items-center justify-between border-b-2 border-primary/10 pb-2">
//                 <h3 className="text-lg font-black flex items-center gap-2 text-red-500">
//                   <Book className="w-5 h-5" />
//                   4TH LEVEL SPELLS
//                 </h3>
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
//                 {filteredLevel4.map((spell: any) => (
//                   <SpellCard key={spell.id} spell={spell} isCantrip={false} />
//                 ))}
//               </div>
//             </div>
//           )}

//           {formData.level >= 9 && filteredLevel5.length > 0 && (
//             <div className="space-y-4">
//               <div className="flex items-center justify-between border-b-2 border-primary/10 pb-2">
//                 <h3 className="text-lg font-black flex items-center gap-2 text-orange-500">
//                   <Book className="w-5 h-5" />
//                   5TH LEVEL SPELLS
//                 </h3>
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
//                 {filteredLevel5.map((spell: any) => (
//                   <SpellCard key={spell.id} spell={spell} isCantrip={false} />
//                 ))}
//               </div>
//             </div>
//           )}

//           {formData.level >= 11 && filteredLevel6.length > 0 && (
//             <div className="space-y-4">
//               <div className="flex items-center justify-between border-b-2 border-primary/10 pb-2">
//                 <h3 className="text-lg font-black flex items-center gap-2 text-teal-500">
//                   <Book className="w-5 h-5" />
//                   6TH LEVEL SPELLS
//                 </h3>
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
//                 {filteredLevel6.map((spell: any) => (
//                   <SpellCard key={spell.id} spell={spell} isCantrip={false} />
//                 ))}
//               </div>
//             </div>
//           )}

//           {formData.level >= 13 && filteredLevel7.length > 0 && (
//             <div className="space-y-4">
//               <div className="flex items-center justify-between border-b-2 border-primary/10 pb-2">
//                 <h3 className="text-lg font-black flex items-center gap-2 text-cyan-500">
//                   <Book className="w-5 h-5" />
//                   7TH LEVEL SPELLS
//                 </h3>
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
//                 {filteredLevel7.map((spell: any) => (
//                   <SpellCard key={spell.id} spell={spell} isCantrip={false} />
//                 ))}
//               </div>
//             </div>
//           )}

//           {formData.level >= 15 && filteredLevel8.length > 0 && (
//             <div className="space-y-4">
//               <div className="flex items-center justify-between border-b-2 border-primary/10 pb-2">
//                 <h3 className="text-lg font-black flex items-center gap-2 text-rose-500">
//                   <Book className="w-5 h-5" />
//                   8TH LEVEL SPELLS
//                 </h3>
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
//                 {filteredLevel8.map((spell: any) => (
//                   <SpellCard key={spell.id} spell={spell} isCantrip={false} />
//                 ))}
//               </div>
//             </div>
//           )}

//           {formData.level >= 17 && filteredLevel9.length > 0 && (
//             <div className="space-y-4">
//               <div className="flex items-center justify-between border-b-2 border-primary/10 pb-2">
//                 <h3 className="text-lg font-black flex items-center gap-2 text-yellow-600">
//                   <Book className="w-5 h-5" />
//                   9TH LEVEL SPELLS
//                 </h3>
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
//                 {filteredLevel9.map((spell: any) => (
//                   <SpellCard key={spell.id} spell={spell} isCantrip={false} />
//                 ))}
//               </div>
//             </div>
//           )}
//         </TabsContent>

//         <TabsContent value="index" className="space-y-6 animate-in fade-in duration-300">
//           <div className="bg-secondary/20 p-4 rounded-xl border-2 border-dashed">
//             <h3 className="text-sm font-black uppercase mb-4 flex items-center gap-2">
//               <BookOpen className="w-4 h-4 text-primary" />
//               Full Spell Index
//             </h3>
//             <div className="space-y-6">
//               {['cantrips', 'level1', 'level2', 'level3', 'level4', 'level5', 'level6', 'level7', 'level8', 'level9'].map((level) => {
//                 const spells = SPELL_DATA[level];
//                 if (!spells || spells.length === 0) return null;
//                 return (
//                   <div key={level} className="space-y-2">
//                     <h4 className="text-[10px] font-black uppercase text-muted-foreground border-b pb-1 tracking-widest">
//                       {level === 'cantrips' ? 'Cantrips' : `Level ${level.replace('level', '')}`}
//                     </h4>
//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
//                       {spells.map((s: any) => (
//                         <div key={s.id} className="p-2 rounded bg-background border flex justify-between items-center group hover:border-primary/50 transition-colors">
//                           <span className="text-xs font-bold">{s.name}</span>
//                           <Popover>
//                             <PopoverTrigger asChild>
//                               <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100">
//                                 <Info className="w-3 h-3" />
//                               </Button>
//                             </PopoverTrigger>
//                             <PopoverContent className="w-64 p-3 text-xs leading-relaxed">
//                               <div className="font-bold mb-1 border-b pb-1 flex justify-between">
//                                 {s.name}
//                                 <span className="text-[9px] uppercase opacity-50">{s.school}</span>
//                               </div>
//                               {s.description}
//                             </PopoverContent>
//                           </Popover>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }

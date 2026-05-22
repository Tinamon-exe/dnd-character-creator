import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Notice } from 'obsidian';
import {
  User, Shield, BarChart, ScrollText, Save,
  FileCode, Zap, Heart, Footprints, Target,
  Sword, Backpack, Sparkles, BookOpen, Brain,
  Dices, Loader2, Info, Book, Wand2,
  Coins, Plus, Trash2, Edit2, Check, X, CheckCircle2
} from 'lucide-react';
import { CLASS_DATA, RACE_DATA, WEAPON_DETAILS, SPELL_DATA, EQUIPMENT_DATA, TRAIT_DATA } from '../utils/dnd-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
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
  const [isSaving, setIsSaving] = useState(false);
  const [expandedSpell, setExpandedSpell] = useState<string | null>(null);
  const [isEditingGear, setIsEditingGear] = useState(false);
  const [isEditingMoney, setIsEditingMoney] = useState(false);
  const [newItemName, setNewItemName] = useState('');

  const formData = formContext ? formContext.watch() : initialFormData;

  const classInfo = CLASS_DATA[formData.class] || CLASS_DATA.fighter;
  const raceInfo  = RACE_DATA[formData.race]   || RACE_DATA.human;
  const subraceInfo = raceInfo.subraces?.[formData.subrace] || {};

  const proficiencyBonus = Math.floor((formData.level - 1) / 4) + 2;

  const getFinalStat = (s: string) =>
    (formData.stats?.[s] || 10) + (raceInfo.bonuses?.[s] || 0) + (subraceInfo.bonuses?.[s] || 0);

  const getModifier = (v: number) => { const m = Math.floor((v - 10) / 2); return m >= 0 ? `+${m}` : m; };
  const getModValue  = (s: string) => Math.floor((getFinalStat(s) - 10) / 2);

  const hp = classInfo.hitDie + (formData.level - 1) * (classInfo.hitDie / 2 + 1) + formData.level * getModValue('con');
  const initiative = getModValue('dex');
  const speed  = subraceInfo.speed || raceInfo.speed || 30;
  const hitDie = `${formData.level}d${classInfo.hitDie}`;

  let baseAC = 10, dexBonus = getModValue('dex');
  const equipment = classInfo.equipment || [];
  if (equipment.includes('Chain Mail'))      { baseAC = 16; dexBonus = 0; }
  else if (equipment.includes('Scale Mail')) { baseAC = 14; dexBonus = Math.min(2, dexBonus); }
  else if (equipment.includes('Leather Armor')) { baseAC = 11; }
  let ac = baseAC + dexBonus;
  if (equipment.includes('Shield') || equipment.includes('Wooden Shield')) ac += 2;

  const passivePerception = 10 + getModValue('wis') + ((formData.skills || []).includes('perception') ? proficiencyBonus : 0);

  const spellcasting  = classInfo.spellcasting;
  const isSpellcaster = !!spellcasting && formData.level >= (spellcasting.levelAvailable || 1);
  const racialCantrips = [...(raceInfo.cantrips || []), ...(subraceInfo.cantrips || [])];

  const racialTraits = TRAIT_DATA.races[formData.race] || [];
  const classTraits  = TRAIT_DATA.classes[formData.class] || [];
  const allTraits    = [...new Set([...racialTraits, ...classTraits, ...(formData.traits || [])])];
  const allFeats     = formData.feats || [];

  const spellAbility     = spellcasting?.ability || 'int';
  const spellSaveDC      = isSpellcaster ? 8 + proficiencyBonus + getModValue(spellAbility) : 0;
  const spellAttackBonus = isSpellcaster ? proficiencyBonus + getModValue(spellAbility) : 0;

  const getSpellSlots = (lvl: number, isPact: boolean) => {
    if (isPact) {
      if (lvl < 2) return { 1: 1 }; if (lvl < 3) return { 1: 2 };
      if (lvl < 5) return { 2: 2 }; if (lvl < 7) return { 3: 2 };
      if (lvl < 9) return { 4: 2 }; return { 5: 2 };
    }
    const s: Record<number,number> = {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
    if (lvl>=1) s[1]=lvl===1?2:lvl===2?3:4; if (lvl>=3) s[2]=lvl===3?2:3;
    if (lvl>=5) s[3]=lvl===5?2:3;           if (lvl>=7) s[4]=lvl===7?1:lvl===8?2:3;
    if (lvl>=9) s[5]=lvl===9?1:lvl===10?2:3;
    return s;
  };
  const slots = isSpellcaster ? getSpellSlots(formData.level, spellcasting.isPactMagic) : {};

  const SKILL_LIST = [
    { id:'athletics','stat':'str'},{id:'acrobatics','stat':'dex'},{id:'sleight-of-hand','stat':'dex'},
    {id:'stealth','stat':'dex'},{id:'arcana','stat':'int'},{id:'history','stat':'int'},
    {id:'investigation','stat':'int'},{id:'nature','stat':'int'},{id:'religion','stat':'int'},
    {id:'animal-handling','stat':'wis'},{id:'insight','stat':'wis'},{id:'medicine','stat':'wis'},
    {id:'perception','stat':'wis'},{id:'survival','stat':'wis'},{id:'deception','stat':'cha'},
    {id:'intimidation','stat':'cha'},{id:'performance','stat':'cha'},{id:'persuasion','stat':'cha'},
  ];

  const combinedGear = [...(classInfo.equipment || []), ...(formData.inventory || [])];
  const finalGear = combinedGear.filter(item => !(formData.removedEquipment || []).includes(item));
  const weapons = finalGear.map((item: string) => {
    const clean = item.replace(/^(Two|Four|Five|Ten)\s+/i, '').replace(/s$/, '');
    return { original: item, details: WEAPON_DETAILS[clean] || WEAPON_DETAILS[item] };
  }).filter((w: any) => w.details);

  const handleSaveCharacter = async () => {
    if (!app) { new Notice('⚠️ No app context available'); return; }
    setIsSaving(true);
    const data = formContext ? formContext.getValues() : formData;
    try {
      const chars = await loadCharacters(app);
      const charId = data.id || Date.now();
      const charToSave = { ...data, id: charId, savedAt: new Date().toISOString() };
      const idx = chars.findIndex((c: any) => c.id === charId);
      const updated = idx !== -1
        ? chars.map((c: any, i: number) => i === idx ? charToSave : c)
        : [...chars, charToSave];
      if (idx === -1 && formContext) formContext.setValue('id', charId);
      await saveCharacters(app, updated);
      new Notice(data.id ? `✅ ${data.name} updated!` : `✅ ${data.name} saved to library!`);
      setTimeout(() => modal?.close(), 1000);
    } catch {
      new Notice('❌ Failed to save character');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddItem = () => {
    if (!newItemName.trim() || !formContext) return;
    formContext.setValue('inventory', [...(formData.inventory || []), newItemName.trim()]);
    setNewItemName('');
  };

  const handleRemoveEveryItem = (item: string) => {
    if (!formContext) return;
    if ((formData.inventory || []).includes(item)) {
      formContext.setValue('inventory', formData.inventory.filter((i: string) => i !== item));
    } else {
      formContext.setValue('removedEquipment', [...(formData.removedEquipment || []), item]);
    }
  };

  const generatePythonScript = () => {
    const script = `class Character:\n    def __init__(self, data):\n        self.name = data['name']\n        self.level = data['level']\n        self.race = data['race']\n        self.char_class = data['class']\n\nchar_data = ${JSON.stringify(formData, null, 4)}\nmy_hero = Character(char_data)\nprint(f"Adventure awaits for {my_hero.name}!")\n`;
    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${formData.name || 'character'}.py`; a.click();
    URL.revokeObjectURL(url);
  };

  const SpellDetailCard = ({ spell, isRacial }: { spell: any; isRacial?: boolean }) => {
    const isExpanded = expandedSpell === spell.id;
    return (
      <Card className="border-2 border-primary/10 hover:border-primary/30 transition-all overflow-hidden">
        <div className="p-3 cursor-pointer flex justify-between items-center bg-secondary/20"
          onClick={() => setExpandedSpell(isExpanded ? null : spell.id)}>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">{spell.name}</span>
            {isRacial && <Badge variant="secondary" className="text-[8px] h-4 uppercase">Racial</Badge>}
            <Badge variant="outline" className="text-[8px] py-0 px-1 uppercase opacity-60 font-mono">{spell.school}</Badge>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Info className={`w-3 h-3 transition-transform ${isExpanded ? 'scale-125 text-primary' : ''}`} />
          </Button>
        </div>
        {isExpanded && (
          <CardContent className="p-3 text-xs text-muted-foreground bg-background leading-relaxed">
            {spell.description}
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Character Header */}
      <div className="flex flex-col items-center text-center pb-6">
        <div className="w-32 h-32 bg-primary/10 rounded-3xl flex items-center justify-center mb-4 relative overflow-hidden border-4 border-primary/10 shadow-xl">
          {formData.image ? (
            <div className="w-full h-full" style={{
              backgroundImage: `url(${formData.image})`,
              backgroundPosition: `${formData.imageX||50}% ${formData.imageY||50}%`,
              backgroundSize: `${formData.imageScale||100}%`,
              backgroundRepeat: 'no-repeat'
            }} />
          ) : <User className="w-16 h-16 text-primary" />}
          <div className="absolute bottom-2 right-2 bg-primary text-white text-xs font-black px-3 py-1 rounded-full border-2 border-background shadow-lg">
            LVL {formData.level}
          </div>
        </div>
        <h2 className="text-4xl font-black uppercase tracking-tight text-primary">{formData.name || 'Unnamed Adventurer'}</h2>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="secondary" className="uppercase font-black tracking-widest px-3 py-1">
            {formData.race} {formData.subrace && `(${formData.subrace.replace(/-/g,' ')})`}
          </Badge>
          <Badge className="uppercase font-black tracking-widest px-3 py-1">
            {formData.class} {formData.subclass && `- ${formData.subclass.replace(/-/g,' ')}`}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6 bg-secondary/30 p-1 rounded-xl">
          {[
            { v:'overview', icon:<Shield className="w-3.5 h-3.5 mr-2"/>,  label:'Combat'  },
            { v:'spells',   icon:<Sparkles className="w-3.5 h-3.5 mr-2"/>, label:'Spells'  },
            { v:'skills',   icon:<Target className="w-3.5 h-3.5 mr-2"/>,  label:'Skills'  },
            { v:'traits',   icon:<ScrollText className="w-3.5 h-3.5 mr-2"/>, label:'Traits'},
            { v:'inventory',icon:<Backpack className="w-3.5 h-3.5 mr-2"/>, label:'Gear'   },
          ].map(t => (
            <TabsTrigger key={t.v} value={t.v} className="rounded-lg font-bold uppercase text-xs tracking-wider">
              {t.icon}{t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Combat Tab */}
        <TabsContent value="overview" className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {[
              { icon:<Heart className="w-5 h-5 mx-auto mb-1 text-red-500"/>,     label:'HP',    value:hp,            color:'red'    },
              { icon:<Shield className="w-5 h-5 mx-auto mb-1 text-blue-500"/>,   label:'AC',    value:ac,            color:'blue'   },
              { icon:<Dices className="w-5 h-5 mx-auto mb-1 text-purple-500"/>,  label:'Hit Die', value:hitDie,      color:'purple' },
              { icon:<Zap className="w-5 h-5 mx-auto mb-1 text-yellow-500"/>,    label:'Init',  value:initiative>=0?`+${initiative}`:initiative, color:'yellow' },
              { icon:<Footprints className="w-5 h-5 mx-auto mb-1 text-emerald-500"/>, label:'Speed', value:`${speed}ft`, color:'emerald' },
              { icon:<Coins className="w-5 h-5 mx-auto mb-1 text-amber-500"/>,   label:'Gold',  value:formData.money?.gp||0, color:'amber' },
            ].map(s => (
              <div key={s.label} className={`bg-${s.color}-50 dark:bg-${s.color}-950/20 p-4 rounded-2xl text-center border-2 border-${s.color}-100 dark:border-${s.color}-900/30`}>
                {s.icon}
                <div className={`text-[10px] uppercase font-bold text-${s.color}-500/60 tracking-wider`}>{s.label}</div>
                <div className="text-3xl font-black">{s.value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-2">
              <CardContent className="p-4 space-y-4">
                <h3 className="font-black flex items-center gap-2 text-sm uppercase tracking-widest text-primary">
                  <BarChart className="w-4 h-4" /> Ability Scores
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {['str','dex','con','int','wis','cha'].map(stat => {
                    const total = getFinalStat(stat);
                    const isProf = classInfo.saves.includes(stat);
                    const saveMod = getModValue(stat) + (isProf ? proficiencyBonus : 0);
                    return (
                      <div key={stat} className="bg-secondary/10 p-3 rounded-xl text-center border-2 border-transparent hover:border-primary/20 transition-all">
                        <div className="text-[10px] uppercase font-bold text-muted-foreground">{stat}</div>
                        <div className="text-2xl font-black leading-none my-1">{total}</div>
                        <div className="text-xs font-bold text-primary mb-2">{getModifier(total)}</div>
                        <div className={`text-[9px] py-1 rounded-md uppercase font-black tracking-tighter ${isProf ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                          Save: {saveMod>=0?`+${saveMod}`:saveMod}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="p-4 space-y-4">
                <h3 className="font-black flex items-center gap-2 text-sm uppercase tracking-widest text-primary">
                  <Sword className="w-4 h-4" /> Primary Attacks
                </h3>
                <div className="space-y-2">
                  {weapons.length > 0 ? weapons.map((w: any, idx: number) => {
                    const hitBonus = getModValue(w.details.stat) + proficiencyBonus;
                    const dmgMod   = getModValue(w.details.stat);
                    return (
                      <div key={idx} className="flex justify-between items-center p-3 border-2 rounded-xl bg-secondary/5">
                        <div>
                          <div className="text-sm font-black uppercase">{w.original}</div>
                          <div className="flex gap-1">
                            {w.details.properties?.map((p: string) => (
                              <Badge key={p} variant="outline" className="text-[7px] py-0 px-1 uppercase">{p}</Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-black text-primary">+{hitBonus}</div>
                          <div className="text-sm font-bold text-muted-foreground uppercase">{w.details.damage}{dmgMod!==0&&(dmgMod>0?`+${dmgMod}`:dmgMod)} {w.details.type}</div>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="text-center py-6 text-xs text-muted-foreground italic border-2 border-dashed rounded-xl">No weapons detected</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Spells Tab */}
        <TabsContent value="spells" className="space-y-6">
          {(!isSpellcaster && racialCantrips.length === 0) ? (
            <Card className="border-dashed border-2 py-12 text-center">
              <Wand2 className="w-12 h-12 mx-auto text-muted-foreground/20 mb-4" />
              <h3 className="text-xl font-black uppercase tracking-tight text-muted-foreground">No Magic Available</h3>
            </Card>
          ) : (
            <div className="space-y-6">
              {isSpellcaster && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label:'Save DC',    value:spellSaveDC         },
                    { label:'Attack',     value:`+${spellAttackBonus}` },
                    { label:'Ability',    value:spellAbility.toUpperCase() },
                    { label:'1st Slots',  value:slots[1]||0          },
                  ].map(s => (
                    <div key={s.label} className="bg-primary/5 p-3 rounded-xl text-center border-2 border-primary/10">
                      <div className="text-[10px] uppercase font-bold text-primary/60">{s.label}</div>
                      <div className="text-2xl font-black text-primary">{s.value}</div>
                    </div>
                  ))}
                </div>
              )}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" /> Cantrips
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[...new Set([...racialCantrips, ...(formData.cantrips||[])])].map((id: string) => {
                    const s = SPELL_DATA.cantrips.find((x:any) => x.id === id);
                    if (!s) return null;
                    return <SpellDetailCard key={id} spell={s} isRacial={racialCantrips.includes(id)} />;
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Book className="w-3.5 h-3.5" /> Spells
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {(formData.spells||[]).map((id: string) => {
                    const allS = [...SPELL_DATA.level1,...(SPELL_DATA.level2||[]),...(SPELL_DATA.level3||[]),...(SPELL_DATA.level4||[]),...(SPELL_DATA.level5||[])];
                    const s = allS.find((x:any) => x.id === id);
                    if (!s) return null;
                    return <SpellDetailCard key={id} spell={s} />;
                  })}
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-2">
              <CardContent className="p-4 space-y-4">
                <h3 className="font-black flex items-center gap-2 text-sm uppercase tracking-widest text-primary">
                  <Target className="w-4 h-4" /> Skill Proficiencies
                </h3>
                <div className="space-y-1">
                  {SKILL_LIST.map(skill => {
                    const isProf = formData.skills?.includes(skill.id);
                    const mod = getModValue(skill.stat) + (isProf ? proficiencyBonus : 0);
                    return (
                      <div key={skill.id} className={`flex justify-between items-center text-[12px] p-2 rounded-lg ${isProf?'bg-primary/10 border-primary/20 border-2':'hover:bg-secondary/20'}`}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${isProf?'bg-primary':'bg-muted'}`} />
                          <span className={`capitalize ${isProf?'font-black':'text-muted-foreground font-medium'}`}>{skill.id.replace(/-/g,' ')}</span>
                          <span className="text-[9px] uppercase opacity-40 font-black">({skill.stat})</span>
                        </div>
                        <span className={`font-mono font-black ${isProf?'text-primary':'text-muted-foreground'}`}>{mod>=0?`+${mod}`:mod}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-2 bg-secondary/5">
                <CardContent className="p-4 space-y-4">
                  <h3 className="font-black flex items-center gap-2 text-sm uppercase tracking-widest text-primary">
                    <Brain className="w-4 h-4" /> Senses & Bonus
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex justify-between items-center bg-background p-3 rounded-xl border-2">
                      <div className="text-[10px] font-black uppercase text-muted-foreground">Proficiency Bonus</div>
                      <div className="text-xl font-black text-primary">+{proficiencyBonus}</div>
                    </div>
                    <div className="flex justify-between items-center bg-background p-3 rounded-xl border-2">
                      <div className="text-[10px] font-black uppercase text-muted-foreground">Passive Perception</div>
                      <div className="text-xl font-black">{passivePerception}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Traits Tab */}
        <TabsContent value="traits" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-2">
              <CardContent className="p-4 space-y-4">
                <h3 className="font-black flex items-center gap-2 text-sm uppercase tracking-widest text-primary">
                  <ScrollText className="w-4 h-4" /> Racial & Class Traits
                </h3>
                <div className="space-y-3">
                  {allTraits.map((trait: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 bg-secondary/10 p-3 rounded-xl border-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-sm font-black uppercase">{trait}</div>
                        <div className="text-xs text-muted-foreground mt-1">Source: {racialTraits.includes(trait)?'Race':'Class'}</div>
                      </div>
                    </div>
                  ))}
                  {allTraits.length === 0 && <div className="text-center py-10 text-muted-foreground italic border-2 border-dashed rounded-xl">No traits found</div>}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="p-4 space-y-4">
                <h3 className="font-black flex items-center gap-2 text-sm uppercase tracking-widest text-primary">
                  <Plus className="w-4 h-4" /> Feats & Special
                </h3>
                <div className="space-y-3">
                  {allFeats.map((feat: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 bg-primary/5 p-3 rounded-xl border-2 border-primary/20">
                      <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div className="text-sm font-black uppercase">{feat}</div>
                    </div>
                  ))}
                  {allFeats.length === 0 && <div className="text-center py-10 text-muted-foreground italic border-2 border-dashed rounded-xl">No feats taken</div>}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-2">
              <CardContent className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-black flex items-center gap-2 text-sm uppercase tracking-widest text-primary">
                    <Backpack className="w-4 h-4" /> Inventory
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setIsEditingGear(!isEditingGear)} className="h-8 gap-2 text-[10px] uppercase font-bold">
                    {isEditingGear ? <Check className="w-3 h-3" /> : <Edit2 className="w-3 h-3" />}
                    {isEditingGear ? 'Done' : 'Edit'}
                  </Button>
                </div>
                {isEditingGear && (
                  <div className="flex gap-2">
                    <Input placeholder="Add new item..." value={newItemName}
                      onChange={e => setNewItemName(e.target.value)}
                      onKeyDown={e => e.key==='Enter' && handleAddItem()}
                      className="h-9 text-xs" />
                    <Button size="icon" className="h-9 w-9 shrink-0" onClick={handleAddItem}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                <div className="space-y-2">
                  {finalGear.map((item: string, idx: number) => {
                    const clean = item.replace(/^(Two|Four|Five|Ten)\s+/i,'').replace(/s$/,'');
                    const details = EQUIPMENT_DATA[clean] || EQUIPMENT_DATA[item];
                    return (
                      <div key={idx} className="flex justify-between items-center p-3 border-2 rounded-xl bg-secondary/5">
                        <div>
                          <div className="text-xs font-black uppercase">{item}</div>
                          {details && <div className="text-[9px] text-muted-foreground">{details.weight} • {details.cost}</div>}
                        </div>
                        <div className="flex items-center gap-1">
                          {isEditingGear && (
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleRemoveEveryItem(item)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                          {details && (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <Info className="w-3 h-3 text-primary" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-64 p-3 text-xs">
                                <div className="font-black uppercase mb-1 border-b pb-1 text-primary">{item}</div>
                                <p className="leading-relaxed">{details.properties}</p>
                              </PopoverContent>
                            </Popover>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-black flex items-center gap-2 text-sm uppercase tracking-widest text-primary">
                    <Coins className="w-4 h-4" /> Currency
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setIsEditingMoney(!isEditingMoney)} className="h-8 gap-2 text-[10px] uppercase font-bold">
                    {isEditingMoney ? <Check className="w-3 h-3" /> : <Edit2 className="w-3 h-3" />}
                    {isEditingMoney ? 'Done' : 'Edit'}
                  </Button>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    {id:'cp',name:'CP',color:'text-orange-600',bg:'bg-orange-50'},
                    {id:'sp',name:'SP',color:'text-slate-400', bg:'bg-slate-50'},
                    {id:'ep',name:'EP',color:'text-emerald-600',bg:'bg-emerald-50'},
                    {id:'gp',name:'GP',color:'text-amber-500', bg:'bg-amber-50'},
                    {id:'pp',name:'PP',color:'text-purple-600',bg:'bg-purple-50'},
                  ].map(coin => (
                    <div key={coin.id} className={`${coin.bg} p-3 rounded-xl text-center border-2`}>
                      <div className={`text-[9px] font-black ${coin.color}`}>{coin.name}</div>
                      {isEditingMoney && formContext ? (
                        <Input type="number" className="h-8 mt-1 p-0 text-center text-xs font-black border-none bg-transparent"
                          {...formContext.register(`money.${coin.id}`, { valueAsNumber: true })} />
                      ) : (
                        <div className="text-sm font-black mt-1">{formData.money?.[coin.id]||0}</div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
        <Button onClick={handleSaveCharacter} className="h-16 gap-3 rounded-2xl" disabled={isSaving}>
          {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
          <div className="text-left">
            <div className="font-black uppercase text-sm">{isSaving ? 'Saving...' : 'Save Character'}</div>
            <div className="text-[10px] opacity-80">Save to vault as JSON</div>
          </div>
        </Button>
        <Button onClick={generatePythonScript} variant="outline" className="h-16 gap-3 border-2 rounded-2xl">
          <FileCode className="w-6 h-6 text-blue-500" />
          <div className="text-left">
            <div className="font-black uppercase text-sm">Export Code</div>
            <div className="text-[10px] text-muted-foreground">Download .py character file</div>
          </div>
        </Button>
      </div>
    </div>
  );
}
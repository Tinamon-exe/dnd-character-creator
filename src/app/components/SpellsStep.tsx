import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Sparkles, Book, AlertCircle, Info, ChevronUp, BookOpen } from 'lucide-react';
import { CLASS_DATA, SPELL_DATA, RACE_DATA } from '../utils/dnd-data';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

export function SpellsStep() {
  const { watch, setValue } = useFormContext();
  const formData = watch();
  const [expandedSpell, setExpandedSpell] = useState<string | null>(null);

  const classInfo = CLASS_DATA[formData.class];
  const spellcasting = classInfo?.spellcasting;
  
  const isSpellcaster = !!spellcasting && (formData.level >= (spellcasting.levelAvailable || 1));

  // Get racial spells
  const raceInfo = RACE_DATA[formData.race] || {};
  const subraceInfo = raceInfo.subraces?.[formData.subrace] || {};
  const racialCantrips = [...(raceInfo.cantrips || []), ...(subraceInfo.cantrips || [])];

  if (!isSpellcaster && racialCantrips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold">No Spells Available</h3>
          <p className="text-muted-foreground max-w-xs">
            Neither your race nor your {formData.class} class provides spellcasting at level {formData.level}.
          </p>
        </div>
      </div>
    );
  }

  const getFinalStat = (statName: string) => {
    const base = formData.stats?.[statName] || 10;
    const bonus = (raceInfo.bonuses && raceInfo.bonuses[statName]) || 0;
    const subBonus = (subraceInfo.bonuses && subraceInfo.bonuses[statName]) || 0;
    return base + bonus + subBonus;
  };

  const getModValue = (statName: string) => {
    return Math.floor((getFinalStat(statName) - 10) / 2);
  };

  const spellAbility = spellcasting?.ability || 'int'; 
  const spellMod = getModValue(spellAbility);
  const proficiencyBonus = Math.floor((formData.level - 1) / 4) + 2;
  const spellSaveDC = 8 + proficiencyBonus + spellMod;
  const spellAttackBonus = proficiencyBonus + spellMod;

  // Calculate slots
  const getSpellSlots = (lvl: number, isPactMagic: boolean) => {
    if (isPactMagic) {
      if (lvl < 3) return { 1: 2 };
      if (lvl < 5) return { 2: 2 };
      if (lvl < 7) return { 3: 2 };
      if (lvl < 9) return { 4: 2 };
      if (lvl < 11) return { 5: 2 };
      if (lvl < 17) return { 5: 3 };
      return { 5: 4 };
    }
    const slots: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
    if (lvl >= 1) slots[1] = lvl === 1 ? 2 : (lvl === 2 ? 3 : 4);
    if (lvl >= 3) slots[2] = lvl === 3 ? 2 : 3;
    if (lvl >= 5) slots[3] = lvl === 5 ? 2 : 3;
    if (lvl >= 7) slots[4] = lvl === 7 ? 1 : (lvl === 8 ? 2 : 3);
    if (lvl >= 9) slots[5] = lvl === 9 ? 1 : (lvl === 10 ? 2 : 3);
    if (lvl >= 11) slots[6] = lvl >= 19 ? 2 : 1;
    if (lvl >= 13) slots[7] = lvl >= 20 ? 2 : 1;
    if (lvl >= 15) slots[8] = 1;
    if (lvl >= 17) slots[9] = 1;
    return slots;
  };

  const slots = isSpellcaster ? getSpellSlots(formData.level, spellcasting.isPactMagic) : {};

  // Calculate limits
  let currentCantripLimit = 0;
  let currentSpellLimit = 0;

  if (isSpellcaster) {
    // Basic cantrip scaling
    const baseCantrips = spellcasting.cantrips || 0;
    currentCantripLimit = baseCantrips;
    if (baseCantrips > 0) {
      if (formData.level >= 4) currentCantripLimit++;
      if (formData.level >= 10) currentCantripLimit++;
    }

    if (typeof spellcasting.spells === 'number') {
      if (formData.class === 'bard') {
        const bardSpells = [0, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 18, 19, 19, 20, 22, 22, 22];
        currentSpellLimit = bardSpells[formData.level] || 4;
      } else if (formData.class === 'sorcerer') {
        const sorcSpells = [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15];
        currentSpellLimit = sorcSpells[formData.level] || 2;
      } else if (formData.class === 'warlock') {
        const warlSpells = [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15];
        currentSpellLimit = warlSpells[formData.level] || 2;
      } else if (formData.class === 'ranger') {
        const rangSpells = [0, 0, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11];
        currentSpellLimit = rangSpells[formData.level] || 2;
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
    const currentCantrips = formData.cantrips || [];
    if (currentCantrips.includes(id)) {
      setValue('cantrips', currentCantrips.filter((c: string) => c !== id));
    } else if (currentCantrips.length < currentCantripLimit) {
      setValue('cantrips', [...currentCantrips, id]);
    }
  };

  const toggleSpell = (id: string) => {
    const currentSpells = formData.spells || [];
    if (currentSpells.includes(id)) {
      setValue('spells', currentSpells.filter((s: string) => s !== id));
    } else if (currentSpells.length < currentSpellLimit) {
      setValue('spells', [...currentSpells, id]);
    }
  };

  const filteredCantrips = SPELL_DATA.cantrips.filter((c: any) => c.classes.includes(formData.class) || racialCantrips.includes(c.id));
  const filteredLevel1 = SPELL_DATA.level1.filter((s: any) => s.classes.includes(formData.class));
  const filteredLevel2 = (SPELL_DATA.level2 || []).filter((s: any) => s.classes.includes(formData.class));
  const filteredLevel3 = (SPELL_DATA.level3 || []).filter((s: any) => s.classes.includes(formData.class));
  const filteredLevel4 = (SPELL_DATA.level4 || []).filter((s: any) => s.classes.includes(formData.class));
  const filteredLevel5 = (SPELL_DATA.level5 || []).filter((s: any) => s.classes.includes(formData.class));
  const filteredLevel6 = (SPELL_DATA.level6 || []).filter((s: any) => s.classes.includes(formData.class));
  const filteredLevel7 = (SPELL_DATA.level7 || []).filter((s: any) => s.classes.includes(formData.class));
  const filteredLevel8 = (SPELL_DATA.level8 || []).filter((s: any) => s.classes.includes(formData.class));
  const filteredLevel9 = (SPELL_DATA.level9 || []).filter((s: any) => s.classes.includes(formData.class));

  const SpellCard = ({ spell, isCantrip }: { spell: any, isCantrip: boolean }) => {
    const isSelected = (isCantrip ? (formData.cantrips || []) : (formData.spells || [])).includes(spell.id) || (isCantrip && racialCantrips.includes(spell.id));
    const isRacial = isCantrip && racialCantrips.includes(spell.id);
    const isExpanded = expandedSpell === spell.id;

    return (
      <Card 
        className={`transition-all border-2 ${isSelected ? 'border-primary bg-primary/5' : 'hover:bg-secondary/50 border-transparent bg-secondary/30'} ${!isRacial ? 'cursor-pointer' : ''}`}
        onClick={() => !isRacial && (isCantrip ? toggleCantrip(spell.id) : toggleSpell(spell.id))}
      >
        <CardContent className="p-3 space-y-2">
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="font-bold text-sm">{spell.name}</div>
                {isRacial && <Badge variant="secondary" className="text-[8px] h-4 uppercase">Race</Badge>}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase flex items-center gap-2">
                {spell.school}
                {isSelected && !isRacial && <Badge className="h-3 w-3 rounded-full p-0 flex items-center justify-center text-[8px]">✓</Badge>}
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={(e) => {
                e.stopPropagation();
                setExpandedSpell(isExpanded ? null : spell.id);
              }}
            >
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <Info className="w-3 h-3" />}
            </Button>
          </div>
          
          {isExpanded && (
            <div className="text-xs text-muted-foreground pt-2 border-t border-primary/10 leading-relaxed animate-in fade-in slide-in-from-top-1">
              {spell.description}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8 pb-12">
      <Tabs defaultValue="wizard" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-secondary/30 p-1 rounded-xl">
          <TabsTrigger value="wizard" className="rounded-lg font-black uppercase text-[10px] tracking-widest">
            Selection
          </TabsTrigger>
          <TabsTrigger value="index" className="rounded-lg font-black uppercase text-[10px] tracking-widest">
            Spell Index
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wizard" className="space-y-8 animate-in fade-in duration-300">
          {isSpellcaster && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-primary/5 p-4 rounded-xl border-2 border-primary/10 text-center">
                <div className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Spell Save DC</div>
                <div className="text-3xl font-black text-primary">{spellSaveDC}</div>
              </div>
              <div className="bg-primary/5 p-4 rounded-xl border-2 border-primary/10 text-center">
                <div className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Spell Attack Bonus</div>
                <div className="text-3xl font-black text-primary">+{spellAttackBonus}</div>
              </div>
              <div className="bg-primary/5 p-4 rounded-xl border-2 border-primary/10 text-center">
                <div className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Casting Ability</div>
                <div className="text-3xl font-black text-primary uppercase">{spellAbility}</div>
              </div>
            </div>
          )}

          {isSpellcaster && Object.values(slots).some(v => v > 0) && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Available Spell Slots</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(slots).map(([lvl, count]) => count > 0 && (
                  <div key={lvl} className="bg-secondary p-3 rounded-lg border flex flex-col items-center min-w-[60px]">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase">Lvl {lvl}</div>
                    <div className="text-xl font-black">{count}</div>
                  </div>
                ))}
                {spellcasting.isPactMagic && <Badge variant="outline" className="h-fit">Pact Magic</Badge>}
              </div>
            </div>
          )}

          {(currentCantripLimit > 0 || racialCantrips.length > 0) && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b-2 border-primary/10 pb-2">
                <h3 className="text-lg font-black flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  CANTRIPS
                </h3>
                <Badge variant={(formData.cantrips || []).length === currentCantripLimit ? "default" : "outline"} className="font-mono">
                  {(formData.cantrips || []).length} / {currentCantripLimit} Selected
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredCantrips.map((spell: any) => (
                  <SpellCard key={spell.id} spell={spell} isCantrip={true} />
                ))}
              </div>
            </div>
          )}

          {currentSpellLimit > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b-2 border-primary/10 pb-2">
                <h3 className="text-lg font-black flex items-center gap-2">
                  <Book className="w-5 h-5 text-blue-500" />
                  PREPARED SPELLS
                </h3>
                <Badge variant={(formData.spells || []).length === currentSpellLimit ? "default" : "outline"} className="font-mono">
                  {(formData.spells || []).length} / {currentSpellLimit} Selected
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredLevel1.map((spell: any) => (
                  <SpellCard key={spell.id} spell={spell} isCantrip={false} />
                ))}
              </div>
            </div>
          )}

          {formData.level >= 3 && filteredLevel2.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b-2 border-primary/10 pb-2">
                <h3 className="text-lg font-black flex items-center gap-2 text-purple-500">
                  <Book className="w-5 h-5" />
                  2ND LEVEL SPELLS
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredLevel2.map((spell: any) => (
                  <SpellCard key={spell.id} spell={spell} isCantrip={false} />
                ))}
              </div>
            </div>
          )}

          {formData.level >= 5 && filteredLevel3.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b-2 border-primary/10 pb-2">
                <h3 className="text-lg font-black flex items-center gap-2 text-indigo-500">
                  <Book className="w-5 h-5" />
                  3RD LEVEL SPELLS
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredLevel3.map((spell: any) => (
                  <SpellCard key={spell.id} spell={spell} isCantrip={false} />
                ))}
              </div>
            </div>
          )}

          {formData.level >= 7 && filteredLevel4.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b-2 border-primary/10 pb-2">
                <h3 className="text-lg font-black flex items-center gap-2 text-red-500">
                  <Book className="w-5 h-5" />
                  4TH LEVEL SPELLS
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredLevel4.map((spell: any) => (
                  <SpellCard key={spell.id} spell={spell} isCantrip={false} />
                ))}
              </div>
            </div>
          )}

          {formData.level >= 9 && filteredLevel5.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b-2 border-primary/10 pb-2">
                <h3 className="text-lg font-black flex items-center gap-2 text-orange-500">
                  <Book className="w-5 h-5" />
                  5TH LEVEL SPELLS
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredLevel5.map((spell: any) => (
                  <SpellCard key={spell.id} spell={spell} isCantrip={false} />
                ))}
              </div>
            </div>
          )}

          {formData.level >= 11 && filteredLevel6.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b-2 border-primary/10 pb-2">
                <h3 className="text-lg font-black flex items-center gap-2 text-teal-500">
                  <Book className="w-5 h-5" />
                  6TH LEVEL SPELLS
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredLevel6.map((spell: any) => (
                  <SpellCard key={spell.id} spell={spell} isCantrip={false} />
                ))}
              </div>
            </div>
          )}

          {formData.level >= 13 && filteredLevel7.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b-2 border-primary/10 pb-2">
                <h3 className="text-lg font-black flex items-center gap-2 text-cyan-500">
                  <Book className="w-5 h-5" />
                  7TH LEVEL SPELLS
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredLevel7.map((spell: any) => (
                  <SpellCard key={spell.id} spell={spell} isCantrip={false} />
                ))}
              </div>
            </div>
          )}

          {formData.level >= 15 && filteredLevel8.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b-2 border-primary/10 pb-2">
                <h3 className="text-lg font-black flex items-center gap-2 text-rose-500">
                  <Book className="w-5 h-5" />
                  8TH LEVEL SPELLS
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredLevel8.map((spell: any) => (
                  <SpellCard key={spell.id} spell={spell} isCantrip={false} />
                ))}
              </div>
            </div>
          )}

          {formData.level >= 17 && filteredLevel9.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b-2 border-primary/10 pb-2">
                <h3 className="text-lg font-black flex items-center gap-2 text-yellow-600">
                  <Book className="w-5 h-5" />
                  9TH LEVEL SPELLS
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredLevel9.map((spell: any) => (
                  <SpellCard key={spell.id} spell={spell} isCantrip={false} />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="index" className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-secondary/20 p-4 rounded-xl border-2 border-dashed">
            <h3 className="text-sm font-black uppercase mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Full Spell Index
            </h3>
            <div className="space-y-6">
              {['cantrips', 'level1', 'level2', 'level3', 'level4', 'level5', 'level6', 'level7', 'level8', 'level9'].map((level) => {
                const spells = SPELL_DATA[level];
                if (!spells || spells.length === 0) return null;
                return (
                  <div key={level} className="space-y-2">
                    <h4 className="text-[10px] font-black uppercase text-muted-foreground border-b pb-1 tracking-widest">
                      {level === 'cantrips' ? 'Cantrips' : `Level ${level.replace('level', '')}`}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {spells.map((s: any) => (
                        <div key={s.id} className="p-2 rounded bg-background border flex justify-between items-center group hover:border-primary/50 transition-colors">
                          <span className="text-xs font-bold">{s.name}</span>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100">
                                <Info className="w-3 h-3" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-3 text-xs leading-relaxed">
                              <div className="font-bold mb-1 border-b pb-1 flex justify-between">
                                {s.name}
                                <span className="text-[9px] uppercase opacity-50">{s.school}</span>
                              </div>
                              {s.description}
                            </PopoverContent>
                          </Popover>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

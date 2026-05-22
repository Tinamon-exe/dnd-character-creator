import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from './ui/button';
import { Minus, Plus, Info, AlertCircle, Calculator } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { FormField, FormItem, FormControl, FormMessage } from './ui/form';
import { CLASS_DATA } from '../utils/dnd-data';

const STATS = [
  { id: 'str', name: 'Strength', icon: '💪', description: 'Physical might and athletic training.' },
  { id: 'dex', name: 'Dexterity', icon: '🏹', description: 'Agility, reflexes, and balance.' },
  { id: 'con', name: 'Constitution', icon: '🛡️', description: 'Endurance, health, and vital force.' },
  { id: 'int', name: 'Intelligence', icon: '🧠', description: 'Mental acuity, information recall, and analytical skill.' },
  { id: 'wis', name: 'Wisdom', icon: '🦉', description: 'Awareness, intuition, and insight.' },
  { id: 'cha', name: 'Charisma', icon: '✨', description: 'Confidence, eloquence, and leadership.' },
];

const POINT_COSTS: Record<number, number> = {
  8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9,
  16: 12, 17: 15, 18: 19, 19: 23, 20: 28
};

export function StatsStep() {
  const { control, watch, setValue } = useFormContext();
  const formData = watch();

  const classInfo = CLASS_DATA[formData.class];
  // Identify primary ability for class
  const primaryAbility = classInfo?.spellcasting?.ability || (
    formData.class === 'barbarian' || formData.class === 'fighter' || formData.class === 'paladin' ? 'str' :
    formData.class === 'rogue' || formData.class === 'monk' || formData.class === 'ranger' ? 'dex' : 'int'
  );

  const getASIBonus = () => {
    let count = Math.floor(formData.level / 4);
    if (formData.class === 'fighter') {
      if (formData.level >= 6) count++;
      if (formData.level >= 14) count++;
    }
    if (formData.class === 'rogue' && formData.level >= 10) {
      count++;
    }
    return count * 2;
  };

  const totalBudget = 27 + (getASIBonus() * 4); // Scale budget for higher levels
  
  const calculatePointsUsed = (stats: any) => {
    return Object.values(stats).reduce((acc: number, val: any) => acc + (POINT_COSTS[val] || 0), 0);
  };

  const currentPointsUsed = calculatePointsUsed(formData.stats);
  const remainingPoints = totalBudget - currentPointsUsed;

  const handleStatChange = (stat: string, delta: number) => {
    const currentValue = formData.stats[stat];
    const newValue = currentValue + delta;
    
    // Adjusted bounds: level 1 is 8-15, higher levels allow up to 20
    const maxVal = formData.level >= 4 ? 20 : 15;
    if (newValue < 8 || newValue > maxVal) return;
    
    const newStats = { ...formData.stats, [stat]: newValue };
    const newPoints = calculatePointsUsed(newStats);
    
    if (newPoints <= totalBudget || delta < 0) {
      setValue(`stats.${stat}`, newValue, { shouldValidate: true });
    }
  };

  const getModifier = (value: number) => {
    const mod = Math.floor((value - 10) / 2);
    return mod >= 0 ? `+${mod}` : mod;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-secondary/30 p-4 rounded-xl border-2 border-primary/10 gap-4 sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl border border-primary/20">
            {formData.class === 'fighter' ? '⚔️' : formData.class === 'wizard' ? '🧙' : '🛡️'}
          </div>
          <div>
            <h2 className="text-lg font-black flex items-center gap-2 uppercase tracking-tighter text-primary leading-none mb-1">
              {formData.class}
            </h2>
            <p className="text-[10px] text-muted-foreground uppercase font-bold">
              Primary: <span className="text-primary">{primaryAbility}</span> • Budget: {totalBudget}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <Badge variant={remainingPoints === 0 ? "default" : remainingPoints < 0 ? "destructive" : "outline"} className="text-lg px-4 py-1 font-black">
            {remainingPoints} Left
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {STATS.map((stat) => {
          const val = formData.stats[stat.id];
          const maxVal = formData.level >= 4 ? 20 : 15;
          const nextVal = val + 1;
          const costOfNext = (POINT_COSTS[nextVal] || 0) - (POINT_COSTS[val] || 0);
          const canIncrease = val < maxVal && remainingPoints >= costOfNext;
          const canDecrease = val > 8;
          const isPrimary = stat.id === primaryAbility;
          const isSave = classInfo?.saves?.includes(stat.id);

          return (
            <Card key={stat.id} className={`transition-all border-2 ${isPrimary ? 'border-primary/60 bg-primary/5 shadow-sm' : ''} ${val >= 14 && !isPrimary ? 'border-primary/20 bg-primary/[0.02]' : ''}`}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xs uppercase tracking-tight">{stat.name}</span>
                    {isPrimary && <Badge className="text-[8px] h-3.5 px-1 bg-primary">Main</Badge>}
                    {isSave && <Badge variant="outline" className="text-[8px] h-3.5 px-1">Save</Badge>}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent><p className="w-48 text-xs">{stat.description}</p></TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black tabular-nums leading-none">{val}</span>
                    <span className="text-md font-black text-primary">{getModifier(val)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" size="icon" className="rounded-full h-8 w-8 border-2"
                    onClick={() => handleStatChange(stat.id, -1)}
                    disabled={!canDecrease}
                    type="button"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <div className="w-8 text-center text-xs text-muted-foreground font-black tabular-nums">
                    {POINT_COSTS[val]}
                  </div>
                  <Button 
                    variant="outline" size="icon" className="rounded-full h-8 w-8 border-2"
                    onClick={() => handleStatChange(stat.id, 1)}
                    disabled={!canIncrease}
                    type="button"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {remainingPoints < 0 && (
        <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-3 rounded-lg text-sm font-medium">
          <AlertCircle className="w-4 h-4" />
          You have exceeded your point budget by {Math.abs(remainingPoints)} points!
        </div>
      )}
    </div>
  );
}

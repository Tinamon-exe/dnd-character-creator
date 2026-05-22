import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { BACKGROUND_DATA, FEAT_DATA } from '../utils/dnd-data';
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from './ui/form';
import { Badge } from './ui/badge';
import { X, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Input } from './ui/input';

const ALIGNMENTS = [
  'Lawful Good', 'Neutral Good', 'Chaotic Good',
  'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
  'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'
];

export function DetailsStep() {
  const { control, watch, setValue } = useFormContext();
  const background = watch('background');
  const traits = watch('traits') || [];
  const feats = watch('feats') || [];
  const [newTrait, setNewTrait] = React.useState('');

  const handleAddTrait = () => {
    if (newTrait.trim()) {
      setValue('traits', [...traits, newTrait.trim()]);
      setNewTrait('');
    }
  };

  const removeTrait = (trait: string) => {
    setValue('traits', traits.filter((t: string) => t !== trait));
  };

  const toggleFeat = (feat: string) => {
    if (feats.includes(feat)) {
      setValue('feats', feats.filter((f: string) => f !== feat));
    } else {
      setValue('feats', [...feats, feat]);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="background"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Background</FormLabel>
              <Select 
                value={field.value} 
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a background..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.keys(BACKGROUND_DATA).map((bg) => (
                    <SelectItem key={bg} value={bg}>
                      <span className="capitalize">{bg.replace('_', ' ')}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {field.value && (
                <p className="text-[10px] text-muted-foreground uppercase mt-1">
                  Grants proficiency in: {BACKGROUND_DATA[field.value].skills.join(', ')}
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="alignment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alignment</FormLabel>
              <Select 
                value={field.value} 
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an alignment..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ALIGNMENTS.map((al) => (
                    <SelectItem key={al} value={al.toLowerCase().replace(/\s+/g, '-')}>
                      {al}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-xs uppercase font-black tracking-widest text-primary">Custom Traits & Abilities</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {traits.map((trait: string) => (
              <Badge key={trait} className="gap-1 px-3 py-1 bg-secondary/50 text-secondary-foreground hover:bg-secondary/70 border-none">
                {trait}
                <button onClick={() => removeTrait(trait)} className="hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            <div className="flex gap-2">
              <Input 
                placeholder="Add trait..." 
                className="h-8 w-40 text-xs" 
                value={newTrait}
                onChange={(e) => setNewTrait(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTrait()}
              />
              <Button size="icon" className="h-8 w-8" onClick={handleAddTrait}>
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>

        <div>
          <Label className="text-xs uppercase font-black tracking-widest text-primary">Feats</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {feats.map((feat: string) => (
              <Badge key={feat} className="gap-1 px-3 py-1 bg-primary text-primary-foreground border-none">
                {feat}
                <button onClick={() => toggleFeat(feat)}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-2 uppercase font-black text-[10px]">
                  <Plus className="w-3 h-3" />
                  Select Feat
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 max-h-60 overflow-y-auto p-1">
                {FEAT_DATA.map((feat) => (
                  <button
                    key={feat}
                    onClick={() => toggleFeat(feat)}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-secondary rounded transition-colors ${feats.includes(feat) ? 'bg-primary/10 text-primary font-bold' : ''}`}
                  >
                    {feat}
                  </button>
                ))}
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="backstory">Backstory (Optional)</Label>
        <Textarea 
          id="backstory" 
          placeholder="Write a brief backstory for your character..." 
          className="min-h-[120px]"
        />
      </div>
    </div>
  );
}

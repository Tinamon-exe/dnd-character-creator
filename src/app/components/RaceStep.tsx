import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from './ui/form';
import { Check } from 'lucide-react';

const RACES = [
  { id: 'human',      name: 'Human',      description: 'Versatile and ambitious, humans are the most common race.',       subraces: [],                                                                               image: 'https://images.unsplash.com/photo-1773216344329-06f965a2355a?auto=format&fit=crop&q=80&w=400' },
  { id: 'elf',        name: 'Elf',        description: 'Magical and graceful, elves live in places of ethereal beauty.',   subraces: ['High Elf', 'Wood Elf', 'Dark Elf (Drow)'],                                      image: 'https://images.unsplash.com/photo-1615672968547-811b8e470371?auto=format&fit=crop&q=80&w=400' },
  { id: 'dwarf',      name: 'Dwarf',      description: 'Bold and hardy, dwarves are skilled warriors and miners.',         subraces: ['Hill Dwarf', 'Mountain Dwarf'],                                                  image: 'https://images.unsplash.com/photo-1532714973334-71d839b1ebea?auto=format&fit=crop&q=80&w=400' },
  { id: 'halfling',   name: 'Halfling',   description: 'Small and practical, halflings survive by avoiding notice.',       subraces: ['Lightfoot', 'Stout'],                                                           image: 'https://images.unsplash.com/photo-1516726817505-f5ed825624d8?auto=format&fit=crop&q=80&w=400' },
  { id: 'dragonborn', name: 'Dragonborn', description: 'Proud and draconic, they carry dragon blood in their veins.',     subraces: ['Black', 'Blue', 'Brass', 'Bronze', 'Copper', 'Gold', 'Green', 'Red', 'Silver', 'White'], image: 'https://images.unsplash.com/photo-1529981188441-8a2e6fe30103?auto=format&fit=crop&q=80&w=400' },
  { id: 'tiefling',   name: 'Tiefling',   description: 'Marked by infernal heritage, tieflings are met with suspicion.',  subraces: [],                                                                               image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=400' },
  { id: 'gnome',      name: 'Gnome',      description: 'Small inventors with an innate spark of magic.',                  subraces: ['Forest', 'Rock'],                                                               image: 'https://images.unsplash.com/photo-1615672968547-811b8e470371?auto=format&fit=crop&q=80&w=400' },
];

export function RaceStep() {
  const { control, watch, setValue } = useFormContext();
  const currentRace = watch('race');
  const currentSubrace = watch('subrace');
  const selectedRace = RACES.find(r => r.id === currentRace);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <FormField control={control} name="race" render={({ field }) => (
        <FormItem>
          <FormControl>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.625rem' }}>
              {RACES.map((race) => {
                const isSelected = field.value === race.id;
                return (
                  <div
                    key={race.id}
                    role="button"
                    onClick={() => { field.onChange(race.id); setValue('subrace', ''); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.625rem 0.75rem',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      border: isSelected
                        ? '2px solid var(--interactive-accent)'
                        : '2px solid var(--background-modifier-border)',
                      background: isSelected
                        ? 'var(--background-modifier-form-field)'
                        : 'var(--background-primary)',
                      transition: 'border-color 0.15s, background 0.15s',
                      position: 'relative',
                    }}
                  >
                    <img
                      src={race.image}
                      alt={race.name}
                      style={{
                        width: '2.5rem', height: '2.5rem',
                        borderRadius: '0.375rem', objectFit: 'cover',
                        flexShrink: 0,
                        border: '1px solid var(--background-modifier-border)',
                      }}
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontWeight: 700, fontSize: '0.875rem',
                        color: 'var(--text-normal)',
                      }}>
                        {race.name}
                      </div>
                      <div style={{
                        fontSize: '0.7rem', color: 'var(--text-muted)',
                        overflow: 'hidden', display: '-webkit-box',
                        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      }}>
                        {race.description}
                      </div>
                    </div>

                    {isSelected && (
                      <div style={{
                        position: 'absolute', top: '0.375rem', right: '0.375rem',
                        background: 'var(--interactive-accent)',
                        borderRadius: '50%',
                        width: '1.125rem', height: '1.125rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <Check style={{ width: '0.6rem', height: '0.6rem', color: '#ffffff' }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />

      {/* Native select — Radix Select portals don't work inside Obsidian modals */}
      {selectedRace && selectedRace.subraces.length > 0 && (
        <div style={{
          paddingTop: '1rem',
          borderTop: '1px solid var(--background-modifier-border)',
          display: 'flex', flexDirection: 'column', gap: '0.5rem',
        }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-normal)' }}>
            Select Subrace for {selectedRace.name}
          </label>
          <select
            value={currentSubrace || ''}
            onChange={e => setValue('subrace', e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.375rem',
              border: '1px solid var(--background-modifier-border)',
              background: 'var(--background-modifier-form-field)',
              color: 'var(--text-normal)',
              fontSize: '0.875rem',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="">Choose a subrace...</option>
            {selectedRace.subraces.map(sub => (
              <option key={sub} value={sub.toLowerCase().replace(/\s+/g, '-')}>
                {sub}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
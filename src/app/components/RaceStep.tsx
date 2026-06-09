import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormControl, FormMessage } from './ui/form';
import { Check } from 'lucide-react';
import { RACE_DATA } from '../utils/dnd-data';

export function RaceStep() {
  const { control, watch, setValue } = useFormContext();

  const currentRace = watch('race');
  const currentSubrace = watch('subrace');

  const selectedRace = currentRace ? RACE_DATA[currentRace] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <FormField control={control} name="race" render={({ field }) => (
        <FormItem>
          <FormControl>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.625rem' }}>
              {Object.entries(RACE_DATA).map(([id, data]) => {
                const isSelected = field.value === id;
                return (
                  <div
                    key={id}
                    role="button"
                    onClick={() => {
                        field.onChange(id);
                        setValue('subrace', ''); // Reset subrace when race change
                    }}
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
                      src={data.image}
                      alt={data.name}
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
                        {data.name}
                      </div>
                      <div style={{
                        fontSize: '0.7rem', color: 'var(--text-muted)',
                        overflow: 'hidden', display: '-webkit-box',
                        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      }}>
                        {data.description}
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

      {/* Subrace Selection logic driven by RACE_DATA */}
      {selectedRace?.subraces && (
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
              minHeight: '36px',
              lineHeight: '1.5',
              boxSizing: 'border-box',
              appearance: 'auto',
            }}
          >
            <option value="">Choose a subrace...</option>
            {
            Object.entries(selectedRace.subraces).map(([subId, subData]: [string, any]) => (
              <option key={subId} value={subId}>
                {subData.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
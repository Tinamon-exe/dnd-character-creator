import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { User, Trophy, Info, Camera, X, Move, Loader2 } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from './ui/form';
import { Notice } from 'obsidian';

function NativeSlider({ value, min, max, step = 1, onChange }: {
  value: number; min: number; max: number; step?: number; onChange: (val: number) => void;
}) {
  return (
    <input
      type="range"
      min={min} max={max} step={step}
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      style={{
        width: '100%',
        accentColor: 'var(--interactive-accent)',
        cursor: 'pointer',
        height: '4px',
      }}
    />
  );
}

export function BasicsStep() {
  const { control, setValue, watch } = useFormContext();
  const formData = watch();
  const [isUploading, setIsUploading] = React.useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const reader = new FileReader();
        reader.onloadend = () => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width, height = img.height;
            const MAX = 800;
            if (width > height) { if (width > MAX) { height *= MAX / width; width = MAX; } }
            else { if (height > MAX) { width *= MAX / height; height = MAX; } }
            canvas.width = width; canvas.height = height;
            canvas.getContext('2d')?.drawImage(img, 0, 0, width, height);
            setValue('image', canvas.toDataURL('image/jpeg', 0.8));
            setValue('imageX', 50); setValue('imageY', 50); setValue('imageScale', 100);
            setIsUploading(false);
            new Notice('✅ Portrait captured and optimized');
          };
          img.src = reader.result as string;
        };
        reader.readAsDataURL(file);
      } catch {
        new Notice('❌ Failed to process image');
        setIsUploading(false);
      }
    }
  };

  return (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>

      {/* LEFT: Photo */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flexShrink: 0 }}>
        <div style={{ position: 'relative' }} className="group">
          <div style={{
            width: '12rem', height: '12rem', borderRadius: '1rem',
            border: '2px dashed var(--interactive-accent)',
            overflow: 'hidden', position: 'relative',
            background: 'var(--background-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {isUploading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <Loader2 style={{ width: '2.5rem', height: '2.5rem', opacity: 0.5, color: 'var(--interactive-accent)' }} className="animate-spin" />
                <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Uploading...</span>
              </div>
            ) : formData.image ? (
              <>
                <div style={{
                  width: '100%', height: '100%',
                  backgroundImage: `url(${formData.image})`,
                  backgroundPosition: `${formData.imageX || 50}% ${formData.imageY || 50}%`,
                  backgroundSize: `${formData.imageScale || 100}%`,
                  backgroundRepeat: 'no-repeat',
                }} />
                <div
                  role="button"
                  onClick={() => setValue('image', '')}
                  style={{
                    position: 'absolute', top: '0.5rem', right: '0.5rem',
                    background: 'var(--color-red)', borderRadius: '0.375rem',
                    padding: '0.25rem', cursor: 'pointer', display: 'flex',
                    color: 'white',
                  }}
                >
                  <X style={{ width: '1rem', height: '1rem' }} />
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-muted)', padding: '1rem', textAlign: 'center' }}>
                <Camera style={{ width: '2.5rem', height: '2.5rem', opacity: 0.2, marginBottom: '0.5rem' }} />
                <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Upload Portrait</span>
              </div>
            )}
            {!formData.image && !isUploading && (
              <input type="file" accept="image/*"
                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                onChange={handleImageChange} />
            )}
          </div>
        </div>

        {/* Image adjust sliders */}
        {formData.image && (
          <div style={{
            background: 'var(--background-secondary)',
            border: '1px solid var(--background-modifier-border)',
            borderRadius: '0.75rem', padding: '0.75rem',
            display: 'flex', flexDirection: 'column', gap: '0.75rem',
            width: '12rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Move style={{ width: '0.875rem', height: '0.875rem', color: 'var(--interactive-accent)' }} />
              <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Adjust Image</span>
            </div>
            {[
              { label: 'Horizontal', key: 'imageX',     min: 0,  max: 100, fallback: 50  },
              { label: 'Vertical',   key: 'imageY',     min: 0,  max: 100, fallback: 50  },
              { label: 'Scale',      key: 'imageScale', min: 50, max: 300, fallback: 100 },
            ].map(({ label, key, min, max, fallback }) => (
              <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  <span>{label}</span>
                  <span>{formData[key] ?? fallback}%</span>
                </div>
                <NativeSlider
                  value={formData[key] ?? fallback}
                  min={min} max={max}
                  onChange={(val) => setValue(key as any, val)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT: Name, Level, Info */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <FormField control={control} name="name" render={({ field }) => (
          <FormItem>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <User style={{ width: '1.25rem', height: '1.25rem', color: 'var(--interactive-accent)' }} />
              <FormLabel style={{ fontSize: '1rem', fontWeight: 600 }}>What is your hero's name?</FormLabel>
            </div>
            <FormControl>
              <Input placeholder="Enter character name..." {...field} style={{ fontSize: '1.25rem', height: '3rem' }} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={control} name="level" render={({ field }) => (
          <FormItem>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trophy style={{ width: '1.25rem', height: '1.25rem', color: 'var(--interactive-accent)' }} />
                <FormLabel style={{ fontSize: '1rem', fontWeight: 600 }}>Starting Level</FormLabel>
              </div>
              <span style={{
                border: '1px solid var(--background-modifier-border)',
                borderRadius: '0.375rem', padding: '0.25rem 0.75rem',
                fontFamily: 'monospace', fontSize: '1rem', fontWeight: 700,
              }}>
                Level {field.value}
              </span>
            </div>
            <FormControl>
              <div style={{ padding: '0 0.5rem' }}>
                <NativeSlider
                  value={field.value}
                  min={1} max={20} step={1}
                  onChange={(val) => { field.onChange(val); setValue('subclass', ''); }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: 500 }}>
                  <span>1</span><span>5</span><span>10</span><span>15</span><span>20</span>
                </div>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div style={{
          background: 'var(--background-secondary)',
          border: '1px solid var(--background-modifier-border)',
          borderRadius: '0.75rem', padding: '1rem',
          display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
        }}>
          <Info style={{ width: '1.25rem', height: '1.25rem', color: 'var(--interactive-accent)', flexShrink: 0, marginTop: '0.125rem' }} />
          <div style={{ fontSize: '0.875rem' }}>
            <p style={{ fontWeight: 600, color: 'var(--interactive-accent)', margin: '0 0 0.25rem' }}>Level Impact</p>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Your level determines proficiency bonus, spell slots, and class features.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
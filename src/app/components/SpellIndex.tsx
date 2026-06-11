import React, { useState } from 'react';
import { SPELL_DATA } from '../utils/dnd-data';
import { Search, Book, Info, Shield, Zap, Wind, Flame, Eye, Brain, Skull, Sparkles } from 'lucide-react';
import type { App as ObsidianApp } from 'obsidian';

const SCHOOL_ICONS: Record<string, React.ElementType> = {
  'Abjuration':    Shield,
  'Conjuration':   Wind,
  'Divination':    Eye,
  'Enchantment':   Brain,
  'Evocation':     Flame,
  'Illusion':      Zap,
  'Necromancy':    Skull,
  'Transmutation': Sparkles,
};

const SCHOOL_COLORS: Record<string, string> = {
  'Abjuration':    '#3b82f6',
  'Conjuration':   '#8b5cf6',
  'Divination':    '#06b6d4',
  'Enchantment':   '#ec4899',
  'Evocation':     '#ef4444',
  'Illusion':      '#6366f1',
  'Necromancy':    '#6b7280',
  'Transmutation': '#f59e0b',
};

const ALL_LEVELS  = ['cantrips','level1','level2','level3','level4','level5','level6','level7','level8','level9'];
const ALL_CLASSES = ['all','bard','cleric','druid','paladin','ranger','sorcerer','warlock','wizard'];

export function SpellIndex({ app, modal }: { app: ObsidianApp; modal: any }) {
  const [search,        setSearch]        = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [popover,       setPopover]       = useState<string | null>(null);

  const filterSpells = (levelSpells: any[]) =>
    levelSpells.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                          s.description.toLowerCase().includes(search.toLowerCase());
      const matchClass  = selectedClass === 'all' || s.classes.includes(selectedClass);
      return matchSearch && matchClass;
    });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '0.5rem' }}>

      {/* Header */}
      <div>
        <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <Book style={{ width: '1.5rem', height: '1.5rem', color: 'var(--interactive-accent)' }} />
          Spell Library
        </h1>
        <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Filter by class or search for specific effects
        </p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: 'var(--text-muted)', pointerEvents: 'none' }} />
        <input
          placeholder="Search spells by name or description..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: '0.625rem 0.75rem 0.625rem 2.25rem', borderRadius: '0.5rem', border: '1px solid var(--background-modifier-border)', background: 'var(--background-modifier-form-field)', color: 'var(--text-normal)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      {/* Class filter pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
        {ALL_CLASSES.map(c => (
          <div
            key={c}
            role="button"
            onClick={() => setSelectedClass(c)}
            style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '999px',
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'capitalize',
              cursor: 'pointer',
              border: '1px solid var(--background-modifier-border)',
              background: selectedClass === c ? 'var(--interactive-accent)' : 'var(--background-modifier-form-field)',
              color:      selectedClass === c ? '#fff'                       : 'var(--text-muted)',
            }}
          >
            {c}
          </div>
        ))}
      </div>

      {/* Spell levels */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '2rem' }}>
        {ALL_LEVELS.map(lvl => {
          const levelSpells = (SPELL_DATA as any)[lvl] || [];
          const filtered    = filterSpells(levelSpells);
          if (filtered.length === 0) return null;

          const label = lvl === 'cantrips' ? 'Cantrips' : `Level ${lvl.replace('level', '')}`;

          return (
            <div key={lvl}>
              {/* Section heading */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.01em', color: 'var(--interactive-accent)' }}>
                  {label}
                </h2>
                <div style={{ flex: 1, height: '1px', background: 'var(--background-modifier-border)' }} />
                <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.125rem 0.5rem', borderRadius: '999px', border: '1px solid var(--background-modifier-border)', color: 'var(--text-muted)' }}>
                  {filtered.length} spells
                </span>
              </div>

              {/* Spell grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                {filtered.map((spell: any) => {
                  const Icon  = SCHOOL_ICONS[spell.school] || Book;
                  const color = SCHOOL_COLORS[spell.school] || 'var(--interactive-accent)';
                  const key   = `${lvl}-${spell.id}`;
                  const open  = popover === key;

                  return (
                    <div
                      key={spell.id}
                      style={{ border: '1px solid var(--background-modifier-border)', borderRadius: '0.75rem', background: 'var(--background-primary)', overflow: 'visible', position: 'relative', display: 'flex', flexDirection: 'column' }}
                    >
                      {/* Card header */}
                      <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--background-modifier-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                          <div style={{ width: '2rem', height: '2rem', borderRadius: '0.375rem', background: `${color}22`, border: `1px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Icon style={{ width: '1rem', height: '1rem', color }} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{spell.name}</div>
                            <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color }}>{spell.school}</div>
                          </div>
                        </div>

                        {/* Info button */}
                        <div
                          role="button"
                          onClick={() => setPopover(open ? null : key)}
                          style={{ width: '1.5rem', height: '1.5rem', borderRadius: '0.25rem', cursor: 'pointer', border: '1px solid var(--background-modifier-border)', background: 'var(--background-modifier-form-field)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                        >
                          <Info style={{ width: '0.75rem', height: '0.75rem' }} />
                        </div>
                      </div>

                      {/* Description preview */}
                      <div style={{ padding: '0.625rem 0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
                        {spell.description}
                      </div>

                      {/* Class pills */}
                      <div style={{ padding: '0 0.75rem 0.625rem', display: 'flex', flexWrap: 'wrap', gap: '0.2rem' }}>
                        {spell.classes.slice(0, 3).map((c: string) => (
                          <span key={c} style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'capitalize', color: 'var(--interactive-accent)', opacity: 0.7 }}>{c}</span>
                        ))}
                        {spell.classes.length > 3 && (
                          <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--interactive-accent)', opacity: 0.7 }}>+{spell.classes.length - 3}</span>
                        )}
                      </div>

                      {/* Popover detail */}
                      {open && (
                        <div style={{ position: 'absolute', top: '100%', right: 0, zIndex: 50, width: '18rem', background: 'var(--background-primary)', border: '1px solid var(--background-modifier-border)', borderRadius: '0.75rem', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', padding: '0.875rem', marginTop: '0.25rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--background-modifier-border)' }}>
                            <span style={{ fontWeight: 900, fontSize: '0.8rem', textTransform: 'uppercase' }}>{spell.name}</span>
                            <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', padding: '0.125rem 0.4rem', borderRadius: '999px', background: `${color}22`, color }}>{spell.school}</span>
                          </div>
                          <p style={{ margin: '0 0 0.625rem', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{spell.description}</p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                            {spell.classes.map((c: string) => (
                              <span key={c} style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: '999px', border: '1px solid var(--background-modifier-border)', color: 'var(--text-muted)', textTransform: 'capitalize', background: 'var(--background-secondary)' }}>{c}</span>
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

    </div>
  );
}
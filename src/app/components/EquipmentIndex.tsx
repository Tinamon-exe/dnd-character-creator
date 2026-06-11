import React, { useState } from 'react';
import { EQUIPMENT_DATA } from '../utils/dnd-data';
import { Search, Package, Info, Coins, Weight } from 'lucide-react';
import type { App as ObsidianApp } from 'obsidian';

export function EquipmentIndex({ app, modal }: { app: ObsidianApp; modal: any }) {
  const [search,  setSearch]  = useState('');
  const [popover, setPopover] = useState<string | null>(null);

  const filteredItems = Object.entries(EQUIPMENT_DATA).filter(([name, data]: [string, any]) =>
    name.toLowerCase().includes(search.toLowerCase()) ||
    (data.description && data.description.toLowerCase().includes(search.toLowerCase())) ||
    data.properties.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '0.5rem' }}>

      {/* Header */}
      <div>
        <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <Package style={{ width: '1.5rem', height: '1.5rem', color: 'var(--interactive-accent)' }} />
          Equipment Index
        </h1>
        <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Weapons, armour, and adventuring gear
        </p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: 'var(--text-muted)', pointerEvents: 'none' }} />
        <input
          placeholder="Search items by name, property, or description..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: '0.625rem 0.75rem 0.625rem 2.25rem', borderRadius: '0.5rem', border: '1px solid var(--background-modifier-border)', background: 'var(--background-modifier-form-field)', color: 'var(--text-normal)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      {/* Result count */}
      {search && (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} found
        </div>
      )}

      {/* Grid */}
      {filteredItems.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', paddingBottom: '2rem' }}>
          {filteredItems.map(([name, data]: [string, any]) => {
            const open = popover === name;
            return (
              <div
                key={name}
                style={{ border: '1px solid var(--background-modifier-border)', borderRadius: '0.75rem', background: 'var(--background-primary)', position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'visible' }}
              >
                {/* Card header */}
                <div style={{ padding: '0.875rem', background: 'var(--background-secondary)', borderBottom: '1px solid var(--background-modifier-border)', borderRadius: '0.75rem 0.75rem 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 900, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                        <Coins style={{ width: '0.75rem', height: '0.75rem', color: '#ca8a04' }} />
                        {data.cost}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                        <Weight style={{ width: '0.75rem', height: '0.75rem' }} />
                        {data.weight}
                      </span>
                    </div>
                  </div>

                  {/* Info button */}
                  <div
                    role="button"
                    onClick={() => setPopover(open ? null : name)}
                    style={{ width: '1.75rem', height: '1.75rem', borderRadius: '0.375rem', cursor: 'pointer', border: '1px solid var(--background-modifier-border)', background: 'var(--background-modifier-form-field)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                  >
                    <Info style={{ width: '0.875rem', height: '0.875rem' }} />
                  </div>
                </div>

                {/* Properties tag */}
                <div style={{ margin: '0.625rem 0.75rem 0', padding: '0.375rem 0.625rem', background: 'var(--background-modifier-form-field)', border: '1px dashed var(--background-modifier-border)', borderRadius: '0.375rem', fontSize: '0.7rem', fontStyle: 'italic', color: 'var(--interactive-accent)', lineHeight: 1.4 }}>
                  {data.properties}
                </div>

                {/* Description */}
                <div style={{ padding: '0.5rem 0.75rem 0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {data.description || 'No description available.'}
                </div>

                {/* Popover detail */}
                {open && (
                  <div style={{ position: 'absolute', top: '100%', right: 0, zIndex: 50, width: '18rem', background: 'var(--background-primary)', border: '1px solid var(--background-modifier-border)', borderRadius: '0.75rem', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', padding: '0.875rem', marginTop: '0.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--background-modifier-border)' }}>
                      <span style={{ fontWeight: 900, fontSize: '0.8rem', textTransform: 'uppercase' }}>{name}</span>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <span style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: '999px', border: '1px solid var(--background-modifier-border)', color: 'var(--text-muted)', background: 'var(--background-secondary)' }}>{data.cost}</span>
                        <span style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: '999px', border: '1px solid var(--background-modifier-border)', color: 'var(--text-muted)', background: 'var(--background-secondary)' }}>{data.weight}</span>
                      </div>
                    </div>
                    <p style={{ margin: '0 0 0.625rem', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                      {data.description || 'No detailed description available.'}
                    </p>
                    <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--background-modifier-border)' }}>
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Properties</div>
                      <div style={{ fontSize: '0.75rem', fontStyle: 'italic', color: 'var(--interactive-accent)' }}>{data.properties}</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', border: '1px dashed var(--background-modifier-border)', borderRadius: '0.75rem', background: 'var(--background-secondary)' }}>
          <Package style={{ width: '3rem', height: '3rem', margin: '0 auto 1rem', opacity: 0.2, color: 'var(--text-muted)' }} />
          <div style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--text-muted)' }}>No items found</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>Try a different search term</div>
        </div>
      )}

    </div>
  );
}
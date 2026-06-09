import React from 'react';
import { useFormContext } from 'react-hook-form';
import { X, Plus } from 'lucide-react';
import { BACKGROUND_DATA, FEAT_DATA } from '../utils/dnd-data';

const ALIGNMENTS = [
  'Lawful Good',
  'Neutral Good',
  'Chaotic Good',
  'Lawful Neutral',
  'True Neutral',
  'Chaotic Neutral',
  'Lawful Evil',
  'Neutral Evil',
  'Chaotic Evil',
];

export function DetailsStep() {
  const { watch, setValue, register } = useFormContext();

  const background = watch('background');
  const traits = watch('traits') || [];
  const feats = watch('feats') || [];

  const [newTrait, setNewTrait] = React.useState('');
  const [showFeatMenu, setShowFeatMenu] = React.useState(false);

  const handleAddTrait = () => {
    const trimmed = newTrait.trim();

    if (!trimmed) return;

    setValue('traits', [...traits, trimmed]);
    setNewTrait('');
  };

  const removeTrait = (trait: string) => {
    setValue(
      'traits',
      traits.filter((t: string) => t !== trait)
    );
  };

  const toggleFeat = (feat: string) => {
    if (feats.includes(feat)) {
      setValue(
        'feats',
        feats.filter((f: string) => f !== feat)
      );
    } else {
      setValue('feats', [...feats, feat]);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
      }}
    >
      {/* TOP GRID */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px',
        }}
      >
        {/* BACKGROUND */}
        <div>
          <label
            style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: 600,
            }}
          >
            Background
          </label>

          <select
            {...register('background')}
            style={selectStyle}
          >
            <option value="">
              Select a background...
            </option>

            {Object.keys(BACKGROUND_DATA).map((bg) => (
              <option key={bg} value={bg}>
                {bg.replace('_', ' ')}
              </option>
            ))}
          </select>

          {background && (
            <div
              style={{
                marginTop: '6px',
                fontSize: '12px',
                color: 'var(--text-muted)',
              }}
            >
              Grants proficiency in:{' '}
              {BACKGROUND_DATA[background].skills.join(
                ', '
              )}
            </div>
          )}
        </div>

        {/* ALIGNMENT */}
        <div>
          <label
            style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: 600,
            }}
          >
            Alignment
          </label>

          <select
            {...register('alignment')}
            style={selectStyle}
          >
            <option value="">
              Select alignment...
            </option>

            {ALIGNMENTS.map((alignment) => (
              <option
                key={alignment}
                value={alignment
                  .toLowerCase()
                  .replace(/\s+/g, '-')}
              >
                {alignment}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TRAITS */}
      <div>
        <div
          style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '10px',
            color: 'var(--interactive-accent)',
          }}
        >
          Custom Traits & Abilities
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '12px',
          }}
        >
          {traits.map((trait: string) => (
            <div
              key={trait}
              style={chipStyle}
            >
              <span>{trait}</span>

              <button
                type="button"
                onClick={() => removeTrait(trait)}
                style={iconButtonStyle} onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--text-error)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-muted)';
                }}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
          }}
        >
          <input
            type="text"
            placeholder="Add trait..."
            value={newTrait}
            onChange={(e) =>
              setNewTrait(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTrait();
              }
            }}
            style={{
              flex: 1,
              padding: '8px 10px',
              borderRadius: '8px',
              border:
                '1px solid var(--background-modifier-border)',
              background:
                'var(--background-primary)',
            }}
          />

          <button
            type="button"
            onClick={handleAddTrait}
            style={actionButtonStyle}
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* FEATS */}
      <div>
        <div
          style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '10px',
            color: 'var(--interactive-accent)',
          }}
        >
          Feats
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '12px',
          }}
        >
          {feats.map((feat: string) => (
            <div
              key={feat}
              style={{
                ...chipStyle,
              //   background:
              //     'var(--interactive-accent)',
              //   color: 'var(--text-on-accent)',
              }}
            >
              <span>{feat}</span>

              <button
                type="button"
                onClick={() => toggleFeat(feat)}
                style={{
                  ...iconButtonStyle,
                  // color: 'inherit',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--text-error)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-muted)';
                }}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* SIMPLE DROPDOWN */}
        <div
          style={{
            position: 'relative',
          }}
        >
          <button
            type="button"
            onClick={() =>
              setShowFeatMenu(!showFeatMenu)
            }
            style={{
              ...actionButtonStyle,
              width: '100%',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <Plus size={14} />
            Select Feat
          </button>

          {showFeatMenu && (
            <div
              style={{
                position: 'absolute',
                top: '110%',
                left: 0,
                width: '100%',
                maxHeight: '220px',
                overflowY: 'auto',
                zIndex: 1000,
                borderRadius: '10px',
                border:
                  '1px solid var(--background-modifier-border)',
                background:
                  'var(--background-primary)',
                boxShadow:
                  '0 6px 24px rgba(0,0,0,0.25)',
                padding: '6px',
              }}
            >
              {FEAT_DATA.map((feat) => {
                const active = feats.includes(feat);

                return (
                  <button
                    key={feat}
                    type="button"
                    onClick={() => toggleFeat(feat)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      background: active
                        ? 'var(--background-modifier-hover)'
                        : 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    {feat}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* BACKSTORY */}
      <div>
        <label
          htmlFor="backstory"
          style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: 600,
          }}
        >
          Backstory (Optional)
        </label>

        <textarea
          id="backstory"
          {...register('backstory')}
          placeholder="Write a brief backstory..."
          style={{
            width: '100%',
            minHeight: '140px',
            resize: 'vertical',
            padding: '12px',
            borderRadius: '10px',
            border:
              '1px solid var(--background-modifier-border)',
            background:
              'var(--background-primary)',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
          }}
        />
      </div>
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  width: '100%',
  // minHeight: '36px',
  // padding: '6px 12px',
  // borderRadius: '8px',
  // border: '1px solid var(--background-modifier-border)',
  // background: 'var(--background-primary)',
  // color: 'var(--text-normal)',
  // fontSize: '14px',
  // lineHeight: '1.5',
  // boxSizing: 'border-box',

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
};

const chipStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 10px',
  borderRadius: '999px',
  background: 'var(--background-secondary)',
  fontSize: '12px',
};

const iconButtonStyle: React.CSSProperties = {
  border: 'none',
  background: 'none',
  outline: 'none',
  boxShadow: 'none',
  padding: 0,
  margin: 0,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--text-muted)',
  transition: 'color 0.15s ease',
};

const actionButtonStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '8px 12px',
  borderRadius: '8px',
  border: '1px solid var(--background-modifier-border)',
  background: 'var(--background-secondary)',
  cursor: 'pointer',
};
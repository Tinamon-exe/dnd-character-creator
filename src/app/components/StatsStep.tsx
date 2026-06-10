import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Minus, Plus, Info, AlertCircle } from 'lucide-react';
import { CLASS_DATA , POINT_COSTS , STATS} from '../utils/dnd-data';

export function StatsStep() {
  const { watch, setValue } = useFormContext();
  const formData = watch();
  const [tooltip, setTooltip] = React.useState<string | null>(null);

  const classInfo = CLASS_DATA[formData.class];
  const primaryAbility = classInfo?.spellcasting?.ability || (
    ['barbarian', 'fighter', 'paladin'].includes(formData.class) ? 'str' :
    ['rogue', 'monk', 'ranger'].includes(formData.class)         ? 'dex' : 'int'
  );

  const getASIBonus = () => {
    let count = Math.floor(formData.level / 4);
    if (formData.class === 'fighter') {
      if (formData.level >= 6)  count++;
      if (formData.level >= 14) count++;
    }
    if (formData.class === 'rogue' && formData.level >= 10) count++;
    return count * 2;
  };

  const totalBudget = 27 + getASIBonus() * 4;
  const calculatePointsUsed = (stats: any) =>
    Object.values(stats).reduce((acc: number, val: any) => acc + (POINT_COSTS[val] || 0), 0);
  const currentPointsUsed = calculatePointsUsed(formData.stats);
  const remainingPoints   = totalBudget - currentPointsUsed;

  const handleStatChange = (stat: string, delta: number) => {
    const current = formData.stats[stat];
    const next    = current + delta;
    const maxVal  = formData.level >= 4 ? 20 : 15;
    if (next < 8 || next > maxVal) return;
    const newStats  = { ...formData.stats, [stat]: next };
    const newPoints = calculatePointsUsed(newStats);
    if (newPoints <= totalBudget || delta < 0) {
      setValue(`stats.${stat}` as any, next, { shouldValidate: true });
    }
  };

  const getModifier = (value: number) => {
    const mod = Math.floor((value - 10) / 2);
    return mod >= 0 ? `+${mod}` : String(mod);
  };

  // ── shared styles ──
  const iconBtn = (enabled: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: '2rem', height: '2rem', borderRadius: '50%',
    border: '2px solid var(--background-modifier-border)',
    background: enabled ? 'var(--background-modifier-form-field)' : 'var(--background-secondary)',
    color: enabled ? 'var(--text-normal)' : 'var(--text-faint)',
    cursor: enabled ? 'pointer' : 'not-allowed',
    flexShrink: 0,
    transition: 'background 0.15s, border-color 0.15s',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* ── Header bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.75rem 1rem',
        background: 'var(--background-secondary)',
        border: '1px solid var(--background-modifier-border)',
        borderRadius: '0.75rem',
        gap: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '2.75rem', height: '2.75rem', borderRadius: '0.625rem',
            background: 'var(--background-modifier-form-field)',
            border: '1px solid var(--background-modifier-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.25rem',
          }}>
            {formData.class === 'fighter' ? '⚔️' : formData.class === 'wizard' ? '🧙' : '🛡️'}
          </div>
          <div>
            <div style={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '-0.01em', color: 'var(--interactive-accent)' }}>
              {formData.class}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Primary: <span style={{ color: 'var(--interactive-accent)' }}>{primaryAbility}</span>
              {' '}· Budget: {totalBudget}
            </div>
          </div>
        </div>

        <div style={{
          padding: '0.375rem 0.875rem',
          borderRadius: '999px',
          fontWeight: 900, fontSize: '1rem',
          border: '2px solid ' + (remainingPoints < 0 ? '#ef4444' : remainingPoints === 0 ? 'var(--interactive-accent)' : 'var(--background-modifier-border)'),
          color: remainingPoints < 0 ? '#ef4444' : remainingPoints === 0 ? 'var(--interactive-accent)' : 'var(--text-normal)',
          background: 'var(--background-primary)',
          minWidth: '5rem', textAlign: 'center',
        }}>
          {remainingPoints} Left
        </div>
      </div>

      {/* ── Stat cards grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
        {STATS.map((stat) => {
          const val        = formData.stats[stat.id];
          const maxVal     = formData.level >= 4 ? 20 : 15;
          const costOfNext = (POINT_COSTS[val + 1] || 0) - (POINT_COSTS[val] || 0);
          const canIncrease = val < maxVal && remainingPoints >= costOfNext;
          const canDecrease = val > 8;
          const isPrimary   = stat.id === primaryAbility;
          const isSave      = classInfo?.saves?.includes(stat.id);
          const isTooltipOpen = tooltip === stat.id;

          return (
            <div
              key={stat.id}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: '0.625rem',
                border: `2px solid ${isPrimary ? 'var(--interactive-accent)' : 'var(--background-modifier-border)'}`,
                background: isPrimary ? 'var(--background-modifier-form-field)' : 'var(--background-primary)',
                gap: '0.75rem',
              }}
            >
              {/* Left: name + value */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: 0 }}>
                {/* Name row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.04em' }}>
                    <stat.lucid_icon size={12.5}/>
                  </span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                     {stat.name}
                  </span>
                  {isPrimary && (
                    <span style={{ fontSize: '0.55rem', fontWeight: 900, textTransform: 'uppercase', background: 'var(--interactive-accent)', color: '#fff', padding: '1px 5px', borderRadius: '3px' }}>
                      Main
                    </span>
                  )}
                  {isSave && (
                    <span style={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', border: '1px solid var(--background-modifier-border)', color: 'var(--text-muted)', padding: '1px 5px', borderRadius: '3px' }}>
                      Save
                    </span>
                  )}
                  {/* Inline tooltip trigger */}
                  <div style={{ position: 'relative', display: 'inline-flex' }}>
                    <Info
                      style={{ width: '0.75rem', height: '0.75rem', color: 'var(--text-muted)', cursor: 'help' }}
                      onMouseEnter={() => setTooltip(stat.id)}
                      onMouseLeave={() => setTooltip(null)}
                    />
                    {isTooltipOpen && (
                      <div style={{
                        position: 'absolute', bottom: '1.25rem', left: '50%', transform: 'translateX(-50%)',
                        background: 'var(--background-primary)',
                        border: '1px solid var(--background-modifier-border)',
                        borderRadius: '0.375rem', padding: '0.375rem 0.625rem',
                        fontSize: '0.7rem', color: 'var(--text-normal)',
                        whiteSpace: 'nowrap', zIndex: 100,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        pointerEvents: 'none',
                      }}>
                        {stat.description}
                      </div>
                    )}
                  </div>
                </div>

                {/* Value + modifier */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem' }}>
                  <span style={{ fontSize: '2.25rem', fontWeight: 900, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                    {val}
                  </span>
                  <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--interactive-accent)' }}>
                    {getModifier(val)}
                  </span>
                </div>
              </div>

              {/* Right: controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                <div
                  role="button"
                  onClick={() => canDecrease && handleStatChange(stat.id, -1)}
                  style={iconBtn(canDecrease)}
                >
                  <Minus style={{ width: '0.875rem', height: '0.875rem' }} />
                </div>

                <div style={{ width: '1.5rem', textAlign: 'center', fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                  {POINT_COSTS[val]}
                </div>

                <div
                  role="button"
                  onClick={() => canIncrease && handleStatChange(stat.id, 1)}
                  style={iconBtn(canIncrease)}
                >
                  <Plus style={{ width: '0.875rem', height: '0.875rem' }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Over-budget warning ── */}
      {remainingPoints < 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.75rem 1rem', borderRadius: '0.5rem',
          background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444',
          color: '#ef4444', fontSize: '0.875rem', fontWeight: 600,
        }}>
          <AlertCircle style={{ width: '1rem', height: '1rem', flexShrink: 0 }} />
          You have exceeded your point budget by {Math.abs(remainingPoints)} points!
        </div>
      )}
    </div>
  );
}




// import React from 'react';
// import { useFormContext } from 'react-hook-form';
// import { Minus, Plus, Info, AlertCircle } from 'lucide-react';
// import { CLASS_DATA } from '../utils/dnd-data';

// const STATS = [
//   { id: 'str', name: 'Strength',     icon: '💪', description: 'Physical might and athletic training.'                    },
//   { id: 'dex', name: 'Dexterity',    icon: '🏹', description: 'Agility, reflexes, and balance.'                         },
//   { id: 'con', name: 'Constitution', icon: '🛡️', description: 'Endurance, health, and vital force.'                     },
//   { id: 'int', name: 'Intelligence', icon: '🧠', description: 'Mental acuity, information recall, and analytical skill.' },
//   { id: 'wis', name: 'Wisdom',       icon: '🦉', description: 'Awareness, intuition, and insight.'                      },
//   { id: 'cha', name: 'Charisma',     icon: '✨', description: 'Confidence, eloquence, and leadership.'                  },
// ];

// const POINT_COSTS: Record<number, number> = {
//   8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9,
//   16: 12, 17: 15, 18: 19, 19: 23, 20: 28,
// };

// export function StatsStep() {
//   const { watch, setValue } = useFormContext();
//   const formData = watch();
//   const [tooltip, setTooltip] = React.useState<string | null>(null);

//   const classInfo = CLASS_DATA[formData.class];
//   const primaryAbility = classInfo?.spellcasting?.ability || (
//     ['barbarian', 'fighter', 'paladin'].includes(formData.class) ? 'str' :
//     ['rogue', 'monk', 'ranger'].includes(formData.class)         ? 'dex' : 'int'
//   );

//   const getASIBonus = () => {
//     let count = Math.floor(formData.level / 4);
//     if (formData.class === 'fighter') {
//       if (formData.level >= 6)  count++;
//       if (formData.level >= 14) count++;
//     }
//     if (formData.class === 'rogue' && formData.level >= 10) count++;
//     return count * 2;
//   };

//   const totalBudget = 27 + getASIBonus() * 4;
//   const calculatePointsUsed = (stats: any) =>
//     Object.values(stats).reduce((acc: number, val: any) => acc + (POINT_COSTS[val] || 0), 0);
//   const currentPointsUsed = calculatePointsUsed(formData.stats);
//   const remainingPoints   = totalBudget - currentPointsUsed;

//   const handleStatChange = (stat: string, delta: number) => {
//     const current = formData.stats[stat];
//     const next    = current + delta;
//     const maxVal  = formData.level >= 4 ? 20 : 15;
//     if (next < 8 || next > maxVal) return;
//     const newStats  = { ...formData.stats, [stat]: next };
//     const newPoints = calculatePointsUsed(newStats);
//     if (newPoints <= totalBudget || delta < 0) {
//       setValue(`stats.${stat}` as any, next, { shouldValidate: true });
//     }
//   };

//   const getModifier = (value: number) => {
//     const mod = Math.floor((value - 10) / 2);
//     return mod >= 0 ? `+${mod}` : String(mod);
//   };

//   // ── shared styles ──
//   const iconBtn = (enabled: boolean): React.CSSProperties => ({
//     display: 'flex', alignItems: 'center', justifyContent: 'center',
//     width: '2rem', height: '2rem', borderRadius: '50%',
//     border: '2px solid var(--background-modifier-border)',
//     background: enabled ? 'var(--background-modifier-form-field)' : 'var(--background-secondary)',
//     color: enabled ? 'var(--text-normal)' : 'var(--text-faint)',
//     cursor: enabled ? 'pointer' : 'not-allowed',
//     flexShrink: 0,
//     transition: 'background 0.15s, border-color 0.15s',
//   });

//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

//       {/* ── Header bar ── */}
//       <div style={{
//         display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//         padding: '0.75rem 1rem',
//         background: 'var(--background-secondary)',
//         border: '1px solid var(--background-modifier-border)',
//         borderRadius: '0.75rem',
//         gap: '1rem',
//       }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
//           <div style={{
//             width: '2.75rem', height: '2.75rem', borderRadius: '0.625rem',
//             background: 'var(--background-modifier-form-field)',
//             border: '1px solid var(--background-modifier-border)',
//             display: 'flex', alignItems: 'center', justifyContent: 'center',
//             fontSize: '1.25rem',
//           }}>
//             {formData.class === 'fighter' ? '⚔️' : formData.class === 'wizard' ? '🧙' : '🛡️'}
//           </div>
//           <div>
//             <div style={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '-0.01em', color: 'var(--interactive-accent)' }}>
//               {formData.class}
//             </div>
//             <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
//               Primary: <span style={{ color: 'var(--interactive-accent)' }}>{primaryAbility}</span>
//               {' '}· Budget: {totalBudget}
//             </div>
//           </div>
//         </div>

//         <div style={{
//           padding: '0.375rem 0.875rem',
//           borderRadius: '999px',
//           fontWeight: 900, fontSize: '1rem',
//           border: '2px solid ' + (remainingPoints < 0 ? '#ef4444' : remainingPoints === 0 ? 'var(--interactive-accent)' : 'var(--background-modifier-border)'),
//           color: remainingPoints < 0 ? '#ef4444' : remainingPoints === 0 ? 'var(--interactive-accent)' : 'var(--text-normal)',
//           background: 'var(--background-primary)',
//           minWidth: '5rem', textAlign: 'center',
//         }}>
//           {remainingPoints} Left
//         </div>
//       </div>

//       {/* ── Stat cards grid ── */}
//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
//         {STATS.map((stat) => {
//           const val        = formData.stats[stat.id];
//           const maxVal     = formData.level >= 4 ? 20 : 15;
//           const costOfNext = (POINT_COSTS[val + 1] || 0) - (POINT_COSTS[val] || 0);
//           const canIncrease = val < maxVal && remainingPoints >= costOfNext;
//           const canDecrease = val > 8;
//           const isPrimary   = stat.id === primaryAbility;
//           const isSave      = classInfo?.saves?.includes(stat.id);
//           const isTooltipOpen = tooltip === stat.id;

//           return (
//             <div
//               key={stat.id}
//               style={{
//                 display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//                 padding: '0.75rem 1rem',
//                 borderRadius: '0.625rem',
//                 border: `2px solid ${isPrimary ? 'var(--interactive-accent)' : 'var(--background-modifier-border)'}`,
//                 background: isPrimary ? 'var(--background-modifier-form-field)' : 'var(--background-primary)',
//                 gap: '0.75rem',
//               }}
//             >
//               {/* Left: name + value */}
//               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: 0 }}>
//                 {/* Name row */}
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
//                   <span style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
//                     {stat.icon} {stat.name}
//                   </span>
//                   {isPrimary && (
//                     <span style={{ fontSize: '0.55rem', fontWeight: 900, textTransform: 'uppercase', background: 'var(--interactive-accent)', color: '#fff', padding: '1px 5px', borderRadius: '3px' }}>
//                       Main
//                     </span>
//                   )}
//                   {isSave && (
//                     <span style={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', border: '1px solid var(--background-modifier-border)', color: 'var(--text-muted)', padding: '1px 5px', borderRadius: '3px' }}>
//                       Save
//                     </span>
//                   )}
//                   {/* Inline tooltip trigger */}
//                   <div style={{ position: 'relative', display: 'inline-flex' }}>
//                     <Info
//                       style={{ width: '0.75rem', height: '0.75rem', color: 'var(--text-muted)', cursor: 'help' }}
//                       onMouseEnter={() => setTooltip(stat.id)}
//                       onMouseLeave={() => setTooltip(null)}
//                     />
//                     {isTooltipOpen && (
//                       <div style={{
//                         position: 'absolute', bottom: '1.25rem', left: '50%', transform: 'translateX(-50%)',
//                         background: 'var(--background-primary)',
//                         border: '1px solid var(--background-modifier-border)',
//                         borderRadius: '0.375rem', padding: '0.375rem 0.625rem',
//                         fontSize: '0.7rem', color: 'var(--text-normal)',
//                         whiteSpace: 'nowrap', zIndex: 100,
//                         boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
//                         pointerEvents: 'none',
//                       }}>
//                         {stat.description}
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 {/* Value + modifier */}
//                 <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem' }}>
//                   <span style={{ fontSize: '2.25rem', fontWeight: 900, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
//                     {val}
//                   </span>
//                   <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--interactive-accent)' }}>
//                     {getModifier(val)}
//                   </span>
//                 </div>
//               </div>

//               {/* Right: controls */}
//               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
//                 <div
//                   role="button"
//                   onClick={() => canDecrease && handleStatChange(stat.id, -1)}
//                   style={iconBtn(canDecrease)}
//                 >
//                   <Minus style={{ width: '0.875rem', height: '0.875rem' }} />
//                 </div>

//                 <div style={{ width: '1.5rem', textAlign: 'center', fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
//                   {POINT_COSTS[val]}
//                 </div>

//                 <div
//                   role="button"
//                   onClick={() => canIncrease && handleStatChange(stat.id, 1)}
//                   style={iconBtn(canIncrease)}
//                 >
//                   <Plus style={{ width: '0.875rem', height: '0.875rem' }} />
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* ── Over-budget warning ── */}
//       {remainingPoints < 0 && (
//         <div style={{
//           display: 'flex', alignItems: 'center', gap: '0.5rem',
//           padding: '0.75rem 1rem', borderRadius: '0.5rem',
//           background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444',
//           color: '#ef4444', fontSize: '0.875rem', fontWeight: 600,
//         }}>
//           <AlertCircle style={{ width: '1rem', height: '1rem', flexShrink: 0 }} />
//           You have exceeded your point budget by {Math.abs(remainingPoints)} points!
//         </div>
//       )}
//     </div>
//   );
// }
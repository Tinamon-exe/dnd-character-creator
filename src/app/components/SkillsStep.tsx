import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Shield, Zap, Brain, Heart, Target, Info, Check, LucideIcon } from 'lucide-react';
import { CLASS_DATA, RACE_DATA, BACKGROUND_DATA , SKILLS, STATS} from '../utils/dnd-data';

export function SkillsStep() {

  const { watch, setValue } = useFormContext();
  const formData = watch();

  const classInfo      = CLASS_DATA[formData.class]      || { skillCount: 2, skillPool: [] };
  const raceInfo       = RACE_DATA[formData.race]        || { skills: [] };
  const backgroundInfo = BACKGROUND_DATA[formData.background] || { skills: [] };

  const racialSkills     = raceInfo.skills      || [];
  const backgroundSkills = backgroundInfo.skills || [];
  const classSkillPool   = classInfo.skillPool   || [];
  const allowedCount     = classInfo.skillCount  || 2;

  const autoSkills     = [...racialSkills, ...backgroundSkills];
  const selectedSkills = (formData.skills || []).filter((s: string) => !autoSkills.includes(s));
  const remaining      = allowedCount - selectedSkills.length;

  const toggleSkill = (skillId: string) => {
    if (autoSkills.includes(skillId)) return;
    const current = formData.skills || [];
    if (current.includes(skillId)) {
      setValue('skills', current.filter((id: string) => id !== skillId));
    } else if (remaining > 0) {
      setValue('skills', [...current, skillId]);
    }
  };

  React.useEffect(() => {
    const current    = formData.skills || [];
    const missingAuto = autoSkills.filter((s: string) => !current.includes(s));
    if (missingAuto.length > 0) {
      setValue('skills', Array.from(new Set([...current, ...autoSkills])));
    }
  }, [formData.race, formData.background]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.75rem 1rem',
        background: 'var(--background-secondary)',
        border: '1px solid var(--background-modifier-border)',
        borderRadius: '0.75rem',
      }}>
        <div>
          <div style={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.875rem', letterSpacing: '0.04em' }}>
            Skill Proficiencies
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Choose {classInfo.skillCount} from {formData.class || 'your class'}
          </div>
        </div>
        <div style={{
          padding: '0.375rem 0.875rem',
          borderRadius: '999px',
          fontWeight: 900, fontSize: '1rem',
          border: `2px solid ${remaining === 0 ? 'var(--interactive-accent)' : 'var(--background-modifier-border)'}`,
          color: remaining === 0 ? 'var(--interactive-accent)' : 'var(--text-normal)',
          background: 'var(--background-primary)',
          minWidth: '4.5rem', textAlign: 'center',
        }}>
          {remaining} Left
        </div>
      </div>

      {/* ── Auto-skill info pills ── */}
      {(racialSkills.length > 0 || backgroundSkills.length > 0) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {racialSkills.length > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              fontSize: '0.7rem', padding: '0.25rem 0.625rem',
              borderRadius: '0.375rem',
              background: 'var(--background-modifier-form-field)',
              border: '1px solid var(--interactive-accent)',
              color: 'var(--text-normal)',
            }}>
              <Info style={{ width: '0.75rem', height: '0.75rem', color: 'var(--interactive-accent)', flexShrink: 0 }} />
              <span>Race: <strong>{racialSkills.join(', ')}</strong></span>
            </div>
          )}
          {backgroundSkills.length > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              fontSize: '0.7rem', padding: '0.25rem 0.625rem',
              borderRadius: '0.375rem',
              background: 'var(--background-modifier-form-field)',
              border: '1px solid var(--background-modifier-border)',
              color: 'var(--text-normal)',
            }}>
              <Info style={{ width: '0.75rem', height: '0.75rem', color: 'var(--text-muted)', flexShrink: 0 }} />
              <span>Background: <strong>{backgroundSkills.join(', ')}</strong></span>
            </div>
          )}
        </div>
      )}

      {/* ── Skill grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        {SKILLS.map((skill) => {
          const isRacial      = racialSkills.includes(skill.id);
          const isBackground  = backgroundSkills.includes(skill.id);
          const isAuto        = isRacial || isBackground;
          const isFromPool    = classSkillPool.includes(skill.id);
          const isSelected    = (formData.skills || []).includes(skill.id);
          const isDisabled    = (!isSelected && remaining === 0) || isAuto || (!isFromPool && !isSelected);
          const Icon =  STATS.find( (stat) => stat.id.toUpperCase() === skill.stat )?.lucid_icon || Info;

          return (
            <div
              key={skill.id}
              role={isDisabled ? undefined : 'button'}
              onClick={() => !isDisabled && toggleSkill(skill.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.625rem',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.5rem',
                border: `2px solid ${isSelected ? 'var(--interactive-accent)' : 'var(--background-modifier-border)'}`,
                background: isSelected
                  ? 'var(--background-modifier-form-field)'
                  : 'var(--background-primary)',
                cursor: isDisabled ? 'default' : 'pointer',
                opacity: isDisabled && !isSelected ? 0.35 : 1,
                transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              {/* Custom checkbox */}
              <div style={{
                width: '1rem', height: '1rem', borderRadius: '0.25rem', flexShrink: 0,
                border: `2px solid ${isSelected ? 'var(--interactive-accent)' : 'var(--background-modifier-border)'}`,
                background: isSelected ? 'var(--interactive-accent)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {isSelected && <Check style={{ width: '0.6rem', height: '0.6rem', color: '#fff' }} />}
              </div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '0.8rem', fontWeight: isSelected ? 700 : 400,
                  color: isSelected ? 'var(--text-normal)' : 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap',
                }}>
                  {skill.name}
                  {isRacial && (
                    <span style={{ fontSize: '0.55rem', fontWeight: 900, textTransform: 'uppercase', background: 'var(--interactive-accent)', color: '#fff', padding: '1px 4px', borderRadius: '3px' }}>
                      Race
                    </span>
                  )}
                  {isBackground && (
                    <span style={{ fontSize: '0.55rem', fontWeight: 900, textTransform: 'uppercase', background: 'var(--background-modifier-border)', color: 'var(--text-muted)', padding: '1px 4px', borderRadius: '3px' }}>
                      BG
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-faint)', fontFamily: 'monospace', fontWeight: 700 }}>
                  {skill.stat}
                </div>
              </div>

              {/* Icon */}
              <Icon style={{
                width: '0.875rem', height: '0.875rem', flexShrink: 0,
                color: isSelected ? 'var(--interactive-accent)' : 'var(--text-faint)',
              }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}


// import React from 'react';
// import { useFormContext } from 'react-hook-form';
// import { Label } from './ui/label';
// import { Checkbox } from './ui/checkbox';
// import { Badge } from './ui/badge';
// import { Card, CardContent } from './ui/card';
// import { Shield, Zap, Brain, Heart, Target, Info } from 'lucide-react';
// import { CLASS_DATA, RACE_DATA, BACKGROUND_DATA } from '../utils/dnd-data';

// const SKILLS = [
//   { id: 'athletics', name: 'Athletics', stat: 'STR', icon: Shield },
//   { id: 'acrobatics', name: 'Acrobatics', stat: 'DEX', icon: Zap },
//   { id: 'sleight-of-hand', name: 'Sleight of Hand', stat: 'DEX', icon: Zap },
//   { id: 'stealth', name: 'Stealth', stat: 'DEX', icon: Zap },
//   { id: 'arcana', name: 'Arcana', stat: 'INT', icon: Brain },
//   { id: 'history', name: 'History', stat: 'INT', icon: Brain },
//   { id: 'investigation', name: 'Investigation', stat: 'INT', icon: Brain },
//   { id: 'nature', name: 'Nature', stat: 'INT', icon: Brain },
//   { id: 'religion', name: 'Religion', stat: 'INT', icon: Brain },
//   { id: 'animal-handling', name: 'Animal Handling', stat: 'WIS', icon: Heart },
//   { id: 'insight', name: 'Insight', stat: 'WIS', icon: Heart },
//   { id: 'medicine', name: 'Medicine', stat: 'WIS', icon: Heart },
//   { id: 'perception', name: 'Perception', stat: 'WIS', icon: Heart },
//   { id: 'survival', name: 'Survival', stat: 'WIS', icon: Heart },
//   { id: 'deception', name: 'Deception', stat: 'CHA', icon: Target },
//   { id: 'intimidation', name: 'Intimidation', stat: 'CHA', icon: Target },
//   { id: 'performance', name: 'Performance', stat: 'CHA', icon: Target },
//   { id: 'persuasion', name: 'Persuasion', stat: 'CHA', icon: Target },
// ];

// export function SkillsStep() {
//   const { watch, setValue } = useFormContext();
//   const formData = watch();

//   const classInfo = CLASS_DATA[formData.class] || { skillCount: 2, skillPool: [] };
//   const raceInfo = RACE_DATA[formData.race] || { skills: [] };
//   const backgroundInfo = BACKGROUND_DATA[formData.background] || { skills: [] };

//   const racialSkills = raceInfo.skills || [];
//   const backgroundSkills = backgroundInfo.skills || [];
//   const classSkillPool = classInfo.skillPool || [];
//   const allowedCount = classInfo.skillCount || 2;

//   // Selected skills (excluding racial and background)
//   const autoSkills = [...racialSkills, ...backgroundSkills];
//   const selectedSkills = (formData.skills || []).filter((s: string) => !autoSkills.includes(s));
//   const remaining = allowedCount - selectedSkills.length;

//   const toggleSkill = (skillId: string) => {
//     if (autoSkills.includes(skillId)) return; // Cannot toggle auto skills

//     const currentSkills = formData.skills || [];
//     if (currentSkills.includes(skillId)) {
//       setValue('skills', currentSkills.filter((id: string) => id !== skillId));
//     } else if (remaining > 0) {
//       setValue('skills', [...currentSkills, skillId]);
//     }
//   };

//   // Ensure auto skills are always in the list
//   React.useEffect(() => {
//     const currentSkills = formData.skills || [];
//     const missingAuto = autoSkills.filter((s: string) => !currentSkills.includes(s));
//     if (missingAuto.length > 0) {
//       setValue('skills', Array.from(new Set([...currentSkills, ...autoSkills])));
//     }
//   }, [formData.race, formData.background]);

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur py-4 z-10 border-b">
//         <div>
//           <h2 className="text-xl font-bold flex items-center gap-2 text-sm uppercase tracking-wider">Skill Proficiencies</h2>
//           <p className="text-[10px] text-muted-foreground uppercase tracking-tight">
//             {classInfo.skillCount} from {formData.class || 'Class'}
//           </p>
//         </div>
//         <Badge variant={remaining === 0 ? "default" : "outline"} className="text-lg px-3 py-1">
//           {remaining} Left
//         </Badge>
//       </div>

//       <div className="flex flex-wrap gap-2">
//         {racialSkills.length > 0 && (
//           <div className="flex items-center gap-2 text-[10px] bg-primary/5 px-2 py-1 rounded border border-primary/20">
//             <Info className="w-3 h-3 text-primary" />
//             <span>Race ({formData.race}): <strong>{racialSkills.join(', ')}</strong></span>
//           </div>
//         )}
//         {backgroundSkills.length > 0 && (
//           <div className="flex items-center gap-2 text-[10px] bg-blue-500/5 px-2 py-1 rounded border border-blue-500/20">
//             <Info className="w-3 h-3 text-blue-500" />
//             <span>Background ({formData.background}): <strong>{backgroundSkills.join(', ')}</strong></span>
//           </div>
//         )}
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//         {SKILLS.map((skill) => {
//           const isRacial = racialSkills.includes(skill.id);
//           const isBackground = backgroundSkills.includes(skill.id);
//           const isAuto = isRacial || isBackground;
//           const isFromClassPool = classSkillPool.includes(skill.id);
//           const isSelected = (formData.skills || []).includes(skill.id);
//           const isDisabled = (!isSelected && remaining === 0) || isAuto || (!isFromClassPool && !isSelected);
          
//           return (
//             <div 
//               key={skill.id}
//               className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
//                 isSelected ? 'border-primary bg-primary/5' : 'hover:bg-secondary/50'
//               } ${isDisabled && !isSelected ? 'opacity-40 grayscale pointer-events-none' : 'cursor-pointer'}`}
//               onClick={() => !isDisabled && toggleSkill(skill.id)}
//             >
//               <Checkbox 
//                 id={skill.id} 
//                 checked={isSelected}
//                 disabled={isDisabled}
//               />
//               <div className="flex-1 flex items-center justify-between">
//                 <div className="flex flex-col">
//                   <Label 
//                     htmlFor={skill.id} 
//                     className={`font-semibold cursor-pointer ${isDisabled && !isSelected ? 'cursor-not-allowed' : ''}`}
//                   >
//                     {skill.name}
//                     {isRacial && <span className="ml-2 text-[8px] bg-primary/20 text-primary px-1 rounded uppercase">Race</span>}
//                     {isBackground && <span className="ml-2 text-[8px] bg-blue-500/20 text-blue-500 px-1 rounded uppercase">BG</span>}
//                   </Label>
//                   <span className="text-[10px] text-muted-foreground font-mono">{skill.stat}</span>
//                 </div>
//                 <skill.icon className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-muted-foreground/40'}`} />
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

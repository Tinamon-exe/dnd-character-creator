import React from 'react';
import { useFormContext } from 'react-hook-form';
import { CLASS_DATA ,STATS} from '../utils/dnd-data';

export function ClassStep() {
  const { watch, setValue, register } = useFormContext();

  const currentClass = watch('class');
  const level = watch('level') || 1;

  const selectedClass = CLASS_DATA[currentClass];

  const getSubclassLevel = (classId: string) => {
    if (['cleric', 'sorcerer', 'warlock'].includes(classId)) return 1;
    if (['druid', 'wizard'].includes(classId)) return 2;
    return 3;
  };

  const isSubclassAvailable =
    selectedClass &&
    level >= getSubclassLevel(selectedClass.id);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      {/* CLASS GRID */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '12px',
        }}
      >
        {Object.entries(CLASS_DATA).map(([id, cls]) => { 
          const Icon = cls.icon;
          const isSelected = currentClass === id;
        // })}
        // {CLASSES.map((cls) => {
        //   const Icon = cls.icon;
        //   const isSelected = currentClass === cls.id;

          return (
            <div
              key={cls.id}
              onClick={() => {
                setValue('class', id);
                setValue('subclass', '');
              }}
              style={{
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
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--background-secondary)',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={22} />
                </div>

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '8px',
                      marginBottom: '6px',
                    }}
                  >
                    <strong>{cls.name}</strong>

                    <span
                      style={{
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '999px',
                        background:
                          'var(--interactive-accent-hover)',
                        color: 'var(--text-on-accent)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {cls.primary?.map((statId:any) => STATS.find((stat) => stat.id === statId)?.name).join(' & ')}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: '13px',
                      color: 'var(--text-muted)',
                      lineHeight: 1.4,
                    }}
                  >
                    {cls.description}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* SUBCLASS */}
      {selectedClass && (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
            }}
          >
            <label
              style={{
                fontWeight: 600,
              }}
            >
              Specialization
            </label>

            {!isSubclassAvailable && (
              <span
                style={{
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                }}
              >
                Unlocks at level{' '}
                {getSubclassLevel(selectedClass.id)}
              </span>
            )}
          </div>

          <select
            {...register('subclass')}
            disabled={!isSubclassAvailable}
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
            <option value="">
              {isSubclassAvailable
                ? 'Choose specialization...'
                : `Locked until level ${getSubclassLevel(
                  selectedClass.id
                )}`}
            </option>

            {selectedClass.subclasses.map((sub: string ) => (
              <option
                key={sub}
                value={sub.toLowerCase().replace(/\s+/g, '-')}
              >
                {sub}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}


// import React from 'react';
// import { useFormContext } from 'react-hook-form';
// import { Label } from './ui/label';
// import { Badge } from './ui/badge';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
// import { Card, CardContent } from './ui/card';
// import { Shield, Swords, Music, Zap, Skull, BookOpen, Target, Heart } from 'lucide-react';
// import { FormField, FormItem, FormControl, FormMessage, FormLabel } from './ui/form';

// const CLASSES = [
//   { 
//     id: 'barbarian', name: 'Barbarian', icon: Zap, description: 'A fierce warrior of primitive background who can enter a battle rage.', primary: 'Strength',
//     subclasses: ['Path of the Berserker', 'Path of the Totem Warrior']
//   },
//   { 
//     id: 'bard', name: 'Bard', icon: Music, description: 'An inspiring magician whose power echoes the music of creation.', primary: 'Charisma',
//     subclasses: ['College of Lore', 'College of Valor']
//   },
//   { 
//     id: 'cleric', name: 'Cleric', icon: Heart, description: 'A priestly champion who wields divine magic in service of a higher power.', primary: 'Wisdom',
//     subclasses: ['Life Domain', 'Light Domain', 'War Domain']
//   },
//   { id: 'druid', name: 'Druid', icon: Heart, description: 'A priest of the Old Faith, wielding the powers of nature and adopting animal forms.', primary: 'Wisdom', subclasses: ['Circle of the Land', 'Circle of the Moon'] },
//   { id: 'fighter', name: 'Fighter', icon: Swords, description: 'A master of martial combat, skilled with a variety of weapons and armor.', primary: 'Strength or Dexterity', subclasses: ['Champion', 'Battle Master', 'Eldritch Knight'] },
//   { id: 'monk', name: 'Monk', icon: Zap, description: 'A master of martial arts, harnessing the power of the body in pursuit of spiritual perfection.', primary: 'Dexterity & Wisdom', subclasses: ['Way of the Open Hand', 'Way of Shadow', 'Way of the Four Elements'] },
//   { id: 'paladin', name: 'Paladin', icon: Shield, description: 'A holy warrior bound to a sacred oath.', primary: 'Strength & Charisma', subclasses: ['Oath of Devotion', 'Oath of the Ancients', 'Oath of Vengeance'] },
//   { id: 'ranger', name: 'Ranger', icon: Target, description: 'A warrior who combats threats on the edges of civilization.', primary: 'Dexterity & Wisdom', subclasses: ['Hunter', 'Beast Master'] },
//   { id: 'rogue', name: 'Rogue', icon: Skull, description: 'A scoundrel who uses stealth and trickery to overcome obstacles and enemies.', primary: 'Dexterity', subclasses: ['Thief', 'Assassin', 'Arcane Trickster'] },
//   { id: 'sorcerer', name: 'Sorcerer', icon: Zap, description: 'A spellcaster who draws on inborn magic from a gift or bloodline.', primary: 'Charisma', subclasses: ['Draconic Bloodline', 'Wild Magic'] },
//   { id: 'warlock', name: 'Warlock', icon: Skull, description: 'A wielder of magic that is derived from a bargain with an extraplanar entity.', primary: 'Charisma', subclasses: ['The Archfey', 'The Fiend', 'The Great Old One'] },
//   { id: 'wizard', name: 'Wizard', icon: BookOpen, description: 'A scholarly magic-user capable of wielding cosom-altering powers.', primary: 'Intelligence', subclasses: ['Abjuration', 'Conjuration', 'Divination', 'Enchantment', 'Evocation', 'Illusion', 'Necromancy', 'Transmutation'] },
// ];

// export function ClassStep() {
//   const { control, watch, setValue } = useFormContext();
//   const currentClass = watch('class');
//   const level = watch('level');
  
//   const selectedClass = CLASSES.find(c => c.id === currentClass);

//   const getSubclassLevel = (classId: string) => {
//     if (['cleric', 'sorcerer', 'warlock'].includes(classId)) return 1;
//     if (['druid', 'wizard'].includes(classId)) return 2;
//     return 3;
//   };

//   const isSubclassAvailable = selectedClass && level >= getSubclassLevel(selectedClass.id);

//   return (
//     // <div className="space-y-6">
//     <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
//       <FormField
//         control={control}
//         name="class"
//         render={({ field }) => (
//           <FormItem>
//             <FormControl>
//             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.625rem' }}>
//                 {CLASSES.map((cls) => (
//                   // const isSelected = field.value === cls.id;
//                   <Card 
//                     key={cls.id}
//                     className={`cursor-pointer transition-all hover:border-primary/50 ${field.value === cls.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : ''}`}
//                     onClick={() => {
//                       field.onChange(cls.id);
//                       setValue('subclass', '');
//                     }}
//                     style={{
//                       display: 'flex',
//                       alignItems: 'center',
//                       gap: '0.75rem',
//                       padding: '0.625rem 0.75rem',
//                       borderRadius: '0.5rem',
//                       cursor: 'pointer',
//                       border: field.value === cls.id
//                         ? '2px solid var(--interactive-accent)'
//                         : '2px solid var(--background-modifier-border)',
//                       background: field.value === cls.id
//                         ? 'var(--background-modifier-form-field)'
//                         : 'var(--background-primary)',
//                       transition: 'border-color 0.15s, background 0.15s',
//                       position: 'relative',
//                     }}
//                   >
//                     <CardContent className="p-4 flex gap-4 items-center">
//                       <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center shrink-0">
//                         <cls.icon className="w-6 h-6 text-primary" />
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <div className="flex justify-between items-start">
//                           <h3 className="font-bold">{cls.name}</h3>
//                           <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase font-semibold">
//                             {cls.primary}
//                           </span>
//                         </div>
//                         <p className="text-xs text-muted-foreground line-clamp-2">{cls.description}</p>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 ))}
//               </div>
//             </FormControl>
//             <FormMessage />
//           </FormItem>
//         )}
//       />

//       {selectedClass && selectedClass.subclasses.length > 0 && (
//         <FormField
//           control={control}
//           name="subclass"
//           render={({ field }) => (
//             <FormItem className="space-y-3 pt-4 border-t">
//               <div className="flex items-center justify-between">
//                 <FormLabel>Select Specialization (Subclass)</FormLabel>
//                 {!isSubclassAvailable && (
//                   <Badge variant="secondary" className="text-[10px] uppercase">
//                     Available at Level {getSubclassLevel(selectedClass.id)}
//                   </Badge>
//                 )}
//               </div>
//               <Select 
//                 value={field.value} 
//                 onValueChange={field.onChange}
//                 disabled={!isSubclassAvailable}
//               >
//                 <FormControl>
//                   <SelectTrigger>
//                     <SelectValue placeholder={isSubclassAvailable ? "Choose a specialization..." : `Locked until Level ${getSubclassLevel(selectedClass.id)}`} />
//                   </SelectTrigger>
//                 </FormControl>
//                 <SelectContent>
//                   {selectedClass.subclasses.map((sub) => (
//                     <SelectItem key={sub} value={sub.toLowerCase().replace(/\s+/g, '-')}>
//                       {sub}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//       )}
//     </div>
//   );
// }

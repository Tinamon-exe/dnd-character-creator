import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Notice } from 'obsidian';
import { ChevronLeft, ChevronRight, Wand, Shield, User, ScrollText, BarChart, CheckCircle2, BookOpen } from 'lucide-react';
import { BasicsStep } from './BasicsStep';
import { RaceStep } from './RaceStep.tsx';
import { ClassStep } from './ClassStep';
import { StatsStep } from './StatsStep';
import { SkillsStep } from './SkillsStep';
import { DetailsStep } from './DetailsStep';
import { SpellsStep } from './SpellsStep';
import { ReviewStep } from './ReviewStep';
import { characterSchema, type CharacterFormData } from '../utils/schema';
import { TRAIT_DATA } from '../utils/dnd-data';

const STEPS = [
  { id: 'basics',  title: 'Basics',     icon: User,         description: 'Identity and power level' },
  { id: 'race',    title: 'Race',       icon: Wand,         description: 'Choose your lineage' },
  { id: 'class',   title: 'Class',      icon: Shield,       description: 'Choose your calling' },
  { id: 'details', title: 'Background', icon: ScrollText,   description: 'Origin and alignment' },
  { id: 'stats',   title: 'Stats',      icon: BarChart,     description: 'Define your abilities' },
  { id: 'skills',  title: 'Skills',     icon: BookOpen,     description: 'Skill proficiencies' },
  { id: 'spells',  title: 'Spells',     icon: BookOpen,     description: 'Cantrips and magic' },
  { id: 'review',  title: 'Review',     icon: CheckCircle2, description: 'Finalize character' },
];

const STORAGE_FILE = 'dnd-characters.json';

async function loadCharacters(app: any): Promise<any[]> {
  try {
    const file = app.vault.getAbstractFileByPath(STORAGE_FILE);
    if (!file) return [];
    const content = await app.vault.read(file);
    return JSON.parse(content);
  } catch {
    return [];
  }
}

async function saveCharacters(app: any, chars: any[]) {
  const content = JSON.stringify(chars, null, 2);
  const file = app.vault.getAbstractFileByPath(STORAGE_FILE);
  if (file) {
    await app.vault.modify(file, content);
  } else {
    await app.vault.create(STORAGE_FILE, content);
  }
}

async function loadEditingCharacter(app: any): Promise<any | null> {
  try {
    const file = app.vault.getAbstractFileByPath('dnd-editing.json');
    if (!file) return null;
    const content = await app.vault.read(file);
    const data = JSON.parse(content);
    await app.vault.delete(file);
    return data;
  } catch {
    return null;
  }
}

const DEFAULT_VALUES = {
  name: '',
  image: '',
  imageX: 50,
  imageY: 50,
  imageScale: 100,
  race: 'human',
  subrace: '',
  class: 'fighter',
  subclass: '',
  level: 1,
  stats: { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 },
  background: 'soldier',
  alignment: 'true-neutral',
  skills: [],
  cantrips: [],
  spells: [],
  inventory: [],
  removedEquipment: [],
  money: { cp: 0, sp: 0, ep: 0, gp: 10, pp: 0 },
  traits: [],
  feats: [],
};

export function CharacterWizard({ app, modal, editingChar }: { app: any; modal: any; editingChar?: any }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [initialValues, setInitialValues] = useState<any>(DEFAULT_VALUES);
  const [ready, setReady] = useState(false);

  // Load editing character from vault on mount
  React.useEffect(() => {
  if (editingChar) {
    setInitialValues(editingChar);
    setReady(true);
    return;
  }
  loadEditingCharacter(app).then((editing) => {
    if (editing) setInitialValues(editing);
    setReady(true);
  });
}, []);

  const methods = useForm<CharacterFormData>({
    resolver: zodResolver(characterSchema),
    defaultValues: initialValues,
  });

  const { handleSubmit, watch, setValue, trigger } = methods;
  const formData = watch();

  // Auto-apply racial and class traits
  React.useEffect(() => {
    const racialTraits = TRAIT_DATA.races[formData.race] || [];
    const classTraits  = TRAIT_DATA.classes[formData.class] || [];
    const autoTraits   = [...new Set([...racialTraits, ...classTraits])];
    const currentTraits = formData.traits || [];
    const hasAllAuto = autoTraits.every(t => currentTraits.includes(t));
    if (!hasAllAuto) {
      setValue('traits', [...new Set([...currentTraits, ...autoTraits])]);
    }
  }, [formData.race, formData.class, setValue]);

  const getFieldsForStep = (step: number): string[] => {
    switch (step) {
      case 0: return ['name', 'level'];
      case 1: return ['race', 'subrace'];
      case 2: return ['class', 'subclass'];
      case 3: return ['background', 'alignment'];
      case 4: return ['stats'];
      case 5: return ['skills'];
      case 6: return ['cantrips', 'spells'];
      default: return [];
    }
  };

  const onSubmit = async (data: CharacterFormData) => {
    const chars = await loadCharacters(app);
    let updated;
    if (data.id) {
      updated = chars.map((c: any) =>
        c.id === data.id ? { ...data, savedAt: new Date().toISOString() } : c
      );
    } else {
      updated = [...chars, { ...data, id: Date.now(), savedAt: new Date().toISOString() }];
    }
    await saveCharacters(app, updated);
    new Notice(
      data.id
        ? `✅ ${data.name} updated!`
        : `✅ ${data.name}, the level ${data.level} ${data.race} ${data.class}, is ready for adventure!`
    );
    setTimeout(() => modal.close(), 1000);
  };

  const handleNext = async () => {
    const fields = getFieldsForStep(currentStep);
    const isValid = await trigger(fields as any);
    if (isValid) {
      if (currentStep < STEPS.length - 1) {
        setCurrentStep((p) => p + 1);
      } else {
        onSubmit(methods.getValues());
      }
    } else {
      new Notice('⚠️ Please fix the errors before continuing');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((p) => p - 1);
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const renderStep = () => {
    switch (currentStep) {
      case 0: return <BasicsStep />;
      case 1: return <RaceStep />;
      case 2: return <ClassStep />;
      case 3: return <DetailsStep />;
      case 4: return <StatsStep />;
      case 5: return <SkillsStep />;
      case 6: return <SpellsStep />;
      case 7: return <ReviewStep formData={formData} />;
      default: return null;
    }
  };

  if (!ready) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px', color: 'var(--text-muted)' }}>
        Loading...
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div style={{ maxWidth: '100%', padding: '1.5rem' }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: 'var(--interactive-accent)', padding: '0.5rem', borderRadius: '0.5rem', display: 'flex' }}>
                <Wand style={{ width: '1.25rem', height: '1.25rem', color: 'var(--text-on-accent)' }} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Character Creator</h2>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Follow the steps to build your hero</p>
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.8rem' }}>
              <div style={{ fontWeight: 600 }}>Step {currentStep + 1} of {STEPS.length}</div>
              <div style={{ color: 'var(--text-muted)' }}>{STEPS[currentStep].title}</div>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ height: '6px', background: 'var(--background-modifier-border)', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: 'var(--interactive-accent)',
              borderRadius: '999px',
              transition: 'width 0.3s ease',
            }} />
          </div>

          {/* Step indicators */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '0.5rem', marginTop: '1.5rem' }}>
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive    = index === currentStep;
              const isCompleted = index < currentStep;
              return (
                <div key={step.id} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem',
                  color: isActive ? 'var(--interactive-accent)' : isCompleted ? 'var(--text-accent)' : 'var(--text-muted)',
                }}>
                  <div style={{
                    padding: '0.375rem',
                    borderRadius: '50%',
                    border: `2px solid ${isActive ? 'var(--interactive-accent)' : isCompleted ? 'var(--text-accent)' : 'var(--background-modifier-border)'}`,
                    background: isActive ? 'var(--interactive-accent)' : 'transparent',
                    display: 'flex',
                  }}>
                    <Icon style={{
                      width: '0.875rem', height: '0.875rem',
                      color: isActive ? '#ffffff' : 'inherit',
                    }} />
                  </div>
                  <span style={{ fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Card ── */}
        <div style={{
          border: '1px solid var(--background-modifier-border)',
          borderRadius: '0.75rem',
          background: 'var(--background-primary)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '500px',
        }}>
          {/* Card header */}
          <div style={{ padding: '1.5rem 1.5rem 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>
              {React.createElement(STEPS[currentStep].icon, { style: { width: '1.1rem', height: '1.1rem', color: 'var(--interactive-accent)' } })}
              {STEPS[currentStep].title}
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {STEPS[currentStep].description}
            </p>
          </div>

          {/* Card content */}
          <div style={{ padding: '1.5rem', flex: 1 }}>
            {renderStep()}
          </div>

          {/* Card footer */}
          <div style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--background-modifier-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div
              role="button"
              onClick={handleBack}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.5rem 1rem', borderRadius: '0.375rem', cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
                border: '1px solid var(--background-modifier-border)',
                background: 'var(--background-modifier-form-field)',
                color: currentStep === 0 ? 'var(--text-faint)' : 'var(--text-normal)',
                fontSize: '0.875rem', fontWeight: 500,
                opacity: currentStep === 0 ? 0.5 : 1,
                transition: 'background 0.15s',
              }}
            >
              <ChevronLeft style={{ width: '1rem', height: '1rem' }} />
              Back
            </div>

            <div
              role="button"
              onClick={handleNext}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.5rem 1rem', borderRadius: '0.375rem', cursor: 'pointer',
                background: 'var(--interactive-accent)',
                color: 'var(--text-on-accent)',
                fontSize: '0.875rem', fontWeight: 500,
                border: 'none',
                transition: 'opacity 0.15s',
              }}
            >
              {currentStep === STEPS.length - 1 ? 'Complete Character' : 'Next'}
              {currentStep !== STEPS.length - 1 && <ChevronRight style={{ width: '1rem', height: '1rem' }} />}
            </div>
          </div>
        </div>

      </div>
    </FormProvider>
  );
}
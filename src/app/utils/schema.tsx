import { z } from 'zod';

export const characterSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Name is required"),
  image: z.string().optional(),
  imageX: z.number().optional(),
  imageY: z.number().optional(),
  imageScale: z.number().optional(),
  race: z.string().min(1, "Race is required"),
  subrace: z.string().optional(),
  class: z.string().min(1, "Class is required"),
  subclass: z.string().optional(),
  level: z.number().min(1).max(20),
  stats: z.object({
    str: z.number().min(8).max(20),
    dex: z.number().min(8).max(20),
    con: z.number().min(8).max(20),
    int: z.number().min(8).max(20),
    wis: z.number().min(8).max(20),
    cha: z.number().min(8).max(20),
  }).optional(),
  background: z.string().min(1, "Background is required"),
  alignment: z.string().min(1, "Alignment is required"),
  skills: z.array(z.string()),
  cantrips: z.array(z.string()),
  spells: z.array(z.string()),
  inventory: z.array(z.string()).optional(),
  removedEquipment: z.array(z.string()).optional(),
  money: z.object({
    cp: z.number().default(0),
    sp: z.number().default(0),
    ep: z.number().default(0),
    gp: z.number().default(10),
    pp: z.number().default(0),
  }),
  traits: z.array(z.string()).optional(),
  feats: z.array(z.string()).optional(),
});

export type CharacterFormData = z.infer<typeof characterSchema>;

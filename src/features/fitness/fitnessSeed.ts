import type {
  FitnessExerciseRecord,
  FitnessMuscleGroup,
  FitnessPlanRecord,
  StarterPlanStructure,
  StarterPlanStructureDay,
  StarterPlanStructureExercise,
} from '@/features/fitness/fitnessTypes'

const starterTimestamp = '2026-04-25T00:00:00.000Z'

function starterExercise(
  id: string,
  name: string,
  category: string,
  muscleGroup: FitnessMuscleGroup | null,
  defaultRestSeconds: number,
): FitnessExerciseRecord {
  return {
    id,
    name,
    category,
    muscleGroup,
    defaultRestSeconds,
    isCustom: false,
    createdAt: starterTimestamp,
    updatedAt: starterTimestamp,
    deletedAt: null,
  }
}

function starterPlan(id: string, name: string, goal: string): FitnessPlanRecord {
  return {
    id,
    name,
    goal,
    kind: 'starter',
    sourceTemplateId: null,
    status: 'active',
    createdAt: starterTimestamp,
    updatedAt: starterTimestamp,
    deletedAt: null,
  }
}

function planExercise(
  exerciseId: string,
  targetSets: number,
  minReps: number,
  maxReps: number,
  targetRir: number | null,
  restSeconds: number,
  notes = '',
): StarterPlanStructureExercise {
  return {
    exerciseId,
    targetSets,
    minReps,
    maxReps,
    targetRir,
    restSeconds,
    notes,
  }
}

export const STARTER_FITNESS_EXERCISES: FitnessExerciseRecord[] = [
  starterExercise('exercise-bench-press', 'Tlak na lavičke', 'hrudník', 'chest', 150),
  starterExercise('exercise-incline-db-press', 'Tlaky s jednoručkami na šikmej lavičke', 'hrudník', 'chest', 120),
  starterExercise('exercise-lateral-raise', 'Upažovanie', 'ramená', 'shoulders', 75),
  starterExercise('exercise-deadlift', 'Mŕtvy ťah', 'chrbát', 'back', 180),
  starterExercise('exercise-barbell-row', 'Príťahy veľkej činky v predklone', 'chrbát', 'back', 120),
  starterExercise('exercise-squat', 'Drep', 'nohy', 'quads', 180),
  starterExercise('exercise-romanian-deadlift', 'Rumunský mŕtvy ťah', 'nohy', 'hamstrings', 150),
  starterExercise('exercise-rope-pushdown', 'Sťahovanie kladky s lanom', 'paže', 'triceps', 90),
  starterExercise('exercise-return-incline-barbell-bench', 'Incline benčpres s veľkou činkou', 'hrudník', 'chest', 150),
  starterExercise('exercise-return-chest-supported-row', 'Príťahy na lavičke s oporou hrudníka', 'chrbát', 'back', 120),
  starterExercise('exercise-return-standing-overhead-press', 'Tlaky nad hlavu v stoji', 'ramená', 'shoulders', 150),
  starterExercise('exercise-return-assisted-pullup-neutral-pulldown', 'Zhyby s dopomocou alebo sťahovanie kladky neutrálnym úchopom', 'chrbát', 'back', 120),
  starterExercise('exercise-return-dips-or-handles-pushups', 'Dipy alebo kľuky na úchopoch', 'paže', 'triceps', 90),
  starterExercise('exercise-return-incline-db-curl', 'Biceps zdvíhanie s jednoručkami na šikmej lavičke', 'paže', 'biceps', 75),
  starterExercise('exercise-return-farmer-walk', 'Farmer walk (chôdza s ťažkým nákladom)', 'úchop', 'forearms', 90),
  starterExercise('exercise-return-heel-elevated-or-safety-squat', 'Drep s podloženými pätami alebo safety bar drep', 'nohy', 'quads', 180),
  starterExercise('exercise-return-front-foot-elevated-split-squat', 'Split squat s prednou nohou na zvýšenej podložke', 'nohy', 'quads', 90),
  starterExercise('exercise-return-lying-or-seated-leg-curl', 'Zakopávanie v ľahu alebo sede', 'nohy', 'hamstrings', 90),
  starterExercise('exercise-return-seated-calf-raise', 'Výpony na lýtka v sede', 'lýtka', 'calves', 60),
  starterExercise('exercise-return-tibialis-raise', 'Tibialis raise (dvíhanie špičky)', 'lýtka', 'calves', 45),
  starterExercise('exercise-return-hanging-knee-raise', 'Zdvíhanie kolien vo vise', 'core', 'abs', 60),
  starterExercise('exercise-return-reverse-sled-drag', 'Ťahanie saní dozadu', 'kondícia', 'quads', 75),
  starterExercise('exercise-return-db-bench-press', 'Benčpres s jednoručkami', 'hrudník', 'chest', 150),
  starterExercise('exercise-return-pullup-or-pulldown', 'Zhyby alebo sťahovanie kladky', 'chrbát', 'back', 120),
  starterExercise('exercise-return-single-arm-cable-row', 'Jednoručný príťah na kladke', 'chrbát', 'back', 90),
  starterExercise('exercise-return-landmine-press', 'Landmine press', 'ramená', 'shoulders', 90),
  starterExercise('exercise-return-reverse-fly-or-face-pull', 'Reverse fly alebo face pull', 'ramená', 'shoulders', 60),
  starterExercise('exercise-return-hammer-curl', 'Kladivové zdvihy (hammer curls)', 'paže', 'biceps', 60),
  starterExercise('exercise-return-overhead-rope-triceps', 'Triceps s lanom za hlavu', 'paže', 'triceps', 60),
  starterExercise('exercise-return-dead-hang', 'Dead hang (pasívny vis)', 'úchop', 'forearms', 60),
  starterExercise('exercise-return-suitcase-carry', 'Suitcase carry (chôdza s kufrom)', 'úchop', 'forearms', 60),
  starterExercise('exercise-return-trap-bar-high-handle-deadlift', 'Trap bar mŕtvy ťah z vyšších rúčok', 'nohy', 'glutes', 180),
  starterExercise('exercise-return-leg-press-or-hack-squat', 'Leg press alebo hack squat', 'nohy', 'quads', 120),
  starterExercise('exercise-return-bulgarian-split-squat', 'Bulharský drep', 'nohy', 'quads', 90),
  starterExercise('exercise-return-hip-thrust-or-hyperextension', 'Hip thrust alebo 45° hyperextenzia', 'nohy', 'glutes', 90),
  starterExercise('exercise-return-standing-calf-raise', 'Výpony na lýtka v stoji', 'lýtka', 'calves', 60),
  starterExercise('exercise-return-copenhagen-plank', 'Copenhagen plank (kodanská doska)', 'core', 'abs', 60),
  starterExercise('exercise-return-cable-crunch-or-ab-wheel', 'Cable crunch alebo ab wheel', 'core', 'abs', 75),
]

export const STARTER_FITNESS_PLANS: FitnessPlanRecord[] = [
  starterPlan('starter-push-pull-legs', 'Tlak / Ťah / Nohy', 'Hypertrofický split s opakovateľnou týždennou štruktúrou.'),
  starterPlan('starter-upper-lower', 'Vrch / Spodok', 'Vyvážená štvordňová šablóna na silu a svaly.'),
  starterPlan('starter-full-body-3x', 'Celé telo 3×', 'Trojdenný plán na celé telo vhodný pre začiatok.'),
  starterPlan(
    'starter-navratovy-plan-kristian-8-tyzdnov',
    'Návratový plán',
    '8 týždňov na bezpečný návrat do silového tréningu, regeneráciu a chudnutie.',
  ),
]

const pushWorkout = (name: string) => ({
  name,
  exercises: [
    planExercise('exercise-bench-press', 3, 6, 8, 1, 150),
    planExercise('exercise-incline-db-press', 3, 8, 10, 2, 120),
    planExercise('exercise-lateral-raise', 3, 12, 15, 1, 75),
    planExercise('exercise-rope-pushdown', 3, 10, 12, 1, 90),
  ],
})

const pullWorkout = (name: string) => ({
  name,
  exercises: [
    planExercise('exercise-deadlift', 3, 3, 5, 1, 180),
    planExercise('exercise-barbell-row', 4, 6, 10, 1, 120),
  ],
})

const legWorkout = {
  name: 'Nohy',
  exercises: [
    planExercise('exercise-squat', 4, 5, 8, 1, 180),
    planExercise('exercise-romanian-deadlift', 3, 8, 10, 2, 150),
  ],
}

type ReturnWeekProfile = {
  weekNumber: number
  targetRir: number
  volume: 'lower' | 'full' | 'deload'
  notes: string
}

const returnWeekProfiles: ReturnWeekProfile[] = [
  { weekNumber: 1, targetRir: 3, volume: 'lower', notes: 'Týždeň 1: RPE 6–7, približne 3 opakovania v rezerve. Použi spodný počet sérií a sústreď sa na techniku, dýchanie a kĺby.' },
  { weekNumber: 2, targetRir: 3, volume: 'lower', notes: 'Týždeň 2: RPE 6–7, približne 3 opakovania v rezerve. Pridaj opakovania iba tam, kde technika ostáva čistá.' },
  { weekNumber: 3, targetRir: 2, volume: 'full', notes: 'Týždeň 3: RPE 7–8, približne 2 opakovania v rezerve. Prejdi na plný počet sérií.' },
  { weekNumber: 4, targetRir: 2, volume: 'full', notes: 'Týždeň 4: RPE 7–8. Najprv pridávaj opakovania, váhu až po hornej hrane rozsahu vo všetkých sériách.' },
  { weekNumber: 5, targetRir: 2, volume: 'full', notes: 'Týždeň 5: RPE 7–8. Horná polovica tela +2 až +2,5 kg, spodná polovica +2,5 až +5 kg po splnení rozsahu.' },
  { weekNumber: 6, targetRir: 2, volume: 'full', notes: 'Týždeň 6: 1. séria RPE 8–8.5, ostatné série RPE 7–8. Pri zlom spánku alebo kĺboch drž váhu.' },
  { weekNumber: 7, targetRir: 2, volume: 'full', notes: 'Týždeň 7: 1. séria RPE 8–8.5, ostatné série RPE 7–8. Top set nech je ťažký, nie škaredý.' },
  { weekNumber: 8, targetRir: 4, volume: 'deload', notes: 'Týždeň 8 deload: RPE 6, približne polovica sérií a -10 až -15 % váha.' },
]

const returnWarmupNotes = 'Zahriatie: 5–7 min chôdza do kopca, bike, airbike alebo veslo. Upper mobilita: scapulárne kľuky 1×10, face pull s gumou 1×15, externá rotácia s gumou 1×12/strana, dead bug 1×6/strana, visenie 20–30 s. Lower mobilita: tibialis raises 1×15, výpony 1×15, glute bridge 1×12 s 2 s dotiahnutím, split squat izometria 20 s/noha, drep s vlastnou váhou 1×10, dead bug 1×6/strana. Ramp-up série rob pred hlavným cvikom.'
const returnOverloadNotes = 'Progres: najprv opakovania, potom váha. Po hornej hrane rozsahu vo všetkých sériách pridaj horná polovica +2 až +2,5 kg, spodná polovica +2,5 až +5 kg. Ak rozsah ešte nemáš, pridaj 1 opakovanie vo vybranej sérii. Pri zlom spánku alebo kĺboch drž váhu a rieš techniku.'

function returnSets(fullSets: number, profile: ReturnWeekProfile) {
  if (profile.volume === 'deload') return Math.max(1, Math.ceil(fullSets / 2))
  if (profile.volume === 'lower') return Math.max(1, fullSets - 1)
  return fullSets
}

function returnExercise(template: StarterPlanStructureExercise, profile: ReturnWeekProfile): StarterPlanStructureExercise {
  const weeklyNote = profile.volume === 'deload'
    ? 'Deload: uber približne 10–15 % váhy.'
    : profile.weekNumber >= 6
      ? 'Prvá séria môže byť top set RPE 8–8.5, zvyšok drž technicky čistý.'
      : ''
  return {
    ...template,
    targetSets: returnSets(template.targetSets, profile),
    targetRir: profile.targetRir,
    notes: [template.notes, weeklyNote].filter(Boolean).join(' '),
  }
}

const returnUpperA: StarterPlanStructureExercise[] = [
  planExercise('exercise-return-incline-barbell-bench', 4, 5, 8, null, 150, 'Tempo 2-0-1-0.'),
  planExercise('exercise-return-chest-supported-row', 4, 6, 8, null, 120, 'Tempo 2-1-1-0.'),
  planExercise('exercise-return-standing-overhead-press', 3, 5, 8, null, 150, 'Tempo 2-0-1-0.'),
  planExercise('exercise-return-assisted-pullup-neutral-pulldown', 3, 6, 10, null, 120, 'Tempo 2-1-2-0. Alternatíva: assisted pull-up alebo neutral-grip lat pulldown.'),
  planExercise('exercise-return-dips-or-handles-pushups', 2, 8, 12, null, 90, 'Tempo 2-0-1-0. Alternatíva: dipy alebo kľuky na úchopoch.'),
  planExercise('exercise-return-incline-db-curl', 2, 8, 12, null, 75, 'Tempo 2-1-2-0.'),
  planExercise('exercise-return-farmer-walk', 4, 20, 30, null, 90, '20–30 m. Opakovania v pláne používaj ako metre.'),
]

const returnLowerA: StarterPlanStructureExercise[] = [
  planExercise('exercise-return-heel-elevated-or-safety-squat', 4, 5, 8, null, 180, 'Tempo 2-0-1-0. Alternatíva: drep s podloženými pätami alebo safety bar drep.'),
  planExercise('exercise-romanian-deadlift', 4, 6, 8, null, 150, 'Tempo 3-0-1-0.'),
  planExercise('exercise-return-front-foot-elevated-split-squat', 3, 8, 8, null, 90, 'Tempo 2-1-1-0. Na každú nohu.'),
  planExercise('exercise-return-lying-or-seated-leg-curl', 3, 10, 12, null, 90, 'Tempo 2-1-2-0. Alternatíva: ľah alebo sed.'),
  planExercise('exercise-return-seated-calf-raise', 4, 8, 12, null, 60, 'Tempo 1-1-3-0.'),
  planExercise('exercise-return-tibialis-raise', 3, 15, 20, null, 45, 'Tempo 1-1-2-0.'),
  planExercise('exercise-return-hanging-knee-raise', 3, 8, 12, null, 60, 'Tempo 2-1-2-0.'),
  planExercise('exercise-return-reverse-sled-drag', 6, 20, 30, null, 75, '6–8 jázd po 20–30 m. Opakovania v pláne používaj ako metre.'),
]

const returnUpperB: StarterPlanStructureExercise[] = [
  planExercise('exercise-return-db-bench-press', 4, 6, 10, null, 150, 'Tempo 2-0-1-0.'),
  planExercise('exercise-return-pullup-or-pulldown', 4, 6, 10, null, 120, 'Tempo 2-1-2-0. Alternatíva: zhyby alebo sťahovanie kladky.'),
  planExercise('exercise-return-single-arm-cable-row', 3, 8, 12, null, 90, 'Tempo 2-1-2-0. Na každú stranu.'),
  planExercise('exercise-return-landmine-press', 3, 8, 10, null, 90, 'Tempo 2-0-1-0. Na každú stranu.'),
  planExercise('exercise-return-reverse-fly-or-face-pull', 3, 12, 15, null, 60, 'Tempo 2-1-2-0. Alternatíva: reverse fly alebo face pull.'),
  planExercise('exercise-return-hammer-curl', 2, 10, 12, null, 60, 'Tempo 2-0-1-0.'),
  planExercise('exercise-return-overhead-rope-triceps', 2, 10, 15, null, 60, 'Tempo 2-0-1-0.'),
  planExercise('exercise-return-dead-hang', 3, 20, 40, null, 60, '20–40 s. Opakovania v pláne používaj ako sekundy.'),
  planExercise('exercise-return-suitcase-carry', 3, 20, 20, null, 60, '20 m na každú stranu. Opakovania v pláne používaj ako metre.'),
]

const returnLowerB: StarterPlanStructureExercise[] = [
  planExercise('exercise-return-trap-bar-high-handle-deadlift', 4, 4, 6, null, 180, 'Tempo 1-0-2-1.'),
  planExercise('exercise-return-leg-press-or-hack-squat', 3, 8, 10, null, 120, 'Tempo 2-0-1-0. Alternatíva: leg press alebo hack squat.'),
  planExercise('exercise-return-bulgarian-split-squat', 3, 8, 8, null, 90, 'Tempo 2-1-1-0. Na každú nohu.'),
  planExercise('exercise-return-hip-thrust-or-hyperextension', 3, 8, 12, null, 90, 'Tempo 2-1-2-0. Alternatíva: hip thrust alebo 45° hyperextenzia.'),
  planExercise('exercise-return-standing-calf-raise', 4, 10, 15, null, 60, 'Tempo 1-1-3-0.'),
  planExercise('exercise-return-copenhagen-plank', 2, 20, 30, null, 60, '20–30 s na každú stranu. Opakovania v pláne používaj ako sekundy.'),
  planExercise('exercise-return-cable-crunch-or-ab-wheel', 3, 8, 12, null, 75, 'Tempo 2-1-2-0. Alternatíva: cable crunch alebo ab wheel.'),
]

function returnWorkout(name: string, exercises: StarterPlanStructureExercise[], profile: ReturnWeekProfile) {
  return {
    name,
    notes: profile.notes,
    exercises: exercises.map((exercise) => returnExercise(exercise, profile)),
  }
}

function buildReturnWeekDays(profile: ReturnWeekProfile): StarterPlanStructureDay[] {
  return [
    { dayIndex: 0, label: 'Upper A', isRestDay: false, workouts: [returnWorkout('Deň 1 — Upper A', returnUpperA, profile)] },
    { dayIndex: 1, label: 'Lower A', isRestDay: false, workouts: [returnWorkout('Deň 2 — Lower A', returnLowerA, profile)] },
    { dayIndex: 2, label: 'Zóna 2 / chôdza', isRestDay: true, workouts: [] },
    { dayIndex: 3, label: 'Upper B', isRestDay: false, workouts: [returnWorkout('Deň 4 — Upper B', returnUpperB, profile)] },
    { dayIndex: 4, label: 'Lower B', isRestDay: false, workouts: [returnWorkout('Deň 5 — Lower B', returnLowerB, profile)] },
    { dayIndex: 5, label: 'Zóna 2 / chôdza', isRestDay: true, workouts: [] },
    { dayIndex: 6, label: 'Voľno', isRestDay: true, workouts: [] },
  ]
}

const returnPlanWeekNotes = `Návratový blok z PDF pre Kristiána: 8 týždňov, sila, regenerácia a chudnutie. ${returnWarmupNotes} ${returnOverloadNotes}`
const returnPlanWeeks = returnWeekProfiles.map((profile) => ({
  weekNumber: profile.weekNumber,
  notes: `${returnPlanWeekNotes} ${profile.notes}`,
  days: buildReturnWeekDays(profile),
}))

export const STARTER_PLAN_STRUCTURES: StarterPlanStructure[] = [
  {
    planId: 'starter-push-pull-legs',
    weekNotes: 'Štartovací PPL týždeň. Duplikuj ho a škáluj odtiaľto.',
    days: [
      { dayIndex: 0, label: 'Tlak A', isRestDay: false, workouts: [pushWorkout('Tlakový deň A')] },
      { dayIndex: 1, label: 'Ťah A', isRestDay: false, workouts: [pullWorkout('Ťahový deň A')] },
      { dayIndex: 2, label: 'Voľno', isRestDay: true, workouts: [] },
      { dayIndex: 3, label: 'Nohy', isRestDay: false, workouts: [legWorkout] },
      { dayIndex: 4, label: 'Tlak B', isRestDay: false, workouts: [pushWorkout('Tlakový deň B')] },
      { dayIndex: 5, label: 'Voľno', isRestDay: true, workouts: [] },
      { dayIndex: 6, label: 'Ťah B', isRestDay: false, workouts: [pullWorkout('Ťahový deň B')] },
    ],
  },
  {
    planId: 'starter-upper-lower',
    weekNotes: 'Štartovací týždeň vrch/spodok.',
    days: [
      { dayIndex: 0, label: 'Vrch A', isRestDay: false, workouts: [pushWorkout('Vrch A')] },
      { dayIndex: 1, label: 'Voľno', isRestDay: true, workouts: [] },
      { dayIndex: 2, label: 'Spodok A', isRestDay: false, workouts: [legWorkout] },
      { dayIndex: 3, label: 'Voľno', isRestDay: true, workouts: [] },
      { dayIndex: 4, label: 'Vrch B', isRestDay: false, workouts: [pullWorkout('Vrch B')] },
      { dayIndex: 5, label: 'Spodok B', isRestDay: false, workouts: [legWorkout] },
      { dayIndex: 6, label: 'Voľno', isRestDay: true, workouts: [] },
    ],
  },
  {
    planId: 'starter-full-body-3x',
    weekNotes: 'Štartovací trojdňový týždeň na celé telo.',
    days: [
      { dayIndex: 0, label: 'Celé telo A', isRestDay: false, workouts: [pushWorkout('Celé telo A')] },
      { dayIndex: 1, label: 'Voľno', isRestDay: true, workouts: [] },
      { dayIndex: 2, label: 'Celé telo B', isRestDay: false, workouts: [pullWorkout('Celé telo B')] },
      { dayIndex: 3, label: 'Voľno', isRestDay: true, workouts: [] },
      { dayIndex: 4, label: 'Celé telo C', isRestDay: false, workouts: [legWorkout] },
      { dayIndex: 5, label: 'Voľno', isRestDay: true, workouts: [] },
      { dayIndex: 6, label: 'Voľno', isRestDay: true, workouts: [] },
    ],
  },
  {
    planId: 'starter-navratovy-plan-kristian-8-tyzdnov',
    weekNotes: returnPlanWeekNotes,
    days: returnPlanWeeks[0]?.days ?? [],
    weeks: returnPlanWeeks,
  },
]

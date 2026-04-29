export type FitnessSimpleStartChoiceId = 'three_days' | 'four_days' | 'five_six_days' | 'decide_for_me'

export interface FitnessSimpleStartChoice {
  id: FitnessSimpleStartChoiceId
  label: string
  badge: string
  title: string
  description: string
  starterPlanId: string
  personalPlanName: string
  goal: string
  successMessage: string
  recommended?: boolean
}

export const FITNESS_SIMPLE_START_CHOICES: FitnessSimpleStartChoice[] = [
  {
    id: 'three_days',
    label: '3 dni / týždeň',
    badge: 'Najjednoduchšie',
    title: 'Celé telo 3×',
    description: 'Najľahší štart. Tri tréningy týždenne, celé telo, minimum rozmýšľania.',
    starterPlanId: 'starter-full-body-3x',
    personalPlanName: 'Môj jednoduchý 3-dňový plán',
    goal: 'Začať pravidelne a bez chaosu',
    successMessage: 'Jednoduchý 3-dňový plán je pripravený',
    recommended: true,
  },
  {
    id: 'four_days',
    label: '4 dni / týždeň',
    badge: 'Vyvážené',
    title: 'Vrch / Spodok',
    description: 'Dobrá rovnováha. Dva tréningy vrchu a dva tréningy spodku za týždeň.',
    starterPlanId: 'starter-upper-lower',
    personalPlanName: 'Môj 4-dňový vrch/spodok plán',
    goal: 'Budovať silu a svaly vo vyváženom rytme',
    successMessage: 'Vyvážený 4-dňový plán je pripravený',
  },
  {
    id: 'five_six_days',
    label: '5–6 dní / týždeň',
    badge: 'Viac objemu',
    title: 'Tlak / Ťah / Nohy',
    description: 'Pre častejšie fitko. Viac dní, viac objemu, stále pripravené bez nastavovania.',
    starterPlanId: 'starter-push-pull-legs',
    personalPlanName: 'Môj PPL blok',
    goal: 'Budovať svaly s vyšším objemom',
    successMessage: 'PPL plán je pripravený',
  },
  {
    id: 'decide_for_me',
    label: 'Neviem, vyber za mňa',
    badge: 'Odporúčané',
    title: 'Začni s 3 dňami',
    description: 'Najbezpečnejšia voľba, keď chceš iba začať. Neskôr ju vieš upraviť.',
    starterPlanId: 'starter-full-body-3x',
    personalPlanName: 'Môj jednoduchý 3-dňový plán',
    goal: 'Začať pravidelne a bez chaosu',
    successMessage: 'Jednoduchý 3-dňový plán je pripravený',
  },
]

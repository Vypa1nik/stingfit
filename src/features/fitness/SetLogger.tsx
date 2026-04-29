import { useState } from 'react'

import { Calculator, Minus, Plus, Zap } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import type { FitnessLastPerformance, FitnessSessionSetRecord, FitnessSessionSetType, FitnessWeightEntryMode, LogFitnessSetInput } from '@/features/fitness/fitnessTypes'
import { FITNESS_SET_TYPE_OPTIONS } from '@/features/fitness/fitnessSetTypes'
import { calculatePlateLoad, formatPlateLoadSummary, formatPlateNumber, getDefaultBarWeight } from '@/features/fitness/plateCalculator'
import { convertWeightFromKg, convertWeightToKg, type FitnessDisplayUnit } from '@/features/fitness/fitnessUnits'
import { armRestAlertAudio } from '@/features/fitness/restAlerts'
import { cn } from '@/lib/utils'

interface SetLoggerProps {
  set: FitnessSessionSetRecord
  displayUnit: FitnessDisplayUnit
  onLog: (setId: string, input: LogFitnessSetInput) => Promise<void>
  disabled?: boolean
  lastPerformance?: FitnessLastPerformance | null
  titleLabel?: string
  submitLabel?: string
  showLastPerformance?: boolean
  showRestCue?: boolean
  armRestSignal?: boolean
  sticky?: boolean
  onCancel?: () => void
}

export function SetLogger({
  set,
  displayUnit,
  onLog,
  disabled = false,
  lastPerformance = null,
  titleLabel = 'Aktuálna séria',
  submitLabel = 'Zapísať sériu ⚡ pauza',
  showLastPerformance = true,
  showRestCue = true,
  armRestSignal = true,
  sticky = true,
  onCancel,
}: SetLoggerProps) {
  const weightStep = displayUnit === 'lb' ? 5 : 2.5
  const weightStepLabel = `${formatDisplayNumber(weightStep)} ${displayUnit}`
  const maxDisplayWeight = convertWeightFromKg(500, displayUnit)
  const initialWeightEntryMode = set.weightEntryMode ?? 'total'
  const initialLeftWeightKg = set.leftWeightKg ?? (initialWeightEntryMode === 'per_side' ? set.weightKg / 2 : 0)
  const initialRightWeightKg = set.rightWeightKg ?? (initialWeightEntryMode === 'per_side' ? set.weightKg / 2 : 0)
  const [weightEntryMode, setWeightEntryMode] = useState<FitnessWeightEntryMode>(initialWeightEntryMode)
  const [weight, setWeight] = useState(String(convertWeightFromKg(set.weightKg, displayUnit)))
  const [leftWeight, setLeftWeight] = useState(String(convertWeightFromKg(initialLeftWeightKg, displayUnit)))
  const [rightWeight, setRightWeight] = useState(String(convertWeightFromKg(initialRightWeightKg, displayUnit)))
  const [barWeight, setBarWeight] = useState(String(getDefaultBarWeight(displayUnit)))
  const [setType, setSetType] = useState<FitnessSessionSetType>(set.setType ?? 'working')
  const [reps, setReps] = useState(String(set.reps))
  const [rir, setRir] = useState(String(set.rir ?? 1))
  const parsedWeight = Number(weight)
  const parsedLeftWeight = Number(leftWeight)
  const parsedRightWeight = Number(rightWeight)
  const parsedPerSideTotalWeight = parsedLeftWeight + parsedRightWeight
  const parsedCurrentWeight = weightEntryMode === 'per_side' ? parsedPerSideTotalWeight : parsedWeight
  const parsedBarWeight = Number(barWeight)
  const parsedReps = Number(reps)
  const parsedRir = Number(rir)
  const validationErrors = [
    weightEntryMode === 'total' && (!Number.isFinite(parsedWeight) || parsedWeight < 0 || parsedWeight > maxDisplayWeight)
      ? `Váha musí byť medzi 0 a ${formatDisplayNumber(maxDisplayWeight)} ${displayUnit}`
      : null,
    weightEntryMode === 'per_side' && (!Number.isFinite(parsedLeftWeight) || parsedLeftWeight < 0 || parsedLeftWeight > maxDisplayWeight)
      ? `Ľavá strana musí byť medzi 0 a ${formatDisplayNumber(maxDisplayWeight)} ${displayUnit}`
      : null,
    weightEntryMode === 'per_side' && (!Number.isFinite(parsedRightWeight) || parsedRightWeight < 0 || parsedRightWeight > maxDisplayWeight)
      ? `Pravá strana musí byť medzi 0 a ${formatDisplayNumber(maxDisplayWeight)} ${displayUnit}`
      : null,
    weightEntryMode === 'per_side' && Number.isFinite(parsedPerSideTotalWeight) && parsedPerSideTotalWeight > maxDisplayWeight
      ? `Súčet strán musí byť najviac ${formatDisplayNumber(maxDisplayWeight)} ${displayUnit}`
      : null,
    !Number.isInteger(parsedReps) || parsedReps < 0 || parsedReps > 999
      ? 'Opakovania musia byť medzi 0 a 999'
      : null,
    !Number.isInteger(parsedRir) || parsedRir < 0 || parsedRir > 10
      ? 'RIR musí byť medzi 0 a 10'
      : null,
  ].filter((message): message is string => Boolean(message))
  const canSubmit = !disabled && validationErrors.length === 0
  const plateLoad = calculatePlateLoad({
    targetWeight: Number.isFinite(parsedCurrentWeight) ? parsedCurrentWeight : 0,
    barWeight: Number.isFinite(parsedBarWeight) ? parsedBarWeight : getDefaultBarWeight(displayUnit),
    unit: displayUnit,
  })

  const handleSubmit = async () => {
    if (!canSubmit) {
      return
    }

    const leftWeightKg = weightEntryMode === 'per_side' ? convertWeightToKg(parsedLeftWeight, displayUnit) : null
    const rightWeightKg = weightEntryMode === 'per_side' ? convertWeightToKg(parsedRightWeight, displayUnit) : null
    const loggedWeightKg = weightEntryMode === 'per_side'
      ? (leftWeightKg ?? 0) + (rightWeightKg ?? 0)
      : convertWeightToKg(parsedWeight, displayUnit)

    if (armRestSignal) {
      armRestAlertAudio()
    }
    await onLog(set.id, {
      weightKg: loggedWeightKg,
      reps: parsedReps,
      rir: parsedRir,
      setType,
      weightEntryMode,
      leftWeightKg,
      rightWeightKg,
    })
  }

  return (
    <div className={cn(sticky ? 'sticky bottom-4 z-20 lg:static' : '', 'rounded-3xl border border-fitness-yellow/40 bg-black/95 p-5 shadow-[0_0_40px_rgba(255,255,0,0.16)]')}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">{titleLabel}</p>
          <h2 className="mt-1 text-2xl font-black text-white">Séria {set.setNumber}</h2>
        </div>
        <Zap className="size-7 text-fitness-yellow" />
      </div>

      {showLastPerformance ? (
        <div className="mt-4 rounded-2xl border border-fitness-yellow/25 bg-fitness-yellow/10 px-4 py-3">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow">Naposledy</p>
          <p className="mt-1 text-sm font-black text-fitness-warm">
            {lastPerformance ? formatLastPerformance(lastPerformance, displayUnit) : '—'}
          </p>
        </div>
      ) : null}

      {showRestCue ? (
        <div className="mt-4 rounded-2xl border border-fitness-yellow/25 bg-fitness-yellow/10 px-4 py-3">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow">Ovládanie jedným palcom</p>
          <p className="mt-1 text-xs text-fitness-warm/65">Ťukaj rýchlo, drž techniku a potom zapíš sériu.</p>
        </div>
      ) : null}

      <WeightEntryModeSelector value={weightEntryMode} onChange={setWeightEntryMode} disabled={disabled} />

      {weightEntryMode === 'per_side' ? (
        <>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <label className="rounded-2xl border border-fitness-yellow/20 bg-fitness-surface p-3 text-center">
              <span className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">Ľavá</span>
              <input
                aria-label={`Ľavá strana v ${displayUnit}`}
                className="mt-2 w-full bg-transparent text-center text-xl font-black text-fitness-yellow outline-none"
                inputMode="decimal"
                value={leftWeight}
                onInput={(event) => setLeftWeight(event.currentTarget.value)}
              />
            </label>
            <label className="rounded-2xl border border-fitness-yellow/20 bg-fitness-surface p-3 text-center">
              <span className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">Pravá</span>
              <input
                aria-label={`Pravá strana v ${displayUnit}`}
                className="mt-2 w-full bg-transparent text-center text-xl font-black text-fitness-yellow outline-none"
                inputMode="decimal"
                value={rightWeight}
                onInput={(event) => setRightWeight(event.currentTarget.value)}
              />
            </label>
          </div>
          <p className="mt-2 rounded-2xl border border-fitness-yellow/20 bg-black/70 px-4 py-2 text-center text-xs font-black uppercase tracking-[0.14em] text-fitness-yellow">
            Spolu: {Number.isFinite(parsedPerSideTotalWeight) ? formatDisplayNumber(parsedPerSideTotalWeight) : '—'} {displayUnit}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <RepsInput value={reps} onChange={setReps} />
            <RirInput value={rir} onChange={setRir} />
          </div>
        </>
      ) : (
        <div className="mt-5 grid grid-cols-3 gap-3">
          <label className="rounded-2xl border border-fitness-yellow/20 bg-fitness-surface p-3 text-center">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">{displayUnit}</span>
            <input
              aria-label={`Váha v ${displayUnit}`}
              className="mt-2 w-full bg-transparent text-center text-xl font-black text-fitness-yellow outline-none"
              inputMode="decimal"
              value={weight}
              onInput={(event) => setWeight(event.currentTarget.value)}
            />
          </label>
          <RepsInput value={reps} onChange={setReps} />
          <RirInput value={rir} onChange={setRir} />
        </div>
      )}

      <SetTypeSelector value={setType} onChange={setSetType} disabled={disabled} />

      <PlateCalculatorPanel
        unit={displayUnit}
        barWeight={barWeight}
        onBarWeightChange={setBarWeight}
        plateLoad={plateLoad}
      />

      <div className="mt-4 grid grid-cols-3 gap-3">
        {weightEntryMode === 'per_side' ? (
          <QuickAdjustGroup
            label="Strany"
            decrementLabel={`Znížiť obe strany o ${weightStepLabel}`}
            incrementLabel={`Zvýšiť obe strany o ${weightStepLabel}`}
            decrementText={`−${weightStepLabel}`}
            incrementText={`+${weightStepLabel}`}
            onDecrement={() => {
              setLeftWeight((current) => adjustDecimal(current, -weightStep, 0, maxDisplayWeight))
              setRightWeight((current) => adjustDecimal(current, -weightStep, 0, maxDisplayWeight))
            }}
            onIncrement={() => {
              setLeftWeight((current) => adjustDecimal(current, weightStep, 0, maxDisplayWeight))
              setRightWeight((current) => adjustDecimal(current, weightStep, 0, maxDisplayWeight))
            }}
            disabled={disabled}
          />
        ) : (
          <QuickAdjustGroup
            label="Váha"
            decrementLabel={`Znížiť váhu o ${weightStepLabel}`}
            incrementLabel={`Zvýšiť váhu o ${weightStepLabel}`}
            decrementText={`−${weightStepLabel}`}
            incrementText={`+${weightStepLabel}`}
            onDecrement={() => setWeight((current) => adjustDecimal(current, -weightStep, 0, maxDisplayWeight))}
            onIncrement={() => setWeight((current) => adjustDecimal(current, weightStep, 0, maxDisplayWeight))}
            disabled={disabled}
          />
        )}
        <QuickAdjustGroup
          label="Opak."
          decrementLabel="Znížiť počet opakovaní"
          incrementLabel="Zvýšiť počet opakovaní"
          decrementText="−1"
          incrementText="+1"
          onDecrement={() => setReps((current) => adjustInteger(current, -1, 0, 999))}
          onIncrement={() => setReps((current) => adjustInteger(current, 1, 0, 999))}
          disabled={disabled}
        />
        <QuickAdjustGroup
          label="RIR"
          decrementLabel="Znížiť RIR"
          incrementLabel="Zvýšiť RIR"
          decrementText="−1"
          incrementText="+1"
          onDecrement={() => setRir((current) => adjustInteger(current, -1, 0, 10))}
          onIncrement={() => setRir((current) => adjustInteger(current, 1, 0, 10))}
          disabled={disabled}
        />
      </div>

      {validationErrors.length > 0 ? (
        <div className="mt-4 space-y-1 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs font-semibold text-rose-100" role="alert">
          {validationErrors.map((message) => (
            <p key={message}>{message}</p>
          ))}
        </div>
      ) : null}

      <div className="mt-5 grid gap-3">
        <Button className="fitness-action w-full" size="lg" leadingIcon={<Zap className="size-4" />} onClick={handleSubmit} disabled={!canSubmit}>
          {submitLabel}
        </Button>
        {onCancel ? (
          <Button variant="secondary" className="w-full" onClick={onCancel} disabled={disabled}>
            Zrušiť opravu
          </Button>
        ) : null}
      </div>
    </div>
  )
}

function WeightEntryModeSelector({
  value,
  onChange,
  disabled,
}: {
  value: FitnessWeightEntryMode
  onChange: (value: FitnessWeightEntryMode) => void
  disabled: boolean
}) {
  return (
    <div className="mt-4 rounded-2xl border border-fitness-yellow/25 bg-black/70 p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow">Zápis váhy</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          aria-label="Zapisovať celkovú váhu"
          className={cn(
            'min-h-11 rounded-2xl border px-3 py-2 text-xs font-black transition-colors disabled:opacity-50',
            value === 'total'
              ? 'border-fitness-yellow bg-fitness-yellow text-black'
              : 'border-fitness-yellow/20 bg-fitness-surface text-fitness-yellow hover:bg-fitness-yellow/20',
          )}
          onClick={() => onChange('total')}
          disabled={disabled}
        >
          Celková váha
        </button>
        <button
          type="button"
          aria-label="Zapisovať váhu na ľavú a pravú stranu"
          className={cn(
            'min-h-11 rounded-2xl border px-3 py-2 text-xs font-black transition-colors disabled:opacity-50',
            value === 'per_side'
              ? 'border-fitness-yellow bg-fitness-yellow text-black'
              : 'border-fitness-yellow/20 bg-fitness-surface text-fitness-yellow hover:bg-fitness-yellow/20',
          )}
          onClick={() => onChange('per_side')}
          disabled={disabled}
        >
          Na stranu
        </button>
      </div>
      {value === 'per_side' ? (
        <p className="mt-3 text-xs font-semibold text-fitness-warm/70">Pre jednoručky, rehab a asymetrické série. Do progresu ide súčet oboch strán.</p>
      ) : null}
    </div>
  )
}

function RepsInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="rounded-2xl border border-fitness-yellow/20 bg-fitness-surface p-3 text-center">
      <span className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">Opak.</span>
      <input
        aria-label="Opakovania"
        className="mt-2 w-full bg-transparent text-center text-xl font-black text-fitness-yellow outline-none"
        inputMode="numeric"
        value={value}
        onInput={(event) => onChange(event.currentTarget.value)}
      />
    </label>
  )
}

function RirInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="rounded-2xl border border-fitness-yellow/20 bg-fitness-surface p-3 text-center">
      <span className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">RIR</span>
      <input
        aria-label="RIR"
        className="mt-2 w-full bg-transparent text-center text-xl font-black text-fitness-yellow outline-none"
        inputMode="numeric"
        value={value}
        onInput={(event) => onChange(event.currentTarget.value)}
      />
    </label>
  )
}

function SetTypeSelector({
  value,
  onChange,
  disabled,
}: {
  value: FitnessSessionSetType
  onChange: (value: FitnessSessionSetType) => void
  disabled: boolean
}) {
  return (
    <div className="mt-4 rounded-2xl border border-fitness-yellow/25 bg-black/70 p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow">Typ série</p>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {FITNESS_SET_TYPE_OPTIONS.map((option) => {
          const selected = option.value === value
          return (
            <button
              key={option.value}
              type="button"
              aria-label={option.ariaLabel}
              className={cn(
                'min-h-11 rounded-2xl border px-3 py-2 text-xs font-black transition-colors disabled:opacity-50',
                selected
                  ? 'border-fitness-yellow bg-fitness-yellow text-black'
                  : 'border-fitness-yellow/20 bg-fitness-surface text-fitness-yellow hover:bg-fitness-yellow/20',
              )}
              onClick={() => onChange(option.value)}
              disabled={disabled}
            >
              {option.label}
            </button>
          )
        })}
      </div>
      {value === 'warmup' ? (
        <p className="mt-3 text-xs font-semibold text-fitness-warm/70">Rozcvička sa nepočíta do objemu, PR ani progresných odporúčaní.</p>
      ) : null}
    </div>
  )
}

function PlateCalculatorPanel({
  unit,
  barWeight,
  onBarWeightChange,
  plateLoad,
}: {
  unit: FitnessDisplayUnit
  barWeight: string
  onBarWeightChange: (value: string) => void
  plateLoad: ReturnType<typeof calculatePlateLoad>
}) {
  const toneClass = plateLoad.isExact
    ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100'
    : 'border-fitness-yellow/25 bg-fitness-yellow/10 text-fitness-warm'

  return (
    <div className="mt-4 rounded-2xl border border-fitness-yellow/25 bg-black/70 p-4">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-fitness-yellow text-black">
          <Calculator className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow">Kalkulačka kotúčov</p>
          <p className="mt-1 text-xs text-fitness-warm/65">Počíta kotúče na jednu stranu podľa aktuálnej váhy série.</p>
        </div>
      </div>

      <label className="mt-4 block text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">
        Hmotnosť tyče
        <input
          aria-label={`Hmotnosť tyče v ${unit}`}
          className="mt-2 w-full rounded-2xl border border-fitness-yellow/20 bg-fitness-surface px-3 py-3 text-sm font-black text-fitness-yellow outline-none focus:border-fitness-yellow"
          inputMode="decimal"
          value={barWeight}
          onInput={(event) => onBarWeightChange(event.currentTarget.value)}
        />
      </label>

      <div className={`mt-3 rounded-2xl border px-4 py-3 text-sm font-black ${toneClass}`}>
        {formatPlateLoadSummary(plateLoad)}
      </div>

      {!plateLoad.isUnderBar && plateLoad.plates.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {plateLoad.plates.map((plate) => (
            <span key={plate.weight} className="rounded-full border border-fitness-yellow/20 bg-fitness-surface px-3 py-1 text-xs font-black text-fitness-yellow">
              {formatPlateNumber(plate.weight)} {unit} × {plate.count}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function QuickAdjustGroup({
  label,
  decrementLabel,
  incrementLabel,
  decrementText,
  incrementText,
  onDecrement,
  onIncrement,
  disabled,
}: {
  label: string
  decrementLabel: string
  incrementLabel: string
  decrementText: string
  incrementText: string
  onDecrement: () => void
  onIncrement: () => void
  disabled: boolean
}) {
  return (
    <div className="rounded-2xl border border-fitness-yellow/20 bg-black/70 p-2 text-center">
      <p className="mb-2 text-[10px] font-black uppercase tracking-[0.14em] text-fitness-warm/50">{label}</p>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          aria-label={decrementLabel}
          className="flex min-h-11 items-center justify-center rounded-xl border border-fitness-yellow/20 bg-fitness-surface px-2 text-xs font-black text-fitness-yellow transition-colors hover:bg-fitness-yellow hover:text-black disabled:opacity-50"
          onClick={onDecrement}
          disabled={disabled}
        >
          <Minus className="mr-1 size-3" />{decrementText}
        </button>
        <button
          type="button"
          aria-label={incrementLabel}
          className="flex min-h-11 items-center justify-center rounded-xl border border-fitness-yellow/20 bg-fitness-surface px-2 text-xs font-black text-fitness-yellow transition-colors hover:bg-fitness-yellow hover:text-black disabled:opacity-50"
          onClick={onIncrement}
          disabled={disabled}
        >
          <Plus className="mr-1 size-3" />{incrementText}
        </button>
      </div>
    </div>
  )
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function adjustDecimal(current: string, delta: number, min: number, max: number) {
  const next = clamp((Number(current) || 0) + delta, min, max)
  return formatDisplayNumber(next)
}

function adjustInteger(current: string, delta: number, min: number, max: number) {
  const next = clamp(Math.round(Number(current) || 0) + delta, min, max)
  return String(next)
}

function formatLastPerformance(lastPerformance: FitnessLastPerformance, displayUnit: FitnessDisplayUnit) {
  const weight = formatDisplayNumber(convertWeightFromKg(lastPerformance.weightKg, displayUnit))
  const rir = lastPerformance.rir === null ? 'RIR —' : `RIR ${lastPerformance.rir}`
  return `${weight} ${displayUnit} × ${lastPerformance.reps} @ ${rir}`
}

function formatDisplayNumber(value: number) {
  const rounded = Math.round(value * 10) / 10
  return Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1)
}

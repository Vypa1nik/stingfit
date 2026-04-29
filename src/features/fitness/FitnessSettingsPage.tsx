import { useCallback, useEffect, useState } from 'react'

import { AlertTriangle, DatabaseBackup, Eye, EyeOff, RotateCcw, Scale, ShieldCheck, Trash2, Zap } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import type { FitnessImportPreview, FitnessSettingsRecord, FitnessStrongCsvPreview } from '@/features/fitness/fitnessTypes'
import type { FitnessDisplayUnit } from '@/features/fitness/fitnessUnits'
import { sk } from '@/i18n/sk'
import { downloadBlob } from '@/lib/download'
import { cn } from '@/lib/utils'

interface BeforeInstallPromptChoice {
  outcome: 'accepted' | 'dismissed'
  platform: string
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<BeforeInstallPromptChoice>
}

export function FitnessSettingsPage() {
  const [settings, setSettings] = useState<FitnessSettingsRecord | null>(null)
  const [importText, setImportText] = useState('')
  const [importPreview, setImportPreview] = useState<FitnessImportPreview | null>(null)
  const [strongCsvText, setStrongCsvText] = useState('')
  const [strongCsvPreview, setStrongCsvPreview] = useState<FitnessStrongCsvPreview | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isMutating, setIsMutating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const loadSettings = useCallback(async () => {
    setError(null)
    const loadedSettings = await fitnessRepository.getSettings()
    setSettings(loadedSettings)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      try {
        await loadSettings()
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Nepodarilo sa načítať tréningové nastavenia.')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [loadSettings])

  useEffect(() => {
    const standaloneQuery = window.matchMedia?.('(display-mode: standalone)')
    const updateStandalone = () => {
      setIsStandalone(Boolean(standaloneQuery?.matches) || Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone))
    }
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEvent)
    }

    updateStandalone()
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    standaloneQuery?.addEventListener?.('change', updateStandalone)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      standaloneQuery?.removeEventListener?.('change', updateStandalone)
    }
  }, [])

  const installStingFit = async () => {
    if (!installPrompt) {
      setSuccessMessage(sk.fitness.pwa.installUnavailableHint)
      return
    }

    setError(null)
    setSuccessMessage(null)
    try {
      await installPrompt.prompt()
      const choice = await installPrompt.userChoice
      setInstallPrompt(null)
      setSuccessMessage(choice.outcome === 'accepted' ? sk.fitness.pwa.installAccepted : sk.fitness.pwa.installDismissed)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : sk.fitness.pwa.installError)
    }
  }

  const updateDisplayUnit = async (displayUnit: FitnessDisplayUnit) => {
    setIsMutating(true)
    setError(null)
    setSuccessMessage(null)
    try {
      const updatedSettings = await fitnessRepository.updateSettings({ displayUnit })
      setSettings(updatedSettings)
      setSuccessMessage(`Nastavenia uložené: ${updatedSettings.displayUnit}`)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nepodarilo sa uložiť zobrazovanú jednotku.')
    } finally {
      setIsMutating(false)
    }
  }

  const updateGuidanceVisibility = async (showGuidance: boolean) => {
    setIsMutating(true)
    setError(null)
    setSuccessMessage(null)
    try {
      const updatedSettings = await fitnessRepository.updateSettings({ showGuidance })
      setSettings(updatedSettings)
      setSuccessMessage(showGuidance ? 'Pomocné texty zobrazené' : 'Pomocné texty skryté')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nepodarilo sa uložiť viditeľnosť pomocných textov.')
    } finally {
      setIsMutating(false)
    }
  }

  const updateRestSound = async (restSoundEnabled: boolean) => {
    setIsMutating(true)
    setError(null)
    setSuccessMessage(null)
    try {
      const updatedSettings = await fitnessRepository.updateSettings({ restSoundEnabled })
      setSettings(updatedSettings)
      setSuccessMessage(restSoundEnabled ? 'Zvuk pauzy zapnutý' : 'Zvuk pauzy vypnutý')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nepodarilo sa uložiť zvuk pauzy.')
    } finally {
      setIsMutating(false)
    }
  }

  const updateRestVibration = async (restVibrationEnabled: boolean) => {
    setIsMutating(true)
    setError(null)
    setSuccessMessage(null)
    try {
      const updatedSettings = await fitnessRepository.updateSettings({ restVibrationEnabled })
      setSettings(updatedSettings)
      setSuccessMessage(restVibrationEnabled ? 'Vibrácie pauzy zapnuté' : 'Vibrácie pauzy vypnuté')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nepodarilo sa uložiť vibrácie pauzy.')
    } finally {
      setIsMutating(false)
    }
  }

  const exportFitnessJson = async () => {
    setIsMutating(true)
    setError(null)
    setSuccessMessage(null)
    try {
      const exported = await fitnessRepository.exportFitnessData()
      const blob = new Blob([JSON.stringify(exported, null, 2)], { type: 'application/json' })
      const filename = `stingfit-fitness-export-${new Date().toISOString().slice(0, 10)}.json`
      downloadBlob(blob, filename)
      setSuccessMessage(
        `Export tréningových dát je pripravený: ${exported.exercises.length} cvikov, ${exported.personalPlans.length} osobných plánov, ${exported.sessions.length} tréningových záznamov.`, 
      )
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nepodarilo sa exportovať tréningové dáta.')
    } finally {
      setIsMutating(false)
    }
  }

  const resetStarterData = async () => {
    const confirmed = window.confirm('Obnoviť vstavané štartovacie plány StingFit? Tvoje osobné plány, tréningové záznamy a vlastné cviky zostanú lokálne a nezmenené.')
    if (!confirmed) {
      return
    }

    setIsMutating(true)
    setError(null)
    setSuccessMessage(null)
    try {
      const result = await fitnessRepository.resetStarterData()
      setSuccessMessage(`Štartovacie dáta obnovené: ${result.starterPlanCount} štartovacie plány a ${result.starterExerciseCount} štartovacie cviky pripravené.`)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nepodarilo sa obnoviť štartovacie dáta.')
    } finally {
      setIsMutating(false)
    }
  }

  const deleteAllFitnessData = async () => {
    const confirmation = window.prompt('Na trvalé vymazanie všetkých tréningových dát StingFit z tohto zariadenia napíš VYMAZAT TRENING (bez diakritiky). Táto akcia vymaže iba tréningové dáta StingFit uložené na tomto zariadení.')
    if (confirmation !== 'VYMAZAT TRENING') {
      setSuccessMessage(null)
      setError('Vymazanie tréningových dát zrušené. Na potvrdenie napíš VYMAZAT TRENING.')
      return
    }

    setIsMutating(true)
    setError(null)
    setSuccessMessage(null)
    try {
      await fitnessRepository.resetFitnessData()
      const updatedSettings = await fitnessRepository.getSettings()
      setSettings(updatedSettings)
      setImportText('')
      setImportPreview(null)
      setStrongCsvText('')
      setStrongCsvPreview(null)
      setSuccessMessage('Tréningové dáta sú vymazané. Štartovacie šablóny môžeš znova obnoviť alebo importovať.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nepodarilo sa vymazať tréningové dáta.')
    } finally {
      setIsMutating(false)
    }
  }

  const previewStrongCsvImport = () => {
    setError(null)
    setSuccessMessage(null)
    setStrongCsvPreview(null)
    try {
      const preview = fitnessRepository.previewStrongCsvImport(strongCsvText)
      setStrongCsvPreview(preview)
      setSuccessMessage(`Náhľad Strong CSV: ${formatWorkoutCount(preview.workoutCount)}, ${formatExerciseCount(preview.exerciseCount)}, ${formatSetCount(preview.setCount)}.`)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nepodarilo sa pripraviť náhľad Strong CSV.')
    }
  }

  const importStrongCsv = async () => {
    setIsMutating(true)
    setError(null)
    setSuccessMessage(null)
    try {
      const result = await fitnessRepository.importStrongCsvData(strongCsvText)
      setStrongCsvPreview(result)
      setSuccessMessage(`Strong CSV import hotový: ${formatWorkoutCount(result.workoutCount)}, ${formatExerciseCount(result.exerciseCount)} a ${formatSetCount(result.setCount)} pridané do histórie.`)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nepodarilo sa importovať Strong CSV.')
    } finally {
      setIsMutating(false)
    }
  }

  const previewFitnessImport = () => {
    setError(null)
    setSuccessMessage(null)
    setImportPreview(null)
    try {
      const parsed = JSON.parse(importText) as unknown
      const preview = fitnessRepository.previewFitnessImport(parsed)
      setImportPreview(preview)
      setSuccessMessage(`Náhľad importu: ${preview.personalPlanCount} osobných plánov, ${preview.sessionCount} tréningových záznamov, ${preview.completedSessionCount} dokončených.`)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nepodarilo sa pripraviť náhľad importu tréningového JSON.')
    }
  }

  const restoreFitnessImport = async () => {
    const confirmed = window.confirm('Nahradiť všetky lokálne tréningové dáta StingFit týmto JSON súborom? Táto akcia prepíše iba fitness tabuľky StingFit.')
    if (!confirmed) {
      return
    }

    setIsMutating(true)
    setError(null)
    setSuccessMessage(null)
    try {
      const parsed = JSON.parse(importText) as unknown
      const result = await fitnessRepository.importFitnessData(parsed, { mode: 'replace' })
      const updatedSettings = await fitnessRepository.getSettings()
      setSettings(updatedSettings)
      setImportPreview(result)
      setSuccessMessage(`Import tréningových dát obnovený: ${result.personalPlanCount} osobných plánov a ${result.sessionCount} tréningových záznamov.`)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nepodarilo sa obnoviť import tréningového JSON.')
    } finally {
      setIsMutating(false)
    }
  }

  const displayUnit = settings?.displayUnit ?? 'kg'
  const showGuidance = settings?.showGuidance ?? true
  const restSoundEnabled = settings?.restSoundEnabled ?? true
  const restVibrationEnabled = settings?.restVibrationEnabled ?? true

  return (
    <div className="space-y-6">
      <section className="fitness-hero-panel p-6 lg:p-8">
        <Badge className="fitness-badge">Lokálne nastavenia</Badge>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.06em] text-white sm:text-5xl">Súkromné tréningové dáta v zariadení.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-fitness-warm/75">
          Bez prihlasovania, cloudu a telemetrie. Tréningové nastavenia používajú existujúcu lokálnu SQLite cestu.
        </p>
      </section>

      {isLoading ? <StatusMessage tone="info" message="Načítavam lokálne tréningové nastavenia…" /> : null}
      {successMessage ? <StatusMessage tone="success" message={successMessage} /> : null}
      {error ? <StatusMessage tone="error" message={error} /> : null}

      <section className="grid gap-6 lg:grid-cols-4">
        <Card title="Jednotky" description="Uložené váhy zostávajú v kg; zobrazenie môžeš prepínať bez zmeny histórie.">
          <div className="rounded-2xl bg-fitness-yellow px-4 py-4 text-center text-2xl font-black text-black">kg / lb</div>
          <p className="mt-3 text-sm font-semibold text-text-secondary dark:text-text-secondary-dark">Aktuálna jednotka zobrazenia: {displayUnit}</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {(['kg', 'lb'] as const).map((unit) => (
              <Button
                key={unit}
                type="button"
                variant={displayUnit === unit ? 'primary' : 'secondary'}
                className={cn(displayUnit === unit ? 'fitness-action' : '')}
                leadingIcon={<Scale className="size-4" />}
                onClick={() => void updateDisplayUnit(unit)}
                disabled={isLoading || isMutating}
              >
                Použiť {unit}
              </Button>
            ))}
          </div>
          <p className="mt-3 text-xs text-text-secondary dark:text-text-secondary-dark">Výpočty zostávajú v kg kvôli presnosti a konzistentnému exportu.</p>
        </Card>

        <Card title="Viditeľnosť pomoci" description="Skry voliteľné vysvetľujúce panely, keď chceš tichšiu aplikáciu.">
          <div className="rounded-2xl bg-fitness-yellow px-4 py-4 text-center text-2xl font-black text-black">pomoc</div>
          <p className="mt-3 text-sm font-semibold text-text-secondary dark:text-text-secondary-dark">Pomocné texty: {showGuidance ? 'zapnuté' : 'vypnuté'}</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant={showGuidance ? 'primary' : 'secondary'}
              className={cn(showGuidance ? 'fitness-action' : '')}
              leadingIcon={<Eye className="size-4" />}
              onClick={() => void updateGuidanceVisibility(true)}
              disabled={isLoading || isMutating}
            >
              Zobraziť pomoc
            </Button>
            <Button
              type="button"
              variant={!showGuidance ? 'primary' : 'secondary'}
              className={cn(!showGuidance ? 'fitness-action' : '')}
              leadingIcon={<EyeOff className="size-4" />}
              onClick={() => void updateGuidanceVisibility(false)}
              disabled={isLoading || isMutating}
            >
              Skryť pomoc
            </Button>
          </div>
          <p className="mt-3 text-xs text-text-secondary dark:text-text-secondary-dark">Hlavné ovládanie, chránené štítky a potvrdenia zostávajú viditeľné.</p>
        </Card>

        <Card title="Signál pauzy" description="Upozornenie po skončení oddychu počas živého tréningu.">
          <div className="rounded-2xl bg-fitness-yellow px-4 py-4 text-center text-2xl font-black text-black">pauza</div>
          <div className="mt-3 space-y-1 text-sm font-semibold text-text-secondary dark:text-text-secondary-dark">
            <p>Zvuk pauzy: {restSoundEnabled ? 'zapnutý' : 'vypnutý'}</p>
            <p>Vibrácie pauzy: {restVibrationEnabled ? 'zapnuté' : 'vypnuté'}</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant={restSoundEnabled ? 'primary' : 'secondary'}
              className={cn(restSoundEnabled ? 'fitness-action' : '')}
              leadingIcon={<Zap className="size-4" />}
              onClick={() => void updateRestSound(!restSoundEnabled)}
              disabled={isLoading || isMutating}
            >
              {restSoundEnabled ? 'Vypnúť zvuk' : 'Zapnúť zvuk'}
            </Button>
            <Button
              type="button"
              variant={restVibrationEnabled ? 'primary' : 'secondary'}
              className={cn(restVibrationEnabled ? 'fitness-action' : '')}
              leadingIcon={<Zap className="size-4" />}
              onClick={() => void updateRestVibration(!restVibrationEnabled)}
              disabled={isLoading || isMutating}
            >
              {restVibrationEnabled ? 'Vypnúť vibrácie' : 'Zapnúť vibrácie'}
            </Button>
          </div>
          <p className="mt-3 text-xs text-text-secondary dark:text-text-secondary-dark">Zvuk sa pripraví po prvom ťuknutí v tréningu; vibrácie fungujú len na podporovaných zariadeniach.</p>
        </Card>

        <Card title="Záloha" description="Export a záloha zostávajú lokálne a čitateľné.">
          <div className="flex items-center gap-3 rounded-2xl border border-fitness-yellow/30 bg-black px-4 py-4 text-fitness-warm">
            <DatabaseBackup className="size-5 text-fitness-yellow" />
            <span className="text-sm">Stiahni JSON snímku iba s tréningovými dátami. Neodosiela sa žiadna sieťová požiadavka.</span>
          </div>
          <Button className="fitness-action mt-4 w-full" leadingIcon={<DatabaseBackup className="size-4" />} onClick={() => void exportFitnessJson()} disabled={isLoading || isMutating}>
            Exportovať tréningový JSON
          </Button>
        </Card>

        <Card title="Štartovacie dáta" description="Bezpečná obnova vstavaných štartovacích plánov.">
          <div className="flex items-center gap-3 rounded-2xl border border-fitness-yellow/30 bg-black px-4 py-4 text-fitness-warm">
            <RotateCcw className="size-5 text-fitness-yellow" />
            <span className="text-sm">Obnov Tlak/Ťah/Nohy, Vrch/Spodok a Celé telo 3× bez vymazania osobných dát.</span>
          </div>
          <Button variant="secondary" className="mt-4 w-full" leadingIcon={<RotateCcw className="size-4" />} onClick={() => void resetStarterData()} disabled={isLoading || isMutating}>
            Obnoviť štartovacie dáta
          </Button>
        </Card>

        <Card title={sk.fitness.pwa.installTitle} description={sk.fitness.pwa.installDescription}>
          <div className="space-y-3 rounded-2xl border border-fitness-yellow/30 bg-black px-4 py-4 text-fitness-warm">
            <p className="text-sm font-black text-fitness-yellow">{sk.fitness.pwa.addToHome}</p>
            <p className="text-sm text-fitness-warm/70">{sk.fitness.pwa.offlineTraining}</p>
            <p className="text-xs font-semibold text-fitness-warm/55">{sk.fitness.pwa.privatePromise}</p>
          </div>
          <Button className="fitness-action mt-4 w-full" leadingIcon={<ShieldCheck className="size-4" />} onClick={() => void installStingFit()} disabled={isLoading || isMutating || isStandalone}>
            {isStandalone ? sk.fitness.pwa.installedButton : sk.fitness.pwa.installButton}
          </Button>
          {!installPrompt && !isStandalone ? (
            <p className="mt-3 text-xs text-text-secondary dark:text-text-secondary-dark">{sk.fitness.pwa.manualInstallHint}</p>
          ) : null}
        </Card>
      </section>

      <Card title="Import zo Strong CSV" description="Vlož export zo Strong. Import sa pridá do histórie ako dokončené lokálne tréningy bez cloudu a bez prepísania existujúcich dát.">
        <div className="space-y-4">
          <label className="block text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">
            Import zo Strong CSV
            <textarea
              aria-label="Import zo Strong CSV"
              className="mt-2 min-h-40 w-full rounded-2xl border border-fitness-yellow/30 bg-black px-4 py-3 font-mono text-xs text-fitness-warm outline-none focus:border-fitness-yellow"
              value={strongCsvText}
              onInput={(event) => setStrongCsvText(event.currentTarget.value)}
              placeholder="Sem vlož CSV export zo Strong: Date, Workout Name, Exercise Name, Set Order, Weight, Weight Unit, Reps, RPE…"
            />
          </label>
          {strongCsvPreview ? (
            <div className="rounded-2xl border border-fitness-yellow/30 bg-black px-4 py-4 text-sm text-fitness-warm">
              <p className="font-black text-fitness-yellow">Strong CSV náhľad pripravený</p>
              <p className="mt-1 text-fitness-warm/70">
                {formatWorkoutCount(strongCsvPreview.workoutCount)} · {formatExerciseCount(strongCsvPreview.exerciseCount)} · {formatSetCount(strongCsvPreview.setCount)}
                {strongCsvPreview.skippedRowCount > 0 ? ` · preskočené riadky: ${strongCsvPreview.skippedRowCount}` : ''}
              </p>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={previewStrongCsvImport} disabled={isLoading || isMutating || !strongCsvText.trim()}>
              Zobraziť náhľad Strong CSV
            </Button>
            <Button className="fitness-action" onClick={() => void importStrongCsv()} disabled={isLoading || isMutating || !strongCsvText.trim()}>
              Importovať Strong CSV
            </Button>
          </div>
          <p className="text-xs text-text-secondary dark:text-text-secondary-dark">
            Váhy v lb sa prepočítajú na kg, RPE sa uloží ako približné RIR a neznáme cviky sa vytvoria ako vlastné importované cviky.
          </p>
        </div>
      </Card>

      <Card title="Obnova z tréningového JSON" description="Vlož tréningový export StingFit, skontroluj náhľad a potom lokálne nahraď iba tréningové tabuľky.">
        <div className="space-y-4">
          <label className="block text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">
            Import tréningového JSON
            <textarea
              aria-label="Import tréningového JSON"
              className="mt-2 min-h-40 w-full rounded-2xl border border-fitness-yellow/30 bg-black px-4 py-3 font-mono text-xs text-fitness-warm outline-none focus:border-fitness-yellow"
              value={importText}
              onInput={(event) => setImportText(event.currentTarget.value)}
              placeholder="Sem vlož obsah súboru stingfit-fitness-export-YYYY-MM-DD.json."
            />
          </label>
          {importPreview ? (
            <div className="rounded-2xl border border-fitness-yellow/30 bg-black px-4 py-4 text-sm text-fitness-warm">
              <p className="font-black text-fitness-yellow">Náhľad pripravený</p>
              <p className="mt-1 text-fitness-warm/70">
                {importPreview.exerciseCount} cvikov · {importPreview.starterPlanCount} štartovacích plánov · {importPreview.personalPlanCount} osobných plánov · {importPreview.sessionCount} tréningových záznamov · jednotka {importPreview.displayUnit}
              </p>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={previewFitnessImport} disabled={isLoading || isMutating || !importText.trim()}>
              Zobraziť náhľad importu
            </Button>
            <Button className="fitness-action" onClick={() => void restoreFitnessImport()} disabled={isLoading || isMutating || !importText.trim()}>
              Obnoviť tréningový JSON
            </Button>
          </div>
        </div>
      </Card>

      <Card title="Nebezpečná zóna" description="Vymaž iba tréningové tabuľky StingFit na tomto zariadení.">
        <div className="flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-4 text-sm text-rose-100">
          <Trash2 className="mt-0.5 size-5 shrink-0 text-rose-300" />
          <span>Vymaže cviky, plány, tréningové záznamy, série a tréningové nastavenia — iba tréningové dáta StingFit uložené na tomto zariadení.</span>
        </div>
        <Button variant="danger" className="mt-4 w-full" leadingIcon={<Trash2 className="size-4" />} onClick={() => void deleteAllFitnessData()} disabled={isLoading || isMutating}>
          Vymazať tréningové dáta
        </Button>
      </Card>

      <Card title="Sľub súkromia" description="Produkt zostáva lokálny a súkromný už v návrhu.">
        <div className="flex items-center gap-3 rounded-2xl border border-fitness-yellow/30 bg-fitness-yellow/10 px-4 py-4 text-sm text-text-secondary dark:text-text-secondary-dark">
          <ShieldCheck className="size-5 text-fitness-orange" />
          Žiadne účty, predplatné, analytika, telemetria ani paywally nie sú súčasťou smerovania produktu.
        </div>
      </Card>
    </div>
  )
}

function formatWorkoutCount(count: number) {
  if (count === 1) return '1 tréning'
  if (count > 1 && count < 5) return `${count} tréningy`
  return `${count} tréningov`
}

function formatExerciseCount(count: number) {
  if (count === 1) return '1 cvik'
  if (count > 1 && count < 5) return `${count} cviky`
  return `${count} cvikov`
}

function formatSetCount(count: number) {
  if (count === 1) return '1 séria'
  if (count > 1 && count < 5) return `${count} série`
  return `${count} sérií`
}

function StatusMessage({ tone, message }: { tone: 'success' | 'error' | 'info'; message: string }) {
  const isError = tone === 'error'
  const isSuccess = tone === 'success'
  return (
    <div
      className={cn(
        'rounded-2xl border px-4 py-3 text-sm font-semibold',
        isError
          ? 'border-rose-500/30 bg-rose-500/10 text-rose-200'
          : isSuccess
            ? 'border-fitness-yellow/40 bg-fitness-yellow/10 text-fitness-yellow'
            : 'border-fitness-yellow/20 bg-black text-fitness-warm/70',
      )}
    >
      {isError ? <AlertTriangle className="mr-2 inline size-4" /> : <Zap className="mr-2 inline size-4" />}
      {message}
    </div>
  )
}

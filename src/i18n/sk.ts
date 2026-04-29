export const sk = {
  fitness: {
    pwa: {
      installTitle: 'Inštalácia aplikácie',
      installDescription: 'Pridaj StingFit na plochu ako lokálnu PWA aplikáciu pre rýchle otvorenie vo fitku.',
      addToHome: 'Pridať StingFit na plochu',
      offlineTraining: 'Offline tréning otvoríš aj bez stabilnej siete po prvom načítaní aplikácie.',
      privatePromise: 'Bez účtu, cloudu a telemetrie. Dáta zostávajú v zariadení.',
      installedButton: 'StingFit je nainštalovaný',
      installButton: 'Nainštalovať StingFit',
      manualInstallHint: 'Ak prehliadač nezobrazí systémový prompt, použi menu prehliadača: Pridať na plochu / Install app.',
      installUnavailableHint: 'Ak tlačidlo inštalácie nie je dostupné, použi v prehliadači možnosť Pridať na plochu / Install app.',
      installAccepted: 'StingFit sa inštaluje ako lokálna PWA aplikácia.',
      installDismissed: 'Inštalácia StingFit bola zrušená. Dáta zostávajú lokálne dostupné v prehliadači.',
      installError: 'Nepodarilo sa spustiť inštaláciu StingFit.',
    },
    backupNudge: {
      title: 'Čas na lokálnu zálohu',
      description: 'Po 30 dokončených tréningoch je rozumné uložiť export mimo prehliadača.',
      heading: 'Exportuj si StingFit zálohu.',
      body: 'Záloha je obyčajný lokálny JSON. Bez účtu, cloudu a telemetrie — súbor si ulož do vlastného disku alebo offline archívu.',
      exportButton: 'Exportovať zálohu',
      snoozeButton: 'Pripomenúť pri ďalších 30',
      exportSuccess: 'Záloha tréningov pripravená',
      snoozeSuccess: 'Pripomienka zálohy sa zobrazí po ďalších 30 tréningoch.',
      exportError: 'Nepodarilo sa pripraviť lokálnu zálohu.',
    },
    setGestures: {
      completedSetsTitle: 'Dokončené série aktuálneho cviku',
      completedSetsDescription: 'Ak sa preklikneš vo váhe, RIR alebo type série, oprav záznam bez rušenia tréningu.',
      completedSetAria: (setNumber: number) => `Séria ${setNumber}: potiahni doprava pre duplikovanie alebo doľava pre preskočenie`,
      duplicateButton: 'Duplikovať',
      skipButton: 'Preskočiť',
      duplicateAria: (setNumber: number) => `Duplikovať sériu ${setNumber}`,
      skipAria: (setNumber: number) => `Preskočiť sériu ${setNumber}`,
      editButton: 'Upraviť',
      editAria: (setNumber: number) => `Upraviť sériu ${setNumber}`,
      emptyCompletedSets: 'Zatiaľ nie je dokončená žiadna séria aktuálneho cviku.',
    },
  },
} as const

export type SlovakCatalog = typeof sk

import type { FitnessCopyCatalog } from "@/i18n/sk";

export const en = {
	fitness: {
		pwa: {
			installTitle: "[en] Inštalácia aplikácie",
			installDescription:
				"[en] Pridaj StingFit na plochu ako lokálnu PWA aplikáciu pre rýchle otvorenie vo fitku.",
			addToHome: "[en] Pridať StingFit na plochu",
			offlineTraining:
				"[en] Offline tréning otvoríš aj bez stabilnej siete po prvom načítaní aplikácie.",
			privatePromise:
				"[en] Bez účtu, cloudu a telemetrie. Dáta zostávajú v zariadení.",
			installedButton: "[en] StingFit je nainštalovaný",
			installButton: "[en] Nainštalovať StingFit",
			manualInstallHint:
				"[en] Ak prehliadač nezobrazí systémový prompt, použi menu prehliadača alebo otvor návod nižšie.",
			installGuideDescription:
				"[en] Kroky pre iOS Safari, Android Chrome a Chrome/Edge na desktope.",
			installGuideButton: "[en] Otvoriť návod na inštaláciu",
			installUnavailableHint:
				"[en] Ak tlačidlo inštalácie nie je dostupné, použi návod na inštaláciu pre svoj prehliadač.",
			installAccepted: "[en] StingFit sa inštaluje ako lokálna PWA aplikácia.",
			installDismissed:
				"[en] Inštalácia StingFit bola zrušená. Dáta zostávajú lokálne dostupné v prehliadači.",
			installError: "[en] Nepodarilo sa spustiť inštaláciu StingFit.",
		},
		backupNudge: {
			title: "[en] Čas na lokálnu zálohu",
			description:
				"[en] Po 30 dokončených tréningoch je rozumné uložiť export mimo prehliadača.",
			heading: "[en] Exportuj si StingFit zálohu.",
			body: "[en] Záloha je obyčajný lokálny JSON. Bez účtu, cloudu a telemetrie — súbor si ulož do vlastného disku alebo offline archívu.",
			exportButton: "[en] Exportovať zálohu",
			snoozeButton: "[en] Pripomenúť pri ďalších 30",
			exportSuccess: "[en] Záloha tréningov pripravená",
			snoozeSuccess:
				"[en] Pripomienka zálohy sa zobrazí po ďalších 30 tréningoch.",
			exportError: "[en] Nepodarilo sa pripraviť lokálnu zálohu.",
		},
		plateLoad: {
			title: "[en] Kalkulačka kotúčov",
			setLoggerDescription:
				"[en] Počíta kotúče na jednu stranu podľa aktuálnej váhy série.",
			standaloneDescription:
				"[en] Počíta kotúče na jednu stranu pre zadanú cieľovú váhu.",
			barWeightLabel: "[en] Hmotnosť tyče",
			barWeightAria: (unit: string) => `[en] Hmotnosť tyče v ${unit}`,
		},
		plates: {
			badge: "[en] Kotúče",
			heroTitle: "[en] Kalkulačka kotúčov pred sériou.",
			heroDescription:
				"[en] Zadaj cieľ, skontroluj tyč a nalož rovnaké kotúče na obe strany.",
			quickCardTitle: "[en] Rýchly výpočet",
			quickCardDescription:
				"[en] Použi ho z palety príkazov alebo z mobilnej spodnej navigácie, keď stojíš pri stojane.",
			targetWeightLabel: (unit: string) => `[en] Cieľová váha v ${unit}`,
			howToReadTitle: "[en] Ako to čítať",
			perSideExplanation:
				"[en] Na stranu znamená rovnaký počet kotúčov na ľavú aj pravú stranu tyče.",
			closestLowerExplanation:
				"[en] Ak cieľ nevychádza presne, StingFit ukáže najbližšiu nižšiu naložiteľnú váhu.",
			localUnitExplanation:
				"[en] Jednotky berie z lokálnych nastavení, bez cloudu a bez sledovania.",
			loadUnitError:
				"[en] Nepodarilo sa načítať jednotky pre kalkulačku kotúčov.",
		},
		history: {
			queryError: "[en] Nepodarilo sa načítať históriu tréningov.",
			updateSetSuccess: "[en] Séria v histórii opravená",
			updateSetError: "[en] Nepodarilo sa opraviť sériu v histórii.",
			badge: "[en] História tréningov",
			heroTitle: "[en] Tvoj tréningový zápisník.",
			heroDescription:
				"[en] Dokončené tréningy, objem a PR odznaky sa počítajú lokálne z tréningovej histórie.",
			loadingTitle: "[en] Načítavam históriu",
			loadingDescription: "[en] Čítam dokončené tréningy z lokálneho úložiska.",
			loadingBody: "[en] Nabíjam tréningovú históriu…",
			errorTitle: "[en] Chyba histórie",
			errorDescription: "[en] Lokálna databáza vrátila chybu.",
			emptyTitle: "[en] Zatiaľ žiadne dokončené tréningy",
			emptyDescription:
				"[en] Spusti a dokonči plánovaný tréning, aby sa zápisník naplnil reálnou lokálnou históriou.",
			emptyCta: "[en] Prejsť na tréning",
		},
		stats: {
			queryError: "[en] Nepodarilo sa načítať tréningové štatistiky.",
			badge: "[en] PR napätie",
			badgeHint: "[en] Blesk označuje progres.",
			heroTitle: "[en] Štatistiky, ktoré motivujú, nie rozptyľujú.",
			heroDescription:
				"[en] Týždenná konzistentnosť, objem, PR udalosti, odhad 1RM a odporúčania progresu sa odvodzujú z dokončených tréningov.",
			loadingTitle: "[en] Načítavam štatistiky",
			loadingDescription: "[en] Počítam lokálny tréningový progres.",
			loadingBody: "[en] Nabíjam PR napätie…",
			errorTitle: "[en] Chyba štatistík",
			errorDescription: "[en] Lokálna databáza vrátila chybu.",
			emptyTitle: "[en] Zatiaľ žiadne štatistiky",
			emptyDescription:
				"[en] Dokonči tréning a StingFit lokálne vytvorí PR, objem a odporúčania progresu.",
			emptyCta: "[en] Prejsť na tréning",
		},
		profiles: {
			activeProfileLabel: "[en] Aktívny profil",
			switchError: "[en] Nepodarilo sa prepnúť profil.",
		},
		coachMode: {
			settingsTitle: "[en] Som tréner",
			settingsDescription:
				"[en] Zapni coach pohľad pre klientov, plány, šablóny a rekapy bez účtu alebo cloudu.",
			settingsStatus: (enabled: boolean) =>
				`[en] Coach Mode: ${enabled ? "zapnutý" : "vypnutý"}`,
			enableButton: "[en] Zapnúť Coach Mode",
			disableButton: "[en] Vypnúť Coach Mode",
			enabledSuccess: "[en] Coach Mode zapnutý",
			disabledSuccess: "[en] Coach Mode vypnutý",
			saveError: "[en] Nepodarilo sa uložiť Coach Mode.",
			loadingTitle: "[en] Načítavam Coach Mode",
			loadingDescription: "[en] Kontrolujem lokálne nastavenie trénera.",
			loadingBody: "[en] Pripravujem coach pohľad…",
			disabledTitle: "[en] Coach Mode je vypnutý",
			disabledDescription:
				"[en] Coach obrazovky sú skryté, kým ich výslovne nezapneš v Nastaveniach.",
			disabledBody:
				"[en] Zapni Som tréner v Nastaveniach. Nevytvorí sa účet, cloud ani synchronizácia.",
			badge: "[en] Coach Mode",
			clientsTitle: "[en] Klienti trénera",
			clientsDescription:
				"[en] Lokálny zoznam klientskych profilov pripravený pre ďalšie coach moduly.",
			plansTitle: "[en] Coach plány",
			plansDescription:
				"[en] Miesto pre tvorbu a export plánov pre klientov v ďalších moduloch.",
			templatesTitle: "[en] Šablóny trénera",
			templatesDescription:
				"[en] Súkromná lokálna knižnica coach šablón bude doplnená v ďalších moduloch.",
			recapsTitle: "[en] Rekapy od klientov",
			recapsDescription:
				"[en] Read-only prehľad recap packov od klientov bude doplnený v ďalších moduloch.",
			localFirstTitle: "[en] Lokálne a explicitné",
			localFirstDescription:
				"[en] Coach Mode je perspektíva v tej istej lokálnej databáze, nie samostatná cloudová aplikácia.",
			placeholderBody:
				"[en] Plan Packy, Recap Packy a klientsky workflow prídu v nasledujúcich Phase 3 moduloch.",
			clientsEmptyTitle: "[en] Zatiaľ žiadni klienti",
			clientsEmptyDescription:
				"[en] Vytvor klientsky profil v prepínači profilov. Žiadny cloud ani konto nie sú potrebné.",
			clientsNoRecap: "[en] Zatiaľ bez rekapu",
			clientsPrivacyNote: "[en] Žiadny cloud ani konto",
			plansEmptyTitle: "[en] Zatiaľ bez coach plánov",
			plansEmptyDescription:
				"[en] Vytvor alebo uprav osobný plán v Plánoch a potom ho exportuj ako Plan Pack.",
			plansEditButton: "[en] Upraviť v Plánoch",
			plansExportButton: "[en] Exportovať .stfplan",
			planPackSuccess: "[en] Plan Pack pripravený",
			planPackError: "[en] Nepodarilo sa exportovať Plan Pack.",
			templatesEmptyTitle: "[en] Zatiaľ bez coach šablón",
			templatesEmptyDescription:
				"[en] Súkromná knižnica coach šablón príde po základnom exporte plánov.",
			templatesPrivacyNote: "[en] Súkromná knižnica",
			recapsUploadLabel: "[en] Nahrať .stfrecap",
			recapsUploadDescription:
				"[en] Vyber Recap Pack od klienta. Náhľad je read-only a nič sa neukladá do lokálnej databázy.",
			recapsEmptyTitle: "[en] Zatiaľ bez načítaného rekapu",
			recapsEmptyDescription:
				"[en] Nahraj .stfrecap a skontroluj, čo klient odcvičil.",
			recapsLoadedTitle: "[en] Recap Pack načítaný",
			recapsReadOnlyNote: "[en] read-only náhľad bez zápisu do databázy",
			recapsImportError: "[en] Nepodarilo sa načítať Recap Pack.",
			formatSessionCount: (count: number) =>
				count === 1 ? "[en] 1 tréning" : `[en] ${count} tréningov`,
			formatCompletedSetCount: (count: number) =>
				count === 1
					? "[en] 1 dokončená séria"
					: `[en] ${count} dokončených sérií`,
		},
		traineeCoach: {
			planImportTitle: "[en] Importovať plán od trénera",
			planImportDescription:
				"[en] Vyber .stfplan Plan Pack, skontroluj náhľad a potom ho pridaj ako lokálny osobný plán.",
			planImportEmptyTitle: "[en] Zatiaľ bez Plan Packu",
			planImportEmptyDescription:
				"[en] Po výbere súboru uvidíš názov plánu, trénera a rozsah pred uložením.",
			planImportLoadedTitle: "[en] Plan Pack načítaný",
			planImportCommitButton: "[en] Pridať plán do StingFit",
			planImportSuccess: "[en] Plán od trénera pridaný",
			planImportError: "[en] Nepodarilo sa importovať plán od trénera.",
			recapExportTitle: "[en] Vytvoriť rekap pre trénera",
			recapExportDescription:
				"[en] Vyber dátumový rozsah a StingFit pripraví .stfrecap súbor iba z dokončených tréningov v tomto zariadení.",
			recapFromLabel: "[en] Recap od dátumu",
			recapToLabel: "[en] Recap do dátumu",
			recapExportButton: "[en] Exportovať .stfrecap",
			recapExportSuccess: "[en] Recap Pack pripravený",
			recapExportError: "[en] Nepodarilo sa vytvoriť Recap Pack.",
			recapEmptyRange: "[en] V tomto rozsahu nie je dokončený tréning.",
			recapPrivacyNote:
				"[en] Bez účtu, cloudu a telemetrie — súbor odošleš ručne.",
			formatPlanPackSummary: (weekCount: number, workoutCount: number) =>
				`[en] ${weekCount} týždeň · ${workoutCount} tréningov`,
			formatRecapSessionCount: (count: number) =>
				count === 1
					? "[en] 1 tréning v rozsahu"
					: `[en] ${count} tréningov v rozsahu`,
		},
		simpleStart: {
			badge: "[en] Jednoduchý štart",
			noSetupBadge: "[en] Bez nastavovania",
			title: "[en] Začni úplne jednoducho",
			description:
				"[en] Vyber len počet dní. StingFit pripraví plán, prvý tréning a detaily môžeš riešiť až neskôr.",
			preparePlan: "[en] Pripraviť plán",
			quickTitle: "[en] Nechcem plánovať",
			quickDescription:
				"[en] Otvor prázdny zápisník, pridaj cviky vo fitku a len zapisuj série.",
			quickButton: "[en] Len rýchly tréning",
		},
		onboarding: {
			eyebrow: "[en] Štart",
			title: "[en] Vyber jednoduchý začiatok",
			description:
				"[en] Nemusíš čítať návod ani rozumieť splitom. Začni pripraveným plánom alebo otvor rýchly tréning.",
			privacyTitle: "[en] Súkromné a lokálne",
			privacyDescription:
				"[en] Bez účtu, cloudu a telemetrie. Tréningy, plány a nastavenia ostávajú v tomto zariadení a exportuješ ich ručne.",
			themeTitle: "[en] Vzhľad môžeš doladiť hneď",
			themeDescription:
				"[en] Tmavý režim je najčitateľnejší vo fitku, svetlý sa hodí pri plánovaní. Výber nie je povinný.",
			starterUnavailable: (title: string) =>
				`[en] Štartovací plán ${title} nie je dostupný.`,
			preparePlanError:
				"[en] Nepodarilo sa pripraviť jednoduchý tréningový plán.",
		},
		setLogger: {
			plateCalculatorTitle: "[en] Kalkulačka kotúčov",
			plateCalculatorCollapsedHint:
				"[en] Otvor, keď chceš prepočítať kotúče pre aktuálnu váhu série.",
		},
		setGestures: {
			completedSetsTitle: "[en] Dokončené série aktuálneho cviku",
			completedSetsDescription:
				"[en] Ak sa preklikneš vo váhe, RIR alebo type série, oprav záznam bez rušenia tréningu.",
			completedSetAria: (setNumber: number) =>
				`[en] Séria ${setNumber}: potiahni doprava pre duplikovanie alebo doľava pre preskočenie`,
			duplicateButton: "[en] Duplikovať",
			skipButton: "[en] Preskočiť",
			duplicateAria: (setNumber: number) =>
				`[en] Duplikovať sériu ${setNumber}`,
			skipAria: (setNumber: number) => `[en] Preskočiť sériu ${setNumber}`,
			editButton: "[en] Upraviť",
			editAria: (setNumber: number) => `[en] Upraviť sériu ${setNumber}`,
			emptyCompletedSets:
				"[en] Zatiaľ nie je dokončená žiadna séria aktuálneho cviku.",
		},
	},
} satisfies FitnessCopyCatalog;

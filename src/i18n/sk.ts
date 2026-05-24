export const sk = {
	fitness: {
		nav: {
			items: {
				today: "Dnes",
				quickTraining: "Rýchly tréning",
				progressLifts: "Cviky (grafy)",
				progressPrs: "PR Timeline",
				progressBody: "Telo",
				progressJournal: "Zápisník",
				progressHistory: "História",
				plans: "Plány",
				plates: "Kalkulačka kotúčov",
			},
			groups: {
				train: "Tréning",
				progress: "Progres",
				plans: "Plány",
				tools: "Nástroje",
			},
			sidebar: {
				localBadge: "Lokálne",
				closeMenu: "Zavrieť navigačné menu",
				expandSidebar: "Rozbaliť bočný panel",
				collapseSidebar: "Zbaliť bočný panel",
				settings: "Nastavenia",
			},
			topBar: {
				openMenu: "Otvoriť navigačné menu",
				brandKicker: "StingFit V3",
				pillarSummary: "Tréning · Progres · Plány",
				searchAria: "Otvoriť vyhľadávanie",
				searchPlaceholder: "Hľadať tréningy, plány, cviky",
				commandsButton: "Príkazy",
				mobileStartButton: "Štart",
				desktopStartButton: "Spustiť tréning",
			},
			mobile: {
				ariaLabel: "Hlavné mobilné taby",
				training: "Tréning",
				progress: "Progres",
				startTraining: "+ Tréning",
				plans: "Plány",
				more: "Viac",
			},
			moreSheet: {
				title: "Viac",
				ariaLabel: "Viac možností",
				closeOverlay: "Zatvoriť ponuku Viac",
				closeButton: "Zatvoriť",
				items: {
					quick: {
						label: "Rýchly tréning",
						description: "Spusti zápisník bez plánu.",
					},
					plates: {
						label: "Kalkulačka kotúčov",
						description: "Spočítaj kotúče na tyč.",
					},
					history: {
						label: "História",
						description: "Skoč rovno do tréningového zápisníka.",
					},
					coach: {
						label: "Coach Mode",
						description: "Klienti, šablóny, recap pack.",
					},
					settings: {
						label: "Nastavenia",
						description: "Jednotky, dáta, súkromie.",
					},
				},
			},
		},
		progressHub: {
			badge: "Progres & Zápisník",
			kicker: "Všetko o tvojom raste na jednom mieste.",
			title: "Ako rastieš.",
			description:
				"Štyri pohľady — váhy cvikov, PR feed, telesné miery a osobný zápisník. Všetko sa odvodzuje lokálne z tvojich dokončených tréningov a nikdy neopúšťa zariadenie.",
			cards: {
				consistency: "Konzistencia",
				weeklyVolume: "Týždenný objem",
				lastPr: "Posledný PR",
				completedWorkouts: (count: number) =>
					count === 1
						? "1 dokončený tréning."
						: `${count} dokončených tréningov.`,
				emptyPr: "Zatiaľ žiadny PR. Dokonči tréning a sem prikvitne.",
			},
			tabs: {
				ariaLabel: "Progres taby",
				lifts: "Cviky",
				prs: "PR Timeline",
				body: "Telo",
				journal: "Zápisník",
				history: "História",
			},
		},
		trainHub: {
			firstExerciseLabel: "Prvý cvik",
			unsetExercise: "Nenastavené",
			hero: {
				badge: "Tréning",
				kicker: "Tréningový prehľad V3",
				title: "Dnes máš jednu jasnú akciu.",
				description:
					"Otvor tréning, zapíš série a až po výkone rieš Progres alebo Plány. Táto obrazovka je velín pre otázku: čo mám robiť teraz?",
				quickSessionButton: "Rýchly zápis bez plánu",
				editPlanButton: "Upraviť plán",
			},
			fallback: {
				kicker: "Dnes",
				title: "Vyber tréning zo zoznamu nižšie.",
				description:
					"StingFit nenašiel jednoznačné odporúčanie, ale pripravené tréningy sú dostupné v rozbaľovacom zozname.",
			},
			allWorkouts: {
				summary: "Ukázať všetky tréningy",
				description:
					"Toto je len záloha, keď chceš vedome vybrať iný deň. Najjednoduchšia cesta je karta vyššie.",
			},
			upNext: {
				firstTitle: "Prvý tréning pripravený",
				nextTitle: "Ďalší tréning pripravený",
				firstDescription: "Stlač štart a zapisuj. Editor plánu môže počkať.",
				nextDescription:
					"Odporúčané podľa lokálnej histórie; rozhodnutie ostáva u teba.",
				rangeLabel: "Rozsah",
				snapshotHint: "Štart vytvorí snímku tréningu",
				lastCompleted: (workoutName: string) =>
					"Naposledy dokončené: " + workoutName,
				startNowButton: "Spustiť teraz",
			},
			gateway: {
				trainingTitle: "Tréning",
				trainingDescription:
					"Rýchly zápis ostáva po ruke, keď nejdeš podľa plánu.",
				trainingCta: "Spustiť rýchlo",
				progressTitle: "Progres",
				progressDescriptionWithSessions: (completedWorkouts: string) =>
					completedWorkouts + " už živí grafy, PR a históriu.",
				progressEmptyDescription:
					"Po prvom dokončenom tréningu tu uvidíš grafy, PR a históriu.",
				progressCta: "Otvoriť Progres",
				plansTitle: "Plány",
				plansDescription:
					"Uprav rytmus týždňa až keď vieš, čo chceš trénovať ďalej.",
				plansCta: "Otvoriť Plány",
			},
		},
		redirectBanner: {
			dismiss: "Skryť upozornenie",
			destination: {
				train: "Tréning",
				quick: "Rýchly tréning",
				progress: "Progres",
				history: "História",
				plates: "Kalkulačku kotúčov",
				coach: "Coach Mode v Plánoch",
			},
			message: (from: string, destination: string) =>
				`Presunuté: pôvodná URL \`${from}\` automaticky otvára ${destination}. Aktualizuj záložky.`,
		},
		pwa: {
			installTitle: "Inštalácia aplikácie",
			installDescription:
				"Pridaj StingFit na plochu ako lokálnu PWA aplikáciu pre rýchle otvorenie vo fitku.",
			addToHome: "Pridať StingFit na plochu",
			offlineTraining:
				"Offline tréning otvoríš aj bez stabilnej siete po prvom načítaní aplikácie.",
			privatePromise:
				"Bez účtu, cloudu a telemetrie. Dáta zostávajú v zariadení.",
			installedButton: "StingFit je nainštalovaný",
			installButton: "Nainštalovať StingFit",
			manualInstallHint:
				"Ak prehliadač nezobrazí systémový prompt, použi menu prehliadača alebo otvor návod nižšie.",
			installGuideDescription:
				"Kroky pre iOS Safari, Android Chrome a Chrome/Edge na desktope.",
			installGuideButton: "Otvoriť návod na inštaláciu",
			installUnavailableHint:
				"Ak tlačidlo inštalácie nie je dostupné, použi návod na inštaláciu pre svoj prehliadač.",
			installAccepted: "StingFit sa inštaluje ako lokálna PWA aplikácia.",
			installDismissed:
				"Inštalácia StingFit bola zrušená. Dáta zostávajú lokálne dostupné v prehliadači.",
			installError: "Nepodarilo sa spustiť inštaláciu StingFit.",
		},
		backupNudge: {
			title: "Čas na lokálnu zálohu",
			description:
				"Po 30 dokončených tréningoch je rozumné uložiť export mimo prehliadača.",
			heading: "Exportuj si StingFit zálohu.",
			body: "Záloha je obyčajný lokálny JSON. Bez účtu, cloudu a telemetrie — súbor si ulož do vlastného disku alebo offline archívu.",
			exportButton: "Exportovať zálohu",
			snoozeButton: "Pripomenúť pri ďalších 30",
			exportSuccess: "Záloha tréningov pripravená",
			snoozeSuccess: "Pripomienka zálohy sa zobrazí po ďalších 30 tréningoch.",
			exportError: "Nepodarilo sa pripraviť lokálnu zálohu.",
		},
		plateLoad: {
			title: "Kalkulačka kotúčov",
			setLoggerDescription:
				"Počíta kotúče na jednu stranu podľa aktuálnej váhy série.",
			standaloneDescription:
				"Počíta kotúče na jednu stranu pre zadanú cieľovú váhu.",
			barWeightLabel: "Hmotnosť tyče",
			barWeightAria: (unit: string) => `Hmotnosť tyče v ${unit}`,
		},
		plates: {
			badge: "Kotúče",
			heroTitle: "Kalkulačka kotúčov pred sériou.",
			heroDescription:
				"Zadaj cieľ, skontroluj tyč a nalož rovnaké kotúče na obe strany.",
			quickCardTitle: "Rýchly výpočet",
			quickCardDescription:
				"Použi ho z palety príkazov alebo z mobilnej spodnej navigácie, keď stojíš pri stojane.",
			targetWeightLabel: (unit: string) => `Cieľová váha v ${unit}`,
			howToReadTitle: "Ako to čítať",
			perSideExplanation:
				"Na stranu znamená rovnaký počet kotúčov na ľavú aj pravú stranu tyče.",
			closestLowerExplanation:
				"Ak cieľ nevychádza presne, StingFit ukáže najbližšiu nižšiu naložiteľnú váhu.",
			localUnitExplanation:
				"Jednotky berie z lokálnych nastavení, bez cloudu a bez sledovania.",
			loadUnitError: "Nepodarilo sa načítať jednotky pre kalkulačku kotúčov.",
		},
		history: {
			queryError: "Nepodarilo sa načítať históriu tréningov.",
			updateSetSuccess: "Séria v histórii opravená",
			updateSetError: "Nepodarilo sa opraviť sériu v histórii.",
			badge: "História tréningov",
			heroTitle: "Tvoj tréningový zápisník.",
			heroDescription:
				"Dokončené tréningy, objem a PR odznaky sa počítajú lokálne z tréningovej histórie.",
			loadingTitle: "Načítavam históriu",
			loadingDescription: "Čítam dokončené tréningy z lokálneho úložiska.",
			loadingBody: "Nabíjam tréningovú históriu…",
			errorTitle: "Chyba histórie",
			errorDescription: "Lokálna databáza vrátila chybu.",
			emptyTitle: "Zatiaľ žiadne dokončené tréningy",
			emptyDescription:
				"Spusti a dokonči plánovaný tréning, aby sa zápisník naplnil reálnou lokálnou históriou.",
			emptyCta: "Prejsť na tréning",
		},
		stats: {
			queryError: "Nepodarilo sa načítať tréningové štatistiky.",
			badge: "PR napätie",
			badgeHint: "Blesk označuje progres.",
			heroTitle: "Štatistiky, ktoré motivujú, nie rozptyľujú.",
			heroDescription:
				"Týždenná konzistentnosť, objem, PR udalosti, odhad 1RM a odporúčania progresu sa odvodzujú z dokončených tréningov.",
			loadingTitle: "Načítavam štatistiky",
			loadingDescription: "Počítam lokálny tréningový progres.",
			loadingBody: "Nabíjam PR napätie…",
			errorTitle: "Chyba štatistík",
			errorDescription: "Lokálna databáza vrátila chybu.",
			emptyTitle: "Zatiaľ žiadne štatistiky",
			emptyDescription:
				"Dokonči tréning a StingFit lokálne vytvorí PR, objem a odporúčania progresu.",
			emptyCta: "Prejsť na tréning",
		},
		profiles: {
			activeProfileLabel: "Aktívny profil",
			switchError: "Nepodarilo sa prepnúť profil.",
		},
		coachMode: {
			settingsTitle: "Som tréner",
			settingsDescription:
				"Zapni coach pohľad pre klientov, plány, šablóny a rekapy bez účtu alebo cloudu.",
			settingsStatus: (enabled: boolean) =>
				`Coach Mode: ${enabled ? "zapnutý" : "vypnutý"}`,
			enableButton: "Zapnúť Coach Mode",
			disableButton: "Vypnúť Coach Mode",
			enabledSuccess: "Coach Mode zapnutý",
			disabledSuccess: "Coach Mode vypnutý",
			saveError: "Nepodarilo sa uložiť Coach Mode.",
			loadingTitle: "Načítavam Coach Mode",
			loadingDescription: "Kontrolujem lokálne nastavenie trénera.",
			loadingBody: "Pripravujem coach pohľad…",
			disabledTitle: "Coach Mode je vypnutý",
			disabledDescription:
				"Coach obrazovky sú skryté, kým ich výslovne nezapneš v Nastaveniach.",
			disabledBody:
				"Zapni Som tréner v Nastaveniach. Nevytvorí sa účet, cloud ani synchronizácia.",
			badge: "Coach Mode",
			clientsTitle: "Klienti trénera",
			clientsDescription:
				"Lokálny zoznam klientskych profilov pripravený pre ďalšie coach moduly.",
			plansTitle: "Coach plány",
			plansDescription:
				"Miesto pre tvorbu a export plánov pre klientov v ďalších moduloch.",
			templatesTitle: "Šablóny trénera",
			templatesDescription:
				"Súkromná lokálna knižnica coach šablón bude doplnená v ďalších moduloch.",
			recapsTitle: "Rekapy od klientov",
			recapsDescription:
				"Read-only prehľad recap packov od klientov bude doplnený v ďalších moduloch.",
			localFirstTitle: "Lokálne a explicitné",
			localFirstDescription:
				"Coach Mode je perspektíva v tej istej lokálnej databáze, nie samostatná cloudová aplikácia.",
			placeholderBody:
				"Plan Packy, Recap Packy a klientsky workflow prídu v nasledujúcich Phase 3 moduloch.",
			clientsEmptyTitle: "Zatiaľ žiadni klienti",
			clientsEmptyDescription:
				"Vytvor klientsky profil v prepínači profilov. Žiadny cloud ani konto nie sú potrebné.",
			clientsNoRecap: "Zatiaľ bez rekapu",
			clientsPrivacyNote: "Žiadny cloud ani konto",
			plansEmptyTitle: "Zatiaľ bez coach plánov",
			plansEmptyDescription:
				"Vytvor alebo uprav osobný plán v Plánoch a potom ho exportuj ako Plan Pack.",
			plansEditButton: "Upraviť v Plánoch",
			plansExportButton: "Exportovať .stfplan",
			planPackSuccess: "Plan Pack pripravený",
			planPackError: "Nepodarilo sa exportovať Plan Pack.",
			templatesEmptyTitle: "Zatiaľ bez coach šablón",
			templatesEmptyDescription:
				"Súkromná knižnica coach šablón príde po základnom exporte plánov.",
			templatesPrivacyNote: "Súkromná knižnica",
			recapsUploadLabel: "Nahrať .stfrecap",
			recapsUploadDescription:
				"Vyber Recap Pack od klienta. Náhľad je read-only a nič sa neukladá do lokálnej databázy.",
			recapsEmptyTitle: "Zatiaľ bez načítaného rekapu",
			recapsEmptyDescription:
				"Nahraj .stfrecap a skontroluj, čo klient odcvičil.",
			recapsLoadedTitle: "Recap Pack načítaný",
			recapsReadOnlyNote: "read-only náhľad bez zápisu do databázy",
			recapsImportError: "Nepodarilo sa načítať Recap Pack.",
			formatSessionCount: (count: number) =>
				count === 1 ? "1 tréning" : `${count} tréningov`,
			formatCompletedSetCount: (count: number) =>
				count === 1 ? "1 dokončená séria" : `${count} dokončených sérií`,
		},
		traineeCoach: {
			planImportTitle: "Importovať plán od trénera",
			planImportDescription:
				"Vyber .stfplan Plan Pack, skontroluj náhľad a potom ho pridaj ako lokálny osobný plán.",
			planImportEmptyTitle: "Zatiaľ bez Plan Packu",
			planImportEmptyDescription:
				"Po výbere súboru uvidíš názov plánu, trénera a rozsah pred uložením.",
			planImportLoadedTitle: "Plan Pack načítaný",
			planImportCommitButton: "Pridať plán do StingFit",
			planImportSuccess: "Plán od trénera pridaný",
			planImportError: "Nepodarilo sa importovať plán od trénera.",
			recapExportTitle: "Vytvoriť rekap pre trénera",
			recapExportDescription:
				"Vyber dátumový rozsah a StingFit pripraví .stfrecap súbor iba z dokončených tréningov v tomto zariadení.",
			recapFromLabel: "Recap od dátumu",
			recapToLabel: "Recap do dátumu",
			recapExportButton: "Exportovať .stfrecap",
			recapExportSuccess: "Recap Pack pripravený",
			recapExportError: "Nepodarilo sa vytvoriť Recap Pack.",
			recapEmptyRange: "V tomto rozsahu nie je dokončený tréning.",
			recapPrivacyNote: "Bez účtu, cloudu a telemetrie — súbor odošleš ručne.",
			formatPlanPackSummary: (weekCount: number, workoutCount: number) =>
				`${weekCount} týždeň · ${workoutCount} tréningov`,
			formatRecapSessionCount: (count: number) =>
				count === 1 ? "1 tréning v rozsahu" : `${count} tréningov v rozsahu`,
		},
		plansPage: {
			hero: {
				badge: "Plány",
				kicker: "Čo je ďalší mesiac",
				sectionKicker: "Tvorba osobného plánu",
				title: "Plán je mapa, nie ďalšia prekážka.",
				description:
					"Začni zo štartovacieho rozdelenia Tlak / Ťah / Nohy, aktivuj ho v Tréningu a detaily dolaď až vtedy, keď ti rytmus sedí.",
				createPplButton: "Vytvoriť PPL blok",
				createBlankButton: "Vytvoriť prázdny plán",
				steps: {
					weekTitle: "1. Týždeň",
					weekDescription: "Rozlož dni tak, aby sa dali reálne odtrénovať.",
					exercisesTitle: "2. Cviky",
					exercisesDescription:
						"Série, opakovania, RIR a pauzy zostávajú editovateľné.",
					activateTitle: "3. Aktivuj",
					activateDescription: "Aktívny plán sa objaví v Tréningu.",
				},
			},
		},
		simpleStart: {
			badge: "Nový štart vo V3",
			noSetupBadge: "Bez účtu a cloudu",
			recommendedKicker: "Prvý tréning bez nastavovania",
			title: "Tvoj prvý tréning je tu do minúty",
			description:
				"Vyber jeden rytmus. StingFit pripraví plán, prvý tréning a čistý zápis sérií, aby si vo fitku nemusel riešiť editor.",
			preparePlan: "Pripraviť plán",
			steps: [
				{
					title: "Vyber rytmus",
					description: "3, 4 alebo 5–6 dní podľa toho, koľko reálne chodíš.",
				},
				{
					title: "Spusti Dnes",
					description: "Prvý tréning sa zobrazí rovno v pilieri Tréning.",
				},
				{
					title: "Sleduj rast",
					description: "Dokončené série sa prelejú do Progresu a Histórie.",
				},
			],
			quickTitle: "Som už vo fitku",
			quickDescription:
				"Otvor prázdny zápisník, pridaj cviky pri stojane a zapisuj série bez tvorby plánu.",
			quickButton: "Spustiť rýchly zápis",
			howItWorksSummary: "Ako to funguje",
		},
		onboarding: {
			eyebrow: "Štart",
			title: "Vyber jednoduchý začiatok",
			description:
				"Nemusíš čítať návod ani rozumieť splitom. Začni pripraveným plánom alebo otvor rýchly tréning.",
			privacyTitle: "Súkromné a lokálne",
			privacyDescription:
				"Bez účtu, cloudu a telemetrie. Tréningy, plány a nastavenia ostávajú v tomto zariadení a exportuješ ich ručne.",
			themeTitle: "Vzhľad môžeš doladiť hneď",
			themeDescription:
				"Tmavý režim je najčitateľnejší vo fitku, svetlý sa hodí pri plánovaní. Výber nie je povinný.",
			starterUnavailable: (title: string) =>
				`Štartovací plán ${title} nie je dostupný.`,
			preparePlanError: "Nepodarilo sa pripraviť jednoduchý tréningový plán.",
		},
		setLogger: {
			plateCalculatorTitle: "Kalkulačka kotúčov",
			plateCalculatorCollapsedHint:
				"Otvor, keď chceš prepočítať kotúče pre aktuálnu váhu série.",
		},
		setGestures: {
			completedSetsTitle: "Dokončené série aktuálneho cviku",
			completedSetsDescription:
				"Ak sa preklikneš vo váhe, RIR alebo type série, oprav záznam bez rušenia tréningu.",
			completedSetAria: (setNumber: number) =>
				`Séria ${setNumber}: potiahni doprava pre duplikovanie alebo doľava pre preskočenie`,
			duplicateButton: "Duplikovať",
			skipButton: "Preskočiť",
			duplicateAria: (setNumber: number) => `Duplikovať sériu ${setNumber}`,
			skipAria: (setNumber: number) => `Preskočiť sériu ${setNumber}`,
			editButton: "Upraviť",
			editAria: (setNumber: number) => `Upraviť sériu ${setNumber}`,
			emptyCompletedSets:
				"Zatiaľ nie je dokončená žiadna séria aktuálneho cviku.",
		},
	},
} as const;

type WidenCatalog<T> = T extends (...args: infer Args) => infer Return
	? (...args: Args) => Return extends string ? string : WidenCatalog<Return>
	: T extends string
		? string
		: T extends object
			? { [Key in keyof T]: WidenCatalog<T[Key]> }
			: T;

export type SlovakCatalog = typeof sk;
export type FitnessCopyCatalog = WidenCatalog<SlovakCatalog>;

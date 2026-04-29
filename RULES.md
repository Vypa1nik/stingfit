# LocalFlow — Agent Rules

## Architektúra v 3 vrstvách
1. SMERNICE (tento súbor) — pravidlá, konvencie, zakázané patterny
2. ORCHESTRÁCIA — poradie krokov, závislosti medzi modulmi
3. EXEKÚCIA — samotný kód, testy, build

## Záväzné pravidlá
- NIKDY negeneruj celú appku v jednom kroku. Postupuj po moduloch.
- NIKDY nepridávaj cloud sync, login, telemetriu, subscription logic.
- VŽDY najprv postav UI s dummy dátami, až potom pripájaj backend.
- VŽDY po každom module over, že appka sa buildne a spustí bez chýb.
- Ak sa zacyklíš na chybe (3+ pokusy), vráť sa na posledný funkčný checkpoint a skús iný prístup.
- Preferuj jednoduchšiu implementáciu. Nepreoptimalizuj.
- Používaj TypeScript strict mode všade.
- Každý CRUD musí mať error handling a empty state.

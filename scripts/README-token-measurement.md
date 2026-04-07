# Token-måling — Slik kjører du

## Forutsetninger
Du trenger en Anthropic API-nøkkel: https://console.anthropic.com

## Kjør målingen

```bash
cd agent-first-prototype
ANTHROPIC_API_KEY=sk-ant-xxx... npm run measure-tokens
```

## Hva som skjer

Scriptet kjører faktiske Claude API-kall mot begge designtilnærmingene:

**Menneskelig-first (8 steg):**
1. Ser initial side med kalender (full HTML)
2. Klikker check-in dato
3. Ser guest-info skjema
4. Fyller inn navn og e-post
5. Ser add-ons siden
6. Velger Bedding og Breakfast
7. Leser gjennomgang og bekrefter
8. Bekrefter booking er fullført

**Agent-first (1 steg):**
1. Mottar API-schema → sender POST /api/book → ferdig

## Output
Resultater lagres i `scripts/token-measurement-results.json` med:
- Faktisk token-bruk per steg og totalt
- CO₂-estimat (0.002g per 1000 tokens)
- Reduksjonsprosentene

## Oppdater compare/page.tsx
Scriptet skriver ut eksakt hvilke tall du skal oppdatere i `app/compare/page.tsx`
slik at sammenligningstabellen viser ekte målte tall.

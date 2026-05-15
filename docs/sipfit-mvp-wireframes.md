# SipFit MVP Wireframes And Copy

SipFit is a bottle-first hydration and hygiene tracker for heavy Owala and YETI users.

## Product Principle

Track hydration by bottle, not by abstract cups. Cleaning reminders should react to the exact bottle, last wash time, recent drink type, and local weather.

## Sip Pup

Sip Pup is a lightweight mascot layer, not a game system.

States:

- Idle: waiting for the first bottle or first sip.
- Happy: a sip was logged or the daily goal is progressing.
- Alert: a bottle needs cleaning soon.
- Wash: a bottle needs rinse/wash action now.

Rules:

- Sip Pup never blocks primary actions.
- Sip Pup messages stay one sentence.
- Today focuses on hydration encouragement.
- Clean focuses on bottle hygiene reminders.
- No points, feeding, skins, or pet chores in the MVP.

## Health Basis For MVP Rules

- Reusable bottles should be washed regularly because moist bottle and lid parts can harbor bacteria, yeast, and mold.
- Plain water is lower residue, but the product still prompts a daily wash window.
- Electrolytes and sugary drinks leave residue, so the product shortens the cleaning window to the same day.
- Coffee and tea leave flavor/oil residue, so the product uses a same-day cleaning window.
- Protein or milk-like drinks are treated as the highest hygiene priority. The app prompts a rinse within 2 hours, or 1 hour when the temperature is above 90°F, using the common food-safety time window for perishable foods.

## Core Navigation

Primary tabs:

- Today
- Bottles
- Clean

## Landing Page

Root route:

- `/` is an English landing page.
- `/app/` is the working SipFit prototype.

Landing headline:

```text
Your water bottle has a memory. SipFit helps you track it.
```

Landing direction:

- Clean, bright, friendly visual tone.
- State colors: clean green, warning amber, wash coral.
- Bottle cards for Owala FreeSip, YETI Rambler, Stanley Quencher, Hydro Flask, and custom bottles.
- Before/After uses light illustration and pain cards, not Reddit images.
- Sip Pup adds motion and warmth without blocking the CTA.
- CTA: "Join SipFit for free"

Landing disclaimer:

```text
SipFit is not affiliated with Owala, YETI, Stanley, or Hydro Flask.
```

## Today

Low-fidelity layout:

```text
┌──────────────────────────────┐
│ SipFit                       │
│ Today                        │
├──────────────────────────────┤
│ 64 oz / 95 oz                │
│ 1,893 ml / 2,800 ml          │
│ [oz] [ml]                    │
│ [progress bar]               │
│ Sip Pup: Nice sip.           │
│ Today by time                │
│ 16 oz   8 oz   24 oz         │
│ [group if many logs]         │
├──────────────────────────────┤
│ Active bottle                │
│ Owala FreeSip 32 oz          │
│ Status: Wash by 9:30 PM      │
├──────────────────────────────┤
│ Log drink                    │
│ [1 bottle] [1/2] [1/4]        │
│ Drink type                   │
│ [Water] [Electrolytes]       │
│ [Protein] [Coffee/Tea]       │
├──────────────────────────────┤
│ Weather                      │
│ 84°F · 68% humidity          │
│ [Use location]               │
│ [Enter city] [Set city]      │
└──────────────────────────────┘
```

Core copy:

- "Track by bottle"
- "Today’s hydration"
- "Active bottle"
- "Log drink"
- "Choose what was in the bottle"
- "Use location or enter a city to tune wash timing."
- "Heat or humidity shortens rinse and wash windows."

Primary actions:

- Add 1 bottle
- Add 1/2 bottle
- Add 1/4 bottle
- Undo last drink log
- Switch display unit between oz and ml
- Request notifications
- Refresh weather
- Set city manually

## Bottles

Low-fidelity layout:

```text
┌──────────────────────────────┐
│ Bottles                      │
│ [Add bottle]                 │
├──────────────────────────────┤
│ Owala FreeSip                │
│ 32 oz · 946 ml               │
│ Last washed: 16h ago         │
│ Recent: Electrolytes         │
│ Status: Wash by 9:30 PM      │
│ [Set active] [Remove]        │
├──────────────────────────────┤
│ YETI Rambler                 │
│ 36 oz · 1,065 ml             │
│ Last washed: 2d ago          │
│ Recent: Water                │
│ Status: Clean until tomorrow │
│ [Set active] [Remove]        │
└──────────────────────────────┘
```

Add bottle fields:

- Brand
- Model
- Capacity
- Unit
- Color label

Default presets:

- Owala FreeSip 24 oz
- Owala FreeSip 32 oz
- Owala FreeSip 40 oz
- YETI Rambler 18 oz
- YETI Rambler 26 oz
- YETI Rambler 36 oz
- YETI Rambler 46 oz

Core copy:

- "Add a bottle"
- "Capacity"
- "Set active"
- "Remove"
- "Last washed"
- "Last deep clean"
- "Recent drink"

Last washed and last deep clean are derived from Clean records. Bottles does not write cleaning history.
Remove requires confirmation and deletes the bottle's sip and clean logs.

## Clean

Low-fidelity layout:

```text
┌──────────────────────────────┐
│ Clean                        │
│ Owala FreeSip 32 oz          │
├──────────────────────────────┤
│ Hygiene status               │
│ Wash by 9:30 PM              │
│ Electrolytes + warm weather  │
│ means this bottle should be  │
│ cleaned today.               │
│ Sip Pup: Wash by 9:30 PM.    │
├──────────────────────────────┤
│ Checklist                    │
│ Animated bottle part guide   │
│ Current part: Spout gasket   │
│ [ ] Bottle body              │
│ [ ] Lid                      │
│ [ ] Straw                    │
│ [ ] Spout gasket             │
│ [ ] Button area              │
├──────────────────────────────┤
│ Record clean                 │
│ Washed: soap clean for daily │
│ bottle care.                 │
│ [Rinsed] [Washed]            │
│ [Deep cleaned]               │
│ [Save clean record]          │
├──────────────────────────────┤
│ Clean history                │
│ Washed · May 14, 10:15 PM    │
│ Parts: Lid, Straw, Gasket    │
└──────────────────────────────┘
```

Cleaning states:

- Clean
- Clean until a specific time
- Wash by a specific time
- Rinse by a specific time
- Wash now
- Rinse now

Core copy:

- "Bottle hygiene"
- Short reason copy: "[Drink]. [Action] by [time]. [Weather adjustment if any]."
- "Rinsed"
- "Washed"
- "Deep cleaned"
- "Undo last clean"
- "Save clean record"

Clean levels:

- Rinsed: quick water flush for fresh residue or temporary protein cleanup.
- Washed: soap clean for daily bottle care and the normal hygiene reset.
- Deep cleaned: disassembled lid, straw, gasket, and hard-to-reach parts.

## Cleaning Deadline Algorithm

The MVP uses deadlines instead of vague risk labels. Each bottle looks at drinks logged after the most recent wash. The earliest deadline wins.

```text
deadline = drink_logged_at + drink_cleanup_window
```

Cleanup windows:

```text
Water: wash within 24 hours
Electrolytes: wash within 12 hours
Coffee/Tea: wash within 12 hours
Sugary drink: wash within 8 hours
Protein: rinse within 2 hours, or 1 hour above 90°F
Other: wash within 24 hours
```

Weather adjustment:

```text
Temperature > 80°F or humidity > 65%:
  shorten non-water windows by 25%
Temperature > 90°F:
  protein cleanup window becomes 1 hour
```

Status labels:

```text
No unwashed sip: Clean
Deadline > 8h away: Clean until [time/date]
Deadline <= 8h away: Wash by [time] or Rinse by [time]
Deadline passed: Wash now or Rinse now
```

## MVP Data

- Bottles are stored locally.
- Sip logs are stored locally.
- Clean logs are stored locally.
- Hydration is logged only as 1 bottle, 1/2 bottle, or 1/4 bottle.
- The Today total is calculated from today’s sip logs.
- Weather uses current location or manual city search with Open-Meteo.
- Notifications trigger when a bottle reaches Wash by/Rinse by or Wash now/Rinse now.
- Timeline labels use the preferred unit and group dense logs into 2-hour blocks.

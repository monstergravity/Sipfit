# SipFit

SipFit is a bottle-first hydration and bottle hygiene tracker prototype for daily Owala, YETI, Stanley, Hydro Flask, and custom bottle users.

## MVP

- Landing page at `/`.
- Working app prototype at `/app/`.
- Track hydration by bottle: 1 bottle, 1/2 bottle, or 1/4 bottle.
- Convert between oz and ml.
- Manage Owala, YETI, and custom bottles locally.
- Derive wash timing from drink type, last clean record, and local weather.
- Record clean history with clean level and bottle parts.
- Show a daily hydration timeline.
- Use Sip Pup as a lightweight mascot for hydration and cleaning reminders.

## Run Locally

This MVP is a static PWA prototype.

```bash
python3 -m http.server 4173
```

Then open:

```text
http://127.0.0.1:4173/
```

The app prototype is available at:

```text
http://127.0.0.1:4173/app/
```

## Product Notes

See [docs/sipfit-mvp-wireframes.md](docs/sipfit-mvp-wireframes.md) for wireframes, core copy, and MVP cleaning rules.

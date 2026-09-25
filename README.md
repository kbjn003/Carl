# Carl
Personal AI Assistant so that creatives can be creatives

- **PLAN.md**: the build plan for Carl's voice-first phone app (screens, data model, AI pipeline, milestones M0–M9)
- **CLAUDE.md**: working rules for Claude Code
- **design/**: approved screen mockups (reference only)

## Run it

```sh
npm install
npm run dev          # http://localhost:3000
npm run build && npm start   # production, what the Mac Mini runs
```

To use it on the iPhone, expose it over HTTPS on your tailnet with `tailscale serve --bg 3000`, open the URL in Safari, then Share → Add to Home Screen.

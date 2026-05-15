# Crush Calculator

Forensic text message analysis powered by Claude AI.

## Local development

```bash
npm install
# create a .env file with:
# ANTHROPIC_API_KEY=sk-ant-...
npm run dev        # starts Vite dev server on :5173
node server.js     # starts Express proxy on :3000
```

## Deploy to Railway via GitHub

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/crush-calculator.git
   git push -u origin main
   ```

2. **Create Railway project**
   - Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub repo
   - Select your `crush-calculator` repository
   - Railway auto-detects `nixpacks.toml` and runs `npm install && npm run build`

3. **Add environment variable**
   - In Railway dashboard → your service → Variables tab
   - Add: `ANTHROPIC_API_KEY` = `sk-ant-your-key-here`

4. **Generate domain**
   - Settings tab → Networking → Generate Domain
   - Your app is live at `https://crush-calculator-xxx.railway.app`

## Architecture

```
Browser → /api/analyze (Express) → Anthropic API
Browser ← JSON result            ← Claude response
```

The Express server acts as a proxy so the Anthropic API key is never exposed in the frontend bundle.

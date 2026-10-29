# 15 Days of Payday: Interactive Decision Game (v2.0)

**Authors:** Parth Dhodapkar & Joshua Koilpillai  
**Project:** Preferences Toward Risk, Uncertainty, and Safety in Financial Decisions (Students vs. IT Professionals)  
**Scientific Reference:** [questionnaire_2.md](file:///c:/Users/Parth%20Dhodapkar/Downloads/Sem-5/Neuroeconomics/project/questionnaire_2.md) | [map.md](file:///c:/Users/Parth%20Dhodapkar/Downloads/Sem-5/Neuroeconomics/project/map.md)

---

## 🎮 Overview

This web app turns the 15-day neuroeconomics study into an interactive 2D retro-RPG game designed to be deployed with **GitHub Pages**:
- **100% Non-AI Art:** Handcrafted geometric pixel-art and vector graphics for city buildings (Central Bank, Safe Deposit Vault, Stock Exchange, Decision Lab, Tech Incubator, Neon Arcade) and animated characters (University Student, IT Professional, and NPCs).
- **Exact Experimental Protocol:** Complete implementation of Parts 1–5:
  1. Consent & Instructions
  2. Pre-game Profile (Demographics, Financial Literacy FL1–FL3, Income Stability $S$, Financial Responsibility $R$, Comprehension checks C1–C4)
  3. Holt-Laury Baseline Risk Anchor (10 price list rows)
  4. 15 Daily Financial Scenarios (Randomized option order `pos_D1..pos_D15`, millisecond response timer `rt_D1..rt_D15`, belief probes on Days 1, 3, 5, 12, Day 5 Ellsberg Red/Blue token selector, and Day 8 Market Crash reaction)
  5. Post-Game Checks & Debrief (Calculated metrics $S, R, GP, KR, AS, HL$, plus random incentive payment day draw)

---

## 🚀 How to Deploy on GitHub Pages

1. **Push this project to a GitHub repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit of 15 Days of Payday game"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your repository on GitHub.
   - Navigate to **Settings** > **Pages**.
   - Under **Build and deployment** > **Source**, select **Deploy from a branch**.
   - Choose `main` branch and `/ (root)` folder.
   - Click **Save**.
   - Your survey link will be live at: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

---

## 📊 Live Data Pipeline (Google Sheets + Live Dashboard)

Each completed response is appended as a row to a Google Sheet, and `dashboard.html` polls that sheet every 5 seconds and redraws the charts.

### One-time setup
1. Create a Google Sheet at [sheets.new](https://sheets.new).
2. In the sheet: **Extensions > Apps Script**. Delete the default code and paste in the contents of `apps_script/Code.gs`.
3. Edit the two tokens at the top of `Code.gs`:
   - `WRITE_TOKEN` must match `WRITE_TOKEN` in `js/config.js`.
   - `READ_KEY` is the password you type into the dashboard. Keep it private.
4. **Deploy > New deployment > Select type: Web app**. Set *Execute as: Me* and *Who has access: Anyone*. Click **Deploy** and copy the URL ending in `/exec`.
5. Open `js/config.js` and paste that URL into `WEBHOOK_URL`. Commit and push (see Deploying below).

After any edit to `Code.gs`, run **Deploy > Manage deployments > Edit > New version**. Otherwise the change does not go live.

### Viewing results live
1. Open `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/dashboard.html`.
2. Enter the read key. It is kept for that browser tab only.
3. The status dot turns green when connected. New responses appear within about 5 seconds.

To check the layout before any data arrives, open `dashboard.html` with `WEBHOOK_URL` empty. It shows random demo data with a banner.

The raw data is also in the sheet itself, so you can use Google Sheets' own charts or Excel (**File > Download > .xlsx**) at any time.

### Caveats
- `WRITE_TOKEN` is visible in the public source, so it only stops casual junk rows. The read key is the real protection for the data.
- The game uses `mode: "no-cors"`, so the browser cannot confirm a save. Check the sheet after a test submission.

### 💾 Automatic Backup
Even before setting the webhook, every completed response:
1. Is safely saved to the respondent's browser `localStorage`.
2. Generates an instant **"📥 Download Your Response Data (.CSV)"** and **"📥 Download Data (.JSON)"** button at the debrief screen matching your exact data dictionary format.

---

## 🧪 Local Preview

To test locally:
```bash
python -m http.server 8000
```
Open [http://localhost:8000](http://localhost:8000) in your browser.

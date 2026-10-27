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

## 📊 Connecting Your Excel / Google Sheets Webhook

When you have your webhook link (from Google Apps Script, PowerAutomate, or SheetDB):

1. Open `js/config.js`.
2. Paste your webhook URL into `WEBHOOK_URL`:
   ```javascript
   const CONFIG = {
     WEBHOOK_URL: "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec",
     ...
   };
   ```
3. Commit and push:
   ```bash
   git commit -am "Update webhook link"
   git push
   ```

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

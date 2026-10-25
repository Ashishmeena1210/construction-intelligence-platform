# 🏗️ AI Construction Intelligence Platform

## Running Locally with VS Code

### Step 1 — Open in VS Code
Right-click the `construction-platform` folder → **Open with Code**
OR from terminal:
```
code C:\Users\ashis\.gemini\antigravity\scratch\construction-platform
```

### Step 2 — Open Two Terminals in VS Code
Press `Ctrl + `` ` (backtick) to open terminal, then click **+** to open a second one.

**Terminal 1 — Backend:**
```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

### Step 3 — Open Browser
Go to → http://localhost:5173

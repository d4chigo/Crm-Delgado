# 🚀 HOW TO RUN YOUR CRM AS A DESKTOP APPLICATION

## What you need to do (3 simple steps)

---

## STEP 1: Open Terminal

- **Windows**: In the project folder → right-click → "Open in terminal"
- **Mac/Linux**: Same process, right-click → "Open in terminal"

---

## STEP 2: Install dependencies (ONLY the first time)

Copy and paste in the terminal:

```bash
npm run install
```

**Wait 3-5 minutes** (it's downloading and installing everything automatically)

When it finishes, you'll see: `[+] Installation Completed`

---

## STEP 3: Run the CRM

Copy and paste in the terminal:

```bash
npm run dev
```

**Wait 60 seconds** and you'll see:

```
[*] Starting backend server on port 5000...
[*] Starting frontend client on port 3000...
[*] Starting Electron...
```

After that, **a desktop window will open automatically with your CRM**. ✅

---

## Already ran it once?

If you already did `npm run install` before, next time just run:

```bash
npm run dev
```

That's it. You don't need to install again.

---

## How to stop?

Press `Ctrl+C` in the terminal, or close the Electron window.

---

## Something went wrong?

### Error: "npm: command not found"
Install Node.js from https://nodejs.org/

### Error: "port 3000 in use"
Close everything with `Ctrl+C` and wait 30 seconds. Then try again.

### Database error
Run: `npm run install` again

---

## Done!

That's ALL you need to know to run the CRM as a desktop application.

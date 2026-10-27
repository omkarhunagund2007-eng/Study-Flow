# StudyFlow

A student productivity dashboard: manage tasks and subjects, run Pomodoro focus sessions, and see where your study time goes. Built with **React, JavaScript, HTML5, CSS3, Vite and LocalStorage**. No backend, no accounts, no extra libraries.

> Everything is saved in your own browser. Nothing is sent anywhere.

## Features

| Page | What you can do |
| --- | --- |
| **Dashboard** | Total, completed and pending tasks, tasks due today, today's study time, completion percentage, the next deadlines, and a warning when tasks are overdue. |
| **Tasks** | Add, edit and delete tasks (title, description, subject, priority, deadline). Mark them completed or pending. Search by title and filter by subject, priority, status and deadline. Sort by deadline. Clear all filters in one click. |
| **Subjects** | Add, edit and delete subjects with a colour. Duplicate names are blocked (case and spacing ignored). Deleting a subject never deletes its tasks. |
| **Study Timer** | Pomodoro timer (focus 25 / short break 5 / long break 15 by default, all configurable). Start, pause, resume, reset. Pick the subject you study. Completed focus sessions are recorded once, and listed in a history. |
| **Analytics** | Completed vs pending vs overdue tasks, daily and weekly study time, a 7-day activity chart, study time by subject, and focus-session counts. Every empty state is handled. |

Also: light and dark themes (saved), a sidebar on desktop and a bottom bar on phones, keyboard-friendly forms and dialogs, and safe handling of corrupted saved data.

## Quick start

You need **Node.js 18 or newer** (check with `node -v`).

```bash
npm install        # download the dependencies (once)
npm run dev        # start the development server
```

Open the address printed in the terminal (normally http://localhost:5173).

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server with instant reload. |
| `npm run build` | Creates the optimised production site in `dist/`. |
| `npm run preview` | Serves the `dist/` folder locally, to check the real production build. |
| `npm test` | Runs the unit tests (Node's built-in test runner, no extra packages). |

## Project structure

```
studyflow/
├── index.html              The single HTML page. Sets the saved theme before React loads (no white flash).
├── vite.config.js          Vite settings (relative paths, so it can be hosted in a sub-folder).
├── package.json
├── public/favicon.svg
├── src/
│   ├── main.jsx            Entry point: mounts the app inside the error boundary and the data provider.
│   ├── App.jsx             Chooses which page to show from the URL (#/tasks, #/timer, ...).
│   ├── context/
│   │   └── AppContext.jsx  ALL shared data (tasks, subjects, sessions, preferences) and the actions that change it.
│   ├── hooks/
│   │   ├── usePersistentState.js  useState that also saves to / loads from LocalStorage.
│   │   ├── usePomodoro.js         Connects the timer logic to React (clock ticks, completion).
│   │   ├── useToday.js            Today's date; updates itself at midnight.
│   │   └── useHashRoute.js        Current page, from the URL hash.
│   ├── utils/              Plain JavaScript, no React. Easy to test.
│   │   ├── constants.js    Priorities, colours, limits, storage keys.
│   │   ├── dates.js        Date helpers ("YYYY-MM-DD" strings, leap years, daylight saving).
│   │   ├── validation.js   Rules for the task, subject and timer-length forms.
│   │   ├── tasks.js        Filtering, sorting, deadline state, dashboard statistics.
│   │   ├── study.js        Daily / weekly / per-subject study statistics.
│   │   ├── timer.js        The Pomodoro timer as pure functions (timestamp based).
│   │   ├── storage.js      Safe LocalStorage read / write.
│   │   ├── sanitize.js     Repairs or drops bad data read from LocalStorage.
│   │   ├── format.js, id.js, routes.js
│   ├── components/         Reusable UI pieces (see the table below).
│   ├── pages/              Dashboard, Tasks, Subjects, StudyTimer, Analytics.
│   └── styles/             theme.css (colours), base.css, layout.css, components.css.
├── tests/                  74 unit tests for everything in src/utils.
└── e2e/studyflow_e2e.py    28 browser tests (optional, needs Python + Playwright).
```

### How the pieces fit together

```
LocalStorage <-> usePersistentState <-> AppContext (data + actions)
                                              |
                       +----------------------+----------------------+
                       |                      |                      |
                  pages/ (screens)      components/ (UI)       utils/ (pure logic)
```

1. **Data lives in one place.** `AppContext` loads everything from LocalStorage, exposes it with `useApp()`, and saves automatically whenever it changes.
2. **Pages** read data with `useApp()`, ask `utils/` to calculate (filter, count, sum), and hand the results to **components**.
3. **Components** only display data and call the functions they are given. They hold no business rules.
4. **`utils/`** holds the rules. Because they are plain functions, they can be tested without a browser.
5. **Statistics are never stored.** They are recalculated from tasks and sessions every time, so they cannot get out of date.

### Components

| Component | Purpose |
| --- | --- |
| `Layout`, `Sidebar`, `MobileHeader`, `BottomNav`, `NavList`, `Brand` | The page frame and navigation for desktop and mobile. |
| `ThemeToggle` | Switches light / dark. |
| `PageHeader`, `StatCard`, `EmptyState`, `ProgressBar`, `Badge` | Basic building blocks used on several pages. |
| `TaskForm`, `TaskFilters`, `TaskList`, `TaskItem` | Everything on the Tasks page. |
| `SubjectForm`, `SubjectList`, `SubjectTag` | Everything on the Subjects page, and the coloured subject label used elsewhere. |
| `DeadlineBadge`, `PriorityBadge`, `DeadlineList` | Deadline wording ("Overdue by 2 days"), priority labels, the upcoming-deadlines list. |
| `TimerDial`, `DurationForm`, `SessionHistory` | The clock, timer-length settings, the list of finished sessions. |
| `BarChart`, `SubjectBars`, `TaskSplit` | Charts built from plain HTML and CSS (no chart library), each with a text alternative. |
| `FormField` | Label + input + hint + error, wired together for screen readers. |
| `Modal`, `ConfirmDialog` | Dialogs built on the native `<dialog>` element. |
| `Toast`, `StorageNotices`, `ErrorBoundary` | Confirmations, storage warnings, and a safety net for unexpected errors. |

## How the timer stays accurate

A naive timer subtracts one second every second, and drifts or freezes when the browser throttles a background tab. StudyFlow stores the **moment the timer must end** (`endAt`, a timestamp) and always calculates `remaining = endAt - Date.now()`. The interval only refreshes the screen. So:

- A sleeping tab or a different page does not affect accuracy.
- A reload keeps the countdown. If the session finished while the app was closed, it is recorded the next time you open StudyFlow, stamped with its real end time.
- Each focus session gets an id when it **starts**. Saving ignores an id that already exists, so a session can never be recorded twice.

## Data and LocalStorage

| Key | Contents |
| --- | --- |
| `studyflow.tasks` | The tasks. |
| `studyflow.subjects` | The subjects. |
| `studyflow.sessions` | Completed focus sessions. |
| `studyflow.preferences` | Theme and timer lengths. |
| `studyflow.timer` | The running or paused timer. |

If saved data is invalid JSON or the wrong shape, StudyFlow starts with empty data, shows a notice, and keeps a copy of the unreadable text under `<key>.backup`. If only some items are broken, the good ones are kept. If the browser refuses to save (private mode, full storage), a warning says changes will be lost on refresh.

To reset the app while developing, open the browser console and run `localStorage.clear()`.

## Testing

### 1. Unit tests (74 tests)

```bash
npm test
```

Cover dates (leap years, impossible dates, daylight saving), validation, filtering and sorting, statistics, the timer (start / pause / resume / finish, duplicate prevention, a sleeping tab), and corrupted-storage handling.

### 2. Browser tests (28 tests, optional)

These open the real app in Chromium, click through it, reload, and check what is on screen. A fake clock lets them test the timer without waiting 25 minutes. They also measure text contrast, check for horizontal overflow at 320 / 375 / 768 / 1024 / 1280 px, and run an automated accessibility audit when `axe.min.js` is supplied.

```bash
npm run build && npm run preview                 # terminal 1
pip install playwright && playwright install chromium
python e2e/studyflow_e2e.py                      # terminal 2
# Optional: AXE_PATH=/path/to/axe.min.js SHOTS_DIR=./shots python e2e/studyflow_e2e.py
```

Last result: **28 passed, 0 failed**, against both the production build and the development server (the dev server also reveals React warnings, and there were none).

### 3. Manual testing checklist

Tick these in a real browser. Use **Chrome DevTools -> Toggle device toolbar** for the phone sizes.

**Tasks**
- [ ] Add a task with every field filled in. It appears in the list.
- [ ] Try to save an empty title, a 101-character title, and an empty deadline. Each shows an error next to its field.
- [ ] Edit the task. The change appears and no duplicate is created.
- [ ] Tick the checkbox: the task is struck through and the Dashboard "Completed" count goes up. Untick it: it goes back.
- [ ] Delete a task: a confirmation appears; Cancel keeps it, Delete removes it.

**Filters**
- [ ] Add 4 or more tasks with different subjects, priorities and dates (include one in the past and one for today).
- [ ] Search part of a title (any capitalisation).
- [ ] Use each filter alone, then combine several. The "Showing X of Y" text matches.
- [ ] Choose filters that match nothing: you get "No tasks match your filters" and a Clear filters button that works.
- [ ] Change the sort order.

**Subjects**
- [ ] Add a subject. Adding the same name again (try `math` vs `Math`) is rejected.
- [ ] Edit a name and colour. Existing tasks show the new name and colour.
- [ ] Delete a subject that has tasks. The warning says the tasks will be kept; afterwards they show "No subject".

**Deadlines and Dashboard**
- [ ] A task due today is highlighted and counted in "Due today".
- [ ] A past, unfinished task says "Overdue by N days" and a red banner appears on the Dashboard.
- [ ] Upcoming deadlines are in date order, soonest first.
- [ ] Every Dashboard number matches what you can count on the Tasks page.

**Timer** (set Focus to 1 minute in Timer lengths to test quickly)
- [ ] Start, Pause, Resume, Reset all work. Mode buttons and the subject list are locked while it runs.
- [ ] Start, switch to another page, come back: the time is still correct.
- [ ] Start, reload the page: the countdown continues.
- [ ] Let a focus session finish: a message appears, one entry is added to the history, and "Studied today" increases by exactly one session.
- [ ] Reset in the middle of a session records nothing.
- [ ] Invalid lengths (0, 2.5, empty, 999) show an error and are not saved.

**Analytics**
- [ ] Study totals equal the sum of the history entries.
- [ ] The 7-day chart shows today as the last (orange) bar; days with no study show 0.
- [ ] The subject bars add up to the all-time total.
- [ ] With no data at all (`localStorage.clear()` and reload), every card shows a helpful empty message and nothing breaks.

**Persistence and theme**
- [ ] Reload: tasks, subjects, history, timer lengths and theme are all still there.
- [ ] In the console run `localStorage.setItem('studyflow.tasks', '{broken')` and reload: the app opens, shows a notice, and still works.
- [ ] Dark mode: toggle it, reload, it stays. Text is readable everywhere.

**Responsive and keyboard**
- [ ] At 320 px and 375 px wide: no sideways scrolling, buttons are easy to tap, forms and dialogs fit the screen.
- [ ] Desktop shows the sidebar; below about 900 px you get the top bar and bottom navigation.
- [ ] Use only the keyboard: Tab reaches everything, the first Tab stop is "Skip to main content", dialogs close with Esc.

## Git and GitHub

First-time setup (skip if Git is already configured):

```bash
git config --global user.name  "Your Name"
git config --global user.email "you@example.com"
```

Put the project under version control. The `.gitignore` already excludes `node_modules` and `dist`.

```bash
cd studyflow
git init
git add .
git commit -m "Initial commit: StudyFlow"
git branch -M main
```

Create an **empty** repository on github.com (no README, no .gitignore), then connect and upload:

```bash
git remote add origin https://github.com/YOUR-USERNAME/studyflow.git
git push -u origin main
```

Everyday workflow:

```bash
git status                          # what changed?
git add .
git commit -m "Describe what you changed"
git push
```

Tip: work on a branch for each new feature (`git switch -c feature/export-data`), then merge it on GitHub with a pull request. Small, well-named commits look good in a portfolio.

## Deployment

StudyFlow is a static site: `npm run build` produces a `dist/` folder of plain files that any static host can serve. It uses `#/page` URLs and relative asset paths, so it works in a sub-folder and needs no server configuration.

**Netlify (simplest).** Run `npm run build`, open app.netlify.com/drop and drag the `dist` folder onto the page. Or connect your GitHub repository with build command `npm run build` and publish directory `dist`.

**Vercel.** Import the GitHub repository at vercel.com. It detects Vite automatically (build command `npm run build`, output `dist`).

**GitHub Pages.**
1. Push the project to GitHub (above).
2. Repository -> **Settings -> Pages -> Build and deployment -> Source: GitHub Actions**.
3. Add the file `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - id: deployment
        uses: actions/deploy-pages@v4
```

4. Commit and push. (This workflow follows GitHub's standard Vite pattern, but it was not run from the environment this project was built in, so check the **Actions** tab after your first push.) Your site appears at `https://YOUR-USERNAME.github.io/studyflow/`.

Always run `npm run build` and `npm run preview` once before deploying, and open the preview to confirm it works.

## Known limitations

- **Data stays in one browser.** There is no account or sync: another browser, device, or a cleared browser cache starts empty. There is also no export / import yet.
- **Two tabs at once.** Both tabs write to the same LocalStorage keys, and the last one to save wins. Use one tab at a time.
- **The timer cannot alert you while the app is closed.** There is no sound or browser notification. A session that ends while StudyFlow is closed is recorded correctly the next time you open the app, but you are not told at the moment it ended. Keep the tab open (it may be in the background).
- **Reset discards the running session.** Only completed focus sessions count; partial ones are not recorded.
- **"Weekly" means the last 7 days including today**, not Monday to Sunday.
- **Deleting a subject re-labels its study history as "No subject"**, so per-subject totals for that subject are lost (the minutes still count in the totals).
- **Dates use the device clock and time zone.** Changing the system date changes what counts as "today" and "overdue".
- **No undo** after deleting a task or clearing the history (a confirmation is shown first).
- **Fixed palette** of 10 subject colours.
- **Tested in Chromium only** (desktop browser at several viewport sizes, including 320 and 375 px). It has not been tried on Safari, Firefox, or physical phones, and it has not been tested with a real screen reader. The automated accessibility audit (axe-core) finds no violations, but that is not a substitute for testing with assistive technology.
- LocalStorage holds about 5 MB per site. That is thousands of tasks, but not unlimited. The app warns you if saving fails.

## Ideas for next steps

Export / import as JSON, recurring tasks, a notification or sound when the timer ends, drag-and-drop sorting, a study-goal setting with a progress ring, and automated browser tests in GitHub Actions.

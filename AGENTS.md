# AGENTS.md

This repository contains **Boituva Print Bot**, a lightweight Chrome Extension (Manifest V3) designed to automate portal screenshots at specific scheduled times.

## 1. Environment & Commands

### Development Environment
- **Platform:** Chrome Extension (Manifest V3)
- **Language:** Vanilla JavaScript (ES6+)
- **Build System:** None. The extension is "built" by loading the source folder directly into Chrome.

### Critical Commands
As there is no `package.json` or build script, standard CLI tools are not available.

- **Installation/Run:** 
  1. Open `chrome://extensions/` in Google Chrome.
  2. Enable "Developer mode".
  3. Click "Load unpacked" and select the project root directory.
- **Reloading:** After making changes, click the "Update" or "Reload" icon on the extension card in `chrome://extensions/`.
- **Debugging:** 
  - Click the `service_worker` link in `chrome://extensions/` to open the DevTools for `background.js`.
  - Check the console for logs and errors.
- **Linting:** No automated linter is configured. Adhere to the existing style manually.
- **Testing:** No automated testing framework is installed. 
  - **Manual Verification:** Trigger functions directly from the service worker DevTools console (e.g., call `capturePortal()`).
  - **Alarm Testing:** To test schedules without waiting, modify the `SCHEDULES` constant to a time 1 minute in the future and reload the extension.

---

## 2. Code Style & Guidelines

### General Principles
- **Simplicity:** Keep the codebase minimal. Avoid adding external libraries unless strictly necessary.
- **Manifest V3:** All changes must comply with Chrome Extension Manifest V3 specifications.
- **Service Worker Persistence:** Remember that `background.js` is a service worker and can be terminated by Chrome. Use `chrome.alarms` for scheduling instead of `setTimeout`.

### Naming Conventions
- **Variables & Functions:** Use `camelCase`.
  - *Example:* `capturePortal()`, `buildFilename()`.
- **Constants:** Use `SCREAMING_SNAKE_CASE` for global constants.
  - *Example:* `TARGET_URL`, `SCHEDULES`.
- **Alarms:** Use prefixes like `warn_` and `run_` to distinguish between notification warnings and actual execution tasks.

### Formatting
- **Indentation:** Use 2 spaces.
- **Quotes:** Use double quotes (`"`) for strings.
- **Semicolons:** Always use semicolons to terminate statements.
- **Trailing Commas:** Use trailing commas in multi-line arrays and objects.

### Imports & Modularity
- Currently, the project uses a single `background.js` file.
- If modularity is required, use ES Modules (`import`/`export`). 
- Ensure `manifest.json` is updated if additional files are added to the background context (e.g., using `type: "module"` in the background field).

### Types & Documentation
- Use JSDoc comments for complex functions to specify types and return values, especially when interacting with Chrome APIs.
- *Example:*
  ```javascript
  /**
   * Calculates the next execution time.
   * @param {number} hour
   * @param {number} minute
   * @param {number} [second=0]
   * @returns {number} Epoch timestamp
   */
  function nextTime(hour, minute, second = 0) { ... }
  ```

### Error Handling
- **Async APIs:** Always wrap `await` calls in `try/catch` blocks.
- **Chrome Callbacks:** For Chrome APIs that do not return promises (or when using callbacks), always check `chrome.runtime.lastError`.
- **User Feedback:** Use the `notify()` helper function to inform the user of critical failures.

### Security & Privacy
- **Permissions:** Do not request more permissions than necessary in `manifest.json`.
- **Logging:** Do not log sensitive data or PII.
- **Target URL:** Ensure `TARGET_URL` is always a secure HTTPS endpoint.

---

## 3. Project Architecture

### manifest.json
Defines extension metadata and requested permissions:
- `alarms`: For scheduling screenshot tasks.
- `tabs`: To create and manage the portal tab.
- `downloads`: To save the captured screenshots.
- `notifications`: To alert the user of status and errors.
- `host_permissions`: `<all_urls>` is currently used to allow capturing any page, but should ideally be restricted to the specific portal domain.

### background.js
The core logic resides here. Key components:
- **Alarms System:** Uses `chrome.alarms` to trigger warnings and captures.
- **Capture Logic:** Opens a tab, waits for content to load, captures the visible area, and then closes the tab.
- **Download Utility:** Generates a timestamped filename and triggers the browser's download manager.

### Key Workflows
1. **Extension Load/Startup:** Triggers `createDailyAlarms()` to schedule the day's tasks.
2. **Alarm Triggered:** 
   - If `warn_`, shows a notification 10 seconds before capture.
   - If `run_`, executes `capturePortal()`.
3. **Capture Process:**
   - Creates a new active tab.
   - Waits (currently 10 seconds) for JS rendering.
   - Captures screenshot as Data URL.
   - Saves file via `chrome.downloads`.
   - Closes the tab regardless of success/failure.

---

## 4. Maintenance & Updates

### Adding a New Schedule
1. Locate the `SCHEDULES` array in `background.js`.
2. Add a new object with unique `warnName`, `runName`, `hour`, and `minute`.
3. Reload the extension to apply changes.

### Modifying Capture Behavior
- To change wait time: Adjust the `ms` value in the `wait(10000)` call within `capturePortal()`.
- To change filename format: Modify the `buildFilename()` utility function.

---

*This file serves as a guide for AI agents and human contributors to maintain consistency and safety within the Boituva Print Bot project.*

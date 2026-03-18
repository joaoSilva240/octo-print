const TARGET_URL = "https://webapp1-boituva.cidade360.cloud/pronimtb/";

const SCHEDULES = [
  { warnName: "warn_0820", runName: "run_0820", hour: 8, minute: 20 },
  { warnName: "warn_1200", runName: "run_1200", hour: 12, minute: 0 },
  { warnName: "warn_1700", runName: "run_1700", hour: 16, minute: 45 }
];

chrome.runtime.onInstalled.addListener(() => {
  createDailyAlarms();
});

chrome.runtime.onStartup.addListener(() => {
  createDailyAlarms();
});

function nextTime(hour, minute, second = 0) {
  const now = new Date();
  const target = new Date();
  target.setHours(hour, minute, second, 0);

  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }

  return target.getTime();
}

async function createDailyAlarms() {
  const alarms = await chrome.alarms.getAll();

  for (const alarm of alarms) {
    await chrome.alarms.clear(alarm.name);
  }

  for (const item of SCHEDULES) {
    await chrome.alarms.create(item.warnName, {
      when: nextTime(item.hour, item.minute, 0) - 10000
    });

    await chrome.alarms.create(item.runName, {
      when: nextTime(item.hour, item.minute, 0)
    });
  }

  console.log("Alarmes configurados.");
}

function notify(message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icon128.png",
    title: "Boituva Print Bot",
    message
  });
}

function buildFilename() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mi = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");

  return `boituva_${yyyy}-${mm}-${dd}_${hh}-${mi}-${ss}.png`;
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function capturePortal() {
  let tab = null;

  try {
    tab = await chrome.tabs.create({
      url: TARGET_URL,
      active: true
    });

    await wait(10000);

    chrome.tabs.captureVisibleTab(tab.windowId, { format: "png" }, async (dataUrl) => {
      if (chrome.runtime.lastError) {
        console.error("Falha em captureVisibleTab:", chrome.runtime.lastError.message);
        notify(`Falha ao capturar: ${chrome.runtime.lastError.message}`);

        if (tab?.id) {
          await chrome.tabs.remove(tab.id);
        }
        return;
      }

      if (!dataUrl || typeof dataUrl !== "string") {
        console.error("captureVisibleTab retornou vazio.");
        notify("Falha ao capturar: imagem vazia.");

        if (tab?.id) {
          await chrome.tabs.remove(tab.id);
        }
        return;
      }

      chrome.downloads.download(
        {
          url: dataUrl,
          filename: buildFilename(),
          saveAs: false
        },
        async (downloadId) => {
          if (chrome.runtime.lastError) {
            console.error("Falha no download:", chrome.runtime.lastError.message);
            notify(`Falha ao salvar print: ${chrome.runtime.lastError.message}`);
          } else {
            console.log("Print salvo. Download ID:", downloadId);
            notify("Print salvo com sucesso.");
          }

          if (tab?.id) {
            await chrome.tabs.remove(tab.id);
          }
        }
      );
    });
  } catch (error) {
    console.error("Erro geral em capturePortal:", error);
    notify(`Erro geral: ${error.message}`);

    if (tab?.id) {
      try {
        await chrome.tabs.remove(tab.id);
      } catch {}
    }
  }
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name.startsWith("warn_")) {
    notify("A captura vai começar em 10 segundos.");
    return;
  }

  if (alarm.name.startsWith("run_")) {
    await capturePortal();
    await createDailyAlarms();
  }
});
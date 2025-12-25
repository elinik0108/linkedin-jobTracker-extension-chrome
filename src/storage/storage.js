const STORAGE_KEY = "job_applications";

function loadAllApplications() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (res) => {
      resolve(res[STORAGE_KEY] || {});
    });
  });
}

async function loadApplication(id) {
  const all = await loadAllApplications();
  return all[id] || null;
}

async function saveApplication(app) {
  const all = await loadAllApplications();
  all[app.id] = {
    ...all[app.id],
    ...app,
    updatedAt: new Date().toISOString()
  };
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEY]: all }, () => resolve(all[app.id]));
  });
}

async function updateApplicationStatus(id, status) {
  const app = await loadApplication(id);
  if (!app) return null;

  if (status === "applied" && !app.appliedDate) {
    app.appliedDate = new Date().toISOString();
  }

  app.status = status;
  return saveApplication(app);
}

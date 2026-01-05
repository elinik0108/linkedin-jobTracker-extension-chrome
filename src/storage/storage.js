const STORAGE_KEY = "job_applications";

function loadAllApplications() {
  return new Promise((resolve, reject) => {
    // Check if chrome.storage is available
    if (!chrome || !chrome.storage || !chrome.storage.local) {
      reject(new Error("Chrome storage not available"));
      return;
    }

    chrome.storage.local.get([STORAGE_KEY], (res) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(res[STORAGE_KEY] || {});
      }
    });
  });
}

async function loadApplication(id) {
  try {
    const all = await loadAllApplications();
    const app = all[id] || null;
    return app;
  } catch (error) {
    return null;
  }
}

async function saveApplication(app) {
  try {
    const all = await loadAllApplications();
    all[app.id] = {
      ...all[app.id],
      ...app,
      updatedAt: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [STORAGE_KEY]: all }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(all[app.id]);
        }
      });
    });
  } catch (error) {
    return null;
  }
}

async function updateApplicationStatus(id, status, jobData = null) {
  try {
    let app = await loadApplication(id);
    if (!app) {
      if (!jobData) {
        return null;
      }
    
      app = {
        ...jobData,
        id: id,
        status: "not_applied",
        notes: "",
        createdAt: new Date().toISOString()
      };
      
      await saveApplication(app);
    }

    if (status === "applied" && !app.appliedDate) {
      app.appliedDate = new Date().toISOString();
    }

    app.status = status;
    
    return await saveApplication(app);
  } catch (error) {
    return null;
  }
}
function injectOverlay(job, app) {
  const existing = document.getElementById("jat-overlay");
  if (existing) {
    existing.remove();
  }

  const el = document.createElement("div");
  el.id = "jat-overlay";
  
  el.style.cssText = `
    position: fixed;
    top: 120px;
    right: 16px;
    width: 280px;
    z-index: 999999;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 13px;
    color: #222;
    background: #ffffff;
    border: 2px solid #0a66c2;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  `;

  el.innerHTML = `
    <div style="padding: 10px 12px; background: #0a66c2; color: white; border-radius: 6px 6px 0 0; font-weight: 600;">
      📋 Job Tracker
    </div>
    <div style="padding: 12px;">
      <div style="margin-bottom: 12px; font-size: 12px; color: #666; font-weight: 500;">
        ${job.company.length > 35 ? job.company.substring(0, 35) + '...' : job.company}
      </div>
      
      <label style="display: block; margin-bottom: 12px;">
        <div style="margin-bottom: 4px; font-weight: 500;">Status:</div>
        <select id="jat-status" style="width: 100%; padding: 6px 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 13px;">
          <option value="not_applied">📝 Not Applied</option>
          <option value="applied">✅ Applied</option>
          <option value="interview">🎤 Interview</option>
          <option value="offer">🎉 Offer</option>
          <option value="rejected">❌ Rejected</option>
        </select>
      </label>
      
      ${app && app.appliedDate ? `
        <div style="margin-bottom: 10px; font-size: 11px; color: #0a66c2; background: #f0f7ff; padding: 4px 6px; border-radius: 4px;">
          📅 Applied: ${new Date(app.appliedDate).toLocaleDateString()}
        </div>
      ` : ''}
      
      <label style="display: block;">
        <div style="margin-bottom: 4px; font-weight: 500;">Notes:</div>
        <textarea id="jat-notes" placeholder="Add notes..." style="width: 100%; box-sizing: border-box; padding: 6px 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 12px; resize: vertical; min-height: 60px; font-family: system-ui, sans-serif;">${app?.notes || ''}</textarea>
      </label>
      
      <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e5e7; font-size: 10px; color: #999; text-align: center;">
        <div style="margin-bottom: 4px;">ID: ${job.id.substring(0, 8)}</div>
        <a href="https://github.com/elinik0108/linkedin-job-tracker" target="_blank" style="color: #0a66c2; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
          Open Source
        </a>
      </div>
    </div>
  `;

  document.body.appendChild(el);

  const select = el.querySelector("#jat-status");
  const notesTextarea = el.querySelector("#jat-notes");

  if (app && app.status) {
    select.value = app.status;
  } else {
    console.log("New job, status saved!");
  }

  select.addEventListener("change", async () => {
    const newStatus = select.value;
    const updated = await updateApplicationStatus(job.id, newStatus, job);
    
    if (updated) {
      if (newStatus === "applied" && !app?.appliedDate) {
        injectOverlay(job, updated);
      }
    } else {
      console.error("Failed to save status");
    }
  });

  let notesTimeout;
  notesTextarea.addEventListener("input", () => {
    clearTimeout(notesTimeout);
    notesTimeout = setTimeout(async () => {
      let currentApp = await loadApplication(job.id);
      if (!currentApp) {
        currentApp = {
          ...job,
          status: select.value || "not_applied",
          notes: "",
          createdAt: new Date().toISOString()
        };
      }
      
      currentApp.notes = notesTextarea.value;
      await saveApplication(currentApp);
    }, 1000);
  });

}
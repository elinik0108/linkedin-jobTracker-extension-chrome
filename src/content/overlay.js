function injectOverlay(job, app) {
  if (document.getElementById("jat-overlay")) return;

  const el = document.createElement("div");
  el.id = "jat-overlay";
  el.innerHTML = `
    <strong>Application Tracker</strong><br/>
    <select id="jat-status">
      <option value="not_applied">Not applied</option>
      <option value="applied">Applied</option>
      <option value="interview">Interview</option>
      <option value="rejected">Rejected</option>
    </select>
  `;
  document.body.appendChild(el);

  const select = el.querySelector("#jat-status");
  if (app) select.value = app.status;

  select.addEventListener("change", async () => {
    await updateApplicationStatus(job.id, select.value);
  });
}

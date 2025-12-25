(async function () {

  try {
    await waitForElement("h1, h1 span");
    console.log("DOM loaded")

    const detected = detectLinkedInJobPage();

    if (!detected.isJobPage) return;

    const jobData = extractLinkedInJob();

    if (!jobData) return;

    const id = createJobHash(jobData);
    const job = { ...jobData, id };

    const app = await loadApplication(id);
    injectOverlay(job, app);

  } catch (e) {
    console.warn("Error: ", e.message);
  }
})();

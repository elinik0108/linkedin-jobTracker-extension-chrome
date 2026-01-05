(async function () {
  console.log("Job Tracker extension loaded");

  const requiredFunctions = {
    waitForElement: typeof waitForElement !== 'undefined',
    detectLinkedInJobPage: typeof detectLinkedInJobPage !== 'undefined',
    extractLinkedInJob: typeof extractLinkedInJob !== 'undefined',
    createJobHash: typeof createJobHash !== 'undefined',
    loadApplication: typeof loadApplication !== 'undefined',
    saveApplication: typeof saveApplication !== 'undefined',
    updateApplicationStatus: typeof updateApplicationStatus !== 'undefined',
    injectOverlay: typeof injectOverlay !== 'undefined'
  };

  console.log("Function availability check:", requiredFunctions);

  // Show which functions are missing
  const missing = Object.entries(requiredFunctions)
    .filter(([_, available]) => !available)
    .map(([name, _]) => name);

  if (missing.length > 0) {
    console.error("Missing functions:", missing.join(", "));
    return;
  }

  try {
    await waitForElement("h1, h1 span");
    console.log("DOM loaded");
    await new Promise(resolve => setTimeout(resolve, 500));

    const detected = detectLinkedInJobPage();

    if (!detected.isJobPage) {
      return;
    }

    console.log("Job page detected");

    const jobData = extractLinkedInJob();

    if (!jobData) {
      console.warn("Could not extract job data");
      return;
    }

    const id = createJobHash(jobData);
    const job = { ...jobData, id };

    console.log("Job data extracted:", {
      id,
      company: job.company,
      role: job.role,
      jobId: job.jobId
    });

    const app = await loadApplication(id);
    
    if (app) {
      console.log("Found existing application:", app.status);
    } else {
      console.log("New job - will create application on first status change");
    }

    injectOverlay(job, app);

  } catch (e) {
    console.error(e);
  }
})();

let lastUrl = location.href;
setInterval(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    console.log("URL changed, reloading extension");
    location.reload();
  }
}, 1000);
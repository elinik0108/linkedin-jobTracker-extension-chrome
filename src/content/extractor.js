function extractLinkedInJob() {

  const roleSelectors = [
    "h1.job-details-jobs-unified-top-card__job-title",
    "h1.t-24",
    "h1 span",
    "h1"
  ];

  let role = null;
  for (const selector of roleSelectors) {
    const el = document.querySelector(selector);
    if (el && el.innerText.trim()) {
      role = el.innerText.trim();
      break;
    }
  }

  let company = null;
  const companyEl = document.querySelector(".job-details-jobs-unified-top-card__company-name");
  if (companyEl && companyEl.innerText.trim()) {
    company = companyEl.innerText.trim().split("·")[0].trim();
  }

  if (!company) {
    const companyLinkEl = document.querySelector(".job-details-jobs-unified-top-card__company-name a");
    if (companyLinkEl && companyLinkEl.innerText.trim()) {
      company = companyLinkEl.innerText.trim().split("·")[0].trim();
    }
  }

  if (!company) {
    const altCompanyEl = document.querySelector(".jobs-unified-top-card__company-name");
    if (altCompanyEl && altCompanyEl.innerText.trim()) {
      company = altCompanyEl.innerText.trim().split("·")[0].trim();
    }
  }

  if (!company) {
    const companyClassEl = document.querySelector("[class*='company-name']");
    if (companyClassEl && companyClassEl.innerText.trim()) {
      company = companyClassEl.innerText.trim().split("·")[0].trim();
    }
  }

  if (!company) {
    const allCompanyLinks = document.querySelectorAll("a[href*='/company/']");
    for (const link of allCompanyLinks) {
      const text = link.innerText.trim();
      if (text && text.length > 1 && text.length < 100 && !text.includes("Follow")) {
        company = text.split("·")[0].trim();
        break;
      }
    }
  }

  if (!company) {
    const descriptionEl = document.querySelector(".job-details-jobs-unified-top-card__primary-description");
    if (descriptionEl) {
      const lines = descriptionEl.innerText.split("\n").map(l => l.trim()).filter(l => l);
      if (lines[0] && lines[0].length > 1 && lines[0].length < 100) {
        company = lines[0].split("·")[0].trim();
      }
    }
  }

  if (!company && role) {
    const h1 = document.querySelector("h1");
    if (h1 && h1.parentElement) {
      const parent = h1.parentElement.parentElement || h1.parentElement;
      const allText = parent.innerText.split("\n").map(l => l.trim()).filter(l => l);
      
      for (const line of allText) {
        if (line !== role && 
            line.length > 1 && 
            line.length < 100 && 
            !line.includes("·") &&
            !line.toLowerCase().includes("reposted") &&
            !line.toLowerCase().includes("promoted")) {
          company = line;
          break;
        }
      }
    }
  }

  const urlParams = new URLSearchParams(location.search);
  const jobId =
    urlParams.get("currentJobId") ||
    (location.pathname.match(/\/jobs\/view\/(\d+)/) || [])[1] ||
    null;

  let url;
  if (jobId) {
    url = `https://www.linkedin.com/jobs/view/${jobId}/`;
  } else {
    url = location.origin + location.pathname;
  }

  if (!role || !company) {
    return null;
  }

  const result = {
    company,
    role,
    jobId,
    url
  };
  return result;
}
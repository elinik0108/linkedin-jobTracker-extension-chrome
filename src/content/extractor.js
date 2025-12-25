function extractLinkedInJob() {

  const roleEl =
    document.querySelector("h1 span") ||
    document.querySelector("h1");

  const role = roleEl?.innerText.trim();


  let company = null;


  const ariaCompany = document.querySelector("[aria-label*='company'], [aria-label*='Company']");
  if (ariaCompany && ariaCompany.innerText.trim()) {
    company = ariaCompany.innerText.trim();
  }


  if (!company) {
    const companyLink = Array.from(
      document.querySelectorAll("a[href*='/company/']")
    ).find(a => a.innerText && a.innerText.trim().length > 0);

    if (companyLink) {
      company = companyLink.innerText.trim();
    }
  }

  if (!company) {
    const dataTestCompany = document.querySelector("[data-test-app-aware-link]");
    if (dataTestCompany && dataTestCompany.innerText.trim()) {
      company = dataTestCompany.innerText.trim();
    }
  }
  // try load company name from header and span tag
  if (!company) {
    const header = document.querySelector("header");
    if (header) {
      const possible = Array.from(header.querySelectorAll("span, a"))
        .map(el => el.innerText.trim())
        .find(text =>
          text &&
          text.length > 1 &&
          text.length < 100 &&
          !text.includes("·") &&
          text !== role
        );

      if (possible) company = possible;
    }
  }

  const urlParams = new URLSearchParams(location.search);
  const jobId =
    urlParams.get("currentJobId") ||
    (location.pathname.match(/\/jobs\/view\/(\d+)/) || [])[1] ||
    null;

  if (!role || !company) {
    console.warn("Error: extractor failed", { role, company });
    return null;
  }

  return {
    company,
    role,
    jobId,
    url: location.origin + location.pathname
  };
}

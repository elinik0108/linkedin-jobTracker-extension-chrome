function detectLinkedInJobPage() {
  if (!location.pathname.startsWith("/jobs")) return { isJobPage: false };
  return { isJobPage: true };
}

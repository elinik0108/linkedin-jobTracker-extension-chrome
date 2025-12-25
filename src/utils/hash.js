function stringHash(str) {
  let hash = 5381;
  let i = str.length;
  while (i) {
    hash = (hash * 33) ^ str.charCodeAt(--i);
  }
  return (hash >>> 0).toString(16);
}

function createJobHash(job) {
  const base = job.jobId
    ? `linkedin:${job.jobId}`
    : `linkedin:${job.company.toLowerCase()}|${job.role.toLowerCase()}|${job.url}`;
  return stringHash(base);
}

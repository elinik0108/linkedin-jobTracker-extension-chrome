// dashboard

const STORAGE_KEY = "job_applications";
let allJobs = [];
let currentFilter = "all";

document.addEventListener('DOMContentLoaded', async () => {
  await loadJobs();
  setupEventListeners();
});

async function loadJobs() {
  try {
    const result = await chrome.storage.local.get([STORAGE_KEY]);
    const apps = result[STORAGE_KEY] || {};
    allJobs = Object.values(apps);
    
    if (allJobs.length === 0) {
      showEmptyState();
    } else {
      updateStats();
      renderJobs();
    }
  } catch (error) {
    console.error('Error loading jobs:', error);
    document.getElementById('jobsList').innerHTML = 
      '<div class="loading">Error loading jobs</div>';
  }
}

function updateStats() {
  const stats = {
    total: allJobs.length,
    not_applied: 0,
    applied: 0,
    interview: 0,
    offer: 0,
    rejected: 0
  };
  
  allJobs.forEach(job => {
    stats[job.status] = (stats[job.status] || 0) + 1;
  });

  document.getElementById('total').textContent = stats.total;
  document.getElementById('applied').textContent = stats.applied;
  document.getElementById('interview').textContent = stats.interview;
  document.getElementById('offer').textContent = stats.offer;
  
  const interviewRate = stats.applied > 0 
    ? ((stats.interview / stats.applied) * 100).toFixed(1) + '%'
    : '-';
  const offerRate = stats.interview > 0
    ? ((stats.offer / stats.interview) * 100).toFixed(1) + '%'
    : '-';
  
  document.getElementById('interviewRate').textContent = interviewRate;
  document.getElementById('offerRate').textContent = offerRate;
}

function renderJobs() {
  const jobsList = document.getElementById('jobsList');
  const emptyState = document.getElementById('emptyState');
  
  let filteredJobs = currentFilter === 'all' 
    ? allJobs 
    : allJobs.filter(job => job.status === currentFilter);
  
  filteredJobs.sort((a, b) => 
    new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
  );
  
  if (filteredJobs.length === 0) {
    jobsList.style.display = 'none';
    emptyState.style.display = 'block';
    emptyState.querySelector('p').textContent = 
      currentFilter === 'all' ? 'No jobs tracked yet' : `No ${currentFilter} jobs`;
    return;
  }
  
  jobsList.style.display = 'block';
  emptyState.style.display = 'none';
  
  jobsList.innerHTML = filteredJobs.map(job => createJobCard(job)).join('');
  
  document.querySelectorAll('.job-card').forEach(card => {
    card.addEventListener('click', () => {
      const url = card.dataset.url;
      if (url) {
        chrome.tabs.create({ url });
      }
    });
  });
}

function createJobCard(job) {
  const statusLabels = {
    not_applied: '📝 Not Applied',
    applied: '✅ Applied',
    interview: '🎤 Interview',
    offer: '🎉 Offer',
    rejected: '❌ Rejected'
  };
  
  const dateStr = job.appliedDate 
    ? new Date(job.appliedDate).toLocaleDateString()
    : new Date(job.updatedAt || job.createdAt).toLocaleDateString();
  
  return `
    <div class="job-card" data-url="${job.url || ''}">
      <div class="job-header">
        <div class="job-company">${escapeHtml(job.company)}</div>
        <div class="job-status ${job.status}">${statusLabels[job.status] || job.status}</div>
      </div>
      <div class="job-role">${escapeHtml(job.role)}</div>
      <div class="job-meta">
        ${job.appliedDate ? `
          <div class="job-date">📅 ${dateStr}</div>
        ` : `
          <div class="job-date">🕐 ${dateStr}</div>
        `}
        ${job.jobId ? `<div>ID: ${job.jobId}</div>` : ''}
      </div>
    </div>
  `;
}

function showEmptyState() {
  document.getElementById('jobsList').style.display = 'none';
  document.getElementById('emptyState').style.display = 'block';
  
  document.getElementById('total').textContent = '0';
  document.getElementById('applied').textContent = '0';
  document.getElementById('interview').textContent = '0';
  document.getElementById('offer').textContent = '0';
}

function setupEventListeners() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.dataset.filter;
      renderJobs();
    });
  });
  

  document.getElementById('exportBtn').addEventListener('click', exportToCSV);
  
  document.getElementById('clearBtn').addEventListener('click', clearAllData);
}

function exportToCSV() {
  if (allJobs.length === 0) {
    alert('No jobs to export');
    return;
  }
  
  let csv = 'Company,Role,Status,Applied Date,Job ID,Notes,URL\n';
  
  allJobs.forEach(job => {
    const row = [
      `"${(job.company || '').replace(/"/g, '""')}"`,
      `"${(job.role || '').replace(/"/g, '""')}"`,
      job.status || '',
      job.appliedDate ? new Date(job.appliedDate).toLocaleDateString() : '',
      job.jobId || '',
      `"${(job.notes || '').replace(/"/g, '""')}"`,
      job.url || ''
    ];
    csv += row.join(',') + '\n';
  });
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `job-tracker-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// Clear all data
function clearAllData() {
  if (!confirm('Are you sure you want to delete ALL tracked jobs? This cannot be undone!')) {
    return;
  }
  
  chrome.storage.local.clear(() => {
    allJobs = [];
    showEmptyState();
    updateStats();
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
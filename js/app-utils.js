const API_BASE = 'tables';

// ────────────────────────────────────────────
// 포맷 유틸
// ────────────────────────────────────────────
function formatMoney(value) {
  return new Intl.NumberFormat('ko-KR').format(Number(value || 0)) + '원';
}

function formatDate(value) {
  if (!value) return '-';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('ko-KR');
}

function formatDateTime(value) {
  if (!value) return '-';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleString('ko-KR');
}

// ────────────────────────────────────────────
// 상태 라벨 / 배지
// ────────────────────────────────────────────
const STATUS_LABEL = {
  pending: '대기',
  approved: '승인',
  rejected: '반려',
  inactive: '비활성',
  active: '활성',
  draft: '임시저장',
  open: '공개',
  closed: '마감',
  paid: '지급완료',
  unpaid: '미지급',
  requested: '요청됨',
  contracted: '계약완료'
};

const STATUS_CLASS = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  inactive: 'secondary',
  active: 'success',
  draft: 'secondary',
  open: 'success',
  closed: 'secondary',
  paid: 'success',
  unpaid: 'warning',
  requested: 'info',
  contracted: 'success'
};

function statusBadge(status) {
  const label = STATUS_LABEL[status] || status || '-';
  const cls = STATUS_CLASS[status] || 'secondary';
  return `<span class="badge badge-${cls}">${label}</span>`;
}

// ────────────────────────────────────────────
// 토스트
// ────────────────────────────────────────────
function createToastContainer() {
  let container = document.getElementById('toast-container');
  if (container) return container;

  container = document.createElement('div');
  container.id = 'toast-container';
  container.style.position = 'fixed';
  container.style.top = '20px';
  container.style.right = '20px';
  container.style.zIndex = '9999';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.gap = '10px';
  document.body.appendChild(container);
  return container;
}

function showToast(message, type = 'success') {
  const container = createToastContainer();
  const toast = document.createElement('div');

  const bgMap = {
    success: '#16a34a',
    error: '#dc2626',
    warning: '#f59e0b',
    info: '#2563eb'
  };

  toast.textContent = message;
  toast.style.background = bgMap[type] || '#111827';
  toast.style.color = '#fff';
  toast.style.padding = '12px 16px';
  toast.style.borderRadius = '10px';
  toast.style.boxShadow = '0 8px 24px rgba(0,0,0,.15)';
  toast.style.fontSize = '14px';

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2500);
}

// ────────────────────────────────────────────
// 모달
// ────────────────────────────────────────────
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'flex';
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

// ────────────────────────────────────────────
// API 유틸
// ────────────────────────────────────────────
async function apiGet(path) {
  const res = await fetch(`${API_BASE}/${path}`);
  if (!res.ok) throw new Error(`GET 실패: ${res.status}`);
  return res.json();
}

async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`POST 실패: ${res.status}`);
  return res.json();
}

async function apiPatch(path, body) {
  const res = await fetch(`${API_BASE}/${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`PATCH 실패: ${res.status}`);
  return res.json();
}

async function apiDelete(path) {
  const res = await fetch(`${API_BASE}/${path}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error(`DELETE 실패: ${res.status}`);
  return res.json();
}

async function getAllRows(table, params = '') {
  let all = [];
  let page = 1;

  while (true) {
    const connector = params ? '&' : '?';
    const url = `${table}${params ? `?${params}` : ''}${connector}page=${page}`;
    const rows = await apiGet(url);

    if (!Array.isArray(rows) || rows.length === 0) break;
    all = all.concat(rows);

    if (rows.length < 100) break;
    page += 1;
  }

  return all;
}

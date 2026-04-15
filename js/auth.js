/**
 * 소개만 - Auth 관련 공통 유틸리티
 * 세션 기반 인증, 사용자 정보 관리
 */

const API_BASE = 'tables';

// ────────────────────────────────────────────
// 세션 관리
// ────────────────────────────────────────────
const Session = {
  set(user) {
    localStorage.setItem('sjm_user', JSON.stringify(user));
  },
  get() {
    try {
      return JSON.parse(localStorage.getItem('sjm_user'));
    } catch {
      return null;
    }
  },
  clear() {
    localStorage.removeItem('sjm_user');
  },
  isLoggedIn() {
    return !!this.get();
  }
};

// ────────────────────────────────────────────
// 로그인 처리
// ────────────────────────────────────────────
async function login(email, password) {
  try {
    const res = await fetch(`${API_BASE}/users?search=${encodeURIComponent(email)}&limit=100`);
    const data = await res.json();
    const users = data.data || [];

    // 이메일 + 비밀번호 매칭 (실제 운영에서는 서버 해시 비교 필요)
    const user = users.find(u => u.email === email && u.password === password && u.status === 'active');

    if (!user) {
      return { success: false, message: '이메일 또는 비밀번호가 올바르지 않습니다.' };
    }

    // 민감 정보 제외하고 세션 저장
    const sessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      company: user.company,
      phone: user.phone,
      job_title: user.job_title,
      status: user.status
    };
    Session.set(sessionUser);
    return { success: true, user: sessionUser };
  } catch (err) {
    console.error('Login error:', err);
    return { success: false, message: '로그인 중 오류가 발생했습니다.' };
  }
}

// ────────────────────────────────────────────
// 로그아웃
// ────────────────────────────────────────────
function logout() {
  Session.clear();
  window.location.href = 'login.html';
}

// ────────────────────────────────────────────
// 페이지 접근 제어
// ────────────────────────────────────────────
function requireLogin(allowedRoles = []) {
  const user = Session.get();
  if (!user) {
    window.location.href = 'login.html';
    return null;
  }
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    alert('접근 권한이 없습니다.');
    redirectByRole(user.role);
    return null;
  }
  return user;
}

function redirectByRole(role) {
  switch (role) {
    case 'admin': window.location.href = 'dashboard-admin.html'; break;
    case 'connector': window.location.href = 'dashboard-connector.html'; break;
    case 'supplier': window.location.href = 'dashboard-supplier.html'; break;
    default: window.location.href = 'login.html';
  }
}

// ────────────────────────────────────────────
// 유틸리티
// ────────────────────────────────────────────
function formatMoney(amount) {
  if (!amount && amount !== 0) return '-';
  return Number(amount).toLocaleString('ko-KR') + '원';
}

function formatDate(ts) {
  if (!ts) return '-';
  const d = new Date(Number(ts));
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function formatDateTime(ts) {
  if (!ts) return '-';
  const d = new Date(Number(ts));
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

const STATUS_LABEL = {
  // referral
  submitted: '접수됨',
  contact_requested: '연락 요청',
  meeting_scheduled: '미팅 예정',
  proposal_sent: '제안 발송',
  contracted: '계약 완료',
  failed: '불발',
  cancelled: '취소',
  // reward
  pending: '지급 대기',
  approved: '지급 승인',
  paid: '지급 완료',
  rejected: '반려',
  // user
  active: '활성',
  suspended: '정지',
  // item
  inactive: '비활성',
  // settlement
  scheduled: '예정',
  processing: '처리중',
  completed: '완료',
  // item_request
  open: '모집중',
  matched: '매칭됨',
  closed: '마감'
};

const STATUS_CLASS = {
  submitted: 'badge-blue',
  contact_requested: 'badge-purple',
  meeting_scheduled: 'badge-yellow',
  proposal_sent: 'badge-orange',
  contracted: 'badge-green',
  failed: 'badge-red',
  cancelled: 'badge-gray',
  pending: 'badge-yellow',
  approved: 'badge-blue',
  paid: 'badge-green',
  rejected: 'badge-red',
  active: 'badge-green',
  suspended: 'badge-red',
  inactive: 'badge-gray',
  scheduled: 'badge-blue',
  processing: 'badge-yellow',
  completed: 'badge-green',
  open: 'badge-green',
  matched: 'badge-blue',
  closed: 'badge-gray'
};

function statusBadge(status) {
  const label = STATUS_LABEL[status] || status;
  const cls = STATUS_CLASS[status] || 'badge-gray';
  return `<span class="badge ${cls}">${label}</span>`;
}

// 토스트 알림
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container') || createToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function createToastContainer() {
  const el = document.createElement('div');
  el.id = 'toast-container';
  el.className = 'toast-container';
  document.body.appendChild(el);
  return el;
}

// 모달 공통
function openModal(id) {
  document.getElementById(id).style.display = 'flex';
}
function closeModal(id) {
  document.getElementById(id).style.display = 'none';
}

// API 헬퍼
async function apiGet(table, params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/${table}${qs ? '?' + qs : ''}`);
  return res.json();
}

async function apiPost(table, data) {
  const res = await fetch(`${API_BASE}/${table}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

async function apiPatch(table, id, data) {
  const res = await fetch(`${API_BASE}/${table}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

async function apiDelete(table, id) {
  await fetch(`${API_BASE}/${table}/${id}`, { method: 'DELETE' });
}

async function getAllRows(table, params = {}) {
  const rows = [];
  let page = 1;
  while (true) {
    const data = await apiGet(table, { ...params, page, limit: 100 });
    rows.push(...(data.data || []));
    if (rows.length >= (data.total || 0)) break;
    page++;
  }
  return rows;
}

import { supabase } from './supabase-config.js';

const PUBLIC_PAGES = new Set([
  '',
  'index.html',
  'login.html'
]);

const PAGE_ROLE_RULES = {
  'dashboard-admin.html': ['super_admin', 'admin'],
  'dashboard-connector.html': ['connector'],
  'dashboard-supplier.html': ['supplier'],
  'marketplace.html': ['connector'],
  'item-request.html': ['connector']
};

function getCurrentPage() {
  const path = window.location.pathname || '';
  return path.split('/').pop() || 'index.html';
}

function getHomeByRole(profile) {
  switch (profile?.role) {
    case 'super_admin':
    case 'admin':
      return '/dashboard-admin.html';
    case 'connector':
      return '/dashboard-connector.html';
    case 'supplier':
      return '/dashboard-supplier.html';
    default:
      return '/login.html';
  }
}

async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, company_name, role, status')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('auth-guard getProfile error:', error);
    return null;
  }

  return data;
}

async function logout() {
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error('logout error:', error);
  } finally {
    window.location.href = '/login.html';
  }
}

function bindLogoutButtons() {
  document.querySelectorAll('[data-logout]').forEach((el) => {
    if (el.dataset.logoutBound === 'true') return;

    el.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });

    el.dataset.logoutBound = 'true';
  });
}

async function guardPage() {
  const page = getCurrentPage();

  if (PUBLIC_PAGES.has(page)) {
    bindLogoutButtons();
    return true;
  }

  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    window.location.href = '/login.html';
    return false;
  }

  const profile = await getProfile(session.user.id);

  if (!profile) {
    alert('프로필 정보를 찾을 수 없습니다. 다시 로그인해 주세요.');
    await logout();
    return false;
  }

  if (profile.status !== 'approved') {
    alert('관리자 승인 후 이용 가능합니다.');
    await logout();
    return false;
  }

  const allowedRoles = PAGE_ROLE_RULES[page];

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    window.location.href = getHomeByRole(profile);
    return false;
  }

  window.appAuth = {
    session,
    user: session.user,
    profile
  };

  bindLogoutButtons();

  window.dispatchEvent(
    new CustomEvent('app-auth-ready', {
      detail: window.appAuth
    })
  );

  return true;
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await guardPage();
  } catch (error) {
    console.error('auth-guard fatal error:', error);
    alert('인증 확인 중 오류가 발생했습니다. 다시 로그인해 주세요.');
    window.location.href = '/login.html';
  }
});

window.handleLogout = logout;

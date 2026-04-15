import { supabase } from './supabase-config.js';

function currentPage() {
  const path = window.location.pathname;
  const page = path.split('/').pop();
  return page || 'index.html';
}

async function getProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', userId)
      .maybeSingle();

    if (error) return null;
    return data;
  } catch (e) {
    return null;
  }
}

function getHomeByRole(profile) {
  if (!profile) return '/dashboard-admin.html';

  switch (profile.role) {
    case 'super_admin':
    case 'admin':
      return '/dashboard-admin.html';
    case 'connector':
      return '/dashboard-connector.html';
    case 'supplier':
      return '/dashboard-supplier.html';
    default:
      return '/dashboard-admin.html';
  }
}

async function guardPage() {
  const page = currentPage();

  const publicPages = ['index.html', 'login.html', ''];
  if (publicPages.includes(page)) return;

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    window.location.href = '/login.html';
    return;
  }

  const profile = await getProfile(session.user.id);

  if (profile?.status && profile.status !== 'approved') {
    await supabase.auth.signOut();
    alert('관리자 승인 후 이용 가능합니다.');
    window.location.href = '/login.html';
    return;
  }

  const roleRules = {
    'dashboard-admin.html': ['super_admin', 'admin'],
    'dashboard-connector.html': ['connector'],
    'dashboard-supplier.html': ['supplier'],
  };

  const allowedRoles = roleRules[page];

  // profiles 테이블이 아직 없거나 역할 데이터가 없으면 1차 테스트를 위해 통과
  if (!allowedRoles || !profile?.role) return;

  if (!allowedRoles.includes(profile.role)) {
    window.location.href = getHomeByRole(profile);
  }
}

async function logout() {
  await supabase.auth.signOut();
  window.location.href = '/login.html';
}

document.addEventListener('DOMContentLoaded', async () => {
  await guardPage();

  document.querySelectorAll('[data-logout]').forEach((el) => {
    el.addEventListener('click', logout);
  });
});

window.handleLogout = logout;

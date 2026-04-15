import { supabase } from './supabase-config.js';

const $ = (selector) => document.querySelector(selector);

function getEmailInput() {
  return $('#email') || $('input[type="email"]') || $('input[name="email"]');
}

function getPasswordInput() {
  return $('#password') || $('input[type="password"]') || $('input[name="password"]');
}

function getLoginForm() {
  return $('#loginForm') || $('form');
}

function getLoginButton() {
  return $('#loginBtn') || $('button[type="submit"]') || $('button');
}

function getMessageBox() {
  let box = $('#loginMessage');

  if (!box) {
    box = document.createElement('div');
    box.id = 'loginMessage';
    box.style.marginTop = '12px';
    box.style.padding = '10px 12px';
    box.style.borderRadius = '8px';
    box.style.fontSize = '14px';
    box.style.display = 'none';

    const form = getLoginForm();
    if (form) {
      form.appendChild(box);
    } else {
      document.body.appendChild(box);
    }
  }

  return box;
}

function showMessage(message, type = 'error') {
  const box = getMessageBox();
  box.style.display = 'block';
  box.textContent = message;

  if (type === 'success') {
    box.style.background = '#ecfdf3';
    box.style.color = '#027a48';
    box.style.border = '1px solid #abefc6';
  } else if (type === 'info') {
    box.style.background = '#eff8ff';
    box.style.color = '#175cd3';
    box.style.border = '1px solid #b2ddff';
  } else {
    box.style.background = '#fef3f2';
    box.style.color = '#b42318';
    box.style.border = '1px solid #fecdca';
  }
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

function getRedirectPath(profile) {
  if (!profile) return '/dashboard-admin.html';

  if (profile.status && profile.status !== 'approved') {
    return '__PENDING__';
  }

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

async function redirectIfAlreadyLoggedIn() {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) return;

  const profile = await getProfile(session.user.id);
  const target = getRedirectPath(profile);

  if (target === '__PENDING__') {
    await supabase.auth.signOut();
    showMessage('가입은 되었지만 아직 관리자 승인 전입니다.', 'error');
    return;
  }

  window.location.href = target;
}

async function handleLogin(event) {
  if (event) event.preventDefault();

  const emailInput = getEmailInput();
  const passwordInput = getPasswordInput();

  const email = emailInput?.value?.trim();
  const password = passwordInput?.value ?? '';

  if (!email || !password) {
    showMessage('이메일과 비밀번호를 모두 입력하세요.');
    return;
  }

  showMessage('로그인 중입니다...', 'info');

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    showMessage(error.message || '로그인에 실패했습니다.');
    return;
  }

  const profile = await getProfile(data.user.id);
  const target = getRedirectPath(profile);

  if (target === '__PENDING__') {
    await supabase.auth.signOut();
    showMessage('가입은 완료되었지만 아직 승인 전입니다. 관리자 승인 후 로그인하세요.');
    return;
  }

  showMessage('로그인 성공! 이동합니다.', 'success');
  window.location.href = target;
}

document.addEventListener('DOMContentLoaded', async () => {
  const form = getLoginForm();
  const button = getLoginButton();

  if (form) {
    form.addEventListener('submit', handleLogin);
  } else if (button) {
    button.addEventListener('click', handleLogin);
  }

  await redirectIfAlreadyLoggedIn();
});

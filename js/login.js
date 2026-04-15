import { supabase } from './supabase-config.js';

function $(selector) {
  return document.querySelector(selector);
}

function getEl(id) {
  return document.getElementById(id);
}

function getLoginForm() {
  return getEl('loginForm') || getEl('login-form') || $('form');
}

function getLoginButton() {
  return getEl('loginBtn') || getEl('login-btn') || $('button[type="submit"]') || $('button');
}

function getEmailInput() {
  return getEl('email');
}

function getPasswordInput() {
  return getEl('password');
}

function getLoginErrorBox() {
  return getEl('login-error');
}

function getEmailErrorBox() {
  return getEl('email-error');
}

function getPasswordErrorBox() {
  return getEl('password-error');
}

function clearFieldError(inputEl, errorEl) {
  if (inputEl) inputEl.classList.remove('error');
  if (errorEl) errorEl.textContent = '';
}

function setFieldError(inputEl, errorEl, message) {
  if (inputEl) inputEl.classList.add('error');
  if (errorEl) errorEl.textContent = message || '';
}

function clearAllErrors() {
  clearFieldError(getEmailInput(), getEmailErrorBox());
  clearFieldError(getPasswordInput(), getPasswordErrorBox());

  const loginError = getLoginErrorBox();
  if (loginError) loginError.textContent = '';
}

function showLoginMessage(message, type = 'error') {
  const box = getLoginErrorBox();

  if (!box) {
    if (message && type === 'error') {
      alert(message);
    }
    return;
  }

  box.textContent = message || '';

  box.style.display = message ? 'block' : 'none';

  if (type === 'success') {
    box.style.color = '#166534';
    box.style.background = '#DCFCE7';
    box.style.border = '1px solid #86EFAC';
  } else if (type === 'info') {
    box.style.color = '#1D4ED8';
    box.style.background = '#DBEAFE';
    box.style.border = '1px solid #93C5FD';
  } else {
    box.style.color = '#B91C1C';
    box.style.background = '#FEE2E2';
    box.style.border = '1px solid #FCA5A5';
  }
}

function setLoading(isLoading) {
  const btn = getLoginButton();
  if (!btn) return;

  btn.disabled = isLoading;
  btn.dataset.originalText = btn.dataset.originalText || btn.textContent;
  btn.textContent = isLoading ? '로그인 중...' : btn.dataset.originalText;
}

function normalizeProfile(profile, user) {
  return {
    id: user?.id || null,
    email: profile?.email || user?.email || '',
    full_name: profile?.full_name || '',
    company_name: profile?.company_name || '',
    role: profile?.role || '',
    status: profile?.status || ''
  };
}

async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, company_name, role, status')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('login getProfile error:', error);
    return null;
  }

  return data;
}

function getRedirectPath(profile) {
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

async function redirectLoggedInUser(session) {
  const profile = await getProfile(session.user.id);

  if (!profile) {
    showLoginMessage('프로필 정보를 찾을 수 없습니다. 관리자에게 문의해주세요.', 'error');
    await supabase.auth.signOut();
    return;
  }

  if (profile.status !== 'approved') {
    showLoginMessage('가입은 완료되었지만 아직 관리자 승인 전입니다.', 'error');
    await supabase.auth.signOut();
    return;
  }

  const safeProfile = normalizeProfile(profile, session.user);
  const target = getRedirectPath(safeProfile);

  window.location.href = target;
}

function validateInputs() {
  clearAllErrors();

  const emailInput = getEmailInput();
  const passwordInput = getPasswordInput();

  const email = emailInput?.value?.trim() || '';
  const password = passwordInput?.value || '';

  let ok = true;

  if (!email) {
    setFieldError(emailInput, getEmailErrorBox(), '이메일을 입력해주세요.');
    ok = false;
  }

  if (!password) {
    setFieldError(passwordInput, getPasswordErrorBox(), '비밀번호를 입력해주세요.');
    ok = false;
  }

  if (!ok) {
    showLoginMessage('이메일과 비밀번호를 모두 입력해주세요.', 'error');
    return null;
  }

  return { email, password };
}

async function handleLogin(event) {
  if (event) event.preventDefault();

  const payload = validateInputs();
  if (!payload) return;

  setLoading(true);
  showLoginMessage('로그인 정보를 확인하고 있습니다...', 'info');

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: payload.email,
      password: payload.password
    });

    if (error) {
      console.error('signInWithPassword error:', error);
      showLoginMessage('이메일 또는 비밀번호가 올바르지 않습니다.', 'error');
      return;
    }

    if (!data?.user) {
      showLoginMessage('로그인 처리 중 문제가 발생했습니다. 다시 시도해주세요.', 'error');
      return;
    }

    const profile = await getProfile(data.user.id);

    if (!profile) {
      showLoginMessage('프로필 정보를 찾을 수 없습니다. 관리자에게 문의해주세요.', 'error');
      await supabase.auth.signOut();
      return;
    }

    if (profile.status !== 'approved') {
      showLoginMessage('가입은 완료되었지만 아직 관리자 승인 전입니다.', 'error');
      await supabase.auth.signOut();
      return;
    }

    showLoginMessage('로그인 성공! 이동 중입니다...', 'success');

    const safeProfile = normalizeProfile(profile, data.user);
    const target = getRedirectPath(safeProfile);

    window.location.href = target;
  } catch (error) {
    console.error('login fatal error:', error);
    showLoginMessage('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', 'error');
  } finally {
    setLoading(false);
  }
}

function bindForm() {
  const form = getLoginForm();
  const btn = getLoginButton();

  if (form) {
    form.addEventListener('submit', handleLogin);
  }

  if (btn && !form) {
    btn.addEventListener('click', handleLogin);
  }

  const emailInput = getEmailInput();
  const passwordInput = getPasswordInput();

  if (emailInput) {
    emailInput.addEventListener('input', () => {
      clearFieldError(emailInput, getEmailErrorBox());
      const loginError = getLoginErrorBox();
      if (loginError) loginError.textContent = '';
    });
  }

  if (passwordInput) {
    passwordInput.addEventListener('input', () => {
      clearFieldError(passwordInput, getPasswordErrorBox());
      const loginError = getLoginErrorBox();
      if (loginError) loginError.textContent = '';
    });
  }
}

async function checkExistingSession() {
  try {
    const {
      data: { session }
    } = await supabase.auth.getSession();

    if (session?.user) {
      await redirectLoggedInUser(session);
    }
  } catch (error) {
    console.error('checkExistingSession error:', error);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  clearAllErrors();
  bindForm();
  await checkExistingSession();
});

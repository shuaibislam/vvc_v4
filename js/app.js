const App = (function () {
  var API_BASE = '/api';
  var csrfToken = null;

  function getCsrf() {
    if (csrfToken) return csrfToken;
    var m = document.cookie.match(/csrf_token=([^;]+)/);
    return m ? m[1] : '';
  }

  async function api(method, path, body) {
    var opts = {
      method: method,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': getCsrf() }
    };
    if (body) opts.body = JSON.stringify(body);
    var res = await fetch(API_BASE + path, opts);
    return res.json();
  }

  async function login(isAdmin) {
    var username = document.getElementById('login-username').value.trim();
    var password = document.getElementById('login-password').value;
    var errEl = document.getElementById('login-error');
    var btn = document.getElementById('login-btn');

    errEl.style.display = 'none';
    if (!username || !password) {
      errEl.textContent = 'Enter username and password.';
      errEl.style.display = 'block';
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Signing in...';

    var csrfRes = await api('GET', '/auth/csrf');
    if (csrfRes.csrfToken) csrfToken = csrfRes.csrfToken;

    var res = await api('POST', isAdmin ? '/auth/admin-login' : '/auth/login', {
      username: username,
      password: password
    });

    if (res.success) {
      window.location.href = isAdmin ? '/admin' : '/home';
    } else {
      errEl.textContent = res.error +
        (res.attemptsRemaining != null ? ' (' + res.attemptsRemaining + ' left)' : '');
      errEl.style.display = 'block';
      btn.disabled = false;
      btn.textContent = 'Sign In';
    }
  }

  async function logout() {
    await api('POST', '/auth/logout');
    window.location.href = '/login';
  }

  return { login: login, logout: logout, api: api };
})();

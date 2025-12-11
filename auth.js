// Simple password protection
// To change password, update the hash below

const PASSWORD_HASH = "fa691989"; // Updated: fa691989...

function hashPassword(pass) {
  // Simple hash - good enough for basic protection
  let hash = 0;
  for (let i = 0; i < pass.length; i++) {
    const char = pass.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

function checkAuth() {
  // Check if already authenticated (persists even after closing browser)
  const authed = localStorage.getItem("zno_auth");
  if (authed === PASSWORD_HASH) {
    return true;
  }
  return false;
}

function showAuthScreen() {
  document.body.innerHTML = `
    <div class="auth-screen">
      <div class="auth-container">
        <div class="auth-header">
          <h1>🔒 ZNO Ukrainian Test Database</h1>
          <p>Access restricted to licensed users</p>
        </div>
        <form class="auth-form" id="authForm">
          <input 
            type="password" 
            id="authPassword" 
            placeholder="Enter access code"
            autocomplete="off"
            autofocus
          />
          <button type="submit" class="auth-btn">Access Database</button>
          <div class="auth-error" id="authError"></div>
        </form>
        <div class="auth-footer">
          <p>Licensed for personal use only</p>
          <p>For access, contact the administrator</p>
        </div>
      </div>
    </div>
    <style>
      .auth-screen {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, #0d1117 0%, #1a1f2e 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Inter', -apple-system, sans-serif;
      }
      .auth-container {
        background: #161b22;
        border: 1px solid #30363d;
        border-radius: 16px;
        padding: 3rem;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      }
      .auth-header h1 {
        color: #e6edf3;
        font-size: 1.5rem;
        margin-bottom: 0.5rem;
        text-align: center;
      }
      .auth-header p {
        color: #7d8590;
        font-size: 0.9rem;
        text-align: center;
        margin-bottom: 2rem;
      }
      .auth-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      #authPassword {
        background: #21262d;
        border: 1px solid #30363d;
        border-radius: 8px;
        padding: 1rem;
        color: #e6edf3;
        font-size: 1rem;
        outline: none;
        transition: border-color 0.2s;
      }
      #authPassword:focus {
        border-color: #f0b429;
        box-shadow: 0 0 0 2px rgba(240, 180, 41, 0.3);
      }
      .auth-btn {
        background: #f0b429;
        color: #0d1117;
        border: none;
        border-radius: 8px;
        padding: 1rem;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      .auth-btn:hover {
        background: #ffcc4d;
        transform: scale(1.02);
      }
      .auth-error {
        color: #f85149;
        font-size: 0.85rem;
        text-align: center;
        min-height: 1.2em;
      }
      .auth-footer {
        margin-top: 2rem;
        padding-top: 2rem;
        border-top: 1px solid #30363d;
        text-align: center;
      }
      .auth-footer p {
        color: #7d8590;
        font-size: 0.75rem;
        margin: 0.25rem 0;
      }
    </style>
  `;

  document.getElementById("authForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("authPassword");
    const error = document.getElementById("authError");
    const hash = hashPassword(input.value.trim());

    if (hash === PASSWORD_HASH) {
      localStorage.setItem("zno_auth", hash);
      window.location.reload();
    } else {
      error.textContent = "❌ Invalid access code";
      input.value = "";
      input.classList.add("shake");
      setTimeout(() => input.classList.remove("shake"), 500);
    }
  });
}

// Run on page load
if (!checkAuth()) {
  showAuthScreen();
}

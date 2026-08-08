
export function renderAuthModal(activeTab: 'login' | 'register' = 'login'): string {
  return `
    <div class="modal-overlay active" id="auth-modal-overlay">
      <div class="product-detail-modal" style="max-width: 460px; padding: 32px 28px;">
        <button class="modal-close-btn" id="close-auth-modal-btn"><i class="fa-solid fa-xmark"></i></button>

        <div style="text-align: center; margin-bottom: 24px;">
          <img src="/assets/the-atelier-logo.svg" alt="THE ATELIER" style="height: 38px; width: auto; margin: 0 auto 12px; display: block;" />
          <div class="subtitle" style="letter-spacing: 0.15em;">PRIVATE CLIENT ACCESS</div>
        </div>

        <!-- Tabs -->
        <div class="auth-tabs" style="display: flex; border-bottom: 1px solid var(--color-border); margin-bottom: 24px;">
          <button class="auth-tab-btn ${activeTab === 'login' ? 'active' : ''}" id="auth-tab-login" style="flex: 1; padding: 10px; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; border: none; background: none; cursor: pointer; border-bottom: 2px solid ${activeTab === 'login' ? 'var(--color-gold)' : 'transparent'}; color: ${activeTab === 'login' ? 'var(--color-black)' : 'var(--color-muted)'};">
            SIGN IN
          </button>
          <button class="auth-tab-btn ${activeTab === 'register' ? 'active' : ''}" id="auth-tab-register" style="flex: 1; padding: 10px; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; border: none; background: none; cursor: pointer; border-bottom: 2px solid ${activeTab === 'register' ? 'var(--color-gold)' : 'transparent'}; color: ${activeTab === 'register' ? 'var(--color-black)' : 'var(--color-muted)'};">
            CREATE ACCOUNT
          </button>
        </div>

        <!-- Alert Banner -->
        <div id="auth-error-alert" style="display: none; padding: 10px 14px; background: #FDEDEC; border: 1px solid #F5C6CB; border-radius: var(--radius-sm); color: #721C24; font-size: 0.8rem; margin-bottom: 16px;"></div>

        ${
          activeTab === 'login'
            ? `
          <form id="auth-login-form">
            <div style="margin-bottom: 16px;">
              <label class="form-label">Email Address *</label>
              <input type="email" id="login-email" class="newsletter-input" style="width: 100%; border: 1px solid var(--color-border); border-radius: var(--radius-sm); color: var(--color-black);" placeholder="e.g. client@atelier.com" required />
            </div>

            <div style="margin-bottom: 20px;">
              <div class="flex justify-between items-center" style="margin-bottom: 4px;">
                <label class="form-label" style="margin-bottom: 0;">Password *</label>
                <a href="#" style="font-size: 0.75rem; color: var(--color-gold); text-decoration: underline;">Forgot?</a>
              </div>
              <input type="password" id="login-password" class="newsletter-input" style="width: 100%; border: 1px solid var(--color-border); border-radius: var(--radius-sm); color: var(--color-black);" placeholder="••••••••" required />
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; height: 48px;">
              SIGN IN TO ATELIER
            </button>

            <div style="margin-top: 16px; font-size: 0.75rem; color: var(--color-muted); text-align: center;">
              Admin access? Use <strong>atif@admin.com</strong> / <strong>atif@access.com</strong>
            </div>
          </form>
        `
            : `
          <form id="auth-register-form">
            <div style="margin-bottom: 14px;">
              <label class="form-label">Full Name *</label>
              <input type="text" id="reg-name" class="newsletter-input" style="width: 100%; border: 1px solid var(--color-border); border-radius: var(--radius-sm); color: var(--color-black);" placeholder="e.g. Eleanor Vance" required />
            </div>

            <div style="margin-bottom: 14px;">
              <label class="form-label">Email Address *</label>
              <input type="email" id="reg-email" class="newsletter-input" style="width: 100%; border: 1px solid var(--color-border); border-radius: var(--radius-sm); color: var(--color-black);" placeholder="e.g. client@domain.com" required />
            </div>

            <div style="margin-bottom: 16px;">
              <label class="form-label">Password *</label>
              <input type="password" id="reg-password" class="newsletter-input" style="width: 100%; border: 1px solid var(--color-border); border-radius: var(--radius-sm); color: var(--color-black);" placeholder="Min 8 chars, 1 Upper, 1 Lower, 1 Num, 1 Symbol" required />
            </div>

            <!-- Password Requirements checklist -->
            <div style="background: var(--color-ivory); padding: 12px; border-radius: var(--radius-sm); font-size: 0.72rem; color: var(--color-muted); margin-bottom: 20px;">
              <div style="font-weight: 600; margin-bottom: 4px; color: var(--color-black);">Password Requirements:</div>
              <div id="rule-len"><i class="fa-solid fa-circle-dot" style="margin-right: 4px;"></i> At least 8 characters</div>
              <div id="rule-upper"><i class="fa-solid fa-circle-dot" style="margin-right: 4px;"></i> 1 Uppercase letter (A-Z)</div>
              <div id="rule-lower"><i class="fa-solid fa-circle-dot" style="margin-right: 4px;"></i> 1 Lowercase letter (a-z)</div>
              <div id="rule-num"><i class="fa-solid fa-circle-dot" style="margin-right: 4px;"></i> 1 Numeric digit (0-9)</div>
              <div id="rule-sym"><i class="fa-solid fa-circle-dot" style="margin-right: 4px;"></i> 1 Special symbol (!@#$%^&*)</div>
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; height: 48px;">
              CREATE ACCOUNT
            </button>
          </form>
        `
        }
      </div>
    </div>
  `;
}

export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) errors.push('Password must be at least 8 characters long.');
  if (!/[A-Z]/.test(password)) errors.push('Must contain at least one uppercase letter (A-Z).');
  if (!/[a-z]/.test(password)) errors.push('Must contain at least one lowercase letter (a-z).');
  if (!/[0-9]/.test(password)) errors.push('Must contain at least one numeric digit (0-9).');
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push('Must contain at least one special symbol (!@#$%^&*).');

  return { isValid: errors.length === 0, errors };
}

// ─────────────────────────────────────────────────────────
// FERVOR Bookstore — Shared UI Components
// ─────────────────────────────────────────────────────────

export function showLogoutConfirmation() {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 9999;
      background: rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center;
      padding: 1rem;
    `;

    const modal = document.createElement('div');
    modal.style.cssText = `
      background: var(--color-surface-container-lowest, #fff);
      border-radius: 1rem;
      padding: 2rem;
      max-width: 400px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      text-align: center;
      animation: slideUp 0.25s ease;
    `;

    const icon = document.createElement('span');
    icon.className = 'material-symbols-outlined';
    icon.textContent = 'logout';
    icon.style.cssText = `
      font-size: 40px;
      color: var(--color-primary, #000);
      margin-bottom: 1rem;
    `;

    const title = document.createElement('h2');
    title.className = 'font-serif text-headline-sm text-primary';
    title.textContent = 'Cerrar sesión';
    title.style.cssText = 'margin: 0 0 0.5rem 0;';

    const msg = document.createElement('p');
    msg.className = 'font-sans text-body-md text-secondary';
    msg.textContent = '¿Estás seguro de que deseas cerrar sesión?';
    msg.style.cssText = 'margin: 0 0 1.5rem 0;';

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display: flex; gap: 0.75rem;';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn btn--outline';
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.style.cssText = 'flex: 1;';

    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'btn btn--primary';
    confirmBtn.textContent = 'Cerrar sesión';
    confirmBtn.style.cssText = 'flex: 1;';

    btnRow.appendChild(cancelBtn);
    btnRow.appendChild(confirmBtn);
    modal.appendChild(icon);
    modal.appendChild(title);
    modal.appendChild(msg);
    modal.appendChild(btnRow);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    if (!document.getElementById('fervor-modal-styles')) {
      const style = document.createElement('style');
      style.id = 'fervor-modal-styles';
      style.textContent = `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `;
      document.head.appendChild(style);
    }

    function close(result) {
      overlay.remove();
      resolve(result);
    }

    cancelBtn.addEventListener('click', () => close(false));
    confirmBtn.addEventListener('click', () => close(true));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close(false);
    });
  });
}

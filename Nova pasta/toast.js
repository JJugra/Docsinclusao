(function() {
  if (document.getElementById('custom-toast-styles')) return;
  const style = document.createElement('style');
  style.id = 'custom-toast-styles';
  style.textContent = `
    .custom-toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 12px;
      pointer-events: none;
    }
    .custom-toast {
      pointer-events: auto;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(12px) saturate(180%);
      -webkit-backdrop-filter: blur(12px) saturate(180%);
      border: 1px solid rgba(0, 0, 0, 0.08);
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
      padding: 16px 20px;
      min-width: 320px;
      max-width: 420px;
      display: flex;
      align-items: center;
      gap: 14px;
      position: relative;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      transform: translateX(120%);
      opacity: 0;
      transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }
    .custom-toast.show {
      transform: translateX(0);
      opacity: 1;
    }
    .custom-toast.hide {
      transform: translateX(120%) scale(0.9);
      opacity: 0;
    }
    .custom-toast.success {
      border-left: 6px solid #2ecc71;
      border-color: rgba(46, 204, 113, 0.2);
    }
    .custom-toast.error {
      border-left: 6px solid #e74c3c;
      border-color: rgba(231, 76, 60, 0.2);
    }
    .custom-toast.warning {
      border-left: 6px solid #f1c40f;
      border-color: rgba(241, 196, 15, 0.2);
    }
    .custom-toast.info {
      border-left: 6px solid #3498db;
      border-color: rgba(52, 152, 219, 0.2);
    }
    .custom-toast-icon {
      font-size: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .custom-toast.success .custom-toast-icon {
      background: rgba(46, 204, 113, 0.12);
      color: #2ecc71;
    }
    .custom-toast.error .custom-toast-icon {
      background: rgba(231, 76, 60, 0.12);
      color: #e74c3c;
    }
    .custom-toast.warning .custom-toast-icon {
      background: rgba(241, 196, 15, 0.12);
      color: #f1c40f;
    }
    .custom-toast.info .custom-toast-icon {
      background: rgba(52, 152, 219, 0.12);
      color: #3498db;
    }
    .custom-toast-content {
      flex-grow: 1;
    }
    .custom-toast-title {
      font-weight: 700;
      color: #1e293b;
      font-size: 14px;
      margin-bottom: 2px;
    }
    .custom-toast-message {
      color: #64748b;
      font-size: 13px;
      line-height: 1.4;
    }
    .custom-toast-close {
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 22px;
      cursor: pointer;
      padding: 0;
      line-height: 1;
      transition: color 0.2s ease, transform 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 4px;
    }
    .custom-toast-close:hover {
      color: #334155;
      transform: scale(1.1);
    }
    .custom-toast-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 4px;
      width: 100%;
      transform-origin: left;
      animation: shrinkProgress var(--toast-duration, 5000ms) linear forwards;
    }
    .custom-toast.success .custom-toast-progress {
      background: linear-gradient(90deg, #2ecc71, #27ae60);
    }
    .custom-toast.error .custom-toast-progress {
      background: linear-gradient(90deg, #e74c3c, #c0392b);
    }
    .custom-toast.warning .custom-toast-progress {
      background: linear-gradient(90deg, #f1c40f, #f39c12);
    }
    .custom-toast.info .custom-toast-progress {
      background: linear-gradient(90deg, #3498db, #2980b9);
    }
    @keyframes shrinkProgress {
      from { transform: scaleX(1); }
      to { transform: scaleX(0); }
    }
  `;
  document.head.appendChild(style);
})();

function showToast(message, type = 'success', duration = 5000) {
  let container = document.querySelector('.custom-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'custom-toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `custom-toast ${type}`;
  toast.style.setProperty('--toast-duration', `${duration}ms`);

  let icon = 'ℹ️';
  let title = 'Informação';
  if (type === 'success') { icon = '✅'; title = 'Sucesso!'; }
  else if (type === 'error') { icon = '❌'; title = 'Erro!'; }
  else if (type === 'warning') { icon = '⚠️'; title = 'Atenção!'; }

  toast.innerHTML = `
    <div class="custom-toast-icon">${icon}</div>
    <div class="custom-toast-content">
      <div class="custom-toast-title">${title}</div>
      <div class="custom-toast-message">${message}</div>
    </div>
    <button class="custom-toast-close">&times;</button>
    <div class="custom-toast-progress"></div>
  `;

  toast.querySelector('.custom-toast-close').onclick = () => removeToast(toast);

  container.appendChild(toast);

  toast.offsetHeight; // force reflow
  toast.classList.add('show');

  const timer = setTimeout(() => {
    removeToast(toast);
  }, duration);

  function removeToast(el) {
    clearTimeout(timer);
    el.classList.remove('show');
    el.classList.add('hide');
    el.addEventListener('transitionend', function handler(e) {
      if (e.propertyName === 'transform' || e.propertyName === 'opacity') {
        el.remove();
        if (container.children.length === 0) {
          container.remove();
        }
      }
    });
  }
}

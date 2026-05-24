// Quantora Analytics - Interactions & Animations

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  lucide.createIcons();

  // Preloader Logic
  const preloader = document.getElementById('preloader');
  const loaderBar = document.getElementById('loader-bar');
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 30;
    if (progress > 100) progress = 100;
    loaderBar.style.width = progress + '%';
    if (progress === 100) {
      clearInterval(interval);
      setTimeout(() => {
        preloader.style.opacity = '0';
        setTimeout(() => preloader.style.display = 'none', 800);
      }, 500);
    }
  }, 200);

  // Terminal Toggle
  const terminal = document.getElementById('terminal');
  const openTerminalBtn = document.querySelector('.btn-primary[style*="padding: 0.6rem 1.5rem"]'); // Terminal Access button
  const closeTerminalBtn = document.getElementById('close-terminal');

  const toggleTerminal = (show) => {
    terminal.style.display = show ? 'block' : 'none';
    document.body.style.overflow = show ? 'hidden' : 'auto';
  };

  openTerminalBtn.addEventListener('click', () => toggleTerminal(true));
  closeTerminalBtn.addEventListener('click', () => toggleTerminal(false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') toggleTerminal(false);
  });

  // Terminal Simulated Logs
  const terminalLog = document.getElementById('terminal-log');
  const addLog = (msg, type = 'info') => {
    const time = new Date().toLocaleTimeString();
    const color = type === 'alert' ? '#FF0000' : type === 'success' ? '#00FF00' : '#00AAFF';
    terminalLog.innerHTML += `<br><span style="color: ${color}">[${time}] [${type.toUpperCase()}]: ${msg}</span>`;
    terminalLog.scrollTop = terminalLog.scrollHeight;
  };

  setInterval(() => {
    if (terminal.style.display === 'block') {
      const msgs = [
        "Analyzing dark pool liquidity...",
        "Processing algorithmic trade signals in HKG...",
        "Neural net confidence optimized to 94.2%",
        "Updating geopolitical risk weights...",
        "Scanning satellite imagery for energy storage metrics..."
      ];
      addLog(msgs[Math.floor(Math.random() * msgs.length)]);
    }
  }, 3000);

  // Custom Cursor
  const cursor = document.querySelector('.cursor');
  const cursorDot = document.querySelector('.cursor-dot');

  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    cursorDot.style.left = e.clientX + 'px';
    cursorDot.style.top = e.clientY + 'px';
  });

  // Nav Scroll Effect
  const nav = document.querySelector('nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });

  // Scroll Reveal Animation
  const sections = document.querySelectorAll('section');
  const observerOptions = {
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  sections.forEach(section => {
    observer.observe(section);
  });

  // Smooth Scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });

  // Interactive Glass Panels
  const panels = document.querySelectorAll('.glass-panel');
  panels.forEach(panel => {
    panel.addEventListener('mousemove', (e) => {
      const rect = panel.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;
      
      panel.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
    });

    panel.addEventListener('mouseleave', () => {
      panel.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)`;
    });
  });

  // Ticker Animation Speed Adjustment
  const ticker = document.querySelector('.ticker');
  if (ticker) {
    ticker.addEventListener('mouseenter', () => {
      ticker.style.animationPlayState = 'paused';
    });
    ticker.addEventListener('mouseleave', () => {
      ticker.style.animationPlayState = 'running';
    });
  }
});

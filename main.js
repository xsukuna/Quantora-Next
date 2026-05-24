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

  // Terminal Toggle & Interactions
  const terminal = document.getElementById('terminal');
  const openTerminalBtn = document.getElementById('open-terminal');
  const closeTerminalBtn = document.getElementById('close-terminal');
  const terminalInput = document.getElementById('terminal-input');
  const terminalLog = document.getElementById('terminal-log');
  const quickAccessList = document.getElementById('terminal-quick-access');

  const toggleTerminal = (show) => {
    terminal.style.display = show ? 'block' : 'none';
    document.body.style.overflow = show ? 'hidden' : 'auto';
    if (show && terminalInput) {
      setTimeout(() => terminalInput.focus(), 50);
    }
  };

  if (openTerminalBtn) {
    openTerminalBtn.addEventListener('click', () => toggleTerminal(true));
  }
  if (closeTerminalBtn) {
    closeTerminalBtn.addEventListener('click', () => toggleTerminal(false));
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') toggleTerminal(false);
  });

  // Make terminal focus on click anywhere inside the log panel
  const terminalPanel = terminalInput ? terminalInput.closest('.glass-panel') : null;
  if (terminalPanel) {
    terminalPanel.addEventListener('click', () => {
      terminalInput.focus();
    });
  }

  const addLog = (msg, type = 'info', raw = false) => {
    if (raw) {
      terminalLog.innerHTML += `<br>${msg}`;
    } else {
      const time = new Date().toLocaleTimeString();
      const color = type === 'alert' ? '#FF4D4D' : type === 'success' ? '#00FF00' : '#00AAFF';
      terminalLog.innerHTML += `<br><span style="color: ${color}">[${time}] [${type.toUpperCase()}]: ${msg}</span>`;
    }
    terminalLog.scrollTop = terminalLog.scrollHeight;
  };

  // Commands execution logic
  const executeCommand = (cmdText) => {
    const cleanCmd = cmdText.trim().toLowerCase();
    if (!cleanCmd) return;

    // Echo command
    addLog(`<span style="color: #FFF; font-weight: bold;">quantora@terminal:~$ ${cmdText}</span>`, 'info', true);

    switch (cleanCmd) {
      case 'help':
        addLog(`
<span style="color: #FFFF00; font-weight: bold;">Available Secure CLI Commands:</span>
  <span style="color: #00FF00;">help</span>     - Display secure access options
  <span style="color: #00FF00;">about</span>    - Access corporate mission statement
  <span style="color: #00FF00;">status</span>   - Fetch system node connectivity metrics
  <span style="color: #00FF00;">market</span>   - Stream live global alternative pricing feeds
  <span style="color: #00FF00;">report</span>   - View central findings of ₹127,290 Cr Agri Exposé
  <span style="color: #00FF00;">clear</span>    - Wipe active terminal console history
  <span style="color: #00FF00;">exit</span>     - Drop secure connection and exit
        `, 'info', true);
        break;
      case 'about':
        addLog(`
<span style="color: #00FF00; font-weight: bold;">[QUANTORA INTELLIGENCE ARCHIVE]</span>
Quantora Analytics is a decentralized knowledge network and sovereign R&D ecosystem.
We synthesize macroeconomics, custom quantitative algorithms, and geospatial analytics
to fuel deep-value decisions for advanced global institutions.
Anyone, anywhere can publish and peer-review research securely on our network.
        `, 'info', true);
        break;
      case 'status':
        addLog(`
<span style="color: #00FF00; font-weight: bold;">[SYSTEM INTEGRITY METRICS]</span>
Node Connection : <span style="color: #00FF00;">ONLINE (NY-HUB-04)</span>
Uplink Bandwidth: <span style="color: #00FF00;">842 GB/s</span>
Ping Latency    : <span style="color: #00FF00;">12.4ms (SECURE TRACE)</span>
Quantum Engine  : <span style="color: #00FF00;">ACTIVE (128 QUBITS)</span>
Plagiarism check: <span style="color: #00FF00;">OK</span>
Synced Peers    : <span style="color: #00FF00;">4,812 globally</span>
        `, 'info', true);
        break;
      case 'market':
        addLog(`
<span style="color: #00FF00; font-weight: bold;">[LIVE MULTI-ASSET TICKER MATRIX]</span>
S&P 500      : 5,420.25 | <span style="color: #00FF00;">+1.24% [BULLISH]</span>
NASDAQ 100   : 19,120.40| <span style="color: #00FF00;">+0.85% [BULLISH]</span>
BTC/USD      : 67,420.00| <span style="color: #00FF00;">+4.12% [STRONG BUY]</span>
GOLD (XAU)   : 2,340.50 | <span style="color: #00FF00;">+0.22% [ACCUMULATE]</span>
CRUDE OIL    : 78.40    | <span style="color: #FF4D4D;">-1.45% [OVERDUE]</span>
        `, 'info', true);
        break;
      case 'report':
        addLog(`
<span style="color: #FF7050; font-weight: bold;">[FEATURED EXPOSÉ: BROKEN PROMISES IN THE FIELDS]</span>
Author    : Aditya Kaushik
Context   : 26-Year Forensic Budgetary Audit (FY 2000 - 2026)
Core Stat : <span style="color: #FF4D4D;">₹127,290 Crore</span> structural gap between promise and execution.
Impact    : Deepened farming indebtedness, welfare leakage, and crisis.
<span style="color: #00AAFF;">* Secure link armed: Click 'Read Report' in the main interface to unlock the full 1,000+ line report.</span>
        `, 'info', true);
        break;
      case 'clear':
        terminalLog.innerHTML = `<span style="color: #00AAFF;">Terminal console cleared. Type 'help' for support.</span>`;
        break;
      case 'exit':
        addLog('Terminating session secure pipeline...', 'alert');
        setTimeout(() => {
          toggleTerminal(false);
        }, 800);
        break;
      default:
        addLog(`<span style="color: #FF4D4D;">Secure Console Error: command '${cleanCmd}' not recognized. Type 'help' for secure commands.</span>`, 'info', true);
        break;
    }
  };

  if (terminalInput) {
    terminalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const cmdVal = terminalInput.value;
        executeCommand(cmdVal);
        terminalInput.value = '';
      }
    });
  }

  // Quick Access items connection
  if (quickAccessList) {
    quickAccessList.querySelectorAll('li').forEach(item => {
      item.addEventListener('click', () => {
        const cmd = item.getAttribute('data-cmd');
        if (cmd) {
          executeCommand(cmd);
        }
      });
    });
  }

  // Background Idle Messages (Only fires if terminal is open and user is idle)
  setInterval(() => {
    if (terminal && terminal.style.display === 'block') {
      const msgs = [
        "Analyzing dark pool liquidity...",
        "Processing algorithmic trade signals in HKG...",
        "Neural net confidence optimized to 94.2%",
        "Updating geopolitical risk weights...",
        "Scanning satellite imagery for energy storage metrics..."
      ];
      addLog(msgs[Math.floor(Math.random() * msgs.length)], 'info');
    }
  }, 6000);

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

/* ==========================================================================
   Peeyush Tiwari Portfolio JS Logic - Interactive Canvas, Custom Cursor,
   Typewriter, Filterable Modals, and Scroll Reveals
   ========================================================================== */

function initPortfolioApp() {

  // ==========================================
  // 1. Custom Cursor Trailing & Easing (Null-Safe)
  // ==========================================
  try {
    const cursor = document.getElementById('custom-cursor');
    const cursorDot = document.getElementById('custom-cursor-dot');
    
    let mouseX = 0, mouseY = 0;     // Current mouse coordinates
    let cursorX = 0, cursorY = 0;   // Lagged cursor ring coordinates
    const ease = 0.12;              // Easing amount for trailing ring (smaller = more lag)
    
    // Track mouse movements
    let lastSpawnTime = 0;
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      // Instantly position the center dot
      if (cursorDot) {
        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;
      }

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      // Spawn magic trail particle on background canvas
      const now = Date.now();
      if (now - lastSpawnTime > 25 && typeof particles !== 'undefined' && Array.isArray(particles)) {
        particles.push(new Particle(mouseX, mouseY, true));
        lastSpawnTime = now;
      }
    });

    // Animate the lagged outer cursor ring
    function animateCursor() {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        if (cursor) cursor.style.display = 'none';
        if (cursorDot) cursorDot.style.display = 'none';
        return;
      }
      // Easing formula: position += (target - position) * ease
      cursorX += (mouseX - cursorX) * ease;
      cursorY += (mouseY - cursorY) * ease;
      
      if (cursor) {
        cursor.style.left = `${cursorX}px`;
        cursor.style.top = `${cursorY}px`;
      }
      
      requestAnimationFrame(animateCursor);
    }
    if (cursor || cursorDot) {
      animateCursor();
    }

    // Add hover effect states for all interactive elements
    if (cursor) {
      const hoverables = document.querySelectorAll('a, button, .filter-btn, .project-card, .education-card, input, textarea');
      hoverables.forEach(el => {
        el.addEventListener('mouseenter', () => {
          if (cursor) cursor.classList.add('hover');
        });
        el.addEventListener('mouseleave', () => {
          if (cursor) cursor.classList.remove('hover');
        });
      });
    }
  } catch (err) {
    console.error('Cursor initialization error:', err);
  }


  // ==========================================
  // 2. Interactive Neural Particle Canvas (Null-Safe)
  // ==========================================
  let particles = [];
  let canvas, ctx;
  try {
    canvas = document.getElementById('neural-canvas');
    if (canvas) {
      ctx = canvas.getContext('2d');
      let particleCount = window.innerWidth < 768 ? 45 : 90; // Adjust density based on device width
      const connectionDistance = 110; // Max distance to draw connecting lines
      
      // Track window size and adjust canvas dims
      function resizeCanvas() {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        particleCount = window.innerWidth < 768 ? 45 : 90;
        initParticles();
      }
      
      window.addEventListener('resize', resizeCanvas);
      
      // Particle constructor
      window.Particle = class Particle {
        constructor(x, y, isTrail = false) {
          this.x = x !== undefined ? x : Math.random() * canvas.width;
          this.y = y !== undefined ? y : Math.random() * canvas.height;
          this.vx = (Math.random() - 0.5) * (isTrail ? 1.4 : 0.6);
          this.vy = (Math.random() - 0.5) * (isTrail ? 1.4 : 0.6);
          this.radius = isTrail ? (Math.random() * 3 + 1.5) : (Math.random() * 2 + 1);
          this.isTrail = isTrail;
          this.life = 1.0;
          this.decay = 0.015 + Math.random() * 0.012; // fade speed
          this.color = isTrail ? (Math.random() > 0.5 ? 'rgba(155, 93, 229,' : 'rgba(0, 242, 254,') : 'rgba(0, 242, 254,';
        }
        
        update() {
          this.x += this.vx;
          this.y += this.vy;
          
          if (this.isTrail) {
            this.life -= this.decay;
            this.radius = Math.max(0.1, this.radius - 0.03);
          } else if (canvas) {
            // Bounce off borders
            if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
            if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
          }
        }
        
        draw() {
          if (!ctx || (this.isTrail && this.life <= 0)) return;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
          if (this.isTrail) {
            ctx.fillStyle = `${this.color} ${this.life * 0.65})`;
          } else {
            ctx.fillStyle = 'rgba(0, 242, 254, 0.45)'; // Electric Teal glow
          }
          ctx.fill();
        }
      };
      
      function initParticles() {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
          particles.push(new window.Particle());
        }
      }
      
      function animateParticles() {
        if (!canvas || !ctx) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Filter out dead trail particles
        particles = particles.filter(p => !p.isTrail || p.life > 0);
        
        // Draw connections and update particles
        for (let i = 0; i < particles.length; i++) {
          particles[i].update();
          particles[i].draw();
          
          // Skip connection lines for trail particles to keep it clean
          if (particles[i].isTrail) continue;
          
          // Look forward to connect particles
          for (let j = i + 1; j < particles.length; j++) {
            if (particles[j].isTrail) continue;
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < connectionDistance) {
              // Opacity of connection fades as distance increases
              const opacity = (1 - dist / connectionDistance) * 0.15;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = `rgba(0, 242, 254, ${opacity})`;
              ctx.lineWidth = 0.8;
              ctx.stroke();
            }
          }
          
          // Connect to mouse if close enough
          const mDx = particles[i].x - mouseX;
          const mDy = particles[i].y - mouseY;
          const mDist = Math.sqrt(mDx * mDx + mDy * mDy);
          if (mDist < connectionDistance + 40) {
            const mOpacity = (1 - mDist / (connectionDistance + 40)) * 0.22;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouseX, mouseY);
            ctx.strokeStyle = `rgba(155, 93, 229, ${mOpacity})`; // Secondary Purple transition
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
        
        requestAnimationFrame(animateParticles);
      }
      
      // Set dimensions and initialize
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
      animateParticles();
    }
  } catch (err) {
    console.error('Neural canvas initialization error:', err);
  }


  // ==========================================
  // 3. Simulated Terminal Portfolio Loader (Ultra-Robust & Self-Healing)
  // ==========================================
  try {
    (function() {
      const loader = document.getElementById('loader');
      const loaderProgress = document.getElementById('loader-progress');
      const loaderPercentage = document.getElementById('loader-percentage');
      const terminalBody = document.getElementById('terminal-body');
      
      if (!loader || !loaderProgress || !loaderPercentage || !terminalBody) return;

      const logs = [
        { text: 'Fetching core developer dossiers... ', status: 'OK' },
        { text: 'Indexing tech skills: Python, AI/ML, OpenCV... ', status: 'OK' },
        { text: 'Initializing neural network parameters... ', status: 'OK' },
        { text: 'Loading 3D viewport canvas & shaders... ', status: 'OK' },
        { text: 'Compiling responsive layouts & variables... ', status: 'OK' },
        { text: 'Establishing secure agentic handshakes... ', status: 'OK' }
      ];

      let progress = 0;
      let logIndex = 0;

      function appendLog(text, status) {
        // Remove id from the previous active text element so it stops animating/updating
        const activeLine = document.getElementById('active-log');
        if (activeLine) {
          activeLine.removeAttribute('id');
          const activeText = activeLine.querySelector('span:not(.terminal-prompt)');
          if (activeText) {
            activeText.removeAttribute('id');
            // Strip cursor from completed log text
            activeText.textContent = text;
          }
          // Append the [ OK ] status
          const statusSpan = document.createElement('span');
          statusSpan.className = 'status-done';
          statusSpan.textContent = `[ ${status} ]`;
          activeLine.appendChild(statusSpan);
        }

        // Re-add active log line if we are not done
        if (logIndex < logs.length) {
          const nextActive = document.createElement('div');
          nextActive.id = 'active-log';
          nextActive.className = 'terminal-log-line';
          nextActive.innerHTML = `<span class="terminal-prompt">></span><span id="loader-text"></span>`;
          terminalBody.appendChild(nextActive);
        }

        // Scroll to bottom
        terminalBody.scrollTop = terminalBody.scrollHeight;
      }

      function updateLoader() {
        const interval = setInterval(() => {
          try {
            // Increase progress smoothly
            progress += Math.random() * 3.5 + 2.0;
            
            if (progress >= 100) {
              progress = 100;
              loaderProgress.style.width = '100%';
              loaderPercentage.textContent = '100%';
              clearInterval(interval);

              // Complete the final log step and trigger close
              appendLog(logs[logs.length - 1].text, 'OK');

              // Append final system boot success line
              const finalLine = document.createElement('div');
              finalLine.className = 'terminal-log-line';
              finalLine.innerHTML = `<span class="terminal-prompt">$</span>boot_sequence_complete --success`;
              terminalBody.appendChild(finalLine);
              terminalBody.scrollTop = terminalBody.scrollHeight;

              // Add loaded class to slide out
              setTimeout(() => {
                if (loader) loader.classList.add('loaded');
              }, 500);
            } else {
              loaderProgress.style.width = `${progress}%`;
              loaderPercentage.textContent = `${Math.floor(progress)}%`;

              // Check if we should output the next completed log line
              const threshold = (100 / logs.length) * (logIndex + 1);
              if (progress >= threshold && logIndex < logs.length - 1) {
                appendLog(logs[logIndex].text, logs[logIndex].status);
                logIndex++;
              } else {
                // Keep typing effect cursor active on current log line
                const activeText = document.getElementById('loader-text');
                if (activeText && logIndex < logs.length) {
                  const currentLog = logs[logIndex];
                  const totalChars = currentLog.text.length;
                  
                  // Calculate how far we are into the current step
                  const stepStart = (100 / logs.length) * logIndex;
                  const stepEnd = (100 / logs.length) * (logIndex + 1);
                  const percentOfStep = (progress - stepStart) / (stepEnd - stepStart);
                  
                  const charsToShow = Math.floor(totalChars * Math.min(1, percentOfStep * 1.6));
                  activeText.textContent = currentLog.text.slice(0, charsToShow) + '_';
                }
              }
            }
          } catch (intervalErr) {
            console.error('Error inside loader interval:', intervalErr);
            clearInterval(interval);
            if (loader) loader.classList.add('loaded');
          }
        }, 35);
      }

      updateLoader();
    })();
  } catch (err) {
    console.error('Loader initialization error:', err);
    const loaderEl = document.getElementById('loader');
    if (loaderEl) loaderEl.classList.add('loaded');
  }



  // ==========================================
  // 4. Hero Subtitle Typewriter Effect
  // ==========================================
  const typewriterElement = document.getElementById('typewriter-text');
  const words = ['AI Engineer.', 'Python Developer.', 'Android Developer.', 'Agentic AI Enthusiast.'];
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typeSpeed = 80;
  
  function type() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      typewriterElement.textContent = words.join(', ');
      return;
    }
    const currentWord = words[wordIndex];
    
    if (isDeleting) {
      // Backspacing
      typewriterElement.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
      typeSpeed = 40; // Backspace faster
    } else {
      // Typing
      typewriterElement.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
      typeSpeed = 100; // Natural typing speed
    }
    
    if (!isDeleting && charIndex === currentWord.length) {
      // Pause at full word
      typeSpeed = 1600; 
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      // Cycle to next word
      wordIndex = (wordIndex + 1) % words.length;
      typeSpeed = 300; // Brief pause before typing next word
    }
    
    setTimeout(type, typeSpeed);
  }
  
  // Start typewriter effect after loader completes
  setTimeout(type, 1800);


  // ==========================================
  // 5. Scroll Reveals using Intersection Observer
  // ==========================================
  const revealElements = document.querySelectorAll('.reveal-fade, .reveal-slide');
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Once revealed, no need to track it again
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12, // Trigger when 12% of the element is visible
    rootMargin: '0px 0px -50px 0px' // Offset trigger point slightly
  });
  
  revealElements.forEach(el => revealObserver.observe(el));


  // ==========================================
  // 6. Navigation Bar Scroll Effects
  // ==========================================
  const header = document.querySelector('header');
  const navLinksList = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section');
  const navLinksContainer = document.getElementById('nav-links');
  const navToggle = document.getElementById('nav-toggle');
  
  window.addEventListener('scroll', () => {
    // Nav collapse class on scroll
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    // Dynamic Active Section Link highlighting
    let currentSection = 'hero';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        currentSection = section.getAttribute('id');
      }
    });
    
    navLinksList.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  });

  // Mobile Menu Toggling
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    navLinksContainer.classList.toggle('open');
  });

  // Close Mobile Menu on Link Click
  navLinksList.forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('open');
      navLinksContainer.classList.remove('open');
    });
  });


  // ==========================================
  // 7. Experience Timelines Accordion
  // ==========================================
  const expandButtons = document.querySelectorAll('.expand-btn');
  
  expandButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = btn.nextElementSibling;
      panel.classList.toggle('open');
      
      if (panel.classList.contains('open')) {
        btn.innerHTML = 'Hide Details <span>−</span>';
      } else {
        btn.innerHTML = 'Show Details <span>+</span>';
      }
    });
  });


  // ==========================================
  // 8. Filterable Projects Grid
  // ==========================================
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle active classes on buttons
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const filterValue = btn.getAttribute('data-filter');
      
      projectCards.forEach(card => {
        const categories = card.getAttribute('data-category').split(' ');
        
        if (filterValue === 'all' || categories.includes(filterValue)) {
          card.classList.remove('hide');
          // Smooth fade in
          card.style.opacity = '0';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.classList.add('hide');
        }
      });
    });
  });
  // ==========================================
  // 8.1. Scroll Progress Bar
  // ==========================================
  const scrollProgress = document.getElementById('scroll-progress');
  window.addEventListener('scroll', () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (scrollProgress) scrollProgress.style.width = '0%';
      return;
    }
    const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
    if (scrollProgress) {
      scrollProgress.style.width = `${scrolled}%`;
    }
  });

  // ==========================================
  // 8.2. Interactive Card Spotlight & 3D Tilt
  // ==========================================
  const tiltCards = document.querySelectorAll('.project-card, .skill-category, .education-card, .contact-detail-card, .developer-ide');
  
  tiltCards.forEach(card => {
    let rect = card.getBoundingClientRect();
    let targetRotateX = 0;
    let targetRotateY = 0;
    let currentRotateX = 0;
    let currentRotateY = 0;
    let isHovered = false;
    let requestID = null;

    // Recalculate bounding box on scroll and resize
    const updateRect = () => { rect = card.getBoundingClientRect(); };
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect);

    card.addEventListener('mousemove', (e) => {
      isHovered = true;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Pass coordinates as CSS variables for spotlight rendering
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        card.style.transform = 'none';
        return;
      }

      // 3D rotation calculations
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const normX = (x - centerX) / centerX;
      const normY = (y - centerY) / centerY;

      const maxTilt = 8; // gentle maximum tilt angle
      targetRotateY = normX * maxTilt;
      targetRotateX = -normY * maxTilt;

      if (!requestID) {
        requestID = requestAnimationFrame(updateTilt);
      }
    });

    card.addEventListener('mouseleave', () => {
      isHovered = false;
      targetRotateX = 0;
      targetRotateY = 0;
      
      // Fade out spotlight by shifting coordinates away
      card.style.setProperty('--mouse-x', `-999px`);
      card.style.setProperty('--mouse-y', `-999px`);
      
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        card.style.transform = 'none';
        return;
      }
      
      if (!requestID) {
        requestID = requestAnimationFrame(updateTilt);
      }
    });

    function updateTilt() {
      const speed = isHovered ? 0.12 : 0.08;
      currentRotateX += (targetRotateX - currentRotateX) * speed;
      currentRotateY += (targetRotateY - currentRotateY) * speed;

      card.style.transform = `perspective(1000px) rotateX(${currentRotateX}deg) rotateY(${currentRotateY}deg) scale3d(${isHovered ? 1.025 : 1}, ${isHovered ? 1.025 : 1}, 1)`;

      const diffX = Math.abs(targetRotateX - currentRotateX);
      const diffY = Math.abs(targetRotateY - currentRotateY);

      if (isHovered || diffX > 0.01 || diffY > 0.01) {
        requestID = requestAnimationFrame(updateTilt);
      } else {
        card.style.transform = 'none';
        currentRotateX = 0;
        currentRotateY = 0;
        requestID = null;
      }
    }
  });

  // ==========================================
  // 8.3. Interactive Click Ripple Burst
  // ==========================================
  window.addEventListener('click', (e) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    
    // Ignore clicks on form controls
    if (['INPUT', 'TEXTAREA', 'BUTTON', 'A'].includes(e.target.tagName)) return;

    const ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    ripple.style.left = `${e.clientX}px`;
    ripple.style.top = `${e.clientY}px`;
    document.body.appendChild(ripple);

    requestAnimationFrame(() => {
      ripple.style.transform = 'translate(-50%, -50%) scale(8)';
      ripple.style.opacity = '0';
      ripple.style.borderColor = 'var(--secondary)';
    });

    setTimeout(() => {
      ripple.remove();
    }, 600);
  });

  // ==========================================
  // 8.4. Interactive Magnetic Elements Pull
  // ==========================================
  const magneticEls = document.querySelectorAll('.btn, .hero-socials a, .mouse');
  
  document.addEventListener('mousemove', (e) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      magneticEls.forEach(el => { el.style.transform = 'none'; });
      return;
    }

    magneticEls.forEach(el => {
      const rect = el.getBoundingClientRect();
      const elX = rect.left + rect.width / 2;
      const elY = rect.top + rect.height / 2;

      const dx = e.clientX - elX;
      const dy = e.clientY - elY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const pullRadius = 65; // pixels within which magnet activates

      if (dist < pullRadius) {
        const pull = (pullRadius - dist) / pullRadius; // strength multiplier
        const pullX = dx * pull * 0.35;
        const pullY = dy * pull * 0.35;

        el.style.transform = `translate(${pullX}px, ${pullY}px)`;
        el.style.transition = 'transform 0.08s ease-out';
      } else {
        el.style.transform = '';
        el.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)';
      }
    });
  });

  // ==========================================
  // 8.5. Simulated AI Agent Monitor Logs Loop
  // ==========================================
  const agentLogs = document.getElementById('widget-agent-logs');
  if (agentLogs) {
    const rawLogs = [
      { text: 'initializing agent.py...', type: 'muted' },
      { text: 'loading weights: ResNet50...', type: 'muted' },
      { text: 'established Binance WS stream', type: 'success' },
      { text: 'fetching ticker market details', type: 'info' },
      { text: 'calculating MACD indicators', type: 'info' },
      { text: 'LLM Prompt: Groq LLaMA-3 active', type: 'purple' },
      { text: 'Gemini API token: 340 token/s', type: 'purple' },
      { text: 'Sentiment analysis score: 0.88', type: 'success' },
      { text: 'placing paper trade: BUY 0.12 BTC', type: 'warning' },
      { text: 'order filled, price: 68420 USDT', type: 'success' },
      { text: 'monitoring stop-loss/take-profit', type: 'info' },
      { text: 'executing facial embedding scan', type: 'info' },
      { text: 'cv.detectMultiScale: 1 face found', type: 'success' },
      { text: 'recognized student ID: Peeyush', type: 'success' },
      { text: 'pushing attendance log: FireStore', type: 'info' },
      { text: 'n8n webhook listener active', type: 'success' },
      { text: 'triggering lesson bot broadcast', type: 'info' },
      { text: 'checking SHAP risk boundaries', type: 'warning' },
      { text: 'ECOA compliance check passed', type: 'success' }
    ];
    let logIdx = 0;
    
    // Clear initial state
    agentLogs.innerHTML = '';
    
    // Seed initial 3 logs
    for (let i = 0; i < 3; i++) {
      appendLog(rawLogs[logIdx++]);
    }
    
    function appendLog(logObj) {
      const line = document.createElement('div');
      line.className = `log-line text-${logObj.type}`;
      line.innerHTML = `&gt; ${logObj.text}`;
      agentLogs.appendChild(line);
      
      // Auto scroll
      agentLogs.scrollTop = agentLogs.scrollHeight;
      
      // Keep logs size clean
      while (agentLogs.children.length > 5) {
        agentLogs.removeChild(agentLogs.firstChild);
      }
    }

    setInterval(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      appendLog(rawLogs[logIdx]);
      logIdx = (logIdx + 1) % rawLogs.length;
    }, 2800);
  }

  // ==========================================
  // 8.6. Dynamic Git Contribution Grid Generator
  // ==========================================
  const gitGrid = document.getElementById('git-contribution-grid');
  const gitStatsCommits = document.getElementById('git-stats-commits');
  if (gitGrid) {
    const totalCells = 105; // 7 rows x 15 columns
    let commitCount = 1248;
    
    // Generate contribution cells
    for (let i = 0; i < totalCells; i++) {
      const cell = document.createElement('span');
      cell.className = 'git-cell';
      
      // Give random activity levels:
      // ~70% level 0 (empty), ~15% level 1, ~8% level 2, ~5% level 3, ~2% level 4
      const rand = Math.random();
      let activityClass = 'active-0';
      if (rand > 0.98) activityClass = 'active-4';
      else if (rand > 0.93) activityClass = 'active-3';
      else if (rand > 0.85) activityClass = 'active-2';
      else if (rand > 0.70) activityClass = 'active-1';
      
      cell.classList.add(activityClass);
      
      // Store contribution count on hover via title tooltip
      let count = 0;
      if (activityClass === 'active-1') count = Math.floor(Math.random() * 2) + 1;
      else if (activityClass === 'active-2') count = Math.floor(Math.random() * 3) + 3;
      else if (activityClass === 'active-3') count = Math.floor(Math.random() * 4) + 6;
      else if (activityClass === 'active-4') count = Math.floor(Math.random() * 5) + 10;
      
      if (count > 0) {
        cell.title = `${count} commits`;
      } else {
        cell.title = 'No contributions';
      }
      
      gitGrid.appendChild(cell);
    }
    
    // Slowly increment commits to show background activity
    setInterval(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (Math.random() > 0.6) {
        commitCount++;
        if (gitStatsCommits) {
          gitStatsCommits.textContent = `${commitCount.toLocaleString()} commits`;
        }
        
        // Randomly light up a cell on activity
        const cells = gitGrid.getElementsByClassName('git-cell');
        const randCellIdx = Math.floor(Math.random() * cells.length);
        const cell = cells[randCellIdx];
        cell.className = 'git-cell active-4';
        cell.title = `${Math.floor(Math.random() * 3) + 10} commits`;
        
        // Return cell to original random state after 1.5s
        setTimeout(() => {
          const rand = Math.random();
          let level = 'active-0';
          if (rand > 0.90) level = 'active-3';
          else if (rand > 0.75) level = 'active-2';
          else if (rand > 0.50) level = 'active-1';
          cell.className = `git-cell ${level}`;
        }, 1500);
      }
    }, 5000);
  }

  // ==========================================
  // 8.7. Dynamic System Load Fluctuation
  // ==========================================
  const systemLoadCircle = document.getElementById('system-load-circle');
  const systemLoadText = document.getElementById('system-load-percentage');
  const systemLoadStatus = document.getElementById('system-load-status');
  if (systemLoadCircle && systemLoadText) {
    let baseLoad = 82;
    let time = 0;
    
    setInterval(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      time += 0.2;
      
      // Calculate fluctuating value using sine wave + random noise
      const variance = Math.sin(time) * 6 + (Math.random() - 0.5) * 4;
      let loadVal = Math.round(baseLoad + variance);
      
      // Clamp values between 72% and 95%
      loadVal = Math.max(72, Math.min(95, loadVal));
      
      // Update text
      systemLoadText.textContent = `${loadVal}%`;
      
      // Update circle stroke-dasharray (SVG radius is 15.9155, circumference is 100)
      systemLoadCircle.setAttribute('stroke-dasharray', `${loadVal}, 100`);
      
      // Update state classes and badges
      if (systemLoadStatus) {
        if (loadVal >= 90) {
          systemLoadStatus.textContent = 'PEAK';
          systemLoadStatus.className = 'radar-status font-code orange';
        } else {
          systemLoadStatus.textContent = 'OPTIMAL';
          systemLoadStatus.className = 'radar-status font-code green';
        }
      }
    }, 1500);
  }

  // Interactive ID Card Drop/Bounce on Click
  const lanyardEl = document.getElementById('id-lanyard');
  if (lanyardEl) {
    lanyardEl.addEventListener('click', () => {
      // Remove the class, force a reflow, and add it back to trigger the animation again
      lanyardEl.classList.remove('drop-bounce');
      void lanyardEl.offsetWidth; 
      lanyardEl.classList.add('drop-bounce');
    });
  }

}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPortfolioApp);
} else {
  initPortfolioApp();
}


// ==========================================
// 9. Project Modals & Details System
// ==========================================

// Complete Case Study Datastore
const projectData = {
  rakshak: {
    tag: 'Web & AI | Self-Initiated',
    title: 'Rakshak AI — Safety & Emergency App',
    desc: 'An AI-powered emergency response web application designed to offer dynamic, context-aware safety assistance and instant emergency guidance when users are in critical situations.',
    bullets: [
      'Built a responsive web frontend utilizing React, Vite, and modular CSS systems.',
      'Integrated Generative AI APIs to generate dynamic, location/context-aware survival, medical, and safety guides on-the-fly.',
      'Implemented real-time SOS features with instant sharing of location data.',
      'Independently debugged and resolved deployment pipeline issues related to Zoho Catalyst cloud hosting (handling local pre-build bundle compilation).'
    ],
    tech: ['React', 'Vite', 'Zoho Catalyst', 'Gen AI APIs', 'Geolocation API', 'CSS Grid/Flexbox']
  },
  crimeiq: {
    tag: 'Agentic AI | Law Enforcement Tool',
    title: 'CrimeIQ Intelligence Platform',
    desc: 'A bilingual (Hindi/English) conversational analytics platform designed specifically for public safety and law enforcement investigators to query crime databases in natural language.',
    bullets: [
      'Developed an agentic conversational framework designed to translate English/Hindi natural queries into structured analytical representations.',
      'Integrated rich crime data visualization graphs and tables directly within the chat interface.',
      'Created an analytics dashboard showing geographic crime distributions and hot-spots.',
      'Constructed a working end-to-end prototype to demonstrate AI feasibility in public safety sectors.'
    ],
    tech: ['Agentic AI', 'Python', 'LLM API Integration', 'Chart.js / D3.js', 'Speech-to-Text', 'SQL']
  },
  telegrambot: {
    tag: 'Automation & Backend | Self-Initiated',
    title: 'Automated AI/ML Lesson Delivery Bot',
    desc: 'A resilient, zero-maintenance background workflow designed to generate and schedule daily AI and Machine Learning lessons, delivering them directly to a Telegram learning channel.',
    bullets: [
      'Designed a multi-stage background automation workflow using n8n as the primary orchestrator.',
      'Leveraged Gemini API to generate structured educational content, including code listings and diagrams.',
      'Implemented API fallback redundancy logic: automatically switches to Groq API when Gemini API quotas are exhausted, preventing service interruption.',
      'Configured webhooks and cron schedules to achieve 100% automated pipelines with zero manual overhead.'
    ],
    tech: ['n8n', 'Gemini API', 'Groq API', 'Telegram Bot API', 'JSON Parsing', 'Cron Jobs']
  },
  campusapp: {
    tag: 'Android App | Academic Project',
    title: 'Campus Emergency & Directory App',
    desc: 'A full-featured native Android utility application designed as an official academic deliverable for the IGNTU 4th Semester curriculum (complete with a 60-page formal project report).',
    bullets: [
      'Engineered the mobile app in Kotlin using Android Studio, strictly adhering to clean architecture and MVVM pattern.',
      'Configured Firebase Authentication, Cloud Firestore for data storage, and Cloud Storage for assets.',
      'Features include: Emergency contacts directory, interactive campus map locator, live events announcement board, Lost & Found hub, and instant push notifications.',
      'Implemented Material Design 3 guidelines for an interactive, fluid, and highly accessible user experience.'
    ],
    tech: ['Kotlin', 'Android Studio', 'MVVM Architecture', 'Firebase SDK', 'Material Design 3', 'Google Maps API']
  },
  geldium: {
    tag: 'Agentic AI | Collections Analytics',
    title: 'AI Collections Intelligence System (Geldium)',
    desc: 'An intelligent risk scoring and predictive analytics pipeline designed to model collection probabilities and risk categories, complete with transparency guardrails.',
    bullets: [
      'Designed an agentic pipeline integrating gradient-boosted decision trees to categorise accounts based on risk scores.',
      'Implemented SHAP (SHapley Additive exPlanations) algorithms to provide feature-level explainability for automated decision paths.',
      'Designed system parameters to align with strict regulatory compliance rules (including ECOA and FDCPA standards).',
      'Developed dashboards to translate model explanations into actionable steps for non-technical stakeholders.'
    ],
    tech: ['Python', 'Gradient Boosting', 'SHAP Explainability', 'Pandas / NumPy', 'Scikit-learn', 'Risk Modeling']
  }
};

function openProjectModal(projectId) {
  const modal = document.getElementById('project-modal');
  const placeholder = document.getElementById('modal-content-placeholder');
  const data = projectData[projectId];
  
  if (!data) return;
  
  // Custom cursor hover out to reset cursor scaling during animation
  document.getElementById('custom-cursor').classList.remove('hover');
  
  // Generate HTML content dynamically
  let bulletsHTML = data.bullets.map(b => `<li>${b}</li>`).join('');
  let techHTML = data.tech.map(t => `<span>${t}</span>`).join('');
  
  placeholder.innerHTML = `
    <span class="modal-project-tag">${data.tag}</span>
    <h3 class="modal-project-title">${data.title}</h3>
    <p class="modal-project-desc">${data.desc}</p>
    
    <h4 class="modal-section-title">Key Contributions & Features</h4>
    <ul class="modal-bullets">
      ${bulletsHTML}
    </ul>
    
    <h4 class="modal-section-title">Technologies Used</h4>
    <div class="modal-tech-list">
      ${techHTML}
    </div>
  `;
  
  modal.classList.add('open');
  document.body.style.overflow = 'hidden'; // Stop background scrolling
}

function closeProjectModal() {
  const modal = document.getElementById('project-modal');
  modal.classList.remove('open');
  document.body.style.overflow = 'auto'; // Re-enable background scrolling
}

// Close Modal when clicking outside the card
document.getElementById('project-modal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('project-modal')) {
    closeProjectModal();
  }
});

// Close Modal on Escape Key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeProjectModal();
  }
});


// ==========================================
// 10. Copy To Clipboard Utility
// ==========================================
function copyToClipboard(elementId) {
  const textEl = document.getElementById(elementId);
  const textVal = textEl.textContent || textEl.innerText;
  
  // Create temp input to execute copy
  const tempInput = document.createElement('input');
  tempInput.value = textVal;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand('copy');
  document.body.removeChild(tempInput);
  
  // Update button visual state
  const btn = textEl.parentElement.nextElementSibling;
  const originalText = btn.textContent;
  btn.textContent = 'Copied!';
  btn.classList.add('copied');
  
  setTimeout(() => {
    btn.textContent = originalText;
    btn.classList.remove('copied');
  }, 2000);
}


// ==========================================
// 11. Contact Form Simulated Submit
// ==========================================
function handleContactSubmit(e) {
  e.preventDefault();
  
  const form = e.target;
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const message = document.getElementById('message').value;
  const submitBtn = form.querySelector('.btn-submit');
  const successPanel = document.getElementById('form-success');
  
  // Disable button and show sending state
  submitBtn.disabled = true;
  const btnText = submitBtn.querySelector('span');
  const originalText = btnText.textContent;
  btnText.textContent = 'Sending Message...';

  // Replace this with your Web3Forms Access Key (Get one free at https://web3forms.com)
  const accessKey = "YOUR_WEB3FORMS_ACCESS_KEY";

  if (accessKey === "YOUR_WEB3FORMS_ACCESS_KEY") {
    // Fallback: If key is not set, simulate successful submission and warn in console
    console.warn("Please replace 'YOUR_WEB3FORMS_ACCESS_KEY' in script.js to activate real email delivery.");
    setTimeout(() => {
      form.reset();
      submitBtn.disabled = false;
      btnText.textContent = originalText;
      
      // Show success overlay
      successPanel.classList.add('show');
      
      // Hide success overlay after 4 seconds
      setTimeout(() => {
        successPanel.classList.remove('show');
      }, 4000);
    }, 1500);
    return;
  }
  
  // Real submission to Web3Forms
  fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      access_key: accessKey,
      name: name,
      email: email,
      message: message,
      subject: `New Portfolio Message from ${name}`
    })
  })
  .then(async (response) => {
    let json = await response.json();
    if (response.status == 200) {
      form.reset();
      successPanel.classList.add('show');
      setTimeout(() => {
        successPanel.classList.remove('show');
      }, 4000);
    } else {
      console.error(json);
      alert("Error: " + json.message);
    }
  })
  .catch((error) => {
    console.error(error);
    alert("Form submission failed. Please check your connection.");
  })
  .then(() => {
    submitBtn.disabled = false;
    btnText.textContent = originalText;
  });
}


// ==========================================
// 12. Interactive Three.js 3D Certifications Company Balls
// ==========================================
(function() {
  // Graceful exit if Three.js is not loaded
  if (typeof THREE === 'undefined') return;

  window.addEventListener('load', () => {
    const canvas3d = document.getElementById('canvas-3d-certs');
    if (!canvas3d) return;

    const container = canvas3d.parentElement;
    let width = container.clientWidth;
    let height = container.clientHeight;

    // 1. Setup Scene, Camera, and WebGLRenderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 7.5;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas3d, alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 2. Setup Lighting (Glossy standard material needs direct lighting)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight1.position.set(5, 5, 5);
    scene.add(dirLight1);

    // Cyan/Purple accent point lights for colored highlights on spheres
    const accentLight1 = new THREE.PointLight(0x00f2fe, 1.5, 10);
    accentLight1.position.set(-4, -2, 2);
    scene.add(accentLight1);

    const accentLight2 = new THREE.PointLight(0x9b5de5, 1.5, 10);
    accentLight2.position.set(4, 2, 2);
    scene.add(accentLight2);

    // 3. Create Textures dynamically on 2D Canvas from SVGs
    function createCompanyTexture(name, drawFn) {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');

      // White background for glossy ball mapping
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 256, 256);

      // Fine outer border
      ctx.strokeStyle = '#e6ebf1';
      ctx.lineWidth = 4;
      ctx.strokeRect(6, 6, 244, 244);

      // Execute logo drawings
      ctx.save();
      drawFn(ctx);
      ctx.restore();

      // Muted label text
      ctx.fillStyle = '#8a99ad';
      ctx.font = 'bold 15px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(name.toUpperCase(), 128, 222);

      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      return texture;
    }

    // Logo Draw functions
    const drawForage = (ctx) => {
      ctx.translate(128, 110);
      ctx.fillStyle = '#00F59B';
      ctx.beginPath();
      // Draw sprout leaf
      ctx.arc(0, 5, 30, 0.2, Math.PI - 0.2);
      ctx.quadraticCurveTo(-45, -35, 0, -40);
      ctx.quadraticCurveTo(45, -35, 0, 5);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-8, -12, 6, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawIsro = (ctx) => {
      ctx.translate(128, 110);
      // Orbit arc
      ctx.strokeStyle = '#0033a0';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(0, 32, 45, Math.PI, 2 * Math.PI);
      ctx.stroke();

      // Rocket triangle
      ctx.fillStyle = '#FF9933';
      ctx.beginPath();
      ctx.moveTo(0, -45);
      ctx.lineTo(20, 10);
      ctx.lineTo(8, 2);
      ctx.lineTo(12, 30);
      ctx.lineTo(-12, 30);
      ctx.lineTo(-8, 2);
      ctx.lineTo(-20, 10);
      ctx.closePath();
      ctx.fill();
    };

    const drawOracle = (ctx) => {
      ctx.translate(128, 110);
      ctx.strokeStyle = '#F80000';
      ctx.lineWidth = 15;
      ctx.beginPath();
      ctx.ellipse(0, 0, 55, 42, 0, 0, 2 * Math.PI);
      ctx.stroke();
    };

    const drawGoogle = (ctx) => {
      ctx.translate(128, 110);
      const r = 50;
      ctx.lineWidth = 18;
      // Blue sector
      ctx.strokeStyle = '#4285F4';
      ctx.beginPath();
      ctx.arc(0, 0, r, -Math.PI/4, Math.PI/4);
      ctx.stroke();
      // Green sector
      ctx.strokeStyle = '#34A853';
      ctx.beginPath();
      ctx.arc(0, 0, r, Math.PI/4, 3*Math.PI/4);
      ctx.stroke();
      // Yellow sector
      ctx.strokeStyle = '#FBBC05';
      ctx.beginPath();
      ctx.arc(0, 0, r, 3*Math.PI/4, 5*Math.PI/4);
      ctx.stroke();
      // Red sector
      ctx.strokeStyle = '#EA4335';
      ctx.beginPath();
      ctx.arc(0, 0, r, 5*Math.PI/4, 7*Math.PI/4);
      ctx.stroke();
      
      // G Horizontal bar
      ctx.fillStyle = '#4285F4';
      ctx.fillRect(0, -9, 45, 18);
    };

    const drawAnthropic = (ctx) => {
      ctx.translate(128, 110);
      ctx.fillStyle = '#CC9A6A';
      ctx.beginPath();
      ctx.moveTo(0, -45);
      ctx.lineTo(-40, 45);
      ctx.lineTo(-15, 45);
      ctx.lineTo(-5, 15);
      ctx.lineTo(5, 15);
      ctx.lineTo(15, 45);
      ctx.lineTo(40, 45);
      ctx.closePath();
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(0, -15);
      ctx.lineTo(-8, 5);
      ctx.lineTo(8, 5);
      ctx.closePath();
      ctx.fill();
    };

    const drawGoogleCloud = (ctx) => {
      ctx.translate(128, 110);
      ctx.fillStyle = '#4285F4';
      ctx.beginPath();
      ctx.arc(-22, 10, 20, 0.5 * Math.PI, 1.5 * Math.PI);
      ctx.arc(-6, -10, 25, 1.0 * Math.PI, 2.0 * Math.PI);
      ctx.arc(22, -5, 22, 1.2 * Math.PI, 2.2 * Math.PI);
      ctx.arc(22, 15, 18, 1.5 * Math.PI, 0.5 * Math.PI);
      ctx.closePath();
      ctx.fill();
      
      ctx.fillStyle = '#34A853';
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        ctx.lineTo(Math.cos(angle) * 12, Math.sin(angle) * 12);
      }
      ctx.closePath();
      ctx.fill();
    };

    const drawHarvard = (ctx) => {
      ctx.translate(128, 110);
      
      // Draw shield background
      ctx.fillStyle = '#A51C30';
      ctx.beginPath();
      ctx.moveTo(-40, -45);
      ctx.lineTo(40, -45);
      ctx.lineTo(40, 10);
      ctx.quadraticCurveTo(40, 45, 0, 55);
      ctx.quadraticCurveTo(-40, 45, -40, 10);
      ctx.closePath();
      ctx.fill();
      
      // Draw 'H' in white
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 12;
      ctx.lineCap = 'square';
      ctx.beginPath();
      ctx.moveTo(-16, -20);
      ctx.lineTo(-16, 20);
      ctx.moveTo(16, -20);
      ctx.lineTo(16, 20);
      ctx.moveTo(-16, 0);
      ctx.lineTo(16, 0);
      ctx.stroke();
    };

    const companies = [
      { name: 'Harvard', draw: drawHarvard },
      { name: 'Forage', draw: drawForage },
      { name: 'ISRO', draw: drawIsro },
      { name: 'Oracle', draw: drawOracle },
      { name: 'Google', draw: drawGoogle },
      { name: 'Anthropic', draw: drawAnthropic },
      { name: 'Google Cloud', draw: drawGoogleCloud }
    ];

    // 4. Create glossy company sphere meshes
    const spheres = [];
    const sphereRadius = 0.95;
    const boundaryRadius = 2.15; // invisible spherical cage matching the visible viewport bounds
    const spheresGroup = new THREE.Group();
    scene.add(spheresGroup);

    companies.forEach((comp, idx) => {
      const texture = createCompanyTexture(comp.name, comp.draw);
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.12,
        metalness: 0.08,
        emissive: new THREE.Color(0x000000)
      });

      const geometry = new THREE.SphereGeometry(sphereRadius, 64, 64);
      const mesh = new THREE.Mesh(geometry, material);

      // Distribute evenly on a ring within boundary, add slight depth spread
      const angle = (idx / companies.length) * Math.PI * 2;
      mesh.position.set(
        Math.cos(angle) * 1.25,
        Math.sin(angle) * 1.25,
        (Math.random() - 0.5) * 0.6
      );

      // Give each ball a tangential (orbital) kick so the cluster keeps swirling
      const tangential = new THREE.Vector3(-Math.sin(angle), Math.cos(angle), 0)
        .multiplyScalar(0.02 + Math.random() * 0.01);

      mesh.userData = {
        velocity: tangential.add(new THREE.Vector3(
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.02
        )),
        targetScale: 1.0,
        baseScale: 1.0,
        scaleImpulse: 1.0,             // elastic squish impulse factor
        glow: 0,                       // eased emissive intensity
        spinSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.01 + 0.005,
          0
        ),
        entranceDelay: idx * 6,        // frames before this ball pops in
        entrance: 0                    // 0 -> 1 grow-in progress
      };

      // Start invisible; grows in during the entrance
      mesh.scale.setScalar(0.001);

      spheresGroup.add(mesh);
      spheres.push(mesh);
    });

    // Track elapsed frames for the staggered entrance + cursor interaction state
    let frameCount = 0;
    const pointer3D = new THREE.Vector3(); // cursor projected into the scene plane
    let pointerActive = false;

    // 5. Physics and Collision update logic
    function updatePhysics() {
      frameCount++;

      const gravity = 0.00025;     // gentle pull toward center
      const swirl = 0.00014;       // tangential force -> perpetual orbital drift
      const minDistance = 2.0;     // sphereDiameter + buffer
      const restitution = 0.65;    // bounciness of collisions
      const cursorRadius = 2.3;    // interactive cursor sphere radius
      const cursorForce = 0.028;

      // Transform world pointer to spheresGroup local coordinates for accurate cursor interaction
      const localPointer = pointer3D.clone();
      spheresGroup.worldToLocal(localPointer);

      const time = Date.now() * 0.001; // used for zero-g floating wave drift

      for (let i = 0; i < spheres.length; i++) {
        const s1 = spheres[i];
        const v1 = s1.userData.velocity;

        // Staggered entrance grow-in
        if (frameCount > s1.userData.entranceDelay && s1.userData.entrance < 1) {
          s1.userData.entrance = Math.min(1, s1.userData.entrance + 0.035);
        }

        // Gravity toward center (pulls back in XYZ)
        v1.x -= s1.position.x * gravity;
        v1.y -= s1.position.y * gravity;
        v1.z -= s1.position.z * gravity * 1.5;

        // Swirl: tangential orbital force in XY plane
        v1.x += -s1.position.y * swirl;
        v1.y += s1.position.x * swirl;

        // Gentle Zero-G Floating Drift (prevents static clumping / looks organic)
        v1.x += Math.sin(time * 0.6 + i * 1.7) * 0.00025;
        v1.y += Math.cos(time * 0.5 + i * 2.3) * 0.00025;
        v1.z += Math.sin(time * 0.7 + i * 3.1) * 0.0003;

        // Cursor repulsion — pushes balls scatter away from projected pointer in 3D
        if (pointerActive) {
          const dx = s1.position.x - localPointer.x;
          const dy = s1.position.y - localPointer.y;
          const dz = s1.position.z - localPointer.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (dist < cursorRadius && dist > 0.001) {
            const push = (1 - dist / cursorRadius) * cursorForce;
            v1.x += (dx / dist) * push;
            v1.y += (dy / dist) * push;
            v1.z += (dz / dist) * push * 0.5; // slight Z displacement
          }
        }

        // Ball-to-ball collisions: positional correction + momentum exchange
        for (let j = i + 1; j < spheres.length; j++) {
          const s2 = spheres[j];
          const v2 = s2.userData.velocity;

          const dx = s1.position.x - s2.position.x;
          const dy = s1.position.y - s2.position.y;
          const dz = s1.position.z - s2.position.z;
          let dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (dist < 0.001) dist = 0.001;

          if (dist < minDistance) {
            const nx = dx / dist, ny = dy / dist, nz = dz / dist;

            // Smooth positional correction to avoid clumping jitter
            const overlap = minDistance - dist;
            const percent = 0.55; // resolve portion of penetration per frame
            const slop = 0.005;  // penetration allowance
            const correction = (Math.max(overlap - slop, 0) / dist) * percent * 0.5;
            
            const cx = dx * correction;
            const cy = dy * correction;
            const cz = dz * correction;
            
            s1.position.x += cx; s1.position.y += cy; s1.position.z += cz;
            s2.position.x -= cx; s2.position.y -= cy; s2.position.z -= cz;

            // Relative velocity along collision normal
            const rvn = (v1.x - v2.x) * nx + (v1.y - v2.y) * ny + (v1.z - v2.z) * nz;
            if (rvn < 0) { // moving toward each other
              const imp = -(1 + restitution) * rvn * 0.5;
              v1.x += imp * nx; v1.y += imp * ny; v1.z += imp * nz;
              v2.x -= imp * nx; v2.y -= imp * ny; v2.z -= imp * nz;

              // Elastic squish impulse on impact
              s1.userData.scaleImpulse = 0.82;
              s2.userData.scaleImpulse = 0.82;
            }
          }
        }

        // Apply light friction
        v1.multiplyScalar(0.99);

        // Apply velocity
        s1.position.add(v1);

        // Spherical boundary bounce with dot product verification (avoids boundary sticking)
        const rLen = s1.position.length();
        if (rLen > boundaryRadius) {
          const nx = s1.position.x / rLen, ny = s1.position.y / rLen, nz = s1.position.z / rLen;
          s1.position.set(nx * boundaryRadius * 0.99, ny * boundaryRadius * 0.99, nz * boundaryRadius * 0.99);
          
          const dot = v1.x * nx + v1.y * ny + v1.z * nz;
          if (dot > 0) { // reflect only if moving outward
            v1.x -= (1 + restitution) * dot * nx;
            v1.y -= (1 + restitution) * dot * ny;
            v1.z -= (1 + restitution) * dot * nz;
          }
        }

        // Auto spin
        s1.rotation.x += s1.userData.spinSpeed.x;
        s1.rotation.y += s1.userData.spinSpeed.y;

        // Eased hover glow -> emissive tint
        s1.userData.glow += ((s1.userData.targetScale > 1.05 ? 1 : 0) - s1.userData.glow) * 0.12;
        s1.material.emissive.setRGB(
          s1.userData.glow * 0.0,
          s1.userData.glow * 0.28,
          s1.userData.glow * 0.32
        );

        // Spring scaleImpulse back to 1.0
        s1.userData.scaleImpulse += (1.0 - s1.userData.scaleImpulse) * 0.08;

        // Interpolate scale (entrance grow-in * hover target * squish impulse)
        const target = s1.userData.targetScale * s1.userData.entrance * s1.userData.scaleImpulse;
        s1.scale.x += (target - s1.scale.x) * 0.15;
        s1.scale.y += (target - s1.scale.y) * 0.15;
        s1.scale.z += (target - s1.scale.z) * 0.15;
      }

      // Energy maintenance (thermostat) to prevent clumping or speed explosions
      const targetSpeedSq = 0.00045; // average speed squared
      const targetTotalEnergy = targetSpeedSq * spheres.length;
      let currentTotalEnergy = 0;
      spheres.forEach(s => {
        currentTotalEnergy += s.userData.velocity.lengthSq();
      });
      
      if (currentTotalEnergy > 0.00001) {
        const ratio = Math.sqrt(targetTotalEnergy / currentTotalEnergy);
        const blend = 0.05; // smooth speed adjustment
        const adjust = 1.0 + (ratio - 1.0) * blend;
        spheres.forEach(s => {
          s.userData.velocity.multiplyScalar(adjust);
        });
      }
    }

    // 6. Interactive Raycasting & Mouse Drag Rotation
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    container.addEventListener('mousemove', (e) => {
      // Calculate normalized mouse positions (-1 to +1) relative to canvas bounding box
      const rect = canvas3d.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      pointerActive = true;

      // Mouse drag rotation checks
      if (isDragging) {
        const deltaMove = {
          x: e.clientX - previousMousePosition.x,
          y: e.clientY - previousMousePosition.y
        };

        spheresGroup.rotation.y += deltaMove.x * 0.01;
        spheresGroup.rotation.x += deltaMove.y * 0.01;
      }
      
      previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    container.addEventListener('mouseleave', () => {
      mouse.x = 0;
      mouse.y = 0;
      pointerActive = false;
    });

    container.addEventListener('mousedown', (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
      canvas3d.style.cursor = 'grabbing';
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
      canvas3d.style.cursor = 'grab';
    });

    // Touch support for mobiles
    container.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1) {
        const rect = canvas3d.getBoundingClientRect();
        mouse.x = ((e.touches[0].clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.touches[0].clientY - rect.top) / rect.height) * 2 + 1;
        pointerActive = true;

        if (isDragging) {
          const deltaMove = {
            x: e.touches[0].clientX - previousMousePosition.x,
            y: e.touches[0].clientY - previousMousePosition.y
          };
          spheresGroup.rotation.y += deltaMove.x * 0.01;
          spheresGroup.rotation.x += deltaMove.y * 0.01;
        }
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    });

    container.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        pointerActive = true;
      }
    });

    container.addEventListener('touchend', () => {
      isDragging = false;
      pointerActive = false;
    });

    // 7. Render Animation Loop
    function animate() {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        updatePhysics();
        renderer.render(scene, camera);
        return;
      }
      requestAnimationFrame(animate);

      // Perform physics simulation
      updatePhysics();

      // Check intersections & project cursor 3D coordinates
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(spheres);

      if (pointerActive) {
        const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        const targetIntersection = new THREE.Vector3();
        raycaster.ray.intersectPlane(planeZ, targetIntersection);
        pointer3D.copy(targetIntersection);
      }

      spheres.forEach(s => {
        s.userData.targetScale = 1.0;
      });

      if (intersects.length > 0) {
        const hitSphere = intersects[0].object;
        hitSphere.userData.targetScale = 1.35; // Scale up hovered company ball
        hitSphere.rotation.y += 0.04;          // Add spin
      }

      // Gentle continuous ambient orbit rotation + mouse follow tilt
      if (!isDragging) {
        const targetY = mouse.x * 0.45 + Math.sin(Date.now() * 0.0005) * 0.15;
        const targetX = -mouse.y * 0.25 + Math.cos(Date.now() * 0.0004) * 0.1;
        spheresGroup.rotation.y += (targetY - spheresGroup.rotation.y) * 0.05;
        spheresGroup.rotation.x += (targetX - spheresGroup.rotation.x) * 0.05;
      }

      renderer.render(scene, camera);
    }
    animate();

    // 8. Handle Resize events
    window.addEventListener('resize', () => {
      width = container.clientWidth;
      height = container.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    });
  });
})();


// ==========================================
// 13. Interactive Three.js 3D n8n Workflow Simulation
// ==========================================
(function() {
  if (typeof THREE === 'undefined') return;

  window.addEventListener('load', () => {
    const canvasN8n = document.getElementById('canvas-3d-n8n');
    if (!canvasN8n) return;

    const container = canvasN8n.parentElement;
    let width = container.clientWidth;
    let height = container.clientHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.z = 7.5;

    const renderer = new THREE.WebGLRenderer({ canvas: canvasN8n, alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
    dirLight.position.set(4, 6, 4);
    scene.add(dirLight);

    // Warm orange and cyan lights to represent n8n + AI connections
    const lightOrange = new THREE.PointLight(0xff6f59, 2.0, 12);
    lightOrange.position.set(-3, 2, 2);
    scene.add(lightOrange);

    const lightTeal = new THREE.PointLight(0x00f2fe, 2.0, 12);
    lightTeal.position.set(3, -2, 2);
    scene.add(lightTeal);

    // 3. Dynamic Node Textures
    function createNodeTexture(title, barColor, typeText) {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');

      // Dark card background
      ctx.fillStyle = '#11131a';
      ctx.fillRect(0, 0, 256, 128);

      // Card border
      ctx.strokeStyle = '#272c3a';
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, 252, 124);

      // Colored status bar at the top (classic n8n look)
      ctx.fillStyle = barColor;
      ctx.fillRect(4, 4, 248, 16);

      // Inputs and Output Ports indicators on the sides
      ctx.fillStyle = '#4c556b';
      // Left input port dot
      ctx.beginPath();
      ctx.arc(4, 64, 8, 0, Math.PI * 2);
      ctx.fill();
      // Right output port dot
      ctx.beginPath();
      ctx.arc(252, 64, 8, 0, Math.PI * 2);
      ctx.fill();

      // Node Name Text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px "Outfit", sans-serif';
      ctx.fillText(title, 24, 60);

      // Node Type Subtext
      ctx.fillStyle = '#8a99ad';
      ctx.font = '500 13px "JetBrains Mono", monospace';
      ctx.fillText(typeText, 24, 90);

      return new THREE.CanvasTexture(canvas);
    }

    // Define Node metadata
    const nodesData = [
      { id: 'trigger', title: 'Webhook / Cron', barColor: '#ff6f59', type: 'Trigger', x: -2.3, y: 1.0, z: 0 },
      { id: 'gemini', title: 'Gemini 1.5 Pro', barColor: '#00f2fe', type: 'AI Node', x: 0, y: 0.8, z: 0.5 },
      { id: 'groq', title: 'Groq LLM Backup', barColor: '#9b5de5', type: 'Fallback', x: 0, y: -1.0, z: -0.5 },
      { id: 'telegram', title: 'Telegram Send', barColor: '#229ED9', type: 'Output', x: 2.3, y: -0.1, z: 0 }
    ];

    const nodes = [];
    const nodesGroup = new THREE.Group();
    scene.add(nodesGroup);

    nodesData.forEach(data => {
      const texture = createNodeTexture(data.title, data.barColor, data.type);
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.15,
        metalness: 0.1,
        transparent: true,
        opacity: 0.95
      });

      // Box dimensions representing n8n node rectangles
      const geometry = new THREE.BoxGeometry(1.6, 0.8, 0.25);
      const mesh = new THREE.Mesh(geometry, material);
      
      mesh.position.set(data.x, data.y, data.z);
      mesh.userData = {
        id: data.id,
        basePos: mesh.position.clone(),
        targetScale: 1.0,
        floatOffset: Math.random() * Math.PI * 2
      };

      nodesGroup.add(mesh);
      nodes.push(mesh);
    });

    // 4. Dynamic Pipeline Connections & Flowing Data Packets
    const connections = [
      { from: 'trigger', to: 'gemini', color: '#ff6f59' },
      { from: 'trigger', to: 'groq', color: '#ff6f59' },
      { from: 'gemini', to: 'telegram', color: '#00f2fe' },
      { from: 'groq', to: 'telegram', color: '#9b5de5' }
    ];

    const pipelineLines = [];
    const dataPackets = [];

    // Helper to get port coordinates
    function getPortPosition(nodeMesh, portType) {
      const pos = new THREE.Vector3();
      nodeMesh.getWorldPosition(pos);
      
      // Node scale bounding offset (half-width)
      const offset = 0.8;
      
      if (portType === 'output') {
        pos.x += offset;
      } else {
        pos.x -= offset;
      }
      return pos;
    }

    // Set up pipelines and packets
    connections.forEach((conn, index) => {
      const fromNode = nodes.find(n => n.userData.id === conn.from);
      const toNode = nodes.find(n => n.userData.id === conn.to);

      // CatmullRom curve setup
      const pStart = getPortPosition(fromNode, 'output');
      const pEnd = getPortPosition(toNode, 'input');
      const pMid = new THREE.Vector3().addVectors(pStart, pEnd).multiplyScalar(0.5);
      // Give curve a nice bezier arch
      pMid.y += 0.4;
      pMid.z += 0.2;

      const curve = new THREE.CatmullRomCurve3([pStart, pMid, pEnd]);
      
      // Line geometry
      const lineGeom = new THREE.BufferGeometry().setFromPoints(curve.getPoints(30));
      const lineMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(conn.color),
        transparent: true,
        opacity: 0.35,
        linewidth: 1.5
      });
      const line = new THREE.Line(lineGeom, lineMat);
      scene.add(line);

      pipelineLines.push({
        line: line,
        fromNode: fromNode,
        toNode: toNode,
        color: conn.color
      });

      // Flowing data packets (small glowing spheres)
      const packetGeom = new THREE.SphereGeometry(0.06, 16, 16);
      const packetMat = new THREE.MeshBasicMaterial({ color: conn.color });
      const packetMesh = new THREE.Mesh(packetGeom, packetMat);
      scene.add(packetMesh);

      dataPackets.push({
        mesh: packetMesh,
        fromNode: fromNode,
        toNode: toNode,
        progress: Math.random(), // Start at random positions
        speed: 0.004 + Math.random() * 0.003
      });
    });

    // 5. Update loop for positions, curves, and packets
    function updateScene() {
      const time = Date.now() * 0.0015;

      // 1. Node Floating offset
      nodes.forEach(node => {
        const offset = node.userData.floatOffset;
        node.position.y = node.userData.basePos.y + Math.sin(time + offset) * 0.12;
        node.position.x = node.userData.basePos.x + Math.cos(time * 0.8 + offset) * 0.06;

        // Hover scale interpolator
        node.scale.x += (node.userData.targetScale - node.scale.x) * 0.15;
        node.scale.y += (node.userData.targetScale - node.scale.y) * 0.15;
        node.scale.z += (node.userData.targetScale - node.scale.z) * 0.15;
      });

      // 2. Re-calculate dynamic pipelines
      pipelineLines.forEach((p, idx) => {
        const pStart = getPortPosition(p.fromNode, 'output');
        const pEnd = getPortPosition(p.toNode, 'input');
        const pMid = new THREE.Vector3().addVectors(pStart, pEnd).multiplyScalar(0.5);
        pMid.y += 0.4;
        pMid.z += 0.2;

        const curve = new THREE.CatmullRomCurve3([pStart, pMid, pEnd]);
        
        // Update line geometry vertices
        p.line.geometry.dispose();
        p.line.geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(30));

        // Update corresponding packet
        const packet = dataPackets[idx];
        packet.progress = (packet.progress + packet.speed) % 1.0;
        packet.mesh.position.copy(curve.getPointAt(packet.progress));
      });
    }

    // 6. Interactive Raycasting & Mouse Drag
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    container.addEventListener('mousemove', (e) => {
      const rect = canvasN8n.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging) {
        const deltaMove = {
          x: e.clientX - previousMousePosition.x,
          y: e.clientY - previousMousePosition.y
        };
        nodesGroup.rotation.y += deltaMove.x * 0.01;
        nodesGroup.rotation.x += deltaMove.y * 0.01;
      }
      previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    container.addEventListener('mouseleave', () => {
      mouse.x = 0;
      mouse.y = 0;
    });

    container.addEventListener('mousedown', (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
      canvasN8n.style.cursor = 'grabbing';
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
      canvasN8n.style.cursor = 'grab';
    });

    // Mobile touch
    container.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1) {
        const rect = canvasN8n.getBoundingClientRect();
        mouse.x = ((e.touches[0].clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.touches[0].clientY - rect.top) / rect.height) * 2 + 1;

        if (isDragging) {
          const deltaMove = {
            x: e.touches[0].clientX - previousMousePosition.x,
            y: e.touches[0].clientY - previousMousePosition.y
          };
          nodesGroup.rotation.y += deltaMove.x * 0.01;
          nodesGroup.rotation.x += deltaMove.y * 0.01;
        }
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    });

    container.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    });

    container.addEventListener('touchend', () => {
      isDragging = false;
    });

    // 7. Animation Loop
    function animate() {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        updateScene();
        renderer.render(scene, camera);
        return;
      }
      requestAnimationFrame(animate);

      updateScene();

      // Raycast intersections
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodes);

      nodes.forEach(n => {
        n.userData.targetScale = 1.0;
      });

      if (intersects.length > 0) {
        const hitNode = intersects[0].object;
        hitNode.userData.targetScale = 1.2;
      }

      // Gentle continuous rotation + mouse follow tilt
      if (!isDragging) {
        const targetY = mouse.x * 0.4 + Math.sin(Date.now() * 0.0003) * 0.25;
        const targetX = -mouse.y * 0.2 + Math.cos(Date.now() * 0.0002) * 0.1;
        nodesGroup.rotation.y += (targetY - nodesGroup.rotation.y) * 0.05;
        nodesGroup.rotation.x += (targetX - nodesGroup.rotation.x) * 0.05;
      }

      renderer.render(scene, camera);
    }
    animate();

    // 8. Handle Resize
    window.addEventListener('resize', () => {
      width = container.clientWidth;
      height = container.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    });
  });
})();


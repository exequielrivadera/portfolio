/* PULSO DIGITAL — interacciones del portfolio */
(() => {
  "use strict";

  // Mostrar la bienvenida en cada carga o recarga de la página.
  // Si el visitante prefiere reducir movimiento, conservamos una bienvenida estática y breve.
  const introScreen = document.querySelector("#intro-screen");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (introScreen) {
    document.body.classList.add("intro-sequence");
    introScreen.classList.add("is-visible");

    const introDuration = prefersReducedMotion ? 900 : 2100;
    const fadeDuration = prefersReducedMotion ? 0 : 600;

    window.setTimeout(() => {
      introScreen.classList.add("is-leaving");
      window.setTimeout(() => introScreen.remove(), fadeDuration);
    }, introDuration);
  }

  // Destellos de los tres divisores: izquierda→derecha, derecha→izquierda, izquierda→derecha.
  const heroDivider = document.querySelector(".hero-bottom-line");
  const projectDividerTrigger = document.querySelector(".projects-note");
  const aboutDividerTrigger = document.querySelector(".about-section .text-link");
  const dividerTriggers = [heroDivider, projectDividerTrigger, aboutDividerTrigger].filter(Boolean);

  if ("IntersectionObserver" in window) {
    const dividerObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        // Observar la primera línea en sí, no toda la portada, permite
        // reiniciar el destello cada vez que la línea vuelve a cruzar la zona visible.
        if (entry.target === heroDivider) {
          heroDivider.classList.toggle("is-lit", entry.isIntersecting);
          return;
        }

        const section = entry.target.closest(".projects, .about-section");
        if (!section) return;
        // Quitar la clase al salir permite que CSS reproduzca la animación
        // desde el inicio cuando el visitante vuelve a pasar por la sección.
        section.classList.toggle("line-revealed", entry.isIntersecting);
      });
    }, { threshold: 0, rootMargin: "-2% 0px -12% 0px" });

    dividerTriggers.forEach((trigger) => dividerObserver.observe(trigger));
  } else {
    if (heroDivider) heroDivider.classList.add("is-lit");
    document.querySelectorAll(".projects, .about-section").forEach((section) => section.classList.add("line-revealed"));
  }


  // Última línea divisoria: electrocardiograma que cruza la línea una sola vez al llegar al footer.
  // La clase se añade una única vez durante esta carga y no se reactiva al volver a subir.
  const footerDivider = document.querySelector(".site-footer");
  if (footerDivider && "IntersectionObserver" in window && !prefersReducedMotion) {
    let footerHeartbeatPlayed = false;
    const footerHeartbeatObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !footerHeartbeatPlayed) {
          footerHeartbeatPlayed = true;
          footerDivider.classList.add("heartbeat-played");
          footerHeartbeatObserver.unobserve(footerDivider);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -4% 0px" });
    footerHeartbeatObserver.observe(footerDivider);
  }

  const menuToggle = document.querySelector(".menu-toggle");
  const mainNav = document.querySelector("#main-nav");

  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
      const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!isExpanded));
      menuToggle.setAttribute("aria-label", isExpanded ? "Abrir menú" : "Cerrar menú");
      mainNav.classList.toggle("is-open", !isExpanded);
    });

    mainNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mainNav.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Abrir menú");
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        mainNav.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Abrir menú");
      }
    });
  }

  // Filtros accesibles para la grilla de proyectos.
  const filterButtons = document.querySelectorAll("[data-filter]");
  const projectCards = document.querySelectorAll(".project-card[data-category]");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;

      filterButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });

      projectCards.forEach((card) => {
        const shouldShow = filter === "todos" || card.dataset.category === filter;
        card.hidden = !shouldShow;
      });
    });
  });

  // Modal informativo de DocuCentral (no hay demo web pública).
  const dialog = document.querySelector("#docu-dialog");
  const openButtons = document.querySelectorAll("[data-open-docu]");
  const closeButtons = document.querySelectorAll("[data-close-docu]");

  const openDialog = () => {
    if (!dialog) return;
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
      document.body.classList.add("dialog-open");
    } else {
      dialog.setAttribute("open", "");
    }
  };

  const closeDialog = () => {
    if (!dialog) return;
    if (typeof dialog.close === "function" && dialog.open) {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
    }
    document.body.classList.remove("dialog-open");
  };

  openButtons.forEach((button) => button.addEventListener("click", openDialog));
  closeButtons.forEach((button) => button.addEventListener("click", closeDialog));

  if (dialog) {
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) closeDialog();
    });
    dialog.addEventListener("close", () => document.body.classList.remove("dialog-open"));
  }


  // Pulso Arcade: minijuegos ligeros integrados en la página, sin dependencias externas.
  const arcadeDialog = document.querySelector("#arcade-dialog");
  const arcadeStage = document.querySelector("#arcade-game-stage");
  const arcadeTitle = document.querySelector("#arcade-dialog-title");
  const arcadeLanguage = document.querySelector("#arcade-language");
  const arcadeInstructions = document.querySelector("#arcade-instructions");
  const arcadeActions = document.querySelector("#arcade-dialog-actions");
  const arcadeHint = document.querySelector("#arcade-hint");
  let arcadeCleanup = () => {};
  let arcadeTimers = [];
  let arcadeAnimationFrame = 0;

  const arcadeTimeout = (fn, ms) => {
    const id = window.setTimeout(fn, ms);
    arcadeTimers.push(id);
    return id;
  };
  const clearArcadeRun = () => {
    arcadeCleanup();
    arcadeCleanup = () => {};
    arcadeTimers.forEach(window.clearTimeout);
    arcadeTimers = [];
    if (arcadeAnimationFrame) cancelAnimationFrame(arcadeAnimationFrame);
    arcadeAnimationFrame = 0;
    window.removeEventListener("keydown", arcadeKeyHandler);
  };
  const arcadeKeyHandler = (event) => {
    if (!arcadeDialog?.open) return;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) {
      const tag = document.activeElement?.tagName;
      if (tag !== "BUTTON" && tag !== "INPUT") event.preventDefault();
    }
  };
  const arcadeButton = (label, action, extra = "") => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `arcade-btn ${extra}`.trim();
    button.textContent = label;
    button.addEventListener("click", action);
    return button;
  };
  const setArcadeActions = (...buttons) => {
    arcadeActions.replaceChildren(...buttons);
  };
  const setArcadeStage = (...nodes) => arcadeStage.replaceChildren(...nodes);
  const arcadeMessage = (text, className = "arcade-message") => {
    const p = document.createElement("p");
    p.className = className;
    p.textContent = text;
    return p;
  };
  const arcadeNumber = (text) => {
    const el = document.createElement("div");
    el.className = "arcade-big-number";
    el.textContent = text;
    return el;
  };
  const arcadeScore = (text) => {
    const el = document.createElement("div");
    el.className = "arcade-score";
    el.textContent = text;
    return el;
  };

  function startArcadeGame(game, language) {
    clearArcadeRun();
    arcadeLanguage.textContent = `${language.toUpperCase()} / MINI GAME`;
    arcadeActions.replaceChildren();
    arcadeHint.textContent = "ESC para cerrar · Juegos de demostración de Pulso Digital.";
    const replay = () => startArcadeGame(game, language);

    if (game === "reaction") {
      arcadeTitle.textContent = "Pulso de reacción";
      arcadeInstructions.textContent = "Tocá INICIAR y esperá. Cuando la pantalla se ponga roja, reaccioná lo más rápido posible. No pulses antes.";
      let state = "ready";
      let startAt = 0;
      let result = null;
      const panel = document.createElement("button");
      panel.type = "button";
      panel.className = "arcade-reaction-panel";
      panel.style.cssText = "width:min(100%,420px);min-height:150px;border:1px solid #573138;background:#151112;color:#f5e9eb;font:800 1rem 'Courier New',monospace;letter-spacing:.1em;cursor:pointer;padding:20px;";
      panel.textContent = "LISTO PARA PROBAR";
      panel.addEventListener("click", () => {
        if (state === "ready" || state === "result" || state === "early") {
          state = "waiting";
          panel.disabled = false;
          panel.style.background = "#151112";
          panel.style.borderColor = "#573138";
          panel.textContent = "ESPERÁ LA SEÑAL…";
          arcadeActions.replaceChildren();
          arcadeTimeout(() => {
            if (state !== "waiting") return;
            state = "go";
            startAt = performance.now();
            panel.style.background = "#8f2530";
            panel.style.borderColor = "#f28b94";
            panel.style.boxShadow = "0 0 34px rgba(215,100,109,.38)";
            panel.textContent = "¡AHORA!";
          }, 1200 + Math.random() * 2200);
        } else if (state === "waiting") {
          state = "early";
          panel.style.background = "#302126";
          panel.textContent = "¡DEMASIADO PRONTO!";
          setArcadeActions(arcadeButton("INTENTAR DE NUEVO", replay));
        } else if (state === "go") {
          result = Math.round(performance.now() - startAt);
          state = "result";
          panel.style.background = "#151112";
          panel.style.boxShadow = "none";
          panel.textContent = `${result} ms`;
          setArcadeActions(arcadeButton("VOLVER A JUGAR", replay));
        }
      });
      setArcadeStage(panel, arcadeMessage("Tu objetivo: reaccionar en el momento justo."));
      setArcadeActions(arcadeButton("INICIAR PARTIDA", () => {
        state = "ready";
        panel.click();
      }));
      arcadeCleanup = () => { state = "closed"; };
      return;
    }

    if (game === "memory") {
      arcadeTitle.textContent = "Pixel Match";
      arcadeInstructions.textContent = "Encontrá las seis parejas. Intentá resolverlo con la menor cantidad de movimientos.";
      const symbols = ["◆", "♥", "★", "●", "▲", "✚", "◆", "♥", "★", "●", "▲", "✚"].sort(() => Math.random() - .5);
      const grid = document.createElement("div");
      grid.className = "arcade-pixel-grid";
      let first = null, lock = false, moves = 0, matched = 0;
      const score = arcadeScore("MOVIMIENTOS: 0");
      const tiles = [];
      const update = () => { score.textContent = `MOVIMIENTOS: ${moves} · PAREJAS: ${matched / 2}/6`; };
      symbols.forEach((symbol, index) => {
        const tile = document.createElement("button");
        tile.type = "button";
        tile.className = "arcade-pixel-tile";
        tile.textContent = "?";
        tile.setAttribute("aria-label", `Carta ${index + 1}, oculta`);
        tile.addEventListener("click", () => {
          if (lock || tile.classList.contains("is-matched") || tile === first) return;
          tile.textContent = symbol;
          tile.classList.add("is-open");
          tile.setAttribute("aria-label", `Carta ${index + 1}: ${symbol}`);
          if (!first) { first = tile; return; }
          moves++;
          const previous = first;
          const previousSymbol = previous.dataset.symbol;
          first = null;
          tile.dataset.symbol = symbol;
          if (previousSymbol === symbol) {
            previous.classList.add("is-matched");
            tile.classList.add("is-matched");
            matched += 2;
            update();
            if (matched === symbols.length) {
              setArcadeStage(score, arcadeMessage(`¡Completado! Encontraste todas las parejas en ${moves} movimientos.`));
              setArcadeActions(arcadeButton("JUGAR OTRA VEZ", replay));
            }
          } else {
            lock = true;
            update();
            arcadeTimeout(() => {
              previous.textContent = "?"; tile.textContent = "?";
              previous.classList.remove("is-open"); tile.classList.remove("is-open");
              lock = false;
            }, 650);
          }
        });
        tile.dataset.symbol = symbol;
        tiles.push(tile);
        grid.append(tile);
      });
      setArcadeStage(score, grid);
      setArcadeActions(arcadeButton("MEZCLAR Y REINICIAR", replay));
      arcadeCleanup = () => { tiles.forEach((tile) => { tile.disabled = true; }); };
      return;
    }

    if (game === "code") {
      arcadeTitle.textContent = "Code Breaker";
      arcadeInstructions.textContent = "Superá 3 desafíos de HTML: ordená las etiquetas y el contenido para construir estructuras válidas.";
      const levels = [
        {
          title: "NIVEL 1 · ESTRUCTURA BÁSICA",
          hint: "Primero se abre el contenedor, después el título y al final se cierran en orden inverso.",
          correct: ["<main>", "<h1>", "Hola mundo", "</h1>", "</main>"],
          tokens: ["</main>", "<h1>", "</h1>", "<main>", "Hola mundo"]
        },
        {
          title: "NIVEL 2 · PÁRRAFO",
          hint: "El párrafo debe quedar dentro de <section> y sus etiquetas de apertura y cierre deben rodear el texto.",
          correct: ["<section>", "<p>", "Estoy aprendiendo HTML", "</p>", "</section>"],
          tokens: ["</p>", "<section>", "Estoy aprendiendo HTML", "</section>", "<p>"]
        },
        {
          title: "NIVEL 3 · ENLACE",
          hint: "El enlace va dentro del párrafo, y el párrafo dentro de <article>. Cada etiqueta debe cerrarse en orden inverso.",
          correct: ["<article>", "<p>", "<a>", "Visitar sitio", "</a>", "</p>", "</article>"],
          tokens: ["</article>", "<a>", "<article>", "</p>", "Visitar sitio", "<p>", "</a>"]
        }
      ];
      let levelIndex = 0;
      const renderLevel = () => {
        const level = levels[levelIndex];
        const chosen = [];
        const output = document.createElement("pre");
        output.className = "arcade-code-output";
        output.textContent = "Tu código aparecerá acá…";
        const options = document.createElement("div");
        options.className = "arcade-order-options";
        const heading = arcadeScore(`${level.title} · ${levelIndex + 1}/${levels.length}`);
        const feedback = arcadeMessage(level.hint);
        const shuffled = [...level.tokens].sort(() => Math.random() - .5);
        const renderOutput = () => {
          output.textContent = chosen.length ? chosen.join("\n") : "Tu código aparecerá acá…";
        };
        shuffled.forEach((part, index) => {
          const btn = arcadeButton(part, () => {
            if (btn.classList.contains("is-selected") || chosen.length >= level.correct.length) return;
            btn.classList.add("is-selected");
            btn.disabled = true;
            chosen.push(part);
            renderOutput();
            if (chosen.length === level.correct.length) {
              const isCorrect = chosen.every((value, i) => value === level.correct[i]);
              if (isCorrect) {
                feedback.textContent = levelIndex === levels.length - 1
                  ? "¡Excelente! Ordenaste correctamente los 3 desafíos y desbloqueaste el código."
                  : "¡Correcto! La estructura HTML está bien ordenada. ¡Pasaste al siguiente nivel!";
                feedback.classList.add("is-success");
                setArcadeStage(heading, output, options, feedback);
                setArcadeActions(
                  ...(levelIndex === levels.length - 1
                    ? [arcadeButton("JUGAR OTRA VEZ", replay)]
                    : [arcadeButton("SIGUIENTE NIVEL", () => { levelIndex++; renderLevel(); })])
                );
              } else {
                feedback.textContent = "El código no está en el orden correcto. ¡Intentá de nuevo! Revisá qué etiquetas contienen a las otras y recordá cerrar primero la que se abrió última.";
                feedback.classList.add("is-error");
                setArcadeStage(heading, output, options, feedback);
                setArcadeActions(arcadeButton("REINTENTAR ESTE NIVEL", renderLevel), arcadeButton("REINICIAR JUEGO", replay));
              }
            }
          }, "arcade-order-token");
          btn.setAttribute("aria-label", `Opción ${index + 1}: ${part}`);
          options.append(btn);
        });
        setArcadeStage(heading, output, options, feedback);
        setArcadeActions(arcadeButton("REINICIAR JUEGO", replay));
      };
      renderLevel();
      return;
    }

    if (game === "sql") {
      arcadeTitle.textContent = "Detective de datos";
      arcadeInstructions.textContent = "Resolvé 3 casos de SQL. Leé cada situación, elegí la consulta adecuada y aprendé por qué funciona.";
      const cases = [
        {
          title: "CASO 1 · PEDIDOS PENDIENTES",
          question: "El cliente quiere ver todos los pedidos cuyo estado sea 'pendiente'. ¿Qué consulta devuelve esos registros sin borrarlos?",
          options: [
            { text: "SELECT * FROM pedidos WHERE estado = 'pendiente';", ok: true, explanation: "¡Correcto! SELECT recupera datos y WHERE filtra las filas cuyo estado es pendiente." },
            { text: "DELETE FROM pedidos WHERE estado = 'pendiente';", ok: false, explanation: "DELETE elimina registros; no sirve para consultar y podría borrar pedidos." },
            { text: "SELECT estado FROM clientes;", ok: false, explanation: "Esta consulta mira la tabla clientes y no filtra los pedidos pendientes." }
          ]
        },
        {
          title: "CASO 2 · BUSCAR UN CLIENTE",
          question: "Necesitás encontrar al cliente cuyo id sea 12. ¿Qué consulta corresponde?",
          options: [
            { text: "SELECT * FROM clientes WHERE id = 12;", ok: true, explanation: "¡Bien! WHERE id = 12 limita el resultado al cliente con ese identificador." },
            { text: "UPDATE clientes SET id = 12;", ok: false, explanation: "UPDATE modifica datos y, sin WHERE, podría cambiar el id de todos los clientes." },
            { text: "SELECT * FROM pedidos WHERE id = 12;", ok: false, explanation: "La tabla consultada es pedidos, pero el caso pide buscar en clientes." }
          ]
        },
        {
          title: "CASO 3 · ORDENAR PRECIOS",
          question: "Querés listar productos del más barato al más caro. ¿Qué consulta los ordena correctamente?",
          options: [
            { text: "SELECT * FROM productos ORDER BY precio ASC;", ok: true, explanation: "¡Caso resuelto! ORDER BY ordena resultados y ASC los muestra de menor a mayor." },
            { text: "SELECT * FROM productos ORDER BY precio DESC;", ok: false, explanation: "DESC ordena de mayor a menor, justo al revés de lo que pide el caso." },
            { text: "DELETE FROM productos ORDER BY precio ASC;", ok: false, explanation: "DELETE es para borrar registros, no para listar productos ordenados." }
          ]
        }
      ];
      let caseIndex = 0;
      const renderCase = () => {
        const item = cases[caseIndex];
        const heading = arcadeScore(`${item.title} · ${caseIndex + 1}/${cases.length}`);
        const question = arcadeMessage(item.question);
        const box = document.createElement("div");
        box.className = "arcade-sql-options";
        let answered = false;
        item.options.slice().sort(() => Math.random() - .5).forEach((option) => {
          const button = arcadeButton(option.text, () => {
            if (answered) return;
            if (option.ok) {
              answered = true;
              box.querySelectorAll("button").forEach((b) => { b.disabled = true; });
              button.classList.add("is-selected");
              const successText = caseIndex === cases.length - 1
                ? "¡Felicitaciones! Completaste los 3 casos de SQL. " + option.explanation
                : option.explanation;
              const feedback = arcadeMessage(successText);
              feedback.classList.add("is-success");
              setArcadeStage(heading, question, box, feedback);
              setArcadeActions(
                ...(caseIndex === cases.length - 1
                  ? [arcadeButton("¡TERMINAR Y VOLVER A JUGAR", replay)]
                  : [arcadeButton("SIGUIENTE CASO", () => { caseIndex++; renderCase(); })])
              );
            } else {
              const feedback = arcadeMessage(option.explanation + " Elegí otra opción para resolver el caso.");
              feedback.classList.add("is-error");
              setArcadeStage(heading, question, box, feedback);
              button.disabled = true;
            }
          });
          box.append(button);
        });
        setArcadeStage(heading, question, box);
        setArcadeActions(arcadeButton("REINICIAR CASOS", replay));
      };
      renderCase();
      return;
    }

    if (game === "invaders") {
      arcadeTitle.textContent = "Pixel Invaders";
      arcadeInstructions.textContent = "Mové tu nave con ← → o A/D y dispará con espacio. En móvil, usá los controles de abajo.";
      const canvas = document.createElement("canvas");
      canvas.width = 480; canvas.height = 260;
      canvas.className = "arcade-game-canvas";
      const ctx = canvas.getContext("2d");
      const controls = document.createElement("div");
      controls.className = "arcade-touch-controls arcade-invaders-controls";
      let player = { x: 232, y: 226 }, bullets = [], enemies = [], score = 0, over = false, lastSpawn = 0, keys = {};
      const touchHeld = { left: false, right: false, fire: false };
      const makeHoldButton = (label, actionName, extra = "") => {
        const btn = arcadeButton(label, () => {}, extra);
        btn.classList.add("arcade-hold-control");
        btn.setAttribute("aria-label", actionName === "fire" ? "Mantener para disparar" : actionName === "left" ? "Mantener para mover a la izquierda" : "Mantener para mover a la derecha");
        const start = (event) => {
          event.preventDefault();
          touchHeld[actionName] = true;
          btn.classList.add("is-pressed");
          if (event.pointerId !== undefined && btn.setPointerCapture) {
            try { btn.setPointerCapture(event.pointerId); } catch (_) {}
          }
          if (actionName === "fire") shoot();
        };
        const stop = (event) => {
          if (event) event.preventDefault();
          touchHeld[actionName] = false;
          btn.classList.remove("is-pressed");
        };
        btn.addEventListener("pointerdown", start);
        ["pointerup", "pointercancel", "lostpointercapture"].forEach(type => btn.addEventListener(type, stop));
        btn.addEventListener("contextmenu", event => event.preventDefault());
        return btn;
      };
      const left = makeHoldButton("◀", "left", "arcade-move-control");
      const right = makeHoldButton("▶", "right", "arcade-move-control");
      const fire = makeHoldButton("✦ DISPARAR", "fire", "arcade-fire-control");
      const moveGroup = document.createElement("div");
      moveGroup.className = "arcade-invaders-movement";
      moveGroup.append(left, right);
      controls.append(moveGroup, fire);
      function spawn() { enemies.push({ x: 18 + Math.random() * 430, y: -12, speed: 0.55 + Math.random() * 0.65 }); }
      function shoot() { if (!over) bullets.push({ x: player.x + 7, y: player.y - 7 }); }
      for (let i = 0; i < 5; i++) enemies.push({ x: 35 + i * 88, y: 28 + (i % 2) * 24, speed: .35 + i * .06 });
      const keydown = (e) => {
        if (["ArrowLeft","ArrowRight"," ","a","A","d","D"].includes(e.key)) e.preventDefault();
        keys[e.key.toLowerCase()] = true;
        if (e.key === " ") shoot();
      };
      const keyup = (e) => { keys[e.key.toLowerCase()] = false; };
      window.addEventListener("keydown", keydown);
      window.addEventListener("keyup", keyup);
      let previous = performance.now();
      let lastTouchShot = 0;
      function draw(now) {
        if (over || !arcadeDialog.open) return;
        const dt = Math.min(34, now - previous); previous = now;
        if (keys.arrowleft || keys.a || touchHeld.left) player.x -= .22 * dt;
        if (keys.arrowright || keys.d || touchHeld.right) player.x += .22 * dt;
        player.x = Math.max(5, Math.min(462, player.x));
        if (touchHeld.fire && now - lastTouchShot > 230) { shoot(); lastTouchShot = now; }
        if (now - lastSpawn > 1700) { spawn(); lastSpawn = now; }
        bullets.forEach(b => b.y -= .42 * dt);
        enemies.forEach(e => e.y += e.speed * dt * .045);
        bullets = bullets.filter(b => b.y > -5);
        enemies = enemies.filter(e => {
          const hit = bullets.some(b => Math.abs(b.x - e.x) < 17 && Math.abs(b.y - e.y) < 15);
          if (hit) { bullets = bullets.filter(b => !(Math.abs(b.x-e.x)<17 && Math.abs(b.y-e.y)<15)); score += 10; }
          if (e.y > 246) over = true;
          return !hit;
        });
        ctx.fillStyle = "#050505"; ctx.fillRect(0,0,480,260);
        ctx.fillStyle = "rgba(215,100,109,.12)";
        for (let x=0;x<480;x+=20) for (let y=0;y<260;y+=20) ctx.fillRect(x,y,1,1);
        ctx.fillStyle = "#f08b94";
        enemies.forEach(e => { ctx.fillRect(e.x-9,e.y-5,18,10); ctx.fillRect(e.x-5,e.y-9,4,4); ctx.fillRect(e.x+3,e.y-9,4,4); });
        ctx.fillStyle = "#f8dadd"; bullets.forEach(b => ctx.fillRect(b.x,b.y,3,8));
        ctx.fillStyle = "#d7646d"; ctx.fillRect(player.x-10,player.y,22,10); ctx.fillRect(player.x-4,player.y-8,10,9);
        ctx.fillStyle = "#f7f1f2"; ctx.font = "12px monospace"; ctx.fillText(`SCORE ${score}`,10,16);
        if (over) {
          ctx.fillStyle = "rgba(0,0,0,.78)"; ctx.fillRect(0,0,480,260);
          ctx.fillStyle = "#f08b94"; ctx.font = "bold 22px monospace"; ctx.fillText("GAME OVER",160,122);
          ctx.font = "14px monospace"; ctx.fillText(`SCORE ${score}`,195,148);
          setArcadeActions(arcadeButton("VOLVER A JUGAR", replay));
          return;
        }
        arcadeAnimationFrame = requestAnimationFrame(draw);
      }
      setArcadeStage(canvas, controls, arcadeScore("DERRIBÁ LOS PÍXELES · +10 PUNTOS"));
      setArcadeActions(arcadeButton("REINICIAR PARTIDA", replay));
      arcadeAnimationFrame = requestAnimationFrame(draw);
      arcadeCleanup = () => { over = true; window.removeEventListener("keydown", keydown); window.removeEventListener("keyup", keyup); };
      return;
    }

    // Pixel Snake
    arcadeTitle.textContent = "Pixel Snake";
    arcadeInstructions.textContent = "Comé el píxel rojo y evitá las paredes y tu propia cola. Usá las flechas o los botones.";
    const canvas = document.createElement("canvas");
    canvas.width = 320; canvas.height = 240;
    canvas.className = "arcade-game-canvas";
    const ctx = canvas.getContext("2d");
    let snake = [{x:8,y:6},{x:7,y:6},{x:6,y:6}], dir = {x:1,y:0}, nextDir = {x:1,y:0};
    let food = {x:13,y:6}, score = 0, over = false, last = 0, accumulator = 0;
    const controls = document.createElement("div");
    controls.className = "arcade-touch-controls arcade-snake-controls";
    const dpad = document.createElement("div");
    dpad.className = "arcade-snake-dpad";
    const dirs = [
      ["↑",0,-1,"up"],["←",-1,0,"left"],["↓",0,1,"down"],["→",1,0,"right"]
    ];
    dirs.forEach(([label,dx,dy,name]) => {
      const btn = arcadeButton(label, () => {
        if (!(dx === -dir.x && dy === -dir.y)) nextDir = {x:dx,y:dy};
      }, "arcade-snake-direction");
      btn.setAttribute("aria-label", `Mover ${name === "up" ? "arriba" : name === "down" ? "abajo" : name === "left" ? "a la izquierda" : "a la derecha"}`);
      dpad.append(btn);
    });
    controls.append(dpad);
    let swipeStart = null;
    const swipeDirection = (dx, dy) => {
      if (Math.abs(dx) > Math.abs(dy)) {
        const x = dx > 0 ? 1 : -1;
        if (!(x === -dir.x && 0 === -dir.y)) nextDir = {x, y:0};
      } else {
        const y = dy > 0 ? 1 : -1;
        if (!(0 === -dir.x && y === -dir.y)) nextDir = {x:0, y};
      }
    };
    canvas.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse") return;
      swipeStart = {x:event.clientX, y:event.clientY};
      event.preventDefault();
    }, {passive:false});
    canvas.addEventListener("pointerup", (event) => {
      if (!swipeStart) return;
      const dx = event.clientX - swipeStart.x, dy = event.clientY - swipeStart.y;
      if (Math.abs(dx) + Math.abs(dy) > 18) swipeDirection(dx, dy);
      swipeStart = null;
      event.preventDefault();
    }, {passive:false});
    canvas.addEventListener("pointercancel", () => { swipeStart = null; });
    function placeFood() {
      do { food = {x:Math.floor(Math.random()*20), y:Math.floor(Math.random()*15)}; }
      while (snake.some(part => part.x===food.x && part.y===food.y));
    }
    function endGame() {
      over = true;
      setArcadeStage(canvas, arcadeScore(`PUNTUACIÓN: ${score}`), arcadeMessage("¡Partida terminada! Volvé a intentarlo para superar tu marca."));
      setArcadeActions(arcadeButton("JUGAR OTRA VEZ", replay));
    }
    function keydown(e) {
      const map = {ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],w:[0,-1],s:[0,1],a:[-1,0],d:[1,0]};
      const move = map[e.key] || map[e.key.toLowerCase()];
      if (move) {
        e.preventDefault();
        if (!(move[0] === -dir.x && move[1] === -dir.y)) nextDir = {x:move[0],y:move[1]};
      }
    }
    window.addEventListener("keydown", keydown);
    function draw(now) {
      if (over || !arcadeDialog.open) return;
      if (!last) last = now;
      accumulator += Math.min(100, now-last); last = now;
      if (accumulator > 115) {
        accumulator = 0; dir = nextDir;
        const head = {x:snake[0].x+dir.x, y:snake[0].y+dir.y};
        if (head.x<0 || head.x>=20 || head.y<0 || head.y>=15 || snake.some(p=>p.x===head.x&&p.y===head.y)) { endGame(); return; }
        snake.unshift(head);
        if (head.x===food.x && head.y===food.y) { score+=10; placeFood(); } else snake.pop();
      }
      ctx.fillStyle="#050505";ctx.fillRect(0,0,320,240);
      ctx.fillStyle="rgba(215,100,109,.12)";
      for(let x=0;x<320;x+=16)for(let y=0;y<240;y+=16)ctx.fillRect(x,y,1,1);
      ctx.fillStyle="#d7646d";ctx.fillRect(food.x*16+2,food.y*16+2,12,12);
      snake.forEach((p,i)=>{ctx.fillStyle=i===0?"#ffe1e4":"#d7646d";ctx.fillRect(p.x*16+1,p.y*16+1,14,14);});
      ctx.fillStyle="#f7f1f2";ctx.font="12px monospace";ctx.fillText(`SCORE ${score}`,8,14);
      arcadeAnimationFrame=requestAnimationFrame(draw);
    }
    setArcadeStage(canvas, controls, arcadeScore("FLECHAS / WASD · +10 PUNTOS"));
    setArcadeActions(arcadeButton("REINICIAR PARTIDA", replay));
    arcadeAnimationFrame=requestAnimationFrame(draw);
    arcadeCleanup = () => { over=true; window.removeEventListener("keydown",keydown); };
  }

  if (arcadeDialog) {
    document.querySelectorAll("[data-game]").forEach((button) => {
      button.addEventListener("click", () => {
        if (typeof arcadeDialog.showModal === "function") arcadeDialog.showModal();
        else arcadeDialog.setAttribute("open", "");
        document.body.classList.add("dialog-open");
        startArcadeGame(button.dataset.game, button.dataset.language);
      });
    });
    const closeArcade = () => {
      clearArcadeRun();
      if (typeof arcadeDialog.close === "function" && arcadeDialog.open) arcadeDialog.close();
      else arcadeDialog.removeAttribute("open");
      document.body.classList.remove("dialog-open");
    };
    arcadeDialog.querySelectorAll("[data-close-arcade]").forEach((button) => button.addEventListener("click", closeArcade));
    arcadeDialog.addEventListener("click", (event) => {
      if (event.target === arcadeDialog) closeArcade();
    });
    arcadeDialog.addEventListener("close", () => {
      clearArcadeRun();
      document.body.classList.remove("dialog-open");
    });
    arcadeDialog.addEventListener("cancel", () => {
      clearArcadeRun();
      document.body.classList.remove("dialog-open");
    });
  }

  // Año automático del pie de página.
  const year = document.querySelector("#current-year");
  if (year) year.textContent = String(new Date().getFullYear());
})();

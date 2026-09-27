/* =========================================================
   BIOVOXIS · Página de referência da Home
   Interações + animações de scroll (KV Parte 4, A1–A8)
   O HTML/CSS já traz o ESTADO FINAL de cada gráfico.
   Sem GSAP ou com prefers-reduced-motion, a página fica estática e completa.
   ========================================================= */
(function () {
  'use strict';

  document.documentElement.classList.add('js');
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fmt = new Intl.NumberFormat('pt-BR');

  /* ---------- Header: fundo ao rolar ---------- */
  var topo = document.getElementById('topo');
  function onScroll() { topo.classList.toggle('rolou', window.scrollY > 24); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Menu mobile ---------- */
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('nav');
  toggle.addEventListener('click', function () {
    var aberto = nav.classList.toggle('aberto');
    toggle.setAttribute('aria-expanded', aberto);
    toggle.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
    toggle.querySelector('use').setAttribute('href', aberto ? '#i-close' : '#i-menu');
  });
  nav.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      nav.classList.remove('aberto');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.querySelector('use').setAttribute('href', '#i-menu');
    });
  });

  /* ---------- Revelar ao rolar ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduz) {
    var ioR = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visto'); ioR.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    reveals.forEach(function (el) { ioR.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('visto'); });
  }

  /* ---------- A1 · Contadores (disparam 1 vez) ---------- */
  function contar(el, delay) {
    var alvo = parseInt(el.getAttribute('data-count'), 10);
    var ini = null, dur = 1200;
    setTimeout(function () {
      function passo(t) {
        if (!ini) ini = t;
        var p = Math.min((t - ini) / dur, 1);
        var e = 1 - Math.pow(1 - p, 3); // power2/3.out
        el.textContent = fmt.format(Math.round(alvo * e));
        if (p < 1) requestAnimationFrame(passo);
      }
      requestAnimationFrame(passo);
    }, delay || 0);
  }
  var contadores = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && !reduz) {
    var ioC = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var grupo = e.target.closest('.stats-in, .secoes');
        var irmaos = grupo ? Array.prototype.slice.call(grupo.querySelectorAll('[data-count]')) : [e.target];
        contar(e.target, irmaos.indexOf(e.target) * 80);
        ioC.unobserve(e.target);
      });
    }, { threshold: .6 });
    contadores.forEach(function (el) { el.textContent = '0'; ioC.observe(el); });
  }

  /* ---------- Planos: abas (seção 16) ---------- */
  // Fonte única dos valores — mesma estrutura deve alimentar a página /planos.
  var PLANOS = {
    anual:     { preco: 'R$ 198,95', apoio: 'valor mensal equivalente · 12 meses de acesso', cob: 'Cobrança única de <b>R$ 2.387,40</b>, uma vez por ano.', selo: 'economia de 60% no valor mensal' },
    semestral: { preco: 'R$ 329,13', apoio: 'valor mensal equivalente · 6 meses de acesso',  cob: 'Cobrança única de <b>R$ 1.974,80</b>, a cada 6 meses.', selo: 'economia de 34% no valor mensal' },
    mensal:    { preco: 'R$ 497,00', apoio: 'o valor mensal é a própria cobrança',            cob: 'Cobrados <b>todo mês</b>, por assinatura recorrente.', selo: null }
  };
  var abas = Array.prototype.slice.call(document.querySelectorAll('.abas [role="tab"]'));
  var painel = document.getElementById('planoPainel');
  var pPreco = document.getElementById('pPreco'), pApoio = document.getElementById('pApoio'),
      pCob = document.getElementById('pCob'), pSelo = document.getElementById('pSelo');

  function selecionar(aba, foco) {
    var d = PLANOS[aba.dataset.periodo];
    abas.forEach(function (a) {
      var ativa = a === aba;
      a.setAttribute('aria-selected', ativa);
      a.tabIndex = ativa ? 0 : -1;
    });
    painel.setAttribute('aria-labelledby', aba.id);
    pPreco.classList.add('fade-troca');
    setTimeout(function () {
      pPreco.textContent = d.preco;
      pApoio.textContent = d.apoio;
      pCob.innerHTML = d.cob;
      if (d.selo) { pSelo.textContent = d.selo; pSelo.hidden = false; } else { pSelo.hidden = true; }
      pPreco.classList.remove('fade-troca');
    }, reduz ? 0 : 150);
    if (foco) aba.focus();
  }
  abas.forEach(function (aba, i) {
    aba.addEventListener('click', function () { selecionar(aba); });
    aba.addEventListener('keydown', function (e) {
      var n = null;
      if (e.key === 'ArrowRight') n = (i + 1) % abas.length;
      if (e.key === 'ArrowLeft') n = (i - 1 + abas.length) % abas.length;
      if (e.key === 'Home') n = 0;
      if (e.key === 'End') n = abas.length - 1;
      if (n !== null) { e.preventDefault(); selecionar(abas[n], true); }
    });
  });

  /* ---------- Chips de nota: cor pela faixa ---------- */
  function corChip(el, v) {
    el.classList.remove('chip-low', 'chip-mid', 'chip-high');
    el.classList.add(v <= 3 ? 'chip-low' : v <= 6 ? 'chip-mid' : 'chip-high');
  }
  document.querySelectorAll('.comp-row').forEach(function (row) {
    corChip(row.querySelector('[data-chip]'), +row.dataset.to);
  });

  /* =========================================================
     ANIMAÇÕES DE SCROLL (GSAP + ScrollTrigger)
     ========================================================= */
  function iniciarGSAP() {
    if (reduz || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    var mm = gsap.matchMedia();

    // Janela padrão: entra a 80% da tela → termina a 40% (mobile: 85% → 55%)
    function janela(trigger, mobile) {
      return { trigger: trigger, start: mobile ? 'top 85%' : 'top 80%', end: mobile ? 'top 55%' : 'top 40%', scrub: 0.6 };
    }

    mm.add({ desk: '(min-width: 641px)', mob: '(max-width: 640px)' }, function (ctx) {
      var mob = ctx.conditions.mob;

      /* ---- Seção 03 · Arte do sistema + perguntas surgindo ---- */
      var perguntas = document.querySelector('.perguntas');
      gsap.timeline({ scrollTrigger: { trigger: '#desafioVis', start: mob ? 'top 80%' : 'top 70%', toggleActions: 'play none none reverse' },
        onComplete: function () { perguntas.classList.add('vivas'); },
        onReverseComplete: function () { perguntas.classList.remove('vivas'); } })
        .fromTo('#desafioVis .mock', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: .8, ease: 'power2.out' })
        .fromTo('.perguntas li', { opacity: 0, x: -28, scale: .88 },
          { opacity: 1, x: 0, scale: 1, duration: .5, ease: 'back.out(1.8)', stagger: .35 }, '-=.3');

      /* ---- A2 · Gráfico de linha Coleta 1 → 2 → 3 ---- */
      var path = document.getElementById('linhaPath');
      var clip = document.getElementById('clipRect');
      var pts = document.querySelectorAll('.linha-graf .pt');
      var rots = document.querySelectorAll('.linha-graf .rot');
      var fecho = document.getElementById('fechoTraj');
      var L = path.getTotalLength();
      gsap.set(path, { strokeDasharray: L });
      var tlLinha = gsap.timeline({ scrollTrigger: {
        trigger: '#compCard', start: mob ? 'top 80%' : 'top 70%', end: mob ? 'bottom 70%' : 'bottom 55%', scrub: 0.6
      }});
      tlLinha
        .fromTo(path, { strokeDashoffset: L }, { strokeDashoffset: 0, ease: 'none', duration: 1 }, 0)
        .fromTo(clip, { attr: { width: 0 } }, { attr: { width: 400 }, ease: 'none', duration: 1 }, 0);
      [0, 0.5, 0.98].forEach(function (pos, i) {
        tlLinha.fromTo(pts[i], { scale: 0 }, { scale: 1, duration: .08, ease: 'back.out(3)' }, pos)
               .fromTo(rots[i], { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .08 }, pos);
      });
      tlLinha.fromTo(fecho, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .1 }, .95);

      /* ---- A3 · Barras antes → depois ---- */
      document.querySelectorAll('.comp-row').forEach(function (row) {
        var de = +row.dataset.from, ate = +row.dataset.to;
        var bar = row.querySelector('.bar-atu');
        var chip = row.querySelector('[data-chip]');
        var val = row.querySelector('[data-val]');
        var obj = { v: de };
        gsap.timeline({ scrollTrigger: janela(row, mob) })
          .fromTo(bar, { scaleX: de / 9 }, { scaleX: ate / 9, ease: 'none' }, 0)
          .fromTo(obj, { v: de }, { v: ate, ease: 'none', onUpdate: function () {
            var r = Math.round(obj.v);
            chip.textContent = r; val.textContent = r; corChip(chip, r);
          }}, 0);
      });
      gsap.fromTo('#tagMargem', { opacity: 0, y: 6 }, { opacity: 1, y: 0, scrollTrigger: {
        trigger: '#tagMargem', start: mob ? 'top 70%' : 'top 55%', end: mob ? 'top 60%' : 'top 45%', scrub: 0.6 }});

      /* ---- A4 · Marcador na régua 1–9 ---- */
      var trilho = document.getElementById('reguaTrilho');
      var marc = document.getElementById('marcador');
      var mNum = document.getElementById('marcadorNum');
      var faixa = document.getElementById('faixaFisio');
      var eq = document.getElementById('reguaEq');
      var rotulos = document.querySelectorAll('.regua-rot span');
      // deslocamento relativo ao 5 (posição final do CSS)
      function offset(v) { return (v - 5) / 9 * trilho.clientWidth; }
      var st = { v: 1 };
      function pinta() {
        var r = Math.round(st.v);
        mNum.textContent = r;
        var f = r <= 3 ? 'low' : r <= 6 ? 'mid' : 'high';
        rotulos.forEach(function (s) { s.classList.toggle('on', s.dataset.faixa === f); });
        marc.querySelector('em').style.background = f === 'low' ? '#3E63D6' : f === 'mid' ? '#10306E' : '#A77A08';
      }
      gsap.timeline({ scrollTrigger: {
        trigger: '#regua-vis', start: mob ? 'top 85%' : 'top 80%', end: mob ? 'top 25%' : 'top 25%', scrub: 0.6,
        invalidateOnRefresh: true
      }})
        .fromTo(st, { v: 1 }, { v: 9, ease: 'none', duration: 1, onUpdate: pinta }, 0)
        .fromTo(marc, { x: function () { return offset(1); } }, { x: function () { return offset(9); }, ease: 'none', duration: 1 }, 0)
        .to(st, { v: 5, ease: 'power1.inOut', duration: .6, onUpdate: pinta }, 1)
        .to(marc, { x: 0, ease: 'power1.inOut', duration: .6 }, 1)
        .fromTo(faixa, { opacity: 0 }, { opacity: 1, duration: .25 }, 1.45)
        .fromTo(eq, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .25 }, 1.45);

      /* ---- A5 · Cards do relatório + parallax do notebook ---- */
      gsap.fromTo('.laptop.parallax', { y: 40 }, { y: -40, ease: 'none', scrollTrigger: {
        trigger: '.laptop-wrap', start: 'top bottom', end: 'bottom top', scrub: true }});
      document.querySelectorAll('.secao-card .mini-bar').forEach(function (b) {
        var p = parseFloat(getComputedStyle(b).getPropertyValue('--p')) || 0;
        gsap.fromTo(b, { scaleX: 0 }, { scaleX: p, ease: 'none', scrollTrigger: janela(b.parentNode, mob) });
      });

      /* ---- A6 · Linha do tempo ---- */
      var steps = document.querySelectorAll('.tl-step');
      var minis = document.querySelectorAll('.tl-mini i');
      gsap.fromTo('#tlFill', mob ? { scaleY: 0 } : { scaleX: 0 }, Object.assign(mob ? { scaleY: 1 } : { scaleX: 1 }, {
        ease: 'none',
        scrollTrigger: {
          trigger: '#timeline', start: mob ? 'top 70%' : 'top 75%', end: mob ? 'bottom 60%' : 'top 30%', scrub: 0.6,
          onUpdate: function (self) {
            steps.forEach(function (s, i) { s.classList.toggle('off', self.progress < i / (steps.length - 1) - 0.02); });
          }
        }
      }));
      steps.forEach(function (s) { s.classList.add('off'); });
      gsap.fromTo(minis, { scaleY: 0 }, { scaleY: function (i, el) { return parseFloat(el.style.getPropertyValue('--h')); },
        stagger: .15, ease: 'none', scrollTrigger: janela('.tl-mini', mob) });

      /* ---- A7 · Notebook se endireitando ---- */
      gsap.timeline({ scrollTrigger: {
        trigger: '.tilt-wrap', start: mob ? 'top 90%' : 'top 85%', end: mob ? 'top 45%' : 'top 30%', scrub: 0.6 }})
        .fromTo('#laptopTilt', { rotateY: -14, rotateX: 6, scale: .94 }, { rotateY: 0, rotateX: 0, scale: 1, ease: 'none' }, 0)
        .fromTo('#tiltSombra', { opacity: .35, scaleX: .8 }, { opacity: 1, scaleX: 1, ease: 'none' }, 0);

      /* ---- A8 · Parallax do hero (só desktop) ---- */
      if (!mob) {
        gsap.fromTo('.hero-img', { yPercent: 0 }, { yPercent: 6, ease: 'none', scrollTrigger: {
          trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }});
      }

      return function () { steps.forEach(function (s) { s.classList.remove('off'); }); perguntas.classList.remove('vivas'); };
    });
  }

  if (document.readyState === 'complete') iniciarGSAP();
  else window.addEventListener('load', iniciarGSAP);
})();

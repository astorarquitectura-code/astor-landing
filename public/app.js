(function () {
  var quieto = false;
  try { quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  var lp = document.getElementById('lp'), intro = document.getElementById('intro');
  var tIntro;
  function finIntro() { clearTimeout(tIntro); lp.classList.remove('intro-on'); intro.classList.add('fuera'); }
  if (quieto) finIntro(); else tIntro = setTimeout(finIntro, 8550);

  // Qué hace Astor: visor que pasa solo
  var sel = 1, timer;
  function pintarQv() {
    document.querySelectorAll('[data-qv]').forEach(function (el) {
      var on = +el.getAttribute('data-qv') === sel;
      el.classList.toggle('on', on);
      if (el.hasAttribute('data-go')) el.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }
  function arrancar() { clearInterval(timer); if (quieto) return; timer = setInterval(function () { sel = sel % 6 + 1; pintarQv(); }, 5000); }
  document.querySelectorAll('[data-go]').forEach(function (b) {
    b.addEventListener('click', function () { sel = +b.getAttribute('data-go'); pintarQv(); arrancar(); });
  });
  pintarQv(); arrancar();

  // Barra de la ganancia
  var montos = [7000000, 5000000, 3500000, 2500000], paso = 0, monto = 32000000, tErr, tCuenta;
  var elResto = document.getElementById('resto'), elTxt = document.getElementById('restoTxt');
  function pintarBarra() {
    document.querySelectorAll('[data-seg]').forEach(function (el) { el.classList.toggle('on', paso >= +el.getAttribute('data-seg')); });
    elResto.textContent = '$ ' + Math.round(monto).toLocaleString('es-AR');
    elTxt.textContent = paso >= 4 ? 'Al final te quedan' : (paso === 0 ? 'Ganancia que esperás' : 'Te quedan');
    elResto.style.color = paso >= 4 ? '#E0A493' : '#B9BE6E';
    var g = paso === 0 ? '' : (paso % 2 ? 'ga' : 'gb');
    document.querySelectorAll('[data-golpe]').forEach(function (el) { el.classList.remove('ga', 'gb'); if (g) el.classList.add(g); });
  }
  function secuencia(n) {
    if (n === 0) { paso = 0; monto = 32000000; pintarBarra(); tErr = setTimeout(function () { secuencia(1); }, 1600); return; }
    if (n > 4) { tErr = setTimeout(function () { secuencia(0); }, 6000); return; }
    var desde = monto, hasta = desde - montos[n - 1], t0 = Date.now() + 550, dur = 1300;
    paso = n; pintarBarra();
    clearInterval(tCuenta);
    tCuenta = setInterval(function () {
      var f = Math.max(0, Math.min(1, (Date.now() - t0) / dur)); f = 1 - Math.pow(1 - f, 3);
      monto = desde + (hasta - desde) * f; elResto.textContent = '$ ' + Math.round(monto).toLocaleString('es-AR');
      if (f >= 1) clearInterval(tCuenta);
    }, 30);
    tErr = setTimeout(function () { secuencia(n + 1); }, 2800);
  }
  if (quieto) { paso = 4; monto = 14000000; pintarBarra(); }
  else {
    var corrio = false, el = document.getElementById('plata');
    var correr = function () { if (corrio) return; corrio = true; secuencia(0); };
    if (el && window.IntersectionObserver) {
      new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) correr(); }); }, { threshold: 0.35 }).observe(el);
    } else correr();
  }

  // Formulario: manda los datos por mail (FormSubmit) y ofrece la agenda
  var AGENDA = '';
  var f = document.querySelector('form');
  if (f) {
    var btn = f.querySelector('button[type="submit"]'), msg = f.querySelector('.form-msg');
    var trampa = document.createElement('input');
    trampa.type = 'text'; trampa.name = '_honey'; trampa.tabIndex = -1; trampa.autocomplete = 'off';
    trampa.setAttribute('aria-hidden', 'true'); trampa.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;opacity:0';
    f.appendChild(trampa);
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!f.reportValidity()) return;
      var d = new FormData(f), texto = btn.textContent;
      btn.disabled = true; btn.textContent = 'Enviando…'; msg.textContent = '';
      fetch('https://formsubmit.co/ajax/astorarquitectura@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          Nombre: d.get('nombre') || '',
          'Estudio o constructora': d.get('empresa') || '',
          Mail: d.get('mail') || '',
          _replyto: d.get('mail') || '',
          _subject: 'Nueva consulta desde la landing de Astor',
          _template: 'table',
          _honey: d.get('_honey') || ''
        })
      }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function () {
          f.reset();
          msg.style.color = '#3F4024';
          msg.textContent = '¡Gracias! Recibimos tus datos y te escribimos para coordinar la llamada.';
          if (AGENDA) {
            var a = document.createElement('a');
            a.href = AGENDA; a.target = '_blank'; a.rel = 'noopener';
            a.textContent = 'Elegí día y hora ahora';
            a.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;min-height:44px;margin-top:10px;padding:10px 20px;border-radius:999px;border:1.5px solid #595A34;color:#3F4024;font-weight:600;text-decoration:none';
            msg.appendChild(document.createElement('br')); msg.appendChild(a);
          }
        })
        .catch(function () {
          msg.style.color = '#9C4A3A';
          msg.textContent = 'No se pudo enviar. Probá de nuevo o escribinos a astorarquitectura@gmail.com.';
        })
        .then(function () { btn.disabled = false; btn.textContent = texto; });
    });
  }
})();
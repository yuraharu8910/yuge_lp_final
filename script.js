(function () {

  /* ══════════════════════════
     Floating CTA
  ══════════════════════════ */
  var fvCta = document.getElementById('fv-cta');
  var floatingCta = document.getElementById('floating-cta');
  if (fvCta && floatingCta && window.IntersectionObserver) {
    var ctaObs = new IntersectionObserver(function (entries) {
      floatingCta.style.display = entries[0].isIntersecting ? 'none' : 'block';
    }, { threshold: 0 });
    ctaObs.observe(fvCta);
  }

  /* ══════════════════════════
     Q&A アコーディオン
  ══════════════════════════ */
  document.querySelectorAll('.qa-question').forEach(function (q) {
    q.addEventListener('click', function () {
      var item = q.closest('.qa-item');
      var isOpen = item.classList.contains('open');

      // すべて閉じる
      document.querySelectorAll('.qa-item').forEach(function (i) {
        i.classList.remove('open');
        var ans = i.querySelector('.qa-answer');
        if (ans) ans.style.maxHeight = '0px';
        var tog = i.querySelector('.qa-toggle');
        if (tog) tog.textContent = '+';
        var qBtn = i.querySelector('.qa-question');
        if (qBtn) qBtn.setAttribute('aria-expanded', 'false');
      });

      // クリックした項目が閉じていれば開く
      if (!isOpen) {
        item.classList.add('open');
        var ans = item.querySelector('.qa-answer');
        if (ans) ans.style.maxHeight = ans.scrollHeight + 'px';
        var tog = item.querySelector('.qa-toggle');
        if (tog) tog.textContent = '-';
        q.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ══════════════════════════
     スクロールフェードイン
  ══════════════════════════ */
  if (window.IntersectionObserver) {
    var fadeObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          fadeObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.fade-in').forEach(function (el) {
      fadeObs.observe(el);
    });
  } else {
    // IntersectionObserver 非対応ブラウザはすべて即表示
    document.querySelectorAll('.fade-in').forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* ══════════════════════════
     数字カウントアップ
     data-count 属性を持つ .stat-big 要素が対象
  ══════════════════════════ */
  function animateCount(el, target, isFloat) {
    var duration = 1200;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      // easeOutQuart
      var eased = 1 - Math.pow(1 - progress, 4);
      var current = eased * target;
      el.textContent = isFloat ? current.toFixed(1) : Math.round(current);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if (window.IntersectionObserver) {
    var countObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var el = e.target;
          var target = parseFloat(el.getAttribute('data-count'));
          var isFloat = el.getAttribute('data-count').indexOf('.') !== -1;
          animateCount(el, target, isFloat);
          countObs.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('.stat-big[data-count]').forEach(function (el) {
      countObs.observe(el);
    });
  }

})();

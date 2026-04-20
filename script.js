(function () {

  /* ══════════════════════════════════════════
     ★ GASのデプロイURLをここに1か所だけ書く
  ══════════════════════════════════════════ */
  var GAS_URL = 'https://script.google.com/macros/s/AKfycbxTPzEnrtfaI18inptq14M_TkdV7Accm53GiRFpl8Q0nO0DLi8imcQgT3JxiYDYsjVHPg/exec';

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

      document.querySelectorAll('.qa-item').forEach(function (i) {
        i.classList.remove('open');
        var ans = i.querySelector('.qa-answer');
        if (ans) ans.style.maxHeight = '0px';
        var tog = i.querySelector('.qa-toggle');
        if (tog) tog.textContent = '+';
        var qBtn = i.querySelector('.qa-question');
        if (qBtn) qBtn.setAttribute('aria-expanded', 'false');
      });

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
    document.querySelectorAll('.fade-in').forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* ══════════════════════════
     数字カウントアップ
  ══════════════════════════ */
  function animateCount(el, target, isFloat) {
    var duration = 1200;
    var startTime = null;
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
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

  /* ══════════════════════════════════════════════════
     バリデーション設定
     ※ 正規表現（RegExp）= 文字列のパターンを定義するルール
        ^ = 先頭、$ = 末尾、+ = 1文字以上、* = 0文字以上
  ══════════════════════════════════════════════════ */

  // メールアドレスの正規表現（RFC準拠の一般的なパターン）
  // 例：user@example.com → OK / user@com や user.com → NG
  var EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // 電話番号の正規表現
  // 数字・ハイフン・括弧・スペースを許容（例：090-1234-5678, 0312345678）
  var TEL_REGEX = /^[\d\-\(\)\s]+$/;

  /* ──────────────────────────────────────────
     エラー表示・クリアのヘルパー関数
     引数（ひきすう）= 関数に渡す値のこと
  ────────────────────────────────────────── */

  // 指定した入力欄の下にエラーメッセージを表示する
  // el = 対象の入力要素、msg = 表示するメッセージ
  function showFieldError(el, msg) {
    // すでにエラー表示があれば一旦消す
    clearFieldError(el);

    // エラーメッセージ用の <p> タグを作成
    var errEl = document.createElement('p');
    errEl.className = 'field-error'; // CSSで赤字にするクラス
    errEl.textContent = msg;

    // 入力欄の直後に挿入する
    el.parentNode.insertBefore(errEl, el.nextSibling);

    // 入力欄自体にもエラー状態のCSSクラスを付ける（赤枠など）
    el.classList.add('is-error');
  }

  // 指定した入力欄のエラー表示を消す
  function clearFieldError(el) {
    // 直後にあるエラー要素を探して削除
    var next = el.nextSibling;
    if (next && next.classList && next.classList.contains('field-error')) {
      next.parentNode.removeChild(next);
    }
    // エラー状態のCSSクラスも外す
    el.classList.remove('is-error');
    // OKの場合はOKクラスを付ける（緑枠など）
    el.classList.add('is-valid');
  }

  /* ──────────────────────────────────────────
     各フィールドのバリデーション関数
     戻り値：true = OK、false = NG
  ────────────────────────────────────────── */

  // お名前のチェック
  function validateName(el) {
    var val = el.value.trim(); // trim()=前後の空白を除去
    if (!val) {
      showFieldError(el, 'お名前を入力してください');
      return false;
    }
    if (val.length < 2) {
      showFieldError(el, '2文字以上で入力してください');
      return false;
    }
    clearFieldError(el);
    return true;
  }

  // メールアドレスのチェック（正規表現で厳密に）
  function validateEmail(el) {
    var val = el.value.trim();
    if (!val) {
      showFieldError(el, 'メールアドレスを入力してください');
      return false;
    }
    if (!EMAIL_REGEX.test(val)) {
      // .test() = 正規表現に当てはまるか調べるメソッド
      showFieldError(el, '正しいメールアドレスの形式で入力してください（例：name@example.com）');
      return false;
    }
    clearFieldError(el);
    return true;
  }

  // 電話番号のチェック（任意項目なので入力があるときだけチェック）
  function validateTel(el) {
    var val = el.value.trim();
    if (!val) {
      // 空欄はOK（任意項目）
      clearFieldError(el);
      el.classList.remove('is-valid'); // 空欄は緑枠にしない
      return true;
    }
    if (!TEL_REGEX.test(val)) {
      showFieldError(el, '電話番号は数字・ハイフンで入力してください（例：090-1234-5678）');
      return false;
    }
    if (val.replace(/\D/g, '').length < 10) {
      // \D = 数字以外の文字、replace で除去してから桁数チェック
      showFieldError(el, '電話番号が短すぎます（10桁以上）');
      return false;
    }
    clearFieldError(el);
    return true;
  }

  // プラン選択のチェック
  function validatePlan(el) {
    if (!el.value) {
      showFieldError(el, 'ご希望のプランを選択してください');
      return false;
    }
    clearFieldError(el);
    return true;
  }

  /* ──────────────────────────────────────────
     リアルタイムバリデーション
     blur（ブラー）= 入力欄からフォーカスが外れたとき
  ────────────────────────────────────────── */

  // 各フィールドを取得
  var fName    = document.getElementById('f-name');
  var fEmail   = document.getElementById('f-email');
  var fTel     = document.getElementById('f-tel');
  var fPlan    = document.getElementById('f-plan');
  var fMessage = document.getElementById('f-message');

  // フォーカスが外れたときにリアルタイムチェック
  if (fName)  fName.addEventListener('blur',  function () { validateName(fName); });
  if (fEmail) fEmail.addEventListener('blur', function () { validateEmail(fEmail); });
  if (fTel)   fTel.addEventListener('blur',   function () { validateTel(fTel); });
  if (fPlan)  fPlan.addEventListener('change', function () { validatePlan(fPlan); });
  // ↑ selectはblurでなくchangeイベント（選択が変わったとき）が自然

  // 入力中にエラーが出ていたら、打ち直したときに即解消する（inputイベント）
  if (fName)  fName.addEventListener('input',  function () { if (fName.classList.contains('is-error'))  validateName(fName); });
  if (fEmail) fEmail.addEventListener('input', function () { if (fEmail.classList.contains('is-error')) validateEmail(fEmail); });
  if (fTel)   fTel.addEventListener('input',   function () { if (fTel.classList.contains('is-error'))   validateTel(fTel); });

  /* ══════════════════════════════════════
     モーダル開閉
  ══════════════════════════════════════ */
  var overlay  = document.getElementById('modal-overlay');
  var closeBtn = document.getElementById('modal-close');

  function openModal() {
    if (!overlay) return;
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!overlay) return;
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    // モーダルを閉じるときにエラー表示・バリデーション状態もリセット
    resetForm();
    // サンクス画面をリセットしてフォームを再表示する
    var formEl = document.getElementById('reserve-form');
    var thanksEl = document.getElementById('modal-thanks');
    if (formEl) formEl.style.display = '';
    if (thanksEl) thanksEl.classList.remove('is-visible');
  }

  // 変更後：hrefの中身に関係なく、対象クラスのボタン全部にモーダルを紐づける
  document.querySelectorAll('.btn-primary, .floating-btn, .btn-plan, #floating-cta a').forEach(function (btn) {
    // LINE公式・SNS・tel・mailtoリンクは除外する
    var href = btn.getAttribute('href') || '';
    var isExternal = href.indexOf('lin.ee') !== -1      // LINEリンク
      || href.indexOf('tel:') !== -1         // 電話リンク
      || href.indexOf('mailto:') !== -1      // メールリンク
      || href.indexOf('facebook') !== -1     // SNS
      || href.indexOf('instagram') !== -1
      || href.indexOf('x.com') !== -1;

    // 外部リンク以外は全部モーダルに紐づける
    if (!isExternal) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        openModal();
      });
    }
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  if (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  /* ══════════════════════════════════════
     フォーム送信
  ══════════════════════════════════════ */
  var submitBtn = document.getElementById('form-submit-btn');
  var statusEl  = document.getElementById('form-status');

  if (submitBtn) {
    submitBtn.addEventListener('click', function () {

      // ── 全フィールドをまとめてチェック ──────────
      // それぞれの結果（true/false）をANDで繋ぐ
      // 全部trueのときだけ isValid = true になる
      var isValid = true;
      if (!validateName(fName))   isValid = false;
      if (!validateEmail(fEmail)) isValid = false;
      if (!validateTel(fTel))     isValid = false;
      if (!validatePlan(fPlan))   isValid = false;

      // ひとつでもNGがあれば送信しない
      if (!isValid) {
        // 最初のエラー欄までスクロール
        var firstErr = document.querySelector('.is-error');
        if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      // ── 入力値を取得して送信 ──────────────────
      var name    = fName.value.trim();
      var email   = fEmail.value.trim();
      var tel     = fTel.value.trim();
      var plan    = fPlan.value;
      var message = fMessage ? fMessage.value.trim() : '';

      submitBtn.disabled = true;
      showStatus('sending', '送信中...');

      // GASへPOSTリクエストを送る（no-cors = GASの仕様上必要なモード）
      fetch(GAS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, email: email, tel: tel, plan: plan, message: message })
      })
        .then(function () {
          // フォームを隠してサンクス画面を表示する
          var formEl = document.getElementById('reserve-form');
          var thanksEl = document.getElementById('modal-thanks');
          if (formEl) formEl.style.display = 'none';
          if (thanksEl) thanksEl.classList.add('is-visible');
          resetForm();
        })
        
      .catch(function () {
        showStatus('error', '⚠ 送信に失敗しました。お電話でもお気軽にどうぞ。');
        submitBtn.disabled = false;
      });
    });
  }

  /* ──────────────────────────────────────────
     ヘルパー関数
  ────────────────────────────────────────── */

  // ステータスメッセージを表示する
  function showStatus(type, text) {
    if (!statusEl) return;
    statusEl.className = type;
    statusEl.textContent = text;
    statusEl.style.display = 'block';
  }

  // フォームを完全にリセットする（値・エラー・バリデーション状態すべて）
  function resetForm() {
    ['f-name', 'f-email', 'f-tel', 'f-plan', 'f-message'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.value = '';
      el.classList.remove('is-error', 'is-valid'); // エラー・OK両方外す

      // エラーメッセージ要素が残っていれば削除
      var next = el.nextSibling;
      if (next && next.classList && next.classList.contains('field-error')) {
        next.parentNode.removeChild(next);
      }
    });

    // ステータスメッセージも非表示に
    if (statusEl) {
      statusEl.style.display = 'none';
      statusEl.className = '';
      statusEl.textContent = '';
    }
    if (submitBtn) submitBtn.disabled = false;
  }

  // サンクス画面の「閉じる」ボタン
  var thanksCloseBtn = document.getElementById('thanks-close-btn');
  if (thanksCloseBtn) thanksCloseBtn.addEventListener('click', closeModal);


})();

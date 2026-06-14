(function () {
  'use strict';

  const BRAND_YELLOW = '#e6cc17';
  const BRAND_BLACK  = '#0a0a0a';

  /* ── Inject styles ────────────────────────────────────── */
  const css = `
    #sb-chat-btn {
      position: fixed; bottom: 24px; right: 24px; z-index: 9999;
      width: 56px; height: 56px; border-radius: 50%;
      background: ${BRAND_YELLOW}; border: none; cursor: pointer;
      box-shadow: 0 4px 16px rgba(0,0,0,.35);
      display: flex; align-items: center; justify-content: center;
      transition: transform .2s, box-shadow .2s;
    }
    #sb-chat-btn:hover { transform: scale(1.08); box-shadow: 0 6px 22px rgba(0,0,0,.45); }
    #sb-chat-btn svg { width: 26px; height: 26px; fill: ${BRAND_BLACK}; transition: opacity .2s; }
    #sb-chat-btn .sb-icon-close { display: none; }

    #sb-chat-win {
      position: fixed; bottom: 92px; right: 24px; z-index: 9998;
      width: 360px; max-width: calc(100vw - 32px);
      background: #fff; border-radius: 16px;
      box-shadow: 0 8px 40px rgba(0,0,0,.22);
      display: flex; flex-direction: column;
      overflow: hidden; opacity: 0; pointer-events: none;
      transform: translateY(12px) scale(.97);
      transition: opacity .22s, transform .22s;
      max-height: calc(100vh - 120px);
    }
    #sb-chat-win.sb-open { opacity: 1; pointer-events: all; transform: translateY(0) scale(1); }

    .sb-header {
      background: ${BRAND_BLACK}; padding: 14px 18px;
      display: flex; align-items: center; gap: 12px;
      border-bottom: 3px solid ${BRAND_YELLOW};
    }
    .sb-avatar {
      width: 38px; height: 38px; border-radius: 50%;
      background: ${BRAND_YELLOW}; display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .sb-avatar svg { width: 20px; height: 20px; fill: ${BRAND_BLACK}; }
    .sb-header-text { flex: 1; }
    .sb-header-name { color: #fff; font-weight: 700; font-size: .9rem; line-height: 1.2; }
    .sb-header-status { color: ${BRAND_YELLOW}; font-size: .75rem; }

    #sb-messages {
      flex: 1; overflow-y: auto; padding: 16px;
      display: flex; flex-direction: column; gap: 10px;
      background: #f9f9f9;
      min-height: 240px; max-height: 380px;
    }
    .sb-msg { max-width: 82%; font-size: .87rem; line-height: 1.5; }
    .sb-msg-bot {
      align-self: flex-start;
      background: #fff; color: #1a1a1a;
      border-radius: 4px 14px 14px 14px;
      padding: 10px 13px;
      box-shadow: 0 1px 4px rgba(0,0,0,.08);
    }
    .sb-msg-user {
      align-self: flex-end;
      background: ${BRAND_BLACK}; color: #fff;
      border-radius: 14px 14px 4px 14px;
      padding: 10px 13px;
    }
    .sb-typing {
      align-self: flex-start;
      background: #fff; border-radius: 4px 14px 14px 14px;
      padding: 10px 14px; box-shadow: 0 1px 4px rgba(0,0,0,.08);
    }
    .sb-typing span {
      display: inline-block; width: 7px; height: 7px;
      border-radius: 50%; background: #aaa; margin: 0 2px;
      animation: sb-bounce .9s infinite ease-in-out;
    }
    .sb-typing span:nth-child(2) { animation-delay: .18s; }
    .sb-typing span:nth-child(3) { animation-delay: .36s; }
    @keyframes sb-bounce { 0%,80%,100% { transform: scale(.6); opacity:.5; } 40% { transform: scale(1); opacity:1; } }

    .sb-footer { padding: 10px 12px; background: #fff; border-top: 1px solid #eee; }
    .sb-input-row { display: flex; gap: 8px; align-items: center; }
    #sb-input {
      flex: 1; border: 1.5px solid #ddd; border-radius: 24px;
      padding: 9px 14px; font-size: .87rem; outline: none;
      transition: border-color .15s; font-family: inherit;
      resize: none; max-height: 90px; overflow-y: auto;
    }
    #sb-input:focus { border-color: ${BRAND_YELLOW}; }
    #sb-send {
      width: 38px; height: 38px; border-radius: 50%;
      background: ${BRAND_YELLOW}; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; transition: background .15s;
    }
    #sb-send:hover { background: #c9b100; }
    #sb-send svg { width: 16px; height: 16px; fill: ${BRAND_BLACK}; }
    #sb-send:disabled { opacity: .45; cursor: default; }
    .sb-powered { text-align: center; font-size: .7rem; color: #bbb; margin-top: 6px; }
    .sb-powered a { color: #bbb; text-decoration: none; }

    /* Pulsing ring to draw the eye to the button until first opened */
    #sb-chat-btn.sb-pulse { animation: sb-attn 2s ease-in-out infinite; }
    @keyframes sb-attn {
      0%, 100% { box-shadow: 0 4px 16px rgba(0,0,0,.35), 0 0 0 0 rgba(230,204,23,.55); }
      50%      { box-shadow: 0 4px 16px rgba(0,0,0,.35), 0 0 0 12px rgba(230,204,23,0); }
    }

    /* "Hi, I'm Boom" speech-bubble nudge above the button */
    #sb-nudge {
      position: fixed; bottom: 92px; right: 24px; z-index: 9997;
      max-width: 230px; background: #fff; color: #1a1a1a;
      border-radius: 14px; padding: 12px 32px 12px 14px;
      border-left: 4px solid ${BRAND_YELLOW};
      box-shadow: 0 6px 24px rgba(0,0,0,.22);
      font-size: .85rem; line-height: 1.45; cursor: pointer;
      opacity: 0; transform: translateY(8px) scale(.97);
      transition: opacity .28s ease, transform .28s ease;
      pointer-events: none;
    }
    #sb-nudge.sb-show { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }
    #sb-nudge strong { color: ${BRAND_BLACK}; }
    #sb-nudge::after {
      content: ''; position: absolute; bottom: -6px; right: 26px;
      width: 13px; height: 13px; background: #fff; transform: rotate(45deg);
    }
    #sb-nudge-close {
      position: absolute; top: 5px; right: 7px;
      background: none; border: none; cursor: pointer;
      font-size: 1.1rem; line-height: 1; color: #bbb; padding: 2px 4px;
    }
    #sb-nudge-close:hover { color: #555; }
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  /* ── Build HTML ───────────────────────────────────────── */
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <button id="sb-chat-btn" aria-label="Chat with Boom">
      <svg class="sb-icon-chat" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm-2 10H6v-2h12v2zm0-3H6V7h12v2z"/>
      </svg>
      <svg class="sb-icon-close" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
      </svg>
    </button>
    <div id="sb-nudge" role="button" tabindex="0" aria-label="Open chat with Boom">
      <button id="sb-nudge-close" aria-label="Dismiss">&times;</button>
      <span id="sb-nudge-text"></span>
    </div>
    <div id="sb-chat-win" role="dialog" aria-label="Chat with Scissor and Boom">
      <div class="sb-header">
        <div class="sb-avatar">
          <svg viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
        </div>
        <div class="sb-header-text">
          <div class="sb-header-name">Boom</div>
          <div class="sb-header-status">Your height access mate · ask me anything</div>
        </div>
      </div>
      <div id="sb-messages"></div>
      <div class="sb-footer">
        <div class="sb-input-row">
          <textarea id="sb-input" rows="1" placeholder="Type a message…" aria-label="Chat message"></textarea>
          <button id="sb-send" aria-label="Send message" disabled>
            <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>
        <p class="sb-powered">Powered by AI · <a href="/terms-and-conditions">T&amp;Cs</a></p>
      </div>
    </div>
  `;
  document.body.appendChild(wrap);

  /* ── State ────────────────────────────────────────────── */
  const btn        = document.getElementById('sb-chat-btn');
  const win        = document.getElementById('sb-chat-win');
  const msgs       = document.getElementById('sb-messages');
  const input      = document.getElementById('sb-input');
  const sendBtn    = document.getElementById('sb-send');
  const nudge      = document.getElementById('sb-nudge');
  const nudgeClose = document.getElementById('sb-nudge-close');
  const nudgeText  = document.getElementById('sb-nudge-text');
  let history    = [];

  // A few rotating openers so Boom feels fresh on repeat visits.
  const NUDGE_LINES = [
    "👋 Kia ora! I'm <strong>Boom</strong> — need a hand picking the right lift?",
    "🦾 Not sure how much height you need? Ask <strong>Boom</strong>.",
    "💬 Got a job on? <strong>Boom</strong> can find you the right machine.",
    "💲 After a quick price or availability check? Just ask <strong>Boom</strong>.",
    "🏗️ Indoor, outdoor, scissor or boom? <strong>Boom</strong> will point you the right way."
  ];
  nudgeText.innerHTML = NUDGE_LINES[Math.floor(Math.random() * NUDGE_LINES.length)];
  let isOpen     = false;
  let hasGreeted = false;

  /* ── Nudge (the "Hi, I'm Boom" prompt) ────────────────── */
  function nudgeDismissed() {
    try { return sessionStorage.getItem('sb-nudge-dismissed') === '1'; } catch (e) { return false; }
  }
  function dismissNudge(remember) {
    nudge.classList.remove('sb-show');
    if (remember) { try { sessionStorage.setItem('sb-nudge-dismissed', '1'); } catch (e) {} }
  }

  /* ── Toggle ───────────────────────────────────────────── */
  function toggleChat() {
    isOpen = !isOpen;
    win.classList.toggle('sb-open', isOpen);
    btn.querySelector('.sb-icon-chat').style.display  = isOpen ? 'none'  : '';
    btn.querySelector('.sb-icon-close').style.display = isOpen ? ''      : 'none';
    if (isOpen) {
      btn.classList.remove('sb-pulse');
      dismissNudge(true);
    }
    if (isOpen && !hasGreeted) {
      hasGreeted = true;
      addBotMsg("Kia ora! I'm <strong>Boom</strong> 🦾 your Scissor &amp; Boom mate. Ask me about gear, working heights, delivery, pricing or booking — I'll sort you out. What are you working on?");
    }
    if (isOpen) setTimeout(() => input.focus(), 220);
  }
  btn.addEventListener('click', toggleChat);

  // Draw attention until the visitor opens the chat at least once.
  btn.classList.add('sb-pulse');
  if (!nudgeDismissed()) {
    setTimeout(() => { if (!isOpen && !nudgeDismissed()) nudge.classList.add('sb-show'); }, 2800);
  }
  nudge.addEventListener('click', () => { dismissNudge(true); if (!isOpen) toggleChat(); });
  nudge.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); dismissNudge(true); if (!isOpen) toggleChat(); }
  });
  nudgeClose.addEventListener('click', e => { e.stopPropagation(); dismissNudge(true); });

  /* ── Messages ─────────────────────────────────────────── */
  function addBotMsg(html) {
    const el = document.createElement('div');
    el.className = 'sb-msg sb-msg-bot';
    el.innerHTML = html;
    msgs.appendChild(el);
    scrollBottom();
    return el;
  }

  function addUserMsg(text) {
    const el = document.createElement('div');
    el.className = 'sb-msg sb-msg-user';
    el.textContent = text;
    msgs.appendChild(el);
    scrollBottom();
  }

  function showTyping() {
    const el = document.createElement('div');
    el.className = 'sb-typing';
    el.id = 'sb-typing';
    el.innerHTML = '<span></span><span></span><span></span>';
    msgs.appendChild(el);
    scrollBottom();
    return el;
  }

  function removeTyping() {
    const el = document.getElementById('sb-typing');
    if (el) el.remove();
  }

  function scrollBottom() {
    msgs.scrollTop = msgs.scrollHeight;
  }

  /* ── Send ─────────────────────────────────────────────── */
  async function send() {
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    input.style.height = '';
    sendBtn.disabled = true;

    addUserMsg(text);
    history.push({ role: 'user', content: text });

    const typing = showTyping();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json();
      removeTyping();

      const reply = data.reply || data.error || 'Sorry, something went wrong. Please call us on 0800 250 081.';
      history.push({ role: 'assistant', content: reply });

      // Render markdown-lite: bold, line breaks, links
      const html = reply
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
      addBotMsg(html);
    } catch {
      removeTyping();
      addBotMsg('Sorry, something went wrong. Please call us on <a href="tel:08002500181" style="color:#c9b100;font-weight:700;">0800 250 081</a>.');
    }

    sendBtn.disabled = false;
    input.focus();
  }

  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });
  input.addEventListener('input', () => {
    sendBtn.disabled = !input.value.trim();
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 90) + 'px';
  });
})();

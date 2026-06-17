const GlobalStyles = ({ t }) => (
  <style>{`
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { font-size: 16px; scroll-behavior: smooth; }
    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background: ${t.bg};
      color: ${t.text};
      transition: background 0.2s, color 0.2s;
    }
    a { color: inherit; text-decoration: none; }
    button { font-family: inherit; cursor: pointer; border: none; background: none; }
    input, textarea, select { font-family: inherit; }
    ::placeholder { color: ${t.textMuted}; }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: ${t.bgSub}; }
    ::-webkit-scrollbar-thumb { background: ${t.border}; border-radius: 3px; }

    .page { min-height: 100vh; display: flex; flex-direction: column; }
    .container { width: 100%; max-width: 1100px; margin: 0 auto; padding: 0 24px; }
    .section { padding: 72px 0; }
    .section-sm { padding: 48px 0; }

    h1 { font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 700; line-height: 1.1; letter-spacing: -0.02em; }
    h2 { font-size: clamp(1.5rem, 3vw, 2.25rem); font-weight: 700; line-height: 1.2; letter-spacing: -0.01em; }
    h3 { font-size: 1.25rem; font-weight: 600; line-height: 1.3; }
    h4 { font-size: 1rem; font-weight: 600; }
    p { line-height: 1.7; }

    .field { margin-bottom: 20px; }
    .field label {
      display: block; font-size: 0.8rem; font-weight: 600;
      letter-spacing: 0.06em; text-transform: uppercase;
      color: ${t.textSub}; margin-bottom: 8px;
    }
    .field input, .field textarea, .field select {
      width: 100%; padding: 12px 44px 12px 14px; border: 1.5px solid ${t.border};
      border-radius: 6px; background: ${t.inputBg}; color: ${t.text};
      font-size: 0.95rem; transition: border-color 0.15s; box-sizing: border-box;
    }
    .field > div { position: relative; }
    .field input:focus, .field textarea:focus, .field select:focus {
      outline: none; border-color: ${t.text};
    }
    .field textarea { resize: vertical; min-height: 100px; }

    .checkbox-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
    }
    .checkbox-item {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 12px; border: 1.5px solid ${t.border}; border-radius: 8px;
      background: ${t.bgSub}; cursor: pointer; font-size: 0.85rem;
      color: ${t.textSub}; transition: border-color 0.15s, background 0.15s;
    }
    .checkbox-item:hover { border-color: ${t.text}; }
    .checkbox-item input[type="checkbox"] {
      width: 17px; height: 17px; accent-color: ${t.accent};
      cursor: pointer; flex-shrink: 0;
    }
    @media (max-width: 560px) {
      .checkbox-grid { grid-template-columns: 1fr; }
    }

    .btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      padding: 12px 24px; border-radius: 6px; font-size: 0.9rem; font-weight: 600;
      letter-spacing: 0.01em; transition: opacity 0.15s, transform 0.1s;
      border: none; cursor: pointer;
    }
    .btn:hover { opacity: 0.85; }
    .btn:active { transform: scale(0.98); }
    .btn-primary { background: ${t.accent}; color: ${t.accentText}; }
    .btn-outline {
      background: transparent; color: ${t.text}; border: 1.5px solid ${t.border};
    }
    .btn-outline:hover { border-color: ${t.text}; opacity: 1; background: ${t.bgSub}; }
    .btn-danger { background: ${t.danger}; color: #fff; }
    .btn-success { background: ${t.success}; color: #fff; }
    .btn-sm { padding: 8px 16px; font-size: 0.8rem; }
    .btn-lg { padding: 15px 32px; font-size: 1rem; }
    .btn-block { width: 100%; }

    .card {
      background: ${t.bgCard}; border: 1.5px solid ${t.border};
      border-radius: 10px; padding: 24px;
    }

    .divider { border: none; border-top: 1px solid ${t.border}; margin: 32px 0; }

    .badge {
      display: inline-block; padding: 4px 10px; border-radius: 4px;
      font-size: 0.75rem; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;
    }
    .badge-boys { background: #e8f0fe; color: #1a4ac7; }
    .badge-girls { background: #fce8f3; color: #c7164a; }
    .badge-pending { background: #fff3cd; color: #7a5800; }
    .badge-approved { background: #d4edda; color: #155724; }
    .badge-rejected { background: #f8d7da; color: #721c24; }

    .empty-state { text-align: center; padding: 80px 24px; }
    .empty-state h3 { margin-bottom: 12px; color: ${t.textSub}; }
    .empty-state p {
      color: ${t.textMuted}; max-width: 380px;
      margin: 0 auto; font-size: 0.9rem; line-height: 1.6;
    }

    @media (max-width: 768px) {
      .section { padding: 48px 0; }
      .container { padding: 0 16px; }
      .hide-mobile { display: none !important; }
    }

    ${
      t.bg === "#111111"
        ? `
      .badge-boys { background: #1a2a4a; color: #7aacff; }
      .badge-girls { background: #3a1a2a; color: #ff8abf; }
      .badge-pending { background: #3a2e00; color: #ffd966; }
      .badge-approved { background: #0a2a10; color: #66cc77; }
      .badge-rejected { background: #3a0a0a; color: #ff7777; }
    `
        : ""
    }
  `}</style>
);

export default GlobalStyles;

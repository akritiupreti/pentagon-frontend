// ─── CSS ──────────────────────────────────────────────────────────────────────
export const GSTYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500&family=Roboto:wght@400;500&display=swap');

  @property --spin-angle {
    syntax: '<angle>';
    inherits: false;
    initial-value: 0deg;
  }
  @keyframes spin-border { to { --spin-angle: 360deg; } }

  *, *::before, *::after { box-sizing: border-box; }
  body, html { margin: 0; padding: 0; overflow: hidden; }

  .g-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-family: 'Google Sans', 'Roboto', sans-serif;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.01em;
    padding: 0 18px;
    height: 36px;
    border-radius: 20px;
    border: none;
    cursor: pointer;
    position: relative;
    overflow: visible;
    transition: box-shadow 0.2s ease, background 0.15s ease;
    white-space: nowrap;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }
  .g-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: currentColor;
    opacity: 0;
    transition: opacity 0.15s ease;
    border-radius: inherit;
    pointer-events: none;
  }
  .g-btn:hover::after  { opacity: 0.08; }
  .g-btn:active::after { opacity: 0.16; }
  .g-btn:disabled { opacity: 0.38; cursor: not-allowed; pointer-events: none; }

  .g-btn-active-border::before {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: calc(20px + 3px);
    background: conic-gradient(from var(--spin-angle), #1a73e8, #7c3aed, #06b6d4, #0d9488, #1a73e8);
    animation: spin-border 3s linear infinite;
    z-index: -1;
    mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px));
    -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px));
    pointer-events: none;
  }

  .g-btn-filled       { background: #1a73e8; color: #fff; box-shadow: 0 1px 2px rgba(60,64,67,.3),0 1px 3px 1px rgba(60,64,67,.15); }
  .g-btn-filled:hover { box-shadow: 0 2px 6px rgba(26,115,232,.45); }
  .g-btn-outlined       { background: rgba(255,255,255,0.0); color: #1a73e8; border: 1px solid #dadce0; }
  .g-btn-outlined:hover { background: rgba(232,240,254,0.7); }
  .g-btn-purple       { background: #7c3aed; color: #fff; box-shadow: 0 1px 2px rgba(60,64,67,.3); }
  .g-btn-purple:hover { box-shadow: 0 2px 6px rgba(124,58,237,.45); }
  .g-btn-indigo       { background: #3730a3; color: #fff; box-shadow: 0 1px 2px rgba(60,64,67,.3); }
  .g-btn-indigo:hover { box-shadow: 0 2px 6px rgba(55,48,163,.45); }
  .g-btn-teal         { background: #0d9488; color: #fff; box-shadow: 0 1px 2px rgba(60,64,67,.3); }
  .g-btn-teal:hover   { box-shadow: 0 2px 6px rgba(13,148,136,.45); }
  .g-btn-yellow       { background: #f59e0b; color: #fff; box-shadow: 0 1px 2px rgba(60,64,67,.3); }
  .g-btn-yellow:hover { box-shadow: 0 2px 6px rgba(245,158,11,.45); }
  .g-btn-nav          { background: rgba(60,64,67,0.82); color: #fff; box-shadow: 0 1px 2px rgba(60,64,67,.3); backdrop-filter: blur(6px); }
  .g-btn-nav:hover    { box-shadow: 0 2px 6px rgba(60,64,67,.4); }

  .g-select {
    font-family: 'Google Sans', 'Roboto', sans-serif;
    font-size: 13px; font-weight: 500; color: #3c4043;
    background: transparent;
    border: 1px solid #dadce0; border-radius: 20px;
    padding: 0 32px 0 14px; height: 36px;
    cursor: pointer; appearance: none; -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24'%3E%3Cpath fill='%235f6368' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 8px center;
    transition: border-color .2s, box-shadow .2s; outline: none;
  }
  .g-select:hover { border-color: #1a73e8; }
  .g-select:focus { border-color: #1a73e8; box-shadow: 0 0 0 2px rgba(26,115,232,.2); }

  /* Zoom badge */
  .zoom-badge {
    font-family: 'Google Sans', 'Roboto', sans-serif;
    font-size: 12px; font-weight: 500; color: #5f6368;
    background: rgba(255,255,255,0.88);
    border: 1px solid #dadce0; border-radius: 20px;
    padding: 0 8px; height: 26px;
    display: inline-flex; align-items: center;
    white-space: nowrap;
    backdrop-filter: blur(8px);
  }
`;

// ── Cursor strings ──────────────────────────────────────────────────────────
export const CURSOR_PEN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Ccircle cx='4' cy='20' r='3' fill='%231a73e8'/%3E%3Cpath d='M20.71 4.04a1 1 0 0 0 0-1.41l-1.34-1.34a1 1 0 0 0-1.41 0L5 14.25V19h4.75L20.71 4.04z' fill='%231a73e8'/%3E%3C/svg%3E") 4 20, crosshair`;
export const CURSOR_ERASER = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Crect x='2' y='10' width='20' height='10' rx='2' fill='%23f59e0b' opacity='0.9'/%3E%3Cpath d='M8 10 L14 4 L20 10' fill='%23f59e0b'/%3E%3C/svg%3E") 2 20, cell`;
export const CURSOR_GRAB = "grab";
export const CURSOR_DEFAULT = "default";

export const categories = [
  { name: "Person", value: 1 },
  { name: "Road", value: 2 },
  { name: "Car", value: 3 },
  { name: "Footpath", value: 4 },
];

export const brushSizes = [3, 7, 13, 19, 29];

// ── Pill panel style ─────────────────────────────────────────────────────────
export const pillPanel: React.CSSProperties = {
  position: "absolute",
  left: "50%",
  transform: "translateX(-50%)",
  display: "flex",
  alignItems: "center",
  gap: 8,
  justifyContent: "center",
  background: "rgba(255,255,255,0.88)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  border: "1px solid rgba(218,220,224,0.75)",
  borderRadius: 28,
  padding: "10px 20px",
  boxShadow: "0 4px 18px rgba(60,64,67,.18), 0 1px 4px rgba(60,64,67,.12)",
  zIndex: 10,
  whiteSpace: "nowrap",
};

/**
 * Handcrafted Pixel & Vector Game Sprites (100% Non-AI Art)
 * Built with crisp geometric pixel-art vectors for high DPI & zero external asset dependencies.
 */

const SPRITES = {
  // Characters (Student, IT Professional, NPCs)
  characters: {
    student: `
      <svg viewBox="0 0 48 64" width="48" height="64" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
        <!-- Shadow -->
        <ellipse cx="24" cy="61" rx="14" ry="3" fill="#141923" opacity="0.6"/>
        <!-- Shoes -->
        <rect x="14" y="54" width="8" height="6" fill="#f1f5f9" rx="1"/>
        <rect x="26" y="54" width="8" height="6" fill="#f1f5f9" rx="1"/>
        <rect x="14" y="57" width="8" height="3" fill="#3b82f6"/>
        <rect x="26" y="57" width="8" height="3" fill="#3b82f6"/>
        <!-- Jeans -->
        <rect x="15" y="42" width="7" height="13" fill="#1e3a8a"/>
        <rect x="26" y="42" width="7" height="13" fill="#1e3a8a"/>
        <!-- Backpack Straps & Hoodie Torso -->
        <rect x="13" y="24" width="22" height="19" fill="#2563eb" rx="2"/>
        <rect x="11" y="26" width="3" height="14" fill="#9333ea"/>
        <rect x="34" y="26" width="3" height="14" fill="#9333ea"/>
        <rect x="22" y="24" width="4" height="12" fill="#1d4ed8"/>
        <!-- Backpack sides -->
        <rect x="8" y="28" width="4" height="12" fill="#7e22ce" rx="1"/>
        <!-- Hands -->
        <circle cx="11" cy="42" r="3" fill="#fbcfe8"/>
        <circle cx="37" cy="42" r="3" fill="#fbcfe8"/>
        <!-- Head & Face -->
        <rect x="16" y="10" width="16" height="15" fill="#fcd34d" rx="3"/>
        <rect x="19" y="16" width="3" height="3" fill="#0f172a"/>
        <rect x="26" y="16" width="3" height="3" fill="#0f172a"/>
        <rect x="22" y="21" width="4" height="1" fill="#ea580c"/>
        <!-- Hair -->
        <path d="M15 13 C15 7, 33 7, 33 13 C31 10, 27 10, 24 10 C21 10, 17 10, 15 13 Z" fill="#78350f"/>
        <rect x="15" y="8" width="18" height="5" fill="#78350f" rx="2"/>
      </svg>
    `,

    itProfessional: `
      <svg viewBox="0 0 48 64" width="48" height="64" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
        <!-- Shadow -->
        <ellipse cx="24" cy="61" rx="14" ry="3" fill="#141923" opacity="0.6"/>
        <!-- Dress Shoes -->
        <rect x="15" y="55" width="7" height="5" fill="#1e293b" rx="1"/>
        <rect x="26" y="55" width="7" height="5" fill="#1e293b" rx="1"/>
        <!-- Slacks -->
        <rect x="16" y="40" width="6" height="16" fill="#334155"/>
        <rect x="26" y="40" width="6" height="16" fill="#334155"/>
        <!-- Belt -->
        <rect x="14" y="38" width="20" height="3" fill="#0f172a"/>
        <rect x="22" y="38" width="4" height="3" fill="#fbbf24"/>
        <!-- Smart Shirt -->
        <rect x="14" y="22" width="20" height="17" fill="#f8fafc" rx="2"/>
        <line x1="24" y1="22" x2="24" y2="38" stroke="#cbd5e1" stroke-width="1.5"/>
        <!-- Tech Company Lanyard -->
        <path d="M19 22 L24 31 L29 22" fill="none" stroke="#06b6d4" stroke-width="1.5"/>
        <rect x="22" y="31" width="4" height="5" fill="#e2e8f0" stroke="#06b6d4" stroke-width="0.5"/>
        <!-- Laptop Bag / Briefcase -->
        <rect x="8" y="34" width="6" height="11" fill="#475569" rx="1"/>
        <rect x="9" y="32" width="4" height="2" fill="#94a3b8"/>
        <!-- Hands -->
        <circle cx="13" cy="38" r="3" fill="#fcd34d"/>
        <circle cx="35" cy="38" r="3" fill="#fcd34d"/>
        <!-- Head & Glasses -->
        <rect x="16" y="9" width="16" height="14" fill="#fcd34d" rx="3"/>
        <!-- Glasses -->
        <rect x="18" y="14" width="4" height="3" fill="none" stroke="#0f172a" stroke-width="1"/>
        <rect x="26" y="14" width="4" height="3" fill="none" stroke="#0f172a" stroke-width="1"/>
        <line x1="22" y1="15" x2="26" y2="15" stroke="#0f172a" stroke-width="1"/>
        <circle cx="20" cy="15.5" r="1" fill="#0284c7"/>
        <circle cx="28" cy="15.5" r="1" fill="#0284c7"/>
        <line x1="22" y1="20" x2="26" y2="20" stroke="#ea580c" stroke-width="1"/>
        <!-- Neat Haircut -->
        <rect x="15" y="7" width="18" height="6" fill="#1e1b4b" rx="2"/>
        <rect x="15" y="11" width="2" height="4" fill="#1e1b4b"/>
      </svg>
    `,

    npcTeller: `
      <svg viewBox="0 0 48 64" width="48" height="64" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="24" cy="60" rx="12" ry="3" fill="#000" opacity="0.3"/>
        <rect x="15" y="24" width="18" height="34" fill="#0284c7" rx="3"/>
        <polygon points="21,24 24,32 27,24" fill="#f8fafc"/>
        <polygon points="23,28 25,28 24.5,38 23.5,38" fill="#e11d48"/>
        <circle cx="24" cy="16" r="8" fill="#fed7aa"/>
        <path d="M16 14 C16 9, 32 9, 32 14" fill="#451a03"/>
        <circle cx="21" cy="16" r="1.5" fill="#0f172a"/>
        <circle cx="27" cy="16" r="1.5" fill="#0f172a"/>
        <path d="M22 20 Q24 22 26 20" stroke="#ea580c" stroke-width="1.2" fill="none"/>
      </svg>
    `,

    npcBrokerPanic: `
      <svg viewBox="0 0 48 64" width="48" height="64" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="24" cy="60" rx="12" ry="3" fill="#ef4444" opacity="0.4"/>
        <rect x="15" y="24" width="18" height="34" fill="#fbbf24" rx="3"/>
        <!-- Disheveled tie -->
        <polygon points="22,25 25,36 21,38" fill="#ef4444"/>
        <circle cx="24" cy="16" r="8" fill="#fed7aa"/>
        <path d="M15 15 L24 8 L33 13" stroke="#78350f" stroke-width="3" fill="none"/>
        <!-- Shocked Eyes -->
        <circle cx="21" cy="15" r="2.5" fill="#fff"/>
        <circle cx="21" cy="15" r="1" fill="#000"/>
        <circle cx="27" cy="15" r="2.5" fill="#fff"/>
        <circle cx="27" cy="15" r="1" fill="#000"/>
        <!-- Open Gasp Mouth -->
        <ellipse cx="24" cy="21" rx="2" ry="3" fill="#991b1b"/>
      </svg>
    `
  },

  // City Buildings across the 15 Days
  buildings: {
    bank: `
      <svg viewBox="0 0 160 140" width="160" height="140" xmlns="http://www.w3.org/2000/svg">
        <!-- Roof Pediment -->
        <polygon points="80,10 150,45 10,45" fill="#f8fafc" stroke="#334155" stroke-width="3"/>
        <text x="80" y="38" font-family="'Press Start 2P', monospace" font-size="10" fill="#0284c7" text-anchor="middle" font-weight="bold">BANK</text>
        <!-- Entablature -->
        <rect x="14" y="45" width="132" height="10" fill="#cbd5e1" stroke="#334155" stroke-width="2"/>
        <!-- Columns -->
        <rect x="22" y="55" width="14" height="65" fill="#f1f5f9" stroke="#64748b" stroke-width="2"/>
        <rect x="52" y="55" width="14" height="65" fill="#f1f5f9" stroke="#64748b" stroke-width="2"/>
        <rect x="94" y="55" width="14" height="65" fill="#f1f5f9" stroke="#64748b" stroke-width="2"/>
        <rect x="124" y="55" width="14" height="65" fill="#f1f5f9" stroke="#64748b" stroke-width="2"/>
        <!-- Central Vault Door -->
        <rect x="68" y="70" width="24" height="50" fill="#0f172a" rx="2"/>
        <circle cx="80" cy="95" r="8" fill="#fbbf24" stroke="#d97706" stroke-width="2"/>
        <line x1="80" y1="87" x2="80" y2="103" stroke="#78350f" stroke-width="2"/>
        <line x1="72" y1="95" x2="88" y2="95" stroke="#78350f" stroke-width="2"/>
        <!-- Base Steps -->
        <rect x="6" y="120" width="148" height="14" fill="#94a3b8" stroke="#334155" stroke-width="2"/>
      </svg>
    `,

    exchange: `
      <svg viewBox="0 0 160 140" width="160" height="140" xmlns="http://www.w3.org/2000/svg">
        <!-- Stock Exchange Facade -->
        <rect x="12" y="20" width="136" height="105" fill="#1e293b" stroke="#38bdf8" stroke-width="3" rx="4"/>
        <!-- Electronic Ticker Screen -->
        <rect x="22" y="30" width="116" height="22" fill="#090d16" stroke="#0ea5e9" stroke-width="2" rx="2"/>
        <text x="80" y="46" font-family="'Courier New', monospace" font-size="12" fill="#22c55e" text-anchor="middle" font-weight="bold">NYSE▲ NASDAQ▼</text>
        <!-- Exchange Columns & Windows -->
        <rect x="24" y="60" width="22" height="40" fill="#334155" stroke="#475569" stroke-width="2"/>
        <rect x="54" y="60" width="22" height="40" fill="#334155" stroke="#475569" stroke-width="2"/>
        <rect x="84" y="60" width="22" height="40" fill="#334155" stroke="#475569" stroke-width="2"/>
        <rect x="114" y="60" width="22" height="40" fill="#334155" stroke="#475569" stroke-width="2"/>
        <!-- Crash Alert Beacon -->
        <polygon points="80,4 90,18 70,18" fill="#ef4444"/>
        <circle cx="80" cy="18" r="4" fill="#f87171"/>
        <!-- Base -->
        <rect x="6" y="123" width="148" height="12" fill="#0f172a" stroke="#1e293b" stroke-width="2"/>
      </svg>
    `,

    lab: `
      <svg viewBox="0 0 160 140" width="160" height="140" xmlns="http://www.w3.org/2000/svg">
        <!-- Futuristic Urn Research Lab -->
        <path d="M20,125 L35,35 L125,35 L140,125 Z" fill="#0f172a" stroke="#a855f7" stroke-width="3"/>
        <rect x="40" y="48" width="80" height="20" fill="#581c87" rx="3"/>
        <text x="80" y="62" font-family="'Press Start 2P', monospace" font-size="8" fill="#e9d5ff" text-anchor="middle">ELLSBERG LAB</text>
        <!-- Dual Glowing Observation Tubes (Urns inside) -->
        <rect x="45" y="76" width="28" height="42" fill="#1e1b4b" stroke="#ef4444" stroke-width="2" rx="4"/>
        <circle cx="59" cy="97" r="8" fill="#ef4444" opacity="0.8"/>
        <text x="59" y="100" font-size="8" fill="#fff" text-anchor="middle">U1</text>
        
        <rect x="87" y="76" width="28" height="42" fill="#1e1b4b" stroke="#3b82f6" stroke-width="2" rx="4"/>
        <circle cx="101" cy="97" r="8" fill="#64748b" opacity="0.8"/>
        <text x="101" y="100" font-size="8" fill="#fff" text-anchor="middle">?</text>
        <!-- Ground Base -->
        <rect x="10" y="125" width="140" height="10" fill="#3b0764"/>
      </svg>
    `,

    tech: `
      <svg viewBox="0 0 160 140" width="160" height="140" xmlns="http://www.w3.org/2000/svg">
        <!-- Tech Hub Glass Skyscraper -->
        <rect x="25" y="15" width="110" height="110" fill="#0f172a" stroke="#06b6d4" stroke-width="3" rx="4"/>
        <!-- Modern Grid Glass Windows -->
        <g fill="#0284c7" opacity="0.4">
          <rect x="35" y="25" width="20" height="18" rx="2"/>
          <rect x="60" y="25" width="20" height="18" rx="2"/>
          <rect x="85" y="25" width="20" height="18" rx="2"/>
          <rect x="110" y="25" width="15" height="18" rx="2"/>

          <rect x="35" y="50" width="20" height="18" rx="2"/>
          <rect x="60" y="50" width="20" height="18" rx="2"/>
          <rect x="85" y="50" width="20" height="18" rx="2"/>
          <rect x="110" y="50" width="15" height="18" rx="2"/>

          <rect x="35" y="75" width="20" height="18" rx="2"/>
          <rect x="60" y="75" width="20" height="18" rx="2"/>
          <rect x="85" y="75" width="20" height="18" rx="2"/>
          <rect x="110" y="75" width="15" height="18" rx="2"/>
        </g>
        <!-- Glass Sliding Doors -->
        <rect x="65" y="100" width="30" height="25" fill="#38bdf8" opacity="0.6"/>
        <line x1="80" y1="100" x2="80" y2="125" stroke="#082f49" stroke-width="2"/>
        <text x="80" y="12" font-family="'Press Start 2P', monospace" font-size="8" fill="#38bdf8" text-anchor="middle">INCUBATOR</text>
      </svg>
    `,

    defaultCity: `
      <svg viewBox="0 0 160 140" width="160" height="140" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="30" width="120" height="95" fill="#1e293b" stroke="#64748b" stroke-width="3" rx="4"/>
        <rect x="30" y="15" width="100" height="16" fill="#334155" stroke="#64748b" stroke-width="2" rx="2"/>
        <text x="80" y="27" font-family="'Press Start 2P', monospace" font-size="8" fill="#f8fafc" text-anchor="middle">DISTRICT HQ</text>
        <rect x="35" y="45" width="25" height="25" fill="#facc15" opacity="0.7" rx="2"/>
        <rect x="70" y="45" width="25" height="25" fill="#facc15" opacity="0.7" rx="2"/>
        <rect x="105" y="45" width="20" height="25" fill="#facc15" opacity="0.7" rx="2"/>
        <rect x="65" y="85" width="30" height="40" fill="#0f172a" stroke="#475569" stroke-width="2" rx="2"/>
        <circle cx="72" cy="105" r="2" fill="#fbbf24"/>
      </svg>
    `
  },

  // Interactive Props (Urns, Market Crash Monitor)
  props: {
    twoUrnsInteractive: (selectedColor = null) => `
      <div class="urns-container">
        <div class="urn-box ${selectedColor === 'red' ? 'selected' : ''}">
          <div class="urn-tag">Urn 1 (Stated 50/50)</div>
          <svg viewBox="0 0 100 120" width="100" height="120">
            <path d="M20,30 Q10,70 25,105 L75,105 Q90,70 80,30 Z" fill="#991b1b" stroke="#fca5a5" stroke-width="3"/>
            <ellipse cx="50" cy="30" rx="30" ry="10" fill="#7f1d1d" stroke="#fca5a5" stroke-width="3"/>
            <text x="50" y="70" fill="#fff" font-family="monospace" font-weight="bold" font-size="12" text-anchor="middle">50 RED</text>
            <text x="50" y="85" fill="#93c5fd" font-family="monospace" font-weight="bold" font-size="12" text-anchor="middle">50 BLUE</text>
          </svg>
        </div>
        <div class="urn-box ${selectedColor === 'blue' ? 'selected' : ''}">
          <div class="urn-tag">Urn 2 (Unstated 100 Mix)</div>
          <svg viewBox="0 0 100 120" width="100" height="120">
            <path d="M20,30 Q10,70 25,105 L75,105 Q90,70 80,30 Z" fill="#1e3a8a" stroke="#93c5fd" stroke-width="3"/>
            <ellipse cx="50" cy="30" rx="30" ry="10" fill="#172554" stroke="#93c5fd" stroke-width="3"/>
            <text x="50" y="72" fill="#fbbf24" font-family="monospace" font-weight="bold" font-size="28" text-anchor="middle">?</text>
            <text x="50" y="92" fill="#cbd5e1" font-family="monospace" font-size="10" text-anchor="middle">100 TOKENS</text>
          </svg>
        </div>
      </div>
    `,

    crashMonitor: `
      <div class="crash-monitor-box">
        <div class="crash-header">
          <span class="blinking-dot">●</span> LIVE INDEX MONITOR: -40.0% CRASH OVERNIGHT
        </div>
        <svg viewBox="0 0 300 90" width="100%" height="90">
          <polyline points="10,25 60,22 110,28 160,20 200,24 240,80 290,78" fill="none" stroke="#ef4444" stroke-width="3.5"/>
          <circle cx="240" cy="80" r="5" fill="#ef4444"/>
          <text x="245" y="75" fill="#fca5a5" font-size="12" font-family="monospace" font-weight="bold">-40%</text>
        </svg>
      </div>
    `
  }
};

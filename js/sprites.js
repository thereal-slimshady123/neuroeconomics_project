/**
 * Handcrafted Cozy SVG Scenes (100% vector, zero AI slop, zero fancy math)
 * Warm cartoon illustration style with thick outlines and warm palettes.
 * Uses preserveAspectRatio="xMidYMid slice" to guarantee 100% width coverage with no black voids.
 */

const SPRITES = {
  scenes: {

    // Opening — cozy evening room with warm desk lamp, notebook and coffee
    intro: `
      <svg viewBox="0 0 600 240" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <!-- Warm wallpaper backdrop extending full bleed -->
        <rect x="-100" y="-50" width="800" height="350" fill="#3b271d"/>
        <!-- Window looking out at warm night city -->
        <rect x="50" y="20" width="160" height="150" fill="#181a27" stroke="#23150e" stroke-width="4" rx="6"/>
        <line x1="130" y1="20" x2="130" y2="170" stroke="#23150e" stroke-width="3"/>
        <line x1="50" y1="95" x2="210" y2="95" stroke="#23150e" stroke-width="3"/>
        <!-- Cozy Crescent Moon & Stars -->
        <circle cx="85" cy="55" r="18" fill="#fef08a"/>
        <circle cx="93" cy="48" r="14" fill="#181a27"/>
        <circle cx="165" cy="45" r="2.5" fill="#fef08a" opacity="0.8"/>
        <circle cx="185" cy="70" r="2" fill="#fef08a" opacity="0.7"/>
        <circle cx="150" cy="80" r="1.5" fill="#fef08a" opacity="0.9"/>
        <!-- Distant glowing warm apartment windows -->
        <rect x="65" y="130" width="8" height="18" fill="#f59e0b" opacity="0.6"/>
        <rect x="85" y="120" width="10" height="26" fill="#f59e0b" opacity="0.7"/>
        <rect x="155" y="125" width="12" height="22" fill="#f59e0b" opacity="0.5"/>

        <!-- Warm Wooden Study Desk spanning the full width -->
        <rect x="-100" y="170" width="800" height="80" fill="#78350f"/>
        <rect x="-100" y="166" width="800" height="9" fill="#92400e"/>

        <!-- Cozy Desk Lamp -->
        <rect x="470" y="90" width="6" height="80" fill="#cbd5e1" stroke="#334155" stroke-width="2"/>
        <path d="M473,90 Q510,50 535,68 Q515,85 473,90 Z" fill="#f59e0b" stroke="#78350f" stroke-width="3"/>
        <!-- Warm golden glow cone -->
        <path d="M473,90 L570,166 L390,166 Z" fill="#fef08a" opacity="0.16"/>

        <!-- Closed Laptop / Organizer Folder -->
        <rect x="235" y="125" width="170" height="42" fill="#292524" stroke="#1c1917" stroke-width="3" rx="4"/>
        <rect x="245" y="133" width="150" height="12" fill="#f59e0b" rx="3"/>
        <circle cx="320" cy="155" r="4" fill="#a8a29e"/>

        <!-- Steaming Coffee Cup -->
        <rect x="430" y="142" width="30" height="24" fill="#ffffff" stroke="#2d2621" stroke-width="2.5" rx="3"/>
        <path d="M460,147 C468,147 468,159 460,159" fill="none" stroke="#2d2621" stroke-width="2.5"/>
        <path d="M437,138 Q439,130 436,122" fill="none" stroke="#d6d3d1" stroke-width="2" stroke-linecap="round"/>
        <path d="M445,138 Q447,128 444,120" fill="none" stroke="#d6d3d1" stroke-width="2" stroke-linecap="round"/>

        <!-- Warm Notebook with bookmark -->
        <rect x="220" y="152" width="65" height="15" fill="#fef3c7" stroke="#b45309" stroke-width="2" rx="2"/>
        <line x1="228" y1="158" x2="265" y2="158" stroke="#d97706" stroke-width="1.5"/>
        <polygon points="275,152 280,152 280,164 277.5,161 275,164" fill="#dc2626"/>
      </svg>
    `,

    // Central Bank — classical pillars, warm golden hour sky
    bank: `
      <svg viewBox="0 0 600 240" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <!-- Warm afternoon golden sky full bleed -->
        <rect x="-100" y="-50" width="800" height="350" fill="#fef3c7"/>
        <circle cx="490" cy="55" r="50" fill="#fde68a"/>
        <ellipse cx="140" cy="45" rx="55" ry="16" fill="#ffffff" opacity="0.8"/>
        <ellipse cx="280" cy="35" rx="40" ry="12" fill="#ffffff" opacity="0.65"/>

        <!-- Flanking City Townhouses -->
        <rect x="0" y="90" width="120" height="150" fill="#ea580c" stroke="#2d2621" stroke-width="3"/>
        <rect x="20" y="110" width="22" height="22" fill="#fef08a" stroke="#2d2621" stroke-width="2" rx="2"/>
        <rect x="65" y="110" width="22" height="22" fill="#fef08a" stroke="#2d2621" stroke-width="2" rx="2"/>
        <rect x="20" y="150" width="22" height="22" fill="#fef08a" stroke="#2d2621" stroke-width="2" rx="2"/>
        <rect x="65" y="150" width="22" height="22" fill="#fef08a" stroke="#2d2621" stroke-width="2" rx="2"/>

        <rect x="480" y="80" width="120" height="160" fill="#0284c7" stroke="#2d2621" stroke-width="3"/>
        <rect x="500" y="105" width="22" height="22" fill="#fef08a" stroke="#2d2621" stroke-width="2" rx="2"/>
        <rect x="545" y="105" width="22" height="22" fill="#fef08a" stroke="#2d2621" stroke-width="2" rx="2"/>
        <rect x="500" y="145" width="22" height="22" fill="#fef08a" stroke="#2d2621" stroke-width="2" rx="2"/>
        <rect x="545" y="145" width="22" height="22" fill="#fef08a" stroke="#2d2621" stroke-width="2" rx="2"/>

        <!-- Bank Centerpiece Building -->
        <polygon points="150,75 300,20 450,75" fill="#f8fafc" stroke="#2d2621" stroke-width="3.5"/>
        <circle cx="300" cy="55" r="11" fill="#fef08a" stroke="#2d2621" stroke-width="2"/>
        <rect x="150" y="75" width="300" height="14" fill="#e2e8f0" stroke="#2d2621" stroke-width="2.5"/>

        <!-- Bank Columns -->
        <rect x="160" y="89" width="280" height="120" fill="#f1f5f9" stroke="#2d2621" stroke-width="3"/>
        <rect x="175" y="89" width="20" height="120" fill="#ffffff" stroke="#2d2621" stroke-width="2"/>
        <rect x="225" y="89" width="20" height="120" fill="#ffffff" stroke="#2d2621" stroke-width="2"/>
        <rect x="355" y="89" width="20" height="120" fill="#ffffff" stroke="#2d2621" stroke-width="2"/>
        <rect x="405" y="89" width="20" height="120" fill="#ffffff" stroke="#2d2621" stroke-width="2"/>

        <!-- Arched Vault Entrance -->
        <path d="M275,209 L275,145 Q300,125 325,145 L325,209 Z" fill="#334155" stroke="#2d2621" stroke-width="2.5"/>
        <path d="M280,209 L280,150 Q300,135 320,150 L320,209 Z" fill="#fde047" opacity="0.9"/>
        <line x1="300" y1="140" x2="300" y2="209" stroke="#78350f" stroke-width="2"/>

        <!-- Stone Steps & Street -->
        <rect x="120" y="209" width="360" height="12" fill="#cbd5e1" stroke="#2d2621" stroke-width="2"/>
        <rect x="-100" y="221" width="800" height="30" fill="#475569"/>
      </svg>
    `,

    // Decision Study (Ellsberg Day 5) — Warm Wood Library/Study (NO chalkboard math!)
    lab: `
      <svg viewBox="0 0 600 240" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <!-- Warm paneled study room full bleed -->
        <rect x="-100" y="-50" width="800" height="350" fill="#451a03"/>
        <rect x="-100" y="-50" width="800" height="350" fill="#5c2406" opacity="0.6"/>

        <!-- Bookshelves on left & right -->
        <rect x="20" y="20" width="110" height="175" fill="#78350f" stroke="#2d2621" stroke-width="3" rx="3"/>
        <g fill="#2563eb">
          <rect x="30" y="30" width="18" height="60" rx="2"/>
          <rect x="52" y="30" width="14" height="60" fill="#dc2626" rx="2"/>
          <rect x="70" y="30" width="20" height="60" fill="#16a34a" rx="2"/>
          <rect x="94" y="30" width="18" height="60" fill="#d97706" rx="2"/>
          <rect x="30" y="105" width="22" height="75" fill="#d97706" rx="2"/>
          <rect x="56" y="105" width="16" height="75" fill="#9333ea" rx="2"/>
          <rect x="76" y="105" width="24" height="75" fill="#2563eb" rx="2"/>
        </g>

        <rect x="470" y="20" width="110" height="175" fill="#78350f" stroke="#2d2621" stroke-width="3" rx="3"/>
        <g fill="#ea580c">
          <rect x="480" y="30" width="16" height="65" rx="2"/>
          <rect x="500" y="30" width="22" height="65" fill="#0284c7" rx="2"/>
          <rect x="526" y="30" width="14" height="65" fill="#16a34a" rx="2"/>
          <rect x="480" y="110" width="20" height="70" fill="#16a34a" rx="2"/>
          <rect x="504" y="110" width="18" height="70" fill="#dc2626" rx="2"/>
          <rect x="526" y="110" width="22" height="70" fill="#d97706" rx="2"/>
        </g>

        <!-- Big Cozy Window in Center -->
        <rect x="180" y="20" width="240" height="150" fill="#fef3c7" stroke="#2d2621" stroke-width="3.5" rx="4"/>
        <line x1="300" y1="20" x2="300" y2="170" stroke="#2d2621" stroke-width="2.5"/>
        <line x1="180" y1="95" x2="420" y2="95" stroke="#2d2621" stroke-width="2.5"/>
        <circle cx="300" cy="65" r="30" fill="#fde68a" opacity="0.8"/>

        <!-- Antique Brass Scale / Urns Table -->
        <rect x="-100" y="185" width="800" height="70" fill="#92400e" stroke="#2d2621" stroke-width="3"/>
        <!-- Cozy Brass Balance Scale on table -->
        <rect x="296" y="115" width="8" height="70" fill="#f59e0b" stroke="#78350f" stroke-width="2"/>
        <line x1="250" y1="125" x2="350" y2="125" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/>
        <!-- Left Pan -->
        <line x1="255" y1="125" x2="245" y2="155" stroke="#b45309" stroke-width="1.5"/>
        <line x1="255" y1="125" x2="265" y2="155" stroke="#b45309" stroke-width="1.5"/>
        <path d="M238,155 Q255,165 272,155 Z" fill="#fbbf24" stroke="#78350f" stroke-width="2"/>
        <circle cx="255" cy="151" r="5" fill="#dc2626"/>

        <!-- Right Pan -->
        <line x1="345" y1="125" x2="335" y2="155" stroke="#b45309" stroke-width="1.5"/>
        <line x1="345" y1="125" x2="355" y2="155" stroke="#b45309" stroke-width="1.5"/>
        <path d="M328,155 Q345,165 362,155 Z" fill="#fbbf24" stroke="#78350f" stroke-width="2"/>
        <circle cx="345" cy="151" r="5" fill="#2563eb"/>
      </svg>
    `,

    // Emergency Market Day (Day 8 Crash) — Warm Newsroom / Trading Floor
    crash: `
      <svg viewBox="0 0 600 240" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <!-- Dramatic Amber Sky full bleed -->
        <rect x="-100" y="-50" width="800" height="350" fill="#7f1d1d"/>
        <rect x="-100" y="-50" width="800" height="350" fill="#450a0a" opacity="0.6"/>

        <!-- Big Window Panes showing city under dramatic sunset -->
        <rect x="50" y="15" width="500" height="150" fill="#ea580c" stroke="#2d2621" stroke-width="4" rx="4"/>
        <line x1="175" y1="15" x2="175" y2="165" stroke="#2d2621" stroke-width="3"/>
        <line x1="300" y1="15" x2="300" y2="165" stroke="#2d2621" stroke-width="3"/>
        <line x1="425" y1="15" x2="425" y2="165" stroke="#2d2621" stroke-width="3"/>
        <line x1="50" y1="90" x2="550" y2="90" stroke="#2d2621" stroke-width="3"/>

        <!-- Silhouette skyline outside in sunset -->
        <rect x="75" y="80" width="45" height="85" fill="#431407"/>
        <rect x="130" y="55" width="35" height="110" fill="#292524"/>
        <rect x="200" y="70" width="50" height="95" fill="#431407"/>
        <rect x="330" y="50" width="45" height="115" fill="#292524"/>
        <rect x="450" y="65" width="60" height="100" fill="#431407"/>

        <!-- Floor Alert Board -->
        <rect x="180" y="105" width="240" height="35" fill="#1e1b4b" stroke="#fde047" stroke-width="2.5" rx="6"/>
        <text x="300" y="128" font-family="'Nunito', sans-serif" font-size="13" font-weight="900" fill="#fde047" text-anchor="middle" letter-spacing="1">MARKET VOLATILITY ALERT</text>

        <!-- Floor Desks in Foreground spanning full bleed -->
        <rect x="-100" y="170" width="800" height="80" fill="#1c1917" stroke="#2d2621" stroke-width="3"/>
        <rect x="40" y="185" width="120" height="8" fill="#292524" rx="2"/>
        <rect x="240" y="185" width="120" height="8" fill="#292524" rx="2"/>
        <rect x="440" y="185" width="120" height="8" fill="#292524" rx="2"/>
      </svg>
    `,

    // Cozy Financial Lounge (Replaces old 'arcade' with zero fancy math!)
    arcade: `
      <svg viewBox="0 0 600 240" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <!-- Warm Espresso Wall full bleed -->
        <rect x="-100" y="-50" width="800" height="350" fill="#291a13"/>
        <!-- Warm hanging pendant lamps -->
        <line x1="120" y1="0" x2="120" y2="45" stroke="#f59e0b" stroke-width="2"/>
        <path d="M105,45 Q120,35 135,45 Z" fill="#f59e0b" stroke="#78350f" stroke-width="2"/>
        <circle cx="120" cy="50" r="5" fill="#fef08a"/>
        <path d="M120,50 L180,180 L60,180 Z" fill="#fef08a" opacity="0.12"/>

        <line x1="300" y1="0" x2="300" y2="35" stroke="#f59e0b" stroke-width="2"/>
        <path d="M285,35 Q300,25 315,35 Z" fill="#f59e0b" stroke="#78350f" stroke-width="2"/>
        <circle cx="300" cy="40" r="5" fill="#fef08a"/>
        <path d="M300,40 L370,180 L230,180 Z" fill="#fef08a" opacity="0.14"/>

        <line x1="480" y1="0" x2="480" y2="45" stroke="#f59e0b" stroke-width="2"/>
        <path d="M465,45 Q480,35 495,45 Z" fill="#f59e0b" stroke="#78350f" stroke-width="2"/>
        <circle cx="480" cy="50" r="5" fill="#fef08a"/>
        <path d="M480,50 L540,180 L420,180 Z" fill="#fef08a" opacity="0.12"/>

        <!-- Lounge Wall Decor / Framed Art -->
        <rect x="230" y="60" width="140" height="70" fill="#3b261b" stroke="#78350f" stroke-width="3" rx="4"/>
        <circle cx="300" cy="95" r="22" fill="#d97706"/>
        <polygon points="300,80 315,108 285,108" fill="#fef08a"/>

        <!-- Comfortable Armchairs and Coffee Tables spanning full bleed -->
        <rect x="-100" y="175" width="800" height="75" fill="#451a03" stroke="#2d2621" stroke-width="3"/>

        <!-- Left Cozy Armchair -->
        <path d="M60,150 Q50,115 75,115 L125,115 Q150,115 140,150 Z" fill="#991b1b" stroke="#2d2621" stroke-width="2.5"/>
        <rect x="65" y="145" width="70" height="30" fill="#b91c1c" stroke="#2d2621" stroke-width="2" rx="4"/>

        <!-- Coffee Table Center -->
        <rect x="260" y="155" width="80" height="24" fill="#78350f" stroke="#2d2621" stroke-width="2.5" rx="3"/>
        <line x1="275" y1="179" x2="275" y2="200" stroke="#451a03" stroke-width="4"/>
        <line x1="325" y1="179" x2="325" y2="200" stroke="#451a03" stroke-width="4"/>
        <rect x="288" y="145" width="16" height="12" fill="#ffffff" stroke="#2d2621" stroke-width="2" rx="2"/>

        <!-- Right Cozy Armchair -->
        <path d="M460,150 Q450,115 475,115 L525,115 Q550,115 540,150 Z" fill="#1e3a8a" stroke="#2d2621" stroke-width="2.5"/>
        <rect x="465" y="145" width="70" height="30" fill="#2563eb" stroke="#2d2621" stroke-width="2" rx="4"/>
      </svg>
    `,

    // Debrief / Study Room
    debrief: `
      <svg viewBox="0 0 600 240" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <!-- Warm afternoon room full bleed -->
        <rect x="-100" y="-50" width="800" height="350" fill="#fef3c7"/>
        <rect x="-100" y="180" width="800" height="70" fill="#d97706" opacity="0.18"/>
        
        <!-- Bookshelf on left -->
        <rect x="30" y="30" width="80" height="155" fill="#92400e" stroke="#78350f" stroke-width="2.5" rx="3"/>
        <rect x="36" y="40" width="16" height="60" fill="#2563eb" rx="2"/>
        <rect x="56" y="40" width="14" height="60" fill="#dc2626" rx="2"/>
        <rect x="74" y="40" width="16" height="60" fill="#16a34a" rx="2"/>
        <rect x="36" y="110" width="20" height="65" fill="#d97706" rx="2"/>
        <rect x="60" y="110" width="18" height="65" fill="#7c3aed" rx="2"/>

        <!-- Big Window with warm sunlight beams -->
        <rect x="160" y="25" width="280" height="155" fill="#fef9c3" stroke="#92400e" stroke-width="3" rx="4"/>
        <line x1="300" y1="25" x2="300" y2="180" stroke="#92400e" stroke-width="2.5"/>
        <line x1="160" y1="102" x2="440" y2="102" stroke="#92400e" stroke-width="2.5"/>
        <!-- Soft sunbeams -->
        <polygon points="300,25 420,180 260,180" fill="#fde68a" opacity="0.25"/>

        <!-- Potted Plant on desk -->
        <path d="M495,145 L525,145 L520,180 L500,180 Z" fill="#b45309" stroke="#2d2621" stroke-width="2"/>
        <circle cx="510" cy="130" r="16" fill="#16a34a"/>
        <circle cx="498" cy="120" r="12" fill="#22c55e"/>
        <circle cx="522" cy="120" r="12" fill="#22c55e"/>

        <!-- Floor spanning full bleed -->
        <rect x="-100" y="215" width="800" height="35" fill="#fed7aa" opacity="0.5"/>
        <line x1="-100" y1="215" x2="700" y2="215" stroke="#92400e" stroke-width="2" opacity="0.3"/>
      </svg>
    `,

    // Generic town exterior
    town: `
      <svg viewBox="0 0 600 240" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <!-- Warm golden hour sky full bleed -->
        <rect x="-100" y="-50" width="800" height="350" fill="#fef3c7"/>
        <circle cx="510" cy="55" r="45" fill="#fde68a"/>
        <ellipse cx="160" cy="35" rx="55" ry="16" fill="#fff" opacity="0.75"/>
        <ellipse cx="330" cy="45" rx="45" ry="14" fill="#fff" opacity="0.65"/>

        <!-- Colorful Town Buildings -->
        <rect x="20" y="80" width="85" height="135" fill="#3b82f6" stroke="#1e3a8a" stroke-width="3" rx="3"/>
        <g fill="#bae6fd">
          <rect x="32" y="95" width="16" height="16" rx="2"/><rect x="56" y="95" width="16" height="16" rx="2"/><rect x="80" y="95" width="16" height="16" rx="2"/>
          <rect x="32" y="125" width="16" height="16" rx="2"/><rect x="56" y="125" width="16" height="16" rx="2"/><rect x="80" y="125" width="16" height="16" rx="2"/>
          <rect x="32" y="155" width="16" height="16" rx="2"/><rect x="56" y="155" width="16" height="16" rx="2"/><rect x="80" y="155" width="16" height="16" rx="2"/>
        </g>

        <rect x="125" y="55" width="130" height="160" fill="#f59e0b" stroke="#b45309" stroke-width="3" rx="3"/>
        <g fill="#fef3c7">
          <rect x="142" y="70" width="20" height="20" rx="2"/><rect x="180" y="70" width="20" height="20" rx="2"/><rect x="218" y="70" width="20" height="20" rx="2"/>
          <rect x="142" y="105" width="20" height="20" rx="2"/><rect x="180" y="105" width="20" height="20" rx="2"/><rect x="218" y="105" width="20" height="20" rx="2"/>
          <rect x="142" y="140" width="20" height="20" rx="2"/><rect x="180" y="140" width="20" height="20" rx="2"/><rect x="218" y="140" width="20" height="20" rx="2"/>
        </g>

        <rect x="275" y="95" width="90" height="120" fill="#16a34a" stroke="#14532d" stroke-width="3" rx="3"/>
        <g fill="#bbf7d0">
          <rect x="290" y="110" width="18" height="18" rx="2"/><rect x="320" y="110" width="18" height="18" rx="2"/>
          <rect x="290" y="140" width="18" height="18" rx="2"/><rect x="320" y="140" width="18" height="18" rx="2"/>
        </g>

        <rect x="385" y="70" width="120" height="145" fill="#7c3aed" stroke="#4c1d95" stroke-width="3" rx="3"/>
        <g fill="#ede9fe">
          <rect x="402" y="85" width="20" height="20" rx="2"/><rect x="436" y="85" width="20" height="20" rx="2"/><rect x="470" y="85" width="20" height="20" rx="2"/>
          <rect x="402" y="120" width="20" height="20" rx="2"/><rect x="436" y="120" width="20" height="20" rx="2"/><rect x="470" y="120" width="20" height="20" rx="2"/>
        </g>

        <!-- Street & Sidewalk full bleed -->
        <rect x="-100" y="212" width="800" height="35" fill="#334155"/>
        <line x1="-100" y1="210" x2="700" y2="210" stroke="#475569" stroke-width="3"/>
        <line x1="40" y1="225" x2="90" y2="225" stroke="#fbbf24" stroke-width="2" stroke-dasharray="12,12"/>
        <line x1="160" y1="225" x2="210" y2="225" stroke="#fbbf24" stroke-width="2" stroke-dasharray="12,12"/>
        <line x1="280" y1="225" x2="330" y2="225" stroke="#fbbf24" stroke-width="2" stroke-dasharray="12,12"/>
        <line x1="400" y1="225" x2="450" y2="225" stroke="#fbbf24" stroke-width="2" stroke-dasharray="12,12"/>
      </svg>
    `
  },

  /**
   * Cozy Bank in a City Artwork for the final reward card
   */
  bankCityArt: `
    <svg viewBox="0 0 500 320" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fde68a"/>
          <stop offset="45%" stop-color="#fed7aa"/>
          <stop offset="85%" stop-color="#ffedd5"/>
          <stop offset="100%" stop-color="#fecdd3"/>
        </linearGradient>
        <linearGradient id="bankGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="#f1f5f9"/>
        </linearGradient>
      </defs>
      <rect width="500" height="320" fill="url(#skyGrad)"/>

      <circle cx="250" cy="110" r="65" fill="#fef08a" opacity="0.85"/>
      <circle cx="250" cy="110" r="48" fill="#fde047" opacity="0.6"/>

      <!-- Distant City Skyline Silhouettes -->
      <rect x="25" y="110" width="45" height="150" fill="#cbd5e1" opacity="0.75"/>
      <rect x="65" y="85" width="55" height="175" fill="#94a3b8" opacity="0.75"/>
      <rect x="115" y="125" width="40" height="135" fill="#cbd5e1" opacity="0.75"/>
      <rect x="345" y="105" width="42" height="155" fill="#cbd5e1" opacity="0.75"/>
      <rect x="382" y="75" width="50" height="185" fill="#94a3b8" opacity="0.75"/>
      <rect x="428" y="120" width="48" height="140" fill="#cbd5e1" opacity="0.75"/>

      <!-- Mid-ground City Buildings with Warm Windows -->
      <rect x="10" y="145" width="80" height="135" fill="#334155" stroke="#1e293b" stroke-width="2.5" rx="3"/>
      <g fill="#fef08a">
        <rect x="22" y="160" width="12" height="16" rx="2"/><rect x="44" y="160" width="12" height="16" rx="2"/><rect x="66" y="160" width="12" height="16" rx="2"/>
        <rect x="22" y="190" width="12" height="16" rx="2"/><rect x="44" y="190" width="12" height="16" rx="2"/><rect x="66" y="190" width="12" height="16" rx="2"/>
        <rect x="22" y="220" width="12" height="16" rx="2"/><rect x="44" y="220" width="12" height="16" rx="2"/><rect x="66" y="220" width="12" height="16" rx="2"/>
      </g>

      <rect x="410" y="140" width="80" height="140" fill="#1e293b" stroke="#0f172a" stroke-width="2.5" rx="3"/>
      <g fill="#fef08a">
        <rect x="422" y="155" width="14" height="18" rx="2"/><rect x="448" y="155" width="14" height="18" rx="2"/><rect x="470" y="155" width="10" height="18" rx="2"/>
        <rect x="422" y="185" width="14" height="18" rx="2"/><rect x="448" y="185" width="14" height="18" rx="2"/><rect x="470" y="185" width="10" height="18" rx="2"/>
        <rect x="422" y="215" width="14" height="18" rx="2"/><rect x="448" y="215" width="14" height="18" rx="2"/><rect x="470" y="215" width="10" height="18" rx="2"/>
      </g>

      <!-- Central Grand Bank Building -->
      <polygon points="120,120 250,55 380,120" fill="#f8fafc" stroke="#2d2621" stroke-width="3.5"/>
      <polygon points="145,115 250,68 355,115" fill="#e2e8f0"/>
      <circle cx="250" cy="94" r="13" fill="#ffffff" stroke="#2d2621" stroke-width="2"/>
      <line x1="250" y1="94" x2="250" y2="86" stroke="#2d2621" stroke-width="2"/>
      <line x1="250" y1="94" x2="256" y2="94" stroke="#2d2621" stroke-width="2"/>

      <rect x="120" y="120" width="260" height="18" fill="#e2e8f0" stroke="#2d2621" stroke-width="3"/>
      <text x="250" y="133" font-family="'Nunito', sans-serif" font-size="10" font-weight="900" fill="#334155" text-anchor="middle" letter-spacing="3">CENTRAL REPOSIT</text>

      <rect x="130" y="138" width="240" height="120" fill="url(#bankGrad)" stroke="#2d2621" stroke-width="3"/>
      <rect x="145" y="138" width="22" height="120" fill="#ffffff" stroke="#2d2621" stroke-width="2.5"/>
      <rect x="195" y="138" width="22" height="120" fill="#ffffff" stroke="#2d2621" stroke-width="2.5"/>
      <rect x="283" y="138" width="22" height="120" fill="#ffffff" stroke="#2d2621" stroke-width="2.5"/>
      <rect x="333" y="138" width="22" height="120" fill="#ffffff" stroke="#2d2621" stroke-width="2.5"/>

      <path d="M228,258 L228,190 Q250,172 272,190 L272,258 Z" fill="#334155" stroke="#2d2621" stroke-width="2.5"/>
      <path d="M234,258 L234,196 Q250,180 266,196 L266,258 Z" fill="#fde047" opacity="0.85"/>
      <line x1="250" y1="184" x2="250" y2="258" stroke="#78350f" stroke-width="2"/>

      <rect x="171" y="170" width="20" height="32" rx="3" fill="#bae6fd" stroke="#2d2621" stroke-width="2"/>
      <rect x="309" y="170" width="20" height="32" rx="3" fill="#bae6fd" stroke="#2d2621" stroke-width="2"/>

      <rect x="110" y="258" width="280" height="8" fill="#cbd5e1" stroke="#2d2621" stroke-width="2.5"/>
      <rect x="100" y="266" width="300" height="10" fill="#94a3b8" stroke="#2d2621" stroke-width="2.5"/>

      <!-- Cozy Autumn Trees in Foreground -->
      <rect x="86" y="240" width="8" height="36" fill="#78350f" stroke="#2d2621" stroke-width="2"/>
      <circle cx="90" cy="225" r="24" fill="#f59e0b" stroke="#2d2621" stroke-width="2.5"/>
      <circle cx="82" cy="220" r="16" fill="#fbbf24"/>

      <rect x="406" y="238" width="8" height="38" fill="#78350f" stroke="#2d2621" stroke-width="2"/>
      <circle cx="410" cy="222" r="26" fill="#ea580c" stroke="#2d2621" stroke-width="2.5"/>
      <circle cx="418" cy="216" r="17" fill="#f97316"/>

      <rect x="0" y="276" width="500" height="44" fill="#475569" stroke="#2d2621" stroke-width="3"/>
      <line x1="0" y1="288" x2="500" y2="288" stroke="#e2e8f0" stroke-width="3" stroke-dasharray="24,18"/>
    </svg>
  `,

  /**
   * Jorgan — Human Financial Advisor in a Sharp Suit
   */
  getJorgan: function(mood = "happy") {
    let eyes = `
      <rect x="36" y="38" width="18" height="13" rx="3" fill="#ffffff" stroke="#1e293b" stroke-width="2"/>
      <rect x="66" y="38" width="18" height="13" rx="3" fill="#ffffff" stroke="#1e293b" stroke-width="2"/>
      <line x1="54" y1="44" x2="66" y2="44" stroke="#1e293b" stroke-width="2"/>
      <circle cx="45" cy="44" r="3" fill="#1e293b"/>
      <circle cx="75" cy="44" r="3" fill="#1e293b"/>
      <circle cx="46" cy="43" r="1" fill="#fff"/>
      <circle cx="76" cy="43" r="1" fill="#fff"/>
      <path d="M36,34 Q45,32 54,34" fill="none" stroke="#451a03" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M66,34 Q75,32 84,34" fill="none" stroke="#451a03" stroke-width="2.5" stroke-linecap="round"/>
    `;
    let mouth = `<path d="M52,56 Q60,62 68,56" fill="none" stroke="#2d2621" stroke-width="2.5" stroke-linecap="round"/>`;
    let tie = `<polygon points="56,76 64,76 66,110 60,118 54,110" fill="#dc2626" stroke="#2d2621" stroke-width="2"/><polygon points="55,72 65,72 63,78 57,78" fill="#b91c1c" stroke="#2d2621" stroke-width="1.5"/>`;

    if (mood === "shocked") {
      eyes = `
        <rect x="34" y="36" width="22" height="16" rx="4" fill="#ffffff" stroke="#1e293b" stroke-width="2.5"/>
        <rect x="64" y="36" width="22" height="16" rx="4" fill="#ffffff" stroke="#1e293b" stroke-width="2.5"/>
        <line x1="56" y1="44" x2="64" y2="44" stroke="#1e293b" stroke-width="2"/>
        <circle cx="45" cy="44" r="4.5" fill="#dc2626"/>
        <circle cx="75" cy="44" r="4.5" fill="#dc2626"/>
        <circle cx="45" cy="44" r="2" fill="#1e293b"/>
        <circle cx="75" cy="44" r="2" fill="#1e293b"/>
        <path d="M34,30 Q45,26 54,31" fill="none" stroke="#451a03" stroke-width="3" stroke-linecap="round"/>
        <path d="M66,31 Q75,26 86,30" fill="none" stroke="#451a03" stroke-width="3" stroke-linecap="round"/>
      `;
      mouth = `<ellipse cx="60" cy="58" rx="6" ry="8" fill="#991b1b" stroke="#2d2621" stroke-width="2.5"/>`;
      tie = `<polygon points="54,76 62,75 70,108 65,116 57,109" fill="#dc2626" stroke="#2d2621" stroke-width="2"/>`;
    } else if (mood === "thinking") {
      eyes = `
        <rect x="36" y="38" width="18" height="13" rx="3" fill="#ffffff" stroke="#1e293b" stroke-width="2"/>
        <rect x="66" y="38" width="18" height="13" rx="3" fill="#ffffff" stroke="#1e293b" stroke-width="2"/>
        <line x1="54" y1="44" x2="66" y2="44" stroke="#1e293b" stroke-width="2"/>
        <circle cx="48" cy="43" r="3" fill="#1e293b"/>
        <circle cx="78" cy="43" r="3" fill="#1e293b"/>
        <path d="M36,36 Q45,36 54,34" fill="none" stroke="#451a03" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M66,32 Q75,28 84,33" fill="none" stroke="#451a03" stroke-width="3" stroke-linecap="round"/>
      `;
      mouth = `<path d="M54,58 Q62,56 68,59" fill="none" stroke="#2d2621" stroke-width="2.5" stroke-linecap="round"/>`;
    } else if (mood === "proud") {
      eyes = `
        <rect x="36" y="38" width="18" height="13" rx="3" fill="#ffffff" stroke="#1e293b" stroke-width="2"/>
        <rect x="66" y="38" width="18" height="13" rx="3" fill="#ffffff" stroke="#1e293b" stroke-width="2"/>
        <line x1="54" y1="44" x2="66" y2="44" stroke="#1e293b" stroke-width="2"/>
        <path d="M40,45 Q45,40 50,45" fill="none" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M70,45 Q75,40 80,45" fill="none" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round"/>
      `;
      mouth = `<path d="M50,55 Q60,65 70,55" fill="#dc2626" stroke="#2d2621" stroke-width="2.5"/>`;
    }

    return `
      <svg viewBox="0 0 120 120" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="jorgan-svg">
        <path d="M18,90 Q12,120 14,120 L106,120 Q108,120 102,90 Q90,75 60,75 Q30,75 18,90 Z" fill="#1e293b" stroke="#2d2621" stroke-width="3"/>
        <polygon points="46,75 74,75 60,105" fill="#f8fafc" stroke="#2d2621" stroke-width="2"/>
        <polygon points="44,72 56,86 52,72" fill="#ffffff" stroke="#2d2621" stroke-width="2"/>
        <polygon points="76,72 64,86 68,72" fill="#ffffff" stroke="#2d2621" stroke-width="2"/>
        ${tie}
        <polygon points="26,88 46,75 52,102 36,108" fill="#334155" stroke="#2d2621" stroke-width="2"/>
        <polygon points="94,88 74,75 68,102 84,108" fill="#334155" stroke="#2d2621" stroke-width="2"/>
        <rect x="52" y="62" width="16" height="15" fill="#fed7aa" stroke="#2d2621" stroke-width="2"/>
        <ellipse cx="60" cy="46" rx="26" ry="24" fill="#fde68a" stroke="#2d2621" stroke-width="3"/>
        <path d="M34,42 C32,25 45,18 60,18 C75,18 88,25 86,42 C84,32 78,25 60,25 C42,25 36,32 34,42 Z" fill="#451a03" stroke="#2d2621" stroke-width="2.5"/>
        <path d="M34,36 Q45,28 62,30 Q76,32 86,36 Q84,26 62,23 Q38,25 34,36 Z" fill="#78350f"/>
        <circle cx="34" cy="47" r="4.5" fill="#fde68a" stroke="#2d2621" stroke-width="2"/>
        <circle cx="86" cy="47" r="4.5" fill="#fde68a" stroke="#2d2621" stroke-width="2"/>
        ${eyes}
        ${mouth}
      </svg>
    `;
  },

  /**
   * Pinky Promise Graphic
   * Uses the authentic user-provided sticker artwork:
   * - img/pinky_outstretched.png (outstretched reaching pinkies before promise)
   * - img/pinky_locked.png (crossed pinky swear with impact ticks on lock)
   */
  getPinkyPromiseSVG: function(isHooked = false) {
    return `
      <div class="pinky-stage-wrapper">
        <div class="pinky-layer pinky-layer-outstretched ${isHooked ? 'is-hidden' : 'is-visible'}" id="pinkyOutstretchedLayer">
          <img src="img/pinky_outstretched.png" alt="Reaching Pinkies" class="pinky-img pinky-sway" />
        </div>
        <div class="pinky-layer pinky-layer-locked ${isHooked ? 'is-visible' : 'is-hidden'}" id="pinkyLockedLayer">
          <img src="img/pinky_locked.png" alt="Locked Pinky Swear" class="pinky-img" />
          <div class="pinky-snap-burst-ring"></div>
          <div class="pinky-burst-stars">
            <span>✨</span>
            <span>⭐</span>
            <span>✨</span>
          </div>
        </div>
      </div>
    `;
  }
};

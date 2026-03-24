/**
 * animationGeneratorTypes.js
 * Catalog of all supported animation types organized by category.
 * Each entry describes what Gemini should generate.
 */

export const ANIMATION_TYPES = {

  // ── DATA & CHARTS ─────────────────────────────────────────────────────────
  'data-charts': {
    label: 'Data & Charts',
    icon: 'BarChart',
    types: [
      {
        id: 'radarchart',
        name: 'Radar / Spider Chart',
        desc: 'Multi-axis polygon chart comparing values across 5-6 dimensions. Axes radiate from center, polygon fills in as values animate.',
        suggestedName: 'radarchart-spider',
        tags: ['chart', 'data', 'comparison'],
      },
      {
        id: 'bubblemap',
        name: 'Bubble Map / Choropleth',
        desc: 'Geographic or abstract map with circles sized by value. Bubbles scale up from zero with color encoding intensity.',
        suggestedName: 'bubblemap-sized',
        tags: ['chart', 'map', 'data'],
      },
      {
        id: 'sankey-flow',
        name: 'Sankey Flow Diagram',
        desc: 'Flow diagram showing quantities moving between categories. Bands animate from source nodes to destination nodes left-to-right.',
        suggestedName: 'sankey-flow',
        tags: ['chart', 'flow', 'network'],
      },
      {
        id: 'marimekko',
        name: 'Marimekko / Mosaic Chart',
        desc: 'Proportional 2D blocks where both width and height encode data. Columns scale up then internal segments fill in.',
        suggestedName: 'marimekko-mosaic',
        tags: ['chart', 'data', 'proportion'],
      },
      {
        id: 'candlestick',
        name: 'Candlestick Chart',
        desc: 'OHLC time-series price chart. Candles appear sequentially left-to-right, wicks draw in, bodies fill with green/red.',
        suggestedName: 'candlestick-ohlc',
        tags: ['chart', 'finance', 'timeseries'],
      },
      {
        id: 'bullet-chart',
        name: 'Bullet Chart (KPI vs Target)',
        desc: 'Horizontal bar showing actual value vs target marker vs ranges. Multiple KPIs stack vertically with staggered entrances.',
        suggestedName: 'bulletchart-kpi',
        tags: ['chart', 'kpi', 'comparison'],
      },
      {
        id: 'slope-chart',
        name: 'Slope Chart',
        desc: 'Two vertical axes connected by lines showing change between two time points. Lines draw in with value labels animating at endpoints.',
        suggestedName: 'slopechart-change',
        tags: ['chart', 'comparison', 'change'],
      },
      {
        id: 'bar-chart-race',
        name: 'Bar Chart Race',
        desc: 'Horizontal bars that reorder dynamically over time showing ranking changes. Labels and values update as bars grow/shrink.',
        suggestedName: 'barchart-race',
        tags: ['chart', 'race', 'ranking'],
      },
    ],
  },

  // ── STORYTELLING ─────────────────────────────────────────────────────────
  'storytelling': {
    label: 'Storytelling',
    icon: 'AutoStories',
    types: [
      {
        id: 'before-after-split',
        name: 'Before / After Split',
        desc: 'Screen splits with a vertical divider that sweeps across revealing two states side by side. Labels animate in on each side.',
        suggestedName: 'before-after-split',
        tags: ['storytelling', 'comparison', 'reveal'],
      },
      {
        id: 'zoom-to-detail',
        name: 'Zoom to Detail',
        desc: 'Opens at overview level then camera zooms into a specific highlighted element. Scale and opacity transition guide the eye.',
        suggestedName: 'zoom-to-detail',
        tags: ['storytelling', 'zoom', 'focus'],
      },
      {
        id: 'scrollytelling-step',
        name: 'Scrollytelling Step',
        desc: 'Sequential reveal of content in numbered steps. Each step animates in from the side while previous steps dim slightly.',
        suggestedName: 'scrollytelling-step',
        tags: ['storytelling', 'steps', 'reveal'],
      },
      {
        id: 'annotation-callout',
        name: 'Annotation Callout',
        desc: 'Arrow and label animate in pointing to a specific chart region or data point. Line draws, then box reveals, then text types in.',
        suggestedName: 'annotation-callout',
        tags: ['storytelling', 'annotation', 'callout'],
      },
      {
        id: 'dashboard-summary',
        name: 'Dashboard Summary',
        desc: 'Multi-metric overview card with mini charts, KPIs and stats populating sequentially. Professional executive summary layout.',
        suggestedName: 'dashboard-summary',
        tags: ['dashboard', 'summary', 'multi-metric'],
      },
      {
        id: 'alert-notification',
        name: 'Alert / Notification Pop',
        desc: 'Security alert or notification badge pops in with ring animation, severity color, title and description. Urgency feel.',
        suggestedName: 'alert-notification',
        tags: ['alert', 'notification', 'badge'],
      },
    ],
  },

  // ── TEXT & REVEAL ─────────────────────────────────────────────────────────
  'text-reveal': {
    label: 'Text & Reveal',
    icon: 'TextFields',
    types: [
      {
        id: 'word-highlight-scan',
        name: 'Word Highlight Scan',
        desc: 'Block of text where words highlight in sequence as if being read by a scanner. Background glow sweeps word by word.',
        suggestedName: 'word-highlight-scan',
        tags: ['text', 'highlight', 'scan'],
      },
      {
        id: 'redacted-reveal',
        name: 'Redacted Reveal',
        desc: 'Classified document style: black redaction bars over text lift one by one to reveal content underneath. Investigation aesthetic.',
        suggestedName: 'redacted-reveal',
        tags: ['text', 'reveal', 'classified'],
      },
      {
        id: 'stamped-verdict',
        name: 'Stamped Verdict',
        desc: 'Rubber stamp effect: a word like CLASSIFIED / CONFIRMED / BREACH slams down with rotation, impact shake, and ink spread.',
        suggestedName: 'stamped-verdict',
        tags: ['text', 'stamp', 'verdict'],
      },
      {
        id: 'number-odometer',
        name: 'Number Odometer',
        desc: 'Rolling digit counter like a mechanical odometer. Each digit column scrolls independently to reach target number.',
        suggestedName: 'number-odometer',
        tags: ['text', 'counter', 'number'],
      },
      {
        id: 'scramble-decode',
        name: 'Scramble Decode',
        desc: 'Characters randomize rapidly before resolving to the final text. Tech/hacker aesthetic — great for revealing names or codes.',
        suggestedName: 'scramble-decode',
        tags: ['text', 'scramble', 'decode'],
      },
    ],
  },

  // ── LAYOUT & COMPOSITION ─────────────────────────────────────────────────
  'layout': {
    label: 'Layout & Composition',
    icon: 'Dashboard',
    types: [
      {
        id: 'magazine-cover',
        name: 'Magazine Cover',
        desc: 'Bold full-bleed layout with large title, subtitle, and key stats. Elements slide and fade in with dramatic timing.',
        suggestedName: 'magazine-cover',
        tags: ['layout', 'title', 'bold'],
      },
      {
        id: 'comparison-table',
        name: 'Comparison Table',
        desc: 'Animated rows populating a pros/cons or feature comparison table. Rows slide in with check/cross icons and value cells.',
        suggestedName: 'comparison-table',
        tags: ['layout', 'table', 'comparison'],
      },
      {
        id: 'bracket-tournament',
        name: 'Bracket / Tournament',
        desc: 'Elimination bracket that fills in progressively. Lines draw connecting matches, winners highlight, losers dim.',
        suggestedName: 'bracket-tournament',
        tags: ['layout', 'bracket', 'tournament'],
      },
      {
        id: 'lower-third',
        name: 'Lower Third',
        desc: 'Professional broadcast-style lower third: name, title, and org slide in from left with accent bar. Clean and authoritative.',
        suggestedName: 'lower-third',
        tags: ['layout', 'broadcast', 'lower-third'],
      },
    ],
  },

  // ── SECURITY / CYBER ──────────────────────────────────────────────────────
  'security': {
    label: 'Security & Cyber',
    icon: 'Security',
    types: [
      // Investigation & Evidence
      {
        id: 'dossier-open',
        name: 'Dossier Open',
        desc: 'Manila folder slides open revealing a subject profile with photo placeholder, aliases, known TTPs and threat level badge.',
        suggestedName: 'dossier-open',
        tags: ['security', 'investigation', 'profile'],
      },
      {
        id: 'wanted-poster',
        name: 'Wanted Poster',
        desc: 'Hacker profile card with moniker, known aliases, nation-state affiliation, and known tools. Elements burn/stamp in.',
        suggestedName: 'wanted-poster',
        tags: ['security', 'profile', 'threat-actor'],
      },
      {
        id: 'dark-web-listing',
        name: 'Dark Web Listing',
        desc: 'Dark forum post or marketplace card appearing with leaked data summary, price, and record count. Ominous atmosphere.',
        suggestedName: 'dark-web-listing',
        tags: ['security', 'darkweb', 'breach'],
      },
      {
        id: 'breach-report-card',
        name: 'Breach Report Card',
        desc: 'Records stolen stat reveal with severity color, affected org, date, and data types exposed. Clean incident summary.',
        suggestedName: 'breach-report-card',
        tags: ['security', 'breach', 'incident'],
      },
      {
        id: 'classified-stamp',
        name: 'Classified Stamp',
        desc: 'Full-screen classified document with redacted content. CLASSIFIED / DECLASSIFIED stamp slams down with impact effect.',
        suggestedName: 'classified-stamp',
        tags: ['security', 'classified', 'document'],
      },
      // Attack Visualization
      {
        id: 'kill-chain-steps',
        name: 'Kill Chain Steps',
        desc: 'Lockheed Martin kill chain: Recon → Weaponize → Deliver → Exploit → Install → C2 → Exfil. Each stage lights up sequentially with icon and label.',
        suggestedName: 'kill-chain-steps',
        tags: ['security', 'attack', 'kill-chain'],
      },
      {
        id: 'lateral-movement',
        name: 'Lateral Movement',
        desc: 'Network graph where attacker node hops between systems. Each hop animates with glowing path and compromised node turns red.',
        suggestedName: 'lateral-movement',
        tags: ['security', 'attack', 'network'],
      },
      {
        id: 'exploit-chain',
        name: 'Exploit Chain',
        desc: 'Sequential steps: CVE Found → PoC Run → Shell Gained → Privilege Escalate → Persist. Each step reveals with progress connector.',
        suggestedName: 'exploit-chain',
        tags: ['security', 'exploit', 'steps'],
      },
      {
        id: 'port-scan-reveal',
        name: 'Port Scan Reveal',
        desc: 'Grid of numbered ports, each flipping from closed (grey) to open (green/red) as scan sweeps across. Port number labels show.',
        suggestedName: 'port-scan-reveal',
        tags: ['security', 'scan', 'network'],
      },
      {
        id: 'c2-beacon',
        name: 'C2 Beacon',
        desc: 'Pulsing beacon signal between infected host and C2 server nodes on a dark background. Periodic pulse waves animate outward.',
        suggestedName: 'c2-beacon',
        tags: ['security', 'c2', 'network'],
      },
      {
        id: 'packet-flood',
        name: 'Packet Flood (DDoS)',
        desc: 'Streams of packet nodes converging on a target server from multiple source IPs. Target node overloads and turns red.',
        suggestedName: 'packet-flood-ddos',
        tags: ['security', 'ddos', 'attack'],
      },
      // Technical Forensics
      {
        id: 'hex-dump-scroll',
        name: 'Hex Dump Scroll',
        desc: 'Hex editor view scrolling with offset addresses, hex bytes, and ASCII representation. Payload bytes highlight in sequence.',
        suggestedName: 'hex-dump-scroll',
        tags: ['security', 'forensics', 'hex'],
      },
      {
        id: 'memory-map',
        name: 'Memory Map',
        desc: 'Process memory segments (text, data, heap, stack, injected shellcode) displayed as colored blocks that light up sequentially.',
        suggestedName: 'memory-map',
        tags: ['security', 'forensics', 'memory'],
      },
      {
        id: 'wireshark-row-stream',
        name: 'Wireshark Row Stream',
        desc: 'Packet rows stream in like Wireshark capture — source IP, dest IP, protocol, length, info. One anomalous row flashes red and freezes.',
        suggestedName: 'wireshark-row-stream',
        tags: ['security', 'forensics', 'network'],
      },
      {
        id: 'sql-injection-demo',
        name: 'SQL Injection Demo',
        desc: 'Input field shows benign query, then attacker input morphs it. The SQL query reconstructs showing the injected payload highlighted.',
        suggestedName: 'sql-injection-demo',
        tags: ['security', 'web', 'exploit'],
      },
      {
        id: 'log-anomaly-detect',
        name: 'Log Anomaly Detection',
        desc: 'Log lines stream down the screen. Normal lines are dim, then one anomalous line flashes bright red and freezes with a warning badge.',
        suggestedName: 'log-anomaly-detect',
        tags: ['security', 'forensics', 'logs'],
      },
      // Atmosphere & Style
      {
        id: 'matrix-rain',
        name: 'Matrix Rain',
        desc: 'Falling columns of randomized katakana/binary/hex characters in green on black. Classic hacker atmosphere background.',
        suggestedName: 'matrix-rain',
        tags: ['security', 'atmosphere', 'background'],
      },
      {
        id: 'glitch-corrupt',
        name: 'Glitch Corrupt',
        desc: 'Elements visually corrupt and distort — horizontal shift glitches, color channel splitting, pixel block artifacts. Memory corruption aesthetic.',
        suggestedName: 'glitch-corrupt',
        tags: ['security', 'atmosphere', 'glitch'],
      },
      {
        id: 'countdown-breach',
        name: 'Countdown to Breach',
        desc: 'Ticking countdown clock with "Time to Breach Detected:" label. Numbers count down with urgency styling, alarm state at zero.',
        suggestedName: 'countdown-breach',
        tags: ['security', 'atmosphere', 'countdown'],
      },
      {
        id: 'ransom-note-reveal',
        name: 'Ransom Note Reveal',
        desc: 'Ransom demand text appears in a pixelated/typewriter style with ominous red accents. Bitcoin address and deadline included.',
        suggestedName: 'ransom-note-reveal',
        tags: ['security', 'ransomware', 'reveal'],
      },
      {
        id: 'error-cascade',
        name: 'Error Cascade',
        desc: 'Error and exception messages stack up rapidly in a terminal — system failing. Critical errors turn red, process terminates.',
        suggestedName: 'error-cascade',
        tags: ['security', 'atmosphere', 'error'],
      },
      // Threat Intelligence
      {
        id: 'ioc-list-stream',
        name: 'IOC List Stream',
        desc: 'Indicators of compromise (IPs, file hashes, domains) stream down like a threat feed. New IOCs appear and fade with type badge.',
        suggestedName: 'ioc-list-stream',
        tags: ['security', 'threat-intel', 'ioc'],
      },
      {
        id: 'cvss-score-reveal',
        name: 'CVSS Score Reveal',
        desc: 'Animated CVSS dial sweeping from 0 to score with color bands (green → yellow → orange → red). CVE ID and vector string reveal below.',
        suggestedName: 'cvss-score-reveal',
        tags: ['security', 'vulnerability', 'cvss'],
      },
      {
        id: 'threat-actor-timeline',
        name: 'Threat Actor Timeline',
        desc: "Group's known operations plotted on a horizontal timeline. Each operation node pops in with date, target sector, and technique.",
        suggestedName: 'threat-actor-timeline',
        tags: ['security', 'threat-intel', 'timeline'],
      },
      {
        id: 'attribution-web',
        name: 'Attribution Web',
        desc: 'Connecting the dots: malware sample → shared tooling → TTPs → actor group → nation state. Nodes appear and lines connect.',
        suggestedName: 'attribution-web',
        tags: ['security', 'threat-intel', 'network'],
      },
      {
        id: 'vulnerability-card',
        name: 'Vulnerability Card',
        desc: 'CVE disclosure card: CVE ID, CVSS score badge, affected products, patch status, and exploit availability. Clean and informative.',
        suggestedName: 'vulnerability-card',
        tags: ['security', 'vulnerability', 'cve'],
      },
      {
        id: 'dark-web-chatter',
        name: 'Dark Web Chatter',
        desc: 'Chat bubbles appearing like a dark forum thread discussing a zero-day or breach. Usernames are anonymized handles.',
        suggestedName: 'dark-web-chatter',
        tags: ['security', 'darkweb', 'social'],
      },
      // Global & Scale
      {
        id: 'attack-origin-heatmap',
        name: 'Attack Origin Heatmap',
        desc: 'World map with heat intensity showing attack volume per country. Hot spots pulse and intensify as attack counts animate up.',
        suggestedName: 'attack-origin-heatmap',
        tags: ['security', 'global', 'map'],
      },
      {
        id: 'botnet-spread',
        name: 'Botnet Spread',
        desc: 'Nodes lighting up across a world map as infection spreads. Ripple effect propagates from patient zero outward.',
        suggestedName: 'botnet-spread',
        tags: ['security', 'malware', 'spread'],
      },
      {
        id: 'breach-counter',
        name: 'Breach Record Counter',
        desc: 'Live-style counter of records stolen ticking up fast. Large number dominates screen with "RECORDS COMPROMISED" label.',
        suggestedName: 'breach-counter',
        tags: ['security', 'breach', 'counter'],
      },
    ],
  },

  // ── FINANCE ───────────────────────────────────────────────────────────────
  'finance': {
    label: 'Finance',
    icon: 'TrendingUp',
    types: [
      {
        id: 'stock-ticker-strip',
        name: 'Stock Ticker Strip',
        desc: 'Scrolling stock price strip with symbol, price, and change %. Green/red color coding. Marquee scrolls continuously.',
        suggestedName: 'stock-ticker-strip',
        tags: ['finance', 'stocks', 'ticker'],
      },
      {
        id: 'portfolio-allocation',
        name: 'Portfolio Allocation',
        desc: 'Asset allocation donut chart with animated segments and percentage labels. Legend items reveal staggered on the right.',
        suggestedName: 'portfolio-allocation',
        tags: ['finance', 'portfolio', 'chart'],
      },
      {
        id: 'profit-loss-waterfall',
        name: 'Profit / Loss Waterfall',
        desc: 'Revenue → expenses cascade to net profit/loss. Green bars add, red bars subtract, final total bar animates last.',
        suggestedName: 'profit-loss-waterfall',
        tags: ['finance', 'pnl', 'waterfall'],
      },
      {
        id: 'kpi-financial-dashboard',
        name: 'Financial KPI Dashboard',
        desc: 'Multi-metric dashboard: revenue, EBITDA, margin %, YoY growth. Each KPI card pops in with value counter and trend arrow.',
        suggestedName: 'kpi-financial-dashboard',
        tags: ['finance', 'kpi', 'dashboard'],
      },
      {
        id: 'compound-interest-curve',
        name: 'Compound Interest Curve',
        desc: 'Exponential growth curve drawing on with principal vs interest area fills. "Your money at work" narrative annotation.',
        suggestedName: 'compound-interest-curve',
        tags: ['finance', 'investing', 'chart'],
      },
      {
        id: 'inflation-erosion',
        name: 'Inflation Erosion',
        desc: 'Purchasing power of $1000 shrinking over time. Bar or area chart shows real value declining with inflation rate overlay.',
        suggestedName: 'inflation-erosion',
        tags: ['finance', 'inflation', 'economics'],
      },
      {
        id: 'market-cap-treemap',
        name: 'Market Cap Treemap',
        desc: 'Companies/sectors sized by market cap in proportional blocks. Tiles scale in with company name and value labels.',
        suggestedName: 'market-cap-treemap',
        tags: ['finance', 'stocks', 'treemap'],
      },
      {
        id: 'interest-rate-gauge',
        name: 'Interest Rate Gauge',
        desc: 'Dial/gauge showing central bank rate level with historical context zones (low/normal/high). Needle sweeps to current rate.',
        suggestedName: 'interest-rate-gauge',
        tags: ['finance', 'rates', 'gauge'],
      },
      {
        id: 'cash-flow-sankey',
        name: 'Cash Flow Sankey',
        desc: 'Money flowing between accounts: income → taxes, savings, expenses → subcategories. Animated flow bands show proportions.',
        suggestedName: 'cash-flow-sankey',
        tags: ['finance', 'cashflow', 'sankey'],
      },
      {
        id: 'break-even-chart',
        name: 'Break-Even Chart',
        desc: 'Fixed costs, variable costs, and revenue lines drawing in. Intersection point highlights with callout "Break-Even Point".',
        suggestedName: 'break-even-chart',
        tags: ['finance', 'economics', 'chart'],
      },
      {
        id: 'asset-comparison-slope',
        name: 'Asset Comparison Slope',
        desc: 'Two assets compared over two time points via slope chart. Shows relative performance with labeled endpoints and % change.',
        suggestedName: 'asset-comparison-slope',
        tags: ['finance', 'comparison', 'slope'],
      },
      {
        id: 'debt-payoff-timeline',
        name: 'Debt Payoff Timeline',
        desc: 'Gantt/timeline showing loan balance decreasing over months. Principal vs interest split visible in stacked bars over time.',
        suggestedName: 'debt-payoff-timeline',
        tags: ['finance', 'debt', 'timeline'],
      },
      {
        id: 'earnings-reveal',
        name: 'Earnings Reveal',
        desc: 'Quarterly earnings announcement card: EPS actual vs estimate, revenue beat/miss, guidance. Numbers flip in with verdict badge.',
        suggestedName: 'earnings-reveal',
        tags: ['finance', 'earnings', 'reveal'],
      },
      {
        id: 'risk-return-scatter',
        name: 'Risk vs Return Scatter',
        desc: 'Asset classes plotted on risk (x) vs return (y) axes. Points animate in with labels, efficient frontier curve draws last.',
        suggestedName: 'risk-return-scatter',
        tags: ['finance', 'investing', 'scatter'],
      },
      {
        id: 'crypto-price-candles',
        name: 'Crypto Price Candles',
        desc: 'Crypto OHLC candlestick chart with volume bars below. Candles appear sequentially, bull/bear colors, support/resistance lines.',
        suggestedName: 'crypto-price-candles',
        tags: ['finance', 'crypto', 'candlestick'],
      },
    ],
  },
}

/**
 * Flat list of all types for search/lookup
 */
export function getAllTypes() {
  return Object.entries(ANIMATION_TYPES).flatMap(([catId, cat]) =>
    cat.types.map(t => ({ ...t, categoryId: catId, categoryLabel: cat.label }))
  )
}

/**
 * Find a type by id
 */
export function findType(id) {
  return getAllTypes().find(t => t.id === id) || null
}

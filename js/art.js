/* ===== Hình minh họa vector nội thất ô tô =====
   art(shape, màu, chất liệu, màu chỉ) -> data URI SVG
   shape: seat | wheel | floor | dash | headliner | trim
   chất liệu: leather (mặc định) | suede | star | carbon | wood | gloss
*/
const rgbOf = h => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
const shade = (h, p) => { const t = p < 0 ? 0 : 255, a = Math.abs(p); return "#" + rgbOf(h).map(v => Math.round((t - v) * a + v).toString(16).padStart(2, "0")).join(""); };
const lum = h => { const [r, g, b] = rgbOf(h); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; };

function art(shape, color = "#1f1f22", tex = "leather", thread) {
  const c = color, l = shade(c, .22), d = shade(c, -.3), dd = shade(c, -.55);
  const th = thread || (lum(c) < .45 ? "#c9a36b" : shade(c, -.5));
  const suede = tex === "suede" || tex === "star";
  const stitch = (p, w = 1.6) => `<path d="${p}" fill="none" stroke="${th}" stroke-width="${w}" stroke-dasharray="4 3" stroke-linecap="round"/>`;
  const grain = id => `<use href="#${id}" fill="#000" filter="url(#grain)"/>`;

  const defs = `<defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${l}"/><stop offset="1" stop-color="${d}"/></linearGradient>
    <linearGradient id="gx" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${l}"/><stop offset=".55" stop-color="${c}"/><stop offset="1" stop-color="${dd}"/></linearGradient>
    <radialGradient id="puff" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="${l}"/><stop offset=".65" stop-color="${c}"/><stop offset="1" stop-color="${d}"/></radialGradient>
    <radialGradient id="sh"><stop offset="0" stop-color="#000" stop-opacity=".32"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
    <linearGradient id="dark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3c3c40"/><stop offset="1" stop-color="#18181a"/></linearGradient>
    <linearGradient id="gloss" x1="0" y1="0" x2="1" y2="1"><stop offset=".3" stop-color="#fff" stop-opacity="0"/><stop offset=".45" stop-color="#fff" stop-opacity=".22"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <pattern id="q" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(45 200 200)">
      <rect width="26" height="26" fill="url(#puff)"/>
      <path d="M0 .5H26M.5 0V26" stroke="${dd}" stroke-opacity=".6" stroke-width="2"/>
      <path d="M0 2.2H26M2.2 0V26" stroke="${th}" stroke-width="1.1" stroke-dasharray="2.5 2.5"/>
    </pattern>
    <linearGradient id="cfa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(c, .28)}"/><stop offset="1" stop-color="${shade(c, -.45)}"/></linearGradient>
    <linearGradient id="cfb" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${shade(c, .28)}"/><stop offset="1" stop-color="${shade(c, -.45)}"/></linearGradient>
    <pattern id="cf" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45 200 200)">
      <rect width="10" height="10" fill="${dd}"/><rect width="5" height="5" fill="url(#cfa)"/><rect x="5" y="5" width="5" height="5" fill="url(#cfa)"/>
      <rect x="5" width="5" height="5" fill="url(#cfb)"/><rect y="5" width="5" height="5" fill="url(#cfb)"/>
    </pattern>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="${suede ? 1.4 : .9}" numOctaves="2" seed="4"/>
      <feColorMatrix values="0 0 0 0 ${suede ? 1 : 0}  0 0 0 0 ${suede ? 1 : 0}  0 0 0 0 ${suede ? 1 : 0}  0 0 0 ${suede ? .2 : .14} 0"/>
      <feComposite in2="SourceGraphic" operator="in"/></filter>
  </defs>`;

  /* Bề mặt theo chất liệu cho chi tiết nhựa / mặt phẳng */
  const surface = id => {
    if (tex === "carbon") return `<use href="#${id}" fill="url(#cf)"/>`;
    if (tex === "wood") {
      let lines = "";
      for (let i = 0; i < 22; i++) { const x = 70 + i * 12 + (i % 3) * 3; lines += `<path d="M${x} 20C${x + 9} 110 ${x - 9} 230 ${x + 5} 360" stroke="${dd}" stroke-opacity="${.25 + (i % 4) * .1}" stroke-width="${1 + (i % 3) * .7}" fill="none"/>`; }
      return `<use href="#${id}" fill="url(#gx)"/><clipPath id="cl"><use href="#${id}"/></clipPath><g clip-path="url(#cl)">${lines}</g>`;
    }
    if (tex === "gloss") return `<use href="#${id}" fill="url(#g)"/>`;
    return `<use href="#${id}" fill="url(#g)"/>${grain(id)}`;
  };

  /* Sao cho trần Starlight */
  const stars = () => {
    let s = 7, out = "";
    const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < 90; i++) {
      const y = 70 + rnd() * 240, inset = 22 * (y - 60) / 260, x = 70 + inset + rnd() * (260 - inset * 2);
      const r = .7 + rnd() * 1.6;
      out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="#fff" opacity="${(.45 + rnd() * .55).toFixed(2)}"/>`;
      if (r > 2) out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(r * 3).toFixed(1)}" fill="#cfe0ff" opacity=".12"/>`;
    }
    return out;
  };

  const shapes = {
    seat: `
      <ellipse cx="200" cy="374" rx="150" ry="15" fill="url(#sh)"/>
      <rect x="175" y="90" width="8" height="24" rx="3" fill="#a3a8ad"/><rect x="217" y="90" width="8" height="24" rx="3" fill="#a3a8ad"/>
      <rect id="hr" x="146" y="32" width="108" height="66" rx="27" fill="url(#g)"/>${grain("hr")}
      ${stitch("M171 44H229Q242 44 242 57V73Q242 86 229 86H171Q158 86 158 73V57Q158 44 171 44Z")}
      <path id="bk" d="M126 112Q126 104 140 104H260Q274 104 274 112L291 268Q293 290 271 290H129Q107 290 109 268Z" fill="url(#g)"/>${grain("bk")}
      <path id="bi" d="M161 118H239Q248 118 248 127L254 271Q254 280 245 280H155Q146 280 146 271L152 127Q152 118 161 118Z" fill="url(#q)"/>
      ${stitch("M161 118H239Q248 118 248 127L254 271Q254 280 245 280H155Q146 280 146 271L152 127Q152 118 161 118Z")}
      <path d="M134 120L119 266" stroke="${l}" stroke-width="7" stroke-linecap="round" opacity=".45"/>
      <path d="M266 120L281 266" stroke="${dd}" stroke-width="7" stroke-linecap="round" opacity=".35"/>
      <path id="cu" d="M104 300Q104 286 122 286H278Q296 286 296 300L308 340Q312 360 290 360H110Q88 360 92 340Z" fill="url(#g)"/>${grain("cu")}
      <path d="M152 292H248L257 352H143Z" fill="url(#q)"/>${stitch("M152 292H248L257 352H143Z")}
      <rect x="122" y="360" width="156" height="9" rx="4" fill="#232325"/>`,

    wheel: `
      <ellipse cx="200" cy="374" rx="130" ry="13" fill="url(#sh)"/>
      <path d="M68 186Q118 174 152 182L156 234Q118 240 72 234Z" fill="url(#dark)"/>
      <path d="M332 186Q282 174 248 182L244 234Q282 240 328 234Z" fill="url(#dark)"/>
      <path d="M176 262H224L217 334H183Z" fill="url(#dark)"/>
      <path d="M74 206L150 202M326 206L250 202" stroke="#a9aeb3" stroke-width="2"/>
      <rect x="96" y="213" width="15" height="10" rx="3" fill="#4b4b50"/><rect x="117" y="213" width="15" height="10" rx="3" fill="#4b4b50"/>
      <rect x="268" y="213" width="15" height="10" rx="3" fill="#4b4b50"/><rect x="289" y="213" width="15" height="10" rx="3" fill="#4b4b50"/>
      <path d="M140 168Q200 144 260 168L264 242Q200 274 136 242Z" fill="url(#dark)"/>
      <path d="M150 176Q200 158 250 176" stroke="#fff" stroke-opacity=".12" stroke-width="3" fill="none"/>
      <circle cx="200" cy="208" r="16" fill="none" stroke="#c3c7cb" stroke-width="4"/>
      <circle id="rim" cx="200" cy="200" r="148" fill="none" stroke="url(#gx)" stroke-width="36"/>
      <circle cx="200" cy="200" r="148" fill="none" stroke="#000" stroke-width="36" filter="url(#grain)"/>
      <path d="M187 52.6A148 148 0 0 1 213 52.6" stroke="#b3202a" stroke-width="36" fill="none"/>
      <circle cx="200" cy="200" r="135" fill="none" stroke="${th}" stroke-width="1.6" stroke-dasharray="3 3.5"/>
      <circle cx="200" cy="200" r="161" fill="none" stroke="${th}" stroke-width="1.6" stroke-dasharray="3 3.5"/>
      <path d="M65 122A156 156 0 0 1 134 59" stroke="#fff" stroke-opacity=".2" stroke-width="8" stroke-linecap="round" fill="none"/>`,

    floor: `
      <ellipse cx="200" cy="356" rx="165" ry="14" fill="url(#sh)"/>
      <path d="M112 120H288Q300 120 302 132L338 324Q340 346 318 346H82Q60 346 62 324L98 132Q100 120 112 120Z" fill="${dd}"/>
      <path id="mt" d="M112 104H288Q300 104 302 116L338 308Q340 330 318 330H82Q60 330 62 308L98 116Q100 104 112 104Z" fill="${d}" stroke="${l}" stroke-width="3"/>${grain("mt")}
      <path d="M121 117H279Q289 117 290 126L322 301Q323 316 309 316H91Q77 316 78 301L110 126Q111 117 121 117Z" fill="url(#q)"/>
      ${stitch("M121 117H279Q289 117 290 126L322 301Q323 316 309 316H91Q77 316 78 301L110 126Q111 117 121 117Z")}
      <rect x="222" y="236" width="76" height="60" rx="12" fill="#232325"/>
      <path d="M232 248H288M232 258H288M232 268H288M232 278H288M232 288H288" stroke="#3b3b3f" stroke-width="3"/>
      <rect x="178" y="296" width="44" height="12" rx="6" fill="#a9aeb3"/>`,

    dash: `
      <ellipse cx="200" cy="322" rx="185" ry="12" fill="url(#sh)"/>
      <path d="M40 160Q200 108 360 160L318 34H82Z" fill="#cdd7e1" opacity=".55"/>
      <path d="M20 170Q200 118 380 170L384 300Q200 284 16 300Z" fill="url(#dark)"/>
      <rect x="44" y="212" width="66" height="32" rx="9" fill="#121214"/><path d="M52 222H102M52 230H102M52 238H102" stroke="#2e2e32" stroke-width="2"/>
      <rect x="290" y="212" width="66" height="32" rx="9" fill="#121214"/><path d="M298 222H348M298 230H348M298 238H348" stroke="#2e2e32" stroke-width="2"/>
      <rect x="148" y="194" width="104" height="64" rx="9" fill="#0d0d0f"/><path d="M148 194H214L162 258H148Z" fill="#fff" opacity=".07"/>
      <path d="M150 272H250" stroke="#4a4a4f" stroke-width="3" stroke-linecap="round"/>
      <path id="tp" d="M34 168Q200 110 366 168L360 198Q200 146 40 198Z" fill="url(#g)"/>${grain("tp")}
      ${stitch("M44 172Q200 120 356 172")}${stitch("M48 191Q200 141 352 191")}`,

    headliner: `
      <path d="M30 40H370L344 352H56Z" fill="#26292d"/>
      <path d="M40 300L56 352H344L360 300Z" fill="#9fb2c3" opacity=".35"/>
      <path id="cl2" d="M62 64Q200 48 338 64L318 318Q200 330 82 318Z" fill="url(#g)"/>${grain("cl2")}
      ${tex === "star" ? stars() : ""}
      ${stitch("M150 58L140 322")}${stitch("M250 58L260 322")}
      <rect x="172" y="82" width="56" height="28" rx="9" fill="#e7e7e8"/><rect x="180" y="89" width="18" height="14" rx="3" fill="#fff6dc"/><rect x="202" y="89" width="18" height="14" rx="3" fill="#fff6dc"/>
      <path d="M72 126Q60 160 72 194M328 126Q340 160 328 194" stroke="#3a3a3e" stroke-width="7" fill="none" stroke-linecap="round"/>
      <rect x="94" y="272" width="92" height="36" rx="11" fill="${d}"/><rect x="214" y="272" width="92" height="36" rx="11" fill="${d}"/>
      <rect x="176" y="306" width="48" height="16" rx="6" fill="#1d1d20"/>`,

    trim: `
      <ellipse cx="200" cy="356" rx="150" ry="12" fill="url(#sh)"/>
      <path id="tr" d="M122 36H278Q300 36 302 58L320 318Q322 342 298 342H102Q78 342 80 318L98 58Q100 36 122 36Z"/>
      ${surface("tr")}
      <use href="#tr" fill="none" stroke="#c9ccd0" stroke-width="2.5"/>
      <rect x="146" y="74" width="108" height="118" rx="20" fill="#151517" stroke="#c9ccd0" stroke-width="2"/>
      <path d="M168 96Q200 86 232 96L226 176Q200 184 174 176Z" fill="#232326"/>
      <ellipse cx="200" cy="112" rx="24" ry="22" fill="url(#dark)"/><ellipse cx="194" cy="104" rx="8" ry="5" fill="#fff" opacity=".18"/>
      <circle cx="160" cy="262" r="30" fill="#141416" stroke="#c9ccd0" stroke-width="2"/><circle cx="240" cy="262" r="30" fill="#141416" stroke="#c9ccd0" stroke-width="2"/>
      <circle cx="160" cy="262" r="22" fill="#0b0b0c"/><circle cx="240" cy="262" r="22" fill="#0b0b0c"/>
      <use href="#tr" fill="url(#gloss)"/>`,
  };

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">${defs}${shapes[shape] || shapes.seat}</svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

// March 2025 (UPDATED 11/4/2025) Created by: Justin Linwood Ross
// MIT License: https://github.com/Blackstarproject/EXTREME-TRANSLATE
// Copyright (c) 2025 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

document.addEventListener('DOMContentLoaded', () => {

  // Three.js neon background 
  const canvas = document.getElementById('bg');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x030014, 0.02);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 2.2, 6);

  const hemi = new THREE.HemisphereLight(0x202038, 0x001020, 0.6);
  scene.add(hemi);

  const dir = new THREE.DirectionalLight(0xffffff, 0.5);
  dir.position.set(5, 10, 5);
  scene.add(dir);

  // Particles 
  const particleCount = 5000;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 40;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
  }

  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const pMat = new THREE.PointsMaterial({ color: 0xff3f00, size: 0.04, transparent: true, opacity: 0.9 });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  const neonLight = new THREE.PointLight(0xff00ff, 1.8, 40);
  neonLight.position.set(0, 4, 6);
  scene.add(neonLight);

  // Mouse trails 
  const trailPool = [];
  const poolSize = 500;
  for (let i = 0; i < poolSize; i++) {
    const g = new THREE.SphereGeometry(0.03, 8, 6);
    const m = new THREE.MeshBasicMaterial({ color: 0x9B4DB9, transparent: true, opacity: 0.95 });
    const mesh = new THREE.Mesh(g, m);
    mesh.visible = false;
    scene.add(mesh);
    trailPool.push(mesh);
  }
  let poolIndex = 0;

  function emitTrail(pos, size = 0.03, life = 420) {
    const m = trailPool[poolIndex % poolSize];
    poolIndex++;
    m.position.copy(pos);
    m.scale.setScalar(size);
    m.material.opacity = 0.95;
    m.visible = true;
    const start = performance.now();
    const id = setInterval(() => {
      const t = (performance.now() - start) / life;
      if (t >= 1) { m.visible = false; clearInterval(id); }
      else m.material.opacity = 0.95 * (1 - t);
    }, 60);
    return m;
  }

  // Lightning 
  const lightningGroup = new THREE.Group();
  scene.add(lightningGroup);

  function spawnLightningAt(worldPos, intensity = 1.0) {
    const segments = Math.floor(Math.random() * 5) + 4;
    const points = [];
    for (let i = 0; i < segments; i++) {
      const t = i / (segments - 1);
      points.push(new THREE.Vector3(
        worldPos.x + (Math.random() - 0.5) * 0.6 * (2.5 + t),
        worldPos.y - t * (1.2 + Math.random() * 1.4) + 0.75,
        worldPos.z + (Math.random() - 0.5) * 0.6 * (10 + t)
      ));
    }
    const geom = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color: 0xff0190, transparent: true, opacity: 0.95 * intensity });
    const line = new THREE.Line(geom, mat);
    lightningGroup.add(line);
    for (let i = 0; i < Math.floor(Math.random() * 4) + 3; i++) {
      const idx = Math.floor(Math.random() * points.length);
      const p = points[idx];
      emitTrail(new THREE.Vector3(p.x + Math.random() * 0.12 - 0.06, p.y + Math.random() * 0.12 - 0.06, p.z + Math.random() * 0.12 - 0.06), 0.02, 240 + Math.random() * 260);
    }
    const start = performance.now();
    const life = 220 + Math.random() * 380;
    (function fade() {
      const t = (performance.now() - start) / life;
      if (t >= 1) { lightningGroup.remove(line); geom.dispose(); mat.dispose(); }
      else { mat.opacity = 0.95 * (1 - t); requestAnimationFrame(fade); }
    })();
  }

  function rand(a, b) { return Math.random() * (b - a) + a; }
  function mouseToWorld(clientX, clientY, depth = 0.5) {
    const nx = (clientX / window.innerWidth) * 2 - 1;
    const ny = -(clientY / window.innerHeight) * 2 + 1;
    return new THREE.Vector3(nx, ny, depth).unproject(camera);
  }

  let last = { x: 0, y: 0, t: 0 };
  let mouseTarget = { x: 0, y: 2.1 };
  window.addEventListener('mousemove', e => {
    const pos = mouseToWorld(e.clientX, e.clientY, 0.45);
    for (let i = 0; i < Math.floor(rand(1, 3)); i++) {
      emitTrail(new THREE.Vector3(pos.x + rand(-0.02, 0.02), pos.y + rand(-0.02, 0.02), pos.z + rand(-0.02, 0.02)), rand(0.02, 0.05), 380 + Math.random() * 200);
    }
    const now = performance.now();
    const dx = Math.abs(e.clientX - last.x);
    const dy = Math.abs(e.clientY - last.y);
    const dt = Math.max(16, now - (last.t || now));
    const speed = Math.sqrt(dx * dx + dy * dy) / dt;
    if (speed > 0.4 && Math.random() < Math.min(speed * 1.8, 0.85)) {
      spawnLightningAt(pos, Math.min(1.6, speed * 1.6));
    }
    last.x = e.clientX; last.y = e.clientY; last.t = now;
    mouseTarget.x = (e.clientX / window.innerWidth - 0.5) * 1.2;
    mouseTarget.y = (0.5 - e.clientY / window.innerHeight) * 0.8 + 1.8;
  });

  function animate() {
    requestAnimationFrame(animate);
    const posArr = pGeo.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3 + 2;
      posArr[idx] += 0.0006 * (1 + Math.sin(performance.now() * 0.0001 + i));
      if (posArr[idx] > 40) posArr[idx] = -40;
    }
    pGeo.attributes.position.needsUpdate = true;
    camera.position.x += (mouseTarget.x - camera.position.x) * 0.03;
    camera.position.y += (mouseTarget.y - camera.position.y) * 0.03;
    camera.lookAt(0, 1.4, 0);
    renderer.render(scene, camera);
  }
  animate();

  // Ripples 
  const titleEl = document.getElementById('titleText');
  function createRipple(sizeClass = 'medium') {
    const r = document.createElement('div');
    r.className = `ripple ${sizeClass}`;
    titleEl.appendChild(r);
    setTimeout(() => r.remove(), 2200);
  }
  setInterval(() => { createRipple(['small', 'medium', 'large'][Math.floor(Math.random() * 3)]); }, 1100 + Math.random() * 400);

  // Translation 
  const inputText = document.getElementById('inputText');
  const translateBtn = document.getElementById('translateBtn');
  const outputText = document.getElementById('outputText');
  const detectedLangEl = document.getElementById('detectedLang');
  const countryNameEl = document.getElementById('country-name');
  const countryDescEl = document.getElementById('country-desc-text');
  const languageSelect = document.getElementById('languageSelect');

  // All 118 languages 
 const languages = [
  { code: 'af', name: 'Afrikaans' },
  { code: 'sq', name: 'Albanian' },
  { code: 'am', name: 'Amharic' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hy', name: 'Armenian' },
  { code: 'az', name: 'Azerbaijani' },
  { code: 'eu', name: 'Basque' },
  { code: 'be', name: 'Belarusian' },
  { code: 'bn', name: 'Bengali' },
  { code: 'bs', name: 'Bosnian' },
  { code: 'bg', name: 'Bulgarian' },
  { code: 'ca', name: 'Catalan' },
  { code: 'ceb', name: 'Cebuano' },
  { code: 'ny', name: 'Chichewa' },
  { code: 'zh-CN', name: 'Chinese (Simplified)' },
  { code: 'zh-TW', name: 'Chinese (Traditional)' },
  { code: 'co', name: 'Corsican' },
  { code: 'hr', name: 'Croatian' },
  { code: 'cs', name: 'Czech' },
  { code: 'da', name: 'Danish' },
  { code: 'nl', name: 'Dutch' },
  { code: 'en', name: 'English' },
  { code: 'eo', name: 'Esperanto' },
  { code: 'et', name: 'Estonian' },
  { code: 'tl', name: 'Filipino' },
  { code: 'fi', name: 'Finnish' },
  { code: 'fr', name: 'French' },
  { code: 'fy', name: 'Frisian' },
  { code: 'gl', name: 'Galician' },
  { code: 'ka', name: 'Georgian' },
  { code: 'de', name: 'German' },
  { code: 'el', name: 'Greek' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'ht', name: 'Haitian Creole' },
  { code: 'ha', name: 'Hausa' },
  { code: 'haw', name: 'Hawaiian' },
  { code: 'he', name: 'Hebrew' },
  { code: 'hi', name: 'Hindi' },
  { code: 'hmn', name: 'Hmong' },
  { code: 'hu', name: 'Hungarian' },
  { code: 'is', name: 'Icelandic' },
  { code: 'ig', name: 'Igbo' },
  { code: 'id', name: 'Indonesian' },
  { code: 'ga', name: 'Irish' },
  { code: 'it', name: 'Italian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'jw', name: 'Javanese' },
  { code: 'kn', name: 'Kannada' },
  { code: 'kk', name: 'Kazakh' },
  { code: 'km', name: 'Khmer' },
  { code: 'rw', name: 'Kinyarwanda' },
  { code: 'ko', name: 'Korean' },
  { code: 'ku', name: 'Kurdish (Kurmanji)' },
  { code: 'ky', name: 'Kyrgyz' },
  { code: 'lo', name: 'Lao' },
  { code: 'la', name: 'Latin' },
  { code: 'lv', name: 'Latvian' },
  { code: 'lt', name: 'Lithuanian' },
  { code: 'lb', name: 'Luxembourgish' },
  { code: 'mk', name: 'Macedonian' },
  { code: 'mg', name: 'Malagasy' },
  { code: 'ms', name: 'Malay' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'mt', name: 'Maltese' },
  { code: 'mi', name: 'Maori' },
  { code: 'mr', name: 'Marathi' },
  { code: 'mn', name: 'Mongolian' },
  { code: 'my', name: 'Myanmar (Burmese)' },
  { code: 'ne', name: 'Nepali' },
  { code: 'no', name: 'Norwegian' },
  { code: 'or', name: 'Odia' },
  { code: 'ps', name: 'Pashto' },
  { code: 'fa', name: 'Persian' },
  { code: 'pl', name: 'Polish' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'ro', name: 'Romanian' },
  { code: 'ru', name: 'Russian' },
  { code: 'sm', name: 'Samoan' },
  { code: 'gd', name: 'Scots Gaelic' },
  { code: 'sr', name: 'Serbian' },
  { code: 'st', name: 'Sesotho' },
  { code: 'sn', name: 'Shona' },
  { code: 'sd', name: 'Sindhi' },
  { code: 'si', name: 'Sinhala' },
  { code: 'sk', name: 'Slovak' },
  { code: 'sl', name: 'Slovenian' },
  { code: 'so', name: 'Somali' },
  { code: 'es', name: 'Spanish' },
  { code: 'su', name: 'Sundanese' },
  { code: 'sw', name: 'Swahili' },
  { code: 'sv', name: 'Swedish' },
  { code: 'tg', name: 'Tajik' },
  { code: 'ta', name: 'Tamil' },
  { code: 'tt', name: 'Tatar' },
  { code: 'te', name: 'Telugu' },
  { code: 'th', name: 'Thai' },
  { code: 'tr', name: 'Turkish' },
  { code: 'tk', name: 'Turkmen' },
  { code: 'uk', name: 'Ukrainian' },
  { code: 'ur', name: 'Urdu' },
  { code: 'ug', name: 'Uyghur' },
  { code: 'uz', name: 'Uzbek' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'cy', name: 'Welsh' },
  { code: 'xh', name: 'Xhosa' },
  { code: 'yi', name: 'Yiddish' },
  { code: 'yo', name: 'Yoruba' },
  { code: 'zu', name: 'Zulu' }
];


  // Populate selector, English first
  languageSelect.innerHTML = '';
  const enOption = languages.find(l => l.code === 'en');
  if (enOption) {
    const opt = document.createElement('option'); opt.value = enOption.code; opt.textContent = enOption.name;
    languageSelect.appendChild(opt);
  }
  languages.filter(l => l.code !== 'en').forEach(l => {
    const opt = document.createElement('option'); opt.value = l.code; opt.textContent = l.name;
    languageSelect.appendChild(opt);
  });

  // langToCountry mapping 
  const langToCountry = {
  af: 'ZA', sq: 'AL', am: 'ET', ar: 'AE', hy: 'AM', az: 'AZ', eu: 'ES', be: 'BY',
  bn: 'BD', bs: 'BA', bg: 'BG', ca: 'ES', ceb: 'PH', ny: 'MW', 'zh-CN': 'CN', 'zh-TW': 'TW',
  co: 'FR', hr: 'HR', cs: 'CZ', da: 'DK', nl: 'NL', en: 'GB', eo: 'PL', et: 'EE',
  tl: 'PH', fi: 'FI', fr: 'FR', fy: 'NL', gl: 'ES', ka: 'GE', de: 'DE', el: 'GR',
  gu: 'IN', ht: 'HT', ha: 'NG', haw: 'US', he: 'IL', hi: 'IN', hmn: 'US', hu: 'HU',
  is: 'IS', ig: 'NG', id: 'ID', ga: 'IE', it: 'IT', ja: 'JP', jw: 'ID', kn: 'IN',
  kk: 'KZ', km: 'KH', rw: 'RW', ko: 'KR', ku: 'TR', ky: 'KG', lo: 'LA', la: 'VA',
  lv: 'LV', lt: 'LT', lb: 'LU', mk: 'MK', mg: 'MG', ms: 'MY', ml: 'IN', mt: 'MT',
  mi: 'NZ', mr: 'IN', mn: 'MN', my: 'MM', ne: 'NP', no: 'NO', or: 'IN', ps: 'AF',
  fa: 'IR', pl: 'PL', pt: 'PT', pa: 'IN', ro: 'RO', ru: 'RU', sm: 'WS', gd: 'GB',
  sr: 'RS', st: 'LS', sn: 'ZW', sd: 'PK', si: 'LK', sk: 'SK', sl: 'SI', so: 'SO',
  es: 'ES', su: 'ID', sw: 'TZ', sv: 'SE', tg: 'TJ', ta: 'IN', tt: 'RU', te: 'IN',
  th: 'TH', tr: 'TR', tk: 'TM', uk: 'UA', ur: 'PK', ug: 'CN', uz: 'UZ', vi: 'VN',
  cy: 'GB', xh: 'ZA', yi: 'DE', yo: 'NG', zu: 'ZA'
};


  // Danger Levels 
 const dangerLevels = {
  "Afghanistan":"High","Albania":"Moderate","Algeria":"Moderate","Andorra":"Low","Angola":"Moderate",
  "Argentina":"Moderate","Armenia":"Low","Australia":"Low","Austria":"Low","Azerbaijan":"Moderate",
  "Bahamas":"Low","Bahrain":"Low","Bangladesh":"Moderate","Barbados":"Low","Belarus":"Moderate",
  "Belgium":"Low","Belize":"Low","Benin":"Moderate","Bhutan":"Low","Bolivia":"Moderate",
  "Bosnia and Herzegovina":"Moderate","Brazil":"Moderate","Brunei":"Low","Bulgaria":"Low","Burkina Faso":"High",
  "Burundi":"High","Cambodia":"Moderate","Cameroon":"High","Canada":"Low","Chad":"High",
  "Chile":"Low","China":"Low","Colombia":"Moderate","Comoros":"Moderate","Costa Rica":"Low",
  "Croatia":"Low","Cuba":"Low","Cyprus":"Low","Czech Republic":"Low","Democratic Republic of the Congo":"High",
  "Denmark":"Low","Djibouti":"Moderate","Dominica":"Low","Dominican Republic":"Low","East Timor":"Moderate",
  "Ecuador":"Low","Egypt":"Moderate","El Salvador":"Moderate","Equatorial Guinea":"Moderate","Eritrea":"High",
  "Estonia":"Low","Eswatini":"Low","Ethiopia":"Moderate","Fiji":"Low","Finland":"Low",
  "France":"Low","Gabon":"Moderate","Gambia":"Low","Georgia":"Low","Germany":"Low",
  "Ghana":"Moderate","Greece":"Low","Grenada":"Low","Guatemala":"Moderate","Guinea":"High",
  "Guinea-Bissau":"High","Guyana":"Moderate","Haiti":"High","Honduras":"High","Hungary":"Low",
  "Iceland":"Low","India":"Moderate","Indonesia":"Moderate","Iran":"High","Iraq":"High",
  "Ireland":"Low","Israel":"Low","Italy":"Low","Ivory Coast":"High","Jamaica":"Moderate",
  "Japan":"Low","Jordan":"Moderate","Kazakhstan":"Low","Kenya":"Moderate","Kiribati":"Low",
  "Kosovo":"Low","Kuwait":"Low","Kyrgyzstan":"Moderate","Laos":"Moderate","Latvia":"Low",
  "Lebanon":"High","Lesotho":"Moderate","Liberia":"High","Libya":"High","Liechtenstein":"Low",
  "Lithuania":"Low","Luxembourg":"Low","Madagascar":"Moderate","Malawi":"Moderate","Malaysia":"Low",
  "Maldives":"Low","Mali":"High","Malta":"Low","Marshall Islands":"Low","Mauritania":"High",
  "Mauritius":"Low","Mexico":"Moderate","Micronesia":"Low","Moldova":"Moderate","Monaco":"Low",
  "Mongolia":"Low","Montenegro":"Low","Morocco":"Low","Mozambique":"High","Myanmar":"High",
  "Namibia":"Low","Nauru":"Low","Nepal":"Moderate","Netherlands":"Low","New Zealand":"Low",
  "Nicaragua":"Moderate","Niger":"High","Nigeria":"High","North Korea":"High","North Macedonia":"Moderate",
  "Norway":"Low","Oman":"Low","Pakistan":"High","Palau":"Low","Panama":"Low",
  "Papua New Guinea":"High","Paraguay":"Moderate","Peru":"Moderate","Philippines":"Moderate","Poland":"Low",
  "Portugal":"Low","Qatar":"Low","Republic of the Congo":"Moderate","Romania":"Low","Russia":"Moderate",
  "Rwanda":"Moderate","Saint Kitts and Nevis":"Low","Saint Lucia":"Low","Saint Vincent and the Grenadines":"Low","Samoa":"Low",
  "San Marino":"Low","Sao Tome and Principe":"Low","Saudi Arabia":"Moderate","Senegal":"Moderate","Serbia":"Moderate",
  "Seychelles":"Low","Sierra Leone":"High","Singapore":"Low","Slovakia":"Low","Slovenia":"Low",
  "Solomon Islands":"Moderate","Somalia":"High","South Africa":"Moderate","South Korea":"Low","South Sudan":"High",
  "Spain":"Low","Sri Lanka":"Moderate","Sudan":"High","Suriname":"Moderate","Sweden":"Low",
  "Switzerland":"Low","Syria":"High","Taiwan":"Low","Tajikistan":"Moderate","Tanzania":"Moderate",
  "Thailand":"Low","Togo":"Moderate","Tonga":"Low","Trinidad and Tobago":"Low","Tunisia":"Low",
  "Turkey":"Moderate","Turkmenistan":"Moderate","Tuvalu":"Low","Uganda":"Moderate","Ukraine":"Moderate",
  "United Arab Emirates":"Low","United Kingdom":"Low","United States":"Low","Uruguay":"Low","Uzbekistan":"Moderate",
  "Vanuatu":"Low","Vatican City":"Low","Venezuela":"High","Vietnam":"Low","Yemen":"High",
  "Zambia":"Moderate","Zimbabwe":"Moderate"
};


  // Fetch country info 
  async function getCountryInfo(countryCode) {
    try {
      const res = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
      const data = await res.json();
      const c = data[0];
      return {
        name: c.name.common,
        flag: c.flags.svg,
        region: c.region,
        population: c.population.toLocaleString(),
        capital: c.capital ? c.capital[0] : 'N/A',
        danger: dangerLevels[c.name.common] || 'Moderate'
      };
    } catch (e) { console.error(e); return null; }
  }

  // Translate Button
  translateBtn.addEventListener('click', async () => {
    const text = inputText.value.trim();
    const target = languageSelect.value;
    if (!text) { alert('Enter text'); return; }
    if (!target) { alert('Select language'); return; }
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      const translated = data[0].map(t => t[0]).join('');
      outputText.textContent = translated;

      // Detected language
      const detectedLang = data[2] || 'en';
      detectedLangEl.textContent = detectedLang;

      // Speech synthesis
      const utter = new SpeechSynthesisUtterance(translated);
      const voices = speechSynthesis.getVoices();
      const voiceMatch = voices.find(v => v.lang.startsWith(target));
      if (voiceMatch) utter.voice = voiceMatch;
      utter.lang = target;
      speechSynthesis.speak(utter);

      // Country info based on detected language
      const countryCode = langToCountry[detectedLang] || 'GB';
      const countryData = await getCountryInfo(countryCode);
      if (countryData) {
        countryNameEl.innerHTML = `<img src="${countryData.flag}" alt="${countryData.name} flag" style="width:32px;vertical-align:middle;margin-right:6px;"> ${countryData.name}`;
        countryDescEl.innerHTML = `<p>${countryData.name} is in ${countryData.region}. Capital: ${countryData.capital}. Population: ${countryData.population}.</p><p><strong>Danger Level:</strong> ${countryData.danger}</p>`;
      }
    } catch (e) { console.error(e); alert('Translation failed'); }
  });

});

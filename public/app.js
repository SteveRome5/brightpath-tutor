/* Gallop Learning Academy SPA, vanilla JS, zero build step */
'use strict';

// Storage shim: when the browser blocks localStorage (Safari "Block all cookies",
// managed school devices, some private modes) the bare accessor THROWS at load time
// and the whole app would white-screen. Shadow it with an in-memory stand-in so the
// app runs normally — settings just don't persist across reloads in that mode.
(() => {
  try { window.localStorage.getItem('__probe__'); } catch (e) {
    const mem = {};
    const shim = {
      getItem(k) { return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; },
      setItem(k, v) { mem[k] = String(v); },
      removeItem(k) { delete mem[k]; },
      clear() { for (const k of Object.keys(mem)) delete mem[k]; },
      get length() { return Object.keys(mem).length; },
      key(i) { return Object.keys(mem)[i] ?? null; }
    };
    // Bracket-style access (localStorage['bp_x'] = '1') must work too:
    const proxied = new Proxy(shim, {
      get(t, p) { if (p in t) return t[p]; return Object.prototype.hasOwnProperty.call(mem, p) ? mem[p] : undefined; },
      set(t, p, v) { mem[p] = String(v); return true; },
      deleteProperty(t, p) { delete mem[p]; return true; }
    });
    try { Object.defineProperty(window, 'localStorage', { value: proxied, configurable: true }); } catch (e2) { /* very old engines: fall through */ }
  }
})();

// ======================= tiny helpers =======================
const $ = sel => document.querySelector(sel);
const app = () => $('#app');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function toast(msg) {
  document.querySelectorAll('.gallop-toast').forEach(t => t.remove());
  const t = document.createElement('div');
  t.className = 'gallop-toast'; t.textContent = msg;
  t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite');
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 3800);
}
// Toast with an inline action button (e.g. an Undo). Stays a little longer so a child has
// time to reverse a tap — nothing they do should ever feel like a one-way trap.
function toastAction(msg, actionLabel, onAction) {
  document.querySelectorAll('.gallop-toast').forEach(t => t.remove());
  const t = document.createElement('div');
  t.className = 'gallop-toast';
  t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite');
  const span = document.createElement('span'); span.textContent = msg + ' ';
  const btn = document.createElement('button'); btn.className = 'toast-action'; btn.textContent = actionLabel;
  btn.onclick = () => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); try { onAction(); } catch (e) {} };
  t.appendChild(span); t.appendChild(btn);
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 7000);
}

async function api(path, opts = {}) {
  const res = await fetch('/api' + path, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) { const e = new Error(data.error || 'Request failed'); e.status = res.status; e.data = data; throw e; }
  return data;
}

const AVATARS = { fox: '🦊', panda: '🐼', dragon: '🐉', unicorn: '🦄', robot: '🤖', astronaut: '🧑‍🚀', tiger: '🐯', octopus: '🐙', axolotl: '🦎', narwhal: '🦭', phoenix: '🐦‍🔥', alien: '👽' };
const ITEM_EMOJI = { crown: '👑', tophat: '🎩', cap: '🧢', party: '🥳', grad: '🎓', cowboy: '🤠', halo: '😇', headphones: '🎧', flower: '🌺', helmet: '⛑️', santa: '🎅', glasses: '👓', sunglasses: '🕶️', bowtie: '🎀', medal: '🏅', guitar: '🎸', wand: '🪄', skateboard: '🛹', trophy: '🏆', books: '📚', soccer: '⚽', controller: '🎮', rainbow: '🌈', space: '🌌', beach: '🏖️', castle: '🏰', volcano: '🌋', city: '🌆', garden: '🌻', sunset: '🌅', winter: '❄️', spooky: '🎃', holiday: '🎄', pup: '🐶', kitten: '🐱', bunny: '🐰', turtle: '🐢', butterfly: '🦋', dino: '🦕', sloth: '🦥', owl: '🦉', hamster: '🐹', parrot: '🦜', pony: '🐴' };
// Render a kid's customized avatar (base + hat + accessory + pet + background)
function avatarHTML(k) {
  // A custom uploaded photo (older kids) wins over the built-in emoji avatar.
  if (k && k.avatar_img) return `<span class="av-wrap av-photo-wrap"><img class="av-photo" src="${k.avatar_img}" alt="avatar" loading="lazy"></span>`;
  const cfg = (k && k.avatar_config) || {};
  const base = AVATARS[cfg.base || (k && k.avatar)] || '🦊';
  const bg = cfg.bg && cfg.bg !== 'purple' ? ITEM_EMOJI[cfg.bg] || '' : '';
  const hat = cfg.hat && cfg.hat !== 'none' ? ITEM_EMOJI[cfg.hat] || '' : '';
  const acc = cfg.accessory && cfg.accessory !== 'none' ? ITEM_EMOJI[cfg.accessory] || '' : '';
  const pet = cfg.pet && cfg.pet !== 'none' ? ITEM_EMOJI[cfg.pet] || '' : '';
  return `<span class="av-wrap">${bg ? `<span class="av-bg">${bg}</span>` : ''}<span class="av-base">${base}</span>${hat ? `<span class="av-hat">${hat}</span>` : ''}${acc ? `<span class="av-acc">${acc}</span>` : ''}${pet ? `<span class="av-pet">${pet}</span>` : ''}</span>`;
}
// The Gallop track, our horse IS the progress bar 🐎
function gallopTrack(pct, label) {
  pct = Math.max(0, Math.min(100, pct));
  const flags = [25, 50, 75].map(f => `<span class="g-flag ${pct >= f ? 'passed' : ''}" style="left:${f}%">⭐</span>`).join('');
  return `<div class="gallop-wrap">${label ? `<span class="gallop-label">${esc(label)}</span>` : ''}<div class="gallop-rail"></div><div class="gallop-done" style="width:${pct}%"></div>${flags}<span class="g-finish">🎯</span><span class="gallop-horse ${pct >= 100 ? 'finished' : ''}" style="left:${Math.min(pct, 98)}%">🐎</span></div>`;
}
const SUBJECT_STYLE = {
  math: { color: '#6C5CE7', emoji: '🔢', cheer: 'Math Mission' },
  english: { color: '#00B894', emoji: '📚', cheer: 'Word Quest' },
  science: { color: '#0984E3', emoji: '🔬', cheer: 'Lab Time' },
  spanish: { color: '#E17055', emoji: '🌎', cheer: 'Spanish Adventure' }
};
const PRAISE = ['¡Fantástico!', 'Nailed it!', 'You’re on fire! 🔥', 'Brain power!', 'Boom! Correct!', 'Genius move!', 'Crushed it!', 'Superstar!'];
const ENCOURAGE = ['Almost! Every mistake grows your brain 🧠', 'Good try. Let’s look at why:', 'So close! Here’s the trick:', 'No worries, even scientists mess up every day!'];
const PRAISE_TEEN = ['Correct.', 'Nice, exactly right.', 'Clean solve.', 'That’s it.', 'Solid work.', 'Right on the first read.'];
const ENCOURAGE_TEEN = ['Not quite. Here’s the reasoning:', 'Close. The key detail:', 'Let’s walk through it:', 'Off by a step. Here’s where:'];

// XP ranks, every learner climbs the stable, Foal to Thoroughbred 🏇
const RANKS = [['Foal', 0], ['Pony Pal', 100], ['Trotter', 250], ['Canterer', 500], ['Galloper', 1000], ['Trailblazer', 2000], ['Champion', 4000], ['Legend', 8000], ['Thoroughbred', 15000]];
function rankFor(xp) {
  let cur = RANKS[0], next = null;
  for (const r of RANKS) { if (xp >= r[1]) cur = r; else { next = r; break; } }
  return { name: cur[0], at: cur[1], next: next ? { name: next[0], at: next[1] } : null };
}

// "Why am I learning this?" — answered on questions, tied to the SPECIFIC concept, and
// varied on purpose. Each concept bucket carries many lines across different angles
// (everyday use, critical thinking / not being fooled, a surprising fact, a real career)
// so the connection feels deliberate and fresh, never a cookie-cutter "a job values this".
// `default` is a broad-but-genuine fallback used only when no concept bucket matches, so a
// learner always gets a real reason — and it rotates too. Young = playful & concrete; teen = mature.
const WHY_TOPICS = {
  math: {
    default: {
      young: ['Every time you share, count, or measure, that\'s math working for you! ✨', 'Math is the secret behind games, sports, cooking, and money! 🎮', 'Being quick with numbers means nobody can trick you!'],
      teen: ['Almost every "is this a good deal?" moment is secretly math you can do in your head.', 'Being fluent with numbers means no salesperson, ad, or fine print can fool you.', 'Math is less about answers and more about spotting the pattern nobody else sees.']
    },
    buckets: [
      { match: /shape|geometr|area|perimeter|angle|symmetr|volume|coordinate|polygon/i,
        young: ['Builders use shapes to make houses and bridges stand up strong! 🏗️', 'Artists and game designers build whole worlds out of shapes! 🎮', 'Folding paper into cool stuff (origami) is geometry! 🦢'],
        teen: ['Every building you\'ve stood in stayed up because someone got the geometry right.', 'Video-game worlds, 3D printers, and animation are geometry rendered in real time.', 'Pool players, pilots, and surgeons all think in angles.', 'Area and volume decide how much paint, concrete, or pizza you actually need to buy.', 'Architecture, CAD, and product design are literally geometry as a career.'] },
      { match: /money|coin|cent|dollar|change|budget|profit/i,
        young: ['This is how you make sure you get the right change at the store! 🪙', 'Kids who run lemonade stands use this to count their profit! 🍋', 'Saving a little each week adds up to something big! 🐷'],
        teen: ['A budget is just subtraction with your name on it — and it\'s the difference between stress and freedom.', 'Compound interest is why saving at 18 instead of 28 can mean six figures more later — the math of getting wealthy slowly.', 'Credit-card companies bet on people NOT doing this math. Do it, and you keep your money.', 'Every founder, investor, and shopper lives in these numbers whether they notice or not.'] },
      { match: /percent|interest|discount|tax|ratio|proportion/i,
        young: ['Sales signs use percents, they show how much money you save! 🏷️', 'Sharing things fairly uses ratios, like 2 cookies each! 🍪'],
        teen: ['"40% off, then 25% more off" is NOT 65% off — knowing why keeps you from being tricked.', 'Percent is the language of tips, taxes, interest, and every statistic you\'ll ever read.', 'Ratios are how you compare fairly: miles per gallon, price per ounce, wins per game.', 'Mixing fuel, medicine doses, and recipes are all ratios where getting it wrong has real consequences.'] },
      { match: /clock|time|calendar|schedule|elapsed/i,
        young: ['Reading clocks means you always know when the fun starts! ⏰', 'Pilots and train drivers read time like this to keep everyone safe! 🚂'],
        teen: ['Time zones, deadlines, and schedules run every adult\'s life; time-math is daily survival.', 'A NASA mission is planned to the second — but so is catching a connecting flight.'] },
      { match: /fraction|divid|division|equal parts|share/i,
        young: ['Sharing pizza fairly with friends IS fractions! 🍕', 'Chefs split recipes with fractions every single day! 👩‍🍳'],
        teen: ['Doubling or halving a recipe is fractions — mess it up and dinner is ruined.', 'Fractions are how you split a bill, a paycheck, or a business fairly.', 'Musicians read rhythm as fractions: whole notes, halves, quarters, eighths. 🎵'] },
      { match: /graph|data|chart|probab|statist|mean|median|average|odds/i,
        young: ['Sports announcers use stats like these during every game! 🏀', 'Weather forecasters use data to guess rain or shine! ⛅'],
        teen: ['Reading a chart correctly means no headline, poll, or ad can fool you with a misleading graph.', 'Averages hide as much as they reveal — knowing mean vs median is a built-in lie detector.', 'Probability is how doctors weigh risks, insurers set prices, and smart people bet.', 'Data science is one of the best-paid careers on earth, and it\'s built on exactly this.'] },
      { match: /measur|length|weight|unit|metric|liquid volume/i,
        young: ['Carpenters measure twice and cut once, just like this! 📏', 'Bakers measure ingredients so cookies come out perfect! 🍪'],
        teen: ['A $125-million NASA orbiter was lost because two teams mixed up metric and imperial units.', 'Cooking, construction, and chemistry all fail fast if the measurements are off.', 'Every recipe, prescription, and blueprint is measurement you can\'t fake.'] },
      { match: /algebra|equation|variable|expression|slope|linear|function|solve for/i,
        young: ['Solving for the missing number is like being a math detective! 🔍', 'A letter that stands for a mystery number is a puzzle to crack! 🧩'],
        teen: ['Algebra is just "solve for the unknown" — the exact move behind every spreadsheet, app, and engineering plan.', 'A variable is a box holding a number you don\'t know yet; all of coding is moving those boxes.', 'Every "how much do I need to…" question in adult life is secretly an equation.', 'Functions are cause-and-effect in math form: put something in, get something predictable out.'] },
      { match: /negative|integer|opposite|below zero|signed number|absolute value/i,
        young: ['Temperatures below zero and steps below ground use negative numbers! 🌡️', 'Losing points in a game can take your score below zero!'],
        teen: ['Negative numbers track debt, temperature below zero, elevation below sea level, and a losing streak.', 'Your bank balance, a thermostat, and a game score can all drop below zero — same math.'] },
      { match: /logarithm|\blog\b|exponent|exponential|power of|scientific notation/i,
        young: ['Exponents show how things grow really, REALLY fast! 📈', 'Fold a paper in half 10 times and it\'s taller than you, that\'s exponents!'],
        teen: ['Exponential growth is why a rumor, a virus, or a savings account can explode — the math humans are famously bad at feeling.', 'Earthquakes (Richter), sound (decibels), and pH are all logarithmic scales — reading them is reading the world.', 'Every "going viral" chart is an exponential curve.'] },
      { match: /decimal|round|place value|estimat/i,
        young: ['Money uses decimals, dollars and cents! 💵', 'Rounding helps you guess an answer super fast! ⚡'],
        teen: ['Rounding well is how you sanity-check any calculator answer in one second.', 'Every price, lab measurement, and GPS coordinate lives in decimals.', 'Estimating first is how engineers catch a 10× mistake before it ships.'] },
      { match: /calcul|deriv|integral|trigonom|\bsine\b|cosine|precalc|limit/i,
        young: ['This is the math that sends rockets to space! 🚀'],
        teen: ['Calculus is the math of change — how fast, how much, when it peaks. It runs physics, economics, and AI.', 'Trigonometry turns triangles into GPS, music, animation, and every wave you can\'t see.', 'The models behind weather, markets, and self-driving cars are calculus under the hood.'] }
    ]
  },
  english: {
    default: {
      young: ['Words are how your great ideas travel to other people! 📚', 'Reading and writing well makes EVERY other subject easier! 🚀', 'The more words you know, the more you can say exactly what you mean!'],
      teen: ['You can\'t reason with words you don\'t have — language is the tool your thinking is made of.', 'Every email, application, and post is you, arriving before you do. Make it sharp.', 'The person who reads closely and writes clearly quietly wins meetings, exams, and arguments.']
    },
    buckets: [
      { match: /noun|verb|adjective|adverb|pronoun|interject|preposition|conjunction|part of speech|parts of speech/i,
        young: ['Words have jobs, like players on a team, and each job builds an awesome sentence! ⚽', 'Action words (verbs) make your story MOVE! 🏃', 'Describing words paint pictures in a reader\'s mind! 🎨'],
        teen: ['One misplaced word can flip a sentence\'s meaning — knowing the parts is how you say exactly what you mean, and catch when someone else doesn\'t.', 'Comedians, songwriters, and ad-writers pick parts of speech on purpose: an interjection ("Boom!") lands harder than a full sentence.', 'Every search engine, autocomplete, and AI parses parts of speech to understand you — you\'re learning what machines had to be taught.', 'Strong writers break grammar rules on purpose, but only once they know exactly which part they\'re bending, and why.', 'Naming how a sentence works is the difference between "that sounds off" and "I can fix it."'] },
      { match: /punctuat|comma|capital|sentence|clause|fragment|run-on|subject.?verb/i,
        young: ['A period is a tiny STOP sign that tells readers to take a breath! 🛑', 'Question marks let your reader hear you asking! ❓', 'Capital letters give names and sentences their crown! 👑'],
        teen: ['A comma can change everything: "Let\'s eat, Grandma" vs "Let\'s eat Grandma."', 'Text someone with zero punctuation and watch the confusion — you already know this matters.', 'Contracts, code, and legal filings can turn on a single semicolon. Precision pays.', 'Screenwriters use sentence rhythm — short. punchy. fragments — to control how a scene feels.', 'Good punctuation is invisible; bad punctuation makes readers quietly stop trusting you.'] },
      { match: /read|comprehen|main idea|detail|inference|summar|context|theme|sequence/i,
        young: ['Good readers are like detectives hunting for clues in every story! 🕵️', 'Finding the BIG idea is like spotting the treasure on a map! 🗺️'],
        teen: ['Inference — reading what ISN\'T said — is how you catch a lie, a sales trick, or a hidden agenda.', 'Every "terms and conditions" you\'ll ever sign rewards careful reading and punishes skimming.', 'Doctors, detectives, and coders all do the same move: gather details, infer the cause.', 'Close reading is your best defense against misinformation — you see what a headline leaves out.'] },
      { match: /vocab|word|synonym|antonym|prefix|suffix|root|homophone|multiple meaning/i,
        young: ['Knowing lots of words helps you say EXACTLY what you mean!', 'Word detectives can crack ANY new word they meet! 🔍', 'Prefixes are word LEGO, snap "un-" on "happy" and flip the meaning! 🧱'],
        teen: ['Break a word into its parts (pre-, -dict, -able) and you can decode words you\'ve never seen — a cheat code for language.', 'A bigger vocabulary literally lets you think more precise thoughts.', 'Writers choose "sprinted" over "ran" on purpose — precise words control the picture in a reader\'s head.', 'Half of learning any science, trade, or job is just learning its vocabulary.'] },
      { match: /writ|essay|paragraph|thesis|organiz|topic sentence|narrative|inform/i,
        young: ['Every movie, game, and book you love started with someone writing it well! ✍️', 'Organizing your ideas is like packing a backpack, everything easy to find! 🎒'],
        teen: ['Writing is thinking made visible — if you can\'t write it clearly, you don\'t fully understand it yet.', 'A clear one-paragraph pitch has launched companies and won scholarships.', 'Structure beats talent: a well-organized B+ argument beats a brilliant mess every time.', 'AI can generate words, but knowing what GOOD writing IS — that\'s the human edge that stays valuable.'] },
      { match: /argument|evidence|persua|rhetoric|claim|bias|author|opinion|fact|point of view/i,
        young: ['Telling a good reason from a bad one keeps you smart and safe! 🕵️', 'Convincing people with GOOD reasons is a real superpower! 💬'],
        teen: ['Spotting a weak argument means ads, headlines, and "influencers" can\'t fool you.', 'Knowing the persuasion tricks is the best defense against having them used on you.', 'Recognizing bias — including your own — is the rarest, most valuable thinking skill there is.', 'The gap between an opinion and a claim you can back up is the gap between noise and influence.'] },
      { match: /figurativ|metaphor|simile|idiom|poet|imagery|symbol|hyperbole|personif/i,
        young: ['Similes paint pictures, "busy as a bee" shows more than "very busy"! 🐝', 'Idioms are fun word-puzzles hiding in everyday talk! 🧩'],
        teen: ['Metaphor isn\'t decoration — it\'s how humans explain new ideas ("the cloud," "a computer virus," "a market crash").', 'Every song lyric, brand slogan, and great speech runs on figurative language.', 'Idioms are cultural passwords; knowing them is how you sound like an insider anywhere.', 'Poetry trains you to pack maximum meaning into minimum words — the exact skill behind a caption that goes viral.'] }
    ]
  },
  science: {
    default: {
      young: ['Scientists ask "why?" just like you, that\'s how everything gets invented! 🔬', 'Knowing how the world works makes you the smartest explorer around! 🌍', 'Science is just careful curiosity, and you\'ve got plenty!'],
      teen: ['Science isn\'t a pile of facts — it\'s a method for not fooling yourself, which is a life skill.', 'Understanding how things actually work is how you tell real breakthroughs from clickbait and scams.', 'Every technology you use was, at some point, a science question someone chose to chase.']
    },
    buckets: [
      { match: /animal|plant|habitat|body|sense|living|organ|digest|skeleton|muscle/i,
        young: ['Doctors and vets use this science to help people and pets! 🩺', 'Knowing how living things work makes you a nature explorer! 🌍'],
        teen: ['Understanding how a body works is the first step to keeping yours healthy — and to careers in medicine, sports, and nutrition.', 'Knowing how living systems work helps you tell real health facts from health scams.', 'Every doctor, vet, and trainer started by learning exactly this.'] },
      { match: /cell|dna|genetic|biolog|microb|heredity|trait|evolution/i,
        young: ['Everything alive is built from cells, even YOU! 🧬', 'Tiny cells team up to make your whole body work! 💪'],
        teen: ['CRISPR, vaccines, and cancer research all start with the cell and DNA you\'re learning now.', 'Understanding DNA is how you\'ll make sense of ancestry tests, genetic risk, and the biotech boom.', 'Genetics is why you look like your family — and how doctors predict and prevent disease.'] },
      { match: /matter|solid|liquid|gas|chemi|mix|element|atom|molecul|reaction|acid/i,
        young: ['Chefs use this science, heat, mixing, freezing, every time they cook! 👩‍🍳', 'Ice, water, and steam are the same stuff wearing different outfits! 💧'],
        teen: ['Chemistry explains cooking, cleaning, batteries — and why mixing certain cleaners is dangerous.', 'Every material in your phone was chosen by someone who understood matter.', 'Knowing a chemical reaction from a physical change is the difference between a chef and a chemist — and sometimes a safe kitchen.'] },
      { match: /weather|space|earth|planet|rock|water cycle|climate zone|moon|star|solar/i,
        young: ['Weather scientists use this to tell you when to grab an umbrella! ☔', 'Astronauts study this to explore space! 🚀'],
        teen: ['Reading weather and climate data is how societies plan for storms, droughts, and the food supply.', 'Space and Earth science are hiring the generation that masters this — satellites, climate, exploration.', 'The water cycle you\'re learning decides droughts, floods, and where cities can even exist.'] },
      { match: /force|motion|energy|electric|magnet|physic|gravity|friction|wave|light|sound|heat/i,
        young: ['Roller coaster designers use this to make rides thrilling AND safe! 🎢', 'Push, pull, zoom, that\'s forces in action! 🛝'],
        teen: ['Every rocket, EV, roller coaster, and power grid runs on these exact principles.', 'Physics is why a seatbelt saves you and a well-built bridge doesn\'t fall — common sense with numbers.', 'Understanding energy is how you\'ll judge real solutions to the biggest problem of your lifetime: power.'] },
      { match: /ecosystem|environment|climate|conserv|food chain|biome|pollut|sustain/i,
        young: ['Park rangers use this to protect animals and forests! 🌲', 'Every plant and animal has a job on nature\'s team! 🐝'],
        teen: ['Reading how ecosystems balance is how we tackle the defining challenge — and job market — of your generation.', 'Every choice from farming to energy depends on understanding these systems.', 'Knowing how a food chain collapses is knowing why one small change can ripple across a whole planet.'] },
      { match: /scientif|experiment|hypothes|method|observ|evidence|variable|data|predict/i,
        young: ['Scientists guess, test, and try again, that\'s how discoveries happen! 🔬'],
        teen: ['Hypothesis, test, revise — this is the single best defense against being fooled, by others or by yourself.', 'Understanding evidence beats believing headlines. That\'s a life skill, not just a science one.', 'Every claim you\'ll ever weigh — medical, financial, political — comes back to "where\'s the evidence?"'] }
    ]
  },
  spanish: {
    default: {
      young: ['¡Hola! Every Spanish word is a new friend you can make! 🌎', 'Speaking two languages literally makes your brain stronger! 🧠', 'You could travel and feel at home in so many places! ✈️'],
      teen: ['Learning a language literally rewires your brain for better focus and memory — that\'s proven, not a pep talk.', 'Over 500 million people speak Spanish; every word is access to more of the world.', 'Bilingual professionals out-earn monolingual peers in nearly every field.']
    },
    buckets: [
      { match: /greeting|hola|phrase|conversa|introduc|question/i,
        young: ['You could say hi and make a new friend anywhere in the world! 🌎', 'Travelers use these words to feel at home in new places! ✈️'],
        teen: ['A warm greeting in someone\'s own language opens doors that business and diplomacy can\'t.', 'The first sentence you speak in Spanish is the moment a stranger decides to help you — or not.'] },
      { match: /family|animal|food|color|number|body|clothes|house|weather|vocab|noun/i,
        young: ['You could order tacos or name your pet in Spanish! 🌮', 'Every new word is a new door to another culture! 🚪'],
        teen: ['Everyday vocabulary is the foundation of real fluency — and fluency is a career multiplier.', 'The U.S. has 40+ million Spanish speakers; bilingual means twice the community you can reach.'] },
      { match: /verb|ser|estar|tense|preterite|subjunctive|grammar|conjugat|present|past|future/i,
        young: ['Verbs let you tell stories about what everyone is doing! 🎭'],
        teen: ['Mastering verbs is the leap from "tourist Spanish" to real conversation — the difference employers pay for.', 'Verb tenses are how you talk about yesterday, today, and your plans — the whole timeline of a life.'] }
    ]
  }
};
// Avoid showing the same "why" twice in a row per subject, so it never reads as a loop.
const _lastWhy = {};
function pickWhy(subject, pool) {
  if (!pool || !pool.length) return '';
  if (pool.length === 1) return pool[0];
  let pick, tries = 0;
  do { pick = pool[Math.floor(Math.random() * pool.length)]; tries++; } while (pick === _lastWhy[subject] && tries < 6);
  _lastWhy[subject] = pick;
  return pick;
}
function whyLine(subject, skillName) {
  // Tie the "real world" line to THIS concept when we can (deliberate, specific); otherwise use
  // a broad-but-genuine subject fallback — never an unrelated line, and never the same one twice.
  const T = WHY_TOPICS[subject];
  if (!T) return '';
  const teen = !playful();
  const hit = skillName ? T.buckets.find(b => b.match.test(skillName)) : null;
  let pool = null;
  if (hit) pool = teen ? (hit.teen && hit.teen.length ? hit.teen : hit.young) : (hit.young && hit.young.length ? hit.young : hit.teen);
  else if (T.default) pool = teen ? T.default.teen : T.default.young;
  return pickWhy(subject, pool);
}
// ---- age-adaptive themes: the app grows up with the student ----
function themeForGrade(g) { return g <= 2 ? 'junior' : g <= 5 ? 'explorer' : g <= 8 ? 'scholar' : 'academy'; }
function applyTheme() {
  document.body.dataset.theme = State.me.role === 'kid' ? themeForGrade(State.me.kid.grade) : 'pro';
}
function playful() { const t = document.body.dataset.theme; return t === 'junior' || t === 'explorer'; }
// Whether to reveal the child's grade-level placement TO THE CHILD. Off by default so a kid who
// places below their grade never sees it; the parent opts in per learner. Parents always see the
// real level in the report — this only governs what the child themselves is shown.
function showLevel() { try { return !!(State.me && State.me.kid && State.me.kid.show_level); } catch (e) { return false; } }
// Parent toggle: is the Play Zone arcade available to this child? Defaults ON (only 0 turns it off).
function gamesOn() { try { return !(State.me && State.me.kid && State.me.kid.games_enabled === 0); } catch (e) { return true; } }
// Parent "earn it" gate: number of questions the child must answer today before games unlock (0 = none).
function gamesGate() { try { return Math.max(0, Number((State.me && State.me.kid && State.me.kid.games_gate) || 0)); } catch (e) { return 0; } }
function gamesAnsweredToday() { try { return Math.max(0, Number((State.me && State.me.kid && State.me.kid.answered_today) || 0)); } catch (e) { return 0; } }
// Parent daily time cap (minutes). game_seconds_today is how much game time was tracked today.
function gamesTimeLimitMin() { try { return Math.max(0, Number((State.me && State.me.kid && State.me.kid.games_time_limit) || 0)); } catch (e) { return 0; } }
function gameSecondsToday() { try { return Math.max(0, Number((State.me && State.me.kid && State.me.kid.game_seconds_today) || 0)); } catch (e) { return 0; } }
function gamesTimeExhausted() { return gamesTimeLimitMin() > 0 && gameSecondsToday() >= gamesTimeLimitMin() * 60; }
// Games are actually playable when the arcade is on, the earn-it gate (if set) is met, AND the
// daily time cap (if set) has not been reached.
function gamesUnlocked() { return gamesOn() && (gamesGate() <= 0 || gamesAnsweredToday() >= gamesGate()) && !gamesTimeExhausted(); }
function gamesRemaining() { return Math.max(0, gamesGate() - gamesAnsweredToday()); }

// ---- game-time clock: a VISIBLE countdown while a game is open, with heads-up warnings, plus
// server persistence for the parent daily cap. Only shows when a daily limit is actually set, so
// nothing ever shuts off without the child watching it come. ----
let _gameClock = null, _gameAccum = 0, _gameRemaining = null, _gameWarned = {};
function startGameClock() {
  if (_gameClock) return;
  const limitS = gamesTimeLimitMin() * 60;
  _gameRemaining = limitS > 0 ? Math.max(0, limitS - gameSecondsToday()) : null;  // null = no cap → no countdown
  _gameAccum = 0; _gameWarned = {};
  _renderGameClock();
  _gameClock = setInterval(_gameClockSecond, 1000);
}
async function _gameClockSecond() {
  // Persist the seconds actually played to the server every 30s (so closing/reopening keeps count).
  _gameAccum++;
  if (_gameAccum >= 30) { _postGameSeconds(_gameAccum); _gameAccum = 0; }
  if (_gameRemaining == null) return;                       // no cap → just persist, no visible clock
  _gameRemaining = Math.max(0, _gameRemaining - 1);
  _updateGameClock();
  // Gentle, escalating heads-up so it's never a surprise.
  if (_gameRemaining === 300 && !_gameWarned[300]) { _gameWarned[300] = 1; toast('⏰ 5 minutes of game time left today!'); }
  if (_gameRemaining === 60  && !_gameWarned[60])  { _gameWarned[60]  = 1; toast('⏰ 1 minute left — find a good stopping point!'); }
  if (_gameRemaining === 30  && !_gameWarned[30])  { _gameWarned[30]  = 1; toast('⏰ 30 seconds of game time left!'); }
  if (_gameRemaining <= 0) {
    if (_gameClock) { clearInterval(_gameClock); _gameClock = null; }
    _removeGameClock();
    await _postGameSeconds(_gameAccum); _gameAccum = 0;     // make the server total reflect the full time BEFORE we leave/refresh
    if (State.me && State.me.kid) State.me.kid.game_seconds_today = Math.max(gameSecondsToday(), gamesTimeLimitMin() * 60);
    if ((location.hash || '').startsWith('#game')) location.hash = '#play';  // #play shows the friendly "that's your game time for today" screen
  }
}
async function _postGameSeconds(secs) {
  if (secs <= 0 || !kidId()) return;
  try { const r = await api(`/play/${kidId()}/tick`, { method: 'POST', body: { seconds: secs } }); if (r && State.me && State.me.kid) State.me.kid.game_seconds_today = r.seconds_today; } catch (e) {}
}
function stopGameClock() {
  if (!_gameClock) return;
  clearInterval(_gameClock); _gameClock = null;
  _postGameSeconds(_gameAccum); _gameAccum = 0;             // best-effort final partial persist
  _removeGameClock();
}
function _renderGameClock() {
  if (_gameRemaining == null) { _removeGameClock(); return; }
  if (!document.getElementById('game-clock')) { const el = document.createElement('div'); el.id = 'game-clock'; document.body.appendChild(el); }
  _updateGameClock();
}
function _updateGameClock() {
  const el = document.getElementById('game-clock'); if (!el || _gameRemaining == null) return;
  const m = Math.floor(_gameRemaining / 60), s = _gameRemaining % 60;
  el.textContent = '⏰ ' + m + ':' + String(s).padStart(2, '0');
  el.className = _gameRemaining <= 60 ? 'gclock danger' : _gameRemaining <= 300 ? 'gclock warn' : 'gclock';
}
function _removeGameClock() { const el = document.getElementById('game-clock'); if (el) el.remove(); }
// Leaving any game screen stops the clock (time only accrues inside #game/...).
window.addEventListener('hashchange', () => { if (!(location.hash || '').startsWith('#game')) stopGameClock(); });

// --- Analytics: push funnel events to Google Tag Manager's dataLayer. GTM (container
// GTM-N5F65TST) picks these up as triggers and forwards them to GA4 (or any tag) as
// conversions. Fully guarded: if GTM/dataLayer isn't present, these are harmless no-ops.
function gtmPush(obj) { try { window.dataLayer = window.dataLayer || []; window.dataLayer.push(obj); } catch (e) {} }
const PLAN_PRICE = { solo: 34, family: 54 };

// ======================= sound engine =======================
const Sound = (() => {
  let ctx, master, muted = localStorage.bp_muted === '1';
  function ac() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = 0.85; master.connect(ctx.destination);
    }
    return ctx;
  }
  // One clean voice: a soft attack (no digital click), gentle exponential release, and an
  // optional warm low-pass so nothing sounds harsh. Everything routes through a master gain
  // so the whole SFX bed sits at a consistent, polite level.
  function tone(freq, t0, dur, type = 'sine', gain = 0.12, filt = 0) {
    if (muted) return;
    const c = ac(), o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.value = freq;
    const t = c.currentTime + t0; let node = o;
    if (filt) { const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = filt; f.Q.value = 0.6; o.connect(f); node = f; }
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.012);            // soft attack
    g.gain.exponentialRampToValueAtTime(0.0008, t + dur);            // smooth release
    node.connect(g).connect(master);
    o.start(t); o.stop(t + dur + 0.06);
  }
  return {
    correct() { tone(659, 0, .14, 'sine', .12, 2600); tone(880, .09, .17, 'sine', .11, 2800); tone(1319, .19, .3, 'triangle', .09, 3200); },
    wrong() { tone(392, 0, .15, 'sine', .07, 1300); tone(311, .14, .22, 'sine', .06, 1100); },
    click() { tone(880, 0, .045, 'sine', .05, 3000); },
    levelup() { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * .1, .28, 'triangle', .1, 3400)); tone(1568, .52, .5, 'sine', .07, 3600); },
    badge() { tone(880, 0, .12, 'sine', .1, 3000); tone(1175, .12, .17, 'sine', .1, 3200); tone(1568, .26, .38, 'triangle', .09, 3600); },
    get muted() { return muted; },
    toggle() { muted = !muted; localStorage.bp_muted = muted ? '1' : '0'; return muted; },
    ctx: ac
  };
})();

// ======================= background music (procedural, not stock) =======================
// A gentle generative soundtrack built live with Web Audio, a warm pad, a soft
// arpeggio, and the occasional bell over a slow chord loop. Two moods: a chill
// lo-fi vibe for older learners, a brighter playful one for the littles. It only
// plays in the FUN zones (arcade, avatar, snacks, trophies) so lessons stay focused.
const Music = (() => {
  // Real little songs, generated live: a soft, dark chord bed, a gentle bass, and a
  // COMPOSED, hummable melody played on a *plucked* mallet voice (music box / marimba /
  // bells / soft e-piano) — never a sustained reed/"recorder" tone, never random notes —
  // bathed in light reverb. Each track has its OWN instrument, key and tempo, so pressing
  // Next Track is clearly a different song. Two moods: bright & bouncy for younger kids, a
  // calm lo-fi set for teens. Plays only in the FUN zones so lessons stay focused. OFF by default.
  let on = localStorage.bp_music === '1';
  let ctx = null, dry = null, wet = null, verb = null, timer = null, group = 'playful', playing = false;
  let track = null, trackIdx = 0, bar = 0;
  const semis = (root, s) => root * Math.pow(2, s / 12);
  // melody note = [semitoneFromKeyRoot, startBeat, durBeats]; pentatonic degrees only, so
  // every note stays consonant over the diatonic chords. Loop = `bars` bars (4 beats each).
  const TRACKS = {
    // ---------- playful (kids): bright, plucky, fun — each a different instrument ----------
    sunbeam:  { root: 261.63, beat: 340, bars: 4, drums: true,  voice: 'box',     filt: 2600, swing: .08,
      chords: [[0,4,7],[-5,-1,2],[-3,0,4],[-7,-3,0]], bass: [0,-5,-3,-7],
      mel: [[7,0,1],[9,1,.5],[12,1.5,.5],[9,2,1],[7,3,.5], [4,4,1.5],[7,5.5,.5],[9,6,2],
            [12,8,1],[9,9,1],[7,10,1],[9,11,1], [7,12,1],[4,13,.5],[2,13.5,.5],[0,14,2]] },
    bounce:   { root: 174.61, beat: 300, bars: 4, drums: true,  voice: 'marimba', filt: 1500, swing: .14,
      chords: [[0,4,7],[5,9,12],[-3,0,4],[2,5,9]], bass: [0,5,-3,2],
      mel: [[0,0,.5],[4,.5,.5],[7,1,.5],[9,1.5,.5],[7,2,1],[4,3,1], [5,4,1],[9,5,1],[7,6,2],
            [9,8,.5],[12,8.5,.5],[9,9,1],[7,10,1],[4,11,1], [2,12,1],[4,13,1],[0,14,2]] },
    skiprope: { root: 196.00, beat: 322, bars: 4, drums: true,  voice: 'bells',   filt: 3000, swing: .16,
      chords: [[0,4,7],[-5,-1,2],[2,5,9],[-3,0,4]], bass: [0,-5,2,-3],
      mel: [[9,0,.5],[7,.5,.5],[4,1,1],[7,2,.5],[9,2.5,.5],[11,3,1], [12,4,1],[9,5,1],[7,6,1],[4,7,1],
            [7,8,.5],[9,8.5,.5],[12,9,1],[11,10,1],[9,11,1], [7,12,2],[9,14,2]] },
    // ---------- chill (teens): calm, warm lo-fi ----------
    driftwood:{ root: 220.00, beat: 500, bars: 4, drums: false, voice: 'epiano',  filt: 1100, swing: 0,
      chords: [[0,3,7],[-2,2,5],[-4,0,3],[-2,2,5]], bass: [0,-2,-4,-2],
      mel: [[7,0,2],[5,2,1],[3,3,1], [5,4,2],[10,6,2], [7,8,1.5],[5,9.5,.5],[3,10,2], [3,12,1],[5,13,1],[0,14,2]] },
    dusk:     { root: 196.00, beat: 540, bars: 4, drums: false, voice: 'epiano',  filt: 980,  swing: 0,
      chords: [[0,3,7],[-4,0,3],[-9,-5,-2],[-2,2,5]], bass: [0,-4,-9,-2],
      mel: [[10,0,2],[7,2,2], [5,4,1.5],[7,5.5,.5],[10,6,2], [12,8,2],[10,10,1],[7,11,1], [5,12,2],[0,14,2]] },
    lantern:  { root: 174.61, beat: 480, bars: 4, drums: true,  voice: 'marimba', filt: 1200, swing: .06,
      chords: [[0,3,7],[3,7,10],[-2,2,5],[-4,0,3]], bass: [0,3,-2,-4],
      mel: [[7,0,1.5],[10,1.5,.5],[7,2,2], [3,4,1],[5,5,1],[7,6,2], [10,8,1.5],[7,9.5,.5],[5,10,2], [3,12,2],[0,14,2]] }
  };
  const PLAYLIST = { playful: ['sunbeam', 'bounce', 'skiprope'], chill: ['driftwood', 'dusk', 'lantern'] };
  // small warm reverb (generated impulse) so notes bloom instead of beep
  function makeVerb() {
    const len = Math.floor(ctx.sampleRate * 1.8), buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = buf.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    const c = ctx.createConvolver(); c.buffer = buf; return c;
  }
  // one PLUCKED mallet voice: percussive attack + exponential decay (music box / marimba /
  // bell / e-piano). The fast attack + decay is what makes it read as a real struck
  // instrument instead of a held reed. A bright partial adds mallet "sparkle"; marimba adds
  // a warm sub for body. Each style picks its own waveform, brightness and decay length.
  function pluck(freq, t, dur, gain, style, filtHz) {
    let wave = 'triangle', bright = 3, brightGain = 0.30, decay = dur, atk = 0.004, subGain = 0;
    if (style === 'box')          { wave = 'triangle'; bright = 3; brightGain = 0.45; decay = Math.min(dur, 1.1); }        // music box: glassy bell
    else if (style === 'bells')   { wave = 'sine';     bright = 4; brightGain = 0.60; decay = Math.min(dur, 1.4); }        // glockenspiel: sparkly
    else if (style === 'marimba') { wave = 'sine';     bright = 2; brightGain = 0.28; decay = Math.min(dur, 0.55); subGain = 0.5; } // warm wood, quick
    else if (style === 'epiano')  { wave = 'triangle'; bright = 2; brightGain = 0.16; decay = dur * 0.9; atk = 0.006; }    // mellow electric piano
    const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    o.type = wave; o.frequency.value = freq;
    f.type = 'lowpass'; f.frequency.value = filtHz || 1600; f.Q.value = 0.6;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(gain, t + atk);
    g.gain.exponentialRampToValueAtTime(0.0006, t + decay);
    o.connect(f).connect(g); g.connect(dry); if (wet) g.connect(wet);
    o.start(t); o.stop(t + decay + 0.05);
    if (brightGain) {
      const o2 = ctx.createOscillator(), g2 = ctx.createGain();
      o2.type = 'sine'; o2.frequency.value = freq * bright;
      g2.gain.setValueAtTime(0.0001, t);
      g2.gain.linearRampToValueAtTime(gain * brightGain, t + atk);
      g2.gain.exponentialRampToValueAtTime(0.0005, t + decay * 0.6);
      o2.connect(g2); g2.connect(dry); if (wet) g2.connect(wet);
      o2.start(t); o2.stop(t + decay + 0.05);
    }
    if (subGain) {
      const o3 = ctx.createOscillator(), g3 = ctx.createGain();
      o3.type = 'sine'; o3.frequency.value = freq / 2;
      g3.gain.setValueAtTime(0.0001, t);
      g3.gain.linearRampToValueAtTime(gain * subGain, t + atk);
      g3.gain.exponentialRampToValueAtTime(0.0005, t + decay * 0.7);
      o3.connect(g3); g3.connect(dry);
      o3.start(t); o3.stop(t + decay + 0.05);
    }
  }
  // soft, dark, quiet sustained pad — the chord/bass BED under the melody. Deliberately
  // low and low-pass filtered so it's felt as warmth, never heard as a competing "reed".
  function pad(freq, t, dur, gain, filtHz, detune) {
    const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    o.type = 'triangle'; o.frequency.value = freq; if (detune) o.detune.value = detune;
    f.type = 'lowpass'; f.frequency.value = filtHz || 780; f.Q.value = 0.4;
    const a = Math.min(0.16, dur * 0.3);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(gain, t + a);
    g.gain.setValueAtTime(gain, t + dur * 0.6);
    g.gain.exponentialRampToValueAtTime(0.0005, t + dur + 0.1);
    o.connect(f).connect(g); g.connect(dry); if (wet) g.connect(wet);
    o.start(t); o.stop(t + dur + 0.15);
  }
  let _noise = null;
  function noiseBuf() { if (_noise) return _noise; const b = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate); const d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return (_noise = b); }
  function kick(t) { try { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(46, t + 0.11); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.2, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0006, t + 0.17); o.connect(g).connect(dry); o.start(t); o.stop(t + 0.2); } catch (e) {} }
  function shaker(t, gain) { try { const s = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter(); s.buffer = noiseBuf(); f.type = 'bandpass'; f.frequency.value = 5200; f.Q.value = 0.8; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(gain, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0004, t + 0.05); s.connect(f).connect(g).connect(dry); s.start(t); s.stop(t + 0.07); } catch (e) {} }
  function pick() { const list = PLAYLIST[group] || PLAYLIST.playful; track = TRACKS[list[trackIdx % list.length]]; trackIdx++; bar = 0; }
  function schedule() {
    if (!playing) return;
    const M = track, beat = M.beat / 1000, t0 = ctx.currentTime + 0.06, b = bar % M.bars;
    const chord = M.chords[b];
    // soft dark pad bed + gentle bass
    chord.forEach((s, i) => pad(semis(M.root, s), t0, beat * 3.7, 0.036, 760, i === 0 ? -5 : 6));
    pad(semis(M.root / 2, M.bass[b]), t0, beat * 2.0, 0.10, 340, 0);
    pad(semis(M.root / 2, M.bass[b] + 7), t0 + beat * 2, beat * 1.6, 0.055, 320, 0);
    // plucked mallet melody on top — clear, hummable, percussive
    const barStart = b * 4, barEnd = barStart + 4;
    for (const nt of M.mel) {
      const s = nt[0], st = nt[1], d = nt[2];
      if (st >= barStart && st < barEnd) {
        const sw = (Math.floor(st * 2) % 2 === 1) ? (M.swing || 0) * beat : 0;
        const tt = t0 + (st - barStart) * beat + sw, dd = d * beat;
        pluck(semis(M.root * 2, s), tt, dd, 0.15, M.voice, M.filt);
      }
    }
    if (M.drums) { kick(t0); kick(t0 + beat * 2); shaker(t0 + beat, 0.03); shaker(t0 + beat * 3, 0.035); }
    bar++;
    if (bar % (M.bars * 2) === 0) pick();   // fresh tune every 2 loops for variety
    timer = setTimeout(schedule, M.beat * 4);
  }
  function start(which) {
    if (!on) return;
    if (which && which !== group) { group = which; trackIdx = 0; if (playing) pick(); }
    else group = which || group;
    try {
      ctx = Sound.ctx();
      if (ctx.state === 'suspended') ctx.resume();
      if (!dry) {
        dry = ctx.createGain(); dry.gain.value = 0; dry.connect(ctx.destination);
        try { verb = makeVerb(); wet = ctx.createGain(); wet.gain.value = 0.5; wet.connect(verb); verb.connect(dry); } catch (e) { wet = null; }
      }
      dry.gain.cancelScheduledValues(ctx.currentTime);
      dry.gain.setValueAtTime(dry.gain.value, ctx.currentTime);
      dry.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 1.6);   // sits gently behind gameplay
      if (!playing) { playing = true; bar = 0; pick(); schedule(); }
    } catch (e) {}
  }
  function stop() {
    if (!playing) return;
    try { if (dry) { dry.gain.cancelScheduledValues(ctx.currentTime); dry.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.7); } } catch (e) {}
    playing = false;
    if (timer) { clearTimeout(timer); timer = null; }
  }
  return {
    start, stop,
    get on() { return on; },
    get nowPlaying() { const list = PLAYLIST[group] || []; return list[(trackIdx - 1 + list.length) % list.length]; },
    skip() { if (playing) { pick(); bar = 0; } },
    toggle(currentMood) { on = !on; localStorage.bp_music = on ? '1' : '0'; if (on) start(currentMood); else stop(); return on; }
  };
})();

// ======================= voice (read-aloud) =======================
const Voice = (() => {
  let pref = localStorage.bp_autoread; // '1' on, '0' off, undefined = smart default
  // Pick the most natural-sounding voice the device offers. Modern browsers ship true
  // neural voices ("Natural"/"Neural"/"Online") that sound far less robotic than the old
  // built-ins, so we score every available voice and take the best rather than the first.
  let _voiceCache = {};
  function bestVoice(lang) {
    if (_voiceCache[lang || 'en']) return _voiceCache[lang || 'en'];
    const voices = speechSynthesis.getVoices();
    if (!voices.length) return null;
    const base = (lang || 'en').split('-')[0].toLowerCase();
    const pool = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith(base));
    if (!pool.length) return null;
    const score = v => {
      const n = (v.name || '').toLowerCase(); let s = 0;
      if (/natural|neural|online/.test(n)) s += 100;              // true neural TTS = most natural
      if (/enhanced|premium|siri/.test(n)) s += 60;               // enhanced Apple/iOS voices
      if (/aria|jenny|ava|emma|libby|sonia|samantha|serena|allison|nicky|zoe|joanna|salli/.test(n)) s += 40; // known warm, friendly voices
      if (/google/.test(n)) s += 25;
      if (/female/.test(n)) s += 12;
      // Accent: strongly prefer American English and steer AWAY from British/Australian/
      // Indian/South-African voices when the app asked for en-US (parents flagged a
      // British-sounding narrator). Region match matters more than a nice voice name.
      if (v.lang) {
        const vl = v.lang.toLowerCase(), want = (lang || '').toLowerCase();
        if (vl === want) s += 70;                                  // exact (en-US) wins big
        else if (want.startsWith('en') && /en[-_](gb|au|in|za|ie|nz)/.test(vl)) s -= 90; // wrong English accent
        else if (want.startsWith('en') && vl.startsWith('en')) s += 8;
      }
      if (/\b(uk|british|daniel|arthur|kate|serena|oliver|george|rishi|malcolm|karen|catherine|matilda|lee)\b/.test(n) && (lang || '').toLowerCase().startsWith('en-us')) s -= 60; // named UK/AU voices
      // Spanish lessons deserve a real native voice, not an English voice reading Spanish.
      // Reward known-good Spanish voices and neural Spanish, and gently favor the mainstream
      // Latin-American / Castilian accents US learners hear in class.
      if ((lang || '').toLowerCase().startsWith('es')) {
        const vlx = (v.lang || '').toLowerCase();
        if (/spanish|espa|mónica|monica|paulina|jorge|juan|diego|sabina|helena|dalia|elena|laura|lucia|lucía|penelope|penélope|miguel|carlos|marisol|angelica|angélica/.test(n)) s += 45;
        if (/es[-_](es|mx|us|419|la|co|ar)/.test(vlx)) s += 22;    // native Spanish accents
        if (/google.*(español|espanol)|español|espanol/.test(n)) s += 30;
      }
      if (v.localService === false) s += 30;                       // networked = the consistent neural voices
      if (/robot|zarvox|albert|bad ?news|bells|trinoids|whisper|cellos|organ|good ?news|jester|superstar|boing|bahh|bubbles|deranged|hysterical|wobble|pipe/.test(n)) s -= 200; // novelty/robotic voices
      return s;
    };
    const best = pool.slice().sort((a, b) => score(b) - score(a))[0] || pool[0];
    _voiceCache[lang || 'en'] = best;
    return best;
  }
  // voices load asynchronously on some browsers; clear the cache when they arrive
  try { speechSynthesis.addEventListener('voiceschanged', () => { _voiceCache = {}; }); } catch (e) {}
  function speak(text, lang) {
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/[🍎⭐🐤🎈🚗🐞🍓🐟🍪🐸\u{1F300}-\u{1FAFF}]/gu, ''));
      // Little kids get a bouncy, upbeat storyteller voice; teens get a calm natural one.
      const young = (() => { try { return State.me && State.me.kid && State.me.kid.grade <= 5; } catch (e) { return false; } })();
      // Warm and clear, not chipmunky. A gentle lift for littles, natural for older kids.
      u.rate = young ? 0.95 : 1.0;
      u.pitch = young ? 1.1 : 1.0;
      u.volume = 1;
      if (lang) u.lang = lang;
      const v = bestVoice(lang || 'en-US');
      if (v) u.voice = v;
      speechSynthesis.speak(u);
    } catch (e) { /* voice unsupported, fine */ }
  }
  function currentAuto() {
    // Kindergarten pre-readers can't start on their own, so read-aloud defaults ON for
    // them (a 5-year-old shouldn't need a parent to press play). Everyone else stays
    // opt-in, since TTS quality varies by device and parents rely on no surprise audio.
    if (pref === '1') return true;
    if (pref === '0') return false;
    try { return !!(State.me && State.me.kid && (State.me.kid.grade || 0) <= 0); } catch (e) { return false; }
  }
  // Read-along storytime: narrate a passage while highlighting each word as it's
  // spoken. Perfect for the littles learning to read. Falls back to plain speak
  // if the browser doesn't fire boundary events.
  function readAlong(container, lang) {
    try {
      speechSynthesis.cancel();
      const spans = [...container.querySelectorAll('.pw')];
      const text = spans.map(s => s.textContent).join(' ');
      const u = new SpeechSynthesisUtterance(text);
      const young = (() => { try { return State.me && State.me.kid && State.me.kid.grade <= 5; } catch (e) { return false; } })();
      u.rate = young ? 0.9 : 0.97; u.pitch = young ? 1.1 : 1.0; u.volume = 1;
      if (lang) u.lang = lang;
      const v = bestVoice(lang || 'en-US'); if (v) u.voice = v;
      // Map character offsets → word index for highlighting
      const starts = []; let pos = 0;
      spans.forEach(s => { starts.push(pos); pos += s.textContent.length + 1; });
      let last = -1;
      const clear = () => spans.forEach(s => s.classList.remove('pw-on'));
      u.onboundary = (ev) => {
        if (ev.name && ev.name !== 'word') return;
        let idx = 0; for (let i = 0; i < starts.length; i++) { if (ev.charIndex >= starts[i]) idx = i; else break; }
        if (idx !== last) { clear(); if (spans[idx]) spans[idx].classList.add('pw-on'); last = idx; }
      };
      u.onend = clear; u.onerror = clear;
      container.classList.add('reading');
      const done = () => container.classList.remove('reading');
      u.addEventListener('end', done); u.addEventListener('error', done);
      speechSynthesis.speak(u);
    } catch (e) { /* unsupported, fine */ }
  }
  return {
    speak, readAlong,
    get auto() { return currentAuto(); },
    toggleAuto() { const next = !currentAuto(); pref = next ? '1' : '0'; localStorage.bp_autoread = pref; return next; }
  };
})();
// Render a passage into word-spans so read-along can highlight each word.
function passageHTML(passage, playful) {
  const words = String(passage).split(/\s+/).map((w, i) => `<span class="pw" data-i="${i}">${esc(w)}</span>`).join(' ');
  return `<div class="passage-box"><div class="passage-head"><span class="passage-tag">📖 ${playful ? 'Storytime' : 'Read the passage'}</span>
    <button class="btn sun small passage-read" type="button">🔊 ${playful ? 'Read to me' : 'Read aloud'}</button></div>
    <div class="passage-words">${words}</div></div>`;
}

// ======================= confetti =======================
const Confetti = (() => {
  const canvas = $('#confetti-canvas'), ctx2 = canvas.getContext('2d');
  let parts = [], raf;
  function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
  addEventListener('resize', resize); resize();
  function burst(n = 120) {
    const colors = ['#6C5CE7', '#00B894', '#FDCB6E', '#FF7675', '#0984E3', '#55EFC4', '#E17055', '#fd79a8'];
    for (let i = 0; i < n; i++) {
      parts.push({
        x: innerWidth / 2 + (Math.random() - .5) * 200, y: innerHeight * .35,
        vx: (Math.random() - .5) * 14, vy: -Math.random() * 13 - 3,
        s: Math.random() * 8 + 4, c: colors[Math.floor(Math.random() * colors.length)],
        r: Math.random() * Math.PI, vr: (Math.random() - .5) * .3, life: 140
      });
    }
    if (!raf) tick();
  }
  function tick() {
    ctx2.clearRect(0, 0, canvas.width, canvas.height);
    parts = parts.filter(p => p.life > 0 && p.y < innerHeight + 30);
    for (const p of parts) {
      p.x += p.vx; p.y += p.vy; p.vy += .35; p.r += p.vr; p.life--;
      ctx2.save(); ctx2.translate(p.x, p.y); ctx2.rotate(p.r);
      ctx2.fillStyle = p.c; ctx2.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * .6);
      ctx2.restore();
    }
    if (parts.length) raf = requestAnimationFrame(tick);
    else { raf = null; ctx2.clearRect(0, 0, canvas.width, canvas.height); }
  }
  return { burst };
})();

// ======================= state & router =======================
const State = { me: { role: 'guest' }, lesson: null };

async function refreshMe() { State.me = await api('/auth/me'); }

const routes = {};
let _navRetry = null; // {key, n} — transient-failure retry state for the router
function route(name, fn) { routes[name] = fn; }
async function navigate() {
  const hash = location.hash.replace(/^#\/?/, '') || 'landing';
  const [name, ...args] = hash.split('/');
  speechSynthesis && speechSynthesis.cancel();
  document.onkeydown = null;
  document.querySelectorAll('.celebrate').forEach(el => el.remove());
  applyTheme();
  // Background music lives in the FUN zones; lessons & everything else stay quiet.
  const MUSIC_ZONES = ['play', 'avatar', 'snacks', 'trophies', 'buddies', 'game'];
  if (Music.on && MUSIC_ZONES.includes(name)) Music.start(currentMusicMood()); else Music.stop();
  const fn = routes[name] || routes.landing;
  try { await fn(...args); _navRetry = null; } catch (e) {
    if (e.status === 401) { location.hash = State.me.role === 'kid' ? '#kid-login' : '#login'; return; }
    if (e.status === 402) { renderPaywall(e.data && e.data.reason); return; }
    // Transient failures — the server restarting during a deploy, or a dropped
    // connection — throw a 5xx or a network error (no status). Auto-retry a few
    // times with backoff, then leave a manual "Try Again". A momentary blip should
    // never look like a crash, and should heal itself the moment the server is back.
    const transient = !e.status || e.status >= 500;
    const key = location.hash;
    if (!_navRetry || _navRetry.key !== key) _navRetry = { key, n: 0 };
    const goHome = State.me.role === 'kid' ? '#home' : '#';
    const retryNow = () => { _navRetry.n++; navigate(); };
    const emoji = transient ? '🐎' : '🙈';
    const title = transient ? 'Reconnecting…' : 'Oops, something hiccuped!';
    const msg = transient ? 'One moment — getting you back on track.' : "Let's try that again.";
    app().innerHTML = topbar(`<div class="container"><div class="card center"><div class="big-emoji">${emoji}</div><h2>${title}</h2><p class="muted">${msg}</p><div style="margin-top:14px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap"><button class="btn green" id="nav-retry">↻ Try Again</button><button class="btn ghost" style="color:#41506a;border-color:#cfd8e3" onclick="location.hash='${goHome}'">🏠 Go Home</button></div></div></div>`);
    try { wireChrome(); } catch (_) {}
    const rb = document.getElementById('nav-retry'); if (rb) rb.onclick = () => { try { Sound.click(); } catch (_) {} retryNow(); };
    if (transient && _navRetry.n < 3) setTimeout(retryNow, [1500, 3000, 5000][_navRetry.n] || 5000);
  }
  window.scrollTo(0, 0);
  requestAnimationFrame(() => {
    document.querySelectorAll('.reveal:not(.in)').forEach(el => revealObs.observe(el));
  });
}
// Any celebration overlay: tapping the backdrop (not a button/link) dismisses it.
// Kids tap everywhere, never let a popup feel stuck.
document.addEventListener('click', e => {
  const cel = e.target.closest('.celebrate');
  if (cel && !e.target.closest('button, a, input, [data-cid], [data-g]')) cel.remove();
});
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); revealObs.unobserve(e.target); } });
}, { threshold: 0.15 });
addEventListener('hashchange', navigate);

// ======================= shared chrome =======================
function topbar(inner = '') {
  const me = State.me;
  const homeHash = me.role === 'kid' ? '#home' : me.role === 'parent' ? '#parent' : '#';
  let right = '';
  if (me.role === 'parent') right = `${me.parent && me.parent.is_admin ? `<button class="btn ghost small" onclick="location.hash='#admin'">🛡️ Admin</button>` : ''}<button class="btn ghost small" onclick="location.hash='#parent'">Dashboard</button><button class="btn ghost small" onclick="location.hash='#help'" title="Help &amp; support">💬 Help</button><button class="btn ghost small" id="logout-btn">Log out</button>`;
  else if (me.role === 'kid') {
    // When a child is inside a game, give them a big obvious way back to the Play Zone,
    // so they are never trapped in a game they don't want to be in.
    const inGame = /^#\/?game\//.test(location.hash);
    const exitBtn = inGame ? `<button class="btn coral small" onclick="location.hash='#play'">← Games</button>` : '';
    // If a parent launched this child session, give them a one-tap way back to their
    // own dashboard instead of forcing a full email+password re-login.
    const parentBtn = me.parentReturn ? `<button class="btn ghost small" id="exit-kid-btn" title="Back to your parent dashboard">← Parent</button>` : '';
    right = `${exitBtn}${parentBtn}<button class="btn ghost small" onclick="location.hash='#home'">🏠 Home</button><button class="btn ghost small" onclick="location.hash='#kid-login'" title="Switch to another child">👋 Switch</button><button class="btn ghost small kid-logout" id="logout-btn">Log out</button>`;
  }
  else right = `<button class="btn ghost small" onclick="location.hash='#kid-login'">Child Login</button><button class="btn ghost small" onclick="location.hash='#login'">Parent Login</button><button class="btn sun small" onclick="window.__subscribeIntent=1;location.hash='#signup'">Sign up now</button>`;
  return `
  <div class="topbar">
    <div class="logo" onclick="location.hash='${homeHash}'"><img src="/logo-mark.png" alt="Gallop" class="logo-img"> Gallop</div>
    <div class="right">
      ${right}
      <div class="sound-wrap">
        <button class="btn ghost small sound-btn" id="sound-btn" title="Sound settings" aria-label="Sound settings">${Sound.muted && !Music.on ? '🔇' : '🔊'}</button>
        <div class="sound-menu" id="sound-menu" hidden>
          <button class="sound-opt" id="sfx-toggle"><span>🔊 Sound effects</span><span class="sw ${Sound.muted ? '' : 'on'}" id="sfx-sw"></span></button>
          <button class="sound-opt" id="music-toggle"><span>🎵 Background music</span><span class="sw ${Music.on ? 'on' : ''}" id="music-sw"></span></button>
          <button class="sound-opt sound-skip" id="music-skip"><span>⏭️ Next track</span><span class="muted" style="font-size:.78rem">shuffle</span></button>
        </div>
      </div>
    </div>
  </div>${inner}`;
}
function wireChrome() {
  const sb = $('#sound-btn'), menu = $('#sound-menu');
  if (sb && menu) {
    sb.onclick = (e) => { e.stopPropagation(); menu.hidden = !menu.hidden; };
    // Register the outside-click-to-close handler exactly once (wireChrome runs on every
    // render). A persistent handler that no-ops unless a menu is open, rather than a
    // {once:true} listener that fires on the first stray click and then stops working.
    if (!wireChrome._soundCloseWired) {
      document.addEventListener('click', (e) => {
        const m = document.getElementById('sound-menu');
        if (m && !m.hidden && !e.target.closest('.sound-wrap')) m.hidden = true;
      });
      wireChrome._soundCloseWired = true;
    }
    const sfxSw = $('#sfx-sw'), musicSw = $('#music-sw');
    $('#sfx-toggle').onclick = (e) => { e.stopPropagation(); const muted = Sound.toggle(); sfxSw.classList.toggle('on', !muted); if (!muted) Sound.click(); sb.textContent = (Sound.muted && !Music.on) ? '🔇' : '🔊'; };
    $('#music-toggle').onclick = (e) => { e.stopPropagation(); const isOn = Music.toggle(currentMusicMood()); musicSw.classList.toggle('on', isOn); sb.textContent = (Sound.muted && !Music.on) ? '🔇' : '🔊'; };
    const skip = $('#music-skip');
    if (skip) skip.onclick = (e) => { e.stopPropagation(); if (!Music.on) { Music.toggle(currentMusicMood()); if ($('#music-sw')) $('#music-sw').classList.add('on'); } else { Music.skip(); } };
  }
  const lb = $('#logout-btn');
  if (lb) lb.onclick = async () => { await api('/auth/logout', { method: 'POST' }); await refreshMe(); location.hash = '#'; };
  const xk = $('#exit-kid-btn');
  if (xk) xk.onclick = async () => {
    try { await api('/auth/exit-kid', { method: 'POST' }); await refreshMe(); location.hash = '#parent'; }
    catch (e) { location.hash = '#login'; }
  };
  // Accessibility: the kid nav tiles are <div>s. Make them real buttons for keyboard
  // and screen-reader users (focusable + role + label). Enter/Space is handled globally.
  upgradeTiles();
  a11yEnhance();
}
// Global accessibility pass, run after every render. Two things that otherwise had to be
// remembered on dozens of scattered forms:
//  1. Associate every orphan <label> with the input that follows it, so screen readers
//     announce a name for each field (the app writes `<label>Email</label><input id=…>`).
//  2. Make every .error-msg a live region so validation errors are actually announced.
function a11yEnhance() {
  let auto = 0;
  document.querySelectorAll('label:not([for])').forEach(lab => {
    // Skip labels that already WRAP their control (those are associated implicitly).
    if (lab.querySelector('input, select, textarea')) return;
    let el = lab.nextElementSibling;
    if (el && /^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName) && el.type !== 'hidden') {
      if (!el.id) el.id = 'a11y-f-' + (auto++) + '-' + Math.random().toString(36).slice(2, 7);
      lab.setAttribute('for', el.id);
    }
  });
  document.querySelectorAll('.error-msg:not([role])').forEach(e => { e.setAttribute('role', 'alert'); });
}
// Callable separately after any DYNAMIC tile injection (e.g. kid-login avatar list).
function upgradeTiles() {
  document.querySelectorAll('.subject-card, .zone-card, .up-next, .avatar-opt, .ach-banner, .avatar-big').forEach(el => {
    if (el.getAttribute('role') === 'button') return;
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    if (!el.getAttribute('aria-label')) {
      const label = (el.getAttribute('title') || el.textContent || '').replace(/\s+/g, ' ').trim();
      if (label) el.setAttribute('aria-label', label.slice(0, 90));
    }
  });
}
// One global keyboard bridge: Enter/Space activates any role="button" that isn't a
// native control (covers all the div-based tiles upgraded in wireChrome).
if (!window._kbButtonsWired) {
  window._kbButtonsWired = true;
  document.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
    const t = e.target.closest && e.target.closest('[role="button"]');
    if (!t) return;
    if (['BUTTON', 'A', 'INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName)) return;
    e.preventDefault();
    t.click();
  });
}
// Older learners get the chill lo-fi vibe; the littles get a brighter playful loop.
function currentMusicMood() {
  try { const k = State.me && State.me.kid; return (k && k.grade >= 6) ? 'chill' : 'playful'; } catch (e) { return 'chill'; }
}
function showError(id, msg) { const el = $(id); if (el) { el.textContent = msg; el.classList.add('show'); } }

// ======================= landing =======================
// Smooth-scroll the homepage's section nav to a target section. Kept off the hash router
// (plain scrollIntoView, no location.hash change) so a jump never triggers a route change.
window.scrollToSection = function (id) { try { const e = document.getElementById(id); if (e) e.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (_) {} };

route('landing', async () => {
  if (State.me.role === 'kid') { location.hash = '#home'; return; }
  app().innerHTML = topbar(`
  <div class="hero">
    <img src="/logo-full.png" alt="Gallop Learning Academy" class="hero-logo">
    <div class="eyebrow">The real-world approach to K–12 tutoring · Math · English · Science · Spanish</div>
    <h1>The tutor that teaches your child the real world — and how to use it.</h1>
    <p class="hero-tagline">Most apps just place, drill, and advance. Gallop teaches real skills — then has kids <b>apply</b> them.</p>
    <p>An affordable, on-demand tutor that finds your child's real level and weaves money, business, investing, and careers right into the core subjects — then makes them <b>use</b> it through games, projects, and a real stock-market simulator. Learning they'll actually reach for in real life.</p>
    <div class="hero-cta">
      ${State.me.role === 'parent'
        ? `<button class="btn hero-primary" onclick="location.hash='#parent'">Go to my dashboard →</button>`
        : `<div class="hero-cta-main">
        <button class="btn hero-primary" onclick="window.__subscribeIntent=0;location.hash='#signup'">Start my free trial →</button>
        <button class="btn sun hero-secondary" onclick="window.__subscribeIntent=1;location.hash='#signup'">Subscribe now</button>
      </div>
      <p class="hero-cta-note muted">Free for 7 days · No credit card to start · All 4 subjects · Cancel anytime</p>`}
      <div class="hero-cta-row">
        <button class="btn ghost" onclick="location.hash='#demo'">Try a sample lesson — no signup</button>
        <button class="btn ghost" onclick="location.hash='#kid-login'">Student sign-in</button>
      </div>
    </div>
    <div class="hero-trust">
      <span>📏 Aligned to Common Core, NGSS &amp; ACTFL</span>
      <span>🔒 COPPA-compliant · no ads · we never sell your data</span>
      <span>👨‍👩‍👧 Built by a family, not a faceless edtech company</span>
    </div>
    <div class="hero-journey"><img src="/journey-green.png" alt="" class="journey-img"></div>
  </div>
  <div class="container">
    <div class="ps-band reveal">
      <div class="ps-col ps-problem">
        <span class="ps-tag">THE PROBLEM</span>
        <h2>Kids memorize facts they forget — and grow up never learning how money, work, and the real world actually function.</h2>
        <p>Tutoring centers cost a fortune for a single subject. Most apps just place a child, drill them, and push them ahead. Nothing connects what they learn to the life they're growing into.</p>
      </div>
      <div class="ps-col ps-solution">
        <span class="ps-tag sol">THE GALLOP DIFFERENCE</span>
        <h2>We teach the real world — then make kids use it.</h2>
        <p>An affordable, on-demand tutor for all four subjects that adapts to your child and turns every skill into something real: running a business, investing in a live market, exploring a career. High-value learning they'll actually apply.</p>
      </div>
    </div>
    <div class="pillars reveal">
      <div class="pillar"><span class="pi-emoji">🧠</span><b>Real-world lessons</b><p>Money, business, investing &amp; careers woven right into Math, English, Science &amp; Spanish.</p></div>
      <div class="pillar"><span class="pi-emoji">🎮</span><b>They apply it</b><p>Purpose-built games, projects &amp; a stock-market simulator turn skills into practice — never worksheets.</p></div>
      <div class="pillar"><span class="pi-emoji">🧭</span><b>Career center</b><p>Strengths become real career directions — 16 fields, real role models, and a plan that grows with them.</p></div>
      <div class="pillar"><span class="pi-emoji">📊</span><b>Parent portal</b><p>See exactly where each child is ahead and where they need a hand — updated automatically.</p></div>
    </div>
    <div class="statband reveal">
      <div><b>K–12</b><span>Every grade level</span></div>
      <div><b>4</b><span>Core subjects</span></div>
      <div><b>300+</b><span>Skill areas</span></div>
      <div><b>300+</b><span>Guided lessons</span></div>
      <div><b>5,000+</b><span>Accuracy-checked questions</span></div>
    </div>
    <nav class="section-nav" aria-label="Jump to a section">
      <div class="sn-inner">
        <button class="sn-logo" onclick="window.scrollTo({top:0,behavior:'smooth'})" aria-label="Back to top"><img src="/logo-mark.png" alt="" class="sn-logo-img">Gallop</button>
        <div class="sn-links">
          <button class="sn-link" onclick="scrollToSection('s-how')">How it works</button>
          <button class="sn-link" onclick="scrollToSection('s-realworld')">Real-world</button>
          <button class="sn-link" onclick="scrollToSection('s-curriculum')">Curriculum</button>
          <button class="sn-link" onclick="scrollToSection('s-why')">Why Gallop</button>
          <button class="sn-link" onclick="scrollToSection('s-story')">Our story</button>
          <button class="sn-link" onclick="scrollToSection('s-pricing')">Pricing</button>
          <button class="sn-link" onclick="scrollToSection('s-faq')">FAQ</button>
        </div>
        <button class="btn sun small sn-cta" onclick="window.__subscribeIntent=0;location.hash='#signup'">Start free trial</button>
      </div>
    </nav>
    <div class="tour reveal" id="tour">
      <h2 class="section-title" style="margin-bottom:4px">See everything that makes us different</h2>
      <p class="section-sub">A 60-second tour — the lessons, the kids' world, the games, the career center, the investing sim, and your parent portal.</p>
      <div class="tour-tabs" role="tablist">
        <button class="tour-tab active" data-step="0">📖 Lessons</button>
        <button class="tour-tab" data-step="1">🎒 Kids' world</button>
        <button class="tour-tab" data-step="2">🎮 Games</button>
        <button class="tour-tab" data-step="3">🧭 Career center</button>
        <button class="tour-tab" data-step="4">📈 Investing sim</button>
        <button class="tour-tab" data-step="5">📊 Parent portal</button>
      </div>
      <div class="tour-stage">
        <div class="tour-frame">
          <div class="tour-slide active" data-step="0"><img src="/shots/lesson.webp" alt="A Gallop guided lesson teaching a concept before practice" loading="lazy"></div>
          <div class="tour-slide" data-step="1"><img src="/shots/student-home.webp" alt="A student's Gallop home base with score, streak and next lesson" loading="lazy"></div>
          <div class="tour-slide" data-step="2">
            <div class="tmock tmock-games">
              <div class="tm-head">🎮 Play Zone <span class="tm-pill">🎟️ 3 tokens</span></div>
              <div class="tm-grid">
                <div class="tm-card">🧠<span>Memory Match</span></div>
                <div class="tm-card">⚡<span>Math Sprint</span></div>
                <div class="tm-card">🔤<span>Word Builder</span></div>
                <div class="tm-card">🎯<span>Fraction Toss</span></div>
                <div class="tm-card">🐍<span>Number Snake</span></div>
                <div class="tm-card">🧩<span>Logic Puzzles</span></div>
              </div>
              <div class="tm-foot">Earned by learning · Parent controls on/off &amp; daily time</div>
            </div>
          </div>
          <div class="tour-slide" data-step="3">
            <div class="tmock tmock-career">
              <div class="tm-head">🧭 Career Center <span class="tm-pill">strengths → paths</span></div>
              <div class="tm-bar"><span>🔬 Science</span><i style="width:82%;background:#2f78c2"></i><b>82</b></div>
              <div class="tm-bar"><span>🔢 Math</span><i style="width:76%;background:#5b5bd6"></i><b>76</b></div>
              <div class="tm-bar"><span>📚 English</span><i style="width:61%;background:#0f9d76"></i><b>61</b></div>
              <div class="tm-paths"><span>⚙️ Engineering</span><span>🩺 Medicine</span><span>💻 AI &amp; CS</span></div>
              <div class="tm-foot">16 fields · real role models · a plan that grows with them</div>
            </div>
          </div>
          <div class="tour-slide" data-step="4">
            <div class="tmock tmock-invest">
              <div class="tm-head">📈 Investor's Notebook <span class="tm-pill up">Portfolio ▲ 6.4%</span></div>
              <div class="tm-holds">
                <div class="tm-hold"><b>APPL</b><span class="up">$188 ▲1.2%</span></div>
                <div class="tm-hold"><b>NIKE</b><span class="dn">$94 ▼0.6%</span></div>
                <div class="tm-hold"><b>DIS</b><span class="up">$112 ▲2.1%</span></div>
              </div>
              <div class="tm-chart"><i style="height:38%"></i><i style="height:52%"></i><i style="height:44%"></i><i style="height:66%"></i><i style="height:60%"></i><i style="height:78%"></i></div>
              <div class="tm-foot">Real tickers, pretend money — kids learn risk, patience &amp; compounding</div>
            </div>
          </div>
          <div class="tour-slide" data-step="5"><img src="/shots/parent-dashboard.webp" alt="A parent dashboard showing each child's progress and where they need help" loading="lazy"></div>
        </div>
        <div class="tour-caps">
          <div class="tour-cap active" data-step="0"><b>Taught, then practiced.</b> Every skill gets a guided lesson first — see it, hear it, do it — then the questions adapt to each answer. Never a question without a lesson in front of it.</div>
          <div class="tour-cap" data-step="1"><b>A world kids want to come back to.</b> Streaks, an avatar they build, daily goals, and their next lesson — all waiting the moment they log in.</div>
          <div class="tour-cap" data-step="2"><b>Games with a purpose.</b> Break games are earned by learning, not handed out — and you decide whether they're on and for how long, with a visible countdown so it's never a surprise.</div>
          <div class="tour-cap" data-step="3"><b>Strengths that open doors.</b> Gallop turns what your child is good at into real career directions — 16 fields, real role models, and the classes that get them there.</div>
          <div class="tour-cap" data-step="4"><b>They invest for real (with pretend money).</b> Teens run a live-market portfolio, follow the news, and weigh risk — the math behind a margin, made real.</div>
          <div class="tour-cap" data-step="5"><b>Your command center.</b> Exactly where each child is ahead and where they need a hand, time on task, and one-tap controls — updated automatically.</div>
        </div>
      </div>
      <div class="tour-progress"><i id="tour-bar"></i></div>
    </div>
    <h2 id="s-how" class="section-title reveal">How it works</h2>
    <p class="section-sub">The same three moves a good teacher makes, built into every session.</p>
    <div class="feature-grid">
      <div class="feature reveal"><div class="fnum">STEP 01 · PLACE</div><h3>Find the true starting line</h3><p>A short assessment measures each subject on its own. A child who reads well but finds math harder starts in the right spot for each, not somewhere in the middle.</p></div>
      <div class="feature reveal"><div class="fnum">STEP 02 · ADAPT & RE-TEACH</div><h3>Miss one? We teach it again</h3><p>Skills a child has down get harder and go deeper. And when they miss one, Gallop doesn't just flash the correct answer and move on the way a drill app does — it re-explains the idea a <b>different</b> way and gives them another try. A stumble becomes a teaching moment, not a red X.</p></div>
      <div class="feature reveal"><div class="fnum">STEP 03 · PROGRESS</div><h3>Prove it, then move up</h3><p>A child only advances a grade after showing they can do the whole thing, not after a lucky streak. You see the letter grades, the strengths, and the spots that need work. Certificates mark the real milestones.</p></div>
    </div>
    <h2 class="section-title reveal">Lessons, not just questions</h2>
    <p class="section-sub">Before a child practices a skill, Gallop teaches it — <b>every one of our 300+ skills has its own guided lesson</b>, so there's never a question without a lesson in front of it. And you can search the whole K–12 curriculum and jump to any concept in seconds — so the moment your child hits something tricky in class, they can pull up that exact lesson and work through it at their own pace.</p>
    <div class="feature-grid">
      <div class="feature reveal"><div class="fnum">SEE IT</div><h3>Pictures do the explaining</h3><p>A pizza sliced into fourths for fractions. Rows and columns for times tables. Earth turning toward the sun for day and night. The idea shows up on the screen, not just in a sentence.</p></div>
      <div class="feature reveal"><div class="fnum">HEAR IT</div><h3>Every lesson reads aloud</h3><p>A child who learns by ear hears the concept and the worked example spoken, at their own pace, as many times as they want. Nobody gets left behind by the reading.</p></div>
      <div class="feature reveal"><div class="fnum">DO IT</div><h3>You try it before you move on</h3><p>The lesson will not continue until the child does it themselves: shading a fraction, building a number, sorting the words. Kids who learn by doing finally get to.</p></div>
    </div>
    <p class="section-sub reveal" style="margin-top:6px">Each lesson leans on a comparison a kid already gets, so the idea sticks. Fractions are just fair shares. A story's main idea is the umbrella all its details stand under. In Spanish, <i>ser</i> is who you always are and <i>estar</i> is how you feel today.</p>
    <h2 id="s-realworld" class="section-title reveal">We're raising critical thinkers</h2>
    <p class="section-sub">Every kid eventually asks "when will I ever use this?" We answer that on the questions themselves, and keep an eye on the adult they're becoming.</p>
    <div class="feature-grid">
      <div class="feature reveal"><div class="fnum">GRADES K–5</div><h3>Little entrepreneurs</h3><p>Second-grade addition turns into running a lemonade stand: buy the supplies, set a price, count what's left over. It stops feeling like a worksheet and starts feeling like the actual world.</p></div>
      <div class="feature reveal"><div class="fnum">GRADES 6–8</div><h3>Real decisions</h3><p>Percentages show up as sale prices and interest. Reading turns into spotting a shaky argument. Science becomes a habit of testing a claim before believing it.</p></div>
      <div class="feature reveal"><div class="fnum">GRADES 9–12</div><h3>Future founders and investors</h3><p>Teenagers run a pretend portfolio in our stock-market game, follow the news, and weigh risk. Algebra becomes the math behind a margin. An essay becomes a pitch. School starts to feel like a head start.</p></div>
    </div>
    <h2 class="section-title reveal">See where it's all heading</h2>
    <p class="section-sub">As your child works, Gallop picks up on what they're good at and shows it to you. By the high school years, those strengths turn into real career directions with a clear sense of what to focus on next.</p>
    <div class="lp-career reveal">
      <div class="lp-career-panel">
        <div class="lp-career-badge">Career Pathways · illustrative example</div>
        <div class="lp-strength"><span class="lp-s-name">🔬 Science</span><span class="lp-s-bar"><i style="width:82%;background:#2f78c2"></i></span><b>82</b></div>
        <div class="lp-strength"><span class="lp-s-name">🔢 Math</span><span class="lp-s-bar"><i style="width:76%;background:#5b5bd6"></i></span><b>76</b></div>
        <div class="lp-strength"><span class="lp-s-name">📚 English</span><span class="lp-s-bar"><i style="width:61%;background:#0f9d76"></i></span><b>61</b></div>
        <div class="lp-strength"><span class="lp-s-name">🌎 Spanish</span><span class="lp-s-bar"><i style="width:44%;background:#d26440"></i></span><b>44</b></div>
        <div class="lp-paths">
          <div class="lp-path">⚙️ <b>Engineering</b> <span>81% match</span></div>
          <div class="lp-path">🩺 <b>Medicine & Health</b> <span>78% match</span></div>
          <div class="lp-path">💻 <b>Computer Science & AI</b> <span>74% match</span></div>
        </div>
      </div>
      <div class="lp-career-copy">
        <h3>Strengths that open doors — meet the Career Explorer</h3>
        <p>Gallop notices what your child is good at, then opens a window onto where it can lead. The new Career Explorer demystifies real careers — what an architect or an engineer <em>actually does all day</em>, the range of jobs inside each field, and the classes that get you there. Because most kids (and plenty of adults) have no idea these paths even exist.</p>
        <ul class="lp-check">
          <li>Sixteen fields — from engineering, medicine, and AI to hospitality, the trades, the arts, and law.</li>
          <li>Real, accomplished role models in every field, each with a short story to read — from Maya Lin to José Andrés to Katherine Johnson.</li>
          <li>Personalized to your child's strengths, but fully explorable — a door-opener, never a limit. It grows with them from a light preview to a real plan.</li>
        </ul>
      </div>
    </div>

    <h2 class="section-title reveal">A home for accelerated learners</h2>
    <p class="section-sub">The kids who race ahead don't hit a ceiling here. Gallop has a separate Advanced Track that goes past grade level into college-level and honors work — real challenge, on demand, all year long.</p>
    <div class="feature-grid">
      <div class="feature reveal"><div class="fnum">ADVANCED PLACEMENT</div><h3>College-level AP practice</h3><p>Exam-style sets for AP Calculus, Statistics, Biology, Chemistry, Physics, Environmental Science, English Language, English Literature, and Spanish.</p></div>
      <div class="feature reveal"><div class="fnum">HONORS &amp; BEYOND</div><h3>Push past the standard track</h3><p>Honors-level Precalculus, Spanish, and more for students who have already mastered their grade and want to keep climbing.</p></div>
      <div class="feature reveal"><div class="fnum">EXAM READY</div><h3>Aligned to the real tests</h3><p>Practice matched to the tests that count — AP-style sets, honors work, and state test prep in math, science, and English built on rigorous state standards.</p></div>
    </div>
    <p class="section-sub reveal" style="margin-top:6px">The Advanced Track is its own space, so working ahead never disturbs a child's grade-level placement or Gallop Score. And the core high-school math ladder now runs pre-algebra, algebra, geometry, trigonometry, pre-calculus, calculus, and statistics.</p>

    <h2 id="s-curriculum" class="section-title reveal">The curriculum</h2>
    <p class="section-sub">Every idea is taught through something real: money, sports, cooking, travel, and the technology kids already use.</p>
    <div class="subject-strip">
      <div class="sub reveal" style="background:var(--math)"><h4>Mathematics</h4><p>Counting all the way through calculus and statistics, with an advanced track for accelerated students. Lemonade-stand arithmetic, sale-rack percentages, and the functions behind a roller coaster.</p></div>
      <div class="sub reveal" style="background:var(--english)"><h4>English</h4><p>Phonics through rhetoric and college-level analysis. Reading that builds thinkers and grammar that builds writers.</p></div>
      <div class="sub reveal" style="background:var(--science)"><h4>Science</h4><p>The five senses through chemistry and physics. Why a mirror fogs, why a soda can sweats, and how a vaccine trains the body.</p></div>
      <div class="sub reveal" style="background:var(--spanish)"><h4>Spanish</h4><p>First greetings toward real fluency. The practical Spanish that actually gets used — ordering in a café, greeting a neighbor, getting around — because conversation comes before conjugation.</p></div>
    </div>
    <h2 class="section-title reveal">Built for families</h2>
    <div class="feature-grid">
      <div class="feature reveal"><h3>An experience that grows up</h3><p>A first grader gets big friendly type and read-along storytime, where the words light up as they are read out loud. A teenager gets 15-minute focus sessions and quiet background music in a clean study space. It is the same engine underneath, dressed for a different age.</p></div>
      <div class="feature reveal"><h3>A trophy case worth chasing</h3><p>There are 33 badges to collect across six categories, a rank ladder that climbs from Foal to Thoroughbred, and progress bars that always show the next goal. Certificates mark each grade level a child finishes.</p></div>
      <div class="feature reveal"><h3>Motivation that makes sense</h3><p>Daily quests, streaks, a built-in learning arcade, and a coin-powered Snack Shack where a child's avatar actually eats the treats they buy. There are 48 characters to unlock, from astronauts to unicorns. Play is the reward and learning is what earns it.</p></div>
      <div class="feature reveal"><h3>Sound that was actually made for it</h3><p>Original background music, composed live in the app — warm, melodic tunes with a calmer set for teenagers and brighter ones for the younger kids, and a single tap turns it all off. None of it is stock audio.</p></div>
      <div class="feature reveal"><h3>Safe by design</h3><p>Children can only connect with buddies a parent approves. They send pre-written cheers, race each other's high scores, and team up on weekly goals where both kids win. There is no open chat and no way for strangers to reach them.</p></div>
      <div class="feature reveal"><h3>Proof for the fridge</h3><p>Printable certificates, a one-page weekly summary, a two-week activity chart, per-skill progress bars, a spreadsheet export, and the strengths and career insights. You will always know how it is going.</p></div>
    </div>

    <div class="arcade-band reveal">
      <div class="ab-head">
        <span class="ab-kicker">ONLY ON GALLOP</span>
        <h2>The arcade where practice pays</h2>
        <p>Every 5 correct answers earns a play token — and the games aren't a break from learning, they're learning in disguise. Retro 16-bit games our team built from scratch, teaching skills most kids never get in school.</p>
      </div>
      <div class="ab-grid">
        <div class="ab-card ab-feature"><span class="ab-emoji">📈</span><b>Market Mogul</b><p>A full 12-level investing career that saves your progress and levels up as you master real strategies — diversification, dollar-cost averaging, dividends, riding out a crash. The kind of financial literacy most adults never learn, built to keep older students hooked.</p><span class="ab-tag">investing · grades 4–12</span></div>
        <div class="ab-card"><span class="ab-emoji">🍋</span><b>Lemonade Tycoon</b><p>Buy smart, price right, watch the weather. Revenue, cost, and profit — a first business before age 10.</p><span class="ab-tag">entrepreneurship</span></div>
        <div class="ab-card"><span class="ab-emoji">🧁</span><b>Bakery Quest</b><p>Run a bakery for a day: batches, pricing, making change. Math with money on the line.</p><span class="ab-tag">business math</span></div>
        <div class="ab-card"><span class="ab-emoji">🤖</span><b>Code Quest</b><p>Program a robot step by step to reach the star — first coding logic, no typing needed.</p><span class="ab-tag">coding</span></div>
      </div>
      <p class="ab-more">+ Lightning Round, Word Search, Memory Match & Art Studio — eight games, all earned by learning.</p>
    </div>

    <h2 id="s-why" class="section-title reveal">Why families choose Gallop</h2>
    <p class="section-sub">Gallop is newly launched, so we would rather show you what it does than put words in a parent's mouth. Here is what you get from day one.</p>
    <div class="quote-grid">
      <figure class="quote-card reveal">
        <blockquote>Each subject is placed on its own, so a child who reads ahead but finds math harder starts in the right spot for both, not somewhere in the middle.</blockquote>
        <figcaption><span class="q-name">Placed per subject</span><span class="q-detail">Math · English · Science · Spanish</span></figcaption>
      </figure>
      <figure class="quote-card reveal">
        <blockquote>Get one wrong and Gallop re-teaches it a different way, then lets your child try again — most apps just show the answer and move on. It's the difference between drilling and actually learning.</blockquote>
        <figcaption><span class="q-name">It re-teaches until it clicks</span><span class="q-detail">The "Second Look" difference</span></figcaption>
      </figure>
      <figure class="quote-card reveal">
        <blockquote>Coins, badges, an arcade, and a Snack Shack turn practice into something kids come back to, while the real work happens underneath.</blockquote>
        <figcaption><span class="q-name">Built to keep them going</span><span class="q-detail">Play is the reward</span></figcaption>
      </figure>
      <figure class="quote-card reveal">
        <blockquote>A one-page weekly summary tells you, in plain language, where your child is ahead, where they're stuck, and the one thing to do this week — plus how close they are to the next grade level.</blockquote>
        <figcaption><span class="q-name">You know exactly what to do next</span><span class="q-detail">Weekly report & "Do this next"</span></figcaption>
      </figure>
    </div>

    <div id="s-story" class="founder-note reveal">
      <div class="founder-emoji"><img src="/logo-mark.png" alt="" class="founder-horse"></div>
      <div class="founder-body">
        <p>Gallop started at our kitchen table. We've spent our careers building things — restaurants, a marketing agency, teams of people. Steve earned his master's in hospitality and went on to teach it, and Lin earned her law degree. Between us we've opened and run more than a dozen businesses, and if all of that taught us one thing, it's that people rise to the level someone believes they can reach.</p>
        <p>When it came to our own daughter, Margaux, the tutoring we could buy didn't do that — it was expensive, one-size-fits-all, and honestly a little boring. So we built what we wanted for her: every subject in one place, teaching at her real level, turning practice into something she actually asks to do. There's no faceless edtech company behind Gallop. It's us — two parents and lifelong entrepreneurs who built this to watch our daughter succeed, and who would love to help your child do the same.</p>
        <p class="founder-sign">— Steve &amp; Lin Jerome<br><span>Founders · Gallop Learning Academy</span></p>
      </div>
    </div>

    <div id="s-pricing" class="card reveal" style="margin-top:40px">
      <h2 class="center" style="margin-bottom:6px">Simple plans</h2>
      <p class="center muted" style="margin-bottom:20px">Start with a 7-day free trial. No credit card to begin, and you can cancel anytime.</p>
      <p class="center" style="margin:-8px 0 20px;font-weight:600">A month at a learning center commonly runs $150 to $200 for a single subject, and private tutors often charge $40 to $80 an hour. Gallop covers all four subjects, all year, for less than most families spend on just one subject at a center.</p>
      <div class="plans">
        <div class="plan"><h3>Solo</h3><div class="price">$34<span style="font-size:1rem;font-family:var(--font-body)">/mo</span></div><p class="muted">One student · all four subjects · lessons, adaptive tutor & reports</p></div>
        <div class="plan hot"><span class="tag">MOST POPULAR</span><h3>Family</h3><div class="price">$54<span style="font-size:1rem;font-family:var(--font-body)">/mo</span></div><p class="muted">Up to four students · all subjects · lessons, reports, certificates & buddies</p></div>
      </div>
      <div class="trust-strip">
        <span>🎁 7 days free, no card to start</span>
        <span>↩️ Cancel anytime in one click</span>
        <span>🔒 Payments secured by Stripe</span>
        <span>🚫 No ads, ever · we never sell your data</span>
      </div>
      <div class="compare">
        <div class="compare-head"><span>How Gallop compares to in-person options</span></div>
        <div class="compare-scroll"><table class="compare-table">
          <thead><tr><th></th><th class="us">Gallop</th><th>Learning centers<br><span>(Kumon, Sylvan, Mathnasium)</span></th><th>Private tutor</th></tr></thead>
          <tbody>
            <tr><td>Typical cost</td><td class="us"><b>$34–54 / mo</b></td><td>$150–200 / mo <i>per subject</i></td><td>$40–80 / hour</td></tr>
            <tr><td>All 4 subjects included</td><td class="us">✅</td><td>❌ pay per subject</td><td>❌ usually one</td></tr>
            <tr><td>Adapts to each child</td><td class="us">✅ every answer</td><td>➖ worksheet levels</td><td>✅ if it's a good one</td></tr>
            <tr><td>Teaches the concept first</td><td class="us">✅ guided lessons</td><td>✅ in person</td><td>✅ in person</td></tr>
            <tr><td>Learn anytime, any device</td><td class="us">✅ 24/7</td><td>❌ scheduled visits</td><td>❌ booked sessions</td></tr>
            <tr><td>Progress reports & certificates</td><td class="us">✅ automatic</td><td>➖ periodic</td><td>➖ varies</td></tr>
            <tr><td>Strengths & career insights</td><td class="us">✅ built in</td><td>❌</td><td>❌</td></tr>
            <tr><td>Advanced track for accelerated kids</td><td class="us">✅ AP, Honors & exam prep</td><td>➖ extra program</td><td>➖ varies</td></tr>
            <tr><td>Games, rewards & motivation</td><td class="us">✅ arcade + trophies</td><td>❌</td><td>❌</td></tr>
          </tbody>
        </table></div>
        <p class="muted center" style="font-size:.8rem;margin-top:10px">Learning centers and private tutors meet in person — a different kind of help. This table shows the cost and coverage families weigh when choosing. Pricing reflects commonly published U.S. rates and varies by location.</p>
      </div>
    </div>
    <div id="s-faq" class="card reveal faq" style="margin-top:40px">
      <h2 class="center" style="margin-bottom:18px">Questions parents ask</h2>
      <details><summary>Do I need a credit card to start?</summary><p>No. Your first 7 days are free, and you can set up your children and use everything without entering any payment details. We only ask for a card if you choose to continue after the trial.</p></details>
      <details><summary>What does it cost after the trial?</summary><p>Solo is $34 a month for one student, and Family is $54 a month for up to four. Both are billed monthly and include all four subjects, the guided lessons, the adaptive tutor, the games, and the parent reports. Nothing is sold as an add-on.</p></details>
      <details><summary>What ages and subjects does it cover?</summary><p>Every grade from kindergarten through 12th, in Math, English, Science, and Spanish. Each child is placed at their real level in each subject, so a strong reader who finds math harder starts in the right spot for both. High-school math runs all the way through calculus and statistics.</p></details>
      <details><summary>Is it aligned to academic standards?</summary><p>Yes. Every skill is mapped to a recognized standard: Common Core for Math and English, NGSS for Science, and ACTFL for Spanish — the same frameworks most states, including New York and Nevada, build their standards on. It's built to <b>supplement and reinforce</b> what's taught in the classroom — added practice and support alongside a teacher's instruction, not a replacement for it. Educators and administrators can see the full, skill-by-skill coverage map on our <a href="#standards">Standards Alignment</a> page. Students just see the lesson and practice; the standard codes are there for schools.</p></details>
      <details><summary>What about kids who are ahead of grade level?</summary><p>They get a separate Advanced Track. Once a student has mastered their grade, they can practice college-level and honors material — AP-style sets in Calculus, Statistics, Biology, Chemistry, Physics, Environmental Science, English, and Spanish, honors courses, and state test prep built on rigorous state standards (great preparation whatever state you're in). It's kept separate from grade-level work, so working ahead never changes a child's placement.</p></details>
      <details><summary>What if my child doesn't like it?</summary><p>The first 7 days are completely free and need no card, so you can let your child try the real thing before you ever pay. If it isn't a fit, do nothing and the trial simply ends — you're never charged. If you've already subscribed, cancel in one click and you keep access through the time you've paid for.</p></details>
      <details><summary>Are there real, human tutors?</summary><p>No — and that's the point. Gallop is self-paced adaptive software your child uses on their own, so there's nothing to schedule and no hourly rate. It teaches each concept with a short guided lesson, then adjusts every question to your child, which is how it covers all four subjects for a fraction of what a tutoring center charges for a single subject. Think of it as extra practice and support that reinforces what your child learns in the classroom — not a replacement for their teacher.</p></details>
      <details><summary>Can I cancel anytime?</summary><p>Yes, in one click from your parent dashboard. Cancelling stops any future charges, and your child keeps access through the time you have already paid for.</p></details>
      <details><summary>Is my child safe, and is our data private?</summary><p>Yes. There are no ads and we never sell your data. Children connect only with buddies you approve, and they can send only pre-written cheers, so there is no open chat and no way for strangers to reach them. Payments run through Stripe, so we never see or store your card number.</p></details>
      <details><summary>What devices does it work on?</summary><p>Any device with a web browser: phone, tablet, laptop, or desktop. There is nothing to install, and progress syncs automatically across devices.</p></details>
      <details><summary>How is this different from a worksheet app or a tutoring center?</summary><p>Gallop teaches each concept with a short guided lesson before the practice, then adapts every question to your child, across all four subjects, for a small fraction of what a tutoring center charges per subject.</p></details>
      <details><summary>How do I get help?</summary><p>Email <a href="mailto:support@learnwithgallop.com">support@learnwithgallop.com</a> or message <a href="https://instagram.com/learnwithgallop" target="_blank" rel="noopener">@learnwithgallop</a> on Instagram, and a real person will get back to you.</p></details>
    </div>
  </div>
  <div class="nl-band">
    <b>📬 Learning tips & Gallop news</b>
    <p class="muted" style="margin:4px 0 10px">One short, useful email now and then. No spam, unsubscribe anytime.</p>
    <form class="nl-form" id="nl-form"><input type="email" id="nl-email" placeholder="you@example.com" required aria-label="Email address"><button class="btn green" type="submit">Sign me up</button></form>
    <p id="nl-done" style="display:none;font-weight:700;color:var(--brand);margin-top:8px">🎉 You're on the list!</p>
  </div>
  <div class="site-footer">© ${new Date().getFullYear()} Lotus Farms LLC · Gallop Learning Academy · Adaptive tutoring for grades K–12<br>
    <a class="ig-link" href="https://instagram.com/learnwithgallop" target="_blank" rel="noopener">Follow along on Instagram at @learnwithgallop</a><br>
    <a href="#standards" style="color:inherit;opacity:.8">Standards Alignment</a> · <a href="#help" style="color:inherit;opacity:.8">Help &amp; Support</a> · <a href="mailto:support@learnwithgallop.com" style="color:inherit;opacity:.8">support@learnwithgallop.com</a> · <a href="/terms" style="color:inherit;opacity:.8">Terms of Service</a> · <a href="/privacy" style="color:inherit;opacity:.8">Privacy Policy</a>
  </div>
  ${State.me.role !== 'parent' && State.me.role !== 'kid' ? `<div class="sticky-cta"><button class="btn" onclick="window.__subscribeIntent=0;location.hash='#signup'">Start free trial — no card →</button></div>` : ''}`);
  wireChrome();
  // Interactive product tour: auto-advance through the six views, pause on hover, tabs jump.
  (function initTour() {
    const tour = document.getElementById('tour'); if (!tour) return;
    const STEPS = 6, DWELL = 4800; let cur = 0, timer = null, paused = false;
    const bar = document.getElementById('tour-bar');
    const show = (n) => {
      cur = (n + STEPS) % STEPS;
      tour.querySelectorAll('.tour-slide').forEach(el => el.classList.toggle('active', +el.dataset.step === cur));
      tour.querySelectorAll('.tour-cap').forEach(el => el.classList.toggle('active', +el.dataset.step === cur));
      tour.querySelectorAll('.tour-tab').forEach(el => el.classList.toggle('active', +el.dataset.step === cur));
      if (bar) { bar.style.transition = 'none'; bar.style.width = '0%'; requestAnimationFrame(() => requestAnimationFrame(() => { bar.style.transition = `width ${DWELL}ms linear`; bar.style.width = '100%'; })); }
    };
    const start = () => { clearInterval(timer); timer = setInterval(() => { if (!paused) show(cur + 1); }, DWELL); };
    tour.querySelectorAll('.tour-tab').forEach(tab => tab.onclick = () => { show(+tab.dataset.step); start(); });
    tour.addEventListener('mouseenter', () => { paused = true; });
    tour.addEventListener('mouseleave', () => { paused = false; });
    show(0); start();
  })();
  const nlF = $('#nl-form');
  if (nlF) nlF.onsubmit = async (e) => {
    e.preventDefault();
    try {
      await api('/newsletter', { method: 'POST', body: { email: $('#nl-email').value } });
      nlF.style.display = 'none'; $('#nl-done').style.display = 'block';
    } catch (err) { toast(err.message || 'Hmm, that didn\'t go through — try again?'); }
  };
});

// ======================= legal =======================
function legalPage(title, bodyHTML) {
  app().innerHTML = topbar(`<div class="container" style="max-width:760px">
    <div class="card" style="line-height:1.7">
      <h2>${title}</h2>
      <p class="muted" style="margin:6px 0 18px">Last updated: July 19, 2026 · Gallop Learning Academy is operated by Lotus Farms LLC.</p>
      ${bodyHTML}
      <p style="margin-top:22px"><button class="btn ghost small" style="color:var(--brand);border-color:var(--brand)" onclick="location.hash='#'">← Back to home</button></p>
    </div></div>`);
  wireChrome();
}
// Legal pages have canonical, crawlable static versions at /terms and /privacy.
// The in-app hash links redirect there so there is a single source of legal truth.
route('terms', async () => { location.replace('/terms'); });
route('privacy', async () => { location.replace('/privacy'); });


// ======================= demo lesson (no signup!) =======================
const DEMO_QUESTIONS = [
  { subject: 'math', emoji: '🔢', color: '#0a84c1', grade: 'Grade 2', skill: 'Money Math',
    prompt: 'You buy a snack for 65¢ and pay with $1. How much change do you get?', choices: ['35¢', '45¢', '25¢', '65¢'], answer: 0,
    hint: 'Count up from 65 to 100.', explain: '100 − 65 = 35. You get 35¢ back.', why: 'This is how you make sure you get the right change at the store! 🪙' },
  { subject: 'english', emoji: '📚', color: '#7a3fb8', grade: 'Grade 3', skill: 'Word Detective',
    prompt: 'The dog was ENORMOUS, it barely fit through the door! Enormous means…', choices: ['very big', 'very loud', 'very furry', 'very fast'], answer: 0,
    hint: 'It barely FIT through the door.', explain: 'Enormous = huge, giant, very big!', why: 'Knowing lots of words helps you say exactly what you mean!' },
  { subject: 'science', emoji: '🔬', color: '#1a9e63', grade: 'Grade 2', skill: 'States of Matter',
    prompt: 'The bathroom mirror fogs up during a hot shower. That fog comes from water turning into a…', choices: ['gas, then back to tiny drops', 'solid', 'rock', 'rainbow'], answer: 0,
    hint: 'Steam rises from hot water…', explain: 'Hot water evaporates into vapor (a gas), then condenses on the cool mirror!', why: 'Chefs use this science, heat, mixing, freezing, every time they cook! 👩‍🍳' },
  { subject: 'spanish', emoji: '🌎', color: '#d4522a', grade: 'Beginner', skill: 'Los Colores',
    prompt: 'A stop sign is "rojo". Rojo means…', choices: ['red', 'blue', 'round', 'stop'], answer: 0,
    hint: 'What color is a stop sign?', explain: '¡Sí! Rojo = red.', why: 'Over 500 million people speak Spanish, that\'s a lot of new friends! 🌎' },
  { subject: 'math', emoji: '🔢', color: '#0a84c1', grade: 'Grade 5', skill: 'Percent Power',
    prompt: 'A $40 video game is 25% off. What do you pay?', choices: ['$30', '$25', '$35', '$10'], answer: 0,
    hint: '25% of 40 is 10.', explain: '25% of $40 = $10 off → $30.', why: 'Smart shoppers and founders both live in percentages.' },
  { subject: 'english', emoji: '📚', color: '#7a3fb8', grade: 'Grade 6', skill: 'Figurative Language',
    prompt: '"I\'ve told you a MILLION times to clean your room!" This is…', choices: ['hyperbole (huge exaggeration)', 'a plain fact', 'a simile (compares with like/as)', 'onomatopoeia (a sound word)'], answer: 0,
    hint: 'Was it really a million?', explain: 'Hyperbole exaggerates for effect.', why: 'Great writers use these tools, and great readers spot them.' }
];
route('demo', async () => {
  let idx = 0, correct = 0;
  function render() {
    if (idx >= DEMO_QUESTIONS.length) {
      Confetti.burst(200); Sound.levelup();
      app().innerHTML = topbar(`<div class="container" style="max-width:560px"><div class="card center">
        <div class="big-emoji">🐎</div>
        <h2>${correct}/${DEMO_QUESTIONS.length}, and that's just a sample!</h2>
        <p class="muted" style="margin:12px 0 6px">The real tutor goes much further: a placement quiz finds your child's exact level in each subject, every answer adapts what comes next, and correct answers earn tokens for the games arcade.</p>
        <p class="muted" style="margin-bottom:18px">All four subjects. Every grade K–12. From $34/month.</p>
        <button class="btn green" onclick="window.__subscribeIntent=0;location.hash='#signup'">Start 7-Day Free Trial →</button>
        <button class="btn sun" style="margin-left:8px" onclick="window.__subscribeIntent=1;location.hash='#signup'">Subscribe now →</button>
        <p class="muted" style="margin-top:10px;font-size:.82rem">Free for 7 days, or subscribe today and skip the wait. Either way you can cancel anytime.</p>
        <button class="btn ghost small" style="color:var(--brand);border-color:var(--brand);margin-top:8px" onclick="location.hash='#'">Back</button>
      </div></div>`);
      wireChrome();
      return;
    }
    const qn = DEMO_QUESTIONS[idx];
    let answered = false;
    // Shuffle so the correct answer isn't always the first choice (looks rigged otherwise).
    const correctText = qn.choices[qn.answer];
    const shuffled = qn.choices.slice();
    for (let z = shuffled.length - 1; z > 0; z--) { const j = Math.floor(Math.random() * (z + 1));[shuffled[z], shuffled[j]] = [shuffled[j], shuffled[z]]; }
    const ansIdx = shuffled.indexOf(correctText);
    app().innerHTML = topbar(`<div class="container lesson-wrap">
      <div class="lesson-top"><b>${qn.emoji} Sample lesson, see how Gallop teaches</b>${gallopTrack(idx / DEMO_QUESTIONS.length * 100)}<b>${idx + 1}/${DEMO_QUESTIONS.length}</b></div>
      <div class="q-card">
        <span class="q-skill" style="background:${qn.color}">${esc(qn.skill)} · ${esc(qn.grade)}</span>
        <div class="q-prompt">${esc(qn.prompt)}</div>
        <div class="choices">${shuffled.map((c, i) => `<button class="choice" data-i="${i}">${esc(c)}</button>`).join('')}</div>
        <div class="hint-box" id="hint-box">💡 ${esc(qn.hint)}</div>
        <div class="feedback" id="feedback" aria-live="polite"></div>
        <div class="lesson-actions">
          <button class="btn sun small" id="hint-btn">💡 Hint</button>
          <button class="btn green" id="next-btn" style="display:none">Next →</button>
          <button class="btn ghost small" style="color:#7f8c9b;border-color:#dfe6e9;margin-left:auto" onclick="location.hash='#'">Exit demo</button>
        </div>
      </div>
    </div>`);
    wireChrome();
    $('#hint-btn').onclick = () => { $('#hint-box').classList.add('show'); Sound.click(); };
    document.querySelectorAll('.choice').forEach(b => b.onclick = () => {
      if (answered) return; answered = true;
      const i = Number(b.dataset.i);
      const ok = i === ansIdx;
      document.querySelectorAll('.choice').forEach(x => x.disabled = true);
      b.classList.add(ok ? 'correct' : 'wrong');
      if (!ok) { const _ar = document.querySelectorAll('.choice')[ansIdx]; if (_ar) _ar.classList.add('answer-reveal'); }
      const fb = $('#feedback');
      if (ok) { correct++; Sound.correct(); Confetti.burst(40); fb.className = 'feedback good'; }
      else { Sound.wrong(); fb.className = 'feedback bad'; }
      fb.innerHTML = `<b>${ok ? 'Nailed it!' : 'Almost!'}</b> ${esc(qn.explain)}<div class="why-line">🌍 <b>Real world:</b> ${esc(qn.why)}</div>`;
      $('#next-btn').style.display = 'inline-flex';
      $('#next-btn').onclick = () => { Sound.click(); idx++; render(); };
    });
  }
  render();
});

// ======================= parent signup/login =======================
route('signup', async () => {
  const subscribing = !!window.__subscribeIntent;
  app().innerHTML = topbar(`<div class="container" style="max-width:460px">
    <div class="card">
      <h2>Create your family account 👨‍👩‍👧</h2>
      ${subscribing ? `<p class="muted" style="margin:2px 0 12px">Quick account first, then choose your plan and you're all set — no trial, straight to full access.</p>` : ''}
      <label>Your name</label><input id="f-name" placeholder="e.g. Steve">
      <label>Email</label><input id="f-email" type="email" placeholder="you@example.com">
      <label>Password (8+ characters)</label><input id="f-pass" type="password">
      <div class="error-msg" id="f-err"></div>
      <label style="display:flex;gap:9px;align-items:flex-start;margin-top:16px;font-size:.82rem;color:#5b6478;font-weight:400;cursor:pointer">
        <input type="checkbox" id="f-consent" style="margin-top:3px;flex:none;width:16px;height:16px">
        <span>I am the parent or legal guardian and am 18 or older. I agree to the <a href="/terms" target="_blank" rel="noopener">Terms</a> and <a href="/privacy" target="_blank" rel="noopener">Privacy Policy</a>, and I consent to Gallop collecting the limited information described there to provide the service to my child (COPPA).</span>
      </label>
      <button class="btn green" style="margin-top:16px;width:100%" id="f-go">${subscribing ? 'Continue to plans →' : 'Start Free Trial →'}</button>
      <p class="muted center" style="margin-top:10px;font-size:.85rem">${subscribing ? 'Subscribe today · Cancel anytime, one click' : '7 days free · No credit card required · Cancel anytime'}</p>
      <p class="muted center" style="margin-top:10px">Already have an account? <a href="#login">Log in</a></p>
    </div></div>`);
  wireChrome();
  $('#f-go').onclick = async () => {
    if (!$('#f-consent').checked) { showError('#f-err', 'Please confirm you are the parent or guardian and agree to the Terms and Privacy Policy to continue.'); return; }
    try {
      await api('/auth/signup', { method: 'POST', body: { name: $('#f-name').value, email: $('#f-email').value, password: $('#f-pass').value, consent: true } });
      gtmPush({ event: 'sign_up', method: 'email', intent: window.__subscribeIntent ? 'subscribe' : 'trial' });
      await refreshMe(); Sound.levelup(); State.onboard = true;
      // Came from "Sign up now"? Go straight to plan choice → checkout, skipping the trial.
      if (window.__subscribeIntent) { window.__subscribeIntent = 0; location.hash = '#subscribe'; }
      else location.hash = '#parent';
    } catch (e) { showError('#f-err', e.message); }
  };
});

// ======================= choose a plan & subscribe (skip-the-trial path) =======================
route('subscribe', async () => {
  await refreshMe();
  if (State.me.role !== 'parent') { location.hash = '#login'; return; }
  const p = State.me.parent;
  if (p && p.sub_status === 'active') { location.hash = '#parent'; return; } // already subscribed
  app().innerHTML = topbar(`<div class="container" style="max-width:560px">
    <div class="card center">
      <img src="/logo-roundel.png" alt="" style="width:76px;height:76px">
      <h2 style="margin-top:8px">Choose your plan</h2>
      <p class="muted" style="margin:8px auto 14px;max-width:30rem">Full access to all four subjects, the adaptive tutor, the games arcade, and weekly parent reports.</p>
      <p class="muted center" style="margin:0 auto 18px;font-size:.82rem;max-width:34rem">Both plans are recurring subscriptions that <b>automatically renew each month</b> until you cancel. You can cancel anytime in one click from your Parent Dashboard — cancellation stops future charges and you keep access through the period you've paid for.</p>
      <div class="plan-grid">
        <div class="plan-card featured">
          <div class="plan-badge">Most popular</div>
          <h3>Family</h3><div class="plan-price">$54<span>/mo</span></div>
          <p class="muted">Up to 4 children · auto-renews monthly</p>
          <button class="btn green" style="width:100%;margin-top:10px" id="sub-family">Subscribe →</button>
        </div>
        <div class="plan-card">
          <h3>Solo</h3><div class="plan-price">$34<span>/mo</span></div>
          <p class="muted">1 child · auto-renews monthly</p>
          <button class="btn" style="width:100%;margin-top:10px" id="sub-solo">Subscribe →</button>
        </div>
      </div>
      <p class="muted center" style="margin-top:16px;font-size:.85rem">🔒 Secure checkout through Stripe — we never see your card number.</p>
      <p class="muted center" style="margin-top:10px;font-size:.85rem">Want to try before you buy? <a href="#parent">Start with a free 7-day trial instead</a> — no card required, and you're only charged if you choose to subscribe.</p>
    </div></div>`);
  wireChrome();
  const fam = $('#sub-family'), solo = $('#sub-solo');
  if (fam) fam.onclick = () => checkout('family');
  if (solo) solo.onclick = () => checkout('solo');
});

route('login', async () => {
  app().innerHTML = topbar(`<div class="container" style="max-width:460px">
    <div class="card">
      <h2>Parent login 🔐</h2>
      <label>Email</label><input id="f-email" type="email">
      <label>Password</label><input id="f-pass" type="password">
      <div class="error-msg" id="f-err"></div>
      <button class="btn" style="margin-top:18px;width:100%" id="f-go">Log In →</button>
      <p class="muted center" style="margin-top:12px"><a href="#forgot">Forgot password?</a></p>
      <p class="muted center" style="margin-top:4px">New here? <a href="#signup">Create an account</a> · <a href="#kid-login">Kid login</a></p>
    </div></div>`);
  wireChrome();
  const go = async () => {
    try {
      await api('/auth/login', { method: 'POST', body: { email: $('#f-email').value, password: $('#f-pass').value } });
      await refreshMe(); location.hash = '#parent';
    } catch (e) { showError('#f-err', e.message); }
  };
  $('#f-go').onclick = go;
  $('#f-pass').addEventListener('keydown', e => e.key === 'Enter' && go());
});

// ======================= forgot password =======================
route('forgot', async () => {
  app().innerHTML = topbar(`<div class="container" style="max-width:460px">
    <div class="card">
      <h2>Reset your password 🔐</h2>
      <p class="muted" style="margin:6px 0 14px">Enter your account email and we'll send you a link to set a new password.</p>
      <label>Email</label><input id="fg-email" type="email" autocomplete="email">
      <div class="error-msg" id="fg-err"></div>
      <button class="btn" style="margin-top:16px;width:100%" id="fg-go">Send reset link →</button>
      <div id="fg-done" style="display:none;margin-top:14px;padding:12px 14px;background:#e2f8f1;color:#0c6b53;border-radius:12px;font-weight:600"></div>
      <p class="muted center" style="margin-top:12px"><a href="#login">← Back to login</a></p>
    </div></div>`);
  wireChrome();
  const go = async () => {
    const btn = $('#fg-go'); btn.disabled = true; btn.textContent = 'Sending…';
    try {
      const r = await api('/auth/forgot', { method: 'POST', body: { email: $('#fg-email').value } });
      $('#fg-done').style.display = 'block';
      $('#fg-done').textContent = '✓ ' + (r.message || 'If that email has an account, a reset link is on its way. Check your inbox (and spam).');
      btn.style.display = 'none';
    } catch (e) { showError('#fg-err', e.message); btn.disabled = false; btn.textContent = 'Send reset link →'; }
  };
  $('#fg-go').onclick = go;
  $('#fg-email').addEventListener('keydown', e => e.key === 'Enter' && go());
});

// ======================= reset password (from emailed link #reset/<token>) =======================
route('reset', async (token) => {
  app().innerHTML = topbar(`<div class="container" style="max-width:460px">
    <div class="card">
      <h2>Choose a new password 🔑</h2>
      <p class="muted" style="margin:6px 0 14px">Almost done — pick a new password (8+ characters).</p>
      <label>New password</label><input id="rs-pass" type="password" autocomplete="new-password">
      <label>Confirm new password</label><input id="rs-pass2" type="password" autocomplete="new-password">
      <div class="error-msg" id="rs-err"></div>
      <button class="btn green" style="margin-top:16px;width:100%" id="rs-go">Set new password →</button>
      <p class="muted center" style="margin-top:12px"><a href="#login">← Back to login</a></p>
    </div></div>`);
  wireChrome();
  const go = async () => {
    const pw = $('#rs-pass').value, pw2 = $('#rs-pass2').value;
    if (pw.length < 8) { showError('#rs-err', 'Password needs at least 8 characters.'); return; }
    if (pw !== pw2) { showError('#rs-err', 'The two passwords don\'t match.'); return; }
    const btn = $('#rs-go'); btn.disabled = true; btn.textContent = 'Saving…';
    try {
      await api('/auth/reset', { method: 'POST', body: { token, password: pw } });
      toast('✓ Password updated — you can log in now.');
      location.hash = '#login';
    } catch (e) { showError('#rs-err', e.message); btn.disabled = false; btn.textContent = 'Set new password →'; }
  };
  $('#rs-go').onclick = go;
  $('#rs-pass2').addEventListener('keydown', e => e.key === 'Enter' && go());
});

// ======================= kid login =======================
route('kid-login', async () => {
  app().innerHTML = topbar(`<div class="container" style="max-width:520px">
    <div class="card center">
      <div class="big-emoji">🚀</div>
      <h2>Launch Pad</h2>
      <p class="muted">Ask a grown-up for the family email the first time!</p>
      <label style="text-align:left">Family email</label><input id="k-email" type="email" value="${esc(localStorage.bp_family_email || '')}">
      <button class="btn" style="margin-top:14px" id="k-find">Find My Family →</button>
      <div class="error-msg" id="k-err"></div>
      <div id="k-kids" style="margin-top:18px"></div>
      <div id="k-pin" style="display:none">
        <h3 style="margin-top:10px">Enter your secret PIN 🤫</h3>
        <div class="pin-dots" id="pin-dots"></div>
        <div class="pinpad" id="pinpad"></div>
      </div>
    </div></div>`);
  wireChrome();
  let chosenKid = null, pin = '';
  $('#k-find').onclick = async () => {
    try {
      const email = $('#k-email').value;
      const { kids } = await api('/auth/family-kids?email=' + encodeURIComponent(email));
      localStorage.bp_family_email = email;
      if (!kids.length) return showError('#k-err', 'No learners yet, ask your parent to add you!');
      $('#k-kids').innerHTML = '<h3>Who are you?</h3><div class="avatar-pick" style="margin-top:10px">' +
        kids.map(k => `<div class="avatar-opt" data-id="${k.id}" title="${esc(k.name)}">${k.avatar_img ? avatarHTML(k) : (AVATARS[k.avatar] || '🦊')}<div style="font-size:.8rem;font-weight:700">${esc(k.name)}</div></div>`).join('') + '</div>';
      upgradeTiles();
      document.querySelectorAll('.avatar-opt').forEach(el => el.onclick = () => {
        document.querySelectorAll('.avatar-opt').forEach(x => x.classList.remove('sel'));
        el.classList.add('sel'); chosenKid = el.dataset.id; pin = '';
        $('#k-pin').style.display = 'block'; drawPin(); Sound.click();
      });
    } catch (e) { showError('#k-err', e.message); }
  };
  function drawPin() {
    $('#pin-dots').textContent = '●'.repeat(pin.length) + '○'.repeat(4 - pin.length);
    $('#pinpad').innerHTML = [1, 2, 3, 4, 5, 6, 7, 8, 9, '⌫', 0, '✓'].map(k =>
      `<button class="pinkey" data-k="${k}" aria-label="${k === '⌫' ? 'Delete last digit' : k === '✓' ? 'Enter PIN' : 'Digit ' + k}">${k}</button>`).join('');
    document.querySelectorAll('.pinkey').forEach(b => b.onclick = async () => {
      const k = b.dataset.k; Sound.click();
      if (k === '⌫') pin = pin.slice(0, -1);
      else if (k === '✓') return tryLogin();
      else if (pin.length < 4) pin += k;
      $('#pin-dots').textContent = '●'.repeat(pin.length) + '○'.repeat(4 - pin.length);
      if (pin.length === 4) tryLogin();
    });
  }
  async function tryLogin() {
    try {
      await api('/auth/kid-login', { method: 'POST', body: { email: $('#k-email').value, kidId: chosenKid, pin } });
      await refreshMe(); Sound.levelup(); Confetti.burst(60); location.hash = '#home';
    } catch (e) { pin = ''; drawPin(); showError('#k-err', e.message); Sound.wrong(); }
  }
});

// ======================= kid home =======================
route('home', async () => {
  if (State.me.role === 'guest') { location.hash = '#kid-login'; return; }
  const kidId = State.me.role === 'kid' ? State.me.kid.id : null;
  if (!kidId) { location.hash = '#parent'; return; }
  const data = await api(`/learn/${kidId}/overview`);
  let quests = null;
  try { quests = await api(`/learn/${kidId}/quests`); } catch (e) { /* non-critical */ }
  const k = data.kid;
  const questCard = quests ? `
    <div class="quest-card ${quests.allDone && !quests.claimed ? 'ready' : ''}">
      <div class="wg-head"><span>${playful() ? '🗺️ Today’s Quests' : 'Daily goals'}</span>
        <span>${quests.claimed ? '✅ Bonus collected!' : quests.allDone ? '🎁 Bonus ready!' : quests.quests.filter(q => q.done).length + '/3 done'}</span></div>
      <div class="quest-list">
        ${quests.quests.map(q => `
          <div class="quest-item ${q.done ? 'done' : ''}">
            <span class="q-check">${q.done ? '✅' : q.emoji}</span>
            <span class="q-label">${esc(q.label)}</span>
            <span class="q-prog">${q.progress}/${q.target}</span>
          </div>`).join('')}
      </div>
      ${quests.allDone && !quests.claimed ? `<button class="btn sun" id="claim-quest" style="margin-top:10px;width:100%">Collect ${quests.bonusCoins} bonus coins! 🪙</button>` : ''}
    </div>` : '';
  app().innerHTML = topbar(`<div class="container">
    <div class="kid-header">
      <div class="avatar-big" onclick="location.hash='#avatar'" style="cursor:pointer" title="Customize me!">${avatarHTML(k)}</div>
      <div>
        <h1>${playful() ? `Hi ${esc(k.name)}! Ready to level up? ⚡` : `Welcome back, ${esc(k.name)}.`}</h1>
        <div class="stat-chips" style="margin-top:8px">
          ${data.gallopOverall != null ? `<span class="chip gscore-chip" title="Your all-subjects Gallop Score — it climbs with everything you truly learn">🏆 Gallop Score <b>${data.gallopOverall}</b></span>` : ''}
          ${(() => { const r = rankFor(k.xp); return `<span class="chip rank-chip" title="${r.next ? (r.next.at - k.xp) + ' XP to ' + r.next.name : 'Top rank!'}">🏇 ${r.name}</span>`; })()}
          <span class="chip">${playful() ? '🔥 ' : ''}${k.streak}-day streak</span>
          <span class="chip">${playful() ? '⚡ ' : ''}${k.xp} XP</span>
          <span class="chip">${playful() ? '🪙 ' : ''}${k.coins} coins</span>
          <span class="chip">${playful() ? '🎟️ ' : ''}${k.play_tokens || 0} tokens</span>
        </div>
      </div>
      <div style="margin-left:auto"><button class="btn ghost small" onclick="location.hash='#report/${k.id}'">${playful() ? '📊 ' : ''}My Progress</button>
      <button class="btn ghost small" id="autoread-btn">${Voice.auto ? '🗣️ Read-aloud ON' : '🗣️ Read-aloud off'}</button></div>
    </div>
    ${(() => {
      const rec = data.recommended; if (!rec) return '';
      const s = data.subjects.find(x => x.subject === rec.subject); if (!s) return '';
      const title = rec.type === 'place' ? (playful() ? `Find your ${s.label} level!` : `Take your ${s.label} placement`)
        : rec.type === 'boost' ? (playful() ? `${s.label} needs a power-up 💪` : `${s.label}: your biggest gains are here`)
        : rec.type === 'review' ? (playful() ? `Keep ${s.label} sharp 🧠` : `${s.label}: time for a quick review`)
        : rec.type === 'more' ? (playful() ? `Keep the ${s.label} roll going 🔥` : `${s.label}: keep the momentum`)
        : (playful() ? `Fresh ${s.label} adventure awaits ✨` : `${s.label}: nothing logged today`);
      const sub = rec.type === 'place' ? (playful() ? 'A quick quiz finds your perfect starting spot.' : 'Short adaptive assessment, a few minutes.')
        : rec.type === 'boost' ? (playful() ? 'A few wins here and your skill power jumps!' : 'Targeted reps where mastery is lowest.')
        : rec.type === 'review' ? (playful() ? 'A little review so it really sticks!' : 'A spaced-review check so mastery lasts.')
        : (playful() ? 'Your tutor picked this just for you.' : 'Recommended by your progress data.');
      return `<div class="up-next" data-upnext="${rec.subject}" data-place="${rec.type === 'place' ? 1 : 0}">
        <div class="un-emoji">${s.emoji}</div>
        <div class="un-text"><span class="un-label">${playful() ? '🐎 UP NEXT' : 'UP NEXT'}</span><b>${title}</b><span class="un-sub">${sub}</span></div>
        <button class="btn sun" tabindex="-1" aria-hidden="true">${rec.type === 'place' ? 'Find my level →' : 'Start →'}</button>
      </div>`;
    })()}
    <div class="week-gallop">
      <div class="wg-head"><span>${playful() ? '🏇 This week’s gallop' : 'This week'}</span><span>${data.weekAnswers || 0} / ${(k.weekly_goal || 12) * 10} answers</span></div>
      ${gallopTrack(Math.min(100, (data.weekAnswers || 0) / ((k.weekly_goal || 12) * 10) * 100))}
      ${(() => {
        const days = [];
        for (let i = 13; i >= 0; i--) { const d = new Date(Date.now() - i * 864e5).toISOString().slice(0, 10); days.push({ d, on: (data.activeDays || []).includes(d) }); }
        return `<div class="streak-dots" title="Your last 14 days">${days.map(x => `<span class="sdot ${x.on ? 'on' : ''}"></span>`).join('')}<span class="sdot-label">${playful() ? 'every dot = a day you learned!' : 'last 14 days'}</span></div>`;
      })()}
    </div>
    ${questCard}
    <div id="ach-banner"></div>
    ${(k.grade >= 6 && data.subjects.some(s => s.placed)) ? `
    <div class="focus-launch">
      <div><b>🎯 Focus Session</b><span class="muted-inv">, 15 minutes, one subject, zero distractions. Serious progress, tracked.</span></div>
      <div class="focus-btns">${data.subjects.filter(s => s.placed).map(s => `<button class="btn ghost small" data-focus="${s.subject}">${s.emoji} ${esc(s.label)}</button>`).join('')}</div>
    </div>` : ''}
    <div class="subject-grid">
      ${data.subjects.map(s => `
        <div class="subject-card" style="background:linear-gradient(135deg, ${s.color}, ${s.color}cc)" data-sub="${s.subject}" data-placed="${s.placed ? 1 : 0}">
          <div class="blob"></div>
          <div class="semoji">${s.emoji}</div>
          <h3>${esc(s.label)}</h3>
          <div class="lvl">${s.placed ? (showLevel() ? (playful() ? '📍 ' : 'Working at ') + esc(s.levelName) : (playful() ? '📍 Ready to learn!' : 'Placed — ready to go')) : (playful() ? '✨ Take placement quiz!' : 'Placement assessment needed')}</div>
          <button class="btn sun small" style="margin-top:14px" tabindex="-1" aria-hidden="true">${s.placed ? (playful() ? 'Play →' : 'Continue →') : 'Find my level →'}</button>
        </div>`).join('')}
    </div>
    <div class="zone-row">
      <div class="zone-card" onclick="location.hash='#learn'"><span class="zemoji">📖</span><b>Lessons</b><span class="muted">${playful() ? 'Find any topic and learn it first!' : 'Search or browse any concept — learn it step by step'}</span></div>
      ${!gamesOn() ? '' : gamesUnlocked()
        ? `<div class="zone-card" onclick="location.hash='#play'"><span class="zemoji">🕹️</span><b>${playful() ? 'Play Zone' : 'Arcade'}</b><span class="muted">${playful() ? 'Games cost 1 🎟️, earn tokens by learning!' : 'Break games, 1 token each, earned by correct answers'}</span></div>`
        : gamesTimeExhausted()
          ? `<div class="zone-card locked" onclick="location.hash='#play'"><span class="zemoji">⏰</span><b>${playful() ? 'Play Zone' : 'Arcade'}</b><span class="muted">Game time's up for today — back tomorrow!</span></div>`
          : `<div class="zone-card locked" onclick="location.hash='#play'"><span class="zemoji">🔒</span><b>${playful() ? 'Play Zone' : 'Arcade'}</b><span class="muted">Answer ${gamesRemaining()} more question${gamesRemaining() === 1 ? '' : 's'} today to unlock the games!</span></div>`}
      <div class="zone-card" onclick="location.hash='#avatar'"><span class="zemoji">🎨</span><b>${playful() ? 'My Avatar' : 'Avatar'}</b><span class="muted">${playful() ? 'Spend coins on hats, pets & worlds' : 'Customize your profile with earned coins'}</span></div>
      <div class="zone-card" onclick="location.hash='#snacks'"><span class="zemoji">🍿</span><b>${playful() ? 'Snack Shack' : 'Snack Shack'}</b><span class="muted">${playful() ? 'Spend coins on treats from the vending machine!' : 'Trade coins for snacks & treats'}</span></div>
      <div class="zone-card" onclick="location.hash='#trophies'"><span class="zemoji">🏆</span><b>Trophy Case</b><span class="muted">${playful() ? 'Your badges, trophies & next goals!' : 'Badges, certificates & milestones'}</span></div>
      <div class="zone-card" onclick="location.hash='#buddies'"><span class="zemoji">💌</span><b>Buddies</b><span class="muted">${playful() ? 'Cheer on your friends!' : 'See your crew’s streaks and send props'}</span></div>
      ${k.grade >= 3 ? `<div class="zone-card" onclick="location.hash='#careers/${k.id}'"><span class="zemoji">🔭</span><b>Explore Futures</b><span class="muted">${playful() ? 'Discover cool jobs & the real people who do them!' : 'Real careers, what they involve, and people who do them'}</span></div>` : ''}
      ${k.grade >= 8 ? `<div class="zone-card exam-zone" onclick="location.hash='#exam'"><span class="zemoji">🎓</span><b>Advanced Track</b><span class="muted">Ahead of your grade? AP, Honors & college-level practice</span></div>` : ''}
    </div>
  </div>`);
  wireChrome();
  $('#autoread-btn').onclick = () => { $('#autoread-btn').textContent = Voice.toggleAuto() ? '🗣️ Read-aloud ON' : '🗣️ Read-aloud off'; };
  // Prominent achievements banner, lazy-loaded so home stays snappy; drives striving
  (async () => {
    try {
      const a = await api(`/learn/${kidId}/achievements`);
      const el = $('#ach-banner'); if (!el) return;
      const goal = a.nextGoals && a.nextGoals[0];
      const RAR = { common: '#9aa4b2', rare: '#3d8bff', epic: '#a855f7', legendary: '#f0a500' };
      el.innerHTML = `<div class="ach-banner" onclick="location.hash='#trophies'">
        <div class="ab-trophy">🏆</div>
        <div class="ab-mid">
          <div class="ab-top"><b>${playful() ? 'Trophy Case' : 'Achievements'}</b><span class="ab-count">${a.earnedCount}/${a.totalBadges} badges</span></div>
          ${goal ? `<div class="ab-goal"><span class="ab-goal-emoji">${goal.emoji}</span>
            <div class="ab-goal-body"><span class="ab-goal-name">${playful() ? 'Next: ' : ''}${esc(goal.name)}, ${esc(goal.desc)}</span>
              <div class="ab-prog"><div class="ab-prog-fill" style="width:${Math.round(goal.cur/goal.goal*100)}%;background:${RAR[goal.rarity]}"></div></div></div>
            <span class="ab-goal-count">${goal.cur}/${goal.goal}</span></div>`
          : `<div class="ab-goal"><span class="muted">🎉 Every badge earned, you're a legend!</span></div>`}
        </div>
        <div class="ab-cta">View →</div>
      </div>`;
    } catch (e) { /* non-critical */ }
  })();
  const cq = $('#claim-quest');
  if (cq) cq.onclick = async () => {
    try {
      const r = await api(`/learn/${kidId}/quests/claim`, { method: 'POST', body: {} });
      Sound.levelup(); Confetti.burst(180);
      await refreshMe();
      navigate();
    } catch (e) { Sound.wrong(); }
  };
  // Monday-style weekly recap: once per week, celebrate LAST week's work
  try {
    const wk = (() => { const d = new Date(); const o = new Date(d.getFullYear(), 0, 1); return d.getFullYear() + '-' + Math.ceil(((d - o) / 864e5 + o.getDay() + 1) / 7); })();
    const recapKey = `bp_recap_${k.id}_${wk}`;
    if (data.lastWeek && data.lastWeek.answers >= 10 && !localStorage[recapKey]) {
      localStorage[recapKey] = '1';
      const lw = data.lastWeek;
      const acc = Math.round(lw.correct / lw.answers * 100);
      const div = document.createElement('div');
      div.className = 'celebrate';
      div.innerHTML = `<img src="/logo-roundel.png" alt="" style="width:100px;height:100px">
        <h2>${playful() ? 'Look what you did last week!' : 'Last week, logged.'}</h2>
        <div class="summary-stats" style="background:rgba(255,255,255,.12)">
          <div class="sstat" style="color:#fff"><div class="n" style="color:#fff">${lw.answers}</div>questions</div>
          <div class="sstat" style="color:#fff"><div class="n" style="color:#fff">${acc}%</div>correct</div>
          <div class="sstat" style="color:#fff"><div class="n" style="color:#fff">🔥${k.streak}</div>streak</div>
        </div>
        <p style="font-size:1.05rem;max-width:420px">${playful() ? 'A brand-new week of quests starts NOW. Let\'s make this one even bigger! 🐎' : 'New week, fresh targets. Keep the compound interest going.'}</p>
        <button class="btn sun">${playful() ? 'Let\'s go! 🐎' : 'Start the week →'}</button>`;
      div.querySelector('button').onclick = () => { div.remove(); Sound.levelup(); Confetti.burst(120); };
      document.body.appendChild(div);
    }
  } catch (e) { /* recap is a nice-to-have */ }
  const un = document.querySelector('.up-next');
  if (un) un.onclick = () => { Sound.click(); location.hash = (un.dataset.place === '1' ? '#placement/' : '#lesson/') + un.dataset.upnext; };
  document.querySelectorAll('[data-focus]').forEach(b => b.onclick = () => { Sound.click(); location.hash = '#lesson/' + b.dataset.focus + '/focus'; });
  document.querySelectorAll('.subject-card').forEach(el => el.onclick = () => {
    Sound.click();
    location.hash = (el.dataset.placed === '1' ? '#lesson/' : '#placement/') + el.dataset.sub;
  });
});

// ======================= placement quiz =======================
route('placement', async (subject) => {
  if (State.me.role !== 'kid') { location.hash = '#kid-login'; return; }
  if (!SUBJECT_STYLE[subject]) { location.hash = '#home'; return; }
  const kidId = State.me.kid.id;
  const style = SUBJECT_STYLE[subject];
  let current = null;

  async function step(body) {
    try {
      const data = await api(`/learn/${kidId}/placement/${subject}`, { method: 'POST', body: body || { reset: current === null } });
      if (data.done) return finish(data);
      current = data;
      render(data);
    } catch (e) {
      if (e.status === 402) { renderPaywall(e.data && e.data.reason); return; }
      app().innerHTML = topbar(`<div class="container" style="max-width:520px"><div class="card center">
        <div class="big-emoji">🐎</div><h2>Quick hiccup!</h2>
        <p class="muted" style="margin:10px 0 18px">That didn't load. Tap below to continue your placement quiz.</p>
        <button class="btn green" id="retry-p">Continue →</button>
        <button class="btn ghost small" style="margin-left:8px" onclick="location.hash='#home'">🏠 Home</button>
      </div></div>`);
      wireChrome();
      $('#retry-p').onclick = () => { Sound.click(); step(body); };
    }
  }
  function render(data) {
    const qn = data.question;
    app().innerHTML = topbar(`<div class="container lesson-wrap">
      <div class="lesson-top">
        <b>${style.emoji} Finding your ${esc(subject)} level…</b>
        ${gallopTrack(Math.min(100, data.progress / 8 * 100))}
      </div>
      <div class="q-card">
        <span class="q-skill" style="background:${style.color}">${esc(qn.skillName)}</span>
        <button class="btn ghost small" style="float:right;color:${style.color};border-color:${style.color}" id="say-btn">🔊 Read it</button>
        ${qn.passage ? passageHTML(qn.passage, playful()) : ''}
        <div class="q-prompt">${esc(qn.prompt)}</div>
        <div class="choices">${qn.choices.map((c, i) => `<button class="choice" data-i="${i}">${esc(c)}</button>`).join('')}
          <button class="choice idk" data-i="-1">🤷 ${playful() ? "I haven't learned this yet" : "Haven't covered this yet"}</button>
        </div>
        <div class="lesson-actions" style="justify-content:space-between">
          <span class="muted" id="pick-hint" style="font-size:.9rem">${playful() ? 'Tap your answer, then press Next.' : 'Choose an answer, then press Next.'}</span>
          <button class="btn green" id="place-next" disabled style="opacity:.5">Next →</button>
        </div>
        ${data.progress === 0 ? `<p class="muted" style="margin-top:14px">${playful() ? 'No guessing needed! Saying "I haven\'t learned this yet" is a SMART answer, it helps me find lessons that fit you. You can change your pick before Next.' : 'Skip anything you haven\'t covered, honest answers give you an accurate starting level. You can change your answer before pressing Next.'}</p>` : ''}
      </div>
    </div>`);
    wireChrome();
    const vlang = subject === 'spanish' ? 'es-ES' : 'en-US';
    $('#say-btn').onclick = () => Voice.speak(qn.passage ? qn.prompt : (qn.voice || qn.prompt), vlang);
    const pread = $('.passage-read'), pwords = $('.passage-words');
    if (pread && pwords) pread.onclick = () => { Sound.click(); Voice.readAlong(pwords, vlang); };
    // Auto: read the STORY aloud for passages (delight for the littles), else the question
    if (qn.passage && pwords && Voice.auto) Voice.readAlong(pwords, vlang);
    else if (Voice.auto) Voice.speak(qn.voice || qn.prompt, vlang);
    // Placement is deliberate: picking an answer HIGHLIGHTS it (and the child can change
    // their mind) — nothing is submitted until they press Next. We never flash right/wrong
    // during a placement quiz; it's a level-finder, not a graded test.
    let picked = null;
    const nextBtn = $('#place-next'), hint = $('#pick-hint');
    document.querySelectorAll('.choice').forEach(b => b.onclick = () => {
      Sound.click();
      document.querySelectorAll('.choice').forEach(x => x.classList.remove('picked'));
      b.classList.add('picked');
      picked = Number(b.dataset.i);
      nextBtn.disabled = false; nextBtn.style.opacity = '1';
      if (hint) hint.textContent = picked === -1 ? (playful() ? "That's okay — press Next." : 'Marked as not covered — press Next.') : (playful() ? 'Nice! Press Next when ready.' : 'Press Next to continue.');
    });
    nextBtn.onclick = () => {
      if (picked === null) return;
      Sound.click();
      nextBtn.disabled = true; nextBtn.style.opacity = '.5';
      step({ answerIndex: picked, questionAnswerIndex: qn.answerIndex, probeGrade: data.probeGrade, skillName: qn.skillName });
    };
  }
  function finish(data) {
    Sound.levelup(); Confetti.burst(160);
    // Only name the grade level to the child if the parent has opted to reveal it — otherwise a
    // child who placed below their grade would see it here. The engine still works at the real level.
    const heading = showLevel() ? `Level found: ${esc(data.levelName)}!` : `You're all set! 🎉`;
    app().innerHTML = topbar(`<div class="container lesson-wrap"><div class="card center">
      <div class="big-emoji">🎯</div>
      <h2>${heading}</h2>
      <p class="muted" style="margin:10px 0 20px">We watched how you answered and picked the spot that fits you best in ${esc(subject)}. Not too easy, not too hard, just right. You'll move up as soon as you show you're ready.</p>
      <button class="btn green" onclick="location.hash='#lesson/${subject}'">Start Learning →</button>
      <button class="btn ghost small" style="color:var(--brand);border-color:var(--brand);margin-left:8px" onclick="location.hash='#home'">Back Home</button>
    </div></div>`);
    wireChrome();
  }
  await step(null);
});

// ======================= lesson player =======================
route('lesson', async (subject, mode, anchor) => {
  if (State.me.role !== 'kid') { location.hash = '#kid-login'; return; }
  if (!SUBJECT_STYLE[subject]) { location.hash = '#home'; return; }
  const kidId = State.me.kid.id;
  const style = SUBJECT_STYLE[subject];
  const focus = mode === 'focus';
  // A lesson hands off to practice as #lesson/<subject>/<skillId> (or
  // #lesson/<subject>/focus/<skillId>). When arg2 isn't the "focus" keyword it IS
  // the anchor skill, so "finish a lesson → 10 questions on THAT skill" holds.
  const anchorSkill = focus ? (anchor || null) : (mode && mode !== 'focus' ? mode : null);
  const FOCUS_MIN = 15;
  const SESSION_LEN = focus ? 9999 : 10;
  const session = { n: 0, correct: 0, xp: 0, startedAt: Date.now(), events: [], endAt: focus ? Date.now() + FOCUS_MIN * 60000 : null, focusSkill: anchorSkill };
  let focusTimer = null;
  const fmtLeft = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  if (focus) {
    focusTimer = setInterval(() => {
      const el = $('#focus-left');
      if (!el) { clearInterval(focusTimer); return; }   // navigated away
      const left = session.endAt - Date.now();
      if (left <= 0) { clearInterval(focusTimer); summary(); return; }
      el.textContent = fmtLeft(left);
      if (left < 60000) el.style.color = '#d97b4f';
    }, 1000);
  }

  async function nextQuestion() {
    if (focus && Date.now() >= session.endAt) return summary();
    if (session.n >= SESSION_LEN) return summary();
    try {
      // Keep the mission on one skill: once anchored, ask the server for that same skill
      // until it's mastered (then it hands us a new skill and we re-anchor below).
      const q = session.focusSkill ? `?focus=${encodeURIComponent(session.focusSkill)}` : '';
      const data = await api(`/learn/${kidId}/next/${subject}${q}`);
      // Anchor to the served skill (a labeled retention "Memory Check" never re-anchors,
      // so a spaced-review question doesn't derail the mission's focus).
      if (data && data.skill && data.skill.id && data.mode !== 'retention') session.focusSkill = data.skill.id;
      render(data);
    } catch (e) {
      if (e.status === 402) { renderPaywall(e.data && e.data.reason); return; }
      if (e.status === 401) { toast('Please log back in to keep going!'); location.hash = '#kid-login'; return; }
      // Never leave a kid stuck: one auto-retry, then a friendly tap-to-retry card.
      try {
        await new Promise(r => setTimeout(r, 800));
        const q = session.focusSkill ? `?focus=${encodeURIComponent(session.focusSkill)}` : '';
        const data = await api(`/learn/${kidId}/next/${subject}${q}`);
        if (data && data.skill && data.skill.id && data.mode !== 'retention') session.focusSkill = data.skill.id;
        render(data);
      } catch (e2) {
        if (e2.status === 401) { toast('Please log back in to keep going!'); location.hash = '#kid-login'; return; }
        app().innerHTML = topbar(`<div class="container" style="max-width:520px"><div class="card center">
          <div class="big-emoji">🐎</div><h2>Whoa, quick water break!</h2>
          <p class="muted" style="margin:10px 0 18px">The next question didn't load. Your progress is saved, tap below to keep going.</p>
          <button class="btn green" id="retry-q">Keep Going →</button>
          <button class="btn ghost small" style="color:#7f8c9b;border-color:#dfe6e9;margin-left:8px" onclick="location.hash='#home'">Back to Subjects</button>
        </div></div>`);
        wireChrome();
        $('#retry-q').onclick = () => { Sound.click(); nextQuestion(); };
      }
    }
  }

  // Strong nudge: when a brand-new skill has a lesson the kid hasn't done yet,
  // lead with the lesson (Step 1) before the practice (Step 2). Skippable — and
  // capped at 2 interruptions per session so a run of new skills doesn't turn
  // into lesson-gate → one question → lesson-gate again. After the cap, new
  // skills show only the small "watch the lesson" banner on the question card.
  const gatedSkills = new Set();
  let gatesShown = 0;
  function lessonDoneFor(teach) { try { return teach && localStorage['bp_lesson_' + teach.id] === '1'; } catch (e) { return false; } }
  function render(data) {
    const sid = data.skill && data.skill.id;
    const teach = (window.BP.lessonForSkill && sid) ? window.BP.lessonForSkill(subject, sid) : null;
    if (teach && !lessonDoneFor(teach) && data.mode === 'learn' && !gatedSkills.has(sid) && gatesShown < 2) { gatesShown++; return lessonIntro(data, teach); }
    renderQuestion(data);
  }
  function lessonIntro(data, teach) {
    app().innerHTML = topbar(`<div class="container" style="max-width:560px">
      <div class="lesson-top"><b>${style.emoji} ${style.cheer}</b></div>
      <div class="card center lesson-gate">
        <span class="lg-badge">NEW SKILL</span>
        <div class="big-emoji" style="margin:8px 0 2px">📖</div>
        <h2 style="margin-bottom:4px">${esc(data.question.skillName || 'A new skill')}</h2>
        <p class="muted" style="margin:8px auto 2px;max-width:26rem">${playful() ? 'Let’s learn it first with a quick lesson — then you’ll practice it! 💪' : 'Start with a short lesson that teaches this, then jump into the practice.'}</p>
        <div class="lg-steps"><span class="lg-step on">📖 Lesson</span><span class="lg-arrow">→</span><span class="lg-step">✅ Practice</span></div>
        <button class="btn green lg-go" id="lg-lesson">Start the lesson →</button>
        <div><button class="btn ghost small" id="lg-skip" style="margin-top:12px;color:var(--brand);border-color:var(--brand)">Skip to practice</button></div>
      </div>
    </div>`);
    wireChrome();
    $('#lg-lesson').onclick = () => { Sound.click(); location.hash = '#teach/' + teach.id; };
    $('#lg-skip').onclick = () => { Sound.click(); gatedSkills.add(data.skill && data.skill.id); renderQuestion(data); };
  }
  function renderQuestion(data) {
    const qn = data.question;
    const modeLabel = { boost: '💪 Power-Up (extra practice!)', learn: '🌱 New Challenge', review: '✨ Quick Review', retention: '🧠 Memory Check (keeping it sharp!)' }[data.mode] || '';
    const qStart = Date.now();
    // Per-question idempotency key so a double-tap / retry can't double-record this answer.
    const answerNonce = Math.random().toString(36).slice(2) + '-' + qStart.toString(36);
    let answered = false;
    let firstTryWrong = false;   // Second Look: true once a first miss has triggered a re-teach + retry
    // Typed-answer mode: ~30% of numeric math questions (grade 2+) ask the kid
    // to TYPE the answer, recall beats recognition for real mastery.
    const numericQ = qn.choices.every(c => /^-?\d+(\.\d+)?$/.test(String(c).trim()));
    const typed = subject === 'math' && numericQ && (State.me.kid.grade >= 2) && Math.random() < 0.3;
    // If we have a real lesson that teaches this exact skill, offer it right here.
    const teachLesson = (window.BP.lessonForSkill && data.skill) ? window.BP.lessonForSkill(subject, data.skill.id) : null;
    const lessonDone = lessonDoneFor(teachLesson);
    app().innerHTML = topbar(`<div class="container lesson-wrap">
      <div class="lesson-top">
        <b>${focus ? '🎯 Focus Session: ' + esc(SUBJECT_STYLE[subject] === style ? subject.charAt(0).toUpperCase() + subject.slice(1) : subject) : style.emoji + ' ' + style.cheer}</b>
        ${focus ? '' : gallopTrack(session.n / SESSION_LEN * 100)}
        <b>${focus ? `⏱ <span id="focus-left">${fmtLeft(session.endAt - Date.now())}</span> · ${session.n} answered` : `Question ${Math.min(session.n + 1, SESSION_LEN)} of ${SESSION_LEN}`}</b>
      </div>
      <div class="q-card">
        <span class="q-skill" style="background:${style.color}">${esc(qn.skillName)} · ${esc(modeLabel)}</span>
        ${teachLesson ? `<button class="btn ghost small learn-this" style="float:right;color:${style.color};border-color:${style.color};margin-left:6px" onclick="location.hash='#teach/${teachLesson.id}'">📖 ${lessonDone ? 'Lesson' : 'Learn this'}</button>` : ''}
        <button class="btn ghost small" style="float:right;color:${style.color};border-color:${style.color}" id="say-btn">🔊 Read it</button>
        ${teachLesson && !lessonDone ? `<div class="learn-banner" style="--lb:${style.color}" onclick="location.hash='#teach/${teachLesson.id}'">📖 <b>New to this skill?</b> Watch the quick lesson first <span class="lb-arrow">→</span></div>` : ''}
        ${qn.passage ? passageHTML(qn.passage, playful()) : ''}
        <div class="q-prompt">${esc(qn.prompt)}</div>
        ${typed ? `<div class="typed-wrap">
          <input id="typed-in" class="typed-input" inputmode="decimal" autocomplete="off" placeholder="${playful() ? 'Type your answer!' : 'Your answer'}" aria-label="Type your answer">
          <button class="btn green" id="typed-go">Check ✓</button>
        </div>
        <p class="muted" style="margin-top:8px;font-size:.85rem">${playful() ? '🧠 No choices this time, show what you know!' : 'Free response, recall practice.'}</p>`
        : `<div class="choices">${qn.choices.map((c, i) => `<button class="choice" data-i="${i}">${esc(c)}</button>`).join('')}</div>`}
        <div class="hint-box" id="hint-box">💡 ${esc(qn.hint || 'Trust yourself, read it once more, slowly.')}</div>
        <div class="feedback" id="feedback" aria-live="polite"></div>
        <div class="lesson-actions">
          <button class="btn sun small" id="hint-btn">💡 Hint</button>
          <button class="btn green" id="next-btn" style="display:none">Next →</button>
          <button class="btn ghost small" style="color:#7f8c9b;border-color:#dfe6e9;margin-left:auto" onclick="location.hash='#home'">Exit</button>
        </div>
        <div class="too-tricky">
          <button class="tt-btn" id="tt-btn">${playful() ? '🐴 Too tricky? Try easier questions' : 'Too difficult? Step back a level'}</button>
          <button class="tt-btn tt-up" id="tt-up-btn">${playful() ? '🚀 Too easy? Level me up' : 'Too easy? Move up a level'}</button>
        </div>
        <div class="mastery-mini">Skill power: <span id="mastery-pct">${Math.round((data.skill.mastery || 0) * 100)}%</span>
          <div class="mastery-bar"><div id="mastery-fill" style="width:${(data.skill.mastery || 0) * 100}%"></div></div>
        </div>
      </div>
    </div>`);
    wireChrome();
    const vlang = subject === 'spanish' ? 'es-ES' : 'en-US';
    $('#say-btn').onclick = () => Voice.speak(qn.passage ? qn.prompt : (qn.voice || qn.prompt), vlang);
    const pread = $('.passage-read'), pwords = $('.passage-words');
    if (pread && pwords) pread.onclick = () => { Sound.click(); Voice.readAlong(pwords, vlang); };
    // Auto: read the STORY aloud for passages (delight for the littles), else the question
    if (qn.passage && pwords && Voice.auto) Voice.readAlong(pwords, vlang);
    else if (Voice.auto) Voice.speak(qn.voice || qn.prompt, vlang);
    $('#hint-btn').onclick = () => { $('#hint-box').classList.add('show'); Sound.click(); };
    // Stepping the level is never a one-way trap: whichever way the child moves, the toast
    // offers an instant Undo, and both directions are always one tap away. This is the fix
    // for "the too-tricky button stranded her and there was no way back up."
    async function levelShift(delta) {
      Sound.click();
      const down = delta < 0;
      const btn = down ? $('#tt-btn') : $('#tt-up-btn');
      const orig = btn.textContent;
      $('#tt-btn').disabled = true; $('#tt-up-btn').disabled = true;
      btn.textContent = playful() ? (down ? '🐴 One sec…' : '🚀 One sec…') : 'Adjusting…';
      try {
        const r = await api(`/learn/${kidId}/level-shift/${subject}`, { method: 'POST', body: { delta } });
        // Keep the grade name out of the child's view unless the parent chose to reveal it.
        const msg = showLevel()
          ? (playful() ? (down ? `🌈 Okay! Easier ${r.levelName} questions coming up.` : `🚀 Nice! Stepping up to ${r.levelName} questions.`) : `Level set to ${r.levelName}.`)
          : (playful() ? (down ? `🌈 Okay! Easier questions coming up.` : `🚀 Nice! Stepping it up!`) : (down ? `Easing the difficulty.` : `Raising the difficulty.`));
        toastAction(msg, playful() ? '↩︎ Undo' : 'Undo', () => levelShift(-delta));
        nextQuestion();
      } catch (e) {
        $('#tt-btn').disabled = false; $('#tt-up-btn').disabled = false; btn.textContent = orig;
      }
    }
    $('#tt-btn').onclick = () => levelShift(-1);
    $('#tt-up-btn').onclick = () => levelShift(1);
    // Keyboard: 1-4 answer, Enter = next, H = hint (great for desktop & teens)
    document.onkeydown = e => {
      if (document.querySelector('.celebrate')) return;
      const ti = document.activeElement && document.activeElement.id === 'typed-in';
      if (ti) { if (e.key === 'Enter') { const g = $('#typed-go'); if (g && !g.disabled) g.click(); } return; }
      if (e.key >= '1' && e.key <= '4') { const c = document.querySelectorAll('.choice')[Number(e.key) - 1]; if (c && !c.disabled) c.click(); }
      else if (e.key === 'Enter') { const nb = $('#next-btn'); if (nb && nb.style.display !== 'none') nb.click(); }
      else if (e.key.toLowerCase() === 'h') { const hb = $('#hint-btn'); if (hb) hb.click(); }
    };

    // Second Look re-teach: does this question carry content we can re-teach with WITHOUT
    // giving away the answer (a hint or a misconception note)? Almost all do.
    function canReteach() { return !!(qn.hint || (qn.whyWrong && Object.keys(qn.whyWrong).length)); }
    // On a first miss: re-explain the idea a different way and let the child try again,
    // instead of the drill-app move of flashing the answer and moving on.
    function secondLook(chosen) {
      Sound.click();   // a gentle nudge, not the harsh "wrong" buzzer — struggle isn't punished
      const whyW = (qn.whyWrong && chosen != null && qn.whyWrong[String(chosen)]) || '';
      const hint = qn.hint || '';
      const fb = $('#feedback');
      fb.className = 'feedback reteach';
      fb.innerHTML = `<div class="second-look">
        <b>👀 ${playful() ? "Not quite — let's look at it another way." : "Not quite — here's another way to see it."}</b>
        ${whyW ? `<div class="sl-why">${esc(whyW)}</div>` : ''}
        ${hint ? `<div class="sl-hint">💡 ${esc(hint)}</div>` : ''}
        <div class="sl-try">${playful() ? "Give it one more try — you've got this! 🌟" : 'Take another look and try once more.'}</div>
      </div>`;
      const hb = $('#hint-box'); if (hb) hb.classList.add('show');
      try { fb.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) {}
      if (Voice.auto && playful()) Voice.speak("Not quite. Let's look at it another way. " + (whyW || hint), vlang);
    }

    async function settle(correct, chosen, wasReteach) {
      const fb = $('#feedback');
      const why = whyLine(subject, qn.skillName);
      // Mastery honesty: a child who needed the re-teach hasn't shown INDEPENDENT mastery,
      // so we record the first attempt as the real result even when they nail the retry.
      // They still get the win, the confetti, and the encouragement.
      const recordCorrect = correct && !wasReteach;
      if (correct && wasReteach) {
        Sound.correct(); Confetti.burst(28);
        fb.className = 'feedback good';
        fb.innerHTML = `<b>${playful() ? 'Yes! You got it on your second look 🎉' : 'There it is — got it on the second look.'}</b> ${esc(qn.explain || "")}<div class="sl-note">${playful() ? "That's exactly how learning works — a tricky one, then you nailed it." : 'Working it out after a stumble is real learning.'}</div>${why ? `<div class="why-line">🌍 <b>Real world:</b> ${esc(why)}</div>` : ''}`;
        if (Voice.auto && playful()) Voice.speak('Yes! You got it on your second look!');
      } else if (correct) {
        Sound.correct(); Confetti.burst(40);
        const praise = (playful() ? PRAISE : PRAISE_TEEN)[Math.floor(Math.random() * (playful() ? PRAISE : PRAISE_TEEN).length)];
        fb.className = 'feedback good';
        fb.innerHTML = `<b>${praise}</b> ${esc(qn.explain || "")}${why ? `<div class="why-line">🌍 <b>Real world:</b> ${esc(why)}</div>` : ''}`;
        if (Voice.auto && playful()) Voice.speak(praise.replace(/[^\w\s'!¡.,á-úÁ-Ú-]/g, ''));
      } else {
        Sound.wrong();
        const enc = (playful() ? ENCOURAGE : ENCOURAGE_TEEN)[Math.floor(Math.random() * (playful() ? ENCOURAGE : ENCOURAGE_TEEN).length)];
        // Misconception-specific feedback: if the exact wrong answer they chose maps to a
        // known mistake, lead with the message that names THAT mistake — far more useful
        // than one generic explanation for every distractor.
        const diag = (qn.whyWrong && chosen != null && qn.whyWrong[String(chosen)]) || '';
        const teach = diag || qn.explain || qn.hint || '';
        fb.className = 'feedback bad';
        fb.innerHTML = `<b>${enc}</b><br>${esc(teach)}`;
        // Big teaching moment: pop the explanation up LARGE, and make sure they saw it.
        const pop = document.createElement('div');
        pop.className = 'celebrate';
        pop.innerHTML = `<div class="explain-pop" role="dialog" aria-modal="true" aria-labelledby="ep-h" aria-describedby="ep-body">
          <div class="big-emoji" aria-hidden="true">${style.emoji}</div>
          <h2 id="ep-h">${diag ? (playful() ? 'Let\'s look at that! 🔍' : 'Here\'s what happened') : (playful() ? 'Let\'s learn it! 💡' : 'Here\'s the idea')}</h2>
          <p class="explain-text" id="ep-body">${diag ? esc(diag) + '<br>' : ''}The answer is <b>${esc(qn.choices[qn.answerIndex])}</b>.${diag ? '' : '<br>' + esc(qn.explain || qn.hint || '')}</p>
          ${why ? `<div class="why-line">🌍 <b>Real world:</b> ${esc(why)}</div>` : ''}
          <button class="btn sun" style="margin-top:14px">${playful() ? 'Got it! 👍' : 'Understood →'}</button>
        </div>`;
        pop.querySelector('button').onclick = () => { pop.remove(); Sound.click(); const nb = $('#next-btn'); if (nb) nb.focus(); };
        // Show the teaching moment IMMEDIATELY (not on a delay). While this .celebrate
        // overlay is up, the keydown guard blocks Enter→Next, so a fast tap can't skip
        // the explanation or drop a ghost overlay onto the next question.
        document.body.appendChild(pop); const gotIt = pop.querySelector('button'); if (gotIt) gotIt.focus();
        if (Voice.auto) Voice.speak(`${diag || ('The answer is ' + qn.choices[qn.answerIndex] + '. ' + (qn.explain || ''))}`, 'en-US');
      }
      session.n++; if (correct) session.correct++;
      try {
        const res = await api(`/learn/${kidId}/answer`, {
          method: 'POST',
          body: { subject, skillId: qn.skillId, correct: recordCorrect, timeMs: Date.now() - qStart, difficulty: qn.difficulty, nonce: answerNonce }
        });
        session.xp += res.xpGained || 0;
        $('#mastery-pct').textContent = Math.round(res.mastery * 100) + '%';
        $('#mastery-fill').style.width = (res.mastery * 100) + '%';
        (res.events || []).forEach(ev => session.events.push(ev));
        const celebration = (res.events || []).find(ev => ev.type === 'levelup' || ev.type === 'badge' || (ev.type === 'token' && gamesOn()));
        if (celebration) setTimeout(() => celebrate(celebration), 700);
      } catch (e) {
        // Trial/subscription lapsed mid-lesson: send them to the paywall instead of
        // silently celebrating work that was never recorded.
        if (e.status === 402) { renderPaywall(e.data && e.data.reason); return; }
        // Session expired mid-lesson: back to kid login (retrying forever is a dead end).
        if (e.status === 401) { toast('Please log back in to keep your progress!'); location.hash = '#kid-login'; return; }
        /* otherwise keep playing even if the network hiccups */
      }
      $('#next-btn').style.display = 'inline-flex';
      $('#next-btn').onclick = () => { Sound.click(); nextQuestion(); };
      // Only steal focus to Next when correct; on a wrong answer the teaching overlay
      // owns focus (its "Got it" button) until the child dismisses it.
      if (correct) $('#next-btn').focus();
    }

    document.querySelectorAll('.choice').forEach(b => b.onclick = () => {
      if (answered) return;
      const i = Number(b.dataset.i);
      const correct = i === qn.answerIndex;
      // SECOND LOOK: on the first miss, re-teach the idea a different way and let the child
      // try again — don't flash the answer and move on. Only a real second attempt settles.
      if (!correct && !firstTryWrong && canReteach()) {
        firstTryWrong = true;
        b.classList.add('wrong'); b.disabled = true;   // dim only the choice they picked
        secondLook(qn.choices[i]);
        return;
      }
      answered = true;
      document.querySelectorAll('.choice').forEach(x => x.disabled = true);
      b.classList.add(correct ? 'correct' : 'wrong');
      if (!correct) { const _ar = document.querySelectorAll('.choice')[qn.answerIndex]; if (_ar) _ar.classList.add('answer-reveal'); }
      settle(correct, qn.choices[i], firstTryWrong);
    });

    const tgo = $('#typed-go');
    if (tgo) {
      const tin = $('#typed-in');
      tin.focus();
      tgo.onclick = () => {
        if (answered) return;
        const val = tin.value.trim();
        if (!val) { tin.focus(); return; }
        const correct = Number(val) === Number(qn.choices[qn.answerIndex]);
        // Second Look for typed answers: re-teach, clear the box, and let them type once more.
        if (!correct && !firstTryWrong && canReteach()) {
          firstTryWrong = true;
          tin.classList.add('bad');
          secondLook(val);
          setTimeout(() => { tin.classList.remove('bad'); tin.value = ''; tin.disabled = false; tin.focus(); }, 120);
          return;
        }
        answered = true;
        tin.disabled = true; tgo.disabled = true;
        tin.classList.add(correct ? 'good' : 'bad');
        settle(correct, undefined, firstTryWrong);
      };
    }
  }

  function celebrate(ev) {
    const div = document.createElement('div');
    div.className = 'celebrate';
    // Never stack on top of the teaching popup (or another celebration) —
    // wait politely until the current overlay is dismissed.
    const showWhenClear = () => {
      if (document.querySelector('.celebrate')) { setTimeout(showWhenClear, 400); return; }
      document.body.appendChild(div);
    };
    if (ev.type === 'levelup') {
      Sound.levelup(); Confetti.burst(220);
      div.innerHTML = `<div class="big-emoji">🏆</div><h2>LEVEL UP!</h2><p style="font-size:1.2rem">You completed ${esc(ev.certificate || 'a level')}!<br>A certificate was added for you & your parents. 🎓</p><button class="btn sun">Keep Going →</button>`;
    } else if (ev.type === 'token') {
      Sound.badge(); Confetti.burst(80);
      div.innerHTML = `<div class="big-emoji">🎟️</div><h2>Play Token Earned!</h2><p style="font-size:1.2rem">5 correct answers = 1 token for the Play Zone! You have ${ev.tokens}. 🕹️</p><button class="btn sun">Sweet →</button>`;
    } else {
      Sound.badge(); Confetti.burst(120);
      div.innerHTML = `<div class="big-emoji">${ev.badge.emoji}</div><h2>New Badge!</h2><p style="font-size:1.2rem">${esc(ev.badge.name)}</p><button class="btn sun">Awesome →</button>`;
    }
    div.querySelector('button').onclick = () => div.remove();
    showWhenClear();
  }

  function summary() {
    if (focusTimer) clearInterval(focusTimer);
    const denom = focus ? Math.max(1, session.n) : SESSION_LEN;
    const pct = Math.round(session.correct / denom * 100);
    const mins = Math.max(1, Math.round((Date.now() - session.startedAt) / 60000));
    const emoji = focus ? '🎯' : pct >= 80 ? '🌟' : pct >= 60 ? '💪' : '🌱';
    const msg = focus
      ? (session.n >= 15 ? 'Focus session complete, that was real studying.' : 'Focus session complete.')
      : pct >= 80 ? 'Outstanding! Your brain is glowing!' : pct >= 60 ? 'Strong work, you\'re growing fast!' : 'Every try makes you smarter. Let\'s keep building!';
    Confetti.burst(focus ? 120 : pct >= 80 ? 200 : 80); if (pct >= 60) Sound.levelup();
    app().innerHTML = topbar(`<div class="container lesson-wrap"><div class="card center">
      <div class="big-emoji">${emoji}</div>
      <h2>${msg}</h2>
      <div class="summary-stats">
        <div class="sstat"><div class="n">${session.correct}/${focus ? session.n : SESSION_LEN}</div>correct</div>
        <div class="sstat"><div class="n">+${session.xp}</div>XP earned</div>
        <div class="sstat"><div class="n">${mins}</div>min${mins > 1 ? 's' : ''}</div>
      </div>
      ${focus ? `<p class="muted" style="margin:6px 0 2px">${session.n} questions in ${FOCUS_MIN} minutes${pct ? ` · ${pct}% accuracy` : ''}. ${pct >= 80 && session.n >= 15 ? 'Elite session. 🏆' : 'Consistency compounds, same time tomorrow?'}</p>` : ''}
      <button class="btn green" onclick="location.hash='#lesson/${subject}${focus ? '/focus' : ''}';location.reload()">${focus ? 'New Session 🎯' : 'Play Again 🔁'}</button>
      <button class="btn" style="margin-left:8px" onclick="location.hash='#home'">More Subjects →</button>
    </div></div>`);
    wireChrome();
  }

  await nextQuestion();
});

// ======================= exam prep (AP / Honors / Regents) =======================
// A separate advanced track. Practice never changes a learner's grade level or
// mastery — it's exam drilling with explanations. Reuses the lesson q-card look.
const EXAM_ORDER = ['AP', 'Honors', 'Regents'];
const EXAM_BLURB = {
  Regents: 'State test prep',
  AP: 'College-level AP practice',
  Honors: 'Honors-level challenge'
};
route('exam', async (trackId) => {
  if (State.me.role !== 'kid') { location.hash = '#kid-login'; return; }
  // Advanced Track is for grade 8+ (same gate as the home tile) — a younger kid
  // deep-linking here goes home instead of into AP calculus.
  if ((State.me.kid.grade || 0) < 8) { location.hash = '#home'; return; }
  const kidId = State.me.kid.id;
  let tracks = [];
  try { tracks = (await api('/learn/tracks')).tracks || []; } catch (e) { tracks = []; }

  if (!trackId) {
    if (!tracks.length) {
      app().innerHTML = topbar(`<div class="container" style="max-width:640px"><div class="card center">
        <div class="big-emoji">🎓</div><h2>The Advanced Track is warming up</h2>
        <p class="muted" style="margin:10px 0 18px">AP, Honors & college-level practice sets are being added. Check back soon!</p>
        <button class="btn green" onclick="location.hash='#home'">← Back home</button>
      </div></div>`);
      wireChrome(); return;
    }
    const groups = {};
    for (const t of tracks) { (groups[t.exam] = groups[t.exam] || []).push(t); }
    const sections = EXAM_ORDER.filter(e => groups[e]).map(exam => `
      <div class="exam-section">
        <div class="exam-sec-head"><span class="exam-badge exam-${exam.toLowerCase()}">${exam === 'Regents' ? 'State Prep' : exam}</span><span class="muted">${EXAM_BLURB[exam] || ''}</span></div>
        <div class="exam-grid">
          ${groups[exam].map(t => {
            const c = (SUBJECT_STYLE[t.subject] || {}).color || '#1A5C38';
            return `<button class="exam-card" data-track="${t.id}" style="--tc:${c}">
              <span class="exam-emoji">${t.emoji || '🎓'}</span>
              <b>${esc(t.name)}</b>
              <span class="exam-count">${t.count} questions</span>
            </button>`;
          }).join('')}
        </div>
      </div>`).join('');
    app().innerHTML = topbar(`<div class="container" style="max-width:820px">
      <div class="exam-hero">
        <img src="/logo-full-dark.png" alt="Gallop Learning Academy" class="exam-hero-logo">
        <div><h1 style="margin:0">Advanced Track</h1>
        <p class="muted" style="margin:4px 0 0">For students working ahead — college-level AP, Honors, and exam practice. Working here won't change your grade level; it's pure challenge.</p></div>
      </div>
      ${sections}
      <div style="margin-top:18px"><button class="btn ghost small on-page" onclick="location.hash='#home'">← Back home</button></div>
    </div>`);
    wireChrome();
    document.querySelectorAll('.exam-card').forEach(b => b.onclick = () => { Sound.click(); location.hash = '#exam/' + b.dataset.track; });
    return;
  }

  // ----- practice a specific track -----
  const track = tracks.find(t => t.id === trackId);
  if (!track) { location.hash = '#exam'; return; }
  const style = SUBJECT_STYLE[track.subject] || { color: '#1A5C38', emoji: '🎓' };
  const SESSION_LEN = 12;
  const session = { n: 0, correct: 0, xp: 0, startedAt: Date.now(), qStart: Date.now() };
  const vlang = track.subject === 'spanish' ? 'es-ES' : 'en-US';

  async function nextQuestion() {
    if (session.n >= SESSION_LEN) return summary();
    let data = null;
    for (let attempt = 0; attempt < 3 && !data; attempt++) {
      try { data = await api(`/learn/${kidId}/track/${trackId}/next`); }
      catch (e) { if (e.status === 402) return renderPaywall && renderPaywall(e.data && e.data.reason); data = null; await new Promise(r => setTimeout(r, 500)); }
    }
    if (!data || !data.question) {
      app().innerHTML = topbar(`<div class="container" style="max-width:560px"><div class="card center">
        <div class="big-emoji">🎓</div><h2>Quick breather</h2>
        <p class="muted" style="margin:10px 0 18px">That question didn't load. Your progress is saved.</p>
        <button class="btn green" id="retry-q">Keep Going →</button>
        <button class="btn ghost small on-page" style="margin-left:8px" onclick="location.hash='#exam'">Pick another exam</button>
      </div></div>`);
      wireChrome(); $('#retry-q').onclick = () => { Sound.click(); nextQuestion(); }; return;
    }
    render(data.question);
  }

  function render(qn) {
    let answered = false;
    app().innerHTML = topbar(`<div class="container lesson-wrap">
      <div class="lesson-top">
        <b>${track.emoji || '🎓'} ${esc(track.name)}</b>
        ${gallopTrack(session.n / SESSION_LEN * 100)}
        <b>${session.n}/${SESSION_LEN}</b>
      </div>
      <div class="q-card">
        <span class="q-skill" style="background:${style.color}">${esc(track.exam)} · exam practice</span>
        <button class="btn ghost small" style="float:right;color:${style.color};border-color:${style.color}" id="say-btn">🔊 Read it</button>
        ${qn.passage ? passageHTML(qn.passage, false) : ''}
        <div class="q-prompt">${esc(qn.prompt)}</div>
        <div class="choices">${qn.choices.map((c, i) => `<button class="choice" data-i="${i}">${esc(c)}</button>`).join('')}</div>
        <div class="hint-box" id="hint-box">💡 ${esc(qn.hint || 'Work it through step by step.')}</div>
        <div class="feedback" id="feedback" aria-live="polite"></div>
        <div class="lesson-actions">
          <button class="btn sun small" id="hint-btn">💡 Hint</button>
          <button class="btn green" id="next-btn" style="display:none">Next →</button>
          <button class="btn ghost small" style="color:#7f8c9b;border-color:#dfe6e9;margin-left:auto" onclick="location.hash='#exam'">Exit</button>
        </div>
      </div>
    </div>`);
    wireChrome();
    $('#say-btn').onclick = () => Voice.speak(qn.voice || qn.prompt, vlang);
    const pread = $('.passage-read'), pwords = $('.passage-words');
    if (pread && pwords) pread.onclick = () => { Sound.click(); Voice.readAlong(pwords, vlang); };
    $('#hint-btn').onclick = () => { $('#hint-box').classList.add('show'); Sound.click(); };
    document.onkeydown = e => {
      if (document.querySelector('.celebrate')) return;
      if (e.key >= '1' && e.key <= '4') { const c = document.querySelectorAll('.choice')[Number(e.key) - 1]; if (c && !c.disabled) c.click(); }
      else if (e.key === 'Enter') { const nb = $('#next-btn'); if (nb && nb.style.display !== 'none') nb.click(); }
      else if (e.key.toLowerCase() === 'h') { const hb = $('#hint-btn'); if (hb) hb.click(); }
    };

    async function settle(correct) {
      const fb = $('#feedback');
      if (correct) {
        Sound.correct(); Confetti.burst(36);
        fb.className = 'feedback good';
        fb.innerHTML = `<b>Correct! 🎯</b> ${esc(qn.explain || '')}`;
      } else {
        Sound.wrong();
        fb.className = 'feedback bad';
        fb.innerHTML = `<b>Not quite.</b><br>${esc(qn.explain || '')}`;
        const pop = document.createElement('div');
        pop.className = 'celebrate';
        pop.innerHTML = `<div class="explain-pop" role="dialog" aria-modal="true" aria-labelledby="ep-h2" aria-describedby="ep-body2">
          <div class="big-emoji" aria-hidden="true">${track.emoji || '🎓'}</div>
          <h2 id="ep-h2">Here's the idea</h2>
          <p class="explain-text" id="ep-body2">The answer is <b>${esc(qn.choices[qn.answerIndex])}</b>.<br>${esc(qn.explain || qn.hint || '')}</p>
          <button class="btn sun" style="margin-top:14px">Understood →</button>
        </div>`;
        pop.querySelector('button').onclick = () => { pop.remove(); Sound.click(); const nb = $('#next-btn'); if (nb) nb.focus(); };
        // Show immediately so the keydown guard blocks Enter→Next until it's dismissed.
        document.body.appendChild(pop); const uB = pop.querySelector('button'); if (uB) uB.focus();
      }
      session.n++; if (correct) { session.correct++; }
      try {
        const res = await api(`/learn/${kidId}/track/answer`, { method: 'POST', body: { trackId, correct, timeMs: Date.now() - (session.qStart || session.startedAt) } });
        session.qStart = Date.now();
        session.xp += res.xpEarned || 0;
      } catch (e) {
        if (e.status === 402) { renderPaywall(e.data && e.data.reason); return; }
        if (e.status === 401) { toast('Please log back in to keep your progress!'); location.hash = '#kid-login'; return; }
        /* else keep going */
      }
      $('#next-btn').style.display = 'inline-flex';
      $('#next-btn').onclick = () => { Sound.click(); nextQuestion(); };
      if (correct) $('#next-btn').focus();
    }

    document.querySelectorAll('.choice').forEach(b => b.onclick = () => {
      if (answered) return; answered = true;
      const i = Number(b.dataset.i);
      const correct = i === qn.answerIndex;
      document.querySelectorAll('.choice').forEach(x => x.disabled = true);
      b.classList.add(correct ? 'correct' : 'wrong');
      if (!correct) { const _ar = document.querySelectorAll('.choice')[qn.answerIndex]; if (_ar) _ar.classList.add('answer-reveal'); }
      settle(correct);
    });
  }

  function summary() {
    const pct = Math.round(session.correct / SESSION_LEN * 100);
    const mins = Math.max(1, Math.round((Date.now() - session.startedAt) / 60000));
    const emoji = pct >= 80 ? '🌟' : pct >= 60 ? '💪' : '📚';
    const msg = pct >= 80 ? `Exam-ready work on ${track.name}!` : pct >= 60 ? `Solid ${track.name} practice — keep sharpening.` : `Every rep counts. ${track.name} is tough — you're building it.`;
    Confetti.burst(pct >= 80 ? 200 : 90); if (pct >= 60) Sound.levelup();
    app().innerHTML = topbar(`<div class="container lesson-wrap"><div class="card center">
      <div class="big-emoji">${emoji}</div>
      <h2>${esc(msg)}</h2>
      <div class="summary-stats">
        <div class="sstat"><div class="n">${session.correct}/${SESSION_LEN}</div>correct</div>
        <div class="sstat"><div class="n">+${session.xp}</div>XP earned</div>
        <div class="sstat"><div class="n">${mins}</div>min${mins > 1 ? 's' : ''}</div>
      </div>
      <button class="btn green" onclick="location.hash='#exam/${trackId}';location.reload()">Practice again 🔁</button>
      <button class="btn" style="margin-left:8px" onclick="location.hash='#exam'">Other exams →</button>
      <button class="btn ghost small on-page" style="margin-left:8px" onclick="location.hash='#home'">Home</button>
    </div></div>`);
    wireChrome();
  }

  await nextQuestion();
});

// ======================= report card =======================
// Per-subject pace status, makes the adaptive guardrails visible to parents.
function statusBadge(status) {
  const M = {
    'excelling': ['🚀 Excelling', 'st-excelling'],
    'on-track': ['✅ On track', 'st-ontrack'],
    'developing': ['📈 Developing', 'st-developing'],
    'needs-support': ['🤝 Extra support', 'st-support'],
    'insufficient': ['🔎 Not enough data yet', 'st-insuff'],
    'building': ['🌱 Getting started', 'st-building']
  };
  const m = M[status]; if (!m) return '';
  return `<span class="status-badge ${m[1]}">${m[0]}</span>`;
}
function statusNote(s) {
  if (s.status === 'excelling') return ' · <b style="color:#1f8a5f">has this down, so we\'re steadily raising the challenge</b>';
  if (s.status === 'needs-support') return ' · <b style="color:#C9A84C">we\'ve eased the difficulty and added extra practice here</b>';
  if (s.status === 'developing') return ' · making progress — a little more practice to lock it in';
  if (s.status === 'on-track') return ' · moving along at a healthy pace';
  if (s.status === 'insufficient') return ` · <span class="muted">a few more sessions and we'll have a clear read</span>`;
  return '';
}
// The status badge ("On track", "Excelling", "Extra support") is computed from the child's
// RECENT work (last ~15 answers), not their all-time average. So the headline number here
// must be that same recent figure — otherwise a green "On track" can sit next to a low
// all-time % and read as a contradiction (a parent-reported confusion we're fixing).
function accuracyLine(s) {
  const qn = `${s.questionsAnswered} question${s.questionsAnswered === 1 ? '' : 's'}`;
  if (s.recentAccuracy != null) {
    const recent = Math.round(s.recentAccuracy * 100);
    const allTime = s.accuracy != null ? Math.round(s.accuracy * 100) : null;
    const tail = (allTime != null && Math.abs(recent - allTime) >= 10)
      ? ` <span class="muted" style="font-size:.85rem">(${allTime}% across all their work)</span>` : '';
    return `${qn} · ${recent}% correct lately${tail}`;
  }
  if (s.accuracy != null) return `${qn} · ${Math.round(s.accuracy * 100)}% accuracy`;
  return `${qn} · just getting started`;
}

// Parent "Strengths & Future Paths" card, grows with the student. Emerging
// interests early, concrete career pathways in the high-school years.
function renderCareer(c, k) {
  const SUBCOL = { math: '#5b5bd6', english: '#0f9d76', science: '#2f78c2', spanish: '#d26440' };
  const SUBEMO = { math: '🔢', english: '📚', science: '🔬', spanish: '🌎' };
  const bandTitle = c.band === 'pathways' ? '🎯 Career Pathways' : c.band === 'explore' ? '🧭 Strengths & Career Explorer' : '🌱 Emerging Strengths';
  const intro = c.band === 'pathways'
    ? `Based on how ${esc(k.name)} is performing, here are career directions that fit their strengths, along with how to prepare for them in high school.`
    : c.band === 'explore'
    ? `${esc(k.name)}'s strengths are starting to point somewhere. Here's where these skills tend to lead, worth talking through together.`
    : `It's early, but ${esc(k.name)} is already building strengths. Here's a peek at where these skills can lead one day.`;
  if (!c.hasData) {
    return `<div class="card career-card">
      <div class="career-head"><h3>${bandTitle}</h3></div>
      <p class="muted" style="margin-top:6px">Once ${esc(k.name)} has answered a few questions in each subject, we'll start mapping their strengths to real-world paths right here. It gets more specific as they get older.</p>
    </div>`;
  }
  // strength bars (ranked subjects)
  const bars = c.ranked.map(s => `
    <div class="str-row">
      <span class="str-name">${SUBEMO[s.subject]} ${esc(s.label)}</span>
      <span class="str-bar"><span class="str-fill" style="width:${Math.round((s.score || 0) * 100)}%;background:${SUBCOL[s.subject]}"></span></span>
      <span class="str-pct">${Math.round((s.score || 0) * 100)}</span>
    </div>`).join('');
  const strengthChips = c.topStrengths.length
    ? `<p style="margin:2px 0 0"><b>Excelling in:</b> ${c.topStrengths.map(s => `<span class="pill strength">${esc(s.label)}</span>`).join(' ')}</p>`
    : (c.ranked && c.ranked.length ? `<p style="margin:2px 0 0"><b>Strongest so far:</b> <span class="pill strength">${esc(c.ranked[0].label)}</span></p>` : '');
  const growth = c.growthAreas.length
    ? `<p style="margin:8px 0 0"><b>Room to grow:</b> ${c.growthAreas.map(s => `<span class="pill focus">${esc(s.label)}</span>`).join(' ')} <span class="muted" style="font-size:.85rem">${esc(c.growthAreas[0].why)}</span></p>` : '';
  const paths = c.pathways.map(p => `
    <div class="path-card">
      <div class="path-emoji">${p.emoji}</div>
      <div class="path-body">
        <div class="path-top"><b>${esc(p.title)}</b><span class="path-match" title="A rough sense of fit from ${esc(k.name)}'s current strengths — a direction to explore, not a prediction">${p.match >= 0.7 ? 'Strong fit' : p.match >= 0.5 ? 'Good fit' : 'Worth exploring'}</span></div>
        <p class="path-why">${esc(p.why)}</p>
        ${c.band === 'pathways' ? `<p class="path-hs">🎓 <b>High-school focus:</b> ${esc(p.hs)}</p>` : ''}
      </div>
    </div>`).join('');
  return `<div class="card career-card">
    <div class="career-head"><h3>${bandTitle}</h3><span class="career-badge">${c.band === 'pathways' ? 'High School' : c.band === 'explore' ? 'Middle Years' : 'Early Years'}</span></div>
    <p class="muted" style="margin:4px 0 14px">${intro}</p>
    <p class="muted" style="font-size:.82rem;margin:0 0 6px">A relative strength profile across subjects — a guide for spotting directions, measured differently from (and separate to) the Gallop Score on each subject card.</p>
    <div class="strength-panel">${bars}</div>
    ${strengthChips}
    ${growth}
    <h4 style="margin:18px 0 10px">${c.band === 'pathways' ? 'Pathways that fit these strengths' : 'Where these skills can lead'}</h4>
    <div class="path-grid">${paths}</div>
    <div class="center" style="margin-top:14px"><button class="btn green small no-print" onclick="location.hash='#careers/${k.id}'">🔭 Open the Career Explorer — real jobs & role models →</button></div>
    <p class="muted" style="font-size:.78rem;margin-top:12px">These suggestions come from ${esc(k.name)}'s skill levels and accuracy across subjects. They sharpen as more work is completed and update automatically as ${esc(k.name)} grows.</p>
  </div>`;
}

// "Do This Next" — turn the report data into ONE prescriptive action for the parent:
// which subject/concept to focus on, a concrete at-home move, and a soft ETA to the next
// grade level. This is the "here's exactly what your child needs" guidance no rival gives.
function computeDoNext(r) {
  const placed = (r.subjects || []).filter(s => s.placed);
  if (!placed.length) return null;
  const rank = { 'needs-support': 0, 'developing': 1, 'on-track': 2, 'excelling': 3 };
  const sorted = placed.slice().sort((a, b) => {
    const ra = rank[a.status] != null ? rank[a.status] : 2, rb = rank[b.status] != null ? rank[b.status] : 2;
    if (ra !== rb) return ra - rb;
    const pa = a.progress && a.progress.atLevelTotal ? a.progress.atLevelMastered / a.progress.atLevelTotal : 1;
    const pb = b.progress && b.progress.atLevelTotal ? b.progress.atLevelMastered / b.progress.atLevelTotal : 1;
    return pa - pb;
  });
  const s = sorted[0];
  const concept = (s.focusAreas && s.focusAreas[0]) || (s.strengths && s.strengths[0]) || s.label;
  const remaining = s.progress ? Math.max(0, s.progress.atLevelTotal - s.progress.atLevelMastered) : 0;
  // Soft ETA: ~15 answered questions to master a skill, spread across the child's placed
  // subjects at this week's pace. Deliberately conservative and always framed as an estimate.
  let eta = null;
  const perSubjWeekly = (r.weekAnswers || 0) / placed.length;
  if (remaining > 0 && perSubjWeekly >= 8 && s.progress && !s.progress.atMaxGrade && s.nextGradeName) {
    const acc = Math.max(s.accuracy || 0.7, 0.4);
    const skillsPerWeek = Math.max(0.15, (perSubjWeekly * acc) / 15);
    const wks = Math.round(remaining / skillsPerWeek);
    if (wks >= 1 && wks <= 40) eta = wks;
  }
  return { s, concept, remaining, eta };
}
function doNextCard(r, k) {
  const dn = computeDoNext(r);
  if (!dn) return '';
  const { s, concept, remaining, eta } = dn;
  const conceptLine = concept && concept !== s.label ? `, especially <b>${esc(concept)}</b>` : '';
  return `<div class="do-next">
    <div class="dn-head">🧭 Do this next</div>
    <p class="dn-focus">Put this week's attention on <b>${esc(s.label)}</b>${conceptLine}.</p>
    <p class="dn-action">At home: ask ${esc(k.name)} to <b>teach you</b> how ${esc(concept)} works. Explaining it out loud is one of the fastest ways to lock a skill in — and it shows you instantly what's clicked and what hasn't.</p>
    ${remaining > 0 && s.nextGradeName ? `<p class="dn-eta"><b>${remaining}</b> more ${esc(s.levelName)} skill${remaining === 1 ? '' : 's'} to reach <b>${esc(s.nextGradeName)}</b>${eta ? ` — about <b>~${eta} week${eta === 1 ? '' : 's'}</b> at this week's pace` : ''}.</p>` : ''}
  </div>`;
}

route('report', async (kidId) => {
  const r = await api(`/learn/${kidId}/report`);
  const k = r.kid;
  const isParent = State.me.role === 'parent';
  app().innerHTML = topbar(`<div class="container">
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
        <h2>${AVATARS[k.avatar] || '🦊'} ${esc(k.name)}'s Report Card</h2>
        <div>
          <button class="btn small no-print" onclick="window.print()">🖨️ Print</button>
          ${isParent ? `<button class="btn ghost small no-print" style="color:var(--brand);border-color:var(--brand)" onclick="location.hash='#parent'">← Dashboard</button>` : `<button class="btn green small no-print" onclick="location.hash='#home'">🏠 Home</button>`}
        </div>
      </div>
      <p class="muted">${r.pace.summer ? `☀️ ${esc(r.pace.note)}` : `${esc(r.pace.label)} · ${Math.round(r.pace.pctThroughYear * 100)}% through the year`} · ${r.weekAnswers} question${r.weekAnswers === 1 ? '' : 's'} this week (goal: ${k.weekly_goal * 10})</p>
      ${isParent ? doNextCard(r, k) : ''}
      ${r.gallop && r.gallop.overall != null ? `
      <div class="gallop-hero">
        <div class="gh-num">${r.gallop.overall}</div>
        <div class="gh-meta">
          <b>Gallop Score</b>${r.gallop.deltas && r.gallop.deltas.overall > 0 ? ` <span class="gs-up">▲ +${r.gallop.deltas.overall} this week</span>` : ''}
          <span class="gh-sub">${esc(k.name)}'s all-subjects number. It climbs only with real understanding, never by lucky guesses.</span>
        </div>
      </div>
      ${isParent ? `<details class="gs-explain"><summary>What is a Gallop Score, and will it go up? 🐎</summary>
        <div class="gs-explain-body">
          <p>The Gallop Score is a single number, from <b>200 to 1200</b>, that sums up how much ${esc(k.name)} has truly learned across every subject. Think of it like a credit score for learning: one glanceable number that only moves up when the learning is real.</p>
          <p><b>Yes — it rises as they progress.</b> Two things push it up: unlocking new skills, and deepening the skills they already have. Harder, higher-grade skills are worth more points, and a skill only pays out its full value once ${esc(k.name)} has genuinely mastered it. That's why it can't be inflated by guessing or racing through — the only way up is understanding that sticks.</p>
          <p class="muted" style="font-size:.9rem;margin-bottom:0">Rough guide: ~200 is just starting out, ~700 is solid mid-elementary, and 1000+ is high-school-level command. Each subject shows its own score below, plus the school grade it lines up with.</p>
        </div>
      </details>` : ''}` : ''}
      ${isParent && r.gradeScale ? `<p class="muted" style="font-size:.8rem;margin-top:8px">Letter grades reflect accuracy · Scale: ${esc(r.gradeScale)}</p>` : ''}
      <div style="margin-top:18px">
      ${r.subjects.map(s => `
        <div class="subject-report">
          <div class="head">
            <h3>${SUBJECT_STYLE[s.subject].emoji} ${esc(s.label)} ${statusBadge(s.status)}</h3>
            <div class="subj-score">
              <div class="ss-num" style="color:${SUBJECT_STYLE[s.subject].color}">${s.gallopScore != null ? s.gallopScore : '—'}</div>
              <div class="ss-cap">Gallop Score${s.gallopScore != null && r.gallop.deltas && r.gallop.deltas[s.subject] > 0 ? ` · <span class="gs-up">+${r.gallop.deltas[s.subject]}</span>` : ''}</div>
              ${isParent && s.gradeEquiv ? `<div class="ss-grade" title="Grade level of mastery ${esc(k.name)} has proven so far — climbs as they practice. Different from Working level (where they learn now).">≈ ${esc(s.gradeEquiv.label)}${s.letter && s.letter !== '—' ? ` · ${esc(s.letter)}` : ''}</div>` : ''}
            </div>
          </div>
          ${s.placed ? `
            <p class="muted" style="margin:6px 0">${isParent ? `${accuracyLine(s)}${statusNote(s)}` : `${s.questionsAnswered} question${s.questionsAnswered === 1 ? '' : 's'} done. Keep it up, you're growing!`}</p>
            ${isParent ? `<p class="muted" style="margin:2px 0 8px;font-size:.9rem">Working level: <b>${esc(s.levelName)}</b>${s.enrolledGrade != null ? ` · enrolled in <b>${s.enrolledGrade === 0 ? 'Kindergarten' : 'Grade ' + s.enrolledGrade}</b>` : ''}</p>` : ''}
            ${isParent && s.placementNote ? `<p class="place-note"><b>Why we started here:</b> ${esc(s.placementNote)}</p>` : ''}
            ${isParent && s.placementMissed && s.placementMissed.length ? `<p class="place-note" style="background:#fff6ec;border-color:#f0d9bd"><b>Missed on the placement quiz:</b> ${s.placementMissed.map(x => `<span class="pill focus">${esc(x)}</span>`).join(' ')} <span class="muted" style="font-size:.85rem">— these are just the concepts to keep an eye on; ${esc(k.name)} gets extra practice on them automatically.</span></p>` : ''}
            ${isParent && s.progress ? `
            <div class="advance-box">
              <div class="advance-head"><span>📊 Skills at ${esc(s.levelName)}</span><span><b>${s.progress.atLevelMastered}</b> of ${s.progress.atLevelTotal} mastered</span></div>
              <div class="advance-track"><div class="advance-fill" style="width:${s.progress.atLevelTotal ? Math.round(s.progress.atLevelMastered / s.progress.atLevelTotal * 100) : 0}%"></div></div>
              ${s.progress.atMaxGrade
                ? `<p class="advance-note">${esc(k.name)} is at the top grade for ${esc(s.label)} — now deepening mastery across every skill.</p>`
                : `<p class="advance-note">To advance to <b>${esc(s.nextGradeName || 'the next grade')}</b>, ${esc(k.name)} masters all <b>${s.progress.atLevelTotal}</b> ${esc(s.levelName)} skills at 85%+ accuracy${s.progress.atLevelTotal > 0 && s.progress.atLevelMastered >= s.progress.atLevelTotal ? ' — all mastered, advancement is close! 🎉' : (s.progress.atLevelTotal - s.progress.atLevelMastered) > 0 ? ` — <b>${s.progress.atLevelTotal - s.progress.atLevelMastered}</b> to go.` : '.'}</p>`}
            </div>` : ''}
            ${s.strengths.length ? `<p>💪 Strengths: ${s.strengths.map(x => `<span class="pill strength">${esc(x)}</span>`).join(' ')}</p>` : ''}
            ${s.focusAreas.length ? `<p style="margin-top:6px">🎯 Focus areas (getting extra help): ${s.focusAreas.map(x => `<span class="pill focus">${esc(x)}</span>`).join(' ')}</p>` : ''}
            ${isParent && s.skills && s.skills.length ? `
            <details class="skill-detail no-print">
              <summary>🔬 See all ${s.skills.length} skills</summary>
              <div class="skill-rows">
                ${s.skills.map(sk => `
                  <div class="skill-row">
                    <span class="sk-name">${esc(sk.name)}${sk.grade != null ? ` <span class="sk-grade">${sk.grade === 0 ? 'K' : 'G' + sk.grade}</span>` : ''}</span>
                    <span class="sk-meta">${sk.attempts} tries${sk.accuracy != null ? ' · ' + Math.round(sk.accuracy * 100) + '%' : ''}</span>
                    <span class="sk-bar"><span class="sk-fill ${sk.mastery >= 0.8 ? 'hi' : sk.mastery >= 0.45 ? 'mid' : 'lo'}" style="width:${Math.round(sk.mastery * 100)}%"></span></span>
                  </div>`).join('')}
              </div>
            </details>` : ''}
            ${isParent ? `<button class="btn ghost small no-print" style="margin-top:8px;color:#7f8c9b;border-color:#dfe6e9" data-retake="${s.subject}">🔄 Retake placement</button>` : ''}
          ` : `<p class="muted">No placement quiz yet. Jump in to find the right level.</p>`}
        </div>`).join('')}
      </div>
      ${isParent ? `<details class="method-box">
        <summary>📋 How these numbers work — and why you can trust them</summary>
        <div class="method-body">
          <p><b>Placement is measured, not assumed.</b> Each subject begins with a short adaptive assessment that finds the exact grade level where ${esc(k.name)} is challenged but not overwhelmed. Nothing here is estimated from age or enrolled grade alone — every figure is backed by questions ${esc(k.name)} actually answered.</p>
          <p><b>Advancement is earned.</b> To move up a grade, ${esc(k.name)} must master <i>every</i> skill at their current grade (80%+ mastery on each) <i>and</i> sustain 85%+ accuracy on recent work — never a lucky streak. The "Skills at [grade]" bar above each subject shows exactly how close they are. If work slips well below grade level, we quietly ease the difficulty and add practice instead of pushing ahead.</p>
          <p><b>Accuracy &amp; letter grades</b> are simply the percent of grade-level questions answered correctly, on the standard scale (${esc(r.gradeScale)}). "Correct lately" reflects the most recent ~15 answers; the all-time figure is shown alongside when it differs. Optional Advanced Track (AP/honors) practice is kept separate and never affects these.</p>
          <p><b>The Gallop Score &amp; grade-equivalent</b> are Gallop's own estimate of how much ${esc(k.name)} has demonstrated on the platform — they deepen as skills are practiced and proven. They're a progress measure for tracking growth over time, not a nationally-normed test score.</p>
          <p><b>Working level vs. Gallop Score.</b> Working level is where ${esc(k.name)} practices right now; the Gallop Score's grade is the mastery they've proven so far. Early on the score sits a little lower and rises to meet their working level. Similarly, the "Skills at [grade]" bar counts only that grade's skills, so a mastered easier skill can appear under Strengths without counting toward the current grade's total.</p>
        </div>
      </details>` : ''}
    </div>
    ${isParent && r.career ? renderCareer(r.career, k) : ''}
    ${isParent && r.history ? (() => {
      const H = r.history, max = Math.max(1, ...H.map(x => x.answers));
      const total = H.reduce((t, x) => t + x.answers, 0);
      const corr = H.reduce((t, x) => t + x.correct, 0);
      const activeDays = H.filter(x => x.answers > 0).length;
      const bars = H.map((x, i) => {
        const h = Math.round(x.answers / max * 70);
        const acc = x.answers ? x.correct / x.answers : 0;
        const col = !x.answers ? '#e3e0d8' : acc >= 0.8 ? '#1f8a5f' : acc >= 0.55 ? '#C9A84C' : '#d97b4f';
        return `<g><rect x="${i * 34 + 4}" y="${86 - h}" width="26" height="${Math.max(3, h)}" rx="4" fill="${col}"/>
          <text x="${i * 34 + 17}" y="99" font-size="8" text-anchor="middle" fill="#98a0af">${x.day.slice(8)}</text></g>`;
      }).join('');
      return `<div class="card">
        <h3>📈 Last 14 days</h3>
        <p class="muted" style="margin:4px 0 10px">${total} questions · ${total ? Math.round(corr / total * 100) : 0}% correct · active ${activeDays} of 14 days</p>
        <svg viewBox="0 0 480 104" style="width:100%;height:auto" role="img" aria-label="Daily activity chart">${bars}</svg>
        <p class="muted" style="font-size:.78rem;margin-top:6px">Bar height = questions answered · <span style="color:#1f8a5f">■</span> 80%+ correct · <span style="color:#C9A84C">■</span> 55–79% · <span style="color:#d97b4f">■</span> below 55%</p>
      </div>`;
    })() : ''}
    <div class="card">
      <h3>🏅 Badges</h3>
      <div class="badge-shelf" style="margin-top:10px">
        ${r.badges.length ? r.badges.map(b => `<div class="badge-item">${b.emoji} ${esc(b.name)}</div>`).join('') : '<p class="muted">Badges appear as you learn, the first one is one answer away!</p>'}
      </div>
    </div>
    <div class="card">
      <h3>🎓 Certificates</h3>
      <div style="margin-top:10px">
        ${r.certificates.length ? r.certificates.map(c => `
          <div class="cert" style="cursor:pointer" data-cert="${c.id}"><b>🎓 ${esc(c.title)}</b><br><span class="muted">Awarded ${esc(c.issued_at.slice(0, 10))} · tap to view & print the certificate 🖨️</span></div>`).join('')
        : '<p class="muted">Complete every skill in a grade level to earn a printable certificate!</p>'}
      </div>
    </div>
  </div>`);
  wireChrome();
  document.querySelectorAll('[data-cert]').forEach(el => el.onclick = () => { Sound.click(); location.hash = `#certificate/${kidId}/${el.dataset.cert}`; });
  document.querySelectorAll('[data-retake]').forEach(b => b.onclick = async () => {
    const sub = b.dataset.retake;
    if (!confirm(`Retake the ${sub} placement quiz? ${esc(k.name)} re-does the short assessment next time they open ${sub} — have them answer carefully and not rush, since it re-checks their starting level. Progress, badges, and any grade they've already mastered are kept.`)) return;
    await api(`/learn/${kidId}/placement/${sub}/retake`, { method: 'POST', body: {} });
    Sound.badge();
    b.textContent = '✅ Placement reset. The quiz runs on the next visit.';
    b.disabled = true;
  });
});

// ======================= weekly fridge report =======================
route('weekly', async (kidId) => {
  const r = await api(`/learn/${kidId}/report`);
  const k = r.kid;
  const week = (r.history || []).slice(-7);
  const total = week.reduce((t, x) => t + x.answers, 0);
  const corr = week.reduce((t, x) => t + x.correct, 0);
  const acc = total ? Math.round(corr / total * 100) : 0;
  const activeDays = week.filter(x => x.answers > 0).length;
  const best = r.subjects.filter(s => s.placed && s.avgMastery != null).sort((a, b) => b.avgMastery - a.avgMastery)[0];
  const focusList = r.subjects.flatMap(s => s.focusAreas.map(f => `${f} (${s.label})`)).slice(0, 3);
  const strengthList = r.subjects.flatMap(s => s.strengths.map(f => `${f} (${s.label})`)).slice(0, 3);
  const max = Math.max(1, ...week.map(x => x.answers));
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const bars = week.map((x, i) => {
    const h = Math.round(x.answers / max * 60);
    const a2 = x.answers ? x.correct / x.answers : 0;
    const col = !x.answers ? '#e3e0d8' : a2 >= 0.8 ? '#1f8a5f' : a2 >= 0.55 ? '#C9A84C' : '#d97b4f';
    const dn = dayNames[new Date(x.day + 'T12:00:00Z').getUTCDay()];
    return `<g><rect x="${i * 64 + 10}" y="${72 - h}" width="44" height="${Math.max(3, h)}" rx="5" fill="${col}"/>
      <text x="${i * 64 + 32}" y="86" font-size="10" text-anchor="middle" fill="#7d8496">${dn}</text>
      <text x="${i * 64 + 32}" y="${66 - h}" font-size="10" text-anchor="middle" fill="#16213a" font-weight="700">${x.answers || ''}</text></g>`;
  }).join('');
  const stars = total >= 100 ? '🌟🌟🌟' : total >= 50 ? '🌟🌟' : total >= 15 ? '🌟' : '';
  app().innerHTML = topbar(`<div class="container" style="max-width:820px">
    <div class="cert-frame">
      <div class="cert-inner" style="padding:30px 34px 26px;text-align:left">
        <div style="display:flex;align-items:center;gap:14px;justify-content:space-between;flex-wrap:wrap">
          <div style="display:flex;align-items:center;gap:12px">
            <img src="/logo-roundel.png" alt="" style="width:58px;height:58px">
            <div><div class="cert-academy" style="font-size:.7rem">GALLOP LEARNING ACADEMY</div>
            <h2 style="margin:2px 0 0;font-family:var(--font-display)">${esc(k.name)}'s Week ${stars}</h2></div>
          </div>
          <div style="text-align:right;color:#7d8496;font-size:.85rem">${new Date(Date.now() - 6 * 864e5).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}<br>🔥 ${k.streak}-day streak</div>
        </div>
        <div class="summary-stats" style="margin:16px 0 6px">
          <div class="sstat"><div class="n">${total}</div>questions</div>
          <div class="sstat"><div class="n">${acc}%</div>correct</div>
          <div class="sstat"><div class="n">${activeDays}/7</div>days active</div>
          ${best && State.me.role === 'parent' ? `<div class="sstat"><div class="n">${best.letter}</div>${esc(best.label)}</div>` : ''}
        </div>
        <svg viewBox="0 0 458 92" style="width:100%;height:auto;margin:8px 0" role="img" aria-label="Weekly activity chart: ${total} questions over ${activeDays} active day${activeDays === 1 ? '' : 's'}, ${acc}% correct.">${bars}</svg>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:8px">
          <div><b style="color:#1f8a5f">💪 Shining at</b><br><span class="muted" style="font-size:.9rem">${strengthList.length ? strengthList.map(esc).join('<br>') : 'Building the basics, stars incoming!'}</span></div>
          <div><b style="color:#C9A84C">🎯 Working on</b><br><span class="muted" style="font-size:.9rem">${focusList.length ? focusList.map(esc).join('<br>') : 'No trouble spots this week!'}</span></div>
        </div>
        <p style="margin-top:16px;font-size:.85rem;color:#7d8496;border-top:1px dashed #ddd;padding-top:10px">${total >= 100 ? `Outstanding week, ${esc(k.name)}, over 100 questions! The gallop is real. 🐎` : total >= 50 ? `Great consistency, ${esc(k.name)}, keep that streak alive! 🐎` : total > 0 ? `Every question counts, ${esc(k.name)}, let's pick up the pace next week! 🐎` : `A fresh week awaits, first quest starts today! 🐎`}</p>
      </div>
    </div>
    <div class="center no-print" style="margin-top:16px">
      <button class="btn" onclick="window.print()">🖨️ Print for the Fridge</button>
      <button class="btn ghost small" style="color:var(--brand);border-color:var(--brand);margin-left:8px" onclick="location.hash='#${State.me.role === 'parent' ? 'parent' : 'home'}'">← Back</button>
    </div>
  </div>`);
  wireChrome();
});

// ======================= printable certificate =======================
route('certificate', async (kidId, certId) => {
  const r = await api(`/learn/${kidId}/report`);
  const c = (r.certificates || []).find(x => String(x.id) === String(certId));
  if (!c) { location.hash = '#report/' + kidId; return; }
  const achievement = c.title.replace(' Complete!', '');
  const date = new Date(String(c.issued_at || '').replace(' ', 'T') + 'Z').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  app().innerHTML = topbar(`<div class="container" style="max-width:860px">
    <div class="cert-frame">
      <div class="cert-inner">
        <img src="/logo-roundel.png" alt="" class="cert-crest">
        <div class="cert-academy">GALLOP LEARNING ACADEMY</div>
        <div class="cert-title">Certificate of Completion</div>
        <div class="cert-rule"></div>
        <p class="cert-line">This certifies that</p>
        <div class="cert-name">${esc(r.kid.name)}</div>
        <p class="cert-line">has completed the skills and lessons in</p>
        <div class="cert-achievement">${esc(achievement)}</div>
        <p class="cert-date">Awarded ${esc(date)}</p>
        <div class="cert-footer">
          <div class="cert-sig"><span class="cert-sigline"></span>Gallop Learning Academy</div>
          <div class="cert-sig"><span class="cert-sigline"></span>The Tutor That Knows Your Kid</div>
        </div>
      </div>
    </div>
    <div class="center no-print" style="margin-top:18px">
      <button class="btn" onclick="window.print()">🖨️ Print Certificate</button>
      <button class="btn ghost small" style="color:var(--brand);border-color:var(--brand);margin-left:8px" onclick="location.hash='#report/${kidId}'">← Back to Report</button>
    </div>
  </div>`);
  wireChrome();
});

// ======================= paywall =======================
function renderPaywall(reason) {
  // A wrong-answer teaching overlay must never sit on top of the paywall.
  document.querySelectorAll('.celebrate').forEach(el => el.remove());
  // Speak to the actual account state — a long-paying parent with a declined card
  // should not be told they were "on a free trial". The reason comes from the backend
  // 402 (single source of truth), so the child paywall matches the parent dashboard.
  // Fall back to the parent's own sub_status when a reason wasn't passed.
  const pstat = (State.me && State.me.role === 'parent' && State.me.parent) ? State.me.parent.sub_status : null;
  const r = reason || (pstat === 'past_due' ? 'past_due' : pstat === 'canceled' ? 'canceled' : 'trial_expired');
  const heading = r === 'past_due' ? 'There was a problem with the payment'
    : r === 'canceled' ? 'This subscription is canceled'
    : r === 'no_subscription' ? 'A subscription is needed'
    : 'The free trial has ended';
  app().innerHTML = topbar(`<div class="container" style="max-width:600px"><div class="card center">
    <img src="/logo-roundel.png" alt="" style="width:84px;height:84px">
    <h2 style="margin-top:10px">${heading}</h2>
    <p class="muted" style="margin:10px 0 4px"><b>Everything is saved</b>, streaks, skill levels, badges, and certificates are waiting exactly where you left off.</p>
    <p class="muted" style="margin:0 0 16px">Keep all four subjects, the adaptive tutor, the games arcade, buddies, and weekly parent reports, for a fraction of what a tutoring center charges for a single subject.</p>
    ${State.me.role === 'parent'
      ? `<button class="btn green" id="sub-family">Family, $54/mo (up to 4 children)</button> <button class="btn" style="margin-left:8px" id="sub-solo">Solo, $34/mo</button>
         <p class="muted" style="margin-top:12px;font-size:.85rem">Billed monthly and renews automatically until you cancel. Cancel anytime in one click from your dashboard.</p>`
      : `<p><b>Ask your parent to keep it going!</b></p>
         ${State.me.kid ? `<button class="btn green" id="email-parent">📧 Email my parent to subscribe</button> ` : ''}<button class="btn ghost small" style="margin-left:8px;color:#41506a;border-color:#cfd8e3" onclick="location.hash='#login'">Parent Login</button>
         <p id="ep-done" style="display:none;margin-top:12px;color:var(--brand);font-weight:700"></p>`}
  </div></div>`);
  wireChrome();
  const fam = $('#sub-family'), solo = $('#sub-solo');
  if (fam) fam.onclick = () => checkout('family');
  if (solo) solo.onclick = () => checkout('solo');
  const ep = $('#email-parent');
  if (ep) ep.onclick = async () => {
    ep.disabled = true; ep.textContent = 'Sending…';
    try {
      await api('/learn/' + (State.me.kid ? State.me.kid.id : '0') + '/notify-parent', { method: 'POST' });
      ep.style.display = 'none';
      const done = $('#ep-done'); if (done) { done.style.display = 'block'; done.textContent = '✓ We let your grown-up know — check with them soon!'; }
    } catch (e) { ep.disabled = false; ep.textContent = '📧 Email my parent to subscribe'; toast((e && e.message) || 'Could not send right now.'); }
  };
}
async function checkout(plan) {
  try {
    const out = await api('/billing/checkout', { method: 'POST', body: { plan } });
    if (out.error) { toast(out.error); return; }
    const value = PLAN_PRICE[plan] || 0;
    gtmPush({ event: 'begin_checkout', currency: 'USD', value, plan });
    // Stash so the return from Stripe (a full page reload) can fire 'purchase' with the plan/value.
    try { sessionStorage.setItem('gallop_purchase', JSON.stringify({ plan, value })); } catch (e) {}
    if (out.demo) { gtmPush({ event: 'purchase', currency: 'USD', value, plan }); try { sessionStorage.removeItem('gallop_purchase'); } catch (e) {} await refreshMe(); Confetti.burst(150); Sound.levelup(); location.hash = '#parent'; }
    else if (out.url) location.href = out.url;
  } catch (e) {
    toast(e.message || 'Could not start checkout. Please try again in a moment.');
  }
}

// ======================= parent dashboard =======================
route('parent', async () => {
  await refreshMe();
  if (State.me.role === 'kid') { location.hash = '#home'; return; }
  if (State.me.role !== 'parent') { location.hash = '#login'; return; }
  const me = State.me;
  const p = me.parent;
  const trialDays = Math.max(0, Math.round((new Date(String(p.trial_ends || '').replace(' ', 'T') + 'Z') - Date.now()) / 86400000));
  const subLine = p.sub_status === 'active'
    ? `✅ ${esc((me.plans[p.sub_plan] || {}).name || 'Subscribed')} plan active`
    : p.sub_status === 'trial'
      ? (trialDays > 0 ? `⏳ Free trial, ${trialDays} day${trialDays === 1 ? '' : 's'} left` : '🔒 Trial ended')
      : `🔒 Subscription ${esc(p.sub_status)}`;

  const trialUrgent = p.sub_status === 'trial' && trialDays > 0 && trialDays <= 3;
  const trialEnded = p.sub_status === 'trial' && trialDays <= 0;
  app().innerHTML = topbar(`<div class="container">
    <div class="dash-welcome" style="margin-bottom:14px"><h1>Welcome, ${esc(p.name)} 👋</h1><p>${subLine} ${me.billingMode === 'demo' ? '· <i>(demo billing, add Stripe keys to charge real cards)</i>' : ''}</p></div>
    ${trialUrgent ? `<div class="trial-banner">
      <div><b>⏳ Your free trial ends in ${trialDays} day${trialDays === 1 ? '' : 's'}.</b><br>
      <span>All progress, streaks, badges and certificates are saved, subscribing keeps the gallop going without missing a day.</span></div>
      <div style="white-space:nowrap"><button class="btn sun" id="tb-family">Family, $54/mo</button>
      <button class="btn ghost small" style="color:#fff;border-color:rgba(255,255,255,.6);margin-left:8px" id="tb-solo">Solo, $34/mo</button></div>
    </div>` : ''}
    ${(trialEnded || p.sub_status === 'canceled') ? `<div class="trial-banner">
      <div><b>🔒 Your ${trialEnded ? 'free trial has ended' : 'subscription is canceled'}.</b><br>
      <span>Everything — progress, streaks, badges and certificates — is saved exactly where your child left off. Subscribe to jump right back in.</span></div>
      <div style="white-space:nowrap"><button class="btn sun" id="tb-family">Family, $54/mo</button>
      <button class="btn ghost small" style="color:#fff;border-color:rgba(255,255,255,.6);margin-left:8px" id="tb-solo">Solo, $34/mo</button></div>
    </div>` : ''}
    ${p.sub_status === 'past_due' ? `<div class="trial-banner">
      <div><b>💳 Your last payment didn't go through.</b><br>
      <span>Update your card to keep your subscription active — you won't be charged twice.</span></div>
      <div style="white-space:nowrap"><button class="btn sun" id="tb-portal">Update payment method</button></div>
    </div>` : ''}
    <div id="kid-snapshots" style="margin-bottom:16px"></div>
    <div id="monthly-recap" style="margin-bottom:16px"></div>
    <div class="dash-grid">
      <div class="card">
        <h3>👧 Your Learners</h3>
        <div id="kid-list" style="margin-top:12px">
          ${me.kids.length ? me.kids.map(k => `
            <div class="kid-row">
              <span class="avatar-sm">${avatarHTML(k)}</span>
              <div style="flex:1"><b>${esc(k.name)}</b><br><span class="muted" style="font-size:.85rem">Grade ${k.grade === 0 ? 'K' : k.grade} · 🔥${k.streak} streak · ⚡${k.xp} XP · ${esc(k.calendar_mode)}</span></div>
              <button class="btn green small" data-start="${k.id}">▶ Start</button>
              <button class="btn games small" data-games="${k.id}" title="Games settings" aria-label="Games settings for ${esc(k.name)}">🎮 Games${k.games_enabled === 0 ? ' <span style="opacity:.9">· off</span>' : ''}</button>
              <button class="btn small" data-report="${k.id}">📊 Report</button>
              <button class="btn small" data-weekly="${k.id}" title="Printable weekly summary" aria-label="Printable weekly summary for ${esc(k.name)}">📄</button>
              <button class="btn small" data-edit="${k.id}" title="Edit learner" aria-label="Edit ${esc(k.name)}">✏️</button>
              <button class="btn coral small" data-del="${k.id}" title="Remove learner" aria-label="Remove ${esc(k.name)}">✕</button>
            </div>
            <div class="kid-edit" id="edit-${k.id}" style="display:none">
              <div class="ke-grid">
                <div><label>Name</label><input class="ke-name" value="${esc(k.name)}"></div>
                <div><label>Grade</label><select class="ke-grade">${['K', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g, i) => `<option value="${i}" ${k.grade === i ? 'selected' : ''}>${g === 'K' ? 'K' : g}</option>`).join('')}</select></div>
                <div><label>PIN</label><input class="ke-pin" maxlength="4" inputmode="numeric" placeholder="unchanged"></div>
                <div><label>Weekly goal</label><select class="ke-goal">${[6, 9, 12, 15, 20].map(g => `<option value="${g}" ${(k.weekly_goal || 12) === g ? 'selected' : ''}>${g * 10} answers/wk</option>`).join('')}</select></div>
                <div><label>Schedule</label><select class="ke-cal">${['traditional', 'yearround', 'homeschool'].map(c => `<option value="${c}" ${k.calendar_mode === c ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
              </div>
              <label class="ke-showlevel"><input type="checkbox" class="ke-showlevel-cb" ${k.show_level ? 'checked' : ''}>
                <span><b>Show ${esc(k.name.split(' ')[0])} their grade level</b><br><span class="muted" style="font-size:.83rem">Off by default. We adapt to your child's real level in each subject, but we keep the grade number between you and us — so a child who's working below their grade never sees it and feels discouraged. You'll always see it in the report. Flip this on when you'd like to share it with ${esc(k.name.split(' ')[0])}.</span></span>
              </label>
              <p class="muted" style="font-size:.83rem;margin:10px 0 0">🎮 Game controls (on/off, earn-it & daily limit) now live on the <b>🎮 Games</b> button above.</p>
              <div class="error-msg ke-err"></div>
              <button class="btn small green" data-save-edit="${k.id}" style="margin-top:8px">Save ✓</button>
              <button class="btn ghost small" data-cancel-edit="${k.id}" style="color:#7f8c9b;border-color:#dfe6e9;margin-left:8px;margin-top:8px">Cancel</button>
              <div class="ke-levels" id="levels-${k.id}"><p class="muted" style="font-size:.85rem">Loading levels…</p></div>
              <div style="margin-top:12px;padding-top:12px;border-top:1px dashed #dfe6e9">
                <button class="btn ghost small" data-reset="${k.id}" style="color:#b0532f;border-color:#ecccc0">🔄 Start ${esc(k.name.split(' ')[0])} fresh</button>
                <span class="muted" style="font-size:.8rem;margin-left:8px">Clears all progress and re-takes placement. Keeps their name, PIN & avatar.</span>
              </div>
            </div>
            <div class="kid-games" id="games-${k.id}" style="display:none">
              <div class="kg-head">🎮 Games for ${esc(k.name.split(' ')[0])}</div>
              <label class="kg-toggle"><input type="checkbox" class="kg-on-cb" ${k.games_enabled == null || k.games_enabled ? 'checked' : ''}>
                <span><b>Play Zone arcade</b><br><span class="muted" style="font-size:.83rem">The break games. On for the full experience, or off for a pure-learning setup with no games at all.</span></span>
              </label>
              <div class="kg-sub">🎟️ <b>Earn it:</b> unlock games after <input type="number" class="kg-gate-inp" min="0" max="100" value="${k.games_gate || 0}"> questions answered that day <span class="muted" style="font-size:.83rem">— 0 = always available.</span></div>
              <div class="kg-sub">⏰ <b>Daily limit:</b> at most <input type="number" class="kg-time-inp" min="0" max="240" value="${k.games_time_limit || 0}"> minutes of games per day <span class="muted" style="font-size:.83rem">— 0 = no limit. Kids see a countdown while they play.</span></div>
              <div class="error-msg kg-err"></div>
              <button class="btn small green" data-save-games="${k.id}" style="margin-top:10px">Save games settings ✓</button>
              <button class="btn ghost small" data-cancel-games="${k.id}" style="color:#7f8c9b;border-color:#dfe6e9;margin-left:8px;margin-top:10px">Close</button>
            </div>`).join('') : '<p class="muted">Add your first learner below! 👇</p>'}
        </div>
        <h4 style="margin-top:18px">Add a learner</h4>
        <label>Name</label><input id="nk-name" placeholder="e.g. Margaux">
        <label>Grade</label><select id="nk-grade">${['K', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g, i) => `<option value="${i}">${g === 'K' ? 'Kindergarten' : 'Grade ' + g}</option>`).join('')}</select>
        <label>4-digit PIN (their fun password)</label><input id="nk-pin" maxlength="4" inputmode="numeric" placeholder="e.g. 2019">
        <label>Schedule</label><select id="nk-cal">
          <option value="traditional">Traditional school year (Aug–Jun)</option>
          <option value="yearround">Year-round</option>
          <option value="homeschool">Homeschool (Sep–Jun)</option>
        </select>
        <label>Pick an avatar</label>
        <div class="avatar-pick" id="nk-avatars">${Object.entries(AVATARS).map(([k, e], i) => `<div class="avatar-opt${i === 0 ? ' sel' : ''}" data-a="${k}" title="${esc(k.charAt(0).toUpperCase() + k.slice(1))} avatar">${e}</div>`).join('')}</div>
        <p class="muted" style="font-size:.83rem;margin-top:6px">This is just their starting look, kids fully customize it in the Avatar Builder with hats, pets & worlds they buy with coins they earn by learning. 🎨</p>
        <div class="consent-notice">
          <b>Before you add your child — what we collect and why</b>
          <p>To run and adapt lessons, Gallop collects your child's first name (or a nickname), their grade, a 4-digit login PIN, and their answers and progress. That's it. We use it only to teach your child and show you their progress. <b>We never sell children's data or use it for advertising.</b> You can review or delete your child's data anytime from this dashboard. Full details are in the <a href="/privacy" target="_blank" rel="noopener">Children's Privacy notice</a>.</p>
        </div>
        <label style="display:flex;align-items:flex-start;gap:9px;margin-top:12px;font-weight:500;cursor:pointer">
          <input type="checkbox" id="nk-consent" style="margin-top:3px;width:18px;height:18px;flex:none">
          <span style="font-size:.86rem;line-height:1.5">I am this child's parent or legal guardian, and I consent to Gallop collecting and using the information described above to run their lessons.</span>
        </label>
        <div class="error-msg" id="nk-err"></div>
        <button class="btn green" style="margin-top:14px;width:100%" id="nk-go">Add Learner ✨</button>
      </div>
      <div>
        <div id="family-week"></div>
        <div class="card">
          <h3>💳 Subscription</h3>
          <p class="muted" style="margin:8px 0 14px">${subLine}</p>
          ${p.sub_status === 'active' ? `
            <button class="btn" style="width:100%" id="sub-portal">Manage Billing</button>`
          : p.sub_status === 'past_due' ? `
            <p class="muted" style="margin:0 0 12px">Your last payment didn't go through. Update your card to keep your subscription — you won't be charged twice.</p>
            <button class="btn green" style="width:100%" id="sub-portal">Update payment method</button>`
          : `
            <button class="btn green" style="width:100%" id="sub-family">Family, $54/mo (up to 4 children)</button>
            <button class="btn" style="width:100%;margin-top:8px" id="sub-solo">Solo, $34/mo (1 child)</button>
            <p class="muted center" style="margin-top:8px;font-size:.8rem">Billed monthly, renews automatically until canceled. Cancel anytime in one click.</p>`}
          <p class="muted center" style="margin-top:10px;font-size:.85rem">${me.billingMode === 'stripe' ? '🔒 Payments powered by Stripe' : me.billingMode === 'demo' ? 'Demo mode: subscribe activates instantly, no card needed.' : '🔒 Payments powered by Stripe'}</p>
        </div>
        <div class="card">
          <h3>🔐 Account</h3>
          <label>Current password</label><input id="cp-cur" type="password" autocomplete="current-password">
          <label>New password (8+ characters)</label><input id="cp-new" type="password" autocomplete="new-password">
          <div class="error-msg" id="cp-err"></div>
          <button class="btn small" style="margin-top:10px" id="cp-go">Change Password</button>
          <span id="cp-ok" style="margin-left:10px;color:#1f8a5f;font-weight:700;display:none">✓ Updated!</span>
        </div>
        <div class="card">
          <h3>🛡️ Children's privacy &amp; your data</h3>
          <p class="muted" style="margin:8px 0 10px;line-height:1.6">For each child we collect only their first name, grade, a login PIN, and their lesson answers &amp; progress — used solely to teach them and show you results. <b>We never sell children's data or use it for ads.</b> You're in control of it.</p>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn small" id="pv-export">⬇️ Download my data</button>
            <a class="btn ghost small" href="/privacy" target="_blank" rel="noopener" style="text-decoration:none">Privacy notice</a>
          </div>
          <p class="muted" style="margin:10px 0 0;font-size:.82rem">To delete a child and erase their data, use the ✏️ edit button on that learner above and choose Delete — it removes everything and withdraws consent immediately.</p>
        </div>
        <div class="card">
          <h3>🚀 How kids log in (any device)</h3>
          <p class="muted" style="margin-top:8px;line-height:1.6">1. Go to this site on any PC, Mac, or tablet<br>2. Tap <b>Child Login</b> → enter <b>${esc(p.email)}</b><br>3. They pick their avatar & enter their 4-digit PIN<br><br>That's it, progress syncs everywhere. 🎉</p>
        </div>
        <div class="card">
          <h3>🧭 A quick guide for parents</h3>
          <details class="pguide"><summary>How much should my child do?</summary>
            <p>About <b>15–20 minutes a day</b> is plenty. Short and steady beats one long session — a few days a week keeps skills fresh without burnout. You'll see the day's minutes and questions on each child's card above.</p></details>
          <details class="pguide"><summary>How does Gallop pick the right level?</summary>
            <p>Each subject starts with a quick placement, then adapts to your child's <b>real</b> level question by question. If something's too easy it moves up; if it's shaky it slows down and reinforces. So your child is always working right at their edge — challenged, not overwhelmed.</p></details>
          <details class="pguide"><summary>Why doesn't my child see a grade level?</summary>
            <p>By default we keep the grade number between you and us. A child working a little below their grade never sees it and never feels discouraged — they just see themselves getting better. You always see the real level in each report, and you can choose to share it with your child anytime from the ✏️ edit panel.</p></details>
          <details class="pguide"><summary>Can I control the games?</summary>
            <p>Yes — use the <b>🎮 Games</b> button on each child above. Turn the arcade fully on or off, require a number of questions first ("earn it"), or set a daily time limit. Kids see a friendly countdown so games never cut off without warning.</p></details>
          <details class="pguide"><summary>Is my child's data safe?</summary>
            <p>We collect only what's needed to teach — first name, grade, a PIN, and their answers. <b>We never sell children's data or use it for ads</b>, there's no open chat, and no links take kids off the app. You can download or delete everything anytime.</p></details>
        </div>
        <div class="card">
          <h3>💌 School Buddies</h3>
          <p class="muted" style="margin-top:8px">Connect your children with friends from school, <b>parent-approved only</b>. Children see each other's streaks & badges and send pre-written cheers. No open chat, ever.</p>
          <label>Create an invite code for</label>
          <select id="bd-kid">${me.kids.map(k => `<option value="${k.id}">${esc(k.name)}</option>`).join('')}</select>
          <button class="btn small" style="margin-top:8px" id="bd-create">Create Code</button>
          <div id="bd-code" style="margin-top:8px;font-size:1.4rem;font-weight:700;letter-spacing:3px"></div>
          <label style="margin-top:14px">Got a code from another family?</label>
          <input id="bd-input" placeholder="e.g. 4F7A2C" maxlength="6" style="text-transform:uppercase">
          <label>Connect it to</label>
          <select id="bd-kid2">${me.kids.map(k => `<option value="${k.id}">${esc(k.name)}</option>`).join('')}</select>
          <div class="error-msg" id="bd-err"></div>
          <button class="btn green small" style="margin-top:8px" id="bd-accept">Link Buddies ✨</button>
        </div>
        <div class="card">
          <h3>🧭 How the tutor works</h3>
          <p class="muted" style="margin-top:8px;line-height:1.6">Each subject starts with a short <b>placement quiz</b>, so a child can be working at a fourth-grade level in reading and a second-grade level in math at the same time. Every answer updates what we know about their skills. Strong ones move faster; shaky ones get gentler questions, more hints, and extra practice. Finishing a whole grade level earns a <b>certificate</b>. Correct answers also earn <b>play tokens</b> for the arcade, so the learning always comes first.</p>
        </div>
      </div>
    </div>
  </div>`);
  wireChrome();
  const bdc = $('#bd-create'), bda = $('#bd-accept');
  if (bdc) bdc.onclick = async () => {
    try { const r = await api('/buddies/invite', { method: 'POST', body: { kidId: Number($('#bd-kid').value) } }); $('#bd-code').textContent = '🎫 ' + r.code; Sound.badge(); }
    catch (e) { showError('#bd-err', e.message); }
  };
  if (bda) bda.onclick = async () => {
    try { const r = await api('/buddies/accept', { method: 'POST', body: { code: $('#bd-input').value, kidId: Number($('#bd-kid2').value) } }); $('#bd-input').value = ''; Sound.levelup(); Confetti.burst(100); alert('Connected with ' + r.buddyName + '! 🎉'); }
    catch (e) { showError('#bd-err', e.message); }
  };

  let avatar = 'fox';
  document.querySelectorAll('#nk-avatars .avatar-opt').forEach(el => el.onclick = () => {
    document.querySelectorAll('#nk-avatars .avatar-opt').forEach(x => x.classList.remove('sel'));
    el.classList.add('sel'); avatar = el.dataset.a; Sound.click();
  });
  $('#nk-go').onclick = async () => {
    try {
      const consentEl = $('#nk-consent');
      if (consentEl && !consentEl.checked) { showError('#nk-err', 'Please check the box to confirm parental consent.'); return; }
      const wasFirst = me.kids.length === 0;
      const kidName = $('#nk-name').value.trim();
      const r = await api('/kids', { method: 'POST', body: { name: kidName, grade: Number($('#nk-grade').value), pin: $('#nk-pin').value, avatar, calendar_mode: $('#nk-cal').value, consent: true } });
      Sound.badge();
      if (wasFirst) { timeToGallop(r.kidId, kidName); return; }
      navigate();
    } catch (e) { showError('#nk-err', e.message); }
  };
  async function enterKid(kidId, dest) {
    await api('/auth/enter-kid', { method: 'POST', body: { kidId } });
    await refreshMe();
    Sound.levelup();
    location.hash = dest || '#home';
    if (location.hash === (dest || '#home')) navigate();
  }
  // "Time to Gallop!", straight from signup into learning, no re-login needed.
  function timeToGallop(kidId, kidName) {
    Confetti.burst(180); Sound.levelup();
    const div = document.createElement('div');
    div.className = 'celebrate';
    div.innerHTML = `<img src="/logo-roundel.png" alt="" style="width:110px;height:110px"><h2>Time to Gallop!</h2>
      <p style="font-size:1.15rem;max-width:440px">${esc(kidName)} is all set up. The first stop in each subject is a short placement quiz that finds the right starting level for ${esc(kidName)}.</p>
      <button class="btn sun" id="tg-go" style="margin-top:6px">Start Learning as ${esc(kidName)} →</button>
      <button class="btn ghost" id="tg-later" style="margin-top:10px">I'll explore the dashboard first</button>`;
    div.querySelector('#tg-go').onclick = () => { div.remove(); enterKid(kidId, '#home'); };
    div.querySelector('#tg-later').onclick = () => { div.remove(); navigate(); };
    document.body.appendChild(div);
  }
  // Fresh signup with no learners yet? Point them at the one thing to do.
  if (State.onboard && !me.kids.length) {
    State.onboard = false;
    const div = document.createElement('div');
    div.className = 'celebrate';
    div.innerHTML = `<div class="big-emoji">👋</div><h2>Let's get started!</h2>
      <p style="font-size:1.15rem;max-width:420px">Welcome to Gallop Learning Academy! First step: add your learner, name, grade, and a 4-digit PIN they'll use to log in on any device.</p>
      <button class="btn sun">Add my learner →</button>`;
    div.querySelector('button').onclick = () => { div.remove(); const f = $('#nk-name'); if (f) { f.scrollIntoView({ behavior: 'smooth', block: 'center' }); f.focus(); } };
    document.body.appendChild(div);
  }
  async function loadLevels(kidId) {
    const box = $('#levels-' + kidId);
    if (!box) return;
    try {
      const r = await api('/kids/' + kidId + '/levels');
      box.innerHTML = `<b style="font-size:.85rem">📚 Set working level <span class="muted" style="font-weight:400">— if a subject is placed wrong, pick the right grade here and Gallop locks to it (it won't drift back).</span></b>
        <div class="lvl-rows">${r.levels.map(l => `
          <div class="lvl-row">
            <span class="lvl-sub">${esc(l.label)}</span>
            ${l.placed ? `<select class="lvl-sel" data-lvl-kid="${kidId}" data-lvl-sub="${l.subject}">
              ${Array.from({ length: l.max + 1 }, (_, g) => `<option value="${g}" ${g === l.level ? 'selected' : ''}>${g === 0 ? 'Kindergarten' : 'Grade ' + g}</option>`).join('')}
            </select>` : `<span class="lvl-name muted">${esc(l.levelName)}</span>`}
          </div>`).join('')}</div>`;
      box.querySelectorAll('.lvl-sel').forEach(sel => sel.onchange = async () => {
        const kid = sel.dataset.lvlKid, subject = sel.dataset.lvlSub, level = Number(sel.value);
        sel.disabled = true;
        try {
          const res = await api('/kids/' + kid + '/level', { method: 'POST', body: { subject, level } });
          Sound.badge(); toast(`${subject.charAt(0).toUpperCase() + subject.slice(1)} set to ${res.levelName}.`);
          loadLevels(Number(kid));
        } catch (e) { sel.disabled = false; }
      });
    } catch (e) { box.innerHTML = ''; }
  }
  document.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => {
    const el = $('#edit-' + b.dataset.edit);
    if (el) {
      const opening = el.style.display === 'none';
      el.style.display = opening ? 'block' : 'none'; Sound.click();
      if (opening) loadLevels(Number(b.dataset.edit));
    }
  });
  document.querySelectorAll('[data-cancel-edit]').forEach(b => b.onclick = () => { const el = $('#edit-' + b.dataset.cancelEdit); if (el) el.style.display = 'none'; });
  document.querySelectorAll('[data-games]').forEach(b => b.onclick = () => {
    const el = $('#games-' + b.dataset.games);
    if (el) { el.style.display = el.style.display === 'none' ? 'block' : 'none'; Sound.click(); }
  });
  document.querySelectorAll('[data-cancel-games]').forEach(b => b.onclick = () => { const el = $('#games-' + b.dataset.cancelGames); if (el) el.style.display = 'none'; });
  document.querySelectorAll('[data-save-games]').forEach(b => b.onclick = async () => {
    const box = $('#games-' + b.dataset.saveGames);
    const body = {
      games_enabled: box.querySelector('.kg-on-cb').checked ? 1 : 0,
      games_gate: Math.max(0, Math.min(100, parseInt(box.querySelector('.kg-gate-inp').value, 10) || 0)),
      games_time_limit: Math.max(0, Math.min(240, parseInt(box.querySelector('.kg-time-inp').value, 10) || 0))
    };
    try {
      await api('/kids/' + b.dataset.saveGames, { method: 'PATCH', body });
      Sound.badge(); navigate();
    } catch (e) { const err = box.querySelector('.kg-err'); err.textContent = e.message; err.classList.add('show'); }
  });
  document.querySelectorAll('[data-save-edit]').forEach(b => b.onclick = async () => {
    const box = $('#edit-' + b.dataset.saveEdit);
    const body = {
      name: box.querySelector('.ke-name').value.trim(),
      grade: Number(box.querySelector('.ke-grade').value),
      weekly_goal: Number(box.querySelector('.ke-goal').value),
      calendar_mode: box.querySelector('.ke-cal').value,
      show_level: box.querySelector('.ke-showlevel-cb') && box.querySelector('.ke-showlevel-cb').checked ? 1 : 0
    };
    const pin = box.querySelector('.ke-pin').value.trim();
    if (pin) body.pin = pin;
    try {
      await api('/kids/' + b.dataset.saveEdit, { method: 'PATCH', body });
      Sound.badge(); navigate();
    } catch (e) { const err = box.querySelector('.ke-err'); err.textContent = e.message; err.classList.add('show'); }
  });
  document.querySelectorAll('[data-start]').forEach(b => b.onclick = () => enterKid(Number(b.dataset.start)));
  document.querySelectorAll('[data-report]').forEach(b => b.onclick = () => location.hash = '#report/' + b.dataset.report);
  document.querySelectorAll('[data-weekly]').forEach(b => b.onclick = () => location.hash = '#weekly/' + b.dataset.weekly);
  document.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => {
    if (confirm('Remove this learner and all their progress?')) { await api('/kids/' + b.dataset.del, { method: 'DELETE' }); navigate(); }
  });
  document.querySelectorAll('[data-reset]').forEach(b => b.onclick = async () => {
    if (confirm('Start this learner fresh? This clears all lessons, levels, scores, badges and certificates and re-takes placement. Their name, PIN and avatar are kept. This cannot be undone.')) {
      b.disabled = true; b.textContent = 'Resetting…';
      try { await api('/kids/' + b.dataset.reset + '/reset', { method: 'POST' }); toast('Fresh start ready — next session begins with a new placement.'); navigate(); }
      catch (e) { b.disabled = false; toast((e && e.message) || 'Could not reset right now.'); }
    }
  });
  const tbf = $('#tb-family'), tbs = $('#tb-solo'), tbp = $('#tb-portal');
  if (tbf) tbf.onclick = () => checkout('family');
  if (tbs) tbs.onclick = () => checkout('solo');
  if (tbp) tbp.onclick = async () => {
    try { const out = await api('/billing/portal', { method: 'POST' }); if (out.url) location.href = out.url; else toast('Billing portal unavailable right now.'); }
    catch (e) { toast(e.message || 'Could not open billing.'); }
  };
  const cpg = $('#cp-go');
  if (cpg) cpg.onclick = async () => {
    try {
      await api('/auth/change-password', { method: 'POST', body: { current: $('#cp-cur').value, next: $('#cp-new').value } });
      $('#cp-cur').value = ''; $('#cp-new').value = ''; $('#cp-err').classList.remove('show');
      $('#cp-ok').style.display = 'inline'; Sound.badge();
      setTimeout(() => { const el = $('#cp-ok'); if (el) el.style.display = 'none'; }, 3000);
    } catch (e) { showError('#cp-err', e.message); }
  };
  const pvx = $('#pv-export');
  if (pvx) pvx.onclick = async () => {
    pvx.disabled = true; const orig = pvx.textContent; pvx.textContent = 'Preparing…';
    try {
      const res = await fetch('/api/privacy/export', { credentials: 'same-origin' });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'gallop-my-data.json';
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      toast('✓ Your data downloaded as gallop-my-data.json');
    } catch (e) { toast('Could not prepare the download. Please try again.'); }
    pvx.disabled = false; pvx.textContent = orig;
  };
  const fam = $('#sub-family'), solo = $('#sub-solo'), portal = $('#sub-portal');
  if (fam) fam.onclick = () => checkout('family');
  if (solo) solo.onclick = () => checkout('solo');
  if (portal) portal.onclick = async () => {
    try { const o = await api('/billing/portal', { method: 'POST' }); if (o && o.url) location.href = o.url; else toast('Could not open billing.'); }
    catch (e) { toast(e.message || 'Could not open billing right now. Please try again in a moment.'); }
  };
  // Sibling leaderboard, only interesting with 2+ kids
  if (me.kids.length >= 2) {
    api('/family/stats').then(({ stats }) => {
      const medals = ['🥇', '🥈', '🥉', '🎗️'];
      const box = $('#family-week');
      if (!box) return;
      box.innerHTML = `<div class="card">
        <h3>🏆 This Week at Home</h3>
        <p class="muted" style="margin:4px 0 10px">Questions answered in the last 7 days, a little friendly sibling rivalry never hurt!</p>
        ${stats.map((s, i) => `
          <div class="kid-row">
            <span style="font-size:1.3rem">${medals[i] || '⭐'}</span>
            <span class="avatar-sm">${AVATARS[s.avatar] || '🦊'}</span>
            <div style="flex:1"><b>${esc(s.name)}</b><br><span class="muted" style="font-size:.83rem">${s.weekAnswers} answers${s.weekAccuracy != null ? ' · ' + s.weekAccuracy + '% correct' : ''} · 🔥${s.streak}</span></div>
          </div>`).join('')}
      </div>`;
    }).catch(() => {});
  }
  // Actionable per-child snapshot at the top: status, weekly progress, and the exact
  // skill they need help with — with a one-tap launch straight into practice on it.
  api('/family/overview').then(({ kids }) => {
    const box = $('#kid-snapshots');
    if (!box || !kids || !kids.length) return;
    const S = {
      'excelling':     { label: 'Excelling',      color: '#1f8a5f', bg: '#eaf6ef', emoji: '🌟' },
      'on-track':      { label: 'On track',       color: '#2f7fd1', bg: '#eaf2fb', emoji: '✅' },
      'developing':    { label: 'Developing',     color: '#b8860b', bg: '#fbf3dc', emoji: '📈' },
      'needs-support': { label: 'Needs a hand',   color: '#d9683f', bg: '#fdeee7', emoji: '🤝' },
      'getting-started': { label: 'Getting started', color: '#7f8c9b', bg: '#f1f3f5', emoji: '🌱' }
    };
    const SUBJ = { math: '🔢 Math', english: '📚 Reading', science: '🔬 Science', spanish: '🌎 Spanish' };
    box.innerHTML = `<div class="dash-grid" style="gap:14px">${kids.map(k => {
      const st = S[k.overall] || S['getting-started'];
      const goalPct = Math.min(100, k.weeklyGoal ? Math.round(k.weekAnswers / k.weeklyGoal * 100) : 0);
      const f = k.focus && k.focus[0];
      return `<div class="card" style="border-top:4px solid ${st.color};padding:16px 18px">
        <div style="display:flex;align-items:center;gap:10px">
          <span class="avatar-sm" style="font-size:1.5rem">${avatarHTML(k)}</span>
          <div style="flex:1;min-width:0">
            <b style="font-size:1.05rem">${esc(k.name)}</b> <span class="muted" style="font-size:.82rem">· Grade ${k.grade === 0 ? 'K' : k.grade} · 🔥${k.streak}</span>
          </div>
          <span style="background:${st.bg};color:${st.color};font-weight:700;font-size:.8rem;padding:4px 11px;border-radius:999px;white-space:nowrap">${st.emoji} ${st.label}</span>
        </div>
        ${k.needsSetup ? `
          <p class="muted" style="margin:12px 0 10px;font-size:.9rem">Ready to begin! Start ${esc(k.name.split(' ')[0])} and they'll take a quick placement so every subject begins at exactly the right level.</p>
          <button class="btn green small snap-start" data-kid="${k.id}">▶ Start ${esc(k.name.split(' ')[0])}</button>
        ` : `
          ${k.gallop != null ? `<div class="snap-growth">
            <span class="sg-label">🏆 Gallop Score</span>
            <span class="sg-num">${k.gallop}${k.gallopDelta > 0 ? ` <span class="sg-up">▲ +${k.gallopDelta} this week</span>` : ''}</span>
          </div>` : ''}
          <div style="display:flex;gap:8px;margin:12px 0 2px;flex-wrap:wrap">
            <span style="background:#eef2f7;color:#41506a;font-size:.78rem;font-weight:600;padding:3px 10px;border-radius:999px">📅 Today: ${k.todayAnswers || 0} question${(k.todayAnswers || 0) === 1 ? '' : 's'}${k.minutesToday ? ` · ⏱ ${k.minutesToday} min` : ''}</span>
          </div>
          <div style="margin:8px 0 8px">
            <div style="display:flex;justify-content:space-between;font-size:.8rem;color:#5f6b7d;margin-bottom:4px">
              <span>This week: <b>${k.weekAnswers}</b> / ${k.weeklyGoal} answers${k.weekAccuracy != null ? ` · ${k.weekAccuracy}% correct` : ''}${k.minutesWeek ? ` · ⏱ ${k.minutesWeek} min` : ''}</span>
              <span>${goalPct}%</span>
            </div>
            <div style="height:7px;background:#eef0f2;border-radius:999px;overflow:hidden"><div style="height:100%;width:${goalPct}%;background:${st.color}"></div></div>
          </div>
          ${f ? `
            <div style="background:#fdeee7;border-radius:10px;padding:10px 12px;margin:10px 0 4px">
              <div style="font-size:.82rem;color:#b0532f"><b>🎯 Needs a hand with:</b> ${esc(f.name)} <span class="muted">(${SUBJ[f.subject] || f.subject})</span></div>
              <button class="btn coral small snap-focus" data-kid="${k.id}" data-subject="${f.subject}" data-skill="${esc(f.skillId)}" style="margin-top:8px">✨ Practice this together</button>
            </div>` : `
            <p class="muted" style="margin:8px 0 4px;font-size:.85rem">No trouble spots right now — ${esc(k.name.split(' ')[0])} is moving along nicely. 🎉</p>`}
          <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn green small snap-start" data-kid="${k.id}">▶ Start</button>
            <button class="btn small snap-report" data-kid="${k.id}">📊 Full report</button>
          </div>
        `}
      </div>`;
    }).join('')}</div>`;
    box.querySelectorAll('.snap-start').forEach(b => b.onclick = () => enterKid(Number(b.dataset.kid)));
    box.querySelectorAll('.snap-report').forEach(b => b.onclick = () => { location.hash = '#report/' + b.dataset.kid; });
    box.querySelectorAll('.snap-focus').forEach(b => b.onclick = () => enterKid(Number(b.dataset.kid), '#lesson/' + b.dataset.subject + '/' + b.dataset.skill));
  }).catch(() => {});

  // Monthly growth recap — the longer arc that shows the program is paying off over time.
  const SUBJ_EMOJI = { math: '🔢', english: '📚', science: '🔬', spanish: '🌎' };
  api('/family/monthly').then(({ kids }) => {
    const box = $('#monthly-recap');
    if (!box || !kids || !kids.length) return;
    box.innerHTML = `<div class="card">
      <h3>📅 The Last 30 Days</h3>
      <p class="muted" style="margin:4px 0 12px">The bigger picture — how far ${kids.length === 1 ? esc(kids[0].name.split(' ')[0]) + ' has' : 'everyone has'} come this month.</p>
      <div class="recap-grid">
        ${kids.map(k => {
          const tiles = [
            k.gallop != null ? { n: k.gallop, cap: 'Gallop Score', up: k.gallopDelta > 0 ? `${k.sinceStart ? '' : '▲ '}+${k.gallopDelta}` : null } : null,
            { n: k.monthAnswers, cap: 'questions' },
            { n: k.activeDays, cap: 'days practiced' },
            { n: k.skillsMastered, cap: 'skills mastered' }
          ].filter(Boolean);
          return `<div class="recap-card">
            <div class="recap-head"><span class="avatar-sm" style="font-size:1.35rem">${avatarHTML(k)}</span><b>${esc(k.name)}</b>${k.monthAccuracy != null ? `<span class="muted" style="font-size:.82rem;margin-left:auto">${k.monthAccuracy}% correct</span>` : ''}</div>
            <div class="recap-tiles">
              ${tiles.map(t => `<div class="recap-tile"><div class="rt-n">${t.n}${t.up ? `<span class="rt-up">${t.up}</span>` : ''}</div><div class="rt-cap">${t.cap}</div></div>`).join('')}
            </div>
            ${k.certs && k.certs.length ? `<div class="recap-win">🎓 Completed this month: ${k.certs.map(c => `<b>${esc(c.title.replace(/ Complete!?$/, ''))}</b>`).join(' · ')}</div>` : ''}
            ${k.badges > 0 ? `<div class="recap-badges">🏅 ${k.badges} new badge${k.badges === 1 ? '' : 's'} earned</div>` : ''}
          </div>`;
        }).join('')}
      </div>
    </div>`;
  }).catch(() => {});
});

// ======================= standards alignment (for educators & administrators) =======================
route('standards', async () => {
  let data;
  try { data = await api('/standards/overview'); }
  catch (e) { app().innerHTML = topbar('<div class="container"><div class="card center"><p class="muted">Couldn\'t load the standards map — please refresh.</p></div></div>'); wireChrome(); return; }
  const fw = data.frameworks || {};
  const fc = data.frameworkCounts || {};
  const badge = (label, n, color) => `<div style="background:${color}12;border:1px solid ${color}44;border-radius:12px;padding:12px 16px;min-width:150px">
      <div style="font-size:1.5rem;font-weight:800;color:${color}">${n}</div><div class="muted" style="font-size:.82rem">${label}</div></div>`;
  const ccMath = fc['CCSS-M'] || 0, ccEla = fc['CCSS-ELA'] || 0, ngss = fc['NGSS'] || 0, actfl = fc['ACTFL World-Readiness'] || 0, adv = fc['AP/Advanced (beyond CCSS)'] || 0;

  const subjSections = data.subjects.map(s => {
    const grades = s.grades.map(g => `
      <details class="std-grade" style="border:1px solid #eee5d8;border-radius:10px;margin:8px 0;overflow:hidden">
        <summary style="cursor:pointer;padding:11px 14px;background:#faf8f3;font-weight:700;list-style:none">${esc(g.label)} <span class="muted" style="font-weight:400">· ${g.skills.length} skill${g.skills.length === 1 ? '' : 's'}</span></summary>
        <div style="padding:6px 14px 12px">
          <table style="width:100%;border-collapse:collapse;font-size:.9rem">
            <thead><tr style="text-align:left;color:#7f8c9b;font-size:.78rem"><th style="padding:6px 8px 6px 0">Skill</th><th style="padding:6px 8px">Standard</th><th style="padding:6px 0" class="std-desc-h">What it requires</th></tr></thead>
            <tbody>
              ${g.skills.map(k => `<tr style="border-top:1px solid #f2ede2">
                <td style="padding:8px 8px 8px 0">${esc(k.name)}</td>
                <td style="padding:8px 8px"><span style="display:inline-block;background:${s.color}14;color:${s.color};border:1px solid ${s.color}33;border-radius:6px;padding:2px 8px;font-family:ui-monospace,monospace;font-size:.82rem;font-weight:700">${esc(k.code || '—')}</span>${k.proficiency ? `<br><span class="muted" style="font-size:.75rem">${esc(k.proficiency)}</span>` : ''}</td>
                <td style="padding:8px 0;color:#5f6b7d" class="std-desc">${esc(k.description || '')}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </details>`).join('');
    return `<div class="card" style="margin-top:16px">
      <h2 style="margin:0 0 2px;color:${s.color}">${s.emoji} ${esc(s.label)}</h2>
      <p class="muted" style="margin:0 0 8px">Aligned to <b>${esc(s.primaryFramework)}</b> · ${s.grades.reduce((n, g) => n + g.skills.length, 0)} skills, Kindergarten–Grade 12</p>
      ${grades}
    </div>`;
  }).join('');

  app().innerHTML = topbar(`<div class="container" style="max-width:880px">
    <div class="card" style="text-align:center;background:linear-gradient(180deg,#f6f9f6,#fff)">
      <div style="font-size:2rem">🎓</div>
      <h1 style="margin:6px 0 4px">Standards-Aligned Curriculum</h1>
      <p class="muted" style="max-width:620px;margin:0 auto 6px">Every one of Gallop's ${data.totals.skills} skills, Kindergarten through Grade 12, is mapped to a recognized academic standard — so schools, principals, and districts can verify exactly what we teach and where it fits their requirements.</p>
      <p style="max-width:620px;margin:10px auto 4px;font-weight:600;color:var(--brand)">Gallop is designed to supplement and reinforce classroom teaching — extra practice, review, and targeted support that works alongside a teacher's direct instruction, never a replacement for it.</p>
      <div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-top:16px">
        ${badge('Common Core · Math', ccMath, '#6C5CE7')}
        ${badge('Common Core · ELA', ccEla, '#00B894')}
        ${badge('NGSS · Science', ngss, '#0984E3')}
        ${badge('ACTFL · Spanish', actfl, '#E17055')}
        ${adv ? badge('AP / Advanced', adv, '#b8860b') : ''}
      </div>
      <p style="max-width:660px;margin:14px auto 2px;font-weight:600">Coverage spans <b>every Common Core math and ELA domain</b>, <b>all four NGSS science disciplines</b> — including Engineering Design — and <b>all five ACTFL goal areas</b> (the "5 C's"), Kindergarten through Grade 12.</p>
      <p class="muted" style="max-width:660px;margin:8px auto 2px">Every skill includes a short <b>guided lesson that teaches the concept before any practice</b>, and the full curriculum is searchable — so a student or teacher can look up exactly what the class is working on and get step-by-step supplemental support in seconds.</p>
      <p class="muted" style="font-size:.8rem;margin-top:12px">Frameworks: ${Object.values(fw).map(f => esc(f.short)).join(' · ')}. Common Core — or state standards built on it, as in New York and Nevada — is used across most of the country; NGSS is the most widely adopted next-generation science standard, and ACTFL sets the national standard for world-language learning. Standard codes are shown here for educators — students simply see the lesson and practice.</p>
      <div style="margin-top:12px"><button class="btn ghost small" style="color:var(--brand);border-color:var(--brand)" onclick="window.print()">🖨️ Print / save this map</button></div>
    </div>
    ${subjSections}
    <div class="card" style="margin-top:16px;text-align:center">
      <p class="muted" style="margin:0 0 12px">Questions about alignment to your state's standards? Email <a href="mailto:support@learnwithgallop.com" style="color:var(--brand)">support@learnwithgallop.com</a> — most state standards (including Louisiana and Nevada) are built on these same frameworks.</p>
      <p class="muted" style="margin:0;font-size:.72rem;line-height:1.5;color:#8a8fa0">
        © Copyright 2010. National Governors Association Center for Best Practices and Council of Chief State School Officers. All rights reserved. "Common Core State Standards" is a trademark of these organizations. Gallop Learning Academy is not affiliated with, sponsored by, or endorsed by these organizations. NGSS is a registered trademark of Achieve; the ACTFL World-Readiness Standards are © ACTFL. Standard codes are referenced here for educators to verify curriculum alignment.
      </p>
    </div>
  </div>`);
  wireChrome();
});

// ======================= Career Explorer =======================
// A browsable window onto real careers — what they entail, the range of jobs, and real,
// accomplished people in each field — personalized to a child's strengths but fully explorable.
route('careers', async (kidId) => {
  const FIELDS = window.GALLOP_CAREERS || [];
  let career = null;
  if (kidId) { try { const r = await api('/learn/' + kidId + '/careers'); career = r.career; } catch (e) {} }
  const name = (State.me && State.me.kid && State.me.kid.name) || (career && career.name) || 'your learner';
  const backHash = State.me.role === 'parent' ? (kidId ? '#report/' + kidId : '#parent') : '#home';
  // Match each field to the child's per-subject strengths (0..1). Null strengths → 0.
  const strength = {};
  if (career && career.ranked) career.ranked.forEach(s => { if (s.score != null) strength[s.subject] = s.score; });
  const haveStrength = Object.keys(strength).length > 0;
  const scored = FIELDS.map(f => {
    let num = 0, den = 0;
    for (const [sub, w] of Object.entries(f.sig || {})) { num += (strength[sub] || 0) * w; den += w; }
    return { f, match: den ? num / den : 0 };
  });
  const top = haveStrength ? scored.slice().sort((a, b) => b.match - a.match).filter(x => x.match >= 0.4).slice(0, 4) : [];
  const topIds = new Set(top.map(x => x.f.id));

  function fieldCard(f, matched) {
    return `<div class="cx-card${matched ? ' cx-matched' : ''}" data-field="${f.id}" style="--cx:${f.color}">
      <div class="cx-emoji">${f.emoji}</div>
      <div class="cx-title">${esc(f.title)}</div>
      <div class="cx-tag">${esc(f.tagline)}</div>
      ${matched ? '<span class="cx-fit">✨ Fits their strengths</span>' : ''}
    </div>`;
  }
  function renderGrid() {
  app().innerHTML = topbar(`<div class="container" style="max-width:900px">
    <div class="lesson-top"><b>🔭 Career Explorer</b><button class="btn ghost small" onclick="location.hash='${backHash}'">← Back</button></div>
    <div class="card">
      <h2 style="margin:0 0 4px">Explore what you could become</h2>
      <p class="muted" style="margin:0">Every field below is a real path — with the jobs inside it, what they actually involve, and real people doing the work. Not sure what an "architect" or an "engineer" even does all day? That's exactly what this is for. Browse freely and see where it leads. 🌟</p>
    </div>
    ${top.length ? `<div class="card">
      <h3 style="margin:0 0 4px">✨ Great fits for ${esc(name.split(' ')[0])}</h3>
      <p class="muted" style="margin:0 0 12px;font-size:.9rem">Based on the strengths ${esc(name.split(' ')[0])} is showing on Gallop — a starting point to explore together, never a limit.</p>
      <div class="cx-grid">${top.map(x => fieldCard(x.f, true)).join('')}</div>
    </div>` : (kidId && !haveStrength ? `<div class="card"><p class="muted" style="margin:0">As ${esc(name.split(' ')[0])} answers more questions, we'll highlight the fields that fit their strengths right here. For now, explore anything that looks interesting!</p></div>` : '')}
    <div class="card">
      <h3 style="margin:0 0 12px">${top.length ? 'Explore every field' : 'Explore the fields'}</h3>
      <div class="cx-grid">${FIELDS.filter(f => !topIds.has(f.id)).map(f => fieldCard(f, false)).join('')}</div>
    </div>
  </div>`);
  wireChrome();
  document.querySelectorAll('.cx-card').forEach(el => el.onclick = () => showField(el.dataset.field));
  }
  renderGrid();

  function showField(id) {
    const f = FIELDS.find(x => x.id === id); if (!f) return;
    Sound.click();
    app().innerHTML = topbar(`<div class="container" style="max-width:760px">
      <div class="lesson-top"><b>${f.emoji} ${esc(f.title)}</b><button class="btn ghost small" id="cx-back">← All fields</button></div>
      <div class="card cx-detail" style="--cx:${f.color}">
        <div class="cx-hero"><span class="cx-hero-emoji">${f.emoji}</span><div><h2 style="margin:0">${esc(f.title)}</h2><p class="cx-hero-tag">${esc(f.tagline)}</p></div></div>
        <p class="cx-what">${esc(f.whatItIs)}</p>
        <div class="cx-block"><h4>👀 What you'd actually do</h4><p>${esc(f.dayToDay)}</p></div>
        <div class="cx-block"><h4>💼 Jobs in this field</h4><div class="cx-jobs">${f.jobs.map(j => `<span class="cx-job">${esc(j)}</span>`).join('')}</div></div>
        <div class="cx-block cx-hs"><h4>🎓 Getting there</h4><p>${esc(f.hs)}</p></div>
        <div class="cx-block"><h4>🌟 Real people doing this</h4>
          <div class="cx-people">${f.people.map(p => `
            <div class="cx-person">
              <div class="cx-person-name">${esc(p.name)}</div>
              <div class="cx-person-who">${esc(p.who)}</div>
            </div>`).join('')}</div>
        </div>
        ${(() => {
          // Career PATHWAY: turn "here's a cool job" into "here's how you build toward it."
          // Rank the subjects that matter most for this field and let the kid jump straight
          // into practicing one. No competitor connects a school subject to a real future.
          const sig = f.sig || {};
          const subs = Object.keys(sig).filter(x => SUBJECT_STYLE[x] && sig[x] >= 0.3).sort((a, b) => sig[b] - sig[a]).slice(0, 2);
          const isKid = !!(State.me && State.me.kid);
          if (!isKid || !subs.length) return '';
          return `<div class="cx-block cx-path"><h4>🚀 Start building toward this</h4>
            <p class="muted" style="margin:0 0 10px;font-size:.9rem">The subjects that matter most for ${esc(f.title)} — get some practice in right now:</p>
            <div class="cx-path-btns">${subs.map(sub => `<button class="btn cx-path-btn" style="background:${SUBJECT_STYLE[sub].color};color:#fff;border:none" onclick="location.hash='#lesson/${sub}'">${SUBJECT_STYLE[sub].emoji} Practice ${sub.charAt(0).toUpperCase() + sub.slice(1)} →</button>`).join('')}</div>
          </div>`;
        })()}
        <p class="muted" style="font-size:.78rem;margin-top:6px">Gallop is here to open doors and spark ideas — every path is worth exploring, and where you focus is always up to you.</p>
      </div>
    </div>`);
    wireChrome();
    $('#cx-back').onclick = () => { renderGrid(); };
  }
});

// ======================= help & support (AI assistant) =======================
route('help', async () => {
  const me = State.me || {};
  const prefillName = me.role === 'parent' ? (me.parent && me.parent.name || '') : '';
  const prefillEmail = me.role === 'parent' ? (me.parent && me.parent.email || '') : '';
  const suggestions = ['How much does it cost?', 'How does my child log in?', 'What grades and subjects are covered?', 'How do I cancel?'];
  app().innerHTML = topbar(`<div class="container" style="max-width:680px">
    <div class="dash-welcome" style="margin-bottom:14px"><h1>💬 Help &amp; Support</h1><p>Ask anything about Gallop — you'll get an instant answer. Anything that needs a person, we'll email you back.</p></div>
    <div class="card">
      <div id="help-thread" style="display:flex;flex-direction:column;gap:12px;min-height:60px">
        <div class="help-msg bot" style="background:#f2f7f4;border-radius:12px;padding:12px 14px;align-self:flex-start;max-width:90%">
          Hi${prefillName ? ' ' + esc(prefillName.split(' ')[0]) : ''}! I'm the Gallop assistant. What can I help you with?
        </div>
      </div>
      <div id="help-suggest" style="display:flex;flex-wrap:wrap;gap:8px;margin:14px 0 4px">
        ${suggestions.map(s => `<button class="btn ghost small help-chip" style="color:var(--brand);border-color:var(--brand)">${esc(s)}</button>`).join('')}
      </div>
      <div style="margin-top:12px">
        <input id="help-email" type="email" placeholder="Your email (so we can reply if needed)" value="${esc(prefillEmail)}" style="width:100%;padding:11px 13px;border:1px solid #dfe6e9;border-radius:10px;margin-bottom:8px;font-size:1rem" aria-label="Your email">
        <div style="display:flex;gap:8px">
          <input id="help-input" type="text" placeholder="Type your question…" style="flex:1;padding:11px 13px;border:1px solid #dfe6e9;border-radius:10px;font-size:1rem" aria-label="Your question">
          <button class="btn green" id="help-send">Send</button>
        </div>
      </div>
      <p class="muted" style="font-size:.8rem;margin-top:12px">You can also email <a href="mailto:support@learnwithgallop.com" style="color:var(--brand)">support@learnwithgallop.com</a> directly.</p>
    </div>
  </div>`);
  wireChrome();
  const thread = $('#help-thread'), input = $('#help-input'), emailEl = $('#help-email');
  const add = (who, text) => {
    const el = document.createElement('div');
    el.className = 'help-msg ' + who;
    el.style.cssText = who === 'you'
      ? 'background:var(--brand);color:#fff;border-radius:12px;padding:12px 14px;align-self:flex-end;max-width:90%;white-space:pre-wrap'
      : 'background:#f2f7f4;border-radius:12px;padding:12px 14px;align-self:flex-start;max-width:90%;white-space:pre-wrap';
    el.textContent = text;
    thread.appendChild(el);
    el.scrollIntoView({ behavior: 'smooth', block: 'end' });
    return el;
  };
  let busy = false;
  async function ask(q) {
    if (busy || !q.trim()) return;
    busy = true;
    const sg = $('#help-suggest'); if (sg) sg.style.display = 'none';
    add('you', q);
    input.value = '';
    const thinking = add('bot', '…');
    try {
      const r = await api('/support/ask', { method: 'POST', body: { question: q, name: prefillName, email: (emailEl.value || '').trim() } });
      thinking.textContent = r.answer || 'Thanks — a team member will follow up by email.';
      if (r.escalated && r.needEmail) {
        add('bot', 'What email should we reply to? Pop it in the box above and send your question again, or write to support@learnwithgallop.com.');
        emailEl.focus();
      }
    } catch (e) {
      thinking.textContent = "I hit a snag — please email support@learnwithgallop.com and we'll help right away.";
    }
    busy = false;
    input.focus();
  }
  $('#help-send').onclick = () => ask(input.value);
  input.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); ask(input.value); } };
  document.querySelectorAll('.help-chip').forEach(c => c.onclick = () => ask(c.textContent));
});

// ======================= admin (owner) =======================
route('admin', async () => {
  await refreshMe();
  if (State.me.role === 'kid') { location.hash = '#home'; return; }
  if (State.me.role !== 'parent' || !State.me.parent.is_admin) { location.hash = '#parent'; return; }
  const d = await api('/admin/overview');
  let sq = { open: [], recent: [] };
  try { sq = await api('/support/queue'); } catch (e) {}
  let nl = { drafts: [], history: [], recipientCount: 0, approvalRemaining: 0 };
  try { nl = await api('/admin/newsletters'); } catch (e) {}
  const t = d.totals;
  const fmtDate = s => s ? s.slice(0, 10) : '—';
  const statusPill = st => st === 'active' ? '<span class="pill strength">active</span>' : st === 'trial' ? '<span class="pill" style="background:#fdf3d7;color:#7a5b00">trial</span>' : `<span class="pill focus">${esc(st)}</span>`;
  const maxSign = Math.max(1, ...d.signups.map(x => x.n));
  app().innerHTML = topbar(`<div class="container">
    <div class="dash-welcome" style="margin-bottom:14px"><h1>🛡️ Gallop Command Center</h1><p>Owner dashboard, live business & learning metrics${t.testAccounts ? ` · <i>${t.testAccounts} dev/test account${t.testAccounts === 1 ? '' : 's'} hidden from all numbers</i>` : ''}</p></div>
    <div class="statband" style="margin-bottom:18px">
      <div><b>${t.parents}</b><span>Families</span></div>
      <div><b>${t.kids}</b><span>Learners</span></div>
      <div><b>$${d.mrr}</b><span>MRR (active subs)</span></div>
      <div><b>${d.byStatus.active || 0}</b><span>Paying</span></div>
      <div><b>${d.byStatus.trial || 0}</b><span>On trial</span></div>
    </div>
    <div class="dash-grid">
      <div>
        <div class="card">
          <h3>📚 Learning activity</h3>
          <div class="summary-stats" style="margin-top:10px">
            <div class="sstat"><div class="n">${t.answersToday}</div>today</div>
            <div class="sstat"><div class="n">${t.answersWeek}</div>this week</div>
            <div class="sstat"><div class="n">${t.answersAllTime}</div>all-time</div>
            <div class="sstat"><div class="n">${t.activeKidsWeek}</div>active kids/wk</div>
          </div>
          <p class="muted" style="margin-top:10px">🎓 ${t.certificates} certificate${t.certificates === 1 ? '' : 's'} earned platform-wide</p>
        </div>
        <div class="card">
          <h3>👧 Learners by grade band</h3>
          ${d.gradeBands.length ? d.gradeBands.map(b => `<div class="kid-row"><b style="min-width:50px">${b.band}</b><span class="sk-bar" style="flex:1"><span class="sk-fill hi" style="width:${Math.round(b.n / t.kids * 100)}%"></span></span><span class="muted">${b.n}</span></div>`).join('') : '<p class="muted">No learners yet.</p>'}
        </div>
        <div class="card">
          <h3>📈 Signups, last 14 days</h3>
          ${d.signups.length ? `<svg viewBox="0 0 480 80" style="width:100%;height:auto" role="img" aria-label="Signups per day over the last 14 days: ${d.signups.map(x => x.d.slice(5) + ' ' + x.n).join(', ')}.">${d.signups.map((x, i) => `<g><rect x="${i * 34 + 4}" y="${62 - Math.round(x.n / maxSign * 55)}" width="26" height="${Math.max(3, Math.round(x.n / maxSign * 55))}" rx="4" fill="#1f8a5f"/><text x="${i * 34 + 17}" y="76" font-size="8" text-anchor="middle" fill="#98a0af">${x.d.slice(5)}</text></g>`).join('')}</svg>` : '<p class="muted">No signups in the last 14 days.</p>'}
        </div>
      </div>
      <div>
        <div class="card">
          <h3>📨 Support inbox ${sq.open.length ? `<span class="pill focus">${sq.open.length} need${sq.open.length === 1 ? 's' : ''} you</span>` : '<span class="pill strength">all clear</span>'}</h3>
          <p class="muted" style="margin:4px 0 8px;font-size:.85rem">Common questions are answered automatically. These need a person — the AI drafted a reply you can send, edit, or dismiss.</p>
          <p class="muted" style="margin:0 0 10px;font-size:.78rem">
            AI assistant: ${sq.aiConnected ? '<b style="color:#1f8a5f">on</b>' : '<span style="color:#b8860b">fallback (add AI key)</span>'} ·
            Inbox auto-reply: ${sq.inboundConnected ? '<b style="color:#1f8a5f">connected</b>' : '<span style="color:#b8860b">not connected</span>'}${sq.autoSentCount ? ` · <b>${sq.autoSentCount}</b> auto-answered by email` : ''}
          </p>
          <div id="sq-list">
            ${sq.open.length ? sq.open.map(tk => `
              <div class="card" data-tid="${tk.id}" style="background:#fbfaf6;margin:10px 0;padding:14px">
                <div style="font-size:.82rem;color:#7f8c9b;margin-bottom:6px">${esc(tk.from_name || 'A parent')}${tk.from_email ? ` · ${esc(tk.from_email)}` : ' · <i>no email given</i>'} · ${esc(tk.category || 'review')}</div>
                <div style="background:#fff;border:1px solid #eee5d8;border-radius:8px;padding:9px 11px;margin-bottom:8px"><b>Q:</b> ${esc(tk.question)}</div>
                <textarea class="sq-reply" rows="4" style="width:100%;padding:9px 11px;border:1px solid #dfe6e9;border-radius:8px;font-size:.92rem;font-family:inherit">${esc(tk.ai_reply || '')}</textarea>
                <div style="display:flex;gap:8px;margin-top:8px">
                  <button class="btn green small sq-send" ${tk.from_email ? '' : 'disabled title="No email to reply to"'}>Send reply</button>
                  <button class="btn ghost small sq-dismiss" style="color:#7f8c9b;border-color:#dfe6e9">Dismiss</button>
                </div>
              </div>`).join('') : '<p class="muted">Nothing waiting — the assistant is handling questions on its own. 🎉</p>'}
          </div>
          ${sq.recent.length ? `<details style="margin-top:8px"><summary class="muted" style="cursor:pointer">Recently handled (${sq.recent.length})</summary>
            <div style="margin-top:8px">${sq.recent.map(tk => `<div class="kid-row" style="font-size:.83rem"><span style="flex:1">${esc((tk.question || '').slice(0, 60))}</span><span class="pill ${tk.status === 'sent' ? 'strength' : ''}" style="${tk.status === 'auto_answered' ? 'background:#eef6f1;color:#1f8a5f' : ''}">${tk.status.replace('_', ' ')}</span></div>`).join('')}</div></details>` : ''}
        </div>
        <div class="card">
          <h3>📰 Monthly newsletter</h3>
          <p class="muted" style="margin:4px 0 10px;font-size:.85rem">Auto-drafted each month on the school-year calendar. ${nl.approvalRemaining > 0 ? `The next <b>${nl.approvalRemaining}</b> need your approval before sending; after that it sends on its own.` : 'Now sending autonomously each month.'} Reaches <b>${nl.recipientCount}</b> subscriber${nl.recipientCount === 1 ? '' : 's'}.</p>
          <div id="nl-drafts">
            ${nl.drafts.length ? nl.drafts.map(dr => `
              <div class="card" data-nlid="${dr.id}" style="background:#fbfaf6;margin:10px 0;padding:14px">
                <label style="font-size:.78rem;color:#7f8c9b">Subject</label>
                <input class="nl-subj" value="${esc(dr.subject)}" style="width:100%;padding:8px 10px;border:1px solid #dfe6e9;border-radius:8px;margin:2px 0 8px;font-size:.92rem">
                <label style="font-size:.78rem;color:#7f8c9b">Body (HTML — edit freely)</label>
                <textarea class="nl-body" rows="8" style="width:100%;padding:9px 11px;border:1px solid #dfe6e9;border-radius:8px;font-size:.82rem;font-family:ui-monospace,monospace">${esc(dr.body_html)}</textarea>
                <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
                  <button class="btn green small nl-send">Send to ${nl.recipientCount} subscriber${nl.recipientCount === 1 ? '' : 's'}</button>
                  <button class="btn ghost small nl-discard" style="color:#7f8c9b;border-color:#dfe6e9">Discard</button>
                </div>
              </div>`).join('') : '<p class="muted">No draft waiting. Generate this month\'s below.</p>'}
          </div>
          <button class="btn ghost small" id="nl-gen" style="margin-top:6px;color:var(--brand);border-color:var(--brand)">✨ Generate this month's draft</button>
          ${nl.history.length ? `<details style="margin-top:10px"><summary class="muted" style="cursor:pointer">Sent history (${nl.history.length})</summary>
            <div style="margin-top:8px">${nl.history.map(h => `<div class="kid-row" style="font-size:.83rem"><span style="flex:1">${esc(h.month_key)} · ${esc((h.subject || '').slice(0, 40))}</span><span class="pill ${h.status === 'sent' ? 'strength' : ''}">${h.status}${h.status === 'sent' ? ' · ' + h.recipients : ''}</span></div>`).join('')}</div></details>` : ''}
        </div>
        <div class="card">
          <h3>🧾 Recent families <a class="btn ghost small" style="float:right;color:var(--brand);border-color:var(--brand)" href="/api/admin/export.csv" download>⬇️ CSV</a></h3>
          <div style="margin-top:10px;overflow-x:auto">
            ${d.recent.map(p => `
              <div class="kid-row" style="flex-wrap:wrap">
                <div style="flex:1;min-width:180px"><b>${esc(p.name)}</b> ${statusPill(p.sub_status)}${p.sub_status === 'active' ? ` <span class="muted">$${p.sub_plan === 'solo' ? 34 : 54}/mo</span>` : ''} ${p.kids === 0 ? '<span class="pill focus">needs setup</span>' : p.weekAnswers === 0 ? '<span class="pill" style="background:#fdf3d7;color:#7a5b00">quiet this week</span>' : '<span class="pill strength">learning ✓</span>'}<br>
                  <span class="muted" style="font-size:.82rem">${esc(p.email)} · joined ${fmtDate(p.created_at)}${p.sub_status === 'trial' ? ` · trial ends ${fmtDate(p.trial_ends)}` : ''}</span></div>
                <div class="muted" style="font-size:.83rem;text-align:right">${p.kids} kid${p.kids === 1 ? '' : 's'}<br>${p.weekAnswers} ans/wk</div>
              </div>`).join('')}
          </div>
        </div>
      </div>
    </div>
  </div>`);
  wireChrome();
  // Wire the support inbox actions
  document.querySelectorAll('#sq-list [data-tid]').forEach(card => {
    const tid = card.getAttribute('data-tid');
    const sendBtn = card.querySelector('.sq-send');
    const dismissBtn = card.querySelector('.sq-dismiss');
    if (sendBtn) sendBtn.onclick = async () => {
      const reply = card.querySelector('.sq-reply').value.trim();
      if (!reply) { toast('Reply is empty.'); return; }
      sendBtn.disabled = true; sendBtn.textContent = 'Sending…';
      try {
        await api('/support/queue/' + tid + '/reply', { method: 'POST', body: { reply } });
        card.style.opacity = '.5'; card.querySelector('div').textContent = '✓ Sent — a reply is on its way.';
        card.querySelectorAll('textarea,button,div:not(:first-child)').forEach(el => el.remove());
      } catch (e) { toast(e.message || 'Could not send.'); sendBtn.disabled = false; sendBtn.textContent = 'Send reply'; }
    };
    if (dismissBtn) dismissBtn.onclick = async () => {
      dismissBtn.disabled = true;
      try { await api('/support/queue/' + tid + '/dismiss', { method: 'POST' }); card.style.display = 'none'; }
      catch (e) { toast('Could not dismiss.'); dismissBtn.disabled = false; }
    };
  });
  // Wire the newsletter draft actions
  const nlGen = $('#nl-gen');
  if (nlGen) nlGen.onclick = async () => {
    nlGen.disabled = true; nlGen.textContent = 'Writing…';
    try { await api('/admin/newsletters/generate', { method: 'POST', body: { force: true } }); navigate(); }
    catch (e) { toast('Could not generate a draft.'); nlGen.disabled = false; nlGen.textContent = "✨ Generate this month's draft"; }
  };
  document.querySelectorAll('#nl-drafts [data-nlid]').forEach(card => {
    const nid = card.getAttribute('data-nlid');
    const sendBtn = card.querySelector('.nl-send');
    const discBtn = card.querySelector('.nl-discard');
    if (sendBtn) sendBtn.onclick = async () => {
      if (!confirm('Send this newsletter to all subscribers now?')) return;
      sendBtn.disabled = true; sendBtn.textContent = 'Sending…';
      try {
        const r = await api('/admin/newsletters/' + nid + '/send', { method: 'POST', body: { subject: card.querySelector('.nl-subj').value, body_html: card.querySelector('.nl-body').value } });
        card.innerHTML = '<b style="color:var(--brand)">✓ Sent to ' + (r.sent || 0) + ' subscribers.</b>';
      } catch (e) { toast(e.message || 'Could not send.'); sendBtn.disabled = false; sendBtn.textContent = 'Send'; }
    };
    if (discBtn) discBtn.onclick = async () => {
      discBtn.disabled = true;
      try { await api('/admin/newsletters/' + nid + '/discard', { method: 'POST' }); card.style.display = 'none'; }
      catch (e) { toast('Could not discard.'); discBtn.disabled = false; }
    };
  });
});

// ======================= shared API for games.js =======================
window.BP = { $, app, esc, api, route, routes, navigate, topbar, wireChrome, showError, State, Sound, Voice, Music, Confetti, AVATARS, ITEM_EMOJI, avatarHTML, refreshMe };

// ======================= boot =======================
(async function boot() {
  try { await refreshMe(); } catch (e) { /* offline-ish */ }
  // preload speech voices (some browsers lazy-load)
  if ('speechSynthesis' in window) speechSynthesis.getVoices();
  // installable app (iPad home screen, Chromebook, etc.) + nudge to refresh when a new
  // version is deployed, so users (especially installed-PWA/phone) don't sit on stale code.
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing;
        if (!nw) return;
        nw.addEventListener('statechange', () => {
          if (nw.state === 'installed' && navigator.serviceWorker.controller) {
            const showToast = () => {
              const t = document.createElement('div');
              t.className = 'gallop-toast show';
              t.style.cursor = 'pointer';
              t.textContent = '✨ A new version is ready — tap to refresh';
              t.onclick = () => location.reload();
              document.querySelectorAll('.gallop-toast').forEach(x => x.remove());
              document.body.appendChild(t);
            };
            // Don't interrupt a child mid-lesson (tester finding #8). If they're inside a
            // lesson, teaching flow, placement, exam, or game, wait until they navigate out
            // before offering the refresh, so progress is never disrupted.
            const inActivity = () => /^#\/?(lesson|teach|placement|exam|play|game)/.test(location.hash || '');
            if (inActivity()) {
              const onLeave = () => { if (!inActivity()) { window.removeEventListener('hashchange', onLeave); showToast(); } };
              window.addEventListener('hashchange', onLeave);
            } else {
              showToast();
            }
          }
        });
      });
    }).catch(() => {});
  }
  // Handle the return from Stripe checkout so paying never dumps you on the homepage.
  const billing = new URLSearchParams(location.search).get('billing');
  if (billing) history.replaceState(null, '', location.pathname); // strip ?billing=… from the URL
  if (billing === 'success') {
    // Fire the purchase conversion using the plan/value stashed before the Stripe redirect.
    try {
      const pd = JSON.parse(sessionStorage.getItem('gallop_purchase') || 'null');
      gtmPush({ event: 'purchase', currency: 'USD', value: (pd && pd.value) || 0, plan: (pd && pd.plan) || undefined });
      sessionStorage.removeItem('gallop_purchase');
    } catch (e) { gtmPush({ event: 'purchase', currency: 'USD' }); }
    // The webhook that marks the account active can lag the redirect by a moment; re-check once.
    try {
      const notYet = () => State.me && State.me.role === 'parent' && State.me.parent && State.me.parent.sub_status !== 'active';
      if (notYet()) { await new Promise(r => setTimeout(r, 1600)); await refreshMe(); }
    } catch (e) {}
    location.hash = '#parent';
    setTimeout(() => { try { Confetti.burst(160); Sound.levelup(); } catch (e) {} }, 350);
  }
  // let games.js register its routes before first render
  setTimeout(navigate, 0);
})();

/* ---- keyboard accessibility: make clickable cards focusable & Enter/Space-activatable ---- */
/* The primary nav (subject/zone/game cards, level tiles, banners) is built as <div onclick>.
   This centrally gives them tabindex+role and key handling so the focus rings actually fire
   and the app is fully keyboard-navigable — no per-render markup changes needed. */
(function () {
  const SEL = '.subject-card,.zone-card,.game-card,.mm-level-card,.up-next,.ach-banner,.cert-mini,.learn-card,.snap-report';
  function tag(root) {
    if (!root || !root.querySelectorAll) return;
    root.querySelectorAll(SEL).forEach(el => {
      if (!el.hasAttribute('tabindex')) { el.setAttribute('tabindex', '0'); el.setAttribute('role', 'button'); }
    });
  }
  try {
    const root = document.getElementById('app') || document.body;
    new MutationObserver(muts => { for (const m of muts) for (const n of m.addedNodes) if (n.nodeType === 1) tag(n); })
      .observe(root, { childList: true, subtree: true });
    document.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target && e.target.matches && e.target.matches(SEL)) {
        e.preventDefault(); e.target.click();
      }
    });
    tag(document);
  } catch (e) {}
})();

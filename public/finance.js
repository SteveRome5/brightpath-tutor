/* Gallop Money Skills — an OPTIONAL, grade-banded financial-literacy course.
   Self-contained: it does NOT touch the four core subjects, placement, or the Gallop Score.
   A child clicks in from their home screen, learns a short lesson, then answers a few checks.
   Progress (which units are done) is saved server-side via the generic game-state store ('finance').
   Content is aligned in spirit to the CEE/Jump$tart national personal-finance standards and
   grows with the child: money basics (K-2) → budgeting & banking (3-5) → interest, credit & taxes
   (6-8) → investing, credit scores & financial independence (9-12). Where a topic has a matching
   Lab game (lemonade, bakery, Stable Street), the unit links straight to it: learn it, then live it. */
(function () {
  if (!window.BP) return;
  const { app, esc, api, route, State, Sound, Confetti, topbar, wireChrome, navigate } = window.BP;
  const kid = () => (State.me && State.me.kid) || {};
  const kidId = () => kid().id;

  // ---- Bands (grade ranges are inclusive; K = 0) ----
  const BANDS = [
    { id: 'sprouts', label: 'Money Sprouts', grades: 'K–2', lo: 0, hi: 2, color: '#37a05f', emoji: '🌱' },
    { id: 'growers', label: 'Money Growers', grades: '3–5', lo: 3, hi: 5, color: '#2f8fd6', emoji: '🌿' },
    { id: 'builders', label: 'Money Builders', grades: '6–8', lo: 6, hi: 8, color: '#8a5cd6', emoji: '🏗️' },
    { id: 'trailblazers', label: 'Money Trailblazers', grades: '9–12', lo: 9, hi: 12, color: '#d68a2f', emoji: '🚀' }
  ];

  // ---- The course. Each unit teaches, then checks understanding. `apply` links to a Lab game. ----
  // step: { t:title, b:body, tip?:callout }   quiz: { q, choices:[...], a:answerIndex, why:explanation }
  const UNITS = [
    // ---------------- Money Sprouts (K–2) ----------------
    {
      id: 'what-is-money', band: 'sprouts', emoji: '🪙', title: 'What Is Money?',
      blurb: 'Why we use money instead of trading chickens.',
      steps: [
        { t: 'Long ago, people traded', b: 'Before money, people swapped things. You have eggs, I have apples — we trade. But what if I want your eggs and you don’t want my apples? Then we’re stuck. Trading only works when two people each want what the other has at the same time.' },
        { t: 'Money is a clever helper', b: 'Money fixes the stuck problem. Everyone agrees money is worth something, so you can trade your eggs for money, then use that money to buy anything — from anyone. Money is a tool that stands in for the value of your stuff and your work.', tip: 'Money isn’t valuable by itself. It’s valuable because everyone agrees to accept it.' },
        { t: 'Three jobs money does', b: 'Money lets you BUY things now, SAVE for later (an apple rots, a coin doesn’t), and MEASURE value so you can compare — a toy that costs $10 is worth twice a toy that costs $5.' }
      ],
      quiz: [
        { q: 'Why is trading without money tricky?', choices: ['Money is too heavy', 'Both people have to want what the other has, at the same time', 'Apples cost too much'], a: 1, why: 'Exactly — that “both want it at once” problem is what money solves.' },
        { q: 'What makes money worth something?', choices: ['It’s made of gold', 'Everyone agrees to accept it', 'It smells nice'], a: 1, why: 'Right — money works because we all agree it has value.' }
      ]
    },
    {
      id: 'coins-bills', band: 'sprouts', emoji: '💵', title: 'Coins & Bills',
      blurb: 'Penny, nickel, dime, quarter — and how they add up.',
      steps: [
        { t: 'Meet the coins', b: 'A penny is 1¢. A nickel is 5¢. A dime is 10¢ (small but mighty!). A quarter is 25¢. It takes 100 pennies to make one dollar ($1.00).' },
        { t: 'Coins add up', b: 'Money is just counting. Two quarters = 25 + 25 = 50¢. Add a dime = 60¢. Add a nickel = 65¢. The trick is to start with the biggest coins and count on from there.', tip: 'Count big to small: quarters, then dimes, then nickels, then pennies.' },
        { t: 'Making a dollar', b: 'Four quarters make a dollar. So do ten dimes, or twenty nickels, or one hundred pennies. Different coins, same value — $1.00.' }
      ],
      quiz: [
        { q: 'How many cents is a quarter?', choices: ['5¢', '10¢', '25¢'], a: 2, why: 'A quarter is 25¢ — four of them make a dollar.' },
        { q: 'You have 2 quarters and 1 dime. How much is that?', choices: ['35¢', '60¢', '75¢'], a: 1, why: '25 + 25 + 10 = 60¢. Count big coins first!' }
      ]
    },
    {
      id: 'needs-wants', band: 'sprouts', emoji: '🧦', title: 'Needs vs. Wants',
      blurb: 'The most important money habit, learned early.',
      steps: [
        { t: 'A need keeps you healthy and safe', b: 'Needs are things you truly must have: food, water, a place to live, clothes to stay warm, medicine when you’re sick. If you don’t have a need, something goes wrong.' },
        { t: 'A want is nice, but not necessary', b: 'Wants are things you’d LIKE: candy, a new toy, a video game, a fancy backpack when your old one works fine. Wants are fun — there’s nothing wrong with them — but you can live without them.', tip: 'Smart money habit: cover your needs first, then spend on wants.' },
        { t: 'It can be tricky', b: 'You need clothes (a need), but a $200 pair of sneakers is mostly a want — regular sneakers cover the need. Learning to tell the difference is a superpower grown-ups wish they’d learned sooner.' }
      ],
      quiz: [
        { q: 'Which one is a NEED?', choices: ['A new video game', 'Healthy food', 'A toy robot'], a: 1, why: 'Food is a need — your body must have it. The others are wants.' },
        { q: 'You already have a warm coat but want a trendy new one. The new coat is mostly a…', choices: ['Need', 'Want'], a: 1, why: 'Right — the need (staying warm) is already covered, so the new one is a want.' }
      ]
    },
    {
      id: 'saving-jar', band: 'sprouts', emoji: '🫙', title: 'Save, Spend, Give',
      blurb: 'Three jars, one great habit.',
      steps: [
        { t: 'Split your money into three jars', b: 'When you get money, split it into three jars: SPEND (for small treats now), SAVE (for a bigger goal later), and GIVE (to help others). Even a little in each builds a great habit.' },
        { t: 'Saving reaches big goals', b: 'Say you want a $20 toy but only get $5 a week. If you save $5 each week, after 4 weeks you have $20 — goal reached! Saving is just being patient and letting your money pile up.', tip: 'A goal + a plan = money that grows toward something you really want.' },
        { t: 'Giving feels good too', b: 'The give jar helps people or causes you care about. Lots of people find that giving a little makes the money feel even better to earn.' }
      ],
      quiz: [
        { q: 'You want a $20 toy and save $5 a week. How many weeks until you can buy it?', choices: ['2 weeks', '4 weeks', '10 weeks'], a: 1, why: '$5 × 4 = $20. Four weeks of patience gets you there!' },
        { q: 'What is the SAVE jar for?', choices: ['Small treats right now', 'A bigger goal later', 'Nothing'], a: 1, why: 'The save jar grows toward a bigger goal.' }
      ],
      apply: { label: 'Try running a lemonade stand →', hash: '#game/lemonade' }
    },

    // ---------------- Money Growers (3–5) ----------------
    {
      id: 'earning', band: 'growers', emoji: '💪', title: 'Where Money Comes From',
      blurb: 'Money is earned — usually by adding value.',
      steps: [
        { t: 'People earn money by working', b: 'Most money comes from a job: someone does work other people find useful, and gets paid for it. A baker makes bread, a nurse helps patients, a coder builds apps — each earns money by being useful to others.' },
        { t: 'Income is money coming in', b: 'The money you earn is called income. Kids can earn income too: chores, a lemonade stand, walking a neighbor’s dog, selling art. The idea is always the same — solve a problem or make something people value.', tip: 'The more useful (or rare) your skill, the more people will usually pay for it.' },
        { t: 'Work can grow', b: 'One lemonade stand earns a little. Two stands, or a better recipe, or a busier corner earns more. People raise their income by getting better at something or doing more of it.' }
      ],
      quiz: [
        { q: 'What is “income”?', choices: ['Money you spend', 'Money you earn / that comes in', 'Money in a bank vault'], a: 1, why: 'Income is money coming in — usually from work.' },
        { q: 'The best way to earn more is usually to…', choices: ['Wish harder', 'Become more useful or do more of what people value', 'Hide your money'], a: 1, why: 'People earn more by being more useful or rare.' }
      ]
    },
    {
      id: 'budget', band: 'growers', emoji: '📋', title: 'Making a Budget',
      blurb: 'A budget is a plan so your money lasts.',
      steps: [
        { t: 'A budget is a plan for money', b: 'A budget lists money coming IN (income) and money going OUT (spending). The goal is simple: don’t let “out” be bigger than “in.” If you earn $10 and spend $12, you’re short $2 — that’s the trouble a budget prevents.' },
        { t: 'Income minus expenses', b: 'Say you get $10 for the week. You plan: $4 snacks, $3 save, $1 give. That’s $8 out, so $2 is left over — a cushion. Planning BEFORE you spend keeps you in control.', tip: 'Pay your future self first: set aside savings BEFORE you spend on wants.' },
        { t: 'Adjusting the plan', b: 'If you want a $6 toy but only budgeted $4 for wants, you have choices: save two weeks, spend less on snacks, or earn a little more. A budget turns “I ran out of money” into “here’s my plan.”' }
      ],
      quiz: [
        { q: 'You earn $10 and your plan spends $8. How much is left over?', choices: ['$0', '$2', '$18'], a: 1, why: '$10 − $8 = $2 left. That leftover is your cushion.' },
        { q: 'What does “pay yourself first” mean?', choices: ['Buy yourself a treat first', 'Set aside savings before spending on wants', 'Never save'], a: 1, why: 'Set savings aside first, then spend what’s left on wants.' }
      ],
      apply: { label: 'Practice pricing in the Lemonade Stand →', hash: '#game/lemonade' }
    },
    {
      id: 'spend-smart', band: 'growers', emoji: '🛒', title: 'Spend Smart',
      blurb: 'Same thing, lower price — how to compare.',
      steps: [
        { t: 'Price isn’t the whole story', b: 'A bigger box often costs more but gives you MORE — so it can be cheaper per piece. To compare fairly, look at the price for the SAME amount. This is called the unit price.' },
        { t: 'Unit price = price ÷ amount', b: 'Box A: 10 granola bars for $5 → 50¢ each. Box B: 6 bars for $3.60 → 60¢ each. Box A is the better deal per bar, even though its sticker price is higher.', tip: 'Bigger sticker price can still be the better deal. Always check price per unit.' },
        { t: 'Sales tricks', b: '“Buy one get one” and “limited time!” are designed to make you spend. Ask: do I actually need this, and is it truly cheaper per unit? Smart shoppers slow down and compare.' }
      ],
      quiz: [
        { q: '10 bars for $5, or 5 bars for $3. Which is the better deal per bar?', choices: ['10 for $5 (50¢ each)', '5 for $3 (60¢ each)', 'They’re the same'], a: 0, why: '$5 ÷ 10 = 50¢, but $3 ÷ 5 = 60¢. The bigger box wins per bar.' },
        { q: 'The fair way to compare two sizes is to check…', choices: ['The sticker price only', 'The price per unit (per item)', 'The color of the box'], a: 1, why: 'Unit price compares the same amount fairly.' }
      ]
    },
    {
      id: 'bank-basics', band: 'growers', emoji: '🏦', title: 'Banks Keep Money Safe',
      blurb: 'What a bank actually does with your money.',
      steps: [
        { t: 'A bank is a safe home for money', b: 'Instead of a jar under your bed (which can be lost or stolen), you can keep money in a bank. It’s safe, and you can take it out whenever you need it. In the U.S., banks are insured, so your money is protected.' },
        { t: 'Banks pay you a little to save', b: 'Here’s the cool part: banks pay you a small reward, called interest, just for keeping your money there. Your money slowly grows on its own — you literally earn money for saving.', tip: 'Interest means the bank pays YOU for saving. Free money for patience.' },
        { t: 'How banks can do that', b: 'Banks lend some of the saved money to other people (to buy a house or start a business) and charge THEM interest. The bank shares a little of that with you. That’s the engine under a bank.' }
      ],
      quiz: [
        { q: 'What is interest, when you save at a bank?', choices: ['A fee you pay the bank', 'A small reward the bank pays you for saving', 'A type of coin'], a: 1, why: 'When you save, the bank pays YOU interest.' },
        { q: 'Why is a bank safer than a jar under your bed?', choices: ['It’s insured and protected', 'It’s made of gold', 'It’s closer'], a: 0, why: 'Bank deposits are insured, so your money is protected.' }
      ]
    },

    // ---------------- Money Builders (6–8) ----------------
    {
      id: 'interest-grows', band: 'builders', emoji: '📈', title: 'Interest: Money That Grows',
      blurb: 'The most powerful idea in personal finance.',
      steps: [
        { t: 'Interest is a percentage', b: 'Interest is usually written as a percent per year. 5% interest on $100 means you earn $5 in a year — you’d have $105. Percent just means “per hundred.”' },
        { t: 'Compound interest: growth on growth', b: 'Here’s the magic. Year 2, you earn 5% on $105 — that’s $5.25, not $5. Your interest earns its OWN interest. Over many years this snowballs. $100 at 7% roughly DOUBLES in about 10 years without you adding a cent.', tip: 'Rule of 72: divide 72 by the interest rate to estimate years to double. 72 ÷ 8 ≈ 9 years.' },
        { t: 'Time is the secret ingredient', b: 'Compounding rewards patience. Starting early beats starting big. Someone who saves a little as a teen can end up ahead of someone who starts a lot in their 30s — because their money had more years to snowball.' }
      ],
      quiz: [
        { q: 'You save $100 at 5% interest. After one year you have…', choices: ['$105', '$150', '$500'], a: 0, why: '5% of $100 = $5, so you’d have $105.' },
        { q: 'Using the Rule of 72, about how long to double your money at 6%?', choices: ['6 years', '12 years', '60 years'], a: 1, why: '72 ÷ 6 = 12 years to roughly double.' }
      ],
      apply: { label: 'Watch money compound in Stable Street →', hash: '#game/market' }
    },
    {
      id: 'credit-borrow', band: 'builders', emoji: '💳', title: 'Credit & Borrowing',
      blurb: 'Borrowing money almost always costs extra.',
      steps: [
        { t: 'Credit is borrowed money', b: 'When you use credit (like a credit card or a loan), you’re spending money you don’t have yet, with a promise to pay it back later. It’s borrowing.' },
        { t: 'Borrowing has a price: interest', b: 'The catch: you pay it back plus interest. Borrow $100 on a card at 20% and don’t pay it off, and you could owe $120 — you paid $20 extra for buying early. On big things, interest can add up to more than the original price.', tip: 'When YOU borrow, interest works against you. Pay it back fast, or avoid it.' },
        { t: 'Good vs. costly borrowing', b: 'Some borrowing can be worth it (a loan for school or a home that grows in value). Borrowing for wants you can’t afford — and only paying the minimum — is how people get trapped, because interest keeps piling on the unpaid part.' }
      ],
      quiz: [
        { q: 'You borrow $100 at 20% and don’t pay it down. Roughly how much might you owe?', choices: ['$100', '$120', '$80'], a: 1, why: '20% of $100 = $20 extra, so about $120. Borrowing costs more than you spent.' },
        { q: 'When you borrow, interest…', choices: ['Works for you', 'Works against you', 'Doesn’t exist'], a: 1, why: 'Borrowed interest works against you — it’s the price of buying early.' }
      ]
    },
    {
      id: 'supply-demand', band: 'builders', emoji: '⚖️', title: 'Supply & Demand',
      blurb: 'Why prices go up and down.',
      steps: [
        { t: 'Demand: how much people want it', b: 'Demand is how badly people want something. When lots of people want a thing (a hot new sneaker, umbrellas on a rainy day), sellers can charge more — high demand pushes prices UP.' },
        { t: 'Supply: how much there is', b: 'Supply is how much of a thing is available. When something is rare (limited-edition cards, strawberries out of season), the price goes UP. When there’s tons of it, sellers compete and the price goes DOWN.', tip: 'Price is a tug-of-war: high demand + low supply = expensive. Low demand + high supply = cheap.' },
        { t: 'It explains almost every price', b: 'Concert tickets, gas, video games, even wages for jobs — supply and demand is the hidden rule behind them all. Understanding it helps you spot a good deal and a rip-off.' }
      ],
      quiz: [
        { q: 'A toy is super popular but the store has very few. The price will likely…', choices: ['Go up', 'Go down', 'Stay exactly the same'], a: 0, why: 'High demand + low supply pushes the price up.' },
        { q: 'A store has way too many of something nobody wants. To sell it, the price usually…', choices: ['Goes up', 'Goes down', 'Disappears'], a: 1, why: 'High supply + low demand pushes prices down — that’s a sale.' }
      ],
      apply: { label: 'Feel supply & demand in the Bakery →', hash: '#game/bakery' }
    },
    {
      id: 'taxes', band: 'builders', emoji: '🧾', title: 'Taxes: Paying for Shared Things',
      blurb: 'Where a slice of every dollar goes, and why.',
      steps: [
        { t: 'Taxes fund things we share', b: 'Taxes are money people and businesses pay to the government. That money pays for shared things no one buys alone: roads, schools, firefighters, parks, the military, libraries.' },
        { t: 'Common kinds of tax', b: 'Sales tax is added at the register — a $10 item at 8% tax costs $10.80. Income tax is a slice of what people earn. So a “$50,000 job” actually pays somewhat less after taxes — your take-home pay is what’s left.', tip: 'Sticker price isn’t final — remember to add sales tax. And a salary isn’t your take-home pay.' },
        { t: 'Why it matters to you', b: 'Understanding taxes helps you budget for the real cost of things and understand a paycheck. It’s not money that vanishes — it’s the shared bill for services everyone uses.' }
      ],
      quiz: [
        { q: 'A $10 toy has 8% sales tax. What do you pay at the register?', choices: ['$10.00', '$10.80', '$18.00'], a: 1, why: '8% of $10 = 80¢, so $10.80. Sales tax is added on top.' },
        { q: 'Taxes mainly pay for…', choices: ['One person’s shopping', 'Shared things like roads, schools, and firefighters', 'Nothing'], a: 1, why: 'Taxes fund shared services we all use.' }
      ]
    },

    // ---------------- Money Trailblazers (9–12) ----------------
    {
      id: 'banking-accounts', band: 'trailblazers', emoji: '🏛️', title: 'Checking vs. Savings',
      blurb: 'The two accounts every adult uses.',
      steps: [
        { t: 'Checking is for spending', b: 'A checking account is your day-to-day money. A debit card pulls straight from it, and it’s where a paycheck lands. It’s built for moving money in and out often. It usually pays little or no interest.' },
        { t: 'Savings is for growing', b: 'A savings account is for money you’re NOT spending right now. It pays more interest than checking, rewarding you for leaving it alone. A common move: keep spending money in checking, and an emergency fund (3–6 months of costs) in savings.', tip: 'Debit = your own money. Credit = borrowed money you must pay back. Don’t confuse them.' },
        { t: 'Watch the fees', b: 'Some accounts charge fees (monthly fees, overdraft fees when you spend more than you have). Good accounts are free if you follow the rules. Reading the fine print is a real-money skill.' }
      ],
      quiz: [
        { q: 'Which account is designed for everyday spending?', choices: ['Savings', 'Checking', 'Neither'], a: 1, why: 'Checking is for day-to-day spending; savings is for growing money you leave alone.' },
        { q: 'A debit card spends…', choices: ['Borrowed money', 'Your own money', 'The bank’s money forever'], a: 1, why: 'Debit pulls your own money; credit borrows and must be repaid.' }
      ]
    },
    {
      id: 'credit-score', band: 'trailblazers', emoji: '📊', title: 'Credit Scores & Debt',
      blurb: 'The number that follows you into adulthood.',
      steps: [
        { t: 'A credit score is a trust rating', b: 'A credit score (roughly 300–850) is a number lenders use to decide whether to trust you with a loan, and at what interest rate. It’s built from your history of borrowing and paying back on time.' },
        { t: 'Why it matters more than it seems', b: 'A good score means lower interest rates — which can save tens of thousands of dollars on a car or home loan over your life. A poor score means higher rates, bigger deposits, even trouble renting an apartment.', tip: 'The #1 way to build a good score: borrow small, and pay every bill on time, every time.' },
        { t: 'Debt: useful tool or trap', b: 'Debt isn’t always bad — a reasonable loan for school or a home can pay off. The trap is high-interest debt (like credit cards) that you only make minimum payments on. That interest compounds against you, and the balance can balloon.' }
      ],
      quiz: [
        { q: 'A HIGHER credit score usually gets you…', choices: ['Higher interest rates', 'Lower interest rates', 'No effect at all'], a: 1, why: 'A better score earns lower rates — saving big money over a lifetime.' },
        { q: 'The best habit for a strong credit score is…', choices: ['Never pay bills', 'Pay every bill on time', 'Borrow as much as possible'], a: 1, why: 'On-time payments are the biggest driver of a good score.' }
      ]
    },
    {
      id: 'investing', band: 'trailblazers', emoji: '🧭', title: 'Investing: Owning a Piece',
      blurb: 'How money can work while you sleep.',
      steps: [
        { t: 'A stock is a slice of a company', b: 'When you buy a stock, you own a tiny piece of a real company. If the company grows and earns more, your slice can become worth more. Investors put money in hoping it grows faster than a savings account.' },
        { t: 'Return comes with risk', b: 'Investments can go UP or DOWN. Higher potential reward usually means higher risk. The key skill is managing risk — never investing money you need soon, and not betting everything on one company.', tip: 'Diversify: spread money across many investments so one bad pick can’t sink you.' },
        { t: 'Slow and steady wins', b: 'Two proven ideas: diversification (own many things, not one) and dollar-cost averaging (invest a little regularly instead of guessing the perfect moment). Boring, patient investing beats flashy gambling over time.' }
      ],
      quiz: [
        { q: 'Buying a stock means you…', choices: ['Lend the company money forever', 'Own a small piece of the company', 'Work for the company'], a: 1, why: 'A stock is part-ownership of a real company.' },
        { q: 'What does “diversify” mean?', choices: ['Put everything in one hot stock', 'Spread money across many investments', 'Never invest'], a: 1, why: 'Diversifying spreads risk so one bad pick can’t sink you.' }
      ],
      apply: { label: 'Run a real portfolio in Stable Street →', hash: '#game/market' }
    },
    {
      id: 'independence', band: 'trailblazers', emoji: '🕊️', title: 'Financial Independence',
      blurb: 'Putting it all together: freedom, not just money.',
      steps: [
        { t: 'What financial freedom means', b: 'Financial independence is having enough saved and invested that money stops being a constant worry — you have choices. It isn’t about being rich; it’s about your money working for you instead of you always working for money.' },
        { t: 'The simple, powerful formula', b: 'Spend less than you earn, save the gap, and invest it so it compounds. Do that steadily for years and the snowball becomes real. An emergency fund protects you from surprises; investing builds the future.', tip: 'Wealth is mostly quiet habits repeated for years — not one lucky break.' },
        { t: 'Avoid the traps', b: 'The biggest wealth-killers are high-interest debt, spending to impress others, and never starting. You now know how to dodge all three. Start small, start early, stay consistent — that’s the whole game.' }
      ],
      quiz: [
        { q: 'Financial independence is best described as…', choices: ['Being famous', 'Having enough that money isn’t a constant worry and you have choices', 'Spending freely on wants'], a: 1, why: 'It’s about freedom and choices, not showing off.' },
        { q: 'The core formula is: earn, then…', choices: ['Spend it all', 'Spend less than you earn and invest the gap', 'Borrow more'], a: 1, why: 'Spend less than you earn, invest the difference, let it compound.' }
      ]
    }
  ];

  const bandOf = id => BANDS.find(b => b.id === id) || BANDS[0];
  const unitsInBand = bid => UNITS.filter(u => u.band === bid);

  // ---- progress (server game-state 'finance'): { done: { unitId: true } } ----
  let PROG = { done: {} };
  async function loadProgress() {
    try { const r = await api(`/play/${kidId()}/game-state/finance`); if (r && r.state && r.state.done) PROG = { done: r.state.done }; }
    catch (e) { /* fresh start */ }
  }
  async function saveProgress() {
    try { await api(`/play/${kidId()}/game-state/finance`, { method: 'POST', body: { state: PROG } }); } catch (e) { /* best-effort */ }
  }
  const isDone = id => !!(PROG.done && PROG.done[id]);
  const bandDone = bid => unitsInBand(bid).filter(u => isDone(u.id)).length;

  // The band that matches the child's grade — shown first and highlighted.
  function homeBand() {
    const g = kid().grade == null ? 3 : kid().grade;
    return BANDS.find(b => g >= b.lo && g <= b.hi) || BANDS[0];
  }

  // ======================= Course hub =======================
  route('money', async (arg) => {
    if (State.me.role !== 'kid') { location.hash = '#home'; return; }
    await loadProgress();
    const total = UNITS.length, done = UNITS.filter(u => isDone(u.id)).length;
    const yours = homeBand();
    // Order bands so the child's own band is first, then the rest in order.
    const ordered = [yours, ...BANDS.filter(b => b.id !== yours.id)];
    const bandBlock = b => {
      const us = unitsInBand(b.id), dn = bandDone(b.id);
      const isYours = b.id === yours.id;
      return `<div class="card" style="margin-top:14px;border-left:5px solid ${b.color}">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <span style="font-size:1.5rem">${b.emoji}</span>
          <b style="font-size:1.05rem">${b.label}</b>
          <span class="muted" style="font-size:.85rem">Grades ${b.grades}</span>
          ${isYours ? `<span class="pill" style="background:${b.color}22;color:${b.color};font-weight:700">Recommended for you</span>` : ''}
          <span class="muted" style="margin-left:auto;font-size:.85rem">${dn}/${us.length} done</span>
        </div>
        <div class="fin-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px;margin-top:12px">
          ${us.map(u => `<div class="fin-unit" data-unit="${u.id}" role="button" tabindex="0" style="cursor:pointer;border:1px solid #e7e2d6;border-radius:12px;padding:12px;background:${isDone(u.id) ? '#f2faf4' : '#fff'};transition:.15s">
            <div style="display:flex;align-items:center;gap:8px"><span style="font-size:1.3rem">${u.emoji}</span>${isDone(u.id) ? '<span style="color:#1f8a5f;font-weight:800">✓</span>' : ''}</div>
            <b style="display:block;margin-top:6px">${esc(u.title)}</b>
            <span class="muted" style="font-size:.82rem">${esc(u.blurb)}</span>
          </div>`).join('')}
        </div>
      </div>`;
    };
    app().innerHTML = topbar(`<div class="container" style="max-width:900px">
      <div class="card" style="text-align:center;background:linear-gradient(180deg,#fffdf5,#fff)">
        <div style="font-size:2rem">💰</div>
        <h1 style="margin:6px 0 4px">Money Skills</h1>
        <p class="muted" style="max-width:560px;margin:0 auto">An <b>optional</b> bonus course — real money smarts most kids never get taught. Learn a quick lesson, answer a few questions, and unlock the next one. It grows right alongside you.</p>
        <div style="margin-top:12px;max-width:420px;margin-left:auto;margin-right:auto">
          <div class="sk-bar" style="height:12px"><span class="sk-fill hi" style="width:${Math.round(done / total * 100)}%;background:#37a05f"></span></div>
          <p class="muted" style="font-size:.82rem;margin:6px 0 0">${done} of ${total} lessons complete</p>
        </div>
      </div>
      ${ordered.map(bandBlock).join('')}
      <div style="text-align:center;margin:18px 0"><button class="btn ghost" onclick="location.hash='#home'">← Back to home</button></div>
    </div>`);
    wireChrome();
    document.querySelectorAll('.fin-unit').forEach(el => {
      const go = () => { Sound && Sound.click && Sound.click(); location.hash = '#money-unit/' + el.dataset.unit; };
      el.onclick = go;
      el.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } };
    });
  });

  // ======================= Single unit: teach → check → done =======================
  route('money-unit', async (unitId) => {
    if (State.me.role !== 'kid') { location.hash = '#home'; return; }
    const u = UNITS.find(x => x.id === unitId);
    if (!u) { location.hash = '#money'; return; }
    await loadProgress();
    const b = bandOf(u.band);
    let phase = 'learn', stepI = 0, quizI = 0, quizWrong = 0;

    function shell(inner) {
      app().innerHTML = topbar(`<div class="container" style="max-width:680px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
          <button class="btn ghost small" id="fin-back">← Money Skills</button>
          <span class="muted" style="font-size:.85rem">${b.emoji} ${b.label}</span>
        </div>
        <div class="card">
          <div style="display:flex;align-items:center;gap:10px"><span style="font-size:1.6rem">${u.emoji}</span><h2 style="margin:0">${esc(u.title)}</h2></div>
          ${inner}
        </div>
      </div>`);
      wireChrome();
      const bk = document.getElementById('fin-back'); if (bk) bk.onclick = () => location.hash = '#money';
    }

    function renderLearn() {
      const s = u.steps[stepI];
      const pct = Math.round((stepI) / u.steps.length * 100);
      shell(`
        <div class="sk-bar" style="height:8px;margin:12px 0 16px"><span class="sk-fill hi" style="width:${pct}%;background:${b.color}"></span></div>
        <h3 style="margin:0 0 8px;color:${b.color}">${esc(s.t)}</h3>
        <p style="font-size:1.05rem;line-height:1.6">${esc(s.b)}</p>
        ${s.tip ? `<div style="margin-top:12px;background:#fff8e6;border:1px solid #f0d9a8;border-radius:10px;padding:10px 12px"><b>💡 Key idea:</b> ${esc(s.tip)}</div>` : ''}
        <div style="display:flex;gap:8px;justify-content:space-between;margin-top:18px">
          <button class="btn ghost" id="fin-prev" ${stepI === 0 ? 'style="visibility:hidden"' : ''}>← Back</button>
          <button class="btn green" id="fin-next">${stepI < u.steps.length - 1 ? 'Next →' : 'Check what you learned →'}</button>
        </div>`);
      const nx = document.getElementById('fin-next'), pv = document.getElementById('fin-prev');
      nx.onclick = () => { if (stepI < u.steps.length - 1) { stepI++; renderLearn(); } else { phase = 'quiz'; quizI = 0; renderQuiz(); } };
      if (pv) pv.onclick = () => { if (stepI > 0) { stepI--; renderLearn(); } };
    }

    function renderQuiz() {
      const item = u.quiz[quizI];
      shell(`
        <p class="muted" style="margin:12px 0 4px">Question ${quizI + 1} of ${u.quiz.length}</p>
        <h3 style="margin:0 0 14px">${esc(item.q)}</h3>
        <div id="fin-choices" style="display:flex;flex-direction:column;gap:10px">
          ${item.choices.map((c, i) => `<button class="btn ghost fin-choice" data-i="${i}" style="text-align:left;justify-content:flex-start">${esc(c)}</button>`).join('')}
        </div>
        <div id="fin-feedback" style="margin-top:14px"></div>`);
      document.querySelectorAll('.fin-choice').forEach(btn => {
        btn.onclick = () => {
          const i = Number(btn.dataset.i);
          document.querySelectorAll('.fin-choice').forEach(x => { x.disabled = true; x.style.opacity = '.6'; });
          const correct = i === item.a;
          const chosen = document.querySelector(`.fin-choice[data-i="${i}"]`);
          const right = document.querySelector(`.fin-choice[data-i="${item.a}"]`);
          if (correct) { chosen.style.background = '#e7f7ec'; chosen.style.borderColor = '#1f8a5f'; chosen.style.opacity = '1'; Sound && Sound.correct && Sound.correct(); }
          else { chosen.style.background = '#fdeaea'; chosen.style.borderColor = '#c0392b'; if (right) { right.style.background = '#e7f7ec'; right.style.borderColor = '#1f8a5f'; right.style.opacity = '1'; } quizWrong++; Sound && Sound.wrong && Sound.wrong(); }
          const fb = document.getElementById('fin-feedback');
          fb.innerHTML = `<div style="background:${correct ? '#f2faf4' : '#fff5f5'};border-radius:10px;padding:12px">
            <b>${correct ? '✅ Correct!' : '💡 Here’s the idea:'}</b> ${esc(item.why)}
            <div style="margin-top:12px;text-align:right"><button class="btn green" id="fin-cont">${quizI < u.quiz.length - 1 ? 'Next question →' : 'Finish lesson →'}</button></div>
          </div>`;
          document.getElementById('fin-cont').onclick = () => { if (quizI < u.quiz.length - 1) { quizI++; renderQuiz(); } else { finish(); } };
        };
      });
    }

    async function finish() {
      const firstTime = !isDone(u.id);
      PROG.done[u.id] = true;
      await saveProgress();
      if (Confetti && Confetti.burst) Confetti.burst(140);
      const nextU = UNITS.find(x => !isDone(x.id));
      shell(`
        <div style="text-align:center;padding:10px 0">
          <div style="font-size:2.4rem">🎉</div>
          <h3 style="margin:8px 0">Lesson complete!</h3>
          <p class="muted">${quizWrong === 0 ? 'Perfect — you nailed every question.' : 'Nice work — you’ve got the idea.'} You just learned something most adults were never taught.</p>
          ${u.apply ? `<div style="margin:14px 0"><button class="btn sun" id="fin-apply">${esc(u.apply.label)}</button><p class="muted" style="font-size:.8rem;margin:6px 0 0">Learn it, then live it in The Lab.</p></div>` : ''}
          <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:14px">
            ${nextU ? `<button class="btn green" id="fin-nextu">Next lesson: ${esc(nextU.title)} →</button>` : ''}
            <button class="btn ghost" id="fin-hub">Back to Money Skills</button>
          </div>
        </div>`);
      const ap = document.getElementById('fin-apply'); if (ap && u.apply) ap.onclick = () => location.hash = u.apply.hash;
      const nu = document.getElementById('fin-nextu'); if (nu && nextU) nu.onclick = () => location.hash = '#money-unit/' + nextU.id;
      const hb = document.getElementById('fin-hub'); if (hb) hb.onclick = () => location.hash = '#money';
    }

    renderLearn();
  });
})();

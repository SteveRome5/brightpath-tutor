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
      sim: 'goal',
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
      sim: 'budget',
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
      sim: 'compound',
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
    },

    // ---------------- Money Sprouts (K–2) — added ----------------
    {
      id: 'making-change', band: 'sprouts', emoji: '🔁', title: 'Making Change',
      blurb: 'What happens when you pay with too much.',
      steps: [
        { t: 'Change is money you get back', b: 'When something costs less than the money you hand over, the cashier gives you the extra back. That extra is called your change. If a toy costs 70¢ and you pay with $1 (100¢), you get 30¢ back.' },
        { t: 'Count UP to find the change', b: 'The easy trick: start at the price and count up to what you paid. From 70¢: +10 = 80, +10 = 90, +10 = 100. That’s 30¢ of change. Counting up is how cashiers do it in their heads.', tip: 'To find change, count up from the price to the amount you paid.' },
        { t: 'Check your change', b: 'Always glance at your change to make sure it’s right. It’s good practice — even grown-ups get shortchanged sometimes. A quick count keeps your money safe.' }
      ],
      quiz: [
        { q: 'A snack costs 60¢. You pay with $1. How much change?', choices: ['30¢', '40¢', '60¢'], a: 1, why: 'Count up from 60 to 100 = 40¢ change.' },
        { q: 'The best way to find change is to…', choices: ['Guess', 'Count up from the price to what you paid', 'Count down from zero'], a: 1, why: 'Counting up from the price is the cashier’s trick.' }
      ]
    },
    {
      id: 'earning-effort', band: 'sprouts', emoji: '🧹', title: 'Earning Money',
      blurb: 'Money is a reward for helping and effort.',
      steps: [
        { t: 'Money is usually earned', b: 'Money doesn’t just appear — people earn it by doing helpful work. Kids can earn too: helping with chores, a lemonade stand, or a little job for a neighbor. Effort turns into money.' },
        { t: 'Effort and value', b: 'Harder or more helpful work usually earns more. Watering a plant is quick; washing the whole car takes real effort — so the car earns more. Doing a great job makes people want to “hire” you again.', tip: 'Do a job well and people come back — that’s how earning grows.' },
        { t: 'Earn, then choose', b: 'When you earn your own money, spending it feels different — you worked for it! That makes the save/spend/give choice matter more, and helps you pick what you really want.' }
      ],
      quiz: [
        { q: 'The best way to earn more, doing chores, is to…', choices: ['Do the smallest job fast', 'Do helpful work well so people ask again', 'Refuse to help'], a: 1, why: 'Doing good, helpful work earns more and brings repeat “jobs.”' },
        { q: 'Money is usually…', choices: ['Free if you ask', 'Earned by doing helpful work', 'Found on the ground'], a: 1, why: 'Money is earned through effort and helping.' }
      ]
    },

    // ---------------- Money Growers (3–5) — added ----------------
    {
      id: 'giving-back', band: 'growers', emoji: '❤️', title: 'Giving Back',
      blurb: 'Using some of your money to help others.',
      steps: [
        { t: 'Giving is part of a money plan', b: 'Lots of people set aside a little of their money to help others — a charity, a food bank, an animal shelter, or someone in need. It’s called giving or donating.' },
        { t: 'A little adds up', b: 'You don’t need to be rich to give. If you set aside just 10¢ of every dollar, that’s $1 for every $10 you get. Small amounts from many people fund big, wonderful things.', tip: 'Even a small, regular gift makes a real difference — and feels great.' },
        { t: 'Give on purpose', b: 'The best giving is planned, not random. Pick a cause you care about, decide how much, and give it gladly. Many people say giving is the most satisfying money they spend.' }
      ],
      quiz: [
        { q: 'If you give 10¢ of every dollar, how much do you give from $10?', choices: ['$1', '$5', '10¢'], a: 0, why: '10¢ per dollar × 10 dollars = $1.' },
        { q: 'The best kind of giving is…', choices: ['Random and rushed', 'Planned — a cause you care about', 'Only when someone forces you'], a: 1, why: 'Planned giving to a cause you care about is most meaningful.' }
      ]
    },
    {
      id: 'goals-plan', band: 'growers', emoji: '🎯', title: 'Set a Money Goal',
      blurb: 'Turn a wish into a plan that works.',
      sim: 'goal',
      steps: [
        { t: 'A goal needs a number and a date', b: 'A wish is “I want a bike.” A goal is “I want a $120 bike by my birthday in 6 months.” A real goal has a price and a deadline — that’s what makes it reachable.' },
        { t: 'Break it into small steps', b: '$120 in 6 months = $20 a month, or about $5 a week. Suddenly a big goal is a small weekly habit. Write it down and track it so you can watch it fill up.', tip: 'Big goal ÷ time = the small amount to save each week. That’s the whole secret.' },
        { t: 'Protect the goal', b: 'The hard part is not spending your goal money on other stuff. Keeping it in a separate place (a jar, an envelope, a savings account) makes it easier to leave alone until you reach the finish line.' }
      ],
      quiz: [
        { q: 'You want a $120 goal in 6 months. About how much per month?', choices: ['$20', '$60', '$120'], a: 0, why: '$120 ÷ 6 months = $20 a month.' },
        { q: 'What turns a wish into a real goal?', choices: ['Hoping harder', 'A price and a deadline', 'Telling nobody'], a: 1, why: 'A number + a date makes a goal you can plan for.' }
      ],
      apply: { label: 'Practice earning toward a goal in the Bakery →', hash: '#game/bakery' }
    },
    {
      id: 'ads-tricks', band: 'growers', emoji: '📺', title: 'Ads & Sneaky Tricks',
      blurb: 'How companies try to get your money.',
      steps: [
        { t: 'Ads are made to make you want things', b: 'Ads aren’t just information — they’re designed to make you feel you NEED something. Bright colors, happy kids, cool music, a favorite character: all chosen to make you ask a grown-up to buy it.' },
        { t: 'Spot the tricks', b: 'Watch for “limited time!”, “everyone has one!”, and toys that look way bigger or cooler than they really are. These push you to buy fast, before you think. A smart shopper slows down.', tip: 'When an ad makes you feel you must buy RIGHT NOW — that’s exactly when to pause.' },
        { t: 'Ask three questions', b: 'Before wanting what an ad sells, ask: Do I really need it? Is it as good as it looks? Could I wait? Often the “want” fades in a day — and you keep your money.' }
      ],
      quiz: [
        { q: 'The main goal of most ads is to…', choices: ['Teach you facts', 'Make you want to buy something', 'Tell the whole truth'], a: 1, why: 'Ads are built to create wants and get you to buy.' },
        { q: '“Limited time — buy now!” is designed to make you…', choices: ['Slow down and think', 'Buy fast before you think', 'Save your money'], a: 1, why: 'Urgency tricks push you to buy before you consider it.' }
      ]
    },

    // ---------------- Money Builders (6–8) — added ----------------
    {
      id: 'entrepreneur-basics', band: 'builders', emoji: '🚀', title: 'Start a Business',
      blurb: 'Profit = what you make − what it costs.',
      sim: 'profit',
      steps: [
        { t: 'A business solves a problem for money', b: 'Every business trades something people want (a product or service) for money. A dog-walking business trades your time and effort; a bakery trades cupcakes. Step one is always: what problem do I solve?' },
        { t: 'Profit is the goal', b: 'Profit = revenue − costs. If you sell $50 of lemonade (revenue) but spent $20 on lemons and cups (costs), your profit is $30. A business only works if revenue is bigger than costs.', tip: 'Revenue is money IN. Costs are money OUT. Profit is what’s left — the point of it all.' },
        { t: 'Price and volume', b: 'You can grow profit two ways: charge a bit more per item, or sell more items. Great entrepreneurs test both — and watch their costs, because every dollar saved is a dollar of profit.' }
      ],
      quiz: [
        { q: 'You earn $50 selling lemonade and spent $20 on supplies. Your profit is…', choices: ['$70', '$50', '$30'], a: 2, why: 'Profit = revenue − costs = $50 − $20 = $30.' },
        { q: 'A business makes a profit only when…', choices: ['Costs are bigger than revenue', 'Revenue is bigger than costs', 'It’s very busy'], a: 1, why: 'Profit needs revenue (in) to beat costs (out).' }
      ],
      apply: { label: 'Run a business in the Lemonade Stand →', hash: '#game/lemonade' }
    },
    {
      id: 'inflation', band: 'builders', emoji: '🎈', title: 'Inflation',
      blurb: 'Why a dollar buys less over time.',
      steps: [
        { t: 'Prices tend to rise over time', b: 'Inflation means prices slowly go up year after year. Your grandparents may have paid a nickel for candy that costs a dollar now. The same money buys less than it used to.' },
        { t: 'It quietly shrinks saved cash', b: 'If prices rise about 3% a year, $100 stuffed under a mattress still says $100 — but it BUYS about 3% less each year. Cash slowly loses power. That’s a big reason people invest instead of only holding cash.', tip: 'Money doing nothing slowly loses value to inflation. Money invested can outrun it.' },
        { t: 'Beating inflation', b: 'To stay ahead, your money needs to grow at least as fast as prices rise. Savings accounts help a little; investing (with its higher long-term returns) is how people aim to beat inflation over many years.' }
      ],
      quiz: [
        { q: 'Inflation means that over time, the same dollar…', choices: ['Buys more', 'Buys less', 'Stays exactly the same'], a: 1, why: 'Rising prices mean each dollar buys a little less.' },
        { q: 'Why can cash under a mattress be risky long-term?', choices: ['It grows too fast', 'Inflation slowly cuts what it can buy', 'It earns too much interest'], a: 1, why: 'Idle cash loses buying power to inflation.' }
      ]
    },
    {
      id: 'paycheck', band: 'builders', emoji: '🧾', title: 'Your First Paycheck',
      blurb: 'Why you don’t take home the whole amount.',
      steps: [
        { t: 'Gross pay vs. take-home pay', b: 'When you get a job, the wage they promise (say $15/hour) is your GROSS pay. But your paycheck is smaller than that, because some is taken out before you get it. What lands in your pocket is your NET, or take-home, pay.' },
        { t: 'Where the rest goes', b: 'Money is withheld mostly for taxes (which fund shared services) and sometimes for things like health insurance or retirement savings. So a “$15/hour” job might take home more like $12–13 after withholding.', tip: 'Always think in take-home pay. The sticker wage isn’t what hits your account.' },
        { t: 'Read your pay stub', b: 'A pay stub lists gross pay, each deduction, and net pay. Learning to read it means no surprises — and helps you budget with the real number you actually receive.' }
      ],
      quiz: [
        { q: 'The money that actually lands in your pocket is called…', choices: ['Gross pay', 'Net (take-home) pay', 'Bonus pay'], a: 1, why: 'Net pay is what’s left after withholding — your real take-home.' },
        { q: 'Most of what’s taken out of a paycheck goes to…', choices: ['Nothing', 'Taxes (and sometimes benefits)', 'The bank keeps it'], a: 1, why: 'Taxes are the biggest withholding, funding shared services.' }
      ]
    },
    {
      id: 'scams', band: 'builders', emoji: '🛡️', title: 'Scams & Smart Choices',
      blurb: 'If it seems too good to be true, it is.',
      steps: [
        { t: 'Scams trick you out of money', b: 'A scam is a trick designed to take your money or information. Common ones: “You won a prize — just pay a small fee!”, fake stores, or a message pretending to be someone you trust.' },
        { t: 'The golden rule', b: 'If an offer seems too good to be true, it almost always is. Real money doesn’t come from strangers for free. Free “prizes” that ask for payment, and urgent “act now!” messages, are giant red flags.', tip: 'Slow down, and never send money or personal info to someone you can’t verify.' },
        { t: 'Protect yourself', b: 'Never share passwords or personal details with people who contact you first. When unsure, ask a trusted adult. Being a little skeptical isn’t rude — it’s smart, and it keeps your money safe.' }
      ],
      quiz: [
        { q: 'An offer says you won $1,000 — just pay a $20 “fee” first. This is…', choices: ['A great deal', 'Almost certainly a scam', 'Free money'], a: 1, why: 'Real prizes never require you to pay first. Classic scam.' },
        { q: 'The golden rule for spotting scams is…', choices: ['If it seems too good to be true, it is', 'Always say yes fast', 'Trust every message'], a: 0, why: 'Too-good-to-be-true offers are the biggest warning sign.' }
      ]
    },

    // ---------------- Money Trailblazers (9–12) — added ----------------
    {
      id: 'college-loans', band: 'trailblazers', emoji: '🎓', title: 'Paying for College',
      blurb: 'A big decision — with smart ways to fund it.',
      steps: [
        { t: 'College is an investment', b: 'College can open doors and raise lifetime earnings — but it costs money, and many people borrow to pay for it. Treat it like an investment: weigh the cost against what it helps you earn and do.' },
        { t: 'Free money first', b: 'Not all college money must be repaid. Scholarships and grants are free — you never pay them back. Chase those hard before loans. Community college and in-state schools can cut costs dramatically for the same early credits.', tip: 'Exhaust free money (scholarships, grants) before borrowing a single dollar.' },
        { t: 'Borrow with your eyes open', b: 'Student loans must be repaid with interest, often for years. A useful rule: try not to borrow more in total than you expect to earn in your first year of work. And remember — trade schools and apprenticeships can lead to great careers with little or no debt.' }
      ],
      quiz: [
        { q: 'Which college money never has to be paid back?', choices: ['Student loans', 'Scholarships and grants', 'Credit cards'], a: 1, why: 'Scholarships and grants are free — loans must be repaid with interest.' },
        { q: 'A smart borrowing guideline is to not borrow more than…', choices: ['You can imagine', 'About your expected first-year salary', 'Ten times your salary'], a: 1, why: 'Keeping total loans near one year’s starting pay keeps them manageable.' }
      ]
    },
    {
      id: 'insurance', band: 'trailblazers', emoji: '☂️', title: 'Insurance',
      blurb: 'How people protect themselves from big surprises.',
      steps: [
        { t: 'Insurance shares risk', b: 'Insurance is a deal: you pay a small amount regularly (a premium), and if something bad and expensive happens — a car crash, a health emergency — the insurer helps pay the big bill. Many people’s small payments cover the few who have a disaster.' },
        { t: 'Why it matters', b: 'A single emergency can cost thousands. Insurance turns a rare, huge, unpredictable cost into a small, steady, predictable one you can budget for. That’s protection against being wiped out by one bad day.', tip: 'Insurance trades a small certain cost now for protection against a huge cost later.' },
        { t: 'Common kinds', b: 'Health, car, renters/home, and life insurance are the big ones adults use. You don’t insure small stuff you could easily replace — you insure the big risks that could set you back for years.' }
      ],
      quiz: [
        { q: 'The main point of insurance is to…', choices: ['Make you rich', 'Protect you from rare but huge costs', 'Avoid ever paying anything'], a: 1, why: 'Insurance shields you from big, unpredictable expenses.' },
        { q: 'You should generally insure…', choices: ['Small things you could easily replace', 'Big risks that could set you back for years', 'Nothing, ever'], a: 1, why: 'Insure the big risks; self-cover the small stuff.' }
      ]
    },
    {
      id: 'long-game', band: 'trailblazers', emoji: '⏳', title: 'The Long Game',
      blurb: 'Why starting young is a superpower.',
      sim: 'compound',
      steps: [
        { t: 'Time is an investor’s best friend', b: 'Compounding needs time to work its magic — and teens have the most of it. Money invested at 18 has decades to snowball before money invested at 40 even starts.' },
        { t: 'A jaw-dropping example', b: 'Invest $2,000 a year from age 18 to 25 (just 8 years, $16,000 total), then never add another dime. Thanks to compounding, that can grow to more than someone who invests $2,000 every year from 25 to 65. Starting early beat saving 4× as much.', tip: 'Because of compounding, WHEN you start can matter more than HOW MUCH you invest.' },
        { t: 'Retirement, explained simply', b: 'Accounts like a 401(k) or IRA let money grow for decades with tax advantages. The lesson isn’t the account names — it’s this: start early, invest steadily, and let time do the heavy lifting.' }
      ],
      quiz: [
        { q: 'For an investor, the most powerful advantage a teenager has is…', choices: ['Lots of money', 'Lots of time for compounding', 'A fancy app'], a: 1, why: 'Time lets compounding snowball — teens have the most of it.' },
        { q: 'The big lesson of “the long game” is…', choices: ['Wait until you’re older to start', 'Start early and let time compound your money', 'Only invest a fortune'], a: 1, why: 'Starting early can beat investing much more, later.' }
      ],
      apply: { label: 'See compounding play out in Stable Street →', hash: '#game/market' }
    },

    // ---------------- Money Sprouts (K–2) — more ----------------
    {
      id: 'patience', band: 'sprouts', emoji: '⏳', title: 'Wait for It',
      blurb: 'Sometimes waiting gets you something even better.',
      steps: [
        { t: 'The marshmallow choice', b: 'Imagine someone gives you one treat now — but says if you can wait a little while, you’ll get TWO. Waiting is hard! But learning to wait for something better is one of the most useful money skills there is.' },
        { t: 'Patience beats “right now”', b: 'The same goes for money. You could spend $5 on candy today, or save it a few weeks and buy something you’ll enjoy much longer. Spending slows you down from reaching bigger, better goals.', tip: 'The ability to wait — to delay a small treat for a bigger reward — makes saving possible.' },
        { t: 'A trick that helps', b: 'When you really want to buy something, wait one day first. Often the “I MUST have it” feeling fades, and you keep your money for something you’ll be happier with.' }
      ],
      quiz: [
        { q: 'Waiting to buy something bigger later, instead of a small treat now, is called…', choices: ['Being patient (delayed gratification)', 'Being greedy', 'Wasting money'], a: 0, why: 'That’s delayed gratification — a superpower for saving.' },
        { q: 'A good trick when you really want to buy something is to…', choices: ['Buy it instantly', 'Wait a day and see if you still want it', 'Buy two'], a: 1, why: 'Waiting a day often cools the urge and saves your money.' }
      ]
    },
    {
      id: 'fair-trade', band: 'sprouts', emoji: '🤝', title: 'Trading & Fair Deals',
      blurb: 'When is a swap actually a good one?',
      steps: [
        { t: 'Trading is swapping value', b: 'Before money, people traded things directly — and we still trade today (swapping snacks, cards, or toys). A trade works when BOTH people feel they got something they wanted.' },
        { t: 'A fair trade helps both sides', b: 'If you trade a toy you’re bored with for one your friend is bored with, you can BOTH end up happier — even though no new toys were made. That’s the magic of a good trade: value for both.', tip: 'A good deal isn’t about “winning.” It’s a swap where both people are glad they did it.' },
        { t: 'Watch out for bad trades', b: 'A trade is unfair if one person is tricked or pressured, or gives up something much more valuable. Before you swap, ask: “Am I happy with this, and is it fair to us both?”' }
      ],
      quiz: [
        { q: 'A GOOD trade is one where…', choices: ['One person wins and one loses', 'Both people are happy with what they got', 'Someone gets tricked'], a: 1, why: 'The best trades leave both people better off.' },
        { q: 'Before making a swap, a smart question is…', choices: ['How can I trick them?', 'Is this fair, and am I happy with it?', 'Can I take it back later?'], a: 1, why: 'Fair and happy for both — that’s the test of a good deal.' }
      ]
    },

    // ---------------- Money Growers (3–5) — more ----------------
    {
      id: 'opportunity-cost', band: 'growers', emoji: '🔀', title: 'Every Choice Has a Cost',
      blurb: 'What you give up when you pick one thing.',
      steps: [
        { t: 'You can’t buy everything', b: 'Money is limited, so every time you spend on one thing, you give up something else you could have bought. That “something else you gave up” has a name: opportunity cost.' },
        { t: 'The hidden price tag', b: 'If you spend $10 on a movie, the opportunity cost is the book or the game you DIDN’T buy with that $10. It’s not just about the money — it’s about the best thing you passed up.', tip: 'Opportunity cost = the next-best thing you gave up to get what you chose.' },
        { t: 'Choosing on purpose', b: 'Smart spenders pause and ask: “Is this the BEST use of my money right now, out of everything I could do with it?” That one question leads to far fewer regrets.' }
      ],
      quiz: [
        { q: 'You spend your only $10 on a movie. The opportunity cost is…', choices: ['The $10 bill', 'The next-best thing you could have bought instead', 'The movie ticket'], a: 1, why: 'Opportunity cost is the best alternative you gave up.' },
        { q: 'Opportunity cost reminds us that…', choices: ['Money is unlimited', 'Every choice means giving something else up', 'Spending is always free'], a: 1, why: 'Choosing one thing means passing on another — that’s the real cost.' }
      ]
    },
    {
      id: 'track-money', band: 'growers', emoji: '📝', title: 'Keep Track of Your Money',
      blurb: 'You can’t manage what you don’t measure.',
      steps: [
        { t: 'Where did it all go?', b: 'Ever had money, then wondered where it went? That happens when you don’t keep track. Writing down what comes in and what goes out turns a mystery into a clear picture.' },
        { t: 'A simple money log', b: 'Keep a little list: money in (allowance, gifts, jobs) and money out (what you bought). Add it up now and then. Suddenly you can SEE your habits — and spot spending you didn’t even notice.', tip: 'Tracking your money is how you catch “leaks” — small buys that quietly add up.' },
        { t: 'Knowledge is power', b: 'Once you can see where your money goes, you can make better choices — cutting back on things you don’t really care about, and keeping more for what you do.' }
      ],
      quiz: [
        { q: 'Keeping a log of money in and money out helps you…', choices: ['See where your money actually goes', 'Spend faster', 'Hide your money'], a: 0, why: 'Tracking reveals your real habits so you can improve them.' },
        { q: 'Small purchases you don’t notice are sometimes called…', choices: ['“Leaks”', 'Savings', 'Income'], a: 0, why: 'Little unnoticed buys are “leaks” that tracking helps you catch.' }
      ]
    },

    // ---------------- Money Builders (6–8) — more ----------------
    {
      id: 'what-is-stock', band: 'builders', emoji: '📊', title: 'What’s a Stock?',
      blurb: 'Owning a tiny slice of a real company.',
      steps: [
        { t: 'A stock is a piece of a company', b: 'Companies sometimes sell small pieces of themselves, called shares of stock, to raise money to grow. When you buy a share, you become a part-owner of that company — even if it’s a huge one.' },
        { t: 'How you can gain (or lose)', b: 'If the company does well and becomes more valuable, your share can be worth more than you paid. If it struggles, your share can be worth less. So stocks can go up AND down — there’s reward, but also risk.', tip: 'A stock isn’t a magic money machine — it’s part-ownership that rises and falls with the business.' },
        { t: 'Why people invest', b: 'Over long periods, owning stocks has historically grown money faster than a savings account — which is why patient, careful investing is a big part of building wealth. The key words are patient and careful.' }
      ],
      quiz: [
        { q: 'When you buy a share of stock, you…', choices: ['Lend the company money for a year', 'Own a small piece of the company', 'Get free products'], a: 1, why: 'A share makes you a part-owner of the company.' },
        { q: 'Stocks are different from a savings account because they…', choices: ['Can go up AND down in value', 'Never change', 'Are guaranteed to grow'], a: 0, why: 'Stocks carry risk — they can rise or fall.' }
      ],
      apply: { label: 'Buy your first shares in Stable Street →', hash: '#game/market' }
    },
    {
      id: 'risk-reward', band: 'builders', emoji: '⚖️', title: 'Risk & Reward',
      blurb: 'Bigger possible reward usually means bigger risk.',
      steps: [
        { t: 'Safe vs. risky', b: 'Some places to put money are very safe but grow slowly (a savings account). Others can grow faster but might lose value (stocks, a new business). Usually, the bigger the possible reward, the bigger the risk.' },
        { t: 'Don’t bet it all on one thing', b: 'The smartest way to handle risk is to spread your money out — this is called diversifying. If you own many different things, one bad surprise can’t wipe you out. Never put money you NEED soon into something risky.', tip: 'Spreading money across many investments (diversifying) is the #1 way to tame risk.' },
        { t: 'Match risk to time', b: 'Money you need next month should be safe. Money you won’t touch for decades can take more risk, because it has time to recover from dips. Time changes how much risk makes sense.' }
      ],
      quiz: [
        { q: 'In general, an investment with a bigger possible reward also has…', choices: ['Bigger risk', 'No risk', 'Guaranteed returns'], a: 0, why: 'Higher potential reward almost always comes with higher risk.' },
        { q: 'The best way to lower risk is to…', choices: ['Put everything in one hot pick', 'Spread money across many investments', 'Never save at all'], a: 1, why: 'Diversifying protects you when one thing goes wrong.' }
      ]
    },

    // ---------------- Money Trailblazers (9–12) — more ----------------
    {
      id: 'build-credit', band: 'trailblazers', emoji: '🧱', title: 'Building Credit',
      blurb: 'How to earn a good reputation with lenders.',
      steps: [
        { t: 'Credit is trust you build', b: 'A credit history is a record of borrowing small amounts and paying them back on time. Start with none, and lenders don’t know if they can trust you — so building a good history early really pays off.' },
        { t: 'How to build it well', b: 'Common first steps as a young adult: a starter credit card used for small purchases and paid off IN FULL every month, or being added to a parent’s account. The golden rule is never spend more than you can pay back, and always pay on time.', tip: 'Use credit lightly, pay in full and on time — that’s how a strong score is built.' },
        { t: 'Why it’s worth the effort', b: 'A strong credit history unlocks lower interest rates on cars and homes, easier apartment rentals, even better deals — potentially saving you tens of thousands of dollars over your life. It’s a reputation worth protecting.' }
      ],
      quiz: [
        { q: 'The best way to build good credit with a starter card is to…', choices: ['Max it out', 'Make small purchases and pay it off in full, on time', 'Never pay it'], a: 1, why: 'Small charges paid in full and on time build a strong history.' },
        { q: 'A strong credit history helps you get…', choices: ['Higher interest rates', 'Lower interest rates and better deals', 'Nothing useful'], a: 1, why: 'Good credit earns lower rates — big lifetime savings.' }
      ]
    },
    {
      id: 'net-worth', band: 'trailblazers', emoji: '📈', title: 'Net Worth',
      blurb: 'The one number that shows your financial health.',
      steps: [
        { t: 'Assets minus debts', b: 'Net worth is simple: everything you OWN that has value (assets — cash, savings, investments) minus everything you OWE (debts — loans, credit-card balances). What’s left is your net worth.' },
        { t: 'Growing the number', b: 'You grow net worth two ways: increase what you own (save and invest more) or decrease what you owe (pay down debt). Do both steadily and the number climbs — that’s literally what building wealth means.', tip: 'Wealth isn’t how much you earn — it’s how much you keep. Net worth measures that.' },
        { t: 'A high income isn’t enough', b: 'Someone can earn a lot but owe even more and have a negative net worth. Someone with a modest income who saves steadily can build a positive one. The habits matter more than the paycheck.' }
      ],
      quiz: [
        { q: 'Net worth is…', choices: ['Your yearly salary', 'What you own minus what you owe', 'The cash in your pocket'], a: 1, why: 'Net worth = assets − debts.' },
        { q: 'You can raise your net worth by…', choices: ['Only earning more', 'Owning more and/or owing less', 'Borrowing more'], a: 1, why: 'Grow assets, shrink debts — either raises net worth.' }
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
          <button class="btn green" id="fin-next">${stepI < u.steps.length - 1 ? 'Next →' : (u.sim ? '🧪 Try it yourself →' : 'Check what you learned →')}</button>
        </div>`);
      const nx = document.getElementById('fin-next'), pv = document.getElementById('fin-prev');
      nx.onclick = () => { if (stepI < u.steps.length - 1) { stepI++; renderLearn(); } else if (u.sim) { phase = 'sim'; renderSim(); } else { phase = 'quiz'; quizI = 0; renderQuiz(); } };
      if (pv) pv.onclick = () => { if (stepI > 0) { stepI--; renderLearn(); } };
    }

    // Interactive money mini-sims — let kids play with the numbers before the quiz. Each sim is
    // self-contained; inputs live-update an output. "Continue" moves on to the checks.
    function renderSim() {
      const money = n => '$' + (Math.round(n * 100) / 100).toLocaleString('en-US', { minimumFractionDigits: (n % 1 ? 2 : 0), maximumFractionDigits: 2 });
      const wrap = inner => shell(`
        <div class="sk-bar" style="height:8px;margin:12px 0 16px"><span class="sk-fill hi" style="width:70%;background:${b.color}"></span></div>
        <h3 style="margin:0 0 4px;color:${b.color}">🧪 Try it yourself</h3>
        <p class="muted" style="margin:0 0 14px;font-size:.9rem">Slide the numbers and watch what happens — this is the idea in action.</p>
        ${inner}
        <div style="text-align:right;margin-top:18px"><button class="btn green" id="fin-simdone">Continue →</button></div>`);
      const sty = 'width:100%;margin:6px 0 2px';
      const outBox = 'background:#f2faf4;border:1px solid #cfe8d8;border-radius:12px;padding:14px 16px;margin-top:14px;text-align:center';

      if (u.sim === 'compound') {
        wrap(`
          <label>Starting amount: <b id="s-amt">$1,000</b></label>
          <input type="range" id="i-amt" min="100" max="10000" step="100" value="1000" style="${sty}">
          <label>Years of growth: <b id="s-yrs">20</b></label>
          <input type="range" id="i-yrs" min="1" max="40" step="1" value="20" style="${sty}">
          <label>Interest rate: <b id="s-rate">7%</b></label>
          <input type="range" id="i-rate" min="1" max="12" step="1" value="7" style="${sty}">
          <div id="s-out" style="${outBox}"></div>`);
        const calc = () => {
          const P = +document.getElementById('i-amt').value, y = +document.getElementById('i-yrs').value, r = +document.getElementById('i-rate').value / 100;
          const fv = P * Math.pow(1 + r, y); const growth = fv - P;
          document.getElementById('s-amt').textContent = money(P);
          document.getElementById('s-yrs').textContent = y;
          document.getElementById('s-rate').textContent = r * 100 + '%';
          const mult = (fv / P);
          document.getElementById('s-out').innerHTML = `Grows to <b style="font-size:1.5rem;color:${b.color}">${money(fv)}</b><br><span class="muted">You added ${money(P)} and earned <b>${money(growth)}</b> in interest — your money ${mult >= 2 ? 'more than ' + (mult >= 3 ? 'tripled' : 'doubled') : 'grew'} without you lifting a finger.</span>`;
        };
        ['i-amt', 'i-yrs', 'i-rate'].forEach(id => document.getElementById(id).addEventListener('input', calc)); calc();

      } else if (u.sim === 'budget') {
        wrap(`
          <p style="margin:0 0 6px">You get <b>$50</b> this week. Split it into Save, Spend, and Give:</p>
          <label>💰 Save: <b id="s-save">$15</b></label>
          <input type="range" id="i-save" min="0" max="50" step="1" value="15" style="${sty}">
          <label>❤️ Give: <b id="s-give">$5</b></label>
          <input type="range" id="i-give" min="0" max="25" step="1" value="5" style="${sty}">
          <div id="s-out" style="${outBox}"></div>`);
        const calc = () => {
          let save = +document.getElementById('i-save').value, give = +document.getElementById('i-give').value;
          if (save + give > 50) { give = Math.max(0, 50 - save); document.getElementById('i-give').value = give; }
          const spend = 50 - save - give;
          document.getElementById('s-save').textContent = money(save);
          document.getElementById('s-give').textContent = money(give);
          const pct = Math.round(save / 50 * 100);
          document.getElementById('s-out').innerHTML = `Save <b>${money(save)}</b> · Spend <b>${money(spend)}</b> · Give <b>${money(give)}</b><br><span class="muted">${pct >= 20 ? '🌟 You’re saving ' + pct + '% — that’s a fantastic habit!' : 'You’re saving ' + pct + '%. Even a little adds up — try nudging Save up.'}</span>`;
        };
        ['i-save', 'i-give'].forEach(id => document.getElementById(id).addEventListener('input', calc)); calc();

      } else if (u.sim === 'goal') {
        wrap(`
          <label>🎯 Goal price: <b id="s-goal">$120</b></label>
          <input type="range" id="i-goal" min="10" max="500" step="5" value="120" style="${sty}">
          <label>💵 Save each week: <b id="s-week">$10</b></label>
          <input type="range" id="i-week" min="1" max="50" step="1" value="10" style="${sty}">
          <div id="s-out" style="${outBox}"></div>`);
        const calc = () => {
          const g = +document.getElementById('i-goal').value, w = +document.getElementById('i-week').value;
          const weeks = Math.ceil(g / w); const months = Math.round(weeks / 4.345 * 10) / 10;
          document.getElementById('s-goal').textContent = money(g);
          document.getElementById('s-week').textContent = money(w);
          document.getElementById('s-out').innerHTML = `Reach your goal in <b style="font-size:1.5rem;color:${b.color}">${weeks} week${weeks === 1 ? '' : 's'}</b><br><span class="muted">That’s about ${months} month${months === 1 ? '' : 's'}. Save more each week and the finish line comes sooner!</span>`;
        };
        ['i-goal', 'i-week'].forEach(id => document.getElementById(id).addEventListener('input', calc)); calc();

      } else if (u.sim === 'profit') {
        wrap(`
          <p style="margin:0 0 6px">Each cup costs you <b>$0.50</b> to make. You decide the rest:</p>
          <label>🏷️ Price per cup: <b id="s-price">$1.00</b></label>
          <input type="range" id="i-price" min="0.25" max="3" step="0.25" value="1" style="${sty}">
          <label>🥤 Cups sold: <b id="s-cups">40</b></label>
          <input type="range" id="i-cups" min="0" max="100" step="5" value="40" style="${sty}">
          <div id="s-out" style="${outBox}"></div>`);
        const calc = () => {
          const price = +document.getElementById('i-price').value, cups = +document.getElementById('i-cups').value;
          const rev = price * cups, cost = 0.5 * cups, profit = rev - cost;
          document.getElementById('s-price').textContent = money(price);
          document.getElementById('s-cups').textContent = cups;
          document.getElementById('s-out').innerHTML = `Revenue ${money(rev)} − Costs ${money(cost)} = <b style="font-size:1.5rem;color:${profit >= 0 ? b.color : '#c0392b'}">${money(profit)} profit</b><br><span class="muted">${profit <= 0 ? 'Ouch — you’re not making money. Raise the price or sell more.' : 'Nice! Try raising the price or selling more — but if the price gets too high, fewer people buy.'}</span>`;
        };
        ['i-price', 'i-cups'].forEach(id => document.getElementById(id).addEventListener('input', calc)); calc();

      } else { phase = 'quiz'; quizI = 0; renderQuiz(); return; }

      const d = document.getElementById('fin-simdone'); if (d) d.onclick = () => { phase = 'quiz'; quizI = 0; renderQuiz(); };
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

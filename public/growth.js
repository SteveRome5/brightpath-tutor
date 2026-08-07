/* Gallop Growth Skills — an OPTIONAL, grade-banded "learning dispositions" course told through
   short stories. A relatable character faces a common learning challenge (giving up, getting
   distracted, disorganization, negative self-talk, handling mistakes), feels the consequence, and
   learns a real strategy — so a child who struggles with the same thing sees themselves and picks
   up the fix (a research-backed "social narrative" approach; facts and habits stick better in a
   story). Deliberately UNIVERSAL and non-clinical: no diagnoses or disorder labels — just the
   everyday challenges every learner faces. Self-contained; does NOT touch the four core subjects,
   placement, or the Gallop Score. Progress + a "How am I doing as a learner?" self-assessment are
   saved server-side via the generic game-state store ('growth'). */
(function () {
  if (!window.BP) return;
  const { app, esc, api, route, State, Sound, Confetti, topbar, wireChrome } = window.BP;
  const kid = () => (State.me && State.me.kid) || {};
  const kidId = () => kid().id;

  const BANDS = [
    { id: 'sprouts', label: 'Little Sprouts', grades: 'K–2', lo: 0, hi: 2, color: '#37a05f', emoji: '🌱' },
    { id: 'roots', label: 'Growing Roots', grades: '3–5', lo: 3, hi: 5, color: '#2f8fd6', emoji: '🌿' },
    { id: 'strong', label: 'Building Strong', grades: '6–8', lo: 6, hi: 8, color: '#8a5cd6', emoji: '💪' },
    { id: 'trail', label: 'Trailblazers', grades: '9–12', lo: 9, hi: 12, color: '#d68a2f', emoji: '🚀' }
  ];

  // Each unit: a short story (steps) then a reflection check (quiz). `skill` names the disposition.
  const UNITS = [
    // ---------------- Little Sprouts (K–2) ----------------
    {
      id: 'keep-trying', band: 'sprouts', emoji: '🧩', title: 'Keep Trying', skill: 'Persistence',
      blurb: 'Mila and the tricky puzzle.',
      trueStory: { who: 'Thomas Edison', what: 'Inventor of the lightbulb', text: 'Long ago, Thomas Edison wanted to make a lightbulb that would glow and glow. But it kept not working — again and again and again! Did he give up? No way. He said every try that <b>didn’t</b> work just showed him one more way to fix it. After lots and lots of tries, his lightbulb finally lit up — and it helped light up the whole world.', tie: 'Just like Mila and her puzzle, Edison kept trying until it worked.' },
      trueQ: { q: 'In the true story, what did Edison do when the lightbulb kept not working?', choices: ['He gave up', 'He kept trying and fixed it little by little', 'He bought one from a store'], a: 1, why: 'Right — the story says he kept trying, and every try showed him how to fix it.' },
      steps: [
        { t: 'The tricky puzzle', b: 'Mila loved puzzles — until she got a really hard one. The pieces didn’t fit right away, and her tummy felt frustrated. "I CAN’T do this!" she said, and pushed the box away.' },
        { t: 'A little voice', b: 'Her teacher smiled and said, "You can’t do it… <b>yet</b>. Hard things take more than one try. What if you try just one more piece?" Mila took a big breath and tried again.', tip: 'When something is hard, adding the word "yet" turns "I can’t" into "I’m still learning."' },
        { t: 'One piece at a time', b: 'One piece fit. Then another. Little by little, the puzzle came together. Mila didn’t finish it because it was easy — she finished it because she <b>kept trying</b>. That felt even better than easy.' }
      ],
      quiz: [
        { q: 'What helped Mila finish the puzzle?', choices: ['She gave up', 'She kept trying, one piece at a time', 'Someone did it for her'], a: 1, why: 'Yes — she kept going even when it was hard. That’s persistence!' },
        { q: 'Next time something is hard for YOU, you could say…', choices: ['"I can’t do this."', '"I can’t do this… yet!"', '"I quit."'], a: 1, why: 'Adding "yet" reminds you that you’re still learning — and can get there.' }
      ]
    },
    {
      id: 'mistakes-grow', band: 'sprouts', emoji: '🌱', title: 'Mistakes Help Me Grow', skill: 'Growth mindset',
      blurb: 'Sam’s wobbly tower.',
      trueStory: { who: 'Frank Epperson', what: 'Invented the Popsicle — by accident!', text: 'When Frank was just <b>11 years old</b>, he left a cup of fruity soda outside on a cold night — with the stirring stick still in it. Oops! By morning it had frozen solid. Instead of feeling bad about his little mistake, Frank pulled it out by the stick, gave it a lick… and loved it! That frozen “mistake” became the Popsicle that kids everywhere enjoy today.', tie: 'Frank’s mistake turned into something wonderful — just like Sam learned, mistakes can help us grow.' },
      trueQ: { q: 'How did Frank Epperson invent the Popsicle?', choices: ['On purpose, in a big factory', 'By accident, when his drink froze overnight', 'He found the recipe in a book'], a: 1, why: 'Yes — he left his drink outside on a cold night and it froze by accident.' },
      steps: [
        { t: 'Crash!', b: 'Sam built a tall block tower — and CRASH, it fell over. He felt like giving up. "I’m bad at building," he grumbled.' },
        { t: 'What the crash taught him', b: 'His big sister said, "That’s not a fail — that’s a clue! Why did it fall?" Sam looked. The bottom blocks were too small. The crash <b>taught</b> him something.', tip: 'A mistake isn’t proof you’re bad at something. It’s a clue that helps you get better.' },
        { t: 'Try two', b: 'Sam put big, strong blocks on the bottom this time. The tower stood tall! His brain grew a little bit stronger — because mistakes help us grow.' }
      ],
      quiz: [
        { q: 'What did Sam’s mistake give him?', choices: ['A reason to quit', 'A clue about how to do better', 'Nothing at all'], a: 1, why: 'Right — the crash showed him what to fix. Mistakes are clues!' },
        { q: 'When you make a mistake, a good question is…', choices: ['"What can this teach me?"', '"Why am I so bad?"', '"Should I quit?"'], a: 0, why: 'Asking what it teaches you turns a mistake into a step forward.' }
      ]
    },
    {
      id: 'big-feelings', band: 'sprouts', emoji: '🌊', title: 'When Feelings Get Big', skill: 'Calming down',
      blurb: 'Ben takes a breath.',
      steps: [
        { t: 'A big wave', b: 'Ben was coloring when his marker ran out. A big, hot wave of frustration rushed up. He wanted to scribble all over the page.' },
        { t: 'Stop and breathe', b: 'Ben remembered his teacher’s trick: "When a big feeling comes, stop and take three slow breaths — smell the flower, blow out the candle." He breathed in… and out… three times.', tip: 'Big feelings are normal. Slow breaths help your calm brain come back so you can think.' },
        { t: 'Calm again', b: 'The hot wave got smaller. Now Ben could think. He asked for a new marker and kept coloring. His picture turned out great — and so did his afternoon.' }
      ],
      quiz: [
        { q: 'What did Ben do when the big feeling came?', choices: ['Scribbled everywhere', 'Took three slow breaths to calm down', 'Threw the markers'], a: 1, why: 'Slow breaths helped his calm brain come back. Great choice!' },
        { q: 'Big feelings are…', choices: ['Something to be ashamed of', 'Normal — everyone has them', 'Only for little kids'], a: 1, why: 'Everyone has big feelings. The skill is learning to calm them.' }
      ]
    },
    {
      id: 'ask-for-help', band: 'sprouts', emoji: '🙋', title: 'It’s Okay to Ask', skill: 'Asking for help',
      blurb: 'Ruby raises her hand.',
      steps: [
        { t: 'Stuck and quiet', b: 'Ruby didn’t understand the math, but she was scared to ask. "What if everyone thinks I’m not smart?" she worried. So she sat quietly, feeling more and more lost.' },
        { t: 'Brave hand up', b: 'Finally Ruby raised her hand. "Can you show me again?" she asked. Guess what? Three other kids were confused too — they were just as glad she asked!', tip: 'Asking for help isn’t a sign you’re not smart. It’s how smart people get unstuck.' },
        { t: 'Unstuck!', b: 'The teacher explained it a new way, and it clicked. Ruby felt proud — not because she knew everything, but because she was <b>brave enough to ask</b>.' }
      ],
      quiz: [
        { q: 'What happened when Ruby asked for help?', choices: ['Everyone laughed', 'She got unstuck — and others were glad too', 'She got in trouble'], a: 1, why: 'Asking got her unstuck, and it helped other kids too!' },
        { q: 'Asking for help means…', choices: ['You’re not smart', 'You’re smart enough to get unstuck', 'You should feel bad'], a: 1, why: 'Asking is exactly how smart learners get unstuck.' }
      ]
    },

    // ---------------- Growing Roots (3–5) ----------------
    {
      id: 'power-of-yet', band: 'roots', emoji: '💡', title: 'The Power of Yet', skill: 'Growth mindset',
      blurb: 'Ava and long division.',
      trueStory: { who: 'The Wright Brothers', what: 'Built the first airplane that flew', text: 'Orville and Wilbur Wright believed people could fly — even when almost everyone said it was impossible. Their flying machines wobbled, stalled, and crashed, over and over. But they never said “we can’t fly.” They said “we can’t fly <b>yet</b>,” and fixed one problem at a time. In 1903, their plane finally lifted off the ground — the first real flight in history.', tie: 'The word “yet” carried them from crash after crash all the way into the sky.' },
      trueQ: { q: 'According to the true story, what happened before the Wright brothers flew in 1903?', choices: ['They flew on their very first try', 'Their machines crashed many times first', 'They gave up on flying'], a: 1, why: 'Correct — their machines wobbled and crashed many times before that first flight.' },
      steps: [
        { t: '"I’m just not a math person"', b: 'Ava stared at the long-division problem and felt her face get hot. "I’m just not a math person," she told herself, and stopped trying. When you believe you <b>can’t</b>, your brain stops looking for a way.' },
        { t: 'Rewiring the thought', b: 'Her teacher taught her a swap: change "I can’t do this" to "I can’t do this <b>yet</b>." That tiny word tells your brain the door is still open — you just haven’t found the key.', tip: 'Your brain grows like a muscle. "Yet" keeps it working instead of quitting.' },
        { t: 'The click', b: 'Ava practiced a few more, made some mistakes, fixed them — and suddenly it clicked. She wasn’t a different person. She’d just kept going long enough for her brain to grow.' }
      ],
      quiz: [
        { q: 'Why does "yet" help?', choices: ['It’s a magic word', 'It tells your brain to keep working instead of quitting', 'It makes problems easier'], a: 1, why: 'Exactly — "yet" keeps your brain in the game so it can grow.' },
        { q: 'Ava succeeded because she…', choices: ['Was born a "math person"', 'Kept going long enough to learn it', 'Got lucky'], a: 1, why: 'Ability grows with effort — she kept going and it clicked.' }
      ]
    },
    {
      id: 'beat-distraction', band: 'roots', emoji: '🎯', title: 'Beat the Distraction', skill: 'Focus',
      blurb: 'Leo and the buzzing brain.',
      steps: [
        { t: 'A hundred pings', b: 'Leo sat down to do homework, but his brain buzzed everywhere — his tablet lit up, a toy caught his eye, he wondered what’s for dinner. An hour passed and barely anything was done. He felt frustrated with himself.' },
        { t: 'Clear the runway', b: 'His dad helped him set up a "focus zone": phone in another room, desk cleared of toys, a timer set for 15 minutes of just-work. "You don’t have to focus forever," he said, "just till the timer beeps."', tip: 'You can’t "try harder" to focus in a room full of distractions. Remove the distractions first.' },
        { t: 'Beep!', b: 'With the buzzing stuff gone, Leo actually got into his work. When the timer beeped, he’d finished more in 15 focused minutes than the whole hour before. Focus isn’t magic — it’s a setup.' }
      ],
      quiz: [
        { q: 'What was the real fix for Leo’s focus?', choices: ['Just trying harder', 'Removing the distractions and using a timer', 'Working longer'], a: 1, why: 'Right — he changed his setup instead of just "trying harder."' },
        { q: 'A good focus trick is…', choices: ['Keep your phone right next to you', 'Clear distractions and work in short timed bursts', 'Do homework in front of the TV'], a: 1, why: 'Clearing distractions + short bursts beats willpower alone.' }
      ]
    },
    {
      id: 'get-organized', band: 'roots', emoji: '🗂️', title: 'Where Did It Go?', skill: 'Organization',
      blurb: 'Priya’s missing homework.',
      steps: [
        { t: 'The crumpled mess', b: 'Priya <b>did</b> her homework — but at school she couldn’t find it. It was crumpled somewhere in her overflowing backpack. She got a zero on work she’d actually finished. So unfair… and so frustrating.' },
        { t: 'A home for everything', b: 'She started a simple system: one folder for "to do," one for "done," and a 30-second nightly check — pack tomorrow’s things by the door. Being organized isn’t about being neat; it’s about not <b>losing</b> what you worked for.', tip: 'A simple system beats a great memory. Give every important thing a home.' },
        { t: 'Found it — every time', b: 'Now Priya’s finished work actually made it to school. Same effort, but it finally counted. A little organization saved her grades and her mornings.' }
      ],
      quiz: [
        { q: 'What was Priya’s real problem?', choices: ['She didn’t do the work', 'She lost the work she did — no system', 'She wasn’t smart'], a: 1, why: 'She did the work but lost it. A system fixed that.' },
        { q: 'Being organized is really about…', choices: ['Being perfectly neat', 'Not losing what you worked for', 'Having a fancy backpack'], a: 1, why: 'A simple system keeps your effort from getting lost.' }
      ]
    },
    {
      id: 'kind-self-talk', band: 'roots', emoji: '🗣️', title: 'Talk Kindly to Yourself', skill: 'Positive self-talk',
      blurb: 'Marcus and the mean voice.',
      steps: [
        { t: 'The mean voice', b: 'When Marcus missed a shot or missed a question, a mean voice in his head said, "You’re so dumb. You always mess up." The more he said it, the worse he played and the less he tried.' },
        { t: 'Be your own coach', b: 'His coach asked, "Would you say that to a teammate?" "No way," said Marcus. "Then don’t say it to yourself. Talk to yourself like a good coach would." Marcus swapped "I’m dumb" for "That’s okay — what can I fix?"', tip: 'The voice in your head is powerful. Talk to yourself like someone you’re rooting for.' },
        { t: 'A better game', b: 'With a kinder voice, Marcus stayed calm, learned from misses, and played better. Same kid — different self-talk. Words really do change what we can do.' }
      ],
      quiz: [
        { q: 'What changed for Marcus?', choices: ['He got a new brain', 'He swapped mean self-talk for kind, coach-like self-talk', 'He stopped playing'], a: 1, why: 'Kinder self-talk kept him calm and improving. Words matter!' },
        { q: 'A good test for self-talk is…', choices: ['"Would I say this to a friend?"', '"Does it sound tough?"', '"Is it loud enough?"'], a: 0, why: 'If you wouldn’t say it to a friend, don’t say it to yourself.' }
      ]
    },

    // ---------------- Building Strong (6–8) ----------------
    {
      id: 'grit', band: 'strong', emoji: '🏔️', title: 'Finish What’s Hard', skill: 'Grit',
      blurb: 'Diego and the science project.',
      trueStory: { who: 'James Dyson', what: 'Inventor and engineer', text: 'James Dyson wanted to build a better vacuum cleaner — one that never lost its suction. His first design failed. So did the next. In fact, he built <b>5,127</b> prototypes over about 15 years, and 5,126 of them didn’t work. He kept refining each one, learning from every flop, until finally number 5,127 worked. Today Dyson products are sold all over the world.', tie: 'Grit means finishing what’s hard — even when it takes 5,127 tries.' },
      trueQ: { q: 'About how many prototypes did James Dyson build before one finally worked?', choices: ['About 5', 'About 50', 'About 5,127'], a: 2, why: 'Right — he built 5,127, and 5,126 of them failed before the last one worked.' },
      steps: [
        { t: 'The messy middle', b: 'Diego started his science project excited. But halfway through, it got hard and boring — the "messy middle." He wanted to quit and do something easy instead. Almost everyone quits things right here.' },
        { t: 'Shrink the mountain', b: 'Instead of quitting, Diego broke the rest into tiny steps: "just do the graph tonight." A mountain feels impossible; one step feels doable. Grit isn’t doing it all at once — it’s taking the next small step, again and again.', tip: 'The messy middle is where most people quit. Break it into one small next step and keep moving.' },
        { t: 'Across the finish', b: 'Step by step, Diego finished — and his project was one of the best because he’d pushed through the part where others gave up. The reward for grit is on the other side of hard.' }
      ],
      quiz: [
        { q: 'Where do most people quit?', choices: ['At the very start', 'In the hard, boring "messy middle"', 'At the finish line'], a: 1, why: 'The messy middle is the danger zone. Push through it!' },
        { q: 'Diego’s trick for grit was…', choices: ['Do everything at once', 'Break it into one small next step', 'Wait for motivation'], a: 1, why: 'One small step at a time carries you through the hard part.' }
      ]
    },
    {
      id: 'time-management', band: 'strong', emoji: '⏰', title: 'Beat the Deadline', skill: 'Time management',
      blurb: 'Sophie stops cramming.',
      steps: [
        { t: 'The night-before panic', b: 'Sophie had two weeks for her essay, but "later" kept winning. The night before, she was up late, stressed, and rushing. The work showed it. Waiting didn’t make the task smaller — just scarier.' },
        { t: 'Chunk it and schedule it', b: 'She tried a new way: break the big task into chunks and give each a day — "Monday: outline. Wednesday: two paragraphs." A little each day beats a mountain the night before. She even set phone reminders.', tip: 'Big tasks don’t get done in one heroic night. They get done a little at a time, on a plan.' },
        { t: 'Calm and done', b: 'Next essay, Sophie followed her plan. She finished a day early, stress-free, with better work. Managing time isn’t about doing more — it’s about starting sooner, in small pieces.' }
      ],
      quiz: [
        { q: 'Why did cramming hurt Sophie?', choices: ['Waiting made the task bigger and scarier, and the work worse', 'Two weeks wasn’t enough time', 'Essays are impossible'], a: 0, why: 'Putting it off made it harder and lower-quality. Start sooner!' },
        { q: 'The better strategy was to…', choices: ['Do it all the night before', 'Break it into chunks across several days', 'Skip the outline'], a: 1, why: 'A little each day beats one panicked night.' }
      ]
    },
    {
      id: 'bounce-back', band: 'strong', emoji: '🏀', title: 'Bounce Back', skill: 'Resilience',
      blurb: 'Andre fails a test.',
      trueStory: { who: 'Michael Jordan', what: 'One of the greatest basketball players ever', text: 'As a sophomore, Michael Jordan tried out for his high school’s <b>varsity</b> team — and didn’t make it. He was placed on the junior varsity team instead, and he was crushed. But he used that disappointment as fuel: he practiced relentlessly, made varsity the next year, and went on to become an NBA legend. He later said, “I’ve failed over and over and over again in my life — and that is why I succeed.”', tie: 'Jordan treated a setback as a reason to work harder, not a final verdict — exactly like bouncing back.' },
      trueQ: { q: 'What did Michael Jordan do after he didn’t make the varsity team?', choices: ['He quit basketball', 'He practiced hard and made it the next year', 'He switched to another sport'], a: 1, why: 'Yes — he used it as motivation, practiced relentlessly, and made varsity the next year.' },
      steps: [
        { t: 'A rough grade', b: 'Andre studied but still bombed the math test. He felt crushed and embarrassed. His first thought: "I’m just bad at this. Why bother?" A setback can feel like the end of the story.' },
        { t: 'A setback is data', b: 'His teacher helped him look at WHICH problems he missed — they were all one type. The failure wasn’t proof he was "bad." It was a map showing exactly what to practice. Resilient people treat a setback as information, not a verdict.', tip: 'A bad result isn’t "you’re bad at this." It’s a signal showing you what to work on next.' },
        { t: 'The comeback', b: 'Andre practiced that one type of problem for a week. On the retake, he crushed it. The failure hadn’t stopped him — it had shown him the way. That’s bouncing back.' }
      ],
      quiz: [
        { q: 'How did Andre use his failed test?', choices: ['As proof he was bad at math', 'As a map of exactly what to practice', 'As a reason to quit'], a: 1, why: 'He treated the setback as useful information. That’s resilience.' },
        { q: 'A resilient mindset says a setback is…', choices: ['A final verdict', 'Information about what to improve', 'Something to hide'], a: 1, why: 'Setbacks are data, not destiny.' }
      ]
    },
    {
      id: 'know-yourself', band: 'strong', emoji: '🔍', title: 'Know How You Work', skill: 'Self-awareness',
      blurb: 'Zoe finds her best setup.',
      steps: [
        { t: 'Copying didn’t work', b: 'Zoe’s friend studied late at night with music on, so Zoe tried it too — and it flopped. She was exhausted and remembered nothing. What worked for her friend didn’t work for her.' },
        { t: 'Become your own scientist', b: 'Zoe started paying attention to herself: she focused best in the morning, in quiet, in short bursts. Knowing your own patterns — when and how YOU work best — is a superpower called self-awareness.', tip: 'There’s no one "right" way to learn. The skill is noticing what works for YOU.' },
        { t: 'Playing to her strengths', b: 'Zoe moved her hardest studying to mornings in a quiet spot. Same brain, way better results — because she’d learned to work <b>with</b> herself instead of against herself.' }
      ],
      quiz: [
        { q: 'What did Zoe learn?', choices: ['Copy whatever your friends do', 'Notice when and how SHE works best', 'Study only at night'], a: 1, why: 'Self-awareness — knowing your own best setup — is the win.' },
        { q: 'The best way to study is…', choices: ['The same for everyone', 'Whatever genuinely works for you', 'Always with music'], a: 1, why: 'It’s personal — the skill is finding your own formula.' }
      ]
    },

    // ---------------- Trailblazers (9–12) ----------------
    {
      id: 'own-it', band: 'trail', emoji: '🎯', title: 'Own It', skill: 'Responsibility',
      blurb: 'Malik stops blaming.',
      steps: [
        { t: 'Everyone else’s fault', b: 'When Malik’s grade slipped, he had reasons: the teacher was unfair, the assignment was confusing, his group let him down. Blaming felt better in the moment — but it left him powerless, because if it’s all someone else’s fault, there’s nothing HE can change.' },
        { t: 'The powerful question', b: 'A mentor asked him a different question: "Forget whose fault it is — what part is <b>yours</b> to fix?" Owning your piece isn’t about guilt. It’s the only thing that puts YOU back in control.', tip: 'Blame gives away your power. Ownership hands it back — you can only change what you own.' },
        { t: 'Back in the driver’s seat', b: 'Malik owned his part: he’d started late and hadn’t asked questions. He changed those two things — and his grades, and his confidence, climbed. Taking responsibility is the most empowering move there is.' }
      ],
      quiz: [
        { q: 'Why did blaming leave Malik stuck?', choices: ['Blame is against the rules', 'If it’s all others’ fault, there’s nothing he can change', 'His teacher found out'], a: 1, why: 'Blame gives away your power. Ownership is how you take control.' },
        { q: 'Taking responsibility mainly gives you…', choices: ['Guilt', 'Power to actually change things', 'An excuse'], a: 1, why: 'You can only improve what you take ownership of.' }
      ]
    },
    {
      id: 'deep-work', band: 'trail', emoji: '🧠', title: 'Beat Procrastination', skill: 'Focus & deep work',
      blurb: 'Nina and the endless scroll.',
      steps: [
        { t: 'Busy but not productive', b: 'Nina "studied" for three hours — but really she checked her phone every few minutes, half-watching a show. She felt busy and tired, yet barely learned anything. Divided attention is the enemy of real work.' },
        { t: 'Deep-work blocks', b: 'She tried a proven method: phone in another room, one clear task, a 25-minute timer of total focus, then a 5-minute break. Repeat. Fewer, deeper blocks beat hours of distracted "studying."', tip: 'Two focused hours beat six distracted ones. Protect your attention like it’s valuable — because it is.' },
        { t: 'More done, more free time', b: 'Nina finished the same work in half the time — and actually understood it. Beating procrastination gave her better grades AND more free time. Focus is a skill you can train.' }
      ],
      quiz: [
        { q: 'Why did Nina’s three "busy" hours fail?', choices: ['Three hours is too long', 'Her attention was divided by her phone and a show', 'She studied the wrong subject'], a: 1, why: 'Divided attention kills real learning. Deep focus is the fix.' },
        { q: 'The deep-work method uses…', choices: ['Constant multitasking', 'Short blocks of single-task focus with breaks', 'Studying with the TV on'], a: 1, why: 'Focused blocks beat hours of distracted effort.' }
      ]
    },
    {
      id: 'failure-feedback', band: 'trail', emoji: '📈', title: 'Failure Is Feedback', skill: 'Growth from failure',
      blurb: 'Sam bombs a tryout.',
      trueStory: { who: 'Steve Jobs', what: 'Co-founder of Apple', text: 'Steve Jobs helped start Apple in a garage — then, at 30, he was forced out of the very company he had built. It was a public, painful failure. But instead of giving up, he treated it as a fresh start: he founded new companies and learned everything he’d been missing. Years later, Apple brought him back, and he led it to create the iPhone. He called getting fired “the best thing that could have ever happened to me.”', tie: 'Jobs turned his biggest failure into feedback that shaped everything he built next.' },
      trueQ: { q: 'According to the true story, what happened to Steve Jobs at Apple?', choices: ['He was forced out, then years later came back', 'He ran the company the whole time', 'He never actually worked there'], a: 0, why: 'Correct — he was forced out of the company he built, and Apple brought him back years later.' },
      steps: [
        { t: 'The rejection', b: 'Sam didn’t make the team on the first tryout. It stung, and part of him wanted to quit for good so he’d never feel that again. Fear of failing again is what stops most people from trying again.' },
        { t: 'Ask for the notes', b: 'Instead, Sam did something brave: he asked the coach, "What should I work on?" The coach gave specific feedback. Sam realized failure had just handed him a free, personalized improvement plan — if he was willing to use it.', tip: 'Every failure carries feedback. Winners ask "what can I learn?" and go get the notes.' },
        { t: 'The next tryout', b: 'Sam spent months on exactly what the coach named. Next tryout, he made it. The failure hadn’t been the end of his story — it had been the coaching that got him there.' }
      ],
      quiz: [
        { q: 'What made Sam’s comeback possible?', choices: ['Ignoring the failure', 'Asking for feedback and using it', 'Never trying again'], a: 1, why: 'He turned failure into a specific plan by asking for feedback.' },
        { q: 'The mindset "failure is feedback" means…', choices: ['Failing feels good', 'Every setback carries lessons you can use', 'You should avoid all risks'], a: 1, why: 'Setbacks come with information that can make you better.' }
      ]
    },
    {
      id: 'self-advocacy', band: 'trail', emoji: '🗣️', title: 'Speak Up for Yourself', skill: 'Self-advocacy',
      blurb: 'Aisha asks for what she needs.',
      steps: [
        { t: 'Suffering in silence', b: 'Aisha couldn’t see the board well and got lost in a fast-talking class, but she said nothing — she didn’t want to seem like a problem. Her grades slipped for a reason that was totally fixable, if only someone knew.' },
        { t: 'Your needs are worth saying', b: 'She finally emailed her teacher: "I learn better when I can see the notes ahead of time — would that be possible?" Speaking up for what you need isn’t rude or weak; it’s a skill adults use their whole lives. No one can help with a problem they don’t know about.', tip: 'Self-advocacy = calmly telling the right person what you need. It’s a strength, not a burden.' },
        { t: 'Doors open', b: 'The teacher happily shared notes early, and Aisha caught right up. She learned that speaking up — clearly and respectfully — is how you get the support you deserve, in school and beyond.' }
      ],
      quiz: [
        { q: 'What is self-advocacy?', choices: ['Complaining loudly', 'Calmly telling the right person what you need', 'Keeping problems to yourself'], a: 1, why: 'It’s clearly and respectfully asking for what you need.' },
        { q: 'Speaking up for your needs is…', choices: ['A weakness', 'A real strength people use their whole lives', 'Being a problem'], a: 1, why: 'Self-advocacy is a lifelong strength — no one can help with a problem they don’t know about.' }
      ]
    },

    // ============ ROUND 2 — added stories ============

    // ---------------- Little Sprouts (K–2) ----------------
    {
      id: 'really-listen', band: 'sprouts', emoji: '👂', title: 'Really Listen', skill: 'Listening & empathy',
      blurb: 'Theo learns to hear his friend.',
      steps: [
        { t: 'Talking over', b: 'Theo’s friend Kai was telling a story about his lost dog. But Theo kept jumping in — "Guess what happened to ME!" Kai got quieter and quieter, and finally just stopped talking.' },
        { t: 'Ears and heart open', b: 'Theo’s teacher said, "Listening isn’t just waiting for your turn. It’s really hearing your friend — their words AND their feelings." Theo tried again: he looked at Kai, stayed quiet, and asked, "Then what happened?"', tip: 'Real listening means paying attention to how someone feels — not just waiting for your turn to talk.' },
        { t: 'A better friend', b: 'Kai’s face lit up and he finished his story. The two felt closer than ever. Theo learned that really listening is one of the kindest things you can do for someone.' }
      ],
      quiz: [
        { q: 'What did Theo learn about listening?', choices: ['Wait for your turn to talk', 'Really hear your friend’s words AND feelings', 'Talk the loudest'], a: 1, why: 'Yes — real listening means hearing feelings, not just waiting to talk.' },
        { q: 'A good listener…', choices: ['Interrupts a lot', 'Pays attention to how someone feels', 'Changes the subject'], a: 1, why: 'Paying attention to feelings is what makes a great listener.' }
      ]
    },
    {
      id: 'wonder-why', band: 'sprouts', emoji: '🔎', title: 'Wonder Why', skill: 'Curiosity',
      blurb: 'Priya asks big questions.',
      steps: [
        { t: 'So many questions', b: 'Priya always wondered things: Why is the sky blue? How do bees know where to go? Sometimes she felt silly for asking so much. "Do I ask too many questions?" she worried.' },
        { t: 'Questions are superpowers', b: 'Her grandpa laughed kindly. "Every discovery in the world started with someone wondering ‘why?’ Your questions aren’t silly — they’re how smart people learn." Priya smiled.', tip: 'Curiosity — asking "why" and "how" — is how we discover new things. Never stop wondering.' },
        { t: 'The joy of finding out', b: 'Priya and Grandpa looked up why the sky is blue, together. She didn’t just get an answer — she got the thrill of finding out. Her curiosity made the whole world more interesting.' }
      ],
      quiz: [
        { q: 'What did Priya learn about her questions?', choices: ['They were silly', 'They’re how smart people learn and discover', 'She should stop asking'], a: 1, why: 'Right — curiosity and questions are how we discover new things!' },
        { q: 'Being curious means…', choices: ['Knowing everything already', 'Loving to ask why and find out', 'Never wondering'], a: 1, why: 'Curiosity is loving to wonder and find out. It’s a superpower.' }
      ]
    },

    // ---------------- Growing Roots (3–5) ----------------
    {
      id: 'better-together', band: 'roots', emoji: '🤝', title: 'Better Together', skill: 'Teamwork',
      blurb: 'Leo learns to share the work.',
      steps: [
        { t: 'Doing it all alone', b: 'For the group project, Leo tried to do everything himself — he didn’t trust anyone else to do it right. He got stressed and tired, and the project felt like a heavy backpack he carried alone.' },
        { t: 'Everyone has a strength', b: 'His teacher pointed out that Maya was a great artist and Sam loved research. "A team works best when everyone does what they’re good at," she said. Leo let Maya draw and Sam dig up the facts.', tip: 'Great teams don’t just split work evenly — they match each job to what each person does best.' },
        { t: 'A better project — together', b: 'The project turned out better than anything Leo could have made alone, and it was actually fun. He learned that asking teammates to help isn’t weakness — it’s how great things get built.' }
      ],
      quiz: [
        { q: 'Why did the project turn out better?', choices: ['Leo did it all himself', 'Each person did what they were best at', 'They didn’t try'], a: 1, why: 'Teamwork means matching each job to each person’s strength!' },
        { q: 'On a team, it’s smart to…', choices: ['Do everything yourself', 'Use everyone’s different strengths', 'Ignore your teammates'], a: 1, why: 'Using everyone’s strengths is what makes teams powerful.' }
      ]
    },
    {
      id: 'notice-good', band: 'roots', emoji: '☀️', title: 'Notice the Good', skill: 'Gratitude',
      blurb: 'Nina stops comparing.',
      steps: [
        { t: 'The comparison trap', b: 'Nina kept looking at what other kids had — cooler shoes, a bigger house, more likes. The more she compared, the worse she felt, even though nothing bad had actually happened to her.' },
        { t: 'Turn your eyes around', b: 'Her mom taught her a trick: each night, name three good things about YOUR own day. "Comparing looks at what you don’t have. Gratitude notices what you do." Nina decided to try it.', tip: 'Comparing your life to others quietly steals your joy. Noticing what’s good in your own day brings it back.' },
        { t: 'A fuller heart', b: 'After a week of naming good things — a funny joke, a warm dinner, a friend’s laugh — Nina felt happier. Nothing in her life had changed except what she chose to notice.' }
      ],
      quiz: [
        { q: 'What made Nina feel better?', choices: ['Getting cooler stuff', 'Noticing the good she already had', 'Comparing even more'], a: 1, why: 'Gratitude — noticing what’s good in your own life — brings joy back.' },
        { q: 'Comparing yourself to others usually…', choices: ['Makes you happier', 'Steals your joy', 'Helps a lot'], a: 1, why: 'Comparison tends to steal joy; gratitude restores it.' }
      ]
    },

    // ---------------- Strong Branches (6–8) ----------------
    {
      id: 'lead-way', band: 'strong', emoji: '🚀', title: 'Step Up to Lead', skill: 'Leadership',
      blurb: 'Dev learns real leadership.',
      steps: [
        { t: 'Nobody’s moving', b: 'Dev’s group was stuck — everyone waited for someone else to start. Dev thought leadership meant bossing people around, so he stayed quiet, not wanting to be "that guy."' },
        { t: 'Leading is serving', b: 'His coach told him: "A real leader doesn’t boss — they help the group move. Ask what needs doing, notice who’s quiet, give people a first step." Dev tried: "Okay — what if I take notes and Aria starts the outline?"', tip: 'Leadership isn’t about power. It’s about helping a group work together toward something good.' },
        { t: 'The group comes alive', b: 'Once Dev gave people a starting point, the whole group got moving. He didn’t need to be loud or bossy — he just helped everyone find their part. That’s real leadership.' }
      ],
      quiz: [
        { q: 'What is real leadership, according to the coach?', choices: ['Bossing people around', 'Helping a group work together', 'Being the loudest'], a: 1, why: 'Leadership is helping the group move forward together — not bossing.' },
        { q: 'A good leader often…', choices: ['Ignores quiet people', 'Notices who’s quiet and gives them a first step', 'Does everything alone'], a: 1, why: 'Great leaders bring others in and help everyone find their part.' }
      ]
    },
    {
      id: 'stand-tall', band: 'strong', emoji: '🧭', title: 'Stand Tall', skill: 'Integrity',
      blurb: 'Grace does the right thing.',
      steps: [
        { t: 'Everyone’s doing it', b: 'Grace’s friends were making fun of a new kid, laughing. Part of her wanted to join in so she’d fit in. It’s hard to be the only one who says no.' },
        { t: 'Your inner compass', b: 'Grace remembered a question her dad taught her: "Will I feel proud of this later?" Making fun of someone failed that test. She took a breath and said, "Come on — that’s not cool. Let’s include him."', tip: 'Integrity is doing what’s right even when it’s hard or unpopular. Ask yourself: "Will I be proud of this later?"' },
        { t: 'Quietly proud', b: 'A couple of friends looked surprised, but one nodded and agreed. The new kid got included. Grace felt something better than fitting in — she felt proud of who she was.' }
      ],
      quiz: [
        { q: 'How did Grace decide what to do?', choices: ['She did what everyone else did', 'She asked if she’d be proud later', 'She stayed silent'], a: 1, why: 'Integrity means asking "will I be proud later?" — and acting on it.' },
        { q: 'Integrity means…', choices: ['Doing right even when it’s unpopular', 'Always fitting in', 'Following the crowd'], a: 0, why: 'Integrity is doing the right thing even when it’s hard or unpopular.' }
      ]
    },

    // ---------------- Trailblazers (9–12) ----------------
    {
      id: 'create-think', band: 'trail', emoji: '🎨', title: 'Think Different', skill: 'Creative thinking',
      blurb: 'Sofia finds a new angle.',
      steps: [
        { t: 'The obvious answer', b: 'Sofia’s team needed to raise money for a trip, and everyone suggested the same tired idea: a bake sale. It had been done a hundred times and barely worked. Sofia sensed there had to be a better way.' },
        { t: 'Ask a different question', b: 'Instead of "how do we sell baked goods?" Sofia asked, "what do people here actually WANT to pay for?" That reframe opened everything up — a dog-wash day, a talent show, a chore auction. Creative thinking often starts by changing the question.', tip: 'When you’re stuck, don’t just push harder on the obvious idea — change the question you’re asking. New questions reveal new answers.' },
        { t: 'The winning idea', b: 'The team ran a "rent-a-student" chore day and raised triple their goal. The breakthrough didn’t come from working harder on the bake sale — it came from thinking about the problem differently.' }
      ],
      quiz: [
        { q: 'How did Sofia find a better idea?', choices: ['She worked harder on the bake sale', 'She changed the question she was asking', 'She gave up'], a: 1, why: 'Creative thinking often means reframing the question, not forcing the obvious answer.' },
        { q: 'When you’re stuck, a creative move is to…', choices: ['Repeat the obvious idea louder', 'Change the question you’re asking', 'Stop trying'], a: 1, why: 'A new question reveals new answers — that’s creative thinking.' }
      ]
    },
    {
      id: 'see-other-side', band: 'trail', emoji: '🤲', title: 'See the Other Side', skill: 'Empathy',
      blurb: 'Aiden understands before reacting.',
      steps: [
        { t: 'Quick to judge', b: 'A coworker at Aiden’s part-time job kept showing up flustered and short with people. Aiden decided the guy was just rude and started avoiding him, tension building between them.' },
        { t: 'Walk in their shoes', b: 'His manager mentioned the coworker was caring for a sick parent and barely sleeping. Suddenly the "rudeness" looked like exhaustion. Empathy means trying to understand what someone’s going through before deciding who they are.', tip: 'Before judging someone’s behavior, ask what might be going on underneath. Most "difficult" people are carrying something you can’t see.' },
        { t: 'A real connection', b: 'Aiden started with a small kindness — covering a task, a genuine "you doing okay?" The coworker’s guard dropped, and they ended up a real team. Understanding people is a skill that changes everything — at work and in life.' }
      ],
      quiz: [
        { q: 'What changed how Aiden saw his coworker?', choices: ['The coworker got louder', 'Understanding what he was going through', 'Nothing at all'], a: 1, why: 'Empathy — understanding what someone’s dealing with — changed everything.' },
        { q: 'Empathy means…', choices: ['Judging quickly', 'Understanding what someone might be going through', 'Avoiding people'], a: 1, why: 'Empathy is seeking to understand before you judge.' }
      ]
    }
  ];

  // Self-assessment statements (kid-friendly "success habits"), rated 1–5.
  const CHECK_ITEMS = [
    { id: 'effort', t: 'I show up and give my best effort.' },
    { id: 'persist', t: 'I keep going when things get hard.' },
    { id: 'selftalk', t: 'I talk kindly to myself.' },
    { id: 'focus', t: 'I stay focused and handle distractions.' },
    { id: 'mistakes', t: 'I learn from my mistakes instead of giving up.' },
    { id: 'organized', t: 'I stay organized and keep track of my work.' }
  ];

  const bandOf = id => BANDS.find(b => b.id === id) || BANDS[0];
  const unitsInBand = bid => UNITS.filter(u => u.band === bid);

  let PROG = { done: {}, check: null };
  async function loadProgress() {
    try { const r = await api(`/play/${kidId()}/game-state/growth`); if (r && r.state) PROG = { done: r.state.done || {}, check: r.state.check || null }; }
    catch (e) { /* fresh */ }
  }
  async function saveProgress() {
    try { await api(`/play/${kidId()}/game-state/growth`, { method: 'POST', body: { state: PROG } }); } catch (e) {}
  }
  const isDone = id => !!(PROG.done && PROG.done[id]);
  const bandDone = bid => unitsInBand(bid).filter(u => isDone(u.id)).length;
  const bandComplete = bid => { const us = unitsInBand(bid); return us.length > 0 && us.every(u => isDone(u.id)); };
  function homeBand() { const g = kid().grade == null ? 3 : kid().grade; return BANDS.find(b => g >= b.lo && g <= b.hi) || BANDS[0]; }

  // ======================= Course hub =======================
  route('growth', async () => {
    if (State.me.role !== 'kid') { location.hash = '#home'; return; }
    await loadProgress();
    const total = UNITS.length, done = UNITS.filter(u => isDone(u.id)).length;
    const yours = homeBand();
    const ordered = [yours, ...BANDS.filter(b => b.id !== yours.id)];
    const bandBlock = b => {
      const us = unitsInBand(b.id), dn = bandDone(b.id), isYours = b.id === yours.id;
      return `<div class="card" style="margin-top:14px;border-left:5px solid ${b.color}">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <span style="font-size:1.5rem">${b.emoji}</span><b style="font-size:1.05rem">${b.label}</b>
          <span class="muted" style="font-size:.85rem">Grades ${b.grades}</span>
          ${isYours ? `<span class="pill" style="background:${b.color}22;color:${b.color};font-weight:700">Recommended for you</span>` : ''}
          <span class="muted" style="margin-left:auto;font-size:.85rem">${dn}/${us.length} done</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px;margin-top:12px">
          ${us.map(u => `<div class="gr-unit" data-unit="${u.id}" role="button" tabindex="0" style="cursor:pointer;border:1px solid #e7e2d6;border-radius:12px;padding:12px;background:${isDone(u.id) ? '#f2faf4' : '#fff'}">
            <div style="display:flex;align-items:center;gap:8px"><span style="font-size:1.3rem">${u.emoji}</span>${isDone(u.id) ? '<span style="color:#1f8a5f;font-weight:800">✓</span>' : ''}</div>
            <b style="display:block;margin-top:6px">${esc(u.title)}</b>
            <span class="muted" style="font-size:.82rem">${esc(u.blurb)}</span>
            <span style="display:block;margin-top:4px;font-size:.68rem;font-weight:700;color:${b.color};text-transform:uppercase;letter-spacing:.4px">${esc(u.skill)}</span>
          </div>`).join('')}
        </div>
        ${dn === us.length && us.length ? `<div style="margin-top:12px;text-align:center"><button class="btn sun small gr-cert-btn" data-band="${b.id}">🏅 View your ${esc(b.label)} certificate →</button></div>` : ''}
      </div>`;
    };
    const master = UNITS.every(u => isDone(u.id));
    app().innerHTML = topbar(`<div class="container" style="max-width:900px">
      <div class="card" style="text-align:center;background:linear-gradient(180deg,#f6fbff,#fff)">
        <div style="font-size:2rem">🌟</div>
        <h1 style="margin:6px 0 4px">Growth Skills</h1>
        <p class="muted" style="max-width:580px;margin:0 auto">An <b>optional</b> bonus course — short stories about kids who face the same challenges you do (getting stuck, distracted, or discouraged) and the real strategies that help. Become the kind of learner who succeeds.</p>
        <div style="margin-top:12px;max-width:420px;margin-left:auto;margin-right:auto">
          <div class="sk-bar" style="height:12px"><span class="sk-fill hi" style="width:${Math.round(done / total * 100)}%;background:#2f8fd6"></span></div>
          <p class="muted" style="font-size:.82rem;margin:6px 0 0">${done} of ${total} stories complete</p>
        </div>
      </div>
      <div class="card" style="text-align:center;background:linear-gradient(135deg,#f3f0ff,#fff);border:1px solid #e0d8f5">
        <div style="font-size:1.6rem">🪞</div>
        <b>How am I doing as a learner?</b>
        <p class="muted" style="max-width:460px;margin:6px auto 10px;font-size:.88rem">A quick, private self-check. Rate your learning habits and pick one thing to grow. ${PROG.check ? 'You’ve done this before — take it again anytime.' : ''}</p>
        <button class="btn green" id="gr-check-btn">${PROG.check ? 'Retake my self-check' : 'Take my self-check'} →</button>
      </div>
      <div class="card" style="text-align:center">
        <b style="font-size:.95rem">🏅 Your Growth Badges</b>
        <div style="display:flex;justify-content:center;gap:16px;flex-wrap:wrap;margin-top:12px">
          ${BANDS.map(bb => { const e = bandComplete(bb.id); return `<div style="text-align:center;opacity:${e ? 1 : .4}"><div style="font-size:2rem;filter:${e ? 'none' : 'grayscale(1)'}">${e ? bb.emoji : '🔒'}</div><div style="font-size:.7rem;font-weight:700;color:${e ? bb.color : '#98a0af'}">${esc(bb.label.replace('Little ', '').replace('Growing ', '').replace('Building ', ''))}</div></div>`; }).join('')}
          <div style="text-align:center;opacity:${master ? 1 : .4}"><div style="font-size:2rem;filter:${master ? 'none' : 'grayscale(1)'}">${master ? '🏆' : '🔒'}</div><div style="font-size:.7rem;font-weight:700;color:${master ? '#d4a017' : '#98a0af'}">Growth Champion</div></div>
        </div>
        ${master ? '<p class="muted" style="margin:10px 0 0;font-size:.82rem">🎉 You finished every story — you’re a Growth Champion!</p>' : '<p class="muted" style="margin:10px 0 0;font-size:.78rem">Finish a whole band to light up its badge. Finish them all to become a Growth Champion.</p>'}
      </div>
      ${ordered.map(bandBlock).join('')}
      <div style="text-align:center;margin:18px 0"><button class="btn ghost" onclick="location.hash='#home'">← Back to home</button></div>
    </div>`);
    wireChrome();
    document.querySelectorAll('.gr-unit').forEach(el => { const go = () => { Sound && Sound.click && Sound.click(); location.hash = '#growth-unit/' + el.dataset.unit; }; el.onclick = go; el.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } }; });
    document.querySelectorAll('.gr-cert-btn').forEach(el => el.onclick = () => { location.hash = '#growth-cert/' + el.dataset.band; });
    const cb = document.getElementById('gr-check-btn'); if (cb) cb.onclick = () => location.hash = '#growth-check';
  });

  // ======================= Single story =======================
  route('growth-unit', async (unitId) => {
    if (State.me.role !== 'kid') { location.hash = '#home'; return; }
    const u = UNITS.find(x => x.id === unitId);
    if (!u) { location.hash = '#growth'; return; }
    await loadProgress();
    const b = bandOf(u.band);
    let stepI = 0, quizI = 0, quizWrong = 0;
    function shell(inner) {
      app().innerHTML = topbar(`<div class="container" style="max-width:680px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px"><button class="btn ghost small" id="gr-back">← Growth Skills</button><span class="muted" style="font-size:.85rem">${b.emoji} ${esc(u.skill)}</span></div>
        <div class="card"><div style="display:flex;align-items:center;gap:10px"><span style="font-size:1.6rem">${u.emoji}</span><h2 style="margin:0">${esc(u.title)}</h2></div>${inner}</div>
      </div>`);
      wireChrome();
      const bk = document.getElementById('gr-back'); if (bk) bk.onclick = () => location.hash = '#growth';
    }
    function renderStory() {
      const s = u.steps[stepI], pct = Math.round(stepI / u.steps.length * 100);
      shell(`
        <div class="sk-bar" style="height:8px;margin:12px 0 16px"><span class="sk-fill hi" style="width:${pct}%;background:${b.color}"></span></div>
        <h3 style="margin:0 0 8px;color:${b.color}">${esc(s.t)}</h3>
        <p style="font-size:1.05rem;line-height:1.65">${s.b}</p>
        ${s.tip ? `<div style="margin-top:12px;background:#f3f0ff;border:1px solid #ddd3f5;border-radius:10px;padding:10px 12px"><b>💡 The takeaway:</b> ${esc(s.tip)}</div>` : ''}
        <div style="display:flex;gap:8px;justify-content:space-between;margin-top:18px">
          <button class="btn ghost" id="gr-prev" ${stepI === 0 ? 'style="visibility:hidden"' : ''}>← Back</button>
          <button class="btn green" id="gr-next">${stepI < u.steps.length - 1 ? 'Next →' : (u.trueStory ? 'A true story →' : 'Reflect on this →')}</button>
        </div>`);
      document.getElementById('gr-next').onclick = () => { if (stepI < u.steps.length - 1) { stepI++; renderStory(); } else if (u.trueStory) { renderTrueStory(); } else { quizI = 0; renderQuiz(); } };
      const pv = document.getElementById('gr-prev'); if (pv) pv.onclick = () => { if (stepI > 0) { stepI--; renderStory(); } };
    }
    function renderTrueStory() {
      const ts = u.trueStory;
      shell(`
        <div style="margin:14px 0 0"><span style="display:inline-block;background:#eaf4ff;color:#1c5aa6;font-weight:800;font-size:.7rem;letter-spacing:.08em;text-transform:uppercase;padding:4px 10px;border-radius:999px">📖 True Story · This one really happened</span></div>
        <div style="margin-top:12px;border:1px solid #cfe2f5;background:#f7fbff;border-radius:12px;padding:16px 18px">
          <div style="font-weight:800;font-size:1.15rem;color:#1c5aa6">${esc(ts.who)}</div>
          <div class="muted" style="font-size:.85rem;margin-bottom:10px">${esc(ts.what)}</div>
          <p style="font-size:1.05rem;line-height:1.65;margin:0">${ts.text}</p>
          <div style="margin-top:12px;background:#fff;border-left:4px solid #1c5aa6;border-radius:8px;padding:10px 12px;font-size:.95rem"><b>The connection:</b> ${esc(ts.tie)}</div>
        </div>
        <div style="display:flex;gap:8px;justify-content:space-between;margin-top:18px">
          <button class="btn ghost" id="gr-prev">← Back to story</button>
          <button class="btn green" id="gr-next2">${u.trueQ ? 'Reading check →' : 'Now reflect →'}</button>
        </div>`);
      document.getElementById('gr-next2').onclick = () => { if (u.trueQ) { renderTrueQuiz(); } else { quizI = 0; renderQuiz(); } };
      const pv = document.getElementById('gr-prev'); if (pv) pv.onclick = () => { stepI = u.steps.length - 1; renderStory(); };
    }
    function renderTrueQuiz() {
      const item = u.trueQ;
      shell(`
        <div style="margin:12px 0 2px"><span style="display:inline-block;background:#eaf4ff;color:#1c5aa6;font-weight:800;font-size:.7rem;letter-spacing:.06em;text-transform:uppercase;padding:3px 9px;border-radius:999px">📖 Reading check · from the true story</span></div>
        <h3 style="margin:10px 0 14px">${esc(item.q)}</h3>
        <div style="display:flex;flex-direction:column;gap:10px">${item.choices.map((c, i) => `<button class="btn ghost trq-choice" data-i="${i}" style="text-align:left;justify-content:flex-start;background:#fff;color:#1f2a3d;border-color:#cbd5e1">${esc(c)}</button>`).join('')}</div>
        <div id="trq-fb" style="margin-top:14px"></div>`);
      document.querySelectorAll('.trq-choice').forEach(btn => {
        btn.onclick = () => {
          const i = Number(btn.dataset.i), correct = i === item.a;
          document.querySelectorAll('.trq-choice').forEach(x => { x.disabled = true; x.style.opacity = '.6'; });
          const chosen = document.querySelector(`.trq-choice[data-i="${i}"]`), right = document.querySelector(`.trq-choice[data-i="${item.a}"]`);
          if (correct) { chosen.style.background = '#e7f7ec'; chosen.style.borderColor = '#1f8a5f'; chosen.style.opacity = '1'; Sound && Sound.correct && Sound.correct(); }
          else { chosen.style.background = '#fdeaea'; chosen.style.borderColor = '#c0392b'; if (right) { right.style.background = '#e7f7ec'; right.style.borderColor = '#1f8a5f'; right.style.opacity = '1'; } Sound && Sound.wrong && Sound.wrong(); }
          document.getElementById('trq-fb').innerHTML = `<div style="background:${correct ? '#f2faf4' : '#fff5f5'};border-radius:10px;padding:12px"><b>${correct ? '✅ Yes!' : '💡 Look back:'}</b> ${esc(item.why)}<div style="margin-top:12px;text-align:right"><button class="btn green" id="trq-cont">Now reflect →</button></div></div>`;
          document.getElementById('trq-cont').onclick = () => { quizI = 0; renderQuiz(); };
        };
      });
    }
    function renderQuiz() {
      const item = u.quiz[quizI];
      shell(`
        <p class="muted" style="margin:12px 0 4px">Reflection ${quizI + 1} of ${u.quiz.length}</p>
        <h3 style="margin:0 0 14px">${esc(item.q)}</h3>
        <div style="display:flex;flex-direction:column;gap:10px">${item.choices.map((c, i) => `<button class="btn ghost gr-choice" data-i="${i}" style="text-align:left;justify-content:flex-start;background:#fff;color:#1f2a3d;border-color:#cbd5e1">${esc(c)}</button>`).join('')}</div>
        <div id="gr-fb" style="margin-top:14px"></div>`);
      document.querySelectorAll('.gr-choice').forEach(btn => {
        btn.onclick = () => {
          const i = Number(btn.dataset.i), correct = i === item.a;
          document.querySelectorAll('.gr-choice').forEach(x => { x.disabled = true; x.style.opacity = '.6'; });
          const chosen = document.querySelector(`.gr-choice[data-i="${i}"]`), right = document.querySelector(`.gr-choice[data-i="${item.a}"]`);
          if (correct) { chosen.style.background = '#e7f7ec'; chosen.style.borderColor = '#1f8a5f'; chosen.style.opacity = '1'; Sound && Sound.correct && Sound.correct(); }
          else { chosen.style.background = '#fdeaea'; chosen.style.borderColor = '#c0392b'; if (right) { right.style.background = '#e7f7ec'; right.style.borderColor = '#1f8a5f'; right.style.opacity = '1'; } quizWrong++; Sound && Sound.wrong && Sound.wrong(); }
          document.getElementById('gr-fb').innerHTML = `<div style="background:${correct ? '#f2faf4' : '#fff5f5'};border-radius:10px;padding:12px"><b>${correct ? '✅ Yes!' : '💡 Here’s the idea:'}</b> ${esc(item.why)}<div style="margin-top:12px;text-align:right"><button class="btn green" id="gr-cont">${quizI < u.quiz.length - 1 ? 'Next →' : 'Finish story →'}</button></div></div>`;
          document.getElementById('gr-cont').onclick = () => { if (quizI < u.quiz.length - 1) { quizI++; renderQuiz(); } else { finish(); } };
        };
      });
    }
    async function finish() {
      PROG.done[u.id] = { t: u.title, band: u.band, skill: u.skill, at: Date.now() };
      await saveProgress();
      if (Confetti && Confetti.burst) Confetti.burst(140);
      const justBand = bandComplete(u.band), allDone = UNITS.every(x => isDone(x.id)), nextU = UNITS.find(x => !isDone(x.id));
      shell(`
        <div style="text-align:center;padding:10px 0">
          <div style="font-size:2.4rem">🌟</div>
          <h3 style="margin:8px 0">Story complete!</h3>
          <p class="muted">You just learned about <b>${esc(u.skill)}</b> — a skill that helps in school and in life. Notice it in yourself this week!</p>
          ${allDone ? `<div style="margin:16px 0;background:linear-gradient(135deg,#fff5d6,#ffe9a8);border:1px solid #e6c86a;border-radius:12px;padding:18px"><div style="font-size:2.4rem">🏆</div><b style="font-size:1.1rem">You’re a Growth Champion!</b><p class="muted" style="margin:6px 0 0;font-size:.85rem">You finished all ${UNITS.length} Growth Skills stories. Those habits are yours now.</p></div>` : ''}
          ${justBand ? `<div style="margin:16px 0;background:#eef6ff;border:1px solid #cfe2f5;border-radius:12px;padding:16px"><div style="font-size:2rem">🏅</div><b>You finished the ${esc(bandOf(u.band).label)} stories!</b><div style="margin-top:10px"><button class="btn sun" id="gr-cert">View your certificate →</button></div></div>` : ''}
          <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:14px">
            ${nextU ? `<button class="btn green" id="gr-nextu">Next story: ${esc(nextU.title)} →</button>` : ''}
            <button class="btn ghost" id="gr-hub">Back to Growth Skills</button>
          </div>
        </div>`);
      const ct = document.getElementById('gr-cert'); if (ct) ct.onclick = () => location.hash = '#growth-cert/' + u.band;
      const nu = document.getElementById('gr-nextu'); if (nu && nextU) nu.onclick = () => location.hash = '#growth-unit/' + nextU.id;
      const hb = document.getElementById('gr-hub'); if (hb) hb.onclick = () => location.hash = '#growth';
    }
    renderStory();
  });

  // ======================= Self-assessment =======================
  route('growth-check', async () => {
    if (State.me.role !== 'kid') { location.hash = '#home'; return; }
    await loadProgress();
    const ratings = {};
    (PROG.check && PROG.check.ratings) && Object.assign(ratings, PROG.check.ratings);
    const FACES = ['😟', '😕', '😐', '🙂', '😄'];
    function render() {
      app().innerHTML = topbar(`<div class="container" style="max-width:660px">
        <div style="display:flex;gap:8px;margin-bottom:10px"><button class="btn ghost small" id="gc-back">← Growth Skills</button></div>
        <div class="card">
          <div style="text-align:center"><div style="font-size:1.8rem">🪞</div><h2 style="margin:4px 0">How am I doing as a learner?</h2><p class="muted" style="font-size:.9rem;margin:0">This is just for you — there are no wrong answers. Be honest, and pick one thing to grow.</p></div>
          <div style="margin-top:16px">
          ${CHECK_ITEMS.map(it => `<div style="padding:12px 0;border-bottom:1px solid #eee">
            <b style="font-size:.98rem">${esc(it.t)}</b>
            <div style="display:flex;gap:8px;margin-top:8px" data-item="${it.id}">
              ${[1, 2, 3, 4, 5].map(n => `<button class="gc-rate" data-item="${it.id}" data-v="${n}" style="flex:1;padding:8px 0;border:1px solid ${ratings[it.id] === n ? '#2f8fd6' : '#dfe6e9'};background:${ratings[it.id] === n ? '#e8f3fc' : '#fff'};border-radius:10px;font-size:1.3rem;cursor:pointer">${FACES[n - 1]}</button>`).join('')}
            </div>
            <div style="display:flex;justify-content:space-between;font-size:.68rem;color:#98a0af;margin-top:2px"><span>Not yet</span><span>All the time</span></div>
          </div>`).join('')}
          </div>
          <div id="gc-goal-wrap" style="margin-top:16px;${Object.keys(ratings).length >= CHECK_ITEMS.length ? '' : 'display:none'}">
            <b>Pick ONE habit to grow next:</b>
            <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px">${CHECK_ITEMS.map(it => `<button class="gc-goal" data-goal="${it.id}" style="border:1px solid ${PROG.check && PROG.check.goal === it.id ? '#2f8fd6' : '#dfe6e9'};background:${PROG.check && PROG.check.goal === it.id ? '#e8f3fc' : '#fff'};border-radius:20px;padding:6px 12px;font-size:.82rem;cursor:pointer">${esc(it.t.replace('I ', '').replace('.', ''))}</button>`).join('')}</div>
          </div>
          <div id="gc-done" style="margin-top:16px;text-align:right"></div>
        </div>
      </div>`);
      wireChrome();
      document.getElementById('gc-back').onclick = () => location.hash = '#growth';
      document.querySelectorAll('.gc-rate').forEach(btn => btn.onclick = () => { ratings[btn.dataset.item] = Number(btn.dataset.v); render(); if (Object.keys(ratings).length >= CHECK_ITEMS.length) { const w = document.getElementById('gc-goal-wrap'); if (w) w.scrollIntoView({ behavior: 'smooth', block: 'center' }); } });
      document.querySelectorAll('.gc-goal').forEach(btn => btn.onclick = async () => {
        PROG.check = { ratings, goal: btn.dataset.goal, at: Date.now() };
        await saveProgress();
        if (Confetti && Confetti.burst) Confetti.burst(120);
        const goalText = (CHECK_ITEMS.find(x => x.id === btn.dataset.goal) || {}).t || '';
        document.querySelector('.card').innerHTML = `<div style="text-align:center;padding:14px 0">
          <div style="font-size:2.4rem">🌟</div><h2 style="margin:8px 0">Nice self-awareness!</h2>
          <p class="muted" style="max-width:440px;margin:0 auto">Knowing yourself is a real superpower — it’s the first step to growing. Your goal to work on:</p>
          <p style="font-size:1.1rem;font-weight:700;color:#2f8fd6;margin:12px 0">“${esc(goalText)}”</p>
          <p class="muted" style="font-size:.85rem;max-width:440px;margin:0 auto">Try it this week, then come back and see how you’ve grown. Your parent can see your self-check on your report too.</p>
          <div style="margin-top:16px"><button class="btn green" onclick="location.hash='#growth'">Back to Growth Skills</button></div>
        </div>`;
      });
    }
    render();
  });

  // ======================= Band certificate =======================
  route('growth-cert', async (bandId) => {
    if (State.me.role !== 'kid') { location.hash = '#home'; return; }
    const b = BANDS.find(x => x.id === bandId); if (!b) { location.hash = '#growth'; return; }
    await loadProgress();
    const nm = esc(kid().name || 'A Gallop learner');
    const dateStr = (() => { try { return new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }); } catch (e) { return ''; } })();
    const count = unitsInBand(b.id).length;
    app().innerHTML = topbar(`<div class="container" style="max-width:720px">
      <div style="display:flex;gap:8px;margin-bottom:10px"><button class="btn ghost small" id="gc-back">← Growth Skills</button></div>
      <div style="background:linear-gradient(135deg,#f6fbff,#fff);border:3px double ${b.color};border-radius:16px;padding:34px 28px;text-align:center;box-shadow:0 14px 34px -20px rgba(0,0,0,.4)">
        <div style="font-size:2.6rem">🏅</div>
        <div style="letter-spacing:3px;font-size:.78rem;color:${b.color};font-weight:700;margin-top:6px">CERTIFICATE OF COMPLETION</div>
        <h1 style="margin:10px 0 2px;font-size:1.8rem">${b.emoji} ${esc(b.label)} · Growth Skills</h1>
        <p class="muted" style="margin:0 0 18px;font-size:.85rem">Grades ${b.grades}</p>
        <p style="margin:0">This certifies that</p>
        <div style="font-size:1.9rem;font-weight:800;color:${b.color};margin:6px 0">${nm}</div>
        <p style="max-width:470px;margin:0 auto">has completed all ${count} Growth Skills stories in this band — learning the mindsets and habits of a strong, resilient learner. 🌟</p>
        <div style="margin-top:22px;display:flex;justify-content:space-between;align-items:flex-end;max-width:420px;margin-left:auto;margin-right:auto">
          <div style="text-align:center"><div style="font-size:1.1rem">🐎 Gallop</div><div style="border-top:1px solid #bbb;font-size:.7rem;color:#888;padding-top:2px">Gallop Learning Academy</div></div>
          <div style="text-align:center"><div style="font-size:.95rem">${dateStr}</div><div style="border-top:1px solid #bbb;font-size:.7rem;color:#888;padding-top:2px">Date</div></div>
        </div>
      </div>
      <div style="text-align:center;margin:16px 0"><button class="btn green" id="gc-print">🖨️ Print / save</button> <button class="btn ghost" id="gc-hub">Back to Growth Skills</button></div>
    </div>`);
    wireChrome();
    const bk = document.getElementById('gc-back'); if (bk) bk.onclick = () => location.hash = '#growth';
    const hb = document.getElementById('gc-hub'); if (hb) hb.onclick = () => location.hash = '#growth';
    const pr = document.getElementById('gc-print'); if (pr) pr.onclick = () => window.print();
    if (Confetti && Confetti.burst) Confetti.burst(180);
  });
})();

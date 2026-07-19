// BrightPath English — K-12 reading, grammar, vocabulary with real-life flavor
const { pick, shuffle, textChoices, q } = require('./helpers');

// Helper for bank-based skills
function fromBank(bank) {
  return function () {
    const item = pick(bank);
    return q({
      prompt: item.p,
      choices: textChoices(item.a, item.w),
      answer: item.a,
      hint: item.h || '',
      explain: item.e || '',
      voice: item.v || item.p
    });
  };
}

const skills = [
  // ---------- K ----------
  {
    id: 'e.k.letters', name: 'Letter Sounds', grade: 0,
    gen: fromBank([
      { p: 'Which letter makes the first sound in 🍌 "banana"?', a: 'B', w: ['D', 'P', 'M'], h: 'Say it slowly: buh-anana.', e: 'B says "buh" like banana!' },
      { p: 'Which letter makes the first sound in 🐱 "cat"?', a: 'C', w: ['K', 'S', 'T'], h: 'Cuh-cuh-cat.', e: 'C starts cat!' },
      { p: 'Which letter makes the first sound in 🐶 "dog"?', a: 'D', w: ['B', 'G', 'O'], h: 'Duh-duh-dog.', e: 'D starts dog!' },
      { p: 'Which letter makes the first sound in 🌞 "sun"?', a: 'S', w: ['Z', 'C', 'N'], h: 'Sss like a snake.', e: 'S starts sun!' },
      { p: 'Which letter makes the first sound in 🪁 "kite"?', a: 'K', w: ['C', 'T', 'I'], h: 'Kuh-kuh-kite.', e: 'K starts kite!' },
      { p: 'Which letter makes the first sound in 🌙 "moon"?', a: 'M', w: ['N', 'W', 'U'], h: 'Mmm like yummy food.', e: 'M starts moon!' },
      { p: 'Which letter makes the first sound in 🐸 "frog"?', a: 'F', w: ['V', 'P', 'R'], h: 'Fff-frog.', e: 'F starts frog!' }
    ])
  },
  {
    id: 'e.k.rhyme', name: 'Rhyme Time', grade: 0,
    gen: fromBank([
      { p: 'Which word rhymes with "cat"? 🐱', a: 'hat', w: ['dog', 'car', 'cup'], h: 'Rhymes sound the same at the end: -at.', e: 'Cat and hat both end in -at!' },
      { p: 'Which word rhymes with "sun"? ☀️', a: 'fun', w: ['moon', 'star', 'sit'], h: 'Listen for -un.', e: 'Sun, fun — a rhyming pair!' },
      { p: 'Which word rhymes with "tree"? 🌳', a: 'bee', w: ['leaf', 'bark', 'tall'], h: 'Listen for -ee.', e: 'Tree and bee rhyme!' },
      { p: 'Which word rhymes with "cake"? 🎂', a: 'lake', w: ['cook', 'pie', 'kite'], h: 'Listen for -ake.', e: 'Cake, lake!' },
      { p: 'Which word rhymes with "star"? ⭐', a: 'car', w: ['sky', 'moon', 'stop'], h: 'Listen for -ar.', e: 'Star, car!' },
      { p: 'Which word rhymes with "ball"? ⚽', a: 'tall', w: ['bat', 'run', 'net'], h: 'Listen for -all.', e: 'Ball, tall!' }
    ])
  },
  {
    id: 'e.k.sight', name: 'Sight Word Stars', grade: 0,
    gen: fromBank([
      { p: 'Finish the sentence: "I ___ a big dog." 🐕', a: 'see', w: ['sea', 'sew', 'so'], h: 'Which word means using your eyes?', e: '"I see a big dog." See = look with your eyes.' },
      { p: 'Finish: "We ___ to the park."', a: 'go', w: ['goo', 'got', 'do'], h: 'It means to move somewhere.', e: '"We go to the park."' },
      { p: 'Finish: "___ you like pizza?" 🍕', a: 'Do', w: ['Did', 'Done', 'To'], h: 'It starts a question.', e: '"Do you like pizza?"' },
      { p: 'Finish: "The cat is ___ the box." 📦', a: 'in', w: ['on top off', 'inn', 'an'], h: 'Where do cats love to sit?', e: '"The cat is in the box."' },
      { p: 'Finish: "I like ___ play outside."', a: 'to', w: ['too', 'two', 'so'], h: 'It comes before an action word.', e: '"I like to play."' }
    ])
  },

  // ---------- GRADE 1 ----------
  {
    id: 'e.1.vowels', name: 'Vowel Power', grade: 1,
    gen: fromBank([
      { p: 'Which word has a SHORT "a" sound like in "apple"? 🍎', a: 'bat', w: ['cake', 'rain', 'day'], h: 'Short a says "ah".', e: 'Bat has the short a sound.' },
      { p: 'Which word has a LONG "e" sound like in "bee"? 🐝', a: 'seed', w: ['bed', 'pet', 'ten'], h: 'Long e says its name: "ee".', e: 'Seed has the long e.' },
      { p: 'Which word has a SHORT "i" sound like in "igloo"?', a: 'fish', w: ['kite', 'time', 'ride'], h: 'Short i says "ih".', e: 'Fish has short i.' },
      { p: 'Which word has a LONG "o" sound like in "boat"? ⛵', a: 'rope', w: ['hot', 'top', 'box'], h: 'Long o says "oh".', e: 'Rope has long o.' },
      { p: 'Silent E magic! Add an e: "cap" becomes…', a: 'cape (like a superhero!)', w: ['capp', 'caps', 'cup'], h: 'The magic e makes the a say its name.', e: 'cap → cape. The e is magic! 🦸' },
      { p: 'Silent E magic! Add an e: "kit" becomes…', a: 'kite', w: ['kitt', 'kits', 'cat'], h: 'The magic e makes the i say its name.', e: 'kit → kite. Go fly it! 🪁' }
    ])
  },
  {
    id: 'e.1.sentence', name: 'Sentence Sense', grade: 1,
    gen: fromBank([
      { p: 'Which one is a complete sentence?', a: 'The puppy runs fast.', w: ['runs fast', 'The puppy', 'fast the'], h: 'A sentence needs a who AND a what-happens.', e: 'It tells WHO (the puppy) and WHAT (runs fast).' },
      { p: 'Which sentence is written correctly?', a: 'I like ice cream.', w: ['i like ice cream', 'I like ice cream', 'i Like Ice Cream.'], h: 'Capital letter at the start, period at the end.', e: 'Capital "I" + period = correct!' },
      { p: 'What goes at the end of a question?', a: '? (question mark)', w: ['. (period)', '! (exclamation point)', ', (comma)'], h: 'Questions ask something.', e: 'Questions always end with ?' },
      { p: 'Put it in order: "school / We / to / walk"', a: 'We walk to school.', w: ['School we to walk.', 'Walk school we to.', 'To we walk school.'], h: 'Start with WHO.', e: '"We walk to school." makes sense!' },
      { p: 'Which word needs a CAPITAL letter? "on monday we swim"', a: 'monday', w: ['on', 'we', 'swim'], h: 'Days of the week are special names.', e: 'Days like Monday always get capitals.' }
    ])
  },
  {
    id: 'e.1.reading', name: 'Story Detective', grade: 1,
    gen: fromBank([
      { p: 'Read: "Max the dog dug a hole. He hid his bone inside. Then he took a nap." What did Max hide?', a: 'his bone', w: ['his ball', 'a stick', 'his food bowl'], h: 'Read the middle sentence again.', e: 'Max hid his bone in the hole!' },
      { p: 'Read: "Lily planted a seed. She watered it every day. A sunflower grew tall!" What grew?', a: 'a sunflower', w: ['a rose', 'a tree', 'grass'], h: 'Check the last sentence.', e: 'Watering every day made the sunflower grow! 🌻' },
      { p: 'Read: "Sam lost his red mitten. He looked under the bed. It was in the dog\'s bed!" Where was the mitten?', a: "in the dog's bed", w: ['under the bed', 'in his backpack', 'outside'], h: 'The last sentence tells you.', e: 'The dog took it! 🐶' },
      { p: 'Read: "It was raining. Mia grabbed her umbrella and boots. She jumped in every puddle." What was the weather?', a: 'rainy', w: ['sunny', 'snowy', 'windy'], h: 'The first sentence says it.', e: 'Raining — perfect puddle weather! ☔' }
    ])
  },

  // ---------- GRADE 2 ----------
  {
    id: 'e.2.reading', name: 'Reading Comprehension', grade: 2,
    gen: fromBank([
      { p: 'Read: "Ants work as a team. Some ants find food. Others carry it home. A few guard the nest. Together they can build a whole city underground!" What is the MAIN idea?', a: 'Ants work together as a team', w: ['Ants like food', 'Ants live underground', 'Some ants are guards'], h: 'What is the WHOLE passage mostly about?', e: 'Every sentence shows ants teaming up!' },
      { p: 'Read: "Maya wanted to bake cookies for the bake sale. But the oven broke! So she made no-bake chocolate balls instead. They sold out first." How did Maya solve her problem?', a: 'She made a no-bake treat instead', w: ['She fixed the oven', 'She bought cookies', 'She skipped the bake sale'], h: 'What did she do AFTER the oven broke?', e: 'Maya got creative — that\'s problem solving!' },
      { p: 'Read: "First, Leo filled the bird feeder. Next, he hung it on a branch. Finally, blue jays came to eat." What happened LAST?', a: 'Blue jays came to eat', w: ['Leo filled the feeder', 'Leo hung it on a branch', 'Leo bought seeds'], h: 'Look for the word "finally".', e: '"Finally" signals the last event.' },
      { p: 'Read: "The library was silent. Zoe tiptoed past the shelves, hugging her stack of books." Why did Zoe tiptoe?', a: 'To stay quiet in the library', w: ['Her feet hurt', 'She was playing a game', 'The floor was wet'], h: 'What are libraries like?', e: 'Libraries are quiet places, so she tiptoed. 🤫' },
      { p: 'Read: "Dark clouds rolled in. The wind picked up. Everyone at the picnic started packing quickly." What will PROBABLY happen next?', a: 'It will rain', w: ['It will snow', 'The sun will shine', 'They will start eating'], h: 'Dark clouds + wind = ?', e: 'Good prediction! Those are storm signs. ⛈️' },
      { p: 'Read: "A penguin cannot fly, but it is an amazing swimmer. It uses its wings like flippers to zoom through icy water." How does a penguin use its wings?', a: 'Like flippers for swimming', w: ['For flying high', 'To keep warm', 'To catch fish in the air'], h: 'Find the sentence about wings.', e: 'Wings = flippers underwater! 🐧' }
    ])
  },
  {
    id: 'e.2.nounsverbs', name: 'Nouns & Verbs', grade: 2,
    gen: fromBank([
      { p: 'In "The chef flips the pancake," which word is the VERB (action)?', a: 'flips', w: ['chef', 'pancake', 'the'], h: 'What is the chef DOING?', e: 'Flips is the action! 🥞' },
      { p: 'In "My skateboard is under the porch," which word is a NOUN?', a: 'skateboard', w: ['is', 'under', 'my'], h: 'A noun is a person, place, or thing.', e: 'Skateboard is a thing = noun.' },
      { p: 'Which word is a PROPER noun (needs a capital)?', a: 'Texas', w: ['city', 'dog', 'teacher'], h: 'Proper nouns are specific names.', e: 'Texas is a specific place name.' },
      { p: 'Choose the right verb: "Yesterday, we ___ to the museum."', a: 'went', w: ['go', 'goes', 'going'], h: '"Yesterday" means past tense.', e: 'Past tense of go = went.' },
      { p: 'In "The gray kitten sleeps in a warm basket," which word DESCRIBES the kitten?', a: 'gray', w: ['sleeps', 'basket', 'in'], h: 'Describing words are adjectives.', e: 'Gray describes the kitten — it\'s an adjective!' },
      { p: 'Plural time! One mouse, two ___?', a: 'mice', w: ['mouses', 'mouse', 'mices'], h: 'Some plurals are irregular — they change completely.', e: 'Mouse → mice. Tricky English! 🐭' }
    ])
  },
  {
    id: 'e.2.contractions', name: 'Contraction Action', grade: 2,
    gen: fromBank([
      { p: '"Do not touch the wet paint!" — Which contraction means "do not"?', a: "don't", w: ["doesn't", "didn't", "won't"], h: 'Squish the words: do + not.', e: "do + not = don't. The apostrophe replaces the o." },
      { p: '"She will win the race!" — Which contraction means "she will"?', a: "she'll", w: ["she's", "shell", "she'd"], h: 'she + will, drop the wi.', e: "she + will = she'll" },
      { p: 'What does "can\'t" mean?', a: 'cannot', w: ['can it', 'could not', 'care not'], h: 'Break it apart.', e: "can't = cannot." },
      { p: '"It is snowing!" — Which contraction fits: "___ snowing!"', a: "It's", w: ['Its', "It'is", 'Itss'], h: 'It + is, with an apostrophe.', e: "It's = it is. (Its without apostrophe means belonging to it!)" },
      { p: 'What does "we\'re" mean?', a: 'we are', w: ['we were', 'we care', 'where'], h: 'Break it apart: we + ?', e: "we're = we are." }
    ])
  },
  {
    id: 'e.2.vocab', name: 'Word Collector', grade: 2,
    gen: fromBank([
      { p: 'The pizza was ENORMOUS — it barely fit on the table! Enormous means…', a: 'very big', w: ['very hot', 'very tasty', 'very round'], h: 'It barely FIT on the table.', e: 'Enormous = huge, giant, very big!' },
      { p: 'Maya was EXHAUSTED after soccer practice. Exhausted means…', a: 'very tired', w: ['very happy', 'very hungry', 'very fast'], h: 'How do you feel after running a lot?', e: 'Exhausted = super tired.' },
      { p: 'The kitten was TIMID and hid behind the couch. Timid means…', a: 'shy or easily scared', w: ['brave', 'sleepy', 'playful'], h: 'It HID behind the couch.', e: 'Timid = shy. The opposite of bold!' },
      { p: 'Grandpa\'s joke was HILARIOUS — everyone laughed for a minute straight! Hilarious means…', a: 'very funny', w: ['very long', 'confusing', 'quiet'], h: 'Everyone LAUGHED.', e: 'Hilarious = super funny! 😂' },
      { p: 'The detective found a CLUE under the rug. A clue is…', a: 'a hint that helps solve a mystery', w: ['a type of glue', 'a loud sound', 'a secret door'], h: 'Detectives collect these to crack the case.', e: 'Clues help solve mysteries! 🔍' },
      { p: 'What is the OPPOSITE of "ancient"?', a: 'brand-new', w: ['very old', 'broken', 'dusty'], h: 'Ancient means very, very old.', e: 'Ancient ↔ brand-new.' }
    ])
  },

  // ---------- GRADE 3 ----------
  {
    id: 'e.3.prefix', name: 'Prefixes & Suffixes', grade: 3,
    gen: fromBank([
      { p: 'UN-lucky, UN-happy, UN-tie… What does the prefix "un-" mean?', a: 'not / opposite of', w: ['again', 'before', 'very'], h: 'Unhappy = ___ happy.', e: 'Un- flips the meaning: unhappy = not happy.' },
      { p: 'RE-read, RE-play, RE-build… What does "re-" mean?', a: 'again', w: ['not', 'under', 'wrongly'], h: 'When you replay a level, you play it ___.', e: 'Re- = again. Replay = play again! 🎮' },
      { p: 'Teach + er = teacher. What does the suffix "-er" mean here?', a: 'a person who does it', w: ['more of it', 'without it', 'the past'], h: 'A teacher is a person who ___.', e: '-er = the person who does it (baker, singer, gamer).' },
      { p: 'Which word means "not possible"?', a: 'impossible', w: ['unpossible', 'repossible', 'possibleless'], h: 'The prefix im- means not.', e: 'Impossible = not possible.' },
      { p: 'Care + ful = careful. What does "-ful" mean?', a: 'full of', w: ['without', 'against', 'again'], h: 'Careful = full of ___.', e: '-ful = full of. Careful = full of care.' },
      { p: 'What does "preheat" the oven mean?', a: 'heat it BEFORE cooking', w: ['heat it twice', 'not heat it', 'heat it too much'], h: 'Pre- means before.', e: 'Pre- = before. You preheat before baking! 🍪' }
    ])
  },
  {
    id: 'e.3.synant', name: 'Synonyms & Antonyms', grade: 3,
    gen: fromBank([
      { p: 'Which word is a SYNONYM (same meaning) for "quick"?', a: 'rapid', w: ['slow', 'quiet', 'heavy'], h: 'Synonyms are word twins.', e: 'Quick = rapid = fast = speedy!' },
      { p: 'Which is an ANTONYM (opposite) of "generous"?', a: 'selfish', w: ['kind', 'giving', 'friendly'], h: 'Generous people share a lot.', e: 'Generous ↔ selfish.' },
      { p: 'Synonym for "furious"?', a: 'very angry', w: ['curious', 'furry', 'joyful'], h: 'A furious dragon breathes fire! 🐉', e: 'Furious = extremely angry.' },
      { p: 'Antonym of "victory"?', a: 'defeat', w: ['win', 'trophy', 'battle'], h: 'What\'s the opposite of winning?', e: 'Victory ↔ defeat.' },
      { p: 'Your story says "nice" 5 times! Which is the STRONGEST replacement for "The view was nice"?', a: 'breathtaking', w: ['okay', 'fine', 'good'], h: 'Which word paints the biggest picture?', e: 'Breathtaking makes writing come alive! ✨' },
      { p: 'Synonym for "brave"?', a: 'courageous', w: ['afraid', 'careful', 'strong-smelling'], h: 'Think of a firefighter. 🚒', e: 'Brave = courageous = fearless.' }
    ])
  },
  {
    id: 'e.3.reading', name: 'Deep Reading', grade: 3,
    gen: fromBank([
      { p: 'Read: "Rosa\'s alarm didn\'t go off. She skipped breakfast, grabbed her backpack, and sprinted to the bus stop — just as the bus pulled away." How does Rosa probably feel?', a: 'frustrated and worried', w: ['relaxed', 'excited', 'proud'], h: 'She rushed AND missed the bus.', e: 'Missing the bus after rushing = frustrating morning!' },
      { p: 'Read: "The old lighthouse had guided ships for 100 years. Now its light was dark, but visitors climbed its stairs every day to see the view." What is the lighthouse used for NOW?', a: 'a place for visitors to see the view', w: ['guiding ships', 'a home', 'storing boats'], h: '"Now" starts the key sentence.', e: 'It went from guiding ships to hosting visitors.' },
      { p: 'Read: "Jamal practiced his lines every night for two weeks. On opening night, he didn\'t miss a single word." What LESSON does this story teach?', a: 'Practice leads to success', w: ['Plays are scary', 'Never memorize lines', 'Luck is everything'], h: 'What did practicing every night lead to?', e: 'Two weeks of practice = a perfect performance. 🎭' },
      { p: 'Read: "Unlike her noisy brother, June loved silent mornings with a book and cocoa." The word "Unlike" shows the author is…', a: 'comparing two different people', w: ['telling a joke', 'giving directions', 'asking a question'], h: '"Unlike" sets up a contrast.', e: 'The author contrasts June with her brother.' },
      { p: 'Read: "The market buzzed like a beehive." This sentence is an example of…', a: 'a simile (comparing with "like")', w: ['a fact', 'dialogue', 'a question'], h: 'It compares using the word "like".', e: 'Similes compare with like/as — busy market = buzzing hive! 🐝' }
    ])
  },
  {
    id: 'e.3.homophones', name: 'Homophone Heroes', grade: 3,
    gen: fromBank([
      { p: 'Pick the right word: "The dog wagged its ___." ', a: 'tail', w: ['tale', 'tael', 'tayl'], h: 'A tale is a story; a tail wags!', e: 'Tail = the wagging kind. Tale = a story.' },
      { p: 'Pick the right word: "We ___ the whole pizza!"', a: 'ate', w: ['eight', 'aight', 'et'], h: 'Eight is the number 8.', e: 'Ate = past of eat. Eight = 8.' },
      { p: '"___ going to love this game!" Which is correct?', a: "You're", w: ['Your', 'Yore', 'Youre'], h: "You're = you are.", e: "You're = you are. Your = belongs to you." },
      { p: '"The knight rode his horse for an ___." Which is correct?', a: 'hour', w: ['our', 'howr', 'or'], h: 'The clock kind, with a silent h.', e: 'Hour = 60 minutes. Our = belongs to us.' },
      { p: '"I can ___ the ocean from here!" Which is correct?', a: 'see', w: ['sea', 'cee', 'si'], h: 'The sea is what you see!', e: 'See = with your eyes. Sea = the ocean.' },
      { p: '"___ backpacks are on the bus." Which is correct?', a: 'Their', w: ["They're", 'There', 'Theyre'], h: 'It shows the backpacks belong to them.', e: 'Their = ownership. There = a place. They\'re = they are.' }
    ])
  },

  // ---------- GRADE 4 ----------
  {
    id: 'e.4.figurative', name: 'Figurative Language', grade: 4,
    gen: fromBank([
      { p: '"The classroom was a zoo before the teacher arrived." This is a…', a: 'metaphor', w: ['simile', 'fact', 'onomatopoeia'], h: 'It says the room WAS a zoo (no "like" or "as").', e: 'Metaphors say something IS another thing.' },
      { p: '"Her smile was as bright as the sun." This is a…', a: 'simile', w: ['metaphor', 'idiom', 'hyperbole'], h: 'Look for "as ___ as".', e: 'Similes compare with like or as. ☀️' },
      { p: '"I\'ve told you a MILLION times to clean your room!" This is…', a: 'hyperbole (huge exaggeration)', w: ['a fact', 'a simile', 'personification'], h: 'Was it really a million?', e: 'Hyperbole exaggerates for effect.' },
      { p: '"The wind whispered through the trees." This gives the wind a human ability — that\'s…', a: 'personification', w: ['a simile', 'alliteration', 'a fact'], h: 'Can wind really whisper?', e: 'Personification = giving human traits to non-human things.' },
      { p: '"BOOM! CRASH! The thunder rolled." Words that imitate sounds are called…', a: 'onomatopoeia', w: ['metaphors', 'synonyms', 'pronouns'], h: 'Buzz, pop, bang…', e: 'Onomatopoeia = sound-effect words! 💥' },
      { p: '"Peter Piper picked a peck of pickled peppers" repeats the P sound. That\'s…', a: 'alliteration', w: ['onomatopoeia', 'a metaphor', 'rhyme'], h: 'Same starting sound, over and over.', e: 'Alliteration = repeated beginning sounds.' }
    ])
  },
  {
    id: 'e.4.mainidea', name: 'Main Idea & Details', grade: 4,
    gen: fromBank([
      { p: 'Read: "Octopuses are escape artists. They can squeeze through cracks the size of a coin, unscrew jar lids from the inside, and squirt ink to vanish. Some aquariums call them the hardest animals to keep in a tank." Best title?', a: 'The Ocean\'s Great Escape Artist', w: ['Jars and Lids', 'Aquarium Jobs', 'Kinds of Ink'], h: 'The title should cover the WHOLE passage.', e: 'Every detail supports the octopus being an escape artist! 🐙' },
      { p: 'Read: "Recess helps students learn. After running and playing, kids focus better in class, remember more, and solve problems faster." Which sentence is a SUPPORTING DETAIL?', a: 'Kids focus better in class after playing', w: ['Recess helps students learn', 'Recess is at 10:30', 'Some kids like tag'], h: 'Details back up the main idea.', e: 'The focus fact supports "recess helps learning."' },
      { p: 'Read: "In 1903, the Wright brothers flew for just 12 seconds. Today, planes cross oceans in hours. In one century, flight went from a 12-second hop to a worldwide highway in the sky." The main idea is…', a: 'Flight improved amazingly fast in 100 years', w: ['Planes are loud', 'The Wright brothers were brothers', '12 seconds is short'], h: 'What change does the whole passage describe?', e: 'From 12 seconds to crossing oceans — huge progress! ✈️' },
      { p: 'A paragraph about recycling says: "Plastic bottles can become playground slides, park benches, and even T-shirts." These examples support which main idea?', a: 'Recycled plastic gets turned into useful new things', w: ['Plastic is cheap', 'T-shirts are comfortable', 'Playgrounds need slides'], h: 'What do all three examples have in common?', e: 'All three show recycling creating new products! ♻️' }
    ])
  },
  {
    id: 'e.4.context', name: 'Context Clues', grade: 4,
    gen: fromBank([
      { p: '"The trail was so ARDUOUS that even the fittest hikers stopped to rest five times." Arduous means…', a: 'very difficult and tiring', w: ['beautiful', 'short', 'crowded'], h: 'Even FIT hikers needed 5 rests!', e: 'The clue: fit hikers resting = a very hard trail.' },
      { p: '"Unlike his GREGARIOUS sister who talked to everyone, Ben sat quietly alone." Gregarious means…', a: 'sociable and outgoing', w: ['shy', 'angry', 'sleepy'], h: '"Unlike" contrasts her with quiet Ben.', e: 'She talks to everyone = sociable!' },
      { p: '"The medicine had to be taken PRECISELY at 8:00 — not 7:59, not 8:01." Precisely means…', a: 'exactly', w: ['sometimes', 'quickly', 'secretly'], h: 'Not a minute early or late…', e: 'Precisely = exactly on the dot. ⏰' },
      { p: '"The abandoned house was DILAPIDATED: broken windows, a sagging roof, and peeling paint." Dilapidated means…', a: 'falling apart from neglect', w: ['brand new', 'huge', 'haunted'], h: 'The list after the colon describes it.', e: 'Broken, sagging, peeling = falling apart.' },
      { p: '"Squirrels HOARD acorns in fall, hiding hundreds to eat during winter." Hoard means…', a: 'collect and store away', w: ['throw away', 'eat instantly', 'crack open'], h: 'They hide hundreds… for later.', e: 'Hoarding = stockpiling for winter! 🐿️' }
    ])
  },

  // ---------- GRADE 5 ----------
  {
    id: 'e.5.idioms', name: 'Idioms & Expressions', grade: 5,
    gen: fromBank([
      { p: '"Break a leg!" before a play means…', a: 'Good luck!', w: ['Be careful!', 'Run away!', 'Take a break!'], h: 'Actors say it before shows.', e: 'It\'s theater slang for good luck! 🎭' },
      { p: '"It\'s raining cats and dogs" means…', a: 'raining very hard', w: ['pets are falling', 'a light drizzle', 'it\'s chaotic inside'], h: 'Grab your umbrella.', e: 'Just a heavy downpour — no pets involved! 🌧️' },
      { p: '"Spill the beans" means…', a: 'reveal a secret', w: ['make a mess', 'cook dinner', 'waste food'], h: 'Oops — now everyone knows!', e: 'Spilling the beans = letting a secret out.' },
      { p: '"That test was a piece of cake" means…', a: 'it was very easy', w: ['it was delicious', 'it was sweet of the teacher', 'it crumbled'], h: 'How hard is eating cake?', e: 'Piece of cake = easy-peasy! 🍰' },
      { p: '"We\'re all in the same boat" means…', a: 'we share the same situation', w: ['we\'re going sailing', 'we\'re crowded', 'we\'re lost at sea'], h: 'If the boat rocks, it rocks for everyone.', e: 'Same boat = same challenge together. ⛵' },
      { p: '"Hold your horses!" means…', a: 'wait and be patient', w: ['grab the reins', 'ride faster', 'feed the animals'], h: 'Someone\'s moving too fast.', e: 'Hold your horses = slow down, wait up! 🐴' }
    ])
  },
  {
    id: 'e.5.grammar', name: 'Grammar Pro', grade: 5,
    gen: fromBank([
      { p: 'Which sentence uses commas CORRECTLY?', a: 'We packed sandwiches, apples, and lemonade.', w: ['We packed, sandwiches apples and lemonade.', 'We packed sandwiches apples, and, lemonade.', 'We, packed sandwiches, apples and lemonade.'], h: 'Commas separate list items.', e: 'Commas go between items in a list.' },
      { p: 'Find the SUBJECT: "The team\'s star goalie blocked every shot."', a: 'The team\'s star goalie', w: ['blocked', 'every shot', 'the team'], h: 'WHO did the blocking?', e: 'The goalie is who the sentence is about. 🥅' },
      { p: 'Choose the correct verb: "Neither of the puppies ___ trained yet."', a: 'is', w: ['are', 'were', 'be'], h: '"Neither" is singular — it means not one.', e: '"Neither" takes a singular verb: neither IS.' },
      { p: 'Which is a COMPOUND sentence?', a: 'I studied hard, and I aced the quiz.', w: ['I studied hard.', 'Studying hard all night.', 'The hard quiz.'], h: 'Two complete thoughts joined by a comma + and/but/or.', e: 'Two full sentences joined with ", and" = compound.' },
      { p: 'Fix the pronoun: "Margaux and ___ built the treehouse."', a: 'I', w: ['me', 'us', 'them'], h: 'Try it alone: "___ built the treehouse."', e: '"I built it" sounds right — so "Margaux and I."' },
      { p: 'Which sentence is in PAST tense?', a: 'The rocket soared into the clouds.', w: ['The rocket soars into the clouds.', 'The rocket will soar.', 'The rocket is soaring.'], h: 'Which action already happened?', e: 'Soared = already happened. 🚀' }
    ])
  },
  {
    id: 'e.5.pov', name: 'Author\'s Craft', grade: 5,
    gen: fromBank([
      { p: '"I couldn\'t believe MY eyes when I opened the box." This story is told in…', a: 'first person', w: ['second person', 'third person', 'no person'], h: 'Look for I, me, my.', e: 'I/me/my = first person point of view.' },
      { p: '"She grabbed her helmet and raced outside." This is told in…', a: 'third person', w: ['first person', 'second person', 'past person'], h: 'Look for she/he/they.', e: 'She/he/they = third person.' },
      { p: 'An author writes an article listing 10 reasons school should start later, with studies to back them up. The author\'s PURPOSE is to…', a: 'persuade', w: ['entertain', 'confuse', 'describe a character'], h: 'Reasons + evidence = trying to convince you.', e: 'Persuade = convince the reader! (PIE: Persuade, Inform, Entertain)' },
      { p: 'A recipe explaining how to make tamales step-by-step is written to…', a: 'inform / instruct', w: ['persuade', 'entertain with a story', 'scare the reader'], h: 'It teaches you how to do something.', e: 'Recipes inform — they teach steps.' },
      { p: 'Which sentence sets a SPOOKY mood?', a: 'Fog crawled over the graveyard as the gate creaked open.', w: ['The sun sparkled on the happy beach.', 'The cafeteria served tacos on Tuesday.', 'Her birthday party had 12 balloons.'], h: 'Which one gives you shivers?', e: 'Fog + graveyard + creaking = spooky mood! 👻' }
    ])
  },

  // ---------- GRADE 6 ----------
  {
    id: 'e.6.theme', name: 'Theme & Summary', grade: 6,
    gen: fromBank([
      { p: 'In a story, a rich king learns that his servant, who owns almost nothing, is the happiest person in the kingdom. The THEME is likely…', a: 'Happiness doesn\'t come from wealth', w: ['Kings are powerful', 'Servants work hard', 'Castles are large'], h: 'Theme = the life lesson, not the plot.', e: 'The contrast teaches that money ≠ happiness.' },
      { p: 'Which is the BEST summary of "The Tortoise and the Hare"?', a: 'A slow tortoise beats a fast hare by staying steady while the hare naps.', w: ['A hare is very fast.', 'Animals once raced.', 'The tortoise cheated to win the race.'], h: 'A summary covers beginning, middle, and end briefly.', e: 'It captures who, what, and the outcome — no extra details.' },
      { p: 'A story shows a girl who fails her first three skateboard competitions but keeps practicing and finally lands her trick. Theme?', a: 'Perseverance pays off', w: ['Skateboarding is dangerous', 'Competitions are unfair', 'Talent matters most'], h: 'What does her journey teach?', e: 'Failing, practicing, succeeding = perseverance! 🛹' },
      { p: 'What should a good summary NEVER include?', a: 'Your personal opinions', w: ['The main character', 'The main problem', 'How it ends'], h: 'Summaries report; they don\'t review.', e: 'Save opinions for reviews — summaries stick to the story.' }
    ])
  },
  {
    id: 'e.6.vocab', name: 'Vocabulary Builder', grade: 6,
    gen: fromBank([
      { p: 'The coach was ADAMANT that practice would happen, rain or shine. Adamant means…', a: 'firmly refusing to change your mind', w: ['unsure', 'joyful', 'forgetful'], h: 'Rain OR shine — no exceptions.', e: 'Adamant = totally firm and unshakable.' },
      { p: 'After the trailer dropped, excitement for the movie was PALPABLE — you could practically feel it in the hallways. Palpable means…', a: 'so intense it feels touchable', w: ['invisible', 'fake', 'quiet'], h: 'You could FEEL it.', e: 'Palpable = almost physically feelable.' },
      { p: 'She gave a CANDID review: "The first level is great, the boss fight needs work." Candid means…', a: 'honest and direct', w: ['secretive', 'angry', 'sugarcoated'], h: 'She said exactly what she thought.', e: 'Candid = truthful, straight-up.' },
      { p: 'The instructions were so AMBIGUOUS that half the class did the wrong page. Ambiguous means…', a: 'unclear, with more than one meaning', w: ['very loud', 'detailed', 'ancient'], h: 'Half the class got confused…', e: 'Ambiguous = open to multiple interpretations.' },
      { p: 'Cleaning the beach wasn\'t MANDATORY, but almost everyone volunteered. Mandatory means…', a: 'required', w: ['optional', 'fun', 'illegal'], h: '"Wasn\'t ___, BUT they came anyway."', e: 'Mandatory = you must do it.' }
    ])
  },
  {
    id: 'e.6.commas', name: 'Punctuation Power', grade: 6,
    gen: fromBank([
      { p: 'Famous example! Which is correct if you\'re inviting Grandma to dinner?', a: "Let's eat, Grandma!", w: ["Let's eat Grandma!", "Lets eat, Grandma", "Let's, eat Grandma!"], h: 'The comma saves Grandma\'s life. 😅', e: 'The comma shows you\'re TALKING TO Grandma, not eating her!' },
      { p: 'Where does the apostrophe go? "The three dogs bowls were empty."', a: "dogs' bowls", w: ["dog's bowls", "dogs bowl's", "do'gs bowls"], h: 'The bowls belong to THREE dogs (plural).', e: "Plural owners → apostrophe after the s: dogs'." },
      { p: 'Pick the correctly punctuated dialogue:', a: '"Watch out!" shouted Marco.', w: ['"Watch out! shouted Marco."', '"Watch out"! shouted Marco.', 'Watch out! "shouted Marco."'], h: 'Punctuation stays inside the quotes.', e: 'The ! belongs inside the quotation marks.' },
      { p: 'Which sentence needs a comma after the opening phrase? ', a: 'After the storm passed we went outside. (comma after "passed")', w: ['We went outside quickly. (comma after "outside")', 'The dog barked. (comma after "dog")', 'I like tacos. (comma after "I")'], h: 'Introductory phrases get a comma.', e: '"After the storm passed," is an intro phrase → comma.' },
      { p: 'A colon (:) is best used to…', a: 'introduce a list or big reveal', w: ['end a question', 'join two unrelated words', 'show excitement'], h: 'Like: this!', e: 'Colons say "here it comes:" 📢' }
    ])
  },

  // ---------- GRADE 7 ----------
  {
    id: 'e.7.evidence', name: 'Evidence & Inference', grade: 7,
    gen: fromBank([
      { p: 'Read: "Dev checked his phone every thirty seconds and kept glancing at the door. When it finally opened, he jumped from his seat." What can you INFER?', a: 'Dev was anxiously waiting for someone', w: ['Dev was bored of his phone', 'Dev disliked the room', 'Dev wanted to leave'], h: 'Combine the clues: phone + door + jumping up.', e: 'All three behaviors point to eager waiting.' },
      { p: 'A claim says "School gardens improve student health." Which is the STRONGEST evidence?', a: 'A study of 40 schools found garden programs doubled students\' vegetable intake', w: ['One student said gardens are nice', 'Gardens have many plants', 'The author likes tomatoes'], h: 'Strong evidence = data, not opinions.', e: 'A 40-school study beats one opinion every time. 📊' },
      { p: 'Read: "The bakery\'s shelves were empty by 9 a.m. A line still stretched around the block." What can you infer about the bakery?', a: 'It is extremely popular', w: ['It is closing down', 'Its food is cheap', 'It opens at 9'], h: 'Empty shelves + long line = ?', e: 'Selling out early with a line around the block = very popular! 🥐' },
      { p: 'Which statement is an OPINION, not a fact?', a: 'Soccer is the most exciting sport to watch', w: ['A soccer match has two 45-minute halves', 'The World Cup happens every four years', 'Soccer is played with 11 players per side'], h: 'Facts can be checked; opinions can be argued.', e: '"Most exciting" is a judgment — that\'s opinion.' }
    ])
  },
  {
    id: 'e.7.clauses', name: 'Clauses & Sentence Craft', grade: 7,
    gen: fromBank([
      { p: '"Although the wifi was down, we finished the project." The part before the comma is…', a: 'a dependent clause', w: ['an independent clause', 'a complete sentence', 'a prepositional phrase'], h: 'Can "Although the wifi was down" stand alone?', e: 'It can\'t stand alone — it depends on the rest.' },
      { p: 'Which is a COMPLEX sentence?', a: 'Because the movie sold out, we watched it at home.', w: ['We watched a movie.', 'We got popcorn, and we found seats.', 'The long, loud, exciting movie.'], h: 'Complex = dependent + independent clause.', e: '"Because..." (dependent) + "we watched..." (independent).' },
      { p: 'Fix the run-on: "The bus was late I missed first period."', a: 'The bus was late, so I missed first period.', w: ['The bus was late I missed, first period.', 'The bus was late I missed first period!', 'The bus, was late I missed first period.'], h: 'Two complete thoughts need a connector.', e: 'Comma + "so" legally joins the two sentences.' },
      { p: '"Running down the hall, the backpack fell off Jake\'s shoulder." What\'s wrong?', a: 'It sounds like the BACKPACK was running (misplaced modifier)', w: ['Nothing is wrong', 'It needs an exclamation point', '"Backpack" is misspelled'], h: 'Who was actually running?', e: 'Backpacks can\'t run! Fix: "Running down the hall, Jake felt his backpack fall."' }
    ])
  },
  {
    id: 'e.7.vocab', name: 'Advanced Vocabulary', grade: 7,
    gen: fromBank([
      { p: 'Her argument was so COGENT that even the skeptics nodded. Cogent means…', a: 'clear, logical, and convincing', w: ['loud', 'confusing', 'humorous'], h: 'Even skeptics were convinced!', e: 'Cogent = powerfully persuasive through logic.' },
      { p: 'The mountain village was almost INACCESSIBLE in winter — one icy road in, often closed. Inaccessible means…', a: 'nearly impossible to reach', w: ['beautiful', 'crowded', 'inexpensive'], h: 'One road, often closed…', e: 'Inaccessible = can\'t easily get there.' },
      { p: 'He made a PRUDENT choice: saving half his birthday money instead of spending it all. Prudent means…', a: 'wise and careful', w: ['selfish', 'reckless', 'lucky'], h: 'Is saving careful or careless?', e: 'Prudent = showing good judgment. 💰' },
      { p: 'The two witnesses gave CONTRADICTORY accounts — one said noon, the other midnight. Contradictory means…', a: 'opposing; unable to both be true', w: ['identical', 'detailed', 'quiet'], h: 'Noon vs midnight can\'t both be right!', e: 'Contradictory statements clash with each other.' },
      { p: 'The app\'s design was so INTUITIVE that his grandma used it without help. Intuitive means…', a: 'easy to understand naturally', w: ['expensive', 'colorful', 'complicated'], h: 'No instructions needed!', e: 'Intuitive = you just "get it" instantly. 📱' }
    ])
  },

  // ---------- GRADE 8 ----------
  {
    id: 'e.8.argument', name: 'Argument & Rhetoric', grade: 8,
    gen: fromBank([
      { p: 'An ad says: "9 out of 10 dentists recommend SparkleFresh." This persuasion technique appeals to…', a: 'authority/expertise (ethos)', w: ['fear', 'humor', 'bandwagon only'], h: 'Why mention DENTISTS specifically?', e: 'Experts = credibility = ethos.' },
      { p: '"Everyone at school already has one — don\'t be left out!" This technique is…', a: 'bandwagon', w: ['logical proof', 'expert opinion', 'statistics'], h: '"Everyone is doing it…"', e: 'Bandwagon pressures you to join the crowd.' },
      { p: 'A strong COUNTERARGUMENT paragraph should…', a: 'state the other side fairly, then refute it with evidence', w: ['ignore the other side', 'insult people who disagree', 'repeat your claim louder'], h: 'Address it, then answer it.', e: 'Acknowledging + refuting the other side makes YOUR case stronger.' },
      { p: '"If we get a class pet, grades will improve, attendance will rise, and the cafeteria food will taste better." Which claim is the WEAK link?', a: 'The cafeteria food claim — a pet can\'t affect it', w: ['The grades claim', 'The attendance claim', 'They\'re all equally strong'], h: 'Which effect has no logical connection?', e: 'A pet plausibly affects mood/attendance — not food flavor!' },
      { p: 'Which sentence uses PATHOS (emotional appeal)?', a: 'Imagine a shivering puppy waiting alone in the rain for a home.', w: ['Shelters house 6.3 million animals yearly.', 'Veterinarians recommend adoption.', 'The shelter is open 9-5.'], h: 'Which one tugs your heart?', e: 'The shivering puppy image targets emotions. 🐶' }
    ])
  },
  {
    id: 'e.8.voice', name: 'Active Voice & Style', grade: 8,
    gen: fromBank([
      { p: 'Which sentence is in ACTIVE voice?', a: 'The goalie blocked the penalty kick.', w: ['The penalty kick was blocked by the goalie.', 'The kick was blocked.', 'A block was made.'], h: 'Active = the subject DOES the action.', e: 'Goalie (subject) → blocked (action). Direct and punchy!' },
      { p: 'Rewrite in active voice: "The experiment was completed by the students."', a: 'The students completed the experiment.', w: ['The experiment completed the students.', 'The experiment was being completed.', 'Completed was the experiment by students.'], h: 'Make the students the subject.', e: 'Put the doer first: students → completed → experiment.' },
      { p: 'Which revision is most CONCISE? Original: "Due to the fact that it was raining, we made the decision to cancel."', a: 'Because it was raining, we canceled.', w: ['Due to the rain fact, canceling was our decision.', 'It was raining and so therefore we thus canceled.', 'The cancellation was decided by us rainily.'], h: 'Cut phrases that add words but no meaning.', e: '"Due to the fact that" → "Because." Tight writing wins.' },
      { p: 'When IS passive voice the better choice?', a: 'When the doer is unknown or unimportant: "My bike was stolen."', w: ['Never — passive is always wrong', 'In every sports report', 'When you want longer sentences'], h: 'Sometimes we don\'t know who did it…', e: 'Passive shines when the action matters more than the actor.' }
    ])
  },

  // ---------- GRADE 9 ----------
  {
    id: 'e.9.literary', name: 'Literary Analysis', grade: 9,
    gen: fromBank([
      { p: 'A story about teens starts: "The town\'s only stoplight blinked yellow, as it had for fifty years." The stoplight most likely SYMBOLIZES…', a: 'the town\'s unchanging, stuck-in-time nature', w: ['traffic safety rules', 'the color yellow', 'electricity'], h: 'Fifty years of blinking the same way…', e: 'Symbols carry bigger meaning — the light = a town where nothing changes.' },
      { p: 'When the audience knows the "surprise" party secret but the main character doesn\'t, that\'s…', a: 'dramatic irony', w: ['verbal irony', 'a plot hole', 'foreshadowing'], h: 'WE know; the character doesn\'t.', e: 'Dramatic irony = audience knowledge gap.' },
      { p: '"The first chapter mentions a locked drawer three times." An attentive reader suspects…', a: 'foreshadowing — the drawer will matter later', w: ['the author likes furniture', 'a typo', 'the drawer is unimportant'], h: 'Why mention it THREE times?', e: 'Repeated details are usually loaded guns — foreshadowing!' },
      { p: 'A character who exists mainly to highlight the hero\'s traits by contrast is called a…', a: 'foil', w: ['protagonist', 'narrator', 'mentor'], h: 'Like a cautious friend next to a reckless hero.', e: 'A foil contrasts to reveal the hero more sharply.' },
      { p: '"I could tell she was lying — her story had more holes than my old socks." The TONE here is…', a: 'wry and humorous', w: ['formal and academic', 'terrified', 'romantic'], h: 'The sock joke gives it away.', e: 'The playful comparison creates a wry, casual tone.' }
    ])
  },
  {
    id: 'e.9.vocab', name: 'College-Bound Vocab I', grade: 9,
    gen: fromBank([
      { p: 'The senator gave an EQUIVOCAL answer, pleasing both sides while promising nothing. Equivocal means…', a: 'deliberately vague or ambiguous', w: ['equal in size', 'honest and direct', 'angry'], h: 'Pleasing both sides by committing to neither…', e: 'Equivocal = intentionally unclear.' },
      { p: 'Her UBIQUITOUS phone case brand was in every store, every ad, every locker. Ubiquitous means…', a: 'seeming to be everywhere', w: ['rare', 'expensive', 'fragile'], h: 'Every store, every ad…', e: 'Ubiquitous = found everywhere at once.' },
      { p: 'He tried to MITIGATE the damage by apologizing immediately. Mitigate means…', a: 'make less severe', w: ['make worse', 'ignore', 'celebrate'], h: 'The apology aimed to soften things.', e: 'Mitigate = reduce the badness.' },
      { p: 'The teacher\'s PERFUNCTORY "good job" — said without looking up — deflated the class. Perfunctory means…', a: 'done without care or enthusiasm', w: ['perfect', 'loud', 'thoughtful'], h: 'Said without even looking up…', e: 'Perfunctory = going through the motions.' },
      { p: 'The startup\'s growth was EXPONENTIAL — 10 users, then 100, then 10,000. Exponential means…', a: 'increasing at a rapidly accelerating rate', w: ['steady and slow', 'fake', 'temporary'], h: '10 → 100 → 10,000…', e: 'Each step multiplies — that\'s exponential growth. 📈' }
    ])
  },

  // ---------- GRADE 10 ----------
  {
    id: 'e.10.rhetoric', name: 'Rhetoric & Persuasion', grade: 10,
    gen: fromBank([
      { p: '"Ask not what your country can do for you—ask what you can do for your country." The flipped structure is called…', a: 'antithesis/chiasmus', w: ['hyperbole', 'onomatopoeia', 'understatement'], h: 'The phrase mirrors and reverses itself.', e: 'The reversal (chiasmus) makes it unforgettable.' },
      { p: 'A speaker begins: "I\'ve worked in this hospital for 22 years." She is building…', a: 'ethos (credibility)', w: ['pathos (emotion)', 'logos (logic)', 'kairos (timing)'], h: 'Why mention her experience first?', e: '22 years of experience = trust me, I know this field.' },
      { p: '"We shall fight on the beaches, we shall fight on the landing grounds, we shall fight in the fields…" The repetition at each start is…', a: 'anaphora', w: ['alliteration', 'assonance', 'a run-on error'], h: 'Same words repeated at the START of phrases.', e: 'Anaphora hammers the message home like a drumbeat.' },
      { p: 'A rhetorical question ("Do we really want to be the school that cuts its own music program?") works by…', a: 'leading the audience to answer it themselves', w: ['requiring a written answer', 'confusing listeners', 'providing statistics'], h: 'No answer expected — but one is implied.', e: 'The audience answers internally — persuasion by participation.' },
      { p: 'Which is a logical FALLACY? ', a: '"My opponent failed math in 7th grade, so ignore his budget plan." (ad hominem)', w: ['"The budget has a $2M gap, per the audit."', '"Three districts tried this and saved money."', '"Experts reviewed the plan."'], h: 'Which one attacks the person, not the idea?', e: 'Ad hominem = attacking the speaker instead of the argument.' }
    ])
  },
  {
    id: 'e.10.vocab', name: 'College-Bound Vocab II', grade: 10,
    gen: fromBank([
      { p: 'The committee reached a CONSENSUS after hours of debate. Consensus means…', a: 'general agreement', w: ['a formal vote', 'an argument', 'a punishment'], h: 'Everyone finally aligned.', e: 'Consensus = collective agreement.' },
      { p: 'His ANECDOTAL evidence — "my cousin tried it once" — didn\'t convince the scientists. Anecdotal means…', a: 'based on personal stories, not data', w: ['mathematically proven', 'ancient', 'anonymous'], h: 'One cousin ≠ a study.', e: 'Anecdotes are stories; science wants data.' },
      { p: 'The negotiation required PRAGMATIC compromises rather than idealistic demands. Pragmatic means…', a: 'practical and realistic', w: ['stubborn', 'emotional', 'dishonest'], h: 'Opposite of head-in-the-clouds.', e: 'Pragmatic = focused on what actually works.' },
      { p: 'Her SCRUPULOUS lab notes recorded every measurement to the milligram. Scrupulous means…', a: 'extremely careful and precise', w: ['messy', 'suspicious', 'brief'], h: 'Every. Single. Milligram.', e: 'Scrupulous = meticulous attention to detail.' },
      { p: 'The dictator tried to SUPPRESS the news story. Suppress means…', a: 'forcibly prevent from spreading', w: ['publish widely', 'translate', 'summarize'], h: 'What do dictators do to stories they hate?', e: 'Suppress = squash, silence, hold down.' }
    ])
  },

  // ---------- GRADE 11 ----------
  {
    id: 'e.11.analysis', name: 'Advanced Analysis', grade: 11,
    gen: fromBank([
      { p: 'An author describes a mansion\'s "chandeliers dripping crystal over guests who checked their phones, bored." The JUXTAPOSITION suggests…', a: 'wealth does not guarantee fulfillment', w: ['chandeliers are heavy', 'phones are useful', 'parties are fun'], h: 'Luxury… next to boredom.', e: 'Placing opulence beside apathy critiques empty wealth.' },
      { p: 'In an unreliable-narrator story, the reader should…', a: 'question the narrator\'s version of events', w: ['trust every detail', 'skip the narration', 'assume the author is lying'], h: 'The teller might be fooling themselves — or you.', e: 'Unreliable narrators require reading between the lines.' },
      { p: '"The assembly line birthed another identical day." This metaphor frames modern work as…', a: 'dehumanizing repetition', w: ['exciting creation', 'family life', 'high technology'], h: 'People as products of an assembly line…', e: 'The factory metaphor critiques monotonous routine.' },
      { p: 'A poem\'s meter suddenly breaks in its final line. A strong analysis would ask…', a: 'what meaning the disruption creates', w: ['whether the poet forgot to count', 'if the printer made an error', 'nothing — meter never matters'], h: 'In good poems, breaks are choices.', e: 'Form mirrors meaning — a broken rhythm often marks a broken idea.' }
    ])
  },
  {
    id: 'e.11.satvocab', name: 'SAT Vocabulary', grade: 11,
    gen: fromBank([
      { p: 'The CEO\'s EBULLIENT keynote had investors cheering. Ebullient means…', a: 'overflowing with enthusiasm', w: ['boring', 'hostile', 'confusing'], h: 'The crowd was CHEERING.', e: 'Ebullient = bubbling with energy.' },
      { p: 'The evidence CORROBORATED the witness\'s account. Corroborated means…', a: 'confirmed/supported', w: ['contradicted', 'erased', 'complicated'], h: 'The evidence and story matched.', e: 'Corroborate = back up with confirmation.' },
      { p: 'His LACONIC reply — "Fine." — ended the interview. Laconic means…', a: 'using very few words', w: ['long-winded', 'dishonest', 'cheerful'], h: 'One. Word.', e: 'Laconic = brief to the point of bluntness.' },
      { p: 'The manager tried to CIRCUMVENT the new regulations. Circumvent means…', a: 'find a way around', w: ['strictly follow', 'rewrite', 'announce'], h: 'Circum = around.', e: 'Circumvent = dodge/bypass cleverly.' },
      { p: 'Her PROLIFIC output — three novels in two years — amazed critics. Prolific means…', a: 'producing a great amount', w: ['professional', 'secretive', 'inconsistent'], h: 'THREE novels in TWO years!', e: 'Prolific = abundantly productive.' }
    ])
  },

  // ---------- GRADE 12 ----------
  {
    id: 'e.12.synthesis', name: 'Synthesis & Argument', grade: 12,
    gen: fromBank([
      { p: 'Source A says remote work boosts productivity 13%; Source B says it weakens mentorship. A strong SYNTHESIS essay would…', a: 'weigh both findings to build a nuanced position', w: ['use only Source A', 'declare both sources useless', 'avoid taking any position'], h: 'Synthesis = weaving sources, not picking one.', e: 'Great writers integrate conflicting evidence into a refined claim.' },
      { p: 'A thesis is DEFENSIBLE when it…', a: 'takes a position someone could reasonably dispute', w: ['states an obvious fact', 'lists three topics', 'asks a question'], h: '"The sky is blue" needs no defense…', e: 'If no one could disagree, there\'s nothing to argue.' },
      { p: 'Which is the STRONGEST thesis?', a: 'Social media\'s algorithmic feeds, while connecting communities, erode attention in ways that demand design regulation.', w: ['Social media exists.', 'This essay is about social media.', 'Many people use social media every day.'], h: 'Look for a debatable claim with stakes.', e: 'It stakes a claim, concedes a point, and previews the argument.' },
      { p: 'In academic writing, a "concession" does what?', a: 'admits a valid opposing point before countering it', w: ['apologizes for the essay', 'ends the essay early', 'repeats the thesis'], h: '"Admittedly… however…"', e: 'Conceding fairly earns the reader\'s trust before your rebuttal.' },
      { p: 'Quoting a source without citing it is…', a: 'plagiarism — even if unintentional', w: ['fine if it\'s short', 'fine if you agree with it', 'only wrong in science class'], h: 'Whose words are they?', e: 'Always cite. Integrity is the foundation of scholarship.' }
    ])
  },
  {
    id: 'e.12.style', name: 'Mastering Style', grade: 12,
    gen: fromBank([
      { p: 'Which revision best fixes wordiness? "In the event that you should happen to require assistance…"', a: '"If you need help…"', w: ['"In the event of requiring assistance…"', '"Should assistance requirements happen…"', '"When help necessities arise for you…"'], h: 'Say it like a human.', e: 'Four words beat eleven. Clarity is style.' },
      { p: 'For a college application essay, the best tone is usually…', a: 'authentic and specific to your real voice', w: ['as formal and thesaurus-heavy as possible', 'edgy and sarcastic', 'apologetic and modest'], h: 'Admissions readers can smell a thesaurus.', e: 'Your genuine voice + concrete details = memorable essays.' },
      { p: '"The data suggests..." vs "The data suggest..." — in formal writing, "data" is traditionally…', a: 'plural ("the data suggest")', w: ['singular always', 'a verb', 'uncountable like "milk"'], h: 'Datum is the singular.', e: 'Traditionally plural, though usage is shifting — know your audience.' },
      { p: 'Parallel structure error: "She loves hiking, painting, and to code." Fix it:', a: '"She loves hiking, painting, and coding."', w: ['"She loves to hike, painting, and to code."', '"She loves hiking, to paint, and coding."', '"She loving hikes, paints, and codes."'], h: 'Match the -ing pattern.', e: 'Lists flow when every item shares the same form.' }
    ])
  }
];

module.exports = { subject: 'english', label: 'English', emoji: '📚', color: '#00B894', skills };

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
      { p: 'Which letter makes the first sound in 🐸 "frog"?', a: 'F', w: ['V', 'P', 'R'], h: 'Fff-frog.', e: 'F starts frog!' },
      { p: 'Which letter makes the first sound in 🍎 "apple"?', a: 'A', w: ['E', 'O', 'H'], h: 'Ah-ah-apple.', e: 'A starts apple!' },
      { p: 'Which letter makes the first sound in 🐢 "turtle"?', a: 'T', w: ['D', 'P', 'C'], h: 'Tuh-tuh-turtle.', e: 'T starts turtle!' },
      { p: 'Which letter makes the LAST sound in "bus" 🚌?', a: 'S', w: ['B', 'U', 'T'], h: 'Bussss…', e: 'Bus ends with the S sound!' },
      { p: 'Which letter makes the first sound in 🌈 "rainbow"?', a: 'R', w: ['W', 'L', 'N'], h: 'Rrr-rainbow.', e: 'R starts rainbow!' },
      { p: 'Which TWO letters together make the first sound in "ship" 🚢?', a: 'SH', w: ['CH', 'TH', 'SP'], h: 'Shhh… like being quiet!', e: 'S+H = the "sh" sound in ship!' }
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
      { p: 'Which word rhymes with "ball"? ⚽', a: 'tall', w: ['bat', 'run', 'net'], h: 'Listen for -all.', e: 'Ball, tall!' },
      { p: 'Which word rhymes with "dog"? 🐶', a: 'frog', w: ['cat', 'dig', 'den'], h: 'Listen for -og.', e: 'Dog, frog — ribbit! 🐸' },
      { p: 'Which word rhymes with "night"? 🌙', a: 'light', w: ['dark', 'sleep', 'note'], h: 'Listen for -ight.', e: 'Night, light!' },
      { p: 'Which word does NOT rhyme with the others: bake, lake, cake, book?', a: 'book', w: ['bake', 'lake', 'cake'], h: 'Three end in -ake…', e: 'Book breaks the rhyme — it ends differently!' },
      { p: 'Which word rhymes with "goat"? 🐐', a: 'boat', w: ['barn', 'grass', 'got'], h: 'Listen for -oat.', e: 'Goat, boat — off they float!' },
      { p: 'Finish the silly rhyme: "The bear sat on a ___!" 🐻', a: 'chair', w: ['couch', 'log', 'floor'], h: 'It must rhyme with bear!', e: 'Bear, chair! Rhymes make poems fun.' }
    ])
  },
  {
    id: 'e.k.sight', name: 'Sight Word Stars', grade: 0,
    gen: fromBank([
      { p: 'Finish the sentence: "I ___ a big dog." 🐕', a: 'see', w: ['sea', 'sew', 'so'], h: 'Which word means using your eyes?', e: '"I see a big dog." See = look with your eyes.' },
      { p: 'Finish: "We ___ to the park."', a: 'go', w: ['goo', 'got', 'do'], h: 'It means to move somewhere.', e: '"We go to the park."' },
      { p: 'Finish: "___ you like pizza?" 🍕', a: 'Do', w: ['Did', 'Done', 'To'], h: 'It starts a question.', e: '"Do you like pizza?"' },
      { p: 'Finish: "The cat is ___ the box." 📦', a: 'in', w: ['on top off', 'inn', 'an'], h: 'Where do cats love to sit?', e: '"The cat is in the box."' },
      { p: 'Finish: "I like ___ play outside."', a: 'to', w: ['too', 'two', 'so'], h: 'It comes before an action word.', e: '"I like to play."' },
      { p: 'Finish: "She ___ my best friend."', a: 'is', w: ['are', 'am', 'be'], h: 'One person → is.', e: '"She is my best friend."' },
      { p: 'Finish: "Look ___ the butterfly!" 🦋', a: 'at', w: ['an', 'it', 'up of'], h: 'You look ___ something.', e: '"Look at the butterfly!"' },
      { p: 'Finish: "Can you ___ me?"', a: 'help', w: ['halp', 'helps I', 'hulp'], h: 'What do you ask when you need a hand?', e: '"Can you help me?"' },
      { p: 'Finish: "The bird ___ fly high." 🐦', a: 'can', w: ['con', 'kan', 'must to'], h: 'It means "is able to".', e: '"The bird can fly high."' },
      { p: 'Finish: "___ dog is fluffy."', a: 'The', w: ['A the', 'Them', 'Thee'], h: 'The most common little word in English!', e: '"The dog is fluffy."' }
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
      { p: 'Silent E magic! Add an e: "kit" becomes…', a: 'kite', w: ['kitt', 'kits', 'cat'], h: 'The magic e makes the i say its name.', e: 'kit → kite. Go fly it! 🪁' },
      { p: 'Which word has a LONG "a" sound like in "cake"?', a: 'rain', w: ['cat', 'map', 'bag'], h: 'Long a says its name: "ay".', e: 'Rain has the long a sound!' },
      { p: 'Which word has a SHORT "u" sound like in "umbrella"? ☂️', a: 'duck', w: ['cute', 'use', 'tube'], h: 'Short u says "uh".', e: 'Duck has short u!' },
      { p: 'Silent E magic! Add an e: "pin" becomes…', a: 'pine (a tall tree!)', w: ['pinn', 'pins', 'pan'], h: 'The magic e makes the i say its name.', e: 'pin → pine. 🌲' },
      { p: 'How many vowels are in the alphabet (a, e, i, o, u)?', a: '5', w: ['3', '7', '21'], h: 'Count them: a, e, i, o, u!', e: 'Five vowels — every word needs at least one!' },
      { p: 'Which word has TWO vowels working together: "boat", "big", or "bat"?', a: 'boat', w: ['big', 'bat', 'none of them'], h: 'Look for two vowels side by side.', e: 'Boat has o+a teaming up for the long o sound! ⛵' }
    ])
  },
  {
    id: 'e.1.sentence', name: 'Sentence Sense', grade: 1,
    gen: fromBank([
      { p: 'Which one is a complete sentence?', a: 'The puppy runs fast.', w: ['runs fast', 'The puppy', 'fast the'], h: 'A sentence needs a who AND a what-happens.', e: 'It tells WHO (the puppy) and WHAT (runs fast).' },
      { p: 'Which sentence is written correctly?', a: 'I like ice cream.', w: ['i like ice cream', 'I like ice cream', 'i Like Ice Cream.'], h: 'Capital letter at the start, period at the end.', e: 'Capital "I" + period = correct!' },
      { p: 'What goes at the end of a question?', a: '? (question mark)', w: ['. (period)', '! (exclamation point)', ', (comma)'], h: 'Questions ask something.', e: 'Questions always end with ?' },
      { p: 'Put it in order: "school / We / to / walk"', a: 'We walk to school.', w: ['School we to walk.', 'Walk school we to.', 'To we walk school.'], h: 'Start with WHO.', e: '"We walk to school." makes sense!' },
      { p: 'Which word needs a CAPITAL letter? "on monday we swim"', a: 'monday', w: ['on', 'we', 'swim'], h: 'Days of the week are special names.', e: 'Days like Monday always get capitals.' },
      { p: 'What goes at the end of "Watch out for that wave"?', a: '! (exclamation point)', w: ['? (question mark)', ', (comma)', 'nothing'], h: 'It is shouted with excitement or warning!', e: 'Exclamation points show strong feeling! 🌊' },
      { p: 'Which sentence is a QUESTION?', a: 'Where is my backpack?', w: ['I lost my backpack.', 'Find the backpack!', 'The backpack is blue.'], h: 'Questions ask for an answer.', e: 'It asks something — that is a question!' },
      { p: 'Fix it: "my birthday is in june" — which TWO words need capitals?', a: 'My and June', w: ['my and is', 'birthday and in', 'is and in'], h: 'First word + month names.', e: 'Sentences start with capitals, and months are proper nouns!' },
      { p: 'Which telling sentence needs a period at the end?', a: 'We planted a garden', w: ['Did you plant it', 'Wow, what a garden', 'Plant it now, hurry'], h: 'Telling sentences just share information.', e: '"We planted a garden." — statement, period!' },
      { p: 'How many sentences: "The sun set. The stars came out. We made a wish."', a: '3', w: ['1', '2', '5'], h: 'Count the periods!', e: 'Three periods = three sentences! ⭐' }
    ])
  },
  {
    id: 'e.1.reading', name: 'Story Detective', grade: 1,
    gen: fromBank([
      { p: 'Read: "Max the dog dug a hole. He hid his bone inside. Then he took a nap." What did Max hide?', a: 'his bone', w: ['his ball', 'a stick', 'his food bowl'], h: 'Read the middle sentence again.', e: 'Max hid his bone in the hole!' },
      { p: 'Read: "Lily planted a seed. She watered it every day. A sunflower grew tall!" What grew?', a: 'a sunflower', w: ['a rose', 'a tree', 'grass'], h: 'Check the last sentence.', e: 'Watering every day made the sunflower grow! 🌻' },
      { p: 'Read: "Sam lost his red mitten. He looked under the bed. It was in the dog\'s bed!" Where was the mitten?', a: "in the dog's bed", w: ['under the bed', 'in his backpack', 'outside'], h: 'The last sentence tells you.', e: 'The dog took it! 🐶' },
      { p: 'Read: "It was raining. Mia grabbed her umbrella and boots. She jumped in every puddle." What was the weather?', a: 'rainy', w: ['sunny', 'snowy', 'windy'], h: 'The first sentence says it.', e: 'Raining — perfect puddle weather! ☔' },
      { p: 'Read: "Ben built a tower of blocks up to his chin. His baby sister crawled over. CRASH!" What probably happened?', a: 'His sister knocked the tower down', w: ['The blocks flew away', 'Ben grew taller', 'The tower turned real'], h: 'What do babies do to towers?', e: 'CRASH = tower down. Baby sisters! 😄' },
      { p: 'Read: "Nora fed the fish. She fed the cat. She fed the hamster. Whew!" What is Nora doing?', a: 'taking care of her pets', w: ['eating dinner', 'playing games', 'cleaning her room'], h: 'Fed, fed, fed…', e: 'Nora is the family pet helper!' },
      { p: 'Read: "Theo put on his helmet. He kicked off the ground and rolled down the sidewalk." What is Theo riding?', a: 'something with wheels (like a bike or scooter)', w: ['a horse', 'a boat', 'a sled'], h: 'Helmet + rolling on a sidewalk…', e: 'Rolling + helmet = wheels! Safety first. 🛴' },
      { p: 'Read: "The popcorn popped. The lights went dark. Everyone got quiet." Where is this story happening?', a: 'at a movie', w: ['at the beach', 'at school', 'in a garden'], h: 'Popcorn + dark room + quiet…', e: 'All the clues point to movie time! 🍿' }
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
      { p: 'Read: "A penguin cannot fly, but it is an amazing swimmer. It uses its wings like flippers to zoom through icy water." How does a penguin use its wings?', a: 'Like flippers for swimming', w: ['For flying high', 'To keep warm', 'To catch fish in the air'], h: 'Find the sentence about wings.', e: 'Wings = flippers underwater! 🐧' },
      { p: 'Read: "Bats sleep all day hanging upside down. At night they wake up and hunt for insects." When do bats hunt?', a: 'at night', w: ['in the morning', 'all day', 'never'], h: '"At night they wake up…"', e: 'Bats are nocturnal — night hunters! 🦇' },
      { p: 'Read: "Kim lost the game. She shook hands with the other team and said good game." What kind of person is Kim?', a: 'a good sport', w: ['a sore loser', 'a show-off', 'a quitter'], h: 'How did she act after LOSING?', e: 'Congratulating the winners = great sportsmanship! 🤝' },
      { p: 'Read: "The desert gets very little rain. Cactus plants store water inside their thick stems. That is how they survive." WHY do cactuses store water?', a: 'because the desert has very little rain', w: ['because they like swimming', 'to share with animals', 'to grow flowers'], h: 'The first sentence gives the reason.', e: 'Little rain → store water. Cause and effect!' },
      { p: 'Read: "First we mixed the flour and eggs. Then we poured the batter. Soon golden pancakes were ready!" What is this passage about?', a: 'how pancakes get made', w: ['why eggs are healthy', 'where flour comes from', 'when to eat dinner'], h: 'First… then… soon…', e: 'A how-it-happens sequence! 🥞' }
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
      { p: 'Plural time! One mouse, two ___?', a: 'mice', w: ['mouses', 'mouse', 'mices'], h: 'Some plurals are irregular — they change completely.', e: 'Mouse → mice. Tricky English! 🐭' },
      { p: 'In "The children giggled loudly," which word tells HOW they giggled?', a: 'loudly', w: ['children', 'giggled', 'the'], h: 'Words ending in -ly often describe actions.', e: 'Loudly is an adverb — it describes the giggling!' },
      { p: 'Plural time! One box, two ___?', a: 'boxes', w: ['boxs', 'boxies', 'box'], h: 'Words ending in x add -es.', e: 'box → boxes. 📦📦' },
      { p: 'Which sentence uses the verb correctly?', a: 'The dogs bark at the mailman.', w: ['The dogs barks at the mailman.', 'The dog bark at the mailman.', 'The dogs barking the mailman.'], h: 'Many dogs → bark (no s).', e: 'Plural subject + plural verb = match!' },
      { p: 'In "We visited the enormous aquarium," which word is the ADJECTIVE?', a: 'enormous', w: ['visited', 'aquarium', 'we'], h: 'Which word describes the aquarium?', e: 'Enormous describes the aquarium — adjective!' },
      { p: 'Choose the right verb: "Tomorrow we ___ swim at the lake."', a: 'will', w: ['did', 'was', 'were'], h: '"Tomorrow" = future!', e: 'Will = future tense. See you at the lake! 🏊' }
    ])
  },
  {
    id: 'e.2.contractions', name: 'Contraction Action', grade: 2,
    gen: fromBank([
      { p: '"Do not touch the wet paint!" — Which contraction means "do not"?', a: "don't", w: ["doesn't", "didn't", "won't"], h: 'Squish the words: do + not.', e: "do + not = don't. The apostrophe replaces the o." },
      { p: '"She will win the race!" — Which contraction means "she will"?', a: "she'll", w: ["she's", "shell", "she'd"], h: 'she + will, drop the wi.', e: "she + will = she'll" },
      { p: 'What does "can\'t" mean?', a: 'cannot', w: ['can it', 'could not', 'care not'], h: 'Break it apart.', e: "can't = cannot." },
      { p: '"It is snowing!" — Which contraction fits: "___ snowing!"', a: "It's", w: ['Its', "It'is", 'Itss'], h: 'It + is, with an apostrophe.', e: "It's = it is. (Its without apostrophe means belonging to it!)" },
      { p: 'What does "we\'re" mean?', a: 'we are', w: ['we were', 'we care', 'where'], h: 'Break it apart: we + ?', e: "we're = we are." },
      { p: '"I have finished my homework!" — Which contraction means "I have"?', a: "I've", w: ["I'm", "I'll", "Ive"], h: 'I + have, squished with an apostrophe.', e: "I've = I have. Homework done! 🎉" },
      { p: 'What does "won\'t" mean?', a: 'will not', w: ['want not', 'was not', 'would not'], h: 'The trickiest contraction — it changes spelling!', e: "won't = will not. English is sneaky sometimes!" },
      { p: '"They are coming to the party." — Which contraction means "they are"?', a: "they're", w: ['their', 'there', 'theyare'], h: 'they + are.', e: "they're = they are. (Not their or there!)" },
      { p: 'What does "let\'s" mean in "Let\'s go!"?', a: 'let us', w: ['let is', 'lots', 'later'], h: 'Let + us, squished!', e: "Let's = let us. Let's learn more!" },
      { p: 'Which is correct?', a: "You shouldn't run by the pool.", w: ["You should'nt run by the pool.", 'You shouldnt run by the pool.', "You sh'ouldnt run by the pool."], h: 'The apostrophe replaces the missing o in "not".', e: "should + not = shouldn't — apostrophe where the o vanished!" }
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
      { p: 'What is the OPPOSITE of "ancient"?', a: 'brand-new', w: ['very old', 'broken', 'dusty'], h: 'Ancient means very, very old.', e: 'Ancient ↔ brand-new.' },
      { p: 'The trail was RUGGED, full of rocks and roots. Rugged means…', a: 'rough and uneven', w: ['smooth', 'short', 'colorful'], h: 'Rocks and roots everywhere!', e: 'Rugged = rough. Wear good boots! 🥾' },
      { p: 'Dad was FAMISHED after the long hike. Famished means…', a: 'very hungry', w: ['very famous', 'very tired', 'very lost'], h: 'What do you want most after a long hike?', e: 'Famished = starving hungry!' },
      { p: 'The magician VANISHED in a puff of smoke! Vanished means…', a: 'disappeared', w: ['danced', 'shouted', 'bowed'], h: 'Poof — gone!', e: 'Vanished = disappeared completely. 🎩✨' },
      { p: 'Lena felt JUBILANT when her team won the championship. Jubilant means…', a: 'extremely happy', w: ['jealous', 'nervous', 'sleepy'], h: 'They WON — how would you feel?', e: 'Jubilant = bursting with joy! 🏆' },
      { p: 'The instructions were BAFFLING — nobody could figure them out. Baffling means…', a: 'very confusing', w: ['very clear', 'very short', 'very funny'], h: 'NOBODY could figure them out.', e: 'Baffling = super confusing.' }
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
      { p: 'What does "preheat" the oven mean?', a: 'heat it BEFORE cooking', w: ['heat it twice', 'not heat it', 'heat it too much'], h: 'Pre- means before.', e: 'Pre- = before. You preheat before baking! 🍪' },
      { p: 'MIS-spell, MIS-place, MIS-take… What does "mis-" mean?', a: 'wrongly / badly', w: ['again', 'more', 'before'], h: 'A misspelled word is spelled ___.', e: 'Mis- = wrongly. Misplace = put in the wrong place!' },
      { p: 'Hope + less = hopeless. What does "-less" mean?', a: 'without', w: ['full of', 'smaller', 'again'], h: 'Hopeless = ___ hope.', e: '-less = without. Fearless = without fear!' },
      { p: 'What does "biCYCLE" literally mean? (bi- = two)', a: 'two wheels', w: ['fast wheels', 'big wheels', 'one wheel'], h: 'Bi- means two!', e: 'Bi + cycle = two wheels. A unicycle has one! 🚲' },
      { p: 'Slow + ly = slowly. The suffix "-ly" usually makes…', a: 'a word that describes HOW something happens', w: ['a person word', 'a place word', 'the past tense'], h: 'She walked slowly = HOW she walked.', e: '-ly makes adverbs: quickly, quietly, bravely!' },
      { p: 'Which word means "heat something AGAIN"?', a: 'reheat', w: ['preheat', 'unheat', 'misheat'], h: 're- = again.', e: 'Reheat = heat again. Leftover pizza! 🍕' }
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
      { p: 'Synonym for "brave"?', a: 'courageous', w: ['afraid', 'careful', 'strong-smelling'], h: 'Think of a firefighter. 🚒', e: 'Brave = courageous = fearless.' },
      { p: 'Antonym of "expand"?', a: 'shrink', w: ['grow', 'stretch', 'explode'], h: 'Expand means get bigger.', e: 'Expand ↔ shrink.' },
      { p: 'Synonym for "difficult"?', a: 'challenging', w: ['easy', 'boring', 'quick'], h: 'A challenging puzzle is a ___ one.', e: 'Difficult = challenging = tough — and you can handle all three!' },
      { p: 'Antonym of "whisper"?', a: 'shout', w: ['murmur', 'talk', 'breathe'], h: 'From quietest to loudest…', e: 'Whisper ↔ shout! 📣' },
      { p: 'Synonym for "begin"?', a: 'commence', w: ['finish', 'pause', 'cancel'], h: 'Fancy word for start!', e: 'Begin = start = commence. Let the games commence!' },
      { p: 'Your story says "said" 10 times! Which replacement shows the character is ANGRY?', a: 'snapped', w: ['whispered', 'giggled', 'mumbled'], h: 'Which word sounds sharp and mad?', e: '"Snapped" shows anger without saying angry — a writer trick!' }
    ])
  },
  {
    id: 'e.3.reading', name: 'Deep Reading', grade: 3,
    gen: fromBank([
      { p: 'Read: "Rosa\'s alarm didn\'t go off. She skipped breakfast, grabbed her backpack, and sprinted to the bus stop — just as the bus pulled away." How does Rosa probably feel?', a: 'frustrated and worried', w: ['relaxed', 'excited', 'proud'], h: 'She rushed AND missed the bus.', e: 'Missing the bus after rushing = frustrating morning!' },
      { p: 'Read: "The old lighthouse had guided ships for 100 years. Now its light was dark, but visitors climbed its stairs every day to see the view." What is the lighthouse used for NOW?', a: 'a place for visitors to see the view', w: ['guiding ships', 'a home', 'storing boats'], h: '"Now" starts the key sentence.', e: 'It went from guiding ships to hosting visitors.' },
      { p: 'Read: "Jamal practiced his lines every night for two weeks. On opening night, he didn\'t miss a single word." What LESSON does this story teach?', a: 'Practice leads to success', w: ['Plays are scary', 'Never memorize lines', 'Luck is everything'], h: 'What did practicing every night lead to?', e: 'Two weeks of practice = a perfect performance. 🎭' },
      { p: 'Read: "Unlike her noisy brother, June loved silent mornings with a book and cocoa." The word "Unlike" shows the author is…', a: 'comparing two different people', w: ['telling a joke', 'giving directions', 'asking a question'], h: '"Unlike" sets up a contrast.', e: 'The author contrasts June with her brother.' },
      { p: 'Read: "The market buzzed like a beehive." This sentence is an example of…', a: 'a simile (comparing with "like")', w: ['a fact', 'dialogue', 'a question'], h: 'It compares using the word "like".', e: 'Similes compare with like/as — busy market = buzzing hive! 🐝' },
      { p: 'Read: "Every Saturday, Pop and I fix things in his garage. He says broken things are just puzzles waiting to be solved." What does Pop think about broken things?', a: 'They are fun problems to solve', w: ['They should be thrown away', 'They are dangerous', 'They fix themselves'], h: '"Broken things are just puzzles."', e: 'Pop sees fixing as puzzle-solving — a growth mindset! 🔧' },
      { p: 'Read: "The recipe said one CUP of sugar. Milo added one BAG. The cookies came out like candy bricks." What caused the candy bricks?', a: 'Milo used way too much sugar', w: ['The oven was broken', 'The recipe was wrong', 'Milo forgot the sugar'], h: 'Compare what the recipe said vs what Milo did.', e: 'One bag is not one cup! Careful reading matters — even in cookies.' },
      { p: 'Read: "At first, Ava dreaded the violin. Squeak, screech! But she practiced daily, and by spring her notes flowed like water." How did Ava change?', a: 'She improved from squeaky to smooth through practice', w: ['She quit the violin', 'She got worse', 'She switched to drums'], h: 'Compare the beginning and the end.', e: 'Daily practice turned screeches into music! 🎻' },
      { p: 'Read: "Recycling one can saves enough energy to run a TV for three hours." Why would an author include this fact?', a: 'to convince readers that recycling matters', w: ['to sell TVs', 'to make readers laugh', 'to describe a character'], h: 'Surprising facts PERSUADE.', e: 'Authors use facts to persuade readers! ♻️' }
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
      { p: '"___ backpacks are on the bus." Which is correct?', a: 'Their', w: ["They're", 'There', 'Theyre'], h: 'It shows the backpacks belong to them.', e: 'Their = ownership. There = a place. They\'re = they are.' },
      { p: '"The ___ baked fresh bread." Which is correct?', a: 'baker', w: ['bakker', 'backer', 'bakir'], h: 'The person who bakes!', e: 'Baker = bread maker. (A backer supports a project!)' },
      { p: '"Let\'s meet at the park over ___." Which is correct?', a: 'there', w: ['their', "they're", 'thier'], h: 'It names a PLACE.', e: 'There = place. Their = ownership.' },
      { p: '"I ___ a letter to grandma." Which is correct?', a: 'wrote', w: ['rote', 'root', 'wroute'], h: 'Past tense of write, with a silent w!', e: 'Wrote = past of write.' },
      { p: '"The ___ blew my hat off!" Which is correct?', a: 'wind', w: ['wined', 'whined', 'winned'], h: 'The weather kind!', e: 'Wind = moving air. Whined = complained!' },
      { p: '"Would you like a ___ of cake?" Which is correct?', a: 'piece', w: ['peace', 'peice', 'pees'], h: 'Remember: "a PIEce of PIE".', e: 'Piece = a slice. Peace = calm and quiet. 🍰' }
    ])
  },

  // ---------- GRADE 4 ----------
  {
    id: 'e.4.figurative', name: 'Figurative Language', grade: 4,
    gen: fromBank([
      { p: '"The classroom was a zoo before the teacher arrived." This is a…', a: 'metaphor (says one thing IS another)', w: ['simile (compares with like/as)', 'a plain fact', 'onomatopoeia (a sound word)'], h: 'It says the room WAS a zoo (no "like" or "as").', e: 'Metaphors say something IS another thing.' },
      { p: '"Her smile was as bright as the sun." This is a…', a: 'simile (compares with like/as)', w: ['metaphor (says it IS the thing)', 'idiom (a saying)', 'hyperbole (huge exaggeration)'], h: 'Look for "as ___ as".', e: 'Similes compare with like or as. ☀️' },
      { p: '"I\'ve told you a MILLION times to clean your room!" This is…', a: 'hyperbole (huge exaggeration)', w: ['a fact', 'a simile', 'personification'], h: 'Was it really a million?', e: 'Hyperbole exaggerates for effect.' },
      { p: '"The wind whispered through the trees." This gives the wind a human ability — that\'s…', a: 'personification (making a thing act human)', w: ['a simile (compares with like/as)', 'alliteration (repeated first sounds)', 'a plain fact'], h: 'Can wind really whisper?', e: 'Personification = giving human traits to non-human things.' },
      { p: '"BOOM! CRASH! The thunder rolled." Words that imitate sounds are called…', a: 'onomatopoeia (words that imitate sounds)', w: ['metaphors (says one thing IS another)', 'synonyms (words that mean the same)', 'pronouns (he, she, it)'], h: 'Buzz, pop, bang…', e: 'Onomatopoeia = sound-effect words! 💥' },
      { p: '"Peter Piper picked a peck of pickled peppers" repeats the P sound. That\'s…', a: 'alliteration (repeated first sounds)', w: ['onomatopoeia (sound-effect words)', 'a metaphor (says it IS the thing)', 'rhyme (matching end sounds)'], h: 'Same starting sound, over and over.', e: 'Alliteration = repeated beginning sounds.' },
      { p: '"Time is a thief." What does this metaphor MEAN?', a: 'Time passes and takes moments away before you notice', w: ['Clocks get stolen often', 'Thieves wear watches', 'Time moves slowly'], h: 'What does a thief do? What does time do?', e: 'Metaphors carry meaning: time "steals" your moments!' },
      { p: '"The old floorboards groaned under our feet." The author uses personification to make the house feel…', a: 'alive and a little creepy', w: ['brand new', 'silent', 'cozy and warm'], h: 'GROANED — like a tired old creature.', e: 'Giving the floor a groan builds atmosphere!' },
      { p: '"She\'s the sunshine of our team." This means she…', a: 'brings happiness and energy to everyone', w: ['plays outdoors only', 'is very tall', 'wears yellow'], h: 'What does sunshine do for a day?', e: 'Metaphor: she brightens the team like sun brightens a day! ☀️' },
      { p: 'Which sentence contains an IDIOM?', a: 'Studying the night before is cutting it close.', w: ['The test has 20 questions.', 'She studied for two hours.', 'The library closes at 8.'], h: 'Which phrase doesn\'t mean its literal words?', e: '"Cutting it close" = barely leaving enough time — an idiom!' }
    ])
  },
  {
    id: 'e.4.mainidea', name: 'Main Idea & Details', grade: 4,
    gen: fromBank([
      { p: 'Read: "Octopuses are escape artists. They can squeeze through cracks the size of a coin, unscrew jar lids from the inside, and squirt ink to vanish. Some aquariums call them the hardest animals to keep in a tank." Best title?', a: 'The Ocean\'s Great Escape Artist', w: ['Jars and Lids', 'Aquarium Jobs', 'Kinds of Ink'], h: 'The title should cover the WHOLE passage.', e: 'Every detail supports the octopus being an escape artist! 🐙' },
      { p: 'Read: "Recess helps students learn. After running and playing, kids focus better in class, remember more, and solve problems faster." Which sentence is a SUPPORTING DETAIL?', a: 'Kids focus better in class after playing', w: ['Recess helps students learn', 'Recess is at 10:30', 'Some kids like tag'], h: 'Details back up the main idea.', e: 'The focus fact supports "recess helps learning."' },
      { p: 'Read: "In 1903, the Wright brothers flew for just 12 seconds. Today, planes cross oceans in hours. In one century, flight went from a 12-second hop to a worldwide highway in the sky." The main idea is…', a: 'Flight improved amazingly fast in 100 years', w: ['Planes are loud', 'The Wright brothers were brothers', '12 seconds is short'], h: 'What change does the whole passage describe?', e: 'From 12 seconds to crossing oceans — huge progress! ✈️' },
      { p: 'A paragraph about recycling says: "Plastic bottles can become playground slides, park benches, and even T-shirts." These examples support which main idea?', a: 'Recycled plastic gets turned into useful new things', w: ['Plastic is cheap', 'T-shirts are comfortable', 'Playgrounds need slides'], h: 'What do all three examples have in common?', e: 'All three show recycling creating new products! ♻️' },
      { p: 'Read: "Honeybees dance to communicate. A waggle dance points to flowers. A tremble dance calls for help unloading nectar. Scientists have decoded over a dozen moves." Best title?', a: 'The Secret Dance Language of Bees', w: ['Flowers Are Pretty', 'Scientists at Work', 'How to Dance'], h: 'What is the WHOLE passage about?', e: 'Every sentence is about bees communicating through dance! 🐝' },
      { p: 'A paragraph\'s main idea is "Exercise strengthens the brain." Which detail does NOT belong?', a: 'Running shoes come in many colors', w: ['Exercise increases blood flow to the brain', 'Students who move daily focus longer', 'A jog can improve memory'], h: 'Which sentence ignores the BRAIN?', e: 'Shoe colors have nothing to do with brains — off topic!' },
      { p: 'Read: "Mount Everest grows about 4mm taller each year as tectonic plates push together. The world\'s tallest peak is still under construction." The main idea is…', a: 'Everest is still slowly growing', w: ['Everest is dangerous to climb', 'Plates exist', 'Mountains are tall'], h: 'What surprising fact does it explain?', e: 'The passage centers on Everest growing 4mm a year! 🏔️' },
      { p: 'Where does a paragraph\'s main idea sentence MOST often appear?', a: 'at the beginning (topic sentence)', w: ['always dead center', 'hidden in a footnote', 'never written down'], h: 'Writers usually lead with it.', e: 'Topic sentences usually open the paragraph — then details follow.' }
    ])
  },
  {
    id: 'e.4.context', name: 'Context Clues', grade: 4,
    gen: fromBank([
      { p: '"The trail was so ARDUOUS that even the fittest hikers stopped to rest five times." Arduous means…', a: 'very difficult and tiring', w: ['beautiful', 'short', 'crowded'], h: 'Even FIT hikers needed 5 rests!', e: 'The clue: fit hikers resting = a very hard trail.' },
      { p: '"Unlike his GREGARIOUS sister who talked to everyone, Ben sat quietly alone." Gregarious means…', a: 'sociable and outgoing', w: ['shy', 'angry', 'sleepy'], h: '"Unlike" contrasts her with quiet Ben.', e: 'She talks to everyone = sociable!' },
      { p: '"The medicine had to be taken PRECISELY at 8:00 — not 7:59, not 8:01." Precisely means…', a: 'exactly', w: ['sometimes', 'quickly', 'secretly'], h: 'Not a minute early or late…', e: 'Precisely = exactly on the dot. ⏰' },
      { p: '"The abandoned house was DILAPIDATED: broken windows, a sagging roof, and peeling paint." Dilapidated means…', a: 'falling apart from neglect', w: ['brand new', 'huge', 'haunted'], h: 'The list after the colon describes it.', e: 'Broken, sagging, peeling = falling apart.' },
      { p: '"Squirrels HOARD acorns in fall, hiding hundreds to eat during winter." Hoard means…', a: 'collect and store away', w: ['throw away', 'eat instantly', 'crack open'], h: 'They hide hundreds… for later.', e: 'Hoarding = stockpiling for winter! 🐿️' },
      { p: '"The crowd\'s cheers were DEAFENING; players couldn\'t hear the coach two feet away." Deafening means…', a: 'extremely loud', w: ['disappointing', 'quiet', 'musical'], h: 'They couldn\'t hear from TWO FEET away!', e: 'So loud it overwhelms hearing = deafening! 📣' },
      { p: '"After the marathon, her legs felt LEADEN, each step heavier than the last." Leaden means…', a: 'heavy and hard to move', w: ['light and springy', 'painted gray', 'made of metal'], h: 'Lead is a very heavy metal…', e: 'Leaden legs = heavy like lead after 26 miles!' },
      { p: '"He gave a PERFUNCTORY wave without looking up from his phone." Perfunctory means…', a: 'done quickly without care or interest', w: ['enthusiastic', 'graceful', 'repeated'], h: 'He didn\'t even look up.', e: 'Perfunctory = going through the motions.' },
      { p: '"The stray cat was WARY of strangers, watching from a distance before approaching." Wary means…', a: 'cautious and careful', w: ['friendly', 'sleepy', 'hungry'], h: 'It watched from a distance first…', e: 'Wary = on guard. Smart cat! 🐈' }
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
      { p: '"Hold your horses!" means…', a: 'wait and be patient', w: ['grab the reins', 'ride faster', 'feed the animals'], h: 'Someone\'s moving too fast.', e: 'Hold your horses = slow down, wait up! 🐴' },
      { p: '"Bite the bullet" means…', a: 'face something unpleasant with courage', w: ['eat quickly', 'go to the dentist', 'chew loudly'], h: 'You finally do the hard thing.', e: 'Biting the bullet = bravely getting it over with.' },
      { p: '"The ball is in your court" means…', a: 'it is YOUR turn to act or decide', w: ['you must play tennis', 'you lost the game', 'you are surrounded'], h: 'From tennis — whose move is it?', e: 'Ball in your court = next move is yours!' },
      { p: '"Don\'t cry over spilled milk" advises you to…', a: 'not waste time on small mistakes already made', w: ['clean up quickly', 'avoid dairy', 'apologize to cows'], h: 'Can you un-spill it?', e: 'It\'s done — move forward instead of moping!' },
      { p: '"Once in a blue moon" means…', a: 'very rarely', w: ['every night', 'when sad', 'monthly'], h: 'How often is the moon blue?', e: 'Blue moons are rare — so is anything that happens "once in a blue moon."' }
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
      { p: 'Which sentence is in PAST tense?', a: 'The rocket soared into the clouds.', w: ['The rocket soars into the clouds.', 'The rocket will soar.', 'The rocket is soaring.'], h: 'Which action already happened?', e: 'Soared = already happened. 🚀' },
      { p: 'Choose correctly: "The library lets students borrow ___ books for two weeks."', a: 'its', w: ["it's", 'their is', 'its own self'], h: "its = belonging to it; it's = it is.", e: 'The books belong to the library → its (no apostrophe).' },
      { p: 'Which sentence uses GOOD/WELL correctly?', a: 'She sings well.', w: ['She sings good.', 'She wells good.', 'She goods well.'], h: 'Well describes HOW you do an action.', e: 'Adverb "well" describes singing. "Good" describes nouns.' },
      { p: 'Find the complete PREDICATE: "My little brother slept through the entire fireworks show."', a: 'slept through the entire fireworks show', w: ['My little brother', 'the fireworks', 'my little'], h: 'The predicate = the verb + everything after.', e: 'Predicate = what the subject DID (all of it).' },
      { p: 'Choose correctly: "There are ___ cookies than yesterday."', a: 'fewer', w: ['less', 'lesser', 'least'], h: 'Cookies can be counted!', e: 'Countable things → fewer. (Less milk, fewer cookies!)' }
    ])
  },
  {
    id: 'e.5.pov', name: 'Author\'s Craft', grade: 5,
    gen: fromBank([
      { p: '"I couldn\'t believe MY eyes when I opened the box." This story is told in…', a: 'first person', w: ['second person', 'third person', 'no person'], h: 'Look for I, me, my.', e: 'I/me/my = first person point of view.' },
      { p: '"She grabbed her helmet and raced outside." This is told in…', a: 'third person', w: ['first person', 'second person', 'past person'], h: 'Look for she/he/they.', e: 'She/he/they = third person.' },
      { p: 'An author writes an article listing 10 reasons school should start later, with studies to back them up. The author\'s PURPOSE is to…', a: 'persuade', w: ['entertain', 'confuse', 'describe a character'], h: 'Reasons + evidence = trying to convince you.', e: 'Persuade = convince the reader! (PIE: Persuade, Inform, Entertain)' },
      { p: 'A recipe explaining how to make tamales step-by-step is written to…', a: 'inform / instruct', w: ['persuade', 'entertain with a story', 'scare the reader'], h: 'It teaches you how to do something.', e: 'Recipes inform — they teach steps.' },
      { p: 'Which sentence sets a SPOOKY mood?', a: 'Fog crawled over the graveyard as the gate creaked open.', w: ['The sun sparkled on the happy beach.', 'The cafeteria served tacos on Tuesday.', 'Her birthday party had 12 balloons.'], h: 'Which one gives you shivers?', e: 'Fog + graveyard + creaking = spooky mood! 👻' },
      { p: '"You won\'t believe what happens when you open the door…" This narration is written in…', a: 'second person', w: ['first person', 'third person', 'no point of view'], h: 'It talks straight to YOU.', e: 'You/your = second person — common in game books!' },
      { p: 'A comic strip about a cat who fails hilariously at catching a laser dot is written mainly to…', a: 'entertain', w: ['persuade', 'inform', 'warn readers about lasers'], h: 'PIE: persuade, inform, ___?', e: 'Funny cat comics = entertainment!' },
      { p: 'Why might an author choose FIRST person for a mystery story?', a: 'Readers only know what the narrator knows — keeping secrets hidden', w: ['It uses fewer words', 'It is easier to spell', 'It lets readers see every character\'s thoughts'], h: 'Limited knowledge = suspense!', e: 'First person hides clues the narrator hasn\'t found yet. 🕵️' },
      { p: 'Which line creates a PEACEFUL mood?', a: 'Soft waves hushed against the shore as the lanterns dimmed.', w: ['Sirens screamed through the shattered streets.', 'The bell rattled the rusty gate.', 'Thunder split the black sky.'], h: 'Which one relaxes you?', e: 'Hushing waves + dimming lanterns = calm. 🌊' }
    ])
  },

  // ---------- GRADE 6 ----------
  {
    id: 'e.6.theme', name: 'Theme & Summary', grade: 6,
    gen: fromBank([
      { p: 'In a story, a rich king learns that his servant, who owns almost nothing, is the happiest person in the kingdom. The THEME is likely…', a: 'Happiness doesn\'t come from wealth', w: ['Kings are powerful', 'Servants work hard', 'Castles are large'], h: 'Theme = the life lesson, not the plot.', e: 'The contrast teaches that money ≠ happiness.' },
      { p: 'Which is the BEST summary of "The Tortoise and the Hare"?', a: 'A slow tortoise beats a fast hare by staying steady while the hare naps.', w: ['A hare is very fast.', 'Animals once raced.', 'The tortoise cheated to win the race.'], h: 'A summary covers beginning, middle, and end briefly.', e: 'It captures who, what, and the outcome — no extra details.' },
      { p: 'A story shows a girl who fails her first three skateboard competitions but keeps practicing and finally lands her trick. Theme?', a: 'Perseverance pays off', w: ['Skateboarding is dangerous', 'Competitions are unfair', 'Talent matters most'], h: 'What does her journey teach?', e: 'Failing, practicing, succeeding = perseverance! 🛹' },
      { p: 'What should a good summary NEVER include?', a: 'Your personal opinions', w: ['The main character', 'The main problem', 'How it ends'], h: 'Summaries report; they don\'t review.', e: 'Save opinions for reviews — summaries stick to the story.' },
      { p: 'A novel repeatedly shows characters who lie getting tangled in bigger and bigger problems. The theme is…', a: 'Dishonesty creates growing consequences', w: ['Lying is exciting', 'Problems are unavoidable', 'Characters talk too much'], h: 'What happens to liars in this story, every time?', e: 'Repeated pattern = the author\'s message about honesty.' },
      { p: 'THEME vs TOPIC: a story\'s TOPIC is friendship. Its THEME would be…', a: 'True friends stand by you even when it costs them', w: ['Friendship', 'Two friends', 'A story about friends'], h: 'Theme is a complete statement, not one word.', e: 'Topic = subject word. Theme = the lesson ABOUT it.' },
      { p: 'Why can two readers find DIFFERENT themes in the same story?', a: 'Themes are interpreted from evidence, and readers weigh evidence differently', w: ['One reader must be wrong', 'Stories change between readings', 'Themes are chosen randomly'], h: 'Both can support their view with the text…', e: 'Literature allows multiple supported interpretations!' },
      { p: 'The BEST length for a summary of a 300-page novel is about…', a: 'a paragraph hitting the key events', w: ['300 pages', 'one word', '50 pages of quotes'], h: 'Summaries compress!', e: 'Summaries shrink the story to essentials.' }
    ])
  },
  {
    id: 'e.6.vocab', name: 'Vocabulary Builder', grade: 6,
    gen: fromBank([
      { p: 'The coach was ADAMANT that practice would happen, rain or shine. Adamant means…', a: 'firmly refusing to change your mind', w: ['unsure', 'joyful', 'forgetful'], h: 'Rain OR shine — no exceptions.', e: 'Adamant = totally firm and unshakable.' },
      { p: 'After the trailer dropped, excitement for the movie was PALPABLE — you could practically feel it in the hallways. Palpable means…', a: 'so intense it feels touchable', w: ['invisible', 'fake', 'quiet'], h: 'You could FEEL it.', e: 'Palpable = almost physically feelable.' },
      { p: 'She gave a CANDID review: "The first level is great, the boss fight needs work." Candid means…', a: 'honest and direct', w: ['secretive', 'angry', 'sugarcoated'], h: 'She said exactly what she thought.', e: 'Candid = truthful, straight-up.' },
      { p: 'The instructions were so AMBIGUOUS that half the class did the wrong page. Ambiguous means…', a: 'unclear, with more than one meaning', w: ['very loud', 'detailed', 'ancient'], h: 'Half the class got confused…', e: 'Ambiguous = open to multiple interpretations.' },
      { p: 'Cleaning the beach wasn\'t MANDATORY, but almost everyone volunteered. Mandatory means…', a: 'required', w: ['optional', 'fun', 'illegal'], h: '"Wasn\'t ___, BUT they came anyway."', e: 'Mandatory = you must do it.' },
      { p: 'The library was a SANCTUARY for Amir — quiet, safe, and completely his. Sanctuary means…', a: 'a place of safety and peace', w: ['a loud arena', 'a type of book', 'a punishment'], h: 'Quiet, safe…', e: 'Sanctuary = a protected, peaceful refuge.' },
      { p: 'Her plans were METICULOUS: color-coded lists, timed schedules, backup options. Meticulous means…', a: 'extremely careful about details', w: ['messy', 'quick', 'expensive'], h: 'Color-coded EVERYTHING.', e: 'Meticulous = precise down to the smallest detail.' },
      { p: 'The old map proved OBSOLETE — half the roads no longer existed. Obsolete means…', a: 'outdated and no longer useful', w: ['valuable', 'ancient but accurate', 'foreign'], h: 'Half the roads were gone…', e: 'Obsolete = replaced by time. Like floppy disks! 💾' },
      { p: 'His speech was so ELOQUENT that the audience rose to their feet. Eloquent means…', a: 'powerfully and beautifully expressed', w: ['long and boring', 'whispered', 'memorized'], h: 'It moved a whole audience!', e: 'Eloquent = words with grace and power.' }
    ])
  },
  {
    id: 'e.6.commas', name: 'Punctuation Power', grade: 6,
    gen: fromBank([
      { p: 'Famous example! Which is correct if you\'re inviting Grandma to dinner?', a: "Let's eat, Grandma!", w: ["Let's eat Grandma!", "Lets eat, Grandma", "Let's, eat Grandma!"], h: 'The comma saves Grandma\'s life. 😅', e: 'The comma shows you\'re TALKING TO Grandma, not eating her!' },
      { p: 'Where does the apostrophe go? "The three dogs bowls were empty."', a: "dogs' bowls", w: ["dog's bowls", "dogs bowl's", "do'gs bowls"], h: 'The bowls belong to THREE dogs (plural).', e: "Plural owners → apostrophe after the s: dogs'." },
      { p: 'Pick the correctly punctuated dialogue:', a: '"Watch out!" shouted Marco.', w: ['"Watch out! shouted Marco."', '"Watch out"! shouted Marco.', 'Watch out! "shouted Marco."'], h: 'Punctuation stays inside the quotes.', e: 'The ! belongs inside the quotation marks.' },
      { p: 'Which sentence needs a comma after the opening phrase? ', a: 'After the storm passed we went outside. (comma after "passed")', w: ['We went outside quickly. (comma after "outside")', 'The dog barked. (comma after "dog")', 'I like tacos. (comma after "I")'], h: 'Introductory phrases get a comma.', e: '"After the storm passed," is an intro phrase → comma.' },
      { p: 'A colon (:) is best used to…', a: 'introduce a list or big reveal', w: ['end a question', 'join two unrelated words', 'show excitement'], h: 'Like: this!', e: 'Colons say "here it comes:" 📢' },
      { p: 'Which uses the semicolon correctly?', a: 'The storm knocked out power; we played board games by candlelight.', w: ['The storm; knocked out power we played.', 'The storm knocked out; power.', 'We played board games; by candlelight.'], h: 'Semicolons join two complete, related sentences.', e: 'Full sentence ; full sentence — both sides stand alone!' },
      { p: 'Where do the commas go? "My cousin who lives in Denver is visiting" (extra info version)', a: 'My cousin, who lives in Denver, is visiting.', w: ['My cousin who lives, in Denver is visiting.', 'My, cousin who lives in Denver, is visiting.', 'No commas ever needed.'], h: 'Extra, drop-able info gets commas around it.', e: 'The Denver detail is bonus info → set off with commas.' },
      { p: 'Hyphen check! Which is correct?', a: 'a well-known author', w: ['a well known-author', 'a-well known author', 'an author well known-ly'], h: 'The two words team up to describe author.', e: 'Compound describers before a noun get hyphenated.' },
      { p: 'Which dash usage adds dramatic emphasis correctly?', a: 'She opened the box and found — nothing.', w: ['She — opened the box and found nothing.', 'She opened — the box — and — found nothing.', 'Dashes are never allowed.'], h: 'The dash sets up the reveal.', e: 'A dash before the payoff = drama! 🎭' }
    ])
  },

  // ---------- GRADE 7 ----------
  {
    id: 'e.7.evidence', name: 'Evidence & Inference', grade: 7,
    gen: fromBank([
      { p: 'Read: "Dev checked his phone every thirty seconds and kept glancing at the door. When it finally opened, he jumped from his seat." What can you INFER?', a: 'Dev was anxiously waiting for someone', w: ['Dev was bored of his phone', 'Dev disliked the room', 'Dev wanted to leave'], h: 'Combine the clues: phone + door + jumping up.', e: 'All three behaviors point to eager waiting.' },
      { p: 'A claim says "School gardens improve student health." Which is the STRONGEST evidence?', a: 'A study of 40 schools found garden programs doubled students\' vegetable intake', w: ['One student said gardens are nice', 'Gardens have many plants', 'The author likes tomatoes'], h: 'Strong evidence = data, not opinions.', e: 'A 40-school study beats one opinion every time. 📊' },
      { p: 'Read: "The bakery\'s shelves were empty by 9 a.m. A line still stretched around the block." What can you infer about the bakery?', a: 'It is extremely popular', w: ['It is closing down', 'Its food is cheap', 'It opens at 9'], h: 'Empty shelves + long line = ?', e: 'Selling out early with a line around the block = very popular! 🥐' },
      { p: 'Which statement is an OPINION, not a fact?', a: 'Soccer is the most exciting sport to watch', w: ['A soccer match has two 45-minute halves', 'The World Cup happens every four years', 'Soccer is played with 11 players per side'], h: 'Facts can be checked; opinions can be argued.', e: '"Most exciting" is a judgment — that\'s opinion.' },
      { p: 'Read: "The lab notebook\'s last entry was dated the day before the fire. Its pages after that were blank — but someone had torn three out." What can you infer?', a: 'Someone removed evidence written near the time of the fire', w: ['The scientist stopped writing from boredom', 'Notebooks lose pages naturally', 'The fire tore the pages'], h: 'TORN pages don\'t tear themselves.', e: 'Missing pages + timing = someone hid something. 🔍' },
      { p: 'A writer claims "teens need 9 hours of sleep." Which source is MOST credible?', a: 'a pediatric sleep study published by a medical association', w: ['a mattress company ad', 'an anonymous blog', 'a movie about dreams'], h: 'Who has expertise AND no product to sell?', e: 'Peer-reviewed medical research beats ads and blogs.' },
      { p: '"Correlation is not causation" means…', a: 'two things happening together doesn\'t prove one caused the other', w: ['nothing is ever related', 'all statistics lie', 'causes are always obvious'], h: 'Ice cream sales and sunburns both rise in July…', e: 'Summer causes both! Look for the hidden third factor. 🍦' },
      { p: 'Which inference is BEST supported? "Maya\'s violin case was covered in stickers from 12 different cities."', a: 'Maya has traveled to perform', w: ['Maya dislikes the violin', 'Maya collects empty cases', 'Maya has never left home'], h: '12 cities + violin case…', e: 'Stickers from many cities suggests touring with her music!' }
    ])
  },
  {
    id: 'e.7.clauses', name: 'Clauses & Sentence Craft', grade: 7,
    gen: fromBank([
      { p: '"Although the wifi was down, we finished the project." The part before the comma is…', a: 'a dependent clause', w: ['an independent clause', 'a complete sentence', 'a prepositional phrase'], h: 'Can "Although the wifi was down" stand alone?', e: 'It can\'t stand alone — it depends on the rest.' },
      { p: 'Which is a COMPLEX sentence?', a: 'Because the movie sold out, we watched it at home.', w: ['We watched a movie.', 'We got popcorn, and we found seats.', 'The long, loud, exciting movie.'], h: 'Complex = dependent + independent clause.', e: '"Because..." (dependent) + "we watched..." (independent).' },
      { p: 'Fix the run-on: "The bus was late I missed first period."', a: 'The bus was late, so I missed first period.', w: ['The bus was late I missed, first period.', 'The bus was late I missed first period!', 'The bus, was late I missed first period.'], h: 'Two complete thoughts need a connector.', e: 'Comma + "so" legally joins the two sentences.' },
      { p: '"Running down the hall, the backpack fell off Jake\'s shoulder." What\'s wrong?', a: 'It sounds like the BACKPACK was running (misplaced modifier)', w: ['Nothing is wrong', 'It needs an exclamation point', '"Backpack" is misspelled'], h: 'Who was actually running?', e: 'Backpacks can\'t run! Fix: "Running down the hall, Jake felt his backpack fall."' },
      { p: 'Combine smoothly: "The lab was closed. We needed the microscope."', a: 'Although the lab was closed, we needed the microscope.', w: ['The lab was closed we needed the microscope.', 'The lab was closed and closed was the lab.', 'Needing microscopes, the lab closed us.'], h: 'Show the contrast between the two ideas.', e: '"Although" links the clash of ideas in one sentence.' },
      { p: 'Which sentence uses PARALLEL structure correctly?', a: 'She loves hiking, swimming, and painting.', w: ['She loves hiking, to swim, and paints.', 'She loves to hike, swimming, and painted.', 'Hiking she loves, and to swim, and paint.'], h: 'Keep the -ing pattern consistent!', e: 'Matching forms (-ing, -ing, -ing) = parallel rhythm.' },
      { p: 'What makes this a fragment? "Because the tide was rising fast."', a: 'It is only a dependent clause — the main thought is missing', w: ['It is too short', 'It has no verb', 'It has too many words'], h: 'Because the tide was rising fast… WHAT happened?', e: 'Dependent clause alone = fragment. Add the result!' },
      { p: 'Choose the tightest revision: "In my own personal opinion, I think that the essay is basically kind of long."', a: 'The essay is too long.', w: ['I personally think in my opinion the essay is long.', 'The essay, in my thinking, is basically long-ish.', 'My opinion personally is: long essay.'], h: 'Cut every filler word.', e: '11 words → 5. Confidence beats padding!' }
    ])
  },
  {
    id: 'e.7.vocab', name: 'Advanced Vocabulary', grade: 7,
    gen: fromBank([
      { p: 'Her argument was so COGENT that even the skeptics nodded. Cogent means…', a: 'clear, logical, and convincing', w: ['loud', 'confusing', 'humorous'], h: 'Even skeptics were convinced!', e: 'Cogent = powerfully persuasive through logic.' },
      { p: 'The mountain village was almost INACCESSIBLE in winter — one icy road in, often closed. Inaccessible means…', a: 'nearly impossible to reach', w: ['beautiful', 'crowded', 'inexpensive'], h: 'One road, often closed…', e: 'Inaccessible = can\'t easily get there.' },
      { p: 'He made a PRUDENT choice: saving half his birthday money instead of spending it all. Prudent means…', a: 'wise and careful', w: ['selfish', 'reckless', 'lucky'], h: 'Is saving careful or careless?', e: 'Prudent = showing good judgment. 💰' },
      { p: 'The two witnesses gave CONTRADICTORY accounts — one said noon, the other midnight. Contradictory means…', a: 'opposing; unable to both be true', w: ['identical', 'detailed', 'quiet'], h: 'Noon vs midnight can\'t both be right!', e: 'Contradictory statements clash with each other.' },
      { p: 'The app\'s design was so INTUITIVE that his grandma used it without help. Intuitive means…', a: 'easy to understand naturally', w: ['expensive', 'colorful', 'complicated'], h: 'No instructions needed!', e: 'Intuitive = you just "get it" instantly. 📱' },
      { p: 'The senator\'s answer was EVASIVE — ten minutes of talking without addressing the question. Evasive means…', a: 'avoiding direct answers', w: ['honest and clear', 'brief', 'angry'], h: 'Ten minutes and still no answer…', e: 'Evasive = dodging the point.' },
      { p: 'The two lab results were DISPARATE — one showed growth, the other decay. Disparate means…', a: 'fundamentally different', w: ['identical', 'desperate', 'incomplete'], h: 'Growth vs decay — how similar are they?', e: 'Disparate = distinctly unlike each other.' },
      { p: 'Her ANECDOTE about her first day of school had the whole room laughing. Anecdote means…', a: 'a short personal story', w: ['a medicine', 'a long lecture', 'a written test'], h: 'It\'s a mini-story from her life.', e: 'Anecdote = brief true tale, often told for a point or a laugh.' },
      { p: 'The committee reached a CONSENSUS after two hours of discussion. Consensus means…', a: 'general agreement', w: ['a fierce argument', 'a secret vote', 'a cancellation'], h: 'After discussing… they finally ___.', e: 'Consensus = everyone (mostly) agrees.' }
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
      { p: 'Which sentence uses PATHOS (emotional appeal)?', a: 'Imagine a shivering puppy waiting alone in the rain for a home.', w: ['Shelters house 6.3 million animals yearly.', 'Veterinarians recommend adoption.', 'The shelter is open 9-5.'], h: 'Which one tugs your heart?', e: 'The shivering puppy image targets emotions. 🐶' },
      { p: '"My opponent wants to cut the arts budget. Clearly he hates creativity." This flawed argument is…', a: 'a straw man (twisting the opponent\'s real position)', w: ['solid logic', 'an expert appeal', 'a statistic'], h: 'Does budget-cutting equal hating creativity?', e: 'Straw man = attacking a distorted version of the real argument.' },
      { p: '"You can\'t trust her science project — she\'s bad at soccer." This fallacy is…', a: 'ad hominem (attacking the person, not the idea)', w: ['a strong rebuttal', 'bandwagon', 'an analogy'], h: 'What does soccer have to do with science?', e: 'Ad hominem attacks the person instead of the evidence.' },
      { p: '"Either we build a new gym, or this school will fail completely." This fallacy is…', a: 'false dilemma (pretending only two options exist)', w: ['a fair choice', 'an expert opinion', 'pathos'], h: 'Are there really ONLY two outcomes?', e: 'False dilemma hides all the middle options.' },
      { p: 'Which thesis is STRONGEST for an argumentative essay?', a: 'Schools should start at 9 a.m. because sleep research shows teens learn better later in the morning.', w: ['Schools exist.', 'I will talk about school start times.', 'Mornings are a time of day.'], h: 'A thesis takes a position AND previews the why.', e: 'Claim + reason = a thesis worth defending!' }
    ])
  },
  {
    id: 'e.8.voice', name: 'Active Voice & Style', grade: 8,
    gen: fromBank([
      { p: 'Which sentence is in ACTIVE voice?', a: 'The goalie blocked the penalty kick.', w: ['The penalty kick was blocked by the goalie.', 'The kick was blocked.', 'A block was made.'], h: 'Active = the subject DOES the action.', e: 'Goalie (subject) → blocked (action). Direct and punchy!' },
      { p: 'Rewrite in active voice: "The experiment was completed by the students."', a: 'The students completed the experiment.', w: ['The experiment completed the students.', 'The experiment was being completed.', 'Completed was the experiment by students.'], h: 'Make the students the subject.', e: 'Put the doer first: students → completed → experiment.' },
      { p: 'Which revision is most CONCISE? Original: "Due to the fact that it was raining, we made the decision to cancel."', a: 'Because it was raining, we canceled.', w: ['Due to the rain fact, canceling was our decision.', 'It was raining and so therefore we thus canceled.', 'The cancellation was decided by us rainily.'], h: 'Cut phrases that add words but no meaning.', e: '"Due to the fact that" → "Because." Tight writing wins.' },
      { p: 'When IS passive voice the better choice?', a: 'When the doer is unknown or unimportant: "My bike was stolen."', w: ['Never — passive is always wrong', 'In every sports report', 'When you want longer sentences'], h: 'Sometimes we don\'t know who did it…', e: 'Passive shines when the action matters more than the actor.' },
      { p: 'Which revision fixes the wordy sentence with the STRONGEST verb? "The crowd made its way quickly out of the stadium."', a: 'The crowd streamed out of the stadium.', w: ['The crowd made its speedy way out.', 'Out of the stadium the crowd made its way fast.', 'The crowd was making its way out quickly.'], h: 'Replace "made its way" with one vivid verb.', e: 'One strong verb (streamed) beats a phrase every time.' },
      { p: 'Which opening line creates the strongest HOOK for an essay on ocean plastic?', a: 'By 2050, the ocean could hold more plastic than fish.', w: ['This essay is about plastic.', 'Plastic is a material.', 'I will now begin my essay.'], h: 'Which one makes you NEED to keep reading?', e: 'A startling stat hooks readers instantly. 🌊' },
      { p: 'Varying sentence LENGTH matters because…', a: 'all-same-length sentences turn monotonous; variety creates rhythm', w: ['long sentences are always better', 'short sentences are always better', 'it doesn\'t matter at all'], h: 'Read a paragraph of only 5-word sentences…', e: 'Mix long flowing lines with short punches. Like this.' },
      { p: 'Which shows the best word ECONOMY?', a: 'She sprinted home.', w: ['She moved in a running manner toward her home location.', 'Running was the way she went home.', 'In a sprint-like fashion she proceeded homeward.'], h: 'Same meaning, fewest words.', e: 'Three words, full picture. Economy = power.' }
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
      { p: '"I could tell she was lying — her story had more holes than my old socks." The TONE here is…', a: 'wry and humorous', w: ['formal and academic', 'terrified', 'romantic'], h: 'The sock joke gives it away.', e: 'The playful comparison creates a wry, casual tone.' },
      { p: 'A story opens with a storm gathering as the protagonist makes a fateful choice. The weather most likely functions as…', a: 'mood-setting that mirrors the internal conflict', w: ['a literal weather report', 'proof the author likes rain', 'an error in continuity'], h: 'Outer storm, inner storm.', e: 'Weather often externalizes a character\'s turmoil — pathetic fallacy.' },
      { p: 'An author interrupts the chronological story with a scene from the hero\'s childhood. This device is…', a: 'flashback', w: ['foreshadowing', 'cliffhanger', 'epilogue'], h: 'The timeline jumps BACKWARD.', e: 'Flashbacks supply history that reframes the present action.' },
      { p: 'In a novel, the protagonist\'s cramped apartment is described three times, each visit smaller and darker. This likely symbolizes…', a: 'her shrinking sense of freedom', w: ['bad real estate', 'the author\'s love of interiors', 'a printing error'], h: 'Track the change: smaller, darker…', e: 'Repeated, evolving imagery maps the character\'s inner arc.' },
      { p: 'The difference between PLOT and NARRATIVE STRUCTURE is…', a: 'plot is what happens; structure is how the telling is arranged', w: ['they are identical', 'structure means page count', 'plot means the ending only'], h: 'Same events can be told in many orders.', e: 'Structure (order, pacing, POV) shapes how plot lands.' }
    ])
  },
  {
    id: 'e.9.vocab', name: 'College-Bound Vocab I', grade: 9,
    gen: fromBank([
      { p: 'The senator gave an EQUIVOCAL answer, pleasing both sides while promising nothing. Equivocal means…', a: 'deliberately vague or ambiguous', w: ['equal in size', 'honest and direct', 'angry'], h: 'Pleasing both sides by committing to neither…', e: 'Equivocal = intentionally unclear.' },
      { p: 'Her UBIQUITOUS phone case brand was in every store, every ad, every locker. Ubiquitous means…', a: 'seeming to be everywhere', w: ['rare', 'expensive', 'fragile'], h: 'Every store, every ad…', e: 'Ubiquitous = found everywhere at once.' },
      { p: 'He tried to MITIGATE the damage by apologizing immediately. Mitigate means…', a: 'make less severe', w: ['make worse', 'ignore', 'celebrate'], h: 'The apology aimed to soften things.', e: 'Mitigate = reduce the badness.' },
      { p: 'The teacher\'s PERFUNCTORY "good job" — said without looking up — deflated the class. Perfunctory means…', a: 'done without care or enthusiasm', w: ['perfect', 'loud', 'thoughtful'], h: 'Said without even looking up…', e: 'Perfunctory = going through the motions.' },
      { p: 'The startup\'s growth was EXPONENTIAL — 10 users, then 100, then 10,000. Exponential means…', a: 'increasing at a rapidly accelerating rate', w: ['steady and slow', 'fake', 'temporary'], h: '10 → 100 → 10,000…', e: 'Each step multiplies — that\'s exponential growth. 📈' },
      { p: 'The senator\'s SUCCINCT reply — two sentences — said more than her rival\'s hour of talk. Succinct means…', a: 'briefly and clearly expressed', w: ['rude', 'lengthy', 'whispered'], h: 'Two sentences vs an hour.', e: 'Succinct = compact clarity.' },
      { p: 'His claims were later CORROBORATED by three independent labs. Corroborated means…', a: 'confirmed with supporting evidence', w: ['contradicted', 'copied', 'criticized'], h: 'Three labs agreed.', e: 'Corroborate = independently back up.' },
      { p: 'The committee\'s DELIBERATE pace frustrated reporters wanting instant answers. Deliberate (adj.) means…', a: 'careful and unhurried', w: ['accidental', 'reckless', 'secretive'], h: 'Opposite of rushed.', e: 'Deliberate = measured on purpose.' },
      { p: 'A HYPOTHESIS differs from a THEORY because a hypothesis is…', a: 'a testable proposed explanation not yet well-supported', w: ['a proven law', 'a wild guess with no basis', 'the same thing exactly'], h: 'Theories have survived lots of testing.', e: 'Hypothesis = starting point; theory = well-tested framework.' }
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
      { p: 'Which is a logical FALLACY? ', a: '"My opponent failed math in 7th grade, so ignore his budget plan." (ad hominem)', w: ['"The budget has a $2M gap, per the audit."', '"Three districts tried this and saved money."', '"Experts reviewed the plan."'], h: 'Which one attacks the person, not the idea?', e: 'Ad hominem = attacking the speaker instead of the argument.' },
      { p: '"We didn\'t lay off workers — we right-sized our workforce." This language technique is…', a: 'euphemism (softening harsh reality)', w: ['hyperbole', 'understatement for comedy', 'alliteration'], h: 'Same event, gentler words.', e: 'Euphemisms sand the edges off unpleasant truths — notice them.' },
      { p: 'A speech repeats: "They told us to wait. We built. They told us to quit. We built." The persuasive power comes from…', a: 'contrast + repetition creating rhythm and defiance', w: ['statistical evidence', 'expert citation', 'humor'], h: 'Feel the drumbeat.', e: 'Parallel contrast turns argument into anthem.' },
      { p: '"Do we want safe streets or empty promises?" This question is loaded because…', a: 'it presupposes the opponent offers only empty promises', w: ['it has too many words', 'questions are always unfair', 'it cites no experts'], h: 'Look at the hidden assumption.', e: 'Loaded questions smuggle in the conclusion.' },
      { p: 'Recognizing a speaker\'s TARGET AUDIENCE matters because…', a: 'every choice — evidence, tone, examples — is tuned to move that specific group', w: ['audiences never affect content', 'it reveals the speech length', 'only critics have audiences'], h: 'Who is this FOR?', e: 'Rhetoric is aimed. Find the aim, understand the design.' }
    ])
  },
  {
    id: 'e.10.vocab', name: 'College-Bound Vocab II', grade: 10,
    gen: fromBank([
      { p: 'The committee reached a CONSENSUS after hours of debate. Consensus means…', a: 'general agreement', w: ['a formal vote', 'an argument', 'a punishment'], h: 'Everyone finally aligned.', e: 'Consensus = collective agreement.' },
      { p: 'His ANECDOTAL evidence — "my cousin tried it once" — didn\'t convince the scientists. Anecdotal means…', a: 'based on personal stories, not data', w: ['mathematically proven', 'ancient', 'anonymous'], h: 'One cousin ≠ a study.', e: 'Anecdotes are stories; science wants data.' },
      { p: 'The negotiation required PRAGMATIC compromises rather than idealistic demands. Pragmatic means…', a: 'practical and realistic', w: ['stubborn', 'emotional', 'dishonest'], h: 'Opposite of head-in-the-clouds.', e: 'Pragmatic = focused on what actually works.' },
      { p: 'Her SCRUPULOUS lab notes recorded every measurement to the milligram. Scrupulous means…', a: 'extremely careful and precise', w: ['messy', 'suspicious', 'brief'], h: 'Every. Single. Milligram.', e: 'Scrupulous = meticulous attention to detail.' },
      { p: 'The dictator tried to SUPPRESS the news story. Suppress means…', a: 'forcibly prevent from spreading', w: ['publish widely', 'translate', 'summarize'], h: 'What do dictators do to stories they hate?', e: 'Suppress = squash, silence, hold down.' },
      { p: 'Her EXEMPLARY lab notebook became the model shown to every new student. Exemplary means…', a: 'so excellent it serves as an example', w: ['average', 'confusing', 'incomplete'], h: 'It became the model.', e: 'Exemplary = sets the standard.' },
      { p: 'The negotiations reached an IMPASSE — neither side would move. Impasse means…', a: 'a deadlock with no progress possible', w: ['an agreement', 'a celebration', 'a short break'], h: 'Neither side would budge.', e: 'Impasse = stuck. From "no passage."' },
      { p: 'The renovation will AUGMENT the library\'s capacity by 200 seats. Augment means…', a: 'increase or add to', w: ['reduce', 'measure', 'criticize'], h: 'By 200 MORE seats.', e: 'Augment = make greater.' },
      { p: 'His TENACIOUS pursuit of the record — five failed attempts, then success — showed he was…', a: 'persistently unwilling to give up', w: ['easily discouraged', 'lucky', 'careless'], h: 'Five failures didn\'t stop him.', e: 'Tenacious = gripping on. Tenacity wins records.' }
    ])
  },

  // ---------- GRADE 11 ----------
  {
    id: 'e.11.analysis', name: 'Advanced Analysis', grade: 11,
    gen: fromBank([
      { p: 'An author describes a mansion\'s "chandeliers dripping crystal over guests who checked their phones, bored." The JUXTAPOSITION suggests…', a: 'wealth does not guarantee fulfillment', w: ['chandeliers are heavy', 'phones are useful', 'parties are fun'], h: 'Luxury… next to boredom.', e: 'Placing opulence beside apathy critiques empty wealth.' },
      { p: 'In an unreliable-narrator story, the reader should…', a: 'question the narrator\'s version of events', w: ['trust every detail', 'skip the narration', 'assume the author is lying'], h: 'The teller might be fooling themselves — or you.', e: 'Unreliable narrators require reading between the lines.' },
      { p: '"The assembly line birthed another identical day." This metaphor frames modern work as…', a: 'dehumanizing repetition', w: ['exciting creation', 'family life', 'high technology'], h: 'People as products of an assembly line…', e: 'The factory metaphor critiques monotonous routine.' },
      { p: 'A poem\'s meter suddenly breaks in its final line. A strong analysis would ask…', a: 'what meaning the disruption creates', w: ['whether the poet forgot to count', 'if the printer made an error', 'nothing — meter never matters'], h: 'In good poems, breaks are choices.', e: 'Form mirrors meaning — a broken rhythm often marks a broken idea.' },
      { p: 'A poem about freedom is written in rigidly perfect rhymed couplets. A sophisticated reading might argue…', a: 'the strict form ironically cages the poem\'s subject, deepening its point', w: ['the poet made a mistake', 'rhyme is always about freedom', 'form never carries meaning'], h: 'Freedom... in a cage of couplets.', e: 'Tension between form and content is often deliberate irony.' },
      { p: 'Two critics disagree: one reads the ending as redemption, the other as delusion. The strongest arbiter between them is…', a: 'which reading accounts for more of the text\'s evidence', w: ['which critic is more famous', 'the shorter essay', 'the author\'s star sign'], h: 'Back to the text itself.', e: 'Interpretations compete on evidentiary coverage.' },
      { p: 'An unreliable first-person narrator forces the reader to…', a: 'reconstruct the truth from gaps and contradictions', w: ['accept every claim at face value', 'skip the narration', 'read only dialogue'], h: 'The narrator can\'t be trusted…', e: 'The real story lives between the narrator\'s lines.' },
      { p: '"The author juxtaposes the wedding feast with the famine outside the gates." The critical term "juxtaposes" means…', a: 'places side by side for contrast', w: ['deletes', 'translates', 'summarizes'], h: 'Feast beside famine.', e: 'Juxtaposition sharpens meaning through proximity.' }
    ])
  },
  {
    id: 'e.11.satvocab', name: 'SAT Vocabulary', grade: 11,
    gen: fromBank([
      { p: 'The CEO\'s EBULLIENT keynote had investors cheering. Ebullient means…', a: 'overflowing with enthusiasm', w: ['boring', 'hostile', 'confusing'], h: 'The crowd was CHEERING.', e: 'Ebullient = bubbling with energy.' },
      { p: 'The evidence CORROBORATED the witness\'s account. Corroborated means…', a: 'confirmed/supported', w: ['contradicted', 'erased', 'complicated'], h: 'The evidence and story matched.', e: 'Corroborate = back up with confirmation.' },
      { p: 'His LACONIC reply — "Fine." — ended the interview. Laconic means…', a: 'using very few words', w: ['long-winded', 'dishonest', 'cheerful'], h: 'One. Word.', e: 'Laconic = brief to the point of bluntness.' },
      { p: 'The manager tried to CIRCUMVENT the new regulations. Circumvent means…', a: 'find a way around', w: ['strictly follow', 'rewrite', 'announce'], h: 'Circum = around.', e: 'Circumvent = dodge/bypass cleverly.' },
      { p: 'Her PROLIFIC output — three novels in two years — amazed critics. Prolific means…', a: 'producing a great amount', w: ['professional', 'secretive', 'inconsistent'], h: 'THREE novels in TWO years!', e: 'Prolific = abundantly productive.' },
      { p: 'The evidence was so COMPELLING that even the dissenting judge switched sides. Compelling means…', a: 'powerfully convincing', w: ['confusing', 'boring', 'illegal'], h: 'It flipped a dissenting judge!', e: 'Compelling evidence demands agreement.' },
      { p: 'Her GREGARIOUS nature made her the natural host of every study group. Gregarious means…', a: 'sociable; enjoying company', w: ['hostile', 'silent', 'disorganized'], h: 'Natural host = people person.', e: 'Gregarious = flocks to others (from grex, herd).' },
      { p: 'The CIA report was heavily REDACTED — entire paragraphs blacked out. Redacted means…', a: 'edited to remove sensitive content', w: ['translated', 'illustrated', 'rewritten in verse'], h: 'Blacked-out lines…', e: 'Redaction censors before release.' },
      { p: 'His argument was UNDERMINED by a single overlooked statistic. Undermined means…', a: 'weakened from beneath', w: ['strengthened', 'summarized', 'repeated'], h: 'Think of digging under a wall.', e: 'Undermine = erode the foundation of.' }
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
      { p: 'You have three sources: a 2024 peer-reviewed study, a 1998 textbook, and a viral post. For a claim about CURRENT technology, the best synthesis…', a: 'leads with the 2024 study, uses the textbook for background, and drops the viral post', w: ['treats all three equally', 'uses only the viral post for relatability', 'cites nothing'], h: 'Recency + rigor + relevance.', e: 'Weigh sources by date, rigor, and fit — then build.' },
      { p: 'Two credible studies conflict. The intellectually honest move is to…', a: 'present both, examine why they differ, and qualify your claim', w: ['cite only the one you like', 'conclude research is useless', 'average their numbers blindly'], h: 'Honesty > tidiness.', e: 'Grappling with conflict openly strengthens credibility.' },
      { p: 'A "steel man" argument is…', a: 'the strongest possible version of the opposing view, addressed head-on', w: ['a weak distortion of the opposition', 'an argument about metal', 'a personal attack'], h: 'Opposite of a straw man.', e: 'Beating the BEST version of the other side actually settles things.' },
      { p: 'Qualifiers like "in most cases" and "the evidence suggests" make academic claims…', a: 'more defensible and precise', w: ['weaker and cowardly', 'longer with no benefit', 'legally binding'], h: 'Overclaiming invites refutation.', e: 'Precision beats bravado in scholarship.' },
      { p: 'Quoting a source without citing it is…', a: 'plagiarism — even if unintentional', w: ['fine if it\'s short', 'fine if you agree with it', 'only wrong in science class'], h: 'Whose words are they?', e: 'Always cite. Integrity is the foundation of scholarship.' }
    ])
  },
  {
    id: 'e.12.style', name: 'Mastering Style', grade: 12,
    gen: fromBank([
      { p: 'Which revision best fixes wordiness? "In the event that you should happen to require assistance…"', a: '"If you need help…"', w: ['"In the event of requiring assistance…"', '"Should assistance requirements happen…"', '"When help necessities arise for you…"'], h: 'Say it like a human.', e: 'Four words beat eleven. Clarity is style.' },
      { p: 'For a college application essay, the best tone is usually…', a: 'authentic and specific to your real voice', w: ['as formal and thesaurus-heavy as possible', 'edgy and sarcastic', 'apologetic and modest'], h: 'Admissions readers can smell a thesaurus.', e: 'Your genuine voice + concrete details = memorable essays.' },
      { p: '"The data suggests..." vs "The data suggest..." — in formal writing, "data" is traditionally…', a: 'plural ("the data suggest")', w: ['singular always', 'a verb', 'uncountable like "milk"'], h: 'Datum is the singular.', e: 'Traditionally plural, though usage is shifting — know your audience.' },
      { p: 'Parallel structure error: "She loves hiking, painting, and to code." Fix it:', a: '"She loves hiking, painting, and coding."', w: ['"She loves to hike, painting, and to code."', '"She loves hiking, to paint, and coding."', '"She loving hikes, paints, and codes."'], h: 'Match the -ing pattern.', e: 'Lists flow when every item shares the same form.' },
      { p: 'Which revision best eliminates the cliché? "At the end of the day, we gave 110% and left it all on the field."', a: 'We worked until the problem finally cracked.', w: ['At day\'s end, 110% was given fully.', 'We left everything on all the fields.', 'At the end of the day we tried very hard indeed.'], h: 'Replace stock phrases with concrete specifics.', e: 'Fresh, specific language > recycled phrases.' },
      { p: 'The BEST reason to read your draft ALOUD is…', a: 'your ear catches rhythm problems and clunky phrasing your eye skips', w: ['it makes drafts longer', 'silent reading is impossible', 'professors require it'], h: 'Ears edit differently than eyes.', e: 'If you stumble speaking it, readers stumble reading it.' },
      { p: 'In professional email, "as per my last message" often reads as…', a: 'passive-aggressive — a plainer phrasing is safer', w: ['warm and friendly', 'legally required', 'grammatically wrong'], h: 'Tone travels poorly in text.', e: 'Say "as mentioned earlier" or just restate the point kindly.' },
      { p: 'Strunk\'s "omit needless words" does NOT mean…', a: 'strip all detail — it means every remaining word must earn its place', w: ['cut filler phrases', 'prefer active verbs', 'tighten flabby sentences'], h: 'Vivid detail can stay; dead weight goes.', e: 'Concision serves meaning, not brevity for its own sake.' }
    ])
  }
];

module.exports = { subject: 'english', label: 'English', emoji: '📚', color: '#00B894', skills };

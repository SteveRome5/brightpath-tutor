// BrightPath Science — K-12 with hands-on, real-world framing and extra-friendly hints
const { pick, textChoices, q } = require('./helpers');

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
    id: 's.k.senses', name: 'My Five Senses', grade: 0,
    gen: fromBank([
      { p: 'You smell cookies baking! 🍪 Which body part are you using?', a: 'your nose', w: ['your ears', 'your eyes', 'your feet'], h: 'Sniff sniff!', e: 'Your nose smells yummy things!' },
      { p: 'Which sense tells you a kitten\'s fur is soft?', a: 'touch', w: ['taste', 'hearing', 'smell'], h: 'You pet it with your hands.', e: 'Touch tells you soft, rough, hot, or cold!' },
      { p: 'You hear thunder! ⛈️ Which body part did that?', a: 'your ears', w: ['your nose', 'your tongue', 'your hair'], h: 'BOOM! What heard it?', e: 'Ears hear sounds, loud and quiet.' },
      { p: 'Which sense do you use to watch a rainbow? 🌈', a: 'sight (eyes)', w: ['taste', 'smell', 'touch'], h: 'Look up!', e: 'Your eyes see colors and light!' },
      { p: 'Lemonade tastes sour! Which body part tasted it?', a: 'your tongue', w: ['your ears', 'your elbow', 'your nose'], h: 'It\'s in your mouth.', e: 'Your tongue tastes sweet, sour, salty, and bitter!' },
      { p: 'Popcorn is popping! POP POP! 🍿 Which TWO senses notice first?', a: 'hearing and smell', w: ['taste and touch', 'sight and taste', 'touch only'], h: 'You hear it AND smell it from the couch!', e: 'Ears hear the pops, nose smells the butter!' },
      { p: 'Your friend whispers a secret. Which sense do you use?', a: 'hearing', w: ['taste', 'smell', 'touch'], h: 'Lean your ear closer…', e: 'Even tiny whispers are sounds for your ears!' },
      { p: 'Which body part tells you bath water is too hot BEFORE you climb in?', a: 'your skin (touch)', w: ['your ears', 'your hair', 'your teeth'], h: 'Dip one toe in!', e: 'Skin feels hot and cold — it keeps you safe!' },
      { p: 'Ice cream is sweet AND cold! 🍦 Which TWO senses tell you that?', a: 'taste and touch', w: ['hearing and sight', 'smell and hearing', 'sight only'], h: 'Your tongue does both jobs!', e: 'Taste finds the sweet, touch feels the cold!' },
      { p: 'You close your eyes tight. Which sense can you NOT use now?', a: 'sight', w: ['hearing', 'smell', 'touch'], h: 'What do eyes do?', e: 'Closed eyes = no seeing — but your other senses still work!' }
    ])
  },
  {
    id: 's.k.animals', name: 'Animal Friends', grade: 0,
    gen: fromBank([
      { p: 'Where does a fish live? 🐟', a: 'in water', w: ['in a tree', 'underground', 'in the clouds'], h: 'Fish swim!', e: 'Fish breathe and swim in water.' },
      { p: 'Which animal says "moo" and gives us milk?', a: 'a cow 🐄', w: ['a duck', 'a cat', 'a lion'], h: 'It lives on a farm.', e: 'Cows give us the milk for cheese and ice cream!' },
      { p: 'A baby dog is called a…', a: 'puppy', w: ['kitten', 'cub', 'chick'], h: 'So fluffy!', e: 'Baby dogs are puppies! 🐶' },
      { p: 'Which animal sleeps all winter (hibernates)?', a: 'a bear 🐻', w: ['a robin', 'a butterfly', 'a shark'], h: 'It curls up in a cozy den.', e: 'Bears hibernate through the cold winter.' },
      { p: 'Which animal builds a web to catch food?', a: 'a spider 🕷️', w: ['a bee', 'a frog', 'a mouse'], h: 'Its web is sticky!', e: 'Spiders spin silky webs to catch bugs.' },
      { p: 'Which animal carries its baby in a front pouch? 🦘', a: 'a kangaroo', w: ['a horse', 'a dog', 'a fish'], h: 'It hops across Australia!', e: 'Kangaroo babies (joeys) ride in mom\'s pouch!' },
      { p: 'A baby cat is called a…', a: 'kitten', w: ['puppy', 'calf', 'duckling'], h: 'Meow!', e: 'Baby cats are kittens! 🐱' },
      { p: 'Which bird cannot fly but is an AMAZING swimmer?', a: 'a penguin 🐧', w: ['an eagle', 'a parrot', 'an owl'], h: 'It waddles on ice!', e: 'Penguins fly underwater with their flippers!' },
      { p: 'What do birds build to keep their eggs safe?', a: 'a nest', w: ['a cave', 'a sandcastle', 'a web'], h: 'Made of twigs and grass, up in a tree.', e: 'Birds weave cozy nests for their eggs! 🪺' },
      { p: 'Which animal has a long trunk for drinking and grabbing?', a: 'an elephant 🐘', w: ['a giraffe', 'a zebra', 'a bear'], h: 'Its nose is SUPER long!', e: 'An elephant\'s trunk is nose and hand in one!' }
    ])
  },
  {
    id: 's.k.weather', name: 'Weather Watch', grade: 0,
    gen: fromBank([
      { p: 'What should you wear when it rains? ☔', a: 'a raincoat and boots', w: ['a swimsuit', 'sunglasses only', 'sandals'], h: 'You want to stay dry!', e: 'Raincoats and boots keep you dry in the rain!' },
      { p: 'What falls from the sky when it is very, very cold?', a: 'snow ❄️', w: ['rain', 'leaves', 'bubbles'], h: 'You can build a snowman with it!', e: 'When it\'s freezing, rain becomes snow!' },
      { p: 'The sun gives us light and…', a: 'warmth (heat)', w: ['snow', 'wind', 'rain'], h: 'How does sunshine feel on your skin?', e: 'The sun warms our whole planet! ☀️' },
      { p: 'What do you see in the sky during a storm, right before thunder?', a: 'lightning ⚡', w: ['rainbows', 'stars', 'balloons'], h: 'It\'s a bright flash!', e: 'Lightning flashes first, then thunder booms!' },
      { p: 'Which season is the coldest, with snow and ice?', a: 'winter ❄️', w: ['summer', 'spring', 'beach season'], h: 'Brrr! Mittens time!', e: 'Winter is the cold season — snowman weather!' },
      { p: 'What makes leaves dance and kites fly high?', a: 'the wind 🌬️', w: ['the moon', 'thunder', 'grass'], h: 'You can feel it but not see it!', e: 'Wind is moving air — kite power!' },
      { p: 'After rain, the sun peeks out. What colorful arc might you see?', a: 'a rainbow 🌈', w: ['a tornado', 'more lightning', 'fog'], h: 'Red, orange, yellow…', e: 'Sunlight through raindrops splits into a rainbow!' },
      { p: 'Puffy white shapes floating in the sky are…', a: 'clouds ☁️', w: ['mountains', 'balloons', 'sheep'], h: 'They\'re made of tiny water drops!', e: 'Clouds are floating collections of tiny water droplets!' },
      { p: 'It will be SUNNY and HOT at the park today. What should you bring?', a: 'water and a sun hat', w: ['a snow shovel', 'a heavy coat', 'an umbrella for rain'], h: 'Stay cool and drink up!', e: 'Hot days need water, shade, and sun protection! ☀️' }
    ])
  },

  // ---------- GRADES 1-2 ----------
  {
    id: 's.1.plants', name: 'How Plants Grow', grade: 1,
    gen: fromBank([
      { p: 'What are the 3 things a bean seed on your windowsill needs to grow?', a: 'water, sunlight, and air', w: ['candy, TV, and toys', 'only darkness', 'just soil, nothing else'], h: 'Think what YOU give a classroom plant.', e: 'Water + sun + air = a happy growing plant! 🌱' },
      { p: 'Which plant part drinks water from the soil, like a straw?', a: 'the roots', w: ['the flower', 'the leaves', 'the petals'], h: 'It\'s the hidden part underground.', e: 'Roots slurp water up from the soil!' },
      { p: 'Leaves use SUNLIGHT to make food for the plant. This amazing trick is called…', a: 'photosynthesis', w: ['hibernation', 'digestion', 'evaporation'], h: 'Photo = light!', e: 'Photosynthesis = leaves turning sunlight into plant food!' },
      { p: 'A bee lands on a flower and carries yellow dust to the next flower. That dust is…', a: 'pollen', w: ['sugar', 'sand', 'glitter'], h: 'It helps flowers make seeds.', e: 'Bees spread pollen so plants can make new seeds! 🐝' },
      { p: 'Which came FIRST in an apple tree\'s life?', a: 'a seed', w: ['an apple', 'a leaf', 'a branch'], h: 'Every giant tree starts tiny.', e: 'Seed → sprout → tree → flowers → apples! 🍎' },
      { p: 'What pops out of a seed FIRST, growing DOWN into the soil?', a: 'the root', w: ['the flower', 'an apple', 'a leaf'], h: 'It anchors the plant like a foot.', e: 'Roots grow down first to drink and grip!' },
      { p: 'Which part of a sunflower makes the seeds for next year? 🌻', a: 'the flower', w: ['the roots', 'the dirt', 'the stem only'], h: 'The pretty part!', e: 'Flowers make seeds — that\'s their whole job!' },
      { p: 'You forget to water the class plant for two weeks. What happens?', a: 'it wilts and droops', w: ['it grows faster', 'it turns into a cactus', 'nothing at all'], h: 'Plants get thirsty like you!', e: 'No water = droopy, wilted plant. Water revives it!' },
      { p: 'Trees lose their leaves in fall. What grows back in spring?', a: 'new leaves and buds 🌸', w: ['snow', 'pinecones only', 'nothing ever'], h: 'Spring = fresh start!', e: 'Spring warmth wakes trees up — new buds burst open!' },
      { p: 'Why do farmers plant seeds in spring instead of winter?', a: 'seeds need warm soil and sunlight to sprout', w: ['seeds like snow', 'winter is too sunny', 'farmers are busy skiing'], h: 'What do seeds need?', e: 'Warm spring soil + longer days = perfect sprouting weather! 🌱' }
    ])
  },
  {
    id: 's.2.matter', name: 'Solids, Liquids & Gases', grade: 2,
    gen: fromBank([
      { p: 'Your popsicle melts in the sun! 🍦 It changed from a solid to a…', a: 'liquid', w: ['gas', 'shadow', 'crystal'], h: 'It drips now!', e: 'Heat melts solids into liquids.' },
      { p: 'The bathroom mirror fogs up during a hot shower. That fog comes from water as a…', a: 'gas (water vapor)', w: ['solid', 'rock', 'juice'], h: 'You can\'t grab it — it floats in air!', e: 'Hot water evaporates into invisible vapor, then fogs the cold mirror!' },
      { p: 'Which one is a SOLID?', a: 'an ice cube', w: ['orange juice', 'steam', 'milk'], h: 'Solids keep their shape.', e: 'Ice keeps its cube shape — solid! (Until it melts…)' },
      { p: 'You pour juice from a bottle into a glass. The juice changes its ___ but not its amount.', a: 'shape', w: ['color', 'taste', 'temperature'], h: 'Liquids take the shape of their container.', e: 'Liquids flow to fit any container!' },
      { p: 'What happens to a puddle on a hot sunny day?', a: 'it evaporates into the air', w: ['it freezes', 'it gets deeper', 'it turns to juice'], h: 'Where did it GO?', e: 'The sun\'s heat turns puddle water into vapor — evaporation! ☀️' },
      { p: 'Water left in the freezer overnight becomes…', a: 'ice (a solid)', w: ['steam', 'juice', 'a gas'], h: 'Cold makes liquids harden!', e: 'Freezing turns liquid water into solid ice! 🧊' },
      { p: 'Which one is a GAS?', a: 'the steam rising above hot cocoa', w: ['the mug', 'the cocoa', 'the marshmallow'], h: 'It floats up and disappears!', e: 'Steam is water as a gas — hot and floaty!' },
      { p: 'You blow up a balloon. What fills it? 🎈', a: 'air (a gas)', w: ['water', 'a solid', 'light'], h: 'It came from your lungs!', e: 'Invisible air is a gas that fills the space!' },
      { p: 'A crayon left on a sunny windowsill gets soft and bendy. Heat is starting to…', a: 'melt it', w: ['freeze it', 'shrink it', 'paint with it'], h: 'What does heat do to solids?', e: 'Warmth softens the wax — more heat would fully melt it!' },
      { p: 'Chocolate melts in your pocket but a coin does not. Why?', a: 'chocolate melts at a much lower temperature', w: ['coins are magic', 'chocolate is a liquid already', 'pockets only melt food'], h: 'Different solids melt at different heats!', e: 'Every material has its own melting point — chocolate\'s is near body heat! 🍫' }
    ])
  },
  {
    id: 's.2.habitats', name: 'Habitats & Homes', grade: 2,
    gen: fromBank([
      { p: 'A camel\'s humps and wide feet make it perfect for which habitat?', a: 'the desert 🏜️', w: ['the ocean', 'the arctic', 'a rainforest'], h: 'Hot, dry, and sandy!', e: 'Camels store fat in humps and walk on sand like snowshoes!' },
      { p: 'Why is a polar bear\'s fur white?', a: 'to blend in with snow while hunting (camouflage)', w: ['to stay cool', 'because it\'s old', 'to scare fish'], h: 'Sneaky hunting trick!', e: 'White fur = invisible in snow = camouflage! ❄️' },
      { p: 'Which animal is perfectly built for the ocean?', a: 'a dolphin 🐬', w: ['a camel', 'an eagle', 'a squirrel'], h: 'Flippers and fins!', e: 'Dolphins have flippers, fins, and a blowhole for ocean life.' },
      { p: 'A frog lays eggs in water, but adult frogs can hop on land. Frogs are…', a: 'amphibians (live in water AND on land)', w: ['reptiles only', 'fish', 'birds'], h: 'Amphi = both!', e: 'Amphibians like frogs live double lives — water AND land! 🐸' },
      { p: 'In a forest food chain: acorn → squirrel → hawk. What is the squirrel?', a: 'both eater and food (a consumer that gets eaten)', w: ['a plant', 'the top predator', 'a producer'], h: 'It eats AND gets eaten.', e: 'Squirrels eat acorns, hawks eat squirrels — nature\'s chain!' },
      { p: 'Which animal\'s thick layer of blubber keeps it warm in icy seas?', a: 'a whale 🐋', w: ['a parrot', 'a lizard', 'a butterfly'], h: 'Blubber = built-in winter coat.', e: 'Whales and seals wear blubber like a warm wetsuit!' },
      { p: 'An owl hunts at night and sleeps all day. Animals like that are called…', a: 'nocturnal 🦉', w: ['tropical', 'invisible', 'migratory'], h: 'Noct = night!', e: 'Nocturnal animals work the night shift!' },
      { p: 'Where would a cactus grow best?', a: 'a hot, dry desert', w: ['a frozen lake', 'the deep ocean', 'a shady swamp'], h: 'It stores its own water!', e: 'Cactuses are desert champions — built to save every drop! 🌵' },
      { p: 'A snowshoe rabbit\'s brown fur turns WHITE in winter. Why?', a: 'camouflage in the snow', w: ['it gets old', 'it\'s cold paint', 'to look fancy'], h: 'Hide from the foxes!', e: 'White fur in white snow = nearly invisible!' },
      { p: 'Which habitat is home to the MOST kinds of plants and animals?', a: 'a rainforest 🌴', w: ['a parking lot', 'the north pole', 'a sand dune'], h: 'Warm + rainy = life everywhere!', e: 'Rainforests hold more species than anywhere on Earth!' }
    ])
  },

  // ---------- GRADES 3-5 ----------
  {
    id: 's.3.forces', name: 'Forces & Motion', grade: 3,
    gen: fromBank([
      { p: 'You kick a soccer ball and it eventually stops rolling in the grass. What force slowed it down?', a: 'friction', w: ['magnetism', 'electricity', 'sunlight'], h: 'The grass rubs against the ball.', e: 'Friction = rubbing force that slows things down. ⚽' },
      { p: 'You drop your backpack and it falls DOWN, never up. Which force pulls it?', a: 'gravity', w: ['friction', 'wind', 'magnetism'], h: 'The same force keeps YOU on the ground.', e: 'Gravity pulls everything toward Earth\'s center!' },
      { p: 'On a seesaw, a heavier friend sits on the other side and you go UP. Their weight created a stronger…', a: 'force (push/pull)', w: ['sound', 'temperature', 'color'], h: 'Seesaws are force battles!', e: 'The bigger downward force lifts the lighter side up!' },
      { p: 'Which surface lets a toy car roll FARTHEST?', a: 'smooth wood floor', w: ['thick carpet', 'grass', 'sand'], h: 'Less rubbing = more rolling.', e: 'Smooth floors have less friction, so the car rolls farther! 🏎️' },
      { p: 'A magnet will stick to which object?', a: 'a steel paperclip', w: ['a plastic spoon', 'a wooden block', 'a rubber ball'], h: 'Magnets love certain metals.', e: 'Magnets attract iron and steel — not plastic, wood, or rubber!' },
      { p: 'You pump your legs on a swing to go higher. Each pump adds…', a: 'more force (a push)', w: ['more gravity', 'more friction', 'more weight'], h: 'You\'re powering the swing!', e: 'Each pump is a push that adds energy to the swing! 💨' },
      { p: 'Which needs MORE force to push: an empty wagon or one full of rocks?', a: 'the wagon full of rocks', w: ['the empty wagon', 'both the same', 'neither moves'], h: 'Heavier = harder to move.', e: 'More mass needs more force — that\'s Newton\'s law!' },
      { p: 'Bike brakes squeeze the wheel to stop you. They use…', a: 'friction', w: ['magnetism', 'gravity', 'echoes'], h: 'Rubbing that slows things!', e: 'Brake pads GRIP the wheel — friction turns motion into heat! 🚲' },
      { p: 'Two magnets SNAP together when opposite ends face. Matching ends will…', a: 'push apart (repel)', w: ['stick harder', 'melt', 'spin forever'], h: 'Try it — they fight you!', e: 'Opposites attract; matching poles repel!' },
      { p: 'A paper airplane glides because moving air pushes UP on its wings. That push is called…', a: 'lift ✈️', w: ['drag', 'gravity', 'thrust only'], h: 'It\'s what keeps real planes up too!', e: 'Wings shape the air to create lift — flight\'s secret!' }
    ])
  },
  {
    id: 's.4.space', name: 'Solar System Explorer', grade: 4,
    gen: fromBank([
      { p: 'Why do we have day and night?', a: 'Earth spins (rotates) once every 24 hours', w: ['the sun turns off', 'the moon blocks the sun nightly', 'clouds cover everything'], h: 'Imagine a spinning basketball near a lamp.', e: 'Your side of Earth faces the sun (day), then spins away (night)! 🌍' },
      { p: 'Which planet is famous for its beautiful rings?', a: 'Saturn 🪐', w: ['Mars', 'Venus', 'Mercury'], h: 'It\'s the "ringed planet."', e: 'Saturn\'s rings are made of ice and rock chunks!' },
      { p: 'The moon seems to change shape during the month. These changes are called…', a: 'phases', w: ['seasons', 'eclipses', 'orbits'], h: 'New moon, half moon, full moon…', e: 'Moon phases = how much sunlit moon we see from Earth! 🌙' },
      { p: 'What does the sun actually make that reaches Earth?', a: 'light and heat energy', w: ['oxygen', 'water', 'gravity only'], h: 'What do you feel on a sunny day?', e: 'The sun is a giant star powering Earth with light and heat!' },
      { p: 'Why does a year on Earth last 365 days?', a: 'that\'s how long Earth takes to orbit the sun once', w: ['that\'s how long Earth takes to spin once', 'the moon decides it', 'it\'s just a tradition'], h: 'A year = one full trip around…', e: 'One lap around the sun = one year! 🎂' },
      { p: 'Which space object is CLOSEST to Earth?', a: 'the moon 🌙', w: ['the sun', 'Jupiter', 'another galaxy'], h: 'Astronauts reached it in 3 days.', e: 'The moon is our nearest neighbor — 384,000 km away!' },
      { p: 'The sun is actually a…', a: 'star ⭐', w: ['planet', 'moon', 'comet'], h: 'It just looks big because it\'s close!', e: 'The sun is a medium star — the others are just MUCH farther!' },
      { p: 'Mars looks red because…', a: 'its soil is full of rusty iron dust', w: ['it\'s on fire', 'it\'s covered in lava now', 'red clouds'], h: 'Same stuff as a rusty bike!', e: 'Iron oxide (rust) coats Mars — the Red Planet! 🔴' },
      { p: 'What tool makes far-away planets look close?', a: 'a telescope 🔭', w: ['a microscope', 'binoculars for reading', 'a magnet'], h: 'Tele = far!', e: 'Telescopes gather light to zoom across space!' },
      { p: 'Astronauts float on the space station because…', a: 'they are constantly falling around Earth — it feels like floating', w: ['there is zero gravity in space', 'their suits have fans', 'the station has anti-gravity engines'], h: 'They\'re falling AND moving sideways super fast.', e: 'Orbit = endless free-fall around the planet. Weightless! 🧑‍🚀' }
    ])
  },
  {
    id: 's.5.body', name: 'Amazing Human Body', grade: 5,
    gen: fromBank([
      { p: 'You sprint at recess and your heart pounds. Why?', a: 'muscles need extra oxygen, so the heart pumps blood faster', w: ['the heart is scared', 'blood is overheating', 'lungs stop working'], h: 'Blood delivers oxygen — running muscles need MORE.', e: 'Faster pumping = faster oxygen delivery to working muscles! ❤️' },
      { p: 'Which organ is your body\'s "command center," sending signals through nerves?', a: 'the brain 🧠', w: ['the stomach', 'the lungs', 'the kidneys'], h: 'You\'re using it RIGHT NOW.', e: 'The brain controls thoughts, movement, and even your heartbeat!' },
      { p: 'What do your lungs trade with every breath?', a: 'oxygen in, carbon dioxide out', w: ['food in, water out', 'blood in, air out', 'nothing — they just inflate'], h: 'It\'s a gas exchange!', e: 'Breathe in O₂ for your cells; breathe out CO₂ waste. 🫁' },
      { p: 'Why does your body make you shiver when you\'re freezing at the bus stop?', a: 'shivering muscles generate heat to warm you', w: ['to scare the cold away', 'your bones are rattling', 'to make you run home'], h: 'Moving muscles make warmth.', e: 'Shivering = your body\'s built-in heater! 🥶' },
      { p: 'Which body system turns your lunch into fuel?', a: 'the digestive system', w: ['the skeletal system', 'the nervous system', 'the circulatory system'], h: 'Stomach and intestines are its stars.', e: 'Digestion breaks food into nutrients your cells can use! 🌮' },
      { p: 'Your skeleton\'s 206 bones do which two big jobs?', a: 'hold you up and protect your organs', w: ['make you taste food', 'pump blood', 'nothing — they\'re decoration'], h: 'Think ribs around your heart.', e: 'Bones are your frame AND your armor! 🦴' },
      { p: 'What carries oxygen from your lungs all the way to your toes?', a: 'blood (red blood cells)', w: ['bones', 'hair', 'stomach acid'], h: 'It travels through vessels.', e: 'Red blood cells are oxygen delivery trucks! 🚚' },
      { p: 'Germs sneak into a cut on your hand. White blood cells rush over to…', a: 'attack the germs', w: ['take a nap', 'leave the body', 'turn into germs'], h: 'They\'re your body\'s defenders!', e: 'White blood cells are your immune army! ⚔️' },
      { p: 'Why do you sweat during sports?', a: 'evaporating sweat cools your body down', w: ['your body is leaking', 'to look shiny', 'to get thirsty'], h: 'It\'s your built-in AC.', e: 'Sweat evaporates and carries heat away — natural cooling! 💦' },
      { p: 'Muscles work in PAIRS (like biceps & triceps) because a muscle can only…', a: 'pull — never push', w: ['push — never pull', 'work at night', 'grow one at a time'], h: 'One pulls the arm up, the other pulls it back down.', e: 'Muscles contract (pull), so every joint needs a partner team!' }
    ])
  },
  {
    id: 's.5.ecosystems', name: 'Ecosystems & Energy', grade: 5,
    gen: fromBank([
      { p: 'In every food chain, energy ALWAYS starts with…', a: 'the sun', w: ['the biggest predator', 'water', 'soil'], h: 'What powers the plants?', e: 'Sun → plants → herbivores → predators. Solar-powered life! ☀️' },
      { p: 'Mushrooms and bacteria that break down dead leaves are called…', a: 'decomposers', w: ['producers', 'predators', 'prey'], h: 'They\'re nature\'s recycling crew.', e: 'Decomposers return nutrients to the soil — nothing is wasted!' },
      { p: 'If all the wolves vanished from a forest, what would likely happen first?', a: 'deer populations would boom and overeat plants', w: ['nothing would change', 'trees would grow faster forever', 'deer would disappear too'], h: 'Who was eating the deer?', e: 'Remove a predator → prey explodes → plants suffer. Balance matters! 🐺' },
      { p: 'A cactus storing water in its thick stem is an example of…', a: 'an adaptation to its environment', w: ['pollution', 'hibernation', 'migration'], h: 'Desert survival skills!', e: 'Adaptations are body features that help survival in a habitat. 🌵' },
      { p: 'Geese flying south for winter is called…', a: 'migration', w: ['hibernation', 'camouflage', 'evaporation'], h: 'They travel to warmer places.', e: 'Migration = seasonal travel for food and warmth! 🪿' },
      { p: 'Plants are called PRODUCERS because they…', a: 'make their own food from sunlight', w: ['produce noise', 'eat other plants', 'buy food'], h: 'Photosynthesis!', e: 'Producers make food; consumers must eat it. 🌿' },
      { p: 'An animal that eats ONLY plants is called a…', a: 'herbivore 🦌', w: ['carnivore', 'decomposer', 'predator'], h: 'Herb = plant!', e: 'Herbivores graze; carnivores hunt; omnivores do both!' },
      { p: 'If bees disappeared, fruit farms would be in big trouble because…', a: 'fewer flowers would get pollinated, so fewer fruits would grow', w: ['bees water the plants', 'farmers like honey only', 'fruit needs bee stings'], h: 'Who moves the pollen?', e: 'No pollination = no fruit. Bees feed the world! 🐝' },
      { p: 'A hawk, an owl, and a fox all hunt mice in one field. They are…', a: 'competing for the same prey', w: ['working as a team', 'decomposers', 'herbivores'], h: 'Limited mice, many hunters!', e: 'Competition shapes who survives in an ecosystem.' },
      { p: 'Trash dumped in a stream can hurt animals far away because…', a: 'water carries it downstream to other habitats', w: ['animals like trash', 'streams destroy trash instantly', 'it stays in one spot forever'], h: 'Streams flow to rivers, rivers to the sea…', e: 'Pollution travels — protecting water protects everyone downstream! 🌊' }
    ])
  },

  // ---------- GRADES 6-8 ----------
  {
    id: 's.6.cells', name: 'Cells: Life\'s LEGO Bricks', grade: 6,
    gen: fromBank([
      { p: 'The "powerhouse of the cell" that turns food into energy is the…', a: 'mitochondria', w: ['nucleus', 'cell wall', 'vacuole'], h: 'The most famous science fact on the internet!', e: 'Mitochondria convert nutrients into usable energy (ATP)! ⚡' },
      { p: 'Which structure holds a cell\'s DNA — its instruction manual?', a: 'the nucleus', w: ['the membrane', 'the cytoplasm', 'the ribosome'], h: 'It\'s the cell\'s control center.', e: 'The nucleus protects DNA like a vault of blueprints.' },
      { p: 'Plant cells have something animal cells DON\'T. What lets plants make their own food?', a: 'chloroplasts', w: ['mitochondria', 'a nucleus', 'a membrane'], h: 'It\'s where photosynthesis happens — and it\'s green!', e: 'Chloroplasts capture sunlight — plants\' solar panels! 🌿' },
      { p: 'Your body has roughly how many cells?', a: 'about 37 trillion', w: ['about 5,000', 'exactly 1 million', 'about 200'], h: 'It\'s a mind-blowingly huge number.', e: '~37,000,000,000,000 cells are working for you right now!' },
      { p: 'A cut on your knee heals because your cells…', a: 'divide to make new cells', w: ['melt together', 'borrow skin from clothes', 'never change'], h: 'New skin comes from where?', e: 'Cell division (mitosis) rebuilds damaged tissue. 🩹' },
      { p: 'The thin outer "security gate" that decides what enters and leaves a cell is the…', a: 'cell membrane', w: ['nucleus', 'mitochondria', 'chloroplast'], h: 'It\'s the cell\'s border patrol.', e: 'The membrane lets nutrients in and waste out — selectively!' },
      { p: 'A bacterium is made of how many cells?', a: 'just one', w: ['millions', 'exactly two', 'none'], h: 'Uni-cellular!', e: 'Bacteria are single-celled — one cell doing every job!' },
      { p: 'Ribosomes are the cell\'s tiny factories for building…', a: 'proteins', w: ['sugar', 'light', 'bones'], h: 'The machines of the cell.', e: 'Ribosomes read DNA recipes and assemble proteins!' },
      { p: 'Which is bigger: a cell or an atom?', a: 'a cell — cells are built from trillions of atoms', w: ['an atom', 'they\'re the same size', 'neither has a size'], h: 'Atoms build molecules build cells.', e: 'Atoms → molecules → cells → you!' }
    ])
  },
  {
    id: 's.7.chemistry', name: 'Chemistry Basics', grade: 7,
    gen: fromBank([
      { p: 'Water is H₂O. That means each molecule has…', a: '2 hydrogen atoms and 1 oxygen atom', w: ['2 oxygen and 1 hydrogen', '20 hydrogen atoms', '1 helium and 1 oxygen'], h: 'The little 2 counts the H\'s.', e: 'H₂O = two H, one O. You drink molecules! 💧' },
      { p: 'Baking soda + vinegar = instant fizzing volcano! The bubbles prove…', a: 'a chemical reaction made a new gas (CO₂)', w: ['the vinegar is boiling', 'air leaked in', 'nothing happened'], h: 'Where did bubbles come from? Something NEW formed.', e: 'The reaction creates carbon dioxide gas — brand-new stuff! 🌋' },
      { p: 'On the periodic table, "Au" stands for…', a: 'gold', w: ['silver', 'aluminum', 'argon'], h: 'From Latin "aurum." Think treasure!', e: 'Au = gold (aurum). Chemistry has its own secret code! 🏆' },
      { p: 'Chopping a carrot is a PHYSICAL change. Cooking it until it browns is a…', a: 'chemical change (new substances form)', w: ['physical change', 'phase change only', 'magnetic change'], h: 'Can you un-cook it?', e: 'Browning = new chemical compounds = chemical change! 🥕' },
      { p: 'An atom has protons (+), electrons (−), and…', a: 'neutrons (no charge)', w: ['photons', 'ions only', 'molecules'], h: 'The neutral one in the nucleus.', e: 'Neutrons sit in the nucleus with protons, adding mass but no charge.' },
      { p: 'The smallest piece of an element that still IS that element is…', a: 'an atom', w: ['a cell', 'a crumb', 'a molecule of water'], h: 'Everything is made of them.', e: 'Atoms are matter\'s building blocks!' },
      { p: 'Salt dissolving in water is a ___ change.', a: 'physical (the salt is still salt)', w: ['chemical', 'nuclear', 'impossible'], h: 'Boil the water away — salt returns!', e: 'Dissolving just spreads it out; nothing new forms.' },
      { p: 'CO₂ has 1 carbon atom and how many oxygen atoms?', a: '2', w: ['1', '3', '0'], h: 'The little ₂ tells you!', e: 'CO₂ = one C, two O — the gas you breathe out!' },
      { p: 'A bike left in the rain grows orange rust. That\'s…', a: 'a chemical change (iron + oxygen made a new substance)', w: ['a physical change', 'paint fading', 'the bike sweating'], h: 'Rust is NEW stuff that wasn\'t there.', e: 'Iron + oxygen + water → iron oxide. Chemistry in your driveway!' }
    ])
  },
  {
    id: 's.7.earth', name: 'Earth Science', grade: 7,
    gen: fromBank([
      { p: 'Earthquakes happen mostly at the edges of…', a: 'tectonic plates', w: ['clouds', 'oceans only', 'time zones'], h: 'Earth\'s crust is cracked into giant puzzle pieces.', e: 'Plates grind past each other — the jolt is an earthquake!' },
      { p: 'The water cycle: evaporation → condensation → ___ → collection.', a: 'precipitation (rain/snow)', w: ['pollination', 'perspiration', 'hibernation'], h: 'What falls from clouds?', e: 'Clouds release rain or snow — precipitation! 🌧️' },
      { p: 'Which rock type forms when melted rock (magma/lava) cools and hardens?', a: 'igneous', w: ['sedimentary', 'metamorphic', 'sandstone'], h: 'Ignis = fire in Latin.', e: 'Igneous = born of fire. Volcanoes are rock factories! 🌋' },
      { p: 'Why is it summer in Australia when it\'s winter in New York?', a: 'Earth\'s tilt points hemispheres toward/away from the sun at different times', w: ['Australia is closer to the sun', 'the sun flips over', 'Australia has no winter'], h: 'It\'s the 23.5° tilt!', e: 'The tilted hemisphere gets more direct sunlight = summer. 🌏' },
      { p: 'Fossils of ocean creatures found on mountain tops prove that…', a: 'that land was once under the sea and was pushed up over time', w: ['fish can climb', 'someone carried them up', 'mountains are fake'], h: 'Mountains RISE over millions of years.', e: 'Plate collisions lift ancient seafloors sky-high! 🐚⛰️' },
      { p: 'Which layer of Earth do we live on?', a: 'the crust', w: ['the core', 'the mantle', 'the atmosphere only'], h: 'The thin rocky shell.', e: 'The crust is Earth\'s skin — thinner than you\'d think!' },
      { p: 'Melted rock is called ___ underground and ___ after it erupts.', a: 'magma, then lava', w: ['lava, then magma', 'crust, then core', 'ash, then smoke'], h: 'M for underground (like a basement M).', e: 'Same melted rock, new name once it surfaces! 🌋' },
      { p: 'The Grand Canyon was carved over millions of years by…', a: 'a river slowly wearing away rock (erosion)', w: ['dynamite', 'one big earthquake', 'giant drills'], h: 'The Colorado River still flows below.', e: 'Erosion: water + time = canyons. Patience, on a geologic scale!' },
      { p: 'Hurricanes get their enormous power from…', a: 'warm ocean water', w: ['cold mountain air', 'the moon', 'city lights'], h: 'They form over tropical seas.', e: 'Warm water evaporates and feeds the storm engine! 🌀' }
    ])
  },
  {
    id: 's.8.physics', name: 'Energy & Physics', grade: 8,
    gen: fromBank([
      { p: 'At the TOP of a roller coaster hill, your car is loaded with ___ energy.', a: 'potential (stored)', w: ['kinetic', 'sound', 'chemical'], h: 'It hasn\'t dropped YET…', e: 'Height stores potential energy; the drop converts it to kinetic! 🎢' },
      { p: 'You see lightning, THEN hear thunder. Why the delay?', a: 'light travels much faster than sound', w: ['thunder happens later', 'your ears are slow', 'sound travels faster'], h: 'One travels 300,000 km/s; the other 343 m/s.', e: 'Count the gap: every 3 seconds ≈ 1 km away! ⚡' },
      { p: 'Newton\'s 3rd Law: when a swimmer pushes water BACKWARD, the swimmer moves…', a: 'forward (equal & opposite reaction)', w: ['backward too', 'downward', 'nowhere'], h: 'Every action has an equal and opposite…', e: 'Push water back → water pushes YOU forward! 🏊' },
      { p: 'A microwave heats food using…', a: 'electromagnetic waves that vibrate water molecules', w: ['tiny flames', 'sound waves', 'lasers'], h: 'It targets the WATER in food.', e: 'Microwaves shake water molecules — friction = heat! 🍲' },
      { p: 'Rubbing a balloon on your hair makes it stick to a wall because of…', a: 'static electricity (transferred electrons)', w: ['glue on the balloon', 'magnetism', 'air pressure only'], h: 'Electrons jumped from hair to balloon!', e: 'Extra electrons = negative charge = attraction to the wall! 🎈' },
      { p: 'A guitar string vibrating FASTER makes a ___ note.', a: 'higher', w: ['lower', 'quieter always', 'invisible'], h: 'Tighten the string, raise the pitch.', e: 'Faster vibration = higher frequency = higher pitch! 🎸' },
      { p: 'Which travels fastest?', a: 'light', w: ['sound', 'a jet', 'a rocket'], h: 'Nothing beats it.', e: 'Light: ~300,000 km per SECOND. The universal speed limit!' },
      { p: 'Wires are wrapped in rubber because rubber is an INSULATOR, which means it…', a: 'blocks electricity from escaping', w: ['speeds electricity up', 'makes electricity', 'attracts lightning'], h: 'It\'s a safety jacket for wires.', e: 'Conductors carry current; insulators contain it!' },
      { p: 'Doubling your bike speed roughly ___ your kinetic energy.', a: 'quadruples it (energy grows with speed²)', w: ['doubles it', 'halves it', 'doesn\'t change it'], h: 'KE = ½mv² — the v is SQUARED.', e: '2× speed = 4× energy. That\'s why speeding is so dangerous!' }
    ])
  },

  // ---------- GRADES 9-12 ----------
  {
    id: 's.9.biology', name: 'Biology: DNA & Genetics', grade: 9,
    gen: fromBank([
      { p: 'DNA\'s famous shape is called a…', a: 'double helix', w: ['triple knot', 'flat ladder', 'sphere'], h: 'A twisted ladder!', e: 'Two strands spiral around each other — the double helix! 🧬' },
      { p: 'You inherited your eye color from your parents through…', a: 'genes', w: ['blood type only', 'diet', 'exercise'], h: 'They\'re sections of DNA.', e: 'Genes are DNA recipes passed from parents to kids.' },
      { p: 'In Punnett square practice: if brown eyes (B) are dominant over blue (b), a "Bb" person has ___ eyes.', a: 'brown', w: ['blue', 'green', 'one of each'], h: 'Dominant only needs ONE copy.', e: 'One B is enough — dominant traits mask recessive ones.' },
      { p: 'Which process do cells use to copy themselves for growth and repair?', a: 'mitosis', w: ['photosynthesis', 'digestion', 'osmosis only'], h: 'One cell becomes two identical cells.', e: 'Mitosis: copy DNA, split in two. Growth and healing! 🔬' },
      { p: 'Vaccines protect you by…', a: 'training your immune system to recognize a germ before you meet it', w: ['killing all bacteria in your body', 'replacing your blood', 'making you slightly sick forever'], h: 'It\'s like a "wanted poster" for germs.', e: 'Your immune system memorizes the germ\'s look and preps defenses! 💉' },
      { p: 'Half of your DNA comes from each…', a: 'parent', w: ['grandparent only', 'sibling', 'meal'], h: '50/50 recipe.', e: 'You\'re a genetic remix of mom and dad!' },
      { p: 'A mutation is…', a: 'a change in the DNA sequence', w: ['always a superpower', 'a type of cell', 'a disease only'], h: 'A typo in the recipe.', e: 'Most mutations do nothing; some matter; evolution runs on them.' },
      { p: 'Identical twins have…', a: 'the same DNA', w: ['opposite DNA', 'no DNA', 'unrelated DNA'], h: 'One fertilized egg split in two.', e: 'Same DNA, but experiences still make them unique!' },
      { p: 'Antibiotics kill bacteria but NOT…', a: 'viruses — which is why they can\'t cure a cold', w: ['germs of any kind', 'infections', 'anything'], h: 'Colds and flu are viral.', e: 'Wrong tool for viruses — that\'s what vaccines and antivirals are for!' }
    ])
  },
  {
    id: 's.10.chem2', name: 'Chemistry II', grade: 10,
    gen: fromBank([
      { p: 'The pH scale runs 0-14. Lemon juice (pH 2) is…', a: 'acidic', w: ['basic (alkaline)', 'neutral', 'metallic'], h: 'Low pH = ?', e: 'Below 7 = acid. That sour taste is acidity! 🍋' },
      { p: 'Balancing equations: H₂ + O₂ → H₂O. Balanced correctly, it\'s…', a: '2H₂ + O₂ → 2H₂O', w: ['H₂ + O₂ → H₂O', 'H₂ + O → H₂O', '3H₂ + O₂ → H₂O'], h: 'Count each atom on both sides.', e: '4 H and 2 O on each side — balanced! Matter is never lost.' },
      { p: 'Table salt is NaCl — sodium and chlorine bonded by…', a: 'an ionic bond (electron transfer)', w: ['a covalent bond', 'gravity', 'magnetism'], h: 'One atom donates an electron to the other.', e: 'Na gives an electron to Cl — opposites attract! 🧂' },
      { p: 'Why does a cold soda can "sweat" on a hot day?', a: 'water vapor in the air condenses on the cold surface', w: ['the can leaks', 'aluminum melts', 'the soda evaporates through metal'], h: 'Where does the water come from — inside or outside?', e: 'Air\'s invisible moisture condenses on anything cold. 🥤' },
      { p: 'A catalyst\'s job in a reaction is to…', a: 'speed it up without being used up', w: ['slow it down permanently', 'become the product', 'add heat only'], h: 'It helps but survives unchanged.', e: 'Catalysts are reaction coaches — enabling, never consumed!' },
      { p: 'Pure water\'s pH is…', a: '7 (neutral)', w: ['0', '14', '10'], h: 'Dead center of the scale.', e: 'pH 7 = neither acid nor base.' },
      { p: 'An element\'s atomic number equals its number of…', a: 'protons', w: ['electrons only', 'neutrons', 'atoms'], h: 'The + particles define the element.', e: '6 protons = carbon, always. Protons are identity!' },
      { p: 'Hand warmers get hot because their reaction is…', a: 'exothermic (releases heat)', w: ['endothermic', 'frozen', 'nuclear'], h: 'Exo = out.', e: 'Exothermic reactions push heat OUT — pocket-sized chemistry!' },
      { p: 'Diamond and pencil graphite are both made of pure…', a: 'carbon', w: ['diamond dust', 'silver', 'quartz'], h: 'Same atoms, different arrangement!', e: 'Structure changes everything: same carbon, $1 pencil vs $10,000 gem!' }
    ])
  },
  {
    id: 's.11.physics2', name: 'Physics II', grade: 11,
    gen: fromBank([
      { p: 'Using F = ma: a 2 kg skateboard accelerating at 3 m/s² feels a force of…', a: '6 newtons', w: ['5 newtons', '1.5 newtons', '9 newtons'], h: 'Multiply mass × acceleration.', e: 'F = 2 × 3 = 6 N. Newton\'s 2nd law in action! 🛹' },
      { p: 'Sound can\'t travel through space because…', a: 'there\'s no medium (matter) to carry the vibration', w: ['it\'s too cold', 'it\'s too dark', 'space absorbs it'], h: 'Sound needs SOMETHING to vibrate through.', e: 'No air = no sound. Space battles are actually silent! 🚀' },
      { p: 'A wave\'s FREQUENCY measures…', a: 'how many waves pass per second (Hz)', w: ['how tall the wave is', 'how loud it is only', 'its color only'], h: 'Fre-QUEN-cy = how often.', e: 'More waves per second = higher frequency = higher pitch (sound) or bluer light!' },
      { p: 'Your phone charges via a current of moving…', a: 'electrons', w: ['protons', 'neutrons', 'photons only'], h: 'The negatively charged particle.', e: 'Electric current = electrons flowing through the wire. 🔌' },
      { p: 'Momentum = mass × velocity. Why does a slow truck out-momentum a fast bicycle?', a: 'its enormous mass outweighs the bike\'s speed advantage', w: ['trucks are always faster', 'bicycles have no momentum', 'momentum ignores mass'], h: 'p = m × v. Compare the m\'s!', e: 'Huge mass × modest speed can beat tiny mass × high speed. 🚚' },
      { p: 'Ohm\'s law: V = I × R. A 2-amp current through a 5-ohm resistor needs…', a: '10 volts', w: ['7 volts', '2.5 volts', '25 volts'], h: 'Multiply I × R.', e: 'V = 2 × 5 = 10 V. Circuit math! 🔌' },
      { p: 'A crash-test dummy lurches forward when the car stops because of…', a: 'inertia (Newton\'s 1st law)', w: ['gravity increasing', 'the seatbelt pushing', 'air pressure'], h: 'Objects in motion stay in motion…', e: 'The body keeps moving until a force (seatbelt!) stops it.' },
      { p: 'Red light has a ___ wavelength than blue light.', a: 'longer', w: ['shorter', 'identical', 'louder'], h: 'ROY G BIV runs long → short.', e: 'Red ~700nm, blue ~450nm — that\'s why sunsets are red!' },
      { p: 'Power is measured in watts. One watt equals one…', a: 'joule per second', w: ['volt per meter', 'newton', 'amp'], h: 'Energy per time.', e: 'Watts measure how FAST energy is used or delivered.' }
    ])
  },
  {
    id: 's.12.advanced', name: 'Advanced Science', grade: 12,
    gen: fromBank([
      { p: 'Cellular respiration is essentially photosynthesis…', a: 'in reverse — glucose + O₂ → energy + CO₂ + H₂O', w: ['repeated twice', 'only in plants', 'without any chemistry'], h: 'Plants build glucose; cells burn it.', e: 'Life\'s great cycle: plants store solar energy, cells release it! 🔄' },
      { p: 'Entropy (2nd law of thermodynamics) explains why…', a: 'your room naturally gets messier, not cleaner, without effort', w: ['rooms clean themselves', 'energy is created constantly', 'heat flows cold→hot naturally'], h: 'Disorder tends to increase.', e: 'Systems drift toward disorder unless energy is spent — even bedrooms!' },
      { p: 'Radiocarbon dating tells a fossil\'s age by measuring…', a: 'the decay of carbon-14 over time', w: ['its weight', 'its color', 'the rock\'s temperature'], h: 'C-14 decays at a known rate (half-life).', e: 'Half of C-14 decays every 5,730 years — a natural clock! ⏳' },
      { p: 'CRISPR technology lets scientists…', a: 'edit specific genes in DNA', w: ['create black holes', 'clone dinosaurs today', 'read minds'], h: 'It\'s called "gene editing."', e: 'CRISPR works like molecular scissors for precise DNA edits. ✂️🧬' },
      { p: 'The Doppler effect explains why an ambulance siren…', a: 'sounds higher approaching and lower after passing', w: ['gets quieter forever', 'sounds the same always', 'changes color'], h: 'Sound waves compress as it nears you.', e: 'Compressed waves = higher pitch; stretched = lower. Also proves the universe expands! 🚑' },
      { p: 'E = mc² tells us mass can be converted into…', a: 'enormous amounts of energy', w: ['sound only', 'time', 'nothing useful'], h: 'c² is a gigantic multiplier.', e: 'A paperclip\'s mass = a city\'s daily power, if fully converted!' },
      { p: 'Natural selection means organisms with helpful traits…', a: 'survive and reproduce more, spreading those traits', w: ['live forever', 'choose their traits', 'never change'], h: 'Darwin\'s big idea.', e: 'Small advantages compound across generations — evolution!' },
      { p: 'Absolute zero (−273°C) is the temperature where…', a: 'particle motion reaches its minimum', w: ['water boils', 'atoms vanish', 'time stops'], h: 'Cold = slow particles.', e: 'You can\'t get colder — motion can\'t go below minimum!' },
      { p: 'mRNA vaccines work by…', a: 'giving cells instructions to build a harmless piece of the germ for immune practice', w: ['injecting the live disease', 'replacing your DNA', 'killing all viruses instantly'], h: 'It\'s a recipe, not the germ.', e: 'Cells read the mRNA recipe, build the practice target, immunity trains on it! 💉' }
    ])
  }
];

module.exports = { subject: 'science', label: 'Science', emoji: '🔬', color: '#0984E3', skills };

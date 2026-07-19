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
      { p: 'Lemonade tastes sour! Which body part tasted it?', a: 'your tongue', w: ['your ears', 'your elbow', 'your nose'], h: 'It\'s in your mouth.', e: 'Your tongue tastes sweet, sour, salty, and bitter!' }
    ])
  },
  {
    id: 's.k.animals', name: 'Animal Friends', grade: 0,
    gen: fromBank([
      { p: 'Where does a fish live? 🐟', a: 'in water', w: ['in a tree', 'underground', 'in the clouds'], h: 'Fish swim!', e: 'Fish breathe and swim in water.' },
      { p: 'Which animal says "moo" and gives us milk?', a: 'a cow 🐄', w: ['a duck', 'a cat', 'a lion'], h: 'It lives on a farm.', e: 'Cows give us the milk for cheese and ice cream!' },
      { p: 'A baby dog is called a…', a: 'puppy', w: ['kitten', 'cub', 'chick'], h: 'So fluffy!', e: 'Baby dogs are puppies! 🐶' },
      { p: 'Which animal sleeps all winter (hibernates)?', a: 'a bear 🐻', w: ['a robin', 'a butterfly', 'a shark'], h: 'It curls up in a cozy den.', e: 'Bears hibernate through the cold winter.' },
      { p: 'Which animal builds a web to catch food?', a: 'a spider 🕷️', w: ['a bee', 'a frog', 'a mouse'], h: 'Its web is sticky!', e: 'Spiders spin silky webs to catch bugs.' }
    ])
  },
  {
    id: 's.k.weather', name: 'Weather Watch', grade: 0,
    gen: fromBank([
      { p: 'What should you wear when it rains? ☔', a: 'a raincoat and boots', w: ['a swimsuit', 'sunglasses only', 'sandals'], h: 'You want to stay dry!', e: 'Raincoats and boots keep you dry in the rain!' },
      { p: 'What falls from the sky when it is very, very cold?', a: 'snow ❄️', w: ['rain', 'leaves', 'bubbles'], h: 'You can build a snowman with it!', e: 'When it\'s freezing, rain becomes snow!' },
      { p: 'The sun gives us light and…', a: 'warmth (heat)', w: ['snow', 'wind', 'rain'], h: 'How does sunshine feel on your skin?', e: 'The sun warms our whole planet! ☀️' },
      { p: 'What do you see in the sky during a storm, right before thunder?', a: 'lightning ⚡', w: ['rainbows', 'stars', 'balloons'], h: 'It\'s a bright flash!', e: 'Lightning flashes first, then thunder booms!' }
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
      { p: 'Which came FIRST in an apple tree\'s life?', a: 'a seed', w: ['an apple', 'a leaf', 'a branch'], h: 'Every giant tree starts tiny.', e: 'Seed → sprout → tree → flowers → apples! 🍎' }
    ])
  },
  {
    id: 's.2.matter', name: 'Solids, Liquids & Gases', grade: 2,
    gen: fromBank([
      { p: 'Your popsicle melts in the sun! 🍦 It changed from a solid to a…', a: 'liquid', w: ['gas', 'shadow', 'crystal'], h: 'It drips now!', e: 'Heat melts solids into liquids.' },
      { p: 'The bathroom mirror fogs up during a hot shower. That fog comes from water as a…', a: 'gas (water vapor)', w: ['solid', 'rock', 'juice'], h: 'You can\'t grab it — it floats in air!', e: 'Hot water evaporates into invisible vapor, then fogs the cold mirror!' },
      { p: 'Which one is a SOLID?', a: 'an ice cube', w: ['orange juice', 'steam', 'milk'], h: 'Solids keep their shape.', e: 'Ice keeps its cube shape — solid! (Until it melts…)' },
      { p: 'You pour juice from a bottle into a glass. The juice changes its ___ but not its amount.', a: 'shape', w: ['color', 'taste', 'temperature'], h: 'Liquids take the shape of their container.', e: 'Liquids flow to fit any container!' },
      { p: 'What happens to a puddle on a hot sunny day?', a: 'it evaporates into the air', w: ['it freezes', 'it gets deeper', 'it turns to juice'], h: 'Where did it GO?', e: 'The sun\'s heat turns puddle water into vapor — evaporation! ☀️' }
    ])
  },
  {
    id: 's.2.habitats', name: 'Habitats & Homes', grade: 2,
    gen: fromBank([
      { p: 'A camel\'s humps and wide feet make it perfect for which habitat?', a: 'the desert 🏜️', w: ['the ocean', 'the arctic', 'a rainforest'], h: 'Hot, dry, and sandy!', e: 'Camels store fat in humps and walk on sand like snowshoes!' },
      { p: 'Why is a polar bear\'s fur white?', a: 'to blend in with snow while hunting (camouflage)', w: ['to stay cool', 'because it\'s old', 'to scare fish'], h: 'Sneaky hunting trick!', e: 'White fur = invisible in snow = camouflage! ❄️' },
      { p: 'Which animal is perfectly built for the ocean?', a: 'a dolphin 🐬', w: ['a camel', 'an eagle', 'a squirrel'], h: 'Flippers and fins!', e: 'Dolphins have flippers, fins, and a blowhole for ocean life.' },
      { p: 'A frog lays eggs in water, but adult frogs can hop on land. Frogs are…', a: 'amphibians (live in water AND on land)', w: ['reptiles only', 'fish', 'birds'], h: 'Amphi = both!', e: 'Amphibians like frogs live double lives — water AND land! 🐸' },
      { p: 'In a forest food chain: acorn → squirrel → hawk. What is the squirrel?', a: 'both eater and food (a consumer that gets eaten)', w: ['a plant', 'the top predator', 'a producer'], h: 'It eats AND gets eaten.', e: 'Squirrels eat acorns, hawks eat squirrels — nature\'s chain!' }
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
      { p: 'A magnet will stick to which object?', a: 'a steel paperclip', w: ['a plastic spoon', 'a wooden block', 'a rubber ball'], h: 'Magnets love certain metals.', e: 'Magnets attract iron and steel — not plastic, wood, or rubber!' }
    ])
  },
  {
    id: 's.4.space', name: 'Solar System Explorer', grade: 4,
    gen: fromBank([
      { p: 'Why do we have day and night?', a: 'Earth spins (rotates) once every 24 hours', w: ['the sun turns off', 'the moon blocks the sun nightly', 'clouds cover everything'], h: 'Imagine a spinning basketball near a lamp.', e: 'Your side of Earth faces the sun (day), then spins away (night)! 🌍' },
      { p: 'Which planet is famous for its beautiful rings?', a: 'Saturn 🪐', w: ['Mars', 'Venus', 'Mercury'], h: 'It\'s the "ringed planet."', e: 'Saturn\'s rings are made of ice and rock chunks!' },
      { p: 'The moon seems to change shape during the month. These changes are called…', a: 'phases', w: ['seasons', 'eclipses', 'orbits'], h: 'New moon, half moon, full moon…', e: 'Moon phases = how much sunlit moon we see from Earth! 🌙' },
      { p: 'What does the sun actually make that reaches Earth?', a: 'light and heat energy', w: ['oxygen', 'water', 'gravity only'], h: 'What do you feel on a sunny day?', e: 'The sun is a giant star powering Earth with light and heat!' },
      { p: 'Why does a year on Earth last 365 days?', a: 'that\'s how long Earth takes to orbit the sun once', w: ['that\'s how long Earth takes to spin once', 'the moon decides it', 'it\'s just a tradition'], h: 'A year = one full trip around…', e: 'One lap around the sun = one year! 🎂' }
    ])
  },
  {
    id: 's.5.body', name: 'Amazing Human Body', grade: 5,
    gen: fromBank([
      { p: 'You sprint at recess and your heart pounds. Why?', a: 'muscles need extra oxygen, so the heart pumps blood faster', w: ['the heart is scared', 'blood is overheating', 'lungs stop working'], h: 'Blood delivers oxygen — running muscles need MORE.', e: 'Faster pumping = faster oxygen delivery to working muscles! ❤️' },
      { p: 'Which organ is your body\'s "command center," sending signals through nerves?', a: 'the brain 🧠', w: ['the stomach', 'the lungs', 'the kidneys'], h: 'You\'re using it RIGHT NOW.', e: 'The brain controls thoughts, movement, and even your heartbeat!' },
      { p: 'What do your lungs trade with every breath?', a: 'oxygen in, carbon dioxide out', w: ['food in, water out', 'blood in, air out', 'nothing — they just inflate'], h: 'It\'s a gas exchange!', e: 'Breathe in O₂ for your cells; breathe out CO₂ waste. 🫁' },
      { p: 'Why does your body make you shiver when you\'re freezing at the bus stop?', a: 'shivering muscles generate heat to warm you', w: ['to scare the cold away', 'your bones are rattling', 'to make you run home'], h: 'Moving muscles make warmth.', e: 'Shivering = your body\'s built-in heater! 🥶' },
      { p: 'Which body system turns your lunch into fuel?', a: 'the digestive system', w: ['the skeletal system', 'the nervous system', 'the circulatory system'], h: 'Stomach and intestines are its stars.', e: 'Digestion breaks food into nutrients your cells can use! 🌮' }
    ])
  },
  {
    id: 's.5.ecosystems', name: 'Ecosystems & Energy', grade: 5,
    gen: fromBank([
      { p: 'In every food chain, energy ALWAYS starts with…', a: 'the sun', w: ['the biggest predator', 'water', 'soil'], h: 'What powers the plants?', e: 'Sun → plants → herbivores → predators. Solar-powered life! ☀️' },
      { p: 'Mushrooms and bacteria that break down dead leaves are called…', a: 'decomposers', w: ['producers', 'predators', 'prey'], h: 'They\'re nature\'s recycling crew.', e: 'Decomposers return nutrients to the soil — nothing is wasted!' },
      { p: 'If all the wolves vanished from a forest, what would likely happen first?', a: 'deer populations would boom and overeat plants', w: ['nothing would change', 'trees would grow faster forever', 'deer would disappear too'], h: 'Who was eating the deer?', e: 'Remove a predator → prey explodes → plants suffer. Balance matters! 🐺' },
      { p: 'A cactus storing water in its thick stem is an example of…', a: 'an adaptation to its environment', w: ['pollution', 'hibernation', 'migration'], h: 'Desert survival skills!', e: 'Adaptations are body features that help survival in a habitat. 🌵' },
      { p: 'Geese flying south for winter is called…', a: 'migration', w: ['hibernation', 'camouflage', 'evaporation'], h: 'They travel to warmer places.', e: 'Migration = seasonal travel for food and warmth! 🪿' }
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
      { p: 'A cut on your knee heals because your cells…', a: 'divide to make new cells', w: ['melt together', 'borrow skin from clothes', 'never change'], h: 'New skin comes from where?', e: 'Cell division (mitosis) rebuilds damaged tissue. 🩹' }
    ])
  },
  {
    id: 's.7.chemistry', name: 'Chemistry Basics', grade: 7,
    gen: fromBank([
      { p: 'Water is H₂O. That means each molecule has…', a: '2 hydrogen atoms and 1 oxygen atom', w: ['2 oxygen and 1 hydrogen', '20 hydrogen atoms', '1 helium and 1 oxygen'], h: 'The little 2 counts the H\'s.', e: 'H₂O = two H, one O. You drink molecules! 💧' },
      { p: 'Baking soda + vinegar = instant fizzing volcano! The bubbles prove…', a: 'a chemical reaction made a new gas (CO₂)', w: ['the vinegar is boiling', 'air leaked in', 'nothing happened'], h: 'Where did bubbles come from? Something NEW formed.', e: 'The reaction creates carbon dioxide gas — brand-new stuff! 🌋' },
      { p: 'On the periodic table, "Au" stands for…', a: 'gold', w: ['silver', 'aluminum', 'argon'], h: 'From Latin "aurum." Think treasure!', e: 'Au = gold (aurum). Chemistry has its own secret code! 🏆' },
      { p: 'Chopping a carrot is a PHYSICAL change. Cooking it until it browns is a…', a: 'chemical change (new substances form)', w: ['physical change', 'phase change only', 'magnetic change'], h: 'Can you un-cook it?', e: 'Browning = new chemical compounds = chemical change! 🥕' },
      { p: 'An atom has protons (+), electrons (−), and…', a: 'neutrons (no charge)', w: ['photons', 'ions only', 'molecules'], h: 'The neutral one in the nucleus.', e: 'Neutrons sit in the nucleus with protons, adding mass but no charge.' }
    ])
  },
  {
    id: 's.7.earth', name: 'Earth Science', grade: 7,
    gen: fromBank([
      { p: 'Earthquakes happen mostly at the edges of…', a: 'tectonic plates', w: ['clouds', 'oceans only', 'time zones'], h: 'Earth\'s crust is cracked into giant puzzle pieces.', e: 'Plates grind past each other — the jolt is an earthquake!' },
      { p: 'The water cycle: evaporation → condensation → ___ → collection.', a: 'precipitation (rain/snow)', w: ['pollination', 'perspiration', 'hibernation'], h: 'What falls from clouds?', e: 'Clouds release rain or snow — precipitation! 🌧️' },
      { p: 'Which rock type forms when melted rock (magma/lava) cools and hardens?', a: 'igneous', w: ['sedimentary', 'metamorphic', 'sandstone'], h: 'Ignis = fire in Latin.', e: 'Igneous = born of fire. Volcanoes are rock factories! 🌋' },
      { p: 'Why is it summer in Australia when it\'s winter in New York?', a: 'Earth\'s tilt points hemispheres toward/away from the sun at different times', w: ['Australia is closer to the sun', 'the sun flips over', 'Australia has no winter'], h: 'It\'s the 23.5° tilt!', e: 'The tilted hemisphere gets more direct sunlight = summer. 🌏' },
      { p: 'Fossils of ocean creatures found on mountain tops prove that…', a: 'that land was once under the sea and was pushed up over time', w: ['fish can climb', 'someone carried them up', 'mountains are fake'], h: 'Mountains RISE over millions of years.', e: 'Plate collisions lift ancient seafloors sky-high! 🐚⛰️' }
    ])
  },
  {
    id: 's.8.physics', name: 'Energy & Physics', grade: 8,
    gen: fromBank([
      { p: 'At the TOP of a roller coaster hill, your car is loaded with ___ energy.', a: 'potential (stored)', w: ['kinetic', 'sound', 'chemical'], h: 'It hasn\'t dropped YET…', e: 'Height stores potential energy; the drop converts it to kinetic! 🎢' },
      { p: 'You see lightning, THEN hear thunder. Why the delay?', a: 'light travels much faster than sound', w: ['thunder happens later', 'your ears are slow', 'sound travels faster'], h: 'One travels 300,000 km/s; the other 343 m/s.', e: 'Count the gap: every 3 seconds ≈ 1 km away! ⚡' },
      { p: 'Newton\'s 3rd Law: when a swimmer pushes water BACKWARD, the swimmer moves…', a: 'forward (equal & opposite reaction)', w: ['backward too', 'downward', 'nowhere'], h: 'Every action has an equal and opposite…', e: 'Push water back → water pushes YOU forward! 🏊' },
      { p: 'A microwave heats food using…', a: 'electromagnetic waves that vibrate water molecules', w: ['tiny flames', 'sound waves', 'lasers'], h: 'It targets the WATER in food.', e: 'Microwaves shake water molecules — friction = heat! 🍲' },
      { p: 'Rubbing a balloon on your hair makes it stick to a wall because of…', a: 'static electricity (transferred electrons)', w: ['glue on the balloon', 'magnetism', 'air pressure only'], h: 'Electrons jumped from hair to balloon!', e: 'Extra electrons = negative charge = attraction to the wall! 🎈' }
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
      { p: 'Vaccines protect you by…', a: 'training your immune system to recognize a germ before you meet it', w: ['killing all bacteria in your body', 'replacing your blood', 'making you slightly sick forever'], h: 'It\'s like a "wanted poster" for germs.', e: 'Your immune system memorizes the germ\'s look and preps defenses! 💉' }
    ])
  },
  {
    id: 's.10.chem2', name: 'Chemistry II', grade: 10,
    gen: fromBank([
      { p: 'The pH scale runs 0-14. Lemon juice (pH 2) is…', a: 'acidic', w: ['basic (alkaline)', 'neutral', 'metallic'], h: 'Low pH = ?', e: 'Below 7 = acid. That sour taste is acidity! 🍋' },
      { p: 'Balancing equations: H₂ + O₂ → H₂O. Balanced correctly, it\'s…', a: '2H₂ + O₂ → 2H₂O', w: ['H₂ + O₂ → H₂O', 'H₂ + O → H₂O', '3H₂ + O₂ → H₂O'], h: 'Count each atom on both sides.', e: '4 H and 2 O on each side — balanced! Matter is never lost.' },
      { p: 'Table salt is NaCl — sodium and chlorine bonded by…', a: 'an ionic bond (electron transfer)', w: ['a covalent bond', 'gravity', 'magnetism'], h: 'One atom donates an electron to the other.', e: 'Na gives an electron to Cl — opposites attract! 🧂' },
      { p: 'Why does a cold soda can "sweat" on a hot day?', a: 'water vapor in the air condenses on the cold surface', w: ['the can leaks', 'aluminum melts', 'the soda evaporates through metal'], h: 'Where does the water come from — inside or outside?', e: 'Air\'s invisible moisture condenses on anything cold. 🥤' },
      { p: 'A catalyst\'s job in a reaction is to…', a: 'speed it up without being used up', w: ['slow it down permanently', 'become the product', 'add heat only'], h: 'It helps but survives unchanged.', e: 'Catalysts are reaction coaches — enabling, never consumed!' }
    ])
  },
  {
    id: 's.11.physics2', name: 'Physics II', grade: 11,
    gen: fromBank([
      { p: 'Using F = ma: a 2 kg skateboard accelerating at 3 m/s² feels a force of…', a: '6 newtons', w: ['5 newtons', '1.5 newtons', '9 newtons'], h: 'Multiply mass × acceleration.', e: 'F = 2 × 3 = 6 N. Newton\'s 2nd law in action! 🛹' },
      { p: 'Sound can\'t travel through space because…', a: 'there\'s no medium (matter) to carry the vibration', w: ['it\'s too cold', 'it\'s too dark', 'space absorbs it'], h: 'Sound needs SOMETHING to vibrate through.', e: 'No air = no sound. Space battles are actually silent! 🚀' },
      { p: 'A wave\'s FREQUENCY measures…', a: 'how many waves pass per second (Hz)', w: ['how tall the wave is', 'how loud it is only', 'its color only'], h: 'Fre-QUEN-cy = how often.', e: 'More waves per second = higher frequency = higher pitch (sound) or bluer light!' },
      { p: 'Your phone charges via a current of moving…', a: 'electrons', w: ['protons', 'neutrons', 'photons only'], h: 'The negatively charged particle.', e: 'Electric current = electrons flowing through the wire. 🔌' },
      { p: 'Momentum = mass × velocity. Why does a slow truck out-momentum a fast bicycle?', a: 'its enormous mass outweighs the bike\'s speed advantage', w: ['trucks are always faster', 'bicycles have no momentum', 'momentum ignores mass'], h: 'p = m × v. Compare the m\'s!', e: 'Huge mass × modest speed can beat tiny mass × high speed. 🚚' }
    ])
  },
  {
    id: 's.12.advanced', name: 'Advanced Science', grade: 12,
    gen: fromBank([
      { p: 'Cellular respiration is essentially photosynthesis…', a: 'in reverse — glucose + O₂ → energy + CO₂ + H₂O', w: ['repeated twice', 'only in plants', 'without any chemistry'], h: 'Plants build glucose; cells burn it.', e: 'Life\'s great cycle: plants store solar energy, cells release it! 🔄' },
      { p: 'Entropy (2nd law of thermodynamics) explains why…', a: 'your room naturally gets messier, not cleaner, without effort', w: ['rooms clean themselves', 'energy is created constantly', 'heat flows cold→hot naturally'], h: 'Disorder tends to increase.', e: 'Systems drift toward disorder unless energy is spent — even bedrooms!' },
      { p: 'Radiocarbon dating tells a fossil\'s age by measuring…', a: 'the decay of carbon-14 over time', w: ['its weight', 'its color', 'the rock\'s temperature'], h: 'C-14 decays at a known rate (half-life).', e: 'Half of C-14 decays every 5,730 years — a natural clock! ⏳' },
      { p: 'CRISPR technology lets scientists…', a: 'edit specific genes in DNA', w: ['create black holes', 'clone dinosaurs today', 'read minds'], h: 'It\'s called "gene editing."', e: 'CRISPR works like molecular scissors for precise DNA edits. ✂️🧬' },
      { p: 'The Doppler effect explains why an ambulance siren…', a: 'sounds higher approaching and lower after passing', w: ['gets quieter forever', 'sounds the same always', 'changes color'], h: 'Sound waves compress as it nears you.', e: 'Compressed waves = higher pitch; stretched = lower. Also proves the universe expands! 🚑' }
    ])
  }
];

module.exports = { subject: 'science', label: 'Science', emoji: '🔬', color: '#0984E3', skills };

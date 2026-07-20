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
      { p: 'You close your eyes tight. Which sense can you NOT use now?', a: 'sight', w: ['hearing', 'smell', 'touch'], h: 'What do eyes do?', e: 'Closed eyes = no seeing — but your other senses still work!' },
      { p: "Grandma's soup is bubbling on the stove. Which sense smells it first?", a: "your nose", w: ["your knees", "your eyes", "your hair"], h: "Mmm, what a smell!", e: "Noses catch yummy smells floating in the air!" },
      { p: "A fire truck races by! WOO WOO! Which sense notices?", a: "hearing", w: ["taste", "smell", "touch"], h: "It is very LOUD.", e: "Sirens are loud so our ears notice fast — that keeps us safe!" },
      { p: "You find a shiny red apple. Which sense tells you it is red?", a: "sight (eyes)", w: ["hearing", "touch", "taste"], h: "Look at it!", e: "Eyes see colors — red, green, gold!" },
      { p: "Sand at the beach feels warm and tickly between your toes. Which sense is that?", a: "touch", w: ["hearing", "sight", "smell"], h: "Your toes are feeling it!", e: "Skin all over your body can feel — even your toes!" },
      { p: "Which sense would tell you milk has gone yucky BEFORE you drink it?", a: "smell", w: ["hearing", "sight only", "touch"], h: "Take a little sniff first.", e: "A sniff test protects you — noses are safety helpers!" },
      { p: "A butterfly lands on your finger so gently. Which TWO senses notice it?", a: "sight and touch", w: ["taste and smell", "hearing and taste", "smell only"], h: "You SEE it land and FEEL its tiny feet!", e: "Eyes watch it, skin feels the tickle. Two senses teaming up!" }
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
      { p: 'Which animal has a long trunk for drinking and grabbing?', a: 'an elephant 🐘', w: ['a giraffe', 'a zebra', 'a bear'], h: 'Its nose is SUPER long!', e: 'An elephant\'s trunk is nose and hand in one!' },
      { p: "Which animal says MOO and gives us milk? 🐄", a: "a cow", w: ["a duck", "a cat", "a frog"], h: "It lives on a farm.", e: "Cows moo and make the milk for your cereal!" },
      { p: "Which baby animal hatches from an egg?", a: "a chick 🐣", w: ["a puppy", "a kitten", "a baby horse"], h: "Crack, crack… peep!", e: "Chicks, ducklings, and turtles all hatch from eggs!" },
      { p: "A fish breathes underwater using its…", a: "gills", w: ["nose", "ears", "paws"], h: "Look at the slits on its sides.", e: "Gills take air right out of the water!" },
      { p: "Which animal sleeps all winter long? 💤", a: "a bear", w: ["a dog", "a chicken", "a goldfish"], h: "It naps in a cozy cave.", e: "That long winter sleep is called hibernation!" },
      { p: "Why do birds build nests?", a: "to keep their eggs and babies safe", w: ["to play games", "to hide from rain only", "to store toys"], h: "What goes IN the nest?", e: "Nests are cozy cradles for eggs and chicks!" },
      { p: "Which animal carries its house on its back? 🐌", a: "a snail", w: ["a horse", "a bunny", "a fish"], h: "It moves sloooowly.", e: "A snail's shell is its home — always with it!" }
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
      { p: 'It will be SUNNY and HOT at the park today. What should you bring?', a: 'water and a sun hat', w: ['a snow shovel', 'a heavy coat', 'an umbrella for rain'], h: 'Stay cool and drink up!', e: 'Hot days need water, shade, and sun protection! ☀️' },
      { p: "Puddles appear on the ground after…", a: "rain", w: ["sunshine", "wind", "snow melts up"], h: "Drip drop from the clouds!", e: "Rain falls down and collects in puddles to splash!" },
      { p: "What do you see in the sky during a storm before you hear thunder?", a: "lightning ⚡", w: ["a rainbow", "the moon", "stars"], h: "A big flash!", e: "Light travels faster than sound — flash first, BOOM after!" },
      { p: "It is snowing! ❄️ What should you wear outside?", a: "a warm coat and mittens", w: ["a swimsuit", "sandals", "sunglasses only"], h: "Brrr! It is cold!", e: "Snow means cold — bundle up to stay toasty!" },
      { p: "The wind is blowing hard. What might happen to your kite?", a: "it will fly high", w: ["it will sink in the ground", "it will melt", "nothing at all"], h: "Kites LOVE wind!", e: "Wind pushes kites up, up, up!" },
      { p: "Clouds are made of…", a: "tiny drops of water", w: ["cotton candy", "smoke from houses", "feathers"], h: "They float but they are wet inside!", e: "Millions of tiny water drops make one fluffy cloud!" },
      { p: "Which season comes after winter, when flowers start to bloom?", a: "spring 🌷", w: ["summer", "fall", "another winter"], h: "Snow melts and buds pop!", e: "Spring wakes the flowers and baby animals!" }
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
      { p: 'Why do farmers plant seeds in spring instead of winter?', a: 'seeds need warm soil and sunlight to sprout', w: ['seeds like snow', 'winter is too sunny', 'farmers are busy skiing'], h: 'What do seeds need?', e: 'Warm spring soil + longer days = perfect sprouting weather! 🌱' },
      { p: "What do roots do for a plant?", a: "drink water from the soil and hold it steady", w: ["make the flowers smell nice", "catch bugs", "turn sunlight into seeds"], h: "They are underground like straws!", e: "Roots are underground straws AND anchors!" },
      { p: "Which part of the plant makes food from sunlight?", a: "the leaves", w: ["the roots", "the dirt", "the flower petals only"], h: "They are green and flat.", e: "Leaves are little food factories powered by the sun!" },
      { p: "A sunflower turns its face during the day to follow the…", a: "sun", w: ["moon", "wind", "bees"], h: "Its name is a clue!", e: "Young sunflowers track the sun across the sky — sun-chasers!" },
      { p: "What travels on the wind, on animal fur, and even in bird tummies to grow new plants?", a: "seeds", w: ["leaves", "roots", "rocks"], h: "Dandelion fluff is full of them!", e: "Seeds hitch rides everywhere — that is how plants spread!" },
      { p: "Why do bees visit flowers?", a: "to drink nectar — and they carry pollen flower to flower", w: ["to take naps", "to hide from birds", "to eat the leaves"], h: "They get dusted with yellow powder!", e: "Bees get a snack, flowers get pollen delivered. Teamwork!" },
      { p: "You forget to water your bean plant for two weeks. What happens?", a: "it droops and dries out", w: ["it grows twice as fast", "it turns into a cactus", "nothing changes"], h: "Plants are thirsty living things!", e: "No water = a droopy plant. Living things need care!" }
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
      { p: 'Chocolate melts in your pocket but a coin does not. Why?', a: 'chocolate melts at a much lower temperature', w: ['coins are magic', 'chocolate is a liquid already', 'pockets only melt food'], h: 'Different solids melt at different heats!', e: 'Every material has its own melting point — chocolate\'s is near body heat! 🍫' },
      { p: "Water freezes into ice in the freezer. Freezing turns a liquid into a…", a: "solid", w: ["gas", "shadow", "sound"], h: "Ice cubes hold their shape!", e: "Cold slows water bits down until they lock into solid ice!" },
      { p: "Steam rising from hot soup is water as a…", a: "gas", w: ["solid", "liquid", "rock"], h: "It floats up into the air!", e: "Heat speeds water up until it floats away as gas!" },
      { p: "Which one is a liquid?", a: "orange juice", w: ["a spoon", "an ice cube", "a balloon"], h: "It takes the shape of its cup!", e: "Liquids flow and fit their container — juice, milk, water!" },
      { p: "You leave a puddle in the sun. Hours later it is gone! Where did it go?", a: "it evaporated into the air", w: ["it turned to stone", "a cloud drank it with a straw", "it sank to the middle of Earth"], h: "The sun warmed it up, up, and away…", e: "Sun heat turns puddles into invisible water vapor. Evaporation!" },
      { p: "A balloon is squishy because it is full of…", a: "gas (air)", w: ["solid rocks", "water", "sand"], h: "What do you blow into it?", e: "Air is a gas — it spreads out to fill the whole balloon!" },
      { p: "Which change can you UNDO: melting an ice pop, or baking a cake?", a: "melting the ice pop — refreeze it!", w: ["baking the cake", "both", "neither"], h: "Can you un-bake a cake?", e: "Freezing and melting flip back and forth; baking changes things forever!" }
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
      { p: 'Which habitat is home to the MOST kinds of plants and animals?', a: 'a rainforest 🌴', w: ['a parking lot', 'the north pole', 'a sand dune'], h: 'Warm + rainy = life everywhere!', e: 'Rainforests hold more species than anywhere on Earth!' },
      { p: "A camel's humps store fat so it can travel far in the…", a: "desert", w: ["ocean", "rainforest", "arctic"], h: "Hot, dry, and sandy!", e: "Humps are like a built-in lunchbox for long desert trips!" },
      { p: "Which animal is built for icy cold with a thick layer of blubber?", a: "a polar bear", w: ["a lizard", "a parrot", "a camel"], h: "It lives where snow never ends.", e: "Blubber is a warm blanket under the skin!" },
      { p: "Fish, crabs, and whales all make their home in the…", a: "ocean", w: ["desert", "forest floor", "clouds"], h: "It is big, blue, and salty!", e: "The ocean is Earth's biggest habitat!" },
      { p: "Why do owls have huge eyes?", a: "to see and hunt at night", w: ["to look cute", "to scare mice", "to watch TV"], h: "When do owls wake up?", e: "Big eyes gather moonlight — perfect for night hunters!" },
      { p: "A frog can live in water AND on land. Animals like this are called…", a: "amphibians", w: ["reptiles", "birds", "insects"], h: "Amphi- means BOTH!", e: "Frogs start as tadpoles in water, then hop onto land!" },
      { p: "Squirrels bury nuts in fall because…", a: "food is hard to find in winter", w: ["they like digging for fun", "nuts grow better underground", "birds tell them to"], h: "What is coming after fall?", e: "Burying nuts is saving up — a pantry for winter!" }
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
      { p: 'A paper airplane glides because moving air pushes UP on its wings. That push is called…', a: 'lift ✈️', w: ['drag', 'gravity', 'thrust only'], h: 'It\'s what keeps real planes up too!', e: 'Wings shape the air to create lift — flight\'s secret!' },
      { p: "You kick a soccer ball and it eventually stops rolling. What slowed it down?", a: "friction with the grass", w: ["the ball got tired", "gravity turned off", "the wind always stops balls"], h: "The grass rubs against it.", e: "Friction is a rubbing force that slows moving things!" },
      { p: "Which needs MORE force to push: an empty wagon or one full of bricks?", a: "the full wagon — more mass needs more force", w: ["the empty wagon", "both the same", "wagons cannot be pushed"], h: "Which is heavier?", e: "Heavier things need bigger pushes. That is Newton thinking!" },
      { p: "A magnet picks up a paperclip WITHOUT touching it. That is because magnets…", a: "pull from a distance with an invisible force", w: ["have sticky glue", "blow air", "are alive"], h: "No touching needed!", e: "Magnetic force reaches through the air — even through paper!" },
      { p: "Why do playground slides feel faster when you wear slippery pants?", a: "less friction between you and the slide", w: ["gravity gets stronger", "the slide grows taller", "your shoes push you"], h: "Smooth + smooth = zoooom!", e: "Less rubbing = less slowing = faster slide!" },
      { p: "A tug-of-war rope is not moving. What do you know about the two teams?", a: "their pulls are balanced (equal and opposite)", w: ["nobody is pulling", "the rope is broken", "one team is much stronger"], h: "Equal pulls cancel out!", e: "Balanced forces = no motion. The first team to out-pull wins!" },
      { p: "You drop a ball. What force pulls it to the ground?", a: "gravity", w: ["friction", "magnetism", "the wind"], h: "The same force keeps YOU on Earth!", e: "Gravity pulls everything toward Earth's center — no exceptions!" }
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
      { p: 'Astronauts float on the space station because…', a: 'they are constantly falling around Earth — it feels like floating', w: ['there is zero gravity in space', 'their suits have fans', 'the station has anti-gravity engines'], h: 'They\'re falling AND moving sideways super fast.', e: 'Orbit = endless free-fall around the planet. Weightless! 🧑‍🚀' },
      { p: "Why does the Moon seem to change shape during the month?", a: "we see different amounts of its sunlit side", w: ["it really shrinks and grows", "clouds cover it", "Earth's shadow does it every night"], h: "The Moon is always half-lit by the sun.", e: "Moon phases are just our changing VIEW of its lit half!" },
      { p: "One trip of Earth all the way around the Sun takes…", a: "one year", w: ["one day", "one month", "one hour"], h: "How old are you in trips?", e: "365 days = one lap around the Sun = your age in laps!" },
      { p: "Why is it hot in summer and cold in winter?", a: "Earth is tilted, so sunlight hits us more directly in summer", w: ["Earth moves closer to the Sun in summer", "the Sun gets bigger", "clouds block winter sun"], h: "It is about the TILT, not distance!", e: "The 23.5° tilt aims your half of Earth toward or away from the Sun!" },
      { p: "Which planet is famous for its beautiful rings?", a: "Saturn", w: ["Mars", "Mercury", "Venus"], h: "They are made of ice and rock chunks.", e: "Saturn's rings would stretch nearly Earth-to-Moon if unrolled!" },
      { p: "The Sun is actually a…", a: "star — just much closer than the others", w: ["planet", "giant lamp", "comet"], h: "What are those night-sky dots?", e: "Every star is a faraway sun. Ours is just OUR star!" },
      { p: "Day and night happen because Earth…", a: "spins on its axis", w: ["orbits the Moon", "stops moving at night", "flips upside down"], h: "One full spin takes 24 hours!", e: "Your side of Earth faces the Sun (day), then spins away (night)!" }
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
      { p: 'Muscles work in PAIRS (like biceps & triceps) because a muscle can only…', a: 'pull — never push', w: ['push — never pull', 'work at night', 'grow one at a time'], h: 'One pulls the arm up, the other pulls it back down.', e: 'Muscles contract (pull), so every joint needs a partner team!' },
      { p: "Your heart is a muscle that never rests. Its job is to…", a: "pump blood to every part of your body", w: ["digest food", "think thoughts", "hold your bones together"], h: "Feel it thumping in your chest!", e: "About 100,000 beats a day, delivering oxygen everywhere!" },
      { p: "Which body system turns your sandwich into fuel?", a: "the digestive system", w: ["the skeleton", "the eyes", "the eardrums"], h: "It starts with a bite and a chew!", e: "Stomach and intestines break food into fuel your cells can use!" },
      { p: "Why does your body make you shiver when you are cold?", a: "shivering muscles make heat", w: ["to shake off snow", "to exercise your bones", "for no reason"], h: "Moving muscles warm you up!", e: "Shivering is your built-in heater — muscle wiggles make warmth!" },
      { p: "Your lungs' job is to…", a: "take in oxygen and push out carbon dioxide", w: ["pump blood", "digest snacks", "make you taller"], h: "Breathe in… breathe out…", e: "Every breath trades old air for fresh oxygen your body needs!" },
      { p: "Bones protect soft parts inside you. Your skull protects your…", a: "brain", w: ["stomach", "knees", "toes"], h: "Knock knock — hard hat!", e: "The skull is a built-in helmet for your amazing brain!" },
      { p: "Why do doctors say to wash your hands before eating?", a: "to wash away germs that could make you sick", w: ["to make food taste better", "to keep towels busy", "hands get cold otherwise"], h: "Germs are too small to see!", e: "Soap sweeps away invisible germs before they hitch a ride on your snack!" }
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
      { p: 'Trash dumped in a stream can hurt animals far away because…', a: 'water carries it downstream to other habitats', w: ['animals like trash', 'streams destroy trash instantly', 'it stays in one spot forever'], h: 'Streams flow to rivers, rivers to the sea…', e: 'Pollution travels — protecting water protects everyone downstream! 🌊' },
      { p: "In a food chain, energy always starts with…", a: "the sun", w: ["the biggest predator", "the soil", "the rain"], h: "What do plants need to grow?", e: "Sun → plants → herbivores → predators. Every chain starts with sunshine!" },
      { p: "Worms, mushrooms, and mold are nature's…", a: "decomposers — they recycle dead things into soil", w: ["producers", "predators", "germ factories to avoid"], h: "They break things down.", e: "Decomposers turn fallen leaves into fresh soil. Nature wastes nothing!" },
      { p: "If all the bees disappeared, what would happen to many plants?", a: "they could not make seeds and fruit", w: ["they would grow faster", "nothing — plants do not need bees", "they would learn to fly"], h: "Who delivers their pollen?", e: "No pollinators = no apples, almonds, or berries. Bees matter!" },
      { p: "A hawk eats a snake that ate a mouse that ate seeds. The hawk is the…", a: "top predator in this food chain", w: ["producer", "decomposer", "prey"], h: "Nobody in this chain eats the hawk!", e: "Top predators sit at the end of the chain — and keep it balanced!" },
      { p: "Why do scientists call rainforests the lungs of the Earth?", a: "their trees make huge amounts of oxygen", w: ["they breathe loudly", "they are shaped like lungs", "rain sounds like breathing"], h: "What do trees give off?", e: "Billions of leaves turning CO2 into the oxygen we breathe!" },
      { p: "An invasive species is a living thing that…", a: "moves into a new place and crowds out the locals", w: ["is invisible", "only lives in caves", "is always poisonous"], h: "It does not belong there.", e: "With no natural predators, invaders can take over. Balance matters!" }
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
      { p: 'Which is bigger: a cell or an atom?', a: 'a cell — cells are built from trillions of atoms', w: ['an atom', 'they\'re the same size', 'neither has a size'], h: 'Atoms build molecules build cells.', e: 'Atoms → molecules → cells → you!' },
      { p: "The part of the cell that acts as its control center, holding DNA, is the…", a: "nucleus", w: ["mitochondria", "cell wall", "vacuole"], h: "It stores the instructions.", e: "The nucleus is the cell's library and boss office in one!" },
      { p: "Mitochondria are called the powerhouse of the cell because they…", a: "release energy from food", w: ["store water", "hold the DNA", "make the cell green"], h: "Think power plant.", e: "Mitochondria turn food + oxygen into usable energy (ATP)!" },
      { p: "Plant cells have a stiff outer cell WALL that animal cells lack. Its job is to…", a: "give the plant structure and support", w: ["make food", "store memories", "move the cell around"], h: "Why can a tree stand tall?", e: "Cell walls are like tiny bricks — they let plants stand upright!" },
      { p: "Chloroplasts make plant cells green and let them…", a: "turn sunlight into food (photosynthesis)", w: ["breathe underwater", "glow at night", "move quickly"], h: "Sun-powered kitchens!", e: "Chloroplasts capture sunlight to build sugar. Solar-powered life!" },
      { p: "A group of similar cells working together forms a…", a: "tissue", w: ["a whole organ", "an atom", "a molecule"], h: "Cells → ? → organs → body.", e: "Cells → tissues → organs → organ systems → organism. Levels of life!" },
      { p: "Why must most cells stay microscopically small?", a: "materials can move in and out fast enough only across short distances", w: ["big cells are illegal", "they run out of names", "gravity crushes them"], h: "Surface area vs volume!", e: "Tiny size keeps the inside close to the surface for fast supply runs!" }
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
      { p: 'A bike left in the rain grows orange rust. That\'s…', a: 'a chemical change (iron + oxygen made a new substance)', w: ['a physical change', 'paint fading', 'the bike sweating'], h: 'Rust is NEW stuff that wasn\'t there.', e: 'Iron + oxygen + water → iron oxide. Chemistry in your driveway!' },
      { p: "In H2O, the small number 2 means there are two atoms of…", a: "hydrogen", w: ["oxygen", "water", "helium"], h: "H is hydrogen, O is oxygen.", e: "Two hydrogen + one oxygen = one water molecule!" },
      { p: "The smallest unit of an element that still has its properties is a(n)…", a: "atom", w: ["molecule", "cell", "grain of sand"], h: "You cannot chop it smaller and keep the element.", e: "Atoms are the building blocks of every element!" },
      { p: "When you mix baking soda and vinegar and it fizzes, the bubbles are a new gas. This is a…", a: "chemical reaction", w: ["physical change", "melting", "freezing"], h: "New substance = new chemistry.", e: "Fizzing means carbon dioxide gas was created — a chemical change!" },
      { p: "On the periodic table, elements in the same COLUMN tend to…", a: "behave in similar ways", w: ["have the same color", "weigh exactly the same", "be liquids"], h: "Columns = families.", e: "Grouped elements share chemical personalities — like family traits!" },
      { p: "An acid like lemon juice tastes sour; a base like soap feels slippery. Scientists measure this with the…", a: "pH scale", w: ["temperature scale", "Richter scale", "speedometer"], h: "0 is very acidic, 14 very basic.", e: "pH 7 is neutral (water); lower = acid, higher = base!" },
      { p: "In any chemical reaction, the total mass of the stuff…", a: "stays the same (matter is conserved)", w: ["disappears", "doubles", "turns to energy and vanishes"], h: "Atoms are only rearranged.", e: "Conservation of mass: atoms rearrange, none are lost!" }
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
      { p: 'Hurricanes get their enormous power from…', a: 'warm ocean water', w: ['cold mountain air', 'the moon', 'city lights'], h: 'They form over tropical seas.', e: 'Warm water evaporates and feeds the storm engine! 🌀' },
      { p: "Earth's outer shell is cracked into giant moving pieces called…", a: "tectonic plates", w: ["ocean layers", "magnetic strips", "time zones"], h: "They slowly slide around.", e: "Plate movement builds mountains and triggers earthquakes!" },
      { p: "The rock cycle can turn a squished layer of mud, over ages, into…", a: "sedimentary rock", w: ["a diamond instantly", "lava", "a fossil fuel overnight"], h: "Layers press into stone.", e: "Pressure + time turns sediment into rock — sometimes with fossils inside!" },
      { p: "Most earthquakes happen when tectonic plates…", a: "suddenly slip past each other", w: ["get too hot", "are hit by lightning", "freeze solid"], h: "Stuck… then SNAP.", e: "Stress builds along faults until the plates lurch — that's the shaking!" },
      { p: "The water cycle step where water vapor turns back into liquid clouds is…", a: "condensation", w: ["evaporation", "precipitation", "erosion"], h: "Cooling vapor forms droplets.", e: "Warm vapor rises, cools, and condenses into clouds!" },
      { p: "Which layer of Earth is a hot, mostly solid layer that slowly flows beneath the crust?", a: "the mantle", w: ["the inner core", "the atmosphere", "the ocean floor"], h: "It's between crust and core.", e: "The mantle's slow churning drives the plates above it!" },
      { p: "Fossil fuels like coal and oil formed from…", a: "ancient living things buried for millions of years", w: ["melted rocks", "frozen seawater", "volcano smoke"], h: "Old life, deep time, high pressure.", e: "Buried prehistoric life became the energy we burn today!" }
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
      { p: 'Doubling your bike speed roughly ___ your kinetic energy.', a: 'quadruples it (energy grows with speed²)', w: ['doubles it', 'halves it', 'doesn\'t change it'], h: 'KE = ½mv² — the v is SQUARED.', e: '2× speed = 4× energy. That\'s why speeding is so dangerous!' },
      { p: "Newton's First Law says an object at rest stays at rest unless…", a: "a force acts on it", w: ["it gets bored", "time passes", "it wants to move"], h: "Things resist changing motion.", e: "Inertia! No push or pull = no change in motion." },
      { p: "Energy is never created or destroyed, only…", a: "transformed from one form to another", w: ["used up forever", "made from nothing", "frozen"], h: "Conservation of energy.", e: "Chemical → kinetic → heat… energy just changes costume!" },
      { p: "A roller coaster car has the MOST potential energy at the…", a: "top of the highest hill", w: ["bottom of the dip", "middle of a loop", "end of the ride"], h: "High up = stored energy.", e: "At the top, height stores energy that becomes speed on the way down!" },
      { p: "Sound needs a medium to travel through, which is why space is…", a: "silent", w: ["extra loud", "full of echoes", "warm"], h: "No air, no sound waves.", e: "Sound can't travel through a vacuum — space is totally silent!" },
      { p: "A lever, like a seesaw, is a simple machine that lets you…", a: "move a heavy load with less force", w: ["create energy", "erase friction", "stop gravity"], h: "Trade distance for force.", e: "Levers multiply your force — that's how one kid lifts another on a seesaw!" },
      { p: "Light travels FASTER than sound. That's why in a storm you…", a: "see lightning before you hear thunder", w: ["hear thunder first", "feel it before both", "smell it first"], h: "Light wins the race to your senses.", e: "Count the seconds between flash and boom to gauge the storm's distance!" }
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
      { p: 'Antibiotics kill bacteria but NOT…', a: 'viruses — which is why they can\'t cure a cold', w: ['germs of any kind', 'infections', 'anything'], h: 'Colds and flu are viral.', e: 'Wrong tool for viruses — that\'s what vaccines and antivirals are for!' },
      { p: "A gene is a segment of DNA that carries instructions to build a…", a: "protein", w: ["a whole new person instantly", "a mineral", "an atom"], h: "DNA → RNA → protein.", e: "Genes are recipes; proteins are what the recipes build!" },
      { p: "Offspring get one set of chromosomes from each parent, which is why they…", a: "share traits with both", w: ["are identical to one parent", "have no traits", "choose their own DNA"], h: "Half from mom, half from dad.", e: "Mixing two sets creates unique combinations — that's you!" },
      { p: "Natural selection means the individuals that survive and reproduce are those…", a: "best suited to their environment", w: ["the largest always", "the youngest", "chosen at random forever"], h: "Survival of the fittest FIT.", e: "Helpful traits get passed on more often — evolution in action!" },
      { p: "A dominant allele will show up in an organism even if…", a: "only one copy is present", w: ["it is never present", "both copies are recessive", "the organism is asleep"], h: "One copy is enough.", e: "Dominant traits mask recessive ones when paired — Mendel's peas showed this!" },
      { p: "Cellular respiration in your cells uses glucose and oxygen to release…", a: "energy (ATP)", w: ["sunlight", "carbon only", "DNA"], h: "It's the reverse of photosynthesis.", e: "Your cells 'burn' sugar with oxygen to power everything you do!" },
      { p: "Two species that both benefit from living together show a relationship called…", a: "mutualism", w: ["predation", "competition", "parasitism"], h: "Both win.", e: "Like bees and flowers — each helps the other survive!" }
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
      { p: 'Diamond and pencil graphite are both made of pure…', a: 'carbon', w: ['diamond dust', 'silver', 'quartz'], h: 'Same atoms, different arrangement!', e: 'Structure changes everything: same carbon, $1 pencil vs $10,000 gem!' },
      { p: "In an atom, the tiny negatively charged particles orbiting the nucleus are…", a: "electrons", w: ["protons", "neutrons", "photons"], h: "Negative and light.", e: "Electrons zip around the nucleus and drive chemical bonding!" },
      { p: "When atoms SHARE electrons to bond, they form a…", a: "covalent bond", w: ["ionic bond", "magnetic bond", "nuclear bond"], h: "Sharing, not stealing.", e: "Covalent = shared electrons, like in water and CO2!" },
      { p: "A catalyst speeds up a chemical reaction while itself being…", a: "unchanged at the end", w: ["destroyed", "turned to gold", "frozen"], h: "It helps but survives.", e: "Catalysts lower the energy needed to react — enzymes in your body do this!" },
      { p: "Balancing a chemical equation ensures the same number of each atom appears on…", a: "both sides of the arrow", w: ["the left side only", "neither side", "the top only"], h: "Conservation of mass again.", e: "Atoms aren't lost in reactions, so both sides must match!" },
      { p: "The Periodic Table's rows are called periods; as you go across a period, the number of protons…", a: "increases by one each element", w: ["stays the same", "decreases", "doubles"], h: "Atomic number climbs.", e: "Each step right adds one proton — that's the atomic number order!" },
      { p: "An ion forms when an atom…", a: "gains or loses electrons and becomes charged", w: ["splits in half", "gains a neutron", "heats up"], h: "Charge comes from electron count.", e: "Lose electrons → positive; gain electrons → negative. That's an ion!" }
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
      { p: 'Power is measured in watts. One watt equals one…', a: 'joule per second', w: ['volt per meter', 'newton', 'amp'], h: 'Energy per time.', e: 'Watts measure how FAST energy is used or delivered.' },
      { p: "A moving charge creates a magnetic field. This link between electricity and magnetism is called…", a: "electromagnetism", w: ["gravity", "friction", "radioactivity"], h: "Two forces, one phenomenon.", e: "Electromagnetism runs motors, generators, and every electronic device!" },
      { p: "Momentum equals mass times…", a: "velocity", w: ["acceleration", "temperature", "time"], h: "p = mv.", e: "A heavy truck at low speed can have as much momentum as a fast car!" },
      { p: "According to Newton's Third Law, for every action there is an equal and opposite…", a: "reaction", w: ["explosion", "delay", "friction"], h: "Push the wall, it pushes back.", e: "A rocket pushes gas down; the gas pushes the rocket up!" },
      { p: "A wave's frequency is the number of waves passing a point per…", a: "second", w: ["meter", "kilogram", "degree"], h: "Measured in hertz (Hz).", e: "Higher frequency = higher pitch (sound) or bluer light!" },
      { p: "When light passes from air into water and bends, this bending is called…", a: "refraction", w: ["reflection", "diffraction", "absorption"], h: "Bending at the boundary.", e: "Refraction is why a straw looks broken in a glass of water!" },
      { p: "Work in physics is done only when a force…", a: "moves an object some distance", w: ["is merely applied", "makes you tired", "is very large"], h: "No motion, no work.", e: "Holding a heavy box still is exhausting but does ZERO physics work!" }
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
      { p: 'mRNA vaccines work by…', a: 'giving cells instructions to build a harmless piece of the germ for immune practice', w: ['injecting the live disease', 'replacing your DNA', 'killing all viruses instantly'], h: 'It\'s a recipe, not the germ.', e: 'Cells read the mRNA recipe, build the practice target, immunity trains on it! 💉' },
      { p: "CRISPR is a breakthrough tool that lets scientists…", a: "edit specific sequences of DNA", w: ["create energy from nothing", "travel through time", "cure boredom"], h: "Molecular scissors.", e: "CRISPR can snip and rewrite genes — a revolution in biology and medicine!" },
      { p: "The second law of thermodynamics says that in any closed system, disorder (entropy) tends to…", a: "increase over time", w: ["decrease", "stay perfectly constant", "disappear"], h: "Things trend toward messiness.", e: "Entropy's rise is why heat flows hot→cold and why perpetual motion is impossible!" },
      { p: "Einstein's E=mc² reveals that mass can be converted into…", a: "enormous amounts of energy", w: ["more mass only", "cold", "gravity"], h: "c² is a huge number.", e: "A tiny bit of mass yields vast energy — the principle behind stars and nuclear power!" },
      { p: "A quantum property where a particle can exist in multiple states at once is called…", a: "superposition", w: ["gravity", "inertia", "refraction"], h: "Not one OR the other — both, until measured.", e: "Superposition is the strange heart of quantum computing!" },
      { p: "The observation that distant galaxies are moving away from us supports the theory of…", a: "an expanding universe (Big Bang)", w: ["a shrinking universe", "a static universe", "a flat Earth"], h: "Redshift is the clue.", e: "Galaxies racing apart means the universe is expanding from a hot, dense start!" },
      { p: "A vaccine creates immunity by…", a: "training the immune system to recognize a threat safely", w: ["injecting the full disease to fight", "replacing white blood cells", "sterilizing the blood"], h: "Practice without the real danger.", e: "Vaccines are a rehearsal — the immune system learns the enemy before a real attack!" }
    ])
  }
];

module.exports = { subject: 'science', label: 'Science', emoji: '🔬', color: '#0984E3', skills };

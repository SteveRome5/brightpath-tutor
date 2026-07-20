// BrightPath Spanish — beginner-friendly progression through conversational fluency
// Spanish levels map loosely to grades but follow a "years of study" ladder,
// so a beginner of any age starts at the first unlocked skills.
const { pick, rint, textChoices, q } = require('./helpers');

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
  // ---------- LEVEL 0 (absolute beginner) ----------
  {
    id: 'sp.0.greetings', name: '¡Hola! Greetings', grade: 0,
    gen: fromBank([
      { p: 'You walk into class in Mexico City. How do you say "Hello"? 👋', a: '¡Hola!', w: ['¡Adiós!', 'Gracias', 'Sí'], h: 'It starts with a silent H.', e: '¡Hola! = Hello! The H is silent: "OH-lah".', v: 'How do you say hello in Spanish?' },
      { p: 'Your friend gives you a churro. 🥨 How do you say "Thank you"?', a: 'Gracias', w: ['Hola', 'Por favor', 'Buenos días'], h: 'GRAH-see-ahs.', e: 'Gracias = thank you. ¡De nada! = you\'re welcome!' },
      { p: 'It\'s morning! ☀️ How do you greet someone?', a: 'Buenos días', w: ['Buenas noches', 'Adiós', 'Hasta luego'], h: 'Días = days/daytime.', e: 'Buenos días = good morning!' },
      { p: 'Leaving a party, you wave and say…', a: '¡Adiós!', w: ['¡Hola!', 'Gracias', 'Me llamo'], h: 'It means goodbye.', e: '¡Adiós! = goodbye! You can also say "hasta luego" (see you later).' },
      { p: 'How do you ask someone\'s name? "¿Cómo te ___?"', a: 'llamas', w: ['gracias', 'días', 'agua'], h: '"Me llamo Margaux" = my name is Margaux.', e: '¿Cómo te llamas? = What\'s your name?' },
      { p: '"Por favor" means…', a: 'please', w: ['thank you', 'goodbye', 'good night'], h: 'Use it when asking for something nicely.', e: 'Por favor = please. Magic words work in every language! ✨' },
      { p: 'Before bed, your abuela says "Buenas noches", which means…', a: 'good night', w: ['good morning', 'see you later', 'happy birthday'], h: 'Noches = nights. 🌙', e: 'Buenas noches = good night!' },
      { p: '"¿Cómo estás?" asks…', a: 'How are you?', w: ['What is your name?', 'Where do you live?', 'How old are you?'], h: 'A friendly check-in!', e: '¿Cómo estás? = How are you? Answer: ¡Bien!' },
      { p: '"Sí" means yes. What means NO?', a: 'no (same word!)', w: ['nada', 'nunca', 'salud'], h: 'Easiest word ever.', e: 'No = no in both languages. Sí = yes!' },
      { p: 'You bump into someone by accident. You say…', a: 'perdón (sorry/excuse me)', w: ['gracias', 'hola', 'adiós'], h: 'It sounds like "pardon"!', e: 'Perdón = sorry! Cognates to the rescue.' },
      { p: '"Hasta luego" means…', a: 'see you later', w: ['good morning', 'thank you', 'right now'], h: 'Said when leaving!', e: 'Hasta luego = until later! 👋' },
      { p: 'How do you say "good afternoon" in Spanish?', a: 'buenas tardes', w: ['buenos días', 'buenas noches', 'hasta luego'], h: 'Tardes = afternoon.', e: '"Buenas tardes" — used after midday!' },
      { p: 'Someone says "¿Cómo estás?" They are asking…', a: 'how are you?', w: ['what is your name?', 'how old are you?', 'where are you?'], h: 'Estás = you are.', e: '"¿Cómo estás?" = How are you?' },
      { p: 'The polite reply to "gracias" is…', a: 'de nada', w: ['por favor', 'adiós', 'hola'], h: 'It means "you\'re welcome."', e: '"De nada" = it\'s nothing / you\'re welcome!' },
      { p: '"Me llamo Margaux" means…', a: 'my name is Margaux', w: ['I am ten', 'I like Margaux', 'goodbye Margaux'], h: 'Llamo = I call (myself).', e: '"Me llamo…" is how you say your name!' },
      { p: '"Buenas noches" is used when…', a: 'it is nighttime', w: ['it is morning', 'you are hungry', 'you are leaving forever'], h: 'Noches = nights.', e: '"Buenas noches" = good night / good evening!' },
      { p: 'To ask someone\'s name politely you say…', a: '¿Cómo te llamas?', w: ['¿Cuántos años?', '¿Dónde vives?', '¿Qué hora es?'], h: 'Llamas = you call yourself.', e: '"¿Cómo te llamas?" = What\'s your name?' },
      { p: '"Por favor" is a polite phrase meaning…', a: 'please', w: ['thank you', 'goodbye', 'sorry'], h: 'Say it when you ask for something.', e: '"Por favor" = please! Always polite. 🙏' },
      { p: '"Gracias" means…', a: 'thank you', w: ['hello', 'please', 'no'], h: 'Say it when someone helps you.', e: '"Gracias" = thank you!' },
      { p: 'If a friend says "Adiós," they are saying…', a: 'goodbye', w: ['good morning', 'I am hungry', 'let\'s play'], h: 'It is said when leaving.', e: '"Adiós" = goodbye! 👋' },
      { p: '"Sí" means yes. What means NO in Spanish?', a: 'no', w: ['sí', 'hola', 'gato'], h: 'It is almost the same as English!', e: '"No" = no — easy one!' }
    ])
  },
  {
    id: 'sp.0.numbers', name: 'Números 1-10', grade: 0,
    gen() {
      const nums = [['uno', 1], ['dos', 2], ['tres', 3], ['cuatro', 4], ['cinco', 5], ['seis', 6], ['siete', 7], ['ocho', 8], ['nueve', 9], ['diez', 10]];
      const [word, n] = pick(nums);
      const ask = Math.random() > 0.5;
      if (ask) {
        return q({
          prompt: `At the market you hear "${word}". 🛒 What number is that?`,
          choices: textChoices(String(n), nums.map(x => String(x[1]))),
          answer: n,
          hint: `Count on your fingers: uno, dos, tres…`,
          explain: `${word} = ${n}.`,
          voice: `What number is ${word}?`
        });
      }
      return q({
        prompt: `You want ${n} taco${n > 1 ? 's' : ''} 🌮. What's ${n} in Spanish?`,
        choices: textChoices(word, nums.map(x => x[0])),
        answer: word,
        hint: 'Count up from uno...',
        explain: `${n} = ${word}. ¡Perfecto!`
      });
    }
  },
  {
    id: 'sp.0.colors', name: 'Colores', grade: 0,
    gen: fromBank([
      { p: 'A stop sign is "rojo". Rojo means…', a: 'red', w: ['blue', 'green', 'yellow'], h: 'Stop signs everywhere are this color.', e: 'Rojo = red.' },
      { p: 'The sky on a sunny day is "azul". Azul means…', a: 'blue', w: ['gray', 'red', 'purple'], h: 'Look up on a clear day!', e: 'Azul = blue.' },
      { p: 'Grass and limes are "verde". Verde means…', a: 'green', w: ['orange', 'pink', 'brown'], h: 'Think of a lime.', e: 'Verde = green. 🍏' },
      { p: 'The sun and bananas are "amarillo". Amarillo means…', a: 'yellow', w: ['white', 'gold only', 'orange'], h: 'Banana color!', e: 'Amarillo = yellow. 🍌' },
      { p: 'How do you say "black" (like a night sky)?', a: 'negro', w: ['blanco', 'rosado', 'gris'], h: 'Blanco is its opposite.', e: 'Negro = black; blanco = white.' },
      { p: 'A flamingo is "rosado". Rosado means…', a: 'pink', w: ['red', 'purple', 'tan'], h: 'Flamingo-colored!', e: 'Rosado (or rosa) = pink.' },
      { p: 'Chocolate and tree trunks are "café" or "marrón", meaning…', a: 'brown', w: ['black', 'green', 'red'], h: 'Coffee-colored!', e: 'Café = brown (also means coffee!). ☕' },
      { p: 'Snow and clouds are "blanco". Blanco means…', a: 'white', w: ['blue', 'black', 'silver'], h: 'Snowman color! ⛄', e: 'Blanco = white. Negro is its opposite!' },
      { p: 'A pumpkin is "anaranjado" (or naranja), meaning…', a: 'orange', w: ['yellow', 'purple', 'pink'], h: 'Same word as the fruit!', e: 'Naranja = orange — the color AND the fruit!' },
      { p: 'Grapes and eggplants are "morado". Morado means…', a: 'purple', w: ['green', 'blue', 'gray'], h: '🍇 color!', e: 'Morado = purple.' },
      { p: '"¿De qué color es el cielo?" asks about the color of the…', a: 'sky', w: ['sea', 'grass', 'sun'], h: 'Cielo — look up!', e: 'El cielo = the sky. ¡Es azul!' },
      { p: '"Rojo" is the color of a fire truck. It means…', a: 'red', w: ['blue', 'green', 'yellow'], h: 'Think of a rose: rojo.', e: 'Rojo = red! 🔴' },
      { p: 'The sun is often drawn "amarillo". That means…', a: 'yellow', w: ['purple', 'black', 'white'], h: '☀️', e: 'Amarillo = yellow!' },
      { p: 'Grass and leaves are "verde", which is…', a: 'green', w: ['orange', 'pink', 'brown'], h: '🌿', e: 'Verde = green!' },
      { p: '"Negro" is the color of night. It means…', a: 'black', w: ['white', 'gray', 'gold'], h: '🌑', e: 'Negro = black!' },
      { p: '"Blanco" is the color of snow and milk. It means…', a: 'white', w: ['blue', 'red', 'brown'], h: '❄️🥛', e: 'Blanco = white!' },
      { p: 'Mixing red and blue makes "morado", which is…', a: 'purple', w: ['green', 'orange', 'pink'], h: '🍇', e: 'Morado = purple!' },
      { p: 'Count in Spanish: uno, dos, ___?', a: 'tres', w: ['cuatro', 'cinco', 'diez'], h: 'One, two, ___', e: 'uno(1), dos(2), tres(3)!' },
      { p: 'How do you say the number 5 in Spanish?', a: 'cinco', w: ['tres', 'siete', 'diez'], h: 'Think of a "sink".', e: 'cinco = 5! ✋' },
      { p: '"Diez" is which number?', a: '10', w: ['2', '5', '8'], h: 'It is the biggest one in 1-10.', e: 'diez = 10! 🔟' },
      { p: 'You have "dos" cookies 🍪🍪. How many is that?', a: '2', w: ['1', '3', '4'], h: 'dos sounds like "dose".', e: 'dos = 2!' }
    ])
  },

  // ---------- LEVEL 1 ----------
  {
    id: 'sp.1.family', name: 'La Familia', grade: 1,
    gen: fromBank([
      { p: 'Your mom is your…', a: 'madre (mamá)', w: ['padre', 'hermana', 'abuela'], h: 'Mamá sounds like…', e: 'Madre = mother. Mamá = mom!' },
      { p: '"Mi hermano" means…', a: 'my brother', w: ['my sister', 'my dog', 'my uncle'], h: 'Hermana (with an a) = sister.', e: 'Hermano = brother; hermana = sister.' },
      { p: 'Your grandma is your…', a: 'abuela', w: ['tía', 'prima', 'madre'], h: 'Abuelo is grandpa.', e: 'Abuela = grandmother. ¡Hola, abuela! 👵' },
      { p: '"Mi padre es alto" means…', a: 'My father is tall', w: ['My father is short', 'My mother is tall', 'My father is old'], h: 'Padre = father; alto = tall.', e: 'Mi padre es alto = my dad is tall!' },
      { p: 'Your aunt is your…', a: 'tía', w: ['tío', 'abuela', 'hermana'], h: 'Tío is uncle — just change the ending!', e: 'Tía = aunt; tío = uncle. The a/o endings matter!' },
      { p: 'Your grandpa is your…', a: 'abuelo', w: ['abuela', 'tío', 'primo'], h: 'The -o ending is for grandpa!', e: 'Abuelo = grandfather; abuela = grandmother. 👴' },
      { p: '"Mi prima" is…', a: 'my cousin (a girl)', w: ['my cousin (a boy)', 'my mom', 'my teacher'], h: 'The -a ending tells you!', e: 'Prima = girl cousin; primo = boy cousin.' },
      { p: '"El bebé" of the family is…', a: 'the baby', w: ['the dad', 'the dog', 'the oldest kid'], h: 'Sounds just like English!', e: 'El bebé = the baby. 👶' },
      { p: '"Mi hermana es pequeña" means my sister is…', a: 'small/little', w: ['tall', 'loud', 'fast'], h: 'Pequeño = tiny.', e: 'Pequeña = small. Grande = big!' },
      { p: '"Los padres" means…', a: 'the parents', w: ['the fathers only', 'the priests', 'the cousins'], h: 'Mamá + papá together.', e: 'Los padres = parents (mom AND dad).' },
      { p: '"La familia" means…', a: 'the family', w: ['the house', 'the party', 'the food'], h: 'It sounds a lot like the English word!', e: 'Familia = family. Cognates make Spanish friendly!' },
      { p: '"La hermana" is a girl with the same parents as you. It means…', a: 'sister', w: ['brother', 'cousin', 'aunt'], h: 'Herman-A = the girl one.', e: 'La hermana = sister! (El hermano = brother)' },
      { p: '"El abuelo" is your dad\'s dad. It means…', a: 'grandfather', w: ['uncle', 'baby', 'friend'], h: 'Abuel-O = the man.', e: 'El abuelo = grandfather! (La abuela = grandmother)' },
      { p: '"Mi mamá y mi papá" are my…', a: 'mom and dad', w: ['aunt and uncle', 'sisters', 'grandparents'], h: 'Easy cognates!', e: 'Mamá = mom, papá = dad!' },
      { p: '"El bebé" cries and drinks milk. It means…', a: 'the baby', w: ['the dog', 'the grandpa', 'the teacher'], h: 'Sounds like "baby"!', e: 'El bebé = the baby! 👶' },
      { p: '"Tengo dos hermanos" means I have two…', a: 'brothers/siblings', w: ['dogs', 'houses', 'friends'], h: 'Tengo = I have.', e: '"Tengo dos hermanos" = I have two brothers/siblings!' },
      { p: '"La tía" is your mom\'s sister. It means…', a: 'aunt', w: ['uncle', 'niece', 'cousin'], h: 'Tí-A = the woman.', e: 'La tía = aunt! (El tío = uncle)' }
    ])
  },
  {
    id: 'sp.1.animals', name: 'Los Animales', grade: 1,
    gen: fromBank([
      { p: '"El perro" wags its tail and fetches. 🐕 Perro means…', a: 'dog', w: ['cat', 'bird', 'horse'], h: 'Man\'s best friend!', e: 'El perro = the dog. ¡Guau guau! (that\'s woof woof!)' },
      { p: '"El gato" purrs and chases mice. 🐈 Gato means…', a: 'cat', w: ['goat', 'duck', 'rabbit'], h: 'It says "miau"!', e: 'El gato = the cat.' },
      { p: 'At the farm you see "un caballo" galloping. 🐎 Caballo means…', a: 'horse', w: ['cow', 'pig', 'chicken'], h: 'You can ride it!', e: 'El caballo = the horse.' },
      { p: '"El pájaro" sings in the tree. 🐦 Pájaro means…', a: 'bird', w: ['fish', 'frog', 'squirrel'], h: 'It has wings and sings.', e: 'El pájaro = the bird.' },
      { p: '"El pez" swims in the tank. 🐠 Pez means…', a: 'fish', w: ['turtle', 'shark only', 'whale'], h: 'It lives in water and has fins.', e: 'El pez = the fish.' },
      { p: 'Which animal is "la vaca"? 🥛', a: 'the cow', w: ['the sheep', 'the goat', 'the hen'], h: 'It gives milk and says "muu".', e: 'La vaca = the cow!' },
      { p: '"El conejo" hops and loves carrots. 🐰 Conejo means…', a: 'rabbit', w: ['mouse', 'turtle', 'fox'], h: 'Hop hop!', e: 'El conejo = the rabbit.' },
      { p: '"La tortuga" carries its house on its back. 🐢 Tortuga means…', a: 'turtle', w: ['snail', 'crab', 'frog'], h: 'Slow and steady!', e: 'La tortuga = the turtle.' },
      { p: 'Which animal is "el cerdo"? 🐷', a: 'the pig', w: ['the sheep', 'the duck', 'the goat'], h: 'It says oink (¡oinc!).', e: 'El cerdo = the pig.' },
      { p: '"El león" is the king of the jungle. León means…', a: 'lion', w: ['tiger', 'bear', 'wolf'], h: 'ROAR! 🦁', e: 'El león = the lion.' },
      { p: '"La mariposa" has beautiful wings and visits flowers. Mariposa means…', a: 'butterfly', w: ['bee', 'bird', 'ladybug'], h: '🦋 It was a caterpillar once!', e: 'La mariposa = the butterfly — one of the prettiest Spanish words!' },
      { p: '"El gato" says meow. It means…', a: 'the cat', w: ['the dog', 'the bird', 'the fish'], h: '🐱', e: 'El gato = the cat!' },
      { p: '"El perro" is a loyal pet that barks. It means…', a: 'the dog', w: ['the cat', 'the horse', 'the pig'], h: '🐶 Guau guau!', e: 'El perro = the dog!' },
      { p: '"El caballo" is big and you can ride it. It means…', a: 'the horse', w: ['the cow', 'the sheep', 'the goat'], h: '🐴 Margaux loves these!', e: 'El caballo = the horse!' },
      { p: '"El pájaro" flies and sings in trees. It means…', a: 'the bird', w: ['the fish', 'the cat', 'the frog'], h: '🐦', e: 'El pájaro = the bird!' },
      { p: '"El pez" swims in water. It means…', a: 'the fish', w: ['the duck', 'the snake', 'the bee'], h: '🐟', e: 'El pez = the fish!' },
      { p: '"La vaca" says "muu" and gives milk. It means…', a: 'the cow', w: ['the pig', 'the hen', 'the horse'], h: '🐄', e: 'La vaca = the cow!' },
      { p: '"El elefante" is huge and gray with a long trunk. It means…', a: 'the elephant 🐘', w: ['the mouse', 'the cat', 'the fish'], h: 'It is a big cognate!', e: 'El elefante = the elephant!' },
      { p: '"La tortuga" moves very slowly and has a shell. It means…', a: 'the turtle 🐢', w: ['the rabbit', 'the bird', 'the snake'], h: 'Slow with a shell.', e: 'La tortuga = the turtle!' },
      { p: '"El león" says ROAR and is king of the jungle. It means…', a: 'the lion 🦁', w: ['the lamb', 'the dog', 'the pig'], h: 'Sounds like "lee-own".', e: '¡El león! The lion roars! 🦁' },
      { p: '"El pato" says "cuac cuac" and swims in ponds. It means…', a: 'the duck 🦆', w: ['the cow', 'the horse', 'the bee'], h: 'Quack quack!', e: 'El pato = the duck!' }
    ])
  },
  {
    id: 'sp.1.food', name: 'La Comida', grade: 1,
    gen: fromBank([
      { p: 'You\'re thirsty after soccer. You ask for "agua". 💧 Agua means…', a: 'water', w: ['juice', 'milk', 'bread'], h: 'It falls as rain!', e: 'El agua = water. ¡Salud!' },
      { p: '"La manzana" keeps the doctor away. Manzana means…', a: 'apple', w: ['orange', 'grape', 'banana'], h: 'An apple a day…', e: 'La manzana = the apple.' },
      { p: 'For breakfast you eat "pan" with butter. 🍞 Pan means…', a: 'bread', w: ['pancake', 'egg', 'cereal'], h: 'A "panadería" is a bakery!', e: 'El pan = bread.' },
      { p: '"La leche" goes great with cookies. 🥛 Leche means…', a: 'milk', w: ['lemonade', 'water', 'tea'], h: 'It comes from la vaca!', e: 'La leche = milk.' },
      { p: '"El queso" is on pizza and quesadillas. 🧀 Queso means…', a: 'cheese', w: ['meat', 'sauce', 'mushroom'], h: 'QUESO-dilla = cheese tortilla!', e: 'El queso = cheese. Now you know why quesadillas are named that!' },
      { p: '"Tengo hambre" means…', a: 'I\'m hungry', w: ['I\'m tired', 'I\'m happy', 'I\'m tall'], h: 'You\'d say it right before lunch!', e: 'Tengo hambre = I\'m hungry. Tengo sed = I\'m thirsty!' },
      { p: '"El huevo" is great scrambled for breakfast. 🍳 Huevo means…', a: 'egg', w: ['ham', 'toast', 'cheese'], h: 'It comes from la gallina (the hen)!', e: 'El huevo = egg.' },
      { p: '"La naranja" is a fruit full of vitamin C. 🍊 Naranja means…', a: 'orange', w: ['lemon', 'apple', 'melon'], h: 'Same as the color!', e: 'La naranja = orange (fruit and color!).' },
      { p: '"El pollo" is in tacos, soup, and nuggets. 🍗 Pollo means…', a: 'chicken', w: ['beef', 'fish', 'pork'], h: 'Double L sounds like Y: "POH-yoh".', e: 'El pollo = chicken.' },
      { p: '"El helado" is the BEST dessert on a hot day. 🍦 Helado means…', a: 'ice cream', w: ['cake', 'candy', 'hot soup'], h: 'Hielo = ice… helado = ?', e: 'El helado = ice cream. ¡Qué rico!' },
      { p: '"Quiero pizza, por favor" means…', a: 'I want pizza, please', w: ['I ate pizza already', 'The pizza is cold', 'Where is the pizza?'], h: 'Quiero = I want.', e: 'Quiero = I want — the most useful restaurant word!' },
      { p: '"El agua" is what you drink when thirsty. It means…', a: 'water', w: ['bread', 'milk', 'juice'], h: '💧', e: 'El agua = water!' },
      { p: '"La manzana" is a crunchy red fruit. It means…', a: 'apple', w: ['banana', 'orange', 'grape'], h: '🍎', e: 'La manzana = apple!' },
      { p: '"El pan" is baked and you make sandwiches with it. It means…', a: 'bread', w: ['cheese', 'rice', 'egg'], h: '🍞', e: 'El pan = bread!' },
      { p: '"La leche" is white and comes from cows. It means…', a: 'milk', w: ['water', 'soup', 'tea'], h: '🥛', e: 'La leche = milk!' },
      { p: '"Tengo hambre" means…', a: 'I am hungry', w: ['I am thirsty', 'I am tired', 'I am happy'], h: 'Hambre = hunger.', e: '"Tengo hambre" = I\'m hungry!' },
      { p: '"Me gusta el helado" means I like…', a: 'ice cream', w: ['vegetables', 'water', 'fish'], h: '🍦', e: '"Me gusta el helado" = I like ice cream!' },
      { p: '"El queso" goes on pizza and tacos. It means…', a: 'cheese 🧀', w: ['bread', 'milk', 'apple'], h: 'Say "KEH-so".', e: 'El queso = cheese!' },
      { p: '"El plátano" is a long yellow fruit monkeys love. It means…', a: 'banana 🍌', w: ['grape', 'orange', 'cherry'], h: 'Peel it!', e: 'El plátano = banana!' },
      { p: '"El huevo" comes from a chicken and you can fry it. It means…', a: 'egg 🥚', w: ['ham', 'rice', 'soup'], h: 'Say "WEH-vo".', e: 'El huevo = egg!' },
      { p: '"Quiero más, por favor" means…', a: 'I want more, please', w: ['I am done, thanks', 'no more food', 'where is lunch'], h: 'Más = more.', e: '"Quiero más, por favor" = I want more, please!' }
    ])
  },

  // ---------- LEVEL 2 ----------
  {
    id: 'sp.2.days', name: 'Días y Meses', grade: 2,
    gen: fromBank([
      { p: 'School starts on "lunes". Lunes is…', a: 'Monday', w: ['Sunday', 'Friday', 'Saturday'], h: 'The first school day of the week.', e: 'Lunes = Monday (named after la luna, the moon!).' },
      { p: '"Sábado y domingo" are the best days because they are…', a: 'the weekend', w: ['test days', 'the first school days', 'holidays in June'], h: 'No school! 🎉', e: 'Sábado = Saturday, domingo = Sunday. ¡Fin de semana!' },
      { p: 'Your birthday is in "julio". Julio is…', a: 'July', w: ['June', 'January', 'March'], h: 'Sounds like "Julio" → Ju-LY.', e: 'Julio = July. ¡Feliz cumpleaños! 🎂' },
      { p: '"Hoy es viernes" means…', a: 'Today is Friday', w: ['Today is Tuesday', 'Tomorrow is Friday', 'Yesterday was Friday'], h: 'Hoy = today; viernes = the day before the weekend!', e: 'Hoy es viernes = Today is Friday. ¡Casi fin de semana!' },
      { p: 'Which month starts the year?', a: 'enero', w: ['diciembre', 'agosto', 'abril'], h: 'It\'s cold in New York during this month.', e: 'Enero = January, month #1!' },
      { p: '"Martes" comes right after lunes. Martes is…', a: 'Tuesday', w: ['Thursday', 'March', 'Monday'], h: 'Day #2 of the school week.', e: 'Martes = Tuesday (named after Mars!).' },
      { p: 'Christmas 🎄 is in "diciembre", which is…', a: 'December', w: ['November', 'October', 'July'], h: 'The last month!', e: 'Diciembre = December, month #12.' },
      { p: '"Mañana" can mean tomorrow or…', a: 'morning', w: ['midnight', 'last week', 'never'], h: '"Mañana por la mañana" = tomorrow morning!', e: 'Mañana = tomorrow AND morning — context tells you which!' },
      { p: 'How many days are in "una semana" (a week)?', a: 'siete (7)', w: ['cinco (5)', 'diez (10)', 'doce (12)'], h: 'Lunes through domingo.', e: 'Una semana = 7 días!' },
      { p: 'Summer vacation usually starts in "junio", which is…', a: 'June', w: ['January', 'July', 'April'], h: 'Right before julio.', e: 'Junio = June — summer kickoff! ☀️' },
      { p: '"Lunes" is the first school day of the week. It means…', a: 'Monday', w: ['Friday', 'Sunday', 'Wednesday'], h: 'Start of the week.', e: 'Lunes = Monday!' },
      { p: '"Sábado" and "domingo" make up the…', a: 'weekend', w: ['school days', 'months', 'holidays'], h: 'No school!', e: 'Sábado (Sat) + domingo (Sun) = weekend!' },
      { p: '"Hoy es viernes" means today is…', a: 'Friday', w: ['Tuesday', 'Monday', 'Thursday'], h: 'Hoy = today.', e: '"Hoy es viernes" = Today is Friday! 🎉' },
      { p: '"Diciembre" is the month with winter holidays. It means…', a: 'December', w: ['October', 'March', 'August'], h: 'Sounds like December!', e: 'Diciembre = December! ❄️' },
      { p: '"Mañana" can mean "morning" OR…', a: 'tomorrow', w: ['yesterday', 'night', 'week'], h: 'Two meanings!', e: '"Mañana" = morning or tomorrow, from context!' },
      { p: 'How many days are in "una semana"?', a: 'seven', w: ['five', 'ten', 'twelve'], h: 'Semana = week.', e: 'Una semana = one week = 7 days!' }
    ])
  },
  {
    id: 'sp.2.body', name: 'El Cuerpo', grade: 2,
    gen: fromBank([
      { p: 'In "Cabeza, hombros, rodillas y pies" (the song!), "cabeza" is your…', a: 'head', w: ['shoulders', 'knees', 'toes'], h: 'It\'s the song "Head, Shoulders, Knees and Toes"!', e: 'Cabeza = head. Now sing it in Spanish! 🎵' },
      { p: 'You kick a fútbol with your "pie". Pie means…', a: 'foot', w: ['hand', 'leg', 'a dessert'], h: 'Not the dessert! ⚽', e: 'El pie = foot (pronounced "pee-EH", not like apple pie!).' },
      { p: 'You wave hello with your "mano". Mano means…', a: 'hand', w: ['arm', 'finger', 'elbow'], h: 'High five = choca esos cinco!', e: 'La mano = hand. 👋' },
      { p: '"Los ojos" let you see the world. Ojos means…', a: 'eyes', w: ['ears', 'nose', 'mouth'], h: 'They can be azules, verdes, or cafés.', e: 'Los ojos = eyes. 👀' },
      { p: 'You hear música with your "orejas". Orejas means…', a: 'ears', w: ['eyes', 'hands', 'hair'], h: 'Headphones go on them. 🎧', e: 'Las orejas = ears.' },
      { p: 'You smell flowers with your "nariz". Nariz means…', a: 'nose', w: ['neck', 'mouth', 'chin'], h: 'Sniff! 👃', e: 'La nariz = nose.' },
      { p: 'You smile and talk with your "boca". Boca means…', a: 'mouth', w: ['cheek', 'ear', 'forehead'], h: 'Where your teeth live!', e: 'La boca = mouth. 😁' },
      { p: '"El pelo" can be rubio, negro, or café. Pelo means…', a: 'hair', w: ['hat', 'eye', 'skin'], h: 'You brush it every morning.', e: 'El pelo = hair.' },
      { p: 'You bend your "rodillas" to jump. Rodillas means…', a: 'knees', w: ['elbows', 'ankles', 'wrists'], h: 'From the song — knees! 🦵', e: 'Las rodillas = knees.' },
      { p: '"Me duele el estómago" means my ___ hurts.', a: 'stomach', w: ['head', 'foot', 'ear'], h: 'Too much helado!', e: 'El estómago = stomach. Me duele = it hurts me.' },
      { p: '"La cabeza" is on top of your neck and holds your brain. It means…', a: 'head', w: ['hand', 'foot', 'knee'], h: '🧠', e: 'La cabeza = head!' },
      { p: '"La mano" has five fingers. It means…', a: 'hand', w: ['ear', 'nose', 'leg'], h: '✋', e: 'La mano = hand!' },
      { p: '"Los ojos" let you see. They are your…', a: 'eyes', w: ['ears', 'teeth', 'feet'], h: '👀', e: 'Los ojos = eyes!' },
      { p: '"La boca" is what you eat and talk with. It means…', a: 'mouth', w: ['nose', 'eye', 'arm'], h: '👄', e: 'La boca = mouth!' },
      { p: '"El pie" is at the bottom of your leg. It means…', a: 'foot', w: ['hand', 'head', 'back'], h: '🦶', e: 'El pie = foot!' },
      { p: '"Los dientes" are white and you brush them. They are your…', a: 'teeth', w: ['eyes', 'ears', 'toes'], h: '🦷', e: 'Los dientes = teeth!' }
    ])
  },
  {
    id: 'sp.2.phrases', name: 'Frases Útiles', grade: 2,
    gen: fromBank([
      { p: 'Someone asks "¿Cómo estás?" You feel great! You answer…', a: '¡Muy bien, gracias!', w: ['Me llamo Ana.', 'Tengo ocho años.', 'Es lunes.'], h: 'They asked HOW you are.', e: '¿Cómo estás? = How are you? Muy bien = very well!' },
      { p: '"¿Dónde está el baño?" is the world\'s most useful travel question. It means…', a: 'Where is the bathroom?', w: ['Where is the beach?', 'What time is it?', 'How much does it cost?'], h: 'Every traveler needs this one!', e: '¿Dónde está...? = Where is...? ¡Muy útil!' },
      { p: 'Your friend sneezes. 🤧 You say…', a: '¡Salud!', w: ['¡Adiós!', '¡Feliz Navidad!', '¡Buenas noches!'], h: 'Like "bless you" — it literally means "health!"', e: '¡Salud! = health! Said after sneezes and for toasts!' },
      { p: '"No entiendo" is a super-helpful phrase meaning…', a: 'I don\'t understand', w: ['I don\'t want it', 'I\'m not going', 'I\'m not hungry'], h: 'Say it when confused — everyone will help!', e: 'No entiendo = I don\'t understand. ¿Puedes repetir? = can you repeat?' },
      { p: '"Tengo nueve años" means…', a: 'I am nine years old', w: ['I have nine toys', 'It\'s nine o\'clock', 'I want nine tacos'], h: 'In Spanish you HAVE years, not ARE years!', e: 'Tengo... años = I am... years old. (Literally "I have 9 years!")' },
      { p: 'You want your friend to hurry to recess! You shout…', a: '¡Vamos! (Let\'s go!)', w: ['¡Silencio!', 'Lo siento', 'Buenas noches'], h: 'Coaches yell it at games!', e: '¡Vamos! = Let\'s go! You\'ll hear it at every fútbol match.' },
      { p: '"Lo siento" means…', a: 'I\'m sorry', w: ['I\'m sitting', 'I feel great', 'See you soon'], h: 'Said when you feel bad about something.', e: 'Lo siento = I\'m sorry (literally "I feel it").' },
      { p: 'Your friend shows you their new bike. 🚲 You say "¡Qué ___!" (How cool!)', a: 'chévere / genial', w: ['triste', 'aburrido', 'frío'], h: 'It\'s a compliment!', e: '¡Qué chévere! = How cool! Different countries, same excitement.' },
      { p: '"¿Cuánto cuesta?" is the shopping question meaning…', a: 'How much does it cost?', w: ['What time is it?', 'Where is the store?', 'Do you like it?'], h: 'Ask it before you buy!', e: '¿Cuánto cuesta? = How much? Essential market Spanish! 🛒' },
      { p: '"Con permiso" is the polite way to say…', a: 'excuse me (passing through)', w: ['thank you very much', 'good night', 'welcome'], h: 'Squeezing past someone in a crowd.', e: 'Con permiso = excuse me. ¡Muy educado!' },
      { p: '"Lo siento" is what you say when you…', a: 'are sorry', w: ['are happy', 'say hello', 'are hungry'], h: 'An apology.', e: '"Lo siento" = I\'m sorry.' },
      { p: '"¿Puedo ir al baño?" politely asks…', a: 'may I go to the bathroom?', w: ['what time is it?', 'where do you live?', 'how are you?'], h: 'Very useful in class!', e: '"¿Puedo ir al baño?" = May I go to the bathroom?' },
      { p: '"No entiendo" is helpful in class. It means…', a: 'I don\'t understand', w: ['I understand', 'I\'m done', 'I\'m hungry'], h: 'Entiendo = I understand.', e: '"No entiendo" — great to tell a teacher!' },
      { p: '"¿Cómo se dice…?" is used to ask…', a: 'how do you say…?', w: ['what time is it?', 'how much?', 'who are you?'], h: 'For learning new words!', e: '"¿Cómo se dice?" = How do you say…?' },
      { p: '"Más despacio, por favor" asks someone to speak…', a: 'more slowly', w: ['louder', 'in English', 'faster'], h: 'Despacio = slow.', e: '"Más despacio" = slower, please!' },
      { p: '"Buen provecho" is said…', a: 'before eating a meal', w: ['before sleeping', 'when leaving', 'when angry'], h: 'Like "enjoy your meal."', e: '"Buen provecho" = enjoy your meal! 🍽️' }
    ])
  },

  // ---------- LEVEL 3-5 ----------
  {
    id: 'sp.3.ser', name: 'Ser vs. Estar', grade: 3,
    gen: fromBank([
      { p: 'Two verbs mean "to be"! For PERMANENT traits ("She is tall"), use…', a: 'ser', w: ['estar', 'tener', 'ir'], h: 'Ser = what something IS by nature.', e: 'Ser for lasting traits: Ella ES alta.' },
      { p: 'For FEELINGS and locations ("I am tired," "I am at home"), use…', a: 'estar', w: ['ser', 'hablar', 'comer'], h: 'How you feel and where you are — estar.', e: 'Estoy cansado = I am tired (right now).' },
      { p: 'Pick the correct one: "Yo ___ estudiante." (I am a student)', a: 'soy', w: ['estoy', 'eres', 'está'], h: 'Being a student is your identity → ser.', e: 'Yo soy estudiante — identity uses ser!' },
      { p: 'Pick the correct one: "La sopa ___ caliente." (The soup is hot right now)', a: 'está', w: ['es', 'soy', 'eres'], h: 'Temperature right now = a current state.', e: 'La sopa está caliente — current conditions use estar! 🍜' },
      { p: '"¿Dónde estás?" asks…', a: 'Where are you?', w: ['Who are you?', 'How old are you?', 'What do you want?'], h: 'Location → estar.', e: '¿Dónde estás? = Where are you (located)?' },
      { p: 'Pick the correct one: "Mi abuela ___ de México." (My grandma is from Mexico)', a: 'es', w: ['está', 'estoy', 'estás'], h: 'Origin is permanent → ser.', e: 'Where you\'re FROM never changes → ser: es de México.' },
      { p: 'Pick the correct one: "Los niños ___ en el parque." (The kids are at the park)', a: 'están', w: ['son', 'es', 'soy'], h: 'Location right now → estar.', e: 'Location always takes estar: están en el parque. 🌳' },
      { p: '"Estoy feliz" vs "Soy feliz" — what\'s the difference?', a: 'Estoy = happy right now; Soy = a happy person in general', w: ['They mean exactly the same', 'Estoy is past tense', 'Soy is a question'], h: 'Temporary mood vs permanent personality!', e: 'Estar = state today; ser = who you are. Both happy! 😊' },
      { p: 'Pick the correct one: "El café ___ frío." (The coffee has gone cold)', a: 'está', w: ['es', 'eres', 'somos'], h: 'It wasn\'t always cold — current condition!', e: 'A changeable condition → está frío. ☕' },
      { p: '"Mis padres son doctores" uses SER because being a doctor is…', a: 'a profession/identity (lasting)', w: ['a temporary mood', 'a location', 'a question'], h: 'Jobs and identity take ser.', e: 'Professions use ser: son doctores. 🩺' },
      { p: '"Yo ___ cansado hoy." (I am tired today — a temporary feeling):', a: 'estoy', w: ['soy', 'es', 'son'], h: 'Feelings/conditions = ESTAR.', e: 'Estoy — temporary states use estar!' },
      { p: '"Ella ___ alta." (She is tall — a lasting trait):', a: 'es', w: ['está', 'estoy', 'están'], h: 'Traits = SER.', e: 'Es — permanent characteristics use ser!' },
      { p: '"Nosotros ___ en la escuela." (We are at school — location):', a: 'estamos', w: ['somos', 'es', 'son'], h: 'Location = ESTAR.', e: 'Estamos — location always uses estar!' },
      { p: '"¿De dónde ___ tú?" (Where are you from? — origin):', a: 'eres', w: ['estás', 'es', 'somos'], h: 'Origin = SER.', e: 'Eres — where you\'re from uses ser!' },
      { p: '"La sopa ___ caliente." (The soup is hot — a current condition):', a: 'está', w: ['es', 'soy', 'son'], h: 'Condition right now = ESTAR.', e: 'Está — a temporary condition uses estar!' },
      { p: '"Hoy ___ lunes." (Today is Monday — days use…):', a: 'es', w: ['está', 'estoy', 'son'], h: 'Days/dates = SER.', e: 'Es — dates and days use ser!' }
    ])
  },
  {
    id: 'sp.3.ar', name: 'Present Tense: -AR Verbs', grade: 3,
    gen() {
      const verbs = [['hablar', 'to speak'], ['bailar', 'to dance'], ['cantar', 'to sing'], ['nadar', 'to swim'], ['cocinar', 'to cook'], ['dibujar', 'to draw']];
      const [inf, meaning] = pick(verbs);
      const stem = inf.slice(0, -2);
      const forms = [['yo', stem + 'o'], ['tú', stem + 'as'], ['él/ella', stem + 'a'], ['nosotros', stem + 'amos'], ['ellos', stem + 'an']];
      const [pron, correct] = pick(forms);
      const wrongs = forms.map(f => f[1]).filter(f => f !== correct);
      return q({
        prompt: `Conjugate! "${inf}" (${meaning}) with "${pron}": ${pron} ___`,
        choices: textChoices(correct, wrongs),
        answer: correct,
        hint: `Drop -ar, then add the ${pron} ending.`,
        explain: `${pron} ${correct} — drop "-ar", add the right ending. ¡Bien hecho!`
      });
    }
  },
  {
    id: 'sp.4.questions', name: 'Question Words', grade: 4,
    gen: fromBank([
      { p: '"¿Qué?" asks…', a: 'What?', w: ['Who?', 'Where?', 'When?'], h: 'Most common question word of all.', e: '¿Qué? = What? ¿Qué es esto? = What is this?' },
      { p: '"¿Cuándo es la fiesta?" asks ___ the party is.', a: 'when', w: ['where', 'why', 'whose'], h: 'It\'s about time/dates.', e: '¿Cuándo? = When? 🗓️' },
      { p: '"¿Por qué?" asks…', a: 'Why?', w: ['How many?', 'Which?', 'Where?'], h: 'The answer often starts with "porque" (because)!', e: '¿Por qué? = Why? Porque = because. Twins with different jobs!' },
      { p: '"¿Cuánto cuesta?" is essential for shopping. It means…', a: 'How much does it cost?', w: ['Where is the store?', 'What color is it?', 'Can I try it on?'], h: 'You ask it at the register. 💰', e: '¿Cuánto cuesta? = How much? Your travel-shopping superpower!' },
      { p: '"¿Quién es tu maestro favorito?" asks about your favorite…', a: 'teacher (who?)', w: ['food (what?)', 'place (where?)', 'time (when?)'], h: '¿Quién? asks about a person.', e: '¿Quién? = Who? Maestro = teacher!' },
      { p: '"¿Cómo se dice \'library\' en español?" is THE question for learners. It asks…', a: 'How do you say "library" in Spanish?', w: ['Where is the library?', 'Do you like libraries?', 'When does the library open?'], h: '¿Cómo se dice...? = How do you say...?', e: 'Your best learning tool! (Answer: la biblioteca 📚)' },
      { p: '"¿Cuántos años tienes?" asks…', a: 'How old are you?', w: ['How tall are you?', 'How many pets do you have?', 'What year is it?'], h: 'Literally "how many years do you have?"', e: '¿Cuántos años tienes? = How old are you? Tengo diez años!' },
      { p: '"¿Dónde está el aeropuerto?" would you ask when you need…', a: 'directions to the airport', w: ['a plane ticket price', 'the flight time', 'a taxi\'s name'], h: '¿Dónde? = where!', e: '¿Dónde está...? = Where is...? Travel essential! ✈️' },
      { p: 'Which question word asks "WHICH one?"', a: '¿Cuál?', w: ['¿Quién?', '¿Cuándo?', '¿Por qué?'], h: '¿Cuál es tu color favorito?', e: '¿Cuál? = Which? ¿Cuál prefieres? = Which do you prefer?' },
      { p: 'Spanish questions start with an upside-down mark: ¿ — why?', a: 'It signals a question is coming before you read it', w: ['It\'s a typo tradition', 'It marks loud speech', 'It replaces the period'], h: 'Helpful warning at the START!', e: 'Spanish brackets questions ¿like this? — you know the tone from word one!' },
      { p: '"¿Cómo?" asks…', a: 'how?', w: ['what?', 'when?', 'who?'], h: 'Cómo = how.', e: '¿Cómo? = How?' },
      { p: '"¿Cuándo?" asks about…', a: 'when? (time)', w: ['where?', 'why?', 'how many?'], h: 'Cuándo = when.', e: '¿Cuándo? = When?' },
      { p: '"¿Dónde está el baño?" asks…', a: 'where is the bathroom?', w: ['when is lunch?', 'who are you?', 'how much is it?'], h: 'Dónde = where.', e: '¿Dónde? = Where?' },
      { p: '"¿Por qué?" asks…', a: 'why?', w: ['how?', 'who?', 'which?'], h: 'Two words = why.', e: '¿Por qué? = Why? (Porque = because!)' },
      { p: '"¿Cuántos años tienes?" asks…', a: 'how old are you?', w: ['what\'s your name?', 'where do you live?', 'how are you?'], h: 'Años = years.', e: 'Literally "how many years do you have?" = how old are you?' },
      { p: '"¿Quién es ella?" asks…', a: 'who is she?', w: ['what is that?', 'where is she?', 'why her?'], h: 'Quién = who.', e: '¿Quién? = Who?' }
    ])
  },
  {
    id: 'sp.5.eri', name: 'Present Tense: -ER/-IR Verbs', grade: 5,
    gen() {
      const verbs = [['comer', 'to eat', 'er'], ['beber', 'to drink', 'er'], ['leer', 'to read', 'er'], ['vivir', 'to live', 'ir'], ['escribir', 'to write', 'ir'], ['abrir', 'to open', 'ir']];
      const [inf, meaning, type] = pick(verbs);
      const stem = inf.slice(0, -2);
      const endings = type === 'er'
        ? [['yo', 'o'], ['tú', 'es'], ['él/ella', 'e'], ['nosotros', 'emos'], ['ellos', 'en']]
        : [['yo', 'o'], ['tú', 'es'], ['él/ella', 'e'], ['nosotros', 'imos'], ['ellos', 'en']];
      const [pron, end] = pick(endings);
      const correct = stem + end;
      const wrongs = endings.map(e => stem + e[1]).filter(f => f !== correct).concat([stem + 'as']);
      return q({
        prompt: `Conjugate! "${inf}" (${meaning}) with "${pron}": ${pron} ___`,
        choices: textChoices(correct, wrongs),
        answer: correct,
        hint: `Drop -${type}, add the ${pron} ending.`,
        explain: `${pron} ${correct}. -${type.toUpperCase()} verbs have their own endings. ¡Excelente!`
      });
    }
  },

  // ---------- LEVEL 6-8 ----------
  {
    id: 'sp.6.adjectives', name: 'Adjective Agreement', grade: 6,
    gen: fromBank([
      { p: 'Adjectives must MATCH their noun! "La casa ___" (the white house):', a: 'blanca', w: ['blanco', 'blancos', 'blanc'], h: 'Casa is feminine (la), so the adjective ends in…', e: 'La casa blanca — feminine noun, feminine adjective!' },
      { p: '"Los perros ___" (the fast dogs):', a: 'rápidos', w: ['rápido', 'rápidas', 'rápida'], h: 'Los perros = masculine AND plural.', e: 'Masculine plural → -os: los perros rápidos. 🐕💨' },
      { p: '"Las manzanas ___" (the red apples):', a: 'rojas', w: ['rojo', 'rojos', 'roja'], h: 'Las manzanas = feminine plural.', e: 'Feminine plural → -as: las manzanas rojas. 🍎🍎' },
      { p: 'In Spanish, most adjectives go ___ the noun (opposite of English!):', a: 'after', w: ['before', 'nowhere', 'inside'], h: '"El gato negro," not "el negro gato."', e: 'Spanish flips it: noun first, adjective after — el gato negro!' },
      { p: 'Which phrase is correct?', a: 'la música fantástica', w: ['la música fantástico', 'el música fantástica', 'la músicas fantástica'], h: 'Match gender AND number.', e: 'La música (fem. sing.) + fantástica. ¡Perfecto! 🎶' },
      { p: '"Los libros ___" (the red books). Fill in:', a: 'rojos', w: ['roja', 'rojo', 'rojas'], h: 'Masculine plural noun → -os ending.', e: 'Libros is masculine plural → rojos!' },
      { p: '"Una casa ___" (a white house). Fill in:', a: 'blanca', w: ['blanco', 'blancos', 'blancas'], h: 'Feminine singular → -a.', e: 'Casa is feminine singular → blanca!' },
      { p: 'Adjectives in Spanish usually come…', a: 'after the noun', w: ['before the noun', 'only at the end of sentences', 'never near nouns'], h: '"Casa blanca," not "blanca casa."', e: 'Most Spanish adjectives follow the noun they describe!' },
      { p: '"Las niñas ___" (the tall girls). Fill in:', a: 'altas', w: ['alto', 'altos', 'alta'], h: 'Feminine plural → -as.', e: 'Niñas is feminine plural → altas!' },
      { p: '"El coche ___" (the fast car). Fill in:', a: 'rápido', w: ['rápida', 'rápidos', 'rápidas'], h: 'Masculine singular → -o.', e: 'Coche is masculine singular → rápido!' }
    ])
  },
  {
    id: 'sp.7.preterite', name: 'Past Tense (Pretérito)', grade: 7,
    gen: fromBank([
      { p: '"Ayer yo ___ tacos." (Yesterday I ate tacos):', a: 'comí', w: ['como', 'comeré', 'comiendo'], h: 'Ayer = yesterday → past tense.', e: 'Comí = I ate. -ER verbs: yo → -í in the preterite. 🌮' },
      { p: '"Ella ___ a la fiesta el sábado." (She went to the party):', a: 'fue', w: ['va', 'irá', 'yendo'], h: '"Ir" (to go) is wildly irregular in the past.', e: 'Fue = she went. Ir and ser share this form — context tells you which!' },
      { p: '"Nosotros ___ mucho en el concierto." (We danced a lot):', a: 'bailamos', w: ['bailan', 'bailaré', 'bailando'], h: '-AR verb with nosotros.', e: 'Bailamos = we danced. (Same spelling as present — context is key!) 💃' },
      { p: '"¿___ tú la película?" (Did you watch the movie?):', a: 'Viste', w: ['Ves', 'Verás', 'Viendo'], h: 'Ver (to see) with tú in the past.', e: 'Viste = you saw/watched. 🎬' },
      { p: '"Yo ___ mi tarea anoche." (I did my homework last night):', a: 'hice', w: ['hago', 'haré', 'haciendo'], h: 'Hacer is irregular: yo → h_c_.', e: 'Hice = I did/made. Hacer is a must-know irregular!' },
      { p: '"Ayer yo ___ al parque." (Yesterday I went to the park):', a: 'fui', w: ['voy', 'iré', 'vaya'], h: 'Ir in preterite: fui.', e: 'Fui = I went (irregular preterite of ir/ser)!' },
      { p: '"Ella ___ una carta." (She wrote a letter):', a: 'escribió', w: ['escribe', 'escribirá', 'escribiendo'], h: '-IÓ ending = he/she did it.', e: 'Escribió = she wrote (preterite)!' },
      { p: 'The preterite tense is used for actions that…', a: 'are completed in the past', w: ['happen every day', 'will happen', 'are happening now'], h: 'Done and finished.', e: 'Preterite = a finished past action, like "I ate."' },
      { p: '"Nosotros ___ pizza anoche." (We ate pizza last night):', a: 'comimos', w: ['comemos', 'comeremos', 'comíamos'], h: '-IMOS preterite for nosotros.', e: 'Comimos = we ate (last night)!' },
      { p: '"¿Qué ___ tú ayer?" (What did you do yesterday?):', a: 'hiciste', w: ['haces', 'harás', 'haga'], h: 'Hacer preterite tú: hiciste.', e: 'Hiciste = you did (irregular preterite)!' }
    ])
  },
  {
    id: 'sp.8.convo', name: 'Real Conversations', grade: 8,
    gen: fromBank([
      { p: 'At a restaurant in Madrid, the waiter asks "¿Qué desea ordenar?" He wants to know…', a: 'what you\'d like to order', w: ['if you liked the food', 'where you\'re from', 'if you want the check'], h: 'Desear = to wish/want; ordenar = to order.', e: 'Time to order! "Quisiera..." (I would like...) is the polite start. 🍽️' },
      { p: 'You want the check. You politely say…', a: 'La cuenta, por favor', w: ['El menú, por favor', 'Más agua, por favor', 'Buenos días'], h: 'Cuenta = bill/account.', e: 'La cuenta, por favor = the check, please!' },
      { p: 'Someone says "¡Que tengas un buen fin de semana!" They wish you…', a: 'a good weekend', w: ['a good meal', 'good luck on a test', 'a happy birthday'], h: 'Fin de semana = end of the week.', e: 'A kind weekend wish! Reply: "¡Igualmente!" (same to you!)' },
      { p: '"Estoy aprendiendo español desde hace dos años" means…', a: 'I\'ve been learning Spanish for two years', w: ['I will learn Spanish in two years', 'I taught Spanish for two years', 'Spanish takes two years'], h: 'Desde hace + time = "for (duration)".', e: '"Desde hace dos años" = for two years and counting. ¡Sigue así!' },
      { p: 'Your friend says "¡No manches!" (Mexican slang). They mean roughly…', a: '"No way! You\'re kidding!"', w: ['"Don\'t touch!"', '"Clean that up!"', '"Hurry up!"'], h: 'It\'s an expression of surprise.', e: 'Slang alert! ¡No manches! = No way! Real Spanish lives in slang. 😄' },
      { p: 'A friend says "¿Qué tal?" A natural reply is…', a: 'Todo bien, ¿y tú?', w: ['Tengo doce años', 'Es azul', 'Son las tres'], h: 'It\'s a casual "how\'s it going?"', e: '"¿Qué tal?" → "Todo bien, ¿y tú?" (All good, and you?)' },
      { p: '"Vale" in Spain is used to mean…', a: 'okay / got it', w: ['goodbye', 'expensive', 'never'], h: 'Very common in Spain.', e: '"Vale" = okay! (In Spain especially.)' },
      { p: 'If someone says "¡Qué chévere!" they think something is…', a: 'cool / awesome', w: ['boring', 'expensive', 'broken'], h: 'Positive slang (Caribbean/S. America).', e: '"¡Qué chévere!" = How cool!' },
      { p: 'To politely order in a café: "Me ___ un café, por favor."', a: 'pone', w: ['come', 'vivo', 'hablo'], h: '"Me pone…" = could you get me…', e: '"Me pone un café" is a natural way to order!' },
      { p: '"Nos vemos" at the end of a chat means…', a: 'see you (later)', w: ['I\'m sorry', 'good luck', 'I don\'t know'], h: 'Vemos = we see (each other).', e: '"Nos vemos" = see you around!' }
    ])
  },

  // ---------- LEVEL 9-12 ----------
  {
    id: 'sp.9.subjunctive', name: 'Subjunctive Mood', grade: 9,
    gen: fromBank([
      { p: '"Espero que ___ buen tiempo mañana." (I hope the weather is good):', a: 'haga', w: ['hace', 'hará', 'haciendo'], h: 'Hopes and wishes trigger the subjunctive!', e: 'Espero que + subjunctive: haga. Wishes aren\'t certain — that\'s the mood\'s job!' },
      { p: 'The subjunctive is used for…', a: 'wishes, doubts, and emotions — not facts', w: ['only past events', 'only questions', 'commands to dogs'], h: 'W.E.I.R.D.O: Wishes, Emotions, Impersonal, Recommendations, Doubt, Ojalá.', e: 'Subjunctive = the mood of uncertainty and desire.' },
      { p: '"Ojalá que ___ a la playa." (Hopefully we go to the beach):', a: 'vayamos', w: ['vamos', 'iremos', 'fuimos'], h: 'Ojalá ALWAYS triggers subjunctive.', e: 'Ojalá (from Arabic "inshallah"!) + vayamos. 🏖️' },
      { p: '"Es importante que los estudiantes ___ cada día." (It\'s important that students practice):', a: 'practiquen', w: ['practican', 'practicarán', 'practicando'], h: '"Es importante que..." = impersonal opinion → subjunctive.', e: 'Impersonal expressions trigger it: practiquen.' },
      { p: 'Which sentence needs NO subjunctive?', a: 'Sé que estudias mucho. (I KNOW you study a lot)', w: ['Dudo que estudies. (I doubt...)', 'Espero que estudies. (I hope...)', 'Quiero que estudies. (I want...)'], h: 'Certainty = indicative; doubt/desire = subjunctive.', e: 'Knowing is certain → normal indicative. The rest are wishes/doubts!' },
      { p: 'The subjunctive is often triggered by wishes, like: "Quiero que tú ___."', a: 'estudies', w: ['estudias', 'estudiaste', 'estudiar'], h: 'Querer que + subjunctive.', e: '"Quiero que estudies" = I want you to study (subjunctive)!' },
      { p: '"Es importante que nosotros ___ agua." (that we drink water):', a: 'bebamos', w: ['bebemos', 'bebimos', 'beber'], h: 'Impersonal expression + subjunctive.', e: '"Es importante que bebamos" uses subjunctive!' },
      { p: 'Doubt triggers subjunctive: "No creo que él ___ razón." (that he is right):', a: 'tenga', w: ['tiene', 'tuvo', 'tener'], h: 'No creer = doubt = subjunctive.', e: '"No creo que tenga razón" — doubt uses subjunctive!' },
      { p: '"Ojalá que ___ sol mañana." (I hope it\'s sunny tomorrow):', a: 'haga', w: ['hace', 'hizo', 'hacer'], h: 'Ojalá always takes subjunctive.', e: '"Ojalá que haga sol" = Hopefully it\'s sunny!' },
      { p: 'Emotion triggers it too: "Me alegro de que tú ___ aquí." (that you are here):', a: 'estés', w: ['estás', 'estabas', 'estar'], h: 'Alegrarse de que + subjunctive.', e: '"Me alegro de que estés aquí" — emotion + subjunctive!' }
    ])
  },
  {
    id: 'sp.10.reading', name: 'Lectura y Cultura', grade: 10,
    gen: fromBank([
      { p: 'Lee: "Cada domingo, la familia entera se reúne en casa de la abuela para comer paella y contar historias." ¿Qué hacen los domingos?', a: 'Se reúnen para comer y contar historias', w: ['Van a la playa', 'Trabajan todo el día', 'Viajan a otra ciudad'], h: 'Reunirse = to gather.', e: 'Sunday family gatherings — a beloved tradition across the Spanish-speaking world. 🥘' },
      { p: '"El Día de los Muertos" in Mexico is a celebration that…', a: 'joyfully honors and remembers loved ones who have died', w: ['is identical to Halloween', 'marks the new year', 'celebrates the harvest only'], h: 'Marigolds, ofrendas, sugar skulls — and joy, not fear.', e: 'Families build ofrendas with photos, food, and marigolds to welcome spirits home. 💀🌼' },
      { p: 'Lee: "Aunque llovía, el partido continuó porque era la final del campeonato." ¿Por qué continuó el partido?', a: 'Porque era la final del campeonato', w: ['Porque no llovía', 'Porque los jugadores querían irse', 'Porque el árbitro lo canceló'], h: 'Aunque = although/even though.', e: 'Championship final = the show goes on, rain or not! ⚽' },
      { p: 'Spanish is an official language in about how many countries?', a: 'around 20', w: ['3', 'exactly 50', 'only Spain and Mexico'], h: 'From Argentina to Guinea Ecuatorial!', e: '~20 countries, ~500 million speakers — you\'re learning a superpower. 🌎' },
      { p: 'Lee: "Marisol ahorró durante seis meses para comprar su primera guitarra. Cuando por fin la tocó, supo que valió la pena." ¿Qué significa "valió la pena"?', a: 'It was worth it', w: ['It was too expensive', 'It broke quickly', 'She returned it'], h: 'Six months of saving, then joy…', e: 'Valer la pena = to be worth it. Great idiom! 🎸' },
      { p: 'Lee: "El mercado abre a las ocho y cierra a las dos." ¿A qué hora cierra el mercado?', a: 'a las dos', w: ['a las ocho', 'a las seis', 'no cierra'], h: 'Cierra = closes.', e: 'It closes "a las dos" — at two o\'clock!' },
      { p: '"Aunque llovía, decidimos caminar." The word "aunque" means…', a: 'although', w: ['because', 'after', 'if'], h: 'Contrast word.', e: 'Aunque = although/even though!' },
      { p: 'Lee: "A Diego le encanta cocinar para su familia los domingos." ¿Qué le gusta hacer a Diego?', a: 'cocinar (cook)', w: ['dormir', 'correr', 'estudiar'], h: 'Le encanta = he loves.', e: 'Diego loves to cook for his family on Sundays!' },
      { p: '"La cultura del flamenco viene de…" — flamenco is a famous dance and music from…', a: 'España (Spain)', w: ['Japón', 'Canadá', 'Egipto'], h: 'Andalucía, southern Spain.', e: 'Flamenco comes from Spain — especially Andalucía! 💃' },
      { p: '"El Día de los Muertos" is a Mexican tradition that…', a: 'honors and remembers loved ones who died', w: ['celebrates the new year', 'is a soccer match', 'marks summer vacation'], h: 'Not scary — it\'s loving remembrance.', e: 'Día de los Muertos honors those who\'ve passed, with color and joy! 🌼' }
    ])
  },
  {
    id: 'sp.11.advanced', name: 'Español Avanzado', grade: 11,
    gen: fromBank([
      { p: '"Si tuviera un millón de dólares, ___ por todo el mundo." (If I had a million dollars, I would travel...):', a: 'viajaría', w: ['viajo', 'viajé', 'viaja'], h: 'Hypotheticals use the conditional: -ía endings.', e: 'Conditional viajaría = I would travel. Dream grammar! ✈️' },
      { p: 'The difference between "por" and "para": use PARA for…', a: 'destinations, deadlines, and purposes', w: ['duration and exchanges', 'only past events', 'nothing — they\'re identical'], h: 'Para = goal-oriented (think "purpose").', e: 'Para = purpose/destination; por = cause/duration/exchange.' },
      { p: '"Llevo tres horas esperando el autobús" uses "llevar" to express…', a: 'how long you\'ve been doing something', w: ['carrying something heavy', 'wearing clothes', 'taking someone somewhere'], h: 'Llevar + time + gerund = duration in progress.', e: 'Llevo tres horas esperando = I\'ve been waiting three hours. Native-level structure! 🚌' },
      { p: '"El libro fue escrito por una autora chilena" is in ___ voice.', a: 'passive (ser + past participle)', w: ['active', 'subjunctive', 'imperative'], h: 'The book didn\'t write itself — but it\'s the subject!', e: 'Fue escrito = was written. Passive with ser + participle.' },
      { p: 'Pick the correct relative pronoun: "La ciudad ___ nací es hermosa." (The city where I was born...):', a: 'donde', w: ['quien', 'cuyo', 'cual'], h: 'It refers to a PLACE.', e: 'Donde = where. La ciudad donde nací = the city where I was born.' },
      { p: '"Si yo ___ rico, viajaría por el mundo." (If I were rich…) — this uses the:', a: 'imperfect subjunctive (fuera)', w: ['present tense', 'future tense', 'command form'], h: 'Hypotheticals: Si + imperfect subjunctive.', e: '"Si yo fuera rico, viajaría…" — classic conditional!' },
      { p: '"Para" and "por" both can mean "for." "Trabajo ___ ganar dinero" (in order to earn) uses…', a: 'para', w: ['por', 'pero', 'pora'], h: 'Para = purpose/goal.', e: 'Para expresses purpose: "in order to."' },
      { p: 'The phrase "se me olvidó" literally shifts blame, meaning…', a: 'I forgot (it slipped from me)', w: ['I threw it away', 'I remembered', 'I found it'], h: 'A common "no-fault" construction.', e: '"Se me olvidó" = I forgot — but it "happened to me"!' },
      { p: '"Habría ido si me hubieran invitado." This sentence expresses…', a: 'something that would have happened but didn\'t', w: ['a daily routine', 'a future plan', 'a command'], h: 'Conditional perfect + past perfect subjunctive.', e: 'A regret about the past: "I would have gone if they\'d invited me."' },
      { p: '"Llevo tres años estudiando español" means…', a: 'I\'ve been studying Spanish for three years', w: ['I\'ll study for three years', 'I studied three years ago', 'I forgot Spanish'], h: 'Llevar + time + gerund = ongoing duration.', e: '"Llevo tres años estudiando" = an action still going on!' }
    ])
  },
  {
    id: 'sp.12.fluency', name: 'Toward Fluency', grade: 12,
    gen: fromBank([
      { p: 'In a job interview in Spanish, the strongest answer to "¿Cuáles son sus fortalezas?" starts with…', a: '"Considero que soy una persona organizada y responsable..."', w: ['"No sé."', '"¿Qué significa fortalezas?"', '"Me gusta la pizza."'], h: 'Fortalezas = strengths. Answer with substance!', e: 'Formal register + concrete traits = interview-ready Spanish. 💼' },
      { p: '"Quisiera" instead of "quiero" when ordering makes you sound…', a: 'more polite and refined', w: ['confused', 'angry', 'childish'], h: 'It\'s the difference between "I want" and "I would like."', e: 'Quisiera = I would like. Small change, big politeness upgrade.' },
      { p: 'The phrase "no obstante" in an essay means…', a: 'nevertheless / however', w: ['obviously', 'in conclusion', 'for example'], h: 'It introduces a contrast.', e: 'No obstante = nevertheless. Essay-level connector! 📝' },
      { p: '"Cada vez más personas estudian español" translates best as…', a: 'More and more people are studying Spanish', w: ['Every person studies Spanish once', 'Sometimes people study Spanish', 'People study Spanish every time'], h: 'Cada vez más = an increasing trend.', e: '"Cada vez más" = more and more — a pattern worth knowing.' },
      { p: 'True fluency mostly comes from…', a: 'regular practice speaking, listening, and reading real Spanish', w: ['memorizing the dictionary', 'one intensive weekend', 'only grammar drills'], h: 'What would your favorite teacher say?', e: 'Consistency beats cramming. ¡Sigue practicando — ya casi eres bilingüe! 🌟' },
      { p: 'The best way to sound natural is to learn language in…', a: 'chunks and phrases, not just single words', w: ['alphabetical order', 'only grammar rules', 'random vocabulary lists'], h: 'Phrases carry real meaning.', e: 'Native speakers think in phrases — so should learners!' },
      { p: '"Cognates" like "información" and "animal" are helpful because they…', a: 'look and mean nearly the same in both languages', w: ['are always false friends', 'are only in textbooks', 'never appear in speech'], h: 'Free vocabulary!', e: 'Thousands of Spanish-English cognates give you a head start!' },
      { p: 'A "false friend" (falso amigo) like "embarazada" actually means…', a: 'pregnant (not embarrassed!)', w: ['embarrassed', 'famous', 'tired'], h: 'Careful — it fools learners!', e: '"Embarazada" = pregnant. A classic false friend!' },
      { p: 'Immersion means…', a: 'surrounding yourself with the language (shows, music, talking)', w: ['studying one hour a year', 'only reading dictionaries', 'avoiding native speakers'], h: 'Live in the language.', e: 'Immersion — through media and conversation — builds real fluency!' },
      { p: 'When you don\'t know a word mid-conversation, a fluent strategy is to…', a: 'describe it with other words you DO know', w: ['stop talking completely', 'switch fully to English', 'invent a random word'], h: 'Circumlocution keeps you talking!', e: 'Talking around a word ("the thing for cutting paper") keeps conversations flowing!' }
    ])
  },
  {
    id: 'sp.4.gustar', name: 'Me Gusta — Likes & Dislikes', grade: 4,
    gen: fromBank([
      { p: "\"Me gusta el chocolate\" means…", a: "I like chocolate", w: ["I hate chocolate", "I have chocolate", "I want water"], h: "Gusta = is pleasing.", e: "\"Me gusta\" = I like it! 🍫" },
      { p: "To say you like MORE than one thing (\"I like tacos\"), you use…", a: "Me gustan los tacos", w: ["Me gusta los tacos", "Me gustar tacos", "Yo gusto tacos"], h: "Plural things → gustan.", e: "With plural nouns, use \"me gustan\"! 🌮" },
      { p: "\"¿Te gusta el fútbol?\" is asking…", a: "Do you like soccer?", w: ["Do you play soccer?", "Where is soccer?", "I like soccer"], h: "Te = to you.", e: "\"¿Te gusta…?\" = Do you like…? ⚽" },
      { p: "\"No me gusta la tarea\" means…", a: "I do not like homework", w: ["I love homework", "I do homework", "I finished homework"], h: "No = not.", e: "\"No me gusta\" = I don't like it! 📚" },
      { p: "To say a friend likes something (\"She likes music\"), say…", a: "A ella le gusta la música", w: ["Yo me gusta música", "Tú gustas música", "Ella gustan música"], h: "le = to him/her.", e: "\"Le gusta\" = he/she likes it! 🎵" },
      { p: "\"Me encanta\" is even stronger than gusta. It means…", a: "I love it", w: ["I sort of like it", "I dislike it", "I am unsure"], h: "Encantar = to delight.", e: "\"Me encanta\" = I LOVE it! 💖" },
      { p: "\"¿Qué te gusta hacer?\" asks…", a: "What do you like to do?", w: ["What is your name?", "Where do you live?", "How old are you?"], h: "hacer = to do.", e: "\"¿Qué te gusta hacer?\" = What do you like to do? 🎨" }
    ])
  },
  {
    id: 'sp.5.daily', name: 'La Rutina Diaria — Daily Routine', grade: 5,
    gen: fromBank([
      { p: "\"Me despierto a las siete\" means…", a: "I wake up at seven", w: ["I sleep at seven", "I eat at seven", "I run at seven"], h: "Despertar = to wake.", e: "\"Me despierto\" = I wake up! ⏰" },
      { p: "\"Desayuno\" is the meal you eat in the…", a: "morning (breakfast)", w: ["evening", "middle of the night", "afternoon only"], h: "Des-AYUNO breaks the fast.", e: "El desayuno = breakfast! 🥞" },
      { p: "Reflexive: \"I brush my teeth\" is \"Me ___ los dientes.\"", a: "cepillo", w: ["cepillas", "cepilla", "cepillar"], h: "Yo form ends in -o.", e: "\"Me cepillo los dientes\" = I brush my teeth! 🪥" },
      { p: "\"Después de la escuela\" means…", a: "after school", w: ["before school", "during school", "instead of school"], h: "Después = after.", e: "\"Después de\" = after! 🏫" },
      { p: "\"Voy a la cama\" means…", a: "I go to bed", w: ["I make the bed", "I clean the room", "I wake up"], h: "la cama = the bed.", e: "\"Voy a la cama\" = I go to bed! 🛏️" },
      { p: "\"Todos los días\" means…", a: "every day", w: ["some days", "never", "last week"], h: "Todos = all.", e: "\"Todos los días\" = every day! 📅" },
      { p: "\"Almuerzo\" is the meal in the…", a: "middle of the day (lunch)", w: ["early morning", "late night", "only on weekends"], h: "Between desayuno and cena.", e: "El almuerzo = lunch! 🥪" }
    ])
  },
  {
    id: 'sp.6.commands', name: 'Mandatos — Requests & Commands', grade: 6,
    gen: fromBank([
      { p: "\"¡Escucha!\" (to a friend) is a command meaning…", a: "Listen!", w: ["I listen", "Listening", "They listen"], h: "Command drops the -s.", e: "\"¡Escucha!\" = Listen! (command) 👂" },
      { p: "A polite \"Please sit down\" uses…", a: "Siéntate, por favor", w: ["Yo me siento", "Tú sientas", "Sentar por favor"], h: "Reflexive command.", e: "\"Siéntate, por favor\" = Please sit down! 🪑" },
      { p: "\"No hables\" means…", a: "Don't talk", w: ["Talk!", "I talk", "You talked"], h: "No + command = don't.", e: "\"No hables\" = Don't talk! 🤫" },
      { p: "\"Ven aquí\" means…", a: "Come here", w: ["Go away", "Sit there", "Look up"], h: "Venir command.", e: "\"Ven aquí\" = Come here! 👋" },
      { p: "To tell the class \"Open your books,\" a teacher says…", a: "Abran los libros", w: ["Abro los libros", "Abrir libros", "Abres el libro"], h: "Plural (ustedes) command.", e: "\"Abran los libros\" = Open your books! 📖" },
      { p: "\"Dime\" means…", a: "Tell me", w: ["Tell him", "Ask her", "I tell"], h: "di + me.", e: "\"Dime\" = Tell me! 💬" },
      { p: "\"Espera un momento\" means…", a: "Wait a moment", w: ["Run a moment", "Sleep a moment", "Eat a moment"], h: "Esperar = to wait.", e: "\"Espera un momento\" = Wait a moment! ⏳" }
    ])
  },
  {
    id: 'sp.7.places', name: 'En la Ciudad — Around Town', grade: 7,
    gen: fromBank([
      { p: "\"El supermercado\" is where you buy…", a: "food and groceries", w: ["books to read", "clothes only", "stamps only"], h: "Super-MERCADO = market.", e: "El supermercado = the grocery store! 🛒" },
      { p: "To ask \"Where is the bathroom?\" you say…", a: "¿Dónde está el baño?", w: ["¿Qué hora es?", "¿Cómo estás?", "¿Cuánto cuesta?"], h: "Dónde = where.", e: "\"¿Dónde está el baño?\" = Where is the bathroom? 🚻" },
      { p: "\"Gira a la derecha\" means…", a: "Turn right", w: ["Turn left", "Go straight", "Stop here"], h: "Derecha = right.", e: "\"Gira a la derecha\" = Turn right! ➡️" },
      { p: "\"La biblioteca\" is a place to…", a: "borrow and read books", w: ["buy medicine", "watch movies", "eat dinner"], h: "Biblio = books.", e: "La biblioteca = the library! 📚" },
      { p: "\"¿Cuánto cuesta?\" asks…", a: "How much does it cost?", w: ["What time is it?", "Where is it?", "Who are you?"], h: "Cuesta = costs.", e: "\"¿Cuánto cuesta?\" = How much is it? 💰" },
      { p: "\"El hospital\" is where you go when you are…", a: "sick or hurt", w: ["hungry for tacos", "shopping for shoes", "learning to swim"], h: "A cognate!", e: "El hospital = the hospital! 🏥" },
      { p: "\"Sigue derecho\" (or \"recto\") means…", a: "Go straight ahead", w: ["Turn around", "Stop", "Turn right"], h: "Derecho/recto = straight.", e: "\"Sigue derecho\" = Keep going straight! ⬆️" }
    ])
  },
  {
    id: 'sp.8.travel', name: 'De Viaje — Travel & Real Situations', grade: 8,
    gen: fromBank([
      { p: "At a restaurant, \"La cuenta, por favor\" asks for…", a: "the check/bill", w: ["the menu", "more water", "the bathroom"], h: "La cuenta = the bill.", e: "\"La cuenta, por favor\" = The check, please! 🧾" },
      { p: "At the airport, \"el vuelo\" means…", a: "the flight", w: ["the luggage", "the ticket", "the gate"], h: "Volar = to fly.", e: "El vuelo = the flight! ✈️" },
      { p: "\"Estoy perdido\" means…", a: "I am lost", w: ["I am tired", "I am hungry", "I am happy"], h: "Perder = to lose.", e: "\"Estoy perdido/a\" = I'm lost! 🗺️" },
      { p: "To politely ask someone to speak slower: \"Más ___, por favor.\"", a: "despacio", w: ["rápido", "alto", "tarde"], h: "Despacio = slowly.", e: "\"Más despacio, por favor\" = Slower, please! 🐢" },
      { p: "\"¿Me puede ayudar?\" means…", a: "Can you help me?", w: ["Can I pay?", "Where is it?", "What time is it?"], h: "Ayudar = to help.", e: "\"¿Me puede ayudar?\" = Can you help me? 🙋" },
      { p: "\"La habitación\" at a hotel is your…", a: "room", w: ["breakfast", "key", "suitcase"], h: "Where you sleep.", e: "La habitación = the (hotel) room! 🛎️" },
      { p: "\"No entiendo, ¿puede repetir?\" means…", a: "I don't understand, can you repeat?", w: ["I agree completely", "Let's go now", "I am finished"], h: "Repetir = to repeat.", e: "A lifesaver phrase: \"Can you repeat that?\" 🔁" }
    ])
  },
{
    id: 'sp.9.conditional', name: 'El Condicional: Would & Hypotheticals', grade: 9,
    gen: fromBank([
      { p: 'Translate to Spanish: "I would speak" (first person, conditional tense).', a: 'yo hablaría', w: ['yo hablaré', 'yo hablaba', 'yo hablé'], h: 'The conditional endings for -ar verbs start with -ía on the full infinitive.', e: 'The conditional keeps the whole infinitive hablar and adds -ía, giving hablaría, which means "I would speak".' },
      { p: 'Complete the polite request: "¿___ ayudarme, por favor?" (Could you help me?).', a: 'Podría', w: ['Puedo', 'Podré', 'Pude'], h: 'The conditional of poder softens a request and makes it more courteous.', e: 'Podría is the conditional of poder, so "¿Podría ayudarme?" is a polite way to say "Could you help me?".' },
      { p: 'Which sentence correctly says "We would travel to Spain if we had money"?', a: 'Viajaríamos a España si tuviéramos dinero', w: ['Viajamos a España si tenemos dinero', 'Viajaremos a España si tuvimos dinero', 'Viajábamos a España si tendríamos dinero'], h: 'Hypotheticals pair the conditional with the past subjunctive after si.', e: 'The pattern is conditional plus si plus past subjunctive: viajaríamos (would travel) with si tuviéramos (if we had).' },
      { p: 'Translate to Spanish: "They would eat" (third person plural, conditional).', a: 'comerían', w: ['comerán', 'comían', 'comieron'], h: 'Add the conditional ending directly to the infinitive comer.', e: 'Comer plus -ían gives comerían, which means "they would eat". Comerán is future and comían is imperfect.' },
      { p: 'The verb tener is irregular in the conditional. What is "I would have"?', a: 'tendría', w: ['tenería', 'tendré', 'tenía'], h: 'The stem changes to tendr- before the ending, just like in the future tense.', e: 'Tener uses the irregular stem tendr-, so "I would have" is tendría. The regular-looking tenería does not exist.' },
      { p: 'Which option means "What would you do?" using the tú form of hacer?', a: '¿Qué harías?', w: ['¿Qué hacerías?', '¿Qué harás?', '¿Qué hiciste?'], h: 'Hacer has the irregular conditional stem har-.', e: 'Hacer becomes har- in the conditional, so "¿Qué harías?" means "What would you do?". Harás is future.' },
      { p: 'Complete the softened opinion: "Yo ___ que es una buena idea" (I would say it is a good idea).', a: 'diría', w: ['digo', 'diré', 'dije'], h: 'Decir is irregular with the stem dir- in the conditional.', e: 'Diría is the conditional of decir, so "Yo diría que..." gently offers an opinion, meaning "I would say that...".' },
      { p: 'Translate to Spanish: "In your place, I would not go" (using ir).', a: 'En tu lugar, yo no iría', w: ['En tu lugar, yo no iba', 'En tu lugar, yo no iré', 'En tu lugar, yo no fui'], h: 'Ir is regular in the conditional even though it is irregular elsewhere.', e: 'Ir simply takes -ía to become iría, so "yo no iría" means "I would not go", a common way to give advice.' }
    ])
  },
  {
    id: 'sp.10.idioms', name: 'Modismos: Idioms & Expressions', grade: 10,
    gen: fromBank([
      { p: 'What does the idiom "estar en las nubes" mean?', a: 'To be daydreaming or distracted', w: ['To be very angry', 'To be extremely tired', 'To be traveling by plane'], h: 'The literal image is "to be in the clouds".', e: 'Estar en las nubes describes someone daydreaming or with their head in the clouds, not paying attention.' },
      { p: 'Someone says "cuesta un ojo de la cara". What are they describing?', a: 'Something very expensive', w: ['Something very ugly', 'Something painful to watch', 'Something hard to find'], h: 'Literally it says something "costs an eye from the face".', e: 'Cuesta un ojo de la cara means it costs an arm and a leg, in other words it is very expensive.' },
      { p: 'What does "tomar el pelo (a alguien)" mean?', a: 'To tease or pull someone\'s leg', w: ['To style someone\'s hair', 'To ignore someone', 'To scold someone harshly'], h: 'It is a playful expression about not being serious.', e: 'Tomar el pelo a alguien means to tease them or pull their leg, joking around rather than telling the truth.' },
      { p: 'If a task is "pan comido", how difficult is it?', a: 'Very easy', w: ['Very expensive', 'Impossible', 'Boring'], h: 'The literal phrase is "eaten bread".', e: 'Pan comido is the equivalent of "a piece of cake", meaning something is very easy to do.' },
      { p: 'What does "no tener pelos en la lengua" describe about a person?', a: 'They speak bluntly and say what they think', w: ['They are very shy', 'They lie often', 'They talk too slowly'], h: 'Imagine nothing on the tongue holding words back.', e: 'No tener pelos en la lengua means to be very frank, speaking your mind without holding back.' },
      { p: 'Someone "se fue por las ramas" during a conversation. What did they do?', a: 'They went off topic and avoided the point', w: ['They ended the talk politely', 'They got straight to the point', 'They climbed a tree'], h: 'The image is wandering "through the branches".', e: 'Irse por las ramas means to beat around the bush, wandering off topic instead of addressing the main point.' },
      { p: 'What does the expression "estar como pez en el agua" convey?', a: 'To feel completely comfortable in a situation', w: ['To be soaking wet', 'To be very nervous', 'To be a strong swimmer'], h: 'Think of a fish perfectly at home in water.', e: 'Estar como pez en el agua means to feel right at home, totally comfortable and in your element. 🐟' },
      { p: 'If someone tells you "no hay mal que por bien no venga", what are they saying?', a: 'Every bad thing brings something good (a blessing in disguise)', w: ['Bad things always get worse', 'It is better not to try', 'Nothing good ever lasts'], h: 'It is a hopeful proverb about silver linings.', e: 'This proverb means there is a silver lining in every misfortune, similar to "every cloud has a silver lining".' }
    ])
  },
  {
    id: 'sp.11.professional', name: 'Español Profesional: Workplace Spanish', grade: 11,
    gen: fromBank([
      { p: 'How would you formally begin a business email to someone whose name you do not know?', a: 'Estimado señor o señora:', w: ['¡Hola qué tal!', 'Querido amigo:', 'Oye, escucha:'], h: 'Formal correspondence uses estimado or estimada plus a colon.', e: 'Estimado señor o señora is the standard formal greeting for a business letter when the recipient is unknown, like "Dear Sir or Madam".' },
      { p: 'In a meeting, how do you politely say "I would like to add something"?', a: 'Me gustaría añadir algo', w: ['Quiero hablar ahora', 'Cállate un momento', 'Dame eso ya'], h: 'Me gustaría plus an infinitive is a courteous way to make a point.', e: 'Me gustaría añadir algo is a polite, professional way to contribute in a meeting, meaning "I would like to add something".' },
      { p: 'Which phrase best closes a formal email before your signature?', a: 'Atentamente,', w: ['Un abrazo fuerte,', 'Nos vemos,', 'Chao,'], h: 'This adverb signals a respectful, formal sign-off.', e: 'Atentamente is the professional equivalent of "Sincerely" and is the expected closing in formal business emails.' },
      { p: 'How do you ask a colleague to send you the report by Friday, politely?', a: '¿Podría enviarme el informe para el viernes?', w: ['Mándame el informe ya', 'Dame el reporte cuando sea', 'Necesito eso rápido'], h: 'The conditional podría plus usted keeps the request courteous.', e: 'Podría enviarme el informe para el viernes uses the polite conditional to request the report by Friday without sounding demanding.' },
      { p: 'What does the workplace term "reunión" mean?', a: 'A meeting', w: ['A raise', 'A resignation', 'A deadline'], h: 'It comes from the idea of people coming together.', e: 'Una reunión is a meeting. A raise is un aumento, and a deadline is una fecha límite.' },
      { p: 'A colleague thanks you for your help. Which is the most professional reply?', a: 'No hay de qué, quedo a su disposición', w: ['De nada, ni modo', 'Sí, obvio', 'Da igual'], h: 'Offering continued availability sounds gracious in a work setting.', e: 'Quedo a su disposición means "I remain at your service", a polished professional way to say you are happy to help further.' },
      { p: 'How do you say "I am attaching the document" in a professional email?', a: 'Adjunto el documento', w: ['Aquí está la cosa', 'Te tiro el archivo', 'Ahí va eso'], h: 'The verb adjuntar means to attach a file.', e: 'Adjunto el documento is the standard phrase for "I am attaching the document" in business correspondence.' },
      { p: 'Which sentence professionally requests a short delay on a deadline?', a: '¿Sería posible extender el plazo unos días?', w: ['No voy a terminar, lo siento', 'Necesito más tiempo o me voy', 'Eso no se puede hacer'], h: 'Sería posible is a soft, formal way to ask permission.', e: 'Sería posible extender el plazo unos días politely asks whether the deadline could be extended a few days, using courteous conditional phrasing.' }
    ])
  },
  {
    id: 'sp.12.register', name: 'Register & Nuance: Formal vs. Casual', grade: 12,
    gen: fromBank([
      { p: 'You are addressing a judge in court. Which pronoun and verb form is appropriate for "How are you?"?', a: '¿Cómo está usted?', w: ['¿Cómo estás tú?', '¿Qué onda?', '¿Cómo andas?'], h: 'Authority figures and strangers call for the formal register.', e: 'Usted with está is the formal, respectful choice for a judge, while tú forms and slang would be too casual.' },
      { p: 'Which greeting is the most casual, appropriate among close friends?', a: '¿Qué tal, tío?', w: ['Buenos días, señor', 'Le saludo atentamente', 'Encantado de conocerle'], h: 'Slang like tío (buddy, in Spain) signals informality.', e: '¿Qué tal, tío? is casual friend-to-friend speech in Spain, while the others belong to formal or first-meeting contexts.' },
      { p: 'When you meet your partner\'s grandmother for the first time, which is most appropriate?', a: 'Mucho gusto, encantado de conocerla', w: ['¿Qué pasa, abuela?', 'Hola, ¿cómo andas?', 'Ey, ¿todo bien?'], h: 'A first meeting with an elder calls for formal courtesy and usted forms.', e: 'Encantado de conocerla uses the formal la (usted) and a polite set phrase, showing respect to an elder you have just met.' },
      { p: 'Which sentence uses the formal command (usted) for "Please sit down"?', a: 'Siéntese, por favor', w: ['Siéntate, por favor', 'Sentate, che', 'Vas a sentarte'], h: 'Formal usted commands often end in -e for -ar verbs.', e: 'Siéntese is the usted command, the formal and polite way to invite someone to sit. Siéntate is the informal tú command.' },
      { p: 'In much of Latin America, which pronoun replaces vosotros for "you all" in both formal and casual speech?', a: 'ustedes', w: ['vosotros', 'vos', 'tú'], h: 'Latin America generally does not use vosotros in everyday speech.', e: 'Ustedes covers "you all" for every register in Latin America, whereas vosotros is used mainly in Spain.' },
      { p: 'A friend texts asking a favor. Which casual reply fits the register?', a: 'Claro, sin problema', w: ['Quedo a su entera disposición', 'Con mucho gusto le ayudaré, señor', 'Será un honor atender su solicitud'], h: 'Texting a friend calls for short, relaxed language.', e: 'Claro, sin problema is friendly and casual, matching a text between friends. The other options are formal business phrasing.' },
      { p: 'Which phrase softens a disagreement in a formal discussion?', a: 'Con todo respeto, no estoy de acuerdo', w: ['Estás totalmente equivocado', 'Eso es una tontería', 'No digas eso, hombre'], h: 'A respectful preface keeps formal disagreement polite.', e: 'Con todo respeto, no estoy de acuerdo disagrees courteously, appropriate for formal settings, while the others are blunt or casual.' },
      { p: 'In Argentina and parts of Central America, which informal pronoun replaces tú?', a: 'vos', w: ['usted', 'vosotros', 'ustedes'], h: 'This feature is called voseo.', e: 'Vos is the informal second-person pronoun used in Argentina and elsewhere, a phenomenon known as voseo, for example vos tenés instead of tú tienes.' }
    ])
  }
];

module.exports = { subject: 'spanish', label: 'Spanish', emoji: '🌎', color: '#E17055', skills };

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
      { p: '"Por favor" means…', a: 'please', w: ['thank you', 'goodbye', 'good night'], h: 'Use it when asking for something nicely.', e: 'Por favor = please. Magic words work in every language! ✨' }
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
      { p: 'A stop sign 🛑 is "rojo". Rojo means…', a: 'red', w: ['blue', 'green', 'yellow'], h: 'Stop signs everywhere are this color.', e: 'Rojo = red.' },
      { p: 'The sky ☁️➡️ on a sunny day is "azul". Azul means…', a: 'blue', w: ['gray', 'red', 'purple'], h: 'Look up on a clear day!', e: 'Azul = blue.' },
      { p: 'Grass and limes are "verde". Verde means…', a: 'green', w: ['orange', 'pink', 'brown'], h: 'Think of a lime.', e: 'Verde = green. 🍏' },
      { p: 'The sun ☀️ and bananas are "amarillo". Amarillo means…', a: 'yellow', w: ['white', 'gold only', 'orange'], h: 'Banana color!', e: 'Amarillo = yellow. 🍌' },
      { p: 'How do you say "black" (like a night sky)?', a: 'negro', w: ['blanco', 'rosado', 'gris'], h: 'Blanco is its opposite.', e: 'Negro = black; blanco = white.' },
      { p: 'A flamingo 🦩 is "rosado". Rosado means…', a: 'pink', w: ['red', 'purple', 'tan'], h: 'Flamingo-colored!', e: 'Rosado (or rosa) = pink.' }
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
      { p: '"La familia" means…', a: 'the family', w: ['the house', 'the party', 'the food'], h: 'It sounds a lot like the English word!', e: 'Familia = family. Cognates make Spanish friendly!' }
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
      { p: 'Which animal is "la vaca"? 🥛', a: 'the cow', w: ['the sheep', 'the goat', 'the hen'], h: 'It gives milk and says "muu".', e: 'La vaca = the cow!' }
    ])
  },
  {
    id: 'sp.1.food', name: 'La Comida', grade: 1,
    gen: fromBank([
      { p: 'You\'re thirsty after soccer. You ask for "agua". 💧 Agua means…', a: 'water', w: ['juice', 'milk', 'bread'], h: 'It falls as rain!', e: 'El agua = water. ¡Salud!' },
      { p: '"La manzana" keeps the doctor away. 🍎 Manzana means…', a: 'apple', w: ['orange', 'grape', 'banana'], h: 'An apple a day…', e: 'La manzana = the apple.' },
      { p: 'For breakfast you eat "pan" with butter. 🍞 Pan means…', a: 'bread', w: ['pancake', 'egg', 'cereal'], h: 'A "panadería" is a bakery!', e: 'El pan = bread.' },
      { p: '"La leche" goes great with cookies. 🥛 Leche means…', a: 'milk', w: ['lemonade', 'water', 'tea'], h: 'It comes from la vaca!', e: 'La leche = milk.' },
      { p: '"El queso" is on pizza and quesadillas. 🧀 Queso means…', a: 'cheese', w: ['meat', 'sauce', 'mushroom'], h: 'QUESO-dilla = cheese tortilla!', e: 'El queso = cheese. Now you know why quesadillas are named that!' },
      { p: '"Tengo hambre" means…', a: 'I\'m hungry', w: ['I\'m tired', 'I\'m happy', 'I\'m tall'], h: 'You\'d say it right before lunch!', e: 'Tengo hambre = I\'m hungry. Tengo sed = I\'m thirsty!' }
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
      { p: 'Which month starts the year?', a: 'enero', w: ['diciembre', 'agosto', 'abril'], h: 'It\'s cold in New York during this month.', e: 'Enero = January, month #1!' }
    ])
  },
  {
    id: 'sp.2.body', name: 'El Cuerpo', grade: 2,
    gen: fromBank([
      { p: 'In "Cabeza, hombros, rodillas y pies" (the song!), "cabeza" is your…', a: 'head', w: ['shoulders', 'knees', 'toes'], h: 'It\'s the song "Head, Shoulders, Knees and Toes"!', e: 'Cabeza = head. Now sing it in Spanish! 🎵' },
      { p: 'You kick a fútbol with your "pie". Pie means…', a: 'foot', w: ['hand', 'leg', 'a dessert'], h: 'Not the dessert! ⚽', e: 'El pie = foot (pronounced "pee-EH", not like apple pie!).' },
      { p: 'You wave hello with your "mano". Mano means…', a: 'hand', w: ['arm', 'finger', 'elbow'], h: 'High five = choca esos cinco!', e: 'La mano = hand. 👋' },
      { p: '"Los ojos" let you see the world. Ojos means…', a: 'eyes', w: ['ears', 'nose', 'mouth'], h: 'They can be azules, verdes, or cafés.', e: 'Los ojos = eyes. 👀' },
      { p: 'You hear música with your "orejas". Orejas means…', a: 'ears', w: ['eyes', 'hands', 'hair'], h: 'Headphones go on them. 🎧', e: 'Las orejas = ears.' }
    ])
  },
  {
    id: 'sp.2.phrases', name: 'Frases Útiles', grade: 2,
    gen: fromBank([
      { p: 'Someone asks "¿Cómo estás?" You feel great! You answer…', a: '¡Muy bien, gracias!', w: ['Me llamo Ana.', 'Tengo ocho años.', 'Es lunes.'], h: 'They asked HOW you are.', e: '¿Cómo estás? = How are you? Muy bien = very well!' },
      { p: '"¿Dónde está el baño?" is the world\'s most useful travel question. It means…', a: 'Where is the bathroom?', w: ['Where is the beach?', 'What time is it?', 'How much does it cost?'], h: 'Every traveler needs this one!', e: '¿Dónde está...? = Where is...? ¡Muy útil!' },
      { p: 'Your friend sneezes. 🤧 You say…', a: '¡Salud!', w: ['¡Adiós!', '¡Feliz Navidad!', '¡Buenas noches!'], h: 'Like "bless you" — it literally means "health!"', e: '¡Salud! = health! Said after sneezes and for toasts!' },
      { p: '"No entiendo" is a super-helpful phrase meaning…', a: 'I don\'t understand', w: ['I don\'t want it', 'I\'m not going', 'I\'m not hungry'], h: 'Say it when confused — everyone will help!', e: 'No entiendo = I don\'t understand. ¿Puedes repetir? = can you repeat?' },
      { p: '"Tengo nueve años" means…', a: 'I am nine years old', w: ['I have nine toys', 'It\'s nine o\'clock', 'I want nine tacos'], h: 'In Spanish you HAVE years, not ARE years!', e: 'Tengo... años = I am... years old. (Literally "I have 9 years!")' }
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
      { p: '"¿Dónde estás?" asks…', a: 'Where are you?', w: ['Who are you?', 'How old are you?', 'What do you want?'], h: 'Location → estar.', e: '¿Dónde estás? = Where are you (located)?' }
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
      { p: '"¿Quién es tu maestro favorito?" asks about your favorite…', a: 'teacher (who?)', w: ['food (what?)', 'place (where?)', 'time (when?)'], h: '¿Quién? asks about a person.', e: '¿Quién? = Who? Maestro = teacher!' }
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
      { p: 'Which phrase is correct?', a: 'la música fantástica', w: ['la música fantástico', 'el música fantástica', 'la músicas fantástica'], h: 'Match gender AND number.', e: 'La música (fem. sing.) + fantástica. ¡Perfecto! 🎶' }
    ])
  },
  {
    id: 'sp.7.preterite', name: 'Past Tense (Pretérito)', grade: 7,
    gen: fromBank([
      { p: '"Ayer yo ___ tacos." (Yesterday I ate tacos):', a: 'comí', w: ['como', 'comeré', 'comiendo'], h: 'Ayer = yesterday → past tense.', e: 'Comí = I ate. -ER verbs: yo → -í in the preterite. 🌮' },
      { p: '"Ella ___ a la fiesta el sábado." (She went to the party):', a: 'fue', w: ['va', 'irá', 'yendo'], h: '"Ir" (to go) is wildly irregular in the past.', e: 'Fue = she went. Ir and ser share this form — context tells you which!' },
      { p: '"Nosotros ___ mucho en el concierto." (We danced a lot):', a: 'bailamos', w: ['bailan', 'bailaré', 'bailando'], h: '-AR verb with nosotros.', e: 'Bailamos = we danced. (Same spelling as present — context is key!) 💃' },
      { p: '"¿___ tú la película?" (Did you watch the movie?):', a: 'Viste', w: ['Ves', 'Verás', 'Viendo'], h: 'Ver (to see) with tú in the past.', e: 'Viste = you saw/watched. 🎬' },
      { p: '"Yo ___ mi tarea anoche." (I did my homework last night):', a: 'hice', w: ['hago', 'haré', 'haciendo'], h: 'Hacer is irregular: yo → h_c_.', e: 'Hice = I did/made. Hacer is a must-know irregular!' }
    ])
  },
  {
    id: 'sp.8.convo', name: 'Real Conversations', grade: 8,
    gen: fromBank([
      { p: 'At a restaurant in Madrid, the waiter asks "¿Qué desea ordenar?" He wants to know…', a: 'what you\'d like to order', w: ['if you liked the food', 'where you\'re from', 'if you want the check'], h: 'Desear = to wish/want; ordenar = to order.', e: 'Time to order! "Quisiera..." (I would like...) is the polite start. 🍽️' },
      { p: 'You want the check. You politely say…', a: 'La cuenta, por favor', w: ['El menú, por favor', 'Más agua, por favor', 'Buenos días'], h: 'Cuenta = bill/account.', e: 'La cuenta, por favor = the check, please!' },
      { p: 'Someone says "¡Que tengas un buen fin de semana!" They wish you…', a: 'a good weekend', w: ['a good meal', 'good luck on a test', 'a happy birthday'], h: 'Fin de semana = end of the week.', e: 'A kind weekend wish! Reply: "¡Igualmente!" (same to you!)' },
      { p: '"Estoy aprendiendo español desde hace dos años" means…', a: 'I\'ve been learning Spanish for two years', w: ['I will learn Spanish in two years', 'I taught Spanish for two years', 'Spanish takes two years'], h: 'Desde hace + time = "for (duration)".', e: '"Desde hace dos años" = for two years and counting. ¡Sigue así!' },
      { p: 'Your friend says "¡No manches!" (Mexican slang). They mean roughly…', a: '"No way! You\'re kidding!"', w: ['"Don\'t touch!"', '"Clean that up!"', '"Hurry up!"'], h: 'It\'s an expression of surprise.', e: 'Slang alert! ¡No manches! = No way! Real Spanish lives in slang. 😄' }
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
      { p: 'Which sentence needs NO subjunctive?', a: 'Sé que estudias mucho. (I KNOW you study a lot)', w: ['Dudo que estudies. (I doubt...)', 'Espero que estudies. (I hope...)', 'Quiero que estudies. (I want...)'], h: 'Certainty = indicative; doubt/desire = subjunctive.', e: 'Knowing is certain → normal indicative. The rest are wishes/doubts!' }
    ])
  },
  {
    id: 'sp.10.reading', name: 'Lectura y Cultura', grade: 10,
    gen: fromBank([
      { p: 'Lee: "Cada domingo, la familia entera se reúne en casa de la abuela para comer paella y contar historias." ¿Qué hacen los domingos?', a: 'Se reúnen para comer y contar historias', w: ['Van a la playa', 'Trabajan todo el día', 'Viajan a otra ciudad'], h: 'Reunirse = to gather.', e: 'Sunday family gatherings — a beloved tradition across the Spanish-speaking world. 🥘' },
      { p: '"El Día de los Muertos" in Mexico is a celebration that…', a: 'joyfully honors and remembers loved ones who have died', w: ['is identical to Halloween', 'marks the new year', 'celebrates the harvest only'], h: 'Marigolds, ofrendas, sugar skulls — and joy, not fear.', e: 'Families build ofrendas with photos, food, and marigolds to welcome spirits home. 💀🌼' },
      { p: 'Lee: "Aunque llovía, el partido continuó porque era la final del campeonato." ¿Por qué continuó el partido?', a: 'Porque era la final del campeonato', w: ['Porque no llovía', 'Porque los jugadores querían irse', 'Porque el árbitro lo canceló'], h: 'Aunque = although/even though.', e: 'Championship final = the show goes on, rain or not! ⚽' },
      { p: 'Spanish is an official language in about how many countries?', a: 'around 20', w: ['3', 'exactly 50', 'only Spain and Mexico'], h: 'From Argentina to Guinea Ecuatorial!', e: '~20 countries, ~500 million speakers — you\'re learning a superpower. 🌎' },
      { p: 'Lee: "Marisol ahorró durante seis meses para comprar su primera guitarra. Cuando por fin la tocó, supo que valió la pena." ¿Qué significa "valió la pena"?', a: 'It was worth it', w: ['It was too expensive', 'It broke quickly', 'She returned it'], h: 'Six months of saving, then joy…', e: 'Valer la pena = to be worth it. Great idiom! 🎸' }
    ])
  },
  {
    id: 'sp.11.advanced', name: 'Español Avanzado', grade: 11,
    gen: fromBank([
      { p: '"Si tuviera un millón de dólares, ___ por todo el mundo." (If I had a million dollars, I would travel...):', a: 'viajaría', w: ['viajo', 'viajé', 'viaja'], h: 'Hypotheticals use the conditional: -ía endings.', e: 'Conditional viajaría = I would travel. Dream grammar! ✈️' },
      { p: 'The difference between "por" and "para": use PARA for…', a: 'destinations, deadlines, and purposes', w: ['duration and exchanges', 'only past events', 'nothing — they\'re identical'], h: 'Para = goal-oriented (think "purpose").', e: 'Para = purpose/destination; por = cause/duration/exchange.' },
      { p: '"Llevo tres horas esperando el autobús" uses "llevar" to express…', a: 'how long you\'ve been doing something', w: ['carrying something heavy', 'wearing clothes', 'taking someone somewhere'], h: 'Llevar + time + gerund = duration in progress.', e: 'Llevo tres horas esperando = I\'ve been waiting three hours. Native-level structure! 🚌' },
      { p: '"El libro fue escrito por una autora chilena" is in ___ voice.', a: 'passive (ser + past participle)', w: ['active', 'subjunctive', 'imperative'], h: 'The book didn\'t write itself — but it\'s the subject!', e: 'Fue escrito = was written. Passive with ser + participle.' },
      { p: 'Pick the correct relative pronoun: "La ciudad ___ nací es hermosa." (The city where I was born...):', a: 'donde', w: ['quien', 'cuyo', 'cual'], h: 'It refers to a PLACE.', e: 'Donde = where. La ciudad donde nací = the city where I was born.' }
    ])
  },
  {
    id: 'sp.12.fluency', name: 'Toward Fluency', grade: 12,
    gen: fromBank([
      { p: 'In a job interview in Spanish, the strongest answer to "¿Cuáles son sus fortalezas?" starts with…', a: '"Considero que soy una persona organizada y responsable..."', w: ['"No sé."', '"¿Qué significa fortalezas?"', '"Me gusta la pizza."'], h: 'Fortalezas = strengths. Answer with substance!', e: 'Formal register + concrete traits = interview-ready Spanish. 💼' },
      { p: '"Quisiera" instead of "quiero" when ordering makes you sound…', a: 'more polite and refined', w: ['confused', 'angry', 'childish'], h: 'It\'s the difference between "I want" and "I would like."', e: 'Quisiera = I would like. Small change, big politeness upgrade.' },
      { p: 'The phrase "no obstante" in an essay means…', a: 'nevertheless / however', w: ['obviously', 'in conclusion', 'for example'], h: 'It introduces a contrast.', e: 'No obstante = nevertheless. Essay-level connector! 📝' },
      { p: '"Cada vez más personas estudian español" translates best as…', a: 'More and more people are studying Spanish', w: ['Every person studies Spanish once', 'Sometimes people study Spanish', 'People study Spanish every time'], h: 'Cada vez más = an increasing trend.', e: '"Cada vez más" = more and more — a pattern worth knowing.' },
      { p: 'True fluency mostly comes from…', a: 'regular practice speaking, listening, and reading real Spanish', w: ['memorizing the dictionary', 'one intensive weekend', 'only grammar drills'], h: 'What would your favorite teacher say?', e: 'Consistency beats cramming. ¡Sigue practicando — ya casi eres bilingüe! 🌟' }
    ])
  }
];

module.exports = { subject: 'spanish', label: 'Spanish', emoji: '🌎', color: '#E17055', skills };

/* Gallop Learning Academy — lesson patch layer.
   Adds teaching beats to lessons whose practice questions needed a step the base
   lesson didn't cover, and injects dedicated lessons for advanced skills that were
   borrowing a simpler lesson (found by the lesson<->question audit). Loaded AFTER
   lessons.js; augments window.GALLOP_LESSONS in place. Idempotent. Auto-generated —
   do not hand-edit; regenerate from the authored fixes. */
'use strict';
(() => {
  const L = window.GALLOP_LESSONS;
  if (!L) return;
  const bySkill = {};
  for (const subj of Object.keys(L)) for (const les of (L[subj] || [])) if (les && les.skillId) bySkill[les.skillId] = les;

  const PATCH = {
  "m.3.frac": [
    {
      "kind": "concept",
      "title": "The fraction that is LEFT",
      "body": "Sometimes a question asks for the part that is LEFT, not the part you used. The bottom is still how many equal pieces there are in all. For the top, take away the pieces used — what remains is your answer.",
      "analogy": "A pizza in 6 slices and you give away 5: six on the bottom, one slice left, so 1/6 is left.",
      "say": "Sometimes you want the part that is left. The bottom is all the equal pieces. Take away the ones used, and what is left is the top."
    },
    {
      "kind": "example",
      "title": "Worked example: what is left?",
      "body": "A pack of stickers has 6 equal sheets. You give away 5. What fraction is LEFT?",
      "reveal": [
        "The pack has 6 equal sheets, so the bottom is 6.",
        "You gave away 5, so 6 − 5 = 1 sheet is left.",
        "The fraction left is 1 over 6, written 1/6."
      ],
      "say": "Six sheets in all. You gave away five, so one is left. One sixth is left."
    }
  ],
  "m.4.longdiv": [
    {
      "kind": "example",
      "title": "When a place does not divide evenly",
      "body": "Try 168 ÷ 6. Work one place at a time and carry the leftover to the next.",
      "reveal": [
        "6 into 16 is 2 (that is 12), with 4 left over. Write 2.",
        "Carry the 4 in front of the 8 to make 48.",
        "6 into 48 is exactly 8. Write 8. The answer is 28."
      ],
      "say": "Six into sixteen is two, remainder four. Carry the four to make forty-eight. Six into forty-eight is eight. So twenty-eight."
    }
  ],
  "m.4.factors": [
    {
      "kind": "concept",
      "title": "Factors vs. multiples",
      "body": "A FACTOR fits evenly INTO a number — 3 is a factor of 12. A MULTIPLE is what you land on counting BY a number: the multiples of 4 are 4, 8, 12, 16, 20 — its times table. So 12 is a multiple of 4 because 4 × 3 = 12.",
      "analogy": "Factors are the numbers that build it; multiples are the numbers it builds as you skip-count.",
      "say": "A factor fits into a number. A multiple is what you get counting by it. Multiples of four are four, eight, twelve, sixteen."
    },
    {
      "kind": "try",
      "title": "Your turn: find the multiple",
      "body": "Which number is a MULTIPLE of 5?",
      "say": "Which number is a multiple of five?",
      "widget": {
        "w": "tapPick",
        "prompt": "Count by 5s: 5, 10, 15…",
        "options": [
          {
            "label": "10",
            "correct": true
          },
          {
            "label": "12"
          },
          {
            "label": "27"
          }
        ]
      }
    }
  ],
  "m.10.circles": [
    {
      "kind": "show",
      "title": "Circumference: the distance around",
      "body": "Area fills the inside of a circle. CIRCUMFERENCE is the distance all the way around the edge. Its formula is C = 2 × π × r. Because the diameter is twice the radius, that is the same as C = π × d.",
      "analogy": "If area is the pizza you eat, circumference is the crust you trace with your finger.",
      "say": "Circumference is the distance around the edge. It equals two pi r, which is the same as pi times the diameter."
    },
    {
      "kind": "example",
      "title": "Worked example: circumference",
      "body": "Find each circumference in terms of π.",
      "reveal": [
        "Radius 6: C = 2 × π × 6 = 12π.",
        "Diameter 24: C = π × 24 = 24π.",
        "With a radius use 2πr; with a diameter use πd. Leave the answer in terms of π."
      ],
      "say": "Radius six gives two pi six, twelve pi. Diameter twenty-four gives pi times twenty-four, twenty-four pi."
    }
  ],
  "m.10.angles": [
    {
      "kind": "concept",
      "title": "Complementary angles add to 90",
      "body": "Two angles are COMPLEMENTARY when they add to 90° — a square corner. If one is 38°, the other is 90 − 38 = 52°. (Supplementary adds to 180, a straight line; complementary adds to 90, a corner.)",
      "analogy": "Supplementary angles make a flat line; complementary angles make an L-shaped corner.",
      "say": "Complementary angles add to ninety degrees, a square corner. If one is thirty-eight, the other is ninety minus thirty-eight, fifty-two."
    },
    {
      "kind": "try",
      "title": "Your turn: complementary",
      "body": "Two complementary angles. One is 60°. What is the other?",
      "say": "Two complementary angles. One is sixty degrees. What is the other?",
      "widget": {
        "w": "tapPick",
        "prompt": "They add to 90°, so…",
        "options": [
          {
            "label": "30°",
            "correct": true
          },
          {
            "label": "120°"
          },
          {
            "label": "40°"
          }
        ]
      }
    }
  ],
  "m.8.expon": [
    {
      "kind": "concept",
      "title": "Multiplying powers: add the exponents",
      "body": "When you multiply powers with the SAME base, add the exponents: x^5 × x^2 = x^(5+2) = x^7. It works because x^5 is five x’s and x^2 is two x’s — put together that is seven x’s multiplied in a row.",
      "analogy": "Five x’s next to two more x’s is seven x’s in a row.",
      "say": "To multiply powers with the same base, add the exponents. x to the fifth times x squared is x to the seventh."
    }
  ],
  "m.6.percent": [
    {
      "kind": "concept",
      "title": "From discount to the price you PAY",
      "body": "A discount is a percent OFF. First find that percent of the price — that is the dollars OFF. To get the price you actually PAY, subtract: pay = original − dollars off.",
      "analogy": "50% off a $100 jacket: 50% of 100 is $50 off, so you pay 100 − 50 = $50.",
      "say": "A discount is a percent off. Find that percent of the price for the dollars off, then subtract from the original to get what you pay."
    },
    {
      "kind": "example",
      "title": "Worked example: sale price",
      "body": "A $240 jacket is 60% off. What do you PAY?",
      "reveal": [
        "60% of 240 is 0.60 × 240 = 144 dollars off.",
        "Pay = original − off = 240 − 144.",
        "You pay $96."
      ],
      "say": "Sixty percent of two forty is one hundred forty-four off. Two forty minus one forty-four is ninety-six dollars."
    }
  ],
  "m.k.shapes": [
    {
      "kind": "show",
      "title": "Two more shapes: hexagon and star",
      "body": "A HEXAGON has 6 straight sides — like a patch on a soccer ball or a honeycomb cell. A STAR has points that poke out — like a starfish or a sheriff badge.",
      "say": "A hexagon has six sides, like a soccer ball patch. A star has points that poke out, like a starfish.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "⚽",
            "title": "Hexagon",
            "body": "6 straight sides."
          },
          {
            "emoji": "⭐",
            "title": "Star",
            "body": "Points that poke out."
          }
        ]
      }
    },
    {
      "kind": "try",
      "title": "Your turn: name the shape",
      "body": "What shape is a soccer ball patch?",
      "say": "What shape is a soccer ball patch?",
      "widget": {
        "w": "tapPick",
        "prompt": "Count the sides…",
        "options": [
          {
            "label": "Hexagon",
            "correct": true
          },
          {
            "label": "Circle"
          },
          {
            "label": "Star"
          }
        ]
      }
    }
  ],
  "e.1.rhyme": [
    {
      "kind": "concept",
      "title": "Count the Beats",
      "body": "Syllables are the word parts, or beats, you hear when you say a word. Clap as you say it: ap-ple has two claps, so \"apple\" has 2 syllables.",
      "say": "Syllables are the word parts, or beats, you hear when you say a word. Clap as you say it. Apple breaks into ap-ple. That is two claps, so apple has two syllables.",
      "analogy": "Syllables are like drum beats in a song. You tap once for each part of the word.",
      "widget": {
        "w": "tapPick",
        "prompt": "How many beats do you clap for \"tur-tle\"?",
        "options": [
          {
            "label": "2",
            "correct": true
          },
          {
            "label": "1"
          },
          {
            "label": "3"
          }
        ]
      }
    },
    {
      "kind": "show",
      "title": "Word Families and Ending Sounds",
      "body": "A word family is a group of words that share the same ending chunk, like bell, well, and shell in the -ell family, or fun, run, and bun in the -un family. You can also match just the very last sound: map and cup both end with the /p/ sound, and fish and dish both end with the /sh/ sound.",
      "say": "A word family is a group of words that share the same ending chunk. Bell, well, and shell all share the same ending chunk. Fun, run, and bun share their ending chunk too. You can also match just the very last sound. Map and cup both end with the puh sound, and fish and dish both end with the sh sound.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🔔",
            "title": "-ell family",
            "body": "bell, well, shell all end with the same -ell chunk."
          },
          {
            "emoji": "🐟",
            "title": "Last sound",
            "body": "fish and dish both end with the sh sound."
          }
        ]
      }
    },
    {
      "kind": "example",
      "title": "Sight Words Finish the Sentence",
      "body": "Sight words are little helper words we learn by heart, like is, has, and was. Read the whole sentence and pick the one that makes it make sense.",
      "say": "Sight words are little helper words we learn by heart, like is, has, and was. Read the whole sentence and pick the one that makes it make sense.",
      "reveal": [
        "Read the sentence: She blank a red hat.",
        "Try each word: She is a red hat. That does not sound right.",
        "Try: She has a red hat. That fits and makes sense.",
        "So the sight word that finishes the sentence is has."
      ]
    }
  ],
  "e.1.sentence": [
    {
      "kind": "concept",
      "title": "Sentences have different jobs",
      "body": "A sentence can TELL a fact and end with a period, ASK a question and end with a question mark ( ? ), SHOUT a strong feeling and end with an exclamation mark ( ! ), or COMMAND someone to do something.",
      "say": "A sentence can tell a fact and end with a period. It can ask a question and end with a question mark. It can shout a strong feeling, like excitement, and end with an exclamation mark. Or it can command someone to do something.",
      "analogy": "The end mark is like a face at the end of a sentence: a calm face for telling, a curious face for asking, and a big surprised face for shouting.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🗣️",
            "title": "Telling",
            "body": "Shares a fact. The rain fell all day. Ends with a period."
          },
          {
            "emoji": "❓",
            "title": "Asking",
            "body": "Asks something. Where is my backpack? Ends with a question mark."
          },
          {
            "emoji": "🎉",
            "title": "Shouting",
            "body": "Strong feeling. We won the game! Ends with an exclamation mark."
          },
          {
            "emoji": "👉",
            "title": "Command",
            "body": "Tells you to do a job. Close the door. Ends with a period."
          }
        ]
      }
    },
    {
      "kind": "example",
      "title": "Big letters have two jobs",
      "body": "Always start the FIRST word of a sentence with a capital letter, and always start a person's NAME with a capital letter too.",
      "say": "Always start the first word of a sentence with a capital letter. And always start a person's name with a capital letter too.",
      "reveal": [
        "Fix the start: tom has a dog becomes Tom has a dog.",
        "The very first word gets a big letter, so t becomes capital T.",
        "Tom is a person's name, so its T stays capital too.",
        "A whole correct sentence has a capital at the start and a period at the end, like I like ice cream."
      ]
    },
    {
      "kind": "try",
      "title": "Your turn: which is the question?",
      "body": "One of these sentences ASKS something and needs a question mark. Tap it.",
      "say": "One of these sentences asks something and needs a question mark. Tap it.",
      "widget": {
        "w": "tapPick",
        "prompt": "Which one is a question?",
        "options": [
          {
            "label": "Where is my backpack?",
            "correct": true
          },
          {
            "label": "I lost my backpack."
          },
          {
            "label": "Find the backpack!"
          }
        ]
      }
    }
  ],
  "e.1.story": [
    {
      "kind": "concept",
      "title": "Not every question asks why",
      "body": "Some questions ask what, where, or how. These do not need a because. They ask you to find a detail the story already tells you and point right at it.",
      "say": "Some questions ask what, where, or how. These do not need a because. They ask you to find a detail the story already tells you and point right at it.",
      "analogy": "It is like a treasure hunt. The answer is hiding in the words, and your job is to spot it.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🔎",
            "title": "What",
            "body": "The thing done or found"
          },
          {
            "emoji": "📍",
            "title": "Where",
            "body": "The place it happened"
          },
          {
            "emoji": "🛠️",
            "title": "How",
            "body": "The way it was done"
          }
        ]
      }
    },
    {
      "kind": "example",
      "title": "Match the question word to the story",
      "body": "To answer a what, where, or how question, find the key words from the question, then hunt for that same part in the story. The answer is sitting right there.",
      "say": "To answer a what, where, or how question, find the key words from the question, then hunt for that same part in the story. The answer is sitting right there.",
      "reveal": [
        "Story: When a dog barked, all the ducklings jumped in the water. They swam close to their mother until the dog left.",
        "Question: How did the ducklings stay safe?",
        "Key words: ducklings and safe.",
        "Hunt for that part: they swam close to their mother.",
        "Answer: They swam close to their mother."
      ]
    },
    {
      "kind": "try",
      "title": "Your turn: find the detail",
      "body": "Leo dug in the wet sand with his hands. He pulled out a smooth, pink shell and put it in his pail. Tap WHAT Leo found in the sand.",
      "say": "Leo dug in the wet sand with his hands. He pulled out a smooth, pink shell and put it in his pail. Tap what Leo found in the sand.",
      "widget": {
        "w": "tapPick",
        "prompt": "What did Leo find in the sand?",
        "options": [
          {
            "label": "A smooth, pink shell",
            "correct": true
          },
          {
            "label": "A gold coin"
          },
          {
            "label": "A tiny crab"
          }
        ]
      }
    }
  ],
  "e.1.vowels": [
    {
      "kind": "concept",
      "title": "Every vowel has a short sound",
      "body": "The short sound is quick and soft. Listen: short i says ih in fish, short e says eh in hen, short o says ah in dog, and short u says uh in cup.",
      "say": "The short sound is quick and soft. Listen. Short i says ih, like in fish. Short e says eh, like in hen. Short o says ah, like in dog. And short u says uh, like in cup.",
      "analogy": "A short sound is like a tiny tap, quick and light, not a long note.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🐟",
            "title": "fish",
            "body": "short i says ih"
          },
          {
            "emoji": "🐔",
            "title": "hen",
            "body": "short e says eh"
          },
          {
            "emoji": "🐶",
            "title": "dog",
            "body": "short o says ah"
          },
          {
            "emoji": "🐛",
            "title": "bug",
            "body": "short u says uh"
          }
        ]
      }
    },
    {
      "kind": "show",
      "title": "Two vowels make a team",
      "body": "When two vowels sit side by side, they team up to make one long sound. In boat, the o and a work together to say long o, the name of the letter o.",
      "say": "When two vowels sit side by side, they team up to make one long sound. In the word boat, the o and the a work together to say long o, the name of the letter o.",
      "analogy": "Two vowels together are like two friends singing one note at the same time."
    },
    {
      "kind": "example",
      "title": "Magic e makes a vowel say its name",
      "body": "A silent e at the end of a word is magic: it makes the vowel before it say its own long name. Add an e to pin and it becomes pine, so the i now says its name.",
      "say": "A silent e at the end of a word is magic. It makes the vowel before it say its own long name. Add an e to pin and it becomes pine, so the i now says its name.",
      "reveal": [
        "Start with pin. The i is short and says ih.",
        "Add a silent e at the end: p-i-n-e.",
        "Now the magic e makes the i long, so it says its name, and we read pine, a tall tree."
      ],
      "widget": {
        "w": "tapPick",
        "prompt": "Add a magic e. What does cap become?",
        "options": [
          {
            "label": "cape",
            "correct": true
          },
          {
            "label": "cap"
          },
          {
            "label": "cop"
          }
        ]
      }
    }
  ],
  "e.10.reading": [
    {
      "kind": "concept",
      "title": "Reading between the lines",
      "body": "In stories, meaning often hides in images, tone, and irony instead of plain statements. A planted sapling can stand for renewal, clipped punctuation can reveal hurt feelings, and a cheerful-sounding title can mean the very opposite of its words.",
      "say": "In stories, meaning often hides in images, tone, and irony instead of plain statements. A planted young tree can stand for renewal, short clipped punctuation can reveal hurt feelings, and a cheerful sounding title can mean the very opposite of its words.",
      "analogy": "It is like a friend saying a flat 'fine' when their face shows they are anything but fine.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🌳",
            "title": "Symbolism",
            "body": "An object stands for a bigger idea. A sapling growing over a grave means new life and endurance rising out of loss."
          },
          {
            "emoji": "✉️",
            "title": "Tone",
            "body": "Word choice and punctuation leak feeling. A flat, clipped 'Sure' with no excitement can signal that someone is hurt or upset."
          },
          {
            "emoji": "🔄",
            "title": "Irony",
            "body": "The real meaning is the opposite of the words. A title praising 'effort' may actually mock it when doing nothing won."
          }
        ]
      }
    },
    {
      "kind": "show",
      "title": "Weak evidence in disguise",
      "body": "Some claims feel strong but rest on nothing solid. Watch for popularity standing in for proof, for two things that merely happen together being sold as cause and effect, and for one lonely example stretched into a sweeping rule.",
      "say": "Some claims feel strong but rest on nothing solid. Watch for popularity standing in for proof, for two things that merely happen together being sold as cause and effect, and for one lonely example stretched into a sweeping rule.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "👥",
            "title": "Bandwagon",
            "body": "'Everyone knows this works' pressures you to agree. Popularity is not evidence; it offers a feeling, not a study or data."
          },
          {
            "emoji": "🔗",
            "title": "Correlation vs cause",
            "body": "Coffee drinkers who live longer may also exercise more. Things happening together is not proof that one caused the other."
          },
          {
            "emoji": "🍞",
            "title": "Hasty generalization",
            "body": "One failing bakery cannot prove a new law destroys all small businesses, especially when many other shops survived."
          }
        ]
      }
    },
    {
      "kind": "show",
      "title": "Language that hides the truth",
      "body": "Writers can dress up weak claims with soft or slippery words. Euphemisms make ugly things sound acceptable, vague 'weasel words' promise almost nothing, and a confident persona can be mistaken for real evidence.",
      "say": "Writers can dress up weak claims with soft or slippery words. Euphemisms make ugly things sound acceptable, vague weasel words promise almost nothing, and a confident persona can be mistaken for real evidence.",
      "analogy": "A shiny label can hide an empty box.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🕊️",
            "title": "Euphemism",
            "body": "A soft word like 'pacification' hides violence so an audience accepts the brutal reality it stands for."
          },
          {
            "emoji": "🥬",
            "title": "Weasel words",
            "body": "'Fresh' is barely regulated and has no fixed meaning, so it sounds impressive while promising the kitchen almost nothing."
          },
          {
            "emoji": "🎭",
            "title": "Persona vs proof",
            "body": "Charisma and self-citing press releases are not verified data. Investors who trust a confident pitch may be buying a persona, not a working product."
          }
        ]
      }
    }
  ],
  "e.10.rhetoric": [
    {
      "kind": "concept",
      "title": "Four appeals: ethos, logos, pathos, kairos",
      "body": "You already met ethos (trust). Logos persuades with logic, facts, and evidence; pathos moves the emotions; and kairos wins by stressing that the moment is right now, act before it is too late.",
      "say": "You already met ethos, which is trust. Logos persuades with logic, facts, and evidence. Pathos moves the emotions. And kairos wins by stressing that the moment is right now, that we must act before it is too late.",
      "analogy": "Kairos is like a coach shouting take the shot now, the window is closing, the timing itself is the argument.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🧠",
            "title": "Logos",
            "body": "Logic, data, reasoned proof. Shares a root with 'logic'."
          },
          {
            "emoji": "❤️",
            "title": "Pathos",
            "body": "Stirs feelings like fear, pride, or pity."
          },
          {
            "emoji": "⏰",
            "title": "Kairos",
            "body": "Seizes the urgent, opportune moment: act now."
          }
        ]
      }
    },
    {
      "kind": "show",
      "title": "Devices that shade or borrow meaning",
      "body": "A euphemism softens a harsh idea (firing becomes 'let go'). An allusion borrows meaning by pointing to a famous event or story (crossing the Rubicon). Verbal irony, or sarcasm, says the opposite of what is meant to mock. An analogy explains something new by comparing it to something familiar, and antithesis pins opposite ideas side by side in parallel wording.",
      "say": "A euphemism softens a harsh idea, so firing becomes let go. An allusion borrows meaning by pointing to a famous event or story, like crossing the Rubicon. Verbal irony, or sarcasm, says the opposite of what is meant in order to mock. An analogy explains something new by comparing it to something familiar. And antithesis pins opposite ideas side by side in parallel wording.",
      "analogy": "Antithesis is a see-saw: two opposite ideas balanced in matching form, like ask not what your country can do for you; ask what you can do for your country.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🧭",
            "title": "Euphemism",
            "body": "Gentle wording for a blunt truth: 'let go' for fired."
          },
          {
            "emoji": "🏛️",
            "title": "Allusion",
            "body": "Nods to a known event or work to add meaning."
          },
          {
            "emoji": "🙄",
            "title": "Sarcasm / verbal irony",
            "body": "Says the opposite of the point to mock: 'Oh, wonderful.'"
          },
          {
            "emoji": "⚖️",
            "title": "Analogy vs. antithesis",
            "body": "Analogy compares to clarify; antithesis balances opposites in parallel form."
          }
        ]
      }
    },
    {
      "kind": "concept",
      "title": "Weighing evidence and fighting fair",
      "body": "Anecdotal evidence leans on one personal story instead of broad data, so it is weak proof. Dense jargon reveals the audience: unexplained technical terms signal expert readers. And a fair arguer uses concession, granting the other side a point, then returns to the issue, unlike an ad hominem (attacking the person) or a straw man (distorting their real claim).",
      "say": "Anecdotal evidence leans on one personal story instead of broad data, so it is weak proof. Dense jargon reveals the audience, because unexplained technical terms signal expert readers. And a fair arguer uses concession, granting the other side a point and then returning to the issue, unlike attacking the person or distorting their real claim.",
      "analogy": "Concession is a chess player nodding at your good move, then playing the board instead of insulting you.",
      "widget": {
        "w": "tapPick",
        "prompt": "\"My uncle survived a crash because he was thrown clear, so I distrust crash-test stats.\" This is which technique?",
        "options": [
          {
            "label": "Anecdotal evidence",
            "correct": true
          },
          {
            "label": "Statistical evidence"
          },
          {
            "label": "Expert testimony"
          }
        ]
      }
    }
  ],
  "e.10.vocab": [
    {
      "kind": "example",
      "title": "Let the sentence prove the word",
      "body": "When a sentence shows a cause, a result, or a contrast, it quietly defines the hard word for you. Read the whole sentence, find that clue, then match it to a choice.",
      "say": "When a sentence shows a cause, a result, or a contrast, it quietly defines the hard word for you. Read the whole sentence, find that clue, then match it to a choice.",
      "reveal": [
        "As a NOVICE climber, she stuck to the easiest routes. Clue: only easy routes, so she is new to this. Novice means a beginner.",
        "The negotiations reached an IMPASSE, and neither side would move. Clue: nobody moves, so nothing can advance. Impasse means a deadlock with no progress possible.",
        "The survivors were RESILIENT, rebuilding their homes within a year. Clue: they bounced back fast. Resilient means able to recover quickly."
      ]
    },
    {
      "kind": "example",
      "title": "Follow the result the word causes",
      "body": "Sometimes the clue is what happens because of the trait. Ask what result the sentence describes, then pick the meaning that would cause it.",
      "say": "Sometimes the clue is what happens because of the trait. Ask what result the sentence describes, then pick the meaning that would cause it.",
      "reveal": [
        "His TENACIOUS pursuit of the record, five failed attempts then success, showed his character. Clue: he kept trying after failing. Tenacious means persistently unwilling to give up.",
        "The dark clouds and sudden silence felt OMINOUS to the campers. Clue: dark clouds warn of a coming storm. Ominous means threatening or suggesting trouble.",
        "New evidence finally VINDICATED the accused man. Clue: evidence clears the accused. Vindicate means to clear from blame.",
        "His story sounded PLAUSIBLE, so the officer wrote it down without doubt. Clue: it was accepted without doubt. Plausible means believable and reasonable.",
        "The hikers faced an ARDUOUS climb up the steep, rocky trail. Clue: steep and rocky demands great effort. Arduous means difficult and demanding."
      ]
    },
    {
      "kind": "example",
      "title": "When the sentence gives thin clues",
      "body": "A few sentences barely hint at the meaning, so you lean on word roots and what you already know about how the word is used. Combine any small clue with prior knowledge to reason toward the answer.",
      "say": "A few sentences barely hint at the meaning, so you lean on word roots and what you already know about how the word is used. Combine any small clue with prior knowledge to reason toward the answer.",
      "analogy": "It is like guessing a song from two notes: the notes help, but you also use songs you already know.",
      "reveal": [
        "Smartphones have become UBIQUITOUS in modern classrooms. Thin clue: only says they are common now. Prior knowledge: ubiquitous describes something found in every place. Ubiquitous means present everywhere.",
        "After months of drought, the ancient irrigation method proved OBSOLETE. Thin clue: it is ancient and stopped working. Prior knowledge: obsolete labels outdated tools replaced by better ones. Obsolete means no longer useful or in use."
      ],
      "widget": {
        "w": "tapPick",
        "prompt": "Smartphones have become UBIQUITOUS in modern classrooms. Ubiquitous means...",
        "options": [
          {
            "label": "present everywhere",
            "correct": true
          },
          {
            "label": "rarely seen"
          },
          {
            "label": "strictly forbidden"
          }
        ]
      }
    }
  ],
  "e.11.satvocab": [
    {
      "kind": "concept",
      "title": "Two clues hide in every sentence",
      "body": "You cannot memorize every SAT word, but you rarely have to. Each sentence hides two clues: the context (nearby words that hint at the meaning) and the word's own parts, like prefixes and roots.",
      "say": "You cannot memorize every S A T word, but you rarely have to. Each sentence hides two clues. First is the context, meaning the nearby words that hint at what the term means. Second is the word's own parts, like its prefix and root.",
      "analogy": "It is like guessing a movie from both the trailer and the title at the same time.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🔍",
            "title": "Context clue",
            "body": "Rusted railings and crumbling supports tell you DILAPIDATED means fallen into ruin."
          },
          {
            "emoji": "🧩",
            "title": "Word part",
            "body": "The prefix im in IMPARTIAL means not, so it means not partial, that is, fair to all sides."
          }
        ]
      }
    },
    {
      "kind": "example",
      "title": "Read the clue, crack the word",
      "body": "Watch how the words around each SAT term reveal its meaning, and notice the prefixes that flip a word to its opposite.",
      "say": "Watch how the words around each S A T term reveal its meaning, and notice the prefixes that can flip a word to its opposite.",
      "reveal": [
        "DILAPIDATED: rusted and crumbling point to decay, so it means fallen into ruin or disrepair.",
        "ESOTERIC: it puzzled most friends, so it means understood by only a small, specialized group.",
        "GREGARIOUS: she was the natural host, so it means sociable and enjoying company.",
        "EBULLIENT: the crowd was cheering, so it means overflowing with enthusiasm.",
        "PLACATE: refunds and an apology were offered, so it means to calm or soothe someone's anger.",
        "IMPARTIAL: prefix im means not, plus partial, so it means fair and not favoring one side.",
        "EQUIVOCAL: root equi means equal, so the answer works two ways, meaning deliberately unclear.",
        "ERUDITE: the lecture cited texts few had heard of, so it means showing deep learning and scholarship.",
        "PROLIFIC: three novels in two years is a huge amount, so it means producing a great amount.",
        "IRREVERENT: prefix ir means not, plus reverent, so it means showing a lack of proper respect."
      ]
    },
    {
      "kind": "try",
      "title": "Your turn to use the clues",
      "body": "The diplomat gave an EQUIVOCAL answer, leaving both sides unsure where she stood. Use the root equi, meaning equal, and the context of confusion.",
      "say": "The diplomat gave an equivocal answer, leaving both sides unsure where she stood. Use the root equi, meaning equal, and the context of confusion. What does equivocal mean?",
      "widget": {
        "w": "tapPick",
        "prompt": "EQUIVOCAL most nearly means…",
        "options": [
          {
            "label": "deliberately unclear, open to more than one meaning",
            "correct": true
          },
          {
            "label": "blunt and perfectly clear"
          },
          {
            "label": "loud and aggressive"
          }
        ]
      }
    }
  ],
  "e.12.style": [
    {
      "kind": "concept",
      "title": "Words carry feeling and pictures",
      "body": "Every word has a connotation, the emotional shading it drags along: \"stingy,\" \"frugal,\" \"thrifty,\" and \"economical\" all describe careful spending, but only \"stingy\" insults while the others praise. Words also differ in concreteness, and concrete diction wins: \"The Labrador bolted across the muddy soccer field\" lets a reader see it, while \"The animal moved across the area\" is a blur.",
      "say": "Every word has a connotation, the emotional shading it drags along. Stingy, frugal, thrifty, and economical all describe careful spending, but only stingy insults, while the others praise. Words also differ in how concrete they are, and concrete words win. The Labrador bolted across the muddy soccer field lets a reader see it, while the animal moved across the area is just a blur.",
      "analogy": "Picking a word is like picking paint: same wall, but the shade sets the mood.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🎭",
            "title": "Connotation",
            "body": "Frugal praises the saver; stingy attacks them. Same habit, opposite feeling."
          },
          {
            "emoji": "🔎",
            "title": "Concreteness",
            "body": "Name exact things: Labrador and bolted beat animal and moved every time."
          }
        ]
      }
    },
    {
      "kind": "concept",
      "title": "Own the doer, and match the room",
      "body": "Prefer active voice that names the doer: \"The planning team made mistakes\" assigns clear responsibility, while \"Mistakes were made by the planning team\" hides behind the passive. Then match tone to the room: a research report opens objectively (\"This study examines the effects of sleep deprivation on memory\"), an application essay should sound like your real, specific voice rather than a thesaurus, and prickly email phrasing like \"as per my last message\" reads as passive-aggressive, so choose plainer, kinder wording.",
      "say": "Prefer active voice that names the doer. The planning team made mistakes assigns clear responsibility, while mistakes were made by the planning team hides behind the passive. Then match tone to the room. A research report opens objectively, saying this study examines the effects of sleep deprivation on memory. An application essay should sound like your real, specific voice rather than a thesaurus. And prickly email phrasing, like as per my last message, reads as passive-aggressive, so choose plainer, kinder wording.",
      "widget": {
        "w": "tapPick",
        "prompt": "Which revision removes the passive voice from \"Mistakes were made by the planning team\"?",
        "options": [
          {
            "label": "The planning team made mistakes.",
            "correct": true
          },
          {
            "label": "Mistakes had been made by the planning team."
          },
          {
            "label": "It was the planning team by whom mistakes were made."
          }
        ]
      }
    },
    {
      "kind": "example",
      "title": "Revision habits that catch what your eye skips",
      "body": "Reading a draft aloud lets your ear catch clunky rhythm and awkward phrasing that your eye glides right over. Open with an anecdote only when it ties clearly to your main idea, and watch for mixed metaphors that blend two sayings by accident.",
      "say": "Reading a draft aloud lets your ear catch clunky rhythm and awkward phrasing that your eye glides right over. Open with an anecdote only when it ties clearly to your main idea, and watch for mixed metaphors that blend two sayings by accident.",
      "reveal": [
        "Read it aloud: if you stumble saying it, your reader will stumble reading it.",
        "Anecdote check: keep the opening story only if its details point straight at your thesis.",
        "Mixed metaphor: \"We'll burn that bridge when we get to it\" wrongly fuses two idioms.",
        "Fixed: \"We'll cross that bridge when we get to it\" restores the real saying about postponing a problem."
      ]
    }
  ],
  "e.12.synthesis": [
    {
      "kind": "concept",
      "title": "The Toulmin frame",
      "body": "Every argument has three moving parts: the claim (the point you want to prove), the data (the evidence you offer), and the warrant (the unstated assumption that explains why that evidence actually supports the claim). The warrant is the reasoning link between your data and your point.",
      "say": "Every argument has three moving parts. The claim is the point you want to prove. The data is the evidence you offer. And the warrant is the unstated assumption that explains why that evidence actually supports the claim. The warrant is the reasoning link between your data and your point.",
      "analogy": "The warrant is like a bridge: your data stands on one bank, your claim on the other, and the warrant is the span that lets a reader walk from one to the other.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🎯",
            "title": "Claim",
            "body": "The point you are trying to prove."
          },
          {
            "emoji": "📊",
            "title": "Data",
            "body": "The evidence you put forward as support."
          },
          {
            "emoji": "🌉",
            "title": "Warrant",
            "body": "The hidden assumption linking the data to the claim."
          }
        ]
      }
    },
    {
      "kind": "concept",
      "title": "Choose and cite sources honestly",
      "body": "A primary source gives firsthand, original evidence, like a diary, an interview, or a study's raw data, while a secondary source interprets or analyzes that material, like a historian's essay. Paraphrase to compress a source's idea in your own words, but quote directly when the exact wording is especially precise, memorable, or authoritative. When two strong sources directly disagree, do not hide it; name the tension and use your own analysis to explain or resolve it for the reader.",
      "say": "A primary source gives firsthand, original evidence, like a diary, an interview, or a study's raw data. A secondary source interprets or analyzes that material, like a historian's essay. Paraphrase to compress a source's idea in your own words, but quote directly when the exact wording is especially precise, memorable, or authoritative. And when two strong sources directly disagree, do not hide it. Name the tension and use your own analysis to explain or resolve it for the reader.",
      "analogy": "A diary written during a battle is primary; a book explaining that battle years later is secondary.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "📜",
            "title": "Primary",
            "body": "Firsthand, original evidence from the moment or source itself."
          },
          {
            "emoji": "🔎",
            "title": "Secondary",
            "body": "A later work that interprets or analyzes the original."
          }
        ]
      }
    },
    {
      "kind": "show",
      "title": "Argue fair and tight",
      "body": "Take on the steel man, the strongest version of the opposing view, not a weak straw man distortion; then use refutation, raising that counterargument and showing why your position still holds. Keep your thesis nuanced by admitting the real complications while still committing to a clear, defensible stance. And avoid circular reasoning, where a premise simply assumes the very conclusion it is supposed to prove.",
      "say": "Take on the steel man, the strongest version of the opposing view, not a weak straw man distortion. Then use refutation: raise that counterargument and show why your position still holds. Keep your thesis nuanced by admitting the real complications while still committing to a clear, defensible stance. And avoid circular reasoning, where a premise simply assumes the very conclusion it is supposed to prove.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🛡️",
            "title": "Steel man",
            "body": "Face the opponent's strongest, fairest case and answer it."
          },
          {
            "emoji": "🥤",
            "title": "Straw man",
            "body": "A weak distortion of the other side that is easy to knock down."
          }
        ]
      }
    }
  ],
  "e.2.contractions": [
    {
      "kind": "concept",
      "title": "The \"not\" family: n't",
      "body": "When a word teams up with \"not,\" the \"o\" jumps out and an apostrophe takes its spot, right between the n and the t. So \"should not\" becomes \"shouldn't,\" \"has not\" becomes \"hasn't,\" \"have not\" becomes \"haven't,\" and \"does not\" becomes \"doesn't.\"",
      "say": "When a word teams up with the word not, the letter o jumps out and an apostrophe takes its spot, right between the n and the t. So should not becomes shouldn't, has not becomes hasn't, have not becomes haven't, and does not becomes doesn't.",
      "analogy": "The apostrophe is a tiny bookmark sitting exactly where the o used to be.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🚫",
            "title": "should not",
            "body": "shouldn't"
          },
          {
            "emoji": "🚫",
            "title": "does not",
            "body": "doesn't"
          },
          {
            "emoji": "🚫",
            "title": "have not",
            "body": "haven't"
          }
        ]
      }
    },
    {
      "kind": "example",
      "title": "Helper words: 'll, 've, 're",
      "body": "Some contractions squish a word with a helper word. \"'ll\" means \"will\" (he will becomes he'll), \"'ve\" means \"have\" (they have becomes they've), and \"'re\" means \"are\" (you are becomes you're).",
      "say": "Some contractions squish a word with a helper word. The ending l l means will, so he will becomes he'll. The ending v e means have, so they have becomes they've. The ending r e means are, so you are becomes you're.",
      "reveal": [
        "he + will: drop the w-i, add an apostrophe, and get he'll.",
        "they + have: drop the h-a, add an apostrophe, and get they've.",
        "you + are: drop the a, add an apostrophe, and get you're."
      ]
    },
    {
      "kind": "try",
      "title": "The 's family, and your turn",
      "body": "The ending \"'s\" can mean \"is,\" like \"here is\" becomes \"here's.\" But watch out: \"let's\" is special and means \"let us,\" like \"Let's go!\"",
      "say": "The ending s can mean is, like here is becomes here's. But watch out: let's is special and means let us, like Let's go.",
      "widget": {
        "w": "tapPick",
        "prompt": "\"They have not eaten.\" Which word means \"have not\"?",
        "options": [
          {
            "label": "haven't",
            "correct": true
          },
          {
            "label": "hasn't"
          },
          {
            "label": "hadn't"
          }
        ]
      }
    }
  ],
  "e.2.nounsverbs": [
    {
      "kind": "concept",
      "title": "Verbs are action words",
      "body": "A verb is the action in a sentence: it tells what someone or something does, like jump, flip, run, or eat. In \"The chef flips the pancake,\" the verb is flips because that is what the chef DOES.",
      "say": "A verb is the action in a sentence. It tells what someone or something does, like jump, flip, run, or eat. In the chef flips the pancake, the verb is flips because that is what the chef does.",
      "analogy": "If a noun is the player, the verb is the move the player makes.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🧍",
            "title": "Noun",
            "body": "chef, table, park, skateboard"
          },
          {
            "emoji": "🏃",
            "title": "Verb",
            "body": "jump, flip, run, climb"
          }
        ]
      }
    },
    {
      "kind": "show",
      "title": "Verbs change for time and for how many",
      "body": "A verb can tell WHEN: for the past use ate, not eat, as in \"Last night I ate my dinner.\" A verb also matches HOW MANY: with many dogs (plural) use the plain verb bark, so \"The dogs bark,\" but with one dog use barks.",
      "say": "A verb can tell when. For the past we say ate, not eat, as in last night I ate my dinner. A verb also matches how many. With many dogs we use the plain verb bark, so the dogs bark. With one dog we say barks.",
      "reveal": [
        "One dog barks. Many dogs bark. Add s to the verb only for ONE.",
        "Words like last night or yesterday mean it already happened, so use the past: eat becomes ate."
      ]
    },
    {
      "kind": "example",
      "title": "Some plurals change in special ways",
      "body": "Many nouns add s to mean more than one, but some change in a special way instead. Learn these tricky ones: child becomes children, tooth becomes teeth, mouse becomes mice, and a word ending in f like leaf becomes leaves.",
      "say": "Many nouns add s to mean more than one, but some change in a special way instead. Learn these tricky ones: child becomes children, tooth becomes teeth, mouse becomes mice, and a word ending in f like leaf becomes leaves.",
      "reveal": [
        "One child, two children (not childs).",
        "One tooth, two teeth (the middle sound changes).",
        "One mouse, two mice (it changes completely).",
        "One leaf, two leaves (the f changes to v before adding es)."
      ]
    }
  ],
  "e.2.reading": [
    {
      "kind": "concept",
      "title": "Be a text detective",
      "body": "Not every question asks for the main idea. Some ask for a detail, why something happens, or what happens next. For these, look BACK at the words and find the exact spot that answers the question.",
      "say": "Not every question asks for the main idea. Some ask for a detail, why something happens, or what happens next. For these, look back at the words and find the exact spot that answers the question.",
      "analogy": "Like a detective, you go back to the scene and point to the clue in the sentence.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🔍",
            "title": "Right there",
            "body": "For a detail or a 'why', the answer is stated in the sentences. Reread and point to it."
          },
          {
            "emoji": "➡️",
            "title": "Order words",
            "body": "Words like first, then, next, and after tell you what happens in order."
          }
        ]
      }
    },
    {
      "kind": "example",
      "title": "Use clues to figure it out",
      "body": "Some questions are not spelled out. To find how a character feels, what they want, what kind of person they are, or what happens next, add up the clues about what they DO.",
      "say": "Some questions are not spelled out. To find how a character feels, what they want, what kind of person they are, or what happens next, add up the clues about what they do.",
      "reveal": [
        "A dog scratches the door and stares outside. Clue plus clue means it wants to go outside.",
        "A girl shares her crayons and helps a new boy. Helping others shows she is kind.",
        "The sky is dark and thunder booms, so someone grabs an umbrella. The clues tell you it will probably rain next."
      ]
    },
    {
      "kind": "try",
      "title": "Your turn: use the clues",
      "body": "Read and tap the best answer using what the character does.",
      "say": "Read the sentences. Max lost the race, but he shook hands with the winner and said good race. Tap the words that tell what kind of person Max is.",
      "widget": {
        "w": "tapPick",
        "prompt": "Max lost the race, but he shook hands with the winner and said 'good race.' What kind of person is Max?",
        "options": [
          {
            "label": "A good sport",
            "correct": true
          },
          {
            "label": "A sore loser"
          },
          {
            "label": "A show-off"
          }
        ]
      }
    }
  ],
  "e.2.stories": [
    {
      "kind": "concept",
      "title": "Read closely to find the facts",
      "body": "Many questions ask what happened or where something is. The answer is right there in the story, so read closely and point to the exact words that tell you.",
      "say": "Many questions ask what happened, or where something is. The answer is right there in the story. So read closely and point to the exact words that tell you.",
      "analogy": "It is like a treasure hunt. The answer is hidden in the words, and you find it by looking back.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "❓",
            "title": "The question",
            "body": "Where did Maya put her pot?"
          },
          {
            "emoji": "🔎",
            "title": "The clue",
            "body": "The story says she set it by the sunny window."
          }
        ]
      }
    },
    {
      "kind": "concept",
      "title": "How does the character feel, and why?",
      "body": "Stories show how people feel, like nervous, proud, or brave, and they tell why a character does something. Look for feeling words and for the word because to find the reason.",
      "say": "Stories show how people feel, like nervous, proud, or brave. They also tell why a character does something. Look for feeling words, and for the word because, to find the reason.",
      "analogy": "A character's feelings are like the weather in the story. Sunny and happy, or cloudy and scared, they can change from the start to the end.",
      "widget": {
        "w": "tapPick",
        "prompt": "Sam moved the snail to the grass. Why?",
        "options": [
          {
            "label": "He worried a bike might roll over it",
            "correct": true
          },
          {
            "label": "He wanted to race it"
          },
          {
            "label": "He thought it was hungry"
          }
        ]
      }
    },
    {
      "kind": "example",
      "title": "What does the story teach?",
      "body": "Sometimes a whole story teaches one big lesson or main idea. Think about what the character learned or did smartly, and put it in your own words.",
      "say": "Sometimes a whole story teaches one big lesson, or main idea. Think about what the character learned, or did smartly, and put it in your own words.",
      "reveal": [
        "Rosa sold cold lemonade on a hot day and sold out.",
        "The next day was rainy and cold, so she sold hot cocoa instead.",
        "She sold out again by matching what she sold to the weather.",
        "The lesson: sell what people need that day."
      ]
    }
  ],
  "e.2.vocab": [
    {
      "kind": "concept",
      "title": "Some words are opposites",
      "body": "Sometimes a word has no sentence to give you clues, and it just asks for the OPPOSITE. An opposite is a word that means the totally different thing, like up and down or hot and cold.",
      "say": "Sometimes a word has no sentence to give you clues, and it just asks for the opposite. An opposite is a word that means the totally different thing, like up and down or hot and cold.",
      "analogy": "Opposites are like two ends of a seesaw. When one side goes all the way up, the other side goes all the way down.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🔊",
            "title": "noisy",
            "body": "full of loud sound"
          },
          {
            "emoji": "🤫",
            "title": "quiet",
            "body": "the opposite: almost no sound"
          }
        ]
      }
    },
    {
      "kind": "example",
      "title": "Find the opposite",
      "body": "To find an opposite, first say what the word means, then flip it to the other end. Ask yourself which choice means the very different thing.",
      "say": "To find an opposite, first say what the word means, then flip it to the other end. Ask yourself which choice means the very different thing.",
      "reveal": [
        "Empty means nothing is inside.",
        "Flip it: what means the pail has stuff all the way up?",
        "The opposite of empty is full.",
        "Ancient means very, very old.",
        "Flip it: what means made just now?",
        "The opposite of ancient is brand-new."
      ]
    },
    {
      "kind": "try",
      "title": "Your turn: pick the opposite",
      "body": "Read the word, say what it means, then choose the word that means the opposite.",
      "say": "Read the word, say what it means, then choose the word that means the opposite.",
      "widget": {
        "w": "tapPick",
        "prompt": "What is the OPPOSITE of \"noisy\"?",
        "options": [
          {
            "label": "quiet",
            "correct": true
          },
          {
            "label": "loud"
          },
          {
            "label": "fast"
          }
        ]
      }
    }
  ],
  "e.3.prefix": [
    {
      "kind": "concept",
      "title": "More prefixes to glue on the front",
      "body": "Un- is not the only prefix. Dis- and in- both mean not, semi- means half, over- means too much, and under- means below. So disobey means not obey, invisible means not able to be seen, and a semicircle is half a circle.",
      "say": "Un is not the only prefix. Dis and in both mean not. Semi means half. Over means too much. And under means below. So disobey means not obey, invisible means not able to be seen, and a semicircle is half a circle.",
      "analogy": "Each prefix is like a different colored sticker you press on the front of a word to change what it means.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🚫",
            "title": "dis- / in-",
            "body": "not: disobey = not obey, invisible = not seen"
          },
          {
            "emoji": "◐",
            "title": "semi-",
            "body": "half: semicircle = half a circle"
          },
          {
            "emoji": "⬆️",
            "title": "over- / under-",
            "body": "over = too much, under = below: overcook, underground"
          }
        ]
      }
    },
    {
      "kind": "concept",
      "title": "A suffix changes the END",
      "body": "A suffix is a little piece you glue to the END of a word instead of the front. -Ful means full of, -y means having, -ish means like, and -ly means in a certain way. So careful means full of care and cloudy means having clouds.",
      "say": "A suffix is a little piece you glue to the end of a word instead of the front. Ful means full of. Y means having. Ish means like. And ly means in a certain way. So careful means full of care, and cloudy means having clouds.",
      "analogy": "If a prefix is a hat you put on the front of a word, a suffix is the shoes you add to the back.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🪣",
            "title": "-ful",
            "body": "full of: careful = full of care"
          },
          {
            "emoji": "☁️",
            "title": "-y",
            "body": "having: cloudy = having clouds"
          },
          {
            "emoji": "🧒",
            "title": "-ish",
            "body": "like: childish = like a child"
          },
          {
            "emoji": "🤫",
            "title": "-ly",
            "body": "in a __ way: quietly = in a quiet way"
          }
        ]
      }
    },
    {
      "kind": "example",
      "title": "Add up the parts",
      "body": "Break a word into its parts and add their meanings, whether the piece is on the front or the back. Try it with over-, -ful, and -ly.",
      "say": "Break a word into its parts and add their meanings, whether the piece is on the front or the back. Try it with over, ful, and ly.",
      "reveal": [
        "over + cook = overcook. Over- means too much, so overcook means to cook too much.",
        "care + ful = careful. -Ful means full of, so careful means full of care.",
        "quiet + ly = quietly. -Ly means in a certain way, so quietly means in a quiet way."
      ]
    }
  ],
  "e.3.reading": [
    {
      "kind": "concept",
      "title": "Actions and words are clues",
      "body": "A story rarely says 'she felt proud' straight out. Instead it shows a character's actions and words, and you infer the feeling, the kind of person they are, or the lesson their action teaches.",
      "say": "A story rarely tells you a feeling straight out. Instead it shows what a character does and says, and you figure out how they feel, what kind of person they are, or what lesson their action teaches.",
      "analogy": "It is like being a detective: you read the clues and figure out what the author did not spell out.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "😊",
            "title": "Feeling",
            "body": "Maya jumped for joy after a big star, so she feels proud and happy."
          },
          {
            "emoji": "💛",
            "title": "Kind of person",
            "body": "Sam left cookies and a kind note, so Sam is caring and thoughtful."
          },
          {
            "emoji": "🤝",
            "title": "Lesson",
            "body": "Ravi shared his sandwich, teaching that good friends help each other."
          }
        ]
      }
    },
    {
      "kind": "concept",
      "title": "Similes: comparing with like or as",
      "body": "A simile compares two things using the word 'like' or 'as' to paint a picture. 'The market buzzed like a beehive' means the market was busy and noisy, and 'as quiet as a whisper' means very quiet.",
      "say": "A simile compares two things using the word like or as to paint a picture. The market buzzed like a beehive means the market was busy and noisy. As quiet as a whisper means very quiet.",
      "analogy": "A simile is like holding two pictures next to each other so you notice how they are alike."
    },
    {
      "kind": "example",
      "title": "Use nearby clues for tricky phrases",
      "body": "When a phrase is not literal, the sentences around it tell you what it really means. 'Disaster zone' and 'thirsty garden' are not about real disasters or drinks, so read the clues nearby.",
      "say": "When a phrase does not mean exactly what it says, the sentences around it tell you what it really means. Disaster zone and thirsty garden are not about a real disaster or a real drink, so read the clues nearby.",
      "reveal": [
        "Ben's room was a 'disaster zone.' The next words say toys covered the floor and clothes hung from every chair.",
        "Those clues mean the room was very messy, not on fire.",
        "The garden was 'thirsty.' The flowers drooped and the soil cracked in the sun.",
        "Drooping and cracked soil are clues that the garden needs water."
      ],
      "widget": {
        "w": "tapPick",
        "prompt": "'Papa reads me one more story even when he is tired. He says it is his favorite part of the day.' How does Papa feel about story time?",
        "options": [
          {
            "label": "He loves and treasures it",
            "correct": true
          },
          {
            "label": "He thinks it is boring"
          },
          {
            "label": "He wishes it would end"
          }
        ]
      }
    }
  ],
  "e.4.figurative": [
    {
      "kind": "concept",
      "title": "Hyperbole: wild exaggeration",
      "body": "Hyperbole is an exaggeration so big that nobody means it for real, like \"I'm so hungry I could eat a horse.\" It stretches the truth way past what is possible to show a strong feeling.",
      "say": "Hyperbole is an exaggeration so big that nobody means it for real, like saying you are so hungry you could eat a horse. It stretches the truth way past what is possible to show a strong feeling.",
      "analogy": "It is like turning the volume knob all the way up. The words get louder than the real truth on purpose.",
      "widget": {
        "w": "tapPick",
        "prompt": "Which line is hyperbole?",
        "options": [
          {
            "label": "I've told you a million times to clean up!",
            "correct": true
          },
          {
            "label": "I told you twice to clean up."
          },
          {
            "label": "Please clean up your room."
          }
        ]
      }
    },
    {
      "kind": "example",
      "title": "Metaphor and simile",
      "body": "A metaphor says one thing IS another, like \"The classroom was a zoo\" or \"Her hair was silk.\" A simile compares using the words like or as, such as \"quiet as a mouse.\"",
      "say": "A metaphor says one thing is another, like the classroom was a zoo, or her hair was silk. A simile compares using the words like or as, such as quiet as a mouse.",
      "reveal": [
        "Read the metaphor: \"Her hair was silk against the pillow.\"",
        "Her hair is not really made of silk, so this is a comparison.",
        "Think about what silk is like: smooth and soft to touch.",
        "So the metaphor means her hair was very smooth and soft.",
        "Check for like or as: there are none, so it is a metaphor, not a simile."
      ],
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🟰",
            "title": "Metaphor",
            "body": "Says it IS the thing. \"The room was a zoo.\" No like or as."
          },
          {
            "emoji": "🔗",
            "title": "Simile",
            "body": "Compares with like or as. \"The room was like a zoo.\""
          }
        ]
      }
    },
    {
      "kind": "concept",
      "title": "Idioms and sound words",
      "body": "An idiom is a phrase whose real meaning is hidden and is not the literal words: \"raining cats and dogs\" means raining very hard, \"give me a hand\" means help, and \"cutting it close\" means barely leaving enough time. Onomatopoeia is a different tool, a word that copies a real sound, like buzz, crash, or drum.",
      "say": "An idiom is a phrase whose real meaning is hidden and is not the literal words. Raining cats and dogs means raining very hard, give me a hand means help, and cutting it close means barely leaving enough time. Onomatopoeia is a different tool, a word that copies a real sound, like buzz, crash, or drum.",
      "analogy": "An idiom is like a secret code. The words on the outside hide a totally different meaning on the inside."
    }
  ],
  "e.4.mainidea": [
    {
      "kind": "concept",
      "title": "The main idea usually leads the way",
      "body": "Most of the time, the main idea sits in the very first sentence of a paragraph, called the topic sentence. After it, the writer adds supporting details that prove or explain it.",
      "say": "Most of the time, the main idea sits in the very first sentence of a paragraph. We call it the topic sentence. After it, the writer adds supporting details that prove or explain it.",
      "analogy": "It is like a headline at the top of a news story: the big point comes first, then the details fill it in.",
      "widget": {
        "w": "tapPick",
        "prompt": "Where does a paragraph's main idea sentence most often appear?",
        "options": [
          {
            "label": "At the beginning, as the topic sentence",
            "correct": true
          },
          {
            "label": "Always in the exact middle"
          },
          {
            "label": "Hidden in a footnote"
          }
        ]
      }
    },
    {
      "kind": "example",
      "title": "Sometimes the main idea is unstated",
      "body": "If no sentence tells the big point, look at what all the details have in common and say it in your own words. Ask: what one idea do every detail add up to?",
      "say": "Sometimes no sentence tells the big point. When that happens, look at what all the details have in common and say it in your own words. Ask yourself what one idea every detail adds up to.",
      "reveal": [
        "Details: strong back legs push them far, long tails help them balance, they hop for miles without tiring.",
        "What do they share? Every detail is about a kangaroo's body helping it jump.",
        "Unstated main idea: A kangaroo's body is built for jumping."
      ]
    },
    {
      "kind": "show",
      "title": "Pick a title that fits every detail",
      "body": "A good title is the main idea in a few words, so it must cover all the details, not just one. Cross out any title that matches only a single detail or something the paragraph never mentions.",
      "say": "A good title is the main idea in just a few words, so it must cover all the details, not just one. Cross out any title that matches only a single detail, or something the paragraph never mentions.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "✅",
            "title": "Fits every detail",
            "body": "Built to Jump: The Kangaroo covers the legs, tail, and long hops all together."
          },
          {
            "emoji": "❌",
            "title": "Too narrow or off topic",
            "body": "What Kangaroos Eat is never mentioned, so it cannot be the title."
          }
        ]
      }
    }
  ],
  "e.5.pov": [
    {
      "kind": "concept",
      "title": "Why did the author write this? PIE",
      "body": "Every author has a purpose, and you can remember the three big ones with the word PIE: Persuade, Inform, Entertain. Persuade tries to convince you (reasons and evidence), Inform teaches you facts or steps (recipes, articles), and Entertain makes you laugh or enjoy a story (funny comics).",
      "say": "Every author has a purpose. Remember them with the word pie: persuade, inform, entertain. Persuade tries to convince you with reasons and evidence. Inform teaches you facts or steps, like a recipe or a news article. Entertain makes you laugh or enjoy a story, like a funny comic.",
      "analogy": "Think of PIE like three flavors: one convinces you, one teaches you, one just makes you smile.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "📣",
            "title": "Persuade",
            "body": "Convince you: reasons + evidence, like an article on why school should start later."
          },
          {
            "emoji": "📘",
            "title": "Inform",
            "body": "Teach you: facts or steps, like a recipe for tamales."
          },
          {
            "emoji": "😂",
            "title": "Entertain",
            "body": "Delight you: a funny comic about a cat chasing a laser."
          }
        ]
      }
    },
    {
      "kind": "show",
      "title": "Three cameras: first, second, third person",
      "body": "First person uses I, me, my, we, and our, so a character inside the story is telling it. Second person uses you and speaks straight to the reader, like giving advice. Third person uses he, she, they, and names, told by someone outside the story.",
      "say": "There are three points of view. First person uses I, me, my, we, and our, so a character inside the story is telling it. Second person uses the word you and speaks straight to the reader, like giving advice. Third person uses he, she, they, and names, and is told by someone outside the story.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🙋",
            "title": "First person",
            "body": "I, me, my, we, our — a character inside the story."
          },
          {
            "emoji": "👉",
            "title": "Second person",
            "body": "You — the author talks straight to the reader."
          },
          {
            "emoji": "👀",
            "title": "Third person",
            "body": "He, she, they, names — a narrator outside the story."
          }
        ]
      }
    },
    {
      "kind": "example",
      "title": "Metaphor: saying one thing IS another",
      "body": "A metaphor calls one thing another to make a strong comparison, without using like or as. Saying \"She was lightning down the track\" does not mean she is really lightning; it means she was incredibly fast.",
      "say": "A metaphor calls one thing another to make a strong comparison, without using the words like or as. Saying she was lightning down the track does not mean she is really lightning. It means she was incredibly fast.",
      "analogy": "A metaphor is a costume: the author dresses one idea up as another to help you picture it.",
      "reveal": [
        "Read the comparison: \"She was lightning down the track.\"",
        "Check for like or as: there are none, so it is not a simile.",
        "The author says she IS lightning, so it is a metaphor comparing her speed to lightning."
      ]
    }
  ],
  "e.5.reading": [
    {
      "kind": "concept",
      "title": "Why did the author write this?",
      "body": "Every passage has a job, and you can name it with P.I.E.: to Persuade you to do or believe something, to Inform you with facts, or to Entertain you with a fun story. Look at what the author keeps doing to spot the purpose.",
      "say": "Every passage has a job. You can name it with the word pie. P is for persuade, when the author wants you to do or believe something. I is for inform, when the author is giving you facts. E is for entertain, when the author is telling a fun story. Look at what the author keeps doing to spot the purpose.",
      "analogy": "It is like asking why a friend is talking: to talk you into something, to teach you something, or just to make you laugh.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "📣",
            "title": "Persuade",
            "body": "Tells you to help, buy, or believe. Ends with 'you should' ideas."
          },
          {
            "emoji": "📚",
            "title": "Inform",
            "body": "Gives facts and explains how or why something works."
          },
          {
            "emoji": "😄",
            "title": "Entertain",
            "body": "Tells a story or joke just for fun."
          }
        ]
      }
    },
    {
      "kind": "show",
      "title": "Feelings move, lessons repeat",
      "body": "To track a character's mood, compare the START to the END: Priya felt worried alone at lunch, then felt happy laughing with new friends, so her mood changed from worried to happy. To find the big lesson or theme, notice the idea the passage says again and again.",
      "say": "Here are two more detective moves. To track a character's mood, compare the start to the end. Priya felt worried sitting alone at lunch, then she felt happy laughing with new friends, so her mood changed from worried to happy. To find the big lesson, or theme, notice the idea the passage says again and again.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🎭",
            "title": "Mood change",
            "body": "How did they feel at the start? How at the end? Name both."
          },
          {
            "emoji": "💡",
            "title": "Big lesson",
            "body": "Which idea repeats? That repeated idea is the theme."
          }
        ]
      }
    },
    {
      "kind": "try",
      "title": "Word detective",
      "body": "When a word is new, the sentences around it are clues that reveal its meaning. A passage says: 'A volunteer helps without being paid. Mr. Ruiz walks the shelter dogs every Saturday and earns no money.' What does 'volunteer' mean?",
      "say": "When a word is new, the sentences around it are clues that reveal its meaning. A passage says a volunteer helps without being paid. Mr. Ruiz walks the shelter dogs every Saturday and earns no money. What does the word volunteer mean?",
      "widget": {
        "w": "tapPick",
        "prompt": "Using the nearby clues, 'volunteer' means...",
        "options": [
          {
            "label": "Someone who helps without being paid",
            "correct": true
          },
          {
            "label": "Someone who owns many animals"
          },
          {
            "label": "Someone who earns a large salary"
          }
        ]
      }
    }
  ],
  "e.6.commas": [
    {
      "kind": "concept",
      "title": "Commas do four handy jobs",
      "body": "A comma separates items in a list and separates a city from its state. A comma also shows who you are talking to, and a pair of commas wraps around extra, droppable information.",
      "say": "A comma has four handy jobs. It separates items in a list. It separates a city from its state. It shows who you are talking to. And a pair of commas wraps around extra information you could drop from the sentence.",
      "analogy": "A comma is like a tiny breath that keeps ideas from bumping into each other.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🎒",
            "title": "List of three or more",
            "body": "We packed sandwiches, apples, and water."
          },
          {
            "emoji": "👵",
            "title": "Talking to someone",
            "body": "Let's eat, Grandma!"
          },
          {
            "emoji": "🗺️",
            "title": "City and state",
            "body": "We visited Austin, Texas, last summer."
          },
          {
            "emoji": "➕",
            "title": "Extra, droppable info",
            "body": "My cousin, who lives in Denver, is visiting."
          }
        ]
      }
    },
    {
      "kind": "concept",
      "title": "Colons announce, semicolons join",
      "body": "A colon says \"here it comes\" right before a list or a big reveal. A semicolon links two complete sentences that could each stand alone but are closely related.",
      "say": "A colon announces that something is coming, like a list or a big reveal. A semicolon links two complete sentences that could each stand on their own but belong together.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "📢",
            "title": "Colon introduces",
            "body": "I packed three things: a map, a snack, and a hat."
          },
          {
            "emoji": "🔗",
            "title": "Semicolon joins",
            "body": "The storm knocked out power; we played games by candlelight."
          }
        ]
      }
    },
    {
      "kind": "try",
      "title": "End marks set the tone",
      "body": "A question mark ends a sentence that actually asks something, and an exclamation point shows strong feeling or urgency, like a warning. A plain statement just ends with a period.",
      "say": "End marks set the tone. A question mark ends a sentence that actually asks something. An exclamation point shows strong feeling or urgency, like a warning shouted out loud. A calm statement just ends with a period.",
      "widget": {
        "w": "tapPick",
        "prompt": "Which sentence should end with a question mark?",
        "options": [
          {
            "label": "Where did you put my backpack",
            "correct": true
          },
          {
            "label": "That backpack is huge"
          },
          {
            "label": "Please hand me my backpack"
          }
        ]
      }
    }
  ],
  "e.6.theme": [
    {
      "kind": "concept",
      "title": "Theme is not the same as a moral",
      "body": "A moral is a lesson the story states right out loud, often at the very end. A theme is usually unstated, so the reader figures it out by noticing the pattern in the story.",
      "say": "A moral is a lesson the story states right out loud, often at the very end. A theme is usually unstated, so the reader figures it out by noticing the pattern in the story.",
      "analogy": "A moral is like a sign that spells out the answer, while a theme is like a puzzle you piece together yourself.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "📢",
            "title": "Moral",
            "body": "Stated plainly, told to you directly."
          },
          {
            "emoji": "🔍",
            "title": "Theme",
            "body": "Often unstated, readers infer it from the pattern."
          }
        ]
      }
    },
    {
      "kind": "concept",
      "title": "What a summary is",
      "body": "A summary retells the main ideas of a story in your own words instead of copying sentences from it. Its job is to check that you truly understood what you read, so it never includes your personal opinions or feelings.",
      "say": "A summary retells the main ideas of a story in your own words instead of copying sentences from it. Its job is to check that you truly understood what you read, so it never includes your personal opinions or feelings.",
      "analogy": "A summary is like telling a friend what a movie was about in a few sentences, not reading them the whole script."
    },
    {
      "kind": "try",
      "title": "Your turn: pick the good summary rule",
      "body": "You just read a story. Which choice describes what a good summary should do?",
      "say": "You just read a story. Which choice describes what a good summary should do?",
      "widget": {
        "w": "tapPick",
        "prompt": "A good summary should...",
        "options": [
          {
            "label": "Restate the main ideas in your own words",
            "correct": true
          },
          {
            "label": "Copy exact sentences from the story"
          },
          {
            "label": "Add what you liked and disliked"
          }
        ]
      }
    }
  ],
  "e.7.evidence": [
    {
      "kind": "concept",
      "title": "Observation vs. inference",
      "body": "An observation is what you directly notice with your senses, like \"the grass is wet.\" An inference is the conclusion you reason out from it, like \"it probably rained last night.\" Same clue, but the inference adds your thinking.",
      "say": "An observation is what you directly notice with your senses, like the grass is wet. An inference is the conclusion you reason out from it, like it probably rained last night. Same clue, but the inference adds your thinking.",
      "analogy": "An observation is the photo; an inference is the story you piece together from what is in the photo.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "👀",
            "title": "Observation",
            "body": "What you directly notice: the grass is wet."
          },
          {
            "emoji": "🧠",
            "title": "Inference",
            "body": "What you reason out: it probably rained last night."
          }
        ]
      }
    },
    {
      "kind": "concept",
      "title": "Fact vs. opinion",
      "body": "A fact can be checked and confirmed true, like \"the Pacific is the largest ocean on Earth.\" An opinion is a personal judgment or taste that cannot be proven, and it often uses comparing words like best, prettiest, or far better.",
      "say": "A fact can be checked and confirmed true, like the Pacific is the largest ocean on Earth. An opinion is a personal judgment or taste that cannot be proven, and it often uses comparing words like best, prettiest, or far better.",
      "analogy": "A fact is a measurement anyone can take; an opinion is a favorite flavor, true only for the person who feels it.",
      "widget": {
        "w": "tapPick",
        "prompt": "Which sentence is an OPINION?",
        "options": [
          {
            "label": "Homemade cookies are far better than store-bought ones.",
            "correct": true
          },
          {
            "label": "Sugar is an ingredient in most cookies."
          },
          {
            "label": "Cookies can be baked in an oven."
          }
        ]
      }
    },
    {
      "kind": "concept",
      "title": "Weigh your source",
      "body": "Evidence is only as strong as where it comes from. The most credible source has real expertise and nothing to sell, like a pediatric sleep study from a medical association, which beats an anonymous blog, a mattress ad, or a movie.",
      "say": "Evidence is only as strong as where it comes from. The most credible source has real expertise and nothing to sell, like a pediatric sleep study from a medical association, which beats an anonymous blog, a mattress ad, or a movie.",
      "analogy": "For a sleep claim, trust the doctor who studies sleep over the salesperson who profits when you believe it."
    }
  ],
  "e.8.argument": [
    {
      "kind": "concept",
      "title": "The three appeals: ethos, pathos, logos",
      "body": "Persuaders reach you in three main ways. Ethos leans on the speaker's credibility or expertise, pathos stirs your emotions like fear or pity, and logos uses facts, statistics, and clear reasoning.",
      "say": "Persuaders reach you in three main ways. Ethos leans on the speaker's credibility or expertise. Pathos stirs your emotions, like fear or pity. And logos uses facts, statistics, and clear reasoning.",
      "analogy": "Picture a courtroom lawyer: she shows she is trustworthy, tugs at the jury's heart, and then lays out the hard evidence.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🎓",
            "title": "Ethos",
            "body": "Trust the speaker's character or expertise. 'Nine out of ten dentists recommend it.'"
          },
          {
            "emoji": "❤️",
            "title": "Pathos",
            "body": "Feel something. 'Don't let another puppy go hungry tonight.'"
          },
          {
            "emoji": "📊",
            "title": "Logos",
            "body": "Follow the facts and logic. 'Test scores rose twelve percent after the change.'"
          }
        ]
      }
    },
    {
      "kind": "concept",
      "title": "Claims, counterarguments, and rhetorical questions",
      "body": "A claim is the main point the writer wants readers to accept, and a strong thesis pairs that claim with a reason. Good arguers also face the other side, using concession words like 'admittedly' to introduce a counterargument, and sometimes ask a rhetorical question that makes a point instead of asking for real information.",
      "say": "A claim is the main point the writer wants readers to accept, and a strong thesis pairs that claim with a reason. Good arguers also face the other side, using concession words like admittedly to introduce a counterargument, and sometimes ask a rhetorical question that makes a point instead of asking for a real answer.",
      "analogy": "A rhetorical question like 'How much longer can we ignore the trash in our park?' is a nudge to act, not a request for a number.",
      "widget": {
        "w": "tapPick",
        "prompt": "Which word best signals that you are about to admit the other side has a point?",
        "options": [
          {
            "label": "Admittedly",
            "correct": true
          },
          {
            "label": "Therefore"
          },
          {
            "label": "Furthermore"
          }
        ]
      }
    },
    {
      "kind": "example",
      "title": "Fair authority vs. faulty logic",
      "body": "Trusting a real, relevant expert is a fair appeal to authority, but weak arguments hide two tricks: ad hominem attacks the person instead of the idea, and faulty causation links a cause to an effect it could never produce.",
      "say": "Trusting a real, relevant expert is a fair appeal to authority, but weak arguments hide two tricks. Ad hominem attacks the person instead of the idea, and faulty causation links a cause to an effect it could never produce.",
      "reveal": [
        "Fair authority: 'The bridge is safe, and the civil engineer who inspected it says so.' A relevant expert makes this reasonable, not a fallacy.",
        "Ad hominem: 'You can't trust her science project, she's bad at soccer.' Soccer skill has nothing to do with the science, so this attacks the person, not the idea.",
        "Faulty causation: 'A class pet will make the cafeteria food taste better.' A pet might lift moods or attendance, but it cannot change how food tastes, so that link is the weak one."
      ]
    }
  ],
  "e.8.voice": [
    {
      "kind": "concept",
      "title": "Trade weak verbs for vivid ones",
      "body": "Verbs like 'was', 'is', and 'made its way' are flat placeholders; a single precise action verb shows the reader exactly what happened. Swap 'was fast' for 'sprinted', 'went out' for 'streamed', and 'ate fast' for 'devoured'.",
      "say": "Verbs like was, is, and made its way are flat placeholders. A single precise action verb shows the reader exactly what happened. Swap was fast for sprinted, went out for streamed, and ate fast for devoured.",
      "analogy": "A weak verb is a stick figure; a vivid verb is a full-color photo of the same moment.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "😐",
            "title": "Weak verb",
            "body": "The runner was fast down the track."
          },
          {
            "emoji": "⚡",
            "title": "Vivid verb",
            "body": "The runner sprinted down the track."
          }
        ]
      }
    },
    {
      "kind": "show",
      "title": "Vary your beginnings and your lengths",
      "body": "When every sentence starts the same way ('The... The... The...') or runs the same length, the rhythm turns monotonous and readers tune out. Mix your sentence openings and blend long flowing lines with short punchy ones to keep the beat lively.",
      "say": "When every sentence starts the same way, like The, The, The, or runs the same length, the rhythm turns monotonous and readers tune out. Mix your sentence openings and blend long flowing lines with short punchy ones to keep the beat lively.",
      "analogy": "Same-length, same-start sentences are like a drum hitting one note forever; variety gives your writing a real rhythm."
    },
    {
      "kind": "example",
      "title": "Hook readers with a vivid image",
      "body": "A strong narrative hook drops the reader into a vivid image or action instead of announcing the topic. Compare a flat opener to one that lets you SEE the scene.",
      "say": "A strong narrative hook drops the reader into a vivid image or action instead of announcing the topic. Compare a flat opener to one that lets you see the scene.",
      "reveal": [
        "Flat announcement: I am going to tell you about a big snowstorm.",
        "This just labels the topic; there is nothing to picture yet.",
        "Vivid hook: The first flake landed, and by dawn our town had vanished under white.",
        "Now we see the scene unfold, so we want to read on.",
        "Rule of thumb: show an image or action first; save the explaining for later."
      ],
      "widget": {
        "w": "tapPick",
        "prompt": "Which line makes the strongest narrative hook?",
        "options": [
          {
            "label": "The first flake landed, and by dawn our town had vanished under white.",
            "correct": true
          },
          {
            "label": "This story is about a snowstorm that happened one time."
          },
          {
            "label": "Snowstorms are a type of weather event with snow."
          }
        ]
      }
    }
  ],
  "e.9.literary": [
    {
      "kind": "concept",
      "title": "Three flavors of irony",
      "body": "Irony is a gap between what's said, expected, or known and what's real. In dramatic irony the audience knows something a character doesn't; in situational irony the outcome is the opposite of what you'd expect; in verbal irony a speaker says the opposite of what they mean.",
      "say": "Irony is a gap between what is said, expected, or known and what is actually true. In dramatic irony, the audience knows something a character does not, like when we know about a surprise party but the birthday person does not. In situational irony, the result is the opposite of what you would expect, like a fire station burning down. In verbal irony, a speaker says the opposite of what they mean, like calling a rainy day lovely.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🎭",
            "title": "Dramatic",
            "body": "We know; the character doesn't."
          },
          {
            "emoji": "🔀",
            "title": "Situational",
            "body": "The opposite of what's expected happens."
          },
          {
            "emoji": "🙃",
            "title": "Verbal",
            "body": "The speaker means the opposite of the words."
          }
        ]
      }
    },
    {
      "kind": "show",
      "title": "The shape of a story and its fights",
      "body": "Every plot climbs a mountain: exposition sets the scene, rising action builds tension, the climax is the peak turning point where the main conflict comes to a head, then the resolution settles things. That conflict is internal when a character struggles inside their own mind, and external when they battle an outside force like nature, society, or another person. A flashback jumps the timeline backward to show earlier events.",
      "say": "Every plot climbs like a mountain. Exposition sets the scene, rising action builds tension, the climax is the highest peak where the main conflict comes to a head, and the resolution settles everything afterward. Conflict is internal when a character struggles inside their own mind, and external when they fight an outside force like nature, society, or another person. A flashback interrupts the order of events to show something that happened earlier.",
      "analogy": "Think of the climax as the top of a roller coaster: the slow climb before it is rising action, and the rush down after is the resolution."
    },
    {
      "kind": "concept",
      "title": "Devices that give words life and voice",
      "body": "Hyperbole is deliberate exaggeration for effect (\"a million reminders\"). Personification gives human actions to nonhuman things (the wind whispers). Onomatopoeia names a thing by imitating its sound (buzz, crash, sizzle). Tone is the writer's attitude, and clues like a playful joke signal a wry, humorous tone while cold, precise language signals a formal one.",
      "say": "Hyperbole is deliberate exaggeration for effect, like saying you have told someone a million times. Personification gives human actions to nonhuman things, like a wind that whispers through the branches. Onomatopoeia names something by imitating its sound, like buzz, crash, and sizzle. Tone is the writer's attitude toward the subject. A playful comparison creates a wry, humorous tone, while cold and precise wording creates a formal one.",
      "widget": {
        "w": "tapPick",
        "prompt": "\"The old floorboards groaned and creaked with every step.\" Which device names sounds by imitating them?",
        "options": [
          {
            "label": "Onomatopoeia",
            "correct": true
          },
          {
            "label": "Hyperbole"
          },
          {
            "label": "Dramatic irony"
          }
        ]
      }
    }
  ],
  "e.9.vocab": [
    {
      "kind": "concept",
      "title": "Words about presence and speech",
      "body": "Ubiquitous means seeming to be everywhere at once. Eloquent means skilled and persuasive in speaking, succinct means expressed briefly and clearly, and equivocal means deliberately vague or ambiguous.",
      "say": "Here are four college words. Ubiquitous means seeming to be everywhere at once. Eloquent means skilled and persuasive in speaking. Succinct means expressed briefly and clearly, in few words. And equivocal means deliberately vague or ambiguous, giving an answer that could go either way.",
      "analogy": "A ubiquitous brand feels like it is in every store, ad, and locker you look at.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🌍",
            "title": "Ubiquitous",
            "body": "Seeming to be everywhere: in every store and every ad."
          },
          {
            "emoji": "🎤",
            "title": "Eloquent",
            "body": "Skilled and persuasive in speaking; graceful, powerful words."
          },
          {
            "emoji": "✂️",
            "title": "Succinct",
            "body": "Briefly and clearly expressed; two sentences beat an hour."
          },
          {
            "emoji": "🌫️",
            "title": "Equivocal",
            "body": "Deliberately vague or ambiguous; pleases both sides, promises nothing."
          }
        ]
      }
    },
    {
      "kind": "show",
      "title": "Words about skill and what is practical",
      "body": "Adept means highly skilled after practice. Superfluous means more than needed and unnecessary, while pragmatic means practical and focused on results that actually work.",
      "say": "Now three more. Adept means highly skilled, the way years of practice make someone very good. Superfluous means more than needed, extra and unnecessary. And pragmatic means practical and focused on results, choosing what actually works over what merely sounds nice.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🎯",
            "title": "Adept",
            "body": "Highly skilled; very good at something after practice."
          },
          {
            "emoji": "➕",
            "title": "Superfluous",
            "body": "More than needed; extra steps that make no difference."
          },
          {
            "emoji": "🔧",
            "title": "Pragmatic",
            "body": "Practical and results-focused; the cheapest fix that works."
          }
        ]
      }
    },
    {
      "kind": "example",
      "title": "Words about feelings and fast growth",
      "body": "Ambivalent means having mixed or conflicting feelings, tenacious means persistent and determined, and exponential means increasing at a rapidly accelerating rate.",
      "say": "Three last words. Ambivalent means having mixed or conflicting feelings, two opposite things at once. Tenacious means persistent and determined, holding on and refusing to quit. And exponential means increasing at a rapidly accelerating rate, where each step multiplies.",
      "reveal": [
        "Ambivalent: the twins are excited for the new city but sad to leave friends, mixed feelings at the same time.",
        "Tenacious: the coach refuses to give up even when down by thirty points, determined and persistent.",
        "Exponential: growth goes 10, then 100, then 10,000, multiplying and accelerating fast."
      ]
    }
  ],
  "m.11.exponential": [
    {
      "kind": "concept",
      "title": "Doubling is just one growth factor",
      "body": "Doubling means the multiplier is 2, but things can also triple (×3), grow 5× or even 10× each period. The multiplier that repeats each period is called the growth factor, r.",
      "say": "Doubling means the multiplier is two, but things can also triple, grow five times, or even ten times each period. The number you multiply by every period is called the growth factor, and we call it r.",
      "analogy": "It is like a photocopier setting: doubling copies at 200 percent, but you can dial it to 300 percent to triple or 500 percent to grow five times."
    },
    {
      "kind": "show",
      "title": "The general shortcut: start × r to the n",
      "body": "Multiplying by r once per period for n periods is the same as multiplying the start by r to the power n. So the total is start × r^n, where r is the growth factor and n is the number of periods.",
      "say": "Multiplying by r once each period for n periods is the same as multiplying the start by r to the power n. So the total equals the start times r to the n, where r is the growth factor and n is the number of periods.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "✖️",
            "title": "Growth factor r",
            "body": "How many times bigger it gets each period: 2, 3, 5, 10."
          },
          {
            "emoji": "🔢",
            "title": "Periods n",
            "body": "How many times it grows. Multiply the start by r raised to n."
          }
        ]
      }
    },
    {
      "kind": "example",
      "title": "Tripling and 5× worked out",
      "body": "Start at 200 tripling for 2 months: r is 3 and n is 2, so 200 × 3^2 = 200 × 9 = 1800. Growing 5× for 2 months: 200 × 5^2 = 200 × 25 = 5000.",
      "say": "Start at two hundred, tripling for two months. Here r is three and n is two, so two hundred times three squared equals two hundred times nine, which is one thousand eight hundred. Now growing five times for two months: two hundred times five squared equals two hundred times twenty five, which is five thousand.",
      "reveal": [
        "Triple means growth factor r = 3.",
        "2 months means n = 2, so use 3^2 = 9.",
        "200 × 9 = 1800 after 2 months.",
        "For 5× growth, r = 5, so 5^2 = 25.",
        "200 × 25 = 5000 after 2 months."
      ]
    }
  ],
  "m.12.limits": [
    {
      "kind": "concept",
      "title": "When the bridge isn't out, just walk in",
      "body": "If plugging the number in gives a real answer (not 0 over 0), the road is clear, so the limit is simply that value. For x squared plus 6x as x approaches 5, plug in 5 to get 25 plus 30, which is 55.",
      "say": "Sometimes the bridge is not out at all. If you plug the number in and get a real answer instead of zero over zero, the road is clear, so the limit is just that value. For x squared plus six x as x approaches five, plug in five to get twenty-five plus thirty, which is fifty-five.",
      "analogy": "No broken bridge means no detour needed. You just drive straight into the town square.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🚗",
            "title": "Clear road",
            "body": "Plug in and you get a real number. That number is the limit."
          },
          {
            "emoji": "🌉",
            "title": "Bridge out",
            "body": "Plug in and you get 0 over 0. Now you must factor and cancel first."
          }
        ]
      }
    },
    {
      "kind": "example",
      "title": "Factoring a trinomial to fix 0 over 0",
      "body": "For x squared minus 5x plus 6 over x minus 2, plugging in 2 gives 0 over 0, so factor the top by finding two numbers that multiply to 6 and add to negative 5.",
      "say": "Some tops are not a difference of squares. For x squared minus five x plus six over x minus two, plugging in two gives zero over zero, so factor the top. Find two numbers that multiply to positive six and add to negative five. Those are negative two and negative three.",
      "reveal": [
        "Try plugging in: (4 − 10 + 6) over (2 − 2) is 0 over 0. Undefined, so factor.",
        "Factor the top: find two numbers that multiply to +6 and add to −5. They are −2 and −3.",
        "So x² − 5x + 6 = (x − 2)(x − 3).",
        "Cancel the shared (x − 2): you are left with x − 3.",
        "Let x approach 2: x − 3 approaches 2 − 3 = −1. The limit is −1."
      ]
    },
    {
      "kind": "try",
      "title": "Which move fits?",
      "body": "For x squared minus 8x plus 12 over x minus 6, plugging in 6 gives 0 over 0. Pick the correct factoring of the top.",
      "say": "Your turn. For x squared minus eight x plus twelve over x minus six, plugging in six gives zero over zero. Pick the correct factoring of the top.",
      "widget": {
        "w": "tapPick",
        "prompt": "Factor x² − 8x + 12 (two numbers that multiply to 12 and add to −8):",
        "options": [
          {
            "label": "(x − 6)(x − 2)",
            "correct": true
          },
          {
            "label": "(x − 6)(x + 2)"
          },
          {
            "label": "(x − 4)(x − 3)"
          }
        ]
      }
    }
  ],
  "m.12.trig": [
    {
      "kind": "concept",
      "title": "Two triangles unlock every value",
      "body": "Every special value comes from two triangles: the 45-45-90 (a square cut in half) has equal legs, and the 30-60-90 (an equilateral triangle cut in half) has sides in the ratio 1 to √3 to 2. On the unit circle sine is the height and cosine is the sideways distance.",
      "say": "Every special value comes from two triangles. The forty-five forty-five ninety triangle is a square cut in half, so its two legs are equal. The thirty sixty ninety triangle is an equilateral triangle cut in half, with sides in the ratio one to root three to two. On the unit circle, sine is the height and cosine is the sideways distance.",
      "analogy": "Like two master keys that open every door in the special-angle table.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "△",
            "title": "45-45-90",
            "body": "Equal legs. Gives the 45 degree values, sine and cosine both √2/2."
          },
          {
            "emoji": "📐",
            "title": "30-60-90",
            "body": "Sides 1, √3, 2. Gives the 30 and 60 degree values."
          }
        ]
      }
    },
    {
      "kind": "example",
      "title": "The whole table",
      "body": "Read sine as the height climbing from 0 up to 1 as the angle grows, and cosine as the width shrinking from 1 down to 0. Tangent is sine divided by cosine.",
      "say": "Read sine as the height, climbing from zero up to one as the angle grows. Read cosine as the width, shrinking from one down to zero. Tangent is sine divided by cosine.",
      "reveal": [
        "At 0 degrees: sin = 0, cos = 1, tan = 0.",
        "At 30 degrees: sin = 1/2, cos = √3/2, tan = √3/3.",
        "At 45 degrees: sin = √2/2, cos = √2/2, tan = 1.",
        "At 60 degrees: sin = √3/2, cos = 1/2, tan = √3.",
        "At 90 degrees: sin = 1, cos = 0, tan is undefined.",
        "Notice sine goes 0, 1/2, √2/2, √3/2, 1 — and cosine is the same list reversed."
      ]
    },
    {
      "kind": "try",
      "title": "Your turn",
      "body": "A ramp's angle is 30 degrees. Use the table: sine climbs to 1/2 while cosine is still large at √3/2. Pick the value of cos(30°).",
      "say": "A ramp's angle is thirty degrees. Use the table. Sine climbs to one half while cosine is still large at root three over two. Pick the value of cosine of thirty degrees.",
      "widget": {
        "w": "tapPick",
        "prompt": "What is cos(30°)?",
        "options": [
          {
            "label": "√3/2",
            "correct": true
          },
          {
            "label": "1/2"
          },
          {
            "label": "0"
          }
        ]
      }
    }
  ],
  "m.3.multimeadow": [
    {
      "kind": "concept",
      "title": "Two handy rules",
      "body": "You can flip a multiplication and the total stays the same: 4 x 7 equals 7 x 4. And any number times 0 is 0, because zero groups (or groups of nothing) hold nothing at all.",
      "say": "Here are two handy rules. You can flip a multiplication and the total stays the same, so four times seven equals seven times four. And any number times zero is zero, because zero groups, or groups of nothing, hold nothing at all.",
      "analogy": "Turning a rectangle of tiles sideways does not change how many tiles are inside.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🔄",
            "title": "Flip it (same total)",
            "body": "4 rows of 7 is 28. Turn it: 7 rows of 4 is also 28."
          },
          {
            "emoji": "0️⃣",
            "title": "Times zero is zero",
            "body": "6 pots with 0 seeds each is 6 x 0 = 0 seeds."
          }
        ]
      }
    },
    {
      "kind": "example",
      "title": "Find the missing factor",
      "body": "Sometimes you know the total and the size of each group, and you must find how many groups. Ask: this number times WHAT gives the total?",
      "say": "Sometimes you know the total and the size of each group, and you must find how many groups. Ask yourself, this number times what gives the total?",
      "reveal": [
        "Each friend gets 9 grapes, and 27 grapes go out in all. How many friends?",
        "Ask: 9 times what number equals 27?",
        "Count by 9s: 9, 18, 27. That is three 9s.",
        "So 9 x 3 = 27. There are 3 friends."
      ]
    },
    {
      "kind": "example",
      "title": "Two steps: solve one part first",
      "body": "Some problems hide a first step. Do the hidden step, then multiply. 'Twice as many' means double the amount before you finish.",
      "say": "Some problems hide a first step. Do the hidden step, then multiply. Twice as many means double the amount before you finish.",
      "reveal": [
        "Tom has 3 packs. Sara has twice as many packs, with 8 cards in each.",
        "Step 1: twice 3 packs is 3 + 3 = 6 packs.",
        "Step 2: 6 packs times 8 cards is 6 x 8 = 48.",
        "Sara has 48 cards."
      ]
    }
  ],
  "m.4.equivfrac": [
    {
      "kind": "concept",
      "title": "You can go the other way: divide",
      "body": "Multiplying top and bottom makes MORE pieces. Dividing top and bottom by the same number makes FEWER, bigger pieces, and the fraction still equals the same amount. So 6/12 divided by 6/6 gives 1/2.",
      "say": "Multiplying the top and bottom makes more pieces. Dividing the top and bottom by the same number makes fewer, bigger pieces, and the fraction still equals the same amount. So six twelfths, dividing top and bottom by six, gives one half.",
      "analogy": "It is like trading four quarters back for one dollar bill. Fewer coins, same money.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "✖️",
            "title": "Multiply",
            "body": "1/2 times 3/3 makes 3/6. More pieces."
          },
          {
            "emoji": "➗",
            "title": "Divide",
            "body": "3/6 divided by 3/3 makes 1/2. Fewer pieces."
          }
        ]
      }
    },
    {
      "kind": "concept",
      "title": "Simplest form",
      "body": "A fraction is in simplest form when the top and bottom share no common factor bigger than 1, so you cannot divide both by the same number anymore. To simplify, find a number that divides BOTH the top and bottom, and divide by it.",
      "say": "A fraction is in simplest form when the top and bottom share no common factor bigger than one, so you cannot divide both by the same number anymore. To simplify, find a number that divides both the top and the bottom, and divide by it.",
      "analogy": "Simplest form is the fraction wearing its smallest, tidiest outfit that means the exact same thing."
    },
    {
      "kind": "example",
      "title": "Worked example: simplify 10/16",
      "body": "Both 10 and 16 can be divided by 2. Divide the top and the bottom by 2 to get 5/8. Now 5 and 8 share no common factor, so 5/8 is the simplest form.",
      "say": "Both ten and sixteen can be divided by two. Divide the top and the bottom by two to get five eighths. Now five and eight share no common factor, so five eighths is the simplest form.",
      "reveal": [
        "Find a number that divides both 10 and 16. Both are even, so use 2.",
        "Top: 10 divided by 2 equals 5.",
        "Bottom: 16 divided by 2 equals 8.",
        "So 10/16 equals 5/8.",
        "Check: 5 and 8 share no common factor bigger than 1, so 5/8 is in simplest form."
      ],
      "widget": {
        "w": "tapPick",
        "prompt": "Which fraction is EQUAL to 9/18 but written in simplest form?",
        "options": [
          {
            "label": "1/2",
            "correct": true
          },
          {
            "label": "9/17"
          },
          {
            "label": "6/6"
          }
        ]
      }
    }
  ],
  "m.4.multibig": [
    {
      "kind": "concept",
      "title": "Multiplying by ten",
      "body": "When you multiply a number by 10, every seat slides one place bigger, so you just write the number and put a zero on the end. That means 76 times 10 is 760 and 66 times 10 is 660.",
      "say": "When you multiply a number by ten, every seat slides one place bigger, so you just write the number and put a zero on the end. That means seventy-six times ten is seven hundred sixty, and sixty-six times ten is six hundred sixty.",
      "analogy": "It is like turning every single fan into a group of ten fans at once."
    },
    {
      "kind": "concept",
      "title": "When the rows are two digits too",
      "body": "If the number of rows is two digits, split that number apart the same way. For 12 rows, break 12 into 10 and 2, multiply the seats by each piece, then add the two products together.",
      "say": "If the number of rows is two digits, split that number apart the same way. For twelve rows, break twelve into ten and two, multiply the seats by each piece, then add the two products together.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "1",
            "title": "Ten rows",
            "body": "58 times 10 is 580"
          },
          {
            "emoji": "2",
            "title": "Two rows",
            "body": "58 times 2 is 116"
          }
        ]
      }
    },
    {
      "kind": "example",
      "title": "Worked example: 58 x 12",
      "body": "A row seats 58 fans and there are 12 rows. Split the 12 into 10 and 2, multiply 58 by each piece, then add the pieces back together.",
      "say": "A row seats fifty-eight fans and there are twelve rows. Split the twelve into ten and two, multiply fifty-eight by each piece, then add the pieces back together.",
      "reveal": [
        "Split 12 into 10 and 2.",
        "58 times 10 is 580.",
        "58 times 2 is 116.",
        "Add the pieces: 580 plus 116 is 696.",
        "So 58 times 12 is 696 seats."
      ]
    }
  ],
  "s.2.habitats": [
    {
      "kind": "show",
      "title": "Homes have special names",
      "body": "Different animals build different homes with special names. A spider spins a sticky web to trap insects, ants build an anthill out of soil with tunnels inside, birds weave a nest of twigs for their eggs, bats sleep hanging upside down in a dark cave, and a mother kangaroo carries her baby in a pouch of skin.",
      "say": "Different animals build different homes with special names. A spider spins a sticky web to trap insects. Ants build an anthill out of soil with tunnels inside. Birds weave a nest of twigs for their eggs. Bats sleep hanging upside down in a dark cave. And a mother kangaroo carries her baby in a pouch of skin.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🕸️",
            "title": "Web",
            "body": "A spider's sticky trap for catching insects."
          },
          {
            "emoji": "🐜",
            "title": "Anthill",
            "body": "A mound of soil with tunnels where ants live together."
          },
          {
            "emoji": "🪺",
            "title": "Nest",
            "body": "A cup of twigs and grass where birds lay eggs."
          },
          {
            "emoji": "🦇",
            "title": "Cave",
            "body": "A dark, cool space where bats rest upside down."
          }
        ]
      }
    },
    {
      "kind": "concept",
      "title": "What's for dinner?",
      "body": "We sort animals by what they eat. An animal that eats ONLY plants, like a rabbit or deer, is a herbivore. An animal that eats only other animals is a carnivore, and one that eats both plants and animals is an omnivore.",
      "say": "We sort animals by what they eat. An animal that eats only plants, like a rabbit or deer, is a herbivore. An animal that eats only other animals is a carnivore. And one that eats both plants and animals is an omnivore.",
      "analogy": "Think of a herbivore like a friend who only ever orders the salad."
    },
    {
      "kind": "example",
      "title": "Built to survive the cold",
      "body": "The Arctic is a habitat near the top of the Earth that is covered in ice and snow and is very, very cold. Animals have special bodies and habits to live in tough places.",
      "say": "The Arctic is a habitat near the top of the Earth that is covered in ice and snow and is very, very cold. Animals have special bodies and habits to live in tough places.",
      "reveal": [
        "Polar bears, foxes, and rabbits grow thick fur that traps warmth close to their bodies to keep them warm.",
        "When food is hard to find in winter, some animals like bears go into a deep sleep for many months called hibernation.",
        "A woodpecker has a strong, sharp beak it uses to peck holes in tree bark and find bugs to eat."
      ],
      "widget": {
        "w": "tapPick",
        "prompt": "A bear sleeps deeply all winter to save energy. What is this called?",
        "options": [
          {
            "label": "Hibernation",
            "correct": true
          },
          {
            "label": "Migration"
          },
          {
            "label": "Camouflage"
          }
        ]
      }
    }
  ],
  "s.5.body": [
    {
      "kind": "concept",
      "title": "From tiny cells to your biggest organ",
      "body": "All living things are built from tiny building blocks called cells, far too small to see without a microscope. Trillions of cells group together to form organs, and your largest organ is your skin, which covers you from head to toe, holds in water, and helps control your temperature.",
      "say": "All living things are built from tiny building blocks called cells. They are far too small to see without a microscope. Trillions of cells group together to form organs, and your largest organ is your skin. Your skin covers you from head to toe, holds in water, and helps control your temperature.",
      "analogy": "Cells are like tiny bricks, and organs like your skin are the whole wall built from them.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🔬",
            "title": "Cells",
            "body": "The smallest living building blocks; your body has trillions."
          },
          {
            "emoji": "🧴",
            "title": "Skin",
            "body": "The body's largest organ, covering and protecting you."
          }
        ]
      }
    },
    {
      "kind": "show",
      "title": "Bones, heart, and ears at work",
      "body": "Your skeleton protects soft parts: the hard skull is a bony case around your brain, and the stacked bones of your backbone, called vertebrae, guard the spinal cord running down your back. Your heart has four chambers that pump blood, and inside each ear a thin stretched membrane called the eardrum vibrates when sound waves hit it so you can hear.",
      "say": "Your skeleton protects soft parts. The hard skull is a bony case around your brain, and the stacked bones of your backbone, called vertebrae, guard the spinal cord running down your back. Your heart has four chambers that pump blood. And inside each ear a thin stretched membrane called the eardrum vibrates when sound waves hit it, so you can hear.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "💀",
            "title": "Skull",
            "body": "Hard bone case that protects the brain."
          },
          {
            "emoji": "🦴",
            "title": "Backbone",
            "body": "Stacked vertebrae protect the spinal cord."
          },
          {
            "emoji": "❤️",
            "title": "Heart",
            "body": "Has four chambers that pump blood."
          }
        ]
      }
    },
    {
      "kind": "example",
      "title": "The journey of your food",
      "body": "Digestion is a path in order: food is broken down step by step as it travels from your mouth all the way through your body.",
      "say": "Digestion is a path that happens in order. Food is broken down step by step as it travels from your mouth all the way through your body.",
      "reveal": [
        "Mouth: saliva moistens your food and starts breaking down starches before you even swallow.",
        "Stomach: the food is churned and mixed with juices into a soupy mush.",
        "Right after the stomach, food goes into the small intestine, a long coiled tube.",
        "Small intestine: MOST nutrients are absorbed into the blood here. The liver helps by making bile, a fluid that breaks down fatty foods.",
        "Large intestine: comes last and soaks up leftover water."
      ]
    }
  ],
  "s.5.ecosystems": [
    {
      "kind": "concept",
      "title": "Producers, consumers, and decomposers",
      "body": "Producers like plants make their own sugary food during photosynthesis, using sunlight, water, and carbon dioxide gas from the air. Consumers such as animals cannot make food, so they eat other living things, and decomposers like mushrooms break dead things down into rich soil.",
      "say": "Producers like plants make their own sugary food during a process called photosynthesis. They use sunlight, water, and a gas from the air called carbon dioxide. Consumers, like animals, cannot make their own food, so they eat other living things. Decomposers, like mushrooms, break dead things down into rich soil.",
      "analogy": "A producer is a cook who makes the meal, a consumer is a guest who eats it, and a decomposer is the cleanup crew that clears the table.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🌻",
            "title": "Producer",
            "body": "Makes its own food with sunlight, like a wildflower."
          },
          {
            "emoji": "🐇",
            "title": "Consumer",
            "body": "Eats other living things because it cannot make food."
          },
          {
            "emoji": "🍄",
            "title": "Decomposer",
            "body": "Breaks down dead stuff into soil."
          }
        ]
      }
    },
    {
      "kind": "show",
      "title": "Arrows and the energy pyramid",
      "body": "In a food chain the arrow always points from the food toward the animal that eats it, showing which way energy flows, so a chain starts with a producer like grass then grasshopper then frog then snake. Stacked as an energy pyramid, the producers at the bottom hold the most energy, and less energy is passed up at each higher level, so the top predators have the least.",
      "say": "In a food chain, the arrow always points from the food toward the animal that eats it. That shows which way the energy is flowing. So a chain starts with a producer, like grass, then a grasshopper, then a frog, then a snake. If you stack these as an energy pyramid, the producers at the bottom hold the most energy. Less energy gets passed up at each higher level, so the top predators end up with the least.",
      "analogy": "The energy pyramid is like a pitcher of juice being poured cup to cup: the bottom cup is fullest, and a little spills away each pour, so the top cup gets the least."
    },
    {
      "kind": "concept",
      "title": "Niches, scavengers, reefs, and too many mouths",
      "body": "An animal's niche is its role or job, like what it eats and how it lives, which is different from its habitat, the place it lives. Scavengers such as vultures eat animals that are already dead, coral reefs matter because they give food and shelter to a huge variety of ocean animals, and if one population like rabbits grows too large, plants get eaten faster than they can grow back.",
      "say": "An animal's niche is its role or job, like what it eats and how it lives. That is different from its habitat, which is just the place it lives. Scavengers, such as vultures, eat animals that are already dead instead of hunting them. Coral reefs are important because they give food and shelter to a huge variety of ocean animals. And if one population, like rabbits, grows too large, the plants get eaten faster than they can grow back.",
      "widget": {
        "w": "tapPick",
        "prompt": "A vulture feeding on an animal that is already dead is acting as a…",
        "options": [
          {
            "label": "scavenger",
            "correct": true
          },
          {
            "label": "producer"
          },
          {
            "label": "predator"
          }
        ]
      }
    }
  ],
  "s.6.cells": [
    {
      "kind": "concept",
      "title": "How we first saw cells",
      "body": "In 1665 Robert Hooke looked at a thin slice of cork under a microscope and saw tiny empty boxes, which he named 'cells' because they looked like the little rooms where monks lived. A little later a Dutch cloth merchant, Anton van Leeuwenhoek, built his own tiny lens and became the first person to see living 'animalcules' swimming in pond water, which were really microorganisms too small to see with the eye.",
      "say": "In sixteen sixty-five, Robert Hooke looked at a thin slice of cork under a microscope and saw tiny empty boxes. He named them cells, because they looked like the little rooms where monks lived. A little later, a Dutch cloth merchant named Anton van Leeuwenhoek built his own tiny lens. He became the first person to see living animalcules swimming in pond water, which were really tiny living things, or microorganisms, too small to see with the eye.",
      "analogy": "Hooke's cork boxes looked just like rows of monk bedrooms, so the name cells stuck.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🧱",
            "title": "Hooke, 1665",
            "body": "Saw box-like spaces in cork and named them cells."
          },
          {
            "emoji": "🦎",
            "title": "Leeuwenhoek",
            "body": "First to see living microorganisms, which he called animalcules."
          }
        ]
      }
    },
    {
      "kind": "show",
      "title": "Two kinds of cells and their parts",
      "body": "Cells that have a true nucleus are called eukaryotic, like plant and animal cells and even single-celled yeast, while cells with no nucleus, such as bacteria, are called prokaryotic and keep their DNA loose inside. A eukaryotic cell is packed with tiny working parts called organelles that float in a jelly and each do a special job.",
      "say": "Cells that have a true nucleus are called eukaryotic. That includes plant and animal cells and even single-celled yeast. Cells with no nucleus, such as bacteria, are called prokaryotic, and they keep their D N A loose inside. A eukaryotic cell is packed with tiny working parts called organelles. They float in a jelly, and each one does a special job.",
      "analogy": "A prokaryote is like a studio with no separate bedroom for the DNA, while a eukaryote has a walled-off nucleus room.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🫧",
            "title": "Cytoplasm",
            "body": "The jelly-like fluid that fills the cell and holds the organelles in place."
          },
          {
            "emoji": "🚪",
            "title": "Cell membrane",
            "body": "A selectively permeable border that lets some things, like water, cross in and out; water crossing it is called osmosis."
          },
          {
            "emoji": "🛤️",
            "title": "Endoplasmic reticulum",
            "body": "A folded network of hallways that transports materials across the cell."
          },
          {
            "emoji": "📦",
            "title": "Golgi apparatus",
            "body": "The shipping department that packages proteins and sends them where they are needed."
          }
        ]
      }
    },
    {
      "kind": "example",
      "title": "Working the microscope",
      "body": "To study a cell you need enough light and enough magnification: the diaphragm opens or closes to control how much light shines up through the slide, so open it wider when the image looks too dark. The two lenses each magnify, so you find total magnification by multiplying the eyepiece power by the objective power.",
      "say": "To study a cell you need enough light and enough magnification. The diaphragm opens or closes to control how much light shines up through the slide, so open it wider when the image looks too dark. The two lenses each magnify, so you find total magnification by multiplying the eyepiece power by the objective power.",
      "reveal": [
        "The image is too dark, so open the diaphragm to let more light through the slide.",
        "For power: total magnification equals eyepiece power times objective power.",
        "Say the eyepiece is 10x and the objective is 40x.",
        "Multiply: 10 times 40 equals 400x total magnification.",
        "Always multiply the two lenses, never add them."
      ],
      "widget": {
        "w": "tapPick",
        "prompt": "Eyepiece 10x and objective 40x: what is the total magnification?",
        "options": [
          {
            "label": "400x",
            "correct": true
          },
          {
            "label": "50x"
          },
          {
            "label": "30x"
          }
        ]
      }
    }
  ],
  "s.7.chemistry": [
    {
      "kind": "concept",
      "title": "Inside the atom",
      "body": "Every atom is built from three tiny particles. Protons carry a positive charge and neutrons carry no charge at all, and both are packed together in the atom's center, called the nucleus. Electrons carry a negative charge and move around the outside of the nucleus in a fuzzy region called the electron cloud.",
      "say": "Every atom is built from three tiny particles. Protons carry a positive charge and neutrons carry no charge at all, and both are packed together in the atom's center, called the nucleus. Electrons carry a negative charge and move around the outside of the nucleus in a fuzzy region called the electron cloud.",
      "analogy": "The nucleus is like the sun sitting at the center, while the electrons buzz around it like a swarm of bees.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "➕",
            "title": "Proton",
            "body": "Positive charge. Sits in the nucleus."
          },
          {
            "emoji": "⚪",
            "title": "Neutron",
            "body": "No charge, it is neutral. Sits in the nucleus."
          },
          {
            "emoji": "➖",
            "title": "Electron",
            "body": "Negative charge. Moves in the cloud around the nucleus."
          }
        ]
      }
    },
    {
      "kind": "example",
      "title": "States of matter and how they change",
      "body": "A solid has a definite shape and a definite volume, a liquid keeps a definite volume but takes the shape of its container, and a gas spreads out to fill whatever holds it. Whether something floats also depends on density: an object floats in water when it is less dense than water, which is about 1 g/cm³. Adding or removing heat can push matter from one state into another.",
      "say": "A solid has a definite shape and a definite volume, a liquid keeps a definite volume but takes the shape of its container, and a gas spreads out to fill whatever holds it. Whether something floats also depends on density. An object floats in water when it is less dense than water, which is about one gram per cubic centimeter. Adding or removing heat can push matter from one state into another.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🧊",
            "title": "Solid",
            "body": "Definite shape AND definite volume."
          },
          {
            "emoji": "💧",
            "title": "Liquid",
            "body": "Definite volume, takes the container's shape."
          },
          {
            "emoji": "💨",
            "title": "Gas",
            "body": "No fixed shape or volume, fills the space."
          }
        ]
      },
      "reveal": [
        "Melting: a solid turns into a liquid, like an ice pop melting in the sun.",
        "Freezing: a liquid turns into a solid.",
        "Evaporation: a liquid turns into a gas.",
        "Condensation: a gas turns into a liquid.",
        "Sublimation: a solid turns straight into a gas, skipping the liquid, like dry ice.",
        "Deposition: a gas turns straight into a solid, skipping the liquid."
      ]
    },
    {
      "kind": "concept",
      "title": "Mixtures and element symbols",
      "body": "When one substance dissolves in another, the solute is the thing that dissolves, like salt, and the solvent is the substance that does the dissolving, like water. To pull the salt back out of saltwater you let the water evaporate so the dissolved salt is left behind, because dissolved particles are far too tiny for a filter to catch. Every element also has a short symbol, such as He for helium, H for hydrogen, Hg for mercury, and O for oxygen.",
      "say": "When one substance dissolves in another, the solute is the thing that dissolves, like salt, and the solvent is the substance that does the dissolving, like water. To pull the salt back out of saltwater you let the water evaporate so the dissolved salt is left behind, because dissolved particles are far too tiny for a filter to catch. Every element also has a short symbol. For example, capital H E stands for helium, H stands for hydrogen, H G stands for mercury, and O stands for oxygen.",
      "analogy": "Think of hot cocoa: the cocoa powder is the solute and the warm milk is the solvent that dissolves it.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🧂",
            "title": "Solute",
            "body": "The substance that gets dissolved, like the salt."
          },
          {
            "emoji": "🚰",
            "title": "Solvent",
            "body": "The substance that does the dissolving, like the water."
          },
          {
            "emoji": "☀️",
            "title": "Separating",
            "body": "Evaporate the water and solid salt crystals stay behind."
          }
        ]
      }
    }
  ],
  "s.7.earth": [
    {
      "kind": "show",
      "title": "Reading rock layers and moving plates",
      "body": "In undisturbed sedimentary rock, sediment piles up over time, so the oldest layers rest at the bottom and the youngest at the top — that is the law of superposition. The plates riding above are dragged by convection currents of hot rock rising and sinking in the mantle; where plates pull apart at mid-ocean ridges magma rises and cools into brand-new seafloor, and most volcanoes and quakes ring the Pacific Ocean in the Ring of Fire.",
      "say": "In undisturbed sedimentary rock, sediment piles up over time, so the oldest layers rest at the bottom and the youngest sit at the top. This idea is called the law of superposition. The plates riding above are dragged along by convection currents of hot rock that rises and then sinks deep in the mantle. Where plates pull apart at mid-ocean ridges, magma rises and cools into brand-new seafloor, and most volcanoes and earthquakes circle the Pacific Ocean in a zone called the Ring of Fire.",
      "analogy": "Rock layers are like a stack of pancakes: the first one poured sits at the very bottom, so it is the oldest.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🥞",
            "title": "Oldest at bottom",
            "body": "Bottom sedimentary layers were deposited first, so they are the oldest."
          },
          {
            "emoji": "♨️",
            "title": "Mantle convection",
            "body": "Hot rock rises and sinks in slow loops, dragging the plates a few centimeters a year."
          },
          {
            "emoji": "🌋",
            "title": "Ring of Fire",
            "body": "Plate boundaries circle the Pacific Ocean, home to most volcanoes and big quakes."
          }
        ]
      }
    },
    {
      "kind": "concept",
      "title": "Wearing down the land and building soil",
      "body": "Weathering breaks rock into small pieces, erosion carries those pieces away, and deposition happens when moving water, wind, or ice slows down and drops its sediment — building deltas and sandbars. Those loose bits stack into soil layers: dark, humus-rich topsoil (full of decayed plants and animals) on top, then subsoil below it, and solid bedrock at the very bottom.",
      "say": "Weathering breaks rock into small pieces, erosion carries those pieces away, and deposition happens when moving water, wind, or ice slows down and drops the sediment it was carrying, building features like deltas and sandbars. Those loose bits settle into soil layers. On top is dark topsoil that is rich in humus, the decayed plant and animal material. Below that is the subsoil, and at the very bottom is solid bedrock.",
      "analogy": "A river is like a delivery truck: it picks up cargo, hauls it downstream, and drops it off when it slows down.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🪨",
            "title": "Topsoil",
            "body": "Dark upper layer rich in humus from decayed plants and animals."
          },
          {
            "emoji": "🟤",
            "title": "Subsoil",
            "body": "Layer beneath topsoil with minerals but little humus."
          },
          {
            "emoji": "🧱",
            "title": "Bedrock",
            "body": "Solid rock at the bottom of the soil profile."
          }
        ]
      }
    },
    {
      "kind": "concept",
      "title": "Earth's air, weather, and instruments",
      "body": "Almost all weather — clouds, rain, and storms — happens in the troposphere, the lowest layer of the atmosphere where the air and nearly all water vapor sit; the amount of that water vapor is called humidity. Air always flows from high pressure toward low pressure, and that moving air is wind — scientists measure wind with an anemometer, air pressure with a barometer, temperature with a thermometer, and earthquake shaking with a seismograph.",
      "say": "Almost all weather, including clouds, rain, and storms, happens in the troposphere, the lowest layer of the atmosphere where the air and nearly all the water vapor sit. The amount of water vapor in the air is called humidity. Air always flows from areas of high pressure toward areas of low pressure, and that moving air is what we call wind. Scientists measure wind speed with an anemometer, air pressure with a barometer, temperature with a thermometer, and earthquake shaking with a seismograph.",
      "analogy": "Wind is like air rushing out of a squeezed balloon: it moves from the high-pressure squeeze toward the low-pressure open air.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🌦️",
            "title": "Troposphere",
            "body": "Lowest layer of the atmosphere, where nearly all weather forms."
          },
          {
            "emoji": "💧",
            "title": "Humidity",
            "body": "How much water vapor is present in the air."
          },
          {
            "emoji": "📈",
            "title": "Seismograph",
            "body": "Records earthquake shaking as wiggly lines."
          }
        ]
      }
    }
  ],
  "s.8.physics": [
    {
      "kind": "concept",
      "title": "Electricity flows in loops",
      "body": "Electric current only flows around a complete, unbroken loop called a circuit, so a bulb lights only when the switch is closed and the path is joined. In a series circuit everything shares one loop, so switching one part off stops all of it; in a parallel circuit each device gets its own loop, so switching one off leaves the others running, which is why house outlets are wired in parallel.",
      "say": "Electric current only flows around a complete, unbroken loop called a circuit, so a bulb lights only when the switch is closed and the path is joined. In a series circuit everything shares one loop, so switching one part off stops all of it. In a parallel circuit each device gets its own loop, so switching one off leaves the others running, which is why house outlets are wired in parallel.",
      "analogy": "A circuit is like a running track: racers can only keep going if the loop is unbroken, and an open switch is a gap in the track.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🔗",
            "title": "Series",
            "body": "One shared loop. Turn one device off and the whole loop stops."
          },
          {
            "emoji": "🪜",
            "title": "Parallel",
            "body": "Each device has its own loop, so one can switch off and the rest stay on."
          }
        ]
      }
    },
    {
      "kind": "show",
      "title": "Magnets, electromagnets, and static shocks",
      "body": "A bar magnet is always magnetic, but an electromagnet is a coil of wire that becomes magnetic only while electric current flows, so it can be switched on and off, which is how scrapyard cranes grab and drop metal. Static electricity works differently: shuffling on carpet rubs tiny electrons onto your body, and when you touch a metal doorknob those extra electrons suddenly jump across as a quick spark.",
      "say": "A bar magnet is always magnetic, but an electromagnet is a coil of wire that becomes magnetic only while electric current flows, so it can be switched on and off. That is how scrapyard cranes grab and drop metal. Static electricity works differently: shuffling on carpet rubs tiny electrons onto your body, and when you touch a metal doorknob those extra electrons suddenly jump across as a quick spark.",
      "analogy": "An electromagnet is like a flashlight beam you can flick on and off, while a bar magnet is like a candle that is always lit."
    },
    {
      "kind": "concept",
      "title": "Waves, heat, and light",
      "body": "Wave speed equals frequency times wavelength, so if two waves move at the same speed, the one with the higher frequency must have a shorter wavelength. Heat moves three ways: conduction through touching solids, convection as warm fluid rises and cool fluid sinks in a loop, and radiation as rays across empty space. Light is an electromagnetic wave that needs no matter, so it crosses the vacuum of space, and when it passes between air and water it changes speed and bends (refraction), making a straw look bent; materials are transparent when light passes straight through, translucent when light scatters, and opaque when light is blocked.",
      "say": "Wave speed equals frequency times wavelength, so if two waves move at the same speed, the one with the higher frequency must have a shorter wavelength. Heat moves three ways: conduction through touching solids, convection as warm fluid rises and cool fluid sinks in a loop, and radiation as rays across empty space. Light is an electromagnetic wave that needs no matter, so it crosses the vacuum of space. When it passes between air and water it changes speed and bends, which is called refraction, making a straw look bent. Materials are transparent when light passes straight through, translucent when light scatters, and opaque when light is blocked.",
      "analogy": "Refraction is like a shopping cart veering as one wheel hits grass while the other stays on smooth pavement.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🤝",
            "title": "Conduction",
            "body": "Heat passes between touching solids, like a spoon warming in soup."
          },
          {
            "emoji": "♨️",
            "title": "Convection",
            "body": "Warm air or water rises and cool sinks in a circular loop."
          },
          {
            "emoji": "☀️",
            "title": "Radiation",
            "body": "Heat and light travel as rays, even across empty space."
          }
        ]
      }
    }
  ],
  "s.9.biology": [
    {
      "kind": "concept",
      "title": "Chromosomes and the DNA code",
      "body": "A typical human body cell holds 46 chromosomes arranged in 23 matching pairs. The DNA inside is written with just four chemical bases: adenine (A), thymine (T), guanine (G), and cytosine (C), and they always pair up A with T and G with C.",
      "say": "A typical human body cell holds forty-six chromosomes arranged in twenty-three matching pairs. The D N A inside is written with just four chemical bases: adenine, thymine, guanine, and cytosine. They always pair up: A with T, and G with C. Watch out for uracil, that base only shows up in R N A, never in D N A.",
      "analogy": "Think of A, T, G, and C as four letters that spell out every instruction in your body's manual.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🧬",
            "title": "46 in 23 pairs",
            "body": "Every body cell carries 46 chromosomes, one set of 23 from each parent."
          },
          {
            "emoji": "🔤",
            "title": "A-T, G-C",
            "body": "A pairs with T, and G pairs with C. Uracil replaces thymine only in RNA."
          }
        ]
      }
    },
    {
      "kind": "concept",
      "title": "Sex, genotype, and inheritance patterns",
      "body": "One of the 23 pairs is the sex chromosomes: females are usually XX and males are usually XY. Because every egg carries an X but sperm carry either an X or a Y, the father's sperm decides the child's sex; your genotype is the alleles you carry, while your phenotype is the traits you can actually see or measure.",
      "say": "One of the twenty-three pairs is the sex chromosomes. Females are usually X X, and males are usually X Y. Every egg carries an X, but sperm carry either an X or a Y, so the father's sperm decides the child's sex. Two more words to know: your genotype is the set of alleles you carry, and your phenotype is the traits you can actually see or measure, like eye color or height. Some traits, like height, are controlled by many genes working together. That is called polygenic inheritance, and it makes traits vary smoothly across a wide range.",
      "analogy": "Genotype is the recipe hidden in the cookbook, phenotype is the finished dish on the plate.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "♀️",
            "title": "Female = XX",
            "body": "Two X chromosomes."
          },
          {
            "emoji": "♂️",
            "title": "Male = XY",
            "body": "One X and one Y; the father's sperm sets this."
          }
        ]
      }
    },
    {
      "kind": "example",
      "title": "Punnett squares and Photo 51",
      "body": "A Punnett square predicts offspring from two parents; a cross of Bb x bb gives half Bb and half bb, so 1/2 are homozygous recessive. Scientists first pictured DNA's twisted double-helix shape thanks to Rosalind Franklin's X-ray image called Photo 51.",
      "say": "A Punnett square predicts what offspring two parents can have. Let us cross a Bb parent with a b b parent. And here is a bit of history: scientists first saw D N A's twisted double-helix shape thanks to Rosalind Franklin's famous X-ray image known as Photo fifty-one.",
      "reveal": [
        "The Bb parent can pass on B or b. The bb parent can only pass on b.",
        "Combine them: B from one plus b gives Bb; b plus b gives bb.",
        "Fill the square: Bb, Bb, bb, bb.",
        "That is half Bb and half bb, so 1/2 of the offspring are homozygous recessive (bb)."
      ]
    }
  ],
  "s.k.weather": [
    {
      "kind": "concept",
      "title": "Wind is moving air you can feel",
      "body": "Wind is moving air, and air is invisible, so we cannot see the wind itself, but we can feel it brush our face and watch it push things, like making a flag flap on its pole. At an airport, a big stripy tube called a windsock fills with that moving air and points the way the wind is blowing.",
      "say": "Wind is moving air, and air is invisible, so we cannot see the wind itself. But we can feel it brush our face and watch it push things, like making a flag flap on its pole. At an airport, a big stripy tube called a windsock fills with that moving air and points the way the wind is blowing.",
      "analogy": "Wind is like an invisible hand giving a gentle push.",
      "widget": {
        "w": "tapPick",
        "prompt": "A flag is flapping hard on its pole. What is the weather like?",
        "options": [
          {
            "label": "Windy",
            "correct": true
          },
          {
            "label": "Calm"
          },
          {
            "label": "Foggy"
          }
        ]
      }
    },
    {
      "kind": "concept",
      "title": "Water on the grass: dew, frost, and melting",
      "body": "On a cool morning, tiny water drops called dew collect on the grass overnight, even when it did not rain, and on very cold nights that water freezes into thin, white, sparkly ice called frost. Ice and snow are just frozen water, so warmth from your hand, warm air, or the sun makes them melt back into drippy liquid water, which is why an ice cube melts in your hand and a snowman melts on a warm day.",
      "say": "On a cool morning, tiny water drops called dew collect on the grass overnight, even when it did not rain. On very cold nights that water freezes into thin, white, sparkly ice called frost. Ice and snow are just frozen water, so warmth from your hand, warm air, or the sun makes them melt back into drippy liquid water. That is why an ice cube melts in your hand and a snowman melts on a warm day.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "💧",
            "title": "Dew",
            "body": "Tiny water drops on the grass in the morning."
          },
          {
            "emoji": "❄️",
            "title": "Frost",
            "body": "White sparkly ice on the grass on cold mornings."
          }
        ]
      }
    },
    {
      "kind": "concept",
      "title": "Storms and the fall season",
      "body": "In a storm, lightning is a bright flash of light and thunder is the loud rumbling booming sound it makes, so if you hear thunder the safest thing to do is go inside a safe building and watch from a window. There is also a season called fall, or autumn, that comes before winter, when many leaves turn red, orange, and yellow and drop from the trees.",
      "say": "In a storm, lightning is a bright flash of light and thunder is the loud rumbling booming sound it makes. If you hear thunder, the safest thing to do is go inside a safe building and watch from a window. There is also a season called fall, or autumn, that comes before winter, when many leaves turn red, orange, and yellow and drop from the trees.",
      "widget": {
        "w": "tapPick",
        "prompt": "You hear thunder while playing outside. What is the safest thing to do?",
        "options": [
          {
            "label": "Go inside a safe building",
            "correct": true
          },
          {
            "label": "Climb the tallest tree"
          },
          {
            "label": "Stand alone in a big field"
          }
        ]
      }
    }
  ],
  "sp.0.colors": [
    {
      "kind": "concept",
      "title": "More color words",
      "body": "There are more colors to name. Verde is green like grass and leaves, rosado (also called rosa) is pink like a flamingo, and anaranjado (also called naranja) is orange like a pumpkin.",
      "say": "There are more colors to name. Verde is green, like grass and leaves. Rosado, also called rosa, is pink, like a flamingo. And anaranjado, also called naranja, is orange, like a pumpkin.",
      "analogy": "The word naranja means both the fruit and its color, just like an orange is orange.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🌿",
            "title": "verde",
            "body": "green, like grass"
          },
          {
            "emoji": "🦩",
            "title": "rosado / rosa",
            "body": "pink, like a flamingo"
          },
          {
            "emoji": "🎃",
            "title": "anaranjado / naranja",
            "body": "orange, like a pumpkin"
          }
        ]
      }
    },
    {
      "kind": "show",
      "title": "Look up at the sky",
      "body": "Cielo means sky. When someone asks \"¿De qué color es el cielo?\" they are asking what color the sky is, and on a sunny day it is azul, which means blue.",
      "say": "Cielo means sky. When someone asks, what color is the cielo, they are asking what color the sky is. On a sunny day it is azul, which means blue.",
      "analogy": "Cielo, so look up high, and you will see it is blue."
    },
    {
      "kind": "concept",
      "title": "Counting one to five",
      "body": "Spanish numbers help you count things. Uno is one, dos is two, tres is three, cuatro is four, and cinco is five.",
      "say": "Spanish numbers help you count things. Uno is one, dos is two, tres is three, cuatro is four, and cinco is five.",
      "analogy": "Cinco sounds a little like sink, and you have five fingers to wash at the sink."
    }
  ],
  "sp.0.greetings": [
    {
      "kind": "concept",
      "title": "Greet by the clock",
      "body": "Spanish has a special hello for each part of the day: buenos días for good morning, buenas tardes for good afternoon, and buenas noches for good night or evening.",
      "say": "Spanish has a special hello for each part of the day. Say bwe-nos DEE-as for good morning, bwe-nas TAR-des for good afternoon, and bwe-nas NO-ches for good night or evening.",
      "analogy": "Just like you might say good morning at breakfast and good night at bedtime, Spanish changes the greeting with the sun.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "☀️",
            "title": "Buenos días",
            "body": "Good morning (daytime). Días means days."
          },
          {
            "emoji": "🌤️",
            "title": "Buenas tardes",
            "body": "Good afternoon (after midday). Tardes means afternoons."
          },
          {
            "emoji": "🌙",
            "title": "Buenas noches",
            "body": "Good night or evening. Noches means nights."
          }
        ]
      }
    },
    {
      "kind": "show",
      "title": "Polite little words",
      "body": "Say por favor for please when you ask for something, and if someone thanks you with gracias, answer de nada, which means you're welcome. If you bump into someone, say perdón for sorry or excuse me.",
      "say": "Say por favor for please when you ask for something. If someone thanks you with gracias, answer de nada, which means you're welcome. If you bump into someone, say per-DOHN for sorry or excuse me.",
      "analogy": "Perdón sounds almost exactly like the English word pardon, so it is easy to remember.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🙏",
            "title": "Por favor",
            "body": "Please, when you ask nicely."
          },
          {
            "emoji": "💛",
            "title": "De nada",
            "body": "You're welcome, the reply to gracias."
          },
          {
            "emoji": "🤭",
            "title": "Perdón",
            "body": "Sorry or excuse me."
          }
        ]
      }
    },
    {
      "kind": "example",
      "title": "Yes and no",
      "body": "Two of the easiest words: sí means yes and no means no, spelled just like in English. Now you can agree, decline, and stay polite all day long.",
      "say": "Two of the easiest words. See means yes, and no means no, spelled just like in English. Now you can agree, decline, and stay polite all day long.",
      "reveal": [
        "Someone offers you a snack and you want it: say sí for yes.",
        "You are full and do not want more: say no.",
        "They hand it over, so you say gracias, and they answer de nada."
      ]
    }
  ],
  "sp.1.animals": [
    {
      "kind": "concept",
      "title": "Two name tags: el and la",
      "body": "Spanish has two little words for \"the\": el and la. Some animals use la, like la vaca (the cow), la tortuga (the turtle), and la mariposa (the butterfly).",
      "say": "Spanish has two little words for the. They are el and la. Some animals use la, like la vaca the cow, la tortuga the turtle, and la mariposa the butterfly.",
      "analogy": "El and la are like two different colored name tags that both say the.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🐄",
            "title": "la vaca",
            "body": "the cow, it says muu and gives milk"
          },
          {
            "emoji": "🐢",
            "title": "la tortuga",
            "body": "the turtle, slow with a shell"
          },
          {
            "emoji": "🦋",
            "title": "la mariposa",
            "body": "the butterfly, pretty wings on flowers"
          }
        ]
      }
    },
    {
      "kind": "example",
      "title": "More animals with el",
      "body": "Many animals use el: el pájaro (the bird), el león (the lion), el caballo (the horse), and el pez (the fish).",
      "say": "Many animals use el. El pajaro is the bird, el leon is the lion, el caballo is the horse, and el pez is the fish.",
      "reveal": [
        "el pájaro sings and flies in the tree, so el pájaro means the bird",
        "el león roars and rules the jungle, so el león means the lion",
        "el caballo gallops and you can ride it, so el caballo means the horse",
        "el pez swims in the water, so el pez means the fish"
      ]
    },
    {
      "kind": "try",
      "title": "Your turn",
      "body": "You see a cow at the farm. Which words name it in Spanish?",
      "say": "You see a cow at the farm. Which words name it in Spanish?",
      "widget": {
        "w": "tapPick",
        "prompt": "The cow is…",
        "options": [
          {
            "label": "la vaca",
            "correct": true
          },
          {
            "label": "el pájaro"
          },
          {
            "label": "la mariposa"
          }
        ]
      }
    }
  ],
  "sp.1.family": [
    {
      "kind": "concept",
      "title": "More people in the family",
      "body": "Meet more family: abuela is grandma and abuelo is grandpa, hermana is sister and hermano is brother, prima is a girl cousin and primo is a boy cousin. Padre is a grown-up word for dad, madre is a grown-up word for mom, and a bebe is a baby.",
      "say": "Meet more family. Abuela is grandma and abuelo is grandpa. Hermana is sister and hermano is brother. Prima is a girl cousin and primo is a boy cousin. Padre is a grown up word for dad. Madre is a grown up word for mom. And a bebe is a baby.",
      "analogy": "Just like tia and tio, the girl word ends in a and the boy word ends in o.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "👵",
            "title": "Grandparents",
            "body": "abuela = grandma, abuelo = grandpa"
          },
          {
            "emoji": "🧒",
            "title": "Siblings",
            "body": "hermana = sister, hermano = brother"
          },
          {
            "emoji": "👦",
            "title": "Cousins",
            "body": "prima = girl cousin, primo = boy cousin"
          },
          {
            "emoji": "👶",
            "title": "Parents and baby",
            "body": "madre = mom, padre = dad, bebe = baby"
          }
        ]
      }
    },
    {
      "kind": "show",
      "title": "Action words and a group of -os",
      "body": "Family action words tell what people do: cocina means cooks, juegan means play, and tiene means has. To say I love you, say te quiero. When a group has boys and girls together, use the -os word, so hijos means children and primos means cousins.",
      "say": "Family action words tell what people do. Cocina means cooks. Juegan means play. And tiene means has. To say I love you, say te quiero. When a group has boys and girls together, use the O S word. So hijos means children and primos means cousins.",
      "analogy": "Cocina sounds a little like kitchen, and a kitchen is where you cook.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🍳",
            "title": "cocina",
            "body": "cooks"
          },
          {
            "emoji": "⚽",
            "title": "juegan",
            "body": "they play"
          },
          {
            "emoji": "🤲",
            "title": "tiene",
            "body": "has"
          },
          {
            "emoji": "❤️",
            "title": "te quiero",
            "body": "I love you"
          }
        ]
      }
    },
    {
      "kind": "example",
      "title": "Read a whole family sentence",
      "body": "Put the words together to read real sentences. A counting question starts with cuantos, which means how many, and tienes means you have.",
      "say": "Put the words together to read real sentences. A counting question starts with cuantos, which means how many, and tienes means you have.",
      "reveal": [
        "Mi abuela cocina: mi is my, abuela is grandma, cocina is cooks, so it means My grandma cooks.",
        "Mis primos juegan: mis primos is my cousins, juegan is play, so it means My cousins play.",
        "Mi tia tiene un bebe: tiene is has and un bebe is one baby, so it means My aunt has a baby.",
        "Cuantos hermanos tienes: cuantos is how many, hermanos is brothers and sisters, tienes is you have, so it asks How many brothers and sisters do you have."
      ]
    }
  ],
  "sp.1.food": [
    {
      "kind": "concept",
      "title": "Four yummy foods",
      "body": "Add four foods to your tray: la manzana is apple, el helado is ice cream, el queso is cheese, and el pollo is chicken.",
      "say": "Add four foods to your tray. La manzana is apple. El helado is ice cream. El queso is cheese. And el pollo is chicken.",
      "analogy": "Think of a taco: the pollo is the chicken and the queso is the cheese on top.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🍎",
            "title": "la manzana",
            "body": "apple"
          },
          {
            "emoji": "🍦",
            "title": "el helado",
            "body": "ice cream"
          },
          {
            "emoji": "🧀",
            "title": "el queso",
            "body": "cheese"
          },
          {
            "emoji": "🍗",
            "title": "el pollo",
            "body": "chicken"
          }
        ]
      }
    },
    {
      "kind": "concept",
      "title": "Say what you like: Me gusta",
      "body": "To tell someone you like a food, say Me gusta before its name, so Me gusta el helado means I like ice cream.",
      "say": "To tell someone you like a food, say me gusta before its name. Me gusta el helado means I like ice cream.",
      "analogy": "Me gusta is like giving a food a thumbs up."
    },
    {
      "kind": "example",
      "title": "Ask for food: Quiero",
      "body": "Quiero means I want, and por favor means please, so you can politely ask for any food you see.",
      "say": "Quiero means I want, and por favor means please. So you can politely ask for any food you see.",
      "reveal": [
        "Quiero = I want",
        "Quiero pizza, por favor = I want pizza, please",
        "Más = more",
        "Quiero más, por favor = I want more, please"
      ],
      "widget": {
        "w": "tapPick",
        "prompt": "What does \"Quiero pizza, por favor\" mean?",
        "options": [
          {
            "label": "I want pizza, please",
            "correct": true
          },
          {
            "label": "Where is the pizza?"
          },
          {
            "label": "The pizza is cold"
          }
        ]
      }
    }
  ],
  "sp.10.idioms": [
    {
      "kind": "concept",
      "title": "More packages to learn whole",
      "body": "Just like tomar el pelo, these modismos are packages: their meaning has nothing to do with the literal words. Estar sin blanca means to have no money, because blanca was the name of an old, nearly worthless coin. Echar una mano means to help someone, not to throw a hand.",
      "say": "Just like tomar el pelo, these expressions are packages. Their meaning has nothing to do with the literal words. Estar sin blanca means to have no money, because blanca was the name of an old, nearly worthless coin. Echar una mano means to help someone, not to throw a hand.",
      "analogy": "Think of each idiom as a wrapped gift: the wrapping paper is the literal words, but the real gift inside is the hidden meaning.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "💸",
            "title": "Estar sin blanca",
            "body": "To have no money, to be broke."
          },
          {
            "emoji": "🤝",
            "title": "Echar una mano",
            "body": "To help or lend a hand to someone."
          }
        ]
      }
    },
    {
      "kind": "show",
      "title": "Comfort, indifference, and looking away",
      "body": "Estar como pez en el agua means to feel completely at ease, like a fish perfectly at home in water. Importar un pepino means to not care at all, since a cucumber stands for something worthless. Hacerse la vista gorda means to turn a blind eye, to notice a problem but pretend not to see it.",
      "say": "Estar como pez en el agua means to feel completely at ease, like a fish perfectly at home in water. Importar un pepino means to not care at all, since a cucumber stands for something worthless. Hacerse la vista gorda means to turn a blind eye, to notice a problem but pretend not to see it.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🐟",
            "title": "Como pez en el agua",
            "body": "To feel totally comfortable, in your element."
          },
          {
            "emoji": "🥒",
            "title": "Importar un pepino",
            "body": "To not care at all about something."
          },
          {
            "emoji": "🙈",
            "title": "Hacerse la vista gorda",
            "body": "To turn a blind eye, pretend not to notice."
          }
        ]
      }
    },
    {
      "kind": "example",
      "title": "Price, efficiency, and friendship",
      "body": "Three more to bank: cuesta un ojo de la cara means something is very expensive, matar dos pájaros de un tiro means solving two things with one action, and ser uña y carne means two people are inseparable and very close.",
      "say": "Three more to bank. Cuesta un ojo de la cara means something is very expensive. Matar dos pajaros de un tiro means solving two things with one action. And ser una y carne means two people are inseparable and very close.",
      "reveal": [
        "Cuesta un ojo de la cara: literally it costs an eye from your face, but it means very expensive, like the English costs an arm and a leg.",
        "Matar dos pajaros de un tiro: to kill two birds with one shot, meaning to accomplish two goals with a single effort.",
        "Ser una y carne: like a fingernail and its flesh, stuck together, so it describes people who are inseparable and very united."
      ],
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "👁️",
            "title": "Cuesta un ojo de la cara",
            "body": "It is very expensive."
          },
          {
            "emoji": "🐦",
            "title": "Matar dos pájaros de un tiro",
            "body": "Two things done with one action."
          },
          {
            "emoji": "💅",
            "title": "Ser uña y carne",
            "body": "Inseparable, very close friends."
          }
        ]
      }
    }
  ],
  "sp.10.reading": [
    {
      "kind": "concept",
      "title": "Idioms: don't read them literally",
      "body": "An idiom is a phrase whose real meaning is different from its words. In Spanish, \"se le fue el santo al cielo\" means someone completely forgot something, \"valió la pena\" means it was worth it, and \"pan comido\" means something is very easy.",
      "say": "An idiom is a phrase whose real meaning is different from its words. In Spanish, se le fue el santo al cielo means someone completely forgot something. Vale la pena means it was worth it. And pan comido means something is very easy.",
      "analogy": "In English \"a piece of cake\" is not about dessert; it means easy. Spanish idioms work the same way.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🧠",
            "title": "Se le fue el santo al cielo",
            "body": "He or she completely forgot."
          },
          {
            "emoji": "💪",
            "title": "Valió la pena",
            "body": "It was worth it."
          },
          {
            "emoji": "🍞",
            "title": "Pan comido",
            "body": "Very easy to do."
          }
        ]
      }
    },
    {
      "kind": "concept",
      "title": "Culture clues you should know",
      "body": "El Día de los Muertos is a Mexican tradition that joyfully honors and remembers loved ones who have died. El Día de Reyes, on January 6, is when children traditionally receive gifts. Spanish is an official language in around 20 countries.",
      "say": "The Day of the Dead is a Mexican tradition that joyfully honors and remembers loved ones who have died. The Day of the Kings, on January sixth, is when children traditionally receive gifts. And Spanish is an official language in around twenty countries.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🌼",
            "title": "Día de los Muertos",
            "body": "Honors and remembers loved ones who died."
          },
          {
            "emoji": "🎁",
            "title": "Día de Reyes",
            "body": "January 6: gifts for children."
          },
          {
            "emoji": "🌎",
            "title": "Spanish worldwide",
            "body": "Official in about 20 countries."
          }
        ]
      }
    },
    {
      "kind": "example",
      "title": "Reading numbers and time",
      "body": "Reading questions sometimes hide the answer in a small math step. If a train leaves at nine o'clock and someone arrives half an hour before, subtract thirty minutes to get eight thirty.",
      "say": "Reading questions sometimes hide the answer in a small math step. If a train leaves at nine o'clock and someone arrives half an hour before, subtract thirty minutes to get eight thirty.",
      "reveal": [
        "Read the fact: the train leaves at nine o'clock.",
        "Read the clue: they arrived half an hour, thirty minutes, before.",
        "Do the math: nine o'clock minus thirty minutes is eight thirty.",
        "Answer: they arrived at eight thirty, a las ocho y media."
      ],
      "widget": {
        "w": "tapPick",
        "prompt": "The bus leaves at seven o'clock and Ana arrives half an hour early. What time did she arrive?",
        "options": [
          {
            "label": "A las seis y media",
            "correct": true
          },
          {
            "label": "A las siete y media"
          },
          {
            "label": "A las siete en punto"
          }
        ]
      }
    }
  ],
  "sp.11.professional": [
    {
      "kind": "concept",
      "title": "Words you will meet at work",
      "body": "A few workplace nouns show up constantly: \"el ascenso\" is a promotion to a higher role, \"la reunión virtual\" is an online or video meeting, and \"una entrevista\" is an interview. Learn them as a set so they surface instantly in an email.",
      "say": "A few workplace nouns show up constantly. El ascenso is a promotion to a higher role. La reunion virtual is an online or video meeting. And una entrevista is an interview. Learn them as a set so they surface instantly in an email.",
      "analogy": "Think of them as your work badge vocabulary, the words you flash every day at the office.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "📈",
            "title": "el ascenso",
            "body": "a promotion to a higher position"
          },
          {
            "emoji": "💻",
            "title": "la reunión virtual",
            "body": "an online or video meeting"
          },
          {
            "emoji": "🤝",
            "title": "una entrevista",
            "body": "a job interview"
          }
        ]
      }
    },
    {
      "kind": "show",
      "title": "Sound gracious and sign off right",
      "body": "Close a formal email with \"Atentamente,\" the equivalent of \"Sincerely.\" When you accept a task, say \"Claro, con gusto lo termino hoy mismo\" (gladly, I will finish it today), and when thanked, reply \"No hay de qué, quedo a su disposición\" (you are welcome, I remain at your service).",
      "say": "Close a formal email with Atentamente, the equivalent of Sincerely. When you accept a task, say Claro, con gusto lo termino hoy mismo, which means gladly, I will finish it today. And when someone thanks you, reply No hay de que, quedo a su disposicion, which means you are welcome, I remain at your service.",
      "analogy": "These are the polite handshakes of email: the same warm words every professional reuses."
    },
    {
      "kind": "example",
      "title": "Confirm you got the message",
      "body": "When a message needs an acknowledgement before you can fully answer, confirm receipt and promise a prompt reply: \"He recibido su correo y le responderé a la brevedad.\" It is complete, formal, and names the next step.",
      "say": "When a message needs an acknowledgement before you can fully answer, confirm you received it and promise a prompt reply. He recibido su correo y le respondere a la brevedad. It is complete, formal, and names the next step.",
      "reveal": [
        "He recibido su correo means I have received your email.",
        "y le responderé means and I will reply to you.",
        "a la brevedad means as soon as possible, promising a quick follow-up."
      ]
    }
  ],
  "sp.12.fluency": [
    {
      "kind": "concept",
      "title": "Watch out for false friends",
      "body": "A falso amigo (false friend) is a Spanish word that looks like an English one but means something different. Éxito means success, not exit, and embarazada means pregnant, not embarrassed.",
      "say": "A false friend is a Spanish word that looks like an English one but means something completely different. Exito means success, not exit. And embarazada means pregnant, not embarrassed.",
      "analogy": "They are like look-alike twins: same face, totally different personality.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🏆",
            "title": "éxito",
            "body": "means success (un gran éxito is a big hit), not exit"
          },
          {
            "emoji": "🤰",
            "title": "embarazada",
            "body": "means pregnant, not embarrassed"
          }
        ]
      }
    },
    {
      "kind": "show",
      "title": "Idioms, greetings, and one more connector",
      "body": "Idioms do not translate word for word: estar en las nubes literally means to be in the clouds, but it describes someone daydreaming or distracted. Greet people casually with ¿Qué tal? (how's it going?), and contrast two ideas with en cambio (on the other hand).",
      "say": "Idioms do not translate word for word. Estar en las nubes literally means to be in the clouds, but it describes someone who is daydreaming or distracted. Greet people casually by saying, how's it going. And to contrast two ideas, use a phrase that works like, on the other hand.",
      "analogy": "En cambio works just like no obstante's cousin: both flag a contrast, one idea set against another."
    },
    {
      "kind": "example",
      "title": "Sounding fluent in real conversation",
      "body": "Fluency also means having phrases ready to keep a conversation flowing. You can buy time and paraphrase, agree warmly, or interrupt politely, and the biggest driver of all is regular practice.",
      "say": "Fluency also means having phrases ready to keep a conversation flowing. You can buy time and paraphrase, agree warmly, or interrupt politely. And the biggest driver of all is regular practice.",
      "reveal": [
        "Buy time and paraphrase: Entonces, lo que dices es que... (So what you're saying is...)",
        "Agree strongly: ¡Claro que sí! (Of course!)",
        "Interrupt politely to add something: Perdón, ¿puedo añadir algo? (Sorry, may I add something?)",
        "Grow fluency: practice speaking, listening, and reading real Spanish regularly. Consistency beats cramming."
      ]
    }
  ],
  "sp.12.register": [
    {
      "kind": "concept",
      "title": "Who is 'you all'? ustedes vs vosotros",
      "body": "For \"you all,\" Spain uses vosotros in casual speech, but most of Latin America uses ustedes for everyone, formal or casual. So in Latin America, ustedes is the pronoun that replaces vosotros in every register.",
      "say": "For you all, Spain uses vosotros in casual speech, but most of Latin America uses ustedes for everyone, formal or casual. So in Latin America, ustedes is the pronoun that replaces vosotros in every register.",
      "analogy": "Think of vosotros as a regional accent Spain keeps at home, while ustedes is the version that travels everywhere in Latin America.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🇪🇸",
            "title": "Spain",
            "body": "vosotros = casual you all; ustedes = formal you all"
          },
          {
            "emoji": "🌎",
            "title": "Latin America",
            "body": "ustedes = you all for BOTH casual and formal"
          }
        ]
      }
    },
    {
      "kind": "example",
      "title": "Commands: tú vs usted",
      "body": "A command changes shape with register. The casual tú command sounds direct, while the formal usted command flips the vowel: for -ar verbs the usted form ends in -e, and object pronouns attach to positive commands.",
      "say": "A command changes shape with register. The casual command sounds direct, while the formal command flips the vowel: for a r verbs the formal form ends in the e sound, and object pronouns attach to positive commands.",
      "reveal": [
        "Sit down: casual tú = Siéntate, por favor / formal usted = Siéntese, por favor.",
        "Call me: casual tú = Llámame al rato / formal usted = Llámeme, por favor.",
        "Notice the -ar verb ending flips to -e for usted (Siéntate becomes Siéntese).",
        "The formal usted form is what you use with a professor: Disculpe, ¿tiene un momento? (tiene is the usted form of tienes)."
      ]
    },
    {
      "kind": "example",
      "title": "Polite requests and formal sign-offs",
      "body": "To sound extra polite to a boss or client, use the conditional podría (could you) with an usted verb, and attach usted object pronouns like -le. Formal writing also uses set closings and the possessive su.",
      "say": "To sound extra polite to a boss or client, use the conditional could you with a formal verb, and attach formal object pronouns. Formal writing also uses set closings and the formal possessive su.",
      "reveal": [
        "Request: ¿Podría enviarme el informe? (podría = the courteous conditional could you) beats the blunt Mándame el informe ya.",
        "Formal object pronoun: Ha sido un placer atenderle uses -le, the usted form of you.",
        "Formal sign-off: Quedo a la espera de su respuesta. Muchas gracias — note su, the usted possessive your.",
        "Other formal courtesies to recognize: Que tenga usted un buen día, Reciba un cordial saludo, Le saludo atentamente."
      ]
    }
  ],
  "sp.2.body": [
    {
      "kind": "show",
      "title": "More words for your face",
      "body": "Los ojos are your two eyes that see. La nariz is your nose in the middle of your face, la frente is the smooth part above your eyebrows, and las cejas are the little lines of hair over your eyes.",
      "say": "Los ojos are your two eyes that see. La nariz is your nose in the middle of your face. La frente is the smooth part above your eyebrows. Las cejas are the little lines of hair over your eyes.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "👀",
            "title": "los ojos",
            "body": "your two eyes that see"
          },
          {
            "emoji": "👃",
            "title": "la nariz",
            "body": "your nose, you smell with it"
          },
          {
            "emoji": "🙂",
            "title": "la frente",
            "body": "smooth part above your eyebrows"
          },
          {
            "emoji": "🤨",
            "title": "las cejas",
            "body": "hair over your eyes"
          }
        ]
      }
    },
    {
      "kind": "show",
      "title": "Words from head to legs",
      "body": "La garganta is your throat inside your neck, and el corazón is your heart that goes thump-thump in your chest. Las piernas are your long legs for running, and el codo is the bendy middle of your arm.",
      "say": "La garganta is your throat inside your neck. El corazon is your heart that goes thump-thump in your chest. Las piernas are your long legs for running. El codo is the bendy middle of your arm.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "😷",
            "title": "la garganta",
            "body": "throat inside your neck"
          },
          {
            "emoji": "❤️",
            "title": "el corazón",
            "body": "heart, thump-thump in your chest"
          },
          {
            "emoji": "🦵",
            "title": "las piernas",
            "body": "legs for running and jumping"
          },
          {
            "emoji": "💪",
            "title": "el codo",
            "body": "the bendy middle of your arm"
          }
        ]
      }
    },
    {
      "kind": "concept",
      "title": "el, la, los, las: the little word for 'the'",
      "body": "One body part uses el or la, like el codo and la nariz. When there are two or more, use los or las, like los ojos and las piernas.",
      "say": "One body part uses el or la, like el codo and la nariz. When there are two or more, use los or las, like los ojos and las piernas.",
      "analogy": "It is like choosing one apple or a bunch of apples. The little word changes when there is more than one.",
      "widget": {
        "w": "tapPick",
        "prompt": "You have two of these, so which word for 'the' fits: ___ ojos?",
        "options": [
          {
            "label": "los",
            "correct": true
          },
          {
            "label": "el"
          },
          {
            "label": "la"
          }
        ]
      }
    }
  ],
  "sp.2.days": [
    {
      "kind": "concept",
      "title": "Los siete días de la semana",
      "body": "La semana means the week, and it has siete días (seven days). In order they are: lunes, martes, miércoles, jueves, viernes, sábado, and domingo. Each one is un día, which means a day.",
      "say": "La semana means the week, and it has seven days. In order they are lunes, martes, miercoles, jueves, viernes, sabado, and domingo. Each one is un dia, which means a day.",
      "analogy": "Just like Monday through Sunday, the Spanish week marches in the same order every time.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "📚",
            "title": "School days",
            "body": "lunes, martes, miércoles, jueves, viernes"
          },
          {
            "emoji": "🎉",
            "title": "Weekend",
            "body": "sábado, domingo (el fin de semana)"
          }
        ]
      }
    },
    {
      "kind": "example",
      "title": "Mañana means tomorrow",
      "body": "Mañana means tomorrow, the day that comes next. To find tomorrow, take today and move one day forward in the week. So if today is viernes (Friday), mañana is sábado (Saturday).",
      "say": "Manana means tomorrow, the day that comes next. To find tomorrow, take today and move one day forward in the week. So if today is viernes, which is Friday, then tomorrow is sabado, which is Saturday.",
      "reveal": [
        "Today is viernes (Friday).",
        "Move one day forward: after viernes comes sábado.",
        "So mañana es sábado means tomorrow is Saturday."
      ]
    },
    {
      "kind": "concept",
      "title": "Los doce meses del año",
      "body": "El año (the year) has doce meses (twelve months) in this order: enero, febrero, marzo, abril, mayo, junio, julio, agosto, septiembre, octubre, noviembre, diciembre. Diciembre is the last month, and febrero is the shortest with only 28 days.",
      "say": "The year has twelve months in this order: enero, febrero, marzo, abril, mayo, junio, julio, agosto, septiembre, octubre, noviembre, diciembre. Diciembre is the last month, and febrero is the shortest with only twenty-eight days.",
      "analogy": "Many months look like their English twins: marzo is March, abril is April, and mayo is May.",
      "widget": {
        "w": "tapPick",
        "prompt": "Which month comes right after abril?",
        "options": [
          {
            "label": "mayo",
            "correct": true
          },
          {
            "label": "marzo"
          },
          {
            "label": "julio"
          }
        ]
      }
    }
  ],
  "sp.2.phrases": [
    {
      "kind": "concept",
      "title": "Feelings that start with \"tengo\"",
      "body": "In Spanish, many feelings begin with tengo, which means \"I have.\" Tengo hambre means \"I have hunger\" (I'm hungry), tengo sed means \"I'm thirsty,\" tengo sueño means \"I'm sleepy,\" and tengo frío means \"I'm cold.\"",
      "say": "In Spanish, many feelings begin with tengo, which means I have. Tengo hambre means I have hunger, or I am hungry. Tengo sed means I am thirsty. Tengo sueño means I am sleepy. And tengo frío means I am cold.",
      "analogy": "Hambre sounds a bit like the start of hamburger, so tengo hambre is what your rumbling tummy says before lunch."
    },
    {
      "kind": "show",
      "title": "Handy phrases for every day",
      "body": "Greet people by the time of day: buenos días (good morning), buenas tardes (good afternoon), and buenas noches (good night). When you first meet someone say mucho gusto (nice to meet you), and add por favor (please) whenever you ask for something.",
      "say": "Greet people by the time of day. Buenos días means good morning. Buenas tardes means good afternoon. Buenas noches means good night. When you first meet someone, say mucho gusto, which means nice to meet you. And add por favor, which means please, whenever you ask for something.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🏃",
            "title": "¡Vamos!",
            "body": "Let's go! Come on, let's all get moving."
          },
          {
            "emoji": "⚠️",
            "title": "¡Cuidado!",
            "body": "Watch out! Be careful, there is danger."
          },
          {
            "emoji": "🚪",
            "title": "¡Bienvenidos!",
            "body": "Welcome! So glad you came."
          },
          {
            "emoji": "👋",
            "title": "¡Nos vemos!",
            "body": "See you! A cheerful goodbye."
          },
          {
            "emoji": "🎂",
            "title": "¡Feliz cumpleaños!",
            "body": "Happy birthday!"
          },
          {
            "emoji": "🍀",
            "title": "¡Buena suerte!",
            "body": "Good luck!"
          }
        ]
      }
    },
    {
      "kind": "try",
      "title": "Your turn: pick the phrase",
      "body": "A skateboard is rolling straight toward your friend. Which phrase do you shout to warn them?",
      "say": "A skateboard is rolling straight toward your friend. Which phrase do you shout to warn them?",
      "widget": {
        "w": "tapPick",
        "prompt": "A skateboard is rolling toward your friend. You shout…",
        "options": [
          {
            "label": "¡Cuidado!",
            "correct": true
          },
          {
            "label": "¡Bienvenidos!"
          },
          {
            "label": "Mucho gusto"
          }
        ]
      }
    }
  ],
  "sp.3.ar": [
    {
      "kind": "concept",
      "title": "One more person: él and ella",
      "body": "When one other person does the action, you use él (he) or ella (she), and the ending is -a. Drop the -ar and snap on -a: cantar becomes canta, hablar becomes habla.",
      "say": "When one other person does the action, you use el, meaning he, or ella, meaning she. The ending is just the letter a. Drop the a r and add a. So cantar becomes canta, and hablar becomes habla.",
      "analogy": "Yo gets an o, tu gets as, and el or ella gets a single a."
    },
    {
      "kind": "example",
      "title": "Conjugate cocinar with él/ella",
      "body": "How do we say he cooks or she cooks? Start with cocinar, drop the -ar to get the stem cocin-, then add -a to get cocina.",
      "say": "How do we say he cooks or she cooks? Start with cocinar. Drop the a r to get the stem cocin. Then add a to get cocina.",
      "reveal": [
        "Start with the verb: cocinar (to cook)",
        "Drop the -ar to find the stem: cocin-",
        "El and ella take the ending -a",
        "Add it on: cocin + a = cocina",
        "El cocina, ella cocina (he cooks, she cooks)"
      ]
    },
    {
      "kind": "try",
      "title": "Your turn: él sings",
      "body": "Cantar means to sing. Which ending does él use to say he sings?",
      "say": "Cantar means to sing. Which ending does el use to say he sings?",
      "widget": {
        "w": "tapPick",
        "prompt": "Conjugate cantar for el/ella: el/ella ___",
        "options": [
          {
            "label": "canta",
            "correct": true
          },
          {
            "label": "canto"
          },
          {
            "label": "cantas"
          }
        ]
      }
    }
  ],
  "sp.3.ser": [
    {
      "kind": "show",
      "title": "The five faces of SER",
      "body": "SER changes its shape for each subject: yo soy, tu eres, el/ella es, nosotros somos, ellos/ellas son. So 'Ellos son mis primos' uses son because ellos (they) always takes son.",
      "say": "Ser changes its shape for each subject. I is soy, you is eres, he or she is es, we is somos, and they is son. So they are my cousins uses son, because the word they always takes son.",
      "analogy": "Like one word wearing five different hats depending on who is speaking.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🙋",
            "title": "yo soy / tu eres",
            "body": "I am / you are"
          },
          {
            "emoji": "👧",
            "title": "el o ella es",
            "body": "he or she is (one person)"
          },
          {
            "emoji": "👨‍👩‍👧",
            "title": "nosotros somos / ellos son",
            "body": "we are / they are"
          }
        ]
      }
    },
    {
      "kind": "show",
      "title": "The four faces of ESTAR",
      "body": "ESTAR also changes: yo estoy, tu estas, el/ella esta, ellos/ellas estan. That is why 'Yo estoy en casa' uses estoy and 'Maria esta enojada' uses esta.",
      "say": "Estar also changes for each subject. I is estoy, you is estas, he or she is esta, and they is estan. That is why I am at home uses estoy, and Maria is angry uses esta.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🙋",
            "title": "yo estoy / tu estas",
            "body": "I am / you are"
          },
          {
            "emoji": "🧍",
            "title": "el o ella esta",
            "body": "he or she is (one person)"
          },
          {
            "emoji": "👥",
            "title": "ellos o ellas estan",
            "body": "they are"
          }
        ]
      }
    },
    {
      "kind": "example",
      "title": "Two more jobs for SER: time and material",
      "body": "SER also tells time and what things are made of. For clock time use son for every hour after one (Son las tres = It is three o'clock), and use es only for one o'clock; for material say 'El libro es de papel.'",
      "say": "Ser has two more jobs. It tells the time, using son for every hour after one, so son las tres means it is three o'clock, and using es only for one o'clock. Ser also tells what something is made of, like the book is made of paper.",
      "reveal": [
        "Telling time? Use SER.",
        "One o'clock is singular: Es la una.",
        "Two o'clock and later are plural: Son las dos, Son las tres.",
        "Made of something? Use SER: El libro es de papel."
      ],
      "widget": {
        "w": "tapPick",
        "prompt": "How do you say 'It is three o'clock'?",
        "options": [
          {
            "label": "Son las tres.",
            "correct": true
          },
          {
            "label": "Esta las tres."
          },
          {
            "label": "Es las tres."
          }
        ]
      }
    }
  ],
  "sp.4.gustar": [
    {
      "kind": "concept",
      "title": "The whole gusta family",
      "body": "You know me gusta (I like) and te gusta (you like). Now meet the rest: le gusta (he or she likes), nos gusta (we like), and les gusta (they like). The little word out front tells you WHO is doing the liking.",
      "say": "You already know me gusta, meaning I like, and te gusta, meaning you like. Now meet the rest of the family. Le gusta means he or she likes. Nos gusta means we like. And les gusta means they like. The little word in front tells you who is doing the liking.",
      "analogy": "Think of gusta as one gift box that means 'is pleasing,' and me, te, le, nos, and les are five different name tags you stick on the front.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🙋",
            "title": "le gusta",
            "body": "he or she likes"
          },
          {
            "emoji": "👫",
            "title": "nos gusta",
            "body": "we like"
          },
          {
            "emoji": "👥",
            "title": "les gusta",
            "body": "they like"
          }
        ]
      }
    },
    {
      "kind": "example",
      "title": "gusta or gustan? Count the things",
      "body": "Use gusta for ONE thing (Me gusta el helado = I like the ice cream) and gustan for MANY things (Nos gustan los animales = We like animals). To make it extra clear who likes it, add 'A + person' in front: A ella le gusta la música = She likes music.",
      "say": "Here is the trick for gusta versus gustan. Use gusta when you like just one thing. Use gustan, with an n on the end, when you like many things. And to make it extra clear who likes it, you can add A plus the person in front. For example, A ella le gusta la musica means she likes music.",
      "reveal": [
        "One thing: Me gusta el helado. = I like the ice cream.",
        "Many things: Nos gustan los animales. = We like animals.",
        "Add a name tag: A ella le gusta la música. = She likes music.",
        "Ask what someone likes to do: ¿Qué te gusta hacer? = What do you like to do?"
      ]
    },
    {
      "kind": "concept",
      "title": "Say NO, or say you LOVE it",
      "body": "To say you DON'T like something, put no in front: No me gusta la tarea = I don't like homework. To say you LOVE something (way more than like), swap gusta for encanta: Me encanta el chocolate = I love chocolate, and Me encanta nadar = I love to swim.",
      "say": "Two more moves. To say you do not like something, just put the word no in front. No me gusta la tarea means I do not like homework. And to say you love something, way more than just like, swap gusta for encanta. Me encanta el chocolate means I love chocolate, and me encanta nadar means I love to swim.",
      "widget": {
        "w": "tapPick",
        "prompt": "How do you say 'I love chocolate' very strongly?",
        "options": [
          {
            "label": "Me encanta el chocolate",
            "correct": true
          },
          {
            "label": "Me gusta el chocolate"
          },
          {
            "label": "No me gusta el chocolate"
          }
        ]
      }
    }
  ],
  "sp.4.questions": [
    {
      "kind": "concept",
      "title": "The question word toolkit",
      "body": "After the upside-down mark, a question word tells you what you are asking about: a time, a person, a place, a reason, a way, or an amount. Learn these six and you can ask almost anything.",
      "say": "After the upside-down mark, a question word tells you what you are asking about. It could be a time, a person, a place, a reason, a way, or an amount. Learn these six words and you can ask almost anything.",
      "analogy": "Question words are like the different keys on a keyring. You pick the one that opens the door you need."
    },
    {
      "kind": "show",
      "title": "Meet the six question words",
      "body": "Cuándo means When, Quién means Who, Dónde means Where, Por qué means Why, Cómo means How, and Cuánto or Cuántos means How much or How many.",
      "say": "Cuando means When. Quien means Who. Donde means Where. Por que means Why. Como means How. And Cuanto or Cuantos means How much or How many.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🗓️",
            "title": "Cuándo = When",
            "body": "Asks about time, like a day or hour. ¿Cuándo es la fiesta? = When is the party?"
          },
          {
            "emoji": "🧑",
            "title": "Quién = Who",
            "body": "Asks about a person. ¿Quién es tu maestro? = Who is your teacher?"
          },
          {
            "emoji": "📍",
            "title": "Dónde = Where",
            "body": "Asks about a place. ¿Dónde está el baño? = Where is the bathroom?"
          },
          {
            "emoji": "❓",
            "title": "Por qué = Why",
            "body": "Asks for a reason. The answer often starts with porque, meaning because."
          },
          {
            "emoji": "🤔",
            "title": "Cómo = How",
            "body": "Asks about the way something is done. ¿Cómo se dice? = How do you say?"
          },
          {
            "emoji": "🔢",
            "title": "Cuánto/Cuántos = How much/How many",
            "body": "Asks about an amount or price. ¿Cuánto cuesta? = How much does it cost?"
          }
        ]
      }
    },
    {
      "kind": "example",
      "title": "A tricky one: How old are you?",
      "body": "To ask someone's age, Spanish uses the word for How many: ¿Cuántos años tienes? It literally means How many years do you have, but it means How old are you?",
      "say": "To ask someone's age, Spanish uses the word for How many. Cuantos anos tienes literally means How many years do you have, but it really means How old are you? You answer with Tengo, then your number, then anos.",
      "reveal": [
        "Cuántos = How many",
        "años = years",
        "tienes = do you have",
        "Put together: How many years do you have?",
        "The real meaning: How old are you?",
        "Answer: Tengo diez años = I am ten years old."
      ]
    }
  ],
  "sp.5.daily": [
    {
      "kind": "show",
      "title": "Getting ready",
      "body": "After you wake up, \"me levanto\" means I get up (out of bed) and \"me peino\" means I comb my hair. These are reflexive verbs, so they start with \"me\" because you do them to yourself.",
      "say": "After you wake up, me levanto means I get up out of bed, and me peino means I comb my hair. These verbs start with me because you do them to yourself.",
      "analogy": "Think of \"me\" as a little tag that means it happens to you, like the me in me levanto and me peino.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🛏️",
            "title": "Me levanto",
            "body": "I get up out of bed."
          },
          {
            "emoji": "💇",
            "title": "Me peino",
            "body": "I comb my hair."
          }
        ]
      }
    },
    {
      "kind": "concept",
      "title": "Breakfast and bedtime",
      "body": "\"El desayuno\" is breakfast, the meal you eat in the morning, and \"desayuno\" also means I eat breakfast. At night, \"me acuesto\" means I go to bed, so \"me acuesto a las nueve\" means I go to bed at nine.",
      "say": "El desayuno is breakfast, the meal you eat in the morning. At night, me acuesto means I go to bed, so me acuesto a las nueve means I go to bed at nine.",
      "analogy": "Des-ayuno breaks the fast after a whole night of sleep, just like the English word breakfast."
    },
    {
      "kind": "show",
      "title": "When it happens",
      "body": "\"Por la mañana\" means in the morning and \"la tarde\" is the afternoon, the time after lunch. If something happens every single day, you say \"todos los días,\" which means every day.",
      "say": "Por la manana means in the morning, and la tarde is the afternoon, the time after lunch. If something happens every single day, you say todos los dias, which means every day.",
      "widget": {
        "w": "tapPick",
        "prompt": "Your pen pal writes \"Me levanto todos los días por la mañana.\" When does she get up?",
        "options": [
          {
            "label": "Every day in the morning",
            "correct": true
          },
          {
            "label": "Only on weekends at night"
          },
          {
            "label": "Every afternoon"
          }
        ]
      }
    }
  ],
  "sp.5.eri": [
    {
      "kind": "concept",
      "title": "New person, new ending",
      "body": "The yo form ends in -o, but each subject gets its own ending. For -ER and -IR verbs the endings are: yo -o, tú -es, él/ella -e, nosotros -emos or -imos, ellos/ellas -en. Just drop -er or -ir and snap on the ending that matches the subject.",
      "say": "The yo form ends in oh, but each subject gets its own ending. For er and ir verbs the endings are: yo gets oh, tú gets es, he or she gets e, we get emos or imos, and they get en. Just drop er or ir and snap on the ending that matches the subject.",
      "analogy": "The verb is a jacket and the ending is the collar. Change the collar to fit whoever is wearing it."
    },
    {
      "kind": "show",
      "title": "-ER and -IR side by side",
      "body": "The endings match for tú (-es), él/ella (-e), and ellos (-en). They differ only for nosotros: -ER uses -emos and -IR uses -imos. See every form on the two cards below.",
      "say": "The endings match for tú, for he or she, and for they. They differ only for the we form: er uses emos and ir uses imos. See every form on the two cards below.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🥤",
            "title": "beber (-ER)",
            "body": "yo bebo, tú bebes, él/ella bebe, nosotros bebemos, ellos beben"
          },
          {
            "emoji": "✏️",
            "title": "escribir (-IR)",
            "body": "yo escribo, tú escribes, él/ella escribe, nosotros escribimos, ellos escriben"
          }
        ]
      }
    },
    {
      "kind": "try",
      "title": "Your turn",
      "body": "Beber means to drink. How do you say nosotros drink?",
      "say": "Beber means to drink. How do you say we drink?",
      "widget": {
        "w": "tapPick",
        "prompt": "beber with nosotros: nosotros ___",
        "options": [
          {
            "label": "bebemos",
            "correct": true
          },
          {
            "label": "beben"
          },
          {
            "label": "bebe"
          }
        ]
      }
    }
  ],
  "sp.6.adjectives": [
    {
      "kind": "concept",
      "title": "Feminine swaps -o for -a",
      "body": "When a noun is feminine, an -o adjective changes its ending to -a for one thing and -as for more than one. So la chica alta (the tall girl) and las niñas altas (the tall girls).",
      "say": "When a noun is feminine, an adjective that ends in oh changes its ending to ah for one thing and ahs for more than one. So la chica alta, the tall girl, and las ninas altas, the tall girls.",
      "analogy": "Think of -o and -a as a boy shirt and a girl shirt: the adjective slips into whichever one matches its noun.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "👦",
            "title": "Masculine",
            "body": "el chico alto, los chicos altos"
          },
          {
            "emoji": "👧",
            "title": "Feminine",
            "body": "la chica alta, las chicas altas"
          }
        ]
      }
    },
    {
      "kind": "show",
      "title": "Endings in -e never change for gender",
      "body": "Adjectives that end in -e, like grande, use the exact same form for masculine and feminine: un libro grande and una casa grande. For plural they just add -s: unos libros grandes.",
      "say": "Adjectives that end in eh, like grande, use the exact same form for masculine and feminine. Un libro grande and una casa grande. For plural they just add an ess: unos libros grandes.",
      "analogy": "An -e adjective is like a one-size-fits-all shirt: it fits boys and girls the same way."
    },
    {
      "kind": "example",
      "title": "Consonant endings add -es for plural",
      "body": "An adjective ending in a consonant, like azul, stays the same for masculine and feminine, but adds -es (not just -s) to become plural.",
      "say": "An adjective ending in a consonant, like azul, stays the same for masculine and feminine, but adds ess when you go plural.",
      "reveal": [
        "One blue eye: el ojo azul.",
        "Azul ends in a consonant, so gender does not change it.",
        "For more than one, add -es, not just -s.",
        "Some blue eyes: unos ojos azules."
      ],
      "widget": {
        "w": "tapPick",
        "prompt": "\"Unos ojos ___\" (some blue eyes). Which fits?",
        "options": [
          {
            "label": "azules",
            "correct": true
          },
          {
            "label": "azul"
          },
          {
            "label": "azulos"
          }
        ]
      }
    }
  ],
  "sp.6.commands": [
    {
      "kind": "concept",
      "title": "Regular tú commands: use the -e or -a ending",
      "body": "To tell one friend to do something, take the verb and use the él/ella present-tense form. For -ar verbs this ends in -a (cierra la puerta = close the door), and for -er/-ir verbs it ends in -e: come tu almuerzo (eat), bebe agua (drink), escribe tu nombre (write).",
      "say": "To tell one friend to do something, use the he or she present-tense form of the verb. For verbs ending in a r, it ends in an a sound, like cierra la puerta, which means close the door. For verbs ending in e r or i r, it ends in an e sound. Come tu almuerzo means eat your lunch, bebe agua means drink water, and escribe tu nombre means write your name.",
      "analogy": "Think of it like a road sign that points at one person and says just do it.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🚪",
            "title": "Cierra",
            "body": "cerrar, to close: Cierra la puerta = Close the door"
          },
          {
            "emoji": "🍎",
            "title": "Come",
            "body": "comer, to eat: Come tu almuerzo = Eat your lunch"
          },
          {
            "emoji": "✏️",
            "title": "Escribe",
            "body": "escribir, to write: Escribe tu nombre = Write your name"
          }
        ]
      }
    },
    {
      "kind": "show",
      "title": "Negative tú commands: flip the vowel",
      "body": "To say don't, put No in front and switch the ending vowel. An -ar verb switches to -es (No toques eso from tocar = Don't touch that), and an -er/-ir verb switches to -as (No corras from correr = Don't run).",
      "say": "To tell a friend not to do something, put no in front and flip the ending vowel. A verb ending in a r switches to an e s sound, like no toques eso, which means don't touch that. A verb ending in e r or i r switches to an a s sound, like no corras, which means don't run.",
      "analogy": "The vowel does a swap: the a-verbs borrow an e, and the e-verbs borrow an a.",
      "widget": {
        "w": "tapPick",
        "prompt": "How do you tell a friend \"Don't run\" (correr)?",
        "options": [
          {
            "label": "No corras",
            "correct": true
          },
          {
            "label": "No corres"
          },
          {
            "label": "No corre"
          }
        ]
      }
    },
    {
      "kind": "example",
      "title": "Irregular and reflexive commands to memorize",
      "body": "A few commands do not follow the pattern and must be memorized: Ten cuidado (from tener) means Be careful, and Ven aquí (from venir) means Come here. For a reflexive verb like callarse, attach the pronoun to the end: Cállate means Be quiet.",
      "say": "A few commands are irregular and you just memorize them. Ten cuidado, from tener, means be careful. Ven aquí, from venir, means come here. For a reflexive verb like callarse, you stick the pronoun on the end, so cállate means be quiet.",
      "reveal": [
        "Ten cuidado = Be careful (irregular command of tener)",
        "Ven aquí = Come here (irregular command of venir)",
        "Cállate = Be quiet (callarse, with te attached to the end)"
      ]
    }
  ],
  "sp.7.places": [
    {
      "kind": "show",
      "title": "Places around town",
      "body": "Learn the key spots: la plaza (town square), el cine (movie theater), el supermercado (grocery store), el correo or la oficina de correos (post office), and la estación de tren (train station).",
      "say": "Learn the key spots. La plaza is the town square. El cine is the movie theater. El supermercado is the grocery store. El correo, also called la oficina de correos, is the post office. And la estacion de tren is the train station.",
      "analogy": "Think of it like a map with labeled pins: each Spanish word is the pin for one place you might need to find.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🎬",
            "title": "el cine",
            "body": "the movie theater, where you watch films"
          },
          {
            "emoji": "🛒",
            "title": "el supermercado",
            "body": "the grocery store, where you buy food"
          },
          {
            "emoji": "✉️",
            "title": "el correo",
            "body": "the post office, where you send letters and packages"
          }
        ]
      }
    },
    {
      "kind": "concept",
      "title": "Left, right, and street words",
      "body": "To give directions, say gira a la izquierda (turn left) or gira a la derecha (turn right). Izquierda is left and derecha is right. On the street, la esquina is the corner where two streets meet, and el semáforo is the traffic light.",
      "say": "To give directions, say gira a la izquierda to turn left, or gira a la derecha to turn right. Izquierda means left and derecha means right. On the street, la esquina is the corner where two streets meet, and el semaforo is the traffic light.",
      "analogy": "Your left hand points to la izquierda and your right hand to la derecha, so let your hands remember the words for you."
    },
    {
      "kind": "example",
      "title": "Say where a place is",
      "body": "Location words tell you exactly where something sits: al lado de means next to, enfrente de means in front of, and detrás de means behind. Put them after ¿Dónde está...? answers to place things.",
      "say": "Location words tell you exactly where something sits. Al lado de means next to. Enfrente de means in front of. And detras de means behind. Use them to describe where a place is.",
      "reveal": [
        "Al lado de = next to (lado means side, so it is right beside you)",
        "El cine está al lado del supermercado = The movie theater is next to the grocery store",
        "Enfrente de = in front of / across from",
        "Detrás de = behind"
      ]
    }
  ],
  "sp.7.preterite": [
    {
      "kind": "concept",
      "title": "One ending for each person",
      "body": "In the preterite every subject gets its own ending. For -ar verbs use -é, -aste, -ó, -amos, -aron; for -er and -ir verbs use -í, -iste, -ió, -imos, -ieron. So vivir becomes viví for yo, and ganar becomes ganaron for ellos.",
      "say": "In the preterite, each subject has its own ending, not just the you form. The verb vivir becomes vivi when the subject is yo, meaning I lived. The verb ganar becomes ganaron when the subject is ellos, meaning they won. And ganamos means we won.",
      "analogy": "Think of each subject wearing a different hat, and the hat is the ending that tells you who did the action.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "📗",
            "title": "-ar verb: ganar",
            "body": "yo gané, tú ganaste, él ganó, nosotros ganamos, ellos ganaron"
          },
          {
            "emoji": "📘",
            "title": "-er / -ir verb: vivir",
            "body": "yo viví, tú viviste, él vivió, nosotros vivimos, ellos vivieron"
          }
        ]
      }
    },
    {
      "kind": "example",
      "title": "Spelling changes, stem changes, and two irregulars",
      "body": "In the yo form, -car verbs change c to qu and -zar verbs change z to c so the sound stays the same. Stem-changing -ir verbs shift a vowel only in the él/ella and ellos forms, and ir and traer are fully irregular.",
      "say": "Some verbs change to keep their sound. In the I form, verbs ending in car swap the c for q u, and verbs ending in z a r swap the z for a c. Stem changing i r verbs change one vowel, but only in the he, she, and they forms. And two verbs, ir and traer, are completely irregular.",
      "reveal": [
        "sacar → yo saqué; tocar → yo toqué (c becomes qu to keep the hard k sound)",
        "empezar → yo empecé (z becomes c before the letter e)",
        "dormir → él durmió, ellos durmieron (the o becomes u)",
        "pedir → él pidió, ellos pidieron (the e becomes i)",
        "ir → yo fui, nosotros fuimos, ellos fueron (looks nothing like the present)",
        "traer → uses the stem traj-, so nosotros trajimos, ellos trajeron"
      ]
    },
    {
      "kind": "try",
      "title": "A finished snapshot, and how long ago",
      "body": "The preterite marks one finished action (ganó = won), unlike the imperfect (ganaba = used to win) or the progressive (está ganando = is winning now). The phrase hace plus a length of time means 'ago', as in 'hace tres días compramos' = we bought three days ago.",
      "say": "The preterite marks one finished action. Ganó means won and is over, while ganaba means used to win and está ganando means is winning right now. The phrase hace plus an amount of time means ago. So hace tres días compramos means we bought three days ago.",
      "widget": {
        "w": "tapPick",
        "prompt": "Which sentence is in the preterite (one finished past action)?",
        "options": [
          {
            "label": "El equipo ganó el campeonato el año pasado.",
            "correct": true
          },
          {
            "label": "El equipo gana el campeonato cada año."
          },
          {
            "label": "El equipo está ganando el partido ahora."
          }
        ]
      }
    }
  ],
  "sp.8.convo": [
    {
      "kind": "concept",
      "title": "Meeting someone new",
      "body": "When you first meet someone, say Mucho gusto (nice to meet you). To learn about them, ask ¿De dónde eres? (where are you from?) and ¿Cuántos años tienes? (how old are you?). If you bump into someone, say Perdón (sorry/excuse me).",
      "say": "When you first meet someone, say mucho gusto, which means nice to meet you. To learn about them, ask de donde eres, meaning where are you from, and cuantos anos tienes, meaning how old are you. Notice that Spanish asks age with the verb tener, to have, so it literally means how many years do you have. And if you bump into someone, say perdon, which means sorry or excuse me.",
      "analogy": "Think of these four phrases as your handshake kit: greet, ask where, ask age, apologize.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🤝",
            "title": "Mucho gusto",
            "body": "Nice to meet you"
          },
          {
            "emoji": "🌎",
            "title": "¿De dónde eres?",
            "body": "Where are you from?"
          },
          {
            "emoji": "🎂",
            "title": "¿Cuántos años tienes?",
            "body": "How old are you? (tener + años)"
          }
        ]
      }
    },
    {
      "kind": "show",
      "title": "Making plans and eating out",
      "body": "To make plans, use Nos vemos (see you later) or ¿Nos vemos a las seis? (shall we meet at six?). At a restaurant a waiter asks ¿Qué desea ordenar? (what would you like to order?), and before eating people wish each other ¡Buen provecho! (enjoy your meal).",
      "say": "To make plans, use nos vemos, which means see you later, or nos vemos a las seis, which means shall we meet at six o clock. The phrase a las seis tells the time, and vemos comes from the verb to see. At a restaurant, a waiter may ask que desea ordenar, meaning what would you like to order. And right before everyone starts eating, people say buen provecho, which means enjoy your meal.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "👋",
            "title": "Nos vemos",
            "body": "See you later"
          },
          {
            "emoji": "🕕",
            "title": "¿Nos vemos a las seis?",
            "body": "Meet at six o'clock?"
          },
          {
            "emoji": "🍽️",
            "title": "¡Buen provecho!",
            "body": "Enjoy your meal"
          }
        ]
      }
    },
    {
      "kind": "try",
      "title": "Slang for cool",
      "body": "Spanish slang for cool changes by region: in Mexico people say ¡Qué padre! and in the Caribbean and South America people say ¡Qué chévere! Both are positive and mean how cool! or awesome!",
      "say": "Slang for cool changes by region. In Mexico, people say que padre, and in the Caribbean and South America, people say que chevere. Even though padre usually means father, as slang it is a compliment. Both phrases mean how cool or awesome.",
      "widget": {
        "w": "tapPick",
        "prompt": "A friend from Mexico sees your new bike and says \"¡Qué padre!\" They think it is:",
        "options": [
          {
            "label": "Really cool",
            "correct": true
          },
          {
            "label": "Too expensive"
          },
          {
            "label": "Very boring"
          }
        ]
      }
    }
  ],
  "sp.8.travel": [
    {
      "kind": "concept",
      "title": "At the airport",
      "body": "El vuelo means the flight, from volar, to fly. If the board reads retrasado, your flight is delayed, running late.",
      "say": "El vuelo means the flight. It comes from volar, to fly. If the board reads retrasado, your flight is delayed and running late.",
      "analogy": "Retrasado sounds like running behind, the way a slow watch is retro-slow.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "✈️",
            "title": "el vuelo",
            "body": "the flight"
          },
          {
            "emoji": "⏰",
            "title": "retrasado",
            "body": "delayed / running late"
          }
        ]
      }
    },
    {
      "kind": "concept",
      "title": "Hotel, food, and shopping",
      "body": "At the hotel, tengo una reserva means I have a reservation, and la hora de salida is checkout time, when you leave. At a restaurant, soy alérgico a las nueces warns that you are allergic to nuts, and while shopping, ¿cuánto cuesta? asks how much it costs.",
      "say": "At the hotel, tengo una reserva means I have a reservation, and la hora de salida is the checkout time, when you leave. At a restaurant, soy alergico a las nueces warns that you are allergic to nuts, and while shopping, cuanto cuesta asks how much something costs.",
      "analogy": "Reserva is a close cousin of the English word reserve, and salida means exit, the way you leave.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🛎️",
            "title": "Tengo una reserva",
            "body": "I have a reservation"
          },
          {
            "emoji": "🚪",
            "title": "la hora de salida",
            "body": "checkout / leaving time"
          },
          {
            "emoji": "🥜",
            "title": "Soy alérgico a...",
            "body": "I am allergic to..."
          },
          {
            "emoji": "💶",
            "title": "¿Cuánto cuesta?",
            "body": "How much does it cost?"
          }
        ]
      }
    },
    {
      "kind": "concept",
      "title": "Two phrases that rescue you",
      "body": "When you are stuck, ¿me puede ayudar? asks Can you help me, from ayudar, to help. When you miss what someone said, no entiendo, ¿puede repetir? means I don't understand, can you repeat, from repetir, to repeat.",
      "say": "When you are stuck, me puede ayudar asks, can you help me. It comes from ayudar, to help. When you miss what someone said, no entiendo, puede repetir means I do not understand, can you repeat, from repetir, to repeat.",
      "widget": {
        "w": "tapPick",
        "prompt": "You didn't catch what the clerk said. Which phrase asks them to say it again?",
        "options": [
          {
            "label": "No entiendo, ¿puede repetir?",
            "correct": true
          },
          {
            "label": "¿Cuánto cuesta?"
          },
          {
            "label": "Tengo una reserva."
          }
        ]
      }
    }
  ],
  "sp.9.conditional": [
    {
      "kind": "concept",
      "title": "One ending set for everybody",
      "body": "The conditional keeps the whole infinitive and adds one accented ending that never changes across -ar, -er, and -ir verbs: -ía (I/he), -ías (you), -íamos (we), -íais (you all), -ían (they). So comer becomes comeríamos for we, and estudiar becomes estudiarías for you.",
      "say": "The conditional keeps the whole infinitive and adds one set of endings that works for all verbs. It is ee-ah for I or he, ee-ahs for you, ee-ah-mos for we, ee-ah-is for you all, and ee-ahn for they. So comer becomes comeriamos, meaning we would eat, and estudiar becomes estudiarias, meaning you would study.",
      "analogy": "Like snapping the same tail onto any verb: the body stays whole, only the tail tells you who is doing the wishing.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "1",
            "title": "yo / el",
            "body": "hablaria, comeria (I/he would)"
          },
          {
            "emoji": "2",
            "title": "tu",
            "body": "hablarias, estudiarias (you would)"
          },
          {
            "emoji": "3",
            "title": "nosotros",
            "body": "comeriamos, viajariamos (we would)"
          }
        ]
      }
    },
    {
      "kind": "show",
      "title": "Short stems, same endings",
      "body": "A few verbs shorten their stem but still take the exact same endings. Poder drops to podr- (podría), hacer drops to har- (haría), and haber shortens to habr-, giving the impersonal habría, which means 'there would be.'",
      "say": "A few verbs shorten their stem but still take the very same endings. Poder becomes podr, giving podria. Hacer becomes har, giving haria, meaning he would do or make. And haber becomes habr, giving habria, which means there would be.",
      "reveal": [
        "poder to podr-: podr + ia = podria (I could)",
        "hacer to har-: har + ia = haria (he would do)",
        "haber to habr-: habr + ia = habria (there would be)"
      ]
    },
    {
      "kind": "example",
      "title": "Two more jobs: guessing and dreaming",
      "body": "The conditional can guess about the past (Serían las tres cuando llegó = It was probably three o'clock when he arrived), and it powers hypotheticals with 'si' plus the past subjunctive (Viajaríamos a España si tuviéramos dinero = We would travel to Spain if we had money).",
      "say": "The conditional does two more jobs. It can guess about the past: Serian las tres cuando llego means it was probably three o'clock when he arrived. And it builds dreams with the word si plus a past form: Viajariamos a Espana si tuvieramos dinero means we would travel to Spain if we had money.",
      "reveal": [
        "Past guess: Serian las tres means it was probably three o'clock, not a certain fact",
        "Dream pattern: conditional + si + past subjunctive",
        "Viajariamos (would travel) ... si tuvieramos dinero (if we had money)"
      ]
    }
  ],
  "sp.9.subjunctive": [
    {
      "kind": "concept",
      "title": "The opposite-vowel endings",
      "body": "To build the regular present subjunctive, start from the yo form, drop the -o, then add the OPPOSITE vowel: -ar verbs take e endings (e, es, en) and -er/-ir verbs take a endings (a, as, an).",
      "say": "To build the regular present subjunctive, start from the yo form, drop the o, then add the opposite vowel. Ar verbs switch to an e ending, and er and ir verbs switch to an a ending.",
      "analogy": "The verbs swap costumes: -ar borrows the e that usually belongs to -er, and -er/-ir borrow the a that usually belongs to -ar.",
      "widget": {
        "w": "sideBySide",
        "cards": [
          {
            "emoji": "🔤",
            "title": "-ar to e",
            "body": "estudiar becomes estudie, estudies, estudien"
          },
          {
            "emoji": "🥬",
            "title": "-er/-ir to a",
            "body": "comer becomes coma, comas, coman"
          }
        ]
      }
    },
    {
      "kind": "example",
      "title": "Irregulars built from the yo form",
      "body": "Most irregular subjunctives come from the present-tense yo form: tengo gives teng- plus a, so tenga. A few are memorized outright: ser to sea/sean, ir to vaya, and estar keeps an accent, estés. Stem changes stay too: llover to llueva.",
      "say": "Most irregular subjunctives come from the present tense yo form. Tengo gives the stem teng plus a, so tenga. A few are memorized outright. Ser becomes sea and sean, ir becomes vaya, and estar keeps an accent to become estes. Stem changes stay too, so llover becomes llueva.",
      "reveal": [
        "tener: yo tengo, drop the o for teng-, add a to get tenga",
        "ser: memorized as sea, seas, sea, seamos, sean (ellos = sean)",
        "ir: memorized as vaya, vayas, vaya, vayan (yo = vaya)",
        "estar: estar takes accents, so tu estes, ellos esten",
        "llover: the o changes to ue, giving llueva"
      ]
    },
    {
      "kind": "try",
      "title": "So many triggers",
      "body": "Beyond Espero que and Dudo que, the subjunctive is triggered by Ojalá, wishes like Quiero que, value or emotion or possibility phrases like Es bueno/una lástima/posible que, and denial like No pienso que.",
      "say": "Beyond hoping and doubting, the subjunctive is triggered by ojala, by wishes like quiero que, by value, emotion, or possibility phrases like es bueno que, es una lastima que, and es posible que, and by denial like no pienso que.",
      "widget": {
        "w": "tapPick",
        "prompt": "Es posible que ___ mañana. (that it may rain tomorrow)",
        "options": [
          {
            "label": "llueva",
            "correct": true
          },
          {
            "label": "llueve"
          },
          {
            "label": "lloverá"
          }
        ]
      }
    }
  ]
};

  const NEW_LESSONS = [
  {
    "id": "lx.e3storydet",
    "skillId": "e.3.storydet",
    "subject": "english",
    "grade": 3,
    "title": "Story Detective",
    "subtitle": "Find the clues hiding in every story",
    "steps": [
      {
        "kind": "hook",
        "title": "Every story leaves clues",
        "body": "Good readers are detectives. A story never tells you everything straight out, so you hunt for clue words that reveal where it happens, who it is about, and why things happen.",
        "say": "Good readers are detectives. A story never tells you everything straight out, so you hunt for clue words that reveal where it happens, who it is about, and why things happen.",
        "analogy": "Like following footprints in the snow to find who walked by."
      },
      {
        "kind": "concept",
        "title": "The setting is where and when",
        "body": "The setting is the place and time a story happens. Look for clue words about the surroundings and weather, like waves and sand for a beach, or snow and icicles for a winter morning.",
        "say": "The setting is the place and time a story happens. Look for clue words about the surroundings and weather, like waves and sand for a beach, or snow and icicles for a winter morning.",
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "🏖️",
              "title": "Beach clues",
              "body": "Waves, warm sand, and seagulls tell you the story is at the beach."
            },
            {
              "emoji": "⛺",
              "title": "Campground clues",
              "body": "Tall trees, a river, and a tent by a fire tell you the story is at a campground."
            }
          ]
        }
      },
      {
        "kind": "concept",
        "title": "The main character and the main idea",
        "body": "The main character is the person the story is mostly about, usually the one who does the most and is named again and again. The main idea is what a whole passage is mostly about, which you find by asking what all the sentences describe together.",
        "say": "The main character is the person the story is mostly about, usually the one who does the most and is named again and again. The main idea is what a whole passage is mostly about, which you find by asking what all the sentences describe together.",
        "analogy": "The main character is the star of the show, not the people sitting in the background."
      },
      {
        "kind": "example",
        "title": "Why did it happen, and in what order?",
        "body": "A cause makes an effect happen, so ask what made something take place. Order words like before, then, and right before show you which action came first.",
        "say": "A cause makes an effect happen, so ask what made something take place. Order words like before, then, and right before show you which action came first.",
        "reveal": [
          "Read: Ava left the freezer door open. Her popsicles melted into a puddle.",
          "Ask why they melted. The open door let warm air in, so the open door is the cause.",
          "Read: Right before setting the table, Grace washed her hands. Then everyone ate.",
          "The words right before tell you washing hands came just before setting the table."
        ]
      },
      {
        "kind": "show",
        "title": "The detective's four questions",
        "body": "For any story, ask WHERE and WHEN it happens for the setting, WHO it is mostly about for the main character, WHAT it is all about for the main idea, and WHY things happen for cause and effect.",
        "say": "For any story, ask where and when it happens for the setting, who it is mostly about for the main character, what it is all about for the main idea, and why things happen for cause and effect."
      },
      {
        "kind": "try",
        "title": "You be the detective",
        "body": "Read: The wind blew hard. It knocked Jake's kite out of the sky and into a tall tree. Why did the kite end up in the tree?",
        "say": "Read this: The wind blew hard. It knocked Jake's kite out of the sky and into a tall tree. Why did the kite end up in the tree?",
        "widget": {
          "w": "tapPick",
          "prompt": "Why did the kite end up in the tree?",
          "options": [
            {
              "label": "Because the wind blew it there",
              "correct": true
            },
            {
              "label": "Because a bird carried it"
            },
            {
              "label": "Because Jake threw it up"
            }
          ]
        }
      },
      {
        "kind": "recap",
        "title": "You cracked the case",
        "body": "A story detective checks the setting for where and when, the main character for who, the main idea for what, cause and effect for why, and order words for what came first.",
        "say": "A story detective checks the setting for where and when, the main character for who, the main idea for what, cause and effect for why, and order words for what came first.",
        "takeaway": "Hunt for clue words to find the setting, main character, main idea, cause and effect, and order of events.",
        "emoji": "🕵️"
      }
    ]
  },
  {
    "id": "lx.e5figlang",
    "skillId": "e.5.figlang",
    "subject": "english",
    "grade": 5,
    "title": "Figurative Language Lab",
    "subtitle": "Idioms, similes, metaphors, hyperbole, personification, and sound words",
    "steps": [
      {
        "kind": "hook",
        "title": "Words that mean more",
        "body": "When a friend says \"I'm so hungry I could eat a horse,\" they are not really going to eat a horse. Writers use figurative language to say things in a fun way that you are not meant to take word-for-word.",
        "say": "When a friend says they are so hungry they could eat a horse, they are not really going to eat a horse. Writers use figurative language to say things in a fun way that you are not meant to take word for word.",
        "analogy": "Figurative language is like a costume for words, dressing up a plain idea to make it more exciting."
      },
      {
        "kind": "concept",
        "title": "Six writer's tricks",
        "body": "Personification gives human actions to non-human things. An idiom is a phrase whose real meaning is different from its words. A simile compares two different things using like or as, and a metaphor compares by saying one thing IS another. Hyperbole is a huge exaggeration, and onomatopoeia is a word that copies a real sound.",
        "say": "Personification gives human actions to non-human things. An idiom is a phrase whose real meaning is different from its words. A simile compares two different things using like or as, and a metaphor compares by saying one thing is another. Hyperbole is a huge exaggeration, and onomatopoeia is a word that copies a real sound."
      },
      {
        "kind": "show",
        "title": "Personification and idioms",
        "body": "In \"the thunder grumbled angrily,\" thunder does a human thing, so that is personification. In \"break a leg,\" the words say one thing but the real meaning is another, which makes it an idiom.",
        "say": "In the sentence the thunder grumbled angrily, thunder does a human thing, so that is personification. In break a leg, the words say one thing but the real meaning is another, which makes it an idiom.",
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "🌧️",
              "title": "Personification",
              "body": "The thunder grumbled angrily. Thunder cannot really grumble, so this gives it a human action."
            },
            {
              "emoji": "🎭",
              "title": "Idiom",
              "body": "Break a leg really means good luck. Hold your horses means slow down and wait, and hit the hay means go to sleep."
            }
          ]
        }
      },
      {
        "kind": "example",
        "title": "Simile or metaphor?",
        "body": "A simile uses the words like or as to compare two different things. A metaphor drops like and as and says one thing IS another. Be careful: not every sentence with like is a simile, because like can also just mean want.",
        "say": "A simile uses the words like or as to compare two different things. A metaphor drops like and as and says one thing is another. Be careful, because not every sentence with like is a simile. Sometimes like just means want.",
        "reveal": [
          "The snow was as white as a marshmallow. It uses as to compare snow and a marshmallow, so it is a simile.",
          "The pillow felt like a fluffy cloud. It uses like to compare, so it is a simile.",
          "The pillow was a soft fluffy cloud. It says the pillow IS a cloud with no like or as, so it is a metaphor.",
          "I would like a slice of pizza. Here like means want and compares nothing, so it is NOT a simile."
        ]
      },
      {
        "kind": "example",
        "title": "Hyperbole and sound words",
        "body": "Hyperbole is an exaggeration so big that no one could believe it, like \"I'm so hungry I could eat a whole cow.\" Onomatopoeia is a word that imitates a noise, like the cereal that went snap.",
        "say": "Hyperbole is an exaggeration so big that no one could believe it, like saying I am so hungry I could eat a whole cow. Onomatopoeia is a word that imitates a noise, like the cereal that went snap.",
        "reveal": [
          "I could eat a whole cow is impossible to really do, so it is hyperbole.",
          "The cereal went snap copies the crackling sound, so snap is onomatopoeia.",
          "Other sound words are buzz, boom, splash, and pop."
        ]
      },
      {
        "kind": "try",
        "title": "Name that trick",
        "body": "Read the sentence and pick the kind of figurative language it uses.",
        "say": "Read the sentence and pick the kind of figurative language it uses.",
        "widget": {
          "w": "tapPick",
          "prompt": "The sunflowers nodded happily in the summer breeze.",
          "options": [
            {
              "label": "Personification, because the flowers do a human action",
              "correct": true
            },
            {
              "label": "Hyperbole, because it is a huge exaggeration"
            },
            {
              "label": "Onomatopoeia, because it copies a sound"
            }
          ]
        }
      },
      {
        "kind": "recap",
        "title": "You cracked the code",
        "body": "Personification gives things human actions, idioms mean something other than their words, similes compare with like or as, metaphors say one thing IS another, hyperbole exaggerates, and onomatopoeia copies sounds.",
        "say": "Personification gives things human actions, idioms mean something other than their words, similes compare with like or as, metaphors say one thing is another, hyperbole exaggerates, and onomatopoeia copies sounds.",
        "takeaway": "Six tricks: personification, idiom, simile, metaphor, hyperbole, and onomatopoeia each dress up plain words in a different way.",
        "emoji": "✨"
      }
    ]
  },
  {
    "id": "lx.e5grammar",
    "skillId": "e.5.grammar",
    "subject": "english",
    "grade": 5,
    "title": "Grammar Pro: Your All-Access Toolkit",
    "subtitle": "Parts of speech, punctuation, and word choices that trip everyone up",
    "steps": [
      {
        "kind": "hook",
        "title": "Grammar is a toolbox",
        "body": "Great writers do not memorize a million rules. They keep a small toolbox and grab the right tool for the job, whether it is a comma, an adverb, or the perfect word.",
        "say": "Great writers do not memorize a million rules. They keep a small toolbox and grab the right tool for the job, whether it is a comma, an adverb, or the perfect word.",
        "analogy": "Like a chef who reaches for the right knife, you will learn to reach for the right grammar tool."
      },
      {
        "kind": "concept",
        "title": "Parts of speech: naming the jobs",
        "body": "Every word has a job. A preposition shows position or time (under, over, before). An adverb tells how, when, or where an action happens and often ends in -ly (quickly). An interjection is a short burst of feeling, usually set off by a comma or exclamation point (Wow!).",
        "say": "Every word has a job. A preposition shows position or time, like under, over, or before. An adverb tells how, when, or where an action happens, and it often ends in l y, like quickly. An interjection is a short burst of feeling, usually set off with a comma or exclamation point, like Wow.",
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "📍",
              "title": "Preposition",
              "body": "Shows position or time: The kitten hid UNDER the couch."
            },
            {
              "emoji": "🏃",
              "title": "Adverb",
              "body": "Tells how: She QUICKLY finished her homework."
            },
            {
              "emoji": "😲",
              "title": "Interjection",
              "body": "Shows sudden feeling: WOW, that was amazing!"
            }
          ]
        }
      },
      {
        "kind": "show",
        "title": "Comparing and sharing the right way",
        "body": "Use the comparative form for TWO things (add -er or use more: faster). Use the superlative form for THREE or more (add -est or use most: fastest). Same idea for sharing: use 'between' for two, and 'among' for three or more.",
        "say": "Use the comparative form for two things. You add e r or use the word more, like faster. Use the superlative form for three or more things. You add e s t or use the word most, like fastest. It works the same for sharing. Use between for two, and use among for three or more.",
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "🏅",
              "title": "Two things",
              "body": "Comparative: faster. Share: between the two of us."
            },
            {
              "emoji": "🏆",
              "title": "Three or more",
              "body": "Superlative: fastest. Share: among the four of us."
            }
          ]
        }
      },
      {
        "kind": "example",
        "title": "Building strong sentences",
        "body": "The SUBJECT is who or what the sentence is about, so ask 'who did it?' A COMPOUND sentence joins two complete thoughts with a comma plus and, but, or or. In a list of three or more items, put a comma after each item, including one before the final 'and.'",
        "say": "The subject is who or what the sentence is about, so ask who did it. A compound sentence joins two complete thoughts with a comma plus and, but, or or. In a list of three or more items, put a comma after each item, including one before the final and.",
        "reveal": [
          "Subject: In 'The team's star goalie blocked every shot,' ask who blocked. Answer: the team's star goalie is the subject.",
          "Compound: 'I studied hard, and I aced the quiz.' Both halves are full sentences joined by comma-and, so it is compound.",
          "Series comma: 'I packed socks, shoes, and a hat.' A comma sits after each item, including before and."
        ]
      },
      {
        "kind": "concept",
        "title": "Two famous traps: agreement and its vs it's",
        "body": "A collective noun like bunch or team names one group, so it is singular and takes a singular verb: 'The bunch of grapes IS on the table.' And 'its' shows belonging (like his or her), while 'it's' is short for 'it is.' If you cannot swap in 'it is,' use its with no apostrophe.",
        "say": "A collective noun like bunch or team names one group, so it is singular and takes a singular verb. The bunch of grapes is on the table. And its shows belonging, like his or her, while it apostrophe s is short for it is. If you cannot swap in the words it is, use its with no apostrophe.",
        "analogy": "The apostrophe in it's is a tiny pinch that squeezes 'it is' into one word. No squeeze, no apostrophe."
      },
      {
        "kind": "try",
        "title": "Your turn",
        "body": "Of all three runners, Priya is the ___. Three runners means you are comparing three or more, so pick the superlative form.",
        "say": "Of all three runners, Priya is the blank. Three runners means you are comparing three or more, so pick the superlative form. Which word fits?",
        "widget": {
          "w": "tapPick",
          "prompt": "Of all three runners, Priya is the ___.",
          "options": [
            {
              "label": "fastest",
              "correct": true
            },
            {
              "label": "faster"
            },
            {
              "label": "most fast"
            }
          ]
        }
      },
      {
        "kind": "recap",
        "title": "You packed the toolbox",
        "body": "You can now spot prepositions, adverbs, and interjections, choose comparatives, superlatives, between, and among, find subjects, build compound and comma-listed sentences, match verbs to collective nouns, and beat the its vs it's trap.",
        "say": "You can now spot prepositions, adverbs, and interjections, choose comparatives and superlatives, use between and among, find subjects, build compound and comma-listed sentences, match verbs to collective nouns, and beat the its versus it is trap.",
        "takeaway": "Grab the right grammar tool: name the word's job, count how many things you compare or share, find the subject, and check if 'it is' fits before adding an apostrophe.",
        "emoji": "🧰"
      }
    ]
  },
  {
    "id": "lx.e7argument",
    "skillId": "e.7.argument",
    "subject": "english",
    "grade": 7,
    "title": "Building an Argument",
    "subtitle": "Claims, evidence, and sources you can trust",
    "steps": [
      {
        "kind": "hook",
        "title": "Prove it",
        "body": "Imagine you tell a friend that later school start times would help students. They fold their arms and say, \"Prove it.\" To win them over, you need a clear point, solid facts, and sources they can trust.",
        "say": "Imagine you tell a friend that later school start times would help students. They fold their arms and say, prove it. To win them over, you need a clear point, solid facts, and sources they can trust."
      },
      {
        "kind": "concept",
        "title": "The claim is your main point",
        "body": "A claim is the main position or point a writer is trying to prove. Everything else in the argument exists to support that one big idea.",
        "say": "A claim is the main position or point a writer is trying to prove. Everything else in the argument exists to support that one big idea.",
        "analogy": "The claim is like the roof of a house, and the evidence is the walls holding it up."
      },
      {
        "kind": "show",
        "title": "Fact vs. opinion",
        "body": "A fact can be checked and proven true or false with evidence, like a measurement or reliable research. An opinion states a personal judgment, using words like beautiful, best, or should, that cannot be measured.",
        "say": "A fact can be checked and proven true or false with evidence, like a measurement or reliable research. An opinion states a personal judgment, using words like beautiful, best, or should, that cannot be measured.",
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "📏",
              "title": "Fact",
              "body": "A blue whale can weigh more than 150 tons. You could check it with a scale."
            },
            {
              "emoji": "💭",
              "title": "Opinion",
              "body": "The blue whale is the most amazing animal. That is a personal feeling."
            }
          ]
        }
      },
      {
        "kind": "concept",
        "title": "Inform vs. persuade",
        "body": "Informative writing explains a topic and gives facts neutrally, without pushing a side. Persuasive writing tries to change what you think, feel, or do, often urging you to take an action.",
        "say": "Informative writing explains a topic and gives facts neutrally, without pushing a side. Persuasive writing tries to change what you think, feel, or do, often urging you to take an action.",
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "📋",
              "title": "Informative",
              "body": "The recycling center is open Monday to Friday and accepts glass, paper, and plastic."
            },
            {
              "emoji": "📣",
              "title": "Persuasive",
              "body": "Vote for Coach Lee, the only choice who cares about our team!"
            }
          ]
        }
      },
      {
        "kind": "example",
        "title": "Match evidence to the claim",
        "body": "Strong evidence is relevant, meaning it matches exactly what the claim is about. A fair writer also raises a counterargument, an opposing concern, and then answers it to sound more convincing.",
        "say": "Strong evidence is relevant, meaning it matches exactly what the claim is about. A fair writer also raises a counterargument, an opposing concern, and then answers it to sound more convincing.",
        "reveal": [
          "Claim: Skateboarding builds balance.",
          "Weak evidence: Skateboarding has been popular since the 1970s. True, but it says nothing about balance.",
          "Strong evidence: A study found skateboarders scored higher on balance tests than non-skaters. This matches the claim exactly.",
          "Counterargument move: A writer might say, some worry practice will run late, then answer, however, practice can shift 30 minutes later too. Naming the opposing concern before answering it makes the argument stronger."
        ]
      },
      {
        "kind": "concept",
        "title": "Judge your sources",
        "body": "Check a source for bias by asking who benefits: a company's own ad for its product has a financial reason to praise it. Check for reliability by asking about expertise and purpose: experts with no product to sell, like climate scientists on a NASA website, are more trustworthy than anonymous comments or memes.",
        "say": "Check a source for bias by asking who benefits: a company's own ad for its product has a financial reason to praise it. Check for reliability by asking about expertise and purpose: experts with no product to sell, like climate scientists on a NASA website, are more trustworthy than anonymous comments or memes."
      },
      {
        "kind": "try",
        "title": "Your turn: spot the bias",
        "body": "You want an honest answer about whether a new phone is worth buying. Ask who benefits if you believe the source. Which one is MOST likely to be biased?",
        "say": "You want an honest answer about whether a new phone is worth buying. Ask who benefits if you believe the source. Which one is most likely to be biased?",
        "widget": {
          "w": "tapPick",
          "prompt": "Which source is MOST likely to be biased?",
          "options": [
            {
              "label": "The phone company's own advertisement for the phone",
              "correct": true
            },
            {
              "label": "A tech reporter comparing several competing phones"
            },
            {
              "label": "A review site that tests and compares many brands"
            }
          ]
        }
      },
      {
        "kind": "recap",
        "title": "Remember this",
        "body": "State a clear claim, support it with relevant facts, fairly answer counterarguments, and lean on sources that are unbiased and reliable.",
        "say": "State a clear claim, support it with relevant facts, fairly answer counterarguments, and lean on sources that are unbiased and reliable.",
        "takeaway": "A strong argument is a clear claim backed by relevant evidence from trustworthy sources.",
        "emoji": "🎯"
      }
    ]
  },
  {
    "id": "lx.e7clauses",
    "skillId": "e.7.clauses",
    "subject": "english",
    "grade": 7,
    "title": "Clauses & Sentence Craft",
    "subtitle": "Build sentences that stand strong and flow",
    "steps": [
      {
        "kind": "hook",
        "title": "One idea, or leaning on another?",
        "body": "Read these two: \"The roads were icy.\" and \"Because the roads were icy.\" The first one stands on its own. The second one leaves you waiting for more. That tiny word \"because\" changed everything.",
        "say": "Read these two out loud. The roads were icy. And, because the roads were icy. The first one is finished. The second one leaves you hanging, waiting for the rest. One small word changed everything, and this lesson is all about that power."
      },
      {
        "kind": "concept",
        "title": "Independent vs. dependent clauses",
        "body": "A clause has a subject and a verb. An independent clause is a complete thought that can stand alone as a sentence. A dependent clause has a subject and verb too, but it cannot stand alone because a word like because, since, after, when, or although makes it lean on more.",
        "say": "Every clause has a subject and a verb. An independent clause is a complete thought that could be its own sentence. A dependent clause also has a subject and a verb, but it starts with a word like because, since, after, when, or although, so it cannot stand alone. It leans on the rest of the sentence.",
        "analogy": "An independent clause stands on its own two feet. A dependent clause is like someone leaning on a friend, it needs support to stay up.",
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "🧍",
              "title": "Independent",
              "body": "We kept working. A full, finished thought that can be its own sentence."
            },
            {
              "emoji": "🤝",
              "title": "Dependent",
              "body": "Although it was late. Has a subject and verb but cannot stand alone."
            }
          ]
        }
      },
      {
        "kind": "concept",
        "title": "Subordinating conjunctions build complex sentences",
        "body": "Words like because, since, after, when, and although are subordinating conjunctions. Put one in front of a clause and it turns dependent. A COMPLEX sentence joins one independent clause with one dependent clause, like \"Although it was late, we kept working.\"",
        "say": "Words like because, since, after, when, and although are called subordinating conjunctions. Add one to the front of a clause and it becomes dependent. When you join a dependent clause to an independent clause, you have made a complex sentence. For example, although it was late, we kept working.",
        "analogy": "A subordinating conjunction is like a hitch that hooks a small trailer onto a car so they travel as one."
      },
      {
        "kind": "show",
        "title": "Relative clauses describe a noun",
        "body": "A relative clause is a dependent clause that starts with that, which, or who and adds information about a noun. In \"The book that I borrowed was overdue,\" the clause \"that I borrowed\" tells which book, so it cannot stand alone.",
        "say": "One special kind of dependent clause is a relative clause. It starts with that, which, or who, and it describes a noun. In the sentence, the book that I borrowed was overdue, the part that I borrowed tells us which book. It describes the noun and cannot stand on its own."
      },
      {
        "kind": "example",
        "title": "Fixing run-ons and fragments",
        "body": "Two complete thoughts jammed together make a run-on, and a lone dependent clause makes a fragment. You can join, split, or complete them a few clean ways.",
        "say": "Two complete thoughts jammed together make a run-on. A lone dependent clause with no main thought makes a fragment. Here are the clean ways to fix them.",
        "reveal": [
          "Run-on: The bus was late I missed first period.",
          "Fix with a comma plus a FANBOYS word (for, and, nor, but, or, yet, so): The bus was late, so I missed first period.",
          "Fix with a semicolon between two complete thoughts, no joining word after it: The test was hard; everyone passed anyway.",
          "Fragment: Because the tide was rising fast. It is only a dependent clause, the main thought is missing.",
          "Fix the fragment by adding the main thought: Because the tide was rising fast, we left the beach.",
          "Wordy to tight: 'Due to the fact that it was raining' shrinks to 'Because it was raining.'"
        ]
      },
      {
        "kind": "try",
        "title": "Your turn: spot the complex sentence",
        "body": "One of these joins a dependent clause to an independent clause. Tap it.",
        "say": "One of these choices joins a dependent clause to an independent clause, making a complex sentence. Tap the one you think is correct.",
        "widget": {
          "w": "tapPick",
          "prompt": "Which is a COMPLEX sentence (one dependent + one independent clause)?",
          "options": [
            {
              "label": "When the movie ended, everyone clapped.",
              "correct": true
            },
            {
              "label": "The movie ended, and everyone clapped."
            },
            {
              "label": "The movie ended; everyone clapped."
            }
          ]
        }
      },
      {
        "kind": "recap",
        "title": "Remember this",
        "body": "An independent clause stands alone; a dependent clause leans on a word like because, since, after, when, or although. Complex sentences pair the two, relative clauses describe nouns, and you fix run-ons with a comma plus FANBOYS or a semicolon.",
        "say": "An independent clause stands alone. A dependent clause leans on a word like because, since, after, when, or although. A complex sentence pairs a dependent clause with an independent one. Relative clauses describe nouns, and you fix run-ons with a comma plus a FANBOYS word or a semicolon.",
        "takeaway": "Independent stands alone; dependent leans on a subordinating word. Join them into complex sentences, and fix run-ons with a comma plus FANBOYS or a semicolon.",
        "emoji": "🔗"
      }
    ]
  },
  {
    "id": "lx.m10trig",
    "skillId": "m.10.trig",
    "subject": "math",
    "grade": 10,
    "title": "Right-Triangle Trigonometry",
    "subtitle": "Use SOHCAHTOA, special triangles, and the Pythagorean theorem to find missing sides and angles",
    "steps": [
      {
        "kind": "hook",
        "title": "Measuring the unreachable",
        "body": "A guy wire runs from the top of a tall pole to the ground, and a surveyor needs the width of a river she cannot cross. In a right triangle, one angle and one side are enough to unlock every other length.",
        "say": "A guy wire runs from the top of a tall pole to the ground, and a surveyor needs the width of a river she cannot cross. In a right triangle, one angle and one side are enough to unlock every other length.",
        "analogy": "It is like reading a whole map from a single landmark and one direction."
      },
      {
        "kind": "concept",
        "title": "SOHCAHTOA: the three ratios",
        "body": "In a right triangle, name the sides relative to an acute angle theta: the opposite side, the adjacent side, and the hypotenuse (the longest side, across from the right angle). Then sine of theta equals opposite over hypotenuse, cosine equals adjacent over hypotenuse, and tangent equals opposite over adjacent.",
        "say": "In a right triangle, name the sides relative to an acute angle. The opposite side faces the angle, the adjacent side touches it, and the hypotenuse is the longest side across from the right angle. Sine equals opposite over hypotenuse, cosine equals adjacent over hypotenuse, and tangent equals opposite over adjacent.",
        "analogy": "SOHCAHTOA is a memory word: Sine Opposite Hypotenuse, Cosine Adjacent Hypotenuse, Tangent Opposite Adjacent.",
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "📐",
              "title": "Sine",
              "body": "opposite over hypotenuse. If opposite is 3 and hypotenuse is 5, sine is three-fifths."
            },
            {
              "emoji": "📏",
              "title": "Cosine",
              "body": "adjacent over hypotenuse."
            },
            {
              "emoji": "📊",
              "title": "Tangent",
              "body": "opposite over adjacent."
            }
          ]
        }
      },
      {
        "kind": "example",
        "title": "Solve for a missing side",
        "body": "Write the ratio that connects the side you know to the side you want, then solve. To isolate a side in the denominator, divide; to isolate one in the numerator, multiply.",
        "say": "Write the ratio that connects the side you know to the side you want, then solve. If the unknown is on the bottom of the fraction, divide. If it is on top, multiply.",
        "reveal": [
          "Find a hypotenuse from a 28 degree angle with adjacent 15: cosine 28 equals 15 over hypotenuse.",
          "So hypotenuse equals 15 divided by cosine 28, which is about 16.99 cm.",
          "Find the opposite leg from a 35 degree angle with adjacent 20: tangent 35 equals opposite over 20, so opposite equals 20 times tangent 35, about 14.00 ft.",
          "Find the adjacent leg from a 40 degree angle with hypotenuse 10: cosine 40 equals adjacent over 10, so adjacent equals 10 times cosine 40, about 7.66."
        ]
      },
      {
        "kind": "concept",
        "title": "Find an angle, and the cofunction shortcut",
        "body": "To find an angle from a known ratio, apply the inverse function: if cosine of theta equals 0.8, then theta equals inverse cosine of 0.8, about 36.9 degrees (keep the calculator in degree mode). Because the two acute angles add to 90 degrees, they are complementary, giving the cofunction identity cosine of theta equals sine of 90 minus theta.",
        "say": "To find an angle from a known ratio, use the inverse function. If cosine of theta equals zero point eight, then theta equals inverse cosine of zero point eight, about thirty-six point nine degrees. Keep your calculator in degree mode. Because the two acute angles add to ninety degrees, cosine of an angle equals sine of ninety minus that angle. For example, cosine of seventy-two degrees equals sine of eighteen degrees.",
        "analogy": "The two acute angles split a ninety-degree budget, so what one calls cosine the other calls sine."
      },
      {
        "kind": "example",
        "title": "Pythagorean theorem and special triangles",
        "body": "When you know two sides and no angle, use the Pythagorean theorem: leg squared plus leg squared equals hypotenuse squared. Two special triangles have exact ratios: a 45-45-90 triangle is 1 to 1 to root 2, and a 30-60-90 triangle is 1 to root 3 to 2 (short leg, long leg, hypotenuse).",
        "say": "When you know two sides and no angle, use the Pythagorean theorem: leg squared plus leg squared equals hypotenuse squared. Two special triangles have exact ratios. A forty-five forty-five ninety triangle has sides in the ratio one to one to root two. A thirty sixty ninety triangle has sides in the ratio one to root three to two.",
        "reveal": [
          "Guy wire on a 30 ft pole anchored 16 ft away: wire equals root of 30 squared plus 16 squared, which is root 1156, equals 34 ft.",
          "A 45-45-90 triangle with hypotenuse 10 root 2 has each leg equal to 10, so its area is one-half times 10 times 10, equals 50.",
          "For 30-60-90, tangent 30 equals opposite over adjacent equals 1 over root 3, which rationalizes to root 3 over 3."
        ]
      },
      {
        "kind": "try",
        "title": "Your turn",
        "body": "A river surveyor stands at A with the right angle at A. She walks 25 m to C and measures angle ACB equal to 58 degrees. The river width AB is opposite the angle and the 25 m walk is adjacent. Which setup finds AB?",
        "say": "A river surveyor stands at point A with the right angle at A. She walks twenty-five meters to point C and measures angle A C B equal to fifty-eight degrees. The river width is opposite the angle and the twenty-five meter walk is adjacent. Which setup finds the width?",
        "widget": {
          "w": "tapPick",
          "prompt": "Which equation gives the river width AB?",
          "options": [
            {
              "label": "AB = 25 times tangent(58 degrees)",
              "correct": true
            },
            {
              "label": "AB = 25 divided by tangent(58 degrees)"
            },
            {
              "label": "AB = 25 times cosine(58 degrees)"
            }
          ]
        }
      },
      {
        "kind": "recap",
        "title": "You unlocked the triangle",
        "body": "Pick the ratio that links your known and unknown sides with SOHCAHTOA, use inverse functions to find angles and the cofunction identity for complements, and reach for the Pythagorean theorem or special-triangle ratios when no angle is handy.",
        "say": "Pick the ratio that links your known and unknown sides with SOHCAHTOA. Use inverse functions to find angles, and remember cosine of an angle equals sine of its complement. When you have two sides and no angle, use the Pythagorean theorem or the special-triangle ratios.",
        "takeaway": "One angle and one side unlock every other measurement in a right triangle.",
        "emoji": "📐"
      }
    ]
  },
  {
    "id": "lx.m11explog",
    "skillId": "m.11.explog",
    "subject": "math",
    "grade": 11,
    "title": "Exponentials & Logarithms",
    "subtitle": "Logs, natural log, decay, and interest",
    "steps": [
      {
        "kind": "hook",
        "title": "The undo button for powers",
        "body": "Powers grow fast: 2, 4, 8, 16. But sometimes you know the answer is 8 and need the exponent. The tool that runs a power backward and hands you the exponent is called a logarithm.",
        "say": "Powers grow fast: two, four, eight, sixteen. But sometimes you know the answer is eight and you need the exponent that got you there. The tool that runs a power backward and hands you the exponent is called a logarithm.",
        "analogy": "A power is locking a door; a logarithm is the key that unlocks it and tells you which key you used."
      },
      {
        "kind": "concept",
        "title": "What a logarithm means",
        "body": "log_b(a) asks: 'b raised to what power gives a?' So log_2(8) = 3 because 2^3 = 8, and since 0.01 = 10^(-2), solving 10^x = 0.01 gives x = -2. Because b^x and log_b(x) are inverses they cancel, so 5^(log_5(20)) = 20 with no calculation.",
        "say": "A log base b of a asks a single question: b raised to what power gives a? So log base two of eight is three, because two to the third power is eight. It works with negatives too: since zero point zero one equals ten to the negative two, solving ten to the x equals zero point zero one gives x equals negative two. And because a base b power and a base b log are inverse operations, they cancel, so five raised to the log base five of twenty is exactly twenty, with no calculation needed.",
        "analogy": "A logarithm is a power asking, 'which exponent made me?'"
      },
      {
        "kind": "example",
        "title": "Natural log and e",
        "body": "The natural log, ln, is log base e (e is about 2.718). Since ln and e^x are inverses, take ln of both sides to solve. For decay C = C0·e^(-kt), isolate the exponential first, then take ln.",
        "say": "The natural log, written l n, is just the logarithm with base e, where e is about two point seven one eight. Since natural log and e to the x are inverses, you take the natural log of both sides to undo the base. For a decay model, isolate the exponential part first, then take the natural log.",
        "reveal": [
          "Solve e^(2x) = 7: take ln of both sides, 2x = ln 7.",
          "Divide by 2: x = (ln 7)/2.",
          "Decay: C = 50·e^(-0.3t), find when C = 10.",
          "Divide by 50: 0.2 = e^(-0.3t), then take ln: ln(0.2) = -0.3t.",
          "t = ln(0.2)/(-0.3) is about (-1.609)/(-0.3), about 5.4 hours."
        ]
      },
      {
        "kind": "example",
        "title": "Change of base and log rules",
        "body": "Change-of-base rewrites any log using ln: log_b(a) = ln(a)/ln(b), so log_2(7) = ln(7)/ln(2). The product rule combines logs: log_b(M) + log_b(N) = log_b(MN). Always check that each log's argument stays positive.",
        "say": "Change of base lets you rewrite any log using natural logs: log base b of a equals natural log of a divided by natural log of b. So log base two of seven equals natural log of seven over natural log of two. The product rule combines added logs: log of M plus log of N equals log of M times N. Always check that every argument you take a log of stays positive.",
        "reveal": [
          "Solve log_2(x) + log_2(x+6) = 4.",
          "Product rule: log_2[x(x+6)] = 4.",
          "Rewrite as a power: x(x+6) = 2^4 = 16.",
          "So x^2 + 6x - 16 = 0, which factors to (x+8)(x-2) = 0.",
          "x = 2 or x = -8; reject -8 because log needs a positive argument, so x = 2."
        ]
      },
      {
        "kind": "show",
        "title": "Half-life and compound interest",
        "body": "In half-life, count how many half-life periods fit in the time; after n periods the fraction left is (1/2)^n. For money, A = P(1 + r/n)^(nt), where n is the number of compounding periods per year.",
        "say": "For half-life, divide the elapsed time by the half-life to count how many halvings happen; after n periods the fraction remaining is one half raised to the n. For example, eighty grams with a five year half-life over fifteen years is three halvings: eighty to forty to twenty to ten grams. For money, the amount equals principal times the quantity one plus r over n, all raised to n times t, where n is how many times per year it compounds. Investing two thousand dollars at six percent compounded quarterly makes n equal four, giving two thousand times one plus zero point zero six over four, raised to four t."
      },
      {
        "kind": "try",
        "title": "Your turn",
        "body": "A 100 gram sample has a half-life of 4 years. How much remains after 8 years?",
        "say": "A one hundred gram sample has a half-life of four years. How much remains after eight years?",
        "widget": {
          "w": "tapPick",
          "prompt": "8 years is 8 divided by 4 = 2 half-lives. Halve 100 twice.",
          "options": [
            {
              "label": "25 grams",
              "correct": true
            },
            {
              "label": "50 grams"
            },
            {
              "label": "12.5 grams"
            }
          ]
        }
      },
      {
        "kind": "recap",
        "title": "Remember this",
        "body": "A logarithm hands you the exponent, and logs and powers undo each other. Use ln to solve e-equations, change-of-base and log rules to simplify, and count halvings for decay.",
        "say": "A logarithm hands you the exponent, and logs and powers undo each other. Use natural log to solve equations with e, use change of base and the log rules to simplify, and count halvings for decay problems.",
        "takeaway": "Logs undo powers: they give you the exponent, and ln undoes e.",
        "emoji": "🔑"
      }
    ]
  },
  {
    "id": "lx.m11precalc",
    "skillId": "m.11.precalc",
    "subject": "math",
    "grade": 11,
    "title": "Pre-Calculus Toolkit",
    "subtitle": "Series, logarithms, function behavior, and triangle trig",
    "steps": [
      {
        "kind": "hook",
        "title": "One toolkit, many tools",
        "body": "Pre-calculus hands you a set of formulas, each built for a specific shape of problem: adding up patterned lists, undoing exponents, reading a graph's behavior, and measuring triangles. Match the problem to its tool and the answer falls out.",
        "say": "Pre-calculus hands you a set of formulas, each built for a specific kind of problem: adding up patterned lists, undoing exponents, reading how a graph behaves, and measuring triangles. Match the problem to its tool and the answer falls right out.",
        "analogy": "Like a mechanic's kit, you do not force one wrench on every bolt, you pick the one that fits."
      },
      {
        "kind": "example",
        "title": "Adding up sequences (series)",
        "body": "An arithmetic sequence adds a fixed difference d, so its nth term is aₙ = a₁ + (n − 1)d and the sum of n terms is Sₙ = (n/2)(a₁ + aₙ). A geometric series multiplies by ratio r; when |r| < 1 the infinite sum converges to S = a₁/(1 − r).",
        "say": "An arithmetic sequence adds a fixed difference each step, so the nth term equals the first term plus quantity n minus one times the difference, and the sum of n terms equals n over two times the first plus the last term. A geometric series multiplies by a ratio; when the ratio's size is less than one, the infinite sum equals the first term divided by one minus the ratio.",
        "reveal": [
          "Arithmetic 5, 9, 13, 17 has a₁ = 5 and d = 4; find which term is 101: 5 + (n − 1)·4 = 101.",
          "Solve: 4(n − 1) = 96, so n − 1 = 24 and n = 25 (the 25th term).",
          "Arithmetic sum with a₁ = 2, d = 3, five terms: terms are 2, 5, 8, 11, 14 so a₅ = 14, then S = (5/2)(2 + 14) = (5/2)(16) = 40.",
          "Infinite geometric 8 + 4 + 2 + 1 + …: a₁ = 8 and r = 1/2; since |r| < 1, S = 8/(1 − 1/2) = 8/(1/2) = 16."
        ]
      },
      {
        "kind": "example",
        "title": "Logarithms: undoing exponents",
        "body": "By definition log_b x is the exponent that turns base b into x, so log₂ 8 = 3 because 2³ = 8. To solve a logarithmic equation, condense to one log, rewrite in exponential form, then reject any answer that makes a log's argument zero or negative.",
        "say": "A logarithm is the exponent that turns the base into the given number, so log base two of eight is three because two cubed is eight. To solve a log equation, combine into one logarithm, rewrite it in exponential form, then throw out any answer that would make a logarithm's inside zero or negative.",
        "reveal": [
          "Evaluate log₂ 8: ask what power of 2 gives 8; since 2³ = 8, the answer is 3.",
          "Solve log₂(x) + log₂(x − 2) = 3; condense the sum: log₂(x(x − 2)) = 3.",
          "Exponential form: x(x − 2) = 2³ = 8, so x² − 2x − 8 = 0.",
          "Factor: (x − 4)(x + 2) = 0 gives x = 4 or x = −2; reject x = −2 (log of a negative), so x = 4."
        ]
      },
      {
        "kind": "example",
        "title": "Reading a function's behavior",
        "body": "A rational function is undefined where its denominator is zero, so exclude those x-values from the domain. A function is odd when f(−x) = −f(x) (symmetric about the origin); for a polynomial in factored form, a factor with even multiplicity makes the graph touch the x-axis and turn around, while odd multiplicity makes it cross.",
        "say": "A rational function is undefined wherever its denominator equals zero, so leave those x-values out of the domain. A function is odd when replacing x with negative x flips the whole output's sign. For a factored polynomial, a repeated factor with an even power makes the graph touch the axis and turn around, while an odd power makes it cross.",
        "reveal": [
          "Domain of f(x) = 1/(x − 5): set x − 5 = 0 to get x = 5, so the domain is all real numbers except x = 5.",
          "Odd test on f(x) = x³ − x: f(−x) = (−x)³ − (−x) = −x³ + x = −(x³ − x) = −f(x), so it is odd.",
          "Compare f(x) = x² + 1: f(−x) = x² + 1 = f(x), which is even, not odd.",
          "Polynomial f(x) = (x − 1)²(x + 3) at x = 1: the factor (x − 1) has multiplicity 2 (even), so the graph touches the x-axis and turns around."
        ]
      },
      {
        "kind": "example",
        "title": "Triangles and waves",
        "body": "The Law of Cosines finds the third side from two sides and their included angle: c² = a² + b² − 2ab·cos C. For a sinusoid written as cos(Bt) or sin(Bt), one full cycle takes a period of 2π/B.",
        "say": "The Law of Cosines finds the third side from two sides and the angle between them: the third side squared equals the sum of the other two sides squared minus two times their product times the cosine of the included angle. For a wave written with cosine or sine of B times t, one full cycle takes a period of two pi divided by B.",
        "reveal": [
          "Sides 5 and 7 with included angle 60°: c² = 5² + 7² − 2(5)(7)cos 60°.",
          "Compute: c² = 25 + 49 − 70(0.5) = 74 − 35 = 39, so c = √39 ≈ 6.24.",
          "Ferris wheel h(t) = 25 − 20cos((π/15)t): here B = π/15.",
          "Period = 2π/B = 2π ÷ (π/15) = 2π · (15/π) = 30 seconds."
        ]
      },
      {
        "kind": "try",
        "title": "Your turn",
        "body": "Use the odd-function test f(−x) = −f(x): replace x with −x in each choice and see which one flips the sign of the whole expression.",
        "say": "Use the odd function test: replace x with negative x in each choice and see which one flips the sign of the whole expression.",
        "widget": {
          "w": "tapPick",
          "prompt": "Which function is odd?",
          "options": [
            {
              "label": "f(x) = x^3 - x",
              "correct": true
            },
            {
              "label": "f(x) = x^2 + 1"
            },
            {
              "label": "f(x) = x^3 + 1"
            }
          ]
        }
      },
      {
        "kind": "recap",
        "title": "Pick the right tool",
        "body": "Series have sum formulas (arithmetic Sₙ = (n/2)(a₁ + aₙ), infinite geometric a₁/(1 − r)); logs undo exponents; rational functions dodge denominator zeros; odd means f(−x) = −f(x); even multiplicity touches; the Law of Cosines finds a side; and period is 2π/B.",
        "say": "Series have sum formulas, logarithms undo exponents, rational functions avoid denominator zeros, odd means the output flips sign, an even repeated factor touches the axis, the Law of Cosines finds a missing side, and the period is two pi over B.",
        "takeaway": "Identify the problem type first, then reach for its matching formula.",
        "emoji": "🧰"
      }
    ]
  },
  {
    "id": "lx.m11statistics",
    "skillId": "m.11.statistics",
    "subject": "math",
    "grade": 11,
    "title": "Statistics & Data Analysis",
    "subtitle": "Center, spread, shape, probability, and sampling",
    "steps": [
      {
        "kind": "hook",
        "title": "What does the data really say?",
        "body": "A coach has every player's height, a factory has thousands of battery lifespans, and a pollster wants one honest snapshot of a whole city. Statistics gives you the tools to summarize, predict, and sample so a pile of numbers actually tells a story.",
        "say": "A coach has every player's height, a factory has thousands of battery lifespans, and a pollster wants one honest snapshot of a whole city. Statistics gives you the tools to summarize, predict, and sample so a pile of numbers actually tells a story.",
        "analogy": "Data is like a crowd; statistics is the way you describe the crowd without shaking every hand."
      },
      {
        "kind": "concept",
        "title": "Measures of center",
        "body": "The mean is the sum of the values divided by how many there are; the median is the middle value once they are in order; the mode is the value that appears most often. To find a missing value when you know the mean, multiply the mean by the count to get the total, then subtract the values you already have. The median resists outliers and barely moves, but the mean gets pulled toward extreme values.",
        "say": "The mean is the sum of the values divided by how many there are. The median is the middle value once you put them in order, and the mode is the value that appears most often. To find a missing value when you know the mean, multiply the mean by the count to get the total, then subtract the values you already have. The median resists outliers and barely moves, but the mean gets pulled toward extreme values.",
        "analogy": "The mean is a see-saw balance point, so one heavy outlier tips it; the median just asks who is standing in the middle of the line.",
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "➗",
              "title": "Mean",
              "body": "Add all values, divide by the count. Mean times count gives the total."
            },
            {
              "emoji": "🎯",
              "title": "Median",
              "body": "Order the values; take the middle one. Resistant to outliers."
            },
            {
              "emoji": "🔁",
              "title": "Mode",
              "body": "The value that occurs most often. It is about frequency, not size."
            }
          ]
        }
      },
      {
        "kind": "example",
        "title": "Center by example",
        "body": "Let's compute a mode, recover a missing value from the mean, and see what an outlier does.",
        "say": "Let's compute a mode, recover a missing value from the mean, and see what an outlier does.",
        "reveal": [
          "Mode of 2, 4, 4, 5, 7, 7, 7, 9: the value 7 appears three times, more than any other, so the mode is 7.",
          "Missing value: five numbers have mean 14, so the total is 14 times 5 = 70. The four known numbers 10, 12, 16, 18 add to 56, so the fifth is 70 minus 56 = 14.",
          "Outlier: a set with mean 50 and median 50 gets a value of 200 added. The median barely shifts, but the mean is dragged upward, so the mean increases much more than the median."
        ]
      },
      {
        "kind": "concept",
        "title": "Shape and the empirical rule",
        "body": "A normal distribution is a symmetric, bell-shaped curve with one central peak; the empirical rule says about 68% of the data lies within one standard deviation of the mean, 95% within two, and 99.7% within three. Because the bell is symmetric, each half of that 68% is about 34%, so the stretch from the mean up to one standard deviation above holds roughly 34%. Shapes also have names: bimodal has two distinct peaks, skewed leans to one side with a long tail, symmetric is balanced, and uniform is flat and level.",
        "say": "A normal distribution is a symmetric, bell-shaped curve with one central peak. The empirical rule says about sixty-eight percent of the data lies within one standard deviation of the mean, ninety-five percent within two, and ninety-nine point seven percent within three. Because the bell is symmetric, each half of that sixty-eight percent is about thirty-four percent, so the stretch from the mean up to one standard deviation above holds roughly thirty-four percent. Shapes also have names: bimodal has two distinct peaks, skewed leans to one side with a long tail, symmetric is balanced, and uniform is flat and level.",
        "analogy": "A normal curve is a bell; the empirical rule is the seating chart telling you what fraction sits how far from the middle.",
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "🔔",
              "title": "Symmetric",
              "body": "Balanced around one central peak, like a normal bell curve."
            },
            {
              "emoji": "⛰️",
              "title": "Bimodal",
              "body": "Two distinct peaks with a dip between them, often two subgroups."
            },
            {
              "emoji": "📉",
              "title": "Skewed",
              "body": "One long tail pulling to the right or the left."
            },
            {
              "emoji": "▭",
              "title": "Uniform",
              "body": "Flat and level, every value about equally common."
            }
          ]
        }
      },
      {
        "kind": "example",
        "title": "Probability tools",
        "body": "Three key tools: marginal probability from a two-way table, the addition rule for an OR event, and expected value for the long-run average.",
        "say": "Three key tools: marginal probability from a two-way table, the addition rule for an or event, and expected value for the long-run average.",
        "reveal": [
          "Marginal probability: in a two-way table, take a category's total over the grand total. If 25 car riders and 20 transit riders are satisfied out of 80 commuters, that is 45 over 80, which reduces to 9 over 16.",
          "Addition rule for OR: rolling a die, even is 2, 4, 6 and greater than three is 4, 5, 6. Combine them and count each outcome once: 2, 4, 5, 6, which is 4 out of 6, or 2 over 3. Counting 4 and 6 only once avoids double counting.",
          "Expected value: multiply each outcome by its probability and add, keeping losses negative. Winning $5 with chance 0.2 and losing $1 with chance 0.8 gives 0.2 times 5 plus 0.8 times minus 1, which is 1 minus 0.8 equals a gain of $0.20 per play."
        ]
      },
      {
        "kind": "concept",
        "title": "Sampling methods",
        "body": "Simple random sampling gives every member an equal chance. Stratified sampling splits the population into groups and samples within every group, while cluster sampling randomly picks whole groups and then surveys everyone in the chosen groups. Systematic sampling selects members at a fixed interval, such as every 10th item off a conveyor belt.",
        "say": "Simple random sampling gives every member an equal chance. Stratified sampling splits the population into groups and samples within every group, while cluster sampling randomly picks whole groups and then surveys everyone in the chosen groups. Systematic sampling selects members at a fixed interval, such as every tenth item off a conveyor belt.",
        "analogy": "Cluster sampling grabs a few whole pizza boxes and eats every slice inside; stratified sampling takes one slice from every box.",
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "🎲",
              "title": "Simple random",
              "body": "Everyone has an equal chance, chosen purely at random."
            },
            {
              "emoji": "🗂️",
              "title": "Stratified",
              "body": "Split into groups, then sample within every group."
            },
            {
              "emoji": "🏘️",
              "title": "Cluster",
              "body": "Randomly pick whole groups, survey everyone inside them."
            },
            {
              "emoji": "➡️",
              "title": "Systematic",
              "body": "Take members at a fixed interval, like every 10th one."
            }
          ]
        }
      },
      {
        "kind": "try",
        "title": "Your turn",
        "body": "A pollster numbers every student on a class roster and then interviews every 25th name on the list. Which sampling method is this?",
        "say": "A pollster numbers every student on a class roster and then interviews every twenty-fifth name on the list. Which sampling method is this?",
        "widget": {
          "w": "tapPick",
          "prompt": "Choosing every 25th name on an ordered list is which sampling method?",
          "options": [
            {
              "label": "Systematic sampling",
              "correct": true
            },
            {
              "label": "Cluster sampling"
            },
            {
              "label": "Stratified sampling"
            }
          ]
        }
      },
      {
        "kind": "recap",
        "title": "Remember this",
        "body": "Center summarizes data (mean, median, mode), shape and the empirical rule describe how it spreads, probability tools like marginal probability, the addition rule, and expected value make predictions, and sampling methods decide how you gather the data.",
        "say": "Center summarizes data with mean, median, and mode. Shape and the empirical rule describe how it spreads. Probability tools like marginal probability, the addition rule, and expected value make predictions, and sampling methods decide how you gather the data.",
        "takeaway": "Summarize with center and shape, predict with probability and expected value, and gather fairly with the right sampling method.",
        "emoji": "📊"
      }
    ]
  },
  {
    "id": "lx.m12calculus",
    "skillId": "m.12.calculus",
    "subject": "math",
    "grade": 12,
    "title": "Derivatives & Integrals: Measuring Change",
    "subtitle": "From average slopes to the exact rate at an instant",
    "steps": [
      {
        "kind": "hook",
        "title": "The speedometer question",
        "body": "A road trip of 150 miles in 3 hours averages 50 mph, but your speedometer reading right now might say 68. Calculus is the math that turns 'average over an interval' into 'exact rate at this instant.'",
        "say": "A road trip of one hundred fifty miles in three hours averages fifty miles per hour, but your speedometer right now might read sixty eight. Calculus is the math that turns an average over an interval into the exact rate at a single instant.",
        "analogy": "The trip average is the secant line between two points; the speedometer reading is the tangent line touching one point."
      },
      {
        "kind": "concept",
        "title": "Average rate, limits, and continuity",
        "body": "The average rate of change on [a, b] is the secant slope (f(b) − f(a))/(b − a); on x² over [1,4] that is (16 − 1)/3 = 5. A limit is the value a function heads toward: when direct substitution gives 0/0, factor and cancel, so (x²−16)/(x−4) = x+4 → 8, and a special result is that sin x over x approaches 1 as x → 0 (x in radians).",
        "say": "The average rate of change on an interval is the secant slope: the change in output divided by the change in input. For x squared from one to four, that is fifteen over three, which is five. A limit is the value a function heads toward. When plugging in gives zero over zero, factor and cancel first. And a special result: sine of x divided by x heads toward one as x goes to zero, with x in radians.",
        "analogy": "Factoring and canceling is a detour around one missing point on the road; you still reach the same destination.",
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "📏",
              "title": "Average rate",
              "body": "Secant slope: (f(b) − f(a)) / (b − a)."
            },
            {
              "emoji": "🎯",
              "title": "Limit at a hole",
              "body": "0/0 means factor and cancel, then substitute. Continuity at c needs f(c) = the limit."
            }
          ]
        }
      },
      {
        "kind": "show",
        "title": "The core derivative rules",
        "body": "The derivative gives the instantaneous slope. Power rule: xⁿ → n·xⁿ⁻¹. Product rule: (uv)′ = u′v + uv′. Key derivatives: sin x → cos x, cos x → −sin x, tan x → sec²x, and eˣ → eˣ.",
        "say": "The derivative gives the instantaneous slope. The power rule: x to the n becomes n times x to the n minus one. The product rule: the derivative of u times v is u prime v plus u v prime. Key derivatives to memorize: sine becomes cosine, cosine becomes negative sine, tangent becomes secant squared, and e to the x stays e to the x.",
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "🔢",
              "title": "Power rule",
              "body": "x³ → 3x²; the exponent drops down and decreases by one."
            },
            {
              "emoji": "✖️",
              "title": "Product rule",
              "body": "u′v + uv′ — needed whenever two functions are multiplied."
            }
          ]
        }
      },
      {
        "kind": "example",
        "title": "Product rule and chain rule at work",
        "body": "Use the product rule when factors are multiplied, and the chain rule for a function inside a function: (f(g(x)))′ = f′(g(x))·g′(x).",
        "say": "Use the product rule when two factors are multiplied, and the chain rule when one function is inside another: take the derivative of the outside, keep the inside, then multiply by the derivative of the inside.",
        "reveal": [
          "Product rule on x² sin x: (2x)(sin x) + (x²)(cos x) = 2x sin x + x² cos x.",
          "Product rule on x³eˣ: (3x²)(eˣ) + (x³)(eˣ) = x²eˣ(x + 3).",
          "Chain rule on tan(2x): outside gives sec²(2x), inside 2x has derivative 2, so f′ = 2 sec²(2x).",
          "Forgetting the inner derivative is the classic mistake — sec²(2x) alone is wrong."
        ]
      },
      {
        "kind": "example",
        "title": "Implicit, related rates, and concavity",
        "body": "Implicit differentiation differentiates both sides in x, treating y as a function of x. Related rates differentiate a relationship with respect to time. The second derivative reveals concavity, and an inflection point is where it changes sign.",
        "say": "Implicit differentiation differentiates both sides with respect to x, treating y as a function of x. Related rates differentiate a relationship with respect to time. The second derivative tells you concavity, and an inflection point is where the second derivative changes sign.",
        "reveal": [
          "Circle x² + y² = 25: differentiate to get 2x + 2y·(dy/dx) = 0, so dy/dx = −x/y.",
          "Ladder x² + y² = 100 with dx/dt = 2, x = 6, y = 8: 6(2) + 8(dy/dt) = 0, so dy/dt = −1.5 m/s (sliding down).",
          "Inflection of x³ − 6x² + 5: f′ = 3x² − 12x, f″ = 6x − 12; set 6x − 12 = 0 to get x = 2.",
          "Continuity check: (x²−1)/(x−1) = x+1 for x ≠ 1, so f(1) must equal 2 to be continuous."
        ]
      },
      {
        "kind": "try",
        "title": "Your turn: chain rule",
        "body": "Differentiate f(x) = sin(3x). The outside is sine and the inside is 3x.",
        "say": "Differentiate the sine of three x. The outside function is sine and the inside function is three x. Which choice is correct?",
        "widget": {
          "w": "tapPick",
          "prompt": "What is the derivative of sin(3x)?",
          "options": [
            {
              "label": "3 cos(3x)",
              "correct": true
            },
            {
              "label": "cos(3x)"
            },
            {
              "label": "3 cos(x)"
            }
          ]
        }
      },
      {
        "kind": "recap",
        "title": "Remember this",
        "body": "Average rate is a secant slope; the derivative is the instant slope from the power, product, and chain rules. Use implicit differentiation and related rates for linked quantities, and the second derivative for inflection points.",
        "say": "Average rate of change is a secant slope. The derivative is the instant slope, found with the power, product, and chain rules. Use implicit differentiation and related rates for linked quantities, and the second derivative to locate inflection points.",
        "takeaway": "Slope of a secant is the average rate; slope of a tangent (the derivative) is the exact rate — and the rules tell you how to compute it.",
        "emoji": "📈"
      }
    ]
  },
  {
    "id": "lx.m4fracpizza",
    "skillId": "m.4.fracpizza",
    "subject": "math",
    "grade": 4,
    "title": "Fraction Pizzeria",
    "subtitle": "Name, compare, add, and subtract fractions",
    "steps": [
      {
        "kind": "hook",
        "title": "Welcome to the pizzeria",
        "body": "At the Fraction Pizzeria, every pizza is cut into equal slices. To take orders you need to name each piece, compare pieces, and add or take away slices.",
        "say": "Welcome to the Fraction Pizzeria, where every pizza is cut into equal slices. To take orders you need to name each piece, compare pieces, and add or take away slices.",
        "analogy": "A fraction is just a way to say how much of the whole pizza you have."
      },
      {
        "kind": "concept",
        "title": "Naming a fraction: part over whole",
        "body": "A fraction is the part you have written over the total number of equal parts. If a pizza has 4 equal slices and you eat 1, you ate 1/4. If a chart has 8 squares and you color 2, that is 2/8.",
        "say": "A fraction is the part you have, written over the total number of equal parts. If a pizza has four equal slices and you eat one, you ate one fourth. If a chart has eight squares and you color two, that is two eighths.",
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "🍕",
              "title": "Top number",
              "body": "How many parts you have or ate."
            },
            {
              "emoji": "🔢",
              "title": "Bottom number",
              "body": "How many equal parts in the whole."
            }
          ]
        }
      },
      {
        "kind": "show",
        "title": "Equivalent fractions: same amount, more cuts",
        "body": "You can rename a fraction by cutting each piece into more equal pieces. Multiply the top and the bottom by the same number and the amount stays the same. So 2/3 times 2/2 is 4/6, and 2/4 times 2/2 is 4/8.",
        "say": "You can rename a fraction by cutting each piece into more equal pieces. Multiply the top and the bottom by the same number, and the amount stays the same. So two thirds is the same as four sixths, and two fourths is the same as four eighths.",
        "analogy": "Like trading one quarter for two dimes and a nickel. Different coins, same money."
      },
      {
        "kind": "example",
        "title": "Comparing pizza pieces",
        "body": "If the bottom numbers match, the bigger top number wins because the pieces are the same size. If the bottoms are different, picture how close each piece is to a whole pizza.",
        "say": "If the bottom numbers match, the bigger top number wins because the pieces are the same size. If the bottoms are different, picture how close each piece comes to a whole pizza.",
        "reveal": [
          "Same bottom: compare 3/6 and 2/6. Both are sixths, and 3 is more than 2, so 3/6 is bigger.",
          "Same bottom: compare 3/4 and 1/4. Both are fourths, and 3 is more than 1, so 3/4 is bigger.",
          "Different bottoms: compare 2/3, 3/4, and 1/2. 1/2 is only half a pizza. 2/3 is more than half. 3/4 is closest to a whole pizza, so 3/4 is the biggest."
        ]
      },
      {
        "kind": "example",
        "title": "Adding and subtracting slices",
        "body": "When the bottom numbers are the same, the pieces are the same size. Add or subtract the top numbers and keep the bottom number the same.",
        "say": "When the bottom numbers are the same, the pieces are the same size. Add or subtract the top numbers, and keep the bottom number the same.",
        "reveal": [
          "Add: 3/8 plus 3/8. Add tops 3 plus 3 is 6, keep eighths, so 6/8.",
          "Add: 2/8 plus 3/8. Add tops 2 plus 3 is 5, keep eighths, so 5/8.",
          "Subtract: 5/6 minus 2/6. Subtract tops 5 minus 2 is 3, keep sixths, so 3/6."
        ]
      },
      {
        "kind": "try",
        "title": "Your turn at the counter",
        "body": "Ben ate 2/6 of a pizza and Lily ate 3/6 of the same pizza. Who ate more?",
        "say": "Ben ate two sixths of a pizza and Lily ate three sixths of the same pizza. Who ate more?",
        "widget": {
          "w": "tapPick",
          "prompt": "The bottoms match, so compare the top numbers. Who ate more?",
          "options": [
            {
              "label": "Lily, because 3/6 is more than 2/6",
              "correct": true
            },
            {
              "label": "Ben, because 2/6 is more than 3/6"
            },
            {
              "label": "They ate the same amount"
            }
          ]
        }
      },
      {
        "kind": "recap",
        "title": "You run the pizzeria now",
        "body": "Name a fraction as part over whole, rename it by multiplying top and bottom by the same number, compare by matching bottoms or picturing a whole, and add or subtract tops while keeping the bottom the same.",
        "say": "Name a fraction as part over whole, rename it by multiplying top and bottom by the same number, compare by matching bottoms or picturing a whole pizza, and add or subtract the tops while keeping the bottom the same.",
        "takeaway": "Same bottom means same size pieces, so just work with the top numbers.",
        "emoji": "🍕"
      }
    ]
  },
  {
    "id": "lx.m5decimoney",
    "skillId": "m.5.decimoney",
    "subject": "math",
    "grade": 5,
    "title": "Decimal Money Market",
    "subtitle": "Place value, coins, comparing, rounding, adding, and subtracting money",
    "steps": [
      {
        "kind": "hook",
        "title": "Welcome to the Money Market",
        "body": "At the Decimal Money Market you buy, compare, round, and make change with dollars and cents. Every price like $5.38 is really dollars, dimes, and pennies stacked in place-value columns.",
        "say": "At the Decimal Money Market you buy, compare, round, and make change with dollars and cents. Every price, like five dollars and thirty-eight cents, is really dollars, dimes, and pennies stacked in place value columns.",
        "analogy": "A price tag is a tiny coin sorter: dollars on the left, dimes in the middle, pennies on the right."
      },
      {
        "kind": "concept",
        "title": "Place value in a price",
        "body": "In $5.38 the 5 is 5 whole dollars, the 3 is in the tenths place (3 dimes = 30 cents), and the 8 is in the hundredths place (8 pennies = 8 cents). Because a dollar is 100 cents, cents also name fractions of a dollar: 40 cents is 40/100 = 2/5, and 3/4 of a dollar is 75/100 = 75 cents = $0.75.",
        "say": "In five dollars and thirty-eight cents, the five is five whole dollars, the three is in the tenths place, which is three dimes or thirty cents, and the eight is in the hundredths place, which is eight pennies or eight cents. Because a dollar is one hundred cents, cents also name fractions of a dollar. Forty cents is forty out of one hundred, which simplifies to two fifths, and three fourths of a dollar is seventy-five out of one hundred, which is seventy-five cents.",
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "💵",
              "title": "Ones = dollars",
              "body": "The 5 in $5.38 means 5 whole dollars."
            },
            {
              "emoji": "🪙",
              "title": "Tenths = dimes",
              "body": "The 3 means 3 dimes, or 30 cents."
            },
            {
              "emoji": "🟤",
              "title": "Hundredths = pennies",
              "body": "The 8 means 8 pennies, or 8 cents."
            }
          ]
        }
      },
      {
        "kind": "show",
        "title": "Know your coins, count the pile",
        "body": "A penny is 1 cent, a nickel is 5 cents, a dime is 10 cents, and a quarter is 25 cents. To total a pile, add each coin group: 2 quarters + 3 dimes + 1 nickel = 50 + 30 + 5 = 85 cents. Buying two of the same item just doubles the price: two $0.35 erasers cost $0.35 + $0.35 = $0.70.",
        "say": "A penny is one cent, a nickel is five cents, a dime is ten cents, and a quarter is twenty-five cents. To total a pile of coins, add each group. Two quarters plus three dimes plus one nickel is fifty plus thirty plus five, which is eighty-five cents. Buying two of the same item just doubles the price. Two thirty-five cent erasers cost thirty-five plus thirty-five, which is seventy cents.",
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "🟤",
              "title": "Penny",
              "body": "1 cent"
            },
            {
              "emoji": "🪙",
              "title": "Nickel",
              "body": "5 cents"
            },
            {
              "emoji": "⚪",
              "title": "Dime",
              "body": "10 cents"
            },
            {
              "emoji": "💿",
              "title": "Quarter",
              "body": "25 cents"
            }
          ]
        }
      },
      {
        "kind": "example",
        "title": "Round it and compare it",
        "body": "To round money to the nearest dollar, look at the cents: less than 50 cents rounds down, 50 cents or more rounds up. To compare amounts, check the tenths (dimes) first, then the hundredths (pennies).",
        "say": "To round money to the nearest dollar, look at the cents. Less than fifty cents rounds down, and fifty cents or more rounds up. To compare amounts, check the tenths, or dimes, first, then the hundredths, or pennies.",
        "reveal": [
          "Round $9.20: 20 cents is less than 50, so round down to $9.00.",
          "Compare $0.70, $0.27, $0.72, and $0.68 by lining them up.",
          "Tenths first: 7, 2, 7, 6 dimes, so the two 7s ($0.70 and $0.72) lead.",
          "Now hundredths: $0.72 has 2 pennies versus 0, so $0.72 is the greatest."
        ]
      },
      {
        "kind": "example",
        "title": "Adding and making change",
        "body": "To add prices, line up the decimal points and add the cents, then the dollars. To subtract across zeros, trade one dollar for 100 cents so you have cents to take away.",
        "say": "To add prices, line up the decimal points and add the cents, then the dollars. To subtract across zeros, trade one dollar for one hundred cents so you have cents to take away.",
        "reveal": [
          "Add $0.75 + $0.50: 75 cents plus 50 cents is 125 cents, which is $1.25.",
          "Subtract $5.00 - $2.75: you cannot take 75 cents from 0 cents.",
          "Trade 1 dollar for 100 cents, so $5.00 becomes 4 dollars and 100 cents.",
          "100 - 75 = 25 cents and 4 - 2 = 2 dollars, giving $2.25."
        ]
      },
      {
        "kind": "try",
        "title": "Your turn at the register",
        "body": "A backpack costs $3.80. Round it to the nearest dollar by looking at the cents.",
        "say": "A backpack costs three dollars and eighty cents. Round it to the nearest dollar by looking at the cents. Which answer is correct?",
        "widget": {
          "w": "tapPick",
          "prompt": "Round $3.80 to the nearest dollar.",
          "options": [
            {
              "label": "$4.00",
              "correct": true
            },
            {
              "label": "$3.00"
            },
            {
              "label": "$3.80"
            }
          ]
        }
      },
      {
        "kind": "recap",
        "title": "Money market recap",
        "body": "Read place value to name a digit's worth, know your coin values, add and subtract by lining up the points and trading across zeros, round by the cents, and remember cents are hundredths of a dollar you can write as fractions.",
        "say": "Read place value to name what a digit is worth, know your coin values, add and subtract by lining up the decimal points and trading across zeros, round by looking at the cents, and remember that cents are hundredths of a dollar that you can also write as fractions.",
        "takeaway": "Every money skill comes back to place value: dollars, dimes (tenths), and pennies (hundredths).",
        "emoji": "💰"
      }
    ]
  },
  {
    "id": "lx.m6ratesreal",
    "skillId": "m.6.ratesreal",
    "subject": "math",
    "grade": 6,
    "title": "Ratios, Rates & Percents IRL",
    "subtitle": "Sales, heartbeats, and mixes with real numbers",
    "steps": [
      {
        "kind": "hook",
        "title": "The $45 backpack",
        "body": "A backpack costs $45 and a sign says 20% off. To find what you actually pay, you need percents, rates, and ratios working together. Let's unlock all three.",
        "say": "A backpack costs forty-five dollars and a sign says twenty percent off. To find what you actually pay, you need percents, rates, and ratios working together. Let's unlock all three.",
        "analogy": "Percents, rates, and ratios are like three tools on one keychain. Real-life problems ask you to grab the right one."
      },
      {
        "kind": "concept",
        "title": "Percent means 'out of 100'",
        "body": "A percent is a part-to-whole ratio where the whole is 100, so 60% is 60:100, which simplifies to 3:5. To take a percent OF a number, turn it into a fraction and multiply: 25% is 1/4, so 25% of $80 is 80 divided by 4, which is $20.",
        "say": "A percent is a part to whole ratio where the whole is one hundred, so sixty percent is sixty to one hundred, which simplifies to three to five. To take a percent of a number, turn it into a fraction and multiply. Twenty-five percent is one fourth, so one fourth of eighty dollars is twenty dollars.",
        "analogy": "Think of 100 pennies in a dollar. A percent tells you how many of those 100 pennies you're talking about."
      },
      {
        "kind": "show",
        "title": "Percent correct, discounts, and decrease",
        "body": "For percent correct, rewrite part-over-whole as something over 100. A discount is the percent OF the price removed, so subtract it. Percent decrease compares the amount of change to the ORIGINAL amount.",
        "say": "For percent correct, rewrite part over whole as something over one hundred. A discount is the percent of the price removed, so subtract it. Percent decrease compares the amount of the change to the original amount.",
        "reveal": [
          "Percent correct: 15 out of 20 = 75/100 = 75%.",
          "Backpack $45 at 20% off: 20% of 45 = 45 ÷ 5 = $9 saved.",
          "Sale price = 45 - 9 = $36 you pay.",
          "Game dropped $50 to $40: the change is $10.",
          "Percent decrease = change ÷ original = 10 ÷ 50 = 20% (divide by the ORIGINAL)."
        ],
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "✅",
              "title": "Percent correct",
              "body": "15/20 = 75/100 = 75%"
            },
            {
              "emoji": "🏷️",
              "title": "Discount",
              "body": "20% of 45 = 9 off, pay 36"
            }
          ]
        }
      },
      {
        "kind": "example",
        "title": "Unit rates: scale to a minute",
        "body": "A rate compares two different units. To scale a rate to a full minute, first find the per-second amount by dividing, then multiply by the 60 seconds in a minute.",
        "say": "A rate compares two different units. To scale a rate to a full minute, first find the amount per second by dividing, then multiply by the sixty seconds in a minute.",
        "reveal": [
          "Hummingbird: 90 beats in 2 seconds.",
          "Unit rate = 90 ÷ 2 = 45 beats per second.",
          "One minute = 45 × 60 = 2,700 beats per minute.",
          "Heartbeat: 15 beats in 10 seconds means 10 seconds × 6 = 60 seconds.",
          "So beats also × 6: 15 × 6 = 90 beats per minute."
        ]
      },
      {
        "kind": "example",
        "title": "Part-part-part ratios and scaling both ways",
        "body": "To split a total by a ratio, add the parts to get equal shares, divide the total by that sum, then multiply back. Equivalent ratios scale by the SAME factor, whether you multiply up or divide down.",
        "say": "To split a total by a ratio, add the parts to get the number of equal shares, divide the total by that sum, then multiply back. Equivalent ratios scale by the same factor, whether you multiply up or divide down.",
        "reveal": [
          "Trail mix 4:3:2, total 45 pieces. Parts: 4 + 3 + 2 = 9.",
          "Each share = 45 ÷ 9 = 5 pieces. Raisins = 3 × 5 = 15.",
          "Ratio 1:4 to 5:? Multiply 1 × 5 = 5, so 4 × 5 = 20.",
          "Scale DOWN: 24 cookies use 3 cups flour; for 8 cookies, 24 ÷ 8 = 3.",
          "Divide the flour by that same 3: 3 ÷ 3 = 1 cup."
        ]
      },
      {
        "kind": "try",
        "title": "Your turn",
        "body": "A jacket normally costs $80 and is 25% off. How much money do you SAVE?",
        "say": "A jacket normally costs eighty dollars and is twenty-five percent off. How much money do you save?",
        "widget": {
          "w": "tapPick",
          "prompt": "25% of $80 saved is...",
          "options": [
            {
              "label": "$20",
              "correct": true
            },
            {
              "label": "$25"
            },
            {
              "label": "$60"
            }
          ]
        }
      },
      {
        "kind": "recap",
        "title": "Remember this",
        "body": "Percent means out of 100: turn it into a fraction to take a percent of a number, and compare change to the original for percent decrease. For rates, find the per-unit amount then scale; for ratios, add parts to split a total and scale up or down by the same factor.",
        "say": "Percent means out of one hundred. Turn it into a fraction to take a percent of a number, and compare the change to the original for percent decrease. For rates, find the per-unit amount then scale. For ratios, add the parts to split a total and scale up or down by the same factor.",
        "takeaway": "Match the tool to the job: percent for discounts and scores, unit rate for per-time problems, and part-sum for splitting a total by a ratio.",
        "emoji": "🎯"
      }
    ]
  },
  {
    "id": "lx.m7datadetect",
    "skillId": "m.7.datadetect",
    "subject": "math",
    "grade": 7,
    "title": "Data Detective",
    "subtitle": "Mean, median, measures of center, and the odds of what happens next",
    "steps": [
      {
        "kind": "hook",
        "title": "Reading the clues in data",
        "body": "A list of numbers is like a pile of clues. A data detective knows how to boil a whole list down to one typical value and how to predict what is likely to happen next.",
        "say": "A list of numbers is like a pile of clues. A data detective knows how to boil a whole list down to one typical value, and how to predict what is likely to happen next.",
        "analogy": "Like a coach summing up a whole season with one batting average."
      },
      {
        "kind": "concept",
        "title": "The mean: share it out equally",
        "body": "The mean, or average, is the total of all the values divided by how many values there are. It is the amount each item would get if you shared the whole pile out equally.",
        "say": "The mean, or average, is the total of all the values divided by how many values there are. It is the amount each item would get if you shared the whole pile out equally.",
        "analogy": "Like pooling everyone's candy and splitting it fairly so each person gets the same.",
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "➕",
              "title": "Step 1",
              "body": "Add every value to get the total."
            },
            {
              "emoji": "➗",
              "title": "Step 2",
              "body": "Divide the total by how many values there are."
            }
          ]
        }
      },
      {
        "kind": "example",
        "title": "Mean three ways",
        "body": "Use add-then-divide for a simple list, work backward to find a missing value that hits a target mean, and use a frequency table when values repeat.",
        "say": "Use add then divide for a simple list, work backward to find a missing value that hits a target mean, and use a frequency table when values repeat.",
        "reveal": [
          "Simple list: distances 3, 5, 4, 6. Add them: 3 plus 5 plus 4 plus 6 equals 18. Divide by 4 days: 18 divided by 4 equals 4.5 miles.",
          "Missing value: scores 80, 90, 85 and one more, target mean 88 over 4 tests. Needed total is 4 times 88 equals 352. So far 80 plus 90 plus 85 equals 255. The fourth score is 352 minus 255 equals 97.",
          "Frequency table: 0 siblings for 5 students, 1 for 8, 2 for 4, 3 for 3. Total siblings equals 0 times 5 plus 1 times 8 plus 2 times 4 plus 3 times 3 equals 0 plus 8 plus 8 plus 9 equals 25. Total students equals 5 plus 8 plus 4 plus 3 equals 20. Mean equals 25 divided by 20 equals 1.25."
        ]
      },
      {
        "kind": "example",
        "title": "Median, and when to trust it",
        "body": "The median is the middle value once the numbers are in order; for an even count, average the two middle values. When one value is a wild outlier, the median stays put while the mean gets dragged toward the extreme.",
        "say": "The median is the middle value once the numbers are in order. For an even count, average the two middle values. When one value is a wild outlier, the median stays put while the mean gets dragged toward the extreme.",
        "analogy": "The mean is a see-saw that tips toward a heavy value; the median is a doorway you can only walk through in the middle.",
        "reveal": [
          "Even count: ages 11, 12, 12, 13, 14, 15, 16, 18. Eight values, so the two middle ones are the 4th and 5th: 13 and 14. Median equals 13 plus 14 divided by 2 equals 13.5.",
          "Outlier: salaries in thousands 30, 32, 35, 33, 200. The 200 pulls the mean far above the group, so the median better represents a typical salary. That is why median is the best measure of center when there is an extreme outlier."
        ]
      },
      {
        "kind": "show",
        "title": "Odds: chances, opposites, and combos",
        "body": "A probability is favorable outcomes over total outcomes. The complement rule says the chance an event does NOT happen is 100% minus its chance. The counting principle says to find total combinations, multiply the number of choices in each category.",
        "say": "A probability is favorable outcomes over total outcomes. The complement rule says the chance an event does not happen is one hundred percent minus its chance. The counting principle says that to find total combinations, multiply the number of choices in each category.",
        "reveal": [
          "Simple probability: a bag has 3 red, 5 blue, 2 green marbles, so 10 total. Chance of red is 3 out of 10, or 3/10. A spinner with 4 red of 8 equal sections is 4/8 equals 1/2.",
          "Complement: a 30 percent chance of rain means the chance of no rain is 100 minus 30 equals 70 percent.",
          "Counting principle: 3 sandwiches times 4 sides times 2 drinks equals 24 lunches. And 3 shirts times 2 pants equals 6 outfits."
        ]
      },
      {
        "kind": "try",
        "title": "You be the detective",
        "body": "A weather app says there is a 25% chance of snow. What is the probability that it does NOT snow?",
        "say": "A weather app says there is a twenty five percent chance of snow. What is the probability that it does not snow?",
        "widget": {
          "w": "tapPick",
          "prompt": "Chance it does NOT snow when snow is 25%?",
          "options": [
            {
              "label": "75%",
              "correct": true
            },
            {
              "label": "25%"
            },
            {
              "label": "125%"
            }
          ]
        }
      },
      {
        "kind": "recap",
        "title": "What a data detective knows",
        "body": "Mean is total divided by count; median is the middle (average the two middle for an even set) and it beats the mean when there is an outlier. For odds, use favorable over total, 100% minus the chance for the opposite, and multiply choices to count combinations.",
        "say": "Mean is total divided by count. Median is the middle value, and you average the two middle values for an even set, and it beats the mean when there is an outlier. For odds, use favorable over total, one hundred percent minus the chance for the opposite, and multiply choices to count combinations.",
        "takeaway": "Summarize data with mean or median, pick median when outliers lurk, and count chances with fractions, complements, and multiplication.",
        "emoji": "🕵️"
      }
    ]
  },
  {
    "id": "lx.m8funcstories",
    "skillId": "m.8.funcstories",
    "subject": "math",
    "grade": 8,
    "title": "Functions & Graph Stories",
    "subtitle": "Read lines like stories: rising, flat, falling, and where they start and cross",
    "steps": [
      {
        "kind": "hook",
        "title": "Lines tell stories",
        "body": "Every line on a graph tells a story: something going up, staying level, or coming down. A car speeding up, a tank draining, savings growing all live inside a line.",
        "say": "Every line on a graph tells a story. Something going up, staying level, or coming down. A car speeding up, a tank draining, or savings growing all live inside a line.",
        "analogy": "A graph is like a movie of what happened, plotted left to right in time."
      },
      {
        "kind": "concept",
        "title": "Up, flat, down",
        "body": "A rising segment means the value is increasing, a flat (horizontal) segment means it is not changing at all, and a falling segment means the value is decreasing. Match each phase of a story to one of these shapes.",
        "say": "A rising segment means the value is increasing. A flat, horizontal segment means it is not changing at all. A falling segment means the value is decreasing. Match each phase of a story to one of these shapes.",
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "📈",
              "title": "Rising",
              "body": "Value goes up: speeding up, saving more."
            },
            {
              "emoji": "➖",
              "title": "Flat",
              "body": "No change: standing still, holding steady."
            },
            {
              "emoji": "📉",
              "title": "Falling",
              "body": "Value goes down: slowing, draining."
            }
          ]
        }
      },
      {
        "kind": "show",
        "title": "Flat means no change",
        "body": "On a distance-versus-time graph, a horizontal segment has a slope of 0: distance stays the same while time keeps passing, so the person is standing still. On a speed-time graph of a car that speeds up, holds steady, then stops, the line rises, then is flat, then falls.",
        "say": "On a distance versus time graph, a horizontal segment has a slope of zero. Distance stays the same while time keeps passing, so the person is standing still. On a speed-time graph of a car that speeds up, holds steady, then stops, the line rises, then goes flat, then falls."
      },
      {
        "kind": "example",
        "title": "Slope: direction and steepness",
        "body": "Slope is rise over run: the change in y divided by the change in x. Its sign tells direction and its size tells steepness. A negative slope falls; a bigger number is steeper. If the x-values are equal, run is 0 and the slope is undefined (a vertical line).",
        "say": "Slope is rise over run: the change in y divided by the change in x. Its sign tells direction and its size tells steepness. A negative slope falls, and a bigger number is steeper. If the x-values are equal, the run is zero and the slope is undefined, which is a vertical line.",
        "reveal": [
          "Slope of a line through (-2, 5) and (2, -3): change in y is -3 - 5 = -8.",
          "Change in x is 2 - (-2) = 4. Slope is -8 over 4 = -2 (negative, so it falls).",
          "Compare slope 2 and slope 5: slope 5 is steeper because a larger slope rises faster.",
          "Line through (4, 1) and (4, 9): change in x is 4 - 4 = 0. Dividing by 0 makes the slope undefined, a vertical line."
        ]
      },
      {
        "kind": "example",
        "title": "y = mx + b: read the equation",
        "body": "In slope-intercept form y = mx + b, m is the slope and b is the y-intercept, the value when x = 0 (the starting amount). To find where a line crosses the x-axis, set y equal to 0 and solve for x.",
        "say": "In slope-intercept form y equals m x plus b, m is the slope and b is the y-intercept, the value when x is zero, which is the starting amount. To find where a line crosses the x-axis, set y equal to zero and solve for x.",
        "reveal": [
          "Slope 5 and y-intercept -3 gives y = 5x - 3.",
          "y = -2x + 6 has a negative slope, so it decreases from left to right.",
          "Two savings plans starting at $50 and $10: the higher y-intercept, $50, means that plan began with more money saved.",
          "Water tank g = -4t + 20 is empty when g = 0: 0 = -4t + 20, so 4t = 20 and t = 5 minutes (the x-intercept)."
        ]
      },
      {
        "kind": "try",
        "title": "Your turn",
        "body": "A drone's height is h = -10t + 100. Is it rising or falling, and why?",
        "say": "A drone's height follows the equation h equals negative ten t plus one hundred. Is it rising or falling, and why?",
        "widget": {
          "w": "tapPick",
          "prompt": "Is the drone rising or falling?",
          "options": [
            {
              "label": "Falling, because the slope is negative",
              "correct": true
            },
            {
              "label": "Rising, because it starts at 100 meters"
            },
            {
              "label": "Rising, because 100 is a large number"
            }
          ]
        }
      },
      {
        "kind": "recap",
        "title": "Read the story",
        "body": "Rising, flat, and falling map to increasing, no change, and decreasing. Slope's sign gives direction and its size gives steepness; y = mx + b shows the start (b) and rate (m), and setting y = 0 finds the x-intercept.",
        "say": "Rising, flat, and falling map to increasing, no change, and decreasing. The slope's sign gives direction and its size gives steepness. The equation y equals m x plus b shows the start, b, and the rate, m, and setting y equal to zero finds the x-intercept.",
        "takeaway": "A line is a story: its slope tells direction and steepness, and its intercepts tell where it starts and where it crosses.",
        "emoji": "📈"
      }
    ]
  },
  {
    "id": "lx.m8prealgebra",
    "skillId": "m.8.prealgebra",
    "subject": "math",
    "grade": 8,
    "title": "Pre-Algebra Foundations",
    "subtitle": "Integers, order of operations, the coordinate grid, rates, and percents",
    "steps": [
      {
        "kind": "hook",
        "title": "Open the toolbox",
        "body": "Pre-algebra is a toolbox of five tools: negative numbers, order of operations, the coordinate grid, unit rates, and percents. Learn each tool and you can crack almost any problem that comes next.",
        "say": "Pre-algebra is like a toolbox with five tools: negative numbers, order of operations, the coordinate grid, unit rates, and percents. Once you know each one, you can solve almost anything.",
        "analogy": "Like a video-game character collecting gear before the big level, you pick up one skill at a time."
      },
      {
        "kind": "example",
        "title": "Negative numbers and PEMDAS",
        "body": "On a number line, negatives sit left of zero and positives sit right. Subtracting moves you left, but subtracting a negative flips to adding and moves you right. When an expression mixes operations, do multiplication and division before addition and subtraction, not simply left to right.",
        "say": "On a number line, negatives are on the left of zero and positives are on the right. Subtracting moves you left, but subtracting a negative is the same as adding, so it moves you right. And when signs are mixed, always do multiplying and dividing before adding and subtracting.",
        "analogy": "Subtracting a negative is like removing a debt: taking away something bad actually leaves you better off.",
        "reveal": [
          "Temperature drop: start at -4 and drop 7 more. -4 - 7 = -11 degrees.",
          "Difference in elevation: 320 - (-80). Subtracting a negative adds, so 320 + 80 = 400 feet.",
          "Order of operations on 18 ÷ 3 - 2 × 4: first 18 ÷ 3 = 6 and 2 × 4 = 8.",
          "Now subtract left to right: 6 - 8 = -2."
        ]
      },
      {
        "kind": "example",
        "title": "Undo an equation in reverse",
        "body": "To solve a two-step equation, undo the operations in reverse order and do the same thing to both sides. Subtract the added number first, then divide by the multiplier.",
        "say": "To solve a two-step equation, undo the steps in reverse and always do the same thing to both sides. First subtract the number that was added, then divide by the number that was multiplied.",
        "analogy": "Like untying your shoes, you undo the last knot first.",
        "reveal": [
          "Solve 2x + 3 = 11. Subtract 3 from both sides: 2x = 8.",
          "Divide both sides by 2: x = 4.",
          "Word problem: 15 dollars a month plus 0.10 per text, bill was 23. Equation: 15 + 0.10t = 23.",
          "Subtract 15: 0.10t = 8. Divide by 0.10: t = 80 texts."
        ]
      },
      {
        "kind": "example",
        "title": "The coordinate grid",
        "body": "Every point is written as (x, y): x is horizontal, y is vertical. Where y = 0 the point lies on the x-axis, and where x = 0 it lies on the y-axis, so those points are not inside any quadrant. To translate a point, right and left change x while up and down change y.",
        "say": "Every point is written as x then y. The x value is horizontal and the y value is vertical. When y is zero the point sits on the x-axis, and when x is zero it sits on the y-axis, so it is not inside any quadrant. To slide a point, moving right or left changes x, and moving up or down changes y.",
        "reveal": [
          "A point with a negative x and y equal to 0 sits on the x-axis, to the left of the origin.",
          "Translate (-2, 5) four units right and three units down.",
          "Right 4 adds to x: -2 + 4 = 2. Down 3 subtracts from y: 5 - 3 = 2.",
          "The image is (2, 2)."
        ],
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "➡️",
              "title": "Right / Left",
              "body": "Changes the x-coordinate: right adds, left subtracts."
            },
            {
              "emoji": "⬆️",
              "title": "Up / Down",
              "body": "Changes the y-coordinate: up adds, down subtracts."
            }
          ]
        }
      },
      {
        "kind": "example",
        "title": "Rates and percents",
        "body": "A unit rate is the amount for exactly one unit, so you divide to get 'per one'. Percent means out of 100: to find a percent of a number you multiply, and to find what percent one number is of another you write part over whole and convert to a percent.",
        "say": "A unit rate is the amount for exactly one unit, so you divide to find the amount per one. Percent means out of one hundred. To find a percent of a number you multiply, and to find what percent one number is of another, you put the part over the whole and turn it into a percent.",
        "reveal": [
          "Unit rate: 60 miles in 2 hours is 60 ÷ 2 = 30 miles per hour.",
          "Percent of a number: 20% of 50 is 0.20 × 50 = 10.",
          "Percent increase: add it back, so 50 + 10 = 60 dollars.",
          "What percent: 15 is what percent of 60? 15/60 = 1/4 = 25%."
        ]
      },
      {
        "kind": "try",
        "title": "Your turn",
        "body": "Use the subtracting-a-negative rule: what is 6 - (-4)?",
        "say": "Try one using the subtracting a negative rule. What is six minus negative four?",
        "widget": {
          "w": "tapPick",
          "prompt": "Evaluate: 6 - (-4)",
          "options": [
            {
              "label": "10",
              "correct": true
            },
            {
              "label": "2"
            },
            {
              "label": "-10"
            }
          ]
        }
      },
      {
        "kind": "recap",
        "title": "Your five tools",
        "body": "Negatives move along the number line and subtracting a negative adds. Do multiply and divide before add and subtract. On the grid, x is across and y is up. Divide for unit rates, and use part over whole for percents.",
        "say": "Remember your five tools. Negatives move along the number line, and subtracting a negative means adding. Multiply and divide before you add and subtract. On the grid, x is across and y is up. Divide to get a unit rate, and use part over whole for percents.",
        "takeaway": "Master the five tools: integers, order of operations, the coordinate grid, unit rates, and percents.",
        "emoji": "🧰"
      }
    ]
  },
  {
    "id": "lx.s10chem2",
    "skillId": "s.10.chem2",
    "subject": "science",
    "grade": 10,
    "title": "Chemistry Essentials: Atoms, Elements, and Change",
    "subtitle": "From the particles inside an atom to the pH of what's in your kitchen",
    "steps": [
      {
        "kind": "hook",
        "title": "Everything is made of tiny pieces",
        "body": "The salt on your fries, the oxygen you breathe, and the rust on an old nail all behave differently because of how their atoms are built and how they join together. Understand the atom, and the rest of chemistry starts to click.",
        "say": "The salt on your fries, the oxygen you breathe, and the rust on an old nail all behave differently because of how their atoms are built and how they join together. Understand the atom, and the rest of chemistry starts to click.",
        "analogy": "Atoms are like LEGO bricks: a few basic pieces snap together in different ways to build everything around you."
      },
      {
        "kind": "concept",
        "title": "Inside the atom",
        "body": "An atom's nucleus holds positive protons and neutral neutrons, and together they make up the mass number (mass number = protons + neutrons). Tiny negative electrons orbit in shells around the nucleus, and the ones in the outermost shell are called valence electrons because they do the chemical bonding.",
        "say": "An atom's center, the nucleus, holds positive protons and neutral neutrons. Added together, protons and neutrons give the mass number. Tiny negative electrons orbit in shells around the nucleus, and the ones in the outermost shell are called valence electrons, because they are the ones that do the chemical bonding.",
        "analogy": "Think of the atom as a stadium: the heavy players (protons and neutrons) are packed at the center, while light electrons zip around the outer seats.",
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "⚛️",
              "title": "In the nucleus",
              "body": "Protons and neutrons. Their total is the mass number."
            },
            {
              "emoji": "🔵",
              "title": "In the shells",
              "body": "Electrons. The outer ones are valence electrons that bond."
            }
          ]
        }
      },
      {
        "kind": "show",
        "title": "Families and ions",
        "body": "Columns of the periodic table are families: Group 1 alkali metals (like sodium and potassium) are soft and react violently with water, halogens are very reactive, and noble gases have full shells so they barely react. When an atom loses or gains valence electrons it becomes a charged ion; losing electrons leaves extra positive charge, so a magnesium atom that loses two electrons becomes a 2+ ion.",
        "say": "The columns of the periodic table are called families. Group one, the alkali metals like sodium and potassium, are soft and react violently with water. The halogens are very reactive, and the noble gases have full outer shells, so they barely react at all. When an atom loses or gains valence electrons, it becomes a charged particle called an ion. Losing electrons leaves the atom with extra positive charge, so a magnesium atom that loses two electrons becomes a two plus ion.",
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "🔥",
              "title": "Alkali metals",
              "body": "Group 1, like Na and K. Soft and very reactive."
            },
            {
              "emoji": "😌",
              "title": "Noble gases",
              "body": "He, Ne, Ar. Full shells, so unreactive and calm."
            },
            {
              "emoji": "➕",
              "title": "Losing electrons",
              "body": "Lose 2 negatives to get a 2+ ion."
            }
          ]
        }
      },
      {
        "kind": "example",
        "title": "Molecules, compounds, and counting atoms",
        "body": "Many gases travel as diatomic molecules of two joined atoms, such as oxygen (O₂), while noble gases float as single atoms. When a metal and a nonmetal trade electrons they form an ionic compound like sodium chloride, whose strong ion attractions give it a high melting point and let it conduct electricity when melted or dissolved. To count atoms in a formula, add the subscripts.",
        "say": "Many gases travel as diatomic molecules made of two joined atoms, such as oxygen, while noble gases float around as single atoms. When a metal and a nonmetal trade electrons, they form an ionic compound like sodium chloride. The strong attraction between its oppositely charged ions gives it a high melting point and lets it conduct electricity when melted or dissolved. To count the atoms in a formula, just add up the small subscript numbers.",
        "reveal": [
          "Take sulfuric acid, with the formula H₂SO₄.",
          "Hydrogen has a subscript 2, so that is 2 hydrogen atoms.",
          "Sulfur has no subscript, which means just 1 sulfur atom.",
          "Oxygen has a subscript 4, so that is 4 oxygen atoms.",
          "Add them: 2 + 1 + 4 = 7 atoms in one molecule."
        ]
      },
      {
        "kind": "concept",
        "title": "Acids, bases, and kinds of change",
        "body": "The pH scale runs from 0 to 14: below 7 is acidic, 7 is neutral, and above 7 is basic (alkaline), so a pH of 12 is a strong base. Acids turn blue litmus paper red while bases turn red litmus paper blue. A change is chemical when a brand-new substance forms (iron rusting into iron oxide), but only physical when the substance keeps its identity (ice melting, sugar dissolving, glass shattering).",
        "say": "The pH scale runs from zero to fourteen. Below seven is acidic, seven is neutral, and above seven is basic, also called alkaline, so a pH of twelve is a strong base. Acids turn blue litmus paper red, while bases turn red litmus paper blue. A change is chemical when a brand new substance forms, like iron rusting into iron oxide. It is only physical when the substance keeps its identity, like ice melting, sugar dissolving, or glass shattering.",
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "🍋",
              "title": "Acid (pH below 7)",
              "body": "Turns blue litmus red. Vinegar and lemon juice."
            },
            {
              "emoji": "🧼",
              "title": "Base (pH above 7)",
              "body": "Turns red litmus blue. Drain cleaner at pH 12."
            }
          ]
        }
      },
      {
        "kind": "try",
        "title": "Your turn: spot the chemical change",
        "body": "A chemical change makes a new substance, while a physical change only alters form. Which event below is a chemical change?",
        "say": "A chemical change makes a new substance, while a physical change only alters the form. Which event below is a chemical change?",
        "widget": {
          "w": "tapPick",
          "prompt": "Which of these is a chemical change?",
          "options": [
            {
              "label": "An iron nail rusting",
              "correct": true
            },
            {
              "label": "Ice melting into water"
            },
            {
              "label": "A glass bottle shattering"
            }
          ]
        }
      },
      {
        "kind": "recap",
        "title": "Remember this",
        "body": "Atoms are protons and neutrons (mass number) with electrons in shells, valence electrons bond, atoms become ions by losing or gaining electrons, ionic compounds are tough and conductive when melted, formulas are counted by subscripts, and pH plus litmus tell acids from bases while new substances mark chemical change.",
        "say": "Atoms are made of protons and neutrons, which give the mass number, with electrons in shells. The outer valence electrons do the bonding, and atoms become ions by losing or gaining them. Ionic compounds are tough and conduct when melted, you count a formula by adding its subscripts, and pH plus litmus tell acids from bases, while a new substance forming marks a chemical change.",
        "takeaway": "Build the atom, watch it bond, and you can read the periodic table, ionic compounds, formulas, pH, and chemical change.",
        "emoji": "⚗️"
      }
    ]
  },
  {
    "id": "lx.s11physics",
    "skillId": "s.11.physics",
    "subject": "science",
    "grade": 11,
    "title": "Work, Energy, Friction, and Momentum",
    "subtitle": "The core mechanics toolkit: pushing, falling, sliding, and colliding",
    "steps": [
      {
        "kind": "hook",
        "title": "Five formulas run the whole show",
        "body": "A sled pulled by a rope, a ball dropped off a roof, a box sliding down a ramp, a caught baseball, two pucks that stick together. Every one of these is solved by a short list of mechanics rules you are about to learn.",
        "say": "A sled pulled by a rope, a ball dropped off a roof, a box sliding down a ramp, a caught baseball, and two pucks that stick together. Every one of these is solved by a short list of mechanics rules you are about to learn.",
        "analogy": "Like a toolbox where five tools fix almost every problem you meet."
      },
      {
        "kind": "example",
        "title": "Work and the work-energy theorem",
        "body": "Work is force times the distance moved in the force's direction: W = F d cosθ, where θ is the angle between the force and the motion. When the force points straight along the motion, cosθ = 1 and W = F d. The net work done on an object equals its change in kinetic energy (the work-energy theorem: W_net = ΔKE).",
        "say": "Work is force times the distance moved in the force's direction. It equals force times distance times the cosine of the angle between the force and the motion. When the force points straight along the motion, the cosine is one, so work is simply force times distance. The net work done on an object equals its change in kinetic energy. That is the work-energy theorem.",
        "analogy": "Only the part of a push that lines up with the motion actually does any work.",
        "reveal": [
          "Rope at 37 degrees, 50 N, sled moves 10 m: W = F d cosθ.",
          "W = 50 times 10 times cos37 = 50 times 10 times 0.80.",
          "W = 400 J.",
          "Force straight along motion, 50 N over 4.0 m: cosθ = 1, so W = 50 times 4.0 = 200 J."
        ]
      },
      {
        "kind": "example",
        "title": "Energy conservation and springs",
        "body": "With no friction, gravitational potential energy turns fully into kinetic energy: mgh = ½mv², which rearranges to v = √(2gh) (mass cancels). A stretched or compressed spring stores elastic potential energy PE = ½kx², where k is the force constant and x is the distance from natural length.",
        "say": "With no friction, gravitational potential energy turns fully into kinetic energy. Setting m g h equal to one half m v squared gives speed equals the square root of two g h, and the mass cancels out. A stretched or compressed spring stores elastic potential energy equal to one half times k times x squared, where k is the force constant and x is the distance from its natural length.",
        "analogy": "Height is stored motion waiting to be released, and a squeezed spring is stored push.",
        "reveal": [
          "Dropped from 20 m: v = square root of (2 times 9.8 times 20) = about 19.8 m/s.",
          "Pendulum from 0.80 m: v = square root of (2 times 9.8 times 0.80) = about 4.0 m/s.",
          "Spring k = 200 N/m compressed 0.10 m: PE = one half times 200 times 0.10 squared = 1.0 J.",
          "Do not forget the one half, or you double the spring answer."
        ]
      },
      {
        "kind": "example",
        "title": "Friction on level ground and on ramps",
        "body": "The friction force is the coefficient times the normal force: f = μN, so μ = f/N. On level ground the normal force equals the weight, N = mg. When a ramp is tilted until an object just starts to slide, the coefficient of static friction equals the tangent of that angle: μs = tanθ.",
        "say": "The friction force equals the coefficient times the normal force, so the coefficient is friction divided by normal force. On level ground the normal force equals the weight, which is mass times gravity. When a ramp is tilted until an object just begins to slide, the coefficient of static friction equals the tangent of that angle.",
        "analogy": "The steeper the slope an object can rest on before slipping, the grippier the surfaces.",
        "reveal": [
          "5.0 kg block, 20 N friction: N = m g = 5.0 times 9.8 = 49 N.",
          "μ = f divided by N = 20 divided by 49 = about 0.41.",
          "Box slides when ramp reaches 30 degrees: μs = tan30 = about 0.58."
        ]
      },
      {
        "kind": "example",
        "title": "Impulse and momentum",
        "body": "Momentum is p = mv. The impulse-momentum theorem says the average force equals the change in momentum divided by the contact time: F = Δp/Δt. Momentum is conserved in collisions, and because it is a vector you add perpendicular parts with the Pythagorean rule before dividing by the total mass.",
        "say": "Momentum is mass times velocity. The impulse-momentum theorem says the average force equals the change in momentum divided by the contact time. Momentum is conserved in collisions, and because it is a vector you combine perpendicular parts using the Pythagorean rule before dividing by the total mass.",
        "analogy": "A short catch time means a big force, which is why catching softly hurts less.",
        "reveal": [
          "Baseball 0.15 kg at 40 m/s stopped in 0.010 s: F = (0.15 times 40) divided by 0.010 = 600 N.",
          "Puck east: p = 0.20 times 3.0 = 0.60. Puck north: p = 0.20 times 4.0 = 0.80.",
          "Total p = square root of (0.60 squared plus 0.80 squared) = 1.0 kg m/s.",
          "Combined mass 0.40 kg: v = 1.0 divided by 0.40 = 2.5 m/s."
        ]
      },
      {
        "kind": "try",
        "title": "Your turn: work with an angle",
        "body": "A rope pulls a box with 50 N at an angle where cosθ = 0.80, and the box moves 10 m. How much work does the rope do?",
        "say": "A rope pulls a box with fifty newtons at an angle whose cosine is zero point eight, and the box moves ten meters. How much work does the rope do?",
        "widget": {
          "w": "tapPick",
          "prompt": "Use W = F d cosθ with F = 50 N, d = 10 m, cosθ = 0.80.",
          "options": [
            {
              "label": "400 J",
              "correct": true
            },
            {
              "label": "500 J"
            },
            {
              "label": "250 J"
            }
          ]
        }
      },
      {
        "kind": "recap",
        "title": "The mechanics toolkit",
        "body": "Work is F d cosθ and net work changes kinetic energy. Falling speed is √(2gh), spring energy is ½kx², friction gives μ = f/N with μs = tanθ, and force is Δp/Δt while momentum is conserved.",
        "say": "Work is force times distance times the cosine of the angle, and net work changes kinetic energy. Falling speed is the square root of two g h, spring energy is one half k x squared, friction gives the coefficient as friction over normal force with static friction equal to the tangent of the slipping angle, and force is change in momentum over time while momentum is conserved.",
        "takeaway": "A handful of formulas, work, energy, friction, impulse, and momentum, solve nearly every mechanics problem.",
        "emoji": "⚙️"
      }
    ]
  },
  {
    "id": "lx.s11physics2",
    "skillId": "s.11.physics2",
    "subject": "science",
    "grade": 11,
    "title": "Physics II Toolkit",
    "subtitle": "Energy, forces, momentum, electricity, and light",
    "steps": [
      {
        "kind": "hook",
        "title": "One tour, six big ideas",
        "body": "A pendulum speeds up as it falls, a skydiver stops speeding up, and light bends when it hits water. Physics II ties these together with a handful of rules about energy, forces, momentum, electricity, and light.",
        "say": "A pendulum speeds up as it falls, a skydiver stops speeding up, and light bends when it hits water. Physics 2 ties these together with a handful of rules about energy, forces, momentum, electricity, and light.",
        "analogy": "Think of it like a toolbox: each rule is a tool, and knowing which one to grab is half the job."
      },
      {
        "kind": "example",
        "title": "Motion, energy, and forces",
        "body": "As a pendulum swings down, stored potential energy turns into kinetic energy, so it moves fastest and has the most kinetic energy at the lowest point. Gravity pulls only downward, so a ball thrown horizontally keeps a constant horizontal velocity while gravity speeds up its fall.",
        "say": "As a pendulum swings down, stored potential energy turns into motion energy, so it moves fastest and has the most kinetic energy at the lowest point of its swing. Gravity pulls only downward, so a ball thrown sideways keeps the same horizontal velocity while gravity speeds up its fall.",
        "analogy": "A pendulum is like a skateboarder in a bowl: slowest at the top edges, fastest at the bottom.",
        "reveal": [
          "Pendulum: potential energy is greatest at the top, kinetic energy is greatest at the bottom (fastest point).",
          "Projectile: with no air resistance there is no horizontal force, so horizontal velocity stays constant.",
          "Terminal velocity: when upward air resistance (drag) exactly balances weight, net force is zero, so speed stays constant.",
          "Weight = mass x g. For a 10 kg backpack: 10 kg x 9.8 m/s^2 = 98 N.",
          "Momentum (mass x velocity) is conserved: in a closed system with no outside force, total momentum before = total momentum after. Two skaters push apart with equal and opposite momenta that still sum to the original total."
        ]
      },
      {
        "kind": "example",
        "title": "Electricity essentials",
        "body": "Electrical power is current times voltage, so multiply the amps by the volts to get watts. Like charges repel and opposite charges attract, and materials that let charge flow are conductors while those that block it are insulators.",
        "say": "Electrical power equals current times voltage, so multiply the amps by the volts to get watts. Like charges repel and opposite charges attract, and materials that let charge flow are conductors while those that block it are insulators.",
        "reveal": [
          "Power formula: P = I x V. A device drawing 2 A from a 12 V battery uses 2 x 12 = 24 W.",
          "Charge rule: like charges repel (two negative balloons push apart), opposite charges attract.",
          "Conductors let charge flow easily: copper, aluminum, and salt water.",
          "Insulators block charge flow: rubber, which is why it coats electrical wires."
        ]
      },
      {
        "kind": "concept",
        "title": "Light: fast and bendable",
        "body": "Light travels through a vacuum at about 3 x 10^8 meters per second, the fastest speed anything can go. When light passes from air into water it slows down, and that change of speed at an angled boundary makes the ray bend, which we call refraction.",
        "say": "Light travels through empty space at about three times ten to the eighth meters per second, the fastest speed anything can go. When light passes from air into water it slows down, and that change of speed at an angled boundary makes the ray bend, which we call refraction.",
        "analogy": "Like a shopping cart rolling from smooth pavement onto grass at an angle: the wheels that hit the grass first slow first, so the cart turns.",
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "⚡",
              "title": "Speed of light",
              "body": "About 3 x 10^8 m/s in a vacuum, roughly 300,000 km/s."
            },
            {
              "emoji": "🌊",
              "title": "Refraction",
              "body": "Light slows entering water; the speed change bends the ray."
            }
          ]
        }
      },
      {
        "kind": "try",
        "title": "Your turn: terminal velocity",
        "body": "A skydiver is falling at terminal velocity. Which statement describes the forces on her?",
        "say": "A skydiver is falling at terminal velocity. Which statement describes the forces on her? Tap the best answer.",
        "widget": {
          "w": "tapPick",
          "prompt": "At terminal velocity, the forces on the skydiver are...",
          "options": [
            {
              "label": "Air resistance exactly balances her weight, so she stops accelerating",
              "correct": true
            },
            {
              "label": "Gravity stops acting on her once she reaches top speed"
            },
            {
              "label": "Her weight shrinks until it matches the air resistance"
            }
          ]
        }
      },
      {
        "kind": "recap",
        "title": "Remember this",
        "body": "Energy converts (pendulum fastest at the bottom), forces balance at terminal velocity and give weight = mass x g, momentum is conserved in closed systems, power = current x voltage, like charges repel, insulators block charge, and light travels at 3 x 10^8 m/s but bends when its speed changes.",
        "say": "Energy converts so a pendulum is fastest at the bottom, forces balance at terminal velocity and weight equals mass times gravity, momentum is conserved in closed systems, power equals current times voltage, like charges repel, insulators block charge, and light travels at three times ten to the eighth meters per second but bends when its speed changes.",
        "takeaway": "Match each problem to its rule: energy, forces, momentum, electricity, or light.",
        "emoji": "🚀"
      }
    ]
  },
  {
    "id": "lx.s12advanced",
    "skillId": "s.12.advanced",
    "subject": "science",
    "grade": 12,
    "title": "Big Ideas Across Science",
    "subtitle": "A fast tour of the physics, chemistry, and biology facts every scientist keeps on hand",
    "steps": [
      {
        "kind": "hook",
        "title": "One tour, every science",
        "body": "This lesson is a lightning tour across physics, chemistry, and biology. By the end you will be able to read an atom, follow electrons through a reaction, and tell living cells apart.",
        "say": "This lesson is a lightning tour across physics, chemistry, and biology. By the end you will be able to read an atom, follow electrons through a reaction, and tell living cells apart."
      },
      {
        "kind": "concept",
        "title": "Every atom carries an ID",
        "body": "An element's atomic number is the number of protons in its nucleus, and that count alone decides which element it is. In reactions, watch the electrons: oxidation is the loss of electrons and reduction is the gain, captured by the mnemonic OIL RIG.",
        "say": "An element's atomic number is the number of protons in its nucleus, and that count alone decides which element it is. In reactions, watch the electrons: oxidation is the loss of electrons and reduction is the gain, captured by the mnemonic O I L R I G.",
        "analogy": "A proton count is like an ID number, unique to each element.",
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "➖",
              "title": "Oxidation Is Loss",
              "body": "The atom loses electrons."
            },
            {
              "emoji": "➕",
              "title": "Reduction Is Gain",
              "body": "The atom gains electrons."
            }
          ]
        }
      },
      {
        "kind": "concept",
        "title": "Acids, bases, and changing states",
        "body": "The pH scale runs from below 7 (acidic) through 7 (neutral) up to above 7 (basic or alkaline), so a solution with a pH of 3 is acidic. Matter also changes phase, and when a solid turns straight into a gas without ever becoming a liquid, that is called sublimation.",
        "say": "The pH scale runs from below seven, which is acidic, through seven, which is neutral, up to above seven, which is basic or alkaline. So a solution with a pH of three is acidic. Matter also changes phase, and when a solid turns straight into a gas without ever becoming a liquid, that is called sublimation.",
        "analogy": "Dry ice, which is solid carbon dioxide, smoking on a table is sublimation in action."
      },
      {
        "kind": "show",
        "title": "Splitting, joining, trapping, and vibrating",
        "body": "Nuclear fission splits heavy nuclei apart, while fusion joins light nuclei together, the way the Sun fuses hydrogen. Sound is a mechanical wave that needs a medium of particles to vibrate, so it cannot cross the empty vacuum of space, and greenhouse gases like carbon dioxide let sunlight in but trap outgoing infrared heat radiation to warm Earth.",
        "say": "Nuclear fission splits heavy nuclei apart, while fusion joins light nuclei together, the way the Sun fuses hydrogen. Sound is a mechanical wave that needs a medium of particles to vibrate, so it cannot cross the empty vacuum of space. And greenhouse gases like carbon dioxide let sunlight in but trap outgoing infrared heat radiation to warm Earth.",
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "💥",
              "title": "Fission",
              "body": "Splits heavy nuclei apart into smaller ones."
            },
            {
              "emoji": "☀️",
              "title": "Fusion",
              "body": "Joins light nuclei together into a larger one."
            }
          ]
        }
      },
      {
        "kind": "concept",
        "title": "The molecules and machinery of life",
        "body": "In DNA, bases pair in a fixed way: adenine always with thymine, and guanine always with cytosine. Enzymes are biological catalysts that speed reactions by lowering the activation energy without being used up, and while mitosis makes two identical cells with the full chromosome number, meiosis makes four varied cells with half the chromosome number.",
        "say": "In DNA, bases pair in a fixed way: adenine always with thymine, and guanine always with cytosine. Enzymes are biological catalysts that speed reactions by lowering the activation energy without being used up. And while mitosis makes two identical cells with the full chromosome number, meiosis makes four varied cells with half the chromosome number.",
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "👯",
              "title": "Mitosis",
              "body": "Two identical cells, full chromosome number."
            },
            {
              "emoji": "🯱",
              "title": "Meiosis",
              "body": "Four varied gametes, half the chromosome number."
            }
          ]
        }
      },
      {
        "kind": "try",
        "title": "Your turn: nuclear reactions",
        "body": "Pick the statement that correctly describes nuclear fission and fusion.",
        "say": "Pick the statement that correctly describes nuclear fission and fusion.",
        "widget": {
          "w": "tapPick",
          "prompt": "Which statement is correct?",
          "options": [
            {
              "label": "Fission splits heavy nuclei apart, while fusion joins light nuclei together",
              "correct": true
            },
            {
              "label": "Fission joins light nuclei together, while fusion splits heavy nuclei apart"
            },
            {
              "label": "Both fission and fusion split heavy nuclei apart"
            }
          ]
        }
      },
      {
        "kind": "recap",
        "title": "Remember this",
        "body": "Atomic number counts protons, oxidation loses electrons, pH below 7 is acidic, sublimation goes solid to gas, fission splits while fusion joins, sound needs a medium, greenhouse gases trap infrared, adenine pairs with thymine, enzymes lower activation energy, and meiosis makes four half-chromosome cells.",
        "say": "Atomic number counts protons, oxidation loses electrons, and a pH below seven is acidic. Sublimation goes solid to gas, fission splits while fusion joins, and sound needs a medium. Greenhouse gases trap infrared, adenine pairs with thymine, enzymes lower activation energy, and meiosis makes four cells with half the chromosome number.",
        "takeaway": "A few core facts in each field unlock most general-science questions.",
        "emoji": "🔬"
      }
    ]
  },
  {
    "id": "lx.s4ecosystems",
    "skillId": "s.4.ecosystems",
    "subject": "science",
    "grade": 4,
    "title": "Ecosystem Explorers",
    "subtitle": "Roles, adaptations, life cycles, and surviving the seasons",
    "steps": [
      {
        "kind": "hook",
        "title": "Every living thing has a job",
        "body": "In a meadow a bee sips a flower, a rabbit chews grass, a wolf pack hunts a deer, and a tree drops its leaves for winter. Each one is playing a role and using special tricks to survive.",
        "say": "In a meadow a bee sips a flower, a rabbit chews grass, a wolf pack hunts a deer, and a tree drops its leaves for winter. Each one is playing a role and using special tricks to survive. Let us learn how ecosystems work."
      },
      {
        "kind": "concept",
        "title": "Producers, consumers, decomposers",
        "body": "A producer is a plant that makes its own food from sunlight. A consumer cannot make its own food, so it must eat other living things. A decomposer, like a mushroom, breaks down dead plants and animals.",
        "say": "A producer is a plant that makes its own food from sunlight. A consumer cannot make its own food, so it must eat other living things. A decomposer, like a mushroom, breaks down dead plants and animals so their nutrients return to the soil.",
        "analogy": "Producers are the cooks, consumers are the eaters, and decomposers are the cleanup crew.",
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "🌻",
              "title": "Producer",
              "body": "A plant that makes its own food from the sun."
            },
            {
              "emoji": "🐰",
              "title": "Consumer",
              "body": "Eats other living things because it cannot make its own food."
            },
            {
              "emoji": "🍄",
              "title": "Decomposer",
              "body": "Breaks down dead plants and animals."
            }
          ]
        }
      },
      {
        "kind": "concept",
        "title": "Consumers sorted by what they eat",
        "body": "A herbivore eats only plants, like a grasshopper munching leaves. A carnivore eats only other animals, like a ladybug eating aphids. An omnivore eats both plants and animals.",
        "say": "A herbivore eats only plants, like a grasshopper munching leaves. A carnivore eats only other animals, like a ladybug eating aphids. An omnivore eats both plants and animals.",
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "🦗",
              "title": "Herbivore",
              "body": "Eats only plants."
            },
            {
              "emoji": "🐞",
              "title": "Carnivore",
              "body": "Eats only other animals."
            },
            {
              "emoji": "🐻",
              "title": "Omnivore",
              "body": "Eats both plants and animals."
            }
          ]
        }
      },
      {
        "kind": "example",
        "title": "Two kinds of adaptations",
        "body": "An adaptation is anything that helps a living thing survive. A structural adaptation is a special body part, and a behavioral adaptation is a special thing an animal does.",
        "say": "An adaptation is anything that helps a living thing survive. A structural adaptation is a special body part. A behavioral adaptation is a special thing an animal does. Look at these two examples.",
        "reveal": [
          "Blubber is a thick layer of fat under a whale's skin. It is a body part, so it is a structural adaptation, and it keeps the whale warm in icy water.",
          "Wolves hunting together in a pack is an action, so it is a behavioral adaptation that helps them catch large prey."
        ],
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "🐳",
              "title": "Structural",
              "body": "A body part, like a whale's warm blubber."
            },
            {
              "emoji": "🐺",
              "title": "Behavioral",
              "body": "An action, like wolves hunting in a pack."
            }
          ]
        }
      },
      {
        "kind": "concept",
        "title": "Partners and growing up",
        "body": "In pollination a bee gets nectar to eat while pollen sticks to its body and rubs onto the next flower, so the flower can make seeds; this partnership helps both. Animals also grow through a life cycle, and a frog goes egg, tadpole, froglet, then adult frog.",
        "say": "In pollination a bee gets nectar to eat while pollen sticks to its body and rubs onto the next flower, so the flower can make seeds. This partnership helps both the bee and the flower. Animals also grow through a life cycle. A frog goes from egg, to tadpole, to froglet, and then to adult frog.",
        "analogy": "The bee is like a delivery driver who gets paid in nectar and delivers pollen along the way."
      },
      {
        "kind": "show",
        "title": "Biomes and surviving winter",
        "body": "A biome is a large area with its own climate, like a deciduous forest with four seasons and trees that drop their leaves in fall, or a desert, tundra, or ocean. When winter comes, animals may migrate to a warmer place, or hibernate in a deep rest, while plants go dormant, stopping their growth until spring.",
        "say": "A biome is a large area with its own climate. A deciduous forest has four seasons and trees that drop their leaves in fall. Others are the desert, the tundra, and the ocean. When winter comes, some animals migrate to a warmer place, and some hibernate in a deep rest. Plants go dormant, which means they stop growing and rest until spring.",
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "🦆",
              "title": "Migration",
              "body": "Animals travel to a warmer place when seasons change."
            },
            {
              "emoji": "🐻",
              "title": "Hibernation",
              "body": "An animal rests deeply through the cold winter."
            },
            {
              "emoji": "🍎",
              "title": "Dormancy",
              "body": "A plant stops growing and rests until spring."
            }
          ]
        }
      },
      {
        "kind": "try",
        "title": "Your turn",
        "body": "A polar bear has thick fur that traps heat and keeps its body warm in the freezing Arctic. What kind of adaptation is the thick fur?",
        "say": "A polar bear has thick fur that traps heat and keeps its body warm in the freezing Arctic. What kind of adaptation is the thick fur? Pick the best answer.",
        "widget": {
          "w": "tapPick",
          "prompt": "Thick fur that keeps a bear warm is which kind of adaptation?",
          "options": [
            {
              "label": "A structural adaptation, a special body part",
              "correct": true
            },
            {
              "label": "A behavioral adaptation, something it does"
            },
            {
              "label": "A stage in its life cycle"
            }
          ]
        }
      },
      {
        "kind": "recap",
        "title": "You explored the ecosystem",
        "body": "Producers make food while consumers (herbivores, carnivores, omnivores) eat and decomposers clean up. Living things survive with structural and behavioral adaptations, grow through life cycles, help each other through pollination, and get through winter by migrating, hibernating, or going dormant.",
        "say": "Producers make food while consumers eat and decomposers clean up. Consumers can be herbivores, carnivores, or omnivores. Living things survive with structural and behavioral adaptations, grow through life cycles, help each other through pollination, and get through winter by migrating, hibernating, or going dormant.",
        "takeaway": "Every living thing has a role, a set of adaptations, and its own way to survive the seasons.",
        "emoji": "🌎"
      }
    ]
  },
  {
    "id": "lx.s4space",
    "skillId": "s.4.space",
    "subject": "science",
    "grade": 4,
    "title": "A Tour of the Solar System and Beyond",
    "subtitle": "Meet the Sun, planets, Moon, comets, and the galaxy we live in",
    "steps": [
      {
        "kind": "hook",
        "title": "Space is full of surprises",
        "body": "The tiny dots of light in the night sky are giant balls of fire, spinning worlds, and flying snowballs of ice. Let's take a tour and find out what they really are.",
        "say": "The tiny dots of light in the night sky are giant balls of fire, spinning worlds, and flying snowballs of ice. Let us take a tour and find out what they really are."
      },
      {
        "kind": "concept",
        "title": "The Sun is a star made of glowing gas",
        "body": "The Sun is a giant ball of extremely hot, glowing gases, mostly hydrogen and helium, so it has no solid surface to stand on. Other stars twinkle because their light passes through Earth's moving air, which bends the light a little back and forth.",
        "say": "The Sun is a giant ball of extremely hot, glowing gases, mostly hydrogen and helium, so it has no solid surface to stand on. Other stars twinkle because their light passes through Earth's moving air, which bends the light a little back and forth.",
        "analogy": "Looking at a star through moving air is like watching a coin at the bottom of a wavy pool. The coin stays still, but it seems to wiggle."
      },
      {
        "kind": "show",
        "title": "The planets: hottest and largest",
        "body": "Venus is the hottest planet, even hotter than Mercury, because its thick atmosphere traps the Sun's heat like a blanket. Jupiter is the largest planet, so big that more than a thousand Earths could fit inside it.",
        "say": "Venus is the hottest planet, even hotter than Mercury, because its thick atmosphere traps the Sun's heat like a blanket. Jupiter is the largest planet, so big that more than a thousand Earths could fit inside it.",
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "🔥",
              "title": "Hottest: Venus",
              "body": "Its thick air traps heat like a blanket, so it beats Mercury even though Mercury is closer to the Sun."
            },
            {
              "emoji": "🪐",
              "title": "Largest: Jupiter",
              "body": "The biggest planet of all. More than 1,000 Earths could fit inside it."
            }
          ]
        }
      },
      {
        "kind": "concept",
        "title": "Comets, shooting stars, and galaxies",
        "body": "A comet is a frozen ball of ice and dust, a dirty snowball, that grows a glowing tail when it nears the Sun. A shooting star is really a meteor, a small space rock burning up in Earth's air, and a galaxy is a huge collection of billions of stars held together by gravity.",
        "say": "A comet is a frozen ball of ice and dust, a dirty snowball, that grows a glowing tail when it nears the Sun. A shooting star is really a meteor, a small space rock burning up in Earth's air, and a galaxy is a huge collection of billions of stars held together by gravity."
      },
      {
        "kind": "example",
        "title": "The Moon and how we explore space",
        "body": "The Moon is covered in bowl-shaped craters made when space rocks crashed into it long ago, since it has no air to burn them up first. People have explored space in person and with robots.",
        "say": "The Moon is covered in bowl-shaped craters made when space rocks crashed into it long ago, since it has no air to burn them up first. People have explored space in person and with robots.",
        "reveal": [
          "Craters: space rocks slammed into the Moon and left round dents that never wash or blow away.",
          "In 1969, Neil Armstrong became the first person to walk on the Moon during the Apollo 11 mission.",
          "On Mars, scientists drive robotic vehicles called rovers that roam the surface, take pictures, and study rocks."
        ]
      },
      {
        "kind": "try",
        "title": "Your turn",
        "body": "You know why Venus wins the heat contest. Pick the reason Venus is hotter than Mercury even though Mercury is closer to the Sun.",
        "say": "You know why Venus wins the heat contest. Pick the reason Venus is hotter than Mercury even though Mercury is closer to the Sun.",
        "widget": {
          "w": "tapPick",
          "prompt": "Why is Venus the hottest planet?",
          "options": [
            {
              "label": "Its thick atmosphere traps the Sun's heat like a blanket",
              "correct": true
            },
            {
              "label": "It is the planet closest to the Sun"
            },
            {
              "label": "It is made of burning lava and fire"
            }
          ]
        }
      },
      {
        "kind": "recap",
        "title": "Remember this",
        "body": "Our Sun is a ball of glowing gas, Venus is the hottest planet and Jupiter the largest, comets are icy snowballs, meteors are burning space rocks, the Moon's craters came from impacts, and everything sits inside a galaxy of billions of stars.",
        "say": "Our Sun is a ball of glowing gas, Venus is the hottest planet and Jupiter the largest, comets are icy snowballs, meteors are burning space rocks, the Moon's craters came from impacts, and everything sits inside a galaxy of billions of stars.",
        "takeaway": "The solar system holds the Sun, planets, moons, comets, and space rocks, and it is just one tiny part of a giant galaxy.",
        "emoji": "🌌"
      }
    ]
  },
  {
    "id": "lx.s7matter",
    "skillId": "s.7.matter",
    "subject": "science",
    "grade": 7,
    "title": "Atoms, Elements & Reactions",
    "subtitle": "The building blocks of matter and how they change",
    "steps": [
      {
        "kind": "hook",
        "title": "Everything is made of tiny pieces",
        "body": "The air you breathe, the water you drink, and the desk in front of you are all built from incredibly small particles called atoms. Learn how atoms are built and combined, and you can explain almost anything about matter.",
        "say": "The air you breathe, the water you drink, and the desk in front of you are all built from incredibly small particles called atoms. Learn how atoms are built and combined, and you can explain almost anything about matter.",
        "analogy": "Atoms are like LEGO bricks: a small set of pieces can be snapped together to build almost everything around you."
      },
      {
        "kind": "concept",
        "title": "Inside an atom",
        "body": "An atom has a tiny center called the nucleus that holds protons and neutrons, while electrons zoom around the outside. The atomic number tells you how many protons are in the nucleus, and that number is what identifies the element.",
        "say": "An atom has a tiny center called the nucleus that holds protons and neutrons, while electrons zoom around the outside. The atomic number tells you how many protons are in the nucleus, and that number is what identifies the element.",
        "analogy": "The nucleus is like the sun at the center of a solar system, with electrons orbiting around it like planets.",
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "⚛️",
              "title": "Nucleus",
              "body": "The center of the atom, holding protons and neutrons packed together."
            },
            {
              "emoji": "💨",
              "title": "Electrons",
              "body": "Tiny particles that move in the space outside the nucleus."
            }
          ]
        }
      },
      {
        "kind": "concept",
        "title": "Elements, compounds, and mixtures",
        "body": "An element is made of only one kind of atom, even when the atoms pair up, like oxygen gas written O2. A compound is two or more different atoms chemically bonded in a fixed, never-changing ratio, like water at two hydrogen for every one oxygen. A mixture is just substances resting side by side without bonding, so they can be pulled apart by physical methods.",
        "say": "An element is made of only one kind of atom, even when the atoms pair up, like oxygen gas. A compound is two or more different atoms chemically bonded in a fixed, never-changing ratio, like water at two hydrogen for every one oxygen. A mixture is just substances resting side by side without bonding, so they can be pulled apart by physical methods.",
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "🔵",
              "title": "Element",
              "body": "One type of atom only, such as oxygen gas."
            },
            {
              "emoji": "💧",
              "title": "Compound",
              "body": "Different atoms bonded in a set ratio, such as water."
            },
            {
              "emoji": "🧲",
              "title": "Mixture",
              "body": "Substances combined but not bonded, like sand and iron filings you can pull apart with a magnet."
            }
          ]
        }
      },
      {
        "kind": "example",
        "title": "Counting atoms in a formula",
        "body": "A small number after an atom (a subscript) tells how many of that atom are in one molecule, and a big number in front (a coefficient) multiplies the whole molecule. So 3 H2O means three separate water molecules.",
        "say": "A small number after an atom tells how many of that atom are in one molecule, and a big number in front multiplies the whole molecule. So three H two O means three separate water molecules.",
        "reveal": [
          "One H2O molecule has 2 hydrogen atoms plus 1 oxygen atom, which is 3 atoms.",
          "The coefficient 3 means there are 3 whole molecules.",
          "Multiply: 3 molecules times 3 atoms each = 9 atoms in total."
        ]
      },
      {
        "kind": "show",
        "title": "Reactions: reactants become products",
        "body": "In a chemical equation the starting substances are written before the arrow and are called the reactants, and the new substances made after the arrow are the products. Some changes release heat (exothermic, feels warm) while others absorb heat from their surroundings (endothermic, feels cold, like an instant cold pack).",
        "say": "In a chemical equation the starting substances are written before the arrow and are called the reactants, and the new substances made after the arrow are the products. Some changes release heat, called exothermic and feeling warm, while others absorb heat from their surroundings, called endothermic and feeling cold, like an instant cold pack.",
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "🔥",
              "title": "Exothermic",
              "body": "Gives off heat to the surroundings, so it feels warm."
            },
            {
              "emoji": "❄️",
              "title": "Endothermic",
              "body": "Takes in heat from the surroundings, so it feels cold."
            }
          ]
        }
      },
      {
        "kind": "concept",
        "title": "Physical vs chemical change",
        "body": "In a physical change the substance stays the same, like wax melting and then hardening again, or a puddle evaporating when surface particles gain energy and escape as water vapor even below boiling. In a chemical change atoms rearrange into brand-new substances, like natural gas burning.",
        "say": "In a physical change the substance stays the same, like wax melting and then hardening again, or a puddle evaporating when surface particles gain energy and escape as water vapor even below boiling. In a chemical change atoms rearrange into brand-new substances, like natural gas burning.",
        "analogy": "Melting is like squishing clay into a new shape, it is still the same clay; a chemical change is like baking that clay into a totally different material."
      },
      {
        "kind": "try",
        "title": "Your turn",
        "body": "A jar holds sand mixed with tiny iron filings, and you can pull the iron out with a magnet, leaving the sand behind. What does this tell you?",
        "say": "A jar holds sand mixed with tiny iron filings, and you can pull the iron out with a magnet, leaving the sand behind. What does this tell you?",
        "widget": {
          "w": "tapPick",
          "prompt": "Sand and iron can be separated with a magnet, so together they are...",
          "options": [
            {
              "label": "A mixture, because they are combined but not chemically bonded",
              "correct": true
            },
            {
              "label": "A compound, because two different things are combined"
            },
            {
              "label": "A single element, since they share one jar"
            }
          ]
        }
      },
      {
        "kind": "recap",
        "title": "Putting it together",
        "body": "Atoms have a nucleus of protons and neutrons with electrons outside, and the atomic number counts protons. Matter can be an element, a compound with a fixed ratio, or a separable mixture, and it changes physically (same substance) or chemically (new substances form).",
        "say": "Atoms have a nucleus of protons and neutrons with electrons outside, and the atomic number counts protons. Matter can be an element, a compound with a fixed ratio, or a separable mixture, and it changes physically, staying the same substance, or chemically, forming new substances.",
        "takeaway": "Know how atoms are built and how they combine and change, and you can explain elements, compounds, mixtures, and reactions.",
        "emoji": "⚛️"
      }
    ]
  },
  {
    "id": "lx.s8space",
    "skillId": "s.8.space",
    "subject": "science",
    "grade": 8,
    "title": "Space and the Solar System",
    "subtitle": "Spins, orbits, tides, eclipses, planets, and the rocks in between",
    "steps": [
      {
        "kind": "hook",
        "title": "One system, many motions",
        "body": "The Sun rising, the tides sliding in and out, a shooting star, the Red Planet glowing at night. All of these are pieces of one moving solar system, and once you know the moves, they all make sense.",
        "say": "The Sun rising, the tides sliding in and out, a shooting star, the Red Planet glowing at night. All of these are pieces of one moving solar system, and once you know the moves, they all make sense."
      },
      {
        "kind": "concept",
        "title": "Spin gives us days, orbit gives us years",
        "body": "Earth spins on its axis once every 24 hours, which is why the Sun appears to cross the sky and why we get day and night. Earth also travels all the way around the Sun once, and that one full orbit, about 365 days, is what we call a year.",
        "say": "Earth spins on its axis once every 24 hours, which is why the Sun appears to cross the sky and why we get day and night. Earth also travels all the way around the Sun once, and that one full orbit, about 365 days, is what we call a year.",
        "analogy": "Spinning like a top gives you day and night; walking a full lap around a campfire gives you a year.",
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "🔄",
              "title": "Spin = Day",
              "body": "Earth turns on its axis once every 24 hours, making the Sun appear to move."
            },
            {
              "emoji": "🌍",
              "title": "Orbit = Year",
              "body": "Earth circles the Sun once in about 365 days."
            }
          ]
        }
      },
      {
        "kind": "concept",
        "title": "Tides: two bulges, spring and neap",
        "body": "The Moon's gravity pulls the ocean into a bulge on the near side and, because Earth itself is pulled away from the far water, a second bulge on the far side, so most coasts get two high tides a day. When the Sun and Moon line up at new and full moon their pulls add for extra-strong spring tides, and when they sit at right angles at the quarter moons their pulls partly cancel for weak neap tides.",
        "say": "The Moon's gravity pulls the ocean into a bulge on the near side and, because Earth itself is pulled away from the far water, a second bulge on the far side, so most coasts get two high tides a day. When the Sun and Moon line up at new and full moon their pulls add for extra strong spring tides, and when they sit at right angles at the quarter moons their pulls partly cancel for weak neap tides.",
        "analogy": "Two people pulling a rope the same direction pull hard together (spring tide); pulling at right angles they fight each other and barely move it (neap tide).",
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "🌕",
              "title": "Spring tides",
              "body": "Sun and Moon in a line (new or full moon); pulls combine for the biggest tides."
            },
            {
              "emoji": "🌗",
              "title": "Neap tides",
              "body": "Sun and Moon at right angles (quarter moon); pulls partly cancel for the smallest tides."
            }
          ]
        }
      },
      {
        "kind": "concept",
        "title": "Eclipses and twinkling stars",
        "body": "A solar eclipse happens when the Moon passes directly between the Sun and Earth, throwing its shadow onto Earth and darkening the daytime sky. Stars twinkle because their tiny points of light get bent, or refracted, as they pass through Earth's moving atmosphere, while closer planets show a small disk that stays steadier.",
        "say": "A solar eclipse happens when the Moon passes directly between the Sun and Earth, throwing its shadow onto Earth and darkening the daytime sky. Stars twinkle because their tiny points of light get bent, or refracted, as they pass through Earth's moving atmosphere, while closer planets show a small disk that stays steadier.",
        "analogy": "A solar eclipse is like a friend stepping between you and a lamp; twinkling is like looking at a candle across a hot, shimmering road."
      },
      {
        "kind": "show",
        "title": "Planets and space rocks",
        "body": "The four inner planets, Mercury, Venus, Earth, and Mars, are terrestrial planets made of rock and metal, unlike the gas giants farther out; Mars looks red because its soil is full of iron oxide, the same rust that forms on old metal. A space rock has three names: a meteoroid drifts in space, a meteor is the streak of light it makes burning up in the air, and a meteorite is the piece that survives to hit the ground.",
        "say": "The four inner planets, Mercury, Venus, Earth, and Mars, are terrestrial planets made of rock and metal, unlike the gas giants farther out. Mars looks red because its soil is full of iron oxide, the same rust that forms on old metal. A space rock has three names: a meteoroid drifts in space, a meteor is the streak of light it makes burning up in the air, and a meteorite is the piece that survives to hit the ground.",
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "🪨",
              "title": "Meteoroid",
              "body": "A rock still drifting through space."
            },
            {
              "emoji": "🌠",
              "title": "Meteor",
              "body": "The streak of light as it burns in the sky."
            },
            {
              "emoji": "☄️",
              "title": "Meteorite",
              "body": "The piece that survives and lands on the ground."
            }
          ]
        }
      },
      {
        "kind": "try",
        "title": "Your turn",
        "body": "A surfer sees unusually weak tides around the first-quarter moon. Why are these neap tides so small?",
        "say": "A surfer sees unusually weak tides around the first quarter moon. Why are these neap tides so small?",
        "widget": {
          "w": "tapPick",
          "prompt": "What causes weak neap tides at a quarter moon?",
          "options": [
            {
              "label": "The Sun and Moon pull at right angles, partly canceling each other",
              "correct": true
            },
            {
              "label": "The Sun and Moon line up on the same side of Earth"
            },
            {
              "label": "The Moon is at its farthest point from Earth"
            }
          ]
        }
      },
      {
        "kind": "recap",
        "title": "Remember this",
        "body": "Earth's spin makes days and its orbit makes years; the Moon's gravity makes two tidal bulges that combine into spring tides or cancel into neap tides; the Moon between the Sun and Earth makes a solar eclipse; the rocky inner planets include rusty red Mars; and a space rock is a meteoroid, then a meteor, then a meteorite once it lands.",
        "say": "Earth's spin makes days and its orbit makes years. The Moon's gravity makes two tidal bulges that combine into spring tides or cancel into neap tides. The Moon between the Sun and Earth makes a solar eclipse. The rocky inner planets include rusty red Mars. And a space rock is a meteoroid, then a meteor, then a meteorite once it lands.",
        "takeaway": "Days and years come from Earth's spin and orbit; tides, eclipses, planets, and space rocks each follow their own simple rule.",
        "emoji": "🌌"
      }
    ]
  },
  {
    "id": "lx.s9genetics",
    "skillId": "s.9.genetics",
    "subject": "science",
    "grade": 9,
    "title": "Genetics & Heredity",
    "subtitle": "Alleles, Punnett squares, and how genes build traits",
    "steps": [
      {
        "kind": "hook",
        "title": "The rules behind the remix",
        "body": "You already know half your DNA comes from each parent, but that mix follows exact rules. Learn those rules and you can predict traits, decode blood types, and even spot why one tiny gene change causes disease.",
        "say": "You already know half your DNA comes from each parent, but that mix follows exact rules. Learn those rules and you can predict traits, decode blood types, and even see why one tiny gene change causes disease.",
        "analogy": "Genes are like a recipe: change one ingredient and the whole dish can change."
      },
      {
        "kind": "concept",
        "title": "Alleles, dominant and recessive",
        "body": "A gene can come in different versions called alleles. A dominant allele shows its trait even when only one copy is present, while a recessive allele's trait appears only when both copies are recessive; having two identical alleles is homozygous and having two different alleles is heterozygous.",
        "say": "A gene can come in different versions called alleles. A dominant allele shows its trait even with just one copy, but a recessive trait appears only when both copies are recessive. Two matching alleles is called homozygous, and two different alleles is called heterozygous.",
        "analogy": "A dominant allele is like a loud voice that drowns out a quiet recessive one, so the recessive is heard only when both copies whisper.",
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "🔊",
              "title": "Dominant",
              "body": "Shows with one copy. A single dominant allele masks a recessive one, so a heterozygote looks dominant."
            },
            {
              "emoji": "🤫",
              "title": "Recessive",
              "body": "Hidden unless both alleles are recessive (homozygous recessive). Two unaffected carrier parents can have an affected child."
            }
          ]
        }
      },
      {
        "kind": "example",
        "title": "Punnett squares and counting gametes",
        "body": "A Punnett square crosses the parents' gametes to predict offspring. Crossing two heterozygotes for one gene gives the classic 3 to 1 dominant-to-recessive phenotype ratio, and the number of different gametes a parent can make is 2 to the power of the number of heterozygous genes.",
        "say": "A Punnett square crosses the parents' gametes to predict offspring. Crossing two heterozygotes for one gene gives the classic three to one ratio of dominant to recessive. The number of different gametes a parent can make is two raised to the number of heterozygous genes.",
        "reveal": [
          "Cross Tt x Tt, where tall (T) is dominant to short (t). Each parent's gametes are T or t.",
          "Fill the square: TT, Tt, Tt, tt.",
          "Genotypes come out 1 TT : 2 Tt : 1 tt (a 1:2:1 genotype ratio).",
          "Phenotypes: TT, Tt, and Tt all look tall because each has a dominant T; only tt is short. That is a 3 tall : 1 short ratio.",
          "Gamete count: a heterozygote for n genes makes 2^n gamete types. AaBb has 2 heterozygous genes, so 2^2 = 4 gametes: AB, Ab, aB, ab."
        ]
      },
      {
        "kind": "show",
        "title": "When dominance is not simple",
        "body": "Sometimes alleles do not follow strict dominance. In incomplete dominance the heterozygote is a single blended intermediate, in codominance both alleles show fully and separately, and some genes have more than two alleles ranked in a dominance series.",
        "say": "Sometimes alleles do not follow strict dominance. In incomplete dominance the heterozygote is a single blended in-between form. In codominance both alleles show fully and separately. And some genes have more than two alleles ranked in a dominance series.",
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "🌸",
              "title": "Incomplete dominance",
              "body": "Heterozygote blends into one new intermediate, like a red flower plus a white flower making pink."
            },
            {
              "emoji": "🩸",
              "title": "Codominance",
              "body": "Both alleles appear fully at the same time, like AB blood showing both A and B markers side by side."
            },
            {
              "emoji": "🐇",
              "title": "Multiple alleles",
              "body": "One gene, several alleles in a rank, e.g. C > c-ch > c-h > c. A c-ch c rabbit shows chinchilla because c-ch outranks albino c."
            }
          ]
        }
      },
      {
        "kind": "show",
        "title": "Genes to traits, and DNA changes",
        "body": "One gene can affect many traits (pleiotropy), or many genes can add up to shape one trait along a smooth range (polygenic inheritance). Traits are built when DNA is transcribed into RNA, and a change in a single base is a point mutation.",
        "say": "One gene can affect many traits, called pleiotropy. Or many genes can add up to shape one trait across a smooth range, called polygenic inheritance. Traits are built when DNA is copied into RNA, and a change in a single base is called a point mutation.",
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "🕸️",
              "title": "Pleiotropy",
              "body": "One gene, many effects. The single sickle cell gene changes cell shape, oxygen transport, spleen function, and joint pain."
            },
            {
              "emoji": "📈",
              "title": "Polygenic",
              "body": "Many genes each add a small effect to one trait, giving continuous variation like height and skin color."
            },
            {
              "emoji": "🧬",
              "title": "Transcription",
              "body": "DNA is read to build RNA. RNA uses the base uracil (U) in place of thymine (T), and U pairs with adenine."
            },
            {
              "emoji": "🔤",
              "title": "Point mutation",
              "body": "One nucleotide is swapped, such as an A-T pair replaced by a G-C pair. It is a substitution, not a whole-chromosome change."
            }
          ]
        }
      },
      {
        "kind": "try",
        "title": "Your turn",
        "body": "Two parents who do not show a certain trait have a child who does show it. What does this tell you about the trait?",
        "say": "Two parents who do not show a certain trait have a child who does show it. What does this tell you about the trait?",
        "widget": {
          "w": "tapPick",
          "prompt": "Two unaffected parents have an affected child. The trait is most likely...",
          "options": [
            {
              "label": "recessive, because both parents were hidden carriers",
              "correct": true
            },
            {
              "label": "dominant, because it appeared in the child"
            },
            {
              "label": "carried only on the Y chromosome"
            }
          ]
        }
      },
      {
        "kind": "recap",
        "title": "Remember this",
        "body": "Alleles can be dominant or recessive, and recessive traits need two recessive copies. Punnett squares predict ratios like 3 to 1, patterns like incomplete dominance, codominance, multiple alleles, pleiotropy, and polygenic inheritance explain trickier traits, and RNA uses uracil while a single swapped base is a point mutation.",
        "say": "Alleles can be dominant or recessive, and recessive traits need two recessive copies. Punnett squares predict ratios like three to one. Patterns like incomplete dominance, codominance, multiple alleles, pleiotropy, and polygenic inheritance explain trickier traits. And remember that RNA uses uracil, while a single swapped base is a point mutation.",
        "takeaway": "Genes follow rules: dominance decides what shows, Punnett squares predict the odds, and special patterns plus DNA-to-RNA changes explain the rest.",
        "emoji": "🧬"
      }
    ]
  },
  {
    "id": "lx.sp1colors",
    "skillId": "sp.1.colors",
    "subject": "spanish",
    "grade": 1,
    "title": "Colores y Números",
    "subtitle": "Colors, numbers, days, and everyday words in Spanish",
    "steps": [
      {
        "kind": "hook",
        "title": "A day in Spanish",
        "body": "Imagine waking up and saying \"Buenos dias!\" Then you count your crayons and pick a rosa one to draw a flor. Today you will learn Spanish colors, numbers, days, and everyday words all in one place.",
        "say": "Imagine waking up and saying Buenos dias, which means good morning. Then you count your crayons and pick a pink one to draw a flower. Today you will learn Spanish colors, numbers, days, and everyday words all in one place.",
        "analogy": "It is like packing one backpack with everything you need for a whole day."
      },
      {
        "kind": "concept",
        "title": "Colors have Spanish names",
        "body": "Every color has a Spanish word. Rosa is pink, like a rose petal, and blanco is white, like snow or clouds. Rojo is red, azul is blue, and amarillo is yellow like the sun.",
        "say": "Every color has a Spanish word. Rosa is pink, like a rose petal, and blanco is white, like snow or clouds. Rojo is red, azul is blue, and amarillo is yellow like the sun.",
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "🌸",
              "title": "rosa",
              "body": "pink, like a soft rose"
            },
            {
              "emoji": "❄️",
              "title": "blanco",
              "body": "white, like snow"
            },
            {
              "emoji": "🌞",
              "title": "amarillo",
              "body": "yellow, like the sun"
            }
          ]
        }
      },
      {
        "kind": "show",
        "title": "Counting in Spanish",
        "body": "You count uno, dos, tres and keep going. Siete is seven, right after seis (six). For bigger numbers, diecinueve is nineteen and veinte is twenty, the number you reach counting all your fingers and toes.",
        "say": "You count uno, dos, tres and keep going. Siete is seven, right after seis, which is six. For bigger numbers, diecinueve is nineteen and veinte is twenty, the number you reach counting all your fingers and toes.",
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "7️⃣",
              "title": "siete",
              "body": "seven, after seis"
            },
            {
              "emoji": "1️⃣9️⃣",
              "title": "diecinueve",
              "body": "nineteen, just before twenty"
            },
            {
              "emoji": "2️⃣0️⃣",
              "title": "veinte",
              "body": "twenty"
            }
          ]
        }
      },
      {
        "kind": "example",
        "title": "Taking away in Spanish",
        "body": "You can subtract with Spanish numbers too. If Maria has seis stickers and gives away dos, she has cuatro left, because six take away two is four.",
        "say": "You can subtract with Spanish numbers too. If Maria has six stickers and gives away two, she has four left, because six take away two is four.",
        "reveal": [
          "Start with seis, which means six.",
          "Give away dos, which means two.",
          "Six take away two equals four.",
          "Four in Spanish is cuatro."
        ]
      },
      {
        "kind": "concept",
        "title": "Greetings, days, and everyday words",
        "body": "You greet people with \"Buenos dias,\" which means good morning. The weekend days are sabado (Saturday) and domingo (Sunday). Everyday words help too: perro is dog and flor is flower.",
        "say": "You greet people with Buenos dias, which means good morning. The weekend days are sabado, which is Saturday, and domingo, which is Sunday. Everyday words help too: perro is dog and flor is flower.",
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "🌅",
              "title": "Buenos dias",
              "body": "good morning"
            },
            {
              "emoji": "📅",
              "title": "sabado",
              "body": "Saturday, before domingo"
            },
            {
              "emoji": "🐶",
              "title": "perro",
              "body": "dog that says woof"
            }
          ]
        }
      },
      {
        "kind": "try",
        "title": "Your turn",
        "body": "Maria has seis stickers and gives dos away. How many does she have left, in Spanish?",
        "say": "Maria has six stickers and gives two away. How many does she have left, in Spanish?",
        "widget": {
          "w": "tapPick",
          "prompt": "Seis take away dos equals what?",
          "options": [
            {
              "label": "cuatro",
              "correct": true
            },
            {
              "label": "ocho"
            },
            {
              "label": "cinco"
            }
          ]
        }
      },
      {
        "kind": "recap",
        "title": "Remember this",
        "body": "You learned colors like rosa (pink) and blanco (white), numbers like siete, diecinueve, and veinte, subtraction like seis minus dos equals cuatro, days like sabado, the greeting Buenos dias, and words like perro and flor.",
        "say": "You learned colors like rosa for pink and blanco for white, numbers like siete, diecinueve, and veinte, subtraction like six minus two equals four, days like sabado, the greeting Buenos dias, and words like perro for dog and flor for flower.",
        "takeaway": "Spanish gives names to colors, numbers, days, greetings, and everyday things.",
        "emoji": "🎨"
      }
    ]
  },
  {
    "id": "lx.sp10subjunctive",
    "skillId": "sp.10.subjunctive",
    "subject": "spanish",
    "grade": 10,
    "title": "Forming the Present Subjunctive",
    "subtitle": "Build the endings, stems, and spellings that wishes and doubts demand",
    "steps": [
      {
        "kind": "hook",
        "title": "The doctor's orders",
        "body": "When your doctor says 'Recomiendo que duermas ocho horas', that -a on 'duermas' is not a typo. A trigger phrase forced the verb into the subjunctive mood.",
        "say": "When your doctor says he recommends that you sleep eight hours, the special ending on the verb is not a typo. A trigger phrase forced the verb into the subjunctive mood.",
        "analogy": "A trigger phrase is like a light switch: certain words flip every verb after 'que' into a new form."
      },
      {
        "kind": "concept",
        "title": "What flips the switch",
        "body": "Two families of triggers demand the subjunctive after 'que': impersonal expressions like 'Es mejor que', 'Es importante que', and 'Más vale que', plus WEIRDO verbs of Wish, Emotion, Recommendation, and Doubt such as recomendar, sugerir, aconsejar, preferir, temer, and the word 'ojalá'.",
        "say": "Two families of triggers demand the subjunctive after the word que. First, impersonal expressions like it is better that, it is important that, and it is worth more that. Second, WEIRDO verbs of wish, emotion, recommendation, and doubt, such as to recommend, to suggest, to advise, to prefer, to fear, and the word ojala.",
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "📄",
              "title": "Impersonal",
              "body": "Es mejor que, Es importante que, Mas vale que"
            },
            {
              "emoji": "🙏",
              "title": "WEIRDO verbs",
              "body": "recomendar, sugerir, aconsejar, preferir, temer, ojala"
            }
          ]
        }
      },
      {
        "kind": "show",
        "title": "The opposite-vowel rule",
        "body": "To form it, take the 'yo' present form, drop the -o, and add the opposite vowel endings: -ar verbs take -e endings (estudiar becomes estudie, estudies, estudiemos, estudien), and -er/-ir verbs take -a endings (comer becomes coma, comas, comamos, coman).",
        "say": "To form it, take the yo present form, drop the final o, and add the opposite vowel endings. The a r verbs take e endings, so estudiar becomes estudien. The e r and i r verbs take a endings, so comer becomes coman.",
        "analogy": "The vowels swap sides: -ar borrows the 'e' of -er, and -er/-ir borrow the 'a' of -ar."
      },
      {
        "kind": "example",
        "title": "Stems, irregulars, and spelling",
        "body": "Starting from 'yo' carries stem changes and irregular stems along automatically, while -car/-gar/-zar verbs adjust their spelling to keep the same sound.",
        "say": "Starting from the yo form carries stem changes and irregular stems along automatically, while certain verbs adjust their spelling to keep the same sound.",
        "reveal": [
          "Stem change o to ue: dormir yo digo... yo duermo, drop o, add a gives duerma; poder yo puedo gives puedan.",
          "Stem change e to ie: perder yo pierdo, drop o, add a gives pierda.",
          "Stem change e to i (-ir verbs change even in nosotros): pedir gives pidamos; elegir yo elijo already shows g to j, giving elija.",
          "Irregular stems: decir yo digo gives digas; ir has no normal yo form and uses vay-, giving vayas.",
          "Spelling to keep the sound: pagar adds u before e giving paguen; almorzar changes z to c before e giving almorcemos."
        ]
      },
      {
        "kind": "try",
        "title": "Your turn",
        "body": "Choose the correct present-subjunctive form after this trigger: 'Es importante que los estudiantes ___ un poco cada dia.' (estudiar)",
        "say": "Choose the correct present subjunctive form after the trigger it is important that the students study a little each day, using the verb estudiar.",
        "widget": {
          "w": "tapPick",
          "prompt": "Es importante que los estudiantes ___ cada dia. (estudiar)",
          "options": [
            {
              "label": "estudien",
              "correct": true
            },
            {
              "label": "estudian"
            },
            {
              "label": "estudiaron"
            }
          ]
        }
      },
      {
        "kind": "recap",
        "title": "Remember this",
        "body": "After an impersonal expression or a WEIRDO verb plus 'que', start from the 'yo' form, drop -o, and add the opposite vowel endings, keeping stem changes, irregular stems, and -car/-gar/-zar spelling shifts.",
        "say": "After an impersonal expression or a WEIRDO verb plus que, start from the yo form, drop the o, and add the opposite vowel endings, keeping stem changes, irregular stems, and the spelling shifts.",
        "takeaway": "Trigger, then yo-form minus o, plus opposite-vowel endings, carrying stems and spelling fixes.",
        "emoji": "🔀"
      }
    ]
  },
  {
    "id": "lx.sp11advanced",
    "skillId": "sp.11.advanced",
    "subject": "spanish",
    "grade": 11,
    "title": "Advanced Spanish: Mood, Relatives, and Idioms",
    "subtitle": "Subjunctive triggers, relative pronouns, and the verbs that break the rules",
    "steps": [
      {
        "kind": "hook",
        "title": "The grammar that sounds native",
        "body": "Beyond por and para, real fluency shows up in small choices: which verb mood to use after a doubt, which little word links two ideas, and a handful of verbs that flip the sentence around. Master these and you stop sounding like a textbook.",
        "say": "Beyond por and para, real fluency shows up in small choices. Which verb mood to use after a doubt, which little word links two ideas, and a handful of verbs that flip the sentence around. Master these and you stop sounding like a textbook.",
        "analogy": "These are the finishing brushstrokes that turn a correct sentence into one a native speaker would actually say."
      },
      {
        "kind": "example",
        "title": "The subjunctive: hope, doubt, and the unreal",
        "body": "When a sentence expresses hope, doubt, or something contrary to fact, Spanish switches from the normal indicative to the subjunctive. Each trigger word tells you which form to use: hope, unreal comparisons, and doubt about a finished action each call for a different tense of the subjunctive.",
        "say": "When a sentence expresses hope, doubt, or something contrary to fact, Spanish switches from the normal indicative to the subjunctive. Each trigger word tells you which form to use. Hope, unreal comparisons, and doubt about a finished action each call for a different tense of the subjunctive.",
        "reveal": [
          "Ojala (I hope) + present subjunctive: Ojala que llueva manana = I hope it rains tomorrow. Hope triggers llueva, not llueve.",
          "Como si (as if) + imperfect subjunctive: Habla como si lo supiera todo = He talks as if he knew everything. Unreal, so supiera.",
          "No creo que (I don't think) + present perfect subjunctive: No creo que haya llegado todavia = I don't think he has arrived yet. Doubt about a finished action turns ha into haya."
        ]
      },
      {
        "kind": "concept",
        "title": "Relative pronouns: linking two ideas",
        "body": "Relative pronouns join a describing clause to a noun. Use donde for a place (la ciudad donde naci = the city where I was born), quien for a person, and cuyo for possession (whose). For an unnamed idea or the thing that, use lo que: No entiendo lo que dices = I don't understand what you're saying.",
        "say": "Relative pronouns join a describing clause to a noun. Use donde for a place, as in la ciudad donde naci, meaning the city where I was born. Use quien for a person, and cuyo for possession, meaning whose. For an unnamed idea, or the thing that, use lo que, as in no entiendo lo que dices, meaning I do not understand what you are saying.",
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "📍",
              "title": "donde",
              "body": "Refers to a place: la ciudad donde naci = the city where I was born."
            },
            {
              "emoji": "💡",
              "title": "lo que",
              "body": "Refers to an unnamed idea: no entiendo lo que dices = I don't understand what you say."
            }
          ]
        }
      },
      {
        "kind": "show",
        "title": "Verbs that flip the sentence: faltar, llevar, acabar de",
        "body": "Faltar works like gustar and agrees with the amount lacking, not with you: Me faltan dos euros = I'm two euros short (plural euros, so faltan). Llevar plus time plus a gerund shows ongoing duration: Llevo tres horas esperando = I've been waiting three hours. Acabar de plus an infinitive means to have just done something: Acabo de comer = I have just eaten.",
        "say": "Faltar works like gustar and agrees with the amount lacking, not with you. Me faltan dos euros means I am two euros short, and because euros is plural the verb is faltan. Llevar plus a time plus a gerund shows ongoing duration. Llevo tres horas esperando means I have been waiting three hours. And acabar de plus an infinitive means to have just done something. Acabo de comer means I have just eaten.",
        "reveal": [
          "Faltar: Me faltan dos euros. Subject is dos euros (plural), so the verb is faltan, not falta.",
          "Llevar duration: Llevo (llevar) + tres horas (time) + esperando (gerund) = I've been waiting three hours.",
          "Acabar de: Acabo de + comer (infinitive) = I have just eaten, something finished a moment ago."
        ]
      },
      {
        "kind": "example",
        "title": "The 'se' construction and por for movement",
        "body": "Passive and impersonal se lets you say something is done without naming who does it, and the verb agrees with the thing: Se venden apartamentos (plural apartamentos, so venden). Also remember that por expresses movement through or along a place: Caminamos por el parque = we walked through the park.",
        "say": "The passive and impersonal se lets you say something is done without naming who does it, and the verb agrees with the thing. Se venden apartamentos uses the plural venden because apartamentos is plural. Also remember that por expresses movement through or along a place. Caminamos por el parque means we walked through the park.",
        "reveal": [
          "Se + verb: the verb matches the noun. One apartment: se vende un apartamento. Many: se venden apartamentos.",
          "Por for movement: caminamos por el parque = we walked through the park (movement along/through a space)."
        ]
      },
      {
        "kind": "try",
        "title": "Your turn: which mood?",
        "body": "Complete the sentence: Habla como si lo ___ todo (He talks as if he knew everything). Which form fits after como si?",
        "say": "Complete the sentence. Habla como si lo blank todo, meaning he talks as if he knew everything. Which form fits after como si?",
        "widget": {
          "w": "tapPick",
          "prompt": "Habla como si lo ___ todo. (as if he knew everything)",
          "options": [
            {
              "label": "supiera",
              "correct": true
            },
            {
              "label": "sabe"
            },
            {
              "label": "sabra"
            }
          ]
        }
      },
      {
        "kind": "recap",
        "title": "Remember this",
        "body": "Hope, doubt, and the unreal trigger the subjunctive: ojala + present (llueva), como si + imperfect (supiera), no creo que + present perfect (haya llegado). Link ideas with donde, quien, cuyo, and lo que. And watch the flippers: faltar and se agree with the thing, llevar + time + gerund shows duration, acabar de means just did, and por means through a place.",
        "say": "Hope, doubt, and the unreal trigger the subjunctive. Ojala takes the present, como si takes the imperfect, and no creo que takes the present perfect. Link ideas with donde, quien, cuyo, and lo que. And watch the flippers. Faltar and se agree with the thing, llevar plus time plus a gerund shows duration, acabar de means just did, and por means through a place.",
        "takeaway": "Subjunctive for hope and doubt, the right relative pronoun to link ideas, and a few verbs that agree with the thing or flip the sentence around.",
        "emoji": "🇪🇸"
      }
    ]
  },
  {
    "id": "lx.sp3family",
    "skillId": "sp.3.family",
    "subject": "spanish",
    "grade": 3,
    "title": "La Familia y La Casa",
    "subtitle": "People, rooms, and how to describe them in Spanish",
    "steps": [
      {
        "kind": "hook",
        "title": "Welcome home",
        "body": "Imagine giving a tour of your house and introducing your whole family in Spanish. By the end of this lesson you can name your relatives, point to every room, and describe things as big or small.",
        "say": "Imagine giving a tour of your house and introducing your whole family in Spanish. By the end of this lesson you can name your relatives, point to every room, and describe things as big or small.",
        "analogy": "It is like drawing a family tree and a house map, but with Spanish labels on everything."
      },
      {
        "kind": "concept",
        "title": "Your family: la familia",
        "body": "Family words often come in boy and girl pairs: padre (father) and madre (mother), hijo (son) and hija (daughter), hermano (brother) and hermana (sister). Wider relatives include abuelo (grandpa), primo (cousin), and sobrino (nephew, your sibling's child).",
        "say": "Family words often come in boy and girl pairs. Padre is father and madre is mother. Hijo is son and hija is daughter. Hermano is brother and hermana is sister. Wider relatives include abuelo for grandpa, primo for cousin, and sobrino, which is your nephew, meaning your brother or sister's child.",
        "analogy": "Just like a family tree, each word tells you the person and whether they are a boy or a girl.",
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "👩",
              "title": "la madre",
              "body": "mother"
            },
            {
              "emoji": "👧",
              "title": "la hija",
              "body": "daughter"
            },
            {
              "emoji": "👶",
              "title": "el sobrino",
              "body": "nephew (sibling's son)"
            }
          ]
        }
      },
      {
        "kind": "show",
        "title": "Rooms of the house: la casa",
        "body": "Each room has its own name: el comedor (dining room, with the table for eating), la cocina (kitchen, where food is cooked), la sala (living room, with the sofa), el dormitorio (bedroom), el baño (bathroom), and el garaje (garage). Outside is el jardín, the garden or yard with flowers and grass.",
        "say": "Each room has its own name. El comedor is the dining room, with the table for eating. La cocina is the kitchen, where food is cooked. La sala is the living room, with the sofa. El dormitorio is the bedroom. El baño is the bathroom, and el garaje is the garage. Outside is el jardín, the garden or yard with flowers and grass.",
        "analogy": "Think of walking through your house door by door, hanging a Spanish name tag on each one.",
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "🍽️",
              "title": "el comedor",
              "body": "dining room (the table)"
            },
            {
              "emoji": "🛋️",
              "title": "la sala",
              "body": "living room (the sofa)"
            },
            {
              "emoji": "🌷",
              "title": "el jardín",
              "body": "garden / yard"
            }
          ]
        }
      },
      {
        "kind": "example",
        "title": "Objects and describing size",
        "body": "In the kitchen, la nevera is the refrigerator, where you keep milk and cheese cold. To describe things, grande means big and pequeño means small. Spanish uses the verb ser to tell what someone or something is always like.",
        "say": "In the kitchen, la nevera is the refrigerator, where you keep milk and cheese cold. To describe things, grande means big and pequeño means small. Spanish uses the verb ser to tell what someone or something is always like.",
        "reveal": [
          "La nevera means refrigerator, a kitchen object that keeps food cold.",
          "grande = big, pequeño = small (opposites).",
          "Ser tells what things are always like: es for one person, son for more than one.",
          "One person: Mi casa es grande. My house is big.",
          "More than one: Mis padres son altos. My parents are tall. Two people, so use son."
        ]
      },
      {
        "kind": "try",
        "title": "Your turn",
        "body": "The family eats dinner at the big table. Which room are they in?",
        "say": "The family eats dinner at the big table. Which room are they in?",
        "widget": {
          "w": "tapPick",
          "prompt": "The family sits at the big table to eat dinner. Which room is it?",
          "options": [
            {
              "label": "el comedor",
              "correct": true
            },
            {
              "label": "la cocina"
            },
            {
              "label": "el dormitorio"
            }
          ]
        }
      },
      {
        "kind": "recap",
        "title": "You know la familia y la casa",
        "body": "You can now name family members like madre, padre, hija, hermana, abuelo, primo, and sobrino; rooms like comedor, cocina, sala, and jardín; the nevera; and describe things as grande or pequeño using es and son.",
        "say": "You can now name family members like madre, padre, hija, hermana, abuelo, primo, and sobrino. You can name rooms like comedor, cocina, sala, and jardín, plus the nevera. And you can describe things as grande or pequeño using es and son.",
        "takeaway": "Family words come in boy and girl pairs, each room has its own name, and ser (es for one, son for many) describes what people and things are like.",
        "emoji": "🏠"
      }
    ]
  },
  {
    "id": "lx.sp5verbs",
    "skillId": "sp.5.verbs",
    "subject": "spanish",
    "grade": 5,
    "title": "Present-Tense Verbs: Every Person",
    "subtitle": "Change the ending to match who is doing the action",
    "steps": [
      {
        "kind": "hook",
        "title": "Who is doing it?",
        "body": "In Spanish, the end of the verb tells you WHO is acting: I, you, she, we, or they. Change the ending and you change the person, so 'corro' means I run but 'corren' means they run.",
        "say": "In Spanish, the end of the verb tells you who is acting. Change the ending and you change the person. Corro means I run, but corren means they run.",
        "analogy": "The verb ending is like a name tag. Swap the tag and everyone knows who is doing the action."
      },
      {
        "kind": "concept",
        "title": "Meet the subject pronouns",
        "body": "The people words are: yo (I), tú (you, to a friend), usted (you, polite to one adult), nosotros (we), ellos or ellas (they), and ustedes (you all). Use tú with a friend, but usted to show respect to one grown-up.",
        "say": "The people words are: yo means I, too means you to a friend, oosted means you politely to one adult, nosotros means we, ellos or ellas means they, and oostedes means you all. Use too with a friend, but oosted to show respect to one grown-up.",
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "🙋",
              "title": "tú",
              "body": "Informal you, for a friend or kid"
            },
            {
              "emoji": "🎩",
              "title": "usted",
              "body": "Polite you, for one adult"
            },
            {
              "emoji": "👥",
              "title": "ustedes",
              "body": "You all, more than one person"
            }
          ]
        }
      },
      {
        "kind": "concept",
        "title": "Stem plus ending",
        "body": "Every regular verb ends in -ar, -er, or -ir. Drop that ending to get the stem, then snap on a new ending that matches the person. Hablar drops to habl-, comer drops to com-, and vivir drops to viv-.",
        "say": "Every regular verb ends in -ar, -er, or -ir. Drop that ending to get the stem, then add a new ending that matches the person. Ablar drops to abl, comer drops to com, and vivir drops to viv.",
        "analogy": "The stem is the LEGO base. Each person clicks on a different top piece."
      },
      {
        "kind": "show",
        "title": "The three ending families",
        "body": "For -ar verbs the endings are -o, -as, -a, -amos, -an. For -er verbs they are -o, -es, -e, -emos, -en. For -ir verbs they are -o, -es, -e, -imos, -en. Notice -er and -ir share every ending except nosotros (-emos vs -imos).",
        "say": "For ar verbs the endings are: o, as, a, amos, an. For er verbs: o, es, e, emos, en. For ir verbs: o, es, e, imos, en. Er and ir share every ending except the nosotros form, which is emos versus imos.",
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "🅰️",
              "title": "-ar: bailar",
              "body": "yo bailo, ella baila, nosotros bailamos, ellos bailan"
            },
            {
              "emoji": "🅴",
              "title": "-er: correr",
              "body": "yo corro, ella corre, nosotros corremos, ellos corren"
            },
            {
              "emoji": "🅸",
              "title": "-ir: asistir",
              "body": "yo asisto, ella asiste, nosotros asistimos, ellos asisten"
            }
          ]
        }
      },
      {
        "kind": "example",
        "title": "Worked examples: he/she, we, they",
        "body": "Watch how the same stem takes a different ending for each person. Match the pronoun to its ending and the verb falls into place.",
        "say": "Watch how the same stem takes a different ending for each person. Match the pronoun to its ending and the verb falls into place.",
        "reveal": [
          "Ana (ella) with cantar: drop -ar to get cant-, add -a for she, so Ana canta.",
          "Diego (él) with preguntar: drop -ar to get pregunt-, add -a for he, so él pregunta.",
          "Nosotros with aprender: drop -er to get aprend-, add -emos for we, so nosotros aprendemos.",
          "Nosotros with esperar: drop -ar to get esper-, add -amos for we, so nosotros esperamos.",
          "Ellos with sumar: drop -ar to get sum-, add -an for they, so ellos suman.",
          "Ellos with asistir: drop -ir to get asist-, add -en for they, so ellos asisten."
        ]
      },
      {
        "kind": "try",
        "title": "Your turn",
        "body": "How do you say 'we run' using correr? Remember correr is an -er verb, so the nosotros ending is -emos.",
        "say": "How do you say we run using correr? Remember correr is an er verb, so the nosotros ending is emos.",
        "widget": {
          "w": "tapPick",
          "prompt": "Nosotros ___ en el parque. (correr)",
          "options": [
            {
              "label": "corremos",
              "correct": true
            },
            {
              "label": "corren"
            },
            {
              "label": "corro"
            }
          ]
        }
      },
      {
        "kind": "recap",
        "title": "Remember this",
        "body": "Drop -ar, -er, or -ir to find the stem, then add the ending for the person: -a/-e for one other person, -amos/-emos/-imos for we, and -an/-en for they. And use usted to be polite to one adult.",
        "say": "Drop ar, er, or ir to find the stem, then add the ending for the person: a or e for one other person, amos or emos or imos for we, and an or en for they. And use oosted to be polite to one adult.",
        "takeaway": "Match the verb ending to the person: he/she takes -a or -e, we takes -amos/-emos/-imos, and they takes -an or -en.",
        "emoji": "🎯"
      }
    ]
  },
  {
    "id": "lx.sp6routine",
    "skillId": "sp.6.routine",
    "subject": "spanish",
    "grade": 6,
    "title": "Rutinas y Reflexivos",
    "subtitle": "Reflexive verbs and telling time to describe your daily routine",
    "steps": [
      {
        "kind": "hook",
        "title": "Your whole day, in Spanish",
        "body": "You wake up, brush your teeth, and head out the door at a certain time. To narrate a real routine in Spanish you need two tools: reflexive verbs and the clock.",
        "say": "You wake up, brush your teeth, and head out the door at a certain time. To narrate a real routine in Spanish you need two tools: reflexive verbs and the clock."
      },
      {
        "kind": "concept",
        "title": "Reflexive verbs: the action bounces back",
        "body": "In 'Yo me cepillo los dientes' the pronoun 'me' is there because the verb is reflexive: the same person does the action AND receives it. Use me, te, se because the subject acts on himself or herself.",
        "say": "In the sentence Yo me cepillo los dientes, the little word me is there because the verb is reflexive. That means the same person does the action and also receives it. We use me, te, and se because the subject is acting on himself or herself.",
        "analogy": "A reflexive verb is like a boomerang: you throw the action and it comes right back to you.",
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "🙋",
              "title": "me despierto",
              "body": "I wake (myself) up"
            },
            {
              "emoji": "🪥",
              "title": "me cepillo",
              "body": "I brush (my own teeth)"
            },
            {
              "emoji": "🛏️",
              "title": "me acuesto",
              "body": "I go (myself) to bed"
            }
          ]
        }
      },
      {
        "kind": "concept",
        "title": "Body parts take 'the', not 'my'",
        "body": "With a reflexive verb Spanish uses the definite article for body parts, not the possessive: 'me cepillo LOS dientes', never 'mis dientes'. The 'me' already tells us whose teeth they are.",
        "say": "With a reflexive verb, Spanish uses the word for the, not the word for my, in front of a body part. You say me cepillo los dientes, using los, never mis. The word me already tells us the teeth belong to you.",
        "widget": {
          "w": "tapPick",
          "prompt": "Yo me cepillo ___ dientes.",
          "options": [
            {
              "label": "los",
              "correct": true
            },
            {
              "label": "mis"
            },
            {
              "label": "unos"
            }
          ]
        }
      },
      {
        "kind": "show",
        "title": "Telling the hour: es la vs son las",
        "body": "Use 'es la una' for one o'clock because it is singular, but 'son las' for every other hour: son las dos, son las siete. For half past add 'y media' (son las dos y media = 2:30), and 'media' is feminine to match 'la hora'.",
        "say": "For one o'clock you say es la una, because one is singular. For every other hour you say son las, as in son las dos or son las siete. For half past, add y media. So two thirty is son las dos y media, and media is feminine to match la hora.",
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "1️⃣",
              "title": "1:00",
              "body": "Es la una"
            },
            {
              "emoji": "🕕",
              "title": "6:00",
              "body": "Son las seis"
            },
            {
              "emoji": "🕝",
              "title": "2:30",
              "body": "Son las dos y media"
            }
          ]
        }
      },
      {
        "kind": "example",
        "title": "Past the half hour: menos cuarto",
        "body": "Once you pass the half hour, name the NEXT hour and subtract with 'menos'. So 3:45 is fifteen minutes before four: 'son las cuatro menos cuarto'. And to say WHEN something happens, start with the preposition 'a': a las siete.",
        "say": "Once the clock passes the half hour, you name the next hour and subtract with the word menos. So three forty-five is fifteen minutes before four, which is son las cuatro menos cuarto. And to say when something happens, you begin with the little word a, as in a las siete.",
        "reveal": [
          "3:45 is close to 4:00, so name the next hour: las cuatro.",
          "It is 15 minutes short of four, so subtract: menos cuarto.",
          "Put it together: Son las cuatro menos cuarto.",
          "To say an action happens at seven: El entrenamiento empieza a las siete.",
          "With an exact time, add the part of day with 'de la': a las diez de la noche."
        ]
      },
      {
        "kind": "concept",
        "title": "Parts of the day and ordering a routine",
        "body": "Noon is 'mediodía' and midnight is 'medianoche'. Use 'de la mañana/tarde/noche' with an exact hour, but 'por la noche' with no clock time. Sequence words put actions in order: primero, luego, en seguida (right away), plus 'antes de' (before) and 'después de' (after) followed by an infinitive.",
        "say": "Noon is mediodia and midnight is medianoche. Use de la mañana, de la tarde, or de la noche when you give an exact hour, but use por la noche when there is no clock time. Sequence words put actions in order: primero for first, luego for then, and en seguida for right away. You can also use antes de for before and despues de for after, each followed by an infinitive.",
        "analogy": "Think of the real order of your morning: first your eyes open (despertarse), then you get up (levantarse), and after that you eat (desayunar)."
      },
      {
        "kind": "try",
        "title": "Your turn: fix the clock",
        "body": "A friend wants to write 3:45. Which sentence is correct?",
        "say": "A friend wants to write three forty-five. Which sentence is correct?",
        "widget": {
          "w": "tapPick",
          "prompt": "How do you say 3:45?",
          "options": [
            {
              "label": "Son las cuatro menos cuarto",
              "correct": true
            },
            {
              "label": "Son las tres y cuarto"
            },
            {
              "label": "Es la cuatro menos cuarto"
            }
          ]
        }
      },
      {
        "kind": "recap",
        "title": "You can narrate a whole day",
        "body": "Reflexive verbs use me, te, se because the doer receives the action, and body parts take los, not mis. For time, use es la una but son las for other hours, y media for half past, menos cuarto past the half hour, a las to say when, and de la noche with an exact time.",
        "say": "Reflexive verbs use me, te, and se because the doer also receives the action, and body parts take los, not mis. For time, use es la una but son las for other hours, y media for half past, menos cuarto once you pass the half hour, a las to say when something happens, and de la noche with an exact time.",
        "takeaway": "Me, te, se for reflexive actions; es la una but son las for time; y media, menos cuarto, and a las for the clock.",
        "emoji": "⏰"
      }
    ]
  },
  {
    "id": "lx.sp8culture",
    "skillId": "sp.8.culture",
    "subject": "spanish",
    "grade": 8,
    "title": "Cultura y Tradiciones del Mundo Hispano",
    "subtitle": "Currencies, places, music, and festivals across Spanish-speaking countries",
    "steps": [
      {
        "kind": "hook",
        "title": "A world of color and rhythm",
        "body": "From salt flats that turn into mirrors to bulls racing through Spanish streets, the Spanish-speaking world is full of unforgettable places, sounds, and celebrations. Let's tour a few you can recognize.",
        "say": "From salt flats that turn into mirrors to bulls racing through Spanish streets, the Spanish-speaking world is full of unforgettable places, sounds, and celebrations. Let's tour a few you can recognize."
      },
      {
        "kind": "concept",
        "title": "Money across the map",
        "body": "Panama uses the US dollar as its everyday paper money and mints its own coins called the balboa. Guatemala's currency is the quetzal, named after its brilliantly colored national bird that was sacred to the ancient Maya.",
        "say": "Panama uses the US dollar as its everyday paper money and mints its own coins called the balboa. Guatemala's currency is the quetzal, named after its brilliantly colored national bird that was sacred to the ancient Maya.",
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "💵",
              "title": "Panama",
              "body": "US dollar bills plus its own balboa coins."
            },
            {
              "emoji": "🐦",
              "title": "Guatemala",
              "body": "The quetzal, named for the national bird."
            }
          ]
        }
      },
      {
        "kind": "show",
        "title": "Famous places to know",
        "body": "Santiago is the capital of Chile, tucked in a valley between the Andes and the coast. Iguazu Falls is a network of waterfalls on the border of Argentina and Brazil, and the Salar de Uyuni, the world's largest salt flat, sits in Bolivia.",
        "say": "Santiago is the capital of Chile, tucked in a valley between the Andes and the coast. Iguazu Falls is a network of waterfalls on the border of Argentina and Brazil, and the Salar de Uyuni, the world's largest salt flat, sits in Bolivia.",
        "analogy": "Think of these as three postcards: a mountain city, a giant curtain of waterfalls, and a blinding white mirror of salt."
      },
      {
        "kind": "concept",
        "title": "Music you can name by ear",
        "body": "Merengue is the fast, accordion-and-drum national music of the Dominican Republic. Salsa blends Afro-Cuban and Puerto Rican rhythms and grew popular in New York City, while mariachi is the trumpet, violin, and guitar ensemble in charro suits that symbolizes Mexico.",
        "say": "Merengue is the fast, accordion and drum national music of the Dominican Republic. Salsa blends Afro-Cuban and Puerto Rican rhythms and grew popular in New York City, while mariachi is the trumpet, violin, and guitar ensemble in charro suits that symbolizes Mexico.",
        "widget": {
          "w": "sideBySide",
          "cards": [
            {
              "emoji": "🥁",
              "title": "Merengue",
              "body": "Dominican Republic's national dance music."
            },
            {
              "emoji": "🎺",
              "title": "Mariachi",
              "body": "Mexico's charro-suit ensemble."
            }
          ]
        }
      },
      {
        "kind": "example",
        "title": "Two big festivals",
        "body": "Inti Raymi, the Quechua Festival of the Sun, is held each June in Cusco, Peru to honor the Inca sun god Inti. San Fermin, in Pamplona, Spain, is the July festival famous for the running of the bulls.",
        "say": "Inti Raymi, the Quechua Festival of the Sun, is held each June in Cusco, Peru to honor the Inca sun god Inti. San Fermin, in Pamplona, Spain, is the July festival famous for the running of the bulls.",
        "reveal": [
          "Inti Raymi: Peru, Cusco, sun god Inti, June ceremony.",
          "San Fermin: Spain, Pamplona, running of the bulls, July.",
          "Tip: match each festival to its country and its signature event."
        ]
      },
      {
        "kind": "try",
        "title": "Your turn",
        "body": "A band in charro suits plays trumpets, violins, and guitars at a Mexican restaurant. Which music are they playing?",
        "say": "A band in charro suits plays trumpets, violins, and guitars at a Mexican restaurant. Which music are they playing?",
        "widget": {
          "w": "tapPick",
          "prompt": "Pick the Mexican ensemble:",
          "options": [
            {
              "label": "Mariachi",
              "correct": true
            },
            {
              "label": "Merengue"
            },
            {
              "label": "Tango"
            }
          ]
        }
      },
      {
        "kind": "recap",
        "title": "Remember this",
        "body": "Currencies: Panama uses US dollars plus balboa coins; Guatemala uses the quetzal. Places: Santiago is Chile's capital, Iguazu Falls sits between Argentina and Brazil, and the Salar de Uyuni is in Bolivia. Music: merengue is Dominican, salsa is Cuban-Puerto Rican, mariachi is Mexican. Festivals: Inti Raymi is in Peru, San Fermin in Spain.",
        "say": "Currencies: Panama uses US dollars plus balboa coins; Guatemala uses the quetzal. Places: Santiago is Chile's capital, Iguazu Falls sits between Argentina and Brazil, and the Salar de Uyuni is in Bolivia. Music: merengue is Dominican, salsa is Cuban and Puerto Rican, mariachi is Mexican. Festivals: Inti Raymi is in Peru, San Fermin in Spain.",
        "takeaway": "Tie each currency, place, music genre, and festival to its home country.",
        "emoji": "🌎"
      }
    ]
  }
];

  let patched = 0, added = 0;
  // Inject dedicated lessons first (so an aliased skill gains its own direct lesson).
  for (const les of NEW_LESSONS) {
    const list = L[les.subject];
    if (!list) continue;
    if (list.some(l => l && l.skillId === les.skillId)) continue; // a real lesson already exists — don't duplicate
    list.push(les);
    bySkill[les.skillId] = les;
    added++;
  }
  // Insert extra beats before each lesson's closing recap. If a skill has no direct
  // lesson of its own (it borrows one via alias), extend the lesson it actually uses
  // so the beat still reaches the learner.
  const subjOf = sid => sid.startsWith('sp.') ? 'spanish' : sid[0] === 'm' ? 'math' : sid[0] === 'e' ? 'english' : 'science';
  for (const sid of Object.keys(PATCH)) {
    let les = bySkill[sid];
    if (!les && window.BP && window.BP.lessonForSkill) les = window.BP.lessonForSkill(subjOf(sid), sid);
    const steps = PATCH[sid];
    if (!les || !Array.isArray(les.steps) || !steps || !steps.length) continue;
    const marker = steps[0].title;
    if (marker && les.steps.some(s => s && s.title === marker)) continue; // already applied
    let idx = les.steps.length;
    for (let i = les.steps.length - 1; i >= 0; i--) { if (les.steps[i] && les.steps[i].kind === 'recap') { idx = i; break; } }
    les.steps.splice(idx, 0, ...steps);
    patched++;
  }
  try { window.GALLOP_PATCHED = patched; window.GALLOP_NEWLESSONS = added; } catch (e) {}
})();

/* Gallop Career Explorer — a browsable window onto real careers, what they actually entail,
   real people who do the work, the surprising jobs inside each field, and the many different PATHS in
   (college, trade school, apprenticeship, military, self-taught). Built so a curious or undecided kid
   discovers options they never knew existed. `sig` = subject weights used to match a field to a
   child's demonstrated strengths. People links go to Wikipedia (factual, ad-free); some show a bio only. */
window.GALLOP_CAREERS = [
  {
    "id": "engineering",
    "title": "Engineering",
    "emoji": "⚙️",
    "color": "#4a5bb0",
    "sig": {
      "math": 1,
      "science": 0.8
    },
    "tagline": "Design and build the things that make the world work.",
    "whatItIs": "Engineers are problem-solvers who use math and science to design, build, and improve almost everything around you — bridges and phones, rockets and robots, clean-water systems and video games.",
    "dayToDay": "A day might mean sketching a design, building a model or prototype, running tests to see what breaks, fixing it, and working in a team to turn an idea into something real and safe. Lots of drawing, calculating, testing, and teamwork.",
    "jobs": [
      "Mechanical engineer (machines & engines)",
      "Civil engineer (bridges, roads, buildings)",
      "Aerospace engineer (planes & rockets)",
      "Electrical engineer (circuits & power)",
      "Robotics engineer",
      "Biomedical engineer (medical devices)",
      "Environmental engineer (clean water & air)"
    ],
    "hs": "Physics, calculus, and a robotics or coding elective — and build things! Enter a science or engineering fair.",
    "people": [
      {
        "name": "Katherine Johnson",
        "who": "A NASA mathematician whose brilliant hand calculations helped send American astronauts safely into space and to the Moon. Astronaut John Glenn trusted her so much that before his historic orbit he asked her to double-check the computer’s numbers by hand. Her story was later told in the film “Hidden Figures.”",
        "wiki": "Katherine_Johnson"
      },
      {
        "name": "Mae Jemison",
        "who": "An engineer and medical doctor who in 1992 became the first African American woman to travel into space, aboard the shuttle Endeavour. Before NASA she served as a Peace Corps doctor in West Africa. She loves both science and the arts, and believes they belong together.",
        "wiki": "Mae_Jemison"
      },
      {
        "name": "Emily Warren Roebling",
        "who": "She taught herself advanced engineering — math, materials, and cable science — when her husband, the bridge’s chief engineer, fell too ill to leave home. For years she ran the day-to-day building of the Brooklyn Bridge and carried plans between him and the workers. When it opened in 1883, she was among the first to cross it.",
        "wiki": "Emily_Warren_Roebling"
      },
      {
        "name": "Limor Fried",
        "who": "An MIT-trained electrical engineer who founded Adafruit, a company that makes friendly do-it-yourself electronics kits so anyone can build lights, gadgets, and robots. She built the business around teaching, with free online tutorials and videos. She was the first female engineer featured on the cover of Wired magazine.",
        "wiki": "Limor_Fried"
      }
    ],
    "traits": [
      "You love figuring out how things work and taking them apart",
      "You enjoy building, fixing, or improving stuff",
      "Math and science feel like tools, not chores"
    ],
    "surprising": [
      "Roller-coaster engineer (designs the thrills — and the safety)",
      "Sound engineer for concerts and films",
      "Biomedical engineer who designs artificial limbs",
      "Water engineer who brings clean water to whole cities"
    ],
    "paths": [
      "4-year engineering degree — the most common route",
      "Start as an engineering technician with a 2-year degree, then move up",
      "Military — learn engineering skills and often earn college paid for",
      "Apprenticeship or co-op: get paid to learn on real projects while in school"
    ],
    "related": [
      "cs_ai",
      "architecture",
      "aviation_space"
    ]
  },
  {
    "id": "architecture",
    "title": "Architecture & Design",
    "emoji": "📐",
    "color": "#2f7a8a",
    "sig": {
      "math": 0.8,
      "science": 0.4,
      "english": 0.3
    },
    "tagline": "Turn empty space into places people love.",
    "whatItIs": "Architects design buildings and spaces — homes, schools, museums, parks, whole neighborhoods — so they are safe, useful, and beautiful. It blends art, math, and science.",
    "dayToDay": "Meet the people who will use a space, sketch ideas, build 3D models on the computer, and solve puzzles about light, materials, and how people move through a room — then work with engineers and builders to make it real.",
    "jobs": [
      "Architect",
      "Urban planner (designs cities & neighborhoods)",
      "Landscape architect (parks & outdoor spaces)",
      "Interior designer",
      "Structural engineer",
      "Historic preservationist"
    ],
    "hs": "Geometry, physics, and an art or drafting/CAD elective. Sketch buildings you love and figure out why they work.",
    "people": [
      {
        "name": "Maya Lin",
        "who": "While still a 21-year-old college student, she entered a national contest and won it with her design for the Vietnam Veterans Memorial in Washington, D.C. Its quiet black granite wall, carved with names, is now visited by millions. She has spent her career making art and buildings that connect people with nature and history.",
        "wiki": "Maya_Lin"
      },
      {
        "name": "Zaha Hadid",
        "who": "An Iraqi-British architect known for bold, curving buildings that look frozen in motion. In 2004 she became the first woman ever to win the Pritzker Prize, architecture’s highest honor. Her designs include museums, stadiums, and opera houses all over the world.",
        "wiki": "Zaha_Hadid"
      },
      {
        "name": "Jeanne Gang",
        "who": "An American architect famous for Chicago’s rippling Aqua Tower, one of the tallest buildings ever designed by a woman. She designs spaces that bring communities together and are gentler on the environment. Her firm, Studio Gang, works on everything from boathouses to skyscrapers.",
        "wiki": "Jeanne_Gang"
      },
      {
        "name": "Bjarke Ingels",
        "who": "A Danish architect who designs playful, surprising buildings — including a power plant in Copenhagen with a real public ski slope on its roof. He believes buildings can be both practical and fun. His firm’s work ranges from homes and museums to ideas for living on Mars.",
        "wiki": "Bjarke_Ingels"
      }
    ],
    "traits": [
      "You sketch buildings, rooms, or maps for fun",
      "You notice how spaces make you feel",
      "You like blending art with math"
    ],
    "surprising": [
      "Theme-park designer (imagineer)",
      "Lighting designer who sets the mood of a space",
      "Set designer for movies and theater",
      "Accessibility designer who makes places work for everyone"
    ],
    "paths": [
      "Architecture degree (usually 5 years) + a licensing exam",
      "Start as a drafter/CAD technician with a 2-year degree",
      "Interior design or landscape programs — related, often shorter paths",
      "Build a portfolio and intern at a design firm to learn the craft"
    ],
    "related": [
      "engineering",
      "arts",
      "trades"
    ]
  },
  {
    "id": "cs_ai",
    "title": "Computer Science & AI",
    "emoji": "💻",
    "color": "#3a6fc2",
    "sig": {
      "math": 1,
      "science": 0.5
    },
    "tagline": "Write the instructions that power apps, games, and AI.",
    "whatItIs": "Computer scientists tell computers what to do by writing code. They build the apps, games, websites, and the artificial intelligence behind tools you use every day.",
    "dayToDay": "Break a big problem into small steps, write code, hunt down and fix bugs, and test until it works. Lots of logic puzzles, creativity, teamwork — and the thrill of making something from nothing.",
    "jobs": [
      "Software engineer (builds apps & websites)",
      "Game developer",
      "Data scientist (finds patterns in data)",
      "AI / machine-learning researcher",
      "Cybersecurity analyst (stops hackers)",
      "Robotics programmer"
    ],
    "hs": "AP Computer Science, statistics, and a personal coding project or game you build yourself.",
    "people": [
      {
        "name": "Ada Lovelace",
        "who": "A 19th-century mathematician who worked with inventor Charles Babbage on his design for a mechanical computer. She wrote what many consider the world’s first computer program, and imagined that such machines might one day even make music. She did all this a full century before modern computers existed.",
        "wiki": "Ada_Lovelace"
      },
      {
        "name": "Grace Hopper",
        "who": "A U.S. Navy rear admiral and computer pioneer who helped create one of the first easy-to-read programming languages, leading to COBOL. She believed computers should understand words, not just numbers. She also helped popularize the word “bug” for a glitch, after a real moth was found stuck in a machine.",
        "wiki": "Grace_Hopper"
      },
      {
        "name": "Margaret Hamilton",
        "who": "She led the MIT team that wrote the flight software for NASA’s Apollo missions, including Apollo 11’s landing on the Moon. Her careful design let the computer keep working even when it was overloaded during the descent. She helped invent the very idea of “software engineering.”",
        "wiki": "Margaret_Hamilton_(software_engineer)"
      },
      {
        "name": "Fei-Fei Li",
        "who": "A computer scientist who helped teach computers to “see” by building ImageNet, a huge collection of labeled pictures that jump-started modern AI. She is a professor at Stanford and champions using AI to help people. She also founded a group to welcome more kinds of people into the field.",
        "wiki": "Fei-Fei_Li"
      }
    ],
    "traits": [
      "You like solving puzzles and logic games",
      "You wonder how apps, games, and AI actually work",
      "You enjoy building things you can share instantly"
    ],
    "surprising": [
      "Game AI designer (makes characters feel smart)",
      "Ethical hacker who gets paid to break into systems and report the holes",
      "Prompt engineer working with AI models",
      "Robotics programmer for factories, farms, or hospitals"
    ],
    "paths": [
      "Computer science degree — the classic route",
      "Coding bootcamp (a few months) then build a portfolio",
      "Fully self-taught — many great coders learned online and shipped projects",
      "Certifications in cloud, security, or data to specialize fast"
    ],
    "related": [
      "engineering",
      "media_entertainment",
      "finance"
    ]
  },
  {
    "id": "medicine",
    "title": "Medicine & Health",
    "emoji": "🩺",
    "color": "#c0556f",
    "sig": {
      "science": 1,
      "english": 0.5
    },
    "tagline": "Help people feel better and live healthier lives.",
    "whatItIs": "People in medicine keep bodies healthy and step in when something goes wrong — from doctors and nurses to researchers who invent new cures.",
    "dayToDay": "Listen to patients, figure out what is wrong like a detective, explain it clearly, and treat it. It takes science smarts, steady hands, and a big heart.",
    "jobs": [
      "Doctor / physician",
      "Nurse",
      "Surgeon",
      "Pediatrician (kids’ doctor)",
      "Physical therapist",
      "Paramedic / EMT",
      "Medical researcher",
      "Pharmacist"
    ],
    "hs": "Biology, chemistry, and volunteering at a clinic or hospital to see the work up close.",
    "people": [
      {
        "name": "Elizabeth Blackwell",
        "who": "In 1849 she became the first woman to earn a medical degree in the United States — after school after school had rejected her. She went on to open a hospital run by women and to train other female doctors. She opened the door for women in medicine everywhere.",
        "wiki": "Elizabeth_Blackwell"
      },
      {
        "name": "Jonas Salk",
        "who": "He developed the first safe, effective polio vaccine in the 1950s, when the disease was paralyzing thousands of children every year. He chose not to patent it so it could reach as many people as possible, giving up a fortune. Thanks partly to his work, polio has nearly vanished from the world.",
        "wiki": "Jonas_Salk"
      },
      {
        "name": "Mona Hanna-Attisha",
        "who": "A pediatrician in Flint, Michigan whose research proved the city’s water was poisoning children with lead. When officials doubted her, she went public with her data until they were forced to act. Her courage helped protect thousands of kids.",
        "wiki": "Mona_Hanna-Attisha"
      },
      {
        "name": "Paul Farmer",
        "who": "A doctor and anthropologist who believed everyone — no matter how poor — deserves excellent medical care. He co-founded Partners In Health and spent his life building hospitals and treating disease in Haiti, Rwanda, and beyond. He trained local doctors so the care would last long after he left.",
        "wiki": "Paul_Farmer"
      }
    ],
    "traits": [
      "You want to help people and aren’t squeamish",
      "You like biology and figuring out what’s wrong",
      "You stay calm and caring under pressure"
    ],
    "surprising": [
      "Genetic counselor who helps families understand DNA",
      "Medical illustrator (art + science)",
      "Prosthetist who builds custom limbs",
      "Epidemiologist — a \"disease detective\" who tracks outbreaks"
    ],
    "paths": [
      "Doctor: college → medical school → residency (a long but clear road)",
      "Nurse: 2- or 4-year degree, then licensing — huge demand",
      "Paramedic/EMT, dental hygienist, or radiology tech: shorter, hands-on paths",
      "Medical research: science degrees for those who love discovery over the clinic"
    ],
    "related": [
      "science",
      "sports_health",
      "social_impact"
    ]
  },
  {
    "id": "science",
    "title": "Science & Research",
    "emoji": "🔬",
    "color": "#3f8f6a",
    "sig": {
      "science": 1,
      "math": 0.6
    },
    "tagline": "Ask “why?” and discover how the world really works.",
    "whatItIs": "Scientists investigate everything from tiny atoms to giant galaxies. They ask questions, run experiments, and uncover new knowledge that changes the world.",
    "dayToDay": "Come up with a question, design an experiment to test it, measure carefully, and figure out what the results mean — then share it so others can build on it.",
    "jobs": [
      "Biologist",
      "Chemist",
      "Physicist",
      "Astronomer",
      "Geologist",
      "Marine biologist",
      "Lab researcher"
    ],
    "hs": "Lab sciences, statistics, and a science-fair research project of your own.",
    "people": [
      {
        "name": "Marie Curie",
        "who": "A physicist and chemist who discovered the elements polonium and radium and pioneered the study of radioactivity, a word she coined. She was the first person ever to win two Nobel Prizes, in physics and in chemistry. She often worked in a cold shed, and her notebooks are still radioactive today.",
        "wiki": "Marie_Curie"
      },
      {
        "name": "Jane Goodall",
        "who": "As a young researcher she lived among wild chimpanzees in Tanzania and discovered they make and use tools — changing how the world sees animals. She showed that patience and careful watching could reveal secrets no one had noticed. Today she travels the world inspiring young people to protect nature.",
        "wiki": "Jane_Goodall"
      },
      {
        "name": "Katalin Karikó",
        "who": "A Hungarian-born scientist who spent decades studying mRNA even when few believed in it and her funding was cut. Her stubborn work became the foundation of the mRNA COVID-19 vaccines that protected billions of people. In 2023 she was awarded the Nobel Prize.",
        "wiki": "Katalin_Karikó"
      },
      {
        "name": "Vera Rubin",
        "who": "An astronomer who measured how galaxies spin and found they were turning far too fast to hold together with only the matter we can see. Her work gave the first strong evidence for invisible “dark matter,” which makes up most of the universe. She was also a lifelong champion for women in science.",
        "wiki": "Vera_Rubin"
      }
    ],
    "traits": [
      "You ask \"why?\" and \"what if?\" constantly",
      "You like experiments, data, and being proven right by evidence",
      "You’re patient enough to try again when something fails"
    ],
    "surprising": [
      "Volcanologist who studies live volcanoes",
      "Forensic scientist solving crimes with evidence",
      "Astrobiologist searching for life beyond Earth",
      "Materials scientist inventing new substances"
    ],
    "paths": [
      "Science degree → lab or field work; research often means grad school",
      "Lab technician roles with a 2- or 4-year degree",
      "Citizen science and science fairs — start discovering now, no degree needed",
      "Science communication: turn discoveries into stories for the public"
    ],
    "related": [
      "medicine",
      "environment",
      "engineering"
    ]
  },
  {
    "id": "environment",
    "title": "Environmental Science",
    "emoji": "🌱",
    "color": "#5a9a3c",
    "sig": {
      "science": 1,
      "math": 0.5
    },
    "tagline": "Protect the planet with science.",
    "whatItIs": "Environmental scientists study nature — oceans, forests, air, climate — and find ways to keep it healthy for people, animals, and future generations.",
    "dayToDay": "Collect samples outdoors, measure and analyze data, and design solutions to problems like pollution, plastic, and a changing climate. Part detective, part inventor, part explorer.",
    "jobs": [
      "Environmental scientist",
      "Marine biologist",
      "Conservationist / park ranger",
      "Climate scientist",
      "Renewable-energy engineer",
      "Wildlife biologist"
    ],
    "hs": "Environmental science, chemistry, and a local cleanup or sustainability project.",
    "people": [
      {
        "name": "Wangari Maathai",
        "who": "A Kenyan scientist who founded the Green Belt Movement, encouraging communities — especially women — to plant tens of millions of trees. The trees restored the soil, provided firewood, and gave people work. In 2004 she became the first African woman to win the Nobel Peace Prize.",
        "wiki": "Wangari_Maathai"
      },
      {
        "name": "Sylvia Earle",
        "who": "An oceanographer nicknamed “Her Deepness” who has spent thousands of hours exploring the sea, once walking the ocean floor deeper than anyone before her. She has led dozens of expeditions and helped design underwater vehicles. Today she fights to protect special ocean areas she calls “Hope Spots.”",
        "wiki": "Sylvia_Earle"
      },
      {
        "name": "Boyan Slat",
        "who": "Frustrated by all the plastic he saw while diving as a teenager, he founded The Ocean Cleanup at just 18. His organization builds systems that capture plastic from rivers before it reaches the sea, and from ocean garbage patches. He shows that young people can take on enormous problems.",
        "wiki": "Boyan_Slat"
      },
      {
        "name": "Rachel Carson",
        "who": "A marine biologist and gifted writer whose 1962 book “Silent Spring” revealed how certain pesticides were harming birds and the environment. Her careful science and clear writing helped launch the modern environmental movement and led to new laws. She proved that words can change the world.",
        "wiki": "Rachel_Carson"
      }
    ],
    "traits": [
      "You love being outdoors and care about the planet",
      "You like science with a real-world mission",
      "You want your work to leave things better"
    ],
    "surprising": [
      "Storm chaser / atmospheric scientist",
      "Coral-reef restorer",
      "Green-energy engineer building wind and solar farms",
      "Wildlife tracker who studies animals in the wild"
    ],
    "paths": [
      "Environmental science degree → field or lab work",
      "Park ranger and conservation tech roles — often 2-year or on-the-job",
      "Renewable-energy trades (solar/wind technician) — fast-growing, hands-on",
      "Volunteer with conservation groups to build experience early"
    ],
    "related": [
      "science",
      "agriculture",
      "engineering"
    ]
  },
  {
    "id": "finance",
    "title": "Finance & Business",
    "emoji": "📈",
    "color": "#2f8a52",
    "sig": {
      "math": 1,
      "english": 0.4
    },
    "tagline": "Understand money and help it grow.",
    "whatItIs": "People in finance help individuals, families, and companies make smart decisions about money — saving, investing, budgeting, and growing wealth.",
    "dayToDay": "Analyze numbers, spot trends, weigh risks, and advise people on how to use their money wisely. Perfect for anyone who loves numbers and figuring out how things really work.",
    "jobs": [
      "Financial analyst",
      "Accountant",
      "Investor / portfolio manager",
      "Economist",
      "Financial advisor",
      "Actuary (measures risk)"
    ],
    "hs": "Economics, statistics, and a school investing or business club. (Stable Street in Gallop is a head start!)",
    "people": [
      {
        "name": "Warren Buffett",
        "who": "One of history’s most successful investors, he built his fortune through patience — buying good companies and holding them for decades. Famous for living simply in a house he bought long ago, he has pledged to give away almost all of his wealth. People call him the “Oracle of Omaha.”",
        "wiki": "Warren_Buffett"
      },
      {
        "name": "Mellody Hobson",
        "who": "She grew up with very little money and learned early to ask smart questions about it. She rose to become co-CEO of a major investment firm and now teaches families to be “financially fluent.” She has also chaired the boards of well-known companies.",
        "wiki": "Mellody_Hobson"
      },
      {
        "name": "John C. Bogle",
        "who": "He invented the first index fund for everyday people — a simple, low-cost way to invest in the whole stock market at once. Many experts said it would never work, but it became one of the most powerful tools for ordinary savers. He founded Vanguard and spent his life fighting to keep investing fair and cheap.",
        "wiki": "John_C._Bogle"
      },
      {
        "name": "Ngozi Okonjo-Iweala",
        "who": "A Nigerian economist who twice served as her country’s finance minister, working to fight corruption and manage its money wisely. In 2021 she became the first woman and first African to lead the World Trade Organization. She trained as an economist at Harvard and MIT.",
        "wiki": "Ngozi_Okonjo-Iweala"
      }
    ],
    "traits": [
      "You like numbers and spotting patterns",
      "You’re curious how money and businesses really work",
      "You enjoy making a plan and playing the long game"
    ],
    "surprising": [
      "Actuary who calculates the odds of almost anything",
      "Forensic accountant who follows the money to catch fraud",
      "Sports team financial analyst",
      "Sustainability analyst who scores companies on doing good"
    ],
    "paths": [
      "Finance, economics, or accounting degree",
      "Certifications (like CPA or CFA) to specialize and earn more",
      "Start in a bank or firm and learn on the job",
      "Run a small business or invest early to learn by doing (try Stable Street!)"
    ],
    "related": [
      "entrepreneur",
      "cs_ai",
      "law"
    ]
  },
  {
    "id": "entrepreneur",
    "title": "Entrepreneurship",
    "emoji": "🚀",
    "color": "#d2761f",
    "sig": {
      "math": 0.7,
      "english": 0.7
    },
    "tagline": "Turn an idea into a business.",
    "whatItIs": "Entrepreneurs spot a problem and build something new to solve it — a product, a service, a whole company. They blend numbers (pricing, budgets) with words (pitching, selling).",
    "dayToDay": "Dream up ideas, test them, talk to customers, handle money, lead a team, and keep going after setbacks. The lemonade and market games in Gallop are literally practice for this.",
    "jobs": [
      "Founder / startup owner",
      "Small-business owner",
      "Product manager",
      "Inventor",
      "Social entrepreneur (business for good)"
    ],
    "hs": "Business, public speaking, and starting a small side venture of your own.",
    "people": [
      {
        "name": "Sara Blakely",
        "who": "With five thousand dollars in savings and an idea to improve women’s clothing, she started Spanx from her apartment, doing almost everything herself at first. She grew it into a wildly successful company and became one of the youngest self-made female billionaires. She credits her father for teaching her that failing is just part of trying.",
        "wiki": "Sara_Blakely"
      },
      {
        "name": "Tristan Walker",
        "who": "He grew up in Queens, New York, and noticed that big companies ignored the grooming needs of people with coarse or curly hair. He founded Walker & Company to make products for customers others overlooked. He also mentors young people from backgrounds like his own.",
        "wiki": "Tristan_Walker_(entrepreneur)"
      },
      {
        "name": "Jessica O. Matthews",
        "who": "An inventor who created the SOCCKET, a soccer ball that stores energy as kids kick it around so it can later power a lamp. She founded a company, Uncharted, that turns everyday motion into electricity for communities. She holds several patents and degrees from Harvard.",
        "wiki": "Jessica_O._Matthews"
      },
      {
        "name": "Hamdi Ulukaya",
        "who": "He came to the United States from Turkey with little money and an idea for better yogurt. He bought an old factory and built Chobani into one of America’s top yogurt brands. He is known for hiring refugees and for sharing company ownership with his employees.",
        "wiki": "Hamdi_Ulukaya"
      }
    ],
    "traits": [
      "You come up with ideas and want to build them",
      "You don’t mind risk, and you bounce back from \"no\"",
      "You like leading and making things happen"
    ],
    "surprising": [
      "Social entrepreneur (a business built to fix a problem)",
      "Franchise owner running local branches of a big brand",
      "Creator-founder who turns a following into a business",
      "Maker who sells inventions or crafts online"
    ],
    "paths": [
      "Just start — a side hustle, stand, or online shop teaches the most",
      "Business degree for the tools; not required to found a company",
      "Join a startup first to learn how one is built, then start your own",
      "Find a mentor and pitch at youth business competitions"
    ],
    "related": [
      "finance",
      "media_entertainment",
      "trades"
    ]
  },
  {
    "id": "law",
    "title": "Law & Public Service",
    "emoji": "⚖️",
    "color": "#6a5bb0",
    "sig": {
      "english": 1,
      "science": 0.3
    },
    "tagline": "Stand up for what’s fair.",
    "whatItIs": "Lawyers, judges, and advocates use careful reading, clear argument, and reasoning to solve disputes, protect rights, and make sure rules are fair.",
    "dayToDay": "Read closely, research, build an argument backed by evidence, and speak or write persuasively. A career for people who love reading, debating, and standing up for others.",
    "jobs": [
      "Lawyer / attorney",
      "Judge",
      "Public defender",
      "Civil-rights advocate",
      "Prosecutor",
      "Policy maker",
      "Mediator"
    ],
    "hs": "Debate, government, and rigorous reading & writing courses.",
    "people": [
      {
        "name": "Thurgood Marshall",
        "who": "As a lawyer he argued and won Brown v. Board of Education, the case that ended legal school segregation in America. He won many cases before the Supreme Court fighting for equal rights. In 1967 he became the first African American Supreme Court justice.",
        "wiki": "Thurgood_Marshall"
      },
      {
        "name": "Sonia Sotomayor",
        "who": "She grew up in a Bronx housing project and, through hard work and a love of books, earned her way to Princeton and Yale. She became a federal judge and, in 2009, the first Latina justice on the U.S. Supreme Court. She often talks to kids about believing in themselves.",
        "wiki": "Sonia_Sotomayor"
      },
      {
        "name": "Bryan Stevenson",
        "who": "A lawyer who founded the Equal Justice Initiative to defend people who were wrongly convicted, treated unfairly, or too poor to get good help. He has rescued many people from unjust punishments and argued before the Supreme Court. His book “Just Mercy” tells some of their stories.",
        "wiki": "Bryan_Stevenson"
      },
      {
        "name": "Constance Baker Motley",
        "who": "A brilliant civil-rights lawyer who helped prepare Brown v. Board of Education and personally argued — and won — landmark cases before the Supreme Court. In 1966 she became the first Black woman to serve as a U.S. federal judge. She helped students integrate universities across the South.",
        "wiki": "Constance_Baker_Motley"
      }
    ],
    "traits": [
      "You love reading, debating, and arguing your case",
      "You have a strong sense of fair and unfair",
      "You can stay logical when a topic gets heated"
    ],
    "surprising": [
      "Sports or entertainment lawyer for athletes and artists",
      "Environmental lawyer protecting land and rivers",
      "Intellectual-property lawyer defending inventions and art",
      "Mediator who settles fights without a courtroom"
    ],
    "paths": [
      "Lawyer: college → law school → bar exam",
      "Paralegal: a 2-year path into legal work, sooner and with less debt",
      "Public service and policy roles for those who want to change the rules",
      "Debate, mock trial, and student government to start building the skills now"
    ],
    "related": [
      "global",
      "social_impact",
      "writing"
    ]
  },
  {
    "id": "writing",
    "title": "Writing & Media",
    "emoji": "✍️",
    "color": "#b8683f",
    "sig": {
      "english": 1
    },
    "tagline": "Tell stories and shape ideas with words.",
    "whatItIs": "Writers create the books, movies, games, articles, and posts that inform and entertain the world. Storytelling is one of the most durable human skills there is.",
    "dayToDay": "Imagine, research, draft, and revise — again and again — until the words do exactly what you want. Writers work in books, film, journalism, marketing, and games.",
    "jobs": [
      "Author / novelist",
      "Journalist",
      "Screenwriter",
      "Poet",
      "Copywriter (ads)",
      "Editor",
      "Game writer"
    ],
    "hs": "Creative writing, journalism (join the school paper), and reading widely across genres.",
    "people": [
      {
        "name": "Rick Riordan",
        "who": "A former middle-school teacher who created the Percy Jackson series after inventing Greek-myth bedtime stories for his son. His books turned ancient myths into thrilling modern adventures and got millions of reluctant readers to love books. He now helps other authors share mythologies from their own cultures.",
        "wiki": "Rick_Riordan"
      },
      {
        "name": "Jason Reynolds",
        "who": "As a kid he didn’t enjoy reading and didn’t finish a whole novel until he was seventeen. He grew up to become an award-winning author whose honest, fast-moving books speak straight to young people. He even served as the National Ambassador for Young People’s Literature.",
        "wiki": "Jason_Reynolds"
      },
      {
        "name": "Kwame Alexander",
        "who": "A poet and author who won the Newbery Medal for “The Crossover,” a novel written entirely in verse about two basketball-playing brothers. He travels the world running writing workshops and cheering kids on. He believes poetry can reach readers who think they don’t like to read.",
        "wiki": "Kwame_Alexander"
      },
      {
        "name": "Maya Angelou",
        "who": "A poet, author, and performer whose memoir “I Know Why the Caged Bird Sings” shared her childhood and moved millions. She wrote powerful poems about courage and dignity, and once recited one at a U.S. presidential inauguration. She lived many lives — dancer, singer, activist — before becoming one of America’s most beloved writers.",
        "wiki": "Maya_Angelou"
      }
    ],
    "traits": [
      "You love telling stories or explaining ideas",
      "Words come easily, or you enjoy making them better",
      "You notice how a good line can change how people feel"
    ],
    "surprising": [
      "Video-game narrative writer",
      "Speechwriter for leaders",
      "Technical writer who makes complex things clear (well-paid!)",
      "UX writer who crafts the words inside apps"
    ],
    "paths": [
      "English, journalism, or communications degree",
      "Build a portfolio or blog — proof of work beats a diploma here",
      "Start on the school paper, a zine, or online and grow an audience",
      "Freelance to gain range across ads, articles, scripts, and books"
    ],
    "related": [
      "media_entertainment",
      "arts",
      "law"
    ]
  },
  {
    "id": "education",
    "title": "Education & Psychology",
    "emoji": "🎓",
    "color": "#4a7fbf",
    "sig": {
      "english": 0.8,
      "science": 0.5
    },
    "tagline": "Help others learn and grow.",
    "whatItIs": "Teachers, counselors, and psychologists help people learn, understand themselves, and reach their potential. Explaining ideas and understanding people are their superpowers.",
    "dayToDay": "Explain tricky ideas simply, encourage people, listen carefully, and figure out how minds and behavior work. Deeply rewarding for anyone who loves helping others.",
    "jobs": [
      "Teacher",
      "School counselor",
      "Psychologist",
      "Speech therapist",
      "Professor",
      "Coach / mentor",
      "Special-education specialist"
    ],
    "hs": "Psychology, writing, and tutoring or mentoring younger kids.",
    "people": [
      {
        "name": "Fred Rogers",
        "who": "The gentle host of “Mister Rogers’ Neighborhood,” who spent more than thirty years telling children they are valued and loved just as they are. A trained minister and musician, he wrote the songs and voiced the puppets himself. He once spoke to the U.S. Senate and helped save funding for public television.",
        "wiki": "Fred_Rogers"
      },
      {
        "name": "Maria Montessori",
        "who": "One of Italy’s first female doctors, she created a hands-on way of teaching that lets children explore and learn at their own pace. Schools using her ideas — Montessori schools — now exist all over the world. She believed children learn best by doing.",
        "wiki": "Maria_Montessori"
      },
      {
        "name": "Temple Grandin",
        "who": "A scientist and author with autism who became one of the world’s leading experts on animal behavior, designing gentler systems used across the livestock industry. She thinks in pictures and teaches the world that minds which work differently are a gift. Her life story became an award-winning film.",
        "wiki": "Temple_Grandin"
      },
      {
        "name": "Angela Duckworth",
        "who": "A psychologist and former teacher who studies “grit” — the mix of passion and perseverance that helps people reach long-term goals. She found that sticking with things can matter as much as talent. Her research and book have changed how schools think about success.",
        "wiki": "Angela_Duckworth"
      }
    ],
    "traits": [
      "You love explaining things and helping others \"get it\"",
      "You’re patient and encouraging",
      "You’re curious about how minds and feelings work"
    ],
    "surprising": [
      "Educational game designer",
      "Museum educator who makes exhibits come alive",
      "Corporate trainer teaching adults new skills",
      "School psychologist who supports how kids learn and feel"
    ],
    "paths": [
      "Teaching degree + a license to teach in schools",
      "Psychology degree → counseling or therapy (often grad school)",
      "Coaching, tutoring, and mentoring — start helping others now",
      "Instructional design for online courses and companies"
    ],
    "related": [
      "social_impact",
      "writing",
      "medicine"
    ]
  },
  {
    "id": "global",
    "title": "Global & Diplomacy",
    "emoji": "🌍",
    "color": "#c78a2a",
    "sig": {
      "spanish": 1,
      "english": 0.7
    },
    "tagline": "Connect people across languages and cultures.",
    "whatItIs": "People in global affairs work across countries and cultures — in business, government, aid, and travel. Speaking more than one language opens doors everywhere.",
    "dayToDay": "Communicate across cultures, solve problems between groups, and often travel or work with people worldwide. Language skills are a real career multiplier.",
    "jobs": [
      "Diplomat",
      "Translator / interpreter",
      "International-aid worker",
      "Foreign correspondent",
      "Global business manager",
      "Human-rights advocate"
    ],
    "hs": "Advanced Spanish (or another language), world history, and a cultural exchange or trip.",
    "people": [
      {
        "name": "Malala Yousafzai",
        "who": "As a girl in Pakistan she spoke out for every girl’s right to go to school, even when it was dangerous. She survived an attack for her activism and kept going, becoming at seventeen the youngest person ever to win the Nobel Peace Prize. Her foundation now fights for girls’ education around the world.",
        "wiki": "Malala_Yousafzai"
      },
      {
        "name": "Kofi Annan",
        "who": "A diplomat from Ghana who rose to lead the United Nations as its Secretary-General for ten years. He worked to fight poverty and disease and to bring countries together peacefully, sharing the Nobel Peace Prize in 2001. He began as a young man determined to help the world.",
        "wiki": "Kofi_Annan"
      },
      {
        "name": "Graça Machel",
        "who": "A champion for children and women from Mozambique who once served as her country’s education minister, opening schools for hundreds of thousands of kids. Her landmark United Nations report revealed how war harms children and pushed the world to protect them. She has advised leaders across Africa and beyond.",
        "wiki": "Graça_Machel"
      },
      {
        "name": "Ilwad Elman",
        "who": "A peacebuilder who left the safety of Canada to return to war-torn Somalia and help former child soldiers rebuild their lives. Alongside her mother she runs programs that support survivors and promote peace. Her work has been honored around the world.",
        "wiki": "Ilwad_Elman"
      }
    ],
    "traits": [
      "You love languages and other cultures",
      "You’re curious about the wider world",
      "You like bringing people together"
    ],
    "surprising": [
      "Interpreter at the United Nations",
      "Foreign-service officer living abroad",
      "International aid logistician delivering help in a crisis",
      "Localization specialist adapting games and films for the world"
    ],
    "paths": [
      "International relations, languages, or political science degree",
      "Become fluent in another language — the real career multiplier",
      "Study or volunteer abroad to gain real cross-cultural experience",
      "Global business and trade roles for those who like commerce"
    ],
    "related": [
      "law",
      "writing",
      "social_impact"
    ]
  },
  {
    "id": "hospitality",
    "title": "Hospitality & Culinary",
    "emoji": "🍽️",
    "color": "#c25a86",
    "sig": {
      "math": 0.6,
      "english": 0.7
    },
    "tagline": "Create experiences that make people feel welcome.",
    "whatItIs": "Hospitality is the art of taking care of people — restaurants, hotels, events, travel. It blends creativity, business, and genuine care for others.",
    "dayToDay": "Plan menus or events, lead a team, handle budgets, and make every guest feel special. Fast-paced, creative, and all about people — great for anyone who loves making others happy.",
    "jobs": [
      "Chef",
      "Restaurateur (restaurant owner)",
      "Hotel manager",
      "Event planner",
      "Pastry chef",
      "Travel & tourism director"
    ],
    "hs": "Business, a culinary or nutrition class, and a part-time job in a restaurant or hotel to learn from the inside.",
    "people": [
      {
        "name": "Danny Meyer",
        "who": "A restaurateur who built some of New York’s most beloved restaurants around one idea: that hospitality — making people feel genuinely cared for — matters most. He founded Shake Shack, which grew from a single cart into a worldwide favorite. He teaches that taking care of your team and your guests is simply good business.",
        "wiki": "Danny_Meyer"
      },
      {
        "name": "José Andrés",
        "who": "A celebrated chef who brought Spanish cooking to America, then founded World Central Kitchen to feed people after disasters. His teams rush in after hurricanes, earthquakes, and wars to cook millions of fresh, hot meals. He believes a plate of food can bring real hope.",
        "wiki": "José_Andrés"
      },
      {
        "name": "Julia Child",
        "who": "She discovered her love of cooking as an adult in France, then taught millions of Americans to cook with warmth, humor, and fearlessness on television. Her famous cookbook and shows made fancy French food feel possible for anyone. She proved it is never too late to find your passion.",
        "wiki": "Julia_Child"
      },
      {
        "name": "Elizabeth Blau",
        "who": "A restaurant developer who helped turn Las Vegas into a world dining capital by bringing celebrated chefs and acclaimed restaurants to the city. She has opened and advised restaurants across the country and mentors new chefs and owners. She learned the business from the ground up."
      }
    ],
    "traits": [
      "You love making people feel welcome and happy",
      "You thrive in a fast, creative, people-filled setting",
      "You like food, events, or travel"
    ],
    "surprising": [
      "Cruise-ship director",
      "Theme-park experience designer",
      "Food scientist inventing new flavors",
      "Sommelier or tea master — a whole career in taste"
    ],
    "paths": [
      "Start in a restaurant or hotel and rise through experience",
      "Culinary or hospitality school to fast-track the craft",
      "Business degree for management and ownership",
      "Launch your own pop-up, catering, or event side business"
    ],
    "related": [
      "entrepreneur",
      "arts",
      "agriculture"
    ]
  },
  {
    "id": "trades",
    "title": "Skilled Trades & Making",
    "emoji": "🔧",
    "color": "#8a6a3a",
    "sig": {
      "math": 0.7,
      "science": 0.6
    },
    "tagline": "Build, fix, and make things with your hands.",
    "whatItIs": "Skilled trades keep the world running — electricians, builders, mechanics, makers. These are hands-on careers, often without a four-year degree, and they are in high demand and pay well.",
    "dayToDay": "Solve real, physical problems: wire a house, build a cabinet, fix an engine, weld a frame. It takes skill, precision, and pride in work you can see and touch.",
    "jobs": [
      "Electrician",
      "Carpenter / builder",
      "Plumber",
      "Welder",
      "Auto mechanic",
      "HVAC technician",
      "Machinist",
      "Maker / fabricator"
    ],
    "hs": "Shop and tech-ed classes, geometry, and an apprenticeship or trade-school program (no four-year degree needed).",
    "people": [
      {
        "name": "Adam Savage",
        "who": "A maker and special-effects builder — famous from the TV show “MythBusters” — who has spent his life building props, costumes, and wild experiments. He celebrates working with your hands and shares his projects to inspire kids to make and tinker. One of his mottos: failure is always an option worth learning from.",
        "wiki": "Adam_Savage"
      },
      {
        "name": "Simone Giertz",
        "who": "A Swedish inventor and YouTuber who became famous for building hilarious machines that often don’t quite work — on purpose. She shows that tinkering and “failing” are exactly how great ideas begin, and she later built serious inventions too. Her joyful approach has inspired millions to start making things.",
        "wiki": "Simone_Giertz"
      },
      {
        "name": "Mike Holmes",
        "who": "A master contractor and TV host known for rescuing homes that were built badly, always doing the job the right way. He champions the skilled trades as smart, well-paying careers and mentors young people entering them. His motto is simple: make it right.",
        "wiki": "Mike_Holmes"
      }
    ],
    "traits": [
      "You’d rather build or fix than sit still",
      "You take pride in work you can see and touch",
      "You like solving real, physical problems"
    ],
    "surprising": [
      "Wind-turbine technician (climbs and services giant turbines)",
      "Elevator mechanic (one of the best-paid trades)",
      "Special-effects and prop fabricator for films",
      "Robotics maintenance tech in modern factories"
    ],
    "paths": [
      "Apprenticeship: earn a paycheck while you learn (little or no debt)",
      "Trade or technical school — often under 2 years",
      "On-the-job training straight out of high school",
      "Get licensed, then one day run your own crew or company"
    ],
    "related": [
      "engineering",
      "architecture",
      "transportation"
    ]
  },
  {
    "id": "arts",
    "title": "Arts & Creativity",
    "emoji": "🎨",
    "color": "#a83668",
    "sig": {
      "english": 0.6,
      "math": 0.2
    },
    "tagline": "Bring imagination to life.",
    "whatItIs": "Artists create the visuals, music, and animation that fill movies, games, books, and museums. Creativity is a real career — and a growing one.",
    "dayToDay": "Sketch, paint, animate, compose, or design — practicing your craft daily and bringing to life ideas people have never seen. Discipline plus imagination.",
    "jobs": [
      "Illustrator",
      "Animator",
      "Graphic designer",
      "Game artist",
      "Musician / composer",
      "Filmmaker",
      "Fashion designer"
    ],
    "hs": "Art and design classes, a portfolio of your work, and a music or film elective.",
    "people": [
      {
        "name": "Hayao Miyazaki",
        "who": "A Japanese animator and co-founder of Studio Ghibli whose hand-drawn films — like “My Neighbor Totoro” and “Spirited Away” — are treasured around the world. He is loved for his gentle heroes, imaginative worlds, and deep care for nature. He still draws much of his films by hand, frame by frame.",
        "wiki": "Hayao_Miyazaki"
      },
      {
        "name": "Lin-Manuel Miranda",
        "who": "A composer, writer, and performer who created the hit musicals “In the Heights” and “Hamilton,” blending hip-hop, rap, and history. “Hamilton” retold the story of America’s founding with a diverse cast and became a worldwide phenomenon. He also writes songs for films and champions the arts for young people.",
        "wiki": "Lin-Manuel_Miranda"
      },
      {
        "name": "Kadir Nelson",
        "who": "A painter and illustrator whose rich, lifelike artwork fills award-winning children’s books and appears on magazine covers, murals, and even postage stamps. His paintings often celebrate Black history and everyday heroes. He has earned many of the top honors in children’s book art.",
        "wiki": "Kadir_Nelson"
      },
      {
        "name": "Yayoi Kusama",
        "who": "A Japanese artist famous for her joyful polka dots and mirrored “Infinity Rooms” that make you feel surrounded by endless light. She turned lifelong struggles with her mental health into some of the world’s most loved art. Her exhibitions draw huge crowds all over the globe.",
        "wiki": "Yayoi_Kusama"
      }
    ],
    "traits": [
      "You draw, paint, make music, or create constantly",
      "You see the world a little differently",
      "You’ll practice a craft for the joy of getting better"
    ],
    "surprising": [
      "Concept artist for movies and video games",
      "Sound designer who creates the noises in films and games",
      "Tattoo artist or muralist",
      "Animator or storyboard artist for studios"
    ],
    "paths": [
      "Art, design, film, or music program",
      "Build a strong portfolio or reel — it matters more than a diploma",
      "Self-taught + sharing your work online to find an audience",
      "Freelance and commissions to turn a craft into a living"
    ],
    "related": [
      "media_entertainment",
      "writing",
      "architecture"
    ]
  },
  {
    "id": "sports_health",
    "title": "Sports Science & Health",
    "emoji": "🏅",
    "color": "#2a8a8a",
    "sig": {
      "science": 0.9,
      "math": 0.3
    },
    "tagline": "Keep bodies strong and athletes at their best.",
    "whatItIs": "This field blends science and sports — keeping athletes healthy, helping people recover from injury, and understanding how the body moves and performs.",
    "dayToDay": "Study how the body works, design training and recovery plans, prevent and heal injuries, and help people of all levels reach their peak.",
    "jobs": [
      "Athletic trainer",
      "Physical therapist",
      "Sports-medicine doctor",
      "Nutritionist / dietitian",
      "Kinesiologist (movement scientist)",
      "Strength & conditioning coach"
    ],
    "hs": "Biology, anatomy, and playing or helping out with a sport.",
    "people": [
      {
        "name": "Frank Jobe",
        "who": "An orthopedic surgeon who in 1974 invented a bold new operation to repair a pitcher’s torn elbow — now known as “Tommy John surgery,” after the first player he saved. The surgery has let thousands of athletes heal and return to the sports they love. His idea changed sports medicine forever.",
        "wiki": "Frank_Jobe"
      },
      {
        "name": "Sue Falsone",
        "who": "She made history as the first woman to be a head athletic trainer in major U.S. men’s professional sports, working with the Los Angeles Dodgers baseball team. She helps athletes prevent injuries and recover stronger. Now she also teaches the next generation of trainers.",
        "wiki": "Sue_Falsone"
      },
      {
        "name": "R. Tait McKenzie",
        "who": "A physician, sculptor, and pioneer of physical education who, over a century ago, helped invent modern ideas about exercise and healing the body through movement. He designed programs to rebuild the strength of injured soldiers. He believed a healthy body and a creative mind grow together.",
        "wiki": "R._Tait_McKenzie"
      }
    ],
    "traits": [
      "You love sports and how the body moves",
      "You like science with a hands-on, active side",
      "You want to help people get stronger or heal"
    ],
    "surprising": [
      "Sports biomechanist who analyzes an athlete’s motion",
      "Esports performance coach",
      "Sports psychologist for the mental game",
      "Prosthetics designer for para-athletes"
    ],
    "paths": [
      "Kinesiology, athletic training, or nutrition degree",
      "Physical therapy or sports medicine (often grad school)",
      "Personal-training and coaching certifications — a faster start",
      "Help out with a team now to learn from the sidelines"
    ],
    "related": [
      "medicine",
      "science",
      "education"
    ]
  },
  {
    "id": "public_safety",
    "title": "First Responders & Public Safety",
    "emoji": "🚒",
    "color": "#c0392b",
    "sig": {
      "science": 0.6,
      "math": 0.4
    },
    "tagline": "Run toward the problem and keep people safe.",
    "whatItIs": "First responders are the people who show up when things go wrong — fires, accidents, storms, emergencies — and make them right. It takes courage, quick thinking, and a big heart.",
    "dayToDay": "Train hard, stay ready, and act fast when the call comes — putting out fires, treating the injured, rescuing people, and keeping communities safe. Lots of teamwork and steady nerves.",
    "jobs": [
      "Firefighter",
      "Paramedic / EMT",
      "Search-and-rescue specialist",
      "911 dispatcher",
      "Wildland firefighter",
      "Emergency manager",
      "Lifeguard / water rescue"
    ],
    "hs": "Biology and PE, plus first-aid/CPR certification and volunteering as a cadet or junior responder.",
    "traits": [
      "You stay calm when others panic",
      "You want to protect and help people directly",
      "You like action, teamwork, and being ready"
    ],
    "surprising": [
      "Smokejumper who parachutes into wildfires",
      "Swift-water rescue tech",
      "K-9 handler working with rescue dogs",
      "Disaster-relief coordinator"
    ],
    "paths": [
      "Fire/EMS academy — months of training, then on the job",
      "EMT certification in a single semester, then work up to paramedic",
      "Military or Coast Guard route into rescue and emergency work",
      "Start as a volunteer firefighter or cadet in your own town"
    ],
    "related": [
      "medicine",
      "sports_health",
      "social_impact"
    ],
    "people": [
      {
        "name": "Peter Safar",
        "who": "A doctor often called the \"father of CPR.\" He developed the life-saving steps of mouth-to-mouth and chest compressions and helped create the modern paramedic and ambulance system. Countless people are alive today because of the emergency care he invented.",
        "wiki": "Peter_Safar"
      },
      {
        "name": "Red Adair",
        "who": "A legendary firefighter who specialized in the most dangerous fires of all — blazing oil wells — and traveled the world to put them out. Fearless and inventive, he tackled fires everyone else thought were impossible. His daring work made him famous around the globe.",
        "wiki": "Red_Adair"
      },
      {
        "name": "Brenda Berkman",
        "who": "A firefighter who fought a long legal battle to open the New York City Fire Department to women, then served for 25 years and responded on September 11th. She proved women belong in firehouses and mentored those who followed. She is honored as a pioneer of the fire service.",
        "wiki": "Brenda_Berkman"
      }
    ]
  },
  {
    "id": "agriculture",
    "title": "Food, Farming & Animals",
    "emoji": "🐾",
    "color": "#5a8a3c",
    "sig": {
      "science": 0.8,
      "math": 0.4
    },
    "tagline": "Grow the food and care for the animals the world depends on.",
    "whatItIs": "This field feeds the planet and cares for living things — from high-tech farms and food labs to veterinary clinics and wildlife. It blends science, business, and a love of nature and animals.",
    "dayToDay": "Grow crops or raise animals using science and technology, invent better and safer food, or care for animals’ health. Increasingly high-tech: drones, sensors, and data now help feed the world.",
    "jobs": [
      "Veterinarian",
      "Farmer / rancher",
      "Agricultural scientist",
      "Food scientist",
      "Zookeeper / wildlife biologist",
      "Agricultural engineer",
      "Marine-life specialist"
    ],
    "hs": "Biology and chemistry, plus 4-H or FFA, a garden, or volunteering at a farm, shelter, or vet clinic.",
    "traits": [
      "You love animals, plants, or being outdoors",
      "You like science you can see grow",
      "You care about where food comes from"
    ],
    "surprising": [
      "Agricultural drone pilot mapping fields from the sky",
      "Flavor chemist inventing new foods",
      "Aquaculture scientist farming fish and seaweed",
      "Precision-ag data specialist"
    ],
    "paths": [
      "Veterinarian: college → vet school (a science-rich road)",
      "Agriculture, food science, or animal science degree",
      "Vet-tech or ag-tech programs — 2-year, hands-on routes",
      "Grow up doing it — farms, 4-H, and shelters teach real skills early"
    ],
    "related": [
      "science",
      "environment",
      "medicine"
    ],
    "people": [
      {
        "name": "George Washington Carver",
        "who": "Born into slavery, he became one of America’s greatest agricultural scientists. He taught poor farmers to enrich their soil by planting peanuts and sweet potatoes, then invented hundreds of uses for those crops. He shared his discoveries freely to help people, not to get rich.",
        "wiki": "George_Washington_Carver"
      },
      {
        "name": "Norman Borlaug",
        "who": "An agricultural scientist whose new kinds of wheat helped feed a hungry world — his work is credited with saving as many as a billion lives from famine. He won the Nobel Peace Prize for what became known as the \"Green Revolution.\" He spent his life fighting hunger.",
        "wiki": "Norman_Borlaug"
      },
      {
        "name": "James Herriot",
        "who": "A country veterinarian in England who wrote warm, funny books about caring for farm animals and pets, delighting millions of readers. His real experiences — delivering calves at midnight, treating beloved dogs — showed how much heart the job takes. His stories inspired generations to become vets.",
        "wiki": "James_Herriot"
      }
    ]
  },
  {
    "id": "aviation_space",
    "title": "Aviation & Space",
    "emoji": "✈️",
    "color": "#2f6fd6",
    "sig": {
      "math": 0.9,
      "science": 0.7
    },
    "tagline": "Take flight — and reach for the stars.",
    "whatItIs": "This field is all about moving through the sky and beyond — flying aircraft, guiding them safely, and building the machines that explore space. It rewards focus, calm, and a love of how flight works.",
    "dayToDay": "Fly or navigate aircraft, direct traffic in the sky, or design and test flying machines and spacecraft. Precision and cool-headed decision-making matter every single day.",
    "jobs": [
      "Pilot (airline, cargo, or rescue)",
      "Air-traffic controller",
      "Astronaut",
      "Aerospace technician",
      "Drone / UAV operator",
      "Flight attendant",
      "Avionics specialist"
    ],
    "hs": "Physics and math, plus a flight-simulator hobby, Civil Air Patrol, or an intro flight lesson.",
    "traits": [
      "You’re fascinated by planes, rockets, or space",
      "You stay calm and focused under pressure",
      "You like clear rules and precise work"
    ],
    "surprising": [
      "Drone pilot for film, farming, or delivery",
      "Spacecraft mission controller",
      "Test pilot for brand-new aircraft",
      "Airport operations manager"
    ],
    "paths": [
      "Flight school for a pilot’s license — then build flight hours",
      "Aviation or aerospace degree for engineering and space roles",
      "Military aviation — a proven route into flying and space",
      "A&P (aircraft mechanic) certification — hands-on, in demand, no 4-year degree"
    ],
    "related": [
      "engineering",
      "public_safety",
      "transportation"
    ],
    "people": [
      {
        "name": "Amelia Earhart",
        "who": "A daring pilot who became the first woman to fly solo across the Atlantic Ocean, setting records and inspiring the world. She showed that the sky was open to women at a time when few believed it. Her courage still makes her one of history’s most famous aviators.",
        "wiki": "Amelia_Earhart"
      },
      {
        "name": "Bessie Coleman",
        "who": "Turned away by American flight schools, she learned French and traveled to France to earn her pilot’s license — becoming the first African American and Native American woman to fly. She thrilled crowds as a stunt pilot and dreamed of opening a flight school for Black students. She proved determination can beat any barrier.",
        "wiki": "Bessie_Coleman"
      },
      {
        "name": "Chesley \"Sully\" Sullenberger",
        "who": "An airline captain who, when both engines failed after a bird strike, calmly landed his jet on the Hudson River and saved all 155 people aboard. Decades of training and steady nerves made the \"Miracle on the Hudson\" possible. He became a worldwide symbol of skill under pressure.",
        "wiki": "Chesley_Sullenberger"
      }
    ]
  },
  {
    "id": "media_entertainment",
    "title": "Media, Film & Gaming",
    "emoji": "🎬",
    "color": "#8a3cc0",
    "sig": {
      "english": 0.7,
      "math": 0.4
    },
    "tagline": "Make the movies, games, and content the world loves.",
    "whatItIs": "This field creates entertainment — films, video games, music, videos, and shows. It mixes storytelling, art, and technology, and it’s one of the fastest-changing, most exciting industries there is.",
    "dayToDay": "Dream up and build worlds: write scripts, design games, shoot and edit video, compose music, or produce shows. Lots of collaboration, creativity, and problem-solving to bring ideas to a screen.",
    "jobs": [
      "Filmmaker / director",
      "Video-game designer",
      "Video editor",
      "Animator",
      "Music producer",
      "Content creator",
      "Sound designer",
      "Broadcast journalist"
    ],
    "hs": "Film, art, music, or media classes — and just start making: short videos, games, or songs you can show.",
    "traits": [
      "You love movies, games, music, or making videos",
      "You’re creative and love bringing ideas to life",
      "You enjoy both art and the tech behind it"
    ],
    "surprising": [
      "Motion-capture actor for games and films",
      "Esports broadcaster",
      "Foley artist who makes movie sound effects",
      "Virtual-world / VR experience designer"
    ],
    "paths": [
      "Film, game design, or media degree",
      "Build a portfolio or channel — real projects open the biggest doors",
      "Learn the tools online and make things now (a phone can start a film)",
      "Intern or assist on a production to learn the industry from inside"
    ],
    "related": [
      "arts",
      "writing",
      "cs_ai"
    ],
    "people": [
      {
        "name": "Walt Disney",
        "who": "An artist and dreamer who turned a mouse cartoon into an entertainment empire of films and theme parks. He pushed animation forward again and again, from the first cartoon with sound to the first full-length animated movie. He failed several times before succeeding, and never stopped imagining.",
        "wiki": "Walt_Disney"
      },
      {
        "name": "Shigeru Miyamoto",
        "who": "The Japanese game designer who created Super Mario, The Legend of Zelda, and Donkey Kong — some of the most beloved video games ever made. He designs games to spark the same wonder he felt exploring as a child. His playful ideas shaped the whole industry.",
        "wiki": "Shigeru_Miyamoto"
      },
      {
        "name": "Ava DuVernay",
        "who": "A filmmaker who started in movie marketing before directing acclaimed films and documentaries, becoming a powerful voice in Hollywood. She tells stories about history and justice that others overlooked, and opens doors for new filmmakers. She proved you can start a film career from an unexpected place.",
        "wiki": "Ava_DuVernay"
      }
    ]
  },
  {
    "id": "social_impact",
    "title": "Helping People & Community",
    "emoji": "🤝",
    "color": "#2a9d8f",
    "sig": {
      "english": 0.7,
      "science": 0.4
    },
    "tagline": "Build stronger communities and lift people up.",
    "whatItIs": "These careers are about caring for people and communities — supporting families, helping in hard times, and organizing to make life better. The reward is knowing your work truly changes lives.",
    "dayToDay": "Listen to people, connect them with help, run programs, and fight for fairer communities. It takes empathy, organization, and real determination to keep going for others.",
    "jobs": [
      "Social worker",
      "Counselor / therapist",
      "Nonprofit leader",
      "Community organizer",
      "Youth mentor",
      "Humanitarian-aid worker",
      "Public-health worker"
    ],
    "hs": "Psychology and writing, plus volunteering — tutoring, food banks, or community projects.",
    "traits": [
      "You’re a good listener people trust",
      "You want your work to help others directly",
      "You notice unfairness and want to fix it"
    ],
    "surprising": [
      "Grant writer who funds good causes",
      "Disaster-relief coordinator",
      "Art or music therapist",
      "Community-health worker linking neighbors to care"
    ],
    "paths": [
      "Social work degree (BSW/MSW) and licensing to counsel",
      "Psychology or human-services degree",
      "Start volunteering and organizing now — experience matters most here",
      "Nonprofit and community roles you can grow into from the ground up"
    ],
    "related": [
      "education",
      "medicine",
      "law"
    ],
    "people": [
      {
        "name": "Jane Addams",
        "who": "A pioneer of social work who opened Hull House in Chicago, a place where immigrant families could find classes, childcare, and help. She fought for children, workers, and peace, and became the first American woman to win the Nobel Peace Prize. She helped invent the very idea of community service.",
        "wiki": "Jane_Addams"
      },
      {
        "name": "Clara Barton",
        "who": "A nurse who cared for wounded soldiers on the battlefield, earning the name \"Angel of the Battlefield,\" then founded the American Red Cross. She spent her life rushing help to people hit by war and disaster. Her organization still saves lives around the world today.",
        "wiki": "Clara_Barton"
      },
      {
        "name": "Dorothy Height",
        "who": "A leader who spent decades fighting for the rights of women and African Americans, organizing marches and programs that lifted whole communities. She advised presidents and mentored generations of activists. She showed that quiet, steady leadership can change a nation.",
        "wiki": "Dorothy_Height"
      }
    ]
  },
  {
    "id": "transportation",
    "title": "Transportation & Logistics",
    "emoji": "🚛",
    "color": "#3a7a8a",
    "sig": {
      "math": 0.7,
      "science": 0.4
    },
    "tagline": "Keep the whole world moving.",
    "whatItIs": "Almost everything you own traveled to reach you. This field moves people and goods — by truck, train, ship, and plane — and plans the giant puzzle of getting the right thing to the right place on time.",
    "dayToDay": "Drive or captain vehicles, or plan the routes and systems that move millions of packages and people. It’s a mix of hands-on skill and clever problem-solving, and it never stops.",
    "jobs": [
      "Supply-chain manager",
      "Truck / delivery driver",
      "Ship captain / mariner",
      "Train engineer",
      "Logistics analyst",
      "Warehouse-robotics technician",
      "Transit planner"
    ],
    "hs": "Math and geography, plus anything hands-on — and know that many roles need training, not a 4-year degree.",
    "traits": [
      "You like solving real-world puzzles and being efficient",
      "You enjoy vehicles, maps, or how things get places",
      "You want a clear path that doesn’t require lots of college debt"
    ],
    "surprising": [
      "Drone-delivery operations planner",
      "Port operations manager moving giant ships",
      "Warehouse-robot fleet technician",
      "Logistics data analyst who saves companies millions"
    ],
    "paths": [
      "Commercial driver’s license (CDL) — weeks of training to a solid career",
      "Supply-chain or logistics degree for planning and management",
      "Maritime or rail academies for ship and train careers",
      "Start in a warehouse or dispatch and move up with experience"
    ],
    "related": [
      "trades",
      "aviation_space",
      "engineering"
    ],
    "people": [
      {
        "name": "Malcom McLean",
        "who": "A truck driver who got tired of watching cargo loaded box by box, and invented the shipping container — a simple metal box that could move straight from truck to ship to train. His idea made shipping so cheap and fast that it reshaped the entire world economy. Nearly everything you buy now travels this way.",
        "wiki": "Malcom_McLean"
      },
      {
        "name": "Garrett Morgan",
        "who": "A self-taught inventor who created an early version of the three-position traffic signal to make busy streets safer, plus a breathing hood that helped rescuers. He sold his traffic invention to help it spread widely. His clever ideas still protect people every day.",
        "wiki": "Garrett_Morgan"
      },
      {
        "name": "Elijah McCoy",
        "who": "An engineer and inventor who created a device that automatically oiled train engines while they ran, so they didn’t have to stop — a huge leap for railroads. His inventions were so trusted that buyers asked for \"the real McCoy.\" He held dozens of patents in an era when that was rare for a Black inventor.",
        "wiki": "Elijah_McCoy"
      }
    ]
  },
  {
    "id": "business_marketing",
    "title": "Business & Marketing",
    "emoji": "📊",
    "color": "#c0662a",
    "sig": {
      "math": 0.6,
      "english": 0.7
    },
    "tagline": "Run companies and get the world excited about ideas.",
    "whatItIs": "Business and marketing careers keep companies running and growing — leading teams, making plans, and convincing customers to love a product. It blends numbers, people skills, and creativity.",
    "dayToDay": "Set goals, analyze what customers want, launch campaigns, manage budgets and people, and measure what works. A mix of strategy, storytelling, and problem-solving — every day is different.",
    "jobs": [
      "Marketing manager",
      "Brand strategist",
      "Business analyst",
      "Product manager",
      "Sales director",
      "Human-resources manager",
      "Management consultant",
      "Market researcher"
    ],
    "hs": "Business, economics, and public speaking — plus running a club, team, or small venture to lead something real.",
    "traits": [
      "You like leading, organizing, and persuading",
      "You enjoy both numbers and creativity",
      "You’re curious about why people buy what they buy"
    ],
    "surprising": [
      "Growth hacker who makes apps spread fast",
      "Brand namer who invents company names",
      "Market researcher who studies shopper behavior",
      "Social-media strategist for big brands"
    ],
    "paths": [
      "Business or marketing degree — the common route into management",
      "Start in sales or an assistant role and rise through results",
      "Build a brand or online shop yourself to learn marketing hands-on",
      "Certifications in digital marketing or analytics to specialize fast"
    ],
    "related": [
      "finance",
      "entrepreneur",
      "media_entertainment"
    ],
    "people": [
      {
        "name": "Ursula Burns",
        "who": "She started as a summer intern at Xerox and worked her way all the way to the top, becoming its CEO — the first Black woman ever to lead a Fortune 500 company. She grew up in public housing and credits hard work and her mother’s belief in education. She mentors young people aiming high.",
        "wiki": "Ursula_Burns"
      },
      {
        "name": "Indra Nooyi",
        "who": "Born in India, she rose to become the CEO of PepsiCo, one of the world’s largest food and drink companies, leading it for twelve years. She pushed the company toward healthier products and long-term thinking. She often speaks about balancing ambition and family.",
        "wiki": "Indra_Nooyi"
      },
      {
        "name": "David Ogilvy",
        "who": "Often called the \"Father of Advertising,\" he built one of the world’s most famous ad agencies on the idea that ads should respect the customer and tell the truth. His clever, honest campaigns became legendary. He started as a cook and a door-to-door salesman before finding his calling.",
        "wiki": "David_Ogilvy_(businessman)"
      }
    ]
  },
  {
    "id": "it_cyber",
    "title": "IT, Cybersecurity & Networks",
    "emoji": "🔐",
    "color": "#2f6f5f",
    "sig": {
      "math": 0.9,
      "science": 0.4
    },
    "tagline": "Keep the world’s computers running — and safe from hackers.",
    "whatItIs": "While software engineers build apps, IT and cybersecurity pros keep all the computers, networks, and data working and protected. When a hospital, bank, or school gets hacked, these are the people who defend it.",
    "dayToDay": "Set up and fix networks, protect systems from attacks, hunt for weaknesses before criminals find them, and respond fast when something breaks. Part puzzle-solving, part detective work, always in demand.",
    "jobs": [
      "Cybersecurity analyst",
      "Network administrator",
      "Ethical hacker (penetration tester)",
      "IT support specialist",
      "Cloud engineer",
      "Security architect",
      "Systems administrator"
    ],
    "hs": "Math and any computing class, plus tinkering with your own computer or network and earning a starter IT certification.",
    "traits": [
      "You like protecting things and outsmarting bad guys",
      "You’re patient at troubleshooting until it works",
      "You’re fascinated by how the internet actually runs"
    ],
    "surprising": [
      "Ethical hacker paid to break in and report the holes",
      "Digital forensics investigator who solves cyber-crimes",
      "Bug-bounty hunter who earns rewards finding flaws",
      "Cloud-security engineer protecting huge data centers"
    ],
    "paths": [
      "Certifications (like CompTIA or Security+) — a fast, respected way in, no 4-year degree required",
      "2-year IT degree, then specialize",
      "Computer science or cybersecurity degree for deeper roles",
      "Self-taught + home labs and “capture the flag” hacking contests"
    ],
    "related": [
      "cs_ai",
      "engineering",
      "public_safety"
    ],
    "people": [
      {
        "name": "Radia Perlman",
        "who": "A computer scientist sometimes called the \"Mother of the Internet\" for inventing a key rule that lets huge networks route information without crashing. Her work quietly keeps the internet running every second. She has earned dozens of patents and still teaches others.",
        "wiki": "Radia_Perlman"
      },
      {
        "name": "Parisa Tabriz",
        "who": "Nicknamed Google’s \"Security Princess,\" she leads the team that keeps the Chrome browser safe for billions of people. She started as a hacker who loved finding weaknesses, then used that skill to defend instead of attack. She champions bringing more people into cybersecurity.",
        "wiki": "Parisa_Tabriz"
      },
      {
        "name": "Vint Cerf",
        "who": "One of the \"Fathers of the Internet,\" he helped design the basic rules (called TCP/IP) that let all the world’s computers talk to each other. Much of how the internet works traces back to his ideas. He has spent his life helping the network grow and stay open.",
        "wiki": "Vint_Cerf"
      }
    ]
  },
  {
    "id": "military",
    "title": "Military & Service",
    "emoji": "🎖️",
    "color": "#4a5a3a",
    "sig": {
      "math": 0.5,
      "science": 0.5
    },
    "tagline": "Serve, lead, and learn skills that last a lifetime.",
    "whatItIs": "The armed forces protect the country — but they’re also one of the largest training grounds on Earth. Members learn leadership, trades, technology, medicine, aviation, and more, often with college paid for.",
    "dayToDay": "Train hard, work as a tight team, and take on real responsibility young — from piloting and engineering to medicine, cyber, and logistics. Discipline, teamwork, and service are at the heart of it.",
    "jobs": [
      "Officer / leader",
      "Pilot",
      "Combat medic",
      "Cyber-operations specialist",
      "Engineer corps",
      "Logistics specialist",
      "Intelligence analyst",
      "Military police"
    ],
    "hs": "Stay fit, keep your grades up, and talk with a recruiter or explore ROTC and service academies — many careers and college funding start here.",
    "traits": [
      "You value discipline, teamwork, and serving something bigger",
      "You want real responsibility and training young",
      "You’re drawn to leadership and challenge"
    ],
    "surprising": [
      "Military linguist who masters rare languages",
      "Weather forecaster for flight and sea missions",
      "Space Force operator working with satellites",
      "Military musician in an official band"
    ],
    "paths": [
      "Enlist after high school — train in a specialty and often get college paid for",
      "ROTC in college — become an officer while earning your degree",
      "Service academies (like West Point or the Naval Academy) — free education plus leadership",
      "Use military training and benefits to launch a civilian career afterward"
    ],
    "related": [
      "public_safety",
      "aviation_space",
      "engineering"
    ],
    "people": [
      {
        "name": "Colin Powell",
        "who": "The son of immigrants, he rose through the U.S. Army to become a four-star general and the first African American Chairman of the Joint Chiefs of Staff, then Secretary of State. He was known for calm, steady leadership. He often shared simple rules for leading people well.",
        "wiki": "Colin_Powell"
      },
      {
        "name": "Tammy Duckworth",
        "who": "A U.S. Army helicopter pilot who lost both legs when her aircraft was hit in combat, then fought her way through recovery. She went on to serve her country again as a United States Senator. She’s a powerful example of courage and resilience.",
        "wiki": "Tammy_Duckworth"
      },
      {
        "name": "Roy Benavidez",
        "who": "A Green Beret who, though badly wounded, ran into heavy fire to rescue fellow soldiers, saving several lives during the Vietnam War. For his extraordinary bravery he received the Medal of Honor, the nation’s highest award. His story is one of selfless courage.",
        "wiki": "Roy_Benavidez"
      }
    ]
  },
  {
    "id": "real_estate",
    "title": "Real Estate & Property",
    "emoji": "🏘️",
    "color": "#8a6a2a",
    "sig": {
      "math": 0.7,
      "english": 0.6
    },
    "tagline": "Help people find homes and shape where we live.",
    "whatItIs": "Real estate is the business of homes, buildings, and land — helping people buy and sell, managing properties, and developing new places to live and work. It mixes people skills, numbers, and big-picture vision.",
    "dayToDay": "Show homes, negotiate deals, value properties, manage buildings, or plan whole new developments. Great for people who love working with others and enjoy the thrill of closing a deal.",
    "jobs": [
      "Real-estate agent",
      "Property manager",
      "Real-estate developer",
      "Appraiser (values property)",
      "Mortgage specialist",
      "Commercial real-estate broker",
      "Urban developer"
    ],
    "hs": "Math and communication classes, plus a part-time job that builds people skills — a license needs training, not a 4-year degree.",
    "traits": [
      "You’re good with people and enjoy negotiating",
      "You like the mix of numbers and big decisions",
      "You’re interested in homes, buildings, or cities"
    ],
    "surprising": [
      "Real-estate drone photographer",
      "Property \"flipper\" who fixes and resells homes",
      "Commercial broker who leases skyscrapers",
      "Real-estate data analyst spotting hot neighborhoods"
    ],
    "paths": [
      "Get a real-estate license — months of study, not years of college",
      "Start as an assistant to an agent or property manager and learn the trade",
      "Business or finance degree for development and investment roles",
      "Learn by investing small (even studying the market) before going big"
    ],
    "related": [
      "finance",
      "architecture",
      "entrepreneur"
    ],
    "people": [
      {
        "name": "Barbara Corcoran",
        "who": "She borrowed $1,000 to start a small real-estate business in New York and grew it into one of the city’s biggest, then sold it for millions. Famous from the show \"Shark Tank,\" she invests in new entrepreneurs. She says being told \"no\" only made her work harder.",
        "wiki": "Barbara_Corcoran"
      },
      {
        "name": "Don Peebles",
        "who": "A real-estate developer who built a major company creating hotels, apartments, and office towers in big cities. He started young and became one of the most successful Black developers in America. He mentors others and speaks about building wealth through ownership.",
        "wiki": "Don_Peebles"
      },
      {
        "name": "William Levitt",
        "who": "After World War II, he figured out how to build good houses quickly and affordably, using assembly-line methods to create whole new towns. His \"Levittowns\" helped millions of families own their first home. He reshaped how American suburbs were built.",
        "wiki": "William_Levitt"
      }
    ]
  },
  {
    "id": "beauty_style",
    "title": "Beauty, Style & Personal Care",
    "emoji": "💇",
    "color": "#b0568a",
    "sig": {
      "english": 0.4,
      "math": 0.3
    },
    "tagline": "Help people look and feel their best — a creative, hands-on business.",
    "whatItIs": "This field is about style, self-expression, and making people feel confident — hair, makeup, skincare, nails, and fashion. Many roles are skilled trades you can start young, and many stylists run their own businesses.",
    "dayToDay": "Work directly with people, use artistic skill and steady hands, keep up with trends, and often build a loyal following. Creative, social, and entrepreneurial — plenty of stylists become their own boss.",
    "jobs": [
      "Hairstylist / barber",
      "Makeup artist",
      "Esthetician (skincare)",
      "Nail technician",
      "Cosmetics entrepreneur",
      "Fashion stylist",
      "Salon or spa owner"
    ],
    "hs": "Art classes for an eye for design, plus cosmetology school or an apprenticeship — a licensed trade, no 4-year degree needed.",
    "traits": [
      "You’re creative and love working with people",
      "You have an eye for style and detail",
      "You’d enjoy building your own clients or brand"
    ],
    "surprising": [
      "Special-effects makeup artist for films",
      "Celebrity or editorial stylist",
      "Product developer inventing new cosmetics",
      "Content creator teaching beauty to millions"
    ],
    "paths": [
      "Cosmetology or barber school + a license — often under a year",
      "Apprentice under a working stylist and learn on the job",
      "Build a following online showing your work",
      "Grow from stylist to salon owner or your own product line"
    ],
    "related": [
      "arts",
      "entrepreneur",
      "media_entertainment"
    ],
    "people": [
      {
        "name": "Madam C.J. Walker",
        "who": "Born to parents who had been enslaved, she created a line of hair-care products for Black women and built it into a huge business — becoming one of America’s first self-made female millionaires. She employed and trained thousands of women. She gave generously to schools and causes.",
        "wiki": "Madam_C._J._Walker"
      },
      {
        "name": "Vidal Sassoon",
        "who": "A hairstylist who revolutionized haircutting with bold, geometric styles that let hair fall into place naturally. He turned styling into an art form and built a global brand of salons and products. He started sweeping floors in a salon as a boy.",
        "wiki": "Vidal_Sassoon"
      },
      {
        "name": "Pat McGrath",
        "who": "A self-taught makeup artist who became one of the most influential in the world, creating looks for top fashion shows and magazines. She launched her own makeup line that grew into a billion-dollar brand. She proved you don’t need formal training to reach the very top.",
        "wiki": "Pat_McGrath_(make-up_artist)"
      }
    ]
  },
  {
    "id": "sports_recreation",
    "title": "Sports, Fitness & Recreation",
    "emoji": "🏆",
    "color": "#2a7ab0",
    "sig": {
      "science": 0.5,
      "math": 0.3
    },
    "tagline": "Build a life around games, movement, and the great outdoors.",
    "whatItIs": "This field is for people who love sports and activity — playing, coaching, officiating, running teams, keeping people fit, or guiding adventures outdoors. It’s about performance, teamwork, and helping people enjoy being active.",
    "dayToDay": "Train and compete, coach and mentor others, plan events and leagues, lead outdoor trips, or run fitness programs. Active, people-focused work for those who can’t sit still.",
    "jobs": [
      "Professional or college athlete",
      "Coach",
      "Personal trainer",
      "Referee / official",
      "Sports manager / agent",
      "Recreation director",
      "Outdoor / adventure guide",
      "Fitness entrepreneur"
    ],
    "hs": "Play a sport, help coach younger kids, and study biology or PE — and know that coaching and fitness certifications open doors fast.",
    "traits": [
      "You love sports, fitness, or the outdoors",
      "You’re energetic and enjoy motivating others",
      "You thrive as part of a team"
    ],
    "surprising": [
      "Esports coach or pro gamer",
      "Sports agent who represents athletes",
      "Whitewater or mountain guide",
      "Sports-team operations manager"
    ],
    "paths": [
      "Coaching and personal-training certifications — a fast start",
      "Kinesiology, sports management, or recreation degree",
      "Rise through playing, then coaching or officiating",
      "Start your own fitness, camp, or adventure business"
    ],
    "related": [
      "sports_health",
      "education",
      "entrepreneur"
    ],
    "people": [
      {
        "name": "Jackie Robinson",
        "who": "In 1947 he broke Major League Baseball’s color barrier, becoming the first African American to play in the modern major leagues. He faced cruel treatment with dignity and brilliant play, opening the game to everyone. His courage changed sports and the country.",
        "wiki": "Jackie_Robinson"
      },
      {
        "name": "Billie Jean King",
        "who": "A tennis champion who won dozens of major titles and then fought for equal pay and respect for women in sports. Her famous 1973 match, the \"Battle of the Sexes,\" inspired millions. She has spent her life pushing for fairness on and off the court.",
        "wiki": "Billie_Jean_King"
      },
      {
        "name": "Pat Summitt",
        "who": "One of the greatest coaches in any sport, she led the University of Tennessee women’s basketball team to more wins than almost any coach in college history. She demanded excellence and helped every player she coached graduate. She became a role model for coaches everywhere.",
        "wiki": "Pat_Summitt"
      }
    ]
  }
];

/* Gallop Career Explorer — a browsable window onto real careers, what they actually entail,
   and real, accomplished people in each field (kid-appropriate, verified). Personalized to a
   child's strengths but fully explorable, so kids discover paths they never knew existed.
   `sig` = subject weights used to match a field to a child's demonstrated strengths.
   People links go to Wikipedia (factual, ad-free); a few have no article and show a bio only. */
window.GALLOP_CAREERS = [
  {
    id: 'engineering', title: 'Engineering', emoji: '⚙️', color: '#4a5bb0',
    sig: { math: 1, science: 0.8 },
    tagline: 'Design and build the things that make the world work.',
    whatItIs: 'Engineers are problem-solvers who use math and science to design, build, and improve almost everything around you — bridges and phones, rockets and robots, clean-water systems and video games.',
    dayToDay: 'A day might mean sketching a design, building a model or prototype, running tests to see what breaks, fixing it, and working in a team to turn an idea into something real and safe. Lots of drawing, calculating, testing, and teamwork.',
    jobs: ['Mechanical engineer (machines & engines)', 'Civil engineer (bridges, roads, buildings)', 'Aerospace engineer (planes & rockets)', 'Electrical engineer (circuits & power)', 'Robotics engineer', 'Biomedical engineer (medical devices)', 'Environmental engineer (clean water & air)'],
    hs: 'Physics, calculus, and a robotics or coding elective — and build things! Enter a science or engineering fair.',
    people: [
      { name: 'Katherine Johnson', who: 'A NASA mathematician whose brilliant hand calculations helped send American astronauts safely into space and to the Moon. Astronaut John Glenn trusted her so much that before his historic orbit he asked her to double-check the computer’s numbers by hand. Her story was later told in the film “Hidden Figures.”', wiki: 'Katherine_Johnson' },
      { name: 'Mae Jemison', who: 'An engineer and medical doctor who in 1992 became the first African American woman to travel into space, aboard the shuttle Endeavour. Before NASA she served as a Peace Corps doctor in West Africa. She loves both science and the arts, and believes they belong together.', wiki: 'Mae_Jemison' },
      { name: 'Emily Warren Roebling', who: 'She taught herself advanced engineering — math, materials, and cable science — when her husband, the bridge’s chief engineer, fell too ill to leave home. For years she ran the day-to-day building of the Brooklyn Bridge and carried plans between him and the workers. When it opened in 1883, she was among the first to cross it.', wiki: 'Emily_Warren_Roebling' },
      { name: 'Limor Fried', who: 'An MIT-trained electrical engineer who founded Adafruit, a company that makes friendly do-it-yourself electronics kits so anyone can build lights, gadgets, and robots. She built the business around teaching, with free online tutorials and videos. She was the first female engineer featured on the cover of Wired magazine.', wiki: 'Limor_Fried' }
    ]
  },
  {
    id: 'architecture', title: 'Architecture & Design', emoji: '📐', color: '#2f7a8a',
    sig: { math: 0.8, science: 0.4, english: 0.3 },
    tagline: 'Turn empty space into places people love.',
    whatItIs: 'Architects design buildings and spaces — homes, schools, museums, parks, whole neighborhoods — so they are safe, useful, and beautiful. It blends art, math, and science.',
    dayToDay: 'Meet the people who will use a space, sketch ideas, build 3D models on the computer, and solve puzzles about light, materials, and how people move through a room — then work with engineers and builders to make it real.',
    jobs: ['Architect', 'Urban planner (designs cities & neighborhoods)', 'Landscape architect (parks & outdoor spaces)', 'Interior designer', 'Structural engineer', 'Historic preservationist'],
    hs: 'Geometry, physics, and an art or drafting/CAD elective. Sketch buildings you love and figure out why they work.',
    people: [
      { name: 'Maya Lin', who: 'While still a 21-year-old college student, she entered a national contest and won it with her design for the Vietnam Veterans Memorial in Washington, D.C. Its quiet black granite wall, carved with names, is now visited by millions. She has spent her career making art and buildings that connect people with nature and history.', wiki: 'Maya_Lin' },
      { name: 'Zaha Hadid', who: 'An Iraqi-British architect known for bold, curving buildings that look frozen in motion. In 2004 she became the first woman ever to win the Pritzker Prize, architecture’s highest honor. Her designs include museums, stadiums, and opera houses all over the world.', wiki: 'Zaha_Hadid' },
      { name: 'Jeanne Gang', who: 'An American architect famous for Chicago’s rippling Aqua Tower, one of the tallest buildings ever designed by a woman. She designs spaces that bring communities together and are gentler on the environment. Her firm, Studio Gang, works on everything from boathouses to skyscrapers.', wiki: 'Jeanne_Gang' },
      { name: 'Bjarke Ingels', who: 'A Danish architect who designs playful, surprising buildings — including a power plant in Copenhagen with a real public ski slope on its roof. He believes buildings can be both practical and fun. His firm’s work ranges from homes and museums to ideas for living on Mars.', wiki: 'Bjarke_Ingels' }
    ]
  },
  {
    id: 'cs_ai', title: 'Computer Science & AI', emoji: '💻', color: '#3a6fc2',
    sig: { math: 1, science: 0.5 },
    tagline: 'Write the instructions that power apps, games, and AI.',
    whatItIs: 'Computer scientists tell computers what to do by writing code. They build the apps, games, websites, and the artificial intelligence behind tools you use every day.',
    dayToDay: 'Break a big problem into small steps, write code, hunt down and fix bugs, and test until it works. Lots of logic puzzles, creativity, teamwork — and the thrill of making something from nothing.',
    jobs: ['Software engineer (builds apps & websites)', 'Game developer', 'Data scientist (finds patterns in data)', 'AI / machine-learning researcher', 'Cybersecurity analyst (stops hackers)', 'Robotics programmer'],
    hs: 'AP Computer Science, statistics, and a personal coding project or game you build yourself.',
    people: [
      { name: 'Ada Lovelace', who: 'A 19th-century mathematician who worked with inventor Charles Babbage on his design for a mechanical computer. She wrote what many consider the world’s first computer program, and imagined that such machines might one day even make music. She did all this a full century before modern computers existed.', wiki: 'Ada_Lovelace' },
      { name: 'Grace Hopper', who: 'A U.S. Navy rear admiral and computer pioneer who helped create one of the first easy-to-read programming languages, leading to COBOL. She believed computers should understand words, not just numbers. She also helped popularize the word “bug” for a glitch, after a real moth was found stuck in a machine.', wiki: 'Grace_Hopper' },
      { name: 'Margaret Hamilton', who: 'She led the MIT team that wrote the flight software for NASA’s Apollo missions, including Apollo 11’s landing on the Moon. Her careful design let the computer keep working even when it was overloaded during the descent. She helped invent the very idea of “software engineering.”', wiki: 'Margaret_Hamilton_(software_engineer)' },
      { name: 'Fei-Fei Li', who: 'A computer scientist who helped teach computers to “see” by building ImageNet, a huge collection of labeled pictures that jump-started modern AI. She is a professor at Stanford and champions using AI to help people. She also founded a group to welcome more kinds of people into the field.', wiki: 'Fei-Fei_Li' }
    ]
  },
  {
    id: 'medicine', title: 'Medicine & Health', emoji: '🩺', color: '#c0556f',
    sig: { science: 1, english: 0.5 },
    tagline: 'Help people feel better and live healthier lives.',
    whatItIs: 'People in medicine keep bodies healthy and step in when something goes wrong — from doctors and nurses to researchers who invent new cures.',
    dayToDay: 'Listen to patients, figure out what is wrong like a detective, explain it clearly, and treat it. It takes science smarts, steady hands, and a big heart.',
    jobs: ['Doctor / physician', 'Nurse', 'Surgeon', 'Pediatrician (kids’ doctor)', 'Physical therapist', 'Paramedic / EMT', 'Medical researcher', 'Pharmacist'],
    hs: 'Biology, chemistry, and volunteering at a clinic or hospital to see the work up close.',
    people: [
      { name: 'Elizabeth Blackwell', who: 'In 1849 she became the first woman to earn a medical degree in the United States — after school after school had rejected her. She went on to open a hospital run by women and to train other female doctors. She opened the door for women in medicine everywhere.', wiki: 'Elizabeth_Blackwell' },
      { name: 'Jonas Salk', who: 'He developed the first safe, effective polio vaccine in the 1950s, when the disease was paralyzing thousands of children every year. He chose not to patent it so it could reach as many people as possible, giving up a fortune. Thanks partly to his work, polio has nearly vanished from the world.', wiki: 'Jonas_Salk' },
      { name: 'Mona Hanna-Attisha', who: 'A pediatrician in Flint, Michigan whose research proved the city’s water was poisoning children with lead. When officials doubted her, she went public with her data until they were forced to act. Her courage helped protect thousands of kids.', wiki: 'Mona_Hanna-Attisha' },
      { name: 'Paul Farmer', who: 'A doctor and anthropologist who believed everyone — no matter how poor — deserves excellent medical care. He co-founded Partners In Health and spent his life building hospitals and treating disease in Haiti, Rwanda, and beyond. He trained local doctors so the care would last long after he left.', wiki: 'Paul_Farmer' }
    ]
  },
  {
    id: 'science', title: 'Science & Research', emoji: '🔬', color: '#3f8f6a',
    sig: { science: 1, math: 0.6 },
    tagline: 'Ask “why?” and discover how the world really works.',
    whatItIs: 'Scientists investigate everything from tiny atoms to giant galaxies. They ask questions, run experiments, and uncover new knowledge that changes the world.',
    dayToDay: 'Come up with a question, design an experiment to test it, measure carefully, and figure out what the results mean — then share it so others can build on it.',
    jobs: ['Biologist', 'Chemist', 'Physicist', 'Astronomer', 'Geologist', 'Marine biologist', 'Lab researcher'],
    hs: 'Lab sciences, statistics, and a science-fair research project of your own.',
    people: [
      { name: 'Marie Curie', who: 'A physicist and chemist who discovered the elements polonium and radium and pioneered the study of radioactivity, a word she coined. She was the first person ever to win two Nobel Prizes, in physics and in chemistry. She often worked in a cold shed, and her notebooks are still radioactive today.', wiki: 'Marie_Curie' },
      { name: 'Jane Goodall', who: 'As a young researcher she lived among wild chimpanzees in Tanzania and discovered they make and use tools — changing how the world sees animals. She showed that patience and careful watching could reveal secrets no one had noticed. Today she travels the world inspiring young people to protect nature.', wiki: 'Jane_Goodall' },
      { name: 'Katalin Karikó', who: 'A Hungarian-born scientist who spent decades studying mRNA even when few believed in it and her funding was cut. Her stubborn work became the foundation of the mRNA COVID-19 vaccines that protected billions of people. In 2023 she was awarded the Nobel Prize.', wiki: 'Katalin_Karikó' },
      { name: 'Vera Rubin', who: 'An astronomer who measured how galaxies spin and found they were turning far too fast to hold together with only the matter we can see. Her work gave the first strong evidence for invisible “dark matter,” which makes up most of the universe. She was also a lifelong champion for women in science.', wiki: 'Vera_Rubin' }
    ]
  },
  {
    id: 'environment', title: 'Environmental Science', emoji: '🌱', color: '#5a9a3c',
    sig: { science: 1, math: 0.5 },
    tagline: 'Protect the planet with science.',
    whatItIs: 'Environmental scientists study nature — oceans, forests, air, climate — and find ways to keep it healthy for people, animals, and future generations.',
    dayToDay: 'Collect samples outdoors, measure and analyze data, and design solutions to problems like pollution, plastic, and a changing climate. Part detective, part inventor, part explorer.',
    jobs: ['Environmental scientist', 'Marine biologist', 'Conservationist / park ranger', 'Climate scientist', 'Renewable-energy engineer', 'Wildlife biologist'],
    hs: 'Environmental science, chemistry, and a local cleanup or sustainability project.',
    people: [
      { name: 'Wangari Maathai', who: 'A Kenyan scientist who founded the Green Belt Movement, encouraging communities — especially women — to plant tens of millions of trees. The trees restored the soil, provided firewood, and gave people work. In 2004 she became the first African woman to win the Nobel Peace Prize.', wiki: 'Wangari_Maathai' },
      { name: 'Sylvia Earle', who: 'An oceanographer nicknamed “Her Deepness” who has spent thousands of hours exploring the sea, once walking the ocean floor deeper than anyone before her. She has led dozens of expeditions and helped design underwater vehicles. Today she fights to protect special ocean areas she calls “Hope Spots.”', wiki: 'Sylvia_Earle' },
      { name: 'Boyan Slat', who: 'Frustrated by all the plastic he saw while diving as a teenager, he founded The Ocean Cleanup at just 18. His organization builds systems that capture plastic from rivers before it reaches the sea, and from ocean garbage patches. He shows that young people can take on enormous problems.', wiki: 'Boyan_Slat' },
      { name: 'Rachel Carson', who: 'A marine biologist and gifted writer whose 1962 book “Silent Spring” revealed how certain pesticides were harming birds and the environment. Her careful science and clear writing helped launch the modern environmental movement and led to new laws. She proved that words can change the world.', wiki: 'Rachel_Carson' }
    ]
  },
  {
    id: 'finance', title: 'Finance & Business', emoji: '📈', color: '#2f8a52',
    sig: { math: 1, english: 0.4 },
    tagline: 'Understand money and help it grow.',
    whatItIs: 'People in finance help individuals, families, and companies make smart decisions about money — saving, investing, budgeting, and growing wealth.',
    dayToDay: 'Analyze numbers, spot trends, weigh risks, and advise people on how to use their money wisely. Perfect for anyone who loves numbers and figuring out how things really work.',
    jobs: ['Financial analyst', 'Accountant', 'Investor / portfolio manager', 'Economist', 'Financial advisor', 'Actuary (measures risk)'],
    hs: 'Economics, statistics, and a school investing or business club. (Stable Street in Gallop is a head start!)',
    people: [
      { name: 'Warren Buffett', who: 'One of history’s most successful investors, he built his fortune through patience — buying good companies and holding them for decades. Famous for living simply in a house he bought long ago, he has pledged to give away almost all of his wealth. People call him the “Oracle of Omaha.”', wiki: 'Warren_Buffett' },
      { name: 'Mellody Hobson', who: 'She grew up with very little money and learned early to ask smart questions about it. She rose to become co-CEO of a major investment firm and now teaches families to be “financially fluent.” She has also chaired the boards of well-known companies.', wiki: 'Mellody_Hobson' },
      { name: 'John C. Bogle', who: 'He invented the first index fund for everyday people — a simple, low-cost way to invest in the whole stock market at once. Many experts said it would never work, but it became one of the most powerful tools for ordinary savers. He founded Vanguard and spent his life fighting to keep investing fair and cheap.', wiki: 'John_C._Bogle' },
      { name: 'Ngozi Okonjo-Iweala', who: 'A Nigerian economist who twice served as her country’s finance minister, working to fight corruption and manage its money wisely. In 2021 she became the first woman and first African to lead the World Trade Organization. She trained as an economist at Harvard and MIT.', wiki: 'Ngozi_Okonjo-Iweala' }
    ]
  },
  {
    id: 'entrepreneur', title: 'Entrepreneurship', emoji: '🚀', color: '#d2761f',
    sig: { math: 0.7, english: 0.7 },
    tagline: 'Turn an idea into a business.',
    whatItIs: 'Entrepreneurs spot a problem and build something new to solve it — a product, a service, a whole company. They blend numbers (pricing, budgets) with words (pitching, selling).',
    dayToDay: 'Dream up ideas, test them, talk to customers, handle money, lead a team, and keep going after setbacks. The lemonade and market games in Gallop are literally practice for this.',
    jobs: ['Founder / startup owner', 'Small-business owner', 'Product manager', 'Inventor', 'Social entrepreneur (business for good)'],
    hs: 'Business, public speaking, and starting a small side venture of your own.',
    people: [
      { name: 'Sara Blakely', who: 'With five thousand dollars in savings and an idea to improve women’s clothing, she started Spanx from her apartment, doing almost everything herself at first. She grew it into a wildly successful company and became one of the youngest self-made female billionaires. She credits her father for teaching her that failing is just part of trying.', wiki: 'Sara_Blakely' },
      { name: 'Tristan Walker', who: 'He grew up in Queens, New York, and noticed that big companies ignored the grooming needs of people with coarse or curly hair. He founded Walker & Company to make products for customers others overlooked. He also mentors young people from backgrounds like his own.', wiki: 'Tristan_Walker_(entrepreneur)' },
      { name: 'Jessica O. Matthews', who: 'An inventor who created the SOCCKET, a soccer ball that stores energy as kids kick it around so it can later power a lamp. She founded a company, Uncharted, that turns everyday motion into electricity for communities. She holds several patents and degrees from Harvard.', wiki: 'Jessica_O._Matthews' },
      { name: 'Hamdi Ulukaya', who: 'He came to the United States from Turkey with little money and an idea for better yogurt. He bought an old factory and built Chobani into one of America’s top yogurt brands. He is known for hiring refugees and for sharing company ownership with his employees.', wiki: 'Hamdi_Ulukaya' }
    ]
  },
  {
    id: 'law', title: 'Law & Public Service', emoji: '⚖️', color: '#6a5bb0',
    sig: { english: 1, science: 0.3 },
    tagline: 'Stand up for what’s fair.',
    whatItIs: 'Lawyers, judges, and advocates use careful reading, clear argument, and reasoning to solve disputes, protect rights, and make sure rules are fair.',
    dayToDay: 'Read closely, research, build an argument backed by evidence, and speak or write persuasively. A career for people who love reading, debating, and standing up for others.',
    jobs: ['Lawyer / attorney', 'Judge', 'Public defender', 'Civil-rights advocate', 'Prosecutor', 'Policy maker', 'Mediator'],
    hs: 'Debate, government, and rigorous reading & writing courses.',
    people: [
      { name: 'Thurgood Marshall', who: 'As a lawyer he argued and won Brown v. Board of Education, the case that ended legal school segregation in America. He won many cases before the Supreme Court fighting for equal rights. In 1967 he became the first African American Supreme Court justice.', wiki: 'Thurgood_Marshall' },
      { name: 'Sonia Sotomayor', who: 'She grew up in a Bronx housing project and, through hard work and a love of books, earned her way to Princeton and Yale. She became a federal judge and, in 2009, the first Latina justice on the U.S. Supreme Court. She often talks to kids about believing in themselves.', wiki: 'Sonia_Sotomayor' },
      { name: 'Bryan Stevenson', who: 'A lawyer who founded the Equal Justice Initiative to defend people who were wrongly convicted, treated unfairly, or too poor to get good help. He has rescued many people from unjust punishments and argued before the Supreme Court. His book “Just Mercy” tells some of their stories.', wiki: 'Bryan_Stevenson' },
      { name: 'Constance Baker Motley', who: 'A brilliant civil-rights lawyer who helped prepare Brown v. Board of Education and personally argued — and won — landmark cases before the Supreme Court. In 1966 she became the first Black woman to serve as a U.S. federal judge. She helped students integrate universities across the South.', wiki: 'Constance_Baker_Motley' }
    ]
  },
  {
    id: 'writing', title: 'Writing & Media', emoji: '✍️', color: '#b8683f',
    sig: { english: 1 },
    tagline: 'Tell stories and shape ideas with words.',
    whatItIs: 'Writers create the books, movies, games, articles, and posts that inform and entertain the world. Storytelling is one of the most durable human skills there is.',
    dayToDay: 'Imagine, research, draft, and revise — again and again — until the words do exactly what you want. Writers work in books, film, journalism, marketing, and games.',
    jobs: ['Author / novelist', 'Journalist', 'Screenwriter', 'Poet', 'Copywriter (ads)', 'Editor', 'Game writer'],
    hs: 'Creative writing, journalism (join the school paper), and reading widely across genres.',
    people: [
      { name: 'Rick Riordan', who: 'A former middle-school teacher who created the Percy Jackson series after inventing Greek-myth bedtime stories for his son. His books turned ancient myths into thrilling modern adventures and got millions of reluctant readers to love books. He now helps other authors share mythologies from their own cultures.', wiki: 'Rick_Riordan' },
      { name: 'Jason Reynolds', who: 'As a kid he didn’t enjoy reading and didn’t finish a whole novel until he was seventeen. He grew up to become an award-winning author whose honest, fast-moving books speak straight to young people. He even served as the National Ambassador for Young People’s Literature.', wiki: 'Jason_Reynolds' },
      { name: 'Kwame Alexander', who: 'A poet and author who won the Newbery Medal for “The Crossover,” a novel written entirely in verse about two basketball-playing brothers. He travels the world running writing workshops and cheering kids on. He believes poetry can reach readers who think they don’t like to read.', wiki: 'Kwame_Alexander' },
      { name: 'Maya Angelou', who: 'A poet, author, and performer whose memoir “I Know Why the Caged Bird Sings” shared her childhood and moved millions. She wrote powerful poems about courage and dignity, and once recited one at a U.S. presidential inauguration. She lived many lives — dancer, singer, activist — before becoming one of America’s most beloved writers.', wiki: 'Maya_Angelou' }
    ]
  },
  {
    id: 'education', title: 'Education & Psychology', emoji: '🎓', color: '#4a7fbf',
    sig: { english: 0.8, science: 0.5 },
    tagline: 'Help others learn and grow.',
    whatItIs: 'Teachers, counselors, and psychologists help people learn, understand themselves, and reach their potential. Explaining ideas and understanding people are their superpowers.',
    dayToDay: 'Explain tricky ideas simply, encourage people, listen carefully, and figure out how minds and behavior work. Deeply rewarding for anyone who loves helping others.',
    jobs: ['Teacher', 'School counselor', 'Psychologist', 'Speech therapist', 'Professor', 'Coach / mentor', 'Special-education specialist'],
    hs: 'Psychology, writing, and tutoring or mentoring younger kids.',
    people: [
      { name: 'Fred Rogers', who: 'The gentle host of “Mister Rogers’ Neighborhood,” who spent more than thirty years telling children they are valued and loved just as they are. A trained minister and musician, he wrote the songs and voiced the puppets himself. He once spoke to the U.S. Senate and helped save funding for public television.', wiki: 'Fred_Rogers' },
      { name: 'Maria Montessori', who: 'One of Italy’s first female doctors, she created a hands-on way of teaching that lets children explore and learn at their own pace. Schools using her ideas — Montessori schools — now exist all over the world. She believed children learn best by doing.', wiki: 'Maria_Montessori' },
      { name: 'Temple Grandin', who: 'A scientist and author with autism who became one of the world’s leading experts on animal behavior, designing gentler systems used across the livestock industry. She thinks in pictures and teaches the world that minds which work differently are a gift. Her life story became an award-winning film.', wiki: 'Temple_Grandin' },
      { name: 'Angela Duckworth', who: 'A psychologist and former teacher who studies “grit” — the mix of passion and perseverance that helps people reach long-term goals. She found that sticking with things can matter as much as talent. Her research and book have changed how schools think about success.', wiki: 'Angela_Duckworth' }
    ]
  },
  {
    id: 'global', title: 'Global & Diplomacy', emoji: '🌍', color: '#c78a2a',
    sig: { spanish: 1, english: 0.7 },
    tagline: 'Connect people across languages and cultures.',
    whatItIs: 'People in global affairs work across countries and cultures — in business, government, aid, and travel. Speaking more than one language opens doors everywhere.',
    dayToDay: 'Communicate across cultures, solve problems between groups, and often travel or work with people worldwide. Language skills are a real career multiplier.',
    jobs: ['Diplomat', 'Translator / interpreter', 'International-aid worker', 'Foreign correspondent', 'Global business manager', 'Human-rights advocate'],
    hs: 'Advanced Spanish (or another language), world history, and a cultural exchange or trip.',
    people: [
      { name: 'Malala Yousafzai', who: 'As a girl in Pakistan she spoke out for every girl’s right to go to school, even when it was dangerous. She survived an attack for her activism and kept going, becoming at seventeen the youngest person ever to win the Nobel Peace Prize. Her foundation now fights for girls’ education around the world.', wiki: 'Malala_Yousafzai' },
      { name: 'Kofi Annan', who: 'A diplomat from Ghana who rose to lead the United Nations as its Secretary-General for ten years. He worked to fight poverty and disease and to bring countries together peacefully, sharing the Nobel Peace Prize in 2001. He began as a young man determined to help the world.', wiki: 'Kofi_Annan' },
      { name: 'Graça Machel', who: 'A champion for children and women from Mozambique who once served as her country’s education minister, opening schools for hundreds of thousands of kids. Her landmark United Nations report revealed how war harms children and pushed the world to protect them. She has advised leaders across Africa and beyond.', wiki: 'Graça_Machel' },
      { name: 'Ilwad Elman', who: 'A peacebuilder who left the safety of Canada to return to war-torn Somalia and help former child soldiers rebuild their lives. Alongside her mother she runs programs that support survivors and promote peace. Her work has been honored around the world.', wiki: 'Ilwad_Elman' }
    ]
  },
  {
    id: 'hospitality', title: 'Hospitality & Culinary', emoji: '🍽️', color: '#c25a86',
    sig: { math: 0.6, english: 0.7 },
    tagline: 'Create experiences that make people feel welcome.',
    whatItIs: 'Hospitality is the art of taking care of people — restaurants, hotels, events, travel. It blends creativity, business, and genuine care for others.',
    dayToDay: 'Plan menus or events, lead a team, handle budgets, and make every guest feel special. Fast-paced, creative, and all about people — great for anyone who loves making others happy.',
    jobs: ['Chef', 'Restaurateur (restaurant owner)', 'Hotel manager', 'Event planner', 'Pastry chef', 'Travel & tourism director'],
    hs: 'Business, a culinary or nutrition class, and a part-time job in a restaurant or hotel to learn from the inside.',
    people: [
      { name: 'Danny Meyer', who: 'A restaurateur who built some of New York’s most beloved restaurants around one idea: that hospitality — making people feel genuinely cared for — matters most. He founded Shake Shack, which grew from a single cart into a worldwide favorite. He teaches that taking care of your team and your guests is simply good business.', wiki: 'Danny_Meyer' },
      { name: 'José Andrés', who: 'A celebrated chef who brought Spanish cooking to America, then founded World Central Kitchen to feed people after disasters. His teams rush in after hurricanes, earthquakes, and wars to cook millions of fresh, hot meals. He believes a plate of food can bring real hope.', wiki: 'José_Andrés' },
      { name: 'Julia Child', who: 'She discovered her love of cooking as an adult in France, then taught millions of Americans to cook with warmth, humor, and fearlessness on television. Her famous cookbook and shows made fancy French food feel possible for anyone. She proved it is never too late to find your passion.', wiki: 'Julia_Child' },
      { name: 'Elizabeth Blau', who: 'A restaurant developer who helped turn Las Vegas into a world dining capital by bringing celebrated chefs and acclaimed restaurants to the city. She has opened and advised restaurants across the country and mentors new chefs and owners. She learned the business from the ground up.' }
    ]
  },
  {
    id: 'trades', title: 'Skilled Trades & Making', emoji: '🔧', color: '#8a6a3a',
    sig: { math: 0.7, science: 0.6 },
    tagline: 'Build, fix, and make things with your hands.',
    whatItIs: 'Skilled trades keep the world running — electricians, builders, mechanics, makers. These are hands-on careers, often without a four-year degree, and they are in high demand and pay well.',
    dayToDay: 'Solve real, physical problems: wire a house, build a cabinet, fix an engine, weld a frame. It takes skill, precision, and pride in work you can see and touch.',
    jobs: ['Electrician', 'Carpenter / builder', 'Plumber', 'Welder', 'Auto mechanic', 'HVAC technician', 'Machinist', 'Maker / fabricator'],
    hs: 'Shop and tech-ed classes, geometry, and an apprenticeship or trade-school program (no four-year degree needed).',
    people: [
      { name: 'Adam Savage', who: 'A maker and special-effects builder — famous from the TV show “MythBusters” — who has spent his life building props, costumes, and wild experiments. He celebrates working with your hands and shares his projects to inspire kids to make and tinker. One of his mottos: failure is always an option worth learning from.', wiki: 'Adam_Savage' },
      { name: 'Simone Giertz', who: 'A Swedish inventor and YouTuber who became famous for building hilarious machines that often don’t quite work — on purpose. She shows that tinkering and “failing” are exactly how great ideas begin, and she later built serious inventions too. Her joyful approach has inspired millions to start making things.', wiki: 'Simone_Giertz' },
      { name: 'Mike Holmes', who: 'A master contractor and TV host known for rescuing homes that were built badly, always doing the job the right way. He champions the skilled trades as smart, well-paying careers and mentors young people entering them. His motto is simple: make it right.', wiki: 'Mike_Holmes' }
    ]
  },
  {
    id: 'arts', title: 'Arts & Creativity', emoji: '🎨', color: '#a83668',
    sig: { english: 0.6, math: 0.2 },
    tagline: 'Bring imagination to life.',
    whatItIs: 'Artists create the visuals, music, and animation that fill movies, games, books, and museums. Creativity is a real career — and a growing one.',
    dayToDay: 'Sketch, paint, animate, compose, or design — practicing your craft daily and bringing to life ideas people have never seen. Discipline plus imagination.',
    jobs: ['Illustrator', 'Animator', 'Graphic designer', 'Game artist', 'Musician / composer', 'Filmmaker', 'Fashion designer'],
    hs: 'Art and design classes, a portfolio of your work, and a music or film elective.',
    people: [
      { name: 'Hayao Miyazaki', who: 'A Japanese animator and co-founder of Studio Ghibli whose hand-drawn films — like “My Neighbor Totoro” and “Spirited Away” — are treasured around the world. He is loved for his gentle heroes, imaginative worlds, and deep care for nature. He still draws much of his films by hand, frame by frame.', wiki: 'Hayao_Miyazaki' },
      { name: 'Lin-Manuel Miranda', who: 'A composer, writer, and performer who created the hit musicals “In the Heights” and “Hamilton,” blending hip-hop, rap, and history. “Hamilton” retold the story of America’s founding with a diverse cast and became a worldwide phenomenon. He also writes songs for films and champions the arts for young people.', wiki: 'Lin-Manuel_Miranda' },
      { name: 'Kadir Nelson', who: 'A painter and illustrator whose rich, lifelike artwork fills award-winning children’s books and appears on magazine covers, murals, and even postage stamps. His paintings often celebrate Black history and everyday heroes. He has earned many of the top honors in children’s book art.', wiki: 'Kadir_Nelson' },
      { name: 'Yayoi Kusama', who: 'A Japanese artist famous for her joyful polka dots and mirrored “Infinity Rooms” that make you feel surrounded by endless light. She turned lifelong struggles with her mental health into some of the world’s most loved art. Her exhibitions draw huge crowds all over the globe.', wiki: 'Yayoi_Kusama' }
    ]
  },
  {
    id: 'sports_health', title: 'Sports Science & Health', emoji: '🏅', color: '#2a8a8a',
    sig: { science: 0.9, math: 0.3 },
    tagline: 'Keep bodies strong and athletes at their best.',
    whatItIs: 'This field blends science and sports — keeping athletes healthy, helping people recover from injury, and understanding how the body moves and performs.',
    dayToDay: 'Study how the body works, design training and recovery plans, prevent and heal injuries, and help people of all levels reach their peak.',
    jobs: ['Athletic trainer', 'Physical therapist', 'Sports-medicine doctor', 'Nutritionist / dietitian', 'Kinesiologist (movement scientist)', 'Strength & conditioning coach'],
    hs: 'Biology, anatomy, and playing or helping out with a sport.',
    people: [
      { name: 'Frank Jobe', who: 'An orthopedic surgeon who in 1974 invented a bold new operation to repair a pitcher’s torn elbow — now known as “Tommy John surgery,” after the first player he saved. The surgery has let thousands of athletes heal and return to the sports they love. His idea changed sports medicine forever.', wiki: 'Frank_Jobe' },
      { name: 'Sue Falsone', who: 'She made history as the first woman to be a head athletic trainer in major U.S. men’s professional sports, working with the Los Angeles Dodgers baseball team. She helps athletes prevent injuries and recover stronger. Now she also teaches the next generation of trainers.', wiki: 'Sue_Falsone' },
      { name: 'R. Tait McKenzie', who: 'A physician, sculptor, and pioneer of physical education who, over a century ago, helped invent modern ideas about exercise and healing the body through movement. He designed programs to rebuild the strength of injured soldiers. He believed a healthy body and a creative mind grow together.', wiki: 'R._Tait_McKenzie' }
    ]
  }
];

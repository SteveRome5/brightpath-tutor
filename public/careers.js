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
      { name: 'Katherine Johnson', who: 'A NASA mathematician whose brilliant hand calculations helped send American astronauts safely into space and to the Moon.', wiki: 'Katherine_Johnson' },
      { name: 'Mae Jemison', who: 'An engineer and doctor who became the first African American woman to travel into space.', wiki: 'Mae_Jemison' },
      { name: 'Emily Warren Roebling', who: 'She taught herself advanced engineering and took charge of building the Brooklyn Bridge when her husband fell ill.', wiki: 'Emily_Warren_Roebling' },
      { name: 'Limor Fried', who: 'An electrical engineer who founded Adafruit, making fun do-it-yourself electronics kits so anyone can build gadgets and robots.', wiki: 'Limor_Fried' }
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
      { name: 'Maya Lin', who: 'While still a college student she designed the Vietnam Veterans Memorial, and now makes art and buildings that connect people with nature and history.', wiki: 'Maya_Lin' },
      { name: 'Zaha Hadid', who: 'Known for bold, flowing buildings that look like they are in motion; the first woman to win architecture’s top honor, the Pritzker Prize.', wiki: 'Zaha_Hadid' },
      { name: 'Jeanne Gang', who: 'Famous for the wavy Aqua Tower in Chicago; she designs buildings that bring communities together and help the environment.', wiki: 'Jeanne_Gang' },
      { name: 'Bjarke Ingels', who: 'A Danish architect who designs playful buildings, including a power plant with a ski slope on its roof.', wiki: 'Bjarke_Ingels' }
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
      { name: 'Ada Lovelace', who: 'A 19th-century mathematician who wrote what is considered the world’s first computer program — long before modern computers existed.', wiki: 'Ada_Lovelace' },
      { name: 'Grace Hopper', who: 'A Navy admiral and computer pioneer who helped invent one of the first easy-to-read programming languages.', wiki: 'Grace_Hopper' },
      { name: 'Margaret Hamilton', who: 'She led the team that wrote the software that landed Apollo 11 on the Moon, and helped invent the field of software engineering.', wiki: 'Margaret_Hamilton_(software_engineer)' },
      { name: 'Fei-Fei Li', who: 'A computer scientist who helped teach computers to “see,” and champions using AI to help people.', wiki: 'Fei-Fei_Li' }
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
      { name: 'Elizabeth Blackwell', who: 'The first woman to earn a medical degree in the United States, opening the door for women to become doctors.', wiki: 'Elizabeth_Blackwell' },
      { name: 'Jonas Salk', who: 'Developed the first safe polio vaccine and chose not to patent it, so it could reach as many children as possible.', wiki: 'Jonas_Salk' },
      { name: 'Mona Hanna-Attisha', who: 'A pediatrician whose research proved the water in Flint, Michigan was harming children, forcing officials to fix it.', wiki: 'Mona_Hanna-Attisha' },
      { name: 'Paul Farmer', who: 'A doctor who spent his life bringing world-class medical care to some of the poorest communities on Earth.', wiki: 'Paul_Farmer' }
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
      { name: 'Marie Curie', who: 'Discovered new elements and pioneered the study of radioactivity — the first person ever to win two Nobel Prizes.', wiki: 'Marie_Curie' },
      { name: 'Jane Goodall', who: 'Lived among wild chimpanzees and changed how the world understands animals, then spent decades protecting them.', wiki: 'Jane_Goodall' },
      { name: 'Katalin Karikó', who: 'Her decades of stubborn research on mRNA made the modern COVID-19 vaccines possible, earning a Nobel Prize.', wiki: 'Katalin_Karikó' },
      { name: 'Vera Rubin', who: 'An astronomer whose careful measurements of spinning galaxies gave the first strong evidence for mysterious “dark matter.”', wiki: 'Vera_Rubin' }
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
      { name: 'Wangari Maathai', who: 'Founded a movement that planted tens of millions of trees, and became the first African woman to win the Nobel Peace Prize.', wiki: 'Wangari_Maathai' },
      { name: 'Sylvia Earle', who: 'An ocean explorer nicknamed “Her Deepness” who has spent thousands of hours underwater and works to protect the seas.', wiki: 'Sylvia_Earle' },
      { name: 'Boyan Slat', who: 'A young inventor who, as a teenager, founded The Ocean Cleanup to build systems that scoop plastic out of rivers and oceans.', wiki: 'Boyan_Slat' },
      { name: 'Rachel Carson', who: 'A marine biologist and writer whose book helped launch the modern environmental movement.', wiki: 'Rachel_Carson' }
    ]
  },
  {
    id: 'finance', title: 'Finance & Business', emoji: '📈', color: '#2f8a52',
    sig: { math: 1, english: 0.4 },
    tagline: 'Understand money and help it grow.',
    whatItIs: 'People in finance help individuals, families, and companies make smart decisions about money — saving, investing, budgeting, and growing wealth.',
    dayToDay: 'Analyze numbers, spot trends, weigh risks, and advise people on how to use their money wisely. Perfect for anyone who loves numbers and figuring out how things really work.',
    jobs: ['Financial analyst', 'Accountant', 'Investor / portfolio manager', 'Economist', 'Financial advisor', 'Actuary (measures risk)'],
    hs: 'Economics, statistics, and a school investing or business club. (Market Mogul in Gallop is a head start!)',
    people: [
      { name: 'Warren Buffett', who: 'One of history’s most successful investors, famous for patience and for pledging to give away almost all of his fortune.', wiki: 'Warren_Buffett' },
      { name: 'Mellody Hobson', who: 'Grew up with very little and became co-CEO of a major investment firm; she teaches families to be smart about money.', wiki: 'Mellody_Hobson' },
      { name: 'John C. Bogle', who: 'Invented the low-cost index fund — a simple way for everyday people to invest and grow their savings.', wiki: 'John_C._Bogle' },
      { name: 'Ngozi Okonjo-Iweala', who: 'A Nigerian economist and the first woman and first African to lead the World Trade Organization.', wiki: 'Ngozi_Okonjo-Iweala' }
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
      { name: 'Sara Blakely', who: 'Invented a new kind of clothing with a few thousand dollars in savings and built Spanx, becoming a self-made billionaire.', wiki: 'Sara_Blakely' },
      { name: 'Tristan Walker', who: 'Grew up in Queens and founded a company making grooming products for people of color — serving customers others overlooked.', wiki: 'Tristan_Walker_(entrepreneur)' },
      { name: 'Jessica O. Matthews', who: 'An inventor who created a soccer ball that generates electricity as kids play, and leads a clean-energy company.', wiki: 'Jessica_O._Matthews' },
      { name: 'Hamdi Ulukaya', who: 'Came to the U.S. with little money and built Chobani yogurt, known for hiring refugees and sharing ownership with workers.', wiki: 'Hamdi_Ulukaya' }
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
      { name: 'Thurgood Marshall', who: 'A civil-rights lawyer who won the case ending school segregation, then became the first African American Supreme Court justice.', wiki: 'Thurgood_Marshall' },
      { name: 'Sonia Sotomayor', who: 'Grew up in a Bronx housing project and worked her way to becoming the first Latina justice on the U.S. Supreme Court.', wiki: 'Sonia_Sotomayor' },
      { name: 'Bryan Stevenson', who: 'A lawyer who founded the Equal Justice Initiative to defend people wrongly convicted or unfairly treated.', wiki: 'Bryan_Stevenson' },
      { name: 'Constance Baker Motley', who: 'Helped win major desegregation cases and became the first Black woman to serve as a U.S. federal judge.', wiki: 'Constance_Baker_Motley' }
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
      { name: 'Rick Riordan', who: 'Created the Percy Jackson series, turning ancient myths into thrilling adventures and inspiring millions of kids to love reading.', wiki: 'Rick_Riordan' },
      { name: 'Jason Reynolds', who: 'An award-winning author who disliked reading as a kid and now writes honest, exciting books for young people everywhere.', wiki: 'Jason_Reynolds' },
      { name: 'Kwame Alexander', who: 'A poet who won the Newbery Medal for “The Crossover,” a novel written in verse about basketball and growing up.', wiki: 'Kwame_Alexander' },
      { name: 'Maya Angelou', who: 'A poet and author whose memoir and powerful poems have inspired readers to find their own voices.', wiki: 'Maya_Angelou' }
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
      { name: 'Fred Rogers', who: 'The gentle host of “Mister Rogers’ Neighborhood,” who spent his life teaching children they are valued, loved, and capable of kindness.', wiki: 'Fred_Rogers' },
      { name: 'Maria Montessori', who: 'A doctor and educator who created a hands-on way of learning that lets children explore and discover at their own pace.', wiki: 'Maria_Montessori' },
      { name: 'Temple Grandin', who: 'A scientist and author with autism who became a leading expert on animal behavior and shows the world that thinking differently is a strength.', wiki: 'Temple_Grandin' },
      { name: 'Angela Duckworth', who: 'A psychologist who studies “grit” — the power of passion and perseverance to help people reach their goals.', wiki: 'Angela_Duckworth' }
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
      { name: 'Malala Yousafzai', who: 'Stood up for girls’ right to go to school, survived an attack for speaking out, and became the youngest-ever Nobel Peace Prize winner.', wiki: 'Malala_Yousafzai' },
      { name: 'Kofi Annan', who: 'A Ghanaian diplomat who led the United Nations and won the Nobel Peace Prize for his work toward a fairer world.', wiki: 'Kofi_Annan' },
      { name: 'Graça Machel', who: 'A champion for children’s rights whose UN report revealed how war harms children and pushed the world to protect them.', wiki: 'Graça_Machel' },
      { name: 'Ilwad Elman', who: 'A peacebuilder who returned to Somalia to help former child soldiers and support survivors.', wiki: 'Ilwad_Elman' }
    ]
  },
  {
    id: 'hospitality', title: 'Hospitality & Culinary', emoji: '🍽️', color: '#c25a86',
    sig: { math: 0.6, english: 0.7 },
    tagline: 'Create experiences that make people feel welcome.',
    whatItIs: 'Hospitality is the art of taking care of people — restaurants, hotels, events, travel. It blends creativity, business, and genuine care for others.',
    dayToDay: 'Plan menus or events, lead a team, handle budgets, and make every guest feel special. Fast-paced, creative, and all about people — great for anyone who loves making others happy.',
    jobs: ['Chef', 'Restaurateur (restaurant owner)', 'Hotel manager', 'Event planner', 'Pastry chef', 'Sommelier (wine & beverage expert)', 'Travel & tourism director'],
    hs: 'Business, a culinary or nutrition class, and a part-time job in a restaurant or hotel to learn from the inside.',
    people: [
      { name: 'Danny Meyer', who: 'A restaurateur who built beloved New York restaurants and founded Shake Shack, famous for putting genuine hospitality first.', wiki: 'Danny_Meyer' },
      { name: 'José Andrés', who: 'A chef who founded World Central Kitchen, rushing in to cook millions of fresh meals for people after disasters worldwide.', wiki: 'José_Andrés' },
      { name: 'Julia Child', who: 'Taught millions of people to cook with warmth and humor on television, showing that anyone can learn in the kitchen.', wiki: 'Julia_Child' },
      { name: 'Elizabeth Blau', who: 'A restaurant developer who helped shape the modern dining scene of Las Vegas, launching acclaimed restaurants and mentoring chefs.' }
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
      { name: 'Adam Savage', who: 'A maker and special-effects builder (from “MythBusters”) who celebrates building with your hands and encourages kids to make and tinker.', wiki: 'Adam_Savage' },
      { name: 'Simone Giertz', who: 'A Swedish inventor who builds hilarious, clever machines and shows that it’s okay for creations to fail as long as you keep tinkering.', wiki: 'Simone_Giertz' },
      { name: 'Mike Holmes', who: 'A master contractor and TV host who teaches people to build and fix homes the right way, championing skilled trades as great careers.', wiki: 'Mike_Holmes' }
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
      { name: 'Hayao Miyazaki', who: 'A Japanese animator and co-founder of Studio Ghibli whose hand-drawn films are treasured by children and adults worldwide.', wiki: 'Hayao_Miyazaki' },
      { name: 'Lin-Manuel Miranda', who: 'A composer and performer who created “Hamilton” and “In the Heights,” blending hip-hop and history to tell inspiring stories.', wiki: 'Lin-Manuel_Miranda' },
      { name: 'Kadir Nelson', who: 'A painter and illustrator whose stunning artwork fills award-winning children’s books and appears on magazine covers and stamps.', wiki: 'Kadir_Nelson' },
      { name: 'Yayoi Kusama', who: 'A Japanese artist famous for joyful polka dots and mirrored “infinity rooms,” who turned her struggles into world-famous art.', wiki: 'Yayoi_Kusama' }
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
      { name: 'Frank Jobe', who: 'An orthopedic surgeon who invented “Tommy John surgery,” which has let thousands of athletes heal and keep playing.', wiki: 'Frank_Jobe' },
      { name: 'Sue Falsone', who: 'Made history as the first woman to be a head athletic trainer in major U.S. professional sports, working with the L.A. Dodgers.', wiki: 'Sue_Falsone' },
      { name: 'R. Tait McKenzie', who: 'A physician and pioneer of physical education who helped invent modern ideas about exercise and rehabilitating the body.', wiki: 'R._Tait_McKenzie' }
    ]
  }
];

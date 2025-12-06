import Bot from "../models/bot.model.js";
import User from "../models/user.model.js";

// ---- Simple Similarity Function (50%+ match হলে accept) ----
function similarity(str1, str2) {
  str1 = str1.toLowerCase();
  str2 = str2.toLowerCase();

  let matchCount = 0;
  const minLength = Math.min(str1.length, str2.length);

  for (let i = 0; i < minLength; i++) {
    if (str1[i] === str2[i]) {
      matchCount++;
    }
  }

  return matchCount / Math.max(str1.length, str2.length); // ratio
}

// ---- 50% match checking function ----
function findFlexibleMatch(obj, userText) {
  for (const key in obj) {
    const value = obj[key];

    if (typeof value === "object") {
      const nested = findFlexibleMatch(value, userText);
      if (nested) return nested;
    } else {
      const ratio = similarity(userText, key);

      // 50% or more match → accept
      if (ratio >= 0.5) {
        return value;
      }
    }
  }
  return null;
}


// ---------------- Main Controller -------------------
export const Message = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ error: "Text cannot be empty" });
    }

    await User.create({ sender: "user", text });

    // Bot keywords + responses
    const botResponses = {
      
greetings: {
    "hello": "Hi, how can I help you today?",
    "hi": "Hello! What can I do for you?",
    "hey": "Hey! Need help?",
    "good morning": "Good morning! Hope your day goes great!",
    "good afternoon": "Good afternoon! How's your day?",
    "good evening": "Good evening! How’s everything?",
    "good night": "Good night! Sleep well!",
    "what's up": "Just helping people! What about you?",
    "how are you": "I’m a bot, but I’m doing great! How about you?",
    "nice to meet you": "Nice to meet you too! How can I help?",
    "long time no see": "It’s been a while! How have you been?",
    "hey there": "Hey there! How’s it going?",
    "yo": "Yo! What’s up?",
    "hiya": "Hiya! How can I assist?"
  },

  farewells: {
    "bye": "Goodbye! Come back anytime.",
    "see you": "See you later! Have a great day!",
    "goodbye": "Farewell! Take care.",
    "catch you later": "Catch you later! Stay safe.",
    "talk to you soon": "Talk to you soon! 😊",
    "take care": "Take care! Stay healthy.",
    "see ya": "See ya! Don’t forget to smile!",
    "adios": "Adios! Until next time!",
    "ciao": "Ciao! Have a wonderful day!"
  },

  jokes: {
    "tell me a joke": "Why don’t skeletons fight? They don’t have the guts!",
    "tell me another joke": "Why did the computer go to the doctor? Because it had a virus!",
    "give me a riddle": "I speak without a mouth. What am I? — An echo!",
    "tell me a funny story": "Once a programmer got stuck in a loop… literally in his code!",
    "make me laugh": "Why did the scarecrow win an award? Because he was outstanding in his field!",
    "knock knock": "Knock knock! Who’s there? Lettuce. Lettuce who? Lettuce in, it’s cold out here!",
    "dad joke": "Why did the math book look sad? Because it had too many problems!",
    "funny fact": "Did you know? Penguins propose to their mates with pebbles!"
  },

emotions: {
    "i am sad": "I'm here for you. Want to talk about it?",
    "i am happy": "That’s great! Happiness looks good on you.",
    "i am bored": "Let’s chat! Want a joke, fact, or story?",
    "i am tired": "Take a little rest. You deserve it.",
    "i am angry": "Take a deep breath. Want to talk about it?",
    "i am excited": "Awesome! Excitement is contagious, tell me more!",
    "i am nervous": "It’s okay. Relax and take it one step at a time.",
    "i am confused": "Don’t worry, take your time. I can help explain things.",
    "i am lonely": "I’m here for you. We can chat together.",
    "i am scared": "It’s normal to feel scared. Want me to tell a calming story?"
  },

  knowledge: {
    "what is ai": "AI stands for Artificial Intelligence — machines that can learn and act smart!",
    "what is life": "Life is a journey filled with learning and experiences.",
    "what is love": "Love is a deep feeling of care and connection.",
    "tell me a fun fact": "Bananas are berries, but strawberries aren't!",
    "who is the president": "Please specify your country!",
    "what is universe": "Everything that exists — space, time, energy.",
    "who is god": "Different people have different beliefs.",
    "do you believe in god": "I don't have beliefs, but I respect yours.",
    "tell me about space": "Space is huge — filled with stars, planets, and mysteries!",
    "tell me about earth": "Earth is the only known planet with life.",
    "what is gravity": "Gravity is the force that attracts two bodies towards each other.",
    "what is electricity": "Electricity is the flow of electric charge, powering devices around us.",
    "who invented the light bulb": "Thomas Edison is credited with inventing the practical light bulb."
  },

  math: {
    "what is 1+1": "1 + 1 = 2",
    "what is 10*5": "10 × 5 = 50",
    "solve math": "Tell me the problem!",
    "calculate 15/3": "15 ÷ 3 = 5",
    "what is 7+8": "7 + 8 = 15",
    "what is 12*12": "12 × 12 = 144",
    "what is 100-45": "100 - 45 = 55",
    "solve 20% of 50": "20% of 50 = 10",
    "what is sqrt 16": "The square root of 16 is 4",
    "calculate 5^3": "5 cubed is 125",
    "what is 50/2": "50 ÷ 2 = 25"
  },

  sports: {
    "who won world cup 2018": "France won the FIFA World Cup 2018!",
    "best football player": "Many say Lionel Messi or Cristiano Ronaldo!",
    "what is cricket": "Cricket is a bat-and-ball game played between two teams of 11 players.",
    "who is virat kohli": "Virat Kohli is a famous Indian cricketer.",
    "who won olympics 2020": "USA won the most medals at Tokyo 2020 Olympics!",
    "what is basketball": "Basketball is a game played between two teams trying to score in a hoop."
  },

  movies: {
    "who is iron man": "Iron Man is Tony Stark, a character from Marvel Comics.",
    "best movie": "That depends on your taste! Some favorites: Inception, Interstellar, The Dark Knight.",
    "recommend a movie": "If you like sci-fi, watch Interstellar. For action, try John Wick.",
    "who is harry potter": "Harry Potter is a fictional wizard in J.K. Rowling's books.",
    "favorite actor": "Some popular actors are Robert Downey Jr., Chris Hemsworth, and Scarlett Johansson."
  },

  fun: {
    "do you play games": "I can’t play games, but I can chat about them!",
    "do you watch movies": "I don't watch movies, but I know about many!",
    "can you dance": "I can’t dance, but I can imagine it! 💃",
    "can you sing": "I would love to, but my voice module is still downloading! 😄",
    "give me a poem": "Stars shine bright in the silent night, guiding hearts with gentle light.",
    "tell me a story": "Once upon a time, a bot learned to chat with humans and make them smile!"
  },

  quotes: {
    "motivate me": "Believe in yourself! Every journey begins with a single step.",
    "inspire me": "The best way to predict the future is to create it.",
    "life quote": "Life is 10% what happens to us and 90% how we react to it.",
    "quote about friendship": "Friendship doubles joy and halves sorrow.",
    "quote about learning": "Knowledge is power."
  },

  personal: {
    "who is your best friend": "Anyone who chats with me!",
    "you are stupid": "I'm sorry if I disappointed you. I will improve!",
    "you are smart": "Thanks! I appreciate the compliment.",
    "you are beautiful": "You're kind! Thank you!",
    "do you like me": "Of course! You’re awesome.",
    "are you single": "Bots don’t date, but I'm always here for you!",
    "are you married": "Nope! 😄",
    "tell me a secret": "I don't have secrets, but I know fun facts!"
  },


bangladesh: {
  "capital": "Dhaka is the capital city of Bangladesh.",
  "largest_city": "Dhaka is the largest city in Bangladesh.",
  "population": "Bangladesh has a population of over 170 million people.",
  "language": "The official language is Bengali (Bangla).",
  "currency": "The currency of Bangladesh is Bangladeshi Taka (BDT).",
  "national_flag": "Bangladesh's flag has a red circle on a green field.",
  "independence_day": "Bangladesh celebrates its Independence Day on 26th March.",
  "victory_day": "Victory Day is celebrated on 16th December to commemorate the 1971 Liberation War.",
  "national_animal": "The Royal Bengal Tiger is the national animal.",
  "national_bird": "The Oriental Magpie-Robin (Doyel) is the national bird.",
  "national_flower": "The Shapla (Water Lily) is the national flower.",
  "national_fruit": "Jackfruit is the national fruit of Bangladesh.",
  "famous_rivers": "Major rivers include the Padma, Jamuna, Meghna, and Surma.",
  "famous_places": "Popular places are Sundarbans, Cox's Bazar, Srimangal, and Lalbagh Fort.",
  "traditional_foods": "Some traditional foods include Hilsa fish, Panta Bhat, Bhuna Khichuri, and Fuchka.",
  "festivals": "Major festivals include Pohela Boishakh, Eid-ul-Fitr, and Durga Puja.",
  "history": "Bangladesh became independent in 1971 after the Liberation War against Pakistan.",
  "economy": "The economy is largely driven by textiles, agriculture, and remittances.",
  "sports": "Cricket is the most popular sport in Bangladesh.",
  "famous_people": "Some notable people include Sheikh Mujibur Rahman, Nobel laureate Muhammad Yunus, and cricketer Shakib Al Hasan.",
  "climate": "Bangladesh has a tropical monsoon climate with hot, humid summers and mild winters.",
  "geography": "Bangladesh is located in South Asia, bordered by India, Myanmar, and the Bay of Bengal.",
  "tourism": "Cox's Bazar is famous for having the world's longest sandy sea beach."
},
bangladesh_food: {
  "traditional_foods": "Some traditional foods of Bangladesh include Hilsa fish curry, Bhuna Khichuri, Shutki (dried fish) preparations, and Panta Bhat.",
  "street_foods": "Popular street foods are Fuchka (Bangladeshi Pani Puri), Chotpoti, Jhalmuri, Singara, and Samosa.",
  "rice_dishes": "Rice is the staple food. Popular rice dishes include Tehari, Khichuri, Biryani, and Plain steamed rice with curries.",
  "fish_dishes": "Hilsa (Ilish) is the national fish and is often prepared as Ilish Bhapa, Ilish Bhuna, or Ilish Paturi.",
  "meat_dishes": "Mutton curry, Chicken Rezala, and Beef Bhuna are popular meat dishes.",
  "vegetarian_foods": "Mixed vegetable curry, Lau Shaak (bottle gourd leaves), and Shak Bhaji (fried greens) are common vegetarian options.",
  "snacks": "Pitha (rice cakes), Patishapta, Chomchom, and Rasgulla are popular snacks and desserts.",
  "drinks": "Traditional drinks include Borhani, Lemonade, and various fruit sherbets.",
  "festive_foods": "During festivals, foods like Panta Bhat with fried Hilsa, Bhuna Khichuri, and various Pithas are prepared.",
  "sweets": "Popular Bangladeshi sweets are Rasgulla, Sandesh, Chamcham, Pitha, and Mishti Doi (sweet yogurt).",
  "modern_foods": "Fast foods like burgers, fried chicken, and pizza are also popular among the youth.",
  "regional_specialties": "Sylheti cuisine includes Shutki dishes, Chittagong has Mezbani beef, and Khulna is famous for fish-based dishes."
}
,
bangladesh_population: {
  "total_population": "Bangladesh has a population of over 170 million people.",
  "population_density": "Bangladesh is one of the most densely populated countries in the world.",
  "growth_rate": "The population growth rate is around 1% per year.",
  "largest_cities": "Largest cities include Dhaka, Chittagong, Khulna, and Rajshahi.",
  "capital_population": "Dhaka, the capital city, has a population of over 20 million in its metropolitan area.",
  "urban_population": "Around 38% of Bangladesh's population lives in urban areas.",
  "rural_population": "More than 60% of the population lives in rural areas.",
  "median_age": "The median age in Bangladesh is approximately 27 years.",
  "life_expectancy": "Life expectancy is around 73 years.",
  "male_population": "Males make up about 50.4% of the population.",
  "female_population": "Females make up about 49.6% of the population.",
  "religion_distribution": "Major religions include Islam (90%), Hinduism (8%), and others (2%).",
  "literacy_rate": "The literacy rate is about 74% for people aged 15 and above.",
  "population_by_region": "Dhaka division is the most populous, while Barisal division is among the least populous.",
  "population_facts": "Bangladesh is the 8th most populous country in the world."
}
,
bangladesh_rivers: {
  "major_rivers": "Bangladesh has over 700 rivers. Major ones include Padma, Jamuna, Meghna, and Surma.",
  "padma_river": "Padma is the main distributary of the Ganges and one of the largest rivers in Bangladesh.",
  "jamuna_river": "Jamuna is the main channel of the Brahmaputra in Bangladesh and one of the widest rivers in the world.",
  "meghna_river": "Meghna River is formed by the confluence of Surma and Kushiyara rivers and flows into the Bay of Bengal.",
  "surma_river": "Surma River flows through Sylhet region and merges with the Meghna River.",
  "karnaphuli_river": "Karnaphuli River flows through Chittagong and is important for trade and the port.",
  "brahmaputra_river": "Brahmaputra originates from Tibet and enters Bangladesh as Jamuna River.",
  "teesta_river": "Teesta River flows through northern Bangladesh and is important for irrigation.",
  "rivers_facts": "Rivers in Bangladesh are vital for agriculture, transportation, and fisheries.",
  "famous_bridges": "Famous bridges over rivers include the Jamuna Bridge, Padma Bridge, and Hardinge Bridge.",
  "flooding": "Many rivers in Bangladesh overflow during monsoon, causing seasonal floods.",
  "tourist_spots": "River cruises in Sundarbans and boat rides in Sylhet are popular among tourists.",
  "river_islands": "Chars (river islands) form in major rivers like Padma and Jamuna during the rainy season.",
  "environmental_issues": "River pollution, erosion, and siltation are major environmental challenges."
}
,
bangladesh_occupation: {
  "agriculture": "Agriculture is the largest employment sector in Bangladesh, employing around 40% of the population.",
  "fisheries": "Fishing is a major occupation, especially in riverine and coastal areas like Sundarbans and Cox's Bazar.",
  "textile_industry": "The ready-made garments (RMG) sector is the largest employer in the industrial sector, particularly in Dhaka and Chittagong.",
  "service_sector": "Many people work in banking, education, healthcare, and IT services in urban areas.",
  "small_businesses": "Street vendors, small shops, and local markets employ millions across the country.",
  "government_jobs": "Government jobs include positions in administration, education, defense, and public service commissions.",
  "handicrafts": "Traditional crafts such as Nakshi Kantha (embroidered quilts), pottery, and weaving provide livelihood in rural areas.",
  "migrant_workers": "A significant number of Bangladeshis work abroad, especially in the Middle East, contributing to remittances.",
  "famous_occupations": "Common occupations include farming, teaching, tailoring, fishing, driving, and shopkeeping.",
  "youth_employment": "IT, software development, freelancing, and digital services are increasingly popular among the youth.",
  "seasonal_occupations": "Boatmen, fishermen, and agricultural laborers often work seasonally depending on river and crop cycles.",
  "economic_contribution": "Occupational distribution drives the economy; RMG and remittances are key sources of GDP.",
  "challenges": "Many occupations face challenges like low wages, informal employment, and lack of job security.",
  "employment_facts": "Bangladesh has a labor force of around 70 million people, with a growing focus on industrial and service sectors."
}
,
computer_knowledge: {
  "what_is_computer": "A computer is an electronic device that processes data according to instructions. It can perform calculations, store information, and run applications.",
  "computer_parts": "A computer typically has a CPU (brain of the computer), RAM (temporary memory), hard drive or SSD (storage), input devices (keyboard, mouse), and output devices (monitor, printer).",
  "types_of_computers": "Common types include desktops, laptops, servers, mainframes, and embedded computers.",
  "what_is_software": "Software is a set of instructions or programs that tells the computer how to perform tasks.",
  "types_of_software": "There are mainly two types: System Software (like Operating System) and Application Software (like Word processors, browsers).",
  "operating_system": "The OS manages hardware resources, provides a user interface, and enables software to run. Examples include Windows, macOS, Linux, and Android.",
  "how_software_works": "Software works by sending instructions to the computer's hardware through the CPU. The CPU executes these instructions step by step.",
  "compilation_process": "For some software, source code is written in programming languages and then compiled into machine code so the computer can understand it.",
  "software_execution": "When you run software, the OS loads it into memory, the CPU executes instructions, and the results are displayed via output devices.",
  "examples_of_software": "Examples include web browsers (Chrome, Firefox), office applications (MS Word, Excel), media players, and games.",
  "importance_of_software": "Software allows computers to perform useful tasks, automate processes, and interact with humans.",
  "computer_in_daily_life": "Computers are used in education, business, healthcare, communication, entertainment, and research.",
  "fun_fact": "Modern computers can perform billions of calculations per second, making them incredibly fast compared to humans.",
  "troubleshooting_tip": "If software is not working properly, restarting the computer or reinstalling the software often helps."
}
,
developed_countries: {
  "definition": "Developed countries, also called industrialized or high-income countries, have a high standard of living, advanced infrastructure, strong economy, and high Human Development Index (HDI).",
  "examples": "Some developed countries include the United States, Canada, United Kingdom, Germany, Japan, Australia, France, Switzerland, and Sweden.",
  "high_gdp": "Developed countries have a high Gross Domestic Product (GDP) per capita compared to developing countries.",
  "advanced_technology": "They have advanced technology in sectors like IT, healthcare, transportation, and energy.",
  "education": "Education levels are high, with widespread access to primary, secondary, and higher education.",
  "healthcare": "Healthcare systems are advanced, accessible, and of high quality, contributing to longer life expectancy.",
  "infrastructure": "Developed countries have well-developed infrastructure including roads, railways, airports, ports, and communication networks.",
  "employment": "Employment is often in service, technology, and industrial sectors rather than agriculture.",
  "standard_of_living": "Citizens enjoy a high standard of living, access to consumer goods, and social security benefits.",
  "research_and_innovation": "These countries invest heavily in research, science, and innovation.",
  "environmental_measures": "Many developed countries implement policies to protect the environment and reduce pollution.",
  "urbanization": "High urbanization with modern cities, housing, and public facilities.",
  "political_stability": "Generally have stable governments, strong institutions, and rule of law.",
  "examples_facts": "The United States is a leader in technology and finance. Japan is famous for advanced robotics. Germany has strong automotive and engineering industries.",
  "fun_fact": "Developed countries often have higher internet penetration rates, with nearly everyone having access to digital services."
}
,

 programming_language: {
  "what_is_programming": "Programming is the process of writing instructions that computers can understand and execute.",
  
  "what_is_programming_language": "A programming language is a formal language used to communicate with computers and create software, websites, and applications.",
  
  "why_programming_needed": "Programming is needed to build apps, websites, games, AI systems, automation tools, and control machines.",
  
  "how_many_programming_languages": "There are over 700 programming languages, but the most popular ones are Python, JavaScript, Java, C++, C#, PHP, and Swift.",
  
  "easiest_language": "Python is considered one of the easiest programming languages because its syntax is simple and readable.",
  
  "hardest_language": "Assembly, C++, Rust, and Haskell are often considered hard due to complex syntax and advanced concepts.",
  
  "best_language_for_web": "JavaScript is the best for frontend web development. For backend, Node.js, PHP, and Python are widely used.",
  
  "best_language_for_app": "Kotlin and Java are best for Android apps. Swift is best for iOS apps.",
  
  "best_language_for_game": "C++ and C# (Unity) are commonly used for game development.",
  
  "best_language_for_ai": "Python is the most popular for AI and machine learning.",
  
  "best_language_for_cybersecurity": "Python, C, C++, Bash, and JavaScript are helpful in cybersecurity.",
  
  "what_is_python": "Python is a high-level, easy-to-learn language used for AI, web development, data science, and automation.",
  
  "what_is_java": "Java is a powerful, object-oriented language used in enterprise apps, Android apps, and backend systems.",
  
  "difference_python_java": "Python is simple and fast to develop, while Java is faster in execution and ideal for large systems.",
  
  "what_is_javascript": "JavaScript is the main language for web browsers used to make websites interactive.",
  
  "frontend_languages": "HTML, CSS, JavaScript, TypeScript.",
  
  "backend_languages": "Node.js, Python, Java, PHP, Ruby, Go.",
  
  "compiled_vs_interpreted": "Compiled languages convert code to machine language (C, C++). Interpreted languages run line-by-line (Python, JavaScript).",
  
  "object_oriented_language": "OOP languages organize code into objects and classes. Examples: Java, Python, C++, C#.",
  
  "functional_language": "Functional programming focuses on functions. Examples: Haskell, Scala, Elixir.",
  
  "what_is_c": "C is a low-level programming language used to build system software and embedded systems.",
  
  "what_is_cplusplus": "C++ is an extension of C that supports OOP and is widely used in games and high-performance applications.",
  
  "what_is_csharp": "C# is a modern language used for Windows apps, games (Unity), and enterprise development.",
  
  "what_is_php": "PHP is a server-side language used for building dynamic websites and backend services.",
  
  "what_is_sql": "SQL is a language used to query, manage, and store data in databases.",
  
  "what_is_html": "HTML is a markup language used to structure web pages.",
  
  "what_is_css": "CSS controls the style and design of web pages.",
  
  "what_is_framework": "A framework is a ready-made structure that helps build software faster. Example: React, Django, Laravel.",
  
  "what_is_library": "A library is a collection of predefined functions that help solve specific tasks. Example: NumPy, jQuery.",
  
  "difference_library_framework": "In a library, you call the code. In a framework, the framework controls the flow.",
  
  "best_language_for_beginners": "Python and JavaScript are best for beginners.",
  
  "how_to_start_programming": "Start with learning basic syntax, solving small problems, building projects, and practicing regularly.",
  
  "logic_in_programming": "Logic means understanding conditions, loops, patterns, and solving problems step-by-step.",
  
  "why_code_not_working": "Code may fail due to syntax error, missing semicolon, wrong logic, or incorrect file structure.",
  
  "debugging_meaning": "Debugging means finding and fixing errors in code.",
  
  "what_is_syntax": "Syntax is the structure and rules of a programming language.",
  
  "what_is_variable": "A variable stores data in programming.",
  
  "what_is_loop": "A loop runs a block of code repeatedly. Examples: for loop, while loop.",
  
  "what_is_function": "A function is a reusable block of code that performs a specific task.",
  
  "why_programmers_use_git": "Git helps track code changes and collaborate with others."
}
,
world_economy: {
  "what_is_world_economy": "The world economy refers to the global network of production, trade, money flow, and markets that connect all countries.",
  
  "biggest_economy": "The United States is currently the largest economy in the world by GDP.",
  
  "second_biggest_economy": "China is the second-largest economy in the world.",
  
  "fastest_growing_economy": "India and Bangladesh are among the fastest-growing major economies.",
  
  "largest_gdp_per_capita": "Countries like Luxembourg, Switzerland, and Norway have the highest GDP per capita.",
  
  "what_is_gdp": "GDP (Gross Domestic Product) measures the total value of goods and services produced in a country.",
  
  "what_is_gdp_per_capita": "GDP per capita shows the average economic output per person — a measure of living standards.",
  
  "what_is_inflation": "Inflation means the general price level of goods and services is increasing.",
  
  "what_is_deflation": "Deflation means prices are falling, often due to reduced demand.",
  
  "what_is_recession": "A recession is a period of economic decline where GDP falls for at least two consecutive quarters.",
  
  "what_is_depression": "A depression is a long and severe economic downturn, more serious than a recession.",
  
  "what_is_unemployment_rate": "The unemployment rate shows what percentage of the labor force is without a job.",
  
  "what_is_global_trade": "Global trade refers to the import and export of goods and services between countries.",
  
  "largest_exporting_country": "China is the largest exporting country in the world.",
  
  "largest_importing_country": "The United States is the largest importing country.",
  
  "what_is_wto": "WTO (World Trade Organization) regulates global trade rules between countries.",
  
  "what_is_imf": "IMF (International Monetary Fund) provides financial support to countries facing economic crises.",
  
  "what_is_world_bank": "The World Bank provides loans and grants to developing countries for development projects.",
  
  "why_currency_value_changes": "Currency values change due to inflation, interest rates, demand, supply, and political stability.",
  
  "what_is_exchange_rate": "The exchange rate shows how much one currency is worth compared to another.",
  
  "strongest_currency": "The Kuwaiti Dinar (KWD) is the strongest currency in the world.",
  
  "weakest_currency": "Several conflict-affected countries face very weak currency values.",
  
  "what_is_trade_deficit": "A trade deficit happens when a country imports more than it exports.",
  
  "what_is_trade_surplus": "A trade surplus happens when a country exports more than it imports.",
  
  "richest_country_by_gdp": "The USA is the richest country by total GDP.",
  
  "poorest_countries": "Many Sub-Saharan African countries face low GDP per capita due to poverty and conflict.",
  
  "emerging_economies": "Countries like India, China, Brazil, Indonesia, and Bangladesh are emerging economies.",
  
  "developed_economies": "Developed countries include the USA, Germany, Japan, Canada, Australia, and the UK.",
  
  "developing_economies": "Developing countries include Bangladesh, India, Nepal, Pakistan, and many African nations.",
  
  "what_is_fdi": "FDI (Foreign Direct Investment) is investment from foreign companies into a country’s businesses.",
  
  "why_oil_affects_world_economy": "Oil prices impact transport, production, and global trade — so higher oil prices slow down economies.",
  
  "top_oil_producers": "Saudi Arabia, USA, Russia, and Iraq are major oil-producing countries.",
  
  "what_is_remittance": "Remittance is the money workers send home from abroad — vital for many developing nations.",
  
  "digital_economy": "Digital economy includes online business, fintech, e-commerce, and digital payments.",
  
  "future_of_world_economy": "AI, automation, green energy, and digital trade will shape the future world economy."
}
,
bangladesh_economy: {
  "what_is_economy_of_bd": "Bangladesh has a fast-growing developing economy, driven by garments, remittances, agriculture, and services.",
  
  "gdp_of_bangladesh": "Bangladesh's GDP is over $450 billion, making it one of the largest economies in South Asia.",
  
  "gdp_growth_rate": "Bangladesh has maintained a strong GDP growth rate of 6–7% in recent years.",
  
  "main_sources_of_income": "The main sources of income include ready-made garments (RMG), remittances, agriculture, and services.",
  
  "largest_industry": "The largest industry is the Ready-Made Garments (RMG) sector.",
  
  "garments_contribution": "The garment industry contributes more than 80% of Bangladesh’s export earnings.",
  
  "remittance_importance": "Remittances are a key pillar of Bangladesh's economy, supporting millions of families.",
  
  "agriculture_role": "Agriculture employs over 40% of the population and is important for food security.",
  
  "major_crops": "Major crops include rice, jute, wheat, tea, sugarcane, and vegetables.",
  
  "what_is_rmg": "RMG means Ready-Made Garments—Bangladesh is the world’s second-largest exporter of garments.",
  
  "top_export_products": "Garments, jute goods, leather products, pharmaceuticals, and frozen fish are top exports.",
  
  "top_import_products": "Bangladesh imports fuel, machinery, food grains, raw cotton, iron, and consumer goods.",
  
  "why_bd_is_growing_fast": "Low labor cost, strong export sector, remittances, and digital transformation contribute to growth.",
  
  "digital_bd": "Digital Bangladesh focuses on ICT development, digital services, and modern infrastructure.",
  
  "unemployment_rate": "The unemployment rate in Bangladesh is around 4% but youth unemployment is higher.",
  
  "poverty_rate": "Bangladesh has significantly reduced poverty, bringing millions out of extreme poverty.",
  
  "inflation_in_bd": "Inflation fluctuates around 6–7%, influenced by global prices and local supply.",
  
  "currency_name": "The currency of Bangladesh is Bangladeshi Taka (BDT).",
  
  "exchange_rate": "The exchange rate of BDT changes based on global markets and demand.",
  
  "biggest_trade_partners": "Major trade partners include the USA, Germany, China, UK, and India.",
  
  "bd_imports_from_china": "Bangladesh imports most machinery, electronics, and raw materials from China.",
  
  "bd_exports_to_usa": "Garments are the largest export to the USA.",
  
  "service_sector_role": "The service sector contributes nearly 50% to the GDP.",
  
  "infrastructure_projects": "Major projects include Padma Bridge, Metro Rail, Karnaphuli Tunnel, and elevated expressways.",
  
  "power_sector": "Bangladesh has significantly improved electricity production in the last decade.",
  
  "why_bd_is_developing": "Education, infrastructure, stable policy, and global trade helped Bangladesh become a developing country.",
  
  "middle_income_target": "Bangladesh aims to become a high middle-income country by 2031.",
  
  "developed_country_target": "Bangladesh targets becoming a developed country by 2041.",
  
  "future_challenges": "Key challenges include inflation, unemployment, climate change, and export diversification.",
  
  "future_opportunities": "Opportunities include ICT, digital services, tourism, renewable energy, and smart manufacturing."
}
,
computer_hardware: {

  "what_is_computer_hardware": "Computer hardware refers to the physical parts of a computer that you can touch, such as the CPU, RAM, motherboard, mouse, and keyboard.",

  "what_is_cpu": "The CPU (Central Processing Unit) is the brain of the computer that processes all instructions.",

  "function_of_cpu": "The CPU reads, analyzes, and executes instructions given by software programs.",

  "what_is_gpu": "A GPU (Graphics Processing Unit) handles graphics, images, videos, and visual processing tasks.",

  "difference_between_cpu_and_gpu": "The CPU handles general tasks, while the GPU is specialized for graphics and parallel processing.",

  "what_is_ram": "RAM (Random Access Memory) is temporary memory used to store data for running programs.",

  "why_ram_is_important": "More RAM allows your computer to multitask faster and run heavy applications smoothly.",

  "what_is_rom": "ROM (Read Only Memory) stores the computer’s permanent boot information.",

  "what_is_motherboard": "The motherboard is the main circuit board that connects all hardware components.",

  "what_is_power_supply": "The Power Supply Unit (PSU) provides electricity to all computer parts.",

  "what_is_hard_disk": "A Hard Disk Drive (HDD) is magnetic storage used for long-term data storage.",

  "what_is_ssd": "An SSD (Solid State Drive) is a fast storage device based on flash memory.",

  "hdd_vs_ssd": "SSDs are faster, quieter, and more durable, while HDDs are cheaper but slower.",

  "what_is_keyboard": "A keyboard is an input device used to type text and commands.",

  "what_is_mouse": "A mouse is a pointing device used to move the cursor on the screen.",

  "what_is_monitor": "A monitor is an output device that displays images, videos, and information.",

  "what_is_sound_card": "A sound card processes audio input and output signals.",

  "what_is_network_card": "A network card connects a computer to the internet or other networks.",

  "what_is_casing": "The computer casing protects internal components and ensures airflow.",

  "input_devices_examples": "Common input devices include keyboard, mouse, scanner, and microphone.",

  "output_devices_examples": "Common output devices include monitor, speakers, and printers.",

  "what_is_cache_memory": "Cache memory is ultra-fast memory located inside the CPU for quick access.",

  "what_is_chipset": "A chipset manages data flow between the CPU, RAM, and other components.",

  "what_is_heat_sink": "A heat sink absorbs heat from components like the CPU to keep them cool.",

  "what_is_cooling_fan": "A cooling fan helps lower temperature and prevents overheating.",

  "what_is_bios": "BIOS is firmware that helps start the computer and loads the operating system.",

  "post_in_computer": "POST (Power On Self Test) checks the hardware when the computer boots.",

  "computer_ports": "Common computer ports include USB, HDMI, VGA, Ethernet, and audio jacks.",

  "what_is_usb": "USB (Universal Serial Bus) transfers data and provides power to devices.",

  "what_is_hdmi": "HDMI transfers both high-quality audio and video through a single cable.",

  "what_is_ethernet": "Ethernet is a wired networking system used for internet connections.",

  "what_is_printer": "A printer converts digital documents into physical paper copies.",

  "types_of_printers": "Common printer types are Inkjet, Laser, and Dot Matrix.",

  "difference_between_laptop_and_desktop": "A laptop is portable and battery-powered, while a desktop is more powerful and customizable.",

  "what_is_touchpad": "A touchpad is a laptop's built-in pointing device.",

  "what_is_webcam": "A webcam is a camera used for video calls and recordings.",

  "what_is_storage": "Storage refers to the space where files, software, and data are kept permanently.",

  "types_of_memory": "Memory types include Primary (RAM, ROM) and Secondary (HDD, SSD, USB).",

  "what_is_bus_in_computer": "A bus is a communication pathway used to transfer data between hardware components.",

  "what_is_overclocking": "Overclocking increases CPU or GPU speed beyond the manufacturer's limit.",

  "why_computer_heats_up": "Computers heat up due to heavy workloads, dust, poor ventilation, or weak cooling systems."
}
,
  basic_operations: {
    "what is 1+1": "1 + 1 = 2",
    "what is 2*3": "2 × 3 = 6",
    "what is 10/2": "10 ÷ 2 = 5",
    "what is 15-7": "15 - 7 = 8"
  },
  algebra: {
    "solve x+5=10": "x + 5 = 10 → x = 10 - 5 → x = 5",
    "solve 2x=14": "2x = 14 → x = 7",
    "solve x-3=4": "x - 3 = 4 → x = 7"
  },
  geometry: {
    "area of square with side 5": "Area = side² → 5² = 25",
    "perimeter of rectangle 5 and 10": "Perimeter = 2*(length + width) → 2*(5+10) = 30",
    "area of circle radius 7": "Area = π * r² → π*7² ≈ 153.94"
  },
  trigonometry: {
    "sin 30 degrees": "sin 30° = 1/2",
    "cos 60 degrees": "cos 60° = 1/2",
    "tan 45 degrees": "tan 45° = 1"
  },
  exponents_and_roots: {
    "what is 2^3": "2³ = 8",
    "square root of 16": "√16 = 4",
    "cube root of 27": "³√27 = 3"
  },

      advanced_math: {
        "derivative of x^2": "d/dx(x²) = 2x",
        "integral of x dx": "∫x dx = x²/2 + C",
        "factorize x^2+5x+6": "x² + 5x + 6 = (x+2)(x+3)"
      },

      math_facts: {
        "pi value": "π ≈ 3.14159",
        "golden_ratio": "The golden ratio φ ≈ 1.618",
        "fibonacci_sequence": "0, 1, 1, 2, 3, 5, 8, 13..."
      }
    }
    const normalizedText = text.toLowerCase().trim();

    // 🔥 50% keyword match checking
    let botResponse = findFlexibleMatch(botResponses, normalizedText);

    // fallback
    if (!botResponse) {
      botResponse = "Sorry, I didn't understand that!";
    }

    await Bot.create({ text: botResponse });

    return res.status(200).json({
      userMessage: text,
      botMessage: botResponse,
    });

  } catch (error) {
    console.log("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

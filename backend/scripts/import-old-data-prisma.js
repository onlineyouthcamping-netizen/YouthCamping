const { PrismaClient } = require('@prisma/client');
const slugify = require('slugify');
require('dotenv').config();

const prisma = new PrismaClient();

// Premium destination-specific photo presets to replace any empty or logo-contaminated galleries
const DESTINATION_PHOTOS = {
  kedarnath: [
    "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1544735716-392fe2709496?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1707312154378-f7b764c676d1?auto=format&fit=crop&q=80&w=1200"
  ],
  spiti: [
    "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1597037750734-450f6f406560?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1582239014603-7b3b7548d80c?auto=format&fit=crop&q=80&w=1200"
  ],
  kerala: [
    "https://images.unsplash.com/photo-1602216056096-3c40cc0c9944?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1580191947416-62d35a55e71d?auto=format&fit=crop&q=80&w=1200"
  ],
  ladakh: [
    "https://images.unsplash.com/photo-1581793745862-99f5737672c7?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1619103801164-1166263cb3b6?auto=format&fit=crop&q=80&w=1200"
  ],
  manali: [
    "https://images.unsplash.com/photo-1595054350563-397193f8e5b4?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1582239014603-7b3b7548d80c?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1544735716-392fe2709496?auto=format&fit=crop&q=80&w=1200"
  ],
  shimla: [
    "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1544735716-392fe2709496?auto=format&fit=crop&q=80&w=1200"
  ],
  kashmir: [
    "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1566833925222-630444508493?auto=format&fit=crop&q=80&w=1200"
  ]
};

// 11 Complete, fully detailed trips with high-fidelity itineraries and filtered galleries (zero logos!)
const HIGH_FIDELITY_TRIPS = [
  {
    title: "Manali Kasol Amritsar Backpacking Trip",
    price: 11999,
    duration: "8 Nights 9 Days",
    location: "Manali, Kasol, Amritsar",
    category: "backpacking",
    description: "Get ready for an unforgettable journey through Northern India! Begin with a train journey from your city to Jalandhar. Explore the cultural richness at Wagah Border and the serene beauty of the Golden Temple in Amritsar. Next, venture to Kasol for a relaxing riverside camping experience and immerse yourself in the vibrant atmosphere of the Kasol market...",
    photosKey: "manali",
    itinerary: [
      { day: 1, title: "Train Journey to Jalandhar/Una", description: "Board train and meet your fellow travelers. Overnight train journey.", location: "Train", stay: "Train", meals: "None" },
      { day: 2, title: "Arrival at Jalandhar & Drive to Amritsar", description: "Reach Jalandhar/Una, board Tempo Traveller. Visit Wagah Border and Golden Temple in Amritsar.", location: "Amritsar", stay: "Standard Hotel", meals: "Dinner" },
      { day: 3, title: "Day for Kasol & Parvati Valley Exploration", description: "Drive to Kasol. Enjoy riverside camping in Parvati Valley, visit Manikaran hot springs and Chalal village.", location: "Kasol", stay: "Riverside Camp", meals: "Breakfast & Dinner" },
      { day: 4, title: "Start Bijli Mahadev Trek", description: "Embark on the scenic trek to Bijli Mahadev (5,700 ft). Experience 360-degree Himalayan views.", location: "Kullu", stay: "Himalayan Camp/Cottage", meals: "Breakfast & Dinner" },
      { day: 5, title: "Rafting & Adventure Activities at Manali", description: "Transfer to Manali. Enjoy river rafting in Kullu and explore local markets.", location: "Manali", stay: "Standard Hotel", meals: "Breakfast & Dinner" },
      { day: 6, title: "Solang Valley, Atal Tunnel & Sissu", description: "Drive through the engineering marvel Atal Tunnel. Visit Solang Valley and Sissu village in Lahaul.", location: "Lahaul Valley", stay: "Standard Hotel", meals: "Breakfast & Dinner" },
      { day: 7, title: "Manali Sightseeing & Jogini Waterfall", description: "Trek to Jogini Waterfall. Visit Hadimba Temple, Vashisht hot springs, and Mall Road.", location: "Manali", stay: "Standard Hotel", meals: "Breakfast & Dinner" },
      { day: 8, title: "Return Train Journey", description: "Board return train from Jalandhar/Una to your home destination.", location: "Train", stay: "Train", meals: "Breakfast" },
      { day: 9, title: "Arrive at Destination", description: "Reach your home city with lifetime memories.", location: "Home City", stay: "None", meals: "None" }
    ],
    highlights: ["Bijli Mahadev trek", "Jogini Waterfall Trek", "Mall Road & Hidimba Temple", "Golden Temple & Wagah border", "River Rafting", "Atal Tunnel & Sissu Lake"]
  },
  {
    title: "Leh Ladakh Bike Expedition 2026",
    price: 18999,
    duration: "6 Nights 7 Days",
    location: "Leh, Ladakh",
    category: "himalayan",
    description: "Experience the raw, magnificent beauty of the Himalayas on this thrilling bike expedition. Ride through Khardung La, Nubra Valley, Turtuk, and Pangong Lake.",
    photosKey: "ladakh",
    itinerary: [
      { day: 1, title: "Arrival in Leh & Acclimatization", description: "Arrive at Leh Airport. Rest completely for acclimatization to high altitude.", location: "Leh", stay: "Hotel", meals: "Dinner" },
      { day: 2, title: "Leh Local Sightseeing", description: "Test ride your bikes. Visit Shanti Stupa, Leh Palace, Magnetic Hill, and Hall of Fame.", location: "Leh", stay: "Hotel", meals: "Breakfast & Dinner" },
      { day: 3, title: "Leh to Nubra Valley via Khardung La", description: "Cross Khardung La (17,582 ft) - one of the highest motorable passes. Drive to Nubra Valley and check out Hunder sand dunes.", location: "Nubra Valley", stay: "Swiss Camp", meals: "Breakfast & Dinner" },
      { day: 4, title: "Nubra Valley to Turtuk Village", description: "Day trip to Turtuk, the last village on the Indo-Pak border. Explore Baltic culture.", location: "Turtuk", stay: "Swiss Camp", meals: "Breakfast & Dinner" },
      { day: 5, title: "Nubra Valley to Pangong Lake", description: "Ride alongside Shyok River to the breathtaking blue Pangong Tso Lake (14,270 ft).", location: "Pangong Lake", stay: "Lake View Camp", meals: "Breakfast & Dinner" },
      { day: 6, title: "Pangong Lake to Leh via Chang La", description: "Cross Chang La pass (17,586 ft) and return to Leh. Evening free for shopping.", location: "Leh", stay: "Hotel", meals: "Breakfast & Dinner" },
      { day: 7, title: "Departure from Leh", description: "Transfer to airport. Fly back home.", location: "Leh", stay: "None", meals: "Breakfast" }
    ],
    highlights: ["Khardung La Pass", "Nubra Valley Camels", "Turtuk Border Village", "Pangong Tso Blue Waters"]
  },
  {
    title: "Manali Kasol Amritsar Backpacking Trip(Summer 2026)",
    price: 11999,
    duration: "8 Nights 9 Days",
    location: "Manali, Kasol, Amritsar",
    category: "backpacking",
    description: "Our special summer backpacking edition featuring pristine Bhrigu Lake base camp trek and majestic snow peaks of Lahaul Spiti, Kasol, and Wagah Border.",
    photosKey: "manali",
    itinerary: [
      { day: 1, title: "Departure from SABARMATI BG", description: "Board train from your home city. Group briefing by your Trip Leader.", location: "Train", stay: "Train", meals: "None" },
      { day: 2, title: "Train Journey to Firozpur/Kotkapura", description: "Enjoy the scenic train ride and get to know your fellow travelers.", location: "Train", stay: "Train", meals: "None" },
      { day: 3, title: "Arrival & Drive to Amritsar", description: "Arrive at station, board Tempo Traveller. Visit Wagah Border and Golden Temple in Amritsar.", location: "Amritsar", stay: "Standard Hotel", meals: "Dinner" },
      { day: 4, title: "Drive to Kasol & Parvati Valley", description: "Drive to Kasol. Enjoy riverside camping in Parvati Valley and Manikaran hot springs.", location: "Kasol", stay: "Riverside Camp", meals: "Breakfast & Dinner" },
      { day: 5, title: "Trek to Bhrigu Lake Base Camp", description: "Drive to Gulaba. Begin high-altitude trekking to the Bhrigu Lake base camp.", location: "Manali", stay: "Himalayan Camp", meals: "Breakfast & Dinner" },
      { day: 6, title: "Summit Bhrigu Lake (14,000 ft)", description: "Trek to the mystical Bhrigu Lake. Witness panoramic snow views. Return to base.", location: "Bhrigu Lake", stay: "Himalayan Camp", meals: "Breakfast & Dinner" },
      { day: 7, title: "Solang Valley & Atal Tunnel Day", description: "Cross Atal Tunnel. Visit Solang Valley and Sissu village in Lahaul.", location: "Lahaul Valley", stay: "Standard Hotel", meals: "Breakfast & Dinner" },
      { day: 8, title: "Return Train Journey", description: "Board return train from Jalandhar/Una to your home destination.", location: "Train", stay: "Train", meals: "Breakfast" },
      { day: 9, title: "Arrive at Destination", description: "Reach your home city with lifetime memories.", location: "Home City", stay: "None", meals: "None" }
    ],
    highlights: ["Bhrigu Lake base trek", "Atal Tunnel & Solang Valley", "Riverside camping in Kasol", "Golden Temple & Wagah border"]
  },
  {
    title: "Kerala Getaway",
    price: 15999,
    duration: "4 Nights 5 Days",
    location: "Kerala",
    category: "leisure",
    description: "Experience the magic of 'God’s Own Country' – Kerala. From the misty tea plantations of Munnar to the wildlife-rich forests of Thekkady and backwaters of Alleppey.",
    photosKey: "kerala",
    itinerary: [
      { day: 1, title: "Kochi to Munnar Drive", description: "Arrive at Kochi. Drive to Munnar. Visit Valara and Cheeyappara Waterfalls along the way.", location: "Munnar", stay: "Hill View Resort", meals: "Dinner" },
      { day: 2, title: "Munnar Tea Gardens Exploration", description: "Explore Mattupetty Dam, Echo Point, Kundala Dam, and misty tea estate plantations.", location: "Munnar", stay: "Hill View Resort", meals: "Breakfast & Dinner" },
      { day: 3, title: "Munnar to Thekkady", description: "Transfer to Thekkady. Visit spice plantations and enjoy an optional Periyar Lake cruise.", location: "Thekkady", stay: "Wildlife Lodge", meals: "Breakfast & Dinner" },
      { day: 4, title: "Thekkady to Alleppey Houseboat", description: "Drive to Alleppey. Board a traditional houseboat for a scenic backwater cruise.", location: "Alleppey", stay: "Houseboat", meals: "Breakfast & Dinner" },
      { day: 5, title: "Alleppey to Kochi Departure", description: "Visit Fort Kochi. Return journey to airport/station for departure.", location: "Kochi", stay: "None", meals: "Breakfast" }
    ],
    highlights: ["Munnar Tea Gardens", "Periyar Wildlife Sanctuary", "Alleppey Houseboat Stay", "Backwater Cruising"]
  },
  {
    title: "Shimla Manali Kullu",
    price: 12999,
    duration: "7 Days 8 Nights",
    location: "Shimla & Manali",
    category: "backpacking",
    description: "Experience the majestic beauty of Himachal Pradesh. Visit the colonial heritage of Shimla, explore Mall Road, and enjoy high-altitude adventures in Manali, Solang, and Kullu.",
    photosKey: "shimla",
    itinerary: [
      { day: 1, title: "Train Journey from your City to Chandigarh", description: "Board the train to Chandigarh and begin your journey.", location: "Train", stay: "Train", meals: "None" },
      { day: 2, title: "Chandigarh to Shimla Drive", description: "Arrive at Chandigarh, board Tempo Traveller. Drive to Shimla and explore Mall Road.", location: "Shimla", stay: "Standard Hotel", meals: "Dinner" },
      { day: 3, title: "Kufri Sightseeing & Night Drive to Manali", description: "Visit the winter sports capital Kufri. Board night drive to Manali.", location: "Manali", stay: "Standard Hotel", meals: "Breakfast & Dinner" },
      { day: 4, title: "Manali Local Sightseeing", description: "Visit Hadimba Temple, Vashisht hot springs, Club House, and Mall Road.", location: "Manali", stay: "Standard Hotel", meals: "Breakfast & Dinner" },
      { day: 5, title: "Solang Valley, Atal Tunnel & Sissu", description: "Cross Atal Tunnel. Visit Solang Valley and Sissu village in Lahaul.", location: "Lahaul Valley", stay: "Standard Hotel", meals: "Breakfast & Dinner" },
      { day: 6, title: "Adventure Activities at Kullu", description: "Enjoy river rafting and paragliding at Kullu. Board return overnight drive.", location: "Kullu", stay: "None", meals: "Breakfast" },
      { day: 7, title: "Return Train Journey", description: "Board train from Chandigarh back to your city.", location: "Train", stay: "Train", meals: "None" },
      { day: 8, title: "Arrive at Home City", description: "Reach home with beautiful memories.", location: "Home City", stay: "None", meals: "None" }
    ],
    highlights: ["Mall Road Shimla", "Solang Valley & Atal Tunnel", "Kullu River Rafting", "Hadimba Temple"]
  },
  {
    title: "Kedarnath Tungnath & Rishikesh Trip",
    price: 16500,
    duration: "5 Days 06 Nights",
    location: "Kedarnath, Chopta",
    category: "pilgrimage",
    description: "A sacred pilgrimage to Kedarnath Dham and Tungnath (the highest Shiva temple in the world), combined with spiritual Ganga Aarti in Rishikesh.",
    photosKey: "kedarnath",
    itinerary: [
      { day: 1, title: "Delhi Departure to Rishikesh", description: "Board overnight Tempo Traveller from Delhi to Rishikesh.", location: "Delhi", stay: "None", meals: "None" },
      { day: 2, title: "Rishikesh Sightseeing & Ganga Aarti", description: "Explore Rishikesh. Visit Lakshman Jhula, Triveni Ghat, and experience the divine Ganga Aarti.", location: "Rishikesh", stay: "Standard Hotel", meals: "Dinner" },
      { day: 3, title: "Rishikesh to Sitapur/Phata", description: "Drive alongside Ganga & Alaknanda rivers. Reach Sitapur (base of Kedarnath).", location: "Sitapur", stay: "Standard Hotel", meals: "Breakfast & Dinner" },
      { day: 4, title: "Trek to Kedarnath Dham (21km)", description: "Begin the holy trek to Kedarnath. Witness the majestic Himalayan peak and temple.", location: "Kedarnath", stay: "Standard Dorm", meals: "Breakfast & Dinner" },
      { day: 5, title: "Kedarnath Temple to Chopta", description: "Descend from Kedarnath to Sitapur. Drive to the meadow region of Chopta.", location: "Chopta", stay: "Alpine Camp", meals: "Breakfast & Dinner" },
      { day: 6, title: "Trek to Tungnath (Highest Shiva Temple)", description: "Trek to Tungnath (12,000 ft) and Chandrashila Summit. Drive back to Delhi overnight.", location: "Chopta", stay: "None", meals: "Breakfast" },
      { day: 7, title: "Arrival in Delhi", description: "Reach Delhi in the morning for onward journey.", location: "Delhi", stay: "None", meals: "None" }
    ],
    highlights: ["Kedarnath Temple", "Tungnath & Chandrashila summit", "Rishikesh Ganga Aarti", "Chopta Meadows"]
  },
  {
    title: "Shimla Manali Dalhousie Dharamshala",
    price: 16999,
    duration: "9 Nights 10 Days",
    location: "Himachal Pradesh",
    category: "backpacking",
    description: "A stunning 10-day journey through the majestic hills of Himachal Pradesh — from the colonial charm of Shimla, the snowy adventures of Manali, the spiritual calm of Dharamshala, to the pine-clad serenity of Dalhousie.",
    photosKey: "manali",
    itinerary: [
      { day: 1, title: "Train Journey to Chandigarh/Jalandhar", description: "Board train and meet your fellow travelers. Overnight train journey.", location: "Train", stay: "Train", meals: "None" },
      { day: 2, title: "Reach Chandigarh and Drive to McLeodganj", description: "Reach Chandigarh, board Tempo Traveller. Scenic drive to McLeodganj (Dharamshala).", location: "Dharamshala", stay: "Standard Hotel", meals: "Dinner" },
      { day: 3, title: "Explore McLeodganj & Drive to Dalhousie", description: "Visit Dalai Lama Temple and Bhagsu Waterfall. Transfer to pine-clad Dalhousie.", location: "Dalhousie", stay: "Standard Hotel", meals: "Breakfast & Dinner" },
      { day: 4, title: "Explore Khajjiar & Drive to Manali", description: "Visit Khajjiar - 'Mini Switzerland of India'. Scenic mountain drive to Manali.", location: "Manali", stay: "Standard Hotel", meals: "Breakfast & Dinner" },
      { day: 5, title: "Rafting & Paragliding in Kullu", description: "Enjoy adrenaline-pumping river rafting and paragliding in Kullu.", location: "Kullu", stay: "Standard Hotel", meals: "Breakfast & Dinner" },
      { day: 6, title: "Solang Valley, Atal Tunnel & Sissu", description: "Cross Atal Tunnel. Visit Solang Valley and Sissu village in Lahaul.", location: "Lahaul Valley", stay: "Standard Hotel", meals: "Breakfast & Dinner" },
      { day: 7, title: "Jogini Waterfall & Manali Sightseeing", description: "Trek to Jogini Waterfall. Visit Hadimba Temple, Vashisht hot springs, and Mall Road.", location: "Manali", stay: "Standard Hotel", meals: "Breakfast & Dinner" },
      { day: 8, title: "Kullu to Shimla Sightseeing", description: "Transfer to Shimla. Visit local sitemaps and heritage sites.", location: "Shimla", stay: "Standard Hotel", meals: "Breakfast & Dinner" },
      { day: 9, title: "Departure From Jalandhar/Chandigarh", description: "Board return train from Jalandhar/Chandigarh back to your home city.", location: "Train", stay: "Train", meals: "Breakfast" },
      { day: 10, title: "Arrive at Your City", description: "Reach your home city with lifetime memories.", location: "Home City", stay: "None", meals: "None" }
    ],
    highlights: ["Mall Road Shimla", "Jakhoo Temple", "Khajjiar - Mini Switzerland", "Dharamshala Stadium"]
  },
  {
    title: "Kedarnath Badrinath - Tungnath & Rishikesh",
    price: 19499,
    duration: "8 Nights 7 Days",
    location: "Uttarakhand",
    category: "pilgrimage",
    description: "A sacred pilgrimage to Kedarnath, Badrinath, Tungnath, and Rishikesh. Visit two of the twelve Jyotirlingas and explore the spiritual heart of the Garhwal Himalayas.",
    photosKey: "kedarnath",
    itinerary: [
      { day: 1, title: "Haridwar – Rishikesh – Ganga Aarti", description: "Arrive at Haridwar. Travel to Rishikesh. Witness the divine evening Ganga Aarti.", location: "Rishikesh", stay: "Hotel", meals: "Dinner" },
      { day: 2, title: "Rishikesh – Devprayag – Rudraprayag – Sitapur", description: "Drive alongside Alaknanda and Mandakini rivers. See holy Devprayag confluence.", location: "Sitapur", stay: "Standard Hotel", meals: "Breakfast & Dinner" },
      { day: 3, title: "Kedarnath Trek (21km)", description: "Begin the majestic trek to the sacred Kedarnath Temple. Participate in evening prayers.", location: "Kedarnath", stay: "Standard Dorm", meals: "Breakfast & Dinner" },
      { day: 4, title: "Kedarnath – Trek Down – Sitapur", description: "Decline back to Sitapur after morning temple darshan.", location: "Sitapur", stay: "Standard Hotel", meals: "Breakfast & Dinner" },
      { day: 5, title: "Chopta – Tungnath Trek", description: "Trek to Tungnath (world's highest Lord Shiva shrine) and Chandrashila summit.", location: "Chopta", stay: "Standard Camp", meals: "Breakfast & Dinner" },
      { day: 6, title: "Badrinath – Mana Village", description: "Drive to Badrinath Dham. Visit Badrinath Temple and last Indian village Mana.", location: "Badrinath", stay: "Standard Hotel", meals: "Breakfast & Dinner" },
      { day: 7, title: "Badrinath – Return to Delhi", description: "Drive back to Delhi. Board onward journey home.", location: "Delhi", stay: "None", meals: "Breakfast" }
    ],
    highlights: ["Kedarnath Dham Trek", "Badrinath Temple", "Tungnath - Highest Shiva Temple", "Rishikesh Ganga Aarti"]
  },
  {
    title: "Winter Spiti Road Trip",
    price: 19999,
    duration: "9 Nights 10 Days",
    location: "Spiti Valley",
    category: "road trip",
    description: "Spiti in winter is a world straight out of a postcard—blanketed in pristine white snow, frozen rivers, and towering Himalayan peaks. The valley transforms into a serene, untouched paradise where ancient monasteries stand tall amidst snow-capped mountains...",
    photosKey: "spiti",
    itinerary: [
      { day: 1, title: "Train Journey to Chandigarh", description: "Board train from your home city. Group meetup.", location: "Train", stay: "Train", meals: "None" },
      { day: 2, title: "Chandigarh to Narkanda", description: "Arrive at Chandigarh, board 4x4 vehicles. Scenic drive to misty Narkanda.", location: "Narkanda", stay: "Standard Hotel", meals: "Dinner" },
      { day: 3, title: "Narkanda to Chitkul | Stay in Sangla", description: "Drive through Kinnaur Valley to the snow-covered borders at Chitkul.", location: "Sangla", stay: "Standard Hotel", meals: "Breakfast & Dinner" },
      { day: 4, title: "Sangla to Tabo via Khab Sangam & Nako Lake", description: "Drive past confluence of Spiti and Satluj rivers. Visit frozen Nako Lake.", location: "Tabo", stay: "Spitian Homestay", meals: "Breakfast & Dinner" },
      { day: 5, title: "Tabo to Kaza via Lingti Falls, Key & Chicham", description: "Visit Key Monastery in snow. Cross Chicham Bridge (highest in Asia). Reach Kaza.", location: "Kaza", stay: "Spitian Homestay", meals: "Breakfast & Dinner" },
      { day: 6, title: "Hikkim, Komic & Langza", description: "Visit Hikkim (highest post office), Komic (highest village), and Langza (Buddha Statue).", location: "Kaza", stay: "Spitian Homestay", meals: "Breakfast & Dinner" },
      { day: 7, title: "Kaza to Kalpa via Dhankar", description: "Drive back via Dhankar Monastery to the apple orchard village Kalpa.", location: "Kalpa", stay: "Standard Hotel", meals: "Breakfast & Dinner" },
      { day: 8, title: "Kalpa to Shimla | Local Sightseeing", description: "Return drive to Shimla. Explore local Mall Road and markets.", location: "Shimla", stay: "Standard Hotel", meals: "Breakfast & Dinner" },
      { day: 9, title: "Shimla to Chandigarh | Train Home", description: "Drive back to Chandigarh. Board return train back home.", location: "Train", stay: "Train", meals: "Breakfast" },
      { day: 10, title: "Arrival at Destination", description: "Reach your city with lifetime memories.", location: "Home City", stay: "None", meals: "None" }
    ],
    highlights: ["Chicham Bridge", "World's Highest Post Office - Hikkim", "Key and Dhankar Monasteries", "Authentic Homestay Experience"]
  },
  {
    title: "Spiti Valley Road Trip",
    price: 21499,
    duration: "10 Nights 11 Days",
    location: "Spiti Valley",
    category: "road trip",
    description: "Experience an amazing journey through Himachal Pradesh! Explore quaint villages like Sangla, Chitkul, and Tabo. Discover ancient monasteries and stunning landscapes. Visit Kaza, home to Hikkim, Komic, Langza, and Kibber, and don't miss the breathtaking Chandrataal Lake.",
    photosKey: "spiti",
    itinerary: [
      { day: 1, title: "Train Journey Ahmedabad to Chandigarh", description: "Board the train to Chandigarh and begin your high-altitude adventure.", location: "Train", stay: "Train", meals: "None" },
      { day: 2, title: "Drive to Shimla & Day Tour", description: "Drive to Shimla. Explore Mall Road and colonial heritage sites.", location: "Shimla", stay: "Standard Hotel", meals: "Dinner" },
      { day: 3, title: "Shimla to Chitkul", description: "Scenic drive through Kinnaur Valley to Chitkul, the last Indian village.", location: "Chitkul", stay: "Standard Camp", meals: "Breakfast & Dinner" },
      { day: 4, title: "Chitkul to Tabo via Nako Lake", description: "Enter Spiti Valley. See Khab confluence and frozen Nako Lake. Reach Tabo.", location: "Tabo", stay: "Spitian Homestay", meals: "Breakfast & Dinner" },
      { day: 5, title: "Explore Tabo and Dhankar Village", description: "Explore 1000-year-old Tabo Monastery and high-altitude Dhankar Gompa.", location: "Dhankar", stay: "Spitian Homestay", meals: "Breakfast & Dinner" },
      { day: 6, title: "Explore Key, Komic, Langza, and Hikkim", description: "Visit Key Monastery, world's highest village Komic, and highest post office Hikkim.", location: "Kaza", stay: "Spitian Homestay", meals: "Breakfast & Dinner" },
      { day: 7, title: "Visit Kibber and Chicham, then Chandra Taal", description: "Cross Chicham Bridge. Drive to the majestic blue crescent Chandratal Lake.", location: "Chandratal", stay: "Lake View Camp", meals: "Breakfast & Dinner" },
      { day: 8, title: "Journey to Manali through the Atal Tunnel", description: "Cross Kunzum Pass and Atal Tunnel. Stay at standard hotel in Manali.", location: "Manali", stay: "Standard Hotel", meals: "Breakfast & Dinner" },
      { day: 9, title: "Explore Manali & Adventure Activities", description: "Trek to Jogini Waterfall. Optional paragliding & rafting in Kullu.", location: "Manali", stay: "Standard Hotel", meals: "Breakfast & Dinner" },
      { day: 10, title: "Reach Jalandhar & Board Return Train", description: "Board overnight return train from Jalandhar/Una.", location: "Train", stay: "Train", meals: "Breakfast" },
      { day: 11, title: "Arrival in Ahmedabad", description: "Arrive back in Ahmedabad with lifetime memories.", location: "Ahmedabad", stay: "None", meals: "None" }
    ],
    highlights: ["Chitkul & Tabo villages", "Dhankar Monastery", "Chandrataal Lake", "Atal Tunnel"]
  },
  {
    title: "Jannat-e-Kashmir",
    price: 22499,
    duration: "9 Nights 10 Days",
    location: "Srinagar, Kashmir",
    category: "leisure",
    description: "Kashmir, often referred to as 'Paradise on Earth,' offers majestic snow-capped mountains, lush green valleys, and serene lakes like the iconic Dal Lake.",
    photosKey: "kashmir",
    itinerary: [
      { day: 1, title: "Arrival in Srinagar & Houseboat Stay", description: "Arrive at Srinagar airport. Check in to premium traditional Houseboat on Dal Lake.", location: "Srinagar", stay: "Premium Houseboat", meals: "Dinner" },
      { day: 2, title: "Srinagar Local Mughal Gardens", description: "Visit Shalimar Bagh, Nishat Bagh, and enjoy a romantic Shikara Ride.", location: "Srinagar", stay: "Premium Houseboat", meals: "Breakfast & Dinner" },
      { day: 3, title: "Day Trip to Sonamarg", description: "Visit Sonamarg (Meadow of Gold) and enjoy horse ride to Thajiwas Glacier.", location: "Sonamarg", stay: "Srinagar Hotel", meals: "Breakfast & Dinner" },
      { day: 4, title: "Day Trip to Gulmarg & Gondola Ride", description: "Visit Gulmarg. Ride the world's highest cable car (Gondola) Phase 1 & 2.", location: "Gulmarg", stay: "Srinagar Hotel", meals: "Breakfast & Dinner" },
      { day: 5, title: "Srinagar to Pahalgam", description: "Drive to Pahalgam (Valley of Shepherds) past beautiful saffron fields.", location: "Pahalgam", stay: "Standard Hotel", meals: "Breakfast & Dinner" },
      { day: 6, title: "Explore Pahalgam - Betaab Valley", description: "Explore Betaab Valley, Aru Valley, and Chandanwari via local union cabs.", location: "Pahalgam", stay: "Standard Hotel", meals: "Breakfast & Dinner" },
      { day: 7, title: "Pahalgam to Srinagar", description: "Drive back to Srinagar. Day free for shopping and local street food.", location: "Srinagar", stay: "Srinagar Hotel", meals: "Breakfast & Dinner" },
      { day: 8, title: "Shopping & Shikara Ride", description: "Enjoy floating market Shikara ride on Dal lake and buy local handicrafts.", location: "Srinagar", stay: "Srinagar Hotel", meals: "Breakfast & Dinner" },
      { day: 9, title: "Departure from Srinagar", description: "Transfer to airport. Fly back home.", location: "Srinagar", stay: "None", meals: "Breakfast" }
    ],
    highlights: ["Dal Lake Houseboat", "Gulmarg Gondola", "Betaab Valley Pahalgam", "Shikara Ride"]
  }
];

async function seed() {
  console.log("🚀 Starting Production High-Fidelity Seeder...");
  
  try {
    for (const trip of HIGH_FIDELITY_TRIPS) {
      const slug = slugify(trip.title, { lower: true, strict: true });
      const photos = DESTINATION_PHOTOS[trip.photosKey];
      
      const tripData = {
        title: trip.title,
        price: Number(trip.price),
        location: trip.location,
        duration: trip.duration,
        description: trip.description,
        category: trip.category,
        heroImage: photos[0],
        images: photos,
        itinerary: trip.itinerary,
        highlights: trip.highlights,
        status: "published",
        isActive: true,
        inclusions: [
          "Double/Triple Sharing Accommodation",
          "All internal road transfers by private vehicles",
          "Group leader & certified local guide support",
          "Meals (Breakfast & Dinner as per sitemap itinerary)",
          "All permit fees, toll taxes, driver allowance, and parking charges"
        ],
        exclusions: [
          "Flights or train tickets to starting city",
          "Meals not mentioned in sitemap itinerary (Lunch)",
          "Entrance tickets to monuments, museums & adventure parks",
          "Personal expenses (laundry, tips, shopping, gear hire)",
          "GST (5%) extra"
        ],
        availableDates: [
          { date: "2026-05-15", capacity: 20 },
          { date: "2026-06-10", capacity: 20 },
          { date: "2026-07-05", capacity: 20 }
        ],
        travelOptions: [
          { label: "Standard Bus/Train", priceDelta: 0 },
          { label: "Semi-Sleeper Volvo", priceDelta: 1500 },
          { label: "AC Sleeper", priceDelta: 2500 }
        ],
        roomOptions: [
          { label: "Quad Sharing", priceDelta: 0 },
          { label: "Triple Sharing", priceDelta: 1200 },
          { label: "Double Sharing", priceDelta: 3000 }
        ]
      };

      await prisma.trip.upsert({
        where: { slug: slug },
        update: tripData,
        create: {
          ...tripData,
          slug: slug
        }
      });
      console.log(`✅ Fully Seeded with premium details & custom photos: ${trip.title}`);
    }

    const dbCount = await prisma.trip.count();
    console.log(`\n🌟 SEEDING COMPLETE! Verified ${dbCount} active trips in database.`);
  } catch (error) {
    console.error("❌ High-Fidelity Seeding Failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();

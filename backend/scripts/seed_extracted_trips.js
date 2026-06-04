const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const TRIPS_TO_SEED = [
  {
    title: "Kerala Getaway 2026 — 5D/4N",
    slug: "kerala-getaway-2026-5d-4n",
    shortName: "Kerala Getaway",
    location: "Kerala",
    price: 15999,
    duration: "5 Days / 4 Nights",
    description: "Backwaters • Waterfalls • Beaches • Hills. Experience the 'God's Own Country' with our curated 5-day journey from the colonial charm of Kochi to the misty hills of Munnar, the wildlife of Thekkady, and the serene backwaters of Alleppey.",
    category: "Backpacking",
    difficulty: "easy",
    status: "published",
    isActive: true,
    heroImage: "https://images.unsplash.com/photo-1602216056096-3c40cc0c9944?auto=format&fit=crop&q=80&w=2000",
    images: [
      "https://images.unsplash.com/photo-1590595906931-81f04f0ccebb?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1593118247619-e2d6f056869e?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&q=80&w=800"
    ],
    route: [
      { label: "Cochin", icon: "plane" },
      { label: "Munnar", icon: "car" },
      { label: "Thekkady", icon: "car" },
      { label: "Alleppey", icon: "car" },
      { label: "Cochin", icon: "car" }
    ],
    highlights: [
      "Valara & Cheeyappara Waterfalls",
      "Spice Plantation Visit in Munnar",
      "Echo Point & Kundala Dam in Munnar",
      "Periyar Lake Cruise & Elephant Ride (Optional) in Thekkady",
      "Traditional Kathakali & Kalaripayattu Show",
      "Houseboat Backwater Experience in Alleppey"
    ],
    inclusions: [
      "Comfortable travel in AC vehicle for all transfers from Cochin",
      "02 Nights stay in Munnar",
      "01 Night stay in Thekkady",
      "01 Night stay in Alleppey",
      "Complete transfers and sightseeing as per itinerary",
      "Daily Breakfast (Day 2 to Day 5)",
      "01 Lunch & 01 Dinner during houseboat stay in Alleppey",
      "All toll charges, parking fees & state taxes included",
      "Professional and experienced driver charges included",
      "Dedicated trip assistance by Team Youthcamping for smooth coordination"
    ],
    exclusions: [
      "05% GST on total billing",
      "Any personal expenses such as shopping, laundry, tips, etc.",
      "Entry tickets for monuments, parks, museums, cruises, jeep safaris, houseboats, or any activities not mentioned in inclusions",
      "Any additional cost due to natural events like landslides, roadblocks, weather conditions, or unforeseen circumstances (to be paid directly on the spot)",
      "Anything not mentioned in the 'Inclusions' section"
    ],
    availableDates: [
      { date: "2026-06-06", capacity: 20 },
      { date: "2026-06-13", capacity: 20 },
      { date: "2026-06-20", capacity: 20 },
      { date: "2026-06-27", capacity: 20 },
      { date: "2026-07-04", capacity: 20 },
      { date: "2026-07-11", capacity: 20 },
      { date: "2026-07-18", capacity: 20 },
      { date: "2026-07-25", capacity: 20 },
      { date: "2026-08-02", capacity: 20 }
    ],
    variants: [
      { location: "Triple Sharing basis", originalPrice: 20999, discountedPrice: 15999 },
      { location: "Double sharing basis", originalPrice: 22999, discountedPrice: 16999 }
    ],
    addons: [
      { name: "House Boat Basic (Shared)", rate: 999, description: "Shared Houseboat experience per person." },
      { name: "House Boat (Private)", rate: 2499, description: "Private boat per person if 3 or more rooms." },
      { name: "Extra Stay Cochin/Trivandram", rate: 999, description: "Additional stay per person." }
    ],
    accommodations: [
      { name: "Standard Munnar Resort", location: "Munnar", nights: "2 Nights" },
      { name: "Thekkady Nature Stay", location: "Thekkady", nights: "1 Night" },
      { name: "Alleppey Lakeview Stay", location: "Alleppey", nights: "1 Night" }
    ],
    popupDetails: {
      carry: [
        { label: "Clothing", val: "Light cottons, 1 Light jacket/hoodie for Munnar, Quick-dry clothes, Flip flops, Raincoat" },
        { label: "Personal Utilities", val: "Sunglasses, Sunscreen, Lip balm, Personal toiletries & medication, Mosquito repellent, Power bank, daypack" }
      ],
      gears: [
        {
          category: "Required Gears",
          items: [
            { item: "Light cotton clothes", price: "Free" },
            { item: "Jacket / Hoodie", price: "Free" },
            { item: "Comfortable walking shoes", price: "Free" },
            { item: "Sun cap & Sunglasses", price: "Free" },
            { item: "Power bank", price: "Free" }
          ]
        }
      ],
      cancellation: [
        { label: "Before 45 days", val: "80% refund" },
        { label: "Before 30 days", val: "50% refund" },
        { label: "Before 15 days", val: "25% refund" },
        { label: "Within 15 days", val: "No refund" },
        { label: "Advance booking", val: "Non-refundable" }
      ],
      terms: [
        "Only people of age 12 to 35 years are allowed",
        "5% GST applicable on all packages",
        "More than 4 persons required to join this trip on custom dates"
      ],
      etiquette: [
        { title: "Guideline", desc: "Respect local culture and customs" },
        { title: "Guideline", desc: "No littering in backwaters or parks" },
        { title: "Guideline", desc: "Follow driver and trip captain instructions" }
      ],
      showRentedGears: true
    },
    faqs: [
      { question: "What is the age limit for this Kerala Trip?", answer: "This trip is designed for young travelers aged between 12 to 35 years." },
      { question: "What type of vehicles are used for transfers?", answer: "We use private AC vehicles like Sedan, SUV or Tempo Traveller depending on the group size." },
      { question: "Is the Houseboat stay private?", answer: "Houseboat stays are on a shared basis by default. A private houseboat can be booked as an optional add-on if you are booking 3 or more rooms." },
      { question: "Are meals included in the package?", answer: "The package includes 4 Breakfasts and 4 Dinners at Munnar/Thekkady hotels, and 1 Lunch + 1 Dinner during the houseboat stay in Alleppey." }
    ],
    itinerary: [
      {
        day: 1,
        title: "Scenic Drive to Munnar",
        description: "Your unforgettable Kerala journey begins with a warm pick-up from Ernakulam Railway Station (9:00 AM) or Cochin Airport (10:00 AM). Enjoy a breathtaking drive to Munnar through lush green hills and misty landscapes. On the way, witness the beauty of the stunning Valara & Cheeyappara Waterfalls and explore aromatic Spice Plantations, where Kerala’s famous spices are grown. Arrive in Munnar and check in to your comfortable hotel. Relax, enjoy a delicious dinner, and unwind in the peaceful mountain atmosphere.",
        stay: "Hotel in Munnar",
        meals: "Dinner Included"
      },
      {
        day: 2,
        title: "Explore the Beauty of Munnar",
        description: "Wake up to a refreshing morning and enjoy a delicious breakfast at the hotel. Today, explore the scenic highlights of Munnar, including the peaceful Mattupetty Dam, the magical Echo Point, and the picturesque Kundala Dam surrounded by lush mountains. Visit the famous Eravikulam National Park (subject to government guidelines), home to breathtaking views and rare wildlife. Also explore the vibrant Rose Garden and enjoy some free time for local shopping and café hopping. Return to the hotel, relax, and soak in the serene mountain vibes.",
        stay: "Hotel in Munnar",
        meals: "Breakfast & Dinner Included"
      },
      {
        day: 3,
        title: "Thekkady – Wildlife & Cultural Experience",
        description: "Start your day with breakfast and check out by 8:00 AM, then enjoy a scenic drive to Thekkady, home to Kerala’s famous wildlife sanctuary. In the afternoon, you can experience the peaceful Periyar Lake cruise (optional, direct payment), where you may spot elephants, deer, wild boar, and other wildlife in their natural habitat. You can also enjoy an elephant interaction experience at Periyar. In the evening, witness Kerala’s rich traditions with the mesmerizing Kalaripayattu martial arts and Kathakali cultural show. Check in to your hotel, enjoy dinner, and relax.",
        stay: "Hotel stay in Thekkady",
        meals: "Breakfast & Dinner Included"
      },
      {
        day: 4,
        title: "Thekkady to Alleppey – Backwater Paradise",
        description: "After breakfast, check out and proceed to Alleppey, known as the 'Venice of the East.' Experience the beauty of Kerala’s famous backwaters with an optional Shikara or Houseboat ride (direct payment). Cruise through peaceful canals surrounded by coconut trees, villages, and scenic landscapes — truly a once-in-a-lifetime experience. Check in and relax for the evening. Enjoy a delicious dinner and unwind.",
        stay: "Hotel/Houseboat Alleppey",
        meals: "Breakfast & Dinner Included"
      },
      {
        day: 5,
        title: "Alleppey to Cochin",
        description: "Wake up and enjoy breakfast at the houseboat/hotel. Check-out from hotel/houseboat and drive back to Cochin. Drop off at Ernakulam Railway Station or Cochin Airport. Your Kerala trip concludes here with sweet memories.",
        stay: "",
        meals: "Breakfast Included"
      }
    ],
    stickyCardPrice: 15999,
    stickyCardLabel: "per person"
  },
  {
    title: "Manali Kasol Amritsar Backpacking Trip — 9D/8N",
    slug: "manali-kasol-amritsar-backpacking-trip-9d-8n",
    shortName: "Manali Kasol Amritsar",
    location: "Himachal & Punjab",
    price: 11999,
    duration: "9 Days / 8 Nights",
    description: "Mountains • Camps • Culture • Adventure. The ultimate Himachal backpacking adventure. Camp along the Parvati River, trek to Bijli Mahadev and Jogini Waterfalls, cross the Atal Tunnel to explore Sissu, and visit the Golden Temple & Wagah Border in Amritsar.",
    category: "Backpacking",
    difficulty: "moderate",
    status: "published",
    isActive: true,
    heroImage: "https://images.unsplash.com/photo-1544735716-392fe2709496?auto=format&fit=crop&q=80&w=2000",
    images: [
      "https://images.unsplash.com/photo-1582239014603-7b3b7548d80c?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1597037750734-450f6f406560?auto=format&fit=crop&q=80&w=800"
    ],
    route: [
      { label: "Ahmedabad", icon: "train" },
      { label: "Amritsar", icon: "car" },
      { label: "Kasol", icon: "car" },
      { label: "Kullu", icon: "car" },
      { label: "Manali", icon: "car" },
      { label: "Ahmedabad", icon: "train" }
    ],
    highlights: [
      "Wagah Border Indo-Pak Ceremony",
      "Golden Temple Sightseeing",
      "Riverside Camping in Kasol",
      "Bijli Mahadev & Jogini Waterfall Trek",
      "White Water Rafting & Rope Adventures in Kullu",
      "Atal Tunnel, Solang Valley & Sissu Lake"
    ],
    inclusions: [
      "All transfers by Tempo Traveller",
      "Round trip sleeper class train tickets (subject to availability)",
      "2 Nights stay at Manali hotel/Cottage, 1 Night stay at Kullu Campsite, 1 Night stay at Kasol Campsite/Cottage in 4 Sharing",
      "Bonfire, Music Party",
      "Rope Adventure Activities & Trekking",
      "5 Breakfast, 5 Lunch & 4 Dinner",
      "Trip Captain",
      "Rafting & Activities Burma Bridge, Balanced Bridge, Rock Climbing",
      "Sightseeing & 'Dher Saari Masti'",
      "Toll, Parking and Transport Taxes"
    ],
    exclusions: [
      "Personal Expenses",
      "5% GST on billing",
      "Any cost arising due to natural calamities like landslides, road blocks etc. to be borne by the client directly on the spot",
      "Paragliding, Heater Charges, Tips, Pony Rides, Entry fee, snow suit rent, adventure activities at solang valley, 4*4 Vehicle",
      "Personal Expense of any kind, anything not specifically mentioned under the head 'Includes'",
      "Guide during train journey",
      "Any additional meals or stays other than mentioned in itinerary"
    ],
    availableDates: [
      { date: "2026-05-02", capacity: 20 }, { date: "2026-05-09", capacity: 20 }, { date: "2026-05-17", capacity: 20 }, { date: "2026-05-23", capacity: 20 }, { date: "2026-05-30", capacity: 20 },
      { date: "2026-06-06", capacity: 20 }, { date: "2026-06-13", capacity: 20 }, { date: "2026-06-20", capacity: 20 }, { date: "2026-06-27", capacity: 20 },
      { date: "2026-07-04", capacity: 20 }, { date: "2026-07-11", capacity: 20 }, { date: "2026-07-18", capacity: 20 }, { date: "2026-07-25", capacity: 20 },
      { date: "2026-08-02", capacity: 20 }, { date: "2026-08-09", capacity: 20 }, { date: "2026-08-17", capacity: 20 }, { date: "2026-08-23", capacity: 20 }, { date: "2026-08-30", capacity: 20 },
      { date: "2026-09-06", capacity: 20 }, { date: "2026-09-13", capacity: 20 }, { date: "2026-09-20", capacity: 20 }, { date: "2026-09-27", capacity: 20 },
      { date: "2026-10-04", capacity: 20 }, { date: "2026-10-11", capacity: 20 }, { date: "2026-10-18", capacity: 20 }, { date: "2026-10-25", capacity: 20 }
    ],
    variants: [
      { location: "From Jalandhar (4 Sharing)", originalPrice: 15999, discountedPrice: 11999 },
      { location: "From Ahmedabad Sleeper Train (4 Sharing)", originalPrice: 17999, discountedPrice: 12999 },
      { location: "From Vadodara/Surat Sleeper (4 Sharing)", originalPrice: 18499, discountedPrice: 13499 },
      { location: "From Mumbai Sleeper Train (4 Sharing)", originalPrice: 18999, discountedPrice: 13999 },
      { location: "From Ahmedabad 3Tier AC Train (4 Sharing)", originalPrice: 20999, discountedPrice: 14999 },
      { location: "Delhi to Delhi (Without Amritsar) (4 Sharing)", originalPrice: 19999, discountedPrice: 14999 }
    ],
    addons: [
      { name: "Double sharing upgrade", rate: 1999, description: "Per person additional for double room sharing." }
    ],
    accommodations: [
      { name: "Kasol Riverside Camps", location: "Kasol", nights: "1 Night" },
      { name: "Kullu Adventure Camps", location: "Kullu", nights: "1 Night" },
      { name: "Manali Cottage/Hotel", location: "Manali", nights: "2 Nights" }
    ],
    popupDetails: {
      carry: [
        { label: "Clothing", val: "Thermal inners, winter cap, woolen sweater, gloves, raincoat, hat/cap" },
        { label: "Toiletries", val: "Moisturizer, lip balm, sunscreen, government ID, power bank, sanitizer" }
      ],
      gears: [
        {
          category: "Required Gears",
          items: [
            { item: "Thermal Inner & Sweaters", price: "Free" },
            { item: "Winter gloves & cap", price: "Free" },
            { item: "Trekking shoes with socks", price: "Free" },
            { item: "Raincoat / Poncho", price: "Free" },
            { item: "Rucksack and power bank", price: "Free" }
          ]
        }
      ],
      cancellation: [
        { label: "Before 45 days", val: "80% refund" },
        { label: "Before 30 days", val: "50% refund" },
        { label: "Before 15 days", val: "25% refund" },
        { label: "Within 15 days", val: "No refund" },
        { label: "Advance booking amount", val: "Non-refundable" }
      ],
      terms: [
        "Only people of age 12 to 35 years are allowed",
        "5% GST applicable on all packages",
        "Train tickets are subject to availability. Book 40-50 days in advance."
      ],
      etiquette: [
        { title: "Cleanliness", desc: "Do not throw plastic or garbage on treks." },
        { title: "Coordination", desc: "Follow the guidelines and timings of the Trip Captain." }
      ],
      showRentedGears: true
    },
    faqs: [
      { question: "What is the group size for the Himachal Tour?", answer: "Usually, the group consists of 15 to 30 travelers to maintain community vibes and safety." },
      { question: "Is the Wagah Border parade ceremony guaranteed?", answer: "Wagah Border is included if traveling by Janmabhoomi Express. If traveling by Jammu Tawi, the ceremony might be missed due to timings." },
      { question: "Are adventure activities like Rafting safe?", answer: "Yes, river rafting is performed by certified local experts. We include a complimentary 8KM rafting session (subject to weather)." },
      { question: "Is this trip safe for solo female travelers?", answer: "Absolutely! We ensure safety first and separate rooms/tents are allocated for female travelers." }
    ],
    itinerary: [
      {
        day: 1,
        title: "Train Journey to Jalandhar",
        description: "Meet the YC representative at the railway station in the morning. His/Her contact details will be shared on WhatsApp one day before departure. Board the train and start your journey with group introductions and ice-breaking games.",
        stay: "Overnight in Train",
        meals: ""
      },
      {
        day: 2,
        title: "Visit Wagha Border & Golden Temple",
        description: "Arrive at Jalandhar/Amritsar. Drive to Wagah Border to witness the Indo-Pak historic Ceremonial Parade (If it's closed, we'll visit Jallianwala Bagh). In the evening, explore the divine Golden Temple and shop at the local Amritsar market. Board the vehicle for an overnight drive to Kasol.",
        stay: "Overnight travel",
        meals: ""
      },
      {
        day: 3,
        title: "Kasol & Parvati valley Exploration",
        description: "Reach the Kasol Campsite by 11:00 AM, check in, have breakfast, and relax. In the afternoon, start a scenic 2-hour hike to Chalal Village along the Parvati River. In the evening, visit Manikaran Gurudwara and the local Kasol market. Unwind at the campsite with a bonfire, music, and group games.",
        stay: "Camping/cottage in Kasol",
        meals: "Breakfast, Lunch, Dinner Included"
      },
      {
        day: 4,
        title: "Bijli Mahadev Trek",
        description: "After an early breakfast, check out and drive to the starting point of the Bijli Mahadev Trek. Trek up with a daypack to witness a stunning 360-degree view of the snow-clad Himalayas. After the trek, drive to Kullu. Check in at the Swiss camps, enjoy dinner and a bonfire.",
        stay: "Swiss Camp in Kullu",
        meals: "Breakfast, Lunch, Dinner Included"
      },
      {
        day: 5,
        title: "Kullu Adventure Activities & Transfer to Manali",
        description: "Fuel up with breakfast. Engage in camp adventure activities like Burma Bridge and Rock Climbing. Visit the paragliding point (optional, self-paid) and enjoy a thrilling 8KM white water rafting session (included). Visit the Kullu Shawl Factory, then drive to Manali. Check in to the hotel/cottage.",
        stay: "Hotel or Cottages in Manali",
        meals: "Breakfast, Lunch, Dinner Included"
      },
      {
        day: 6,
        title: "Solang Valley - Atal Tunnel - Sissu",
        description: "Depart early for Solang Valley. Enjoy snow activities and explore Solang. Cross the legendary Atal Tunnel to reach Sissu Lake in Lahaul Valley. Option to rent a bike for a scenic ride. Drive back to Manali for dinner and a warm cottage stay. Note: Sissu/Atal tunnel routes can be closed in heavy snow.",
        stay: "Hotel or Cottages in Manali",
        meals: "Breakfast, Lunch, Dinner Included"
      },
      {
        day: 7,
        title: "Manali Sightseeing & Jogini Waterfall Trek",
        description: "Have breakfast, check out, and head to Vashisht village. Begin the trek to the gorgeous 160-foot Jogini Waterfall. Later, explore Mall Road, Hadimba Temple, and Old Manali. Enjoy dinner, then board the vehicle for a night drive back to Una/Jalandhar.",
        stay: "Overnight travel",
        meals: "Breakfast & Lunch Included"
      },
      {
        day: 8,
        title: "Return Train Journey to Your City",
        description: "Reach Jalandhar/Una. Board the return train back to Ahmedabad/your city. Relax, play group games, and share photos with new friends during the journey.",
        stay: "Overnight in Train",
        meals: ""
      },
      {
        day: 9,
        title: "Arrive at Your City",
        description: "Arrive back in your home city. The memorable and adventurous trip concludes here with a bag full of stories and lifelong friendships.",
        stay: "",
        meals: ""
      }
    ],
    stickyCardPrice: 11999,
    stickyCardLabel: "per person"
  },
  {
    title: "Leh Ladakh Bike Trip with Turtuk — 7D/6N",
    slug: "leh-ladakh-bike-trip-with-turtuk-7d-6n",
    shortName: "Leh Ladakh Bike Expedition 2026",
    location: "Ladakh",
    price: 19999,
    duration: "7 Days / 6 Nights",
    description: "High Passes • Double-Humped Camels • Last Indian Village. A classic Ladakh bike journey. Ride through the highest motorable road at Khardung La (18,380 ft), visit the desert sand dunes of Hunder in Nubra, drive to Turtuk on the Baltistan border, and gaze at the blue waters of Pangong Lake.",
    category: "Bike Expedition",
    difficulty: "hard",
    status: "published",
    isActive: true,
    heroImage: "https://images.unsplash.com/photo-1597037750734-450f6f406560?auto=format&fit=crop&q=80&w=2000",
    images: [
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1544735716-392fe2709496?auto=format&fit=crop&q=80&w=800"
    ],
    route: [
      { label: "Leh", icon: "plane" },
      { label: "Nubra Valley", icon: "car" },
      { label: "Turtuk", icon: "car" },
      { label: "Pangong Lake", icon: "car" },
      { label: "Leh", icon: "car" }
    ],
    highlights: [
      "Confluence of Indus & Zanskar (Sangam)",
      "Magnetic Hill & Gurudwara Pathar Sahib",
      "Khardung La Pass (18,380 ft)",
      "Maitreya Buddha & Diskit Monastery",
      "Balti Village Exploration at Turtuk",
      "Sunset and stargazing at Pangong Lake",
      "Chang La Pass (17,800 ft)"
    ],
    inclusions: [
      "Accommodations for 06 Nights in Hotels along with Camps/Cottages and Homestays on Triple/Quad sharing Basis",
      "All meals mentioned in the itinerary (6 Breakfast & 6 Dinner)",
      "Bike Rent for 5 Days (Leh to Leh) (Himalayan 411 CC)",
      "Fuel for the bike as per itinerary",
      "Mechanical & Luggage Backup vehicle (MUV/Traveler/Bolero Camper)",
      "24X7 customer support by trip captain",
      "All inner line permits for the trip",
      "Riding Jacket, Helmet, Gloves, and Knee Pads",
      "First aid kit & Oxygen Cylinder in backup vehicle",
      "Complementary Bonfire Night",
      "Group Pickup and Drop Facilities from Leh Airport",
      "RE mechanic with spare parts enroute"
    ],
    exclusions: [
      "5% GST",
      "Early check-in at the hotel",
      "Any personal expenses or shopping",
      "Additional accommodation/food costs incurred due to travel delays",
      "Cost Of Any Spare Part used due to accidental damage when bike is with rider",
      "Cost to transfer or tow bike if dropped on the way",
      "Vehicle servicing or maintenance cost",
      "Any lunch and other meals not mentioned in inclusions",
      "Airfare / Rail fare to Leh",
      "Parking and monument entry fees during sightseeing",
      "Additional Costs due to Flight Cancellations, Landslides, Roadblocks, and natural calamities"
    ],
    availableDates: [
      { date: "2026-05-09", capacity: 15 }, { date: "2026-05-23", capacity: 15 },
      { date: "2026-06-06", capacity: 15 }, { date: "2026-06-20", capacity: 15 },
      { date: "2026-07-04", capacity: 15 }, { date: "2026-07-18", capacity: 15 },
      { date: "2026-08-04", capacity: 15 }, { date: "2026-08-18", capacity: 15 },
      { date: "2026-09-05", capacity: 15 }, { date: "2026-09-26", capacity: 15 }
    ],
    variants: [
      { location: "RE Himalayan (Solo Rider)", originalPrice: 29999, discountedPrice: 24999 },
      { location: "RE Himalayan (With Pillion)", originalPrice: 24999, discountedPrice: 19999 }
    ],
    addons: [
      { name: "Double Sharing Upgrade", rate: 2500, description: "Upgrade to double sharing room for the entire trip." }
    ],
    accommodations: [
      { name: "Standard Leh Hotel", location: "Leh", nights: "3 Nights" },
      { name: "Nubra Valley Camps", location: "Nubra Valley", nights: "2 Nights" },
      { name: "Pangong Lakeside Camps", location: "Pangong Lake", nights: "1 Night" }
    ],
    popupDetails: {
      carry: [
        { label: "Clothing", val: "Thermal inners, heavy winter jacket, woolen sweater, gloves, raincoat, woolen socks" },
        { label: "Essentials", val: "Sunglasses (UV protected), sunscreen SPF 50+, lip balm, personal medication, power bank" }
      ],
      gears: [
        {
          category: "Provided Riding Gears",
          items: [
            { item: "Riding Jacket", price: "Free" },
            { item: "Helmet", price: "Free" },
            { item: "Knee Pads & Gloves", price: "Free" },
            { item: "RE Himalayan Bike & Fuel", price: "Included" }
          ]
        }
      ],
      cancellation: [
        { label: "Before 45 days", val: "80% refund" },
        { label: "Before 30 days", val: "50% refund" },
        { label: "Before 15 days", val: "25% refund" },
        { label: "Within 15 days", val: "No refund" },
        { label: "Advance booking amount", val: "Non-refundable" }
      ],
      terms: [
        "Only people of age 12 to 35 years are allowed",
        "5% GST applicable on all packages",
        "Any accidental damage cost to the bike is to be borne by the rider directly."
      ],
      etiquette: [
        { title: "Acclimatization", desc: "Strictly rest on Day 1 to avoid AMS." },
        { title: "Eco-ride", desc: "Do not throw litter or plastic bottles near the lakes." }
      ],
      showRentedGears: true
    },
    faqs: [
      { question: "Why is the first day strictly for acclimatization?", answer: "Leh is located at 11,500 ft. Adapting to the high altitude is crucial to prevent Acute Mountain Sickness (AMS). Rest, hydration, and minimal activity on Day 1 are mandatory." },
      { question: "Is fuel included in the package?", answer: "Yes, fuel for the bike as per the standard itinerary is included in the package." },
      { question: "Do you provide medical support?", answer: "Yes, we carry a first aid kit and have an oxygen cylinder available in our backup vehicle 24/7." },
      { question: "Is there electricity at Nubra and Pangong Camps?", answer: "Due to the remote location and high altitude, electricity at Nubra and Pangong camps is only available for a few hours (usually 7 PM to 11 PM)." }
    ],
    itinerary: [
      {
        day: 1,
        title: "Leh Arrival - Acclimatization Day",
        description: "Welcome to The Land Of High Passes! The group will assemble at the Leh Airport. From here, a designated vehicle will drop you at your hotel. Check in and relax to adapt to the high altitude. Rest and stay hydrated, avoiding heavy physical activity. In the evening, attend a trip briefing by the trip captain. Note: The pickup timings are 9:00 AM to 12:00 PM.",
        stay: "Hotel stay in Leh",
        meals: "Dinner Included"
      },
      {
        day: 2,
        title: "Leh Local Sightseeing (50-60 KMS)",
        description: "Post breakfast, participate in the bike briefing and trial session. Ride towards Sangam, the scenic confluence of the Indus and Zanskar rivers. Visit Gurudwara Pathar Sahib, explore the optical illusion at Magnetic Hill, visit the historic Hall of Fame, and catch the sunset at Shanti Stupa. Spend the evening shopping or cafe hopping at Leh Market.",
        stay: "Hotel stay in Leh",
        meals: "Breakfast & Dinner Included"
      },
      {
        day: 3,
        title: "Leh to Nubra Valley (130 KMS)",
        description: "Start early and ride via the legendary Khardung La Pass (18,380 ft) — one of the highest motorable passes in the world. Reach Diskit Monastery and see the giant 106-foot Maitreya Buddha statue. Ride down to Hunder Sand Dunes, famous for its cold desert and double-humped Bactrian camels (optional ride). Check in to Nubra Valley camps.",
        stay: "Camp stay in Nubra valley",
        meals: "Breakfast & Dinner Included"
      },
      {
        day: 4,
        title: "Nubra to Turtuk (170 KMS)",
        description: "Embark on an epic ride to Turtuk, the last village on the Indo-Pak border in the Baltistan region. Ride along the Shyok River and walk through the scenic apricot orchards of this Balti village. Visit the Balti Museum and learn about its history. Ride back to Nubra Valley by evening.",
        stay: "Camp stay in Nubra valley",
        meals: "Breakfast & Dinner Included"
      },
      {
        day: 5,
        title: "Nubra Valley to Pangong (180 KMS)",
        description: "Check out and ride towards Pangong Tso via the Shyok route, enjoying scenic mountain streams and raw landscapes. Reach Pangong Lake and marvel at the changing colors of the high-altitude lake. Capture the sunset and enjoy a quiet stargazing night. Note: Camps do not have electricity at night.",
        stay: "Camp stay near Pangong",
        meals: "Breakfast & Dinner Included"
      },
      {
        day: 6,
        title: "Pangong to Leh (150 KMS)",
        description: "Wake up to a freezing morning by the lake. Check out and ride back to Leh via the Chang La Pass (17,800 ft). On the way back, visit Shey Palace and the majestic Thiksey Monastery (subject to time). Arrive in Leh and enjoy a final group dinner.",
        stay: "Hotel stay in Leh",
        meals: "Breakfast & Dinner Included"
      },
      {
        day: 7,
        title: "Departure to Leh Airport | Tour Ends",
        description: "Have a final breakfast with the group. Check out and get dropped at Leh Airport (fixed drop off at 9:00 AM). Bid goodbye to the Himalayas and return to your home cities with unforgettable stories.",
        stay: "",
        meals: "Breakfast Included"
      }
    ],
    stickyCardPrice: 19999,
    stickyCardLabel: "per person"
  },
  {
    title: "Spiti Valley Full Circuit from Ahmedabad — 11D/10N",
    slug: "spiti-valley-full-circuit-from-ahmedabad-11d-10n",
    shortName: "Spiti Valley Road Trip",
    location: "Spiti Valley",
    price: 19999,
    duration: "11 Days / 10 Nights",
    description: "Desert Mountains • High Altitude Pass • Moon Lake. The ultimate Spiti Valley road trip starting from Ahmedabad. Traverse through Kinnaur Valley, visit Chitkul (the last village of India), cross the Kunzum Pass, camp at Chandratal Moon Lake, and cross the Atal Tunnel to Manali.",
    category: "Road Trip",
    difficulty: "hard",
    status: "published",
    isActive: true,
    heroImage: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&q=80&w=2000",
    images: [
      "https://images.unsplash.com/photo-1544735716-392fe2709496?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1597037750734-450f6f406560?auto=format&fit=crop&q=80&w=800"
    ],
    route: [
      { label: "Ahmedabad", icon: "train" },
      { label: "Shimla", icon: "car" },
      { label: "Chitkul", icon: "car" },
      { label: "Tabo", icon: "car" },
      { label: "Kaza", icon: "car" },
      { label: "Chandratal", icon: "car" },
      { label: "Manali", icon: "car" },
      { label: "Ahmedabad", icon: "train" }
    ],
    highlights: [
      "Shimla Mall Road & Souvenir Shopping",
      "Chitkul - Last Indo-Tibetan Border Village",
      "Khab Confluence of Spiti & Sutlej Rivers",
      "Nako Lake & 1000-Year-Old Tabo Monastery",
      "Dhankar Cliffside Village & Gompa",
      "Key Monastery & Chicham Suspension Bridge",
      "Komic (15,050 ft) & Hikkim Post Office (14,400 ft)",
      "Chandra Taal Moon Lake Camping"
    ],
    inclusions: [
      "All transfers by Tempo Traveller/Taxi from Chandigarh",
      "Round trip train tickets from Ahmedabad",
      "Comfortable stays in hotel/tents/Homestays on 3 & 4 sharing basis",
      "Bonfire and Music Party at Manali",
      "Trekking in Himalayas",
      "7 Breakfast & 6 Dinner (Pure Veg) as per itinerary",
      "All sightseeing as mentioned in the itinerary",
      "Expert Trip Captain throughout the journey",
      "Toll, Parking, and Transport Taxes",
      "Oxygen cylinder support with pulse oximeter"
    ],
    exclusions: [
      "Personal Expenses",
      "5% GST",
      "Any additional costs due to natural events like landslides or roadblocks",
      "Paragliding, paragliding suit, heater charges, monument entry fees",
      "Adventure activities at Solang Valley, 4x4 vehicle charges",
      "Any additional meals or stays outside the package"
    ],
    availableDates: [
      { date: "2026-06-02", capacity: 20 }, { date: "2026-06-09", capacity: 20 }, { date: "2026-06-16", capacity: 20 }, { date: "2026-06-23", capacity: 20 }, { date: "2026-06-30", capacity: 20 },
      { date: "2026-07-07", capacity: 20 }, { date: "2026-07-14", capacity: 20 }, { date: "2026-07-21", capacity: 20 }, { date: "2026-07-28", capacity: 20 },
      { date: "2026-08-04", capacity: 20 }, { date: "2026-08-11", capacity: 20 }, { date: "2026-08-18", capacity: 20 }, { date: "2026-08-25", capacity: 20 },
      { date: "2026-09-01", capacity: 20 }, { date: "2026-09-08", capacity: 20 }, { date: "2026-09-15", capacity: 20 }, { date: "2026-09-22", capacity: 20 }, { date: "2026-09-29", capacity: 20 }
    ],
    variants: [
      { location: "From Jalandhar/Chandigarh (4 Sharing)", originalPrice: 23999, discountedPrice: 19999 },
      { location: "From Ahmedabad Sleeper Train (4 Sharing)", originalPrice: 26499, discountedPrice: 21499 },
      { location: "From Ahmedabad 3Tier AC Train (4 Sharing)", originalPrice: 28499, discountedPrice: 23499 }
    ],
    addons: [
      { name: "Double Sharing Upgrade", rate: 3000, description: "Upgrade to double sharing stay (excludes Chandratal stay)." }
    ],
    accommodations: [
      { name: "Shimla Standard Hotel", location: "Shimla", nights: "1 Night" },
      { name: "Chitkul Huts/Cottage", location: "Chitkul", nights: "1 Night" },
      { name: "Tabo Traditional Homestay", location: "Tabo", nights: "1 Night" },
      { name: "Kaza Local Homestay", location: "Kaza", nights: "2 Nights" },
      { name: "Chandratal Lakeside Camps", location: "Chandratal", nights: "1 Night" },
      { name: "Manali Cottage/Hotel", location: "Manali", nights: "1 Night" }
    ],
    popupDetails: {
      carry: [
        { label: "Clothing", val: "Heavy woollens, thermal innerwear, windbreaker jacket, gloves, warm socks" },
        { label: "Sanitary", val: "Cold cream, SPF 50+ sunscreen, lip balm, personal toiletries & medications" }
      ],
      gears: [
        {
          category: "Required Gears",
          items: [
            { item: "Rucksack / main travel bag", price: "Free" },
            { item: "Heavy winter jacket & thermals", price: "Free" },
            { item: "UV protected sunglasses", price: "Free" },
            { item: "Power bank", price: "Free" }
          ]
        }
      ],
      cancellation: [
        { label: "Before 45 days", val: "80% refund" },
        { label: "Before 30 days", val: "50% refund" },
        { label: "Before 15 days", val: "25% refund" },
        { label: "Within 15 days", val: "No refund" },
        { label: "Booking fee", val: "Non-refundable" }
      ],
      terms: [
        "Only people of age 12 to 35 years are allowed",
        "5% GST applicable on all packages",
        "Chandratal Lake visit in June is subject to weather and BRO road clearance."
      ],
      etiquette: [
        { title: "Conservation", desc: "Spiti is a cold desert. Conserve water and do not litter." },
        { title: "Culture", desc: "Respect monastery rules. Remove shoes and seek permission for photos." }
      ],
      showRentedGears: true
    },
    faqs: [
      { question: "What happens if Chandratal Lake is closed?", answer: "Chandra Taal usually opens by late Mid June. If inaccessible due to snow, we alter the route to stay in Kaza or explore Kalpa and the beautiful Kinnaur region instead." },
      { question: "Is the train ticket included in the price?", answer: "Yes, the AC and Sleeper train packages from Ahmedabad include round-trip train tickets." },
      { question: "Are medical facilities available in Spiti?", answer: "Spiti is very remote. Basic medical stores are in Kaza. We carry a first aid kit and an oxygen cylinder in the backup vehicle for emergencies." },
      { question: "Are electricity and network available in Spiti?", answer: "Electricity is intermittent. Only BSNL and Jio work in Kaza. Network is mostly absent in other parts like Chitkul, Tabo, and Chandratal." }
    ],
    itinerary: [
      {
        day: 1,
        title: "Train Journey Ahmedabad to Chandigarh/Jalandhar",
        description: "Kickstart your adventure with an overnight train journey from Ahmedabad to Chandigarh/Jalandhar, passing through Gujarat, Rajasthan, and Haryana. Enjoy scenic views, bond with fellow travelers through fun activities, and soak in the local flavors. Please note that if you have a connecting train from any station in Ahmedabad or Gandhinagar to Surat, Baroda, Mumbai, or Pune, inter-station transfers are not included.",
        stay: "Overnight in Train",
        meals: ""
      },
      {
        day: 2,
        title: "Drive to Shimla/Narkanda",
        description: "Arrive at Chandigarh railway station at 8:00 AM or Jalandhar. Board the traveler/taxi and drive towards Shimla. If time permits, stroll through Shimla's famous Mall Road and check in at the hotel for dinner and rest.",
        stay: "Hotel in Shimla",
        meals: "Dinner Included"
      },
      {
        day: 3,
        title: "Shimla to Chitkul - The Ultimate Road Trip",
        description: "Depart early from Shimla and drive through the stunning Kinnaur Valley. Journey along the Sutlej River and reach Chitkul, the last inhabited village on the old Indo-Tibetan trade route. Check in to the wooden huts/cottages.",
        stay: "Cottage in Chitkul/Sangla",
        meals: "Breakfast, Dinner Included"
      },
      {
        day: 4,
        title: "Chitkul to Tabo via Nako Lake",
        description: "Depart Chitkul and drive along the India-Tibet border. Witness Khab, the scenic confluence of the Spiti & Sutlej rivers. Stop by the high-altitude Nako Lake, then proceed to Tabo village. Check in at a local homestay.",
        stay: "Homestay in Tabo",
        meals: "Breakfast, Dinner Included"
      },
      {
        day: 5,
        title: "Explore Tabo and Dhankar Village",
        description: "Visit the legendary 1000-year-old Tabo Monastery, famous for its clay statues and ancient wall murals. Catch a panoramic 360-degree sky view of the desert mountains. Drive to Dhankar Village and see the cliffside Dhankar Gompa. Reach Kaza by evening and check in to the homestay.",
        stay: "Homestay in Kaza",
        meals: "Breakfast, Dinner Included"
      },
      {
        day: 6,
        title: "Key, Komic, Langza, and Hikkim in a day",
        description: "Explore Key Monastery, the largest spiritual center in Spiti Valley. Drive to Komic, the highest motorable village in the world (15,050 ft), and visit Komic Gompa. See the giant Buddha statue overlooking the valley at Langza (14,300 ft) and search for marine fossils. Send a postcard to your family from the highest post office in the world at Hikkim (14,400 ft).",
        stay: "Homestay in Kaza",
        meals: "Breakfast, Dinner Included"
      },
      {
        day: 7,
        title: "Visit Kibber, Chicham Bridge & drive to Chandra Taal",
        description: "Check out and drive to Kibber village. Cross the spectacular Chicham Bridge, the highest bridge in Asia, suspended over a deep gorge. Drive to Chandra Taal, the mesmerizing crescent-shaped Moon Lake. Check in to the campsite and enjoy the chilly night under the stars.",
        stay: "Chandrataal Camps",
        meals: "Breakfast, Dinner Included"
      },
      {
        day: 8,
        title: "Chandra Taal to Manali via Atal Tunnel",
        description: "Wake up early and walk to the breathtaking Chandra Taal Lake. Drive towards Manali via the rough and adventurous gravel road through Chhatru. Cross the famous engineering marvel, the Atal Tunnel, and reach Manali. Check in to your cottage.",
        stay: "Cottages in Manali",
        meals: "Breakfast, Dinner Included"
      },
      {
        day: 9,
        title: "Explore Manali & Adventure Activities",
        description: "Enjoy a day of thrill with paragliding or river rafting (optional, self-paid) in Manali. Explore Hadimba Devi Temple, walk along Mall Road, and experience the cafes in Old Manali. Board the evening vehicle for an overnight drive to Jalandhar/Chandigarh.",
        stay: "Overnight travel",
        meals: "Breakfast Included"
      },
      {
        day: 10,
        title: "Board the Return Train",
        description: "Arrive at Jalandhar/Chandigarh and board the return train to Ahmedabad. Relive the trip memories with your group through games and stories.",
        stay: "Overnight in Train",
        meals: ""
      },
      {
        day: 11,
        title: "Arrival in Ahmedabad",
        description: "Arrive back in Ahmedabad. The epic 11-day Spiti Valley full circuit concludes with unforgettable memories and close bonds.",
        stay: "",
        meals: ""
      }
    ],
    stickyCardPrice: 19999,
    stickyCardLabel: "per person"
  },
  {
    title: "Manali Kasol Amritsar with Bhrigu Lake Trek — 9D/8N",
    slug: "manali-kasol-amritsar-with-bhrigu-lake-trek-9d-8n",
    shortName: "Experience Bhrigu Lake Trek with Manali, Kasol & Amritsar",
    location: "Himachal & Punjab",
    price: 11999,
    duration: "9 Days / 8 Nights",
    description: "Trekking • Alpine Lakes • Parvati Valley • Heritage. Combine a thrilling high-altitude alpine lake trek to Bhrigu Lake (14,300 ft) with riverside camping in Kasol and sightseeing in Amritsar. Visit the Wagah Border and Golden Temple.",
    category: "Trekking",
    difficulty: "moderate",
    status: "published",
    isActive: true,
    heroImage: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&q=80&w=2000",
    images: [
      "https://images.unsplash.com/photo-1582239014603-7b3b7548d80c?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1544735716-392fe2709496?auto=format&fit=crop&q=80&w=800"
    ],
    route: [
      { label: "Ahmedabad", icon: "train" },
      { label: "Amritsar", icon: "car" },
      { label: "Kasol", icon: "car" },
      { label: "Bhrigu Lake", icon: "hiking" },
      { label: "Manali", icon: "car" },
      { label: "Ahmedabad", icon: "train" }
    ],
    highlights: [
      "Golden Temple & Wagah Border Ceremony",
      "Riverside Camp Stay at Kasol",
      "Chalal Village Scenic Hike",
      "Bhrigu Lake Alpine Trek (14,300 ft)",
      "High Altitude Base Camp Stay (10,000 ft)",
      "White Water Rafting & Paragliding in Kullu"
    ],
    inclusions: [
      "All transfers by Tempo Traveller from Jalandhar",
      "Round trip train tickets (subject to availability) from Ahmedabad",
      "1 Night stay at Kasol, 1 Night stay at Manali Hotel, 2 Nights stay at Bhrigu Lake base Camp",
      "Bonfire and Music Party at Kasol & Kullu",
      "Trekking in Himalayas with certified guides",
      "5 Breakfast, 5 Lunch & 5 Dinner (1 Dinner at Golden Temple langar which is free)",
      "Trip Captain and Trek Guides",
      "Rafting and group games",
      "Toll, Parking, and Transport Taxes"
    ],
    exclusions: [
      "Personal Expenses & trekking gear",
      "5% GST on billing",
      "Any additional costs due to natural calamities like landslides",
      "Paragliding, paragliding suit, heater charges, tips, entry fees",
      "Personal porter for luggage during trek",
      "Any additional meals or stays outside inclusions"
    ],
    availableDates: [
      { date: "2026-04-25", capacity: 25 },
      { date: "2026-05-02", capacity: 25 }, { date: "2026-05-09", capacity: 25 }, { date: "2026-05-17", capacity: 25 }, { date: "2026-05-23", capacity: 25 }, { date: "2026-05-30", capacity: 25 },
      { date: "2026-06-06", capacity: 25 }, { date: "2026-06-13", capacity: 25 }, { date: "2026-06-20", capacity: 25 }, { date: "2026-06-27", capacity: 25 },
      { date: "2026-07-04", capacity: 25 }, { date: "2026-07-11", capacity: 25 }
    ],
    variants: [
      { location: "From Jalandhar (Triple/Quad Sharing)", originalPrice: 15999, discountedPrice: 11999 },
      { location: "From Ahmedabad Sleeper Train (Triple/Quad)", originalPrice: 17999, discountedPrice: 12999 },
      { location: "From Vadodara/Surat Sleeper (Triple/Quad)", originalPrice: 18499, discountedPrice: 13499 },
      { location: "From Mumbai/Pune Sleeper (Triple/Quad)", originalPrice: 18999, discountedPrice: 13999 },
      { location: "From Ahmedabad 3AC Train (Triple/Quad)", originalPrice: 20999, discountedPrice: 14999 }
    ],
    addons: [
      { name: "Double sharing upgrade", rate: 2000, description: "Upgrade to double sharing stay (excludes Bhrigu camp stay)." }
    ],
    accommodations: [
      { name: "Riverside Camps/Hotel", location: "Kasol", nights: "1 Night" },
      { name: "Bhrigu Alpine Camps", location: "Bhrigu Camp", nights: "2 Nights" },
      { name: "Standard Manali Hotel", location: "Manali", nights: "1 Night" }
    ],
    popupDetails: {
      carry: [
        { label: "Clothing", val: "Thermal inners, winter cap, woolen sweater, gloves, raincoat, hat/cap" },
        { label: "Trek Essentials", val: "Rucksack (50-60L), trekking shoes with rubber grip, socks, original government ID, power bank" }
      ],
      gears: [
        {
          category: "Required Gears",
          items: [
            { item: "Trekking shoes with grip", price: "Free" },
            { item: "Thermals & Heavy jackets", price: "Free" },
            { item: "Power bank", price: "Free" },
            { item: "Trekking backpack (30-40L)", price: "Free" }
          ]
        }
      ],
      cancellation: [
        { label: "Before 45 days", val: "80% refund" },
        { label: "Before 30 days", val: "50% refund" },
        { label: "Before 15 days", val: "25% refund" },
        { label: "Within 15 days", val: "No refund" },
        { label: "Booking fee", val: "Non-refundable" }
      ],
      terms: [
        "Only people of age 12 to 35 years are allowed",
        "5% GST applicable on all packages",
        "Trek guide is provided only if the group has a minimum of 12 participants."
      ],
      etiquette: [
        { title: "Clean Trails", desc: "Keep mountain trails clean. Carry your own plastic trash back." },
        { title: "Safety", desc: "Do not wander off alone in the snow during trek summit day." }
      ],
      showRentedGears: true
    },
    faqs: [
      { question: "What is the difficulty level of the Bhrigu Lake Trek?", answer: "It is rated as moderate. The trek takes you up to 14,300 ft, so good physical fitness and high altitude mental preparedness are recommended." },
      { question: "Will we find snow on the trail?", answer: "Yes, in April, May, and June, the trail is usually covered in snow. By July, the snow starts melting and turns into beautiful green meadows." },
      { question: "Where do we store our main luggage during the trek?", answer: "You can leave your main heavy bags at the hotel in Manali and trek to the Bhrigu Base Camp carrying only a light daypack." },
      { question: "How many nights do we spend in tents?", answer: "We spend 2 nights in alpine tents at the Bhrigu Lake advance base camp (10,000 ft)." }
    ],
    itinerary: [
      {
        day: 1,
        title: "Train Journey to Jalandhar",
        description: "Meet the YC representative at the railway station. Board the train and start your journey towards Jalandhar. Make new friends, play games, and prepare for the Himalayan trek. Note: Inter-station transfers in cities like Vadodara/Mumbai are not included.",
        stay: "Overnight in Train",
        meals: ""
      },
      {
        day: 2,
        title: "Visit Wagha Border & Golden Temple",
        description: "Arrive at Jalandhar/Amritsar. Drive to Wagah Border for the historic Indo-Pak parade ceremony. Later, visit the divine Golden Temple and explore the local markets of Amritsar. Enjoy dinner, then board the vehicle for an overnight drive to Kasol.",
        stay: "Overnight travel",
        meals: ""
      },
      {
        day: 3,
        title: "Kasol & Parvati Valley Exploration",
        description: "Reach the Kasol Campsite around 11:00 AM. Check in, have breakfast, and freshen up. Hike to Chalal Village (2-hour hike) along the beautiful Parvati River. In the evening, visit Manikaran Gurudwara and the local Kasol market. Return to the camp for a bonfire, group games, and dinner.",
        stay: "Cottage/Tent in Kasol",
        meals: "Breakfast, Lunch, Dinner Included"
      },
      {
        day: 4,
        title: "Start Bhrigu Lake Trek",
        description: "After breakfast, check out and drive to the trek start point near Manali. Leave your heavy bags in Manali and start the trek to Bhrigu Base Camp (10,000 ft) carrying only a light daypack. Enjoy the vast expanse of meadows stretch far and wide. Check in to the tents, have dinner, and sleep.",
        stay: "Tent stay in Bhrigu Campsite",
        meals: "Breakfast, Lunch, Dinner Included"
      },
      {
        day: 5,
        title: "Bhrigu Lake Trek Summit Day",
        description: "Wake up early for the summit push. Hike up to the first ridge. In early season (April-June), the trail is covered in snow. Summit Bhrigu Lake at 14,300 ft and marvel at the frozen alpine lake and high peaks. Celebrate with a summit party back at the base camp.",
        stay: "Tent stay in Bhrigu Campsite",
        meals: "Breakfast, Lunch, Dinner Included"
      },
      {
        day: 6,
        title: "Trek Down & Manali Local Sightseeing",
        description: "Trek down to the base village. Drive to Solang Valley and cross the Atal Tunnel. Visit Hadimba Devi Temple and walk through Mall Road in Manali. Enjoy dinner and a comfortable hotel/cottage stay.",
        stay: "Manali (Hotel/cottage)",
        meals: "Breakfast, Lunch, Dinner Included"
      },
      {
        day: 7,
        title: "Adventure Activities & Drive to Jalandhar",
        description: "Enjoy early breakfast and proceed to Kullu for camp rope activities. Take a complimentary 8KM white water rafting session (included) and paragliding (optional, self-paid). In the evening, board the vehicle for a night drive to Jalandhar.",
        stay: "Overnight travel",
        meals: "Breakfast & Lunch Included"
      },
      {
        day: 8,
        title: "Return Train Journey to Your City",
        description: "Board the return train back to Ahmedabad/your city. Chat, play cards, and share photos with new friends during the journey.",
        stay: "Overnight in Train",
        meals: ""
      },
      {
        day: 9,
        title: "Arrive at Your City",
        description: "Arrive in your home city. The adventure concludes with a bag full of memories and long-lasting friendships.",
        stay: "",
        meals: ""
      }
    ],
    stickyCardPrice: 11999,
    stickyCardLabel: "per person"
  }
];

async function seed() {
  try {
    console.log("🌱 Starting to seed extracted trips into database...");
    for (const trip of TRIPS_TO_SEED) {
      console.log(`Upserting: ${trip.title} (slug: ${trip.slug})`);
      await prisma.trip.upsert({
        where: { slug: trip.slug },
        update: {
          ...trip,
          tenantId: "default"
        },
        create: {
          ...trip,
          tenantId: "default"
        }
      });
    }
    console.log("✅ Seeding completed successfully!");
  } catch (error) {
    console.error("🔥 Error seeding database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();

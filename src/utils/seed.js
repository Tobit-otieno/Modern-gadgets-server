// Seeds the database with the same categories/products already used as mock
// data in the Lovable storefront, so the API returns real content immediately.
//
// Image fields are placeholder paths (e.g. "/images/products/p-earbuds.jpg")
// matching the asset filenames from the frontend — swap these for real
// uploaded image URLs once the admin dashboard's image upload is connected.
//
// Run with:   npm run seed
// Wipe with:  npm run seed:destroy
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Category = require("../models/Category");
const Product = require("../models/Product");
const Review = require("../models/Review");

const img = (name) => `/images/products/${name}`;

const categories = [
  {
    slug: "audio",
    name: "Audio",
    headline: "Earbuds, headphones and speakers in Kenya",
    description:
      "Wireless earbuds, earphones, headphones, bluetooth speakers and neckbands from Oraimo, Anker Soundcore, JBL and more, with warranty and countrywide delivery.",
    image: img("p-headphones.jpg"),
    order: 1,
    subcategories: [
      { slug: "earbuds", name: "Earbuds", description: "True wireless earbuds with ANC and long battery life." },
      { slug: "earphones", name: "Earphones", description: "Wired and in-ear earphones for calls and music." },
      { slug: "headphones", name: "Headphones", description: "Over-ear headphones for studio and travel." },
      { slug: "speakers", name: "Speakers", description: "Portable and party bluetooth speakers." },
      { slug: "neckbands", name: "Neckbands", description: "Sports neckband earphones with all day battery." },
    ],
  },
  {
    slug: "power",
    name: "Power",
    headline: "Powerbanks, chargers and cables in Kenya",
    description:
      "Original powerbanks, fast chargers, USB-C cables, car chargers and wireless chargers. Anker, Oraimo and Baseus power gear priced in KES.",
    image: img("p-powerbank.jpg"),
    order: 2,
    subcategories: [
      { slug: "powerbanks", name: "Powerbanks", description: "10000mAh to 30000mAh fast charging powerbanks." },
      { slug: "chargers", name: "Chargers", description: "GaN and fast wall chargers up to 100W." },
      { slug: "cables", name: "Cables", description: "Durable braided USB-C, Lightning and micro USB cables." },
      { slug: "car-chargers", name: "Car Chargers", description: "Dual port car chargers for road trips." },
      { slug: "wireless-chargers", name: "Wireless Chargers", description: "MagSafe compatible wireless pads and stands." },
    ],
  },
  {
    slug: "smart-office",
    name: "Smart & Office",
    headline: "Smartwatches and office electronics in Kenya",
    description:
      "Smartwatches, smart accessories, laptop and desktop accessories and office electronics for productive work setups.",
    image: img("p-smartwatch.jpg"),
    order: 3,
    subcategories: [
      { slug: "smartwatches", name: "Smartwatches", description: "Fitness and calling smartwatches." },
      { slug: "smart-accessories", name: "Smart Accessories", description: "Trackers, smart bulbs and plugs." },
      { slug: "office-electronics", name: "Office Electronics", description: "Printers, shredders and desk tech." },
      { slug: "laptop-accessories", name: "Laptop & Desktop Accessories", description: "Hubs, keyboards, stands and mice." },
    ],
  },
  {
    slug: "personal-care",
    name: "Personal Care",
    headline: "Grooming electronics in Kenya",
    description: "Trimmers, hair dryers, electric shavers and grooming devices built for daily use.",
    image: img("p-trimmer.jpg"),
    order: 4,
    subcategories: [
      { slug: "trimmers", name: "Trimmers", description: "Cordless beard and hair trimmers." },
      { slug: "hair-dryers", name: "Hair Dryers", description: "Fast dry ionic hair dryers." },
      { slug: "shavers", name: "Electric Shavers", description: "Rotary and foil electric shavers." },
      { slug: "grooming-devices", name: "Grooming Devices", description: "Complete grooming kits and accessories." },
    ],
  },
  {
    slug: "home-appliances",
    name: "Home Appliances",
    headline: "Small home electronics in Kenya",
    description: "Kettles, blenders, air fryers and small home gadgets that make everyday life easier.",
    image: img("p-kettle.jpg"),
    order: 5,
    subcategories: [
      { slug: "kitchen", name: "Kitchen Electronics", description: "Kettles, blenders and air fryers." },
      { slug: "cleaning", name: "Cleaning Gadgets", description: "Vacuums and steam cleaners." },
      { slug: "comfort", name: "Home Comfort", description: "Fans, humidifiers and lighting." },
    ],
  },
  {
    slug: "hot-new",
    name: "Hot & New",
    headline: "Trending gadgets in Kenya",
    description: "The newest arrivals and fastest moving gadgets across every category this month.",
    image: img("p-earbuds.jpg"),
    order: 6,
    subcategories: [
      { slug: "new-arrivals", name: "New Arrivals", description: "Just landed in our Nairobi store." },
      { slug: "trending", name: "Trending", description: "Best sellers this week." },
    ],
  },
  {
    slug: "support",
    name: "Support",
    headline: "Help, warranty and contact",
    description: "Warranty information, delivery details and ways to reach the Modern gadgets KE Kenya support team.",
    image: img("p-cable.jpg"),
    isShoppable: false,
    order: 7,
    subcategories: [
      { slug: "help-center", name: "Help Center", description: "Orders, delivery and returns." },
      { slug: "warranty", name: "Warranty", description: "12 month warranty coverage." },
      { slug: "contact", name: "Contact", description: "Talk to our Nairobi team." },
    ],
  },
];

// Each product carries its original review data in `_reviews`, stripped out
// before insert and used afterwards to create real Review documents.
const products = [
  {
    slug: "oraimo-freepods-4-wireless-earbuds",
    name: "Oraimo FreePods 4 Wireless Earbuds",
    brand: "Oraimo",
    category: "audio",
    subcategory: "earbuds",
    price: 4299,
    compareAtPrice: 5999,
    images: [img("p-earbuds.jpg"), img("hero-earbuds.jpg"), img("p-headphones.jpg")],
    colors: [
      { name: "White", hex: "#f2f2f2", image: img("p-earbuds.jpg") },
      { name: "Black", hex: "#141414", image: img("hero-earbuds.jpg") },
    ],
    shortDescription: "Active noise cancelling true wireless earbuds with 36 hour total playtime.",
    description:
      "The Oraimo FreePods 4 deliver deep bass, quad-mic ENC call clarity and up to 36 hours of playtime with the charging case. Designed for commuting in Nairobi traffic, gym sessions and long calls, with IPX5 sweat resistance and instant bluetooth 5.3 pairing.",
    specs: [
      { label: "Bluetooth", value: "5.3" },
      { label: "Playtime", value: "9 hours per charge, 36 hours with case" },
      { label: "Noise cancelling", value: "Hybrid ANC up to 30dB" },
      { label: "Water resistance", value: "IPX5" },
      { label: "Charging", value: "USB-C, 10 min for 2 hours playback" },
      { label: "Warranty", value: "12 months local warranty" },
    ],
    stockQuantity: 40,
    tags: ["hot", "sale"],
    featured: true,
    sku: "VX-AUD-FP4",
    _reviews: [
      { author: "Brian K.", rating: 5, title: "Excellent bass", comment: "Bass is deep and calls are clear even on Thika Road. Delivery to Nairobi took a day." },
      { author: "Mercy W.", rating: 4, comment: "Battery is great. ANC is decent for the price." },
      { author: "Dennis O.", rating: 5, comment: "Genuine Oraimo, sealed box, works perfectly with my Samsung." },
    ],
  },
  {
    slug: "anker-soundcore-life-q30-headphones",
    name: "Anker Soundcore Life Q30 Headphones",
    brand: "Anker",
    category: "audio",
    subcategory: "headphones",
    price: 11999,
    compareAtPrice: 14500,
    images: [img("p-headphones.jpg"), img("p-speaker.jpg")],
    colors: [
      { name: "Midnight Black", hex: "#101010", image: img("p-headphones.jpg") },
      { name: "Studio Grey", hex: "#8b8b8b", image: img("p-speaker.jpg") },
    ],
    shortDescription: "Hybrid ANC over-ear headphones with 40 hour battery and hi-res audio.",
    description:
      "Soundcore Life Q30 combines hybrid active noise cancellation with 40mm drivers tuned for hi-res audio. Multi-mode ANC adapts to transport, outdoor and indoor environments, and the memory foam earcups stay comfortable through a full working day.",
    specs: [
      { label: "Drivers", value: "40mm dynamic" },
      { label: "Battery", value: "40 hours ANC on, 60 hours off" },
      { label: "ANC modes", value: "Transport, outdoor, indoor" },
      { label: "Codec", value: "SBC, AAC" },
      { label: "Warranty", value: "18 months" },
    ],
    stockQuantity: 25,
    tags: ["hot"],
    featured: true,
    sku: "VX-AUD-Q30",
    _reviews: [
      { author: "Alex M.", rating: 5, comment: "Noise cancelling is superb for open plan offices." },
      { author: "Faith N.", rating: 4, comment: "Very comfortable. Slightly bulky for travel." },
    ],
  },
  {
    slug: "oraimo-soundgo-portable-bluetooth-speaker",
    name: "Oraimo SoundGo Portable Bluetooth Speaker",
    brand: "Oraimo",
    category: "audio",
    subcategory: "speakers",
    price: 3499,
    images: [img("p-speaker.jpg"), img("p-headphones.jpg")],
    shortDescription: "Waterproof 10W bluetooth speaker with 12 hour playtime.",
    description:
      "A compact 10W bluetooth speaker with dual passive radiators for punchy bass, IPX7 waterproofing for poolside use and 12 hours of playback per charge. Pair two units for stereo sound.",
    specs: [
      { label: "Output", value: "10W" },
      { label: "Battery", value: "12 hours" },
      { label: "Waterproof", value: "IPX7" },
      { label: "Pairing", value: "TWS stereo pairing" },
    ],
    stockQuantity: 30,
    tags: ["new"],
    sku: "VX-AUD-SG1",
    _reviews: [{ author: "Kevin A.", rating: 5, comment: "Loud for its size, perfect for road trips." }],
  },
  {
    slug: "oraimo-necklace-sports-neckband-earphones",
    name: "Oraimo Necklace Sports Neckband Earphones",
    brand: "Oraimo",
    category: "audio",
    subcategory: "neckbands",
    price: 2199,
    compareAtPrice: 2899,
    images: [img("p-neckband.jpg"), img("p-earbuds.jpg")],
    shortDescription: "Magnetic neckband earphones with 20 hour battery for workouts.",
    description:
      "Lightweight neckband earphones with magnetic earbuds, sweat resistant coating and 20 hours of playback. Built for gym sessions, running and hands free calls on the move.",
    specs: [
      { label: "Battery", value: "20 hours" },
      { label: "Weight", value: "28g" },
      { label: "Water resistance", value: "IPX5" },
      { label: "Charging", value: "USB-C" },
    ],
    stockQuantity: 35,
    tags: ["sale"],
    sku: "VX-AUD-NB2",
    _reviews: [{ author: "Sharon C.", rating: 4, comment: "Stays put while running. Good value." }],
  },
  {
    slug: "anker-20000mah-powercore-powerbank",
    name: "Anker 20000mAh PowerCore Powerbank",
    brand: "Anker",
    category: "power",
    subcategory: "powerbanks",
    price: 8999,
    compareAtPrice: 10999,
    images: [img("p-powerbank.jpg"), img("hero-powerbank.jpg")],
    colors: [
      { name: "Black", hex: "#111111", image: img("p-powerbank.jpg") },
      { name: "Graphite", hex: "#4b4b4b", image: img("hero-powerbank.jpg") },
    ],
    shortDescription: "20000mAh 65W power bank that charges phones and laptops.",
    description:
      "A 20000mAh travel power bank with 65W USB-C Power Delivery, capable of charging a laptop, a phone and earbuds at the same time. The digital display shows exact remaining capacity so you always know where you stand before a long day.",
    specs: [
      { label: "Capacity", value: "20000mAh / 72Wh" },
      { label: "Max output", value: "65W USB-C PD" },
      { label: "Ports", value: "2 x USB-C, 1 x USB-A" },
      { label: "Recharge time", value: "2.5 hours at 60W" },
      { label: "Warranty", value: "18 months" },
    ],
    stockQuantity: 50,
    tags: ["hot", "sale"],
    featured: true,
    sku: "VX-PWR-A20",
    _reviews: [
      { author: "Peter G.", rating: 5, comment: "Charges my MacBook Air fully. Worth every shilling." },
      { author: "Lilian J.", rating: 5, comment: "Bought two for the office. Solid build." },
      { author: "Sam T.", rating: 4, comment: "Heavy but the capacity justifies it." },
    ],
  },
  {
    slug: "oraimo-10000mah-slim-powerbank",
    name: "Oraimo 10000mAh Slim Powerbank",
    brand: "Oraimo",
    category: "power",
    subcategory: "powerbanks",
    price: 2999,
    images: [img("p-powerbank.jpg")],
    shortDescription: "Pocket friendly 10000mAh power bank with 22.5W fast charge.",
    description:
      "A slim 10000mAh power bank with 22.5W super fast charging, dual output ports and multi-layer safety protection. Small enough for a pocket, big enough for two full phone charges.",
    specs: [
      { label: "Capacity", value: "10000mAh" },
      { label: "Output", value: "22.5W" },
      { label: "Ports", value: "USB-C and USB-A" },
      { label: "Thickness", value: "14mm" },
    ],
    stockQuantity: 60,
    tags: ["hot"],
    sku: "VX-PWR-O10",
    _reviews: [{ author: "Joy M.", rating: 4, comment: "Light and reliable for daily commuting." }],
  },
  {
    slug: "anker-nano-65w-gan-fast-charger",
    name: "Anker Nano 65W GaN Fast Charger",
    brand: "Anker",
    category: "power",
    subcategory: "chargers",
    price: 4499,
    compareAtPrice: 5200,
    images: [img("p-charger.jpg"), img("p-cable.jpg")],
    colors: [
      { name: "White", hex: "#f4f4f4", image: img("p-charger.jpg") },
      { name: "Black", hex: "#161616", image: img("p-cable.jpg") },
    ],
    shortDescription: "Compact 65W GaN charger with three ports for phone and laptop.",
    description:
      "GaN II technology packs 65W of power into a charger smaller than a matchbox. Charge a laptop, tablet and phone at once with intelligent power distribution and full safety certification.",
    specs: [
      { label: "Max output", value: "65W" },
      { label: "Ports", value: "2 x USB-C, 1 x USB-A" },
      { label: "Technology", value: "GaN II" },
      { label: "Plug", value: "UK 3 pin" },
    ],
    stockQuantity: 45,
    tags: ["new", "sale"],
    sku: "VX-PWR-N65",
    _reviews: [{ author: "Victor N.", rating: 5, comment: "Tiny and powerful, replaced two chargers." }],
  },
  {
    slug: "braided-usb-c-to-usb-c-fast-charging-cable",
    name: "Braided USB-C to USB-C Fast Charging Cable 100W",
    brand: "Baseus",
    category: "power",
    subcategory: "cables",
    price: 999,
    images: [img("p-cable.jpg")],
    shortDescription: "100W nylon braided USB-C cable rated for 20000 bends.",
    description:
      "A 1.8 metre nylon braided USB-C cable supporting 100W power delivery and 480Mbps data. Reinforced connectors survive daily plugging and unplugging in bags and cars.",
    specs: [
      { label: "Length", value: "1.8m" },
      { label: "Power", value: "100W / 5A" },
      { label: "Data", value: "480Mbps" },
      { label: "Durability", value: "20000 bend tested" },
    ],
    stockQuantity: 80,
    tags: ["hot"],
    sku: "VX-PWR-CBL",
    _reviews: [{ author: "Ann K.", rating: 5, comment: "Strong cable, charges fast." }],
  },
  {
    slug: "dual-port-45w-car-charger",
    name: "Dual Port 45W Car Charger",
    brand: "Baseus",
    category: "power",
    subcategory: "car-chargers",
    price: 1799,
    images: [img("p-charger.jpg")],
    shortDescription: "45W car charger with USB-C PD and USB-A ports.",
    description:
      "A metal bodied car charger delivering 45W across two ports, with temperature control and surge protection for safe charging on long drives.",
    specs: [
      { label: "Output", value: "45W total" },
      { label: "Ports", value: "USB-C PD and USB-A QC" },
      { label: "Body", value: "Aluminium alloy" },
    ],
    stockQuantity: 20,
    tags: [],
    sku: "VX-PWR-CAR",
    _reviews: [{ author: "Tom R.", rating: 4, comment: "Charges two phones quickly in the car." }],
  },
  {
    slug: "15w-magnetic-wireless-charging-stand",
    name: "15W Magnetic Wireless Charging Stand",
    brand: "Oraimo",
    category: "power",
    subcategory: "wireless-chargers",
    price: 3299,
    compareAtPrice: 3999,
    images: [img("p-charger.jpg"), img("p-powerbank.jpg")],
    shortDescription: "Magnetic 15W wireless stand for phones and earbuds.",
    description:
      "Snap your phone into place magnetically and charge at 15W while it sits at a comfortable viewing angle. Includes a secondary pad for earbuds.",
    specs: [
      { label: "Output", value: "15W magnetic" },
      { label: "Compatibility", value: "MagSafe compatible iPhone and Qi Android" },
      { label: "Extras", value: "Earbuds charging pad" },
    ],
    stockQuantity: 18,
    tags: ["new", "sale"],
    sku: "VX-PWR-WCS",
    _reviews: [{ author: "Grace L.", rating: 4, comment: "Neat on the desk, holds the phone firmly." }],
  },
  {
    slug: "oraimo-watch-4-pro-calling-smartwatch",
    name: "Oraimo Watch 4 Pro Calling Smartwatch",
    brand: "Oraimo",
    category: "smart-office",
    subcategory: "smartwatches",
    price: 6499,
    compareAtPrice: 7999,
    images: [img("p-smartwatch.jpg"), img("hero-smartwatch.jpg")],
    colors: [
      { name: "Black", hex: "#121212", image: img("p-smartwatch.jpg") },
      { name: "Steel", hex: "#9aa0a6", image: img("hero-smartwatch.jpg") },
    ],
    shortDescription: "Bluetooth calling smartwatch with AMOLED display and health tracking.",
    description:
      "A 2.01 inch AMOLED calling smartwatch with heart rate, SpO2 and sleep tracking, over 100 sport modes and up to 10 days of battery. Answer calls straight from your wrist during Nairobi commutes.",
    specs: [
      { label: "Display", value: "2.01 inch AMOLED" },
      { label: "Calling", value: "Bluetooth calling with mic and speaker" },
      { label: "Health", value: "Heart rate, SpO2, sleep" },
      { label: "Battery", value: "Up to 10 days" },
      { label: "Water resistance", value: "IP68" },
    ],
    stockQuantity: 33,
    tags: ["hot", "new"],
    featured: true,
    sku: "VX-SMT-W4P",
    _reviews: [
      { author: "Ian W.", rating: 5, comment: "Screen is bright, calls work well." },
      { author: "Nancy P.", rating: 4, comment: "Battery lasts about a week for me." },
    ],
  },
  {
    slug: "8-in-1-usb-c-laptop-hub",
    name: "8 in 1 USB-C Laptop Hub with HDMI",
    brand: "Anker",
    category: "smart-office",
    subcategory: "laptop-accessories",
    price: 5499,
    images: [img("p-cable.jpg"), img("p-charger.jpg")],
    shortDescription: "USB-C hub with 4K HDMI, ethernet, SD and 100W pass-through.",
    description:
      "Expand a single USB-C port into eight: 4K HDMI, gigabit ethernet, SD and microSD, three USB-A ports and 100W power delivery pass-through for laptop charging.",
    specs: [
      { label: "Video", value: "4K 30Hz HDMI" },
      { label: "Network", value: "Gigabit ethernet" },
      { label: "Power", value: "100W PD pass-through" },
      { label: "Card readers", value: "SD and microSD" },
    ],
    stockQuantity: 22,
    tags: ["new"],
    sku: "VX-SMT-HUB",
    _reviews: [{ author: "Eric B.", rating: 5, comment: "Everything works on my Dell and MacBook." }],
  },
  {
    slug: "smart-wifi-plug-with-energy-monitoring",
    name: "Smart WiFi Plug with Energy Monitoring",
    brand: "Modern gadgets KE",
    category: "smart-office",
    subcategory: "smart-accessories",
    price: 1599,
    images: [img("p-charger.jpg")],
    shortDescription: "Control appliances and track power usage from your phone.",
    description:
      "Turn any socket into a smart socket. Schedule appliances, control them remotely and monitor energy usage in kilowatt hours from a phone app that works with Google Assistant and Alexa.",
    specs: [
      { label: "Rating", value: "16A" },
      { label: "Connectivity", value: "2.4GHz WiFi" },
      { label: "Assistants", value: "Google Assistant, Alexa" },
    ],
    stockQuantity: 15,
    tags: [],
    sku: "VX-SMT-PLG",
    _reviews: [{ author: "Mutua S.", rating: 4, comment: "Easy setup, useful for the water heater." }],
  },
  {
    slug: "cordless-beard-and-hair-trimmer-kit",
    name: "Cordless Beard and Hair Trimmer Kit",
    brand: "Philips",
    category: "personal-care",
    subcategory: "trimmers",
    price: 4899,
    compareAtPrice: 5900,
    images: [img("p-trimmer.jpg")],
    shortDescription: "Self sharpening trimmer with 10 length settings and 90 minute runtime.",
    description:
      "A cordless trimmer with self sharpening stainless steel blades, ten length settings from 0.5mm to 10mm and 90 minutes of runtime per full charge. Fully washable head for quick cleaning.",
    specs: [
      { label: "Runtime", value: "90 minutes" },
      { label: "Settings", value: "10 lengths, 0.5mm to 10mm" },
      { label: "Blades", value: "Self sharpening stainless steel" },
      { label: "Cleaning", value: "Washable head" },
    ],
    stockQuantity: 28,
    tags: ["sale"],
    sku: "VX-PC-TRM",
    _reviews: [{ author: "Collins O.", rating: 5, comment: "Sharp and quiet, great for home cuts." }],
  },
  {
    slug: "ionic-fast-dry-hair-dryer-2200w",
    name: "Ionic Fast Dry Hair Dryer 2200W",
    brand: "Philips",
    category: "personal-care",
    subcategory: "hair-dryers",
    price: 5599,
    images: [img("p-trimmer.jpg"), img("p-kettle.jpg")],
    shortDescription: "2200W ionic hair dryer with three heat settings and cool shot.",
    description:
      "A 2200W ionic hair dryer that cuts drying time while reducing frizz. Three heat and two speed settings plus a cool shot button lock styles in place.",
    specs: [
      { label: "Power", value: "2200W" },
      { label: "Settings", value: "3 heat, 2 speed, cool shot" },
      { label: "Technology", value: "Ionic care" },
    ],
    stockQuantity: 0,
    tags: [],
    sku: "VX-PC-HDR",
    _reviews: [{ author: "Wanjiru M.", rating: 4, comment: "Dries fast, a bit loud." }],
  },
  {
    slug: "1-7l-stainless-steel-electric-kettle",
    name: "1.7L Stainless Steel Electric Kettle",
    brand: "Ramtons",
    category: "home-appliances",
    subcategory: "kitchen",
    price: 3899,
    compareAtPrice: 4500,
    images: [img("p-kettle.jpg")],
    shortDescription: "Fast boil 1.7 litre cordless kettle with auto shut off.",
    description:
      "A 2200W stainless steel cordless kettle that boils 1.7 litres in under five minutes, with automatic shut off, boil dry protection and a concealed heating element for easy cleaning.",
    specs: [
      { label: "Capacity", value: "1.7 litres" },
      { label: "Power", value: "2200W" },
      { label: "Safety", value: "Auto shut off and boil dry protection" },
      { label: "Body", value: "Brushed stainless steel" },
    ],
    stockQuantity: 26,
    tags: ["sale"],
    sku: "VX-HA-KTL",
    _reviews: [{ author: "Esther K.", rating: 5, comment: "Boils very fast, looks smart in the kitchen." }],
  },
];

const seed = async () => {
  await connectDB();

  if (process.argv.includes("--destroy")) {
    await Promise.all([Category.deleteMany(), Product.deleteMany(), Review.deleteMany()]);
    console.log("All categories, products and reviews removed.");
    return mongoose.connection.close();
  }

  await Promise.all([Category.deleteMany(), Product.deleteMany(), Review.deleteMany()]);

  await Category.insertMany(categories);
  console.log(`Seeded ${categories.length} categories.`);

  for (const productData of products) {
    const { _reviews, ...productFields } = productData;
    const product = await Product.create(productFields);

    if (_reviews?.length) {
      const reviewDocs = _reviews.map((r) => ({ ...r, product: product._id, status: "approved" }));
      await Review.insertMany(reviewDocs);
      await Review.recalculateProductRating(product._id);
    }
  }
  console.log(`Seeded ${products.length} products with their reviews.`);

  await mongoose.connection.close();
  console.log("Seeding complete.");
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

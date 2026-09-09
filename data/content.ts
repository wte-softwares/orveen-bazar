import type { LocalizedText } from "@/lib/types";

const L = (bn: string, en: string): LocalizedText => ({ bn, en });

/* ------------------------------ Trust bar ------------------------------ */
export const trustItems = [
  { icon: "shield", title: L("মানসম্মত পণ্য", "Quality Products"), desc: L("trust.qualityDesc", "trust.qualityDesc") , key: "quality"},
  { icon: "tag", title: L("প্রতিযোগিতামূলক মূল্য", "Competitive Pricing"), desc: L("", ""), key: "pricing" },
  { icon: "truck", title: L("নির্ভরযোগ্য সরবরাহ", "Reliable Supply"), desc: L("", ""), key: "supply" },
  { icon: "headphones", title: L("উন্নত গ্রাহকসেবা", "Customer Support"), desc: L("", ""), key: "support" },
];

/* ---------------------------- Why choose us ---------------------------- */
export const whyItems: { icon: string; title: LocalizedText; desc: LocalizedText }[] = [
  { icon: "shield", title: L("উন্নতমানের পণ্য", "Quality Products"), desc: L("বাছাই করা কাঁচামাল ও পরিষ্কার প্যাকেজিংয়ের প্রতি বিশেষ নজর।", "Careful attention to selected sourcing and clean packaging.") },
  { icon: "tag", title: L("প্রতিযোগিতামূলক মূল্য", "Competitive Pricing"), desc: L("গ্রাহক ও ডিলার — সবার জন্য ন্যায্য ও সাশ্রয়ী মূল্য কাঠামো।", "A fair and affordable price structure for customers and dealers alike.") },
  { icon: "truck", title: L("নির্ভরযোগ্য সরবরাহ", "Reliable Supply"), desc: L("পরিকল্পিত ইনভেন্টরি ও ডিস্ট্রিবিউশন ব্যবস্থাপনা।", "Planned inventory and distribution management.") },
  { icon: "handshake", title: L("শক্তিশালী ডিলার সাপোর্ট", "Strong Dealer Support"), desc: L("ডিলার ও ডিস্ট্রিবিউটরদের জন্য নিবেদিত যোগাযোগ ও সহায়তা।", "Dedicated communication and support for dealers and distributors.") },
  { icon: "users", title: L("ব্যবসায়িক অংশীদারদের সহযোগিতা", "Business Partner Support"), desc: L("অংশীদারদের ব্যবসা বাড়ানোয় পারস্পরিক সহযোগিতা।", "Mutual cooperation to help partners grow their business.") },
  { icon: "heart", title: L("দীর্ঘমেয়াদি ব্যবসায়িক সম্পর্ক", "Long-Term Business Relationships"), desc: L("আস্থার সম্পর্কই আমাদের ব্যবসার মূল ভিত্তি।", "Relationships built on trust are the foundation of our business.") },
  { icon: "map", title: L("দেশব্যাপী সম্প্রসারণের পরিকল্পনা", "Nationwide Expansion Plan"), desc: L("ধাপে ধাপে ৬৪ জেলায় পণ্য ও নেটওয়ার্ক সম্প্রসারণের পরিকল্পনা।", "A phased plan to expand products and network across all 64 districts.") },
];

/* --------------------------- Dealer hierarchy --------------------------- */
export const dealerLevels: { icon: string; level: LocalizedText; role: LocalizedText }[] = [
  { icon: "globe", level: L("জাতীয় পর্যায়", "National Level"), role: L("ডিস্ট্রিবিউটর", "Distributor") },
  { icon: "map", level: L("জেলা পর্যায়", "District Level"), role: L("ডিস্ট্রিবিউটর", "Distributor") },
  { icon: "store", level: L("উপজেলা পর্যায়", "Upazila Level"), role: L("ডিলার", "Dealer") },
  { icon: "home", level: L("ইউনিয়ন পর্যায়", "Union Level"), role: L("খুচরা বিক্রেতা", "Retailer") },
  { icon: "monitor", level: L("অনলাইন", "Online"), role: L("ORVEEN BAZZAR.COM", "ORVEEN BAZZAR.COM") },
  { icon: "building", level: L("কর্পোরেট", "Corporate"), role: L("সরাসরি পণ্য সরবরাহ", "Direct Product Supply") },
];

/* ---------------------------- Corporate page ---------------------------- */
export const corporateAudiences: LocalizedText[] = [
  L("অফিস ও কর্পোরেট প্রতিষ্ঠান", "Offices & corporate organizations"),
  L("স্কুল ও শিক্ষা প্রতিষ্ঠান", "Schools & educational institutions"),
  L("রেস্টুরেন্ট ও ক্যাফে", "Restaurants & cafés"),
  L("হোটেল ও আবাসিক প্রতিষ্ঠান", "Hotels & residential institutions"),
  L("খুচরা ব্যবসা ও দোকান", "Retail businesses & shops"),
  L("এনজিও ও সামাজিক সংস্থা", "NGOs & social organizations"),
];

export const corporateBenefits: { icon: string; title: LocalizedText; desc: LocalizedText }[] = [
  { icon: "truck", title: L("নির্ভরযোগ্য সরবরাহ", "Reliable Supply"), desc: L("নিয়মিত ও পরিকল্পিত সাপ্লাই সময়সূচি।", "Regular, planned supply schedules.") },
  { icon: "tag", title: L("প্রতিযোগিতামূলক মূল্য", "Competitive Pricing"), desc: L("প্রাতিষ্ঠানিক কেনাকাটায় সাশ্রয়ী মূল্য।", "Affordable pricing for institutional buying.") },
  { icon: "scale", title: L("নমনীয় পরিমাণ", "Flexible Quantity"), desc: L("প্রয়োজন অনুযায়ী ছোট বা বড় অর্ডার।", "Small or large orders according to need.") },
  { icon: "headphones", title: L("নিবেদিত যোগাযোগ", "Dedicated Communication"), desc: L("একটি নির্দিষ্ট যোগাযোগ মাধ্যমে দ্রুত সাড়া।", "Quick response through a dedicated contact channel.") },
  { icon: "handshake", title: L("ব্যবসায়িক সহায়তা", "Business Support"), desc: L("চাহিদা অনুযায়ী পণ্য পরিকল্পনা ও সহায়তা।", "Product planning and support based on your requirements.") },
];

/* --------------------------- Marketing strategy --------------------------- */
export const marketingStrategy: LocalizedText[] = [
  L("ডিজিটাল মার্কেটিং", "Digital Marketing"),
  L("ফেসবুক মার্কেটিং", "Facebook Marketing"),
  L("অনলাইন সেলস", "Online Sales"),
  L("ডিলার ও ডিস্ট্রিবিউটর নিয়োগ", "Dealer & Distributor Recruitment"),
  L("ট্রেড অফার ও ইনসেনটিভ", "Trade Offer & Incentive"),
  L("পোস্টার ও বিলবোর্ড ব্র্যান্ডিং", "Poster & Billboard Branding"),
  L("প্রোডাক্ট প্রমোশন", "Product Promotion"),
  L("লোকাল মার্কেট ক্যাম্পেইন", "Local Market Campaign"),
  L("কর্পোরেট সাপ্লাই", "Corporate Supply"),
  L("ডিলার সাপোর্ট প্রোগ্রাম", "Dealer Support Program"),
];

/* ------------------------------- Roadmap ------------------------------- */
export const roadmap: { year: number; points: LocalizedText[]; target?: LocalizedText }[] = [
  { year: 1, points: [L("২০টি জেলায় কার্যক্রম শুরু", "Launch operations in 20 districts")], target: L("২০০ জন ডিলার", "200 dealers") },
  { year: 2, points: [L("৪০টি জেলায় সম্প্রসারণ", "Expansion to 40 districts")], target: L("৫০০ জন ডিলার", "500 dealers") },
  { year: 3, points: [L("বাংলাদেশের ৬৪টি জেলায় কার্যক্রম সম্প্রসারণ", "Expansion across all 64 districts of Bangladesh")], target: L("১,০০০ জন ডিলার", "1,000 dealers") },
  {
    year: 4,
    points: [
      L("নতুন পণ্য বাজারজাতকরণ", "Launch new products"),
      L("ডিস্ট্রিবিউশন শক্তিশালীকরণ", "Strengthen distribution"),
      L("অনলাইন ব্যবসা সম্প্রসারণ", "Expand online business"),
      L("কর্পোরেট সাপ্লাই বৃদ্ধি", "Increase corporate supply"),
    ],
  },
  {
    year: 5,
    points: [
      L("শীর্ষস্থানীয় FMCG ব্র্যান্ড হিসেবে প্রতিষ্ঠার লক্ষ্যে অগ্রসর হওয়া", "Progress toward becoming a leading FMCG brand"),
      L("শক্তিশালী জাতীয় ব্র্যান্ড নেটওয়ার্ক", "Build a strong national brand network"),
      L("আন্তর্জাতিক বাজারে প্রবেশের প্রস্তুতি", "Prepare for international market expansion"),
    ],
  },
];

/* ----------------------------- Core values ----------------------------- */
export const coreValues: { icon: string; title: LocalizedText }[] = [
  { icon: "scale", title: L("সততা", "Integrity") },
  { icon: "handshake", title: L("বিশ্বস্ততা", "Trust") },
  { icon: "shield", title: L("গুণগত মান", "Quality") },
  { icon: "bulb", title: L("উদ্ভাবন", "Innovation") },
  { icon: "heart", title: L("গ্রাহক সন্তুষ্টি", "Customer Satisfaction") },
  { icon: "check", title: L("দায়বদ্ধতা", "Accountability") },
];

export const missionPoints: LocalizedText[] = [
  L("মানসম্মত ও নিরাপদ পণ্য সরবরাহ করা।", "Provide quality and safe products."),
  L("গ্রাহকদের জন্য প্রতিযোগিতামূলক মূল্য নিশ্চিত করা।", "Ensure competitive pricing for customers."),
  L("দেশব্যাপী শক্তিশালী ডিলার ও ডিস্ট্রিবিউশন নেটওয়ার্ক তৈরি করা।", "Build a strong nationwide dealer and distribution network."),
  L("দ্রুত ও নির্ভরযোগ্য সরবরাহ ব্যবস্থা গড়ে তোলা।", "Develop fast and reliable supply systems."),
  L("উন্নত গ্রাহকসেবা নিশ্চিত করা।", "Ensure better customer service."),
  L("ব্যবসায়িক অংশীদারদের জন্য দীর্ঘমেয়াদি সুযোগ তৈরি করা।", "Create long-term opportunities for business partners."),
];

export const visionText = L(
  "বাংলাদেশের অন্যতম বিশ্বস্ত ও শীর্ষস্থানীয় FMCG ব্র্যান্ড হিসেবে প্রতিষ্ঠিত হওয়া এবং ভবিষ্যতে আন্তর্জাতিক বাজারে প্রবেশ করা।",
  "To establish ourselves as one of Bangladesh’s trusted and leading FMCG brands and prepare for future expansion into international markets.",
);

export const commitmentText: LocalizedText[] = [
  L("RELIABLE MULTI PRODUCTS শুধু একটি পণ্য বাজারজাতকারী প্রতিষ্ঠান নয়।", "RELIABLE MULTI PRODUCTS aims to be more than a product marketing company."),
  L("আমাদের লক্ষ্য হলো গ্রাহক, ডিলার, ডিস্ট্রিবিউটর এবং ব্যবসায়িক অংশীদারদের জন্য একটি নির্ভরযোগ্য, স্বচ্ছ ও দীর্ঘমেয়াদি ব্যবসায়িক প্ল্যাটফর্ম তৈরি করা।", "Our goal is to build a reliable, transparent and long-term business platform for customers, dealers, distributors and business partners."),
];

export const founderMessage: LocalizedText[] = [
  L(
    "RELIABLE MULTI PRODUCTS, ORVEEN BAZZAR.COM এবং ECO FAST BD-এর লক্ষ্য হলো বাংলাদেশের মানুষের জন্য মানসম্মত, নিরাপদ ও সাশ্রয়ী নিত্যপ্রয়োজনীয় পণ্য সরবরাহ করা।",
    "Our goal through RELIABLE MULTI PRODUCTS, ORVEEN BAZZAR.COM and ECO FAST BD is to provide quality, safe and affordable daily essentials to the people of Bangladesh.",
  ),
  L(
    "আমরা শুধু পণ্য বিক্রির দিকে নয়, বরং গ্রাহক, ডিলার, ডিস্ট্রিবিউটর ও ব্যবসায়িক অংশীদারদের সঙ্গে দীর্ঘমেয়াদি আস্থা ও পারস্পরিক উন্নয়নের সম্পর্ক গড়ে তোলার দিকে গুরুত্ব দিই।",
    "We focus not only on selling products but also on building long-term relationships based on trust and mutual growth with customers, dealers, distributors and business partners.",
  ),
  L(
    "গুণগত মান, সততা, নির্ভরযোগ্য সরবরাহ ও উন্নত সেবার মাধ্যমে একটি শক্তিশালী এবং টেকসই ব্যবসায়িক প্রতিষ্ঠান গড়ে তোলাই আমাদের লক্ষ্য।",
    "Our goal is to build a strong and sustainable business organization through quality, integrity, reliable supply and better service.",
  ),
];

export const aboutIntro: LocalizedText[] = [
  L(
    "RELIABLE MULTI PRODUCTS একটি বাংলাদেশভিত্তিক FMCG ও নিত্যপ্রয়োজনীয় পণ্য বাজারজাতকারী প্রতিষ্ঠান।",
    "RELIABLE MULTI PRODUCTS is a Bangladesh-based FMCG and daily essentials marketing company.",
  ),
  L(
    "ORVEEN BAZZAR.COM-এর মাধ্যমে খাদ্যপণ্য, ভোজ্য তেল, পানীয়, গৃহস্থালি পণ্য এবং অন্যান্য নিত্যপ্রয়োজনীয় পণ্য গ্রাহকদের কাছে পৌঁছে দেওয়ার লক্ষ্য নিয়ে আমরা কাজ করছি।",
    "Through ORVEEN BAZZAR.COM, we aim to make food products, edible oils, beverages, household products and other daily essentials accessible to customers.",
  ),
  L(
    "আমাদের ব্যবসার মূল ভিত্তি হলো গুণগত মান, সাশ্রয়ী মূল্য, নির্ভরযোগ্য সরবরাহ এবং গ্রাহকসেবা।",
    "Our business is built around quality, competitive pricing, reliable supply and customer service.",
  ),
];

/* --------------------------------- FAQ --------------------------------- */
export const faqItems: { tag: LocalizedText; q: LocalizedText; a: LocalizedText }[] = [
  {
    tag: L("কেনাকাটা", "Shopping"),
    q: L("কীভাবে পণ্য অর্ডার করব?", "How do I place an order?"),
    a: L(
      "পণ্য বেছে করে কার্টে যোগ করুন, তারপর চেকআউট পেজে ডেলিভারি তথ্য পূরণ করে অর্ডার সম্পন্ন করুন।",
      "Add products to your cart, then complete the checkout page with your delivery information.",
    ),
  },
  {
    tag: L("কেনাকাটা", "Shopping"),
    q: L("ওয়েবসাইটের ভাষা কীভাবে পরিবর্তন করব?", "How do I change the website language?"),
    a: L(
      "উপরের বার অথবা মোবাইল মেনুতে বাংলা | English সুইচ থেকে ভাষা পরিবর্তন করুন। পুরো সাইট সাথে সাথে অনুদিত হবে।",
      "Use the বাংলা | English switch in the top bar or mobile menu. The whole site translates instantly.",
    ),
  },
  {
    tag: L("পণ্য প্রাপ্যতা", "Product availability"),
    q: L("কোনো পণ্য স্টকে না থাকলে কী করব?", "What if a product is out of stock?"),
    a: L(
      "স্টক শেষ পণ্যে কার্ট বাটন নিষ্ক্রিয় থাকে। হোয়াটসঅ্যাপে জানালে নতুন স্টক সম্পর্কে জানানো সম্ভব হবে।",
      "Out-of-stock products show a disabled cart button. Message us on WhatsApp and we can inform you about restocks.",
    ),
  },
  {
    tag: L("চেকআউট", "Checkout"),
    q: L("ডেলিভারি চার্জ কত?", "What is the delivery charge?"),
    a: L(
      "ডেলিভারি চার্জ এখনো নির্ধারণ চূড়ান্ত হয়নি। অর্ডার নিশ্চিতকরণের সময় এলাকা অনুযায়ী চার্জ জানানো হবে।",
      "Delivery charges are not finalised yet. The charge for your area is communicated at order confirmation.",
    ),
  },
  {
    tag: L("চেকআউট", "Checkout"),
    q: L("পেমেন্ট কীভাবে করব?", "How can I pay?"),
    a: L(
      "বর্তমানে ক্যাশ অন ডেলিভারি সুবিধা রয়েছে। মোবাইল ফিন্যান্সিয়াল সার্ভিস ও অনলাইন পেমেন্ট শীঘ্রই যুক্ত হবে।",
      "Cash on Delivery is currently available. Mobile financial services and online payment will be added soon.",
    ),
  },
  {
    tag: L("অ্যাকাউন্ট", "Account"),
    q: L("অ্যাকাউন্ট কি বাধ্যতামূলক?", "Is an account required?"),
    a: L(
      "না। অতিথি হিসেবেও চেকআউট করা যায়। অ্যাকাউন্ট থাকলে অর্ডার ও উইশলিস্ট এক জায়গায় দেখা সুবিধা হয়।",
      "No. Guest checkout is available. An account simply keeps orders and wishlist in one place.",
    ),
  },
  {
    tag: L("ডিলার", "Dealer inquiry"),
    q: L("ডিলারশিপের জন্য কীভাবে আবেদন করব?", "How do I apply for a dealership?"),
    a: L(
      "ডিলার ও ডিস্ট্রিবিউটর পেজের আবেদন ফর্ম পূরণ করুন অথবা হোয়াটসঅ্যাপে যোগাযোগ করুন।",
      "Fill the application form on the Dealer & Distributor page or contact us on WhatsApp.",
    ),
  },
  {
    tag: L("কর্পোরেট", "Corporate inquiry"),
    q: L("প্রতিষ্ঠানের জন্য বাল্ক সাপ্লাই পাওয়া যাবে?", "Can institutions get bulk supply?"),
    a: L(
      "হ্যাঁ, কর্পোরেট সাপ্লাই পেজের ফর্ম থেকে চাহিদা জানান — পরিমাণ ও পণ্য অনুযায়ী আলোচনা করা হবে।",
      "Yes. Submit the form on the Corporate Supply page — we discuss quantities and products case by case.",
    ),
  },
  {
    tag: L("যোগাযোগ", "Contact"),
    q: L("সরাসরি যোগাযোগের মাধ্যম কী?", "What is the direct contact channel?"),
    a: L(
      "হোয়াটসঅ্যাপ: ০১৩৩৫১৮৯৪২৬ এবং ইমেইল: orveenbazzar@gmail.com",
      "WhatsApp: 01335189426 and email: orveenbazzar@gmail.com",
    ),
  },
];

/* ---------------------------- Legal (drafts) ---------------------------- */
export const termsSections: { title: LocalizedText; body: LocalizedText[] }[] = [
  {
    title: L("১. সাধারণ পরিচিতি", "1. General Introduction"),
    body: [
      L(
        "ORVEEN BAZZAR.COM একটি ই-কমার্স প্ল্যাটফর্ম, যা RELIABLE MULTI PRODUCTS পরিচালনা করে। এই শর্তাবলী ওয়েবসাইট ব্যবহারের সাধারণ তথ্য প্রদান করে।",
        "ORVEEN BAZZAR.COM is an e-commerce platform operated by RELIABLE MULTI PRODUCTS. These terms provide general information about using the website.",
      ),
    ],
  },
  {
    title: L("২. পণ্য তথ্য ও প্রাপ্যতা", "2. Product Information & Availability"),
    body: [
      L(
        "ওয়েবসাইটে প্রদর্শিত পণ্যের ছবি, বিবরণ ও মূল্য প্রদর্শনের উদ্দেশ্যে। স্টক প্রাপ্যতা সময়ের সঙ্গে পরিবর্তিত হতে পারে।",
        "Product images, descriptions and prices shown on the website are for display purposes. Stock availability may change over time.",
      ),
    ],
  },
  {
    title: L("৩. অর্ডার ও মূল্য", "3. Orders & Pricing"),
    body: [
      L(
        "অর্ডার সম্পন্ন করার পর অর্ডার নিশ্চিতকরণের সময় চূড়ান্ত মূল্য ও ডেলিভারি তথ্য জানানো হবে।",
        "After an order is placed, final pricing and delivery details are communicated at order confirmation.",
      ),
    ],
  },
  {
    title: L("৪. ডেলিভারি", "4. Delivery"),
    body: [
      L(
        "ডেলিভারি এলাকা, সময় ও চার্জ নির্ধারণের প্রক্রিয়া চলমান। বিস্তারিত অর্ডার নিশ্চিতকরণের সময় জানানো হবে।",
        "Delivery areas, timelines and charges are being configured. Details are provided at order confirmation.",
      ),
    ],
  },
  {
    title: L("৫. বৌদ্ধিক সম্পদ", "5. Intellectual Property"),
    body: [
      L(
        "ORVEEN, ECO FAST BD এবং সংশ্লিষ্ট নাম ও লোগো RELIABLE MULTI PRODUCTS-এর ব্যবসায়িক পরিচয়। অনুমতি ছাড়া ব্যবহার করা যাবে না।",
        "ORVEEN, ECO FAST BD and related names and logos are the business identity of RELIABLE MULTI PRODUCTS and may not be used without permission.",
      ),
    ],
  },
  {
    title: L("৬. পরিবর্তন ও আইনি পর্যালোচনা", "6. Changes & Legal Review"),
    body: [
      L(
        "এই শর্তাবলীর পূর্ণাঙ্গ সংস্করণ আইনি পর্যালোচনার পর প্রকাশ করা হবে। প্রয়োজনে যেকোনো সময় শর্তাবলি হালনাগাদ হতে পারে।",
        "The full version of these terms will be published after legal review. Terms may be updated at any time.",
      ),
    ],
  },
];

export const privacySections: { title: LocalizedText; body: LocalizedText[] }[] = [
  {
    title: L("১. আমরা কী তথ্য সংগ্রহ করি", "1. Information We Collect"),
    body: [
      L(
        "চেকআউট ও ফর্ম পূরণের সময় আপনি যে তথ্য দেন (নাম, মোবাইল, ইমেইল, ঠিকানা) শুধুমাত্র অর্ডার ও যোগাযোগের জন্য ব্যবহৃত হয়।",
        "Information you provide in checkout and forms (name, mobile, email, address) is used only for orders and communication.",
      ),
    ],
  },
  {
    title: L("২. ব্রাউজার স্টোরেজ", "2. Browser Storage"),
    body: [
      L(
        "কার্ট, উইশলিস্ট, ভাষা পছন্দ ও সাম্প্রতিক পণ্য আপনার ব্রাউজারের localStorage-এ সংরক্ষিত থাকে; কোনো সার্ভারে পাঠানো হয় না।",
        "Cart, wishlist, language preference and recently viewed items are stored in your browser's localStorage and are not sent to a server.",
      ),
    ],
  },
  {
    title: L("৩. তথ্য শেয়ারিং", "3. Information Sharing"),
    body: [
      L(
        "আপনার তথ্য তৃতীয় পক্ষের কাছে বিক্রি করা হয় না। ডেলিভারির প্রয়োজনে প্রাসঙ্গিক তথ্য শেয়ার হতে পারে।",
        "Your information is not sold to third parties. Relevant details may be shared only as needed for delivery.",
      ),
    ],
  },
  {
    title: L("৪. কুকি ও অ্যানালিটিক্স", "4. Cookies & Analytics"),
    body: [
      L(
        "বর্তমানে বিজ্ঞাপন বা ট্র্যাকিং কুকি ব্যবহার করা হয় না। অ্যানালিটিক্স যুক্ত হলে এই নীতি হালনাগাদ করা হবে।",
        "No advertising or tracking cookies are currently used. This policy will be updated if analytics are added.",
      ),
    ],
  },
  {
    title: L("৫. নীতি পর্যালোচনা", "5. Policy Review"),
    body: [
      L(
        "এই গোপনীয়তা নীতির পূর্ণাঙ্গ সংস্করণ ব্যবসায়িক ও আইনি পর্যালোচনার পর প্রকাশ করা হবে।",
        "The complete privacy policy will be published after business and legal review.",
      ),
    ],
  },
];

/* ------------------------------ Form options ------------------------------ */
export const businessTypes: LocalizedText[] = [
  L("খুচরা দোকান", "Retail Shop"),
  L("পাইকারি ব্যবসা", "Wholesale Business"),
  L("ডিস্ট্রিবিউশন", "Distribution"),
  L("সুপার শপ", "Super Shop"),
  L("অনলাইন ব্যবসা", "Online Business"),
  L("অন্যান্য", "Other"),
];

export const investmentRanges: LocalizedText[] = [
  L("৫০,০০০ টাকা পর্যন্ত", "Up to ৳50,000"),
  L("৫০,০০০ – ১,০০,০০০ টাকা", "৳50,000 – ৳1,00,000"),
  L("১,০০,০০০ – ৫,০০,০০০ টাকা", "৳1,00,000 – ৳5,00,000"),
  L("৫,০০,০০০+ টাকা", "৳5,00,000+"),
];

export const districts: LocalizedText[] = [
  L("ঢাকা", "Dhaka"),
  L("নারায়ণগঞ্জ", "Narayanganj"),
  L("গাজীপুর", "Gazipur"),
  L("চট্টগ্রাম", "Chattogram"),
  L("খুলনা", "Khulna"),
  L("রাজশাহী", "Rajshahi"),
  L("সিলেট", "Sylhet"),
  L("বরিশাল", "Barishal"),
  L("রংপুর", "Rangpur"),
  L("ময়মনসিংহ", "Mymensingh"),
];

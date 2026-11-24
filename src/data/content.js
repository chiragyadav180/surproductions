export const nav = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  { label: "Our Work", to: "/work" },
  { label: "Our Clients", to: "/clients" },
  { label: "Contact Us", to: "/contact" },
];

export const services = [
  {
    slug: "films",
    index: "01",
    title: "Films",
    image: "/images/service-films.jpg",
    imageAlt: "A cinema camera on a dark set, lit with warm gold light",
    summary:
      "Commercial films, creative productions and brand films, planned with a cinematic point of view.",
    paragraphs: [
      "Film at SUR Productions covers commercial films, creative productions and brand films. Each piece is planned as cinema first: a point of view, a rhythm and a finish that can hold a large screen.",
      "The story is shaped around what it has to carry — a product, a place, a person or an idea — without losing the feeling of a film.",
    ],
  },
  {
    slug: "documentaries",
    index: "02",
    title: "Documentaries",
    image: "/images/service-docs.jpg",
    imageAlt: "A documentary camera set beside a softly lit window",
    summary:
      "Real stories, observed with patience and finished with the same visual care as a scripted film.",
    paragraphs: [
      "Documentary work is for true stories that need time, access and a steady eye. The aim is a clear narrative that still feels lived-in.",
      "Interviews, observed scenes and archive can sit in the same film when the story asks for them. The approach is offered here; specific past credits are added only when they are confirmed.",
    ],
  },
  {
    slug: "events",
    index: "03",
    title: "Events",
    image: "/images/service-events.jpg",
    imageAlt: "A dark event stage washed in warm spotlights",
    summary:
      "Award shows, corporate events and large-scale experiences, produced as one live picture.",
    paragraphs: [
      "Event production covers award shows, corporate gatherings and large-scale live experiences. Stage, light, picture and running order are treated as one production.",
      "The room is the edit. What people feel in the moment is decided by the staging, the cameras and the script together.",
    ],
  },
  {
    slug: "digital",
    index: "04",
    title: "Digital",
    image: "/images/service-digital.jpg",
    imageAlt: "A dark edit studio with monitors showing abstract colour",
    summary:
      "Digital campaigns, creative content and online experiences cut for the screen they will play on.",
    paragraphs: [
      "Digital covers campaigns, creative content and online experiences. Pieces are made for the screen they will actually play on, and kept in the same visual language as the wider production.",
      "A digital film, a series of cuts, or a page-led experience can all come from one story.",
    ],
  },
  {
    slug: "communications",
    index: "05",
    title: "Communications",
    image: "/images/service-comms.jpg",
    imageAlt: "A dark table prepared for a visual storytelling session",
    summary:
      "Brand communication, creative campaigns and strategic storytelling told through picture and line.",
    paragraphs: [
      "Communications is brand storytelling: the line, the picture and the campaign working as one. It is for organisations that need to be understood quickly and remembered clearly.",
      "What is said, what is shown and what is left out are decided together, so the message and the picture never drift apart.",
    ],
  },
];

export const workHighlights = [
  {
    slug: "commercial-film",
    title: "Creative Stories",
    line: "Bringing ideas to life on screen.",
    category: "Films",
    filters: ["Films"],
    image: "/images/service-films.jpg",
    size: "wide",
  },
  {
    slug: "award-show",
    title: "Grand Experiences",
    line: "Events that inspire.",
    category: "Events",
    filters: ["Events", "Award Shows"],
    image: "/images/work-events.jpg",
    size: "wide",
  },
  {
    slug: "documentary-story",
    title: "Real Stories",
    line: "Stories that matter.",
    category: "Documentaries",
    filters: ["Documentaries"],
    image: "/images/work-docs.jpg",
    size: "small",
  },
  {
    slug: "digital-campaign",
    title: "Digital Impact",
    line: "Content that connects.",
    category: "Digital",
    filters: ["Digital Campaigns"],
    image: "/images/work-digital.jpg",
    size: "small",
  },
  {
    slug: "brand-communication",
    title: "Brand Voices",
    line: "Messages that resonate.",
    category: "Communications",
    filters: ["Brand Communications"],
    image: "/images/work-comms.jpg",
    size: "small",
  },
];

export const projects = [
  {
    slug: "commercial-film",
    title: "Creative Stories",
    category: "Films",
    service: "films",
    image: "/images/service-films.jpg",
    imageAlt: "Cinema camera on a dark set, lit with warm gold light",
    summary: "Bringing ideas to life on screen.",
    description:
      "This page shows the presentation of a finished film: a hero still, a short story, a gallery and room for credits. The images and title are samples until verified SUR Productions work replaces them.",
    gallery: ["/images/service-films.jpg", "/images/about-set.jpg", "/images/portrait-light.jpg"],
  },
  {
    slug: "documentary-story",
    title: "Real Stories",
    category: "Documentaries",
    service: "documentaries",
    image: "/images/work-docs.jpg",
    imageAlt: "A documentary camera set against a sunset landscape",
    summary: "Stories that matter.",
    description:
      "A documentary page is built to carry a real story without decoration getting in the way. This sample holds the structure. The story itself should be a confirmed SUR Productions film.",
    gallery: ["/images/service-docs.jpg", "/images/portrait-light.jpg", "/images/about-set.jpg"],
  },
  {
    slug: "award-show",
    title: "Grand Experiences",
    category: "Events",
    service: "events",
    image: "/images/work-events.jpg",
    imageAlt: "A large-scale stage production under gold lights",
    summary: "Events that inspire.",
    description:
      "Award shows need a stage picture, a running order and a record of the night. This layout is ready for that material. It does not represent a specific show.",
    gallery: ["/images/service-events.jpg", "/images/hero-stage.jpg", "/images/portrait-light.jpg"],
  },
  {
    slug: "live-event",
    title: "Live Event",
    category: "Events",
    service: "events",
    image: "/images/hero-stage.jpg",
    imageAlt: "Sample still of an empty stage prepared for a live event",
    summary: "Layout sample for a corporate or large-scale live event.",
    description:
      "Live events are presented here with the stage as the hero and space for the story of the night. Replace this sample with a confirmed production when it is ready.",
    gallery: ["/images/hero-stage.jpg", "/images/service-events.jpg", "/images/about-set.jpg"],
  },
  {
    slug: "digital-campaign",
    title: "Digital Impact",
    category: "Digital Campaigns",
    service: "digital",
    image: "/images/work-digital.jpg",
    imageAlt: "An edit desk with a laptop timeline and headphones",
    summary: "Content that connects.",
    description:
      "Digital work is shown as a set of frames from one idea. This sample explains the layout only. Campaign names and results are added when they belong to real work.",
    gallery: ["/images/service-digital.jpg", "/images/service-films.jpg", "/images/service-comms.jpg"],
  },
  {
    slug: "brand-communication",
    title: "Brand Voices",
    category: "Brand Communications",
    service: "communications",
    image: "/images/work-comms.jpg",
    imageAlt: "A gold microphone in front of a live audience",
    summary: "Messages that resonate.",
    description:
      "Brand communication pages lead with the idea, then the pictures that carry it. This one is a sample frame, not a client case study.",
    gallery: ["/images/service-comms.jpg", "/images/service-digital.jpg", "/images/portrait-light.jpg"],
  },
];

export const projectCategories = [
  "All",
  "Films",
  "Documentaries",
  "Award Shows",
  "Events",
  "Digital Campaigns",
  "Brand Communications",
];

/** Empty until real client marks are supplied. Do not invent names. */
export const clients = [];

export const clientSlotCount = 8;

export const principles = [
  {
    title: "Story first",
    text: "The idea is settled before the cameras roll, so every later choice has something to serve.",
  },
  {
    title: "Craft",
    text: "Light, sound, edit and staging are treated as one composition, not separate tasks.",
  },
  {
    title: "Partnership",
    text: "Clients stay close to the work, with a single vision keeping the piece coherent.",
  },
  {
    title: "Finish",
    text: "Delivery is calm, complete and ready for the screen it was made for.",
  },
];

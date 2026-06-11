/**
 * TypeScript definitions for Wantok Workforce Category Data
 * Preserves localized context for Papua New Guinea (PNG).
 */

export enum CategoryID {
  ELECTRIC = "electric",
  PLUMBING = "plumbing",
  CARPENTRY = "carpentry",
  FINANCE = "finance",
  LEGAL = "legal",
  MEDICAL = "medical",
  DESIGN = "design",
  MORE = "more",
}

export interface SubCategory {
  name: string;
  description: string;
}

export interface Category {
  id: CategoryID;
  label: string;
  icon: string;
  color: string;
  subcategories: SubCategory[];
}

export const CATEGORY_DATA: Category[] = [
  {
    id: CategoryID.ELECTRIC,
    label: "Electric",
    icon: "⚡",
    color: "#F59E0B",
    subcategories: [
      { name: "House & Compound Wiring", description: "Full electrical installations for residential and compound settings in PNG." },
      { name: "Solar Panel & Inverter Installations", description: "Off-grid power solutions, critical for rural and remote areas." },
      { name: "Backup Diesel Generator Servicing", description: "Maintenance for essential backup power systems." },
      { name: "Electrical Fault Audits", description: "Troubleshooting and safety audits for buildings." },
      { name: "Electronics Repairs", description: "Mobile phone and electronics software flashing and hardware repairs." }
    ]
  },
  {
    id: CategoryID.PLUMBING,
    label: "Plumbing",
    icon: "🔧",
    color: "#3B82F6",
    subcategories: [
      { name: "Water Pipe Leak Repairs", description: "Fixing leaks and fitting pipes for reliable water access." },
      { name: "Tuffa Tank Connections", description: "Installation and valve setup for Tuffa (water storage) tanks." },
      { name: "Bathroom Component Plumbing", description: "Installation of toilets, sinks, and showers." },
      { name: "Sewerage & Waste-line Troubleshooting", description: "Managing drainage and waste systems effectively." },
      { name: "Water & Fuel Hauling", description: "Micro-logistics for water and fuel delivery in local communities." }
    ]
  },
  {
    id: CategoryID.CARPENTRY,
    label: "Carpentry",
    icon: "🪚",
    color: "#8B5CF6",
    subcategories: [
      { name: "Structural Timber Framework", description: "Building frameworks and wall bracing using local timber." },
      { name: "Housing Extensions", description: "Adding verandas and expanding existing housing structures." },
      { name: "Corrugated Iron Roofing", description: "Installing and patching leakages in iron roofs." },
      { name: "Door & Window Installations", description: "Fitting frames and installing secure locks." },
      { name: "Custom Furniture Making", description: "Building tables, benches, and cabinets for local homes." },
      { name: "Structural Painting", description: "Scaffolding erection and professional painting assistance." }
    ]
  },
  {
    id: CategoryID.FINANCE,
    label: "Finance",
    icon: "💼",
    color: "#10B981",
    subcategories: [
      { name: "Micro-Bookkeeping", description: "Basic accounting for MSMEs, canteens, and local shops." },
      { name: "IRC Tax Compliance", description: "Assistance with IRC forms and tax compliance in PNG." },
      { name: "Cloud Ledger Management", description: "Using MYOB, Xero, or QuickBooks for small businesses." },
      { name: "Cash-Flow Planning", description: "Budgeting and planning for local small business growth." },
      { name: "Mobile Money Float Agents", description: "Independent agents for mobile money cash-outs." },
      { name: "Utility Token Resellers", description: "Intermediaries for EasyPay and other utility tokens." }
    ]
  },
  {
    id: CategoryID.LEGAL,
    label: "Legal",
    icon: "⚖️",
    color: "#EF4444",
    subcategories: [
      { name: "Legal Document Drafting", description: "Drafting and reviewing basic legal documents." },
      { name: "Statutory Declarations Prep", description: "Preparing documents for Commissioner of Oaths." },
      { name: "Customary Land Mediation", description: "Guidance on local land disputes and customary mediation." },
      { name: "ILG Incorporation Advice", description: "Support for Incorporated Land Groups and community consultancies." },
      { name: "IPA Business Registration", description: "Submitting local business names and IPA registrations." }
    ]
  },
  {
    id: CategoryID.MEDICAL,
    label: "Medical",
    icon: "🏥",
    color: "#EC4899",
    subcategories: [
      { name: "Community Nursing", description: "On-call nursing care and wound dressing in the community." },
      { name: "Basic First Aid", description: "Emergency assistance and wound cleaning." },
      { name: "Wellness Checks", description: "Blood pressure monitoring and basic health checks." },
      { name: "Health Literacy Guidance", description: "Education on preventive health and wellness." }
    ]
  },
  {
    id: CategoryID.DESIGN,
    label: "Design",
    icon: "🎨",
    color: "#F97316",
    subcategories: [
      { name: "Commercial Signage", description: "Billboard and signage painting for local businesses." },
      { name: "E-Commerce Logo Creation", description: "Logo design for PNG SMEs and digital platforms." },
      { name: "Digital Printing Layouts", description: "Graphics for flyers and local printing needs." },
      { name: "Social Media Visual Assets", description: "Designing graphics for Facebook and social marketing." },
      { name: "Custom Uniform Screen Printing", description: "Layouts and screen printing for local organizations." }
    ]
  },
  {
    id: CategoryID.MORE,
    label: "More",
    icon: "📐",
    color: "#6B7280",
    subcategories: [
      { name: "PMV & Taxi Operators", description: "Relief drivers for Public Motor Vehicles and taxi services." },
      { name: "Marketplace Cargo Crew", description: "Loaders for wharves, airports, and markets like Gordon's." },
      { name: "Logistics & Delivery Riders", description: "Dispatch riders using motorbikes or Utes for local delivery." },
      { name: "Landscaping & Grass Cutting", description: "Professional brush-cutter operators and yard maintenance." },
      { name: "Deep Cleaning Services", description: "Property and yard deep cleaning for residential settings." },
      { name: "Security Caretakers", description: "Short-term residential security and property care." },
      { name: "Welding & Metal Fabrication", description: "Building security gates and burglar bars." },
      { name: "Mobile Auto Mechanics", description: "Roadside assistance and breakdown mechanical repairs." },
      { name: "Commercial Appliance Techs", "description": "Repairing AC units and deep freezers for local shops." },
      { name: "Catering & Kitchen Hands", description: "Assistants for local food preparation and events." },
      { name: "Event Setup Crew", "description": "Erecting tents, marquees, and stage setups." },
      { name: "Micro-Farmer Supply Attendants", "description": "Produce sorting and washing for local market supply." },
      { name: "Livestock Pen Handlers", "description": "Caring for poultry and livestock in small-scale farming." },
      { name: "Market Stall Stand-ins", "description": "Temporary sales vendors for local marketplace stalls." },
      { name: "Mobile Hairdressers & Barbers", "description": "Braiding and hair cutting services on-call." },
      { name: "Tailoring & Sewing Repairs", "description": "Sewing Meri blouses and uniform repairs." }
    ]
  }
];

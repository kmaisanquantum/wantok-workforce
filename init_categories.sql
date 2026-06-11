-- PostgreSQL Schema for Wantok Workforce Categories

BEGIN;

-- Create parent categories table
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    icon TEXT,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create sub-categories table
CREATE TABLE IF NOT EXISTS sub_categories (
    id SERIAL PRIMARY KEY,
    category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert Parent Categories
INSERT INTO categories (id, label, icon, color) VALUES
('electric', 'Electric', '⚡', '#F59E0B'),
('plumbing', 'Plumbing', '🔧', '#3B82F6'),
('carpentry', 'Carpentry', '🪚', '#8B5CF6'),
('finance', 'Finance', '💼', '#10B981'),
('legal', 'Legal', '⚖️', '#EF4444'),
('medical', 'Medical', '🏥', '#EC4899'),
('design', 'Design', '🎨', '#F97316'),
('more', 'More', '📐', '#6B7280')
ON CONFLICT (id) DO UPDATE SET
    label = EXCLUDED.label,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color;

-- Insert Sub-Categories (Electric)
INSERT INTO sub_categories (category_id, name, description) VALUES
('electric', 'House & Compound Wiring', 'Full electrical installations for residential and compound settings in PNG.'),
('electric', 'Solar Panel & Inverter Installations', 'Off-grid power solutions, critical for rural and remote areas.'),
('electric', 'Backup Diesel Generator Servicing', 'Maintenance for essential backup power systems.'),
('electric', 'Electrical Fault Audits', 'Troubleshooting and safety audits for buildings.'),
('electric', 'Electronics Repairs', 'Mobile phone and electronics software flashing and hardware repairs.');

-- Insert Sub-Categories (Plumbing)
INSERT INTO sub_categories (category_id, name, description) VALUES
('plumbing', 'Water Pipe Leak Repairs', 'Fixing leaks and fitting pipes for reliable water access.'),
('plumbing', 'Tuffa Tank Connections', 'Installation and valve setup for Tuffa (water storage) tanks.'),
('plumbing', 'Bathroom Component Plumbing', 'Installation of toilets, sinks, and showers.'),
('plumbing', 'Sewerage & Waste-line Troubleshooting', 'Managing drainage and waste systems effectively.'),
('plumbing', 'Water & Fuel Hauling', 'Micro-logistics for water and fuel delivery in local communities.');

-- Insert Sub-Categories (Carpentry)
INSERT INTO sub_categories (category_id, name, description) VALUES
('carpentry', 'Structural Timber Framework', 'Building frameworks and wall bracing using local timber.'),
('carpentry', 'Housing Extensions', 'Adding verandas and expanding existing housing structures.'),
('carpentry', 'Corrugated Iron Roofing', 'Installing and patching leakages in iron roofs.'),
('carpentry', 'Door & Window Installations', 'Fitting frames and installing secure locks.'),
('carpentry', 'Custom Furniture Making', 'Building tables, benches, and cabinets for local homes.'),
('carpentry', 'Structural Painting', 'Scaffolding erection and professional painting assistance.');

-- Insert Sub-Categories (Finance)
INSERT INTO sub_categories (category_id, name, description) VALUES
('finance', 'Micro-Bookkeeping', 'Basic accounting for MSMEs, canteens, and local shops.'),
('finance', 'IRC Tax Compliance', 'Assistance with IRC forms and tax compliance in PNG.'),
('finance', 'Cloud Ledger Management', 'Using MYOB, Xero, or QuickBooks for small businesses.'),
('finance', 'Cash-Flow Planning', 'Budgeting and planning for local small business growth.'),
('finance', 'Mobile Money Float Agents', 'Independent agents for mobile money cash-outs.'),
('finance', 'Utility Token Resellers', 'Intermediaries for EasyPay and other utility tokens.');

-- Insert Sub-Categories (Legal)
INSERT INTO sub_categories (category_id, name, description) VALUES
('legal', 'Legal Document Drafting', 'Drafting and reviewing basic legal documents.'),
('legal', 'Statutory Declarations Prep', 'Preparing documents for Commissioner of Oaths.'),
('legal', 'Customary Land Mediation', 'Guidance on local land disputes and customary mediation.'),
('legal', 'ILG Incorporation Advice', 'Support for Incorporated Land Groups and community consultancies.'),
('legal', 'IPA Business Registration', 'Submitting local business names and IPA registrations.');

-- Insert Sub-Categories (Medical)
INSERT INTO sub_categories (category_id, name, description) VALUES
('medical', 'Community Nursing', 'On-call nursing care and wound dressing in the community.'),
('medical', 'Basic First Aid', 'Emergency assistance and wound cleaning.'),
('medical', 'Wellness Checks', 'Blood pressure monitoring and basic health checks.'),
('medical', 'Health Literacy Guidance', 'Education on preventive health and wellness.');

-- Insert Sub-Categories (Design)
INSERT INTO sub_categories (category_id, name, description) VALUES
('design', 'Commercial Signage', 'Billboard and signage painting for local businesses.'),
('design', 'E-Commerce Logo Creation', 'Logo design for PNG SMEs and digital platforms.'),
('design', 'Digital Printing Layouts', 'Graphics for flyers and local printing needs.'),
('design', 'Social Media Visual Assets', 'Designing graphics for Facebook and social marketing.'),
('design', 'Custom Uniform Screen Printing', 'Layouts and screen printing for local organizations.');

-- Insert Sub-Categories (More)
INSERT INTO sub_categories (category_id, name, description) VALUES
('more', 'PMV & Taxi Operators', 'Relief drivers for Public Motor Vehicles and taxi services.'),
('more', 'Marketplace Cargo Crew', 'Loaders for wharves, airports, and markets like Gordon''s.'),
('more', 'Logistics & Delivery Riders', 'Dispatch riders using motorbikes or Utes for local delivery.'),
('more', 'Landscaping & Grass Cutting', 'Professional brush-cutter operators and yard maintenance.'),
('more', 'Deep Cleaning Services', 'Property and yard deep cleaning for residential settings.'),
('more', 'Security Caretakers', 'Short-term residential security and property care.'),
('more', 'Welding & Metal Fabrication', 'Building security gates and burglar bars.'),
('more', 'Mobile Auto Mechanics', 'Roadside assistance and breakdown mechanical repairs.'),
('more', 'Commercial Appliance Techs', 'Repairing AC units and deep freezers for local shops.'),
('more', 'Catering & Kitchen Hands', 'Assistants for local food preparation and events.'),
('more', 'Event Setup Crew', 'Erecting tents, marquees, and stage setups.'),
('more', 'Micro-Farmer Supply Attendants', 'Produce sorting and washing for local market supply.'),
('more', 'Livestock Pen Handlers', 'Caring for poultry and livestock in small-scale farming.'),
('more', 'Market Stall Stand-ins', 'Temporary sales vendors for local marketplace stalls.'),
('more', 'Mobile Hairdressers & Barbers', 'Braiding and hair cutting services on-call.'),
('more', 'Tailoring & Sewing Repairs', 'Sewing Meri blouses and uniform repairs.');

COMMIT;

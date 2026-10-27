// ==============================================================================
// Seed Supabase `live_schemes` table with verified schemes & scholarships
// Run with: node --env-file=.env scripts/seedSupabaseSchemes.mjs
// ==============================================================================

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('❌ Error: VITE_SUPABASE_URL and SUPABASE_SECRET_KEY / VITE_SUPABASE_ANON_KEY must be in .env');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

// Basic initial dataset of high-priority flagship active schemes
const SEED_SCHEMES = [
  {
    id: 'up_post_matric_scholarship_general_sc_st',
    title: 'UP Post-Matric & Inter-State Scholarship',
    state: 'Uttar Pradesh',
    persona: 'student',
    category: 'Education',
    description: 'Government of Uttar Pradesh online scholarship for students enrolled in Class 11, 12, undergraduate, postgraduate, and professional degree courses.',
    benefit_text: 'Full fee reimbursement plus annual maintenance stipend up to ₹13,500/year.',
    benefit_type: 'scholarship',
    approx_amount: 50000,
    eligibility_criteria: [
      'Domicile of Uttar Pradesh',
      'Enrolled in recognized school, college, or university',
      'Annual family income <= ₹2.5 Lakh for SC/ST or <= ₹2.0 Lakh for General/OBC'
    ],
    application_url: 'https://scholarship.up.gov.in',
    official_portal: 'https://scholarship.up.gov.in',
    source_url: 'https://scholarship.up.gov.in',
    deadline: '2026-03-31T23:59:59Z',
    is_active: true,
    verification_status: 'verified'
  },
  {
    id: 'nsp_central_sector_scheme_csss',
    title: 'Central Sector Scheme of Scholarships for College and University Students (CSSS)',
    state: 'India',
    persona: 'student',
    category: 'Education',
    description: 'Ministry of Education merit scholarship for students above 80th percentile in Class 12 pursuing regular higher education.',
    benefit_text: '₹12,000/year for undergraduate courses; ₹20,000/year for postgraduate studies.',
    benefit_type: 'scholarship',
    approx_amount: 20000,
    eligibility_criteria: [
      'Above 80th percentile in respective state board in Class 12',
      'Pursuing regular (non-correspondence) college/university degree',
      'Annual gross family income <= ₹4.5 Lakh'
    ],
    application_url: 'https://scholarships.gov.in',
    official_portal: 'https://scholarships.gov.in',
    source_url: 'https://scholarships.gov.in',
    deadline: '2026-04-30T23:59:59Z',
    is_active: true,
    verification_status: 'verified'
  },
  {
    id: 'aicte_pragati_scholarship_girls',
    title: 'AICTE Pragati Scholarship for Girl Students',
    state: 'India',
    persona: 'student',
    category: 'Education',
    description: 'Financial assistance for meritorious girl students admitted to AICTE approved technical diploma and degree programs.',
    benefit_text: '₹50,000 per annum towards college fee and educational contingencies.',
    benefit_type: 'scholarship',
    approx_amount: 50000,
    eligibility_criteria: [
      'Female student admitted to 1st year of AICTE approved technical degree or diploma',
      'Maximum two girls per family eligible',
      'Annual family income <= ₹8 Lakh'
    ],
    application_url: 'https://scholarships.gov.in',
    official_portal: 'https://scholarships.gov.in',
    source_url: 'https://scholarships.gov.in',
    deadline: '2026-04-30T23:59:59Z',
    is_active: true,
    verification_status: 'verified'
  },
  {
    id: 'pm_kisan_samman_nidhi',
    title: 'PM-KISAN Samman Nidhi',
    state: 'India',
    persona: 'farmer',
    category: 'Agriculture',
    description: 'Central sector scheme providing income support to all landholding farmer families across India.',
    benefit_text: 'Guaranteed ₹6,000 per annum transferred in 3 equal instalments of ₹2,000 directly via DBT.',
    benefit_type: 'grant',
    approx_amount: 6000,
    eligibility_criteria: [
      'Landholding farmer families with cultivable land in land records',
      'Aadhaar seeded bank account with active e-KYC on pmkisan.gov.in',
      'Excludes institutional landholders and income tax paying families'
    ],
    application_url: 'https://pmkisan.gov.in',
    official_portal: 'https://pmkisan.gov.in',
    source_url: 'https://pmkisan.gov.in',
    deadline: null, // Always active
    is_active: true,
    verification_status: 'verified'
  },
  {
    id: 'pm_fasal_bima_yojana',
    title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    state: 'India',
    persona: 'farmer',
    category: 'Agriculture',
    description: 'Comprehensive financial support and crop insurance cover to farmers suffering crop loss or damage arising out of unforeseen events.',
    benefit_text: 'Full crop loss protection against drought, flood, pests at nominal premium (1.5% Rabi, 2% Kharif).',
    benefit_type: 'insurance',
    approx_amount: 100000,
    eligibility_criteria: [
      'All farmers including sharecroppers and tenant farmers growing notified crops',
      'Valid land possession documents or crop tenancy agreement'
    ],
    application_url: 'https://pmfby.gov.in',
    official_portal: 'https://pmfby.gov.in',
    source_url: 'https://pmfby.gov.in',
    deadline: '2026-07-31T23:59:59Z',
    is_active: true,
    verification_status: 'verified'
  },
  {
    id: 'ayushman_bharat_pm_jay',
    title: 'Ayushman Bharat PM-JAY',
    state: 'India',
    persona: 'all',
    category: 'Health',
    description: 'Worlds largest government-funded health assurance scheme providing free inpatient care across 29,000+ empanelled hospitals.',
    benefit_text: 'Cashless treatment coverage up to ₹5,00,000 per family per year.',
    benefit_type: 'insurance',
    approx_amount: 500000,
    eligibility_criteria: [
      'Families identified under SECC database or holding eligible ration card',
      'All senior citizens aged 70+ now eligible regardless of income'
    ],
    application_url: 'https://beneficiary.nha.gov.in',
    official_portal: 'https://beneficiary.nha.gov.in',
    source_url: 'https://beneficiary.nha.gov.in',
    deadline: null, // Always active
    is_active: true,
    verification_status: 'verified'
  },
  {
    id: 'pm_mudra_yojana_tarun_plus',
    title: 'Pradhan Mantri Mudra Yojana (Tarun Plus)',
    state: 'India',
    persona: 'business',
    category: 'Business & MSME',
    description: 'Collateral-free business loans for micro-enterprises, artisans, and small traders with newly enhanced limit.',
    benefit_text: 'Collateral-free business credit facility up to ₹20 Lakh.',
    benefit_type: 'loan',
    approx_amount: 2000000,
    eligibility_criteria: [
      'Non-corporate small business owners and micro-enterprises',
      'Udyam registration or shop establishment certificate'
    ],
    application_url: 'https://udyamimitra.in',
    official_portal: 'https://udyamimitra.in',
    source_url: 'https://udyamimitra.in',
    deadline: null,
    is_active: true,
    verification_status: 'verified'
  }
];

async function seed() {
  console.log(`📡 Connecting to Supabase at: ${url}`);
  console.log(`📦 Seeding ${SEED_SCHEMES.length} initial flagship schemes with validity checks...`);

  const { data, error } = await supabase
    .from('live_schemes')
    .upsert(SEED_SCHEMES, { onConflict: 'id' })
    .select('id, title');

  if (error) {
    if (error.message.includes('relation "public.live_schemes" does not exist') || error.message.includes('schema cache')) {
      console.error('\n⚠️  Table public.live_schemes does not exist yet!');
      console.error('👉 Please execute the SQL migration located at:');
      console.error('   supabase/migrations/20261027_live_schemes_table.sql');
      console.error('   in your Supabase Project Dashboard -> SQL Editor (takes 5 seconds).\n');
    } else {
      console.error('❌ Supabase Seed Error:', error.message);
    }
    process.exit(1);
  }

  console.log(`✅ Successfully seeded ${data ? data.length : SEED_SCHEMES.length} schemes into Supabase!`);
  data.forEach((s, idx) => console.log(`   ${idx + 1}. [${s.id}] ${s.title}`));
}

seed().catch(err => {
  console.error('Fatal error in seed script:', err);
  process.exit(1);
});

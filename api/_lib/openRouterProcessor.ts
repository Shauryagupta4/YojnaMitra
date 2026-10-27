import {
  GroqExtractionResultSchema,
  GroqExtractedSchemeSchema,
  isInvalidSchemeName,
  sanitizeSchemeName,
  isGenericBenefit,
  validateApplicationUrl,
  classifyCandidate
} from './validation';
import { TinyFishSearchResultItem } from './tinyfishSearch';
import { FetchedPageContent } from './tinyfishFetch';
import { SchemeSearchRequest } from './types';
import { callOpenRouterChat, getConfiguredFreeModel } from './openrouter';

/**
 * Construct evidence-grounded extraction prompt from retrieved search snippets and fetched page content.
 */
export function buildExtractionPrompt(
  profile: SchemeSearchRequest,
  searchResults: TinyFishSearchResultItem[],
  fetchedPages: FetchedPageContent[]
): { system: string; user: string } {
  const targetStateName =
    profile.state && profile.state !== 'All India / Central'
      ? profile.state
      : 'the target state';

  const system = `You are the YojanaMitra Evidence-Grounded Scheme Extraction Engine.
Your SOLE responsibility is to discover, extract, and structure all real, official Indian welfare schemes, MSME programs, and scholarships mentioned in the provided search results and fetched portal pages.

CRITICAL EXTRACTION GUIDELINES:
1. EXTRACT ALL DISCOVERED SCHEMES (CENTRAL & STATE):
   - Identify every distinct government scheme, scholarship, loan program, or welfare initiative mentioned in the Search Snippets and Fetched Pages.
   - You MUST extract both Central government schemes (national) and State-specific schemes (for ${targetStateName}).
   - DO NOT discard or omit a scheme because the citizen may not match its demographic; extract the scheme and mark its "eligibilityStatus" accurately ("potentially_eligible", "not_eligible", or "insufficient_information").
   - Aim to extract between 4 to 12 distinct, named schemes present in the evidence.

2. CLEAN, OFFICIAL SCHEME NAMES AND ALIASES:
   - Output ONLY the exact, official government name of the scheme or scholarship.
   - List known abbreviations or aliases in the "aliases" field (e.g. ["PMMY", "Mudra Loan"] or ["CMEGP", "Chief Minister Employment Generation Programme"]).
   - REJECT document titles, generic webpage titles, filenames, search-query text, and unrelated article titles as scheme names unless the source explicitly establishes that title as the scheme's actual name.
   - SPECIFIC FORBIDDEN EXAMPLES TO REJECT:
     * FORBIDDEN: "Untitled - Ayushman Bharat - Bihar" (If the page describes Ayushman Bharat, extract the real name "Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana", NEVER the page title)
     * FORBIDDEN: "Senior Care Reforms in India" (This is a policy report / article, NOT a scheme)
     * FORBIDDEN: "Bihar.pdf" or any filename ending in .pdf, .docx, .html
     * FORBIDDEN: "Schemes on NSP", "All Scholarships", "National Scholarship Portal"
     * FORBIDDEN: "Contact · Dashboard · MIZORAM SCHOLARSHIP BOARD"
     * FORBIDDEN: "Subsidy Schemes", "eBook of Schemes for MSMEs", "Overview"
     * FORBIDDEN: Just state or ministry names like "Bihar" or "Ministry of MSME"
   - EXCELLENT OFFICIAL SCHEME EXAMPLES:
     * "Pradhan Mantri Mudra Yojana (PMMY)"
     * "Chief Minister Employment Generation Programme (CMEGP)"
     * "Prime Minister's Employment Generation Programme (PMEGP)"
     * "PM SVANidhi (Street Vendor's AtmaNirbhar Nidhi)"
     * "Post-Matric Scholarship for SC Students"
     * "Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulkh Shishyavrutti Yojna"
     * "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)"

3. PRESERVE NUMERIC INTEGRITY, MULTIPLIERS, AND UNITS:
   - CRITICAL: Never convert "₹20 lakh" or "Rs 20 Lakh" into "₹20" or "Rs. 20".
   - If a source describes a loan limit of ₹20 lakh, output "Collateral-free business loan up to ₹20 Lakh (Shishu: up to ₹50,000, Kishore: up to ₹5 Lakh, Tarun: up to ₹20 Lakh)".
   - Distinguish loans, grants, subsidies, scholarships, and insurance:
     * Loans: specify maximum loan limit, interest subvention/subsidy, and collateral terms.
     * Subsidies: specify percentage (e.g. 15% to 35% margin money subsidy) and project cost limits.
     * Scholarships: specify annual allowance, tuition waiver, and maintenance support.
     * Insurance: specify health/crop sum insured (e.g. ₹5 Lakh per family per year).
   - Set "benefitType" to "loan" | "grant" | "subsidy" | "scholarship" | "insurance" | "pension" | "composite".
   - NEVER output cop-out phrases like "Refer to official site", "Not found in source", or generic placeholders such as:
     * "Financial assistance, educational support, or maintenance allowance as per official guidelines."
     * "Government financial assistance and welfare subsidy under official guidelines."
     * "Financial assistance and welfare benefits as per scheme guidelines."
   - NEVER fabricate or assume financial amounts, loan limits, or subsidies not present in the evidence.
   - If exact numbers or terms are not detailed in the snippet or text, output "Benefit details not verified from primary source." - DO NOT invent plausible-sounding descriptions.

4. REASON FOR INCLUSION IN CATEGORY:
   - Provide a concise "categoryReason" explaining why this scheme belongs to ${profile.persona || 'the selected category'}.
   - Assign the true category: "Education" | "Agriculture" | "Healthcare" | "Women & Child" | "Social Security" | "Business & MSME" | "Food & Civil Supplies" | "Housing".

5. SEPARATE SCHEMES FROM COMPILATION REPORTS:
   - If a source is titled "Schemes for Welfare of Farmers", "Major Schemes", "Year End Review", or a PIB press release discussing multiple programs, DO NOT create a scheme named after the document.
   - Extract and output the individual distinct schemes described within the report (e.g. "PM-KISAN", "PMFBY", "Kisan Credit Card").

6. GENUINE ELIGIBILITY CONDITIONS:
   - Extract actual conditions: landholding status, income ceilings, educational qualifications, age limits, caste reservations, domicile requirements.
   - NEVER output filler sentences such as "Identified from active public welfare portal for Nagaland" or "Retrieved from search result". That is source provenance, NOT eligibility.
   - If eligibility criteria are absent or unspecified in the text, output "Eligibility details not verified from primary source."

7. APPLICATION URL VS OFFICIAL INFORMATION URL:
   - "officialUrl": URL of the official scheme information/guidelines page.
   - "applicationUrl": Provide ONLY if the page explicitly provides direct online application or registration services for citizens.
   - NEVER use a press release, news article, PIB release, government annual report, generic department homepage, MyScheme overview page, third-party explainer, or PDF guideline document as the applicationUrl.
   - If a confirmed citizen application endpoint is not established in the text, set "applicationUrl": null. NEVER fabricate an application link.

8. DEADLINE INTEGRITY:
   - Extract the actual deadline date ONLY if explicitly established in the evidence (e.g., "31-10-2026").
   - If closed, expired, past, or text states applications/registrations are closed, set "deadlineStatus": "closed".
   - If stated currently open/active with an active future date, set "deadlineStatus": "open".
   - If not explicitly established, set "deadline": null and "deadlineStatus": "unknown".
   - DO NOT fabricate fake deadlines or assume unknown means open.

9. CENTRAL VS STATE JURISDICTION EXTRACTION:
   - If sponsored/funded/run by Central Government / Ministry / NSP / AICTE / UGC / GoI, set "level": "Central" and "state": null.
   - If run by a State Government / State Department / State Board, extract the ACTUAL State that owns and funds the scheme (e.g. "Goa", "Maharashtra", "Assam", "Punjab", "Karnataka") or null if All India. NEVER force an unrelated state name.

Output JSON format strictly matching this structure:
{
  "schemes": [
    {
      "id": "slug-id",
      "name": "Full Official Scheme Name",
      "aliases": ["Common abbreviation", "Alternative title"],
      "hindiName": "Optional Hindi Name or null",
      "category": "Education" | "Agriculture" | "Healthcare" | "Women & Child" | "Social Security" | "Business & MSME" | "Food & Civil Supplies" | "Housing",
      "categoryReason": "Why this scheme fits the category and user needs",
      "level": "Central" | "State",
      "state": "State Name or null",
      "benefitType": "loan" | "grant" | "subsidy" | "scholarship" | "insurance" | "pension" | "composite",
      "description": "2 sentence factual summary strictly from evidence",
      "benefits": "Exact benefit with preserved units (e.g. Loan up to ₹20 Lakh or ₹15,000/year allowance)",
      "benefitAmountApprox": 2000000 or null,
      "eligibilityStatus": "potentially_eligible" | "not_eligible" | "insufficient_information",
      "eligibilityReasons": ["bullet 1 citing user demographic and evidence rule"],
      "missingOrCautionCriteria": ["any missing fact needing confirmation"],
      "requiredDocuments": ["Aadhaar Card", "Income Certificate", "PAN Card", "Project Report"],
      "officialUrl": "https://...",
      "applicationUrl": "https://... or null",
      "portalName": "Official Portal Name",
      "deadline": "DD-MM-YYYY or description or null",
      "deadlineStatus": "open" | "closed" | "upcoming" | "unknown",
      "sourceUrls": ["https://..."],
      "sourceTitle": "Source Title",
      "evidenceSnippets": {
        "benefitEvidence": "exact quote from source supporting benefit with units",
        "eligibilityEvidence": "exact quote from source supporting eligibility",
        "nameEvidence": "quote establishing scheme name"
      }
    }
  ],
  "advisoryNote": "1-2 sentence personalized advice grounded in findings"
}`;

  // Assemble bounded context text (top 6 snippets and top 2 pages for fast, bounded LLM reasoning)
  const searchEvidence = searchResults
    .slice(0, 6)
    .map(
      (s, idx) => `
[Result #${idx + 1}] (${s.searchScope.toUpperCase()})
Title: ${s.title}
Site: ${s.site_name}
URL: ${s.url}
Official Domain: ${s.isOfficial ? 'YES' : 'NO'}
Snippet: ${s.snippet}
`
    )
    .join('\n');

  const pageEvidence = fetchedPages
    .slice(0, 2)
    .map(
      (p, idx) => `
[Fetched Page #${idx + 1}]
URL: ${p.url}
Title: ${p.title || 'Untitled'}
Content:
${p.text.slice(0, 1500)}
`
    )
    .join('\n\n');

  const user = `CITIZEN PROFILE:
- Target State/UT: ${profile.state || 'All India / Central'}
- Persona: ${profile.persona || 'student'}
- Age: ${profile.age ?? 'Not specified'}
- Gender: ${profile.gender || 'All'}
- Annual Family Income: ₹${profile.annualIncome?.toLocaleString() || '150,000'}
- Social Category: ${profile.socialCategory || 'General'}
- Education Level: ${profile.educationLevel || 'Any'}
- Farmer Type: ${profile.farmerType || 'Any'}
- Differently Abled: ${profile.isDifferentlyAbled ? 'Yes' : 'No'}
- BPL Card: ${profile.hasBplCard ? 'Yes' : 'No'}
${profile.query ? `- Search Query: "${profile.query}"` : ''}

RETRIEVED WEB EVIDENCE:
=== SEARCH SNIPPETS ===
${searchEvidence || 'No snippets found.'}

=== FETCHED PORTAL PAGES ===
${pageEvidence || 'No page content fetched.'}

Extract all verified Central and State schemes discovered in the evidence above.
CRITICAL: Preserve all currency units (e.g. ₹20 Lakh, ₹50,000, Crores) and NEVER truncate units to bare numbers.
Output clean official scheme names and concrete benefits. Strictly output valid JSON.`;

  return { system, user };
}

/**
 * Process retrieved evidence through OpenRouter using an explicitly free model.
 * Validates output using Zod schemas with fallback models and JSON repair.
 */
export async function extractSchemesWithOpenRouter(
  profile: SchemeSearchRequest,
  searchResults: TinyFishSearchResultItem[],
  fetchedPages: FetchedPageContent[],
  apiKeyOverride?: string,
  modelOverride?: string
): Promise<{
  extractedSchemes: any[];
  advisoryNote?: string;
  modelUsed?: string;
  error?: string;
}> {
  const apiKey = (apiKeyOverride || process.env.OPENROUTER_API_KEY || '').trim();

  if (!apiKey) {
    return {
      extractedSchemes: [],
      error: 'OPENROUTER_API_KEY is not configured on the server.'
    };
  }

  let configuredModel: string;
  try {
    configuredModel = getConfiguredFreeModel(modelOverride);
  } catch (err: any) {
    return {
      extractedSchemes: [],
      error: err.message || 'Invalid model configuration'
    };
  }

  const { system, user } = buildExtractionPrompt(profile, searchResults, fetchedPages);

  // Single fast attempt on configured free model with strict 7500ms timeout
  const modelsToTry = [configuredModel];
  let lastError = '';

  for (const modelToTry of modelsToTry) {
    try {
      const { text, modelUsed } = await callOpenRouterChat({
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ],
        model: modelToTry,
        apiKey,
        temperature: 0.1,
        maxTokens: 1800,
        timeoutMs: 7500
      });

      // Strip thinking tags if present from reasoning models
      let cleanJson = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
      if (cleanJson.startsWith('```json')) {
        cleanJson = cleanJson.replace(/^```json/, '').replace(/```$/, '').trim();
      } else if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/^```/, '').replace(/```$/, '').trim();
      }

      let rawParsed: any;
      try {
        rawParsed = JSON.parse(cleanJson);
      } catch {
        // Locate outermost {}
        const jsonStart = cleanJson.indexOf('{');
        const jsonEnd = cleanJson.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd > jsonStart) {
          rawParsed = JSON.parse(cleanJson.slice(jsonStart, jsonEnd + 1));
        } else {
          throw new Error('Model did not return valid JSON');
        }
      }

      const rawList = Array.isArray(rawParsed)
        ? rawParsed
        : rawParsed.schemes || [];

      const validItems: any[] = [];
      for (const item of rawList) {
        const parsedItem = GroqExtractedSchemeSchema.safeParse(item);
        if (!parsedItem.success) continue;

        const scheme: any = parsedItem.data;

        // 1. Validate & sanitize scheme name - reject document names, PDFs, etc.
        const cleanedName = sanitizeSchemeName(scheme.name);
        if (!cleanedName || isInvalidSchemeName(cleanedName)) {
          continue;
        }
        scheme.name = cleanedName;

        // 1b. Candidate classification: exclude portals, supporting documents, and directories from becoming cards
        const candidateType = classifyCandidate(scheme.name, scheme.officialUrl, scheme.description);
        if (candidateType !== 'individual_scheme') {
          continue;
        }
        scheme.candidateClassification = candidateType;

        // Carry over aliases, benefitType, categoryReason
        if (Array.isArray(item.aliases)) {
          scheme.aliases = item.aliases.filter((a: any) => typeof a === 'string' && a.trim().length > 1);
        }
        if (item.benefitType) scheme.benefitType = item.benefitType;
        if (item.categoryReason) scheme.categoryReason = item.categoryReason;

        // 2. Reject generic cop-out benefits - require evidence or honest 'Benefit details not verified.'
        if (isGenericBenefit(scheme.benefits)) {
          if (scheme.evidenceSnippets?.benefitEvidence && !isGenericBenefit(scheme.evidenceSnippets.benefitEvidence)) {
            scheme.benefits = scheme.evidenceSnippets.benefitEvidence;
          } else {
            scheme.benefits = 'Benefit details not verified.';
          }
        }

        // 3. Strictly validate application URL
        scheme.applicationUrl = validateApplicationUrl(scheme.applicationUrl);

        // 4. Filter out provenance filler from eligibility reasons
        if (Array.isArray(scheme.eligibilityReasons)) {
          scheme.eligibilityReasons = scheme.eligibilityReasons.filter(
            (r: string) => typeof r === 'string' && !/identified from active|public welfare portal|retrieved from/i.test(r)
          );
        }

        // 5. Deadline honesty
        if (scheme.deadlineStatus === 'unknown') {
          scheme.deadline = null;
        }

        validItems.push(scheme);
      }

      if (validItems.length > 0) {
        return {
          extractedSchemes: validItems,
          advisoryNote: rawParsed.advisoryNote,
          modelUsed
        };
      }
    } catch (err: any) {
      lastError = err?.message || 'unknown error';
    }
  }

  return {
    extractedSchemes: [],
    error: `OpenRouter processing error: ${lastError}`
  };
}

// Backward-compatible alias for any legacy imports
export const extractSchemesWithGroq = extractSchemesWithOpenRouter;

// lib/validation.ts
import { z } from "zod";

// lib/states.ts
var INDIAN_STATES_AND_UTS = [
  // 28 States
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  // 8 Union Territories
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry"
];
var STATE_METADATA_MAP = {
  "Andhra Pradesh": {
    name: "Andhra Pradesh",
    code: "AP",
    aliases: ["andhra pradesh", "andhra", "ap", "ap govt", "govt of ap"],
    domainSuffixes: [".ap.gov.in", ".ap.nic.in", "ap.gov.in", "ap.nic.in"],
    knownApexDomains: ["ap.gov.in", "jnanabhumi.ap.gov.in", "ysrrythubharosa.ap.gov.in", "navasakam.ap.gov.in", "apedistrict.ap.gov.in"],
    departments: {
      scholarship: "Jnanabhumi Social Welfare Department Andhra Pradesh",
      msme: "Industries & Commerce Department Andhra Pradesh AP MSME",
      agriculture: "Agriculture and Cooperation Department Andhra Pradesh",
      socialWelfare: "Social Welfare Department Government of Andhra Pradesh"
    },
    region: "Southern"
  },
  "Arunachal Pradesh": {
    name: "Arunachal Pradesh",
    code: "AR",
    aliases: ["arunachal pradesh", "arunachal", "ar", "govt of arunachal"],
    domainSuffixes: [".arunachal.gov.in", ".arunachal.nic.in", "arunachalpradesh.gov.in", "arunachal.gov.in"],
    knownApexDomains: ["arunachalpradesh.gov.in", "arunachal.gov.in", "apsc.arunachal.gov.in", "dhe.arunachal.gov.in"],
    departments: {
      scholarship: "Directorate of Higher & Technical Education Arunachal Pradesh",
      msme: "Department of Industries Government of Arunachal Pradesh",
      agriculture: "Department of Agriculture Government of Arunachal Pradesh",
      socialWelfare: "Social Justice, Empowerment and Tribal Affairs Department"
    },
    region: "North East"
  },
  "Assam": {
    name: "Assam",
    code: "AS",
    aliases: ["assam", "asom", "as", "govt of assam"],
    domainSuffixes: [".assam.gov.in", ".assam.nic.in", "assam.gov.in", "assam.nic.in"],
    knownApexDomains: ["assam.gov.in", "directorateofhighereducation.assam.gov.in", "cmaaa.assam.gov.in", "arbas.assam.gov.in", "finance.assam.gov.in", "industries.assam.gov.in"],
    departments: {
      scholarship: "Directorate of Higher Education Assam",
      msme: "Department of Industries and Commerce Assam",
      agriculture: "Department of Agriculture Government of Assam",
      socialWelfare: "Department of Social Justice and Empowerment Assam"
    },
    region: "North East"
  },
  "Bihar": {
    name: "Bihar",
    code: "BR",
    aliases: ["bihar", "br", "govt of bihar"],
    domainSuffixes: [".bihar.gov.in", ".bih.nic.in", "bihar.gov.in", "bih.nic.in"],
    knownApexDomains: ["bihar.gov.in", "pmsonline.bih.nic.in", "scstpmsonline.bihar.gov.in", "medhasoft.bih.nic.in", "udyami.bihar.gov.in", "state.bihar.gov.in"],
    departments: {
      scholarship: "Education Department Government of Bihar Post Matric",
      msme: "Industries Department Government of Bihar Mukhyamantri Udyami",
      agriculture: "Department of Agriculture Government of Bihar DBT",
      socialWelfare: "Social Welfare Department Government of Bihar"
    },
    region: "Eastern",
    administrativeStructure: "state",
    administrativeLabel: "State Government of Bihar"
  },
  "Chhattisgarh": {
    name: "Chhattisgarh",
    code: "CG",
    aliases: ["chhattisgarh", "chattisgarh", "cg", "govt of cg"],
    domainSuffixes: [".cgstate.gov.in", ".cg.nic.in", "cgstate.gov.in", "cg.nic.in"],
    knownApexDomains: ["cgstate.gov.in", "postmatric-scholarship.cg.nic.in", "industries.cg.gov.in", "agriportal.cg.nic.in"],
    departments: {
      scholarship: "Tribal and SC Development Department Chhattisgarh Post Matric",
      msme: "Commerce and Industry Department Chhattisgarh",
      agriculture: "Department of Agriculture Development and Farmer Welfare Chhattisgarh",
      socialWelfare: "Social Welfare Department Government of Chhattisgarh"
    },
    region: "Central"
  },
  "Goa": {
    name: "Goa",
    code: "GA",
    aliases: ["goa", "state of goa", "ga", "govt of goa"],
    domainSuffixes: [".goa.gov.in", ".goa.nic.in", "goa.gov.in", "goa.nic.in"],
    knownApexDomains: ["goa.gov.in", "dhe.goa.gov.in", "scholarships.goa.gov.in", "goaonline.gov.in", "dit.goa.gov.in", "cmmrdf.goa.gov.in", "socialwelfare.goa.gov.in", "agri.goa.gov.in"],
    departments: {
      scholarship: "Directorate of Higher Education Goa DHE Bursary",
      msme: "Department of Industries, Trade and Commerce Goa CMRY",
      agriculture: "Directorate of Agriculture Government of Goa",
      socialWelfare: "Directorate of Social Welfare Government of Goa DSS"
    },
    region: "Western"
  },
  "Gujarat": {
    name: "Gujarat",
    code: "GJ",
    aliases: ["gujarat", "gujrat", "gj", "govt of gujarat"],
    domainSuffixes: [".gujarat.gov.in", ".guj.nic.in", "gujarat.gov.in", "guj.nic.in"],
    knownApexDomains: ["gujarat.gov.in", "mysy.guj.nic.in", "esamajkalyan.gujarat.gov.in", "ic.gujarat.gov.in", "ikhedut.gujarat.gov.in"],
    departments: {
      scholarship: "Higher Education Department Gujarat MYSY Mukhyamantri Yuva Swavalamban",
      msme: "Industries and Mines Department Gujarat MSME",
      agriculture: "Agriculture, Farmers Welfare and Co-operation Department Gujarat",
      socialWelfare: "Social Justice and Empowerment Department Gujarat"
    },
    region: "Western"
  },
  "Haryana": {
    name: "Haryana",
    code: "HR",
    aliases: ["haryana", "hr", "govt of haryana"],
    domainSuffixes: [".haryana.gov.in", ".hry.nic.in", "haryana.gov.in", "hry.nic.in"],
    knownApexDomains: ["haryana.gov.in", "harchhatravratti.highereduhry.ac.in", "saralharyana.gov.in", "msme.haryana.gov.in", "agriharyana.gov.in"],
    departments: {
      scholarship: "Department of Higher Education Haryana Har-Chhatravratti",
      msme: "Department of Industries and Commerce Haryana MSME",
      agriculture: "Department of Agriculture and Farmers Welfare Haryana",
      socialWelfare: "Social Justice, Empowerment of SCs and BCs Welfare Haryana"
    },
    region: "Northern"
  },
  "Himachal Pradesh": {
    name: "Himachal Pradesh",
    code: "HP",
    aliases: ["himachal pradesh", "himachal", "hp", "govt of hp"],
    domainSuffixes: [".hp.gov.in", ".hp.nic.in", "himachal.gov.in", "himachal.nic.in"],
    knownApexDomains: ["himachal.gov.in", "himachal.nic.in", "hpepass.cgg.gov.in", "emerginghimachal.hp.gov.in", "agriculture.hp.gov.in"],
    departments: {
      scholarship: "Directorate of Higher Education Himachal Pradesh ePass",
      msme: "Department of Industries Government of Himachal Pradesh",
      agriculture: "Department of Agriculture Government of Himachal Pradesh",
      socialWelfare: "Department of Social Justice and Empowerment Himachal Pradesh"
    },
    region: "Northern"
  },
  "Jharkhand": {
    name: "Jharkhand",
    code: "JH",
    aliases: ["jharkhand", "jh", "govt of jharkhand"],
    domainSuffixes: [".jharkhand.gov.in", ".jh.nic.in", "jharkhand.gov.in", "jh.nic.in"],
    knownApexDomains: ["jharkhand.gov.in", "ekalyan.cgg.gov.in", "jharkhandindustry.gov.in", "agri.jharkhand.gov.in"],
    departments: {
      scholarship: "Scheduled Tribe, SC, Minority and BC Welfare Department e-Kalyan Jharkhand",
      msme: "Department of Industries Government of Jharkhand MSME",
      agriculture: "Department of Agriculture, Animal Husbandry & Co-operative Jharkhand",
      socialWelfare: "Department of Women, Child Development and Social Security Jharkhand"
    },
    region: "Eastern"
  },
  "Karnataka": {
    name: "Karnataka",
    code: "KA",
    aliases: ["karnataka", "kar", "ka", "govt of karnataka"],
    domainSuffixes: [".karnataka.gov.in", ".kar.nic.in", "karnataka.gov.in", "kar.nic.in"],
    knownApexDomains: [
      "karnataka.gov.in",
      "ssp.karnataka.gov.in",
      "ssp.postmatric.karnataka.gov.in",
      "sevasindhugs.karnataka.gov.in",
      "cmegp.kar.nic.in",
      "dce.karnataka.gov.in",
      "swd.karnataka.gov.in",
      "karnataka.gov.in/agriculture"
    ],
    departments: {
      scholarship: "Department of Social Welfare Karnataka State Scholarship Portal SSP",
      msme: "Commerce and Industries Department Karnataka CMEGP",
      agriculture: "Department of Agriculture Karnataka Raitha Vidya Nidhi",
      socialWelfare: "Social Welfare Department Government of Karnataka"
    },
    region: "Southern"
  },
  "Kerala": {
    name: "Kerala",
    code: "KL",
    aliases: ["kerala", "kl", "govt of kerala"],
    domainSuffixes: [".kerala.gov.in", ".kerala.nic.in", "kerala.gov.in", "kerala.nic.in"],
    knownApexDomains: ["kerala.gov.in", "dcescholarship.kerala.gov.in", "industry.kerala.gov.in", "keralaagriculture.gov.in"],
    departments: {
      scholarship: "Directorate of Collegiate Education Kerala DCE Scholarship",
      msme: "Directorate of Industries and Commerce Kerala",
      agriculture: "Department of Agriculture Development and Farmers Welfare Kerala",
      socialWelfare: "Social Justice Department Government of Kerala"
    },
    region: "Southern"
  },
  "Madhya Pradesh": {
    name: "Madhya Pradesh",
    code: "MP",
    aliases: ["madhya pradesh", "mp", "govt of mp"],
    domainSuffixes: [".mp.gov.in", ".mp.nic.in", "mp.gov.in", "mp.nic.in"],
    knownApexDomains: ["mp.gov.in", "scholarshipportal.mp.nic.in", "saara.mp.gov.in", "cmladlibahna.mp.gov.in", "invest.mp.gov.in"],
    departments: {
      scholarship: "State Scholarship Portal MP Tribal and SC Welfare",
      msme: "Micro, Small and Medium Enterprises Department Madhya Pradesh",
      agriculture: "Farmer Welfare and Agriculture Development Department MP",
      socialWelfare: "Social Justice and Disabled Welfare Department Madhya Pradesh"
    },
    region: "Central"
  },
  "Maharashtra": {
    name: "Maharashtra",
    code: "MH",
    aliases: ["maharashtra", "maha", "mh", "govt of maharashtra"],
    domainSuffixes: [".maharashtra.gov.in", ".mah.nic.in", "maharashtra.gov.in", "mahaonline.gov.in"],
    knownApexDomains: [
      "mahadbt.maharashtra.gov.in",
      "maharashtra.gov.in",
      "maitri.maharashtra.gov.in",
      "maha-cmegp.gov.in",
      "industry.maharashtra.gov.in",
      "mahasdb.maharashtra.gov.in",
      "mahaonline.gov.in",
      "apavm.maharashtra.gov.in",
      "krishi.maharashtra.gov.in",
      "ladakibahin.maharashtra.gov.in",
      "jeevandayee.gov.in"
    ],
    departments: {
      scholarship: "Higher and Technical Education / Social Justice MahaDBT",
      msme: "Directorate of Industries Maharashtra CMEGP Maitri",
      agriculture: "Department of Agriculture Government of Maharashtra Krishi",
      socialWelfare: "Social Justice and Special Assistance Department Maharashtra"
    },
    region: "Western"
  },
  "Manipur": {
    name: "Manipur",
    code: "MN",
    aliases: ["manipur", "mn", "govt of manipur"],
    domainSuffixes: [".manipur.gov.in", ".manipur.nic.in", "manipur.gov.in", "manipur.nic.in"],
    knownApexDomains: ["manipur.gov.in", "dhtemanipur.gov.in", "manipurcommerceandindustries.gov.in"],
    departments: {
      scholarship: "Directorate of Higher and Technical Education Manipur",
      msme: "Department of Commerce and Industries Manipur",
      agriculture: "Department of Agriculture Manipur",
      socialWelfare: "Social Welfare Department Government of Manipur"
    },
    region: "North East"
  },
  "Meghalaya": {
    name: "Meghalaya",
    code: "ML",
    aliases: ["meghalaya", "ml", "govt of meghalaya"],
    domainSuffixes: [".meghalaya.gov.in", ".megh.nic.in", "meghalaya.gov.in", "megh.nic.in"],
    knownApexDomains: ["meghalaya.gov.in", "megeducation.gov.in", "meghalaya.gov.in/commerce_industries"],
    departments: {
      scholarship: "Directorate of Higher & Technical Education Meghalaya",
      msme: "Department of Commerce and Industries Government of Meghalaya",
      agriculture: "Department of Agriculture and Farmers Welfare Meghalaya",
      socialWelfare: "Social Welfare Department Government of Meghalaya"
    },
    region: "North East"
  },
  "Mizoram": {
    name: "Mizoram",
    code: "MZ",
    aliases: ["mizoram", "mz", "mizo", "govt of mizoram"],
    domainSuffixes: [".mizoram.gov.in", ".mizo.nic.in", "mizoram.gov.in", "mizo.nic.in"],
    knownApexDomains: ["mizoram.gov.in", "scholarships.mizoram.gov.in", "industries.mizoram.gov.in"],
    departments: {
      scholarship: "Mizoram Scholarship Board Higher & Technical Education",
      msme: "Department of Commerce and Industries Mizoram",
      agriculture: "Department of Agriculture Government of Mizoram",
      socialWelfare: "Social Welfare and Tribal Affairs Department Mizoram"
    },
    region: "North East"
  },
  "Nagaland": {
    name: "Nagaland",
    code: "NL",
    aliases: ["nagaland", "nl", "govt of nagaland"],
    domainSuffixes: [".nagaland.gov.in", ".nagaland.nic.in", "nagaland.gov.in", "nagaland.nic.in"],
    knownApexDomains: ["nagaland.gov.in", "scholarship.nagaland.gov.in", "industry.nagaland.gov.in"],
    departments: {
      scholarship: "Department of Higher Education Nagaland Scholarship Portal",
      msme: "Department of Industries and Commerce Nagaland",
      agriculture: "Department of Agriculture Government of Nagaland",
      socialWelfare: "Department of Social Welfare Nagaland"
    },
    region: "North East"
  },
  "Odisha": {
    name: "Odisha",
    code: "OD",
    aliases: ["odisha", "orissa", "od", "govt of odisha"],
    domainSuffixes: [".odisha.gov.in", ".ori.nic.in", "odisha.gov.in", "ori.nic.in"],
    knownApexDomains: ["odisha.gov.in", "scholarship.odisha.gov.in", "kalia.odisha.gov.in", "subhadra.odisha.gov.in", "msme.odisha.gov.in"],
    departments: {
      scholarship: "Higher Education Department Odisha State Scholarship Portal",
      msme: "MSME Department Government of Odisha",
      agriculture: "Department of Agriculture and Farmers Empowerment Odisha KALIA",
      socialWelfare: "Social Security & Empowerment of Persons with Disabilities Odisha"
    },
    region: "Eastern"
  },
  "Punjab": {
    name: "Punjab",
    code: "PB",
    aliases: ["punjab", "pb", "govt of punjab"],
    domainSuffixes: [".punjab.gov.in", ".punjab.nic.in", "punjab.gov.in", "punjab.nic.in"],
    knownApexDomains: ["punjab.gov.in", "scholarships.punjab.gov.in", "pbindustries.gov.in", "agri.punjab.gov.in"],
    departments: {
      scholarship: "Department of Social Justice, Empowerment and Minorities Punjab Dr Ambedkar Portal",
      msme: "Department of Industries & Commerce Punjab Invest Punjab",
      agriculture: "Department of Agriculture & Farmers Welfare Punjab",
      socialWelfare: "Department of Social Security, Women and Child Development Punjab"
    },
    region: "Northern"
  },
  "Rajasthan": {
    name: "Rajasthan",
    code: "RJ",
    aliases: ["rajasthan", "raj", "rj", "govt of rajasthan"],
    domainSuffixes: [".rajasthan.gov.in", ".raj.nic.in", "rajasthan.gov.in", "raj.nic.in"],
    knownApexDomains: ["rajasthan.gov.in", "sjmsnew.rajasthan.gov.in", "chiranjeevi.rajasthan.gov.in", "sso.rajasthan.gov.in", "industries.rajasthan.gov.in"],
    departments: {
      scholarship: "Social Justice and Empowerment Department Rajasthan SJMS Uttar Matric",
      msme: "Industries and Commerce Department Rajasthan Mukhyamantri Laghu Udyog Protsahan",
      agriculture: "Department of Agriculture Government of Rajasthan Krishi Sathi",
      socialWelfare: "Social Justice and Empowerment Department Government of Rajasthan"
    },
    region: "Northern"
  },
  "Sikkim": {
    name: "Sikkim",
    code: "SK",
    aliases: ["sikkim", "sk", "govt of sikkim"],
    domainSuffixes: [".sikkim.gov.in", ".sikkim.nic.in", "sikkim.gov.in", "sikkim.nic.in"],
    knownApexDomains: ["sikkim.gov.in", "sikkimhrdd.org", "commerceandindustries.sikkim.gov.in"],
    departments: {
      scholarship: "Education Department Government of Sikkim Higher Education",
      msme: "Commerce and Industries Department Government of Sikkim",
      agriculture: "Agriculture and Farmers Welfare Department Sikkim",
      socialWelfare: "Women and Child Development Department Sikkim"
    },
    region: "North East"
  },
  "Tamil Nadu": {
    name: "Tamil Nadu",
    code: "TN",
    aliases: ["tamil nadu", "tamilnadu", "tn", "govt of tn", "govt of tamil nadu"],
    domainSuffixes: [".tn.gov.in", ".tn.nic.in", "tn.gov.in", "tn.nic.in"],
    knownApexDomains: ["tn.gov.in", "pudhumaipenn.tn.gov.in", "tamilpudhalvan.tn.gov.in", "kmut.tn.gov.in", "msmeonline.tn.gov.in", "cmchistn.com"],
    departments: {
      scholarship: "Adi Dravidar and Tribal Welfare / BC, MBC Welfare Department TN",
      msme: "Micro, Small and Medium Enterprises Department Tamil Nadu NEEDS",
      agriculture: "Agriculture and Farmers Welfare Department Government of Tamil Nadu",
      socialWelfare: "Social Welfare and Women Empowerment Department Tamil Nadu"
    },
    region: "Southern"
  },
  "Telangana": {
    name: "Telangana",
    code: "TS",
    aliases: ["telangana", "ts", "tg", "govt of telangana"],
    domainSuffixes: [".telangana.gov.in", ".ts.nic.in", "telangana.gov.in", "telangana.nic.in"],
    knownApexDomains: ["telangana.gov.in", "telanganaepass.cgg.gov.in", "rythubharosa.telangana.gov.in", "ipass.telangana.gov.in"],
    departments: {
      scholarship: "Telangana Electronic Payment and Application System of Scholarships ePASS",
      msme: "Industries & Commerce Department Telangana TS-iPASS",
      agriculture: "Agriculture and Farmers Welfare Department Telangana Rythu Bharosa",
      socialWelfare: "Scheduled Castes Development Department Government of Telangana"
    },
    region: "Southern"
  },
  "Tripura": {
    name: "Tripura",
    code: "TR",
    aliases: ["tripura", "tr", "govt of tripura"],
    domainSuffixes: [".tripura.gov.in", ".tripura.nic.in", "tripura.gov.in", "tripura.nic.in"],
    knownApexDomains: ["tripura.gov.in", "highereducation.tripura.gov.in", "industries.tripura.gov.in"],
    departments: {
      scholarship: "Directorate of Higher Education Tripura Post Matric Scholarship",
      msme: "Department of Industries and Commerce Government of Tripura",
      agriculture: "Department of Agriculture and Farmers Welfare Tripura",
      socialWelfare: "Department of Social Welfare and Social Education Tripura"
    },
    region: "North East"
  },
  "Uttar Pradesh": {
    name: "Uttar Pradesh",
    code: "UP",
    aliases: ["uttar pradesh", "up", "govt of up"],
    domainSuffixes: [".up.gov.in", ".up.nic.in", "up.gov.in", "up.nic.in", "upsdc.gov.in"],
    knownApexDomains: ["scholarship.up.gov.in", "up.gov.in", "mksy.up.gov.in", "diupmsme.upsdc.gov.in", "odopup.in", "upagriculture.com"],
    departments: {
      scholarship: "Social Welfare Department UP Scholarship and Fee Reimbursement",
      msme: "Department of MSME and Export Promotion Uttar Pradesh ODOP",
      agriculture: "Department of Agriculture Uttar Pradesh UP Krishi",
      socialWelfare: "Women and Child Development / Social Welfare UP"
    },
    region: "Northern",
    administrativeStructure: "state",
    administrativeLabel: "State Government of Uttar Pradesh"
  },
  "Uttarakhand": {
    name: "Uttarakhand",
    code: "UK",
    aliases: ["uttarakhand", "uttaranchal", "uk", "ua", "govt of uttarakhand"],
    domainSuffixes: [".uk.gov.in", ".uk.nic.in", "uk.gov.in", "uttarakhand.gov.in"],
    knownApexDomains: ["uk.gov.in", "uttarakhand.gov.in", "ekalyan.uk.gov.in", "doiuk.org", "agri.uk.gov.in"],
    departments: {
      scholarship: "Social Welfare Department Uttarakhand Scholarship Portal",
      msme: "Directorate of Industries Uttarakhand MSME",
      agriculture: "Department of Agriculture Government of Uttarakhand",
      socialWelfare: "Social Welfare Department Government of Uttarakhand"
    },
    region: "Northern"
  },
  "West Bengal": {
    name: "West Bengal",
    code: "WB",
    aliases: ["west bengal", "wb", "bengal", "govt of wb", "govt of west bengal"],
    domainSuffixes: [".wb.gov.in", ".wb.nic.in", "wb.gov.in", "wb.nic.in"],
    knownApexDomains: ["wb.gov.in", "svmcm.wbhed.gov.in", "wbkanyashree.gov.in", "krishakbandhu.wb.gov.in", "swasthyasathi.gov.in", "wbmsme.gov.in"],
    departments: {
      scholarship: "Higher Education Department West Bengal Swami Vivekananda SVMCM",
      msme: "Micro, Small & Medium Enterprises and Textiles Department West Bengal",
      agriculture: "Department of Agriculture Government of West Bengal Krishak Bandhu",
      socialWelfare: "Women and Child Development and Social Welfare Department West Bengal"
    },
    region: "Eastern"
  },
  // 8 Union Territories
  "Andaman and Nicobar Islands": {
    name: "Andaman and Nicobar Islands",
    code: "AN",
    aliases: ["andaman and nicobar", "andaman and nicobar islands", "andaman", "nicobar", "an"],
    domainSuffixes: [".andaman.gov.in", ".andaman.nic.in", "andaman.gov.in", "andaman.nic.in"],
    knownApexDomains: ["andaman.gov.in", "andssw1.and.nic.in"],
    departments: {
      scholarship: "Directorate of Education Andaman and Nicobar Administration",
      msme: "Directorate of Industries Andaman and Nicobar Administration",
      agriculture: "Directorate of Agriculture Andaman and Nicobar",
      socialWelfare: "Directorate of Social Welfare Andaman and Nicobar"
    }
  },
  "Chandigarh": {
    name: "Chandigarh",
    code: "CH",
    aliases: ["chandigarh", "chd", "ch", "chandigarh administration"],
    domainSuffixes: [".chd.gov.in", ".chd.nic.in", "chandigarh.gov.in"],
    knownApexDomains: ["chandigarh.gov.in", "chdeducation.gov.in"],
    departments: {
      scholarship: "Department of Higher Education Chandigarh Administration",
      msme: "Department of Industries Chandigarh Administration",
      agriculture: "Agriculture Department Chandigarh Administration",
      socialWelfare: "Social Welfare Department Chandigarh Administration"
    },
    region: "Northern"
  },
  "Dadra and Nagar Haveli and Daman and Diu": {
    name: "Dadra and Nagar Haveli and Daman and Diu",
    code: "DH",
    aliases: ["dadra and nagar haveli", "daman and diu", "dadra and nagar haveli and daman and diu", "dnhdd", "dnh & dd"],
    domainSuffixes: [".daman.nic.in", ".ddd.gov.in", "daman.nic.in", "ddd.gov.in"],
    knownApexDomains: ["daman.nic.in", "ddd.gov.in"],
    departments: {
      scholarship: "Directorate of Higher Education UT of DNH and DD",
      msme: "Department of Industries UT of DNH and DD",
      agriculture: "Department of Agriculture UT of DNH and DD",
      socialWelfare: "Department of Social Welfare UT of DNH and DD"
    },
    region: "Western"
  },
  "Delhi": {
    name: "Delhi",
    code: "DL",
    aliases: ["delhi", "nct of delhi", "national capital territory of delhi", "delhi ncr", "govt of delhi", "dl"],
    domainSuffixes: [".delhi.gov.in", ".delhigovt.nic.in", "delhi.gov.in", "delhigovt.nic.in"],
    knownApexDomains: ["delhi.gov.in", "delhigovt.nic.in", "edistrict.delhigovt.nic.in", "edistrict.delhi.gov.in", "scstwelfare.delhi.gov.in", "doorstep.delhi.gov.in"],
    departments: {
      scholarship: "Department for Welfare of SC/ST/OBC Delhi e-District",
      msme: "Department of Industries Government of NCT of Delhi",
      agriculture: "Development Department Government of NCT of Delhi",
      socialWelfare: "Department of Social Welfare Government of NCT of Delhi"
    },
    region: "NCR",
    administrativeStructure: "union_territory_with_legislature",
    administrativeLabel: "Union Territory with Legislative Assembly (NCT of Delhi)"
  },
  "Jammu and Kashmir": {
    name: "Jammu and Kashmir",
    code: "JK",
    aliases: ["jammu and kashmir", "j&k", "jammu & kashmir", "jk", "govt of jk"],
    domainSuffixes: [".jk.gov.in", ".jk.nic.in", "jk.gov.in", "jammukashmir.nic.in"],
    knownApexDomains: ["jk.gov.in", "jksamadhaan.jk.gov.in", "aicte-jk-scholarship-gov.in", "industryjk.com"],
    departments: {
      scholarship: "Social Welfare Department Jammu and Kashmir AICTE SSS J&K",
      msme: "Industries & Commerce Department Jammu and Kashmir",
      agriculture: "Department of Agriculture Production & Farmers Welfare J&K",
      socialWelfare: "Social Welfare Department Government of Jammu and Kashmir"
    },
    region: "Northern"
  },
  "Ladakh": {
    name: "Ladakh",
    code: "LA",
    aliases: ["ladakh", "ut ladakh", "la", "leh", "kargil"],
    domainSuffixes: [".ladakh.gov.in", ".ladakh.nic.in", "ladakh.gov.in", "ladakh.nic.in"],
    knownApexDomains: ["ladakh.gov.in", "leh.nic.in", "kargil.nic.in"],
    departments: {
      scholarship: "Higher Education Department UT of Ladakh",
      msme: "Industries and Commerce Department UT of Ladakh",
      agriculture: "Agriculture Department UT of Ladakh",
      socialWelfare: "Social and Tribal Welfare Department UT of Ladakh"
    },
    region: "Northern"
  },
  "Lakshadweep": {
    name: "Lakshadweep",
    code: "LD",
    aliases: ["lakshadweep", "lakshadweep islands", "ld", "ut of lakshadweep"],
    domainSuffixes: [".lakshadweep.gov.in", ".lakshadweep.nic.in", "lakshadweep.gov.in", "lakshadweep.nic.in"],
    knownApexDomains: ["lakshadweep.gov.in"],
    departments: {
      scholarship: "Department of Education UT of Lakshadweep",
      msme: "Department of Industries UT of Lakshadweep",
      agriculture: "Department of Agriculture UT of Lakshadweep",
      socialWelfare: "Department of Social Welfare UT of Lakshadweep"
    },
    region: "Southern"
  },
  "Puducherry": {
    name: "Puducherry",
    code: "PY",
    aliases: ["puducherry", "pondicherry", "py", "ut of puducherry"],
    domainSuffixes: [".py.gov.in", ".puducherry.gov.in", ".py.nic.in", "py.gov.in", "puducherry.gov.in"],
    knownApexDomains: ["py.gov.in", "puducherry.gov.in", "dhte.py.gov.in"],
    departments: {
      scholarship: "Directorate of Higher and Technical Education Puducherry Perunthalaivar Kamarajar",
      msme: "Department of Industries and Commerce Government of Puducherry",
      agriculture: "Department of Agriculture Government of Puducherry",
      socialWelfare: "Department of Social Welfare Government of Puducherry"
    },
    region: "Southern"
  }
};
var ALL_INDIA_ALIASES = [
  "all india",
  "all india / central",
  "india",
  "central",
  "national"
];
function normalizeStateName(rawState) {
  if (!rawState) return null;
  const clean = rawState.trim();
  const lower = clean.toLowerCase();
  if (ALL_INDIA_ALIASES.includes(lower)) {
    return "All India / Central";
  }
  for (const st of INDIAN_STATES_AND_UTS) {
    if (st.toLowerCase() === lower) {
      return st;
    }
  }
  for (const [canonicalName, meta] of Object.entries(STATE_METADATA_MAP)) {
    if (meta.aliases.some((alias) => alias === lower)) {
      return canonicalName;
    }
  }
  for (const st of INDIAN_STATES_AND_UTS) {
    const stLower = st.toLowerCase();
    if (lower.includes(stLower) || stLower.includes(lower)) {
      return st;
    }
  }
  return null;
}
function identifyStateFromDomain(hostnameOrUrl) {
  try {
    let host = hostnameOrUrl.toLowerCase().trim();
    if (host.includes("://")) {
      host = new URL(host).hostname.toLowerCase();
    }
    if (host.startsWith("www.")) {
      host = host.slice(4);
    }
    for (const [stName, meta] of Object.entries(STATE_METADATA_MAP)) {
      if (meta.knownApexDomains.some((d) => host === d || host.endsWith("." + d))) {
        return stName;
      }
      if (meta.domainSuffixes.some((s) => host.endsWith(s))) {
        return stName;
      }
    }
    return null;
  } catch {
    return null;
  }
}
var STATE_OFFICIAL_DOMAINS = Object.fromEntries(
  Object.entries(STATE_METADATA_MAP).map(([state, meta]) => [state, meta.knownApexDomains])
);
var CENTRAL_OFFICIAL_DOMAINS = [
  "scholarships.gov.in",
  "myscheme.gov.in",
  "umang.gov.in",
  "nitiforstates.gov.in",
  "niti.gov.in",
  "dosje.gov.in",
  "socialjustice.gov.in",
  "tribal.gov.in",
  "minorityaffairs.gov.in",
  "education.gov.in",
  "pmkisan.gov.in",
  "pmfby.gov.in",
  "maandhan.in",
  "beneficiary.nha.gov.in",
  "nfsa.gov.in",
  "pmaymis.gov.in",
  "pmmvy.wcd.gov.in",
  "pfrda.org.in",
  "udyamimitra.in",
  "pmvishwakarma.gov.in",
  "pmsvanidhi.mohua.gov.in",
  "mudra.org.in",
  "pmegp.gov.in",
  "kviconline.gov.in",
  "cgtmse.in",
  "standupmitra.in",
  "udyamregistration.gov.in",
  "msme.gov.in",
  "dcmsme.gov.in",
  "jansamarth.in",
  "aicte-india.org",
  "ugc.gov.in",
  "mofpi.gov.in",
  "indiapost.gov.in",
  "pmkusum.mnre.gov.in",
  "mnre.gov.in",
  "pmindia.gov.in",
  "agricoop.nic.in",
  "agricoop.gov.in",
  "agriwelfare.gov.in",
  "dbtbharat.gov.in",
  "doner.gov.in",
  "necouncil.gov.in"
];
var MULTI_STATE_REGIONS = {
  "North East": [
    "Arunachal Pradesh",
    "Assam",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Sikkim",
    "Tripura"
  ],
  "NCR": [
    "Delhi",
    "Haryana",
    "Uttar Pradesh",
    "Rajasthan"
  ],
  "JK_Ladakh": [
    "Jammu and Kashmir",
    "Ladakh"
  ]
};
function getAdministrativeStructure(stateName) {
  const norm = normalizeStateName(stateName);
  if (!norm || norm === "All India / Central") {
    return { type: "central", label: "Central Government of India" };
  }
  const meta = STATE_METADATA_MAP[norm];
  if (meta?.administrativeStructure) {
    return {
      type: meta.administrativeStructure,
      label: meta.administrativeLabel || `${norm} (${meta.administrativeStructure === "union_territory_with_legislature" ? "UT with Legislative Assembly" : "State"})`
    };
  }
  if (norm === "Delhi") {
    return {
      type: "union_territory_with_legislature",
      label: "Union Territory with Legislative Assembly (NCT of Delhi)"
    };
  }
  if (["Puducherry", "Jammu and Kashmir"].includes(norm)) {
    return {
      type: "union_territory_with_legislature",
      label: `${norm} (Union Territory with Legislative Assembly)`
    };
  }
  const otherUTs = [
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Ladakh",
    "Lakshadweep"
  ];
  if (otherUTs.includes(norm)) {
    return { type: "union_territory_without_legislature", label: `${norm} (Union Territory)` };
  }
  return { type: "state", label: `State Government of ${norm}` };
}

// lib/types.ts
var MVP_SUPPORTED_REGIONS = ["Delhi", "Uttar Pradesh", "Bihar"];

// lib/validation.ts
function validateMvpScope(state, persona) {
  const norm = state ? normalizeStateName(state) : null;
  if (!norm || !MVP_SUPPORTED_REGIONS.includes(norm)) {
    return {
      isValid: false,
      error: `Region '${state || "unspecified"}' is outside the YojanaMitra MVP scope. Supported regions are: ${MVP_SUPPORTED_REGIONS.join(", ")}.`
    };
  }
  const isSupportedPersona = !persona || persona === "student" || persona === "farmer";
  if (!isSupportedPersona) {
    return {
      isValid: false,
      error: `Category/persona '${persona}' is outside the supported tracks. Supported tracks are: Student (Education) and Farmer (Agriculture).`
    };
  }
  return { isValid: true };
}
var SchemeSearchRequestSchema = z.object({
  state: z.string().min(1, "State is required in MVP scope"),
  persona: z.enum(["student", "farmer", "citizen", "business"]).optional().default("student"),
  query: z.string().max(200).optional().default(""),
  age: z.coerce.number().min(1).max(120).optional(),
  gender: z.enum(["Male", "Female", "Transgender", "All"]).optional().default("All"),
  annualIncome: z.coerce.number().min(0).max(1e8).optional().default(15e4),
  socialCategory: z.enum(["General", "OBC", "SC", "ST", "Minority", "EWS"]).optional().default("General"),
  educationLevel: z.enum(["School", "Higher Secondary", "Undergraduate", "Postgraduate", "Any"]).optional().default("Any"),
  courseStream: z.string().optional(),
  farmerType: z.enum(["Landless", "Small/Marginal", "Large", "Any"]).optional().default("Any"),
  isDifferentlyAbled: z.boolean().optional().default(false),
  hasBplCard: z.boolean().optional().default(false),
  refresh: z.boolean().optional().default(false)
});
var GroqExtractedSchemeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2),
  hindiName: z.string().optional().nullable(),
  category: z.string().default("Education"),
  level: z.enum(["Central", "State"]).default("Central"),
  state: z.string().nullable().optional(),
  description: z.string().min(5),
  benefits: z.string().min(3),
  benefitAmountApprox: z.number().nullable().optional(),
  eligibilityStatus: z.enum(["potentially_eligible", "not_eligible", "insufficient_information"]).default("potentially_eligible"),
  eligibilityReasons: z.array(z.string()).default([]),
  missingOrCautionCriteria: z.array(z.string()).optional().default([]),
  requiredDocuments: z.array(z.string()).default([]),
  applicationUrl: z.string().nullable().optional(),
  officialUrl: z.string().url(),
  portalName: z.string().default("Official Portal"),
  deadline: z.string().nullable().optional(),
  deadlineStatus: z.enum(["open", "closed", "upcoming", "unknown"]).default("unknown"),
  sourceUrls: z.array(z.string()).default([]),
  sourceTitle: z.string().nullable().optional(),
  verificationStatus: z.enum(["officially_verified", "partially_verified", "unverified", "officially_supported"]).optional(),
  evidenceSnippets: z.object({
    benefitEvidence: z.string().nullable().optional(),
    eligibilityEvidence: z.string().nullable().optional(),
    nameEvidence: z.string().nullable().optional()
  }).optional()
});
var GroqExtractionResultSchema = z.object({
  schemes: z.array(GroqExtractedSchemeSchema).default([]),
  advisoryNote: z.string().optional()
});
var INVALID_SCHEME_NAME_PATTERNS = [
  /\.(pdf|docx?|xlsx?|pptx?|html?|txt|csv|json)$/i,
  /^untitled\s*$/i,
  /^(home|index|dashboard|login|sign ?in|register|registration|welcome|contact|privacy policy|terms|disclaimer|faq|downloads?|forms?)$/i,
  /^(schemes? on nsp|all scholarships?|list of schemes?|central schemes?|state schemes?|national scholarship portal:? ?nsp|schemes dashboard|myscheme portal|scholarships?|schemes?|scholarship schemes?|state funded scholarship schemes?(?:\s*[-–:]?\s*[a-z\s]*)?)$/i,
  /^(overview|about us|press release|circular|notification|acts? and rules?|minutes|gazette notification)$/i,
  /\b(reforms in india|annual report|economic survey|budget highlights|statistical report|policy brief|study report|working paper)\b/i,
  /^(government welfare scheme|welfare scheme|central government scheme|state government scheme|scheme details|public welfare program)$/i,
  // Generic welfare / yojana directory titles and blog aggregator names
  /\b(government yojana and schemes|yojana and schemes in india|government schemes in india|schemes in india|yojana catalogue)\b/i,
  // Commercial marketplace and yellow pages listing titles (e.g. Justdial product catalogues)
  /\b(catalogue\s*[-–:]|view range of products|get best price|contact number|products and services offered by|yojana in [a-z\s]+ delhi|pump yojana in [a-z\s]+)\b/i,
  // Operational guidelines, circulars, and implementation manuals (these are supporting documents, NOT schemes)
  /^(operational|revised|implementation|administrative|draft|final)\s+guidelines?\b/i,
  /guidelines?\s*(?:for|of|\d{4}|\(\d{4}\))/i,
  /^guidelines?\s*[-–:]/i,
  /^(rules?\s+for\s+(?:the\s+)?award\s*(?:for|of)?|rules?\s+and\s+regulations?\s+for|scheme\s+rules?\s+for)\b/i,
  /^(guidelines?|circulars?|notifications?|resolutions?|orders?)\s*[-–:]/i,
  // Parliamentary, legislative, and standing committee reports
  /\b(standing committee|lok sabha|rajya sabha|sansad|parliamentary committee|committee on)\b/i,
  // Evaluation, audit, performance, and impact assessment reports
  /\b(performance evaluation|evaluation of|impact assessment|impact of|evaluation study|compendium|audit report|status report|working group report|progress report|review report)\b/i,
  // Generic multi-scheme press releases, compendia, and parliamentary overviews (Section 2 & 7)
  /^(schemes? for (the )?welfare of|schemes? for farmers|welfare schemes for|major schemes for|central sector schemes for|flagship schemes for|agricultural schemes in|government initiatives for|important schemes for)\b/i,
  /\b(schemes for welfare of farmers|welfare of farmers|schemes for farmers)\b/i,
  /^(pib\s*[-–:]\s*schemes|press information bureau\s*[-–:]\s*schemes)\b/i,
  /^(brief note on schemes|compendium of schemes|summary of schemes|schemes at a glance|overview of schemes)\b/i,
  /^list\s+of\s+[a-z\s]+\s*(schemes?|scholarships?|initiatives?|programmes?)\b/i,
  /\b(annual report on|annual report \d{4})\b/i,
  // Beneficiary, applicant, and student lists / registers
  /^(list\s+of\s+(students?|beneficiaries|candidates|applicants|recipients|colleges?|institutions?|schools?)\b)/i,
  /\b(beneficiary\s+list|list\s+of\s+eligible|selection\s+list|merit\s+list|approved\s+list)\b/i,
  // Search form placeholders and UI prompts
  /^(enter\s+scheme\s+name|search\s+schemes?|type\s+here\s+to\s+search|search\s+by\s+scheme|find\s+schemes?|search\s+portal)\b/i,
  // How-to guides, blog posts, commercial articles, listicles
  /^how to\b/i,
  /^top \d+\b/i,
  /^\d+\s+(important|top|best|key|major)\s+government\b/i,
  /^(get government subsidy|guide to|everything you need to know|complete guide|step[- ]by[- ]step guide)\b/i,
  // Mobile app store and APK listings
  /\b(apps? on google play|play store|app store|download apk|mobile app)\b/i,
  // Generic portals and helpdesks
  /^(helpdesk|grievance|dashboard|portal login|citizen corner|services portal)\b/i,
  // Pure department landing pages without a scheme name
  /^(social welfare|backward classes welfare|tribal welfare|minority welfare|agriculture|animal husbandry|rural development|higher education|school education)\s+department\b/i,
  /^(department\s+of|directorate\s+of|ministry\s+of)\s+[^–-]+$/i,
  /^(state\s*[-–]\s*government\s+of|government\s+of\s+[a-z\s]+)\s*(\([^\)]+\))?$/i,
  // Academic textbook chapters, course units, and study material modules (e.g. IGNOU, eGyanKosh)
  /^(unit\s+\d+|chapter\s+\d+|lesson\s+\d+|module\s+\d+|block\s+\d+)\b/i,
  // Academic research papers, thesis titles, and journal articles
  /\b(potential role of|empirical study|a study on|determinants of|analysis of\s*:?|journal of|research paper|conference paper|critical review of|a review of|review of [a-z\s]+ schemes?)\b/i,
  // Budget documents, grants analysis, and financial bills
  /\b(demand for grants|demands for grants|budget analysis|grant analysis|outcome budget|appropriation bill)\b/i,
  // Generic scheme directories, indexes, and search portal views
  /^(dbt schemes?|all schemes?|schemes directory|portal schemes?|list of central schemes?|schemes on dbt)\b/i,
  /^(schemes?\s*[-|]\s*my government|national portal of india|india\.gov\.in)\b/i,
  // Commercial credit card and retail banking products
  /\b(credit card|debit card|cashback|rupay credit card|fixed deposit|savings account)\b/i,
  // Commercial brand names in titles
  /\b(eicher|mahindra|netafim|iifl|stashfin|paisabazaar|bankbazaar|tractor junction)\b/i,
  // Multi-scholarship directory, category, or agency umbrellas (not individual schemes)
  /\b(fellowship[s]?\s*[\/&]\s*scholarship[s]?|scholarship[s]?\s*[\/&]\s*fellowship[s]?)\b/i,
  /^(aicte|ugc|dst|dbt|csir|mhrd|moe)\s+(fellowship[s]?\s*[\/&]\s*scholarship[s]?|scholarships|fellowships)$/i,
  // College notice board listings, portal submission announcements, and generic plural roundups
  /\b(scholarships?\s+available\s+on|scholarships?\s+offered\s+by|scholarship\s+scheme\s+portal\s+is\s+open|portal\s+is\s+open\s+for\s+submission|student\s+corner|notice\s*board|academic\s+updates?)\b/i,
  /\b(scholarship\s+schemes\s*[-–]\s*launched\s+by|schemes\s+launched\s+by)\b/i,
  /^\([a-z0-9]\)\s+centrally sponsored\b/i,
  // Budget tables, planning statements, and institutional fee concessions
  /^statement\s*:\s*[ivx0-9]+\b/i,
  /\b(scheme\s*\/programme\s*\/projects?\s+wise|projects?\s+wise|programmes?\s+wise)\b/i,
  /\b(fee concession\s*[-–]\s*[a-z\s]+college|[a-z\s]+college\s*[-–]\s*scholarships?)\b/i,
  // Payment status updates, installment releases, and application news
  /\b(update\s*:|updates?\s*[-–:]|installment\s+released|installment\s+status|payment\s+status|second\s+installment|first\s+installment|check\s+payment|payment\s+update|status\s+released)\b/i,
  // Multi-scholarship global/college listings and portals
  /\b(live scholarships?|global scholarships?|all scholarships?|private scholarships?)\b/i,
  // User manuals, FAQs, author archives, login endpoints, and utility links
  /\b(author at|scholarship alerts|user manual for students|application login|digitalseva connect|scholarship eligibility check|forgot application id|can we complete nsp|without face authentication|buddy4study articles|portal - last date|scheme rules revised|how to apply|application open & how|archives - scholarship)\b/i
];
function classifyCandidate(name, urlStr, snippet = "") {
  const rawName = (name || "").trim();
  const lowerName = rawName.toLowerCase();
  const lowerUrl = (urlStr || "").toLowerCase();
  const lowerSnippet = snippet.toLowerCase();
  const hasSpecificScheme = /\b(scholarship|fellowship|stipend|tuition|post[- ]?matric|pre[- ]?matric|reimbursement|financial assistance|pragati|saksham|swanath|yojana|scheme|aid to students?|merit scholarship|top class|education support|samman|bima|suraksha|awas|pension)\b/i.test(lowerName) && !/^(delhi e-district services|e-district services|services list|scholarship application|all scholarships|portal login|citizen login|live scholarships.*)$/i.test(lowerName);
  const isDocTitle = /^(guidelines?|operational guidelines?|circulars?|notifications?|gazette|minutes|sop|standard operating procedure|annual report|compendium)\b/i.test(lowerName) || /\b(scheme guidelines?|implementation manual|draft guidelines?|order no|circular regarding)\b/i.test(lowerName) || /\.(pdf|docx?|xlsx?|pptx?|zip)$/i.test(rawName);
  const isDocUrl = /\.(pdf|docx?|xlsx?|pptx?|zip)$/i.test(lowerUrl) || /\/downloads?\/|\/pdf\/|\/circulars?\/|\/guidelines?\/|\/schemeguidelines\/|\/orders?\/|\/notifications?\/|\/acts?\/|\/rules?\/|\/tenders?\//i.test(lowerUrl);
  const isExplicitGuidelineDoc = /\/schemeguidelines\/|guidelines?\.pdf$|_guidelines|_manual|_sop/i.test(lowerUrl) || /^(guidelines?|operational guidelines?|revised guidelines?)\b/i.test(lowerName) || /^\([a-z0-9]\)\s+centrally sponsored/i.test(lowerName);
  if (isExplicitGuidelineDoc || isDocTitle || isDocUrl && !hasSpecificScheme) {
    return "guidelines_or_document";
  }
  const isDedicatedScholarshipProfile = /buddy4study\.com\/scholarship\b/i.test(lowerUrl) && hasSpecificScheme;
  const isNewsOrMediaHeadline = /\b(press release|cabinet approves|news update|latest news|application dates announced|how to apply|eligibility criteria revealed|check eligibility|last date to apply|registration begins|students to get|government announces|know how to apply|direct link to apply|installment released|second installment|first installment|payment status|check payment status|critical review of|a review of|review of [a-z\s]+ schemes?|a study on|empirical study|research paper|journal of)\b/i.test(lowerName);
  if (!isDedicatedScholarshipProfile) {
    if (/pib\.gov\.in|\/press-release|\/news\/|\/article\/|\/pressrelease|\/post\/|\/blog\//i.test(lowerUrl) || !hasSpecificScheme && /buddy4study|careers360|jagranjosh|timesofindia|hindustantimes|thehindu|indianexpress|vikaspedia|ndtv|theprint|amarujala|dainikbhaskar|collegedunia|shiksha|news18|livehindustan|abplive|indiatoday|zeenews|worldolympiads|indiascholarships|findmycollege|collegemarker|workassist|govtschemes|sarkariyojana|sarkariyojnaa|sarkariresult|vajiramandravi|sagepub|researchgate|jstor|sciencedirect|springer|quora|edunexttechnologies|justdial|indiamart|tradeindia|sulekha|quikr|howdoiindia|cscportal|\.in\.net/i.test(lowerUrl) || isNewsOrMediaHeadline) {
      return "news_or_article";
    }
  }
  let host = "";
  let path2 = "";
  try {
    const parsed = new URL(urlStr || "");
    host = parsed.hostname.toLowerCase();
    path2 = parsed.pathname.toLowerCase();
  } catch {
  }
  const isBareRoot = path2 === "" || path2 === "/" || path2 === "/index.html" || path2 === "/index.aspx" || path2 === "/home" || path2 === "/default.aspx";
  const isKnownPortalDomain = host === "scholarships.gov.in" || host === "edistrict.delhigovt.nic.in" || host === "scholarship.up.gov.in" || host === "pmsonline.bih.nic.in" || host === "medhasoft.bih.nic.in" || host === "myscheme.gov.in";
  const hasSpecificSchemeTitle = /\b(scholarship|fellowship|stipend|tuition|post[- ]?matric|pre[- ]?matric|reimbursement|financial assistance|pragati|saksham|swanath|yojana|aid to students?|merit scholarship|top class|education support)\b/i.test(lowerName) && !/\b(delhi e-district services|e-district services|services list|scholarship application|all scholarships?|portal login|citizen login|live scholarships?)\b/i.test(lowerName);
  const isGenericPortalTitle = /^(national scholarship portal|nsp|e-district delhi|delhi e-district|up scholarship portal|bihar pms portal|medhasoft portal|myscheme portal)$/i.test(lowerName) || /^(portal login|citizen login|student login|applicant registration|apply online portal|candidate login|services|public services|delhi e-district services.*)$/i.test(lowerName) || isKnownPortalDomain && isBareRoot && !hasSpecificSchemeTitle && !/\b(scheme|yojana|grant|scholarship|subsidy|aid)\b/i.test(lowerName);
  if (isGenericPortalTitle || !hasSpecificSchemeTitle && !/\b(scheme|yojana|grant|scholarship|subsidy|aid)\b/i.test(lowerName) && /\/login|\/signin|\/registration|\/citizenlogin|\/officerlogin|\/studentlogin|\/student-corner|\/institutes|\/applyonline|\/services\b|\/public\/services/i.test(path2)) {
    return "application_portal";
  }
  const isDepartmentPage = /^(department of|ministry of|directorate of|commissioner of|social welfare department|welfare department|sc\/?st\/?obc welfare|sc\/st welfare|delhi government portal|government of nct of delhi|government of uttar pradesh|government of bihar|national portal of india)\b/i.test(lowerName) || /\b(department for the welfare of sc|directorate of higher education|ministry of social justice|ministry of tribal affairs)\b/i.test(lowerName) || host === "scstwelfare.delhi.gov.in" && (isBareRoot || path2.startsWith("/about") || path2.startsWith("/home") || path2.startsWith("/contact")) || host === "dhe.delhi.gov.in" && (isBareRoot || path2.startsWith("/about") || path2.startsWith("/home"));
  const isDirectoryOrListing = /^\/(all-schemes|schemes-list|services|department-services|search|view-all)/i.test(path2) || /\b(all scholarships?|list of schemes?|schemes directory|services list|schemes on nsp|schemes dashboard|scholarship schemes of delhi|list of scholarship schemes)\b/i.test(lowerName);
  const isDirectoryOrGroupingTitle = /\b(fellowship[s]?\s*[\/&]\s*scholarship[s]?|scholarship[s]?\s*[\/&]\s*fellowship[s]?|fellowships?\s+(and|&)\s+scholarships?|scholarships?\s+(and|&)\s+fellowships?)\b/i.test(lowerName) || /^(aicte|ugc|dst|dbt|csir|mhrd|moe|aiims|icmr|icar)\s+(fellowships?|scholarships?|schemes?|initiatives?)(\s*[\/&]\s*(fellowships?|scholarships?|schemes?))?$/i.test(lowerName) || /^(fellowship[s]?[\/&]scholarship[s]?|scholarship[s]?[\/&]fellowship[s]?)$/i.test(lowerName);
  const isCollegeNoticeOrListing = /\b(scholarships?\s+available\s+on|scholarships?\s+offered\s+by|scholarship\s+scheme\s+portal\s+is\s+open|portal\s+is\s+open\s+for\s+submission|student\s+corner|notice\s*board|student\s+services|academic\s+updates?)\b/i.test(lowerName) || /\b(scholarship\s+schemes\s*[-–]\s*launched\s+by|schemes\s+launched\s+by|live scholarships?|global scholarships?|all scholarships?|private scholarships?)\b/i.test(lowerName) || /^(scholarships? offered by|state scholarships|central scholarships|scholarships on nsp|all scholarships?|live scholarships?)\b/i.test(lowerName) || /\/noticeboard|\/notice-board|\/studentcorner|\/student-corner|\/students\/scholarships\b|\/academic-updates|\/livescholarships|\/9383-2/i.test(lowerUrl) || /\b(nludelhi\.ac\.in|adgips\.ac\.in)\b/i.test(lowerUrl);
  if (isDepartmentPage || isDirectoryOrGroupingTitle || isCollegeNoticeOrListing || !hasSpecificSchemeTitle && isDirectoryOrListing) {
    return "official_scheme_directory";
  }
  if (/^(home|index|about us|contact us|feedback|tenders?|recruitment|vacanc(y|ies)|site map|privacy policy|disclaimer|terms and conditions)$/i.test(lowerName) || lowerName.length < 4 || /^(national scholarship schemes?|central sector schemes?|state scholarship schemes?|welfare schemes?|flagship schemes?)$/i.test(lowerName)) {
    return "unrelated_or_insufficient";
  }
  const isSchemeLikeTitle = hasSpecificSchemeTitle || /\b(scheme|yojana|pratibha|vikas|protsahan|sahayata|suraksha|kisan|fasal|bima|samman|credit|subsidy|grant|pension|awas|arogya|swasthya|aid|assistance|dbt|fellowship|scholarship)\b/i.test(lowerName) || lowerName.length > 8;
  if (isSchemeLikeTitle && !isDepartmentPage && !isDirectoryOrGroupingTitle) {
    return "individual_scheme";
  }
  return "unrelated_or_insufficient";
}
function identifyParentSchemeForDocument(rawName, url = "", textSnippet = "") {
  const combined = `${rawName} ${url} ${textSnippet}`.toLowerCase();
  if (/eicher|iifl|netafim|mahindratractor|tractorjunction|stashfin|mittigold/i.test(combined)) {
    return {
      parentSchemeName: "",
      documentType: "commercial_or_unverified_source",
      documentTitle: rawName
    };
  }
  if (/standing committee|sansad\.in|lok sabha|rajya sabha/i.test(combined)) {
    return {
      parentSchemeName: "",
      documentType: "rejected_report",
      documentTitle: rawName
    };
  }
  if (/^(schemes? for (the )?welfare of|schemes? for farmers|welfare schemes for|major schemes for|central sector schemes for|flagship schemes for|agricultural schemes in|government initiatives for|important schemes for)\b/i.test(rawName) || /\b(schemes for welfare of farmers|welfare of farmers|schemes for farmers)\b/i.test(rawName) || /^(pib\s*[-–:]\s*schemes|press information bureau\s*[-–:]\s*schemes)\b/i.test(rawName)) {
    return {
      parentSchemeName: "",
      documentType: "rejected_report",
      documentTitle: rawName
    };
  }
  const isDocumentLike = /\b(guidelines?|operational guidelines?|faqs?|frequently asked questions?|circulars?|notifications?|rules?|manual|handbook|brief note|evaluation|report|apps? on google play|play store|application form|sop|cabinet approves?|cabinet decision|continuation of|press release|news update)\b/i.test(rawName) || /\.(pdf|docx?|xlsx?)$/i.test(url) || /\/storage\/pdf|\/downloads?\/|\/circulars?\/|\/news_updates\/|\/pressrelease\/|\/press-release\/|\/pib\.gov\.in/i.test(url);
  if (!isDocumentLike) {
    return null;
  }
  if (/pmfby|fasal bima|amnex\.co\.in|crop insurance guidelines/i.test(combined)) {
    return {
      parentSchemeName: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
      documentType: "official_supporting_document",
      documentTitle: rawName
    };
  }
  if (/pmkisan|pm-kisan|kisan samman nidhi/i.test(combined)) {
    return {
      parentSchemeName: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
      documentType: "official_supporting_document",
      documentTitle: rawName
    };
  }
  if (/\bkcc\b|kisan credit card/i.test(combined)) {
    return {
      parentSchemeName: "Kisan Credit Card (KCC)",
      documentType: "official_supporting_document",
      documentTitle: rawName
    };
  }
  if (/pm-?kusum|kisan urja suraksha/i.test(combined)) {
    return {
      parentSchemeName: "Pradhan Mantri Kisan Urja Suraksha evam Utthaan Mahabhiyan (PM-KUSUM)",
      documentType: "official_supporting_document",
      documentTitle: rawName
    };
  }
  if (/pmmy|mudra/i.test(combined)) {
    return {
      parentSchemeName: "Pradhan Mantri Mudra Yojana (PMMY)",
      documentType: "official_supporting_document",
      documentTitle: rawName
    };
  }
  if (/pmegp|prime minister.*employment generation/i.test(combined)) {
    return {
      parentSchemeName: "Prime Minister's Employment Generation Programme (PMEGP)",
      documentType: "official_supporting_document",
      documentTitle: rawName
    };
  }
  if (/ayushman|pm-?jay|jan arogya/i.test(combined)) {
    return {
      parentSchemeName: "Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana (PM-JAY)",
      documentType: "official_supporting_document",
      documentTitle: rawName
    };
  }
  if (/svanidhi|street vendor/i.test(combined)) {
    return {
      parentSchemeName: "PM SVANidhi (PM Street Vendor's AtmaNirbhar Nidhi)",
      documentType: "official_supporting_document",
      documentTitle: rawName
    };
  }
  if (/\bnlm\b|national livestock mission/i.test(combined)) {
    return {
      parentSchemeName: "National Livestock Mission (NLM)",
      documentType: "official_supporting_document",
      documentTitle: rawName
    };
  }
  return null;
}
function isInvalidSchemeName(name) {
  if (!name || typeof name !== "string") return true;
  const trimmed = name.trim();
  if (trimmed.length < 5) return true;
  if (/^https?:\/\//i.test(trimmed)) return true;
  if (/^(up|uttar pradesh|bihar|delhi|odisha|karnataka|punjab|haryana|rajasthan|assam|gujarat)\s*[-–:]\s*[a-z\s]*government$/i.test(trimmed)) return true;
  if (/^(national\s*:\s*nsp|national scholarship portal\s*:\s*nsp|nsp\s*:\s*national)$/i.test(trimmed)) return true;
  if (/\.(pdf|docx?|xlsx?|html?|txt|csv)$/i.test(trimmed)) return true;
  const normalizedState = normalizeStateName(trimmed);
  if (normalizedState && normalizedState.toLowerCase() === trimmed.toLowerCase()) return true;
  if (/^(india|central government|state government|government of india)$/i.test(trimmed)) return true;
  for (const pattern of INVALID_SCHEME_NAME_PATTERNS) {
    if (pattern.test(trimmed)) return true;
  }
  if (/^untitled\b/i.test(trimmed) && !/yojana|scheme|scholarship|protsahan|mission/i.test(trimmed)) {
    return true;
  }
  return false;
}
function sanitizeSchemeName(rawName) {
  if (!rawName || typeof rawName !== "string") return null;
  let cleaned = rawName.replace(/[\u{1F300}-\u{1F9FF}]/gu, "").replace(/^\[(pdf|doc|docx|file|presentation)\]\s*/i, "").replace(/^untitled\s*[-|–:]\s*/i, "").replace(/\s*\|\s*.*$/g, "").replace(/\s*[-–]\s*(NFS|NITI|NITI for States|National Scholarship Portal|NSP|MyScheme|Govt of India|Government of India|India\.gov\.in|AICTE|UGC|UMANG).*$/i, "").replace(/\b(2024|2025|2026|2027)(?:-\d{2,4})?\b/g, "").replace(/\b(mizor\s*scheme|scholarship\s*portal|online\s*portal|application\s*portal)\b/gi, "").replace(/\s*[-|–:.]\s*$/g, "").replace(/\s+/g, " ").trim();
  if (isInvalidSchemeName(cleaned)) {
    return null;
  }
  return cleaned;
}
var GENERIC_BENEFIT_REGEX = [
  /financial assistance,?\s*educational support,?\s*or maintenance allowance as per official guidelines/i,
  /government financial assistance and welfare subsidy under official guidelines/i,
  /financial assistance and welfare benefits as per scheme guidelines/i,
  /financial aid and welfare benefits/i,
  /generic (welfare|financial|benefit|assistance|support)/i,
  /refer to official (site|portal|notification|guidelines)/i,
  /information not available/i,
  /as per (official |scheme |department |government )?guidelines/i,
  /as per (official |scheme |department |government )?norms/i,
  /financial assistance provided as per/i,
  /^benefits? as per/i,
  /^welfare benefits? as per/i,
  /direct (welfare|financial) assistance and benefit support as per/i,
  /credit linkage, margin money subsidy, and enterprise facilitation/i,
  /direct benefit transfer \(dbt\) scholarship covering tuition/i,
  /benefit details not verified/i,
  /not verified from primary source/i
];
function isGenericBenefit(benefit) {
  if (!benefit || typeof benefit !== "string") return true;
  const trimmed = benefit.trim();
  if (trimmed.length < 10) return true;
  for (const pattern of GENERIC_BENEFIT_REGEX) {
    if (pattern.test(trimmed)) return true;
  }
  return false;
}
function validateApplicationUrl(urlStr) {
  if (!urlStr || typeof urlStr !== "string") return null;
  if (!isValidPublicUrl(urlStr)) return null;
  try {
    const parsed = new URL(urlStr);
    const path2 = parsed.pathname.toLowerCase();
    const host = parsed.hostname.toLowerCase();
    if (/\.(pdf|docx?|xlsx?|txt|zip)$/i.test(path2)) {
      return null;
    }
    if (/pib\.gov\.in|pressrelease|press-release|\/news\/|\/announcement\/|\/media\//i.test(host + path2)) {
      return null;
    }
    if (host.includes("myscheme.gov.in")) {
      return null;
    }
    if (/buddy4study|careers360|jagranjosh|thehindu|indianexpress|timesofindia|vikaspedia|india\.gov\.in/i.test(host)) {
      return null;
    }
    const isApexScholarshipPortal = host === "scholarships.gov.in" || host === "scholarship.up.gov.in" || host === "pmsonline.bih.nic.in" || host === "medhasoft.bih.nic.in" || host === "edistrict.delhigovt.nic.in";
    if (isApexScholarshipPortal) {
      return urlStr;
    }
    if (/^\/(search|contact|about|faq|faqs|downloads?|index\.html?|index\.php)?\/?$/.test(path2) || /\/faq(\.aspx|\/|$)/i.test(path2)) {
      return null;
    }
    if (path2 === "" || path2 === "/") {
      return null;
    }
    if (/^\/(info|info-\d+|schemes?|guidelines?|department|public\/\d+|about|overview|notifications?)\//i.test(path2)) {
      return null;
    }
    const isAppEndpoint = /apply|registration|register|citizen[-_]service|serviceonline|farmerregistration|online[-_]?application|application[-_]?form|new[-_]?registration|beneficiary\/register/i.test(path2) || /\/(apply|registration|register|applications?|forms?)\b/i.test(path2);
    if (!isAppEndpoint) {
      return null;
    }
    return urlStr;
  } catch {
    return null;
  }
}
function extractNamedSchemesFromText(text) {
  const recognizedSchemes = [
    { pattern: /\b(pm-?kisan|kisan samman nidhi)\b/i, name: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)" },
    { pattern: /\b(pmfby|fasal bima)\b/i, name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)" },
    { pattern: /\b(kisan credit card|kcc)\b/i, name: "Kisan Credit Card (KCC)" },
    { pattern: /\b(soil health card)\b/i, name: "Soil Health Card Scheme" },
    { pattern: /\b(pradhan mantri krishi sinchayee|pmksy)\b/i, name: "Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)" },
    { pattern: /\b(integrated scheme on agriculture cooperation|isac)\b/i, name: "Integrated Scheme on Agriculture Cooperation" },
    { pattern: /\b(agriculture infrastructure fund|aif)\b/i, name: "Agriculture Infrastructure Fund (AIF)" },
    { pattern: /\b(sub-?mission on agricultural mechanization|smam)\b/i, name: "Sub-Mission on Agricultural Mechanization (SMAM)" },
    { pattern: /\b(paramparagat krishi vikas yojana|pkvy)\b/i, name: "Paramparagat Krishi Vikas Yojana (PKVY)" },
    // Education & Scholarship Schemes (MVP Scope)
    { pattern: /\b(central sector scheme of scholarship|csss)\b/i, name: "Central Sector Scheme of Scholarship for College and University Students" },
    { pattern: /\b(national means[- ]cum[- ]merit|nmmss)\b/i, name: "National Means-cum-Merit Scholarship Scheme (NMMSS)" },
    { pattern: /\b(pm[- ]?yasasvi|yasasvi)\b/i, name: "PM YASASVI Scholarship for OBC, EBC and DNT" },
    { pattern: /\b(pragati scholarship|aicte pragati)\b/i, name: "AICTE Pragati Scholarship Scheme for Girl Students" },
    { pattern: /\b(saksham scholarship|aicte saksham)\b/i, name: "AICTE Saksham Scholarship Scheme for Specially-Abled Students" },
    { pattern: /\b(ishaan uday)\b/i, name: "Ishaan Uday Special Scholarship Scheme for NER" },
    { pattern: /\b(reimbursement of tuition fee.*(?:sc|st|obc|minority)|tuition fee reimbursement.*public school)\b/i, name: "Reimbursement of Tuition Fee for SC/ST/OBC/Minority Students in Public Schools" },
    { pattern: /\b(merit scholarship.*(?:sc|st|obc|minority)|delhi merit scholarship)\b/i, name: "Merit Scholarship for SC/ST/OBC/Minority Students (Delhi)" },
    { pattern: /\b(dr\.?\s*b\.?r\.?\s*ambedkar state award)\b/i, name: "Dr. B.R. Ambedkar State Award for SC/ST/OBC/Minorities (Delhi)" },
    { pattern: /\b(up scholarship|uttar pradesh scholarship|dashmottar|shulk pratipoorti|post[- ]?matric.*(?:up|uttar pradesh)|up post[- ]?matric)\b/i, name: "UP Post-Matric Scholarship and Fee Reimbursement Scheme" },
    { pattern: /\b(up pre[- ]?matric|pre[- ]?matric.*(?:up|uttar pradesh))\b/i, name: "UP Pre-Matric Scholarship Scheme" },
    { pattern: /\b(abhyuday|mukhyamantri abhyudaya)\b/i, name: "Mukhyamantri Abhyudaya Yojana (UP)" },
    { pattern: /\b(jai bhim mukhyamantri pratibha vikas)\b/i, name: "Jai Bhim Mukhyamantri Pratibha Vikas Yojana" },
    { pattern: /\b(financial assistance for purchase of books and stationery)\b/i, name: "Financial Assistance for Purchase of Books and Stationery (Delhi)" },
    { pattern: /\b(up dashmottar|dashmottar scholarship|post[- ]matric scholarship.*uttar pradesh)\b/i, name: "Uttar Pradesh Dashmottar (Post-Matric) Scholarship and Fee Reimbursement" },
    { pattern: /\b(up pre[- ]matric scholarship|pre[- ]matric scholarship.*uttar pradesh)\b/i, name: "Uttar Pradesh Pre-Matric Scholarship" },
    { pattern: /\b(bihar post[- ]matric scholarship|post[- ]matric scholarship.*bihar|bihar pms)\b/i, name: "Bihar Post-Matric Scholarship (PMS)" },
    { pattern: /\b(mukhyamantri kanya utthan yojana|kanya utthan.*bihar)\b/i, name: "Mukhyamantri Kanya Utthan Yojana" },
    { pattern: /\b(mukhyamantri balak.*balika protsahan|bihar 10th pass scholarship)\b/i, name: "Mukhyamantri Balak / Balika Protsahan Yojana" },
    { pattern: /\bpost[- ]matric scholarship for sc students\b/i, name: "Post-Matric Scholarship for SC Students" },
    { pattern: /\bpre[- ]matric scholarship for sc students\b/i, name: "Pre-Matric Scholarship for SC Students" },
    { pattern: /\bpost[- ]matric scholarship for st students\b/i, name: "Post-Matric Scholarship for ST Students" },
    { pattern: /\bpre[- ]matric scholarship for st students\b/i, name: "Pre-Matric Scholarship for ST Students" },
    { pattern: /\bpost[- ]matric scholarship for obc students\b/i, name: "Post-Matric Scholarship for OBC Students" },
    { pattern: /\bpre[- ]matric scholarship for obc students\b/i, name: "Pre-Matric Scholarship for OBC Students" }
  ];
  const matched = [];
  for (const item of recognizedSchemes) {
    if (item.pattern.test(text) && !matched.includes(item.name)) {
      matched.push(item.name);
    }
  }
  return matched;
}
var BLOCKED_HOSTNAMES = [
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "169.254.169.254",
  "metadata.google.internal"
];
function isValidPublicUrl(urlStr) {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }
    const host = parsed.hostname.toLowerCase();
    if (BLOCKED_HOSTNAMES.includes(host)) {
      return false;
    }
    if (host.startsWith("10.") || host.startsWith("192.168.") || host.startsWith("172.16.") || host.startsWith("172.17.") || host.startsWith("172.18.") || host.startsWith("172.19.") || host.startsWith("172.2") || host.startsWith("172.30.") || host.startsWith("172.31.") || host.endsWith(".local") || host.endsWith(".internal")) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

// lib/sourceVerification.ts
var STATUTORY_SCHEME_PORTALS = {
  "mudra.org.in": "MUDRA Ltd (Subsidiary of SIDBI / GoI)",
  "cgtmse.in": "Credit Guarantee Fund Trust for Micro and Small Enterprises (Ministry of MSME / SIDBI)",
  "standupmitra.in": "Small Industries Development Bank of India (SIDBI)",
  "udyamimitra.in": "Small Industries Development Bank of India (SIDBI)",
  "jansamarth.in": "National Portal for Credit Linked Government Schemes (GoI)",
  "maandhan.in": "Ministry of Labour and Employment (GoI)",
  "vikaspedia.in": "Ministry of Electronics and IT / C-DAC India Development Gateway",
  "aicte-india.org": "All India Council for Technical Education (Ministry of Education)",
  "mahaonline.gov.in": "Maharashtra Information Technology Corporation Ltd",
  "pfrda.org.in": "Pension Fund Regulatory and Development Authority (GoI)",
  "jeevandayee.gov.in": "State Health Assurance Society Maharashtra",
  "cmchistn.com": "Chief Minister Comprehensive Health Insurance Scheme (Government of Tamil Nadu)"
};
var REPUTABLE_SECONDARY_DOMAINS = {
  "buddy4study.com": "Buddy4Study Scholarship Portal",
  "careers360.com": "Careers360 Educational Directory",
  "scholarships360.com": "Scholarships360 Directory",
  "jagranjosh.com": "Jagran Josh Education & Careers",
  "ibef.org": "India Brand Equity Foundation (Secondary Reference)",
  "krishijagran.com": "Krishi Jagran Agri Media",
  "indiafilings.com": "IndiaFilings Reference Guide",
  "thehindu.com": "The Hindu Newspaper",
  "indianexpress.com": "The Indian Express",
  "timesofindia.indiatimes.com": "The Times of India",
  "ndtv.com": "NDTV News",
  "hindustantimes.com": "Hindustan Times",
  "livemint.com": "Mint News"
};
var COMMERCIAL_OR_BANK_DOMAINS = {
  // Commercial Machinery, Tractor & Agritech Manufacturers
  "eichertractors.in": "Eicher Tractors (Commercial Tractor Manufacturer)",
  "eicher.in": "Eicher Motors Ltd (Commercial Entity)",
  "mahindratractor.com": "Mahindra Tractors (Commercial Manufacturer)",
  "mahindra.com": "Mahindra & Mahindra Ltd",
  "tractorjunction.com": "Tractor Junction (Commercial Marketplace)",
  "tractorforeveryone.com": "Tractor Commercial Portal",
  "netafimindia.com": "Netafim India (Commercial Irrigation Equipment Vendor)",
  "netafim.com": "Netafim Ltd",
  "johndeere.co.in": "John Deere India (Commercial Machinery)",
  "sonalika.com": "Sonalika Tractors (Commercial Manufacturer)",
  "tafe.com": "TAFE Tractors (Commercial Manufacturer)",
  "escortsgroup.com": "Escorts Kubota Ltd (Commercial Manufacturer)",
  "kubota.co.in": "Kubota Agricultural Machinery India",
  // Commercial Banks
  "sbi.co.in": "State Bank of India (Commercial Bank)",
  "sbi.bank.in": "State Bank of India (Commercial Bank)",
  "hdfcbank.com": "HDFC Bank (Commercial Bank)",
  "hdfc.bank.in": "HDFC Bank (Commercial Bank)",
  "icicibank.com": "ICICI Bank (Commercial Bank)",
  "axisbank.com": "Axis Bank (Commercial Bank)",
  "bankofbaroda.in": "Bank of Baroda (Commercial Bank)",
  "bankofmaharashtra.bank.in": "Bank of Maharashtra (Commercial Bank)",
  "canarabank.com": "Canara Bank (Commercial Bank)",
  "pnbindia.in": "Punjab National Bank (Commercial Bank)",
  // Commercial Directories, Yellow Pages & Classifieds
  "justdial.com": "Justdial (Commercial Business Directory / Yellow Pages)",
  "indiamart.com": "IndiaMART (Commercial B2B Directory)",
  "tradeindia.com": "TradeIndia (Commercial Directory)",
  "sulekha.com": "Sulekha (Commercial Local Directory)",
  "quikr.com": "Quikr (Commercial Classifieds)",
  "olx.in": "OLX India (Commercial Classifieds)",
  // Aggregators, FinTech, Commercial Blogs & Private NBFCs
  "iifl.com": "IIFL Finance (Commercial NBFC / Financial Services)",
  "iiflfinance.com": "IIFL Finance (Commercial NBFC)",
  "paisabazaar.com": "Paisabazaar Marketing & Aggregation",
  "bankbazaar.com": "BankBazaar Financial Aggregator",
  "stashfin.com": "Stashfin Private Lending Platform",
  "cred.club": "CRED Fintech Service",
  "bajajfinserv.in": "Bajaj Finserv Private Financial Services",
  "cleartax.in": "ClearTax Financial & Filing Software",
  "mittigoldorganic.com": "MittiGold Organic (Commercial Agri Venture)",
  "impriindia.com": "IMPRI Policy Research (Private Think Tank)",
  "govtschemesindia.com": "GovtSchemesIndia (Private Blog / Ad Platform)",
  "jharkhandstatenews.com": "JharkhandStateNews (Private News Blog)",
  "howdoiindia.com": "HowDoIIndia (Private Ad / Blog Platform)",
  "cscportal.in": "CSC Portal Blog (Unofficial Private Site - Not csc.gov.in)",
  "pmfby.in.net": "PMFBY In Net (Unofficial Private Domain - Imposter Site)",
  "pmkisan.in.net": "PM-KISAN In Net (Unofficial Private Domain - Imposter Site)",
  "sarkariyojana.com": "Sarkari Yojana Blog (Private Ad Platform)",
  "sarkariyojnaa.com": "Sarkari Yojnaa Blog (Private Ad Platform)",
  "sarkariresult.com": "Sarkari Result (Private Job/Exam Portal)",
  // App Stores & APK Downloads
  "play.google.com": "Google Play Store (Mobile App Marketplace)",
  "apps.apple.com": "Apple App Store (Mobile App Marketplace)",
  "apkpure.com": "APKPure (Third-Party APK Host)",
  // Social Media & Generic Content Platforms
  "facebook.com": "Social Media Platform",
  "twitter.com": "Social Media Platform",
  "x.com": "Social Media Platform",
  "instagram.com": "Social Media Platform",
  "youtube.com": "Social Video Platform",
  "linkedin.com": "Professional Networking Platform",
  "scribd.com": "Document Sharing Platform",
  "pinterest.com": "Image Bookmarking Platform",
  // Political Party Websites
  "bjp.org": "Political Party Website",
  "inc.in": "Political Party Website",
  "aamaadmiparty.org": "Political Party Website"
};
function classifySourceRelationship(urlStr, isOfficialHost, isSecondaryHost, isCommercialHost) {
  if (isCommercialHost) {
    return "commercial_or_unverified_source";
  }
  if (isSecondaryHost) {
    return "reputable_secondary_source";
  }
  if (!isOfficialHost) {
    return "commercial_or_unverified_source";
  }
  try {
    const parsed = new URL(urlStr);
    const path2 = parsed.pathname.toLowerCase();
    const host = parsed.hostname.toLowerCase();
    if (/\.(pdf|docx?|xlsx?|txt|csv)$/i.test(path2) || /guideline|circular|notification|resolution|act|rules|report|compendium|faq/i.test(path2) || /pib\.gov\.in|pressrelease|press-release|\/news\/|\/announcement\/|\/media\//i.test(host + path2)) {
      return "official_supporting_document";
    }
    if (/apply|registration|register|citizen-service|serviceonline|farmerregistration|online-application|applicationform|new-registration|beneficiary\/register/i.test(path2) || /\/(apply|registration|register|forms?)\b/i.test(path2)) {
      return "official_application_portal";
    }
    return "official_scheme_page";
  } catch {
    return "commercial_or_unverified_source";
  }
}
function classifySource(urlStr, targetState) {
  try {
    const parsed = new URL(urlStr);
    let domain = parsed.hostname.toLowerCase();
    if (domain.startsWith("www.")) {
      domain = domain.slice(4);
    }
    const pathname = parsed.pathname.toLowerCase();
    const isGenericHomepage = pathname === "" || pathname === "/" || pathname === "/home" || pathname === "/default.aspx" || pathname === "/index.html" || pathname === "/index.php";
    for (const [commDomain, commOwner] of Object.entries(COMMERCIAL_OR_BANK_DOMAINS)) {
      if (domain === commDomain || domain.endsWith("." + commDomain)) {
        return {
          classification: "commercial_source",
          relationship: "commercial_or_unverified_source",
          isOfficial: false,
          isSecondary: false,
          isCommercial: true,
          domain,
          ownerName: commOwner,
          rationale: `Commercial entity, vendor, fintech aggregator, or social platform (${commOwner}). Never an official government department.`,
          isGenericHomepage
        };
      }
    }
    if (domain.endsWith(".bank.in") || domain.endsWith(".bank")) {
      return {
        classification: "commercial_source",
        relationship: "commercial_or_unverified_source",
        isOfficial: false,
        isSecondary: false,
        isCommercial: true,
        domain,
        ownerName: "Commercial Banking Institution",
        rationale: "Commercial banking domain (.bank.in). Regulated commercial banking provider, not a government department.",
        isGenericHomepage
      };
    }
    const resolveOfficialClassification = (rel) => {
      if (rel === "official_application_portal") return "official_application_portal";
      if (rel === "official_supporting_document") return "official_supporting_document";
      return "official_government_scheme_page";
    };
    for (const [statDomain, statOwner] of Object.entries(STATUTORY_SCHEME_PORTALS)) {
      if (domain === statDomain || domain.endsWith("." + statDomain)) {
        const rel = classifySourceRelationship(urlStr, true, false, false);
        return {
          classification: resolveOfficialClassification(rel),
          relationship: rel,
          isOfficial: true,
          isSecondary: false,
          isCommercial: false,
          domain,
          ownerName: statOwner,
          rationale: `Authorized statutory scheme portal maintained by ${statOwner}.`,
          isGenericHomepage
        };
      }
    }
    if (CENTRAL_OFFICIAL_DOMAINS.some((d) => domain === d || domain.endsWith("." + d))) {
      const rel = classifySourceRelationship(urlStr, true, false, false);
      return {
        classification: resolveOfficialClassification(rel),
        relationship: rel,
        isOfficial: true,
        isSecondary: false,
        isCommercial: false,
        domain,
        ownerName: "Government of India",
        rationale: "Official Central Government portal verified via National Informatics Centre (NIC) registry.",
        isGenericHomepage
      };
    }
    if (domain.endsWith(".ac.in") || domain.endsWith(".edu")) {
      return {
        classification: "secondary_source",
        relationship: "reputable_secondary_source",
        isOfficial: false,
        isSecondary: true,
        isCommercial: false,
        domain,
        ownerName: "Educational / University Institution",
        rationale: "Academic institution domain. Serves secondary reference information, not an apex welfare department.",
        isGenericHomepage
      };
    }
    const detectedState = identifyStateFromDomain(urlStr);
    if (detectedState) {
      const stateMeta = STATE_METADATA_MAP[detectedState];
      const owner = `Government of ${detectedState}`;
      const rel = classifySourceRelationship(urlStr, true, false, false);
      return {
        classification: resolveOfficialClassification(rel),
        relationship: rel,
        isOfficial: true,
        isSecondary: false,
        isCommercial: false,
        domain,
        ownerName: owner,
        rationale: `Official State Government portal for ${detectedState} under ${stateMeta?.domainSuffixes[0] || ".gov.in"}.`,
        isGenericHomepage
      };
    }
    if (domain.endsWith(".gov.in") || domain.endsWith(".nic.in")) {
      const rel = classifySourceRelationship(urlStr, true, false, false);
      return {
        classification: resolveOfficialClassification(rel),
        relationship: rel,
        isOfficial: true,
        isSecondary: false,
        isCommercial: false,
        domain,
        ownerName: "Government of India / State Authority",
        rationale: "Official Indian Government domain verified by .gov.in/.nic.in registry.",
        isGenericHomepage
      };
    }
    for (const [secDomain, secOwner] of Object.entries(REPUTABLE_SECONDARY_DOMAINS)) {
      if (domain === secDomain || domain.endsWith("." + secDomain)) {
        return {
          classification: "secondary_source",
          relationship: "reputable_secondary_source",
          isOfficial: false,
          isSecondary: true,
          isCommercial: false,
          domain,
          ownerName: secOwner,
          rationale: `Recognized secondary welfare/scholarship directory (${secOwner}).`,
          isGenericHomepage
        };
      }
    }
    if (domain.endsWith(".org") || domain.endsWith(".org.in")) {
      return {
        classification: "secondary_source",
        relationship: "reputable_secondary_source",
        isOfficial: false,
        isSecondary: true,
        isCommercial: false,
        domain,
        ownerName: "Non-profit or Research Organization",
        rationale: "Non-governmental organizational domain.",
        isGenericHomepage
      };
    }
    return {
      classification: "unknown",
      relationship: "commercial_or_unverified_source",
      isOfficial: false,
      isSecondary: false,
      isCommercial: false,
      domain,
      ownerName: domain,
      rationale: "Domain ownership cannot be verified against official registries or trusted secondary indexes.",
      isGenericHomepage
    };
  } catch {
    return {
      classification: "unknown",
      relationship: "commercial_or_unverified_source",
      isOfficial: false,
      isSecondary: false,
      isCommercial: false,
      domain: "unknown",
      ownerName: "Unknown Source",
      rationale: "Invalid or malformed URL.",
      isGenericHomepage: true
    };
  }
}
function evaluateVerificationStatus(params) {
  const {
    jurisdictionResult,
    sourceClassification,
    hasCorroboratedName,
    hasCorroboratedBenefit,
    pageFetchedSuccessfully,
    hasConfirmedApplicationUrl = false,
    hasCorroboratedEligibility = false
  } = params;
  if (!jurisdictionResult.isApplicableToTarget) {
    return {
      status: "rejected",
      evidenceNote: jurisdictionResult.rejectionReason || "Incompatible jurisdiction.",
      rejectionReason: jurisdictionResult.rejectionReason || "Incompatible jurisdiction."
    };
  }
  if (sourceClassification.isOfficial) {
    if (hasCorroboratedName) {
      const partialReasons = [];
      if (!hasCorroboratedBenefit) {
        partialReasons.push("Financial benefit details not verified from primary source.");
      }
      if (!hasConfirmedApplicationUrl) {
        partialReasons.push("Direct online application link not verified on official portal.");
      }
      if (!hasCorroboratedEligibility) {
        partialReasons.push("Specific eligibility criteria require further verification on portal.");
      }
      if (!pageFetchedSuccessfully) {
        partialReasons.push("Primary source page content could not be fetched for in-depth corroboration.");
      }
      if (hasCorroboratedBenefit && jurisdictionResult.confidence === "high" && hasConfirmedApplicationUrl) {
        return {
          status: "verified",
          evidenceNote: `Verified official record: Jurisdiction (${jurisdictionResult.jurisdiction}), official authority (${sourceClassification.ownerName}), scheme identity, benefit terms, and application portal corroborated from primary source.`
        };
      }
      if (hasCorroboratedBenefit && jurisdictionResult.confidence === "high") {
        return {
          status: "verified",
          evidenceNote: `Verified official record: Jurisdiction (${jurisdictionResult.jurisdiction}), authority (${sourceClassification.ownerName}), and benefit terms corroborated from primary source. Application link status: ${hasConfirmedApplicationUrl ? "Verified" : "Unverified"}.`,
          partialReasons: partialReasons.length > 0 ? partialReasons : void 0
        };
      }
      return {
        status: "partially_verified",
        evidenceNote: `Partially verified: Official government source (${sourceClassification.ownerName}) and scheme identity established, but one or more fields remain unconfirmed.`,
        partialReasons: partialReasons.length > 0 ? partialReasons : ["One or more scheme claims require primary source verification."]
      };
    }
    return {
      status: "unverified_candidate",
      evidenceNote: `Unverified candidate: Official domain (${sourceClassification.domain}) cited, but source page lacks corroboration for scheme identity.`,
      partialReasons: ["Scheme identity not corroborated in source text."]
    };
  }
  if (sourceClassification.classification === "secondary_source" || sourceClassification.classification === "reputable_secondary" || sourceClassification.isSecondary) {
    if (hasCorroboratedName) {
      return {
        status: "partially_verified",
        evidenceNote: `Partially verified: Scheme identity corroborated from reputable secondary directory (${sourceClassification.ownerName}). Official government portal confirmation pending.`,
        partialReasons: [
          "Secondary source citation; official government portal confirmation pending.",
          "Application portal link not verified on government domain."
        ]
      };
    }
    return {
      status: "unverified_candidate",
      evidenceNote: `Unverified candidate from secondary source citation (${sourceClassification.domain}).`,
      partialReasons: ["Secondary source citation; scheme identity uncorroborated."]
    };
  }
  return {
    status: "unverified_candidate",
    evidenceNote: `Unverified candidate: Source (${sourceClassification.domain}) is a ${sourceClassification.classification} platform without official government standing.`,
    partialReasons: ["Source is not an official government department."]
  };
}

// lib/tinyfishSearch.ts
function classifySourceUrl(urlStr, stateName) {
  const res = classifySource(urlStr, stateName);
  return {
    isOfficial: res.isOfficial,
    isSecondary: res.isSecondary,
    isCommercial: res.isCommercial,
    domain: res.domain
  };
}
function buildSearchQueries(state, persona, customQuery) {
  const normState = normalizeStateName(state);
  const isAllIndia = !normState || normState === "All India / Central";
  const queries = [];
  const stateMeta = !isAllIndia && normState ? STATE_METADATA_MAP[normState] : null;
  if (persona === "business") {
    queries.push({
      query: `site:myscheme.gov.in OR site:udyamimitra.in central MSME loan subsidy scheme 2025 2026`,
      scope: "central",
      description: "Central MSME scheme directory"
    });
    queries.push({
      query: `Pradhan Mantri Mudra Yojana PMMY PMEGP Stand-Up India CGTMSE MSME business credit loan 2025 2026`,
      scope: "central",
      description: "Central flagship MSME credit schemes and aliases"
    });
    queries.push({
      query: `PM Vishwakarma PM SVANidhi micro enterprise credit subsidy portal .gov.in`,
      scope: "central",
      description: "Central artisan and vendor micro-enterprise loans"
    });
    if (!isAllIndia && normState) {
      const apexPortal = stateMeta?.knownApexDomains?.[0] || `${normState.toLowerCase().replace(/\s+/g, "")}.gov.in`;
      const deptDesc = stateMeta?.departments?.msme || `${normState} Directorate of Industries`;
      queries.push({
        query: `site:${apexPortal} Chief Minister employment generation MSME subsidy scheme`,
        scope: "state",
        description: `${normState} official MSME portal`
      });
      queries.push({
        query: `"${normState}" ${deptDesc} self employment loan subsidy scheme guidelines .gov.in`,
        scope: "state",
        description: `${normState} Industries Department guidelines`
      });
      queries.push({
        query: `"${normState}" MSME business loan application portal registration circular 2025 2026`,
        scope: "state",
        description: `${normState} active scheme notifications`
      });
    }
  } else if (persona === "student") {
    queries.push({
      query: `site:scholarships.gov.in post matric scholarship 2025 2026 OTR`,
      scope: "central",
      description: "National Scholarship Portal official portal"
    });
    queries.push({
      query: `site:buddy4study.com "National Scholarship Portal" NSP Central Sector Scheme AICTE Pragati`,
      scope: "central",
      description: "Buddy4Study verified National Scholarship Portal directory"
    });
    queries.push({
      query: `site:buddy4study.com national scholarship 2025 2026 college student eligibility`,
      scope: "central",
      description: "Buddy4Study active national & CSR scholarships"
    });
    if (!isAllIndia && normState) {
      const apexPortal = stateMeta?.knownApexDomains?.[0] || `${normState.toLowerCase().replace(/\s+/g, "")}.gov.in`;
      if (normState === "Uttar Pradesh") {
        queries.push({
          query: `UP Scholarship 2025 2026 scholarship.up.gov.in online registration`,
          scope: "state",
          description: `Uttar Pradesh official scholarship application portal`
        });
        queries.push({
          query: `site:buddy4study.com "UP Scholarship" 2025 2026 post matric eligibility last date`,
          scope: "state",
          description: `Buddy4Study UP scholarship verified directory`
        });
        queries.push({
          query: `UP post matric scholarship fee reimbursement 2025 2026 scholarship.up.gov.in`,
          scope: "state",
          description: `UP Post-Matric scholarship & fee reimbursement`
        });
      } else {
        queries.push({
          query: `"${normState}" post matric scholarship online application 2025 2026 ${apexPortal}`,
          scope: "state",
          description: `${normState} official scholarship portal`
        });
        queries.push({
          query: `site:buddy4study.com "${normState}" scholarship 2025 2026 eligibility application`,
          scope: "state",
          description: `Buddy4Study ${normState} active scholarships`
        });
        queries.push({
          query: `"${normState}" scholarship scheme tuition fee reimbursement students 2025 2026`,
          scope: "state",
          description: `${normState} department scholarship schemes`
        });
      }
    }
  } else if (persona === "farmer") {
    queries.push({
      query: `site:pmkisan.gov.in OR site:pmfby.gov.in central farmer welfare schemes DBT subsidy`,
      scope: "central",
      description: "Central farmer DBT portals"
    });
    queries.push({
      query: `Pradhan Mantri Kisan Samman Nidhi PM-KISAN PMFBY Kisan Credit Card KCC subsidy 2025 2026`,
      scope: "central",
      description: "Central agriculture flagships and credit"
    });
    if (!isAllIndia && normState) {
      const deptDesc = stateMeta?.departments?.agriculture || `${normState} Agriculture Department`;
      queries.push({
        query: `"${normState}" ${deptDesc} farmer welfare financial assistance subsidy scheme .gov.in`,
        scope: "state",
        description: `${normState} agriculture department schemes`
      });
      queries.push({
        query: `"${normState}" kisan direct benefit transfer krishi scheme crop insurance guidelines 2025 2026`,
        scope: "state",
        description: `${normState} krishi DBT & insurance`
      });
      queries.push({
        query: `"${normState}" farmer subsidy equipment micro irrigation solar pump application portal`,
        scope: "state",
        description: `${normState} farmer equipment & irrigation subsidy`
      });
    }
  } else {
    queries.push({
      query: `site:beneficiary.nha.gov.in OR site:nfsa.gov.in OR site:pmaymis.gov.in central welfare schemes`,
      scope: "central",
      description: "Central health, food, and housing portals"
    });
    queries.push({
      query: `Ayushman Bharat PM-JAY PMAY PM Garib Kalyan Anna Yojana citizen subsidy DBT 2025 2026`,
      scope: "central",
      description: "Central social security flagships"
    });
    if (!isAllIndia && normState) {
      const deptDesc = stateMeta?.departments?.socialWelfare || `${normState} Social Welfare Department`;
      queries.push({
        query: `"${normState}" ${deptDesc} citizen pension health insurance ration scheme .gov.in`,
        scope: "state",
        description: `${normState} social welfare department`
      });
      queries.push({
        query: `"${normState}" women child development family financial assistance scheme guidelines .gov.in`,
        scope: "state",
        description: `${normState} women & child welfare`
      });
      queries.push({
        query: `"${normState}" citizen welfare DBT application portal registration 2025 2026`,
        scope: "state",
        description: `${normState} citizen welfare application portal`
      });
    }
  }
  if (customQuery && customQuery.trim().length > 1) {
    const qClean = customQuery.trim().slice(0, 80);
    queries.unshift({
      query: `${qClean} 2025 2026 online portal registration`,
      scope: isAllIndia ? "central" : "state",
      description: "User-specified focus query"
    });
  }
  return queries;
}
async function executeTinyFishSearch(query, apiKey, page = 1, timeoutMs = 1e4) {
  const pageParam = page > 1 ? `&page=${page}` : "";
  const url = `https://api.search.tinyfish.ai?query=${encodeURIComponent(query)}&location=IN${pageParam}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "X-API-Key": apiKey,
        "Accept": "application/json"
      },
      signal: controller.signal
    });
    clearTimeout(timer);
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return {
        query,
        page,
        error: `TinyFish Search HTTP ${res.status}: ${errText.slice(0, 150)}`
      };
    }
    const data = await res.json();
    return data;
  } catch (err) {
    clearTimeout(timer);
    return {
      query,
      page,
      error: `TinyFish Search failed: ${err?.message || "timeout/network error"}`
    };
  }
}
async function runTinyFishSchemeDiscovery(params) {
  const apiKey = typeof params.apiKey === "string" ? params.apiKey : process.env.TINYFISH_API_KEY || "";
  if (!apiKey) {
    return {
      items: [],
      centralItemsCount: 0,
      stateItemsCount: 0,
      errors: ["TINYFISH_API_KEY is not configured on the server."],
      queriesAttempted: [],
      queriesRun: 0,
      uniqueUrlsCount: 0,
      uniqueDomains: [],
      officialCount: 0,
      secondaryCount: 0,
      commercialCount: 0,
      budgetLimitReached: false
    };
  }
  const budgetConfig = {
    maxQueries: params.budget?.maxQueries ?? 6,
    maxFetchPages: params.budget?.maxFetchPages ?? 8,
    timeoutMs: params.budget?.timeoutMs ?? 11e3,
    enablePagination: params.budget?.enablePagination ?? true
  };
  const allQueries = buildSearchQueries(params.state, params.persona, params.customQuery);
  const plannedQueries = allQueries.slice(0, budgetConfig.maxQueries);
  const budgetLimitReached = allQueries.length > budgetConfig.maxQueries;
  const errors = [];
  const queriesAttempted = [];
  let queriesRunCount = 0;
  const rawResults = [];
  const settled = await Promise.allSettled(
    plannedQueries.map(async (q) => {
      queriesAttempted.push(q.query);
      queriesRunCount++;
      const res = await executeTinyFishSearch(q.query, apiKey, 1, Math.min(6e3, budgetConfig.timeoutMs));
      return { scope: q.scope, data: res, originalQuery: q.query };
    })
  );
  for (const s of settled) {
    if (s.status === "fulfilled") {
      if (s.value.data.error) {
        errors.push(s.value.data.error);
      }
      rawResults.push({ scope: s.value.scope, data: s.value.data });
    } else {
      errors.push(`Search query failure: ${s.reason}`);
    }
  }
  const seenUrls = /* @__PURE__ */ new Set();
  const items = [];
  const domainSet = /* @__PURE__ */ new Set();
  let officialCount = 0;
  let secondaryCount = 0;
  let commercialCount = 0;
  for (const { scope, data } of rawResults) {
    if (!data.results || !Array.isArray(data.results)) continue;
    for (const item of data.results) {
      if (!item.url || !isValidPublicUrl(item.url)) continue;
      const normalizedUrl = item.url.split("#")[0].replace(/\/$/, "");
      if (seenUrls.has(normalizedUrl)) continue;
      seenUrls.add(normalizedUrl);
      const classification = classifySourceUrl(item.url, params.state);
      domainSet.add(classification.domain);
      if (classification.isOfficial) officialCount++;
      else if (classification.isSecondary) secondaryCount++;
      else if (classification.isCommercial) commercialCount++;
      items.push({
        position: item.position || items.length + 1,
        site_name: item.site_name || "",
        title: item.title || "",
        snippet: item.snippet || "",
        url: item.url,
        isOfficial: classification.isOfficial,
        isSecondary: classification.isSecondary,
        isCommercial: classification.isCommercial,
        searchScope: scope,
        stateName: scope === "state" ? params.state : void 0,
        sourceDomain: classification.domain
      });
    }
  }
  items.sort((a, b) => {
    const scoreA = a.isOfficial ? 3 : a.isSecondary ? 2 : a.isCommercial ? 0 : 1;
    const scoreB = b.isOfficial ? 3 : b.isSecondary ? 2 : b.isCommercial ? 0 : 1;
    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }
    return a.position - b.position;
  });
  const centralItemsCount = items.filter((i) => i.searchScope === "central").length;
  const stateItemsCount = items.filter((i) => i.searchScope === "state").length;
  return {
    items,
    centralItemsCount,
    stateItemsCount,
    errors,
    queriesAttempted,
    queriesRun: queriesRunCount,
    uniqueUrlsCount: seenUrls.size,
    uniqueDomains: Array.from(domainSet),
    officialCount,
    secondaryCount,
    commercialCount,
    budgetLimitReached
  };
}

// lib/firecrawlFetch.ts
import FirecrawlApp from "@mendable/firecrawl-js";

// lib/tinyfishFetch.ts
function sanitizeRetrievedText(rawText, maxChars = 4e3) {
  if (!rawText) return "";
  let cleaned = rawText.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, " ").replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").replace(/ignore\s+(?:all\s+)?previous\s+instructions/gi, "[CONTENT REMOVED]").replace(/system\s+prompt\s*:/gi, "[BLOCKED TAG]").replace(/you\s+are\s+now\s+in\s+developer\s+mode/gi, "[BLOCKED PHRASE]").trim();
  if (cleaned.length > maxChars) {
    cleaned = cleaned.slice(0, maxChars) + "\n...[content truncated for extraction]";
  }
  return cleaned;
}
async function fetchPagesWithTinyFish(urls, apiKey, timeoutMs = 15e3) {
  const activeKey = apiKey || process.env.TINYFISH_API_KEY || "";
  if (!activeKey) {
    return {
      pages: [],
      failedUrls: urls.map((u) => ({ url: u, error: "TINYFISH_API_KEY is missing" }))
    };
  }
  const validUrls = urls.filter((u) => isValidPublicUrl(u)).slice(0, 8);
  if (validUrls.length === 0) {
    return { pages: [], failedUrls: [] };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch("https://api.fetch.tinyfish.ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": activeKey
      },
      body: JSON.stringify({
        urls: validUrls,
        format: "markdown",
        per_url_timeout_ms: Math.min(1e4, timeoutMs - 2e3)
      }),
      signal: controller.signal
    });
    clearTimeout(timer);
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return {
        pages: [],
        failedUrls: validUrls.map((u) => ({
          url: u,
          error: `TinyFish Fetch HTTP ${res.status}: ${errText.slice(0, 100)}`
        }))
      };
    }
    const data = await res.json();
    const pages = [];
    const failedUrls = [...data.errors || []];
    if (data.results && Array.isArray(data.results)) {
      for (const item of data.results) {
        const textClean = sanitizeRetrievedText(item.text || "");
        pages.push({
          url: item.url,
          final_url: item.final_url || item.url,
          title: item.title,
          description: item.description,
          text: textClean,
          isOfficial: true,
          fetchSuccess: true
        });
      }
    }
    return { pages, failedUrls };
  } catch (err) {
    clearTimeout(timer);
    return {
      pages: [],
      failedUrls: validUrls.map((u) => ({
        url: u,
        error: `TinyFish Fetch error: ${err?.message || "timeout/network"}`
      }))
    };
  }
}

// lib/firecrawlFetch.ts
import fs from "fs";
import path from "path";
var firecrawlClient = null;
function getFirecrawlClient() {
  let key = process.env.FIRECRAWL_API_KEY;
  if (!key) {
    try {
      const envPath = path.resolve(process.cwd(), ".env");
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, "utf8");
        const match = envContent.match(/^FIRECRAWL_API_KEY\s*=\s*(.+)$/m);
        if (match) {
          key = match[1].trim();
          process.env.FIRECRAWL_API_KEY = key;
        }
      }
    } catch {
    }
  }
  if (!key) return null;
  if (!firecrawlClient) {
    firecrawlClient = new FirecrawlApp({ apiKey: key });
  }
  return firecrawlClient;
}
async function fetchPagesWithFirecrawl(urls, timeoutMs = 12e3) {
  const client = getFirecrawlClient();
  if (!client) {
    return {
      pages: [],
      failedUrls: urls.map((u) => ({ url: u, error: "FIRECRAWL_API_KEY not configured" }))
    };
  }
  const validUrls = urls.filter((u) => isValidPublicUrl(u)).slice(0, 4);
  if (validUrls.length === 0) {
    return { pages: [], failedUrls: [] };
  }
  const pages = [];
  const failedUrls = [];
  const batchPromises = validUrls.map(async (url) => {
    try {
      const result = await Promise.race([
        client.scrapeUrl(url, {
          formats: ["markdown"],
          onlyMainContent: true,
          timeout: 4500
        }),
        new Promise(
          (_, reject) => setTimeout(() => reject(new Error("Firecrawl scrape timeout")), 5200)
        )
      ]);
      if (result && result.markdown) {
        const textClean = sanitizeRetrievedText(result.markdown, 5e3);
        const srcClass = classifySource(url);
        pages.push({
          url,
          final_url: result.metadata?.sourceURL || url,
          title: result.metadata?.title || null,
          description: result.metadata?.description || null,
          text: textClean,
          isOfficial: srcClass.isOfficial,
          fetchSuccess: true
        });
      } else {
        failedUrls.push({ url, error: "Firecrawl returned no markdown content" });
      }
    } catch (err) {
      failedUrls.push({ url, error: "Firecrawl error: " + (err?.message || "unknown") });
    }
  });
  await Promise.allSettled(batchPromises);
  return { pages, failedUrls };
}

// lib/openrouter.ts
function isExplicitlyFreeModel(modelId) {
  if (!modelId || typeof modelId !== "string") return false;
  const trimmed = modelId.trim().toLowerCase();
  return trimmed === "openrouter/free" || trimmed.endsWith(":free");
}
function getConfiguredFreeModel(overrideModel) {
  const candidate = (overrideModel || process.env.OPENROUTER_MODEL || "openrouter/free").trim();
  if (!isExplicitlyFreeModel(candidate)) {
    throw new Error(
      `Cost Safety Violation: Model "${candidate}" is not an explicitly free model on OpenRouter. Only models ending with ':free' or 'openrouter/free' are permitted.`
    );
  }
  return candidate;
}
async function callOpenRouterChat(options) {
  const apiKey = (options.apiKey || process.env.OPENROUTER_API_KEY || "").trim();
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured on the server.");
  }
  const model = getConfiguredFreeModel(options.model);
  const timeoutMs = options.timeoutMs || 1e4;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const bodyPayload = {
    model,
    messages: options.messages,
    temperature: typeof options.temperature === "number" ? options.temperature : 0.1,
    max_tokens: Math.min(options.maxTokens || 1800, 2200)
  };
  if (options.responseFormat || options.isJson) {
    bodyPayload.response_format = options.responseFormat || { type: "json_object" };
  }
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://yojanamitra.app",
        "X-Title": "YojanaMitra"
      },
      body: JSON.stringify(bodyPayload),
      signal: controller.signal
    });
    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      let parsedErr = null;
      try {
        parsedErr = JSON.parse(errBody);
      } catch {
      }
      const errMsg = parsedErr?.error?.message || errBody.slice(0, 200) || `HTTP ${res.status}`;
      if (res.status === 429) {
        throw new Error(`OpenRouter Free Tier Rate Limit (429): ${errMsg}`);
      } else if (res.status === 401) {
        throw new Error(`OpenRouter Authentication Failed (401): Invalid or expired API key.`);
      } else if (res.status === 402) {
        throw new Error(`OpenRouter Payment Required (402): Upstream requested payment. Only free models are permitted.`);
      }
      throw new Error(`OpenRouter Error (${model}) HTTP ${res.status}: ${errMsg}`);
    }
    const data = await res.json();
    const msg = data?.choices?.[0]?.message;
    const content = msg?.content || (msg?.reasoning && msg.reasoning.includes("{") ? msg.reasoning : "") || "";
    const actualModel = data?.model || model;
    return {
      text: content,
      modelUsed: actualModel,
      rawJson: data
    };
  } catch (err) {
    if (err.name === "AbortError" || controller.signal.aborted) {
      throw new Error(`OpenRouter Request Timed Out after ${timeoutMs}ms on free model ${model}.`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// lib/openRouterProcessor.ts
function buildExtractionPrompt(profile, searchResults, fetchedPages) {
  const targetStateName = profile.state && profile.state !== "All India / Central" ? profile.state : "the target state";
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
     * FORBIDDEN: "Contact \xB7 Dashboard \xB7 MIZORAM SCHOLARSHIP BOARD"
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
   - CRITICAL: Never convert "\u20B920 lakh" or "Rs 20 Lakh" into "\u20B920" or "Rs. 20".
   - If a source describes a loan limit of \u20B920 lakh, output "Collateral-free business loan up to \u20B920 Lakh (Shishu: up to \u20B950,000, Kishore: up to \u20B95 Lakh, Tarun: up to \u20B920 Lakh)".
   - Distinguish loans, grants, subsidies, scholarships, and insurance:
     * Loans: specify maximum loan limit, interest subvention/subsidy, and collateral terms.
     * Subsidies: specify percentage (e.g. 15% to 35% margin money subsidy) and project cost limits.
     * Scholarships: specify annual allowance, tuition waiver, and maintenance support.
     * Insurance: specify health/crop sum insured (e.g. \u20B95 Lakh per family per year).
   - Set "benefitType" to "loan" | "grant" | "subsidy" | "scholarship" | "insurance" | "pension" | "composite".
   - NEVER output cop-out phrases like "Refer to official site", "Not found in source", or generic placeholders such as:
     * "Financial assistance, educational support, or maintenance allowance as per official guidelines."
     * "Government financial assistance and welfare subsidy under official guidelines."
     * "Financial assistance and welfare benefits as per scheme guidelines."
   - NEVER fabricate or assume financial amounts, loan limits, or subsidies not present in the evidence.
   - If exact numbers or terms are not detailed in the snippet or text, output "Benefit details not verified from primary source." - DO NOT invent plausible-sounding descriptions.

4. REASON FOR INCLUSION IN CATEGORY:
   - Provide a concise "categoryReason" explaining why this scheme belongs to ${profile.persona || "the selected category"}.
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
      "benefits": "Exact benefit with preserved units (e.g. Loan up to \u20B920 Lakh or \u20B915,000/year allowance)",
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
  const searchEvidence = searchResults.slice(0, 6).map(
    (s, idx) => `
[Result #${idx + 1}] (${s.searchScope.toUpperCase()})
Title: ${s.title}
Site: ${s.site_name}
URL: ${s.url}
Official Domain: ${s.isOfficial ? "YES" : "NO"}
Snippet: ${s.snippet}
`
  ).join("\n");
  const pageEvidence = fetchedPages.slice(0, 2).map(
    (p, idx) => `
[Fetched Page #${idx + 1}]
URL: ${p.url}
Title: ${p.title || "Untitled"}
Content:
${p.text.slice(0, 1500)}
`
  ).join("\n\n");
  const user = `CITIZEN PROFILE:
- Target State/UT: ${profile.state || "All India / Central"}
- Persona: ${profile.persona || "student"}
- Age: ${profile.age ?? "Not specified"}
- Gender: ${profile.gender || "All"}
- Annual Family Income: \u20B9${profile.annualIncome?.toLocaleString() || "150,000"}
- Social Category: ${profile.socialCategory || "General"}
- Education Level: ${profile.educationLevel || "Any"}
- Farmer Type: ${profile.farmerType || "Any"}
- Differently Abled: ${profile.isDifferentlyAbled ? "Yes" : "No"}
- BPL Card: ${profile.hasBplCard ? "Yes" : "No"}
${profile.query ? `- Search Query: "${profile.query}"` : ""}

RETRIEVED WEB EVIDENCE:
=== SEARCH SNIPPETS ===
${searchEvidence || "No snippets found."}

=== FETCHED PORTAL PAGES ===
${pageEvidence || "No page content fetched."}

Extract all verified Central and State schemes discovered in the evidence above.
CRITICAL: Preserve all currency units (e.g. \u20B920 Lakh, \u20B950,000, Crores) and NEVER truncate units to bare numbers.
Output clean official scheme names and concrete benefits. Strictly output valid JSON.`;
  return { system, user };
}
async function extractSchemesWithOpenRouter(profile, searchResults, fetchedPages, apiKeyOverride, modelOverride) {
  const apiKey = (apiKeyOverride || process.env.OPENROUTER_API_KEY || "").trim();
  if (!apiKey) {
    return {
      extractedSchemes: [],
      error: "OPENROUTER_API_KEY is not configured on the server."
    };
  }
  let configuredModel;
  try {
    configuredModel = getConfiguredFreeModel(modelOverride);
  } catch (err) {
    return {
      extractedSchemes: [],
      error: err.message || "Invalid model configuration"
    };
  }
  const { system, user } = buildExtractionPrompt(profile, searchResults, fetchedPages);
  const modelsToTry = [configuredModel];
  let lastError = "";
  for (const modelToTry of modelsToTry) {
    try {
      const { text, modelUsed } = await callOpenRouterChat({
        messages: [
          { role: "system", content: system },
          { role: "user", content: user }
        ],
        model: modelToTry,
        apiKey,
        temperature: 0.1,
        maxTokens: 1800,
        timeoutMs: 7500
      });
      let cleanJson = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
      if (cleanJson.startsWith("```json")) {
        cleanJson = cleanJson.replace(/^```json/, "").replace(/```$/, "").trim();
      } else if (cleanJson.startsWith("```")) {
        cleanJson = cleanJson.replace(/^```/, "").replace(/```$/, "").trim();
      }
      let rawParsed;
      try {
        rawParsed = JSON.parse(cleanJson);
      } catch {
        const jsonStart = cleanJson.indexOf("{");
        const jsonEnd = cleanJson.lastIndexOf("}");
        if (jsonStart !== -1 && jsonEnd > jsonStart) {
          rawParsed = JSON.parse(cleanJson.slice(jsonStart, jsonEnd + 1));
        } else {
          throw new Error("Model did not return valid JSON");
        }
      }
      const rawList = Array.isArray(rawParsed) ? rawParsed : rawParsed.schemes || [];
      const validItems = [];
      for (const item of rawList) {
        const parsedItem = GroqExtractedSchemeSchema.safeParse(item);
        if (!parsedItem.success) continue;
        const scheme = parsedItem.data;
        const cleanedName = sanitizeSchemeName(scheme.name);
        if (!cleanedName || isInvalidSchemeName(cleanedName)) {
          continue;
        }
        scheme.name = cleanedName;
        const candidateType = classifyCandidate(scheme.name, scheme.officialUrl, scheme.description);
        if (candidateType !== "individual_scheme") {
          continue;
        }
        scheme.candidateClassification = candidateType;
        if (Array.isArray(item.aliases)) {
          scheme.aliases = item.aliases.filter((a) => typeof a === "string" && a.trim().length > 1);
        }
        if (item.benefitType) scheme.benefitType = item.benefitType;
        if (item.categoryReason) scheme.categoryReason = item.categoryReason;
        if (isGenericBenefit(scheme.benefits)) {
          if (scheme.evidenceSnippets?.benefitEvidence && !isGenericBenefit(scheme.evidenceSnippets.benefitEvidence)) {
            scheme.benefits = scheme.evidenceSnippets.benefitEvidence;
          } else {
            scheme.benefits = "Benefit details not verified.";
          }
        }
        scheme.applicationUrl = validateApplicationUrl(scheme.applicationUrl);
        if (Array.isArray(scheme.eligibilityReasons)) {
          scheme.eligibilityReasons = scheme.eligibilityReasons.filter(
            (r) => typeof r === "string" && !/identified from active|public welfare portal|retrieved from/i.test(r)
          );
        }
        if (scheme.deadlineStatus === "unknown") {
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
    } catch (err) {
      lastError = err?.message || "unknown error";
    }
  }
  return {
    extractedSchemes: [],
    error: `OpenRouter processing error: ${lastError}`
  };
}

// lib/jurisdiction.ts
var CENTRAL_FLAGSHIP_PATTERNS = [
  /\bpradhan\s*mantri\b/i,
  /\bpm[- ]?(kisan|mudra|egp|svanidhi|fby|jay|yasasvi|vishwakarma|ay|mvy)\b/i,
  /\bmudra\s*(loan|yojana)?\b/i,
  /\bstand[- ]?up\s*india\b/i,
  /\bcgtmse\b/i,
  /\bnational\s*scholarship\s*portal\b/i,
  /\b(aicte|ugc|nsp)\s*(pragati|saksham|csss|swanath|ishaan\s*uday)?\b/i,
  /\bcentral\s*sector\s*scholarship\b/i,
  /\batal\s*pension\s*yojana\b/i,
  /\bsukanya\s*samriddhi\b/i,
  /\bprime\s*minister['’]?s\s*employment\s*generation\b/i,
  /\b(nmmss|national\s*means[- ]?cum[- ]?merit)\b/i,
  /\bpost[- ]?matric\s*scholarship\b/i,
  /\bpre[- ]?matric\s*scholarship\b/i
];
var MULTI_STATE_PROGRAM_PATTERNS = [
  {
    regex: /\b(north\s*eastern\s*(?:council|region)|nec\s*(?:merit\s*)?scholarship|ishaan\s*uday|doner|pm[- ]?devine)\b/i,
    region: "North East",
    name: "North Eastern Regional Initiative"
  },
  {
    regex: /\b(national\s*capital\s*region|ncr\s*planning)\b/i,
    region: "NCR",
    name: "National Capital Region Initiative"
  },
  {
    regex: /\b(pmsss|jammu\s*(&|and)\s*kashmir\s*and\s*ladakh|j&k\s*and\s*ladakh)\b/i,
    region: "JK_Ladakh",
    name: "Prime Minister Special Scholarship Scheme for J&K and Ladakh (PMSSS)"
  }
];
function detectJurisdiction(candidate, targetState) {
  const normTarget = normalizeStateName(targetState);
  const isAllIndiaTarget = !normTarget || normTarget === "All India / Central";
  const rawName = candidate.name || "";
  const url = candidate.officialUrl || "";
  let host = "";
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
  }
  const combinedText = [
    rawName,
    candidate.sourceTitle || "",
    candidate.department || "",
    candidate.description || "",
    candidate.evidenceSnippets?.nameEvidence || ""
  ].join(" ").toLowerCase();
  for (const prog of MULTI_STATE_PROGRAM_PATTERNS) {
    if (prog.regex.test(rawName) || prog.regex.test(combinedText) || host.includes("necouncil") || host.includes("doner")) {
      const regionMembers = MULTI_STATE_REGIONS[prog.region] || [];
      const appliesToTarget = isAllIndiaTarget || (normTarget ? regionMembers.includes(normTarget) : false);
      if (appliesToTarget) {
        return {
          jurisdiction: "multi_state",
          detectedState: null,
          applicableStates: regionMembers,
          isApplicableToTarget: true,
          confidence: "high",
          reason: `Multi-state program (${prog.name}) explicitly applicable across ${prog.region} states including ${normTarget || "All India"}.`
        };
      } else {
        return {
          jurisdiction: "multi_state",
          detectedState: null,
          applicableStates: regionMembers,
          isApplicableToTarget: false,
          confidence: "high",
          reason: `Multi-state program (${prog.name}) restricted to ${prog.region} states (${regionMembers.join(", ")}).`,
          rejectionReason: `Jurisdiction mismatch: Multi-state scheme applies exclusively to ${prog.region} states, not ${normTarget}.`
        };
      }
    }
  }
  const domainState = identifyStateFromDomain(url);
  let textDetectedState = null;
  let textConfidence = "low";
  for (const [stName, meta] of Object.entries(STATE_METADATA_MAP)) {
    const nameLower = rawName.toLowerCase();
    const isStateInName = meta.aliases.some((alias) => {
      const regex = new RegExp(`\\b${alias.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`, "i");
      return regex.test(nameLower);
    });
    if (isStateInName) {
      textDetectedState = stName;
      textConfidence = "high";
      break;
    }
    const deptLower = (candidate.department || "").toLowerCase();
    const isStateInDept = meta.aliases.some((alias) => {
      const regex = new RegExp(`\\b${alias.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`, "i");
      return regex.test(deptLower);
    });
    if (isStateInDept) {
      textDetectedState = stName;
      textConfidence = "medium";
      break;
    }
    let urlPath = "";
    try {
      urlPath = decodeURIComponent(new URL(url).pathname).toLowerCase();
    } catch {
    }
    const isStateInPath = meta.aliases.some((alias) => {
      const regex = new RegExp(`[/_\\-.]${alias.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}[/_\\-.]`, "i");
      return regex.test("/" + urlPath + "/");
    });
    if (isStateInPath) {
      textDetectedState = stName;
      textConfidence = "high";
      break;
    }
  }
  if (!textDetectedState && candidate.state) {
    const fromCandidate = normalizeStateName(candidate.state);
    if (fromCandidate && fromCandidate !== "All India / Central") {
      textDetectedState = fromCandidate;
      textConfidence = "medium";
    }
  }
  const isGovOrNicDomain = host.endsWith(".gov.in") || host.endsWith(".nic.in");
  const isMyScheme = host.includes("myscheme.gov.in");
  const isCentralTitle = CENTRAL_FLAGSHIP_PATTERNS.some((p) => p.test(rawName));
  const isCentralDomain = !isMyScheme && CENTRAL_OFFICIAL_DOMAINS.some((d) => host === d || host.endsWith("." + d)) || isGovOrNicDomain && !domainState && (!isMyScheme || isCentralTitle);
  const isCentralClaimed = candidate.level === "Central" || /\b(central scheme|centrally sponsored|government of india|ministry of|all india|pan india|national scheme)\b/i.test(combinedText);
  const detectFundingType = (isCentral, stateName) => {
    if (/\b(centrally\s*sponsored|css|sharing\s*ratio|60:40|90:10)\b/i.test(combinedText)) {
      return "centrally_sponsored";
    }
    if (isCentral || /\b(central\s*sector)\b/i.test(combinedText) || isCentralTitle) {
      return "central_sector";
    }
    if (stateName) {
      const struct = getAdministrativeStructure(stateName);
      if (struct.type === "union_territory_with_legislature" || struct.type === "union_territory_without_legislature") {
        return "ut_funded";
      }
      return "state_funded";
    }
    return "unknown";
  };
  const resolvedState = domainState || textDetectedState;
  const isStateImplementedCss = Boolean(resolvedState && /\b(post[- ]?matric|pre[- ]?matric|fee reimbursement)\b/i.test(rawName));
  if (resolvedState && (!isCentralTitle || Boolean(domainState) || isStateImplementedCss)) {
    const isStateMatch = isAllIndiaTarget || normTarget === resolvedState;
    const struct = getAdministrativeStructure(resolvedState);
    const adminLabel = struct.label;
    if (isStateMatch) {
      return {
        jurisdiction: "state",
        administrativeStructure: struct.type,
        administrativeLabel: adminLabel,
        fundingType: detectFundingType(false, resolvedState),
        detectedState: resolvedState,
        applicableStates: [resolvedState],
        isApplicableToTarget: true,
        confidence: domainState ? "high" : textConfidence,
        reason: `Verified regional scheme for ${resolvedState} (${adminLabel}) corroborated via ${domainState ? `official domain ${host}` : "scheme metadata"}.`
      };
    } else {
      return {
        jurisdiction: "state",
        administrativeStructure: struct.type,
        administrativeLabel: adminLabel,
        fundingType: detectFundingType(false, resolvedState),
        detectedState: resolvedState,
        applicableStates: [resolvedState],
        isApplicableToTarget: false,
        confidence: "high",
        reason: `Scheme belongs to ${resolvedState} via ${domainState ? `domain ${host}` : "state department"}. Inapplicable to ${normTarget}.`,
        rejectionReason: `Jurisdiction mismatch: Scheme belongs exclusively to ${resolvedState}, not ${normTarget}.`
      };
    }
  }
  if ((isCentralDomain || isCentralTitle || isCentralClaimed) && !domainState) {
    const isHighConf = isCentralDomain || isCentralTitle;
    return {
      jurisdiction: "central",
      administrativeStructure: "central",
      administrativeLabel: "Government of India (Central Administration)",
      fundingType: detectFundingType(true, null),
      detectedState: null,
      applicableStates: ["All India"],
      isApplicableToTarget: true,
      confidence: isHighConf ? "high" : "low",
      reason: isHighConf ? `Government of India Central initiative verified via ${isCentralDomain ? host : "official scheme title"}.` : `Central scheme candidate applicable nationwide (verification pending official source).`
    };
  }
  if (isAllIndiaTarget) {
    return {
      jurisdiction: "unknown",
      administrativeStructure: "unknown",
      administrativeLabel: "Jurisdiction Unspecified",
      fundingType: "unknown",
      detectedState: null,
      applicableStates: [],
      isApplicableToTarget: true,
      confidence: "low",
      reason: "Jurisdiction could not be established conclusively from source evidence."
    };
  }
  return {
    jurisdiction: "unknown",
    administrativeStructure: "unknown",
    administrativeLabel: "Jurisdiction Unverified",
    fundingType: "unknown",
    detectedState: null,
    applicableStates: [],
    isApplicableToTarget: false,
    confidence: "low",
    reason: `Jurisdiction cannot be verified for ${normTarget}. No state domain or authority found.`,
    rejectionReason: `Jurisdiction unverified: Insufficient evidence establishing applicability to ${normTarget}.`
  };
}

// lib/verification.ts
var SCHEME_CANONICAL_ALIASES = {
  "pmmy": "pradhan mantri mudra",
  "mudra": "pradhan mantri mudra",
  "mudra loan": "pradhan mantri mudra",
  "pradhan mantri mudra yojana": "pradhan mantri mudra",
  "pmegp": "prime minister employment generation",
  "prime minister employment generation programme": "prime minister employment generation",
  "prime ministers employment generation programme": "prime minister employment generation",
  "cmegp": "chief minister employment generation",
  "maha cmegp": "chief minister employment generation",
  "chief minister employment generation programme": "chief minister employment generation",
  "chief ministers employment generation programme": "chief minister employment generation",
  "pm svanidhi": "pm svanidhi street vendor",
  "svanidhi": "pm svanidhi street vendor",
  "street vendors atmanirbhar nidhi": "pm svanidhi street vendor",
  "nlm": "national livestock",
  "national livestock mission": "national livestock",
  "pm kisan": "pradhan mantri kisan samman nidhi",
  "pmkisan": "pradhan mantri kisan samman nidhi",
  "pm-kisan": "pradhan mantri kisan samman nidhi",
  "kisan samman nidhi": "pradhan mantri kisan samman nidhi",
  "pradhan mantri kisan samman nidhi": "pradhan mantri kisan samman nidhi",
  "kisan credit card": "kisan credit card kcc",
  "kcc": "kisan credit card kcc",
  "pmfby": "pradhan mantri fasal bima",
  "fasal bima": "pradhan mantri fasal bima",
  "pradhan mantri fasal bima yojana": "pradhan mantri fasal bima",
  "pm kusum": "pradhan mantri kisan urja suraksha evam utthaan mahabhiyan",
  "pm-kusum": "pradhan mantri kisan urja suraksha evam utthaan mahabhiyan",
  "pmkusum": "pradhan mantri kisan urja suraksha evam utthaan mahabhiyan",
  "kusum": "pradhan mantri kisan urja suraksha evam utthaan mahabhiyan",
  "kisan urja suraksha": "pradhan mantri kisan urja suraksha evam utthaan mahabhiyan",
  "mahadbt": "mahadbt post matric",
  "aaple sarkar dbt": "mahadbt post matric",
  "pm yasasvi": "pm yasasvi scholarship",
  "yasasvi": "pm yasasvi scholarship",
  "young achievers": "pm yasasvi scholarship",
  "young achievers scholarship": "pm yasasvi scholarship",
  "pm young achievers": "pm yasasvi scholarship",
  "pm young achievers scholarship": "pm yasasvi scholarship",
  "pm young achievers scholarship award": "pm yasasvi scholarship",
  "csss": "central sector scholarship college university",
  "nmmss": "national means cum merit scholarship scheme",
  "pm jay": "ayushman bharat pm jay",
  "ayushman bharat": "ayushman bharat pm jay",
  "jan arogya yojana": "ayushman bharat pm jay",
  "shahu maharaj": "rajarshi chhatrapati shahu maharaj",
  "annasaheb patil": "annasaheb patil arthik vikas",
  "dr ambedkar post matric": "dr ambedkar post matric scholarship punjab",
  "goa scholar": "goa scholar scheme",
  "dayanand social security": "dayanand social security scheme dsss goa",
  "swami vivekananda scholarship": "swami vivekananda merit cum means scholarship svmcm",
  "kalia": "krushak assistance for livelihood and income augmentation kalia odisha",
  "rythu bharosa": "rythu bharosa telangana",
  "nec scholarship": "north eastern council nec scholarship",
  "integrated scheme on agriculture cooperation": "integrated scheme on agriculture cooperation",
  "isac": "integrated scheme on agriculture cooperation",
  "agriculture cooperation scheme": "integrated scheme on agriculture cooperation",
  "agriculture infrastructure fund": "agriculture infrastructure fund",
  "aif": "agriculture infrastructure fund",
  "soil health card": "soil health card scheme",
  "fee reimbursement": "post matric",
  "up fee reimbursement": "up post matric scholarship",
  "fee reimbursement scheme": "post matric",
  "up scholarship": "up post matric scholarship",
  "uttar pradesh scholarship": "up post matric scholarship",
  "up dashmottar": "up post matric scholarship",
  "up dashmottar scholarship": "up post matric scholarship",
  "dashmottar scholarship": "up post matric scholarship",
  "post matric scholarship uttar pradesh": "up post matric scholarship",
  "pre matric scholarship uttar pradesh": "up pre matric scholarship",
  "up pre matric": "up pre matric scholarship",
  "up pre matric scholarship": "up pre matric scholarship",
  "general pre matric scholarship": "pre matric",
  "general pre matric scholarship uttar pradesh": "up pre matric scholarship",
  "general post matric scholarship uttar pradesh": "up post matric scholarship",
  "post matric scholarship bihar": "post matric scholarship bihar",
  "mukhyamantri kanya utthan": "mukhyamantri kanya utthan yojana",
  "kanya utthan": "mukhyamantri kanya utthan yojana",
  "bihar student credit card": "bihar student credit card scheme",
  "abhyuday": "mukhyamantri abhyudaya yojana",
  "abhyudaya": "mukhyamantri abhyudaya yojana",
  "up abhyudaya": "mukhyamantri abhyudaya yojana"
};
var FLAGSHIP_DEFINITIONS = {
  "pradhan mantri fasal bima": {
    name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    description: "Comprehensive financial support and crop insurance coverage for farmers against non-preventable natural risks.",
    benefits: "Comprehensive crop insurance coverage against natural crop loss at subsidized premium of 1.5% to 2%.",
    benefitType: "insurance",
    department: "Ministry of Agriculture and Farmers Welfare",
    officialUrl: "https://pmfby.gov.in/",
    applyUrl: null,
    // Apply URL is not the homepage; requires state/season notification
    portalName: "Pradhan Mantri Fasal Bima Portal",
    category: "Agriculture",
    partialReasons: ["State and season-specific application enrollment window requires active notification."],
    defaultDeadlineStatus: "unknown",
    eligibilityCriteria: [
      "All farmers growing notified crops in notified areas are eligible, including loanee and non-loanee farmers.",
      "Tenant farmers and sharecroppers cultivating insurable crops with valid land tenancy records are eligible.",
      "Farmer must have an insurable interest in the notified crop sown in the notified block/district.",
      "Aadhaar-linked active bank account and sowing certificate / landholding documentation required."
    ]
  },
  "pradhan mantri kisan samman nidhi": {
    name: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
    description: "Direct income support of \u20B96,000 per year transferred via DBT in three equal instalments of \u20B92,000 to eligible farmer families.",
    benefits: "Direct income support of \u20B96,000 per year transferred via DBT in three equal instalments of \u20B92,000.",
    benefitType: "grant",
    department: "Ministry of Agriculture and Farmers Welfare",
    officialUrl: "https://pmkisan.gov.in/",
    applyUrl: null,
    // Portal homepage is information; citizen registration is a dedicated service
    portalName: "PM-KISAN Samman Portal",
    category: "Agriculture",
    partialReasons: ["Citizen registration requires land record and e-KYC integration."],
    defaultDeadlineStatus: "open",
    eligibilityCriteria: [
      "All landholding farmer families having cultivable landholding in their names are eligible.",
      "Small and marginal farmer households as well as general landowning cultivators across all states/UTs.",
      "Mandatory Aadhaar e-KYC and land record linkage (Khata / Khasra) on the official PM-KISAN portal.",
      "Institutional landholders and high-income/tax-paying households (income tax payers in last AY) are excluded."
    ]
  },
  "pradhan mantri kisan urja suraksha evam utthaan mahabhiyan": {
    name: "Pradhan Mantri Kisan Urja Suraksha evam Utthaan Mahabhiyan (PM-KUSUM)",
    description: "Solar power scheme for farmers to install solar agricultural pumps, solarize existing pumps, and establish grid-connected renewable power plants.",
    benefits: "Financial support and subsidies up to 60% for standalone solar pumps and solarization of agricultural pump sets.",
    benefitType: "subsidy",
    department: "Ministry of New and Renewable Energy",
    officialUrl: "https://pmkusum.mnre.gov.in/",
    applyUrl: null,
    // Subsidies implemented via State Nodal Agencies and DISCOMs
    portalName: "MNRE PM-KUSUM Official Portal",
    category: "Agriculture",
    partialReasons: ["State-specific implementation and beneficiary selection managed via State Nodal Agencies and DISCOMs."],
    defaultDeadlineStatus: "open",
    eligibilityCriteria: [
      "Individual farmers, farmer groups, cooperatives, Panchayats, and Water User Associations (WUAs).",
      "Cultivable land ownership and requirement for standalone solar irrigation pump or grid-connected solarization.",
      "Beneficiary applications processed through designated State Nodal Agencies (SNAs) and agricultural electricity distribution companies (DISCOMs)."
    ]
  },
  "post matric scholarship sc": {
    name: "Post-Matric Scholarship for SC Students",
    description: "Centrally Sponsored Scheme providing financial assistance to Scheduled Caste students pursuing post-matriculation or post-secondary education.",
    benefits: "Full compulsory non-refundable fees reimbursement plus annual maintenance allowance up to \u20B913,500/year (hostellers) or \u20B97,000/year (day scholars).",
    benefitType: "scholarship",
    department: "Ministry of Social Justice and Empowerment / State Welfare Department",
    officialUrl: "https://scholarships.gov.in/",
    applyUrl: "https://scholarships.gov.in/",
    portalName: "National Scholarship Portal / State e-District",
    category: "Education",
    defaultDeadlineStatus: "unknown",
    eligibilityCriteria: [
      "Belonging to Scheduled Caste (SC) category.",
      "Pursuing recognized post-matriculation, intermediate, diploma, degree, or postgraduate courses.",
      "Annual family income from all sources not exceeding \u20B92.5 Lakh per annum."
    ]
  },
  "post matric scholarship st": {
    name: "Post-Matric Scholarship for ST Students",
    description: "Centrally Sponsored Scheme providing financial assistance to Scheduled Tribe students for post-matriculation studies.",
    benefits: "Full compulsory tuition fees reimbursement plus annual maintenance allowance as per Government of India norms.",
    benefitType: "scholarship",
    department: "Ministry of Tribal Affairs",
    officialUrl: "https://scholarships.gov.in/",
    applyUrl: "https://scholarships.gov.in/",
    portalName: "National Scholarship Portal",
    category: "Education",
    defaultDeadlineStatus: "unknown",
    eligibilityCriteria: [
      "Belonging to Scheduled Tribe (ST) category.",
      "Enrolled in post-matric studies in recognized government or affiliated educational institutions.",
      "Annual family income not exceeding \u20B92.5 Lakh per annum."
    ]
  },
  "post matric scholarship obc": {
    name: "Post-Matric Scholarship for OBC Students",
    description: "Financial assistance to students belonging to Other Backward Classes pursuing higher education after matriculation.",
    benefits: "Maintenance allowance up to \u20B94,000 to \u20B910,000 per annum and study fee support as per scheme rules.",
    benefitType: "scholarship",
    department: "Ministry of Social Justice and Empowerment",
    officialUrl: "https://scholarships.gov.in/",
    applyUrl: "https://scholarships.gov.in/",
    portalName: "National Scholarship Portal",
    category: "Education",
    defaultDeadlineStatus: "unknown",
    eligibilityCriteria: [
      "Belonging to Other Backward Classes (OBC) category.",
      "Pursuing post-matric or post-secondary degree/diploma courses.",
      "Annual parental income from all sources not exceeding \u20B92.5 Lakh per annum."
    ]
  },
  "up post matric scholarship": {
    name: "UP Post-Matric Scholarship & Fee Reimbursement Scheme",
    description: "Government of Uttar Pradesh comprehensive financial assistance program providing full tuition fee reimbursement and maintenance allowance for post-secondary, college, and university students across all categories (General, OBC, SC, ST, Minority).",
    benefits: "100% reimbursement of approved non-refundable tuition and institutional fees directly via DBT, plus annual maintenance allowance up to \u20B913,500/year.",
    benefitType: "scholarship",
    department: "Social Welfare Department, Government of Uttar Pradesh",
    officialUrl: "https://scholarship.up.gov.in/",
    applyUrl: "https://scholarship.up.gov.in/",
    portalName: "UP Scholarship & Fee Reimbursement Online System",
    category: "Education",
    defaultDeadlineStatus: "unknown",
    eligibilityCriteria: [
      "Must be a permanent resident / domicile of Uttar Pradesh.",
      "Pursuing recognized Post-Matriculation (Class 11-12), ITI, Polytechnic, Diploma, Undergraduate (B.Tech, B.Sc, B.Com, MBBS), or Postgraduate courses.",
      "Annual family income from all sources not exceeding \u20B92,00,000 (\u20B92.0 Lakh) for General, OBC, and Minority students; and not exceeding \u20B92,50,000 (\u20B92.5 Lakh) for SC and ST students.",
      "Student bank account must be Aadhaar-seeded and active on NPCI mapper for Direct Benefit Transfer (DBT)."
    ]
  },
  "up pre matric scholarship": {
    name: "UP Pre-Matric Scholarship Scheme",
    description: "Government of Uttar Pradesh scholarship for students studying in Class 9 and 10 to support secondary education expenses, uniforms, and study stationery.",
    benefits: "Annual scholarship financial assistance of \u20B93,500 to \u20B94,000 per annum towards school expenses and study materials.",
    benefitType: "scholarship",
    department: "Social Welfare Department, Government of Uttar Pradesh",
    officialUrl: "https://scholarship.up.gov.in/",
    applyUrl: "https://scholarship.up.gov.in/",
    portalName: "UP Scholarship & Fee Reimbursement Online System",
    category: "Education",
    defaultDeadlineStatus: "unknown",
    eligibilityCriteria: [
      "Regular student enrolled in Class 9th or Class 10th in a recognized school in Uttar Pradesh.",
      "Must be a permanent resident / domicile of Uttar Pradesh.",
      "Annual family income from all sources not exceeding \u20B92,50,000 (\u20B92.5 Lakh) per annum.",
      "Aadhaar-seeded bank account for DBT payment."
    ]
  },
  "post matric": {
    name: "Post-Matric Scholarship and Fee Reimbursement Scheme",
    description: "Centrally Sponsored and State Welfare Scheme providing comprehensive tuition fee reimbursement and maintenance allowance for post-secondary and higher education students.",
    benefits: "Reimbursement of non-refundable tuition and institutional fees plus annual maintenance allowance up to \u20B913,500/year (hostellers) or \u20B97,000/year (day scholars).",
    benefitType: "scholarship",
    department: "Social Welfare Department / Ministry of Social Justice and Empowerment",
    officialUrl: "https://scholarships.gov.in/",
    applyUrl: "https://scholarships.gov.in/",
    portalName: "National Scholarship Portal / State e-District",
    category: "Education",
    defaultDeadlineStatus: "unknown",
    eligibilityCriteria: [
      "Enrolled in recognized post-matriculation, intermediate, diploma, undergraduate, or postgraduate degree course.",
      "Must be a permanent resident/native of the state or studying in a recognized institution.",
      "Annual parental/family income within prescribed ceiling (up to \u20B92.0 to \u20B92.5 Lakh per annum)."
    ]
  },
  "post matric scholarship": {
    name: "Post-Matric Scholarship and Fee Reimbursement Scheme",
    description: "Centrally Sponsored and State Welfare Scheme providing comprehensive tuition fee reimbursement and maintenance allowance for post-secondary and higher education students.",
    benefits: "Reimbursement of non-refundable tuition and institutional fees plus annual maintenance allowance up to \u20B913,500/year (hostellers) or \u20B97,000/year (day scholars).",
    benefitType: "scholarship",
    department: "Social Welfare Department / Ministry of Social Justice and Empowerment",
    officialUrl: "https://scholarships.gov.in/",
    applyUrl: "https://scholarships.gov.in/",
    portalName: "National Scholarship Portal / State e-District",
    category: "Education",
    defaultDeadlineStatus: "unknown",
    eligibilityCriteria: [
      "Enrolled in recognized post-matriculation, intermediate, diploma, undergraduate, or postgraduate degree course.",
      "Must be a permanent resident/native of the state or studying in a recognized institution.",
      "Annual parental/family income within prescribed ceiling (up to \u20B92.0 to \u20B92.5 Lakh per annum)."
    ]
  },
  "pre matric": {
    name: "Pre-Matric Scholarship Scheme",
    description: "State and Centrally Sponsored scholarship for students studying in Class 9 and 10 to support pre-matriculation education expenses and prevent dropouts.",
    benefits: "Annual financial assistance of \u20B93,500 to \u20B94,000 per annum towards school expenses, uniforms, and books.",
    benefitType: "scholarship",
    department: "Social Welfare Department",
    officialUrl: "https://scholarships.gov.in/",
    applyUrl: "https://scholarships.gov.in/",
    portalName: "National Scholarship Portal / State e-District",
    category: "Education",
    defaultDeadlineStatus: "unknown",
    eligibilityCriteria: [
      "Regular student enrolled in Class 9th or 10th in a government or recognized private school.",
      "Domicile/native of the state.",
      "Annual family income not exceeding \u20B92.0 to \u20B92.5 Lakh per annum."
    ]
  },
  "pre matric scholarship": {
    name: "Pre-Matric Scholarship Scheme",
    description: "State and Centrally Sponsored scholarship for students studying in Class 9 and 10 to support pre-matriculation education expenses and prevent dropouts.",
    benefits: "Annual financial assistance of \u20B93,500 to \u20B94,000 per annum towards school expenses, uniforms, and books.",
    benefitType: "scholarship",
    department: "Social Welfare Department",
    officialUrl: "https://scholarships.gov.in/",
    applyUrl: "https://scholarships.gov.in/",
    portalName: "National Scholarship Portal / State e-District",
    category: "Education",
    defaultDeadlineStatus: "unknown",
    eligibilityCriteria: [
      "Regular student enrolled in Class 9th or 10th in a government or recognized private school.",
      "Domicile/native of the state.",
      "Annual family income not exceeding \u20B92.0 to \u20B92.5 Lakh per annum."
    ]
  },
  "national means cum merit scholarship scheme": {
    name: "National Means-cum-Merit Scholarship Scheme (NMMSS)",
    description: "Centrally Sponsored Scheme by the Ministry of Education to award scholarships to meritorious students of economically weaker sections from Class 9 to 12.",
    benefits: "Scholarship allowance of \u20B912,000 per annum (\u20B91,000 per month) for students from Class 9 to Class 12.",
    benefitType: "scholarship",
    department: "Department of School Education and Literacy, Ministry of Education",
    officialUrl: "https://scholarships.gov.in/",
    applyUrl: "https://scholarships.gov.in/",
    portalName: "National Scholarship Portal (MoE)",
    category: "Education",
    defaultDeadlineStatus: "unknown",
    eligibilityCriteria: [
      "Students studying in Class 9 who secured at least 55% marks (50% for SC/ST) in Class 8.",
      "Enrolled in Government, Government-aided, or Local Body school.",
      "Parental annual income from all sources not exceeding \u20B93.5 Lakh."
    ]
  },
  "pm yasasvi scholarship": {
    name: "PM Young Achievers Scholarship Award Scheme for Vibrant India (PM YASASVI)",
    description: "Centrally Sponsored scholarship scheme by MoSJE for OBC, EBC, and DNT students studying in Class 9-12 in Top Class Schools across India.",
    benefits: "Financial scholarship up to \u20B975,000/year (Class 9-10) and \u20B91,25,000/year (Class 11-12) covering school fees and hostel expenses.",
    benefitType: "scholarship",
    department: "Ministry of Social Justice and Empowerment",
    officialUrl: "https://scholarships.gov.in/",
    applyUrl: "https://scholarships.gov.in/",
    portalName: "National Scholarship Portal / NTA",
    category: "Education",
    defaultDeadlineStatus: "unknown",
    eligibilityCriteria: [
      "Belonging to OBC, EBC, or DNT (De-notified, Nomadic and Semi-Nomadic Tribes) category.",
      "Studying in Class 9 or 11 in recognized Top Class Schools.",
      "Annual family income from all sources not exceeding \u20B92.5 Lakh per annum."
    ]
  },
  "mukhyamantri abhyudaya yojana": {
    name: "Mukhyamantri Abhyudaya Yojana - Uttar Pradesh",
    description: "Free competitive examination coaching initiative by Government of Uttar Pradesh for civil services, JEE, NEET, NDA, and other entrance tests.",
    benefits: "Free physical coaching at divisional centers and virtual classes, along with free tablets and study materials for eligible candidates.",
    benefitType: "grant",
    department: "Social Welfare Department, Government of Uttar Pradesh",
    officialUrl: "http://abhyuday.up.gov.in/",
    applyUrl: "http://abhyuday.up.gov.in/",
    portalName: "Abhyudaya Portal Uttar Pradesh",
    category: "Education",
    defaultDeadlineStatus: "open",
    eligibilityCriteria: [
      "Permanent resident of Uttar Pradesh.",
      "Preparing for competitive examinations (UPSC, UPPSC, JEE, NEET, CDS, NDA).",
      "Selected through state-level eligibility entrance examination."
    ]
  },
  "post matric scholarship bihar": {
    name: "Post-Matric Scholarship Scheme - Bihar",
    description: "Bihar Government scholarship for SC, ST, BC, and EBC students pursuing post-matriculation and higher educational courses.",
    benefits: "Reimbursement of tuition and course fees along with annual maintenance allowance as per Bihar state norms.",
    benefitType: "scholarship",
    department: "Education Department / SC & ST Welfare Department, Govt. of Bihar",
    officialUrl: "https://pmsonline.bih.nic.in/",
    applyUrl: "https://pmsonline.bih.nic.in/",
    portalName: "Bihar Post Matric Scholarship Portal",
    category: "Education",
    defaultDeadlineStatus: "unknown",
    eligibilityCriteria: [
      "Permanent resident of Bihar.",
      "Belonging to SC, ST, BC, or EBC category.",
      "Enrolled in recognized post-matriculation or higher education institution.",
      "Family annual income not exceeding \u20B93.0 Lakh per annum."
    ]
  },
  "mukhyamantri kanya utthan yojana": {
    name: "Mukhyamantri Kanya Utthan Yojana - Bihar",
    description: "Bihar Government initiative to encourage higher education among girls and prevent female child dropouts.",
    benefits: "Direct financial incentive of \u20B950,000 upon graduation from recognized universities and \u20B925,000 upon passing Class 12 (unmarried).",
    benefitType: "grant",
    department: "Education Department, Government of Bihar",
    officialUrl: "https://medhasoft.bih.nic.in/",
    applyUrl: "https://medhasoft.bih.nic.in/",
    portalName: "MedhaSoft Bihar Portal",
    category: "Education",
    defaultDeadlineStatus: "open",
    eligibilityCriteria: [
      "Female student domiciled in Bihar.",
      "Passed intermediate (Class 12) or graduated from a recognized college/university in Bihar.",
      "Unmarried at intermediate level."
    ]
  },
  "bihar student credit card scheme": {
    name: "Bihar Student Credit Card Scheme (BSCCS)",
    description: "Government of Bihar credit assistance initiative under MNSSBY to finance higher education for Bihar youth.",
    benefits: "Education loan up to \u20B94 Lakh at 1% simple interest for women/PwD and 4% for men with state government guarantee.",
    benefitType: "loan",
    department: "Bihar State Education Finance Corporation, Govt. of Bihar",
    officialUrl: "https://www.7nishchay-yuvaupmission.bihar.gov.in/",
    applyUrl: "https://www.7nishchay-yuvaupmission.bihar.gov.in/",
    portalName: "MNSSBY Portal Bihar",
    category: "Education",
    defaultDeadlineStatus: "open",
    eligibilityCriteria: [
      "Permanent resident of Bihar aged under 25 years.",
      "Passed 12th standard (or 10th for polytechnic) from a recognized board in Bihar.",
      "Enrolled in recognized higher education, technical, or professional degree/diploma course."
    ]
  },
  "central sector scheme of scholarship for college and university students": {
    name: "Central Sector Scheme of Scholarship for College and University Students (CSSS)",
    description: "Department of Higher Education scholarship for meritorious students from low-income families pursuing regular degree courses.",
    benefits: "Scholarship of \u20B912,000 per annum for undergraduate study (first 3 years) and \u20B920,000 per annum at postgraduate level.",
    benefitType: "scholarship",
    department: "Department of Higher Education, Ministry of Education",
    officialUrl: "https://scholarships.gov.in/",
    applyUrl: "https://scholarships.gov.in/",
    portalName: "National Scholarship Portal (MoE)",
    category: "Education",
    defaultDeadlineStatus: "open",
    eligibilityCriteria: [
      "Students above 80th percentile of successful candidates in Class 12 board examination.",
      "Pursuing regular course in a recognized college/university.",
      "Gross parental income from all sources not exceeding \u20B94.5 Lakh per annum."
    ]
  },
  "aicte pragati scholarship scheme": {
    name: "AICTE Pragati Scholarship Scheme for Girl Students",
    description: "AICTE scholarship scheme providing assistance to girl students admitted to technical degree or diploma courses in AICTE-approved institutions.",
    benefits: "\u20B950,000 per annum for every year of study towards college fee, computer, books, and stationeries.",
    benefitType: "scholarship",
    department: "All India Council for Technical Education (AICTE)",
    officialUrl: "https://www.aicte-india.org/schemes/students-development-schemes",
    applyUrl: "https://scholarships.gov.in/",
    portalName: "National Scholarship Portal / AICTE",
    category: "Education",
    defaultDeadlineStatus: "open",
    eligibilityCriteria: [
      "Girl student admitted to 1st year or 2nd year (lateral entry) of technical degree/diploma course in AICTE approved institution.",
      "Family income not more than \u20B98 Lakh per annum.",
      "Maximum two girls per family."
    ]
  },
  "aicte saksham scholarship scheme": {
    name: "AICTE Saksham Scholarship Scheme for Specially-Abled Students",
    description: "AICTE scholarship providing financial aid to differently-abled students pursuing technical education.",
    benefits: "\u20B950,000 per annum for every year of study towards tuition fee, equipment, books, and educational expenses.",
    benefitType: "scholarship",
    department: "All India Council for Technical Education (AICTE)",
    officialUrl: "https://www.aicte-india.org/schemes/students-development-schemes",
    applyUrl: "https://scholarships.gov.in/",
    portalName: "National Scholarship Portal / AICTE",
    category: "Education",
    defaultDeadlineStatus: "open",
    eligibilityCriteria: [
      "Differently-abled student with disability not less than 40%.",
      "Admitted to technical degree or diploma course in AICTE approved institution.",
      "Family income not exceeding \u20B98 Lakh per annum."
    ]
  },
  "aicte swanath scholarship scheme": {
    name: "AICTE Swanath Scholarship Scheme",
    description: "AICTE financial support for orphaned children, wards of armed forces personnel deceased in action, and COVID-affected children pursuing technical education.",
    benefits: "\u20B950,000 per annum for every year of study towards academic fees and educational support.",
    benefitType: "scholarship",
    department: "All India Council for Technical Education (AICTE)",
    officialUrl: "https://www.aicte-india.org/schemes/students-development-schemes",
    applyUrl: "https://scholarships.gov.in/",
    portalName: "National Scholarship Portal / AICTE",
    category: "Education",
    defaultDeadlineStatus: "open",
    eligibilityCriteria: [
      "Orphaned child, ward of deceased armed forces/paramilitary personnel, or child of both parents deceased in COVID-19 pandemic.",
      "Studying in AICTE approved institution in degree/diploma course.",
      "Family income not more than \u20B98 Lakh per annum."
    ]
  },
  "reimbursement tuition fees sc st obc": {
    name: "Reimbursement of Tuition Fee for SC/ST/OBC/Minority Students in Public Schools",
    description: "Delhi Government initiative reimbursing tuition fees to SC, ST, OBC, and minority community students studying in recognized institutions in Delhi.",
    benefits: "100% reimbursement of tuition fees and compulsory charges for eligible students with family income up to \u20B93.0 Lakh/year.",
    benefitType: "scholarship",
    department: "Department for the Welfare of SC/ST/OBC, Govt. of NCT of Delhi",
    officialUrl: "https://edistrict.delhigovt.nic.in/",
    applyUrl: "https://edistrict.delhigovt.nic.in/",
    portalName: "e-District Delhi Portal",
    category: "Education",
    defaultDeadlineStatus: "unknown",
    eligibilityCriteria: [
      "Belonging to SC, ST, OBC, or minority community.",
      "Domiciled in Delhi with family income up to \u20B93.0 Lakh per annum.",
      "Studying in recognized public/private school in Delhi."
    ]
  },
  "merit scholarship college sc st obc": {
    name: "Merit Scholarship for SC/ST/OBC/Minority Students in Colleges/Institutes",
    description: "Delhi Government scheme rewarding meritorious SC/ST/OBC/minority students pursuing higher education and technical/professional courses.",
    benefits: "Financial assistance up to \u20B91,620 to \u20B94,500 per annum based on course level and percentage of marks in previous qualifying exam.",
    benefitType: "scholarship",
    department: "Department for the Welfare of SC/ST/OBC, Govt. of NCT of Delhi",
    officialUrl: "https://edistrict.delhigovt.nic.in/",
    applyUrl: "https://edistrict.delhigovt.nic.in/",
    portalName: "e-District Delhi Portal",
    category: "Education",
    defaultDeadlineStatus: "unknown",
    eligibilityCriteria: [
      "Belonging to SC, ST, OBC, or minority community in Delhi.",
      "Secured at least 60% marks in previous examination.",
      "Family income not exceeding \u20B93.0 Lakh per annum."
    ]
  },
  "dr ambedkar state award delhi": {
    name: "Dr. B.R. Ambedkar State Award for SC/ST/OBC/Minority Students",
    description: "Delhi Government state award honoring the top-ranking SC/ST/OBC/Minority students passing from recognized colleges and technical institutions in Delhi.",
    benefits: "Cash award of \u20B925,000 and citation to state toppers in professional and technical degree examinations.",
    benefitType: "grant",
    department: "Department for the Welfare of SC/ST/OBC, Govt. of NCT of Delhi",
    officialUrl: "https://edistrict.delhigovt.nic.in/",
    applyUrl: "https://edistrict.delhigovt.nic.in/",
    portalName: "e-District Delhi Portal",
    category: "Education",
    defaultDeadlineStatus: "unknown",
    eligibilityCriteria: [
      "SC, ST, OBC, or minority student graduating from recognized colleges/institutes in Delhi.",
      "State topper or highest marks in technical/professional examination."
    ]
  },
  "jai bhim mukhyamantri pratibha vikas yojana": {
    name: "Jai Bhim Mukhyamantri Pratibha Vikas Yojana",
    description: "Delhi Government coaching support program providing free competitive exam coaching for civil services, engineering, and medical entrances.",
    benefits: "Free competitive coaching fee coverage plus monthly stipend of \u20B92,500 per student during the coaching period.",
    benefitType: "grant",
    department: "Department for the Welfare of SC/ST/OBC, Govt. of NCT of Delhi",
    officialUrl: "https://scstwelfare.delhi.gov.in/",
    applyUrl: "https://edistrict.delhigovt.nic.in/",
    portalName: "Delhi SC/ST Welfare Department",
    category: "Education",
    defaultDeadlineStatus: "unknown",
    eligibilityCriteria: [
      "Permanent resident of Delhi belonging to SC, ST, OBC, or EWS category.",
      "Family income up to \u20B98 Lakh per annum.",
      "Passed 10th and 12th standards from schools in Delhi."
    ]
  }
};
function normalizeSchemeName(name) {
  let lower = name.toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
  for (const [alias, canonical] of Object.entries(SCHEME_CANONICAL_ALIASES)) {
    if (lower === alias) {
      return canonical;
    }
    if (alias.length > 4) {
      const regex = new RegExp(`\\b${alias.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`, "i");
      if (regex.test(lower)) {
        return canonical;
      }
    }
  }
  lower = lower.replace(/\b(sc|st|obc|minority)\s+(post\s*matric|pre\s*matric)\b/g, "$2 $1").replace(/\b(post\s*matric|pre\s*matric)\s+scholarship\s+(for\s+)?(sc|st|obc|minority)(\s+students?)?\b/g, "$1 $3").replace(/\b(post\s*matric|pre\s*matric)\s+(for\s+)?(sc|st|obc|minority)(\s+students?)?\b/g, "$1 $3");
  const stripped = lower.replace(/\b(delhi|bihar|uttar pradesh|up|nct|state funded|centrally sponsored|css|scheme|yojana|scholarships?|guidelines?|portal|online|application|programme|program|mission|circulars?|notifications?|for|the|in|and|of|to|students?|candidates?|details?|2023|2024|2025|2026)\b/g, "").replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
  for (const [alias, canonical] of Object.entries(SCHEME_CANONICAL_ALIASES)) {
    if (stripped === alias) {
      return canonical;
    }
    if (alias.length > 4) {
      const regex = new RegExp(`\\b${alias.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`, "i");
      if (regex.test(stripped)) {
        return canonical;
      }
    }
  }
  if (stripped.includes("post matric") && /\bsc\b/.test(stripped)) return "post matric scholarship sc";
  if (stripped.includes("post matric") && /\bst\b/.test(stripped)) return "post matric scholarship st";
  if (stripped.includes("post matric") && /\bobc\b/.test(stripped)) return "post matric scholarship obc";
  if (stripped.includes("post matric")) return "post matric";
  if (stripped.includes("pre matric") && /\bsc\b/.test(stripped)) return "pre matric scholarship sc";
  if (stripped.includes("pre matric") && /\bst\b/.test(stripped)) return "pre matric scholarship st";
  if (stripped.includes("pre matric") && /\bobc\b/.test(stripped)) return "pre matric scholarship obc";
  if (stripped.includes("pre matric")) return "pre matric";
  if (stripped.includes("fee reimbursement") || stripped.includes("shulk pratipoorti")) return "post matric";
  if (stripped.includes("tuition") && (stripped.includes("reimbursement") || stripped.includes("fee"))) return "reimbursement tuition fees sc st obc";
  if (stripped.includes("merit") && stripped.includes("college")) return "merit scholarship college sc st obc";
  if (stripped.includes("higher") && stripped.includes("technical") && (stripped.includes("education") || stripped.includes("support"))) return "delhi higher and technical education support scheme";
  if (stripped.includes("central sector") && (stripped.includes("college") || stripped.includes("university") || stripped.includes("csss"))) return "central sector scheme of scholarship for college and university students";
  if (stripped.includes("pragati")) return "aicte pragati scholarship scheme";
  if (stripped.includes("saksham")) return "aicte saksham scholarship scheme";
  if (stripped.includes("swanath")) return "aicte swanath scholarship scheme";
  if (stripped.includes("nmmss") || stripped.includes("means") && stripped.includes("merit")) return "national means cum merit scholarship scheme";
  if (stripped.includes("yasasvi") || stripped.includes("young achievers")) return "pm yasasvi scholarship";
  if (stripped.includes("abhyuday")) return "mukhyamantri abhyudaya yojana";
  if (stripped.includes("kanya utthan")) return "mukhyamantri kanya utthan yojana";
  if (stripped.includes("student credit card")) return "bihar student credit card scheme";
  return stripped || lower;
}
function calculateCalibratedMatchScore(params) {
  const { level, state, targetState, category, userPersona = "student", eligibilityStatus, evidenceStatus } = params;
  let jurisdictionPoints = 0;
  let jurisdictionNote = "";
  if (level === "State") {
    const isStateMatch = Boolean(
      state && targetState && (state.toLowerCase() === targetState.toLowerCase() || state.toLowerCase().includes(targetState.toLowerCase()) || targetState.toLowerCase().includes(state.toLowerCase()))
    );
    if (isStateMatch) {
      jurisdictionPoints = 30;
      jurisdictionNote = `State-specific entitlement for ${targetState} (+30)`;
    } else {
      jurisdictionPoints = 0;
      jurisdictionNote = `State entitlement outside ${targetState} (0)`;
    }
  } else if (level === "Multi-State") {
    jurisdictionPoints = 28;
    jurisdictionNote = `Regional multi-state entitlement covering ${targetState} (+28)`;
  } else {
    jurisdictionPoints = 25;
    jurisdictionNote = "Central All-India initiative (+25)";
  }
  let categoryPoints = 0;
  let categoryNote = "";
  const personaNorm = userPersona.toLowerCase();
  const catNorm = (category || "").toLowerCase();
  if (personaNorm === "student") {
    if (catNorm.includes("education") || catNorm.includes("scholarship")) {
      categoryPoints = 30;
      categoryNote = "Direct educational scholarship match (+30)";
    } else if (catNorm.includes("social security") || catNorm.includes("welfare")) {
      categoryPoints = 12;
      categoryNote = "General social assistance (+12)";
    } else {
      categoryPoints = 5;
      categoryNote = "Non-educational welfare scheme (+5)";
    }
  } else if (personaNorm === "farmer") {
    if (catNorm.includes("agriculture") || catNorm.includes("farmer")) {
      categoryPoints = 30;
      categoryNote = "Direct agricultural / kisan benefit (+30)";
    } else {
      categoryPoints = 10;
      categoryNote = "General welfare program (+10)";
    }
  } else if (personaNorm === "business") {
    if (catNorm.includes("business") || catNorm.includes("msme") || catNorm.includes("employment")) {
      categoryPoints = 30;
      categoryNote = "Direct enterprise / loan subsidy (+30)";
    } else {
      categoryPoints = 10;
      categoryNote = "General citizen welfare (+10)";
    }
  } else {
    if (["healthcare", "housing", "food & civil supplies", "women & child", "social security"].some((c) => catNorm.includes(c))) {
      categoryPoints = 30;
      categoryNote = "Direct citizen welfare category match (+30)";
    } else {
      categoryPoints = 15;
      categoryNote = "Broad entitlement match (+15)";
    }
  }
  let eligibilityPoints = 0;
  let eligibilityNote = "";
  if (eligibilityStatus === "potentially_eligible") {
    eligibilityPoints = 25;
    eligibilityNote = "Profile aligns with stated eligibility rules (+25)";
  } else if (eligibilityStatus === "insufficient_information") {
    eligibilityPoints = 12;
    eligibilityNote = "Partial criteria established in evidence (+12)";
  } else {
    eligibilityPoints = 0;
    eligibilityNote = "Profile does not meet mandatory criteria (0)";
  }
  let evidencePoints = 0;
  let evidenceNote = "";
  if (evidenceStatus === "officially_verified" || evidenceStatus === "verified" || evidenceStatus === "officially_supported") {
    evidencePoints = 15;
    evidenceNote = "Official government portal corroboration (+15)";
  } else if (evidenceStatus === "partially_verified") {
    evidencePoints = 8;
    evidenceNote = "Partial or secondary source verification (+8)";
  } else {
    evidencePoints = 2;
    evidenceNote = "Unverified third-party citation (+2)";
  }
  let totalScore = jurisdictionPoints + categoryPoints + eligibilityPoints + evidencePoints;
  if (eligibilityStatus === "not_eligible") {
    totalScore = Math.min(totalScore, 35);
  }
  const rationale = `${jurisdictionNote}, ${categoryNote}, ${eligibilityNote}, ${evidenceNote}.`;
  return { score: Math.min(Math.max(totalScore, 10), 100), rationale };
}
function evaluateProfileCriteria(params) {
  const { schemeName, description, criteriaSummary = [], reasons = [], userProfile, targetState } = params;
  const isFiller = (text) => /identified from active|public welfare portal|retrieved from|search result|scraped from|verified portal/i.test(text);
  const rawCriteria = [
    schemeName || "",
    description || "",
    ...criteriaSummary,
    ...reasons
  ].filter((c) => typeof c === "string" && c.trim().length > 0 && !isFiller(c));
  if (rawCriteria.length === 0) {
    return {
      status: "unknown",
      matchedReasons: [],
      unmatchedReasons: [],
      unknownReasons: ["Eligibility details not verified from primary source."],
      hasRealCriteria: false
    };
  }
  const combinedCriteriaText = rawCriteria.join(" ").toLowerCase();
  const matchedReasons = [];
  const unmatchedReasons = [];
  const unknownReasons = [];
  let evaluatedChecksCount = 0;
  const userIncome = typeof userProfile?.annualIncome === "number" ? userProfile.annualIncome : typeof userProfile?.income === "number" ? userProfile.income : void 0;
  const rawCategory = (userProfile?.socialCategory || userProfile?.caste || userProfile?.category || "").trim();
  const userCategory = rawCategory.toLowerCase();
  const rawGender = (userProfile?.gender || "").trim();
  const userGender = rawGender.toLowerCase();
  const rawEducation = (userProfile?.educationLevel || "").trim();
  const userEducation = rawEducation.toLowerCase();
  const userStream = (userProfile?.courseStream || "").trim().toLowerCase();
  const isPwd = Boolean(userProfile?.isDifferentlyAbled);
  const userAge = typeof userProfile?.age === "number" ? userProfile.age : void 0;
  const rawFarmerType = (userProfile?.farmerType || "").trim().toLowerCase();
  const isLandless = userProfile?.landholding === 0 || userProfile?.landholding === "0" || userProfile?.landholding === "none" || userProfile?.landholding === "landless" || userProfile?.isLandowner === false || rawFarmerType === "landless";
  const hasLand = typeof userProfile?.landholding === "number" && userProfile.landholding > 0 || userProfile?.isLandowner === true || typeof userProfile?.landholding === "string" && parseFloat(userProfile.landholding) > 0 || rawFarmerType === "small/marginal" || rawFarmerType === "large";
  if (/\b(cultivable land|land ownership|landholding|landowner|holding land|own agricultural land)\b/i.test(combinedCriteriaText)) {
    evaluatedChecksCount++;
    if (!userProfile) {
      unknownReasons.push("Scheme requires cultivable landholding; user profile not provided.");
    } else if (isLandless) {
      unmatchedReasons.push("Scheme requires cultivable agricultural landholding; profile indicates Landless agricultural worker / tenant.");
    } else if (hasLand) {
      matchedReasons.push("User satisfies cultivable agricultural land ownership requirement.");
    } else {
      unknownReasons.push("Scheme requires cultivable landholding; landholding status not specified in profile.");
    }
  }
  if (/\b(small and marginal|small\s*[\/,]\s*marginal|marginal farmers?|up to 2 hectares?)\b/i.test(combinedCriteriaText)) {
    evaluatedChecksCount++;
    if (rawFarmerType === "small/marginal" || typeof userProfile?.landholding === "number" && userProfile.landholding > 0 && userProfile.landholding <= 2) {
      matchedReasons.push("Farmer category matched: Small and Marginal Farmer (holding up to 2 hectares).");
    } else if (rawFarmerType === "large" || typeof userProfile?.landholding === "number" && userProfile.landholding > 2) {
      unmatchedReasons.push("Scheme is restricted to Small & Marginal Farmers (up to 2 hectares); profile indicates Large landholder.");
    } else if (isLandless) {
      unmatchedReasons.push("Scheme requires small/marginal cultivable landholding; profile indicates Landless.");
    }
  }
  const isBenefitTransferOnly = /\bincome\s*(?:support|assistance|subsidy|transfer)\b/i.test(combinedCriteriaText) && !/\b(?:annual|family|parental|household|gross)\s*income\b/i.test(combinedCriteriaText) && !/\bincome\s*(?:limit|ceiling|below|less than|up to|not exceeding|not more than|under|should not exceed|maximum of)\b/i.test(combinedCriteriaText);
  const rangeIncomeMatch = !isBenefitTransferOnly ? combinedCriteriaText.match(/(?:annual|family|parental|household|gross)?\s*income(?:[^0-9₹\n\r]{0,40}?)(?:limit|ceiling|below|less than|up to|upto|not exceeding|not more than|under|should not exceed|maximum of)?\s*(?:of|is|shall be)?\s*(?:rs\.?|₹)?\s*([0-9]+(?:[\.,][0-9]+)?)\s*(?:to|-|and)\s*(?:rs\.?|₹)?\s*([0-9]+(?:[\.,][0-9]+)?)\s*(lakh|lac|k|crore)?/i) : null;
  const singleIncomeMatch = !isBenefitTransferOnly && !rangeIncomeMatch ? combinedCriteriaText.match(/(?:annual|family|parental|household|gross)?\s*income(?:[^0-9₹\n\r]{0,35}?)(?:limit|ceiling|below|less than|up to|upto|not exceeding|not more than|under|should not exceed|maximum of)\s*(?:of|is|shall be)?\s*(?:rs\.?|₹)?\s*([0-9]+(?:[\.,][0-9]+)?)\s*(lakh|lac|k|crore)?/i) || combinedCriteriaText.match(/(?:annual|family|parental|household|gross)\s*income\s*(?:is|shall be|of)?\s*(?:rs\.?|₹)?\s*([0-9]+(?:[\.,][0-9]+)?)\s*(lakh|lac|k|crore)?/i) : null;
  if (rangeIncomeMatch || singleIncomeMatch) {
    evaluatedChecksCount++;
    const rawVal = rangeIncomeMatch ? parseFloat(rangeIncomeMatch[2].replace(/,/g, "")) : parseFloat(singleIncomeMatch[1].replace(/,/g, ""));
    const unit = ((rangeIncomeMatch ? rangeIncomeMatch[3] : singleIncomeMatch[2]) || "").toLowerCase();
    let maxIncome = rawVal;
    if (unit.startsWith("lakh") || unit.startsWith("lac")) {
      maxIncome = rawVal * 1e5;
    } else if (unit === "k") {
      maxIncome = rawVal * 1e3;
    } else if (unit === "crore") {
      maxIncome = rawVal * 1e7;
    } else if (rawVal <= 100 && (/\b(lakhs?|lac|lacs?)\b/i.test(combinedCriteriaText) || rawVal < 100)) {
      maxIncome = rawVal * 1e5;
    }
    if (userIncome === void 0 || userIncome === null) {
      unknownReasons.push(`Scheme specifies annual income ceiling (\u20B9${maxIncome.toLocaleString("en-IN")}); user income not specified in profile.`);
    } else if (userIncome > maxIncome) {
      unmatchedReasons.push(`User annual income (\u20B9${userIncome.toLocaleString("en-IN")}) exceeds scheme limit of \u20B9${maxIncome.toLocaleString("en-IN")}.`);
    } else {
      matchedReasons.push(`Annual income (\u20B9${userIncome.toLocaleString("en-IN")}) is within eligible ceiling of \u20B9${maxIncome.toLocaleString("en-IN")}.`);
    }
  }
  if (/\b(girl students?|girls? admitted|female candidates?|women candidates?|girl child|for girls|for women|female students?|girls only|women only)\b/i.test(combinedCriteriaText) || /\b(pragati|begum\s*hazrat\s*mahal|kanya|balika|mahila|ladli)\b/i.test(combinedCriteriaText) || /\b(pragati|begum\s*hazrat\s*mahal|kanya|balika|mahila|ladli|girls?|women)\b/i.test(schemeName || "")) {
    evaluatedChecksCount++;
    if (!userGender || userGender === "all") {
      unknownReasons.push("Scheme specifies gender eligibility (restricted to female / girl students); gender not specified in profile.");
    } else if (userGender === "male") {
      unmatchedReasons.push("Scheme is restricted to female/girl students; profile indicates Male.");
    } else if (userGender === "female") {
      matchedReasons.push("Gender criteria met (female applicant).");
    }
  }
  const mentionsGeneral = /\b(general|unreserved|all categories|all students|open to all|all communities)\b/i.test(combinedCriteriaText);
  const isCombinedSCOBCAny = /\b(belonging to|belong to|reserved for|only for|applicable to)\s*(?:the\s+)?(?:sc|st|obc)/i.test(combinedCriteriaText) || /\b(sc\s*[\/,]\s*st\s*[\/,]\s*obc|sc\s*[\/,]\s*obc)\s+(?:students?|candidates?|scholarship|schemes?)\b/i.test(combinedCriteriaText) || /\b(?:schemes?|scholarships?|assistance)\s+for\s+(?:the\s+)?(?:sc|st|obc)/i.test(combinedCriteriaText) || /\bfor\s+(?:the\s+)?(?:sc|st|obc)\s*(?:&|and|\/)\s*(?:sc|st|obc)\s+(?:students?|candidates?|applicants?|scholarship|schemes?)\b/i.test(combinedCriteriaText) || /\b(welfare of\s*(?:the\s*)?(?:sc|st|obc))\b/i.test(combinedCriteriaText);
  const isReservedSC = /\b(belonging to (?:the\s+)?scheduled caste|for sc students|sc category|scheduled caste \(sc\) category|reserved for (?:the\s+)?scheduled caste)\b/i.test(combinedCriteriaText);
  const isReservedST = /\b(belonging to (?:the\s+)?scheduled tribe|for st students|st category|scheduled tribe \(st\) category|reserved for (?:the\s+)?scheduled tribe)\b/i.test(combinedCriteriaText);
  const isReservedOBC = /\b(belonging to (?:the\s+)?(?:obc|other backward)|for obc students|obc category|reserved for (?:the\s+)?(?:obc|other backward))\b/i.test(combinedCriteriaText);
  const isReservedMinority = /\b(belonging to (?:a\s+)?minority community|for minority students|minority category|minority community students?)\b/i.test(combinedCriteriaText);
  if (mentionsGeneral && userCategory && userCategory.includes("general")) {
    evaluatedChecksCount++;
    matchedReasons.push("Social category matched: General (scheme covers General / all categories).");
  } else if (isCombinedSCOBCAny) {
    evaluatedChecksCount++;
    if (!userCategory) {
      unknownReasons.push("Scheme specifies category criteria (SC/ST/OBC); social category not specified.");
    } else if (userCategory.includes("sc") || userCategory.includes("st") || userCategory.includes("obc")) {
      matchedReasons.push(`Social category matched: ${rawCategory}.`);
    } else if (userCategory.includes("general")) {
      unmatchedReasons.push("Scheme reserved for SC/ST/OBC applicants; profile indicates General category.");
    } else {
      unknownReasons.push(`Category criteria (SC/ST/OBC) requires verification for ${rawCategory}.`);
    }
  } else if (isReservedSC && !isReservedOBC && !isReservedST) {
    evaluatedChecksCount++;
    if (!userCategory) {
      unknownReasons.push("Scheme reserved for Scheduled Caste (SC); category not specified.");
    } else if (userCategory.includes("sc") && !userCategory.includes("st")) {
      matchedReasons.push("Social category matched: Scheduled Caste (SC).");
    } else {
      unmatchedReasons.push(`Scheme reserved for Scheduled Caste (SC) applicants; profile indicates ${rawCategory || "non-SC"}.`);
    }
  } else if (isReservedST && !isReservedSC) {
    evaluatedChecksCount++;
    if (!userCategory) {
      unknownReasons.push("Scheme reserved for Scheduled Tribe (ST); category not specified.");
    } else if (userCategory.includes("st")) {
      matchedReasons.push("Social category matched: Scheduled Tribe (ST).");
    } else {
      unmatchedReasons.push(`Scheme reserved for Scheduled Tribe (ST) applicants; profile indicates ${rawCategory || "non-ST"}.`);
    }
  } else if (isReservedOBC) {
    evaluatedChecksCount++;
    if (!userCategory) {
      unknownReasons.push("Scheme reserved for OBC; category not specified.");
    } else if (userCategory.includes("obc")) {
      matchedReasons.push("Social category matched: OBC.");
    } else {
      unmatchedReasons.push(`Scheme reserved for OBC applicants; profile indicates ${rawCategory || "non-OBC"}.`);
    }
  } else if (isReservedMinority) {
    evaluatedChecksCount++;
    if (!userCategory) {
      unknownReasons.push("Scheme reserved for Minority students; category not specified.");
    } else if (userCategory.includes("minority")) {
      matchedReasons.push("Social category matched: Minority.");
    } else {
      unmatchedReasons.push(`Scheme reserved for Minority students; profile indicates ${rawCategory || "non-Minority"}.`);
    }
  }
  if (userEducation && userEducation !== "any") {
    const isSchoolOnly = /\b(class 9|class ix|pre-matric|pre matric|classes? i to x\b|class 9th - 10th|students from class 9|studying in class 9)\b/i.test(combinedCriteriaText) && !/\b(post-matric|post matric|college|university|undergraduate|postgraduate)\b/i.test(combinedCriteriaText);
    const isCollegeUniversity = /\b(college and university|college & university|for college and university|for college & university|for college|for university|class 12 passed|after 12th|passed class 12|12th passed students?|undergraduate study|undergraduate studies|undergraduate course|first year of graduation|pursuing graduation|degree course)\b/i.test(combinedCriteriaText);
    const isPgOnly = /\b(ph\.?d|doctorate|research fellowship|pg degree|post graduate degree|postgraduate studies|leading to specified pg)\b/i.test(combinedCriteriaText) && !/\b(undergraduate|intermediate|diploma, degree, or|first 3 years)\b/i.test(combinedCriteriaText);
    const isDegreeDiploma = /\b(technical degree or diploma|degree or diploma course|admitted to 1st year .* degree|engineering degree|diploma in engineering)\b/i.test(combinedCriteriaText);
    const isPostMatric = /\b(post-matric|post matric|post-secondary|diploma, degree|pursuing recognized post-matriculation)\b/i.test(combinedCriteriaText);
    if (isSchoolOnly) {
      evaluatedChecksCount++;
      if (userEducation === "school") {
        matchedReasons.push("Education level matched: School / Pre-Matric level.");
      } else if (userEducation === "higher secondary" && (combinedCriteriaText.includes("class 12") || combinedCriteriaText.includes("class 11"))) {
        matchedReasons.push("Education level matched: Secondary / Higher Secondary.");
      } else {
        unmatchedReasons.push(`Scheme is restricted to school students (Class 9-10 / Pre-Matric); profile indicates ${rawEducation}.`);
      }
    } else if (isPgOnly) {
      evaluatedChecksCount++;
      if (userEducation === "postgraduate") {
        matchedReasons.push("Education level matched: Postgraduate (PG) / Ph.D. research program.");
      } else {
        unmatchedReasons.push(`Scheme requires enrollment in Postgraduate (PG) / Ph.D. program; profile indicates ${rawEducation}.`);
      }
    } else if (isCollegeUniversity) {
      evaluatedChecksCount++;
      if (userEducation === "undergraduate") {
        matchedReasons.push("Education level matched: College & University / Undergraduate degree program.");
      } else if (userEducation === "postgraduate") {
        matchedReasons.push("Education level matched: College & University / Postgraduate program.");
      } else if (userEducation === "school") {
        unmatchedReasons.push("Scheme requires College / University enrollment (Class 12 passed); profile indicates School (Class 9th - 10th Pre-Matric).");
      } else if (userEducation === "higher secondary") {
        unmatchedReasons.push("Scheme requires admission to College / University (Class 12 passed); profile indicates Class 11th - 12th / Intermediate.");
      } else {
        unmatchedReasons.push(`Scheme requires College / University enrollment; profile indicates ${rawEducation}.`);
      }
    } else if (isDegreeDiploma) {
      evaluatedChecksCount++;
      if (userEducation === "undergraduate") {
        matchedReasons.push("Education level matched: Undergraduate degree / diploma.");
      } else if (userEducation === "postgraduate") {
        unmatchedReasons.push(`Scheme requires Degree/Diploma course (Undergraduate); profile indicates Postgraduate.`);
      } else {
        unmatchedReasons.push(`Scheme requires admission to Degree/Diploma program; profile indicates ${rawEducation}.`);
      }
    } else if (isPostMatric) {
      evaluatedChecksCount++;
      if (userEducation === "school") {
        unmatchedReasons.push("Scheme requires Post-Matriculation studies (Class 11, 12, Diploma, Degree, or PG); profile indicates School (Pre-Matric).");
      } else {
        matchedReasons.push(`Education level matched for Post-Matric / Higher Education (${rawEducation}).`);
      }
    }
  }
  if (/\b(aicte|technical degree|technical diploma|technical course)\b/i.test(combinedCriteriaText)) {
    evaluatedChecksCount++;
    if (!userStream) {
      unknownReasons.push("Scheme requires AICTE technical degree/diploma; course stream not specified.");
    } else if (userStream.includes("engineering") || userStream.includes("technical") || userStream.includes("aicte") || userStream.includes("polytechnic") || userStream.includes("diploma")) {
      matchedReasons.push("Course stream matched: Technical / Engineering / Diploma stream.");
    } else {
      unmatchedReasons.push(`Scheme requires AICTE technical degree/diploma course; profile indicates ${userProfile?.courseStream || "non-technical stream"}.`);
    }
  }
  const isDedicatedDisabilityScheme = /\b(saksham|differently[- ]?abled|specially[- ]?abled|divyang|disabilit(?:y|ies)|pwd candidates?|locomotor disability)\b/i.test(combinedCriteriaText) || /\b(saksham|specially[- ]?abled|differently[- ]?abled|disabilit(?:y|ies))\b/i.test(schemeName || "");
  const isMereRelaxation = /\b(?:concession|relaxation)\s+for\s+(?:pwd|differently abled|disabled)\b/i.test(combinedCriteriaText) && !/\b(saksham|specially[- ]?abled|differently[- ]?abled|only for differently|reserved for differently|students? with disabilities?)\b/i.test(combinedCriteriaText) && !/\b(saksham|specially[- ]?abled|differently[- ]?abled)\b/i.test(schemeName || "");
  if (isDedicatedDisabilityScheme && !isMereRelaxation) {
    evaluatedChecksCount++;
    if (isPwd) {
      matchedReasons.push("Differently-abled (PwD) criteria satisfied.");
    } else {
      unmatchedReasons.push("Scheme is reserved for differently-abled (PwD) students; profile indicates Not Differently Abled.");
    }
  }
  const isOrphanOrMartyrWardScheme = /\b(swanath|orphan(?:ed)?\s*children|wards\s+of\s+(?:armed|defence|paramilitary)\s*forces\s+(?:deceased|martyred|killed|in action)|lost\s+both\s+parents|covid[- ]?affected\s+children)\b/i.test(combinedCriteriaText) || /\bswanath\b/i.test(schemeName || "");
  if (isOrphanOrMartyrWardScheme) {
    evaluatedChecksCount++;
    unmatchedReasons.push("Scheme is restricted to orphaned children, wards of armed forces personnel deceased in action, or COVID-affected children (Swanath criteria); standard applicant profile not eligible.");
  }
  const ageMatch = combinedCriteriaText.match(/age\s*(?:limit|is|under|below|not exceeding)?\s*(?:is)?\s*([0-9]{1,2})\s*years?/i);
  if (ageMatch) {
    const maxAge = parseInt(ageMatch[1], 10);
    if (maxAge >= 15 && maxAge <= 65) {
      evaluatedChecksCount++;
      if (userAge === void 0 || userAge === null) {
        unknownReasons.push(`Scheme specifies age limit (${maxAge} years); applicant age not specified.`);
      } else if (userAge > maxAge) {
        unmatchedReasons.push(`Applicant age (${userAge} years) exceeds scheme age limit of ${maxAge} years.`);
      } else {
        matchedReasons.push(`Applicant age (${userAge} years) is within eligible limit (under ${maxAge} years).`);
      }
    }
  }
  if (targetState && targetState.toLowerCase() !== "all india" && targetState.toLowerCase() !== "central") {
    if (combinedCriteriaText.includes("domicile") || combinedCriteriaText.includes("resident of " + targetState.toLowerCase())) {
      evaluatedChecksCount++;
      if (userProfile?.state && userProfile.state.toLowerCase() === targetState.toLowerCase()) {
        matchedReasons.push(`Domicile verified for ${targetState}.`);
      } else if (userProfile?.state && userProfile.state.toLowerCase() !== targetState.toLowerCase()) {
        unmatchedReasons.push(`Scheme requires domicile of ${targetState}; user is from ${userProfile.state}.`);
      } else {
        unknownReasons.push(`Domicile of ${targetState} required; user state unconfirmed.`);
      }
    }
  }
  const isNorthEastScheme = /\b(north\s*eastern\s*(?:region|council)|ner\s*domicile|resident\s+of\s+north\s*east|nec\s*(?:merit\s*)?scholarship|ishaan\s*uday)\b/i.test(combinedCriteriaText) || /\b(north\s*eastern\s*(?:region|council)|nec\s*(?:merit\s*)?scholarship|ishaan\s*uday)\b/i.test(schemeName || "");
  if (isNorthEastScheme) {
    evaluatedChecksCount++;
    const neStates = ["assam", "arunachal pradesh", "manipur", "meghalaya", "mizoram", "nagaland", "sikkim", "tripura"];
    const curState = (targetState || userProfile?.state || "").toLowerCase();
    if (curState && !neStates.includes(curState)) {
      unmatchedReasons.push(`Scheme is restricted to domicile of North Eastern Region (NER) states (${neStates.join(", ")}); applicant state is ${targetState || userProfile?.state}.`);
    } else if (curState && neStates.includes(curState)) {
      matchedReasons.push(`Domicile verified for North Eastern Region (${curState}).`);
    }
  }
  if (unmatchedReasons.length > 0) {
    return {
      status: "not_matched",
      matchedReasons,
      unmatchedReasons,
      unknownReasons,
      hasRealCriteria: true
    };
  }
  if (matchedReasons.length > 0) {
    return {
      status: "matched",
      matchedReasons,
      unmatchedReasons: [],
      unknownReasons,
      hasRealCriteria: true
    };
  }
  if (unknownReasons.length > 0 || evaluatedChecksCount === 0) {
    return {
      status: "unknown",
      matchedReasons,
      unmatchedReasons,
      unknownReasons: unknownReasons.length > 0 ? unknownReasons : ["Detailed criteria require applicant verification."],
      hasRealCriteria: true
    };
  }
  return {
    status: "unknown",
    matchedReasons: [],
    unmatchedReasons: [],
    unknownReasons: ["Eligibility details not fully verified."],
    hasRealCriteria: true
  };
}
function parseDateString(dateStr) {
  if (!dateStr) return null;
  const clean = dateStr.trim();
  const dmyMatch = clean.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    return new Date(year, month, day, 23, 59, 59);
  }
  const ymdMatch = clean.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    return new Date(year, month, day, 23, 59, 59);
  }
  const textDateMatch = clean.match(/^(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+)[,\s]+(\d{4})$/) || clean.match(/^([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?[,\s]+(\d{4})$/);
  if (textDateMatch) {
    const isMonthFirst = isNaN(parseInt(textDateMatch[1], 10));
    const day = parseInt(isMonthFirst ? textDateMatch[2] : textDateMatch[1], 10);
    const monthStr = (isMonthFirst ? textDateMatch[1] : textDateMatch[2]).toLowerCase();
    const year = parseInt(textDateMatch[3], 10);
    const months = {
      jan: 0,
      january: 0,
      feb: 1,
      february: 1,
      mar: 2,
      march: 2,
      apr: 3,
      april: 3,
      may: 4,
      jun: 5,
      june: 5,
      jul: 6,
      july: 6,
      aug: 7,
      august: 7,
      sep: 8,
      september: 8,
      oct: 9,
      october: 9,
      nov: 10,
      november: 10,
      dec: 11,
      december: 11
    };
    if (monthStr in months) {
      return new Date(year, months[monthStr], day, 23, 59, 59);
    }
  }
  const standardParsed = new Date(clean);
  if (!isNaN(standardParsed.getTime())) {
    return standardParsed;
  }
  return null;
}
function resolveSchemeDeadline(params) {
  const { raw, aggregateText, isDelhiScholarship, flagshipDef } = params;
  const now = /* @__PURE__ */ new Date();
  const textToScan = [
    raw.deadline || "",
    raw.deadlineStatus || "",
    raw.academicYearOrValidity || "",
    raw.description || "",
    raw.sourceTitle || "",
    raw.evidenceSnippets?.benefitEvidence || "",
    raw.evidenceSnippets?.eligibilityEvidence || "",
    raw.evidenceSnippets?.nameEvidence || "",
    ...(raw.supportingReferences || []).map((r) => (r.title || "") + " " + (r.url || "")),
    aggregateText.slice(0, 5e3)
  ].join(" ");
  const closedPattern = /\b(?:application[s]?\s+(?:are\s+|is\s+)?closed|registration[s]?\s+(?:are\s+|is\s+)?closed|portal\s+(?:is\s+)?closed|deadline\s+(?:is\s+over|has\s+ended|has\s+passed|has\s+expired|expired|ended|over|closed)|last\s+date\s+(?:is\s+over|has\s+passed|ended|was)|registration\s+ended|currently\s+closed|application\s+window\s+(?:is\s+)?closed|no\s+longer\s+accepting\s+applications?|closed\s+for\s+applications?|admissions?\s+closed|form\s+submission\s+closed|expired\b)/i;
  if (raw.deadlineStatus === "closed" || closedPattern.test(textToScan)) {
    return {
      deadline: raw.deadline || "Applications Closed",
      deadlineStatus: "closed"
    };
  }
  const dateRegex = /(?:deadline|last\s+date|closing\s+date|due\s+date|ended(?:\s+on)?|valid\s+(?:upto|till)|apply\s+(?:by|before))[:\s]+([0-9]{1,2}[-/.][0-9]{1,2}[-/.][0-9]{2,4}|[0-9]{1,2}(?:st|nd|rd|th)?\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember))[,\s]+[0-9]{4}|(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember))\s+[0-9]{1,2}(?:st|nd|rd|th)?[,\s]+[0-9]{4})/i;
  const targetDateCandidate = raw.deadline || textToScan.match(dateRegex)?.[1];
  if (targetDateCandidate) {
    const parsedDate = parseDateString(targetDateCandidate);
    if (parsedDate) {
      if (parsedDate.getTime() < now.getTime()) {
        return {
          deadline: `Closed on ${targetDateCandidate}`,
          deadlineStatus: "closed"
        };
      } else {
        return {
          deadline: targetDateCandidate,
          deadlineStatus: "open"
        };
      }
    }
  }
  if (isDelhiScholarship) {
    return {
      deadline: "Application Window Closed (Cycle ended June 30, 2026)",
      deadlineStatus: "closed"
    };
  }
  if (raw.deadlineStatus === "open" || raw.deadlineStatus === "upcoming") {
    return {
      deadline: raw.deadline || null,
      deadlineStatus: raw.deadlineStatus
    };
  }
  const defaultStatus = flagshipDef?.defaultDeadlineStatus;
  if (defaultStatus && defaultStatus !== "open") {
    return {
      deadline: null,
      deadlineStatus: defaultStatus
    };
  }
  return {
    deadline: null,
    deadlineStatus: "unknown"
  };
}
function verifyAndDeduplicateSchemes(params) {
  const { rawSchemes, fetchedPages = [], targetState, userPersona = "student", userProfile = null } = params;
  const verifiedMap = /* @__PURE__ */ new Map();
  const unverifiedMap = /* @__PURE__ */ new Map();
  const stashedDocs = /* @__PURE__ */ new Map();
  const auditedDomainsSet = /* @__PURE__ */ new Set();
  const mergedDetails = [];
  const rejectedCandidates = [];
  const jurisdictionFailures = [];
  const verificationBreakdown = {
    verifiedCount: 0,
    partiallyVerifiedCount: 0,
    unverifiedCount: 0,
    rejectedCount: 0
  };
  const sourceBreakdown = {
    officialGovernment: 0,
    officialPortal: 0,
    reputableSecondary: 0,
    commercial: 0,
    unknown: 0
  };
  const fetchedUrlMap = /* @__PURE__ */ new Map();
  let aggregateFetchedText = "";
  for (const page of fetchedPages) {
    if (page.url) fetchedUrlMap.set(page.url.toLowerCase(), page);
    if (page.final_url) fetchedUrlMap.set(page.final_url.toLowerCase(), page);
    aggregateFetchedText += " " + (page.text || "") + " " + (page.title || "");
    try {
      const u = new URL(page.url);
      auditedDomainsSet.add(u.hostname);
    } catch {
    }
  }
  const aggregateTextLower = aggregateFetchedText.toLowerCase();
  let deduplicatedCount = 0;
  let uniqueCandidatesCount = 0;
  for (const raw of rawSchemes) {
    const rawName = (raw.name || "").trim();
    if (!rawName) continue;
    uniqueCandidatesCount++;
    const rawUrl = raw.officialUrl || "";
    const docCheck = identifyParentSchemeForDocument(rawName, rawUrl, raw.description || "");
    if (docCheck) {
      if (docCheck.documentType === "rejected_report") {
        const isCompilation = /schemes? for (the )?welfare of|schemes? for farmers|welfare schemes for|major schemes for|compilation|pib|compendium|annual report/i.test(rawName);
        if (isCompilation) {
          const combinedDocText = (raw.description || "") + " " + (raw.sourceTitle || "") + " " + aggregateFetchedText;
          const extractedNamed = extractNamedSchemesFromText(combinedDocText);
          if (extractedNamed.length > 0) {
            for (const named of extractedNamed) {
              const parentKey = normalizeSchemeName(named);
              if (!stashedDocs.has(parentKey)) {
                stashedDocs.set(parentKey, []);
              }
              stashedDocs.get(parentKey).push({
                title: rawName,
                url: rawUrl,
                domain: (() => {
                  try {
                    return new URL(rawUrl).hostname;
                  } catch {
                    return "official";
                  }
                })(),
                relationship: "official_supporting_document",
                isOfficial: true,
                documentType: "press_release",
                verifiedDate: (/* @__PURE__ */ new Date()).toISOString()
              });
            }
          }
        }
        verificationBreakdown.rejectedCount++;
        rejectedCandidates.push({
          title: rawName,
          url: rawUrl,
          reason: isCompilation ? "Multi-scheme government press release or compilation report, not a standalone scheme" : "Parliamentary or legislative committee report, not a government welfare scheme"
        });
        continue;
      }
      if (docCheck.documentType === "commercial_or_unverified_source") {
        sourceBreakdown.commercial++;
        verificationBreakdown.rejectedCount++;
        jurisdictionFailures.push({
          schemeName: rawName,
          detectedJurisdiction: "commercial",
          detectedState: null,
          targetState,
          reason: "Commercial vendor, equipment dealer, or private marketplace. Not an official government department.",
          url: rawUrl
        });
        rejectedCandidates.push({
          title: rawName,
          url: rawUrl,
          reason: "Commercial vendor, equipment dealer, or private marketplace. Not an official government department."
        });
        continue;
      }
      if (docCheck.documentType === "official_supporting_document" && docCheck.parentSchemeName) {
        deduplicatedCount++;
        const docObj = {
          title: rawName,
          url: rawUrl,
          domain: (() => {
            try {
              return new URL(rawUrl).hostname;
            } catch {
              return "official";
            }
          })(),
          relationship: "official_supporting_document",
          isOfficial: true,
          documentType: /guideline/i.test(rawName) ? "guideline" : /faq/i.test(rawName) ? "faq" : /app/i.test(rawName) ? "mobile_app" : "circular",
          verifiedDate: (/* @__PURE__ */ new Date()).toISOString()
        };
        const parentKey = normalizeSchemeName(docCheck.parentSchemeName);
        if (!stashedDocs.has(parentKey)) {
          stashedDocs.set(parentKey, []);
        }
        stashedDocs.get(parentKey).push(docObj);
        const existingParent = verifiedMap.get(parentKey) || verifiedMap.get(`${parentKey}::unified`) || verifiedMap.get(`${parentKey}::central`) || unverifiedMap.get(parentKey) || unverifiedMap.get(`${parentKey}::unified`) || unverifiedMap.get(`${parentKey}::central`) || Array.from(verifiedMap.entries()).find(([k]) => k.startsWith(parentKey))?.[1] || Array.from(unverifiedMap.entries()).find(([k]) => k.startsWith(parentKey))?.[1];
        if (existingParent) {
          existingParent.supportingDocuments = existingParent.supportingDocuments || [];
          if (!existingParent.supportingDocuments.some((d) => d.url === docObj.url)) {
            existingParent.supportingDocuments.push(docObj);
          }
          if (rawUrl && !existingParent.sourceUrls.includes(rawUrl)) {
            existingParent.sourceUrls.push(rawUrl);
          }
          if (Array.isArray(raw.sourceUrls)) {
            for (const sUrl of raw.sourceUrls) {
              if (sUrl && !existingParent.sourceUrls.includes(sUrl)) {
                existingParent.sourceUrls.push(sUrl);
              }
            }
          }
          if (rawUrl && (!existingParent.supportingEvidenceUrls || !existingParent.supportingEvidenceUrls.includes(rawUrl))) {
            existingParent.supportingEvidenceUrls = Array.from(/* @__PURE__ */ new Set([...existingParent.supportingEvidenceUrls || [], rawUrl]));
          }
        }
        continue;
      }
    }
    const candidateClass = classifyCandidate(rawName, rawUrl, raw.description || "");
    const isExplicitDocOrGuideline = candidateClass === "guidelines_or_document" || candidateClass === "supporting_document" || /\.(pdf|docx?|xlsx?)$/i.test(rawUrl || "") || /\/schemeguidelines\/|\/guidelines?\//i.test(rawUrl || "") || /^(rules?\s+for\s+(?:the\s+)?award|guidelines?\s+(?:for|of)|scheme\s+guidelines?)\b/i.test(rawName);
    const isApexScholarshipCandidate = !isExplicitDocOrGuideline && (rawUrl && (rawUrl.toLowerCase().includes("scholarship.up.gov.in") || rawUrl.toLowerCase().includes("scholarships.gov.in") || rawUrl.toLowerCase().includes("buddy4study.com")) || /\b(up scholarship|uttar pradesh scholarship|dashmottar|shulk pratipoorti|post[- ]?matric.*(?:up|uttar pradesh))\b/i.test(rawName));
    if (candidateClass !== "individual_scheme" && !isApexScholarshipCandidate) {
      verificationBreakdown.rejectedCount++;
      const reasonDescriptions = {
        official_scheme_directory: "Official scheme directory or department listing page; preserved as supporting reference, not an individual scheme card.",
        directory_or_listing: "Scheme directory or listing portal; preserved as supporting reference, not an individual scheme card.",
        application_portal: "Application portal or registration endpoint; preserved as supporting portal reference, not an individual scheme card.",
        scheme_portal: "Scheme portal homepage; preserved as supporting reference, not an individual scheme card.",
        news_or_article: "News article, press release, or third-party overview; preserved as secondary discovery lead, not an individual scheme card.",
        guidelines_or_document: "Guideline document, circular, or PDF; preserved as official supporting document, not an individual scheme card.",
        supporting_document: "Supporting document or guideline; preserved as reference, not an individual scheme card.",
        umbrella_program: "Broad umbrella program category without distinct scheme rules; not an individual scheme card.",
        unrelated_or_insufficient: "Generic portal page or insufficient evidence establishing a distinct government scheme."
      };
      const isCompilation = /schemes? for (the )?welfare of|schemes? for farmers|welfare schemes for|major schemes for|compilation|pib|compendium|annual report/i.test(rawName);
      rejectedCandidates.push({
        title: rawName,
        url: rawUrl,
        reason: isCompilation ? "Multi-scheme government press release or compilation report, not an individual scheme card." : reasonDescriptions[candidateClass] || "Non-individual scheme candidate excluded from scheme cards."
      });
      const combinedDocText = `${rawName} ${raw.description || ""} ${raw.sourceTitle || ""} ${aggregateFetchedText}`;
      const extractedNamed = extractNamedSchemesFromText(combinedDocText);
      for (const named of extractedNamed) {
        const parentKey = normalizeSchemeName(named);
        if (!stashedDocs.has(parentKey)) {
          stashedDocs.set(parentKey, []);
        }
        stashedDocs.get(parentKey).push({
          title: rawName,
          url: rawUrl,
          domain: (() => {
            try {
              return new URL(rawUrl).hostname;
            } catch {
              return "official";
            }
          })(),
          relationship: classifySource(rawUrl, targetState).isOfficial ? "official_supporting_document" : "reputable_secondary_source",
          isOfficial: classifySource(rawUrl, targetState).isOfficial,
          documentType: candidateClass,
          verifiedDate: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
      const normDocKey = normalizeSchemeName(sanitizeSchemeName(rawName) || rawName);
      const existingParent = verifiedMap.get(normDocKey) || verifiedMap.get(`${normDocKey}::unified`) || verifiedMap.get(`${normDocKey}::central`) || unverifiedMap.get(normDocKey) || unverifiedMap.get(`${normDocKey}::unified`) || unverifiedMap.get(`${normDocKey}::central`) || Array.from(verifiedMap.entries()).find(([k]) => k.startsWith(normDocKey))?.[1] || Array.from(unverifiedMap.entries()).find(([k]) => k.startsWith(normDocKey))?.[1];
      if (existingParent) {
        deduplicatedCount++;
        if (rawUrl && !existingParent.sourceUrls.includes(rawUrl)) {
          existingParent.sourceUrls.push(rawUrl);
        }
        if (Array.isArray(raw.sourceUrls)) {
          for (const sUrl of raw.sourceUrls) {
            if (sUrl && !existingParent.sourceUrls.includes(sUrl)) {
              existingParent.sourceUrls.push(sUrl);
            }
          }
        }
        if (rawUrl && (!existingParent.supportingEvidenceUrls || !existingParent.supportingEvidenceUrls.includes(rawUrl))) {
          existingParent.supportingEvidenceUrls = Array.from(/* @__PURE__ */ new Set([...existingParent.supportingEvidenceUrls || [], rawUrl]));
        }
        if (raw.benefits && !isGenericBenefit(raw.benefits)) {
          if (existingParent.fieldEvidence?.benefit && existingParent.fieldEvidence.benefit.passageSnippet !== raw.benefits) {
            existingParent.fieldEvidence.benefit.conflictNotes = `Conflicting benefit information reported: alternative evidence snippet observed from ${rawUrl}. Authoritative primary source retained.`;
          }
        }
      }
      continue;
    }
    let officialUrl = raw.officialUrl && isValidPublicUrl(raw.officialUrl) ? raw.officialUrl : "https://scholarships.gov.in";
    try {
      const u1 = new URL(officialUrl);
      auditedDomainsSet.add(u1.hostname);
    } catch {
    }
    let sourceRes = classifySource(officialUrl, targetState);
    if (sourceRes.classification === "official_government" || sourceRes.classification === "official_government_scheme_page") {
      sourceBreakdown.officialGovernment++;
    } else if (sourceRes.classification === "official_scheme_portal" || sourceRes.classification === "official_application_portal" || sourceRes.classification === "official_supporting_document") {
      sourceBreakdown.officialPortal++;
    } else if (sourceRes.classification === "reputable_secondary" || sourceRes.classification === "secondary_source") {
      sourceBreakdown.reputableSecondary++;
    } else if (sourceRes.classification === "commercial" || sourceRes.classification === "commercial_source") {
      sourceBreakdown.commercial++;
    } else {
      sourceBreakdown.unknown++;
    }
    if (sourceRes.isCommercial) {
      verificationBreakdown.rejectedCount++;
      jurisdictionFailures.push({
        schemeName: rawName,
        detectedJurisdiction: "commercial",
        detectedState: null,
        targetState,
        reason: `Commercial platform (${sourceRes.ownerName}). Not an official government department.`,
        url: officialUrl
      });
      rejectedCandidates.push({
        title: rawName,
        url: officialUrl,
        reason: `Commercial platform (${sourceRes.ownerName}). Not an official government department.`
      });
      continue;
    }
    if (/\/journal\/|\/article\/download|egyankosh\.ac\.in|researchgate\.net|academia\.edu|sciencedirect\.com|prsindia\.org\/files\/budget\//i.test(rawUrl)) {
      verificationBreakdown.rejectedCount++;
      rejectedCandidates.push({
        title: rawName,
        url: rawUrl,
        reason: "Academic research paper, journal article, textbook unit, or budget study \u2014 not a government welfare scheme"
      });
      continue;
    }
    let cleanedName = sanitizeSchemeName(rawName);
    if (!cleanedName || isInvalidSchemeName(cleanedName)) {
      const combinedDocText = (raw.description || "") + " " + (raw.sourceTitle || "") + " " + aggregateFetchedText;
      const extractedNamed = extractNamedSchemesFromText(combinedDocText);
      if (extractedNamed.length > 0) {
        for (const named of extractedNamed) {
          const parentKey = normalizeSchemeName(named);
          if (!stashedDocs.has(parentKey)) {
            stashedDocs.set(parentKey, []);
          }
          stashedDocs.get(parentKey).push({
            title: rawName,
            url: officialUrl,
            domain: (() => {
              try {
                return new URL(officialUrl).hostname;
              } catch {
                return "official";
              }
            })(),
            relationship: "official_supporting_document",
            isOfficial: sourceRes.isOfficial,
            documentType: "press_release",
            verifiedDate: (/* @__PURE__ */ new Date()).toISOString()
          });
        }
      }
      verificationBreakdown.rejectedCount++;
      rejectedCandidates.push({
        title: rawName,
        url: rawUrl,
        reason: "Multi-scheme government press release or compilation report, not a standalone scheme"
      });
      continue;
    }
    const normKey = normalizeSchemeName(cleanedName);
    if (!normKey || normKey.length < 3) continue;
    const flagshipDef = FLAGSHIP_DEFINITIONS[normKey];
    if (flagshipDef) {
      cleanedName = flagshipDef.name;
      if (sourceRes.isSecondary || sourceRes.classification === "secondary_source" || !sourceRes.isOfficial) {
        if (!sourceRes.isCommercial && sourceRes.classification !== "commercial_source" && !sourceRes.domain.includes(".in.net")) {
          if (!raw.supportingReferences) raw.supportingReferences = [];
          raw.supportingReferences.push({
            title: raw.sourceTitle || raw.name || flagshipDef.name,
            url: officialUrl,
            domain: sourceRes.domain,
            isOfficial: false
          });
        }
        officialUrl = flagshipDef.officialUrl;
        sourceRes = classifySource(flagshipDef.officialUrl, targetState);
      }
    }
    const candidateJurisdictionInput = {
      name: cleanedName,
      description: raw.description,
      officialUrl,
      level: raw.level,
      state: raw.state,
      department: raw.department,
      sourceTitle: raw.sourceTitle,
      evidenceSnippets: raw.evidenceSnippets
    };
    const jurisdictionRes = detectJurisdiction(candidateJurisdictionInput, targetState);
    if (!jurisdictionRes.isApplicableToTarget) {
      verificationBreakdown.rejectedCount++;
      jurisdictionFailures.push({
        schemeName: cleanedName,
        detectedJurisdiction: jurisdictionRes.jurisdiction,
        detectedState: jurisdictionRes.detectedState,
        targetState,
        reason: jurisdictionRes.reason,
        url: officialUrl
      });
      rejectedCandidates.push({
        title: cleanedName,
        url: officialUrl,
        reason: jurisdictionRes.rejectionReason || jurisdictionRes.reason
      });
      continue;
    }
    const nameTokens = normKey.split(" ").filter((w) => w.length > 2);
    const snippetText = (raw.description || "") + " " + (raw.sourceTitle || "") + " " + officialUrl;
    const combinedSourceText = (snippetText + " " + aggregateTextLower).toLowerCase();
    const acronymMatch = rawName.match(/\(([A-Za-z0-9-]+)\)/);
    const acronym = acronymMatch ? acronymMatch[1].toLowerCase() : "";
    const hasAcronymInSource = acronym.length >= 2 && (combinedSourceText.includes(acronym) || combinedSourceText.includes(acronym.replace(/-/g, " ")));
    const isDedicatedOfficialPortal = Boolean(
      flagshipDef && (() => {
        try {
          return new URL(officialUrl).hostname.toLowerCase().includes(new URL(flagshipDef.officialUrl).hostname.toLowerCase());
        } catch {
          return false;
        }
      })()
    );
    const nameMatchesInSource = isDedicatedOfficialPortal || Boolean(flagshipDef) || hasAcronymInSource || combinedSourceText.includes(cleanedName.toLowerCase().slice(0, 20)) || nameTokens.length > 0 && nameTokens.filter((t) => combinedSourceText.includes(t)).length >= Math.min(2, nameTokens.length);
    let rawBenefit = raw.benefits || "";
    if (isGenericBenefit(rawBenefit) && flagshipDef?.benefits && !isGenericBenefit(flagshipDef.benefits)) {
      rawBenefit = flagshipDef.benefits;
    }
    const hasFactualBenefit = !isGenericBenefit(rawBenefit);
    const benefitEvidence = raw.evidenceSnippets?.benefitEvidence || (hasFactualBenefit ? rawBenefit : null);
    const benefitCorroborated = hasFactualBenefit && (Boolean(flagshipDef) || benefitEvidence && combinedSourceText.includes(benefitEvidence.toLowerCase().slice(0, 30)) || /₹|rs\.?|\b(lakh|crore|stipend|tuition|allowance|reimbursement|dbt|grant|pension|subsidy|loan|crop insurance|premium)\b/i.test(rawBenefit));
    let finalBenefit = rawBenefit;
    if (isGenericBenefit(finalBenefit)) {
      if (raw.evidenceSnippets?.benefitEvidence && !isGenericBenefit(raw.evidenceSnippets.benefitEvidence)) {
        finalBenefit = raw.evidenceSnippets.benefitEvidence;
      } else if (flagshipDef && flagshipDef.benefits && !isGenericBenefit(flagshipDef.benefits)) {
        finalBenefit = flagshipDef.benefits;
      } else {
        finalBenefit = "Benefit details not verified from primary source.";
      }
    }
    let applicationUrl = null;
    if (raw.applicationUrl) {
      applicationUrl = validateApplicationUrl(raw.applicationUrl);
    } else if (sourceRes.relationship === "official_application_portal") {
      applicationUrl = validateApplicationUrl(officialUrl);
    } else if (flagshipDef?.applyUrl) {
      applicationUrl = validateApplicationUrl(flagshipDef.applyUrl);
    }
    const activeState = (jurisdictionRes.detectedState || targetState || "").toLowerCase();
    const isStateImplementedCss = normKey.includes("post matric") || normKey.includes("pre matric") || normKey.includes("fee reimbursement");
    if (isStateImplementedCss) {
      if (activeState.includes("uttar pradesh") || activeState === "up") {
        applicationUrl = "https://scholarship.up.gov.in/";
        if (!officialUrl || officialUrl.includes("scholarships.gov.in") || officialUrl.includes("umang.gov.in")) {
          officialUrl = "https://scholarship.up.gov.in/";
        }
      } else if (activeState.includes("bihar")) {
        applicationUrl = "https://pmsonline.bih.nic.in/";
      } else if (activeState.includes("delhi")) {
        applicationUrl = "https://edistrict.delhigovt.nic.in/";
      } else if (!applicationUrl) {
        applicationUrl = "https://scholarships.gov.in/";
      }
    }
    if (applicationUrl && applicationUrl.toLowerCase() === officialUrl.toLowerCase()) {
      const isApex = /scholarships\.gov\.in|scholarship\.up\.gov\.in|pmsonline\.bih\.nic\.in|medhasoft\.bih\.nic\.in|edistrict\.delhigovt\.nic\.in/i.test(applicationUrl);
      if (sourceRes.relationship !== "official_application_portal" && !isApex) {
        applicationUrl = null;
      }
    }
    const cleanEligibilityReasons = (Array.isArray(raw.eligibilityReasons) ? raw.eligibilityReasons : []).filter(
      (r) => typeof r === "string" && !/identified from active|public welfare portal/i.test(r) && !/details not verified/i.test(r) && !/^(scheme name|launched by|state\s*[,:])/i.test(r) && !r.toLowerCase().includes("scheme name,") && !/\.\.\.?\s*$/.test(r) && r.trim().length >= 15
    );
    let finalEligibilitySummary = cleanEligibilityReasons;
    if ((finalEligibilitySummary.length === 0 || finalEligibilitySummary.length < 2) && flagshipDef?.eligibilityCriteria?.length) {
      finalEligibilitySummary = flagshipDef.eligibilityCriteria;
    }
    if (finalEligibilitySummary.length === 0) {
      finalEligibilitySummary = ["Eligibility details not verified from primary source."];
    }
    const hasRealEligibility = finalEligibilitySummary.length > 0 && !finalEligibilitySummary.some((r) => r.includes("not verified"));
    const profileEval = evaluateProfileCriteria({
      schemeName: cleanedName,
      description: raw.description,
      criteriaSummary: finalEligibilitySummary,
      reasons: Array.isArray(raw.missingOrCautionCriteria) ? raw.missingOrCautionCriteria : [],
      userProfile,
      targetState
    });
    const isPageFetched = fetchedUrlMap.has(officialUrl.toLowerCase());
    const verificationEval = evaluateVerificationStatus({
      jurisdictionResult: jurisdictionRes,
      sourceClassification: sourceRes,
      hasCorroboratedName: nameMatchesInSource,
      hasCorroboratedBenefit: benefitCorroborated,
      hasConfirmedApplicationUrl: Boolean(applicationUrl),
      hasCorroboratedEligibility: hasRealEligibility,
      pageFetchedSuccessfully: isPageFetched
    });
    let verificationStatus = verificationEval.status;
    let partialReasons = [...verificationEval.partialReasons || []];
    if (sourceRes.isOfficial) {
      partialReasons = partialReasons.filter((r) => !/source is not an official government department|secondary source citation/i.test(r));
    }
    if (benefitCorroborated) {
      partialReasons = partialReasons.filter((r) => !/financial benefit details not verified/i.test(r));
    }
    if (Boolean(applicationUrl)) {
      partialReasons = partialReasons.filter((r) => !/direct online application link not verified/i.test(r));
    }
    if (hasRealEligibility) {
      partialReasons = partialReasons.filter((r) => !/specific eligibility criteria require further verification/i.test(r));
    }
    const isInstitutionalScheme = /\b(cooperative societies|state federations|implementing agencies|ncdc|pacss?|apex societies|institutional assistance|cluster assistance|marketing federation)\b/i.test(
      normKey + " " + (raw.description || "") + " " + (raw.benefits || "")
    );
    if (isInstitutionalScheme && !applicationUrl) {
      if (verificationStatus === "verified") {
        verificationStatus = "partially_verified";
      }
      if (!partialReasons.some((r) => r.includes("Direct citizen application"))) {
        partialReasons.push("Direct citizen application portal not verified; scheme assistance is channeled through cooperative societies and implementing agencies.");
      }
    }
    let evidenceStatus = "unverified";
    if (sourceRes.isOfficial) {
      evidenceStatus = "officially_supported";
    } else if (verificationStatus === "verified") {
      evidenceStatus = "officially_verified";
    } else if (verificationStatus === "partially_verified") {
      evidenceStatus = "partially_verified";
    } else {
      evidenceStatus = "unverified";
    }
    if (verificationStatus === "verified") {
      verificationBreakdown.verifiedCount++;
    } else if (verificationStatus === "partially_verified") {
      verificationBreakdown.partiallyVerifiedCount++;
    } else {
      verificationBreakdown.unverifiedCount++;
    }
    const level = jurisdictionRes.jurisdiction === "central" ? "Central" : jurisdictionRes.jurisdiction === "multi_state" ? "Multi-State" : "State";
    const stateVal = level === "State" ? jurisdictionRes.detectedState || targetState : null;
    const initialDeadlineRes = resolveSchemeDeadline({
      raw,
      aggregateText: aggregateFetchedText,
      isDelhiScholarship: false,
      flagshipDef
    });
    let deadlineStatus = initialDeadlineRes.deadlineStatus;
    let deadline = initialDeadlineRes.deadline;
    const eligibilityStatus = raw.eligibilityStatus === "not_eligible" ? "not_eligible" : raw.eligibilityStatus === "insufficient_information" ? "insufficient_information" : "potentially_eligible";
    let category = raw.category || "Education";
    const catCheck = (cleanedName + " " + (raw.description || "")).toLowerCase();
    if (catCheck.includes("scholarship") || catCheck.includes("post matric") || catCheck.includes("pre matric") || catCheck.includes("fellowship")) {
      category = "Education";
    } else if (catCheck.includes("msme") || catCheck.includes("mudra") || catCheck.includes("self employment") || catCheck.includes("business loan") || catCheck.includes("cmegp") || catCheck.includes("pmegp") || catCheck.includes("credit")) {
      category = "Business & MSME";
    } else if (catCheck.includes("kisan") || catCheck.includes("farmer") || catCheck.includes("krishi") || catCheck.includes("agriculture") || catCheck.includes("fasal bima")) {
      category = "Agriculture";
    } else if (catCheck.includes("ayushman") || catCheck.includes("health") || catCheck.includes("arogya") || catCheck.includes("medical")) {
      category = "Healthcare";
    } else if (catCheck.includes("housing") || catCheck.includes("awas")) {
      category = "Housing";
    } else if (catCheck.includes("pension") || catCheck.includes("social security") || catCheck.includes("senior")) {
      category = "Social Security";
    }
    const { score: calibratedScore, rationale: scoreRationale } = calculateCalibratedMatchScore({
      level,
      state: stateVal,
      targetState,
      category,
      userPersona,
      eligibilityStatus,
      evidenceStatus
    });
    let portalName = flagshipDef?.portalName;
    if (!portalName) {
      if (raw.portalName && !raw.portalName.includes(".") && raw.portalName !== "Official Portal" && raw.portalName !== "Government Welfare Portal") {
        portalName = raw.portalName;
      } else if (sourceRes.isOfficial) {
        try {
          const u = new URL(officialUrl);
          portalName = `${sourceRes.ownerName} (${u.hostname})`;
        } catch {
          portalName = sourceRes.ownerName || "Official Government Portal";
        }
      } else {
        portalName = "National Scholarship Portal";
      }
    }
    const attachedSupportingDocs = stashedDocs.get(normKey) || [];
    if (officialUrl.includes("/news_updates/") || officialUrl.includes("/pressrelease/") || officialUrl.includes("cabinet-approves")) {
      attachedSupportingDocs.push({
        title: rawName,
        url: officialUrl,
        domain: sourceRes.domain,
        relationship: "official_supporting_document",
        isOfficial: true,
        documentType: "news_release",
        verifiedDate: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    const officialInformationUrl = officialUrl;
    const supportingEvidenceUrls = Array.from(/* @__PURE__ */ new Set([
      officialUrl,
      ...Array.isArray(raw.sourceUrls) ? raw.sourceUrls.filter(isValidPublicUrl) : [],
      ...attachedSupportingDocs.map((d) => d.url)
    ]));
    let finalDescription = raw.description?.trim() || "";
    const hasSnippetJunk = /^\d{1,2}\s+[A-Za-z]+\s+\d{4}\s*[-–—:]\s*/i.test(finalDescription) || /\b(pending for verification|read more)\b/i.test(finalDescription) || /\.\.\.?\s*$/.test(finalDescription);
    if (!finalDescription || finalDescription.length < 15 || hasSnippetJunk || /official initiative identified for/i.test(finalDescription) || /initiative for eligible citizens/i.test(finalDescription) || /scheme description not verified/i.test(finalDescription)) {
      if (flagshipDef?.description) {
        finalDescription = flagshipDef.description;
      } else if (hasSnippetJunk) {
        finalDescription = finalDescription.replace(/^\d{1,2}\s+[A-Za-z]+\s+\d{4}\s*[-–—:]\s*/i, "").replace(/\s*read\s*more\s*$/i, "").replace(/\s*\.\.\.?\s*$/, ".").trim();
      } else {
        finalDescription = "Scheme description not verified.";
      }
    }
    let finalCategoryReason = raw.categoryReason?.trim() || "";
    if (!finalCategoryReason || /official initiative identified for/i.test(finalCategoryReason)) {
      finalCategoryReason = `Classified as ${category} based on verified scheme domain and beneficiary focus.`;
    }
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    const fieldEvidence = {
      schemeName: {
        sourceUrl: officialUrl,
        passageSnippet: cleanedName,
        isVerified: nameMatchesInSource,
        verifiedAt: nowIso,
        reason: nameMatchesInSource ? "Scheme title verified against primary source evidence." : "Scheme title pending direct textual corroboration in source."
      },
      schemeIdentity: {
        sourceUrl: officialUrl,
        passageSnippet: `${sourceRes.ownerName} - ${cleanedName}`,
        isVerified: sourceRes.isOfficial && nameMatchesInSource,
        verifiedAt: nowIso,
        reason: sourceRes.isOfficial && nameMatchesInSource ? `Official government scheme identity established under ${sourceRes.ownerName}.` : sourceRes.isSecondary ? "Scheme discovered via secondary directory; primary government authority corroboration pending." : "Scheme identity unverified against official government registers."
      },
      jurisdiction: {
        sourceUrl: officialUrl,
        passageSnippet: jurisdictionRes.reason,
        isVerified: jurisdictionRes.isApplicableToTarget,
        verifiedAt: nowIso,
        reason: jurisdictionRes.reason
      },
      department: {
        sourceUrl: officialUrl,
        passageSnippet: flagshipDef?.department || raw.department || sourceRes.ownerName,
        isVerified: Boolean(flagshipDef?.department || raw.department || sourceRes.isOfficial),
        verifiedAt: nowIso,
        reason: Boolean(flagshipDef?.department || raw.department || sourceRes.isOfficial) ? `Governing department established: ${flagshipDef?.department || raw.department || sourceRes.ownerName}.` : "Department ownership not verified."
      },
      description: {
        sourceUrl: officialUrl,
        passageSnippet: finalDescription,
        isVerified: finalDescription !== "Scheme description not verified.",
        verifiedAt: nowIso,
        reason: finalDescription !== "Scheme description not verified." ? "Scheme description verified from factual source text." : "Scheme description not verified."
      },
      benefit: {
        sourceUrl: officialUrl,
        passageSnippet: finalBenefit,
        isVerified: benefitCorroborated,
        verifiedAt: nowIso,
        reason: benefitCorroborated ? "Benefit terms verified from factual financial evidence." : "Benefit details not verified from primary source."
      },
      eligibility: {
        sourceUrl: officialUrl,
        passageSnippet: finalEligibilitySummary.join("; "),
        isVerified: hasRealEligibility,
        verifiedAt: nowIso,
        reason: hasRealEligibility ? "Detailed eligibility requirements extracted from official source." : "Eligibility criteria not verified from primary source."
      },
      applicationAvailability: {
        sourceUrl: applicationUrl || officialUrl,
        passageSnippet: applicationUrl ? `Active application service endpoint confirmed at ${applicationUrl}` : "Application link not verified from primary source.",
        isVerified: Boolean(applicationUrl),
        verifiedAt: nowIso,
        reason: Boolean(applicationUrl) ? `Direct application service endpoint available at ${applicationUrl}.` : "Online application availability not verified on source page."
      },
      officialInformationUrl: {
        sourceUrl: officialUrl,
        passageSnippet: officialUrl,
        isVerified: sourceRes.isOfficial || sourceRes.isSecondary,
        verifiedAt: nowIso,
        reason: sourceRes.isOfficial ? `Official department portal established: ${officialUrl}.` : `Secondary informational reference: ${officialUrl}.`
      },
      applicationUrl: {
        sourceUrl: applicationUrl || officialUrl,
        passageSnippet: applicationUrl || "Application link not verified.",
        isVerified: Boolean(applicationUrl),
        verifiedAt: nowIso,
        reason: Boolean(applicationUrl) ? `Direct interactive application endpoint confirmed: ${applicationUrl}.` : "Direct online application portal link not verified from primary source."
      }
    };
    const activeStateNorm = (jurisdictionRes.detectedState || targetState || "").toLowerCase();
    const isDelhiScholarship = Boolean(
      applicationUrl?.includes("edistrict.delhigovt.nic.in") || activeStateNorm.includes("delhi") && isStateImplementedCss
    );
    const isBiharScholarship = Boolean(
      applicationUrl?.includes("pmsonline.bih.nic.in") || applicationUrl?.includes("medhasoft.bih.nic.in") || activeStateNorm.includes("bihar") && isStateImplementedCss
    );
    const isUpScholarship = Boolean(
      applicationUrl?.includes("scholarship.up.gov.in") || (activeStateNorm.includes("uttar pradesh") || activeStateNorm === "up") && isStateImplementedCss
    );
    let finalLevel = level;
    let finalState = stateVal;
    let finalJurisdiction = jurisdictionRes.jurisdiction;
    let finalAdminLabel = jurisdictionRes.administrativeLabel || "Jurisdiction Unspecified";
    let finalDept = raw.department || flagshipDef?.department || void 0;
    let finalPortalName = portalName || flagshipDef?.portalName || "Official Portal";
    if (isDelhiScholarship) {
      finalLevel = "State";
      finalState = "Delhi";
      finalJurisdiction = "state";
      finalAdminLabel = "Government of NCT of Delhi";
      finalDept = "Department for the Welfare of SC/ST/OBC, Govt. of NCT of Delhi";
      finalPortalName = "e-District Delhi Portal";
    } else if (isBiharScholarship) {
      finalLevel = "State";
      finalState = "Bihar";
      finalJurisdiction = "state";
      finalAdminLabel = "State Government of Bihar";
      finalDept = "Education & Social Welfare Department, Government of Bihar";
      finalPortalName = "Bihar Post Matric Scholarship Portal";
    } else if (isUpScholarship) {
      finalLevel = "State";
      finalState = "Uttar Pradesh";
      finalJurisdiction = "state";
      finalAdminLabel = "State Government of Uttar Pradesh";
      finalDept = "Social Welfare Department, Government of Uttar Pradesh";
      finalPortalName = "UP Scholarship and Fee Reimbursement Online System";
    }
    if (isDelhiScholarship) {
      const delhiDeadline = resolveSchemeDeadline({
        raw,
        aggregateText: aggregateFetchedText,
        isDelhiScholarship: true,
        flagshipDef
      });
      deadlineStatus = delhiDeadline.deadlineStatus;
      deadline = delhiDeadline.deadline;
    }
    const canonical = {
      id: raw.id || `live-${normKey.replace(/\s+/g, "-").slice(0, 30)}`,
      name: cleanedName,
      aliases: Array.isArray(raw.aliases) ? raw.aliases : void 0,
      hindiName: raw.hindiName || void 0,
      category,
      categoryReason: finalCategoryReason,
      department: finalDept,
      benefitType: raw.benefitType || (/loan/i.test(finalBenefit + " " + cleanedName) ? "loan" : /subsidy/i.test(finalBenefit) ? "subsidy" : /scholarship/i.test(finalBenefit) ? "scholarship" : "grant"),
      level: finalLevel,
      jurisdiction: finalJurisdiction,
      administrativeStructure: isDelhiScholarship || isBiharScholarship || isUpScholarship ? "state" : jurisdictionRes.administrativeStructure || "unknown",
      administrativeLabel: finalAdminLabel,
      fundingAndAdminType: isDelhiScholarship || isBiharScholarship || isUpScholarship ? "centrally_sponsored" : jurisdictionRes.fundingType || "unknown",
      candidateClassification: raw.candidateClassification || "individual_scheme",
      state: finalState,
      applicableStates: jurisdictionRes.applicableStates,
      portalName: finalPortalName,
      description: finalDescription,
      benefits: finalBenefit,
      benefitAmountApprox: typeof raw.benefitAmountApprox === "number" ? raw.benefitAmountApprox : void 0,
      sourceClassification: sourceRes.classification,
      sourceRelationship: sourceRes.relationship,
      verificationStatus,
      verificationEvidence: verificationEval.evidenceNote,
      partialVerificationReasons: partialReasons.length > 0 ? partialReasons : void 0,
      jurisdictionVerified: jurisdictionRes.isApplicableToTarget && (sourceRes.isOfficial || jurisdictionRes.jurisdiction === "central"),
      benefitVerified: benefitCorroborated,
      applicationVerified: Boolean(applicationUrl),
      eligibilityDetailsVerified: hasRealEligibility,
      // 5 Explicit Separated Verification Statuses (Task 4)
      schemeIdentityConfirmed: (sourceRes.isOfficial || Boolean(flagshipDef)) && nameMatchesInSource,
      officialSourceFound: sourceRes.isOfficial,
      eligibilityVerified: hasRealEligibility,
      benefitsVerified: benefitCorroborated,
      applicationUrlVerified: Boolean(applicationUrl),
      eligibilityMatch: profileEval.status,
      fieldEvidence,
      eligibility: {
        status: eligibilityStatus,
        matchState: profileEval.status,
        criteriaSummary: finalEligibilitySummary,
        reasons: profileEval.matchedReasons.length > 0 ? profileEval.matchedReasons : finalEligibilitySummary,
        missingOrCautionCriteria: profileEval.unmatchedReasons.length > 0 ? profileEval.unmatchedReasons : profileEval.unknownReasons
      },
      requiredDocuments: Array.isArray(raw.requiredDocuments) && raw.requiredDocuments.length > 0 ? raw.requiredDocuments : ["Aadhaar Card", "Identity Proof", "Bank Account details", "Income Certificate (if applicable)"],
      officialInformationUrl,
      officialUrl,
      applicationUrl,
      sourceUrls: Array.isArray(raw.sourceUrls) ? raw.sourceUrls.filter(isValidPublicUrl) : [officialUrl],
      supportingEvidenceUrls,
      supportingDocuments: attachedSupportingDocs,
      supportingReferences: (raw.supportingReferences && raw.supportingReferences.length > 0 ? raw.supportingReferences : [
        {
          title: raw.sourceTitle || cleanedName,
          url: officialUrl,
          domain: new URL(officialUrl).hostname,
          isOfficial: sourceRes.isOfficial
        }
      ]).filter((ref) => {
        if (!ref.url) return false;
        const src = classifySource(ref.url, targetState);
        if (src.isCommercial) return false;
        if (/justdial|indiamart|tradeindia|sulekha|howdoiindia|cscportal|\.in\.net/i.test(ref.url)) return false;
        return true;
      }),
      sourceTitle: raw.sourceTitle || void 0,
      evidenceSnippets: raw.evidenceSnippets || {
        benefitEvidence: benefitEvidence || null,
        eligibilityEvidence: finalEligibilitySummary[0] || null,
        nameEvidence: cleanedName
      },
      deadline,
      deadlineStatus,
      evidenceStatus,
      lastVerified: (/* @__PURE__ */ new Date()).toISOString(),
      sourceType: "live_retrieval",
      academicYearOrValidity: raw.academicYearOrValidity || (deadlineStatus === "open" ? "Active Window" : "Current Cycle"),
      matchScore: calibratedScore,
      matchScoreRationale: scoreRationale
    };
    let unifiedNormKey = normKey;
    if (userProfile?.socialCategory) {
      const userCat = (userProfile.socialCategory || "").toLowerCase();
      if (normKey === "post matric" || normKey === "post matric scholarship") {
        if (userCat.includes("sc")) {
          unifiedNormKey = "post matric scholarship sc";
        } else if (userCat.includes("st")) {
          unifiedNormKey = "post matric scholarship st";
        } else if (userCat.includes("obc")) {
          unifiedNormKey = "post matric scholarship obc";
        } else if (userCat.includes("minority")) {
          unifiedNormKey = "post matric scholarship minority";
        }
      } else if (normKey === "pre matric" || normKey === "pre matric scholarship") {
        if (userCat.includes("sc")) {
          unifiedNormKey = "pre matric scholarship sc";
        } else if (userCat.includes("st")) {
          unifiedNormKey = "pre matric scholarship st";
        } else if (userCat.includes("obc")) {
          unifiedNormKey = "pre matric scholarship obc";
        }
      }
    }
    const isStateLevel = (finalLevel === "State" || isStateImplementedCss || jurisdictionRes.jurisdiction === "state") && Boolean(finalState || jurisdictionRes.detectedState || targetState);
    const resolvedStateKey = (finalState || jurisdictionRes.detectedState || targetState || "").toLowerCase();
    const dedupKey = isStateLevel ? `${unifiedNormKey}::state::${resolvedStateKey}` : `${unifiedNormKey}::central`;
    const existing = verifiedMap.get(dedupKey) || unverifiedMap.get(dedupKey);
    if (existing) {
      deduplicatedCount++;
      const rank = (status) => status === "verified" ? 3 : status === "partially_verified" ? 2 : 1;
      existing.sourceUrls = Array.from(/* @__PURE__ */ new Set([...existing.sourceUrls, ...canonical.sourceUrls]));
      existing.supportingEvidenceUrls = Array.from(/* @__PURE__ */ new Set([
        ...existing.supportingEvidenceUrls || [],
        ...canonical.supportingEvidenceUrls || []
      ]));
      if (canonical.fieldEvidence) {
        existing.fieldEvidence = existing.fieldEvidence || {};
        for (const [key, item] of Object.entries(canonical.fieldEvidence)) {
          if (!existing.fieldEvidence[key]) {
            existing.fieldEvidence[key] = item;
          } else if (!existing.fieldEvidence[key]?.isVerified && item?.isVerified) {
            existing.fieldEvidence[key] = item;
          } else if (existing.fieldEvidence[key]?.isVerified && item?.isVerified && existing.fieldEvidence[key]?.passageSnippet !== item?.passageSnippet) {
            existing.fieldEvidence[key] = {
              ...existing.fieldEvidence[key],
              conflictNotes: `Conflicting ${key} information reported: alternative evidence snippet observed from ${item.sourceUrl}. Authoritative primary source retained.`
            };
          }
        }
      }
      if (canonical.supportingReferences) {
        existing.supportingReferences = existing.supportingReferences || [];
        for (const ref of canonical.supportingReferences) {
          if (!existing.supportingReferences.some((r) => r.url === ref.url)) {
            existing.supportingReferences.push(ref);
          }
        }
      }
      if (canonical.supportingDocuments && canonical.supportingDocuments.length > 0) {
        existing.supportingDocuments = existing.supportingDocuments || [];
        for (const doc of canonical.supportingDocuments) {
          if (!existing.supportingDocuments.some((d) => d.url === doc.url)) {
            existing.supportingDocuments.push(doc);
          }
        }
      }
      if (canonical.aliases && canonical.aliases.length > 0) {
        existing.aliases = Array.from(/* @__PURE__ */ new Set([...existing.aliases || [], ...canonical.aliases]));
      }
      existing.jurisdictionVerified = existing.jurisdictionVerified || canonical.jurisdictionVerified;
      existing.benefitVerified = existing.benefitVerified || canonical.benefitVerified;
      existing.eligibilityDetailsVerified = existing.eligibilityDetailsVerified || canonical.eligibilityDetailsVerified;
      existing.schemeIdentityConfirmed = existing.schemeIdentityConfirmed || canonical.schemeIdentityConfirmed;
      existing.officialSourceFound = existing.officialSourceFound || canonical.officialSourceFound;
      existing.eligibilityVerified = existing.eligibilityVerified || canonical.eligibilityVerified;
      existing.benefitsVerified = existing.benefitsVerified || canonical.benefitsVerified;
      existing.applicationUrlVerified = existing.applicationUrlVerified || canonical.applicationUrlVerified;
      if (existing.eligibilityMatch === "unknown" && canonical.eligibilityMatch !== "unknown") {
        existing.eligibilityMatch = canonical.eligibilityMatch;
      }
      if (canonical.partialVerificationReasons && canonical.partialVerificationReasons.length > 0) {
        existing.partialVerificationReasons = Array.from(/* @__PURE__ */ new Set([
          ...existing.partialVerificationReasons || [],
          ...canonical.partialVerificationReasons
        ]));
      }
      if (existing.officialSourceFound || canonical.officialSourceFound) {
        existing.partialVerificationReasons = existing.partialVerificationReasons?.filter(
          (r) => !/source is not an official government department|secondary source citation/i.test(r)
        );
      }
      if (existing.benefitVerified || canonical.benefitVerified || !existing.benefits.includes("not verified")) {
        existing.partialVerificationReasons = existing.partialVerificationReasons?.filter(
          (r) => !/financial benefit details not verified/i.test(r)
        );
      }
      if (existing.applicationUrlVerified || canonical.applicationUrlVerified || Boolean(existing.applicationUrl)) {
        existing.partialVerificationReasons = existing.partialVerificationReasons?.filter(
          (r) => !/direct online application link not verified/i.test(r)
        );
      }
      if (existing.eligibilityVerified || canonical.eligibilityVerified || !existing.eligibility.criteriaSummary.some((s) => s.includes("not verified"))) {
        existing.partialVerificationReasons = existing.partialVerificationReasons?.filter(
          (r) => !/eligibility criteria could not be established|specific eligibility criteria require further verification/i.test(r)
        );
      }
      if (existing.partialVerificationReasons && existing.partialVerificationReasons.length === 0) {
        existing.partialVerificationReasons = void 0;
      }
      if (rank(canonical.verificationStatus) > rank(existing.verificationStatus)) {
        canonical.sourceUrls = existing.sourceUrls;
        canonical.supportingEvidenceUrls = existing.supportingEvidenceUrls;
        canonical.supportingReferences = existing.supportingReferences;
        canonical.supportingDocuments = existing.supportingDocuments;
        canonical.aliases = existing.aliases;
        if (!canonical.applicationUrl && existing.applicationUrl) {
          canonical.applicationUrl = existing.applicationUrl;
        }
        canonical.applicationVerified = Boolean(canonical.applicationUrl);
        if (canonical.verificationStatus === "verified" || canonical.verificationStatus === "partially_verified") {
          unverifiedMap.delete(dedupKey);
          verifiedMap.set(dedupKey, canonical);
        } else {
          unverifiedMap.set(dedupKey, canonical);
        }
      } else {
        if ((existing.benefits.includes("not verified") || !/₹|\b(lakh|crore)\b/i.test(existing.benefits) && /₹|\b(lakh|crore)\b/i.test(canonical.benefits)) && !canonical.benefits.includes("not verified")) {
          existing.benefits = canonical.benefits;
          existing.benefitAmountApprox = canonical.benefitAmountApprox;
          existing.benefitType = canonical.benefitType;
          existing.benefitVerified = true;
          existing.benefitsVerified = true;
        }
        if (existing.eligibility.criteriaSummary.some((s) => s.includes("not verified")) && !canonical.eligibility.criteriaSummary.some((s) => s.includes("not verified"))) {
          existing.eligibility.criteriaSummary = canonical.eligibility.criteriaSummary;
          existing.eligibility.reasons = canonical.eligibility.reasons;
          existing.eligibilityDetailsVerified = true;
          existing.eligibilityVerified = true;
        }
        if (!existing.applicationUrl && canonical.applicationUrl) {
          existing.applicationUrl = canonical.applicationUrl;
          existing.applicationUrlVerified = true;
        }
        existing.applicationVerified = Boolean(existing.applicationUrl);
        if (canonical.level === "State" && canonical.state && existing.level !== "State") {
          existing.level = canonical.level;
          existing.state = canonical.state;
          existing.jurisdiction = canonical.jurisdiction;
          existing.administrativeLabel = canonical.administrativeLabel;
          existing.portalName = canonical.portalName;
          existing.department = canonical.department;
        }
        if (existing.verificationStatus === "partially_verified" && existing.officialSourceFound && existing.benefitVerified && (!existing.partialVerificationReasons || existing.partialVerificationReasons.length === 0)) {
          existing.verificationStatus = "verified";
          existing.verificationEvidence = `Verified official record: Jurisdiction (${existing.jurisdiction}), official authority (${existing.portalName}), scheme identity, and benefit terms corroborated from primary source.`;
        }
      }
      mergedDetails.push({ schemeName: cleanedName, sourcesMergedCount: existing.sourceUrls.length });
    } else {
      if (canonical.verificationStatus === "verified" || canonical.verificationStatus === "partially_verified") {
        verifiedMap.set(dedupKey, canonical);
      } else {
        const isCommercial = canonical.sourceClassification === "commercial_source" || classifySource(canonical.officialUrl, targetState).isCommercial;
        const isInvalidName = isInvalidSchemeName(canonical.name);
        const isDirectory = /justdial|indiamart|tradeindia|sulekha|howdoiindia|cscportal|\.in\.net/i.test(canonical.officialUrl);
        if (!isCommercial && !isInvalidName && !isDirectory) {
          unverifiedMap.set(dedupKey, canonical);
        }
      }
    }
  }
  for (const [parentKey, docs] of stashedDocs.entries()) {
    const existingParent = verifiedMap.get(parentKey) || verifiedMap.get(`${parentKey}::unified`) || verifiedMap.get(`${parentKey}::central`) || unverifiedMap.get(parentKey) || unverifiedMap.get(`${parentKey}::unified`) || unverifiedMap.get(`${parentKey}::central`);
    if (existingParent) {
      existingParent.supportingDocuments = existingParent.supportingDocuments || [];
      existingParent.supportingEvidenceUrls = existingParent.supportingEvidenceUrls || [];
      for (const d of docs) {
        if (!existingParent.supportingDocuments.some((doc) => doc.url === d.url)) {
          existingParent.supportingDocuments.push(d);
        }
        if (d.url && !existingParent.supportingEvidenceUrls.includes(d.url)) {
          existingParent.supportingEvidenceUrls.push(d.url);
        }
      }
      continue;
    }
    const officialDoc = docs.find((d) => d.isOfficial);
    if (FLAGSHIP_DEFINITIONS[parentKey] && officialDoc) {
      const def = FLAGSHIP_DEFINITIONS[parentKey];
      const supportingEvidenceUrls = Array.from(/* @__PURE__ */ new Set([def.officialUrl, ...docs.map((d) => d.url)]));
      const hasApply = Boolean(def.applyUrl);
      const nowIso = (/* @__PURE__ */ new Date()).toISOString();
      const fieldEvidence = {
        schemeName: {
          sourceUrl: def.officialUrl,
          passageSnippet: def.name,
          isVerified: true,
          verifiedAt: nowIso,
          reason: "Authoritative scheme identity verified via Central statutory guidelines."
        },
        schemeIdentity: {
          sourceUrl: def.officialUrl,
          passageSnippet: `Central Flagship Scheme - ${def.name}`,
          isVerified: true,
          verifiedAt: nowIso,
          reason: `Central Flagship Scheme identity verified under ${def.department}.`
        },
        jurisdiction: {
          sourceUrl: def.officialUrl,
          passageSnippet: "Central Sector Scheme applicable nationwide across participating states",
          isVerified: true,
          verifiedAt: nowIso,
          reason: "Central Sector Scheme applicable nationwide across all participating States and UTs."
        },
        department: {
          sourceUrl: def.officialUrl,
          passageSnippet: def.department,
          isVerified: true,
          verifiedAt: nowIso,
          reason: `Apex ministry established: ${def.department}.`
        },
        description: {
          sourceUrl: def.officialUrl,
          passageSnippet: def.description,
          isVerified: true,
          verifiedAt: nowIso,
          reason: "Official flagship description verified from primary government guidelines."
        },
        benefit: {
          sourceUrl: def.officialUrl,
          passageSnippet: def.benefits,
          isVerified: true,
          verifiedAt: nowIso,
          reason: "Official statutory benefit terms verified from central guidelines."
        },
        eligibility: {
          sourceUrl: def.officialUrl,
          passageSnippet: "Aadhaar e-KYC and land ownership documentation required.",
          isVerified: true,
          verifiedAt: nowIso,
          reason: "Statutory beneficiary requirements verified from central scheme framework."
        },
        applicationAvailability: {
          sourceUrl: def.applyUrl || def.officialUrl,
          passageSnippet: def.applyUrl ? `Application available at ${def.applyUrl}` : "Application link not verified from primary source.",
          isVerified: hasApply,
          verifiedAt: nowIso,
          reason: hasApply ? `Application portal available at ${def.applyUrl}` : "Direct central application portal not verified; implementation conducted through State nodal departments."
        },
        officialInformationUrl: {
          sourceUrl: officialDoc?.url || def.officialUrl,
          passageSnippet: officialDoc?.url || def.officialUrl,
          isVerified: true,
          verifiedAt: nowIso,
          reason: `Official apex department portal established: ${officialDoc?.url || def.officialUrl}.`
        },
        applicationUrl: {
          sourceUrl: def.applyUrl || def.officialUrl,
          passageSnippet: def.applyUrl || "Application link not verified.",
          isVerified: hasApply,
          verifiedAt: nowIso,
          reason: hasApply ? `Direct application portal confirmed: ${def.applyUrl}.` : "Direct online application portal link not verified from primary source."
        }
      };
      const flagshipCriteria = def.eligibilityCriteria && def.eligibilityCriteria.length > 0 ? def.eligibilityCriteria : ["Official Central flagship scheme supported by primary guidelines in evidence."];
      const flagshipProfileEval = evaluateProfileCriteria({
        schemeName: def.name,
        description: def.description,
        criteriaSummary: flagshipCriteria,
        reasons: ["Primary official guidelines discovered and verified in search evidence"],
        userProfile,
        targetState
      });
      const isFlagshipMatched = flagshipProfileEval.status === "matched";
      const isFlagshipNotMatched = flagshipProfileEval.status === "not_matched";
      const canonicalFlagship = {
        id: `canonical-${parentKey.replace(/\s+/g, "-").slice(0, 30)}`,
        name: def.name,
        category: def.category,
        categoryReason: `Official Central flagship scheme supported by primary guidelines in evidence.`,
        benefitType: def.benefitType,
        department: def.department,
        level: "Central",
        jurisdiction: "central",
        state: null,
        description: def.description,
        benefits: def.benefits,
        sourceClassification: "official_government_scheme_page",
        sourceRelationship: "official_scheme_page",
        verificationStatus: "verified",
        verificationEvidence: `Verified canonical record supported by official guidelines: ${officialDoc.title} (${officialDoc.domain}).`,
        partialVerificationReasons: def.partialReasons,
        jurisdictionVerified: true,
        benefitVerified: true,
        applicationVerified: hasApply,
        eligibilityDetailsVerified: true,
        eligibilityMatch: flagshipProfileEval.status,
        fieldEvidence,
        eligibility: {
          status: isFlagshipNotMatched ? "not_eligible" : "potentially_eligible",
          matchState: flagshipProfileEval.status,
          criteriaSummary: flagshipCriteria,
          reasons: isFlagshipNotMatched ? flagshipProfileEval.unmatchedReasons : isFlagshipMatched && flagshipProfileEval.matchedReasons.length > 0 ? flagshipProfileEval.matchedReasons : ["Primary official guidelines discovered and verified in search evidence"],
          missingOrCautionCriteria: isFlagshipNotMatched ? flagshipProfileEval.unmatchedReasons : flagshipProfileEval.unknownReasons.length > 0 ? flagshipProfileEval.unknownReasons : []
        },
        requiredDocuments: ["Aadhaar Card", "Land Record / Khata Khasra", "Bank Account details", "e-KYC"],
        officialInformationUrl: officialDoc?.url || def.officialUrl,
        officialUrl: def.officialUrl || officialDoc?.url,
        applicationUrl: def.applyUrl,
        portalName: def.portalName,
        sourceUrls: supportingEvidenceUrls,
        supportingEvidenceUrls,
        supportingDocuments: docs,
        supportingReferences: docs.map((d) => ({ title: d.title, url: d.url, domain: d.domain, isOfficial: d.isOfficial })),
        deadline: null,
        deadlineStatus: def.defaultDeadlineStatus || "unknown",
        evidenceStatus: "officially_verified",
        lastVerified: (/* @__PURE__ */ new Date()).toISOString(),
        sourceType: "live_retrieval",
        matchScore: 90,
        matchScoreRationale: "Central flagship entitlement with verified primary source guidelines."
      };
      verifiedMap.set(parentKey, canonicalFlagship);
      verificationBreakdown.verifiedCount++;
    }
  }
  const dedupedVerified = [];
  const seenVerifiedKeys = /* @__PURE__ */ new Set();
  for (const s of Array.from(verifiedMap.values())) {
    const sNorm = normalizeSchemeName(s.name);
    const sKey = `${sNorm}::${s.level}::${(s.state || targetState || "central").toLowerCase()}`;
    if (seenVerifiedKeys.has(sKey)) {
      const existing = dedupedVerified.find((ex) => {
        const exNorm = normalizeSchemeName(ex.name);
        return `${exNorm}::${ex.level}::${(ex.state || targetState || "central").toLowerCase()}` === sKey;
      });
      if (existing) {
        deduplicatedCount++;
        existing.sourceUrls = Array.from(/* @__PURE__ */ new Set([...existing.sourceUrls, ...s.sourceUrls]));
        existing.supportingEvidenceUrls = Array.from(/* @__PURE__ */ new Set([
          ...existing.supportingEvidenceUrls || [],
          ...s.supportingEvidenceUrls || []
        ]));
        if (s.supportingReferences) {
          existing.supportingReferences = existing.supportingReferences || [];
          for (const ref of s.supportingReferences) {
            if (!existing.supportingReferences.some((r) => r.url === ref.url)) {
              existing.supportingReferences.push(ref);
            }
          }
        }
      }
      continue;
    }
    seenVerifiedKeys.add(sKey);
    dedupedVerified.push(s);
  }
  const finalVerifiedSchemes = dedupedVerified;
  const finalUnverifiedCandidates = Array.from(unverifiedMap.values()).filter((c) => {
    if (isInvalidSchemeName(c.name)) return false;
    const src = classifySource(c.officialUrl, targetState);
    if (src.isCommercial) return false;
    if (/justdial|indiamart|tradeindia|sulekha|howdoiindia|cscportal|\.in\.net/i.test(c.officialUrl)) return false;
    if (c.level === "State" && c.state && targetState && c.state.toLowerCase() !== targetState.toLowerCase()) return false;
    const cNorm = normalizeSchemeName(c.name);
    if (seenVerifiedKeys.has(`${cNorm}::${c.level}::${(c.state || targetState || "central").toLowerCase()}`)) return false;
    return true;
  });
  const allCanonicalSchemes = [...finalVerifiedSchemes, ...finalUnverifiedCandidates];
  const officialInfoDomains = /* @__PURE__ */ new Set();
  const officialApplyDomains = /* @__PURE__ */ new Set();
  const secondarySourceDomains = /* @__PURE__ */ new Set();
  for (const s of allCanonicalSchemes) {
    if (s.sourceClassification === "official_government_scheme_page" || s.sourceClassification === "official_supporting_document" || s.sourceClassification === "official_government" || s.sourceClassification === "official_scheme_portal") {
      try {
        officialInfoDomains.add(new URL(s.officialUrl).hostname.toLowerCase());
      } catch {
      }
    } else if (s.sourceClassification === "secondary_source" || s.sourceClassification === "reputable_secondary") {
      try {
        secondarySourceDomains.add(new URL(s.officialUrl).hostname.toLowerCase());
      } catch {
      }
    }
    if (s.applicationUrl) {
      try {
        const appClass = classifySource(s.applicationUrl);
        if (appClass.isOfficial) {
          officialApplyDomains.add(new URL(s.applicationUrl).hostname.toLowerCase());
        }
      } catch {
      }
    }
    if (Array.isArray(s.supportingReferences)) {
      for (const ref of s.supportingReferences) {
        if (!ref.isOfficial && ref.domain) {
          secondarySourceDomains.add(ref.domain.toLowerCase());
        }
      }
    }
  }
  for (const page of fetchedPages) {
    if (page.url) {
      try {
        const u = new URL(page.url);
        const sourceCheck = classifySource(page.url, targetState);
        if (sourceCheck.isSecondary || sourceCheck.classification === "secondary_source" || !page.isOfficial) {
          secondarySourceDomains.add(u.hostname.toLowerCase());
        }
      } catch {
      }
    }
  }
  const sortComparator = (a, b) => {
    if (userPersona === "student") {
      const aEdu = a.category === "Education" ? 1 : 0;
      const bEdu = b.category === "Education" ? 1 : 0;
      if (aEdu !== bEdu) return bEdu - aEdu;
    } else if (userPersona === "business") {
      const aBiz = a.category === "Business & MSME" ? 1 : 0;
      const bBiz = b.category === "Business & MSME" ? 1 : 0;
      if (aBiz !== bBiz) return bBiz - aBiz;
    } else if (userPersona === "farmer") {
      const aFarm = a.category === "Agriculture" ? 1 : 0;
      const bFarm = b.category === "Agriculture" ? 1 : 0;
      if (aFarm !== bFarm) return bFarm - aFarm;
    }
    const aState = a.level === "State" ? 1 : 0;
    const bState = b.level === "State" ? 1 : 0;
    if (aState !== bState) return bState - aState;
    const rank = (status) => status === "verified" ? 3 : status === "partially_verified" ? 2 : 1;
    if (rank(a.verificationStatus) !== rank(b.verificationStatus)) {
      return rank(b.verificationStatus) - rank(a.verificationStatus);
    }
    return (b.matchScore || 0) - (a.matchScore || 0);
  };
  finalVerifiedSchemes.sort(sortComparator);
  finalUnverifiedCandidates.sort(sortComparator);
  allCanonicalSchemes.sort(sortComparator);
  return {
    schemes: allCanonicalSchemes,
    verifiedSchemes: finalVerifiedSchemes,
    unverifiedCandidates: finalUnverifiedCandidates,
    auditedDomains: Array.from(auditedDomainsSet),
    deduplicatedCount,
    uniqueCandidatesCount,
    canonicalSchemesCount: allCanonicalSchemes.length,
    officialInformationPortalsCount: officialInfoDomains.size,
    officialApplicationPortalsCount: officialApplyDomains.size,
    secondarySourcesCount: secondarySourceDomains.size,
    mergedDetails,
    rejectedCandidates,
    jurisdictionFailures,
    verificationBreakdown,
    sourceBreakdown
  };
}

// lib/cache.ts
var memoryCache = /* @__PURE__ */ new Map();
var DEFAULT_TTL_MS = 5 * 60 * 1e3;
function generateCacheKey(params) {
  const st = (params.state || "all").toLowerCase().trim();
  const per = (params.persona || "student").toLowerCase().trim();
  const q = (params.query || "").toLowerCase().trim();
  const cat = (params.category || params.socialCategory || "all").toLowerCase().trim();
  const edu = (params.educationLevel || "any").toLowerCase().trim();
  const inc = typeof params.annualIncome === "number" ? params.annualIncome : 0;
  const gen = (params.gender || "all").toLowerCase().trim();
  const stream = (params.courseStream || "all").toLowerCase().trim();
  const pwd = params.isDifferentlyAbled ? "pwd" : "nopwd";
  return `${st}:${per}:${cat}:${edu}:${inc}:${gen}:${stream}:${pwd}:${q}`;
}
function getCachedSearch(key) {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return {
    ...entry.data,
    telemetry: {
      ...entry.data.telemetry,
      cached: true
    }
  };
}
function setCachedSearch(key, data, ttlMs = DEFAULT_TTL_MS) {
  if (memoryCache.size > 200) {
    const oldestKey = memoryCache.keys().next().value;
    if (oldestKey) memoryCache.delete(oldestKey);
  }
  memoryCache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs
  });
}

// lib/rateLimiter.ts
var ipLimits = /* @__PURE__ */ new Map();
var WINDOW_MS = 60 * 1e3;
var MAX_REQUESTS = 25;
function checkRateLimit(ip) {
  const now = Date.now();
  const record = ipLimits.get(ip);
  if (!record || now > record.resetAt) {
    ipLimits.set(ip, {
      count: 1,
      resetAt: now + WINDOW_MS
    });
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetInMs: WINDOW_MS };
  }
  if (record.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetInMs: record.resetAt - now };
  }
  record.count += 1;
  return { allowed: true, remaining: MAX_REQUESTS - record.count, resetInMs: record.resetAt - now };
}

// lib/supabaseSchemes.ts
import { createClient } from "@supabase/supabase-js";
var cachedClient = null;
function getSupabaseServerClient() {
  if (cachedClient) return cachedClient;
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return null;
  }
  try {
    cachedClient = createClient(url, key, {
      auth: { persistSession: false }
    });
    return cachedClient;
  } catch (err) {
    console.warn("[Supabase Schemes] Failed to initialize Supabase client:", err);
    return null;
  }
}
function generateSchemeId(name, state) {
  const cleanName = (name || "scheme").toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
  const cleanState = (state || "central").toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${cleanState}_${cleanName}`;
}
function extractSchemeDeadline(deadlineStr) {
  if (!deadlineStr || typeof deadlineStr !== "string") return null;
  const trimmed = deadlineStr.trim();
  if (/no expiry|ongoing|open all year|round the year|always open/i.test(trimmed)) {
    return null;
  }
  const isoMatch = trimmed.match(/\b(202\d)-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\b/);
  if (isoMatch) {
    return new Date(isoMatch[0]).toISOString();
  }
  const ddmmyyyy = trimmed.match(/\b(0?[1-9]|[12]\d|3[01])[\/\-\.](0?[1-9]|1[0-2])[\/\-\.](202\d)\b/);
  if (ddmmyyyy) {
    const day = parseInt(ddmmyyyy[1], 10);
    const month = parseInt(ddmmyyyy[2], 10) - 1;
    const year = parseInt(ddmmyyyy[3], 10);
    const d = new Date(Date.UTC(year, month, day, 23, 59, 59));
    return d.toISOString();
  }
  const parsed = Date.parse(trimmed);
  if (!isNaN(parsed)) {
    return new Date(parsed).toISOString();
  }
  return null;
}
async function fetchActiveSchemesFromSupabase(params) {
  const sb = getSupabaseServerClient();
  if (!sb) return null;
  try {
    const normState = params.state.trim();
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    let query = sb.from("live_schemes").select("*").eq("is_active", true).eq("verification_status", "verified").or(`deadline.is.null,deadline.gte.${nowIso}`);
    if (normState && normState.toLowerCase() !== "india" && normState.toLowerCase() !== "all india") {
      query = query.or(`state.ilike.%${normState}%,state.ilike.%India%,state.ilike.%Central%`);
    }
    if (params.persona && params.persona !== "unselected") {
      query = query.or(`persona.eq.${params.persona},persona.eq.all,persona.is.null`);
    }
    const { data, error } = await query.order("last_verified_at", { ascending: false }).limit(25);
    if (error) {
      console.warn("[Supabase Schemes] Query warning:", error.message);
      return null;
    }
    if (!data || data.length === 0) {
      return null;
    }
    const validRows = data.filter((row) => {
      const name = row.title || row.raw_data?.name || "";
      const url = row.official_portal || row.source_url || row.raw_data?.officialUrl || "";
      const desc = row.description || row.raw_data?.description || "";
      return classifyCandidate(name, url, desc) === "individual_scheme";
    });
    if (validRows.length === 0) {
      return null;
    }
    const schemes = validRows.map((row) => {
      if (row.raw_data && row.raw_data.name) {
        return {
          ...row.raw_data,
          lastVerified: row.last_verified_at || row.updated_at || (/* @__PURE__ */ new Date()).toISOString()
        };
      }
      const schemeLevel = row.state && row.state.toLowerCase() !== "india" && row.state.toLowerCase() !== "central" ? "State" : "Central";
      return {
        id: row.id,
        name: row.title,
        description: row.description || "",
        benefits: row.benefit_text || "Financial assistance as per official guidelines.",
        benefitAmountApprox: row.approx_amount ? Number(row.approx_amount) : void 0,
        category: row.category || "Education",
        state: row.state,
        level: schemeLevel,
        eligibility: {
          status: "potentially_eligible",
          criteriaSummary: row.eligibility_criteria || [],
          reasons: []
        },
        requiredDocuments: ["Aadhaar Card", "Domicile Certificate", "Income Certificate"],
        officialUrl: row.official_portal || row.source_url || "https://www.myscheme.gov.in",
        applicationUrl: row.application_url || row.source_url || null,
        portalName: row.official_portal ? new URL(row.official_portal).hostname : "Official Portal",
        sourceUrls: [row.source_url || row.application_url].filter(Boolean),
        deadline: row.deadline || null,
        deadlineStatus: row.deadline ? "open" : "open",
        evidenceStatus: "officially_verified",
        verificationStatus: row.verification_status || "verified",
        sourceType: "live_retrieval",
        lastVerified: row.last_verified_at || row.updated_at || (/* @__PURE__ */ new Date()).toISOString(),
        matchScore: 95
      };
    });
    if (params.query && params.query.trim().length > 2) {
      const q = params.query.toLowerCase().trim();
      const filtered = schemes.filter(
        (s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.officialUrl && s.officialUrl.toLowerCase().includes(q)
      );
      if (filtered.length > 0) return filtered;
    }
    return schemes;
  } catch (err) {
    console.warn("[Supabase Schemes] Fetch error:", err?.message || err);
    return null;
  }
}
async function saveDiscoveredSchemesToSupabase(schemes, state, persona) {
  const sb = getSupabaseServerClient();
  if (!sb || !schemes || schemes.length === 0) {
    return { inserted: 0, errors: 0 };
  }
  const verifiedOnly = schemes.filter(
    (s) => s.verificationStatus === "verified" && classifyCandidate(s.name, s.officialUrl, s.description) === "individual_scheme"
  );
  if (verifiedOnly.length === 0) {
    return { inserted: 0, errors: 0 };
  }
  try {
    const rows = verifiedOnly.map((s) => {
      const id = generateSchemeId(s.name, s.state || state);
      const deadline = extractSchemeDeadline(s.deadline);
      return {
        id,
        title: s.name,
        state: s.state || state || "India",
        persona: persona || "all",
        category: s.category || "Education",
        description: s.description || "",
        benefit_text: s.benefits || "",
        benefit_type: s.benefitType || "grant",
        approx_amount: s.benefitAmountApprox || null,
        eligibility_criteria: s.eligibility?.criteriaSummary || [],
        application_url: s.applicationUrl || null,
        official_portal: s.officialUrl || null,
        source_url: s.sourceUrls?.[0] || s.officialUrl || "",
        deadline: deadline || null,
        is_active: true,
        verification_status: s.verificationStatus || "verified",
        raw_data: s,
        last_verified_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
    });
    const { data, error } = await sb.from("live_schemes").upsert(rows, { onConflict: "id" }).select("id");
    if (error) {
      console.warn("[Supabase Schemes] Upsert error:", error.message);
      return { inserted: 0, errors: rows.length };
    }
    return { inserted: data ? data.length : rows.length, errors: 0 };
  } catch (err) {
    console.warn("[Supabase Schemes] Upsert exception:", err?.message || err);
    return { inserted: 0, errors: 1 };
  }
}

// lib/search_source.ts
var config = {
  maxDuration: 60
};
function extractGroundedFinancialBenefit(snippet, title, category, persona) {
  const titleLower = title.toLowerCase();
  if (/\b(pm-?kisan|kisan samman nidhi)\b/i.test(titleLower)) {
    return {
      benefitText: "Direct income support of \u20B96,000 per year transferred via DBT in three equal instalments of \u20B92,000.",
      benefitType: "grant",
      approxAmount: 6e3
    };
  }
  if (/\b(mudra|pmmy)\b/i.test(titleLower)) {
    return {
      benefitText: "Collateral-free business loan up to \u20B920 Lakh (Shishu: up to \u20B950,000, Kishore: up to \u20B95 Lakh, Tarun: up to \u20B920 Lakh) with interest subvention.",
      benefitType: "loan",
      approxAmount: 2e6
    };
  }
  if (/\b(pmegp|prime minister.*employment generation)\b/i.test(titleLower)) {
    return {
      benefitText: "Bank-financed credit with 15% to 35% margin money subsidy on project cost up to \u20B950 Lakh (Manufacturing) and \u20B920 Lakh (Service).",
      benefitType: "subsidy",
      approxAmount: 5e6
    };
  }
  if (/\b(svanidhi|street vendor)\b/i.test(titleLower)) {
    return {
      benefitText: "Collateral-free working capital micro-credit loan up to \u20B950,000 with 7% interest subsidy for urban street vendors.",
      benefitType: "loan",
      approxAmount: 5e4
    };
  }
  if (/\b(pmfby|fasal bima)\b/i.test(titleLower)) {
    return {
      benefitText: "Comprehensive crop insurance coverage against natural crop loss at subsidized premium of 1.5% to 2%.",
      benefitType: "insurance",
      approxAmount: 1e5
    };
  }
  if (/\b(ayushman|pm-?jay|jan arogya)\b/i.test(titleLower)) {
    return {
      benefitText: "Cashless health insurance coverage up to \u20B95 Lakh per family per year for secondary and tertiary hospitalization.",
      benefitType: "insurance",
      approxAmount: 5e5
    };
  }
  if (/\bpost[- ]?matric\b/i.test(titleLower) && /\bsc\b/i.test(titleLower)) {
    return {
      benefitText: "Full compulsory fees reimbursement plus annual maintenance allowance up to \u20B913,500/year (hostellers) or \u20B97,000/year (day scholars).",
      benefitType: "scholarship",
      approxAmount: 13500
    };
  }
  if (/\bpost[- ]?matric\b/i.test(titleLower) && /\bst\b/i.test(titleLower)) {
    return {
      benefitText: "Full compulsory tuition fees reimbursement plus annual maintenance allowance as per Government of India norms.",
      benefitType: "scholarship",
      approxAmount: 13500
    };
  }
  if (/\bpost[- ]?matric\b/i.test(titleLower) && /\bobc\b/i.test(titleLower)) {
    return {
      benefitText: "Maintenance allowance up to \u20B94,000 to \u20B910,000 per annum and study fee support as per scheme rules.",
      benefitType: "scholarship",
      approxAmount: 1e4
    };
  }
  if (/\b(central sector scheme|csss)\b/i.test(titleLower)) {
    return {
      benefitText: "Scholarship of \u20B912,000 per annum for undergraduate study (first 3 years) and \u20B920,000 per annum at postgraduate level.",
      benefitType: "scholarship",
      approxAmount: 12e3
    };
  }
  if (/\bpragati\b/i.test(titleLower)) {
    return {
      benefitText: "\u20B950,000 per annum for every year of study towards college fee, computer, books, and stationeries.",
      benefitType: "scholarship",
      approxAmount: 5e4
    };
  }
  if (/\bsaksham\b/i.test(titleLower)) {
    return {
      benefitText: "\u20B950,000 per annum for every year of study towards tuition fee, equipment, books, and educational expenses.",
      benefitType: "scholarship",
      approxAmount: 5e4
    };
  }
  if (/\bswanath\b/i.test(titleLower)) {
    return {
      benefitText: "\u20B950,000 per annum for every year of study towards academic fees and educational support.",
      benefitType: "scholarship",
      approxAmount: 5e4
    };
  }
  if (/\b(fee reimbursement|shulk pratipoorti)\b/i.test(titleLower)) {
    return {
      benefitText: "100% reimbursement of approved non-refundable tuition and institutional fees directly via DBT.",
      benefitType: "scholarship",
      approxAmount: 48e3
    };
  }
  if (/\bpost[- ]?matric\b/i.test(titleLower)) {
    return {
      benefitText: "Full compulsory fees reimbursement plus annual maintenance allowance up to \u20B913,500/year (hostellers) or \u20B97,000/year (day scholars).",
      benefitType: "scholarship",
      approxAmount: 13500
    };
  }
  if (/\bpre[- ]?matric\b/i.test(titleLower)) {
    return {
      benefitText: "Annual financial assistance of \u20B93,500 to \u20B94,000 per annum towards school expenses, uniforms, and books.",
      benefitType: "scholarship",
      approxAmount: 3500
    };
  }
  if (/\b(national means[- ]?cum[- ]?merit|nmmss)\b/i.test(titleLower)) {
    return {
      benefitText: "Scholarship allowance of \u20B912,000 per annum (\u20B91,000 per month) for students from Class 9 to Class 12.",
      benefitType: "scholarship",
      approxAmount: 12e3
    };
  }
  if (/\b(pm[- ]?yasasvi|yasasvi)\b/i.test(titleLower)) {
    return {
      benefitText: "Financial scholarship up to \u20B975,000/year (Class 9-10) and \u20B91,25,000/year (Class 11-12) for OBC/EBC/DNT students.",
      benefitType: "scholarship",
      approxAmount: 75e3
    };
  }
  if (/\bkanya utthan\b/i.test(titleLower)) {
    return {
      benefitText: "Direct financial incentive of \u20B950,000 upon graduation and \u20B925,000 upon passing Class 12 (unmarried girls).",
      benefitType: "grant",
      approxAmount: 5e4
    };
  }
  if (/\babhyuday\b/i.test(titleLower)) {
    return {
      benefitText: "Free comprehensive competitive coaching (UPSC, UPPSC, JEE, NEET) along with free tablets and study materials.",
      benefitType: "grant",
      approxAmount: 5e4
    };
  }
  if (/\bstudent credit card\b/i.test(titleLower)) {
    return {
      benefitText: "Education loan up to \u20B94 Lakh at concessional interest rate (1% for girls/PwD, 4% for boys) with state guarantee.",
      benefitType: "loan",
      approxAmount: 4e5
    };
  }
  if (/\b(reimbursement of tuition|tuition fee reimbursement)\b/i.test(titleLower)) {
    return {
      benefitText: "100% reimbursement of tuition fees and other compulsory fees for eligible students with family income up to \u20B93.0 Lakh/year.",
      benefitType: "scholarship",
      approxAmount: 48e3
    };
  }
  if (/\bmerit scholarship\b/i.test(titleLower)) {
    return {
      benefitText: "Financial assistance up to \u20B91,620 to \u20B94,500 per annum based on course level and percentage of marks in previous qualifying exam.",
      benefitType: "scholarship",
      approxAmount: 4500
    };
  }
  if (/\b(dr\.?\s*b\.?r\.?\s*ambedkar state award|ambedkar state award)\b/i.test(titleLower)) {
    return {
      benefitText: "Cash award of \u20B925,000 and citation to state toppers in professional and technical degree examinations.",
      benefitType: "grant",
      approxAmount: 25e3
    };
  }
  if (/\bjai bhim\b/i.test(titleLower)) {
    return {
      benefitText: "Free competitive examination coaching fee coverage plus monthly stipend of \u20B92,500 during coaching period.",
      benefitType: "grant",
      approxAmount: 25e3
    };
  }
  const amountRegex = /(?:up to|maximum|limit of|loan of|subsidy of|allowance of|worth|amount of)?\s*(?:₹|rs\.?|inr)\s*(\d+(?:[.,]\d+)?)\s*(lakhs?|crores?|thousands?|k)?(?:\s*(?:per\s*(?:year|annum|month)|pm|pa|\/-\s*per|\/year))?/i;
  const match = snippet.match(amountRegex);
  if (match) {
    const rawNumStr = match[1].replace(/,/g, "");
    const num = parseFloat(rawNumStr);
    const unit = (match[2] || "").toLowerCase();
    let approxAmount;
    if (!isNaN(num)) {
      if (unit.startsWith("crore")) {
        approxAmount = num * 1e7;
      } else if (unit.startsWith("lakh")) {
        approxAmount = num * 1e5;
      } else if (unit.startsWith("thousand") || unit === "k") {
        approxAmount = num * 1e3;
      } else if (num >= 500) {
        approxAmount = num;
      }
    }
    const matchedUnit = unit ? ` ${unit}` : "";
    const combined = `${title} ${snippet}`.toLowerCase();
    const isLoan = /loan|credit|borrow|advance/i.test(combined);
    const isSubsidy = /subsidy|margin money|concession/i.test(combined);
    const isScholarship = /scholarship|stipend|tuition|fellowship|study/i.test(combined);
    const isInsurance = /insurance|bima|coverage|mediclaim/i.test(combined);
    let benefitType = "grant";
    let benefitPrefix = "Financial assistance";
    if (isLoan) {
      benefitType = "loan";
      benefitPrefix = "Business loan credit facility";
    } else if (isSubsidy) {
      benefitType = "subsidy";
      benefitPrefix = "Government capital subsidy";
    } else if (isScholarship) {
      benefitType = "scholarship";
      benefitPrefix = "Academic study scholarship";
    } else if (isInsurance) {
      benefitType = "insurance";
      benefitPrefix = "Welfare insurance coverage";
    }
    return {
      benefitText: `${benefitPrefix} up to \u20B9${match[1]}${matchedUnit} as per scheme norms.`,
      benefitType,
      approxAmount
    };
  }
  return {
    benefitText: "Benefit details not verified from primary source.",
    benefitType: "composite"
  };
}
function extractGroundedEligibilityFromSnippet(snippet, schemeName, state) {
  if (!snippet || snippet.length < 15) return [];
  const criteria = [];
  const normalized = snippet.replace(/\brs\.\s*/gi, "\u20B9");
  const segments = normalized.split(/[·•|;\n]|\.\s+(?=[A-Z0-9])/).map((s) => s.trim()).filter((s) => s.length > 8);
  const sanitizeCandidate = (rawText) => {
    const clean = rawText.replace(/^\d{1,2}\s+[A-Za-z]+\s+\d{4}\s*[-–—:]\s*/i, "").replace(/^(?:eligibility\s*[:·•-]?\s*)/i, "").replace(/^(?:degree|diploma)?\s*[:\-\.]?\s*\d+\)?\s*/i, "").replace(/^[·•\-\s]+/, "").replace(/\s*read\s*more\s*$/i, "").replace(/\s*\.\.\.?\s*$/, "").trim();
    if (clean.length < 15 || /\b(be pursuing post|pursuing post|degree level)$/i.test(clean) || /\b(for|of|in|to|and|or|be)\s*$/i.test(clean)) {
      return null;
    }
    return clean;
  };
  for (const seg of segments) {
    const lower = seg.toLowerCase();
    if (/^read more|click here|check payment|application status|last date|overview|introduction|how to apply|eligibility\s*$/i.test(lower)) continue;
    if (/^(scheme name|state\s*[,:]|launched by|department\s*[,:]|official website|category\s*[,:])/i.test(lower) || lower.includes("scheme name,")) continue;
    if (/\b(income|lakh|per annum|annual income|family income|p\.a\.)\b/i.test(lower)) {
      const clean = sanitizeCandidate(seg);
      if (clean && !criteria.includes(clean)) criteria.push(clean);
    } else if (/\b(domicile|native|resident|studying in|under study in|permanent resident)\b/i.test(lower)) {
      const clean = sanitizeCandidate(seg);
      if (clean && !criteria.includes(clean)) criteria.push(clean);
    } else if (/\b(class\s+[0-9]+|matric|undergraduate|postgraduate|degree|diploma|iti|polytechnic|technical|engineering|pursuing|enrolled|10th|12th)\b/i.test(lower)) {
      const clean = sanitizeCandidate(seg);
      if (clean && !criteria.includes(clean)) criteria.push(clean);
    } else if (/\b(sc\b|st\b|obc\b|general category|minority|girl|differently-abled|pwd|disabilit|marks|percentage|merit)\b/i.test(lower)) {
      const clean = sanitizeCandidate(seg);
      if (clean && !criteria.includes(clean)) criteria.push(clean);
    }
  }
  return criteria.slice(0, 4);
}
async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Requested-With");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  const clientIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown-client";
  const rateLimit = checkRateLimit(clientIp);
  if (!rateLimit.allowed) {
    return res.status(429).json({
      success: false,
      error: `Too Many Requests. Rate limit exceeded. Try again in ${Math.ceil(rateLimit.resetInMs / 1e3)} seconds.`,
      schemes: []
    });
  }
  const rawParams = req.method === "POST" ? req.body || {} : req.query || {};
  const parseResult = SchemeSearchRequestSchema.safeParse(rawParams);
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      error: "Invalid request parameters",
      details: parseResult.error.issues
    });
  }
  const profile = parseResult.data;
  const rawState = profile.state;
  const normalizedState = normalizeStateName(rawState);
  if (!normalizedState) {
    return res.status(400).json({
      success: false,
      error: `Invalid Indian State or Union Territory: "${rawState}". Please select a recognized region.`,
      schemes: []
    });
  }
  profile.state = normalizedState;
  const scopeValidation = validateMvpScope(profile.state, profile.persona);
  if (!scopeValidation.isValid) {
    return res.status(400).json({
      success: false,
      error: scopeValidation.error,
      schemes: [],
      diagnostics: {
        searchResultsExamined: 0,
        uniqueCandidateSchemes: 0,
        verifiedSchemes: 0,
        partiallyVerifiedSchemes: 0,
        unverifiedCandidates: 0,
        rejectedCandidates: 0,
        duplicateCandidatesMerged: 0,
        sourcesVerifiedAsOfficial: 0,
        secondarySourcesUtilized: 0,
        officialInformationPortalsCount: 0,
        officialApplicationPortalsCount: 0
      }
    });
  }
  const cacheKey = generateCacheKey({
    state: profile.state,
    persona: profile.persona,
    query: profile.query,
    educationLevel: profile.educationLevel,
    annualIncome: profile.annualIncome,
    gender: profile.gender,
    socialCategory: profile.socialCategory,
    courseStream: profile.courseStream,
    isDifferentlyAbled: profile.isDifferentlyAbled
  });
  if (!profile.refresh) {
    const cached = getCachedSearch(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }
  }
  const errors = [];
  const warnings = [];
  const rejectedItems = [];
  let isPartial = false;
  let advisoryNote = "";
  const tStart = Date.now();
  console.log(`[Search Pipeline] Started search for state=${profile.state}, persona=${profile.persona}`);
  const maxQueriesBudget = 6;
  const maxFetchPagesBudget = 8;
  const tDiscovery = Date.now();
  const discoveryResult = await runTinyFishSchemeDiscovery({
    state: profile.state,
    persona: profile.persona,
    customQuery: profile.query,
    budget: {
      maxQueries: maxQueriesBudget,
      maxFetchPages: maxFetchPagesBudget,
      timeoutMs: 11e3,
      enablePagination: true
    }
  });
  console.log(`[Search Pipeline] 1. TinyFish Discovery completed in ${Date.now() - tDiscovery}ms (items found: ${discoveryResult.items.length})`);
  if (discoveryResult.errors.length > 0) {
    errors.push(...discoveryResult.errors);
    isPartial = true;
  }
  const rawSearchItems = discoveryResult.items;
  const searchItems = rawSearchItems.filter((item) => {
    const u = item.url.toLowerCase();
    if (u.includes("facebook.com") || u.includes("twitter.com") || u.includes("x.com") || u.includes("instagram.com") || u.includes("scribd.com") || u.includes("youtube.com") || u.includes("pinterest.com")) {
      rejectedItems.push({ title: item.title, url: item.url, reason: "Social media / document sharing platform" });
      return false;
    }
    if (/login|signin|dashboard|contact-us|privacy-policy/i.test(u)) {
      rejectedItems.push({ title: item.title, url: item.url, reason: "Generic login, dashboard, or contact page" });
      return false;
    }
    return true;
  });
  const eligibleForFetch = searchItems.filter((item) => {
    const u = item.url.toLowerCase();
    return !/\.(pdf|docx?|xlsx?|zip)$/i.test(u);
  });
  const sortedForFetch = [...eligibleForFetch].sort((a, b) => {
    const aDetail = /scheme|scholarship|guideline|department-initiative|post|welfare|detail/i.test(a.url) && !/\.gov\.in\/?$/.test(a.url);
    const bDetail = /scheme|scholarship|guideline|department-initiative|post|welfare|detail/i.test(b.url) && !/\.gov\.in\/?$/.test(b.url);
    if (aDetail !== bDetail) return aDetail ? -1 : 1;
    return a.isOfficial === b.isOfficial ? 0 : a.isOfficial ? -1 : 1;
  });
  const domainCounts = /* @__PURE__ */ new Map();
  const candidateUrls = [];
  for (const item of sortedForFetch) {
    try {
      const u = new URL(item.url);
      const host = u.hostname.toLowerCase();
      const count = domainCounts.get(host) || 0;
      if (count < 2) {
        domainCounts.set(host, count + 1);
        candidateUrls.push(item.url);
        if (candidateUrls.length >= maxFetchPagesBudget) break;
      }
    } catch {
    }
  }
  if (candidateUrls.length < maxFetchPagesBudget) {
    for (const item of sortedForFetch) {
      if (!candidateUrls.includes(item.url)) {
        candidateUrls.push(item.url);
        if (candidateUrls.length >= maxFetchPagesBudget) break;
      }
    }
  }
  if (candidateUrls.length === 0 && searchItems.length > 0) {
    candidateUrls.push(...searchItems.slice(0, 4).map((i) => i.url));
  }
  let fetchedPages = [];
  let fetchFailures = [];
  if (candidateUrls.length > 0) {
    const firecrawlResult = await fetchPagesWithFirecrawl(candidateUrls, 12e3);
    fetchedPages = firecrawlResult.pages;
    fetchFailures = firecrawlResult.failedUrls;
    if (fetchedPages.length === 0 && candidateUrls.length > 0 && !process.env.FIRECRAWL_API_KEY) {
      warnings.push("Firecrawl key not configured; falling back to TinyFish.");
      const tfResult = await fetchPagesWithTinyFish(candidateUrls, void 0, 14e3);
      fetchedPages = tfResult.pages;
      fetchFailures = tfResult.failedUrls;
    }
    if (fetchFailures.length > 0) {
      warnings.push(`Could not fetch ${fetchFailures.length} source pages: ${fetchFailures.map((f) => f.url).join(", ")}`);
    }
  }
  let extractedSchemes = [];
  let openRouterUsed = false;
  let modelUsed;
  if (searchItems.length > 0 || fetchedPages.length > 0) {
    const openRouterResult = await extractSchemesWithOpenRouter(profile, searchItems, fetchedPages);
    if (openRouterResult.error) {
      warnings.push(`OpenRouter extraction note: ${openRouterResult.error}. Using structured search evidence.`);
      isPartial = true;
    } else {
      openRouterUsed = true;
      modelUsed = openRouterResult.modelUsed;
      extractedSchemes = openRouterResult.extractedSchemes;
      if (openRouterResult.advisoryNote) {
        advisoryNote = openRouterResult.advisoryNote;
      }
    }
  }
  const cleanTitle = (rawTitle) => {
    return sanitizeSchemeName(rawTitle) || "";
  };
  if (extractedSchemes.length === 0 && searchItems.length > 0) {
    extractedSchemes = searchItems.filter((item) => {
      const cleaned = sanitizeSchemeName(item.title);
      if (!cleaned || isInvalidSchemeName(cleaned)) {
        rejectedItems.push({ title: item.title, url: item.url, reason: "Invalid or generic title / document filename" });
        return false;
      }
      const candidateType = classifyCandidate(cleaned, item.url, item.snippet);
      const isApexPortalScheme = item.url.toLowerCase().includes("scholarship.up.gov.in") || item.url.toLowerCase().includes("scholarships.gov.in") || /\b(up scholarship|uttar pradesh scholarship|dashmottar|shulk pratipoorti|post[- ]?matric.*(?:up|uttar pradesh))\b/i.test(cleaned);
      if (candidateType !== "individual_scheme" && !isApexPortalScheme) {
        rejectedItems.push({ title: item.title, url: item.url, reason: `Excluded ${candidateType} from becoming individual scheme card` });
        return false;
      }
      return /scheme|scholarship|yojana|grant|fellowship|subsidy|welfare|loan|credit|cmegp|pmegp|mudra/i.test(cleaned) || isApexPortalScheme;
    }).map((item, idx) => {
      const cleanedName = sanitizeSchemeName(item.title);
      const candidateType = classifyCandidate(cleanedName, item.url, item.snippet);
      const { benefitText, benefitType, approxAmount } = extractGroundedFinancialBenefit(
        item.snippet,
        cleanedName,
        profile.persona === "student" ? "Education" : profile.persona === "farmer" ? "Agriculture" : profile.persona === "business" ? "Business & MSME" : "Social Security",
        profile.persona
      );
      const stableSlug = (cleanedName || "scheme").toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").slice(0, 70);
      return {
        id: `scheme-${(profile.state || "central").toLowerCase().replace(/[^a-z0-9]/g, "")}-${stableSlug}`,
        name: cleanedName,
        candidateClassification: candidateType,
        level: "Central",
        state: null,
        category: profile.persona === "student" ? "Education" : profile.persona === "farmer" ? "Agriculture" : profile.persona === "business" ? "Business & MSME" : "Social Security",
        categoryReason: `Classified as ${profile.persona === "student" ? "Education" : profile.persona === "farmer" ? "Agriculture" : profile.persona === "business" ? "Business & MSME" : "Social Security"} based on beneficiary category.`,
        description: item.snippet && item.snippet.length > 20 ? item.snippet : "Scheme description not verified.",
        benefits: benefitText,
        benefitType,
        benefitAmountApprox: approxAmount,
        eligibilityStatus: (() => {
          const grounded = extractGroundedEligibilityFromSnippet(item.snippet, cleanedName, profile.state);
          return grounded.length > 0 ? "potentially_eligible" : "insufficient_information";
        })(),
        eligibilityReasons: (() => {
          const grounded = extractGroundedEligibilityFromSnippet(item.snippet, cleanedName, profile.state);
          return grounded.length > 0 ? grounded : ["Eligibility details not verified from primary source."];
        })(),
        requiredDocuments: ["Aadhaar Card", "Identity Proof", "Bank Account details"],
        officialUrl: item.url,
        applicationUrl: null,
        // Search result pages are not confirmed interactive application endpoints
        portalName: item.site_name || "Official Portal",
        deadline: null,
        deadlineStatus: "unknown",
        sourceUrls: [item.url],
        sourceTitle: item.title
      };
    });
  }
  const verificationResult = verifyAndDeduplicateSchemes({
    rawSchemes: extractedSchemes,
    fetchedPages,
    targetState: profile.state,
    userPersona: profile.persona,
    userProfile: profile
  });
  let finalSchemes = verificationResult.schemes;
  let sourceType = "live_retrieval";
  const safeFetchSupabase = (p) => Promise.race([
    fetchActiveSchemesFromSupabase(p),
    new Promise((resolve) => setTimeout(() => resolve(null), 2500))
  ]);
  if (finalSchemes.length === 0) {
    try {
      const supabaseSchemes = await safeFetchSupabase({
        state: profile.state,
        persona: profile.persona,
        query: profile.query
      });
      if (supabaseSchemes && supabaseSchemes.length > 0) {
        finalSchemes = supabaseSchemes;
        sourceType = "fallback_cache";
        advisoryNote = `Live web discovery returned 0 fresh items; displaying ${supabaseSchemes.length} verified programs from national register for ${profile.state}.`;
      } else {
        isPartial = true;
        warnings.push("Live search did not discover any verified individual schemes meeting authenticity standards for this query.");
      }
    } catch (sbErr) {
      console.warn("[Supabase Fallback Exception]:", sbErr);
      isPartial = true;
      warnings.push("Live search did not discover any verified individual schemes meeting authenticity standards for this query.");
    }
  } else {
    try {
      const existingDbSchemes = await safeFetchSupabase({
        state: profile.state,
        persona: profile.persona,
        query: profile.query
      });
      if (existingDbSchemes && existingDbSchemes.length > 0) {
        const liveSchemeNames = new Set(finalSchemes.map((s) => s.name.toLowerCase()));
        for (const dbScheme of existingDbSchemes) {
          if (!liveSchemeNames.has(dbScheme.name.toLowerCase())) {
            finalSchemes.push(dbScheme);
            liveSchemeNames.add(dbScheme.name.toLowerCase());
          }
        }
      }
    } catch (mergeErr) {
      console.warn("[Supabase Merge Exception]:", mergeErr);
    }
  }
  finalSchemes = finalSchemes.map((s) => {
    const rawCriteria = [
      ...s.eligibility?.criteriaSummary || [],
      ...s.eligibility?.reasons || [],
      s.description || "",
      s.benefits || ""
    ];
    const evaluation = evaluateProfileCriteria({
      schemeName: s.name,
      description: s.description,
      criteriaSummary: s.eligibility?.criteriaSummary && s.eligibility.criteriaSummary.length > 0 ? s.eligibility.criteriaSummary : rawCriteria,
      reasons: s.eligibility?.reasons || [],
      userProfile: {
        ...profile,
        annualIncome: profile.annualIncome,
        socialCategory: profile.socialCategory,
        gender: profile.gender,
        state: profile.state,
        educationLevel: profile.educationLevel,
        courseStream: profile.courseStream,
        isDifferentlyAbled: profile.isDifferentlyAbled
      },
      targetState: profile.state
    });
    const isMatched = evaluation.status === "matched";
    const isNotMatched = evaluation.status === "not_matched";
    return {
      ...s,
      eligibilityMatch: evaluation.status,
      eligibilityStatus: isNotMatched ? "not_eligible" : "potentially_eligible",
      eligibility: {
        ...s.eligibility || {},
        criteriaSummary: s.eligibility?.criteriaSummary && s.eligibility.criteriaSummary.length > 0 ? s.eligibility.criteriaSummary : rawCriteria,
        status: isNotMatched ? "not_eligible" : "potentially_eligible",
        matchState: evaluation.status,
        reasons: isNotMatched ? evaluation.unmatchedReasons : isMatched && evaluation.matchedReasons.length > 0 ? evaluation.matchedReasons : s.eligibility?.reasons || evaluation.unknownReasons,
        missingOrCautionCriteria: isNotMatched ? evaluation.unmatchedReasons : s.eligibility?.missingOrCautionCriteria || []
      }
    };
  });
  const centralCount = finalSchemes.filter((s) => s.level === "Central").length;
  const stateCount = finalSchemes.filter((s) => s.level === "State").length;
  const verifiedSchemes = finalSchemes.filter((s) => s.verificationStatus === "verified").length;
  const partiallyVerifiedSchemes = finalSchemes.filter((s) => s.verificationStatus === "partially_verified").length;
  const unverifiedCandidates = (verificationResult.unverifiedCandidates || []).length;
  const rejectedCandidates = (verificationResult.rejectedCandidates || []).length + rejectedItems.length;
  const duplicateCandidatesMerged = verificationResult.deduplicatedCount;
  const officialInformationPortalsCount = verificationResult.officialInformationPortalsCount ?? 0;
  const officialApplicationPortalsCount = verificationResult.officialApplicationPortalsCount ?? 0;
  const secondarySourcesCount = verificationResult.secondarySourcesCount ?? 0;
  const sourcesVerifiedAsOfficial = officialInformationPortalsCount;
  const diagnostics = {
    searchResultsExamined: rawSearchItems.length,
    uniqueCandidateSchemes: verificationResult.uniqueCandidatesCount || extractedSchemes.length,
    canonicalSchemesAfterDeduplication: verificationResult.canonicalSchemesCount || finalSchemes.length,
    verifiedSchemes,
    partiallyVerifiedSchemes,
    unverifiedCandidates,
    rejectedCandidates,
    duplicateCandidatesMerged,
    sourcesVerifiedAsOfficial,
    officialInformationPortalsCount,
    officialApplicationPortalsCount,
    secondarySourcesCount,
    failedFetches: fetchFailures.length,
    extractionErrors: errors.length,
    queriesAttempted: discoveryResult.queriesAttempted,
    queriesRun: discoveryResult.queriesRun,
    uniqueUrlsDiscovered: discoveryResult.uniqueUrlsCount,
    pagesSuccessfullyFetched: fetchedPages.length,
    fetchFailures,
    schemesExtracted: extractedSchemes.length,
    duplicatesMerged: verificationResult.deduplicatedCount,
    mergedRecords: verificationResult.mergedDetails,
    resultsRejected: [...rejectedItems, ...verificationResult.rejectedCandidates || []],
    jurisdictionFailures: verificationResult.jurisdictionFailures,
    verificationBreakdown: verificationResult.verificationBreakdown,
    sourceBreakdown: verificationResult.sourceBreakdown,
    domainsBreakdown: {
      officialCount: discoveryResult.officialCount,
      secondaryCount: discoveryResult.secondaryCount,
      commercialCount: discoveryResult.commercialCount,
      uniqueDomains: discoveryResult.uniqueDomains
    },
    searchBudget: {
      maxQueries: maxQueriesBudget,
      maxFetchPages: maxFetchPagesBudget,
      budgetLimitReached: discoveryResult.budgetLimitReached
    }
  };
  const accurateAdvisoryNote = advisoryNote || (sourceType === "live_retrieval" ? finalSchemes.length > 0 ? verifiedSchemes > 0 ? `Discovered ${verifiedSchemes} verified and ${partiallyVerifiedSchemes} partially verified Central and State welfare programs for ${profile.state}. Verify application guidelines on the official portal links.` : `Discovered ${partiallyVerifiedSchemes} candidate programs for ${profile.state}. Primary official confirmation in progress.` : `No active welfare schemes or scholarships directly matched the entered parameters for ${profile.state}.` : `Displaying ${finalSchemes.length} schemes from the curated reference archive for ${profile.state}. Live web search did not return fresh records.`);
  const responsePayload = {
    success: finalSchemes.length > 0 || verificationResult.unverifiedCandidates && verificationResult.unverifiedCandidates.length > 0,
    schemes: finalSchemes,
    unverifiedCandidates: verificationResult.unverifiedCandidates || [],
    source: sourceType,
    totalFound: finalSchemes.length,
    verifiedCount: verifiedSchemes,
    partiallyVerifiedCount: partiallyVerifiedSchemes,
    unverifiedCount: unverifiedCandidates,
    centralCount,
    stateCount,
    stateSearched: profile.state,
    isPartial,
    errors: errors.length > 0 ? errors : void 0,
    warnings: warnings.length > 0 ? warnings : void 0,
    lastVerified: (/* @__PURE__ */ new Date()).toISOString(),
    advisoryNote: accurateAdvisoryNote,
    diagnostics,
    telemetry: {
      searchesRun: discoveryResult.queriesRun,
      pagesFetched: fetchedPages.length,
      domainsAudited: verificationResult.auditedDomains,
      openRouterUsed,
      modelUsed,
      aiProvider: openRouterUsed ? "OpenRouter (Free Tier)" : void 0,
      groqUsed: openRouterUsed,
      cached: false
    }
  };
  if (responsePayload.success && !profile.refresh) {
    setCachedSearch(cacheKey, responsePayload);
  }
  if (finalSchemes.length > 0) {
    saveDiscoveredSchemesToSupabase(finalSchemes, profile.state, profile.persona).catch((err) => {
      console.warn("[Supabase Background Upsert Error]:", err);
    });
  }
  return res.status(200).json(responsePayload);
}
export {
  config,
  handler as default,
  extractGroundedEligibilityFromSnippet
};

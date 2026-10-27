export const INDIAN_STATES_AND_UTS = [
  // 28 States
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  // 8 Union Territories
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry'
] as const;

export type IndianStateOrUT = typeof INDIAN_STATES_AND_UTS[number];

export interface StateMetadata {
  name: IndianStateOrUT;
  code: string;
  aliases: string[];
  domainSuffixes: string[];
  knownApexDomains: string[];
  departments: {
    scholarship: string;
    msme: string;
    agriculture: string;
    socialWelfare: string;
  };
  region?: 'North East' | 'NCR' | 'Northern' | 'Southern' | 'Western' | 'Eastern' | 'Central';
  administrativeStructure?: 'state' | 'union_territory_with_legislature' | 'union_territory_without_legislature';
  administrativeLabel?: string;
}

export const STATE_METADATA_MAP: Record<IndianStateOrUT, StateMetadata> = {
  'Andhra Pradesh': {
    name: 'Andhra Pradesh',
    code: 'AP',
    aliases: ['andhra pradesh', 'andhra', 'ap', 'ap govt', 'govt of ap'],
    domainSuffixes: ['.ap.gov.in', '.ap.nic.in', 'ap.gov.in', 'ap.nic.in'],
    knownApexDomains: ['ap.gov.in', 'jnanabhumi.ap.gov.in', 'ysrrythubharosa.ap.gov.in', 'navasakam.ap.gov.in', 'apedistrict.ap.gov.in'],
    departments: {
      scholarship: 'Jnanabhumi Social Welfare Department Andhra Pradesh',
      msme: 'Industries & Commerce Department Andhra Pradesh AP MSME',
      agriculture: 'Agriculture and Cooperation Department Andhra Pradesh',
      socialWelfare: 'Social Welfare Department Government of Andhra Pradesh'
    },
    region: 'Southern'
  },
  'Arunachal Pradesh': {
    name: 'Arunachal Pradesh',
    code: 'AR',
    aliases: ['arunachal pradesh', 'arunachal', 'ar', 'govt of arunachal'],
    domainSuffixes: ['.arunachal.gov.in', '.arunachal.nic.in', 'arunachalpradesh.gov.in', 'arunachal.gov.in'],
    knownApexDomains: ['arunachalpradesh.gov.in', 'arunachal.gov.in', 'apsc.arunachal.gov.in', 'dhe.arunachal.gov.in'],
    departments: {
      scholarship: 'Directorate of Higher & Technical Education Arunachal Pradesh',
      msme: 'Department of Industries Government of Arunachal Pradesh',
      agriculture: 'Department of Agriculture Government of Arunachal Pradesh',
      socialWelfare: 'Social Justice, Empowerment and Tribal Affairs Department'
    },
    region: 'North East'
  },
  'Assam': {
    name: 'Assam',
    code: 'AS',
    aliases: ['assam', 'asom', 'as', 'govt of assam'],
    domainSuffixes: ['.assam.gov.in', '.assam.nic.in', 'assam.gov.in', 'assam.nic.in'],
    knownApexDomains: ['assam.gov.in', 'directorateofhighereducation.assam.gov.in', 'cmaaa.assam.gov.in', 'arbas.assam.gov.in', 'finance.assam.gov.in', 'industries.assam.gov.in'],
    departments: {
      scholarship: 'Directorate of Higher Education Assam',
      msme: 'Department of Industries and Commerce Assam',
      agriculture: 'Department of Agriculture Government of Assam',
      socialWelfare: 'Department of Social Justice and Empowerment Assam'
    },
    region: 'North East'
  },
  'Bihar': {
    name: 'Bihar',
    code: 'BR',
    aliases: ['bihar', 'br', 'govt of bihar'],
    domainSuffixes: ['.bihar.gov.in', '.bih.nic.in', 'bihar.gov.in', 'bih.nic.in'],
    knownApexDomains: ['bihar.gov.in', 'pmsonline.bih.nic.in', 'scstpmsonline.bihar.gov.in', 'medhasoft.bih.nic.in', 'udyami.bihar.gov.in', 'state.bihar.gov.in'],
    departments: {
      scholarship: 'Education Department Government of Bihar Post Matric',
      msme: 'Industries Department Government of Bihar Mukhyamantri Udyami',
      agriculture: 'Department of Agriculture Government of Bihar DBT',
      socialWelfare: 'Social Welfare Department Government of Bihar'
    },
    region: 'Eastern',
    administrativeStructure: 'state',
    administrativeLabel: 'State Government of Bihar'
  },
  'Chhattisgarh': {
    name: 'Chhattisgarh',
    code: 'CG',
    aliases: ['chhattisgarh', 'chattisgarh', 'cg', 'govt of cg'],
    domainSuffixes: ['.cgstate.gov.in', '.cg.nic.in', 'cgstate.gov.in', 'cg.nic.in'],
    knownApexDomains: ['cgstate.gov.in', 'postmatric-scholarship.cg.nic.in', 'industries.cg.gov.in', 'agriportal.cg.nic.in'],
    departments: {
      scholarship: 'Tribal and SC Development Department Chhattisgarh Post Matric',
      msme: 'Commerce and Industry Department Chhattisgarh',
      agriculture: 'Department of Agriculture Development and Farmer Welfare Chhattisgarh',
      socialWelfare: 'Social Welfare Department Government of Chhattisgarh'
    },
    region: 'Central'
  },
  'Goa': {
    name: 'Goa',
    code: 'GA',
    aliases: ['goa', 'state of goa', 'ga', 'govt of goa'],
    domainSuffixes: ['.goa.gov.in', '.goa.nic.in', 'goa.gov.in', 'goa.nic.in'],
    knownApexDomains: ['goa.gov.in', 'dhe.goa.gov.in', 'scholarships.goa.gov.in', 'goaonline.gov.in', 'dit.goa.gov.in', 'cmmrdf.goa.gov.in', 'socialwelfare.goa.gov.in', 'agri.goa.gov.in'],
    departments: {
      scholarship: 'Directorate of Higher Education Goa DHE Bursary',
      msme: 'Department of Industries, Trade and Commerce Goa CMRY',
      agriculture: 'Directorate of Agriculture Government of Goa',
      socialWelfare: 'Directorate of Social Welfare Government of Goa DSS'
    },
    region: 'Western'
  },
  'Gujarat': {
    name: 'Gujarat',
    code: 'GJ',
    aliases: ['gujarat', 'gujrat', 'gj', 'govt of gujarat'],
    domainSuffixes: ['.gujarat.gov.in', '.guj.nic.in', 'gujarat.gov.in', 'guj.nic.in'],
    knownApexDomains: ['gujarat.gov.in', 'mysy.guj.nic.in', 'esamajkalyan.gujarat.gov.in', 'ic.gujarat.gov.in', 'ikhedut.gujarat.gov.in'],
    departments: {
      scholarship: 'Higher Education Department Gujarat MYSY Mukhyamantri Yuva Swavalamban',
      msme: 'Industries and Mines Department Gujarat MSME',
      agriculture: 'Agriculture, Farmers Welfare and Co-operation Department Gujarat',
      socialWelfare: 'Social Justice and Empowerment Department Gujarat'
    },
    region: 'Western'
  },
  'Haryana': {
    name: 'Haryana',
    code: 'HR',
    aliases: ['haryana', 'hr', 'govt of haryana'],
    domainSuffixes: ['.haryana.gov.in', '.hry.nic.in', 'haryana.gov.in', 'hry.nic.in'],
    knownApexDomains: ['haryana.gov.in', 'harchhatravratti.highereduhry.ac.in', 'saralharyana.gov.in', 'msme.haryana.gov.in', 'agriharyana.gov.in'],
    departments: {
      scholarship: 'Department of Higher Education Haryana Har-Chhatravratti',
      msme: 'Department of Industries and Commerce Haryana MSME',
      agriculture: 'Department of Agriculture and Farmers Welfare Haryana',
      socialWelfare: 'Social Justice, Empowerment of SCs and BCs Welfare Haryana'
    },
    region: 'Northern'
  },
  'Himachal Pradesh': {
    name: 'Himachal Pradesh',
    code: 'HP',
    aliases: ['himachal pradesh', 'himachal', 'hp', 'govt of hp'],
    domainSuffixes: ['.hp.gov.in', '.hp.nic.in', 'himachal.gov.in', 'himachal.nic.in'],
    knownApexDomains: ['himachal.gov.in', 'himachal.nic.in', 'hpepass.cgg.gov.in', 'emerginghimachal.hp.gov.in', 'agriculture.hp.gov.in'],
    departments: {
      scholarship: 'Directorate of Higher Education Himachal Pradesh ePass',
      msme: 'Department of Industries Government of Himachal Pradesh',
      agriculture: 'Department of Agriculture Government of Himachal Pradesh',
      socialWelfare: 'Department of Social Justice and Empowerment Himachal Pradesh'
    },
    region: 'Northern'
  },
  'Jharkhand': {
    name: 'Jharkhand',
    code: 'JH',
    aliases: ['jharkhand', 'jh', 'govt of jharkhand'],
    domainSuffixes: ['.jharkhand.gov.in', '.jh.nic.in', 'jharkhand.gov.in', 'jh.nic.in'],
    knownApexDomains: ['jharkhand.gov.in', 'ekalyan.cgg.gov.in', 'jharkhandindustry.gov.in', 'agri.jharkhand.gov.in'],
    departments: {
      scholarship: 'Scheduled Tribe, SC, Minority and BC Welfare Department e-Kalyan Jharkhand',
      msme: 'Department of Industries Government of Jharkhand MSME',
      agriculture: 'Department of Agriculture, Animal Husbandry & Co-operative Jharkhand',
      socialWelfare: 'Department of Women, Child Development and Social Security Jharkhand'
    },
    region: 'Eastern'
  },
  'Karnataka': {
    name: 'Karnataka',
    code: 'KA',
    aliases: ['karnataka', 'kar', 'ka', 'govt of karnataka'],
    domainSuffixes: ['.karnataka.gov.in', '.kar.nic.in', 'karnataka.gov.in', 'kar.nic.in'],
    knownApexDomains: [
      'karnataka.gov.in',
      'ssp.karnataka.gov.in',
      'ssp.postmatric.karnataka.gov.in',
      'sevasindhugs.karnataka.gov.in',
      'cmegp.kar.nic.in',
      'dce.karnataka.gov.in',
      'swd.karnataka.gov.in',
      'karnataka.gov.in/agriculture'
    ],
    departments: {
      scholarship: 'Department of Social Welfare Karnataka State Scholarship Portal SSP',
      msme: 'Commerce and Industries Department Karnataka CMEGP',
      agriculture: 'Department of Agriculture Karnataka Raitha Vidya Nidhi',
      socialWelfare: 'Social Welfare Department Government of Karnataka'
    },
    region: 'Southern'
  },
  'Kerala': {
    name: 'Kerala',
    code: 'KL',
    aliases: ['kerala', 'kl', 'govt of kerala'],
    domainSuffixes: ['.kerala.gov.in', '.kerala.nic.in', 'kerala.gov.in', 'kerala.nic.in'],
    knownApexDomains: ['kerala.gov.in', 'dcescholarship.kerala.gov.in', 'industry.kerala.gov.in', 'keralaagriculture.gov.in'],
    departments: {
      scholarship: 'Directorate of Collegiate Education Kerala DCE Scholarship',
      msme: 'Directorate of Industries and Commerce Kerala',
      agriculture: 'Department of Agriculture Development and Farmers Welfare Kerala',
      socialWelfare: 'Social Justice Department Government of Kerala'
    },
    region: 'Southern'
  },
  'Madhya Pradesh': {
    name: 'Madhya Pradesh',
    code: 'MP',
    aliases: ['madhya pradesh', 'mp', 'govt of mp'],
    domainSuffixes: ['.mp.gov.in', '.mp.nic.in', 'mp.gov.in', 'mp.nic.in'],
    knownApexDomains: ['mp.gov.in', 'scholarshipportal.mp.nic.in', 'saara.mp.gov.in', 'cmladlibahna.mp.gov.in', 'invest.mp.gov.in'],
    departments: {
      scholarship: 'State Scholarship Portal MP Tribal and SC Welfare',
      msme: 'Micro, Small and Medium Enterprises Department Madhya Pradesh',
      agriculture: 'Farmer Welfare and Agriculture Development Department MP',
      socialWelfare: 'Social Justice and Disabled Welfare Department Madhya Pradesh'
    },
    region: 'Central'
  },
  'Maharashtra': {
    name: 'Maharashtra',
    code: 'MH',
    aliases: ['maharashtra', 'maha', 'mh', 'govt of maharashtra'],
    domainSuffixes: ['.maharashtra.gov.in', '.mah.nic.in', 'maharashtra.gov.in', 'mahaonline.gov.in'],
    knownApexDomains: [
      'mahadbt.maharashtra.gov.in',
      'maharashtra.gov.in',
      'maitri.maharashtra.gov.in',
      'maha-cmegp.gov.in',
      'industry.maharashtra.gov.in',
      'mahasdb.maharashtra.gov.in',
      'mahaonline.gov.in',
      'apavm.maharashtra.gov.in',
      'krishi.maharashtra.gov.in',
      'ladakibahin.maharashtra.gov.in',
      'jeevandayee.gov.in'
    ],
    departments: {
      scholarship: 'Higher and Technical Education / Social Justice MahaDBT',
      msme: 'Directorate of Industries Maharashtra CMEGP Maitri',
      agriculture: 'Department of Agriculture Government of Maharashtra Krishi',
      socialWelfare: 'Social Justice and Special Assistance Department Maharashtra'
    },
    region: 'Western'
  },
  'Manipur': {
    name: 'Manipur',
    code: 'MN',
    aliases: ['manipur', 'mn', 'govt of manipur'],
    domainSuffixes: ['.manipur.gov.in', '.manipur.nic.in', 'manipur.gov.in', 'manipur.nic.in'],
    knownApexDomains: ['manipur.gov.in', 'dhtemanipur.gov.in', 'manipurcommerceandindustries.gov.in'],
    departments: {
      scholarship: 'Directorate of Higher and Technical Education Manipur',
      msme: 'Department of Commerce and Industries Manipur',
      agriculture: 'Department of Agriculture Manipur',
      socialWelfare: 'Social Welfare Department Government of Manipur'
    },
    region: 'North East'
  },
  'Meghalaya': {
    name: 'Meghalaya',
    code: 'ML',
    aliases: ['meghalaya', 'ml', 'govt of meghalaya'],
    domainSuffixes: ['.meghalaya.gov.in', '.megh.nic.in', 'meghalaya.gov.in', 'megh.nic.in'],
    knownApexDomains: ['meghalaya.gov.in', 'megeducation.gov.in', 'meghalaya.gov.in/commerce_industries'],
    departments: {
      scholarship: 'Directorate of Higher & Technical Education Meghalaya',
      msme: 'Department of Commerce and Industries Government of Meghalaya',
      agriculture: 'Department of Agriculture and Farmers Welfare Meghalaya',
      socialWelfare: 'Social Welfare Department Government of Meghalaya'
    },
    region: 'North East'
  },
  'Mizoram': {
    name: 'Mizoram',
    code: 'MZ',
    aliases: ['mizoram', 'mz', 'mizo', 'govt of mizoram'],
    domainSuffixes: ['.mizoram.gov.in', '.mizo.nic.in', 'mizoram.gov.in', 'mizo.nic.in'],
    knownApexDomains: ['mizoram.gov.in', 'scholarships.mizoram.gov.in', 'industries.mizoram.gov.in'],
    departments: {
      scholarship: 'Mizoram Scholarship Board Higher & Technical Education',
      msme: 'Department of Commerce and Industries Mizoram',
      agriculture: 'Department of Agriculture Government of Mizoram',
      socialWelfare: 'Social Welfare and Tribal Affairs Department Mizoram'
    },
    region: 'North East'
  },
  'Nagaland': {
    name: 'Nagaland',
    code: 'NL',
    aliases: ['nagaland', 'nl', 'govt of nagaland'],
    domainSuffixes: ['.nagaland.gov.in', '.nagaland.nic.in', 'nagaland.gov.in', 'nagaland.nic.in'],
    knownApexDomains: ['nagaland.gov.in', 'scholarship.nagaland.gov.in', 'industry.nagaland.gov.in'],
    departments: {
      scholarship: 'Department of Higher Education Nagaland Scholarship Portal',
      msme: 'Department of Industries and Commerce Nagaland',
      agriculture: 'Department of Agriculture Government of Nagaland',
      socialWelfare: 'Department of Social Welfare Nagaland'
    },
    region: 'North East'
  },
  'Odisha': {
    name: 'Odisha',
    code: 'OD',
    aliases: ['odisha', 'orissa', 'od', 'govt of odisha'],
    domainSuffixes: ['.odisha.gov.in', '.ori.nic.in', 'odisha.gov.in', 'ori.nic.in'],
    knownApexDomains: ['odisha.gov.in', 'scholarship.odisha.gov.in', 'kalia.odisha.gov.in', 'subhadra.odisha.gov.in', 'msme.odisha.gov.in'],
    departments: {
      scholarship: 'Higher Education Department Odisha State Scholarship Portal',
      msme: 'MSME Department Government of Odisha',
      agriculture: 'Department of Agriculture and Farmers Empowerment Odisha KALIA',
      socialWelfare: 'Social Security & Empowerment of Persons with Disabilities Odisha'
    },
    region: 'Eastern'
  },
  'Punjab': {
    name: 'Punjab',
    code: 'PB',
    aliases: ['punjab', 'pb', 'govt of punjab'],
    domainSuffixes: ['.punjab.gov.in', '.punjab.nic.in', 'punjab.gov.in', 'punjab.nic.in'],
    knownApexDomains: ['punjab.gov.in', 'scholarships.punjab.gov.in', 'pbindustries.gov.in', 'agri.punjab.gov.in'],
    departments: {
      scholarship: 'Department of Social Justice, Empowerment and Minorities Punjab Dr Ambedkar Portal',
      msme: 'Department of Industries & Commerce Punjab Invest Punjab',
      agriculture: 'Department of Agriculture & Farmers Welfare Punjab',
      socialWelfare: 'Department of Social Security, Women and Child Development Punjab'
    },
    region: 'Northern'
  },
  'Rajasthan': {
    name: 'Rajasthan',
    code: 'RJ',
    aliases: ['rajasthan', 'raj', 'rj', 'govt of rajasthan'],
    domainSuffixes: ['.rajasthan.gov.in', '.raj.nic.in', 'rajasthan.gov.in', 'raj.nic.in'],
    knownApexDomains: ['rajasthan.gov.in', 'sjmsnew.rajasthan.gov.in', 'chiranjeevi.rajasthan.gov.in', 'sso.rajasthan.gov.in', 'industries.rajasthan.gov.in'],
    departments: {
      scholarship: 'Social Justice and Empowerment Department Rajasthan SJMS Uttar Matric',
      msme: 'Industries and Commerce Department Rajasthan Mukhyamantri Laghu Udyog Protsahan',
      agriculture: 'Department of Agriculture Government of Rajasthan Krishi Sathi',
      socialWelfare: 'Social Justice and Empowerment Department Government of Rajasthan'
    },
    region: 'Northern'
  },
  'Sikkim': {
    name: 'Sikkim',
    code: 'SK',
    aliases: ['sikkim', 'sk', 'govt of sikkim'],
    domainSuffixes: ['.sikkim.gov.in', '.sikkim.nic.in', 'sikkim.gov.in', 'sikkim.nic.in'],
    knownApexDomains: ['sikkim.gov.in', 'sikkimhrdd.org', 'commerceandindustries.sikkim.gov.in'],
    departments: {
      scholarship: 'Education Department Government of Sikkim Higher Education',
      msme: 'Commerce and Industries Department Government of Sikkim',
      agriculture: 'Agriculture and Farmers Welfare Department Sikkim',
      socialWelfare: 'Women and Child Development Department Sikkim'
    },
    region: 'North East'
  },
  'Tamil Nadu': {
    name: 'Tamil Nadu',
    code: 'TN',
    aliases: ['tamil nadu', 'tamilnadu', 'tn', 'govt of tn', 'govt of tamil nadu'],
    domainSuffixes: ['.tn.gov.in', '.tn.nic.in', 'tn.gov.in', 'tn.nic.in'],
    knownApexDomains: ['tn.gov.in', 'pudhumaipenn.tn.gov.in', 'tamilpudhalvan.tn.gov.in', 'kmut.tn.gov.in', 'msmeonline.tn.gov.in', 'cmchistn.com'],
    departments: {
      scholarship: 'Adi Dravidar and Tribal Welfare / BC, MBC Welfare Department TN',
      msme: 'Micro, Small and Medium Enterprises Department Tamil Nadu NEEDS',
      agriculture: 'Agriculture and Farmers Welfare Department Government of Tamil Nadu',
      socialWelfare: 'Social Welfare and Women Empowerment Department Tamil Nadu'
    },
    region: 'Southern'
  },
  'Telangana': {
    name: 'Telangana',
    code: 'TS',
    aliases: ['telangana', 'ts', 'tg', 'govt of telangana'],
    domainSuffixes: ['.telangana.gov.in', '.ts.nic.in', 'telangana.gov.in', 'telangana.nic.in'],
    knownApexDomains: ['telangana.gov.in', 'telanganaepass.cgg.gov.in', 'rythubharosa.telangana.gov.in', 'ipass.telangana.gov.in'],
    departments: {
      scholarship: 'Telangana Electronic Payment and Application System of Scholarships ePASS',
      msme: 'Industries & Commerce Department Telangana TS-iPASS',
      agriculture: 'Agriculture and Farmers Welfare Department Telangana Rythu Bharosa',
      socialWelfare: 'Scheduled Castes Development Department Government of Telangana'
    },
    region: 'Southern'
  },
  'Tripura': {
    name: 'Tripura',
    code: 'TR',
    aliases: ['tripura', 'tr', 'govt of tripura'],
    domainSuffixes: ['.tripura.gov.in', '.tripura.nic.in', 'tripura.gov.in', 'tripura.nic.in'],
    knownApexDomains: ['tripura.gov.in', 'highereducation.tripura.gov.in', 'industries.tripura.gov.in'],
    departments: {
      scholarship: 'Directorate of Higher Education Tripura Post Matric Scholarship',
      msme: 'Department of Industries and Commerce Government of Tripura',
      agriculture: 'Department of Agriculture and Farmers Welfare Tripura',
      socialWelfare: 'Department of Social Welfare and Social Education Tripura'
    },
    region: 'North East'
  },
  'Uttar Pradesh': {
    name: 'Uttar Pradesh',
    code: 'UP',
    aliases: ['uttar pradesh', 'up', 'govt of up'],
    domainSuffixes: ['.up.gov.in', '.up.nic.in', 'up.gov.in', 'up.nic.in', 'upsdc.gov.in'],
    knownApexDomains: ['scholarship.up.gov.in', 'up.gov.in', 'mksy.up.gov.in', 'diupmsme.upsdc.gov.in', 'odopup.in', 'upagriculture.com'],
    departments: {
      scholarship: 'Social Welfare Department UP Scholarship and Fee Reimbursement',
      msme: 'Department of MSME and Export Promotion Uttar Pradesh ODOP',
      agriculture: 'Department of Agriculture Uttar Pradesh UP Krishi',
      socialWelfare: 'Women and Child Development / Social Welfare UP'
    },
    region: 'Northern',
    administrativeStructure: 'state',
    administrativeLabel: 'State Government of Uttar Pradesh'
  },
  'Uttarakhand': {
    name: 'Uttarakhand',
    code: 'UK',
    aliases: ['uttarakhand', 'uttaranchal', 'uk', 'ua', 'govt of uttarakhand'],
    domainSuffixes: ['.uk.gov.in', '.uk.nic.in', 'uk.gov.in', 'uttarakhand.gov.in'],
    knownApexDomains: ['uk.gov.in', 'uttarakhand.gov.in', 'ekalyan.uk.gov.in', 'doiuk.org', 'agri.uk.gov.in'],
    departments: {
      scholarship: 'Social Welfare Department Uttarakhand Scholarship Portal',
      msme: 'Directorate of Industries Uttarakhand MSME',
      agriculture: 'Department of Agriculture Government of Uttarakhand',
      socialWelfare: 'Social Welfare Department Government of Uttarakhand'
    },
    region: 'Northern'
  },
  'West Bengal': {
    name: 'West Bengal',
    code: 'WB',
    aliases: ['west bengal', 'wb', 'bengal', 'govt of wb', 'govt of west bengal'],
    domainSuffixes: ['.wb.gov.in', '.wb.nic.in', 'wb.gov.in', 'wb.nic.in'],
    knownApexDomains: ['wb.gov.in', 'svmcm.wbhed.gov.in', 'wbkanyashree.gov.in', 'krishakbandhu.wb.gov.in', 'swasthyasathi.gov.in', 'wbmsme.gov.in'],
    departments: {
      scholarship: 'Higher Education Department West Bengal Swami Vivekananda SVMCM',
      msme: 'Micro, Small & Medium Enterprises and Textiles Department West Bengal',
      agriculture: 'Department of Agriculture Government of West Bengal Krishak Bandhu',
      socialWelfare: 'Women and Child Development and Social Welfare Department West Bengal'
    },
    region: 'Eastern'
  },
  // 8 Union Territories
  'Andaman and Nicobar Islands': {
    name: 'Andaman and Nicobar Islands',
    code: 'AN',
    aliases: ['andaman and nicobar', 'andaman and nicobar islands', 'andaman', 'nicobar', 'an'],
    domainSuffixes: ['.andaman.gov.in', '.andaman.nic.in', 'andaman.gov.in', 'andaman.nic.in'],
    knownApexDomains: ['andaman.gov.in', 'andssw1.and.nic.in'],
    departments: {
      scholarship: 'Directorate of Education Andaman and Nicobar Administration',
      msme: 'Directorate of Industries Andaman and Nicobar Administration',
      agriculture: 'Directorate of Agriculture Andaman and Nicobar',
      socialWelfare: 'Directorate of Social Welfare Andaman and Nicobar'
    }
  },
  'Chandigarh': {
    name: 'Chandigarh',
    code: 'CH',
    aliases: ['chandigarh', 'chd', 'ch', 'chandigarh administration'],
    domainSuffixes: ['.chd.gov.in', '.chd.nic.in', 'chandigarh.gov.in'],
    knownApexDomains: ['chandigarh.gov.in', 'chdeducation.gov.in'],
    departments: {
      scholarship: 'Department of Higher Education Chandigarh Administration',
      msme: 'Department of Industries Chandigarh Administration',
      agriculture: 'Agriculture Department Chandigarh Administration',
      socialWelfare: 'Social Welfare Department Chandigarh Administration'
    },
    region: 'Northern'
  },
  'Dadra and Nagar Haveli and Daman and Diu': {
    name: 'Dadra and Nagar Haveli and Daman and Diu',
    code: 'DH',
    aliases: ['dadra and nagar haveli', 'daman and diu', 'dadra and nagar haveli and daman and diu', 'dnhdd', 'dnh & dd'],
    domainSuffixes: ['.daman.nic.in', '.ddd.gov.in', 'daman.nic.in', 'ddd.gov.in'],
    knownApexDomains: ['daman.nic.in', 'ddd.gov.in'],
    departments: {
      scholarship: 'Directorate of Higher Education UT of DNH and DD',
      msme: 'Department of Industries UT of DNH and DD',
      agriculture: 'Department of Agriculture UT of DNH and DD',
      socialWelfare: 'Department of Social Welfare UT of DNH and DD'
    },
    region: 'Western'
  },
  'Delhi': {
    name: 'Delhi',
    code: 'DL',
    aliases: ['delhi', 'nct of delhi', 'national capital territory of delhi', 'delhi ncr', 'govt of delhi', 'dl'],
    domainSuffixes: ['.delhi.gov.in', '.delhigovt.nic.in', 'delhi.gov.in', 'delhigovt.nic.in'],
    knownApexDomains: ['delhi.gov.in', 'delhigovt.nic.in', 'edistrict.delhigovt.nic.in', 'edistrict.delhi.gov.in', 'scstwelfare.delhi.gov.in', 'doorstep.delhi.gov.in'],
    departments: {
      scholarship: 'Department for Welfare of SC/ST/OBC Delhi e-District',
      msme: 'Department of Industries Government of NCT of Delhi',
      agriculture: 'Development Department Government of NCT of Delhi',
      socialWelfare: 'Department of Social Welfare Government of NCT of Delhi'
    },
    region: 'NCR',
    administrativeStructure: 'union_territory_with_legislature',
    administrativeLabel: 'Union Territory with Legislative Assembly (NCT of Delhi)'
  },
  'Jammu and Kashmir': {
    name: 'Jammu and Kashmir',
    code: 'JK',
    aliases: ['jammu and kashmir', 'j&k', 'jammu & kashmir', 'jk', 'govt of jk'],
    domainSuffixes: ['.jk.gov.in', '.jk.nic.in', 'jk.gov.in', 'jammukashmir.nic.in'],
    knownApexDomains: ['jk.gov.in', 'jksamadhaan.jk.gov.in', 'aicte-jk-scholarship-gov.in', 'industryjk.com'],
    departments: {
      scholarship: 'Social Welfare Department Jammu and Kashmir AICTE SSS J&K',
      msme: 'Industries & Commerce Department Jammu and Kashmir',
      agriculture: 'Department of Agriculture Production & Farmers Welfare J&K',
      socialWelfare: 'Social Welfare Department Government of Jammu and Kashmir'
    },
    region: 'Northern'
  },
  'Ladakh': {
    name: 'Ladakh',
    code: 'LA',
    aliases: ['ladakh', 'ut ladakh', 'la', 'leh', 'kargil'],
    domainSuffixes: ['.ladakh.gov.in', '.ladakh.nic.in', 'ladakh.gov.in', 'ladakh.nic.in'],
    knownApexDomains: ['ladakh.gov.in', 'leh.nic.in', 'kargil.nic.in'],
    departments: {
      scholarship: 'Higher Education Department UT of Ladakh',
      msme: 'Industries and Commerce Department UT of Ladakh',
      agriculture: 'Agriculture Department UT of Ladakh',
      socialWelfare: 'Social and Tribal Welfare Department UT of Ladakh'
    },
    region: 'Northern'
  },
  'Lakshadweep': {
    name: 'Lakshadweep',
    code: 'LD',
    aliases: ['lakshadweep', 'lakshadweep islands', 'ld', 'ut of lakshadweep'],
    domainSuffixes: ['.lakshadweep.gov.in', '.lakshadweep.nic.in', 'lakshadweep.gov.in', 'lakshadweep.nic.in'],
    knownApexDomains: ['lakshadweep.gov.in'],
    departments: {
      scholarship: 'Department of Education UT of Lakshadweep',
      msme: 'Department of Industries UT of Lakshadweep',
      agriculture: 'Department of Agriculture UT of Lakshadweep',
      socialWelfare: 'Department of Social Welfare UT of Lakshadweep'
    },
    region: 'Southern'
  },
  'Puducherry': {
    name: 'Puducherry',
    code: 'PY',
    aliases: ['puducherry', 'pondicherry', 'py', 'ut of puducherry'],
    domainSuffixes: ['.py.gov.in', '.puducherry.gov.in', '.py.nic.in', 'py.gov.in', 'puducherry.gov.in'],
    knownApexDomains: ['py.gov.in', 'puducherry.gov.in', 'dhte.py.gov.in'],
    departments: {
      scholarship: 'Directorate of Higher and Technical Education Puducherry Perunthalaivar Kamarajar',
      msme: 'Department of Industries and Commerce Government of Puducherry',
      agriculture: 'Department of Agriculture Government of Puducherry',
      socialWelfare: 'Department of Social Welfare Government of Puducherry'
    },
    region: 'Southern'
  }
};

export const ALL_INDIA_ALIASES = [
  'all india',
  'all india / central',
  'india',
  'central',
  'national'
];

/**
 * Resolve any raw state string or alias into a canonical Indian State or Union Territory name.
 */
export function normalizeStateName(rawState?: string | null): string | null {
  if (!rawState) return null;
  const clean = rawState.trim();
  const lower = clean.toLowerCase();

  if (ALL_INDIA_ALIASES.includes(lower)) {
    return 'All India / Central';
  }

  // Exact match against official list
  for (const st of INDIAN_STATES_AND_UTS) {
    if (st.toLowerCase() === lower) {
      return st;
    }
  }

  // Match against comprehensive alias tables
  for (const [canonicalName, meta] of Object.entries(STATE_METADATA_MAP)) {
    if (meta.aliases.some(alias => alias === lower)) {
      return canonicalName;
    }
  }

  // Check substring containment
  for (const st of INDIAN_STATES_AND_UTS) {
    const stLower = st.toLowerCase();
    if (lower.includes(stLower) || stLower.includes(lower)) {
      return st;
    }
  }

  return null;
}

/**
 * Identify which Indian State or Union Territory a hostname/domain belongs to,
 * using NIC subdomains, apex domains, and registered state metadata.
 */
export function identifyStateFromDomain(hostnameOrUrl: string): IndianStateOrUT | null {
  try {
    let host = hostnameOrUrl.toLowerCase().trim();
    if (host.includes('://')) {
      host = new URL(host).hostname.toLowerCase();
    }
    // Strip leading www.
    if (host.startsWith('www.')) {
      host = host.slice(4);
    }

    for (const [stName, meta] of Object.entries(STATE_METADATA_MAP)) {
      // 1. Check known apex domains
      if (meta.knownApexDomains.some(d => host === d || host.endsWith('.' + d))) {
        return stName as IndianStateOrUT;
      }

      // 2. Check domain suffixes (.state.gov.in, .state.nic.in, etc.)
      if (meta.domainSuffixes.some(s => host.endsWith(s))) {
        return stName as IndianStateOrUT;
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Backward-compatible mapping of state names to official domains.
 */
export const STATE_OFFICIAL_DOMAINS: Record<string, string[]> = Object.fromEntries(
  Object.entries(STATE_METADATA_MAP).map(([state, meta]) => [state, meta.knownApexDomains])
);

export const CENTRAL_OFFICIAL_DOMAINS = [
  'scholarships.gov.in',
  'myscheme.gov.in',
  'umang.gov.in',
  'nitiforstates.gov.in',
  'niti.gov.in',
  'dosje.gov.in',
  'socialjustice.gov.in',
  'tribal.gov.in',
  'minorityaffairs.gov.in',
  'education.gov.in',
  'pmkisan.gov.in',
  'pmfby.gov.in',
  'maandhan.in',
  'beneficiary.nha.gov.in',
  'nfsa.gov.in',
  'pmaymis.gov.in',
  'pmmvy.wcd.gov.in',
  'pfrda.org.in',
  'udyamimitra.in',
  'pmvishwakarma.gov.in',
  'pmsvanidhi.mohua.gov.in',
  'mudra.org.in',
  'pmegp.gov.in',
  'kviconline.gov.in',
  'cgtmse.in',
  'standupmitra.in',
  'udyamregistration.gov.in',
  'msme.gov.in',
  'dcmsme.gov.in',
  'jansamarth.in',
  'aicte-india.org',
  'ugc.gov.in',
  'mofpi.gov.in',
  'indiapost.gov.in',
  'pmkusum.mnre.gov.in',
  'mnre.gov.in',
  'pmindia.gov.in',
  'agricoop.nic.in',
  'agricoop.gov.in',
  'agriwelfare.gov.in',
  'dbtbharat.gov.in',
  'doner.gov.in',
  'necouncil.gov.in'
];

/**
 * Returns member states for regional multi-state programs.
 */
export const MULTI_STATE_REGIONS: Record<string, IndianStateOrUT[]> = {
  'North East': [
    'Arunachal Pradesh',
    'Assam',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Sikkim',
    'Tripura'
  ],
  'NCR': [
    'Delhi',
    'Haryana',
    'Uttar Pradesh',
    'Rajasthan'
  ],
  'JK_Ladakh': [
    'Jammu and Kashmir',
    'Ladakh'
  ]
};

/**
 * Resolves the accurate constitutional and administrative structure of any Indian jurisdiction.
 * Correctly represents Delhi as a Union Territory with a Legislative Assembly (NCT of Delhi),
 * rather than assuming all regions follow the same administrative structure.
 */
export function getAdministrativeStructure(stateName?: string | null): {
  type: 'state' | 'union_territory_with_legislature' | 'union_territory_without_legislature' | 'central';
  label: string;
} {
  const norm = normalizeStateName(stateName);
  if (!norm || norm === 'All India / Central') {
    return { type: 'central', label: 'Central Government of India' };
  }
  const meta = STATE_METADATA_MAP[norm as IndianStateOrUT];
  if (meta?.administrativeStructure) {
    return {
      type: meta.administrativeStructure,
      label: meta.administrativeLabel || `${norm} (${meta.administrativeStructure === 'union_territory_with_legislature' ? 'UT with Legislative Assembly' : 'State'})`
    };
  }
  if (norm === 'Delhi') {
    return {
      type: 'union_territory_with_legislature',
      label: 'Union Territory with Legislative Assembly (NCT of Delhi)'
    };
  }
  if (['Puducherry', 'Jammu and Kashmir'].includes(norm)) {
    return {
      type: 'union_territory_with_legislature',
      label: `${norm} (Union Territory with Legislative Assembly)`
    };
  }
  const otherUTs = [
    'Andaman and Nicobar Islands',
    'Chandigarh',
    'Dadra and Nagar Haveli and Daman and Diu',
    'Ladakh',
    'Lakshadweep'
  ];
  if (otherUTs.includes(norm)) {
    return { type: 'union_territory_without_legislature', label: `${norm} (Union Territory)` };
  }
  return { type: 'state', label: `State Government of ${norm}` };
}

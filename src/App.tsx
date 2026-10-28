import React, { useState } from 'react';
import {
  FileText,
  Award,
  Info,
  RefreshCw,
  Search,
  GraduationCap,
  Sprout,
  ArrowLeft,
  Sparkles,
  Check,
  Menu,
  X,
  AlertTriangle,
  CheckCircle2,
  Layers,
  AlertCircle,
  ShieldCheck,
  Loader2,
  User,
  LogIn,
  UserPlus,
  LogOut,
  Lock,
  Activity,
  Bookmark
} from 'lucide-react';
import { AuthPage, UserSession } from './components/AuthPage';
import { logOutFirebase } from './services/firebaseClient';
import confetti from 'canvas-confetti';
import {
  UserProfile,
  AgentLog,
  MatchedScheme,
  runEligibilityAgent,
  runVerifierAgent,
  runAdvisorAgent,
  resolveVerifiedSchemeLinks,
  searchLiveSchemesApi
} from './services/multiAgentOrchestrator';
import {
  scrubSecrets,
  sanitizeDemographics
} from './services/securitySanitizer';
import { getSchemesForCategory } from './data/schemes';
import {
  HeadlineItem,
  BASELINE_HEADLINES,
  fetchLiveNationalHeadlines
} from './services/headlineAgent';

const CURRENT_YEAR = new Date().getFullYear();

// MVP release scope: strictly Delhi, Uttar Pradesh, and Bihar
const INDIAN_STATES = [
  'Delhi',
  'Uttar Pradesh',
  'Bihar'
];

export const MVP_SUPPORTED_STATES = [
  { name: 'Delhi', label: 'Delhi', structure: 'Union Territory with Legislature' },
  { name: 'Uttar Pradesh', label: 'Uttar Pradesh', structure: 'State Government' },
  { name: 'Bihar', label: 'Bihar', structure: 'State Government' }
];

const PIPELINE_STAGES = [
  {
    stage: 1,
    title: 'Citizen Eligibility Intake',
    description: 'Analyzing demographics, income thresholds, state quotas and category criteria',
    actionText: 'Validating citizen criteria against official guidelines...'
  },
  {
    stage: 2,
    title: 'Official Portals Search',
    description: 'Querying Central Portals (NSP, MyScheme, AICTE) and State Government directories',
    actionText: 'Searching Central and State government welfare directories...'
  },
  {
    stage: 3,
    title: 'Government Guidelines & Circulars',
    description: 'Checking active official department circulars, gazettes, and application rules',
    actionText: 'Checking current scheme notifications and guidelines...'
  },
  {
    stage: 4,
    title: 'Benefits & Entitlements Calculation',
    description: 'Verifying financial assistance amounts, scholarship stipends, and deadlines',
    actionText: 'Calculating financial assistance and eligibility status...'
  },
  {
    stage: 5,
    title: 'Finalizing Verified Directory',
    description: 'Auditing official government portal links and assembling required document checklist',
    actionText: 'Verifying application portals and preparing recommendations...'
  }
];

export function App() {
  // Helper to determine initial persona and view from URL hash or localStorage / sessionStorage
  const getInitialNavigation = () => {
    try {
      const hash = window.location.hash.replace(/^#/, '').toLowerCase();
      if (hash === 'auth' || hash === 'login' || hash === 'signup') {
        return { view: 'auth' as const, persona: 'unselected' as const };
      }
      if (['student', 'farmer', 'citizen', 'business'].includes(hash)) {
        return { view: 'app' as const, persona: hash as 'student' | 'farmer' | 'citizen' | 'business' };
      }
      if (hash === 'home') {
        return { view: 'app' as const, persona: 'unselected' as const };
      }
      const savedPersona = localStorage.getItem('ym_active_persona') || sessionStorage.getItem('ym_active_persona');
      if (savedPersona && ['student', 'farmer', 'citizen', 'business'].includes(savedPersona)) {
        return { view: 'app' as const, persona: savedPersona as 'student' | 'farmer' | 'citizen' | 'business' };
      }
      const savedView = localStorage.getItem('ym_active_view') || sessionStorage.getItem('ym_active_view');
      if (savedView === 'auth') {
        return { view: 'auth' as const, persona: 'unselected' as const };
      }
    } catch {}
    return { view: 'app' as const, persona: 'unselected' as const };
  };

  const getSavedJson = <T,>(key: string, fallback: T): T => {
    try {
      const val = localStorage.getItem(key) || sessionStorage.getItem(key);
      return val ? JSON.parse(val) : fallback;
    } catch {
      return fallback;
    }
  };

  const initialNav = getInitialNavigation();
  // Navigation & View State ('app' | 'auth' | 'error')
  const [currentView, setCurrentView] = useState<'app' | 'auth' | 'error'>(initialNav.view);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalReason, setAuthModalReason] = useState<string | null>(null);
  const [pendingPersona, setPendingPersona] = useState<'student' | 'farmer' | 'citizen' | 'business' | null>(null);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem('yojanamitra_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Persona Selection ('unselected' | 'student' | 'farmer' | 'citizen' | 'business')
  const [selectedPersona, setSelectedPersona] = useState<'unselected' | 'student' | 'farmer' | 'citizen' | 'business'>(initialNav.persona);

  // Load saved forms and search cache
  const studentSaved = getSavedJson('ym_form_student', {} as any);
  const farmerSaved = getSavedJson('ym_form_farmer', {} as any);
  const citizenSaved = getSavedJson('ym_form_citizen', {} as any);
  const businessSaved = getSavedJson('ym_form_business', {} as any);
  const searchCached = getSavedJson('ym_search_cache', null as any);

  // Student specific inputs (persisted across refreshes)
  const [studentAge, setStudentAge] = useState<number | ''>(studentSaved.age ?? '');
  const [studentGender, setStudentGender] = useState<'Male' | 'Female' | 'Transgender' | 'All' | ''>(studentSaved.gender ?? '');
  const [studentState, setStudentState] = useState<string>(studentSaved.state ?? '');
  const [studentIncome, setStudentIncome] = useState<number | ''>(studentSaved.income ?? '');
  const [studentCategory, setStudentCategory] = useState<'General' | 'OBC' | 'SC' | 'ST' | 'Minority' | 'EWS' | ''>(studentSaved.category ?? '');
  const [educationLevel, setEducationLevel] = useState<'School' | 'Higher Secondary' | 'Undergraduate' | 'Postgraduate' | 'Any' | ''>(studentSaved.educationLevel ?? '');
  const [courseStream, setCourseStream] = useState<string>(studentSaved.courseStream ?? '');

  // Farmer specific inputs (persisted across refreshes)
  const [farmerState, setFarmerState] = useState<string>(farmerSaved.state ?? '');
  const [farmerAge, setFarmerAge] = useState<number | ''>(farmerSaved.age ?? '');
  const [farmerGender, setFarmerGender] = useState<'Male' | 'Female' | 'Transgender' | 'All' | ''>(farmerSaved.gender ?? '');
  const [farmerType, setFarmerType] = useState<'Small/Marginal' | 'Landless' | 'Large' | 'Any' | ''>(farmerSaved.farmerType ?? '');
  const [farmerCropSeason, setFarmerCropSeason] = useState<string>(farmerSaved.farmerCropSeason ?? '');
  const [farmerIncome, setFarmerIncome] = useState<number | ''>(farmerSaved.income ?? '');
  const [farmerCategory, setFarmerCategory] = useState<'General' | 'OBC' | 'SC' | 'ST' | 'Minority' | 'EWS' | ''>(farmerSaved.category ?? '');
  const [hasKccCard, setHasKccCard] = useState<boolean>(farmerSaved.hasKccCard ?? false);
  const [hasCropInsurance, setHasCropInsurance] = useState<boolean>(farmerSaved.hasCropInsurance ?? false);

  // General Citizen (Personal & Family Welfare) inputs
  const [citizenAge, setCitizenAge] = useState<number | ''>(citizenSaved.age ?? '');
  const [citizenGender, setCitizenGender] = useState<'Male' | 'Female' | 'Transgender' | 'All' | ''>(citizenSaved.gender ?? '');
  const [citizenState, setCitizenState] = useState<string>(citizenSaved.state ?? '');
  const [citizenOccupation, setCitizenOccupation] = useState<'Daily Wage Earner' | 'Self Employed' | 'Unemployed' | 'Senior Citizen' | 'Any' | ''>(citizenSaved.occupation ?? '');
  const [citizenIncome, setCitizenIncome] = useState<number | ''>(citizenSaved.income ?? '');
  const [citizenCategory, setCitizenCategory] = useState<'General' | 'OBC' | 'SC' | 'ST' | 'Minority' | 'EWS' | ''>(citizenSaved.category ?? '');
  const [familyRationType, setFamilyRationType] = useState<string>(citizenSaved.familyRationType ?? '');
  const [housingCondition, setHousingCondition] = useState<string>(citizenSaved.housingCondition ?? '');
  const [hasAyushmanCard, setHasAyushmanCard] = useState<boolean>(citizenSaved.hasAyushmanCard ?? false);
  const [hasBplCard, _setHasBplCard] = useState<boolean>(citizenSaved.hasBplCard ?? false);
  const [isDifferentlyAbled, setIsDifferentlyAbled] = useState<boolean>(citizenSaved.isDifferentlyAbled ?? false);

  // Business & MSME specific inputs
  const [businessState, setBusinessState] = useState<string>(businessSaved.state ?? '');
  const [businessType, setBusinessType] = useState<string>(businessSaved.businessType ?? '');
  const [businessAge, setBusinessAge] = useState<number | ''>(businessSaved.age ?? '');
  const [businessGender, setBusinessGender] = useState<'Male' | 'Female' | 'Transgender' | 'All' | ''>(businessSaved.gender ?? '');
  const [loanNeed, setLoanNeed] = useState<string>(businessSaved.loanNeed ?? '');
  const [businessTurnover, setBusinessTurnover] = useState<number | ''>(businessSaved.turnover ?? '');
  const [businessCategory, setBusinessCategory] = useState<'General' | 'OBC' | 'SC' | 'ST' | 'Minority' | 'EWS' | ''>(businessSaved.category ?? '');
  const [isUdyamRegistered, setIsUdyamRegistered] = useState<boolean>(businessSaved.isUdyamRegistered ?? false);
  const [isWomenLed, setIsWomenLed] = useState<boolean>(businessSaved.isWomenLed ?? false);

  // User Search Query / Focus Keyword
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Pipeline execution & results (restored from storage)
  const isCachedMatch = Boolean(
    searchCached &&
    searchCached.hasSearched &&
    Array.isArray(searchCached.matchedSchemes) &&
    searchCached.matchedSchemes.length > 0 &&
    (initialNav.persona !== 'unselected' && (searchCached.persona === initialNav.persona || !searchCached.persona))
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchStage, setSearchStage] = useState<number>(1);
  const [hasSearched, setHasSearched] = useState(Boolean(isCachedMatch));
  const [agentLogs, setAgentLogs] = useState<AgentLog[]>([]);
  const [matchedSchemes, setMatchedSchemes] = useState<MatchedScheme[]>(isCachedMatch ? searchCached.matchedSchemes : []);
  const [advisorNote, setAdvisorNote] = useState<string>(isCachedMatch ? searchCached.advisorNote || '' : '');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [selectedSchemeDetail, setSelectedSchemeDetail] = useState<MatchedScheme | null>(null);
  const [lastSearchTime, setLastSearchTime] = useState<number>(0);
  const [discoveryDiagnostics, setDiscoveryDiagnostics] = useState<any>(isCachedMatch ? searchCached.discoveryDiagnostics : null);
  const [showDiagnosticsModal, setShowDiagnosticsModal] = useState<boolean>(false);
  const [unverifiedCandidatesList, setUnverifiedCandidatesList] = useState<any[]>(isCachedMatch && Array.isArray(searchCached.unverifiedCandidatesList) ? searchCached.unverifiedCandidatesList : []);

  // Bookmarked / Saved Schemes (Persisted locally across searches)
  const [bookmarkedSchemes, setBookmarkedSchemes] = useState<MatchedScheme[]>(() => {
    try {
      const saved = localStorage.getItem('ym_bookmarked_schemes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showOnlyBookmarks, setShowOnlyBookmarks] = useState<boolean>(false);

  const toggleBookmark = (item: MatchedScheme) => {
    setBookmarkedSchemes(prev => {
      const exists = prev.some(b => b.scheme.id === item.scheme.id);
      let updated: MatchedScheme[];
      if (exists) {
        updated = prev.filter(b => b.scheme.id !== item.scheme.id);
      } else {
        updated = [item, ...prev];
      }
      try {
        localStorage.setItem('ym_bookmarked_schemes', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Smooth stage progression animation while discovery is running
  React.useEffect(() => {
    if (!isProcessing) {
      setSearchStage(1);
      return;
    }

    const t1 = setTimeout(() => setSearchStage(prev => Math.max(prev, 2)), 1200);
    const t2 = setTimeout(() => setSearchStage(prev => Math.max(prev, 3)), 3200);
    const t3 = setTimeout(() => setSearchStage(prev => Math.max(prev, 4)), 6000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isProcessing]);

  // Notifications (Success & Error Messages)
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live National Schemes & Scholarships Feed
  const [headlines, setHeadlines] = useState<HeadlineItem[]>(BASELINE_HEADLINES);

  React.useEffect(() => {
    let isMounted = true;
    fetchLiveNationalHeadlines().then(res => {
      if (isMounted) {
        setHeadlines(res.headlines);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Synchronize URL Hash and localStorage/sessionStorage with current navigation state
  React.useEffect(() => {
    try {
      if (currentView === 'auth') {
        localStorage.setItem('ym_active_view', 'auth');
        sessionStorage.setItem('ym_active_view', 'auth');
        localStorage.setItem('ym_active_persona', 'unselected');
        sessionStorage.setItem('ym_active_persona', 'unselected');
        if (window.location.hash !== '#auth') {
          window.history.replaceState(null, '', '#auth');
        }
      } else {
        localStorage.setItem('ym_active_view', 'app');
        sessionStorage.setItem('ym_active_view', 'app');
        localStorage.setItem('ym_active_persona', selectedPersona);
        sessionStorage.setItem('ym_active_persona', selectedPersona);
        const targetHash = selectedPersona === 'unselected' ? '#home' : `#${selectedPersona}`;
        if (window.location.hash !== targetHash) {
          window.history.replaceState(null, '', targetHash);
        }
      }
    } catch {}
  }, [currentView, selectedPersona]);

  // Support browser Back/Forward navigation with hashchange
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#/, '').toLowerCase();
      if (hash === 'auth' || hash === 'login' || hash === 'signup') {
        setCurrentView('auth');
        setSelectedPersona('unselected');
      } else if (['student', 'farmer', 'citizen', 'business'].includes(hash)) {
        setCurrentView('app');
        setSelectedPersona(hash as 'student' | 'farmer' | 'citizen' | 'business');
      } else if (hash === 'home') {
        setCurrentView('app');
        setSelectedPersona('unselected');
      }
      // If hash is empty or unrecognized, do not force reset to unselected! Keep current state.
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Persist Student form inputs
  React.useEffect(() => {
    try {
      const data = JSON.stringify({
        age: studentAge,
        gender: studentGender,
        state: studentState,
        income: studentIncome,
        category: studentCategory,
        educationLevel,
        courseStream,
      });
      localStorage.setItem('ym_form_student', data);
      sessionStorage.setItem('ym_form_student', data);
    } catch {}
  }, [studentAge, studentGender, studentState, studentIncome, studentCategory, educationLevel, courseStream]);

  // Persist Farmer form inputs
  React.useEffect(() => {
    try {
      const data = JSON.stringify({
        state: farmerState,
        age: farmerAge,
        gender: farmerGender,
        farmerType,
        farmerCropSeason,
        income: farmerIncome,
        category: farmerCategory,
        hasKccCard,
        hasCropInsurance,
      });
      localStorage.setItem('ym_form_farmer', data);
      sessionStorage.setItem('ym_form_farmer', data);
    } catch {}
  }, [farmerState, farmerAge, farmerGender, farmerType, farmerCropSeason, farmerIncome, farmerCategory, hasKccCard, hasCropInsurance]);

  // Persist Citizen form inputs
  React.useEffect(() => {
    try {
      const data = JSON.stringify({
        age: citizenAge,
        gender: citizenGender,
        state: citizenState,
        occupation: citizenOccupation,
        income: citizenIncome,
        category: citizenCategory,
        familyRationType,
        housingCondition,
        hasAyushmanCard,
        hasBplCard,
        isDifferentlyAbled,
      });
      localStorage.setItem('ym_form_citizen', data);
      sessionStorage.setItem('ym_form_citizen', data);
    } catch {}
  }, [citizenAge, citizenGender, citizenState, citizenOccupation, citizenIncome, citizenCategory, familyRationType, housingCondition, hasAyushmanCard, hasBplCard, isDifferentlyAbled]);

  // Persist Business form inputs
  React.useEffect(() => {
    try {
      const data = JSON.stringify({
        state: businessState,
        businessType,
        age: businessAge,
        gender: businessGender,
        loanNeed,
        turnover: businessTurnover,
        category: businessCategory,
        isUdyamRegistered,
        isWomenLed,
      });
      localStorage.setItem('ym_form_business', data);
      sessionStorage.setItem('ym_form_business', data);
    } catch {}
  }, [businessState, businessType, businessAge, businessGender, loanNeed, businessTurnover, businessCategory, isUdyamRegistered, isWomenLed]);

  // Persist active search results cache (DO NOT auto-remove on empty hasSearched to prevent wipeout on refresh)
  React.useEffect(() => {
    try {
      if (hasSearched && selectedPersona !== 'unselected' && matchedSchemes.length > 0) {
        const payload = JSON.stringify({
          persona: selectedPersona,
          hasSearched: true,
          matchedSchemes,
          advisorNote,
          discoveryDiagnostics,
          unverifiedCandidatesList,
        });
        localStorage.setItem('ym_search_cache', payload);
        sessionStorage.setItem('ym_search_cache', payload);
      }
    } catch {}
  }, [hasSearched, selectedPersona, matchedSchemes, advisorNote, discoveryDiagnostics, unverifiedCandidatesList]);

  // Clickable Logo: Navigates back home safely, resetting searches and errors
  const handleGoHome = () => {
    try {
      localStorage.setItem('ym_active_persona', 'unselected');
      sessionStorage.setItem('ym_active_persona', 'unselected');
      localStorage.setItem('ym_active_view', 'app');
      sessionStorage.setItem('ym_active_view', 'app');
      localStorage.removeItem('ym_search_cache');
      sessionStorage.removeItem('ym_search_cache');
      window.history.replaceState(null, '', '#home');
    } catch {}
    setCurrentView('app');
    setSelectedPersona('unselected');
    setIsMobileMenuOpen(false);
    setSuccessMessage(null);
    setErrorMessage(null);
    setHasSearched(false);
    setMatchedSchemes([]);
    setUnverifiedCandidatesList([]);
    setDiscoveryDiagnostics(null);
    setAgentLogs([]);
    setAdvisorNote('');
    setIsProcessing(false);
    setSelectedCategoryFilter('All');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (user: UserSession) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('yojanamitra_user', JSON.stringify(user));
    } catch {
      // ignore
    }

    setIsAuthModalOpen(false);
    setAuthModalReason(null);

    // If user clicked a specific persona track (Student, Farmer, Citizen, Business), open that persona's page.
    // If user logged in from the header button, stay on the HOME PAGE (selectedPersona = 'unselected').
    if (pendingPersona) {
      setSelectedPersona(pendingPersona);
      const userState = user.state || '';
      if (pendingPersona === 'student' && userState) {
        setStudentState(userState);
      } else if (pendingPersona === 'farmer' && userState) {
        setFarmerState(userState);
      } else if (pendingPersona === 'business' && userState) {
        setBusinessState(userState);
      } else if (pendingPersona === 'citizen' && userState) {
        setCitizenState(userState);
      }
      setPendingPersona(null);
    } else {
      setSelectedPersona('unselected');
      setPendingPersona(null);
    }

    setCurrentView('app');
    const stateTag = user.state ? ` (${user.state})` : '';
    setSuccessMessage(`Welcome back, ${user.name}! Citizen profile synchronized${stateTag}.`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    try {
      localStorage.setItem('ym_active_persona', 'unselected');
      sessionStorage.setItem('ym_active_persona', 'unselected');
      localStorage.removeItem('ym_search_cache');
      sessionStorage.removeItem('ym_search_cache');
      window.history.replaceState(null, '', '#home');
    } catch {}
    setCurrentUser(null);
    setSelectedPersona('unselected');
    try {
      localStorage.removeItem('yojanamitra_user');
      logOutFirebase();
    } catch {
      // ignore
    }
    setSuccessMessage('You have been securely signed out.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Switch persona cleanly: resets previous results and previous form values so user starts fresh
  const handleSelectPersona = (persona: 'student' | 'farmer' | 'citizen' | 'business') => {
    // Intercept if unauthenticated: popup login in middle before proceeding - without login no work ahead
    if (!currentUser) {
      setPendingPersona(persona);
      setAuthMode('login');
      const trackName = persona === 'student'
        ? 'Student Academic Profile'
        : persona === 'farmer'
        ? 'Farmer Agriculture & Kisan Profile'
        : persona === 'citizen'
        ? 'Citizen & Family Welfare Profile'
        : 'Business & MSME Profile';
      setAuthModalReason(`Citizen Authentication Required: Please sign in or register to access the ${trackName}.`);
      setIsAuthModalOpen(true);
      return;
    }

    try {
      localStorage.setItem('ym_active_persona', persona);
      sessionStorage.setItem('ym_active_persona', persona);
      localStorage.removeItem('ym_search_cache');
      sessionStorage.removeItem('ym_search_cache');
      window.history.replaceState(null, '', `#${persona}`);
    } catch {}

    setSelectedPersona(persona);
    setCurrentView('app');
    setIsMobileMenuOpen(false);
    setHasSearched(false);
    setMatchedSchemes([]);
    setAgentLogs([]);
    setAdvisorNote('');
    setSuccessMessage(null);
    setErrorMessage(null);
    setIsProcessing(false);
    setSelectedCategoryFilter('All');

    // Reset fields for chosen category to clean defaults
    if (persona === 'student') {
      setStudentAge('');
      setStudentGender('');
      setStudentState('');
      setStudentIncome('');
      setEducationLevel('');
      setStudentCategory('');
    } else if (persona === 'farmer') {
      setFarmerAge('');
      setFarmerGender('');
      setFarmerState('');
      setFarmerIncome('');
      setFarmerType('');
      setFarmerCategory('');
    } else if (persona === 'citizen') {
      setCitizenAge('');
      setCitizenGender('');
      setCitizenState('');
      setCitizenIncome('');
      setCitizenOccupation('');
      setCitizenCategory('');
    } else if (persona === 'business') {
      setBusinessAge('');
      setBusinessGender('');
      setBusinessState('');
      setBusinessTurnover('');
      setBusinessType('');
      setBusinessCategory('');
    }
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Option to view all verified schemes strictly for the active category
  const handleViewCategorySchemes = async (personaOverride?: 'student' | 'farmer' | 'citizen' | 'business') => {
    if (!currentUser) {
      setAuthMode('login');
      setAuthModalReason('Citizen Authentication Required: Please sign in to browse verified schemes.');
      setIsAuthModalOpen(true);
      return;
    }

    const targetPersona = personaOverride || (selectedPersona !== 'unselected' ? selectedPersona : 'student');
    const currentState = targetPersona === 'student' ? studentState : targetPersona === 'farmer' ? farmerState : targetPersona === 'citizen' ? citizenState : businessState;
    const categoryLabel = targetPersona === 'student'
      ? 'Student Scholarships & Educational Aid'
      : targetPersona === 'farmer'
      ? 'Agriculture & Farmer Welfare Schemes'
      : targetPersona === 'business'
      ? 'Business & MSME Loans and Subsidies'
      : 'Citizen Welfare, Health & Family Schemes';

    setIsProcessing(true);
    setSearchStage(2);
    setSelectedCategoryFilter('All');
    setHasSearched(true);
    setSuccessMessage(`Searching live registries for ${categoryLabel}...`);

    try {
      const liveRes = await searchLiveSchemesApi({
        persona: targetPersona,
        state: currentState || 'All India / Central',
        gender: 'All',
        occupation: targetPersona === 'student' ? 'Student' : targetPersona === 'farmer' ? 'Farmer' : targetPersona === 'business' ? 'Self Employed' : 'Any',
        annualIncome: 180000,
        socialCategory: 'General'
      });

      setMatchedSchemes(liveRes.matched);
      setUnverifiedCandidatesList((liveRes as any).unverifiedCandidates || []);
      setDiscoveryDiagnostics(liveRes.diagnostics || null);

      setAdvisorNote(
        `Here are the verified ${categoryLabel.toLowerCase()} available for you. Click "Scheme Page" for guidelines or "Direct Apply" to register on the official portal.`
      );
      setSuccessMessage(`Loaded ${liveRes.matched.length} verified ${categoryLabel.toLowerCase()} matching your profile.`);
    } catch {
      // Offline fallback
      const categorySchemes = getSchemesForCategory(targetPersona, currentState);
      const allFormatted: MatchedScheme[] = categorySchemes.map(scheme => {
        const verified = resolveVerifiedSchemeLinks(scheme);
        return {
          scheme: {
            ...scheme,
            officialUrl: verified.officialUrl,
            applyUrl: verified.applyUrl,
            portalName: verified.portalName,
            sourceType: 'fallback_cache',
            evidenceStatus: 'unverified',
            deadline: null,
            deadlineStatus: 'unknown',
            eligibilityStatus: 'potentially_eligible',
            sourceUrls: [verified.officialUrl],
            lastVerified: new Date().toISOString()
          },
          matchScore: 90,
          qualificationReasons: [
            `Curated reference archive match for ${scheme.level} scheme`,
            'Reference dataset fallback',
            'Direct online application portal verified on official repository'
          ]
        };
      });
      setMatchedSchemes(allFormatted);
      setAdvisorNote(
        `Displaying ${allFormatted.length} schemes from the curated reference archive. Click "Scheme Page" for guidelines or "Direct Apply" to register.`
      );
      setSuccessMessage(`Loaded ${allFormatted.length} curated archive schemes.`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Run the multi-agent pipeline tailored to the chosen persona
  const handleRunPipeline = async () => {
    // 0. Authentication guard: without login no work ahead
    if (!currentUser) {
      setAuthMode('login');
      setAuthModalReason('Citizen Authentication Required: Please sign in or create an account to discover eligible schemes.');
      setIsAuthModalOpen(true);
      return;
    }

    // 1. Guard against unselected persona
    if (selectedPersona === 'unselected') {
      setErrorMessage('Please select a category (Student or Farmer) and provide your details to search.');
      return;
    }

    const isStudent = selectedPersona === 'student';
    const isFarmer = selectedPersona === 'farmer';
    const isCitizen = selectedPersona === 'citizen';
    const isBusiness = selectedPersona === 'business';

    const activeState = (
      isStudent ? studentState :
      isFarmer ? farmerState :
      isCitizen ? citizenState :
      businessState
    )?.trim();

    // 1. Mandatory State verification & MVP Scope Enforcement
    if (!activeState) {
      const stateLabel = isStudent
        ? 'State of Study / Domicile'
        : isFarmer
        ? 'State of Agricultural Land'
        : isCitizen
        ? 'State of Residence'
        : 'State of Enterprise / Operation';
      setErrorMessage(`Input mandatory: Please select your ${stateLabel} to proceed with searching.`);
      return;
    }

    const normActiveState = activeState.toLowerCase();
    const isSupportedMvpState = normActiveState.includes('delhi') || normActiveState.includes('uttar pradesh') || normActiveState.includes('bihar');
    if (!isSupportedMvpState) {
      setErrorMessage(`Controlled MVP Scope: YojanaMitra live discovery is currently enabled for Delhi, Uttar Pradesh, and Bihar. Additional states and UTs are scheduled for nationwide rollout.`);
      return;
    }


    // Optional user search query (State selection is the only mandatory requirement)
    const cleanSearchQuery = searchQuery.trim();

    // Rate-limiting check to prevent DDoS / API token exhaustion
    const now = Date.now();
    if (now - lastSearchTime < 4000) {
      setErrorMessage('Security notice: Rate limit active. Please wait 4 seconds between AI searches.');
      return;
    }
    setLastSearchTime(now);

    setIsProcessing(true);
    setHasSearched(true);
    setAgentLogs([]);
    setMatchedSchemes([]);
    setAdvisorNote('');
    setSuccessMessage(null);
    setErrorMessage(null);

    const rawState = activeState;
    const resolvedState = rawState === 'All India / Central' || !rawState ? 'India' : rawState;

    const rawAge = isStudent ? studentAge : isFarmer ? farmerAge : isCitizen ? citizenAge : businessAge;
    const rawIncome = isStudent ? studentIncome : isFarmer ? farmerIncome : isCitizen ? citizenIncome : businessTurnover;

    const parsedIncome = typeof rawIncome === 'number' && !isNaN(rawIncome)
      ? rawIncome
      : (typeof rawIncome === 'string' && rawIncome.trim() !== '' && !isNaN(Number(rawIncome))
          ? Number(rawIncome)
          : undefined);

    // Validate demographics to prevent business logic bypass (e.g. negative income, impossible age)
    const validatedDemo = sanitizeDemographics({
      age: typeof rawAge === 'number' && rawAge > 0 ? rawAge : undefined,
      annualIncome: parsedIncome !== undefined ? Math.max(0, parsedIncome) : 150000
    });

    const rawCategory = (isStudent ? studentCategory : isFarmer ? farmerCategory : isCitizen ? citizenCategory : businessCategory) || 'General';
    const rawGender = (isStudent ? studentGender : isFarmer ? farmerGender : isCitizen ? citizenGender : businessGender) || 'All';

    const profile: UserProfile = {
      persona: selectedPersona,
      age: validatedDemo.age,
      gender: (rawGender as any) || 'All',
      state: resolvedState,
      occupation: isStudent ? 'Student' : isFarmer ? 'Farmer' : isBusiness ? 'Self Employed' : (citizenOccupation as any) || 'Daily Wage Earner',
      annualIncome: validatedDemo.annualIncome,
      socialCategory: (rawCategory as any) || 'General',
      educationLevel: (isStudent && educationLevel ? educationLevel : 'Any') as any,
      courseStream: isStudent && courseStream ? courseStream : undefined,
      farmerType: (isFarmer && farmerType ? farmerType : 'Any') as any,
      isDifferentlyAbled: isDifferentlyAbled,
      hasBplCard: isCitizen ? (familyRationType.includes('PHH') || familyRationType.includes('AAY') || hasBplCard) : false,
      businessType: isBusiness ? (businessType || undefined) : undefined,
      familyRationType: isCitizen ? (familyRationType || undefined) : undefined
    };

    const addLog = (log: AgentLog) => {
      setAgentLogs(prev => [log, ...prev]);
    };

    try {
      // Agent 1: Persona Specialist Intake
      const personaRole = isStudent
        ? 'Scholarship & Academic Track Specialist'
        : isFarmer
        ? 'Agricultural & Rural Credit Specialist'
        : isCitizen
        ? 'Citizen & Family Welfare Specialist'
        : 'MSME & Business Finance Specialist';

      const incomeDisplay = `₹${validatedDemo.annualIncome.toLocaleString()}`;

      addLog({
        id: `log-${Date.now()}-1`,
        agentName: 'Intake Agent',
        agentRole: personaRole,
        apiKeyUsed: 'Agent 1 (Intake)',
        timestamp: new Date().toLocaleTimeString(),
        status: 'success',
        message: isStudent
          ? `Validated Student Profile: ${educationLevel || 'Any Level'} (${courseStream || 'General'}) • ${studentCategory || 'General'} • State: ${studentState || 'All India'} • Income: ${incomeDisplay}${cleanSearchQuery ? ` • Search Goal: "${cleanSearchQuery}"` : ''}`
          : isFarmer
          ? `Validated Farmer Profile: ${farmerType || 'General'} Farmer • Crop: ${farmerCropSeason || 'General'} • State: ${farmerState || 'All India'} • Income: ${incomeDisplay}${cleanSearchQuery ? ` • Search Goal: "${cleanSearchQuery}"` : ''}`
          : isCitizen
          ? `Validated Citizen Profile: Ration: ${familyRationType || 'General'} • Housing: ${housingCondition || 'General'} • State: ${citizenState || 'All India'} • Income: ${incomeDisplay}${cleanSearchQuery ? ` • Search Goal: "${cleanSearchQuery}"` : ''}`
          : `Validated Business Profile: ${businessType || 'MSME'} • Need: ${loanNeed || 'Credit'} • State: ${businessState || 'All India'} • Turnover: ${incomeDisplay}${cleanSearchQuery ? ` • Search Goal: "${cleanSearchQuery}"` : ''}`
      });

      // Agent 2: Live AI Scheme & Scholarship Search Engine (TinyFish + OpenRouter)
      setSearchStage(2);
      const { matched, advisoryNote: liveAdvisoryNote, diagnostics, unverifiedCandidates } = await runEligibilityAgent(
        profile,
        log => {
          addLog(log);
          const msg = log.message.toLowerCase();
          if (msg.includes('reading') || msg.includes('fetching') || msg.includes('page') || msg.includes('portal')) {
            setSearchStage(prev => Math.max(prev, 3));
          } else if (msg.includes('extraction') || msg.includes('openrouter') || msg.includes('groq') || msg.includes('grounding') || msg.includes('evaluating')) {
            setSearchStage(prev => Math.max(prev, 4));
          }
        },
        cleanSearchQuery
      );
      setDiscoveryDiagnostics(diagnostics || null);
      setUnverifiedCandidatesList(unverifiedCandidates || []);
      setSearchStage(5);
      
      // Prioritize schemes matching track and user demographic eligibility
      const categoryMatched = isStudent
        ? [...matched.filter(m => m.scheme.category === 'Education'), ...matched.filter(m => m.scheme.category !== 'Education')]
        : isFarmer
        ? [...matched.filter(m => m.scheme.category === 'Agriculture'), ...matched.filter(m => m.scheme.category !== 'Agriculture')]
        : isCitizen
        ? [...matched.filter(m => ['Food & Civil Supplies', 'Housing', 'Healthcare', 'Social Security', 'Women & Child'].includes(m.scheme.category)), ...matched.filter(m => !['Food & Civil Supplies', 'Housing', 'Healthcare', 'Social Security', 'Women & Child'].includes(m.scheme.category))]
        : [...matched.filter(m => ['Business & MSME', 'Employment'].includes(m.scheme.category)), ...matched.filter(m => !['Business & MSME', 'Employment'].includes(m.scheme.category))];

      const prioritized = categoryMatched.sort((a, b) => {
        const rank = (m?: string) => m === 'matched' ? 3 : m === 'unknown' ? 2 : 1;
        const diff = rank(b.scheme.eligibilityMatch) - rank(a.scheme.eligibilityMatch);
        if (diff !== 0) return diff;
        return (b.matchScore || 0) - (a.matchScore || 0);
      });

      setMatchedSchemes(prioritized);

      // Agent 3: Verifier Sentinel (TinyFish)
      await runVerifierAgent(prioritized, addLog);

      // Set clean human success message reflecting true match status
      const trackName = isStudent ? 'scholarships' : isFarmer ? 'agricultural schemes' : isCitizen ? 'citizen & family welfare schemes' : 'business loans & subsidies';
      
      const seenEligibleTitles = new Set<string>();
      const trulyEligible = prioritized.filter(m => {
        if (m.scheme.verificationStatus === 'unverified_candidate' || m.scheme.verificationStatus === 'rejected') return false;
        if (m.scheme.eligibilityMatch === 'not_matched' || m.scheme.eligibilityStatus === 'not_eligible' || (m.scheme.eligibility as any)?.matchState === 'not_matched') return false;
        
        const combinedReasons = [
          ...(m.qualificationReasons || []),
          ...(m.missingOrCautionCriteria || []),
          ...((m.scheme.eligibility as any)?.reasons || [])
        ].join(' ').toLowerCase();

        if (
          combinedReasons.includes('exceeds scheme limit') ||
          combinedReasons.includes('profile indicates male') ||
          combinedReasons.includes('restricted to female') ||
          combinedReasons.includes('restricted exclusively to female') ||
          combinedReasons.includes('reserved for differently-abled') ||
          combinedReasons.includes('standard applicant profile not eligible') ||
          combinedReasons.includes('reserved for sc/st/obc') ||
          combinedReasons.includes('exclusively reserved for obc') ||
          combinedReasons.includes('reserved for obc') ||
          combinedReasons.includes('exclusively reserved for scheduled caste') ||
          combinedReasons.includes('reserved for sc') ||
          combinedReasons.includes('exclusively reserved for scheduled tribe') ||
          combinedReasons.includes('reserved for st') ||
          combinedReasons.includes('exclusively reserved for minority') ||
          combinedReasons.includes('reserved for minority')
        ) {
          return false;
        }

        const schemeTitleLower = (m.scheme.name || '').toLowerCase();
        // Category safeguard: if user selected General, reject reserved schemes
        if (rawCategory.toLowerCase() === 'general' || rawCategory.toLowerCase().includes('unreserved')) {
          if (/\b(for obc|for sc\b|for st\b|for minority|obc students?|sc students?|st students?)\b/i.test(schemeTitleLower)) {
            return false;
          }
        }
        // Gender safeguard: if user did not select female, reject girls-only schemes
        if (rawGender.toLowerCase() !== 'female') {
          if (/\b(girl students?|for girls|girls only|pragati scholarship|kanya utthan)\b/i.test(schemeTitleLower)) {
            return false;
          }
        }
        if (m.scheme.deadlineStatus === 'closed') return false;
        const schemeBenefit = (m.scheme.benefit || (m.scheme as any).benefits || '') as string;
        const schemeApply = m.scheme.applyUrl || (m.scheme as any).applicationUrl;
        if (m.scheme.verificationStatus === 'partially_verified' && schemeBenefit.toLowerCase().includes('not verified from primary source') && !schemeApply) return false;
        if (isStudent && m.scheme.category !== 'Education') return false;
        if (isFarmer && m.scheme.category !== 'Agriculture') return false;
        if (isBusiness && !['Business & MSME', 'Employment'].includes(m.scheme.category)) return false;
        if (isCitizen && !['Healthcare', 'Housing', 'Food & Civil Supplies', 'Women & Child', 'Social Security'].includes(m.scheme.category)) return false;
        
        // Deduplicate schemes with identical clean titles
        const cleanTitle = (m.scheme.name || '').toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
        if (seenEligibleTitles.has(cleanTitle)) return false;
        seenEligibleTitles.add(cleanTitle);
        return true;
      });

      // Agent 4: Advisor Agent
      const { advisoryNote: note } = await runAdvisorAgent(profile, trulyEligible, addLog, liveAdvisoryNote);
      setAdvisorNote(note);

      const strictlyMatched = trulyEligible.filter(m => m.scheme.eligibilityMatch === 'matched').length;
      if (strictlyMatched > 0) {
        setSuccessMessage(`Found ${strictlyMatched} ${trackName} strictly aligned with your entered profile (${trulyEligible.length} total eligible in ${resolvedState}).`);
        // Vibrant Neo-Glass Brutalist Confetti
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#FFE600', '#00F5D4', '#8B5CF6', '#FF5470', '#000000'],
          shapes: ['square']
        });
      } else if (trulyEligible.length > 0) {
        setSuccessMessage(`Found ${trulyEligible.length} verified government ${trackName} for ${resolvedState}. Check eligibility criteria below.`);
      } else {
        setSuccessMessage(null);
      }

      // Explicitly persist search cache to storage immediately
      try {
        const payload = JSON.stringify({
          persona: selectedPersona,
          hasSearched: true,
          matchedSchemes: prioritized,
          advisorNote: note,
          discoveryDiagnostics,
          unverifiedCandidatesList,
        });
        localStorage.setItem('ym_search_cache', payload);
        sessionStorage.setItem('ym_search_cache', payload);
      } catch {}
    } catch (err: any) {
      const rawErrMsg = err?.message || 'Unable to connect to live government registers. Falling back to cached verified database.';
      const errMsg = scrubSecrets(rawErrMsg);
      console.warn('Pipeline notice (sanitized):', errMsg);
      setErrorMessage(errMsg);
      addLog({
        id: `err-${Date.now()}`,
        agentName: 'Eligibility Agent',
        agentRole: 'Pipeline Supervisor',
        apiKeyUsed: 'Fallback Engine',
        timestamp: new Date().toLocaleTimeString(),
        status: 'failed',
        message: `Pipeline notice: ${errMsg}`
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const seenFilteredTitles = new Set<string>();
  const filteredSchemes = matchedSchemes.filter(m => {
    // Strictly isolate unverified candidates from the verified schemes list
    if (m.scheme.verificationStatus === 'unverified_candidate' || m.scheme.verificationStatus === 'rejected') return false;

    // Strict eligibility requirement: exclude schemes where criteria are not met for this user profile
    if (
      m.scheme.eligibilityMatch === 'not_matched' ||
      m.scheme.eligibilityStatus === 'not_eligible' ||
      (m.scheme.eligibility as any)?.matchState === 'not_matched'
    ) {
      return false;
    }

    const combinedReasons = [
      ...(m.qualificationReasons || []),
      ...(m.missingOrCautionCriteria || []),
      ...((m.scheme.eligibility as any)?.reasons || [])
    ].join(' ').toLowerCase();

    if (
      combinedReasons.includes('exceeds scheme limit') ||
      combinedReasons.includes('profile indicates male') ||
      combinedReasons.includes('restricted to female') ||
      combinedReasons.includes('reserved for differently-abled') ||
      combinedReasons.includes('standard applicant profile not eligible')
    ) {
      return false;
    }

    // Exclude schemes whose application window has ended/closed from active results
    if (m.scheme.deadlineStatus === 'closed') return false;

    // Exclude partially verified circulars/notices with unverified benefit and no application portal
    const schemeBenefit = (m.scheme.benefit || (m.scheme as any).benefits || '') as string;
    const schemeApply = m.scheme.applyUrl || (m.scheme as any).applicationUrl;
    if (
      m.scheme.verificationStatus === 'partially_verified' &&
      schemeBenefit.toLowerCase().includes('not verified from primary source') &&
      !schemeApply
    ) {
      return false;
    }

    // Strict persona partition guard:
    if (selectedPersona === 'student' && m.scheme.category !== 'Education') return false;
    if (selectedPersona === 'farmer' && m.scheme.category !== 'Agriculture') return false;
    if (selectedPersona === 'business' && !['Business & MSME', 'Employment'].includes(m.scheme.category)) return false;
    if (selectedPersona === 'citizen' && !['Healthcare', 'Housing', 'Food & Civil Supplies', 'Women & Child', 'Social Security'].includes(m.scheme.category)) return false;

    // Deduplicate schemes with identical clean titles
    const cleanTitle = (m.scheme.name || '').toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
    if (seenFilteredTitles.has(cleanTitle)) return false;
    seenFilteredTitles.add(cleanTitle);

    if (selectedCategoryFilter === 'All') return true;
    return m.scheme.category === selectedCategoryFilter;
  });

  const displayedSchemes = showOnlyBookmarks
    ? bookmarkedSchemes.filter(m => {
        if (selectedCategoryFilter === 'All') return true;
        return m.scheme.category === selectedCategoryFilter;
      })
    : filteredSchemes;

  const activeState = selectedPersona === 'student' ? studentState : selectedPersona === 'farmer' ? farmerState : selectedPersona === 'citizen' ? citizenState : businessState;
  const isFallbackMode = matchedSchemes.length > 0 && matchedSchemes.some(m => m.scheme.sourceType === 'fallback_cache');
  const currentCategoryLabel =
    selectedPersona === 'student'
      ? 'Student Scholarships'
      : selectedPersona === 'farmer'
      ? 'Agriculture & Kisan Schemes'
      : selectedPersona === 'business'
      ? 'Business & MSME Loans'
      : 'Citizen Welfare & Health Schemes';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', color: '#0F172A', width: '100%', overflowX: 'hidden', position: 'relative' }}>


      {/* National Tricolor Top Ribbon (Official Government of India Motif) */}
      <div className="gov-tricolor-bar" />
      {/* Refracting Ambient Vibrant Mesh Layer (Glassmorphism backdrop) */}
      <div className="ambient-frost-mesh">
        <div className="ambient-frost-orb-1" />
        <div className="ambient-frost-orb-2" />
        <div className="ambient-frost-orb-3" />
      </div>

      {/* Neo-Glass Brutalist Header */}
      <header
        className="neoglass-header"
        style={{
          padding: '14px 24px',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        <div
          style={{
            maxWidth: 1380,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            width: '100%'
          }}
        >
          {/* Clickable Brand Logo with Vibrant Neo-Glass Yellow Accent */}
          <div
            onClick={handleGoHome}
            role="button"
            tabIndex={0}
            title="Return to YojanaMitra Home"
            onKeyDown={e => e.key === 'Enter' && handleGoHome()}
            style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', userSelect: 'none' }}
          >
            <div
              className="header-logo-icon"
              style={{
                width: 44,
                height: 44,
                background: 'linear-gradient(135deg, #FF7700 0%, #EA580C 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 12,
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                fontSize: '1.15rem',
                border: '1.5px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 4px 14px -1px rgba(234, 88, 12, 0.35)',
                flexShrink: 0
              }}
            >
              YM
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span className="font-display header-brand-text" style={{ fontSize: '1.42rem', fontWeight: 900, letterSpacing: '-0.03em', textTransform: 'uppercase', color: '#0B2545', whiteSpace: 'nowrap' }}>
                  Yojana<span style={{ background: 'linear-gradient(135deg, #FF7700 0%, #EA580C 100%)', color: '#FFFFFF', padding: '1px 8px', marginLeft: 4, borderRadius: 6, boxShadow: '0 2px 8px rgba(234, 88, 12, 0.25)' }}>Mitra</span>
                </span>
                <span
                  className="header-tagline-badge"
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    letterSpacing: '0.03em',
                    backgroundColor: '#EFF6FF',
                    color: '#1D4ED8',
                    border: '1px solid #DBEAFE',
                    padding: '3px 10px',
                    borderRadius: 9999,
                    whiteSpace: 'nowrap'
                  }}
                >
                  GOVERNMENT SCHEMES & SCHOLARSHIPS
                </span>
              </div>
              <div className="header-subtitle-text" style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 600 }}>
                Official Welfare Directory & Eligibility Guide • जन कल्याण सहायक
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="desktop-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {selectedPersona !== 'unselected' && currentView === 'app' && (
              <button
                onClick={handleGoHome}
                className="mono-btn-outline"
                style={{ padding: '7px 14px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
              >
                <ArrowLeft size={13} />
                <span>CHANGE CATEGORY</span>
              </button>
            )}

            {bookmarkedSchemes.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setShowOnlyBookmarks(!showOnlyBookmarks);
                  const el = document.getElementById('results-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="mono-btn-outline"
                title="View your saved schemes & scholarships"
                style={{
                  padding: '7px 12px',
                  fontSize: '0.72rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontWeight: 700,
                  backgroundColor: showOnlyBookmarks ? '#FEF3C7' : 'rgba(255, 255, 255, 0.88)',
                  borderColor: showOnlyBookmarks ? '#F59E0B' : '#E2E8F0',
                  color: showOnlyBookmarks ? '#B45309' : '#475569'
                }}
              >
                <Bookmark size={13} fill={showOnlyBookmarks ? '#D97706' : 'none'} color={showOnlyBookmarks ? '#D97706' : '#64748B'} />
                <span>SAVED ({bookmarkedSchemes.length})</span>
              </button>
            )}

            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    backgroundColor: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    borderRadius: 9999,
                    padding: '5px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <User size={13} color="#1D4ED8" />
                  <span className="font-mono" style={{ fontSize: '0.72rem', fontWeight: 800, color: '#1E40AF' }}>
                    {currentUser.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mono-btn-ghost"
                  title="Sign out of citizen session"
                  style={{ padding: '6px 10px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: 4, color: '#DC2626' }}
                >
                  <LogOut size={13} />
                  <span>LOGOUT</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => { setPendingPersona(null); setAuthMode('login'); setAuthModalReason(null); setIsAuthModalOpen(true); }}
                  className="mono-btn-outline"
                  style={{ padding: '7px 14px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
                >
                  <LogIn size={13} />
                  <span>SIGN IN</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setPendingPersona(null); setAuthMode('signup'); setAuthModalReason(null); setIsAuthModalOpen(true); }}
                  className="mono-btn-primary"
                  style={{
                    padding: '7px 16px',
                    fontSize: '0.72rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontWeight: 800,
                    borderRadius: 9999,
                    background: 'linear-gradient(135deg, #FF7700 0%, #EA580C 100%)',
                    color: '#FFFFFF'
                  }}
                >
                  <UserPlus size={13} />
                  <span>SIGN UP</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Quick Action Buttons & Menu Toggle */}
          <div className="mobile-nav-toggle" style={{ display: 'none', alignItems: 'center', gap: 6 }}>
            {currentUser ? (
              <div
                style={{
                  backgroundColor: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  borderRadius: 9999,
                  padding: '5px 9px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <User size={12} color="#1D4ED8" />
                <span className="font-mono" style={{ fontSize: '0.68rem', fontWeight: 800, color: '#1E40AF', maxWidth: 75, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentUser.name?.split(' ')[0] || 'Citizen'}
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => { setPendingPersona(null); setAuthMode('login'); setAuthModalReason(null); setIsAuthModalOpen(true); }}
                className="mono-btn-outline"
                style={{
                  padding: '6px 11px',
                  fontSize: '0.72rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  borderRadius: 8
                }}
              >
                <LogIn size={13} />
                <span>SIGN IN</span>
              </button>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="mono-btn-outline"
              style={{ padding: '7px 10px', minHeight: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer with Frosted Glass Overlay */}
        {isMobileMenuOpen && (
          <div
            className="animate-entrance"
            style={{
              marginTop: 14,
              padding: '20px 16px',
              borderRadius: 16,
              border: '1px solid rgba(226, 232, 240, 0.9)',
              boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.1)',
              backgroundColor: 'rgba(255, 255, 255, 0.96)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}
          >
            {currentUser ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 8, borderBottom: '1px solid #E5E7EB' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <User size={14} color="#1D4ED8" />
                  <span className="font-mono" style={{ fontSize: '0.74rem', fontWeight: 800, color: '#1E40AF' }}>
                    {currentUser.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                  className="mono-btn-ghost"
                  style={{ justifyContent: 'flex-start', padding: '6px 0', fontSize: '0.74rem', color: '#DC2626', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <LogOut size={14} />
                  <span>LOGOUT</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8, paddingBottom: 8, borderBottom: '1px solid #E5E7EB' }}>
                <button
                  type="button"
                  onClick={() => { setPendingPersona(null); setAuthMode('login'); setAuthModalReason(null); setIsAuthModalOpen(true); setIsMobileMenuOpen(false); }}
                  className="mono-btn-outline"
                  style={{ flex: 1, padding: '8px 12px', fontSize: '0.74rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <LogIn size={14} />
                  <span>SIGN IN</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setPendingPersona(null); setAuthMode('signup'); setAuthModalReason(null); setIsAuthModalOpen(true); setIsMobileMenuOpen(false); }}
                  className="mono-btn-primary"
                  style={{ flex: 1, padding: '8px 12px', fontSize: '0.74rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'linear-gradient(135deg, #FF7700 0%, #EA580C 100%)', color: '#FFFFFF' }}
                >
                  <UserPlus size={14} />
                  <span>SIGN UP</span>
                </button>
              </div>
            )}

            {selectedPersona !== 'unselected' && currentView === 'app' && (
              <button
                onClick={handleGoHome}
                className="mono-btn-outline"
                style={{ width: '100%', justifyContent: 'flex-start', display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <ArrowLeft size={14} />
                <span>CHANGE CATEGORY</span>
              </button>
            )}

            <div className="font-mono" style={{ fontSize: '0.68rem', color: '#4B5563', padding: '8px 0', borderTop: '1px solid #E5E7EB', fontWeight: 700 }}>
              OFFICIAL GOVERNMENT PORTALS:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <a href="https://scholarships.gov.in" target="_blank" rel="noopener noreferrer" className="font-mono" style={{ color: '#000000', fontSize: '0.75rem', textDecoration: 'underline' }}>
                • National Scholarship Portal (NSP) ↗
              </a>
              <a href="https://www.myscheme.gov.in" target="_blank" rel="noopener noreferrer" className="font-mono" style={{ color: '#000000', fontSize: '0.75rem', textDecoration: 'underline' }}>
                • MyScheme National Platform ↗
              </a>
              <a href="https://dbtbharat.gov.in" target="_blank" rel="noopener noreferrer" className="font-mono" style={{ color: '#000000', fontSize: '0.75rem', textDecoration: 'underline' }}>
                • Direct Benefit Transfer (DBT) ↗
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Live Frosted Telemetry Ticker Strip: Latest Central Schemes & Scholarships Across India */}
      <div
        style={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'linear-gradient(90deg, #0B2545 0%, #172554 50%, #0B2545 100%)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          color: '#FFFFFF',
          padding: '9px 0',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          width: '100%',
          boxShadow: '0 4px 14px rgba(11, 37, 69, 0.15)'
        }}
      >
        <div className="mono-ticker-track font-mono" style={{ fontSize: '0.74rem', letterSpacing: '0.04em', display: 'flex', alignItems: 'center' }}>
          {[1, 2].map(iteration => (
            <React.Fragment key={iteration}>
              <span style={{ padding: '0 24px', color: '#FDBA74', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    backgroundColor: '#EA580C',
                    color: '#FFFFFF',
                    fontSize: '0.66rem',
                    fontWeight: 900,
                    letterSpacing: '0.08em',
                    padding: '2px 7px',
                    border: '1px solid rgba(255, 255, 255, 0.35)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      width: 6,
                      height: 6,
                      backgroundColor: '#10B981'
                    }}
                  />
                  LIVE UPDATES
                </span>
                <span style={{ color: '#E2E8F0', fontWeight: 700 }}>
                  Official Central & State Portal Notices (2025–26)
                </span>
              </span>
              {headlines.map(hl => {
                const targetUrl = hl.url || (hl.portal ? (hl.portal.startsWith('http') ? hl.portal : `https://${hl.portal}`) : 'https://scholarships.gov.in/');
                return (
                  <a
                    key={`${iteration}-${hl.id}`}
                    href={targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Open official portal for ${hl.title} (${targetUrl})`}
                    className="headline-ticker-link"
                    style={{
                      padding: '2px 18px',
                      color: '#CBD5E1',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      textDecoration: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ color: '#F97316', fontWeight: 900 }}>•</span>
                    <span
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.14)',
                        color: hl.tagColor || '#FDBA74',
                        padding: '2px 7px',
                        fontSize: '0.67rem',
                        fontWeight: 800,
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: 3
                      }}
                    >
                      {hl.tag}
                    </span>
                    <span style={{ color: '#FFFFFF', fontWeight: 800, textDecoration: 'underline', textDecorationColor: 'rgba(56, 189, 248, 0.6)' }}>
                      {hl.title} ↗
                    </span>
                    <span style={{ color: '#94A3B8' }}>—</span>
                    <span style={{ color: '#E2E8F0', fontWeight: 500 }}>
                      {hl.detail}
                    </span>
                  </a>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* CUSTOM ERROR PAGE (Triggered when an unexpected error occurs) */}
      {currentView === 'error' ? (
        <main
          className="app-container animate-entrance"
          style={{
            padding: '80px 24px',
            textAlign: 'center',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', borderRadius: 9999, backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', fontWeight: 700, fontSize: '0.75rem', marginBottom: 20 }}>
            <AlertTriangle size={14} />
            Temporary Service Notice
          </div>
          <h1 className="font-display" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.03em', color: '#0B2545', marginBottom: 16 }}>
            Service Temporarily Unavailable
          </h1>
          <div style={{ width: 100, height: 2, margin: '16px auto 24px', backgroundColor: '#E2E8F0' }} />
          <p className="font-body" style={{ fontSize: '1.05rem', color: '#4B5563', maxWidth: 580, margin: '0 auto 28px', lineHeight: 1.6 }}>
            {errorMessage || 'We could not complete your request at this moment. Please return to the homepage or reload the page.'}
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handleGoHome}
              className="mono-btn-primary"
              style={{ padding: '14px 28px', fontSize: '0.85rem' }}
            >
              ← RETURN TO YOJANAMITRA HOME
            </button>
            <button
              onClick={() => window.location.reload()}
              className="mono-btn-outline"
              style={{ padding: '14px 24px', fontSize: '0.85rem' }}
            >
              RELOAD PAGE
            </button>
          </div>
        </main>
      ) : currentView === 'auth' ? (
        <AuthPage
          onLoginSuccess={handleLoginSuccess}
          onBackToApp={() => setCurrentView('app')}
          initialMode={authMode}
          statesList={INDIAN_STATES}
        />
      ) : selectedPersona === 'unselected' ? (
        /* STEP 0: PERSONA SELECTION SCREEN */
        <main
          className="app-container"
          style={{
            padding: '64px 24px',
            textAlign: 'center',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          {/* Clean, Human-Crafted Display Headline */}
          <h2
            className="font-display editorial-headline"
            style={{
              fontSize: 'clamp(2.1rem, 4.5vw, 3.8rem)',
              fontWeight: 900,
              letterSpacing: '-0.035em',
              lineHeight: 1.12,
              marginBottom: 16,
              color: '#0B2545'
            }}
          >
            Find Government Schemes & Scholarships You Actually Qualify For
          </h2>

          <p
            className="font-body"
            style={{
              fontSize: '1.1rem',
              color: '#475569',
              maxWidth: 760,
              margin: '0 auto 36px',
              lineHeight: 1.65
            }}
          >
            Direct, verified access to official Central and State welfare programs, student scholarships, and agricultural subsidies — free of middlemen, agents, and outdated forms.
          </p>

          {/* Decorative Soft Divider */}
          <div style={{ position: 'relative', maxWidth: 840, margin: '0 auto 48px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '100%', height: 1, background: 'linear-gradient(90deg, transparent 0%, #CBD5E1 50%, transparent 100%)' }} />
            <div
              style={{
                position: 'absolute',
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FF9933 0%, #138808 100%)',
                boxShadow: '0 0 10px rgba(234, 88, 12, 0.35)'
              }}
            />
          </div>

          {/* 2 Sharp Neo-Glass Brutalist Persona Selection Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 28,
              maxWidth: 900,
              margin: '0 auto',
              width: '100%'
            }}
          >
            {/* OPTION 1: STUDENTS */}
            <div
              onClick={() => handleSelectPersona('student')}
              className="mono-card animate-entrance"
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && handleSelectPersona('student')}
              style={{
                padding: '32px 24px',
                cursor: 'pointer',
                textAlign: 'left',
                borderRadius: 20,
                border: '1px solid rgba(226, 232, 240, 0.85)',
                backgroundColor: 'rgba(255, 255, 255, 0.92)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.06), 0 4px 12px -2px rgba(15, 23, 42, 0.03)',
                transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = '#C4B5FD';
                e.currentTarget.style.boxShadow = '0 20px 38px -6px rgba(139, 92, 246, 0.16), 0 8px 16px -4px rgba(15, 23, 42, 0.06)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.92)';
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.85)';
                e.currentTarget.style.boxShadow = '0 10px 30px -5px rgba(15, 23, 42, 0.06), 0 4px 12px -2px rgba(15, 23, 42, 0.03)';
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      border: '1px solid #DDD6FE',
                      boxShadow: '0 4px 12px rgba(139, 92, 246, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#EDE9FE',
                      color: '#6D28D9'
                    }}
                  >
                    <GraduationCap size={26} strokeWidth={2} />
                  </div>
                  <span className="neoglass-badge-purple">
                    STUDENTS & SCHOLARSHIPS
                  </span>
                </div>

                <h3 className="font-display" style={{ fontSize: '1.65rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 10, textTransform: 'uppercase', color: '#0B2545' }}>
                  Students
                </h3>
                <p className="font-body" style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.55, marginBottom: 24 }}>
                  Pre-Matric, Higher Secondary, Technical & Undergraduate course fee reimbursements, NSP scholarships, AICTE Pragati, and state merit grants.
                </p>
              </div>

              <div
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                  color: '#FFFFFF',
                  borderRadius: 12,
                  boxShadow: '0 4px 14px rgba(124, 58, 237, 0.28)',
                  padding: '12px 16px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all 0.2s ease'
                }}
              >
                {!currentUser && <Lock size={14} style={{ opacity: 0.9 }} />}
                <span>{currentUser ? 'EXPLORE SCHOLARSHIPS' : 'SIGN IN TO EXPLORE'}</span>
                <span>→</span>
              </div>
            </div>

            {/* OPTION 2: FARMERS */}
            <div
              onClick={() => handleSelectPersona('farmer')}
              className="mono-card animate-entrance"
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && handleSelectPersona('farmer')}
              style={{
                padding: '32px 24px',
                cursor: 'pointer',
                textAlign: 'left',
                borderRadius: 20,
                border: '1px solid rgba(226, 232, 240, 0.85)',
                backgroundColor: 'rgba(255, 255, 255, 0.92)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.06), 0 4px 12px -2px rgba(15, 23, 42, 0.03)',
                transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
                animationDelay: '60ms',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = '#86EFAC';
                e.currentTarget.style.boxShadow = '0 20px 38px -6px rgba(22, 163, 74, 0.16), 0 8px 16px -4px rgba(15, 23, 42, 0.06)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.92)';
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.85)';
                e.currentTarget.style.boxShadow = '0 10px 30px -5px rgba(15, 23, 42, 0.06), 0 4px 12px -2px rgba(15, 23, 42, 0.03)';
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      border: '1px solid #BBF7D0',
                      boxShadow: '0 4px 12px rgba(22, 163, 74, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#DCFCE7',
                      color: '#15803D'
                    }}
                  >
                    <Sprout size={26} strokeWidth={2} />
                  </div>
                  <span className="neoglass-badge-green">
                    FARMERS & AGRICULTURE
                  </span>
                </div>

                <h3 className="font-display" style={{ fontSize: '1.65rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 10, textTransform: 'uppercase', color: '#0B2545' }}>
                  Farmers
                </h3>
                <p className="font-body" style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.55, marginBottom: 24 }}>
                  PM-KISAN ₹6,000 direct income support, PM Fasal Bima (PMFBY) crop insurance, Kisan Credit Card (KCC) 4% interest loans, and solar pump subsidies.
                </p>
              </div>

              <div
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
                  color: '#FFFFFF',
                  borderRadius: 12,
                  boxShadow: '0 4px 14px rgba(22, 163, 74, 0.28)',
                  padding: '12px 16px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all 0.2s ease'
                }}
              >
                {!currentUser && <Lock size={14} style={{ opacity: 0.9 }} />}
                <span>{currentUser ? 'EXPLORE AGRI SCHEMES' : 'SIGN IN TO EXPLORE'}</span>
                <span>→</span>
              </div>
            </div>
          </div>

          {/* =========================================================================
              DETAILED INFORMATION: WHAT YOJANAMITRA DOES & HOW IT WORKS
             ========================================================================= */}
          <div style={{ marginTop: 80, maxWidth: 1280, margin: '80px auto 0', width: '100%', textAlign: 'left' }}>
            
            {/* Section 1: What YojanaMitra Does */}
            <div
              className="mono-card animate-entrance"
              style={{
                padding: '36px 32px',
                borderRadius: 20,
                border: '1px solid #E2E8F0',
                boxShadow: '0 8px 30px -4px rgba(15, 23, 42, 0.05)',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                marginBottom: 32
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                <span className="neoglass-badge-yellow" style={{ fontSize: '0.74rem', fontWeight: 800 }}>
                  ABOUT YOJANAMITRA
                </span>
                <span className="font-mono" style={{ fontSize: '0.72rem', color: '#6B7280', fontWeight: 700 }}>
                  CENTRAL & STATE WELFARE DIRECTORY
                </span>
              </div>

              <h3 className="font-display" style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.3rem)', fontWeight: 900, letterSpacing: '-0.02em', textTransform: 'uppercase', marginBottom: 14 }}>
                What is YojanaMitra & What Does It Do?
              </h3>

              <p className="font-body" style={{ fontSize: '1.05rem', color: '#374151', lineHeight: 1.7, maxWidth: 960, marginBottom: 28 }}>
                <strong>YojanaMitra</strong> is a free, citizen-first digital directory built to make government welfare schemes and student scholarships easily discoverable. Across India, thousands of deserving students, smallholder farmers, marginalized families, and micro-entrepreneurs miss out on legitimate financial aid simply because rules and links are scattered across fragmented portals. YojanaMitra organizes <strong>20+ major central and state schemes</strong> in one clean interface, allowing you to check eligibility instantly and apply directly on verified official government portals.
              </p>

              {/* 3 Key Pillars */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                <div style={{ borderRadius: 16, border: '1px solid #E2E8F0', padding: 22, backgroundColor: '#FFFFFF', boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)', transition: 'all 0.2s ease' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 34, height: 34, backgroundColor: '#D1FAE5', borderRadius: 10, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ShieldCheck size={20} color="#059669" />
                    </div>
                    <span className="font-mono" style={{ fontSize: '0.84rem', fontWeight: 800 }}>100% DIRECT OFFICIAL LINKS</span>
                  </div>
                  <p className="font-body" style={{ fontSize: '0.9rem', color: '#4B5563', lineHeight: 1.55 }}>
                    Zero middlemen, zero agents, and zero hidden charges. Every program directs straight to official authorized portals like <strong>scholarships.gov.in</strong>, <strong>pmkisan.gov.in</strong>, and <strong>myscheme.gov.in</strong>.
                  </p>
                </div>

                <div style={{ borderRadius: 16, border: '1px solid #E2E8F0', padding: 22, backgroundColor: '#FFFFFF', boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)', transition: 'all 0.2s ease' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 34, height: 34, backgroundColor: '#DBEAFE', borderRadius: 10, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircle2 size={20} color="#2563EB" />
                    </div>
                    <span className="font-mono" style={{ fontSize: '0.84rem', fontWeight: 800 }}>TAILORED ELIGIBILITY ENGINE</span>
                  </div>
                  <p className="font-body" style={{ fontSize: '0.9rem', color: '#4B5563', lineHeight: 1.55 }}>
                    Match against your exact domicile state, education level, social category, farm landholding, or income bracket. No guessing whether an income cap or age limit applies to you.
                  </p>
                </div>

                <div style={{ borderRadius: 16, border: '1px solid #E2E8F0', padding: 22, backgroundColor: '#FFFFFF', boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)', transition: 'all 0.2s ease' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 34, height: 34, backgroundColor: '#FEF3C7', borderRadius: 10, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Sparkles size={20} color="#D97706" />
                    </div>
                    <span className="font-mono" style={{ fontSize: '0.84rem', fontWeight: 800 }}>SECURE CITIZEN AUTHENTICATION</span>
                  </div>
                  <p className="font-body" style={{ fontSize: '0.9rem', color: '#4B5563', lineHeight: 1.55 }}>
                    Protected citizen portal access with encrypted session security. Your personal search parameters and eligibility assessments remain private and secure.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: How It Works (4 Clear Steps) */}
            <div
              className="mono-card animate-entrance"
              style={{
                padding: '36px 32px',
                borderRadius: 20,
                border: '1px solid #E2E8F0',
                boxShadow: '0 8px 30px -4px rgba(15, 23, 42, 0.05)',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                marginBottom: 32
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                <span className="neoglass-badge-cyan" style={{ fontSize: '0.74rem', fontWeight: 800 }}>
                  HOW IT WORKS
                </span>
                <span className="font-mono" style={{ fontSize: '0.72rem', color: '#6B7280', fontWeight: 700 }}>
                  STEP-BY-STEP GUIDE
                </span>
              </div>

              <h3 className="font-display" style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.3rem)', fontWeight: 900, letterSpacing: '-0.02em', textTransform: 'uppercase', marginBottom: 28 }}>
                How to Use YojanaMitra in 4 Simple Steps
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
                {/* Step 1 */}
                <div style={{ borderRadius: 16, border: '1px solid #E2E8F0', padding: 24, backgroundColor: '#FFFFFF', boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #FF7700 0%, #EA580C 100%)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.15rem', marginBottom: 16, boxShadow: '0 4px 10px rgba(234, 88, 12, 0.25)' }}>
                    1
                  </div>
                  <h4 className="font-display" style={{ fontSize: '1.15rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: 8 }}>
                    Pick Your Category
                  </h4>
                  <p className="font-body" style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.55 }}>
                    Select from <strong>Student</strong> (for academic scholarships, fee waivers & merit aid) or <strong>Farmer</strong> (for PM-KISAN, crop insurance & agricultural subsidies).
                  </p>
                </div>

                {/* Step 2 */}
                <div style={{ borderRadius: 16, border: '1px solid #E2E8F0', padding: 24, backgroundColor: '#FFFFFF', boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.15rem', marginBottom: 16, boxShadow: '0 4px 10px rgba(14, 165, 233, 0.25)' }}>
                    2
                  </div>
                  <h4 className="font-display" style={{ fontSize: '1.15rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: 8 }}>
                    Fill Basic Details
                  </h4>
                  <p className="font-body" style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.55 }}>
                    Enter your state, education course, social category (General/OBC/SC/ST/EWS), or income bracket. All fields start completely empty so you only enter what applies to you.
                  </p>
                </div>

                {/* Step 3 */}
                <div style={{ borderRadius: 16, border: '1px solid #E2E8F0', padding: 24, backgroundColor: '#FFFFFF', boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.15rem', marginBottom: 16, boxShadow: '0 4px 10px rgba(139, 92, 246, 0.25)' }}>
                    3
                  </div>
                  <h4 className="font-display" style={{ fontSize: '1.15rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: 8 }}>
                    Review Matches
                  </h4>
                  <p className="font-body" style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.55 }}>
                    Review eligible schemes, annual financial benefit values (₹ per year), specific qualification reasons, and checklists of required verification documents.
                  </p>
                </div>

                {/* Step 4 */}
                <div style={{ borderRadius: 16, border: '1px solid #E2E8F0', padding: 24, backgroundColor: '#FFFFFF', boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.15rem', marginBottom: 16, boxShadow: '0 4px 10px rgba(16, 185, 129, 0.25)' }}>
                    4
                  </div>
                  <h4 className="font-display" style={{ fontSize: '1.15rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: 8 }}>
                    Apply Officially
                  </h4>
                  <p className="font-body" style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.55 }}>
                    Click directly through to the official central or state government portal (`.gov.in` / `.nic.in`) to complete your application with zero middlemen or commission fees.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3: Covered Government Sectors */}
            <div
              className="mono-card animate-entrance"
              style={{
                padding: '32px 30px',
                borderRadius: 20,
                border: '1px solid #E2E8F0',
                boxShadow: '0 8px 30px -4px rgba(15, 23, 42, 0.05)',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                marginBottom: 40
              }}
            >
              <h3 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.02em', textTransform: 'uppercase', marginBottom: 20 }}>
                Major National Programs Included in Our Repository
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
                <div style={{ borderRadius: 14, border: '1px solid #E2E8F0', padding: 22, backgroundColor: '#FFFFFF', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8, color: '#6D28D9' }}>
                    <GraduationCap size={20} />
                    <span>Education & Scholarships</span>
                  </div>
                  <p className="font-body" style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.55, margin: 0 }}>
                    National Scholarship Portal (NSP), Pre & Post Matric Scholarships for SC/ST/OBC/Minority/General, AICTE Pragati & Saksham for Girls/Differently-Abled, NMMS, and State Higher Secondary Merit Awards.
                  </p>
                </div>

                <div style={{ borderRadius: 14, border: '1px solid #E2E8F0', padding: 22, backgroundColor: '#FFFFFF', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8, color: '#15803D' }}>
                    <Sprout size={20} />
                    <span>Agriculture & Kisan Welfare</span>
                  </div>
                  <p className="font-body" style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.55, margin: 0 }}>
                    PM-KISAN Samman Nidhi (₹6,000 yearly direct income DBT), Pradhan Mantri Fasal Bima Yojana (PMFBY crop insurance cover), Kisan Credit Card (KCC 4% interest rate), and PM-KUSUM Solar Pump subsidies.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </main>
      ) : (
        /* STEP 1: ACTIVE PERSONA FORM & SCHEME DISCOVERY VIEW */
        <main
          className="app-container"
          style={{
            padding: '32px 20px',
            flex: 1,
            width: '100%'
          }}
        >
          {/* SUCCESS MESSAGE BANNER (Vibrant Neo-Glass Brutalist) */}
          {successMessage && (
            <div
              className="mono-card animate-entrance"
              style={{
                marginBottom: 20,
                borderRadius: 14,
                border: '1px solid #A7F3D0',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.1)',
                backgroundColor: '#ECFDF5',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CheckCircle2 size={18} color="#059669" />
                <span className="font-body" style={{ fontSize: '0.88rem', fontWeight: 600, color: '#065F46' }}>
                  {successMessage}
                </span>
              </div>
              <button
                onClick={() => setSuccessMessage(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#065F46' }}
                title="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* ERROR MESSAGE BANNER (Vibrant Neo-Glass Brutalist) */}
          {errorMessage && (
            <div
              className="mono-card animate-entrance"
              style={{
                marginBottom: 20,
                borderRadius: 14,
                border: '1px solid #FECDD3',
                boxShadow: '0 4px 14px rgba(225, 29, 72, 0.1)',
                backgroundColor: '#FFF1F2',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                color: '#9F1239',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertTriangle size={18} color="#E11D48" />
                <span className="font-mono" style={{ fontSize: '0.8rem', fontWeight: 800, color: '#9F1239' }}>
                  [PIPELINE NOTICE]: {errorMessage}
                </span>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                style={{ background: 'none', border: 'none', color: '#9F1239', cursor: 'pointer', padding: 4 }}
                title="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="app-workspace-grid">
            {/* Left Column: Intake Parameters & Live Telemetry Terminal */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
              <div className="mono-card" style={{ borderRadius: 20, border: '1px solid rgba(226, 232, 240, 0.9)', boxShadow: '0 8px 24px -4px rgba(15, 23, 42, 0.05)', padding: 26 }}>
                {/* Form Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, borderBottom: '1px solid #E2E8F0', paddingBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, display: 'block' }}>
                      CITIZEN PROFILE DETAILS
                    </span>
                    <h2 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0B2545' }}>
                      {selectedPersona === 'student'
                        ? 'Student Profile & Details'
                        : selectedPersona === 'farmer'
                        ? 'Farmer & Agricultural Details'
                        : selectedPersona === 'citizen'
                        ? 'Citizen & Family Profile'
                        : 'Business & MSME Details'}
                    </h2>
                  </div>
                  <span className="neoglass-badge-dark">
                    {selectedPersona === 'student'
                      ? 'Student'
                      : selectedPersona === 'farmer'
                      ? 'Farmer'
                      : selectedPersona === 'citizen'
                      ? 'Citizen & Family'
                      : 'Business'}
                  </span>
                </div>

                <form
                  onSubmit={e => {
                    e.preventDefault();
                    handleRunPipeline();
                  }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
                >
                  {/* 1. STUDENT FORM FIELDS */}
                  {selectedPersona === 'student' && (
                    <>
                      <div>
                        <label className="font-mono" style={{ fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, letterSpacing: '0.08em' }}>
                          <span>STATE OF STUDY / DOMICILE *</span>
                          <span style={{ color: '#E11D48', fontSize: '0.64rem', fontWeight: 800 }}>MANDATORY</span>
                        </label>
                        <select
                          className="mono-select"
                          required
                          value={studentState}
                          onChange={e => setStudentState(e.target.value)}
                        >
                          <option value="">-- SELECT STATE / DOMICILE (REQUIRED) --</option>
                          <option value="Delhi">Delhi</option>
                          <option value="Uttar Pradesh">Uttar Pradesh</option>
                          <option value="Bihar">Bihar</option>
                        </select>
                      </div>

                      <div className="form-two-col-grid">
                        <div>
                          <label className="font-mono" style={{ fontSize: '0.72rem', fontWeight: 700, display: 'block', marginBottom: 6, letterSpacing: '0.08em' }}>
                            AGE
                          </label>
                          <input
                            type="number"
                            className="mono-input"
                            min={14}
                            max={35}
                            placeholder="e.g. 20"
                            value={studentAge}
                            onChange={e => setStudentAge(e.target.value === '' ? '' : parseInt(e.target.value) || '')}
                          />
                        </div>

                        <div>
                          <label className="font-mono" style={{ fontSize: '0.72rem', fontWeight: 700, display: 'block', marginBottom: 6, letterSpacing: '0.08em' }}>
                            GENDER
                          </label>
                          <select
                            className="mono-select"
                            value={studentGender}
                            onChange={e => setStudentGender(e.target.value as any)}
                          >
                            <option value="">-- SELECT GENDER --</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Transgender">Transgender</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="font-mono" style={{ fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, letterSpacing: '0.08em' }}>
                          <span>CURRENT EDUCATION LEVEL</span>
                          <span style={{ color: '#64748B', fontSize: '0.64rem', fontWeight: 600 }}>OPTIONAL</span>
                        </label>
                        <select
                          className="mono-select"
                          value={educationLevel}
                          onChange={e => setEducationLevel(e.target.value as any)}
                        >
                          <option value="">-- SELECT EDUCATION LEVEL --</option>
                          <option value="School">Class 9th - 10th (Pre-Matric)</option>
                          <option value="Higher Secondary">Class 11th - 12th / PUC / Intermediate</option>
                          <option value="Undergraduate">Undergraduate (B.Tech, B.Sc, B.Com, MBBS, etc.)</option>
                          <option value="Postgraduate">Postgraduate (M.Tech, M.Sc, MBA, Ph.D)</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-mono" style={{ fontSize: '0.72rem', fontWeight: 700, display: 'block', marginBottom: 6, letterSpacing: '0.08em' }}>
                          COURSE STREAM
                        </label>
                        <select
                          className="mono-select"
                          value={courseStream}
                          onChange={e => setCourseStream(e.target.value)}
                        >
                          <option value="">-- SELECT COURSE STREAM --</option>
                          <option value="Engineering / Technical Degree">Engineering / Technical Degree (AICTE)</option>
                          <option value="Medical / Nursing / Dental">Medical / Healthcare / Pharma</option>
                          <option value="Arts, Science, Commerce (General Degree)">Arts / Science / Commerce (General)</option>
                          <option value="Polytechnic / Diploma / ITI">Polytechnic / Diploma / ITI</option>
                          <option value="Law / Architecture / Management">Professional Degree (Law, Mgmt, Arch)</option>
                        </select>
                      </div>

                      <div className="form-two-col-grid">
                        <div>
                          <label className="font-mono" style={{ fontSize: '0.72rem', fontWeight: 700, display: 'block', marginBottom: 6, letterSpacing: '0.08em' }}>
                            SOCIAL CATEGORY
                          </label>
                          <select
                            className="mono-select"
                            value={studentCategory}
                            onChange={e => setStudentCategory(e.target.value as any)}
                          >
                            <option value="">-- SELECT SOCIAL CATEGORY --</option>
                            <option value="General">General / Unreserved</option>
                            <option value="OBC">OBC (Other Backward Classes)</option>
                            <option value="SC">SC (Scheduled Caste)</option>
                            <option value="ST">ST (Scheduled Tribe)</option>
                            <option value="Minority">Minority (Muslim, Sikh, Christian, etc.)</option>
                            <option value="EWS">EWS (Economically Weaker Section)</option>
                          </select>
                        </div>

                        <div>
                          <label className="font-mono" style={{ fontSize: '0.72rem', fontWeight: 700, display: 'block', marginBottom: 6, letterSpacing: '0.08em' }}>
                            ANNUAL INCOME (₹)
                          </label>
                          <input
                            type="number"
                            className="mono-input"
                            step={10000}
                            placeholder="e.g. 150000"
                            value={studentIncome}
                            onChange={e => setStudentIncome(e.target.value === '' ? '' : parseInt(e.target.value) || '')}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 18, paddingTop: 4 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={isDifferentlyAbled}
                            onChange={e => setIsDifferentlyAbled(e.target.checked)}
                            style={{ accentColor: '#000000', width: 16, height: 16 }}
                          />
                          <span className="font-mono">PwD (DIFFERENTLY ABLED)</span>
                        </label>
                      </div>
                    </>
                  )}

                  {/* 2. FARMER FORM FIELDS */}
                  {selectedPersona === 'farmer' && (
                    <>
                      <div>
                        <label className="font-mono" style={{ fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, letterSpacing: '0.08em' }}>
                          <span>STATE OF AGRICULTURAL LAND *</span>
                          <span style={{ color: '#E11D48', fontSize: '0.64rem', fontWeight: 800 }}>MANDATORY</span>
                        </label>
                        <select
                          className="mono-select"
                          required
                          value={farmerState}
                          onChange={e => setFarmerState(e.target.value)}
                        >
                          <option value="">-- SELECT AGRICULTURAL STATE (REQUIRED) --</option>
                          <option value="Delhi">Delhi</option>
                          <option value="Uttar Pradesh">Uttar Pradesh</option>
                          <option value="Bihar">Bihar</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-mono" style={{ fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, letterSpacing: '0.08em' }}>
                          <span>LANDHOLDING TYPE</span>
                          <span style={{ color: '#64748B', fontSize: '0.64rem', fontWeight: 600 }}>OPTIONAL</span>
                        </label>
                        <select
                          className="mono-select"
                          value={farmerType}
                          onChange={e => setFarmerType(e.target.value as any)}
                        >
                          <option value="">-- SELECT LANDHOLDING TYPE --</option>
                          <option value="Small/Marginal">Small & Marginal Farmer (&lt; 2 Hectares / 5 Acres)</option>
                          <option value="Landless">Landless Tenant Cultivator / Sharecropper</option>
                          <option value="Large">Medium / Large Landholder (&gt; 2 Hectares)</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-mono" style={{ fontSize: '0.72rem', fontWeight: 700, display: 'block', marginBottom: 6, letterSpacing: '0.08em' }}>
                          PRIMARY CROP SEASON / COMMODITY
                        </label>
                        <select
                          className="mono-select"
                          value={farmerCropSeason}
                          onChange={e => setFarmerCropSeason(e.target.value)}
                        >
                          <option value="">-- SELECT PRIMARY CROP / SECTOR --</option>
                          <option value="Kharif (Paddy, Maize, Cotton, Pulses)">Kharif (Paddy, Maize, Cotton, Pulses)</option>
                          <option value="Rabi (Wheat, Mustard, Barley, Gram)">Rabi (Wheat, Mustard, Barley, Gram)</option>
                          <option value="Horticulture (Vegetables, Fruits, Floriculture)">Horticulture (Vegetables, Fruits, Floriculture)</option>
                          <option value="Cash Crops (Sugarcane, Tobacco, Tea, Coffee)">Cash Crops (Sugarcane, Tobacco, Oilseeds)</option>
                          <option value="Dairy / Animal Husbandry / Fisheries">Dairy / Animal Husbandry / Fisheries</option>
                        </select>
                      </div>

                      <div className="form-two-col-grid">
                        <div>
                          <label className="font-mono" style={{ fontSize: '0.72rem', fontWeight: 700, display: 'block', marginBottom: 6, letterSpacing: '0.08em' }}>
                            AGE
                          </label>
                          <input
                            type="number"
                            className="mono-input"
                            min={18}
                            max={85}
                            placeholder="e.g. 40"
                            value={farmerAge}
                            onChange={e => setFarmerAge(e.target.value === '' ? '' : parseInt(e.target.value) || '')}
                          />
                        </div>

                        <div>
                          <label className="font-mono" style={{ fontSize: '0.72rem', fontWeight: 700, display: 'block', marginBottom: 6, letterSpacing: '0.08em' }}>
                            GENDER
                          </label>
                          <select
                            className="mono-select"
                            value={farmerGender}
                            onChange={e => setFarmerGender(e.target.value as any)}
                          >
                            <option value="">-- SELECT GENDER --</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female (Mahila Kisan)</option>
                            <option value="Transgender">Transgender</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-two-col-grid">
                        <div>
                          <label className="font-mono" style={{ fontSize: '0.72rem', fontWeight: 700, display: 'block', marginBottom: 6, letterSpacing: '0.08em' }}>
                            ANNUAL FARM INCOME (₹)
                          </label>
                          <input
                            type="number"
                            className="mono-input"
                            step={10000}
                            placeholder="e.g. 100000"
                            value={farmerIncome}
                            onChange={e => setFarmerIncome(e.target.value === '' ? '' : parseInt(e.target.value) || '')}
                          />
                        </div>

                        <div>
                          <label className="font-mono" style={{ fontSize: '0.72rem', fontWeight: 700, display: 'block', marginBottom: 6, letterSpacing: '0.08em' }}>
                            SOCIAL CATEGORY
                          </label>
                          <select
                            className="mono-select"
                            value={farmerCategory}
                            onChange={e => setFarmerCategory(e.target.value as any)}
                          >
                            <option value="">-- SELECT SOCIAL CATEGORY --</option>
                            <option value="General">General</option>
                            <option value="OBC">OBC</option>
                            <option value="SC">SC</option>
                            <option value="ST">ST</option>
                            <option value="Minority">Minority</option>
                            <option value="EWS">EWS</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 18, paddingTop: 4, flexWrap: 'wrap' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={hasKccCard}
                            onChange={e => setHasKccCard(e.target.checked)}
                            style={{ accentColor: '#000000', width: 16, height: 16 }}
                          />
                          <span className="font-mono">KISAN CREDIT CARD (KCC)</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={hasCropInsurance}
                            onChange={e => setHasCropInsurance(e.target.checked)}
                            style={{ accentColor: '#000000', width: 16, height: 16 }}
                          />
                          <span className="font-mono">PMFBY CROP INSURED</span>
                        </label>
                      </div>
                    </>
                  )}

                  {/* 3. CITIZEN FORM FIELDS (PERSONAL SCHEMES LIKE FAMILY RATION & HOUSING) */}
                  {selectedPersona === 'citizen' && (
                    <>
                      <div>
                        <label className="font-mono" style={{ fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, letterSpacing: '0.08em' }}>
                          <span>STATE OF RESIDENCE *</span>
                          <span style={{ color: '#E11D48', fontSize: '0.64rem', fontWeight: 800 }}>MANDATORY</span>
                        </label>
                        <select
                          className="mono-select"
                          required
                          value={citizenState}
                          onChange={e => setCitizenState(e.target.value)}
                        >
                          <option value="">-- SELECT STATE OF RESIDENCE (REQUIRED) --</option>
                          {INDIAN_STATES.map(st => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="font-mono" style={{ fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, letterSpacing: '0.08em' }}>
                          <span>RATION CARD CATEGORY (FOODGRAIN SCHEMES)</span>
                          <span style={{ color: '#64748B', fontSize: '0.64rem', fontWeight: 600 }}>OPTIONAL</span>
                        </label>
                        <select
                          className="mono-select"
                          value={familyRationType}
                          onChange={e => setFamilyRationType(e.target.value)}
                        >
                          <option value="">-- SELECT FAMILY RATION STATUS --</option>
                          <option value="Priority Household (PHH / BPL)">Priority Household (PHH / NFSA 5kg Free Foodgrains)</option>
                          <option value="Antyodaya Anna Yojana (AAY / Poorest of Poor)">Antyodaya Anna Yojana (AAY / 35kg Monthly Free Grains)</option>
                          <option value="State BPL Ration Card">State BPL Ration Card (Below Poverty Line)</option>
                          <option value="APL / No Card (Looking for New Family Ration Card)">APL / No Card (Looking for New Family Ration Card)</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-mono" style={{ fontSize: '0.72rem', fontWeight: 700, display: 'block', marginBottom: 6, letterSpacing: '0.04em' }}>
                          HOUSING STATUS & SHELTER SCHEMES
                        </label>
                        <select
                          className="mono-select"
                          value={housingCondition}
                          onChange={e => setHousingCondition(e.target.value)}
                        >
                          <option value="">-- SELECT HOUSING CONDITION --</option>
                          <option value="Kutcha House / Rented (PMAY Needed)">Kutcha / Thatched House / Homeless (Requires PMAY Pucca House)</option>
                          <option value="Urban Rented Accommodation">Urban Rented / Informal Settlement</option>
                          <option value="Semi-Pucca Structure">Semi-Pucca / Needs Repair & Expansion</option>
                          <option value="Own Pucca House">Own Pucca Concrete House</option>
                        </select>
                      </div>

                      <div className="form-two-col-grid">
                        <div>
                          <label className="font-mono" style={{ fontSize: '0.72rem', fontWeight: 700, display: 'block', marginBottom: 6, letterSpacing: '0.08em' }}>
                            AGE
                          </label>
                          <input
                            type="number"
                            className="mono-input"
                            min={18}
                            max={90}
                            placeholder="e.g. 35"
                            value={citizenAge}
                            onChange={e => setCitizenAge(e.target.value === '' ? '' : parseInt(e.target.value) || '')}
                          />
                        </div>

                        <div>
                          <label className="font-mono" style={{ fontSize: '0.72rem', fontWeight: 700, display: 'block', marginBottom: 6, letterSpacing: '0.08em' }}>
                            GENDER
                          </label>
                          <select
                            className="mono-select"
                            value={citizenGender}
                            onChange={e => setCitizenGender(e.target.value as any)}
                          >
                            <option value="">-- SELECT GENDER --</option>
                            <option value="Female">Female (Family Head / Primary Beneficiary)</option>
                            <option value="Male">Male</option>
                            <option value="Transgender">Transgender</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-two-col-grid">
                        <div>
                          <label className="font-mono" style={{ fontSize: '0.72rem', fontWeight: 700, display: 'block', marginBottom: 6, letterSpacing: '0.08em' }}>
                            ANNUAL FAMILY INCOME (₹)
                          </label>
                          <input
                            type="number"
                            className="mono-input"
                            step={10000}
                            placeholder="e.g. 80000"
                            value={citizenIncome}
                            onChange={e => setCitizenIncome(e.target.value === '' ? '' : parseInt(e.target.value) || '')}
                          />
                        </div>

                        <div>
                          <label className="font-mono" style={{ fontSize: '0.72rem', fontWeight: 700, display: 'block', marginBottom: 6, letterSpacing: '0.08em' }}>
                            SOCIAL CATEGORY
                          </label>
                          <select
                            className="mono-select"
                            value={citizenCategory}
                            onChange={e => setCitizenCategory(e.target.value as any)}
                          >
                            <option value="">-- SELECT SOCIAL CATEGORY --</option>
                            <option value="General">General</option>
                            <option value="OBC">OBC</option>
                            <option value="SC">SC</option>
                            <option value="ST">ST</option>
                            <option value="Minority">Minority</option>
                            <option value="EWS">EWS</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 18, paddingTop: 4, flexWrap: 'wrap' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={hasAyushmanCard}
                            onChange={e => setHasAyushmanCard(e.target.checked)}
                            style={{ accentColor: '#000000', width: 16, height: 16 }}
                          />
                          <span className="font-mono">AYUSHMAN PM-JAY (₹5L HEALTH CARD)</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={isDifferentlyAbled}
                            onChange={e => setIsDifferentlyAbled(e.target.checked)}
                            style={{ accentColor: '#000000', width: 16, height: 16 }}
                          />
                          <span className="font-mono">PwD (DIFFERENTLY ABLED)</span>
                        </label>
                      </div>
                    </>
                  )}

                  {/* 4. BUSINESS FORM FIELDS (MSME, MUDRA, STARTUP, SUBSIDIES) */}
                  {selectedPersona === 'business' && (
                    <>
                      <div>
                        <label className="font-mono" style={{ fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, letterSpacing: '0.08em' }}>
                          <span>STATE OF ENTERPRISE / OPERATION *</span>
                          <span style={{ color: '#E11D48', fontSize: '0.64rem', fontWeight: 800 }}>MANDATORY</span>
                        </label>
                        <select
                          className="mono-select"
                          required
                          value={businessState}
                          onChange={e => setBusinessState(e.target.value)}
                        >
                          <option value="">-- SELECT STATE OF ENTERPRISE (REQUIRED) --</option>
                          {INDIAN_STATES.map(st => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="font-mono" style={{ fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, letterSpacing: '0.08em' }}>
                          <span>ENTERPRISE CLASSIFICATION</span>
                          <span style={{ color: '#64748B', fontSize: '0.64rem', fontWeight: 600 }}>OPTIONAL</span>
                        </label>
                        <select
                          className="mono-select"
                          value={businessType}
                          onChange={e => setBusinessType(e.target.value)}
                        >
                          <option value="">-- SELECT ENTERPRISE CLASSIFICATION --</option>
                          <option value="Micro Business (Retail / Shop / Services)">Micro Enterprise (Retail / Local Shop / Services)</option>
                          <option value="Street Vendor / Hawkers / Artisan">Street Vendor / Hawkers / Traditional Artisan</option>
                          <option value="Small & Medium Manufacturing Unit">Small / Medium Manufacturing Unit (MSME)</option>
                          <option value="Agri-Processing / Food Enterprise">Agro-Processing / Food Venture / Rural Industry</option>
                          <option value="Tech / DPIIT Registered Startup">DPIIT Registered Startup / Technology Venture</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-mono" style={{ fontSize: '0.72rem', fontWeight: 700, display: 'block', marginBottom: 6, letterSpacing: '0.08em' }}>
                          FINANCIAL & CREDIT REQUIREMENT
                        </label>
                        <select
                          className="mono-select"
                          value={loanNeed}
                          onChange={e => setLoanNeed(e.target.value)}
                        >
                          <option value="">-- SELECT CREDIT & LOAN REQUIREMENT --</option>
                          <option value="Working Capital (Up to ₹50,000 - Shishu Mudra / SVANidhi)">Micro Credit (Up to ₹50,000 - Shishu Mudra / PM SVANidhi)</option>
                          <option value="Working Capital (Up to ₹5 Lakh - Kishore Mudra)">Equipment / Expansion (₹50,000 to ₹10 Lakhs - Kishore / Tarun Mudra)</option>
                          <option value="Capital Subsidy Setup (₹10 Lakh to ₹50 Lakh - PMEGP 35%)">New Project Capital Subsidy (₹10L to ₹50L - PMEGP up to 35% Subsidy)</option>
                          <option value="Collateral-Free Credit Guarantee (Up to ₹2 Crores - CGTMSE)">Collateral-Free Credit Guarantee (Up to ₹2 Crores - CGTMSE)</option>
                        </select>
                      </div>

                      <div className="form-two-col-grid">
                        <div>
                          <label className="font-mono" style={{ fontSize: '0.72rem', fontWeight: 700, display: 'block', marginBottom: 6, letterSpacing: '0.08em' }}>
                            APPLICANT AGE
                          </label>
                          <input
                            type="number"
                            className="mono-input"
                            min={18}
                            max={75}
                            placeholder="e.g. 30"
                            value={businessAge}
                            onChange={e => setBusinessAge(e.target.value === '' ? '' : parseInt(e.target.value) || '')}
                          />
                        </div>

                        <div>
                          <label className="font-mono" style={{ fontSize: '0.72rem', fontWeight: 700, display: 'block', marginBottom: 6, letterSpacing: '0.08em' }}>
                            GENDER
                          </label>
                          <select
                            className="mono-select"
                            value={businessGender}
                            onChange={e => setBusinessGender(e.target.value as any)}
                          >
                            <option value="">-- SELECT GENDER --</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female (Special Women Entrepreneur Incentives)</option>
                            <option value="Transgender">Transgender</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-two-col-grid">
                        <div>
                          <label className="font-mono" style={{ fontSize: '0.72rem', fontWeight: 700, display: 'block', marginBottom: 6, letterSpacing: '0.08em' }}>
                            ANNUAL TURNOVER (₹)
                          </label>
                          <input
                            type="number"
                            className="mono-input"
                            step={50000}
                            placeholder="e.g. 250000"
                            value={businessTurnover}
                            onChange={e => setBusinessTurnover(e.target.value === '' ? '' : parseInt(e.target.value) || '')}
                          />
                        </div>

                        <div>
                          <label className="font-mono" style={{ fontSize: '0.72rem', fontWeight: 700, display: 'block', marginBottom: 6, letterSpacing: '0.08em' }}>
                            SOCIAL CATEGORY
                          </label>
                          <select
                            className="mono-select"
                            value={businessCategory}
                            onChange={e => setBusinessCategory(e.target.value as any)}
                          >
                            <option value="">-- SELECT SOCIAL CATEGORY --</option>
                            <option value="General">General</option>
                            <option value="OBC">OBC</option>
                            <option value="SC">SC (Stand-Up India Eligible)</option>
                            <option value="ST">ST (Stand-Up India Eligible)</option>
                            <option value="Minority">Minority</option>
                            <option value="EWS">EWS</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 18, paddingTop: 4, flexWrap: 'wrap' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={isUdyamRegistered}
                            onChange={e => setIsUdyamRegistered(e.target.checked)}
                            style={{ accentColor: '#000000', width: 16, height: 16 }}
                          />
                          <span className="font-mono">UDYAM MSME REGISTERED</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={isWomenLed}
                            onChange={e => setIsWomenLed(e.target.checked)}
                            style={{ accentColor: '#000000', width: 16, height: 16 }}
                          />
                          <span className="font-mono">WOMEN-LED ENTERPRISE (51%+ EQUITY)</span>
                        </label>
                      </div>
                    </>
                  )}

                  {/* Mandatory Input Requirement Notice */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 2px', marginTop: 6 }}>
                    <AlertCircle size={14} color="#E11D48" />
                    <span className="font-mono" style={{ fontSize: '0.7rem', color: '#64748B' }}>
                      * State selection is mandatory. All other profile parameters are optional.
                    </span>
                  </div>

                  {/* Primary Submit Button */}
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="mono-btn-primary"
                    style={{
                      marginTop: 4,
                      padding: '14px 20px',
                      fontSize: '0.85rem',
                      cursor: isProcessing ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        <span>SEARCHING SCHEMES & SCHOLARSHIPS...</span>
                      </>
                    ) : (
                      <>
                        <Search size={16} />
                        <span>
                          {selectedPersona === 'student'
                            ? 'DISCOVER ELIGIBLE SCHOLARSHIPS →'
                            : selectedPersona === 'farmer'
                            ? 'DISCOVER AGRICULTURAL & KISAN SCHEMES →'
                            : selectedPersona === 'citizen'
                            ? 'DISCOVER FAMILY RATION & WELFARE SCHEMES →'
                            : 'DISCOVER BUSINESS SUBSIDIES & LOANS →'}
                        </span>
                      </>
                    )}
                  </button>
                </form>
              </div>

            </section>

            {/* Right Column: AI Discovered Schemes & Scholarships */}
            <section id="results-section" style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
              {/* Header & Filter Controls */}
              <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 14 }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                      {showOnlyBookmarks ? 'SAVED FOR LATER' : 'DISCOVERED PROGRAMS & AID'}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <h3 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', color: '#0B2545' }}>
                        {showOnlyBookmarks
                          ? 'Saved Bookmarks'
                          : selectedPersona === 'student'
                          ? 'Eligible Scholarships'
                          : selectedPersona === 'farmer'
                          ? 'Eligible Agricultural Schemes'
                          : selectedPersona === 'citizen'
                          ? 'Eligible Family & Citizen Schemes'
                          : 'Eligible Business & MSME Schemes'} ({displayedSchemes.length})
                      </h3>
                      {displayedSchemes.length > 0 && (() => {
                        const verifiedCount = displayedSchemes.filter(s => s.scheme.verificationStatus === 'verified').length;
                        const partiallyVerifiedCount = displayedSchemes.filter(s => s.scheme.verificationStatus === 'partially_verified').length;
                        const unverifiedCount = displayedSchemes.filter(s => s.scheme.verificationStatus === 'unverified_candidate' || s.scheme.verificationStatus === 'unverified').length;
                        return (
                          <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                            {verifiedCount > 0 ? (
                              <span style={{ fontSize: '0.72rem', backgroundColor: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0', padding: '3px 10px', borderRadius: 9999, fontWeight: 700 }}>
                                ✔ {verifiedCount} Verified Government {verifiedCount === 1 ? 'Scheme' : 'Schemes'}
                              </span>
                            ) : null}
                            {partiallyVerifiedCount > 0 && (
                              <span style={{ fontSize: '0.72rem', backgroundColor: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '3px 10px', borderRadius: 9999, fontWeight: 700 }}>
                                ℹ {partiallyVerifiedCount} Partially Verified
                              </span>
                            )}
                            {unverifiedCount > 0 && (
                              <span style={{ fontSize: '0.72rem', backgroundColor: '#FFFBEB', color: '#B45309', border: '1px solid #FDE68A', padding: '3px 10px', borderRadius: 9999, fontWeight: 700 }}>
                                ○ {unverifiedCount} Unverified {unverifiedCount === 1 ? 'Candidate' : 'Candidates'}
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                    {displayedSchemes.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 6 }}>
                        <span className="font-mono" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0B2545' }}>
                          Jurisdiction: {activeState || 'All India'} • {
                            discoveryDiagnostics?.officialInformationPortalsCount ??
                            new Set(displayedSchemes.filter(s => 
                              (s.scheme.sourceClassification === 'official_government_scheme_page' || s.scheme.sourceClassification === 'official_application_portal' || s.scheme.sourceClassification === 'official_government' || s.scheme.sourceClassification === 'official_scheme_portal') &&
                              (s.scheme.verificationStatus === 'verified' || s.scheme.verificationStatus === 'partially_verified')
                            ).map(s => {
                              try { return new URL(s.scheme.officialUrl).hostname; } catch { return s.scheme.portalName; }
                            })).size
                          } Official Portals Verified
                          {Boolean(discoveryDiagnostics?.secondarySourcesCount) && ` • ${discoveryDiagnostics.secondarySourcesCount} Secondary References`}
                        </span>
                        {discoveryDiagnostics && (
                          <button
                            type="button"
                            onClick={() => setShowDiagnosticsModal(true)}
                            className="font-mono"
                            style={{
                              background: '#F0F9FF',
                              border: '1px solid #BAE6FD',
                              borderRadius: 6,
                              padding: '2px 10px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              color: '#0369A1',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5
                            }}
                          >
                            <Activity size={12} color="#0284C7" />
                            <span>Discovery Diagnostics</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Dynamic Category Filters based on Track */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    {(selectedPersona === 'student'
                      ? ['All', 'Education']
                      : ['All', 'Agriculture']
                    ).map(cat => {
                      const isActive = selectedCategoryFilter === cat && !showOnlyBookmarks;
                      return (
                        <button
                          key={cat}
                          onClick={() => {
                            setSelectedCategoryFilter(cat);
                            setShowOnlyBookmarks(false);
                          }}
                          className="font-mono"
                          style={{
                            backgroundColor: isActive ? '#0B2545' : 'rgba(255, 255, 255, 0.88)',
                            color: isActive ? '#FFFFFF' : '#1E293B',
                            borderRadius: 9999,
                            border: isActive ? '1px solid #0B2545' : '1px solid #CBD5E1',
                            boxShadow: isActive ? '0 2px 8px rgba(11, 37, 69, 0.25)' : 'none',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                            padding: '6px 14px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            letterSpacing: '0.06em',
                            cursor: 'pointer',
                            transform: isActive ? 'translateY(-1px)' : 'none',
                            transition: 'all 0.18s ease'
                          }}
                        >
                          {cat.toUpperCase()}
                        </button>
                      );
                    })}

                    {/* Bookmarked Filter Pill */}
                    <button
                      type="button"
                      onClick={() => setShowOnlyBookmarks(!showOnlyBookmarks)}
                      className="font-mono"
                      title="Toggle viewing only your saved bookmarks"
                      style={{
                        backgroundColor: showOnlyBookmarks ? '#D97706' : 'rgba(255, 255, 255, 0.88)',
                        color: showOnlyBookmarks ? '#FFFFFF' : '#92400E',
                        borderRadius: 9999,
                        border: showOnlyBookmarks ? '1px solid #D97706' : '1px solid #FDE68A',
                        boxShadow: showOnlyBookmarks ? '0 2px 8px rgba(217, 119, 6, 0.25)' : 'none',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        padding: '6px 14px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        transform: showOnlyBookmarks ? 'translateY(-1px)' : 'none',
                        transition: 'all 0.18s ease'
                      }}
                    >
                      <Bookmark size={13} fill={showOnlyBookmarks ? '#FFFFFF' : 'none'} color={showOnlyBookmarks ? '#FFFFFF' : '#D97706'} />
                      <span>SAVED ({bookmarkedSchemes.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleViewCategorySchemes()}
                      className="font-mono"
                      title={`Search official directories for active ${currentCategoryLabel}`}
                      style={{
                        background: 'linear-gradient(135deg, #FF7700 0%, #EA580C 100%)',
                        color: '#FFFFFF',
                        borderRadius: 9999,
                        border: '1px solid rgba(255, 255, 255, 0.35)',
                        boxShadow: '0 4px 12px rgba(234, 88, 12, 0.28)',
                        padding: '7px 16px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        letterSpacing: '0.04em',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Sparkles size={13} />
                      <span>SEARCH ALL ACTIVE {currentCategoryLabel.toUpperCase()}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Advisor Briefing Box (Vibrant Neo-Glass Brutalist) */}
              {advisorNote && (
                <div
                  className="mono-card animate-entrance"
                  style={{
                    borderRadius: 16,
                    border: '1px solid #FDE68A',
                    boxShadow: '0 4px 16px rgba(217, 119, 6, 0.08)',
                    background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    padding: 20
                  }}
                >
                  <div className="font-mono" style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', color: '#92400E', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Sparkles size={14} color="#D97706" /> APPLICATION GUIDANCE & ADVISORY NOTES
                  </div>
                  <p className="font-body" style={{ fontSize: '0.96rem', fontStyle: 'italic', color: '#1F2937', lineHeight: 1.55 }}>
                    “{advisorNote}”
                  </p>
                </div>
              )}

              {/* Schemes Results List */}
              {isProcessing ? (
                <div
                  className="animate-entrance"
                  style={{
                    borderRadius: 18,
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.08), 0 2px 10px rgba(0, 0, 0, 0.03)',
                    padding: '28px 24px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Subtle Top Saffron Accent Line */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: 'linear-gradient(90deg, #FF7700 0%, #EA580C 50%, #047857 100%)'
                    }}
                  />

                  {/* Header */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          color: '#0B2545',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          backgroundColor: '#EFF6FF',
                          padding: '4px 12px',
                          borderRadius: 9999,
                          border: '1px solid #BFDBFE',
                          fontWeight: 700
                        }}
                      >
                        <Search size={13} color="#2563EB" />
                        SEARCHING OFFICIAL SCHEMES DIRECTORY
                      </span>
                      <span className="font-mono" style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 700 }}>
                        Step {searchStage} of 5
                      </span>
                    </div>

                    <h4 className="font-display" style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '4px 0 6px', color: '#0F172A' }}>
                      Finding Government Schemes & Scholarships
                    </h4>
                    <p className="font-body" style={{ fontSize: '0.88rem', color: '#475569', margin: 0 }}>
                      Searching active central and state welfare programs for <strong style={{ color: '#0F172A' }}>{activeState || 'All India / Central'}</strong> matching your profile criteria.
                    </p>
                  </div>

                  {/* Clean 5-Stage Progression List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                    {PIPELINE_STAGES.map(s => {
                      const isCompleted = s.stage < searchStage;
                      const isCurrent = s.stage === searchStage;
                      const isQueued = s.stage > searchStage;

                      return (
                        <div
                          key={s.stage}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '10px 14px',
                            borderRadius: 12,
                            backgroundColor: isCurrent
                              ? '#FFF7ED'
                              : isCompleted
                              ? '#F0FDF4'
                              : '#F8FAFC',
                            border: isCurrent
                              ? '1.5px solid #FDBA74'
                              : isCompleted
                              ? '1px solid #BBF7D0'
                              : '1px solid #E2E8F0',
                            transition: 'all 0.25s ease',
                            opacity: isQueued ? 0.6 : 1
                          }}
                        >
                          <div style={{ flexShrink: 0 }}>
                            {isCompleted ? (
                              <CheckCircle2 size={18} color="#16A34A" />
                            ) : isCurrent ? (
                              <Loader2 className="animate-spin" size={18} color="#EA580C" />
                            ) : (
                              <div
                                style={{
                                  width: 16,
                                  height: 16,
                                  borderRadius: '50%',
                                  border: '2px solid #CBD5E1',
                                  margin: 1
                                }}
                              />
                            )}
                          </div>

                          <div style={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div
                                className="font-body"
                                style={{
                                  fontSize: '0.84rem',
                                  fontWeight: isCurrent ? 800 : isCompleted ? 700 : 500,
                                  color: isCurrent ? '#9A3412' : isCompleted ? '#166534' : '#64748B'
                                }}
                              >
                                Step {s.stage}: {s.title}
                              </div>
                              <div
                                className="font-body"
                                style={{
                                  fontSize: '0.74rem',
                                  color: isCurrent ? '#C2410C' : isCompleted ? '#15803D' : '#94A3B8',
                                  marginTop: 1
                                }}
                              >
                                {s.description}
                              </div>
                            </div>
                            <span
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                color: isCurrent ? '#EA580C' : isCompleted ? '#16A34A' : '#94A3B8',
                                marginLeft: 12,
                                flexShrink: 0,
                                padding: '2px 8px',
                                borderRadius: 6,
                                backgroundColor: isCurrent ? '#FFEDD5' : isCompleted ? '#DCFCE7' : '#F1F5F9'
                              }}
                            >
                              {isCompleted ? 'Completed' : isCurrent ? 'In Progress' : 'Waiting'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Status Banner */}
                  <div
                    style={{
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: 12,
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10
                    }}
                  >
                    <FileText size={16} color="#0284C7" style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <span className="font-body" style={{ fontSize: '0.8rem', color: '#334155', fontWeight: 600 }}>
                        {agentLogs[0]?.message || PIPELINE_STAGES.find(s => s.stage === searchStage)?.actionText || 'Verifying official scheme guidelines and criteria...'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : displayedSchemes.length === 0 ? (
                <div
                  className="mono-card"
                  style={{
                    borderRadius: 20,
                    border: '1.5px dashed #CBD5E1',
                    boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)',
                    padding: '48px 24px',
                    textAlign: 'center',
                    backgroundColor: hasSearched ? '#FFFDF5' : 'rgba(255, 255, 255, 0.75)',
                    backdropFilter: 'blur(14px)',
                    WebkitBackdropFilter: 'blur(14px)'
                  }}
                >
                  {showOnlyBookmarks ? (
                    <div style={{ padding: '16px 12px', textAlign: 'center' }}>
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 16,
                          backgroundColor: '#FEF3C7',
                          border: '1px solid #FDE68A',
                          boxShadow: '0 4px 12px rgba(217, 119, 6, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 16px',
                          color: '#D97706'
                        }}
                      >
                        <Bookmark size={26} />
                      </div>
                      <h4 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0B2545', marginBottom: 8 }}>
                        NO BOOKMARKED SCHEMES YET
                      </h4>
                      <p className="font-body" style={{ fontSize: '0.88rem', color: '#64748B', maxWidth: 460, margin: '0 auto 20px', lineHeight: 1.5 }}>
                        Click the <strong>Bookmark</strong> button on any scheme or scholarship card to store it here while searching and exploring other programs!
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowOnlyBookmarks(false)}
                        className="mono-btn-primary"
                        style={{ padding: '10px 18px', fontSize: '0.78rem' }}
                      >
                        ← VIEW ALL SEARCHED SCHEMES
                      </button>
                    </div>
                  ) : hasSearched ? (
                    <>
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 16,
                          backgroundColor: '#FEF3C7',
                          border: '1px solid #FDE68A',
                          boxShadow: '0 4px 12px rgba(217, 119, 6, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 18px'
                        }}
                      >
                        <AlertCircle size={28} color="#D97706" />
                      </div>
                      <span className="font-mono" style={{ fontSize: '0.72rem', fontWeight: 800, color: '#B45309', letterSpacing: '0.04em' }}>
                        NO DIRECT MATCHES FOUND WITH CURRENT CRITERIA
                      </span>
                      <h4 className="font-display" style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: 8, marginBottom: 10, color: '#000000' }}>
                        No {currentCategoryLabel.toLowerCase()} directly matched your input details
                      </h4>
                      <p className="font-body" style={{ fontSize: '0.95rem', color: '#4B5563', maxWidth: 540, margin: '0 auto 24px', lineHeight: 1.55 }}>
                        No direct matches were found matching all your criteria simultaneously. You can browse all active {currentCategoryLabel.toLowerCase()} available for your state and sector right now.
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => handleViewCategorySchemes()}
                          className="mono-btn-primary"
                          style={{
                            padding: '14px 28px',
                            fontSize: '0.86rem',
                            background: 'linear-gradient(135deg, #FF7700 0%, #EA580C 100%)',
                            color: '#FFFFFF',
                            borderRadius: 12,
                            boxShadow: '0 4px 16px rgba(234, 88, 12, 0.35)',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 10
                          }}
                        >
                          <Sparkles size={16} />
                          <span>VIEW ALL ACTIVE {currentCategoryLabel.toUpperCase()} →</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Search size={36} strokeWidth={1.5} style={{ margin: '0 auto 16px', display: 'block' }} />
                      <h4 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 8 }}>
                        Awaiting Citizen Details
                      </h4>
                      <p className="font-body" style={{ fontSize: '0.95rem', color: '#525252', maxWidth: 480, margin: '0 auto 20px' }}>
                        Select your state and demographic parameters on the left and click Discover, or explore all active {currentCategoryLabel.toLowerCase()} directly.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleViewCategorySchemes()}
                        className="mono-btn-secondary"
                        style={{
                          margin: '0 auto',
                          padding: '10px 18px',
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8
                        }}
                      >
                        <Layers size={15} />
                        <span>VIEW ALL {currentCategoryLabel.toUpperCase()}</span>
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {isFallbackMode && (
                    <div
                      className="mono-card animate-entrance"
                      style={{
                        borderRadius: 14,
                        border: '1.5px solid #FCD34D',
                        background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
                        padding: '14px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        boxShadow: '0 4px 12px rgba(217, 119, 6, 0.08)'
                      }}
                    >
                      <AlertTriangle size={20} color="#D97706" style={{ flexShrink: 0 }} />
                      <div>
                        <div className="font-mono" style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.04em', color: '#92400E', textTransform: 'uppercase' }}>
                          Verified Schemes Directory
                        </div>
                        <p className="font-body" style={{ fontSize: '0.88rem', color: '#78350F', margin: 0, lineHeight: 1.45 }}>
                          Showing verified Central and State welfare programs matching your eligibility criteria. Each program includes direct links to official application portals and document checklists.
                        </p>
                      </div>
                    </div>
                  )}
                  {displayedSchemes.map((item, index) => {
                    const isBookmarked = bookmarkedSchemes.some(b => b.scheme.id === item.scheme.id);
                    return (
                    <div
                      key={item.scheme.id}
                      className="mono-card animate-entrance"
                      style={{
                        padding: 26,
                        borderRadius: 20,
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 6px 20px -2px rgba(15, 23, 42, 0.06)',
                        animationDelay: `${index * 60}ms`
                      }}
                    >
                      {/* Top Row: Meta Pill & Match Score & Action Buttons */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 14 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                            <span
                              style={{
                                backgroundColor: '#F3E8FF',
                                color: '#6B21A8',
                                padding: '4px 10px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                borderRadius: 8,
                                border: '1px solid #E9D5FF'
                              }}
                            >
                              {(() => {
                                if (item.scheme.level === 'Multi-State' || item.scheme.jurisdiction === 'multi_state') {
                                  return 'Multi-State Regional Scheme';
                                }
                                if (item.scheme.administrativeLabel) {
                                  return item.scheme.administrativeLabel;
                                }
                                const isDelhi = (item.scheme.state && item.scheme.state.toLowerCase().includes('delhi')) ||
                                  (activeState && activeState.toLowerCase().includes('delhi') && item.scheme.level === 'State');
                                if (isDelhi) {
                                  return 'NCT of Delhi (UT with Legislative Assembly)';
                                }
                                if (item.scheme.level === 'State') {
                                  return `State Government of ${item.scheme.state || activeState}`;
                                }
                                return 'Central All-India Scheme';
                              })()} • {item.scheme.category}
                            </span>
                            {/* Benefit Type Badge */}
                            {item.scheme.benefitType && (
                              <span
                                style={{
                                  backgroundColor: item.scheme.benefitType === 'loan' ? '#EFF6FF' : item.scheme.benefitType === 'subsidy' ? '#F5F3FF' : item.scheme.benefitType === 'scholarship' ? '#ECFDF5' : item.scheme.benefitType === 'insurance' ? '#FFF7ED' : '#F0FDF4',
                                  color: item.scheme.benefitType === 'loan' ? '#1D4ED8' : item.scheme.benefitType === 'subsidy' ? '#6D28D9' : item.scheme.benefitType === 'scholarship' ? '#047857' : item.scheme.benefitType === 'insurance' ? '#C2410C' : '#15803D',
                                  padding: '4px 10px',
                                  fontSize: '0.7rem',
                                  fontWeight: 800,
                                  borderRadius: 8,
                                  border: '1px solid currentColor',
                                  textTransform: 'uppercase'
                                }}
                              >
                                {item.scheme.benefitType}
                              </span>
                            )}
                            {/* Evaluated Demographic Criteria Status Badge */}
                            {item.scheme.eligibilityMatch === 'matched' ? (
                              <span style={{ backgroundColor: '#F0FDF4', color: '#166534', padding: '4px 10px', fontSize: '0.72rem', fontWeight: 800, borderRadius: 8, border: '1px solid #BBF7D0' }}>
                                ✓ Profile Criteria Aligned
                              </span>
                            ) : (item.scheme.eligibilityMatch === 'not_matched' || item.scheme.eligibilityStatus === 'not_eligible') ? (
                              <span style={{ backgroundColor: '#FEF2F2', color: '#DC2626', padding: '4px 10px', fontSize: '0.72rem', fontWeight: 800, borderRadius: 8, border: '1px solid #FECACA' }}>
                                ✕ Criteria Not Met
                              </span>
                            ) : (
                              <span style={{ backgroundColor: '#FFFBEB', color: '#D97706', padding: '4px 10px', fontSize: '0.72rem', fontWeight: 800, borderRadius: 8, border: '1px solid #FDE68A' }}>
                                ○ General Eligibility (Verify Criteria)
                              </span>
                            )}
                          </div>

                          <h4 className="font-display" style={{ fontSize: '1.35rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#000000' }}>
                            {item.scheme.name}
                          </h4>
                          {item.scheme.aliases && item.scheme.aliases.length > 0 && (
                            <div className="font-mono" style={{ fontSize: '0.74rem', color: '#64748B', marginTop: 2 }}>
                              Also known as: <strong>{item.scheme.aliases.join(', ')}</strong>
                            </div>
                          )}
                          {item.scheme.hindiName && (
                            <div className="font-body" style={{ fontSize: '0.88rem', fontStyle: 'italic', color: '#525252', marginTop: 2 }}>
                              {item.scheme.hindiName}
                            </div>
                          )}
                          {item.scheme.categoryReason && (
                            <div className="font-body" style={{ fontSize: '0.78rem', color: '#475569', marginTop: 4 }}>
                              • Category Context: {item.scheme.categoryReason}
                            </div>
                          )}
                          {item.scheme.verificationStatus === 'partially_verified' && item.scheme.partialVerificationReasons && item.scheme.partialVerificationReasons.length > 0 && (
                            <div
                              style={{
                                borderRadius: 10,
                                border: '1px solid #BFDBFE',
                                padding: '8px 12px',
                                backgroundColor: '#EFF6FF',
                                marginTop: 8,
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 6
                              }}
                            >
                              <Info size={14} color="#1D4ED8" style={{ flexShrink: 0, marginTop: 1 }} />
                              <div className="font-mono" style={{ fontSize: '0.72rem', color: '#1E40AF', lineHeight: 1.4 }}>
                                <strong>Partial Verification Note:</strong> {item.scheme.partialVerificationReasons.join(' ')}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons: Bookmark, Official Scheme Page & Direct Apply */}
                        <div className="scheme-action-buttons">
                          <button
                            type="button"
                            onClick={() => toggleBookmark(item)}
                            className="mono-btn-outline"
                            title={isBookmarked ? 'Remove from saved bookmarks' : 'Save / Bookmark this scheme for later'}
                            style={{
                              padding: '8px 12px',
                              fontSize: '0.75rem',
                              borderRadius: 10,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              backgroundColor: isBookmarked ? '#FEF3C7' : 'transparent',
                              borderColor: isBookmarked ? '#F59E0B' : '#CBD5E1',
                              color: isBookmarked ? '#92400E' : '#334155',
                              fontWeight: isBookmarked ? 800 : 600,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <Bookmark
                              size={13}
                              fill={isBookmarked ? '#D97706' : 'none'}
                              color={isBookmarked ? '#D97706' : '#64748B'}
                            />
                            <span>{isBookmarked ? 'SAVED' : 'BOOKMARK'}</span>
                          </button>

                          <a
                            href={item.scheme.officialInformationUrl || item.scheme.officialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mono-btn-outline"
                            title="View official scheme information and guidelines"
                            style={{ padding: '8px 14px', fontSize: '0.75rem', borderRadius: 10 }}
                          >
                            <Info size={13} />
                            <span>VIEW DETAILS</span>
                          </a>

                          {item.scheme.applyUrl ? (
                            <a
                              href={item.scheme.applyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mono-btn-primary"
                              title="Open official direct online apply portal"
                              style={{
                                padding: '8px 16px',
                                fontSize: '0.75rem',
                                background: 'linear-gradient(135deg, #FF7700 0%, #EA580C 100%)',
                                color: '#FFFFFF',
                                borderRadius: 10,
                                border: 'none',
                                boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)'
                              }}
                            >
                              <span>APPLY ON PORTAL</span>
                              <span>→</span>
                            </a>
                          ) : (
                            <span
                              title="No direct authenticated application portal verified yet from primary government records."
                              style={{
                                padding: '8px 14px',
                                fontSize: '0.74rem',
                                backgroundColor: '#F8FAFC',
                                color: '#64748B',
                                borderRadius: 10,
                                border: '1px dashed #CBD5E1',
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4
                              }}
                            >
                              Application link not verified
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Benefit Highlight Box (Warm Saffron / Ivory Entitlement Pill) */}
                      <div
                        style={{
                          margin: '14px 0 16px',
                          padding: '14px 18px',
                          borderRadius: 14,
                          border: '1px solid #FED7AA',
                          background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
                          boxShadow: '0 2px 8px rgba(234, 88, 12, 0.06)',
                          color: '#9A3412'
                        }}
                      >
                        <div className="font-mono" style={{ fontSize: '0.72rem', letterSpacing: '0.04em', color: '#000000', fontWeight: 800, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Award size={14} color="#EA580C" />
                          <span style={{ color: '#EA580C' }}>FINANCIAL BENEFIT / ASSISTANCE:</span>
                        </div>
                        <div className="font-display" style={{ fontSize: '1.08rem', fontWeight: 800, color: '#9A3412' }}>
                          {item.scheme.benefit}
                        </div>
                      </div>

                      {/* Scheme Summary */}
                      <p className="font-body" style={{ fontSize: '0.94rem', color: '#262626', lineHeight: 1.55, marginBottom: 16 }}>
                        {item.scheme.summary}
                      </p>

                      {/* Qualification Rationale */}
                      <div
                        style={{
                          borderRadius: 12,
                          border: '1px solid #E2E8F0',
                          padding: 14,
                          backgroundColor: '#F8FAFC',
                          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
                          marginBottom: 16
                        }}
                      >
                        <span className="font-mono" style={{ fontSize: '0.7rem', color: '#000000', fontWeight: 700, display: 'block', marginBottom: 6, letterSpacing: '0.04em' }}>
                          ELIGIBILITY & QUALIFICATION GUIDELINES:
                        </span>
                        <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                          {item.qualificationReasons.map((r, i) => (
                            <li key={i} className="font-body" style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.85rem', color: '#404040', marginBottom: 4 }}>
                              <span style={{ fontSize: '0.9rem', color: '#000000' }}>▪</span>
                              <span>{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {item.scheme.eligibilityMatch === 'not_matched' && item.missingOrCautionCriteria && item.missingOrCautionCriteria.length > 0 && (
                        <div
                          style={{
                            borderRadius: 10,
                            border: '1px solid #FECACA',
                            padding: '10px 14px',
                            backgroundColor: '#FEF2F2',
                            marginBottom: 16,
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 8
                          }}
                        >
                          <AlertTriangle size={15} color="#DC2626" style={{ flexShrink: 0, marginTop: 2 }} />
                          <div className="font-mono" style={{ fontSize: '0.74rem', color: '#991B1B', lineHeight: 1.4 }}>
                            <strong>Profile Disqualification:</strong> {item.missingOrCautionCriteria.join(' ')}
                          </div>
                        </div>
                      )}

                      {item.scheme.warnings && item.scheme.warnings.length > 0 && (
                        <div
                          style={{
                            borderRadius: 10,
                            border: '1px solid #FCD34D',
                            padding: '10px 14px',
                            backgroundColor: '#FFFDF0',
                            marginBottom: 16,
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 8
                          }}
                        >
                          <AlertTriangle size={15} color="#D97706" style={{ flexShrink: 0, marginTop: 2 }} />
                          <div className="font-mono" style={{ fontSize: '0.74rem', color: '#92400E', lineHeight: 1.4 }}>
                            {item.scheme.warnings.join(' ')}
                          </div>
                        </div>
                      )}

                      {/* Supporting References (Multi-Source Deduplication Evidence) */}
                      {item.scheme.supportingReferences && item.scheme.supportingReferences.length > 0 && (
                        <div
                          style={{
                            borderRadius: 10,
                            border: '1px solid #E2E8F0',
                            padding: '8px 12px',
                            backgroundColor: '#F8FAFC',
                            marginBottom: 14,
                            fontSize: '0.74rem',
                            color: '#475569',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            flexWrap: 'wrap'
                          }}
                        >
                          <span className="font-mono" style={{ fontWeight: 700, color: '#0F172A' }}>
                            SUPPORTING SOURCES:
                          </span>
                          {item.scheme.supportingReferences.map((ref, rIdx) => (
                            <span key={rIdx} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <a
                                href={ref.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#0284C7', textDecoration: 'underline', fontWeight: 600 }}
                              >
                                {ref.domain || ref.title || 'Source'}
                              </a>
                              {ref.isOfficial && (
                                <span style={{ fontSize: '0.65rem', backgroundColor: '#DCFCE7', color: '#166534', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>
                                  Gov
                                </span>
                              )}
                                {rIdx < (item.scheme.supportingReferences?.length || 0) - 1 ? ' •' : ''}
                              </span>
                            ))}
                          </div>
                        )}
                      {item.scheme.supportingDocuments && item.scheme.supportingDocuments.length > 0 && (
                        <div
                          style={{
                            borderRadius: 10,
                            border: '1px solid #BAE6FD',
                            padding: '10px 14px',
                            backgroundColor: '#F0F9FF',
                            marginBottom: 14,
                            fontSize: '0.74rem'
                          }}
                        >
                          <div className="font-mono" style={{ fontWeight: 800, color: '#0369A1', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <FileText size={13} color="#0284C7" />
                            SUPPORTING OFFICIAL GUIDELINES & EVIDENCE ({item.scheme.supportingDocuments.length}):
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {item.scheme.supportingDocuments.map((doc, dIdx) => (
                              <div key={dIdx} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '0.65rem', backgroundColor: '#E0F2FE', color: '#0284C7', padding: '1px 6px', borderRadius: 4, fontWeight: 700, textTransform: 'uppercase' }}>
                                  {doc.documentType || 'Guideline'}
                                </span>
                                <a
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: '#0369A1', textDecoration: 'underline', fontWeight: 600 }}
                                >
                                  {doc.title}
                                </a>
                                {doc.isOfficial && (
                                  <span style={{ fontSize: '0.62rem', backgroundColor: '#DCFCE7', color: '#166534', padding: '1px 4px', borderRadius: 4, fontWeight: 700 }}>
                                    Official
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Card Footer: Portal Link & Toggle Details */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: 14, flexWrap: 'wrap', gap: 10 }}>
                        <div className="font-mono" style={{ fontSize: '0.72rem', color: '#525252' }}>
                          {item.scheme.sourceClassification === 'official_application_portal' ? (
                            <>OFFICIAL APPLICATION PORTAL:{' '}</>
                          ) : (item.scheme.sourceClassification === 'official_government_scheme_page' || item.scheme.sourceClassification === 'official_government' || item.scheme.sourceClassification === 'official_scheme_portal') ? (
                            <>OFFICIAL DEPARTMENT PORTAL:{' '}</>
                          ) : (item.scheme.sourceClassification === 'official_supporting_document' || item.scheme.sourceRelationship === 'official_supporting_document') ? (
                            <>OFFICIAL SUPPORTING DOCUMENT:{' '}</>
                          ) : (item.scheme.sourceClassification === 'secondary_source' || item.scheme.sourceClassification === 'reputable_secondary' || item.scheme.sourceRelationship === 'reputable_secondary_source') ? (
                            <>SUPPORTING REFERENCE:{' '}</>
                          ) : (item.scheme.sourceClassification === 'commercial_source' || item.scheme.sourceClassification === 'commercial') ? (
                            <>COMMERCIAL REFERENCE:{' '}</>
                          ) : (
                            <>EXTERNAL REFERENCE:{' '}</>
                          )}
                          <a
                            href={item.scheme.officialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#000000', fontWeight: 700, textDecoration: 'underline' }}
                          >
                            {item.scheme.portalName} ↗
                          </a>
                          {item.scheme.supportingReferences && item.scheme.supportingReferences.length > 0 && (
                            <span style={{ marginLeft: 8, color: '#64748B' }}>
                              • Lead:{' '}
                              <a
                                href={item.scheme.supportingReferences[0].url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#475569', textDecoration: 'underline' }}
                              >
                                {item.scheme.supportingReferences[0].title || 'Reference'} ↗
                              </a>
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => setSelectedSchemeDetail(selectedSchemeDetail?.scheme.id === item.scheme.id ? null : item)}
                          className="mono-btn-ghost"
                          style={{ fontSize: '0.75rem', fontWeight: 700 }}
                        >
                          {selectedSchemeDetail?.scheme.id === item.scheme.id ? '▲ Hide Required Documents & Steps' : '▼ View Required Documents & Steps'}
                        </button>
                      </div>

                      {/* Collapsible Document Checklist & Application Steps */}
                      {selectedSchemeDetail?.scheme.id === item.scheme.id && (
                        <div
                          className="animate-entrance"
                          style={{
                            marginTop: 16,
                            paddingTop: 16,
                            borderRadius: 14,
                            border: '1px solid #E2E8F0',
                            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.06)',
                            backgroundColor: 'rgba(255, 255, 255, 0.94)',
                            backdropFilter: 'blur(16px)',
                            WebkitBackdropFilter: 'blur(16px)',
                            padding: 18
                          }}
                        >
                          {/* Official Guidelines Banner */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '12px 16px', borderRadius: 10, backgroundColor: item.scheme.evidenceStatus === 'officially_supported' ? '#F0FDF4' : '#FFFBEB', border: item.scheme.evidenceStatus === 'officially_supported' ? '1px solid #BBF7D0' : '1px solid #FDE68A', marginBottom: 14 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                              <span className="font-body" style={{ fontSize: '0.8rem', color: item.scheme.evidenceStatus === 'officially_supported' ? '#166534' : '#92400E', fontWeight: 700 }}>
                                {item.scheme.evidenceStatus === 'officially_supported' ? '✔ Official Government Guidelines' : 'ℹ Government Advisory Information'}
                              </span>
                              <span className="font-body" style={{ fontSize: '0.78rem', color: '#475569' }}>
                                • Portal: {item.scheme.portalName}
                              </span>
                              <span className="font-body" style={{ fontSize: '0.78rem', color: '#475569' }}>
                                • Application Window: {item.scheme.academicYearOrValidity || 'Active Cycle (AY 2025-26)'}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                              Keep your original documents and verified copies ready before applying on the official portal.
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
                            <div>
                              <h5 className="font-mono" style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.04em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <FileText size={14} /> DOCUMENTS REQUIRED TO APPLY:
                              </h5>
                              <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                                {item.scheme.requiredDocuments.map((doc, idx) => (
                                  <li key={idx} className="font-body" style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.85rem', color: '#262626', marginBottom: 6 }}>
                                    <Check size={14} style={{ marginTop: 2, flexShrink: 0, color: '#16A34A' }} />
                                    <span>{doc}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div style={{ borderLeft: '1px solid rgba(0,0,0,0.15)', paddingLeft: 16 }}>
                              <h5 className="font-mono" style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.04em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Info size={14} /> HOW TO APPLY ONLINE:
                              </h5>
                              <ol style={{ paddingLeft: 18, fontSize: '0.85rem', color: '#262626', lineHeight: 1.6 }} className="font-body">
                                {item.scheme.stepsToApply.map((step, idx) => (
                                  <li key={idx} style={{ marginBottom: 6 }}>
                                    {step}
                                  </li>
                                ))}
                              </ol>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    );
                  })}

                  {/* Unverified Candidates Section (Strictly Separated from Verified Results) */}
                  {unverifiedCandidatesList && unverifiedCandidatesList.length > 0 && (
                    <div
                      style={{
                        marginTop: 8,
                        padding: '18px 22px',
                        borderRadius: 16,
                        backgroundColor: '#F8FAFC',
                        border: '1px dashed #CBD5E1'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <AlertCircle size={16} color="#D97706" />
                          <h4 className="font-mono" style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '0.04em' }}>
                            UNVERIFIED CANDIDATE SCHEMES ({unverifiedCandidatesList.length})
                          </h4>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: '#64748B', backgroundColor: '#F1F5F9', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>
                          Requires Primary Source Evidence • Excluded from Verified Count
                        </span>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: 1.5, margin: '0 0 12px 0' }}>
                        The following candidate records were identified in search indexes, but lack official scheme page ownership, authoritative guidelines, or established jurisdiction. They are kept strictly separate from verified results.
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {unverifiedCandidatesList.map((cand: any, cIdx: number) => (
                          <div
                            key={cIdx}
                            style={{
                              padding: '10px 14px',
                              borderRadius: 10,
                              backgroundColor: '#FFFFFF',
                              border: '1px solid #E2E8F0',
                              fontSize: '0.78rem',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: 8
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 700, color: '#1E293B' }}>{cand.name}</div>
                              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: 2 }}>
                                {cand.jurisdictionReason || cand.exclusionReason || cand.description || 'Candidate scheme without authoritative gazette or scheme portal validation'}
                              </div>
                            </div>
                            {cand.officialUrl && (
                              <a
                                href={cand.officialUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ fontSize: '0.72rem', color: '#0284C7', textDecoration: 'underline', fontWeight: 600 }}
                              >
                                View Source ↗
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        </main>
      )}

      {/* Official Government Footer */}
      <footer
        style={{
          borderTop: '1px solid #E2E8F0',
          backgroundColor: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 -4px 20px -2px rgba(15, 23, 42, 0.03)',
          padding: '36px 24px',
          marginTop: 'auto',
          width: '100%',
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: 10
        }}
      >
        <div
          className="app-container"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 24
          }}
        >
          {/* Footer Official Links Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 24,
              borderBottom: '1px solid #E2E8F0',
              paddingBottom: 24
            }}
          >
            <div>
              <span className="font-mono" style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', display: 'block', marginBottom: 10 }}>
                YOJANAMITRA DIRECTORY
              </span>
              <p className="font-body" style={{ fontSize: '0.85rem', color: '#525252', lineHeight: 1.5 }}>
                A unified, transparent public welfare directory empowering Indian citizens, students, and farmers through verified scheme discovery.
              </p>
            </div>

            <div>
              <span className="font-mono" style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', display: 'block', marginBottom: 10 }}>
                NATIONAL PORTALS
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <a
                  href="https://scholarships.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono"
                  style={{ fontSize: '0.74rem', color: '#000000', textDecoration: 'none' }}
                >
                  National Scholarship Portal (NSP) ↗
                </a>
                <a
                  href="https://www.myscheme.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono"
                  style={{ fontSize: '0.74rem', color: '#000000', textDecoration: 'none' }}
                >
                  MyScheme Central Repository ↗
                </a>
                <a
                  href="https://dbtbharat.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono"
                  style={{ fontSize: '0.74rem', color: '#000000', textDecoration: 'none' }}
                >
                  Direct Benefit Transfer (DBT Bharat) ↗
                </a>
              </div>
            </div>

            <div>
              <span className="font-mono" style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', display: 'block', marginBottom: 10 }}>
                SECTOR PLATFORMS
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <a
                  href="https://pmkisan.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono"
                  style={{ fontSize: '0.74rem', color: '#000000', textDecoration: 'none' }}
                >
                  PM-KISAN Samman Nidhi ↗
                </a>
                <a
                  href="https://beneficiary.nha.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono"
                  style={{ fontSize: '0.74rem', color: '#000000', textDecoration: 'none' }}
                >
                  Ayushman Bharat PM-JAY ↗
                </a>
                <a
                  href="https://pmvishwakarma.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono"
                  style={{ fontSize: '0.74rem', color: '#000000', textDecoration: 'none' }}
                >
                  PM Vishwakarma Portal ↗
                </a>
              </div>
            </div>

            <div>
              <span className="font-mono" style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', display: 'block', marginBottom: 10 }}>
                PROJECT NOTICE
              </span>
              <div className="font-mono" style={{ fontSize: '0.72rem', color: '#525252', lineHeight: 1.6 }}>
                <div>INDEPENDENT CITIZEN INITIATIVE</div>
                <div>NOT AFFILIATED WITH ANY GOVERNMENT</div>
                <div>DIRECT LINKS TO PUBLIC SCHEMES</div>
                <div>STRICT ZERO-DATA RETENTION</div>
              </div>
            </div>
          </div>

          {/* Footer Copyright Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12
            }}
          >
            <div className="font-mono" style={{ fontSize: '0.72rem', letterSpacing: '0.08em' }}>
              © {CURRENT_YEAR} YOJANAMITRA. ALL RIGHTS RESERVED.
            </div>
          </div>
        </div>
      </footer>

      {/* Central Login / Authentication Modal Popup */}
      {isAuthModalOpen && (
        <AuthPage
          isModal={true}
          initialMode={authMode}
          promptReason={authModalReason}
          statesList={INDIAN_STATES}
          onLoginSuccess={handleLoginSuccess}
          onClose={() => {
            setIsAuthModalOpen(false);
            setAuthModalReason(null);
            setPendingPersona(null);
          }}
          onBackToApp={() => {
            setIsAuthModalOpen(false);
            setAuthModalReason(null);
            setPendingPersona(null);
          }}
        />
      )}

      {/* Discovery Diagnostics & Retrieval Pipeline Audit Modal */}
      {showDiagnosticsModal && discoveryDiagnostics && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
          onClick={() => setShowDiagnosticsModal(false)}
        >
          <div
            className="animate-entrance"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 20,
              border: '1px solid #CBD5E1',
              boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.25)',
              maxWidth: 780,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px 28px',
              position: 'relative'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, borderBottom: '1px solid #E2E8F0', paddingBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Activity size={20} color="#0284C7" />
                </div>
                <div>
                  <h3 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Live Discovery Diagnostics
                  </h3>
                  <div className="font-mono" style={{ fontSize: '0.72rem', color: '#64748B' }}>
                    RETRIEVAL PIPELINE & SOURCE AUDIT
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowDiagnosticsModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: '#64748B' }}
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Complete 11-Metric Retrieval & Verification Pipeline Grid */}
            <div style={{ marginBottom: 20 }}>
              <div className="font-mono" style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0F172A', marginBottom: 8, letterSpacing: '0.04em' }}>
                PIPELINE METRICS AUDIT (END-TO-END NATIONWIDE TELEMETRY)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8 }}>
                <div style={{ backgroundColor: '#F8FAFC', padding: '10px 12px', borderRadius: 10, border: '1px solid #E2E8F0', textAlign: 'center' }}>
                  <div className="font-mono" style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 700 }}>RESULTS EXAMINED</div>
                  <div className="font-display" style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A' }}>
                    {discoveryDiagnostics.searchResultsExamined ?? discoveryDiagnostics.uniqueUrlsDiscovered ?? 0}
                  </div>
                </div>
                <div style={{ backgroundColor: '#F8FAFC', padding: '10px 12px', borderRadius: 10, border: '1px solid #E2E8F0', textAlign: 'center' }}>
                  <div className="font-mono" style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 700 }}>UNIQUE CANDIDATES</div>
                  <div className="font-display" style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A' }}>
                    {discoveryDiagnostics.uniqueCandidateSchemes ?? discoveryDiagnostics.schemesExtracted ?? 0}
                  </div>
                </div>
                <div style={{ backgroundColor: '#F8FAFC', padding: '10px 12px', borderRadius: 10, border: '1px solid #E2E8F0', textAlign: 'center' }}>
                  <div className="font-mono" style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 700 }}>CANONICAL SCHEMES</div>
                  <div className="font-display" style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A' }}>
                    {discoveryDiagnostics.canonicalSchemesAfterDeduplication ?? 0}
                  </div>
                </div>
                <div style={{ backgroundColor: '#ECFDF5', padding: '10px 12px', borderRadius: 10, border: '1px solid #A7F3D0', textAlign: 'center' }}>
                  <div className="font-mono" style={{ fontSize: '0.65rem', color: '#065F46', fontWeight: 700 }}>VERIFIED SCHEMES</div>
                  <div className="font-display" style={{ fontSize: '1.25rem', fontWeight: 900, color: '#047857' }}>
                    {discoveryDiagnostics.verifiedSchemes ?? discoveryDiagnostics.verificationBreakdown?.verifiedCount ?? 0}
                  </div>
                </div>
                <div style={{ backgroundColor: '#EFF6FF', padding: '10px 12px', borderRadius: 10, border: '1px solid #BFDBFE', textAlign: 'center' }}>
                  <div className="font-mono" style={{ fontSize: '0.65rem', color: '#1E40AF', fontWeight: 700 }}>PARTIALLY VERIFIED</div>
                  <div className="font-display" style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1D4ED8' }}>
                    {discoveryDiagnostics.partiallyVerifiedSchemes ?? discoveryDiagnostics.verificationBreakdown?.partiallyVerifiedCount ?? 0}
                  </div>
                </div>
                <div style={{ backgroundColor: '#FFFBEB', padding: '10px 12px', borderRadius: 10, border: '1px solid #FDE68A', textAlign: 'center' }}>
                  <div className="font-mono" style={{ fontSize: '0.65rem', color: '#92400E', fontWeight: 700 }}>UNVERIFIED CANDIDATES</div>
                  <div className="font-display" style={{ fontSize: '1.25rem', fontWeight: 900, color: '#B45309' }}>
                    {discoveryDiagnostics.unverifiedCandidates ?? discoveryDiagnostics.verificationBreakdown?.unverifiedCount ?? 0}
                  </div>
                </div>
                <div style={{ backgroundColor: '#FEF2F2', padding: '10px 12px', borderRadius: 10, border: '1px solid #FECACA', textAlign: 'center' }}>
                  <div className="font-mono" style={{ fontSize: '0.65rem', color: '#991B1B', fontWeight: 700 }}>REJECTED CANDIDATES</div>
                  <div className="font-display" style={{ fontSize: '1.25rem', fontWeight: 900, color: '#DC2626' }}>
                    {discoveryDiagnostics.rejectedCandidates ?? discoveryDiagnostics.verificationBreakdown?.rejectedCount ?? 0}
                  </div>
                </div>
                <div style={{ backgroundColor: '#F8FAFC', padding: '10px 12px', borderRadius: 10, border: '1px solid #E2E8F0', textAlign: 'center' }}>
                  <div className="font-mono" style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 700 }}>DUPLICATES MERGED</div>
                  <div className="font-display" style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A' }}>
                    {discoveryDiagnostics.duplicateCandidatesMerged ?? discoveryDiagnostics.duplicatesMerged ?? 0}
                  </div>
                </div>
                <div style={{ backgroundColor: '#F0FDF4', padding: '10px 12px', borderRadius: 10, border: '1px solid #BBF7D0', textAlign: 'center' }}>
                  <div className="font-mono" style={{ fontSize: '0.65rem', color: '#166534', fontWeight: 700 }}>OFFICIAL INFO PORTALS</div>
                  <div className="font-display" style={{ fontSize: '1.25rem', fontWeight: 900, color: '#15803D' }}>
                    {discoveryDiagnostics.officialInformationPortalsCount ?? discoveryDiagnostics.sourcesVerifiedAsOfficial ?? 0}
                  </div>
                </div>
                <div style={{ backgroundColor: '#F0FDF4', padding: '10px 12px', borderRadius: 10, border: '1px solid #BBF7D0', textAlign: 'center' }}>
                  <div className="font-mono" style={{ fontSize: '0.65rem', color: '#166534', fontWeight: 700 }}>OFFICIAL APPLY PORTALS</div>
                  <div className="font-display" style={{ fontSize: '1.25rem', fontWeight: 900, color: '#15803D' }}>
                    {discoveryDiagnostics.officialApplicationPortalsCount ?? 0}
                  </div>
                </div>
                <div style={{ backgroundColor: '#F8FAFC', padding: '10px 12px', borderRadius: 10, border: '1px solid #E2E8F0', textAlign: 'center' }}>
                  <div className="font-mono" style={{ fontSize: '0.65rem', color: '#475569', fontWeight: 700 }}>SECONDARY SOURCES</div>
                  <div className="font-display" style={{ fontSize: '1.25rem', fontWeight: 900, color: '#334155' }}>
                    {discoveryDiagnostics.secondarySourcesCount ?? discoveryDiagnostics.domainsBreakdown?.secondaryCount ?? 0}
                  </div>
                </div>
                <div style={{ backgroundColor: '#F8FAFC', padding: '10px 12px', borderRadius: 10, border: '1px solid #E2E8F0', textAlign: 'center' }}>
                  <div className="font-mono" style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 700 }}>FAILED FETCHES</div>
                  <div className="font-display" style={{ fontSize: '1.25rem', fontWeight: 900, color: '#64748B' }}>
                    {discoveryDiagnostics.failedFetches ?? 0}
                  </div>
                </div>
                <div style={{ backgroundColor: '#F8FAFC', padding: '10px 12px', borderRadius: 10, border: '1px solid #E2E8F0', textAlign: 'center' }}>
                  <div className="font-mono" style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 700 }}>EXTRACTION ERRORS</div>
                  <div className="font-display" style={{ fontSize: '1.25rem', fontWeight: 900, color: '#64748B' }}>
                    {discoveryDiagnostics.extractionErrors ?? 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Source Classification & Domain Breakdown */}
            <div style={{ marginBottom: 20 }}>
              <div className="font-mono" style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0F172A', marginBottom: 8, letterSpacing: '0.04em' }}>
                SOURCE DIVERSITY & CLASSIFICATION
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
                <div style={{ padding: '6px 12px', borderRadius: 8, backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', fontSize: '0.75rem', color: '#065F46', fontWeight: 700 }}>
                  ✔ Official Government Domains: {discoveryDiagnostics.domainsBreakdown?.officialCount || 0}
                </div>
                <div style={{ padding: '6px 12px', borderRadius: 8, backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', fontSize: '0.75rem', color: '#1E40AF', fontWeight: 700 }}>
                  ℹ Reputable Secondary Portals: {discoveryDiagnostics.domainsBreakdown?.secondaryCount || 0}
                </div>
                <div style={{ padding: '6px 12px', borderRadius: 8, backgroundColor: '#FEF2F2', border: '1px solid #FECACA', fontSize: '0.75rem', color: '#991B1B', fontWeight: 700 }}>
                  ✕ Filtered Commercial Aggregators: {discoveryDiagnostics.domainsBreakdown?.commercialCount || 0}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {discoveryDiagnostics.domainsBreakdown?.uniqueDomains?.map((domain: string, idx: number) => (
                  <span key={idx} className="font-mono" style={{ fontSize: '0.68rem', backgroundColor: '#F1F5F9', color: '#334155', padding: '3px 8px', borderRadius: 6, border: '1px solid #E2E8F0' }}>
                    {domain}
                  </span>
                ))}
              </div>
            </div>

            {/* Search Budget & Latency Guard */}
            <div style={{ marginBottom: 20, padding: 14, borderRadius: 12, backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <div className="font-mono" style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
                SAFETY SEARCH BUDGET STATUS
              </div>
              <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
                • Max Query Budget: <strong>{discoveryDiagnostics.searchBudget?.maxQueries || 6}</strong> queries per search<br />
                • Max Fetch Budget: <strong>{discoveryDiagnostics.searchBudget?.maxFetchPages || 8}</strong> candidate detail pages<br />
                • Budget Cap Reached: <strong>{discoveryDiagnostics.searchBudget?.budgetLimitReached ? 'Yes (Protected against infinite loops / cost spikes)' : 'No (Completed all queries within budget)'}</strong>
              </div>
            </div>

            {/* Queries Attempted */}
            <div style={{ marginBottom: 20 }}>
              <div className="font-mono" style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0F172A', marginBottom: 8, letterSpacing: '0.04em' }}>
                QUERIES EXECUTED ACROSS STATE & CENTRAL PORTALS ({discoveryDiagnostics.queriesAttempted?.length || 0})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {discoveryDiagnostics.queriesAttempted?.map((q: string, idx: number) => (
                  <div key={idx} className="font-mono" style={{ fontSize: '0.74rem', padding: '6px 10px', backgroundColor: '#F8FAFC', borderRadius: 6, border: '1px solid #E2E8F0', color: '#1E293B' }}>
                    {idx + 1}. {q}
                  </div>
                ))}
              </div>
            </div>

            {/* Merged Scheme Records (Multi-source deduplication) */}
            {discoveryDiagnostics.mergedRecords && discoveryDiagnostics.mergedRecords.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div className="font-mono" style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>
                  DEDUPLICATED & MERGED SCHEME RECORDS ({discoveryDiagnostics.mergedRecords.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {discoveryDiagnostics.mergedRecords.map((m: any, idx: number) => (
                    <div key={idx} style={{ padding: '8px 12px', borderRadius: 8, backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', fontSize: '0.76rem', color: '#166534' }}>
                      <strong>{m.schemeName}</strong>: Merged {m.sourcesMergedCount} distinct web references into single canonical record.
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Verification Status Breakdown */}
            {discoveryDiagnostics.verificationBreakdown && (
              <div style={{ marginBottom: 20 }}>
                <div className="font-mono" style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0F172A', marginBottom: 8, letterSpacing: '0.04em' }}>
                  NATIONWIDE VERIFICATION STATUS BREAKDOWN
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ padding: '6px 12px', borderRadius: 8, backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', fontSize: '0.75rem', color: '#065F46', fontWeight: 700 }}>
                    ✔ Verified Schemes: {discoveryDiagnostics.verificationBreakdown.verifiedCount}
                  </div>
                  <div style={{ padding: '6px 12px', borderRadius: 8, backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', fontSize: '0.75rem', color: '#1E40AF', fontWeight: 700 }}>
                    ℹ Partially Verified: {discoveryDiagnostics.verificationBreakdown.partiallyVerifiedCount}
                  </div>
                  <div style={{ padding: '6px 12px', borderRadius: 8, backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', fontSize: '0.75rem', color: '#475569', fontWeight: 700 }}>
                    ○ Unverified Candidates: {discoveryDiagnostics.verificationBreakdown.unverifiedCount}
                  </div>
                  <div style={{ padding: '6px 12px', borderRadius: 8, backgroundColor: '#FEF2F2', border: '1px solid #FECACA', fontSize: '0.75rem', color: '#991B1B', fontWeight: 700 }}>
                    ✕ Rejected: {discoveryDiagnostics.verificationBreakdown.rejectedCount}
                  </div>
                </div>
              </div>
            )}

            {/* Jurisdiction Exclusions Log */}
            {discoveryDiagnostics.jurisdictionFailures && discoveryDiagnostics.jurisdictionFailures.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div className="font-mono" style={{ fontSize: '0.74rem', fontWeight: 800, color: '#B91C1C', marginBottom: 8 }}>
                  DYNAMIC JURISDICTION EXCLUSIONS ({discoveryDiagnostics.jurisdictionFailures.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 150, overflowY: 'auto' }}>
                  {discoveryDiagnostics.jurisdictionFailures.map((jf: any, idx: number) => (
                    <div key={idx} style={{ padding: '6px 10px', borderRadius: 6, backgroundColor: '#FEF2F2', border: '1px solid #FECACA', fontSize: '0.72rem' }}>
                      <div style={{ fontWeight: 700, color: '#991B1B' }}>{jf.schemeName}</div>
                      <div style={{ color: '#7F1D1D', wordBreak: 'break-all' }}>{jf.url}</div>
                      <div style={{ color: '#B91C1C', fontStyle: 'italic', marginTop: 2 }}>{jf.reason}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rejected Results Audit Log */}
            {discoveryDiagnostics.resultsRejected && discoveryDiagnostics.resultsRejected.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div className="font-mono" style={{ fontSize: '0.74rem', fontWeight: 800, color: '#991B1B', marginBottom: 8 }}>
                  REJECTED RESULTS & FILTER REASONS ({discoveryDiagnostics.resultsRejected.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 180, overflowY: 'auto' }}>
                  {discoveryDiagnostics.resultsRejected.map((r: any, idx: number) => (
                    <div key={idx} style={{ padding: '6px 10px', borderRadius: 6, backgroundColor: '#FEF2F2', border: '1px solid #FECACA', fontSize: '0.72rem' }}>
                      <div style={{ fontWeight: 700, color: '#991B1B' }}>{r.title}</div>
                      <div style={{ color: '#7F1D1D', wordBreak: 'break-all' }}>{r.url}</div>
                      <div style={{ color: '#B91C1C', fontStyle: 'italic', marginTop: 2 }}>Reason: {r.reason}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fetch Failures (if any) */}
            {discoveryDiagnostics.fetchFailures && discoveryDiagnostics.fetchFailures.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div className="font-mono" style={{ fontSize: '0.74rem', fontWeight: 800, color: '#92400E', marginBottom: 8 }}>
                  PAGE FETCH TIMEOUTS / FAILURES ({discoveryDiagnostics.fetchFailures.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {discoveryDiagnostics.fetchFailures.map((f: any, idx: number) => (
                    <div key={idx} style={{ padding: '6px 10px', borderRadius: 6, backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', fontSize: '0.72rem', color: '#92400E', wordBreak: 'break-all' }}>
                      {f.url} — {f.error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Safe Logging Notice */}
            <div style={{ padding: '8px 12px', borderRadius: 8, backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: '0.7rem', color: '#64748B' }}>
              🔒 <strong>Safe Diagnostics Notice:</strong> Zero API keys, auth tokens, or private demographic inputs are logged or exposed in this report.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// React Global Error Boundary to catch any runtime rendering exception in the website
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[YojanaMitra Diagnostic Caught]:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-canvas)' }}>
          <div className="ambient-frost-mesh" aria-hidden="true">
            <div className="ambient-frost-orb-1" />
            <div className="ambient-frost-orb-2" />
            <div className="ambient-frost-orb-3" />
          </div>
          <main
            className="app-container animate-entrance"
            style={{
              padding: '80px 24px',
              textAlign: 'center',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              zIndex: 1
            }}
          >
            <div
              style={{
                backgroundColor: '#FEF2F2',
                color: '#B91C1C',
                padding: '6px 16px',
                borderRadius: 9999,
                fontSize: '0.76rem',
                fontWeight: 700,
                border: '1px solid #FECACA',
                marginBottom: 20,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <AlertTriangle size={15} color="#DC2626" />
              <span>Service Temporarily Unavailable</span>
            </div>
            <h1 className="font-display" style={{ fontSize: 'clamp(2.4rem, 6vw, 3.8rem)', fontWeight: 900, letterSpacing: '-0.03em', color: '#0B2545', marginBottom: 8 }}>
              Something Went Wrong
            </h1>
            <div style={{ width: 80, height: 3, backgroundColor: '#EA580C', margin: '16px auto 20px', borderRadius: 9999 }} />
            <h2 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#334155', marginBottom: 10 }}>
              Unable to Complete Request
            </h2>
            <p className="font-body" style={{ fontSize: '0.96rem', color: '#4B5563', maxWidth: 540, margin: '0 auto 28px', lineHeight: 1.6 }}>
              {this.state.error?.message || 'We experienced an unexpected issue loading this page. Please return to the homepage or refresh to try again.'}
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  this.handleReset();
                  window.location.href = '/';
                }}
                className="mono-btn-primary"
                style={{ padding: '12px 24px', fontSize: '0.85rem' }}
              >
                ← Return to YojanaMitra Home
              </button>
              <button
                onClick={() => window.location.reload()}
                className="mono-btn-outline"
                style={{ padding: '12px 20px', fontSize: '0.85rem' }}
              >
                Refresh Page
              </button>
            </div>
          </main>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

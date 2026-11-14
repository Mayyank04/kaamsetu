import { SupportedLanguageCode } from "@/schemas/onboarding.schema";

export interface OnboardingTranslations {
  step1Title: string;
  step1Subtitle: string;
  selectLanguage: string;
  chooseInputMode: string;
  voiceModeTitle: string;
  voiceModeDesc: string;
  textModeTitle: string;
  textModeDesc: string;
  continueBtn: string;
  step2Title: string;
  step2Subtitle: string;
  recordPrompt: string;
  holdToSpeak: string;
  recordingActive: string;
  stopRecording: string;
  playSample: string;
  reviewTranscript: string;
  liveTranscriptTitle: string;
  placeholderTranscript: string;
  analyzeBtn: string;
  step3Title: string;
  step3Subtitle: string;
  extractedTitle: string;
  editSkillsTitle: string;
  addSkillPlaceholder: string;
  addSkillBtn: string;
  servicesTitle: string;
  missingFieldsAlert: string;
  approveBtn: string;
  step4Title: string;
  step4Subtitle: string;
  congratsMessage: string;
  viewLiveProfile: string;
  sampleTestimonies: {
    title: string;
    text: string;
  }[];
}

export const ONBOARDING_I18N: Record<SupportedLanguageCode, OnboardingTranslations> = {
  hi: {
    step1Title: "भाषा और पंजीकरण माध्यम चुनें",
    step1Subtitle: "कामसेतु आपकी मातृभाषा समझता है। बोलकर या लिखकर अपनी पहचान बनाएं।",
    selectLanguage: "अपनी भाषा चुनें",
    chooseInputMode: "आप जानकारी कैसे देना चाहेंगे?",
    voiceModeTitle: "आवाज से पंजीकरण (अनुशंसित)",
    voiceModeDesc: "माइक दबाकर अपनी भाषा में अपने काम, औजारों और अनुभव के बारे में बताएं।",
    textModeTitle: "लिखकर पंजीकरण",
    textModeDesc: "यदि आप टाइप करना चाहें तो सीधे लिखकर अपना अनुभव दर्ज करें।",
    continueBtn: "आगे बढ़ें",
    step2Title: "अपने हुनर और अनुभव के बारे में बताएं",
    step2Subtitle: "बताएं कि आप कौन सा काम करते हैं, कौन से औजार इस्तेमाल करते हैं और कितने साल का अनुभव है।",
    recordPrompt: "माइक दबाएं और अपने काम के बारे में खुलकर बोलें",
    holdToSpeak: "माइक शुरू करें",
    recordingActive: "हम सुन रहे हैं... अपने काम का विवरण दें",
    stopRecording: "रिकॉर्डिंग समाप्त करें",
    playSample: "नमूना ऑडियो देखें",
    reviewTranscript: "बोली गई बातें (ट्रांसक्रिप्ट)",
    liveTranscriptTitle: "लाइव ट्रांसक्रिप्ट",
    placeholderTranscript: "आप जो बोलेंगे, वह यहाँ शब्द-दर-शब्द दिखाई देगा...",
    analyzeBtn: "AI से कौशल का विश्लेषण करें",
    step3Title: "AI कौशल विश्लेषण और सत्यापन",
    step3Subtitle: "AI ने आपकी बातों से यह विवरण निकाला है। आप किसी भी जानकारी को बदल या जोड़ सकते हैं।",
    extractedTitle: "पहचाना गया ट्रेड और अनुभव",
    editSkillsTitle: "सत्यापित कौशल और औजार",
    addSkillPlaceholder: "कौशल जोड़ें (उदा. 3-फेज वायरिंग)",
    addSkillBtn: "जोड़ें",
    servicesTitle: "दी जाने वाली सेवाएं एवं अनुमानित दरें",
    missingFieldsAlert: "कुछ जानकारी छूट गई है, कृपया नीचे भरें:",
    approveBtn: "सत्यापित करें और सॉवरेन कार्ड बनाएं",
    step4Title: "बधाई! आपका सॉवरेन स्किल कार्ड जारी हो गया",
    step4Subtitle: "आपकी डिजिटल पहचान अब राष्ट्रीय कौशल रजिस्ट्री से लिंक हो चुकी है।",
    congratsMessage: "आपका KAAMSCORE™ ट्रस्ट इंडेक्स सफलतापूर्वक जनरेट हो गया है।",
    viewLiveProfile: "अपना लाइव प्रोफाइल देखें",
    sampleTestimonies: [
      {
        title: "रामेश्वर शर्मा (इलेक्ट्रीशियन, जयपुर)",
        text: "नमस्ते, मेरा नाम रामेश्वर शर्मा है। मैं जयपुर और सीतापुरा इंडस्ट्रियल एरिया में पिछले 14 साल से 3-फेज कमर्शियल वायरिंग और 10kW से 85kW रूफटॉप सोलर इन्वर्टर लगाने का काम करता हूं। बॉश और मेगर टूल्स से पूरा काम करता हूं।",
      },
      {
        title: "सुनीता देवी (बुनकर, वाराणसी)",
        text: "प्रणाम, हम सुनीता देवी हैं। बनारस में पिछले 18 वर्षों से शुद्ध रेशम और असली सोने के तार से बनारसी कढ़वा जरी साड़ी बुन रहे हैं। जापानी जैक्वार्ड लूम और प्राकृतिक नील रंगाई में विशेषज्ञता है।",
      },
    ],
  },
  en: {
    step1Title: "Select Language & Onboarding Mode",
    step1Subtitle: "KAAMSETU understands your vernacular. Build sovereign proof via voice or text.",
    selectLanguage: "Select Preferred Language",
    chooseInputMode: "How would you prefer to declare your craft?",
    voiceModeTitle: "Voice-First Attestation (Recommended)",
    voiceModeDesc: "Speak naturally in your mother tongue about your trade, tools, and experience.",
    textModeTitle: "Text-Based Attestation",
    textModeDesc: "Type or paste your craft details manually if mic is not preferred.",
    continueBtn: "Continue to Attestation",
    step2Title: "Declare Your Craft & Hands-On Experience",
    step2Subtitle: "Describe the trade you practice, the equipment you operate, and your completed projects.",
    recordPrompt: "Tap the microphone and speak freely about your trade",
    holdToSpeak: "Start Audio Recording",
    recordingActive: "Listening actively... Describe your work",
    stopRecording: "Stop Recording",
    playSample: "Load Realistic Testimony",
    reviewTranscript: "Spoken Claim Transcript",
    liveTranscriptTitle: "Live Stream Transcript",
    placeholderTranscript: "Your spoken testimony will stream here in real time...",
    analyzeBtn: "Extract Skills with Gemini AI",
    step3Title: "AI Skill Extraction & Verification",
    step3Subtitle: "Gemini has structured your spoken testimony. Review and edit any field before minting.",
    extractedTitle: "Identified Trade & Experience",
    editSkillsTitle: "Validated Skills & Equipment",
    addSkillPlaceholder: "Add skill (e.g. 3-Phase Busbar)",
    addSkillBtn: "Add",
    servicesTitle: "Services Offered & Estimated Rates",
    missingFieldsAlert: "Information not detected in testimony (please specify below):",
    approveBtn: "Approve & Mint Sovereign Skill Card",
    step4Title: "Congratulations! Sovereign Skill Card Issued",
    step4Subtitle: "Your verified workforce identity is officially anchored to the National Skill Trust Registry.",
    congratsMessage: "Your cryptographic KAAMSCORE™ index has been calculated and linked to your DigiLocker identity.",
    viewLiveProfile: "View Live Public Profile",
    sampleTestimonies: [
      {
        title: "Rameshwar Sharma (Solar Electrician, Jaipur)",
        text: "Namaste, my name is Rameshwar Sharma. For the past 14 years in Jaipur and Sitapura industrial zone I have been installing 3-phase commercial wiring, distribution panels, and 10kW to 85kW rooftop solar inverters with Bosch and Megger tools.",
      },
      {
        title: "Mohammed Rafiq (Fleet EV Mechanic, Pune)",
        text: "Hello, I am Mohammed Rafiq from MIDC Bhosari, Pune. I have 16 years of hands-on experience in commercial diesel engine overhaul and commercial truck EV battery pack conversions with CAN-bus diagnostics.",
      },
    ],
  },
  bn: {
    step1Title: "ভাষা এবং পঞ্জিকরণ মাধ্যম নির্বাচন করুন",
    step1Subtitle: "কামসেতু আপনার মাতৃভাষা বোঝে। কণ্ঠস্বর বা লেখার মাধ্যমে নিজের পরিচয় তৈরি করুন।",
    selectLanguage: "আপনার ভাষা নির্বাচন করুন",
    chooseInputMode: "আপনি কীভাবে তথ্য দিতে চান?",
    voiceModeTitle: "কণ্ঠস্বরের মাধ্যমে পঞ্জিকরণ (সুপারিশকৃত)",
    voiceModeDesc: "মাইক টিপে আপনার ভাষায় নিজের কাজ, যন্ত্রপাতি এবং অভিজ্ঞতা সম্পর্কে বলুন।",
    textModeTitle: "লিখে পঞ্জিকরণ",
    textModeDesc: "আপনি চাইলে সরাসরি টাইপ করে আপনার অভিজ্ঞতা লিখতে পারেন।",
    continueBtn: "এগিয়ে যান",
    step2Title: "আপনার কারুশিল্প এবং অভিজ্ঞতা বর্ণনা করুন",
    step2Subtitle: "আপনি কী কাজ করেন, কী কী যন্ত্রপাতি ব্যবহার করেন এবং কত বছরের অভিজ্ঞতা রয়েছে তা বলুন।",
    recordPrompt: "মাইক্রোফোন টিপুন এবং আপনার কাজের কথা বলুন",
    holdToSpeak: "রেকর্ডিং শুরু করুন",
    recordingActive: "আমরা শুনছি... আপনার কাজের বিবরণ দিন",
    stopRecording: "রেকর্ডিং বন্ধ করুন",
    playSample: "নমুনা অডিও লোড করুন",
    reviewTranscript: "কথিত ট্রান্সক্রিপ্ট পর্যালোচনা",
    liveTranscriptTitle: "লাইভ ট্রান্সক্রিপ্ট",
    placeholderTranscript: "আপনি যা বলবেন তা এখানে প্রদর্শিত হবে...",
    analyzeBtn: "AI দিয়ে দক্ষতা বিশ্লেষণ করুন",
    step3Title: "AI দক্ষতা বিশ্লেষণ ও যাচাইকরণ",
    step3Subtitle: "AI আপনার বক্তব্য থেকে এই বিবরণ প্রস্তুত করেছে। আপনি যে কোনো তথ্য পরিবর্তন করতে পারেন।",
    extractedTitle: "শনাক্তকৃত বাণিজ্য ও অভিজ্ঞতা",
    editSkillsTitle: "যাচাইকৃত দক্ষতা ও সরঞ্জাম",
    addSkillPlaceholder: "দক্ষতা যোগ করুন",
    addSkillBtn: "যোগ করুন",
    servicesTitle: "প্রদত্ত সেবা এবং আনুমানিক হার",
    missingFieldsAlert: "বক্তব্যে যা পাওয়া যায়নি, অনুগ্রহ করে পূরণ করুন:",
    approveBtn: "অনুমোদন করুন এবং সোভেরিন কার্ড তৈরি করুন",
    step4Title: "অভিনন্দন! আপনার সোভেরিন স্কিল কার্ড তৈরি হয়েছে",
    step4Subtitle: "আপনার ডিজিটাল পরিচয় এখন জাতীয় দক্ষতা রেজিস্ট্রির সাথে যুক্ত হয়েছে।",
    congratsMessage: "আপনার KAAMSCORE™ ট্রাস্ট সূচক সফলভাবে তৈরি করা হয়েছে।",
    viewLiveProfile: "লাইভ প্রোফাইল দেখুন",
    sampleTestimonies: [
      {
        title: "সুনীতা দেবী (তাঁতশিল্পী)",
        text: "নমস্কার, আমি সুনীতা দেবী। বারাণসীতে গত ১৮ বছর ধরে খাঁটি রেশম এবং সোনার জরির কাজ করে আসছি। জ্যাকার্ড তাঁত এবং প্রাকৃতিক রঙের কাজে আমি অভিজ্ঞ।",
      },
    ],
  },
  mr: {
    step1Title: "भाषा आणि नोंदणी पद्धत निवडा",
    step1Subtitle: "कामसेतू तुमची मातृभाषा समजते. आवाजाद्वारे किंवा लिहून आपली ओळख निर्माण करा.",
    selectLanguage: "आपली भाषा निवडा",
    chooseInputMode: "तुम्ही माहिती कशी देऊ इच्छिता?",
    voiceModeTitle: "आवाजाद्वारे नोंदणी (शिफारस केलेले)",
    voiceModeDesc: "माईक दाबून तुमच्या भाषेत कामाचे स्वरूप, अवजारे आणि अनुभवाबद्दल सांगा.",
    textModeTitle: "टाईप करून नोंदणी",
    textModeDesc: "माईक ऐवजी टाईप करून आपल्या कामाची माहिती नोंदवा.",
    continueBtn: "पुढे चला",
    step2Title: "आपले कौशल्य आणि अनुभवाबद्दल सांगा",
    step2Subtitle: "तुम्ही कोणते काम करता, कोणती अवजारे वापरता आणि किती वर्षांचा अनुभव आहे ते सांगा.",
    recordPrompt: "माईक दाबा आणि आपल्या कामाबद्दल मोकळेपणाने बोला",
    holdToSpeak: "रेकॉर्डिंग सुरू करा",
    recordingActive: "आम्ही ऐकत आहोत... आपल्या कामाची माहिती द्या",
    stopRecording: "रेकॉर्डिंग थांबवा",
    playSample: "नमुना माहिती भरा",
    reviewTranscript: "बोललेली माहिती (ट्रान्सक्रिप्ट)",
    liveTranscriptTitle: "लाईव्ह ट्रान्सक्रिप्ट",
    placeholderTranscript: "तुम्ही जे बोलाल ते येथे दिसेल...",
    analyzeBtn: "AI द्वारे कौशल्य विश्लेषण करा",
    step3Title: "AI कौशल्य विश्लेषण आणि पडताळणी",
    step3Subtitle: "AI ने तुमच्या माहितीचे विश्लेषण केले आहे. आपण कोणतीही माहिती बदलू शकता.",
    extractedTitle: "ओळखलेला व्यवसाय आणि अनुभव",
    editSkillsTitle: "प्रमाणित कौशल्ये आणि अवजारे",
    addSkillPlaceholder: "नवीन कौशल्य जोडा",
    addSkillBtn: "जोडा",
    servicesTitle: "उपलब्ध सेवा आणि अंदाजे दर",
    missingFieldsAlert: "खालील माहिती बोलण्यात आढळली नाही, कृपया नमूद करा:",
    approveBtn: "मंजूर करा आणि सॉवरेन कार्ड बनवा",
    step4Title: "अभिनंदन! तुमचे सॉवरेन स्किल कार्ड तयार झाले आहे",
    step4Subtitle: "तुमची डिजिटल ओळख राष्ट्रीय कौशल्य नोंदणीशी जोडली गेली आहे.",
    congratsMessage: "तुमचा KAAMSCORE™ निर्देशांक यशस्वीरित्या तयार झाला आहे.",
    viewLiveProfile: "लाईव्ह प्रोफाइल पहा",
    sampleTestimonies: [
      {
        title: "मोहम्मद रफिक (पुणे, वाहन तंत्रज्ञ)",
        text: "नमस्कार, मी मोहम्मद रफिक, पुणे भोसरी एमआयडीसी येथून. गेल्या १६ वर्षांपासून हेवी डिझेल इंजिन दुरुस्ती आणि व्यावसायिक वाहनांचे ईव्ही बॅटरी रूपांतरण करत आहे.",
      },
    ],
  },
  ta: {
    step1Title: "மொழி மற்றும் பதிவு முறையைத் தேர்ந்தெடுக்கவும்",
    step1Subtitle: "காம்சேது உங்கள் தாய்மொழியைப் புரிந்துகொள்கிறது. குரல் அல்லது எழுத்து மூலம் உங்கள் அடையாளத்தை உருவாக்குங்கள்.",
    selectLanguage: "உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்",
    chooseInputMode: "தகவலை எவ்வாறு வழங்க விரும்புகிறீர்கள்?",
    voiceModeTitle: "குரல் வழி பதிவு (பரிந்துரைக்கப்படுகிறது)",
    voiceModeDesc: "மைக் அழுத்தி உங்கள் தொழில், கருவிகள் மற்றும் அனுபவத்தைப் பற்றி பேசுங்கள்.",
    textModeTitle: "எழுத்து வழி பதிவு",
    textModeDesc: "தட்டச்சு செய்து உங்கள் அனுபவ விவரங்களை உள்ளிடவும்.",
    continueBtn: "தொடரவும்",
    step2Title: "உங்கள் தொழில் மற்றும் அனுபவத்தைப் பற்றி பேசுங்கள்",
    step2Subtitle: "நீங்கள் செய்யும் தொழில், பயன்படுத்தும் கருவிகள் மற்றும் அனுபவ ஆண்டுகளைக் குறிப்பிடவும்.",
    recordPrompt: "மைக்கை அழுத்தி உங்கள் தொழிலைப் பற்றி பேசுங்கள்",
    holdToSpeak: "பதிவு செய்யத் தொடங்கவும்",
    recordingActive: "கேட்டுக் கொண்டிருக்கிறோம்... பேசவும்",
    stopRecording: "பதிவை நிறுத்தவும்",
    playSample: "மாதிரி ஒலியைப் பார்க்கவும்",
    reviewTranscript: "பேசிய உரை (டிரான்ஸ்கிரிப்ட்)",
    liveTranscriptTitle: "நேரடி உரை",
    placeholderTranscript: "நீங்கள் பேசுவது இங்கே உடனடியாகத் தோன்றும்...",
    analyzeBtn: "AI மூலம் திறன்களைப் பகுப்பாய்வு செய்யவும்",
    step3Title: "AI திறன் பகுப்பாய்வு & சரிபார்ப்பு",
    step3Subtitle: "AI உங்கள் பேச்சிலிருந்து இந்த விவரங்களை எடுத்துள்ளது. எதையும் திருத்திக் கொள்ளலாம்.",
    extractedTitle: "கண்டறியப்பட்ட தொழில் & அனுபவம்",
    editSkillsTitle: "சரிபார்க்கப்பட்ட திறன்கள் & கருவிகள்",
    addSkillPlaceholder: "திறனைச் சேர்க்கவும்",
    addSkillBtn: "சேர்",
    servicesTitle: "வழங்கும் சேவைகள் & உத்தேச கட்டணம்",
    missingFieldsAlert: "பேச்சில் விடுபட்ட தகவல்களை கீழே பூர்த்தி செய்யவும்:",
    approveBtn: "அங்கீகரித்து சாவரின் அட்டை பெறுக",
    step4Title: "வாழ்த்துக்கள்! உங்கள் சாவரின் அட்டை வழங்கப்பட்டது",
    step4Subtitle: "உங்கள் தொழில் அடையாளம் தேசிய திறன் பதிவகத்துடன் இணைக்கப்பட்டுள்ளது.",
    congratsMessage: "உங்கள் KAAMSCORE™ நம்பகத்தன்மை குறியீடு வெற்றிகரமாக உருவாக்கப்பட்டுள்ளது.",
    viewLiveProfile: "நேரடி சுயவிவரத்தைக் காண்க",
    sampleTestimonies: [
      {
        title: "அனன்யா முருகன் (பெங்களூரு, விவசாயம்)",
        text: "வணக்கம், என் பெயர் அனன்யா முருகன். கடந்த 9 ஆண்டுகளாக நவீன ஹைட்ரோபோனிக்ஸ் அமைப்புகள், நீர் பாசன மேலாண்மை மற்றும் இயற்கை விவசாய ஆலோசனைகளை வழங்கி வருகிறேன்.",
      },
    ],
  },
  te: {
    step1Title: "భాష మరియు నమోదు విధానాన్ని ఎంచుకోండి",
    step1Subtitle: "కామ్‌సేతు మీ మాతృభాషను అర్థం చేసుకుంటుంది. వాయిస్ లేదా రాత ద్వారా మీ గుర్తింపును సృష్టించండి.",
    selectLanguage: "మీ భాషను ఎంచుకోండి",
    chooseInputMode: "మీరు వివరాలను ఎలా ఇవ్వాలనుకుంటున్నారు?",
    voiceModeTitle: "వాయిస్ ద్వారా నమోదు (సిఫార్సు చేయబడింది)",
    voiceModeDesc: "మైక్ నొక్కి మీ పని, సాధనాలు మరియు అనుభవం గురించి మాట్లాడండి.",
    textModeTitle: "టైపింగ్ ద్వారా నమోదు",
    textModeDesc: "మీ వివరాలను నేరుగా టైప్ చేసి నమోదు చేయండి.",
    continueBtn: "కొనసాగించండి",
    step2Title: "మీ పని మరియు అనుభవం గురించి చెప్పండి",
    step2Subtitle: "మీరు ఏ పని చేస్తారు, ఏ పరికరాలు వాడతారు మరియు ఎన్ని సంవత్సరాల అనుభవం ఉందో చెప్పండి.",
    recordPrompt: "మైక్ నొక్కి మీ పని గురించి వివరంగా మాట్లాడండి",
    holdToSpeak: "రికార్డింగ్ ప్రారంభించండి",
    recordingActive: "వింటున్నాము... మాట్లాడండి",
    stopRecording: "రికార్డింగ్ ఆపండి",
    playSample: "నమూనా పరిశీలించండి",
    reviewTranscript: "రికార్డ్ అయిన మాటలు",
    liveTranscriptTitle: "లైవ్ ట్రాన్స్ క్రిప్ట్",
    placeholderTranscript: "మీరు మాట్లాడే మాటలు ఇక్కడ కనిపిస్తాయి...",
    analyzeBtn: "AI ద్వారా నైపుణ్యాలను విశ్లేషించండి",
    step3Title: "AI నైపుణ్య విశ్లేషణ & ధృవీకరణ",
    step3Subtitle: "మీ మాటల నుండి AI ఈ వివరాలను సంగ్రహించింది. మీరు వీటిని సరిచేసుకోవచ్చు.",
    extractedTitle: "గుర్తించిన వృత్తి & అనుభవం",
    editSkillsTitle: "ధృవీకరించబడిన నైపుణ్యాలు & పనిముట్లు",
    addSkillPlaceholder: "నైపుణ్యం జోడించండి",
    addSkillBtn: "జోడించు",
    servicesTitle: "అందించే సేవలు & ధరల వివరాలు",
    missingFieldsAlert: "మాటల్లో రాని వివరాలను కింద పూరించండి:",
    approveBtn: "ధృవీకరించి సావరిన్ కార్డ్ పొందండి",
    step4Title: "అభినందనలు! మీ సావరిన్ స్కిల్ కార్డ్ జారీ చేయబడింది",
    step4Subtitle: "మీ డిజిటల్ గుర్తింపు జాతీయ నైపుణ్య రిజిస్ట్రీతో అనుసంధానించబడింది.",
    congratsMessage: "మీ KAAMSCORE™ సూచిక విజయవంతంగా లెక్కించబడింది.",
    viewLiveProfile: "లైవ్ ప్రొఫైల్ చూడండి",
    sampleTestimonies: [
      {
        title: "లక్ష్మీ నారాయణ్ (చెన్నై/తిరుపతి, వడ్రంగి)",
        text: "నమస్కారం, నా పేరు లక్ష్మీ నారాయణ్. గత 17 సంవత్సరాలుగా టేకు చెక్క ఫర్నిచర్, చేతితో చెక్కే నగిషీ పనులు మరియు ఆధునిక మాడ్యులర్ కిచెన్ పనులు చేస్తున్నాను.",
      },
    ],
  },
  as: {
    step1Title: "ভাষা আৰু পঞ্জীয়ন মাধ্যম বাছক",
    step1Subtitle: "কামসেতুৱে আপোনাৰ মাতৃভাষা বুজি পায়। মাত মাতি বা লিখি আপোনাৰ পৰিচয় গঢ়ক।",
    selectLanguage: "আপোনাৰ ভাষা বাছনি কৰক",
    chooseInputMode: "আপুনি কেনেকৈ তথ্য দিব বিচাৰে?",
    voiceModeTitle: "মাতৰ মাধ্যমেৰে পঞ্জীয়ন (প্ৰস্তাবিত)",
    voiceModeDesc: "মাইক টিপি আপোনাৰ কাম, সঁজুলি আৰু অভিজ্ঞতাৰ কথা কওক।",
    textModeTitle: "লিখি পঞ্জীয়ন",
    textModeDesc: "টাইপ কৰি আপোনাৰ কামৰ সবিশেষ দাখিল কৰক।",
    continueBtn: "আগবাঢ়ক",
    step2Title: "আপোনাৰ দক্ষতা আৰু অভিজ্ঞতাৰ কথা কওক",
    step2Subtitle: "আপুনি কি কাম কৰে, কি সঁজুলি ব্যৱহাৰ কৰে আৰু কিমান বছৰৰ অভিজ্ঞতা আছে জনাওক।",
    recordPrompt: "মাইক টিপক আৰু মুক্তভাৱে কওক",
    holdToSpeak: "ৰেকৰ্ডিং আৰম্ভ কৰক",
    recordingActive: "আমি শুনি আছো... কওক",
    stopRecording: "ৰেকৰ্ডিং বন্ধ কৰক",
    playSample: "নমুনা শুনক",
    reviewTranscript: "কথিত ট্ৰান্সক্ৰিপ্ট",
    liveTranscriptTitle: "লাইভ ট্ৰান্সক্ৰিপ্ট",
    placeholderTranscript: "আপুনি কোৱা কথা ইয়াত দেখা যাব...",
    analyzeBtn: "AI ৰে দক্ষতা বিশ্লেষণ কৰক",
    step3Title: "AI দক্ষতা বিশ্লেষণ আৰু সত্যাপন",
    step3Subtitle: "AI য়ে আপোনাৰ কথাৰ পৰা এই তথ্য উলিয়াইছে। আপুনি সলনি কৰিব পাৰে।",
    extractedTitle: "চিহ্নিত বৃত্তি আৰু অভিজ্ঞতা",
    editSkillsTitle: "সত্যায়িত দক্ষতা আৰু সঁজুলি",
    addSkillPlaceholder: "দক্ষতা যোগ কৰক",
    addSkillBtn: "যোগ কৰক",
    servicesTitle: "সেৱা আৰু আনুমানিক মূল্য",
    missingFieldsAlert: "বাক্যত নথকা তথ্যসমূহ তলত পূৰণ কৰক:",
    approveBtn: "অনুমোদন কৰক আৰু কাৰ্ড লাভ কৰক",
    step4Title: "অভিনন্দন! আপোনাৰ ছোভাৰেইন স্কিল কাৰ্ড প্ৰস্তুত হৈছে",
    step4Subtitle: "আপোনাৰ ডিজিটেল পৰিচয় ৰাষ্ট্ৰীয় দক্ষতা পঞ্জীয়নৰ সৈতে যুক্ত হ'ল।",
    congratsMessage: "আপোনাৰ KAAMSCORE™ সূচক সফলতাৰে গণনা কৰা হৈছে।",
    viewLiveProfile: "প্ৰফাইল চাওক",
    sampleTestimonies: [
      {
        title: "দীপক কলিতা (ইলেকট্ৰিচিয়ান, গুৱাহাটী)",
        text: "নমস্কাৰ, মোৰ নাম দীপক কলিতা। মই গুৱাহাটীৰ বেলতলা আৰু উলুবাৰীত যোৱা ১১ বছৰ ধৰি ঘৰুৱা আৰু বাণিজ্যিক ৱায়াৰিং, ইনভাৰ্টাৰ আৰু আৰ্থিঙৰ কাম কৰি আছো। বচ আৰু মেগাৰ সঁজুলিৰে কাম কৰো।",
      },
      {
        title: "বিপুল দাস (বাঁহ-বেত আৰু কাষ্ঠশিল্পী, দিছপুৰ)",
        text: "নমস্কাৰ, মই বিপুল দাস। দিছপুৰ আৰু গুৱাহাটীত ১২ বছৰ ধৰি অসমৰ বাঁহ-বেতৰ আধুনিক আচবাব, মডুলাৰ পাকঘৰ আৰু চেগুন কাঠৰ কাম কৰি আছো।",
      },
    ],
  },
};

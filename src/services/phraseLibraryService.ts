import { ISLSignReference, PhraseCategory } from '../types';

export const INITIAL_PHRASE_LIBRARY: ISLSignReference[] = [
  // ==========================================
  // 1. GREETINGS CATEGORY
  // ==========================================
  {
    id: 'greet-hello',
    phrase: 'Hello / Namaste',
    aliases: ['hello', 'namaste', 'hi', 'greetings', 'namaskar', 'pranam'],
    hindiGloss: 'नमस्ते / प्रणाम (Hello / Namaste)',
    category: 'Greetings',
    urgencyLevel: 'routine',
    handshapeDescription: 'Open flat 5-finger spread palms brought together at chest level (Namaste) or single open palm waving gently outward.',
    movementDescription: 'Bring palms together with slight respectful forward bow, or wave open palm forward.',
    nonManualFeatures: 'Warm friendly smile, respectful direct eye contact, slight head nod.',
    videoUrl: 'https://www.youtube-nocookie.com/embed/scxLw_JzUYM',
    isVerified: true,
    verificationStatus: 'verified',
    verifiedBy: 'ISH Shiksha Indian Sign Language Series',
    sourceNote: 'Universal Indian Sign Language greeting gesture (Hello & Bye)',
    tags: ['greeting', 'hello', 'namaste', 'welcome', 'hi'],
    sequentialSigns: [
      {
        stepIndex: 1,
        signGloss: 'HELLO / NAMASTE',
        englishTerm: 'Hello / Greetings',
        durationMs: 1200,
        description: 'Open flat palms joined together in front of the chest in respectful Namaste posture.',
        handshape: 'Flat open palms pressed together',
        movement: 'Gentle inward clasp at sternum with polite nod',
        bodyAnchor: 'chest'
      }
    ]
  },
  {
    id: 'greet-thank-you',
    phrase: 'Thank you',
    aliases: ['thank you', 'thanks', 'thank you very much', 'shukriya', 'dhanyavaad'],
    hindiGloss: 'धन्यवाद / शुक्रिया (Thank You)',
    category: 'Greetings',
    urgencyLevel: 'routine',
    handshapeDescription: 'Dominant flat open palm, relaxed extended fingers touching chin.',
    movementDescription: 'Fingertips gently touch lower chin/lip and extend outward and slightly downward toward the listener.',
    nonManualFeatures: 'Warm appreciative smile, pleasant eye contact, slight affirmative nod.',
    videoUrl: 'https://www.youtube-nocookie.com/embed/W_qFjH-GKzA',
    isVerified: true,
    verificationStatus: 'verified',
    verifiedBy: 'Indian Sign Language RKMVU-CBE (indiansignlanguage.org)',
    sourceNote: 'RKMVU FDMSE Coimbatore verified ISL demonstration: Thank You',
    tags: ['greeting', 'courtesy', 'thank you', 'gratitude', 'thanks'],
    sequentialSigns: [
      {
        stepIndex: 1,
        signGloss: 'THANK YOU',
        englishTerm: 'Thank You',
        durationMs: 1100,
        description: 'Touch chin with flat palm fingertips and move smoothly forward toward conversational partner.',
        handshape: 'Flat open palm facing chest',
        movement: 'Outward forward stroke extending from chin toward viewer',
        bodyAnchor: 'chin'
      }
    ]
  },
  {
    id: 'greet-name',
    phrase: 'What is your name?',
    aliases: ['name', 'your name', 'what is your name', 'aapka naam kya hai'],
    hindiGloss: 'आपका नाम क्या है? (Name What)',
    category: 'Greetings',
    urgencyLevel: 'routine',
    handshapeDescription: 'Index and middle fingers of dominant hand tap against fingers of non-dominant hand (NAME), followed by questioning palms (WHAT).',
    movementDescription: 'Tap fingers twice at chest level, then turn palms upward with questioning brow.',
    nonManualFeatures: 'Furrowed brow, inquiring head tilt.',
    isVerified: false,
    verificationStatus: 'unverified_prototype_reference',
    sourceNote: 'Standard ISL interrogative gloss',
    tags: ['greeting', 'name', 'introduction', 'inquiry'],
    sequentialSigns: [
      {
        stepIndex: 1,
        signGloss: 'NAME',
        englishTerm: 'Name',
        durationMs: 1000,
        description: 'Tap H-handshape fingertips together twice at mid-chest level.',
        handshape: 'Index & middle fingers extended parallel',
        movement: 'Double tap at chest',
        bodyAnchor: 'chest'
      },
      {
        stepIndex: 2,
        signGloss: 'WHAT',
        englishTerm: 'What?',
        durationMs: 900,
        description: 'Extend both hands with palms upward moving slightly side to side.',
        handshape: 'Open flat palms upward',
        movement: 'Shrug with questioning face',
        bodyAnchor: 'neutral_space'
      }
    ]
  },

  // ==========================================
  // 2. MEDICAL NEEDS CATEGORY
  // ==========================================
  {
    id: 'health-02',
    phrase: 'Where is the doctor?',
    aliases: ['doctor', 'where is the doctor', 'where is doctor', 'i need a doctor', 'physician', 'hospital doctor'],
    hindiGloss: 'डॉक्टर कहाँ हैं? (Doctor Where)',
    category: 'Medical Needs',
    urgencyLevel: 'urgent',
    handshapeDescription: 'Dominant index and middle fingers tap inner pulse of non-dominant wrist (DOCTOR), followed by open palms inquiry (WHERE).',
    movementDescription: 'Tap radial pulse twice, then extend palms upward with inquiring expression.',
    nonManualFeatures: 'Questioning expression, head tilted, eyebrows raised.',
    videoUrl: 'https://www.youtube-nocookie.com/embed/HQbntn5ESK0',
    isVerified: true,
    verificationStatus: 'verified',
    verifiedBy: 'ISH Shiksha Indian Sign Language Series',
    sourceNote: 'ISH Shiksha verified ISL demonstration: Doctor',
    tags: ['medical', 'doctor', 'physician', 'hospital', 'clinic'],
    sequentialSigns: [
      {
        stepIndex: 1,
        signGloss: 'DOCTOR',
        englishTerm: 'Doctor (Pulse Check)',
        durationMs: 1000,
        description: 'Tap inner pulse point of non-dominant wrist with index and middle fingers.',
        handshape: 'Two extended fingers (index & middle)',
        movement: 'Double tap on inner wrist pulse',
        bodyAnchor: 'wrist'
      },
      {
        stepIndex: 2,
        signGloss: 'WHERE',
        englishTerm: 'Where?',
        durationMs: 1000,
        description: 'Open flat palms facing upward sweeping gently side to side.',
        handshape: 'Open palms facing up',
        movement: 'Inquiring sweeping motion with head tilt',
        bodyAnchor: 'neutral_space'
      }
    ]
  },
  {
    id: 'health-hospital-01',
    phrase: 'Where is the hospital?',
    aliases: ['hospital', 'where is the hospital', 'where is hospital', 'find hospital', 'nearest hospital', 'aspatal'],
    hindiGloss: 'अस्पताल कहाँ है? (Hospital Where)',
    category: 'Medical Needs',
    urgencyLevel: 'urgent',
    handshapeDescription: 'Dominant index and middle fingers trace a cross on the non-dominant upper arm (HOSPITAL), followed by open palms (WHERE).',
    movementDescription: 'Trace vertical then horizontal stroke on shoulder, followed by questioning palms.',
    nonManualFeatures: 'Raised eyebrows, questioning head tilt, inquiring gaze.',
    isVerified: false,
    verificationStatus: 'unverified_prototype_reference',
    sourceNote: 'Healthcare facility location inquiry in ISL (Video pending release in official archive)',
    tags: ['medical', 'hospital', 'emergency', 'aspatal', 'location'],
    sequentialSigns: [
      {
        stepIndex: 1,
        signGloss: 'HOSPITAL',
        englishTerm: 'Hospital (Red Cross)',
        durationMs: 1100,
        description: 'Trace emblem cross with index and middle fingers across non-dominant upper arm.',
        handshape: 'Two extended fingers',
        movement: 'Vertical stroke followed by horizontal cross stroke on shoulder',
        bodyAnchor: 'shoulder'
      },
      {
        stepIndex: 2,
        signGloss: 'WHERE',
        englishTerm: 'Where?',
        durationMs: 1000,
        description: 'Extend both hands with palms facing upward, move hands gently side-to-side.',
        handshape: 'Open flat palms upward',
        movement: 'Side-to-side sweeping motion with raised eyebrows',
        bodyAnchor: 'neutral_space'
      }
    ]
  },
  {
    id: 'health-01',
    phrase: 'I have severe pain',
    aliases: ['pain', 'severe pain', 'i have severe pain', 'stomach pain', 'chest pain', 'i have pain', 'it hurts', 'dard'],
    hindiGloss: 'मुझे बहुत दर्द है (Pain)',
    category: 'Medical Needs',
    urgencyLevel: 'urgent',
    handshapeDescription: 'Extended index fingers of both hands pointing toward each other, rotating back and forth near the pain site.',
    movementDescription: 'Repeated inward twisting gesture indicating sharp pulsating sensation.',
    nonManualFeatures: 'Pained facial expression, squinted eyes, furrowed brows.',
    isVerified: true,
    verificationStatus: 'verified',
    verifiedBy: 'ISLRTC Clinical Triage Standard',
    sourceNote: 'Clinical acute pain triage indicator (Video pending release in official archive)',
    tags: ['medical', 'pain', 'symptom', 'triage', 'hurt'],
    sequentialSigns: [
      {
        stepIndex: 1,
        signGloss: 'PAIN',
        englishTerm: 'Severe Pain',
        durationMs: 1200,
        description: 'Point both index fingers toward affected area and twist wrists with tension.',
        handshape: 'Extended index fingers pointing toward each other',
        movement: 'Alternating rotational twisting motion near chest',
        bodyAnchor: 'chest'
      }
    ]
  },
  {
    id: 'health-03',
    phrase: 'I need an ISL interpreter',
    aliases: ['interpreter', 'isl interpreter', 'sign language interpreter', 'i need an interpreter'],
    hindiGloss: 'मुझे साइन लैंग्वेज दुभाषिया चाहिए (Interpreter Need)',
    category: 'Medical Needs',
    urgencyLevel: 'urgent',
    handshapeDescription: 'Both F-handshapes alternately rotate in contact (INTERPRET), followed by pulling clawed hand downward (NEED).',
    movementDescription: 'Hands alternate rotating forward and backward, then downward pull toward chest.',
    nonManualFeatures: 'Direct eye contact, earnest expression.',
    isVerified: false,
    verificationStatus: 'unverified_prototype_reference',
    sourceNote: 'Patient accessibility rights request in healthcare',
    tags: ['medical', 'interpreter', 'access', 'rights'],
    sequentialSigns: [
      {
        stepIndex: 1,
        signGloss: 'INTERPRET',
        englishTerm: 'Sign Language Interpreter',
        durationMs: 900,
        description: 'Twist index and thumb circles alternately representing translation.',
        handshape: 'F-handshapes touching',
        movement: 'Alternating rotational twisting',
        bodyAnchor: 'chest'
      },
      {
        stepIndex: 2,
        signGloss: 'NEED',
        englishTerm: 'Need / Want',
        durationMs: 800,
        description: 'Bent index finger pulled downward firmly at chest level.',
        handshape: 'Bent index finger',
        movement: 'Firm downward stroke',
        bodyAnchor: 'chest'
      }
    ]
  },
  {
    id: 'health-04',
    phrase: 'Take this medicine after food',
    aliases: ['medicine', 'take medicine', 'pharmacy', 'prescription', 'take this medicine', 'dawai'],
    hindiGloss: 'खाना खाने के बाद यह दवाई लें (Medicine After Food)',
    category: 'Medical Needs',
    urgencyLevel: 'routine',
    handshapeDescription: 'Middle finger of dominant hand circles and taps non-dominant palm (MEDICINE), followed by mime eating and forward wave (AFTER FOOD).',
    movementDescription: 'Grind middle finger on palm, mime eating, gesture forward.',
    nonManualFeatures: 'Clear instructional nodding.',
    isVerified: false,
    verificationStatus: 'unverified_prototype_reference',
    sourceNote: 'Pharmacy prescription instruction in ISL',
    tags: ['medical', 'medicine', 'prescription', 'pharmacy'],
    sequentialSigns: [
      {
        stepIndex: 1,
        signGloss: 'MEDICINE',
        englishTerm: 'Medicine',
        durationMs: 900,
        description: 'Grind middle finger into open palm of opposite hand.',
        handshape: 'Bent middle finger touching flat palm',
        movement: 'Circular grinding motion on palm',
        bodyAnchor: 'wrist'
      },
      {
        stepIndex: 2,
        signGloss: 'AFTER FOOD',
        englishTerm: 'After Eating',
        durationMs: 1000,
        description: 'Bring tapered fingertips to mouth twice, then sweep hand forward.',
        handshape: 'Tapered fingers to mouth, then open palm forward',
        movement: 'Touch mouth twice then sweep forward',
        bodyAnchor: 'chin'
      }
    ]
  },
  {
    id: 'health-05',
    phrase: 'Are you feeling dizzy?',
    aliases: ['dizzy', 'dizziness', 'feeling dizzy', 'chakkar'],
    hindiGloss: 'क्या चक्कर आ रहा है? (Dizzy Question)',
    category: 'Medical Needs',
    urgencyLevel: 'urgent',
    handshapeDescription: 'Curved open hand circles around forehead with spiraling motion, followed by leaning slightly.',
    movementDescription: 'Spiral hand circular motion around head.',
    nonManualFeatures: 'Squinted eyes, furrowed brows, questioning head tilt.',
    isVerified: false,
    verificationStatus: 'unverified_prototype_reference',
    sourceNote: 'Clinical diagnostic symptom query',
    tags: ['medical', 'dizzy', 'symptom', 'neuro']
  },
  {
    id: 'health-06',
    phrase: 'I am allergic to penicillin',
    aliases: ['allergy', 'allergic', 'penicillin', 'i have allergy'],
    hindiGloss: 'मुझे पेनिसिलिन से एलर्जी है (Allergy Penicillin)',
    category: 'Medical Needs',
    urgencyLevel: 'urgent',
    handshapeDescription: 'Index finger touches tip of nose and recoils backward with aversion (ALLERGY).',
    movementDescription: 'Quick recoil away from nose followed by negative head shake.',
    nonManualFeatures: 'Averse facial expression, quick backward jerk.',
    isVerified: false,
    verificationStatus: 'unverified_prototype_reference',
    sourceNote: 'Patient allergy safeguard declaration',
    tags: ['medical', 'allergy', 'penicillin', 'drug']
  },
  {
    id: 'health-07',
    phrase: 'Please check my blood pressure',
    aliases: ['blood pressure', 'bp', 'check bp', 'check blood pressure'],
    hindiGloss: 'कृपया मेरा ब्लड प्रेशर चेक करें (Blood Pressure Check)',
    category: 'Medical Needs',
    urgencyLevel: 'routine',
    handshapeDescription: 'Wrap non-dominant bicep with dominant hand mime-pumping rubber bulb (BP CUFF).',
    movementDescription: 'Pumping squeeze motion on upper arm.',
    nonManualFeatures: 'Attentive posture, neutral expression.',
    isVerified: false,
    verificationStatus: 'unverified_prototype_reference',
    sourceNote: 'Standard diagnostic vitals check request',
    tags: ['medical', 'blood pressure', 'bp', 'vitals']
  },

  // ==========================================
  // 3. EMERGENCY CATEGORY
  // ==========================================
  {
    id: 'emerg-01',
    phrase: 'Please help me',
    aliases: ['help', 'help me', 'please help me', 'help me immediately', 'urgent help', 'madad'],
    hindiGloss: 'कृपया मेरी मदद करें (Help Me)',
    category: 'Emergency',
    urgencyLevel: 'emergency',
    handshapeDescription: 'Clenched dominant fist resting on or raised above non-dominant open flat palm, lifted upward toward chest.',
    movementDescription: 'Upward lifting support motion at chest level signifying rescue or support.',
    nonManualFeatures: 'Urgent pleading facial expression, wide eyes, earnest brow.',
    videoUrl: 'https://www.youtube-nocookie.com/embed/d9fEfBJmy0Y',
    isVerified: true,
    verificationStatus: 'verified',
    verifiedBy: 'Indian Sign Language RKMVU-CBE (indiansignlanguage.org)',
    sourceNote: 'RKMVU FDMSE Coimbatore verified ISL demonstration: Help in Indian Sign Language',
    tags: ['emergency', 'help', 'urgent', 'aid', 'sos', 'madad'],
    sequentialSigns: [
      {
        stepIndex: 1,
        signGloss: 'HELP',
        englishTerm: 'Help / Aid',
        durationMs: 1200,
        description: 'Place clenched fist atop open palm and lift both upward firmly.',
        handshape: 'Clenched fist on open flat palm',
        movement: 'Upward lifting support motion',
        bodyAnchor: 'chest'
      }
    ]
  },
  {
    id: 'emerg-02',
    phrase: 'Call an ambulance now',
    aliases: ['ambulance', 'call ambulance', 'call an ambulance', 'call 108', 'emergency vehicle'],
    hindiGloss: 'तुरंत एम्बुलेंस बुलाएं (Ambulance Call)',
    category: 'Emergency',
    urgencyLevel: 'emergency',
    handshapeDescription: 'Twisting flashing-light gesture above head level (AMBULANCE) followed by phone receiver to ear (CALL).',
    movementDescription: 'Rotate open curled hand above head like flashing beacon, then bring Y-handshape to ear.',
    nonManualFeatures: 'Urgent alarmed expression, focused gaze.',
    isVerified: true,
    verificationStatus: 'verified',
    verifiedBy: 'Emergency Accessibility Committee',
    sourceNote: 'First-responder emergency dispatch call in ISL (Video pending release in official archive)',
    tags: ['emergency', 'ambulance', 'hospital', 'dispatch', '108'],
    sequentialSigns: [
      {
        stepIndex: 1,
        signGloss: 'AMBULANCE',
        englishTerm: 'Ambulance Beacon',
        durationMs: 1000,
        description: 'Twist hand above head simulating emergency vehicle flashing beacon.',
        handshape: 'Curled open palm overhead',
        movement: 'Rotational flashing gesture overhead',
        bodyAnchor: 'forehead'
      },
      {
        stepIndex: 2,
        signGloss: 'CALL',
        englishTerm: 'Call / Phone',
        durationMs: 900,
        description: 'Y-handshape held to ear signifying telephone call.',
        handshape: 'Thumb & pinky extended (Y-hand)',
        movement: 'Hold to ear firmly',
        bodyAnchor: 'chin'
      }
    ]
  },
  {
    id: 'emerg-03',
    phrase: 'I cannot breathe',
    aliases: ['breathe', 'cannot breathe', 'i cannot breathe', 'shortness of breath', 'choking'],
    hindiGloss: 'मुझे सांस नहीं आ रही है (Breathe No)',
    category: 'Emergency',
    urgencyLevel: 'emergency',
    handshapeDescription: 'Both open flat hands placed over chest pressing and gasping (BREATHE), followed by vigorous head shake (NO).',
    movementDescription: 'Rapid rising and falling of hands on sternum followed by negation.',
    nonManualFeatures: 'Gasping open mouth, panicked wide eyes, distressed posture.',
    isVerified: false,
    verificationStatus: 'unverified_prototype_reference',
    sourceNote: 'Respiratory distress emergency indicator',
    tags: ['emergency', 'breathe', 'oxygen', 'choking', 'respiratory']
  },
  {
    id: 'emerg-04',
    phrase: 'Fire emergency, evacuate now',
    aliases: ['fire', 'fire emergency', 'evacuate', 'bhago', 'aag'],
    hindiGloss: 'आग लगी है, तुरंत बाहर निकलें (Fire Evacuate)',
    category: 'Emergency',
    urgencyLevel: 'emergency',
    handshapeDescription: 'Fluttering fingers moving upward alternately (FLAMES), followed by urgent wave toward exit (EVACUATE).',
    movementDescription: 'Fingers ripple upward like fire flames, then sweep toward door.',
    nonManualFeatures: 'Urgent commanding expression, wide eyes.',
    isVerified: false,
    verificationStatus: 'unverified_prototype_reference',
    sourceNote: 'Building evacuation safety protocol in ISL',
    tags: ['emergency', 'fire', 'evacuate', 'safety', 'danger']
  },

  // ==========================================
  // 4. TRAVEL CATEGORY
  // ==========================================
  {
    id: 'travel-01',
    phrase: 'Where is platform 3?',
    aliases: ['platform', 'platform 3', 'train platform', 'where is platform'],
    hindiGloss: 'प्लेटफॉर्म 3 कहाँ है? (Platform 3 Where)',
    category: 'Travel',
    urgencyLevel: 'routine',
    handshapeDescription: 'Index finger traces track lines on palm (PLATFORM), sign number 3 (W-hand), followed by palms up (WHERE).',
    movementDescription: 'Track trace, hold numeral 3, then open palms questioning.',
    nonManualFeatures: 'Inquiring expression, head tilt.',
    isVerified: false,
    verificationStatus: 'unverified_prototype_reference',
    sourceNote: 'Railway station navigational inquiry in ISL',
    tags: ['travel', 'train', 'railway', 'platform', 'station']
  },
  {
    id: 'travel-02',
    phrase: 'How much is the ticket?',
    aliases: ['ticket', 'how much is the ticket', 'ticket price', 'ticket cost', 'fare'],
    hindiGloss: 'टिकट कितने का है? (Ticket Price How-Much)',
    category: 'Travel',
    urgencyLevel: 'routine',
    handshapeDescription: 'Index and middle fingers punch imaginary ticket card (TICKET), followed by rubbing thumb and index tips together (MONEY / HOW MUCH).',
    movementDescription: 'Clip fingers on edge of palm, then rub fingertips together.',
    nonManualFeatures: 'Questioning expression with squinted eyes.',
    isVerified: false,
    verificationStatus: 'unverified_prototype_reference',
    sourceNote: 'Transit fare inquiry in ISL',
    tags: ['travel', 'ticket', 'fare', 'price', 'train', 'bus']
  },
  {
    id: 'travel-03',
    phrase: 'Is this seat available?',
    aliases: ['seat', 'is this seat available', 'can i sit here', 'seat free'],
    hindiGloss: 'क्या यह सीट खाली है? (Seat Free Question)',
    category: 'Travel',
    urgencyLevel: 'routine',
    handshapeDescription: 'Bent two fingers hooked over two fingers of opposite hand (CHAIR / SIT), followed by questioning palms.',
    movementDescription: 'Hook fingers together at waist, then gesture toward seat.',
    nonManualFeatures: 'Polite questioning look, gentle head nod.',
    isVerified: false,
    verificationStatus: 'unverified_prototype_reference',
    sourceNote: 'Public transit seat inquiry',
    tags: ['travel', 'seat', 'train', 'bus', 'public']
  },
  {
    id: 'travel-04',
    phrase: 'Where is the exit?',
    aliases: ['exit', 'where is the exit', 'way out', 'bahar'],
    hindiGloss: 'निकास कहाँ है? (Exit Where)',
    category: 'Travel',
    urgencyLevel: 'routine',
    handshapeDescription: 'Hand passes smoothly under arched non-dominant hand and points outward (EXIT), followed by questioning palms.',
    movementDescription: 'Pass through opening and point forward.',
    nonManualFeatures: 'Questioning raised brow.',
    isVerified: false,
    verificationStatus: 'unverified_prototype_reference',
    sourceNote: 'Navigational transit exit inquiry',
    tags: ['travel', 'exit', 'navigation', 'way out']
  },
  {
    id: 'travel-05',
    phrase: 'Where is the bus station?',
    aliases: ['bus', 'bus station', 'bus stand', 'where is the bus station'],
    hindiGloss: 'बस स्टैंड कहाँ है? (Bus Stand Where)',
    category: 'Travel',
    urgencyLevel: 'routine',
    handshapeDescription: 'Both fists hold imaginary steering wheel and steer (BUS), followed by pointing inquiring palms (WHERE).',
    movementDescription: 'Steering motion, then open palms inquiry.',
    nonManualFeatures: 'Questioning facial expression.',
    isVerified: false,
    verificationStatus: 'unverified_prototype_reference',
    sourceNote: 'Bus transit terminal navigational query',
    tags: ['travel', 'bus', 'station', 'transit']
  },

  // ==========================================
  // 5. FOOD CATEGORY
  // ==========================================
  {
    id: 'food-01',
    phrase: 'I need water',
    aliases: ['water', 'i need water', 'drink', 'thirsty', 'paani', 'jal'],
    hindiGloss: 'मुझे पानी चाहिए (Water Need)',
    category: 'Food',
    urgencyLevel: 'urgent',
    handshapeDescription: 'W-handshape (index, middle, ring extended upright) tapping side of chin/mouth twice, followed by downward pull (NEED).',
    movementDescription: 'Index finger of W-hand taps chin twice, followed by downward pull.',
    nonManualFeatures: 'Earnest thirsty expression, attentive gaze.',
    videoUrl: 'https://www.youtube-nocookie.com/embed/L05M2jG1HjA',
    isVerified: true,
    verificationStatus: 'verified',
    verifiedBy: 'ISH Shiksha Indian Sign Language Series',
    sourceNote: 'ISH Shiksha verified ISL demonstration: Water',
    tags: ['food', 'water', 'drink', 'thirst', 'paani', 'essential'],
    sequentialSigns: [
      {
        stepIndex: 1,
        signGloss: 'WATER',
        englishTerm: 'Water (W-Hand)',
        durationMs: 1000,
        description: 'Form W-handshape and tap index finger against side of chin twice.',
        handshape: 'W-handshape (3 fingers extended)',
        movement: 'Tapping on side of chin twice',
        bodyAnchor: 'chin'
      },
      {
        stepIndex: 2,
        signGloss: 'NEED',
        englishTerm: 'Need / Want',
        durationMs: 900,
        description: 'Bent index finger pulled firmly downward at chest level.',
        handshape: 'Bent index finger (claw hook)',
        movement: 'Firm downward stroke',
        bodyAnchor: 'chest'
      }
    ]
  },
  {
    id: 'food-02',
    phrase: 'I am hungry / I need food',
    aliases: ['food', 'hungry', 'i am hungry', 'i need food', 'khana', 'bhookh'],
    hindiGloss: 'मुझे खाना चाहिए / भूख लगी है (Food Hungry)',
    category: 'Food',
    urgencyLevel: 'routine',
    handshapeDescription: 'Tapered fingertips brought repeatedly to mouth (EAT / FOOD), followed by downward stroke on abdomen (HUNGRY).',
    movementDescription: 'Bring fingertips to lips twice, then stroke downward along torso.',
    nonManualFeatures: 'Expressive hungry look, gentle head nod.',
    isVerified: false,
    verificationStatus: 'unverified_prototype_reference',
    sourceNote: 'Essential nutrition request in ISL (Video pending release in official archive)',
    tags: ['food', 'hungry', 'eat', 'meal', 'khana'],
    sequentialSigns: [
      {
        stepIndex: 1,
        signGloss: 'FOOD',
        englishTerm: 'Food / Eating',
        durationMs: 1000,
        description: 'Bring tapered fingertips to lips twice representing eating food.',
        handshape: 'Tapered grouped fingertips',
        movement: 'Touch mouth twice',
        bodyAnchor: 'chin'
      }
    ]
  },
  {
    id: 'food-03',
    phrase: 'Where is the cafeteria?',
    aliases: ['cafeteria', 'canteen', 'restaurant', 'where is cafeteria', 'mess'],
    hindiGloss: 'कैंटीन कहाँ है? (Cafeteria Where)',
    category: 'Food',
    urgencyLevel: 'routine',
    handshapeDescription: 'Mime eating with hand, followed by open palm pointing room/area, then open palms (WHERE).',
    movementDescription: 'Touch mouth, outline room, then inquiring palms.',
    nonManualFeatures: 'Questioning expression.',
    isVerified: false,
    verificationStatus: 'unverified_prototype_reference',
    sourceNote: 'Dining area inquiry in public facilities',
    tags: ['food', 'cafeteria', 'canteen', 'dining', 'mess']
  },
  {
    id: 'food-04',
    phrase: 'Tea / Coffee',
    aliases: ['tea', 'coffee', 'chai', 'hot drink'],
    hindiGloss: 'चाय / कॉफ़ी (Tea / Coffee)',
    category: 'Food',
    urgencyLevel: 'routine',
    handshapeDescription: 'Dip imaginary tea bag with pinch fingers (TEA), or grind fists in circular motion (COFFEE).',
    movementDescription: 'Dipping motion into imaginary cup.',
    nonManualFeatures: 'Pleasant inviting expression.',
    isVerified: false,
    verificationStatus: 'unverified_prototype_reference',
    sourceNote: 'Standard beverage signs in ISL',
    tags: ['food', 'tea', 'coffee', 'chai', 'beverage']
  },

  // ==========================================
  // 6. DAILY CONVERSATION CATEGORY
  // ==========================================
  {
    id: 'daily-yes',
    phrase: 'Yes',
    aliases: ['yes', 'yeah', 'correct', 'agree', 'haan', 'thumbs up'],
    hindiGloss: 'हाँ (Yes)',
    category: 'Daily Conversation',
    urgencyLevel: 'routine',
    handshapeDescription: 'Dominant hand forms fist with thumb pointing upright (Thumbs Up), held firmly in front of chest.',
    movementDescription: 'Thumb held upright with affirmative nodding gesture.',
    nonManualFeatures: 'Nodding head affirmatively, warm approving smile.',
    isVerified: true,
    verificationStatus: 'verified',
    verifiedBy: 'ISL Conversational Panel',
    sourceNote: 'Standard affirmative token in ISL (Video pending release in official archive)',
    tags: ['conversation', 'yes', 'affirmation', 'agree', 'haan'],
    sequentialSigns: [
      {
        stepIndex: 1,
        signGloss: 'YES',
        englishTerm: 'Yes (Thumbs Up)',
        durationMs: 1000,
        description: 'Thumb pointing upward firmly with all four fingers curled into a fist.',
        handshape: 'Upright thumb with curled fist',
        movement: 'Held steady with gentle nod',
        bodyAnchor: 'chest'
      }
    ]
  },
  {
    id: 'daily-no',
    phrase: 'No',
    aliases: ['no', 'nope', 'disagree', 'nahin', 'pinch'],
    hindiGloss: 'नहीं (No)',
    category: 'Daily Conversation',
    urgencyLevel: 'routine',
    handshapeDescription: 'Thumb, index, and middle fingertips snap closed together in pinch formation.',
    movementDescription: 'Snap pinch fingers together sharply to signify negation.',
    nonManualFeatures: 'Head shake side to side, firm expression.',
    isVerified: true,
    verificationStatus: 'verified',
    verifiedBy: 'ISL Conversational Panel',
    sourceNote: 'Standard negative token in ISL (Video pending release in official archive)',
    tags: ['conversation', 'no', 'denial', 'disagree', 'nahin'],
    sequentialSigns: [
      {
        stepIndex: 1,
        signGloss: 'NO',
        englishTerm: 'No (Pinch Snap)',
        durationMs: 1000,
        description: 'Index and middle fingers snap together with thumb tip to signify negation.',
        handshape: 'Pinch snap fingers',
        movement: 'Sharp snap closed with negative head shake',
        bodyAnchor: 'neutral_space'
      }
    ]
  },
  {
    id: 'daily-please',
    phrase: 'Please',
    aliases: ['please', 'kripya'],
    hindiGloss: 'कृपया (Please)',
    category: 'Daily Conversation',
    urgencyLevel: 'routine',
    handshapeDescription: 'Flat open palm rubbed gently in circular motion over sternum/center of chest.',
    movementDescription: 'Circular rub over chest.',
    nonManualFeatures: 'Polite earnest expression, slight head bow.',
    isVerified: false,
    verificationStatus: 'unverified_prototype_reference',
    sourceNote: 'Courtesy and politeness marker in ISL',
    tags: ['conversation', 'please', 'courtesy', 'polite']
  },
  {
    id: 'daily-wait',
    phrase: 'Please wait',
    aliases: ['wait', 'please wait', 'hold on', 'ruko', 'ek minute'],
    hindiGloss: 'कृपया प्रतीक्षा करें / रुको (Wait)',
    category: 'Daily Conversation',
    urgencyLevel: 'routine',
    handshapeDescription: 'Open flat palm facing outward towards listener with fingers slightly spread (STOP/WAIT).',
    movementDescription: 'Hold palm steady facing listener at chest level.',
    nonManualFeatures: 'Calm attentive expression.',
    isVerified: false,
    verificationStatus: 'unverified_prototype_reference',
    sourceNote: 'Conversational pause indicator',
    tags: ['conversation', 'wait', 'pause', 'hold']
  },
  {
    id: 'daily-understand',
    phrase: 'I understand',
    aliases: ['understand', 'i understand', 'i understand this concept', 'samajh gaya'],
    hindiGloss: 'मैं समझ गया (Understand)',
    category: 'Daily Conversation',
    urgencyLevel: 'routine',
    handshapeDescription: 'Flick index finger upward near forehead like lightbulb snapping open (UNDERSTAND).',
    movementDescription: 'Flick index finger upward from fist near temple.',
    nonManualFeatures: 'Enlightened nodding, approving eye contact.',
    isVerified: false,
    verificationStatus: 'unverified_prototype_reference',
    sourceNote: 'Cognitive comprehension marker in ISL',
    tags: ['conversation', 'understand', 'comprehension', 'samajh']
  },
  {
    id: 'daily-repeat',
    phrase: 'Please repeat the question',
    aliases: ['repeat', 'please repeat', 'say again', 'phir se bolo'],
    hindiGloss: 'कृपया दोबारा बताएं (Repeat)',
    category: 'Daily Conversation',
    urgencyLevel: 'routine',
    handshapeDescription: 'Cupped dominant hand sweeps in backward arc landing into flat open palm (AGAIN / REPEAT).',
    movementDescription: 'Arcing hand movement landing on palm.',
    nonManualFeatures: 'Polite questioning look, head tilted.',
    isVerified: false,
    verificationStatus: 'unverified_prototype_reference',
    sourceNote: 'Clarification request in conversation',
    tags: ['conversation', 'repeat', 'clarification', 'again']
  }
];

export class PhraseLibraryService {
  private phrases: ISLSignReference[] = [...INITIAL_PHRASE_LIBRARY];

  constructor() {
    this.loadCustomVideos();
    this.loadCustomPhrases();
  }

  public getAllPhrases(): ISLSignReference[] {
    return [...this.phrases];
  }

  public getPhrasesByCategory(category: PhraseCategory | string): ISLSignReference[] {
    const target = category.toLowerCase().trim();
    return this.phrases.filter(p => p.category.toLowerCase().trim() === target);
  }

  public getPhraseById(id: string): ISLSignReference | undefined {
    return this.phrases.find(p => p.id === id);
  }

  public getCategories(): string[] {
    return [
      'Greetings',
      'Medical Needs',
      'Emergency',
      'Travel',
      'Food',
      'Daily Conversation'
    ];
  }

  public findPhrase(text: string): ISLSignReference | undefined {
    if (!text) return undefined;
    const clean = text.toLowerCase().trim();
    if (!clean) return undefined;

    const normalize = (str: string) => str.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
    const norm = normalize(clean);
    if (!norm) return undefined;

    // 1. Exact match on phrase
    let match = this.phrases.find(p => {
      const pClean = p.phrase.toLowerCase().trim();
      return pClean === clean || normalize(pClean) === norm;
    });
    if (match) return match;

    // 2. Exact match on aliases
    match = this.phrases.find(p => {
      if (!p.aliases || p.aliases.length === 0) return false;
      return p.aliases.some(a => {
        const aClean = a.toLowerCase().trim();
        return aClean === clean || normalize(aClean) === norm;
      });
    });
    if (match) return match;

    // 3. Exact match on tags
    match = this.phrases.find(p => {
      return p.tags.some(t => {
        const tClean = t.toLowerCase().trim();
        return tClean === clean || normalize(tClean) === norm;
      });
    });
    if (match) return match;

    // 4. Substring containment
    if (norm.length >= 3) {
      match = this.phrases.find(p => {
        const pNorm = normalize(p.phrase);
        if (pNorm.includes(norm)) return true;
        if (pNorm.length >= 4 && norm.split(' ').join(' ').includes(pNorm)) return true;
        return false;
      });
      if (match) return match;

      match = this.phrases.find(p => {
        if (!p.aliases) return false;
        return p.aliases.some(a => {
          const aNorm = normalize(a);
          if (aNorm.includes(norm)) return true;
          if (aNorm.length >= 4 && norm.split(' ').join(' ').includes(aNorm)) return true;
          return false;
        });
      });
      if (match) return match;
    }

    // 5. Significant token / keyword overlap
    const STOP_WORDS = new Set([
      'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'she', 'it', 'they', 
      'a', 'an', 'the', 'is', 'am', 'are', 'was', 'were', 'be', 'to', 'for', 
      'of', 'in', 'on', 'at', 'with', 'this', 'that', 'please', 'do', 'does', 'did', 'can', 'could'
    ]);
    const queryTokens = norm.split(' ').filter(w => w.length >= 3 && !STOP_WORDS.has(w));
    
    if (queryTokens.length > 0) {
      let bestMatch: ISLSignReference | undefined = undefined;
      let maxScore = 0;

      for (const p of this.phrases) {
        let score = 0;
        const phraseTokens = new Set(normalize(p.phrase).split(' '));
        const aliasTokens = new Set((p.aliases || []).flatMap(a => normalize(a).split(' ')));
        const tagSet = new Set(p.tags.map(t => normalize(t)));

        for (const qt of queryTokens) {
          if (phraseTokens.has(qt)) score += 3;
          if (aliasTokens.has(qt)) score += 3;
          if (tagSet.has(qt)) score += 2;
        }

        if (score > maxScore && score >= 2) {
          maxScore = score;
          bestMatch = p;
        }
      }

      if (bestMatch) return bestMatch;
    }

    return undefined;
  }

  // Get related verified suggestions for an unsupported query
  public getRelatedVerifiedPhrases(query: string, count = 4): ISLSignReference[] {
    const verified = this.phrases.filter(p => p.isVerified);
    if (!query) return verified.slice(0, count);

    const norm = query.toLowerCase().replace(/[^\w\s]/g, ' ').trim();
    const words = norm.split(' ').filter(w => w.length >= 3);

    // Score verified phrases
    const scored = verified.map(p => {
      let score = 0;
      const text = (p.phrase + ' ' + (p.aliases || []).join(' ') + ' ' + p.tags.join(' ')).toLowerCase();
      for (const w of words) {
        if (text.includes(w)) score += 2;
      }
      return { phrase: p, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, count).map(s => s.phrase);
  }

  // Custom Video Attachment Workflow
  public addCustomVideoUrl(phraseId: string, url: string): boolean {
    const item = this.phrases.find(p => p.id === phraseId);
    if (item) {
      item.videoUrl = url;
      item.isVerified = true;
      item.verificationStatus = 'verified';
      this.saveCustomVideos();
      return true;
    }
    return false;
  }

  private saveCustomVideos() {
    try {
      if (typeof localStorage !== 'undefined') {
        const videoMap: Record<string, string> = {};
        for (const p of this.phrases) {
          if (p.videoUrl) {
            videoMap[p.id] = p.videoUrl;
          }
        }
        localStorage.setItem('signbridge_custom_video_urls', JSON.stringify(videoMap));
      }
    } catch (e) {
      console.error('Failed to save custom video URLs', e);
    }
  }

  private loadCustomVideos() {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem('signbridge_custom_video_urls');
        if (raw) {
          const videoMap = JSON.parse(raw);
          for (const [id, url] of Object.entries(videoMap)) {
            const p = this.phrases.find(item => item.id === id);
            if (p && typeof url === 'string') {
              p.videoUrl = url;
              p.isVerified = true;
            }
          }
        }
      }
    } catch (e) {
      console.error('Failed to load custom video URLs', e);
    }
  }

  public addPhrase(phrase: Omit<ISLSignReference, 'id'>): ISLSignReference {
    const newPhrase: ISLSignReference = {
      ...phrase,
      id: `custom-${Date.now()}`
    };
    this.phrases.unshift(newPhrase);
    this.saveCustomPhrases();
    return newPhrase;
  }

  public updatePhraseVerification(id: string, isVerified: boolean, verifiedBy: string): boolean {
    const item = this.phrases.find(p => p.id === id);
    if (item) {
      item.isVerified = isVerified;
      item.verificationStatus = isVerified ? 'verified' : 'unverified_prototype_reference';
      item.verifiedBy = isVerified ? verifiedBy : undefined;
      item.verificationDate = isVerified ? new Date().toISOString() : undefined;
      this.saveCustomPhrases();
      return true;
    }
    return false;
  }

  private saveCustomPhrases() {
    try {
      if (typeof localStorage !== 'undefined') {
        const customOnly = this.phrases.filter(p => p.id.startsWith('custom-'));
        localStorage.setItem('signbridge_custom_phrases', JSON.stringify(customOnly));
      }
    } catch (e) {
      console.error('Failed to save phrases', e);
    }
  }

  private loadCustomPhrases() {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem('signbridge_custom_phrases');
        if (raw) {
          const custom = JSON.parse(raw);
          if (Array.isArray(custom)) {
            for (const item of custom) {
              if (!this.phrases.some(p => p.id === item.id)) {
                this.phrases.unshift(item);
              }
            }
          }
        }
      }
    } catch (e) {
      console.error('Failed to load custom phrases', e);
    }
  }
}

export const phraseService = new PhraseLibraryService();

import { VisualInstructionStage, SignLanguage } from '../../types';

export type SignType = 'static_posture' | 'dynamic_sequence';
export type BodyAnchor = 'chin' | 'chest' | 'wrist' | 'forehead' | 'mouth' | 'shoulder' | 'hand' | 'neutral_space';
export type TrainingStatus = 
  | 'heuristic_supported' 
  | 'template_supported' 
  | 'trained_model' 
  | 'needs_training_data';
export type VerificationStatus = 
  | 'verified_isl' 
  | 'heuristic_prototype' 
  | 'untrained_label';

export const ISL_15_CATEGORIES = [
  'Greetings and introductions',
  'Family and relationships',
  'Everyday conversation',
  'Questions and answers',
  'Numbers, dates, and time',
  'Food and drinks',
  'Home and daily activities',
  'Education and college',
  'Healthcare and emergencies',
  'Travel and transportation',
  'Work and occupations',
  'Feelings and emotions',
  'Places and directions',
  'Common requests and actions',
  'Accessibility and public services'
] as const;

export type ISL15Category = typeof ISL_15_CATEGORIES[number];
export type VocabularyBookCategory = ISL15Category | string;
export type CoreVocabularyCategory = ISL15Category | string;

export const CORE_VOCABULARY_CATEGORIES: readonly string[] = ISL_15_CATEGORIES;
export const VOCABULARY_BOOK_CATEGORIES: readonly string[] = ISL_15_CATEGORIES;

export interface SignVocabularyItem {
  id: string;
  name: string;
  gloss: string;
  meaning: string;
  category: VocabularyBookCategory | string;
  primaryCategory?: CoreVocabularyCategory;
  signLanguage: SignLanguage; // Default 'ISL'
  aslComparisonNote?: string;
  type: SignType;
  handshape: string;
  palmOrientation: string;
  movementDescription: string;
  twoHanded: boolean;
  bodyAnchor: BodyAnchor;
  trainingStatus: TrainingStatus;
  verificationStatus: VerificationStatus;
  description: string;
  tags: string[];
  isModelSupported: boolean; // TRUE for live camera model (11 verified)
  learningOnly: boolean; // TRUE for learning dictionary only
  modelType?: 'trained_centroid' | 'kinematic_sequence' | 'learning_dictionary';
  videoUrl?: string;
  imageUrl?: string;
  islrtcDictionaryUrl?: string;
  source?: string;
  sourceNote?: string;
  relatedSignIds?: string[];
  visualStages: VisualInstructionStage[];
}

export function getCoreCategory(item: SignVocabularyItem): string {
  if (item.category && (ISL_15_CATEGORIES as readonly string[]).includes(item.category)) {
    return item.category;
  }
  if (item.primaryCategory && (ISL_15_CATEGORIES as readonly string[]).includes(item.primaryCategory)) {
    return item.primaryCategory;
  }

  const cat = (item.category || '').toLowerCase();
  const tags = (item.tags || []).map(t => t.toLowerCase());
  const name = (item.name || '').toLowerCase();

  if (tags.some(t => ['deaf', 'isl', 'police', 'access', 'hearing'].includes(t)) || cat.includes('access')) {
    return 'Accessibility and public services';
  }
  if (tags.some(t => ['emergency', 'urgent', 'help', 'doctor', 'hospital', 'ambulance', 'pain', 'medicine'].includes(t))) {
    return 'Healthcare and emergencies';
  }
  if (tags.some(t => ['question', 'where', 'what', 'when', 'why', 'how'].includes(t))) {
    return 'Questions and answers';
  }
  if (tags.some(t => ['school', 'college', 'teacher', 'student', 'book', 'computer'].includes(t))) {
    return 'Education and college';
  }
  if (tags.some(t => ['food', 'water', 'tea', 'eat', 'drink'].includes(t))) {
    return 'Food and drinks';
  }
  if (tags.some(t => ['work', 'job', 'office', 'money', 'price', 'buy', 'pay'].includes(t))) {
    return 'Work and occupations';
  }
  if (tags.some(t => ['bus', 'train', 'travel', 'transport', 'metro'].includes(t))) {
    return 'Travel and transportation';
  }
  if (tags.some(t => ['number', 'time', 'clock', 'today', 'tomorrow'].includes(t))) {
    return 'Numbers, dates, and time';
  }
  if (tags.some(t => ['family', 'mother', 'father', 'brother', 'sister', 'friend', 'love'].includes(t))) {
    return 'Family and relationships';
  }
  if (tags.some(t => ['greeting', 'hello', 'namaste', 'thank you', 'please', 'sorry', 'welcome', 'morning'].includes(t))) {
    return 'Greetings and introductions';
  }
  if (tags.some(t => ['happy', 'sad', 'feeling', 'emotion'].includes(t))) {
    return 'Feelings and emotions';
  }
  if (tags.some(t => ['bathroom', 'direction', 'left', 'right', 'way', 'path'].includes(t))) {
    return 'Places and directions';
  }
  if (tags.some(t => ['stop', 'wait', 'play', 'weather', 'rain'].includes(t))) {
    return 'Common requests and actions';
  }
  if (tags.some(t => ['home', 'sleep', 'need', 'house'].includes(t))) {
    return 'Home and daily activities';
  }
  return 'Everyday conversation';
}

export const INITIAL_SIGN_VOCABULARY: SignVocabularyItem[] = [
  // =========================================================================
  // CATEGORY 1: Greetings, introductions and polite expressions
  // =========================================================================
  {
    id: 'sign-hello',
    name: 'Hello / Namaste',
    gloss: 'HELLO / NAMASTE',
    meaning: 'Respectful universal greeting used when meeting someone',
    category: 'Greetings and introductions',
    signLanguage: 'ISL',
    aslComparisonNote: 'In ASL, "Hello" is a salute wave from the temple. In ISL, Namaste joins open palms respectfully at chest level or waves open 5-palm outward.',
    type: 'static_posture',
    handshape: 'Open flat 5-finger spread palm',
    palmOrientation: 'Palm facing outward toward conversational partner',
    movementDescription: 'Static or gentle side-to-side greeting wave at chest/shoulder level',
    twoHanded: false,
    bodyAnchor: 'neutral_space',
    trainingStatus: 'template_supported',
    verificationStatus: 'verified_isl',
    description: 'Open palm facing camera with all 5 fingers extended upright and spread',
    tags: ['greeting', 'namaste', 'hello', 'welcome', 'hi'],
    isModelSupported: true,
    learningOnly: false,
    modelType: 'trained_centroid',
    videoUrl: 'https://www.youtube-nocookie.com/embed/scxLw_JzUYM',
    source: 'ISH Shiksha Indian Sign Language Educational Series',
    sourceNote: 'ISH Shiksha verified ISL demonstration: Hello & Bye Indian Sign Language',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Handshape & Palm Orientation',
        description: 'Open flat 5-finger spread palm facing directly forward toward conversational partner.',
        handshape: 'Open flat palm, all fingers extended',
        palmOrientation: 'Forward facing viewer',
        bodyAnchor: 'neutral_space'
      },
      {
        stageNumber: 2,
        stageName: 'Starting Position',
        description: 'Hold dominant hand at mid-chest or shoulder height with elbow comfortably relaxed.',
        bodyAnchor: 'chest',
        movementTrajectory: 'Stationary hold at shoulder height'
      },
      {
        stageNumber: 3,
        stageName: 'Movement Trajectory',
        description: 'Execute a gentle side-to-side oscillation (or bring both palms together for Namaste).',
        movementTrajectory: 'Lateral wave 2-3 inches back and forth',
        movementArrows: 'left-right oscillation'
      },
      {
        stageNumber: 4,
        stageName: 'Ending Hold & Expression',
        description: 'Hold steady with a warm, welcoming facial smile and direct respectful eye contact.',
        facialExpression: 'Warm welcoming smile',
        bodyAnchor: 'neutral_space'
      }
    ]
  },
  {
    id: 'sign-thank-you',
    name: 'Thank you',
    gloss: 'THANK YOU',
    meaning: 'Polite expression of gratitude and appreciation',
    category: 'Greetings and introductions',
    signLanguage: 'ISL',
    aslComparisonNote: 'In both ASL and ISL, fingertips touch the chin/lower lip and extend outward in a smooth grateful stroke toward the viewer.',
    type: 'dynamic_sequence',
    handshape: 'Flat open palm facing chest',
    palmOrientation: 'Fingertips facing toward lower chin / lip',
    movementDescription: 'Fingertips start touching chin and sweep forward-downward toward the viewer',
    twoHanded: false,
    bodyAnchor: 'chin',
    trainingStatus: 'heuristic_supported',
    verificationStatus: 'verified_isl',
    description: 'Fingertips touch lower chin and extend outward toward recipient with polite nod',
    tags: ['gratitude', 'thank you', 'thanks', 'polite', 'shukriya', 'dhanyavaad'],
    isModelSupported: true,
    learningOnly: false,
    modelType: 'kinematic_sequence',
    videoUrl: 'https://www.youtube-nocookie.com/embed/W_qFjH-GKzA',
    source: 'Indian Sign Language RKMVU-CBE (indiansignlanguage.org)',
    sourceNote: 'RKMVU FDMSE Coimbatore verified ISL demonstration: Thank You in Indian Sign Language',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Handshape & Touch Anchor',
        description: 'Flat open palm with fingers loosely aligned, fingertips touching center of chin or lower lip.',
        handshape: 'Flat open palm',
        bodyAnchor: 'chin'
      },
      {
        stageNumber: 2,
        stageName: 'Starting Anchor',
        description: 'Rest fingertips gently against the lower chin, elbow held close to chest.',
        bodyAnchor: 'chin'
      },
      {
        stageNumber: 3,
        stageName: 'Outward Movement Stroke',
        description: 'Extend hand outward and slightly downward toward recipient in a smooth arc.',
        movementTrajectory: 'Forward outward stroke (~20cm)',
        movementArrows: 'forward-downward diagonal'
      },
      {
        stageNumber: 4,
        stageName: 'Ending Position & Polite Nod',
        description: 'Hand opens palm up or outward at chest level with an appreciative nod and smile.',
        facialExpression: 'Polite appreciative nod with warm smile',
        bodyAnchor: 'neutral_space'
      }
    ]
  },
  {
    id: 'sign-please',
    name: 'Please',
    gloss: 'PLEASE',
    meaning: 'Polite courtesy request sign',
    category: 'Greetings and introductions',
    signLanguage: 'ISL',
    aslComparisonNote: 'In ASL, flat palm circles over the chest. In ISL, open flat palms are rubbed gently together or flat palm rubs center of sternum.',
    type: 'static_posture',
    handshape: 'Flat palm resting on chest or palms rubbing together',
    palmOrientation: 'Palm facing chest sternum',
    movementDescription: 'Rub circular motion over the chest clockwise',
    twoHanded: false,
    bodyAnchor: 'chest',
    trainingStatus: 'needs_training_data',
    verificationStatus: 'verified_isl',
    description: 'Flat open palm rubs gently in circular clockwise motion against chest',
    tags: ['polite', 'please', 'kripya', 'request', 'courtesy'],
    isModelSupported: false,
    learningOnly: true,
    modelType: 'learning_dictionary',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Handshape Configuration',
        description: 'Open flat hand with thumb slightly abducted.',
        handshape: 'Open flat palm',
        bodyAnchor: 'chest'
      },
      {
        stageNumber: 2,
        stageName: 'Starting Anchor on Sternum',
        description: 'Place palm flat against center of sternum.',
        bodyAnchor: 'chest'
      },
      {
        stageNumber: 3,
        stageName: 'Circular Motion',
        description: 'Rub in a slow circular clockwise stroke twice.',
        movementTrajectory: 'Clockwise circular rub',
        movementArrows: 'circular clockwise'
      },
      {
        stageNumber: 4,
        stageName: 'Ending Polite Hold',
        description: 'Pause hand gently on heart with courteous expression.',
        facialExpression: 'Polite receptive expression'
      }
    ]
  },
  {
    id: 'sign-sorry',
    name: 'Sorry',
    gloss: 'SORRY',
    meaning: 'Apology and regret sign',
    category: 'Greetings and introductions',
    signLanguage: 'ISL',
    aslComparisonNote: 'In ASL, "A" fist circles over the chest. In ISL, a closed fist rubs over heart or ear is touched respectfully.',
    type: 'static_posture',
    handshape: 'Closed fist (A-handshape)',
    palmOrientation: 'Knuckles facing outward, palm side against chest',
    movementDescription: 'Fist rubs in circular motion over heart / sternum',
    twoHanded: false,
    bodyAnchor: 'chest',
    trainingStatus: 'needs_training_data',
    verificationStatus: 'verified_isl',
    description: 'Closed fist rubs circular motion over center of chest with apologetic expression',
    tags: ['sorry', 'apology', 'maaf', 'regret', 'polite'],
    isModelSupported: false,
    learningOnly: true,
    modelType: 'learning_dictionary',
    videoUrl: 'https://www.youtube-nocookie.com/embed/vxcJmJmTb9I',
    source: 'ISH Shiksha Indian Sign Language Educational Series',
    sourceNote: 'ISH Shiksha verified ISL demonstration: Sorry in Indian Sign Language',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Handshape: A-Fist',
        description: 'Form a closed fist with thumb resting alongside index finger.',
        handshape: 'Closed fist',
        bodyAnchor: 'chest'
      },
      {
        stageNumber: 2,
        stageName: 'Starting Chest Placement',
        description: 'Place knuckle base flat against left upper chest / sternum.',
        bodyAnchor: 'chest'
      },
      {
        stageNumber: 3,
        stageName: 'Circular Apology Stroke',
        description: 'Rub fist in small circular motions against chest.',
        movementTrajectory: 'Circular rubbing stroke',
        movementArrows: 'circular'
      },
      {
        stageNumber: 4,
        stageName: 'Apologetic Expression',
        description: 'Maintain slight downward head tilt and remorseful facial expression.',
        facialExpression: 'Apologetic head tilt with furrowed brow'
      }
    ]
  },
  {
    id: 'sign-welcome',
    name: 'Welcome / Nice to meet you',
    gloss: 'WELCOME',
    meaning: 'Cordial welcome gesture for guests or new acquaintances',
    category: 'Greetings and introductions',
    signLanguage: 'ISL',
    aslComparisonNote: 'In ASL, open hand sweeps from waist toward body. In ISL, both open palms sweep inward toward chest invitingly.',
    type: 'dynamic_sequence',
    handshape: 'Both open hands, palms angled slightly upward',
    palmOrientation: 'Palms facing inward and upward',
    movementDescription: 'Both hands sweep from outward space inward toward chest in an inviting motion',
    twoHanded: true,
    bodyAnchor: 'neutral_space',
    trainingStatus: 'needs_training_data',
    verificationStatus: 'verified_isl',
    description: 'Both palms open swept gently inward toward torso inviting guest warmly',
    tags: ['welcome', 'swagat', 'hospitality', 'meet', 'greeting'],
    isModelSupported: false,
    learningOnly: true,
    modelType: 'learning_dictionary',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Open Hands Posture',
        description: 'Both hands extended open with fingers together, palms tilted upward.',
        handshape: 'Open flat palms',
        bodyAnchor: 'neutral_space'
      },
      {
        stageNumber: 2,
        stageName: 'Starting Forward Reach',
        description: 'Extend both hands slightly outward in front of hips.',
        movementTrajectory: 'Outward reach'
      },
      {
        stageNumber: 3,
        stageName: 'Inward Welcoming Arc',
        description: 'Sweep hands smoothly inward toward your torso in a welcoming gesture.',
        movementTrajectory: 'Inward sweeping curve',
        movementArrows: 'inward toward chest'
      },
      {
        stageNumber: 4,
        stageName: 'Welcoming Hold',
        description: 'Bring hands near waist level with bright smile and friendly nod.',
        facialExpression: 'Bright hospitable smile'
      }
    ]
  },
  {
    id: 'sign-good-morning',
    name: 'Good Morning',
    gloss: 'GOOD MORNING',
    meaning: 'Polite morning greeting',
    category: 'Greetings and introductions',
    signLanguage: 'ISL',
    aslComparisonNote: 'In ASL, compound of GOOD (chin to hand) + MORNING (sun rising under arm). In ISL, thumbs up/good followed by sunrise motion over horizon.',
    type: 'dynamic_sequence',
    handshape: 'Thumbs up (GOOD) followed by rising open palm (MORNING)',
    palmOrientation: 'Upward orientation',
    movementDescription: 'Show good gesture then raise dominant hand upward simulating sunrise',
    twoHanded: true,
    bodyAnchor: 'neutral_space',
    trainingStatus: 'needs_training_data',
    verificationStatus: 'verified_isl',
    description: 'Compound sign: Affirmative good gesture followed by rising sun trajectory',
    tags: ['good morning', 'morning', 'greeting', 'shubh prabhat'],
    isModelSupported: false,
    learningOnly: true,
    modelType: 'learning_dictionary',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Stage 1: Good Sign',
        description: 'Show affirmative thumbs up or flat chin release.',
        handshape: 'Thumbs up',
        bodyAnchor: 'chest'
      },
      {
        stageNumber: 2,
        stageName: 'Stage 2: Horizon Line',
        description: 'Non-dominant arm held horizontal across chest to form horizon.',
        bodyAnchor: 'chest'
      },
      {
        stageNumber: 3,
        stageName: 'Stage 3: Sunrise Ascend',
        description: 'Dominant open hand rises from behind horizontal arm simulating rising sun.',
        movementTrajectory: 'Upward rising trajectory',
        movementArrows: 'upward'
      },
      {
        stageNumber: 4,
        stageName: 'Stage 4: Morning Glow Smile',
        description: 'Hold hand elevated with bright eyes and cheerful morning smile.',
        facialExpression: 'Bright refreshed smile'
      }
    ]
  },

  // =========================================================================
  // CATEGORY 2: Family, relationships and people
  // =========================================================================
  {
    id: 'sign-ily',
    name: 'I Love You',
    gloss: 'I LOVE YOU',
    meaning: 'Affectionate expression combining I, L, and Y fingers',
    category: 'Family and relationships',
    signLanguage: 'ISL',
    aslComparisonNote: 'The ILY sign (Thumb, Index, Pinky extended) is globally recognized in both ASL and ISL youth culture.',
    type: 'static_posture',
    handshape: 'Thumb, index, and little finger extended; middle & ring curled',
    palmOrientation: 'Palm facing forward toward viewer',
    movementDescription: 'Held steady with gentle outward extension toward loved one',
    twoHanded: false,
    bodyAnchor: 'neutral_space',
    trainingStatus: 'trained_model',
    verificationStatus: 'verified_isl',
    description: 'Thumb, index finger, and pinky extended with palm facing front',
    tags: ['love', 'family', 'affection', 'ily', 'relationship'],
    isModelSupported: true,
    learningOnly: false,
    modelType: 'trained_centroid',
    source: 'ISLRTC Syllabus Standard',
    sourceNote: 'Official ISLRTC Dictionary Standard (Video footage pending publication in public ISLRTC archive)',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Finger Configuration',
        description: 'Extend thumb sideways, index finger upright, and pinky finger upright. Fold middle and ring fingers flat into palm.',
        handshape: 'Thumb, index, pinky extended',
        bodyAnchor: 'neutral_space'
      },
      {
        stageNumber: 2,
        stageName: 'Forward Facing Alignment',
        description: 'Rotate wrist so palm faces directly forward toward viewer at chest/shoulder level.',
        bodyAnchor: 'chest'
      },
      {
        stageNumber: 3,
        stageName: 'Gentle Outward Extension',
        description: 'Pulse the hand forward slightly (1-2 inches) toward recipient.',
        movementTrajectory: 'Gentle forward pulse'
      },
      {
        stageNumber: 4,
        stageName: 'Warm Affectionate Expression',
        description: 'Maintain warm, tender eye contact and smile.',
        facialExpression: 'Warm affectionate smile'
      }
    ]
  },
  {
    id: 'sign-mother',
    name: 'Mother',
    gloss: 'MOTHER',
    meaning: 'Sign for mother or maternal figure',
    category: 'Family and relationships',
    signLanguage: 'ISL',
    aslComparisonNote: 'In ASL, 5-hand thumb taps chin twice. In ISL, open 5-hand taps chin or cheek (feminine location anchor), or index strokes chin/nose stud position.',
    type: 'static_posture',
    handshape: 'Open 5-hand or index finger',
    palmOrientation: 'Palm facing side, thumb/fingertip touching chin or nose/cheek',
    movementDescription: 'Tap twice against the lower chin or cheek area',
    twoHanded: false,
    bodyAnchor: 'chin',
    trainingStatus: 'needs_training_data',
    verificationStatus: 'verified_isl',
    description: 'Open hand thumb taps chin twice, signifying maternal female identity',
    tags: ['family', 'mother', 'mom', 'maa', 'mata'],
    isModelSupported: false,
    learningOnly: true,
    modelType: 'learning_dictionary',
    videoUrl: 'https://www.youtube-nocookie.com/embed/d2wZuQsM1_w',
    source: 'ISH Shiksha Indian Sign Language Educational Series',
    sourceNote: 'ISH Shiksha verified ISL demonstration: Family members in Indian Sign Language',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Handshape: Open 5 Hand',
        description: 'Spread all fingers comfortably, thumb tip ready to contact.',
        handshape: 'Open 5 hand',
        bodyAnchor: 'chin'
      },
      {
        stageNumber: 2,
        stageName: 'Touch Chin Anchor',
        description: 'Place tip of thumb against center or side of chin.',
        bodyAnchor: 'chin'
      },
      {
        stageNumber: 3,
        stageName: 'Double Tap',
        description: 'Tap thumb tip gently against chin twice.',
        movementTrajectory: 'Double tap at chin',
        movementArrows: 'tap-tap'
      },
      {
        stageNumber: 4,
        stageName: 'Affectionate Hold',
        description: 'Hold with affectionate, warm expression.',
        facialExpression: 'Affectionate warm smile'
      }
    ]
  },
  {
    id: 'sign-father',
    name: 'Father',
    gloss: 'FATHER',
    meaning: 'Sign for father or paternal figure',
    category: 'Family and relationships',
    signLanguage: 'ISL',
    aslComparisonNote: 'In ASL, 5-hand thumb taps forehead twice. In ISL, thumb touches forehead or simulates mustache twist (traditional ISL cultural male marker).',
    type: 'static_posture',
    handshape: 'Open 5-hand or thumb-index mustache twist',
    palmOrientation: 'Palm facing side or outward at forehead/upper lip',
    movementDescription: 'Thumb touches forehead twice or index/thumb twists along upper lip',
    twoHanded: false,
    bodyAnchor: 'forehead',
    trainingStatus: 'needs_training_data',
    verificationStatus: 'verified_isl',
    description: 'Thumb taps forehead or twists mustache, representing paternal identity',
    tags: ['family', 'father', 'dad', 'papa', 'pitaji'],
    isModelSupported: false,
    learningOnly: true,
    modelType: 'learning_dictionary',
    videoUrl: 'https://www.youtube-nocookie.com/embed/d2wZuQsM1_w',
    source: 'ISH Shiksha Indian Sign Language Educational Series',
    sourceNote: 'ISH Shiksha verified ISL demonstration: Family members in Indian Sign Language',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Handshape: 5-Hand / Mustache Grip',
        description: 'Extend fingers open with thumb out, or pinch index and thumb.',
        handshape: 'Open hand / pinch',
        bodyAnchor: 'forehead'
      },
      {
        stageNumber: 2,
        stageName: 'Forehead / Lip Placement',
        description: 'Place thumb tip on forehead (or twist index across upper lip).',
        bodyAnchor: 'forehead'
      },
      {
        stageNumber: 3,
        stageName: 'Double Tap / Twist',
        description: 'Tap twice against forehead cleanly.',
        movementTrajectory: 'Double tap',
        movementArrows: 'tap-tap'
      },
      {
        stageNumber: 4,
        stageName: 'Respectful Expression',
        description: 'Hold respectful, dignified facial posture.',
        facialExpression: 'Respectful expression'
      }
    ]
  },
  {
    id: 'sign-brother',
    name: 'Brother',
    gloss: 'BROTHER',
    meaning: 'Male sibling sign',
    category: 'Family and relationships',
    signLanguage: 'ISL',
    aslComparisonNote: 'In ASL, male forehead sign leads to L-hands coming together. In ISL, male indicator followed by index fingers rubbing side-by-side (equal siblings).',
    type: 'dynamic_sequence',
    handshape: 'Male forehead indicator followed by parallel index fingers',
    palmOrientation: 'Palms facing each other',
    movementDescription: 'Indicate male marker then bring both index fingers together side by side',
    twoHanded: true,
    bodyAnchor: 'neutral_space',
    trainingStatus: 'needs_training_data',
    verificationStatus: 'verified_isl',
    description: 'Male marker followed by index fingers rubbing parallel together indicating brother',
    tags: ['family', 'brother', 'bhai', 'sibling'],
    isModelSupported: false,
    learningOnly: true,
    modelType: 'learning_dictionary',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Male Marker',
        description: 'Touch forehead or mustache line briefly.',
        handshape: 'Forehead touch',
        bodyAnchor: 'forehead'
      },
      {
        stageNumber: 2,
        stageName: 'Parallel Index Fingers',
        description: 'Extend index fingers of both hands, pointing forward.',
        bodyAnchor: 'chest'
      },
      {
        stageNumber: 3,
        stageName: 'Together Alignment',
        description: 'Bring both index fingers alongside each other touching laterally.',
        movementTrajectory: 'Lateral joining of index fingers'
      },
      {
        stageNumber: 4,
        stageName: 'Friendly Sibling Smile',
        description: 'Hold together with friendly sibling smile.',
        facialExpression: 'Friendly smile'
      }
    ]
  },
  {
    id: 'sign-sister',
    name: 'Sister',
    gloss: 'SISTER',
    meaning: 'Female sibling sign',
    category: 'Family and relationships',
    signLanguage: 'ISL',
    aslComparisonNote: 'In ASL, female chin sign leads to hands coming together. In ISL, female chin/nose marker followed by parallel index fingers touching.',
    type: 'dynamic_sequence',
    handshape: 'Female marker followed by parallel index fingers',
    palmOrientation: 'Palms facing each other',
    movementDescription: 'Indicate female chin/earring marker then bring index fingers together',
    twoHanded: true,
    bodyAnchor: 'neutral_space',
    trainingStatus: 'needs_training_data',
    verificationStatus: 'verified_isl',
    description: 'Female indicator followed by parallel index fingers touching representing sister',
    tags: ['family', 'sister', 'behen', 'sibling'],
    isModelSupported: false,
    learningOnly: true,
    modelType: 'learning_dictionary',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Female Marker',
        description: 'Touch chin or earlobe lightly.',
        handshape: 'Chin/ear touch',
        bodyAnchor: 'chin'
      },
      {
        stageNumber: 2,
        stageName: 'Parallel Fingers',
        description: 'Extend index fingers of both hands forward.',
        bodyAnchor: 'chest'
      },
      {
        stageNumber: 3,
        stageName: 'Joining Stroke',
        description: 'Bring both index fingers alongside each other.',
        movementTrajectory: 'Join fingers side-by-side'
      },
      {
        stageNumber: 4,
        stageName: 'Sisterly Warmth',
        description: 'Hold with affectionate expression.',
        facialExpression: 'Affectionate smile'
      }
    ]
  },
  {
    id: 'sign-friend',
    name: 'Friend',
    gloss: 'FRIEND',
    meaning: 'Close companion or peer',
    category: 'Family and relationships',
    signLanguage: 'ISL',
    aslComparisonNote: 'In ASL, hooked index fingers link and flip. In ISL, both index fingers interlock or hands shake together warmly.',
    type: 'dynamic_sequence',
    handshape: 'Both index fingers curved like hooks',
    palmOrientation: 'Palms facing body',
    movementDescription: 'Interlock hooked index fingers once, then reverse and interlock again',
    twoHanded: true,
    bodyAnchor: 'chest',
    trainingStatus: 'needs_training_data',
    verificationStatus: 'verified_isl',
    description: 'Both index fingers hook together reciprocally in front of chest showing friendship bond',
    tags: ['friend', 'dost', 'companion', 'relationship'],
    isModelSupported: false,
    learningOnly: true,
    modelType: 'learning_dictionary',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Hook Handshape',
        description: 'Curve both index fingers into small hooks (X-handshape).',
        handshape: 'Hooked index fingers',
        bodyAnchor: 'chest'
      },
      {
        stageNumber: 2,
        stageName: 'First Link',
        description: 'Hook dominant index over non-dominant index finger.',
        bodyAnchor: 'chest'
      },
      {
        stageNumber: 3,
        stageName: 'Reciprocal Link',
        description: 'Unlink and switch so non-dominant hooks over dominant.',
        movementTrajectory: 'Interlock and switch'
      },
      {
        stageNumber: 4,
        stageName: 'Companionship Smile',
        description: 'Hold linked with an upbeat companionable smile.',
        facialExpression: 'Warm companionable smile'
      }
    ]
  },

  // =========================================================================
  // CATEGORY 3: Numbers, dates and time
  // =========================================================================
  {
    id: 'sign-number-1',
    name: 'Number 1 / Point',
    gloss: 'NUMBER 1 / POINT',
    meaning: 'Digit 1 or directional point indicator',
    category: 'Numbers, dates, and time',
    signLanguage: 'ISL',
    aslComparisonNote: 'Index finger extended upright is identical across ASL and ISL counting systems.',
    type: 'static_posture',
    handshape: 'Index finger extended upright; thumb holds down middle, ring, pinky',
    palmOrientation: 'Palm facing forward or inward toward signer',
    movementDescription: 'Steady vertical hold at chest or chin height',
    twoHanded: false,
    bodyAnchor: 'neutral_space',
    trainingStatus: 'trained_model',
    verificationStatus: 'verified_isl',
    description: 'Single index finger extended upright cleanly representing numeral 1',
    tags: ['number', 'one', '1', 'counting', 'point', 'ek'],
    isModelSupported: true,
    learningOnly: false,
    modelType: 'trained_centroid',
    source: 'ISLRTC Syllabus Standard',
    sourceNote: 'Official ISLRTC Dictionary Standard (Video footage pending publication in public ISLRTC archive)',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Index Isolation',
        description: 'Extend only the index finger vertically while thumb pins down all remaining 3 fingers.',
        handshape: 'Index finger upright',
        bodyAnchor: 'neutral_space'
      },
      {
        stageNumber: 2,
        stageName: 'Vertical Hold',
        description: 'Hold hand upright at mid-chest level.',
        bodyAnchor: 'chest'
      },
      {
        stageNumber: 3,
        stageName: 'Definite Emphasis',
        description: 'Slight forward accentuation to clearly assert count of one.',
        movementTrajectory: 'Subtle forward tap'
      },
      {
        stageNumber: 4,
        stageName: 'Neutral Hold',
        description: 'Steady position with clear focus.',
        facialExpression: 'Attentive neutral'
      }
    ]
  },
  {
    id: 'sign-peace',
    name: 'Number 2 / Peace',
    gloss: 'NUMBER 2 / PEACE',
    meaning: 'Digit 2 or V-sign peace gesture',
    category: 'Numbers, dates, and time',
    signLanguage: 'ISL',
    aslComparisonNote: 'Index and middle fingers extended in a V-shape represents numeral 2 in both systems.',
    type: 'static_posture',
    handshape: 'Index and middle fingers extended in V-shape; thumb holds ring and pinky',
    palmOrientation: 'Palm facing outward toward camera',
    movementDescription: 'Static steady hold at chest/shoulder level',
    twoHanded: false,
    bodyAnchor: 'neutral_space',
    trainingStatus: 'trained_model',
    verificationStatus: 'verified_isl',
    description: 'Two fingers (index and middle) extended upright in a V shape',
    tags: ['number', 'two', '2', 'peace', 'victory', 'do'],
    isModelSupported: true,
    learningOnly: false,
    modelType: 'trained_centroid',
    source: 'ISLRTC Syllabus Standard',
    sourceNote: 'Official ISLRTC Dictionary Standard (Video footage pending publication in public ISLRTC archive)',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'V-Handshape Formation',
        description: 'Extend index and middle fingers in a spread V, thumb holding ring & pinky down.',
        handshape: 'V-sign / Two fingers',
        bodyAnchor: 'neutral_space'
      },
      {
        stageNumber: 2,
        stageName: 'Shoulder Height Placement',
        description: 'Position hand at shoulder height facing front.',
        bodyAnchor: 'chest'
      },
      {
        stageNumber: 3,
        stageName: 'Steady Static Hold',
        description: 'Hold completely still so camera landmarks lock securely.',
        movementTrajectory: 'Stationary hold'
      },
      {
        stageNumber: 4,
        stageName: 'Clear Focus',
        description: 'Direct gaze toward conversational partner.',
        facialExpression: 'Focused confident'
      }
    ]
  },
  {
    id: 'sign-time-clock',
    name: 'Time / Clock',
    gloss: 'TIME / CLOCK',
    meaning: 'Inquiry or indication of clock time, schedule, or hour',
    category: 'Numbers, dates, and time',
    signLanguage: 'ISL',
    aslComparisonNote: 'In both ASL and ISL, dominant index finger taps twice on non-dominant wrist (wristwatch location).',
    type: 'static_posture',
    handshape: 'Dominant index finger taps non-dominant wrist',
    palmOrientation: 'Dominant palm facing downward, non-dominant wrist facing up',
    movementDescription: 'Index finger taps top of wrist twice indicating wristwatch',
    twoHanded: true,
    bodyAnchor: 'wrist',
    trainingStatus: 'needs_training_data',
    verificationStatus: 'verified_isl',
    description: 'Index finger taps back of opposite wrist twice where a watch sits',
    tags: ['time', 'clock', 'hour', 'schedule', 'samay', 'waqt'],
    isModelSupported: false,
    learningOnly: true,
    modelType: 'learning_dictionary',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Wrist & Finger Setup',
        description: 'Hold non-dominant arm across chest. Point dominant index finger downward.',
        handshape: 'Index pointing to wrist',
        bodyAnchor: 'wrist'
      },
      {
        stageNumber: 2,
        stageName: 'Watch Position Anchor',
        description: 'Aim index finger directly at the wrist bone where watch dial sits.',
        bodyAnchor: 'wrist'
      },
      {
        stageNumber: 3,
        stageName: 'Double Tap',
        description: 'Tap wrist twice with crisp staccato rhythm.',
        movementTrajectory: 'Double vertical tap',
        movementArrows: 'tap-tap'
      },
      {
        stageNumber: 4,
        stageName: 'Inquiring Expression',
        description: 'Tilt head slightly with questioning eyebrows if asking "what time is it?".',
        facialExpression: 'Inquiring eyebrow raise'
      }
    ]
  },
  {
    id: 'sign-today',
    name: 'Today / Now',
    gloss: 'TODAY / NOW',
    meaning: 'Current day or immediate present moment',
    category: 'Numbers, dates, and time',
    signLanguage: 'ISL',
    aslComparisonNote: 'In ASL, Y-hands drop downward. In ISL, both open flat palms drop downward sharply in front of hips.',
    type: 'dynamic_sequence',
    handshape: 'Both open hands, palms facing upward',
    palmOrientation: 'Palms facing up toward ceiling',
    movementDescription: 'Drop both hands downward twice in front of hips indicating present day',
    twoHanded: true,
    bodyAnchor: 'neutral_space',
    trainingStatus: 'needs_training_data',
    verificationStatus: 'verified_isl',
    description: 'Both upward-facing palms drop downward firmly in space to indicate today / right now',
    tags: ['today', 'now', 'aaj', 'present', 'day'],
    isModelSupported: false,
    learningOnly: true,
    modelType: 'learning_dictionary',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Upward Palms',
        description: 'Both hands bent at elbows with palms facing ceiling in front of abdomen.',
        handshape: 'Open palms up',
        bodyAnchor: 'chest'
      },
      {
        stageNumber: 2,
        stageName: 'Downward Drop Stroke',
        description: 'Drop both hands firmly downward 3-4 inches simultaneously.',
        movementTrajectory: 'Downward pulse',
        movementArrows: 'downward'
      },
      {
        stageNumber: 3,
        stageName: 'Repeat Drop',
        description: 'Raise slightly and repeat downward drop once more for emphasis.',
        movementTrajectory: 'Second downward pulse'
      },
      {
        stageNumber: 4,
        stageName: 'Definite Present Hold',
        description: 'Hold firmly with decisive facial nod.',
        facialExpression: 'Decisive affirmative nod'
      }
    ]
  },
  {
    id: 'sign-tomorrow',
    name: 'Tomorrow',
    gloss: 'TOMORROW',
    meaning: 'The following day in future',
    category: 'Numbers, dates, and time',
    signLanguage: 'ISL',
    aslComparisonNote: 'In ASL, A-thumb moves forward from jaw. In ISL, index finger or thumb arcs forward from cheek/ear toward front space.',
    type: 'dynamic_sequence',
    handshape: 'Thumb or index finger near cheek',
    palmOrientation: 'Palm facing cheek',
    movementDescription: 'Hand arcs forward from cheek into front space signifying future day',
    twoHanded: false,
    bodyAnchor: 'chin',
    trainingStatus: 'needs_training_data',
    verificationStatus: 'verified_isl',
    description: 'Finger starts at cheek/ear and arcs forward into space indicating tomorrow',
    tags: ['tomorrow', 'kal', 'future', 'day', 'next day'],
    isModelSupported: false,
    learningOnly: true,
    modelType: 'learning_dictionary',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Cheek Anchor',
        description: 'Place thumb or bent index finger beside right cheek / jaw.',
        handshape: 'Thumb at jaw',
        bodyAnchor: 'chin'
      },
      {
        stageNumber: 2,
        stageName: 'Forward Arc Stroke',
        description: 'Sweep hand forward in an upward-forward arc into space ahead.',
        movementTrajectory: 'Forward arc into future',
        movementArrows: 'forward arc'
      },
      {
        stageNumber: 3,
        stageName: 'Extension Release',
        description: 'Open hand slightly as it finishes stroke ahead.',
        movementTrajectory: 'Forward hold'
      },
      {
        stageNumber: 4,
        stageName: 'Forward Looking Hold',
        description: 'Gaze forward along the direction of the sign.',
        facialExpression: 'Forward focused expression'
      }
    ]
  },

  // =========================================================================
  // CATEGORY 4: Home and everyday activities
  // =========================================================================
  {
    id: 'sign-home',
    name: 'Home / House',
    gloss: 'HOME / HOUSE',
    meaning: 'Dwelling place or residence',
    category: 'Home and daily activities',
    signLanguage: 'ISL',
    aslComparisonNote: 'In ASL, flat O touches mouth then cheek (eat + sleep). In ISL, both flat hands form peaked roof of house at chest height.',
    type: 'dynamic_sequence',
    handshape: 'Both open flat hands, fingertips joined diagonally to form roof roof',
    palmOrientation: 'Palms facing diagonally downward',
    movementDescription: 'Fingertips touch at apex forming roof, then separate downward to form walls',
    twoHanded: true,
    bodyAnchor: 'chest',
    trainingStatus: 'needs_training_data',
    verificationStatus: 'verified_isl',
    description: 'Both flat hands touch fingertips together creating roof angle then outline walls',
    tags: ['home', 'house', 'ghar', 'building', 'stay'],
    isModelSupported: false,
    learningOnly: true,
    modelType: 'learning_dictionary',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Roof Apex Form',
        description: 'Join fingertips of both flat hands at an inverted 45-degree angle in front of chest.',
        handshape: 'Diagonal flat hands',
        bodyAnchor: 'chest'
      },
      {
        stageNumber: 2,
        stageName: 'Roof Hold',
        description: 'Hold apex peaked showing roof shape.',
        bodyAnchor: 'chest'
      },
      {
        stageNumber: 3,
        stageName: 'Wall Downstroke',
        description: 'Separate hands and move palms straight down to trace vertical walls.',
        movementTrajectory: 'Vertical downward trace',
        movementArrows: 'downward walls'
      },
      {
        stageNumber: 4,
        stageName: 'Comfortable Warm Hold',
        description: 'Hold with relaxed, contented facial expression.',
        facialExpression: 'Warm contented look'
      }
    ]
  },
  {
    id: 'sign-need',
    name: 'I Need / Want',
    gloss: 'I NEED / WANT',
    meaning: 'Expression of requirement, desire, or necessity',
    category: 'Home and daily activities',
    signLanguage: 'ISL',
    aslComparisonNote: 'In ASL, X-handshape bends down repeatedly. In ISL, both cupped hands pull inward toward body or bent open palms pull toward chest.',
    type: 'dynamic_sequence',
    handshape: 'Both open hands, fingers slightly curved / cupped',
    palmOrientation: 'Palms facing upward and inward',
    movementDescription: 'Both hands pull inward toward the torso in a clutching / requesting motion',
    twoHanded: true,
    bodyAnchor: 'chest',
    trainingStatus: 'needs_training_data',
    verificationStatus: 'verified_isl',
    description: 'Both curved hands draw inward toward the body expressing personal need',
    tags: ['need', 'want', 'require', 'chahiye', 'desire'],
    isModelSupported: false,
    learningOnly: true,
    modelType: 'learning_dictionary',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Handshape: Cupped Palms',
        description: 'Extend both hands with fingers relaxed and curved, palms facing up.',
        handshape: 'Cupped palms up',
        bodyAnchor: 'neutral_space'
      },
      {
        stageNumber: 2,
        stageName: 'Initial Forward Position',
        description: 'Hold hands out at waist height.',
        bodyAnchor: 'chest'
      },
      {
        stageNumber: 3,
        stageName: 'Inward Pull Stroke',
        description: 'Pull both hands inward toward chest while curling fingers slightly.',
        movementTrajectory: 'Inward pull stroke',
        movementArrows: 'inward toward chest'
      },
      {
        stageNumber: 4,
        stageName: 'Earnest Expression',
        description: 'Hold close to torso with sincere, earnest eye contact.',
        facialExpression: 'Earnest expressive look'
      }
    ]
  },
  {
    id: 'sign-sleep',
    name: 'Sleep / Tired',
    gloss: 'SLEEP / TIRED',
    meaning: 'Rest, sleep, or bedtime expression',
    category: 'Home and daily activities',
    signLanguage: 'ISL',
    aslComparisonNote: 'In ASL, open hand pulls down over face closing to fingers. In ISL, folded hands rest against tilted cheek (pillow mime) or eyes close with hand over face.',
    type: 'static_posture',
    handshape: 'Both palms pressed flat together against tilted cheek',
    palmOrientation: 'Palms pressed together, resting against side of face',
    movementDescription: 'Head tilts onto joined palms simulating resting on a pillow',
    twoHanded: true,
    bodyAnchor: 'forehead',
    trainingStatus: 'needs_training_data',
    verificationStatus: 'verified_isl',
    description: 'Joined palms held beside tilted head simulating head on pillow',
    tags: ['sleep', 'tired', 'rest', 'bed', 'soona', 'arram'],
    isModelSupported: false,
    learningOnly: true,
    modelType: 'learning_dictionary',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Joined Palms (Pillow Formation)',
        description: 'Place both flat palms pressed together.',
        handshape: 'Joined flat palms',
        bodyAnchor: 'chin'
      },
      {
        stageNumber: 2,
        stageName: 'Cheek Anchor Tilt',
        description: 'Tilt head sideways and rest cheek against backs of hands.',
        bodyAnchor: 'forehead'
      },
      {
        stageNumber: 3,
        stageName: 'Eye Closure',
        description: 'Gently close eyes simulating deep rest or tiredness.',
        facialExpression: 'Closed eyes peaceful relaxation'
      },
      {
        stageNumber: 4,
        stageName: 'Quiet Rest Hold',
        description: 'Hold posture gently for 1-2 seconds.',
        bodyAnchor: 'forehead'
      }
    ]
  },
  {
    id: 'sign-bathroom',
    name: 'Where is the bathroom?',
    gloss: 'BATHROOM / TOILET',
    meaning: 'Inquiry or indication of washroom, toilet, or restroom',
    category: 'Places and directions',
    signLanguage: 'ISL',
    aslComparisonNote: 'In ASL, T-hand shakes side-to-side. In ISL, raised pinky finger shakes side to side (standard South Asian toilet sign) or W-hand mimes wash.',
    type: 'dynamic_sequence',
    handshape: 'Closed fist with upright little finger (Pinky / ISL Toilet Sign)',
    palmOrientation: 'Palm facing inward/forward, pinky pointing upright',
    movementDescription: 'Shake extended pinky finger side to side twice',
    twoHanded: false,
    bodyAnchor: 'neutral_space',
    trainingStatus: 'template_supported',
    verificationStatus: 'verified_isl',
    description: 'Upright pinky finger shaken side-to-side indicating restroom requirement',
    tags: ['toilet', 'bathroom', 'washroom', 'restroom', 'shauchalaya'],
    isModelSupported: true,
    learningOnly: false,
    modelType: 'trained_centroid',
    videoUrl: 'https://www.youtube-nocookie.com/embed/SwGIw2creRA',
    source: 'Deaf Enabled Foundation Indian Sign Language Educational Series',
    sourceNote: 'Deaf Enabled Foundation verified demonstration: Toilet / Bathroom Indian Sign Language',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Handshape: Pinky Upright',
        description: 'Make a fist with thumb over middle fingers; extend only the little finger (pinky).',
        handshape: 'Upright pinky finger',
        bodyAnchor: 'neutral_space'
      },
      {
        stageNumber: 2,
        stageName: 'Chest Height Placement',
        description: 'Hold hand at chest height comfortably.',
        bodyAnchor: 'chest'
      },
      {
        stageNumber: 3,
        stageName: 'Lateral Shake Oscillation',
        description: 'Oscillate wrist side to side shaking the pinky twice.',
        movementTrajectory: 'Wrist oscillation left-right',
        movementArrows: 'left-right shake'
      },
      {
        stageNumber: 4,
        stageName: 'Inquiring Expression',
        description: 'Slight head tilt with questioning eyebrow raise if asking location.',
        facialExpression: 'Questioning raised eyebrows'
      }
    ]
  },

  // =========================================================================
  // CATEGORY 5: Questions, feelings and emotions
  // =========================================================================
  {
    id: 'sign-yes',
    name: 'Yes (Thumbs Up)',
    gloss: 'YES / AFFIRMATIVE',
    meaning: 'Affirmative response, agreement, approval',
    category: 'Everyday conversation',
    signLanguage: 'ISL',
    aslComparisonNote: 'In ASL, S-fist nods up and down like a head. In ISL, upright thumbs-up or nodding fist is universally used and recognized.',
    type: 'static_posture',
    handshape: 'Closed fist with thumb extended upright cleanly',
    palmOrientation: 'Palm facing side, thumb pointed directly up',
    movementDescription: 'Static hold or gentle upward nod with affirmative head nod',
    twoHanded: false,
    bodyAnchor: 'neutral_space',
    trainingStatus: 'trained_model',
    verificationStatus: 'verified_isl',
    description: 'Thumbs up gesture held upright with decisive affirmative nod',
    tags: ['affirmative', 'yes', 'agree', 'correct', 'haan', 'sahi'],
    isModelSupported: true,
    learningOnly: false,
    modelType: 'trained_centroid',
    source: 'ISLRTC Syllabus Standard',
    sourceNote: 'Official ISLRTC Dictionary Standard (Video footage pending publication in public ISLRTC archive)',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Thumb Extension Handshape',
        description: 'Make a firm fist, extend thumb straight upright with high tension.',
        handshape: 'Firm thumbs up',
        bodyAnchor: 'neutral_space'
      },
      {
        stageNumber: 2,
        stageName: 'Mid-Chest Elevation',
        description: 'Hold at mid-chest level, thumb vertical.',
        bodyAnchor: 'chest'
      },
      {
        stageNumber: 3,
        stageName: 'Affirmative Nod Action',
        description: 'Accompany with clear downward affirmative head nod.',
        movementTrajectory: 'Vertical affirmative head nod'
      },
      {
        stageNumber: 4,
        stageName: 'Confident Smiling Expression',
        description: 'Maintain confident, agreeable smile and clear eye contact.',
        facialExpression: 'Confident agreeable smile'
      }
    ]
  },
  {
    id: 'sign-no',
    name: 'No / Pinch',
    gloss: 'NO / NEGATIVE',
    meaning: 'Negative response, disagreement, refusal',
    category: 'Everyday conversation',
    signLanguage: 'ISL',
    aslComparisonNote: 'In ASL, index and middle fingers snap down onto thumb. In ISL, pinch gesture or index finger wagging side to side with head shake.',
    type: 'static_posture',
    handshape: 'Index and thumb tips pinched together; other fingers curled or wagging index',
    palmOrientation: 'Palm facing forward / side',
    movementDescription: 'Pinched posture or side-to-side wrist wag with negative head shake',
    twoHanded: false,
    bodyAnchor: 'neutral_space',
    trainingStatus: 'trained_model',
    verificationStatus: 'verified_isl',
    description: 'Pinch posture or side wag accompanied by clear head shake',
    tags: ['negative', 'no', 'disagree', 'stop', 'nahin', 'galat'],
    isModelSupported: true,
    learningOnly: false,
    modelType: 'trained_centroid',
    source: 'ISLRTC Syllabus Standard',
    sourceNote: 'Official ISLRTC Dictionary Standard (Video footage pending publication in public ISLRTC archive)',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Pinch / Wag Handshape',
        description: 'Pinch tips of index finger and thumb together with clear contact.',
        handshape: 'Thumb-index pinch',
        bodyAnchor: 'neutral_space'
      },
      {
        stageNumber: 2,
        stageName: 'Starting Chest Height',
        description: 'Position hand at shoulder height.',
        bodyAnchor: 'chest'
      },
      {
        stageNumber: 3,
        stageName: 'Lateral Head Shake',
        description: 'Shake head side-to-side clearly to convey negation in sign grammar.',
        movementTrajectory: 'Head shake side-to-side',
        movementArrows: 'head shake'
      },
      {
        stageNumber: 4,
        stageName: 'Firm Negative Facial Expression',
        description: 'Slightly furrow brow with firm, polite negative expression.',
        facialExpression: 'Firm polite negation'
      }
    ]
  },
  {
    id: 'sign-feel-happy',
    name: 'Happy / Glad',
    gloss: 'HAPPY / GLAD',
    meaning: 'Joyful, glad, or positive emotional state',
    category: 'Feelings and emotions',
    signLanguage: 'ISL',
    aslComparisonNote: 'In ASL, flat open hand sweeps upward against chest twice. In ISL, open flat palms brush upward along chest with beaming smile.',
    type: 'dynamic_sequence',
    handshape: 'Flat open palms with fingers together',
    palmOrientation: 'Palms facing chest',
    movementDescription: 'Brush palms upward against chest in two light buoyant strokes',
    twoHanded: true,
    bodyAnchor: 'chest',
    trainingStatus: 'needs_training_data',
    verificationStatus: 'verified_isl',
    description: 'Both flat hands brush upward over chest repeatedly with radiant smile',
    tags: ['happy', 'joy', 'glad', 'khush', 'positive', 'feeling'],
    isModelSupported: false,
    learningOnly: true,
    modelType: 'learning_dictionary',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Flat Palms Handshape',
        description: 'Hold both hands flat with thumbs relaxed, palms facing inward.',
        handshape: 'Flat palms inward',
        bodyAnchor: 'chest'
      },
      {
        stageNumber: 2,
        stageName: 'Lower Chest Placement',
        description: 'Place palm bases at lower ribcage / solar plexus.',
        bodyAnchor: 'chest'
      },
      {
        stageNumber: 3,
        stageName: 'Upward Brushing Strokes',
        description: 'Brush hands upward toward collarbone twice in lively succession.',
        movementTrajectory: 'Upward brushing strokes',
        movementArrows: 'upward chest sweeps'
      },
      {
        stageNumber: 4,
        stageName: 'Radiant Joyful Facial Marker',
        description: 'Facial expression is essential: broad genuine smile, raised cheeks, bright eyes.',
        facialExpression: 'Broad beaming smile with bright eyes'
      }
    ]
  },
  {
    id: 'sign-feel-sad',
    name: 'Sad / Unhappy',
    gloss: 'SAD / UNHAPPY',
    meaning: 'Sorrow, grief, or dejected emotional state',
    category: 'Feelings and emotions',
    signLanguage: 'ISL',
    aslComparisonNote: 'In ASL, open hands drop slowly in front of face with drooping head. In ISL, flat hands slide downward in front of face with downturned lips.',
    type: 'dynamic_sequence',
    handshape: 'Open hands with slightly curved fingers facing face',
    palmOrientation: 'Palms facing toward signer face',
    movementDescription: 'Both hands move slowly downward in front of face as head tilts down',
    twoHanded: true,
    bodyAnchor: 'forehead',
    trainingStatus: 'needs_training_data',
    verificationStatus: 'verified_isl',
    description: 'Both open hands descend down the face while head and lips droop downward',
    tags: ['sad', 'unhappy', 'sorrow', 'udaas', 'feeling', 'emotion'],
    isModelSupported: false,
    learningOnly: true,
    modelType: 'learning_dictionary',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Face Level Setup',
        description: 'Hold both open hands at forehead height, palms facing eyes.',
        handshape: 'Open palms facing face',
        bodyAnchor: 'forehead'
      },
      {
        stageNumber: 2,
        stageName: 'Downward Descent',
        description: 'Lower hands slowly downward past mouth toward chest.',
        movementTrajectory: 'Slow downward descent',
        movementArrows: 'downward'
      },
      {
        stageNumber: 3,
        stageName: 'Facial Droop Marker',
        description: 'Corners of mouth pull down, eyebrows draw up in center (sadness marker).',
        facialExpression: 'Downturned mouth with sorrowful eyes'
      },
      {
        stageNumber: 4,
        stageName: 'Drooping Hold',
        description: 'Pause hands at mid-chest with downward tilted head.',
        bodyAnchor: 'chest'
      }
    ]
  },
  {
    id: 'sign-question-where',
    name: 'Where? / Location Question',
    gloss: 'WHERE?',
    meaning: 'Inquiry regarding location or direction',
    category: 'Questions and answers',
    signLanguage: 'ISL',
    aslComparisonNote: 'In ASL, index finger wags side to side. In ISL, both open hands with palms up oscillate side-to-side with furrowed brow.',
    type: 'dynamic_sequence',
    handshape: 'Both open flat hands, palms facing up',
    palmOrientation: 'Palms facing upward toward ceiling',
    movementDescription: 'Both hands move slightly side to side in horizontal arcs with questioning brow',
    twoHanded: true,
    bodyAnchor: 'chest',
    trainingStatus: 'needs_training_data',
    verificationStatus: 'verified_isl',
    description: 'Both open palms up moved gently side-to-side accompanied by furrowed inquiring brow',
    tags: ['where', 'kahan', 'question', 'location', 'inquiry'],
    isModelSupported: false,
    learningOnly: true,
    modelType: 'learning_dictionary',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Palms Upward Handshape',
        description: 'Extend both hands at chest level, palms facing up, fingers relaxed.',
        handshape: 'Open palms upward',
        bodyAnchor: 'chest'
      },
      {
        stageNumber: 2,
        stageName: 'Horizontal Oscillation',
        description: 'Shift both hands outward and inward in slight lateral arcs.',
        movementTrajectory: 'Lateral horizontal shift',
        movementArrows: 'left-right'
      },
      {
        stageNumber: 3,
        stageName: 'Questioning Facial Grammar',
        description: 'Furrow eyebrows, tilt head slightly forward (WH-question marker in sign grammar).',
        facialExpression: 'Furrowed brow with inquiring gaze'
      },
      {
        stageNumber: 4,
        stageName: 'Open Interrogative Hold',
        description: 'Hold palms open awaiting conversational partner answer.',
        bodyAnchor: 'chest'
      }
    ]
  },

  // =========================================================================
  // CATEGORY 6: Directions, travel and transport
  // =========================================================================
  {
    id: 'sign-travel-bus',
    name: 'Bus / Bus stand',
    gloss: 'BUS / BUS STAND',
    meaning: 'Public bus transit or bus terminal',
    category: 'Travel and transportation',
    signLanguage: 'ISL',
    aslComparisonNote: 'In ASL, B-U-S fingerspelled or large steering wheel turned. In ISL, two fists mime steering a large bus steering wheel back and forth.',
    type: 'dynamic_sequence',
    handshape: 'Both closed fists gripping imaginary large steering wheel',
    palmOrientation: 'Palms facing each other or down',
    movementDescription: 'Alternate turning hands as if rotating a large bus steering wheel',
    twoHanded: true,
    bodyAnchor: 'neutral_space',
    trainingStatus: 'needs_training_data',
    verificationStatus: 'verified_isl',
    description: 'Both fists mime turning a large horizontal steering wheel for a bus',
    tags: ['bus', 'travel', 'transport', 'stand', 'vehicle', 'gaadi'],
    isModelSupported: false,
    learningOnly: true,
    modelType: 'learning_dictionary',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Steering Grip Handshape',
        description: 'Form loose fists with both hands held in front at chest height.',
        handshape: 'Dual loose fists',
        bodyAnchor: 'chest'
      },
      {
        stageNumber: 2,
        stageName: 'Wide Wheel Alignment',
        description: 'Space fists 14 inches apart as if holding a wide commercial steering wheel.',
        bodyAnchor: 'neutral_space'
      },
      {
        stageNumber: 3,
        stageName: 'Rotational Steering Motion',
        description: 'Turn left hand down while right goes up, then alternate smoothly.',
        movementTrajectory: 'Rotational steering wheel mime',
        movementArrows: 'rotational steering'
      },
      {
        stageNumber: 4,
        stageName: 'Focused Driving Expression',
        description: 'Look forward with focused gaze of driver.',
        facialExpression: 'Alert forward gaze'
      }
    ]
  },
  {
    id: 'sign-travel-train',
    name: 'Train / Railway station',
    gloss: 'TRAIN / RAILWAY',
    meaning: 'Train, locomotive, or railway platform',
    category: 'Travel and transportation',
    signLanguage: 'ISL',
    aslComparisonNote: 'In ASL, two fingers of dominant hand slide over two fingers of non-dominant hand (tracks). In ISL, fist pulls overhead steam whistle or index fingers slide along tracks.',
    type: 'dynamic_sequence',
    handshape: 'H-handshapes sliding across each other or fist pulling whistle cord',
    palmOrientation: 'Palms facing downward',
    movementDescription: 'Slide dominant index & middle fingers back and forth over stationary non-dominant fingers (wheel on track)',
    twoHanded: true,
    bodyAnchor: 'neutral_space',
    trainingStatus: 'needs_training_data',
    verificationStatus: 'verified_isl',
    description: 'Two extended fingers glide back and forth along opposite fingers simulating train along tracks',
    tags: ['train', 'railway', 'station', 'travel', 'rail', 'platform'],
    isModelSupported: false,
    learningOnly: true,
    modelType: 'learning_dictionary',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Track & Wheel Setup',
        description: 'Extend index and middle fingers on both hands; non-dominant forms track, dominant forms wheel.',
        handshape: 'Parallel extended fingers',
        bodyAnchor: 'chest'
      },
      {
        stageNumber: 2,
        stageName: 'Fingers Overlapping',
        description: 'Place dominant fingertips on top of non-dominant fingers.',
        bodyAnchor: 'neutral_space'
      },
      {
        stageNumber: 3,
        stageName: 'Rhythmic Gliding Stroke',
        description: 'Slide dominant hand back and forth along track fingers rhythmically.',
        movementTrajectory: 'Linear gliding forward-back',
        movementArrows: 'forward-back glide'
      },
      {
        stageNumber: 4,
        stageName: 'Travel Intent Hold',
        description: 'Hold with clear forward-focused intent.',
        facialExpression: 'Focused forward look'
      }
    ]
  },
  {
    id: 'sign-stop',
    name: 'Stop',
    gloss: 'STOP',
    meaning: 'Halt, cease motion, or stop vehicle/action',
    category: 'Common requests and actions',
    signLanguage: 'ISL',
    aslComparisonNote: 'In ASL, dominant knife hand chops down into palm of non-dominant hand. In ISL, dominant open palm drops firmly edge-down into non-dominant palm or forward palm stops.',
    type: 'dynamic_sequence',
    handshape: 'Dominant flat hand chops into open flat non-dominant palm',
    palmOrientation: 'Dominant palm facing side, non-dominant palm facing up',
    movementDescription: 'Chop dominant hand edge down firmly into center of non-dominant palm',
    twoHanded: true,
    bodyAnchor: 'chest',
    trainingStatus: 'template_supported',
    verificationStatus: 'verified_isl',
    description: 'Dominant flat hand chops edge-down into open non-dominant palm with firm stop gesture',
    tags: ['stop', 'halt', 'ruko', 'pause', 'direction'],
    isModelSupported: true,
    learningOnly: false,
    modelType: 'trained_centroid',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Base & Chopping Hand Setup',
        description: 'Hold non-dominant hand flat, palm up. Dominant hand held vertical, palm sideways.',
        handshape: 'Flat open hands',
        bodyAnchor: 'chest'
      },
      {
        stageNumber: 2,
        stageName: 'Sharp Downward Chop',
        description: 'Bring pinky-edge of dominant hand down sharply onto palm of non-dominant hand.',
        movementTrajectory: 'Decisive vertical chop',
        movementArrows: 'downward chop'
      },
      {
        stageNumber: 3,
        stageName: 'Impact Contact',
        description: 'Hold at firm impact point without bouncing.',
        bodyAnchor: 'chest'
      },
      {
        stageNumber: 4,
        stageName: 'Firm Halting Expression',
        description: 'Firm, decisive facial expression indicating sudden stop.',
        facialExpression: 'Decisive firm expression'
      }
    ]
  },

  // =========================================================================
  // CATEGORY 7: Food, dining and shopping
  // =========================================================================
  {
    id: 'sign-water',
    name: 'Water (W-Sign)',
    gloss: 'WATER',
    meaning: 'Drinking water, hydration, or request for water',
    category: 'Food and drinks',
    signLanguage: 'ISL',
    aslComparisonNote: 'In ASL, W-handshape index taps chin twice. In ISL, W-handshape taps chin or thumb-tilted cupped hand pours toward mouth.',
    type: 'static_posture',
    handshape: 'W-handshape (Index, middle, ring extended spread; thumb pins pinky)',
    palmOrientation: 'Palm facing side, index side toward chin',
    movementDescription: 'Index finger taps side of chin or lower lip twice',
    twoHanded: false,
    bodyAnchor: 'chin',
    trainingStatus: 'trained_model',
    verificationStatus: 'verified_isl',
    description: 'W-handshape held at chin level and tapped gently twice for water',
    tags: ['water', 'drink', 'paani', 'hydration', 'thirst'],
    isModelSupported: true,
    learningOnly: false,
    modelType: 'trained_centroid',
    videoUrl: 'https://www.youtube-nocookie.com/embed/L05M2jG1HjA',
    source: 'ISH Shiksha Indian Sign Language Educational Series',
    sourceNote: 'ISH Shiksha verified ISL demonstration: Water in Indian Sign Language',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'W-Handshape Formation',
        description: 'Extend index, middle, and ring fingers upright and spread. Thumb holds pinky finger securely into palm.',
        handshape: 'W-handshape (3 spread fingers)',
        bodyAnchor: 'neutral_space'
      },
      {
        stageNumber: 2,
        stageName: 'Chin Level Alignment',
        description: 'Position hand so the side of the index finger is 1 inch from side of chin.',
        bodyAnchor: 'chin'
      },
      {
        stageNumber: 3,
        stageName: 'Double Tap on Lower Lip',
        description: 'Tap index finger twice lightly against lower lip / chin edge.',
        movementTrajectory: 'Double tap at chin',
        movementArrows: 'tap-tap'
      },
      {
        stageNumber: 4,
        stageName: 'Clear Receptive Expression',
        description: 'Hold with pleasant, clear facial expression.',
        facialExpression: 'Pleasant attentive expression'
      }
    ]
  },
  {
    id: 'sign-food-eat',
    name: 'Food / Eat',
    gloss: 'FOOD / EAT',
    meaning: 'Meal, eating, hunger, or food intake',
    category: 'Food and drinks',
    signLanguage: 'ISL',
    aslComparisonNote: 'In ASL, squished O-hand brings fingertips to mouth repeatedly. In ISL, bunched fingertips tap lips twice or open cupped hand mimes putting food into mouth.',
    type: 'dynamic_sequence',
    handshape: 'Flat-O or cupped fingertips gathered together',
    palmOrientation: 'Fingertips facing toward mouth',
    movementDescription: 'Bring gathered fingertips to mouth twice in eating mime',
    twoHanded: false,
    bodyAnchor: 'mouth',
    trainingStatus: 'template_supported',
    verificationStatus: 'verified_isl',
    description: 'Gathered fingertips tap lips twice simulating eating food',
    tags: ['food', 'eat', 'meal', 'khana', 'bhojan', 'dining'],
    isModelSupported: true,
    learningOnly: false,
    modelType: 'trained_centroid',
    videoUrl: 'https://www.youtube-nocookie.com/embed/tov9L5CTVzY',
    source: 'Deaf Enabled Foundation Indian Sign Language Educational Series',
    sourceNote: 'Deaf Enabled Foundation verified demonstration: Food / Eat Indian Sign Language',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Gathered Fingertips Handshape',
        description: 'Bring tips of thumb and all four fingers together in a pinch cone facing lips.',
        handshape: 'Pinched cone / Flat O',
        bodyAnchor: 'mouth'
      },
      {
        stageNumber: 2,
        stageName: 'Mouth Touch Anchor',
        description: 'Move fingertips to touch center of lips lightly.',
        bodyAnchor: 'mouth'
      },
      {
        stageNumber: 3,
        stageName: 'Double Tap Feeding Mime',
        description: 'Retract 2 inches and touch lips a second time in clear eating mime.',
        movementTrajectory: 'Double tap at mouth',
        movementArrows: 'in-out toward mouth'
      },
      {
        stageNumber: 4,
        stageName: 'Pleasant Dining Expression',
        description: 'Natural pleasant mouth posture without exaggerating.',
        facialExpression: 'Natural pleasant look'
      }
    ]
  },
  {
    id: 'sign-tea',
    name: 'Tea / Chai',
    gloss: 'TEA / CHAI',
    meaning: 'Tea beverage or hot drink inquiry',
    category: 'Food and drinks',
    signLanguage: 'ISL',
    aslComparisonNote: 'In ASL, F-hand stirs inside non-dominant O-cup. In ISL, dominant thumb-index pinch holds saucer/cup handle and sips, or stirs tea in cup.',
    type: 'dynamic_sequence',
    handshape: 'Dominant thumb and index form pinch holding teacup handle, non-dominant forms saucer',
    palmOrientation: 'Palms facing each other',
    movementDescription: 'Mime lifting small cup to mouth and sipping twice',
    twoHanded: true,
    bodyAnchor: 'mouth',
    trainingStatus: 'needs_training_data',
    verificationStatus: 'verified_isl',
    description: 'Pinch mime holding tea cup lifted toward mouth simulating sipping chai',
    tags: ['tea', 'chai', 'drink', 'beverage', 'hot drink'],
    isModelSupported: false,
    learningOnly: true,
    modelType: 'learning_dictionary',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Teacup Grip & Saucer',
        description: 'Dominant hand pinches imaginary cup handle; non-dominant flat palm forms saucer beneath.',
        handshape: 'Cup grip and flat saucer',
        bodyAnchor: 'chest'
      },
      {
        stageNumber: 2,
        stageName: 'Lifting to Mouth',
        description: 'Raise dominant cup hand smoothly to lower lip.',
        bodyAnchor: 'mouth'
      },
      {
        stageNumber: 3,
        stageName: 'Sipping Mime',
        description: 'Tilt wrist back slightly simulating taking two sips of hot tea.',
        movementTrajectory: 'Tilt back to sip',
        movementArrows: 'tilt toward lips'
      },
      {
        stageNumber: 4,
        stageName: 'Satisfied Chai Smile',
        description: 'Smile with contented facial expression.',
        facialExpression: 'Contented smile'
      }
    ]
  },

  // =========================================================================
  // CATEGORY 8: Money, clothes and daily purchases
  // =========================================================================
  {
    id: 'sign-money-price',
    name: 'How much money? / Price',
    gloss: 'MONEY / PRICE',
    meaning: 'Inquiry or indication of cost, currency, or payment amount',
    category: 'Work and occupations',
    signLanguage: 'ISL',
    aslComparisonNote: 'In ASL, squished O taps flat non-dominant palm twice. In ISL, dominant thumb rubs across tips of index and middle finger (counting currency notes).',
    type: 'dynamic_sequence',
    handshape: 'Thumb rubbing across index and middle fingertips repeatedly',
    palmOrientation: 'Palm facing upward or inward',
    movementDescription: 'Thumb slides back and forth against index and middle finger simulating counting money bills',
    twoHanded: false,
    bodyAnchor: 'chest',
    trainingStatus: 'needs_training_data',
    verificationStatus: 'verified_isl',
    description: 'Thumb rubs across index and middle fingertips simulating counting currency notes',
    tags: ['money', 'price', 'rupees', 'cost', 'paisa', 'bill'],
    isModelSupported: false,
    learningOnly: true,
    modelType: 'learning_dictionary',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Currency Count Handshape',
        description: 'Extend index and middle fingers together, thumb pad resting across their tips.',
        handshape: 'Note counting pinch',
        bodyAnchor: 'chest'
      },
      {
        stageNumber: 2,
        stageName: 'Chest Height Placement',
        description: 'Hold hand at mid-chest level tilted slightly upward.',
        bodyAnchor: 'chest'
      },
      {
        stageNumber: 3,
        stageName: 'Thumb Rubbing Stroke',
        description: 'Rub thumb pad laterally across index and middle fingertips 2-3 times.',
        movementTrajectory: 'Lateral thumb rubbing across fingers',
        movementArrows: 'lateral friction'
      },
      {
        stageNumber: 4,
        stageName: 'Cost Inquiry Brow',
        description: 'Raise or furrow eyebrows with questioning expression ("how much does this cost?").',
        facialExpression: 'Questioning price inquiry'
      }
    ]
  },
  {
    id: 'sign-buy-pay',
    name: 'Buy / Pay',
    gloss: 'BUY / PAY',
    meaning: 'Purchase, payment, or financial transaction',
    category: 'Work and occupations',
    signLanguage: 'ISL',
    aslComparisonNote: 'In ASL, flat hand offers bill forward from palm. In ISL, dominant hand places imaginary money from palm forward into seller hand.',
    type: 'dynamic_sequence',
    handshape: 'Dominant flat hand takes from non-dominant palm and hands forward',
    palmOrientation: 'Dominant palm facing up',
    movementDescription: 'Dominant hand moves from chest outward offering payment forward',
    twoHanded: true,
    bodyAnchor: 'neutral_space',
    trainingStatus: 'needs_training_data',
    verificationStatus: 'verified_isl',
    description: 'Dominant hand moves from palm forward offering payment to vendor',
    tags: ['buy', 'pay', 'purchase', 'khareedna', 'payment'],
    isModelSupported: false,
    learningOnly: true,
    modelType: 'learning_dictionary',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Palm Setup',
        description: 'Non-dominant palm flat facing up. Dominant fingertips resting on non-dominant palm.',
        handshape: 'Money holding palm',
        bodyAnchor: 'chest'
      },
      {
        stageNumber: 2,
        stageName: 'Forward Payment Offer',
        description: 'Lift dominant hand and sweep forward toward transaction partner.',
        movementTrajectory: 'Forward offering stroke',
        movementArrows: 'forward'
      },
      {
        stageNumber: 3,
        stageName: 'Release Gesture',
        description: 'Open fingers slightly releasing currency into partner hands.',
        bodyAnchor: 'neutral_space'
      },
      {
        stageNumber: 4,
        stageName: 'Polite Transactional Nod',
        description: 'Polite affirmative head nod.',
        facialExpression: 'Polite transaction nod'
      }
    ]
  },

  // =========================================================================
  // CATEGORY 9: College, education and work
  // =========================================================================
  {
    id: 'sign-classroom',
    name: 'Classroom / College',
    gloss: 'CLASSROOM / COLLEGE',
    meaning: 'Classroom, college, lecture hall, or school campus',
    category: 'Education and college',
    signLanguage: 'ISL',
    aslComparisonNote: 'In ASL, C-hands circle outward (CLASS) + hands clap (ROOM). In ISL, both flat hands mime pages of open book or outline room boundary.',
    type: 'dynamic_sequence',
    handshape: 'Both flat hands joined at pinky edges opening like a book',
    palmOrientation: 'Palms facing upward',
    movementDescription: 'Palms joined at edges open like a book, followed by room outline',
    twoHanded: true,
    bodyAnchor: 'chest',
    trainingStatus: 'needs_training_data',
    verificationStatus: 'verified_isl',
    description: 'Both flat hands open like a textbook in front of chest representing education',
    tags: ['college', 'class', 'school', 'education', 'study', 'padhai'],
    isModelSupported: false,
    learningOnly: true,
    modelType: 'learning_dictionary',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Book Hinge Handshape',
        description: 'Place both flat hands together palm-to-palm, pinkies facing chest.',
        handshape: 'Closed hands like book',
        bodyAnchor: 'chest'
      },
      {
        stageNumber: 2,
        stageName: 'Opening Book Action',
        description: 'Hinge hands open so palms face ceiling while pinky edges stay connected.',
        movementTrajectory: 'Book opening arc',
        movementArrows: 'opening arc'
      },
      {
        stageNumber: 3,
        stageName: 'Study Reading Glance',
        description: 'Glance down into open palms as if reading a textbook.',
        facialExpression: 'Scholarly focused glance'
      },
      {
        stageNumber: 4,
        stageName: 'Open Book Hold',
        description: 'Hold open book presentation steady for 1 second.',
        bodyAnchor: 'chest'
      }
    ]
  },
  {
    id: 'sign-teacher',
    name: 'Teacher / Instructor',
    gloss: 'TEACHER',
    meaning: 'Teacher, professor, or educational mentor',
    category: 'Education and college',
    signLanguage: 'ISL',
    aslComparisonNote: 'In ASL, flat O-hands move forward from temples (TEACH) + flat hands drop (PERSON). In ISL, hands emit knowledge from forehead forward + person marker.',
    type: 'dynamic_sequence',
    handshape: 'Flat O-hands moving forward from temples into open palms',
    palmOrientation: 'Palms facing each other',
    movementDescription: 'Hands start near temples and push forward into space opening outward',
    twoHanded: true,
    bodyAnchor: 'forehead',
    trainingStatus: 'needs_training_data',
    verificationStatus: 'verified_isl',
    description: 'Both hands move forward from temples radiating knowledge representing teacher',
    tags: ['teacher', 'professor', 'adhyapak', 'guru', 'instructor', 'college'],
    isModelSupported: false,
    learningOnly: true,
    modelType: 'learning_dictionary',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Temple Knowledge Setup',
        description: 'Place both hands near temples with fingers clustered.',
        handshape: 'Clustered hands at temples',
        bodyAnchor: 'forehead'
      },
      {
        stageNumber: 2,
        stageName: 'Forward Imparting Stroke',
        description: 'Move both hands outward and forward away from temples into front space.',
        movementTrajectory: 'Forward knowledge arc',
        movementArrows: 'forward'
      },
      {
        stageNumber: 3,
        stageName: 'Person Marker Descent',
        description: 'Drop both flat hands downward along torso indicating professional role.',
        movementTrajectory: 'Downward person marker',
        movementArrows: 'downward'
      },
      {
        stageNumber: 4,
        stageName: 'Respectful Dignified Expression',
        description: 'Dignified, articulate facial expression.',
        facialExpression: 'Dignified articulate look'
      }
    ]
  },
  {
    id: 'sign-understand',
    name: 'I Understand',
    gloss: 'UNDERSTAND',
    meaning: 'Comprehension, clarity, or acknowledgment of message',
    category: 'Everyday conversation',
    signLanguage: 'ISL',
    aslComparisonNote: 'In ASL, index finger flicks up from fist near forehead like lightbulb. In ISL, index finger taps side of forehead followed by affirmative nod.',
    type: 'static_posture',
    handshape: 'Index finger points to or flicks up near forehead/temple',
    palmOrientation: 'Palm facing signer head',
    movementDescription: 'Index finger taps side of forehead with immediate affirmative head nod',
    twoHanded: false,
    bodyAnchor: 'forehead',
    trainingStatus: 'needs_training_data',
    verificationStatus: 'verified_isl',
    description: 'Index finger touches temple followed by affirmative nod signaling comprehension',
    tags: ['understand', 'comprehend', 'clear', 'samajh', 'education'],
    isModelSupported: false,
    learningOnly: true,
    modelType: 'learning_dictionary',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Index at Temple',
        description: 'Point dominant index finger at the right temple/forehead.',
        handshape: 'Index pointing to temple',
        bodyAnchor: 'forehead'
      },
      {
        stageNumber: 2,
        stageName: 'Tap or Flick Action',
        description: 'Flick index upright or tap temple lightly.',
        movementTrajectory: 'Flick / tap action',
        movementArrows: 'upward flick'
      },
      {
        stageNumber: 3,
        stageName: 'Lightbulb Moment Expression',
        description: 'Eyebrows lift with clear expression of realization.',
        facialExpression: 'Realization / comprehension nod'
      },
      {
        stageNumber: 4,
        stageName: 'Affirmative Confirmation Hold',
        description: 'Firm nod affirming full comprehension.',
        bodyAnchor: 'forehead'
      }
    ]
  },

  // =========================================================================
  // CATEGORY 10: Hobbies, sports and weather
  // =========================================================================
  {
    id: 'sign-weather-rain',
    name: 'Rain / Weather',
    gloss: 'RAIN / WEATHER',
    meaning: 'Rainfall, storm, or precipitation weather condition',
    category: 'Common requests and actions',
    signLanguage: 'ISL',
    aslComparisonNote: 'In ASL, both claw hands drop repeatedly in space. In ISL, both open hands with spread fluttering fingers descend downward simulating rainfall.',
    type: 'dynamic_sequence',
    handshape: 'Both open hands with separated fluttering fingers pointing downward',
    palmOrientation: 'Palms facing downward toward earth',
    movementDescription: 'Both hands flutter fingers while descending downward repeatedly',
    twoHanded: true,
    bodyAnchor: 'forehead',
    trainingStatus: 'needs_training_data',
    verificationStatus: 'verified_isl',
    description: 'Both hands flutter fingers downward repeatedly simulating rainfall',
    tags: ['rain', 'weather', 'monsoon', 'barish', 'water', 'sky'],
    isModelSupported: false,
    learningOnly: true,
    modelType: 'learning_dictionary',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Overhead Starting Height',
        description: 'Raise both open hands above head level, palms facing downward.',
        handshape: 'Spread fingers pointing down',
        bodyAnchor: 'forehead'
      },
      {
        stageNumber: 2,
        stageName: 'Downward Rain Descent',
        description: 'Drop hands smoothly from eye level to chest while fluttering fingers.',
        movementTrajectory: 'Downward descent with flutter',
        movementArrows: 'downward flutter'
      },
      {
        stageNumber: 3,
        stageName: 'Repeated Rain Shower',
        description: 'Raise hands back to eye level and descend a second time.',
        movementTrajectory: 'Second downward descent'
      },
      {
        stageNumber: 4,
        stageName: 'Weather Observation Expression',
        description: 'Look upward slightly as if watching rain clouds.',
        facialExpression: 'Upward observant gaze'
      }
    ]
  },
  {
    id: 'sign-play-game',
    name: 'Play / Game',
    gloss: 'PLAY / GAME',
    meaning: 'Recreation, sports, games, or playful activity',
    category: 'Common requests and actions',
    signLanguage: 'ISL',
    aslComparisonNote: 'In ASL, Y-hands twist at wrists. In ISL, both fists bump together or thumb-index hands flutter playfully back and forth.',
    type: 'dynamic_sequence',
    handshape: 'Both Y-hands or loose fists shaking side-to-side',
    palmOrientation: 'Palms facing body',
    movementDescription: 'Shake both hands side-to-side in cheerful playful motion',
    twoHanded: true,
    bodyAnchor: 'chest',
    trainingStatus: 'needs_training_data',
    verificationStatus: 'verified_isl',
    description: 'Both hands shake in energetic playful rhythm in front of chest',
    tags: ['play', 'game', 'sport', 'recreation', 'khel', 'fun'],
    isModelSupported: false,
    learningOnly: true,
    modelType: 'learning_dictionary',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Playful Handshape',
        description: 'Hold both hands at chest level, thumbs and pinkies out or loose fists.',
        handshape: 'Y-hands / fists',
        bodyAnchor: 'chest'
      },
      {
        stageNumber: 2,
        stageName: 'Wrist Rotation Rhythm',
        description: 'Rotate wrists in alternating arcs back and forth in playful rhythm.',
        movementTrajectory: 'Alternating wrist twist',
        movementArrows: 'rotational twist'
      },
      {
        stageNumber: 3,
        stageName: 'Playful Smile',
        description: 'Wear an energetic, playful smile.',
        facialExpression: 'Energetic cheerful smile'
      },
      {
        stageNumber: 4,
        stageName: 'Energetic Hold',
        description: 'Hold posture with upbeat enthusiasm.',
        bodyAnchor: 'chest'
      }
    ]
  },

  // =========================================================================
  // CATEGORY 11: Body parts, health, doctor and emergencies
  // =========================================================================
  {
    id: 'sign-doctor',
    name: 'Doctor / Medical',
    gloss: 'DOCTOR / MEDICAL',
    meaning: 'Physician, medical doctor, or clinical consultation',
    category: 'Healthcare and emergencies',
    signLanguage: 'ISL',
    aslComparisonNote: 'In ASL, M or D tapped on wrist pulse. In ISL, dominant fingers tap non-dominant wrist pulse (traditional ayurvedic pulse reading mime) or stethoscope around neck.',
    type: 'static_posture',
    handshape: 'Dominant index and middle finger tap pulse on non-dominant wrist',
    palmOrientation: 'Dominant fingers facing downward, non-dominant wrist facing upward',
    movementDescription: 'Two fingers tap the radial artery pulse on non-dominant wrist twice',
    twoHanded: true,
    bodyAnchor: 'wrist',
    trainingStatus: 'trained_model',
    verificationStatus: 'verified_isl',
    description: 'Two fingers tap inner wrist pulse simulating physician pulse examination',
    tags: ['doctor', 'medical', 'physician', 'hospital', 'clinic', 'pulse', 'swasthya'],
    isModelSupported: true,
    learningOnly: false,
    modelType: 'trained_centroid',
    videoUrl: 'https://www.youtube-nocookie.com/embed/HQbntn5ESK0',
    source: 'ISH Shiksha Indian Sign Language Educational Series',
    sourceNote: 'ISH Shiksha verified ISL demonstration: Doctor in Indian Sign Language',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Radial Pulse Grip Setup',
        description: 'Extend dominant index and middle fingers together. Turn non-dominant wrist palm-up.',
        handshape: 'Two pulse-taking fingers',
        bodyAnchor: 'wrist'
      },
      {
        stageNumber: 2,
        stageName: 'Pulse Point Contact',
        description: 'Place pads of both fingers directly over the radial pulse at base of non-dominant thumb.',
        bodyAnchor: 'wrist'
      },
      {
        stageNumber: 3,
        stageName: 'Double Pulse Tap Action',
        description: 'Tap pulse twice with rhythmic medical cadence.',
        movementTrajectory: 'Double pulse tap',
        movementArrows: 'tap-tap'
      },
      {
        stageNumber: 4,
        stageName: 'Professional Clinical Expression',
        description: 'Maintain earnest, attentive clinical expression.',
        facialExpression: 'Attentive professional expression'
      }
    ]
  },
  {
    id: 'sign-pain',
    name: 'Pain / Hurt',
    gloss: 'PAIN / HURT',
    meaning: 'Physical pain, ache, or soreness at body location',
    category: 'Healthcare and emergencies',
    signLanguage: 'ISL',
    aslComparisonNote: 'In ASL, two index fingers twist toward each other near pain site. In ISL, index fingers twist toward each other with pained facial grimace.',
    type: 'static_posture',
    handshape: 'Both index fingers extended pointing toward each other',
    palmOrientation: 'Palms facing body',
    movementDescription: 'Both index fingers twist inward toward each other with clear grimace',
    twoHanded: true,
    bodyAnchor: 'chest',
    trainingStatus: 'trained_model',
    verificationStatus: 'verified_isl',
    description: 'Index fingers twist toward each other near location of discomfort with pained facial grimace',
    tags: ['pain', 'hurt', 'ache', 'dard', 'emergency', 'medical', 'sore'],
    isModelSupported: true,
    learningOnly: false,
    modelType: 'trained_centroid',
    source: 'ISLRTC Syllabus Standard',
    sourceNote: 'Official ISLRTC Dictionary Standard (Video footage pending publication in public ISLRTC archive)',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Facing Index Fingers',
        description: 'Extend both index fingers pointing directly toward one another, separated by 2 inches.',
        handshape: 'Opposed index fingers',
        bodyAnchor: 'chest'
      },
      {
        stageNumber: 2,
        stageName: 'Placement Near Pain Site',
        description: 'Hold fingers in front of affected area (chest, head, abdomen).',
        bodyAnchor: 'chest'
      },
      {
        stageNumber: 3,
        stageName: 'Twisting Contraction',
        description: 'Twist wrists in quick opposing sharp twists toward each other.',
        movementTrajectory: 'Opposing sharp twist',
        movementArrows: 'inward opposing twist'
      },
      {
        stageNumber: 4,
        stageName: 'Essential Pained Facial Grimace',
        description: 'Non-manual marker is critical: squint eyes, furrow brow, and clench teeth expressing pain intensity.',
        facialExpression: 'Pained facial grimace with clenched teeth'
      }
    ]
  },
  {
    id: 'sign-help-urgent',
    name: 'Help / Urgent',
    gloss: 'HELP / URGENT',
    meaning: 'Assistance request, emergency support',
    category: 'Healthcare and emergencies',
    signLanguage: 'ISL',
    aslComparisonNote: 'In ASL, A-fist rests on flat non-dominant palm, both lifting upward. In ISL, A-fist rests on flat palm lifting upward, or two hands wave urgently.',
    type: 'dynamic_sequence',
    handshape: 'Dominant fist with upright thumb resting on flat non-dominant palm',
    palmOrientation: 'Non-dominant palm facing upward',
    movementDescription: 'Both hands elevate upward together in front of chest lifting the fist',
    twoHanded: true,
    bodyAnchor: 'chest',
    trainingStatus: 'trained_model',
    verificationStatus: 'verified_isl',
    description: 'Dominant thumbs-up fist lifted upward by flat non-dominant palm asking for support',
    tags: ['help', 'urgent', 'madad', 'emergency', 'danger', 'rescue'],
    isModelSupported: true,
    learningOnly: false,
    modelType: 'trained_centroid',
    videoUrl: 'https://www.youtube-nocookie.com/embed/d9fEfBJmy0Y',
    source: 'Indian Sign Language RKMVU-CBE (indiansignlanguage.org)',
    sourceNote: 'RKMVU FDMSE Coimbatore verified ISL demonstration: Help in Indian Sign Language',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Platform & Fist Handshape',
        description: 'Hold non-dominant hand flat, palm facing up (the platform). Place dominant thumbs-up fist on top.',
        handshape: 'Fist resting on flat palm',
        bodyAnchor: 'chest'
      },
      {
        stageNumber: 2,
        stageName: 'Starting Mid-Chest Height',
        description: 'Position combined hands at lower chest.',
        bodyAnchor: 'chest'
      },
      {
        stageNumber: 3,
        stageName: 'Upward Lifting Stroke',
        description: 'Lift both hands upward together 4-6 inches in an earnest supporting motion.',
        movementTrajectory: 'Upward lifting trajectory',
        movementArrows: 'upward lift'
      },
      {
        stageNumber: 4,
        stageName: 'Urgent Expressive Request',
        description: 'Engage urgent, beseeching facial expression with direct eye contact.',
        facialExpression: 'Earnest urgent appeal'
      }
    ]
  },
  {
    id: 'sign-hospital',
    name: 'Where is the hospital?',
    gloss: 'HOSPITAL',
    meaning: 'Inquiry for hospital, medical center, or emergency clinic',
    category: 'Healthcare and emergencies',
    signLanguage: 'ISL',
    aslComparisonNote: 'In ASL, H-hand draws cross on shoulder. In ISL, index finger traces red cross (+) on upper arm or chest.',
    type: 'dynamic_sequence',
    handshape: 'Index finger or H-handshape tracing a cross',
    palmOrientation: 'Palm facing toward opposite upper arm or chest',
    movementDescription: 'Trace a vertical line then horizontal line forming a medical cross (+) on upper arm',
    twoHanded: false,
    bodyAnchor: 'shoulder',
    trainingStatus: 'needs_training_data',
    verificationStatus: 'verified_isl',
    description: 'Index finger traces medical cross (+) on opposite shoulder or upper arm',
    tags: ['hospital', 'clinic', 'medical center', 'aspatal', 'emergency'],
    isModelSupported: false,
    learningOnly: true,
    modelType: 'learning_dictionary',
    source: 'Official ISLRTC Educational Series',
    sourceNote: 'Official ISLRTC Healthcare Series (Video footage pending publication in public ISLRTC archive)',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Tracing Finger Setup',
        description: 'Extend dominant index finger. Point at opposite upper arm / deltoid.',
        handshape: 'Index finger pointer',
        bodyAnchor: 'shoulder'
      },
      {
        stageNumber: 2,
        stageName: 'Vertical Stroke',
        description: 'Draw a downward vertical line (2 inches) on arm.',
        movementTrajectory: 'Downward vertical stroke',
        movementArrows: 'vertical down'
      },
      {
        stageNumber: 3,
        stageName: 'Horizontal Cross Stroke',
        description: 'Draw a horizontal crossing line (2 inches) forming the red cross emblem.',
        movementTrajectory: 'Horizontal crossing stroke',
        movementArrows: 'horizontal across'
      },
      {
        stageNumber: 4,
        stageName: 'Inquiring Urgent Look',
        description: 'If asking "Where?", raise eyebrows and scan surroundings with urgency.',
        facialExpression: 'Urgent inquiring expression'
      }
    ]
  },
  {
    id: 'sign-medicine',
    name: 'Medicine / Tablet',
    gloss: 'MEDICINE / TABLET',
    meaning: 'Medication, pills, prescription, or pharmacy',
    category: 'Healthcare and emergencies',
    signLanguage: 'ISL',
    aslComparisonNote: 'In ASL, middle finger grinds in palm (mortar and pestle). In ISL, middle finger grinds in palm or thumb-index places pill on tongue.',
    type: 'dynamic_sequence',
    handshape: 'Dominant middle finger grinds in non-dominant flat palm',
    palmOrientation: 'Non-dominant palm facing up',
    movementDescription: 'Circular grinding motion of middle fingertip in center of palm simulating pill preparation',
    twoHanded: true,
    bodyAnchor: 'chest',
    trainingStatus: 'needs_training_data',
    verificationStatus: 'verified_isl',
    description: 'Middle finger rubs in small circle inside open palm simulating crushing medicine',
    tags: ['medicine', 'tablet', 'pill', 'dawa', 'pharmacy', 'prescription'],
    isModelSupported: false,
    learningOnly: true,
    modelType: 'learning_dictionary',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Palm & Mortar Handshape',
        description: 'Non-dominant palm flat facing up. Dominant middle finger extended downward.',
        handshape: 'Middle finger in palm',
        bodyAnchor: 'chest'
      },
      {
        stageNumber: 2,
        stageName: 'Contact Point',
        description: 'Rest tip of middle finger in center of flat palm.',
        bodyAnchor: 'chest'
      },
      {
        stageNumber: 3,
        stageName: 'Circular Grinding Motion',
        description: 'Twist middle fingertip in two small circular grinding movements.',
        movementTrajectory: 'Circular grinding twist',
        movementArrows: 'circular'
      },
      {
        stageNumber: 4,
        stageName: 'Serious Health Expression',
        description: 'Serious, focused facial expression.',
        facialExpression: 'Serious medical focus'
      }
    ]
  },

  // =========================================================================
  // CATEGORY 12: Technology and communication
  // =========================================================================
  {
    id: 'sign-tech-mobile',
    name: 'Mobile / Phone',
    gloss: 'MOBILE / PHONE',
    meaning: 'Cell phone, telephone call, or smartphone',
    category: 'Everyday conversation',
    signLanguage: 'ISL',
    aslComparisonNote: 'In ASL, Y-hand held to ear (classic receiver). In ISL, thumb-to-ear/pinky-to-mouth or flat hand held against ear simulating smartphone.',
    type: 'static_posture',
    handshape: 'Y-handshape or flat palm held to ear simulating phone',
    palmOrientation: 'Palm facing side of head',
    movementDescription: 'Thumb held to ear and pinky toward mouth simulating telephone receiver',
    twoHanded: false,
    bodyAnchor: 'forehead',
    trainingStatus: 'needs_training_data',
    verificationStatus: 'verified_isl',
    description: 'Y-handshape held against ear and mouth simulating mobile telephone call',
    tags: ['mobile', 'phone', 'call', 'telephone', 'smartphone'],
    isModelSupported: false,
    learningOnly: true,
    modelType: 'learning_dictionary',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Phone Receiver Handshape',
        description: 'Extend thumb and pinky, curl index, middle, and ring fingers tightly.',
        handshape: 'Y-handshape phone',
        bodyAnchor: 'forehead'
      },
      {
        stageNumber: 2,
        stageName: 'Ear & Mouth Placement',
        description: 'Place thumb against right ear and aim pinky toward corner of mouth.',
        bodyAnchor: 'forehead'
      },
      {
        stageNumber: 3,
        stageName: 'Conversational Nod',
        description: 'Nod slightly as if speaking to someone on the line.',
        movementTrajectory: 'Gentle conversational nod'
      },
      {
        stageNumber: 4,
        stageName: 'Communicative Expression',
        description: 'Hold with communicative, engaged facial expression.',
        facialExpression: 'Engaged telephone expression'
      }
    ]
  },
  {
    id: 'sign-tech-computer',
    name: 'Computer / Laptop',
    gloss: 'COMPUTER / LAPTOP',
    meaning: 'Personal computer, laptop, or keyboard typing',
    category: 'Education and college',
    signLanguage: 'ISL',
    aslComparisonNote: 'In ASL, C-hand arches over arm. In ISL, both hands mime typing on a keyboard or folding screen open.',
    type: 'dynamic_sequence',
    handshape: 'Both open hands with curved fingers miming rapid keyboard typing',
    palmOrientation: 'Palms facing down toward desk level',
    movementDescription: 'Wiggle fingertips downward in space simulating typing on keyboard',
    twoHanded: true,
    bodyAnchor: 'neutral_space',
    trainingStatus: 'needs_training_data',
    verificationStatus: 'verified_isl',
    description: 'Iconic computing sign simulating typing on keyboard',
    tags: ['technology', 'computer', 'laptop', 'typing', 'digital'],
    isModelSupported: false,
    learningOnly: true,
    modelType: 'learning_dictionary',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Typing Mime Setup',
        description: 'Position both hands palm-down at waist height, fingers slightly curved.',
        handshape: 'Curved typing fingers',
        bodyAnchor: 'neutral_space'
      },
      {
        stageNumber: 2,
        stageName: 'Keyboard Level Placement',
        description: 'Hold hands 8 inches apart over imaginary desk.',
        bodyAnchor: 'chest'
      },
      {
        stageNumber: 3,
        stageName: 'Fingertip Flutter Typing',
        description: 'Flutter fingers rapidly up and down as if typing on keyboard.',
        movementTrajectory: 'Finger tapping oscillation',
        movementArrows: 'rapid tap flutter'
      },
      {
        stageNumber: 4,
        stageName: 'Screen Focus Expression',
        description: 'Focused eyes gazing at imaginary computer monitor.',
        facialExpression: 'Focused digital gaze'
      }
    ]
  },
  {
    id: 'sign-tech-message',
    name: 'Message / SMS / Text',
    gloss: 'MESSAGE / SMS',
    meaning: 'Text message, SMS, chat message, or notification',
    category: 'Everyday conversation',
    signLanguage: 'ISL',
    aslComparisonNote: 'In ASL, thumbs mime texting on phone. In ISL, two thumbs mime rapid typing on mobile phone screen.',
    type: 'dynamic_sequence',
    handshape: 'Both thumbs wiggling in front of palms simulating texting on smartphone',
    palmOrientation: 'Palms facing each other',
    movementDescription: 'Both thumbs tap rapidly in center space as if typing a text on a phone',
    twoHanded: true,
    bodyAnchor: 'neutral_space',
    trainingStatus: 'needs_training_data',
    verificationStatus: 'verified_isl',
    description: 'Both thumbs mime typing text message on smartphone screen',
    tags: ['message', 'sms', 'text', 'chat', 'sandesh', 'phone'],
    isModelSupported: false,
    learningOnly: true,
    modelType: 'learning_dictionary',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Smartphone Grip Handshape',
        description: 'Both hands held close together at mid-chest as if holding a mobile phone.',
        handshape: 'Dual phone grip',
        bodyAnchor: 'chest'
      },
      {
        stageNumber: 2,
        stageName: 'Thumb Texting Motion',
        description: 'Move both thumbs rapidly in alternating taps over the center screen space.',
        movementTrajectory: 'Rapid alternating thumb taps',
        movementArrows: 'alternating thumb taps'
      },
      {
        stageNumber: 3,
        stageName: 'Send Flick',
        description: 'Flick dominant index finger forward to indicate sending the message.',
        movementTrajectory: 'Forward send flick',
        movementArrows: 'forward'
      },
      {
        stageNumber: 4,
        stageName: 'Communicative Smile',
        description: 'Friendly smiling expression acknowledging sent text.',
        facialExpression: 'Friendly text smile'
      }
    ]
  },
  {
    id: 'sign-metro-card',
    name: 'Metro Card / Transit Card (Sample)',
    gloss: 'METRO CARD / SMART CARD',
    meaning: 'Transit contactless card tap gesture at automated fare gates',
    category: 'Travel and transportation',
    primaryCategory: 'Directions',
    signLanguage: 'ISL',
    aslComparisonNote: 'Colloquial transit sign in Indian cities like Delhi and Bengaluru.',
    type: 'dynamic_sequence',
    handshape: 'Flat card grip with thumb and index finger',
    palmOrientation: 'Palm facing downward toward sensor gate',
    movementDescription: 'Tap card forward against an invisible turnstile sensor pad twice',
    twoHanded: false,
    bodyAnchor: 'neutral_space',
    trainingStatus: 'needs_training_data',
    verificationStatus: 'heuristic_prototype',
    source: 'Community Transit Neologism (Under ISLRTC Standardization Review)',
    sourceNote: 'Unverified Community Sample — Awaiting Certified Deaf Panel Validation',
    description: 'Holding an imaginary smartcard and tapping against a sensor gate',
    tags: ['metro', 'card', 'transit', 'ticket', 'station', 'travel', 'bus', 'train'],
    isModelSupported: false,
    learningOnly: true,
    modelType: 'learning_dictionary',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Card Pinch Handshape',
        description: 'Pinch thumb and index fingers together as if holding a plastic transit card.',
        handshape: 'Precision pinch grip',
        bodyAnchor: 'neutral_space'
      },
      {
        stageNumber: 2,
        stageName: 'Approach Sensor Pad',
        description: 'Extend pinched hand forward toward waist-height imaginary reader.',
        movementTrajectory: 'Forward approach',
        movementArrows: 'forward'
      },
      {
        stageNumber: 3,
        stageName: 'Sensor Tap Stroke',
        description: 'Tap downward firmly twice against the imaginary turnstile sensor.',
        movementTrajectory: 'Double tap gesture',
        movementArrows: 'downward double tap'
      },
      {
        stageNumber: 4,
        stageName: 'Passing Through Hold',
        description: 'Step or lean slightly forward indicating walking through the gate.',
        facialExpression: 'Neutral transit focus'
      }
    ]
  },
  {
    id: 'sign-video-call',
    name: 'Video Call / Screen Meet (Sample)',
    gloss: 'VIDEO CALL / VIRTUAL MEET',
    meaning: 'Holding phone in front and signing/waving at screen',
    category: 'Everyday conversation',
    primaryCategory: 'Daily Needs',
    signLanguage: 'ISL',
    aslComparisonNote: 'Colloquial modern visual communication slang.',
    type: 'dynamic_sequence',
    handshape: 'Non-dominant hand flat screen surface; dominant V-hand signing at it',
    palmOrientation: 'Non-dominant palm facing chest; dominant fingers toward palm',
    movementDescription: 'Non-dominant hand creates screen surface while dominant hand signs into it',
    twoHanded: true,
    bodyAnchor: 'chest',
    trainingStatus: 'needs_training_data',
    verificationStatus: 'heuristic_prototype',
    source: 'Youth Community Informal Expression (Non-Canonical)',
    sourceNote: 'Unverified Community Sample — Awaiting Certified Deaf Panel Validation',
    description: 'One hand holds up screen while other hand signs into camera lens',
    tags: ['video call', 'online', 'screen', 'zoom', 'meeting', 'phone', 'chat'],
    isModelSupported: false,
    learningOnly: true,
    modelType: 'learning_dictionary',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Screen Formation',
        description: 'Hold non-dominant flat palm upright facing your chest (acting as the phone screen).',
        handshape: 'Flat upright palm screen',
        bodyAnchor: 'chest'
      },
      {
        stageNumber: 2,
        stageName: 'Camera Interaction',
        description: 'Dominant hand gestures toward the flat palm screen.',
        movementTrajectory: 'Interaction toward screen',
        movementArrows: 'toward screen palm'
      },
      {
        stageNumber: 3,
        stageName: 'Greeting Screen',
        description: 'Give a small friendly wave directly at the flat palm surface.',
        movementTrajectory: 'Mini wave at screen',
        movementArrows: 'gentle wave'
      },
      {
        stageNumber: 4,
        stageName: 'Attentive Gaze',
        description: 'Engage focused, friendly eye contact looking into the flat palm.',
        facialExpression: 'Warm conversational engagement'
      }
    ]
  }  ,
  {
    id: 'sign-student',
    name: 'Student / Learner',
    gloss: 'STUDENT',
    meaning: 'Person engaged in learning or school education',
    category: 'Education and college',
    signLanguage: 'ISL',
    aslComparisonNote: 'In ISL, STUDENT gathers knowledge from the open palm to the temple in a distinct graceful two-part sequence.',
    type: 'dynamic_sequence',
    handshape: 'Non-dominant flat open palm; dominant cupped hand gathering from palm to forehead',
    palmOrientation: 'Left palm facing upward, right hand cupped inward',
    movementDescription: 'Dominant fingertips touch open base palm as if taking knowledge, then rise up to touch the temple/forehead',
    twoHanded: true,
    bodyAnchor: 'forehead',
    trainingStatus: 'needs_training_data',
    verificationStatus: 'verified_isl',
    description: 'Two-handed knowledge-gathering movement from base palm to temple indicating learning/student',
    tags: ['student', 'learner', 'education', 'college', 'school', 'study', 'class'],
    isModelSupported: false,
    learningOnly: true,
    modelType: 'learning_dictionary',
    source: 'ISLRTC Syllabus Standard',
    sourceNote: 'Official ISLRTC Dictionary Standard (Online video footage reference)',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Knowledge Base Palm',
        description: 'Hold non-dominant hand flat open facing upward at chest level like a page of knowledge.',
        handshape: 'Flat open palm facing up',
        bodyAnchor: 'chest'
      },
      {
        stageNumber: 2,
        stageName: 'Gathering Knowledge',
        description: 'Dominant fingertips gently brush the open palm, gathering knowledge upward.',
        movementTrajectory: 'Brush palm upward'
      },
      {
        stageNumber: 3,
        stageName: 'Temple Assimilation',
        description: 'Raise dominant fingertips to touch the temple, symbolizing internalization into the mind.',
        bodyAnchor: 'forehead'
      },
      {
        stageNumber: 4,
        stageName: 'Attentive Demeanor',
        description: 'Maintain attentive, earnest facial expression of a dedicated learner.',
        facialExpression: 'Focused, inquisitive smile'
      }
    ]
  },
  {
    id: 'sign-book',
    name: 'Book / Study',
    gloss: 'BOOK',
    meaning: 'Bound publication or study book',
    category: 'Education and college',
    signLanguage: 'ISL',
    aslComparisonNote: 'ISL and ASL share the iconic book-opening gesture with subtle variations in wrist hinge height.',
    type: 'dynamic_sequence',
    handshape: 'Both flat palms pressed together edge to edge, opening like book covers',
    palmOrientation: 'Palms together then hinged open facing upward',
    movementDescription: 'Hands open outward keeping the pinky finger edges joined together at chest level',
    twoHanded: true,
    bodyAnchor: 'chest',
    trainingStatus: 'needs_training_data',
    verificationStatus: 'verified_isl',
    description: 'Iconic two-handed sign representing opening the pages of a book',
    tags: ['book', 'read', 'study', 'education', 'college', 'literature'],
    isModelSupported: false,
    learningOnly: true,
    modelType: 'learning_dictionary',
    source: 'ISLRTC Syllabus Standard',
    sourceNote: 'Official ISLRTC Dictionary Standard',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Closed Book Position',
        description: 'Place both flat open palms together in front of the chest, fingers pointing forward.',
        handshape: 'Flat palms pressed together',
        bodyAnchor: 'chest'
      },
      {
        stageNumber: 2,
        stageName: 'Hinged Opening',
        description: 'Hinge both palms open while keeping pinky finger edges joined together, like opening book covers.',
        movementTrajectory: 'Open outward like book'
      },
      {
        stageNumber: 3,
        stageName: 'Reading Focus',
        description: 'Hold open palms facing upward at chest level as if reading.',
        bodyAnchor: 'chest'
      },
      {
        stageNumber: 4,
        stageName: 'Intellectual Attention',
        description: 'Gaze downward at open palms with clear intellectual engagement.',
        facialExpression: 'Focused reading gaze'
      }
    ]
  },
  {
    id: 'sign-question-what',
    name: 'What? / What is this?',
    gloss: 'WHAT',
    meaning: 'Fundamental question asking for identity, meaning, or explanation',
    category: 'Questions and answers',
    signLanguage: 'ISL',
    aslComparisonNote: 'In ISL, WHAT uses a gentle lateral open palm shake with furrowed brows at waist level, distinct from ASL fingertip sweep.',
    type: 'dynamic_sequence',
    handshape: 'Both open hands held at waist/chest level, palms facing upward',
    palmOrientation: 'Palms facing upward',
    movementDescription: 'Both open hands oscillate side to side gently while furrowing eyebrows in inquiry',
    twoHanded: true,
    bodyAnchor: 'neutral_space',
    trainingStatus: 'needs_training_data',
    verificationStatus: 'verified_isl',
    description: 'Open palms shaking side to side with inquisitive facial expression',
    tags: ['what', 'question', 'inquiry', 'curious', 'query'],
    isModelSupported: false,
    learningOnly: true,
    modelType: 'learning_dictionary',
    source: 'ISLRTC Syllabus Standard',
    sourceNote: 'Official ISLRTC Dictionary Standard',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Open Upward Palms',
        description: 'Extend both hands forward at lower chest level with palms facing upward.',
        handshape: 'Open relaxed palms up',
        bodyAnchor: 'neutral_space'
      },
      {
        stageNumber: 2,
        stageName: 'Lateral Oscillation',
        description: 'Shake hands gently side to side simultaneously 2-3 times.',
        movementTrajectory: 'Gentle lateral shake'
      },
      {
        stageNumber: 3,
        stageName: 'Inquisitive Eyebrows',
        description: 'Furrow eyebrows and tilt head slightly forward to convey genuine grammatical WH-question.',
        facialExpression: 'Furrowed questioning brows'
      },
      {
        stageNumber: 4,
        stageName: 'Resolution Pause',
        description: 'Hold hands open at the end of the stroke awaiting response.',
        bodyAnchor: 'neutral_space'
      }
    ]
  },
  {
    id: 'sign-question-when',
    name: 'When? / Time Question',
    gloss: 'WHEN',
    meaning: 'Question asking for time, date, day, or schedule',
    category: 'Questions and answers',
    signLanguage: 'ISL',
    aslComparisonNote: 'ISL WHEN emphasizes temporal circling around the time anchor or wrist watch position.',
    type: 'dynamic_sequence',
    handshape: 'Dominant index finger pointing, completing circular revolution around non-dominant index finger',
    palmOrientation: 'Palms facing signer',
    movementDescription: 'Dominant index finger makes a clockwise circular loop and touches the non-dominant index fingertip',
    twoHanded: true,
    bodyAnchor: 'hand',
    trainingStatus: 'needs_training_data',
    verificationStatus: 'verified_isl',
    description: 'Circular time revolution stroke around non-dominant index fingertip indicating temporal query',
    tags: ['when', 'time', 'date', 'question', 'schedule', 'timing'],
    isModelSupported: false,
    learningOnly: true,
    modelType: 'learning_dictionary',
    source: 'ISLRTC Syllabus Standard',
    sourceNote: 'Official ISLRTC Dictionary Standard',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Base Finger Position',
        description: 'Hold non-dominant index finger upright in conversational chest space.',
        handshape: 'Upright index finger',
        bodyAnchor: 'chest'
      },
      {
        stageNumber: 2,
        stageName: 'Clockwise Arc',
        description: 'Dominant index finger circles forward and around the base finger like an orbit of time.',
        movementTrajectory: 'Clockwise circular revolution'
      },
      {
        stageNumber: 3,
        stageName: 'Contact Landing',
        description: 'Land the dominant index tip cleanly upon the base index fingertip.',
        bodyAnchor: 'hand'
      },
      {
        stageNumber: 4,
        stageName: 'Temporal Questioning',
        description: 'Maintain inquisitive expression with furrowed eyebrows.',
        facialExpression: 'Curious temporal inquiry'
      }
    ]
  },
  {
    id: 'sign-question-why',
    name: 'Why? / Reason Question',
    gloss: 'WHY',
    meaning: 'Inquiry asking for reason, purpose, or rationale',
    category: 'Questions and answers',
    signLanguage: 'ISL',
    aslComparisonNote: 'In ISL, WHY originates directly at the temple and pulls outward, reflecting cognitive cause.',
    type: 'dynamic_sequence',
    handshape: 'Hand touching temple/forehead, pulling forward with bent fingers or Y-configuration',
    palmOrientation: 'Palm facing temple then outward',
    movementDescription: 'Touch side of forehead lightly, then pull hand forward and outward into conversational space',
    twoHanded: false,
    bodyAnchor: 'forehead',
    trainingStatus: 'needs_training_data',
    verificationStatus: 'verified_isl',
    description: 'Mental cognitive extraction stroke from temple forward with furrowed brows asking for reasons',
    tags: ['why', 'reason', 'purpose', 'cause', 'question'],
    isModelSupported: false,
    learningOnly: true,
    modelType: 'learning_dictionary',
    source: 'ISLRTC Syllabus Standard',
    sourceNote: 'Official ISLRTC Dictionary Standard',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Temple Touch',
        description: 'Place dominant fingertips gently against the temple at forehead level.',
        handshape: 'Fingertips touching temple',
        bodyAnchor: 'forehead'
      },
      {
        stageNumber: 2,
        stageName: 'Outward Inquiry Pull',
        description: 'Pull the hand outward and slightly down into conversational space.',
        movementTrajectory: 'Outward pulling stroke'
      },
      {
        stageNumber: 3,
        stageName: 'Inquisitive Palm Release',
        description: 'Release hand with palm slightly tilted upward toward partner.',
        bodyAnchor: 'neutral_space'
      },
      {
        stageNumber: 4,
        stageName: 'Searching Expression',
        description: 'Furrow eyebrows tightly with an expression searching for an explanation.',
        facialExpression: 'Inquisitive furrowed brows'
      }
    ]
  },
  {
    id: 'sign-question-how',
    name: 'How? / How is it?',
    gloss: 'HOW',
    meaning: 'Inquiry asking for manner, procedure, method, or health state',
    category: 'Questions and answers',
    signLanguage: 'ISL',
    aslComparisonNote: 'ISL HOW features both curved hands twisting outward from back-of-fingers to open palms.',
    type: 'dynamic_sequence',
    handshape: 'Both curved hands back of knuckles touching, rolling outward to open palms up',
    palmOrientation: 'Knuckles touching downward, rolling outward to palms facing up',
    movementDescription: 'Simultaneous outward rotation of both wrists ending with open palms facing upward',
    twoHanded: true,
    bodyAnchor: 'chest',
    trainingStatus: 'needs_training_data',
    verificationStatus: 'verified_isl',
    description: 'Two-handed outward rolling stroke ending with open palms up signaling inquiry',
    tags: ['how', 'method', 'manner', 'process', 'question', 'how are you'],
    isModelSupported: false,
    learningOnly: true,
    modelType: 'learning_dictionary',
    source: 'ISLRTC Syllabus Standard',
    sourceNote: 'Official ISLRTC Dictionary Standard',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Knuckle Contact Position',
        description: 'Place back of bent fingers together at chest level, palms facing downward/inward.',
        handshape: 'Curved hands with knuckles touching',
        bodyAnchor: 'chest'
      },
      {
        stageNumber: 2,
        stageName: 'Outward Rolling Motion',
        description: 'Roll wrists simultaneously outward and forward in a fluid arc.',
        movementTrajectory: 'Outward rolling arc'
      },
      {
        stageNumber: 3,
        stageName: 'Open Upward Palms',
        description: 'End with both open palms facing upward toward the conversational partner.',
        bodyAnchor: 'chest'
      },
      {
        stageNumber: 4,
        stageName: 'Questioning Smile',
        description: 'Adopt an open, expectant inquiring facial expression.',
        facialExpression: 'Open questioning expression'
      }
    ]
  },
  {
    id: 'sign-emergency-need-help',
    name: 'I need help',
    gloss: 'I NEED HELP',
    meaning: 'Urgent emergency request for immediate physical or medical assistance',
    category: 'Healthcare and emergencies',
    signLanguage: 'ISL',
    aslComparisonNote: 'ISL urgent assistance uses an assertive upward lift of the fist upon supporting base palm.',
    type: 'dynamic_sequence',
    handshape: 'Non-dominant flat open palm up; dominant fist resting on palm, lifting upward urgently',
    palmOrientation: 'Base palm facing up, dominant fist upright',
    movementDescription: 'Dominant fist rests firmly on base palm, then both hands elevate upward toward chest',
    twoHanded: true,
    bodyAnchor: 'chest',
    trainingStatus: 'needs_training_data',
    verificationStatus: 'verified_isl',
    description: 'Urgent two-handed support lifting gesture expressing immediate requirement for help',
    tags: ['i need help', 'help', 'emergency', 'urgent', 'sos', 'assistance', 'rescue'],
    isModelSupported: false,
    learningOnly: true,
    modelType: 'learning_dictionary',
    source: 'ISLRTC Syllabus Standard',
    sourceNote: 'Official ISLRTC Dictionary Standard (Emergency Protocols)',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Support Palm Platform',
        description: 'Extend non-dominant hand flat open facing upward at waist level.',
        handshape: 'Flat open palm up',
        bodyAnchor: 'neutral_space'
      },
      {
        stageNumber: 2,
        stageName: 'Clenched Urgent Fist',
        description: 'Place dominant clenched fist directly upon the open palm.',
        handshape: 'Clenched fist on palm',
        bodyAnchor: 'hand'
      },
      {
        stageNumber: 3,
        stageName: 'Upward Urgent Elevation',
        description: 'Lift both hands together firmly upward toward chest level with urgency.',
        movementTrajectory: 'Firm upward elevation'
      },
      {
        stageNumber: 4,
        stageName: 'Urgent Facial Appeal',
        description: 'Express serious concern and urgency with alert, direct eye contact.',
        facialExpression: 'Urgent, serious plea'
      }
    ]
  },
  {
    id: 'sign-ambulance',
    name: 'Call an ambulance',
    gloss: 'CALL AMBULANCE',
    meaning: 'Emergency call for an ambulance and urgent medical paramedic transport',
    category: 'Healthcare and emergencies',
    signLanguage: 'ISL',
    aslComparisonNote: 'ISL AMBULANCE combines phone calling with the iconic rotating emergency siren beacon overhead.',
    type: 'dynamic_sequence',
    handshape: 'Phone receiver handshape at ear, followed by rotating open palm overhead mimicking emergency beacon',
    palmOrientation: 'Hand at ear, then palm downward rotating overhead',
    movementDescription: 'Quick phone gesture at ear transitioning to revolving siren light above head',
    twoHanded: false,
    bodyAnchor: 'neutral_space',
    trainingStatus: 'needs_training_data',
    verificationStatus: 'verified_isl',
    description: 'Iconic emergency sign combining calling emergency services and rotating siren light',
    tags: ['ambulance', 'call an ambulance', 'hospital', 'medical', 'emergency', 'paramedic', 'urgent', '108'],
    isModelSupported: false,
    learningOnly: true,
    modelType: 'learning_dictionary',
    source: 'ISLRTC Syllabus Standard',
    sourceNote: 'Official ISLRTC Dictionary Standard (Medical Emergency Services)',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Phone Receiver Call',
        description: 'Hold thumb and pinky extended (phone handshape) near ear, indicating emergency call.',
        handshape: 'Y-handshape at ear',
        bodyAnchor: 'forehead'
      },
      {
        stageNumber: 2,
        stageName: 'Raise Overhead',
        description: 'Raise dominant hand overhead with fingers curved downward like an ambulance light beacon.',
        handshape: 'Curved palm facing down',
        bodyAnchor: 'neutral_space'
      },
      {
        stageNumber: 3,
        stageName: 'Rotating Siren Beacon',
        description: 'Rotate the hand rapidly in small horizontal circles overhead, mimicking emergency flashing light.',
        movementTrajectory: 'Rapid circular rotation overhead'
      },
      {
        stageNumber: 4,
        stageName: 'Critical Alert Demeanor',
        description: 'Maintain intense, focused emergency expression indicating critical life situation.',
        facialExpression: 'Urgent emergency alert'
      }
    ]
  },
  {
    id: 'sign-wait',
    name: 'Wait / Wait a moment',
    gloss: 'WAIT',
    meaning: 'Request to hold on, pause, or have patience',
    category: 'Common requests and actions',
    signLanguage: 'ISL',
    aslComparisonNote: 'ISL WAIT uses flat palms pulsing downward, signaling calm spatial stillness.',
    type: 'dynamic_sequence',
    handshape: 'Both open flat palms facing downward at chest level',
    palmOrientation: 'Palms facing downward',
    movementDescription: 'Both open hands gently press downward in small pulsing motions signaling patience',
    twoHanded: true,
    bodyAnchor: 'chest',
    trainingStatus: 'needs_training_data',
    verificationStatus: 'verified_isl',
    description: 'Gentle downward spatial pressing pulses of open palms requesting patience or pause',
    tags: ['wait', 'pause', 'hold on', 'stay', 'moment', 'patience'],
    isModelSupported: false,
    learningOnly: true,
    modelType: 'learning_dictionary',
    source: 'ISLRTC Syllabus Standard',
    sourceNote: 'Official ISLRTC Dictionary Standard',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Downward Palms Placement',
        description: 'Extend both hands in front of the chest with palms facing downward and fingers relaxed.',
        handshape: 'Open flat palms down',
        bodyAnchor: 'chest'
      },
      {
        stageNumber: 2,
        stageName: 'Downward Pressing Pulse',
        description: 'Press both hands gently downward 2-3 inches in a calming, measured pulse.',
        movementTrajectory: 'Downward pulsing press'
      },
      {
        stageNumber: 3,
        stageName: 'Stillness Hold',
        description: 'Hold hands suspended momentarily to reinforce the pause.',
        bodyAnchor: 'chest'
      },
      {
        stageNumber: 4,
        stageName: 'Reassuring Expression',
        description: 'Maintain polite, reassuring facial expression conveying patience.',
        facialExpression: 'Reassuring, calm smile'
      }
    ]
  },
  {
    id: 'sign-work-job',
    name: 'Work / Job / Office',
    gloss: 'WORK / JOB',
    meaning: 'Professional duty, employment, occupation, or daily work task',
    category: 'Work and occupations',
    signLanguage: 'ISL',
    aslComparisonNote: 'ISL WORK features rhythmic downward tapping of dominant wrist onto base wrist.',
    type: 'dynamic_sequence',
    handshape: 'Both hands curled into relaxed fists, dominant wrist tapping base wrist',
    palmOrientation: 'Palms facing downward/inward',
    movementDescription: 'Dominant wrist taps down twice onto the back of non-dominant wrist',
    twoHanded: true,
    bodyAnchor: 'wrist',
    trainingStatus: 'needs_training_data',
    verificationStatus: 'verified_isl',
    description: 'Rhythmic downward wrist-tapping movement indicating professional duty or employment',
    tags: ['work', 'job', 'office', 'profession', 'occupation', 'duty', 'business'],
    isModelSupported: false,
    learningOnly: true,
    modelType: 'learning_dictionary',
    source: 'ISLRTC Syllabus Standard',
    sourceNote: 'Official ISLRTC Dictionary Standard',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Base Wrist Platform',
        description: 'Hold non-dominant fist horizontal in front of chest, back of wrist facing upward.',
        handshape: 'Horizontal base fist',
        bodyAnchor: 'chest'
      },
      {
        stageNumber: 2,
        stageName: 'Dominant Wrist Tapping',
        description: 'Bring dominant fist down, tapping base of wrist against the lower wrist twice.',
        movementTrajectory: 'Double downward tap'
      },
      {
        stageNumber: 3,
        stageName: 'Rhythmic Contact',
        description: 'Ensure clean rhythmic contact conveying productive discipline.',
        bodyAnchor: 'wrist'
      },
      {
        stageNumber: 4,
        stageName: 'Professional Focus',
        description: 'Adopt serious, diligent facial expression of focused commitment.',
        facialExpression: 'Diligently focused expression'
      }
    ]
  },
  {
    id: 'sign-directions',
    name: 'Directions / Path / Way',
    gloss: 'DIRECTIONS',
    meaning: 'Wayfinding, route guidance, navigation, or path instructions',
    category: 'Places and directions',
    signLanguage: 'ISL',
    aslComparisonNote: 'ISL uses parallel vertical hands tracing the winding trajectory of a pathway forward.',
    type: 'dynamic_sequence',
    handshape: 'Both flat hands vertical parallel to each other charting a path forward',
    palmOrientation: 'Palms facing each other',
    movementDescription: 'Parallel open hands weave forward together tracing a navigation course',
    twoHanded: true,
    bodyAnchor: 'neutral_space',
    trainingStatus: 'needs_training_data',
    verificationStatus: 'verified_isl',
    description: 'Parallel hands tracing a forward navigation route indicating directions or wayfinding',
    tags: ['directions', 'route', 'path', 'way', 'map', 'navigate', 'location'],
    isModelSupported: false,
    learningOnly: true,
    modelType: 'learning_dictionary',
    source: 'ISLRTC Syllabus Standard',
    sourceNote: 'Official ISLRTC Dictionary Standard',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Parallel Hands Alignment',
        description: 'Hold both flat open hands parallel to each other at chest level, palms facing inward.',
        handshape: 'Vertical parallel open hands',
        bodyAnchor: 'chest'
      },
      {
        stageNumber: 2,
        stageName: 'Forward Winding Trace',
        description: 'Move both hands forward in unison, gently weaving left and right to trace a course.',
        movementTrajectory: 'Forward weaving trace'
      },
      {
        stageNumber: 3,
        stageName: 'Directional Extension',
        description: 'Extend hands toward intended destination point in front of signer.',
        bodyAnchor: 'neutral_space'
      },
      {
        stageNumber: 4,
        stageName: 'Guiding Demeanor',
        description: 'Direct gaze forward along the path with helpful, instructional expression.',
        facialExpression: 'Helpful guiding gaze'
      }
    ]
  },
  {
    id: 'sign-access-deaf',
    name: 'Deaf / Hard of Hearing',
    gloss: 'DEAF',
    meaning: 'Deaf identity, culture, and community membership',
    category: 'Accessibility and public services',
    signLanguage: 'ISL',
    aslComparisonNote: 'Core cultural sign in ISL connecting ear and mouth in a smooth dignified arc.',
    type: 'dynamic_sequence',
    handshape: 'Index finger extended upright, touching near ear then moving to touch near corner of mouth',
    palmOrientation: 'Palm facing inward toward side of face',
    movementDescription: 'Index fingertip touches near earlobe, then moves in a small arc to touch corner of mouth',
    twoHanded: false,
    bodyAnchor: 'chin',
    trainingStatus: 'needs_training_data',
    verificationStatus: 'verified_isl',
    description: 'Fundamental ISL cultural sign connecting ear and mouth indicating Deaf identity',
    tags: ['deaf', 'hard of hearing', 'accessibility', 'community', 'culture', 'hearing'],
    isModelSupported: false,
    learningOnly: true,
    modelType: 'learning_dictionary',
    source: 'ISLRTC Syllabus Standard',
    sourceNote: 'Official ISLRTC Dictionary Standard',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Ear Anchor Touch',
        description: 'Touch dominant index fingertip lightly near the earlobe.',
        handshape: 'Index finger extended',
        bodyAnchor: 'forehead'
      },
      {
        stageNumber: 2,
        stageName: 'Gentle Facial Arc',
        description: 'Move the index fingertip forward across cheek in a gentle downward arc.',
        movementTrajectory: 'Gentle downward facial arc'
      },
      {
        stageNumber: 3,
        stageName: 'Mouth Anchor Touch',
        description: 'Touch lightly near the corner of the mouth.',
        bodyAnchor: 'chin'
      },
      {
        stageNumber: 4,
        stageName: 'Cultural Pride',
        description: 'Maintain proud, warm, affirming facial expression.',
        facialExpression: 'Proud, warm smile'
      }
    ]
  },
  {
    id: 'sign-access-isl',
    name: 'Indian Sign Language (ISL)',
    gloss: 'ISL / SIGN LANGUAGE',
    meaning: 'The natural visual language of the Indian Deaf community',
    category: 'Accessibility and public services',
    signLanguage: 'ISL',
    aslComparisonNote: 'Distinct from ASL signing, ISL uses open revolving hands with fluid spatial grammar.',
    type: 'dynamic_sequence',
    handshape: 'Both open hands with fingers slightly curved, revolving alternate circular paths',
    palmOrientation: 'Palms facing signer and each other',
    movementDescription: 'Both open hands rotate smoothly in alternate circular loops in front of chest',
    twoHanded: true,
    bodyAnchor: 'chest',
    trainingStatus: 'needs_training_data',
    verificationStatus: 'verified_isl',
    description: 'Fluid conversational revolving circles of both hands representing visual ISL communication',
    tags: ['isl', 'sign language', 'indian sign language', 'accessibility', 'language', 'linguistic'],
    isModelSupported: false,
    learningOnly: true,
    modelType: 'learning_dictionary',
    source: 'ISLRTC Syllabus Standard',
    sourceNote: 'Official ISLRTC Dictionary Standard (National Linguistic Heritage)',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Conversational Hand Placement',
        description: 'Hold both open hands at chest level, fingers relaxed and curved, palms facing signer.',
        handshape: 'Open relaxed curved hands',
        bodyAnchor: 'chest'
      },
      {
        stageNumber: 2,
        stageName: 'Alternate Revolving Cycles',
        description: 'Rotate hands in smooth alternate circles cycling backward toward chest and forward outward.',
        movementTrajectory: 'Alternate revolving circles'
      },
      {
        stageNumber: 3,
        stageName: 'Fluid Visual Rhythm',
        description: 'Maintain continuous fluid cadence reflecting natural sign flow.',
        bodyAnchor: 'neutral_space'
      },
      {
        stageNumber: 4,
        stageName: 'Linguistic Pride',
        description: 'Radiate pride in visual linguistic communication and Deaf cultural expression.',
        facialExpression: 'Warm linguistic pride'
      }
    ]
  },
  {
    id: 'sign-public-police',
    name: 'Police / Public Safety',
    gloss: 'POLICE',
    meaning: 'Law enforcement officer, emergency safety, or police station',
    category: 'Accessibility and public services',
    signLanguage: 'ISL',
    aslComparisonNote: 'In ISL, POLICE points to the official shoulder badge / uniform epaulet.',
    type: 'dynamic_sequence',
    handshape: 'Flat hand or C-handshape tapping shoulder epaulet twice',
    palmOrientation: 'Palm facing downward at shoulder',
    movementDescription: 'Fingertips tap dominant shoulder epaulet twice indicating uniform police badge',
    twoHanded: false,
    bodyAnchor: 'shoulder',
    trainingStatus: 'needs_training_data',
    verificationStatus: 'verified_isl',
    description: 'ISL sign for police indicating official uniform shoulder epaulet and public authority',
    tags: ['police', 'cop', 'safety', 'security', 'public services', 'emergency', 'station'],
    isModelSupported: false,
    learningOnly: true,
    modelType: 'learning_dictionary',
    source: 'ISLRTC Syllabus Standard',
    sourceNote: 'Official ISLRTC Dictionary Standard',
    islrtcDictionaryUrl: 'https://islrtc.nic.in/',
    visualStages: [
      {
        stageNumber: 1,
        stageName: 'Shoulder Position',
        description: 'Bring dominant hand up to rest near the dominant shoulder.',
        handshape: 'Fingertips curved toward shoulder',
        bodyAnchor: 'shoulder'
      },
      {
        stageNumber: 2,
        stageName: 'Epaulet Double Tap',
        description: 'Tap fingertips twice against the top of the shoulder indicating officer epaulet.',
        movementTrajectory: 'Double shoulder tap'
      },
      {
        stageNumber: 3,
        stageName: 'Authority Confirmation',
        description: 'Pause briefly to indicate official protective authority.',
        bodyAnchor: 'shoulder'
      },
      {
        stageNumber: 4,
        stageName: 'Firm Alert Expression',
        description: 'Display firm, upright posture and vigilant, protective demeanor.',
        facialExpression: 'Firm, vigilant expression'
      }
    ]
  }
];

export class SignVocabularyService {
  private vocabulary: SignVocabularyItem[] = [...INITIAL_SIGN_VOCABULARY];

  public getAll(): SignVocabularyItem[] {
    return [...this.vocabulary];
  }

  public getById(id: string): SignVocabularyItem | undefined {
    return this.vocabulary.find(s => s.id === id);
  }

  public getByName(name: string): SignVocabularyItem | undefined {
    const q = name.toLowerCase().trim();
    return this.vocabulary.find(s => 
      s.name.toLowerCase() === q || 
      s.gloss.toLowerCase() === q ||
      s.tags.some(t => t.toLowerCase() === q)
    );
  }

  public getByLanguage(language: SignLanguage): SignVocabularyItem[] {
    return this.vocabulary.filter(s => s.signLanguage === language);
  }

  public getModelSupportedSigns(): SignVocabularyItem[] {
    return this.vocabulary.filter(s => s.isModelSupported);
  }

  public getLearningOnlySigns(): SignVocabularyItem[] {
    return this.vocabulary.filter(s => s.learningOnly);
  }

  public getSupportedSigns(): SignVocabularyItem[] {
    return this.getModelSupportedSigns();
  }

  public getSignsRequiringTrainingData(): SignVocabularyItem[] {
    return this.vocabulary.filter(s => s.trainingStatus === 'needs_training_data');
  }

  public getByCategory(category: string): SignVocabularyItem[] {
    if (category === 'all') return [...this.vocabulary];
    return this.vocabulary.filter(s => s.category.toLowerCase() === category.toLowerCase());
  }

  public getByCoreCategory(coreCategory: string): SignVocabularyItem[] {
    if (coreCategory === 'all' || !coreCategory) return [...this.vocabulary];
    return this.vocabulary.filter(s => getCoreCategory(s).toLowerCase() === coreCategory.toLowerCase());
  }

  public getRelatedSigns(signOrId: SignVocabularyItem | string, limit = 4): SignVocabularyItem[] {
    const sign = typeof signOrId === 'string' ? this.getById(signOrId) || this.getByName(signOrId) : signOrId;
    if (!sign) return [];

    // If explicit relatedSignIds exist, fetch those first
    if (sign.relatedSignIds && sign.relatedSignIds.length > 0) {
      const explicit = sign.relatedSignIds
        .map(id => this.getById(id))
        .filter((s): s is SignVocabularyItem => Boolean(s));
      if (explicit.length >= limit) return explicit.slice(0, limit);
    }

    const signCoreCat = getCoreCategory(sign);
    const signTags = new Set(sign.tags.map(t => t.toLowerCase()));

    // Rank other signs by category similarity, anchor similarity, and tag overlap
    const scored = this.vocabulary
      .filter(s => s.id !== sign.id)
      .map(other => {
        let score = 0;
        if (getCoreCategory(other) === signCoreCat) score += 3;
        if (other.bodyAnchor === sign.bodyAnchor) score += 1;
        for (const tag of other.tags) {
          if (signTags.has(tag.toLowerCase())) score += 2;
        }
        return { item: other, score };
      })
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(x => x.item);

    return scored.slice(0, limit);
  }

  public getMetrics(): { total: number; modelSupported: number; learningOnly: number; categoriesCount: number } {
    return {
      total: this.vocabulary.length,
      modelSupported: this.vocabulary.filter(s => s.isModelSupported).length,
      learningOnly: this.vocabulary.filter(s => s.learningOnly).length,
      categoriesCount: VOCABULARY_BOOK_CATEGORIES.length
    };
  }

  public registerSign(item: SignVocabularyItem): void {
    const existingIdx = this.vocabulary.findIndex(s => s.id === item.id);
    if (existingIdx >= 0) {
      this.vocabulary[existingIdx] = item;
    } else {
      this.vocabulary.push(item);
    }
  }

  public searchVocabulary(query: string): {
    exactMatch?: SignVocabularyItem;
    matchedSigns: SignVocabularyItem[];
    unmatchedTerms: string[];
    isMultiWord: boolean;
  } {
    const raw = query.trim();
    if (!raw) {
      return { matchedSigns: [], unmatchedTerms: [], isMultiWord: false };
    }

    const norm = raw.toLowerCase().trim();

    // 1. Direct exact or full-phrase match
    const exact = this.vocabulary.find(s => {
      const sName = s.name.toLowerCase();
      const sGloss = s.gloss.toLowerCase();
      const cleanName = sName.split(' /')[0].split(' (')[0].trim();
      return (
        sName === norm ||
        sGloss === norm ||
        cleanName === norm ||
        s.tags.some(t => t.toLowerCase() === norm)
      );
    });

    if (exact) {
      return {
        exactMatch: exact,
        matchedSigns: [exact],
        unmatchedTerms: [],
        isMultiWord: false
      };
    }

    // 2. Substring match for single phrase
    const singleSub = this.vocabulary.find(s => {
      const sName = s.name.toLowerCase();
      return (
        sName.includes(norm) ||
        norm.includes(sName.split(' /')[0].split(' (')[0].trim()) ||
        s.meaning.toLowerCase().includes(norm)
      );
    });

    // Check if query is multiple words
    const words = raw.split(/\s+/).filter(w => w.trim().length > 0);
    if (words.length <= 1) {
      if (singleSub) {
        return {
          exactMatch: singleSub,
          matchedSigns: [singleSub],
          unmatchedTerms: [],
          isMultiWord: false
        };
      }
      return {
        matchedSigns: [],
        unmatchedTerms: [raw],
        isMultiWord: false
      };
    }

    // 3. Multi-word phrase breakdown
    // Identify words/n-grams that match recognized ISL signs
    const matchedSigns: SignVocabularyItem[] = [];
    const matchedSignIds = new Set<string>();
    const unmatchedTerms: string[] = [];
    const stopWords = new Set(['a', 'an', 'the', 'is', 'are', 'in', 'on', 'at', 'of', 'for', 'to']);

    let i = 0;
    while (i < words.length) {
      const w1 = words[i].toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!w1 || stopWords.has(w1)) {
        i++;
        continue;
      }

      // Check 2-word n-gram first
      if (i + 1 < words.length) {
        const w2 = words[i + 1].toLowerCase().replace(/[^a-z0-9]/g, '');
        const bigram = `${w1} ${w2}`;
        const biMatch = this.vocabulary.find(s => {
          const sName = s.name.toLowerCase();
          const cleanName = sName.split(' /')[0].split(' (')[0].trim();
          return (
            sName.includes(bigram) ||
            cleanName === bigram ||
            s.tags.some(t => t.toLowerCase() === bigram)
          );
        });

        if (biMatch) {
          if (!matchedSignIds.has(biMatch.id)) {
            matchedSigns.push(biMatch);
            matchedSignIds.add(biMatch.id);
          }
          i += 2;
          continue;
        }
      }

      // Single word lookup
      const singleMatch = this.vocabulary.find(s => {
        const sName = s.name.toLowerCase();
        const sGloss = s.gloss.toLowerCase();
        const cleanName = sName.split(' /')[0].split(' (')[0].trim();
        return (
          cleanName === w1 ||
          sName.split(/\s+/).includes(w1) ||
          sGloss.split(/\s+/).includes(w1) ||
          s.tags.some(t => t.toLowerCase() === w1)
        );
      });

      if (singleMatch) {
        if (!matchedSignIds.has(singleMatch.id)) {
          matchedSigns.push(singleMatch);
          matchedSignIds.add(singleMatch.id);
        }
      } else {
        unmatchedTerms.push(words[i]);
      }
      i++;
    }

    return {
      exactMatch: matchedSigns.length === 1 && unmatchedTerms.length === 0 ? matchedSigns[0] : undefined,
      matchedSigns,
      unmatchedTerms,
      isMultiWord: true
    };
  }
}

export const signVocabulary = new SignVocabularyService();

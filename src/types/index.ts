export type UserRole = 
  | 'deaf_user' 
  | 'hearing_user' 
  | 'healthcare_provider' 
  | 'isl_expert' 
  | 'support_staff' 
  | 'caregiver' 
  | 'administrator';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  preferredSignLanguage: 'ISL' | 'ASL' | 'BSL';
  highContrastEnabled: boolean;
  fontSize: 'standard' | 'large' | 'extra-large';
  visualAlertsEnabled: boolean;
  autoSpeakHearingTurns: boolean;
  institution?: string;
  department?: string;
}

export type PhraseCategory = 
  | 'Greetings and polite expressions'
  | 'Yes, no, please, thank you, sorry'
  | 'Family, people and relationships'
  | 'Food, water, meals and shopping'
  | 'Daily routines and household needs'
  | 'College, education and classroom communication'
  | 'Health, pain, illness, doctor and hospital'
  | 'Emergency, danger, help and safety'
  | 'Travel, transport and directions'
  | 'Feelings, emotions and common questions'
  | 'Numbers, time, dates and money'
  | 'Work, public services and technology'
  // Legacy aliases for backward compatibility
  | 'Greetings'
  | 'Medical Needs'
  | 'Emergency'
  | 'Travel'
  | 'Food'
  | 'Daily Conversation'
  | 'healthcare' 
  | 'emergency' 
  | 'education' 
  | 'workplace' 
  | 'travel' 
  | 'everyday';

export type SignLanguage = 'ISL' | 'ASL';

export type VocabularyBookCategory =
  | 'Greetings, introductions and polite expressions'
  | 'Family, relationships and people'
  | 'Numbers, dates and time'
  | 'Home and everyday activities'
  | 'Questions, feelings and emotions'
  | 'Directions, travel and transport'
  | 'Food, dining and shopping'
  | 'Money, clothes and daily purchases'
  | 'College, education and work'
  | 'Hobbies, sports and weather'
  | 'Body parts, health, doctor and emergencies'
  | 'Technology and communication';

export interface VisualInstructionStage {
  stageNumber: number;
  stageName: string;
  description: string;
  handshape?: string;
  bodyAnchor?: string;
  movementTrajectory?: string;
  palmOrientation?: string;
  movementArrows?: string;
  facialExpression?: string;
  svgIconName?: string;
}

export interface SequentialSignStep {
  stepIndex: number;
  signGloss: string;
  englishTerm: string;
  durationMs: number;
  description: string;
  handshape: string;
  movement: string;
  svgPose?: string;
  bodyAnchor?: string;
  visualStages?: VisualInstructionStage[];
}

export interface ISLSignReference {
  id: string;
  phrase: string;
  aliases?: string[];
  hindiGloss?: string;
  category: PhraseCategory | VocabularyBookCategory;
  urgencyLevel?: 'routine' | 'urgent' | 'emergency';
  handshapeDescription: string;
  movementDescription: string;
  nonManualFeatures?: string; // facial expression, head tilt
  videoUrl?: string;
  imageUrl?: string;
  isVerified: boolean;
  isFavorite?: boolean;
  signLanguage?: SignLanguage;
  aslComparisonNote?: string;
  islrtcReferenceUrl?: string;
  verificationStatus?: 'verified' | 'unverified_prototype_reference';
  verifiedBy?: string;
  verificationDate?: string;
  sourceNote?: string;
  accuracyRating?: number; // 1-5
  tags: string[];
  sequentialSigns?: SequentialSignStep[];
  visualStages?: VisualInstructionStage[];
  animationSequence?: {
    stage: string;
    durationMs: number;
    description: string;
    svgPose: string;
  }[];
}

export type ISLPhrase = ISLSignReference;

export interface RecognitionResult {
  signName: string;
  confidence: number; // 0.0 - 1.0
  isUncertain: boolean;
  message?: string;
  landmarksDetected: boolean;
  timestamp: number;
  alternateSuggestions?: { sign: string; confidence: number }[];
  matchedSignId?: string;
  phraseId?: string;
  isVerifiedSign?: boolean;
  meaning?: string;
  category?: string;
  demonstrationUrl?: string;
  signLanguage?: SignLanguage;
  metrics?: {
    inferenceTimeMs: number;
    jointAnglesCalculated?: number;
    centroidDistance?: number;
  };
}

export interface ConversationTurn {
  id: string;
  sessionId: string;
  senderRole: 'deaf_user' | 'hearing_user';
  senderName: string;
  mode: 'speech_to_text' | 'sign_to_text' | 'text_typed' | 'quick_phrase';
  content: string;
  hindiTranslation?: string;
  confidence?: number;
  isVerifiedSign?: boolean;
  timestamp: string;
}

export interface CommunicationSession {
  id: string;
  title: string;
  context: 'hospital' | 'classroom' | 'government_office' | 'workplace' | 'public_place' | 'emergency';
  hearingParticipantName: string;
  deafParticipantName: string;
  startedAt: string;
  endedAt?: string;
  status: 'active' | 'paused' | 'completed';
  turns: ConversationTurn[];
  summary?: string;
  notes?: string;
}

export interface UserFeedback {
  id: string;
  type: 'sign_inaccuracy' | 'caption_error' | 'missing_phrase' | 'camera_recognition_issue' | 'other';
  phraseId?: string;
  phraseText?: string;
  detectedSign?: string;
  expectedSign?: string;
  description: string;
  reportedByRole: UserRole;
  userContact?: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'resolved';
  adminNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface FingerspellingLetter {
  char: string;
  description: string;
  handshape: string;
  twoHandedNote: string;
  svgIcon: string;
}

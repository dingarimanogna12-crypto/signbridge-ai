import { CommunicationSession, UserFeedback, UserProfile } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const SESSIONS_KEY = 'signbridge_sessions';
const FEEDBACK_KEY = 'signbridge_feedback';
const PROFILE_KEY = 'signbridge_profile';

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'usr-default-01',
  name: 'Rahul Sharma (Patient)',
  role: 'deaf_user',
  preferredSignLanguage: 'ISL',
  highContrastEnabled: false,
  fontSize: 'standard',
  visualAlertsEnabled: true,
  autoSpeakHearingTurns: true,
  institution: 'Apollo City Hospital',
  department: 'Outpatient Triage'
};

export const INITIAL_MOCK_SESSIONS: CommunicationSession[] = [
  {
    id: 'sess-001',
    title: 'Hospital Outpatient Consultation',
    context: 'hospital',
    hearingParticipantName: 'Dr. Ananya Sen (Physician)',
    deafParticipantName: 'Rahul Sharma',
    startedAt: '2026-10-10T10:15:00Z',
    endedAt: '2026-10-10T10:32:00Z',
    status: 'completed',
    summary: 'Discussion regarding 3-day acute abdominal discomfort and prescription instructions.',
    turns: [
      {
        id: 't-1',
        sessionId: 'sess-001',
        senderRole: 'hearing_user',
        senderName: 'Dr. Ananya Sen',
        mode: 'speech_to_text',
        content: 'Hello Rahul. Please take a seat. How can I help you today?',
        confidence: 0.98,
        timestamp: '10:15:20'
      },
      {
        id: 't-2',
        sessionId: 'sess-001',
        senderRole: 'deaf_user',
        senderName: 'Rahul Sharma',
        mode: 'sign_to_text',
        content: 'I have severe pain in my stomach for two days.',
        confidence: 0.92,
        isVerifiedSign: true,
        timestamp: '10:16:05'
      },
      {
        id: 't-3',
        sessionId: 'sess-001',
        senderRole: 'hearing_user',
        senderName: 'Dr. Ananya Sen',
        mode: 'speech_to_text',
        content: 'Are you experiencing any fever or nausea along with it?',
        confidence: 0.96,
        timestamp: '10:17:10'
      },
      {
        id: 't-4',
        sessionId: 'sess-001',
        senderRole: 'deaf_user',
        senderName: 'Rahul Sharma',
        mode: 'quick_phrase',
        content: 'No fever, but severe nausea this morning.',
        confidence: 1.0,
        isVerifiedSign: true,
        timestamp: '10:17:45'
      },
      {
        id: 't-5',
        sessionId: 'sess-001',
        senderRole: 'hearing_user',
        senderName: 'Dr. Ananya Sen',
        mode: 'speech_to_text',
        content: 'Understood. Please take this medicine after food, twice a day. Avoid spicy meals.',
        confidence: 0.97,
        timestamp: '10:19:30'
      }
    ]
  },
  {
    id: 'sess-002',
    title: 'University Computer Science Lab',
    context: 'classroom',
    hearingParticipantName: 'Prof. Ramesh Gupta',
    deafParticipantName: 'Priya Verma (Student)',
    startedAt: '2026-10-09T14:00:00Z',
    endedAt: '2026-10-09T14:45:00Z',
    status: 'completed',
    summary: 'Clarification on binary search trees and submission deadlines.',
    turns: [
      {
        id: 't-10',
        sessionId: 'sess-002',
        senderRole: 'deaf_user',
        senderName: 'Priya Verma',
        mode: 'quick_phrase',
        content: 'Please repeat the question regarding tree balance.',
        confidence: 1.0,
        isVerifiedSign: true,
        timestamp: '14:05:12'
      },
      {
        id: 't-11',
        sessionId: 'sess-002',
        senderRole: 'hearing_user',
        senderName: 'Prof. Ramesh Gupta',
        mode: 'speech_to_text',
        content: 'I was explaining that AVL trees maintain a balance factor of at most 1 between left and right subtrees.',
        confidence: 0.95,
        timestamp: '14:06:00'
      }
    ]
  }
];

export const INITIAL_MOCK_FEEDBACK: UserFeedback[] = [
  {
    id: 'fb-001',
    type: 'sign_inaccuracy',
    phraseId: 'health-01',
    phraseText: 'I have severe pain',
    detectedSign: 'PAIN',
    expectedSign: 'CHEST_PAIN',
    description: 'In Northern ISL dialects, chest pain uses a circular clutching hand rather than pointing fingers.',
    reportedByRole: 'isl_expert',
    status: 'under_review',
    adminNotes: 'Assigned to ISL regional dialect sub-committee for revision.',
    createdAt: '2026-10-08T09:30:00Z'
  },
  {
    id: 'fb-002',
    type: 'caption_error',
    phraseText: 'Metformin 500mg',
    description: 'Speech recognition transcribed "500 milligram" as "500 million grams" in noisy room.',
    reportedByRole: 'healthcare_provider',
    status: 'resolved',
    adminNotes: 'Updated medical terminology acoustic dictionary whitelist.',
    createdAt: '2026-10-07T16:20:00Z'
  },
  {
    id: 'fb-003',
    type: 'missing_phrase',
    phraseText: 'Where is the maternity ward?',
    description: 'Urgent need for obstetrics and maternity signs in hospital triage quick library.',
    reportedByRole: 'deaf_user',
    status: 'approved',
    adminNotes: 'Slated for batch #14 verification recording.',
    createdAt: '2026-10-09T11:00:00Z'
  }
];

async function syncToSupabase(task: () => PromiseLike<{ error: any } | any>, desc: string): Promise<void> {
  try {
    const res = await task();
    if (res?.error) {
      console.warn(`Supabase ${desc} warning:`, res.error.message);
    }
  } catch (err: unknown) {
    console.warn(`Supabase ${desc} error:`, err);
  }
}

export class StorageService {
  // Profiles
  getProfile(): UserProfile {
    try {
      const data = localStorage.getItem(PROFILE_KEY);
      return data ? JSON.parse(data) : DEFAULT_USER_PROFILE;
    } catch {
      return DEFAULT_USER_PROFILE;
    }
  }

  saveProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile', e);
    }

    const client = supabase;
    if (client) {
      syncToSupabase(
        () => client.from('profiles').upsert({
          name: profile.name,
          role: profile.role,
          preferred_sign_language: profile.preferredSignLanguage,
          high_contrast_enabled: profile.highContrastEnabled,
          font_size: profile.fontSize,
          visual_alerts_enabled: profile.visualAlertsEnabled,
          auto_speak_hearing_turns: profile.autoSpeakHearingTurns,
          institution: profile.institution,
          department: profile.department
        }),
        'profile sync'
      );
    }
  }

  // Sessions
  getSessions(): CommunicationSession[] {
    try {
      const data = localStorage.getItem(SESSIONS_KEY);
      if (data) return JSON.parse(data);
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(INITIAL_MOCK_SESSIONS));
      return INITIAL_MOCK_SESSIONS;
    } catch {
      return INITIAL_MOCK_SESSIONS;
    }
  }

  saveSession(session: CommunicationSession): void {
    const sessions = this.getSessions();
    const idx = sessions.findIndex(s => s.id === session.id);
    if (idx >= 0) {
      sessions[idx] = session;
    } else {
      sessions.unshift(session);
    }
    try {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to save session', e);
    }

    const client = supabase;
    if (client) {
      syncToSupabase(
        () => client.from('communication_sessions').upsert({
          title: session.title,
          context: session.context,
          hearing_participant_name: session.hearingParticipantName,
          deaf_participant_name: session.deafParticipantName,
          started_at: session.startedAt,
          ended_at: session.endedAt || null,
          status: session.status,
          summary: session.summary || null,
          notes: session.notes || null
        }),
        'session sync'
      );
    }
  }

  deleteSession(id: string): void {
    const sessions = this.getSessions().filter(s => s.id !== id);
    try {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to delete session', e);
    }

    const client = supabase;
    if (client) {
      syncToSupabase(
        () => client.from('communication_sessions').delete().eq('id', id),
        'session delete'
      );
    }
  }

  // Feedback
  getFeedback(): UserFeedback[] {
    try {
      const data = localStorage.getItem(FEEDBACK_KEY);
      if (data) return JSON.parse(data);
      localStorage.setItem(FEEDBACK_KEY, JSON.stringify(INITIAL_MOCK_FEEDBACK));
      return INITIAL_MOCK_FEEDBACK;
    } catch {
      return INITIAL_MOCK_FEEDBACK;
    }
  }

  submitFeedback(feedback: Omit<UserFeedback, 'id' | 'createdAt' | 'status'>): UserFeedback {
    const newFeedback: UserFeedback = {
      ...feedback,
      id: `fb-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    const current = this.getFeedback();
    current.unshift(newFeedback);
    try {
      localStorage.setItem(FEEDBACK_KEY, JSON.stringify(current));
    } catch (e) {
      console.error('Failed to save feedback', e);
    }

    const client = supabase;
    if (client) {
      syncToSupabase(
        () => client.from('user_feedback').insert({
          feedback_type: newFeedback.type,
          phrase_text: newFeedback.phraseText || null,
          detected_sign: newFeedback.detectedSign || null,
          expected_sign: newFeedback.expectedSign || null,
          description: newFeedback.description,
          reported_by_role: newFeedback.reportedByRole,
          user_contact: newFeedback.userContact || null,
          status: 'pending'
        }),
        'feedback insert'
      );
    }

    return newFeedback;
  }

  updateFeedbackStatus(id: string, status: UserFeedback['status'], adminNotes?: string): void {
    const current = this.getFeedback();
    const item = current.find(f => f.id === id);
    if (item) {
      item.status = status;
      if (adminNotes !== undefined) item.adminNotes = adminNotes;
      item.updatedAt = new Date().toISOString();
      try {
        localStorage.setItem(FEEDBACK_KEY, JSON.stringify(current));
      } catch (e) {
        console.error('Failed to update feedback status', e);
      }

      const client = supabase;
      if (client) {
        syncToSupabase(
          () => client.from('user_feedback').update({
            status,
            admin_notes: adminNotes || null,
            updated_at: new Date().toISOString()
          }).eq('id', id),
          'feedback status update'
        );
      }
    }
  }

  // Supabase Configuration Status
  isSupabaseConfigured(): boolean {
    return isSupabaseConfigured();
  }
}

export const storageService = new StorageService();


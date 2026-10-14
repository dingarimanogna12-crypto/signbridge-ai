// Storage service for user favourites, recently viewed signs, and prediction reports

const FAVS_KEY = 'signbridge_favorite_signs';
const RECENT_KEY = 'signbridge_recently_viewed_signs';
const REPORTS_KEY = 'signbridge_prediction_reports';

export interface PredictionErrorReport {
  id: string;
  predictedSign: string;
  expectedSign: string;
  confidence: number;
  notes?: string;
  timestamp: string;
}

export class VocabularyStorageService {
  private memStore: Record<string, string> = {
    [FAVS_KEY]: JSON.stringify(['sign-hello', 'sign-water', 'sign-doctor', 'sign-help-urgent']),
    [RECENT_KEY]: JSON.stringify([]),
    [REPORTS_KEY]: JSON.stringify([])
  };

  private getStorageItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      if (typeof localStorage !== 'undefined' && localStorage && typeof localStorage.getItem === 'function') {
        return localStorage.getItem(key);
      }
    } catch {
      // Fallback
    }
    return this.memStore[key] || null;
  }

  private setStorageItem(key: string, value: string): void {
    this.memStore[key] = value;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      } else if (typeof localStorage !== 'undefined' && localStorage && typeof localStorage.setItem === 'function') {
        localStorage.setItem(key, value);
      }
    } catch {
      // Ignore storage errors
    }
  }

  public getFavorites(): string[] {
    const raw = this.getStorageItem(FAVS_KEY);
    return raw ? JSON.parse(raw) : ['sign-hello', 'sign-water', 'sign-doctor', 'sign-help-urgent'];
  }

  public isFavorite(signId: string): boolean {
    return this.getFavorites().includes(signId);
  }

  public toggleFavorite(signId: string): boolean {
    const favs = this.getFavorites();
    const idx = favs.indexOf(signId);
    let newState = false;
    if (idx >= 0) {
      favs.splice(idx, 1);
      newState = false;
    } else {
      favs.unshift(signId);
      newState = true;
    }
    this.setStorageItem(FAVS_KEY, JSON.stringify(favs));
    return newState;
  }

  public getRecentlyViewed(limit = 10): string[] {
    const raw = this.getStorageItem(RECENT_KEY);
    return raw ? JSON.parse(raw).slice(0, limit) : [];
  }

  public recordViewedSign(signId: string): void {
    const list = this.getRecentlyViewed(30).filter(id => id !== signId);
    list.unshift(signId);
    this.setStorageItem(RECENT_KEY, JSON.stringify(list.slice(0, 30)));
  }

  public reportIncorrectPrediction(report: Omit<PredictionErrorReport, 'id' | 'timestamp'>): PredictionErrorReport {
    const newReport: PredictionErrorReport = {
      ...report,
      id: 'rep_' + Date.now(),
      timestamp: new Date().toISOString()
    };
    const raw = this.getStorageItem(REPORTS_KEY);
    const reports: PredictionErrorReport[] = raw ? JSON.parse(raw) : [];
    reports.unshift(newReport);
    this.setStorageItem(REPORTS_KEY, JSON.stringify(reports.slice(0, 50)));
    return newReport;
  }

  public getPredictionReports(): PredictionErrorReport[] {
    const raw = this.getStorageItem(REPORTS_KEY);
    return raw ? JSON.parse(raw) : [];
  }
}

export const vocabStorageService = new VocabularyStorageService();

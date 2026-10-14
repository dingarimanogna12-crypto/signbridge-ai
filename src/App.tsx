import React, { useState, useEffect } from 'react';
import { AccessibilityProvider, useAccessibility } from './context/AccessibilityContext';
import { AuthRoleProvider } from './context/AuthRoleContext';
import { SessionProvider } from './context/SessionContext';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { VisualAlertOverlay } from './components/layout/VisualAlertOverlay';
import { FeedbackModal } from './components/feedback/FeedbackModal';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { LiveSessionPage } from './pages/LiveSessionPage';
import { SpeechToTextPage } from './pages/SpeechToTextPage';
import { TextToSpeechPage } from './pages/TextToSpeechPage';
import { TextToSignPage } from './pages/TextToSignPage';
import { SignToTextPage } from './pages/SignToTextPage';
import { PhraseLibraryPage } from './pages/PhraseLibraryPage';
import { SettingsPage } from './pages/SettingsPage';
import { SignVocabularyPage } from './pages/SignVocabularyPage';

const AppContent: React.FC = () => {
  const { toggleHighContrast, triggerVisualAlert } = useAccessibility();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackPrefillPhrase, setFeedbackPrefillPhrase] = useState('');

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        if (e.key.toLowerCase() === 'm') {
          e.preventDefault();
          setCurrentTab('speech-to-text');
        } else if (e.key.toLowerCase() === 't') {
          e.preventDefault();
          setCurrentTab('text-to-speech');
        } else if (e.key.toLowerCase() === 'c') {
          e.preventDefault();
          setCurrentTab('sign-to-text');
        } else if (e.key.toLowerCase() === 's') {
          e.preventDefault();
          setCurrentTab('text-to-sign');
        } else if (e.key.toLowerCase() === 'h') {
          e.preventDefault();
          toggleHighContrast();
        } else if (e.key.toLowerCase() === 'v') {
          e.preventDefault();
          triggerVisualAlert();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleHighContrast, triggerVisualAlert]);

  const handleOpenFeedback = (phrase?: string) => {
    setFeedbackPrefillPhrase(phrase || '');
    setFeedbackOpen(true);
  };

  const renderActivePage = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardPage 
            onNavigate={(tab) => setCurrentTab(tab)} 
            onOpenFeedback={() => handleOpenFeedback()} 
          />
        );
      case 'session':
        return <LiveSessionPage />;
      case 'speech-to-text':
        return <SpeechToTextPage />;
      case 'text-to-speech':
        return <TextToSpeechPage />;
      case 'text-to-sign':
        return <TextToSignPage onOpenFeedbackWithPhrase={handleOpenFeedback} />;
      case 'sign-to-text':
        return <SignToTextPage />;
      case 'vocabulary':
        return <SignVocabularyPage onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'library':
        return <PhraseLibraryPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage onNavigate={(tab) => setCurrentTab(tab)} onOpenFeedback={() => handleOpenFeedback()} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-navy-50 text-navy-900 transition-colors">
      <VisualAlertOverlay />

      {/* Accessible Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onOpenFeedback={() => handleOpenFeedback()}
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto" role="main">
          {renderActivePage()}
        </main>
      </div>

      {/* Global Feedback & Error Reporting Modal */}
      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        prefilledPhrase={feedbackPrefillPhrase}
      />
    </div>
  );
};

export function App() {
  return (
    <AccessibilityProvider>
      <AuthRoleProvider>
        <SessionProvider>
          <AppContent />
        </SessionProvider>
      </AuthRoleProvider>
    </AccessibilityProvider>
  );
}

export default App;

import React from 'react';
import { PhraseLibraryView } from '../components/phraseLibrary/PhraseLibraryView';

export const PhraseLibraryPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <PhraseLibraryView />
    </div>
  );
};

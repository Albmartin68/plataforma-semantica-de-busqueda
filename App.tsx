
import React, { useState, useCallback } from 'react';
import { SearchBar } from './components/SearchBar';
import { ResultsList } from './components/ResultsList';
import { ViewerModal } from './components/ViewerModal';
import { FlashcardView } from './components/FlashcardView';
import { performSearch } from './services/searchService';
import { useSearchTimer } from './hooks/useSearchTimer';
import type { SearchResult, Flashcard } from './types';
import { LogoIcon } from './components/icons';

const App: React.FC = () => {
    const [query, setQuery] = useState<string>('');
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
    const [generatedFlashcard, setGeneratedFlashcard] = useState<Flashcard | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    const { time, timerMessage, startTimer, stopTimer } = useSearchTimer();

    const handleSearch = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) return;

        setQuery(searchQuery);
        setIsSearching(true);
        setSearchResults([]);
        setError(null);
        setGeneratedFlashcard(null);
        startTimer();

        try {
            const results = await performSearch(searchQuery);
            setSearchResults(results);
        } catch (err) {
            setError('Ocurrió un error durante la búsqueda. Por favor, intente de nuevo.');
        } finally {
            setIsSearching(false);
            stopTimer();
        }
    }, [startTimer, stopTimer]);

    const handleViewResult = (result: SearchResult) => {
        setSelectedResult(result);
    };

    const handleCloseModal = () => {
        setSelectedResult(null);
    };
    
    const handleCreateFlashcard = (flashcard: Flashcard) => {
      setGeneratedFlashcard(flashcard);
      setSelectedResult(null); // Cierra el modal al crear la flashcard
    };

    return (
        <div className="min-h-screen bg-brand-primary text-brand-text font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <header className="w-full max-w-4xl mb-6 flex flex-col items-center">
                <div className="flex items-center gap-3 mb-2">
                    <LogoIcon className="w-10 h-10 text-brand-light"/>
                    <h1 className="text-3xl sm:text-4xl font-bold text-center text-white">Búsqueda Semántica</h1>
                </div>
                <p className="text-brand-light text-center">Indexa, traduce y aprende de fuentes certificadas.</p>
            </header>
            
            <main className="w-full max-w-4xl flex-grow">
                <SearchBar onSearch={handleSearch} isSearching={isSearching} />
                
                {isSearching && (
                    <div className="text-center my-8 animate-fade-in">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-light mb-2"></div>
                        <p className="text-lg">{timerMessage}</p>
                        <p className="text-2xl font-mono">{time.toFixed(1)}s</p>
                    </div>
                )}

                {error && <p className="text-center text-red-400 mt-4">{error}</p>}

                {!isSearching && searchResults.length > 0 && (
                    <ResultsList results={searchResults} onView={handleViewResult} />
                )}

                {!isSearching && !error && query && searchResults.length === 0 && (
                    <div className="text-center my-8 text-brand-light animate-fade-in">
                        <p>No se encontraron resultados para "{query}".</p>
                    </div>
                )}
                
                {generatedFlashcard && <FlashcardView flashcard={generatedFlashcard} onClose={() => setGeneratedFlashcard(null)} />}

            </main>

            {selectedResult && (
                <ViewerModal 
                    result={selectedResult} 
                    onClose={handleCloseModal}
                    onCreateFlashcard={handleCreateFlashcard} 
                />
            )}
        </div>
    );
};

export default App;

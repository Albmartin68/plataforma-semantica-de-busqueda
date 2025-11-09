
import React from 'react';
import type { SearchResult } from '../types';
import { ResultItem } from './ResultItem';

interface ResultsListProps {
    results: SearchResult[];
    onView: (result: SearchResult) => void;
}

export const ResultsList: React.FC<ResultsListProps> = ({ results, onView }) => {
    return (
        <div className="space-y-4 animate-slide-in-up">
            <h2 className="text-xl font-semibold text-brand-light">Resultados de la búsqueda</h2>
            {results.map((result) => (
                <ResultItem key={result.id} result={result} onView={onView} />
            ))}
        </div>
    );
};

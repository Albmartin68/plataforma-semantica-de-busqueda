
import React, { useState } from 'react';

interface SearchBarProps {
    onSearch: (query: string) => void;
    isSearching: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isSearching }) => {
    const [query, setQuery] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(query);
    };

    return (
        <form onSubmit={handleSubmit} className="w-full mb-8">
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Escribe tu prompt aquí..."
                    disabled={isSearching}
                    className="w-full pl-4 pr-24 py-3 bg-brand-secondary border-2 border-brand-accent rounded-full text-brand-text placeholder-brand-light focus:outline-none focus:ring-2 focus:ring-brand-light transition-all"
                />
                <button
                    type="submit"
                    disabled={isSearching}
                    className="absolute right-1.5 top-1.5 px-6 py-2 bg-brand-light text-brand-primary font-bold rounded-full hover:bg-white disabled:bg-brand-accent disabled:cursor-not-allowed transition-colors"
                >
                    {isSearching ? 'Buscando...' : 'Buscar'}
                </button>
            </div>
        </form>
    );
};

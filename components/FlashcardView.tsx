
import React, { useState } from 'react';
import type { Flashcard } from '../types';
import { CloseIcon } from './icons';

interface FlashcardViewProps {
    flashcard: Flashcard;
    onClose: () => void;
}

export const FlashcardView: React.FC<FlashcardViewProps> = ({ flashcard, onClose }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <div className="fixed bottom-8 right-8 z-40 animate-slide-in-up">
            <div className="bg-brand-secondary rounded-lg shadow-2xl w-80 max-w-full border border-brand-accent">
                <header className="flex items-center justify-between p-3 border-b border-brand-accent">
                    <h3 className="font-bold text-white">Flashcard Generada</h3>
                     <button onClick={onClose} className="text-brand-light hover:text-white transition-colors">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </header>
                <div className="p-4" style={{ perspective: '1000px' }}>
                    <div 
                        className={`relative w-full h-48 transition-transform duration-700`}
                        style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                        onClick={() => setIsFlipped(!isFlipped)}
                    >
                        {/* Front Side */}
                        <div className="absolute w-full h-full p-4 bg-brand-accent rounded-md flex flex-col justify-between" style={{ backfaceVisibility: 'hidden' }}>
                            <div>
                                <p className="text-xs text-brand-light">ANVERSO</p>
                                <p className="text-sm font-semibold">{flashcard.front}</p>
                            </div>
                            <img src={flashcard.thumbnail} alt="thumbnail" className="w-12 h-12 object-cover rounded-md self-end" />
                        </div>
                        {/* Back Side */}
                        <div className="absolute w-full h-full p-4 bg-brand-light text-brand-primary rounded-md flex flex-col justify-start overflow-auto" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                            <p className="text-xs font-bold text-brand-accent">REVERSO</p>
                            <p className="text-sm">{flashcard.back}</p>
                        </div>
                    </div>
                    <p className="text-center text-xs text-brand-light mt-2">Haz clic en la tarjeta para girarla.</p>
                </div>
            </div>
        </div>
    );
};

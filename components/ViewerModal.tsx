import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { SearchResult, Flashcard } from '../types';
import { ContentType } from '../types';
import { CloseIcon, TranslateIcon, ExportIcon, FlashcardIcon, CopyIcon } from './icons';
import { performTranslation, generateFlashcardFromText, generateImageFromPrompt } from '../services/searchService';

interface ViewerModalProps {
    result: SearchResult;
    onClose: () => void;
    onCreateFlashcard: (flashcard: Flashcard) => void;
}

type ViewMode = 'datos' | 'imagen' | 'completo';

const languages = [
    { name: 'Inglés', code: 'en' },
    { name: 'Español', code: 'es' },
    { name: 'Francés', code: 'fr' },
    { name: 'Alemán', code: 'de' },
    { name: 'Japonés', code: 'ja' },
    { name: 'Chino', code: 'zh' },
];

export const ViewerModal: React.FC<ViewerModalProps> = ({ result, onClose, onCreateFlashcard }) => {
    const [viewMode, setViewMode] = useState<ViewMode>('datos');
    const [highlightedText, setHighlightedText] = useState<string>('');
    const [translatedContent, setTranslatedContent] = useState<string | null>(null);
    const [isTranslating, setIsTranslating] = useState<boolean>(false);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [selectedLang, setSelectedLang] = useState(languages[0].code);
    const [copySuccess, setCopySuccess] = useState('');
    const [imagePrompt, setImagePrompt] = useState<string>('');
    const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
    
    const contentRef = useRef<HTMLDivElement>(null);

    const handleMouseUp = useCallback(() => {
        const selection = window.getSelection();
        const text = selection ? selection.toString().trim() : '';
        if (text) {
          setHighlightedText(text);
        }
    }, []);
    
    useEffect(() => {
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseUp]);
    
    useEffect(() => {
        // Reset state on result change
        setViewMode('datos');
        setTranslatedContent(null);
        setHighlightedText('');
        setGeneratedImageUrl(null);
        setImagePrompt('');
    }, [result]);

    const handleTranslate = async () => {
        const textToTranslate = highlightedText || (viewMode === 'datos' ? result.content.data : result.content.full);
        if (!textToTranslate || viewMode === 'imagen') return;

        setIsTranslating(true);
        const translation = await performTranslation(textToTranslate, selectedLang);
        setTranslatedContent(translation);
        setIsTranslating(false);
    };

    const handleCreateFlashcard = async () => {
        if (!highlightedText) {
            alert("Por favor, selecciona un fragmento de texto para crear la tarjeta.");
            return;
        }
        setIsGenerating(true);
        const flashcard = await generateFlashcardFromText(highlightedText, generatedImageUrl || result.content.image);
        onCreateFlashcard(flashcard);
        setIsGenerating(false);
    };
    
    const handleCopyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopySuccess('¡Copiado!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, (err) => {
            console.error('Could not copy text: ', err);
            setCopySuccess('Error al copiar');
            setTimeout(() => setCopySuccess(''), 2000);
        });
    }

    const handleGenerateImage = async () => {
        if (!imagePrompt.trim()) return;
        setIsGeneratingImage(true);
        setGeneratedImageUrl(null);
        try {
            const imageUrl = await generateImageFromPrompt(imagePrompt);
            setGeneratedImageUrl(imageUrl);
        } catch (error) {
            console.error("Failed to generate image:", error);
            alert("Hubo un error al generar la imagen. Por favor, intenta de nuevo.");
        } finally {
            setIsGeneratingImage(false);
        }
    };

    const renderContent = () => {
        const contentToDisplay = translatedContent || result.content.data;

        if (viewMode === 'imagen') {
            return (
                <div className="flex flex-col h-full">
                    <div className="flex-grow flex justify-center items-center h-full bg-black/50 rounded-md p-2 relative">
                         {isGeneratingImage && (
                            <div className="absolute inset-0 flex flex-col justify-center items-center bg-black/70 z-10 rounded-md">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-light mb-2"></div>
                                <p>Generando imagen...</p>
                            </div>
                         )}
                        <img src={generatedImageUrl || result.content.image} alt="Visualización del contenido" className="max-h-full max-w-full object-contain rounded-md" />
                    </div>
                    <div className="flex-shrink-0 mt-4">
                        <div className="relative">
                            <input
                                type="text"
                                value={imagePrompt}
                                onChange={(e) => setImagePrompt(e.target.value)}
                                placeholder="Describe la imagen que quieres generar..."
                                disabled={isGeneratingImage}
                                className="w-full pl-4 pr-32 py-2 bg-brand-primary border-2 border-brand-accent rounded-full text-brand-text placeholder-brand-light focus:outline-none focus:ring-2 focus:ring-brand-light transition-all"
                            />
                            <button
                                onClick={handleGenerateImage}
                                disabled={isGeneratingImage || !imagePrompt.trim()}
                                className="absolute right-1 top-1 px-4 py-1 bg-brand-light text-brand-primary font-bold rounded-full hover:bg-white disabled:bg-brand-accent disabled:cursor-not-allowed transition-colors text-sm"
                            >
                                {isGeneratingImage ? 'Generando...' : 'Generar'}
                            </button>
                        </div>
                    </div>
                </div>
            );
        }
        
        if (viewMode === 'completo') {
            if (result.type === ContentType.VIDEO && result.content.full.includes('youtube.com/embed')) {
                 return <iframe className="w-full h-full rounded-md" src={result.content.full} title={result.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>;
            }
             if (result.type === ContentType.DOCUMENT) {
                 return <iframe className="w-full h-full rounded-md bg-white" src={result.content.full} title={result.title}></iframe>;
            }
            // Fallback for Forum, News, or other text-based full content
            return (
                <div ref={contentRef} className="prose prose-invert max-w-none bg-brand-primary p-4 rounded-md overflow-auto h-full whitespace-pre-wrap">
                    {translatedContent || result.content.full}
                </div>
            );
        }
        
        // Default to 'datos' mode
        return (
            <div ref={contentRef} className="prose prose-invert max-w-none bg-brand-primary p-4 rounded-md overflow-auto h-full whitespace-pre-wrap">
                {contentToDisplay}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-brand-secondary rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col animate-slide-in-up" onClick={(e) => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-brand-accent">
                    <h2 className="text-xl font-bold text-white truncate">{result.title}</h2>
                    <button onClick={onClose} className="text-brand-light hover:text-white transition-colors">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>
                
                <div className="p-4 flex-grow flex flex-col overflow-hidden">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="font-semibold">Modo de vista:</span>
                        {(['datos', 'imagen', 'completo'] as ViewMode[]).map(mode => (
                            <button key={mode} onClick={() => setViewMode(mode)} className={`px-3 py-1 text-sm rounded-md capitalize ${viewMode === mode ? 'bg-brand-light text-brand-primary font-bold' : 'bg-brand-accent text-white'}`}>
                                {mode}
                            </button>
                        ))}
                    </div>
                    <div className="flex-grow min-h-0">
                       {renderContent()}
                    </div>
                    {translatedContent && viewMode !== 'completo' && viewMode !== 'imagen' && (
                        <div className="mt-4 p-4 bg-brand-primary rounded-md border border-dashed border-brand-accent relative">
                             <button onClick={() => handleCopyToClipboard(translatedContent)} className="absolute top-2 right-2 p-1.5 bg-brand-accent rounded-md hover:bg-brand-light text-white hover:text-brand-primary">
                                {copySuccess ? <span className="text-xs px-1">{copySuccess}</span> : <CopyIcon className="w-4 h-4" />}
                            </button>
                            <h4 className="font-bold text-brand-light mb-2">Contenido Traducido:</h4>
                            <p className="text-sm whitespace-pre-wrap">{translatedContent}</p>
                        </div>
                    )}
                </div>

                <footer className="p-4 border-t border-brand-accent flex flex-wrap items-center justify-between gap-4">
                     <div className="flex items-center gap-2">
                        <TranslateIcon className="w-5 h-5 text-brand-light"/>
                        <select 
                            value={selectedLang}
                            onChange={(e) => setSelectedLang(e.target.value)}
                            className="bg-brand-accent border border-brand-light text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
                        >
                            {languages.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
                        </select>
                         <button onClick={handleTranslate} disabled={isTranslating || viewMode === 'imagen'} className="px-4 py-1.5 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors">
                            {isTranslating ? 'Traduciendo...' : 'Traducir'}
                         </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={() => alert("Función de exportar no implementada.")} className="flex items-center gap-2 px-4 py-1.5 bg-brand-accent text-white font-semibold rounded-md hover:bg-brand-light hover:text-brand-primary transition-colors">
                            <ExportIcon className="w-5 h-5"/>
                            <span>Exportar</span>
                        </button>
                        <button onClick={handleCreateFlashcard} disabled={!highlightedText || isGenerating} className="flex items-center gap-2 px-4 py-1.5 bg-green-600 text-white font-semibold rounded-md hover:bg-green-500 disabled:bg-green-800 disabled:cursor-not-allowed transition-colors">
                            <FlashcardIcon className="w-5 h-5"/>
                            <span>{isGenerating ? 'Generando...' : 'Crear Tarjeta'}</span>
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};
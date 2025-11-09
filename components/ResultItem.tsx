
import React from 'react';
import type { SearchResult } from '../types';
import { ContentType, Certification } from '../types';
import { DocumentIcon, VideoIcon, ForumIcon, NewsIcon, VerifiedIcon } from './icons';

interface ResultItemProps {
    result: SearchResult;
    onView: (result: SearchResult) => void;
}

const TypeIcon: React.FC<{ type: ContentType }> = ({ type }) => {
    const props = { className: 'w-5 h-5 mr-2' };
    switch (type) {
        case ContentType.DOCUMENT: return <DocumentIcon {...props} />;
        case ContentType.VIDEO: return <VideoIcon {...props} />;
        case ContentType.FORUM: return <ForumIcon {...props} />;
        case ContentType.NEWS: return <NewsIcon {...props} />;
        default: return null;
    }
};

const CertificationBadge: React.FC<{ certification: Certification }> = ({ certification }) => {
    const baseClasses = 'flex items-center text-xs font-bold px-2.5 py-1 rounded-full';
    switch (certification) {
        case Certification.VERIFIED:
            return <span className={`${baseClasses} bg-green-500/20 text-green-300`}><VerifiedIcon className="w-4 h-4 mr-1"/> {certification}</span>;
        case Certification.PARTIAL:
            return <span className={`${baseClasses} bg-yellow-500/20 text-yellow-300`}>{certification}</span>;
        case Certification.UNVERIFIED:
            return <span className={`${baseClasses} bg-red-500/20 text-red-300`}>{certification}</span>;
        default: return null;
    }
};

export const ResultItem: React.FC<ResultItemProps> = ({ result, onView }) => {
    return (
        <div className="bg-brand-secondary p-4 rounded-lg border border-brand-accent hover:border-brand-light transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-grow">
                <div className="flex items-center gap-4 mb-2">
                   <div className="flex items-center text-sm text-brand-light capitalize">
                        <TypeIcon type={result.type} />
                        {result.type}
                    </div>
                    <CertificationBadge certification={result.certification} />
                </div>
                <h3 className="text-lg font-bold text-white">{result.title}</h3>
                <p className="text-sm text-brand-light mb-2">{result.source}</p>
                <p className="text-sm text-brand-text">{result.snippet}</p>
            </div>
            <div className="flex-shrink-0">
                <button 
                    onClick={() => onView(result)}
                    className="w-full sm:w-auto px-5 py-2 bg-brand-accent text-white font-semibold rounded-md hover:bg-brand-light hover:text-brand-primary transition-colors"
                >
                    Ver
                </button>
            </div>
        </div>
    );
};

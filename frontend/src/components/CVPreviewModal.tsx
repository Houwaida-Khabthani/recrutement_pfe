import React, { useState } from 'react';
import { X, Download, ExternalLink } from 'lucide-react';

interface CVPreviewModalProps {
  isOpen: boolean;
  cvUrl: string;
  cvFileName?: string;
  onClose: () => void;
  candidateName?: string;
}

const CVPreviewModal: React.FC<CVPreviewModalProps> = ({
  isOpen,
  cvUrl,
  cvFileName = 'CV Document',
  onClose,
  candidateName = 'Candidate'
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setError('Failed to load CV. The file may not exist or is inaccessible.');
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">CV Preview</p>
            <h3 className="text-lg font-black text-slate-900">{cvFileName}</h3>
            <p className="text-sm text-slate-500 font-medium mt-1">from {candidateName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-2xl transition-all"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-slate-50">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-600 font-medium">Loading CV...</p>
              </div>
            </div>
          )}

          {error ? (
            <div className="flex items-center justify-center h-full p-8">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-red-600" />
                </div>
                <p className="text-red-600 font-bold mb-4">{error}</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 transition-all"
                  >
                    Close
                  </button>
                  <a
                    href={cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open in New Tab
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <iframe
              src={cvUrl}
              className="w-full h-full border-0"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              title={`CV of ${candidateName}`}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 transition-all text-sm"
          >
            Close
          </button>
          <a
            href={cvUrl}
            download={cvFileName}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all text-sm"
          >
            <Download className="w-4 h-4" />
            Download
          </a>
          <a
            href={cvUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-all text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            Open
          </a>
        </div>
      </div>
    </div>
  );
};

export default CVPreviewModal;

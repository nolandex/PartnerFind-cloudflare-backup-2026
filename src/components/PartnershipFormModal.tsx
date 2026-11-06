import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getTallyEmbedUrl } from '../lib/tallyConfig';
import { subscribeWebsiteContent, getCachedWebsiteContent, WebsiteContentConfig } from '../lib/websiteContentService';

interface PartnershipFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PartnershipFormModal: React.FC<PartnershipFormModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { locale, t } = useLanguage();
  const [contentConfig, setContentConfig] = useState<WebsiteContentConfig>(getCachedWebsiteContent);

  // Subscribe to real-time content config in case admin updates custom Tally URLs
  useEffect(() => {
    const unsubscribe = subscribeWebsiteContent((cfg) => {
      setContentConfig(cfg);
    });
    return () => unsubscribe();
  }, []);

  // Determine the correct embed URL for the current active language
  const activeEmbedUrl = getTallyEmbedUrl(locale, contentConfig?.tallyEmbedUrls);

  useEffect(() => {
    if (!isOpen) return;

    const loadTally = () => {
      if (typeof (window as any).Tally !== 'undefined') {
        (window as any).Tally.loadEmbeds();
      }
    };

    const existingScript = document.querySelector('script[src="https://tally.so/widgets/embed.js"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://tally.so/widgets/embed.js';
      script.async = true;
      script.onload = loadTally;
      document.body.appendChild(script);
    } else {
      loadTally();
      const timer = setTimeout(loadTally, 250);
      return () => clearTimeout(timer);
    }
  }, [isOpen, activeEmbedUrl]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        />

        {/* Modal Dialog with pure white background - exactly original from Tally */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-white text-neutral-900 rounded-3xl shadow-2xl overflow-hidden my-auto z-10 max-h-[92vh] flex flex-col"
        >
          {/* Subtle minimal close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="absolute top-3.5 right-3.5 z-30 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-black flex items-center justify-center transition-colors cursor-pointer shadow-sm border border-neutral-200"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Original Tally Form Container (Pure white, crystal clear readability) */}
          <div className="w-full flex-1 overflow-y-auto p-4 sm:p-6 bg-white" style={{ background: '#ffffff' }}>
            <iframe
              key={activeEmbedUrl}
              data-tally-src={activeEmbedUrl}
              src={activeEmbedUrl}
              loading="lazy"
              width="100%"
              height="580"
              frameBorder="0"
              marginHeight={0}
              marginWidth={0}
              title={t('nav_cta') || 'Pendaftaran'}
              className="w-full bg-white border-0"
              style={{ minHeight: '550px', background: '#ffffff' }}
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

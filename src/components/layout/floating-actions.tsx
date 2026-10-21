'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, MessageCircle, Phone, X } from 'lucide-react';
import { site, whatsappLink } from '@/lib/site';

export function FloatingActions() {
  const [open, setOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 700);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="pointer-events-none fixed right-4 bottom-28 z-40 flex flex-col items-end gap-2.5 sm:right-6 lg:bottom-6">
      <AnimatePresence>
        {showTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="pointer-events-auto grid size-10 place-items-center rounded-full border border-line bg-surface text-fg-muted shadow-lg transition-colors hover:text-brand"
            aria-label="Back to top"
          >
            <ArrowUp className="size-4" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            className="pointer-events-auto flex flex-col gap-2"
          >
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 rounded-full bg-[#25D366] py-2.5 pr-4 pl-3 text-sm font-bold text-white shadow-xl transition-transform hover:scale-105"
            >
              <MessageCircle className="size-4" />
              WhatsApp us
            </a>
            <a
              href={`tel:${site.primaryPhone}`}
              className="flex items-center gap-2.5 rounded-full bg-brand py-2.5 pr-4 pl-3 text-sm font-bold text-brand-fg shadow-xl transition-transform hover:scale-105"
            >
              <Phone className="size-4" />
              Call now
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((v) => !v)}
        className="pointer-events-auto grid size-13 place-items-center rounded-full bg-linear-135 from-brand to-accent text-white shadow-2xl shadow-brand/40 transition-transform hover:scale-105 active:scale-95"
        aria-label={open ? 'Close quick contact' : 'Open quick contact'}
        aria-expanded={open}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? 'close' : 'open'}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {open ? <X className="size-5" /> : <MessageCircle className="size-5" />}
          </motion.span>
        </AnimatePresence>
        {!open && (
          <span className="absolute inset-0 animate-[pulse-ring_2.6s_cubic-bezier(0.4,0,0.6,1)_infinite] rounded-full" />
        )}
      </button>
    </div>
  );
}

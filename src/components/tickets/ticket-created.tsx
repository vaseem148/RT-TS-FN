'use client';

import { X } from 'lucide-react';

const SPARKS = [0, 45, 90, 135, 180, 225, 270, 315];

/**
 * Shown on a ticket the moment it is raised: the check draws itself, a few
 * sparks fly out, and the customer learns how they will hear back.
 */
export function TicketCreated({ ticketNumber, onClose }: { ticketNumber: string; onClose: () => void }) {
  return (
    <div className="page-enter relative overflow-hidden rounded-2xl border border-success/30 bg-success-soft px-5 pt-6 pb-5 text-center">
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss"
        className="absolute top-3 right-3 grid size-8 place-items-center rounded-full text-fg-subtle transition-colors hover:bg-surface/60 hover:text-fg"
      >
        <X className="size-4" />
      </button>

      <div className="relative mx-auto grid size-16 place-items-center text-success">
        {SPARKS.map((angle, index) => (
          <span
            key={angle}
            aria-hidden
            className="absolute top-1/2 left-1/2 -mt-[3px] -ml-[3px] size-1.5 rounded-full bg-success opacity-0"
            style={
              {
                '--angle': `${angle}deg`,
                animation: `spark 0.7s ease-out ${0.4 + index * 0.02}s forwards`,
              } as React.CSSProperties
            }
          />
        ))}
        <svg viewBox="0 0 52 52" className="size-16" aria-hidden>
          <circle
            cx="26"
            cy="26"
            r="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            style={{ strokeDasharray: 151, '--dash': 151, animation: 'draw 0.6s ease-out backwards' } as React.CSSProperties}
          />
          <path
            d="M15 27l7 7 15-16"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ strokeDasharray: 40, '--dash': 40, animation: 'draw 0.4s ease-out 0.45s backwards' } as React.CSSProperties}
          />
        </svg>
      </div>

      <p className="mt-3 text-[17px] font-extrabold text-fg">Ticket raised!</p>
      <p className="mx-auto mt-1 max-w-sm text-[13.5px] leading-relaxed text-fg-muted">
        Your ticket number is <span className="font-mono font-bold text-fg">{ticketNumber}</span>. We
        will keep you posted here, by email and on WhatsApp.
      </p>
    </div>
  );
}

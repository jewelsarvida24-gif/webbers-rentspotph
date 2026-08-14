'use client';

import { X, ExternalLink } from 'lucide-react';

interface DocumentViewerProps {
  src: string;
  title: string;
  onClose: () => void;
}

export default function DocumentViewer({ src, title, onClose }: DocumentViewerProps) {
  const isPdf = src.toLowerCase().endsWith('.pdf');

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl rounded-3xl bg-white shadow-xl overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-neutral-200 px-5 py-4">
          <div>
            <p className="font-semibold text-lg">{title}</p>
            <p className="text-sm text-neutral-500">Preview uploaded document</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={src}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50"
            >
              <ExternalLink className="w-4 h-4" /> Open in new tab
            </a>
            <button onClick={onClose} className="rounded-full bg-neutral-100 p-2 text-neutral-600 hover:bg-neutral-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="h-[80vh] bg-neutral-950">
          {isPdf ? (
            <iframe src={src} className="h-full w-full" title={title} />
          ) : (
            <img src={src} alt={title} className="h-full w-full object-contain" />
          )}
        </div>
      </div>
    </div>
  );
}

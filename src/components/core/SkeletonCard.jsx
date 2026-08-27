import React from 'react';

export default function SkeletonCard() {
  return (
    <article className="flex h-full w-full animate-pulse flex-col justify-between overflow-hidden rounded-xl sm:rounded-2xl glass-card border border-white/5">
      {/* Poster area */}
      <div className="aspect-[3/4] w-full bg-cinema-surface-elevated"></div>

      {/* Info area */}
      <div className="p-2 sm:p-3">
        <div className="mb-2 h-3.5 w-3/4 rounded-lg bg-cinema-surface-elevated"></div>
        <div className="flex justify-between">
          <div className="h-2.5 w-1/3 rounded bg-cinema-surface-elevated/60"></div>
          <div className="h-2.5 w-1/4 rounded bg-cinema-surface-elevated/40"></div>
        </div>
      </div>

      {/* Button placeholder */}
      <div className="p-2 sm:p-3 pt-0 mt-auto">
        <div className="h-8 w-full rounded-lg bg-cinema-surface-elevated"></div>
      </div>
    </article>
  );
}
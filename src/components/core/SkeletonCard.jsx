import React from 'react';

export default function SkeletonCard() {
  return (
    <article className="flex h-full w-full animate-pulse flex-col justify-between overflow-hidden rounded-2xl glass-card border border-white/5">
      {/* Poster area */}
      <div className="aspect-[2/3] w-full bg-cinema-surface-elevated"></div>

      {/* Info area */}
      <div className="p-3.5 sm:p-4">
        <div className="mb-3 h-4 w-3/4 rounded-lg bg-cinema-surface-elevated"></div>
        <div className="mb-2 h-3 w-1/2 rounded bg-cinema-surface-elevated/70"></div>
        <div className="flex justify-between">
          <div className="h-2.5 w-1/4 rounded bg-cinema-surface-elevated/50"></div>
          <div className="h-2.5 w-1/4 rounded bg-cinema-surface-elevated/50"></div>
        </div>
      </div>

      {/* Button placeholder */}
      <div className="p-3.5 sm:p-4 pt-0 mt-auto">
        <div className="h-9 w-full rounded-xl bg-cinema-surface-elevated"></div>
      </div>
    </article>
  );
}
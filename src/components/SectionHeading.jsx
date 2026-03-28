import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const SectionHeading = ({ eyebrow, title, description, actionLabel, actionHref }) => (
  <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
    <div className="max-w-2xl">
      {eyebrow ? (
        <span className="inline-flex rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-stone-500 backdrop-blur">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="mt-4 font-display text-3xl text-stone-950 md:text-5xl">{title}</h2>
      {description ? (
        <p className="mt-3 text-sm leading-7 text-stone-600 md:text-base">{description}</p>
      ) : null}
    </div>
    {actionLabel && actionHref ? (
      <Link
        to={actionHref}
        className="inline-flex items-center gap-2 text-sm font-semibold text-stone-900 transition hover:text-stone-600"
      >
        {actionLabel}
        <ArrowRight className="w-4 h-4" />
      </Link>
    ) : null}
  </div>
);

export default SectionHeading;

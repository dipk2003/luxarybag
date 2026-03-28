import React from 'react';

const PageHero = ({ kicker, title, description, image, imageAlt, align = 'right' }) => {
  const imageFirst = align === 'left';

  return (
    <section className="relative overflow-hidden rounded-[40px] bg-stone-950 text-white shadow-[0_24px_100px_rgba(28,25,23,0.18)]">
      <div className={`grid min-h-[420px] gap-0 lg:min-h-[540px] lg:grid-cols-[0.92fr_minmax(0,1.08fr)] ${imageFirst ? 'lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1' : ''}`}>
        <div className="relative z-10 flex items-center p-8 md:p-12">
          <div className="max-w-2xl">
            {kicker ? (
              <p className="text-xs uppercase tracking-[0.26em] text-white/60">{kicker}</p>
            ) : null}
            <h1 className="mt-4 font-display text-4xl text-white md:text-6xl">{title}</h1>
            {description ? (
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/78">{description}</p>
            ) : null}
          </div>
        </div>
        <div className="relative min-h-[320px] overflow-hidden lg:min-h-full">
          <img
            src={image}
            alt={imageAlt || title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent lg:bg-gradient-to-r lg:from-black/55 lg:via-transparent lg:to-transparent" />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_22%)]" />
    </section>
  );
};

export default PageHero;

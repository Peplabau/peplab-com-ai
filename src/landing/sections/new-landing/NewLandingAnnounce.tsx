import { SEASONAL_PROMO_COPY, useSeasonalTheme } from '@/hooks/use-seasonal-theme';

export default function NewLandingAnnounce() {
  const theme = useSeasonalTheme();
  const label = SEASONAL_PROMO_COPY[theme].announce;

  return (
    <div className={`nl-announce nl-announce--${theme}`} role="region" aria-label={label}>
      <div className="nl-announce-inner">
        <p className="nl-announce-text">
          <span className="nl-announce-highlight">{label}</span>
          <span className="nl-announce-sep" aria-hidden>
            |
          </span>
          <span>Free BAC Water</span>
          <span className="nl-announce-sep nl-announce-sep--wide" aria-hidden>
            |
          </span>
          <span className="nl-announce-extra">On all orders</span>
        </p>
      </div>
    </div>
  );
}

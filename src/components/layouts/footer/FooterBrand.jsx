import { Link } from 'react-router-dom';
import { Film } from 'lucide-react';
import { DEFAULT_BRAND_INFO } from './footer.data';

export default function FooterBrand({ brand = DEFAULT_BRAND_INFO }) {
  return (
    <div className="flex flex-col gap-4">
      <Link to={brand.homeUrl || '/'} className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-gradient text-cinema-bg shadow-glow-gold-sm">
          <Film className="h-5 w-5 stroke-[2.5]" />
        </div>
        <span className="gold-text-gradient font-black text-2xl tracking-wider">
          {brand.name}
        </span>
      </Link>
      <p className="text-sm leading-relaxed text-cinema-text-muted">
        {brand.description}
      </p>
    </div>
  );
}

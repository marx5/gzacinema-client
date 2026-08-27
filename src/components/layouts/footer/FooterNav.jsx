import { Link } from 'react-router-dom';
import { DEFAULT_FOOTER_NAV_SECTIONS } from './footer.data';

export default function FooterNav({ sections = DEFAULT_FOOTER_NAV_SECTIONS }) {
  return (
    <>
      {sections.map((section, idx) => {
        const Icon = section.icon;
        return (
          <div key={section.title || idx}>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-cinema-text flex items-center gap-2">
              {Icon && <Icon className="w-4 h-4 text-cinema-gold" />}
              {section.title}
            </h4>
            <ul className="flex flex-col gap-1 sm:gap-2.5 text-sm">
              {section.links?.map((link, lIdx) => (
                <li key={link.label || lIdx}>
                  {link.to ? (
                    <Link to={link.to} className="inline-block py-1 sm:py-0 hover:text-cinema-gold transition-colors active:text-cinema-gold">
                      {link.label}
                    </Link>
                  ) : (
                    <span
                      onClick={link.onClick}
                      className="inline-block py-1 sm:py-0 hover:text-cinema-gold transition-colors cursor-pointer active:text-cinema-gold"
                    >
                      {link.label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </>
  );
}


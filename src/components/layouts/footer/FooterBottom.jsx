import { DEFAULT_SOCIAL_LINKS } from './footer.data';

export default function FooterBottom({
  copyrightYear = new Date().getFullYear(),
  companyName = 'GzaCinema Corporation',
  socials = DEFAULT_SOCIAL_LINKS,
}) {
  return (
    <div className="mt-14 flex flex-col sm:flex-row items-center justify-between border-t border-white/10 py-6 text-xs text-cinema-text-dim gap-4 text-center sm:text-left">
      <p>
        &copy; {copyrightYear} {companyName}. Tất cả các quyền được bảo lưu.
      </p>
      <div className="flex flex-wrap justify-center sm:justify-end items-center gap-4 sm:gap-6">
        {socials.map((social, idx) => (
          <a
            key={social.label || idx}
            href={social.url || '#'}
            target={social.url?.startsWith('http') ? '_blank' : undefined}
            rel="noreferrer"
            className="inline-block py-1 hover:text-cinema-gold transition-colors cursor-pointer active:text-cinema-gold"
          >
            {social.label}
          </a>
        ))}
      </div>
    </div>
  );
}

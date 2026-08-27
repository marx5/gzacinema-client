import { DEFAULT_CONTACT_INFO } from './footer.data';

export default function FooterContact({ contact = DEFAULT_CONTACT_INFO }) {
  return (
    <div>
      <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-cinema-text">
        {contact.title}
      </h4>
      <ul className="flex flex-col gap-3 text-sm">
        {contact.items?.map((item, idx) => {
          const Icon = item.icon;
          return (
            <li key={item.label || idx} className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-cinema-gold">
                {Icon && <Icon className="w-4 h-4" />}
              </div>
              <div>
                <p className="text-xs text-cinema-text-dim">{item.label}</p>
                <p className="font-bold text-cinema-text">{item.value}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

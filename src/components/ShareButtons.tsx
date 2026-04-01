import { Facebook, Linkedin, Mail } from "lucide-react";

interface Props {
  url: string;
  title: string;
}

const XIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const ShareButtons = ({ url, title }: Props) => {
  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    { href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`, icon: <Facebook size={18} />, label: "Facebook" },
    { href: `https://twitter.com/intent/tweet?url=${encoded}&text=${encodedTitle}`, icon: <XIcon />, label: "X" },
    { href: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`, icon: <Linkedin size={18} />, label: "LinkedIn" },
    { href: `mailto:?subject=${encodedTitle}&body=${encoded}`, icon: <Mail size={18} />, label: "Email" },
  ];

  return (
    <div className="flex items-center gap-2">
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target={l.label !== "Email" ? "_blank" : undefined}
          rel="noopener noreferrer"
          title={l.label}
          className="w-9 h-9 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          {l.icon}
        </a>
      ))}
    </div>
  );
};

export default ShareButtons;

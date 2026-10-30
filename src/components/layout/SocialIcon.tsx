import { Globe, Linkedin, Mail } from 'lucide-react';
import type { SocialNetwork } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import { brandIcons } from './brandIcons';

/** Networks offered in the dashboard (order = order in the picker). */
export const socialNetworks: { id: SocialNetwork; label: string; color: string; placeholder: string }[] = [
  { id: 'facebook', label: 'فيسبوك', color: '#0866FF', placeholder: 'https://facebook.com/...' },
  { id: 'instagram', label: 'إنستجرام', color: '#FF0069', placeholder: 'https://instagram.com/...' },
  { id: 'x', label: 'إكس (تويتر)', color: '#FFFFFF', placeholder: 'https://x.com/...' },
  { id: 'tiktok', label: 'تيك توك', color: '#FFFFFF', placeholder: 'https://tiktok.com/@...' },
  { id: 'youtube', label: 'يوتيوب', color: '#FF0000', placeholder: 'https://youtube.com/@...' },
  { id: 'snapchat', label: 'سناب شات', color: '#FFFC00', placeholder: 'https://snapchat.com/add/...' },
  { id: 'whatsapp', label: 'واتساب', color: '#25D366', placeholder: 'https://wa.me/20... أو رقم الهاتف' },
  { id: 'telegram', label: 'تيليجرام', color: '#26A5E4', placeholder: 'https://t.me/...' },
  { id: 'threads', label: 'ثريدز', color: '#FFFFFF', placeholder: 'https://threads.net/@...' },
  { id: 'linkedin', label: 'لينكدإن', color: '#0A66C2', placeholder: 'https://linkedin.com/company/...' },
  { id: 'pinterest', label: 'بنترست', color: '#E60023', placeholder: 'https://pinterest.com/...' },
  { id: 'discord', label: 'ديسكورد', color: '#5865F2', placeholder: 'https://discord.gg/...' },
  { id: 'twitch', label: 'تويتش', color: '#9146FF', placeholder: 'https://twitch.tv/...' },
  { id: 'spotify', label: 'سبوتيفاي', color: '#1ED760', placeholder: 'https://open.spotify.com/...' },
  { id: 'email', label: 'البريد الإلكتروني', color: '#4FE3D0', placeholder: 'info@mamatvbox.com' },
  { id: 'website', label: 'موقع آخر', color: '#4FE3D0', placeholder: 'https://...' },
];
export const networkInfo = (id: SocialNetwork) => socialNetworks.find((n) => n.id === id) ?? socialNetworks[socialNetworks.length - 1];

/** The network's logo, drawn in `currentColor`. */
export function SocialGlyph({ network, className }: { network: SocialNetwork; className?: string }) {
  const brand = brandIcons[network];
  if (brand) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden className={cn('h-5 w-5', className)} fill="currentColor">
        <path d={brand.path} />
      </svg>
    );
  }
  const Icon = network === 'linkedin' ? Linkedin : network === 'email' ? Mail : Globe;
  return <Icon aria-hidden className={cn('h-5 w-5', className)} />;
}

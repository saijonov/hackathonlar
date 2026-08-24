import { useTranslations } from 'next-intl';
import { Globe, MonitorSmartphone, Users } from 'lucide-react';
import { type HackathonFormat } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';

const ICONS = {
  offline: Users,
  online: Globe,
  hybrid: MonitorSmartphone,
} as const;

export function FormatBadge({ format }: { format: HackathonFormat }) {
  const t = useTranslations('format');
  const Icon = ICONS[format];

  return (
    <Badge tone="accent" icon={<Icon size={11} strokeWidth={2} aria-hidden />}>
      {t(format)}
    </Badge>
  );
}

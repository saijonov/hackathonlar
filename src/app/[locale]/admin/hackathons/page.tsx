import { setRequestLocale } from 'next-intl/server';
import { getAdminHackathons, getAdminOrganizers } from '@/lib/queries/admin';
import { AdminHackathonsManager } from '@/components/admin/AdminHackathonsManager';

type PageProps = { params: Promise<{ locale: string }> };

export default async function AdminHackathonsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [hackathons, organizers] = await Promise.all([getAdminHackathons(), getAdminOrganizers()]);

  return (
    <AdminHackathonsManager
      hackathons={hackathons}
      organizers={organizers.map((organizer) => ({ id: organizer.id, name: organizer.name }))}
    />
  );
}

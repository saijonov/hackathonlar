import { setRequestLocale } from 'next-intl/server';
import { getAdminOrganizers } from '@/lib/queries/admin';
import { AdminOrganizersManager } from '@/components/admin/AdminOrganizersManager';

type PageProps = { params: Promise<{ locale: string }> };

export default async function AdminOrganizersPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const organizers = await getAdminOrganizers();
  return <AdminOrganizersManager organizers={organizers} />;
}

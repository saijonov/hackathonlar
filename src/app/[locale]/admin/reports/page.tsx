import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getOpenReports } from '@/lib/queries/admin';
import { EmptyState } from '@/components/ui/EmptyState';
import { ReportRow } from '@/components/admin/ReportRow';

type PageProps = { params: Promise<{ locale: string }> };

export default async function AdminReportsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('admin.reports');
  const reports = await getOpenReports();

  return (
    <section>
      <h2 className="text-h1">{t('title')}</h2>

      {reports.length > 0 ? (
        <ul className="mt-5 grid grid-cols-1 gap-4">
          {reports.map((report) => (
            <li key={report.id}>
              <ReportRow report={report} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState className="mt-5" compact title={t('empty')} />
      )}
    </section>
  );
}

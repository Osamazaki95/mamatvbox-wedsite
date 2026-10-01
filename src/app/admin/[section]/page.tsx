import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/primitives';
import { endpoints } from '@/lib/api/endpoints';

const sections: Record<string, { title: string; endpoint: string }> = {
  users: { title: 'المشتركون والعمليات', endpoint: '/admin/users' },
  referrals: { title: 'تقارير نقرات الإحالة', endpoint: endpoints.admin.referrals },
  settings: { title: 'إعدادات النظام وتكامل الـ APIs', endpoint: '/admin/settings' },
};

export default function AdminSection({ params }: { params: { section: string } }) {
  const s = sections[params.section];
  if (!s) notFound();
  return (
    <div className="bg-card p-8">
      <h1 className="font-display text-2xl font-bold">{s.title}</h1>
      <p className="mt-2 text-sm text-muted">هذا القسم مربوط بالـ endpoint التالي — يظهر المحتوى فور ربط الـ API الحقيقي:</p>
      <Badge tone="teal" className="mt-4 font-mono">GET {s.endpoint}</Badge>
    </div>
  );
}

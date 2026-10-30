import TitleClient from './TitleClient';

// Static export: one placeholder page; Apache serves it for every /title/<slug>/ (see .htaccess).
export function generateStaticParams() {
  return [{ slug: '_' }];
}
export const dynamicParams = false;

export default function Page() {
  return <TitleClient />;
}

import PersonClient from './PersonClient';

export function generateStaticParams() {
  return [{ slug: '_' }];
}
export const dynamicParams = false;

export default function Page() {
  return <PersonClient />;
}

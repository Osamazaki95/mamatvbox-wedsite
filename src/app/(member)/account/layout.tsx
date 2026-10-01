import { AccountTabs } from '@/components/account/AccountTabs';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[1300px] px-5 py-10">
      <AccountTabs />
      {children}
    </div>
  );
}

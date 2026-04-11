import { AccountView } from '@neondatabase/neon-js/auth/react';

export function Account() {
  return (
    <div className="flex align-items-center justify-content-center min-h-screen surface-ground p-3">
        <div className="w-full md:w-30rem shadow-6 border-round-xl bg-white p-4">
             <AccountView />
        </div>
    </div>
  );
}

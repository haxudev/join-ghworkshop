import PasscodeGate from '@/app/components/PasscodeGate';
import WorkshopContent from '@/app/components/WorkshopContent';
import { hasValidSession } from '@/lib/auth';

export default async function Home() {
  const authenticated = await hasValidSession();

  if (!authenticated) {
    return <PasscodeGate />;
  }

  return <WorkshopContent />;
}
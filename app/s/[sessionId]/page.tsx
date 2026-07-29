import { getSagaSession } from '@/lib/saga/getSagaSession';
import SagaClientView from './SagaClientView';

export default async function SagaSessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const session = await getSagaSession(sessionId);

  if (!session) {
    return <div>Session not found</div>;
  }

  return <SagaClientView session={session} />;
}

import { Badge } from '@/components/ui/badge';

const StatusPill = ({ status }: { status: string }) => {
  return <Badge variant='outline'>{status}</Badge>;
};

export { StatusPill };

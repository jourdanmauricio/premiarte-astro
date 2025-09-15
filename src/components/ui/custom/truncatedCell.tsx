import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useRef } from 'react';
import useTruncateCheck from '@/hooks/useTruncateCheck';

//linesMax: max lines that a text node can break  down line
type Props = { value: string | number; linesMax?: number };

export function TruncatedCell({ value, linesMax = 2 }: Props) {
  const descriptionRef = useRef<HTMLDivElement>(null);
  const isTruncated = useTruncateCheck(
    descriptionRef as React.RefObject<HTMLElement>
  );

  return (
    <div style={{ display: 'flex' }}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            ref={descriptionRef}
            style={{
              ...(!isTruncated && { pointerEvents: 'none' }), //disables popup trigger
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: linesMax,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              cursor: 'default',
            }}
          >
            {value}
          </div>
        </TooltipTrigger>
        <TooltipContent
          className='border-primary-light-pale bg-neutral-50 px-5 py-2 text-base text-neutral-500 shadow-xl'
          side='top'
        >
          {value}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

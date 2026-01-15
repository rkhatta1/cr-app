import { VideoStatus } from '@/types';
import { cn } from '@/lib/utils';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Loading03Icon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  CircleIcon,
} from '@hugeicons/core-free-icons';

interface StatusBadgeProps {
  status: VideoStatus;
  className?: string;
  showText?: boolean;
}

export function StatusBadge({ status, className, showText = true }: StatusBadgeProps) {
  const styles: Record<VideoStatus, string> = {
    [VideoStatus.UPLOADING]:
      'bg-blue-500/10 text-blue-400 border-blue-500/20',
    [VideoStatus.PENDING]:
      'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    [VideoStatus.PROCESSING]:
      'bg-amber-500/10 text-amber-400 border-amber-500/20',
    [VideoStatus.RENDERING]:
      'bg-purple-500/10 text-purple-400 border-purple-500/20',
    [VideoStatus.COMPLETED]: 'bg-primary/10 text-primary border-primary/20',
    [VideoStatus.FAILED]: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  const getIcon = (status: VideoStatus) => {
    switch (status) {
      case VideoStatus.UPLOADING:
      case VideoStatus.PROCESSING:
      case VideoStatus.RENDERING:
      case VideoStatus.PENDING: // Added PENDING here to show spinner
        return (
          <HugeiconsIcon
            icon={Loading03Icon}
            size={14}
            className={showText ? "mr-1.5 animate-spin" : "animate-spin"}
          />
        );
      case VideoStatus.COMPLETED:
        return (
          <HugeiconsIcon
            icon={CheckmarkCircle02Icon}
            size={14}
            className={showText ? "mr-1.5" : ""}
          />
        );
      case VideoStatus.FAILED:
        return (
          <HugeiconsIcon
            icon={AlertCircleIcon}
            size={14}
            className={showText ? "mr-1.5" : ""}
          />
        );
      default:
        return (
          <HugeiconsIcon icon={CircleIcon} size={14} className={showText ? "mr-1.5" : ""} />
        );
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center text-xs font-medium rounded-none',
        styles[status],
        className
      )}
    >
      {getIcon(status)}
      {showText && status}
    </span>
  );
}

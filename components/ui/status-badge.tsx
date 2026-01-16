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
      'text-blue-400',
    [VideoStatus.PENDING]:
      'text-zinc-400',
    [VideoStatus.PROCESSING]:
      'text-amber-400',
    [VideoStatus.RENDERING]:
      'text-purple-400',
    [VideoStatus.COMPLETED]: 'text-primary',
    [VideoStatus.FAILED]: 'text-red-400',
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

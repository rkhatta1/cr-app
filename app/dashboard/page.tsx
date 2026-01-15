'use client';

import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authClient } from '@/lib/auth-client';
import { useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Add01Icon,
  Clock01Icon,
  Delete02Icon,
  PlayCircleIcon,
  Loading03Icon,
} from '@hugeicons/core-free-icons';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Video, VideoStatus } from '@/types';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString();
  } catch (e) {
    return '';
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, isPending: isSessionLoading } = authClient.useSession();

  const currentCount = session?.user?.generationsCount ?? 0;
  const generationLimit = 2;
  const isLimitReached = currentCount >= generationLimit;

  useEffect(() => {
    if (!isSessionLoading && !session) {
      router.push('/login');
    }
  }, [session, isSessionLoading, router]);

  const { data: videos, isLoading: isVideosLoading, isError } = useQuery<Video[]>({
    queryKey: ['videos'],
    queryFn: async () => {
      const res = await fetch('/api/videos');
      if (!res.ok) throw new Error('Failed to fetch videos');
      return res.json();
    },
    enabled: !!session, // Only fetch if authenticated
    refetchInterval: 5000,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/videos/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete video');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
  });

  if (isSessionLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black text-white">
        <HugeiconsIcon icon={Loading03Icon} size={48} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!session) return null; // Prevent flash of content before redirect

  const isLoading = isVideosLoading; // Alias for existing code compatibility

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this video?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Videos</h1>
            <p className="text-muted-foreground">
              Manage your generated content.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Visual indicator for the generation limit */}
            <span className={`text-xs font-mono px-3 py-2 rounded-lg border ${
              isLimitReached ? 'border-primary text-primary' : 'border-zinc-800 text-zinc-500'
            }`}>
              {currentCount}/{generationLimit} GENERATIONS
            </span>

            {/* Main action button */}
            <Button
              onClick={() => router.push('/upload')}
              disabled={isLimitReached}
              className={isLimitReached ? 'opacity-50' : ''}
            >
              <HugeiconsIcon icon={Add01Icon} size={16} className="mr-2" />
              {isLimitReached ? 'Limit Reached' : 'New Video'}
            </Button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading && (
            <div className="col-span-full flex justify-center py-12">
              <HugeiconsIcon
                icon={Loading03Icon}
                size={32}
                className="text-primary animate-spin"
              />
            </div>
          )}

          {isError && (
            <div className="col-span-full text-center py-12 text-red-500">
              Failed to load videos. Please try again later.
            </div>
          )}

          {videos?.map((video) => (
            <Card
              key={video.id}
              onClick={() => router.push(`/videos/${video.id}`)}
              className="flex flex-col h-full group pt-0 gap-0 border-zinc-800 hover:border-primary/50 transition-colors cursor-pointer overflow-hidden"
            >
              {/* Thumbnail Area */}
              <div className="relative aspect-video bg-zinc-900 border-b border-border overflow-hidden">
                {video.status === VideoStatus.COMPLETED ? (
                  <>
                    {video.thumbnailUrl ? (
                      <img
                        src={video.thumbnailUrl}
                        alt={video.filename}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                         <HugeiconsIcon icon={PlayCircleIcon} size={48} className="text-zinc-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <HugeiconsIcon
                        icon={PlayCircleIcon}
                        size={48}
                        className="text-white fill-white/20"
                      />
                    </div>
                    {video.duration && (
                      <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 text-white text-[10px] font-mono rounded-none">
                        {formatDuration(video.duration)}
                      </span>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600">
                    {(video.status === VideoStatus.PROCESSING ||
                      video.status === VideoStatus.RENDERING ||
                      video.status === VideoStatus.PENDING) && (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900/50">
                        <div className="w-12 h-12 border-2 border-primary border-t-transparent animate-spin mb-4 rounded-full" />
                        <span className="text-xs text-primary font-mono">
                          {video.status}
                        </span>
                      </div>
                    )}
                    {video.status === VideoStatus.FAILED && (
                      <span className="text-red-500 font-medium">
                        Processing Failed
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Content Area */}
              <div className="p-4 pb-0 m-0 flex-1 flex justify-between flex-row">
                
                <div className='flex flex-col gap-1'>
                <h3
                  className="text-white font-medium truncate"
                  title={video.filename}
                >
                  {video.filename}
                </h3>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatDate(video.created_at)}</span>
                  <span>·</span>
                  <StatusBadge status={video.status} showText={false} />
                </div>
                </div>
                <div className="flex justify-end gap-3 items-center mb-0">
                  <button
                    className="text-zinc-500 hover:text-red-500 transition-colors p-0"
                    onClick={(e) => handleDelete(e, video.id)}
                    title="Delete Video"
                  >
                    <HugeiconsIcon icon={Delete02Icon} size={18} />
                  </button>
                </div>
              </div>
            </Card>
          ))}

          {/* Create New Placeholder Card */}
          <button
            onClick={() => !isLimitReached && router.push('/upload')}
            disabled={isLimitReached}
            className={`border border-dashed border-zinc-800 flex flex-col items-center justify-center gap-4 transition-all group h-full min-h-[250px] ${
              isLimitReached 
                ? 'opacity-50 grayscale cursor-not-allowed bg-zinc-900/10' 
                : 'hover:border-primary/50 hover:bg-zinc-900/30 cursor-pointer'
            }`}
          >
            <div className="w-12 h-12 bg-zinc-900 flex items-center justify-center group-hover:scale-110 transition-transform border border-zinc-800">
              <HugeiconsIcon
                icon={Add01Icon}
                size={24}
                className={isLimitReached ? 'text-zinc-600' : 'text-zinc-400 group-hover:text-primary'}
              />
            </div>
            <span className="text-sm font-medium text-zinc-400 group-hover:text-primary">
              {isLimitReached ? 'Generation Limit Reached' : 'Create New Project'}
            </span>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

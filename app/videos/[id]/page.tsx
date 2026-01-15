'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  CheckmarkCircle02Icon,
  CircleIcon,
  Loading03Icon,
  Download01Icon,
  Share01Icon,
  Delete02Icon,
  AlertCircleIcon,
} from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { VideoStatus } from '@/types';
import { useUpload } from '@/context/UploadContext';

interface VideoData {
  id: number;
  filename: string;
  duration: number | null;
  status: string;
  progress: number;
  created_at: string;
  deck_description: string | null;
  character: string;
  thumbnailUrl: string | null;
  batches: Array<{
    id: number;
    batch_number: number;
    status: string;
    frame_count: number;
  }>;
  commentary?: {
    status: string;
    text: string;
    events_count: number;
  };
}

interface ProcessingStep {
  id: number;
  label: string;
  status: 'completed' | 'active' | 'waiting' | 'failed';
  estimatedTime?: string;
}

function getProcessingSteps(video: VideoData, uploadProgress?: number): ProcessingStep[] {
  const status = video.status;
  const batches = video.batches || [];
  const commentary = video.commentary;

  // Calculate batch progress
  const totalBatches = batches.length;
  const completedBatches = batches.filter((b) => b.status === 'completed').length;
  const processingBatches = batches.filter((b) => b.status === 'processing').length;
  const failedBatches = batches.filter((b) => b.status === 'failed').length;

  // Determine step statuses
  const steps: ProcessingStep[] = [
    {
      id: 1,
      label: status === 'uploading' && uploadProgress !== undefined
        ? `Uploading (${uploadProgress.toFixed(1)}%)`
        : 'Upload Complete',
      status: status === 'uploading' ? 'active' : 'completed',
    },
    {
      id: 2,
      label: 'Extracting Frames',
      status:
        status === 'uploading' || status === 'pending'
          ? 'waiting'
          : totalBatches > 0
            ? 'completed'
            : 'active',
    },
    {
      id: 3,
      label: `Analyzing Gameplay Events${totalBatches > 0 ? ` (${completedBatches}/${totalBatches})` : ''}`,
      status:
        status === 'uploading' || status === 'pending'
          ? 'waiting'
          : failedBatches > 0
            ? 'failed'
            : completedBatches === totalBatches && totalBatches > 0
              ? 'completed'
              : 'active',
    },
    {
      id: 4,
      label: 'Generating Commentary Script',
      status: commentary
        ? commentary.status === 'completed'
          ? 'completed'
          : commentary.status === 'failed'
            ? 'failed'
            : 'active'
        : completedBatches === totalBatches && totalBatches > 0
          ? 'active'
          : 'waiting',
    },
    {
      id: 5,
      label: 'Synthesizing Voice Audio',
      status: commentary?.status === 'completed'
        ? status === 'rendering' || status === 'completed'
          ? 'completed'
          : 'active'
        : 'waiting',
    },
    {
      id: 6,
      label: 'Rendering Final Video',
      status:
        status === 'completed'
          ? 'completed'
          : status === 'rendering'
            ? 'active'
            : status === 'failed'
              ? 'failed'
              : 'waiting',
    },
  ];

  return steps;
}

function calculateProgress(video: VideoData, uploadProgress?: number): number {
  const status = video.status;
  const batches = video.batches || [];
  const commentary = video.commentary;

  // If video is uploading and we have upload progress from context
  if (status === 'uploading' && uploadProgress !== undefined) {
    return Math.min(uploadProgress, 99);
  }

  if (status === 'completed') return 100;
  if (status === 'failed') return 0;
  if (status === 'pending') return 5;

  const totalBatches = batches.length;
  const completedBatches = batches.filter((b) => b.status === 'completed').length;

  // Stages: Upload (5%) + Frames (10%) + Analysis (50%) + Commentary (15%) + Audio (10%) + Render (10%)
  let progress = 5; // Upload done

  if (totalBatches > 0) {
    progress += 10; // Frames extracted
    progress += Math.round((completedBatches / totalBatches) * 50); // Analysis progress
  }

  if (commentary) {
    if (commentary.status === 'completed') {
      progress += 15 + 10; // Commentary + Audio done
    } else if (commentary.status === 'processing') {
      progress += 7; // Commentary in progress
    }
  }

  if (status === 'rendering') {
    progress = 90;
  }

  return Math.min(progress, 99);
}

export default function VideoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { uploads } = useUpload();
  const uploadState = uploads[parseInt(id)];

  const { data: video, isLoading, error } = useQuery<VideoData>({
    queryKey: ['video', id],
    queryFn: async () => {
      const res = await fetch(`/api/videos/${id}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error('Video not found');
        throw new Error('Failed to fetch video');
      }
      return res.json();
    },
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'completed' || status === 'failed') {
        return false;
      }
      return 3000;
    },
    staleTime: 60000,
  });

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/videos/${id}/download`);
      if (!response.ok) throw new Error('Failed to get download URL');
      const data = await response.json();
      window.open(data.download_url, '_blank');
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download video');
    }
  };

  const getCharacterName = (charId: string) => {
    const names: Record<string, string> = {
      peter: 'Peter Griffin',
      spongebob: 'SpongeBob',
      drake: 'Drake',
      joerogan: 'Joe Rogan',
    };
    return names[charId] || 'The Commentator';
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <HugeiconsIcon
            icon={Loading03Icon}
            size={48}
            className="text-primary animate-spin"
          />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !video) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] gap-4">
          <HugeiconsIcon
            icon={AlertCircleIcon}
            size={48}
            className="text-red-500"
          />
          <p className="text-white text-lg">
            {error instanceof Error ? error.message : 'Video not found'}
          </p>
          <Button onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const isCompleted = video.status === 'completed';
  const isFailed = video.status === 'failed';
  const isUploading = video.status === 'uploading';
  const steps = getProcessingSteps(video, uploadState?.progress);
  const progress = calculateProgress(video, uploadState?.progress);
  const characterName = getCharacterName(video.character || 'peter');

  const getVideoStatus = (): VideoStatus => {
    switch (video.status) {
      case 'completed':
        return VideoStatus.COMPLETED;
      case 'failed':
        return VideoStatus.FAILED;
      case 'pending':
        return VideoStatus.PENDING;
      default:
        return VideoStatus.PROCESSING;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-8 max-w-7xl mx-auto h-[calc(100vh-64px)] overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white truncate max-w-md">
                {video.filename.replace(/\.[^/.]+$/, '')}
              </h1>
              <StatusBadge status={getVideoStatus()} />
            </div>
            <p className="text-muted-foreground text-sm">
              Created on {new Date(video.created_at).toLocaleDateString()} -{' '}
              {isCompleted
                ? `${Math.round((video.duration || 0) / 60)}:${String(
                    Math.round((video.duration || 0) % 60)
                  ).padStart(2, '0')} duration`
                : isFailed
                ? 'Processing failed'
                : 'Processing...'}
            </p>
          </div>

          {isCompleted && (
            <div className="flex gap-2">
              <Button variant="secondary">
                <HugeiconsIcon icon={Share01Icon} size={16} className="mr-2" />
                Share
              </Button>
              <Button onClick={handleDownload}>
                <HugeiconsIcon icon={Download01Icon} size={16} className="mr-2" />
                Download
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area (Player or Progress) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="aspect-video bg-black border border-zinc-800 overflow-hidden relative shadow-2xl">
              {isCompleted ? (
                <div className="w-full h-full flex items-center justify-center bg-zinc-900 group cursor-pointer relative">
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      alt="Video"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                      <HugeiconsIcon
                        icon={Loading03Icon}
                        size={48}
                        className="text-zinc-600"
                      />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-[0_0_30px_rgba(170,255,0,0.4)] group-hover:scale-110 transition-transform">
                      <svg
                        className="w-8 h-8 text-black fill-black ml-1"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              ) : isFailed ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-red-950/20 p-8 text-center">
                  <HugeiconsIcon
                    icon={AlertCircleIcon}
                    size={48}
                    className="text-red-500 mb-4"
                  />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Processing Failed
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Something went wrong while processing your video.
                  </p>
                  <Button
                    variant="secondary"
                    onClick={() => router.push('/upload')}
                  >
                    Try Again
                  </Button>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900/50 p-8 text-center">
                  <div className="w-full max-w-md space-y-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white font-medium">
                        {isUploading ? 'Uploading Video...' : 'Processing Video...'}
                      </span>
                      <span className="text-primary">{progress.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    {isUploading ? (
                      <p className="text-muted-foreground text-sm animate-pulse">
                        Uploading to cloud storage...
                      </p>
                    ) : (
                      <p className="text-muted-foreground text-sm animate-pulse">
                        {characterName} is analyzing your deck usage...
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Status (Timeline) */}
          <div className="space-y-6">
            <div className="bg-card border border-border p-6">
              <h3 className="text-lg font-semibold text-white mb-6">
                Processing Status
              </h3>
              <div className="space-y-6 relative">
                {/* Vertical Line */}
                <div className="absolute left-3 top-2 bottom-2 w-px bg-zinc-800" />

                {steps.map((step) => (
                  <div key={step.id} className="relative flex items-start gap-4">
                    <div
                      className={`
                      relative z-10 w-6 h-6 rounded-full flex items-center justify-center border-2
                      ${
                        step.status === 'completed'
                          ? 'bg-primary border-primary'
                          : step.status === 'active'
                            ? 'bg-zinc-900 border-primary animate-pulse'
                            : step.status === 'failed'
                              ? 'bg-red-500 border-red-500'
                              : 'bg-zinc-900 border-zinc-700'
                      }
                   `}
                    >
                      {step.status === 'completed' && (
                        <HugeiconsIcon
                          icon={CheckmarkCircle02Icon}
                          size={12}
                          className="text-black"
                        />
                      )}
                      {step.status === 'active' && (
                        <HugeiconsIcon
                          icon={Loading03Icon}
                          size={12}
                          className="text-primary animate-spin"
                        />
                      )}
                      {step.status === 'failed' && (
                        <HugeiconsIcon
                          icon={AlertCircleIcon}
                          size={12}
                          className="text-white"
                        />
                      )}
                      {step.status === 'waiting' && (
                        <HugeiconsIcon
                          icon={CircleIcon}
                          size={8}
                          className="text-zinc-700 fill-zinc-700"
                        />
                      )}
                    </div>
                    <div className="flex-1 pt-0.5">
                      <p
                        className={`text-sm font-medium ${
                          step.status === 'active'
                            ? 'text-primary'
                            : step.status === 'completed'
                              ? 'text-zinc-300'
                              : step.status === 'failed'
                                ? 'text-red-500'
                                : 'text-zinc-500'
                        }`}
                      >
                        {step.label}
                      </p>
                      {step.status === 'active' && step.estimatedTime && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {step.estimatedTime}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button
              variant="destructive"
              className="w-full"
              onClick={() => {
                if (confirm('Are you sure you want to delete this project?')) {
                  router.push('/dashboard');
                }
              }}
            >
              <HugeiconsIcon icon={Delete02Icon} size={16} className="mr-2" />
              Delete Project
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export enum VideoStatus {
  UPLOADING = 'uploading',
  PENDING = 'pending',
  PROCESSING = 'processing',
  RENDERING = 'rendering',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface Video {
  id: number;
  filename: string;
  thumbnailUrl?: string;
  status: VideoStatus;
  created_at: string;
  duration?: number;
  progress?: number;
  deckDescription?: string;
  gcsInputPath?: string;
  gcsOutputPath?: string;
}

export interface VideoBatch {
  id: number;
  batch_number: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  frame_count: number;
}

export interface VideoStatusResponse {
  id: number;
  filename: string;
  duration: number | null;
  status: 'pending' | 'processing' | 'rendering' | 'completed' | 'failed';
  created_at: string;
  deck_description: string | null;
  batches: VideoBatch[];
  commentary?: {
    status: string;
    text: string;
    events_count: number;
  };
}

export type ProcessingStep = {
  id: number;
  label: string;
  status: 'waiting' | 'active' | 'completed' | 'failed';
};

export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
  email: string;
}

export type UploadStep = 'SELECT' | 'DETAILS' | 'UPLOADING' | 'COMPLETE';

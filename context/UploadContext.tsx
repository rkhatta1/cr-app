'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface UploadState {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
  uploadUrl?: string;
  gcsObjectName?: string;
}

interface UploadContextType {
  uploads: Record<number, UploadState>;
  startUpload: (file: File, metadata: any) => Promise<number>;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export function UploadProvider({ children }: { children: React.ReactNode }) {
  const [uploads, setUploads] = useState<Record<number, UploadState>>({});
  const router = useRouter();

  const updateUpload = (id: number, updates: Partial<UploadState>) => {
    setUploads((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...updates },
    }));
  };

  const uploadToGCS = async (
    uploadUrl: string,
    file: File,
    videoId: number
  ) => {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          updateUpload(videoId, { progress });
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type || 'video/mp4');
      xhr.send(file);
    });
  };

  const startUpload = useCallback(async (file: File, metadata: any) => {
    // 1. Create placeholder video
    const createRes = await fetch('/api/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: file.name,
        deck_description: metadata.deckDesc,
        character: metadata.character,
        status: 'uploading',
      }),
    });

    if (!createRes.ok) throw new Error('Failed to create video record');
    const videoData = await createRes.json();
    const videoId = videoData.id;

    // 2. Get upload URL
    const initRes = await fetch('/api/upload/init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: file.name,
        content_type: file.type || 'video/mp4',
        size: file.size,
      }),
    });

    if (!initRes.ok) throw new Error('Failed to initialize upload');
    const { upload_url, object_name } = await initRes.json();

    // 3. Initialize state
    setUploads((prev) => ({
      ...prev,
      [videoId]: {
        file,
        progress: 0,
        status: 'uploading',
        uploadUrl: upload_url,
        gcsObjectName: object_name,
      },
    }));

    // 4. Start async upload (don't await here, let it run in background)
    uploadToGCS(upload_url, file, videoId)
      .then(async () => {
        // Upload finished
        updateUpload(videoId, { progress: 100, status: 'completed' });

        // Trigger processing
        await fetch(`/api/videos/${videoId}/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gcs_object_name: object_name }),
        });
      })
      .catch((err) => {
        console.error('Upload failed:', err);
        updateUpload(videoId, { status: 'error', error: err.message });
      });

    return videoId;
  }, []);

  return (
    <UploadContext.Provider value={{ uploads, startUpload }}>
      {children}
    </UploadContext.Provider>
  );
}

export function useUpload() {
  const context = useContext(UploadContext);
  if (context === undefined) {
    throw new Error('useUpload must be used within an UploadProvider');
  }
  return context;
}

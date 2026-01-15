'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  CloudUploadIcon,
  Video02Icon,
  Cancel01Icon,
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  Loading03Icon,
} from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useUpload } from '@/context/UploadContext';

enum UploadStep {
  SELECT = 0,
  DETAILS = 1,
  UPLOADING = 2,
  COMPLETE = 3,
}

interface Character {
  id: string;
  name: string;
  show: string;
}

// Character avatar/emoji mapping for visual selection
const CHARACTER_AVATARS: Record<string, string> = {
  peter: '👨',
  spongebob: '🧽',
  drake: '🎤',
  joerogan: '🎙️',
};

export default function UploadPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionLoading } = authClient.useSession();
  const { startUpload: startUploadContext } = useUpload();
  const [step, setStep] = useState<UploadStep>(UploadStep.SELECT);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!isSessionLoading && !session) {
      router.push('/login');
      return;
    }

    if (!isSessionLoading && session) {
      const currentCount = session.user.generationsCount ?? 0;
      if (currentCount >= 2) {
        console.warn('Access denied: Generation limit reached');
        router.push('/dashboard');
      }
    }
  }, [session, isSessionLoading, router]);

  const [deckDesc, setDeckDesc] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState('peter');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch available characters on mount
  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const response = await fetch('/api/characters');
        if (response.ok) {
          const data = await response.json();
          setCharacters(data.characters || []);
          if (data.default) {
            setSelectedCharacter(data.default);
          }
        }
      } catch (err) {
        console.error('Failed to fetch characters:', err);
        // Fallback characters
        setCharacters([
          { id: 'peter', name: 'Peter Griffin', show: 'Family Guy' },
          { id: 'spongebob', name: 'SpongeBob', show: 'SpongeBob SquarePants' },
          { id: 'drake', name: 'Drake', show: 'Rapper' },
          { id: 'joerogan', name: 'Joe Rogan', show: 'JRE Podcast' },
        ]);
      }
    };
    fetchCharacters();
  }, []);

  if (isSessionLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black text-white">
        <HugeiconsIcon icon={Loading03Icon} size={48} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!session) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 500 * 1024 * 1024) {
        setError('File too large. Maximum size is 500MB.');
        return;
      }
      setError(null);
      setFile(selectedFile);
    }
  };

  const startUpload = async () => {
    if (!file || isUploading) return;

    setIsUploading(true);
    setError(null);

    try {
      // Start upload via context (creates video record and starts background upload)
      const videoId = await startUploadContext(file, {
        deckDesc: deckDesc || undefined,
        character: selectedCharacter,
      });

      // Redirect immediately to video page
      // The video page will see status='uploading' and show progress from context
      router.push(`/videos/${videoId}`);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
      setStep(UploadStep.DETAILS);
      setIsUploading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case UploadStep.SELECT:
        return (
          <div className="space-y-6">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-800 hover:border-primary/50 hover:bg-zinc-900/50 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all group"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="video/mp4,video/webm,video/quicktime"
              />
              <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <HugeiconsIcon
                  icon={CloudUploadIcon}
                  size={32}
                  className="text-primary"
                />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Upload Gameplay Video
              </h3>
              <p className="text-muted-foreground text-center max-w-sm mb-6">
                Drag and drop your MP4, MOV or WebM file here.
                <br />
                <span className="text-zinc-500 text-xs">
                  Max duration 5 mins - Max size 500MB
                </span>
              </p>
              <Button
                variant="secondary"
                className="rounded-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Browse Files
              </Button>
            </div>

            {file && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center">
                    <HugeiconsIcon
                      icon={Video02Icon}
                      size={20}
                      className="text-primary"
                    />
                  </div>
                  <div>
                    <p className="text-white font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-green-500 text-sm flex items-center gap-1">
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} />{' '}
                    Ready
                  </span>
                  <Button
                    size="sm"
                    className="rounded-lg"
                    onClick={() => setStep(UploadStep.DETAILS)}
                  >
                    Next{' '}
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      size={16}
                      className="ml-1"
                    />
                  </Button>
                </div>
              </div>
            )}
          </div>
        );

      case UploadStep.DETAILS:
        return (
          <div className="space-y-6 max-w-xl mx-auto">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                <HugeiconsIcon icon={AlertCircleIcon} size={20} className="text-red-500 mt-0.5" />
                <div>
                  <p className="text-red-500 font-medium">Upload Failed</p>
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Character Selection */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Choose Your Commentator</h3>
              <p className="text-muted-foreground text-sm">
                Pick a character to roast your gameplay.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {characters.map((char) => (
                  <button
                    key={char.id}
                    onClick={() => setSelectedCharacter(char.id)}
                    className={`
                      p-4 rounded-xl border-2 transition-all text-left
                      ${selectedCharacter === char.id
                        ? 'border-primary bg-primary/10'
                        : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">
                        {CHARACTER_AVATARS[char.id] || '🎭'}
                      </span>
                      <div>
                        <p className={`font-medium ${selectedCharacter === char.id ? 'text-primary' : 'text-white'}`}>
                          {char.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{char.show}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Deck Description */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Deck Details</h3>
              <p className="text-muted-foreground text-sm">
                Tell {characters.find(c => c.id === selectedCharacter)?.name || 'the commentator'} about your deck so they can roast specifically.
              </p>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Deck Description (Optional)
                </label>
                <Textarea
                  value={deckDesc}
                  onChange={(e) => setDeckDesc(e.target.value)}
                  placeholder="e.g. 2.6 Hog Cycle with Ice Golem, Musketeer, and Fireball..."
                  className="w-full bg-card border-border rounded-lg p-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent min-h-[120px]"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                variant="ghost"
                className="rounded-lg"
                onClick={() => setStep(UploadStep.SELECT)}
                disabled={isUploading}
              >
                Back
              </Button>
              <Button
                className="flex-1 rounded-lg"
                onClick={startUpload}
                disabled={isUploading}
              >
                {isUploading ? 'Starting...' : 'Start Processing'}
              </Button>
            </div>
          </div>
        );

      // UPLOADING and COMPLETE steps are no longer reachable/needed here
      // as we redirect immediately, but keeping cases for TS exhaustiveness if needed
      // or just removing them is fine.
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-lg"
            onClick={() => router.push('/dashboard')}
          >
            <HugeiconsIcon icon={Cancel01Icon} size={16} className="mr-2" />
            Cancel Upload
          </Button>
        </div>

        <div className="mt-8">{renderStepContent()}</div>
      </div>
    </DashboardLayout>
  );
}

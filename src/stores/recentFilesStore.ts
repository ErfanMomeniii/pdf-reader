import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RecentFile {
  path: string;
  name: string;
  timestamp: number;
}

interface RecentFilesState {
  files: RecentFile[];
  maxFiles: number;

  addFile: (path: string) => void;
  removeFile: (path: string) => void;
  clearAll: () => void;
}

function getFileName(path: string): string {
  const parts = path.split(/[/\\]/);
  return parts[parts.length - 1] || path;
}

export const useRecentFilesStore = create<RecentFilesState>()(
  persist(
    (set, get) => ({
      files: [],
      maxFiles: 10,

      addFile: (path: string) => {
        const { files, maxFiles } = get();
        const name = getFileName(path);
        const timestamp = Date.now();

        const filtered = files.filter((f) => f.path !== path);

        const newFiles = [
          { path, name, timestamp },
          ...filtered,
        ].slice(0, maxFiles);

        set({ files: newFiles });
      },

      removeFile: (path: string) => {
        const { files } = get();
        set({ files: files.filter((f) => f.path !== path) });
      },

      clearAll: () => {
        set({ files: [] });
      },
    }),
    {
      name: 'pdf-reader-recent-files',
    }
  )
);

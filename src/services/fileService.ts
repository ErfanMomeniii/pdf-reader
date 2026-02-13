import { open } from '@tauri-apps/plugin-dialog';
import { readFile } from '@tauri-apps/plugin-fs';

export interface FileOpenResult {
  success: true;
  filePath: string;
  data: Uint8Array;
}

export interface FileOpenError {
  success: false;
  cancelled?: boolean;
  error?: string;
}

export type FileOpenResponse = FileOpenResult | FileOpenError;

export async function openFileDialog(): Promise<FileOpenResponse> {
  try {
    const selected = await open({
      multiple: false,
      filters: [
        {
          name: 'PDF Documents',
          extensions: ['pdf'],
        },
      ],
    });

    if (!selected) {
      return { success: false, cancelled: true };
    }

    const filePath = typeof selected === 'string' ? selected : selected[0];
    const data = await readFile(filePath);

    return {
      success: true,
      filePath,
      data,
    };
  } catch (err) {
    return {
      success: false,
      error: (err as Error).message,
    };
  }
}

export async function openFile(filePath: string): Promise<FileOpenResponse> {
  try {
    const data = await readFile(filePath);
    return {
      success: true,
      filePath,
      data,
    };
  } catch (err) {
    return {
      success: false,
      error: (err as Error).message,
    };
  }
}

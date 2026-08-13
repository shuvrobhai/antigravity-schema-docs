/// <reference types="vite/client" />

/**
 * File System Access API additions that lib.dom (TS 5.7) does not yet declare:
 * `Window.showDirectoryPicker()` and the async `entries()` iterator on
 * `FileSystemDirectoryHandle`. The rest of the handle surface (getFile,
 * createWritable, getDirectoryHandle, ...) is already in lib.dom.
 */
interface FileSystemDirectoryHandle {
  /** Async iterator over [name, handle] pairs — declaration-merges with lib.dom. */
  entries(): AsyncIterableIterator<[string, FileSystemHandle]>;
}

interface Window {
  showDirectoryPicker(options?: { mode?: 'read' | 'readwrite' }): Promise<FileSystemDirectoryHandle>;
}

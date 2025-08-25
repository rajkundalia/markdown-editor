'use client';

import { useRef, useCallback, useState } from 'react';
import { Download, Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { FileOperationsProps } from '@/types';

/**
 * File Operations Component
 * Handles import/export of markdown files with proper TypeScript typing
 */
export function FileOperations({ content, onImport, className = '' }: FileOperationsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Show notification temporarily
  const showNotification = useCallback((type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // Export current content as .md file
  const exportMarkdown = useCallback(() => {
    try {
      if (!content.trim()) {
        showNotification('error', 'No content to export');
        return;
      }

      // Create blob with markdown content
      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 16).replace(/:/g, '-');
      const filename = `markdown-document-${timestamp}.md`;

      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup
      URL.revokeObjectURL(url);

      showNotification('success', `Exported as ${filename}`);
    } catch (error) {
      console.error('Export failed:', error);
      showNotification('error', 'Export failed. Please try again.');
    }
  }, [content, showNotification]);

  // Import markdown file
  const importMarkdown = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  // Process a file (used by both file input and drag & drop)
  const processFile = useCallback((file: File) => {
    // Validate file type
    const validTypes = ['.md', '.markdown', '.txt'];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    
    if (!validTypes.includes(fileExtension)) {
      showNotification('error', 'Please select a .md, .markdown, or .txt file');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      showNotification('error', 'File too large. Maximum size is 10MB');
      return;
    }

    // Read file content
    const reader = new FileReader();
    
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const content = e.target?.result as string;
        
        if (typeof content !== 'string') {
          throw new Error('Failed to read file content');
        }

        // Import the content
        onImport(content);
        showNotification('success', `Imported ${file.name}`);
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error('Import failed:', error);
        showNotification('error', 'Failed to read file content');
      }
    };

    reader.onerror = () => {
      console.error('File reader error');
      showNotification('error', 'Failed to read file');
    };

    // Read as text
    reader.readAsText(file, 'utf-8');
  }, [onImport, showNotification]);

  // Handle file selection
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;

    processFile(file);
  }, [processFile]);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    const markdownFile = files.find(file => {
      const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
      return ['.md', '.markdown', '.txt'].includes(extension);
    });

    if (!markdownFile) {
      showNotification('error', 'Please drop a .md, .markdown, or .txt file');
      return;
    }

    // Process the dropped file directly
    processFile(markdownFile);
  }, [processFile, showNotification]);

  const baseClasses = [
    'flex',
    'items-center',
    'gap-2',
    'p-2',
  ].join(' ');

  return (
    <div className={`${baseClasses} ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".md,.markdown,.txt"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Import markdown file"
      />

      {/* Import button */}
      <button
        onClick={importMarkdown}
        className={[
          'inline-flex',
          'items-center',
          'gap-2',
          'px-3',
          'py-1.5',
          'text-sm',
          'font-medium',
          'text-foreground',
          'bg-background',
          'border',
          'border-border',
          'rounded-md',
          'hover:bg-muted',
          'focus:outline-none',
          'focus:ring-2',
          'focus:ring-primary',
          'focus:ring-offset-1',
          'transition-colors',
          'duration-200',
        ].join(' ')}
        title="Import markdown file"
        type="button"
      >
        <Upload size={16} />
        <span className="hidden sm:inline">Import</span>
      </button>

      {/* Export button */}
      <button
        onClick={exportMarkdown}
        disabled={!content.trim()}
        className={[
          'inline-flex',
          'items-center',
          'gap-2',
          'px-3',
          'py-1.5',
          'text-sm',
          'font-medium',
          'text-foreground',
          'bg-background',
          'border',
          'border-border',
          'rounded-md',
          'hover:bg-muted',
          'focus:outline-none',
          'focus:ring-2',
          'focus:ring-primary',
          'focus:ring-offset-1',
          'transition-colors',
          'duration-200',
          'disabled:opacity-50',
          'disabled:cursor-not-allowed',
          'disabled:hover:bg-background',
        ].join(' ')}
        title="Export as .md file"
        type="button"
      >
        <Download size={16} />
        <span className="hidden sm:inline">Export</span>
      </button>

      {/* New document button */}
      <button
        onClick={() => {
          if (content.trim() && !confirm('Are you sure? This will clear your current content.')) {
            return;
          }
          onImport('');
          showNotification('success', 'New document created');
        }}
        className={[
          'inline-flex',
          'items-center',
          'gap-2',
          'px-3',
          'py-1.5',
          'text-sm',
          'font-medium',
          'text-foreground',
          'bg-background',
          'border',
          'border-border',
          'rounded-md',
          'hover:bg-muted',
          'focus:outline-none',
          'focus:ring-2',
          'focus:ring-primary',
          'focus:ring-offset-1',
          'transition-colors',
          'duration-200',
        ].join(' ')}
        title="Create new document"
        type="button"
      >
        <FileText size={16} />
        <span className="hidden sm:inline">New</span>
      </button>

      {/* Drop zone indicator (hidden by default, shown during drag) */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="fixed inset-0 pointer-events-none z-50 hidden"
        id="drop-zone"
      >
        <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Upload size={48} className="mx-auto mb-4 text-primary" />
              <p className="text-lg font-medium text-primary">Drop your markdown file here</p>
              <p className="text-sm text-muted-foreground">.md, .markdown, or .txt files</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={[
            'fixed',
            'top-4',
            'right-4',
            'flex',
            'items-center',
            'gap-2',
            'px-4',
            'py-3',
            'rounded-md',
            'shadow-lg',
            'z-50',
            'animate-in',
            'slide-in-from-right-5',
            'duration-300',
            notification.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          ].join(' ')}
          role="alert"
        >
          {notification.type === 'success' ? (
            <CheckCircle size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Global drag and drop listeners */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            let dragCounter = 0;
            const dropZone = document.getElementById('drop-zone');
            
            document.addEventListener('dragenter', function(e) {
              e.preventDefault();
              dragCounter++;
              if (dropZone) {
                dropZone.classList.remove('hidden');
                dropZone.classList.add('pointer-events-auto');
              }
            });
            
            document.addEventListener('dragleave', function(e) {
              e.preventDefault();
              dragCounter--;
              if (dragCounter <= 0 && dropZone) {
                dropZone.classList.add('hidden');
                dropZone.classList.remove('pointer-events-auto');
                dragCounter = 0;
              }
            });
            
            document.addEventListener('drop', function(e) {
              e.preventDefault();
              dragCounter = 0;
              if (dropZone) {
                dropZone.classList.add('hidden');
                dropZone.classList.remove('pointer-events-auto');
              }
            });
          `,
        }}
      />
    </div>
  );
}
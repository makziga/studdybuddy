'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image, FileText, AlertCircle } from 'lucide-react';
import { FileAttachment } from '@/types';

interface FileUploadProps {
  onFilesSelected: (files: FileAttachment[]) => void;
  selectedFiles: FileAttachment[];
  maxFileSize?: number; // in MB
  disabled?: boolean;
}

const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const SUPPORTED_PDF_TYPE = 'application/pdf';
const SUPPORTED_TYPES = [...SUPPORTED_IMAGE_TYPES, SUPPORTED_PDF_TYPE];

export default function FileUpload({ 
  onFilesSelected, 
  selectedFiles, 
  maxFileSize = 10,
  disabled = false 
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (!SUPPORTED_TYPES.includes(file.type)) {
      return `File type ${file.type} is not supported. Please upload images (JPEG, PNG, WebP, GIF) or PDF files.`;
    }
    
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB`;
    }
    
    return null;
  };

  const processFile = async (file: File): Promise<FileAttachment> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const fileAttachment: FileAttachment = {
          id: `${Date.now()}-${file.name}`,
          name: file.name,
          type: file.type,
          size: file.size,
          data: result,
          url: result // For preview
        };
        resolve(fileAttachment);
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = async (files: FileList) => {
    setError(null);
    const newFiles: FileAttachment[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validationError = validateFile(file);
      
      if (validationError) {
        setError(validationError);
        return;
      }
      
      try {
        const processedFile = await processFile(file);
        newFiles.push(processedFile);
      } catch (error) {
        setError('Failed to process file');
        return;
      }
    }
    
    onFilesSelected([...selectedFiles, ...newFiles]);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (fileId: string) => {
    const updatedFiles = selectedFiles.filter(file => file.id !== fileId);
    onFilesSelected(updatedFiles);
    setError(null);
  };

  const getFileIcon = (type: string) => {
    if (SUPPORTED_IMAGE_TYPES.includes(type)) {
      return <Image className="h-4 w-4" />;
    } else if (type === SUPPORTED_PDF_TYPE) {
      return <FileText className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  return (
    <div className="space-y-3">
      {/* File Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-2xl p-4 transition-all ${
          isDragging && !disabled
            ? 'border-black bg-gray-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={SUPPORTED_TYPES.join(',')}
          onChange={handleFileInputChange}
          disabled={disabled}
          className="hidden"
        />
        
        <div className="flex flex-col items-center justify-center py-2">
          <Upload className={`h-8 w-8 mb-2 ${disabled ? 'text-gray-400' : 'text-gray-500'}`} />
          <p className={`text-sm ${disabled ? 'text-gray-400' : 'text-gray-600'}`}>
            <span className="font-medium">Click to upload</span> or drag and drop
          </p>
          <p className={`text-xs mt-1 ${disabled ? 'text-gray-400' : 'text-gray-500'}`}>
            Images (JPEG, PNG, WebP, GIF) or PDF files up to {maxFileSize}MB
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-2xl">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Attached files:</p>
          {selectedFiles.map((file) => (
            <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-200">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                {getFileIcon(file.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                onClick={() => removeFile(file.id)}
                disabled={disabled}
                className={`ml-2 p-1 rounded-full ${
                  disabled 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
                }`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
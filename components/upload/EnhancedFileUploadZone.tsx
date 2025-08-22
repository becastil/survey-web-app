'use client';
import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  FileText, 
  FileSpreadsheet, 
  FileImage,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  File
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface UploadedFile {
  id: string;
  file: File;
  status: 'pending' | 'processing' | 'success' | 'error';
  progress: number;
  error?: string;
  preview?: any;
  validationResults?: ValidationResult[];
}

interface ValidationResult {
  field: string;
  status: 'valid' | 'warning' | 'error';
  message: string;
}

interface EnhancedFileUploadZoneProps {
  onFilesProcessed: (files: UploadedFile[]) => void;
  acceptedFormats?: string[];
  maxFiles?: number;
  maxFileSize?: number; // in MB
}

const fileIcons = {
  csv: FileSpreadsheet,
  xlsx: FileSpreadsheet,
  xls: FileSpreadsheet,
  pdf: FileText,
  txt: FileText,
  default: File
};

const formatDescriptions = {
  csv: 'Comma-separated values',
  xlsx: 'Excel spreadsheet',
  pdf: 'PDF document',
  txt: 'Text file'
};

export function EnhancedFileUploadZone({
  onFilesProcessed,
  acceptedFormats = ['csv', 'xlsx', 'xls', 'pdf', 'txt'],
  maxFiles = 5,
  maxFileSize = 10 // 10MB default
}: EnhancedFileUploadZoneProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Process accepted files
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      status: 'pending' as const,
      progress: 0
    }));

    // Add rejected files with error status
    rejectedFiles.forEach(rejected => {
      const errorMessage = rejected.errors?.map((e: any) => e.message).join(', ') || 'File rejected';
      newFiles.push({
        id: Math.random().toString(36).substring(7),
        file: rejected.file,
        status: 'error',
        progress: 0,
        error: errorMessage
      });
    });

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Start processing accepted files
    newFiles
      .filter(f => f.status === 'pending')
      .forEach(fileObj => processFile(fileObj));
  }, []);

  const processFile = async (fileObj: UploadedFile) => {
    // Update status to processing
    updateFileStatus(fileObj.id, 'processing', 10);

    try {
      // Simulate file processing with progress updates
      for (let i = 20; i <= 90; i += 20) {
        await new Promise(resolve => setTimeout(resolve, 300));
        updateFileProgress(fileObj.id, i);
      }

      // Validate healthcare data fields
      const validationResults = await validateHealthcareData(fileObj.file);
      
      updateFileStatus(fileObj.id, 'success', 100, undefined, validationResults);
      
      // Notify parent component
      setUploadedFiles(prev => {
        const updated = [...prev];
        const file = updated.find(f => f.id === fileObj.id);
        if (file) {
          onFilesProcessed([file]);
        }
        return updated;
      });
    } catch (error: any) {
      updateFileStatus(fileObj.id, 'error', 0, error.message);
    }
  };

  const validateHealthcareData = async (file: File): Promise<ValidationResult[]> => {
    // Mock validation - in real app, parse file and check fields
    const results: ValidationResult[] = [];
    
    // Simulate validation checks
    const requiredFields = [
      'Organization Name',
      'Region',
      'Employee Count',
      'Medical Plans'
    ];

    // Mock validation results
    results.push({
      field: 'Organization Name',
      status: 'valid',
      message: 'Field detected and valid'
    });

    results.push({
      field: 'Region',
      status: 'valid',
      message: 'Geographic data recognized'
    });

    if (Math.random() > 0.5) {
      results.push({
        field: 'Employee Count',
        status: 'warning',
        message: 'Some missing values detected'
      });
    }

    return results;
  };

  const updateFileStatus = (
    id: string, 
    status: UploadedFile['status'], 
    progress?: number,
    error?: string,
    validationResults?: ValidationResult[]
  ) => {
    setUploadedFiles(prev => prev.map(f => 
      f.id === id 
        ? { ...f, status, progress: progress ?? f.progress, error, validationResults }
        : f
    ));
  };

  const updateFileProgress = (id: string, progress: number) => {
    setUploadedFiles(prev => prev.map(f => 
      f.id === id ? { ...f, progress } : f
    ));
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearAll = () => {
    setUploadedFiles([]);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    accept: acceptedFormats.reduce((acc, format) => {
      const mimeTypes: Record<string, string[]> = {
        csv: ['text/csv', 'application/csv'],
        xlsx: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        xls: ['application/vnd.ms-excel'],
        pdf: ['application/pdf'],
        txt: ['text/plain']
      };
      
      if (mimeTypes[format]) {
        mimeTypes[format].forEach(mime => {
          acc[mime] = [`.${format}`];
        });
      }
      return acc;
    }, {} as Record<string, string[]>),
    maxFiles,
    maxSize: maxFileSize * 1024 * 1024 // Convert MB to bytes
  });

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    const Icon = fileIcons[extension as keyof typeof fileIcons] || fileIcons.default;
    return Icon;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div
          {...getRootProps()}
          className={cn(
            "relative overflow-hidden rounded-xl border-2 border-dashed p-8 transition-all cursor-pointer",
            isDragActive 
              ? "border-blue-500 bg-blue-50/50 scale-[1.02]" 
              : "border-gray-300 hover:border-gray-400 hover:bg-gray-50/50"
          )}
        >
          <input {...getInputProps()} />
          
          {/* Animated background pattern */}
          <motion.div
            className="absolute inset-0 opacity-5"
            animate={{
              backgroundPosition: isDragActive ? ['0% 0%', '100% 100%'] : '0% 0%'
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              backgroundSize: '60px 60px'
            }}
          />

          <div className="relative flex flex-col items-center justify-center text-center space-y-4">
            <motion.div
              animate={isDragActive ? { scale: 1.2, rotate: 360 } : { scale: 1, rotate: 0 }}
              transition={{ duration: 0.3 }}
              className="p-4 bg-blue-100 rounded-full"
            >
              <Upload className="h-8 w-8 text-blue-600" />
            </motion.div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {isDragActive ? 'Drop your files here' : 'Upload Healthcare Survey Data'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Drag & drop or click to select files
              </p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {acceptedFormats.map(format => (
                <Badge key={format} variant="secondary" className="text-xs">
                  .{format} - {formatDescriptions[format as keyof typeof formatDescriptions] || format}
                </Badge>
              ))}
            </div>

            <p className="text-xs text-gray-400">
              Maximum {maxFiles} files, up to {maxFileSize}MB each
            </p>
          </div>
        </div>
      </motion.div>

      {/* Uploaded Files List */}
      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">
                Uploaded Files ({uploadedFiles.length})
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="text-xs"
              >
                Clear All
              </Button>
            </div>

            <div className="space-y-2">
              {uploadedFiles.map(fileObj => {
                const Icon = getFileIcon(fileObj.file.name);
                
                return (
                  <motion.div
                    key={fileObj.id}
                    variants={itemVariants}
                    layout
                    className="relative"
                  >
                    <Card className="p-4">
                      <div className="flex items-start gap-3">
                        {/* File Icon */}
                        <div className={cn(
                          "p-2 rounded-lg",
                          fileObj.status === 'success' ? 'bg-green-100' :
                          fileObj.status === 'error' ? 'bg-red-100' :
                          fileObj.status === 'processing' ? 'bg-blue-100' :
                          'bg-gray-100'
                        )}>
                          <Icon className={cn(
                            "h-5 w-5",
                            fileObj.status === 'success' ? 'text-green-600' :
                            fileObj.status === 'error' ? 'text-red-600' :
                            fileObj.status === 'processing' ? 'text-blue-600' :
                            'text-gray-600'
                          )} />
                        </div>

                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {fileObj.file.name}
                            </p>
                            <span className="text-xs text-gray-500">
                              ({(fileObj.file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>

                          {/* Progress Bar */}
                          {fileObj.status === 'processing' && (
                            <div className="mt-2 space-y-1">
                              <Progress value={fileObj.progress} className="h-1" />
                              <p className="text-xs text-gray-500">
                                Processing... {fileObj.progress}%
                              </p>
                            </div>
                          )}

                          {/* Validation Results */}
                          {fileObj.validationResults && (
                            <div className="mt-2 space-y-1">
                              {fileObj.validationResults.map((result, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs">
                                  {result.status === 'valid' && (
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                  )}
                                  {result.status === 'warning' && (
                                    <AlertCircle className="h-3 w-3 text-yellow-500" />
                                  )}
                                  {result.status === 'error' && (
                                    <XCircle className="h-3 w-3 text-red-500" />
                                  )}
                                  <span className={cn(
                                    result.status === 'valid' ? 'text-green-700' :
                                    result.status === 'warning' ? 'text-yellow-700' :
                                    'text-red-700'
                                  )}>
                                    {result.field}: {result.message}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Error Message */}
                          {fileObj.error && (
                            <p className="mt-1 text-xs text-red-600">
                              {fileObj.error}
                            </p>
                          )}
                        </div>

                        {/* Status Icon */}
                        <div className="flex items-center gap-2">
                          {fileObj.status === 'success' && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                          {fileObj.status === 'error' && (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          {fileObj.status === 'processing' && (
                            <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(fileObj.id)}
                            className="h-8 w-8 p-0"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
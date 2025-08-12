// src/components/common/DocumentUpload.tsx
import React, { useState, useCallback } from 'react';
import { 
    Upload, 
    FileText, 
    Image, 
    File, 
    X, 
    Download, 
    Trash2,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import { 
    uploadDocumentForTask, 
    getDocumentsByTaskId, 
    deleteDocumentById,
    formatFileSize,
    isImageFile,
  getFileUrl,
    Document 
} from '../../services/documentApi';

interface DocumentUploadProps {
    taskId?: string;
    projectId?: string;
    teamId?: string;
    onDocumentsUpdate?: (documents: Document[]) => void;
    initialDocuments?: Document[];
    maxFileSize?: number; // in bytes, default 10MB
    allowedFileTypes?: string[];
    className?: string;
}

interface UploadStatus {
    file: File;
    progress: number;
    status: 'uploading' | 'success' | 'error';
    error?: string;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
    taskId,
    projectId,
    teamId,
    onDocumentsUpdate,
    initialDocuments = [],
    maxFileSize = 10 * 1024 * 1024, // 10MB
    allowedFileTypes = [
        'image/*',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/*'
    ],
    className = ''
}) => {
    const [documents, setDocuments] = useState<Document[]>(initialDocuments);
    const [uploadQueue, setUploadQueue] = useState<UploadStatus[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const [error, setError] = useState<string>('');

    // Validate file before upload
    const validateFile = (file: File): string | null => {
        if (file.size > maxFileSize) {
            return `File quá lớn. Kích thước tối đa: ${formatFileSize(maxFileSize)}`;
        }

        const isValidType = allowedFileTypes.some(type => {
            if (type.endsWith('/*')) {
                return file.type.startsWith(type.slice(0, -2));
            }
            return file.type === type;
        });

        if (!isValidType) {
            return 'Loại file không được hỗ trợ';
        }

        return null;
    };

    // Handle file upload
    const handleFileUpload = useCallback(async (files: FileList | File[]) => {
        const fileArray = Array.from(files);
        const validFiles: File[] = [];
        let errorMessages: string[] = [];

        // Validate all files first
        fileArray.forEach(file => {
            const validationError = validateFile(file);
            if (validationError) {
                errorMessages.push(`${file.name}: ${validationError}`);
            } else {
                validFiles.push(file);
            }
        });

        if (errorMessages.length > 0) {
            setError(errorMessages.join(', '));
            return;
        }

        setError('');

        // Initialize upload queue
        const newUploadStatuses: UploadStatus[] = validFiles.map(file => ({
            file,
            progress: 0,
            status: 'uploading'
        }));

        setUploadQueue(prev => [...prev, ...newUploadStatuses]);

        // Upload files sequentially
        for (let i = 0; i < validFiles.length; i++) {
            const file = validFiles[i];
            try {
                // Simulate progress
                setUploadQueue(prev => prev.map(item => 
                    item.file === file 
                        ? { ...item, progress: 50 }
                        : item
                ));

                const response = await uploadDocumentForTask(file, taskId, projectId, teamId);
                
                if (response.success) {
                    // Update upload status to success
                    setUploadQueue(prev => prev.map(item => 
                        item.file === file 
                            ? { ...item, progress: 100, status: 'success' }
                            : item
                    ));

                    // Add to documents list
                    setDocuments(prev => [...prev, response.data]);
                    
                    // Notify parent component
                    if (onDocumentsUpdate) {
                        const updatedDocs = [...documents, response.data];
                        onDocumentsUpdate(updatedDocs);
                    }
                } else {
                    throw new Error(response.message || 'Upload failed');
                }
            } catch (error: any) {
                setUploadQueue(prev => prev.map(item => 
                    item.file === file 
                        ? { ...item, status: 'error', error: error.message || 'Upload failed' }
                        : item
                ));
            }
        }

        // Clear upload queue after 3 seconds
        setTimeout(() => {
            setUploadQueue([]);
        }, 3000);

    }, [taskId, projectId, teamId, documents, onDocumentsUpdate]);

    // Handle file deletion
    const handleDeleteDocument = async (documentId: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) {
            return;
        }

        try {
            await deleteDocumentById(documentId);
            const updatedDocs = documents.filter(doc => doc._id !== documentId);
            setDocuments(updatedDocs);
            
            if (onDocumentsUpdate) {
                onDocumentsUpdate(updatedDocs);
            }
        } catch (error: any) {
            setError('Không thể xóa tài liệu: ' + (error.message || 'Unknown error'));
        }
    };

    // Handle drag and drop
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files);
        }
    }, [handleFileUpload]);

    // Handle file input change
    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileUpload(e.target.files);
        }
    };

    // Get file icon based on file type
    const getFileIcon = (fileType: string) => {
        if (isImageFile(fileType)) {
            return <Image className="w-5 h-5 text-blue-500" />;
        }
        if (fileType.includes('pdf')) {
            return <FileText className="w-5 h-5 text-red-500" />;
        }
        return <File className="w-5 h-5 text-gray-500" />;
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Upload Area */}
            <div
                className={`
                    border-2 border-dashed rounded-lg p-6 text-center transition-colors
                    ${isDragOver 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 mb-2">
                    Kéo thả file vào đây hoặc{' '}
                    <label className="text-blue-500 hover:text-blue-700 cursor-pointer">
                        <input
                            type="file"
                            multiple
                            className="hidden"
                            onChange={handleFileInputChange}
                            accept={allowedFileTypes.join(',')}
                        />
                        chọn file
                    </label>
                </p>
                <p className="text-xs text-gray-500">
                    Kích thước tối đa: {formatFileSize(maxFileSize)}
                </p>
            </div>

            {/* Error Display */}
            {error && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{error}</span>
                    <button
                        onClick={() => setError('')}
                        className="ml-auto hover:text-red-800"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Upload Queue */}
            {uploadQueue.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Đang tải lên...</h4>
                    {uploadQueue.map((upload, index) => (
                        <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                            {upload.status === 'uploading' && (
                                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            )}
                            {upload.status === 'success' && (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                            {upload.status === 'error' && (
                                <AlertCircle className="w-4 h-4 text-red-500" />
                            )}
                            <span className="text-sm flex-1">{upload.file.name}</span>
                            {upload.status === 'uploading' && (
                                <span className="text-xs text-gray-500">{upload.progress}%</span>
                            )}
                            {upload.status === 'error' && (
                                <span className="text-xs text-red-500">{upload.error}</span>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Document List */}
            {documents.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Tài liệu đính kèm</h4>
                    <div className="grid gap-2">
                        {documents.map((doc) => (
                            <div 
                                key={doc._id} 
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center space-x-3 flex-1">
                                    {getFileIcon(doc.fileType)}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {doc.fileName}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {formatFileSize(doc.fileSize)} • {new Date(doc.createdAt).toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <button
                                onClick={() => window.open(getFileUrl(doc._id), '_blank')}
                                        className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                                        title="Tải xuống"
                                    >
                                        <Download className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteDocument(doc._id)}
                                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                        title="Xóa"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentUpload;

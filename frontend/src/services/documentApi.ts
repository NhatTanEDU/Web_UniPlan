// src/services/documentApi.ts
import baseApi from './baseApi';

// Interface cho Document
export interface Document {
    _id: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    taskId?: string;
    projectId?: string;
    teamId?: string;
    uploadedBy: {
        _id: string;
        full_name: string;
        email: string;
    } | string; // Union type để hỗ trợ cả trường hợp populated và chưa populated
    createdAt: string;
    updatedAt: string;
}

// Interface cho response
export interface DocumentResponse {
    success: boolean;
    message: string;
    data: Document;
}

export interface DocumentListResponse {
    success: boolean;
    message: string;
    data: Document[];
    pagination?: {
        current_page: number;
        total_pages: number;
        total_items: number;
        items_per_page: number;
    };
}

/**
 * Lấy tài liệu theo project ID
 * @param projectId - ID của project
 * @returns Promise<DocumentListResponse>
 */
export const getDocumentsByProject = async (projectId: string): Promise<DocumentListResponse> => {
    try {
        const response = await baseApi.get(`/documents?projectId=${projectId}`);
        return response.data;
    } catch (error: any) {
        console.error("Lỗi khi lấy tài liệu theo dự án:", error.response?.data || error.message);
        throw error.response?.data || new Error('Không thể lấy danh sách tài liệu');
    }
};

/**
 * Tải một file lên, liên kết với một task cụ thể.
 * @param file - File người dùng chọn
 * @param taskId - ID của task liên quan
 * @param projectId - ID của project (optional)
 * @param teamId - ID của team (optional)
 * @returns Promise<DocumentResponse>
 */
export const uploadDocumentForTask = async (
    file: File, 
    taskId?: string, 
    projectId?: string, 
    teamId?: string
): Promise<DocumentResponse> => {
    const formData = new FormData();
    formData.append('fileDinhKem', file); // 'fileDinhKem' phải khớp với key ở backend
    
    if (taskId) formData.append('taskId', taskId);
    if (projectId) formData.append('projectId', projectId);
    if (teamId) formData.append('teamId', teamId);

    try {
        const response = await baseApi.post('/documents/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error: any) {
        console.error("Lỗi khi upload file:", error.response?.data || error.message);
        throw error.response?.data || new Error('Upload file thất bại');
    }
};

/**
 * Lấy tất cả các tài liệu được đính kèm cho một task.
 * @param taskId - ID của task
 * @returns Promise<Document[]>
 */
export const getDocumentsByTaskId = async (taskId: string): Promise<Document[]> => {
    try {
        const response = await baseApi.get(`/documents?taskId=${taskId}`);
        return response.data.data;
    } catch (error: any) {
        console.error("Lỗi khi lấy tài liệu:", error.response?.data || error.message);
        throw error.response?.data || new Error('Không thể lấy danh sách tài liệu');
    }
};

/**
 * Lấy tài liệu theo project ID
 * @param projectId - ID của project
 * @returns Promise<Document[]>
 */
export const getDocumentsByProjectId = async (projectId: string): Promise<Document[]> => {
    try {
        const response = await baseApi.get(`/documents?projectId=${projectId}`);
        return response.data.data;
    } catch (error: any) {
        console.error("Lỗi khi lấy tài liệu project:", error.response?.data || error.message);
        throw error.response?.data || new Error('Không thể lấy danh sách tài liệu project');
    }
};

/**
 * Lấy tài liệu theo team ID
 * @param teamId - ID của team
 * @returns Promise<Document[]>
 */
export const getDocumentsByTeamId = async (teamId: string): Promise<Document[]> => {
    try {
        const response = await baseApi.get(`/documents?teamId=${teamId}`);
        return response.data.data;
    } catch (error: any) {
        console.error("Lỗi khi lấy tài liệu team:", error.response?.data || error.message);
        throw error.response?.data || new Error('Không thể lấy danh sách tài liệu team');
    }
};

/**
 * Xóa một tài liệu.
 * @param documentId - ID của tài liệu cần xóa
 * @returns Promise<any>
 */
export const deleteDocumentById = async (documentId: string): Promise<any> => {
    try {
        const response = await baseApi.delete(`/documents/${documentId}`);
        return response.data;
    } catch (error: any) {
        console.error("Lỗi khi xóa tài liệu:", error.response?.data || error.message);
        throw error.response?.data || new Error('Xóa tài liệu thất bại');
    }
};

/**
 * Lấy tất cả tài liệu của user hiện tại
 * @param page - Số trang (default: 1)
 * @param limit - Số items per page (default: 10)
 * @returns Promise<DocumentListResponse>
 */
export const getAllDocuments = async (page: number = 1, limit: number = 10): Promise<DocumentListResponse> => {
    try {
        const response = await baseApi.get(`/documents?page=${page}&limit=${limit}`);
        return response.data;
    } catch (error: any) {
        console.error("Lỗi khi lấy tất cả tài liệu:", error.response?.data || error.message);
        throw error.response?.data || new Error('Không thể lấy danh sách tài liệu');
    }
};

/**
 * Utility function để format file size
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Utility function để lấy file extension
 */
export const getFileExtension = (fileName: string): string => {
    return fileName.split('.').pop()?.toLowerCase() || '';
};

/**
 * Utility function để kiểm tra file type
 */
export const isImageFile = (fileType: string): boolean => {
    return fileType.startsWith('image/');
};

export const isPdfFile = (fileType: string): boolean => {
    return fileType === 'application/pdf';
};

export const isDocumentFile = (fileType: string): boolean => {
    return fileType.includes('document') || fileType.includes('word') || fileType.includes('text');
};

/**
 * Tạo URL để truy cập file từ MongoDB
 * @param fileId - ID của file trong MongoDB
 * @returns string - URL để truy cập file
 */
export const getFileUrl = (fileId: string): string => {
    return `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/documents/file/${fileId}`;
};

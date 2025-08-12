// src/components/After/tab/teams/pages/TeamDocuments.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  FileText, Upload, Download, Trash2, Eye, Search, 
  Calendar, User, FileIcon, RefreshCw 
} from 'lucide-react';
import * as documentApi from '../../../../../services/documentApi';
import { Document, getFileUrl } from '../../../../../services/documentApi';
import DocumentUpload from '../../../../common/DocumentUpload';

// ĐỊNH NGHĨA PROPS MỚI
interface TeamDocumentsProps {
  documents: Document[];
  refetch: () => void;
}

const TeamDocuments: React.FC<TeamDocumentsProps> = ({ documents: initialDocuments, refetch }) => {
  const { teamId } = useParams<{ teamId: string }>();
  
  // State documents bây giờ dùng để search/filter, nhận giá trị ban đầu từ props
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [showUpload, setShowUpload] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // CẬP NHẬT STATE KHI PROPS THAY ĐỔI
  useEffect(() => {
    setDocuments(initialDocuments);
  }, [initialDocuments]);  const handleDeleteDocument = async (documentId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) {
      return;
    }

    try {
      await documentApi.deleteDocumentById(documentId);
      // Gọi refetch để cập nhật dữ liệu từ component cha
      refetch();
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Không thể xóa tài liệu');
    }
  };
  const handleDownload = (document: Document) => {
    const fileUrl = getFileUrl(document._id);
    window.open(fileUrl, '_blank');
  };
  // Filter and sort documents
  const filteredAndSortedDocuments = React.useMemo(() => {
    let filtered = documents.filter(doc => 
      doc.fileName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filter by file type
    if (filterType !== 'all') {
      filtered = filtered.filter(doc => {
        const extension = doc.fileName.split('.').pop()?.toLowerCase();
        switch (filterType) {
          case 'images':
            return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(extension || '');
          case 'documents':
            return ['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(extension || '');
          case 'spreadsheets':
            return ['xls', 'xlsx', 'csv'].includes(extension || '');
          case 'presentations':
            return ['ppt', 'pptx'].includes(extension || '');
          default:
            return true;
        }
      });
    }

    // Sort documents
    return filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.fileName.localeCompare(b.fileName);
          break;
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'size':
          comparison = a.fileSize - b.fileSize;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [documents, searchTerm, filterType, sortBy, sortOrder]);

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const iconClass = "h-8 w-8";
    
    switch (extension) {
      case 'pdf':
        return <FileIcon className={`${iconClass} text-red-500`} />;
      case 'doc':
      case 'docx':
        return <FileIcon className={`${iconClass} text-blue-500`} />;
      case 'xls':
      case 'xlsx':
        return <FileIcon className={`${iconClass} text-green-500`} />;
      case 'ppt':
      case 'pptx':
        return <FileIcon className={`${iconClass} text-orange-500`} />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FileIcon className={`${iconClass} text-purple-500`} />;
      default:
        return <FileText className={`${iconClass} text-gray-500`} />;
    }  };

  if (!documents) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Đang tải tài liệu...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Tài liệu nhóm
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Quản lý và chia sẻ tài liệu trong nhóm
          </p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Upload className="h-4 w-4" />
          Tải lên tài liệu
        </button>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm tài liệu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Filter by type */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="all">Tất cả loại file</option>
          <option value="documents">Tài liệu</option>
          <option value="images">Hình ảnh</option>
          <option value="spreadsheets">Bảng tính</option>
          <option value="presentations">Thuyết trình</option>
        </select>

        {/* Sort */}
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'size')}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="date">Ngày tải lên</option>
            <option value="name">Tên file</option>
            <option value="size">Kích thước</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            title={sortOrder === 'asc' ? 'Sắp xếp giảm dần' : 'Sắp xếp tăng dần'}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Documents Grid */}
      {filteredAndSortedDocuments.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {documents.length === 0 ? 'Chưa có tài liệu nào' : 'Không tìm thấy tài liệu'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {documents.length === 0 
              ? 'Hãy tải lên tài liệu đầu tiên cho nhóm này'
              : 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
            }
          </p>
          {documents.length === 0 && (
            <button
              onClick={() => setShowUpload(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Upload className="h-4 w-4" />
              Tải lên tài liệu đầu tiên
            </button>
          )}
        </div>
      ) : (        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedDocuments.map((document) => (
            <div
              key={document._id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                {getFileIcon(document.fileName)}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate" title={document.fileName}>
                    {document.fileName}
                  </h3>
                  <div className="mt-1 space-y-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {documentApi.formatFileSize(document.fileSize)}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="h-3 w-3" />
                      {new Date(document.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                    {document.uploadedBy && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <User className="h-3 w-3" />
                        {typeof document.uploadedBy === 'object' 
                          ? document.uploadedBy.full_name 
                          : document.uploadedBy}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleDownload(document)}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                  title="Tải xuống"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDownload(document)}
                  className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                  title="Xem"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteDocument(document._id)}
                  className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                  title="Xóa"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Statistics */}
      {documents.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {documents.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tổng số tài liệu</p>
            </div>            <div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {documentApi.formatFileSize(documents.reduce((total, doc) => total + doc.fileSize, 0))}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tổng dung lượng</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {filteredAndSortedDocuments.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Hiển thị</p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && teamId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Tải lên tài liệu
                </h3>
                <button
                  onClick={() => setShowUpload(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  ✕
                </button>
              </div>              <DocumentUpload
                teamId={teamId}
                onDocumentsUpdate={() => {
                  // Gọi refetch để cập nhật dữ liệu từ component cha
                  refetch();
                  setShowUpload(false);
                }}
                initialDocuments={documents}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamDocuments;

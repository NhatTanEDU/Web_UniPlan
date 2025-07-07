// src/components/After/tab/teams/hooks/useTeamDocuments.ts
import { useState, useEffect, useCallback } from 'react';
import * as documentApi from '../../../../../services/documentApi';
import { Document } from '../../../../../services/documentApi';

export const useTeamDocuments = (teamId: string | undefined) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    if (!teamId) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Sử dụng getAllDocuments và filter theo teamId
      const response = await documentApi.getAllDocuments(1, 500); // Lấy tối đa 500 docs
      
      // Filter documents by teamId since API might return all documents
      const teamDocuments = response.data.filter(doc => doc.teamId === teamId);
      setDocuments(teamDocuments);
    } catch (err) {
      console.error('Failed to fetch team documents:', err);
      setError('Không thể tải tài liệu của nhóm.');
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Trả về cả hàm fetchDocuments để có thể gọi lại từ bên ngoài (refetch)
  return { 
    documents, 
    loading, 
    error, 
    refetchDocuments: fetchDocuments 
  };
};

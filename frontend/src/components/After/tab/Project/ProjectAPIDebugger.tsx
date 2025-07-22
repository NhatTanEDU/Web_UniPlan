// 🧪 Debug component để test API /projects trực tiếp
import React, { useState, useEffect } from 'react';
import { getProjects } from '../../../../services/api';

const ProjectAPIDebugger: React.FC = () => {
  const [apiData, setApiData] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    setApiError(null);
    try {
      console.log('🧪 Testing /projects API directly...');
      const data = await getProjects();
      console.log('🧪 Raw API Response:', { 
        type: typeof data, 
        isArray: Array.isArray(data), 
        length: data?.length,
        data 
      });
      setApiData(data);
    } catch (error: any) {
      console.error('🧪 API Error:', error);
      setApiError(error.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testAPI();
  }, []);

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
      <h3 className="font-bold text-yellow-800 mb-2">🧪 API Debug Panel</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>Status:</strong> {loading ? '⏳ Loading' : '✅ Complete'}
        </div>
        
        {apiError && (
          <div className="text-red-600">
            <strong>Error:</strong> {apiError}
          </div>
        )}
        
        {apiData && (
          <>
            <div>
              <strong>Data Type:</strong> {typeof apiData} 
              {Array.isArray(apiData) ? ' (Array)' : ' (Not Array)'}
            </div>
            <div>
              <strong>Length:</strong> {Array.isArray(apiData) ? apiData.length : 'N/A'}
            </div>
            <div>
              <strong>Can use .map():</strong> {Array.isArray(apiData) ? '✅ Yes' : '❌ No'}
            </div>
            {Array.isArray(apiData) && apiData.length > 0 && (
              <div>
                <strong>First project name:</strong> {apiData[0]?.project_name || 'No name'}
              </div>
            )}
          </>
        )}
      </div>
      
      <button 
        onClick={testAPI}
        disabled={loading}
        className="mt-2 px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 disabled:opacity-50"
      >
        Test API Again
      </button>
    </div>
  );
};

export default ProjectAPIDebugger;

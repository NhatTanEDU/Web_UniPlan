import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ProjectErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('🚨 ProjectErrorBoundary caught error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 ProjectErrorBoundary detailed error:', { error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 text-red-700 mb-2">
            <span>⚠️</span>
            <h3 className="font-semibold">Lỗi hiển thị dự án</h3>
          </div>
          <p className="text-red-600 text-sm mb-3">
            Đã xảy ra lỗi khi tải danh sách dự án. Vui lòng thử lại.
          </p>
          <details className="text-xs text-gray-600">
            <summary className="cursor-pointer hover:text-gray-800">Chi tiết lỗi</summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
              {this.state.error?.message}
            </pre>
          </details>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
          >
            Thử lại
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ProjectErrorBoundary;

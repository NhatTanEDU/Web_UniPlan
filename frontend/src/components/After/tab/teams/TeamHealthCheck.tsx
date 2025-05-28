import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Users, 
  MessageSquare, 
  Target,
  BarChart3,
  Zap,
  Shield,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Info,
  Lightbulb,
  Settings
} from 'lucide-react';

interface HealthMetric {
  name: string;
  value: number;
  maxValue: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  description: string;
}

interface TeamHealthData {
  teamId: string;
  teamName: string;
  overallScore: number;
  lastUpdated: string;
  metrics: {
    communication: HealthMetric;
    productivity: HealthMetric;
    collaboration: HealthMetric;
    engagement: HealthMetric;
    goalAlignment: HealthMetric;
    workload: HealthMetric;
  };
  recommendations: {
    id: string;
    type: 'improvement' | 'warning' | 'celebration';
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    actionItems: string[];
  }[];
  memberSatisfaction: {
    averageRating: number;
    totalResponses: number;
    lastSurvey: string;
  };
}

interface TeamHealthCheckProps {
  teamId: string;
  className?: string;
  showRecommendations?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number; // in minutes
}

const TeamHealthCheck: React.FC<TeamHealthCheckProps> = ({
  teamId,
  className = "",
  showRecommendations = true,
  autoRefresh = false,
  refreshInterval = 30
}) => {
  const [healthData, setHealthData] = useState<TeamHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Fetch health data from API
  const fetchHealthData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/teams-enhanced/health/${teamId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setHealthData(data.data);
        setError(null);
      } else {
        setError('Không thể tải dữ liệu sức khỏe nhóm');
      }
    } catch (err) {
      setError('Lỗi kết nối mạng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();

    // Auto refresh if enabled
    if (autoRefresh) {
      const interval = setInterval(fetchHealthData, refreshInterval * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [teamId, autoRefresh, refreshInterval]);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'good':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      case 'critical':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'good':
        return <ThumbsUp className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'critical':
        return <ThumbsDown className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  // Get trend icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get metric icon
  const getMetricIcon = (metricName: string) => {
    switch (metricName) {
      case 'communication':
        return <MessageSquare className="h-5 w-5" />;
      case 'productivity':
        return <Target className="h-5 w-5" />;
      case 'collaboration':
        return <Users className="h-5 w-5" />;
      case 'engagement':
        return <Zap className="h-5 w-5" />;
      case 'goalAlignment':
        return <BarChart3 className="h-5 w-5" />;
      case 'workload':
        return <Clock className="h-5 w-5" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
  };

  // Calculate percentage
  const getPercentage = (value: number, maxValue: number) => {
    return Math.round((value / maxValue) * 100);
  };

  // Render metric card
  const renderMetricCard = (key: string, metric: HealthMetric) => (
    <div key={key} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getMetricIcon(key)}
          <h4 className="font-medium text-gray-900 dark:text-gray-100">
            {metric.name}
          </h4>
        </div>
        <div className="flex items-center space-x-2">
          {getTrendIcon(metric.trend)}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
            {getStatusIcon(metric.status)}
            <span className="ml-1">
              {metric.status === 'excellent' && 'Xuất sắc'}
              {metric.status === 'good' && 'Tốt'}
              {metric.status === 'warning' && 'Cảnh báo'}
              {metric.status === 'critical' && 'Nghiêm trọng'}
            </span>
          </span>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-2">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
          <span>{metric.value}/{metric.maxValue}</span>
          <span>{getPercentage(metric.value, metric.maxValue)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              metric.status === 'excellent' ? 'bg-green-500' :
              metric.status === 'good' ? 'bg-blue-500' :
              metric.status === 'warning' ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${getPercentage(metric.value, metric.maxValue)}%` }}
          />
        </div>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {metric.description}
      </p>
    </div>
  );

  // Render recommendation card
  const renderRecommendationCard = (recommendation: TeamHealthData['recommendations'][0]) => (
    <div 
      key={recommendation.id}
      className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-full ${
          recommendation.type === 'celebration' ? 'bg-green-100 dark:bg-green-900/30' :
          recommendation.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
          'bg-blue-100 dark:bg-blue-900/30'
        }`}>
          {recommendation.type === 'celebration' ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
          ) : recommendation.type === 'warning' ? (
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          ) : (
            <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              {recommendation.title}
            </h4>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              recommendation.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
              recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
              'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
            }`}>
              {recommendation.priority === 'high' && 'Cao'}
              {recommendation.priority === 'medium' && 'Trung bình'}
              {recommendation.priority === 'low' && 'Thấp'}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {recommendation.description}
          </p>
          
          {recommendation.actionItems.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hành động đề xuất:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                {recommendation.actionItems.map((action, index) => (
                  <li key={index}>{action}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Đang phân tích sức khỏe nhóm...</span>
        </div>
      </div>
    );
  }

  if (error || !healthData) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-center py-8 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <AlertTriangle className="h-6 w-6 text-red-500" />
          <span className="ml-2 text-red-600 dark:text-red-400">{error || 'Không có dữ liệu'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Heart className="h-6 w-6 text-red-500" />
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Sức khỏe nhóm
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Cập nhật lần cuối: {new Date(healthData.lastUpdated).toLocaleString('vi-VN')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {showDetails ? 'Ẩn chi tiết' : 'Xem chi tiết'}
          </button>
          <button
            onClick={fetchHealthData}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            title="Làm mới"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Overall Score */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Điểm sức khỏe tổng thể</h3>
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold">{healthData.overallScore}/100</span>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span className="text-sm">
                  {healthData.overallScore >= 80 ? 'Xuất sắc' :
                   healthData.overallScore >= 60 ? 'Tốt' :
                   healthData.overallScore >= 40 ? 'Cần cải thiện' : 'Cần chú ý'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Member Satisfaction */}
          <div className="text-right">
            <p className="text-sm opacity-90 mb-1">Hài lòng của thành viên</p>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-semibold">
                {healthData.memberSatisfaction.averageRating.toFixed(1)}/5.0
              </span>
              <span className="text-sm opacity-75">
                ({healthData.memberSatisfaction.totalResponses} phản hồi)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {Object.entries(healthData.metrics).map(([key, metric]) => 
          renderMetricCard(key, metric)
        )}
      </div>

      {/* Recommendations */}
      {showRecommendations && healthData.recommendations.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
            Khuyến nghị cải thiện
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {healthData.recommendations.map(renderRecommendationCard)}
          </div>
        </div>
      )}

      {/* Detailed Analysis */}
      {showDetails && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
            Phân tích chi tiết
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Điểm mạnh</h4>
              <ul className="space-y-2">
                {Object.entries(healthData.metrics)
                  .filter(([_, metric]) => metric.status === 'excellent' || metric.status === 'good')
                  .map(([key, metric]) => (
                    <li key={key} className="flex items-center space-x-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>{metric.name}: {getPercentage(metric.value, metric.maxValue)}%</span>
                    </li>
                  ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Cần cải thiện</h4>
              <ul className="space-y-2">
                {Object.entries(healthData.metrics)
                  .filter(([_, metric]) => metric.status === 'warning' || metric.status === 'critical')
                  .map(([key, metric]) => (
                    <li key={key} className="flex items-center space-x-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span>{metric.name}: {getPercentage(metric.value, metric.maxValue)}%</span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamHealthCheck;

import React, { useState, useEffect } from 'react';
import { 
  Lightbulb, 
  TrendingUp, 
  Users, 
  Target, 
  BookOpen, 
  MessageSquare,
  Award,
  RefreshCw,
  ChevronRight,
  ExternalLink,
  Heart,
  Brain,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  Star
} from 'lucide-react';

interface Recommendation {
  id: string;
  type: 'team_formation' | 'skill_development' | 'collaboration' | 'productivity' | 'wellness' | 'learning';
  category: 'urgent' | 'important' | 'suggested' | 'informational';
  title: string;
  description: string;
  reasoning: string;
  confidence: number; // 0-100
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  timeline: string;
  tags: string[];
  actionItems: {
    id: string;
    action: string;
    responsible?: string;
    deadline?: string;
    completed: boolean;
  }[];
  resources: {
    title: string;
    type: 'article' | 'video' | 'course' | 'tool' | 'template';
    url: string;
  }[];
  metrics: {
    name: string;
    expectedImprovement: string;
  }[];
  createdAt: string;
  updatedAt: string;
  feedback?: {
    rating: number;
    helpful: boolean;
    implemented: boolean;
    comment?: string;
  };
}

interface TeamRecommendationsProps {
  teamId?: string; // Nếu không có thì hiển thị recommendations chung
  userId?: string;
  limit?: number;
  categories?: string[];
  showFeedback?: boolean;
  className?: string;
}

const TeamRecommendations: React.FC<TeamRecommendationsProps> = ({
  teamId,
  userId,
  limit = 10,
  categories = ['urgent', 'important', 'suggested'],
  showFeedback = true,
  className = ""
}) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Fetch recommendations from AI
  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: limit.toString(),
        ...(teamId && { teamId }),
        ...(userId && { userId }),
        categories: categories.join(',')
      });

      const response = await fetch(`/api/teams-enhanced/recommendations?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.data || []);
        setError(null);
      } else {
        setError('Không thể tải gợi ý');
      }
    } catch (err) {
      setError('Lỗi kết nối mạng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId, userId, limit]);

  // Submit feedback
  const submitFeedback = async (recommendationId: string, feedback: Partial<Recommendation['feedback']>) => {
    try {
      const response = await fetch(`/api/teams-enhanced/recommendations/${recommendationId}/feedback`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(feedback)
      });
      if (response.ok) {
        // Update local state
        setRecommendations(prev => 
          prev.map(rec => 
            rec.id === recommendationId 
              ? { 
                  ...rec,
                  feedback: {
                    rating: feedback && feedback.rating !== undefined ? feedback.rating : rec.feedback?.rating ?? 0,
                    helpful: feedback && feedback.helpful !== undefined ? feedback.helpful : rec.feedback?.helpful ?? false,
                    implemented: feedback && feedback.implemented !== undefined ? feedback.implemented : rec.feedback?.implemented ?? false,
                    comment: feedback && feedback.comment !== undefined ? feedback.comment : rec.feedback?.comment
                  }
                }
              : rec
          )
        );
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
    }
  };

  // Toggle expanded state
  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Filter recommendations
  const filteredRecommendations = recommendations.filter(rec => {
    if (selectedCategory !== 'all' && rec.category !== selectedCategory) return false;
    if (selectedType !== 'all' && rec.type !== selectedType) return false;
    return true;
  });

  // Get category colors
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'important':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'suggested':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'team_formation':
        return <Users className="h-4 w-4" />;
      case 'skill_development':
        return <BookOpen className="h-4 w-4" />;
      case 'collaboration':
        return <MessageSquare className="h-4 w-4" />;
      case 'productivity':
        return <Target className="h-4 w-4" />;
      case 'wellness':
        return <Heart className="h-4 w-4" />;
      case 'learning':
        return <Brain className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  // Get impact color
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-green-600 dark:text-green-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  // Render recommendation card
  const renderRecommendationCard = (recommendation: Recommendation) => {
    const isExpanded = expandedItems.has(recommendation.id);
    
    return (
      <div 
        key={recommendation.id}
        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
      >
        {/* Header */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start space-x-3 flex-1">
              <div className="flex-shrink-0 p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                {getTypeIcon(recommendation.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {recommendation.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(recommendation.category)}`}>
                    {recommendation.category === 'urgent' && 'Khẩn cấp'}
                    {recommendation.category === 'important' && 'Quan trọng'}
                    {recommendation.category === 'suggested' && 'Đề xuất'}
                    {recommendation.category === 'informational' && 'Thông tin'}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {recommendation.description}
                </p>
                
                {/* Metrics */}
                <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Sparkles className="h-3 w-3" />
                    <span>Độ tin cậy: {recommendation.confidence}%</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className={`h-3 w-3 ${getImpactColor(recommendation.impact)}`} />
                    <span>Tác động: {recommendation.impact === 'high' ? 'Cao' : recommendation.impact === 'medium' ? 'Trung bình' : 'Thấp'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{recommendation.timeline}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => toggleExpanded(recommendation.id)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <ChevronRight className={`h-4 w-4 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            </button>
          </div>
          
          {/* Tags */}
          {recommendation.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {recommendation.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            {/* Reasoning */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                <Brain className="h-4 w-4 mr-2 text-purple-500" />
                Lý do đề xuất
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {recommendation.reasoning}
              </p>
            </div>

            {/* Action Items */}
            {recommendation.actionItems.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                  <Target className="h-4 w-4 mr-2 text-green-500" />
                  Hành động cần thực hiện
                </h4>
                <ul className="space-y-2">
                  {recommendation.actionItems.map((item) => (
                    <li key={item.id} className="flex items-start space-x-2 text-sm">
                      <CheckCircle2 className={`h-4 w-4 mt-0.5 ${item.completed ? 'text-green-500' : 'text-gray-400'}`} />
                      <div className="flex-1">
                        <span className={item.completed ? 'line-through text-gray-500' : 'text-gray-700 dark:text-gray-300'}>
                          {item.action}
                        </span>
                        {(item.responsible || item.deadline) && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {item.responsible && `Phụ trách: ${item.responsible}`}
                            {item.responsible && item.deadline && ' • '}
                            {item.deadline && `Hạn: ${item.deadline}`}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Expected Metrics */}
            {recommendation.metrics.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                  <Award className="h-4 w-4 mr-2 text-yellow-500" />
                  Kết quả mong đợi
                </h4>
                <ul className="space-y-1">
                  {recommendation.metrics.map((metric, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm">
                      <ArrowRight className="h-3 w-3 text-blue-500" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {metric.name}: {metric.expectedImprovement}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Resources */}
            {recommendation.resources.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                  <BookOpen className="h-4 w-4 mr-2 text-blue-500" />
                  Tài nguyên hỗ trợ
                </h4>
                <ul className="space-y-2">
                  {recommendation.resources.map((resource, index) => (
                    <li key={index}>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>{resource.title}</span>
                        <span className="text-xs text-gray-500">({resource.type})</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Feedback */}
            {showFeedback && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Gợi ý này có hữu ích không?
                </h4>
                {recommendation.feedback ? (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-2 mb-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>Bạn đã đánh giá: {recommendation.feedback.rating}/5</span>
                      <span className={recommendation.feedback.helpful ? 'text-green-600' : 'text-red-600'}>
                        ({recommendation.feedback.helpful ? 'Hữu ích' : 'Không hữu ích'})
                      </span>
                    </div>
                    {recommendation.feedback.comment && (
                      <p className="italic">"{recommendation.feedback.comment}"</p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => submitFeedback(recommendation.id, { helpful: true, rating: 5 })}
                      className="flex items-center space-x-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-md hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                    >
                      <ThumbsUp className="h-3 w-3" />
                      <span className="text-sm">Hữu ích</span>
                    </button>
                    <button
                      onClick={() => submitFeedback(recommendation.id, { helpful: false, rating: 2 })}
                      className="flex items-center space-x-1 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    >
                      <ThumbsDown className="h-3 w-3" />
                      <span className="text-sm">Không hữu ích</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Đang tạo gợi ý thông minh...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-center py-8 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <Lightbulb className="h-6 w-6 text-red-500" />
          <span className="ml-2 text-red-600 dark:text-red-400">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Lightbulb className="h-6 w-6 text-yellow-500" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Gợi ý thông minh
          </h2>
          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-xs font-medium">
            AI Powered
          </span>
        </div>
        
        <button
          onClick={fetchRecommendations}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          title="Tạo gợi ý mới"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Mức độ:
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tất cả</option>
            <option value="urgent">Khẩn cấp</option>
            <option value="important">Quan trọng</option>
            <option value="suggested">Đề xuất</option>
            <option value="informational">Thông tin</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Loại:
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tất cả</option>
            <option value="team_formation">Xây dựng nhóm</option>
            <option value="skill_development">Phát triển kỹ năng</option>
            <option value="collaboration">Hợp tác</option>
            <option value="productivity">Năng suất</option>
            <option value="wellness">Sức khỏe</option>
            <option value="learning">Học tập</option>
          </select>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {filteredRecommendations.length > 0 ? (
          filteredRecommendations.map(renderRecommendationCard)
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Lightbulb className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Chưa có gợi ý nào cho bộ lọc hiện tại</p>
          </div>
        )}
      </div>

      {/* Generate More */}
      {filteredRecommendations.length > 0 && (
        <div className="text-center mt-6">
          <button
            onClick={fetchRecommendations}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 mx-auto"
          >
            <Sparkles className="h-4 w-4" />
            <span>Tạo thêm gợi ý</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default TeamRecommendations;

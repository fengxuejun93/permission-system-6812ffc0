import { useState } from 'react';
import { useSocialStore } from '@/store/socialStore';
import Header from '@/components/Header';
import ArticleCard from '@/components/ArticleCard';
import ArticleForm from '@/components/ArticleForm';
import { CATEGORY_LABELS, CATEGORY_COLORS, type ArticleCategory } from '@/types';
import { BookOpen, Plus, X, EyeOff } from 'lucide-react';

const categories: ArticleCategory[] = ['mental_health', 'fashion', 'cooking', 'hot_topics'];

export default function Knowledge() {
  const { getVisibleArticles, getHiddenArticleCount, articles, currentUserId } = useSocialStore();
  const [activeCategory, setActiveCategory] = useState<ArticleCategory | 'all'>('all');
  const [showForm, setShowForm] = useState(false);

  const visibleArticles = activeCategory === 'all'
    ? getVisibleArticles()
    : getVisibleArticles(activeCategory);

  const hiddenCount = getHiddenArticleCount(activeCategory === 'all' ? undefined : activeCategory);
  const myArticleCount = articles.filter(a => a.authorId === currentUserId).length;

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <Header />
      <div className="pt-14 max-w-3xl mx-auto px-4 py-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen size={22} className="text-[#3B5998]" />
            <h1 className="text-lg font-bold text-gray-800">知识分享</h1>
            <span className="text-xs text-gray-400">我发布 {myArticleCount} 篇</span>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-full transition-colors ${showForm ? 'bg-gray-200 text-gray-600' : 'bg-[#3B5998] text-white hover:bg-[#2A4A7F]'}`}
          >
            {showForm ? <><X size={14} /> 取消</> : <><Plus size={14} /> 写文章</>}
          </button>
        </div>

        {/* 不可见文章提示 */}
        {hiddenCount > 0 && (
          <div className="flex items-center gap-1.5 mb-3 text-[10px] text-gray-400 bg-white rounded-lg px-3 py-2 border border-gray-200">
            <EyeOff size={12} /> 因权限设置，有 {hiddenCount} 篇文章对你不可见（仅好友可见或仅自己可见）
          </div>
        )}

        {/* 分类标签 */}
        <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveCategory('all')}
            className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${activeCategory === 'all' ? 'bg-[#3B5998] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
          >
            全部
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${activeCategory === cat ? 'text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
              style={activeCategory === cat ? { backgroundColor: CATEGORY_COLORS[cat] } : undefined}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* 发布表单 */}
        {showForm && (
          <div className="mb-4">
            <ArticleForm onSuccess={() => setShowForm(false)} />
          </div>
        )}

        {/* 文章流 */}
        <div className="space-y-3">
          {visibleArticles.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
          {visibleArticles.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <BookOpen size={32} className="text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">
                {activeCategory === 'all'
                  ? '暂无文章，点击「写文章」分享你的知识吧'
                  : `「${CATEGORY_LABELS[activeCategory]}」分类暂无可见文章`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

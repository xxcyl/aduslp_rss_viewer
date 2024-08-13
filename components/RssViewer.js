import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Search, SortAsc, SortDesc, Tag, X } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const ITEMS_PER_PAGE = 10;

const RssViewer = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [totalEntries, setTotalEntries] = useState(0);
  const [uniqueSources, setUniqueSources] = useState([]);
  const [filteredSources, setFilteredSources] = useState([]);
  const [selectedSource, setSelectedSource] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [activeKeyword, setActiveKeyword] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [currentPage, searchTerm, sortOrder, selectedSource, dateRange]);

  const fetchStats = async () => {
    try {
      const { data: sources, error: sourcesError } = await supabase
        .from('rss_entries')
        .select('source');

      if (sourcesError) throw sourcesError;

      const uniqueSources = [...new Set(sources.map(s => s.source))].sort((a, b) => a.localeCompare(b));
      setUniqueSources(uniqueSources);
      setFilteredSources(uniqueSources);
      setTotalEntries(sources.length);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError(`獲取統計資料失敗: ${error.message}`);
    }
  };

  const fetchEntries = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('rss_entries')
        .select('*', { count: 'exact' });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,title_translated.ilike.%${searchTerm}%,tldr.ilike.%${searchTerm}%,keywords.ilike.%${searchTerm}%`);
      }

      if (selectedSource) {
        query = query.eq('source', selectedSource);
      }

      if (dateRange) {
        const currentDate = new Date();
        let startDate;
        if (dateRange === 'week') {
          startDate = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        } else if (dateRange === 'month') {
          startDate = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        }
        query = query.gte('published', startDate.toISOString());
      }

      const { data, count, error } = await query
        .order('published', { ascending: sortOrder === 'asc' });

      if (error) throw error;

      const filteredSources = [...new Set(data.map(entry => entry.source))];
      setFilteredSources(filteredSources);
      setTotalEntries(count || 0);
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));

      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      setEntries(data.slice(startIndex, startIndex + ITEMS_PER_PAGE));
    } catch (error) {
      console.error('Error fetching entries:', error);
      setError(`獲取文章失敗: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setActiveKeyword('');
    fetchEntries();
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleSourceChange = (e) => {
    setSelectedSource(e.target.value);
    setCurrentPage(1);
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range === dateRange ? '' : range);
    setCurrentPage(1);
  };

  const handleKeywordClick = (keyword) => {
    setSearchTerm(keyword);
    setActiveKeyword(keyword);
    setCurrentPage(1);
    fetchEntries();
  };

  const clearKeywordSearch = () => {
    setSearchTerm('');
    setActiveKeyword('');
    setCurrentPage(1);
    fetchEntries();
  };

  const renderKeywords = (keywordsString) => {
    if (!keywordsString) return null;
    
    let keywords;
    try {
      keywords = JSON.parse(keywordsString);
    } catch (error) {
      console.error('Failed to parse keywords:', error);
      return null;
    }

    if (!Array.isArray(keywords) || keywords.length === 0) return null;

    return (
      <div className="mt-2 flex flex-wrap items-center gap-1">
        <Tag className="w-4 h-4 text-gray-500" />
        {keywords.map((keyword, index) => (
          <button
            key={index}
            onClick={() => handleKeywordClick(keyword)}
            className={`inline-block px-2 py-1 text-xs font-semibold rounded-full mr-2 mb-2 ${
              activeKeyword === keyword
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {keyword}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8 bg-gray-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 sm:mb-0">
          📚 聽語期刊速報
        </h1>
        
        <form onSubmit={handleSearch} className="w-full sm:w-auto relative">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索文章或關鍵字..."
              className="w-full sm:w-64 p-2 pr-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500"
            />
            <button type="submit" className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white rounded-lg text-xs px-2 py-1 hover:bg-blue-700 focus:ring-2 focus:outline-none focus:ring-blue-300">
              <Search className="w-4 h-4" />
            </button>
          </div>
          {activeKeyword && (
            <div className="absolute left-0 -bottom-8 flex items-center bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">
              <span className="mr-1">當前關鍵字:</span>
              <span className="font-bold">{activeKeyword}</span>
              <button
                onClick={clearKeywordSearch}
                className="ml-1 text-blue-600 hover:text-blue-800"
                aria-label="清除關鍵字搜索"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </form>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap justify-between items-center mb-4">
          <p className="text-sm text-gray-600 mb-2 sm:mb-0">
            共有 <span className="font-semibold text-blue-600">{filteredSources.length}</span> 個期刊，
            共 <span className="font-semibold text-blue-600">{totalEntries}</span> 篇文章
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleDateRangeChange('week')}
              className={`px-3 py-1 text-xs rounded-full focus:outline-none ${
                dateRange === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              最近一周
            </button>
            <button
              onClick={() => handleDateRangeChange('month')}
              className={`px-3 py-1 text-xs rounded-full focus:outline-none ${
                dateRange === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              最近一月
            </button>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <select
            value={selectedSource}
            onChange={handleSourceChange}
            className="w-full sm:w-auto flex-grow p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">所有期刊</option>
            {uniqueSources.map((source) => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>

          <button
            onClick={toggleSortOrder}
            className="w-full sm:w-auto p-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 focus:ring-2 focus:outline-none focus:ring-blue-300 flex items-center justify-center"
          >
            {sortOrder === 'asc' ? <SortAsc className="w-4 h-4 mr-1" /> : <SortDesc className="w-4 h-4 mr-1" />}
            {sortOrder === 'asc' ? '時間升序' : '時間降序'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          錯誤: {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}
      
      {!loading && entries.length === 0 && (
        <div className="text-center p-4 text-gray-600">未找到文章。</div>
      )}

      <div className="space-y-4">
        {entries.map((entry) => (
          <div key={entry.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4">
              <h2 className="text-base md:text-lg font-semibold mb-2 text-pink-600">
                {entry.title}
              </h2>
              <h3 className="text-sm md:text-md mb-2 text-gray-800 font-bold">
                {entry.title_translated}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {entry.tldr}
              </p>
              {renderKeywords(entry.keywords)}
              <div className="text-xs text-gray-500 flex items-center flex-wrap mt-2">
                <a href={`https://pubmed.ncbi.nlm.nih.gov/${entry.pmid}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  PubMed
                </a>
                <span className="mx-1">•</span>
                <span className="text-green-600">
                  {entry.source}
                </span>
                <span className="mx-1">•</span>
                <span className="text-amber-500">
                  發布日期: {new Date(entry.published).toLocaleDateString('zh-TW')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center mt-8">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`m-1 px-3 py-1 text-sm rounded ${
                currentPage === i + 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      <div className="mt-12 p-4 border-t border-gray-300 text-gray-600 text-center">
        <p className="text-sm md:text-base max-w-3xl mx-auto">
          <strong>⚠️ 警告：</strong>AI 處理生成的 TL;DR 摘要和中文翻譯可能存在錯誤或不準確之處。為確保資訊的準確性，我們強烈建議您參考原文內容。
        </p>
      </div>
    </div>
  );
};

export default RssViewer;

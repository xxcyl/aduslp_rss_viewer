import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Search, SortAsc, SortDesc, Tag, ExternalLink, Mail, Moon, Sun } from 'lucide-react';

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
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    fetchStats();
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [currentPage, sortOrder, selectedSource, dateRange, activeKeyword]);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    document.body.classList.toggle('dark', darkMode);
  }, [darkMode]);
  
  const setCurrentPageAndScrollToTop = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
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

      if (activeKeyword) {
        query = query.or(`title.ilike.%${activeKeyword}%,title_translated.ilike.%${activeKeyword}%,tldr.ilike.%${activeKeyword}%,keywords.ilike.%${activeKeyword}%`);
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
    setActiveKeyword(searchTerm);
    setCurrentPage(1);
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
    if (activeKeyword === keyword) {
      setActiveKeyword('');
      setSearchTerm('');
    } else {
      setActiveKeyword(keyword);
      setSearchTerm(keyword);
    }
    setCurrentPage(1);
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
        <Tag className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
        {keywords.map((keyword, index) => (
          <button
            key={index}
            onClick={() => handleKeywordClick(keyword)}
            className={`inline-block px-2 py-1 text-xs font-semibold rounded-full mr-2 mb-2 transition-colors duration-200 ${
              activeKeyword === keyword
                ? 'bg-blue-600 text-white'
                : darkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {keyword}
          </button>
        ))}
      </div>
    );
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`container mx-auto px-2 sm:px-4 py-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'} transition-colors duration-300`}>
      <div className="flex flex-col items-center sm:flex-row sm:justify-between sm:items-center mb-6">
        <h1 className={`text-3xl sm:text-2xl md:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4 sm:mb-0 text-center sm:text-left`}>
          <a href="https://www.audslp.cc/" className="hover:text-blue-600 transition-colors duration-300">
            📚 聽語期刊速報
          </a>
        </h1>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索文章或關鍵字..."
                className={`w-48 sm:w-64 p-2 pr-10 text-sm ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} border ${darkMode ? 'border-gray-700' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500`}
              />
              <button type="submit" className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white rounded-lg text-xs px-2 py-1 hover:bg-blue-700 focus:ring-2 focus:outline-none focus:ring-blue-300">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full ${darkMode ? 'bg-yellow-400 text-gray-900' : 'bg-gray-800 text-white'} flex-shrink-0`}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>
      
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 mb-6`}>
        <div className="flex flex-wrap justify-between items-center mb-4">
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2 sm:mb-0`}>
            共有 <span className="font-semibold text-blue-600">{filteredSources.length}</span> 個期刊，
            共 <span className="font-semibold text-blue-600">{totalEntries}</span> 篇文章
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleDateRangeChange('week')}
              className={`px-3 py-1 text-xs rounded-full focus:outline-none ${
                dateRange === 'week'
                  ? 'bg-blue-600 text-white'
                  : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
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
                  : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
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
            className={`w-full sm:w-auto flex-grow p-2 text-sm ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500`}
          >
            <option value="">所有期刊</option>
            {uniqueSources.map((source) => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>

          <button
            onClick={toggleSortOrder}
            className={`w-full sm:w-auto p-2 ${darkMode ? 'bg-blue-700' : 'bg-blue-600'} text-white text-sm rounded-lg hover:bg-blue-700 focus:ring-2 focus:outline-none focus:ring-blue-300 flex items-center justify-center`}
          >
            {sortOrder === 'asc' ? <SortAsc className="w-4 h-4 mr-1" /> : <SortDesc className="w-4 h-4 mr-1" />}
            {sortOrder === 'asc' ? '時間升序' : '時間降序'}
          </button>
        </div>
      </div>

      {error && (
        <div className={`mb-4 p-4 ${darkMode ? 'bg-red-900 border-red-700 text-red-200' : 'bg-red-100 border-red-400 text-red-700'} rounded`}>
          錯誤: {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center h-32">
          <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${darkMode ? 'border-white' : 'border-gray-900'}`}></div>
        </div>
      )}
      
      {!loading && entries.length === 0 && (
        <div className={`text-center p-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>未找到文章。</div>
      )}

      <div className="space-y-4">
        {entries.map((entry) => (
          <div key={entry.id} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden transform transition duration-400 ease-in-out hover:-translate-y-2 hover:scale-[1.01] hover:shadow-xl`}>
            <div className="p-4">
              <h2 className={`text-base md:text-lg font-semibold mb-2 ${darkMode ? 'text-pink-400' : 'text-pink-600'}`}>
                {entry.doi ? (
                  <a
                    href={`https://doi.org/${entry.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline flex items-center"
                  >
                    <span className="mr-1">{entry.title}</span>
                    <ExternalLink className="hidden sm:inline-block w-5 h-5 flex-shrink-0" />
                  </a>
                ) : (
                  entry.title
                )}
              </h2>
              <h3 className={`text-sm md:text-md mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-800'} font-bold`}>
                {entry.title_translated}
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                {entry.tldr}
              </p>
              {renderKeywords(entry.keywords)}
              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center flex-wrap mt-2`}>
                <a href={`https://pubmed.ncbi.nlm.nih.gov/${entry.pmid}`} target="_blank" rel="noopener noreferrer" className={`${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:underline'}`}>
                  PubMed
                </a>
                <span className="mx-1">•</span>
                <span className={darkMode ? 'text-green-400' : 'text-green-600'}>
                  {entry.source}
                </span>
                <span className="mx-1">•</span>
                <span className={darkMode ? 'text-amber-400' : 'text-amber-500'}>
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
              onClick={() => setCurrentPageAndScrollToTop(i + 1)}
              className={`m-1 px-3 py-1 text-sm rounded ${
                currentPage === i + 1
                  ? 'bg-blue-600 text-white'
                  : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      <div className={`mt-12 p-4 border-t ${darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-600'}`}>
        <p className="text-sm md:text-base mx-auto max-w-5xl lg:max-w-6xl xl:max-w-7xl text-center">
          <strong>⚠️ 警告：</strong>AI 處理生成的 TL;DR 摘要和中文翻譯可能存在錯誤或不準確之處。為確保資訊的準確性，我們強烈建議您參考原文內容。
        </p>
      </div>

      <div className={`mt-8 text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        <p className="flex items-center justify-center">
          <span className="mr-2">By CHEYU LEE</span>
          <a href="mailto:wittyxx@gmail.com" className={`${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>
            <Mail className="w-5 h-5" />
          </a>
        </p>
      </div>
    </div>
  );
};

export default RssViewer;

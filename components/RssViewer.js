import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Search, SortAsc, SortDesc } from 'lucide-react';

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
  const [selectedSource, setSelectedSource] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [currentPage, searchTerm, sortOrder, selectedSource]);

  const fetchStats = async () => {
    try {
      const { data: sources, error: sourcesError } = await supabase
        .from('rss_entries')
        .select('source');

      if (sourcesError) {
        throw new Error(`獲取來源錯誤: ${sourcesError.message}`);
      }

      const uniqueSources = [...new Set(sources.map(s => s.source))];
      setUniqueSources(uniqueSources);
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
        query = query.or(`title.ilike.%${searchTerm}%,title_translated.ilike.%${searchTerm}%,tldr.ilike.%${searchTerm}%`);
      }

      if (selectedSource) {
        query = query.eq('source', selectedSource);
      }

      const { data, count, error } = await query
        .order('published', { ascending: sortOrder === 'asc' })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (error) throw error;

      setEntries(data || []);
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
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
    fetchEntries();
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">最新 RSS 文章</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          錯誤: {error}
        </div>
      )}
      
      <div className="mb-4 text-center">
        <p className="text-gray-600">共有 {uniqueSources.length} 個期刊，{totalEntries} 篇文章</p>
      </div>

      <div className="flex mb-6 space-x-4">
        <form onSubmit={handleSearch} className="flex-grow">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索文章..."
              className="w-full p-4 pr-12 text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500"
            />
            <button type="submit" className="absolute right-2.5 bottom-2.5 bg-blue-600 text-white rounded-lg text-sm px-4 py-2 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300">
              <Search className="w-5 h-5" />
            </button>
          </div>
        </form>

        <select
          value={selectedSource}
          onChange={(e) => setSelectedSource(e.target.value)}
          className="p-4 text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">所有期刊</option>
          {uniqueSources.map((source) => (
            <option key={source} value={source}>{source}</option>
          ))}
        </select>

        <button
          onClick={toggleSortOrder}
          className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300"
        >
          {sortOrder === 'asc' ? <SortAsc className="w-5 h-5" /> : <SortDesc className="w-5 h-5" />}
        </button>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      )}
      
      {!loading && entries.length === 0 && (
        <div className="text-center p-4 text-gray-600">未找到文章。</div>
      )}

      <div className="space-y-4">
        {entries.map((entry) => (
          <div key={entry.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-2 text-pink-600">
                {entry.title}
              </h2>
              <h3 className="text-md mb-2 text-gray-700">
                {entry.title_translated}
              </h3>
              <p className="text-sm text-amber-500 mb-2">發布日期: {new Date(entry.published).toLocaleDateString('zh-TW')}</p>
              <p className="text-sm text-gray-600 mb-4">
                {entry.tldr}
              </p>
              <div className="text-xs text-gray-500 flex items-center space-x-2">
                <a href={`https://pubmed.ncbi.nlm.nih.gov/${entry.pmid}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  PubMed
                </a>
                <span>•</span>
                <span className="text-green-600">
                  {entry.source}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`mx-1 px-4 py-2 rounded ${
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
    </div>
  );
};

export default RssViewer;

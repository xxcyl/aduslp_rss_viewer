import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Search } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const ITEMS_PER_PAGE = 9;

const RssViewer = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEntries();
  }, [currentPage, searchTerm]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('rss_entries')
        .select('*', { count: 'exact' });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,title_translated.ilike.%${searchTerm}%,tldr.ilike.%${searchTerm}%`);
      }

      const { data, count, error } = await query
        .order('published', { ascending: false })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (error) throw error;

      setEntries(data);
      setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
    } catch (error) {
      setError('Failed to fetch entries');
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchEntries();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">最新 RSS 文章</h1>
      
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索文章..."
            className="w-full p-4 pr-12 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
          />
          <button type="submit" className="absolute right-2.5 bottom-2.5 bg-blue-600 text-white rounded-lg text-sm px-4 py-2 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300">
            <Search className="w-5 h-5" />
          </button>
        </div>
      </form>

      {loading && (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      )}
      
      {error && <div className="text-center p-4 text-red-500">Error: {error}</div>}
      
      {!loading && entries.length === 0 && (
        <div className="text-center p-4 text-gray-600">No entries found.</div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {entries.map((entry) => (
          <div key={entry.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-3 text-gray-800">
                <a href={entry.link} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors duration-300">
                  {entry.title} {entry.title_translated && `| ${entry.title_translated}`}
                </a>
              </h2>
              <p className="text-sm text-gray-500 mb-3">發布日期: {new Date(entry.published).toLocaleDateString('zh-TW')}</p>
              <p className="text-sm text-gray-600">{entry.tldr}</p>
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

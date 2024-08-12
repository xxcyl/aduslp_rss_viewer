import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const RssViewer = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      setDebugInfo('Fetching data from Supabase...');
      
      // 首先，獲取表中的總行數
      const { count, error: countError } = await supabase
        .from('rss_entries')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;
      
      setDebugInfo(`Total rows in table: ${count}`);

      // 然後，執行原始查詢，但不使用排序和限制
      const { data, error } = await supabase
        .from('rss_entries')
        .select('*');

      if (error) throw error;
      
      setDebugInfo(prevInfo => `${prevInfo}\nFetched ${data.length} entries.${data.length > 0 ? `\nFirst entry: ${JSON.stringify(data[0])}` : ''}`);
      setEntries(data);
    } catch (error) {
      setError('Failed to fetch entries');
      setDebugInfo(`Error: ${error.message}`);
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">最新 RSS 文章</h1>
      
      {/* Debug Info */}
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
        <p className="font-bold">Debug Info:</p>
        <pre className="whitespace-pre-wrap">{debugInfo}</pre>
        <p>Loading: {loading.toString()}</p>
        <p>Error: {error || 'None'}</p>
        <p>Entries count: {entries.length}</p>
      </div>

      {loading && <div className="text-center p-4">Loading...</div>}
      {error && <div className="text-center p-4 text-red-500">Error: {error}</div>}
      
      {entries.length === 0 ? (
        <div className="text-center p-4">No entries found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entries.map((entry) => (
            <div key={entry.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">
                  <a href={entry.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {entry.title_translated || entry.title}
                  </a>
                </h2>
                <p className="text-sm text-gray-500 mb-2">發布日期: {new Date(entry.published).toLocaleDateString('zh-TW')}</p>
                <p className="text-sm">{entry.tldr}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RssViewer;

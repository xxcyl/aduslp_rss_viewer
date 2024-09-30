import Head from 'next/head';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import RssViewer from '../components/RssViewer';

export default function Home({ initialEntries, initialStats }) {
  const [entries, setEntries] = useState(initialEntries);
  const [stats, setStats] = useState(initialStats);

  const title = "聽語期刊速報 | RSS 閱讀器";
  const description = "瀏覽最新的聽語相關期刊文章和研究，獲取聽力學和語言治療領域的最新資訊。";
  const url = "https://www.audslp.cc/";
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": url,
    "name": title,
    "description": description
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link 
          rel="icon" 
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📚</text></svg>"
        />
        <link rel="canonical" href={url} />
           
        <meta property="og:type" content="website" />
        <meta property="og:url" content={url} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        
        <meta property="twitter:card" content="summary" />
        <meta property="twitter:url" content={url} />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
        
        <meta name="keywords" content="聽語, 聽語期刊, 聽語研究, 聽力期刊, 語言治療期刊, 聽力損失, 聽損, 吞嚥困難, 吞嚥障礙, 語言發展遲緩, 聽力學, 語言治療, 研究, RSS" />
        <meta name="robots" content="index, follow" />
        
        <script type="application/ld+json" 
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} 
        />
      </Head>
      <main>
        <h1 className="sr-only">聽語期刊速報 | 最新聽力學和語言治療研究</h1>
        <RssViewer
          initialEntries={entries}
          initialStats={stats}
          setEntries={setEntries}
          setStats={setStats}
        />
      </main>
    </>
  );
}

export async function getStaticProps() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const ITEMS_PER_PAGE = 10;

  try {
    const { data: entries, error: entriesError } = await supabase
      .from('rss_entries')
      .select('*')
      .order('published', { ascending: false })
      .limit(ITEMS_PER_PAGE);

    if (entriesError) throw entriesError;

    const { data: sources, error: sourcesError } = await supabase
      .from('rss_entries')
      .select('source');

    if (sourcesError) throw sourcesError;

    const uniqueSources = [...new Set(sources.map(s => s.source))].sort((a, b) => a.localeCompare(b));
    const totalEntries = sources.length;

    return {
      props: {
        initialEntries: entries,
        initialStats: {
          uniqueSources,
          totalEntries,
        },
      },
      revalidate: 86400, // 每24小時（1天）重新生成頁面
    };
  } catch (error) {
    console.error('獲取數據時出錯：', error);
    return {
      props: {
        initialEntries: [],
        initialStats: {
          uniqueSources: [],
          totalEntries: 0,
        },
      },
      revalidate: 3600, // 如果出錯，每小時重試一次
    };
  }
}

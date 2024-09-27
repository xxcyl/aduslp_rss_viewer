import Head from 'next/head';
import RssViewer from '../components/RssViewer';

export default function Home() {
  const title = "聽語期刊速報 | RSS 閱讀器";
  const description = "瀏覽最新的聽語相關期刊文章和研究，獲取聽力學和語言治療領域的最新資訊。";
  const url = "https://www.audslp.cc/"; // 請替換為您的實際網址

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
           

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={url} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />

        {/* Twitter */}
        <meta property="twitter:card" content="summary" />
        <meta property="twitter:url" content={url} />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />

        {/* 其他有助於SEO的meta標籤 */}
        <meta name="keywords" content="聽語, 聽語期刊, 聽語研究, 聽力期刊, 語言治療期刊, 聽力損失, 聽損, 吞嚥困難, 吞嚥障礙, 語言發展遲緩, 聽力學, 語言治療, 研究, RSS" />
        <meta name="robots" content="index, follow" />

        {/* 結構化數據 */}
        <script type="application/ld+json" 
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} 
        />
      </Head>
      <main>
        <h1 className="sr-only">聽語期刊速報 | 最新聽力學和語言治療研究</h1>
        <RssViewer />
      </main>
    </>
  );
}

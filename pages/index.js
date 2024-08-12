import Head from 'next/head';
import RssViewer from '../components/RssViewer';

export default function Home() {
  return (
    <>
      <Head>
        <title>聽語期刊速報 | RSS 閱讀器</title>
        <meta name="description" content="瀏覽最新的聽語相關期刊文章和研究" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link 
          rel="icon" 
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📚</text></svg>"
        />
      </Head>
      <main>
        <h1 className="sr-only">聽語期刊速報</h1>
        <RssViewer />
      </main>
    </>
  );
}

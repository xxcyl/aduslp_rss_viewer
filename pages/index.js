import Head from 'next/head';
import RssViewer from '../components/RssViewer';

export default function Home() {
  return (
    <>
      <Head>
        <title>聽語期刊速報 | RSS 閱讀器</title>
        <meta name="description" content="瀏覽最新的聽語相關期刊文章和研究" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <h1 className="sr-only">聽語期刊速報</h1>
        <RssViewer />
      </main>
    </>
  );
}

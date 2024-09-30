export async function getServerSideProps({ res }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: entries } = await supabase
    .from('rss_entries')
    .select('id, published')
    .order('published', { ascending: false });

  const today = new Date().toISOString().slice(0, 10);

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>https://www.audslp.cc/</loc>
        <lastmod>${today}</lastmod>
      </url>
      ${entries
        .map((entry) => {
          const date = new Date(entry.published).toISOString().slice(0, 10);
          return `
            <url>
              <loc>https://www.audslp.cc/entry/${entry.id}</loc>
              <lastmod>${date}</lastmod>
            </url>
          `;
        })
        .join('')}
    </urlset>
  `;

  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
}

export default function Sitemap() {}

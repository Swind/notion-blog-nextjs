import Head from "next/head";
import Link from "next/link";
import { getDatabase } from "../lib/notion";
import { Text } from "./[id].js";

export const databaseId = process.env.NOTION_DATABASE_ID;

export default function Home({ posts }) {
  return (
    <div className="font-sans leading-normal tracking-normal">
      <Head>
        <title>Notion Next.js blog</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container w-full md:max-w-3xl mx-auto pt-20">
        <header className="font-sans mb-14">
          <h1 className="font-bold font-sans break-normal text-gray-900 pt-6 pb-2 text-3xl md:text-4xl opacity-70 leading-6">就只是一個筆記</h1>
        </header>

        <h2 className="mb-3 pb-3 border-b-2 border-gray-600 uppercase text-xl opacity-60 tracking-wide">All Posts</h2>
        <ol className="list-none m-0 p-0">
          {posts.map((post) => {
            const date = new Date(post.last_edited_time).toLocaleString(
              "en-US",
              {
                month: "short",
                day: "2-digit",
                year: "numeric",
              }
            );
            return (
              <li key={post.id} className="mb-12">
                <h3 className="mb-3 text-2xl font-bold">
                  <Link href={`/${post.id}`}>
                    <a>
                      <Text text={post.properties.Name.title} />
                    </a>
                  </Link>
                </h3>

                <p className="my-0 opacity-60">{date}</p>
                <Link href={`/${post.id}`}>
                  <a className="text-blue-600"> Read post →</a>
                </Link>
              </li>
            );
          })}
        </ol>
      </main>
    </div>
  );
}

export const getStaticProps = async () => {
  const database = await getDatabase(databaseId);

  return {
    props: {
      posts: database,
    },
    revalidate: 1,
  };
};

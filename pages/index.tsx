import Head from "next/head";
import Link from "next/link";
import { getPostsFromDatabase, TextList } from "./api/notion";
import Text from "../components/Text";
import Tags from "../components/Tags";

export const databaseId = process.env.NOTION_DATABASE_ID;

type Posts = Awaited<ReturnType<typeof getPostsFromDatabase>>;
type Post = Posts[0]

interface HomeProps {
  posts: Posts,
}

function GetTags(post: Post) {
  if("properties" in post && "Tags" in post.properties && post.properties.Tags.type === "multi_select") {
    return post.properties.Tags.multi_select;
  }
  return [] 
}

export default function Home({ posts }: HomeProps) {
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
            const date = "last_edited_time" in post ? new Date(post.last_edited_time) : new Date();
            let tags = GetTags(post)

            const dateString = date.toLocaleString(
              "en-US",
              {
                month: "short",
                day: "2-digit",
                year: "numeric",
              }
            );
            return (
              <li key={post.id} className="mb-12">
                <h3 className="text-2xl font-bold">
                  <Link href={`/${post.id}`}>
                    <a>
                      {
                        "properties" in post && "Name" in post.properties && "title" in post.properties.Name ?
                          <Text textList={post.properties.Name.title as TextList} /> : null
                      }
                    </a>
                  </Link>
                </h3>

                <div className="my-1">
                  <Tags tags={tags}></Tags>
                </div>

                <p className="my-0 opacity-60">{dateString}</p>
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
  let pages: Posts = []
  if (databaseId !== undefined) {
    pages = await getPostsFromDatabase(databaseId);
  }

  return {
    props: {
      posts: pages,
    },
    revalidate: 1,
  };
};

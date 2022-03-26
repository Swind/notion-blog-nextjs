import React from 'react'
import { Fragment } from "react";
import { Page, getPage, getBlocks, Block, getUrlPreview, BookmarkBlock, BookmarkPreview, getPostsFromDatabase, TextList, LinkPreviewBlock } from './api/notion';
import { databaseId } from './index'
import { GetStaticProps } from 'next'
import Text from "../components/Text";
import Header from "../components/Header";
import Bookmark from "../components/Bookmark"
import Code from "../components/Code"
import Head from "next/head";
import Link from "next/link";
import TableOfContents from '../components/TableOfContents';

interface ChildrenBlock {
  id: string,
  children: Block[]
}

function getChildBlocksOfBlock(raw_block: Block, childrenBlocks: ChildrenBlock[]): Block[] {
  // For the notion client fxxk type
  let block = raw_block as any


  // Add child blocks if the block should contain children but none exists
  if ("has_children" in block && block.has_children && !block[block.type].children) {
    let childrenBlock = childrenBlocks.find(
      (x) => x.id === block.id
    );

    if (childrenBlock) {
      return childrenBlock.children
    }
  }

  return []
}

function findPreview(url: string, previewList: BookmarkPreview[]) {
  for (let preview of previewList) {
    if (preview.url === url) {
      return preview
    }
  }

  return null
}

const renderBlock = (block: Block, bookmarkPreviews: BookmarkPreview[]) => {
  if (!("type" in block)) {
    return <div></div>
  }

  switch (block.type) {
    case "paragraph": {
      return (
        <p className="mb-2">
          <Text textList={block.paragraph.text} />
        </p>
      )
    }
    case "heading_1": {
      return (
        <div>
          <h1 id={block.id} className="text-3xl mt-6 opacity-70 font-bold">
            <Text textList={block.heading_1.text} />
          </h1>
          <div className="border-t-2 border-gray-800 my-3"></div>
        </div>
      );
    }
    case "heading_2":
      return (
        <div>
          <h2 id={block.id} className="text-xl my-5 opacity-70 font-bold">
            <Text textList={block.heading_2.text} />
          </h2>
          <div className="border-t border-gray-300 my-3"></div>
        </div>
      );
    case "heading_3":
      return (
        <h3 id={block.id} className="text-lg my-4 opacity-70 font-bold">
          <Text textList={block.heading_3.text} />
        </h3>
      );
    case "bulleted_list_item":
      return (
        <li className="my-2">
          <Text textList={block.bulleted_list_item.text} />
        </li>
      );

    case "numbered_list_item":
      return (
        <li className="my-2">
          <Text textList={block.numbered_list_item.text} />
        </li>
      );

    case "to_do":
      return (
        <div>
          <label htmlFor={block.id}>
            <input type="checkbox" id={block.id} defaultChecked={block.to_do.checked} />{" "}
            <Text textList={block.to_do.text} />
          </label>
        </div>
      );
    case "toggle":
      return (
        <details>
          <summary>
            <Text textList={block.toggle.text} />
          </summary>
        </details>
      );
    case "child_page":
      return <p>{block.child_page.title}</p>;
    case "image":
      const src =
        block.image.type === "external" ? block.image.external.url : block.image.file.url;
      const caption = block.image.caption && block.image.caption.length > 0 ? block.image.caption[0].plain_text : "";
      return (
        <figure>
          <img className="w-full h-auto my-2" src={src} alt={caption} />
          {caption && <figcaption>{caption}</figcaption>}
        </figure>
      );
    case "divider":
      //return <hr key={block.id} className="mb-3" />;
      return null
    case "quote":
      return <blockquote key={block.id} className="border-l-4 border-black p-4 my-2 bg-gray-100">{block.quote.text[0].plain_text}</blockquote>
    case "code":
      return <Code code={block.code}></Code>
    case "table_of_contents":
      return null
    case "bookmark":
      return <Bookmark url={block.bookmark.url} preview={findPreview(block.bookmark.url, bookmarkPreviews)}></Bookmark>
    case "link_preview":
      return <Bookmark url={block.link_preview.url} preview={findPreview(block.link_preview.url, bookmarkPreviews)}></Bookmark>
    default:
      return `❌ Unsupported block (${block.type === "unsupported" ? `unsupported by Notion API ${block.type}` : block.type
        })`;
  }
};

export default function Post({ page, blocks, childBlocks, bookmarkPreviews }: {
  page: Page,
  blocks: Block[],
  childBlocks: ChildrenBlock[],
  bookmarkPreviews: BookmarkPreview[]
}) {

  if (!page || !blocks) {
    return <div />;
  }

  const date = "last_edited_time" in page ? new Date(page.last_edited_time) : new Date();
  const dateString = date.toLocaleString(
    "en-US",
    {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }
  );

  let title = (page as any).properties.Name.title as TextList
  let title_plain_text = title.map((value, index) => {
    if (value.type !== "text") {
      return ""
    } else {
      return value.text.content
    }
  }).join(" ")

  return (
    <div>
      <div className="mb-10">
        <Link href="/">
          <a>
            <Header title="就只是一個筆記" />
          </a>
        </Link>
      </div>

      <Head>
        <title>{title_plain_text}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex flex-row">

        <article className="py-0 max-w-screen-lg mx-5 xl:mx-auto">
          <div className="my-10">
            <h1 id="title" className="text-4xl font-extrabold">
              {
                title !== undefined ?
                  <Text textList={title} /> : null
              }
            </h1>
            <p className="my-2 opacity-60">{dateString}</p>
          </div>
          <section>
            {blocks.map((block) => (
              <Fragment key={block.id}>{renderBlock(block, bookmarkPreviews)}</Fragment>
            ))}
            <Link href="/">
              <a className="inline-block my-5">← Go home</a>
            </Link>
          </section>
        </article>

        <div className="w-1/4 ml-6 hidden xl:block">
          <div className="sticky top-10">
            <TableOfContents blocks={blocks} />
          </div>
        </div>

      </div>
    </div>
  );
}

export const getStaticPaths = async () => {
  if (databaseId === undefined) {
    return {}
  }

  const database = await getPostsFromDatabase(databaseId);
  return {
    paths: database.map((page) => ({ params: { id: page.id } })),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const { id } = context.params as { id: string };
  const page = await getPage(id);
  const blocks = await getBlocks(id);

  // Retrieve block children for nested blocks (one level deep), for example toggle blocks
  // https://developers.notion.com/docs/working-with-page-content#reading-nested-blocks
  const childBlocks = await Promise.all(
    blocks
      .filter((block) => "has_children" in block && block.has_children)
      .map(async (block) => {
        return {
          id: block.id,
          children: await getBlocks(block.id),
        };
      })
  );

  const bookmarkBlocks = blocks.filter((block) => "type" in block && block.type === "bookmark") as BookmarkBlock[]
  const bookmarkPreviews = await Promise.all(
    bookmarkBlocks
      .map(
        async (block: BookmarkBlock) => {
          return await getUrlPreview(block.bookmark.url);
        }
      ))

  const linkPreviewBlocks = blocks.filter((block) => "type" in block && block.type === "link_preview") as LinkPreviewBlock[]
  const linkPreviews = await Promise.all(
    linkPreviewBlocks
      .map(
        async (block: LinkPreviewBlock) => {
          return await getUrlPreview(block.link_preview.url);
        }
      ))

  return {
    props: {
      page,
      blocks,
      childBlocks,
      bookmarkPreviews: bookmarkPreviews.concat(linkPreviews),
    },
    revalidate: 1,
  };
};

import React from 'react'
import { Fragment } from "react";
import { Page, getPage, getBlocks, Block, getBookmarkPreview, BookmarkBlock, BookmarkPreview, getPostsFromDatabase, TextList } from './api/notion';
import { databaseId } from './index'
import { GetStaticProps } from 'next'
import Text from "../components/Text";
import Bookmark from "../components/Bookmark"
import Code from "../components/Code"
import Head from "next/head";
import Link from "next/link";
import { BlockList } from 'net';

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

function findBookmarkPreview(bookmarkBlock: BookmarkBlock, previewList: BookmarkPreview[]) {
  for(let preview of previewList) {
    if(preview.url === bookmarkBlock.bookmark.url){
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
        <h1 className="text-3xl my-6 before:content-['#'] before:mr-1 opacity-70 font-bold">
          <Text textList={block.heading_1.text} />
        </h1>
      );
    }
    case "heading_2":
      return (
        <h2 className="text-2xl my-5 before:content-['##'] before:mr-1 opacity-70 font-bold">
          <Text textList={block.heading_2.text} />
        </h2>
      );
    case "heading_3":
      return (
        <h3 className="text-xl my-4 before:content-['###'] before:mr-1 opacity-70 font-bold">
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
      return <hr key={block.id} className="mb-3" />;
    case "quote":
      return <blockquote key={block.id}>{block.quote.text[0].plain_text}</blockquote>;
    case "code":
      return <Code code={block.code}></Code>
    case "table_of_contents":
      return null
    case "bookmark":
      return <Bookmark bookmark={block.bookmark} preview={findBookmarkPreview(block, bookmarkPreviews)}></Bookmark>
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

  let title = (page as any).properties.Name.title as TextList
  let title_plain_text = title.map((value, index) => {
    if(value.type !== "text") {
      return ""
    } else {
      return value.text.content
    }
  }).join(" ")

  return (
    <div>
      <Head>
        <title>{title_plain_text}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <article className="py-0 px-5 max-w-screen-lg my-0 mx-auto">
        <h1 className="text-4xl font-extrabold my-10">
          {
            title !== undefined ?
              <Text textList={title} /> : null
          }
        </h1>
        <section>
          {blocks.map((block) => (
            <Fragment key={block.id}>{renderBlock(block, bookmarkPreviews)}</Fragment>
          ))}
          <Link href="/">
            <a className="inline-block my-5">← Go home</a>
          </Link>
        </section>
      </article>
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

  /*
  const blocksWithChildren: Block[] = blocks.map((raw_block) => {
    // For the notion client fxxk type
    let block = raw_block as any

    // Add child blocks if the block should contain children but none exists
    if ("has_children" in block && block.has_children && !block[block.type].children) {
      block[block.type]["children"] = childBlocks.find(
        (x) => x.id === block.id
      )?.children;
    }

    return block as Block;
  });
  */

  const bookmarkBlocks = blocks.filter((block) => "type" in block && block.type === "bookmark") as BookmarkBlock[]
  const bookmarkPreviews = await Promise.all(
    bookmarkBlocks
      .map(
        async (block: BookmarkBlock) => {
          return await getBookmarkPreview(block.bookmark);
        }
      ))

  return {
    props: {
      page,
      blocks,
      childBlocks,
      bookmarkPreviews,
    },
    revalidate: 1,
  };
};
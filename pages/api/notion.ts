import { Client } from "@notionhq/client"
import { GetPageResponse, ListBlockChildrenResponse } from "@notionhq/client/build/src/api-endpoints";
import { getLinkPreview } from "link-preview-js"

type BlocksOfResponse<T> = T extends { results: unknown } ? T["results"] : never
type Blocks = BlocksOfResponse<ListBlockChildrenResponse>
export type Block = Blocks[0]

type CodeOf<T> = T extends { code: unknown } ? T["code"] : never;
export type CodeBlock = CodeOf<Block>

type BookmarkOf<T> = T extends { bookmark: unknown } ? T["bookmark"] : never;
export type Bookmark = BookmarkOf<Block>

type BookmarkBlockOf<T> = T extends { bookmark: unknown } ? T : never;
export type BookmarkBlock = BookmarkBlockOf<Block>

type ParagraphOf<T> = T extends { paragraph: unknown } ? T["paragraph"] : never;
export type Paragraph =  ParagraphOf<Block>

export type TextList = Paragraph["text"]
export type Text = TextList[0]

export type Page = GetPageResponse

 export interface BookmarkPreview {
  url: string,
  title: string,
  image: string,
  description: string,
  favicons: string[]
}

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

/*
convert notion bookmark block to

{
  "type": "bookmark",
  //...other keys excluded
  "bookmark": {
    
    "url": "https://website.domain"
  }
}
*/

export const getPostsFromDatabase = async (databaseId: string) => {
  const resp = await notion.databases.query({ database_id: databaseId })

  let pages = resp.results.filter((item) => {
    if ("properties" in item && "Published" in item.properties) {
      let published = item.properties.Published as { checkbox: boolean }
      return published.checkbox
    }

    return false
  })

  return pages
}

export const getPage = async (pageId: string) => {
  return await notion.pages.retrieve({ page_id: pageId })
}

export const getBlocks = async (blockId: string): Promise<Blocks> => {
  const resp = await notion.blocks.children.list({
    block_id: blockId,
  })

  let blocks = resp.results
  return blocks
}

export async function getBookmarkPreview(block: Bookmark) {
  let preview = await getLinkPreview(block.url);
  let domain = new URL(block.url).hostname;

  var bookmarkPreview = {
    url: block.url,
    title: "",
    image: "",
    description: "",
    favicons: preview.favicons
  }

  // Image URL
  switch (preview.mediaType) {
    case "image":
      bookmarkPreview.title = domain;
      bookmarkPreview.image = preview.url;
      bookmarkPreview.description = preview.url;
      break;
    case "audio":
    case "video":
    case "application":
      bookmarkPreview.title = domain;
      bookmarkPreview.description = preview.url;
      break;
    default:
      if ("title" in preview) {
        bookmarkPreview.title = preview.title;
      }

      if ("images" in preview && preview.images.length > 0) {
        bookmarkPreview.image = preview.images[0];
      }

      if ("description" in preview && preview.description) {
        bookmarkPreview.description = preview.description;
      } else {
        bookmarkPreview.description = preview.url;
      }

      break;
  }

  return bookmarkPreview;
}

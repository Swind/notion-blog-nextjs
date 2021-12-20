import { Client } from "@notionhq/client";
import { getLinkPreview } from "link-preview-js"

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

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
async function getBookmarkPreview(bookmarkBlock) {
  let preview = await getLinkPreview(bookmarkBlock.bookmark.url);
  let domain = new URL(bookmarkBlock.bookmark.url).hostname;

  var bookmarkPreview = {
    url: bookmarkBlock.bookmark.url,
    title: "",
    image: null,
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
      bookmarkPreview.title = preview.title;
      if (preview.images.length > 0) {
        bookmarkPreview.image = preview.images[0];
      }
      if (preview.description) {
        bookmarkPreview.description = preview.description;
      } else {
        bookmarkPreview.description = preview.url;
      }
      break;
  }
  bookmarkBlock.bookmark.preview = bookmarkPreview;
  return bookmarkBlock;
}

/*
{
  object: 'page',
  id: '9e7116cf-520d-47f7-8909-0edd8f102c75',
  created_time: '2020-03-03T16:31:00.000Z',
  last_edited_time: '2020-07-16T18:08:00.000Z',
  cover: null,
  icon: null,
  parent: {
    type: 'database_id',
    database_id: '676c0d7a-cb65-464b-99b2-5db4f7794d0e'
  },
  archived: false,
  properties: {
    Tags: { id: 'H%7D)T', type: 'multi_select', multi_select: [Array] },
    Slug: { id: 'S6_%22', type: 'rich_text', rich_text: [Array] },
    Date: { id: 'a%60af', type: 'date', date: [Object] },
    Published: { id: 'la%60A', type: 'checkbox', checkbox: true },
    Name: { id: 'title', type: 'title', title: [Array] }
  },
  url: 'https://www.notion.so/Docker-Android-9e7116cf520d47f789090edd8f102c75'
}
 */
export const getDatabase = async (databaseId) => {
  const response = await notion.databases.query({
    database_id: databaseId,
  });
  let pages = response.results.filter((item)=>{
    if("properties" in item && "Published" in item.properties && item.properties.Published.checkbox){
      return true;
    }
    return false;
  });
  return pages;
};

export const getPage = async (pageId) => {
  const response = await notion.pages.retrieve({ page_id: pageId });
  return response;
};

export const getBlocks = async (blockId) => {
  const response = await notion.blocks.children.list({
    block_id: blockId,
    page_size: 50,
  });

  let blocks = response.results;
  blocks = await Promise.all(blocks.map(async (block) => {
    if (block.type === "bookmark") {
      return await getBookmarkPreview(block);
    }
    return block;
  }));

  return blocks;
};

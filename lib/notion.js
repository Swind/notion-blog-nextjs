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
  console.log(bookmarkPreview)
  bookmarkBlock.bookmark.preview = bookmarkPreview;
  return bookmarkBlock;
}

export const getDatabase = async (databaseId) => {
  const response = await notion.databases.query({
    database_id: databaseId,
  });
  return response.results;
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

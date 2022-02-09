import React from 'react'

import Image from "next/image"
import { Bookmark as BookmarkType, BookmarkPreview } from '../pages/api/notion';

export default function Bookmark({ bookmark, preview }: { bookmark: BookmarkType, preview: BookmarkPreview | null }) {
  if (preview === null) {
    return (
      <a href={bookmark.url}>
        Bookmark
      </a>
    )
  } else {
    let image = preview.image ? preview.image : null;
    let favicon = preview.favicons.length > 0 ? preview.favicons[0] : undefined;

    return (
      <a href={bookmark.url}>
        <div className="flex justify-start w-full h-full my-3 p-2 border rounded-md">
          <div className="w-3/4 flex flex-col">
            <div className="grow">
              <div className="text-base overflow-hidden whitespace-nowrap text-ellipsis mb-1">
                {preview.title}
              </div>
              <div className="text-xs">
                {preview.description}
              </div>
            </div>
            <div className="flex mt-2">
              <div className="h-full flex flex-col justify-center mr-2">
                { favicon ? <Image className="w-4 h-4" src={favicon} alt="favicon" /> : null }
              </div>
              <div className="text-sm overflow-hidden whitespace-nowrap text-ellipsis">
                {bookmark.url}
              </div>
            </div>
          </div>
          <div className="w-1/4 object-cover ml-4">
            {image ? <Image src={image} alt={preview.title} /> : null}
          </div>
        </div>
      </a>
    )
  }
}
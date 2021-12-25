import React from 'react'

export default function Bookmark({ block }) {
  let preview = block.preview;
  let image = preview.image ? preview.image : null;
  let favicon = preview.favicons.length > 0 ? preview.favicons[0] : null;

  return (
    <a href={block.url}>
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
              <img className="w-4 h-4" src={favicon} alt="favicon" />
            </div>
            <div className="text-sm overflow-hidden whitespace-nowrap text-ellipsis">
              {block.url}
            </div>
          </div>
        </div>
        <div className="w-1/4 object-cover ml-4">
          {image ? <img src={image} alt={preview.title} /> : null}
        </div>
      </div>
    </a>
  )
}

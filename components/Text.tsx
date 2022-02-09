import React from 'react'

import { TextList } from '../pages/api/notion'

interface TextProps {
  textList: TextList
}

export default function Text({ textList }: TextProps) {
  if (!textList) {
    return null;
  }

  return <>
    {
      textList.map((value, index) => {
        if(value.type !== "text"){
          return <div>Unsupported text type {value.type}</div>
        }

        const {
          annotations: { bold, code, color, italic, strikethrough, underline },
          text,
        } = value;
        return (
          <span
            className={[
              bold ? "font-bold" : "",
              code ? "font-mono bg-gray-100 py-1 px-2 rounded-sm text-red-500" : "",
              italic ? "italic" : "",
              strikethrough ? "line-through" : "",
              underline ? "underline" : "",
            ].join(" ")}
            style={color !== "default" ? { color } : {}}
            key={index}
          >
            {text.link ? <a href={text.link.url} className="underline font-semibold mx-1">{text.content}</a> : text.content}
          </span>
        );
      })
    }
  </>
};
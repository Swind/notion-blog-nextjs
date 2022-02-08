import React from 'react'

interface TagProps {
  name: string,
  color: string
}

//"default" | "gray" | "brown" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "red";
const notionColor:Record<string, string> = {
  "default": "bg-gray-200 hover:bg-gray-300",
  "gray": "bg-gray-200 hover:bg-gray-300",
  "brown": "bg-amber-200 hover:bg-amber-300",
  "orange": "bg-orange-200 hover:bg-orange-300",
  "yellow": "bg-yellow-200 hover:bg-yellow-300",
  "green": "bg-green-200 hover:bg-green-300",
  "blue": "bg-blue-200 hover:bg-blue-300",
  "purple": "bg-purple-200 hover:bg-purple-300",
  "pink": "bg-pink-200 hover:bg-pink-300",
  "red": "bg-red-200 hover:bg-red-300",
}

function Tag({ name, color }: TagProps) {
  return <span className={`mr-1 px-2 rounded-full text-sm leading-loose ${notionColor[color]}`}>
    {name}
  </span>
}

interface TagsProps {
  tags: TagProps[]
}

export default function Tags({ tags }: TagsProps) {
  return <div className="flex flex-wrap">
    {
      tags.map((tag, index)=> {
        return <Tag key={`${tag.name}_${index}`} name={tag.name} color={tag.color} />
      })
    }
  </div>
}
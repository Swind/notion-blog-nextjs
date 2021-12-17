import React from 'react'

export default function Bookmark({ block }) {
  console.log(block)
  return (
    <a href={block.url}>Link</a>
  )
}
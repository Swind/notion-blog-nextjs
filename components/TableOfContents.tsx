import React from 'react'
import { Block } from '../pages/api/notion'
import Text from "../components/Text";
import { useRouter } from 'next/router'
import Link from "next/link";

function isHeader(block: Block) {
  return "type" in block && (block.type === "heading_1" || block.type === "heading_2" || block.type === "heading_3");
}

function generateText(block: Block) {
  if (!("type" in block)) {
    return;
  }

  switch (block.type) {
    case "heading_1": {
      return <div className="ml-1 my-1 hover:underline"><Text textList={block.heading_1.text}></Text></div>
    }
    case "heading_2": {
      return <div className="ml-4 my-1 hover:underline"><Text textList={block.heading_2.text}></Text></div>
    }
    case "heading_3": {
      return <div className="ml-8 my-1 hover:underline"><Text textList={block.heading_3.text}></Text></div>
    }
    default:
      break;
  }
}

const SmoothLink = ({ id, children }: {id: string, children: React.ReactNode}) => {
  return <a
      href={`#${id}`}
      onClick={(e) => {
        e.preventDefault();
        let target = document.getElementById(`${id}`)
        if (target) {
          target.scrollIntoView({
            behavior: "smooth"
          });
          //router.push(`#${block.id}`, undefined, { shallow: true })
        }
      }}
    >
      {children}
    </a>

}

const TableOfContents = ({ blocks }: { blocks: Block[] }) => {
  const router = useRouter()

  let items = blocks.filter(isHeader).map((block) => {
    if (!("type" in block)) {
      return;
    }

    return <SmoothLink id={block.id}>{generateText(block)}</SmoothLink>
  })

  return (
    <nav aria-label="Table of contents">
      <SmoothLink id="title"><div className="inline-block mb-5">Top</div></SmoothLink>
      {items}
      <Link href="/">
        <a className="inline-block mt-5">← Go home</a>
      </Link>
    </nav>
  )
}

export default TableOfContents
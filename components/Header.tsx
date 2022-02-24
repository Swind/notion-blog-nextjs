import React from 'react'

interface HeaderProp {
  title: string
}

export default function Header({ title }: HeaderProp) {

  return <header className=" bg-gray-900">
    <div className="py-4 pl-4">
      <h1 className="font-bold font-sans break-normal text-gray-200 text-3xl md:text-4xl">就只是一個筆記</h1>
    </div>
  </header>
}
import React from 'react'

import { highlight, languages } from 'prismjs'
import 'prismjs/components/prism-jsx'
import { CodeBlock } from '../pages/api/notion';

export default function Code({ code }: { code: CodeBlock }) {
  let languageL = code.language ? code.language.toLowerCase() : "javascript"
  let prismLanguage = languages[languageL] || languages.javascript

  let raw = code.text[0].plain_text

  return (
    <pre className={"language-" + languageL}>
      <div
        dangerouslySetInnerHTML={{
          __html: highlight(raw, prismLanguage, languageL)
        }}
      />
    </pre>
  )
}

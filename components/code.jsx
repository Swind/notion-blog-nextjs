import React from 'react'

import { highlight, languages } from 'prismjs'

import 'prismjs/components/prism-jsx'
import 'prismjs/themes/prism-tomorrow.css'

import styles from "./code.module.css"

export default function Code({ block }) {
  let languageL = block.language ? block.language.toLowerCase() : "javascript"
  let prismLanguage = languages[languageL] || languages.javascript
  let code = block.text[0].plain_text

  return (
    <pre className={"language-" + languageL}>
      <code
        dangerouslySetInnerHTML={{
          __html: highlight(code, prismLanguage, languageL)
        }}
      />
    </pre>
  )
}

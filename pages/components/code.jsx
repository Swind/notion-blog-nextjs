import React from 'react'

import { highlight, languages } from 'prismjs'

import 'prismjs/components/prism-jsx'

export default function Code({ block }) {
  let languageL = block.language.toLowerCase()
  let prismLanguage = languages[languageL] || languages.javascript
  let code = block.text[0].plain_text

  return (
    <pre className='notion-code'>
      <code
        className={`language-${languageL}`}
        dangerouslySetInnerHTML={{
          __html: highlight(code, prismLanguage, languageL)
        }}
      />
    </pre>
  )
}
import React from 'react'
import styles from "./bookmark.module.css"

export default function Bookmark({ block }) {
  let preview = block.preview;
  let image = preview.image ? preview.image : null;
  let favicon = preview.favicons.length > 0 ? preview.favicons[0] : null;
  return (
    <a href={block.url} className={styles.bookmark}>
      <div className={styles.bookmark_container}>
        <div className={styles.content}>
          <div className={styles.main}>
            <div className={styles.title}>
              {preview.title}
            </div>
            <div className={styles.description}>
              {preview.description}
            </div>
          </div>
          <div className={styles.link}>
            <div className={styles.favicon}>
              <img src={favicon} alt="favicon" />
            </div>
            <div className={styles.linkText}>
              {block.url}
            </div>
          </div>
        </div>
        <div className={styles.media}>
          {image ? <img src={image} alt={preview.title} /> : null}
        </div>
      </div>
    </a>
  )
}
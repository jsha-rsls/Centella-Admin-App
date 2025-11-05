import { useEffect, useImperativeHandle, forwardRef, useState, useMemo, useCallback, useRef } from "react"
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { Link } from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import Placeholder from '@tiptap/extension-placeholder'
import { Extension } from '@tiptap/core'
import { IoListOutline, IoList } from "react-icons/io5"
import styles from "../styles/RichTextEditor.module.css"

// FontSize extension definition moved outside component
const FontSize = Extension.create({
  name: 'fontSize',
  
  addOptions() {
    return {
      types: ['textStyle'],
    }
  },
  
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize || null,
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {}
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              }
            },
          },
        },
      },
    ]
  },
  
  addCommands() {
    return {
      setFontSize: fontSize => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize })
          .run()
      },
      unsetFontSize: () => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize: null })
          .removeEmptyTextStyle()
          .run()
      },
    }
  },
})

// Font size options moved outside component
const CONTENT_EDITOR_FONT_SIZES = [
  { value: 'default', label: 'Size' },
  { value: '10px', label: '10' },
  { value: '11px', label: '11' },
  { value: '12px', label: '12' },
  { value: '14px', label: '14' },
  { value: '16px', label: '16' },
  { value: '18px', label: '18' },
  { value: '20px', label: '20' },
  { value: '24px', label: '24' },
  { value: '28px', label: '28' },
  { value: '32px', label: '32' },
  { value: '36px', label: '36' },
  { value: '48px', label: '48' },
  { value: '72px', label: '72' },
]

const TITLE_EDITOR_FONT_SIZES = [
  { value: 'default', label: 'Size' },
  { value: '12px', label: 'Small (12px)' },
  { value: '14px', label: 'Normal (14px)' },
  { value: '16px', label: 'Medium (16px)' },
  { value: '20px', label: 'Large (20px)' },
  { value: '24px', label: 'X-Large (24px)' },
]

const HEADING_OPTIONS = [
  { value: 0, label: 'Normal' },
  { value: 1, label: 'Heading 1' },
  { value: 2, label: 'Heading 2' },
  { value: 3, label: 'Heading 3' },
]

const RichTextEditor = forwardRef(({ 
  value, 
  onChange, 
  onBlur,
  placeholder = "Enter text", 
  isContentEditor = false,
  error,
  maxLength = null // New prop for character limit
}, ref) => {
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')

  // Helper function to get plain text length
  const getPlainTextLength = useCallback((html) => {
    return html.replace(/<[^>]*>/g, '').trim().length
  }, [])

  // Store the last valid content when maxLength is enforced
  const lastValidContent = useRef(value || '')

  // Memoize editor configuration
  const editorConfig = useMemo(() => ({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'tiptap-link',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      FontSize,
      Placeholder.configure({
        placeholder: placeholder,
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      if (onChange) {
        const html = editor.getHTML()
        
        // Check character limit if maxLength is set
        if (maxLength) {
          const plainTextLength = getPlainTextLength(html)
          if (plainTextLength > maxLength) {
            // Revert to last valid content
            editor.commands.setContent(lastValidContent.current, false)
            return
          }
          // Store as last valid content
          lastValidContent.current = html
        }
        
        onChange(html)
      }
    },
    onBlur: () => {
      if (onBlur) {
        onBlur()
      }
    },
    editorProps: {
      attributes: {
        class: `${styles.richTextEditor} ${isContentEditor ? styles.contentEditor : ''}`,
      },
    },
  }), [onChange, onBlur, placeholder, isContentEditor, value, maxLength, getPlainTextLength])
  
  const editor = useEditor(editorConfig)

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    focus: () => editor?.commands.focus(),
    getContent: () => editor?.getHTML() || "",
    setContent: (content) => {
      editor?.commands.setContent(content)
    },
    clear: () => {
      editor?.commands.clearContent()
    }
  }), [editor])

  // Update content when value prop changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '')
    }
  }, [value, editor])

  // Memoize event handlers
  const handleShowLinkModal = useCallback(() => {
    setShowLinkModal(true)
  }, [])

  const handleInsertLink = useCallback(() => {
    if (linkUrl) {
      editor?.chain().focus().setLink({ href: linkUrl }).run()
      setShowLinkModal(false)
      setLinkUrl('')
    }
  }, [editor, linkUrl])

  const handleCancelLink = useCallback(() => {
    setShowLinkModal(false)
    setLinkUrl('')
  }, [])

  const handleRemoveLink = useCallback(() => {
    editor?.chain().focus().unsetLink().run()
  }, [editor])

  const handleFontSizeChange = useCallback((e) => {
    const size = e.target.value
    if (size === 'default') {
      editor?.chain().focus().unsetFontSize().run()
    } else {
      editor?.chain().focus().setFontSize(size).run()
    }
  }, [editor])

  const handleHeadingChange = useCallback((e) => {
    const level = parseInt(e.target.value)
    if (level === 0) {
      editor?.chain().focus().setParagraph().run()
    } else {
      editor?.chain().focus().toggleHeading({ level }).run()
    }
  }, [editor])

  const handleLinkInputChange = useCallback((e) => {
    setLinkUrl(e.target.value)
  }, [])

  const handleLinkInputKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleInsertLink()
    } else if (e.key === 'Escape') {
      handleCancelLink()
    }
  }, [handleInsertLink, handleCancelLink])

  // Memoize toolbar button handlers
  const toggleBold = useCallback(() => {
    editor?.chain().focus().toggleBold().run()
  }, [editor])

  const toggleItalic = useCallback(() => {
    editor?.chain().focus().toggleItalic().run()
  }, [editor])

  const toggleUnderline = useCallback(() => {
    editor?.chain().focus().toggleUnderline().run()
  }, [editor])

  const toggleBulletList = useCallback(() => {
    editor?.chain().focus().toggleBulletList().run()
  }, [editor])

  const toggleOrderedList = useCallback(() => {
    editor?.chain().focus().toggleOrderedList().run()
  }, [editor])

  const setAlignLeft = useCallback(() => {
    editor?.chain().focus().setTextAlign('left').run()
  }, [editor])

  const setAlignCenter = useCallback(() => {
    editor?.chain().focus().setTextAlign('center').run()
  }, [editor])

  const setAlignRight = useCallback(() => {
    editor?.chain().focus().setTextAlign('right').run()
  }, [editor])

  // Memoize active heading value
  const activeHeadingValue = useMemo(() => {
    if (!editor) return 0
    if (editor.isActive('heading', { level: 1 })) return 1
    if (editor.isActive('heading', { level: 2 })) return 2
    if (editor.isActive('heading', { level: 3 })) return 3
    return 0
  }, [editor?.isActive('heading')])

  // Memoize font size options
  const fontSizeOptions = useMemo(() => {
    const sizes = isContentEditor ? CONTENT_EDITOR_FONT_SIZES : TITLE_EDITOR_FONT_SIZES
    return sizes.map(size => (
      <option key={size.value} value={size.value}>
        {size.label}
      </option>
    ))
  }, [isContentEditor])

  // Memoize heading options
  const headingOptions = useMemo(() => (
    HEADING_OPTIONS.map(heading => (
      <option key={heading.value} value={heading.value}>
        {heading.label}
      </option>
    ))
  ), [])

  if (!editor) {
    return null
  }

  return (
    <div className={styles.richTextContainer}>
      <div className={styles.toolbar}>
        {/* Text Formatting */}
        <button
          type="button"
          onClick={toggleBold}
          className={`${styles.toolbarButton} ${editor.isActive('bold') ? styles.isActive : ''}`}
          title="Bold (Ctrl+B)"
        >
          <strong style={{ fontSize: "12px" }}>B</strong>
        </button>
        
        <button
          type="button"
          onClick={toggleItalic}
          className={`${styles.toolbarButton} ${editor.isActive('italic') ? styles.isActive : ''}`}
          title="Italic (Ctrl+I)"
        >
          <em style={{ fontSize: "12px" }}>I</em>
        </button>

        {isContentEditor && (
          <>
            <button
              type="button"
              onClick={toggleUnderline}
              className={`${styles.toolbarButton} ${editor.isActive('underline') ? styles.isActive : ''}`}
              title="Underline (Ctrl+U)"
            >
              <span style={{ fontSize: "12px", textDecoration: "underline" }}>U</span>
            </button>

            <div className={styles.divider} />

            {/* Font Size Selector */}
            <select
              onChange={handleFontSizeChange}
              className={styles.fontSizeSelect}
              defaultValue="default"
            >
              {fontSizeOptions}
            </select>

            {/* Headings */}
            <select
              onChange={handleHeadingChange}
              className={styles.fontSizeSelect}
              value={activeHeadingValue}
            >
              {headingOptions}
            </select>

            <div className={styles.divider} />

            {/* Lists */}
            <button
              type="button"
              onClick={toggleBulletList}
              className={`${styles.toolbarButton} ${editor.isActive('bulletList') ? styles.isActive : ''}`}
              title="Bullet List"
            >
              <IoListOutline size={14} />
            </button>

            <button
              type="button"
              onClick={toggleOrderedList}
              className={`${styles.toolbarButton} ${editor.isActive('orderedList') ? styles.isActive : ''}`}
              title="Numbered List"
            >
              <IoList size={14} />
            </button>

            <div className={styles.divider} />

            {/* Link */}
            {editor.isActive('link') ? (
              <button
                type="button"
                onClick={handleRemoveLink}
                className={`${styles.toolbarButton} ${styles.isActive}`}
                title="Remove Link"
              >
                🔗✕
              </button>
            ) : (
              <button
                type="button"
                onClick={handleShowLinkModal}
                className={styles.toolbarButton}
                title="Add Link"
              >
                🔗
              </button>
            )}

            <div className={styles.divider} />

            {/* Text Alignment */}
            <button
              type="button"
              onClick={setAlignLeft}
              className={`${styles.toolbarButton} ${editor.isActive({ textAlign: 'left' }) ? styles.isActive : ''}`}
              title="Align Left"
            >
              ⬅
            </button>

            <button
              type="button"
              onClick={setAlignCenter}
              className={`${styles.toolbarButton} ${editor.isActive({ textAlign: 'center' }) ? styles.isActive : ''}`}
              title="Align Center"
            >
              ↔
            </button>

            <button
              type="button"
              onClick={setAlignRight}
              className={`${styles.toolbarButton} ${editor.isActive({ textAlign: 'right' }) ? styles.isActive : ''}`}
              title="Align Right"
            >
              ➡
            </button>
          </>
        )}

        {!isContentEditor && (
          <select
            onChange={handleFontSizeChange}
            className={styles.fontSizeSelect}
            defaultValue="default"
          >
            {fontSizeOptions}
          </select>
        )}
      </div>

      <EditorContent editor={editor} />

      {/* Link Modal */}
      {showLinkModal && (
        <div className={styles.linkModalOverlay}>
          <div className={styles.linkModal}>
            <h3 className={styles.linkModalTitle}>Insert Link</h3>
            <input
              type="url"
              value={linkUrl}
              onChange={handleLinkInputChange}
              placeholder="https://example.com"
              className={styles.linkInput}
              autoFocus
              onKeyDown={handleLinkInputKeyDown}
            />
            <div className={styles.linkModalButtons}>
              <button
                type="button"
                onClick={handleCancelLink}
                className={styles.linkCancelButton}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertLink}
                className={styles.linkInsertButton}
                disabled={!linkUrl}
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <span className={styles.error}>
          {error}
        </span>
      )}
    </div>
  )
})

RichTextEditor.displayName = "RichTextEditor"

export default RichTextEditor
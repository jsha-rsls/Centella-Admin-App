import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks while preserving safe formatting
 * @param {string} html - Raw HTML string from rich text editor
 * @returns {string} - Sanitized HTML string
 */
export const sanitizeHTML = (html) => {
  if (!html) return '';

  // Configure DOMPurify with allowed tags and attributes
  const config = {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'pre', 'code',
      'a', 'img', 'span', 'div',
      'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'src', 'alt', 'title',
      'class', 'style', 'width', 'height'
    ],
    ALLOWED_STYLES: {
      '*': {
        'color': [/^rgb\(\d+,\s*\d+,\s*\d+\)$/],
        'background-color': [/^rgb\(\d+,\s*\d+,\s*\d+\)$/],
        'font-size': [/^\d+(?:px|em|rem|%)$/],
        'font-weight': [/^(?:normal|bold|\d{3})$/],
        'text-align': [/^(?:left|center|right|justify)$/],
        'margin': [/^\d+(?:px|em|rem)$/],
        'padding': [/^\d+(?:px|em|rem)$/]
      }
    },
    ALLOW_DATA_ATTR: false,
    KEEP_CONTENT: true
  };

  return DOMPurify.sanitize(html, config);
};

/**
 * Extracts plain text from HTML content
 * @param {string} html - HTML string
 * @param {number} maxLength - Maximum length of text to extract (optional)
 * @returns {string} - Plain text without HTML tags
 */
export const extractPlainText = (html, maxLength = null) => {
  if (!html) return '';

  // Create a temporary DOM element to properly parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = DOMPurify.sanitize(html);
  
  // Get the text content (this properly handles all HTML entities and tags)
  const text = tempDiv.textContent || tempDiv.innerText || '';

  // Remove extra whitespace and normalize
  const cleaned = text.replace(/\s+/g, ' ').trim();

  // Truncate if maxLength is specified
  if (maxLength && cleaned.length > maxLength) {
    return cleaned.substring(0, maxLength).trim() + '...';
  }

  return cleaned;
};

/**
 * Converts rich text HTML to a preview format suitable for cards/lists
 * @param {string} html - Raw HTML from rich text editor
 * @param {number} maxLength - Maximum character length for preview
 * @returns {string} - Sanitized and truncated preview text
 */
export const createPreview = (html, maxLength = 150) => {
  const plainText = extractPlainText(html, maxLength);
  return plainText;
};

/**
 * Checks if HTML content is empty or contains only whitespace/empty tags
 * @param {string} html - HTML string to check
 * @returns {boolean} - True if content is empty
 */
export const isEmptyHTML = (html) => {
  if (!html) return true;
  
  const plainText = extractPlainText(html);
  return plainText.length === 0;
};

/**
 * Sanitizes and renders HTML safely in React components
 * Use with dangerouslySetInnerHTML
 * @param {string} html - HTML content to render
 * @returns {object} - Object with __html property for React
 */
export const createMarkup = (html) => {
  return {
    __html: sanitizeHTML(html)
  };
};
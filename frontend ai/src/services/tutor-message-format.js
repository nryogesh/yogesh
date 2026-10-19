function parseInline(text) {
  const parts = []
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g
  let previousIndex = 0

  for (const match of text.matchAll(pattern)) {
    if (match.index > previousIndex) {
      parts.push({ type: 'text', text: text.slice(previousIndex, match.index) })
    }

    const token = match[0]
    if (token.startsWith('`')) {
      parts.push({ type: 'inline-code', text: token.slice(1, -1) })
    } else if (token.startsWith('**')) {
      parts.push({ type: 'bold', text: token.slice(2, -2) })
    } else {
      parts.push({ type: 'italic', text: token.slice(1, -1) })
    }
    previousIndex = match.index + token.length
  }

  if (previousIndex < text.length) {
    parts.push({ type: 'text', text: text.slice(previousIndex) })
  }

  return parts
}

export function parseTutorMessage(content) {
  const lines = String(content || '').replace(/\r\n?/g, '\n').split('\n')
  const blocks = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]
    if (!line.trim()) {
      index += 1
      continue
    }

    if (/^\s*```/.test(line)) {
      const codeLines = []
      index += 1
      while (index < lines.length && !/^\s*```/.test(lines[index])) {
        codeLines.push(lines[index])
        index += 1
      }
      if (index < lines.length) index += 1
      blocks.push({ type: 'code', text: codeLines.join('\n') })
      continue
    }

    const heading = line.match(/^\s{0,3}(#{1,3})\s+(.+)$/)
    if (heading) {
      blocks.push({ type: 'heading', level: heading[1].length, parts: parseInline(heading[2]) })
      index += 1
      continue
    }

    const listItem = line.match(/^\s*(?:[-*+]\s+|\d+[.)]\s+)(.*)$/)
    if (listItem) {
      const ordered = /^\s*\d+[.)]\s+/.test(line)
      const items = []
      while (index < lines.length) {
        const item = lines[index].match(/^\s*(?:[-*+]\s+|\d+[.)]\s+)(.*)$/)
        if (!item || ordered !== /^\s*\d+[.)]\s+/.test(lines[index])) break
        items.push(parseInline(item[1]))
        index += 1
      }
      blocks.push({ type: ordered ? 'ordered-list' : 'unordered-list', items })
      continue
    }

    const paragraph = [line.trim()]
    index += 1
    while (index < lines.length && lines[index].trim() &&
      !/^\s*```/.test(lines[index]) &&
      !/^\s{0,3}#{1,3}\s+/.test(lines[index]) &&
      !/^\s*(?:[-*+]\s+|\d+[.)]\s+)/.test(lines[index])) {
      paragraph.push(lines[index].trim())
      index += 1
    }
    blocks.push({ type: 'paragraph', lines: paragraph.map(parseInline) })
  }

  return blocks
}

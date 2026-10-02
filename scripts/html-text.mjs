// Decode escaped heading text for assertions; do not interpret or execute HTML.
export function htmlText(value) {
  const named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }
  return value.replace(
    /&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi,
    (match, entity) => {
      if (entity[0] !== '#') return named[entity.toLowerCase()] ?? match
      const code =
        entity[1].toLowerCase() === 'x'
          ? Number.parseInt(entity.slice(2), 16)
          : Number.parseInt(entity.slice(1), 10)
      return code <= 0x10ffff ? String.fromCodePoint(code) : match
    },
  )
}

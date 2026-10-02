import quotes from '@/content/quotes.json'

// Display labels come directly from the dated interview, including capitalization.
// These quotations describe the products; capability checks come from the data service.
function product(name: string, href: string, quoteId: string) {
  const quote = quotes.find((item) => item.id === quoteId)
  if (!quote) throw new Error(`Missing product definition: ${quoteId}`)
  return {
    name,
    href,
    quoteId,
    description: quote.text.replace(`${name} - `, ''),
  }
}

export const products = {
  forge: product('Forge', '/forge', 'jah-18'),
  media: product('Media', '/media', 'jah-19'),
  realm: product('Realm', '/realm', 'jah-20'),
  ark: product('Ark', '/p/ark', 'jah-21'),
}

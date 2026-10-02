import { displayText } from '../lib/display-text'
import slots from './copy-slots.json'
import quotes from './quotes.json'

export function siteCopy(id: string) {
  const slot = slots.find((item) => item.id === id)
  const quote = quotes.find((item) => item.id === slot?.quote_id)
  if (!quote) throw new Error(`Missing sourced site copy: ${id}`)
  return displayText(quote.text)
}

export interface ParsedOrderLine {
  index: number;
  quantity: number;
  nameRaw: string;
  linePrice: number | null;
  unitPrice: number | null;
  customNote?: string;
}

export interface ParsedOrder {
  orderNumber?: string;
  lines: ParsedOrderLine[];
  total: number | null;
  customerPhone?: string;
  customerAddress?: string;
  cep?: string;
  notes: string[];
}

const ITEM_RE = /^(\d{1,2})\s*[x×]\s+(.+?)\s*[-–—]?\s*R\$\s*(\d+(?:[.,]\d{1,2})?)(.*)$/i;
const ITEM_NO_PRICE_RE = /^(\d{1,2})\s*[x×]\s+(.{3,})$/i;
const PERSONALIZATION_RE = /^[ \t]*(?:✏️|✍️|personaliza[çc]ã?o)[^:：]*[:：]?\s*(.+)$/i;
const REFERENCES_RE = /^[ \t]*(?:🖼️|refer[êe]nci[ae]s?)[^:：]*[:：]?\s*(.+)$/i;
const TOTAL_RE = /^(?:💰[ \t]*)?(?:total[^R$]{0,16}[:：]?[ \t]*)?R\$\s*(\d+(?:[.,]\d{1,2})?)/i;
const PEDIDO_RE = /pedido[ \t]*#\s*([a-z0-9]{6,20})/i;
const PHONE_RE = /((?:\+?55[ \t]*)?\(?\d{2}\)?[ \t]*\d{4,5}[ \t-]?\d{4})/;
const CEP_RE = /\b(\d{5}-?\d{3})\b/;
const ADDRESS_KEYWORDS_RE =
  /\b(rua|r\.|av\.|avenida|alameda|estrada|rodovia|travessa|beco|vila|lote|quadra|loteamento|conjunto|residencial)\b/i;

export function parsePrice(raw: string): number {
  const value = raw.trim();
  if (!value) return NaN;
  let normalized = value;
  if (normalized.includes(",")) {
    normalized = normalized.replace(/\./g, "").replace(",", ".");
  } else if (/^\d+\.\d{2}$/.test(normalized)) {
    normalized = normalized;
  } else {
    normalized = normalized.replace(/,/g, "");
  }
  return Number(normalized);
}

function stripFormatting(line: string): string {
  return line.replace(/[*_`~]/g, "").trim();
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function parseWhatsAppOrder(text: string): ParsedOrder {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const result: ParsedOrder = {
    lines: [],
    total: null,
    notes: [],
  };

  let lastIndex = -1;
  let lineIndex = 0;

  for (const rawLine of lines) {
    const line = stripFormatting(rawLine);
    if (!line) continue;

    const item = line.match(ITEM_RE);
    if (item) {
      const quantity = Number(item[1]);
      const nameRaw = item[2].trim();
      const linePrice = parsePrice(item[3]);
      const index = result.lines.length;
      result.lines.push({
        index,
        quantity,
        nameRaw,
        linePrice,
        unitPrice: quantity > 0 && Number.isFinite(linePrice) ? round2(linePrice / quantity) : null,
      });
      lastIndex = index;
      lineIndex++;
      continue;
    }

    const personalization = line.match(PERSONALIZATION_RE);
    if (personalization && lastIndex >= 0) {
      result.lines[lastIndex].customNote = personalization[1].trim();
      continue;
    }

    const references = line.match(REFERENCES_RE);
    if (references && lastIndex >= 0) {
      const existing = result.lines[lastIndex].customNote ?? "";
      result.lines[lastIndex].customNote =
        existing ? `${existing} | ${references[1].trim()}` : `Referências: ${references[1].trim()}`;
      continue;
    }

    const total = line.match(TOTAL_RE);
    if (total && lastIndex >= 0) {
      result.total = parsePrice(total[1]);
      continue;
    }

    const pedido = line.match(PEDIDO_RE);
    if (pedido) {
      result.orderNumber = pedido[1];
      continue;
    }

    const phone = line.match(PHONE_RE);
    if (phone) {
      const matched = phone[1].replace(/\D/g, "");
      const full =
        matched.startsWith("55") && matched.length >= 12
          ? matched
          : matched.length === 10 || matched.length === 11
            ? `55${matched}`
            : matched;
      if (!result.customerPhone) {
        result.customerPhone = full;
        continue;
      }
    }

    const cep = line.match(CEP_RE);
    if (cep) {
      result.cep = cep[1].replace("-", "");
      if (ADDRESS_KEYWORDS_RE.test(line)) {
        result.customerAddress = line;
        if (!result.customerPhone && line !== cep[0]) result.notes.push(line);
        continue;
      }
      continue;
    }

    if (ADDRESS_KEYWORDS_RE.test(line) && line.length > 6) {
      result.customerAddress = line;
      continue;
    }

    const noPrice = line.match(ITEM_NO_PRICE_RE);
    if (noPrice) {
      const quantity = Number(noPrice[1]);
      const index = result.lines.length;
      result.lines.push({ index, quantity, nameRaw: noPrice[2].trim(), linePrice: null, unitPrice: null });
      lastIndex = index;
      lineIndex++;
      continue;
    }

    result.notes.push(line);
  }

  if (result.total === null && result.lines.length === 1) {
    const [only] = result.lines;
    if (only.linePrice !== null) result.total = only.linePrice;
  }

  return result;
}
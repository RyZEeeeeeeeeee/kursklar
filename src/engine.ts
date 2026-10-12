export const eur = (c: number) => (c / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
export const cents = (v: number) => Math.round(v * 100);
export type Tick = { last: number; bid: number; ask: number; time: string; volume: number };
export type Kind = 'Market' | 'Limit' | 'Stop' | 'Stop-Limit';
export type Order = { id: string; side: 'buy' | 'sell'; kind: Kind; qty: number; limit: number; stop: number; expires: number; status: 'offen' | 'ausgelöst' | 'ausgeführt' | 'storniert' | 'abgelaufen'; reserve: number; price?: number; note: string };
export type Trade = { id: string; side: 'buy' | 'sell'; qty: number; price: number; fee: number; basis: number; realized: number; time: string };
export type Portfolio = { cash: number; qty: number; basis: number; realized: number; fees: number; orders: Order[]; trades: Trade[] };
export const fresh = (): Portfolio => ({ cash: 1000000, qty: 0, basis: 0, realized: 0, fees: 0, orders: [], trades: [] });
export const FEE = 100;
export const active = (o: Order) => o.status === 'offen' || o.status === 'ausgelöst';
export const availableCash = (p: Portfolio) => p.cash - p.orders.filter(o => active(o) && o.side === 'buy').reduce((s, o) => s + o.reserve, 0);
export const availableQty = (p: Portfolio) => p.qty - p.orders.filter(o => active(o) && o.side === 'sell').reduce((s, o) => s + o.qty, 0);
export function place(p: Portfolio, o: Order, tick: Tick): Portfolio {
  if (!Number.isSafeInteger(o.qty) || o.qty < 1 || o.qty > 100000) throw Error('Bitte eine ganze Stückzahl zwischen 1 und 100.000 eingeben.');
  if (!Number.isSafeInteger(o.expires) || o.expires < 0) throw Error('Ungültige Ordergültigkeit.');
  for (const [required, value] of [[o.kind.includes('Limit'), o.limit], [o.kind.includes('Stop'), o.stop]] as const) if (required && (!Number.isSafeInteger(value) || value <= 0)) throw Error('Limit und Stop müssen positive Eurobeträge sein.');
  if (p.orders.some(x => x.id === o.id)) throw Error('Diese Order existiert bereits.');
  // Unbegrenzte Käufe reservieren einen Modellpuffer von 20 %; bei höheren Preisen wird vor Ausführung erneut geprüft.
  const reserve = o.side === 'buy' ? o.qty * (o.kind.includes('Limit') ? o.limit : Math.ceil(Math.max(tick.ask, o.stop) * 1.2)) + FEE : 0;
  if (o.side === 'buy' && reserve > availableCash(p)) throw Error('Nicht genug verfügbares Guthaben (einschließlich Gebühr und 20-%-Puffer bei unlimitierten Käufen).');
  if (o.side === 'sell' && o.qty > availableQty(p)) throw Error('Nicht genug verfügbarer Bestand. Offene Verkaufsorders reservieren Stücke.');
  return { ...p, orders: [...p.orders, { ...o, reserve, status: 'offen', note: 'Order angenommen; wartet auf den nächsten handelbaren Tick.' }] };
}
export function cancel(p: Portfolio, id: string): Portfolio { return { ...p, orders: p.orders.map(o => o.id === id && active(o) ? { ...o, status: 'storniert', note: 'Storniert. Die Reservierung wurde freigegeben.' } : o) }; }
export function advance(input: Portfolio, tick: Tick, step: number): Portfolio {
  const p: Portfolio = structuredClone(input);
  for (const o of p.orders) {
    if (!active(o)) continue;
    if (step > o.expires) { o.status = 'abgelaufen'; o.note = 'Gültigkeit beendet; Reservierung freigegeben.'; continue; }
    if (o.kind.includes('Stop') && o.status === 'offen') {
      if (!(o.side === 'buy' ? tick.last >= o.stop : tick.last <= o.stop)) continue;
      o.status = 'ausgelöst'; o.note = 'Letzter gehandelter Kurs hat den Stop erreicht. Auslösen bedeutet noch keine Ausführung.';
      // Ein eigener nächster Tick macht Trigger und Ausführung sichtbar und lässt Kurslücken zu.
      continue;
    }
    const price = o.side === 'buy' ? tick.ask : tick.bid;
    if (o.kind.includes('Limit') && !(o.side === 'buy' ? price <= o.limit : price >= o.limit)) continue;
    const otherReserved = p.orders.filter(x => x.id !== o.id && active(x) && x.side === 'buy').reduce((s, x) => s + x.reserve, 0);
    if (o.side === 'buy' && o.qty * price + FEE > p.cash - otherReserved) { o.status = 'storniert'; o.note = 'Ausführung abgelehnt: Kurs übersteigt verfügbares Guthaben. Kein negativer Kontostand.'; continue; }
    if (o.side === 'sell' && o.qty > p.qty) { o.status = 'storniert'; o.note = 'Ausführung abgelehnt: Bestand fehlt.'; continue; }
    const basis = o.side === 'sell' ? (o.qty === p.qty ? p.basis : Math.round(p.basis * o.qty / p.qty)) : o.qty * price + FEE;
    const realized = o.side === 'sell' ? o.qty * price - FEE - basis : 0;
    p.cash += o.side === 'buy' ? -basis : o.qty * price - FEE;
    p.qty += o.side === 'buy' ? o.qty : -o.qty;
    p.basis += o.side === 'buy' ? basis : -basis;
    p.realized += realized; p.fees += FEE;
    o.status = 'ausgeführt'; o.price = price;
    o.note = `${o.side === 'buy' ? 'Kauf zum Ask' : 'Verkauf zum Bid'} ${eur(price)}; ${eur(FEE)} Gebühr. ${o.kind.includes('Stop') ? 'Stop ist ein Auslöser, keine Preisgarantie.' : o.kind === 'Limit' ? 'Das Limit wurde eingehalten.' : 'Der aktuelle handelbare Preis zählt.'}`;
    p.trades.push({ id: o.id, side: o.side, qty: o.qty, price, fee: FEE, basis, realized, time: tick.time });
  }
  return p;
}
export const scenarios = [
  { name: 'Sofort kaufen', values: [100, 101, 102, 101, 103, 102, 104, 103, 105], side: 'buy', kind: 'Market', limit: 98, stop: 96 },
  { name: 'Kauflimit abwarten', values: [100, 101, 99, 98, 97, 96, 98, 99, 100], side: 'buy', kind: 'Limit', limit: 98, stop: 96 },
  { name: 'Verkaufslimit', values: [100, 101, 103, 104, 105, 106, 103, 102, 101], side: 'sell', kind: 'Limit', limit: 104, stop: 96 },
  { name: 'Stop-Loss', values: [100, 99, 98, 96, 95, 94, 95, 93, 92], side: 'sell', kind: 'Stop', limit: 95, stop: 96 },
  { name: 'Kurslücke am Stop', values: [100, 99, 98, 90, 88, 89, 90, 91, 89], side: 'sell', kind: 'Stop', limit: 95, stop: 96 },
  { name: 'Stop-Limit bleibt offen', values: [100, 99, 98, 90, 88, 89, 90, 91, 89], side: 'sell', kind: 'Stop-Limit', limit: 95, stop: 96 },
  { name: 'Seitwärts & Kosten', values: [100, 100.1, 99.9, 100, 100.1, 99.9, 100, 100.1, 100], side: 'buy', kind: 'Market', limit: 98, stop: 96 },
] as const;
export const ticks = (values: readonly number[]): Tick[] => values.map((v, i) => ({ last: cents(v), bid: cents(v) - 10, ask: cents(v) + 10, time: `09:${String(i).padStart(2, '0')}`, volume: 30 + ((i * 37) % 90) }));
export const candleTicks: Tick[] = Array.from({ length: 120 }, (_, i) => { const price = cents(100 + i * .025 + Math.sin(i * .33) * 1.6 + Math.cos(i * .81) * .7); return { last: price, bid: price - 10, ask: price + 10, time: `${String(9 + Math.floor(i / 60)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}`, volume: 20 + i * 17 % 100 }; });
export function candles(series: Tick[], interval: number) { return Array.from({ length: Math.ceil(series.length / interval) }, (_, i) => { const t = series.slice(i * interval, (i + 1) * interval); return { open: t[0].last, high: Math.max(...t.map(x => x.last)), low: Math.min(...t.map(x => x.last)), close: t[t.length - 1].last, time: t[0].time, volume: t.reduce((s, x) => s + x.volume, 0), complete: t.length === interval }; }); }
export function projection(start: number, monthly: number, years: number, rate: number, cost: number, inflation: number, volatile: boolean) {
  let value = start; let paid = start; const rows = [{ year: 0, value, paid, real: value }];
  for (let m = 1; m <= years * 12; m++) {
    const r = Math.pow(1 + rate / 100, 1 / 12) * Math.pow(1 - cost / 100, 1 / 12) - 1;
    const shock = volatile ? Math.sin(m * 1.79) * .028 + (m % 60 === 0 ? -.24 : .003) : 0;
    value = Math.round((value * (1 + r + shock) + monthly) * 100) / 100; paid += monthly;
    if (m % 12 === 0) rows.push({ year: m / 12, value, paid, real: value / Math.pow(1 + inflation / 100, m / 12) });
  }
  return rows;
}


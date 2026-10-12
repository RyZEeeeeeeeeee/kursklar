import { z } from 'zod';
import { fresh, active, type Portfolio } from './engine';
import { lessons } from './content';
import { validDate } from './calendar';
import { checkPosition } from './positions';
import { savingSchema } from './savings';
const integer = z.number().int().safe();
const nonnegative = integer.nonnegative();
const order = z.object({ id: z.string().min(1), side: z.enum(['buy', 'sell']), kind: z.enum(['Market', 'Limit', 'Stop', 'Stop-Limit']), qty: integer.positive().max(100000), limit: nonnegative, stop: nonnegative, expires: nonnegative, status: z.enum(['offen', 'ausgelöst', 'ausgeführt', 'storniert', 'abgelaufen']), reserve: nonnegative, price: integer.positive().optional(), note: z.string().max(2000) });
const trade = z.object({ id: z.string(), side: z.enum(['buy', 'sell']), qty: integer.positive(), price: integer.positive(), fee: nonnegative, basis: nonnegative, realized: integer, time: z.string() });
const calendarEntry = z.object({ id:z.string().min(1), date:z.string().refine(validDate), kind:z.enum(['trade','day']), symbol:z.string().max(100), time:z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/), direction:z.enum(['Kauf','Verkauf']), gross:integer.min(-100000000).max(100000000), fees:nonnegative.max(100000000), note:z.string().max(10000) });
const positionSchema=z.object({id:z.string().min(1),symbol:z.string().max(100),qty:z.number().positive().max(1000000),buyDate:z.string(),buyTime:z.string(),buyPrice:integer.positive().max(100000000),buyFee:nonnegative.max(100000000),buyCash:nonnegative.max(10000000000).optional(),note:z.string().max(10000),sale:z.object({date:z.string(),time:z.string(),price:integer.positive().max(100000000),fee:nonnegative.max(100000000),cash:nonnegative.max(10000000000).optional()}).optional()});
const schema = z.object({ version: z.literal(1), savings:z.array(savingSchema).max(1000).default([]), positions:z.array(positionSchema).max(10000).default([]), calendar:z.array(calendarEntry).max(10000).default([]), done: z.array(z.string()).max(100), portfolio: z.object({ cash: nonnegative, qty: nonnegative, basis: nonnegative, realized: integer, fees: nonnegative, orders: z.array(order).max(5000), trades: z.array(trade).max(5000) }), journal: z.array(z.object({ id: z.string(), date: z.string(), fields: z.array(z.string().max(10000)).length(8) })).max(1000), research: z.array(z.boolean()).length(8), thesis: z.array(z.string().max(10000)).length(4), market: z.object({ scenario: integer.min(0).max(6), step: integer.min(0).max(8) }) });
export type State = z.infer<typeof schema>;
export const initial = (): State => ({ version: 1, savings:[], positions:[], calendar:[], done: [], portfolio: fresh(), journal: [], research: Array(8).fill(false), thesis: ['', '', '', ''], market: { scenario: 0, step: 0 } });
export function validate(raw: unknown): State {
  const s = schema.parse(raw);
  if(new Set(s.savings.map(p=>p.id)).size!==s.savings.length||s.savings.some(p=>new Set(p.buys.map(b=>b.id)).size!==p.buys.length))throw Error('Doppelte ETF-Einträge.');
  if(new Set(s.positions.map(p=>p.id)).size!==s.positions.length)throw Error('Doppelte Positionen.');
  for(const p of s.positions){checkPosition(p);if(p.sale&&s.calendar.some(e=>e.kind==='day'&&e.date===p.sale!.date))throw Error('Doppelt gezählter Verkaufstag.');}
  if(new Set(s.calendar.map(e=>e.id)).size!==s.calendar.length)throw Error('Doppelte Kalendereinträge.');
  for(const e of s.calendar){if(e.kind==='trade'&&!e.symbol.trim())throw Error('Trade ohne Namen.');if(e.kind==='day'&&(e.fees!==0||s.calendar.some(other=>other.id!==e.id&&other.date===e.date)))throw Error('Doppelt gezähltes Tagesergebnis.');}
  if (s.done.some(id => !lessons.some(l => l.id === id)) || new Set(s.done).size !== s.done.length) throw Error('Ungültige Lektionen.');
  const p = s.portfolio as Portfolio;
  if (new Set(p.orders.map(o => o.id)).size !== p.orders.length || new Set(p.trades.map(t => t.id)).size !== p.trades.length) throw Error('Doppelte Order oder Ausführung.');
  let cash = 1000000, qty = 0, basis = 0, realized = 0, fees = 0;
  for (const t of p.trades) {
    const o = p.orders.find(x => x.id === t.id);
    if (!o || o.status !== 'ausgeführt' || o.qty !== t.qty || o.side !== t.side || o.price !== t.price || t.fee !== 100) throw Error('Inkonsistente Orderabrechnung.');
    const b = t.side === 'buy' ? t.qty * t.price + t.fee : t.qty === qty ? basis : Math.round(basis * t.qty / qty);
    const r = t.side === 'sell' ? t.qty * t.price - t.fee - b : 0;
    if (b !== t.basis || r !== t.realized || (t.side === 'sell' && t.qty > qty)) throw Error('Ungültige Kostenbasis.');
    cash += t.side === 'buy' ? -b : t.qty * t.price - t.fee; qty += t.side === 'buy' ? t.qty : -t.qty; basis += t.side === 'buy' ? b : -b; realized += r; fees += t.fee;
    if (cash < 0) throw Error('Negatives Guthaben in der Historie.');
  }
  if (cash !== p.cash || qty !== p.qty || basis !== p.basis || realized !== p.realized || fees !== p.fees || p.orders.filter(o => o.status === 'ausgeführt').length !== p.trades.length) throw Error('Depot und Historie stimmen nicht überein.');
  if (p.orders.filter(o => active(o) && o.side === 'buy').reduce((n, o) => n + o.reserve, 0) > p.cash || p.orders.filter(o => active(o) && o.side === 'sell').reduce((n, o) => n + o.qty, 0) > p.qty) throw Error('Reservierungen überschreiten Guthaben oder Bestand.');
  for (const o of p.orders) {
    if ((o.kind.includes('Limit') && o.limit <= 0) || (o.kind.includes('Stop') && o.stop <= 0)) throw Error('Ungültige Preisbedingung.');
    if (active(o) && o.side === 'buy' && o.reserve < o.qty * (o.kind.includes('Limit') ? o.limit : 1) + 100) throw Error('Unzureichende Reservierung.');
  }
  return s;
}
export const KEY = 'kursklar.v1';
export function read(): { state: State; warning: string } {
  try { const raw = localStorage.getItem(KEY); return { state: raw ? validate(JSON.parse(raw)) : initial(), warning: '' }; }
  catch { return { state: initial(), warning: 'Die lokalen Daten konnten nicht gelesen werden. Es wurde ein neuer Stand geladen. Ein vorhandener Export kann importiert werden.' }; }
}




export type CalendarEntry = { id: string; date: string; kind: 'trade' | 'day'; symbol: string; time: string; direction: 'Kauf' | 'Verkauf'; gross: number; fees: number; note: string };
export const dateKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
export const berlinToday = () => new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Berlin',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export function validDate(s: string) { if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false; const [y,m,d]=s.split('-').map(Number);return y>=1900&&y<=2100&&dateKey(new Date(y,m-1,d,12))===s; }
export const net = (e: CalendarEntry) => e.gross-e.fees;
export function totals(entries: CalendarEntry[]) { return { gross:entries.reduce((s,e)=>s+e.gross,0),fees:entries.reduce((s,e)=>s+e.fees,0),net:entries.reduce((s,e)=>s+net(e),0),trades:entries.filter(e=>e.kind==='trade').length,days:new Set(entries.map(e=>e.date)).size }; }
export function monthCells(year:number,month:number) { const first=new Date(year,month,1,12); const offset=(first.getDay()+6)%7; return Array.from({length:Math.ceil((offset+new Date(year,month+1,0).getDate())/7)*7},(_,i)=>{const d=new Date(year,month,1-offset+i,12);return {date:dateKey(d),day:d.getDate(),inMonth:d.getMonth()===month};}); }
export function moneyInput(value:string):number {const s=value.trim().replace(',','.');if(!/^[+-]?\d+(\.\d{1,2})?$/.test(s))throw Error('Bitte einen Eurobetrag mit höchstens zwei Nachkommastellen eingeben, z. B. −25,50 als -25,50.'); const n=Math.round(Number(s)*100);if(!Number.isSafeInteger(n)||Math.abs(n)>100000000)throw Error('Bitte einen Betrag zwischen −1.000.000 und 1.000.000 € eingeben.');return n;}
export function saveEntry(entries:CalendarEntry[],entry:CalendarEntry) {
 if(!validDate(entry.date)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(entry.time))throw Error('Bitte ein gültiges Datum und eine gültige Uhrzeit eingeben.');
 if(!Number.isSafeInteger(entry.gross)||!Number.isSafeInteger(entry.fees)||entry.fees<0)throw Error('Ungültiges Ergebnis oder negative Kosten.');
 if(entry.kind==='trade'&&!entry.symbol.trim())throw Error('Bitte das Wertpapier oder einen Namen für den Trade eingeben.');
 const others=entries.filter(e=>e.id!==entry.id);const same=others.filter(e=>e.date===entry.date);
 if(same.some(e=>e.kind==='day')||(entry.kind==='day'&&same.length))throw Error('Für diesen Tag gibt es bereits Einträge. Verwende entweder einzelne Trades oder ein Tagesergebnis, damit nichts doppelt gezählt wird.');
 return [...others,entry];
}

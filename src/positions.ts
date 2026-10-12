import { validDate, type CalendarEntry } from './calendar';
export type Position = {id:string;symbol:string;qty:number;buyDate:string;buyTime:string;buyPrice:number;buyFee:number;buyCash?:number;note:string;sale?:{date:string;time:string;price:number;fee:number;cash?:number}};
export const validTime=(s:string)=>/^([01]\d|2[0-3]):[0-5]\d$/.test(s);
export function quantityInput(s:string){const v=s.trim().replace(',','.');if(!/^\d+(\.\d{1,6})?$/.test(v))throw Error('Bitte eine positive Stückzahl mit höchstens 6 Nachkommastellen eingeben.');const n=Number(v);if(n<=0||n>1000000)throw Error('Stückzahl muss größer als 0 und höchstens 1.000.000 sein.');return n;}
export const purchaseValue=(p:Position)=>Math.round(p.qty*p.buyPrice);
export function result(p:Position){if(!p.sale)return null;if(p.buyCash!==undefined&&p.sale.cash!==undefined){const net=p.sale.cash-p.buyCash;return {gross:net,fees:0,net,proceeds:p.sale.cash,basis:p.buyCash};}const proceeds=Math.round(p.qty*p.sale.price);const gross=proceeds-purchaseValue(p);const fees=p.buyFee+p.sale.fee;return {gross,fees,net:gross-fees,proceeds,basis:purchaseValue(p)+p.buyFee};}
export function checkPosition(p:Position){
 if(!p.id||!p.symbol.trim()||p.symbol.length>100||p.note.length>10000)throw Error('Bitte einen Namen für den Trade eingeben.');
 if(!Number.isFinite(p.qty)||p.qty<=0||p.qty>1000000||Math.abs(p.qty*1e6-Math.round(p.qty*1e6))>.001)throw Error('Ungültige Stückzahl.');
 if(!validDate(p.buyDate)||!validTime(p.buyTime))throw Error('Ungültiges Kaufdatum oder ungültige Uhrzeit.');
 for(const [price,fee] of [[p.buyPrice,p.buyFee],...(p.sale?[[p.sale.price,p.sale.fee]]:[])])if(!Number.isSafeInteger(price)||price<=0||price>100000000||!Number.isSafeInteger(fee)||fee<0||fee>100000000)throw Error('Preise müssen positiv und Gebühren mindestens 0 sein.');
 if(p.sale&&(!validDate(p.sale.date)||!validTime(p.sale.time)||`${p.sale.date}T${p.sale.time}`<`${p.buyDate}T${p.buyTime}`))throw Error('Der Verkauf darf nicht vor dem Kauf liegen.');
 for(const cash of [p.buyCash,p.sale?.cash])if(cash!==undefined&&(!Number.isSafeInteger(cash)||cash<0||cash>10000000000))throw Error('Ungültiger Cash-Gesamtbetrag.');
 if(p.buyCash!==undefined&&p.buyCash<=0)throw Error('Der abgebuchte Kaufbetrag muss größer als 0 sein.');
 if(p.sale&&((p.buyCash===undefined)!==(p.sale.cash===undefined)))throw Error('Bitte Kaufabbuchung und Verkaufsgutschrift vollständig eintragen.');
}
export function asEntry(p:Position):CalendarEntry|null{const r=result(p);return p.sale&&r?{id:`position:${p.id}`,kind:'trade',date:p.sale.date,time:p.sale.time,direction:'Verkauf',symbol:p.symbol,gross:r.gross,fees:r.fees,note:p.note}:null;}
export function positionEntries(positions:Position[]){return positions.map(asEntry).filter((e):e is CalendarEntry=>e!==null);}
export function savePosition(positions:Position[],calendar:CalendarEntry[],p:Position){checkPosition(p);if(p.sale&&calendar.some(e=>e.kind==='day'&&e.date===p.sale!.date))throw Error('Am Verkaufstag ist bereits ein Tagesgesamtwert gespeichert. Entferne ihn zuerst, damit das Ergebnis nicht doppelt gezählt wird.');return [...positions.filter(x=>x.id!==p.id),p];}

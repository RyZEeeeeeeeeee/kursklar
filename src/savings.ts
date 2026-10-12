import {z} from 'zod';
import {validDate} from './calendar';
export const savingSchema=z.object({id:z.string().min(1),name:z.string().min(1).max(100),isin:z.string().max(30),rate:z.number().int().min(0).max(100000000),frequency:z.enum(['monatlich','wöchentlich','quartalsweise']),active:z.boolean(),price:z.number().int().min(0).max(100000000),priceDate:z.string().refine(s=>s===''||validDate(s)),buys:z.array(z.object({id:z.string().min(1),date:z.string().refine(validDate),qty:z.number().positive().max(1000000),cash:z.number().int().positive().max(100000000)})).max(10000)});
export type Saving=z.infer<typeof savingSchema>;
export function savingTotals(p:Saving){const qty=p.buys.reduce((n,b)=>n+b.qty,0),cash=p.buys.reduce((n,b)=>n+b.cash,0);return {qty,cash,average:qty?cash/qty:0,value:p.price?Math.round(qty*p.price):null};}

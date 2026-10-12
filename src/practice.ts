import type { Lesson } from './content';
// Neue, reproduzierbare Zahlen für Wiederholungen; Fachinhalte bleiben separat.
export function variedLesson(base: Lesson, round: number): Lesson {
 if (!round) return base;
 const n = 2 + round;
 const variants: Record<string, [string,string,string[],string]> = {
 l4: [`Du hast ${n*100} € Guthaben. Ein Kauf kostet ${n*20} € plus 1 € Gebühr.`, 'Welches Guthaben bleibt?', [`${n*80-1} €`,`${n*80} €`,`${n*100} €`], `${n*100} − ${n*20} − 1 = ${n*80-1} €. Gebühren verringern ebenfalls das Guthaben.`],
 l6: [`Kauf ${n*10} € + 1 € Gebühr; Verkauf ${n*10+8} € − 1 € Gebühr.`, 'Wie viel Gewinn ist nach beiden Gebühren realisiert?', ['6 €','8 €','7 €'], 'Die Kursänderung beträgt 8 €. Abzüglich zweier Gebühren von je 1 € bleiben 6 €.'],
 l9: [`Bid ${n*10-0.1} €, Ask ${n*10+0.1} €. Ein letzter Handel war zu ${n*10} €.`, 'Zu welchem Preis verkaufst du per Market im Modell?', [`${n*10-0.1} €`,`${n*10} €`,`${n*10+0.1} €`], 'Du verkaufst an das Kaufangebot der Gegenseite: den Bid. Der letzte Handelspreis ist keine Ausführungszusage.'],
 l11: [`Dein Kauflimit beträgt ${n*10} €. Der Ask steht bei ${n*10+1} €.`, 'Wird im Modell zu diesem Ask gekauft?', ['Nein','Ja','Nur bei hohem Volumen'], 'Der Ask liegt über deinem maximalen Kaufpreis. Ein Kauflimit darf nicht überschritten werden.'],
 l15: [`Eine Ausführung kostet 1 €. Der Anlagebetrag beträgt ${n*10} €.`, 'Welcher Anteil des Anlagebetrags entfällt auf die Gebühr?', [`${(10/n).toLocaleString('de-DE',{maximumFractionDigits:2})} %`,`${n} %`,'1 %'], `1 / ${n*10} × 100 = ${(10/n).toLocaleString('de-DE',{maximumFractionDigits:2})} %. Kleine Aufträge werden relativ stärker belastet.`],
 l17: [`Die Tickfolge lautet ${n*10}, ${n*10+4}, ${n*10-2}, ${n*10+1} €.`, 'Wie hoch ist Close?', [`${n*10+1} €`,`${n*10+4} €`,`${n*10-2} €`], 'Close ist der letzte Tick des Intervalls, unabhängig von Hoch und Tief.'],
 l18: [`Open ${n*10} €, High ${n*10+5} €, Low ${n*10-3} €, Close ${n*10+2} €.`, 'Wie groß ist die Handelsspanne?', ['8 €','2 €','5 €'], `High − Low = ${n*10+5} − ${n*10-3} = 8 €. Der Kerzenkörper beträgt dagegen 2 €.`],
 l25: [`Der bisherige Höchststand ist ${n*1000} €, der Wert fällt auf ${n*800} €.`, 'Welcher Drawdown ist das?', ['20 %','80 %','25 %'], 'Der Verlust beträgt 20 % des Höchststands. Für die Rückkehr sind danach 25 % Gewinn nötig.'],
 l28: [`Ein fiktives Unternehmen erzielt ${n*10} Mio. € Umsatz und ${n} Mio. € Gewinn.`, 'Wie hoch ist die Nettomarge?', ['10 %',`${n} %`,'1 %'], `Gewinn / Umsatz = ${n} / ${n*10} = 10 %. Beide Werte müssen denselben Zeitraum betreffen.`],
 l29: [`Operativer Cashflow ${n*3} Mio. €, Investitionen ${n} Mio. €.`, 'Wie viel freier Cashflow bleibt vereinfacht?', [`${n*2} Mio. €`,`${n*4} Mio. €`,`${n*3} Mio. €`], `${n*3} − ${n} = ${n*2} Mio. €. Investitionen sind Geldabflüsse.`],
 l30: [`Marktkapitalisierung ${n*20} Mio. €, Jahresgewinn ${n} Mio. €.`, 'Welches KGV ergibt sich?', ['20',`${n}`,'5'], 'Marktkapitalisierung geteilt durch Jahresgewinn ergibt 20. Ein KGV allein ist keine Kaufempfehlung.'],
 l34: [`Einstieg 100 €, geplanter Ausstieg 98 €, Risikobudget ${n*2+2} €, insgesamt 2 € Gebühren.`, 'Welche Stückzahl passt rechnerisch?', [`${n}`,`${n+1}`,`${n*2}`], `(${n*2+2} − 2) / (100 − 98) = ${n} Stück. Kurslücken können das geplante Risiko überschreiten.`],
 l36: [`50 % gewinnen ${n*10} €, 50 % verlieren ${n*6} €, Kosten 2 € je Trade.`, 'Wie hoch ist der Modell-Erwartungswert?', [`${n*2-2} €`,`${n*2} €`,`${n*10} €`], `0,5 × ${n*10} − 0,5 × ${n*6} − 2 = ${n*2-2} €. Dies ist ein Modell, keine Zusage.`]
 };
 const v=variants[base.id]; return v ? {...base,example:v[0],question:v[1],options:v[2],correct:0,feedback:v[3]} : base;
}

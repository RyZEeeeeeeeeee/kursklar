import { useState } from 'react';
import { eur, candles, type Tick } from './engine';
export function Chart({ series, interval = 1, line = false, highlight = '', levels = [], onSelect }: { series: Tick[]; interval?: number; line?: boolean; highlight?: string; levels?: { value: number; label: string }[]; onSelect?: (index: number) => void }) {
  const data = candles(series, interval); const [hover, setHover] = useState<number | null>(null);
  const min = Math.min(...data.map(d => d.low), ...levels.map(l => l.value)) - 70, max = Math.max(...data.map(d => d.high), ...levels.map(l => l.value)) + 70;
  const y = (v: number) => 285 - (v - min) / (max - min) * 245;
  const x = (i: number) => 45 + (i + .5) * 720 / data.length;
  const selected = data[hover ?? data.length - 1];
  return <div className="chart-wrap"><div className="ohlc"><span>{selected.time} · {selected.complete ? 'abgeschlossen' : 'laufend'}</span>{[['O', selected.open], ['H', selected.high], ['L', selected.low], ['C', selected.close]].map(([k, v]) => <span key={k}> {k} <b>{eur(Number(v))}</b></span>)}<span>Vol. {selected.volume}</span></div>
    <svg viewBox="0 0 840 350" role="img" aria-label="Simulierter Kurschart. Zeit auf der horizontalen Achse, Europreis vertikal.">
      {Array.from({ length: 6 }, (_, i) => { const v = min + (max - min) * i / 5; return <g key={i}><line x1="35" x2="765" y1={y(v)} y2={y(v)} className="gridline"/><text x="775" y={y(v) + 4}>{eur(v)}</text></g>; })}
      {levels.map(l => <g key={l.label}><line x1="35" x2="765" y1={y(l.value)} y2={y(l.value)} className="orderline"/><text x="42" y={y(l.value) - 7} className="level-label">{l.label} {eur(l.value)}</text></g>)}
      {line ? <polyline fill="none" stroke="#8b9dff" strokeWidth="3" points={data.map((d, i) => `${x(i)},${y(d.close)}`).join(' ')}/> : data.map((d, i) => <g key={i} className={d.close >= d.open ? 'up-candle' : 'down-candle'} style={{ opacity: hover !== null && hover !== i ? .5 : 1 }}><line x1={x(i)} x2={x(i)} y1={y(d.high)} y2={y(d.low)} strokeWidth={highlight === 'Dochte' ? 4 : 1.6}/><rect x={x(i) - Math.min(9, 260 / data.length)} y={Math.min(y(d.open), y(d.close))} width={Math.min(18, 520 / data.length)} height={Math.max(2, Math.abs(y(d.open) - y(d.close)))} stroke={highlight === 'Körper' ? '#fff' : 'none'} strokeWidth="2"/></g>)}
      {line && <circle cx={x(data.length - 1)} cy={y(data[data.length - 1].close)} r="4" fill="#b5a9ff"/>}
      {data.map((d, i) => <g key={i}><rect x={x(i) - 360 / data.length} y="24" width={720 / data.length} height="274" fill="transparent" tabIndex={0} role="button" aria-label={`Kerze ${i + 1}, ${d.time}, Open ${eur(d.open)}, High ${eur(d.high)}, Low ${eur(d.low)}, Close ${eur(d.close)}`} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onClick={() => onSelect?.(i)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect?.(i); } }}/><rect x={x(i) - 4} y={337 - d.volume / interval * .22} width="8" height={d.volume / interval * .22} fill="#6b7398" opacity=".4"/>{i % Math.max(1, Math.floor(data.length / 6)) === 0 && <text x={x(i) - 14} y="307">{d.time}</text>}</g>)}
      <text x="45" y="348">Zeit → · Volumen unten · Preise in €</text>
    </svg><div className="chart-legend"><span className="positive">↗ Close ≥ Open</span><span className="negative">↘ Close &lt; Open</span><span>Simulierte Daten · Nordlicht AG</span></div></div>;
}

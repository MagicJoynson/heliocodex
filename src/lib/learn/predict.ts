/**
 * The guess that opens a lesson. Nothing is stored or sent: the choice lives in this page until it is closed.
 * Without a script the form stays hidden and the answer is given in plain words instead.
 */
interface Option { label: string; detail: string; km: number }
interface Data { options: Option[]; answer: { km: number; label: string; like: string } }

const LOW = 0.5, HIGH = 25_000;
const pct = (km: number) => Math.round(((Math.log10(km) - Math.log10(LOW)) / (Math.log10(HIGH) - Math.log10(LOW))) * 1000) / 10;
/** "about 6 times", "about 320 times", "about 6,300 times": two figures, never false precision. */
function times(r: number): string {
  const digits = Math.max(0, Math.floor(Math.log10(r)) - 1), unit = Math.pow(10, digits);
  if (r < 2) return `about ${(Math.round(r * 10) / 10).toLocaleString('en-GB')} times`;
  const n = r < 10 ? Math.round(r) : Math.round(r / unit) * unit;
  return `about ${n.toLocaleString('en-GB')} times`;
}

export function wirePredict(root: HTMLElement): void {
  const parsed = JSON.parse(root.dataset.predict ?? 'null') as Data | null;
  if (!parsed) return;
  const data: Data = parsed;
  const form = root.querySelector<HTMLFormElement>('.predict-form')!, result = root.querySelector<HTMLElement>('.predict-result')!;
  const go = form.querySelector<HTMLButtonElement>('button[type="submit"]')!, hint = form.querySelector<HTMLElement>('.predict-hint')!;
  const verdict = result.querySelector<HTMLElement>('[data-verdict]')!, line = result.querySelector<HTMLElement>('[data-line]')!, bars = result.querySelector<HTMLElement>('[data-bars]')!;
  const ticks = result.querySelector<HTMLElement>('[data-ticks]')!;
  // the ruler under the bars: one tick for each step of ten
  ticks.replaceChildren(...[1, 10, 100, 1000, 10_000].map((km) => {
    const t = document.createElement('span');
    t.textContent = km === 1 ? '1 km' : km.toLocaleString('en-GB'); t.style.left = `${pct(km)}%`;
    return t;
  }));
  const enable = () => { const any = !!form.querySelector('input[name="guess"]:checked'); go.disabled = !any; hint.hidden = any; };
  form.hidden = false;
  enable(); // going Back to this page can leave a choice ticked
  addEventListener('pageshow', enable);
  form.addEventListener('change', enable);
  function reveal(chosen: number | null): void {
    const a = data.answer, guess = chosen === null ? null : data.options[chosen], ratio = guess ? a.km / guess.km : 1;
    verdict.textContent = guess ? `Your guess: ${guess.label.toLowerCase()}, ${guess.detail}. The answer: ${a.label.toLowerCase()}.` : `The answer: ${a.label.toLowerCase()}.`;
    line.textContent = !guess ? `The nearest star is ${a.like}.`
      : ratio >= 1.5 ? `The answer is ${times(ratio)} further than your guess. The nearest star is ${a.like}.`
      : ratio <= 1 / 1.5 ? `The answer is ${times(1 / ratio)} closer than your guess. The nearest star is ${a.like}.`
      : `That is very close. The nearest star is ${a.like}.`;
    const rows = [...data.options.map((o, i) => ({ text: `${o.label}, ${o.detail}`, km: o.km, guess: i === chosen, answer: false })),
      { text: `The answer: ${a.label.toLowerCase()}, ${a.like}`, km: a.km, guess: false, answer: true }].sort((x, y) => x.km - y.km);
    bars.replaceChildren(...rows.map((r) => {
      const li = document.createElement('li'), t = document.createElement('span'), track = document.createElement('span'), fill = document.createElement('span');
      t.className = 'bar-t'; t.textContent = r.text + (r.guess ? ' (your guess)' : '');
      track.className = 'bar'; track.setAttribute('aria-hidden', 'true'); fill.style.width = `${pct(r.km)}%`; track.append(fill);
      li.className = [r.guess && 'is-guess', r.answer && 'is-answer'].filter(Boolean).join(' ');
      li.append(t, track);
      return li;
    }));
    form.hidden = true; result.hidden = false;
    // the answer is announced by moving focus to it
    verdict.focus();
    result.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const picked = form.querySelector<HTMLInputElement>('input[name="guess"]:checked');
    if (picked) reveal(Number(picked.value));
  });
  form.querySelector('[data-skip]')!.addEventListener('click', () => reveal(null));
  result.querySelector('[data-again]')!.addEventListener('click', () => {
    form.reset(); enable(); result.hidden = true; form.hidden = false;
    form.querySelector<HTMLInputElement>('input[name="guess"]')!.focus();
  });
}

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
  const n = r < 10 ? Math.round(r) : Math.round(r / unit) * unit;
  return `about ${n.toLocaleString('en-GB')} times`;
}

export function wirePredict(root: HTMLElement): void {
  const data = JSON.parse(root.dataset.predict ?? 'null') as Data | null;
  if (!data) return;
  const form = root.querySelector<HTMLFormElement>('.predict-form')!, result = root.querySelector<HTMLElement>('.predict-result')!;
  const go = form.querySelector<HTMLButtonElement>('button[type="submit"]')!, hint = form.querySelector<HTMLElement>('.predict-hint')!;
  const verdict = result.querySelector<HTMLElement>('[data-verdict]')!, line = result.querySelector<HTMLElement>('[data-line]')!, bars = result.querySelector<HTMLElement>('[data-bars]')!;
  form.hidden = false;
  form.addEventListener('change', () => { go.disabled = false; hint.hidden = true; });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const picked = form.querySelector<HTMLInputElement>('input[name="guess"]:checked');
    if (!picked) return;
    const guess = data.options[Number(picked.value)], a = data.answer, ratio = a.km / guess.km;
    verdict.textContent = `Your guess: ${guess.label.toLowerCase()}, ${guess.detail}. The answer: ${a.label.toLowerCase()}.`;
    line.textContent = ratio >= 1.5 ? `That is ${times(ratio)} as far as your guess. The next football is ${a.like}.`
      : ratio <= 1 / 1.5 ? `That is ${times(1 / ratio)} nearer than your guess. The next football is ${a.like}.`
      : `That is very close. The next football is ${a.like}.`;
    const rows = [...data.options.map((o, i) => ({ text: `${o.label}, ${o.detail}`, km: o.km, guess: i === Number(picked.value), answer: false })),
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
  });
}

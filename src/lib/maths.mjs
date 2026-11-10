// Equations in lessons, set at build time. The page gets finished HTML and no script.
// Write $...$ inside a sentence. For an equation set out on its own, put the opening $$ and the closing $$
// each on a line by themselves, with the equation on the lines between. Written as $$...$$ on one line it
// comes out small and inline instead of centred. A mistake in an equation stops the build.
// Astro's content cache does not notice a change to this file: delete .astro/data-store.json before a local build.
import { defineMdastPlugin } from 'satteri';
import katex from 'katex';

const set = (tex, displayMode) => ({ type: 'html', value: katex.renderToString(tex, { displayMode, throwOnError: true, strict: 'error' }) });

export const equations = defineMdastPlugin({
  name: 'equations',
  math(node, ctx) { ctx.replaceNode(node, set(node.value, true)); },
  // A full stop, comma or closing bracket straight after an equation in a sentence, or an opening bracket straight
  // before it, is kept on the same line as the equation, so that it is never left alone at a line's start or end.
  inlineMath(node, ctx) {
    const parent = ctx.parent(node), at = ctx.indexOf(node);
    const before = parent?.children?.[at - 1], after = parent?.children?.[at + 1];
    const open = before?.type === 'text' ? (/[(\[]+$/.exec(before.value)?.[0] ?? '') : '';
    const close = after?.type === 'text' ? (/^[.,;:!?)\]]+/.exec(after.value)?.[0] ?? '') : '';
    if (!open && !close) return ctx.replaceNode(node, set(node.value, false));
    if (open) ctx.setField(before, 'value', before.value.slice(0, -open.length));
    if (close) ctx.setField(after, 'value', after.value.slice(close.length));
    ctx.replaceNode(node, { type: 'html', value: `<span style="white-space:nowrap">${open}${set(node.value, false).value}${close}</span>` });
  },
});

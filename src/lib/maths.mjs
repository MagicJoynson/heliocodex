// Equations in lessons, set at build time. The page gets finished HTML and no script.
// Write $...$ inside a sentence and $$...$$ on lines of its own. A mistake in an equation stops the build.
import { defineMdastPlugin } from 'satteri';
import katex from 'katex';

const set = (tex, displayMode) => ({ type: 'html', value: katex.renderToString(tex, { displayMode, throwOnError: true, strict: 'error' }) });

export const equations = defineMdastPlugin({
  name: 'equations',
  math(node, ctx) { ctx.replaceNode(node, set(node.value, true)); },
  inlineMath(node, ctx) { ctx.replaceNode(node, set(node.value, false)); },
});

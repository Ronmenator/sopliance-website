import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const css = await readFile(new URL('../styles.css', import.meta.url), 'utf8');
const token = name => {
  const match = css.match(new RegExp(`--${name}:(#[0-9a-f]{6})`, 'i'));
  assert(match, `Missing ${name} color`);
  return match[1];
};
function luminance(hex) {
  return [1, 3, 5].map(i => Number.parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4)
    .reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
}
function check(label, foreground, background, minimum = 4.5) {
  const [low, high] = [luminance(foreground), luminance(background)].sort((a, b) => a - b);
  const ratio = (high + .05) / (low + .05);
  assert(ratio >= minimum, `${label}: ${ratio.toFixed(2)}:1 is below ${minimum}:1`);
  console.log(`${label}: ${ratio.toFixed(2)}:1`);
}
check('Primary buttons', '#ffffff', token('orange'));
check('Button hover', '#ffffff', '#cf4616');
for (const background of [token('paper'), '#f1f2ec', '#f1f2eb', '#eeeae1', '#eef1e8', '#edf0e7', '#ffffff']) {
  check(`Muted text on ${background}`, token('muted'), background);
  check(`Orange text on ${background}`, token('orange'), background);
}
check('Green icon on light panel', token('green'), '#edf1e7');
check('Photo label and caption', '#ffffff', token('dark'));
check('Photo caption number', '#c1c9bf', token('dark'));
check('Input boundary', '#7a8175', '#ffffff', 3);
check('Keyboard focus ring on light surface', token('ink'), token('paper'), 3);
check('Keyboard focus ring on dark surface', '#ffffff', token('dark'), 3);

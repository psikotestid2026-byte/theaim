/** How an IST/WPT choice is shown. Image choices keep a visible letter; text choices keep their label. */

export function choicePresentation(index: number, option: { label?: string; image?: string }): {
  letter: string;
  text: string;
  ariaLabel?: string;
} {
  const letter = String.fromCharCode(65 + index);
  if (option.image) return { letter, text: letter, ariaLabel: `Pilihan ${letter}` };
  return { letter, text: option.label?.trim() ? option.label : letter };
}

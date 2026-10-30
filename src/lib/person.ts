/** Link to the page listing every title an actor/director appears in. */
export const personHref = (name: string) => `/person/_/?n=${encodeURIComponent(name.trim())}`;

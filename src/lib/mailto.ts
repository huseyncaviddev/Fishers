/**
 * Hand a composed message to the visitor's mail client.
 *
 * Goes through a real anchor click rather than assigning `location.href`.
 * Assigning the location for an external protocol is treated as a navigation
 * attempt and some browsers cancel it when it is not clearly user-initiated;
 * a synthetic click on an anchor inherits the activation from the submit that
 * triggered it, which is the behaviour we want.
 */
export function openMailto(url: string): void {
  const a = document.createElement("a");
  a.href = url;
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** Build a `mailto:` URL with the subject and body correctly escaped. */
export function buildMailto(to: string, subject: string, body: string): string {
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

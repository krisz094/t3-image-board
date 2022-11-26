export function appendIdToComment(
  id: string,
  setTxt: (fn: (txt: string) => string) => void
) {
  setTxt((txt) => `${txt}>>${id}\n`);
}

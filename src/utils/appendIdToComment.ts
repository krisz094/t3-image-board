import type { RefObject } from "react";

export function appendIdToComment(
  id: string,
  setTxt: (fn: (txt: string) => string) => void,
  refObject?: RefObject<HTMLTextAreaElement>
) {
  setTxt((txt) => `${txt}>>${id}\n`);

  if (refObject && refObject.current) {
    refObject.current.focus();
    refObject.current.scrollIntoView();
  }
}

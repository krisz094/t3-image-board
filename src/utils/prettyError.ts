export function prettyError(err: unknown) {
  if (typeof err === "string") {
    try {
      const json = JSON.parse(err);
      if (json && typeof json === "object") {
        const jsonObj = json as object;
        if (Array.isArray(jsonObj) && jsonObj.length) {
          const firstElem = jsonObj[0];
          if (firstElem && typeof firstElem === "object") {
            const firstElemAsObj = firstElem as { message: string };
            if (firstElemAsObj.hasOwnProperty("message")) {
              return firstElemAsObj.message;
            } else {
              return undefined;
            }
          }
        }
      }
    } catch (err) {
      return undefined;
    }
  } else {
    return undefined;
  }
}

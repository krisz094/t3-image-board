export function padZero(num: number): string {
    if (num < 10) {
        return "0" + num;
    }
    else {
        return "" + num;
    }
}

export function PrettyDateComment(date: Date) {

    const YYYY = date.getFullYear();
    const MM = padZero(date.getMonth() + 1);
    const DD = padZero(date.getDate());

    const HH = padZero(date.getHours());
    const mm = padZero(date.getMinutes());
    const ss = padZero(date.getSeconds());

    return `${YYYY}. ${MM}. ${DD}. ${HH}:${mm}:${ss}`
}
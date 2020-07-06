export const outputAmountString = amountValue => {
    if (/^-?[0-9]+[.][0-9]$/.test(amountValue)) {
        return `${amountValue}0`;
    } else if (/^-?[0-9]+$/.test(amountValue)) {
        return `${amountValue}.00`;
    } else {
        return amountValue;
    }
}

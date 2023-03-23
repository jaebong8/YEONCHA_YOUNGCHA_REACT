import { format } from "date-fns";

export const getUid = () => {
    return crypto.randomUUID();
};
export const timeUid = () => {
    return format(new Date(), "HHmmss");
};

export const getPastelColor = () => {
    const hue = Math.floor(Math.random() * 360);
    const pastel = "hsl(" + hue + ", 100%, 95%)";
    return pastel;
};

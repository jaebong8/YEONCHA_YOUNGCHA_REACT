import { format } from "date-fns";

export const getUid = () => {
    return crypto.randomUUID()
};
export const timeUid = ()=>{
    return format(new Date(), "HHmmss");
}
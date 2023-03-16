
import { Timestamp } from "firebase/firestore";

export interface WorkerType {
    birthDate: string;
    name: string;
    phoneNumber: string;
    role: string;
    workStartDate: string;
    workerUid: string ;
    userUid?: string;
    [key:string]: number | string | undefined;
} 

export interface UserType {
    company : string;
    email: string;
    workers?: WorkerType;
    birthDate?: string;
    name?: string;
    phoneNumber?: string;
    role: string;
    workStartDate?: string;
    workerUid?: string ;
    userUid: string;

}

export interface DocType {
    createdAt:Timestamp
    documentUid:string;
    endDate:string;
    name:string;
    startDate:string;
    status:string;
    title:string;
    type:string;
    userUid:string;
    date:string;
    reject?: string;
    color:string;
}
export interface WorkerType {
    birthDate: string;
    name: string;
    phoneNumber: string;
    role: string;
    workStartDate: string;
    workerUid: string  
} 

export interface UserType {
    company : string;
    email: string;
    role: string;
    userUid: string;
    workers: WorkerType;
}
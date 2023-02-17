import { FormLabel, Input } from "@chakra-ui/react";
import React from "react";

interface Props {
    label: string;
    type: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
}

const AuthInput: React.FC<Props> = ({ label, type, value, onChange, placeholder }) => {
    return (
        <>
            <FormLabel>{label}</FormLabel>
            <Input type={type} value={value} onChange={onChange} placeholder={placeholder} variant="flushed" />
        </>
    );
};

export default AuthInput;

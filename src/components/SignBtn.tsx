import { Button } from "@chakra-ui/react";

interface Props {
    title: string;
}

const SignBtn: React.FC<Props> = ({ title }) => {
    return (
        <Button colorScheme="linkedin" mt="5" type="submit" w="100%">
            {title}
        </Button>
    );
};

export default SignBtn;

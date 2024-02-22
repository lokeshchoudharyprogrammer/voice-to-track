import React from 'react';
import {
    Box,
    Flex,
    Text,
    Spacer,
    IconButton,
    useColorMode,
} from '@chakra-ui/react';
import { FiSun, FiMoon } from 'react-icons/fi';

const NavBar = () => {
    const { colorMode, toggleColorMode } = useColorMode();

    return (
        <Box p={4} boxShadow="md">
            <Flex alignItems="center">
                <Text fontSize="2xl" fontWeight="bold">Audio To Transcript</Text>
                <Spacer />
                <IconButton
                    icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
                    onClick={toggleColorMode}
                    aria-label="Toggle Dark Mode"
                    variant="ghost"
                />
            </Flex>
        </Box>
    );
};

export default NavBar;

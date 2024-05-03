'use client'

import { ChakraProvider } from '@chakra-ui/react';
import { CacheProvider } from '@chakra-ui/next-js';
import SideBar from '@/components/navbar/SideBar'


export default function RootLayout({ children }) {
  return (
    <CacheProvider>
      <ChakraProvider>
        <div className="flex">
          <SideBar></SideBar>
          <div className='p-4 w-full'>
            {children}
          </div>
        </div>
      </ChakraProvider>
    </CacheProvider>
  );
}

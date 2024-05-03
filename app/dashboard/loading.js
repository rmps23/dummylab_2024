import { CircularProgress } from "@chakra-ui/react";

export default function Loading() {
    // You can add any UI inside Loading, including a Skeleton.
    return (
        <div className="flex justify-center items-center w-full h-full">
            <CircularProgress></CircularProgress>
        </div>
    )
}
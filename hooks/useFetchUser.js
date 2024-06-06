import { useEffect } from 'react';
import { supabase } from '@/supabase';
import useUserStore from '@/store/useStore';

const useFetchUser = () => {
    const setUser = useUserStore((state) => state.setUser);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
            }
        };

        fetchUser();
    }, [setUser]);

    return null;
};

export default useFetchUser;

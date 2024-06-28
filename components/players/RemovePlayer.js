import { playerStore } from '@/store/playerStore';
import { deletePlayer } from '@/hooks/players/deletePlayer';

const RemovePlayer = ({ player_name, player_id, setRemovePlayerModal }) => {
    const { removePlayer } = playerStore();

    async function handleRemovePlayer() {
        try {
            await deletePlayer(player_id);
            removePlayer(player_id);
        } catch (error) {
            console.error('Error removing player:', error);
        } finally {
            setRemovePlayerModal(false);
        }
    }

    function handleClose() {
        setRemovePlayerModal(false);
    }

    return (
        <div className="flex flex-col gap-8">
            <p className='mx-auto'>Are you sure you want to delete {player_name}?</p>
            <div className='flex gap-4 justify-center'>
                <button className="bg-zinc-900 py-1 px-2 rounded-md" onClick={handleRemovePlayer}>Confirm</button>
                <button className="bg-zinc-100 text-zinc-950 py-1 px-2 rounded-md" onClick={handleClose}>Cancel</button>
            </div>
        </div>
    );
};

export default RemovePlayer;

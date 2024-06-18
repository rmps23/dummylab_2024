import { teamStore } from '@/store/teamStore';
import { deleteTeam } from '@/hooks/teams/deleteTeam';

const RemoveTeam = ({ team_name, team_id, setRemoveTeamModal }) => {
    const { removeTeam } = teamStore();

    async function handleRemoveTeam() {
        try {
            await deleteTeam(team_id);
            removeTeam(team_id);
        } catch (error) {
            console.error('Error adding team:', error);
        } finally {
            setRemoveTeamModal(false);
        }
    }

    function handleClose() {
        setRemoveTeamModal(false);
    }


    return (
        <div className="flex flex-col gap-8">
            <p className='mx-auto'>Are you sure u want to delete {team_name}?</p>
            <div className='flex gap-4 justify-center'>
                <button className="bg-zinc-900 py-1 px-2 rounded-md" onClick={handleRemoveTeam}>Confirm</button>
                <button className="bg-zinc-100 text-zinc-950 py-1 px-2 rounded-md" onClick={handleClose}>Cancel</button>
            </div>
        </div>
    );
};

export default RemoveTeam;

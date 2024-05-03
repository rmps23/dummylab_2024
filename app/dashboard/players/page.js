import { Button } from '@chakra-ui/react'
import Link from 'next/link'

const Players = () => {
    return (
        <div>
            <Link href="/dashboard/players/add_player"><Button className="bg-stone-800 text-stone-200 hover:bg-stone-700" size="sm">+ Add Player</Button></Link>
        </div>
    )
}

export default Players
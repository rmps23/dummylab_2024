import Navbar from '@/components/navbar/Navbar'
import ModalDL from '@/components/lib/ModalDL'
import AddPlayer from '@/components/players/AddPlayer'

const Players = () => {


    return (
        <>
            <Navbar />
            <div className='max-w-[1440px] px-5 py-10 mx-auto'>
                <ModalDL btn="Create Player" content={<AddPlayer />} />
            </div>
        </>
    )
}

export default Players

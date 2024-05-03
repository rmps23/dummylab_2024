import Link from 'next/link'
import { usePathname } from 'next/navigation'

const SideBarLink = ({ link, text, icon }) => {
    const pathname = usePathname()
    console.log(link + " | " + pathname);
    return (
        <Link href={link} className={`bg-stone-700 ml-4 rounded-l-md py-2 px-4 flex gap-4 items-center ${pathname.endsWith(link) ? 'bg-teal-700' : ''}`}>
            <span>{icon}</span>
            {text}
        </Link>
    )
}

export default SideBarLink

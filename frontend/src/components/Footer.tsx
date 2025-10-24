import { IoLogoLinkedin } from "react-icons/io5";
import { FaGithub } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { externalRoutes } from "../utils/urls";

const Footer = () => {
    return (
        <footer className="mt-8 py-6 border-t border-brd-muted text-center text-text-muted flex flex-col items-center gap-2">
            <div className="flex gap-4 justify-center">
                <a
                    href={externalRoutes.GitHub}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary-highlight transition-colors flex items-center gap-1"
                >
                    <FaGithub className="w-5 h-5" />
                    <span>GitHub</span>
                </a>
                <span className="text-text-muted select-none">|</span>
                <a
                    href={externalRoutes.LinkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary-highlight transition-colors flex items-center gap-1"
                >
                    <IoLogoLinkedin className="w-5 h-5" />
                    <span>LinkedIn</span>
                </a>
                <span className="text-text-muted select-none">|</span>
                <a
                    href={externalRoutes.Email}
                    className="hover:text-primary-highlight transition-colors flex items-center gap-1"
                >
                    <MdEmail className="w-5 h-5" />
                    <span>Email</span>
                </a>
            </div>
            <span className="text-xs">&copy; {new Date().getFullYear()} Kyle Gerner</span>
        </footer>
    )
}

export default Footer;

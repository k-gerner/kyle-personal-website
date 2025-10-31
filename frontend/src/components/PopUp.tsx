import { MdOutlineCancel } from "react-icons/md";
import { createPortal } from "react-dom";

interface PopUpProps {
    setShow: (show: boolean) => void;
    innerContent: React.ReactNode;
}


const PopUp: React.FC<PopUpProps> = ({
    setShow,
    innerContent
}) => {
    return createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-background-base rounded-lg shadow-lg p-8 w-full relative max-h-[90vh] max-w-[95vw] md:max-w-xl overflow-y-auto">
                <button
                    className="absolute rounded-full top-2 right-2 text-xl font-bold text-danger bg-background-base hover:bg-danger hover:text-background-base transition-colors"
                    onClick={() => setShow(false)}
                    aria-label="Close pop-up"
                >
                    <MdOutlineCancel className='w-8 h-8' />
                </button>
                {innerContent}
            </div>
        </div>,
        document.body
    );
};

export default PopUp;
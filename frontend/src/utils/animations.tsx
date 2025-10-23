import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export const FadeSlideIn: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
    const [visible, setVisible] = useState(false);
    const location = useLocation();

    useEffect(() => {
        setVisible(false);
        const timeout = setTimeout(() => setVisible(true), 10);
        return () => clearTimeout(timeout);
    }, [location.pathname]);

    return (
        <div
            className={`transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className ?? ""}`}
        >
            {children}
        </div>
    );
};
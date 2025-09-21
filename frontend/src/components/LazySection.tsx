import { useEffect, useRef, useState } from "react";

interface LazySectionProps {
    children: React.ReactNode;
    threshold?: number;
    className?: string;
    animation?: "fade-up" | "slide-left"; // có thể mở rộng thêm
}

export default function LazySection({
    children,
    threshold = 0.3,
    className = "",
    animation = "fade-up",
}: LazySectionProps) {
    const ref = useRef<HTMLDivElement | null>(null);
    const [show, setShow] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setShow(true);
                    observer.disconnect();
                }
            },
            { threshold }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [threshold]);

    return (
        <div
            ref={ref}
            className={`lazy-section ${animation} ${show ? "show" : ""} ${className}`}
        >
            {children}
        </div>
    );
}

import { motion } from "framer-motion";
import cashOverlay from "@/assets/cash-overlay.png";

export const AnimatedBackground = () => {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-card" />

            {/* Animated cash overlay */}
            <motion.div
                className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: `url(${cashOverlay})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
                animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 2, 0],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />

            {/* Floating particles */}
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                        background: i % 3 === 0 ? "hsl(189 94% 43%)" : i % 3 === 1 ? "hsl(271 91% 65%)" : "hsl(330 81% 60%)",
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        filter: "blur(1px)",
                    }}
                    animate={{
                        y: [0, -100, 0],
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0],
                    }}
                    transition={{
                        duration: 3 + Math.random() * 3,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                        ease: "easeInOut",
                    }}
                />
            ))}

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/50 via-transparent to-background/50" />
        </div>
    );
};

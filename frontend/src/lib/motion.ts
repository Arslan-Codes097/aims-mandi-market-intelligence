export const fadeInUp = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
};

export const staggerContainer = {
    animate: {
        transition: { staggerChildren: 0.06 },
    },
};

export const scaleOnTap = {
    whileTap: { scale: 0.97 },
    whileHover: { scale: 1.02 },
    transition: { duration: 0.15 },
};
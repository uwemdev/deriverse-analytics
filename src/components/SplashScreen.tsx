import { useState, useEffect } from 'react';

interface SplashScreenProps {
    onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Auto-dismiss splash after 2.5 seconds
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onComplete, 800); // Wait for fade-out animation
        }, 2500);

        return () => clearTimeout(timer);
    }, [onComplete]);

    if (!isVisible) return null;

    return (
        <div className="splash-screen">
            <div className="splash-content">
                <div className="splash-logo">
                    Deriverse
                </div>
                <div className="splash-tagline">
                    Trading Analytics Dashboard
                </div>
                <div className="splash-loader">
                    <div className="splash-loader-dot"></div>
                    <div className="splash-loader-dot"></div>
                    <div className="splash-loader-dot"></div>
                </div>
            </div>
        </div>
    );
};

export default SplashScreen;

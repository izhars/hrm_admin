import React, { useState, useEffect, useCallback } from 'react';

const DayTimeWidget = ({ isDarkMode }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [quote, setQuote] = useState(null);
    const [isLoadingQuote, setIsLoadingQuote] = useState(true);

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Fetch quote on mount
    useEffect(() => {
        fetchQuote();
    }, []);

    const fetchQuote = async () => {
        setIsLoadingQuote(true);
        try {
            const response = await fetch('https://dummyjson.com/quotes/random');
            const data = await response.json();

            if (data && data.quote && data.author) {
                setQuote({
                    text: data.quote,
                    author: data.author
                });
            } else {
                throw new Error('Invalid quote data');
            }
        } catch (error) {
            console.error('Failed to fetch quote:', error);
            setQuote({
                text:
                    "The best time to plant a tree was 20 years ago. The second best time is now.",
                author: "Chinese Proverb"
            });
        } finally {
            setIsLoadingQuote(false);
        }
    };


    const getTimeBasedGreeting = () => {
        const hour = currentTime.getHours();

        if (hour >= 5 && hour < 12) {
            return {
                title: "Good Morning",
                subtitle: "Rise and conquer.",
                emoji: "🌅",
                gradient: "linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)",
                colors: { primary: "#203A43", secondary: "#2C5364" }
            };
        } else if (hour >= 12 && hour < 17) {
            return {
                title: "Good Afternoon",
                subtitle: "Keep the fire burning!",
                emoji: "🌞",
                gradient: "linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #1e3c72 100%)",
                colors: { primary: "#2a5298", secondary: "#1e3c72" }
            };
        } else if (hour >= 17 && hour < 21) {
            return {
                title: "Good Evening",
                subtitle: "The night is young.",
                emoji: "🌇",
                gradient: "linear-gradient(135deg, #42275a 0%, #734b6d 50%, #2a0845 100%)",
                colors: { primary: "#734b6d", secondary: "#2a0845" }
            };
        } else {
            return {
                title: "Good Night",
                subtitle: "Rest. Tomorrow’s another grind.",
                emoji: "🌙",
                gradient: "linear-gradient(135deg, #000428 0%, #004e92 50%, #000000 100%)",
                colors: { primary: "#004e92", secondary: "#000428" }
            };
        }
    };


    const formatTime = () => {
        const hours = currentTime.getHours() % 12 || 12;
        const minutes = currentTime.getMinutes().toString().padStart(2, '0');
        const period = currentTime.getHours() >= 12 ? 'PM' : 'AM';
        return { time: `${hours}:${minutes}`, period };
    };

    const formatDate = () => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${days[currentTime.getDay()]}, ${currentTime.getDate()} ${months[currentTime.getMonth()]}`;
    };

    const greeting = getTimeBasedGreeting();
    const { time, period } = formatTime();

    const cardStyle = {
        background: greeting.gradient,
        borderRadius: '32px',
        padding: '28px',
        marginBottom: '32px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: `0 20px 40px -8px ${greeting.colors.primary}40, 0 12px 28px -2px ${greeting.colors.secondary}30`,
        transition: 'all 0.3s ease',
    };

    const glassmorphStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
    };

    return (
        <div style={cardStyle}>
            {/* Glassmorphism overlay */}
            <div style={glassmorphStyle}></div>

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                    <span style={{ fontSize: '36px', marginRight: '12px' }}>{greeting.emoji}</span>
                    <div>
                        <h2 style={{
                            fontSize: '28px',
                            fontWeight: '800',
                            color: 'white',
                            margin: 0,
                            textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            letterSpacing: '-0.5px'
                        }}>
                            {greeting.title}
                        </h2>
                        <p style={{
                            fontSize: '16px',
                            color: 'rgba(255,255,255,0.9)',
                            margin: '4px 0 0 0',
                            fontWeight: '500'
                        }}>
                            {greeting.subtitle}
                        </p>
                    </div>
                </div>

                {/* Clock and Time Display */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr',
                    gap: '24px',
                    alignItems: 'center',
                    marginBottom: '24px'
                }}>
                    {/* Analog Clock */}
                    <AnalogClock time={currentTime} />

                    {/* Digital Time */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            <span style={{
                                fontSize: '48px',
                                fontWeight: '900',
                                color: 'white',
                                lineHeight: 1,
                                letterSpacing: '-2px',
                                textShadow: '0 3px 8px rgba(0,0,0,0.3)'
                            }}>
                                {time}
                            </span>
                            <span style={{
                                fontSize: '20px',
                                fontWeight: '700',
                                color: 'rgba(255,255,255,0.9)',
                                letterSpacing: '0.5px'
                            }}>
                                {period}
                            </span>
                        </div>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginTop: '12px',
                            padding: '8px 14px',
                            background: 'rgba(255,255,255,0.2)',
                            borderRadius: '20px',
                            border: '1.5px solid rgba(255,255,255,0.3)',
                        }}>
                            <span style={{ fontSize: '14px' }}>📅</span>
                            <span style={{
                                fontSize: '13px',
                                fontWeight: '700',
                                color: 'white',
                                letterSpacing: '0.3px'
                            }}>
                                {formatDate()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Quote Card */}
                {!isLoadingQuote && quote ? (
                    <div style={{
                        padding: '20px',
                        background: 'rgba(255,255,255,0.15)',
                        borderRadius: '24px',
                        border: '1.5px solid rgba(255,255,255,0.3)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                    }}>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <div style={{
                                padding: '8px',
                                background: 'rgba(255,255,255,0.2)',
                                borderRadius: '12px',
                                height: 'fit-content'
                            }}>
                                <span style={{ fontSize: '24px' }}>💭</span>
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    color: 'rgba(255,255,255,0.95)',
                                    fontStyle: 'italic',
                                    margin: '0 0 12px 0',
                                    lineHeight: '1.6'
                                }}>
                                    "{quote.text}"
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{
                                        fontSize: '13px',
                                        fontWeight: '700',
                                        color: 'rgba(255,255,255,0.85)',
                                        letterSpacing: '0.3px'
                                    }}>
                                        — {quote.author}
                                    </span>
                                    <button
                                        onClick={fetchQuote}
                                        style={{
                                            padding: '8px',
                                            background: 'rgba(255,255,255,0.2)',
                                            border: 'none',
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.background = 'rgba(255,255,255,0.3)';
                                            e.target.style.transform = 'rotate(180deg)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.background = 'rgba(255,255,255,0.2)';
                                            e.target.style.transform = 'rotate(0deg)';
                                        }}
                                    >
                                        <span style={{ fontSize: '20px' }}>🔄</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{
                        padding: '20px',
                        background: 'rgba(255,255,255,0.15)',
                        borderRadius: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px'
                    }}>
                        <div className="loading-spinner" style={{
                            width: '20px',
                            height: '20px',
                            border: '2px solid rgba(255,255,255,0.3)',
                            borderTopColor: 'white',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }}></div>
                        <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: '600' }}>
                            Loading inspiration...
                        </span>
                    </div>
                )}
            </div>

            <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

// Analog Clock Component
const AnalogClock = ({ time }) => {
    const canvasRef = React.useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const size = 100;
        const center = size / 2;
        const radius = size / 2 - 4;

        // Clear canvas
        ctx.clearRect(0, 0, size, size);

        // Draw clock face
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw hour marks
        for (let i = 0; i < 60; i++) {
            const angle = (i / 60) * 2 * Math.PI - Math.PI / 2;
            const isHourMark = i % 5 === 0;
            const markLength = isHourMark ? 8 : 4;
            const lineWidth = isHourMark ? 2.5 : 1.5;

            ctx.beginPath();
            ctx.strokeStyle = isHourMark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = lineWidth;
            ctx.lineCap = 'round';

            const startX = center + (radius - markLength) * Math.cos(angle);
            const startY = center + (radius - markLength) * Math.sin(angle);
            const endX = center + (radius - 2) * Math.cos(angle);
            const endY = center + (radius - 2) * Math.sin(angle);

            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }

        // Calculate angles
        const hours = time.getHours() % 12;
        const minutes = time.getMinutes();
        const seconds = time.getSeconds();

        const hourAngle = ((hours + minutes / 60) / 12) * 2 * Math.PI - Math.PI / 2;
        const minuteAngle = ((minutes + seconds / 60) / 60) * 2 * Math.PI - Math.PI / 2;
        const secondAngle = (seconds / 60) * 2 * Math.PI - Math.PI / 2;

        // Draw hour hand shadow
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.moveTo(center + 1, center + 2);
        ctx.lineTo(
            center + 1 + radius * 0.4 * Math.cos(hourAngle),
            center + 2 + radius * 0.4 * Math.sin(hourAngle)
        );
        ctx.stroke();

        // Draw hour hand
        ctx.beginPath();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.moveTo(center, center);
        ctx.lineTo(
            center + radius * 0.4 * Math.cos(hourAngle),
            center + radius * 0.4 * Math.sin(hourAngle)
        );
        ctx.stroke();

        // Draw minute hand
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.moveTo(center, center);
        ctx.lineTo(
            center + radius * 0.65 * Math.cos(minuteAngle),
            center + radius * 0.65 * Math.sin(minuteAngle)
        );
        ctx.stroke();

        // Draw second hand
        ctx.beginPath();
        ctx.strokeStyle = '#FF6B6B';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.moveTo(
            center - radius * 0.15 * Math.cos(secondAngle),
            center - radius * 0.15 * Math.sin(secondAngle)
        );
        ctx.lineTo(
            center + radius * 0.75 * Math.cos(secondAngle),
            center + radius * 0.75 * Math.sin(secondAngle)
        );
        ctx.stroke();

        // Draw center dot
        ctx.beginPath();
        ctx.arc(center, center, 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(center, center, 3, 0, 2 * Math.PI);
        ctx.fillStyle = '#FF6B6B';
        ctx.fill();
    }, [time]);

    return (
        <div style={{
            width: '100px',
            height: '100px',
            boxShadow: '0 6px 20px rgba(255,255,255,0.3), 0 -2px 8px rgba(255,255,255,0.1)',
            borderRadius: '50%'
        }}>
            <canvas
                ref={canvasRef}
                width={100}
                height={100}
                style={{ display: 'block', borderRadius: '50%' }}
            />
        </div>
    );
};

export default DayTimeWidget;

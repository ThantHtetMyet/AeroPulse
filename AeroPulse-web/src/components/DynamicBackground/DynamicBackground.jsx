import { useState, useMemo } from 'react';
import './DynamicBackground.css';

const VideoBackground = ({ type, folder = 'weather', fallback, blendMode = 'screen' }) => {
    const [error, setError] = useState(false);

    if (error) return fallback || null;

    return (
        <div className="weather-video-container">
            <video
                key={type}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="weather-video"
                style={{ mixBlendMode: blendMode }}
                onError={() => setError(true)}
            >
                {/* Use import.meta.env.BASE_URL to handle GitHub Pages subpath deployment */}
                <source src={`${import.meta.env.BASE_URL}${folder}/${type}.mp4`} type="video/mp4" />
            </video>
            <div className="weather-video-overlay"></div>
        </div>
    );
};

const DynamicBackground = ({ weather, timeOfDay = 'day', isActive }) => {
    const timeClass = `bg-${timeOfDay}`;
    const isNight = ['evening', 'night', 'midnight'].includes(timeOfDay);
    const isDay = !isNight;

    const weatherType = useMemo(() => {
        if (!weather || !isActive) return null;
        const code = weather.weather_code;

        // Map WMO codes to weather types
        if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return 'rain';
        if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snow';
        if ([95, 96, 99].includes(code)) return 'storm';
        if ([45, 48].includes(code)) return 'fog';
        if ([2, 3].includes(code)) return 'overcast';
        // Clear sky treated as default/base (handled by time video)
        if ([0, 1].includes(code)) return 'clear_sky';

        return null;
    }, [weather, isActive]);

    return (
        <div className={`dynamic-background ${timeClass}`}>
            {/* Stars for night */}
            {isNight && (
                <div className="stars-container">
                    <div className="stars"></div>
                </div>
            )}

            {/* Clouds for day when not weather active */}
            {isDay && !isActive && (
                <div className="clouds-base"></div>
            )}

            {/* Time of Day Base Video */}
            <VideoBackground
                type={timeOfDay}
                folder="day"
                blendMode="normal"
                fallback={null} // Fallback to CSS/Stars behind it
            />

            {/* Weather Effects */}
            {isActive && (
                <div className="weather-overlay">

                    {/* Rain: Video or CSS Fallback */}
                    {weatherType === 'rain' && (
                        <VideoBackground
                            type="rain"
                            blendMode="screen"
                            fallback={<div className="rain"></div>}
                        />
                    )}

                    {/* Snow: Video or CSS Fallback */}
                    {weatherType === 'snow' && (
                        <VideoBackground
                            type="snow"
                            blendMode="screen"
                            fallback={<div className="snow"></div>}
                        />
                    )}

                    {/* Storm: Video or CSS Rain Fallback + Lightning Overlay */}
                    {weatherType === 'storm' && (
                        <>
                            <VideoBackground
                                type="storm"
                                blendMode="screen"
                                fallback={<div className="rain"></div>}
                            />
                            {/* Lightning always overlays */}
                            <div className="lightning"></div>
                        </>
                    )}



                    {/* Overcast: Video or CSS Fallback */}
                    {weatherType === 'overcast' && (
                        <VideoBackground
                            type="overcast"
                            blendMode="normal"
                            fallback={<div className="clouds-overlay"></div>}
                        />
                    )}

                    {/* Clouds Overlay for gloomy weather (Rain, Snow, Storm, Overcast) */}
                    {/* We show this overlay regardless of video/CSS to ensure text contrast/gloom */}
                    {['rain', 'snow', 'storm', 'overcast', 'cloudy'].includes(weatherType) && (
                        <div className="clouds-overlay"></div>
                    )}

                    {/* Fog effect */}
                    {weatherType === 'fog' && (
                        <div className="fog"></div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DynamicBackground;

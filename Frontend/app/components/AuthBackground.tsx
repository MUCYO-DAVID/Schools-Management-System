'use client';

import React from 'react';

const AuthBackground = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="relative min-h-screen w-full bg-black flex flex-col font-sans">
            {/* Background Collage */}
            <div className="fixed inset-0 z-0 overflow-hidden opacity-40">
                <div className="absolute inset-0 bg-black/60 z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80 z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80 z-10 hidden md:block" />

                {/* CSS Grid of school/tech images mimicking Netflix posters */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 p-2 transform -rotate-[8deg] scale-125 -translate-y-10 opacity-70 pointer-events-none">
                    {[
                        'https://images.unsplash.com/photo-1523050854058-8df90110c9f1',
                        'https://images.unsplash.com/photo-1509062522246-3755977927d7',
                        'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45',
                        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3',
                        'https://images.unsplash.com/photo-1503676260728-1c00da094a0b',
                        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f',
                        'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
                        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
                        'https://images.unsplash.com/photo-1524178232363-1fb2b075b655',
                        'https://images.unsplash.com/photo-1546410531-b4cea4a4e8d2',
                        'https://images.unsplash.com/photo-1577896851231-70ef18881754',
                        'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e',
                        'https://images.unsplash.com/photo-1543269865-cbf427effbad',
                        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d',
                        'https://images.unsplash.com/photo-1515161318750-781d61c6b1ed',
                        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40',
                        'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f',
                        'https://images.unsplash.com/photo-151938995045f-429337ef1633',
                        'https://images.unsplash.com/photo-1531482615713-2afd69097998',
                        'https://images.unsplash.com/photo-1584697964190-7383cbee8277',
                        'https://images.unsplash.com/photo-1580582932707-520aed937b7b',
                        'https://images.unsplash.com/photo-1522071820081-009f0129c71c',
                        'https://images.unsplash.com/photo-1513258496099-48168024aec0',
                        'https://images.unsplash.com/photo-1497633762265-9d179a990aa6',
                        'https://images.unsplash.com/photo-1497215728101-856f4ea42174',
                        'https://images.unsplash.com/photo-1593642632823-8f785ba67e45',
                        'https://images.unsplash.com/photo-1550745165-9bc0b252726f',
                        'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e',
                        'https://images.unsplash.com/photo-1473649085228-583485e6e4d7',
                        'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae',
                    ].map((url, i) => (
                        <div key={i} className="aspect-[16/9] w-full rounded-[4px] overflow-hidden bg-[#181818] border border-transparent hover:border-white/50 transition-colors duration-300">
                            <img
                                src={`${url}?q=40&w=300&auto=format&fit=crop`}
                                alt=""
                                className="w-full h-full object-cover grayscale-[10%]"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {children}
        </div>
    );
};

export default AuthBackground;

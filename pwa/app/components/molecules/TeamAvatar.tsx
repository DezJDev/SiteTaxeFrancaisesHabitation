'use client'

import { useState } from 'react'

interface TeamAvatarProps {
    name: string
    img: string
    color: string
}

export default function TeamAvatar({ name, img, color }: TeamAvatarProps) {
    const [failed, setFailed] = useState(false)

    return (
        <div className="flex flex-col items-center gap-3">
            <div
                className="h-32 w-32 rounded-full flex items-center justify-center text-white text-xl font-bold overflow-hidden"
                style={{ backgroundColor: color }}
            >
                {failed ? name.slice(0, 2).toUpperCase() : <img src={img} alt={name} className="h-full w-full object-cover" onError={() => setFailed(true)} />}
            </div>
            <span className="text-sm text-[#b0afaf]">{name}</span>
        </div>
    )
}

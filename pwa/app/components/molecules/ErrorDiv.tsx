interface ErrorDivProps {
    message: string
}

export default function ErrorDiv({ message }: ErrorDivProps) {
    return (
        <div className="bg-red-900/30 border border-red-500/50 rounded px-4 py-3 text-sm text-red-400">
            {message}
        </div>
    )
}

import { useEffect } from "react";

type ConfirmModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
};

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message }: ConfirmModalProps) {
    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKey);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
        >
            <div
                className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 id="confirm-modal-title" className="text-lg font-bold">{title}</h3>
                <p className="text-sm text-slate-400">{message}</p>
                <div className="flex gap-3 justify-end pt-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => { onConfirm(); onClose(); }}
                        className="px-4 py-2 rounded-lg text-sm font-bold bg-red-600 text-white hover:bg-red-500 transition-colors"
                    >
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
}
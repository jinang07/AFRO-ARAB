import React from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    type?: 'danger' | 'info' | 'warning';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    title,
    message,
    confirmLabel,
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
    type = 'danger'
}) => {
    if (!isOpen) return null;

    const typeConfig = {
        danger: {
            bg: 'bg-rose-50',
            text: 'text-rose-600',
            icon: 'fa-triangle-exclamation',
            button: 'bg-rose-600 shadow-rose-200 hover:bg-rose-700'
        },
        warning: {
            bg: 'bg-amber-50',
            text: 'text-amber-600',
            icon: 'fa-circle-exclamation',
            button: 'bg-amber-600 shadow-amber-200 hover:bg-amber-700'
        },
        info: {
            bg: 'bg-blue-50',
            text: 'text-blue-600',
            icon: 'fa-circle-info',
            button: 'bg-blue-600 shadow-blue-200 hover:bg-blue-700'
        }
    };

    const config = typeConfig[type];

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8 text-center">
                    <div className={`w-16 h-16 ${config.bg} ${config.text} rounded-full flex items-center justify-center mx-auto mb-6 text-2xl`}>
                        <i className={`fa-solid ${config.icon}`}></i>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">
                        {title}
                    </h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">
                        {message}
                    </p>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={onConfirm}
                            className={`w-full py-4 ${config.button} text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg active:scale-[0.98] transition-all`}
                        >
                            {confirmLabel}
                        </button>
                        <button
                            onClick={onCancel}
                            className="w-full py-4 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-2xl font-black uppercase tracking-widest text-[10px] active:scale-[0.98] transition-all"
                        >
                            {cancelLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;

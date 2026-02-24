import React, { useState } from 'react';
import { Band, User } from '../types';
import { Button } from './Button';
import { Plus, Users, User as UserIcon, Copy, Check } from 'lucide-react';
import { createBand } from '../services/storageService';
import { useLanguage } from '../contexts/LanguageContext';

interface BandsViewProps {
    currentUser: User;
    userBands: Band[];
    currentWorkspaceId: string;
    onSwitchWorkspace: (id: string) => void;
    onBandCreated: (band: Band) => void;
}

export function BandsView({ currentUser, userBands, currentWorkspaceId, onSwitchWorkspace, onBandCreated }: BandsViewProps) {
    const { t } = useLanguage();
    const [isCreating, setIsCreating] = useState(false);
    const [newBandName, setNewBandName] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleCreateBand = async () => {
        if (!newBandName.trim()) return;
        const newBand: Band = {
            id: crypto.randomUUID(),
            name: newBandName,
            createdBy: currentUser.id,
            createdAt: Date.now(),
            members: [
                { userId: currentUser.id, role: 'ADMIN', joinedAt: Date.now() }
            ]
        };
        await createBand(newBand);
        onBandCreated(newBand);
        setIsCreating(false);
        setNewBandName('');
    };

    return (
        <div className="max-w-2xl mx-auto animate-in fade-in duration-500 pt-8">
            <h2 className="text-3xl font-bold mb-6 text-zinc-900 dark:text-white">Mis Bandas y Espacios</h2>

            <div className="space-y-4 mb-8">
                {/* Personal Workspace */}
                <div
                    onClick={() => onSwitchWorkspace(currentUser.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between
            ${currentWorkspaceId === currentUser.id
                            ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                            : 'border-zinc-200 dark:border-zinc-800 hover:border-brand-300 dark:hover:border-brand-700 bg-white dark:bg-zinc-900'
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                            <UserIcon className="text-zinc-500 dark:text-zinc-400" size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-zinc-900 dark:text-white">Espacio Personal</h3>
                            <p className="text-sm text-zinc-500">Solo tú puedes ver este contenido</p>
                        </div>
                    </div>
                    {currentWorkspaceId === currentUser.id && (
                        <div className="bg-brand-500 text-white text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">Activo</div>
                    )}
                </div>

                {/* Bands */}
                {userBands.map(band => (
                    <div
                        key={band.id}
                        className={`p-4 rounded-xl border-2 transition-all flex items-center justify-between
              ${currentWorkspaceId === band.id
                                ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                                : 'border-zinc-200 dark:border-zinc-800 hover:border-brand-300 dark:hover:border-brand-700 bg-white dark:bg-zinc-900'
                            }`}
                    >
                        <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => onSwitchWorkspace(band.id)}>
                            <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center">
                                <Users className="text-brand-600 dark:text-brand-400" size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-xl text-zinc-900 dark:text-white">{band.name}</h3>
                                <p className="text-sm text-zinc-500">{band.members.length} miembro(s)</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(`${window.location.origin}/?joinBand=${band.id}`);
                                    setCopiedId(band.id);
                                    setTimeout(() => setCopiedId(null), 2000);
                                }}
                                className="text-zinc-500 hover:text-brand-600 transition-colors flex items-center gap-2 text-sm font-medium"
                                title="Copiar Link de Invitación"
                            >
                                {copiedId === band.id ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                                <span className="hidden sm:inline">{copiedId === band.id ? '¡Copiado!' : 'Invitar'}</span>
                            </button>
                            {currentWorkspaceId === band.id && (
                                <div className="bg-brand-500 text-white text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">Activo</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {isCreating ? (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-xl p-6">
                    <h3 className="text-xl font-bold mb-4 text-zinc-900 dark:text-white">Crear Nueva Banda</h3>
                    <input
                        type="text"
                        placeholder="Nombre de la Banda (ej. Los Prisioneros)"
                        className="w-full p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 dark:text-white mb-6 focus:ring-2 focus:ring-brand-500 text-lg outline-none"
                        value={newBandName}
                        onChange={(e) => setNewBandName(e.target.value)}
                        autoFocus
                    />
                    <div className="flex gap-3 justify-end">
                        <Button variant="secondary" onClick={() => setIsCreating(false)}>Cancelar</Button>
                        <Button onClick={handleCreateBand} disabled={!newBandName.trim()}>Crear Banda</Button>
                    </div>
                </div>
            ) : (
                <Button onClick={() => setIsCreating(true)} className="w-full gap-2 py-8 border-dashed border-2 bg-transparent text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 text-lg">
                    <Plus /> Crear Nueva Banda
                </Button>
            )}
        </div>
    );
}

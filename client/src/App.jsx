import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
    Plus, Search, Edit2, Trash2, X, Link as LinkIcon,
    BookOpen, Layers, ArrowLeft, ArrowRight, RotateCcw,
    ChevronRight, ExternalLink, Volume2, Sparkles, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = '/api/words';

const App = () => {
    const [words, setWords] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingWord, setEditingWord] = useState(null);
    const [view, setView] = useState('list'); // 'list' or 'study'
    const [selectedLetter, setSelectedLetter] = useState(null);
    const [isAutoFilling, setIsAutoFilling] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        word: '',
        translation: '',
        pronunciation: '',
        caseUses: '',
        relatedIds: []
    });

    const [error, setError] = useState('');

    useEffect(() => {
        fetchWords();
    }, []);

    const fetchWords = async () => {
        try {
            const response = await axios.get(API_URL);
            setWords(response.data);
        } catch (err) {
            console.error('Error fetching words:', err);
        }
    };

    const filteredWords = useMemo(() => {
        let filtered = words;

        // Filter by Search Term
        if (searchTerm) {
            filtered = filtered.filter(w =>
                w.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
                w.translation.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by Initial Letter
        if (selectedLetter) {
            filtered = filtered.filter(w =>
                w.word.toLowerCase().startsWith(selectedLetter.toLowerCase())
            );
        }

        // Sort alphabetically
        return [...filtered].sort((a, b) => a.word.localeCompare(b.word));
    }, [words, searchTerm, selectedLetter]);

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    const handleAutoFill = async () => {
        if (!formData.word) {
            setError('Digite uma palavra primeiro para usar a Inteligência!');
            return;
        }

        setIsAutoFilling(true);
        setError('');

        try {
            // 1. Get Translation (MyMemory API - Free, no key)
            const translationPromise = axios.get(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(formData.formData || formData.word)}&langpair=en|pt`);

            // 2. Get Phonetics and Examples (Free Dictionary API - Free, no key)
            const dictionaryPromise = axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${formData.word.toLowerCase()}`);

            const [transRes, dictRes] = await Promise.allSettled([translationPromise, dictionaryPromise]);

            let suggestedTranslation = '';
            let suggestedPronunciation = '';
            let suggestedExample = '';

            if (transRes.status === 'fulfilled') {
                suggestedTranslation = transRes.value.data.responseData.translatedText;
            }

            if (dictRes.status === 'fulfilled') {
                const data = dictRes.value.data[0];
                suggestedPronunciation = data.phonetic || (data.phonetics && data.phonetics.find(p => p.text)?.text) || '';

                // Try to find an example in meanings
                const meaningWithExample = data.meanings.find(m => m.definitions.some(d => d.example));
                if (meaningWithExample) {
                    suggestedExample = meaningWithExample.definitions.find(d => d.example).example;
                } else if (data.meanings[0]?.definitions[0]?.definition) {
                    suggestedExample = data.meanings[0].definitions[0].definition;
                }
            }

            setFormData(prev => ({
                ...prev,
                translation: suggestedTranslation || prev.translation,
                pronunciation: suggestedPronunciation || prev.pronunciation,
                caseUses: suggestedExample || prev.caseUses
            }));

        } catch (err) {
            console.error('AutoFill error:', err);
            setError('Não foi possível buscar dados automaticamente. Tente preencher manualmente.');
        } finally {
            setIsAutoFilling(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (editingWord) {
                await axios.put(`${API_URL}/${editingWord.id}`, formData);
            } else {
                await axios.post(API_URL, formData);
            }
            fetchWords();
            closeModal();
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this word?')) {
            try {
                await axios.delete(`${API_URL}/${id}`);
                fetchWords();
            } catch (err) {
                console.error('Error deleting word:', err);
            }
        }
    };

    const openModal = (word = null) => {
        if (word) {
            setEditingWord(word);
            setFormData({
                word: word.word,
                translation: word.translation,
                pronunciation: word.pronunciation || '',
                caseUses: word.caseUses,
                relatedIds: word.relatedIds || []
            });
        } else {
            setEditingWord(null);
            setFormData({ word: '', translation: '', pronunciation: '', caseUses: '', relatedIds: [] });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingWord(null);
        setError('');
    };

    const toggleRelated = (id) => {
        setFormData(prev => ({
            ...prev,
            relatedIds: prev.relatedIds.includes(id)
                ? prev.relatedIds.filter(rid => rid !== id)
                : [...prev.relatedIds, id]
        }));
    };

    return (
        <div className="container">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', background: 'linear-gradient(to right, #6366f1, #059669)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        LinguaLink
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>Sua biblioteca pessoal de palavras</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className={`btn ${view === 'list' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('list')}>
                        <BookOpen size={20} /> Dicionário
                    </button>
                    <button className={`btn ${view === 'study' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('study')}>
                        <Layers size={20} /> Estudar
                    </button>
                </div>
            </header>

            {view === 'list' ? (
                <>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
                            <input
                                type="text"
                                placeholder="Filtrar por palavra ou tradução..."
                                style={{ paddingLeft: '3rem' }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="btn btn-primary" onClick={() => openModal()}>
                            <Plus size={20} /> Adicionar Palavra
                        </button>
                    </div>

                    <div className="alphabet-filter">
                        <button
                            className={`letter-btn ${selectedLetter === null ? 'active' : ''}`}
                            onClick={() => setSelectedLetter(null)}
                        >
                            Todos
                        </button>
                        {alphabet.map(letter => (
                            <button
                                key={letter}
                                className={`letter-btn ${selectedLetter === letter ? 'active' : ''}`}
                                onClick={() => setSelectedLetter(selectedLetter === letter ? null : letter)}
                            >
                                {letter}
                            </button>
                        ))}
                    </div>

                    <div className="word-list-container">
                        <div className="word-row-header">
                            <div>Palavra / Pronúncia</div>
                            <div>Tradução</div>
                            <div className="header-usage">Exemplos / Relacionados</div>
                            <div style={{ textAlign: 'right' }}>Ações</div>
                        </div>
                        <AnimatePresence>
                            {filteredWords.map(word => (
                                <WordRow
                                    key={word.id}
                                    word={word}
                                    allWords={words}
                                    onEdit={() => openModal(word)}
                                    onDelete={() => handleDelete(word.id)}
                                    onLinkClick={(id) => setSearchTerm(words.find(w => w.id === id)?.word || '')}
                                />
                            ))}
                        </AnimatePresence>
                        {filteredWords.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                Nenhuma palavra encontrada.
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <StudySession words={words} />
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="modal-overlay" onClick={closeModal}>
                        <motion.div
                            className="modal-content glass"
                            onClick={e => e.stopPropagation()}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                <h2>{editingWord ? 'Editar Palavra' : 'Nova Palavra'}</h2>
                                <button onClick={closeModal} style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}>
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div style={{ background: '#f0f4ff', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #dbeafe', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: '#1e40af' }}>Palavra em Inglês</label>
                                        <input
                                            required
                                            value={formData.word}
                                            onChange={e => setFormData({ ...formData, word: e.target.value })}
                                            placeholder="Ex: Awesome"
                                            style={{ border: '1px solid #bfdbfe' }}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={handleAutoFill}
                                        disabled={isAutoFilling}
                                        style={{ height: '42px', marginTop: '1.4rem', whiteSpace: 'nowrap' }}
                                    >
                                        {isAutoFilling ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                                        Mágica
                                    </button>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>Pronúncia</label>
                                        <input
                                            value={formData.pronunciation}
                                            onChange={e => setFormData({ ...formData, pronunciation: e.target.value })}
                                            placeholder="Ex: /meɪk/"
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>Tradução</label>
                                        <input
                                            required
                                            value={formData.translation}
                                            onChange={e => setFormData({ ...formData, translation: e.target.value })}
                                            placeholder="Ex: Incrível"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>Exemplos de uso</label>
                                    <textarea
                                        rows="2"
                                        value={formData.caseUses}
                                        onChange={e => setFormData({ ...formData, caseUses: e.target.value })}
                                        placeholder="Ex: This software is awesome."
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>
                                        <LinkIcon size={12} style={{ marginRight: '4px' }} /> Relacionados
                                    </label>
                                    <div style={{ maxHeight: '100px', overflowY: 'auto', padding: '0.5rem', background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                        {words.filter(w => w.id !== editingWord?.id).map(w => (
                                            <span
                                                key={w.id}
                                                className="related-tag"
                                                onClick={() => toggleRelated(w.id)}
                                                style={{
                                                    background: formData.relatedIds.includes(w.id) ? 'var(--primary)' : '#eef2ff',
                                                    color: formData.relatedIds.includes(w.id) ? 'white' : 'var(--primary)',
                                                    padding: '0.2rem 0.5rem',
                                                    fontSize: '0.7rem'
                                                }}
                                            >
                                                {w.word}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {error && <p style={{ color: 'var(--error)', fontSize: '0.9rem' }}>{error}</p>}

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                        {editingWord ? 'Salvar' : 'Adicionar'}
                                    </button>
                                    <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const WordRow = ({ word, allWords, onEdit, onDelete, onLinkClick }) => {
    const relatedWords = allWords.filter(w => word.relatedIds?.includes(w.id));

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="word-row"
        >
            <div className="col-word">
                <div>{word.word}</div>
                {word.pronunciation && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Volume2 size={12} /> {word.pronunciation}
                    </div>
                )}
            </div>
            <div className="col-translation">{word.translation}</div>
            <div className="col-usage">
                <div style={{ marginBottom: word.relatedIds?.length > 0 ? '4px' : '0' }}>
                    {word.caseUses || <span style={{ fontStyle: 'italic', color: '#cbd5e1' }}>Sem exemplo</span>}
                </div>
                {relatedWords.length > 0 && (
                    <div className="related-in-list">
                        {relatedWords.map(rw => (
                            <span key={rw.id} className="related-tag-small" onClick={() => onLinkClick(rw.id)} style={{ cursor: 'pointer' }}>
                                {rw.word}
                            </span>
                        ))}
                    </div>
                )}
            </div>
            <div className="col-actions">
                <button className="btn btn-secondary" style={{ padding: '0.4rem' }} onClick={onEdit}>
                    <Edit2 size={14} />
                </button>
                <button className="btn btn-danger" style={{ padding: '0.4rem' }} onClick={onDelete}>
                    <Trash2 size={14} />
                </button>
            </div>
        </motion.div>
    );
};

const StudySession = ({ words }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [sessionWords, setSessionWords] = useState([]);

    useEffect(() => {
        // Shuffle words for study session
        setSessionWords([...words].sort(() => Math.random() - 0.5));
    }, [words]);

    if (words.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
                <h2>Nenhuma palavra para estudar.</h2>
                <p>Adicione algumas palavras ao dicionário primeiro!</p>
            </div>
        );
    }

    const currentWord = sessionWords[currentIndex];

    const nextCard = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % sessionWords.length);
        }, 150);
    };

    const prevCard = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + sessionWords.length) % sessionWords.length);
        }, 150);
    };

    return (
        <div className="study-container">
            <div style={{ textAlign: 'center' }}>
                <h3>Sessão de Estudo</h3>
                <p style={{ color: 'var(--text-muted)' }}>Card {currentIndex + 1} de {sessionWords.length}</p>
            </div>

            <div className={`flashcard ${isFlipped ? 'flipped' : ''}`} onClick={() => setIsFlipped(!isFlipped)}>
                <div className="flashcard-inner">
                    <div className="flashcard-front glass">
                        <span style={{ fontSize: '0.8rem', color: 'var(--primary)', marginBottom: '1rem' }}>PALAVRA</span>
                        <h2 style={{ fontSize: '3rem' }}>{currentWord?.word}</h2>
                        {currentWord?.pronunciation && (
                            <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '0.5rem' }}>
                                <Volume2 size={16} /> {currentWord.pronunciation}
                            </p>
                        )}
                        <p style={{ marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Clique para ver a tradução</p>
                    </div>
                    <div className="flashcard-back glass">
                        <span style={{ fontSize: '0.8rem', color: 'var(--accent)', marginBottom: '1rem' }}>TRADUÇÃO</span>
                        <h2 style={{ fontSize: '2.5rem', color: 'var(--accent)' }}>{currentWord?.translation}</h2>
                        {currentWord?.caseUses && (
                            <p style={{ marginTop: '1.5rem', fontSize: '1rem' }}>
                                <em style={{ color: 'var(--text-muted)' }}>"{currentWord.caseUses}"</em>
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
                <button className="btn btn-secondary" onClick={prevCard}>
                    <ArrowLeft size={20} /> Anterior
                </button>
                <button className="btn btn-secondary" onClick={() => setIsFlipped(!isFlipped)}>
                    <RotateCcw size={20} /> Virar
                </button>
                <button className="btn btn-primary" onClick={nextCard}>
                    Próximo <ArrowRight size={20} />
                </button>
            </div>
        </div>
    );
};

export default App;

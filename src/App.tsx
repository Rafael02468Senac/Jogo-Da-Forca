import { useState, useEffect, useCallback, useRef } from 'react'

// ─── Data ─────────────────────────────────────────────────────────────────────

const WORDS_FREE = [
  'FILA', 'GRAFO', 'PILHA', 'VETOR', 'ARRAY', 'REDE', 'FORCA',
  'CLASSE', 'OBJETO', 'MÓDULO', 'MATRIZ', 'CURSOR', 'ÁRVORE',
  'MÉTODO', 'FUNÇÃO', 'TECLADO', 'MONITOR', 'SISTEMA', 'CLIENTE',
  'PROGRAMA', 'SOFTWARE', 'HARDWARE', 'TERMINAL', 'DEPURADOR',
  'RECURSÃO', 'ITERAÇÃO', 'PONTEIRO', 'BINÁRIO', 'DECIMAL',
  'DIGITAL', 'DADOS', 'CÓDIGO', 'PACOTE', 'SERVIDOR',
  'ALGORITMO', 'VARIÁVEL', 'COMPONENTE', 'INTERFACE', 'LINGUAGEM',
  'NAVEGADOR', 'BIBLIOTECA', 'FRAMEWORK', 'TECNOLOGIA', 'COMPILADOR',
  'PROTOCOLO', 'JAVASCRIPT', 'PROGRAMAÇÃO', 'HEXADECIMAL',
  'COMPUTADOR', 'AUTENTICAÇÃO', 'CRIPTOGRAFIA', 'CÓDIGO-FONTE',
  'DESENVOLVEDOR', 'IMPLEMENTAÇÃO', 'SINCRONIZAÇÃO', 'PROCESSAMENTO',
  'ARMAZENAMENTO', 'INTERPRETADOR', 'INFRAESTRUTURA', 'ENCAPSULAMENTO',
  'DESENVOLVIMENTO', 'PARÂMETRO', 'SEQUÊNCIA', 'MEMÓRIA', 'CONEXÃO',
  'ACESSO À REDE',
]

const BODY_PARTS = [
  { id:  1, name: 'Cabeça' },
  { id:  2, name: 'Corpo' },
  { id:  3, name: 'Braço e mão esquerda' },
  { id:  4, name: 'Braço e mão direita' },
  { id:  5, name: 'Perna e pé esquerdo' },
  { id:  6, name: 'Perna e pé direito' },
  { id:  7, name: 'Cabelo' },
  { id:  8, name: 'Sobrancelhas' },
  { id:  9, name: 'Olhos' },
  { id: 10, name: 'Orelhas' },
  { id: 11, name: 'Nariz' },
  { id: 12, name: 'Boca' },
]

const KEYBOARD_ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L','Ç'],
  ['Z','X','C','V','B','N','M'],
]

const MIN_ERRORS = 6
const MAX_ERRORS_CAP = 12

function pickRandom(pool: string[]): string {
  return pool[Math.floor(Math.random() * pool.length)]
}

function getGuessKey(character: string): string {
  const upper = character.toUpperCase()
  if (upper === 'Ç') return upper
  return upper.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function isGuessableCharacter(character: string): boolean {
  return /^[A-ZÀ-ÜÇ]$/.test(character)
}

function getWordGuessKeys(word: string): Set<string> {
  return new Set(
    [...word]
      .filter(isGuessableCharacter)
      .map(getGuessKey),
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function GearIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  )
}

// ─── Hangman (12 stages) ──────────────────────────────────────────────────────

function HangmanDrawing({ errors, small = false }: { errors: number; small?: boolean }) {
  const show = (n: number) => errors >= n
  const s = '#d4c8b8'

  return (
    <svg
      viewBox="0 0 220 270"
      width={small ? 128 : 220}
      height={small ? 157 : 270}
      aria-label={`Forca: ${errors} erro(s)`}
    >
      {/* Gallows */}
      <line x1="10"  y1="262" x2="210" y2="262" stroke="#5a4a38" strokeWidth="6" strokeLinecap="round"/>
      <line x1="54"  y1="262" x2="54"  y2="12"  stroke="#5a4a38" strokeWidth="6" strokeLinecap="round"/>
      <line x1="54"  y1="12"  x2="160" y2="12"  stroke="#5a4a38" strokeWidth="6" strokeLinecap="round"/>
      <line x1="160" y1="12"  x2="160" y2="44"  stroke="#8a7060" strokeWidth="3" strokeLinecap="round"/>

      {/* 1 — Cabeça */}
      {show(1)  && <circle cx="160" cy="64" r="20" stroke={s} strokeWidth="3" fill="none" className="part-appear"/>}
      {/* 2 — Corpo */}
      {show(2)  && <line x1="160" y1="84" x2="160" y2="152" stroke={s} strokeWidth="3" strokeLinecap="round" className="part-appear"/>}
      {/* 3 — Braço e mão esquerda */}
      {show(3)  && <>
        <line x1="160" y1="100" x2="124" y2="132" stroke={s} strokeWidth="3" strokeLinecap="round" className="part-appear"/>
        <line x1="124" y1="132" x2="114" y2="124" stroke={s} strokeWidth="2" strokeLinecap="round" className="part-appear"/>
        <line x1="124" y1="132" x2="112" y2="132" stroke={s} strokeWidth="2" strokeLinecap="round" className="part-appear"/>
        <line x1="124" y1="132" x2="114" y2="140" stroke={s} strokeWidth="2" strokeLinecap="round" className="part-appear"/>
      </>}
      {/* 4 — Braço e mão direita */}
      {show(4)  && <>
        <line x1="160" y1="100" x2="196" y2="132" stroke={s} strokeWidth="3" strokeLinecap="round" className="part-appear"/>
        <line x1="196" y1="132" x2="206" y2="124" stroke={s} strokeWidth="2" strokeLinecap="round" className="part-appear"/>
        <line x1="196" y1="132" x2="208" y2="132" stroke={s} strokeWidth="2" strokeLinecap="round" className="part-appear"/>
        <line x1="196" y1="132" x2="206" y2="140" stroke={s} strokeWidth="2" strokeLinecap="round" className="part-appear"/>
      </>}
      {/* 5 — Perna e pé esquerdo */}
      {show(5)  && <>
        <line x1="160" y1="152" x2="124" y2="198" stroke={s} strokeWidth="3" strokeLinecap="round" className="part-appear"/>
        <line x1="124" y1="198" x2="106" y2="205" stroke={s} strokeWidth="2.5" strokeLinecap="round" className="part-appear"/>
      </>}
      {/* 6 — Perna e pé direito */}
      {show(6)  && <>
        <line x1="160" y1="152" x2="196" y2="198" stroke={s} strokeWidth="3" strokeLinecap="round" className="part-appear"/>
        <line x1="196" y1="198" x2="214" y2="205" stroke={s} strokeWidth="2.5" strokeLinecap="round" className="part-appear"/>
      </>}

      {/* 7 — Cabelo */}
      {show(7)  && <>
        <line x1="152" y1="46" x2="148" y2="36" stroke={s} strokeWidth="2" strokeLinecap="round" className="part-appear"/>
        <line x1="157" y1="44" x2="155" y2="34" stroke={s} strokeWidth="2" strokeLinecap="round" className="part-appear"/>
        <line x1="163" y1="44" x2="163" y2="34" stroke={s} strokeWidth="2" strokeLinecap="round" className="part-appear"/>
        <line x1="168" y1="46" x2="172" y2="36" stroke={s} strokeWidth="2" strokeLinecap="round" className="part-appear"/>
      </>}

      {/* 8 — Sobrancelhas */}
      {show(8) && <>
        <path d="M148,56 Q153,52 158,56" stroke={s} strokeWidth="2" fill="none" strokeLinecap="round" className="part-appear"/>
        <path d="M162,56 Q167,52 172,56" stroke={s} strokeWidth="2" fill="none" strokeLinecap="round" className="part-appear"/>
      </>}
      {/* 9 — Olhos */}
      {show(9) && <>
        <path d="M149,58 L157,66 M157,58 L149,66" stroke={s} strokeWidth="2" strokeLinecap="round" className="part-appear"/>
        <path d="M163,58 L171,66 M171,58 L163,66" stroke={s} strokeWidth="2" strokeLinecap="round" className="part-appear"/>
      </>}
      {/* 10 — Orelhas */}
      {show(10) && <>
        <ellipse cx="139" cy="64" rx="5" ry="7" stroke={s} strokeWidth="2" fill="none" className="part-appear"/>
        <ellipse cx="181" cy="64" rx="5" ry="7" stroke={s} strokeWidth="2" fill="none" className="part-appear"/>
      </>}
      {/* 11 — Nariz */}
      {show(11) && <path d="M156,70 L160,63 L164,70 M156,70 Q160,72 164,70" stroke={s} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" className="part-appear"/>}
      {/* 12 — Boca */}
      {show(12) && <path d="M153,80 Q160,72 167,80" stroke={s} strokeWidth="2" fill="none" strokeLinecap="round" className="part-appear"/>}
    </svg>
  )
}

// ─── Settings modal ───────────────────────────────────────────────────────────

function SettingsModal({
  maxErrors,
  onChange,
  onClose,
}: {
  maxErrors: number
  onChange: (v: number) => void
  onClose: () => void
}) {
  const dec = () => onChange(Math.max(MIN_ERRORS, maxErrors - 1))
  const inc = () => onChange(Math.min(MAX_ERRORS_CAP, maxErrors + 1))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const progress = ((maxErrors - MIN_ERRORS) / (MAX_ERRORS_CAP - MIN_ERRORS)) * 100

  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#765844] border border-[#5a402f] rounded-2xl w-full max-w-[420px] max-h-[92vh] overflow-y-auto shadow-2xl shadow-black/20"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#5a402f]">
          <div className="flex items-center gap-3">
            <span className="text-[#e0d2c5]"><GearIcon /></span>
            <h2 className="font-display text-xl font-bold text-[#e8dcc8]">Configurações</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#d2c0b1] hover:text-[#f5eee5] hover:bg-[#604635] transition-colors"
            aria-label="Fechar"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="1" y1="1" x2="13" y2="13"/><line x1="13" y1="1" x2="1" y2="13"/>
            </svg>
          </button>
        </div>

        {/* Error limit control */}
        <div className="px-6 py-6 border-b border-[#5a402f]">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#d2c0b1] mb-5">Limite de erros</p>

          <div className="flex items-center justify-between gap-4 mb-5">
            <button
              onClick={dec}
              disabled={maxErrors === MIN_ERRORS}
              className="w-11 h-11 rounded-xl border border-[#9c806d] text-[#f5eee5] font-bold text-xl hover:bg-[#604635] hover:border-[#c4aa97] disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              −
            </button>

            <div className="text-center">
              <p className="font-mono text-6xl font-bold text-[#d4a017] leading-none">{maxErrors}</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#d2c0b1] mt-2">
                {maxErrors === MIN_ERRORS ? 'mínimo' : maxErrors === MAX_ERRORS_CAP ? 'máximo' : 'erros permitidos'}
              </p>
            </div>

            <button
              onClick={inc}
              disabled={maxErrors === MAX_ERRORS_CAP}
              className="w-11 h-11 rounded-xl border border-[#9c806d] text-[#f5eee5] font-bold text-xl hover:bg-[#604635] hover:border-[#c4aa97] disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              +
            </button>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-[#604635] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#d4a017] rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="font-mono text-[9px] text-[#cbb7a8]">{MIN_ERRORS} (mín.)</span>
            <span className="font-mono text-[9px] text-[#cbb7a8]">{MAX_ERRORS_CAP} (máx.)</span>
          </div>
        </div>

        {/* Body parts list */}
        <div className="px-6 py-5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#d2c0b1] mb-3">Partes do boneco</p>
          <div className="grid grid-cols-2 gap-1.5">
            {BODY_PARTS.map(part => {
              const active = part.id <= maxErrors
              return (
                <div
                  key={part.id}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs border transition-colors ${
                    active
                      ? 'bg-[#0d2418] text-[#5a9e6f] border-[#1a4028]'
                      : 'bg-[#110f0c] text-[#3a3025] border-[#1e1c18]'
                  }`}
                >
                  <span className="font-mono text-[10px] shrink-0 opacity-60">{String(part.id).padStart(2, '0')}</span>
                  <span className="truncate">{part.name}</span>
                  <span className="ml-auto shrink-0 font-mono text-[10px]">{active ? '✓' : '·'}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main menu ────────────────────────────────────────────────────────────────

function MainMenu({
  onStart,
  maxErrors,
  onChangeMaxErrors,
}: {
  onStart: () => void
  maxErrors: number
  onChangeMaxErrors: (v: number) => void
}) {
  const [showSettings, setShowSettings] = useState(false)

  return (
    <div className="min-h-screen bg-[#dedbd6] flex flex-col items-center justify-center px-6 py-12 select-none">

      {/* Gear button — fixed top-right */}
      <button
        onClick={() => setShowSettings(true)}
        className="fixed top-5 right-5 w-9 h-9 flex items-center justify-center rounded-xl border border-[#a58f7d] text-[#665143] hover:text-[#f5eee5] hover:border-[#765844] hover:bg-[#765844] transition-all focus-visible:outline-2 focus-visible:outline-[#d4a017]"
        aria-label="Configurações"
      >
        <GearIcon />
      </button>

      {/* Decorative gallows */}
      <div className="opacity-35 mb-2">
        <HangmanDrawing errors={0} small />
      </div>

      <h1 className="font-display text-6xl font-black text-[#3b2d24] tracking-tight leading-none mb-2 text-center">
        Jogo da Forca
      </h1>
      <p className="font-mono text-[#705b4d] text-xs uppercase tracking-widest mb-14 text-center">
        Adivinhe a palavra antes de ser tarde demais
      </p>

      {/* Decorative blanks */}
      <div className="flex gap-2 mb-16">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div className="w-7 h-6" />
            <div className="h-px w-7 bg-[#9e8876]" />
          </div>
        ))}
      </div>

      {/* Mode card */}
      <div className="w-full max-w-sm">
        <div className="border border-[#604635] rounded-2xl bg-[#765844] overflow-hidden shadow-lg shadow-[#604635]/15">
          <div className="border-b border-[#604635] px-6 py-5">
            <div className="flex items-center gap-3 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-[#d4a017] shrink-0" />
              <h2 className="font-display text-2xl font-bold text-[#e8dcc8]">Jogo Livre</h2>
            </div>
            <p className="text-[#e0d2c5] text-sm leading-relaxed pl-5">
              Palavras aleatórias de 4 a 15 letras. Adivinhe antes de errar{' '}
              <span className="text-[#d4a017] font-bold">{maxErrors}</span>{' '}
              {maxErrors === 1 ? 'vez' : 'vezes'}.
            </p>
          </div>
          <div className="px-6 py-4 flex items-center justify-between">
            <span className="font-mono text-xs text-[#d2c0b1] uppercase tracking-widest">
              {WORDS_FREE.length} palavras · {maxErrors} erros
            </span>
            <button
              onClick={onStart}
              className="px-6 py-2.5 bg-[#d4a017] text-[#0c0b09] font-bold text-sm rounded-lg uppercase tracking-widest hover:bg-[#e0b030] active:scale-95 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-[#d4a017]"
            >
              Jogar
            </button>
          </div>
        </div>
      </div>

      <p className="mt-10 font-mono text-[#705b4d] text-[10px] uppercase tracking-widest">
        Teclado físico ou virtual — ambos funcionam
      </p>

      {showSettings && (
        <SettingsModal
          maxErrors={maxErrors}
          onChange={onChangeMaxErrors}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}

// ─── Game ─────────────────────────────────────────────────────────────────────

type GameStatus = 'playing' | 'won' | 'lost'

function Game({
  onBack,
  maxErrors,
  onChangeMaxErrors,
}: {
  onBack: () => void
  maxErrors: number
  onChangeMaxErrors: (v: number) => void
}) {
  const [secretWord, setSecretWord]         = useState<string>(() => pickRandom(WORDS_FREE))
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set())
  const [gameStatus, setGameStatus]         = useState<GameStatus>('playing')
  const [statusMessage, setStatusMessage]   = useState('Adivinhe a palavra — boa sorte!')
  const [shakeTrigger, setShakeTrigger]     = useState(0)
  const [showSettings, setShowSettings]     = useState(false)

  const wordGuessKeys = getWordGuessKeys(secretWord)
  const wrongCount = [...guessedLetters].filter(l => !wordGuessKeys.has(l)).length

  // If maxErrors is reduced mid-game and current wrongs exceed new limit → lose
  useEffect(() => {
    if (gameStatus === 'playing' && wrongCount >= maxErrors) {
      setGameStatus('lost')
      setStatusMessage(`Você perdeu. A palavra era "${secretWord}".`)
    }
  }, [maxErrors, wrongCount, gameStatus, secretWord])

  const handleGuess = useCallback((raw: string) => {
    if (gameStatus !== 'playing') return
    const letter = getGuessKey(raw)
    if (!/^[A-ZÇ]$/.test(letter)) return
    if (guessedLetters.has(letter)) {
      setStatusMessage(`A letra "${letter}" já foi utilizada.`)
      setShakeTrigger(n => n + 1)
      return
    }
    const next = new Set([...guessedLetters, letter])
    setGuessedLetters(next)
    const guessKeys = getWordGuessKeys(secretWord)
    if (guessKeys.has(letter)) {
      if ([...guessKeys].every(key => next.has(key))) {
        setGameStatus('won')
        setStatusMessage('Parabéns! Você descobriu a palavra!')
      } else {
        setStatusMessage(`Boa! "${letter}" está na palavra.`)
      }
    } else {
      const newWrong = [...next].filter(l => !guessKeys.has(l)).length
      if (newWrong >= maxErrors) {
        setGameStatus('lost')
        setStatusMessage(`Você perdeu. A palavra era "${secretWord}".`)
      } else {
        setStatusMessage(`"${letter}" não está na palavra. +1 erro.`)
      }
    }
  }, [secretWord, guessedLetters, gameStatus, maxErrors])

  const newGame = useCallback(() => {
    setSecretWord(pickRandom(WORDS_FREE))
    setGuessedLetters(new Set())
    setGameStatus('playing')
    setStatusMessage('Nova partida! Adivinhe a palavra.')
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey || showSettings) return
      handleGuess(e.key)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleGuess, showSettings])

  const statusRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (shakeTrigger === 0) return
    const el = statusRef.current
    if (!el) return
    el.classList.remove('shake')
    void el.offsetWidth
    el.classList.add('shake')
  }, [shakeTrigger])

  const displayLength = secretWord.length
  const letterCount = [...secretWord].filter(isGuessableCharacter).length
  const slotSize = displayLength >= 13 ? 'w-6 text-base' : displayLength >= 10 ? 'w-7 text-lg' : 'w-8 text-2xl'
  const barW     = displayLength >= 13 ? 'w-6' : displayLength >= 10 ? 'w-7' : 'w-8'
  const gapX     = displayLength >= 13 ? 'gap-x-1' : 'gap-x-2'

  return (
    <div className="min-h-screen bg-[#dedbd6] text-[#3b2d24] flex flex-col items-center justify-start pt-8 pb-12 px-4">

      {/* Top bar */}
      <div className="w-full max-w-3xl flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#665143] hover:text-[#3b2d24] font-mono text-xs uppercase tracking-widest transition-colors rounded focus-visible:outline-2 focus-visible:outline-[#d4a017]"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Menu
        </button>

        <div className="text-center">
          <h1 className="font-display text-2xl font-black text-[#3b2d24] leading-none">Jogo da Forca</h1>
          <p className="font-mono text-[#705b4d] text-[10px] uppercase tracking-widest mt-0.5">Jogo Livre</p>
        </div>

        <button
          onClick={() => setShowSettings(true)}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#a58f7d] text-[#665143] hover:text-[#f5eee5] hover:border-[#765844] hover:bg-[#765844] transition-all focus-visible:outline-2 focus-visible:outline-[#d4a017]"
          aria-label="Configurações"
        >
          <GearIcon />
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 items-center lg:items-start w-full max-w-3xl">

        {/* Gallows + errors */}
        <div className="flex flex-col items-center gap-4 shrink-0">
          <div className="bg-[#765844] border border-[#604635] rounded-xl p-5 shadow-lg shadow-[#604635]/15">
            <HangmanDrawing errors={wrongCount} />
          </div>
          <div className="text-center">
            <p className="text-[#705b4d] text-[10px] uppercase tracking-widest font-mono mb-1">Erros</p>
            <p className="font-mono text-2xl font-bold">
              <span className={
                wrongCount === 0              ? 'text-[#5a9e6f]'
                : wrongCount >= maxErrors - 1 ? 'text-[#c0392b]'
                : 'text-[#d4a017]'
              }>
                {wrongCount}
              </span>
              <span className="text-[#705b4d]"> / {maxErrors}</span>
            </p>
            {/* Error pips — wraps for larger limits */}
            <div className="flex flex-wrap justify-center gap-1 mt-2 max-w-[128px]">
              {Array.from({ length: maxErrors }, (_, i) => (
                <div key={i} className={`w-2 h-1.5 rounded-full transition-colors duration-300 ${i < wrongCount ? 'bg-[#c0392b]' : 'bg-[#b8aaa0]'}`} />
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex flex-col items-center gap-6 flex-1 w-full min-w-0">

          {/* Status */}
          <div ref={statusRef} className={`w-full text-center py-2.5 px-5 rounded-lg text-sm font-medium border transition-colors duration-300 ${
            gameStatus === 'won'  ? 'bg-[#0d2418] border-[#1a5c35] text-[#5a9e6f]'
            : gameStatus === 'lost' ? 'bg-[#1c0a0a] border-[#5c1a1a] text-[#c0392b]'
            : 'bg-[#eee8e1] border-[#c9b8aa] text-[#665143]'
          }`}>
            {statusMessage}
          </div>

          {/* Word display */}
          <div className={`flex flex-wrap justify-center ${gapX} gap-y-4`}>
            {secretWord.split('').map((letter, i) => {
              const guessable = isGuessableCharacter(letter)
              const guessed = guessable && guessedLetters.has(getGuessKey(letter))
              const visible = !guessable || guessed || gameStatus !== 'playing'
              return (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <span className={`font-mono font-bold text-center select-none transition-colors duration-200 ${slotSize} ${
                    !guessable ? 'text-[#3b2d24]'
                    : visible ? (guessed ? 'text-[#3b2d24]' : 'text-[#c0392b]')
                    : 'text-transparent'
                  }`}>
                    {letter}
                  </span>
                  <div className={`h-0.5 ${barW} rounded-full transition-colors duration-300 ${
                    !guessable ? 'bg-transparent'
                    : visible ? (guessed ? 'bg-[#5a9e6f]' : 'bg-[#c0392b]')
                    : 'bg-[#8f7766]'
                  }`} />
                </div>
              )
            })}
          </div>

          <p className="font-mono text-[#705b4d] text-[10px] uppercase tracking-widest">
            {letterCount} letra{letterCount !== 1 ? 's' : ''}
          </p>

          {/* Used letters */}
          {guessedLetters.size > 0 && (
            <div className="w-full">
              <p className="text-center text-[#705b4d] text-[10px] uppercase tracking-widest font-mono mb-2.5">
                Letras utilizadas
              </p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {[...guessedLetters].sort().map(letter => {
                  const correct = wordGuessKeys.has(letter)
                  return (
                    <span key={letter} className={`inline-flex items-center justify-center w-8 h-8 rounded font-mono text-sm font-bold border ${
                      correct
                        ? 'bg-[#0d2418] text-[#5a9e6f] border-[#1a5c35]'
                        : 'bg-[#1c0a0a] text-[#c0392b] border-[#3d1515]'
                    }`}>
                      {letter}
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          {/* Keyboard / end state */}
          {gameStatus === 'playing' ? (
            <div className="flex flex-col items-center gap-1.5">
              {KEYBOARD_ROWS.map((row, ri) => (
                <div key={ri} className="flex gap-1.5">
                  {row.map(letter => {
                    const used    = guessedLetters.has(letter)
                    const correct = used && wordGuessKeys.has(letter)
                    const wrong   = used && !wordGuessKeys.has(letter)
                    return (
                      <button
                        key={letter}
                        onClick={() => handleGuess(letter)}
                        disabled={used}
                        aria-label={`Letra ${letter}`}
                        className={`w-9 h-10 rounded font-mono text-sm font-bold border transition-all duration-150 focus-visible:outline-2 focus-visible:outline-[#d4a017] ${
                          correct ? 'bg-[#0d2418] text-[#5a9e6f] border-[#1a5c35] cursor-default'
                          : wrong  ? 'bg-[#120808] text-[#4a2020] border-[#2a1010] cursor-default'
                          : 'bg-[#765844] text-[#f5eee5] border-[#604635] hover:bg-[#8a6852] hover:border-[#4f392c] active:scale-95 cursor-pointer'
                        }`}
                      >
                        {letter}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 mt-2">
              {gameStatus === 'won' && (
                <p className="font-display text-xl font-bold text-[#5a9e6f] text-center">
                  Palavra: <span className="text-[#e8dcc8]">{secretWord}</span>
                </p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={newGame}
                  className="px-7 py-2.5 bg-[#d4a017] text-[#0c0b09] font-bold rounded-lg tracking-widest uppercase text-sm hover:bg-[#e0b030] transition-colors active:scale-95"
                >
                  Nova Partida
                </button>
                <button
                  onClick={onBack}
                  className="px-5 py-2.5 border border-[#8f7766] text-[#665143] font-bold rounded-lg tracking-widest uppercase text-sm hover:border-[#604635] hover:bg-[#765844] hover:text-[#f5eee5] transition-colors active:scale-95"
                >
                  Menu
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showSettings && (
        <SettingsModal
          maxErrors={maxErrors}
          onChange={onChangeMaxErrors}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}

// ─── App shell ────────────────────────────────────────────────────────────────

type Screen = 'menu' | 'game'

export default function App() {
  const [screen, setScreen]       = useState<Screen>('menu')
  const [maxErrors, setMaxErrors] = useState(6)

  if (screen === 'game') {
    return <Game onBack={() => setScreen('menu')} maxErrors={maxErrors} onChangeMaxErrors={setMaxErrors} />
  }
  return <MainMenu onStart={() => setScreen('game')} maxErrors={maxErrors} onChangeMaxErrors={setMaxErrors} />
}

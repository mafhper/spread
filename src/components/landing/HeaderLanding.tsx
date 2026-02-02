/**
 * HeaderLanding - Header fixo da landing page com navegação
 *
 * Features:
 * - Logo + título à esquerda
 * - Menu de navegação no centro (desktop)
 * - Botão de histórico à direita
 * - Menu hamburguer para mobile
 * - Scroll spy para destacar seção ativa
 * - Scroll suave ao clicar nos itens
 */

import React, { useState, useEffect, useCallback } from 'react'
import { Menu, X, Clock, History } from 'lucide-react'

interface HeaderLandingProps {
  onHistoryClick: () => void
  noSpacer?: boolean
}

interface NavItem {
  label: string
  href: string
  id: string
}

const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')

const navItems: NavItem[] = [
  { label: 'Início', href: `${base}/`, id: 'home' },
  { label: 'Funções', href: `${base}/info#recursos`, id: 'recursos' },
  { label: 'Tecnologia', href: `${base}/info#tecnologia`, id: 'tecnologia' },
  {
    label: 'Desenvolvimento',
    href: `${base}/info#opensource`,
    id: 'opensource',
  },
  { label: 'Autor', href: `${base}/info#sobre`, id: 'sobre' },
  { label: 'Projetos', href: `${base}/info#projetos`, id: 'projetos' },
]

export const HeaderLanding: React.FC<HeaderLandingProps> = ({
  onHistoryClick,
  noSpacer = false,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [isScrolled, setIsScrolled] = useState(false)

  // Initial active section from hash
  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (hash) {
      const exists = navItems.find(item => item.id === hash)
      if (exists) setActiveSection(hash)
    } else if (
      window.location.pathname === base ||
      window.location.pathname === `${base}/`
    ) {
      setActiveSection('home')
    }
  }, [])

  // Handle scroll spy
  useEffect(() => {
    // Only spy on scroll if we are not on the home page (where these sections don't exist anymore)
    // Or check if the elements exist
    const container =
      document.getElementById('landing-scroll-container') || window

    const handleScroll = () => {
      const scrollTop =
        'scrollTop' in container ? container.scrollTop : window.scrollY

      // Update scroll state for header background
      setIsScrolled(scrollTop > 50)

      // Find active section
      const sections = navItems.map(item => {
        const element = document.getElementById(item.id)
        return {
          id: item.id,
          element: element,
        }
      })

      // Use window height or container height
      const height =
        'clientHeight' in container
          ? container.clientHeight
          : window.innerHeight
      const scrollPosition = scrollTop + height / 3

      // Check if we are at the top
      if (
        scrollTop < 100 &&
        (window.location.pathname === base ||
          window.location.pathname === `${base}/`)
      ) {
        setActiveSection('home')
        return
      }

      // Check if we are at the bottom of the page
      const scrollHeight =
        'scrollHeight' in container
          ? (container as HTMLElement).scrollHeight
          : document.documentElement.scrollHeight
      const isAtBottom = scrollTop + height >= scrollHeight - 150

      if (isAtBottom) {
        // Encontrar a ultima seção valida disponível no DOM
        const reversedSections = [...sections].reverse()
        for (const s of reversedSections) {
          if (s.element) {
            setActiveSection(s.id)
            return
          }
        }
      }

      const reversedSections = [...sections].reverse()
      for (const s of reversedSections) {
        if (s.element && scrollPosition >= s.element.offsetTop) {
          setActiveSection(s.id)
          break
        }
      }
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial check

    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      const isAnchor = href.includes('#')
      const targetId = isAnchor ? href.split('#')[1] : ''
      const element = targetId ? document.getElementById(targetId) : null
      const isHomeLink =
        href === '/' || href === `${base}/` || href === `${base}`

      const currentPath = window.location.pathname
      const isAtHome =
        currentPath === base ||
        currentPath === `${base}/` ||
        currentPath === '/'

      if (element || (isHomeLink && isAtHome)) {
        e.preventDefault()
        const container = document.getElementById('landing-scroll-container')

        if (isHomeLink) {
          if (container) container.scrollTo({ top: 0, behavior: 'smooth' })
          else window.scrollTo({ top: 0, behavior: 'smooth' })
          setActiveSection('home')
        } else if (element) {
          const offsetTop = element.offsetTop - 80

          if (container) {
            const maxScroll = container.scrollHeight - container.clientHeight
            container.scrollTo({
              top: Math.min(offsetTop, maxScroll),
              behavior: 'smooth',
            })
          } else {
            const maxScroll =
              document.documentElement.scrollHeight - window.innerHeight
            window.scrollTo({
              top: Math.min(offsetTop, maxScroll),
              behavior: 'smooth',
            })
          }
          setActiveSection(targetId)
        }
      }

      setIsMobileMenuOpen(false)
    },
    []
  )

  // Toggle mobile menu
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev)
  }, [])

  // Close mobile menu on resize (when going to desktop)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-zinc-950/90 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo + Title */}
            <a
              href="#home"
              onClick={e => handleNavClick(e, '#home')}
              className="flex items-center gap-3 group min-h-[44px] min-w-[44px]"
              aria-label="Voltar ao início"
            >
              <div className="relative w-10 h-10 sm:w-11 sm:h-11">
                <div className="absolute inset-0 bg-gradient-to-tr from-violet-500 via-fuchsia-500 to-pink-500 rounded-xl rotate-6 opacity-80 group-hover:rotate-12 transition-transform duration-300" />
                <div className="absolute inset-[2px] bg-zinc-950 rounded-xl flex items-center justify-center">
                  <img
                    src={`${base}/logo.svg`}
                    alt="Logo Spread"
                    className="w-5 h-5 sm:w-6 sm:h-6 opacity-90"
                  />
                </div>
              </div>
              <span className="text-lg sm:text-xl font-bold text-white hidden sm:block">
                Spread
              </span>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(item => (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={e => handleNavClick(e, item.href)}
                  className={`relative px-4 py-3 min-h-[44px] flex items-center text-sm font-medium transition-colors duration-200 rounded-lg ${
                    activeSection === item.id
                      ? 'text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                  {activeSection === item.id && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-violet-500 rounded-full" />
                  )}
                </a>
              ))}
            </nav>

            {/* Right Side - History Button */}
            <div className="flex items-center gap-2">
              {/* History Button */}
              <button
                onClick={onHistoryClick}
                className="flex items-center gap-2 px-3 py-2.5 sm:px-4 sm:py-3 min-h-[44px] text-sm font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all duration-200"
                aria-label="Abrir histórico"
              >
                <History size={18} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Histórico</span>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${
          isMobileMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <button
          className="absolute inset-0 bg-black/80 backdrop-blur-sm w-full h-full border-none cursor-default"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Fechar menu"
          type="button"
        />

        {/* Menu Panel */}
        <nav
          className={`absolute top-16 left-4 right-4 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
            isMobileMenuOpen
              ? 'translate-y-0 opacity-100'
              : '-translate-y-4 opacity-0'
          }`}
        >
          <div className="p-2">
            {navItems.map((item, index) => (
              <a
                key={item.id}
                href={item.href}
                onClick={e => handleNavClick(e, item.href)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors min-h-[44px] ${
                  activeSection === item.id
                    ? 'text-white bg-white/10'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
                aria-label={item.label}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    activeSection === item.id ? 'bg-violet-500' : 'bg-white/20'
                  }`}
                />
                {item.label}
              </a>
            ))}
          </div>

          {/* Mobile History Button */}
          <div className="border-t border-white/10 p-3">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false)
                onHistoryClick()
              }}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 text-base font-medium text-white bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 hover:from-violet-500/30 hover:to-fuchsia-500/30 border border-white/10 rounded-xl transition-colors"
            >
              <Clock size={20} />
              Ver Histórico
            </button>
          </div>
        </nav>
      </div>

      {/* Spacer for fixed header */}
      {!noSpacer && <div className="h-16 sm:h-20" />}
    </>
  )
}

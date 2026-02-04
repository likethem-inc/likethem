'use client'

import { useState, useEffect } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useT } from '@/hooks/useT'

interface SignUpForm {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export default function SignUpPage() {
  const [form, setForm] = useState<SignUpForm>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'
  const t = useT();

  // Check if user is already signed in
  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession()
      if (session) {
        if (session.user.role === 'CURATOR') {
          router.push('/dashboard/curator')
        } else {
          router.push(redirectTo)
        }
      }
    }
    checkSession()
  }, [router, redirectTo])

  const handleInputChange = (field: keyof SignUpForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const validateForm = (): string | null => {
    if (!form.name.trim()) {
      return t('auth.validation.nameRequired')
    }
    if (!form.email.trim()) {
      return t('auth.validation.emailRequired')
    }
    if (!form.email.includes('@')) {
      return t('auth.validation.emailInvalid')
    }
    if (form.password.length < 8) {
      return t('auth.validation.passwordLength')
    }
    if (form.password !== form.confirmPassword) {
      return t('auth.validation.passwordMismatch')
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: 'BUYER'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || t('auth.validation.createAccountError'))
        return
      }

      // Auto sign-in after successful registration
      const result = await signIn('credentials', {
        email: form.email.trim(),
        password: form.password,
        redirect: false
      })

      if (result?.error) {
        setError(t('auth.validation.accountCreatedSignInFailed'))
        return
      }

      // Redirect based on context
      if (redirectTo === '/sell') {
        router.push('/sell')
      } else {
        router.push(redirectTo)
      }
      
    } catch (error) {
      setError(t('auth.validation.genericError'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    setError('')

    try {
      const result = await signIn('google', {
        callbackUrl: redirectTo,
        redirect: false
      })

      if (result?.error) {
        setError(t('auth.validation.googleSignInFailed'))
      } else if (result?.url) {
        router.push(result.url)
      }
    } catch (error) {
      setError(t('auth.validation.googleSignInError'))
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link
          href="/"
          className="flex items-center justify-center space-x-2 text-carbon hover:text-black transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('auth.signUp.backToHome')}</span>
        </Link>
        
        <div className="text-center">
          <h1 className="font-serif text-3xl font-light text-carbon">{t('auth.signUp.title')}</h1>
          <p className="mt-2 text-sm text-gray-600">
            {t('auth.signUp.subtitle')}
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white py-8 px-4 shadow-sm border border-gray-200 sm:rounded-lg sm:px-10"
        >
          {/* Google Sign-In Button */}
          <div className="mb-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGoogleLoading ? (
                <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {t('auth.signUp.continueWithGoogle')}
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">{t('auth.signUp.orSignUpWithEmail')}</span>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                {t('auth.signUp.fullName')}
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={form.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder={t('auth.signUp.fullNamePlaceholder')}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t('auth.signUp.emailAddress')}
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder={t('auth.signUp.emailPlaceholder')}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t('auth.signUp.password')}
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={form.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="appearance-none block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder={t('auth.signUp.passwordPlaceholder')}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">{t('auth.signUp.passwordHint')}</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                {t('auth.signUp.confirmPassword')}
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={form.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="appearance-none block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder={t('auth.signUp.confirmPasswordPlaceholder')}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  t('auth.signUp.createAccount')
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                {t('auth.signUp.alreadyHaveAccount')}{' '}
                <Link
                  href={`/auth/signin?redirect=${encodeURIComponent(redirectTo)}`}
                  className="font-medium text-black hover:text-gray-700 transition-colors"
                >
                  {t('auth.signUp.signInLink')}
                </Link>
              </p>
            </div>

            <div className="text-center text-xs text-gray-500">
              <p>
                {t('auth.signUp.terms')}{' '}
                <Link href="/terms-of-service" className="text-black hover:underline">
                  {t('auth.signUp.termsOfService')}
                </Link>{' '}
                {t('auth.signUp.and')}{' '}
                <Link href="/privacy" className="text-black hover:underline">
                  {t('auth.signUp.privacyPolicy')}
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
} 

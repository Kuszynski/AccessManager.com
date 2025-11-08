import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'
import { useTranslation } from '../utils/translations'

export const useAuth = (language = 'no') => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const { t } = useTranslation(language)

  useEffect(() => {
    // Pobierz aktualnego użytkownika
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Sprawdź status firmy
        const isAllowed = await checkCompanyStatus(user.email)
        if (!isAllowed) {
          await supabase.auth.signOut()
          setUser(null)
          setLoading(false)
          return
        }
      }
      
      setUser(user)
      setLoading(false)
    }

    getUser()

    // Nasłuchuj zmian autoryzacji
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Sprawdź status firmy przy każdej zmianie sesji
          const isAllowed = await checkCompanyStatus(session.user.email)
          if (!isAllowed) {
            await supabase.auth.signOut()
            return
          }
        }
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    // Najpierw sprawdź status firmy przed logowaniem
    const { data: company } = await supabase
      .from('companies')
      .select('status, role')
      .eq('admin_email', email)
      .single()
    
    // Zablokuj dostęp dla firm pending (oprócz super_admin)
    if (company && company.status === 'pending' && company.role !== 'super_admin') {
      return { 
        data: null, 
        error: { message: t('accountPendingApproval') }
      }
    }
    
    // Zablokuj dostęp dla firm rejected
    if (company && company.status === 'rejected') {
      return { 
        data: null, 
        error: { message: t('accountRejected') }
      }
    }
    
    // Jeśli status jest OK, zaloguj użytkownika
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    // Mapuj błędy Supabase na tłumaczenia
    if (error) {
      let translatedError = error
      if (error.message === 'Invalid login credentials') {
        translatedError = { ...error, message: t('invalidLoginCredentials') }
      }
      return { data, error: translatedError }
    }
    
    return { data, error }
  }

  const checkCompanyStatus = async (email) => {
    try {
      const { data: company, error } = await supabase
        .from('companies')
        .select('status, role')
        .eq('admin_email', email)
        .single()
      
      // Jeśli nie ma firmy w tabeli, zablokuj dostęp
      if (error || !company) {
        console.log('No company found for email:', email)
        return false
      }
      
      // Pozwól super_admin
      if (company.role === 'super_admin') {
        return true
      }
      
      // Pozwól tylko approved
      if (company.status === 'approved') {
        return true
      }
      
      // Zablokuj pending i rejected
      console.log('Company status:', company.status, 'for email:', email)
      return false
    } catch (error) {
      console.error('Error checking company status:', error)
      return false
    }
  }

  const signUp = async (email, password, companyData) => {
    try {
      // Najpierw zarejestruj użytkownika
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
      })
      
      if (authError) {
        console.error('Auth error:', authError)
        return { data: null, error: authError }
      }
      
      console.log('User created:', authData.user?.id)
      
      // Potem utwórz firmę z statusem 'pending'
      const { data: companyData2, error: companyError } = await supabase
        .from('companies')
        .insert([{
          name: companyData.name,
          address: companyData.address,
          phone: companyData.phone,
          admin_email: email,
          status: 'pending',
          role: 'admin'
        }])
        .select()
      
      if (companyError) {
        console.error('Company creation error:', companyError)
        // Nie próbuj usuwać użytkownika przez admin API (403 error)
        // Supabase automatycznie wyloguje użytkownika
        return { data: null, error: companyError }
      }
      
      console.log('Company created:', companyData2)
      
      // Natychmiast wyloguj użytkownika po rejestracji
      await supabase.auth.signOut()
      
      return { data: { user: null, session: null }, error: null }
    } catch (error) {
      console.error('SignUp error:', error)
      return { data: null, error }
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut
  }
}
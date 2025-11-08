import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Pobierz aktualnego użytkownika
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    // Nasłuchuj zmian autoryzacji
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }

  const signUp = async (email, password, companyData) => {
    // Najpierw utwórz firmę
    const { error: companyError } = await supabase
      .from('companies')
      .insert([{
        name: companyData.name,
        address: companyData.address,
        phone: companyData.phone,
        admin_email: email
      }])
    
    if (companyError) {
      console.error('Błąd tworzenia firmy:', companyError)
      return { data: null, error: companyError }
    }
    
    // Potem zarejestruj użytkownika
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })
    
    return { data, error }
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
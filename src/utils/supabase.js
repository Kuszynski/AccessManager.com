import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Funkcje pomocnicze dla bazy danych
export const dbHelpers = {
  // Pobierz firmę użytkownika
  async getUserCompany(userEmail) {
    console.log('Szukam firmy dla emaila:', userEmail)
    
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('admin_email', userEmail)
      .single()
    
    if (error) {
      console.error('Błąd pobierania firmy:', error)
      if (error.code === 'PGRST116') {
        // Brak wyników - zwróć null zamiast rzucać błąd
        return null
      }
      throw error
    }
    
    console.log('Znaleziona firma:', data)
    return data
  },

  // Pobierz aktualnie obecnych gości
  async getCurrentVisitors(companyId) {
    const { data, error } = await supabase
      .from('visitors')
      .select('*')
      .eq('company_id', companyId)
      .eq('status', 'in')
      .order('check_in_time', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Zarejestruj nowego gościa
  async checkInVisitor(visitorData) {
    const { data, error } = await supabase
      .from('visitors')
      .insert([{
        ...visitorData,
        check_in_time: new Date().toISOString(),
        status: 'in'
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Wymelduj gościa
  async checkOutVisitor(visitorId) {
    const { data, error } = await supabase
      .from('visitors')
      .update({
        check_out_time: new Date().toISOString(),
        status: 'out'
      })
      .eq('id', visitorId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Zapisz alert
  async createAlert(alertData) {
    const { data, error } = await supabase
      .from('alerts')
      .insert([{
        ...alertData,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}
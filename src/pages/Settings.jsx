import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../utils/supabase'
import Layout from '../components/Layout'
import { useTranslation } from '../utils/translations'
import { Settings as SettingsIcon, Upload, X, Save, Building, Phone } from 'lucide-react'

const Settings = () => {
  const { user } = useAuth()
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [language] = useState('no')
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  })
  const [errors, setErrors] = useState({})

  const { t } = useTranslation(language)

  useEffect(() => {
    loadCompany()
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadCompany = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('admin_email', user.email)
        .single()

      if (error) throw error

      setCompany(data)
      setFormData({
        name: data.name || '',
        phone: data.phone || ''
      })
    } catch (error) {
      console.error('Error loading company:', error)
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = t('companyNameRequired') || 'Firmanavn er påkrevd (minimum 2 tegn)'
    }

    if (!formData.phone) {
      newErrors.phone = t('phoneRequired') || 'Telefonnummer er påkrevd'
    } else if (!/^\+\d{1,4}\s?\d{8,15}$/.test(formData.phone)) {
      newErrors.phone = t('phoneInvalid') || 'Bruk format: +47 12345678'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('companies')
        .update({
          name: formData.name.trim(),
          phone: formData.phone.trim()
        })
        .eq('id', company.id)

      if (error) throw error

      setCompany({ ...company, ...formData })
      alert(t('settingsSaved') || 'Innstillinger lagret!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert(t('settingsError') || 'Feil ved lagring av innstillinger')
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      alert(t('logoTooLarge') || 'Logo er for stort (maks 2MB)')
      return
    }

    if (!file.type.startsWith('image/')) {
      alert(t('logoInvalidType') || 'Kun bildefiler er tillatt')
      return
    }

    setUploading(true)
    try {
      // Konwertuj do base64
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const logoUrl = e.target.result
          
          const { error } = await supabase
            .from('companies')
            .update({ logo_url: logoUrl })
            .eq('id', company.id)
          
          if (error) throw error
          
          setCompany({ ...company, logo_url: logoUrl })
          alert(t('logoUploaded') || 'Logo lastet opp!')
        } catch (error) {
          console.error('Error saving logo:', error)
          alert(t('logoError') || 'Feil ved opplasting av logo')
        } finally {
          setUploading(false)
        }
      }
      
      reader.onerror = () => {
        alert(t('logoError') || 'Feil ved lesing av fil')
        setUploading(false)
      }
      
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading logo:', error)
      alert(t('logoError') || 'Feil ved opplasting av logo')
      setUploading(false)
    }
  }

  const handleRemoveLogo = async () => {
    if (!window.confirm(t('confirmRemoveLogo') || 'Er du sikker på at du vil fjerne logoen?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('companies')
        .update({ logo_url: null })
        .eq('id', company.id)

      if (error) throw error

      setCompany({ ...company, logo_url: null })
      alert(t('logoRemoved') || 'Logo fjernet!')
    } catch (error) {
      console.error('Error removing logo:', error)
      alert(t('logoRemoveError') || 'Feil ved fjerning av logo')
    }
  }

  if (loading) {
    return (
      <Layout title={t('settings')} t={t}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title={t('settings')} t={t}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center">
            <SettingsIcon className="h-8 w-8 text-gray-600 mr-4" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('settings')}</h1>
              <p className="text-gray-600">{t('manageCompanySettings') || 'Administrer bedriftsinnstillinger'}</p>
            </div>
          </div>
        </div>

        {/* Logo Settings */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('companyLogo')}</h2>
          
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              {company?.logo_url ? (
                <img 
                  src={company.logo_url} 
                  alt="Company Logo"
                  className="h-20 w-20 object-contain border border-gray-200 rounded-lg"
                />
              ) : (
                <div className="h-20 w-20 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
                  <Building className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex space-x-3">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  <div className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? t('uploading') : t('uploadLogo')}
                  </div>
                </label>
                
                {company?.logo_url && (
                  <button
                    onClick={handleRemoveLogo}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <X className="h-4 w-4 mr-2" />
                    {t('removeLogo')}
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {t('logoRequirements') || 'PNG, JPG eller SVG. Maks 2MB.'}
              </p>
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('companyInformation') || 'Bedriftsinformasjon'}</h2>
          
          <div className="space-y-4">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building className="inline h-4 w-4 mr-1" />
                {t('companyName')} *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder={t('companyNamePlaceholder') || 'Skriv inn firmanavn'}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Reception Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="inline h-4 w-4 mr-1" />
                {t('receptionPhone') || 'Resepsjonstelefon'} *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                  errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="+47 12345678"
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {t('receptionPhoneDescription') || 'Dette nummeret vises i appen for gjester som trenger hjelp'}
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? t('saving') || 'Lagrer...' : t('saveChanges') || 'Lagre endringer'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Settings
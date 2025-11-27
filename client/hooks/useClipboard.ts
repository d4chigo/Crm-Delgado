import { useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'

export function useClipboard() {
  const { toast } = useToast()

  const copyToClipboard = useCallback(async (text: string, successMessage: string = '✅ Copiado') => {
    try {
      console.log('🔍 Intentando copiar al portapapeles...')
      
      // Primero intenta con navigator.clipboard (funciona en Electron y navegadores modernos)
      if (navigator.clipboard && navigator.clipboard.writeText) {
        console.log('📋 Usando navigator.clipboard')
        await navigator.clipboard.writeText(text)
        toast({ title: successMessage })
        console.log('✅ Copiado exitosamente con navigator.clipboard')
        return true
      }

      // Fallback antiguo para navegadores más antiguos
      console.log('📋 Usando document.execCommand (fallback antiguo)')
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      const success = document.execCommand('copy')
      document.body.removeChild(textArea)
      
      if (success) {
        toast({ title: successMessage })
        console.log('✅ Copiado exitosamente con document.execCommand')
        return true
      } else {
        throw new Error('document.execCommand("copy") retornó false')
      }
    } catch (error) {
      console.error('❌ Error al copiar:', error)
      toast({
        title: '❌ Error',
        description: 'No se pudo copiar al portapapeles',
        variant: 'destructive'
      })
      return false
    }
  }, [toast])

  return { copyToClipboard }
}

'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/axios'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { RefreshCw } from 'lucide-react'

export default function QRCodeGenerator() {
  const [qrCode, setQrCode] = useState(null)
  const [secret, setSecret] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQRCode()
  }, [])

  const fetchQRCode = async () => {
    try {
      const response = await api.get('/qrcode/generate')
      setQrCode(response.data.qrCode)
      setSecret(response.data.secret)
    } catch (error) {
      console.error('Error fetching QR code:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRegenerate = async () => {
    setLoading(true)
    try {
      const response = await api.post('/qrcode/regenerate')
      setQrCode(response.data.qrCode)
      setSecret(response.data.secret)
    } catch (error) {
      alert('Failed to regenerate QR code')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="animate-pulse">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">QR Code Generator</h1>

      <Card>
        <CardHeader>
          <CardTitle>Company QR Code</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {qrCode && (
              <div className="flex justify-center">
                <img src={qrCode} alt="Company QR Code" className="max-w-xs" />
              </div>
            )}
            
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">QR Code Secret:</p>
              <p className="text-xs font-mono break-all">{secret}</p>
            </div>

            <Button onClick={handleRegenerate} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerate QR Code
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

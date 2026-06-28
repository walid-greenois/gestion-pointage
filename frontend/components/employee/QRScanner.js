'use client'



import { useState, useRef, useEffect } from 'react'

import { QrCode, X, Loader2, AlertCircle, Camera } from 'lucide-react'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

import Button from '@/components/ui/Button'

import api from '@/lib/axios'

import { BarcodeScanner } from '@capacitor-community/barcode-scanner'

import { Capacitor } from '@capacitor/core'



export default function QRScanner({ initialStream, onScanSuccess, onClose }) {

  const [scanning, setScanning] = useState(true)

  const [loading, setLoading] = useState(false)

  const [error, setError] = useState('')

  const [manualInput, setManualInput] = useState('')

  const [cameraStarted, setCameraStarted] = useState(false)

  const [usingManual, setUsingManual] = useState(false)

  const scanIntervalRef = useRef(null)



  // Initialize camera with Capacitor Barcode Scanner

  useEffect(() => {

    const startCamera = async () => {

      try {

        setError('')

        setCameraStarted(false)



        // Check if running in native environment

        const isNative = Capacitor.isNativePlatform()



        if (isNative) {

          // Use Capacitor Barcode Scanner for native

          const permission = await BarcodeScanner.checkPermission({ force: true })

          

          if (permission.granted) {

            await BarcodeScanner.hideBackground()

            

            const result = await BarcodeScanner.startScan()

            

            if (result.hasContent) {

              handleScanResult(result.content)

            }

          } else {

            setUsingManual(true)

          }

        } else {

          // Fallback to web API for browser

          setUsingManual(true)

        }

      } catch (err) {

        console.error('Camera error:', err)

        setUsingManual(true)

      }

    }



    if (scanning && !usingManual) {

      startCamera()

    }



    return () => {

      stopScanner()

    }

  }, [scanning, usingManual])



  const stopScanner = async () => {

    try {

      await BarcodeScanner.stopScan()

      await BarcodeScanner.showBackground()

    } catch (err) {

      console.error('Error stopping scanner:', err)

    }

  }



  const handleScanResult = async (content) => {

    setLoading(true)

    try {

      const response = await api.post('/qrcode/verify', { qrCode: content })

      onScanSuccess(content, response.data)

    } catch (err) {

      setError('Code QR invalide')

      setLoading(false)

    }

  }



  // Manual input handler

  const handleManualSubmit = async (e) => {

    e.preventDefault()

    if (!manualInput.trim()) return



    setLoading(true)

    try {

      const response = await api.post('/qrcode/verify', { qrCode: manualInput })

      onScanSuccess(manualInput, response.data)

    } catch (err) {

      setError('Code QR invalide')

      setLoading(false)

    }

  }



  const handleClose = async () => {

    await stopScanner()

    onClose()

  }



  const switchToManual = async () => {

    await stopScanner()

    setUsingManual(true)

    setScanning(false)

  }



  const switchToCamera = () => {

    setUsingManual(false)

    setScanning(true)

    setError('')

  }



  return (

    <Card className="w-full max-w-md mx-auto">

      <CardHeader className="flex flex-row items-center justify-between">

        <CardTitle className="flex items-center gap-2">

          <QrCode className="h-5 w-5" />

          Scanner QR Code

        </CardTitle>

        <button

          onClick={handleClose}

          className="p-1 hover:bg-gray-100 rounded"

        >

          <X className="h-5 w-5" />

        </button>

      </CardHeader>

      <CardContent className="space-y-4">

        {error && (

          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex gap-2">

            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />

            <span className="text-sm">{error}</span>

          </div>

        )}



        {!usingManual && (

          <>

            {!cameraStarted && !error && (

              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center justify-between">

                <div className="flex items-center gap-2">

                  <Loader2 className="h-4 w-4 animate-spin" />

                  <span className="text-sm">⏳ Initialisation de la caméra...</span>

                </div>

                <button

                  onClick={switchToManual}

                  className="text-sm text-blue-700 underline hover:text-blue-900"

                >

                  Passer à l'entrée manuelle

                </button>

              </div>

            )}



            <div className="relative w-full bg-black rounded-lg overflow-hidden aspect-square">

              {scanning && cameraStarted && (

                <>

                  <video

                    ref={videoRef}

                    autoPlay

                    playsInline

                    muted

                    className="w-full h-full object-cover"

                  />

                  

                  {/* Scanner overlay */}

                  <div className="absolute inset-0 flex items-center justify-center">

                    <div className="w-64 h-64 border-2 border-green-500 rounded-lg shadow-lg">

                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-500"></div>

                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-500"></div>

                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-500"></div>

                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-500"></div>

                    </div>

                  </div>

                </>

              )}

              {!cameraStarted && (

                <div className="w-full h-full flex items-center justify-center bg-black">

                  <Loader2 className="h-8 w-8 animate-spin text-white" />

                </div>

              )}

            </div>



            <Button

              onClick={switchToManual}

              variant="outline"

              className="w-full"

            >

              Utiliser l'entrée manuelle

            </Button>

          </>

        )}



        {usingManual && (

          <form onSubmit={handleManualSubmit} className="space-y-3">

            <div>

              <label className="block text-sm font-medium mb-2">Entrez le code QR:</label>

              <input

                type="text"

                value={manualInput}

                onChange={(e) => setManualInput(e.target.value)}

                placeholder="Code QR..."

                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                disabled={loading}

                autoFocus

              />

            </div>

            

            <div className="space-y-2">

              <Button

                type="submit"

                className="w-full"

                disabled={loading || !manualInput.trim()}

              >

                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}

                Valider le code

              </Button>

              <Button

                type="button"

                onClick={switchToCamera}

                variant="outline"

                className="w-full"

                disabled={loading}

              >

                <Camera className="h-4 w-4 mr-2" />

                Réessayer la caméra

              </Button>

              <Button

                type="button"

                onClick={handleClose}

                variant="outline"

                className="w-full"

                disabled={loading}

              >

                Annuler

              </Button>

            </div>

          </form>

        )}



        <p className="text-xs text-gray-600 text-center mt-4">

          💡 Entrez le code manuellement si la caméra ne fonctionne pas

        </p>

      </CardContent>

    </Card>

  )

}


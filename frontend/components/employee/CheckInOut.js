'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/axios'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Clock, MapPin, QrCode, CheckCircle, LogOut, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import QRScanner from './QRScanner'

export default function CheckInOut() {
  const [todayStatus, setTodayStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [location, setLocation] = useState(null)
  const [locationPermission, setLocationPermission] = useState(null)
  const [cameraPermission, setCameraPermission] = useState(null)
  const [permissionError, setPermissionError] = useState('')
  const [qrCode, setQrCode] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [cameraStream, setCameraStream] = useState(null)
  const [isSecure, setIsSecure] = useState(false)
  const [pendingCheckIn, setPendingCheckIn] = useState(false)
  const [pendingCheckOut, setPendingCheckOut] = useState(false)

  useEffect(() => {
    setIsSecure(typeof window !== 'undefined' ? window.location.protocol === 'https:' : true)
    fetchTodayStatus()
    checkPermissions()
    requestLocationPermission()
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const checkPermissions = async () => {
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const locationStatus = await navigator.permissions.query({ name: 'geolocation' })
        setLocationPermission(locationStatus.state)

        const cameraStatus = await navigator.permissions.query({ name: 'camera' })
        setCameraPermission(cameraStatus.state)
      }
    } catch (err) {
      console.log('Permission check not fully supported')
    }
  }

  const handleOpenScanner = async () => {
    setPermissionError('')

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setPermissionError('❌ Caméra non supportée sur ce navigateur')
      setCameraPermission('denied')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      })

      setCameraPermission('granted')
      setCameraStream(stream)
      setShowQRScanner(true)
    } catch (error) {
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setCameraPermission('denied')
        setPermissionError('❌ Permission caméra refusée. Vérifiez les paramètres de votre navigateur.')
      } else if (error.name === 'NotFoundError') {
        setPermissionError('❌ Aucune caméra trouvée sur cet appareil.')
        setCameraPermission('denied')
      } else {
        setPermissionError('❌ Erreur caméra: ' + error.message)
      }
    }
  }

  const handleScannerClose = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop())
      setCameraStream(null)
    }
    setShowQRScanner(false)
  }

  const fetchTodayStatus = async () => {
    try {
      const response = await api.get('/attendance/today')
      setTodayStatus(response.data)
    } catch (error) {
      console.error('Error fetching today status:', error)
    } finally {
      setLoading(false)
    }
  }

  const getLocation = () => {
    if (!navigator.geolocation) {
      setPermissionError('❌ Géolocalisation non supportée sur ce navigateur')
      return
    }

    if (!isSecure && typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      setPermissionError('⚠️ La géolocalisation sur téléphone nécessite HTTPS. Utilise une adresse sécurisée ou localhost.')
      return
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        }
        setLocation(newLocation)
        setLocationPermission('granted')
        setPermissionError('')

        // If check-in was pending, retry it now
        if (pendingCheckIn) {
          setPendingCheckIn(false)
          performCheckIn(newLocation)
        }
        // If check-out was pending, retry it now
        if (pendingCheckOut) {
          setPendingCheckOut(false)
          performCheckOut(newLocation)
        }
      },
      (error) => {
        console.error('Geolocation error:', error)
        setPendingCheckIn(false)
        setPendingCheckOut(false)
        if (error.code === error.PERMISSION_DENIED) {
          setLocationPermission('denied')
          setPermissionError('❌ Permission de localisation REFUSÉE. Allez à Paramètres → Localisation et acceptez.')
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setPermissionError('⚠️ Position non disponible. Assurez-vous que le GPS est activé.')
        } else if (error.code === error.TIMEOUT) {
          setPermissionError('⏱️ Timeout - Le GPS prend trop de temps. Réessayez.')
        } else {
          setPermissionError('❌ Erreur de géolocalisation: ' + error.message)
        }
      },
      options
    )
  }

  const performCheckIn = async (locationData) => {
    const loc = locationData || location
    if (!loc) {
      setPermissionError('❌ Impossible d\'obtenir votre localisation.')
      return
    }

    setActionLoading(true)
    try {
      await api.post('/attendance/checkin', {
        qrCode: qrCode || 'demo-qr-code',
        location: loc
      })
      await fetchTodayStatus()
    } catch (error) {
      alert(error.response?.data?.message || 'Check-in failed')
    } finally {
      setActionLoading(false)
    }
  }

  const performCheckOut = async (locationData) => {
    const loc = locationData || location
    if (!loc) {
      setPermissionError('❌ Impossible d\'obtenir votre localisation.')
      return
    }

    setActionLoading(true)
    try {
      await api.post('/attendance/checkout', {
        qrCode: qrCode || 'demo-qr-code',
        location: loc
      })
      await fetchTodayStatus()
    } catch (error) {
      alert(error.response?.data?.message || 'Check-out failed')
    } finally {
      setActionLoading(false)
    }
  }

  const requestLocationPermission = () => {
    setPermissionError('')
    getLocation()
  }

  const requestCameraPermission = () => {
    setShowQRScanner(true)
  }

  const handlePageReload = () => {
    window.location.reload()
  }

  const handleCheckIn = async () => {
    setPermissionError('')
    
    if (!location) {
      setPermissionError('📍 Demande de localisation...')
      setPendingCheckIn(true)
      getLocation()
      return
    }

    await performCheckIn(location)
  }

  const handleCheckOut = async () => {
    setPermissionError('')
    
    if (!location) {
      setPermissionError('📍 Demande de localisation...')
      setPendingCheckOut(true)
      getLocation()
      return
    }

    await performCheckOut(location)
  }

  const handleQRScanSuccess = (scannedCode, scanData) => {
    setQrCode(scannedCode)
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop())
      setCameraStream(null)
    }
    setShowQRScanner(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* QR Scanner Modal */}
      {showQRScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <QRScanner
              initialStream={cameraStream}
              onScanSuccess={handleQRScanSuccess}
              onClose={handleScannerClose}
            />
          </div>
        </div>
      )}

      {/* Time Display */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium">Current Time</p>
            <p className="text-5xl font-bold mt-2">{format(currentTime, 'HH:mm:ss')}</p>
            <p className="text-blue-100 mt-1">{format(currentTime, 'EEEE, MMMM do, yyyy')}</p>
          </div>
          <Clock className="h-16 w-16 text-blue-200" />
        </div>
      </div>

      {/* Check In/Out Card */}
      <Card className="border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
          <CardTitle className="flex items-center space-x-2 text-xl">
            <Clock className="h-6 w-6 text-primary" />
            <span>Today's Attendance</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {todayStatus?.status === 'not_checked_in' ? (
            <div className="space-y-6">
              {permissionError && (
                <div className={`p-4 rounded-xl border-2 ${permissionError.includes('Demande') ? 'border-blue-200 bg-blue-50' : 'border-red-200 bg-red-50'}`}>
                  <p className={`font-medium ${permissionError.includes('Demande') ? 'text-blue-900' : 'text-red-900'}`}>
                    {permissionError}
                  </p>
                </div>
              )}

              {/* Location Status */}
              <div className={`p-4 rounded-xl border-2 ${location ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${location ? 'bg-green-500' : 'bg-yellow-500'}`}>
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Location Status</p>
                    <p className="text-sm text-gray-600">
                      {location 
                        ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                        : 'Click "Check In" to enable location'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* QR Code Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">QR Code</label>
                <div className="flex space-x-2 gap-2">
                  <input
                    type="text"
                    placeholder="Enter QR code"
                    value={qrCode}
                    onChange={(e) => setQrCode(e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors"
                  />
                  <Button 
                    onClick={handleOpenScanner} 
                    variant="outline"
                    className="px-4 py-3"
                    title="Scanner un code QR"
                  >
                    <QrCode className="h-5 w-5" />
                  </Button>
                  <Button 
                    onClick={handleCheckIn} 
                    disabled={actionLoading}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 px-8"
                  >
                    {actionLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Check In
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : todayStatus?.status === 'checked_in' ? (
            <div className="space-y-6">
              {/* Checked In Status */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-500 rounded-full">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="text-green-900 font-semibold text-lg">You're checked in!</p>
                    <p className="text-green-700">Checked in at {todayStatus.attendance?.checkIn?.time}</p>
                  </div>
                </div>
              </div>

              {/* Work Duration */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-2">Work Duration</p>
                <p className="text-2xl font-bold text-gray-900">
                  {format(currentTime, 'HH:mm:ss')}
                </p>
              </div>

              {/* QR Code Input for Checkout */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">QR Code (Optional)</label>
                <div className="flex space-x-2 gap-2">
                  <input
                    type="text"
                    placeholder="Scan QR code to verify checkout"
                    value={qrCode}
                    onChange={(e) => setQrCode(e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors"
                  />
                  <Button 
                    onClick={handleOpenScanner} 
                    variant="outline"
                    className="px-4 py-3"
                    title="Scanner un code QR"
                  >
                    <QrCode className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <Button 
                onClick={handleCheckOut} 
                disabled={actionLoading}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 py-4 text-lg"
              >
                {actionLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <>
                    <LogOut className="h-5 w-5 mr-2" />
                    Check Out
                  </>
                )}
              </Button>
            </div>
          ) : todayStatus?.status === 'checked_out' ? (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-500 rounded-full">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="text-blue-900 font-semibold text-lg">Day completed!</p>
                    <p className="text-blue-700">Checked out at {todayStatus.attendance?.checkOut?.time}</p>
                  </div>
                </div>
              </div>

              {todayStatus.attendance?.workHours && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-600">Work Hours</p>
                    <p className="text-2xl font-bold text-gray-900">{todayStatus.attendance.workHours.actual}h</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-600">Overtime</p>
                    <p className="text-2xl font-bold text-gray-900">{todayStatus.attendance.workHours.overtime || 0}h</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No attendance record for today</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "../../../../utils/supabase/client"
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'
import { toast } from 'sonner'

// Cargar react-leaflet dinámicamente (solo en cliente)
const { MapContainer, TileLayer, Marker, Popup } = dynamic(() => import('react-leaflet'), {
  ssr: false // Deshabilitar SSR para esta parte del código
})

export default function TripDetailsPage() {
  const router = useRouter()
  const [tripDetails, setTripDetails] = useState(null)
  const [userLocation, setUserLocation] = useState(null) // Guardar la ubicación del usuario
  const [mapInstance, setMapInstance] = useState(null) // Guardar la instancia del mapa
  const [marker, setMarker] = useState(null) // Guardar la referencia del marcador
  const [isClient, setIsClient] = useState(false) // Estado para saber si estamos en el cliente

  useEffect(() => {
    // Establecer que estamos en el cliente
    setIsClient(true)
  }, [])

  // Obtener los detalles del viaje
  useEffect(() => {
    const storedTripDetails = sessionStorage.getItem('tripDetails')
    if (storedTripDetails) {
      setTripDetails(JSON.parse(storedTripDetails))
    } else {
      console.warn('No trip details found in sessionStorage')
      router.push('/dashboard') // Redirigir si no hay datos
    }
  }, [router])

  // Obtener la ubicación del usuario
  useEffect(() => {
    if (isClient && navigator.geolocation) {
      const geoWatchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(newLocation) // Actualizar la ubicación

          // Si la instancia del mapa está disponible, actualizamos la vista
          if (mapInstance) {
            mapInstance.setView(newLocation, mapInstance.getZoom()) // Cambiar la vista del mapa
          }

          // Si el marcador no está creado, lo creamos
          if (marker) {
            marker.setLatLng(newLocation) // Actualizamos la ubicación del marcador
          }
        },
        (error) => {
          console.error("Error al obtener la ubicación:", error)
        },
        {
          enableHighAccuracy: true, // Precisión alta
          maximumAge: 0, // Sin caché
          timeout: 5000 // Tiempo de espera para obtener la ubicación
        }
      );

      // Limpiar la observación de geolocalización cuando el componente se desmonte
      return () => {
        if (geoWatchId) {
          navigator.geolocation.clearWatch(geoWatchId);
        }
      }
    }
  }, [isClient, mapInstance, marker]); // Dependemos de isClient, mapInstance y marker

  // Función para finalizar el viaje
  const handleEndTrip = async () => {
    const supabase = createClient()

    const driverId = tripDetails.driverid

    console.log({ driverId })

    const { error } = await supabase
      .from('deliveries') // Suponiendo que la tabla se llama 'deliveries'
      .update({ status: 'completed' }) // Actualizamos el estatus a 'completed'
      .eq('driverid', driverId) // Asegúrate de que el campo 'driverid' se corresponda con el identificador

    if (error) {
      console.error('Error updating trip status:', error)
    } else {
      console.log('Trip ended and status updated')
      toast.success('Delivery end successfully!');
      router.push('/dashboard') // Redirigir después de la actualización
    }
  }

  if (!tripDetails || !userLocation || !isClient) {
    return <p>Loading...</p> // Esperamos que la ubicación, los detalles del viaje y el cliente estén disponibles
  }

  // Crear un ícono personalizado para el marcador
  const userIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1782/1782249.png', // Asegúrate de que sea un enlace directo a una imagen
    iconSize: [32, 32], // Tamaño del ícono
    iconAnchor: [16, 32], // Punto donde el ícono se "ancla" al marcador
    popupAnchor: [0, -32] // Ajuste de la posición del popup
  });

  return (
    <div className="space-y-6">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Trip Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p><strong>Destination:</strong> {tripDetails.destination}</p>
            <p><strong>Date:</strong> {tripDetails.date}</p>
            <p><strong>Charge Number:</strong> {tripDetails.chargeNumber}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Route Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-64 h-64 mx-auto">
            <MapContainer
              center={userLocation}
              zoom={13}
              className="h-full w-full"
              whenCreated={setMapInstance} // Guardar la instancia del mapa
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
              />
              {/* Usar el ícono personalizado en el marcador */}
              <Marker position={userLocation} icon={userIcon}>
                <Popup>Your current location</Popup>
              </Marker>
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button onClick={handleEndTrip} size="lg">End Trip</Button>
      </div>
    </div>
  )
}

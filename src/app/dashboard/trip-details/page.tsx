'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "../../../../utils/supabase/client";
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { toast } from 'sonner';


// Importar componentes dinámicos de react-leaflet
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

export default function TripDetailsPage() {
  const router = useRouter();
  const [tripDetails, setTripDetails] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  // Obtener los detalles del viaje desde sessionStorage
  useEffect(() => {
    const storedTripDetails = sessionStorage.getItem('tripDetails');
    if (storedTripDetails) {
      setTripDetails(JSON.parse(storedTripDetails));
    } else {
      console.warn('No se encontraron detalles del viaje en sessionStorage');
      router.push('/dashboard');
    }
  }, [router]);

  // Obtener la ubicación del usuario con geolocalización
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      const geoWatchId = navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error al obtener la ubicación:", error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000,
        }
      );

      return () => {
        navigator.geolocation.clearWatch(geoWatchId);
      };
    }
  }, []);

  // Finalizar el viaje y actualizar el estado en Supabase
  const handleEndTrip = async () => {
    const supabase = createClient();
    const driverId = tripDetails.driverid;

    const { error } = await supabase
      .from('deliveries')
      .update({ status: 'completed' })
      .eq('driverid', driverId);

    if (error) {
      console.error('Error al actualizar el estado del viaje:', error);
    } else {
      toast.success('¡Viaje finalizado exitosamente!');
      router.push('/dashboard');
    }
  };

  if (!tripDetails || !userLocation) {
    return <p>Cargando...</p>;
  }

  // Crear un ícono personalizado para el marcador
  const userIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1782/1782249.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  return (
    <div className="space-y-6">
      {/* Detalles del viaje */}
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Detalles del Viaje</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p><strong>Destino:</strong> {tripDetails.destination}</p>
            <p><strong>Fecha:</strong> {tripDetails.date}</p>
            <p><strong>Número de Carga:</strong> {tripDetails.chargeNumber}</p>
          </div>
        </CardContent>
      </Card>

      {/* Mapa */}
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Mapa de la Ruta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full h-64 z-0">
            <MapContainer center={userLocation} zoom={13} className="h-full w-full">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
              />
              <Marker position={userLocation} icon={userIcon}>
                <Popup>Tu ubicación actual</Popup>
              </Marker>
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      {/* Botón para finalizar el viaje */}
      <div className="flex justify-center">
        <Button onClick={handleEndTrip} size="lg">Finalizar Viaje</Button>
      </div>
    </div>
  );
}

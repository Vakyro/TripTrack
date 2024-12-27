'use client'

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from '../contexts/LanguageContext'
import en from '../translations/en.json'
import es from '../translations/es.json'
import pt from '../translations/pt.json'
import { createClient } from '../../../utils/supabase/client'

const translations = { en, es, pt }

export default function Dashboard() {
  const { language } = useLanguage()
  const t = translations[language] || translations.en

  // Estado para almacenar las entregas y el usuario
  const [deliveries, setDeliveries] = useState([])
  const [user, setUser] = useState(null)

  // Crear cliente de Supabase
  const supabase = createClient()

  // Obtener el usuario autenticado y las entregas
  useEffect(() => {
    const fetchUserAndDeliveries = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError || !userData?.user) {
        console.error('Error al obtener el usuario:', userError)
        return
      }

      // Obtener el usuario desde la tabla 'users'
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, auth_user_id')
        .eq('auth_user_id', userData.user.id)

      if (usersError || usersData.length === 0) {
        console.error('Error al obtener los usuarios:', usersError)
        return
      }

      const userFromDb = usersData[0]
      setUser(userFromDb) // Guardar el usuario de la tabla 'users'

      // Obtener las entregas del usuario autenticado
      const { data: deliveriesData, error: deliveriesError } = await supabase
        .from('deliveries') // Nombre de tu tabla de entregas
        .select('*')

      if (deliveriesError) {
        console.error('Error al obtener las entregas:', deliveriesError)
        return
      }

      setDeliveries(deliveriesData) // Guardar las entregas en el estado
    }

    fetchUserAndDeliveries()
  }, [supabase])

  // Filtrar las entregas y obtener las 5 más recientes
  const recentDeliveries = user && deliveries.length > 0 
    ? deliveries
        .filter((delivery) => delivery.driverid === user.id) // Filtrar entregas por el id del usuario
        .sort((a, b) => new Date(b.date) - new Date(a.date)) // Ordenar por fecha descendente
        .slice(0, 5) // Tomar solo los 5 más recientes
    : []

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>{t.dashboard.startTrip}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Record details about your delivery trips</p>
            <a href="/dashboard/start-trip">
              <Button className="mt-4 w-full">New Delivery Trip</Button>
            </a>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t.dashboard.truckIssues}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Report any issues with your truck.</p>
            <a href="/dashboard/issues">
              <Button className="mt-4 w-full">Report Issue</Button>
            </a>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t.dashboard.maintenance}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Log maintenance activities for your truck.</p>
            <a href="/dashboard/maintenance">
              <Button className="mt-4 w-full">Log Maintenance</Button>
            </a>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t.dashboard.recentActivity}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li>
              {recentDeliveries.length > 0 ? (
                recentDeliveries.map((delivery) => (
                  <div key={delivery.id}>
                    Completed trip to: {delivery.destination}
                  </div>
                ))
              ) : (
                <p>No recent activity.</p>
              )}
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

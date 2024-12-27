'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from '@/lib/supabase'
import { createClient } from "../../../../utils/supabase/client"

interface Truck {
  id: number
  name: string
}

interface User {
  id: number
  auth_user_id: string
}

export default function StartTripPage() {
  const router = useRouter()
  const [tripData, setTripData] = useState({
    destination: '',
    vehicle: '',
    date: '',
    chargeNumber: ''
  })

  const [trucks, setTrucks] = useState<Truck[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[] | null>(null)

  useEffect(() => {
    fetchTrucks()
    fetchUser()
    fetchUsers()
  }, [])

  const fetchTrucks = async () => {
    const { data, error } = await supabase.from('trucks').select('id, name')
    if (data) setTrucks(data)
    if (error) console.error('Error fetching trucks:', error)
  }

  const fetchUser = async () => {
    const supabase = createClient()
    const { data, error } = await supabase.auth.getUser()
    if (error || !data?.user) {
      console.log('no user')
    } else {
      setUser(data.user)
    }
  }

  const fetchUsers = async () => {
    const supabase = createClient()
    const { data: users, error: usersError } = await supabase.from("users").select()
    if (usersError) {
      console.log('error fetching users', usersError)
    } else {
      setUsers(users)
    }
  }

  const handleChange = (name: string, value: string) => {
    setTripData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const userId = users?.find(u => u.auth_user_id === user?.id)?.id
    if (!userId) {
      console.error('User ID not found')
      return
    }

    const { data, error } = await supabase
      .from('deliveries')
      .insert({
        destination: tripData.destination,
        vehicleid: parseInt(tripData.vehicle),
        deliverydate: tripData.date,
        chargenumber: tripData.chargeNumber,
        status: 'in progress',
        driverid: userId,
        evidence: null
      })

    if (error) {
      console.error('Error adding delivery:', error)
    } else {
      console.log('Delivery added successfully:', data)
      router.push('/dashboard/trip-details')
    }

  }

  const handleStartTrip = () => {
    const userId = users?.find(u => u.auth_user_id === user?.id)?.id
    const tripDetails = {
      driverid: userId,
      destination: tripData.destination,
      vehicle: tripData.vehicle,
      date: tripData.date,
      chargeNumber: tripData.chargeNumber,
    }
    // Guarda los detalles del viaje en sessionStorage
    sessionStorage.setItem('tripDetails', JSON.stringify(tripDetails))
    router.push('/dashboard/trip-details')
  }


  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Start New Trip</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="destination" className="block text-sm font-medium text-gray-700">Destination</label>
            <Select onValueChange={(value) => handleChange('destination', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select destination" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new-york">New York</SelectItem>
                <SelectItem value="los-angeles">Los Angeles</SelectItem>
                <SelectItem value="chicago">Chicago</SelectItem>
                <SelectItem value="houston">Houston</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="vehicle" className="block text-sm font-medium text-gray-700">Vehicle</label>
            <Select onValueChange={(value) => handleChange('vehicle', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select vehicle" />
              </SelectTrigger>
              <SelectContent>
                {trucks.map((truck) => (
                  <SelectItem key={truck.id} value={truck.id.toString()}>
                    {truck.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
            <Input
              type="date"
              id="date"
              name="date"
              value={tripData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="chargeNumber" className="block text-sm font-medium text-gray-700">Charge Number</label>
            <Input
              type="text"
              id="chargeNumber"
              name="chargeNumber"
              value={tripData.chargeNumber}
              onChange={(e) => handleChange('chargeNumber', e.target.value)}
              required
            />
          </div>
          <Button onClick={handleStartTrip} size="lg">Start Trip</Button>
        </form>
      </CardContent>
    </Card>
  )
}

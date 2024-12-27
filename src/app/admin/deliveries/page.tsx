'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from '@/lib/supabase'

interface Delivery {
  id: number
  destination: string
  vehicleid: number
  deliverydate: string
  chargenumber: string
  evidence: string | null
  status: string
  driverid: number
  trucks?: {
    name: string
  }
  users?: {
    firstname: string
    lastname: string
  }
}

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [trucks, setTrucks] = useState<any[]>([])
  const [drivers, setDrivers] = useState<any[]>([])
  const [newDelivery, setNewDelivery] = useState({
    destination: '',
    vehicleid: '',
    deliverydate: '',
    chargenumber: '',
    status: '',
    driverid: ''
  })
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null)

  useEffect(() => {
    fetchDeliveries()
    fetchTrucks()
    fetchDrivers()
  }, [])

  const fetchDeliveries = async () => {
    try {
      const response = await fetch('/api/deliveries')
      const data = await response.json()
      setDeliveries(data)
    } catch (error) {
      console.error('Error fetching deliveries:', error)
    }
  }

  const fetchTrucks = async () => {
    try {
      const response = await fetch('/api/trucks')
      const data = await response.json()
      setTrucks(data)
    } catch (error) {
      console.error('Error fetching trucks:', error)
    }
  }

  const fetchDrivers = async () => {
    try {
      const response = await fetch('/api/users')
      const data = await response.json()
      setDrivers(data.filter((user: any) => user.role === 'Driver'))
    } catch (error) {
      console.error('Error fetching drivers:', error)
    }
  }

  const addDelivery = async () => {
    try {
      const { data, error } = await supabase
        .from('deliveries')
        .insert([newDelivery])
        .select()

      if (error) throw error

      setDeliveries([...deliveries, data[0]])
      resetNewDelivery()
    } catch (error) {
      console.error('Error adding delivery:', error)
    }
  }

  const updateDelivery = async () => {
    if (editingDelivery) {
      try {
        const { data, error } = await supabase
          .from('deliveries')
          .update(editingDelivery)
          .eq('id', editingDelivery.id)
          .select()

        if (error) throw error

        setDeliveries(deliveries.map(delivery => delivery.id === editingDelivery.id ? data[0] : delivery))
        setEditingDelivery(null)
      } catch (error) {
        console.error('Error updating delivery:', error)
      }
    }
  }

  const deleteDelivery = async (id: number) => {
    try {
      const { error } = await supabase
        .from('deliveries')
        .delete()
        .eq('id', id)

      if (error) throw error

      setDeliveries(deliveries.filter(delivery => delivery.id !== id))
    } catch (error) {
      console.error('Error deleting delivery:', error)
    }
  }

  const resetNewDelivery = () => {
    setNewDelivery({
      destination: '',
      vehicleid: '',
      deliverydate: '',
      chargenumber: '',
      status: '',
      driverid: ''
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ScrollArea className="h-[400px] w-full rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Destination</TableHead>
                  <TableHead className="hidden md:table-cell">Vehicle</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead>Charge #</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="hidden md:table-cell">Driver</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveries.map((delivery) => (
                  <TableRow key={delivery.id}>
                    <TableCell>{delivery.destination}</TableCell>
                    <TableCell className="hidden md:table-cell">{delivery.trucks?.name}</TableCell>
                    <TableCell className="hidden md:table-cell">{new Date(delivery.deliverydate).toLocaleDateString()}</TableCell>
                    <TableCell>{delivery.chargenumber}</TableCell>
                    <TableCell className="hidden md:table-cell">{delivery.status}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {delivery.users ? `${delivery.users.firstname} ${delivery.users.lastname}` : 'Unassigned'}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="destructive" size="sm" onClick={() => deleteDelivery(delivery.id)}>Delete</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
}


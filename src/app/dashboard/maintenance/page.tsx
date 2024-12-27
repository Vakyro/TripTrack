'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { supabase } from '@/lib/supabase'
import { createClient } from "../../../../utils/supabase/client"
import { toast } from 'sonner';

interface Truck {
  id: number
  name: string
}

export default function MaintenanceForm() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    carriername: '',
    unitnumber: '',
    year: '',
    make: '',
    model: '',
    license: '',
    mileageorhours: '',
    inspectiondate: '',
    performedby: '',
    lubrication: '',
    oilchange: '',
    oildadded: false,
    filterchange: false,
    transmission: false,
    differential: false,
    wheelbearings: false,
    batteries: false,
    brakeadjustment: false,
    tirepressure: false,
    alevelservice: false,
    blevelservice: false,
    clevelservice: false,
    truckid: '',
  })

  const [trucks, setTrucks] = useState<Truck[]>([])
  const [userId, setUserId] = useState<string | null>(null)

  const [user, setUser] = useState(null)
  const [users, setUsers] = useState(null)

  useEffect(() => {
      async function getUser(){
          const supabase = createClient()
          const { data, error } = await supabase.auth.getUser()
          if (error || !data?.user) {
              console.log('no user')
          } else {
              setUser(data.user)
          }
      }
      getUser()

      async function getUsers(){
        const supabase = createClient()
        const { data: users, error: usersError } = await supabase.from("users").select()
        if (usersError) {
            console.log('error fetching users', usersError)
        } else {
            setUsers(users)
        }
      }
      getUsers()
  }, [])

  useEffect(() => {
    fetchTrucks()
  }, [])

  const fetchTrucks = async () => {
    const { data, error } = await supabase.from('trucks').select('id, name')
    if (data) setTrucks(data)
    if (error) console.error('Error fetching trucks:', error)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prevState => ({ ...prevState, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prevState => ({ ...prevState, [name]: value }))
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prevState => ({ ...prevState, [name]: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { data, error } = await supabase
      .from('lubricationinspection')
      .insert({
        carriername: formData.carriername,
        unitnumber: parseInt(formData.unitnumber),
        year: parseInt(formData.year),
        make: formData.make,
        model: formData.model,
        license: formData.license,
        mileageorhours: parseInt(formData.mileageorhours),
        inspectiondate: formData.inspectiondate,
        performedby: formData.performedby,
        lubrication: formData.lubrication,
        oilchange: formData.oilchange,
        oildadded: formData.oildadded,
        filterchange: formData.filterchange,
        transmission: formData.transmission,
        differential: formData.differential,
        wheelbearings: formData.wheelbearings,
        batteries: formData.batteries,
        brakeadjustment: formData.brakeadjustment,
        tirepressure: formData.tirepressure,
        alevelservice: formData.alevelservice,
        blevelservice: formData.blevelservice,
        clevelservice: formData.clevelservice,
        truckid: parseInt(formData.truckid),
        userid: users?.find(u => u.auth_user_id === user?.id)?.id // Usar el id del usuario de la tabla users
      })

    if (error) {
      console.error('Error submitting maintenance:', error)
    } else {
      console.log('Maintenance submitted successfully:', data)
      toast.success('Maintenance submitted successfully!');
      router.push('/dashboard')
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Maintenance Form</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="carriername"
            placeholder="Carrier Name"
            value={formData.carriername}
            onChange={handleChange}
            required
          />
          <Input
            name="unitnumber"
            type="number"
            placeholder="Unit Number"
            value={formData.unitnumber}
            onChange={handleChange}
            required
          />
          <Input
            name="year"
            type="number"
            placeholder="Year"
            value={formData.year}
            onChange={handleChange}
            required
          />
          <Input
            name="make"
            placeholder="Make"
            value={formData.make}
            onChange={handleChange}
            required
          />
          <Input
            name="model"
            placeholder="Model"
            value={formData.model}
            onChange={handleChange}
            required
          />
          <Input
            name="license"
            placeholder="License"
            value={formData.license}
            onChange={handleChange}
            required
          />
          <Input
            name="mileageorhours"
            type="number"
            placeholder="Mileage or Hours"
            value={formData.mileageorhours}
            onChange={handleChange}
            required
          />
          <Input
            name="inspectiondate"
            type="date"
            value={formData.inspectiondate}
            onChange={handleChange}
            required
          />
          <Input
            name="performedby"
            placeholder="Performed By"
            value={formData.performedby}
            onChange={handleChange}
            required
          />
          <Input
            name="lubrication"
            placeholder="Lubrication"
            value={formData.lubrication}
            onChange={handleChange}
            required
          />
          <Input
            name="oilchange"
            placeholder="Oil Change"
            value={formData.oilchange}
            onChange={handleChange}
            required
          />
          <div className="space-y-2">
            <Checkbox
              id="oildadded"
              checked={formData.oildadded}
              onCheckedChange={(checked) => handleCheckboxChange('oildadded', checked as boolean)}
            />
            <label htmlFor="oildadded" className="ml-2">Oil Added</label>
          </div>
          <div className="space-y-2">
            <Checkbox
              id="filterchange"
              checked={formData.filterchange}
              onCheckedChange={(checked) => handleCheckboxChange('filterchange', checked as boolean)}
            />
            <label htmlFor="filterchange" className="ml-2">Filter Change</label>
          </div>
          <div className="space-y-2">
            <Checkbox
              id="transmission"
              checked={formData.transmission}
              onCheckedChange={(checked) => handleCheckboxChange('transmission', checked as boolean)}
            />
            <label htmlFor="transmission" className="ml-2">Transmission</label>
          </div>
          <div className="space-y-2">
            <Checkbox
              id="differential"
              checked={formData.differential}
              onCheckedChange={(checked) => handleCheckboxChange('differential', checked as boolean)}
            />
            <label htmlFor="differential" className="ml-2">Differential</label>
          </div>
          <div className="space-y-2">
            <Checkbox
              id="wheelbearings"
              checked={formData.wheelbearings}
              onCheckedChange={(checked) => handleCheckboxChange('wheelbearings', checked as boolean)}
            />
            <label htmlFor="wheelbearings" className="ml-2">Wheel Bearings</label>
          </div>
          <div className="space-y-2">
            <Checkbox
              id="batteries"
              checked={formData.batteries}
              onCheckedChange={(checked) => handleCheckboxChange('batteries', checked as boolean)}
            />
            <label htmlFor="batteries" className="ml-2">Batteries</label>
          </div>
          <div className="space-y-2">
            <Checkbox
              id="brakeadjustment"
              checked={formData.brakeadjustment}
              onCheckedChange={(checked) => handleCheckboxChange('brakeadjustment', checked as boolean)}
            />
            <label htmlFor="brakeadjustment" className="ml-2">Brake Adjustment</label>
          </div>
          <div className="space-y-2">
            <Checkbox
              id="tirepressure"
              checked={formData.tirepressure}
              onCheckedChange={(checked) => handleCheckboxChange('tirepressure', checked as boolean)}
            />
            <label htmlFor="tirepressure" className="ml-2">Tire Pressure</label>
          </div>
          <div className="space-y-2">
            <Checkbox
              id="alevelservice"
              checked={formData.alevelservice}
              onCheckedChange={(checked) => handleCheckboxChange('alevelservice', checked as boolean)}
            />
            <label htmlFor="alevelservice" className="ml-2">A-Level Service</label>
          </div>
          <div className="space-y-2">
            <Checkbox
              id="blevelservice"
              checked={formData.blevelservice}
              onCheckedChange={(checked) => handleCheckboxChange('blevelservice', checked as boolean)}
            />
            <label htmlFor="blevelservice" className="ml-2">B-Level Service</label>
          </div>
          <div className="space-y-2">
            <Checkbox
              id="clevelservice"
              checked={formData.clevelservice}
              onCheckedChange={(checked) => handleCheckboxChange('clevelservice', checked as boolean)}
            />
            <label htmlFor="clevelservice" className="ml-2">C-Level Service</label>
          </div>
          <Select
            value={formData.truckid}
            onValueChange={(value) => handleSelectChange('truckid', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Truck" />
            </SelectTrigger>
            <SelectContent>
              {trucks.map((truck) => (
                <SelectItem key={truck.id} value={truck.id.toString()}>
                  {truck.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit">Submit Maintenance Report</Button>
        </form>
      </CardContent>
    </Card>
  )
}


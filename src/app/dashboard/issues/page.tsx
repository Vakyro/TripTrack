'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from '@/lib/supabase'
import { createClient } from "../../../../utils/supabase/client"
import { toast } from 'sonner';


interface Truck {
  id: number
  name: string
}

export default function IssuesForm() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    carriername: '',
    unitnumber: '',
    year: '',
    make: '',
    model: '',
    license: '',
    mileageorhour: '',
    repairdate: '',
    repairdescription: '',
    truckid: '',
  })

  const [trucks, setTrucks] = useState<Truck[]>([])
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState(null)

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prevState => ({ ...prevState, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prevState => ({ ...prevState, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const userId = users?.find(u => u.auth_user_id === user?.id)?.id
    if (!userId) {
      console.error('User ID not found')
      return
    }

    const { data, error } = await supabase
      .from('repairreport')
      .insert({
        carriername: formData.carriername,
        unitnumber: parseInt(formData.unitnumber),
        year: parseInt(formData.year),
        make: formData.make,
        model: formData.model,
        license: formData.license,
        mileageorhour: parseInt(formData.mileageorhour),
        repairdate: formData.repairdate,
        repairdescription: formData.repairdescription,
        truckid: parseInt(formData.truckid),
        userid: userId
      })

    if (error) {
      console.error('Error submitting issue:', error)
    } else {
      console.log('Issue submitted successfully:', data)
      toast.success('Issue submitted successfully!');
      router.push('/dashboard')
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Report an Issue</CardTitle>
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
            name="mileageorhour"
            type="number"
            placeholder="Mileage or Hours"
            value={formData.mileageorhour}
            onChange={handleChange}
            required
          />
          <Input
            name="repairdate"
            type="date"
            value={formData.repairdate}
            onChange={handleChange}
            required
          />
          <Textarea
            name="repairdescription"
            placeholder="Repair Description"
            value={formData.repairdescription}
            onChange={handleChange}
            required
          />
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
          <Button type="submit" >Submit Issue Report</Button>
        </form>
      </CardContent>
    </Card>
  )
}
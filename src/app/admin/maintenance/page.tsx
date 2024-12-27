'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { supabase } from '@/lib/supabase'

interface MaintenanceRecord {
  id: number
  carriername: string
  unitnumber: number
  year: number
  make: string
  model: string
  license: string
  mileageorhours: number
  inspectiondate: string
  performedby: string
  lubrication: string
  oilchange: string
  oiladded: boolean
  filterchange: boolean
  transmission: boolean
  differential: boolean
  wheelbearings: boolean
  batteries: boolean
  brakeadjustment: boolean
  tirepressure: boolean
  alevelservice: boolean
  blevelservice: boolean
  clevelservice: boolean
  truckid: number
  userid: number
}

export default function MaintenancePage() {
  const [records, setRecords] = useState<MaintenanceRecord[]>([])
  const [newRecord, setNewRecord] = useState<Partial<MaintenanceRecord>>({})
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null)
  const [trucks, setTrucks] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    fetchMaintenanceRecords()
    fetchTrucks()
    fetchUsers()
  }, [])

  const fetchMaintenanceRecords = async () => {
    const { data, error } = await supabase
      .from('lubricationinspection')
      .select('*')
    if (data) setRecords(data)
  }

  const fetchTrucks = async () => {
    const { data, error } = await supabase
      .from('trucks')
      .select('id, name')
    if (data) setTrucks(data)
  }

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('id, firstname, lastname')
    if (data) setUsers(data)
  }

  const addRecord = async () => {
    const { data, error } = await supabase
      .from('lubricationinspection')
      .insert([newRecord])
      .select()

    if (data) {
      setRecords([...records, data[0]])
      setNewRecord({})
    }
  }

  const updateRecord = async () => {
    if (editingRecord) {
      const { data, error } = await supabase
        .from('lubricationinspection')
        .update(editingRecord)
        .eq('id', editingRecord.id)
        .select()

      if (data) {
        setRecords(records.map(record => record.id === editingRecord.id ? data[0] : record))
        setEditingRecord(null)
      }
    }
  }

  const deleteRecord = async (id: number) => {
    const { error } = await supabase
      .from('lubricationinspection')
      .delete()
      .eq('id', id)

    if (!error) {
      setRecords(records.filter(record => record.id !== id))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Maintenance Records</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Input
              placeholder="Carrier Name"
              value={editingRecord?.carriername || newRecord.carriername || ''}
              onChange={(e) => editingRecord ? setEditingRecord({...editingRecord, carriername: e.target.value}) : setNewRecord({...newRecord, carriername: e.target.value})}
            />
            <Input
              placeholder="Unit Number"
              type="number"
              value={editingRecord?.unitnumber || newRecord.unitnumber || ''}
              onChange={(e) => {
                const value = parseInt(e.target.value)
                editingRecord ? setEditingRecord({...editingRecord, unitnumber: value}) : setNewRecord({...newRecord, unitnumber: value})
              }}
            />
            <Input
              placeholder="Year"
              type="number"
              value={editingRecord?.year || newRecord.year || ''}
              onChange={(e) => {
                const value = parseInt(e.target.value)
                editingRecord ? setEditingRecord({...editingRecord, year: value}) : setNewRecord({...newRecord, year: value})
              }}
            />
            <Input
              placeholder="Make"
              value={editingRecord?.make || newRecord.make || ''}
              onChange={(e) => editingRecord ? setEditingRecord({...editingRecord, make: e.target.value}) : setNewRecord({...newRecord, make: e.target.value})}
            />
            <Input
              placeholder="Model"
              value={editingRecord?.model || newRecord.model || ''}
              onChange={(e) => editingRecord ? setEditingRecord({...editingRecord, model: e.target.value}) : setNewRecord({...newRecord, model: e.target.value})}
            />
            <Input
              placeholder="License"
              value={editingRecord?.license || newRecord.license || ''}
              onChange={(e) => editingRecord ? setEditingRecord({...editingRecord, license: e.target.value}) : setNewRecord({...newRecord, license: e.target.value})}
            />
            <Input
              placeholder="Mileage/Hours"
              type="number"
              value={editingRecord?.mileageorhours || newRecord.mileageorhours || ''}
              onChange={(e) => {
                const value = parseInt(e.target.value)
                editingRecord ? setEditingRecord({...editingRecord, mileageorhours: value}) : setNewRecord({...newRecord, mileageorhours: value})
              }}
            />
            <Input
              placeholder="Inspection Date"
              type="date"
              value={editingRecord?.inspectiondate || newRecord.inspectiondate || ''}
              onChange={(e) => editingRecord ? setEditingRecord({...editingRecord, inspectiondate: e.target.value}) : setNewRecord({...newRecord, inspectiondate: e.target.value})}
            />
            <Select
              value={editingRecord?.performedby || newRecord.performedby || ''}
              onValueChange={(value) => editingRecord ? setEditingRecord({...editingRecord, performedby: value}) : setNewRecord({...newRecord, performedby: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Performed By" />
              </SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {`${user.firstname} ${user.lastname}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={editingRecord?.truckid?.toString() || newRecord.truckid?.toString() || ''}
              onValueChange={(value) => {
                const truckId = parseInt(value)
                editingRecord ? setEditingRecord({...editingRecord, truckid: truckId}) : setNewRecord({...newRecord, truckid: truckId})
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Truck" />
              </SelectTrigger>
              <SelectContent>
                {trucks.map(truck => (
                  <SelectItem key={truck.id} value={truck.id.toString()}>
                    {truck.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Lubrication"
              value={editingRecord?.lubrication || newRecord.lubrication || ''}
              onChange={(e) => editingRecord ? setEditingRecord({...editingRecord, lubrication: e.target.value}) : setNewRecord({...newRecord, lubrication: e.target.value})}
            />
            <Input
              placeholder="Oil Change"
              value={editingRecord?.oilchange || newRecord.oilchange || ''}
              onChange={(e) => editingRecord ? setEditingRecord({...editingRecord, oilchange: e.target.value}) : setNewRecord({...newRecord, oilchange: e.target.value})}
            />
            <div className="flex items-center space-x-2">
              <Checkbox
                id="oiladded"
                checked={editingRecord?.oiladded || newRecord.oiladded || false}
                onCheckedChange={(checked) => editingRecord ? setEditingRecord({...editingRecord, oiladded: checked as boolean}) : setNewRecord({...newRecord, oiladded: checked as boolean})}
              />
              <label htmlFor="oiladded">Oil Added</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="filterchange"
                checked={editingRecord?.filterchange || newRecord.filterchange || false}
                onCheckedChange={(checked) => editingRecord ? setEditingRecord({...editingRecord, filterchange: checked as boolean}) : setNewRecord({...newRecord, filterchange: checked as boolean})}
              />
              <label htmlFor="filterchange">Filter Change</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="transmission"
                checked={editingRecord?.transmission || newRecord.transmission || false}
                onCheckedChange={(checked) => editingRecord ? setEditingRecord({...editingRecord, transmission: checked as boolean}) : setNewRecord({...newRecord, transmission: checked as boolean})}
              />
              <label htmlFor="transmission">Transmission</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="differential"
                checked={editingRecord?.differential || newRecord.differential || false}
                onCheckedChange={(checked) => editingRecord ? setEditingRecord({...editingRecord, differential: checked as boolean}) : setNewRecord({...newRecord, differential: checked as boolean})}
              />
              <label htmlFor="differential">Differential</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="wheelbearings"
                checked={editingRecord?.wheelbearings || newRecord.wheelbearings || false}
                onCheckedChange={(checked) => editingRecord ? setEditingRecord({...editingRecord, wheelbearings: checked as boolean}) : setNewRecord({...newRecord, wheelbearings: checked as boolean})}
              />
              <label htmlFor="wheelbearings">Wheel Bearings</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="batteries"
                checked={editingRecord?.batteries || newRecord.batteries || false}
                onCheckedChange={(checked) => editingRecord ? setEditingRecord({...editingRecord, batteries: checked as boolean}) : setNewRecord({...newRecord, batteries: checked as boolean})}
              />
              <label htmlFor="batteries">Batteries</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="brakeadjustment"
                checked={editingRecord?.brakeadjustment || newRecord.brakeadjustment || false}
                onCheckedChange={(checked) => editingRecord ? setEditingRecord({...editingRecord, brakeadjustment: checked as boolean}) : setNewRecord({...newRecord, brakeadjustment: checked as boolean})}
              />
              <label htmlFor="brakeadjustment">Brake Adjustment</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="tirepressure"
                checked={editingRecord?.tirepressure || newRecord.tirepressure || false}
                onCheckedChange={(checked) => editingRecord ? setEditingRecord({...editingRecord, tirepressure: checked as boolean}) : setNewRecord({...newRecord, tirepressure: checked as boolean})}
              />
              <label htmlFor="tirepressure">Tire Pressure</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="alevelservice"
                checked={editingRecord?.alevelservice || newRecord.alevelservice || false}
                onCheckedChange={(checked) => editingRecord ? setEditingRecord({...editingRecord, alevelservice: checked as boolean}) : setNewRecord({...newRecord, alevelservice: checked as boolean})}
              />
              <label htmlFor="alevelservice">A-Level Service</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="blevelservice"
                checked={editingRecord?.blevelservice || newRecord.blevelservice || false}
                onCheckedChange={(checked) => editingRecord ? setEditingRecord({...editingRecord, blevelservice: checked as boolean}) : setNewRecord({...newRecord, blevelservice: checked as boolean})}
              />
              <label htmlFor="blevelservice">B-Level Service</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="clevelservice"
                checked={editingRecord?.clevelservice || newRecord.clevelservice || false}
                onCheckedChange={(checked) => editingRecord ? setEditingRecord({...editingRecord, clevelservice: checked as boolean}) : setNewRecord({...newRecord, clevelservice: checked as boolean})}
              />
              <label htmlFor="clevelservice">C-Level Service</label>
            </div>
          </div>
          <Button onClick={editingRecord ? updateRecord : addRecord} className="w-full sm:w-auto">
            {editingRecord ? 'Update' : 'Add'} Maintenance Record
          </Button>
          <ScrollArea className="h-[400px] w-full rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Carrier Name</TableHead>
                  <TableHead>Unit Number</TableHead>
                  <TableHead>Inspection Date</TableHead>
                  <TableHead>Performed By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.carriername}</TableCell>
                    <TableCell>{record.unitnumber}</TableCell>
                    <TableCell>{new Date(record.inspectiondate).toLocaleDateString()}</TableCell>
                    <TableCell>{record.performedby}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => setEditingRecord(record)}>Edit</Button>
                        <Button variant="destructive" size="sm" onClick={() => deleteRecord(record.id)}>Delete</Button>
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


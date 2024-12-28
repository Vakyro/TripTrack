'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from '@/lib/supabase'

interface RepairReport {
  id: number
  carriername: string
  unitnumber: number
  year: number
  make: string
  model: string
  license: string
  mileageorhour: number
  repairdate: string
  repairdescription: string
  truckid: number
  userid: number
  trucks: { name: string } | null
  users: { firstname: string, lastname: string } | null
}

export default function RepairReportsPage() {
  const [repairReports, setRepairReports] = useState<RepairReport[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [newRepairReport, setNewRepairReport] = useState<Partial<RepairReport>>({
    truckid: 0,
    carriername: '',
    unitnumber: 0,
    year: new Date().getFullYear(),
    make: '',
    model: '',
    license: '',
    mileageorhour: 0,
    repairdate: new Date().toISOString().split('T')[0],
    repairdescription: '',
    userid: 0,
  })
  const [editingRepairReport, setEditingRepairReport] = useState<RepairReport | null>(null)

  useEffect(() => {
    fetchRepairReports()
    fetchVehicles()
    fetchUsers()
  }, [])

  const fetchRepairReports = async () => {
    const { data, error } = await supabase
      .from('repairreport')
      .select('id, carriername, unitnumber, year, make, model, license, mileageorhour, repairdate, repairdescription, truckid, userid, trucks(name), users(firstname, lastname)')
    if (data) setRepairReports(data as RepairReport[])
    if (error) console.error('Error fetching repair reports:', error)
  }

  const fetchVehicles = async () => {
    const { data, error } = await supabase
      .from('trucks')
      .select('id, name')
    if (data) setVehicles(data)
    if (error) console.error('Error fetching vehicles:', error)
  }

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('id, firstname, lastname')
    if (data) setUsers(data)
    if (error) console.error('Error fetching users:', error)
  }

  const addRepairReport = async () => {
    const { data, error } = await supabase
      .from('repairreport')
      .insert([newRepairReport])
      .select()

    if (error) {
      console.error('Error adding repair report:', error)
    } else if (data) {
      setRepairReports([...repairReports, data[0] as RepairReport])
      setNewRepairReport({
        truckid: 0,
        carriername: '',
        unitnumber: 0,
        year: new Date().getFullYear(),
        make: '',
        model: '',
        license: '',
        mileageorhour: 0,
        repairdate: new Date().toISOString().split('T')[0],
        repairdescription: '',
        userid: 0,
      })
    }
  }

  const updateRepairReport = async () => {
    if (editingRepairReport) {
      const { data, error } = await supabase
        .from('repairreport')
        .update(editingRepairReport)
        .eq('id', editingRepairReport.id)
        .select()

      if (error) {
        console.error('Error updating repair report:', error)
      } else if (data) {
        setRepairReports(repairReports.map(report => report.id === editingRepairReport.id ? data[0] as RepairReport : report))
        setEditingRepairReport(null)
      }
    }
  }

  const deleteRepairReport = async (id: number) => {
    const { error } = await supabase
      .from('repairreport')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting repair report:', error)
    } else {
      setRepairReports(repairReports.filter(report => report.id !== id))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Repair Report Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ScrollArea className="h-[400px] w-full rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Carrier Name</TableHead>
                  <TableHead>Unit Number</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Make</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>License</TableHead>
                  <TableHead>Mileage/Hour</TableHead>
                  <TableHead>Repair Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Truck</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {repairReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{report.carriername}</TableCell>
                    <TableCell>{report.unitnumber}</TableCell>
                    <TableCell>{report.year}</TableCell>
                    <TableCell>{report.make}</TableCell>
                    <TableCell>{report.model}</TableCell>
                    <TableCell>{report.license}</TableCell>
                    <TableCell>{report.mileageorhour}</TableCell>
                    <TableCell>{new Date(report.repairdate).toLocaleDateString()}</TableCell>
                    <TableCell>{report.repairdescription}</TableCell>
                    <TableCell>{report.trucks?.name}</TableCell>
                    <TableCell>{`${report.users?.firstname || ''} ${report.users?.lastname || ''}`}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="destructive" size="sm" onClick={() => deleteRepairReport(report.id)}>Delete</Button>
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
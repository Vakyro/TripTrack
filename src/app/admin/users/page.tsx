'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  firstname: string
  lastname: string
  role: string
  assignedvehicleid: number | null
  trucks?: {
    name: string
  }
  phonenumber: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [trucks, setTrucks] = useState<any[]>([])
  const [newUser, setNewUser] = useState<Partial<User>>({
    firstname: '',
    lastname: '',
    role: '',
    assignedvehicleid: null,
    phonenumber: ''
  })
  const [editingUser, setEditingUser] = useState<User | null>(null)

  useEffect(() => {
    fetchUsers()
    fetchTrucks()
  }, [])

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
    if (data) setUsers(data)
    if (error) console.error('Error fetching users:', error)
  }

  const fetchTrucks = async () => {
    const { data, error } = await supabase
      .from('trucks')
      .select('id, name')
    if (data) setTrucks(data)
    if (error) console.error('Error fetching trucks:', error)
  }

  const addUser = async () => {
    // Validate required fields
    if (!newUser.firstname || !newUser.lastname || !newUser.role) {
      console.error('Error: All fields except Assigned Vehicle and Phone Number are required');
      return;
    }

    console.log('Attempting to add user:', newUser);
    const { data, error } = await supabase
      .from('users')
      .insert([newUser])
      .select()

    if (error) {
      console.error('Error adding user:', error)
    } else if (data) {
      console.log('User added successfully:', data);
      const router = useRouter()
      setUsers([...users, data[0]])
      setNewUser({
        firstname: '',
        lastname: '',
        role: '',
        assignedvehicleid: null,
        phonenumber: ''
      })
    }
  }

  const updateUser = async () => {
    if (editingUser) {
      const { data, error } = await supabase
        .from('users')
        .update(editingUser)
        .eq('id', editingUser.id)
        .select()

      if (error) {
        console.error('Error updating user:', error)
      } else if (data) {
        setUsers(users.map(user => user.id === editingUser.id ? data[0] : user))
        setEditingUser(null)
      }
    }
  }

  const deleteUser = async (id: string) => {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting user:', error)
    } else {
      setUsers(users.filter(user => user.id !== id))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Input
              placeholder="Name"
              value={editingUser ? editingUser.firstname : newUser.firstname}
              onChange={(e) => editingUser ? setEditingUser({...editingUser, firstname: e.target.value}) : setNewUser({...newUser, firstname: e.target.value})}
            />
            <Input
              placeholder="Last Name"
              value={editingUser ? editingUser.lastname : newUser.lastname}
              onChange={(e) => editingUser ? setEditingUser({...editingUser, lastname: e.target.value}) : setNewUser({...newUser, lastname: e.target.value})}
            />
            <Select
              value={editingUser ? editingUser.role : newUser.role}
              onValueChange={(value) => editingUser ? setEditingUser({...editingUser, role: value}) : setNewUser({...newUser, role: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="driver">Driver</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={editingUser ? editingUser.assignedvehicleid?.toString() : newUser.assignedvehicleid?.toString()}
              onValueChange={(value) => {
                const vehicleId = value ? parseInt(value) : null
                editingUser ? setEditingUser({...editingUser, assignedvehicleid: vehicleId}) : setNewUser({...newUser, assignedvehicleid: vehicleId})
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select truck" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="null">None</SelectItem>
                {trucks.map(truck => (
                  <SelectItem key={truck.id} value={truck.id.toString()}>
                    {truck.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Phone Number"
              value={editingUser ? editingUser.phonenumber : newUser.phonenumber}
              onChange={(e) => editingUser ? setEditingUser({...editingUser, phonenumber: e.target.value}) : setNewUser({...newUser, phonenumber: e.target.value})}
            />
          </div>
          <a href="/admin/users/authUser">
            <Button onClick={editingUser ? updateUser : addUser} className="w-full sm:w-auto">
              {editingUser ? 'Update' : 'Add'} User
            </Button>
          </a>
          <ScrollArea className="h-[400px] w-full rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Id</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Last Name</TableHead>
                  <TableHead className="hidden md:table-cell">Role</TableHead>
                  <TableHead className="hidden md:table-cell">Assigned Vehicle</TableHead>
                  <TableHead className="hidden md:table-cell">Phone</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.firstname}</TableCell>
                    <TableCell>{user.lastname}</TableCell>
                    <TableCell className="hidden md:table-cell">{user.role}</TableCell>
                    <TableCell>
                      {trucks
                        .filter((truck) => truck.id === user.assignedvehicleid)
                        .map((truck) => (
                          <p key={truck.id}>{truck.name}</p>
                        ))}
                      {/* Mostrar un mensaje si no hay vehículo asignado */}
                      {!trucks.some((truck) => truck.id === user.assignedvehicleid) && (
                        <p>No vehicle assigned</p>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{user.phonenumber}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => setEditingUser(user)}>Edit</Button>
                        <Button variant="destructive" size="sm" onClick={() => deleteUser(user.id)}>Delete</Button>
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

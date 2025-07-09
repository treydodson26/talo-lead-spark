import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  Clock, 
  UserPlus, 
  Search,
  Filter,
  Download,
  Send,
  CheckCircle,
  XCircle,
  Bell
} from 'lucide-react';

interface Instructor {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  certification_level: '200hr' | '500hr' | 'advanced';
  base_rate: number;
  per_student_rate: number;
  substitute_rate_multiplier: number;
  is_active: boolean;
  bio?: string;
  specialties?: string[];
  created_at: string;
}

interface Class {
  id: string;
  name: string;
  instructor_id?: string;
  substitute_instructor_id?: string;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  student_count: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'needs_substitute';
  is_substitute_class: boolean;
  substitute_notice_hours?: number;
  room?: string;
}

interface PayrollRecord {
  id: string;
  instructor_id: string;
  class_id: string;
  base_payment: number;
  student_payment: number;
  total_payment: number;
  is_substitute: boolean;
  substitute_multiplier?: number;
  status: string;
  created_at: string;
}

interface SubstituteRequest {
  id: string;
  class_id: string;
  original_instructor_id: string;
  request_reason?: string;
  notice_hours: number;
  priority_level: number;
  status: 'pending' | 'filled' | 'escalated' | 'cancelled';
  filled_by_instructor_id?: string;
  created_at: string;
}

export function ContractorManagement() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [substituteRequests, setSubstituteRequests] = useState<SubstituteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('instructors');
  const [showAddInstructor, setShowAddInstructor] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Form states
  const [newInstructor, setNewInstructor] = useState<{
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    certification_level: '200hr' | '500hr' | 'advanced';
    base_rate: number;
    per_student_rate: number;
    bio: string;
    specialties: string[];
  }>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    certification_level: '200hr',
    base_rate: 50,
    per_student_rate: 5,
    bio: '',
    specialties: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [instructorsRes, classesRes, payrollRes, substituteRes] = await Promise.all([
        supabase.from('instructors').select('*').order('first_name'),
        supabase.from('classes').select('*').order('scheduled_date'),
        supabase.from('payroll_records').select('*').order('created_at', { ascending: false }),
        supabase.from('substitute_requests').select('*').order('created_at', { ascending: false })
      ]);

      if (instructorsRes.data) setInstructors(instructorsRes.data);
      if (classesRes.data) setClasses(classesRes.data);
      if (payrollRes.data) setPayrollRecords(payrollRes.data);
      if (substituteRes.data) setSubstituteRequests(substituteRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load contractor data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addInstructor = async () => {
    try {
      const { error } = await supabase
        .from('instructors')
        .insert([newInstructor]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Instructor added successfully"
      });
      
      setShowAddInstructor(false);
      setNewInstructor({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        certification_level: '200hr',
        base_rate: 50,
        per_student_rate: 5,
        bio: '',
        specialties: []
      });
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const calculatePayroll = async (classId: string, instructorId: string, studentCount: number, isSubstitute: boolean = false, noticeHours?: number) => {
    try {
      const { data, error } = await supabase.rpc('calculate_instructor_payment', {
        p_instructor_id: instructorId,
        p_class_id: classId,
        p_student_count: studentCount,
        p_is_substitute: isSubstitute,
        p_notice_hours: noticeHours
      });

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error calculating payroll:', error);
      return null;
    }
  };

  const generatePayrollRecord = async (classId: string) => {
    const classData = classes.find(c => c.id === classId);
    if (!classData) return;

    const instructorId = classData.substitute_instructor_id || classData.instructor_id;
    if (!instructorId) return;

    const payrollData = await calculatePayroll(
      classId, 
      instructorId, 
      classData.student_count,
      classData.is_substitute_class,
      classData.substitute_notice_hours
    );

    if (payrollData) {
      try {
        const { error } = await supabase
          .from('payroll_records')
          .insert([{
            instructor_id: instructorId,
            class_id: classId,
            base_payment: payrollData.base_payment,
            student_payment: payrollData.student_payment,
            total_payment: payrollData.total_payment,
            is_substitute: classData.is_substitute_class,
            substitute_multiplier: payrollData.substitute_multiplier
          }]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Payroll record generated"
        });
        loadData();
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      }
    }
  };

  const requestSubstitute = async (classId: string, reason: string) => {
    const classData = classes.find(c => c.id === classId);
    if (!classData || !classData.instructor_id) return;

    const classDate = new Date(`${classData.scheduled_date}T${classData.start_time}`);
    const now = new Date();
    const noticeHours = Math.max(0, Math.floor((classDate.getTime() - now.getTime()) / (1000 * 60 * 60)));

    try {
      const { error } = await supabase
        .from('substitute_requests')
        .insert([{
          class_id: classId,
          original_instructor_id: classData.instructor_id,
          request_reason: reason,
          notice_hours: noticeHours,
          priority_level: noticeHours < 24 ? 3 : noticeHours < 48 ? 2 : 1
        }]);

      if (error) throw error;

      // Update class status
      await supabase
        .from('classes')
        .update({ status: 'needs_substitute' })
        .eq('id', classId);

      toast({
        title: "Success",
        description: "Substitute request created"
      });
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const filteredInstructors = instructors.filter(instructor =>
    instructor.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instructor.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instructor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCertificationBadgeColor = (level: string) => {
    switch (level) {
      case '200hr': return 'bg-blue-100 text-blue-800';
      case '500hr': return 'bg-green-100 text-green-800';
      case 'advanced': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (level: number) => {
    switch (level) {
      case 3: return 'bg-red-100 text-red-800';
      case 2: return 'bg-orange-100 text-orange-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return <div className="p-6">Loading contractor management...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Contractor Management</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddInstructor(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Instructor
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="instructors" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Instructors
          </TabsTrigger>
          <TabsTrigger value="classes" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Classes
          </TabsTrigger>
          <TabsTrigger value="payroll" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Payroll
          </TabsTrigger>
          <TabsTrigger value="substitutes" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Substitutes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="instructors" className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Search instructors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid gap-4">
            {filteredInstructors.map((instructor) => (
              <Card key={instructor.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">
                          {instructor.first_name} {instructor.last_name}
                        </h3>
                        <Badge className={getCertificationBadgeColor(instructor.certification_level)}>
                          {instructor.certification_level}
                        </Badge>
                        <Badge variant={instructor.is_active ? "default" : "secondary"}>
                          {instructor.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>{instructor.email}</p>
                        {instructor.phone && <p>{instructor.phone}</p>}
                      </div>

                      <div className="flex gap-4 text-sm">
                        <span>Base Rate: ${instructor.base_rate}</span>
                        <span>Per Student: ${instructor.per_student_rate}</span>
                        <span>Sub Multiplier: {instructor.substitute_rate_multiplier}x</span>
                      </div>

                      {instructor.specialties && instructor.specialties.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {instructor.specialties.map((specialty, index) => (
                            <Badge key={index} variant="outline">{specialty}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="classes" className="space-y-4">
          <div className="grid gap-4">
            {classes.map((classItem) => (
              <Card key={classItem.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{classItem.name}</h3>
                        <Badge variant={classItem.status === 'needs_substitute' ? "destructive" : "default"}>
                          {classItem.status}
                        </Badge>
                        {classItem.is_substitute_class && (
                          <Badge variant="secondary">Substitute Class</Badge>
                        )}
                      </div>
                      
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>{new Date(classItem.scheduled_date).toLocaleDateString()} at {classItem.start_time}</p>
                        <p>Students: {classItem.student_count}</p>
                        {classItem.room && <p>Room: {classItem.room}</p>}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {classItem.status === 'completed' && (
                        <Button 
                          size="sm" 
                          onClick={() => generatePayrollRecord(classItem.id)}
                          disabled={payrollRecords.some(p => p.class_id === classItem.id)}
                        >
                          {payrollRecords.some(p => p.class_id === classItem.id) ? 'Payroll Created' : 'Generate Payroll'}
                        </Button>
                      )}
                      
                      {classItem.status === 'scheduled' && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              Request Substitute
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Request Substitute</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Reason for substitution</Label>
                                <Textarea placeholder="Enter reason..." />
                              </div>
                              <Button onClick={() => requestSubstitute(classItem.id, "Instructor unavailable")}>
                                Send Request
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Payroll Records</h2>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export Monthly Report
            </Button>
          </div>

          <div className="grid gap-4">
            {payrollRecords.map((record) => {
              const instructor = instructors.find(i => i.id === record.instructor_id);
              const classData = classes.find(c => c.id === record.class_id);
              
              return (
                <Card key={record.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">
                            {instructor?.first_name} {instructor?.last_name}
                          </h3>
                          <Badge variant={record.status === 'paid' ? "default" : "secondary"}>
                            {record.status}
                          </Badge>
                          {record.is_substitute && (
                            <Badge variant="outline">Substitute</Badge>
                          )}
                        </div>
                        
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Class: {classData?.name}</p>
                          <p>Date: {new Date(record.created_at).toLocaleDateString()}</p>
                        </div>

                        <div className="flex gap-4 text-sm">
                          <span>Base: ${record.base_payment}</span>
                          <span>Students: ${record.student_payment}</span>
                          {record.substitute_multiplier && record.substitute_multiplier > 1 && (
                            <span>Multiplier: {record.substitute_multiplier}x</span>
                          )}
                          <span className="font-semibold">Total: ${record.total_payment}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                        {record.status === 'pending' && (
                          <Button size="sm">
                            Process Payment
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="substitutes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Substitute Requests</h2>
            <Button>
              <Bell className="h-4 w-4 mr-2" />
              Broadcast All Pending
            </Button>
          </div>

          <div className="grid gap-4">
            {substituteRequests.map((request) => {
              const classData = classes.find(c => c.id === request.class_id);
              const originalInstructor = instructors.find(i => i.id === request.original_instructor_id);
              const substituteInstructor = request.filled_by_instructor_id ? 
                instructors.find(i => i.id === request.filled_by_instructor_id) : null;
              
              return (
                <Card key={request.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">{classData?.name}</h3>
                          <Badge className={getPriorityColor(request.priority_level)}>
                            {request.priority_level === 3 ? 'Emergency' : 
                             request.priority_level === 2 ? 'Urgent' : 'Normal'}
                          </Badge>
                          <Badge variant={
                            request.status === 'filled' ? "default" :
                            request.status === 'escalated' ? "destructive" : "secondary"
                          }>
                            {request.status}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Original Instructor: {originalInstructor?.first_name} {originalInstructor?.last_name}</p>
                          <p>Class Date: {classData && new Date(classData.scheduled_date).toLocaleDateString()}</p>
                          <p>Notice: {request.notice_hours} hours</p>
                          {request.request_reason && <p>Reason: {request.request_reason}</p>}
                          {substituteInstructor && (
                            <p>Filled by: {substituteInstructor.first_name} {substituteInstructor.last_name}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {request.status === 'pending' && (
                          <>
                            <Button size="sm" variant="outline">
                              <Send className="h-4 w-4 mr-2" />
                              Broadcast
                            </Button>
                            <Button size="sm">
                              Find Substitute
                            </Button>
                          </>
                        )}
                        {request.status === 'filled' && (
                          <Button size="sm" variant="outline" disabled>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Filled
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Instructor Dialog */}
      <Dialog open={showAddInstructor} onOpenChange={setShowAddInstructor}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Instructor</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={newInstructor.first_name}
                  onChange={(e) => setNewInstructor(prev => ({ ...prev, first_name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={newInstructor.last_name}
                  onChange={(e) => setNewInstructor(prev => ({ ...prev, last_name: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newInstructor.email}
                onChange={(e) => setNewInstructor(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={newInstructor.phone}
                onChange={(e) => setNewInstructor(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="certification">Certification Level</Label>
              <Select 
                value={newInstructor.certification_level} 
                onValueChange={(value: '200hr' | '500hr' | 'advanced') => 
                  setNewInstructor(prev => ({ ...prev, certification_level: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="200hr">200 Hour</SelectItem>
                  <SelectItem value="500hr">500 Hour</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="base_rate">Base Rate ($)</Label>
                <Input
                  id="base_rate"
                  type="number"
                  value={newInstructor.base_rate}
                  onChange={(e) => setNewInstructor(prev => ({ ...prev, base_rate: Number(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="per_student_rate">Per Student Rate ($)</Label>
                <Input
                  id="per_student_rate"
                  type="number"
                  value={newInstructor.per_student_rate}
                  onChange={(e) => setNewInstructor(prev => ({ ...prev, per_student_rate: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={newInstructor.bio}
                onChange={(e) => setNewInstructor(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Brief bio and teaching philosophy..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddInstructor(false)}>
                Cancel
              </Button>
              <Button onClick={addInstructor}>
                Add Instructor
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
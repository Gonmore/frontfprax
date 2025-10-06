'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';
import { AuthGuard } from '@/components/auth/auth-guard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  GraduationCap,
  Building2,
  UserPlus,
  BookOpen,
  Award,
  TrendingUp,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Star,
  Upload,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Briefcase
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
// Simple Alert component
const Alert: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`relative w-full rounded-lg border p-4 ${className || ''}`}>
    {children}
  </div>
);

const AlertDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`text-sm ${className || ''}`}>
    {children}
  </div>
);
import { Checkbox } from '@/components/ui/checkbox';
import { scenterService } from '@/lib/services';
import { tutorsService } from '@/lib/services';

interface Student {
  id: number;
  user: {
    id: number;
    name: string;
    surname: string;
    email: string;
    phone: string;
    active: boolean;
  };
  grade?: string;
  course?: string;
  car: boolean;
  profamily?: {
    id: number;
    name: string;
  };
  profamilyId?: number;
  tutor?: {
    id: string;
    name: string;
    email: string;
  };
  cv: {
    verificationStatus: string;
    verifiedAt: string;
  };
  verificationStatus: string;
  internshipStatus: string;
  applications: any[];
  applicationStats: {
    total: number;
    pending: number;
    reviewed: number;
    accepted: number;
    rejected: number;
  };
}

interface Profamily {
  id: number;
  name: string;
  description: string;
}

interface BulkUploadResult {
  total: number;
  successCount: number;
  errorCount: number;
  success: Array<{
    row: number;
    student: {
      id: number;
      name: string;
      surname: string;
      email: string;
      tempPassword: string;
    };
  }>;
  errors: Array<{
    row: number;
    message: string;
  }>;
}

function StudyCenterManagementContent() {
  const { user, canAccessRole } = useAuthStore();
  const [students, setStudents] = useState<Student[]>([]);
  const [profamilies, setProfamilies] = useState<Profamily[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('students');
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isAddProfamilyModalOpen, setIsAddProfamilyModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [bulkUploadResult, setBulkUploadResult] = useState<BulkUploadResult | null>(null);

  // Form states
  const [studentForm, setStudentForm] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    grade: '',
    course: '',
    hasCar: false,
    profamilyId: ''
  });

  const [profamilyForm, setProfamilyForm] = useState({
    name: '',
    description: ''
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Verificar que el usuario puede acceder como centro de estudios
  if (!canAccessRole('scenter')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Acceso Denegado</h3>
            <p className="text-gray-600">No tienes permisos para acceder a la gestión del centro de estudios.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Cargar estudiantes
      const studentsResponse = await scenterService.getScenterStudents();
      if (studentsResponse.data.success) {
        setStudents(studentsResponse.data.data);
      }

      // Cargar familias profesionales
      const profamiliesResponse = await scenterService.getScenterProfamilys();
      if (profamiliesResponse.data.success) {
        setProfamilies(profamiliesResponse.data.data);
      }

    } catch (err: any) {
      console.error('Error loading data:', err);
      setError('Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);

      const academicBackground = {
        grade: studentForm.grade,
        course: studentForm.course,
        scenter: '', // Se llenará automáticamente en el backend
        profamily: studentForm.profamilyId,
        status: 'verified'
      };

      const response = await scenterService.addVerifiedStudent({
        name: studentForm.name,
        surname: studentForm.surname,
        email: studentForm.email,
        phone: studentForm.phone,
        grade: studentForm.grade,
        course: studentForm.course,
        car: studentForm.hasCar,
        profamilyId: parseInt(studentForm.profamilyId),
        academicBackground
      });

      if (response.data.success) {
        setSuccess('Estudiante agregado exitosamente');
        setIsAddStudentModalOpen(false);
        setStudentForm({
          name: '',
          surname: '',
          email: '',
          phone: '',
          grade: '',
          course: '',
          hasCar: false,
          profamilyId: ''
        });
        loadData(); // Recargar datos
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.data.message || 'Error al agregar estudiante');
      }
    } catch (err: any) {
      console.error('Error adding student:', err);
      setError(err.response?.data?.message || 'Error al agregar estudiante');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProfamily = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);

      const response = await scenterService.addProfamilyToScenter({
        name: profamilyForm.name,
        description: profamilyForm.description
      });

      if (response.data.success) {
        setSuccess('Familia profesional agregada exitosamente');
        setIsAddProfamilyModalOpen(false);
        setProfamilyForm({ name: '', description: '' });
        loadData(); // Recargar datos
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.data.message || 'Error al agregar familia profesional');
      }
    } catch (err: any) {
      console.error('Error adding profamily:', err);
      setError(err.response?.data?.message || 'Error al agregar familia profesional');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Por favor selecciona un archivo Excel');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setBulkUploadResult(null);

      const formData = new FormData();
      formData.append('excelFile', selectedFile);

      const response = await scenterService.bulkAddVerifiedStudents(formData);

      if (response.data.success) {
        setBulkUploadResult(response.data.data);
        setSuccess(`Carga masiva completada: ${response.data.data.successCount} estudiantes agregados, ${response.data.data.errorCount} errores`);
        setIsBulkUploadModalOpen(false);
        setSelectedFile(null);
        loadData(); // Recargar datos
        setTimeout(() => {
          setSuccess(null);
          setBulkUploadResult(null);
        }, 5000);
      } else {
        setError(response.data.message || 'Error en la carga masiva');
      }
    } catch (err: any) {
      console.error('Error bulk uploading:', err);
      setError(err.response?.data?.message || 'Error en la carga masiva');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    `${student.user.name} ${student.user.surname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.profamily?.name && student.profamily.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredProfamilies = profamilies.filter(profamily =>
    profamily.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (profamily.description && profamily.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getVerificationStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'unverified': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVerificationStatusText = (status: string) => {
    switch (status) {
      case 'verified': return 'Verificado';
      case 'pending': return 'Pendiente';
      case 'unverified': return 'No verificado';
      default: return 'Desconocido';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión del Centro de Estudios</h1>
              <p className="text-gray-600 mt-2">Administra estudiantes, familias profesionales y carga masiva de datos</p>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => setIsBulkUploadModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="w-4 h-4 mr-2" />
                Carga Masiva
              </Button>
              <Button
                onClick={() => setIsAddStudentModalOpen(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Agregar Estudiante
              </Button>
              <Button
                onClick={() => setIsAddProfamilyModalOpen(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva Familia
              </Button>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Bulk Upload Result */}
        {bulkUploadResult && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <div className="space-y-2">
                <p><strong>Resultado de carga masiva:</strong></p>
                <p>✓ {bulkUploadResult.successCount} estudiantes agregados exitosamente</p>
                {bulkUploadResult.errorCount > 0 && (
                  <p>✗ {bulkUploadResult.errorCount} errores encontrados</p>
                )}
                {bulkUploadResult.errors && bulkUploadResult.errors.length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm">Ver detalles de errores</summary>
                    <ul className="mt-2 text-xs space-y-1">
                      {bulkUploadResult.errors.slice(0, 5).map((error, index) => (
                        <li key={index} className="text-red-600">• {error.message}</li>
                      ))}
                      {bulkUploadResult.errors.length > 5 && (
                        <li className="text-gray-600">... y {bulkUploadResult.errors.length - 5} más</li>
                      )}
                    </ul>
                  </details>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Estudiantes Verificados</p>
                  <div className="text-2xl font-bold">{students.length}</div>
                  <p className="text-xs text-gray-500">
                    {students.filter(s => s.verificationStatus === 'verified').length} verificados
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Briefcase className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Familias Profesionales</p>
                  <div className="text-2xl font-bold">{profamilies.length}</div>
                  <p className="text-xs text-gray-500">activas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tasa de Éxito</p>
                  <div className="text-2xl font-bold">
                    {students.length > 0 ?
                      Math.round((students.filter(s => s.internshipStatus === 'completed').length / students.length) * 100) : 0}%
                  </div>
                  <p className="text-xs text-gray-500">prácticas completadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardContent className="p-6">
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <div className="flex items-center justify-between mb-6">
                <TabsList>
                  <TabsTrigger value="students">Estudiantes</TabsTrigger>
                  <TabsTrigger value="profamilies">Familias Profesionales</TabsTrigger>
                </TabsList>
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
              </div>

              <TabsContent value="students">
                <div className="space-y-4">
                  {filteredStudents.map((student) => (
                    <Card key={student.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarFallback>
                              {`${student.user.name[0]}${student.user.surname[0]}`.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-lg font-semibold">{`${student.user.name} ${student.user.surname}`}</h3>
                            <p className="text-gray-600">{student.user.email}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-sm text-gray-500">
                                <GraduationCap className="w-4 h-4 inline mr-1" />
                                {student.grade} - {student.course}
                              </span>
                              {student.profamily && (
                                <span className="text-sm text-gray-500">
                                  <Briefcase className="w-4 h-4 inline mr-1" />
                                  {student.profamily.name}
                                </span>
                              )}
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVerificationStatusColor(student.verificationStatus)}`}>
                                {getVerificationStatusText(student.verificationStatus)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            Ver Detalles
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                  {filteredStudents.length === 0 && (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No se encontraron estudiantes</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="profamilies">
                <div className="space-y-4">
                  {filteredProfamilies.map((profamily) => (
                    <Card key={profamily.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">{profamily.name}</h3>
                            {profamily.description && (
                              <p className="text-gray-600">{profamily.description}</p>
                            )}
                            <p className="text-sm text-gray-500 mt-1">
                              {students.filter(s => s.profamilyId === profamily.id).length} estudiantes
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            Ver Estudiantes
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                  {filteredProfamilies.length === 0 && (
                    <div className="text-center py-8">
                      <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No se encontraron familias profesionales</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Add Student Modal */}
        <Dialog open={isAddStudentModalOpen} onOpenChange={setIsAddStudentModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Agregar Estudiante Verificado</DialogTitle>
              <DialogDescription>
                Agrega un estudiante con información académica verificada automáticamente.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({...studentForm, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="surname">Apellidos</Label>
                  <Input
                    id="surname"
                    value={studentForm.surname}
                    onChange={(e) => setStudentForm({...studentForm, surname: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={studentForm.email}
                  onChange={(e) => setStudentForm({...studentForm, email: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={studentForm.phone}
                  onChange={(e) => setStudentForm({...studentForm, phone: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="grade">Grado</Label>
                  <Input
                    id="grade"
                    value={studentForm.grade}
                    onChange={(e) => setStudentForm({...studentForm, grade: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="course">Curso</Label>
                  <Input
                    id="course"
                    value={studentForm.course}
                    onChange={(e) => setStudentForm({...studentForm, course: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="profamily">Familia Profesional</Label>
                <Select value={studentForm.profamilyId} onValueChange={(value) => setStudentForm({...studentForm, profamilyId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar familia profesional" />
                  </SelectTrigger>
                  <SelectContent>
                    {profamilies.map((profamily) => (
                      <SelectItem key={profamily.id} value={profamily.id.toString()}>
                        {profamily.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasCar"
                  checked={studentForm.hasCar}
                  onCheckedChange={(checked) => setStudentForm({...studentForm, hasCar: checked as boolean})}
                />
                <Label htmlFor="hasCar">Tiene coche</Label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddStudentModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Agregando...' : 'Agregar Estudiante'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Add Profamily Modal */}
        <Dialog open={isAddProfamilyModalOpen} onOpenChange={setIsAddProfamilyModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Agregar Familia Profesional</DialogTitle>
              <DialogDescription>
                Crea una nueva familia profesional para clasificar estudiantes.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddProfamily} className="space-y-4">
              <div>
                <Label htmlFor="profamilyName">Nombre</Label>
                <Input
                  id="profamilyName"
                  value={profamilyForm.name}
                  onChange={(e) => setProfamilyForm({...profamilyForm, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="profamilyDescription">Descripción</Label>
                <Textarea
                  id="profamilyDescription"
                  value={profamilyForm.description}
                  onChange={(e) => setProfamilyForm({...profamilyForm, description: e.target.value})}
                  rows={3}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddProfamilyModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Agregando...' : 'Agregar Familia'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Bulk Upload Modal */}
        <Dialog open={isBulkUploadModalOpen} onOpenChange={setIsBulkUploadModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Carga Masiva de Estudiantes</DialogTitle>
              <DialogDescription>
                Sube un archivo Excel con estudiantes. El sistema detectará automáticamente las columnas.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleBulkUpload} className="space-y-4">
              <div>
                <Label htmlFor="excelFile">Archivo Excel</Label>
                <Input
                  id="excelFile"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Formatos soportados: .xlsx, .xls
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Columnas esperadas:</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Nombre, Apellidos, Email, Teléfono</li>
                  <li>• Grado, Curso, Familia Profesional</li>
                  <li>• Tiene Coche (opcional)</li>
                </ul>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsBulkUploadModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading || !selectedFile}>
                  {isLoading ? 'Subiendo...' : 'Subir Archivo'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default function StudyCenterManagementPage() {
  return (
    <AuthGuard requireAuth>
      <StudyCenterManagementContent />
    </AuthGuard>
  );
}

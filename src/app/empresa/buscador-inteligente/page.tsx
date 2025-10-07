'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Eye, Search, Plus, X, Brain, Target, Car, GraduationCap, Briefcase, CreditCard } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { AuthGuard } from '@/components/auth-guard';

interface Student {
  id: number;
  grade: string;
  course: string;
  car: boolean;
  tag: string;
  description: string;
  User: {
    id: number;
    name: string;
    surname: string;
    email: string;
    phone: string;
  };
  Profamily: {
    id: number;
    name: string;
  } | null;
  affinity: {
    level: string;
    score: number;
    matches: number;
    coverage: number;
    matchingSkills: Array<{
      skill: string;
      companyValue: number;
      studentValue: number;
      finalValue: number;
      bonusText: string;
      isPremium: boolean;
    }>;
    explanation: string;
  };
}

function IntelligentSearchContent() {
  console.log('🚨 COMPONENTE CARGADO - BUSCADOR INTELIGENTE');
  console.log('🚨 Timestamp:', Date.now());

  const [skills, setSkills] = useState<{[key: string]: number}>({});
  const [currentSkill, setCurrentSkill] = useState('');
  const [filters, setFilters] = useState({
    profamilyId: '',
    grade: '',
    car: '',
    minAffinity: ''
  });
  const [results, setResults] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [userTokens, setUserTokens] = useState(0);
  const [loadingTokens, setLoadingTokens] = useState(true);

  const { token } = useAuthStore();

  // Cargar balance de tokens
  useEffect(() => {
    const fetchTokenBalance = async () => {
      try {
        setLoadingTokens(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/students/tokens/balance`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUserTokens(data.balance);
        }
      } catch (error) {
        console.error('Error cargando tokens:', error);
      } finally {
        setLoadingTokens(false);
      }
    };

    if (token) {
      fetchTokenBalance();
    }
  }, [token]);

  const addSkill = () => {
    if (currentSkill.trim() && !skills[currentSkill.trim()]) {
      setSkills(prev => ({
        ...prev,
        [currentSkill.trim()]: 3
      }));
      setCurrentSkill('');
    }
  };

  const removeSkill = (skillName: string) => {
    setSkills(prev => {
      const newSkills = { ...prev };
      delete newSkills[skillName];
      return newSkills;
    });
  };

  const searchStudents = async () => {
    console.log('🔥 ===== searchStudents FUNCTION CALLED =====');
    console.log('🔥 Skills:', skills);
    console.log('🔥 Filters:', filters);

    if (Object.keys(skills).length === 0) {
      alert('Agrega al menos una habilidad para buscar');
      return;
    }

    setLoading(true);
    try {
      const requestBody = {
        skills,
        filters: Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        )
      };

      console.log('🚀 Enviando petición:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/students/search-intelligent`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('Error en la búsqueda');
      }

      const data = await response.json();
      console.log('✅ Respuesta del backend:', data);

      setResults(data.students || []);
      setShowResults(true);
    } catch (error) {
      console.error('❌ Error en búsqueda:', error);
      alert('Error al realizar la búsqueda');
    } finally {
      setLoading(false);
    }
  };

  const getAffinityColor = (level: string) => {
    switch (level) {
      case 'muy alto': return 'bg-green-100 text-green-800 border-green-300';
      case 'alto': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'medio': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'bajo': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Brain className="w-8 h-8 text-blue-600" />
          Buscador Inteligente de Estudiantes
        </h1>
        <p className="text-gray-600">
          Encuentra los mejores candidatos <strong>que aún NO han aplicado</strong> a tus ofertas
        </p>
        <div className="flex items-center gap-2 mt-2">
          <CreditCard className="w-4 h-4 text-green-600" />
          <span className="text-sm text-green-600 font-medium">
            {loadingTokens ? 'Cargando...' : `Tokens disponibles: ${userTokens}`}
          </span>
        </div>
      </div>

      {!showResults ? (
        /* Formulario de búsqueda */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Panel de habilidades */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Habilidades Requeridas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Agregar habilidad */}
              <div className="flex gap-2">
                <Input
                  placeholder="Ej: JavaScript, React, Python..."
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  className="flex-1"
                />
                <Button onClick={addSkill} disabled={!currentSkill.trim()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar
                </Button>
              </div>

              {/* Lista de habilidades */}
              {Object.keys(skills).length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Habilidades agregadas:</h4>
                  <div className="space-y-1">
                    {Object.entries(skills).map(([skill, value]) => (
                      <div key={skill} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium min-w-0 flex-1 mr-4">{skill}</span>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 whitespace-nowrap">Importancia:</span>
                            <Badge variant="outline" className="text-blue-600 min-w-[3rem] justify-center">
                              {value}
                            </Badge>
                          </div>
                          <Slider
                            value={[value]}
                            onValueChange={(newValue) => {
                              setSkills(prev => ({
                                ...prev,
                                [skill]: newValue[0]
                              }));
                            }}
                            max={5}
                            min={1}
                            step={1}
                            className="w-20"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSkill(skill)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Panel de filtros */}
          <Card>
            <CardHeader>
              <CardTitle>Filtros Adicionales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Familia Profesional</Label>
                <Select value={filters.profamilyId} onValueChange={(value) => {
                  console.log('🔥 Profamily changed:', value);
                  setFilters(prev => ({...prev, profamilyId: value}));
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las familias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas las familias</SelectItem>
                    <SelectItem value="1">Informática y Comunicaciones</SelectItem>
                    <SelectItem value="2">Administración y Gestión</SelectItem>
                    <SelectItem value="3">Sanidad</SelectItem>
                    <SelectItem value="4">Servicios Socioculturales</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Grado Académico</Label>
                <Select value={filters.grade} onValueChange={(value) => setFilters(prev => ({...prev, grade: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los grados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los grados</SelectItem>
                    <SelectItem value="Grado Medio">Grado Medio</SelectItem>
                    <SelectItem value="Grado Superior">Grado Superior</SelectItem>
                    <SelectItem value="Universitario">Universitario</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Vehículo Propio</Label>
                <Select value={filters.car} onValueChange={(value) => setFilters(prev => ({...prev, car: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Indiferente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Indiferente</SelectItem>
                    <SelectItem value="true">Con vehículo</SelectItem>
                    <SelectItem value="false">Sin vehículo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Afinidad Mínima</Label>
                <Select value={filters.minAffinity} onValueChange={(value) => setFilters(prev => ({...prev, minAffinity: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Cualquier nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Cualquier nivel</SelectItem>
                    <SelectItem value="bajo">Bajo o superior</SelectItem>
                    <SelectItem value="medio">Medio o superior</SelectItem>
                    <SelectItem value="alto">Alto o superior</SelectItem>
                    <SelectItem value="muy alto">Muy alto únicamente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={() => {
                  console.log('🔥 Botón buscar clicked');
                  console.log('🔥 Filters:', filters);
                  console.log('🔥 Skills:', skills);
                  searchStudents();
                }}
                disabled={loading || Object.keys(skills).length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>Buscando...</>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Buscar Estudiantes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Resultados */
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Resultados de Búsqueda</h2>
            <div className="flex gap-2">
              <span className="text-sm text-gray-600">
                {results.length} estudiantes encontrados
              </span>
              <Button variant="outline" onClick={() => setShowResults(false)}>
                Nueva Búsqueda
              </Button>
            </div>
          </div>

          <div className="grid gap-6">
            {results.map((student) => (
              <Card key={student.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      {/* Header del estudiante */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {student.User.name?.charAt(0)}{student.User.surname?.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold">{student.User.name} {student.User.surname}</h3>
                          <p className="text-gray-600">{student.grade} - {student.course}</p>
                        </div>
                        {/* Badges */}
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                            Estudiante Nuevo
                          </Badge>
                          <Badge className={getAffinityColor(student.affinity.level)}>
                            Afinidad: {student.affinity.level.toUpperCase()}
                          </Badge>
                        </div>
                      </div>

                      {/* Información académica */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <GraduationCap className="w-4 h-4 mr-2" />
                          {student.grade} - {student.course}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Car className="w-4 h-4 mr-2" />
                          {student.car ? 'Con vehículo' : 'Sin vehículo'}
                        </div>
                        {student.Profamily && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Briefcase className="w-4 h-4 mr-2" />
                            {student.Profamily.name}
                          </div>
                        )}
                      </div>

                      {/* Detalles de afinidad */}
                      <div className="bg-blue-50 p-4 rounded-lg mb-4">
                        <h4 className="font-semibold text-blue-900 mb-2">Análisis de Afinidad</h4>
                        <p className="text-sm text-blue-800 mb-2">{student.affinity.explanation}</p>
                        <div className="flex flex-wrap gap-2">
                          {student.affinity.matchingSkills.map((match, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className={match.isPremium ? 'bg-green-50 text-green-700 border-green-300' : 'bg-blue-50 text-blue-700 border-blue-300'}
                            >
                              {match.skill} ({match.companyValue}→{match.studentValue})
                              {match.isPremium && ' ⭐'}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-purple-50 border-purple-300 text-purple-700"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Revelar Perfil (2 tokens)
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {results.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No se encontraron candidatos</h3>
                <p className="text-gray-600">
                  Intenta ajustar los criterios de búsqueda o reducir el nivel de afinidad mínimo
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default function IntelligentSearchPage() {
  return (
    <AuthGuard allowedRoles={['company']}>
      <IntelligentSearchContent />
    </AuthGuard>
  );
}
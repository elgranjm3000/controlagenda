'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ChevronLeft, 
  ChevronRight, 
  X,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { api } from '@/types/services';
import { JobOffer, JobClientStatus, JobClientStatusContact } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { formatRUT } from '@/lib/utils';

// Modal para agregar nuevo cliente con navegación por registros
const NewClientModal = ({ 
  isOpen, 
  onClose, 
  onSave,
  campaignId // Recibir la campaña seleccionada
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: () => void;
  campaignId?: string;
}) => {
  // ===================================================================
  // ESTADOS
  // ===================================================================
  const [clients, setClients] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    id_offers: '', 
    id_client: '', 
    dv_client: '', 
    id_executive: '', 
    dv_executive: '',
    name: '', 
    last_name1: '', 
    last_name2: '', 
    id_office: '', 
    id_status: 1, 
    id_contact: 0,
    scheduled_date: '', 
    attrib1: '', 
    attrib2: '', 
    attrib3: '', 
    attrib4: '', 
    attrib5: '', 
    comment: ''
  });
  
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [statuses, setStatuses] = useState<JobClientStatus[]>([]);
  const [contactStatuses, setContactStatuses] = useState<JobClientStatusContact[]>([]);
  const [phones, setPhones] = useState<any[]>([]);
  const [errors, setErrors] = useState<any>({});
  const { user } = useAuth();
  const [statusYes, setStatusYes] = useState<any[]>([]);
  const [StatusNo, setStatusNo] = useState<any[]>([]);

  const [phoneSelections, setPhoneSelections] = useState<{
    [key: number]: {
      contacted: '1' | '0' | null;
      selectedStatus: number | null;
      comment: string;
      isSaving?: boolean;
    }
  }>({});

  // ===================================================================
  // FUNCIONES DE CARGA
  // ===================================================================

  // Cargar clientes sin procesar de acuerdo a la campaña
  const loadClientsFromCampaign = async () => {
    if (!campaignId) {
      console.warn('campaignId no disponible');
      return;
    }
    
    setLoading(true);
    try {
      console.log('Cargando clientes para campaña:', campaignId);
      
      // Obtener clientes potenciales (sin procesar) para la campaña
      const response = await api.getJobExecutives({ 
        with_contacts: 1,
        page: 1,
        per_page: 1000,
        id_executive: user?.id_executive || undefined,  
      });

      
      const clientsList = Array.isArray(response?.data) ? response.data : [];
      console.log('Clientes cargados:', clientsList);
      
      setClients(clientsList);
      setCurrentIndex(0);
      
      if (clientsList.length > 0) {
        await loadClientData(clientsList[0]);
      } else {
        console.warn('No hay clientes sin procesar para esta campaña');
      }
    } catch (error) {
      console.error('Error cargando clientes de la campaña:', error);
      setErrors({ general: 'Error al cargar clientes de la campaña' });
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos del cliente actual
  const loadClientData = async (client: any) => {
    try {
      console.log('Cargando datos del cliente:', client);
      
      // Obtener teléfonos del cliente
      const phonesRes = await api.getPhonesByClient(client.id_client);
      const phonesList = Array.isArray(phonesRes?.data?.phones) ? phonesRes.data.phones : [];      
      console.log('Teléfonos cargados:', phonesList);


      
      
      // Rellenar formulario con datos del cliente
      setFormData({
        id_offers: campaignId || '',
        id_client: client.id_client?.toString() || '',
        dv_client: client.dv_client?.toString() || '',
        id_executive: client.id_executive?.toString() || '',
        dv_executive: client.dv_executive || '',
        name: client.name || '',
        last_name1: client.last_name1 || '',
        last_name2: client.last_name2 || '',
        id_office: client.id_office?.toString() || '',
        id_status: 1,
        id_contact: 0,
        scheduled_date: new Date().toISOString(),
        attrib1: '',
        attrib2: '',
        attrib3: '',
        attrib4: '',
        attrib5: '',
        comment: ''
      });
      
      setPhones(phonesList);
      
      // Inicializar selecciones de teléfono
      const initialSelections: any = {};
      phonesList.forEach((_, idx) => {
        initialSelections[idx] = {
          contacted: null,
          selectedStatus: null,
          comment: '',
          isSaving: false
        };
      });
      setPhoneSelections(initialSelections);
      setErrors({});
      
    } catch (error) {
      console.error('Error cargando datos del cliente:', error);
      setErrors({ general: 'Error al cargar datos del cliente' });
    }
  };

  // ===================================================================
  // FUNCIONES DE NAVEGACIÓN
  // ===================================================================

  // Navegar al siguiente cliente
  const handleNextClient = () => {
    if (currentIndex < clients.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      loadClientData(clients[nextIndex]);
      setErrors({});
    }
  };

  // Navegar al cliente anterior
  const handlePreviousClient = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      loadClientData(clients[prevIndex]);
      setErrors({});
    }
  };

  // ===================================================================
  // FUNCIONES DE GUARDADO
  // ===================================================================

  // Validar datos
  const validateFormData = () => {
    const newErrors: any = {};

    if (!formData.id_executive?.trim()) {
      newErrors.id_executive = 'El ejecutivo es requerido';
    }

    if (!formData.dv_executive?.trim()) {
      newErrors.dv_executive = 'El DV del ejecutivo es requerido';
    }

    return Object.keys(newErrors).length === 0 ? null : newErrors;
  };

  // Guardar contacto/cliente
  const handleSaveClient = async () => {
    try {
      setSaving(true);

      // Validar datos
      const validationErrors = validateFormData();
      if (validationErrors) {
        setErrors(validationErrors);
        setSaving(false);
        return;
      }

      console.log('Guardando cliente:', formData);

      // Crear el registro del cliente
 
      
      // Si hay teléfonos seleccionados, guardar contactos
      const hasPhoneSelections = Object.values(phoneSelections).some(p => p.contacted);
      
      if (hasPhoneSelections) {
        console.log('Guardando contactos por teléfono...');
        
        for (const [phoneIndex, selection] of Object.entries(phoneSelections)) {
          if (selection.contacted && selection.selectedStatus) {
            const phone = phones[parseInt(phoneIndex)];
            
            const contactData = {
              id_offers: parseInt(formData.id_offers),
              id_phone: phone.id_phone,
              id_client: parseInt(formData.id_client),
              id_executive: parseInt(formData.id_executive),
              id_status: formData.id_status,
              id_contact: selection.selectedStatus,
              scheduled_date: formData.scheduled_date || new Date().toISOString(),
              comment: selection.comment || ''
            };
            
            await api.createJobContact(contactData);
            console.log('Contacto guardado para teléfono:', phone.phone);
          }
        }
      }

      // Ir al siguiente cliente o cerrar si es el último
      if (currentIndex < clients.length - 1) {
        handleNextClient();
      } else {
        // Es el último cliente
        console.log('Todos los clientes han sido procesados');
        onSave();
        onClose();
      }
      
    } catch (error: any) {
      console.error('Error guardando cliente:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al guardar';
      setErrors({ general: `Error: ${errorMessage}` });
    } finally {
      setSaving(false);
    }
  };

  // ===================================================================
  // EFECTOS
  // ===================================================================

  // Cargar datos generales al abrir el modal
  useEffect(() => {
    if (isOpen) {
      console.log('Modal abierto, campaignId:', campaignId);
      
      setErrors({});
      setCurrentIndex(0);
      
      // Cargar clientes
      loadClientsFromCampaign();
      
      // Cargar ofertas, estados, etc.
      const loadFormData = async () => {
        try {
          console.log('Cargando datos del formulario...');
          
          const [offersRes, statusesRes, statusYesRes, StatusNoRes] = await Promise.all([
            api.getJobOffers({ active: true }),
            api.getAllStatuses(),
            api.getContactStatuses({ id_status: 2, is_life: true }),
            api.getContactStatuses({ id_status: 3, is_life: true }),            
          ]);
          setOffers(offersRes?.data || []);
          // ✅ CORREGIDO: Usar la misma estructura que en page.tsx
          setStatuses(statusesRes?.data?.data?.client_statuses || []);
          setContactStatuses(statusesRes?.data?.data?.contact_statuses || []);
          setStatusYes(statusYesRes?.data || []);
          setStatusNo(StatusNoRes?.data || []);
          
          console.log('Datos del formulario cargados');
          console.log('Statuses:', statusesRes?.data?.data?.client_statuses);
          console.log('Contact Statuses:', statusesRes?.data?.data?.contact_statuses);
          console.log("yes: ",statusYes, "no: ",StatusNo);
        } catch (error) {
          console.error('Error cargando datos:', error);
          setErrors(prev => ({ 
            ...prev, 
            general: 'Error al cargar datos del formulario' 
          }));
        }
      };
      
      loadFormData();
    }
  }, [isOpen, campaignId]);

  // ===================================================================
  // RENDER
  // ===================================================================

  if (!isOpen) return null;

  const currentClient = clients[currentIndex];
  const hasMoreClients = currentIndex < clients.length - 1;
  const totalClients = clients.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl my-8 bg-white text-black">
        {/* Header */}
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <div className="flex-1">
            <CardTitle>Nuevo Cliente</CardTitle>
            <CardDescription>
              {loading ? (
                'Cargando clientes...'
              ) : totalClients > 0 ? (
                `Cliente ${currentIndex + 1} de ${totalClients}`
              ) : (
                'No hay clientes sin procesar'
              )}
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        {/* Content */}
        <CardContent className="pt-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-4" />
              <p className="text-gray-600">Cargando datos...</p>
            </div>
          ) : totalClients === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay clientes sin procesar
              </h3>
              <p className="text-gray-600 text-center">
                Todos los clientes de la campaña {campaignId} ya han sido procesados
              </p>
            </div>
          ) : (
            <>
              {/* Información del cliente */}
              {currentClient && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">Nombre Completo</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {currentClient.name} {currentClient.last_name1} {currentClient.last_name2}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">RUT</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatRUT(currentClient.id_client, currentClient.dv_client)}
                      </p>
                    </div>
                    {currentClient.id_office && (
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">Oficina</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {currentClient.id_office}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Seleccionar Ejecutivo */}
    

              {/* Dígito Verificador Ejecutivo */}
     
              
              {/* Teléfonos disponibles */}
              {phones.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Teléfonos</Label>
                  <div className="space-y-3">
                    {phones.map((phone, idx) => (
                      <div key={idx} className="p-4 border rounded-lg space-y-3 hover:bg-gray-50 transition">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900">{phone.phone}</p>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
                            {phone.type_phone || 'Teléfono'}
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant={phoneSelections[idx]?.contacted === '1' ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPhoneSelections(prev => ({
                              ...prev,
                              [idx]: { ...prev[idx], contacted: '1' }
                            }))}
                            disabled={saving}
                          >
                            ✓ Contactado
                          </Button>
                          <Button
                            type="button"
                            variant={phoneSelections[idx]?.contacted === '0' ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPhoneSelections(prev => ({
                              ...prev,
                              [idx]: { ...prev[idx], contacted: '0' }
                            }))}
                            disabled={saving}
                          >
                            ✗ No contactado
                          </Button>
                        </div>

                        {phoneSelections[idx]?.contacted  && (
                          <>
                            <select
                              value={phoneSelections[idx]?.selectedStatus || ''}
                              onChange={(e) => setPhoneSelections(prev => ({
                                ...prev,
                                [idx]: { ...prev[idx], selectedStatus: parseInt(e.target.value) || null }
                              }))}
                              className="w-full h-9 px-3 rounded-md border border-input bg-background text-black text-sm"
                              disabled={saving}
                            >
                              <option value="">Seleccionar estado del contacto</option>
                               {(phoneSelections[idx]?.contacted === '1' ? statusYes : StatusNo).map((status: any) => (
                                    <option key={status.id_contact} value={status.id_contact}>
                                      {status.descrip}
                                    </option>
                                ))}
                            </select>

                            <Input
                              type="text"
                              placeholder="Comentario sobre este contacto..."
                              value={phoneSelections[idx]?.comment || ''}
                              onChange={(e) => setPhoneSelections(prev => ({
                                ...prev,
                                [idx]: { ...prev[idx], comment: e.target.value }
                              }))}
                              disabled={saving}
                            />
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comentario general */}
             
              {/* Errores generales */}
              {errors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start">
                  <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{errors.general}</span>
                </div>
              )}
            </>
          )}
        </CardContent>

        {/* Footer */}
        {totalClients > 0 && !loading && (
          <div className="border-t bg-gray-50 p-4 flex items-center justify-between gap-2">
            {/* Navegación */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePreviousClient}
                disabled={currentIndex === 0 || saving}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              
              <div className="flex items-center px-3 py-2 text-sm text-gray-600 border rounded-md bg-white">
                {currentIndex + 1} / {totalClients}
              </div>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleNextClient}
                disabled={!hasMoreClients || saving}
              >
                Siguiente
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            {/* Acciones */}
            <div className="flex gap-2">
              <Button 
                type="button"
                variant="outline" 
                onClick={onClose}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button 
                type="button"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                onClick={handleSaveClient}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Guardando...
                  </>
                ) : (
                  hasMoreClients ? 'Guardar y siguiente' : 'Guardar y cerrar'
                )}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default NewClientModal;
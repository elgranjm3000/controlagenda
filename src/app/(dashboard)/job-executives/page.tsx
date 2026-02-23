'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useOfferStore } from '@/store/useOfferStore';

import {
  Users,
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Edit,
  Calendar,
  Building,
  CheckCircle,
  Clock,
  X,
  Phone,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  History
} from 'lucide-react';
import { formatDateTime, formatRUT, formatCLP } from '@/lib/utils';
import { api } from '@/types/services';
import { JobDayExecutive, JobOffer, JobClientStatus, JobClientStatusContact, summaryQueryParams } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import NewClientModal from '@/components/modals/newClientModal';

// Modal para agregar/editar ejecutivo
const ExecutiveModal = ({ 
  isOpen, 
  onClose, 
  executive, 
  onSave 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  executive?: JobDayExecutive | null; 
  onSave: () => void; 
}) => {
  const [formData, setFormData] = useState({
    id_offers: '', id_client: '', dv_client: '', id_executive: '', dv_executive: '',
    name: '', last_name1: '', last_name2: '', id_office: '', id_status: 1, id_contact: 0,
    scheduled_date: '', attrib1: '', attrib2: '', attrib3: '', attrib4: '', attrib5: '', comment: ''
  });
  
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [statuses, setStatuses] = useState<JobClientStatus[]>([]);
  const [contactStatuses, setContactStatuses] = useState<JobClientStatusContact[]>([]);
  const [phones, setPhones] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [attibut, setattribut] = useState<any>({});
  const [statusYes, setStatusYes] = useState<any[]>([]);
  const [StatusNo, setStatusNo] = useState<any[]>([]);
  const [executiveList, setExecutiveList] = useState<any | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [contactHistory, setContactHistory] = useState<any[]>([]);


  // Estado para las selecciones de teléfonos CON COMENTARIO INDIVIDUAL
  const [phoneSelections, setPhoneSelections] = useState<{
    [key: number]: {
      contacted: '1' | '0' | null;
      selectedStatus: number | null;
      comment: string;
      isSaving?: boolean;
      contactId?: number; // ⭐ ID del contacto existente para UPDATE
    }
  }>({});






  // ⭐ MODIFICADA: Guardar o actualizar contacto automáticamente
const saveContact = async (phoneIndex: number) => {
  const selection = phoneSelections[phoneIndex];
  const phone = phones[phoneIndex];

  if (!selection?.contacted) return;
  if (!selection?.selectedStatus) return;
  if (selection.contacted === 'yes' && !selection.comment?.trim()) return;

  setPhoneSelections(prev => ({
    ...prev,
    [phoneIndex]: { ...prev[phoneIndex], isSaving: true }
  }));

  try {
    const dataToSend = {
      id_offers: parseInt(formData.id_offers),
      id_phone: phone.id_phone,
      id_client: parseInt(formData.id_client),
      id_executive: parseInt(formData.id_executive),
      id_status: parseInt(formData.id_status.toString()),
      id_contact: selection.selectedStatus,
      scheduled_date: formData.scheduled_date || new Date().toISOString(),
      comment: selection.comment || '',
    };

    // ⭐ SIEMPRE CREATE, NUNCA UPDATE
    await api.createJobContact(dataToSend);
    
    // ⭐ RECARGAR HISTÓRICO
    await loadContactHistory();
    
    // Limpiar campos
    setPhoneSelections(prev => ({
      ...prev,
      [phoneIndex]: {
        contacted: null,
        selectedStatus: null,
        comment: '',
        isSaving: false
      }
    }));

  } catch (error: any) {
    console.error('Error al guardar contacto:', error);
    setErrors({ 
      [`phone_${phoneIndex}`]: ['Error: ' + (error.response?.data?.message || 'Error')] 
    });
    
    setPhoneSelections(prev => ({
      ...prev,
      [phoneIndex]: { ...prev[phoneIndex], isSaving: false }
    }));
  }
};

const loadContactHistory = async () => {
  if (!executive?.id_client || !executive?.id_executive) return;
  
  try {
    const response = await api.getJobContacts({ 
      id_client: executive.id_client, 
      id_executive: executive.id_executive 
    });
    
    // Tu API retorna directamente un array
    let contactsArray = Array.isArray(response) ? response : (Array.isArray(response?.data) ? response.data : []);
    
    console.log('Contactos cargados:', contactsArray);
    
    if (contactsArray.length > 0) {
      // Ordenar por stamp (más reciente primero)
      const sorted = contactsArray.sort((a: any, b: any) => {
        return new Date(b.stamp).getTime() - new Date(a.stamp).getTime();
      });
      setContactHistory(sorted);
    } else {
      setContactHistory([]);
    }
  } catch (error) {
    console.error('Error al cargar histórico:', error);
    setContactHistory([]);
  }
};

  useEffect(() => {
    const loadFormData = async () => {
      try {
        const [offersRes, statusesRes, setAttib, statusYesRes, StatusNoRes] = await Promise.all([
          api.getJobOffers({ active: true }),
          api.getAllStatuses(),
          api.getJobAttribs(),
          api.getContactStatuses({ id_status: 2, is_life: true }),
          api.getContactStatuses({ id_status: 3, is_life: true }),
        ]);
        
        setOffers(offersRes.data || []);
        setStatuses(statusesRes?.data?.data?.client_statuses || []);
        setContactStatuses(statusesRes?.data?.data?.contact_statuses || []);
        setattribut(setAttib?.data[0] || {});
        setStatusYes(statusYesRes?.data || []);
        setStatusNo(StatusNoRes?.data || []);
        
        if (executive?.id_client) {
            const phonesRes = await api.getPhonesByClient(executive.id_client);
            const executiveListData = await api.getJobExecutive(executive.id);             
            
            setExecutiveList(executiveListData.data || null);          
            const phonesList = phonesRes.data.phones || [];
            setPhones(phonesList);
            
            // ⭐ AGREGAR: Cargar histórico
            await loadContactHistory();
            
            // Inicializar phoneSelections vacío
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
          }
      } catch (error) {
        console.error('Error cargando datos del formulario:', error);
      }
    };

    if (isOpen) {
      loadFormData();
    }
  }, [isOpen, executive]);

  useEffect(() => {
    console.log('Cargando datos del ejecutivo en el formulario:', executive);
    if (executive) {
      setFormData({
        id_offers: executive.id_offers?.toString() || '',
        id_client: executive.id_client?.toString() || '',
        dv_client: executive.dv_client || '',
        id_executive: executive.id_executive?.toString() || '',
        dv_executive: executive.dv_executive || '',
        name: executive.name || '',
        last_name1: executive.last_name1 || '',
        last_name2: executive.last_name2 || '',
        id_office: executive.id_office || '',
        id_status: executive.id_status || 1,
        id_contact: executive.id_contact || 0,
        scheduled_date: executive.scheduled_date?.slice(0, 16) || '',
        attrib1: executive.attrib1 || '',
        attrib2: executive.attrib2 || '',
        attrib3: executive.attrib3 || '',
        attrib4: executive.attrib4 || '',
        attrib5: executive.attrib5 || '',
        comment: ''
      });
    }
  }, [executive]);

  // Manejar cambio de contacto (Si/No)
  const handleContactChange = (phoneIndex: number, value: 'yes' | 'no') => {
    setPhoneSelections(prev => ({
      ...prev,
      [phoneIndex]: {
        ...prev[phoneIndex],
        contacted: value,
        selectedStatus: prev[phoneIndex]?.selectedStatus || null,
        comment: prev[phoneIndex]?.comment || '',
        contactId: prev[phoneIndex]?.contactId
      }
    }));
  };

  // ⭐ MODIFICADO: Manejar cambio de estado en el select CON GUARDADO AUTOMÁTICO
  const handleStatusChange = async (phoneIndex: number, statusId: number) => {
    setPhoneSelections(prev => ({
      ...prev,
      [phoneIndex]: {
        ...prev[phoneIndex],
        selectedStatus: statusId
      }
    }));

    // Pequeño delay para que se actualice el estado antes de guardar
    setTimeout(() => {
      saveContact(phoneIndex);
    }, 1000);
  };

  // ⭐ MODIFICADO: Manejar cambio de comentario CON GUARDADO AUTOMÁTICO (debounced)
  const handleCommentChange = (phoneIndex: number, comment: string) => {
    setPhoneSelections(prev => ({
      ...prev,
      [phoneIndex]: {
        ...prev[phoneIndex],
        comment: comment
      }
    }));

    // Debounce: Esperar 1 segundo después de que el usuario deje de escribir
    if ((handleCommentChange as any).timeout) {
      clearTimeout((handleCommentChange as any).timeout);
    }

    (handleCommentChange as any).timeout = setTimeout(() => {
      if (comment.trim()) {
        saveContact(phoneIndex);
      }
    }, 1000);
  };

  // ⭐ NUEVO: Función para cerrar el modal
  const handleClose = () => {
    onSave();
    onClose();
  };

  if (!isOpen) return null;

  const selectedOffer = offers.find(o => o.id_offers.toString() === formData.id_offers);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-lg w-full max-w-5xl my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-t-lg sticky top-0 z-10">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-lg font-bold leading-tight">
                {executive
                  ? `At.: Cliente ${formData.name} ${formData.last_name1} - Campaña: ${selectedOffer?.descrip || 'Seleccionar campaña'}`
                  : 'Nuevo contacto cliente'
                }
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-white hover:bg-white/20 ml-4"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>


        {/* Section: Cliente registra gestiones */}
        <div className="px-6 pt-4 pb-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium underline flex items-center gap-2"
          >
            Cliente registra ({contactHistory.length}) gestiones – Presione aquí para visualizar
            {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* HISTÓRICO DESPLEGABLE - Gestiones Históricas */}
        {showHistory && (
          <div className="px-6 pb-4">
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold text-sm mb-3">Gestiones Históricas</h3>
              {!contactHistory || contactHistory.length === 0 ? (
                <p className="text-xs text-gray-500">No hay registros</p>
              ) : (
                <div className="space-y-3">
                  {contactHistory.map((contact: any) => {
                    // Format date: DD-MM-YYYY Hora: HH:MM
                    const formatDate = (dateString: string) => {
                      if (!dateString) return 'Sin fecha';
                      const date = new Date(dateString);
                      const day = String(date.getDate()).padStart(2, '0');
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const year = date.getFullYear();
                      const hours = String(date.getHours()).padStart(2, '0');
                      const minutes = String(date.getMinutes()).padStart(2, '0');
                      return `${day}-${month}-${year} Hora: ${hours}:${minutes}`;
                    };

                    // Get campaign name from offer
                    const campaignName = offers.find(o => o.id_offers === contact.id_offers)?.descrip || 'N/A';
                    // Contact status: id_status = 2 means "Contactado"
                    const contactado = contact.id_status === 2 ? 'SI' : 'NO';

                    return (
                      <div key={contact.id} className="text-sm bg-white p-3 rounded border">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div>
                            <span className="font-semibold text-gray-700">Teléfono:</span>{' '}
                            <span className="text-gray-900">{contact.id_phone || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">Campaña:</span>{' '}
                            <span className="text-gray-900">{campaignName}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">Fecha:</span>{' '}
                            <span className="text-gray-900">{formatDate(contact.stamp)}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">Contactado:</span>{' '}
                            <span className={`font-medium ${contactado === 'SI' ? 'text-green-600' : 'text-red-600'}`}>
                              {contactado}
                            </span>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">Acepta / Convocado:</span>{' '}
                            <span className="text-gray-900">{contact.id_contact || 'N/A'}</span>
                          </div>
                          {contact.scheduled_date && (
                            <div>
                              <span className="font-semibold text-gray-700">Compromiso:</span>{' '}
                              <span className="text-gray-900">{formatDate(contact.scheduled_date)}</span>
                            </div>
                          )}
                        </div>
                        {contact.comment && (
                          <div className="mt-2 pt-2 border-t text-gray-600 text-xs">
                            <span className="font-semibold">Comentario:</span> {contact.comment}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="p-6">
          <div className="space-y-6">
            
            {/* Cliente y Campaña */}
            <div className="bg-blue-50 p-4 rounded-lg space-y-3">
              <div>
                <Label className="text-sm font-semibold text-gray-700">Cliente</Label>
                <p className="text-lg font-bold text-gray-900">
                  {executive ? `${formData.name} ${formData.last_name1}` : 'Nuevo Cliente'}
                </p>
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700">Campaña</Label>
                <p className="text-base font-semibold text-gray-900">
                  {selectedOffer?.descrip || 'Seleccione una campaña'}
                </p>
              </div>
            </div>

            {/* Información de Oferta */}
            {selectedOffer && attibut && executiveList && (
  <div className="space-y-4">
    {/* Fila 1: attrib1, attrib2, attrib3 */}
    <div className="flex items-center space-x-2 text-sm flex-wrap">
      <span className="text-gray-600">{attibut.attrib1 || 'Tipo Base'}: <span className="font-semibold">{executiveList?.attrib1 || ''}</span></span>
      <span className="text-gray-400">/</span>
      <span className="text-gray-600">{attibut.attrib2 || 'Atributo 2'}: <span className="font-semibold">{executiveList?.attrib2 || ''}</span></span>
      <span className="text-gray-400">/</span>
      <span className="text-gray-600">{attibut.attrib3 || 'Propensión'}: <span className="font-semibold">{executiveList?.attrib3 || ''}</span></span>
    </div>

    {/* Fila 2: attrib4, attrib5, attrib6 */}
    <div className="flex items-center space-x-2 text-sm flex-wrap">
      <span className="text-gray-600">{attibut.attrib4 || 'Atributo 4'}: <span className="font-semibold">{executiveList?.attrib4 || ''}</span></span>
      <span className="text-gray-400">/</span>
      <span className="text-gray-600">{attibut.attrib5 || 'Fecha Vencto TC'}: <span className="font-semibold">{executiveList?.attrib5 || ''}</span></span>
      <span className="text-gray-400">/</span>
      <span className="text-gray-600">{attibut.attrib6 || 'Actividad TC'}: <span className="font-semibold">{executiveList?.attrib6 || ''}</span></span>
    </div>

    {/* Fila 3: attrib7, attrib8, attrib9 */}
    <div className="flex items-center space-x-2 text-sm flex-wrap">
      <span className="text-gray-600">{attibut.attrib7 || 'Atributo 7'}: <span className="font-semibold">{executiveList?.attrib7 || ''}</span></span>
      <span className="text-gray-400">/</span>
      <span className="text-gray-600">{attibut.attrib8 || 'Atributo 8'}: <span className="font-semibold">{executiveList?.attrib8 || ''}</span></span>
      <span className="text-gray-400">/</span>
      <span className="text-gray-600">{attibut.attrib9 || 'Cuotas Pagadas REF'}: <span className="font-semibold">{executiveList?.attrib9 || ''}</span></span>
    </div>

    {/* Fila 4: attrib10, attrib11, attrib12 */}
    <div className="flex items-center space-x-2 text-sm flex-wrap">
      <span className="text-gray-600">{attibut.attrib10 || 'Plazo'}: <span className="font-semibold">{executiveList?.attrib10 || ''}</span></span>
      <span className="text-gray-400">/</span>
      <span className="text-gray-600">{attibut.attrib11 || 'Saldo TCV'}: <span className="font-semibold">{executiveList?.attrib11 || ''}</span></span>
      <span className="text-gray-400">/</span>
      <span className="text-gray-600">{attibut.attrib12 || 'Atributo 12'}: <span className="font-semibold">{executiveList?.attrib12 || ''}</span></span>
    </div>

    {/* Fila 5: attrib13, attrib14, attrib15 */}
    <div className="flex items-center space-x-2 text-sm flex-wrap">
      <span className="text-gray-600">{attibut.attrib13 || 'Atributo 13'}: <span className="font-semibold">{executiveList?.attrib13 || ''}</span></span>
      <span className="text-gray-400">/</span>
      <span className="text-gray-600">{attibut.attrib14 || 'Atributo 14'}: <span className="font-semibold">{executiveList?.attrib14 || ''}</span></span>
      <span className="text-gray-400">/</span>
      <span className="text-gray-600">{attibut.attrib15 || 'Oferta'}: <span className="font-semibold">{executiveList?.attrib15 || ''}</span></span>
    </div>

    {/* Fila 6: attrib16, attrib17, attrib18 */}
    <div className="flex items-center space-x-2 text-sm flex-wrap">
      <span className="text-gray-600">{attibut.attrib16 || 'Atributo 16'}: <span className="font-semibold">{executiveList?.attrib16 || ''}</span></span>
      <span className="text-gray-400">/</span>
      <span className="text-gray-600">{attibut.attrib17 || 'Atributo 17'}: <span className="font-semibold">{executiveList?.attrib17 || ''}</span></span>
      <span className="text-gray-400">/</span>
      <span className="text-gray-600">{attibut.attrib18 || 'Atributo 18'}: <span className="font-semibold">{executiveList?.attrib18 || ''}</span></span>
    </div>

    {/* Fila 7: attrib19, attrib20, attrib21 */}
    <div className="flex items-center space-x-2 text-sm flex-wrap">
      <span className="text-gray-600">{attibut.attrib19 || 'Atributo 19'}: <span className="font-semibold">{executiveList?.attrib19 || ''}</span></span>
      <span className="text-gray-400">/</span>
      <span className="text-gray-600">{attibut.attrib20 || 'Atributo 20'}: <span className="font-semibold">{executiveList?.attrib20 || ''}</span></span>
      <span className="text-gray-400">/</span>
      <span className="text-gray-600">{attibut.attrib21 || 'Atributo 21'}: <span className="font-semibold">{executiveList?.attrib21 || ''}</span></span>
    </div>

    {/* Fila 8: attrib22 */}
    <div className="flex items-center space-x-2 text-sm flex-wrap">
      <span className="text-gray-600">{attibut.attrib22 || 'Atributo 22'}: <span className="font-semibold">{executiveList?.attrib22 || ''}</span></span>
    </div>
  </div>
)}

            {/* Teléfonos Disponibles - Puntos de Contacto */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-blue-100 px-4 py-2 flex justify-between items-center">
                <h3 className="font-semibold text-sm">Puntos de contacto disponibles</h3>
                <span className="text-xs text-blue-600 font-medium">
                  💾 Guardado automático activado
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-blue-500 text-white">
                    <tr>
                      <th className="px-3 py-2 text-left">Tipo</th>
                      <th className="px-3 py-2 text-left">Comuna</th>
                      <th className="px-3 py-2 text-left">Región</th>
                      <th className="px-3 py-2 text-left">Área</th>
                      <th className="px-3 py-2 text-left">Número</th>
                      <th className="px-3 py-2 text-left">Contacto</th>
                      <th className="px-3 py-2 text-left">Gestión</th>
                    </tr>
                  </thead>
                  <tbody>
                    {phones.length > 0 ? (
                      phones.map((phone, idx) => {
                        const selection = phoneSelections[idx];
                        const showStatusYes = selection?.contacted === '1';
                        const showStatusNo = selection?.contacted === '0';

                        return (
                          <tr key={idx} className="border-b hover:bg-gray-50">
                            <td className="px-3 py-2">{phone.attrib1 || 'móvil'}</td>
                            <td className="px-3 py-2">{phone.attrib2 || '-'}</td>
                            <td className="px-3 py-2">{phone.attrib3 || '-'}</td>
                            <td className="px-3 py-2">{phone.attrib4 || '-'}</td>
                            <td className="px-3 py-2 font-mono">{phone.phone}</td>
                            
                            {/* Columna Contacto */}
                            <td className="px-3 py-2">
                              <div className="flex items-center space-x-4">
                                <label className="flex items-center space-x-1 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`contact-${idx}`}
                                    checked={selection?.contacted === '1'}
                                    onChange={() => handleContactChange(idx, '1')}
                                    className="w-4 h-4 text-green-600"
                                  />
                                  <span className="text-green-600 font-medium">Sí</span>
                                </label>
                                
                                <label className="flex items-center space-x-1 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`contact-${idx}`}
                                    checked={selection?.contacted === '0'}
                                    onChange={() => handleContactChange(idx, '0')}
                                    className="w-4 h-4 text-red-600"
                                  />
                                  <span className="text-red-600 font-medium">No</span>
                                </label>
                              </div>
                            </td>

                            {/* Columna Gestión */}
                            <td className="px-3 py-2">
                              {!selection?.contacted && (
                                <div className="text-xs text-gray-400 italic">
                                  <span className="text-blue-600">▶</span> Seleccione contacto primero
                                </div>
                              )}

                              {(showStatusYes || showStatusNo) && (
                                <div className="space-y-2">
                                  {/* SELECT */}
                                  <div className="relative">
                                    <select
                                      value={selection.selectedStatus || ''}
                                      onChange={(e) => handleStatusChange(idx, parseInt(e.target.value))}
                                      className={`w-full px-2 py-1.5 text-xs border rounded focus:ring-1 ${
                                        showStatusYes 
                                          ? 'border-green-300 bg-green-50 focus:border-green-500 focus:ring-green-500' 
                                          : 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500'
                                      }`}
                                    >
                                      <option value="">{showStatusYes ? 'Seleccione acción...' : 'Seleccione motivo...'}</option>
                                      {(showStatusYes ? statusYes : StatusNo).map((status: any) => (
                                        <option key={status.id_contact} value={status.id_contact}>
                                          {status.descrip}
                                        </option>
                                      ))}
                                    </select>
                                    {selection.isSaving && (
                                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                        <div className="animate-spin h-3 w-3 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                                      </div>
                                    )}
                                  </div>

                                  {/* TEXTAREA DE COMENTARIO */}
                                  {showStatusYes && (
                                    <div className="space-y-1">
                                      <div className="relative">
                                        <textarea
                                          value={selection.comment || ''}
                                          onChange={(e) => handleCommentChange(idx, e.target.value)}
                                          placeholder="Comentario (se guarda automáticamente)..."
                                          rows={2}
                                          className={`w-full px-2 py-1.5 text-xs border-2 rounded resize-none focus:ring-1 ${
                                            selection.comment?.trim() 
                                              ? 'border-green-300 bg-green-50 focus:border-green-500' 
                                              : 'border-yellow-300 bg-yellow-50 focus:border-yellow-500'
                                          }`}
                                        />
                                        {selection.isSaving && (
                                          <div className="absolute right-2 top-2">
                                            <div className="animate-spin h-3 w-3 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                                          </div>
                                        )}
                                      </div>
                                      {!selection.comment?.trim() ? (
                                        <div className="text-xs text-yellow-700 font-medium">
                                          ⚠️ Comentario requerido
                                        </div>
                                      ) : !selection.isSaving ? (
                                        <div className="text-xs text-green-600 font-medium">
                                          ✓ Guardado
                                        </div>
                                      ) : (
                                        <div className="text-xs text-blue-600 font-medium">
                                          💾 Guardando...
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {selection.selectedStatus && !showStatusYes && !selection.isSaving && (
                                    <div className="text-xs text-green-600 font-medium">
                                      ✓ Guardado
                                    </div>
                                  )}
                                </div>
                              )}

                              {errors[`phone_${idx}`] && (
                                <div className="text-xs text-red-600 mt-1">
                                  {errors[`phone_${idx}`][0]}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-3 py-4 text-center text-gray-500">
                          Sin contactos disponibles
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Resumen de selecciones */}
              {phones.length > 0 && Object.keys(phoneSelections).length > 0 && (
                <div className="bg-gray-50 px-4 py-3 border-t">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Resumen de contactos realizados:</p>
                  <div className="space-y-1">
                    {Object.entries(phoneSelections).map(([index, selection]) => {
                      if (!selection.contacted) return null;
                      
                      const phone = phones[parseInt(index)];
                      const statusList = selection.contacted === '1' ? statusYes : StatusNo;
                      const selectedStatusObj = statusList?.find((s: any) => s.id_contact === selection.selectedStatus);
                      const isIncomplete = !selection.selectedStatus || (selection.contacted === '1' && !selection.comment?.trim());
                      
                      return (
                        <div key={index} className={`text-xs flex items-center flex-wrap gap-2 ${isIncomplete ? 'bg-yellow-50 p-2 rounded border border-yellow-200' : 'bg-green-50 p-2 rounded border border-green-200'}`}>
                          <span className="font-mono bg-white px-2 py-1 rounded border">{phone?.phone}</span>
                          <span>→</span>
                          <span className={`px-2 py-1 rounded ${selection.contacted === '1' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {selection.contacted === '1' ? '✓ Contactado' : '✗ No contactado'}
                          </span>
                          {selectedStatusObj ? (
                            <>
                              <span>→</span>
                              <span className="font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                {selectedStatusObj.descrip}
                              </span>
                            </>
                          ) : (
                            <>
                              <span>→</span>
                              <span className="text-yellow-700 font-semibold px-2 py-1 rounded bg-yellow-100">
                                ⚠️ Falta seleccionar {selection.contacted === '1' ? 'acción' : 'motivo'}
                              </span>
                            </>
                          )}
                          {selection.contacted === '1' && (
                            selection.comment?.trim() ? (
                              <>
                                <span>→</span>
                                <span className="text-green-700 bg-green-100 px-2 py-1 rounded max-w-xs truncate">
                                  💬 {selection.comment}
                                </span>
                              </>
                            ) : (
                              <>
                                <span>→</span>
                                <span className="text-yellow-700 font-semibold px-2 py-1 rounded bg-yellow-100">
                                  ⚠️ Falta comentario
                                </span>
                              </>
                            )
                          )}
                          {selection.isSaving && (
                            <>
                              <span>→</span>
                              <span className="text-blue-700 font-semibold px-2 py-1 rounded bg-blue-100 flex items-center gap-1">
                                <div className="animate-spin h-3 w-3 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                                Guardando...
                              </span>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Botón de Cerrar */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
            <Button
              type="button"
              onClick={handleClose}
              className="px-8 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Cerrar
            </Button>
          </div>

          {/* Errores globales */}
          {Object.keys(errors).filter(k => !k.startsWith('phone_')).length > 0 && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 font-semibold mb-2">Errores:</p>
              <ul className="text-sm text-red-700 list-disc list-inside">
                {Object.entries(errors).filter(([k]) => !k.startsWith('phone_')).map(([field, messages]: [string, any]) => (
                  <li key={field}>
                    {field}: {Array.isArray(messages) ? messages.join(', ') : messages}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


const StatusBadge = ({ status }: { status?: JobClientStatus }) => {
  if (!status) return null;

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
      status.is_life ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
    }`}>
      {status.descrip}
    </span>
  );
};

const ContactStatusBadge = ({ isContacted }: { isContacted?: boolean }) => {
  if (isContacted === undefined) return null;

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
      isContacted ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
    }`}>
      {isContacted ? 'Contactado' : 'No contactado'}
    </span>
  );
};

const ExecutiveActions = ({
  executive,
  onEdit,
  onSchedule
}: {
  executive: JobDayExecutive;
  onEdit: () => void;
  onSchedule: () => void;
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowMenu(!showMenu)}
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-10">
          <div className="py-1">
            <button
              onClick={onEdit}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </button>
            <button
              onClick={onSchedule}
              className="flex items-center w-full px-4 py-2 text-sm text-blue-700 hover:bg-gray-100"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Agendar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function JobExecutivesPage() {
  const [executives, setExecutives] = useState<JobDayExecutive[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [offerFilter, setOfferFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [officeFilter, setOfficeFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedExecutive, setSelectedExecutive] = useState<JobDayExecutive | null>(null);
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [statuses, setStatuses] = useState<JobClientStatus[]>([]);
  const [paginationTotal, setPaginationTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [fetchingSummary, setFetchingSummary] = useState<summaryQueryParams>({} as summaryQueryParams);
  const { user } = useAuth();
  const { selectedOffer, setSelectedOffer } = useOfferStore();
const [showNewClientModal, setShowNewClientModal] = useState(false);
const [campaignFromStorage, setCampaignFromStorage] = useState<string | null>(null);

  useEffect(() => {
  if (selectedOffer?.id_offers) {
    const offerId = selectedOffer.id_offers.toString();
    setOfferFilter(offerId);
    console.log('✅ Campaña preseleccionada desde localStorage:', selectedOffer.descrip);
  }
}, [selectedOffer]);

  useEffect(() => {
  if (selectedOffer?.id_offers) {
    const offerIdCampaning = selectedOffer.id_offers.toString();
    setCampaignFromStorage(offerIdCampaning);
    console.log('✅ Campaña preseleccionada desde localStorage:', selectedOffer.descrip);
  }
}, [selectedOffer]);


  const fetchExecutives = async () => {
    try {
      setLoading(true);
      const params: any = {
        with_contacts: 1,
        page: currentPage,
        per_page: itemsPerPage,
        id_executive: user?.id_executive || undefined,
      };
      console.log('Fetch Params:', params);
      if (offerFilter !== 'all') params.id_offers = offerFilter;

      // Filtro por estado de contacto
      if (statusFilter === 'contacted') {
        params.is_contacted = true;
      } else if (statusFilter === 'not_contacted') {
        params.is_contacted = false;
      } else if (statusFilter !== 'all') {
        params.id_status = statusFilter;
      }

      if (officeFilter !== 'all') params.id_office = officeFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const response = await api.getJobExecutives(params);
      setExecutives(response.data || []);
      setPaginationTotal(response.pagination?.total || 0);
    } catch (error) {
      console.error('Error al cargar ejecutivos:', error);
      setExecutives([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const [offersRes, statusesRes, summary] = await Promise.all([
        api.getJobOffers({ active: true }),
        api.getClientStatuses(), 
        api.getSummary()               
      ]);
    
      setOffers(offersRes.data || []);
      setStatuses(statusesRes.data || []);
      setFetchingSummary(summary.data || {} as summaryQueryParams);
    } catch (error) {
      console.error('Error cargando filtros:', error);
      setOffers([]);
      setStatuses([]);
    }
  };

  useEffect(() => {
    fetchExecutives();
  }, [searchQuery, offerFilter, statusFilter, officeFilter, currentPage, itemsPerPage]);

  useEffect(() => {
    fetchFilters();
  }, []);

  const handleDelete = async (executive: JobDayExecutive) => {
    if (confirm(`¿Está seguro de que desea eliminar a ${executive.name} ${executive.last_name1}?`)) {
      try {        
        await api.deleteJobExecutive(executive.id);
        fetchExecutives();
      } catch (error) {
        alert('Error al eliminar el ejecutivo');
      }
    }
  };

  const handleSchedule = async (executive: JobDayExecutive) => {
    const scheduledDate = prompt('Ingrese la fecha y hora (YYYY-MM-DD HH:MM)');
    if (scheduledDate) {
      try {
        await api.scheduleExecutive(executive.id, scheduledDate);
        fetchExecutives();
      } catch (error) {
        alert('Error al agendar');
      }
    }
  };

  const filteredExecutives = executives.filter(executive => {
    const fullName = `${executive.name} ${executive.last_name1} ${executive.last_name2}`.toLowerCase();
    const rut = `${executive.id_executive}-${executive.dv_executive}`;
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
                         rut.includes(searchQuery) ||
                         executive.id_office?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  console.log('Filtered Executives:', filteredExecutives);
  const paginatedExecutives = filteredExecutives;
  const totalItems = paginationTotal;  
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
  };

  const offices = Array.from(new Set(executives.map(e => e.id_office).filter(Boolean)));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes prospecto</h1>
          <p className="text-gray-600 mt-1">Gestiona las relaciones con tus prospectos</p>
        </div>
        <Button 
          onClick={() => setShowNewClientModal(true)}

          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 mt-4 sm:mt-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Cliente
        </Button>
      </div>

      <NewClientModal
  isOpen={showNewClientModal}
  onClose={() => setShowNewClientModal(false)}
  onSave={() => {
    // Aquí recargas la lista de ejecutivos después de guardar
    fetchExecutives();
  }}
  campaignId={campaignFromStorage || undefined}
/>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{fetchingSummary.summary_1?.title || "Total Clientes"}</p>
                <p className="text-2xl font-bold">{fetchingSummary.summary_1?.maskAmount || 0}</p>
                <div className="flex items-center text-sm text-blue-600">
                  <span>{fetchingSummary.summary_1?.footer || ""}</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{fetchingSummary.summary_2?.title || "No contactado"}</p>
                <p className="text-2xl font-bold">
                  {fetchingSummary.summary_2?.maskAmount || 0}
                </p>
                <div className="flex items-center text-sm text-green-600">
                  <span>{fetchingSummary.summary_2?.footer || ""}</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{fetchingSummary.summary_3?.title || "Total acepta"}</p>
                <p className="text-2xl font-bold">
                  {fetchingSummary.summary_3?.maskAmount || 0}
                </p>
                <div className="flex items-center text-sm text-purple-600">
                  <span>{fetchingSummary.summary_3?.footer || ""}</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{fetchingSummary.summary_4?.title || "Promedio Contactos"}</p>
                <p className="text-2xl font-bold">{fetchingSummary.summary_4?.maskAmount || 0}</p>
                <div className="flex items-center text-sm text-orange-600">
                  <span>{fetchingSummary.summary_4?.footer || ""}</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                <Building className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Buscar cliente..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="offer">Campaña</Label>
              <select
                id="offer"
                value={offerFilter}
                onChange={(e) => setOfferFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="all">Todas las Campañas</option>
                {offers.map(offer => (
                  <option key={offer.id_offers} value={offer.id_offers}>
                    {offer.descrip}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="all">Todos los Estados</option>
                <option value="contacted">Contactado</option>
                <option value="not_contacted">No contactado</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="office">Oficina</Label>
              <select
                id="office"
                value={officeFilter}
                onChange={(e) => setOfficeFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="all">Todas las Oficinas</option>
                {offices.map(office => (
                  <option key={office} value={office}>{office}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Filter className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Ejecutivos */}
      <Card>
        <CardHeader>
          <CardTitle>Clientes ({totalItems})</CardTitle>
          <CardDescription>
            Mostrando {startIndex + 1} a {Math.min(endIndex, totalItems)} de {totalItems} clientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {paginatedExecutives.map((executive) => (
                  <div
                    key={executive.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {executive.name[0]}{executive.last_name1[0]}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {executive.name} {executive.last_name1} {executive.last_name2}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>RUT: {formatRUT(executive.id_client, executive.dv_client)}</span>
                          {executive.id_office && (
                            <>
                              <span>•</span>
                              <div className="flex items-center">
                                <Building className="w-3 h-3 mr-1" />
                                {executive.id_office}
                              </div>
                            </>
                          )}
                          {executive.contacts_phone && executive.contacts_phone.length > 0 && (
                              <>
                                <span>•</span>
                                <div className="flex items-center">
                                  <Phone className="w-3 h-3 mr-1" />
                                  {executive.contacts_phone
                                  .slice(0, 3)
                                  .map(contact => contact.phone)
                                  .join(' / ')}
                                </div>
                              </>
                            )}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          {executive.is_contacted !== undefined && executive.is_contacted ? (
                            <ContactStatusBadge isContacted={true} />
                          ) : (
                            <ContactStatusBadge isContacted={false} />
                          )}
                          {executive.scheduled_date && (
                            <span className="flex items-center text-xs text-blue-600">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatDateTime(executive.scheduled_date)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">
                          {executive.contacts?.length || 0}
                        </div>
                        <div className="text-xs text-gray-600">Contactos</div>
                      </div>

                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">
                          {formatCLP(executive.attrib9)}
                        </div>
                        <div className="text-xs text-gray-600">Total gastado</div>
                      </div>

                      <ExecutiveActions
                        executive={executive}
                        onEdit={() => {
                          setSelectedExecutive(executive);
                          setShowModal(true);
                        }}
                        onSchedule={() => handleSchedule(executive)}
                      />
                    </div>
                  </div>
                ))}

                {paginatedExecutives.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron clientes</h3>
                    <p className="text-gray-600 mb-4">Intenta ajustar tus filtros de búsqueda</p>
                    <Button onClick={() => setShowModal(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar cliente
                    </Button>
                  </div>
                )}
              </div>

              {/* Paginador */}
              {totalPages > 1 && (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-4">
                  {/* Selector de items por página */}
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="itemsPerPage" className="text-sm whitespace-nowrap">
                      Mostrar:
                    </Label>
                    <select
                      id="itemsPerPage"
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="h-9 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </select>
                    <span className="text-sm text-gray-600 whitespace-nowrap">
                      por página
                    </span>
                  </div>

                  {/* Controles de paginación */}
                  <div className="flex items-center space-x-2">
                    {/* Primera página */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(1)}
                      disabled={currentPage === 1}
                      className="hidden sm:flex"
                    >
                      Primera
                    </Button>

                    {/* Página anterior */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {/* Números de página */}
                    <div className="flex items-center space-x-1">
                      {getPageNumbers().map((pageNum) => (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(pageNum)}
                          className={currentPage === pageNum ? "bg-gradient-to-r from-purple-600 to-blue-600" : ""}
                        >
                          {pageNum}
                        </Button>
                      ))}
                    </div>

                    {/* Página siguiente */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>

                    {/* Última página */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="hidden sm:flex"
                    >
                      Última
                    </Button>
                  </div>

                  {/* Info de página actual */}
                  <div className="text-sm text-gray-600 whitespace-nowrap">
                    Página {currentPage} de {totalPages}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      <ExecutiveModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedExecutive(null);
        }}
        executive={selectedExecutive}
        onSave={fetchExecutives}
      />
    </div>
  );
}
  'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Users,
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Building,
  CheckCircle,
  Clock,
  X,
  Phone,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { api } from '@/types/services';
import { JobDayExecutive, JobOffer, JobClientStatus, JobClientStatusContact, summaryQueryParams,PaginatedResponse,ApiResponse } from '@/types';

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
  
  // Estado para las selecciones de teléfonos CON COMENTARIO INDIVIDUAL
  const [phoneSelections, setPhoneSelections] = useState<{
    [key: number]: {
      contacted: 'yes' | 'no' | null;
      selectedStatus: number | null;
      comment: string; // ← AÑADIDO: comentario por teléfono
    }
  }>({});

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
          setPhones(phonesRes.data.phones || []);
        }
      } catch (error) {
        console.error('Error cargando datos del formulario:', error);
      }
    };

    if (isOpen) {
      loadFormData();
      setPhoneSelections({});
    }
  }, [isOpen, executive]);

  useEffect(() => {
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
        contacted: value,
        selectedStatus: null,
        comment: '' // ← Resetear comentario
      }
    }));
  };

  // Manejar cambio de estado en el select
  const handleStatusChange = (phoneIndex: number, statusId: number) => {
    setPhoneSelections(prev => ({
      ...prev,
      [phoneIndex]: {
        ...prev[phoneIndex],
        selectedStatus: statusId
      }
    }));
  };

  // ← NUEVO: Manejar cambio de comentario individual
  const handleCommentChange = (phoneIndex: number, comment: string) => {
    setPhoneSelections(prev => ({
      ...prev,
      [phoneIndex]: {
        ...prev[phoneIndex],
        comment: comment
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validación: Si hay contacto "Sí", el comentario es obligatorio POR CADA TELÉFONO
    const contactsWithoutComment = Object.entries(phoneSelections).filter(
      ([_, sel]) => sel?.contacted === 'yes' && !sel?.comment?.trim()
    );
    
    if (contactsWithoutComment.length > 0) {
      setErrors({ 
        comment: ['El comentario es obligatorio para cada teléfono contactado'] 
      });
      setLoading(false);
      return;
    }

    // Validación: Verificar que si hay contacto seleccionado, tenga un estado de gestión
    const incompleteSelections = Object.entries(phoneSelections).filter(
      ([_, sel]) => sel?.contacted && !sel?.selectedStatus
    );

    if (incompleteSelections.length > 0) {
      setErrors({ 
        phone_contacts: ['Debe seleccionar una acción/motivo para cada teléfono contactado'] 
      });
      setLoading(false);
      return;
    }

    try {
      const data = {
        ...formData,
        id_offers: parseInt(formData.id_offers),
        id_client: parseInt(formData.id_client),
        id_executive: parseInt(formData.id_executive),
        id_status: parseInt(formData.id_status.toString()),
        id_contact: parseInt(formData.id_contact.toString()),
        phone_contacts: phoneSelections, // Incluye contacted, selectedStatus Y comment
      };

     /* if (executive) {
        await api.updateJobExecutive(executive.id, data);
      } else {
        await api.createJobExecutive(data);
      }*/
     console.log('Datos a enviar:', data);
      onSave();
      onClose();
    } catch (error: any) {
      setErrors(error.response?.data?.errors || {});
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedOffer = offers.find(o => o.id_offers.toString() === formData.id_offers);
  const currentStatus = statuses.find(s => s.id_status === formData.id_status);
  const currentContact = contactStatuses.find(c => c.id_contact === formData.id_contact);
  const requiresScheduledDate = currentContact?.is_scheduled === true;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-lg w-full max-w-5xl my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-t-lg sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">
              {executive ? 'Editar Agenda (Popup registro evento atención al cliente)' : 'Nuevo Ejecutivo'}
            </h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
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
            {selectedOffer && attibut && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-gray-600">{attibut.attrib15 || 'Oferta'}</Label>
                  <p className="font-semibold">$2.100.000</p>
                </div>
                <div>
                  <Label className="text-gray-600">{attibut.attrib10 || 'Plazo'}</Label>
                  <p className="font-semibold">-</p>
                </div>
                <div>
                  <Label className="text-gray-600">{attibut.attrib5 || 'Fecha Vencto TC'}</Label>
                  <p className="font-semibold">10-12-2025</p>
                </div>
                <div>
                  <Label className="text-gray-600">{attibut.attrib3 || 'Propensión'}</Label>
                  <p className="font-semibold">Baja</p>
                </div>
                <div>
                  <Label className="text-gray-600">{attibut.attrib6 || 'Actividad TC'}</Label>
                  <p className="font-semibold">-</p>
                </div>
                <div>
                  <Label className="text-gray-600">{attibut.attrib1 || 'Tipo Base'}</Label>
                  <p className="font-semibold">Normal</p>
                </div>
                <div>
                  <Label className="text-gray-600">{attibut.attrib11 || 'Saldo TCV'}</Label>
                  <p className="font-semibold">-</p>
                </div>
                <div>
                  <Label className="text-gray-600">{attibut.attrib9 || 'Cuotas Pagadas REF'}</Label>
                  <p className="font-semibold">-</p>
                </div>
              </div>
            )}

            {/* Teléfonos Disponibles - TABLA CON COMENTARIO POR FILA */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-blue-100 px-4 py-2">
                <h3 className="font-semibold text-sm">Teléfonos disponibles</h3>
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
                        const showStatusYes = selection?.contacted === 'yes';
                        const showStatusNo = selection?.contacted === 'no';

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
                                    checked={selection?.contacted === 'yes'}
                                    onChange={() => handleContactChange(idx, 'yes')}
                                    className="w-4 h-4 text-green-600"
                                  />
                                  <span className="text-green-600 font-medium">Sí</span>
                                </label>
                                
                                <label className="flex items-center space-x-1 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`contact-${idx}`}
                                    checked={selection?.contacted === 'no'}
                                    onChange={() => handleContactChange(idx, 'no')}
                                    className="w-4 h-4 text-red-600"
                                  />
                                  <span className="text-red-600 font-medium">No</span>
                                </label>
                              </div>
                            </td>

                            {/* Columna Gestión con Select Y Comentario debajo */}
                            <td className="px-3 py-2">
                              {!selection?.contacted && (
                                <div className="text-xs text-gray-400 italic">
                                  <span className="text-blue-600">▶</span> Seleccione contacto primero
                                </div>
                              )}

                              {(showStatusYes || showStatusNo) && (
                                <div className="space-y-2">
                                  {/* SELECT */}
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

                                  {/* TEXTAREA DE COMENTARIO - SOLO SI ES "SÍ" */}
                                  {showStatusYes && (
                                    <div className="space-y-1">
                                      <textarea
                                        value={selection.comment || ''}
                                        onChange={(e) => handleCommentChange(idx, e.target.value)}
                                        placeholder="Comentario obligatorio..."
                                        rows={2}
                                        className={`w-full px-2 py-1.5 text-xs border-2 rounded resize-none focus:ring-1 ${
                                          selection.comment?.trim() 
                                            ? 'border-green-300 bg-green-50 focus:border-green-500' 
                                            : 'border-yellow-300 bg-yellow-50 focus:border-yellow-500'
                                        }`}
                                      />
                                      {!selection.comment?.trim() && (
                                        <div className="text-xs text-yellow-700 font-medium">
                                          ⚠️ Comentario requerido
                                        </div>
                                      )}
                                      {selection.comment?.trim() && (
                                        <div className="text-xs text-green-600 font-medium">
                                          ✓ Comentario agregado
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {selection.selectedStatus && !showStatusYes && (
                                    <div className="text-xs text-red-600 font-medium">
                                      ✓ Motivo seleccionado
                                    </div>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-3 py-4 text-center text-gray-500">
                          No hay teléfonos disponibles
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
                      const statusList = selection.contacted === 'yes' ? statusYes : StatusNo;
                      const selectedStatusObj = statusList?.find((s: any) => s.id_contact === selection.selectedStatus);
                      const isIncomplete = !selection.selectedStatus || (selection.contacted === 'yes' && !selection.comment?.trim());
                      
                      return (
                        <div key={index} className={`text-xs flex items-center flex-wrap gap-2 ${isIncomplete ? 'bg-yellow-50 p-2 rounded border border-yellow-200' : ''}`}>
                          <span className="font-mono bg-white px-2 py-1 rounded border">{phone?.phone}</span>
                          <span>→</span>
                          <span className={`px-2 py-1 rounded ${selection.contacted === 'yes' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {selection.contacted === 'yes' ? '✓ Contactado' : '✗ No contactado'}
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
                                ⚠️ Falta seleccionar {selection.contacted === 'yes' ? 'acción' : 'motivo'}
                              </span>
                            </>
                          )}
                          {/* MOSTRAR COMENTARIO EN EL RESUMEN */}
                          {selection.contacted === 'yes' && (
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
                        </div>
                      );
                    })}
                  </div>

                  {/* Advertencia si hay selecciones incompletas */}
                  {Object.values(phoneSelections).some(sel => 
                    sel?.contacted && (!sel?.selectedStatus || (sel?.contacted === 'yes' && !sel?.comment?.trim()))
                  ) && (
                    <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded">
                      <p className="text-xs text-yellow-800 font-semibold">
                        ⚠️ Complete la gestión y comentarios para todos los teléfonos contactados antes de grabar
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* NOTA: Se eliminó el campo de comentario global, 
                 ahora cada teléfono tiene su propio comentario en la tabla */}

          </div>

          {/* Botones de Acción */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-6"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="px-8 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {loading ? 'Guardando...' : 'Grabar Acción'}
            </Button>
          </div>

          {/* Errores */}
          {Object.keys(errors).length > 0 && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 font-semibold mb-2">Errores de validación:</p>
              <ul className="text-sm text-red-700 list-disc list-inside">
                {Object.entries(errors).map(([field, messages]: [string, any]) => (
                  <li key={field}>
                    {field}: {Array.isArray(messages) ? messages.join(', ') : messages}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </form>
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

const ExecutiveActions = ({ 
  executive, 
  onEdit, 
  onDelete,
  onSchedule
}: { 
  executive: JobDayExecutive; 
  onEdit: () => void; 
  onDelete: () => void;
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
            <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              <Eye className="mr-2 h-4 w-4" />
              Ver Detalles
            </button>
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
            <button 
              onClick={onDelete}
              className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
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

  const fetchExecutives = async () => {
    try {
      setLoading(true);
      const params: any = {
        with_contacts: 1,
        page: currentPage,
        per_page: itemsPerPage,
      };
      
      if (offerFilter !== 'all') params.id_offers = offerFilter;
      if (statusFilter !== 'all') params.id_status = statusFilter;
      if (officeFilter !== 'all') params.id_office = officeFilter;
      
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
  }, [offerFilter, statusFilter, officeFilter, currentPage, itemsPerPage]);

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
          onClick={() => {
            setSelectedExecutive(null);
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 mt-4 sm:mt-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Ejecutivo
        </Button>
      </div>

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
                <p className="text-sm font-medium text-muted-foreground">{fetchingSummary.summary_2?.title || "Clientes Sin acciones"}</p>
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
                  placeholder="Buscar ejecutivos..."
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
                {statuses && statuses.length > 0 && statuses.map(status => (
                  <option key={status.id_status} value={status.id_status}>
                    {status.descrip}
                  </option>
                ))}
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
          <CardTitle>Ejecutivos ({totalItems})</CardTitle>
          <CardDescription>
            Mostrando {startIndex + 1} a {Math.min(endIndex, totalItems)} de {totalItems} ejecutivos
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
                          <span>RUT: {executive.id_executive}-{executive.dv_executive}</span>
                          {executive.id_office && (
                            <>
                              <span>•</span>
                              <div className="flex items-center">
                                <Building className="w-3 h-3 mr-1" />
                                {executive.id_office}
                              </div>
                            </>
                          )}
                          {executive.attrib1 && (
                            <>
                              <span>•</span>
                              <div className="flex items-center">
                                <Phone className="w-3 h-3 mr-1" />
                                {executive.attrib1}
                              </div>
                            </>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <StatusBadge status={executive.status} />
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
                          $ {executive.attrib9 || 0}
                        </div>
                        <div className="text-xs text-gray-600">Total gastado</div>
                      </div>

                      <ExecutiveActions
                        executive={executive}
                        onEdit={() => {
                          setSelectedExecutive(executive);
                          setShowModal(true);
                        }}
                        onDelete={() => handleDelete(executive)}
                        onSchedule={() => handleSchedule(executive)}
                      />
                    </div>
                  </div>
                ))}

                {paginatedExecutives.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron ejecutivos</h3>
                    <p className="text-gray-600 mb-4">Intenta ajustar tus filtros de búsqueda</p>
                    <Button onClick={() => setShowModal(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Nuevo Ejecutivo
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
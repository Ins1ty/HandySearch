'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore, useDataStore } from '@/store';
import { contactsApi, categoriesApi, tagsApi, eventsApi, invitationTypesApi, authApi, citiesApi, responsiblesApi } from '@/lib/api';

const priorityIcons: Record<string, string> = {
  call: '📞',
  sms: '💬',
  messenger: '✉️',
  email: '📧',
};

const priorityLabels: Record<string, string> = {
  call: 'Звонок',
  sms: 'СМС',
  messenger: 'Мессенджер',
  email: 'Почта',
};

interface Contact {
  id: number;
  first_name: string;
  middle_name?: string;
  last_name?: string;
  description?: string;
  short_description?: string;
  full_description?: string;
  priority_contact?: 'call' | 'sms' | 'messenger' | 'email';
  phone?: string;
  email?: string;
  social?: string;
  birthday?: string;
  place_of_birth?: string;
  workplace?: string;
  position?: string;
  previous_workplaces?: string;
  responsible_ids?: number[];
  category_id?: number;
  category?: { id: number; name: string; color: string };
  responsibles?: { id: number; name: string }[];
  tags?: { id: number; name: string; color: string }[];
  invitation_type_ids?: number[];
  postal_address?: string;
  region?: number | string;
  visible_only_to_admin?: boolean;
  visible_only_to_editor?: boolean;
  gifts_given?: string;
  is_priest?: boolean;
}

function getContactDisplayName(contact: Contact): string {
  const parts = [contact.first_name];
  if (contact.middle_name) parts.push(contact.middle_name);
  if (contact.last_name) parts.push(contact.last_name);
  const fullName = parts.join(' ');
  return contact.is_priest ? `Отец ${fullName}` : fullName;
}

function safeJoin(arr: any, separator = ', '): string {
  if (!arr) return '-';
  if (typeof arr === 'string') return arr || '-';
  if (Array.isArray(arr)) return arr.join(separator);
  return String(arr) || '-';
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length === 0) return '';
  if (digits.length <= 3) return `+7 (${digits}`;
  if (digits.length <= 6) return `+7 (${digits.slice(0, 3)}) ${digits.slice(3)}`;
  if (digits.length <= 8) return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 10)}`;
}

export default function ContactDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { categories, tags, events, invitationTypes, cities, responsibles, setCategories, setTags, setEvents, setInvitationTypes, setCities, setResponsibles } = useDataStore();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [showResponsiblesPopover, setShowResponsiblesPopover] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }
    loadData();
  }, [isAuthenticated, params.id]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showResponsiblesPopover && !(e.target as Element).closest('.responsibles-popover')) {
        setShowResponsiblesPopover(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showResponsiblesPopover]);

  const loadData = async () => {
    try {
      const [contactRes, categoriesRes, tagsRes, eventsRes, typesRes, citiesRes, responsiblesRes] = await Promise.all([
        contactsApi.getOne(Number(params.id)),
        categoriesApi.getAll(),
        tagsApi.getAll(),
        eventsApi.getAll({ contact_id: String(params.id) }),
        invitationTypesApi.getAll(),
        citiesApi.getAll(),
        responsiblesApi.getAll(),
      ]);
      setContact(contactRes.data);
      setFormData({
        ...contactRes.data,
        tags: contactRes.data.tags?.map((t: any) => t.id) || [],
        invitation_type_ids: typeof contactRes.data.invitation_types === 'string'
          ? contactRes.data.invitation_types.split(',').filter(Boolean).map(Number)
          : (contactRes.data.invitation_type_ids || []),
        responsible_ids: contactRes.data.responsibles?.map((r: any) => r.id) || [],
      });
      setCategories(categoriesRes.data);
      setTags(tagsRes.data);
      setEvents(eventsRes.data);
      setInvitationTypes(typesRes.data);
      setCities(citiesRes.data);
      setResponsibles(responsiblesRes.data);
    } catch (error) {
      console.error('Error loading contact:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (e) {}
    logout();
    router.push('/');
  };

  const handleSave = async () => {
    try {
      const dataToSend = {
        ...formData,
        invitation_types: Array.isArray(formData.invitation_type_ids) ? formData.invitation_type_ids : [],
        responsible_ids: Array.isArray(formData.responsible_ids) ? formData.responsible_ids : [],
        tags: Array.isArray(formData.tags) ? formData.tags : [],
      };
      await contactsApi.update(Number(params.id), dataToSend);
      setEditing(false);
      loadData();
    } catch (error) {
      console.error('Error updating contact:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить этот контакт?')) return;
    try {
      await contactsApi.delete(Number(params.id));
      router.push('/contacts');
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  if (loading || !contact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        Загрузка...
      </div>
    );
  }

  const canEdit = user?.role === 'admin' || user?.role === 'editor';

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <header style={{
        background: 'white',
        padding: '1rem 2rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => router.push('/contacts')}
            style={{
              padding: '0.5rem 1rem',
              background: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Назад
          </button>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {editing ? 'Редактирование' : 'Контакт'}
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span>{user?.name} ({user?.role})</span>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1rem',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Выйти
          </button>
        </div>
      </header>

      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Имя</label>
                {editing ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                    <input type="text" value={formData.first_name || ''} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} placeholder="Имя *" style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }} />
                    <input type="text" value={formData.middle_name || ''} onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })} placeholder="Отчество" style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }} />
                    <input type="text" value={formData.last_name || ''} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} placeholder="Фамилия" style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }} />
                  </div>
                ) : (
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{getContactDisplayName(contact)}</div>
                )}
              </div>

              {editing && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    background: formData.is_priest ? '#8b5cf6' : '#f3f4f6',
                    color: formData.is_priest ? 'white' : '#6b7280',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: formData.is_priest ? '2px solid #7c3aed' : '2px solid transparent'
                  }}
                  onClick={() => setFormData({ ...formData, is_priest: !formData.is_priest })}
                  >
                    <input
                      type="checkbox"
                      checked={formData.is_priest || false}
                      onChange={(e) => {
                        e.stopPropagation();
                        setFormData({ ...formData, is_priest: e.target.checked });
                      }}
                      style={{ display: 'none' }}
                    />
                    <span style={{ fontSize: '1.5rem' }}>🙏</span>
                    <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>Священник</span>
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Категория</label>
                {editing ? (
                  <select value={formData.category_id || ''} onChange={(e) => setFormData({ ...formData, category_id: e.target.value ? Number(e.target.value) : null })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}>
                    <option value="">Не выбрано</option>
                    {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                  </select>
                ) : (
                  contact.category ? <span style={{ background: contact.category.color + '20', color: contact.category.color, padding: '0.25rem 0.5rem', borderRadius: '4px' }}>{contact.category.name}</span> : '-'
                )}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Теги</label>
                {editing ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {tags.map(tag => (
                      <label key={tag.id} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <input type="checkbox" checked={formData.tags?.includes(tag.id)} onChange={(e) => { const newTags = e.target.checked ? [...(formData.tags || []), tag.id] : formData.tags.filter((t: number) => t !== tag.id); setFormData({ ...formData, tags: newTags }); }} />
                        <span style={{ background: tag.color + '20', color: tag.color, padding: '0.125rem 0.375rem', borderRadius: '4px', fontSize: '0.875rem' }}>{tag.name}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                    {contact.tags?.map(tag => (<span key={tag.id} style={{ background: tag.color + '20', color: tag.color, padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.875rem' }}>{tag.name}</span>))}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Краткое описание</label>
                {editing ? (
                  <input type="text" value={formData.short_description || ''} onChange={(e) => setFormData({ ...formData, short_description: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }} />
                ) : (
                  <div>{contact.short_description || '-'}</div>
                )}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Подробное описание</label>
                {editing ? (
                  <textarea value={formData.full_description || ''} onChange={(e) => setFormData({ ...formData, full_description: e.target.value })} rows={4} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }} />
                ) : (
                  <div style={{ whiteSpace: 'pre-wrap' }}>{contact.full_description || '-'}</div>
                )}
              </div>
            </div>

            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Телефон</label>
                {editing ? (
                  <input type="tel" value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })} placeholder="+7 (___) ___-__-__" style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }} />
                ) : (
                  <div>{contact.phone || '-'}</div>
                )}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Email</label>
                {editing ? (
                  <input type="email" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }} />
                ) : (
                  <div>{contact.email || '-'}</div>
                )}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Соцсети / Мессенджеры</label>
                {editing ? (
                  <input type="text" value={formData.social || ''} onChange={(e) => setFormData({ ...formData, social: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }} />
                ) : (
                  <div>{contact.social || '-'}</div>
                )}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Приоритетная связь</label>
                {editing ? (
                  <select value={formData.priority_contact || ''} onChange={(e) => setFormData({ ...formData, priority_contact: e.target.value || null })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}>
                    <option value="">Не выбрано</option>
                    <option value="call">📞 Звонок</option>
                    <option value="sms">💬 СМС</option>
                    <option value="messenger">✉️ Мессенджер</option>
                    <option value="email">📧 Почта</option>
                  </select>
                ) : (
                  <div>{contact.priority_contact ? <span>{priorityIcons[contact.priority_contact]} {priorityLabels[contact.priority_contact]}</span> : '-'}</div>
                )}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Дата рождения</label>
                {editing ? (
                  <input type="date" value={formData.birthday || ''} onChange={(e) => setFormData({ ...formData, birthday: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }} />
                ) : (
                  <div>{contact.birthday ? new Date(contact.birthday).toLocaleDateString('ru-RU') : '-'}</div>
                )}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Место рождения</label>
                {editing ? (
                  <input type="text" value={formData.place_of_birth || ''} onChange={(e) => setFormData({ ...formData, place_of_birth: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }} />
                ) : (
                  <div>{contact.place_of_birth || '-'}</div>
                )}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem' }}>Служение</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Место работы/служения</label>
                  {editing ? (
                    <input type="text" value={formData.workplace || ''} onChange={(e) => setFormData({ ...formData, workplace: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }} />
                  ) : (
                    <div>{contact.workplace || '-'}</div>
                  )}
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Должность/деятельность</label>
                  {editing ? (
                    <input type="text" value={formData.position || ''} onChange={(e) => setFormData({ ...formData, position: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }} />
                  ) : (
                    <div>{contact.position || '-'}</div>
                  )}
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Прошлые места службы</label>
                  {editing ? (
                    <textarea value={formData.previous_workplaces || ''} onChange={(e) => setFormData({ ...formData, previous_workplaces: e.target.value })} rows={3} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }} />
                  ) : (
                    <div style={{ whiteSpace: 'pre-wrap' }}>{contact.previous_workplaces || '-'}</div>
                  )}
                </div>
              </div>
              <div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Город</label>
                  {editing ? (
                    <select value={formData.region || ''} onChange={(e) => setFormData({ ...formData, region: e.target.value ? Number(e.target.value) : null })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}>
                      <option value="">Не выбран</option>
                      {cities.map(city => (<option key={city.id} value={city.id}>{city.name}</option>))}
                    </select>
                  ) : (
                    <div>{contact.region ? cities.find(c => c.id === Number(contact.region))?.name || '-' : '-'}</div>
                  )}
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Почтовый адрес</label>
                  {editing ? (
                    <textarea value={formData.postal_address || ''} onChange={(e) => setFormData({ ...formData, postal_address: e.target.value })} rows={2} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }} />
                  ) : (
                    <div style={{ whiteSpace: 'pre-wrap' }}>{contact.postal_address || '-'}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem' }}>Взаимодействие</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Что дарили</label>
                  {editing ? (
                    <textarea value={formData.gifts_given || ''} onChange={(e) => setFormData({ ...formData, gifts_given: e.target.value })} rows={2} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }} />
                  ) : (
                    <div style={{ whiteSpace: 'pre-wrap' }}>{contact.gifts_given || '-'}</div>
                  )}
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Куда приглашать</label>
                  {editing ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {invitationTypes.map(type => (
                        <label key={type.id} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                          <input type="checkbox" checked={(formData.invitation_type_ids as number[] || []).includes(type.id)} onChange={(e) => { const current = formData.invitation_type_ids as number[] || []; const selected = e.target.checked ? [...current, type.id] : current.filter(id => id !== type.id); setFormData({ ...formData, invitation_type_ids: selected }); }} />
                          <span style={{ fontSize: '0.875rem' }}>{type.name}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div>{invitationTypes.filter(t => (contact.invitation_type_ids as number[] || []).includes(t.id)).map(t => t.name).join(', ') || '-'}</div>
                  )}
                </div>
              </div>
              <div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Кто ответственный</label>
                  {editing ? (
                    <div className="responsibles-popover" style={{ position: 'relative' }}>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setShowResponsiblesPopover(!showResponsiblesPopover); }}
                        style={{
                          width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd', 
                          borderRadius: '4px', background: 'white', textAlign: 'left',
                          cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          fontSize: '0.875rem'
                        }}
                      >
                        <span style={{ color: (formData.responsible_ids as number[] || []).length === 0 ? '#9ca3af' : '#111' }}>
                          {(formData.responsible_ids as number[] || []).length === 0 
                            ? 'Не выбрано' 
                            : responsibles.filter(r => (formData.responsible_ids as number[] || []).includes(r.id)).map(r => r.name).join(', ')}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>▼</span>
                      </button>
                      
                      {showResponsiblesPopover && (
                        <div style={{
                          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                          background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', padding: '0.5rem', 
                          maxHeight: '250px', overflowY: 'auto', marginTop: '0.25rem'
                        }}>
                          {responsibles.map(r => (
                            <label key={r.id} style={{ 
                              display: 'flex', alignItems: 'center', gap: '0.5rem', 
                              padding: '0.5rem', cursor: 'pointer', borderRadius: '4px',
                              transition: 'background 0.15s'
                            }}
                            onMouseEnter={(e) => (e.target as HTMLElement).style.background = '#f3f4f6'}
                            onMouseLeave={(e) => (e.target as HTMLElement).style.background = 'transparent'}
                            >
                              <input
                                type="checkbox"
                                checked={(formData.responsible_ids as number[] || []).includes(r.id)}
                                onChange={(e) => { 
                                  const current = formData.responsible_ids as number[] || []; 
                                  const selected = e.target.checked ? [...current, r.id] : current.filter(id => id !== r.id); 
                                  setFormData({ ...formData, responsible_ids: selected }); 
                                }}
                              />
                              <span style={{ fontSize: '0.875rem' }}>{r.name}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>{contact.responsibles?.map(r => r.name).join(', ') || '-'}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {editing && user?.role === 'admin' && (
            <div style={{ marginTop: '1.5rem', borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Видимость</label>
              <select value={formData.visible_only_to_admin ? 'admin' : formData.visible_only_to_editor ? 'editor' : 'all'} onChange={(e) => { const val = e.target.value; setFormData({ ...formData, visible_only_to_admin: val === 'admin', visible_only_to_editor: val === 'editor' }); }} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}>
                <option value="all">Все (видят все)</option>
                <option value="editor">Редактор + Админ</option>
                <option value="admin">Только Админ</option>
              </select>
            </div>
          )}

          {editing && user?.role === 'editor' && (
            <div style={{ marginTop: '1.5rem', borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" checked={formData.visible_only_to_editor || false} onChange={(e) => setFormData({ ...formData, visible_only_to_editor: e.target.checked })} />
                <span>Виден только мне (редактору)</span>
              </label>
            </div>
          )}

          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            {editing ? (
              <>
                <button onClick={() => setEditing(false)} style={{ padding: '0.75rem 1.5rem', background: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Отмена</button>
                <button onClick={handleSave} style={{ padding: '0.75rem 1.5rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Сохранить</button>
              </>
            ) : (
              canEdit && (
                <>
                  <button onClick={() => setEditing(true)} style={{ padding: '0.75rem 1.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Редактировать</button>
                  {user?.role === 'admin' && <button onClick={handleDelete} style={{ padding: '0.75rem 1.5rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Удалить</button>}
                </>
              )
            )}
          </div>
        </div>

        {events.length > 0 && (
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginTop: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>История событий</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {events.map(event => (
                <div key={event.id} style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer' }} onClick={() => router.push(`/events/${event.id}`)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div><strong>{event.title}</strong>{event.invitation_type && <span style={{ marginLeft: '0.5rem', background: event.invitation_type.color + '20', color: event.invitation_type.color, padding: '0.125rem 0.375rem', borderRadius: '4px', fontSize: '0.75rem' }}>{event.invitation_type.name}</span>}</div>
                    <div style={{ color: '#6b7280' }}>{new Date(event.event_date).toLocaleDateString('ru-RU')}</div>
                  </div>
                  {event.description && <div style={{ marginTop: '0.5rem', color: '#6b7280', fontSize: '0.875rem' }}>{event.description}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useDataStore, useFilterStore } from '@/store';
import { contactsApi, categoriesApi, tagsApi, responsiblesApi, authApi, eventsApi, citiesApi } from '@/lib/api';
import { exportContactsToExcel } from '@/lib/export';

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

function getContactDisplayName(contact: any): string {
  const isPriest = contact.tags?.some((t: any) => t.name.toLowerCase().includes('священник'));
  const parts = [contact.first_name];
  if (contact.middle_name) parts.push(contact.middle_name);
  if (contact.last_name) parts.push(contact.last_name);
  const fullName = parts.join(' ');
  return isPriest ? `Отец ${fullName}` : fullName;
}

function getFullNameForSearch(contact: any): string {
  const parts = [contact.first_name || ''];
  if (contact.middle_name) parts.push(contact.middle_name);
  if (contact.last_name) parts.push(contact.last_name);
  return parts.join(' ').toLowerCase();
}

const TOTAL_STEPS = 5;

export default function ContactsPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { contacts, categories, tags, responsibles, events, cities, setContacts, setCategories, setTags, setResponsibles, setEvents, setCities } = useDataStore();
  const { 
    search, categoryId, tagId, region, sortBy, sortOrder,
    setSearch, setCategoryId, setTagId, setRegion, setSortBy, setSortOrder, resetFilters 
  } = useFilterStore();
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [newContact, setNewContact] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    description: '',
    short_description: '',
    full_description: '',
    priority_contact: '' as '' | 'call' | 'sms' | 'messenger' | 'email',
    phone: '',
    email: '',
    social: '',
    birthday: '',
    place_of_birth: '',
    workplace: '',
    position: '',
    previous_workplaces: '',
    category_id: null as number | null,
    responsible_id: null as number | null,
    tags: [] as number[],
    invitation_types: [] as string[],
    required_invitations: [] as string[],
    postal_address: '',
    region: null as number | null,
    visible_only_to_admin: false,
    visible_only_to_editor: false,
    gifts_given: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }
    loadData();
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      const [contactsRes, categoriesRes, tagsRes, responsiblesRes, eventsRes, citiesRes] = await Promise.all([
        contactsApi.getAll(),
        categoriesApi.getAll(),
        tagsApi.getAll(),
        responsiblesApi.getAll(),
        eventsApi.getAll(),
        citiesApi.getAll(),
      ]);
      setContacts(contactsRes.data);
      setCategories(categoriesRes.data);
      setTags(tagsRes.data);
      setResponsibles(responsiblesRes.data);
      setEvents(eventsRes.data);
      setCities(citiesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      if (error === 'Unauthorized') {
        logout();
        router.push('/');
      }
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

  const resetForm = () => {
    setNewContact({
      first_name: '', middle_name: '', last_name: '', description: '', short_description: '', full_description: '',
      priority_contact: '', phone: '', email: '', social: '', birthday: '', place_of_birth: '',
      workplace: '', position: '', previous_workplaces: '', category_id: null, responsible_id: null,
      tags: [], invitation_types: [], required_invitations: [], postal_address: '', region: null,
      visible_only_to_admin: false, visible_only_to_editor: false, gifts_given: '',
    });
    setCurrentStep(1);
  };

  const handleCreateContact = async () => {
    if (!newContact.first_name) return;
    setSaving(true);
    try {
      const dataToSend: any = {
        first_name: newContact.first_name,
        middle_name: newContact.middle_name || undefined,
        last_name: newContact.last_name || undefined,
        description: newContact.description || undefined,
        short_description: newContact.short_description || undefined,
        full_description: newContact.full_description || undefined,
        priority_contact: newContact.priority_contact || undefined,
        phone: newContact.phone || undefined,
        email: newContact.email || undefined,
        social: newContact.social || undefined,
        birthday: newContact.birthday || undefined,
        place_of_birth: newContact.place_of_birth || undefined,
        workplace: newContact.workplace || undefined,
        position: newContact.position || undefined,
        previous_workplaces: newContact.previous_workplaces || undefined,
        category_id: newContact.category_id || undefined,
        responsible_id: newContact.responsible_id || undefined,
        tags: newContact.tags.length > 0 ? newContact.tags : undefined,
        invitation_types: newContact.invitation_types.length > 0 ? newContact.invitation_types : undefined,
        required_invitations: newContact.required_invitations.length > 0 ? newContact.required_invitations : undefined,
        postal_address: newContact.postal_address || undefined,
        region: newContact.region || undefined,
        gifts_given: newContact.gifts_given || undefined,
      };
      
      if (user?.role === 'admin') {
        dataToSend.visible_only_to_admin = newContact.visible_only_to_admin;
        dataToSend.visible_only_to_editor = newContact.visible_only_to_editor;
      } else if (user?.role === 'editor') {
        dataToSend.visible_only_to_editor = newContact.visible_only_to_editor;
      }
      
      await contactsApi.create(dataToSend);
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Error creating contact:', error);
      alert(error.response?.data?.message || 'Ошибка при создании контакта');
    } finally {
      setSaving(false);
    }
  };

  const filteredContacts = contacts.filter(contact => {
    if (search) {
      const fullNameSearch = getFullNameForSearch(contact);
      const searchLower = search.toLowerCase();
      if (!fullNameSearch.includes(searchLower) && !contact.description?.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    if (categoryId && contact.category_id !== categoryId) {
      return false;
    }
    if (tagId && !contact.tags?.some(t => t.id === tagId)) {
      return false;
    }
    if (region) {
      const cityName = contact.region ? cities.find(c => c.id === Number(contact.region))?.name || '' : '';
      if (!cityName.toLowerCase().includes(region.toLowerCase())) {
        return false;
      }
    }
    return true;
  });

  const sortedContacts = [...filteredContacts].sort((a, b) => {
    let aVal = '';
    let bVal = '';
    
    if (sortBy === 'name') { aVal = a.first_name || ''; bVal = b.first_name || ''; }
    else if (sortBy === 'region') { aVal = a.region || ''; bVal = b.region || ''; }
    else if (sortBy === 'birthday') { aVal = a.birthday || ''; bVal = b.birthday || ''; }
    else if (sortBy === 'created_at') { aVal = a.created_at || ''; bVal = b.created_at || ''; }
    else { aVal = a.first_name || ''; bVal = b.first_name || ''; }
    
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        Загрузка...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <header style={{ 
        background: 'white', 
        padding: '1rem', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Контакты</h1>
          <button
            onClick={() => router.push('/events')}
            style={{
              padding: '0.5rem',
              background: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            События
          </button>
          <button
            onClick={() => router.push('/responsibles')}
            style={{
              padding: '0.5rem',
              background: '#ec4899',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            Ответств.
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.875rem' }}>{user?.name}</span>
          <button
            onClick={() => exportContactsToExcel(sortedContacts, cities)}
            style={{
              padding: '0.5rem',
              background: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            ⬇ Excel
          </button>
          {user?.role === 'admin' && (
            <>
              <button
                onClick={() => router.push('/users')}
                style={{
                  padding: '0.5rem',
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Пользователи
              </button>
              <button
                onClick={() => router.push('/settings')}
                style={{
                  padding: '0.5rem',
                  background: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Настройки
              </button>
            </>
          )}
          <button 
            onClick={handleLogout}
            style={{
              padding: '0.5rem',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            Выйти
          </button>
        </div>
      </header>

      <div style={{ padding: '1rem' }}>
        <div style={{ 
          background: 'white', 
          padding: '1rem', 
          borderRadius: '8px',
          marginBottom: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Поиск..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: '1 1 100%',
                minWidth: '150px',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
            
            <select
              value={categoryId || ''}
              onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
              style={{
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                minWidth: '120px'
              }}
            >
              <option value="">Категория</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            <select
              value={tagId || ''}
              onChange={(e) => setTagId(e.target.value ? Number(e.target.value) : null)}
              style={{
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                minWidth: '100px'
              }}
            >
              <option value="">Тег</option>
              {tags.map(tag => (
                <option key={tag.id} value={tag.id}>{tag.name}</option>
              ))}
            </select>

            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              style={{
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                minWidth: '100px'
              }}
            >
              <option value="">Город</option>
              {cities.map(city => (
                <option key={city.id} value={city.name}>{city.name}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            >
              <option value="name">По имени</option>
              <option value="region">По региону</option>
              <option value="birthday">По дате рождения</option>
              <option value="created_at">По дате добавления</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              style={{
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            >
              <option value="asc">↑</option>
              <option value="desc">↓</option>
            </select>

            <button
              onClick={resetFilters}
              style={{
                padding: '0.5rem 0.75rem',
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Сброс
            </button>

            {user?.role !== 'viewer' && (
              <button
                onClick={() => setShowModal(true)}
                style={{
                  padding: '0.5rem 0.75rem',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  flex: '1 1 100%',
                  marginTop: '0.5rem'
                }}
              >
                + добавить контакт
              </button>
            )}
          </div>
        </div>

        <div style={{ 
          background: 'white', 
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'auto'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
            <thead style={{ background: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Имя</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Категория</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Теги</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Связь</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Регион</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Телефон</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Email</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>ДР</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Ответственный</th>
              </tr>
            </thead>
            <tbody>
              {sortedContacts.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                    Контакты не найдены
                  </td>
                </tr>
              ) : (
                sortedContacts.map(contact => (
                  <tr 
                    key={contact.id} 
                    style={{ cursor: 'pointer' }}
                    onClick={() => router.push(`/contacts/${contact.id}`)}
                  >
                    <td style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                      <strong>{getContactDisplayName(contact)}</strong>
                      {contact.description && (
                        <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                          {contact.description.substring(0, 50)}...
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                      {contact.category && (
                        <span style={{ 
                          background: contact.category.color + '20', 
                          color: contact.category.color,
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.875rem'
                        }}>
                          {contact.category.name}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                        {contact.tags?.map(tag => (
                          <span key={tag.id} style={{ 
                            background: tag.color + '20', 
                            color: tag.color,
                            padding: '0.125rem 0.375rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem'
                          }}>
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                      {contact.priority_contact ? (
                        <span title={priorityLabels[contact.priority_contact]}>
                          {priorityIcons[contact.priority_contact]}
                        </span>
                      ) : '-'}
                    </td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                      {contact.region ? cities.find(c => c.id === Number(contact.region))?.name || '-' : '-'}
                    </td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>{contact.phone || '-'}</td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>{contact.email || '-'}</td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                      {contact.birthday ? (
                        <div>
                          {new Date(contact.birthday).toLocaleDateString('ru-RU')}
                        </div>
                      ) : '-'}
                    </td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                      {contact.responsible?.name || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '1rem', color: '#6b7280' }}>
          Всего контактов: {sortedContacts.length} / {contacts.length}
        </div>
      </div>

      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '700px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                добавить контакт — шаг {currentStep} из {TOTAL_STEPS}
              </h2>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                style={{
                  padding: '0.5rem',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.5rem'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {[1, 2, 3, 4, 5].map(step => (
                <div
                  key={step}
                  style={{
                    flex: 1,
                    height: '4px',
                    borderRadius: '2px',
                    background: step <= currentStep ? '#10b981' : '#e5e7eb'
                  }}
                />
              ))}
            </div>

            {currentStep === 1 && (
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem' }}>Имя *</label>
                    <input
                      type="text"
                      value={newContact.first_name}
                      onChange={(e) => setNewContact({ ...newContact, first_name: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem' }}>Отчество</label>
                    <input
                      type="text"
                      value={newContact.middle_name}
                      onChange={(e) => setNewContact({ ...newContact, middle_name: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem' }}>Фамилия</label>
                    <input
                      type="text"
                      value={newContact.last_name}
                      onChange={(e) => setNewContact({ ...newContact, last_name: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem' }}>Дата рождения</label>
                    <input
                      type="date"
                      value={newContact.birthday}
                      onChange={(e) => setNewContact({ ...newContact, birthday: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem' }}>Место рождения</label>
                    <input
                      type="text"
                      value={newContact.place_of_birth}
                      onChange={(e) => setNewContact({ ...newContact, place_of_birth: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem' }}>Теги</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {tags.map(tag => (
                      <label key={tag.id} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={newContact.tags.includes(tag.id)}
                          onChange={(e) => {
                            const newTags = e.target.checked
                              ? [...newContact.tags, tag.id]
                              : newContact.tags.filter(t => t !== tag.id);
                            setNewContact({ ...newContact, tags: newTags });
                          }}
                        />
                        <span style={{ 
                          background: tag.color + '20', 
                          color: tag.color,
                          padding: '0.125rem 0.375rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem'
                        }}>
                          {tag.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {user?.role === 'admin' && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem' }}>Видимость</label>
                    <select
                      value={newContact.visible_only_to_admin ? 'admin' : newContact.visible_only_to_editor ? 'editor' : 'all'}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewContact({
                          ...newContact,
                          visible_only_to_admin: val === 'admin',
                          visible_only_to_editor: val === 'editor'
                        });
                      }}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    >
                      <option value="all">Все (видят все)</option>
                      <option value="editor">Редактор + Админ</option>
                      <option value="admin">Только Админ</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            {currentStep === 2 && (
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem' }}>Телефон</label>
                    <input
                      type="text"
                      value={newContact.phone}
                      onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem' }}>Email</label>
                    <input
                      type="email"
                      value={newContact.email}
                      onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem' }}>Город</label>
                  <select
                    value={newContact.region || ''}
                    onChange={(e) => setNewContact({ ...newContact, region: e.target.value ? Number(e.target.value) : null })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option value="">Не выбран</option>
                    {cities.map(city => (
                      <option key={city.id} value={city.id}>{city.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem' }}>Почтовый адрес (для писем)</label>
                  <textarea
                    value={newContact.postal_address}
                    onChange={(e) => setNewContact({ ...newContact, postal_address: e.target.value })}
                    placeholder="Индекс, город, улица, дом, квартира"
                    rows={2}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem' }}>Соцсети / Мессенджеры</label>
                  <input
                    type="text"
                    value={newContact.social}
                    onChange={(e) => setNewContact({ ...newContact, social: e.target.value })}
                    placeholder="Telegram, VK, WhatsApp и т.д."
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem' }}>Приоритетная связь</label>
                  <select
                    value={newContact.priority_contact}
                    onChange={(e) => setNewContact({ ...newContact, priority_contact: e.target.value as any })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option value="">Не выбрано</option>
                    <option value="call">📞 Звонок</option>
                    <option value="sms">💬 СМС</option>
                    <option value="messenger">✉️ Мессенджер</option>
                    <option value="email">📧 Почта</option>
                  </select>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem' }}>Место работы/служения</label>
                    <input
                      type="text"
                      value={newContact.workplace}
                      onChange={(e) => setNewContact({ ...newContact, workplace: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem' }}>Должность/деятельность</label>
                    <input
                      type="text"
                      value={newContact.position}
                      onChange={(e) => setNewContact({ ...newContact, position: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem' }}>Прошлые места службы</label>
                  <textarea
                    value={newContact.previous_workplaces}
                    onChange={(e) => setNewContact({ ...newContact, previous_workplaces: e.target.value })}
                    placeholder="Укажите прошлые места службы (каждое с новой строки)"
                    rows={3}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem' }}>Категория</label>
                  <select
                    value={newContact.category_id || ''}
                    onChange={(e) => setNewContact({ ...newContact, category_id: e.target.value ? Number(e.target.value) : null })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option value="">Не выбрано</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem' }}>Кто ответственный</label>
                  <select
                    value={newContact.responsible_id || ''}
                    onChange={(e) => setNewContact({ ...newContact, responsible_id: e.target.value ? Number(e.target.value) : null })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option value="">Не выбрано</option>
                    {responsibles.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem' }}>Что дарили</label>
                  <textarea
                    value={newContact.gifts_given}
                    onChange={(e) => setNewContact({ ...newContact, gifts_given: e.target.value })}
                    placeholder="Что дарили этому контакту"
                    rows={2}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem' }}>Куда приглашать</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {events.map(event => (
                      <label key={event.id} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={newContact.invitation_types.includes(event.title)}
                          onChange={(e) => {
                            const selected = e.target.checked
                              ? [...newContact.invitation_types, event.title]
                              : newContact.invitation_types.filter(t => t !== event.title);
                            setNewContact({ ...newContact, invitation_types: selected });
                          }}
                        />
                        <span style={{ fontSize: '0.875rem' }}>{event.title}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem' }}>Обязательные приглашения</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {events.map(event => (
                      <label key={event.id} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={newContact.required_invitations.includes(event.title)}
                          onChange={(e) => {
                            const selected = e.target.checked
                              ? [...newContact.required_invitations, event.title]
                              : newContact.required_invitations.filter(t => t !== event.title);
                            setNewContact({ ...newContact, required_invitations: selected });
                          }}
                        />
                        <span style={{ fontSize: '0.875rem' }}>{event.title}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem' }}>Краткое описание</label>
                  <input
                    type="text"
                    value={newContact.short_description}
                    onChange={(e) => setNewContact({ ...newContact, short_description: e.target.value })}
                    placeholder="Краткое описание контакта"
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem' }}>Подробное описание</label>
                  <textarea
                    value={newContact.full_description}
                    onChange={(e) => setNewContact({ ...newContact, full_description: e.target.value })}
                    placeholder="Подробное описание контакта"
                    rows={6}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'space-between' }}>
              <div>
                {currentStep > 1 && (
                  <button
                    onClick={prevStep}
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#6b7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    ← Назад
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => { setShowModal(false); resetForm(); }}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Отмена
                </button>
                {currentStep < TOTAL_STEPS ? (
                  <button
                    onClick={nextStep}
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Далее →
                  </button>
                ) : (
                  <button
                    onClick={handleCreateContact}
                    disabled={saving || !newContact.first_name}
                    style={{
                      padding: '0.5rem 1rem',
                      background: saving ? '#ccc' : '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: saving ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {saving ? 'Сохранение...' : 'Сохранить'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
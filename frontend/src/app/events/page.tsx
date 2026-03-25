'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useDataStore, useFilterStore } from '@/store';
import { eventsApi, categoriesApi, invitationTypesApi, contactsApi, authApi } from '@/lib/api';

export default function EventsPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { events, categories, invitationTypes, contacts, setEvents, setCategories, setInvitationTypes, setContacts } = useDataStore();
  const { search, categoryId, setSearch } = useFilterStore();
  const [loading, setLoading] = useState(true);
  const [invitationTypeFilter, setInvitationTypeFilter] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_date: '',
    invitation_type_id: null as number | null,
    contacts: [] as number[],
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
      const [eventsRes, categoriesRes, typesRes, contactsRes] = await Promise.all([
        eventsApi.getAll(),
        categoriesApi.getAll(),
        invitationTypesApi.getAll(),
        contactsApi.getAll(),
      ]);
      setEvents(eventsRes.data);
      setCategories(categoriesRes.data);
      setInvitationTypes(typesRes.data);
      setContacts(contactsRes.data);
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

  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.event_date) return;
    setSaving(true);
    try {
      const dataToSend = {
        ...newEvent,
        invitation_type_id: newEvent.invitation_type_id || undefined,
        contacts: newEvent.contacts.length > 0 ? newEvent.contacts : undefined,
      };
      await eventsApi.create(dataToSend);
      setShowModal(false);
      setNewEvent({ title: '', description: '', event_date: '', invitation_type_id: null, contacts: [] });
      loadData();
    } catch (error: any) {
      console.error('Error creating event:', error);
      alert(error.response?.data?.message || 'Ошибка при создании события');
    } finally {
      setSaving(false);
    }
  };

  const filteredEvents = events.filter(event => {
    if (search && !event.title.toLowerCase().includes(search.toLowerCase()) &&
        !event.description?.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (invitationTypeFilter && event.invitation_type_id !== invitationTypeFilter) {
      return false;
    }
    return true;
  });

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
        padding: '1rem 2rem', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>HandySearch - События</h1>
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

      <div style={{ padding: '2rem' }}>
        <div style={{ 
          background: 'white', 
          padding: '1.5rem', 
          borderRadius: '8px',
          marginBottom: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Поиск по названию, описанию..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: '1',
                minWidth: '200px',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
            
            <select
              value={invitationTypeFilter || ''}
              onChange={(e) => setInvitationTypeFilter(e.target.value ? Number(e.target.value) : null)}
              style={{
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            >
              <option value="">Все типы</option>
              {invitationTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>

            <button
              onClick={() => router.push('/contacts')}
              style={{
                padding: '0.5rem 1rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Контакты
            </button>

            <button
              onClick={() => router.push('/responsibles')}
              style={{
                padding: '0.5rem 1rem',
                background: '#ec4899',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Ответственные
            </button>

            {user?.role !== 'viewer' && (
              <button
                onClick={() => setShowModal(true)}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginLeft: 'auto'
                }}
              >
                + Добавить событие
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
          {filteredEvents.length === 0 ? (
            <div style={{ 
              background: 'white', 
              padding: '2rem', 
              borderRadius: '8px',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              События не найдены
            </div>
          ) : (
            filteredEvents.map(event => (
              <div 
                key={event.id}
                style={{ 
                  background: 'white', 
                  padding: '1.5rem', 
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  cursor: 'pointer'
                }}
                onClick={() => router.push(`/events/${event.id}`)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{event.title}</h3>
                  {event.invitation_type && (
                    <span style={{ 
                      background: event.invitation_type.color + '20', 
                      color: event.invitation_type.color,
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem'
                    }}>
                      {event.invitation_type.name}
                    </span>
                  )}
                </div>
                
                <div style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  {new Date(event.event_date).toLocaleDateString('ru-RU', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>

                {event.description && (
                  <p style={{ color: '#6b7280', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                    {event.description.substring(0, 100)}...
                  </p>
                )}

                {event.contacts && event.contacts.length > 0 && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                      Участники ({event.contacts.length}):
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                      {event.contacts.slice(0, 5).map(contact => (
                        <span 
                          key={contact.id} 
                          style={{ 
                            background: '#f3f4f6', 
                            padding: '0.125rem 0.375rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem'
                          }}
                        >
                          {contact.name}
                        </span>
                      ))}
                      {event.contacts.length > 5 && (
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                          +{event.contacts.length - 5} ещё
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div style={{ marginTop: '1rem', color: '#6b7280' }}>
          Всего событий: {filteredEvents.length} / {events.length}
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
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
              Добавить событие
            </h2>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem' }}>Название *</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem' }}>Тип приглашения</label>
                <select
                  value={newEvent.invitation_type_id || ''}
                  onChange={(e) => setNewEvent({ ...newEvent, invitation_type_id: e.target.value ? Number(e.target.value) : null })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                  <option value="">Не выбрано</option>
                  {invitationTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem' }}>Дата и время *</label>
                <input
                  type="datetime-local"
                  value={newEvent.event_date}
                  onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem' }}>Описание</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  rows={3}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem' }}>Участники</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxHeight: '150px', overflow: 'auto' }}>
                  {contacts.map(contact => (
                    <label key={contact.id} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={newEvent.contacts.includes(contact.id)}
                        onChange={(e) => {
                          const newContacts = e.target.checked
                            ? [...newEvent.contacts, contact.id]
                            : newEvent.contacts.filter(c => c !== contact.id);
                          setNewEvent({ ...newEvent, contacts: newContacts });
                        }}
                      />
                      <span style={{ fontSize: '0.875rem' }}>{contact.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowModal(false)}
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
              <button
                onClick={handleCreateEvent}
                disabled={saving || !newEvent.title || !newEvent.event_date}
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

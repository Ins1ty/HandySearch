'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore, useDataStore } from '@/store';
import { eventsApi, categoriesApi, tagsApi, contactsApi, invitationTypesApi, giftsApi, authApi } from '@/lib/api';

interface Event {
  id: number;
  title: string;
  description?: string;
  event_date: string;
  invitation_type_id?: number;
  invitation_type?: { id: number; name: string; color: string };
  is_regular?: boolean;
  contacts?: Contact[];
  gifts?: Gift[];
}

interface Contact {
  id: number;
  name: string;
  description?: string;
  phone?: string;
  email?: string;
  category?: { id: number; name: string; color: string };
  tags?: { id: number; name: string; color: string }[];
  gift_id?: number;
}

interface Gift {
  id: number;
  name: string;
  given_at?: string;
}

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { categories, tags, contacts, invitationTypes, gifts, setCategories, setTags, setContacts, setInvitationTypes, setGifts } = useDataStore();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [invitableContacts, setInvitableContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }
    loadData();
  }, [isAuthenticated, params.id]);

  const loadData = async () => {
    try {
      const [eventRes, categoriesRes, tagsRes, contactsRes, typesRes, giftsRes] = await Promise.all([
        eventsApi.getOne(Number(params.id)),
        categoriesApi.getAll(),
        tagsApi.getAll(),
        contactsApi.getAll(),
        invitationTypesApi.getAll(),
        giftsApi.getAll({ contact_id: String(params.id) }),
      ]);
      setEvent(eventRes.data);
      setFormData({
        ...eventRes.data,
        contacts: eventRes.data.contacts?.map((c: any) => c.id) || [],
      });
      setCategories(categoriesRes.data);
      setTags(tagsRes.data);
      setContacts(contactsRes.data);
      setInvitationTypes(typesRes.data);
      setGifts(giftsRes.data);
    } catch (error) {
      console.error('Error loading event:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInvitableContacts = async () => {
    try {
      const res = await eventsApi.getInvitableContacts(Number(params.id));
      setInvitableContacts(res.data.available_contacts);
    } catch (error) {
      console.error('Error loading invitable contacts:', error);
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
      await eventsApi.update(Number(params.id), formData);
      setEditing(false);
      loadData();
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить это событие?')) return;
    try {
      await eventsApi.delete(Number(params.id));
      router.push('/events');
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleInvite = async () => {
    try {
      await eventsApi.update(Number(params.id), {
        ...formData,
        contacts: selectedContacts,
      });
      setShowInviteModal(false);
      setSelectedContacts([]);
      loadData();
    } catch (error) {
      console.error('Error inviting contacts:', error);
    }
  };

  const openInviteModal = async () => {
    await loadInvitableContacts();
    setSelectedContacts(event?.contacts?.map(c => c.id) || []);
    setShowInviteModal(true);
  };

  if (loading || !event) {
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
            onClick={() => router.push('/events')}
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
            {editing ? 'Редактирование события' : 'Событие'}
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
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Название</label>
            {editing ? (
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            ) : (
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{event.title}</div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Дата и время</label>
                {editing ? (
                  <input
                    type="datetime-local"
                    value={formData.event_date ? formData.event_date.slice(0, 16) : ''}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                ) : (
                  <div>
                    {new Date(event.event_date).toLocaleDateString('ru-RU', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Тип приглашения</label>
                {editing ? (
                  <select
                    value={formData.invitation_type_id || ''}
                    onChange={(e) => setFormData({ ...formData, invitation_type_id: e.target.value ? Number(e.target.value) : null })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option value="">Не выбрано</option>
                    {invitationTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                ) : (
                  event.invitation_type ? (
                    <span style={{ 
                      background: event.invitation_type.color + '20', 
                      color: event.invitation_type.color,
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px'
                    }}>
                      {event.invitation_type.name}
                    </span>
                  ) : '-'
                )}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  {editing ? (
                    <input
                      type="checkbox"
                      checked={formData.is_regular || false}
                      onChange={(e) => setFormData({ ...formData, is_regular: e.target.checked })}
                    />
                  ) : (
                    event.is_regular ? '✅' : '⬜'
                  )}
                  <span style={{ fontWeight: 'bold' }}>Регулярное событие</span>
                </label>
              </div>
            </div>

            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Описание</label>
                {editing ? (
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                ) : (
                  <div>{event.description || '-'}</div>
                )}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            {editing ? (
              <>
                <button
                  onClick={() => setEditing(false)}
                  style={{
                    padding: '0.75rem 1.5rem',
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
                  onClick={handleSave}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Сохранить
                </button>
              </>
            ) : (
              canEdit && (
                <>
                  <button
                    onClick={() => setEditing(true)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Редактировать
                  </button>
                  {user?.role === 'admin' && (
                    <button
                      onClick={handleDelete}
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Удалить
                    </button>
                  )}
                </>
              )
            )}
          </div>
        </div>

        <div style={{ 
          background: 'white', 
          padding: '2rem', 
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
              Участники ({event.contacts?.length || 0})
            </h2>
            {canEdit && (
              <button
                onClick={openInviteModal}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                + Пригласить участников
              </button>
            )}
          </div>
          
          {event.contacts && event.contacts.length > 0 ? (
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {event.contacts.map(contact => (
                <div 
                  key={contact.id}
                  style={{ 
                    padding: '1rem', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                  onClick={() => router.push(`/contacts/${contact.id}`)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <strong>{contact.name}</strong>
                      {contact.category && (
                        <div style={{ marginTop: '0.25rem' }}>
                          <span style={{ 
                            background: contact.category.color + '20', 
                            color: contact.category.color,
                            padding: '0.125rem 0.375rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem'
                          }}>
                            {contact.category.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {contact.tags && contact.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                      {contact.tags.map(tag => (
                        <span key={tag.id} style={{ 
                          background: tag.color + '20', 
                          color: tag.color,
                          padding: '0.125rem 0.375rem',
                          borderRadius: '4px',
                          fontSize: '0.625rem'
                        }}>
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                    {contact.email || contact.phone || '-'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
              Нет участников
            </div>
          )}
        </div>
      </div>

      {showInviteModal && (
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
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Пригласить участников
            </h2>
            <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
              Выберите контактов, которые могут быть приглашены на это событие
              {event.invitation_type && (
                <span> (тип: <strong>{event.invitation_type.name}</strong>)</span>
              )}
            </p>
            
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Поиск по имени..."
                onChange={(e) => {
                  const search = e.target.value.toLowerCase();
                  const filtered = contacts.filter((c: any) => 
                    c.name.toLowerCase().includes(search)
                  );
                }}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>

            <div style={{ maxHeight: '400px', overflow: 'auto', marginBottom: '1rem' }}>
              {invitableContacts.length === 0 ? (
                <div style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
                  Нет доступных контактов для приглашения
                </div>
              ) : (
                invitableContacts.map(contact => (
                  <label 
                    key={contact.id}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem', 
                      padding: '0.5rem',
                      cursor: 'pointer',
                      borderBottom: '1px solid #f3f4f6'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedContacts.includes(contact.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedContacts([...selectedContacts, contact.id]);
                        } else {
                          setSelectedContacts(selectedContacts.filter(id => id !== contact.id));
                        }
                      }}
                    />
                    <div>
                      <div>{contact.name}</div>
                      {contact.category && (
                        <span style={{ 
                          fontSize: '0.75rem',
                          background: contact.category.color + '20', 
                          color: contact.category.color,
                          padding: '0.125rem 0.375rem',
                          borderRadius: '4px'
                        }}>
                          {contact.category.name}
                        </span>
                      )}
                    </div>
                  </label>
                ))
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowInviteModal(false)}
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
                onClick={handleInvite}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Пригласить ({selectedContacts.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

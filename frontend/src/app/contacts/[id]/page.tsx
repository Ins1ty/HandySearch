'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore, useDataStore } from '@/store';
import { contactsApi, categoriesApi, tagsApi, eventsApi, invitationTypesApi, authApi, citiesApi } from '@/lib/api';

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
  name: string;
  description?: string;
  priority_contact?: 'call' | 'sms' | 'messenger' | 'email';
  phone?: string;
  email?: string;
  social?: string;
  birthday?: string;
  days_until_birthday?: number;
  responsible_id?: number;
  category_id?: number;
  category?: { id: number; name: string; color: string };
  responsible?: { id: number; name: string };
  tags?: { id: number; name: string; color: string }[];
  invitation_types?: string;
  required_invitations?: string;
  postal_address?: string;
  region?: number | string;
}

export default function ContactDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { categories, tags, events, invitationTypes, cities, setCategories, setTags, setEvents, setInvitationTypes, setCities } = useDataStore();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [allEvents, setAllEvents] = useState<any[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }
    loadData();
  }, [isAuthenticated, params.id]);

  const loadData = async () => {
    try {
      const [contactRes, categoriesRes, tagsRes, eventsRes, allEventsRes, typesRes, citiesRes] = await Promise.all([
        contactsApi.getOne(Number(params.id)),
        categoriesApi.getAll(),
        tagsApi.getAll(),
        eventsApi.getAll({ contact_id: String(params.id) }),
        eventsApi.getAll(),
        invitationTypesApi.getAll(),
        citiesApi.getAll(),
      ]);
      setContact(contactRes.data);
      setFormData({
        ...contactRes.data,
        tags: contactRes.data.tags?.map((t: any) => t.id) || [],
        invitation_types: contactRes.data.invitation_types ? contactRes.data.invitation_types.split(',') : [],
        required_invitations: contactRes.data.required_invitations ? contactRes.data.required_invitations.split(',') : [],
      });
      setCategories(categoriesRes.data);
      setTags(tagsRes.data);
      setEvents(eventsRes.data);
      setAllEvents(allEventsRes.data);
      setInvitationTypes(typesRes.data);
      setCities(citiesRes.data);
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
      await contactsApi.update(Number(params.id), formData);
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
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                ) : (
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{contact.name}</div>
                )}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Категория</label>
                {editing ? (
                  <select
                    value={formData.category_id || ''}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value ? Number(e.target.value) : null })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option value="">Не выбрано</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                ) : (
                  contact.category ? (
                    <span style={{ 
                      background: contact.category.color + '20', 
                      color: contact.category.color,
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px'
                    }}>
                      {contact.category.name}
                    </span>
                  ) : '-'
                )}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Теги</label>
                {editing ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {tags.map(tag => (
                      <label key={tag.id} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <input
                          type="checkbox"
                          checked={formData.tags?.includes(tag.id)}
                          onChange={(e) => {
                            const newTags = e.target.checked
                              ? [...(formData.tags || []), tag.id]
                              : formData.tags.filter((t: number) => t !== tag.id);
                            setFormData({ ...formData, tags: newTags });
                          }}
                        />
                        <span style={{ 
                          background: tag.color + '20', 
                          color: tag.color,
                          padding: '0.125rem 0.375rem',
                          borderRadius: '4px',
                          fontSize: '0.875rem'
                        }}>
                          {tag.name}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                    {contact.tags?.map(tag => (
                      <span key={tag.id} style={{ 
                        background: tag.color + '20', 
                        color: tag.color,
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.875rem'
                      }}>
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

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
                  <div>{contact.description || '-'}</div>
                )}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Город</label>
                {editing ? (
                  <select
                    value={formData.region || ''}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value ? Number(e.target.value) : null })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option value="">Не выбран</option>
                    {cities.map(city => (
                      <option key={city.id} value={city.id}>{city.name}</option>
                    ))}
                  </select>
                ) : (
                  <div>{contact.region ? cities.find(c => c.id === Number(contact.region))?.name || '-' : '-'}</div>
                )}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Почтовый адрес (для писем)</label>
                {editing ? (
                  <textarea
                    value={formData.postal_address || ''}
                    onChange={(e) => setFormData({ ...formData, postal_address: e.target.value })}
                    placeholder="Индекс, город, улица, дом, квартира"
                    rows={2}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                ) : (
                  <div style={{ whiteSpace: 'pre-wrap' }}>{contact.postal_address || '-'}</div>
                )}
              </div>
            </div>

            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Телефон</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                ) : (
                  <div>{contact.phone || '-'}</div>
                )}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Email</label>
                {editing ? (
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                ) : (
                  <div>{contact.email || '-'}</div>
                )}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Приоритетная связь</label>
                {editing ? (
                  <select
                    value={formData.priority_contact || ''}
                    onChange={(e) => setFormData({ ...formData, priority_contact: e.target.value || null })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option value="">Не выбрано</option>
                    <option value="call">📞 Звонок</option>
                    <option value="sms">💬 СМС</option>
                    <option value="messenger">✉️ Мессенджер</option>
                    <option value="email">📧 Почта</option>
                  </select>
                ) : (
                  <div>
                    {contact.priority_contact ? (
                      <span>
                        {priorityIcons[contact.priority_contact]} {priorityLabels[contact.priority_contact]}
                      </span>
                    ) : '-'}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Соцсети / Мессенджеры</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.social || ''}
                    onChange={(e) => setFormData({ ...formData, social: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                ) : (
                  <div>{contact.social || '-'}</div>
                )}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Дата рождения</label>
                {editing ? (
                  <input
                    type="date"
                    value={formData.birthday || ''}
                    onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                ) : (
                  <div>
                    {contact.birthday ? (
                      <>
                        <div>{new Date(contact.birthday).toLocaleDateString('ru-RU')}</div>
                        {contact.days_until_birthday !== null && contact.days_until_birthday !== undefined && (
                          <div style={{ 
                            fontSize: '0.875rem', 
                            color: contact.days_until_birthday <= 7 ? '#ef4444' : '#6b7280',
                            marginTop: '0.25rem'
                          }}>
                            {contact.days_until_birthday === 0 
                              ? 'Сегодня день рождения!' 
                              : `День рождения через ${contact.days_until_birthday} дней`
                            }
                          </div>
                        )}
                      </>
                    ) : '-'}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Ответственный</label>
                <div>{contact.responsible?.name || '-'}</div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Куда приглашать</label>
                {editing ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {allEvents.map(event => (
                      <label key={event.id} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={(formData.invitation_types as string[] || []).includes(event.title)}
                          onChange={(e) => {
                            const current = formData.invitation_types as string[] || [];
                            const selected = e.target.checked
                              ? [...current, event.title]
                              : current.filter(t => t !== event.title);
                            setFormData({ ...formData, invitation_types: selected });
                          }}
                        />
                        <span style={{ fontSize: '0.875rem' }}>{event.title}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div>{contact.invitation_types || '-'}</div>
                )}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Обязательные приглашения</label>
                {editing ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {allEvents.map(event => (
                      <label key={event.id} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={(formData.required_invitations as string[] || []).includes(event.title)}
                          onChange={(e) => {
                            const current = formData.required_invitations as string[] || [];
                            const selected = e.target.checked
                              ? [...current, event.title]
                              : current.filter(t => t !== event.title);
                            setFormData({ ...formData, required_invitations: selected });
                          }}
                        />
                        <span style={{ fontSize: '0.875rem' }}>{event.title}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div>{contact.required_invitations || '-'}</div>
                )}
              </div>

              {editing && user?.role === 'admin' && (
                <div style={{ borderTop: '1px solid #ddd', paddingTop: '1rem', marginTop: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={formData.visible_only_to_admin || false}
                      onChange={(e) => setFormData({ ...formData, visible_only_to_admin: e.target.checked })}
                    />
                    <span>Виден только админу</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={formData.visible_only_to_editor || false}
                      onChange={(e) => setFormData({ ...formData, visible_only_to_editor: e.target.checked })}
                    />
                    <span>Виден только редактору (только для своих)</span>
                  </label>
                </div>
              )}

              {editing && user?.role === 'editor' && (
                <div style={{ borderTop: '1px solid #ddd', paddingTop: '1rem', marginTop: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={formData.visible_only_to_editor || false}
                      onChange={(e) => setFormData({ ...formData, visible_only_to_editor: e.target.checked })}
                    />
                    <span>Виден только мне (редактору)</span>
                  </label>
                </div>
              )}
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

        {events.length > 0 && (
          <div style={{ 
            background: 'white', 
            padding: '2rem', 
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            marginTop: '2rem'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              История событий
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {events.map(event => (
                <div 
                  key={event.id}
                  style={{ 
                    padding: '1rem', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                  onClick={() => router.push(`/events/${event.id}`)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{event.title}</strong>
                      {event.invitation_type && (
                        <span style={{ 
                          marginLeft: '0.5rem',
                          background: event.invitation_type.color + '20', 
                          color: event.invitation_type.color,
                          padding: '0.125rem 0.375rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem'
                        }}>
                          {event.invitation_type.name}
                        </span>
                      )}
                    </div>
                    <div style={{ color: '#6b7280' }}>
                      {new Date(event.event_date).toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                  {event.description && (
                    <div style={{ marginTop: '0.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
                      {event.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

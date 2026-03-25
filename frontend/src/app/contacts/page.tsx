'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useDataStore, useFilterStore } from '@/store';
import { contactsApi, categoriesApi, tagsApi, responsiblesApi, authApi } from '@/lib/api';

export default function ContactsPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { contacts, categories, tags, responsibles, setContacts, setCategories, setTags, setResponsibles } = useDataStore();
  const { search, categoryId, tagId, setSearch, setCategoryId, setTagId, resetFilters } = useFilterStore();
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    social: '',
    birthday: '',
    category_id: null as number | null,
    responsible_id: null as number | null,
    tags: [] as number[],
    invitation_types: '',
    required_invitations: '',
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
      const [contactsRes, categoriesRes, tagsRes, responsiblesRes] = await Promise.all([
        contactsApi.getAll(),
        categoriesApi.getAll(),
        tagsApi.getAll(),
        responsiblesApi.getAll(),
      ]);
      setContacts(contactsRes.data);
      setCategories(categoriesRes.data);
      setTags(tagsRes.data);
      setResponsibles(responsiblesRes.data);
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

  const handleCreateContact = async () => {
    if (!newContact.name) return;
    setSaving(true);
    try {
      const dataToSend = {
        ...newContact,
        category_id: newContact.category_id || undefined,
        responsible_id: newContact.responsible_id || undefined,
        tags: newContact.tags.length > 0 ? newContact.tags : undefined,
        invitation_types: newContact.invitation_types || undefined,
        required_invitations: newContact.required_invitations || undefined,
      };
      await contactsApi.create(dataToSend);
      setShowModal(false);
      setNewContact({ name: '', description: '', phone: '', email: '', social: '', birthday: '', category_id: null, responsible_id: null, tags: [], invitation_types: '', required_invitations: '' });
      loadData();
    } catch (error: any) {
      console.error('Error creating contact:', error);
      alert(error.response?.data?.message || 'Ошибка при создании контакта');
    } finally {
      setSaving(false);
    }
  };

  const filteredContacts = contacts.filter(contact => {
    if (search && !contact.name.toLowerCase().includes(search.toLowerCase()) &&
        !contact.description?.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (categoryId && contact.category_id !== categoryId) {
      return false;
    }
    if (tagId && !contact.tags?.some(t => t.id === tagId)) {
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
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>HandySearch</h1>
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
              placeholder="Поиск по имени, описанию, телефону, email..."
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
              value={categoryId || ''}
              onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
              style={{
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            >
              <option value="">Все категории</option>
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
                fontSize: '1rem'
              }}
            >
              <option value="">Все теги</option>
              {tags.map(tag => (
                <option key={tag.id} value={tag.id}>{tag.name}</option>
              ))}
            </select>

            <button
              onClick={resetFilters}
              style={{
                padding: '0.5rem 1rem',
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Сбросить
            </button>

            <button
              onClick={() => router.push('/events')}
              style={{
                padding: '0.5rem 1rem',
                background: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              События
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
                + Добавить контакт
              </button>
            )}
          </div>
        </div>

        <div style={{ 
          background: 'white', 
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Имя</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Категория</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Теги</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Телефон</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Email</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>ДР</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Ответственный</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                    Контакты не найдены
                  </td>
                </tr>
              ) : (
                filteredContacts.map(contact => (
                  <tr 
                    key={contact.id} 
                    style={{ cursor: 'pointer' }}
                    onClick={() => router.push(`/contacts/${contact.id}`)}
                  >
                    <td style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                      <strong>{contact.name}</strong>
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
                    <td style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>{contact.phone || '-'}</td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>{contact.email || '-'}</td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                      {contact.birthday ? (
                        <div>
                          <div>{new Date(contact.birthday).toLocaleDateString('ru-RU')}</div>
                          {contact.days_until_birthday !== null && contact.days_until_birthday !== undefined && (
                            <div style={{ 
                              fontSize: '0.75rem', 
                              color: contact.days_until_birthday <= 7 ? '#ef4444' : '#6b7280'
                            }}>
                              {contact.days_until_birthday === 0 
                                ? 'Сегодня!' 
                                : `Через ${contact.days_until_birthday} дн.`
                              }
                            </div>
                          )}
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
          Всего контактов: {filteredContacts.length} / {contacts.length}
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
              Добавить контакт
            </h2>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem' }}>Имя *</label>
                <input
                  type="text"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
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

              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem' }}>Ответственный</label>
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

              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem' }}>Описание</label>
                <textarea
                  value={newContact.description}
                  onChange={(e) => setNewContact({ ...newContact, description: e.target.value })}
                  rows={3}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>

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
                <label style={{ display: 'block', marginBottom: '0.25rem' }}>Соцсети</label>
                <input
                  type="text"
                  value={newContact.social}
                  onChange={(e) => setNewContact({ ...newContact, social: e.target.value })}
                  placeholder="Telegram, VK, etc."
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>

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
                <label style={{ display: 'block', marginBottom: '0.25rem' }}>Куда приглашать</label>
                <textarea
                  value={newContact.invitation_types}
                  onChange={(e) => setNewContact({ ...newContact, invitation_types: e.target.value })}
                  placeholder="К какой группе относится, куда звать"
                  rows={2}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem' }}>Обязательные приглашения</label>
                <textarea
                  value={newContact.required_invitations}
                  onChange={(e) => setNewContact({ ...newContact, required_invitations: e.target.value })}
                  placeholder="На какие события обязательно приглашать"
                  rows={2}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
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
                onClick={handleCreateContact}
                disabled={saving || !newContact.name}
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

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useDataStore } from '@/store';
import { tagsApi, categoriesApi, invitationTypesApi, citiesApi, authApi } from '@/lib/api';

interface TabItem {
  id: string;
  label: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { tags, categories, invitationTypes, cities, setTags, setCategories, setInvitationTypes, setCities } = useDataStore();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tags');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', color: '#3b82f6' });
  const [saving, setSaving] = useState(false);

  const tabs: TabItem[] = [
    { id: 'tags', label: 'Теги' },
    { id: 'categories', label: 'Категории' },
    { id: 'invitationTypes', label: 'Типы событий' },
    { id: 'cities', label: 'Города' },
  ];

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/');
      return;
    }
    loadData();
  }, [isAuthenticated, user]);

  const loadData = async () => {
    try {
      const [tagsRes, categoriesRes, typesRes, citiesRes] = await Promise.all([
        tagsApi.getAll(),
        categoriesApi.getAll(),
        invitationTypesApi.getAll(),
        citiesApi.getAll(),
      ]);
      setTags(tagsRes.data);
      setCategories(categoriesRes.data);
      setInvitationTypes(typesRes.data);
      setCities(citiesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
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

  const getApi = () => {
    switch (activeTab) {
      case 'tags': return tagsApi;
      case 'categories': return categoriesApi;
      case 'invitationTypes': return invitationTypesApi;
      case 'cities': return citiesApi;
      default: return tagsApi;
    }
  };

  const getItems = () => {
    switch (activeTab) {
      case 'tags': return tags;
      case 'categories': return categories;
      case 'invitationTypes': return invitationTypes;
      case 'cities': return cities;
      default: return [];
    }
  };

  const handleSubmit = async () => {
    if (!formData.name) return;
    setSaving(true);
    try {
      if (editingItem) {
        await getApi().update(editingItem.id, formData);
      } else {
        await getApi().create(formData);
      }
      setShowModal(false);
      setEditingItem(null);
      setFormData({ name: '', color: '#3b82f6' });
      loadData();
    } catch (error: any) {
      console.error('Error saving:', error);
      alert(error.response?.data?.message || 'Ошибка при сохранении');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот элемент?')) return;
    try {
      await getApi().delete(id);
      loadData();
    } catch (error: any) {
      console.error('Error deleting:', error);
      alert(error.response?.data?.message || 'Ошибка при удалении');
    }
  };

  const openAdd = () => {
    setEditingItem(null);
    setFormData({ name: '', color: activeTab === 'cities' ? '#000000' : '#3b82f6' });
    setShowModal(true);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setFormData({ name: item.name, color: item.color || '#3b82f6' });
    setShowModal(true);
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
          <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Настройки</h1>
          <button
            onClick={() => router.push('/contacts')}
            style={{
              padding: '0.5rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            Конт.
          </button>
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
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.875rem' }}>{user?.name}</span>
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
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.5rem 1rem',
                background: activeTab === tab.id ? '#3b82f6' : '#e5e7eb',
                color: activeTab === tab.id ? 'white' : '#374151',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={openAdd}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            marginBottom: '1rem'
          }}
        >
          + Добавить {tabs.find(t => t.id === activeTab)?.label.slice(0, -1)}
        </button>

        <div style={{ 
          background: 'white', 
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'auto'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
            <thead style={{ background: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Название</th>
                {activeTab !== 'cities' && (
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Цвет</th>
                )}
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {getItems().length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                    Нет данных
                  </td>
                </tr>
              ) : (
                getItems().map(item => (
                  <tr key={item.id}>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                      <strong>{item.name}</strong>
                    </td>
                    {activeTab !== 'cities' && (
                      <td style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                        <span style={{ 
                          display: 'inline-block',
                          width: '20px', 
                          height: '20px', 
                          backgroundColor: (item as any).color || '#3b82f6', 
                          borderRadius: '4px' 
                        }} />
                      </td>
                    )}
                    <td style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => openEdit(item)}
                          style={{
                            padding: '0.25rem 0.5rem',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                          }}
                        >
                          Изменить
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          style={{
                            padding: '0.25rem 0.5rem',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                          }}
                        >
                          Удалить
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
            padding: '1.5rem',
            borderRadius: '8px',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              {editingItem ? 'Изменить' : 'Добавить'} {tabs.find(t => t.id === activeTab)?.label.slice(0, -1)}
            </h2>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem' }}>Название *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>

              {activeTab !== 'cities' && (
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem' }}>Цвет</label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    style={{ width: '50px', height: '30px', cursor: 'pointer' }}
                  />
                </div>
              )}
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
                onClick={handleSubmit}
                disabled={saving || !formData.name}
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
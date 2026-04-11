import * as XLSX from 'xlsx';

interface Contact {
  id: number;
  first_name: string;
  middle_name?: string;
  last_name?: string;
  description?: string;
  priority_contact?: 'call' | 'sms' | 'messenger' | 'email';
  phone?: string;
  email?: string;
  social?: string;
  birthday?: string;
  responsible_id?: number;
  category_id?: number;
  category?: { id: number; name: string; color: string };
  responsible?: { id: number; name: string; phone?: string; email?: string };
  tags?: { id: number; name: string; color: string }[];
  invitation_types?: string[];
  required_invitations?: string[];
  gifts_given?: string;
  postal_address?: string;
  region?: string;
  visible_only_to_admin?: boolean;
  visible_only_to_editor?: boolean;
  created_at?: string;
  updated_at?: string;
}

const priorityLabels: Record<string, string> = {
  call: 'Звонок',
  sms: 'СМС',
  messenger: 'Мессенджер',
  email: 'Почта',
};

export function exportContactsToExcel(contacts: Contact[], cities: { id: number; name: string }[]) {
  const data = contacts.map(contact => ({
    'Имя': contact.first_name || '',
    'Отчество': contact.middle_name || '',
    'Фамилия': contact.last_name || '',
    'Категория': contact.category?.name || '',
    'Теги': contact.tags?.map(t => t.name).join(', ') || '',
    'Связь': contact.priority_contact ? priorityLabels[contact.priority_contact] || '' : '',
    'Регион': contact.region ? cities.find(c => c.id === Number(contact.region))?.name || '' : '',
    'Телефон': contact.phone || '',
    'Email': contact.email || '',
    'Дата рождения': contact.birthday ? new Date(contact.birthday).toLocaleDateString('ru-RU') : '',
    'Ответственный': contact.responsible?.name || '',
    'Описание': contact.description || '',
    'Соцсети': contact.social || '',
    'Приглашать на события': contact.invitation_types?.join(', ') || '',
    'Обязательные приглашения': contact.required_invitations?.join(', ') || '',
    'Что дарили': contact.gifts_given || '',
    'Почтовый адрес': contact.postal_address || '',
    'Дата создания': contact.created_at ? new Date(contact.created_at).toLocaleDateString('ru-RU') : '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet.dir = 'rtl';
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Контакты');

  const colWidths = [
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 20 },
    { wch: 12 },
    { wch: 15 },
    { wch: 20 },
    { wch: 25 },
    { wch: 15 },
    { wch: 20 },
    { wch: 30 },
    { wch: 20 },
    { wch: 25 },
    { wch: 25 },
    { wch: 20 },
    { wch: 30 },
    { wch: 12 },
  ];
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, `contacts_${new Date().toISOString().split('T')[0]}.xlsx`);
}
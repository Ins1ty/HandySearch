import * as XLSX from 'xlsx';

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

export function exportContactsToExcel(contacts: any[], cities: { id: number; name: string }[]) {
  const safeJoin = (arr: any[] | string | undefined | null, separator = ', '): string => {
    if (!arr) return '';
    if (typeof arr === 'string') return arr;
    if (Array.isArray(arr)) return arr.join(separator);
    return String(arr);
  };

  const data = contacts.map((contact: any) => ({
    'Имя': contact.first_name || '',
    'Отчество': contact.middle_name || '',
    'Фамилия': contact.last_name || '',
    'Дата рождения': contact.birthday ? new Date(contact.birthday).toLocaleDateString('ru-RU') : '',
    'Место рождения': contact.place_of_birth || '',
    'Категория': contact.category?.name || '',
    'Теги': safeJoin(contact.tags?.map ? contact.tags.map((t: any) => t.name) : contact.tags),
    'Приоритетная связь': contact.priority_contact ? priorityLabels[contact.priority_contact] || '' : '',
    'Место работы/служения': contact.workplace || '',
    'Должность/деятельность': contact.position || '',
    'Прошлые места службы': contact.previous_workplaces || '',
    'Краткое описание': contact.short_description || '',
    'Подробное описание': contact.full_description || '',
    'Что дарили': contact.gifts_given || '',
    'Куда приглашать': safeJoin(contact.invitation_types),
    'Кто ответственный': contact.responsible?.name || '',
    'Обязательные приглашения': safeJoin(contact.required_invitations),
    'Регион': contact.region ? String(cities.find(c => c.id === Number(contact.region))?.name || '') : '',
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
    { wch: 12 },
    { wch: 20 },
    { wch: 15 },
    { wch: 20 },
    { wch: 20 },
    { wch: 25 },
    { wch: 30 },
    { wch: 20 },
    { wch: 12 },
    { wch: 25 },
    { wch: 25 },
    { wch: 25 },
    { wch: 30 },
    { wch: 40 },
    { wch: 25 },
    { wch: 25 },
    { wch: 20 },
    { wch: 25 },
    { wch: 15 },
    { wch: 12 },
  ];
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, `contacts_${new Date().toISOString().split('T')[0]}.xlsx`);
}
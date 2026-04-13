import * as XLSX from 'xlsx';

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

  const getName = (contact: any): string => {
    const parts = [contact.first_name || ''];
    if (contact.middle_name) parts.push(contact.middle_name);
    if (contact.last_name) parts.push(contact.last_name);
    const fullName = parts.join(' ');
    return contact.is_priest ? `Отец ${fullName}` : fullName;
  };

  const getPhones = (contact: any): string => {
    const phones = [];
    if (contact.phone) phones.push(contact.phone);
    if (contact.phone_2) phones.push(contact.phone_2);
    if (contact.phone_3) phones.push(contact.phone_3);
    return phones.join('; ');
  };

  const data = contacts.map((contact: any) => ({
    'Имя': getName(contact),
    'Отчество': contact.middle_name || '',
    'Фамилия': contact.last_name || '',
    'Дата рождения': contact.birthday ? new Date(contact.birthday).toLocaleDateString('ru-RU') : '',
    'Место рождения': contact.place_of_birth || '',
    'Теги': safeJoin(contact.tags?.map ? contact.tags.map((t: any) => t.name) : contact.tags),
    'Телефоны': getPhones(contact),
    'Email': contact.email || '',
    'Город': contact.region ? String(cities.find(c => c.id === Number(contact.region))?.name || '') : '',
    'Почтовый адрес': contact.postal_address || '',
    'Соцсети / Мессенджеры': contact.social || '',
    'Приоритетная связь': contact.priority_contact ? priorityLabels[contact.priority_contact] || '' : '',
    'Место работы/служения': contact.workplace || '',
    'Должность/деятельность': contact.position || '',
    'Прошлые места службы': contact.previous_workplaces || '',
    'Категория': contact.category?.name || '',
    'Кто ответственный': contact.responsibles?.map((r: any) => r.name).join(', ') || '',
    'Что дарили': contact.gifts_given || '',
    'Куда приглашать': safeJoin(contact.invitation_type_ids),
    'Краткое описание': contact.short_description || '',
    'Подробное описание': contact.full_description || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet.dir = 'rtl';
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Контакты');

  const colWidths = [
    { wch: 25 },
    { wch: 15 },
    { wch: 15 },
    { wch: 12 },
    { wch: 20 },
    { wch: 20 },
    { wch: 30 },
    { wch: 25 },
    { wch: 15 },
    { wch: 30 },
    { wch: 25 },
    { wch: 15 },
    { wch: 25 },
    { wch: 20 },
    { wch: 30 },
    { wch: 15 },
    { wch: 25 },
    { wch: 25 },
    { wch: 25 },
    { wch: 30 },
    { wch: 40 },
  ];
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, `contacts_${new Date().toISOString().split('T')[0]}.xlsx`);
}
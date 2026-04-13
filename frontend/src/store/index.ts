import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
        }
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

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
  phone_2?: string;
  phone_3?: string;
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
  responsibles?: { id: number; name: string; phone?: string; email?: string }[];
  tags?: { id: number; name: string; color: string }[];
  invitation_type_ids?: number[];
  gifts_given?: string;
  postal_address?: string;
  region?: string;
  visible_only_to_admin?: boolean;
  visible_only_to_editor?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface Category {
  id: number;
  name: string;
  color: string;
}

interface Tag {
  id: number;
  name: string;
  color: string;
}

interface Event {
  id: number;
  title: string;
  description?: string;
  event_date: string;
  invitation_type_id?: number;
  invitation_type?: { id: number; name: string; color: string };
  contacts?: Contact[];
  gifts?: Gift[];
}

interface Gift {
  id: number;
  name: string;
  given_at?: string;
}

interface InvitationType {
  id: number;
  name: string;
  color: string;
}

interface City {
  id: number;
  name: string;
}

interface Responsible {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
}

interface DataState {
  contacts: Contact[];
  categories: Category[];
  tags: Tag[];
  events: Event[];
  gifts: Gift[];
  invitationTypes: InvitationType[];
  cities: City[];
  responsibles: Responsible[];
  setContacts: (contacts: Contact[]) => void;
  setCategories: (categories: Category[]) => void;
  setTags: (tags: Tag[]) => void;
  setEvents: (events: Event[]) => void;
  setGifts: (gifts: Gift[]) => void;
  setInvitationTypes: (types: InvitationType[]) => void;
  setCities: (cities: City[]) => void;
  setResponsibles: (responsibles: Responsible[]) => void;
}

export const useDataStore = create<DataState>((set) => ({
  contacts: [],
  categories: [],
  tags: [],
  events: [],
  gifts: [],
  invitationTypes: [],
  cities: [],
  responsibles: [],
  setContacts: (contacts) => set({ contacts }),
  setCategories: (categories) => set({ categories }),
  setTags: (tags) => set({ tags }),
  setEvents: (events) => set({ events }),
  setGifts: (gifts) => set({ gifts }),
  setInvitationTypes: (invitationTypes) => set({ invitationTypes }),
  setCities: (cities) => set({ cities }),
  setResponsibles: (responsibles) => set({ responsibles }),
}));

interface FilterState {
  search: string;
  categoryId: number | null;
  tagId: number | null;
  responsibleId: number | null;
  region: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  setSearch: (search: string) => void;
  setCategoryId: (id: number | null) => void;
  setTagId: (id: number | null) => void;
  setResponsibleId: (id: number | null) => void;
  setRegion: (region: string) => void;
  setSortBy: (sortBy: string) => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  search: '',
  categoryId: null,
  tagId: null,
  responsibleId: null,
  region: '',
  sortBy: 'name',
  sortOrder: 'asc',
  setSearch: (search) => set({ search }),
  setCategoryId: (categoryId) => set({ categoryId }),
  setTagId: (tagId) => set({ tagId }),
  setResponsibleId: (responsibleId) => set({ responsibleId }),
  setRegion: (region) => set({ region }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSortOrder: (sortOrder) => set({ sortOrder }),
  resetFilters: () => set({ 
    search: '', 
    categoryId: null, 
    tagId: null, 
    responsibleId: null,
    region: '',
    sortBy: 'name',
    sortOrder: 'asc',
  }),
}));

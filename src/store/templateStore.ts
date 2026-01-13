/**
 * Template Store
 * Manages workout templates and user customizations
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DEFAULT_TEMPLATES, WorkoutTemplate } from '../data/templates';

interface TemplateState {
  templates: WorkoutTemplate[];
  userTemplates: WorkoutTemplate[];
  favoriteTemplateIds: string[];
  
  getTemplateById: (id: string) => WorkoutTemplate | undefined;
  getAllTemplates: () => WorkoutTemplate[];
  addUserTemplate: (template: Omit<WorkoutTemplate, 'id' | 'isDefault'>) => void;
  updateTemplate: (id: string, updates: Partial<WorkoutTemplate>) => void;
  deleteUserTemplate: (id: string) => void;
  duplicateTemplate: (id: string) => void;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

export const useTemplateStore = create<TemplateState>()(
  persist(
    (set, get) => ({
      templates: DEFAULT_TEMPLATES,
      userTemplates: [],
      favoriteTemplateIds: [],

      getTemplateById: (id: string) => {
        const all = get().getAllTemplates();
        return all.find(t => t.id === id);
      },

      getAllTemplates: () => {
        return [...get().templates, ...get().userTemplates];
      },

      addUserTemplate: (template) => {
        const newTemplate: WorkoutTemplate = {
          ...template,
          id: `user_template_${Date.now()}`,
          isDefault: false,
        };
        set((state) => ({
          userTemplates: [...state.userTemplates, newTemplate],
        }));
      },

      updateTemplate: (id, updates) => {
        set((state) => ({
          userTemplates: state.userTemplates.map(t =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }));
      },

      deleteUserTemplate: (id) => {
        set((state) => ({
          userTemplates: state.userTemplates.filter(t => t.id !== id),
          favoriteTemplateIds: state.favoriteTemplateIds.filter(fid => fid !== id),
        }));
      },

      duplicateTemplate: (id) => {
        const template = get().getTemplateById(id);
        if (template) {
          const newTemplate: WorkoutTemplate = {
            ...template,
            id: `user_template_${Date.now()}`,
            name: `${template.name} (Copy)`,
            isDefault: false,
          };
          set((state) => ({
            userTemplates: [...state.userTemplates, newTemplate],
          }));
        }
      },

      toggleFavorite: (id) => {
        set((state) => ({
          favoriteTemplateIds: state.favoriteTemplateIds.includes(id)
            ? state.favoriteTemplateIds.filter(fid => fid !== id)
            : [...state.favoriteTemplateIds, id],
        }));
      },

      isFavorite: (id) => {
        return get().favoriteTemplateIds.includes(id);
      },
    }),
    {
      name: 'workout-templates',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        userTemplates: state.userTemplates,
        favoriteTemplateIds: state.favoriteTemplateIds,
      }),
    }
  )
);

export default useTemplateStore;


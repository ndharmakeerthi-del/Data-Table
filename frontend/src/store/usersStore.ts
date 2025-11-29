import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export interface UserDetails {
    id: number
    firstName: string
    lastName: string
    gender: "Male" | "Female"
    email: string
    birthDate: string
}

interface UsersStore {
    users: UserDetails[]
    addUser: (user: UserDetails) => void
    updateUser: (user: UserDetails) => void
    deleteUser: (userId: number) => void
}

export const useUsersStore = create<UsersStore>()(
    persist(
        (set) => ({
            users: [],
            addUser: (user) => set((state) => ({ users: [...state.users, user] })),
            updateUser: (updatedUser: UserDetails) =>
                set((state) => ({
                    users: state.users.map(u => u.id === updatedUser.id ? updatedUser : u)
                })),
            deleteUser: (userId: number) => set((state) => ({
                users: state.users.filter(u => u.id !== userId)
            })),
        }),
        {
            name: "users-storage",
            storage: createJSONStorage(() => sessionStorage),
        }
    )
)

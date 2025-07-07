import type React from "react"
import { render, type RenderOptions } from "@testing-library/react"

// Mock user data for different user roles
export const mockUsers = {
  user: {
    id: "1",
    name: "John Doe",
    email: "user@example.com",
    role: "USER",
    balance: 1000,
    profilePicture: "data:image/svg+xml;base64,test",
  },
  admin: {
    id: "2",
    name: "Admin User",
    email: "admin@example.com",
    role: "ADMIN",
    balance: 5000,
    profilePicture: "data:image/svg+xml;base64,test",
  },
  superAdmin: {
    id: "3",
    name: "Super Admin",
    email: "superadmin@example.com",
    role: "SUPER_ADMIN",
    balance: 10000,
    profilePicture: "data:image/svg+xml;base64,test",
  },
}

// Custom render function
const customRender = (ui: React.ReactElement, options?: Omit<RenderOptions, "wrapper">) => {
  return render(ui, options)
}

export * from "@testing-library/react"
export { customRender as render }

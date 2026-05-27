import React from "react";
import { useAuthStore } from "@/store/auth.store";

interface RoleGuardProps {
  allowedRoles: ("admin" | "manager" | "user")[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ 
  allowedRoles, 
  children, 
  fallback = null 
}) => {
  const { admin } = useAuthStore();

  if (!admin || !allowedRoles.includes(admin.role as any)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

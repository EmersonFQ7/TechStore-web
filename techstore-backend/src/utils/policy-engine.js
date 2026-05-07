'use strict';

/**
 * Motor de políticas ABAC para TechStore.
 *
 * evaluate(action, user, resource) → { allowed: bool, reason: string }
 *
 * Acciones : 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE'
 * Roles    : 'ADMIN' | 'GERENTE' | 'EMPLEADO' | 'AUDITOR'
 *
 * Atributos de usuario relevantes:
 *   user.roles[]    → nombres de roles
 *   user.tienda_id  → tienda asignada
 *
 * Atributos de recurso (producto) relevantes:
 *   resource.tienda_id  → tienda del producto
 *   resource.es_premium → si es producto premium
 *   resource.campo      → campo que se intenta actualizar (para UPDATE)
 */
function evaluate(action, user, resource = {}) {
  const roles     = (user.roles || []).map(r => r.toUpperCase());
  const isAdmin   = roles.includes('ADMIN');
  const isGerente = roles.includes('GERENTE');
  const isEmpleado= roles.includes('EMPLEADO');
  const isAuditor = roles.includes('AUDITOR');

  const mismasTienda = () =>
    user.tienda_id && resource.tienda_id &&
    Number(user.tienda_id) === Number(resource.tienda_id);

  switch (action) {
    // ─── SELECT ──────────────────────────────────────────
    case 'SELECT': {
      if (isAdmin)   return allow('ADMIN puede ver todos los productos');
      if (isAuditor) return allow('AUDITOR puede ver todos (solo lectura)');
      if (isGerente) {
        return mismasTienda()
          ? allow('GERENTE puede ver productos de su tienda')
          : deny('GERENTE solo puede ver productos de su tienda');
      }
      if (isEmpleado) {
        return mismasTienda()
          ? allow('EMPLEADO puede ver productos de su tienda')
          : deny('EMPLEADO solo puede ver productos de su tienda');
      }
      return deny('Sin permisos para visualizar productos');
    }

    // ─── INSERT ──────────────────────────────────────────
    case 'INSERT': {
      if (isAdmin)   return allow('ADMIN puede insertar en cualquier tienda');
      if (isAuditor) return deny('AUDITOR no puede crear productos');
      if (isGerente) {
        return mismasTienda()
          ? allow('GERENTE puede insertar en su tienda')
          : deny('GERENTE solo puede insertar en su tienda');
      }
      if (isEmpleado) {
        if (!mismasTienda()) return deny('EMPLEADO solo puede insertar en su tienda');
        if (resource.es_premium) return deny('EMPLEADO no puede crear productos premium');
        return allow('EMPLEADO puede insertar productos no premium en su tienda');
      }
      return deny('Sin permisos para crear productos');
    }

    // ─── UPDATE ──────────────────────────────────────────
    case 'UPDATE': {
      if (isAdmin)   return allow('ADMIN puede actualizar todos los campos');
      if (isAuditor) return deny('AUDITOR no puede modificar productos');
      if (isGerente) {
        if (!mismasTienda()) return deny('GERENTE solo puede actualizar productos de su tienda');
        if (resource.campo === 'categoria')
          return deny('GERENTE no puede modificar la categoría');
        return allow('GERENTE puede actualizar campos permitidos');
      }
      if (isEmpleado) {
        if (!mismasTienda()) return deny('EMPLEADO solo puede actualizar productos de su tienda');
        if (resource.campo !== 'stock')
          return deny('EMPLEADO solo puede modificar el stock');
        return allow('EMPLEADO puede actualizar el stock');
      }
      return deny('Sin permisos para actualizar productos');
    }

    // ─── DELETE ──────────────────────────────────────────
    case 'DELETE': {
      if (isAdmin)   return allow('ADMIN puede eliminar cualquier producto');
      if (isAuditor) return deny('AUDITOR no puede eliminar productos');
      if (isGerente) {
        if (!mismasTienda()) return deny('GERENTE solo puede eliminar productos de su tienda');
        if (resource.es_premium) return deny('GERENTE no puede eliminar productos premium');
        return allow('GERENTE puede eliminar productos no premium de su tienda');
      }
      if (isEmpleado) return deny('EMPLEADO no puede eliminar productos');
      return deny('Sin permisos para eliminar productos');
    }

    default:
      return deny(`Acción desconocida: ${action}`);
  }
}

function allow(reason) { return { allowed: true,  reason }; }
function deny(reason)  { return { allowed: false, reason }; }

module.exports = { evaluate };
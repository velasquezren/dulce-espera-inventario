import type { Rol, Sesion } from '../domain/tipos';
import { pedir } from './cliente';

interface SesionDTO {
  nombre: string | null;
  username: string | null;
  rol: string | null;
  token: string | null;
}

const ROLES: Rol[] = ['cocina', 'compras', 'admin'];

export async function autenticar(usuario: string, clave: string): Promise<Sesion> {
  const datos = await pedir<SesionDTO>('/login', {
    metodo: 'POST',
    cuerpo: { username: usuario.trim().toLowerCase(), password: clave.trim() },
  });

  const rol = (datos.rol ?? '').trim().toLowerCase() as Rol;

  return {
    nombre: datos.nombre?.trim() || datos.username?.trim() || 'Usuario',
    usuario: datos.username?.trim() || usuario.trim().toLowerCase(),
    rol: ROLES.includes(rol) ? rol : 'cocina',
    token: datos.token ?? '',
  };
}

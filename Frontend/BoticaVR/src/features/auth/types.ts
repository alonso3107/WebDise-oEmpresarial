// ============================================================
// BoticaVR — Tipos del módulo Auth
// ============================================================

/** Credenciales enviadas en el formulario de login */
export interface LoginRequest {
  username: string;
  password: string;
}

/** Respuesta del backend al login exitoso */
export interface TokenResponse {
  access_token: string;
  token_type: string;
}

/** Datos del trabajador autenticado (según schema User del backend) */
export interface UsuarioAutenticado {
  id: number;
  username: string;
  nombre_completo: string;
  rol: 'admin' | 'farmaceutico' | 'cajero';
  activo: boolean;
}

/** Estado del formulario de login */
export interface LoginFormState {
  username: string;
  password: string;
}

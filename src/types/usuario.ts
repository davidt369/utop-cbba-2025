export interface Rol {
  id: number;
  nombre_rol: "Administrador" | "Usuario" | "SuperAdministrador";
  descripcion: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Funcionario {
  id: number;
  primer_nombre: string;
  segundo_nombre: string | null;
  primer_apellido: string;
  segundo_apellido: string | null;
  numero_carnet: string;
  expedido: string;
  sexo: "M" | "F";
  grado_jerarquico:
    | "Coronel"
    | "Teniente coronel"
    | "Mayor"
    | "Capitán"
    | "Teniente"
    | "Sub teniente"
    | "Sub oficial superior"
    | "Sub oficial primero"
    | "Sub oficial segundo"
    | "Sargento mayor"
    | "Sargento primero"
    | "Sargento segundo"
    | "Sargento inicial";
  direccion: string | null;
  numero_celular: string | null;
  numero_escalafon: string | null;
  numero_cuenta_bancaria: string | null;
  estado_funcionario: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  nombre_completo?: string;
}

export interface Usuario {
  id: number;
  email: string;
  funcionario_id: number | null;
  rol_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  rol: Rol;
  funcionario?: Funcionario | null;
}

export interface CreateUsuarioData {
  email: string;
  password: string;
  rol_id: number;
  funcionario_id?: number;
}

export interface CreateUsuarioWithFuncionarioData {
  email: string;
  password: string;
  rol_id: number;
  // Datos del funcionario
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  numero_carnet: string;
  expedido: string;
  sexo: "M" | "F";
  grado_jerarquico:
    | "Coronel"
    | "Teniente coronel"
    | "Mayor"
    | "Capitán"
    | "Teniente"
    | "Sub teniente"
    | "Sub oficial superior"
    | "Sub oficial primero"
    | "Sub oficial segundo"
    | "Sargento mayor"
    | "Sargento primero"
    | "Sargento segundo"
    | "Sargento inicial";
  direccion?: string;
  numero_celular?: string;
  numero_escalafon?: string;
  numero_cuenta_bancaria?: string;
}

export interface UpdateUsuarioData {
  email?: string;
  password?: string;
  rol_id?: number;
  funcionario_id?: number;
}

export interface UsuariosState {
  usuarios: Usuario[];
  loading: boolean;
  error: string | null;
  selectedUsuario: Usuario | null;
  setUsuarios: (usuarios: Usuario[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedUsuario: (usuario: Usuario | null) => void;
  addUsuario: (usuario: Usuario) => void;
  updateUsuario: (id: number, usuario: Partial<Usuario>) => void;
  removeUsuario: (id: number) => void;
}

export interface UsuariosEstadisticas {
  total: number;
  superAdministradores: number;
  administradores: number;
  usuarios: number;
}

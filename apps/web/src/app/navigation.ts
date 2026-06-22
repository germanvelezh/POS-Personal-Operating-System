import {
  BarChart3,
  Bot,
  BriefcaseBusiness,
  FileText,
  Gauge,
  Lightbulb,
  ReceiptText,
  SearchCheck,
  Settings,
  SquareKanban,
  UsersRound
} from 'lucide-react';

export type NavItem = {
  label: string;
  ariaLabel?: string;
  path: string;
  description: string;
  icon: typeof Gauge;
  sections: string[];
};

export const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/',
    description: 'KPIs, alertas, prioridades y accesos rápidos.',
    icon: Gauge,
    sections: ['Prioridades', 'Alertas', 'Funnel', 'Facturación']
  },
  {
    label: 'Clientes',
    path: '/clients',
    description: 'Clientes externos y cliente interno Germán / Startup Interna.',
    icon: UsersRound,
    sections: ['Todos', 'Prospectos', 'Activos', 'Inactivos', 'Cliente interno']
  },
  {
    label: 'Ideas',
    path: '/ideas',
    description: 'Pipeline de ideas desde captura hasta conversión o descarte.',
    icon: Lightbulb,
    sections: ['Capturadas', 'En revisión', 'En investigación', 'Priorizadas']
  },
  {
    label: 'Proyectos',
    path: '/projects',
    description: 'Proyectos activos, planeados, bloqueados y cerrados.',
    icon: SquareKanban,
    sections: ['Activos', 'Planeados', 'Bloqueados', 'Por semáforo']
  },
  {
    label: 'Tareas',
    path: '/tasks',
    description: 'Pendientes por fecha, estado, prioridad y proyecto.',
    icon: SearchCheck,
    sections: ['Vencidas', 'Hoy', 'Esta semana', 'Bloqueadas']
  },
  {
    label: 'Oportunidades',
    path: '/opportunities',
    description: 'Pipeline comercial, negociación y oportunidades ganadas.',
    icon: BriefcaseBusiness,
    sections: ['Pipeline', 'Calificadas', 'Negociación', 'Ganadas']
  },
  {
    label: 'Facturas',
    path: '/invoices',
    description: 'Control documental de facturas y pagos.',
    icon: ReceiptText,
    sections: ['Por facturar', 'Borradores', 'Vencidas', 'Pagadas']
  },
  {
    label: 'Investigaciones',
    path: '/research',
    description: 'Investigaciones asociadas a ideas, clientes o proyectos.',
    icon: BarChart3,
    sections: ['Pendientes', 'En curso', 'Completas', 'Requieren validación']
  },
  {
    label: 'Documentos',
    path: '/documents',
    description: 'Briefs, investigaciones, facturas y reportes generados.',
    icon: FileText,
    sections: ['Briefs', 'Investigaciones', 'Facturas', 'Reportes']
  },
  {
    label: 'Automatizaciones',
    path: '/automations',
    description: 'Acciones manuales para recalcular y generar reportes.',
    icon: Bot,
    sections: ['Reporte semanal', 'Scores', 'Semáforos', 'Vencidos']
  },
  {
    label: 'Configuración',
    ariaLabel: 'Configuracion',
    path: '/settings',
    description: 'Conexión Google, Sheet maestro, Drive, templates y diagnóstico.',
    icon: Settings,
    sections: ['Google', 'Inicialización', 'Templates', 'Diagnóstico']
  }
];

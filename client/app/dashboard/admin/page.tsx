import Link from 'next/link';
import { FC } from 'react';

interface AdminSection {
  title: string;
  description: string;
  href: string;
  icon: string;
}

const AdminPage: FC = () => {
  const sections: AdminSection[] = [
    { 
      title: 'Usuarios', 
      description: 'Administrar usuarios del sistema',
      href: '/admin/usuarios',
      icon: '👥'
    },
    { 
      title: 'Equipo', 
      description: 'Gestionar miembros del equipo',
      href: '/admin/team',
      icon: '👨‍💼'
    },
    { 
      title: 'Testimonios', 
      description: 'Administrar testimonios de clientes',
      href: '/admin/testimonios',
      icon: '⭐'
    },
    { 
      title: 'Servicios', 
      description: 'Gestionar otros servicios ofrecidos',
      href: '/admin/otros-servicios',
      icon: '🛠️'
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {sections.map((section, index) => (
          <Link 
            key={index} 
            href={section.href}
            className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <div className="text-4xl mb-4">{section.icon}</div>
            <h2 className="text-xl font-semibold mb-2">{section.title}</h2>
            <p className="text-gray-600">{section.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminPage;

# 🌐 Integración con tu Página Web PHP Actual

## Cómo Integrar las APIs con tu Código Existente

Si ya tienes una página web PHP funcionando, aquí te muestro cómo integrar los nuevos endpoints:

---

## 1️⃣ Página de Propiedades/Proyectos

### Tu código actual (probablemente algo así):

```php
<?php
// propiedades.php - ANTES

// Obtenías datos de una tabla local o hardcodeados
$propiedades = [
    ['nombre' => 'Casa Playa', 'precio' => 250000],
    // ... etc
];
?>
```

### Nuevo código con API:

```php
<?php
// propiedades.php - DESPUÉS

// Incluir helpers
require_once 'config/database.php';

// OPCIÓN A: Llamar directamente a la BD (más rápido)
$propiedades = fetchAll(
    "SELECT id, nombre, descripcion, imagen, precio, ubicacion, estado 
     FROM proyectos 
     WHERE activo = 1 AND estado != 'VENDIDO'
     ORDER BY creadoEn DESC"
);

// OPCIÓN B: Usar la API (más flexible)
// $response = file_get_contents('https://tudominio.com/api/proyectos.php?estado=DISPONIBLE');
// $data = json_decode($response, true);
// $propiedades = $data['data'];
?>

<!DOCTYPE html>
<html>
<head>
    <title>Nuestros Proyectos</title>
    <style>
        .propiedades-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            padding: 20px;
        }
        .propiedad-card {
            border: 1px solid #ddd;
            border-radius: 8px;
            overflow: hidden;
            transition: transform 0.3s;
        }
        .propiedad-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .propiedad-imagen {
            width: 100%;
            height: 200px;
            object-fit: cover;
        }
        .propiedad-info {
            padding: 15px;
        }
        .precio {
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
        }
        .estado {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
        }
        .estado-disponible { background: #28a745; color: white; }
        .estado-reservado { background: #ffc107; color: black; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Nuestros Proyectos</h1>
        
        <div class="propiedades-grid">
            <?php foreach ($propiedades as $prop): ?>
                <div class="propiedad-card">
                    <?php if ($prop['imagen']): ?>
                        <img src="<?= htmlspecialchars($prop['imagen']) ?>" 
                             alt="<?= htmlspecialchars($prop['nombre']) ?>" 
                             class="propiedad-imagen">
                    <?php else: ?>
                        <div class="propiedad-imagen" style="background: #f0f0f0;"></div>
                    <?php endif; ?>
                    
                    <div class="propiedad-info">
                        <span class="estado estado-<?= strtolower($prop['estado']) ?>">
                            <?= htmlspecialchars($prop['estado']) ?>
                        </span>
                        
                        <h3><?= htmlspecialchars($prop['nombre']) ?></h3>
                        
                        <?php if ($prop['ubicacion']): ?>
                            <p>📍 <?= htmlspecialchars($prop['ubicacion']) ?></p>
                        <?php endif; ?>
                        
                        <?php if ($prop['descripcion']): ?>
                            <p><?= substr(htmlspecialchars($prop['descripcion']), 0, 150) ?>...</p>
                        <?php endif; ?>
                        
                        <p class="precio">S/ <?= number_format($prop['precio'], 2) ?></p>
                        
                        <a href="propiedad-detalle.php?id=<?= $prop['id'] ?>" 
                           class="btn-ver-mas">Ver Más</a>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</body>
</html>
```

---

## 2️⃣ Página de Testimonios

```php
<?php
// testimonios.php o sección en index.php

require_once 'config/database.php';

// Obtener testimonios aprobados
$testimonios = fetchAll(
    "SELECT nombre, calificacion, testimonio, foto, videoUrl 
     FROM testimonials 
     WHERE estado = 'approved' 
     ORDER BY aprobadoEn DESC 
     LIMIT 6"
);
?>

<section class="testimonios">
    <h2>Lo Que Dicen Nuestros Clientes</h2>
    
    <div class="testimonios-grid">
        <?php foreach ($testimonios as $test): ?>
            <div class="testimonio-card">
                <?php if ($test['foto']): ?>
                    <img src="<?= htmlspecialchars($test['foto']) ?>" 
                         alt="<?= htmlspecialchars($test['nombre']) ?>" 
                         class="testimonio-foto">
                <?php endif; ?>
                
                <div class="rating">
                    <?= str_repeat('⭐', $test['calificacion']) ?>
                </div>
                
                <p class="testimonio-texto">
                    "<?= htmlspecialchars($test['testimonio']) ?>"
                </p>
                
                <p class="testimonio-autor">
                    - <?= htmlspecialchars($test['nombre']) ?>
                </p>
                
                <?php if ($test['videoUrl']): ?>
                    <a href="<?= htmlspecialchars($test['videoUrl']) ?>" 
                       target="_blank">Ver Video</a>
                <?php endif; ?>
            </div>
        <?php endforeach; ?>
    </div>
</section>
```

---

## 3️⃣ Sección del Equipo

```php
<?php
// equipo.php

require_once 'config/database.php';

$equipo = fetchAll(
    "SELECT nombre, cargo, descripcion, foto, facebook, instagram, tiktok
     FROM team_members 
     WHERE activo = 1 
     ORDER BY ordenMostrar ASC"
);
?>

<section class="nuestro-equipo">
    <h2>Nuestro Equipo</h2>
    
    <div class="equipo-grid">
        <?php foreach ($equipo as $miembro): ?>
            <div class="miembro-card">
                <?php if ($miembro['foto']): ?>
                    <img src="<?= htmlspecialchars($miembro['foto']) ?>" 
                         alt="<?= htmlspecialchars($miembro['nombre']) ?>">
                <?php endif; ?>
                
                <h3><?= htmlspecialchars($miembro['nombre']) ?></h3>
                <p class="cargo"><?= htmlspecialchars($miembro['cargo']) ?></p>
                <p><?= htmlspecialchars($miembro['descripcion']) ?></p>
                
                <div class="redes-sociales">
                    <?php if ($miembro['facebook']): ?>
                        <a href="<?= htmlspecialchars($miembro['facebook']) ?>" 
                           target="_blank">Facebook</a>
                    <?php endif; ?>
                    
                    <?php if ($miembro['instagram']): ?>
                        <a href="<?= htmlspecialchars($miembro['instagram']) ?>" 
                           target="_blank">Instagram</a>
                    <?php endif; ?>
                    
                    <?php if ($miembro['tiktok']): ?>
                        <a href="<?= htmlspecialchars($miembro['tiktok']) ?>" 
                           target="_blank">TikTok</a>
                    <?php endif; ?>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
</section>
```

---

## 4️⃣ Versión con JavaScript (Para Páginas Dinámicas)

Si prefieres cargar los datos con AJAX:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Propiedades</title>
</head>
<body>
    <div id="propiedades-container">
        <p>Cargando propiedades...</p>
    </div>

    <script>
        async function cargarPropiedades() {
            try {
                const response = await fetch('/api/proyectos.php?estado=DISPONIBLE');
                const result = await response.json();
                
                if (!result.success) {
                    throw new Error('Error al cargar propiedades');
                }
                
                const container = document.getElementById('propiedades-container');
                container.innerHTML = '';
                
                result.data.forEach(prop => {
                    const card = document.createElement('div');
                    card.className = 'propiedad-card';
                    card.innerHTML = `
                        <img src="${prop.imagen || '/img/placeholder.jpg'}" alt="${prop.nombre}">
                        <h3>${prop.nombre}</h3>
                        <p>${prop.descripcion?.substring(0, 100)}...</p>
                        <p class="precio">S/ ${parseFloat(prop.precio).toLocaleString()}</p>
                        <a href="/propiedad/${prop.id}">Ver Más</a>
                    `;
                    container.appendChild(card);
                });
                
            } catch (error) {
                console.error('Error:', error);
                document.getElementById('propiedades-container').innerHTML = 
                    '<p>Error al cargar propiedades</p>';
            }
        }
        
        // Cargar al inicio
        cargarPropiedades();
    </script>
</body>
</html>
```

---

## 5️⃣ Búsqueda y Filtros

```php
<?php
// buscar-propiedades.php

require_once 'config/database.php';

$busqueda = $_GET['q'] ?? '';
$estado = $_GET['estado'] ?? '';
$precioMin = $_GET['precio_min'] ?? 0;
$precioMax = $_GET['precio_max'] ?? 9999999;

$sql = "SELECT * FROM proyectos WHERE activo = 1";
$params = [];

if ($busqueda) {
    $sql .= " AND (nombre LIKE :busqueda OR descripcion LIKE :busqueda OR ubicacion LIKE :busqueda)";
    $params['busqueda'] = "%$busqueda%";
}

if ($estado) {
    $sql .= " AND estado = :estado";
    $params['estado'] = $estado;
}

$sql .= " AND precio BETWEEN :precioMin AND :precioMax";
$params['precioMin'] = $precioMin;
$params['precioMax'] = $precioMax;

$sql .= " ORDER BY creadoEn DESC";

$propiedades = fetchAll($sql, $params);
?>

<!-- Formulario de búsqueda -->
<form method="GET" action="">
    <input type="text" name="q" placeholder="Buscar..." 
           value="<?= htmlspecialchars($busqueda) ?>">
    
    <select name="estado">
        <option value="">Todos</option>
        <option value="DISPONIBLE" <?= $estado === 'DISPONIBLE' ? 'selected' : '' ?>>
            Disponible
        </option>
        <option value="RESERVADO" <?= $estado === 'RESERVADO' ? 'selected' : '' ?>>
            Reservado
        </option>
    </select>
    
    <input type="number" name="precio_min" placeholder="Precio mín" 
           value="<?= $precioMin ?>">
    <input type="number" name="precio_max" placeholder="Precio máx" 
           value="<?= $precioMax ?>">
    
    <button type="submit">Buscar</button>
</form>

<!-- Resultados -->
<div class="resultados">
    <p>Se encontraron <?= count($propiedades) ?> propiedades</p>
    <!-- Mostrar propiedades aquí -->
</div>
```

---

## 6️⃣ Link al Portal del Cliente

Agregar en tu menú o footer:

```php
<nav>
    <ul>
        <li><a href="/index.php">Inicio</a></li>
        <li><a href="/propiedades.php">Propiedades</a></li>
        <li><a href="/equipo.php">Equipo</a></li>
        <li><a href="/contacto.php">Contacto</a></li>
        <li><a href="/cliente-login.php" class="btn-portal">🔐 Portal Cliente</a></li>
    </ul>
</nav>
```

---

## 7️⃣ Caché para Optimizar

Si tienes mucho tráfico, usa caché:

```php
<?php
// propiedades.php con caché

$cacheFile = __DIR__ . '/cache/propiedades.json';
$cacheTime = 300; // 5 minutos

// Verificar si el caché es válido
if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < $cacheTime) {
    $propiedades = json_decode(file_get_contents($cacheFile), true);
} else {
    // Obtener de BD
    $propiedades = fetchAll("SELECT * FROM proyectos WHERE activo = 1");
    
    // Guardar en caché
    file_put_contents($cacheFile, json_encode($propiedades));
}
?>
```

---

## 🎨 CSS Básico

```css
/* styles.css */

.propiedades-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    padding: 20px;
}

.propiedad-card {
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s ease;
    background: white;
}

.propiedad-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}

.propiedad-imagen {
    width: 100%;
    height: 220px;
    object-fit: cover;
}

.propiedad-info {
    padding: 20px;
}

.precio {
    font-size: 28px;
    font-weight: bold;
    color: #2563eb;
    margin: 10px 0;
}

.btn-ver-mas {
    display: inline-block;
    padding: 10px 20px;
    background: #2563eb;
    color: white;
    text-decoration: none;
    border-radius: 6px;
    transition: background 0.3s;
}

.btn-ver-mas:hover {
    background: #1d4ed8;
}

.estado {
    display: inline-block;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.estado-disponible {
    background: #dcfce7;
    color: #166534;
}

.estado-reservado {
    background: #fef3c7;
    color: #92400e;
}

.estado-vendido {
    background: #fee2e2;
    color: #991b1b;
}
```

---

## ✅ Checklist de Integración

- [ ] Copiar `config/database.php` a tu proyecto
- [ ] Actualizar credenciales de BD
- [ ] Reemplazar consultas hardcodeadas por `fetchAll()`
- [ ] Probar página de propiedades
- [ ] Probar página de testimonios
- [ ] Agregar enlace al portal de clientes
- [ ] Aplicar estilos CSS
- [ ] Verificar que todo se vea bien en móvil
- [ ] Hacer pruebas de rendimiento
- [ ] Configurar caché si es necesario

---

**¡Listo!** Tu página PHP ahora mostrará datos dinámicos desde el CRM. 🎉

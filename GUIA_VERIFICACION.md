# 🧪 Guía de Verificación Manual - B2BChat

## 🌐 URLs del Sistema (Puerto 3000)

### Páginas Principales
- **Homepage**: http://localhost:3000
- **Login**: http://localhost:3000/login
- **Registro**: http://localhost:3000/register
- **Dashboard**: http://localhost:3000/dashboard
- **Chat**: http://localhost:3000/chat
- **Marketplace**: http://localhost:3000/marketplace
- **Ads Manager**: http://localhost:3000/ads-manager/create
- **Social Hub**: http://localhost:3000/social-hub

---

## 👤 Usuarios de Prueba

### Usuario Regular Recomendado
```
Email: juan@example.com
Contraseña: usuario123
```

### Super Admin (Acceso Completo)
```
Email: superadmin@example.com
Contraseña: super123
```

### Otros Usuarios Disponibles
```
maria@example.com / usuario123
carlos@example.com / usuario123
admin@example.com / admin123
```

---

## ✅ Checklist de Verificación Manual

### 1. Autenticación (5 min)
- [ ] Ir a http://localhost:3000/login
- [ ] Ingresar con `juan@example.com` / `usuario123`
- [ ] Verificar redirección a Dashboard
- [ ] Verificar nombre de usuario en Navbar
- [ ] Cerrar sesión
- [ ] Verificar redirección a homepage

### 2. Dashboard (5 min)
- [ ] Login nuevamente
- [ ] Verificar estadísticas mostradas
- [ ] Click en "Crear Tienda" → Verificar redirección
- [ ] Volver al Dashboard
- [ ] Click en "Nueva Conversación" → Verificar redirección a Chat
- [ ] Volver al Dashboard
- [ ] Click en "Crear Campaña" → Verificar redirección a Ads Manager

### 3. Marketplace (5 min)
- [ ] Ir a http://localhost:3000/marketplace
- [ ] Usar barra de búsqueda: escribir "tech"
- [ ] Verificar filtrado en tiempo real
- [ ] Click en tarjeta de "Tech Solutions Colombia"
- [ ] Verificar página de detalle con productos
- [ ] Click en "Iniciar Chat"
- [ ] Verificar redirección a Chat

### 4. Chat (10 min)
- [ ] Ir a http://localhost:3000/chat
- [ ] Verificar 3 paneles visibles:
  - [ ] Sidebar izquierdo (conversaciones)
  - [ ] Chat central
  - [ ] Panel de anuncios derecho
- [ ] Click en conversación "Empresa A"
- [ ] Escribir mensaje: "Hola, necesito información"
- [ ] Click en botón Enviar (➤)
- [ ] Verificar mensaje aparece en verde (derecha)
- [ ] Esperar 2 segundos
- [ ] Verificar respuesta automática en blanco (izquierda)
- [ ] Click en botón Emoji (😊)
- [ ] Click en botón Adjuntar (📎)
- [ ] Verificar anuncios en panel derecho
- [ ] Click en "Crear Campaña" del panel de anuncios

### 5. Ads Manager - Flujo Completo (15 min)
- [ ] Ir a http://localhost:3000/ads-manager/create
- [ ] **Paso 1: Detalles**
  - [ ] Escribir nombre: "Campaña de Prueba"
  - [ ] Click en "Tráfico" (verificar selección visual)
  - [ ] Click en "Ventas" (verificar cambio)
  - [ ] Click en "Reconocimiento" (verificar cambio)
  - [ ] Click "Siguiente"
- [ ] **Paso 2: Segmentación**
  - [ ] Seleccionar Industria: "Tecnología"
  - [ ] Seleccionar Sector: "B2B"
  - [ ] Escribir Roles: "CEO, Gerente, Director"
  - [ ] Click "Siguiente"
- [ ] **Paso 3: Presupuesto**
  - [ ] Cambiar presupuesto diario a 100000
  - [ ] Mover slider de duración a 15 días
  - [ ] Verificar cálculo total: $1,500,000 COP
  - [ ] Click "Siguiente"
- [ ] **Paso 4: Creativo**
  - [ ] Click en "Imagen" (verificar selección)
  - [ ] Click en "Video" (verificar cambio)
  - [ ] Escribir texto: "Oferta especial"
  - [ ] Click "Siguiente"
- [ ] **Paso 5: Revisar**
  - [ ] Verificar todos los datos mostrados
  - [ ] Click "Pagar y Activar por WhatsApp"
  - [ ] Verificar apertura de WhatsApp Web
  - [ ] Verificar mensaje pre-llenado

### 6. Social Hub (5 min)
- [ ] Ir a http://localhost:3000/social-hub
- [ ] Verificar 6 tarjetas de plataformas:
  - [ ] WhatsApp Business
  - [ ] Instagram Business
  - [ ] Facebook Page
  - [ ] TikTok Business
  - [ ] LinkedIn Company Page
  - [ ] Google Business Profile
- [ ] Click "Conectar" en WhatsApp
- [ ] Click "Conectar" en Instagram
- [ ] Verificar cambio visual (placeholder)

### 7. Navegación Global (5 min)
- [ ] Verificar Navbar en todas las páginas
- [ ] Click en "Chat" desde cualquier página
- [ ] Click en "Marketplace" desde cualquier página
- [ ] Click en "Social Hub" desde cualquier página
- [ ] Click en "Dashboard" desde cualquier página
- [ ] Click en nombre de usuario → Verificar menú
- [ ] Click en "Planes" → Verificar redirección
- [ ] Verificar diseño responsivo (reducir ventana)

### 8. Funcionalidades Interactivas (5 min)
- [ ] Hover sobre botones → Verificar efectos
- [ ] Verificar transiciones suaves
- [ ] Verificar scroll automático en Chat
- [ ] Verificar cálculos en tiempo real (Ads Manager)
- [ ] Verificar búsqueda instantánea (Marketplace)

---

## 📊 Resumen de Verificación

**Total de pruebas**: 50+  
**Tiempo estimado**: 55 minutos  
**Secciones**: 8

### Criterios de Éxito
- ✅ Todos los botones responden al click
- ✅ Todas las redirecciones funcionan
- ✅ Todos los formularios validan correctamente
- ✅ Todos los cálculos son precisos
- ✅ Todas las animaciones son suaves
- ✅ El diseño es responsivo

---

## 🐛 Reporte de Problemas

Si encuentras algún problema, anota:
1. **Página**: URL donde ocurrió
2. **Acción**: Qué estabas haciendo
3. **Esperado**: Qué debería pasar
4. **Actual**: Qué pasó realmente
5. **Screenshot**: Si es posible

---

## 📝 Notas Importantes

- **Servidor debe estar corriendo**: `npm run dev` en puerto 3000
- **Base de datos**: SQLite en `prisma/dev.db`
- **Usuarios creados**: Ejecutar `npx tsx scripts/create-test-users.ts` si no existen
- **Sesión**: Permanece activa hasta cerrar sesión manualmente

---

**Última actualización**: 2025-11-25  
**Versión**: 1.0.0  
**Estado**: Listo para verificación ✅

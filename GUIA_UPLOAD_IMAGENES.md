# Guía: Cómo Subir Imágenes para Campañas

## 📁 Ubicación de Archivos

Las imágenes y videos de campañas se almacenan en:
```
public/uploads/campaigns/
```

## 🚀 Métodos para Subir Imágenes

### Método 1: API de Upload (Recomendado)

#### Endpoint
```
POST /api/upload
```

#### Uso desde el Frontend

```typescript
const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
    });

    const data = await response.json();
    
    if (data.success) {
        console.log('URL de la imagen:', data.url);
        // Usar data.url en el campo creativeUrl de la campaña
    }
};
```

#### Ejemplo con Input de Archivo

```tsx
<input 
    type="file" 
    accept="image/jpeg,image/png,image/webp,video/mp4"
    onChange={async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            
            const data = await res.json();
            setCreativeUrl(data.url); // Guardar URL
        }
    }}
/>
```

### Método 2: Copiar Manualmente (Para Testing Rápido)

1. **Coloca tus imágenes en:**
   ```
   public/uploads/campaigns/
   ```

2. **Usa la URL en tu campaña:**
   ```
   /uploads/campaigns/tu-imagen.jpg
   ```

#### Ejemplo de Nombres de Archivo
```
public/uploads/campaigns/producto-1.jpg
public/uploads/campaigns/banner-promo.png
public/uploads/campaigns/video-demo.mp4
```

#### Uso en Campaña
```json
{
  "creativeType": "IMAGE",
  "creativeUrl": "/uploads/campaigns/producto-1.jpg",
  "creativeText": "¡Oferta especial!"
}
```

## 📋 Especificaciones

### Formatos Permitidos
- **Imágenes:** JPEG, JPG, PNG, WEBP
- **Videos:** MP4

### Tamaño Máximo
- **10 MB** por archivo

### Validaciones del API
✅ Usuario autenticado  
✅ Tipo de archivo válido  
✅ Tamaño dentro del límite  
✅ Nombre único (timestamp + user ID)  

## 🧪 Testing Rápido

### Opción A: Usar Imágenes de Prueba

1. **Crea una carpeta de prueba:**
   ```bash
   mkdir -p public/uploads/campaigns
   ```

2. **Copia imágenes de ejemplo:**
   ```bash
   # Descarga una imagen de prueba
   curl -o public/uploads/campaigns/test-product.jpg https://via.placeholder.com/800x600.jpg
   ```

3. **Usa en tu campaña:**
   ```
   creativeUrl: "/uploads/campaigns/test-product.jpg"
   ```

### Opción B: Usar URLs Externas (Temporal)

Para testing rápido, puedes usar URLs de servicios como:
- **Placeholder:** `https://via.placeholder.com/800x600.png`
- **Unsplash:** `https://images.unsplash.com/photo-xxxxx`
- **Lorem Picsum:** `https://picsum.photos/800/600`

```json
{
  "creativeType": "IMAGE",
  "creativeUrl": "https://via.placeholder.com/800x600.png",
  "creativeText": "Imagen de prueba"
}
```

## 🔧 Integración en el Formulario de Campaña

### Actualizar `/ads-manager/create/page.tsx`

```tsx
const [uploading, setUploading] = useState(false);
const [creativeUrl, setCreativeUrl] = useState("");

const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();
        
        if (data.success) {
            setCreativeUrl(data.url);
            alert('Imagen subida exitosamente');
        } else {
            alert(data.error || 'Error al subir imagen');
        }
    } catch (error) {
        alert('Error al subir imagen');
    } finally {
        setUploading(false);
    }
};

// En el JSX:
<div>
    <label>Subir Imagen/Video</label>
    <input 
        type="file"
        accept="image/*,video/mp4"
        onChange={handleImageUpload}
        disabled={uploading}
    />
    {uploading && <p>Subiendo...</p>}
    {creativeUrl && (
        <div>
            <p>✅ Archivo subido</p>
            <img src={creativeUrl} alt="Preview" style={{maxWidth: '200px'}} />
        </div>
    )}
</div>
```

## 📊 Estructura de Respuesta del API

### Éxito (200)
```json
{
  "success": true,
  "url": "/uploads/campaigns/user123_1234567890.jpg",
  "filename": "user123_1234567890.jpg",
  "type": "image/jpeg",
  "size": 245678
}
```

### Error (400/401/500)
```json
{
  "error": "Tipo de archivo no permitido"
}
```

## 🎯 Ejemplos de Uso Completo

### Crear Campaña con Imagen

```typescript
// 1. Subir imagen
const formData = new FormData();
formData.append('file', imageFile);

const uploadRes = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
});

const { url: creativeUrl } = await uploadRes.json();

// 2. Crear campaña con la URL
const campaignData = {
    name: "Campaña de Prueba",
    objective: "SALES",
    industry: "Tecnología",
    sector: "Software",
    dailyBudget: 50000,
    durationDays: 7,
    creativeType: "IMAGE",
    creativeUrl: creativeUrl, // URL de la imagen subida
    creativeText: "¡Descubre nuestro nuevo producto!"
};

const campaignRes = await fetch('/api/campaigns/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(campaignData),
});
```

## 🔒 Seguridad

- ✅ Requiere autenticación (NextAuth session)
- ✅ Validación de tipo de archivo
- ✅ Límite de tamaño (10MB)
- ✅ Nombres únicos (evita sobrescritura)
- ✅ Solo formatos seguros (imágenes y video MP4)

## 📝 Notas Importantes

1. **Producción:** Para producción, considera usar servicios como:
   - Cloudinary
   - AWS S3
   - Vercel Blob Storage
   - Uploadthing

2. **Git:** La carpeta `public/uploads/campaigns/` está en `.gitignore` excepto el archivo `.gitkeep`

3. **Limpieza:** Considera implementar un sistema de limpieza de archivos no utilizados

4. **CDN:** En producción, sirve las imágenes desde un CDN para mejor rendimiento

## 🚀 Próximos Pasos

1. Integrar el upload en el formulario de creación de campañas
2. Agregar preview de imagen antes de subir
3. Implementar crop/resize de imágenes
4. Agregar progress bar para uploads
5. Implementar eliminación de archivos no usados

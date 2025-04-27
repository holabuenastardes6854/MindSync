# Guía para Crear Productos y Precios en Stripe

Esta guía te ayudará a crear los productos y precios específicos para la aplicación MindSync, con los precios de 4,99€ mensual y 44,99€ anual.

## Paso 1: Acceder al Dashboard de Stripe

1. Inicia sesión en tu [Dashboard de Stripe](https://dashboard.stripe.com/)
2. Asegúrate de estar en modo de prueba (Test Mode) durante el desarrollo

## Paso 2: Crear el Producto y Precio Mensual

1. En el menú lateral, ve a **Productos** > **Añadir producto**
2. Completa los datos del producto:
   - **Nombre:** MindSync Premium Mensual
   - **Descripción:** Plan Premium de MindSync con acceso a todas las funciones
   - **Imágenes:** (opcional) Puedes añadir una imagen de tu producto
3. En la sección de Precios:
   - **Tipo de precio:** Recurrente
   - **Precio:** 4,99€
   - **Intervalo de facturación:** Mensual
   - **Moneda:** EUR
4. Haz clic en **Guardar producto**
5. Una vez creado, verás un ID de producto (comienza con `prod_`) y un ID de precio (comienza con `price_`)
6. **Copia el ID de precio** (el que comienza con `price_`)

## Paso 3: Crear el Producto y Precio Anual

1. Ve nuevamente a **Productos** > **Añadir producto**
2. Completa los datos del producto:
   - **Nombre:** MindSync Premium Anual
   - **Descripción:** Plan Premium de MindSync con acceso a todas las funciones, con descuento anual
   - **Imágenes:** (opcional) Puedes añadir una imagen de tu producto
3. En la sección de Precios:
   - **Tipo de precio:** Recurrente
   - **Precio:** 44,99€
   - **Intervalo de facturación:** Anual
   - **Moneda:** EUR
4. Haz clic en **Guardar producto**
5. Una vez creado, verás un ID de producto (comienza con `prod_`) y un ID de precio (comienza con `price_`)
6. **Copia el ID de precio** (el que comienza con `price_`)

## Paso 4: Actualizar tu Código con los IDs de Precio

1. Abre el archivo `src/app/pricing/page.tsx`
2. Actualiza los `stripePriceId` con los IDs de precio que copiaste:
   ```typescript
   // Para el plan mensual
   stripePriceId: 'price_TU_ID_AQUI', // El ID del precio mensual

   // Para el plan anual
   stripePriceId: 'price_TU_ID_AQUI', // El ID del precio anual
   ```

## Paso 5: Verificar las Variables de Entorno

1. Asegúrate de que tu archivo `.env.local` contenga:
   ```
   STRIPE_SECRET_KEY=sk_test_XXXXXXXXXXXXX
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXX
   ```
2. Estas claves las encuentras en **Desarrolladores** > **Claves API** en el Dashboard de Stripe

## Probar la Integración

Una vez configurado, podrás probar los pagos usando tarjetas de prueba:
- Número: `4242 4242 4242 4242` (pago exitoso)
- Fecha: Cualquier fecha futura
- CVC: Cualquier número de 3 dígitos
- Código postal: Cualquier código postal válido

## Resolver el Error "No such price"

Si sigues viendo el error "No such price", verifica:
1. Que has copiado correctamente el ID de precio (no el ID de producto)
2. Que estás usando el ID de precio de tu propia cuenta Stripe 
3. Que el precio está activo en tu cuenta de Stripe
4. Que la clave API secreta está correctamente configurada en tu `.env.local` 
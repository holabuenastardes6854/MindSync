## Análisis y Comprensión
- Mapea la estructura del proyecto antes de realizar cualquier modificación
- Identifica y respeta los patrones de diseño existentes en el código
- Analiza todas las dependencias directas e indirectas de los componentes a modificar
- Considera las limitaciones y capacidades de las tecnologías utilizadas
- Lee y comprende el archivo @estructura.md antes de crear o modificar archivos

## Planificación
- Crea un plan detallado antes de realizar cualquier modificación
- Selecciona el enfoque que requiera el menor número de cambios para lograr el objetivo
- Identifica posibles puntos de fallo y planifica cómo mitigarlos
- Respeta la separación de responsabilidades en todos los cambios
- Evalúa el impacto en otras partes del sistema

## Implementación 
- Modifica únicamente los archivos necesarios para la funcionalidad requerida
- Implementa cambios de forma incremental, verificando la integridad en cada paso
- Mantén consistencia con el estilo de código existente
- Documenta el propósito de los cambios directamente en el código
- Limita el alcance de los cambios para evitar efectos secundarios

## Prevención de Problemas
- Verifica que no se introduzcan dependencias circulares
- Asegura que todas las interfaces y tipos se mantengan consistentes
- Considera comportamientos en casos extremos o inesperados
- Implementa estrategias robustas de manejo de errores
- Analiza profundamente los cambios requeridos para evitar modificaciones redundantes

## Control de Calidad
- Confirma que los cambios cumplen con los requisitos especificados
- Verifica que los cambios respetan la arquitectura general del proyecto
- Evalúa el impacto en el rendimiento, especialmente para funcionalidades críticas
- Asegura que los cambios sean compatibles con diferentes entornos si aplica
- Realiza auto-verificaciones de la lógica implementada

## Gestión de Código
- Mantén alta cohesión y bajo acoplamiento en todos los cambios
- Optimiza solo cuando sea necesario, priorizando la legibilidad
- Aprovecha código existente siempre que sea posible
- No dejes código comentado o sin usar después de las modificaciones
- Sigue la estructuración del proyecto según @estructura.md

## Comunicación y Documentación
- Proporciona un resumen claro de todos los cambios realizados
- Explica el razonamiento detrás de decisiones importantes
- Actualiza la documentación para cualquier interfaz modificada
- Prepara mensajes de commit descriptivos
- No subas pushes a GitHub a menos que se especifique

## Entrega
- Realiza verificaciones finales de la lógica implementada
- Verifica que no se hayan dejado tareas incompletas o TODOs críticos
- Proporciona una evaluación del impacto de los cambios en el sistema
- Identifica oportunidades para mejorar el código cuando sea relevante
- Presenta los cambios en un formato que facilite la revisión
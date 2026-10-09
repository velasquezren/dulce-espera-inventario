# Guía de Integración: FastAPI y FileMaker Pro (Sin ODBC)

Esta guía te muestra paso a paso cómo configurar la comunicación entre tu solución local de **FileMaker Pro** y tu servidor backend de **FastAPI** utilizando peticiones HTTP y formato JSON.

---

## 1. Detalles de la API en la Nube

* **URL Base de la API**: `https://107.172.193.34.nip.io`
  *(El servidor remoto está configurado con seguridad SSL bajo este dominio).*

### Endpoints del Backend

#### A. Obtener Pedidos Pendientes
* **Método**: `GET`
* **Ruta**: `https://107.172.193.34.nip.io/api/pedidos/pendientes`
* **Función**: Devuelve un JSON estructurado con todos los pedidos que tienen `estado = 'pendiente'` y su respectivo detalle de insumos solicitado.
* **Formato de Respuesta**:
  ```json
  [
    {
      "id_publico": "626665db-f92d-4f0a-bb74-b6a2b8a10e80",
      "solicitante": "Maria Lopez",
      "fecha_solicitud": "2026-07-11 22:48:35",
      "detalles": [
        {
          "id_publico": "d2a0de82-c9e8-48af-b35c-bab65685ce59",
          "insumo_id_publico": "IN62",
          "cantidad": 2.0
        }
      ]
    }
  ]
  ```

#### B. Actualizar Estado (Aceptar/Rechazar)
* **Método**: `PATCH`
* **Ruta**: `https://107.172.193.34.nip.io/api/pedidos/actualizar-estado`
* **Función**: Actualiza el estado de un pedido en la base de datos MySQL.
* **Formato de Entrada (JSON)**:
  ```json
  {
    "id_publico": "UUID-DEL-PEDIDO",
    "estado": "aceptado"
  }
  ```
  *(Los estados válidos son: `pendiente`, `aceptado`, `rechazado`, `en revision`, `comprado`, `entregado`, `cancelado`)*

#### C. Obtener Detalle de Pedidos Pendientes (Formato Plano - Altamente Recomendado para FileMaker)
* **Método**: `GET`
* **Ruta**: `https://107.172.193.34.nip.io/api/pedidos/detalles-pendientes-flat`
* **Función**: Devuelve una lista completamente plana (flat) con todas las líneas de detalles de pedidos que tienen `estado = 'pendiente'`, cargando de forma directa la información descriptiva del insumo. Esto evita tener que implementar bucles anidados en FileMaker.
* **Formato de Respuesta**:
  ```json
  [
    {
      "pedido_id_publico": "626665db-f92d-4f0a-bb74-b6a2b8a10e80",
      "solicitante": "Maria Lopez",
      "fecha_solicitud": "2026-07-11 22:48:35",
      "estado": "pendiente",
      "detalle_id_publico": "d2a0de82-c9e8-48af-b35c-bab65685ce59",
      "insumo_id_publico": "IN62",
      "nombre_insumo": "Leche Semidescremada Pasteurizada",
      "categoria_insumo": "Lácteos",
      "presentacion_insumo": "Litros",
      "cantidad": 2.0
    }
  ]
  ```

---

## 2. Configuración de Guiones en FileMaker Pro

Abre tu archivo de FileMaker y presiona **Cmd+Shift+S** (Mac) o **Ctrl+Shift+S** (Windows) para abrir el Creador de Guiones (Scripts). Crea los siguientes dos guiones.

### Guión A: "Refrescar Pedidos desde API"

Este guión descarga los pedidos pendientes de la API y crea los registros locales en tu tabla de `Pedidos` y `Detalle_Pedido` si no existían previamente.

#### Pasos del Guión:

1. **Congelar ventana**
2. **Insertar desde URL** [ Seleccionar ; Con diálogo: Desactivado ; **$json_respuesta** ; `"https://107.172.193.34.nip.io/api/pedidos/pendientes"` ]
3. **Establecer variable** [ **$indices_pedidos** ; Valor: `JSONListKeys ( $json_respuesta ; "" )` ]
4. **Establecer variable** [ **$total_pedidos** ; Valor: `ValueCount ( $indices_pedidos )` ]
5. **Establecer variable** [ **$i** ; Valor: `1` ]
6. **Loop**
   * **Salir del bucle si** [ `$i > $total_pedidos` ]
   * **Establecer variable** [ **$indice** ; Valor: `GetValue ( $indices_pedidos ; $i )` ]
   * **Establecer variable** [ **$id_publico** ; Valor: `JSONGetElement ( $json_respuesta ; "[" & $indice & "]id_publico" )` ]
   * **Establecer variable** [ **$solicitante** ; Valor: `JSONGetElement ( $json_respuesta ; "[" & $indice & "]solicitante" )` ]
   * **Establecer variable** [ **$fecha_solicitud_raw** ; Valor: `JSONGetElement ( $json_respuesta ; "[" & $indice & "]fecha_solicitud" )` ]
   * **Establecer variable** [ **$detalles_json** ; Valor: `JSONGetElement ( $json_respuesta ; "[" & $indice & "]detalles" )` ]
   
   * *# --- Buscar si el pedido ya existe en FileMaker para no duplicar ---*
   * **Ir a la presentación** [ `"Pedidos"` ] *(Usa tu presentación local de Pedidos)*
   * **Entrar en modo Buscar** [ Pausar: Desactivado ]
   * **Establecer campo** [ `Pedidos::id_publico` ; `$id_publico` ]
   * **Ejecutar búsqueda** [ ]
   
   * **Si** [ `Get ( FoundCount ) = 0` ]
     * **Nuevo registro/petición**
     * **Establecer campo** [ `Pedidos::id_publico` ; `$id_publico` ]
     * **Establecer campo** [ `Pedidos::solicitante` ; `$solicitante` ]
     * **Establecer campo** [ `Pedidos::fecha_solicitud` ; `GetAsTimestamp ( Substitute ( $fecha_solicitud_raw ; "-" ; "/" ) )` ]
     * **Establecer campo** [ `Pedidos::estado` ; `"pendiente"` ]
     * **Guardar registros/peticiones** [ Con diálogo: Desactivado ]
     
     * *# --- Recorrer e Insertar las Líneas de Detalle ---*
     * **Establecer variable** [ **$indices_detalles** ; Valor: `JSONListKeys ( $detalles_json ; "" )` ]
     * **Establecer variable** [ **$total_detalles** ; Valor: `ValueCount ( $indices_detalles )` ]
     * **Establecer variable** [ **$j** ; Valor: `1` ]
     * **Loop**
       * **Salir del bucle si** [ `$j > $total_detalles` ]
       * **Establecer variable** [ **$indice_d** ; Valor: `GetValue ( $indices_detalles ; $j )` ]
       * **Establecer variable** [ **$id_detalle** ; Valor: `JSONGetElement ( $detalles_json ; "[" & $indice_d & "]id_publico" )` ]
       * **Establecer variable** [ **$insumo_id** ; Valor: `JSONGetElement ( $detalles_json ; "[" & $indice_d & "]insumo_id_publico" )` ]
       * **Establecer variable** [ **$cantidad** ; Valor: `JSONGetElement ( $detalles_json ; "[" & $indice_d & "]cantidad" )` ]
       
       * **Ir a la presentación** [ `"Detalle_Pedido"` ] *(Usa tu presentación de Detalles)*
       * **Nuevo registro/petición**
       * **Establecer campo** [ `Detalle_Pedido::id_publico` ; `$id_detalle` ]
       * **Establecer campo** [ `Detalle_Pedido::pedido_id_publico` ; `$id_publico` ]
       * **Establecer campo** [ `Detalle_Pedido::insumo_id_publico` ; `$insumo_id` ]
       * **Establecer campo** [ `Detalle_Pedido::cantidad` ; `GetAsNumber ( $cantidad )` ]
       * **Guardar registros/peticiones** [ Con diálogo: Desactivado ]
       
       * **Establecer variable** [ **$j** ; Valor: `$j + 1` ]
     * **End Loop**
   * **End If**
   
   * **Establecer variable** [ **$i** ; Valor: `$i + 1` ]
7. **End Loop**
8. **Ir a la presentación** [ presentación original ]
9. **Mostrar diálogo personalizado** [ "Éxito" ; "Pedidos actualizados correctamente." ]

---

### Guión B: "Enviar Cambio de Estado (PATCH)"

Este guión envía la decisión del administrador (Aceptar o Rechazar) a la API web y actualiza localmente el registro si el servidor responde con éxito.

#### Pasos del Guión:

1. **Establecer variable** [ **$id_publico** ; Valor: `Pedidos::id_publico` ]
2. **Establecer variable** [ **$estado_nuevo** ; Valor: `Get ( ScriptParameter )` ] *(Toma el parámetro enviado por el botón)*
3. **Establecer variable** [ **$json_payload** ; Valor:
   `JSONSetElement ( "{}" ; [ "id_publico" ; $id_publico ; JSONString ] ; [ "estado" ; $estado_nuevo ; JSONString ] )` ]
4. **Establecer variable** [ **$curl_options** ; Valor:
   `"-X PATCH -H \"Content-Type: application/json\" -d " & Quote ( $json_payload )` ]
5. **Insertar desde URL** [ Seleccionar ; Con diálogo: Desactivado ; **$respuesta_api** ; `"https://107.172.193.34.nip.io/api/pedidos/actualizar-estado"` ; Opciones de cURL: **$curl_options** ]
6. **Establecer variable** [ **$status_api** ; Valor: `JSONGetElement ( $respuesta_api ; "status" )` ]
7. **Si** [ `$status_api = "success"` ]
   * **Establecer campo** [ `Pedidos::estado` ; `$estado_nuevo` ]
   * **Establecer campo** [ `Pedidos::fecha_estado` ; `Get ( FechaHoraActual )` ]
   * **Guardar registros/peticiones** [ Con diálogo: Desactivado ]
   * **Mostrar diálogo personalizado** [ "Éxito" ; "El pedido ha sido actualizado en la PWA y base de datos." ]
8. **Sino**
   * **Mostrar diálogo personalizado** [ "Error de Sincronización" ; "No se pudo actualizar en la API. Detalle: " & $respuesta_api ]
9. **End If**

---

## 3. Vinculación en la Interfaz Gráfica

1. **Botón "Refrescar Pedidos"**: Crea un botón en tu menú y configúralo para ejecutar el **Guión A**.
2. **Botón "Aceptar"**: Crea este botón dentro de tu fila de pedido o portal, configúralo para ejecutar el **Guión B** y en **Parámetro opcional del guión** escribe `"aceptado"`.
3. **Botón "Rechazar"**: Crea este botón al lado del de aceptar, configúralo para ejecutar el **Guión B** y en **Parámetro opcional del guión** escribe `"rechazado"`.

---

## 4. Botones de descarga de PDF (FileMaker Pro 19 / 20)

Dos botones nuevos: uno baja la hoja del pedido que está abierto, y otro baja la
lista completa de todo lo que falta comprar.

### 4.1 Preparación: un campo contenedor global

`Insertar desde URL` entrega el archivo en un campo contenedor, y después se
exporta a disco. Hay que crear **una sola vez** el campo donde aterriza:

1. **Archivo > Administrar > Base de datos… > pestaña Campos**.
2. Tabla `Pedidos`. Nombre del campo: `g_archivo`. Tipo: **Contenedor**.
3. Botón **Opciones… > pestaña Almacenamiento** y marcar
   **Usar almacenamiento global (un valor para todos los registros)**.
4. Aceptar. El campo **no** hace falta ponerlo en ninguna presentación.

> Es global a propósito: así no guarda un PDF dentro de cada registro ni hace
> crecer el archivo de FileMaker.

### 4.2 Guión C: "Descargar PDF del pedido"

Baja la hoja de compras del pedido que está en pantalla, separada por canal
(una hoja para el mercado, otra para el supermercado) y la abre.

```
# --- Descargar PDF del pedido ---
Establecer variable [ $id ; Valor: Pedidos::id_publico ]

Si [ IsEmpty ( $id ) ]
    Mostrar diálogo personalizado [ "Sin pedido" ; "Primero abre un pedido en la ficha." ]
    Salir del guión [ ]
Fin de si

Establecer variable [ $url ; Valor:
    "https://107.172.193.34.nip.io/pedidos/" & $id & "/reporte/pdf" ]
Establecer variable [ $nombre ; Valor:
    "Pedido_" & Upper ( Left ( $id ; 8 ) ) & ".pdf" ]

Establecer campo [ Pedidos::g_archivo ; "" ]
Insertar desde URL [ Con diálogo: Desactivado ; Destino: Pedidos::g_archivo ; $url ]

Si [ Get ( UltimoError ) ≠ 0 or IsEmpty ( Pedidos::g_archivo ) ]
    Mostrar diálogo personalizado [ "No se pudo descargar" ;
        "Revisa la conexión a internet. Código: " & Get ( UltimoError ) ]
    Salir del guión [ ]
Fin de si

Establecer variable [ $ruta ; Valor: Get ( RutaDocumentos ) & $nombre ]
Exportar contenido del campo [ Pedidos::g_archivo ; "$ruta" ;
    Abrir automáticamente: Activado ]
```

En **Exportar contenido del campo** hay que entrar en *Especificar archivo de
salida*, escribir `$ruta` y marcar **Abrir el archivo automáticamente**.

### 4.3 Guión D: "Descargar lista de compras"

Junta **todos** los pedidos que todavía no se compraron y suma el mismo insumo
pedido por varias personas: una sola lista para una sola salida al mercado.
No depende del registro abierto, así que el botón puede ir en la barra superior.

```
# --- Descargar lista de compras ---
Establecer variable [ $url ; Valor:
    "https://107.172.193.34.nip.io/api/compras/pendientes/pdf" ]
Establecer variable [ $nombre ; Valor:
    "Lista_compras_" & Year ( Get ( FechaActual ) )
    & Right ( "0" & Month ( Get ( FechaActual ) ) ; 2 )
    & Right ( "0" & Day ( Get ( FechaActual ) ) ; 2 ) & ".pdf" ]

Establecer campo [ Pedidos::g_archivo ; "" ]
Insertar desde URL [ Con diálogo: Desactivado ; Destino: Pedidos::g_archivo ; $url ]

Si [ Get ( UltimoError ) ≠ 0 or IsEmpty ( Pedidos::g_archivo ) ]
    Mostrar diálogo personalizado [ "No se pudo descargar" ;
        "Revisa la conexión a internet. Código: " & Get ( UltimoError ) ]
    Salir del guión [ ]
Fin de si

Establecer variable [ $ruta ; Valor: Get ( RutaDocumentos ) & $nombre ]
Exportar contenido del campo [ Pedidos::g_archivo ; "$ruta" ;
    Abrir automáticamente: Activado ]
```

### 4.4 Colocar los botones

| Botón | Dónde | Guión |
|---|---|---|
| **PDF del pedido** | Ficha PEDIDOS DE COCINA, al lado de *Informe* | Guión C |
| **Lista de compras** | Barra superior, junto a *Traer Pedidos* | Guión D |

### 4.5 Filtrar qué pedidos entran en la lista

Por defecto la lista incluye los estados `pendiente`, `en revision` y
`aceptado`. Para cambiarlo se agrega el parámetro `estados` a la dirección:

```
.../api/compras/pendientes/pdf?estados=aceptado
.../api/compras/pendientes/pdf?estados=pendiente,aceptado
```

### 4.6 Si algo falla

| Síntoma | Causa probable |
|---|---|
| El contenedor queda vacío y `Get(UltimoError)` da 1631 | El equipo no llega al servidor: revisar internet o el firewall |
| Descarga un archivo que no abre | El servidor respondió un error en texto; pegar la dirección en el navegador para ver el mensaje |
| Error al exportar | La carpeta de destino no existe: usar `Get ( RutaEscritorio )` en vez de `Get ( RutaDocumentos )` |

> Alternativa de una sola línea: `Abrir URL [ $url ]` abre el PDF en el
> navegador y lo descarga desde ahí. Sirve como plan B, pero no guarda el
> archivo en una carpeta fija ni lo abre solo.

---

## 5. Otros documentos disponibles

| Documento | Dirección |
|---|---|
| Hoja del pedido en PDF | `/pedidos/{id_publico}/reporte/pdf` |
| Hoja del pedido en Excel | `/pedidos/{id_publico}/reporte/excel` |
| Hoja del pedido en pantalla | `/pedidos/{id_publico}/reporte` |
| Lista de compras consolidada en PDF | `/api/compras/pendientes/pdf` |
| Consolidado de pendientes en Excel | `/api/pedidos/pendientes/excel` |

---

## 6. Estados del pedido: qué cambio admite cada uno

El servidor dejó de aceptar cualquier cambio de estado. Antes un pedido
entregado podía volver a pendiente y uno ya comprado podía cancelarse. Como hay
tres programas cambiando estados (cocina, compras y FileMaker), la regla vive en
el servidor, que es por donde pasan los tres.

### 6.1 Transiciones permitidas

| Estado actual | Puede pasar a |
|---|---|
| **Pendiente** | En revisión · Aceptado · Rechazado · Cancelado |
| **En revisión** | Aceptado · Rechazado · Cancelado |
| **Aceptado** | Comprado · Rechazado · Cancelado |
| **Comprado** | Entregado |
| **Entregado** | nada, es final |
| **Rechazado** | nada, es final |
| **Cancelado** | nada, es final |

Después de *Comprado* ya se gastó el dinero: lo único que queda es que llegue a
cocina. Por eso desde ahí no se puede cancelar.

### 6.2 Rechazado y Cancelado no son lo mismo

| | Quién lo usa | Qué significa |
|---|---|---|
| **Rechazado** | Gobernanta / compras | "No autorizo este pedido" |
| **Cancelado** | Cocina | "Ya no lo necesito" |

En FileMaker el botón que corresponde es **Rechazar**. El de cancelar está en la
aplicación de cocina, que es quien se arrepiente del pedido. Si igual quiere el
botón en FileMaker (por ejemplo, cuando cocina avisa por teléfono), duplique el
botón *Rechazar Pedido* y cambie el parámetro del guión a `cancelado`.

### 6.3 Un ajuste al guión "Cambiar de Estado"

Cuando el cambio no corresponde, el servidor responde **409** con la
explicación en castellano. Su guión ya lo detecta, porque la respuesta no
contiene `success`, pero muestra el JSON crudo. Para que se lea bien, cambie el
`Sino` por esto:

```
Sino
    Establecer variable [ $detalle ; Valor:
        JSONGetElement ( $respuesta_api ; "detail" ) ]
    Mostrar cuadro de diálogo personalizado [ "No se pudo cambiar el estado" ;
        If ( IsEmpty ( $detalle ) ; $respuesta_api ; $detalle ) ]
Fin de si
```

Así, en vez de un bloque de JSON, la gobernanta lee:

> *Un pedido comprado no puede pasar a cancelado. Solo puede pasar a: entregado.*

### 6.4 Repetir el mismo estado ya no molesta

Mandar el estado que el pedido ya tiene devuelve éxito y no cambia nada. Un
doble clic en *Aprobar* dejó de mover la fecha de resolución y de mostrar una
alerta sin motivo.

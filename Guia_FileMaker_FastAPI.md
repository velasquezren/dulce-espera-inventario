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

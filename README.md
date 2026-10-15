# piso-bon-pastor

Web de **piso-bon-pastor**, por [Bits&Roses](https://bitsnroses.com). Se desarrolla desde su espacio de trabajo privado; este repositorio contiene solo lo que se publica.

## Dónde está cada cosa

- **Texto:** `src/content/es/`, un archivo `.md` por bloque de la página. La prosa va en el cuerpo; lo que la maqueta coloca (cifras, fotos, puntos del mapa) va en la cabecera del archivo, y el build comprueba que esté bien formado.
- **Precio, fecha de actualización y enlace del anuncio:** `src/content/datos.yaml`, una sola vez para todos los idiomas.
- **Cabecera, llamada a la acción, pie y glosario:** `src/content/es/comun.md`.
- **Fotos y planos:** `src/assets/`. El build genera los tamaños para la web.

## Build

```bash
nvm use        # Node de .nvmrc
npm ci
npm run build  # BASE=/piso-bon-pastor para la demo
```

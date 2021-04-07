# ctrl-cable-tv-san-rafael

## Instrucciones de instalación

1. Instalar las dependencias, las cuales son: git y python
2. Ejecutar el comando `git clone https://github.com/xhuniktzi/ctrl-cable-tv-san-rafael.git`,
   para clonar el repositorio en el directorio local.
3. Ejecutar el comando `py -m pip install -r requirements.txt` dentro del directorio
   donde esta almacenado el programa.
4. Copiar el archivo `.env.sample` en un archivo nuevo llamando `.env`, y rellenar
   el archivo de [Configuración](#archivo-env-configuración).
5. Ejecutar el comando `py src/setup_app.py`, para crear las bases de datos de
   la aplicación

## Iniciar Programa

1. Para ejecutar el programa, primero debe estar ejecutándose la base de datos
   MySQL.
2. Luego, abrimos un terminal en la carpeta raíz
3. En Windows, ejecutamos el comando `start.bat`

## Actualización

1. Abrir un terminal en la carpeta raíz del programa
2. Ejecutar el comando `git pull`
3. Reiniciar el programa, es decir [ejecutarlo de nuevo](#iniciar-programa)

## Archivo .env, configuración

- **DATABASE_URI**: Esta variable contiene la URI de acceso a la base de datos con
  la información del sistema, esta debe tener el siguiente formato:

  `mysql+pymysql://<user>/<passwd>@<server>/<database>`

- **DATABASE_USERS**: Esta variable contiene la URI de acceso a la base de datos
  encargada de manejar los usuarios del sistema, esta debe tener el siguiente formato:
  `mysql+pymysql://<user>/<passwd>@<server>/<database>`

- **Variables de configuración de Flask**: Estas son variables de uso interno de
  flask, se recomienda esta configuración para el servidor de producción.
  - **FLASK_ENV**: 'production'
  - **FLASK_TESTING**: 'False'
  - **FLASK_DEBUG**: 'True'
  - **FLASK_APP**: 'src/app.py'

- **SQL_DUMP_PATH**: Esta variable almacena la ubicación de los binarios de MYSQL,
  es importante utilizar el **/** para indicar una carpeta.

- **SQL_USER**: Usuario de MYSQL utilizado por el sistema de copias de seguridad.

- **SQL_PASSWD**: Contraseña del usuario de MYSQL utilizado por el sistema de copias
  de seguridad, si el usuario no esta protegido con contraseña, se debe eliminar
  la variable.

- **FOLDER_BACKUP**: Esta variable almacena la ubicación donde se almacenaran las
  copias de seguridad de la base de datos, es importante utilizar el **/** para
  indicar una carpeta.

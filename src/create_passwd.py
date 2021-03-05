from app import db
from app import User
from getpass import getpass

username = input('Ingrese el nombre del usuario administrador: ')
passwd = getpass('Ingresa la contraseña del usuario administrador: ')
user = User(username, passwd)
user.is_admin = True
db.session.add(user)
db.session.commit()
